"""第 55 节参考答案：营销策划小组（3 个 Agent、5 个任务），最后一个任务以 JSON 格式输出
Lesson 55 solution: a marketing crew (3 agents, 5 tasks) whose last task outputs JSON

做了什么 / What it does:
    和视频一样：输入客户网址 customer_domain 和项目说明 project_description，
    首席市场分析师 → 首席营销战略师 → 首席创意内容创作者 依次完成 5 个任务。
    - 第 3 个任务（营销战略）用 output_pydantic=MarketStrategy，得到一个 Pydantic 对象；
    - 最后一个任务（文案）用 output_json=Copy，得到 {"title": ..., "body": ...} 字典，并存成 JSON 文件。
    As in the video: given customer_domain and project_description, the lead market analyst ->
    chief marketing strategist -> creative content creator complete 5 tasks in order.
    - Task 3 (strategy) uses output_pydantic=MarketStrategy and yields a Pydantic object;
    - the last task (copy) uses output_json=Copy, yields a {"title": ..., "body": ...} dict and saves it.

运行环境 / Environment: .venv-crewai  (crewai 1.15.23) —— 不是 .venv！/ not .venv!
运行 / Run:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l55_json_tasks_solution.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY / the DEEPSEEK_API_KEY environment variable和同一文件夹里的 l55_deepseek_llm.py。
              5 次模型调用，约 2-5 分钟。/ 5 model calls, about 2-5 minutes.
输出 / Output: practice\\data\\l55_output\\copy.json
对外提供服务 / As a web service: l55_marketing_api.py + l55_api_client.py
"""
import json
import os

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")                      # 不上传执行追踪 / no trace upload
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))  # CrewAI 的小数据库放进项目的 .cache / keep its db in the project's .cache

from crewai import Agent, Crew, Process, Task  # noqa: E402
from crewai.project import CrewBase, agent, crew, task  # noqa: E402
from pydantic import BaseModel, Field  # noqa: E402

# DeepSeek 不支持 output_json / output_pydantic 默认发送的 json_schema 格式，所以用这个 llm（原因见那个文件）
# DeepSeek rejects the json_schema format that output_json / output_pydantic send, so use this llm
from l55_deepseek_llm import llm  # noqa: E402

# 工具：视频给分析师和战略师配了 ScrapeWebsiteTool（读取网页）和 SerperDevTool（谷歌搜索）。
# 这里默认不开：每用一次工具都要多调用一次模型，搜索还需要 serper.dev 的 key。
# 想像视频一样让前两个 Agent 去读官网、上网搜索，把 USE_TOOLS 改成 True。
# Tools: the video gives the analyst and the strategist ScrapeWebsiteTool (reads a web page) and
# SerperDevTool (Google search). Off by default: every tool use costs another model call, and search
# needs a serper.dev key. Set USE_TOOLS = True to use them like the video.
USE_TOOLS = False
TOOLS = []
if USE_TOOLS:
    from crewai_tools import ScrapeWebsiteTool, SerperDevTool  # noqa: E402

    TOOLS = [ScrapeWebsiteTool()]                 # 读取网页文字，不需要 key
    if os.environ.get("SERPER_API_KEY"):          # 谷歌搜索：先在系统环境变量里设置 SERPER_API_KEY
        TOOLS.append(SerperDevTool())
    else:
        print("没有 SERPER_API_KEY：只开读网页工具，不开搜索工具")


# 输出格式：用 Pydantic 模型来描述（回顾 12 节）/ Output shapes as Pydantic models (see lesson 12)
class MarketStrategy(BaseModel):
    """营销战略。/ A marketing strategy."""
    name: str = Field(description="战略名称 / strategy name")
    tactics: list[str] = Field(description="战术 / tactics")
    channels: list[str] = Field(description="渠道 / channels")
    kpis: list[str] = Field(description="关键指标 / key performance indicators")


class Copy(BaseModel):
    """最终文案：标题 + 正文（和视频的输出一样）。/ Final copy: title + body, as in the video."""
    title: str = Field(description="文案标题 / title")
    body: str = Field(description="文案正文 / body")


@CrewBase
class MarketingCrew:
    """营销策划小组：3 个 Agent、5 个任务。/ The marketing crew: 3 agents, 5 tasks."""

    agents_config = "data/l55_agents.yaml"   # 相对于这个 .py 文件 / relative to this .py file
    tasks_config = "data/l55_tasks.yaml"

    @agent
    def lead_market_analyst(self) -> Agent:
        return Agent(config=self.agents_config["lead_market_analyst"], tools=TOOLS, llm=llm, verbose=True)

    @agent
    def chief_marketing_strategist(self) -> Agent:
        return Agent(config=self.agents_config["chief_marketing_strategist"], tools=TOOLS, llm=llm, verbose=True)

    @agent
    def creative_content_creator(self) -> Agent:
        # 只负责写内容，不需要搜索工具 / it only writes, so no search tools
        return Agent(config=self.agents_config["creative_content_creator"], llm=llm, verbose=True)

    @task
    def research_task(self) -> Task:
        return Task(config=self.tasks_config["research_task"])

    @task
    def project_understanding_task(self) -> Task:
        return Task(config=self.tasks_config["project_understanding_task"])

    @task
    def marketing_strategy_task(self) -> Task:
        # 结果变成 MarketStrategy 对象 / the result becomes a MarketStrategy object
        return Task(config=self.tasks_config["marketing_strategy_task"], output_pydantic=MarketStrategy)

    @task
    def campaign_idea_task(self) -> Task:
        return Task(config=self.tasks_config["campaign_idea_task"])

    @task
    def copy_creation_task(self) -> Task:
        # 关键：最后一个任务按 Copy 的格式输出 JSON，并保存成文件
        # The key line: the last task outputs JSON shaped like Copy, also saved to a file
        return Task(
            config=self.tasks_config["copy_creation_task"],
            output_json=Copy,
            output_file="data/l55_output/copy.json",   # 相对于运行命令的文件夹 / relative to where you run it
        )

    @crew
    def crew(self) -> Crew:
        return Crew(agents=self.agents, tasks=self.tasks, process=Process.sequential, verbose=True)


# 两个输入，和视频的请求体一样 / the two inputs, as in the video's request body
INPUTS = {
    "customer_domain": "emqx.com",
    "project_description": "EMQX 是一款开源的 MQTT 消息服务器，能连接海量物联网设备并实时处理数据。"
                           "请为它策划一次面向国内物联网开发者和企业的推广活动。",
}


if __name__ == "__main__":
    result = MarketingCrew().crew().kickoff(inputs=INPUTS)

    print("\n========== 最终结果（最后一个任务，output_json）/ final result ==========")
    print(result.json_dict)                         # 字典 / a dict: {'title': ..., 'body': ...}
    print("标题 / title:", result["title"])         # CrewOutput 可以直接用 [] 取字段 / [] works on CrewOutput
    print("正文 / body:", result.json_dict["body"])

    print("\n========== 第 3 个任务（output_pydantic）/ task 3 ==========")
    strategy = result.tasks_output[2].pydantic      # MarketStrategy 对象，用点号取值 / read with dots
    print("战略名称 / name:", strategy.name)
    print("渠道 / channels:", strategy.channels)

    print("\n每个任务的结果类型 / what each task returned:")
    for t in result.tasks_output:
        kind = "json_dict" if t.json_dict else ("pydantic" if t.pydantic else "raw")
        print(f"  {t.name}: {kind}, {len(t.raw)} 个字符 / characters")
    print("\nJSON 已保存 / saved:", os.path.abspath("data/l55_output/copy.json"))
    print(json.dumps(result.json_dict, ensure_ascii=False, indent=2))
