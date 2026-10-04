"""第 57 节示例：把两阶段流水线包装成 HTTP 接口（对应视频里的 main.py）
Lesson 57 demo: serve the two-stage pipeline over HTTP (the video's main.py)

做了什么 / What it does:
    在 http://127.0.0.1:8012 起一个服务：
      POST /marketing   请求体 {"customer_domain": "...", "project_description": "..."}
                        返回 {"title": "...", "body": "..."}
    打开 http://127.0.0.1:8012/docs 可以直接在网页上试。
    Starts a server on http://127.0.0.1:8012:
      POST /marketing   body {"customer_domain": "...", "project_description": "..."}
                        returns {"title": "...", "body": "..."}
    Open http://127.0.0.1:8012/docs to try it in the browser.

运行环境 / Environment: .venv-crewai  (crewai 1.15.23, fastapi, uvicorn)
运行 / Run（服务会一直运行，按 Ctrl+C 停止 / runs until you press Ctrl+C）:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l57_pipeline_api.py
然后在另一个终端运行客户端 / then, in a second terminal:
    & ..\\.venv-crewai\\Scripts\\python.exe l57_api_client.py
需要 / Needs: DEEPSEEK_API_KEY，以及 l57_pipeline_solution.py、l55_deepseek_llm.py。每个请求约 2 次模型调用。
              Also those two files. About 2 model calls per request.
"""
import os

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))   # 必须在 import crewai 之前 / before importing crewai

import uvicorn  # noqa: E402
from fastapi import FastAPI  # noqa: E402
from pydantic import BaseModel  # noqa: E402

from l57_pipeline_solution import run_pipeline  # noqa: E402

app = FastAPI(title="营销文案流水线 / Marketing copy pipeline")


class MarketingRequest(BaseModel):
    """请求体：客户是谁、项目是什么（回顾 51 节）。/ Request body: the client and the project (see lesson 51)."""
    customer_domain: str
    project_description: str


@app.post("/marketing")
def marketing(req: MarketingRequest):
    # 普通 def（不是 async def）：FastAPI 会把它放到线程池里运行，跑几十秒也不会卡住整个服务
    # A plain def (not async def): FastAPI runs it in a thread pool, so a long run won't block the server
    print(f"收到请求 / request received: {req.customer_domain} | {req.project_description}")
    result = run_pipeline(req.model_dump())        # BaseModel -> dict -> 流水线的 inputs
    return result.to_dict()                        # {"title": ..., "body": ...} -> JSON


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8012)
