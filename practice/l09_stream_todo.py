"""第 09 节练习：Agent 的流式输出（Runner.run_streamed）（TODO 版）
Lesson 09 exercise: streaming an agent's output with Runner.run_streamed (TODO version)

目标 / Goal:
    让 Agent 的回答一个片段一个片段地打印出来，并在调用工具时打印工具名和结果。
    Print the agent's answer piece by piece, and show each tool call and its result.

运行环境 / Environment: .venv  (openai-agents 0.20.0)
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l09_stream_todo.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY / the DEEPSEEK_API_KEY environment variable；查天气要联网 / internet for Open-Meteo
参考答案 / Solution: l09_stream_solution.py
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
    # TODO 1: 用 Runner.run_streamed 运行 agent（注意：这一行不需要 await）
    #         Run the agent with Runner.run_streamed (note: this line needs no await)
    result = None

    # TODO 2: 用 async for 遍历 result.stream_events()
    #         Loop over result.stream_events() with async for
    #   TODO 3: 如果 event.type == "raw_response_event" 并且 event.data 是 ResponseTextDeltaEvent，
    #           就打印 event.data.delta，不换行并立即刷新（end="", flush=True）
    #           If event.type == "raw_response_event" and event.data is a ResponseTextDeltaEvent,
    #           print event.data.delta without a newline and flush immediately (end="", flush=True)
    #   TODO 4（选做 / optional）: event.type == "run_item_stream_event" 时，
    #           event.name == "tool_called" 打印 event.item.raw_item.name，
    #           event.name == "tool_output" 打印 event.item.output
    #           When event.type == "run_item_stream_event": on "tool_called" print event.item.raw_item.name,
    #           on "tool_output" print event.item.output
    #           提示：工具那一行前面加 "\n"，免得和模型之前说的话挤在同一行
    #           Hint: start the tool line with "\n" so it doesn't share a line with earlier text

    print()
    # TODO 5: 流结束后打印 result.final_output 的长度
    #         After the stream ends, print the length of result.final_output


if __name__ == "__main__":
    asyncio.run(main())
