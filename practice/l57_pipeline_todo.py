"""第 57 节练习：把两个 Crew 串成一条「流水线」（补全 TODO）
Lesson 57 exercise: chain two crews into a "pipeline" (fill in the TODOs)

做了什么 / What it does:
    第 1 阶段（crew A）做市场分析，第 2 阶段（crew B）根据分析写 {title, body} 文案。
    两个 Crew 已经写好了，你要补全的是「把它们串起来」的部分。
    Stage 1 (crew A) analyses the market; stage 2 (crew B) writes {title, body} copy from it.
    Both crews are ready; your job is the part that chains them together.

运行环境 / Environment: .venv-crewai  (crewai 1.15.23) —— 不是 .venv！/ not .venv!
运行 / Run:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l57_pipeline_todo.py
需要 / Needs: DEEPSEEK_API_KEY，以及同一文件夹里的 l55_deepseek_llm.py。约 2 次模型调用。
              Also l55_deepseek_llm.py in the same folder. About 2 model calls.
参考答案 / Solution: l57_pipeline_solution.py
"""
import os

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))   # 必须在 import crewai 之前 / before importing crewai

from crewai import Agent, Crew, Process, Task  # noqa: E402
from pydantic import BaseModel  # noqa: E402

# DeepSeek 不支持 json_schema 格式，所以用 55 节的 llm / DeepSeek has no json_schema support - use lesson 55's llm
from l55_deepseek_llm import llm  # noqa: E402


class Copy(BaseModel):
    """最终文案：标题 + 正文。/ Final copy: title + body."""
    title: str
    body: str


def build_analysis_crew():
    """第 1 阶段：市场分析。/ Stage 1: market analysis."""
    analyst = Agent(
        role="首席市场分析师",
        goal="深入分析 {customer_domain} 的产品、目标客户和竞争对手",
        backstory="你在一家一流的数字营销公司做首席市场分析师，结论简短、有依据。",
        llm=llm,
    )
    research_task = Task(
        description="客户：{customer_domain}\n项目：{project_description}\n"
                    "分析目标客户、主要竞争对手，以及一个最值得抓住的机会。",
        expected_output="3 条中文要点，每条不超过 40 个字。",
        agent=analyst,
    )
    return Crew(agents=[analyst], tasks=[research_task], process=Process.sequential)


def build_copy_crew():
    """第 2 阶段：根据分析写文案。/ Stage 2: write copy from the analysis."""
    writer = Agent(
        role="首席创意内容创作者",
        goal="把市场分析变成一条吸引人的社交媒体营销文案",
        backstory="你在一家一流的数字营销公司做首席创意内容创作者，文案短小、抓人眼球。",
        llm=llm,
    )
    copy_task = Task(
        # 注意 {market_analysis}：它的值要由第 1 阶段的结果提供
        # Note {market_analysis}: its value must come from stage 1's result
        description="市场分析：\n{market_analysis}\n\n"
                    "项目：{project_description}\n"
                    "请为 {customer_domain} 写一条社交媒体营销文案。",
        expected_output="一个标题和一段不超过 80 个字的正文。",
        agent=writer,
        # TODO 1: 让结果变成 Copy 对象（提示：output_pydantic=...）
        # TODO 1: make the result a Copy object (hint: output_pydantic=...)
    )
    return Crew(agents=[writer], tasks=[copy_task], process=Process.sequential)


def run_pipeline(inputs):
    """两个阶段按顺序执行。/ Run the two stages in order."""
    # TODO 2: 用 inputs 运行第 1 阶段的 crew，结果存到 result_a
    # TODO 2: run the stage-1 crew with inputs; store the result in result_a

    # TODO 3: 新建 stage2_inputs：包含 inputs 里的全部内容，再加上 "market_analysis": result_a.raw
    #         （提示：{**inputs, "键": 值}）
    # TODO 3: build stage2_inputs: everything in inputs plus "market_analysis": result_a.raw
    #         (hint: {**inputs, "key": value})

    # TODO 4: 用 stage2_inputs 运行第 2 阶段的 crew，并 return 它的结果
    # TODO 4: run the stage-2 crew with stage2_inputs and return its result
    pass


if __name__ == "__main__":
    # 和视频一样，用第 55 集的那个问题
    inputs = {
        "customer_domain": "emqx.com",
        "project_description": "EMQX 是一款开源的 MQTT 消息服务器，能连接海量物联网设备并实时处理数据。"
                               "请为它策划一次面向国内物联网开发者和企业的推广活动。",
    }
    result = run_pipeline(inputs)

    # TODO 5: 从 result.pydantic 里取出标题和正文并打印
    # TODO 5: print the title and body from result.pydantic
