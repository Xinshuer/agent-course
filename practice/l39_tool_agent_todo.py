"""第 39 节练习：用 LangGraph 搭一个会调用工具的智能体（TODO 版）
Lesson 39 exercise: a tool-calling agent graph in LangGraph (TODO version)

按视频的四步来：定义工具 → 绑定工具 → 模型生成工具调用 → ToolNode 执行工具。
Follow the video's four steps: define tools → bind them → the model writes tool calls →
ToolNode runs them.

目标结构 / Target structure:
    START → agent ──(有 tool_calls / has tool_calls)──→ tools ──→ agent → … → END
                  └─(没有 / none)──────────────────────→ END

做完后一般调用模型 3 次 / Once complete it usually calls the model 3 times.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l39_tool_agent_todo.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY（见 Setup 页）/ the DEEPSEEK_API_KEY variable (see Setup)
参考答案 / Solution: l39_tool_agent_solution.py
"""
from langchain_core.tools import tool
from langchain_deepseek import ChatDeepSeek
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode

from llm import API_KEY, MODEL


# TODO 1: 用 @tool 把下面的函数变成工具。docstring 会变成工具说明，别删。
#         Turn the function below into a tool with @tool. The docstring becomes its description.
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
    # TODO 2: 用 model.bind_tools(tools) 得到 model_with_tools
    #         Get model_with_tools from model.bind_tools(tools)
    model_with_tools = model

    def call_model(state: MessagesState):
        # TODO 3: 用 model_with_tools 处理 state["messages"]，返回 {"messages": [response]}
        #         Call model_with_tools on state["messages"] and return {"messages": [response]}
        pass

    def should_continue(state: MessagesState):
        # TODO 4: 取最后一条消息；它有 tool_calls 就返回 "tools"，否则返回 END
        #         Take the last message; return "tools" if it has tool_calls, otherwise END
        pass

    workflow = StateGraph(MessagesState)
    workflow.add_node("agent", call_model)
    # TODO 5: 加一个名字叫 "tools" 的节点，内容是 ToolNode(tools)
    #         Add a node named "tools" that is ToolNode(tools)

    workflow.add_edge(START, "agent")
    # TODO 6: 从 "agent" 加条件边：路由函数 should_continue，可能去往 ["tools", END]；
    #         再加一条 "tools" → "agent" 的普通边，让工具结果回到模型
    #         Add the conditional edge from "agent" (should_continue, ["tools", END]) and
    #         the plain edge "tools" → "agent" so results go back to the model

    return workflow.compile()


if __name__ == "__main__":
    model = ChatDeepSeek(model=MODEL, api_key=API_KEY)
    app = build_app(model)
    question = "最冷的城市天气如何？"        # 也可以试试 / also try: "深圳的天气如何？"
    result = app.invoke({"messages": [{"role": "user", "content": question}]})
    for message in result["messages"]:
        message.pretty_print()
