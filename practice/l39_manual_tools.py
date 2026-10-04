"""第 39 节演示：第 1 步「定义工具」和第 4 步「执行工具」（不调用模型，免费运行）
Lesson 39 demo: step 1 "define tools" and step 4 "run tools" (no model calls, free)

和视频一样：两个写死结果的工具 get_weather 和 get_coolest_cities，
再手动构造一个工具调用（tool call）交给它们执行。
As in the video: two tools with hard-coded results, get_weather and get_coolest_cities,
plus a hand-made tool call for them to run.

视频里直接写 tool_node.invoke(...)；在这里安装的 LangGraph 1.2.12 中，
ToolNode 离开图单独调用会报错，所以下面演示两种能用的写法。
The video calls tool_node.invoke(...) directly; with the LangGraph 1.2.12 installed here,
ToolNode raises an error outside a graph, so two working alternatives are shown below.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l39_manual_tools.py
不需要 API key / No API key needed.
"""
from langchain_core.messages import AIMessage
from langchain_core.tools import tool
from langgraph.graph import START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode


# 第 1 步：用 @tool 定义工具 / step 1: define tools with @tool
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


if __name__ == "__main__":
    print("== 工具对象 / the tool objects")
    print(get_weather.name, "|", get_weather.description, "|", get_weather.args)
    print(get_coolest_cities.name, "|", get_coolest_cities.args)      # {}：没有参数 / no arguments

    print("\n== 工具也是 Runnable，可以直接 invoke / a tool is a Runnable: invoke it directly")
    print(get_weather.invoke({"location": "北京"}))
    print(get_weather.invoke({"location": "哈尔滨"}))
    print(get_coolest_cities.invoke({}))

    # 手动构造一个工具调用：和模型生成的格式一样 / a hand-made tool call, in the same format a model produces
    call = {"name": "get_weather", "args": {"location": "北京"}, "id": "tool_call_id", "type": "tool_call"}
    message = AIMessage(content="", tool_calls=[call])

    print("\n== 视频里的写法：ToolNode 单独 invoke / the video's way: ToolNode on its own")
    tool_node = ToolNode(tools)
    try:
        print(tool_node.invoke({"messages": [message]}))
    except ValueError as e:
        print("ValueError:", e)          # LangGraph 1.2.12：ToolNode 要在图里运行 / must run inside a graph

    print("\n== 写法 A：把整个调用字典交给工具，直接得到 ToolMessage / way A: pass the whole call to the tool")
    print(get_weather.invoke(call))

    print("\n== 写法 B：把 ToolNode 放进只有一个节点的小图 / way B: a one-node graph around ToolNode")
    mini = StateGraph(MessagesState)
    mini.add_node("tools", tool_node)
    mini.add_edge(START, "tools")
    run_tools = mini.compile()
    two_calls = AIMessage(content="", tool_calls=[
        call,
        {"name": "get_coolest_cities", "args": {}, "id": "call_2", "type": "tool_call"},
    ])
    result = run_tools.invoke({"messages": [two_calls]})
    for m in result["messages"][1:]:     # 第 0 条是我们传进去的 AIMessage / item 0 is our own AIMessage
        print(m.name, "->", m.content, "| tool_call_id =", m.tool_call_id)
