"""第 38 节练习：流式输出——节点进度 + 打字机效果（参考答案）
Lesson 38 exercise: streaming - node progress + typewriter output (solution)

一次 stream 同时要两种输出：
  "updates"  每个节点跑完后的状态更新 → 打印「哪个节点完成了」
  "messages" 模型生成的每一小段文字（token）→ 逐字打印（打字机效果）
另外记录「第一个字出现」和「全部完成」的时间，对比视频里说的首字响应速度。
One stream, two kinds of output: node updates (which node finished) and model tokens
(typewriter effect). It also times the first visible character against the whole answer,
the "first response" point made in the video.
本程序调用模型 1 次 / This program calls the model once.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l38_streaming_solution.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY（见 Setup 页）/ the DEEPSEEK_API_KEY variable (see Setup)
TODO 版 / TODO version: l38_streaming_todo.py
"""
import time
from typing import TypedDict

from langchain_deepseek import ChatDeepSeek
from langgraph.graph import END, START, StateGraph

from llm import API_KEY, MODEL


class State(TypedDict):
    question: str
    answer: str


def build_graph(model):
    def prepare(state: State):
        return {"question": state["question"].strip() + "（请用三句话回答）"}

    def answer(state: State):
        reply = model.invoke(state["question"])     # 这里用 invoke，照样能逐字流出来 / plain invoke still streams
        return {"answer": reply.content}

    builder = StateGraph(State)
    builder.add_node("prepare", prepare)
    builder.add_node("answer", answer)
    builder.add_edge(START, "prepare")
    builder.add_edge("prepare", "answer")
    builder.add_edge("answer", END)
    return builder.compile()


if __name__ == "__main__":
    model = ChatDeepSeek(model=MODEL, api_key=API_KEY)
    graph = build_graph(model)
    inputs = {"question": "  为什么天空是蓝色的？  ", "answer": ""}

    start = time.perf_counter()          # 计时开始（单位：秒）/ start the clock (seconds)
    first_token_at = None
    for mode, chunk in graph.stream(inputs, stream_mode=["updates", "messages"]):
        if mode == "messages":
            token, metadata = chunk                   # messages 模式的每一项是 (token, metadata)
            if metadata["langgraph_node"] == "answer" and token.content:
                if first_token_at is None:            # 第一个看得见的字 / the first visible character
                    first_token_at = time.perf_counter() - start
                print(token.content, end="", flush=True)
        elif mode == "updates":
            for node_name in chunk:                   # chunk 是 {节点名: 更新} / {node_name: update}
                print(f"\n[节点完成 / node done] {node_name}")

    total = time.perf_counter() - start
    print(f"第一个字 / first character: {first_token_at:.1f} s，全部完成 / all done: {total:.1f} s")
