"""第 09 节练习：async 写法 + 用 asyncio.gather 同时运行几个 Agent（TODO 版）
Lesson 09 exercise: async code + running several agents at once with asyncio.gather (TODO version)

目标 / Goal:
    把 08 节的同步写法改成 async 写法，再让三个 Agent 同时工作。
    Turn lesson 08's synchronous code into async code, then let three agents work at the same time.

运行环境 / Environment: .venv  (openai-agents 0.20.0)
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l09_async_todo.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY / the DEEPSEEK_API_KEY environment variable
参考答案 / Solution: l09_async_solution.py
"""
import asyncio
import time

from agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled

from llm import MODEL, async_client

set_tracing_disabled(True)
model = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)

translator = Agent(name="翻译", instructions="把用户的话翻译成英文，只输出译文。", model=model)
poet = Agent(name="诗人", instructions="根据用户给的主题写一句不超过 20 个字的中文短诗，只输出诗句。", model=model)
explainer = Agent(name="解释员", instructions="用一句话向小学生解释用户给的词。", model=model)


# TODO 1: 把 main 定义成异步函数（def 前面加一个关键字）
#         Make main an async function (one keyword before def)
def main():
    # TODO 2: 用 Runner.run 运行 translator，翻译「今天天气真好」，别忘了 await
    #         Run translator with Runner.run on "今天天气真好" - don't forget await
    result = None
    print("单个 / single:", result.final_output)

    start = time.perf_counter()
    # TODO 3: 用 asyncio.gather 同时运行三个 Agent：
    #         translator 翻译「秋天来了」、poet 写「秋天」、explainer 解释「秋分」
    #         Use asyncio.gather to run all three at once:
    #         translator on "秋天来了", poet on "秋天", explainer on "秋分"
    results = []

    for r in results:
        print(f"{r.last_agent.name}: {r.final_output}")
    print(f"三个一起用时 / three at once took {time.perf_counter() - start:.1f} s")


if __name__ == "__main__":
    # TODO 4: 用 asyncio.run 启动 main()
    #         Start main() with asyncio.run
    pass
