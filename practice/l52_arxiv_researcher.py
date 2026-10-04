"""第 52 节扩展：让研究员真的去查资料 —— 使用 crewai_tools 里现成的 ArxivPaperTool
Lesson 52 extension: let the researcher really look things up with the ready-made ArxivPaperTool

做了什么 / What it does:
    视频里的研究员只靠模型自己的知识（有截止日期）。这里给研究员一个现成工具
    ArxivPaperTool：它调用 arXiv 的公开接口搜索论文，不需要 key。研究员搜索 {topic}
    的最新论文，挑 3 篇用中文介绍。
    The video's researcher relies only on the model's own (dated) knowledge. Here the researcher
    gets the ready-made ArxivPaperTool, which searches arXiv's public API - no key needed - and
    introduces 3 recent papers on {topic} in Chinese.

运行环境 / Environment: .venv-crewai  (crewai 1.15.23, crewai-tools 1.15.23)
运行 / Run:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l52_arxiv_researcher.py
    & ..\\.venv-crewai\\Scripts\\python.exe l52_arxiv_researcher.py "retrieval augmented generation"
    & ..\\.venv-crewai\\Scripts\\python.exe l52_arxiv_researcher.py --tool-only   # 只测工具，不调模型
需要 / Needs: 环境变量 DEEPSEEK_API_KEY / the DEEPSEEK_API_KEY environment variable+ 联网访问 export.arxiv.org / internet.
              约 2–3 次模型调用 / about 2-3 model calls.
"""
import os
import sys

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")                      # 不上传执行追踪 / no trace upload
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))  # CrewAI 的小数据库放进项目的 .cache / keep its db in the project's .cache

from crewai import LLM, Agent, Crew, Task  # noqa: E402
from crewai_tools import ArxivPaperTool  # noqa: E402

from llm import API_KEY, BASE_URL, MODEL  # noqa: E402

arxiv_tool = ArxivPaperTool()          # 只读取论文信息，不下载 PDF / metadata only, no PDF download

if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    topic = args[0] if args else "LLM agents"

    if "--tool-only" in sys.argv:
        # 先单独测试工具 / test the tool on its own first
        print(arxiv_tool.run(search_query=topic, max_results=3))
        sys.exit()

    llm = LLM(model=f"openai/{MODEL}", base_url=BASE_URL, api_key=API_KEY)
    researcher = Agent(
        role="论文调研员",
        goal="用 arXiv 找到关于 {topic} 的最新论文，并用中文讲清楚它们做了什么",
        backstory="你习惯先查一手资料再下结论，不编造论文。",
        tools=[arxiv_tool],
        llm=llm,
        verbose=True,
    )
    survey = Task(
        description="用 arXiv 工具搜索「{topic}」（英文关键词，max_results 设为 5），从结果里挑 3 篇最新的论文。",
        expected_output="3 篇论文的中文介绍：标题、发表日期、一句话说明做了什么、PDF 链接。",
        agent=researcher,
    )
    result = Crew(agents=[researcher], tasks=[survey]).kickoff(inputs={"topic": topic})
    print("\n========== 最终结果 / final result ==========")
    print(result.raw)
