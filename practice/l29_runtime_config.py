"""第 29 节示例（和视频同样的写法）：运行时配置——调用时再决定用哪个模型
Lesson 29 demo (the video's style): runtime configuration - choose the model at call time

视频里建了两个模型：DeepSeek（默认）和 OpenAI 的 gpt-3.5-turbo，调用时用
config={"configurable": {"model": "openai"}} 切换。我们没有 OpenAI 的 key，
所以换成同一个 DeepSeek key 下的两个模型：deepseek-flash（默认）和 deepseek-v4-pro。
The video builds two models, DeepSeek (default) and OpenAI's gpt-3.5-turbo, and switches with
config={"configurable": {"model": "openai"}}. We have no OpenAI key, so we use two models under
the same DeepSeek key instead: deepseek-flash (default) and deepseek-v4-pro.

1.x 推荐的新写法（context_schema + Runtime）见 l29_runtime_context.py。
The newer 1.x style (context_schema + Runtime) is in l29_runtime_context.py.

运行一次 = 2 次 API 调用。/ One run = 2 API calls.

运行环境 / Environment: .venv
运行 / Run:  cd practice
             & ..\\.venv\\Scripts\\python.exe l29_runtime_config.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY / the DEEPSEEK_API_KEY variable
"""
from typing import Annotated

from langchain_core.messages import HumanMessage
from langchain_core.runnables import RunnableConfig
from langchain_deepseek import ChatDeepSeek
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages
from typing_extensions import TypedDict

from llm import API_KEY, MODEL

# 可以切换的模型：名字 → 模型对象，提前建好 / The models to switch between: name -> model, built in advance
models = {
    "deepseek": ChatDeepSeek(model=MODEL, api_key=API_KEY),             # deepseek-flash（默认 / default）
    "pro": ChatDeepSeek(model="deepseek-v4-pro", api_key=API_KEY),      # 视频里这里是 OpenAI / the video uses OpenAI here
}


class AgentState(TypedDict):
    # add_messages：LangGraph 自带的消息合并函数，节点返回的新消息会追加到末尾
    # add_messages: LangGraph's built-in merge function; returned messages are appended
    messages: Annotated[list, add_messages]


# 节点多一个参数 config：LangGraph 会把这次运行的配置传进来
# The node takes a second parameter, config: LangGraph passes in this run's configuration
def _call_model(state: AgentState, config: RunnableConfig):
    model_name = config["configurable"].get("model", "deepseek")   # 没配置时用 "deepseek" / defaults to "deepseek"
    model = models[model_name]
    response = model.invoke(state["messages"])
    return {"messages": [response]}


builder = StateGraph(AgentState)
builder.add_node("model", _call_model)
builder.add_edge(START, "model")
builder.add_edge("model", END)
graph = builder.compile()


def show(result):
    reply = result["messages"][-1]
    print("回答 / reply:", reply.content)
    print("model_name:", reply.response_metadata.get("model_name"))   # 实际用的是哪个模型 / which model answered
    print()


if __name__ == "__main__":
    question = {"messages": [HumanMessage("嗨，你是谁？请用一句话回答。")]}

    print("=== 不传配置：默认模型 / no config: the default model ===")
    show(graph.invoke(question))

    print("=== 传入运行时配置：切换到 pro / with a runtime config: switch to pro ===")
    show(graph.invoke(question, config={"configurable": {"model": "pro"}}))
