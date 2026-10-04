"""第 50 节演示：像视频那样，用 requests 通过 HTTP 调用「讲笑话」服务
Lesson 50 demo: call the joke service over HTTP with requests, as in the video

先在一个终端启动 l50_joke_server.py，再在另一个终端运行这个文件。
这段代码对真正的 LangServe 服务也一样有效：LangServe 的 /invoke 接口用的就是 {"input": ...} / {"output": ...}。
Start l50_joke_server.py in one terminal first, then run this file in another.
The same code works against a real LangServe service: its /invoke endpoint uses {"input": ...} / {"output": ...}.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l50_joke_client.py
这个文件本身不需要 key：key 只在服务端使用。
This file needs no key itself: only the server uses it.
"""
import requests

URL = "http://127.0.0.1:9999/joke/invoke"


def tell_joke(topic):
    response = requests.post(URL, json={"input": {"topic": topic}}, timeout=60)  # json= 把字典转成 JSON 发出去
    response.raise_for_status()           # 状态码不是 2xx 就报错 / raise on a non-2xx status
    return response.json()["output"]      # JSON -> 字典，再取 output / JSON -> dict -> output


if __name__ == "__main__":
    try:
        print(tell_joke("程序员"))
    except requests.ConnectionError:
        print("连不上服务：先运行 l50_joke_server.py。 / Cannot connect: start l50_joke_server.py first.")
