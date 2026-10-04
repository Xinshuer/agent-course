"""第 05 节：两个工具（查天气 + 查时间），按名字决定执行哪个函数
Lesson 05: two tools (weather + time); run the right function by its name

演示 / Shows:
- 一个没有参数的工具 get_time（parameters 里 properties 是空的）
  a tool with no parameters, get_time (empty properties)
- 用 if / elif 根据 call.function.name 选函数（07 节会换成更简洁的「函数字典」）
  choosing the function with if / elif on call.function.name (lesson 07 replaces it with a dict of functions)

运行环境 / Environment: .venv
运行 / Run (在 practice 文件夹里 / from the practice folder):
    cd practice
    & ..\\.venv\\Scripts\\python.exe l05_two_tools.py
需要的 key / Keys: DEEPSEEK_API_KEY；天气用 Open-Meteo，不需要 key / Open-Meteo needs no key
"""
import json
from datetime import datetime

from llm import MODEL, client
from weather_tool import get_weather
from weather_tool import tools as weather_tools


def get_time():
    """返回本机当前时间 / Return the current local time."""
    return datetime.now().strftime("%Y-%m-%d %H:%M")


time_tool = {
    "type": "function",
    "function": {
        "name": "get_time",
        "description": "Get the current local date and time. Use it whenever the user asks what time or date it is.",
        "parameters": {"type": "object", "properties": {}, "required": []},
    },
}
tools = [weather_tools[0], time_tool]     # 两个工具说明放进一个列表 / both tool descriptions in one list

if __name__ == "__main__":
    messages = [{"role": "user", "content": "北京现在天气怎么样？现在几点了？"}]
    response = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)
    msg = response.choices[0].message

    if msg.tool_calls:
        messages.append(msg)
        for call in msg.tool_calls:
            args = json.loads(call.function.arguments)
            if call.function.name == "get_weather":
                result = get_weather(**args)
            elif call.function.name == "get_time":
                result = get_time()
            else:
                result = f"没有这个工具 / unknown tool: {call.function.name}"
            print(f"  [工具 tool] {call.function.name}({args}) -> {result}")
            messages.append({"role": "tool", "tool_call_id": call.id, "content": str(result)})
        response = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)
        print(response.choices[0].message.content)
    else:
        print(msg.content)
