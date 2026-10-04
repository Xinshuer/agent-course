"""第 08 节练习参考答案：用 OpenAI Agents SDK 写第一个带工具的 Agent
Lesson 08 solution: your first OpenAI Agents SDK agent, with one tool

做了什么 / What it does:
    定义一个查气温的工具（@function_tool），交给 Agent，用 Runner.run_sync 运行，
    然后打印最终回答和这次运行经过的步骤。
    Defines a temperature tool with @function_tool, gives it to an Agent, runs it with
    Runner.run_sync, then prints the final answer and the steps the run went through.

运行环境 / Environment: .venv  (openai-agents 0.20.0)
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l08_first_agent_solution.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY / the DEEPSEEK_API_KEY environment variable；查天气要联网 / internet for Open-Meteo
"""
from agents import Agent, OpenAIChatCompletionsModel, Runner, function_tool, set_tracing_disabled

from llm import MODEL, async_client
from weather_tool import get_weather

# 追踪数据默认上传到 OpenAI 后台；我们没有 OpenAI key，所以关掉
# Traces are uploaded to OpenAI by default; we have no OpenAI key, so turn it off
set_tracing_disabled(True)


@function_tool
def get_temperature(latitude: float, longitude: float) -> str:
    """查询某个经纬度当前的气温（摄氏度）。

    Args:
        latitude: 纬度，例如北京是 39.9
        longitude: 经度，例如北京是 116.4
    """
    print(f"  [工具被调用 / tool called] get_temperature({latitude}, {longitude})")
    return f"{get_weather(latitude, longitude)}°C"


# DeepSeek 只支持 Chat Completions 接口，所以用 OpenAIChatCompletionsModel 包一层
# DeepSeek only speaks Chat Completions, so wrap the client in OpenAIChatCompletionsModel
model = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)

agent = Agent(
    name="天气助手",
    instructions="你是一个简洁的天气助手。需要气温时调用工具，回答不超过两句话。",
    model=model,
    tools=[get_temperature],
)


if __name__ == "__main__":
    result = Runner.run_sync(agent, "北京现在多少度？")
    print("最终回答 / final output:", result.final_output)

    print("\n这次运行经过的步骤 / steps in this run:")
    for item in result.new_items:
        print(" -", item.type)
