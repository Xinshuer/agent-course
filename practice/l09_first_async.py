"""第 09 节：把第一个例子改成 async 写法（视频 08:57 起）
Lesson 09: the first example rewritten in the async style (video from 08:57)

做了什么 / What it does:
    和 l09_first_run.py 一样导入设置文件、创建不写 model 的 Agent，
    但把 Runner.run_sync 换成 await Runner.run(...)，放进 async def main()，用 asyncio.run 启动。
    Like l09_first_run.py it imports the settings file and creates an Agent without `model`,
    but replaces Runner.run_sync with await Runner.run(...) inside async def main(), started with asyncio.run.

运行环境 / Environment: .venv  (openai-agents 0.20.0)
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l09_first_async.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY / the DEEPSEEK_API_KEY environment variable
"""
import asyncio

from agents import Agent, Runner

import l09_settings  # noqa: F401  导入时设置文件里的代码就执行了 / importing runs the settings code

# 创建 Agent 是普通代码，放在函数外面也可以；只有 await 必须写在 async def 里面
# Creating the agent is plain code and may stay outside; only await must be inside async def
agent = Agent(name="助手", instructions="你是一个简洁的中文助手，回答不超过两句话。")


async def main():
    # run_sync 改成 run，前面加 await / run_sync becomes run, with await in front
    result = await Runner.run(agent, "你是谁？")
    print(result.final_output)


if __name__ == "__main__":
    asyncio.run(main())  # 必须用 asyncio.run 启动；单写 main() 不会运行 / a bare main() would not run
