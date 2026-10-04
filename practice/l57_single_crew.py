"""第 57 节示例：第一步——先把「原来的一个 Crew」跑通（对应视频里直接运行 Crew 的那次测试）
Lesson 57 demo: step 1 - make sure the original single crew runs (the video's "run the crew directly" test)

做了什么 / What it does:
    视频这一步运行的是第 55 集那个完整的 Crew（3 个 Agent、5 个 Task），也就是本课的
    l55_json_tasks_solution.py（5 次模型调用）。这个文件是省钱的精简版：
    把分析师和文案创作者放进同一个 Crew，两个 Task 按顺序执行，输入和视频一样。
    同一个 Crew 里，后面的 Task 会自动看到前面 Task 的输出（CrewAI 自动把它当作 context），
    所以这里的文案任务不需要 {market_analysis} 占位符。
    拆成两个 Crew 以后就没有这种自动传递了——这正是 l57_pipeline_solution.py 要手动传数据的原因。
    The analyst and the writer sit in ONE crew and the two tasks run in order.
    Inside one crew, a later task automatically sees the earlier task's output (CrewAI passes it
    as context), so the copy task needs no {market_analysis} placeholder.
    Once the work is split into two crews this automatic hand-over is gone - which is why
    l57_pipeline_solution.py passes the data by hand.

运行环境 / Environment: .venv-crewai  (crewai 1.15.23)
运行 / Run:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l57_single_crew.py
需要 / Needs: DEEPSEEK_API_KEY，以及 l55_deepseek_llm.py、l57_pipeline_solution.py（借用其中的 Copy 和 INPUTS）。
              约 2 次模型调用。/ About 2 model calls.
"""
import os

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))   # 必须在 import crewai 之前

from crewai import Agent, Crew, Process, Task  # noqa: E402

from l55_deepseek_llm import llm  # noqa: E402
from l57_pipeline_solution import INPUTS, Copy  # noqa: E402   文案的结构、视频的输入


def build_marketing_crew():
    """原来的一个 Crew：分析师 + 文案创作者。/ The original single crew: analyst + writer."""
    analyst = Agent(
        role="首席市场分析师",
        goal="深入分析 {customer_domain} 的产品、目标客户和竞争对手",
        backstory="你在一家一流的数字营销公司做首席市场分析师，结论简短、有依据。",
        llm=llm,
    )
    writer = Agent(
        role="首席创意内容创作者",
        goal="把市场分析变成一条吸引人的社交媒体营销文案",
        backstory="你在一家一流的数字营销公司做首席创意内容创作者，文案短小、抓人眼球。",
        llm=llm,
    )
    research_task = Task(
        description="客户：{customer_domain}\n项目：{project_description}\n"
                    "分析目标客户、主要竞争对手，以及一个最值得抓住的机会。",
        expected_output="3 条中文要点，每条不超过 40 个字。",
        agent=analyst,
    )
    copy_task = Task(
        # 没有 {market_analysis}：同一个 Crew 里，上一个 Task 的结果会自动交给它
        description="根据前面的市场分析，为 {customer_domain} 写一条社交媒体营销文案。",
        expected_output="一个标题和一段不超过 80 个字的正文。",
        agent=writer,
        output_pydantic=Copy,
    )
    return Crew(agents=[analyst, writer], tasks=[research_task, copy_task], process=Process.sequential)


if __name__ == "__main__":
    result = build_marketing_crew().kickoff(inputs=INPUTS)
    print("\n========== 一个 Crew 的结果 / single-crew result ==========")
    print("标题 / title:", result.pydantic.title)
    print("正文 / body:", result.pydantic.body)
    print("每个 Task 的输出数 / task outputs:", len(result.tasks_output))
