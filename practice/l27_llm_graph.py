"""第 27 节补充：把节点里的「假回复」换成真正的大模型
Lesson 27 extra: replace the node's fake reply with a real model

视频这一集没有调用模型，节点里的 AI 回复是手写的。这里只改了一行：
new_message = model.invoke(messages)。图的其他部分和 l27_first_graph_solution.py 一样。
（第 29 节的视频才第一次在节点里调用模型。）
The episode itself calls no model; the node's AI reply is hand-written. Only one line changes here:
new_message = model.invoke(messages). The rest matches l27_first_graph_solution.py.
(Episode 29 is the first to call a model inside a node.)

运行一次 = 1 次 API 调用。/ One run = 1 API call.

运行环境 / Environment: .venv
运行 / Run:  cd practice
             & ..\\.venv\\Scripts\\python.exe l27_llm_graph.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY（见「环境准备」页）/ the DEEPSEEK_API_KEY variable (see Setup)
"""
from langchain_core.messages import AnyMessage, HumanMessage
from langchain_deepseek import ChatDeepSeek
from langgraph.graph import StateGraph
from typing_extensions import TypedDict

from llm import API_KEY, MODEL

# 模型对象只创建一次，放在节点函数外面 / Create the model once, outside the node
model = ChatDeepSeek(model=MODEL, api_key=API_KEY)


class State(TypedDict):
    messages: list[AnyMessage]
    extra_field: int


def node(state: State):
    messages = state["messages"]
    new_message = model.invoke(messages)        # 唯一的改动：回复来自模型 / the only change: the reply comes from the model
    return {"messages": messages + [new_message], "extra_field": 1}


builder = StateGraph(State)
builder.add_node(node)
builder.set_entry_point("node")
graph = builder.compile()


if __name__ == "__main__":
    result = graph.invoke({"messages": [HumanMessage("你好，我是Tommy。请用一句话介绍你自己。")]})
    for message in result["messages"]:
        message.pretty_print()
