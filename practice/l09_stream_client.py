"""第 09 节演示：不用框架，直接用异步客户端 async_client 做流式输出
Lesson 09 demo: streaming with the plain async client (no framework)

做了什么 / What it does:
    1. 用 await async_client.chat.completions.create(..., stream=True) 拿到一个流，
       用 async for 一块一块地打印回答；
    2. 用 asyncio.gather 同时问两个问题（不流式），比较耗时。
    1. Gets a stream with await async_client.chat.completions.create(..., stream=True)
       and prints the answer chunk by chunk with async for;
    2. Asks two questions at the same time (not streamed) with asyncio.gather and times it.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l09_stream_client.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY / the DEEPSEEK_API_KEY environment variable
"""
import asyncio
import time

from llm import MODEL, async_client


async def stream_answer(question):
    stream = await async_client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": question}],
        stream=True,
    )
    async for chunk in stream:
        piece = chunk.choices[0].delta.content    # 这一块新增的文字，可能是 None / new text, may be None
        if piece:
            print(piece, end="", flush=True)
    print()


async def ask(question):
    response = await async_client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": question}],
    )
    return response.choices[0].message.content


async def main():
    print("--- 1. 流式 / streaming ---")
    await stream_answer("用三句话介绍一下 Python 的 asyncio。")

    print("\n--- 2. 并发 / concurrent ---")
    start = time.perf_counter()
    answers = await asyncio.gather(ask("用一句话解释什么是协程"), ask("用一句话解释什么是事件循环"))
    for a in answers:
        print("-", a)
    print(f"两个问题一起用时 / both together took {time.perf_counter() - start:.1f} s")


if __name__ == "__main__":
    asyncio.run(main())
