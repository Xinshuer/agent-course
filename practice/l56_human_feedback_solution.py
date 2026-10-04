"""第 56 节参考答案：营销策划小组 + 人类反馈（human_input: true）
Lesson 56 solution: the marketing crew with human feedback (human_input: true)

做了什么 / What it does:
    和 55 节的 MarketingCrew 一模一样，唯一的区别是任务配置换成了 data/l56_tasks.yaml ——
    那里给 research_task 和 copy_creation_task 加了 human_input: true（视频也只改了 tasks.yaml）。
    The same as lesson 55's MarketingCrew; the only difference is the task config data/l56_tasks.yaml,
    which adds human_input: true to research_task and copy_creation_task (the video also changed only
    tasks.yaml).

运行环境 / Environment: .venv-crewai  (crewai 1.15.23)
运行 / Run（要在终端里运行，因为需要你输入反馈 / run it in a terminal - it waits for your typing）:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l56_human_feedback_solution.py
需要 / Needs: DEEPSEEK_API_KEY、l55_deepseek_llm.py、l55_json_tasks_solution.py。
              至少 5 次模型调用；你每提一次意见，再多 1 次。
              At least 5 model calls, plus 1 for every piece of feedback you give.

怎么操作 / How to use it（CrewAI 1.15.23）:
    1. 带 human_input 的任务做完后，终端出现黄色的「💬 Human Feedback Required」面板。
       After a task with human_input finishes, a yellow "💬 Human Feedback Required" panel appears.
    2. 不满意：输入修改意见后回车，Agent 会按意见重写，然后再问你一次。
       Not happy: type what to change and press Enter; the agent rewrites and asks again.
    3. 满意：什么都不输入，直接回车，小组继续做下一个任务。
       Happy: press Enter on an empty line and the crew moves on to the next task.
    注意：输入「继续」「OK」这类文字也算意见，会让 Agent 再改一版。
    Note: typing "continue" or "OK" also counts as feedback and makes the agent rewrite.

像视频一样通过接口运行 / Through the API, as in the video:
    在 l55_marketing_api.py 里把 from l55_json_tasks_solution import MarketingCrew 这一行换成
        from l56_human_feedback_solution import ReviewedMarketingCrew as MarketingCrew
    （USE_TOOLS 那一行不要动）。反馈面板会出现在「运行服务的那个终端」里，客户端会一直等到你审核完。
    In l55_marketing_api.py swap the line "from l55_json_tasks_solution import MarketingCrew" for the
    one above (keep the USE_TOOLS line); the feedback panel appears in the server's terminal, and the
    client keeps waiting until you finish reviewing.
"""
import os

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")                      # 不上传执行追踪 / no trace upload
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))  # CrewAI 的小数据库放进项目的 .cache / keep its db in the project's .cache

from crewai import Agent, Crew, Process, Task  # noqa: E402
from crewai.project import CrewBase, agent, crew, task  # noqa: E402

from l55_deepseek_llm import llm  # noqa: E402
from l55_json_tasks_solution import INPUTS, TOOLS, Copy, MarketStrategy  # noqa: E402  55 节写好的 / from lesson 55


@CrewBase
class ReviewedMarketingCrew:
    """55 节的营销策划小组，任务配置换成带 human_input 的版本。
    Lesson 55's marketing crew, with the task config that has human_input."""

    agents_config = "data/l55_agents.yaml"   # Agent 和 55 节共用 / the same agents as lesson 55
    tasks_config = "data/l56_tasks.yaml"     # ← 唯一的区别 / the only difference

    @agent
    def lead_market_analyst(self) -> Agent:
        return Agent(config=self.agents_config["lead_market_analyst"], tools=TOOLS, llm=llm, verbose=True)

    @agent
    def chief_marketing_strategist(self) -> Agent:
        return Agent(config=self.agents_config["chief_marketing_strategist"], tools=TOOLS, llm=llm, verbose=True)

    @agent
    def creative_content_creator(self) -> Agent:
        return Agent(config=self.agents_config["creative_content_creator"], llm=llm, verbose=True)

    @task
    def research_task(self) -> Task:
        return Task(config=self.tasks_config["research_task"])   # YAML 里的 human_input 会一起读进来

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
        return Task(config=self.tasks_config["copy_creation_task"], output_json=Copy,
                    output_file="data/l55_output/copy_reviewed.json")

    @crew
    def crew(self) -> Crew:
        # verbose=True：你要先看到 Agent 的答案，才能给意见 / you need to see the answer before reviewing it
        return Crew(agents=self.agents, tasks=self.tasks, process=Process.sequential, verbose=True)


if __name__ == "__main__":
    my_crew = ReviewedMarketingCrew().crew()
    print("要人工审核的任务 / tasks with human review:",
          [t.name for t in my_crew.tasks if t.human_input])
    result = my_crew.kickoff(inputs=INPUTS)

    print("\n===== 最终文案（已经过你的审核）/ final copy (approved by you) =====")
    print("标题 / title:", result["title"])
    print("正文 / body:", result["body"])
