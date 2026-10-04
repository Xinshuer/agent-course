"""第 10 节练习参考答案：用 Agents SDK 实现连续对话（和视频同一个例子：1+1 等于几 → 再加一呢）
Lesson 10 solution: multi-turn conversation with the Agents SDK (the video's example: 1+1 -> plus one more)

步骤 / Steps:
1. two_separate_runs()：两次互不相关的 Runner.run_sync，第二句「再加一呢？」接不上
   two unrelated Runner.run_sync calls - the follow-up "plus one more?" has no context
2. continue_with_history()：result.to_input_list() 把这一轮变成列表，append 新问题，再运行一次
   result.to_input_list() turns the run into a list; append the new question and run again
3. chat()（可选 / optional）：把同样的做法放进 while True 循环，变成终端聊天程序
   the same idea inside a while True loop - a terminal chat

运行环境 / Environment: .venv  (openai-agents 0.20.0)
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l10_multiturn_solution.py
需要 / Needs: DEEPSEEK_API_KEY
视频里老师用的是谷歌的模型；这里用 DeepSeek（practice/llm.py），写法完全一样。
The video uses a Google model; here we use DeepSeek (practice/llm.py) - the code is the same.
"""
from agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled

from llm import MODEL, async_client

set_tracing_disabled(True)

agent = Agent(
    name="助手",
    instructions="你是一个简洁的中文助手，回答尽量简短。",
    model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),
)


def show(items):
    """把历史列表逐项打印出来（每项最多 120 个字符）。 Print each history item (max 120 characters)."""
    for i, item in enumerate(items):
        print(f"  [{i}]", str(item)[:120])


def two_separate_runs():
    print("===== 1. 两次独立运行 / two separate runs =====")
    r1 = Runner.run_sync(agent, "1+1等于几？")
    print("AI:", r1.final_output)
    r2 = Runner.run_sync(agent, "再加一呢？")     # 模型不知道「再加一」是在什么基础上加 / no context
    print("AI:", r2.final_output)


def continue_with_history():
    print("\n===== 2. 带上历史继续问 / continue with the history =====")
    result = Runner.run_sync(agent, "1+1等于几？")
    print("AI:", result.final_output)

    history = result.to_input_list()                # 这一轮对话 → 一个普通的 Python 列表 / the run as a list
    print("对话历史 / history:")
    show(history)

    history.append({"role": "user", "content": "再加一呢？"})   # 列表里加上新问题 / add the new question
    result = Runner.run_sync(agent, history)        # 把整个列表发过去 / send the whole list
    print("AI:", result.final_output)

    print("最新的完整对话历史 / the latest full history:")
    show(result.to_input_list())


def chat():
    """可选：终端聊天，输入 /exit 退出。 Optional: a terminal chat; type /exit to quit."""
    history = []
    while True:
        text = input("你 / You: ").strip()
        if not text:
            continue
        if text == "/exit":
            break
        history.append({"role": "user", "content": text})
        result = Runner.run_sync(agent, history)
        print("AI:", result.final_output)
        history = result.to_input_list()            # 用这一轮的完整记录替换旧历史 / replace with the full record


if __name__ == "__main__":
    two_separate_runs()
    continue_with_history()
    # chat()   # 想自己聊天就取消注释 / uncomment to chat yourself
