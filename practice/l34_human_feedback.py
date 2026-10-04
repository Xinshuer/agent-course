"""第 34 节 例子一：在两个节点之间插一个「人类反馈」节点（不需要 API key）
Lesson 34, example 1: a human-feedback node between two steps (no API key needed)

和视频一样的三个节点 / The same three nodes as the video:
    step_1 -> human_feedback（这里调用 interrupt / calls interrupt here） -> step_3

运行时注意看 / Things to watch in the output:
  1. 第一次运行停在 human_feedback，事件里出现 "__interrupt__"
     The first run stops in human_feedback; an "__interrupt__" event appears
  2. 恢复后 "---human_feedback---" 又打印了一次：恢复时这个节点从头再执行一遍
     After resuming, "---human_feedback---" prints again: the node re-runs from the top
  3. 最后的补充演示：没有 checkpointer 时，恢复会报错
     The extra demo at the end: without a checkpointer, resuming fails

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l34_human_feedback.py
想自己在终端里输入反馈：把 ASK_IN_TERMINAL 改成 True。
To type the feedback yourself, set ASK_IN_TERMINAL = True.
"""
from typing import TypedDict

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command, interrupt

ASK_IN_TERMINAL = False           # True = 用 input() 问你 / ask you with input()


class State(TypedDict):
    input: str
    user_feedback: str


def step_1(state: State):
    print("---Step 1---")             # 什么都不返回 = 不改状态 / returns nothing = state unchanged


def human_feedback(state: State):
    print("---human_feedback---")
    feedback = interrupt("请提供反馈 / Please provide feedback: ")   # 第一次：在这里暂停 / 1st time: pause here
    print("   拿到反馈 / got feedback:", feedback)                     # 恢复后：interrupt 返回反馈 / after resume
    return {"user_feedback": feedback}


def step_3(state: State):
    print("---Step 3---  user_feedback =", state["user_feedback"])


def build(checkpointer):
    builder = StateGraph(State)
    builder.add_node("step_1", step_1)
    builder.add_node("human_feedback", human_feedback)
    builder.add_node("step_3", step_3)
    builder.add_edge(START, "step_1")
    builder.add_edge("step_1", "human_feedback")
    builder.add_edge("human_feedback", "step_3")
    builder.add_edge("step_3", END)
    return builder.compile(checkpointer=checkpointer)


def main():
    graph = build(InMemorySaver())              # 视频里写的 MemorySaver 是同一个类 / the video's MemorySaver is the same class
    print(graph.get_graph().draw_mermaid())     # 图的结构（文字版，不用联网）/ graph structure as text, offline

    thread = {"configurable": {"thread_id": "1"}}

    print("===== 第一次运行 / first run =====")
    for event in graph.stream({"input": "你好"}, thread, stream_mode="updates"):
        print(event)

    snapshot = graph.get_state(thread)
    print("停在 / paused at:", snapshot.next)               # ('human_feedback',)
    question = snapshot.interrupts[0].value                  # interrupt(...) 里传出来的问题 / the question

    if ASK_IN_TERMINAL:
        answer = input(question)
    else:
        answer = "可以，继续到第三步 / OK, go on to step 3"
        print(question + answer)

    print("\n===== 恢复 / resume =====")
    for event in graph.stream(Command(resume=answer), thread, stream_mode="updates"):
        print(event)

    print("\n最终状态 / final state:", graph.get_state(thread).values)

    # ---------------------------------------------------------------- 补充 / extra
    print("\n===== 补充：没有 checkpointer / extra: no checkpointer =====")
    graph2 = build(None)
    config2 = {"configurable": {"thread_id": "1"}}
    result = graph2.invoke({"input": "你好"}, config2)
    print("能停下 / it can stop:", "__interrupt__" in result)
    try:
        graph2.invoke(Command(resume="继续"), config2)
    except Exception as e:                       # 这里只是为了演示报错 / only to show the error
        print("但恢复会报错 / but resuming fails:", type(e).__name__, "-", e)


if __name__ == "__main__":
    main()
