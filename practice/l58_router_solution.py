"""第 58 节参考答案（补充练习）：用 @router 做分支和「不合格就重写」的循环
Lesson 58 solution (extra exercise): branching and a "rewrite until it passes" loop with @router

视频只在概念部分介绍了 @router，没有写代码；这个文件补上一个能运行的例子。
The video only introduces @router as a concept without code; this file adds a runnable example.

做了什么 / What it does:
    write    （@start("retry")）让模型写一句广告语。Flow 启动时运行一次，
              之后每当路由返回 "retry" 就再运行一次。
    review   （@router(write)）用普通 Python 检查字数，返回标签 "ok" / "retry" / "give_up"。
    publish  （@listen("ok")）     合格：返回最终结果
    stop_trying（@listen("give_up")）试了 3 次还不合格：放弃
    这一步直接调用模型（llm.call），不用 Crew —— Flow 的步骤里放什么都可以。
    write   (@start("retry")) asks the model for one slogan. It runs once when the flow
            starts, and again every time the router returns "retry".
    review  (@router(write)) checks the length in plain Python and returns "ok" / "retry" / "give_up".
    publish (@listen("ok"))      passes: return the final result
    stop_trying (@listen("give_up")) still too long after 3 tries: stop
    The step calls the model directly (llm.call) instead of a crew - a flow step can hold anything.

运行环境 / Environment: .venv-crewai  (crewai 1.15.23)
运行 / Run:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l58_router_solution.py
需要 / Needs: DEEPSEEK_API_KEY，以及 l55_deepseek_llm.py。1–3 次模型调用（取决于要重写几次）。
              1-3 model calls, depending on how many rewrites are needed.
"""
import os
from typing import Literal

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))   # 必须在 import crewai 之前 / before importing crewai

from crewai.flow import Flow, listen, router, start  # noqa: E402
from pydantic import BaseModel  # noqa: E402

from l55_deepseek_llm import llm  # noqa: E402


class CopyState(BaseModel):
    product: str = "桂花冷萃"
    max_chars: int = 12        # 广告语最多几个字 / the slogan's character limit
    draft: str = ""
    tries: int = 0


class ReviewFlow(Flow[CopyState]):

    @start("retry")                       # 启动时运行；收到 "retry" 也运行 / runs at start and on "retry"
    def write(self):
        self.state.tries += 1
        prompt = (f"为{self.state.product}写一句广告语，不超过{self.state.max_chars}个字，"
                  "只输出广告语本身。")
        if self.state.tries > 1:
            prompt += f"上一版有{len(self.state.draft)}个字，太长了：{self.state.draft}"
        self.state.draft = llm.call(prompt).strip()
        print(f"第 {self.state.tries} 版 / draft {self.state.tries}: {self.state.draft}")

    @router(write)
    def review(self) -> Literal["ok", "retry", "give_up"]:   # 标注返回哪些标签，流程图能画出分支
        if len(self.state.draft) <= self.state.max_chars:
            return "ok"
        if self.state.tries >= 3:
            return "give_up"
        return "retry"

    @listen("ok")
    def publish(self):
        return f"通过 / passed: {self.state.draft}"

    @listen("give_up")
    def stop_trying(self):
        return f"试了 {self.state.tries} 次还是太长 / still too long after {self.state.tries} tries: {self.state.draft}"


if __name__ == "__main__":
    flow = ReviewFlow()
    print(flow.kickoff(inputs={"product": "桂花冷萃", "max_chars": 12}))
    print("流程图 / flow chart:", flow.plot("l58_review_flow.html", show=False))
