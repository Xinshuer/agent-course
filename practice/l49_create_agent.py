"""第 49 节补充：同样的两个工具，换成 LangChain 1.x 推荐的 create_agent
Lesson 49 extra: the same two tools with create_agent, the agent API LangChain 1.x recommends

视频里的 create_react_agent + AgentExecutor 靠模型写出 "Action: ..." 这样的文字、再由程序解析；
create_agent 让模型通过结构化的 tool_calls 请求工具（第 05、45 节），不用解析文字，也不用 ReAct 提示词模板。
The video's create_react_agent + AgentExecutor relies on the model writing "Action: ..." text that is then parsed;
create_agent lets the model request tools through structured tool_calls (lessons 05 and 45): no text parsing,
no ReAct prompt template.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l49_create_agent.py
需要 DEEPSEEK_API_KEY；一次运行调用模型 2–3 次（实测时模型在同一条消息里同时请求了 search 和 weekday，
所以只用了 2 次）。搜索是 l49_tools.py 里的模拟搜索。
Needs DEEPSEEK_API_KEY; 2-3 model calls per run (in our test the model asked for search and weekday in the
same message, so only 2). Search is the mock in l49_tools.py.
"""
from langchain.agents import create_agent
from langchain_deepseek import ChatDeepSeek

from l49_tools import search, weekday
from llm import API_KEY, MODEL

SYSTEM_PROMPT = "你是一个简洁的助手。事实和日期要用 search 查，星期几要用 weekday 算，不要凭记忆。"


def build_agent(model):
    """用给定的模型创建 Agent。 / Build the agent around the given model."""
    return create_agent(model=model, tools=[search, weekday], system_prompt=SYSTEM_PROMPT)


def print_trace(messages):
    """逐条打印消息记录。 / Print the message list one by one."""
    for m in messages:
        if m.type == "ai" and m.tool_calls:        # 先判断类型，再读 tool_calls / check the type first
            for call in m.tool_calls:
                print(f"[AI 要调用工具 / tool call] {call['name']} {call['args']}")
        elif m.type == "tool":
            print(f"[工具结果 / tool result] {m.name} -> {m.content}")
        else:
            print(f"[{m.type}] {m.content}")


if __name__ == "__main__":
    agent = build_agent(ChatDeepSeek(model=MODEL, api_key=API_KEY))
    # 输入是 {"messages": [...]}，不是 AgentExecutor 的 {"input": ...}
    # The input is {"messages": [...]}, not AgentExecutor's {"input": ...}
    out = agent.invoke({"messages": [{"role": "user", "content": "2024年巴黎奥运会开幕式是星期几？"}]})
    print("最终回答 / final answer:", out["messages"][-1].content)
    print("\n执行过程 / trace:")
    print_trace(out["messages"])
