"""第 38 节演示：同一个图，用不同的 stream_mode 看输出（不调用模型，免费运行）
Lesson 38 demo: one graph, different stream_mode values (no model calls, runs for free)

视频里老师提到的三种模式：values（完整状态）、updates（只看更新）、debug（尽量多的调试信息），
再加上不写 stream_mode 时的默认行为，以及异步版本 astream。
The three modes named in the video - values (full state), updates (changes only) and
debug (as much detail as possible) - plus the default when stream_mode is omitted, and the
async version, astream.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l38_stream_modes.py
不需要 API key / No API key needed.
"""
import asyncio
from typing import TypedDict

from langgraph.graph import END, START, StateGraph


class State(TypedDict):
    topic: str
    outline: str
    article: str


def make_outline(state: State):
    return {"outline": f"《{state['topic']}》提纲：起因 / 经过 / 结果"}


def write_article(state: State):
    return {"article": f"{state['topic']}的故事写好了。"}


def build_graph():
    builder = StateGraph(State)
    builder.add_node("make_outline", make_outline)
    builder.add_node("write_article", write_article)
    builder.add_edge(START, "make_outline")
    builder.add_edge("make_outline", "write_article")
    builder.add_edge("write_article", END)
    return builder.compile()


async def stream_async(graph, inputs):
    # 异步版本：async def 里用 async for 遍历 astream（async 见 09 节）
    # Async version: loop over astream with async for inside an async def (async: lesson 09)
    async for chunk in graph.astream(inputs, stream_mode="updates"):
        print("  ", chunk)


if __name__ == "__main__":
    graph = build_graph()
    inputs = {"topic": "小猫学游泳"}

    for mode in ["values", "updates"]:
        print(f"== stream_mode={mode!r}")
        for chunk in graph.stream(inputs, stream_mode=mode):
            print("  ", chunk)

    print("== stream_mode='debug'（只打印每条的类型和节点名 / only the type and node name of each item）")
    for chunk in graph.stream(inputs, stream_mode="debug"):
        print("  ", chunk["step"], chunk["type"], chunk["payload"]["name"])

    print("== 不写 stream_mode（StateGraph 默认是 updates）/ no stream_mode (defaults to updates)")
    for chunk in graph.stream(inputs):
        print("  ", chunk)

    print("== astream（异步 / async）")
    asyncio.run(stream_async(graph, inputs))
