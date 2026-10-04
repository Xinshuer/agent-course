"""第 17 节练习参考答案：Chroma 知识库 + AgentScope 智能体 = 会查资料的流式聊天（视频的完整实例）
Lesson 17 solution: a Chroma knowledge base + an AgentScope agent = a streaming chat that looks things up
(the video's complete example)

流程 / Flow:
    启动时 create_db() 建库（已经建过就更新）→ 循环：读用户问题 → query() 检索最相近的 7 块
    → 把检索结果和问题一起填进模板 → 打包成 Msg → agent.reply_stream 流式输出
    On start create_db() builds (or refreshes) the database -> loop: read a question -> query() the 7 closest
    chunks -> put them and the question into a template -> wrap in a Msg -> stream the reply

和视频的区别 / Differences from the video:
    - 聊天模型：视频用百炼的千问，这里用 DeepSeek（同样走 OpenAI 兼容接口）
      Chat model: Qwen on Bailian in the video, DeepSeek here (same OpenAI-compatible interface)
    - 向量模型：视频用百炼的向量模型，这里用本地的 LocalEmbedding（见 l17_local_embedding.py）
      Embeddings: Bailian's model in the video, the local LocalEmbedding here
    - 写入：视频用 collection.add，这里用 upsert（重复运行时会更新，而不是被悄悄忽略）
      Writing: the video uses collection.add; upsert here (a re-run updates instead of being silently skipped)

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l17_rag_solution.py
需要 / Needs: DEEPSEEK_API_KEY；本地向量模型第一次运行时下载到项目的 .cache / the local embedding model downloads to the project's .cache on first run
试着问 / Try: 什么是巨型钳蟹？  哪种海怪怕磁铁？  输入 exit 退出 / type exit to quit
"""
import asyncio
from pathlib import Path

import chromadb
from chromadb.config import Settings
from chromadb.telemetry.product import ProductTelemetryClient

from agentscope.agent import Agent
from agentscope.credential import OpenAICredential
from agentscope.message import Msg, TextBlock
from agentscope.model import OpenAIChatModel

from l17_local_embedding import LocalEmbedding
from llm import API_KEY, BASE_URL, MODEL

HERE = Path(__file__).parent
DATA_FILE = HERE / "data" / "l17_sea_monsters.txt"
DB_DIR = HERE / "output" / "l17_chroma_db"
ProductTelemetryClient.USER_ID_PATH = str(HERE / "output" / "l17_chroma_telemetry_id")   # 别写到 C 盘 / not on C:

# ---------- 1. 模型和智能体（同 15 节）/ model and agent (as in lesson 15) ----------
model = OpenAIChatModel(
    model=MODEL,
    credential=OpenAICredential(api_key=API_KEY, base_url=BASE_URL),
    stream=True,
)
agent = Agent(
    name="Friday",
    system_prompt="你是一个海洋怪物百科助手。回答要简短；资料里没有的内容，就直接说不知道。",
    model=model,
)

# ---------- 2. 向量模型 / the embedding model ----------
embedding_model = LocalEmbedding()


def open_collection():
    client = chromadb.PersistentClient(path=str(DB_DIR), settings=Settings(anonymized_telemetry=False))
    return client.get_or_create_collection(
        name="sea_monsters",
        metadata={"hnsw:space": "cosine"},
        embedding_function=None,
    )


# ---------- 3. 建库：按行分块 → 算向量 → 写入 / build: one chunk per line -> embed -> store ----------
async def create_db():
    text = DATA_FILE.read_text(encoding="utf-8")
    chunks = [line.strip() for line in text.splitlines() if line.strip()]
    collection = open_collection()
    res = await embedding_model(chunks)
    ids = [f"chunk_{i}" for i in range(len(chunks))]
    collection.upsert(ids=ids, embeddings=res.embeddings, documents=chunks)


# ---------- 4. 检索：问题 → 向量 → 最相近的几块 / search: question -> vector -> closest chunks ----------
async def query(collection, question, n_results=3):
    res = await embedding_model([question])
    results = collection.query(query_embeddings=[res.embeddings[0]], n_results=n_results)
    return "\n".join(results["documents"][0])


# ---------- 5. 问答循环：检索 → 填模板 → 流式回答 / chat loop: retrieve -> fill template -> stream ----------
async def chat_with_rag():
    collection = open_collection()
    while True:
        user_input = input("\n你：").strip()
        if user_input == "exit":
            break
        if not user_input:
            continue

        knowledge = await query(collection, user_input, n_results=7)     # 视频里取 7 条 / 7 as in the video
        prompt = (
            "以下是从知识库检索到的资料（RAG 注入的内容），请根据这些资料回答：\n"
            f"<资料>\n{knowledge}\n</资料>\n\n"
            f"用户的问题：{user_input}"
        )
        msg = Msg(name="user", role="user", content=[TextBlock(text=prompt)])

        print("Friday：", end="", flush=True)
        async for event in agent.reply_stream(msg):
            if hasattr(event, "delta"):                                  # 15 节的流式写法 / lesson 15 streaming
                print(event.delta, end="", flush=True)
        print()


async def main():
    await create_db()
    await chat_with_rag()


if __name__ == "__main__":
    asyncio.run(main())
