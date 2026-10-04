"""第 11 节练习参考答案：给 Agent 用工具（视频里的例子：查北京的天气）
Lesson 11 solution: giving an agent a tool (the video's example: the weather in Beijing)

视频里的做法 / What the video does:
1. 把 05 集的查天气函数拿过来，写好 docstring，加上 @function_tool，放进 Agent 的 tools 列表
   take episode 05's weather function, add a docstring and @function_tool, put it in the agent's tools list
2. 为了快，先不联网：函数直接返回一个固定的温度 "31.1℃"
   to keep it quick, no network: the function just returns a fixed "31.1℃"
3. 参数原来是经纬度，视频里的谷歌模型说「不知道北京的经纬度」，于是把参数改成城市名 city_name
   the parameters were latitude/longitude; the Google model in the video said it did not know Beijing's
   coordinates, so the parameter became the city name city_name
4. 不用写 JSON Schema，也不用自己执行工具、把结果发回模型：Runner 全部自动完成
   no JSON Schema and no manual tool execution - the Runner does it all

运行环境 / Environment: .venv  (openai-agents 0.20.0)
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l11_tools_solution.py
需要 / Needs: DEEPSEEK_API_KEY
"""
from agents import Agent, OpenAIChatCompletionsModel, Runner, function_tool, set_tracing_disabled

from llm import MODEL, async_client

set_tracing_disabled(True)
model = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)


# 视频里的第一版：参数是经纬度（模型得自己知道城市的经纬度）
# The video's first version: latitude/longitude (the model has to know the coordinates itself)
@function_tool
def get_weather_by_coords(latitude: float, longitude: float) -> str:
    """查询指定经纬度当前的气温。

    Args:
        latitude: 纬度
        longitude: 经度
    """
    print(f"  [工具被调用 / tool called] get_weather_by_coords({latitude}, {longitude})")
    return "31.1℃"


# 改进后的版本：参数是城市名 / The improved version: the parameter is the city name
@function_tool
def get_weather(city_name: str) -> str:
    """查询指定城市当前的气温。

    Args:
        city_name: 城市名，例如 北京、巴黎
    """
    print(f"  [工具被调用 / tool called] get_weather({city_name!r})")
    return "31.1℃"   # 和视频一样先不联网，返回固定值 / like the video: a fixed value, no network


def run(tool, question):
    agent = Agent(
        name="天气助手",
        instructions="你是一个天气助手。需要天气信息时调用工具，回答简洁。",
        model=model,
        tools=[tool],                     # 工具放在列表里，可以有很多个 / a list - there can be many tools
    )
    result = Runner.run_sync(agent, question)
    print("AI:", result.final_output)
    print("这次运行经过的步骤 / the steps of this run:", [item.type for item in result.new_items])


if __name__ == "__main__":
    print("工具名 / tool name:", get_weather.name)
    print("工具说明 / description:", get_weather.description)
    print("参数 / parameters:", get_weather.params_json_schema["properties"])
    print()
    run(get_weather, "今天北京天气如何？")
    # 想看看经纬度版本：取消下一行的注释 / to try the latitude/longitude version, uncomment:
    # run(get_weather_by_coords, "今天巴黎天气如何？")
