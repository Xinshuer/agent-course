"""第 46 节参考答案：用 LangChain 的数据连接组件搭一个检索器（加载 → 切分 → 向量化 → 灌库 → 检索）
Lesson 46 solution: build a retriever with LangChain's data-connection pieces
(load → split → embed → store → retrieve).

运行环境 / Environment: .venv（已装 faiss-cpu / faiss-cpu is installed）
运行 / Run (在 practice 文件夹里 / from the practice folder):
    & ..\\.venv\\Scripts\\python.exe l46_retriever_solution.py
需要 / Needs: 不需要任何 API key，也不调用大模型。/ No API key, no model call.
向量模型 / Embedding model: 本地的 BAAI/bge-small-zh-v1.5（fastembed，约 90 MB，第一次运行会下载到
.cache\\fastembed，之后离线可用）。视频用的是 OpenAI 的向量模型；DeepSeek 没有向量接口，
所以这里在本地算向量。向量库和视频一样用 FAISS。
Local BAAI/bge-small-zh-v1.5 via fastembed (~90 MB, downloaded once to .cache\\fastembed).
The video uses an OpenAI embedding model; DeepSeek has no embeddings API, so vectors are computed
locally. The vector store is FAISS, as in the video.

第 48 节的 RAG 链会 `from l46_retriever_solution import build_retriever` 复用这里的函数。
Lesson 48's RAG chain imports build_retriever from this file.
"""
import os
import warnings
from pathlib import Path

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("HF_HOME", os.path.join(PROJECT_DIR, ".cache", "hf"))       # 模型缓存放进项目的 .cache / keep caches in the project's .cache
warnings.filterwarnings("ignore", message=".*langchain-community.*")  # 隐藏「community 包即将停止维护」的提示 / hide the sunset notice

from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import FastEmbedEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter

DATA_FILE = Path(__file__).parent / "data" / "l46_qingsong_report.md"


def build_retriever(k=3):
    """加载资料 → 切块 → 向量化存进 FAISS → 返回检索器。
    Load the report → split → embed into FAISS → return a retriever."""
    # 1. 加载：一个文件变成一个 Document（page_content + metadata）
    # 1. Load: one file becomes one Document (page_content + metadata)
    docs = TextLoader(DATA_FILE, encoding="utf-8").load()

    # 2. 切分：每块最多 150 个字符，相邻两块重叠 30 个字符；中文要加上中文标点作为分隔符
    # 2. Split: chunks of at most 150 characters, 30 overlapping; add Chinese punctuation as separators
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=150,
        chunk_overlap=30,
        separators=["\n\n", "\n", "。", "！", "？", "，", ""],
        keep_separator="end",              # 句号留在句子末尾 / keep "。" at the end of the sentence
    )
    chunks = splitter.split_documents(docs)

    # 3. 向量模型：统一接口 embed_documents / embed_query
    # 3. Embedding model: the common interface is embed_documents / embed_query
    embeddings = FastEmbedEmbeddings(
        model_name="BAAI/bge-small-zh-v1.5",
        cache_dir=os.path.join(PROJECT_DIR, ".cache", "fastembed"),
    )

    # 4. 灌库：把所有块向量化后存进 FAISS（换成别的向量库，通常只改这一行）
    # 4. Store: embed every chunk into FAISS (another vector store usually means changing this line only)
    db = FAISS.from_documents(chunks, embeddings)

    # 5. 检索器：每次返回最相似的 k 块
    # 5. Retriever: returns the k most similar chunks each time
    return db.as_retriever(search_kwargs={"k": k})


if __name__ == "__main__":
    retriever = build_retriever(k=3)
    query = "青松模型有多少参数？"
    docs = retriever.invoke(query)                 # 和模型一样，用 invoke 调用 / invoke, just like a model
    print(f"问题 / Query: {query}\n找到 {len(docs)} 段 / {len(docs)} chunks found:\n")
    for i, d in enumerate(docs, start=1):
        print(f"--- [{i}] ---")
        print(d.page_content)
