"""第 57 节参考答案：把两个 Crew 串成一条「流水线」（视频里 Pipeline 第三种测试的思路）
Lesson 57 solution: chain two crews into a "pipeline" (the idea of the video's third Pipeline test)

做了什么 / What it does:
    第 1 阶段（crew A）：首席市场分析师分析客户和项目，输出 3 条要点。
    第 2 阶段（crew B）：首席创意内容创作者拿到上一阶段的分析，写出 {title, body} 结构的文案。
    上一阶段的输出通过 inputs 里的 {market_analysis} 占位符交给下一阶段。
    视频用的是 crewai 0.74 的 Pipeline 类；crewai 1.x 已经删掉了它，这里用几行普通代码实现同样的事。
    Stage 1 (crew A): the lead market analyst writes 3 key points about the client and project.
    Stage 2 (crew B): the chief creative content writer turns that analysis into copy shaped {title, body}.
    Stage 1's output reaches stage 2 through the {market_analysis} placeholder in inputs.
    The video uses crewai 0.74's Pipeline class; crewai 1.x removed it, so plain code does the same job.

    输入和视频一样：沿用第 55 集（本课 55 节）的那个问题——为 emqx.com 策划一次推广活动。
    视频里的 crew B 有 2 个 Agent、4 个 Task；这里为了省钱只保留写文案的 1 个 Agent、1 个 Task，结构相同。

运行环境 / Environment: .venv-crewai  (crewai 1.15.23) —— 不是 .venv！/ not .venv!
运行 / Run:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l57_pipeline_solution.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY / the DEEPSEEK_API_KEY environment variable，以及同一文件夹里的 l55_deepseek_llm.py。
              约 2 次模型调用、20–60 秒。视频用的是 GPT-4o-mini，这里用 DeepSeek。
              Also needs l55_deepseek_llm.py in the same folder. About 2 model calls, 20-60 seconds.
              The video uses GPT-4o-mini; this file uses DeepSeek.
"""
import os

# 必须在 import crewai 之前设置 / must be set BEFORE importing crewai
os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")                        # 关掉执行追踪 / no tracing
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))    # 存储放进项目的 .cache / storage in the project's .cache

from crewai import Agent, Crew, Process, Task  # noqa: E402
from pydantic import BaseModel  # noqa: E402

# DeepSeek 不支持 output_pydantic 默认发送的 json_schema 格式，所以用 55 节准备好的 llm（原因见那个文件）
# DeepSeek rejects the json_schema format output_pydantic sends, so use lesson 55's llm (see that file)
from l55_deepseek_llm import llm  # noqa: E402


class Copy(BaseModel):
    """最终文案：标题 + 正文（和视频里的输出结构一样）。/ Final copy: title + body, as in the video."""
    title: str
    body: str


# 和视频一样，用第 55 集的那个问题（也是 l55_json_tasks_solution.py 的输入）
INPUTS = {
    "customer_domain": "emqx.com",
    "project_description": "EMQX 是一款开源的 MQTT 消息服务器，能连接海量物联网设备并实时处理数据。"
                           "请为它策划一次面向国内物联网开发者和企业的推广活动。",
}


def build_analysis_crew():
    """第 1 阶段：市场分析（视频里的 crew A）。/ Stage 1: market analysis (crew A in the video)."""
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
    """第 2 阶段：根据分析写文案（视频里的 crew B）。/ Stage 2: write copy from the analysis (crew B)."""
    writer = Agent(
        role="首席创意内容创作者",
        goal="把市场分析变成一条吸引人的社交媒体营销文案",
        backstory="你在一家一流的数字营销公司做首席创意内容创作者，文案短小、抓人眼球。",
        llm=llm,
    )
    copy_task = Task(
        description="市场分析：\n{market_analysis}\n\n"          # ← 上一阶段的结果放在这里
                    "项目：{project_description}\n"
                    "请为 {customer_domain} 写一条社交媒体营销文案。",
        expected_output="一个标题和一段不超过 80 个字的正文。",
        agent=writer,
        output_pydantic=Copy,          # 结果会被转换成 Copy 对象 / the result becomes a Copy object
    )
    return Crew(agents=[writer], tasks=[copy_task], process=Process.sequential)


def run_pipeline(inputs):
    """两个阶段按顺序执行，上一阶段的输出放进下一阶段的输入。
    Run the two stages in order; stage 1's output goes into stage 2's inputs."""
    result_a = build_analysis_crew().kickoff(inputs=inputs)
    print("\n[阶段 1 完成 / stage 1 done]\n" + result_a.raw)

    stage2_inputs = {**inputs, "market_analysis": result_a.raw}   # 合并字典（回顾 26 节）/ merge dicts (lesson 26)
    result_b = build_copy_crew().kickoff(inputs=stage2_inputs)
    return result_b


if __name__ == "__main__":
    result = run_pipeline(INPUTS)

    print("\n========== 最终文案 / final copy ==========")
    copy = result.pydantic                 # Copy 对象 / a Copy object
    print("标题 / title:", copy.title)
    print("正文 / body:", copy.body)
    print("\n字典形式 / as a dict:", result.to_dict())
    print("第 2 阶段 token 用量 / stage-2 token usage:", result.token_usage.total_tokens)
