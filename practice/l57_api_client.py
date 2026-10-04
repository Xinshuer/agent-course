"""第 57 / 58 节示例：调用营销文案接口的客户端（对应视频里的 API test 脚本）
Lessons 57 / 58 demo: a client for the marketing-copy endpoint (the video's "API test" script)

做了什么 / What it does:
    向 http://127.0.0.1:8012/marketing 发一个 POST 请求，打印返回的 {title, body}。
    57 节的 l57_pipeline_api.py 和 58 节的 l58_flow_api.py 提供的是同一个接口，这个客户端两边都能用。
    Sends one POST to http://127.0.0.1:8012/marketing and prints the {title, body} it returns.
    l57_pipeline_api.py (lesson 57) and l58_flow_api.py (lesson 58) serve the same endpoint,
    so this client works with either.

运行环境 / Environment: .venv-crewai（只用到 requests / only needs requests）
运行 / Run（先在另一个终端启动服务 / start the server in another terminal first）:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l57_api_client.py
需要 / Needs: 正在运行的服务；客户端本身不需要 key。/ a running server; the client needs no key.
"""
import requests

URL = "http://127.0.0.1:8012/marketing"     # 端口要和服务里的 port=8012 一致 / must match the server's port

if __name__ == "__main__":
    payload = {                                  # 和视频一样：第 55 集的那个问题
        "customer_domain": "emqx.com",
        "project_description": "EMQX 是一款开源的 MQTT 消息服务器，能连接海量物联网设备并实时处理数据。"
                               "请为它策划一次面向国内物联网开发者和企业的推广活动。",
    }
    print("发送请求，稍等几十秒…… / sending the request, this takes a while...")
    resp = requests.post(URL, json=payload, timeout=300)   # json= 会自动转成 JSON 请求体
    resp.raise_for_status()                                # 不是 2xx 就报错 / raise on non-2xx
    data = resp.json()                                     # JSON -> dict
    print("标题 / title:", data["title"])
    print("正文 / body:", data["body"])
