r"""第 06 节：完整的终端聊天程序（记忆管理 + 工具调用）
Lesson 06: a complete terminal chat (memory management + tool calls)

- 05 节的工具调用：模型要查天气就执行 get_weather，全部结果存好再问模型（可能连着好几轮）
  Lesson 05's tool calling: run get_weather when asked, store all results, then ask again (maybe several rounds)
- 06 节的记忆管理：每次发送前按 token 数裁剪（滑动窗口，保留 system，开头不留孤立的 tool 消息）
  Lesson 06's memory management: trim by token count before each request (sliding window that keeps the
  system prompt and never starts with an orphaned tool message)

命令 / Commands:
    /history  查看记录 show the record     /tokens  记录有多少 token count tokens
    /clear    清空记录 clear               /exit    退出 quit

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\.venv\Scripts\python.exe l06_chat.py
需要的 key / Key: DEEPSEEK_API_KEY；数 token 用 deepseek_tokenizer（没装时用字数粗略估计）
Token counting uses deepseek_tokenizer (falls back to a rough character count if it isn't installed):
    & ..\.venv\Scripts\python.exe -m pip install deepseek_tokenizer
"""
import json

from llm import MODEL, client
from weather_tool import get_weather, tools

try:
    from deepseek_tokenizer import ds_token
except ImportError:          # 没装分词器时退而求其次 / no tokenizer: fall back to characters
    ds_token = None

MAX_TOKENS = 2000            # 记录超过这么多 token 就裁剪 / trim the record beyond this many tokens
SYSTEM = {"role": "system", "content": "你是一个乐于助人的助手，回答简洁。"}
history = [SYSTEM]


def count_tokens(messages):
    total = 0
    for m in messages:
        text = m.get("content") or ""
        total += len(ds_token.encode(text)) if ds_token else len(text)
    return total


def trim_history(messages, k):
    recent = messages[-k:]
    while recent and recent[0]["role"] == "tool":     # 开头不能是孤立的 tool 消息 / no orphaned tool message first
        recent = recent[1:]
    if (not recent or recent[0]["role"] != "system") and messages[0]["role"] == "system":
        recent = [messages[0]] + recent               # 补回 system / put the system prompt back
    return recent


def fit_history(messages, limit):
    """从大往小试窗口大小 / try window sizes from large to small."""
    if count_tokens(messages) <= limit:
        return messages
    for k in [10, 5, 2, 1]:
        window = trim_history(messages, k)
        if count_tokens(window) <= limit:
            return window
    return trim_history(messages, 1)


def ask_model():
    """把整个 history 发给模型，并把回答存进 history。 Send the history, store the reply."""
    response = client.chat.completions.create(model=MODEL, messages=history, tools=tools)
    reply = response.choices[0].message
    history.append(reply.model_dump())
    return reply


def print_history():
    print(f"\n----- history: {len(history)} -----")
    for i, m in enumerate(history, 1):
        text = (m.get("content") or "").replace("\n", " ")
        print(f"{i:>2}. {m['role']:<9} | {text[:50]}")
        for call in m.get("tool_calls") or []:
            print(f"    {'':<9} |   -> {call['function']['name']}({call['function']['arguments']})")
    print("-" * 30)


def main():
    if ds_token is None:
        print("（没装 deepseek_tokenizer，token 数用字数粗略估计 / no tokenizer: estimating with characters）")
    print("开始对话 / Chat started  (/history, /tokens, /clear, /exit)")
    while True:
        user_input = input("\n你 / You: ").strip()
        if not user_input:
            continue
        if user_input == "/exit":
            break
        if user_input == "/history":
            print_history()
            continue
        if user_input == "/tokens":
            print(f"记录 / record: {len(history)} 条 messages, {count_tokens(history)} tokens (上限 limit {MAX_TOKENS})")
            continue
        if user_input == "/clear":
            history[:] = [SYSTEM]          # 原地清空，但保留 system 消息 / clear in place, keep the system message
            print("（记录已清空 / history cleared）")
            continue

        history.append({"role": "user", "content": user_input})
        before = len(history)
        history[:] = fit_history(history, MAX_TOKENS)   # 发送前先裁剪 / trim before sending
        if len(history) < before:
            print(f"  [记忆管理 memory] 裁掉了 {before - len(history)} 条旧消息 / dropped {before - len(history)} old messages")
        reply = ask_model()
        while reply.tool_calls:            # 模型可能连续调用好几轮工具 / the model may call tools several times
            for call in reply.tool_calls:  # 先把每个结果都存进去 / store every result first
                args = json.loads(call.function.arguments)
                print(f"  [调用工具 tool] {call.function.name}({args})")
                result = get_weather(**args)
                print(f"  [工具结果 result] {result}")
                history.append({"role": "tool", "tool_call_id": call.id, "content": str(result)})
            reply = ask_model()            # 再问一次模型 / then ask the model again
        print("AI:", reply.content)


if __name__ == "__main__":
    main()
