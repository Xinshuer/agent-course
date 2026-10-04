r"""第 06 节练习参考答案：管理对话记忆——数 token、滑动窗口、摘要
Lesson 06 solution: managing conversation memory - counting tokens, a sliding window, a summary

在 05 节 get_completion 的基础上加上记忆管理：
- count_tokens：用 DeepSeek 的分词器数整段记录有多少 token
- trim_history：滑动窗口，只留最近 k 条，保证 system 提示不被切掉、开头不是孤立的 tool 消息
- fit_history：从大往小试窗口大小（10 -> 5 -> 2 -> 1），直到不超过上限
- summarize_history：让模型把旧对话总结成一条新的 system 提示
- get_completion：发送前先检查 token 数，超了就裁剪
Builds lesson 05's get_completion into one that manages memory: count tokens, trim with a sliding
window that keeps the system prompt, try window sizes from large to small, and summarise old turns.

需要先安装分词器 / Install the tokenizer first:
    & ..\.venv\Scripts\python.exe -m pip install deepseek_tokenizer
运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\.venv\Scripts\python.exe l06_memory_solution.py
需要的 key / Key: DEEPSEEK_API_KEY（会调用 2 次模型 / makes 2 model calls）
"""
import sys

from llm import MODEL, client

try:
    from deepseek_tokenizer import ds_token
except ImportError:
    sys.exit(
        "没找到分词器，请先安装 / tokenizer not installed, run:\n"
        "  & ..\\.venv\\Scripts\\python.exe -m pip install deepseek_tokenizer"
    )

MAX_TOKENS = 300   # 演示用的上下文上限，故意设得很小 / a deliberately small demo limit

message_history = [
    {"role": "system", "content": "你是一个数学老师，回答尽量简短。"},
]


def count_tokens(messages):
    """整段记录的 token 数 / tokens in the whole record."""
    total = 0
    for m in messages:
        total += len(ds_token.encode(m.get("content") or ""))
    return total


def trim_history(messages, k):
    """滑动窗口：只留最近 k 条，并保住 system 提示 / keep the latest k and the system prompt."""
    recent = messages[-k:]
    while recent and recent[0]["role"] == "tool":     # 开头不能是孤立的 tool 消息 / no orphaned tool message first
        recent = recent[1:]
    if (not recent or recent[0]["role"] != "system") and messages[0]["role"] == "system":
        recent = [messages[0]] + recent               # 补回 system / put the system prompt back
    return recent


def fit_history(messages, limit):
    """从大往小试窗口大小，返回第一个不超过 limit 的窗口 / try windows from large to small."""
    if count_tokens(messages) <= limit:
        return messages
    for k in [10, 5, 2, 1]:
        window = trim_history(messages, k)
        if count_tokens(window) <= limit:
            return window
    return trim_history(messages, 1)   # 连 1 条都超：这条消息本身太长 / even one message is too long


def summarize_history(messages):
    """让模型把整段对话（包括 system）总结成一条新的 system 提示 / summarise into one system message."""
    text = ""
    for m in messages:
        text += f"{m['role']}: {m.get('content') or ''}\n"
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": "请把下面这段对话总结成一段话，保留对助手的设定、用户问过的问题和关键结论：\n" + text}],
    )
    summary = response.choices[0].message.content
    return [{"role": "system", "content": "此前对话的总结如下：\n" + summary}]


def get_completion(message):
    """05 节的 get_completion + 记忆管理：发送前超过上限就裁剪 / lesson 05's wrapper plus trimming."""
    message_history.append(message)
    message_history[:] = fit_history(message_history, MAX_TOKENS)   # 原地替换内容 / replace in place
    response = client.chat.completions.create(model=MODEL, messages=message_history)
    reply = response.choices[0].message.model_dump()
    message_history.append(reply)
    return reply


if __name__ == "__main__":
    # 1. 数 token / count tokens
    print("「你是谁？」/ “Who are you?”:", len(ds_token.encode("你是谁？")), "tokens")

    # 2. 一段已经聊了一阵的记录（不调用模型）/ a record that has grown for a while (no model call)
    long_history = message_history + [
        {"role": "user", "content": "一支篮球队上场几个人？"},
        {"role": "assistant", "content": "5 个人。"},
        {"role": "user", "content": "一支排球队上场几个人？"},
        {"role": "assistant", "content": "6 个人。"},
        {"role": "user", "content": "5 乘以 6 等于几？"},
        {"role": "assistant", "content": "等于 30。"},
        {"role": "user", "content": "1 + 1 等于几？"},
        {"role": "assistant", "content": "等于 2。"},
    ]
    print(f"\n记录 / record: {len(long_history)} 条 messages, {count_tokens(long_history)} tokens")
    for k in [10, 5, 2, 1]:
        window = trim_history(long_history, k)
        print(f"  k={k}: {len(window)} 条 messages, {count_tokens(window)} tokens, 第一条 first = {window[0]['role']}")
    fitted = fit_history(long_history, 40)
    print(f"  上限 40 时发送 / with a limit of 40, send: {len(fitted)} 条 messages, {count_tokens(fitted)} tokens")

    # 3. 摘要：整段记录换成一条 system 消息（调用 1 次模型）/ summary (1 model call)
    message_history[:] = summarize_history(long_history)
    print("\n----- 摘要后的记录 / record after summarising -----")
    print(message_history[0]["content"])
    print(f"({len(message_history)} 条 message, {count_tokens(message_history)} tokens)")

    # 4. 接着聊：模型还记得之前问过什么吗？（调用 1 次模型）/ carry on: does it still remember? (1 call)
    reply = get_completion({"role": "user", "content": "我前面一共问过你几道题？分别是什么？"})
    print("\nAI:", reply["content"])
    print(f"现在记录 / record now: {len(message_history)} 条 messages, {count_tokens(message_history)} tokens")
