"""第 04 节：temperature 实验（同一个问题，不同温度各问一次）
Lesson 04: a temperature experiment (the same question at different temperatures)

注意：deepseek-flash 默认先「思考」，思考模式下 temperature 不起作用。
所以这里用 extra_body 关掉思考，温度的差别才看得出来。
视频这一集用的是当时的 DeepSeek V3，它不思考，所以视频里没有这一行。

Note: deepseek-flash thinks first by default, and temperature has no effect in thinking mode.
extra_body turns thinking off so the temperature makes a visible difference.
This episode of the video uses the DeepSeek V3 of that time, which doesn't think, so the video has no such line.

运行环境 / Environment: .venv
运行 / Run (在 practice 文件夹里 / from the practice folder):
    cd practice
    & ..\\.venv\\Scripts\\python.exe l04_temperature.py
需要的 key / Key needed: DEEPSEEK_API_KEY（会调用 8 次模型 / makes 8 calls）
"""
from llm import MODEL, client

if __name__ == "__main__":
    for t in [0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8, 2.0]:   # for 循环在 05 节细讲 / for loops: lesson 05
        completion = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "给我讲个笑话，一句话就行。"},
            ],
            temperature=t,
            max_tokens=100,                                     # 回答最多 100 个 token / at most 100 tokens
            extra_body={"thinking": {"type": "disabled"}},      # 关掉思考 / turn thinking off
        )
        print(f"temperature={t}: {completion.choices[0].message.content}")
        print()
