"""第 52 节练习：自己写一个「把报告保存成 PDF」的工具，并单独测试它
Lesson 52 exercise: write a "save the report as a PDF" tool and test it on its own

按 TODO 补全代码，然后运行。这个练习不调用模型、不花钱。卡住了就看 l52_tools_solution.py。
PDF 的细节已经写好在 l52_pdf.py 的 text_to_pdf(text, path) 里，直接调用即可。
Fill in the TODOs, then run. No model call, no cost. Stuck? See l52_tools_solution.py.
The PDF details are ready in text_to_pdf(text, path) from l52_pdf.py; just call it.

运行环境 / Environment: .venv-crewai  (crewai 1.15.23, PyMuPDF)
运行 / Run:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l52_tools_todo.py
需要 / Needs: 无 / nothing
"""
import os
from pathlib import Path

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")                      # 不上传执行追踪 / no trace upload
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))  # CrewAI 的小数据库放进项目的 .cache / keep its db in the project's .cache

from crewai.tools import tool  # noqa: E402

from l52_pdf import text_to_pdf  # noqa: E402

OUTPUT_DIR = Path("output")


# TODO 1：用 @tool("save_report") 装饰一个函数 save_report(text: str, filename: str) -> str
#   - 两个参数都要写类型提示（CrewAI 用它生成参数说明）
#   - 写一个文档字符串：说明工具做什么、text 和 filename 分别是什么（模型靠它决定怎么用）
#   - 函数体：OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
#             path = OUTPUT_DIR / f"{filename}.pdf"
#             text_to_pdf(text, path)
#             返回一句包含 path 的提示，例如 f"报告已保存，请前往 {path} 查看报告。"
# TODO 1: decorate save_report(text: str, filename: str) -> str with @tool("save_report")
#   - type hints on both parameters (CrewAI builds the argument schema from them)
#   - a docstring saying what the tool does and what text / filename mean (the model relies on it)
#   - body: create OUTPUT_DIR, call text_to_pdf(text, OUTPUT_DIR / f"{filename}.pdf"), return a message with the path


if __name__ == "__main__":
    # TODO 2：打印 save_report.name 和 save_report.description，看看模型会看到什么
    # TODO 2: print save_report.name and save_report.description
    # TODO 3：用 save_report.run(text="你好，欢迎使用 PDF 保存工具！", filename="测试报告") 单独测试，打印返回值
    # TODO 3: test it with save_report.run(text="Hello, PDF tool!", filename="test_report") and print the result
    pass
