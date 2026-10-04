"""第 46 节练习：用 LangChain 的数据连接组件搭一个检索器（按 TODO 补全）
Lesson 46 exercise: build a retriever with LangChain's data-connection pieces (fill in the TODOs).

运行环境 / Environment: .venv（已装 faiss-cpu / faiss-cpu is installed）
运行 / Run (在 practice 文件夹里 / from the practice folder):
    & ..\\.venv\\Scripts\\python.exe l46_retriever_todo.py
需要 / Needs: 不需要 API key。/ No API key.
向量模型第一次运行会下载到 .cache\\fastembed（约 90 MB）。
The embedding model is downloaded once to .cache\\fastembed (~90 MB).
参考答案 / Solution: l46_retriever_solution.py
"""
import os
import warnings
from pathlib import Path

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("HF_HOME", os.path.join(PROJECT_DIR, ".cache", "hf"))
warnings.filterwarnings("ignore", message=".*langchain-community.*")

from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import FastEmbedEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter

DATA_FILE = Path(__file__).parent / "data" / "l46_qingsong_report.md"


def build_retriever(k=3):
    # TODO 1: 用 TextLoader 加载 DATA_FILE（记得 encoding="utf-8"），调用 .load() 得到 docs
    # TODO 1: load DATA_FILE with TextLoader (encoding="utf-8") and call .load() to get docs
    docs = ...

    # TODO 2: 创建 RecursiveCharacterTextSplitter：chunk_size=150, chunk_overlap=30,
    #         separators=["\n\n", "\n", "。", "！", "？", "，", ""], keep_separator="end"
    #         然后用 split_documents(docs) 切块
    # TODO 2: create the splitter with the settings above, then split_documents(docs)
    chunks = ...

    # TODO 3: 创建向量模型 FastEmbedEmbeddings(model_name="BAAI/bge-small-zh-v1.5",
    #         cache_dir=os.path.join(PROJECT_DIR, ".cache", "fastembed"))
    # TODO 3: create the embedding model (keep cache_dir in the project's .cache)
    embeddings = ...

    # TODO 4: 用 FAISS.from_documents(chunks, embeddings) 灌库
    # TODO 4: build the vector store with FAISS.from_documents
    db = ...

    # TODO 5: 返回检索器 db.as_retriever(search_kwargs={"k": k})
    # TODO 5: return db.as_retriever(search_kwargs={"k": k})
    return ...


if __name__ == "__main__":
    retriever = build_retriever(k=3)
    # TODO 6: 用 retriever.invoke("青松模型有多少参数？") 检索，并打印每一段的 page_content
    # TODO 6: call retriever.invoke("...") and print each chunk's page_content
    pass
