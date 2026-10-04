"""第 17 节：用 Chroma 建一个向量知识库，再按问题检索（视频前两段代码，不调用大模型）
Lesson 17: build a vector knowledge base in Chroma, then search it (the video's first two code parts, no LLM call)

做了什么 / What it does:
    create_db()：读 data/l17_sea_monsters.txt → 按行分块 → 每块算向量 → 存进 Chroma 的一个集合
    query()：把问题变成向量 → collection.query 找出最相近的几块 → 拼成一个字符串
    create_db(): read the file -> one chunk per line -> embed every chunk -> store them in a Chroma collection
    query(): embed the question -> collection.query finds the closest chunks -> join them into one string

数据库存在 practice/output/l17_chroma_db 文件夹里（PersistentClient = 存到硬盘，下次还能直接用）。
The database lives in practice/output/l17_chroma_db (PersistentClient = saved on disk, reused next time).
向量模型用本地的 LocalEmbedding（见 l17_local_embedding.py），视频用的是百炼的向量模型。
Vectors come from the local LocalEmbedding (see l17_local_embedding.py); the video uses Bailian's embedding model.

运行环境 / Environment: .venv  (chromadb 1.1.1)
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l17_chroma_basics.py
需要 / Needs: 无，完全离线 / nothing, fully offline
"""
import asyncio
from pathlib import Path

import chromadb
from chromadb.config import Settings
from chromadb.telemetry.product import ProductTelemetryClient

from l17_local_embedding import LocalEmbedding

HERE = Path(__file__).parent
DATA_FILE = HERE / "data" / "l17_sea_monsters.txt"
DB_DIR = HERE / "output" / "l17_chroma_db"

# chromadb 即使关了遥测，也会在 C:\Users\<你>\.cache\chroma 写一个小 id 文件；改到 output 里
# Even with telemetry off, chromadb writes a small id file under your home folder; keep it in output/
ProductTelemetryClient.USER_ID_PATH = str(HERE / "output" / "l17_chroma_telemetry_id")

embedding_model = LocalEmbedding()          # 视频：百炼的向量模型 / video: Bailian's embedding model


def open_collection():
    """打开（第一次运行时创建）数据库和集合 / open - or on the first run create - the database and collection"""
    client = chromadb.PersistentClient(path=str(DB_DIR), settings=Settings(anonymized_telemetry=False))
    return client.get_or_create_collection(
        name="sea_monsters",                 # 集合名，可以随便起 / any name you like
        metadata={"hnsw:space": "cosine"},   # 用余弦相似度比较 / compare with cosine similarity
        embedding_function=None,             # 向量由我们自己算好再传进去 / we pass our own vectors
    )


async def create_db():
    # 1. 读文字，按行分块（每行一种海怪）/ read the text, one chunk per line (one monster per line)
    text = DATA_FILE.read_text(encoding="utf-8")
    chunks = [line.strip() for line in text.splitlines() if line.strip()]

    # 2. 打开集合 / open the collection
    collection = open_collection()

    # 3. 每块算一个向量（视频里这一步要联网，所以要 await）/ embed every chunk (online in the video, hence await)
    res = await embedding_model(chunks)

    # 4. 每块一个唯一的 id，然后写进集合 / a unique id per chunk, then write them into the collection
    ids = [f"chunk_{i}" for i in range(len(chunks))]
    collection.upsert(ids=ids, embeddings=res.embeddings, documents=chunks)
    print(f"知识库里现在有 {collection.count()} 块 / chunks in the collection: {collection.count()}")


async def query(collection, question, n_results=3):
    """检索：找出和问题最相近的 n_results 块，拼成一个字符串 / the n_results closest chunks as one string"""
    res = await embedding_model([question])          # 传进去的也是列表 / a list, even for one question
    question_vector = res.embeddings[0]              # 只有一个问题，取第 0 个 / one question -> item 0
    results = collection.query(query_embeddings=[question_vector], n_results=n_results)
    docs = results["documents"][0]                   # 第 0 个问题的结果 / results of question 0
    return "\n".join(docs)


async def main():
    await create_db()
    collection = open_collection()
    for question in ["什么是巨型钳蟹？", "哪种海怪怕磁铁？"]:
        print(f"\n问题 / question: {question}")
        print(await query(collection, question, n_results=2))


if __name__ == "__main__":
    asyncio.run(main())
