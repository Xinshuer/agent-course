"""第 51 节练习：用 FastAPI 把 Crew 包装成 HTTP 服务（视频的 main 脚本）
Lesson 51 exercise: serve the crew with FastAPI (the video's main script)

按 TODO 补全代码。crew 直接从 l51_yaml_crew.py 导入，你只需要写服务这一层。
卡住了就看 l51_api_solution.py（里面还有选学的 OpenAI 格式接口）。
Fill in the TODOs. The crew comes from l51_yaml_crew.py; you only write the service layer.
Stuck? See l51_api_solution.py (it also has the optional OpenAI-style endpoint).

运行环境 / Environment: .venv-crewai
运行 / Run（Ctrl+C 停止 / Ctrl+C to stop）:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l51_api_todo.py
然后打开 http://127.0.0.1:8012/docs ，或在另一个终端运行 l51_api_client.py
Then open http://127.0.0.1:8012/docs, or run l51_api_client.py in a second terminal.
需要 / Needs: 环境变量 DEEPSEEK_API_KEY / the DEEPSEEK_API_KEY environment variable
"""
import os
from contextlib import asynccontextmanager

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")                      # 不上传执行追踪 / no trace upload
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))  # CrewAI 的小数据库放进项目的 .cache / keep its db in the project's .cache

import uvicorn  # noqa: E402
from fastapi import FastAPI  # noqa: E402
from pydantic import BaseModel  # noqa: E402

from l51_yaml_crew import ReportCrew, make_inputs, use_deepseek_env  # noqa: E402


# TODO 1：写 lifespan：用 @asynccontextmanager 装饰一个 async 函数 lifespan(app)
#         yield 之前调用 use_deepseek_env() 并打印「服务启动」；yield 之后打印「正在关闭」
# TODO 1: write lifespan: an async function lifespan(app) decorated with @asynccontextmanager;
#         before yield call use_deepseek_env() and print a start message; after yield print a shutdown message


# TODO 2：创建 FastAPI 应用 app，把 lifespan 传进去：FastAPI(lifespan=lifespan)
# TODO 2: create the FastAPI app with FastAPI(lifespan=lifespan)
app = None


# TODO 3：写请求模型 ResearchRequest：继承 BaseModel，只有一个字段 topic，类型是 str
# TODO 3: write the request model ResearchRequest(BaseModel) with one field: topic: str


# TODO 4：用 @app.post("/research") 注册一个 async 函数 research(req: ResearchRequest)
#         里面：crew = ReportCrew().crew()
#               result = await crew.kickoff_async(inputs=make_inputs(req.topic))
#         返回字典 {"topic": req.topic, "report": result.raw}
# TODO 4: register an async function research(req: ResearchRequest) with @app.post("/research")
#         inside: build the crew, await crew.kickoff_async(inputs=make_inputs(req.topic)),
#         return {"topic": req.topic, "report": result.raw}


if __name__ == "__main__":
    # TODO 5：用 uvicorn.run 启动 app，host="127.0.0.1"，port=8012
    # TODO 5: start the app with uvicorn.run(app, host="127.0.0.1", port=8012)
    pass
