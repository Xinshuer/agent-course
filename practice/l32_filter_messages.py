"""第 32 节演示：消息过滤——只把最后一条消息发给模型（视频第三部分的第一个例子）
Lesson 32 demo: message filtering - send only the last message to the model
(the first example of part 3 of the video)

和 l32_react_memory_solution.py 是同一个智能体，唯一的区别是 call_model 先过滤消息：
filter_messages 只保留最后一条。checkpointer 照样把每条消息都存下来，
可模型每次只看到一条，所以第二句问名字时它答不上来。
The same agent as l32_react_memory_solution.py; the only change is that call_model filters first:
filter_messages keeps just the last message. The checkpointer still saves every message,
but the model only ever sees one, so it can't answer "what's my name?".

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l32_filter_messages.py
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
    return "（模拟搜索结果 / mock result）今天北京晴，气温 20 度左右。"


tools = [search]
tool_node = ToolNode(tools)
model = ChatDeepSeek(model=MODEL, api_key=API_KEY)
bound_model = model.bind_tools(tools)


def filter_messages(messages: list):
    """非常简单粗暴的过滤：只保留最后一条消息 / crude filter: keep only the last message"""
    return messages[-1:]
    # 也可以留最近几条，例如 messages[-4:]；但别把 AI 的工具调用和对应的 tool 结果拆开
    # You could keep a few, e.g. messages[-4:], but never split a tool call from its tool result


def should_continue(state: MessagesState):
    last_message = state["messages"][-1]
    if not last_message.tool_calls:
        return END
    return "action"


def call_model(state: MessagesState):
    messages = filter_messages(state["messages"])          # 唯一的区别 / the only change
    print(f"   [日志/log] 发给模型 {len(messages)} 条，状态里共 {len(state['messages'])} 条 "
          f"/ sending {len(messages)} of {len(state['messages'])} messages")
    response = bound_model.invoke(messages)
    return {"messages": [response]}


workflow = StateGraph(MessagesState)
workflow.add_node("agent", call_model)
workflow.add_node("action", tool_node)
workflow.add_edge(START, "agent")
workflow.add_conditional_edges("agent", should_continue, ["action", END])
workflow.add_edge("action", "agent")
app = workflow.compile(checkpointer=InMemorySaver())


def chat(text, config):
    inputs = {"messages": [{"role": "user", "content": text}]}
    for chunk in app.stream(inputs, config, stream_mode="values"):
        chunk["messages"][-1].pretty_print()


if __name__ == "__main__":
    config = {"configurable": {"thread_id": "2"}}
    chat("你好，我是托米。请简短回答。", config)
    chat("我叫什么名字？", config)           # 答不上来：上一句被过滤掉了 / can't answer: filtered out
