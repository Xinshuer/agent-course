"""第 53 节练习：把向量检索包装成工具，组成「检索专家 + 报告撰写专家」的健康档案助手
Lesson 53 exercise: wrap the vector search as a tool and build the retrieval-expert + report-writer assistant

按 TODO 补全代码，然后运行。卡住了就看 l53_health_solution.py。
先运行 l53_vector_db.py 灌库，并看看检索结果（不花钱）。
Fill in the TODOs, then run. Stuck? See l53_health_solution.py.
Run l53_vector_db.py first to index the records and see what the search returns (free).

⚠ 档案是虚构的；报告由 AI 生成，仅供学习，不是医疗建议。
⚠ The records are fictional; the AI-written report is for learning only, not medical advice.

运行环境 / Environment: .venv-crewai  (crewai 1.15.23, chromadb, PyMuPDF)
运行 / Run:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l53_vector_db.py
    & ..\\.venv-crewai\\Scripts\\python.exe l53_health_todo.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY / the DEEPSEEK_API_KEY environment variable。约 4 次模型调用 / about 4 model calls.
"""
import os

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")                      # 不上传执行追踪 / no trace upload
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))  # CrewAI 的小数据库放进项目的 .cache / keep its db in the project's .cache

from crewai import LLM, Agent, Crew, Process, Task  # noqa: E402
from crewai.tools import tool  # noqa: E402

from l52_tools_solution import save_report  # noqa: E402
from l53_vector_db import MyVectorDBConnector  # noqa: E402
from llm import API_KEY, BASE_URL, MODEL  # noqa: E402

db = MyVectorDBConnector()          # 打开 l53_vector_db.py 灌好的集合 / open the indexed collection


# TODO 1：用 @tool("search_health_records") 定义工具 search_health_records(question: str) -> str
#   - 文档字符串写清楚：根据医生的问题从健康档案库检索相关内容；question 是什么；返回什么
#   - 函数体：docs = db.search(question, top_n=5)
#             没结果时返回一句提示，否则用 "\n\n---\n\n".join(docs) 拼成一个字符串返回
# TODO 1: define the tool search_health_records(question: str) -> str with @tool("search_health_records")
#   - docstring: search the health records for the doctor's question; what question is; what it returns
#   - body: docs = db.search(question, top_n=5); return a "nothing found" message or the joined docs


def build_crew(llm):
    # TODO 2：检索专家 Agent：role="健康档案检索专家"，写好 goal、backstory，
    #         并把检索工具交给它：tools=[search_health_records]
    # TODO 2: the retrieval expert Agent with role/goal/backstory and tools=[search_health_records]
    retriever = None

    # TODO 3：报告撰写专家 Agent：role="健康报告撰写专家"，写好 goal、backstory，
    #         并把 PDF 工具交给它：tools=[save_report]
    # TODO 3: the report writer Agent with role/goal/backstory and tools=[save_report]
    reporter = None

    # TODO 4：检索任务：description 里用 {question} 放医生的问题，并要求使用 search_health_records 工具；
    #         expected_output 写「与问题相关的档案记录，保留日期和数值，不做诊断」；agent=retriever
    # TODO 4: the retrieval task: {question} in the description, ask it to use the tool; agent=retriever
    retrieve_task = None

    report_task = Task(
        description="根据检索到的健康档案，结合医生的问题「{question}」写一份健康报告：健康状况分析"
                    "（指标 / 数值 / 参考范围 / 是否超出）、可能有关的因素及依据、3–5 条健康建议，"
                    "结尾注明：本报告由 AI 根据虚构档案生成，仅供参考，不能替代医生诊断。"
                    "写完后调用 save_report 工具保存成 PDF，filename 用「患者姓名+健康建议报告」。",
        expected_output="一份中文健康报告（不超过 600 字），最后一行附上 save_report 返回的保存提示。",
        agent=reporter,
    )

    # TODO 5：返回 Crew（两个 Agent、两个 Task、Process.sequential、verbose=True）
    # TODO 5: return the Crew (two agents, two tasks, Process.sequential, verbose=True)
    return None


if __name__ == "__main__":
    llm = LLM(model=f"openai/{MODEL}", base_url=BASE_URL, api_key=API_KEY)
    # TODO 6：build_crew(llm).kickoff(inputs={"question": "张三九最近总是头疼，跟他以前的体检结果有关系吗？"})，
    #         打印 result.raw
    # TODO 6: kickoff with inputs={"question": ...} and print result.raw
    pass
