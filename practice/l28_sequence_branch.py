"""第 28 节示例：串行控制 & 分支控制（和视频同样的例子）
Lesson 28 demo: sequences & branches (the same examples as the video)

第 1 部分：串行 START → step_1 → step_2 → step_3 → END，step_2 读取 step_1 写入的值。
第 2 部分：分支 START → a → (b, c) → d → END，aggregate 用 Annotated[list, operator.add] 合并。
第 3 部分：把 aggregate 改成普通 list，同一步里 b、c 都写它 → InvalidUpdateError。
Part 1: a sequence START -> step_1 -> step_2 -> step_3 -> END; step_2 reads what step_1 wrote.
Part 2: a branch START -> a -> (b, c) -> d -> END; aggregate is merged with Annotated[list, operator.add].
Part 3: aggregate as a plain list; b and c both write it in the same step -> InvalidUpdateError.

运行环境 / Environment: .venv
运行 / Run:  cd practice
             & ..\\.venv\\Scripts\\python.exe l28_sequence_branch.py
不需要 API key。/ No API key needed.
"""
import operator
from typing import Annotated

from langgraph.errors import InvalidUpdateError
from langgraph.graph import END, START, StateGraph
from typing_extensions import TypedDict


# ---------------------------------------------------------------- 1. 串行 / sequence
class State(TypedDict):
    value_1: str
    value_2: int


def step_1(state: State):
    return {"value_1": "a"}                            # 写死返回 "a" / always "a"


def step_2(state: State):
    current_value_1 = state["value_1"]                 # 读上一个节点写的值 / read what step_1 wrote
    return {"value_1": f"{current_value_1} b"}


def step_3(state: State):
    return {"value_2": 10}


def build_sequence():
    builder = StateGraph(State)
    builder.add_node(step_1)
    builder.add_node(step_2)
    builder.add_node(step_3)
    builder.add_edge(START, "step_1")
    builder.add_edge("step_1", "step_2")
    builder.add_edge("step_2", "step_3")
    builder.add_edge("step_3", END)                    # 视频后来补上的结束边 / the END edge added later in the video
    return builder.compile()


# ---------------------------------------------------------------- 2/3. 分支 / branch
class BranchState(TypedDict):
    aggregate: Annotated[list, operator.add]           # 新返回的列表拼接到旧列表后面 / returned lists are joined on


class PlainState(TypedDict):
    aggregate: list                                    # 没有 reducer / no reducer


def a(state):
    print(f'Adding "A" to {state["aggregate"]}')
    return {"aggregate": ["A"]}


def b(state):
    print(f'Adding "B" to {state["aggregate"]}')
    return {"aggregate": ["B"]}


def c(state):
    print(f'Adding "C" to {state["aggregate"]}')
    return {"aggregate": ["C"]}


def d(state):
    print(f'Adding "D" to {state["aggregate"]}')
    return {"aggregate": ["D"]}


def build_branch(state_class):
    builder = StateGraph(state_class)
    builder.add_node(a)
    builder.add_node(b)
    builder.add_node(c)
    builder.add_node(d)
    builder.add_edge(START, "a")
    builder.add_edge("a", "b")                         # a 连出两条边 = 分支 / two edges leave a = a branch
    builder.add_edge("a", "c")
    builder.add_edge("b", "d")
    builder.add_edge("c", "d")
    builder.add_edge("d", END)
    return builder.compile()


if __name__ == "__main__":
    print("=== 1. 串行 / sequence ===")
    seq = build_sequence()
    print(seq.invoke({"value_1": "c"}))                # {'value_1': 'a b', 'value_2': 10}
    print(seq.get_graph().draw_mermaid())

    print("=== 2. 分支 / branch ===")
    graph = build_branch(BranchState)
    # 第二个参数是运行配置；这里的 thread_id 只是演示写法，没有 checkpointer 时不起作用（30 节才用到）
    # The second argument is the run config; thread_id here only shows the syntax and does nothing
    # without a checkpointer (lesson 30 uses it)
    print(graph.invoke({"aggregate": []}, {"configurable": {"thread_id": "foo"}}))
    print(graph.get_graph().draw_mermaid())

    print("=== 3. 分支，但 aggregate 没有 reducer / branch without a reducer ===")
    try:
        build_branch(PlainState).invoke({"aggregate": []})
    except InvalidUpdateError as e:
        print("InvalidUpdateError:", str(e).splitlines()[0])
