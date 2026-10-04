"""第 31 节练习：跨线程持久化（TODO 版）
Lesson 31 exercise: cross-thread persistence (TODO version)

目标：用户 1 在线程 1 里说「请记住我的名字」，换到线程 2 也能被认出来；用户 2 什么都查不到。
Goal: user 1 says "remember my name" on thread 1 and is still recognised on thread 2;
user 2 finds nothing.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l31_cross_thread_todo.py
参考答案 / Solution: l31_cross_thread_solution.py（会调用 3 次 DeepSeek / 3 DeepSeek calls）
"""
import os
import uuid

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("HF_HOME", os.path.join(PROJECT_DIR, ".cache", "hf"))   # 模型缓存放进项目的 .cache / keep caches in the project's .cache

from fastembed import TextEmbedding
from langchain_core.runnables import RunnableConfig
from langchain_deepseek import ChatDeepSeek
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.store.base import BaseStore
from langgraph.store.memory import InMemoryStore

from llm import API_KEY, MODEL

model = ChatDeepSeek(model=MODEL, api_key=API_KEY)
embedder = TextEmbedding("BAAI/bge-small-zh-v1.5", cache_dir=os.path.join(PROJECT_DIR, ".cache", "fastembed"))


def embed(texts):
    """把一批文字变成一批向量 / turn a batch of texts into a batch of vectors"""
    return [vector.tolist() for vector in embedder.embed(texts)]


# TODO 1: 这个模型输出 512 维的向量。把 dims 改成正确的数字（视频里的 BGE-M3 是 1024 维）
#         This model outputs 512-number vectors. Fix dims (the video's BGE-M3 has 1024)
in_memory_store = InMemoryStore(index={"embed": embed, "dims": 0})


def call_model(state: MessagesState, config: RunnableConfig, *, store: BaseStore):
    # TODO 2: 从 config 里取出 user_id（两层字典：先 "configurable"，再 "user_id"）
    #         Read user_id from config (two levels: "configurable", then "user_id")
    user_id = "?"
    namespace = ("memories", user_id)

    # TODO 3: 用 store.search(namespace, query=...) 搜索相关记忆，query 用最后一条消息的内容
    #         Search with store.search(namespace, query=...), using the last message's content as query
    memories = []
    info = "\n".join([d.value["data"] for d in memories])
    print(f"   [日志/log] 用户 {user_id} 检索到 / found: {info or '（无 / none）'}")
    system_msg = f"你是一个正在和用户聊天的助手。用户信息：{info}"

    last_message = state["messages"][-1]
    if "记住" in last_message.content or "remember" in last_message.content.lower():
        memory = "用户的名字是托米张"
        # TODO 4: 用 store.put 存进去：namespace，key 用 str(uuid.uuid4())，value 用 {"data": memory}
        #         Save it with store.put: namespace, key str(uuid.uuid4()), value {"data": memory}
        print(f"   [日志/log] 写入记忆 / saved: {memory}")

    response = model.invoke([{"role": "system", "content": system_msg}] + state["messages"])
    return {"messages": [response]}


builder = StateGraph(MessagesState)
builder.add_node("call_model", call_model)
builder.add_edge(START, "call_model")
builder.add_edge("call_model", END)
# TODO 5: 编译时同时传入 checkpointer=InMemorySaver() 和 store=in_memory_store
#         Compile with both checkpointer=InMemorySaver() and store=in_memory_store
graph = builder.compile()


def chat(text, config):
    inputs = {"messages": [{"role": "user", "content": text}]}
    for chunk in graph.stream(inputs, config, stream_mode="values"):
        chunk["messages"][-1].pretty_print()


if __name__ == "__main__":
    chat("你好！请记住：我的名字叫托米张。请简短回答。", {"configurable": {"thread_id": "1", "user_id": "1"}})
    # TODO 6: 线程 2、用户 1 问「我叫什么名字？」；再用线程 3、用户 2 问同样的问题
    #         Ask "我叫什么名字？" on thread 2 / user 1, then on thread 3 / user 2
