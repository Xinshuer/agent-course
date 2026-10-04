"""第 51 节参考答案：不用模板，一个文件写完视频里的两人小组（研究员 → 报告分析员）
Lesson 51 solution: the video's two-agent crew (researcher -> reporting analyst) in one plain file

做了什么 / What it does:
    和 l51_yaml_crew.py 是同一个案例，只是 Agent、Task 直接写在 Python 里，模型用 LLM(...) 显式传给
    每个 Agent（下一集视频也改成了「把模型对象传给 Agent」）。研究员列出 10 个要点，报告分析员扩写成
    Markdown 报告，按顺序执行，报告同时保存到 output/l51_report.md。
    The same case as l51_yaml_crew.py, but the agents and tasks are written directly in Python and the
    model is passed to each agent with LLM(...) (the next video also switches to passing a model object).
    The researcher lists 10 points, the analyst expands them into a Markdown report; tasks run in
    order and the report is also saved to output/l51_report.md.

运行环境 / Environment: .venv-crewai  (crewai 1.15.23) —— 不是 .venv！/ not .venv!
运行 / Run:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l51_crew_solution.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY / the DEEPSEEK_API_KEY environment variable。约 2 次模型调用、1–2 分钟 / ~2 model calls, 1-2 minutes.
"""
import os

# 这两行要写在 import crewai 之前 / these two lines must come before importing crewai
os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")                      # 不上传执行追踪 / no trace upload
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))  # CrewAI 的小数据库放进项目的 .cache / keep its db in the project's .cache

from crewai import LLM, Agent, Crew, Process, Task  # noqa: E402

from llm import API_KEY, BASE_URL, MODEL  # noqa: E402

# "openai/" 前缀 = 用 OpenAI 兼容协议；base_url 指向 DeepSeek
# The "openai/" prefix means "speak the OpenAI-compatible protocol"; base_url points at DeepSeek
llm = LLM(model=f"openai/{MODEL}", base_url=BASE_URL, api_key=API_KEY)


def build_crew():
    """每次调用都新建一个 Crew。/ Build a fresh crew on every call."""
    researcher = Agent(
        role="{topic} 高级数据研究员",
        goal="发掘 {topic} 领域的前沿进展",
        backstory="你是一名经验丰富的研究员，擅长发现 {topic} 的最新进展，并用清楚简洁的方式讲出来。",
        llm=llm,
        verbose=True,
    )
    reporting_analyst = Agent(
        role="{topic} 报告分析员",
        goal="根据研究结果写出详细的 {topic} 报告",
        backstory="你是一名一丝不苟的分析师，擅长把复杂的信息整理成别人一看就懂的报告。",
        llm=llm,
        verbose=True,
    )

    # 注意：description 里的 {topic} 不是 f-string，kickoff 时才会被替换
    # Note: {topic} here is NOT an f-string; CrewAI fills it in at kickoff time
    research_task = Task(
        description="对 {topic} 做一次深入的调研，找出最近一两年里有趣且相关的信息。",
        expected_output="一个包含 10 个要点的列表，列出 {topic} 最相关的信息，用中文。",
        agent=researcher,
    )
    reporting_task = Task(
        description="阅读研究员给出的要点，把每个要点扩展成报告里完整的一个小节。",
        expected_output="一份 Markdown 格式的中文报告，每个要点一个小节，不要用 ``` 包起来。",
        agent=reporting_analyst,
        output_file="output/l51_report.md",   # 自动保存到文件 / also saved to this file
    )

    return Crew(
        agents=[researcher, reporting_analyst],
        tasks=[research_task, reporting_task],
        process=Process.sequential,           # 按顺序：上一个任务的输出 = 下一个任务的上下文
        verbose=True,                         # 在终端打印每一步 / print every step
    )


if __name__ == "__main__":
    result = build_crew().kickoff(inputs={"topic": "AI LLMs"})

    print("\n========== 最终结果 / final result ==========")
    print(result.raw)

    print("\n========== 每个任务的输出 / each task's output ==========")
    for task_output in result.tasks_output:
        print(f"[{task_output.agent.strip()}] {task_output.raw[:60]}...")
