"""第 55 节：把营销策划小组做成 HTTP 服务 —— JSON 请求进，JSON 结果出（视频里的 main 脚本）
Lesson 55: serve the marketing crew over HTTP - a JSON request in, a JSON result out (the video's main script)

做了什么 / What it does:
    在 http://127.0.0.1:8012 起一个服务（和视频一样用 8012 端口）：
      POST /marketing   请求体 {"customer_domain": "...", "project_description": "..."}
                        返回   {"title": "...", "body": "..."}（最后一个任务的 output_json）
    和视频一样，请求的格式（MarketingRequest）和返回的格式（MarketingResponse）分开定义。
    打开 http://127.0.0.1:8012/docs 可以直接在网页上试。
    Starts a server on http://127.0.0.1:8012 (port 8012, as in the video):
      POST /marketing   body {"customer_domain": "...", "project_description": "..."}
                        returns {"title": "...", "body": "..."} (the last task's output_json)
    As in the video, the request shape and the response shape are defined separately.
    Open http://127.0.0.1:8012/docs to try it in the browser.

运行环境 / Environment: .venv-crewai  (crewai 1.15.23, fastapi, uvicorn)
运行 / Run（服务会一直运行，按 Ctrl+C 停止 / runs until you press Ctrl+C）:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l55_marketing_api.py
然后在另一个终端运行客户端 / then, in a second terminal:
    & ..\\.venv-crewai\\Scripts\\python.exe l55_api_client.py
需要 / Needs: DEEPSEEK_API_KEY。每个请求 5 次模型调用 / 5 model calls per request.
第 56 节 / Lesson 56: 把下面这一行
    from l55_json_tasks_solution import MarketingCrew
    换成
    from l56_human_feedback_solution import ReviewedMarketingCrew as MarketingCrew
    就能像视频一样，在「运行服务的这个终端」里给任务提意见（USE_TOOLS 那一行不要动）。
    Swap that one import line to give feedback in this server's terminal, as in the video
    (leave the USE_TOOLS import alone).
"""
import os

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")                      # 不上传执行追踪 / no trace upload
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))  # CrewAI 的小数据库放进项目的 .cache / keep its db in the project's .cache

from contextlib import asynccontextmanager  # noqa: E402

import uvicorn  # noqa: E402
from fastapi import FastAPI, HTTPException  # noqa: E402
from pydantic import BaseModel  # noqa: E402

from l55_json_tasks_solution import USE_TOOLS  # noqa: E402
from l55_json_tasks_solution import MarketingCrew  # noqa: E402  56 节只换这一行 / lesson 56 swaps only this line


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 服务启动时运行一次（回顾 51 节）。视频在这里多做了一步：把搜索工具要用的
    # SERPER_API_KEY 写进环境变量。本课不把 key 写进代码，只检查系统环境变量里有没有。
    # Runs once at startup (see lesson 51). The video sets SERPER_API_KEY here; we only check for it.
    print("工具 / tools:", "开 / on" if USE_TOOLS else "关 / off",
          "| SERPER_API_KEY:", "已设置 / set" if os.environ.get("SERPER_API_KEY") else "未设置 / not set")
    yield
    print("服务关闭 / shutting down")


app = FastAPI(title="营销策划服务 / Marketing crew service", lifespan=lifespan)


class MarketingRequest(BaseModel):
    """请求格式：字段名和任务里的 {占位符} 一样。/ Request shape: field names match the {placeholders}."""
    customer_domain: str
    project_description: str


class MarketingResponse(BaseModel):
    """返回格式：和最后一个任务的 Copy 一样。/ Response shape: the same as the last task's Copy."""
    title: str
    body: str


@app.post("/marketing", response_model=MarketingResponse)
async def marketing(req: MarketingRequest):
    print(f"收到请求 / request received: {req.customer_domain}")
    crew = MarketingCrew().crew()                     # 每个请求新建一个 / a fresh crew per request
    # req.model_dump() 正好是 {"customer_domain": ..., "project_description": ...}，直接当 inputs
    # req.model_dump() is exactly {"customer_domain": ..., "project_description": ...} - use it as inputs
    result = await crew.kickoff_async(inputs=req.model_dump())
    if not result.json_dict:                          # 模型没按 JSON 回答 / the model did not answer in JSON
        raise HTTPException(status_code=502, detail="最后一个任务没有返回 JSON / the last task returned no JSON")
    return result.json_dict                           # FastAPI 按 MarketingResponse 检查后转成 JSON / checked, then sent


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8012)
