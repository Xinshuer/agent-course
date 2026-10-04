"""第 29 节练习：离线版的「笑话 map-reduce」（TODO 版，不调用模型）
Lesson 29 exercise: an offline "joke map-reduce" (TODO version, no model call)

START → generate_topics ─(Send × N)→ generate_joke ─→ best_joke → END
规则：最短的笑话最好。/ Rule: the shortest joke wins.

运行环境 / Environment: .venv
运行 / Run:  cd practice
             & ..\\.venv\\Scripts\\python.exe l29_map_reduce_todo.py
参考答案 / Solution: l29_map_reduce_solution.py
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
    # TODO 1: jokes 会被多个 generate_joke 同时写入：改成 Annotated[list, operator.add]
    #         Several generate_joke runs write jokes at once: make it Annotated[list, operator.add]
    jokes: list
    best_selected_joke: str


class JokeState(TypedDict):
    subject: str


def generate_topics(state: OverallState):
    return {"subjects": SUBJECTS[state["topic"]]}


def continue_to_jokes(state: OverallState):
    # TODO 2: 对 state["subjects"] 里的每个子话题 s，返回一个 Send("generate_joke", {"subject": s})
    #         提示：列表推导式 [... for s in ...]
    #         Return one Send("generate_joke", {"subject": s}) per subject (hint: a list comprehension)
    pass


def generate_joke(state: JokeState):
    return {"jokes": [{"subject": state["subject"], "joke": JOKES[state["subject"]]}]}


def best_joke(state: OverallState):
    # TODO 3: 用 min(state["jokes"], key=lambda j: ...) 选出笑话文字最短的那一项
    #         Pick the item whose joke text is shortest with min(state["jokes"], key=lambda j: ...)
    best = state["jokes"][0]
    return {"best_selected_joke": best["joke"]}


builder = StateGraph(OverallState)
builder.add_node("generate_topics", generate_topics)
builder.add_node("generate_joke", generate_joke)
builder.add_node("best_joke", best_joke)
builder.add_edge(START, "generate_topics")
# TODO 4: 从 "generate_topics" 加条件边，路由函数用 continue_to_jokes，第三个参数写 ["generate_joke"]
#         Add a conditional edge from "generate_topics" using continue_to_jokes, third argument ["generate_joke"]

builder.add_edge("generate_joke", "best_joke")
builder.add_edge("best_joke", END)
graph = builder.compile()


if __name__ == "__main__":
    result = graph.invoke({"topic": "动物"})
    print(result["best_selected_joke"])   # 应该是 / should be: 长颈鹿最怕嗓子疼，一疼就是好几米。
