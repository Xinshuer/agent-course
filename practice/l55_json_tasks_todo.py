"""第 55 节练习：让营销策划小组的最后一个任务以 JSON 格式输出（TODO 版）
Lesson 55 exercise: make the marketing crew's last task output JSON (TODO version)

要做的事 / Your job:
    Agent 和任务的文字在 data/l55_agents.yaml、data/l55_tasks.yaml 里（和参考答案共用），
    前 4 个任务已经接好。你来完成和 JSON 有关的部分：Copy 模型、output_json、启动和读取结果。
    The agent and task texts are in data/l55_agents.yaml and data/l55_tasks.yaml (shared with the
    solution) and the first 4 tasks are wired. You do the JSON part: the Copy model, output_json,
    kicking off and reading the results.

运行环境 / Environment: .venv-crewai  (crewai 1.15.23)
运行 / Run:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l55_json_tasks_todo.py
需要 / Needs: DEEPSEEK_API_KEY 和 l55_deepseek_llm.py。5 次模型调用 / 5 model calls.
参考答案 / Solution: l55_json_tasks_solution.py
"""
import json  # noqa: F401
import os

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")                      # 不上传执行追踪 / no trace upload
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))  # CrewAI 的小数据库放进项目的 .cache / keep its db in the project's .cache

from crewai import Agent, Crew, Process, Task  # noqa: E402
from crewai.project import CrewBase, agent, crew, task  # noqa: E402
from pydantic import BaseModel, Field  # noqa: E402

from l55_deepseek_llm import llm  # noqa: E402  DeepSeek 要用这个 llm / DeepSeek needs this llm


class MarketStrategy(BaseModel):
    """营销战略（已写好，照着它写 Copy）。/ A marketing strategy (done - use it as a model for Copy)."""
    name: str = Field(description="战略名称 / strategy name")
    tactics: list[str] = Field(description="战术 / tactics")
    channels: list[str] = Field(description="渠道 / channels")
    kpis: list[str] = Field(description="关键指标 / key performance indicators")


# TODO 1: 定义 Pydantic 模型 Copy，两个字符串字段：title（标题）和 body（正文）
#         Define a Pydantic model Copy with two str fields: title and body
Copy = None


@CrewBase
class MarketingCrew:
    agents_config = "data/l55_agents.yaml"
    tasks_config = "data/l55_tasks.yaml"

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
        # TODO 2: 让这个任务按 Copy 的格式输出 JSON（output_json=Copy），
        #         并把结果存到 "data/l55_output/my_copy.json"（output_file=...）
        #         Make this task output JSON shaped like Copy (output_json=Copy)
        #         and save it to "data/l55_output/my_copy.json" (output_file=...)
        return Task(config=self.tasks_config["copy_creation_task"])

    @crew
    def crew(self) -> Crew:
        return Crew(agents=self.agents, tasks=self.tasks, process=Process.sequential, verbose=True)


INPUTS = {
    "customer_domain": "emqx.com",
    "project_description": "EMQX 是一款开源的 MQTT 消息服务器，能连接海量物联网设备并实时处理数据。"
                           "请为它策划一次面向国内物联网开发者和企业的推广活动。",
}


if __name__ == "__main__":
    # TODO 3: 启动小组：result = MarketingCrew().crew().kickoff(inputs=INPUTS)
    #         Kick off the crew with INPUTS
    result = None

    # TODO 4: 打印 result.json_dict、result["title"]，
    #         再用 result.tasks_output[2].pydantic 取出第 3 个任务的 MarketStrategy，打印它的 name
    #         Print result.json_dict and result["title"], then print the name of task 3's
    #         MarketStrategy object from result.tasks_output[2].pydantic
