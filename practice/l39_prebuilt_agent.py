"""第 39 节补充：一行代码的预置版本 create_agent
Lesson 39 extra: the one-call prebuilt version, create_agent

视频里一步步搭出来的「agent ⇄ tools」循环图太常用了，所以有现成的封装。
LangGraph 1.x 里旧的 langgraph.prebuilt.create_react_agent 已标记为弃用，
官方建议改用 langchain.agents.create_agent。它内部就是同样的循环图。
The agent ⇄ tools loop built step by step in the video is so common that it comes packaged.
In LangGraph 1.x the old langgraph.prebuilt.create_react_agent is deprecated; use
langchain.agents.create_agent, which contains the same loop graph.
本程序一般调用模型 2 次 / This program usually calls the model twice.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l39_prebuilt_agent.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY（见 Setup 页）/ the DEEPSEEK_API_KEY variable (see Setup)
"""
from langchain.agents import create_agent
from langchain_core.tools import tool
from langchain_deepseek import ChatDeepSeek

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


def build_agent(model):
    return create_agent(
        model=model,                     # 传原始 model，create_agent 会替你 bind_tools / pass the plain model
        tools=[get_weather, get_coolest_cities],
        system_prompt="你是天气助手，回答要简短。",
    )


if __name__ == "__main__":
    model = ChatDeepSeek(model=MODEL, api_key=API_KEY)
    agent = build_agent(model)
    result = agent.invoke({"messages": [{"role": "user", "content": "深圳的天气如何？"}]})
    print(result["messages"][-1].content)
