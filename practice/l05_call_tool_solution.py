"""第 05 节练习参考答案：让模型调用天气工具（三步走）
Lesson 05 solution: let the model call the weather tool (three steps)

运行环境 / Environment: .venv
运行 / Run (在 practice 文件夹里 / from the practice folder):
    cd practice
    & ..\\.venv\\Scripts\\python.exe l05_call_tool_solution.py
需要的 key / Keys: DEEPSEEK_API_KEY；天气用 Open-Meteo，不需要 key / Open-Meteo needs no key
"""
import json

from llm import MODEL, client
from weather_tool import get_weather, tools

if __name__ == "__main__":
    messages = [{"role": "user", "content": "北京和上海现在天气怎么样？"}]

    # 第 1 步：把问题和 tools 一起发给模型，由模型决定要不要调用工具
    # Step 1: send the question together with the tools; the model decides
    response = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)
    msg = response.choices[0].message
    print("finish_reason:", response.choices[0].finish_reason)

    if msg.tool_calls:                    # 模型要调用工具 / the model wants tools
        messages.append(msg)              # 带 tool_calls 的这条必须先存进去 / store it first

        # 第 2 步：由你的代码执行函数，把每个结果作为 tool 消息存进去
        # Step 2: your code runs the function and stores each result as a tool message
        for call in msg.tool_calls:
            args = json.loads(call.function.arguments)    # JSON 字符串 -> 字典 / string -> dict
            result = get_weather(**args)                  # 字典 -> 关键字参数 / dict -> keyword args
            print(f"  [工具 tool] {call.function.name}({args}) -> {result}")
            messages.append({"role": "tool", "tool_call_id": call.id, "content": str(result)})

        # 第 3 步：把结果交回给模型，让它写成最终回答
        # Step 3: hand the results back so the model writes the final answer
        response = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)
        print(response.choices[0].message.content)
    else:                                 # 不需要工具：这就是回答 / no tool needed: this is the answer
        print(msg.content)
