"""第 05 节练习：让模型调用天气工具（TODO 版）
Lesson 05 exercise: let the model call the weather tool (TODO version)

运行环境 / Environment: .venv
运行 / Run (在 practice 文件夹里 / from the practice folder):
    cd practice
    & ..\\.venv\\Scripts\\python.exe l05_call_tool_todo.py
参考答案 / Solution: l05_call_tool_solution.py
需要的 key / Keys: DEEPSEEK_API_KEY；天气用 Open-Meteo，不需要 key / Open-Meteo needs no key

提示 / Hints:
- get_weather 和 tools 在 weather_tool.py 里，先打开看看 tools 长什么样。
  get_weather and tools live in weather_tool.py; open it and look at tools first.
- call.function.arguments 是 JSON 字符串，要先 json.loads 成字典。
  call.function.arguments is a JSON string; json.loads it into a dict first.
- tool 消息的 content 必须是字符串。 A tool message's content must be a string.
"""
import json

from llm import MODEL, client
from weather_tool import get_weather, tools

if __name__ == "__main__":
    messages = [{"role": "user", "content": "北京和上海现在天气怎么样？"}]

    # TODO 1: 第 1 步——调用模型，记得传 tools=tools；取出 msg = response.choices[0].message
    #         Step 1 - call the model with tools=tools; take msg = response.choices[0].message
    #         没补全就运行会报 AttributeError: 'NoneType' object has no attribute 'tool_calls'
    #         Running it before this is done raises AttributeError: 'NoneType' object has no attribute 'tool_calls'
    response = None
    msg = None

    if msg.tool_calls:
        # TODO 2: 把 msg 本身 append 到 messages（带 tool_calls 的 assistant 消息）
        #         Append msg itself to messages (the assistant message with tool_calls)

        for call in msg.tool_calls:
            # TODO 3: 第 2 步——用 json.loads 解析 call.function.arguments，
            #         用 get_weather(**args) 执行，然后 append 一条 tool 消息：
            #         {"role": "tool", "tool_call_id": call.id, "content": str(result)}
            #         Step 2 - parse the arguments with json.loads, run get_weather(**args),
            #         then append a tool message as shown above
            pass

        # TODO 4: 第 3 步——再调用一次模型（messages 里已经有工具结果了），打印最终回答
        #         Step 3 - call the model again (the results are in messages) and print the answer

    else:
        print(msg.content)
