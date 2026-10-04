"""第 36 节：用断点停下 -> 查看 -> 修改图的状态 -> 继续（参考答案，不需要 API key）
Lesson 36: stop at a breakpoint -> inspect -> edit the graph state -> continue (solution, no API key needed)

第 1 部分（视频的例子，另外多加了 get_state 查看）/ Part 1 (the video's example, plus a get_state look):
    step_1 -> step_2 -> step_3，compile(interrupt_before=["step_2"]) 让图在 step_2 之前停下，
    get_state 看状态，update_state 改掉 input，stream(None, ...) 继续。
    compile(interrupt_before=["step_2"]) stops before step_2; read the state with get_state,
    change input with update_state, continue with stream(None, ...).
第 2 部分（补充，视频里没有）/ Part 2 (extra, not in the video):
    update_state(..., as_node="ask_city")：替一个会提问的节点给出结果，图就跳过提问。
    answer on behalf of an asking node so the graph skips the question.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l36_edit_state_solution.py
想自己输入新的 input：把 ASK_IN_TERMINAL 改成 True。 To type the new input yourself, set ASK_IN_TERMINAL = True.
"""
from typing import TypedDict

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import interrupt

ASK_IN_TERMINAL = False


# ---------------------------------------------------------------- 第 1 部分 / Part 1
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
# 断点：每次运行到 step_2 之前都停下 / breakpoint: stop before step_2 every time
graph = builder.compile(checkpointer=InMemorySaver(), interrupt_before=["step_2"])


def part1():
    print("===== 第 1 部分 / Part 1 =====")
    thread = {"configurable": {"thread_id": "1"}}
    for event in graph.stream({"input": "你好"}, thread, stream_mode="values"):
        print(event)

    snapshot = graph.get_state(thread)                    # 看 / look
    print("当前状态 / current state:", snapshot.values)
    print("下一步 / next:", snapshot.next)                  # ('step_2',)

    if ASK_IN_TERMINAL:
        new_input = input("新的 input / new input: ")
    else:
        new_input = "你好，这是人工改过的输入"
    graph.update_state(thread, {"input": new_input})      # 改 / change
    print("修改后 / after update:", graph.get_state(thread).values)

    for event in graph.stream(None, thread, stream_mode="values"):   # 继续：传 None / continue with None
        print(event)
    print("跑完了吗 / finished?", graph.get_state(thread).next == ())


# ---------------------------------------------------------------- 第 2 部分 / Part 2（补充 / extra）
class CityState(TypedDict):
    city: str
    report: str


def ask_city(state: CityState):
    return {"city": interrupt("哪个城市？/ Which city?")}


def make_report(state: CityState):
    return {"report": f"{state['city']}：晴，22°C"}


b2 = StateGraph(CityState)
b2.add_node("ask_city", ask_city)
b2.add_node("make_report", make_report)
b2.add_edge(START, "ask_city")
b2.add_edge("ask_city", "make_report")
b2.add_edge("make_report", END)
graph2 = b2.compile(checkpointer=InMemorySaver())


def part2():
    print("\n===== 第 2 部分（补充）/ Part 2 (extra) =====")
    config = {"configurable": {"thread_id": "city-1"}}
    result = graph2.invoke({"city": "", "report": ""}, config)
    print("图在问 / the graph asks:", result["__interrupt__"][0].value)

    # 不回答问题，而是「就当 ask_city 已经执行完，结果是广州」
    # Instead of answering, pretend ask_city has finished and produced "广州"
    graph2.update_state(config, {"city": "广州"}, as_node="ask_city")
    print("下一步 / next:", graph2.get_state(config).next)      # ('make_report',)
    print("结果 / result:", graph2.invoke(None, config))


if __name__ == "__main__":
    part1()
    part2()
