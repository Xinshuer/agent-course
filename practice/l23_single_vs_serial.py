"""第 23 节演示：单智能体 vs 两个 Agent 串行接力
Lesson 23 demo: one agent vs two agents working in series

视频里老师举的串行例子：第一个模型先写出基础版本，第二个更擅长中文写作的模型接着加工。
这里两个 Agent 都用 DeepSeek，靠不同的 system 提示词分工（起草人 / 公文写作专家），
对比两种做法的结果、调用次数、token 数和耗时。
The video's serial example: one model writes a basic version, a second model that is better at
Chinese writing polishes it. Here both agents use DeepSeek and differ only by their system prompts
(drafter / official-writing expert). The script compares the results, number of calls, tokens and time.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l23_single_vs_serial.py
会调用 3 次真实模型（DeepSeek），花费极少；不需要其他 key。
Makes 3 real (very cheap) DeepSeek calls; no other key needed.
"""
import time

from llm import MODEL, client

# 想模仿视频里「两个不同的模型」，可以把这里改成 "deepseek-v4-pro"
# To mimic the video's "two different models", change this to "deepseek-v4-pro"
EDITOR_MODEL = MODEL

TASK = "通知全体员工：本周五下午 3 点在 302 会议室参加消防安全培训，请准时到场。"


def run_agent(system_prompt, task, model=MODEL):
    """一个最简单的「Agent」：自己的 system 提示词 + 一个任务，调用一次模型。
    A minimal "agent": its own system prompt + one task, one model call.
    返回 (回答, 这次用掉的 token 数) / returns (answer, tokens used)."""
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": task},
        ],
    )
    return response.choices[0].message.content, response.usage.total_tokens


if __name__ == "__main__":
    print("任务 / Task:", TASK)

    # ---------- 方案一：单智能体，一次调用 / Option 1: one agent, one call ----------
    start = time.perf_counter()  # 记下开始的时间（秒）/ remember the start time (seconds)
    answer, tokens = run_agent("你是办公室助理，把用户的要求写成一则简短的通知。", TASK)
    single_seconds = time.perf_counter() - start
    print("\n【单智能体 / single agent】\n" + answer)

    # ---------- 方案二：两个 Agent 串行接力 / Option 2: two agents in series ----------
    start = time.perf_counter()
    draft, t1 = run_agent("你是办公室助理，先列出通知要点，再写一份简短的初稿。", TASK)
    final, t2 = run_agent(
        "你是公文写作专家。把收到的初稿改成格式规范、语气正式的通知，只输出改好的通知。",
        draft,                      # 第一个 Agent 的输出 = 第二个 Agent 的输入 / output of agent 1 = input of agent 2
        model=EDITOR_MODEL,
    )
    serial_seconds = time.perf_counter() - start
    print("\n【串行·初稿 / serial: draft】\n" + draft)
    print("\n【串行·定稿 / serial: final】\n" + final)

    print("\n" + "-" * 50)
    print(f"单智能体 single : 调用 1 次 call , {tokens:>5} tokens, {single_seconds:5.1f} s")
    print(f"串行接力 serial : 调用 2 次 calls, {t1 + t2:>5} tokens, {serial_seconds:5.1f} s")
    print("多一个 Agent，就多一次推理：token 和等待时间都会叠加。质量是否值得，要按场景判断。")
    print("One more agent means one more inference: tokens and waiting time add up. Whether the "
          "quality is worth it depends on the task.")
