"""第 09 节练习参考答案：async 写法 + 用 asyncio.gather 同时运行几个 Agent
Lesson 09 solution: async code + running several agents at once with asyncio.gather

做了什么 / What it does:
    1. 在 async def main() 里用 await Runner.run(...) 运行一个 Agent；
    2. 用 asyncio.gather 同时运行三个不同的 Agent，并打印总耗时。
    1. Runs one agent with await Runner.run(...) inside async def main();
    2. Runs three different agents at the same time with asyncio.gather and prints the total time.

运行环境 / Environment: .venv  (openai-agents 0.20.0)
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l09_async_solution.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY / the DEEPSEEK_API_KEY environment variable
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


async def main():
    # 1. 运行一个 Agent：Runner.run 是 async 函数，要 await
    #    One agent: Runner.run is an async function, so await it
    result = await Runner.run(translator, "今天天气真好")
    print("单个 / single:", result.final_output)

    # 2. 同时运行三个：gather 把三个任务一起交给事件循环，按传入的顺序返回结果
    #    Three at once: gather hands all three to the event loop and returns results in order
    start = time.perf_counter()
    results = await asyncio.gather(
        Runner.run(translator, "秋天来了"),
        Runner.run(poet, "秋天"),
        Runner.run(explainer, "秋分"),
    )
    for r in results:
        print(f"{r.last_agent.name}: {r.final_output}")
    print(f"三个一起用时 / three at once took {time.perf_counter() - start:.1f} s")


if __name__ == "__main__":
    asyncio.run(main())
