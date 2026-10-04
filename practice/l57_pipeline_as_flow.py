"""第 57 节示例：视频里的 Pipeline 示意图，用 crewai 1.x 的 Flow 写出来 —— 不调用模型，随便运行不花钱
Lesson 57 demo: the video's Pipeline diagram written as a crewai 1.x Flow - no model calls, free to run

做了什么 / What it does:
    视频的示意图：crew1 → crew2 和 crew3 并行 → crew4。
    旧版写法是 Pipeline(stages=[crew1, [crew2, crew3], crew4])；Pipeline 在 1.x 里删除了，
    官方的替代品是 Flow（58 节细讲）：
      crew1  用 @start()            —— 第一个阶段
      crew2  用 @listen(crew1)      —— crew1 完成后运行
      crew3  也用 @listen(crew1)    —— 和 crew2 同时运行（并行阶段）
      crew4  用 @listen(and_(crew2, crew3)) —— 两个都完成后才运行
    每个「Crew」这里用 time.sleep(1) 假装在工作，看总耗时就知道 crew2 和 crew3 是同时跑的
    （约 3 秒，而不是 4 秒）。真实项目里把 fake_crew(...) 换成 某个Crew().kickoff(inputs=...) 即可。
    The video's diagram: crew1 -> crew2 and crew3 in parallel -> crew4.
    The old code was Pipeline(stages=[crew1, [crew2, crew3], crew4]); Pipeline is gone in 1.x and
    the official replacement is Flow (lesson 58 goes into detail):
      crew1  @start()                      - the first stage
      crew2  @listen(crew1)                - runs when crew1 is done
      crew3  @listen(crew1) as well        - runs at the same time as crew2 (a parallel stage)
      crew4  @listen(and_(crew2, crew3))   - runs only after both are done
    Each "crew" pretends to work with time.sleep(1); the total time (about 3 s, not 4 s) shows that
    crew2 and crew3 run together. In a real project, replace fake_crew(...) with SomeCrew().kickoff(inputs=...).

运行环境 / Environment: .venv-crewai  (crewai 1.15.23)
运行 / Run:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l57_pipeline_as_flow.py
需要 / Needs: 不需要 key，不调用模型。/ No key, no model calls.
"""
import os
import time

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))

from crewai.flow import Flow, and_, listen, start  # noqa: E402

began = time.time()     # 计时起点，kickoff 之前会重设 / the clock's start, reset just before kickoff


def fake_crew(name, seconds=1):
    """假装一个 Crew 在工作，并打印第几秒开始、第几秒结束。
    Pretend a crew is working, printing the second it starts and ends."""
    print(f"  [{time.time() - began:.1f}s] {name} 开始 / starts")
    time.sleep(seconds)
    print(f"  [{time.time() - began:.1f}s] {name} 完成 / done")
    return f"{name} 的结果 / result of {name}"


class PipelineAsFlow(Flow):          # 不写 [状态类]：state 是一个字典 / no state class: the state is a dict

    @start()                         # 阶段 1 / stage 1
    def crew1(self):
        self.state["crew1"] = fake_crew("crew1")

    @listen(crew1)                   # 阶段 2（并行）/ stage 2 (parallel)
    def crew2(self):
        self.state["crew2"] = fake_crew("crew2")

    @listen(crew1)                   # 阶段 2（并行）/ stage 2 (parallel)
    def crew3(self):
        self.state["crew3"] = fake_crew("crew3")

    @listen(and_(crew2, crew3))      # 阶段 3：等 crew2 和 crew3 都完成 / stage 3: waits for both
    def crew4(self):
        used = f"{self.state['crew2']} + {self.state['crew3']}"
        return fake_crew("crew4") + f"（用到了 / used: {used}）"


if __name__ == "__main__":
    flow = PipelineAsFlow(suppress_flow_events=True)     # 关掉方框日志 / hide the boxed logs
    began = time.time()                                  # 只计 kickoff 的时间 / time only the kickoff
    print("最终输出 / final output:", flow.kickoff())
    print(f"总耗时 / total time: {time.time() - began:.1f} 秒 / s（约 3 秒：crew2 和 crew3 是同时跑的 / about 3 s: crew2 and crew3 ran together）")
