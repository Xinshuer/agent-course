"""第 53 节：健康档案向量库 —— 灌库（离线步骤）+ 检索测试（在线步骤），对应视频里的向量库测试脚本
Lesson 53: the health-record vector store - indexing (offline step) + a search test (online step),
matching the video's vector-store test script

做了什么 / What it does:
    和视频的脚本一样，开头是几项配置，后面是一个「向量库连接」类和两个函数：
      INPUT_PDF / PAGE_NUMBERS   要灌库的 PDF，以及处理哪些页（None = 全部页）
      DB_PATH / COLLECTION       Chroma 数据库存在哪个文件夹、用哪个集合（视频：chromaDB 文件夹、demo001）
      load_pdf_text()            用 pdfminer 读出 PDF 的文字（pdfminer.six 已在 .venv-crewai 里）
      split_records()            切块：每条记录以「【」开头，一条记录一块
      MyVectorDBConnector        __init__ 打开（没有就新建）数据库和集合；
                                 add_documents 每批 25 段：算向量 → 连同原文存进集合；
                                 search 把问题变成向量，返回最相近的 top_n 段原文
      vector_store_save()        离线步骤：读 PDF → 切块 → 向量化 → 灌库
      vector_store_search()      在线步骤的检索部分：测试一下能不能查到
    直接运行本文件 = 先灌库，再测试检索（视频里先把工具测通，再交给 Agent）。不调用大模型、不花钱。
    Like the video's script: a few settings, a "vector DB connector" class and two functions. Running
    this file indexes the PDF and then tests retrieval. No LLM call, no cost.

和视频的区别 / Differences from the video:
    向量模型：视频调用 OpenAI 或（经 OneAPI 转发的）通义千问的 embedding 接口；DeepSeek 没有
    embedding 接口，这里用本机的 bge-small-zh（见 l53_embedding.py，和 17 节同一个模型）。
    切块：视频按段落和长度切（中文、英文各一个切块工具）；我们的档案每条记录都很短，按记录切更合适。
    Embeddings: a local bge-small-zh model instead of a cloud embedding API (DeepSeek has none).
    Chunking: one chunk per record instead of the video's paragraph/length splitters.

运行环境 / Environment: .venv-crewai  (chromadb 1.1.1, pdfminer.six)
运行 / Run:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l53_vector_db.py
需要 / Needs: 17 节下载过的向量模型（见 l53_embedding.py）/ the embedding model downloaded in lesson 17 (see l53_embedding.py)
改了档案想重新灌库：删掉 output\\l53_chromadb 文件夹再运行。/ To re-index from scratch, delete output\\l53_chromadb.
"""
from pathlib import Path

import chromadb
from chromadb.config import Settings
from chromadb.telemetry.product import ProductTelemetryClient
from pdfminer.high_level import extract_pages
from pdfminer.layout import LTTextContainer

from l53_embedding import embed

# ---------------------------------------------------------------- 配置 / settings
HERE = Path(__file__).parent                              # 这个 .py 文件所在的文件夹（10 节）
INPUT_PDF = HERE / "data" / "l53_health_records.pdf"      # 视频：input 文件夹里的健康档案 PDF
PAGE_NUMBERS = None                                       # None = 全部页；[1, 2] = 只处理第 1、2 页
DB_PATH = HERE / "output" / "l53_chromadb"                # 视频：chromaDB 文件夹
COLLECTION = "demo001"                                    # 视频用的集合名

# chromadb 即使关了遥测，也会在 C:\Users\<你>\.cache\chroma 写一个小 id 文件；改到 output 里
# Even with telemetry off, chromadb writes a small id file under your home folder; keep it in output/
ProductTelemetryClient.USER_ID_PATH = str(HERE / "output" / "l53_chroma_telemetry_id")


def load_pdf_text(path=INPUT_PDF, page_numbers=None):
    """读出 PDF 的文字。page_numbers=None 读全部页；给一个列表（页码从 1 开始）就只读那几页。"""
    texts = []
    for page_no, page in enumerate(extract_pages(str(path)), start=1):   # 一边遍历一边拿页码
        if page_numbers is not None and page_no not in page_numbers:
            continue                                                     # 不在要处理的页里，跳过
        for element in page:
            if isinstance(element, LTTextContainer):                     # 只要文字块
                texts.append(element.get_text())
    return "".join(texts)


def split_records(text):
    """切块：遇到以「【」开头的标题行就开始新的一块，后面的行都接到这一块里。"""
    chunks = []
    for line in text.splitlines():
        line = line.strip()
        if line.startswith("【"):
            chunks.append(line)
        elif line and chunks:
            chunks[-1] += "\n" + line
    return chunks


class MyVectorDBConnector:
    """向量库连接：打开集合、灌库、检索。/ Vector DB connector: open the collection, index, search."""

    def __init__(self, path=DB_PATH, collection_name=COLLECTION):
        # PersistentClient：数据存到硬盘，文件夹不存在会自动创建，下次运行还在
        client = chromadb.PersistentClient(path=str(path), settings=Settings(anonymized_telemetry=False))
        # embedding_function=None：向量由我们自己算好再传进去
        self.collection = client.get_or_create_collection(name=collection_name, embedding_function=None)

    def add_documents(self, documents, batch_size=25):
        """灌库：每次取 batch_size 段，算向量后连同原文写进集合（视频也是一批 25 段）。"""
        for start in range(0, len(documents), batch_size):
            batch = documents[start:start + batch_size]
            self.collection.upsert(                           # upsert：同一个 id 有就更新、没有就添加
                ids=[f"id{start + i}" for i in range(len(batch))],
                documents=batch,
                embeddings=embed(batch),
            )

    def search(self, query, top_n=5):
        """检索：把问题变成向量，返回最相近的 top_n 段原文。"""
        results = self.collection.query(query_embeddings=embed([query]), n_results=top_n)
        return results["documents"][0]                       # 只问了一个问题，所以取 [0]


def vector_store_save(pdf_path=INPUT_PDF, page_numbers=PAGE_NUMBERS):
    """离线步骤：读 PDF → 切块 → 向量化 → 存进向量库。重复运行也不会重复存（upsert）。"""
    chunks = split_records(load_pdf_text(pdf_path, page_numbers))
    db = MyVectorDBConnector()
    db.add_documents(chunks)
    return db


def vector_store_search(question, top_n=5):
    """检索测试：打印每一段命中记录的标题行。"""
    db = MyVectorDBConnector()
    print(f"\n问题：{question}")
    for doc in db.search(question, top_n=top_n):
        print("  命中：", doc.splitlines()[0])


if __name__ == "__main__":
    db = vector_store_save()
    print(f"灌库完成：集合 {COLLECTION} 里有 {db.collection.count()} 段")
    print("数据库文件夹：", DB_PATH)

    vector_store_search("张三九最近总是头疼，跟他以前的体检结果有关系吗？")
    vector_store_search("张三九平时睡眠和生活习惯怎么样？")
