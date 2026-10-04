"""第 03 节演示：ReAct（走一步看一步）和简化版 ReWOO（先规划好再一口气执行）
Lesson 03 demo: ReAct (one step at a time) vs a simplified ReWOO (plan first, then execute in one go)

同一个问题「北京、上海、广州今天哪里最暖和？」分别用两种策略来做，最后比较：
调用了几次大模型、调用了几次工具、一共花了多少秒。
The same question ("Which is warmest today: Beijing, Shanghai or Guangzhou?") is answered with both
strategies; at the end we compare LLM calls, tool calls and seconds taken.

- ReAct：系统提示词要求「每次只调用一个工具，看到结果再决定下一步」，所以大约要调用 N+1 次大模型。
  ReAct: the system prompt asks for "one tool per step, decide the next step after seeing the result",
  so it takes about N+1 LLM calls.
- 简化版 ReWOO：规划器用一次带 tools 的调用，让模型把要查的城市一次性全部列出来（这就是计划）；
  执行器照着计划查天气（不调用大模型）；求解器再调用一次大模型给出答案。固定 2 次大模型调用。
  Simplified ReWOO: the planner makes one call with tools so the model lists every lookup at once
  (that is the plan); the worker runs them (no LLM calls); the solver makes one more call for the
  answer. Always 2 LLM calls.
  论文里的 ReWOO 写的是文字计划，后面的步骤可以用 #E1 这样的记号引用前面的结果；这个简化版做不到。
  The paper's ReWOO writes a text plan whose later steps can refer to earlier results (#E1); this
  simplified version can't.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l03_react_vs_rewoo.py
需要 / Needs: DEEPSEEK_API_KEY（见「环境准备」页 / see the Setup page）。一次运行大约调用模型 6 次。
    About 6 model calls per run. 查天气用 Open-Meteo，不需要 key / the weather lookup needs no key.
注意 / Note: deepseek-flash 默认是思考模式，每次调用都要先「想」一会儿，所以调用次数越多越慢。
    deepseek-flash thinks before every answer by default, so more calls means noticeably more time.
    现在的模型能在一条回复里同时要好几个工具调用（并行工具调用）。实测 deepseek-flash 即使被要求
    「每次只调用一个」，也常常一次就把三个城市都要了，ReAct 就成了 2 次调用，和 ReWOO 一样。
    为了看清论文里「走一步看一步」的 ReAct，react() 每轮只执行模型要的第一个工具，其余的等它看到
    结果后再决定（把 STRICT_ONE_STEP 改成 False，就能看到模型自己的做法）。
    Today's models can request several tool calls in one reply (parallel tool calls). In tests,
    deepseek-flash often asks for all three cities at once even when told to call one tool per step,
    so ReAct ends up with 2 calls, just like ReWOO. To show the paper's one-step-at-a-time ReAct,
    react() runs only the first requested tool each round and lets the model decide on the rest after
    seeing that result (set STRICT_ONE_STEP to False to see what the model does on its own).

试一试 / Try it: 在 QUESTION 里再加两个城市，看哪种做法的大模型调用次数会跟着变。
    Add two more cities to QUESTION and see whose LLM-call count grows.
"""
import json
import time

from llm import MODEL, client
from weather_tool import get_weather, tools

QUESTION = "北京、上海、广州今天哪里最暖和？请说明三地的气温。"

REACT_SYSTEM = (
    "你是天气助手，按 ReAct 的方式工作：先思考下一步需要什么信息，再调用工具，看到结果后再思考。"
    "每次最多只调用一个工具；信息够了就直接给出最终回答。"
)
PLANNER_SYSTEM = "你是规划器（Planner）：一次性列出回答问题需要的全部工具调用，不要等任何结果。"
STRICT_ONE_STEP = True    # ReAct 每轮只执行一个工具 / ReAct runs one tool per round


def run_tool(call):
    """执行模型要求的一个工具调用，返回结果文字。 Run one requested tool call and return the result as text."""
    args = json.loads(call.function.arguments)
    result = get_weather(**args)        # weather_tool 出错时会返回一段说明文字 / returns an error string on failure
    print(f"    工具 / tool: {call.function.name}({args}) → {result}")
    return str(result)


def react(question, max_rounds=8):
    """ReAct：推理 → 行动 → 观察，一轮一轮来。返回 (回答, 大模型调用次数, 工具调用次数)。
    ReAct: reason -> act -> observe, round by round. Returns (answer, LLM calls, tool calls)."""
    messages = [{"role": "system", "content": REACT_SYSTEM}, {"role": "user", "content": question}]
    llm_calls = 0
    tool_calls = 0
    for _ in range(max_rounds):                                    # 最多循环几轮 / a cap on the loop
        reply = client.chat.completions.create(model=MODEL, messages=messages, tools=tools).choices[0].message
        llm_calls += 1
        print(f"  大模型第 {llm_calls} 次 / LLM call {llm_calls}: "
              f"{'调用工具 / tool call' if reply.tool_calls else '最终回答 / final answer'}")
        if not reply.tool_calls:                                   # 信息够了 / enough information
            return reply.content, llm_calls, tool_calls
        assistant = reply.model_dump()
        if STRICT_ONE_STEP and len(reply.tool_calls) > 1:          # 一次要了好几个：只留第一个 / keep only the first
            print(f"    （模型一次要了 {len(reply.tool_calls)} 个工具，这一轮只执行第 1 个"
                  f" / the model asked for {len(reply.tool_calls)} tools; running only the first this round）")
            assistant["tool_calls"] = assistant["tool_calls"][:1]    # 记录里也只留这一个 / the record keeps just this one
        messages.append(assistant)
        for call in reply.tool_calls[:len(assistant["tool_calls"])]:   # 行动 + 观察 / act + observe
            result = run_tool(call)
            tool_calls += 1
            messages.append({"role": "tool", "tool_call_id": call.id, "content": result})
    return f"（超过 {max_rounds} 轮，停止 / stopped after {max_rounds} rounds）", llm_calls, tool_calls


def rewoo(question):
    """简化版 ReWOO：规划 → 执行 → 求解。返回 (回答, 大模型调用次数, 工具调用次数)。
    Simplified ReWOO: plan -> work -> solve. Returns (answer, LLM calls, tool calls)."""
    # ① 规划器：1 次大模型调用，一次性列出全部工具调用 / Planner: 1 LLM call listing every tool call
    plan = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "system", "content": PLANNER_SYSTEM}, {"role": "user", "content": question}],
        tools=tools,
    ).choices[0].message
    planned = plan.tool_calls or []
    print(f"  大模型第 1 次（规划器）/ LLM call 1 (planner): 计划了 {len(planned)} 个工具调用 / planned {len(planned)} tool calls")

    # ② 执行器：照计划执行，不调用大模型 / Worker: run the plan, no LLM calls
    evidence = []
    for i, call in enumerate(planned, start=1):
        evidence.append(f"#E{i} {call.function.name}({call.function.arguments}) = {run_tool(call)}")

    # ③ 求解器：1 次大模型调用，根据全部证据回答 / Solver: 1 LLM call answering from all the evidence
    solver_prompt = (
        f"问题：{question}\n"
        "下面是按计划调用工具得到的证据（经纬度对应的城市请你自己判断）：\n"
        + "\n".join(evidence)
        + "\n请只根据这些证据回答问题。"
    )
    answer = client.chat.completions.create(
        model=MODEL, messages=[{"role": "user", "content": solver_prompt}]
    ).choices[0].message.content
    print("  大模型第 2 次（求解器）/ LLM call 2 (solver)")
    return answer, 2, len(planned)


if __name__ == "__main__":
    results = {}
    for name, strategy in [("ReAct", react), ("ReWOO", rewoo)]:
        print("=" * 60)
        print(name)
        start = time.perf_counter()
        answer, llm_calls, tool_calls = strategy(QUESTION)
        seconds = time.perf_counter() - start
        results[name] = (llm_calls, tool_calls, seconds)
        print("  回答 / answer:", answer)

    print("=" * 60)
    print("对比 / comparison")
    for name, (llm_calls, tool_calls, seconds) in results.items():
        print(f"  {name:<6} 大模型 LLM calls: {llm_calls}   工具 tool calls: {tool_calls}   耗时 time: {seconds:.1f} s")
