r"""第 05 节练习参考答案：视频的第 4、5 步——封装 get_completion，完成一次工具调用
Lesson 05 solution: the video's steps 4 and 5 - wrap get_completion and make one tool call

和视频的区别 / Differences from the video:
- 视频用阿里云百炼的 qwen-plus；这里用 llm.py 里的 deepseek-flash（同样支持工具调用）。
  The video uses Bailian's qwen-plus; this uses deepseek-flash from llm.py (it supports tool calls too).
- 天气接口换成不需要 key 的 Open-Meteo（weather_tool.py）。
  The weather API is the key-free Open-Meteo (weather_tool.py).

运行环境 / Environment: .venv
运行 / Run (在 practice 文件夹里 / from the practice folder):
    cd practice
    & ..\.venv\Scripts\python.exe l05_get_completion_solution.py
需要的 key / Keys: DEEPSEEK_API_KEY（会调用 2 次模型 / makes 2 model calls）；Open-Meteo 不需要 key
"""
import json

from llm import MODEL, client
from weather_tool import get_weather, tools

# 第 4 步：对话记录写在函数外面，每次调用都往同一份记录里加
# Step 4: the record lives outside the function, so every call adds to the same list
message_history = []


def get_completion(message):
    message_history.append(message)                      # 1. 记下这次要发的消息 / record the outgoing message
    response = client.chat.completions.create(
        model=MODEL,
        messages=message_history,                        # 2. 发送整个记录 / send the whole record
        tools=tools,
    )
    reply = dict(response.choices[0].message)            # 3. 回答转成字典（视频的写法）/ reply as a dict (the video's way)
    message_history.append(reply)                        #    也记进记录 / record it too
    return reply


if __name__ == "__main__":
    # 第 5 步：提问。模型查不到实时天气，会返回一个工具调用请求
    # Step 5: ask. The model can't look up live weather, so it returns a tool-call request
    message = get_completion({"role": "user", "content": "今天北京天气如何？"})

    if message["tool_calls"]:
        call = message["tool_calls"][0]                  # 视频只处理第一个调用 / the video handles the first call only
        print("id:", call.id)
        print("name:", call.function.name)
        print("arguments:", call.function.arguments)     # 字符串 / a string
        args = json.loads(call.function.arguments)       # 字符串 -> 字典 / string -> dict
        result = get_weather(**args)                     # 由我们的代码执行 / our code runs it
        print("result:", result)
        # 把结果作为 tool 消息交回去 / hand the result back as a tool message
        message = get_completion({"role": "tool", "tool_call_id": call.id, "content": str(result)})

    print("\nAI:", message["content"])

    # 看看对话记录里存了什么 / what the record holds now
    print(f"\n----- message_history: {len(message_history)} -----")
    for m in message_history:
        print(m["role"], "|", m.get("content"), "|", "tool_calls" if m.get("tool_calls") else "")
