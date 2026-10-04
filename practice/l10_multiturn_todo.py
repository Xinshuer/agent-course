"""第 10 节练习：用 Agents SDK 实现连续对话（TODO 版，和视频同一个例子）
Lesson 10 exercise: multi-turn conversation with the Agents SDK (TODO version, the video's example)

运行环境 / Environment: .venv  (openai-agents 0.20.0)
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l10_multiturn_todo.py
需要 / Needs: DEEPSEEK_API_KEY
参考答案 / Solution: l10_multiturn_solution.py
"""
from agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled

from llm import MODEL, async_client

set_tracing_disabled(True)

agent = Agent(
    name="助手",
    instructions="你是一个简洁的中文助手，回答尽量简短。",
    model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),
)


def two_separate_runs():
    print("===== 1. 两次独立运行 / two separate runs =====")
    r1 = Runner.run_sync(agent, "1+1等于几？")
    print("AI:", r1.final_output)
    # TODO 1: 再单独运行一次，问「再加一呢？」，打印回答。看看模型能不能接上
    #         Run again on its own with "再加一呢？" and print the answer. Does the model follow?


def continue_with_history():
    print("\n===== 2. 带上历史继续问 / continue with the history =====")
    result = Runner.run_sync(agent, "1+1等于几？")
    print("AI:", result.final_output)

    # TODO 2: 用 result.to_input_list() 得到历史列表 history，并把它打印出来
    #         Get the history list with result.to_input_list() and print it
    history = []

    # TODO 3: 用 append 把新问题 {"role": "user", "content": "再加一呢？"} 加到 history 末尾
    #         Append the new question to the end of history

    # TODO 4: 把整个 history 交给 Runner.run_sync，打印 final_output
    #         Pass the whole history to Runner.run_sync and print final_output

    # TODO 5: 再打印一次 result.to_input_list()，看看最新的完整对话历史
    #         Print result.to_input_list() again to see the latest full history


if __name__ == "__main__":
    two_separate_runs()
    continue_with_history()
