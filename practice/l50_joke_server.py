"""第 50 节演示：视频里用 LangServe 部署的「讲笑话」链，这里用 FastAPI 做出同样的接口
Lesson 50 demo: the video's "tell a joke" chain deployed with LangServe - rebuilt here with plain FastAPI

视频（LangChain 0.x）的服务端只有几行：
    app = FastAPI()
    add_routes(app, chain, path="/joke")      # from langserve import add_routes
LangServe 已停止开发新功能，本课程环境也没有安装它。这里用 FastAPI 手写它生成的 /joke/invoke 接口，
请求和响应的格式与 LangServe 一样（{"input": {...}} -> {"output": ...}），所以视频里用 requests 调用的客户端代码
不用改就能用（见 l50_joke_client.py）。
The video's server is a few lines: FastAPI() plus add_routes(app, chain, path="/joke"). LangServe gets no new
features and is not installed here, so this file writes the /joke/invoke endpoint by hand with FastAPI, using
LangServe's request/response shape ({"input": {...}} -> {"output": ...}). The video's requests-based client
therefore works unchanged (see l50_joke_client.py).

运行环境 / Environment: .venv
运行 / Run (启动服务，一直运行，按 Ctrl+C 停止 / starts the server; Ctrl+C to stop):
    cd practice
    & ..\\.venv\\Scripts\\python.exe l50_joke_server.py
然后 / Then:
    - 浏览器打开 http://127.0.0.1:9999/docs ，在网页里试 POST /joke/invoke（代替 LangServe 的 playground）
      open http://127.0.0.1:9999/docs and try POST /joke/invoke there (instead of LangServe's playground)
    - 或者在另一个终端运行 l50_joke_client.py / or run l50_joke_client.py in another terminal
需要 DEEPSEEK_API_KEY（只有服务端需要）。路由装饰器和请求模型在第 51 节细讲。
Needs DEEPSEEK_API_KEY (only the server needs it). Route decorators and request models: lesson 51.
"""
from fastapi import FastAPI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_deepseek import ChatDeepSeek
from pydantic import BaseModel

from llm import API_KEY, MODEL

# 1. 视频里最简单的链：提示词模板 | 模型 | 输出解析器（第 48 节的视频里也有这样一条讲笑话的链）
# 1. The video's simplest chain: prompt template | model | output parser (lesson 48's video has one like it)
prompt = ChatPromptTemplate.from_template("讲一个关于{topic}的笑话，不超过三句话。")
chain = prompt | ChatDeepSeek(model=MODEL, api_key=API_KEY) | StrOutputParser()

# 2. Web 应用 / The web app
app = FastAPI(title="Joke chain (LangServe-style API)")


class JokeInput(BaseModel):        # 链的输入：{"topic": "..."} / the chain's input
    topic: str


class InvokeRequest(BaseModel):    # 请求体：{"input": {"topic": "..."}}，和 LangServe 一样 / same as LangServe
    input: JokeInput


@app.post("/joke/invoke")          # 收到 POST /joke/invoke 时调用这个函数 / handles POST /joke/invoke
def joke_invoke(req: InvokeRequest):
    text = chain.invoke({"topic": req.input.topic})
    return {"output": text}        # 响应体：{"output": "..."}，和 LangServe 一样 / same as LangServe


if __name__ == "__main__":         # 直接运行这个文件时才启动服务 / start the server only when run directly
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=9999)
