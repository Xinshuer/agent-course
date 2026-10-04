"""第 09 节：看看流式运行时到底会收到哪些事件（视频里也这样把所有事件打印出来看）
Lesson 09: see which events a streamed run actually produces (the video prints them all, too)

做了什么 / What it does:
    用 Runner.run_streamed 让 Agent 讲一个很短的故事，把每个事件的种类打印出来。
    连续重复的同一种事件合并成一行，并显示出现了几次（否则一个字一行，太长）。
    Runs an agent with Runner.run_streamed on a very short story and prints the kind of every event.
    Consecutive repeats of the same kind are merged into one line with a count
    (otherwise there would be one line per piece of text).

运行环境 / Environment: .venv  (openai-agents 0.20.0)
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l09_events.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY / the DEEPSEEK_API_KEY environment variable
"""
import asyncio

from agents import Agent, Runner

import l09_settings  # noqa: F401  全局设置（DeepSeek、Chat Completions、关追踪、默认模型名）

agent = Agent(name="讲故事的人", instructions="你会讲简短有趣的小故事。")


def describe(event):
    """把一个事件变成一行简短的说明 / Turn one event into a short one-line description."""
    if event.type == "raw_response_event":           # 模型发来的原始片段 / raw pieces from the model
        return f"raw_response_event         {type(event.data).__name__}"
    if event.type == "run_item_stream_event":        # Runner 完成了完整的一步 / Runner finished a whole step
        return f"run_item_stream_event      {event.name}"
    return f"agent_updated_stream_event {event.new_agent.name}"   # 当前 Agent 变了 / the agent changed


async def main():
    result = Runner.run_streamed(agent, "讲一个 50 字以内的小故事。")   # 不要 await / no await
    previous, count = None, 0
    async for event in result.stream_events():
        line = describe(event)
        if line == previous:            # 和上一个事件同一种：只计数 / same kind as before: just count it
            count += 1
            continue
        if previous:
            print(f"{previous}  x{count}")
        previous, count = line, 1
    print(f"{previous}  x{count}")
    print("\n完整回答 / final output:", result.final_output)


if __name__ == "__main__":
    asyncio.run(main())
