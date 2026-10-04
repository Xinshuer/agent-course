"""第 58 节参考答案：第一个 Flow —— 视频里官方模板的「写诗 Flow」，@start → @listen → @listen
Lesson 58 solution: a first Flow - the official template's "poem flow" from the video, @start -> @listen -> @listen

做了什么 / What it does:
    和视频里用命令行生成的示例模板结构相同（写在一个文件里）：
      1. generate_sentence_count （@start） 随机决定诗有几句（1–5），存进 self.state.sentence_count
      2. generate_poem           （@listen）在这一步里运行写诗的 Crew，结果存进 self.state.poem
      3. save_poem               （@listen）把诗写进 l58_poem.txt，并作为整个 Flow 的返回值
    最后用 flow.plot() 生成流程图（HTML），打印出它的位置。
    Same shape as the example template the video generates from the command line (in one file):
      1. generate_sentence_count (@start)  picks how many lines the poem has (1-5) -> self.state.sentence_count
      2. generate_poem           (@listen) runs the poem-writing crew in this step -> self.state.poem
      3. save_poem               (@listen) writes l58_poem.txt and returns the result of the whole flow
    Finally flow.plot() draws the flow as an HTML page and prints where it was saved.

运行环境 / Environment: .venv-crewai  (crewai 1.15.23) —— 不是 .venv！/ not .venv!
运行 / Run:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l58_flow_solution.py
需要 / Needs: DEEPSEEK_API_KEY，以及同一文件夹里的 l55_deepseek_llm.py。约 1 次模型调用。
              视频用的是 GPT-4o-mini，这里用 DeepSeek。
              Also l55_deepseek_llm.py in the same folder. About 1 model call.
              The video uses GPT-4o-mini; this file uses DeepSeek.
"""
import os
import random

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))   # 必须在 import crewai 之前 / before importing crewai

from crewai import Agent, Crew, Task  # noqa: E402
from crewai.flow import Flow, listen, start  # noqa: E402   视频（0.74）写的是 crewai.flow.flow，也能用 / the video's crewai.flow.flow works too
from pydantic import BaseModel  # noqa: E402

from l55_deepseek_llm import llm  # noqa: E402   回顾 55 节 / see lesson 55


class PoemState(BaseModel):
    """整个 Flow 共用的数据（结构化状态），每个字段都要有默认值。
    Data shared by every step (structured state); every field needs a default."""
    topic: str = "学 Agent 开发"
    sentence_count: int = 1
    poem: str = ""


def build_poem_crew():
    """写诗的小 Crew：一个 Agent、一个 Task（模板里放在 crews/poem_crew 文件夹）。
    The poem crew: one agent, one task (the template keeps it in crews/poem_crew)."""
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


class PoemFlow(Flow[PoemState]):

    @start()                                   # 第一步：kickoff 后最先运行 / step 1: runs first
    def generate_sentence_count(self):
        self.state.sentence_count = random.randint(1, 5)
        print(f"这次写 {self.state.sentence_count} 句 / {self.state.sentence_count} lines this time")

    @listen(generate_sentence_count)           # 上一步完成后运行 / runs after the previous step
    def generate_poem(self):
        result = build_poem_crew().kickoff(inputs={
            "topic": self.state.topic,
            "sentence_count": self.state.sentence_count,
        })
        self.state.poem = result.raw

    @listen(generate_poem)
    def save_poem(self):
        with open("l58_poem.txt", "w", encoding="utf-8") as f:
            f.write(self.state.poem)
        print("已保存到 / saved to l58_poem.txt")
        return self.state.poem                 # 最后一步的返回值 = kickoff() 的返回值 / = what kickoff() returns


if __name__ == "__main__":
    flow = PoemFlow()
    final = flow.kickoff(inputs={"topic": "学 Agent 开发"})   # inputs 会先填进 state / inputs fill the state first
    print("\n========== Flow 的结果 / flow result ==========")
    print(final)

    # 画流程图：返回 HTML 文件的完整路径（1.15.23 放在一个临时文件夹里；视频里是当前文件夹的 crewai_flow.html）
    # Draw the flow: returns the HTML file's full path (1.15.23 uses a temp folder; in the video it was
    # crewai_flow.html in the current folder)
    print("流程图 / flow chart:", flow.plot("l58_poem_flow.html", show=False))
