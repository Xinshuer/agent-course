"""第 17 节辅助文件：本地向量模型 LocalEmbedding（替代视频里的百炼向量模型）
Lesson 17 helper: LocalEmbedding, a local embedding model (stands in for the video's Bailian embedding model)

视频用 AgentScope 的百炼（DashScope）向量模型，要百炼的 API key；DeepSeek 没有向量接口。
这里用 fastembed 在本机 CPU 上运行 BAAI/bge-small-zh-v1.5（每段文字变成 512 个数），不联网、不花钱。
它继承 AgentScope 的 EmbeddingModelBase，所以用法和视频里的向量模型完全一样：
    res = await embedding_model(["一段文字", "另一段文字"])
    res.embeddings          # 向量列表，每段文字一个
有百炼 key 时，换成下面这一行即可，其余代码不用改：
    DashScopeEmbeddingModel(credential=DashScopeCredential(api_key=...), model="text-embedding-v4", dimensions=1024)

The video uses AgentScope's Bailian (DashScope) embedding model, which needs a Bailian key; DeepSeek has no
embeddings API. This runs BAAI/bge-small-zh-v1.5 on your CPU with fastembed (512 numbers per text), offline and free.
It subclasses AgentScope's EmbeddingModelBase, so you call it exactly like the video's model (see above).
With a Bailian key, swap in the DashScopeEmbeddingModel line above; nothing else changes.

运行环境 / Environment: .venv
这个文件不用单独运行，由 l17_chroma_basics.py / l17_rag_solution.py 导入。
自测 / Self-test:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l17_local_embedding.py
需要 / Needs: 无；第一次运行会联网下载模型到项目的 .cache\\fastembed / nothing; the first run downloads the model to the project's .cache\\fastembed
"""
import asyncio
import os

# 模型缓存放进项目的 .cache：必须在导入 fastembed 之前设置 / keep model caches in the project's .cache (set before importing fastembed)
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("HF_HOME", os.path.join(PROJECT_DIR, ".cache", "hf"))

from fastembed import TextEmbedding

from agentscope.credential import CredentialBase
from agentscope.embedding import EmbeddingModelBase, EmbeddingResponse

CACHE_DIR = os.path.join(PROJECT_DIR, ".cache", "fastembed")


class LocalEmbedding(EmbeddingModelBase):
    """在本机运行的向量模型 / an embedding model that runs on this computer"""

    def __init__(self):
        super().__init__(
            credential=CredentialBase(name="local"),   # 本地模型不需要 key / no key needed locally
            model="BAAI/bge-small-zh-v1.5",
            dimensions=512,                            # 每段文字 512 个数 / 512 numbers per text
            parameters=None,
            context_size=512,
            batch_size=64,
            max_retries=0,
            retry_delay=0,
        )
        self._embedder = TextEmbedding(self.model, cache_dir=CACHE_DIR)

    async def _call_api(self, inputs, **kwargs):
        vectors = [v.tolist() for v in self._embedder.embed(inputs)]
        return EmbeddingResponse(embeddings=vectors)


async def _self_test():
    embedding_model = LocalEmbedding()
    res = await embedding_model(["巨型钳蟹怕什么？", "今天天气不错"])
    print("向量个数 / vectors:", len(res.embeddings))
    print("每个向量的长度 / numbers per vector:", len(res.embeddings[0]))
    print("前 5 个数 / first 5 numbers:", [round(x, 4) for x in res.embeddings[0][:5]])


if __name__ == "__main__":
    asyncio.run(_self_test())
