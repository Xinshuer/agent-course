r"""第 01 节演示（讲义补充，视频这一集没有代码）：普通的大模型调用 vs. 一个最小的 Agent 循环
Lesson 01 demo (an extra - this episode has no code): a plain model call vs. a minimal agent loop

同一个问题问两次：
  A. 普通调用：只把问题发给模型。它像视频里说的「聊天机器人」，只能回一段文字——
     要么说查不到实时气温，要么凭「这个季节一般多少度」猜一个（猜错日期也很常见）。
  B. Agent 循环：模型可以请求 get_weather 工具，由我们的代码执行，再把结果交回模型，
     一直重复到模型不再请求工具，最后给出回答。查几次、什么时候停，都由模型自己决定。
这个文件只是「看效果」用的，不需要现在就读懂每一行——04-07 节你会亲手写出同样的代码。
模型：DeepSeek（deepseek-flash，见 llm.py）；它默认开着「思考模式」，所以还能顺便看到它的思考片段。

The same question, asked twice:
  A. A plain call: like the "chatbot" level in the video, only text comes back - either
     "I can't access live weather" or a guess from typical seasonal temperatures
     (often for the wrong date).
  B. An agent loop: the model may request the get_weather tool; our code runs it and hands
     the result back, repeating until the model asks for no more tools, then it answers.
     The model decides how many lookups to make and when to stop.
This file is just for watching the behaviour; you will write the same code yourself in 04-07.
Model: DeepSeek (deepseek-flash, see llm.py). It thinks before answering by default, so you
also get to see a snippet of its reasoning.

运行环境 / Environment: .venv
运行 / Run (PowerShell):
    cd practice
    & ..\.venv\Scripts\python.exe l01_plain_vs_agent.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY（见「环境准备」页）；天气来自 Open-Meteo，不需要 key。
              the DEEPSEEK_API_KEY environment variable (see the Setup page); weather comes from
              Open-Meteo, which needs no key.
"""
import json

from llm import MODEL, client
from weather_tool import get_weather, tools

QUESTION = "北京和上海现在哪个更暖和？"   # 也可以换成英文 / try English too: "Which is warmer now, Beijing or Shanghai?"
MAX_ROUNDS = 5                             # 最多循环几轮，防止停不下来 / safety cap on rounds


def plain_call(question):
    """A：普通调用，不给工具，只能得到文字。 A plain call without tools: text only."""
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": question}],
    )
    return response.choices[0].message.content


def run_agent(question):
    """B：最小的 Agent 循环：思考 → 行动 → 观察，直到模型不再请求工具。
    A minimal agent loop: think -> act -> observe until the model asks for no more tools.
    """
    messages = [{"role": "user", "content": question}]                     # 感知 / perceive
    for round_no in range(1, MAX_ROUNDS + 1):
        response = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)
        reply = response.choices[0].message                                # 思考 / think
        thought = getattr(reply, "reasoning_content", None)                # DeepSeek 的思考过程 / DeepSeek's reasoning
        if thought:
            print(f"  第 {round_no} 轮 / round {round_no} [思考 think] {thought[:60].strip()}...")
        messages.append(reply.model_dump())
        if not reply.tool_calls:                                           # 不再需要工具 → 回答 / no tool needed -> answer
            print(f"  第 {round_no} 轮 / round {round_no}: 不再请求工具，给出回答 / no more tools, answering")
            return reply.content
        for call in reply.tool_calls:                                      # 可能一次请求好几个 / maybe several at once
            args = json.loads(call.function.arguments)
            print(f"  第 {round_no} 轮 / round {round_no} [请求 request] {call.function.name}({args})")
            # 行动：我们的代码执行工具。网络出错时 get_weather 会返回一句错误说明，它同样会交回模型
            # Act: OUR code runs the tool. On a network error get_weather returns an error message,
            # which goes back to the model just the same
            result = get_weather(**args)
            print(f"  第 {round_no} 轮 / round {round_no} [观察 observe] {result}")
            messages.append({"role": "tool", "tool_call_id": call.id, "content": str(result)})
    return "（达到最大轮数，停止 / hit the round limit, stopping）"


if __name__ == "__main__":
    print("问题 / Question:", QUESTION)

    print("\n=== A. 普通调用（没有工具）/ Plain call (no tools) ===")
    print(plain_call(QUESTION))

    print("\n=== B. Agent 循环（有查天气工具）/ Agent loop (with a weather tool) ===")
    answer = run_agent(QUESTION)
    print("\n回答 / Answer:", answer)
