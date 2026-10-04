"""第 54 节参考答案：三个 Agent 协作写一个游戏（视频的结构：YAML 配置 + @CrewBase）
Lesson 54 solution: three agents write a game together (the video's layout: YAML config + @CrewBase)

做了什么 / What it does:
    高级软件工程师写代码 → 软件质量控制工程师查错并改好 → 首席质量控制工程师确认功能完整。
    Agent 和任务的文字在 data/l54_agents.yaml、data/l54_tasks.yaml 里，这个文件只负责「组装」。
    视频用俄罗斯方块（也提到贪吃蛇）；本课改用贪吃蛇，并要求只用 Python 自带的 tkinter
    画窗口，不用另装任何库。
    A senior engineer writes the code -> a QA engineer finds and fixes bugs -> a chief QA engineer
    checks that the game is complete. The agent and task texts live in data/l54_agents.yaml and
    data/l54_tasks.yaml; this file only wires them together. The video builds Tetris (and mentions
    Snake); this lesson builds Snake with Python's built-in tkinter, so nothing extra is installed.

运行环境 / Environment: .venv-crewai  (crewai 1.15.23) —— 不是 .venv！/ not .venv!
运行 / Run:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l54_dev_team_solution.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY / the DEEPSEEK_API_KEY environment variable。3 次模型调用，约 2-6 分钟。
              3 model calls, about 2-6 minutes.
输出 / Output: practice\\data\\l54_output\\snake_game.py
    生成的代码不会被自动运行。先打开读一遍，确认没问题再自己运行：
    The generated code is never run automatically. Read it first, then run it yourself:
    & ..\\.venv-crewai\\Scripts\\python.exe data\\l54_output\\snake_game.py
"""
import ast
import os
from pathlib import Path

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")                      # 不上传执行追踪 / no trace upload
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))  # CrewAI 的小数据库放进项目的 .cache / keep its db in the project's .cache

from crewai import LLM, Agent, Crew, Process, Task  # noqa: E402
from crewai.project import CrewBase, agent, crew, task  # noqa: E402

from llm import API_KEY, BASE_URL, MODEL  # noqa: E402

# 所有 Agent 共用一个 DeepSeek 模型（视频用的是 GPT-4o，也试了 GPT-4o-mini 和通义千问 qwen-max）
# Every agent shares one DeepSeek model (the video used GPT-4o, and also tried GPT-4o-mini and qwen-max)
llm = LLM(model=f"openai/{MODEL}", base_url=BASE_URL, api_key=API_KEY)


@CrewBase
class GameDevCrew:
    """三人开发小组：写代码 → 查错修复 → 验收。/ A three-person dev team: write -> fix -> sign off."""

    # 路径相对于「这个 .py 文件所在的文件夹」/ paths are relative to this file's folder
    agents_config = "data/l54_agents.yaml"
    tasks_config = "data/l54_tasks.yaml"

    @agent
    def senior_engineer(self) -> Agent:
        return Agent(config=self.agents_config["senior_engineer"], llm=llm, verbose=True)

    @agent
    def qa_engineer(self) -> Agent:
        return Agent(config=self.agents_config["qa_engineer"], llm=llm, verbose=True)

    @agent
    def chief_qa_engineer(self) -> Agent:
        return Agent(config=self.agents_config["chief_qa_engineer"], llm=llm, verbose=True)

    @task
    def code_task(self) -> Task:
        return Task(config=self.tasks_config["code_task"])

    @task
    def review_task(self) -> Task:
        # 没写 context：顺序流程里，它会自动收到前面所有任务的输出（这里就是第一版代码）
        # No context: in a sequential crew it automatically receives every earlier output (the first draft)
        return Task(config=self.tasks_config["review_task"])

    @task
    def evaluate_task(self) -> Task:
        return Task(config=self.tasks_config["evaluate_task"])

    @crew
    def crew(self) -> Crew:
        # self.agents / self.tasks：@CrewBase 按定义顺序收集好的列表
        # self.agents / self.tasks: lists collected by @CrewBase, in definition order
        return Crew(agents=self.agents, tasks=self.tasks, process=Process.sequential, verbose=True)


# 游戏说明：照视频 apiTest 里的写法，写清名称、玩法、操作、计分和结束条件
# The game description, laid out like the video's apiTest: name, play, controls, scoring, game over
GAME = """游戏名称：贪吃蛇
游戏说明：玩家控制一条蛇在格子地图上移动，吃到食物后蛇身变长、得分增加，新的食物随机出现在空格子上。蛇的移动速度要适中，不要太快。
技术要求：只使用 Python 自带的 tkinter 画窗口和图形，不要使用 pygame 等第三方库；地图 20×20 格，每格 20 像素。
操作方式：用方向键 ↑ ↓ ← → 改变蛇的方向，不能直接掉头。
计分规则：每吃到一个食物加 10 分，窗口顶部显示当前分数。
结束条件：蛇撞到墙壁或撞到自己的身体时游戏结束，显示「游戏结束」和最终得分；按空格键重新开始。"""

OUT = Path("data/l54_output/snake_game.py")   # 相对于运行命令时所在的文件夹 / relative to where you run the command


def clean_code(text):
    """去掉模型有时还会加上的 ``` 围栏行 / strip the ``` fence lines the model may still add."""
    lines = text.strip().split("\n")
    if lines and lines[0].startswith("```"):
        lines = lines[1:]
    if lines and lines[-1].startswith("```"):
        lines = lines[:-1]
    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    result = GameDevCrew().crew().kickoff(inputs={"game": GAME})

    code = clean_code(result.raw)            # result.raw = 最后一个任务（验收）的输出 / the last task's output
    try:
        ast.parse(code)                      # 只检查语法，不运行 / check the syntax only, never run it
        print("\n语法检查通过 / syntax OK")
    except SyntaxError as e:
        print(f"\n语法错误 / syntax error: 第 {e.lineno} 行 / line {e.lineno}: {e.msg}")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(code, encoding="utf-8")
    print("代码已保存 / saved to:", OUT.resolve())
    print("代码行数 / lines of code:", len(code.splitlines()))
    for t in result.tasks_output:            # 每个任务各自的输出 / each task's own output
        print(f"  {t.agent.strip()}: {len(t.raw)} 个字符 / characters")   # YAML 里的文字末尾带换行 / YAML text ends with a newline
    print("先打开读一遍，再自己运行 / read it first, then run it yourself:")
    print(r"  & ..\.venv-crewai\Scripts\python.exe data\l54_output\snake_game.py")
