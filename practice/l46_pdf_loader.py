"""第 46 节示例：用 PyPDFLoader 加载 PDF——每一页变成一个 Document，再切成小块
Lesson 46 demo: load a PDF with PyPDFLoader - one Document per page - then split it.

运行环境 / Environment: .venv（已装 pypdf / pypdf is installed）
运行 / Run (在 practice 文件夹里 / from the practice folder):
    & ..\\.venv\\Scripts\\python.exe l46_pdf_loader.py
需要 / Needs: 不需要 API key。/ No API key.
示例 PDF 是一份两页的英文虚构资料：data/l46_qingsong_report.pdf
The sample PDF is a two-page fictional report in English: data/l46_qingsong_report.pdf
想换成自己的 PDF，改 PDF_FILE 就行。/ Point PDF_FILE at your own PDF to try it.
"""
import warnings
from pathlib import Path

warnings.filterwarnings("ignore", message=".*langchain-community.*")

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

PDF_FILE = Path(__file__).parent / "data" / "l46_qingsong_report.pdf"

if __name__ == "__main__":
    pages = PyPDFLoader(PDF_FILE).load()            # 默认 mode="page"：一页一个 Document
    print(f"共 {len(pages)} 页 / {len(pages)} pages")
    for doc in pages:
        print("\nmetadata:", {k: doc.metadata[k] for k in ("page", "page_label", "total_pages")})
        print(doc.page_content)

    splitter = RecursiveCharacterTextSplitter(chunk_size=120, chunk_overlap=30)
    chunks = splitter.split_documents(pages)       # 每块都会带上它来自哪一页 / each chunk keeps its page number
    print(f"\n切成 {len(chunks)} 块 / split into {len(chunks)} chunks:")
    for c in chunks:
        print(f"  [page {c.metadata['page']}] {c.page_content!r}")
