"""第 04 节练习：第一次调用模型 + 流式输出（TODO 版）
Lesson 04 exercise: your first model call + streaming (TODO version)

运行环境 / Environment: .venv
运行 / Run (在 practice 文件夹里 / from the practice folder):
    cd practice
    & ..\\.venv\\Scripts\\python.exe l04_api_todo.py
参考答案 / Solution: l04_api_solution.py
需要的 key / Key needed: DEEPSEEK_API_KEY（已在 llm.py 里读取 / read in llm.py）
"""
from llm import MODEL, client

messages = [
    # TODO 1: 写一条 system 消息（字典），content 是 "You are a helpful assistant."
    #         A system message (a dict) whose content is "You are a helpful assistant."

    # TODO 2: 写一条 user 消息，content 是 "给我讲个笑话，三句话以内。"
    #         A user message whose content is "给我讲个笑话，三句话以内。" (a short joke)

]

if __name__ == "__main__":
    # ---------- 第 1 部分：普通调用 / Part 1: a normal call ----------
    # TODO 3: 调用 client.chat.completions.create，用关键字参数传入 model 和 messages
    #         Call client.chat.completions.create with the keyword arguments model and messages
    completion = None

    # TODO 4: 打印回答的文字：completion.choices[0].message.content
    #         Print the answer text: completion.choices[0].message.content

    # TODO 5: 用 f-string 打印 finish_reason 和 usage.total_tokens
    #         Print finish_reason and usage.total_tokens with f-strings

    # ---------- 第 2 部分：流式输出 / Part 2: streaming ----------
    print("\n----- stream=True -----")
    # TODO 6: 同样的请求，再加一个 stream=True
    #         The same request plus stream=True
    stream = None

    full_text = ""
    # TODO 7: for chunk in stream:
    #             取出 chunk.choices[0].delta.content，是 None 时换成 ""（用 or ""）
    #             用 print(..., end="") 边收边打印，再拼到 full_text 后面
    #         For each chunk: take chunk.choices[0].delta.content, turn None into "" (with or ""),
    #         print it with end="" and add it to full_text

    print()
    print(f"一共收到 {len(full_text)} 个字符 / characters received: {len(full_text)}")
