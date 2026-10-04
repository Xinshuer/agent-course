"""第 12 节练习参考答案：四个「能力有限」的 Agent + 一个调度 Agent，合作把一个数字变成目标数字
Lesson 12 solution: four limited agents plus one planner agent turn a number into a target number

对应视频 / Matches the video (P13): 30:12 起 / from 30:12
    视频里的例子是从 5 变到 23（5 ×2 → 10 +1 → 11 ×2 → 22 +1 → 23）。
    The video's run goes from 5 to 23 (5 x2 -> 10 +1 -> 11 x2 -> 22 +1 -> 23).
    这里是按视频讲解的结构重写的版本，和视频里的代码不完全一样。
    This is a rewrite following the structure explained in the video, not a copy of its code.

运行环境 / Environment: .venv  (openai-agents 0.20.0)
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l12_number_game_solution.py
需要 / Needs: DEEPSEEK_API_KEY
每一轮调用模型 2 次（调度 + 干活），5 → 23 大约要 9 次。
Each round calls the model twice (planner + worker); 5 -> 23 takes about 9 calls.
"""
import asyncio
import re

from agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled

from llm import MODEL, async_client

set_tracing_disabled(True)
model = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)

# 1. 四个能力有限的 Agent：每个只会一种运算
#    Four limited agents: each knows exactly one operation
WORKER_RULE = "在对话里找到最新的「当前数字」，做完你的运算后只输出结果数字，不要输出任何别的文字。"

add_one = Agent(name="add_one", handoff_description="把当前数字加 1",
                instructions="你只会把数字加 1。" + WORKER_RULE, model=model)
minus_one = Agent(name="minus_one", handoff_description="把当前数字减 1",
                  instructions="你只会把数字减 1。" + WORKER_RULE, model=model)
double = Agent(name="double", handoff_description="把当前数字乘以 2",
               instructions="你只会把数字乘以 2。" + WORKER_RULE, model=model)
half = Agent(name="half", handoff_description="把当前数字除以 2（只能用于偶数）",
             instructions="你只会把数字除以 2。" + WORKER_RULE, model=model)

# 2. 调度 Agent：自己不算，只决定下一步交给谁；目标达成时发出明确的结束信号 DONE
#    The planner never calculates; it only picks who goes next, and says DONE when the target is reached
planner = Agent(
    name="planner",
    instructions="""你是调度员，负责分析和规划，自己不做任何计算。每一轮你只做一件事：
1. 读出当前数字和目标数字；
2. 如果当前数字已经等于目标数字，只回复 DONE 这一个词；
3. 否则想好用最少的步数到达目标，然后把这一步交接给对应的 Agent：
   add_one（加 1）、minus_one（减 1）、double（乘以 2）、half（除以 2，只能用于偶数）；
4. 不要来回做互相抵消的操作（比如加 1 之后马上减 1）。""",
    model=model,
    handoffs=[add_one, minus_one, double, half],
)


async def solve(start, target, max_rounds=10):
    current = start
    print(f"起始数字 / start: {start}   目标数字 / target: {target}")
    for i in range(1, max_rounds + 1):                       # 最多循环 max_rounds 轮，防止死循环
        result = await Runner.run(planner, f"当前数字：{current}，目标数字：{target}。")
        worker = result.last_agent                           # 最后是谁回答的
        if worker is planner:                                # 没有交接：调度员自己回复了
            if "DONE" in result.final_output:                # 收到结束信号，提前结束循环
                print(f"第 {i} 轮 / round {i}: 调度员发出 DONE，完成 / planner says DONE")
                return current
            print(f"第 {i} 轮 / round {i}: 调度员没有交接 / no handoff:", result.final_output)
            continue
        numbers = re.findall(r"-?\d+", result.final_output)  # 从回答里取出数字
        if not numbers:
            print(f"第 {i} 轮 / round {i}: {worker.name} 没有给出数字 / no number:", result.final_output)
            continue
        new = int(numbers[-1])                               # 取最后一个数字，就是结果
        print(f"第 {i} 轮 / round {i}: 交给 / handed to {worker.name}: {current} -> {new}")
        current = new
    print("超过最大轮数，放弃 / too many rounds, giving up")
    return current


if __name__ == "__main__":
    asyncio.run(solve(5, 23))
