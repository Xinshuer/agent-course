"""第 28 节参考答案：条件分支与循环（和视频同样的例子）
Lesson 28 solution: conditional edges & loops (the same examples as the video)

第 1 部分：START → a ⇄ b，a 后面接条件边：列表长度 < 7 去 b，否则结束。
第 2 部分：同一个图，recursion_limit=4 → GraphRecursionError。
第 3 部分：带分支的循环 START → a → b → (c, d) → a …，c 和 d 都完成后才回到 a。
Part 1: START -> a <-> b; a conditional edge after a: length < 7 goes to b, otherwise the graph ends.
Part 2: the same graph with recursion_limit=4 -> GraphRecursionError.
Part 3: a loop with a branch START -> a -> b -> (c, d) -> a ...; a runs again once both c and d finish.

运行环境 / Environment: .venv
运行 / Run:  cd practice
             & ..\\.venv\\Scripts\\python.exe l28_loops_solution.py
不需要 API key。/ No API key needed.
"""
import operator
from typing import Annotated, Literal

from langgraph.errors import GraphRecursionError
from langgraph.graph import END, START, StateGraph
from typing_extensions import TypedDict


class State(TypedDict):
    aggregate: Annotated[list, operator.add]


def a(state: State):
    print(f'Node A sees {state["aggregate"]}')
    return {"aggregate": ["A"]}


def b(state: State):
    print(f'Node B sees {state["aggregate"]}')
    return {"aggregate": ["B"]}


def c(state: State):
    print(f'Node C sees {state["aggregate"]}')
    return {"aggregate": ["C"]}


def d(state: State):
    print(f'Node D sees {state["aggregate"]}')
    return {"aggregate": ["D"]}


# 路由函数：不是节点，挂在条件边上；返回下一个节点的名字或 END
# Routing function: not a node; it sits on the conditional edge and returns the next node's name or END
def route(state: State) -> Literal["b", END]:
    if len(state["aggregate"]) < 7:
        return "b"
    else:
        return END


def build_loop():
    builder = StateGraph(State)
    builder.add_node(a)
    builder.add_node(b)
    builder.add_edge(START, "a")
    builder.add_conditional_edges("a", route)          # a 之后去哪，由 route 决定 / route decides what follows a
    builder.add_edge("b", "a")                         # 指回前面 = 循环 / pointing back = a loop
    return builder.compile()


def build_loop_with_branch():
    builder = StateGraph(State)
    builder.add_node(a)
    builder.add_node(b)
    builder.add_node(c)
    builder.add_node(d)
    builder.add_edge(START, "a")
    builder.add_conditional_edges("a", route)
    builder.add_edge("b", "c")                         # b 之后 c 和 d 都会执行（同一步）/ both c and d run after b (same step)
    builder.add_edge("b", "d")
    builder.add_edge(["c", "d"], "a")                  # c 和 d 都完成后才执行 a / a runs once both c and d are done
    return builder.compile()


if __name__ == "__main__":
    print("=== 1. 条件边 + 循环 / conditional edge + loop ===")
    loop = build_loop()
    result = loop.invoke({"aggregate": []})
    print(result)                                      # 7 个字母 / 7 letters: A B A B A B A
    print(loop.get_graph().draw_mermaid())

    print("=== 2. recursion_limit=4 ===")
    try:
        loop.invoke({"aggregate": []}, {"recursion_limit": 4})
    except GraphRecursionError as e:
        print("GraphRecursionError:", str(e).splitlines()[0])

    print("\n=== 3. 带分支的循环 / a loop with a branch ===")
    loop2 = build_loop_with_branch()
    result = loop2.invoke({"aggregate": []})
    print(result, "长度 / length:", len(result["aggregate"]))
    print(loop2.get_graph().draw_mermaid())
