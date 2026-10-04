"""第 39 节补充：不用 ToolNode，自己写执行工具的节点（其余和视频的图一样）
Lesson 39 extra: the same agent graph with a hand-written tool node instead of ToolNode

看懂这个文件，就知道 ToolNode 在背后做了什么：按名字找到工具、执行每个调用、
为每个调用生成一条带 tool_call_id 的 ToolMessage。
用 stream_mode="updates" 打印每一步，能看到 agent ⇄ tools 的循环。
Read this to see what ToolNode does behind the scenes: find each tool by name, run every call,
and produce one ToolMessage with the matching tool_call_id per call.
stream_mode="updates" prints every step so you can watch the agent ⇄ tools loop.
本程序一般调用模型 3 次 / This program usually calls the model 3 times.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l39_tool_agent_by_hand.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY（见 Setup 页）/ the DEEPSEEK_API_KEY variable (see Setup)
"""
from langchain_core.messages import ToolMessage
from langchain_core.tools import tool
from langchain_deepseek import ChatDeepSeek
from langgraph.graph import END, START, MessagesState, StateGraph

from llm import API_KEY, MODEL


@tool
def get_weather(location: str):
    """查询城市现在的天气。location 是中文城市名，例如：北京。"""
    if location in ["北京", "深圳"]:
        return "现在 20 度，有雾。"
    return "现在 10 度，晴朗。"


@tool
def get_coolest_cities():
    """获取最冷的城市列表。"""
    return "哈尔滨,北京"


tools = [get_weather, get_coolest_cities]
tools_by_name = {t.name: t for t in tools}        # 工具名 → 工具对象 / name → tool


def build_app(model):
    model_with_tools = model.bind_tools(tools)

    def call_model(state: MessagesState):
        response = model_with_tools.invoke(state["messages"])
        return {"messages": [response]}

    def call_tools(state: MessagesState):          # 自己写的「ToolNode」/ a hand-written "ToolNode"
        last_message = state["messages"][-1]
        results = []
        for call in last_message.tool_calls:       # 每个调用：{"name", "args", "id", "type"}
            chosen = tools_by_name[call["name"]]
            output = chosen.invoke(call["args"])
            results.append(ToolMessage(content=str(output), tool_call_id=call["id"]))
        return {"messages": results}

    def should_continue(state: MessagesState):
        last_message = state["messages"][-1]
        if last_message.tool_calls:
            return "tools"
        return END

    workflow = StateGraph(MessagesState)
    workflow.add_node("agent", call_model)
    workflow.add_node("tools", call_tools)
    workflow.add_edge(START, "agent")
    workflow.add_conditional_edges("agent", should_continue, ["tools", END])
    workflow.add_edge("tools", "agent")
    return workflow.compile()


if __name__ == "__main__":
    model = ChatDeepSeek(model=MODEL, api_key=API_KEY)
    app = build_app(model)
    inputs = {"messages": [{"role": "user", "content": "最冷的城市天气如何？"}]}
    for step in app.stream(inputs, stream_mode="updates"):
        for node_name, update in step.items():
            for message in update["messages"]:     # tools 一步可能有好几条 ToolMessage / one tools step may add several
                print(f"[{node_name}]", message.content or message.tool_calls)
