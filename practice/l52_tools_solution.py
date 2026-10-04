"""第 52 节参考答案：给 Agent 写一个外部工具 —— 把报告保存成本地 PDF 文件
Lesson 52 solution: an external tool for an agent - save a report as a local PDF

做了什么 / What it does:
    1. clean_filename：把模型给的文件名里 Windows 不允许的字符换掉
    2. save_report：用 @tool 装饰的工具（和视频一样），把报告写成 output/<文件名>.pdf，
       返回「请前往……查看」的提示；PDF 细节交给 l52_pdf.py 的 text_to_pdf
    3. SaveReportTool：同一个工具的 BaseTool 写法（官方模板 tools/custom_tool.py 的风格，补充）
    4. 直接运行本文件 = 单独测试工具（视频里 unit_test 文件夹的思路），不调用模型、不花钱
    1. clean_filename replaces characters Windows forbids in file names
    2. save_report: a @tool (as in the video) that writes the report to output/<name>.pdf and returns
       a "go and read it at ..." message; the PDF details live in text_to_pdf (l52_pdf.py)
    3. SaveReportTool: the same tool as a BaseTool subclass (the template's tools/custom_tool.py style, extra)
    4. Running this file tests the tools on their own (the video's unit_test idea) - no model, no cost

运行环境 / Environment: .venv-crewai  (crewai 1.15.23, PyMuPDF)
运行 / Run:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l52_tools_solution.py
需要 / Needs: 无 / nothing (no API key, no network)
"""
import os
import re
from pathlib import Path

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")                      # 不上传执行追踪 / no trace upload
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))  # CrewAI 的小数据库放进项目的 .cache / keep its db in the project's .cache

from crewai.tools import BaseTool, tool  # noqa: E402
from pydantic import BaseModel, Field  # noqa: E402

from l52_pdf import text_to_pdf  # noqa: E402

OUTPUT_DIR = Path("output")        # 相对于运行命令时所在的文件夹 / relative to where you run the command


def clean_filename(name: str) -> str:
    """把 Windows 文件名里不允许的字符和空白换成下划线；结果为空时用 report。"""
    name = re.sub(r'[\\/:*?"<>|\s]+', "_", name).strip("_.")
    return name or "report"


# ---------------------------------------------------------------- 写法一：@tool（视频的写法）/ style 1: @tool (the video's)
@tool("save_report")
def save_report(text: str, filename: str) -> str:
    """把一份报告保存成本地 PDF 文件（支持中文）。
    text：要保存的报告全文。
    filename：PDF 文件名，不带路径和扩展名，例如「人工智能技术趋势报告」。
    返回保存状态的提示，告诉用户去哪里查看报告。"""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)              # 文件夹不存在就建 / create the folder if needed
    path = OUTPUT_DIR / f"{clean_filename(filename)}.pdf"
    text_to_pdf(text, path)
    return f"报告已保存，请前往 {path} 查看报告。"


# ---------------------------------------------------------------- 写法二：BaseTool（补充）/ style 2: BaseTool (extra)
class SaveReportInput(BaseModel):
    """工具参数：每个字段的 description 都会给模型看。/ Each field's description is shown to the model."""
    text: str = Field(description="要保存的报告全文")
    filename: str = Field(description="PDF 文件名，不带路径和扩展名")


class SaveReportTool(BaseTool):
    name: str = "save_report"
    description: str = "把一份报告保存成本地 PDF 文件（支持中文），返回保存状态的提示。"
    args_schema: type[BaseModel] = SaveReportInput
    output_dir: str = "output"          # 类的属性可以当作工具的「配置」/ a class attribute works as config

    def _run(self, text: str, filename: str) -> str:
        folder = Path(self.output_dir)
        folder.mkdir(parents=True, exist_ok=True)
        path = folder / f"{clean_filename(filename)}.pdf"
        text_to_pdf(text, path)
        return f"报告已保存，请前往 {path} 查看报告。"


if __name__ == "__main__":
    # 先看看模型会看到什么 / what the model will see
    print("name:", save_report.name)
    print("description:", save_report.description)
    print("args:", save_report.args_schema.model_json_schema()["properties"])

    # 单独测试，和视频的测试一样写一句欢迎语 / test on its own with a greeting, like the video's test
    print(save_report.run(text="你好，欢迎使用 PDF 保存工具！", filename="PDF工具测试"))
    # 故意给一个带 / 和 : 的文件名 / a file name containing / and :
    print(save_report.run(text="# 测试报告\n\n文件名里的特殊字符会被换掉。", filename="AI/趋势: 测试"))
    print(SaveReportTool().run(text="# 测试报告（BaseTool 写法）", filename="basetool 测试"))
