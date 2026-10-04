"""第 12 节练习：多 Agent 的三种编排——顺序、并行、路由（交接）
Lesson 12 exercise: three ways to orchestrate agents - sequential, parallel and routing (handoffs)

按 TODO 补全代码，写完和 l12_orchestration_solution.py 对照。
Fill in the TODOs, then compare with l12_orchestration_solution.py.

运行环境 / Environment: .venv  (openai-agents 0.20.0)
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l12_orchestration_todo.py
需要 / Needs: DEEPSEEK_API_KEY
只想跑其中一部分，就把 PARTS 里不需要的名字删掉。/ Delete names from PARTS to run only some parts.
"""
import asyncio
import time

from agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled

from llm import MODEL, async_client

set_tracing_disabled(True)
model = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)

PARTS = ["seq", "par", "route"]
QUESTION = "太阳绕着地球转，还是地球绕着太阳转？"

# ---------------------------------------------------------------- 1. 顺序 / sequential
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
    # TODO 1: 先用 answer_agent 回答 QUESTION，打印它的 final_output
    #         Run answer_agent on QUESTION and print its final_output
    # TODO 2: 再把上一步的 final_output 作为 explain_agent 的输入，打印结果
    #         Then feed that final_output into explain_agent and print the result
    pass


# ---------------------------------------------------------------- 2. 并行 / parallel
chinese_agent = Agent(
    name="chinese_agent",
    handoff_description="只用中文回答问题",
    instructions="Answer ONLY in Chinese, in one or two sentences.",
    model=model,
)
# TODO 3: 仿照 chinese_agent，再写 english_agent 和 korean_agent（name 只用英文字母、数字、下划线）
#         Write english_agent and korean_agent the same way (letters, digits and underscores in name)


async def run_parallel():
    # TODO 4: 用 time.time() 记录开始和结束时间，一个接一个地跑三个 Agent，打印用时
    #         Time three agents run one after another with time.time() and print the duration
    # TODO 5: 用 asyncio.gather 同时跑三个 Agent，结果拆成 r1, r2, r3，打印用时和三个回答
    #         Run all three at once with asyncio.gather, unpack into r1, r2, r3, print time and answers
    pass


# ---------------------------------------------------------------- 3. 路由（交接）/ routing (handoffs)
# TODO 6: 创建 front_desk：instructions 写明「自己不回答，按用户的语言交接给合适的 Agent」，
#         handoffs 里放上三个语言 Agent
#         Create front_desk: it never answers itself and hands over by the user's language;
#         put the three language agents in handoffs


async def run_route(question):
    print("问题 / question:", question)
    # TODO 7: 用 Runner.run_streamed 运行 front_desk（不要 await），
    #         用 async for 遍历 result.stream_events()：
    #         - event.type == "agent_updated_stream_event" 时打印 event.new_agent.name
    #         - event.type == "run_item_stream_event" 且 event.name == "handoff_requested" 时
    #           打印 event.item.raw_item.name（交接工具的名字）
    #         Run front_desk with Runner.run_streamed (no await) and loop over result.stream_events()
    # TODO 8: 循环结束后打印 result.last_agent.name 和 result.final_output
    #         After the loop print result.last_agent.name and result.final_output
    pass


async def main():
    if "seq" in PARTS:
        print("===== 1. 顺序 / sequential =====")
        await run_sequential()
    if "par" in PARTS:
        print("===== 2. 并行 / parallel =====")
        await run_parallel()
    if "route" in PARTS:
        print("===== 3. 路由 / routing =====")
        await run_route(QUESTION)
        await run_route("태양이 지구를 도나요, 아니면 지구가 태양을 도나요?")


if __name__ == "__main__":
    asyncio.run(main())
