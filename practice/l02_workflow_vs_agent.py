"""第 02 节补充演示（视频里没有讲「工作流」）：同一个问题，工作流和智能体分别怎么处理
Lesson 02 extra demo (the video doesn't cover workflows): how a workflow and an agent handle the same question

- 工作流：步骤由程序员写死（固定查北京气温 → 让模型写一句穿衣建议），不管你问什么都走这条路。
  Workflow: the steps are fixed by the programmer (always fetch Beijing's temperature -> ask the model
  for clothing advice), whatever you ask.
- 智能体：把天气工具交给模型，由模型决定要不要查、查哪里。
  Agent: the model gets the weather tool and decides whether to use it, and for which place.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l02_workflow_vs_agent.py
需要 / Needs: DEEPSEEK_API_KEY（见「环境准备」页 / see the Setup page）。查天气用 Open-Meteo，不需要 key。
    The weather lookup uses Open-Meteo and needs no key. One run makes about 5 model calls.
    Open-Meteo 偶尔会断开连接：get_weather 会自动重试 3 次，还不行就返回一段错误说明（不会报错退出）。
    这时工作流在第 1 步就停下（固定流程没有备用方案），智能体则把错误说明当作观察交给模型，由模型决定怎么办。
    Open-Meteo sometimes drops the connection: get_weather retries 3 times and then returns an error
    message instead of crashing. The workflow then stops at step 1 (a fixed flow has no fallback),
    while the agent hands the message to the model as an observation and lets the model decide.

试一试 / Try it: 改一改下面的 QUESTIONS，先猜两种方式各会怎么做，再运行验证。
    Edit QUESTIONS below, predict what each approach will do, then run it to check.
代码细节 05–06 节才讲，现在只需要看懂输出。
    The code details come in lessons 05-06; for now, just read the output.
"""
import json

from llm import MODEL, client
from weather_tool import get_weather, tools

QUESTIONS = ["上海现在多少度？", "你好，用一句话介绍你自己。"]


def ask(prompt):
    """调用一次模型，返回文字回答。 Call the model once and return its text."""
    response = client.chat.completions.create(model=MODEL, messages=[{"role": "user", "content": prompt}])
    return response.choices[0].message.content


def workflow(question):
    """工作流：不管问什么，都走同一条固定路线。 A workflow: the same fixed route for every question."""
    temp = get_weather(39.9042, 116.4074)                          # 第 1 步（写死）：查北京气温 / step 1 (fixed)
    print(f"    [工作流 第 1 步] 查北京气温 / Beijing temperature → {temp}")
    if isinstance(temp, str):                                      # 查不到时返回的是一段错误说明 / an error message
        return "（第 1 步失败，固定流程没有备用方案，到此结束 / step 1 failed and a fixed flow has no fallback）"
    return ask(f"北京现在 {temp}°C。请用一句话给出穿衣建议。")       # 第 2 步（写死）：让模型写建议 / step 2 (fixed)


def agent(question, max_rounds=5):
    """智能体：模型自己决定要不要调用工具、参数填什么。 An agent: the model decides whether to call a tool and how."""
    messages = [{"role": "user", "content": question}]
    for _ in range(max_rounds):                                    # 最多转几轮，防止停不下来 / a cap on the loop
        reply = client.chat.completions.create(model=MODEL, messages=messages, tools=tools).choices[0].message
        if not reply.tool_calls:                                   # 模型决定：不需要（再）用工具 / no (more) tools
            print("    [智能体的决定] 不再调用工具，给出回答 / no (more) tools: answer")
            return reply.content
        messages.append(reply.model_dump())                        # 模型决定：先调用工具 / call a tool first
        for call in reply.tool_calls:
            args = json.loads(call.function.arguments)
            result = get_weather(**args)                           # 查不到时是一段错误说明，同样当作观察交回模型
                                                                   # an error message is an observation too
            print(f"    [智能体的决定] 调用 {call.function.name}({args}) → {result}")
            messages.append({"role": "tool", "tool_call_id": call.id, "content": str(result)})
    return f"（超过 {max_rounds} 轮，停止 / stopped after {max_rounds} rounds）"


if __name__ == "__main__":
    for question in QUESTIONS:
        print("=" * 60)
        print("问题 / Question:", question)
        print("  ① 工作流 / workflow")
        print("    回答 / answer:", workflow(question))
        print("  ② 智能体 / agent")
        print("    回答 / answer:", agent(question))
