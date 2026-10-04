"""第 55 节：调用营销策划服务的客户端（视频里的 apiTest 脚本）
Lesson 55: a client for the marketing service (the video's apiTest script)

做了什么 / What it does:
    向 http://127.0.0.1:8012/marketing 发一个 JSON 请求，打印返回的 JSON（title 和 body）。
    URL 里的地址和端口要和服务一致（视频也特别提醒了这一点）。
    Sends a JSON request to http://127.0.0.1:8012/marketing and prints the JSON reply (title, body).
    The host and port in the URL must match the server (the video stresses this too).

运行环境 / Environment: .venv-crewai（.venv 也可以 / .venv works too）
运行 / Run（先在另一个终端启动 l55_marketing_api.py / start l55_marketing_api.py in another terminal first）:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l55_api_client.py
需要 / Needs: 服务已启动 / the server running. 不需要 key / no key needed here.
"""
import json

import httpx

URL = "http://127.0.0.1:8012/marketing"

# 请求体：两个字段，名字和服务端的 MarketingRequest 一致 / two fields matching MarketingRequest
payload = {
    "customer_domain": "emqx.com",
    "project_description": "EMQX 是一款开源的 MQTT 消息服务器，能连接海量物联网设备并实时处理数据。"
                           "请为它策划一次面向国内物联网开发者和企业的推广活动。",
}


if __name__ == "__main__":
    # 5 个任务要跑几分钟；56 节加了人工审核后还要等你输入，所以 timeout 设得很长
    # 5 tasks take minutes, and with lesson 56's human review it also waits for you, so use a long timeout
    response = httpx.post(URL, json=payload, timeout=1800)
    response.raise_for_status()                  # 状态码不是 2xx 就抛出异常 / raise unless 2xx
    data = response.json()                       # JSON 文本 → 字典 / JSON text -> dict
    print("标题 / title:", data["title"])
    print("正文 / body:", data["body"])
    print(json.dumps(data, ensure_ascii=False, indent=2))
