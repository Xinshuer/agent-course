"""第 53 节辅助脚本：把虚构的健康档案（Markdown）做成一份 PDF，当作视频里的「健康档案.pdf」
Lesson 53 helper: turn the fictional health records (Markdown) into a PDF, standing in for the video's PDF archive

视频的知识库是一份 PDF 健康档案。这里的档案是我们自己编的，原文在 data/l53_health_records.md
（方便在 VS Code 里阅读和修改）；运行本脚本，就把它排成 data/l53_health_records.pdf：
每条记录的标题「## 张三九｜基本信息」变成「【张三九｜基本信息】」，灌库时按「【」切块。
课程已经附带生成好的 PDF；只有你改了 .md 之后，才需要重新运行本脚本，然后删掉
output\\l53_chromadb 文件夹、再运行 l53_vector_db.py 重新灌库。
The video's knowledge base is a PDF. Our records are made up; the source text is data/l53_health_records.md.
This script lays it out as data/l53_health_records.pdf (headings "## X" become "【X】", which the indexing
step splits on). The PDF ships with the course; rerun this only after editing the .md, then delete
output\\l53_chromadb and run l53_vector_db.py again.

运行环境 / Environment: .venv-crewai  (PyMuPDF，见 l52_pdf.py)
运行 / Run:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l53_make_pdf.py
需要 / Needs: 无 / nothing
"""
from pathlib import Path

from l52_pdf import text_to_pdf

HERE = Path(__file__).parent
SOURCE = HERE / "data" / "l53_health_records.md"
TARGET = HERE / "data" / "l53_health_records.pdf"


def markdown_to_plain(md):
    """去掉 Markdown 记号：# 总标题、> 说明行原样保留文字；## 记录标题改成【标题】。"""
    lines = []
    for line in md.splitlines():
        if line.startswith("## "):
            line = "【" + line[3:].strip() + "】"
        elif line.startswith("# "):
            line = line[2:].strip()
        elif line.startswith("> "):
            line = line[2:].strip()
        lines.append(line)
    return "\n".join(lines)


if __name__ == "__main__":
    text = markdown_to_plain(SOURCE.read_text(encoding="utf-8"))
    pages = text_to_pdf(text, TARGET)
    print(f"已生成 {TARGET}（{pages} 页）")
