"""第 32 节练习：给 ReAct 智能体加上短期记忆（TODO 版）
Lesson 32 exercise: short-term memory for a ReAct agent (TODO version)

目标：补全条件边、图的连线和 checkpointer，让同一个 thread_id 的第二句能答出名字。
Goal: complete the conditional edge, the wiring and the checkpointer so that the second line
on the same thread_id gets your name right.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l32_react_memory_todo.py
参考答案 / Solution: l32_react_memory_solution.py（会调用 2 次 DeepSeek / 2 DeepSeek calls）
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
# TODO 1: 用 model.bind_tools(tools) 得到绑定了工具的模型（注意它返回一个新对象）
#         Get a tool-aware model with model.bind_tools(tools) (it returns a NEW object)
bound_model = model


def should_continue(state: MessagesState):
    last_message = state["messages"][-1]
    # TODO 2: 最后一条消息没有 tool_calls 就返回 END，否则返回 "action"
    #         Return END when the last message has no tool_calls, otherwise "action"
    return END


def call_model(state: MessagesState):
    response = bound_model.invoke(state["messages"])
    return {"messages": [response]}


workflow = StateGraph(MessagesState)
workflow.add_node("agent", call_model)
workflow.add_node("action", tool_node)
workflow.add_edge(START, "agent")
# TODO 3: 加条件边：从 "agent" 出发，用 should_continue 决定去 "action" 还是 END；
#         再加一条普通边 "action" -> "agent"
#         Add the conditional edge from "agent" (should_continue -> "action" or END)
#         and the normal edge "action" -> "agent"

# TODO 4: 编译时传入 checkpointer=InMemorySaver()
#         Compile with checkpointer=InMemorySaver()
app = workflow.compile()


def chat(text, config):
    inputs = {"messages": [{"role": "user", "content": text}]}
    for chunk in app.stream(inputs, config, stream_mode="values"):
        chunk["messages"][-1].pretty_print()


if __name__ == "__main__":
    config = {"configurable": {"thread_id": "20"}}
    chat("你好，我是托米。请简短回答。", config)
    chat("我叫什么名字？", config)
