"""第 51 节示例：官方项目模板的写法 —— YAML 配置 + @CrewBase 类（视频「测试一」用的就是它）
Lesson 51 demo: the official project template - YAML config + an @CrewBase class (the video's "test 1")

做了什么 / What it does:
    `crewai create crew` 生成的模板案例：研究员针对 {topic} 列出 10 个要点，报告分析员把要点
    扩写成一份 Markdown 报告，保存到 output/l51_report.md。Agent 和 Task 的文字在
    data/l51_agents.yaml、data/l51_tasks.yaml 里，Python 只负责「组装」。
    和模板一样，Agent 里不写 llm=...：CrewAI 从环境变量里读模型配置（模板项目写在 .env 文件里，
    视频的 main 脚本在服务启动时设置）。use_deepseek_env() 就是把这三个环境变量指向 DeepSeek。
    The template case from `crewai create crew`: the researcher lists 10 points about {topic}, the
    reporting analyst expands them into a Markdown report saved to output/l51_report.md. Texts live in
    the YAML files; Python only wires them together. As in the template, the agents have no llm=...:
    CrewAI reads the model settings from environment variables (the template keeps them in .env; the
    video's main script sets them at startup). use_deepseek_env() points those variables at DeepSeek.

运行环境 / Environment: .venv-crewai  (crewai 1.15.23) —— 不是 .venv！/ not .venv!
运行 / Run:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l51_yaml_crew.py
    & ..\\.venv-crewai\\Scripts\\python.exe l51_yaml_crew.py "多模态大模型"   # 换个主题 / another topic
需要 / Needs: 环境变量 DEEPSEEK_API_KEY / the DEEPSEEK_API_KEY environment variable。约 2 次模型调用、1–2 分钟 / ~2 model calls, 1-2 minutes.
"""
import os
import sys
from datetime import datetime

# 这两行要写在 import crewai 之前 / these two lines must come before importing crewai
os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")                      # 不上传执行追踪 / no trace upload
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))  # CrewAI 的小数据库放进项目的 .cache / keep its db in the project's .cache

from crewai import Agent, Crew, Process, Task  # noqa: E402
from crewai.project import CrewBase, agent, crew, task  # noqa: E402

from llm import API_KEY, BASE_URL, MODEL  # noqa: E402


def use_deepseek_env():
    """用环境变量告诉 CrewAI 用哪个模型（视频里 .env 文件和 main 脚本做的就是这件事）。
    Tell CrewAI which model to use through environment variables (what the video's .env / main script do).
    必须在创建 Agent 之前调用 / call it before any Agent is created."""
    os.environ["OPENAI_API_BASE"] = BASE_URL      # 视频：OneAPI 的地址 / video: the OneAPI address
    os.environ["OPENAI_API_KEY"] = API_KEY        # 视频：OneAPI 的令牌 / video: the OneAPI token
    os.environ["OPENAI_MODEL_NAME"] = MODEL       # 视频：qwen-max / video: qwen-max


def make_inputs(topic):
    """模板的 main.py 也是这样准备 inputs：主题 + 今年的年份。/ Like the template's main.py: topic + year."""
    return {"topic": topic, "current_year": str(datetime.now().year)}


@CrewBase
class ReportCrew:
    """研究员 + 报告分析员。/ Researcher + reporting analyst."""

    # 路径相对于「这个 .py 文件所在的文件夹」/ paths are relative to this file's folder
    agents_config = "data/l51_agents.yaml"
    tasks_config = "data/l51_tasks.yaml"

    @agent
    def researcher(self) -> Agent:
        # self.agents_config 已经读成了字典；verbose=True 在终端打印每一步
        # self.agents_config is already a dict; verbose=True prints every step in the terminal
        return Agent(config=self.agents_config["researcher"], verbose=True)

    @agent
    def reporting_analyst(self) -> Agent:
        return Agent(config=self.agents_config["reporting_analyst"], verbose=True)

    @task
    def research_task(self) -> Task:
        return Task(config=self.tasks_config["research_task"])

    @task
    def reporting_task(self) -> Task:
        # 模板写的是 output_file="report.md"；这里放进 output 文件夹 / the template uses report.md
        return Task(config=self.tasks_config["reporting_task"], output_file="output/l51_report.md")

    @crew
    def crew(self) -> Crew:
        # self.agents / self.tasks：@CrewBase 按定义顺序收集好的列表
        # self.agents / self.tasks: lists collected by @CrewBase, in definition order
        return Crew(agents=self.agents, tasks=self.tasks, process=Process.sequential, verbose=True)


if __name__ == "__main__":
    topic = sys.argv[1] if len(sys.argv) > 1 else "AI LLMs"     # 模板默认的主题 / the template's topic
    use_deepseek_env()
    result = ReportCrew().crew().kickoff(inputs=make_inputs(topic))
    print("\n========== 最终结果 / final result ==========")
    print(result.raw)
