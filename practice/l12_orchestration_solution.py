"""第 12 节练习参考答案：多 Agent 的三种编排——顺序、并行、路由（交接）
Lesson 12 solution: three ways to orchestrate agents - sequential, parallel and routing (handoffs)

对应视频 / Matches the video (P13):
    03:40 顺序 sequential    07:21 并行 parallel    15:50 路由（交接）routing (handoffs)

运行环境 / Environment: .venv  (openai-agents 0.20.0)
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l12_orchestration_solution.py
需要 / Needs: DEEPSEEK_API_KEY
完整跑一遍大约调用模型 12 次。只想跑其中一部分，就把 PARTS 里不需要的名字删掉。
A full run calls the model about 12 times. To run only some parts, delete names from PARTS.
"""
import asyncio
import time

from agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled

from llm import MODEL, async_client

set_tracing_disabled(True)
model = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)

PARTS = ["seq", "par", "route"]          # 要运行的部分 / which parts to run
QUESTION = "太阳绕着地球转，还是地球绕着太阳转？"

# ---------------------------------------------------------------- 1. 顺序 / sequential
# A 负责回答，B 负责把 A 的答案讲清楚：B 的输入不是用户的问题，而是 A 的答案
# A answers; B explains A's answer: B's input is A's answer, not the user's question
answer_agent = Agent(
    name="answer_agent",
    instructions="用中文简短回答用户的问题，不超过两句话。",
    model=model,
)
explain_agent = Agent(
    name="explain_agent",
    instructions="你会收到一个问题的答案。请对这个答案做扩展和补充说明，让中学生也能看懂，不超过 120 字。",
    model=model,
)


async def run_sequential():
    r1 = await Runner.run(answer_agent, QUESTION)
    print("A 的答案 / A's answer:", r1.final_output)
    r2 = await Runner.run(explain_agent, r1.final_output)     # 上一个的输出 = 下一个的输入
    print("B 的扩展 / B's explanation:", r2.final_output)


# ---------------------------------------------------------------- 2. 并行 / parallel
# 三个 Agent 用三种语言回答同一个问题，彼此之间没有依赖，可以同时跑
# Three agents answer the same question in three languages; no dependencies, so they can run together
chinese_agent = Agent(
    name="chinese_agent",                     # name 只用英文字母、数字、下划线
    handoff_description="只用中文回答问题",    # 第 3 部分交接时用：告诉前台它擅长什么
    instructions="Answer ONLY in Chinese, in one or two sentences.",
    model=model,
)
english_agent = Agent(
    name="english_agent",
    handoff_description="Answers ONLY in English",
    instructions="Answer ONLY in English, in one or two sentences.",
    model=model,
)
korean_agent = Agent(
    name="korean_agent",
    handoff_description="只用韩语回答问题",
    instructions="Answer ONLY in Korean, in one or two sentences.",
    model=model,
)


async def run_parallel():
    # 先一个接一个地跑，记下用时 / one after another first, and time it
    t1 = time.time()
    await Runner.run(chinese_agent, QUESTION)
    await Runner.run(english_agent, QUESTION)
    await Runner.run(korean_agent, QUESTION)
    t2 = time.time()
    print(f"一个接一个 / one by one: {t2 - t1:.1f} s")

    # 再用 asyncio.gather 同时跑 / then all at once with asyncio.gather
    t1 = time.time()
    r1, r2, r3 = await asyncio.gather(
        Runner.run(chinese_agent, QUESTION),
        Runner.run(english_agent, QUESTION),
        Runner.run(korean_agent, QUESTION),
    )
    t2 = time.time()
    print(f"同时运行 / all at once: {t2 - t1:.1f} s")
    for r in (r1, r2, r3):
        print(f"  [{r.last_agent.name}] {r.final_output}")


# ---------------------------------------------------------------- 3. 路由（交接）/ routing (handoffs)
# 前台自己不回答，只根据用户用的语言把问题交给合适的 Agent
# The front desk never answers; it hands the question to the agent that matches the user's language
front_desk = Agent(
    name="front_desk",
    instructions="你是前台助手。你自己不回答任何问题，而是根据用户使用的语言，把问题交接给合适的 Agent。",
    model=model,
    handoffs=[chinese_agent, english_agent, korean_agent],
)


async def run_route(question):
    print("问题 / question:", question)
    result = Runner.run_streamed(front_desk, question)       # 不要 await（见第 09 节）
    async for event in result.stream_events():               # 边运行边看发生了什么
        if event.type == "agent_updated_stream_event":
            print("  [当前 Agent / agent]", event.new_agent.name)
        elif event.type == "run_item_stream_event":
            if event.name == "handoff_requested":            # 模型发出了「交接」工具调用
                print("  [请求交接 / handoff call]", event.item.raw_item.name)
            elif event.name == "handoff_occured":            # SDK 里就是这样拼的（少一个 r）
                print("  [交接完成 / handed off]", event.item.source_agent.name, "->", event.item.target_agent.name)
    print("最后回答的 / answered by:", result.last_agent.name)
    print("回答 / answer:", result.final_output)


async def main():
    if "seq" in PARTS:
        print("===== 1. 顺序 / sequential =====")
        await run_sequential()
    if "par" in PARTS:
        print("===== 2. 并行 / parallel =====")
        await run_parallel()
    if "route" in PARTS:
        print("===== 3. 路由 / routing =====")
        await run_route(QUESTION)                                        # 中文问题 / Chinese
        await run_route("태양이 지구를 도나요, 아니면 지구가 태양을 도나요?")   # 韩语问题 / Korean


if __name__ == "__main__":
    asyncio.run(main())
