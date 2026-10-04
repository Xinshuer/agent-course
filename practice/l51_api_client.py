"""第 51–53 节：调用 Crew 服务的客户端（视频里的 apitest 脚本）
Lessons 51-53: a client for the crew services (the video's "apitest" script)

做了什么 / What it does:
    先在另一个终端启动服务（l51_api_solution.py、l52_api.py 或 l53_api.py，都在 8012 端口），然后：
      默认        用 httpx 向 POST /research 发 {"topic": ...}，打印报告（只有 51 节的服务有这个接口）
      --openai    用 OpenAI SDK 调 /v1/chat/completions，一次拿到整段回答（三个服务都有）
      --stream    同上，但用 stream=True 一段一段打印
    Start a server in another terminal first (l51_api_solution.py, l52_api.py or l53_api.py, all on port 8012):
      default     POST {"topic": ...} to /research with httpx and print the report (lesson 51's server only)
      --openai    call /v1/chat/completions with the OpenAI SDK, whole answer at once (all three servers)
      --stream    the same with stream=True, printing piece by piece

运行环境 / Environment: .venv-crewai（.venv 也可以 / .venv works too）
运行 / Run:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l51_api_client.py                          # 51 节 /research
    & ..\\.venv-crewai\\Scripts\\python.exe l51_api_client.py "AI LLMs" --openai       # OpenAI 格式
    & ..\\.venv-crewai\\Scripts\\python.exe l51_api_client.py "AI LLMs" --stream       # 流式 / streaming
    & ..\\.venv-crewai\\Scripts\\python.exe l51_api_client.py 人工智能 --openai        # 52 节的服务
    & ..\\.venv-crewai\\Scripts\\python.exe l51_api_client.py "张三九最近总是头疼，跟他以前的体检结果有关系吗？" --openai   # 53 节
需要 / Needs: 服务已启动 / the server running. 每个请求会让服务跑一次 crew / each request runs the crew once.
"""
import sys

import httpx

SERVER = "http://127.0.0.1:8012"


def ask_research(topic):
    # crew 要跑一两分钟，所以 timeout 要设长一点（httpx 默认只等 5 秒）
    # A crew takes a minute or two, so use a long timeout (httpx waits only 5 s by default)
    response = httpx.post(f"{SERVER}/research", json={"topic": topic}, timeout=600)
    response.raise_for_status()          # 状态码不是 2xx 就抛出异常 / raise unless 2xx
    return response.json()["report"]


def openai_client():
    from openai import OpenAI

    # 把 OpenAI 客户端指向我们自己的服务；key 随便写，我们的服务不检查
    # Point the OpenAI client at our own server; any key works because we don't check it
    return OpenAI(base_url=f"{SERVER}/v1", api_key="not-needed", timeout=600)


def ask_openai_style(text):
    r = openai_client().chat.completions.create(model="crew", messages=[{"role": "user", "content": text}])
    return r.choices[0].message.content          # 和 04 节一样的取值路径 / same path as lesson 04


def ask_streaming(text):
    stream = openai_client().chat.completions.create(
        model="crew", messages=[{"role": "user", "content": text}], stream=True)
    for chunk in stream:                         # 和 09 节的流式输出一样 / same as streaming in lesson 09
        print(chunk.choices[0].delta.content or "", end="", flush=True)
    print()


if __name__ == "__main__":
    words = [a for a in sys.argv[1:] if not a.startswith("--")]
    text = words[0] if words else "AI LLMs"

    if "--stream" in sys.argv:
        print("== POST /v1/chat/completions (stream=True) ==")
        ask_streaming(text)
    elif "--openai" in sys.argv:
        print("== POST /v1/chat/completions ==")
        print(ask_openai_style(text))
    else:
        print("== POST /research ==")
        print(ask_research(text))
