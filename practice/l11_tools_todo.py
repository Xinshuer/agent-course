"""第 11 节练习：给 Agent 用工具（TODO 版，视频里的例子：查北京的天气）
Lesson 11 exercise: giving an agent a tool (TODO version, the video's example: the weather in Beijing)

运行环境 / Environment: .venv  (openai-agents 0.20.0)
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l11_tools_todo.py
需要 / Needs: DEEPSEEK_API_KEY
参考答案 / Solution: l11_tools_solution.py
"""
from agents import Agent, OpenAIChatCompletionsModel, Runner, function_tool, set_tracing_disabled

from llm import MODEL, async_client

set_tracing_disabled(True)
model = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)


# TODO 1: 写函数 get_weather(city_name: str) -> str
#         - 上面加 @function_tool
#         - docstring 第一行写「查询指定城市当前的气温。」，再用 Args: 说明 city_name
#         - 函数里先打印一行「工具被调用」，然后 return "31.1℃"（和视频一样先不联网）
#         Write get_weather(city_name: str) -> str with @function_tool, a docstring with Args:,
#         a print showing it was called, and return "31.1℃"


def main():
    # TODO 2: 创建 Agent（name、instructions、model=model），tools=[get_weather]
    #         Create an Agent with tools=[get_weather]

    # TODO 3: Runner.run_sync(agent, "今天北京天气如何？")，打印 final_output
    #         Run it and print final_output

    # TODO 4: 打印 [item.type for item in result.new_items]，看看 Runner 自动做了哪些步骤
    #         Print the step types to see what the Runner did for you
    pass


if __name__ == "__main__":
    main()
