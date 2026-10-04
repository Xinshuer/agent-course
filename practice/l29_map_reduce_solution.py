"""第 29 节练习参考答案：离线版的「笑话 map-reduce」（不调用模型，不花钱）
Lesson 29 solution: an offline "joke map-reduce" (no model call, costs nothing)

和视频的图结构完全一样，只是把三处模型调用换成了查字典 / 简单规则：
- generate_topics：从 SUBJECTS 字典取子话题
- generate_joke：从 JOKES 字典取笑话（被 Send 启动 N 次）
- best_joke：规则「最短的笑话最好」，用 min(..., key=lambda ...) 选出来
Same graph as the video; the three model calls are replaced by dict lookups / a simple rule:
- generate_topics: subjects come from the SUBJECTS dict
- generate_joke: jokes come from the JOKES dict (started N times by Send)
- best_joke: rule "the shortest joke wins", picked with min(..., key=lambda ...)

START → generate_topics ─(Send × N)→ generate_joke ─→ best_joke → END

运行环境 / Environment: .venv
运行 / Run:  cd practice
             & ..\\.venv\\Scripts\\python.exe l29_map_reduce_solution.py
不需要 API key。/ No API key needed.
"""
import operator
from typing import Annotated

from langgraph.graph import END, START, StateGraph
from langgraph.types import Send
from typing_extensions import TypedDict

SUBJECTS = {
    "动物": ["企鹅", "蜗牛", "长颈鹿"],
    "水果": ["西瓜", "香蕉"],
}
JOKES = {
    "企鹅": "企鹅为什么不怕冷？因为它一年到头都穿着燕尾服。",
    "蜗牛": "蜗牛去面试，被问到优点，它说：我从来不着急。",
    "长颈鹿": "长颈鹿最怕嗓子疼，一疼就是好几米。",
    "西瓜": "西瓜从不吵架，因为它心里甜。",
    "香蕉": "香蕉为什么总被叫去开会？因为它最会弯着说话。",
}


class OverallState(TypedDict):
    topic: str
    subjects: list
    jokes: Annotated[list, operator.add]       # 多个 generate_joke 在同一步写入，要用 reducer / needs a reducer
    best_selected_joke: str


class JokeState(TypedDict):                    # 被 Send 启动的节点只收到这一份数据 / a Send-started run gets only this
    subject: str


def generate_topics(state: OverallState):
    return {"subjects": SUBJECTS[state["topic"]]}


# map：每个子话题一个 Send / map: one Send per subject
def continue_to_jokes(state: OverallState):
    return [Send("generate_joke", {"subject": s}) for s in state["subjects"]]


def generate_joke(state: JokeState):
    print("generate_joke 收到 / got:", state)
    return {"jokes": [{"subject": state["subject"], "joke": JOKES[state["subject"]]}]}   # 外面套一层列表 / wrapped in a list


# reduce：所有笑话都到齐后执行一次 / reduce: runs once every joke has arrived
def best_joke(state: OverallState):
    ranking = sorted(state["jokes"], key=lambda j: len(j["joke"]))       # 按笑话长度从短到长 / shortest first
    for j in ranking:
        print(f'  {len(j["joke"]):>2} 字 / chars  {j["subject"]}')
    best = min(state["jokes"], key=lambda j: len(j["joke"]))             # 最短的那个 / the shortest one
    return {"best_selected_joke": best["joke"]}


builder = StateGraph(OverallState)
builder.add_node("generate_topics", generate_topics)
builder.add_node("generate_joke", generate_joke)
builder.add_node("best_joke", best_joke)
builder.add_edge(START, "generate_topics")
builder.add_conditional_edges("generate_topics", continue_to_jokes, ["generate_joke"])   # 第三个参数：可能的去向 / possible targets
builder.add_edge("generate_joke", "best_joke")
builder.add_edge("best_joke", END)
graph = builder.compile()


if __name__ == "__main__":
    for step in graph.stream({"topic": "动物"}):
        print(step)

    result = graph.invoke({"topic": "水果"})     # 只有 2 个子话题，图不用改 / only 2 subjects, same graph
    print("水果 / fruit:", result["best_selected_joke"])

    print(graph.get_graph().draw_mermaid())
