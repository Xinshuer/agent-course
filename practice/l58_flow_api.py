"""第 58 节示例：把营销 Flow 包装成 HTTP 接口（对应视频里的 main.py）
Lesson 58 demo: serve the marketing flow over HTTP (the video's main.py)

做了什么 / What it does:
    在 http://127.0.0.1:8012 起一个服务，接口和 57 节完全一样：
      POST /marketing   请求体 {"customer_domain": "...", "project_description": "..."}
                        返回 {"title": "...", "body": "..."}
    每个请求都新建一个 MarketingFlow，避免不同请求共用同一份 state。
    Starts a server on http://127.0.0.1:8012 with exactly the same endpoint as lesson 57.
    Every request creates a fresh MarketingFlow so requests never share one state.

运行环境 / Environment: .venv-crewai  (crewai 1.15.23, fastapi, uvicorn)
运行 / Run（服务会一直运行，按 Ctrl+C 停止 / runs until you press Ctrl+C）:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l58_flow_api.py
然后在另一个终端运行 57 节的客户端 / then, in a second terminal, run lesson 57's client:
    & ..\\.venv-crewai\\Scripts\\python.exe l57_api_client.py
需要 / Needs: DEEPSEEK_API_KEY，以及 l58_marketing_flow.py 用到的文件。每个请求约 2 次模型调用。
              Plus the files l58_marketing_flow.py needs. About 2 model calls per request.
"""
import os

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))   # 必须在 import crewai 之前 / before importing crewai

import uvicorn  # noqa: E402
from fastapi import FastAPI  # noqa: E402
from pydantic import BaseModel  # noqa: E402

from l58_marketing_flow import MarketingFlow  # noqa: E402

app = FastAPI(title="营销文案 Flow / Marketing copy flow")


class MarketingRequest(BaseModel):
    customer_domain: str
    project_description: str


@app.post("/marketing")
async def marketing(req: MarketingRequest):
    print(f"收到请求 / request received: {req.customer_domain} | {req.project_description}")
    flow = MarketingFlow()                                   # 每个请求一个新的 Flow / a fresh flow per request
    result = await flow.kickoff_async(inputs=req.model_dump())   # 异步版 kickoff / the async kickoff
    return result                                            # create_copy 返回的字典 -> JSON


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8012)
