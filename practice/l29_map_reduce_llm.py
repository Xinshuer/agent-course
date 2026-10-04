"""第 29 节示例（和视频同一个例子）：map-reduce——按主题生成笑话，再选出最好的一个
Lesson 29 demo (the video's example): map-reduce - jokes about a topic, then pick the best one

START → generate_topics ─(Send × N)→ generate_joke ─→ best_joke → END
1. generate_topics：把主题扩展成几个子话题（结构化输出 Subjects）
2. continue_to_jokes：每个子话题一个 Send，generate_joke 并行跑 N 次（map）
3. best_joke：把所有笑话交给模型，选出最好的一个（reduce）
1. generate_topics: expand the topic into a few subjects (structured output Subjects)
2. continue_to_jokes: one Send per subject; generate_joke runs N times in parallel (map)
3. best_joke: give all jokes to the model and pick the best one (reduce)

和视频的差别 / Differences from the video:
- 视频的提示词要 2～5 个子话题；这里改成 2～3 个，少花几次调用。
  The video asks for 2-5 subjects; here 2-3, to save a few calls.
- deepseek-flash 默认开启思考模式，思考模式下 with_structured_output 用到的「强制调用工具」会报 400，
  所以创建模型时关掉思考（和 40、45 节一样）。
  deepseek-flash thinks by default, and thinking mode rejects the forced tool call that
  with_structured_output relies on (HTTP 400), so thinking is switched off (as in lessons 40 and 45).

运行一次 = 1 + 子话题数 + 1 次 API 调用（最多 5 次）。/ One run = 1 + number of subjects + 1 API calls (at most 5).

运行环境 / Environment: .venv
运行 / Run:  cd practice
             & ..\\.venv\\Scripts\\python.exe l29_map_reduce_llm.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY / the DEEPSEEK_API_KEY variable
"""
import operator
from typing import Annotated

from langchain_deepseek import ChatDeepSeek
from langgraph.graph import END, START, StateGraph
from langgraph.types import Send
from pydantic import BaseModel, Field
from typing_extensions import TypedDict

from llm import API_KEY, MODEL

# ---------------------------------------------------------------- 提示词 / prompts
subjects_prompt = "生成一个用逗号分隔的列表，包含 2 到 3 个与下面这个主题相关的例子：{topic}"
joke_prompt = "写一个关于{subject}的笑话，一两句话就好。"
best_joke_prompt = """下面是一些关于{topic}的笑话。选出最好的一个，返回它的 ID（第一个是 0）。

{jokes}"""


# ---------------------------------------------------------------- 结构化输出的格式 / output formats (pydantic, lesson 12)
class Subjects(BaseModel):
    # description 会一起发给模型；不写的话，模型偶尔只回一个主题本身（实测出现过 ['动物']）
    # The description is sent to the model too; without it the model sometimes returns just the topic itself
    subjects: list[str] = Field(description="2 到 3 个与主题相关的具体子话题，每项一个，不要只写主题本身")


class Joke(BaseModel):
    joke: str


class BestJoke(BaseModel):
    id: int = Field(description="最好的那个笑话的索引，从 0 开始", ge=0)


# 关掉思考模式，with_structured_output 才能用 / thinking off so with_structured_output works
model = ChatDeepSeek(model=MODEL, api_key=API_KEY, extra_body={"thinking": {"type": "disabled"}})


# ---------------------------------------------------------------- 状态 / state
class OverallState(TypedDict):
    topic: str                                   # 用户给的主题 / the user's topic
    subjects: list                               # 扩展出来的子话题 / the expanded subjects
    jokes: Annotated[list, operator.add]         # 多个 generate_joke 并行写入，用 reducer 拼接 / joined by the reducer
    best_selected_joke: str


class JokeState(TypedDict):                      # 每个 generate_joke 只拿到一个子话题 / one subject per run
    subject: str


# ---------------------------------------------------------------- 节点 / nodes
def generate_topics(state: OverallState):
    prompt = subjects_prompt.format(topic=state["topic"])
    response = model.with_structured_output(Subjects).invoke(prompt)
    return {"subjects": response.subjects}


def generate_joke(state: JokeState):
    prompt = joke_prompt.format(subject=state["subject"])
    response = model.with_structured_output(Joke).invoke(prompt)
    return {"jokes": [response.joke]}


# map：每个子话题发一个 Send 到 generate_joke / map: one Send per subject to generate_joke
def continue_to_jokes(state: OverallState):
    return [Send("generate_joke", {"subject": s}) for s in state["subjects"]]


# reduce：所有笑话都生成完才执行一次 / reduce: runs once, after every joke is written
def best_joke(state: OverallState):
    jokes = "\n\n".join(state["jokes"])
    prompt = best_joke_prompt.format(topic=state["topic"], jokes=jokes)
    response = model.with_structured_output(BestJoke).invoke(prompt)
    return {"best_selected_joke": state["jokes"][response.id]}


# ---------------------------------------------------------------- 建图 / build the graph
graph = StateGraph(OverallState)
graph.add_node("generate_topics", generate_topics)
graph.add_node("generate_joke", generate_joke)
graph.add_node("best_joke", best_joke)
graph.add_edge(START, "generate_topics")
graph.add_conditional_edges("generate_topics", continue_to_jokes, ["generate_joke"])
graph.add_edge("generate_joke", "best_joke")
graph.add_edge("best_joke", END)
app = graph.compile()


if __name__ == "__main__":
    # stream：每个节点跑完就打印一次它返回的更新 / stream prints each node's update as soon as it finishes
    for step in app.stream({"topic": "动物"}):
        print(step)
