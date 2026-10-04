"""第 12 节练习：四个「能力有限」的 Agent + 一个调度 Agent，合作把一个数字变成目标数字
Lesson 12 exercise: four limited agents plus one planner agent turn a number into a target number

按 TODO 补全代码，写完和 l12_number_game_solution.py 对照。
Fill in the TODOs, then compare with l12_number_game_solution.py.

运行环境 / Environment: .venv  (openai-agents 0.20.0)
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l12_number_game_todo.py
需要 / Needs: DEEPSEEK_API_KEY（5 → 23 大约调用模型 9 次 / about 9 model calls for 5 -> 23）
"""
import asyncio
import re

from agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled

from llm import MODEL, async_client

set_tracing_disabled(True)
model = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)

WORKER_RULE = "在对话里找到最新的「当前数字」，做完你的运算后只输出结果数字，不要输出任何别的文字。"

add_one = Agent(name="add_one", handoff_description="把当前数字加 1",
                instructions="你只会把数字加 1。" + WORKER_RULE, model=model)
# TODO 1: 仿照 add_one 写出 minus_one（减 1）、double（乘以 2）、half（除以 2，只能用于偶数）
#         Write minus_one, double and half the same way

# TODO 2: 写调度 Agent planner：
#   - instructions：自己不计算；当前数字等于目标时只回复 DONE；否则用最少的步数，
#     把这一步交接给对应的 Agent；不要来回做互相抵消的操作
#   - handoffs：四个干活的 Agent
#   The planner: never calculates; replies only DONE when current == target; otherwise hands
#   the next step to the right agent; no back-and-forth moves; handoffs = the four workers


async def solve(start, target, max_rounds=10):
    current = start
    print(f"起始数字 / start: {start}   目标数字 / target: {target}")
    # TODO 3: 用 for i in range(1, max_rounds + 1) 循环：
    #   - 把「当前数字：...，目标数字：...」发给 planner
    #   - result.last_agent 是 planner 本身：如果回复里有 DONE 就 return current，否则 continue
    #   - 否则说明交接给了某个干活的 Agent：用 re.findall(r"-?\d+", ...) 取出回复里的最后一个数字，
    #     打印「交给谁、从几变成几」，更新 current
    #   Loop at most max_rounds times; send the state to planner; stop on DONE;
    #   otherwise read the worker's number and update current
    print("超过最大轮数，放弃 / too many rounds, giving up")
    return current


if __name__ == "__main__":
    asyncio.run(solve(5, 23))
