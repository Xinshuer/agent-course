"""第 53 节参考答案：健康档案助手 —— 检索专家 + 报告撰写专家，各用一个工具
Lesson 53 solution: the health-records assistant - a retrieval expert and a report writer, one tool each

做了什么 / What it does:
    1. search_health_records：用 @tool 把 l53_vector_db.py 的向量检索包装成工具（RAG 的在线步骤；
       档案库是 data/l53_health_records.pdf，要先运行 l53_vector_db.py 灌库）
    2. 健康档案检索专家用它从（虚构的）健康档案库里找出和医生问题相关的记录
    3. 健康报告撰写专家根据记录写健康建议报告，再用 52 节的 save_report 工具存成 PDF
    和视频一样：两个工具分别交给两个 Agent，按顺序执行。
    1. search_health_records: the vector search from l53_vector_db.py wrapped as a @tool (RAG's online step)
    2. The retrieval expert uses it to find the records related to the doctor's question
    3. The report writer drafts a health-advice report and saves it as a PDF with lesson 52's save_report
    As in the video: one tool for each of the two agents, run in order.

⚠ 档案是虚构的；报告由 AI 生成，仅供学习，不是医疗建议。
⚠ The records are fictional; the AI-written report is for learning only, not medical advice.

运行环境 / Environment: .venv-crewai  (crewai 1.15.23, chromadb, PyMuPDF)
运行 / Run:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l53_vector_db.py          # 先灌库并测试检索（免费）
    & ..\\.venv-crewai\\Scripts\\python.exe l53_health_solution.py
    & ..\\.venv-crewai\\Scripts\\python.exe l53_health_solution.py "李四一最近的体检有什么需要注意的？"
需要 / Needs: 环境变量 DEEPSEEK_API_KEY / the DEEPSEEK_API_KEY environment variable。约 4 次模型调用、1–3 分钟 / ~4 model calls, 1-3 minutes.
"""
import os
import sys

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")                      # 不上传执行追踪 / no trace upload
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))  # CrewAI 的小数据库放进项目的 .cache / keep its db in the project's .cache

from crewai import LLM, Agent, Crew, Process, Task  # noqa: E402
from crewai.tools import tool  # noqa: E402

from l52_tools_solution import save_report  # noqa: E402  上一集写好的 PDF 工具 / last episode's PDF tool
from l53_vector_db import MyVectorDBConnector, vector_store_save  # noqa: E402
from llm import API_KEY, BASE_URL, MODEL  # noqa: E402

# 打开灌好库的集合。路径和集合名在 l53_vector_db.py 里，必须和灌库时一样，否则查不到东西
# Open the indexed collection. Path and name come from l53_vector_db.py and must match the indexing run
db = MyVectorDBConnector()


@tool("search_health_records")
def search_health_records(question: str) -> str:
    """按照医生提出的问题，到健康档案库里查找相关的记录。
    question：医生的问题，例如「张三九最近总是头疼，跟他以前的体检结果有关系吗？」。
    返回检索到的几段档案原文，用分隔线隔开。"""
    docs = db.search(question, top_n=5)
    if not docs:
        return "健康档案库里没有找到内容，请先运行 l53_vector_db.py 灌库。"
    return f"检索到 {len(docs)} 段相关档案：\n\n" + "\n\n---\n\n".join(docs)


def build_crew(llm):
    """模型从外面传进来（和 52 节一样）。/ The model comes from outside (as in lesson 52)."""
    retriever = Agent(
        role="健康档案检索专家",
        goal="根据医生询问的健康问题，从健康档案库中检索出所有相关的记录",
        backstory="你熟悉各类健康档案，善于从大量历史记录里迅速挑出和问题有关的内容。"
                  "你只引用档案原文，不猜测、不编造。",
        tools=[search_health_records],      # 检索工具给检索专家 / the search tool goes to the retriever
        llm=llm,
        verbose=True,
    )
    reporter = Agent(
        role="健康报告撰写专家",
        goal="结合检索到的健康档案和医生的问题，写一份简洁、有医学依据的健康建议报告",
        backstory="你有医学背景，擅长分析病史、体检数据和生活方式，写出医生容易理解、"
                  "内容简洁又严谨的健康建议报告；每个判断都写明依据，不做确定性诊断。",
        tools=[save_report],                # PDF 工具给撰写专家 / the PDF tool goes to the writer
        llm=llm,
        verbose=True,
    )

    retrieve_task = Task(
        description="医生的问题是：「{question}」。请使用 search_health_records 工具，"
                    "从健康档案库中检索与这个问题相关的所有健康信息。",
        expected_output="与问题密切相关的健康档案记录（保留原始日期和数值），不做诊断。",
        agent=retriever,
    )
    report_task = Task(
        description="根据检索到的健康档案，结合医生的问题「{question}」写一份健康报告，包括：\n"
                    "1. 健康状况分析：相关指标、数值、参考范围、是否超出范围\n"
                    "2. 与问题可能有关的因素，每条写明依据的记录\n"
                    "3. 3–5 条个性化的健康建议\n"
                    "4. 结尾一句：本报告由 AI 根据虚构档案生成，仅供参考，不能替代医生诊断。\n"
                    "写完后调用 save_report 工具把报告保存成 PDF，filename 用「患者姓名+健康建议报告」，"
                    "例如「张三九健康建议报告」。",
        expected_output="一份包含健康状况分析和健康建议的中文报告（不超过 600 字，语言简洁），"
                        "最后一行附上 save_report 返回的保存提示。",
        agent=reporter,
    )
    return Crew(
        agents=[retriever, reporter],
        tasks=[retrieve_task, report_task],
        process=Process.sequential,         # 先检索，再写报告 / retrieve first, then write
        verbose=True,
    )


if __name__ == "__main__":
    if db.collection.count() == 0:          # 还没灌库就先灌一次 / index once if the collection is empty
        print("向量库是空的，先灌库 / the vector store is empty - indexing first")
        vector_store_save()                 # 写进的是同一个集合，db 直接就能查到 / same collection as db

    question = sys.argv[1] if len(sys.argv) > 1 else "张三九最近总是头疼，跟他以前的体检结果有关系吗？"
    llm = LLM(model=f"openai/{MODEL}", base_url=BASE_URL, api_key=API_KEY)
    result = build_crew(llm).kickoff(inputs={"question": question})
    print("\n========== 最终回答 / final answer ==========")
    print(result.raw)
