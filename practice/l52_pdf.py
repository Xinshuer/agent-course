"""第 52、53 节辅助模块：把一段文字（可以有中文）存成 PDF
Lessons 52-53 helper: save a piece of text (Chinese is fine) as a PDF

视频的工具用一个 PDF 库加上单独下载的中文字体文件来生成 PDF（不加字体，中文会变成乱码）。
这里用 PyMuPDF（crewai-tools 自带的依赖，.venv-crewai 里已经有了），它内置了简体中文字体
"china-s"，所以不用另外下载字体。这个文件只是「PDF 细节」，学习重点在工具怎么写，不需要会写这里。
The video's tool uses a PDF library plus a separately downloaded Chinese font (without it Chinese
comes out garbled). This uses PyMuPDF (a dependency of crewai-tools, already in .venv-crewai), which
has a built-in Simplified Chinese font, "china-s", so no font download is needed. This file is just
"PDF details"; the lesson is about writing the tool, so you don't need to be able to write this.

运行环境 / Environment: .venv-crewai  (PyMuPDF 1.26.7)
自测 / Self-test:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l52_pdf.py
需要 / Needs: 无 / nothing
"""
from pathlib import Path

import pymupdf


def strip_markdown(text):
    """模型写的报告常带 Markdown 记号（# 标题、**加粗**、--- 分隔线），PDF 里不会渲染，去掉更好看。
    Reports from the model often contain Markdown marks (# headings, **bold**, --- rules); drop them."""
    lines = []
    for line in text.splitlines():
        stripped = line.strip()
        if stripped in ("---", "***", "___"):          # 分隔线 / horizontal rules
            continue
        if stripped.startswith("#"):                  # 标题：去掉开头的 # / headings
            line = stripped.lstrip("#").strip()
        lines.append(line.replace("**", ""))
    return "\n".join(lines)


def text_to_pdf(text, path):
    """把 text 写进 path 指定的 PDF 文件（A4，自动换行、自动分页），返回页数。
    Write text to the PDF at path (A4, wrapped and paginated); return the page count."""
    doc = pymupdf.open()                              # 新建一个空白 PDF / a new, empty PDF
    font = pymupdf.Font("china-s")                    # 内置的简体中文字体 / built-in Simplified Chinese font
    rest = strip_markdown(text).strip() or "（没有内容）"   # 空文本也至少生成一页 / at least one page
    while rest:
        page = doc.new_page(width=595, height=842)    # A4 大小（单位：点）/ A4 size in points
        writer = pymupdf.TextWriter(page.rect)
        # 在留了 50 点页边距的方框里排字；放不下的行会被返回 / lines that do not fit are returned
        left = writer.fill_textbox(page.rect + (50, 50, -50, -50), rest, font=font, fontsize=11)
        writer.write_text(page)
        new_rest = "\n".join(line for line, _ in left) if left else ""
        if new_rest == rest:                          # 一行都放不下时停止，防止死循环 / safety stop
            break
        rest = new_rest
    doc.subset_fonts()                                # 只保留用到的字，文件小很多 / embed only used glyphs
    doc.save(str(path), garbage=3, deflate=True)
    pages = doc.page_count
    doc.close()
    return pages


if __name__ == "__main__":
    out = Path("output")
    out.mkdir(exist_ok=True)
    n = text_to_pdf("你好，欢迎使用 PDF 保存工具！\nHello, PDF.", out / "l52_pdf_test.pdf")
    print(f"已保存 / saved: {out / 'l52_pdf_test.pdf'}（{n} 页 / page(s)）")
