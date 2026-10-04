"""第 52 节示例：技术研究员智能体 —— 两个 Agent 协作，撰写者调用外部工具把报告存成 PDF
Lesson 52 demo: the tech-researcher crew - two agents, and the writer calls an external tool to save a PDF

做了什么 / What it does:
    研究员分析 {topic} 的技术趋势（5 个要点）→ 撰写者写成报告，并调用 save_report 工具
    保存到 output/<topic>技术趋势报告.pdf。和视频的两处改动一样：
      - 模型在外面创建好（可以自己设 temperature 等参数），通过 crew 类的 __init__ 传进来
      - 撰写者 Agent 拿到一个自定义工具 tools=[save_report]
    Agent / Task 的文字写在 data/l52_agents.yaml、data/l52_tasks.yaml。
    The researcher analyses trends in {topic} (5 points) -> the writer turns them into a report and
    calls save_report to store output/<topic>技术趋势报告.pdf. The same two changes as in the video:
      - the model is created outside (so you can set temperature etc.) and passed in through __init__
      - the writer agent gets a custom tool, tools=[save_report]
    The agent and task texts live in data/l52_agents.yaml and data/l52_tasks.yaml.

运行环境 / Environment: .venv-crewai  (crewai 1.15.23)
运行 / Run:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l52_research_crew.py
    & ..\\.venv-crewai\\Scripts\\python.exe l52_research_crew.py 机器人      # 换个主题 / another topic
需要 / Needs: 环境变量 DEEPSEEK_API_KEY / the DEEPSEEK_API_KEY environment variable。约 3 次模型调用、1–2 分钟 / ~3 model calls, 1-2 minutes.
"""
import os
import sys

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")                      # 不上传执行追踪 / no trace upload
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))  # CrewAI 的小数据库放进项目的 .cache / keep its db in the project's .cache

from crewai import LLM, Agent, Crew, Process, Task  # noqa: E402
from crewai.project import CrewBase, agent, crew, task  # noqa: E402

from l52_tools_solution import save_report  # noqa: E402
from llm import API_KEY, BASE_URL, MODEL  # noqa: E402


def make_llm():
    """视频用 LangChain 的 ChatOpenAI 创建模型；CrewAI 1.x 用自带的 LLM 类就能设这些参数。
    The video builds the model with LangChain's ChatOpenAI; in CrewAI 1.x its own LLM class takes the same settings.
    注意 / Note: deepseek-flash 默认是思考模式，temperature 基本不起作用；想让它生效，
    可以再加 extra_body={"thinking": {"type": "disabled"}}（关掉思考）。
    deepseek-flash thinks by default, so temperature has little effect; add
    extra_body={"thinking": {"type": "disabled"}} to switch thinking off if you want it to matter."""
    return LLM(model=f"openai/{MODEL}", base_url=BASE_URL, api_key=API_KEY, temperature=0.7)


@CrewBase
class TechResearchCrew:
    """技术研究员 + 报告撰写者。/ Tech researcher + report writer."""

    agents_config = "data/l52_agents.yaml"
    tasks_config = "data/l52_tasks.yaml"

    def __init__(self, llm):
        # 改动一：模型从外面传进来，存到 self 上（类和 self 见 08 节）
        # Change 1: the model comes from outside and is stored on self (classes and self: lesson 08)
        self.llm = llm

    @agent
    def researcher(self) -> Agent:
        return Agent(config=self.agents_config["researcher"], llm=self.llm, verbose=True)

    @agent
    def reporting_writer(self) -> Agent:
        return Agent(
            config=self.agents_config["reporting_writer"],
            llm=self.llm,                 # 也可以给这个 Agent 换一个模型 / could be a different model
            tools=[save_report],          # 改动二：只有撰写者拿到这个工具 / change 2: only the writer gets the tool
            verbose=True,
        )

    @task
    def research_task(self) -> Task:
        return Task(config=self.tasks_config["research_task"])

    @task
    def reporting_task(self) -> Task:
        return Task(config=self.tasks_config["reporting_task"])

    @crew
    def crew(self) -> Crew:
        return Crew(agents=self.agents, tasks=self.tasks, process=Process.sequential, verbose=True)


if __name__ == "__main__":
    topic = sys.argv[1] if len(sys.argv) > 1 else "人工智能"       # 视频演示的主题 / the video's topic
    result = TechResearchCrew(make_llm()).crew().kickoff(inputs={"topic": topic})
    print("\n========== 最终结果 / final result ==========")
    print(result.raw)
