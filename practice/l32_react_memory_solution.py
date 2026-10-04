"""第 32 节练习参考答案：给 ReAct 智能体加上短期记忆（视频第一部分）
Lesson 32 solution: short-term memory for a ReAct agent (part 1 of the video)

图 / Graph:  START -> agent -> (有工具调用 / tool calls) -> action -> agent ...
                          -> (没有工具调用 / no tool calls) -> END
- search 是一个模拟的联网搜索工具：不管搜什么都返回一段固定文字。
- ToolNode 负责执行模型要求调用的工具；bind_tools 把工具说明交给模型。
- 编译时加上 checkpointer，同一个 thread_id 的多轮对话就能接上。
- search is a simulated web-search tool that always returns the same text.
- ToolNode runs the tools the model asks for; bind_tools hands the tool descriptions to the model.
- With a checkpointer, turns on the same thread_id are connected.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l32_react_memory_solution.py
会调用 2 次 DeepSeek / Makes 2 DeepSeek calls.
"""
from langchain_core.tools import tool
from langchain_deepseek import ChatDeepSeek
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode

from llm import API_KEY, MODEL


@tool
def search(query: str):
    """模拟联网搜索。Simulated web search."""
    # 真实项目里这里要换成真正的搜索工具 / a real project would call a real search API here
    return "（模拟搜索结果 / mock result）今天北京晴，气温 20 度左右。"


tools = [search]
tool_node = ToolNode(tools)                      # 执行工具的现成节点 / a ready-made node that runs tools

model = ChatDeepSeek(model=MODEL, api_key=API_KEY)
bound_model = model.bind_tools(tools)            # 把工具说明交给模型 / give the model the tool descriptions


def should_continue(state: MessagesState):
    """条件边：最后一条消息没有工具调用就结束 / end when the last message has no tool calls"""
    last_message = state["messages"][-1]
    if not last_message.tool_calls:
        return END
    return "action"


def call_model(state: MessagesState):
    response = bound_model.invoke(state["messages"])
    return {"messages": [response]}


workflow = StateGraph(MessagesState)
workflow.add_node("agent", call_model)
workflow.add_node("action", tool_node)
workflow.add_edge(START, "agent")
workflow.add_conditional_edges("agent", should_continue, ["action", END])
workflow.add_edge("action", "agent")             # 工具执行完回到 agent / back to the agent after a tool
app = workflow.compile(checkpointer=InMemorySaver())


def chat(text, config):
    inputs = {"messages": [{"role": "user", "content": text}]}
    for chunk in app.stream(inputs, config, stream_mode="values"):
        chunk["messages"][-1].pretty_print()


if __name__ == "__main__":
    config = {"configurable": {"thread_id": "20"}}
    chat("你好，我是托米。请简短回答。", config)
    chat("我叫什么名字？", config)                 # 记得 / remembers
    # 想看工具被调用，可以再加一句（多 2 次调用）/ to see the tool in action, add (2 more calls):
    # chat("帮我搜一下北京今天的天气", config)
