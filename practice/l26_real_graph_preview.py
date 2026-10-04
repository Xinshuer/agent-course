"""第 26 节预览：把 step_1 → step_2 → step_3 交给真正的 LangGraph 运行
Lesson 26 preview: run step_1 -> step_2 -> step_3 in real LangGraph

视频里的流程图是 START → step_1 → step_2 → step_3 → END：step_1 专门查数据，step_2 专门生成文本。
讲义先用纯 Python 模拟了这张图；这个文件用真正的 LangGraph 跑同一张图，结果应该完全一样。
逐行讲解在第 27 节，这里只需要对照：节点 = add_node，边 = add_edge，图 = StateGraph + compile。
The video's flowchart is START -> step_1 -> step_2 -> step_3 -> END: step_1 only looks up data,
step_2 only generates text. The notes simulated it in plain Python; this file runs the same graph
in real LangGraph, and the result should be identical. Lesson 27 explains it line by line; here just
match the ideas: node = add_node, edge = add_edge, graph = StateGraph + compile.

不调用模型，不需要 API key。 / No model calls, no API key needed.

运行环境 / Environment: .venv（需要 langgraph / needs langgraph）
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l26_real_graph_preview.py
"""
from typing import TypedDict

from langgraph.graph import END, START, StateGraph


class State(TypedDict):
    """节点之间共用的数据（第 27 节细讲）。 Data shared by all nodes (lesson 27)."""
    city: str
    temp: int
    text: str


def step_1(state: State) -> dict:
    """只负责查数据。 Only looks up data."""
    temps = {"北京": 26, "上海": 30}
    return {"temp": temps[state["city"]]}


def step_2(state: State) -> dict:
    """只负责生成文本。 Only generates text."""
    return {"text": f"{state['city']}现在 {state['temp']}°C"}


def step_3(state: State) -> dict:
    """只负责收尾：按气温加一句提醒。 Only finishes off: adds a tip based on the temperature."""
    if state["temp"] >= 28:
        return {"text": state["text"] + "，注意防暑。"}
    return {"text": state["text"] + "，适合出门。"}


def build_graph():
    builder = StateGraph(State)            # 图 / the graph
    builder.add_node("step_1", step_1)     # 节点：名字 + 函数本身 / node: name + the function itself
    builder.add_node("step_2", step_2)
    builder.add_node("step_3", step_3)
    builder.add_edge(START, "step_1")      # 边 / edges
    builder.add_edge("step_1", "step_2")
    builder.add_edge("step_2", "step_3")
    builder.add_edge("step_3", END)
    return builder.compile()               # 编译成可运行的图 / compile into a runnable graph


if __name__ == "__main__":
    graph = build_graph()
    print("类型 / type:", type(graph).__name__)
    print(graph.invoke({"city": "上海"}))   # {'city': '上海', 'temp': 30, 'text': '上海现在 30°C，注意防暑。'}
    print(graph.invoke({"city": "北京"}))   # {'city': '北京', 'temp': 26, 'text': '北京现在 26°C，适合出门。'}
    print("START =", repr(START), "| END =", repr(END))

    print("\nMermaid 文本（粘贴到 https://mermaid.live 可以看到图）/ paste into https://mermaid.live:\n")
    print(graph.get_graph().draw_mermaid())
