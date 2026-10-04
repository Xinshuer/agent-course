"""第 31 节练习参考答案：跨线程持久化——用 InMemoryStore 在不同线程之间共享用户记忆（视频第二部分）
Lesson 31 solution: cross-thread persistence - sharing user memories between threads with an
InMemoryStore (part 2 of the video)

- checkpointer 按 thread_id 保存每段对话，线程之间互不相通；
- store 按 namespace（这里是 ("memories", user_id)）保存记忆，任何线程都能读到，相当于一个「中转站」。
- 节点从 config 里读出 user_id，按「意思」搜索这位用户的记忆放进 system 提示词；
  用户说「记住」时，写入一条记忆（和视频一样，演示用的内容是写死的）。
- The checkpointer saves each conversation per thread_id; threads never see each other.
- The store keeps memories per namespace (here ("memories", user_id)), readable from any thread - a relay.
- The node reads user_id from config, searches this user's memories by meaning and puts them into the
  system prompt; when the user says "记住"/"remember", it saves a (hard-coded, as in the video) memory.

和视频的区别 / Differences from the video:
- 视频用 OpenAIEmbeddings 封装调用 BGE-M3 向量模型（1024 维，需要另外的服务和 key）；
  这里用本机的 fastembed 小模型 BAAI/bge-small-zh-v1.5（512 维，第 17 节用过，缓存在项目的 .cache 里，不需要 key）。
- The video calls a BGE-M3 embedding model through OpenAIEmbeddings (1024 dims, needs its own service/key);
  here a local fastembed model, BAAI/bge-small-zh-v1.5 (512 dims, used in lesson 17, cached in the project's .cache, no key).

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l31_cross_thread_solution.py
会调用 3 次 DeepSeek / Makes 3 DeepSeek calls.
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

# 1. 向量模型 + 带向量索引的 store / an embedding model + a store with a vector index
embedder = TextEmbedding("BAAI/bge-small-zh-v1.5", cache_dir=os.path.join(PROJECT_DIR, ".cache", "fastembed"))


def embed(texts):
    """把一批文字变成一批向量，每个向量 512 个数字 / turn texts into vectors of 512 numbers each"""
    return [vector.tolist() for vector in embedder.embed(texts)]


# dims 必须等于向量模型输出的维度（视频的 BGE-M3 是 1024，这里是 512）
# dims must equal the model's output size (BGE-M3 in the video: 1024; here: 512)
in_memory_store = InMemoryStore(index={"embed": embed, "dims": 512})


# 2. 节点：state、config 和 store 三个参数，store 由 LangGraph 自动传进来
#    The node takes state, config and store; LangGraph passes the store in for you
def call_model(state: MessagesState, config: RunnableConfig, *, store: BaseStore):
    user_id = config["configurable"]["user_id"]                 # 从 config 里取出 user_id
    namespace = ("memories", user_id)                           # 这个用户的「抽屉」/ this user's drawer
    memories = store.search(namespace, query=str(state["messages"][-1].content))   # 按意思搜索 / semantic search
    info = "\n".join([d.value["data"] for d in memories])
    print(f"   [日志/log] 用户 {user_id} 检索到 / found: {info or '（无 / none）'}")
    system_msg = f"你是一个正在和用户聊天的助手。用户信息：{info}"

    last_message = state["messages"][-1]
    if "记住" in last_message.content or "remember" in last_message.content.lower():
        memory = "用户的名字是托米张"                             # 演示用：写死的记忆 / hard-coded for the demo
        store.put(namespace, str(uuid.uuid4()), {"data": memory})
        print(f"   [日志/log] 写入记忆 / saved: {memory}")

    response = model.invoke([{"role": "system", "content": system_msg}] + state["messages"])
    return {"messages": [response]}


builder = StateGraph(MessagesState)
builder.add_node("call_model", call_model)
builder.add_edge(START, "call_model")
builder.add_edge("call_model", END)
graph = builder.compile(checkpointer=InMemorySaver(), store=in_memory_store)   # 两样都要传 / pass both


def chat(text, config):
    inputs = {"messages": [{"role": "user", "content": text}]}
    for chunk in graph.stream(inputs, config, stream_mode="values"):
        chunk["messages"][-1].pretty_print()


if __name__ == "__main__":
    print("\n######## 线程 1 / 用户 1：请它记住名字 / thread 1, user 1 ########")
    chat("你好！请记住：我的名字叫托米张。请简短回答。", {"configurable": {"thread_id": "1", "user_id": "1"}})

    print("\n######## 线程 2 / 用户 1：新线程，同一个用户 / thread 2, same user ########")
    chat("我叫什么名字？", {"configurable": {"thread_id": "2", "user_id": "1"}})

    print("\n######## 直接查看 store 里用户 1 的记忆 / user 1's memories in the store ########")
    for memory in in_memory_store.search(("memories", "1")):
        print("  ", memory.value)

    print("\n######## 线程 3 / 用户 2：另一个用户 / thread 3, another user ########")
    chat("我叫什么名字？", {"configurable": {"thread_id": "3", "user_id": "2"}})
