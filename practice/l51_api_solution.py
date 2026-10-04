"""第 51 节参考答案：用 FastAPI 把 Crew 包装成 HTTP 服务（视频「测试二」的 main 脚本）
Lesson 51 solution: serve the crew over HTTP with FastAPI (the video's "test 2" main script)

做了什么 / What it does:
    和视频的 main 脚本结构一样：
      lifespan                    服务启动时配置模型（设置环境变量），关闭时打印一句话
      POST /research              请求体 {"topic": "..."}，返回 {"topic": ..., "report": ...}（最简单的写法）
      POST /v1/chat/completions   模仿 OpenAI 的接口（视频就是这样做的）：从消息里取主题，
                                  stream=false 一次返回，stream=true 分段流式返回
    crew 用的是 l51_yaml_crew.py 里的模板 crew（视频的 main 脚本也是导入模板生成的 crew 类）。
    打开 http://127.0.0.1:8012/docs 可以直接在网页上试。
    Same structure as the video's main script:
      lifespan                    configure the model at startup (environment variables), print at shutdown
      POST /research              body {"topic": "..."}, returns {"topic": ..., "report": ...} (simplest form)
      POST /v1/chat/completions   OpenAI-style endpoint (as in the video): topic from the messages,
                                  one JSON reply for stream=false, chunks for stream=true
    The crew is the template crew from l51_yaml_crew.py (the video's main script imports the template's crew class).
    Open http://127.0.0.1:8012/docs to try it in the browser.

    chat_response() 和 chat_stream() 也被 l52_api.py、l53_api.py 导入复用。
    chat_response() and chat_stream() are reused by l52_api.py and l53_api.py.

运行环境 / Environment: .venv-crewai  (crewai 1.15.23, fastapi, uvicorn)
运行 / Run（服务会一直运行，按 Ctrl+C 停止 / runs until you press Ctrl+C）:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l51_api_solution.py
然后在另一个终端运行客户端 / then, in a second terminal:
    & ..\\.venv-crewai\\Scripts\\python.exe l51_api_client.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY / the DEEPSEEK_API_KEY environment variable。每个请求约 2 次模型调用 / ~2 model calls per request.
"""
import json
import os
import time
from contextlib import asynccontextmanager

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")                      # 不上传执行追踪 / no trace upload
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))  # CrewAI 的小数据库放进项目的 .cache / keep its db in the project's .cache

import uvicorn  # noqa: E402
from fastapi import FastAPI  # noqa: E402
from fastapi.responses import StreamingResponse  # noqa: E402
from pydantic import BaseModel  # noqa: E402

from l51_yaml_crew import ReportCrew, make_inputs, use_deepseek_env  # noqa: E402

PORT = 8012


@asynccontextmanager
async def lifespan(app: FastAPI):
    # yield 之前：服务启动时执行一次。视频在这里按标志位选择 OneAPI / Ollama / OpenAI，
    # 再把对应的地址、key、模型名写进环境变量；这里固定用 DeepSeek。
    # Before yield: runs once at startup. The video picks OneAPI / Ollama / OpenAI by a flag here
    # and writes that address, key and model name into environment variables; we always use DeepSeek.
    use_deepseek_env()
    print("模型配置完成，服务启动 / model configured, server starting")
    yield                                   # 服务运行期间停在这里 / the server runs while we wait here
    # yield 之后：服务关闭时执行（可以做清理）/ after yield: runs at shutdown (clean-up goes here)
    print("正在关闭 / shutting down")


app = FastAPI(title="研究报告服务 / Research report service", lifespan=lifespan)


# ---------------------------------------------------------------- 写法一：最简单的接口 / style 1: simplest
class ResearchRequest(BaseModel):
    """请求体的格式：必须有一个字符串字段 topic。/ The request body: one string field, topic."""
    topic: str


@app.post("/research")
async def research(req: ResearchRequest):
    print(f"收到请求 / request received: topic={req.topic!r}")
    crew = ReportCrew().crew()                           # 每个请求新建一个 / a fresh crew per request
    # kickoff_async 在后台线程里运行 crew，不会卡住整个服务
    # kickoff_async runs the crew in a worker thread, so the server stays responsive
    result = await crew.kickoff_async(inputs=make_inputs(req.topic))
    return {"topic": req.topic, "report": result.raw}    # 字典会被自动转成 JSON / dict -> JSON


# ---------------------------------------------------------------- 写法二：视频的写法 / style 2: the video's
# 模仿 OpenAI 的 /v1/chat/completions，这样任何 OpenAI 客户端都能调用它。
# Mimic OpenAI's /v1/chat/completions so any OpenAI client can call it.
class ChatRequest(BaseModel):
    model: str = "report-crew"
    messages: list[dict]
    stream: bool = False                                 # 是否流式返回 / stream the reply or not


def chat_response(text, model):
    """非流式：按 OpenAI 的格式一次返回整段文字。/ Non-streaming: the whole text in OpenAI's format."""
    return {
        "id": f"chatcmpl-{int(time.time())}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": model,
        "choices": [{
            "index": 0,
            "message": {"role": "assistant", "content": text},
            "finish_reason": "stop",
        }],
    }


def chat_stream(text, model, size=20):
    """流式：把文字切成小段，按 OpenAI 的 SSE 格式一段一段发（生成器，见 38 节）。
    Streaming: cut the text into pieces and send them in OpenAI's SSE format (a generator, see lesson 38)."""
    def chunk(delta, finish_reason=None):
        data = {"id": "chatcmpl-stream", "object": "chat.completion.chunk", "created": int(time.time()),
                "model": model, "choices": [{"index": 0, "delta": delta, "finish_reason": finish_reason}]}
        return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"

    def events():
        for i in range(0, len(text), size):
            yield chunk({"content": text[i:i + size]})
        yield chunk({}, "stop")
        yield "data: [DONE]\n\n"

    return StreamingResponse(events(), media_type="text/event-stream")


@app.post("/v1/chat/completions")
async def chat_completions(req: ChatRequest):
    topic = req.messages[-1]["content"]                  # 最后一条消息当作主题 / last message = topic
    print(f"收到聊天请求 / chat request: {topic!r}, stream={req.stream}")
    result = await ReportCrew().crew().kickoff_async(inputs=make_inputs(topic))
    text = str(result)                                   # 和视频一样把结果对象转成字符串（等于 result.raw）
    if req.stream:
        return chat_stream(text, req.model)
    return chat_response(text, req.model)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=PORT)
