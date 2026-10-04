"""第 04 节：用环境变量创建 client（视频里的写法，换成 DeepSeek）
Lesson 04: creating the client from environment variables (the video's way, on DeepSeek)

OpenAI() 不传参数时，会自己去读 OPENAI_API_KEY 和 OPENAI_BASE_URL 这两个环境变量。
视频里是在代码开头给「接口地址」和「密钥」两个环境变量赋值（按这一集的 AI 字幕）；
这里的 key 不写在代码里，而是从你已经设置好的 DEEPSEEK_API_KEY 复制过来。

Called with no arguments, OpenAI() reads OPENAI_API_KEY and OPENAI_BASE_URL itself.
The video assigns the address and the key to these variables at the top of the code
(per the episode's AI subtitles); here the key is copied from DEEPSEEK_API_KEY
instead of being written into the file.

运行环境 / Environment: .venv
运行 / Run (在 practice 文件夹里 / from the practice folder):
    cd practice
    & ..\\.venv\\Scripts\\python.exe l04_env_client.py
需要的 key / Key needed: DEEPSEEK_API_KEY
"""
import os

from openai import OpenAI

if __name__ == "__main__":
    # 只在当前这个 Python 进程里有效，不会改动 Windows 的设置
    # Only affects this Python process; Windows settings are untouched
    os.environ["OPENAI_API_KEY"] = os.environ["DEEPSEEK_API_KEY"]
    os.environ["OPENAI_BASE_URL"] = "https://api.deepseek.com"

    client = OpenAI()                     # 不传参数 / no arguments
    print("base_url:", client.base_url)   # 确认读到了地址 / check the address was picked up

    completion = client.chat.completions.create(
        model="deepseek-flash",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Hello! Can you tell me a joke?"},
        ],
    )
    print(completion.choices[0].message.content)
