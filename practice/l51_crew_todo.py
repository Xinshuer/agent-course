"""第 51 节练习：亲手写出视频里的两人小组（研究员 → 报告分析员），不用模板
Lesson 51 exercise: write the video's two-agent crew (researcher -> reporting analyst) without the template

按 TODO 补全代码，然后运行。卡住了就看 l51_crew_solution.py。
Fill in the TODOs, then run. Stuck? See l51_crew_solution.py.

运行环境 / Environment: .venv-crewai  (crewai 1.15.23) —— 不是 .venv！/ not .venv!
运行 / Run:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l51_crew_todo.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY / the DEEPSEEK_API_KEY environment variable。约 2 次模型调用 / about 2 model calls.
"""
import os

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")                      # 不上传执行追踪 / no trace upload
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))  # CrewAI 的小数据库放进项目的 .cache / keep its db in the project's .cache

from crewai import LLM, Agent, Crew, Process, Task  # noqa: E402

from llm import API_KEY, BASE_URL, MODEL  # noqa: E402

# TODO 1：创建 LLM。提示：model 要写成 f"openai/{MODEL}"，再传 base_url 和 api_key
# TODO 1: create the LLM. Hint: model=f"openai/{MODEL}", plus base_url and api_key
llm = None


def build_crew():
    # TODO 2：创建研究员 Agent：role、goal、backstory 三项都要写，里面可以用 {topic}
    #         别忘了 llm=llm 和 verbose=True
    # TODO 2: create the researcher Agent with role, goal, backstory ({topic} allowed), llm=llm, verbose=True
    researcher = None

    # TODO 3：创建报告分析员 Agent reporting_analyst（写法同上）
    # TODO 3: create the reporting_analyst Agent (same pattern)
    reporting_analyst = None

    # TODO 4：研究任务：description（用 {topic}）、expected_output（例如「10 个要点的列表」）、agent=researcher
    # TODO 4: research task: description (with {topic}), expected_output (e.g. "a list of 10 points"), agent=researcher
    research_task = None

    # TODO 5：报告任务：agent=reporting_analyst，并加 output_file="output/l51_report.md"
    # TODO 5: reporting task: agent=reporting_analyst, plus output_file="output/l51_report.md"
    reporting_task = None

    # TODO 6：返回 Crew：agents、tasks 两个列表，process=Process.sequential，verbose=True
    # TODO 6: return a Crew with the agents and tasks lists, process=Process.sequential, verbose=True
    return None


if __name__ == "__main__":
    # TODO 7：kickoff 时用 inputs 把 {topic} 填成 "AI LLMs"，然后打印 result.raw
    # TODO 7: kickoff with inputs={"topic": "AI LLMs"}, then print result.raw
    pass
