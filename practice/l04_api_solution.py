"""第 04 节练习参考答案：第一次调用模型 + 流式输出
Lesson 04 solution: your first model call + streaming

运行环境 / Environment: .venv
运行 / Run (在 practice 文件夹里 / from the practice folder):
    cd practice
    & ..\\.venv\\Scripts\\python.exe l04_api_solution.py
需要的 key / Key needed: DEEPSEEK_API_KEY（已在 llm.py 里读取 / read in llm.py）
"""
from llm import MODEL, client

messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "给我讲个笑话，三句话以内。"},
]

if __name__ == "__main__":
    # ---------- 第 1 部分：普通调用 / Part 1: a normal call ----------
    completion = client.chat.completions.create(
        model=MODEL,
        messages=messages,
    )
    print(completion.choices[0].message.content)
    print(f"finish_reason = {completion.choices[0].finish_reason}")
    print(f"本次一共用了 {completion.usage.total_tokens} 个 token / tokens used: {completion.usage.total_tokens}")

    # ---------- 第 2 部分：流式输出 / Part 2: streaming ----------
    print("\n----- stream=True -----")
    stream = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        stream=True,
    )
    full_text = ""
    for chunk in stream:
        piece = chunk.choices[0].delta.content or ""   # 思考阶段的块是 None，换成 "" / thinking chunks carry None
        print(piece, end="", flush=True)                # flush=True：立刻显示 / show it right away
        full_text = full_text + piece
    print()
    print(f"一共收到 {len(full_text)} 个字符 / characters received: {len(full_text)}")
