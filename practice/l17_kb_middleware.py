"""第 17 节（补充，视频没有讲）：用 AgentScope 自带的 RAG 组件做同样的事
Lesson 17 (extra, not in the video): the same job with AgentScope's own RAG building blocks

视频直接用 chromadb 存向量、自己写检索函数、自己把资料拼进提示词。AgentScope 2.x 也自带一套 RAG 组件：
TextParser（读文件）→ ApproxTokenChunker（切块）→ 向量模型 → 向量库 → KnowledgeBase → RAGMiddleware。
2.0.9 自带的向量库是 Qdrant / Milvus / Elasticsearch / MongoDB（都要另装包，本课没装），没有 Chroma，
所以这里写了一个最简单的内存向量库 MemoryStore（向量放在 Python 列表里，程序结束就没了）当「替身」。
The video stores vectors with chromadb, writes its own search function and pastes the results into the prompt
itself. AgentScope 2.x also ships RAG parts: TextParser -> ApproxTokenChunker -> embedding model -> vector store
-> KnowledgeBase -> RAGMiddleware. Its stores in 2.0.9 are Qdrant / Milvus / Elasticsearch / MongoDB (extra
packages, not installed here) - no Chroma - so a minimal in-memory MemoryStore stands in for them.

MODE = "static"：每次提问前自动检索，把结果塞进上下文（和视频的做法一样，只是框架替你做了）
MODE = "agentic"：给模型一个 search_knowledge 工具，让它自己决定要不要查
MODE = "static": search automatically before every answer (what the video does by hand)
MODE = "agentic": give the model a search_knowledge tool and let it decide

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l17_kb_middleware.py
需要 / Needs: DEEPSEEK_API_KEY；本地向量模型（l17_local_embedding.py）/ the local embedding model
"""
import asyncio
from pathlib import Path

import numpy as np

from agentscope.agent import Agent
from agentscope.credential import OpenAICredential
from agentscope.message import UserMsg
from agentscope.middleware import RAGMiddleware
from agentscope.model import OpenAIChatModel
from agentscope.rag import (
    ApproxTokenChunker,
    DocumentSummary,
    KnowledgeBase,
    TextParser,
    VectorSearchResult,
    VectorStoreBase,
)
from agentscope.tool import Toolkit

from l17_local_embedding import LocalEmbedding
from llm import API_KEY, BASE_URL, MODEL

# 一定要是存在的绝对路径：TextParser 遇到不存在的路径不会报错，而是把路径文字本身当成文档
# Must be an existing absolute path: for a missing path TextParser silently treats the path text as the document
DATA_FILE = (Path(__file__).parent / "data" / "l17_sea_monsters.txt").resolve()

MODE = "static"


def by_score(result):
    return result.score


class MemoryStore(VectorStoreBase):
    """最简单的内存向量库（不支持 metadata_filter）/ the simplest in-memory store (ignores metadata_filter)"""

    def __init__(self):
        self._collections = {}                           # 集合名 → 记录列表 / name → list of records

    async def create_collection(self, name, dimensions):
        self._collections.setdefault(name, [])

    async def delete_collection(self, name):
        self._collections.pop(name, None)

    async def has_collection(self, name):
        return name in self._collections

    async def insert(self, collection, records):
        self._collections[collection].extend(records)

    async def delete(self, collection, document_id):
        records = self._collections[collection]
        self._collections[collection] = [r for r in records if r.document_id != document_id]

    async def search(self, collection, query_vector, top_k=5, metadata_filter=None):
        q = np.array(query_vector)
        results = []
        for r in self._collections[collection]:
            v = np.array(r.vector)
            score = float(q @ v / (np.linalg.norm(q) * np.linalg.norm(v)))
            results.append(VectorSearchResult(score=score, document_id=r.document_id, chunk=r.chunk))
        results.sort(key=by_score, reverse=True)
        return results[:top_k]

    async def list_documents(self, collection, metadata_filter=None):
        summaries = {}
        for r in self._collections[collection]:
            if r.document_id in summaries:
                summaries[r.document_id].chunk_count += 1
            else:
                summaries[r.document_id] = DocumentSummary(
                    document_id=r.document_id, source=r.chunk.source, chunk_count=1, metadata=r.chunk.metadata,
                )
        return list(summaries.values())


async def build_knowledge_base():
    # 1. 解析：整个文件变成一个 Section / parse: the whole file becomes one Section
    sections = await TextParser().parse(str(DATA_FILE), filename=DATA_FILE.name)
    # 2. 切块：每块大约 120 个 token，相邻块重叠 20 个 / chunk: ~120 tokens each, 20 overlapping
    chunker = ApproxTokenChunker(ApproxTokenChunker.Parameters(chunk_size=120, overlap=20))
    chunks = await chunker.chunk(sections)
    print(f"切成了 {len(chunks)} 块 / {len(chunks)} chunks")
    # 3. 知识库 = 向量模型 + 向量库 + 集合名 / knowledge base = embedding model + store + collection
    kb = KnowledgeBase(
        name="sea_monsters",
        description="幻想海怪百科：每种海怪的栖息地、体型、能力和弱点",
        embedding_model=LocalEmbedding(),
        vector_store=MemoryStore(),
        collection="sea_monsters",
    )
    # 4. 写入：算向量并存进向量库 / insert: embed and store
    await kb.insert_document(chunks)
    return kb


async def main():
    kb = await build_knowledge_base()

    # 不经过模型，直接检索 / search without any model call
    for hit in await kb.search(["哪种海怪怕磁铁"], top_k=2):
        print(f"{hit.score:.3f}", hit.chunk.content.text[:40].replace("\n", " "), "...")

    rag = RAGMiddleware(knowledge_bases=[kb], parameters=RAGMiddleware.Parameters(mode=MODE, top_k=3))
    # agentic 模式下，中间件提供的工具要自己放进 Toolkit；static 模式下 list_tools() 返回空列表
    # in agentic mode you add the middleware's tool to the Toolkit yourself; in static mode list_tools() is empty
    toolkit = Toolkit(tools=await rag.list_tools())
    agent = Agent(
        name="Friday",
        system_prompt="你是一个海洋怪物百科助手，只根据知识库里的资料回答，回答要简短。",
        model=OpenAIChatModel(model=MODEL, credential=OpenAICredential(api_key=API_KEY, base_url=BASE_URL)),
        toolkit=toolkit,
        middlewares=[rag],
    )
    reply = await agent.reply(UserMsg(name="user", content="哪种海怪怕磁铁？它有多长？"))
    print("Friday:", reply.get_text_content())


if __name__ == "__main__":
    asyncio.run(main())
