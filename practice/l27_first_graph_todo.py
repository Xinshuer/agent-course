"""第 27 节练习：第一个 LangGraph（TODO 版，不调用大模型）
Lesson 27 exercise: your first LangGraph (TODO version, no model call)

目标：照着视频，搭出 START → node 的图，调用后用 pretty_print 打印两条消息。
Goal: like the video, build the graph START -> node, run it and pretty_print the two messages.

运行环境 / Environment: .venv
运行 / Run:  cd practice
             & ..\\.venv\\Scripts\\python.exe l27_first_graph_todo.py
参考答案 / Solution: l27_first_graph_solution.py
不需要 API key。/ No API key needed.
"""
from langchain_core.messages import AIMessage, AnyMessage, HumanMessage
from langgraph.graph import StateGraph
from typing_extensions import TypedDict


# TODO 1: 定义 State（继承 TypedDict），两个字段：
#         messages: list[AnyMessage]    extra_field: int
#         Define State (a TypedDict) with two fields: messages: list[AnyMessage], extra_field: int
class State(TypedDict):
    pass


def node(state: State):
    # TODO 2: 取出 state["messages"]，新建 AIMessage("你好，我是节点1")，
    #         返回 {"messages": 旧消息 + [新消息], "extra_field": 1}
    #         Read state["messages"], create AIMessage("Hello, I'm node 1"),
    #         return {"messages": old messages + [the new one], "extra_field": 1}
    pass


builder = StateGraph(State)
# TODO 3: 用 add_node 加入节点 node，再用 set_entry_point 把它设成入口
#         Add the node with add_node, then make it the entry point with set_entry_point

# TODO 4: 编译 / Compile
graph = None


if __name__ == "__main__":
    print(graph.get_graph().draw_mermaid())

    result = graph.invoke({"messages": [HumanMessage("你好，我是Tommy")]})

    # TODO 5: 用 for 循环遍历 result["messages"]，对每条消息调用 .pretty_print()
    #         Loop over result["messages"] and call .pretty_print() on each message

    print("extra_field =", result["extra_field"])   # 应该是 / should be 1
