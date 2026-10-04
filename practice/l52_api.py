"""第 52 节：技术研究员 crew 的 HTTP 服务（视频这一集的 main 脚本）
Lesson 52: an HTTP service for the tech-researcher crew (this episode's main script)

做了什么 / What it does:
    和 51 节的服务几乎一样，只有视频里提到的两处不同：
      1. lifespan 启动时直接创建模型对象（视频用 LangChain 的 ChatOpenAI，这里用 CrewAI 的 LLM），
         存进字典 MODELS，接口里再把它传给 crew 类
      2. 接口函数里直接创建并运行 crew，不再单独写一个 run() 函数
    OpenAI 格式的请求/返回（含流式）直接复用 l51_api_solution.py 里的写法。
    Almost the same as lesson 51's server, with the two differences the video mentions:
      1. lifespan creates the model object at startup (the video uses LangChain's ChatOpenAI; we use
         CrewAI's LLM), keeps it in the MODELS dict, and the endpoint passes it to the crew class
      2. the endpoint creates and runs the crew directly instead of calling a separate run()
    The OpenAI-style request/response code (incl. streaming) is reused from l51_api_solution.py.

运行环境 / Environment: .venv-crewai  (crewai 1.15.23, fastapi, uvicorn)
运行 / Run（Ctrl+C 停止 / Ctrl+C to stop）:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l52_api.py
另一个终端 / in a second terminal:
    & ..\\.venv-crewai\\Scripts\\python.exe l51_api_client.py 人工智能 --openai
需要 / Needs: 环境变量 DEEPSEEK_API_KEY / the DEEPSEEK_API_KEY environment variable。每个请求约 3 次模型调用 / ~3 model calls per request.
"""
import os
from contextlib import asynccontextmanager

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")                      # 不上传执行追踪 / no trace upload
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))  # CrewAI 的小数据库放进项目的 .cache / keep its db in the project's .cache

import uvicorn  # noqa: E402
from fastapi import FastAPI  # noqa: E402

from l51_api_solution import ChatRequest, chat_response, chat_stream  # noqa: E402
from l52_research_crew import TechResearchCrew, make_llm  # noqa: E402

MODELS = {}          # 启动时把模型放进来（改字典不需要 global，见 06 节）/ filled at startup (no global needed)


@asynccontextmanager
async def lifespan(app: FastAPI):
    MODELS["llm"] = make_llm()          # 启动时：创建模型对象 / at startup: create the model object
    print("模型初始化完成，服务启动 / model ready, server starting")
    yield
    print("正在关闭 / shutting down")


app = FastAPI(title="技术趋势研究服务 / Tech trend research service", lifespan=lifespan)


@app.post("/v1/chat/completions")
async def chat_completions(req: ChatRequest):
    topic = req.messages[-1]["content"]                       # 例如「人工智能」/ e.g. "人工智能"
    print(f"收到请求 / request received: {topic!r}")
    crew = TechResearchCrew(MODELS["llm"]).crew()             # 直接在接口里创建 crew / build it right here
    result = await crew.kickoff_async(inputs={"topic": topic})
    if req.stream:
        return chat_stream(result.raw, req.model)
    return chat_response(result.raw, req.model)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8012)
