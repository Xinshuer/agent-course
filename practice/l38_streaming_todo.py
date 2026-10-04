"""第 38 节练习：流式输出——节点进度 + 打字机效果（TODO 版）
Lesson 38 exercise: streaming - node progress + typewriter output (TODO version)

图已经搭好了（prepare → answer，answer 节点调用模型）。你要补全 __main__ 里的循环：
一次 graph.stream 同时要 "updates" 和 "messages" 两种输出，分别打印。
The graph is ready (prepare → answer; the answer node calls the model). Complete the loop in
__main__: one graph.stream call asking for both "updates" and "messages", printing each kind.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l38_streaming_todo.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY（见 Setup 页）/ the DEEPSEEK_API_KEY variable (see Setup)
参考答案 / Solution: l38_streaming_solution.py
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
        reply = model.invoke(state["question"])
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

    # TODO: for mode, chunk in graph.stream(inputs, stream_mode=[...两种模式 / two modes...]):
    #   - mode == "messages"：chunk 是 (token, metadata)，先拆包；
    #         如果 metadata["langgraph_node"] == "answer" 并且 token.content 不是空的：
    #             第一次遇到时记下 first_token_at = time.perf_counter() - start
    #             print(token.content, end="", flush=True)
    #   - mode == "updates" ：chunk 是 {节点名: 更新}，用 for 打印每个节点名
    #   mode == "messages": chunk is (token, metadata) - unpack it; if it comes from the "answer"
    #       node and token.content is not empty, record first_token_at the first time and print
    #       the token without a newline (flush=True)
    #   mode == "updates": chunk is {node_name: update} - print each node name

    total = time.perf_counter() - start
    print(f"\n第一个字 / first character: {first_token_at} s，全部完成 / all done: {total:.1f} s")
