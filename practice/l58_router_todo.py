"""第 58 节练习：用 @router 做「不合格就重写」的循环（补全 TODO）
Lesson 58 exercise: a "rewrite until it passes" loop with @router (fill in the TODOs)

做了什么 / What it does:
    write 写一句广告语 → review 检查字数并返回标签 → "ok" 就发布，"retry" 就回到 write，
    试满 3 次还不行就 "give_up"。write 已经写好了，你要补全路由和两个结局。
    write drafts a slogan -> review checks the length and returns a label -> "ok" publishes,
    "retry" goes back to write, and after 3 tries "give_up". write is ready; you add the
    router and the two endings.

运行环境 / Environment: .venv-crewai  (crewai 1.15.23)
运行 / Run:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l58_router_todo.py
需要 / Needs: DEEPSEEK_API_KEY，以及 l55_deepseek_llm.py。1–3 次模型调用。/ 1-3 model calls.
参考答案 / Solution: l58_router_solution.py
"""
import os

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))   # 必须在 import crewai 之前 / before importing crewai

from crewai.flow import Flow, listen, router, start  # noqa: E402,F401
from pydantic import BaseModel  # noqa: E402

from l55_deepseek_llm import llm  # noqa: E402


class CopyState(BaseModel):
    product: str = "桂花冷萃"
    max_chars: int = 12
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

    # TODO 1: 写方法 review，用 @router(write) 装饰：
    #   - 字数 len(self.state.draft) 不超过 self.state.max_chars → return "ok"
    #   - 否则，如果 self.state.tries 已经 >= 3 → return "give_up"
    #   - 否则 → return "retry"
    # TODO 1: write a method review decorated with @router(write):
    #   - len(self.state.draft) <= self.state.max_chars -> return "ok"
    #   - otherwise, if self.state.tries >= 3 -> return "give_up"
    #   - otherwise -> return "retry"

    # TODO 2: 写方法 publish，用 @listen("ok") 装饰，返回 "通过：" + self.state.draft
    # TODO 2: write publish, decorated with @listen("ok"), returning "passed: " + self.state.draft

    # TODO 3: 写方法 stop_trying，用 @listen("give_up") 装饰，返回一句说明放弃了的话
    #         注意：方法名不能和它监听的标签同名（不能叫 give_up），否则 Flow 会报错
    # TODO 3: write stop_trying, decorated with @listen("give_up"), returning a message that says it gave up
    #         Careful: the method must not share its name with the label it listens to (not give_up)


if __name__ == "__main__":
    flow = ReviewFlow()
    print(flow.kickoff(inputs={"product": "桂花冷萃", "max_chars": 12}))
