"""第 08 节练习：用 OpenAI Agents SDK 写第一个带工具的 Agent（TODO 版）
Lesson 08 exercise: your first OpenAI Agents SDK agent, with one tool (TODO version)

目标 / Goal:
    补全下面的 TODO，让程序能回答「北京现在多少度？」，并打印运行经过的步骤。
    Fill in the TODOs so the program answers "How warm is Beijing right now?" and prints the steps.

运行环境 / Environment: .venv  (openai-agents 0.20.0)
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l08_first_agent_todo.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY / the DEEPSEEK_API_KEY environment variable；查天气要联网 / internet for Open-Meteo
参考答案 / Solution: l08_first_agent_solution.py
"""
from agents import Agent, OpenAIChatCompletionsModel, Runner, function_tool, set_tracing_disabled

from llm import MODEL, async_client
from weather_tool import get_weather

# TODO 1: 关掉追踪上传（我们没有 OpenAI key）
#         Turn off trace upload (we have no OpenAI key)
#         提示 / Hint: set_tracing_disabled(...)


# TODO 2: 给下面的函数加上装饰器，让它变成 Agent 能用的工具
#         Add the decorator that turns this function into a tool the agent can use
#         提示 / Hint: 类型标注和 docstring 已经写好了，SDK 会用它们生成工具说明
#                      The type hints and docstring are ready; the SDK builds the tool schema from them
def get_temperature(latitude: float, longitude: float) -> str:
    """查询某个经纬度当前的气温（摄氏度）。

    Args:
        latitude: 纬度，例如北京是 39.9
        longitude: 经度，例如北京是 116.4
    """
    print(f"  [工具被调用 / tool called] get_temperature({latitude}, {longitude})")
    return f"{get_weather(latitude, longitude)}°C"


# TODO 3: 用 OpenAIChatCompletionsModel 把 MODEL 和 async_client 包成 model
#         Wrap MODEL and async_client in OpenAIChatCompletionsModel
model = None

# TODO 4: 创建 Agent：name、instructions、model、tools（工具放在列表里）
#         Create the Agent: name, instructions, model, tools (a list)
agent = None


if __name__ == "__main__":
    # TODO 5: 用 Runner.run_sync 运行 agent，问「北京现在多少度？」
    #         Run the agent with Runner.run_sync and ask "北京现在多少度？"
    result = None

    # TODO 6: 打印 result.final_output
    #         Print result.final_output

    print("\n这次运行经过的步骤 / steps in this run:")
    for item in result.new_items:
        print(" -", item.type)
