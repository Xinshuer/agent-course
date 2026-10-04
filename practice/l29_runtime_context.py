"""第 29 节示例（1.x 推荐写法）：用 context_schema + Runtime 在调用时选模型
Lesson 29 demo (the recommended 1.x style): choose the model per call with context_schema + Runtime

和 l29_runtime_config.py 做的是同一件事，只是「读设置」的方式不同：
- 视频（旧写法）：节点参数 config: RunnableConfig，读 config["configurable"]，调用时传 config={"configurable": {...}}
- 1.x 推荐：先声明 context_schema，节点参数 runtime: Runtime[Context]，读 runtime.context，调用时传 context={...}
Same job as l29_runtime_config.py; only the way the setting is read differs:
- the video (older style): a config: RunnableConfig parameter, config["configurable"], call with config={"configurable": {...}}
- recommended in 1.x: declare context_schema, a runtime: Runtime[Context] parameter, runtime.context, call with context={...}

运行一次 = 2 次 API 调用。/ One run = 2 API calls.

运行环境 / Environment: .venv
运行 / Run:  cd practice
             & ..\\.venv\\Scripts\\python.exe l29_runtime_context.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY / the DEEPSEEK_API_KEY variable
"""
from typing import Annotated

from langchain_core.messages import HumanMessage
from langchain_deepseek import ChatDeepSeek
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages
from langgraph.runtime import Runtime
from typing_extensions import TypedDict

from llm import API_KEY, MODEL

models = {
    "deepseek": ChatDeepSeek(model=MODEL, api_key=API_KEY),
    "pro": ChatDeepSeek(model="deepseek-v4-pro", api_key=API_KEY),
}


class AgentState(TypedDict):
    messages: Annotated[list, add_messages]


class Context(TypedDict):          # 运行时设置的格式 / the shape of the runtime settings
    model: str


def call_model(state: AgentState, runtime: Runtime[Context]):
    ctx = runtime.context or {}    # 调用时没传 context，runtime.context 是 None / None when no context is passed
    model = models[ctx.get("model", "deepseek")]
    response = model.invoke(state["messages"])
    return {"messages": [response]}


builder = StateGraph(AgentState, context_schema=Context)   # 声明 context 的格式 / declare the context's shape
builder.add_node("model", call_model)
builder.add_edge(START, "model")
builder.add_edge("model", END)
graph = builder.compile()


if __name__ == "__main__":
    question = {"messages": [HumanMessage("嗨，你是谁？请用一句话回答。")]}

    for context in [None, {"model": "pro"}]:
        result = graph.invoke(question, context=context)
        reply = result["messages"][-1]
        print("context =", context)
        print("回答 / reply:", reply.content)
        print("model_name:", reply.response_metadata.get("model_name"))
        print()
