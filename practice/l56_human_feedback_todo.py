"""第 56 节练习：给营销策划小组加上人类反馈（TODO 版）
Lesson 56 exercise: add human feedback to the marketing crew (TODO version)

要做的事 / Your job:
    这个文件和参考答案一样，只是读取的任务配置是 data/l56_tasks_todo.yaml。
    像视频一样，你只需要改 YAML：打开 data/l56_tasks_todo.yaml，按里面的 TODO
    给 research_task 和 copy_creation_task 各加一行 human_input: true，然后运行这个文件。
    This file matches the solution except that it reads data/l56_tasks_todo.yaml. As in the video,
    you only edit the YAML: open data/l56_tasks_todo.yaml and follow its TODO to add
    human_input: true to research_task and copy_creation_task, then run this file.

运行环境 / Environment: .venv-crewai  (crewai 1.15.23)
运行 / Run（在终端里运行 / run it in a terminal）:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l56_human_feedback_todo.py
需要 / Needs: DEEPSEEK_API_KEY、l55_deepseek_llm.py、l55_json_tasks_solution.py。
检查 / Check: 运行后第一行会打印要人工审核的任务；改对了应该是 ['research_task', 'copy_creation_task']。
              The first printed line lists the reviewed tasks; when done it should be
              ['research_task', 'copy_creation_task'].
试一试 / Try: 第一次面板出现时输入一条具体的意见，看 Agent 重写；第二次直接回车通过。
              Give one specific piece of feedback at the first panel, watch the rewrite, then press Enter.
参考答案 / Solution: l56_human_feedback_solution.py + data/l56_tasks.yaml
"""
import os

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")                      # 不上传执行追踪 / no trace upload
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))  # CrewAI 的小数据库放进项目的 .cache / keep its db in the project's .cache

from crewai import Agent, Crew, Process, Task  # noqa: E402
from crewai.project import CrewBase, agent, crew, task  # noqa: E402

from l55_deepseek_llm import llm  # noqa: E402
from l55_json_tasks_solution import INPUTS, Copy, MarketStrategy  # noqa: E402


@CrewBase
class ReviewedMarketingCrew:
    agents_config = "data/l55_agents.yaml"
    tasks_config = "data/l56_tasks_todo.yaml"   # TODO 在这个 YAML 文件里 / the TODO is in this YAML file

    @agent
    def lead_market_analyst(self) -> Agent:
        return Agent(config=self.agents_config["lead_market_analyst"], llm=llm, verbose=True)

    @agent
    def chief_marketing_strategist(self) -> Agent:
        return Agent(config=self.agents_config["chief_marketing_strategist"], llm=llm, verbose=True)

    @agent
    def creative_content_creator(self) -> Agent:
        return Agent(config=self.agents_config["creative_content_creator"], llm=llm, verbose=True)

    @task
    def research_task(self) -> Task:
        return Task(config=self.tasks_config["research_task"])

    @task
    def project_understanding_task(self) -> Task:
        return Task(config=self.tasks_config["project_understanding_task"])

    @task
    def marketing_strategy_task(self) -> Task:
        return Task(config=self.tasks_config["marketing_strategy_task"], output_pydantic=MarketStrategy)

    @task
    def campaign_idea_task(self) -> Task:
        return Task(config=self.tasks_config["campaign_idea_task"])

    @task
    def copy_creation_task(self) -> Task:
        return Task(config=self.tasks_config["copy_creation_task"], output_json=Copy)

    @crew
    def crew(self) -> Crew:
        return Crew(agents=self.agents, tasks=self.tasks, process=Process.sequential, verbose=True)


if __name__ == "__main__":
    my_crew = ReviewedMarketingCrew().crew()
    print("要人工审核的任务 / tasks with human review:",
          [t.name for t in my_crew.tasks if t.human_input])
    result = my_crew.kickoff(inputs=INPUTS)
    print("\n标题 / title:", result["title"])
    print("正文 / body:", result["body"])
