"""第 28 节练习：条件分支与循环（TODO 版）
Lesson 28 exercise: conditional edges & loops (TODO version)

START → a ⇄ b：a 后面接条件边，列表长度 < 7 去 b，否则结束。
START -> a <-> b: a conditional edge after a; length < 7 goes to b, otherwise the graph ends.

运行环境 / Environment: .venv
运行 / Run:  cd practice
             & ..\\.venv\\Scripts\\python.exe l28_loops_todo.py
参考答案 / Solution: l28_loops_solution.py
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


# TODO 1: 补全路由函数，返回值标注 Literal["b", END]：
#         len(state["aggregate"]) < 7 时返回 "b"，否则返回 END
#         Complete the routing function, annotated Literal["b", END]:
#         return "b" while len(state["aggregate"]) < 7, otherwise END
def route(state: State):
    pass


builder = StateGraph(State)
builder.add_node(a)
builder.add_node(b)
builder.add_edge(START, "a")
# TODO 2: 从 "a" 加一条条件边，用 route 决定下一步
#         Add a conditional edge from "a" that uses route

# TODO 3: 加一条从 "b" 指回 "a" 的普通边，形成循环
#         Add a plain edge from "b" back to "a" to make the loop

graph = builder.compile()


if __name__ == "__main__":
    print(graph.invoke({"aggregate": []}))   # 应该是 / should be ['A', 'B', 'A', 'B', 'A', 'B', 'A']

    # TODO 4: 第二个参数传入 {"recursion_limit": 4}，用 try/except 接住 GraphRecursionError 并打印
    #         Pass {"recursion_limit": 4} as the second argument; catch GraphRecursionError and print it
