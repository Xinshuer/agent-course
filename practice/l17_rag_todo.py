"""第 17 节练习：Chroma 知识库 + AgentScope 智能体（TODO 版）
Lesson 17 exercise: a Chroma knowledge base + an AgentScope agent (TODO version)

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l17_rag_todo.py
需要 / Needs: DEEPSEEK_API_KEY；本地向量模型第一次运行时下载到项目的 .cache / the local embedding model downloads to the project's .cache on first run
参考答案 / Solution: l17_rag_solution.py
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
ProductTelemetryClient.USER_ID_PATH = str(HERE / "output" / "l17_chroma_telemetry_id")

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
embedding_model = LocalEmbedding()


def open_collection():
    # TODO 1: 创建存到硬盘的客户端，再取得（没有就新建）一个用余弦相似度的集合
    #         client = chromadb.PersistentClient(path=str(DB_DIR), settings=Settings(anonymized_telemetry=False))
    #         return client.get_or_create_collection(name="sea_monsters",
    #                                                metadata={"hnsw:space": "cosine"}, embedding_function=None)
    #         Create a client that saves to disk, then get (or create) a collection that uses cosine similarity
    return None


async def create_db():
    # TODO 2: 读出 DATA_FILE 的文字，按行分块，去掉空行
    #         提示：[line.strip() for line in text.splitlines() if line.strip()]
    #         Read DATA_FILE, one chunk per line, skip empty lines
    chunks = []
    collection = open_collection()

    # TODO 3: res = await embedding_model(chunks)；给每块一个 id：[f"chunk_{i}" for i in range(len(chunks))]
    #         再 collection.upsert(ids=..., embeddings=res.embeddings, documents=chunks)
    #         Embed the chunks, give each an id, then upsert ids, embeddings and documents


async def query(collection, question, n_results=3):
    # TODO 4: 把问题变成向量（传列表，取 res.embeddings[0]），
    #         用 collection.query(query_embeddings=[...], n_results=n_results) 检索，
    #         取 results["documents"][0]，用 "\n" 拼成一个字符串返回
    #         Embed the question (pass a list, take res.embeddings[0]), query the collection,
    #         take results["documents"][0] and return it joined with "\n"
    return ""


async def chat_with_rag():
    collection = open_collection()
    while True:
        user_input = input("\n你：").strip()
        if user_input == "exit":
            break
        if not user_input:
            continue
        # TODO 5: 检索 7 条资料，和问题一起填进提示词模板（f-string），打包成 Msg
        #         Retrieve 7 passages, put them and the question into a prompt (f-string), wrap it in a Msg
        msg = None
        if msg is None:
            print("先完成 TODO 5 / finish TODO 5 first")
            break

        print("Friday：", end="", flush=True)
        async for event in agent.reply_stream(msg):
            if hasattr(event, "delta"):
                print(event.delta, end="", flush=True)
        print()


async def main():
    await create_db()
    await chat_with_rag()


if __name__ == "__main__":
    asyncio.run(main())
