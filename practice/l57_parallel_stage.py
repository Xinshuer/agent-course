"""第 57 节示例：并行阶段 —— 一个阶段里同时跑两个 Crew
Lesson 57 demo: a parallel stage - two crews running at the same time in one stage

做了什么 / What it does:
    阶段 1：市场分析（crew A）
    阶段 2：两个 Crew 同时运行，拿到同一份分析：
            社交媒体文案（crew B，输出 {title, body}）和 活动海报标语（crew C）
    这就是视频里「crew1 → crew2 和 crew3 并行 → ……」的结构。
    旧版 Pipeline 内部也是用 asyncio.gather 同时运行一个阶段里的多个 Crew。
    Stage 1: market analysis (crew A)
    Stage 2: two crews run at once on the same analysis:
             social-media copy (crew B, {title, body}) and a shop-poster slogan (crew C)
    This is the video's "crew1 -> crew2 and crew3 in parallel -> ..." shape.
    The old Pipeline also ran the crews of one stage concurrently with asyncio.gather.

运行环境 / Environment: .venv-crewai  (crewai 1.15.23)
运行 / Run:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l57_parallel_stage.py
需要 / Needs: DEEPSEEK_API_KEY，以及同一文件夹里的 l57_pipeline_solution.py、l55_deepseek_llm.py。
              约 3 次模型调用。/ Also those two files in the same folder. About 3 model calls.
"""
import asyncio
import os

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))   # 必须在 import crewai 之前 / before importing crewai

from crewai import Agent, Crew, Task  # noqa: E402

from l55_deepseek_llm import llm  # noqa: E402
from l57_pipeline_solution import INPUTS, build_analysis_crew, build_copy_crew  # noqa: E402


def build_slogan_crew():
    """阶段 2 的另一个 Crew：活动海报标语。/ The other stage-2 crew: a poster slogan."""
    designer = Agent(
        role="活动海报策划",
        goal="为推广活动的海报想一句醒目的标语",
        backstory="你做过很多技术大会和展会的海报，知道路过的人只会看一眼。",
        llm=llm,
    )
    slogan_task = Task(
        description="市场分析：\n{market_analysis}\n\n为 {customer_domain} 的推广活动海报写一句标语。",
        expected_output="一句不超过 15 个字的中文标语，不要解释。",
        agent=designer,
    )
    return Crew(agents=[designer], tasks=[slogan_task])


async def run_pipeline_with_parallel_stage(inputs):
    # 阶段 1：只有一个 Crew / stage 1: a single crew
    result_a = await build_analysis_crew().kickoff_async(inputs=inputs)
    stage2_inputs = {**inputs, "market_analysis": result_a.raw}

    # 阶段 2：两个 Crew 同时开始，等两个都结束（回顾 09 节的 asyncio.gather）
    # Stage 2: start both crews together and wait for both (see asyncio.gather in lesson 09)
    copy_result, slogan_result = await asyncio.gather(
        build_copy_crew().kickoff_async(inputs=stage2_inputs),
        build_slogan_crew().kickoff_async(inputs=stage2_inputs),
    )
    return copy_result, slogan_result


if __name__ == "__main__":
    copy_result, slogan_result = asyncio.run(run_pipeline_with_parallel_stage(INPUTS))   # 视频的输入

    print("\n========== 阶段 2 的两个结果 / the two stage-2 results ==========")
    print("文案标题 / post title:", copy_result.pydantic.title)
    print("文案正文 / post body:", copy_result.pydantic.body)
    print("海报标语 / poster slogan:", slogan_result.raw)
