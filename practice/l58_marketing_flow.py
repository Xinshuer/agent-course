"""第 58 节示例：视频里的营销 Flow（视频的 flows_test.py / TestFlow）—— 两个 Crew 变成 Flow 的两个步骤
Lesson 58 demo: the video's marketing flow (its flows_test.py / TestFlow) - two crews become two flow steps

做了什么 / What it does:
    和 57 节是同一对 Crew（市场分析 → 写文案），这次不手动串联，而是交给 Flow：
      market_analysis（@start）  运行分析 Crew，把结果存进 state
      create_copy    （@listen） 从 state 取出分析，运行文案 Crew，返回 {title, body}
    视频的 TestFlow 通过构造函数传入模型和输入；这里把输入交给 kickoff(inputs=...)，放进结构化 state。
    The same pair of crews as lesson 57 (analysis -> copy), now chained by a Flow
    instead of by hand:
      market_analysis (@start)  runs the analysis crew and stores the result in the state
      create_copy     (@listen) reads the analysis from the state, runs the copy crew,
                                and returns {title, body}
    The video's TestFlow takes the model and the inputs in its constructor; here the inputs go
    through kickoff(inputs=...) into a structured state.
    输入和视频一样：第 55 集的那个问题（为 emqx.com 策划推广活动），定义在 l57_pipeline_solution.py。

运行环境 / Environment: .venv-crewai  (crewai 1.15.23)
运行 / Run:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l58_marketing_flow.py
需要 / Needs: DEEPSEEK_API_KEY，以及 l57_pipeline_solution.py、l55_deepseek_llm.py。约 2 次模型调用。
              Also those two files in the same folder. About 2 model calls.
"""
import os

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))   # 必须在 import crewai 之前 / before importing crewai

from crewai.flow import Flow, listen, start  # noqa: E402
from pydantic import BaseModel  # noqa: E402

# 两个 Crew 直接复用 57 节写好的 / reuse the two crews from lesson 57
from l57_pipeline_solution import INPUTS, build_analysis_crew, build_copy_crew  # noqa: E402


class MarketingState(BaseModel):
    customer_domain: str = ""
    project_description: str = ""
    market_analysis: str = ""
    title: str = ""
    body: str = ""


class MarketingFlow(Flow[MarketingState]):

    @start()
    def market_analysis(self):
        result = build_analysis_crew().kickoff(inputs={
            "customer_domain": self.state.customer_domain,
            "project_description": self.state.project_description,
        })
        self.state.market_analysis = result.raw

    @listen(market_analysis)
    def create_copy(self):
        result = build_copy_crew().kickoff(inputs={
            "customer_domain": self.state.customer_domain,
            "project_description": self.state.project_description,
            "market_analysis": self.state.market_analysis,     # 上一步存进 state 的分析
        })
        self.state.title = result.pydantic.title
        self.state.body = result.pydantic.body
        return {"title": self.state.title, "body": self.state.body}


if __name__ == "__main__":
    flow = MarketingFlow()
    copy = flow.kickoff(inputs=INPUTS)        # 视频的输入：第 55 集的那个问题（emqx.com）
    print("\n========== 最终文案 / final copy ==========")
    print(copy)
