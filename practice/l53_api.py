"""第 53 节：健康档案助手的 HTTP 服务（视频这一集的 main 脚本）
Lesson 53: an HTTP service for the health-records assistant (this episode's main script)

做了什么 / What it does:
    和 52 节的 l52_api.py 一样：lifespan 启动时创建模型；POST /v1/chat/completions 从最后一条消息
    取出医生的问题，运行健康档案助手 crew，按 OpenAI 的格式返回报告（stream=true 时流式返回）。
    Same as lesson 52's l52_api.py: lifespan creates the model at startup; POST /v1/chat/completions takes
    the doctor's question from the last message, runs the health-records crew and returns the report in
    OpenAI's format (streamed when stream=true).

⚠ 档案是虚构的；报告由 AI 生成，仅供学习，不是医疗建议。
⚠ The records are fictional; the AI-written report is for learning only, not medical advice.

运行环境 / Environment: .venv-crewai  (crewai 1.15.23, chromadb, fastapi, uvicorn)
运行 / Run（先灌库，再启动服务；Ctrl+C 停止 / index first, then start; Ctrl+C to stop）:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l53_vector_db.py
    & ..\\.venv-crewai\\Scripts\\python.exe l53_api.py
另一个终端 / in a second terminal:
    & ..\\.venv-crewai\\Scripts\\python.exe l51_api_client.py "张三九最近总是头疼，跟他以前的体检结果有关系吗？" --openai
需要 / Needs: 环境变量 DEEPSEEK_API_KEY / the DEEPSEEK_API_KEY environment variable。每个请求约 4 次模型调用 / ~4 model calls per request.
"""
import os
from contextlib import asynccontextmanager

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")                      # 不上传执行追踪 / no trace upload
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))  # CrewAI 的小数据库放进项目的 .cache / keep its db in the project's .cache

import uvicorn  # noqa: E402
from crewai import LLM  # noqa: E402
from fastapi import FastAPI  # noqa: E402

from l51_api_solution import ChatRequest, chat_response, chat_stream  # noqa: E402
from l53_health_solution import build_crew  # noqa: E402
from llm import API_KEY, BASE_URL, MODEL  # noqa: E402

MODELS = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    MODELS["llm"] = LLM(model=f"openai/{MODEL}", base_url=BASE_URL, api_key=API_KEY)
    print("模型初始化完成，服务启动 / model ready, server starting")
    yield
    print("正在关闭 / shutting down")


app = FastAPI(title="健康档案助手 / Health records assistant", lifespan=lifespan)


@app.post("/v1/chat/completions")
async def chat_completions(req: ChatRequest):
    question = req.messages[-1]["content"]                 # 医生的问题 / the doctor's question
    print(f"收到请求 / request received: {question!r}")
    result = await build_crew(MODELS["llm"]).kickoff_async(inputs={"question": question})
    if req.stream:
        return chat_stream(result.raw, req.model)
    return chat_response(result.raw, req.model)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8012)
