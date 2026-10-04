"""第 39 节练习：用 LangGraph 搭一个会调用工具的智能体（参考答案）
Lesson 39 exercise: a tool-calling agent graph in LangGraph (solution)

视频里的例子：get_weather（北京、深圳 20 度有雾，其他城市 10 度晴朗）和
get_coolest_cities（返回「哈尔滨,北京」）。问「最冷的城市天气如何？」时，模型会先查最冷的城市，
再分别查这两个城市的天气，最后汇总回答。
The video's example: get_weather (Beijing and Shenzhen: 20 degrees and foggy, elsewhere 10 and
sunny) and get_coolest_cities (returns "哈尔滨,北京"). Asked about the weather in the coolest
cities, the model first gets the cities, then the weather of each, then sums up.

结构 / Structure:
    START → agent ──(有 tool_calls / has tool_calls)──→ tools ──→ agent → … → END
                  └─(没有 / none)──────────────────────→ END

本程序一般调用模型 3 次 / This program usually calls the model 3 times.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l39_tool_agent_solution.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY（见 Setup 页）/ the DEEPSEEK_API_KEY variable (see Setup)
TODO 版 / TODO version: l39_tool_agent_todo.py
"""
from langchain_core.tools import tool
from langchain_deepseek import ChatDeepSeek
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode

from llm import API_KEY, MODEL


# 第 1 步：定义工具 / step 1: define the tools
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


def build_app(model):
    # 第 2 步：绑定工具 / step 2: bind the tools
    model_with_tools = model.bind_tools(tools)

    # 第 3 步发生在这里：模型决定调用哪个工具、传什么参数 / step 3 happens here: the model picks tools and arguments
    def call_model(state: MessagesState):
        response = model_with_tools.invoke(state["messages"])
        return {"messages": [response]}

    def should_continue(state: MessagesState):
        last_message = state["messages"][-1]
        if last_message.tool_calls:
            return "tools"
        return END

    workflow = StateGraph(MessagesState)
    workflow.add_node("agent", call_model)
    workflow.add_node("tools", ToolNode(tools))       # 第 4 步：执行工具 / step 4: run the tools
    workflow.add_edge(START, "agent")
    workflow.add_conditional_edges("agent", should_continue, ["tools", END])
    workflow.add_edge("tools", "agent")
    return workflow.compile()


if __name__ == "__main__":
    model = ChatDeepSeek(model=MODEL, api_key=API_KEY)
    app = build_app(model)
    question = "最冷的城市天气如何？"        # 也可以试试 / also try: "深圳的天气如何？"
    result = app.invoke({"messages": [{"role": "user", "content": question}]})
    for message in result["messages"]:      # 打印全部消息，并行的两条 ToolMessage 都能看到 / print every message
        message.pretty_print()
