"""第 54 节练习：三个 Agent 协作写一个游戏（TODO 版）
Lesson 54 exercise: three agents write a game together (TODO version)

要做的事 / Your job:
    Agent 和任务的文字已经写好在 data/l54_agents.yaml、data/l54_tasks.yaml 里（和参考答案共用）。
    你来写「组装」部分：@CrewBase 类、三个 @agent、三个 @task、一个 @crew，再启动、清理、保存。
    The agent and task texts are ready in data/l54_agents.yaml and data/l54_tasks.yaml (shared with
    the solution). You write the wiring: the @CrewBase class, three @agent, three @task, one @crew,
    then kick it off, clean the code and save it.

运行环境 / Environment: .venv-crewai  (crewai 1.15.23)
运行 / Run:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l54_dev_team_todo.py
需要 / Needs: DEEPSEEK_API_KEY。3 次模型调用 / 3 model calls.
参考答案 / Solution: l54_dev_team_solution.py
输出 / Output: practice\\data\\l54_output\\my_snake_game.py（只保存，不自动运行 / saved, never run automatically）
"""
import ast
import os
from pathlib import Path

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")                      # 不上传执行追踪 / no trace upload
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))  # CrewAI 的小数据库放进项目的 .cache / keep its db in the project's .cache

from crewai import LLM, Agent, Crew, Process, Task  # noqa: E402,F401
from crewai.project import CrewBase, agent, crew, task  # noqa: E402,F401

from llm import API_KEY, BASE_URL, MODEL  # noqa: E402

llm = LLM(model=f"openai/{MODEL}", base_url=BASE_URL, api_key=API_KEY)

# TODO 1: 用 @CrewBase 写一个类 GameDevCrew
#   - agents_config = "data/l54_agents.yaml"，tasks_config = "data/l54_tasks.yaml"
#   - 三个 @agent 方法：senior_engineer、qa_engineer、chief_qa_engineer（名字要和 YAML 的键一样）
#       每个都 return Agent(config=self.agents_config["方法名"], llm=llm, verbose=True)
#   - 三个 @task 方法：code_task、review_task、evaluate_task（顺序 = 执行顺序）
#       每个都 return Task(config=self.tasks_config["方法名"])
#   - 一个 @crew 方法：return Crew(agents=self.agents, tasks=self.tasks,
#                                  process=Process.sequential, verbose=True)
# Write a class GameDevCrew with @CrewBase: the two config paths, three @agent methods,
# three @task methods (definition order = run order) and one @crew method, as described above.
GameDevCrew = None

GAME = """游戏名称：贪吃蛇
游戏说明：玩家控制一条蛇在格子地图上移动，吃到食物后蛇身变长、得分增加，新的食物随机出现在空格子上。蛇的移动速度要适中，不要太快。
技术要求：只使用 Python 自带的 tkinter 画窗口和图形，不要使用 pygame 等第三方库；地图 20×20 格，每格 20 像素。
操作方式：用方向键 ↑ ↓ ← → 改变蛇的方向，不能直接掉头。
计分规则：每吃到一个食物加 10 分，窗口顶部显示当前分数。
结束条件：蛇撞到墙壁或撞到自己的身体时游戏结束，显示「游戏结束」和最终得分；按空格键重新开始。"""

OUT = Path("data/l54_output/my_snake_game.py")


def clean_code(text):
    """去掉 ``` 围栏行 / strip the ``` fence lines."""
    lines = text.strip().split("\n")
    if lines and lines[0].startswith("```"):
        lines = lines[1:]
    if lines and lines[-1].startswith("```"):
        lines = lines[:-1]
    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    # TODO 2: 启动：result = GameDevCrew().crew().kickoff(inputs={"game": GAME})
    #         Kick off the crew with the game description as the "game" input
    result = None

    # TODO 3: code = clean_code(result.raw)；用 ast.parse(code) 检查语法（try/except SyntaxError），
    #         再 OUT.parent.mkdir(parents=True, exist_ok=True) 和 OUT.write_text(code, encoding="utf-8") 保存。
    #         读过代码之后，再自己运行它。
    #         Clean result.raw, check it with ast.parse inside try/except SyntaxError, then save it to OUT.
    #         Read the code before you run it yourself.
