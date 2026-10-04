"""第 58 节练习：手写第一个 Flow —— 视频里的「写诗 Flow」（补全 TODO）
Lesson 58 exercise: hand-write your first Flow - the video's "poem flow" (fill in the TODOs)

做了什么 / What it does:
    generate_sentence_count（@start）→ generate_poem（@listen）→ save_poem（@listen），
    三个步骤通过 self.state 共享数据。写诗的 Crew 已经写好了，你要补全状态类和 Flow 本身。
    generate_sentence_count (@start) -> generate_poem (@listen) -> save_poem (@listen); the three
    steps share data through self.state. The poem crew is ready; you write the state class and the Flow.

运行环境 / Environment: .venv-crewai  (crewai 1.15.23) —— 不是 .venv！/ not .venv!
运行 / Run:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l58_flow_todo.py
需要 / Needs: DEEPSEEK_API_KEY，以及 l55_deepseek_llm.py。约 1 次模型调用。/ About 1 model call.
参考答案 / Solution: l58_flow_solution.py
"""
import os
import random  # noqa: F401   TODO 2 会用到 / used in TODO 2

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))   # 必须在 import crewai 之前 / before importing crewai

from crewai import Agent, Crew, Task  # noqa: E402
from crewai.flow import Flow, listen, start  # noqa: E402,F401
from pydantic import BaseModel  # noqa: E402,F401

from l55_deepseek_llm import llm  # noqa: E402


# TODO 1: 定义状态类 PoemState(BaseModel)，三个字段都要有默认值：
#         topic: str = "学 Agent 开发"、sentence_count: int = 1、poem: str = ""
# TODO 1: define PoemState(BaseModel) with three fields, all with defaults:
#         topic: str = "学 Agent 开发", sentence_count: int = 1, poem: str = ""


def build_poem_crew():
    """写诗的小 Crew（已写好）。/ The poem crew (ready to use)."""
    poet = Agent(
        role="诗人",
        goal="围绕 {topic} 写轻松有趣的短诗",
        backstory="你写的诗短小、押韵，带一点幽默。",
        llm=llm,
    )
    task = Task(
        description="写一首关于「{topic}」的轻松短诗，一共 {sentence_count} 句。",
        expected_output="正好 {sentence_count} 句中文诗，每句一行，不要标题，不要解释。",
        agent=poet,
    )
    return Crew(agents=[poet], tasks=[task])


# TODO 2: 定义 class PoemFlow(Flow[PoemState]):，在里面写三个方法：
#   - generate_sentence_count：用 @start() 装饰；self.state.sentence_count = random.randint(1, 5)
#   - generate_poem：用 @listen(generate_sentence_count) 装饰；运行 build_poem_crew().kickoff(inputs={...})，
#     inputs 里放 topic 和 sentence_count（都从 self.state 取），再把 result.raw 存进 self.state.poem
#   - save_poem：用 @listen(generate_poem) 装饰；把 self.state.poem 写进 l58_poem.txt，并 return 它
# TODO 2: define class PoemFlow(Flow[PoemState]): with three methods:
#   - generate_sentence_count: decorated with @start(); self.state.sentence_count = random.randint(1, 5)
#   - generate_poem: decorated with @listen(generate_sentence_count); run build_poem_crew().kickoff(inputs={...})
#     with topic and sentence_count taken from self.state, then store result.raw in self.state.poem
#   - save_poem: decorated with @listen(generate_poem); write self.state.poem to l58_poem.txt and return it


if __name__ == "__main__":
    # TODO 3: 创建 PoemFlow()，用 kickoff(inputs={"topic": "学 Agent 开发"}) 运行，打印返回值
    # TODO 3: create PoemFlow(), run it with kickoff(inputs={"topic": "学 Agent 开发"}) and print the result

    # TODO 4（选做）: 打印 flow.plot("l58_poem_flow.html", show=False) 返回的路径，用浏览器打开看看
    # TODO 4 (optional): print the path returned by flow.plot("l58_poem_flow.html", show=False) and open it
    pass
