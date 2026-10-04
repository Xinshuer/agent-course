r"""第 05 节练习：视频的第 4、5 步——封装 get_completion，完成一次工具调用（TODO 版）
Lesson 05 exercise: the video's steps 4 and 5 - wrap get_completion and make one tool call (TODO version)

运行环境 / Environment: .venv
运行 / Run (在 practice 文件夹里 / from the practice folder):
    cd practice
    & ..\.venv\Scripts\python.exe l05_get_completion_todo.py
参考答案 / Solution: l05_get_completion_solution.py
需要的 key / Keys: DEEPSEEK_API_KEY（会调用 2 次模型 / makes 2 model calls）；Open-Meteo 不需要 key

提示 / Hints:
- 视频的 get_completion 用 dict(...) 把回答转成字典，所以之后写 reply["content"]、reply["tool_calls"]。
  The video's get_completion turns the reply into a dict with dict(...), hence reply["content"], reply["tool_calls"].
- dict(...) 只转最外层：reply["tool_calls"][0] 仍是对象，用 .id、.function.name、.function.arguments。
  dict(...) converts only the outer layer: reply["tool_calls"][0] is still an object - use .id, .function.name, .function.arguments.
"""
import json

from llm import MODEL, client
from weather_tool import get_weather, tools

# TODO 1: 在函数外面定义一个空列表 message_history
#         Define an empty list message_history outside the function
message_history = None


def get_completion(message):
    # TODO 2: 把 message 加进 message_history
    #         Append message to message_history

    # TODO 3: 用整个 message_history 调用模型，记得带上 tools=tools
    #         Call the model with the whole message_history and tools=tools
    response = None

    # TODO 4: reply = dict(response.choices[0].message)，把 reply 也加进记录，然后 return reply
    #         reply = dict(response.choices[0].message); append it to the record and return it
    #         没补全就运行会报 TypeError: 'NoneType' object is not subscriptable
    #         Running it before this is done raises TypeError: 'NoneType' object is not subscriptable
    pass


if __name__ == "__main__":
    message = get_completion({"role": "user", "content": "今天北京天气如何？"})

    if message["tool_calls"]:
        # TODO 5: 取出第一个调用 call = message["tool_calls"][0]，
        #         用 json.loads 解析 call.function.arguments，执行 get_weather(**args)，
        #         再把结果交给 get_completion：{"role": "tool", "tool_call_id": call.id, "content": str(result)}
        #         Take the first call, json.loads its arguments, run get_weather(**args),
        #         then pass the result to get_completion as the tool message shown above
        pass

    print("\nAI:", message["content"])
    print("记录里应该有 4 条消息 / the record should hold 4 messages:", len(message_history))
