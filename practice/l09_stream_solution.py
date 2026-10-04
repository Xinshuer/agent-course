"""第 09 节练习参考答案：Agent 的流式输出（Runner.run_streamed）
Lesson 09 solution: streaming an agent's output with Runner.run_streamed

做了什么 / What it does:
    一边生成一边打印 Agent 的回答（逐字出现），并在调用工具时打印工具名、参数和结果。
    Prints the agent's answer as it is generated (piece by piece), and shows each tool call,
    its arguments and its result.

运行环境 / Environment: .venv  (openai-agents 0.20.0)
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l09_stream_solution.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY / the DEEPSEEK_API_KEY environment variable；查天气要联网 / internet for Open-Meteo
"""
import asyncio

from agents import Agent, OpenAIChatCompletionsModel, Runner, function_tool, set_tracing_disabled
from openai.types.responses import ResponseTextDeltaEvent

from llm import MODEL, async_client
from weather_tool import get_weather

set_tracing_disabled(True)


@function_tool
def get_temperature(latitude: float, longitude: float) -> str:
    """查询某个经纬度当前的气温（摄氏度）。

    Args:
        latitude: 纬度，例如北京是 39.9
        longitude: 经度，例如北京是 116.4
    """
    return f"{get_weather(latitude, longitude)}°C"


agent = Agent(
    name="天气助手",
    instructions="你是一个天气助手。需要气温时调用工具。",
    model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),
    tools=[get_temperature],
)


async def main():
    # run_streamed 不用 await：它马上返回一个「还在运行」的结果对象
    # No await on run_streamed: it returns a still-running result object right away
    result = Runner.run_streamed(agent, "北京现在多少度？再用三句话说说北京秋天适合去哪玩。")

    async for event in result.stream_events():
        # 1. 回答的文字片段 / a piece of the answer text
        if event.type == "raw_response_event" and isinstance(event.data, ResponseTextDeltaEvent):
            print(event.data.delta, end="", flush=True)
        # 2. 更高一层的事件：工具被调用、工具返回结果 / higher-level events: tool called, tool output
        #    前面加 \n：模型调用工具前可能先说一句话，免得挤在同一行
        #    Leading \n: the model may say something before calling the tool; keep it off that line
        elif event.type == "run_item_stream_event":
            if event.name == "tool_called":
                print(f"\n[调用工具 / tool call] {event.item.raw_item.name}({event.item.raw_item.arguments})")
            elif event.name == "tool_output":
                print(f"[工具结果 / tool result] {event.item.output}")

    print()  # 流结束后换行 / newline after the stream ends
    # 流读完以后，final_output 才是完整的 / final_output is complete only after the stream ends
    print("final_output 共", len(result.final_output), "个字符 / characters")


if __name__ == "__main__":
    asyncio.run(main())
