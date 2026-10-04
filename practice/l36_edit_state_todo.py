"""第 36 节练习：用断点停下 -> 查看 -> 修改图的状态 -> 继续（TODO 版，不需要 API key）
Lesson 36 exercise: stop at a breakpoint -> inspect -> edit the graph state -> continue (TODO version, no API key needed)

要补的地方都标了 TODO。参考答案 / Solution: l36_edit_state_solution.py
Every gap is marked TODO.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l36_edit_state_todo.py
"""
from typing import TypedDict

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph


class State(TypedDict):
    input: str


def step_1(state: State):
    print("---Step 1---  input =", state["input"])


def step_2(state: State):
    print("---Step 2---  input =", state["input"])


def step_3(state: State):
    print("---Step 3---  input =", state["input"])


builder = StateGraph(State)
builder.add_node("step_1", step_1)
builder.add_node("step_2", step_2)
builder.add_node("step_3", step_3)
builder.add_edge(START, "step_1")
builder.add_edge("step_1", "step_2")
builder.add_edge("step_2", "step_3")
builder.add_edge("step_3", END)
# TODO 1: 编译时加上 checkpointer=InMemorySaver() 和 interrupt_before=["step_2"]
#         compile with checkpointer=InMemorySaver() and interrupt_before=["step_2"]
graph = builder.compile()


def main():
    thread = {"configurable": {"thread_id": "1"}}
    for event in graph.stream({"input": "你好"}, thread, stream_mode="values"):
        print(event)

    # TODO 2: 用 graph.get_state(thread) 取出快照，打印 .values 和 .next
    #         get the snapshot with graph.get_state(thread); print .values and .next

    # TODO 3: 用 graph.update_state(thread, {...}) 把 input 改成一句新的话
    #         change input to a new sentence with graph.update_state(thread, {...})

    # TODO 4: 用 graph.stream(None, thread, stream_mode="values") 继续，并打印每个事件
    #         continue with graph.stream(None, thread, stream_mode="values") and print each event


if __name__ == "__main__":
    main()
