r"""第 06 节：用 DeepSeek 的分词器数 token
Lesson 06: counting tokens with DeepSeek's tokenizer

视频里先用 pip 装好 DeepSeek 的分词器，再导入、编码、看长度。这里用 PyPI 上的 deepseek_tokenizer
（纯 Python，自带 deepseek-flash 所属的 DeepSeek V4 系列分词器）。先在终端里安装一次：
The video installs DeepSeek's tokenizer with pip, then imports it, encodes text and takes the length.
This uses deepseek_tokenizer from PyPI (pure Python, bundling the DeepSeek V4 tokenizer used by
deepseek-flash). Install it once in a terminal:

    & ..\.venv\Scripts\python.exe -m pip install deepseek_tokenizer

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\.venv\Scripts\python.exe l06_tokens.py
需要的 key / Key: DEEPSEEK_API_KEY（只有第 3 部分会调用 1 次模型 / only part 3 makes 1 model call）
"""
import sys

try:
    from deepseek_tokenizer import ds_token
except ImportError:
    sys.exit(
        "没找到分词器，请先安装 / tokenizer not installed, run:\n"
        "  & ..\\.venv\\Scripts\\python.exe -m pip install deepseek_tokenizer"
    )


def count_tokens(messages):
    """整段对话的 token 数：每条消息的 content 分词后加起来 / tokens in a whole conversation."""
    total = 0
    for m in messages:
        text = m.get("content") or ""          # content 可能是 None / content may be None
        total += len(ds_token.encode(text))
    return total


if __name__ == "__main__":
    # ---------- 第 1 部分：一句话 / Part 1: one sentence ----------
    ids = ds_token.encode("你是谁？")
    print("编号 / ids:", ids)                   # 这些是 token 的编号，不是数量 / ids, not a count
    print("token 数 / tokens:", len(ids))       # 2
    for i in ids:
        print(" ", i, "->", ds_token.decode([i]))
    print("Who are you? ->", len(ds_token.encode("Who are you?")), "tokens")

    # ---------- 第 2 部分：一整段对话 / Part 2: a whole conversation ----------
    history = [
        {"role": "system", "content": "你是一个专业的旅行助手，回答要简洁，每次不超过三句话。"},
        {"role": "user", "content": "我下个月想去杭州玩三天，请帮我推荐一下必去的景点和当地美食，再告诉我大概要准备多少预算。"},
    ]
    chars = 0
    for m in history:
        chars += len(m["content"])
    print("\n字数 / characters:", chars)
    print("token 数 / tokens:", count_tokens(history))

    # ---------- 第 3 部分：和服务器算的对比（调用 1 次模型）/ Part 3: compare with the server (1 call) ----------
    from llm import MODEL, client

    response = client.chat.completions.create(
        model=MODEL,
        messages=history,
        max_tokens=1,                                     # 只要用量，不要回答 / we only want the usage
        extra_body={"thinking": {"type": "disabled"}},    # 关掉思考，省 token / thinking off to save tokens
    )
    print("\n服务器算的输入 token / prompt_tokens from the server:", response.usage.prompt_tokens)
    print("自己数的 / counted locally:", count_tokens(history))
    print("服务器多出来的是角色标记等格式 token / the extra are formatting tokens such as role markers")
