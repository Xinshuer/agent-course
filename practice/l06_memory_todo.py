r"""第 06 节练习：管理对话记忆——数 token、滑动窗口、摘要（TODO 版）
Lesson 06 exercise: managing conversation memory - counting tokens, a sliding window, a summary (TODO version)

补全三个函数，它们会被接进 05 节的 get_completion：发送前超过 token 上限就裁剪。
Complete three functions; they plug into lesson 05's get_completion, which trims before sending.

需要先安装分词器 / Install the tokenizer first:
    & ..\.venv\Scripts\python.exe -m pip install deepseek_tokenizer
运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\.venv\Scripts\python.exe l06_memory_todo.py
参考答案 / Solution: l06_memory_solution.py
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

MAX_TOKENS = 300   # 演示用的上下文上限 / a small demo limit

message_history = [
    {"role": "system", "content": "你是一个数学老师，回答尽量简短。"},
]


def count_tokens(messages):
    # TODO 1: 遍历 messages，取出每条的 content（可能是 None，用 m.get("content") or ""），
    #         用 len(ds_token.encode(...)) 数 token，加起来返回
    #         Loop over messages, take each content (may be None: m.get("content") or ""),
    #         count it with len(ds_token.encode(...)) and return the total
    return 0


def trim_history(messages, k):
    # TODO 2: recent = messages[-k:]
    #         如果 recent 的第一条不是 system，而 messages 的第一条是 system，就把它补回最前面
    #         （进阶：开头是 tool 消息时先把它们去掉）
    #         recent = messages[-k:]; if its first item isn't system but messages[0] is, put it back in front
    #         (bonus: drop leading tool messages first)
    return messages


def fit_history(messages, limit):
    """从大往小试窗口大小（已写好）/ try windows from large to small (done for you)."""
    if count_tokens(messages) <= limit:
        return messages
    for k in [10, 5, 2, 1]:
        window = trim_history(messages, k)
        if count_tokens(window) <= limit:
            return window
    return trim_history(messages, 1)


def summarize_history(messages):
    # TODO 3: 用 for 循环把每条消息拼成 "role: content" 一行行的文字（text += f"..."）；
    #         调用模型，请它总结这段文字；
    #         返回 [{"role": "system", "content": "此前对话的总结如下：\n" + summary}]
    #         Build "role: content" lines with a for loop, ask the model to summarise them,
    #         and return a list holding one system message with the summary
    return messages


def get_completion(message):
    """05 节的 get_completion + 记忆管理（已写好）/ lesson 05's wrapper plus trimming (done for you)."""
    message_history.append(message)
    message_history[:] = fit_history(message_history, MAX_TOKENS)
    response = client.chat.completions.create(model=MODEL, messages=message_history)
    reply = response.choices[0].message.model_dump()
    message_history.append(reply)
    return reply


if __name__ == "__main__":
    print("「你是谁？」/ “Who are you?”:", len(ds_token.encode("你是谁？")), "tokens")   # 应该是 2 / should be 2

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
        # 补全后：每一行的第一条都应该是 system / once done, every line should start with system
        print(f"  k={k}: {len(window)} 条 messages, {count_tokens(window)} tokens, 第一条 first = {window[0]['role']}")

    message_history[:] = summarize_history(long_history)   # 补全后只剩 1 条 / once done: 1 message left
    print("\n摘要后 / after summarising:", len(message_history), "条 messages")
    print(message_history[0]["content"])

    reply = get_completion({"role": "user", "content": "我前面一共问过你几道题？分别是什么？"})
    print("\nAI:", reply["content"])
