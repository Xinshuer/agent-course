"""第 27 节参考答案：第一个 LangGraph（和视频同一个例子，不调用大模型）
Lesson 27 solution: your first LangGraph (the same example as the video, no model call)

State（消息列表 + 一个整数字段）→ 一个节点 node（模拟 AI 回复）→ 设入口 → 编译 → 画图 → 调用 → pretty_print
State (a message list + one int field) -> one node (a fake AI reply) -> entry point -> compile
-> draw -> invoke -> pretty_print

运行环境 / Environment: .venv
运行 / Run:  cd practice
             & ..\\.venv\\Scripts\\python.exe l27_first_graph_solution.py
不需要 API key，不花钱。/ No API key needed, costs nothing.
"""
from langchain_core.messages import AIMessage, AnyMessage, HumanMessage
from langgraph.graph import StateGraph
from typing_extensions import TypedDict   # 和视频一样；写 from typing import TypedDict 也可以 / same as the video; typing works too


# 1. 状态：节点之间传递的数据格式 / The state: the shape of the data passed between nodes
class State(TypedDict):
    messages: list[AnyMessage]    # 消息列表，里面可以是任何一种消息 / a list of any kind of message
    extra_field: int              # 一个额外的整数字段 / one extra int field


# 2. 节点：就是一个函数，收到 state，返回要更新的字段 / A node is a function: gets the state, returns updates
def node(state: State):
    messages = state["messages"]
    new_message = AIMessage("你好，我是节点1")          # 模拟一条 AI 回复 / a fake AI reply
    # messages 没有 reducer，所以要返回「旧消息 + 新消息」的完整列表
    # messages has no reducer, so return the full list: old messages + the new one
    return {"messages": messages + [new_message], "extra_field": 1}


# 3. 建图：放进节点，设入口，编译 / Build: add the node, set the entry point, compile
builder = StateGraph(State)
builder.add_node(node)                 # 只传函数时，节点名就是函数名 "node" / the node is named after the function
builder.set_entry_point("node")        # 等于 builder.add_edge(START, "node") / same as add_edge(START, "node")
graph = builder.compile()


if __name__ == "__main__":
    # 4. 画图：把输出粘贴到 https://mermaid.live 就能看到流程图
    #    Draw: paste the output into https://mermaid.live to see the diagram
    print(graph.get_graph().draw_mermaid())

    # 想直接得到图片：draw_mermaid_png 会联网（mermaid.ink）生成 PNG，没网时会失败
    # For a picture: draw_mermaid_png goes online (mermaid.ink) to make a PNG and fails offline
    try:
        graph.get_graph().draw_mermaid_png(output_file_path="l27_graph.png")
        print("已保存图片 / saved: l27_graph.png\n")
    except Exception as e:
        print("生成图片失败（多半是网络问题）/ PNG failed (probably the network):", type(e).__name__, "\n")

    # 5. 调用：传入初始状态，拿到最终状态 / Run: pass the initial state, get the final state
    result = graph.invoke({"messages": [HumanMessage("你好，我是Tommy")]})
    print(result)                       # 直接 print：信息很全，但很乱 / plain print: complete but messy
    print()

    # 6. 用 pretty_print 把每条消息打印清楚 / pretty_print shows each message clearly
    for message in result["messages"]:
        message.pretty_print()
    print("extra_field =", result["extra_field"])
