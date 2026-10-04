"""第 58 节示例：@persist 把 Flow 的 state 存进 SQLite，下次用同一个 id 接着跑 —— 不调用模型
Lesson 58 demo: @persist saves the flow state to SQLite and a later run resumes it by id - no model calls

做了什么 / What it does:
    VisitFlow 每运行一次就把 visits 加 1。
    第一次运行得到 1；第二次运行时传入第一次的 state id，state 从数据库里读回来，得到 2。
    数据库文件放在 practice\\data\\l58_flow_states.db（明确写路径，不用默认位置 ——
    默认位置是 CrewAI 的存储目录：设了 CREWAI_STORAGE_DIR 就在那个文件夹，没设就在 C 盘的 AppData 里）。
    VisitFlow adds 1 to visits on every run. The first run gives 1; the second run passes the
    first run's state id, the state is loaded back from the database, and gives 2.
    The database lives at practice\\data\\l58_flow_states.db (an explicit path instead of the
    default, CrewAI's storage folder: CREWAI_STORAGE_DIR if set, otherwise AppData on drive C).

运行环境 / Environment: .venv-crewai  (crewai 1.15.23)
运行 / Run:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l58_persist_demo.py
需要 / Needs: 不需要 key，不调用模型。/ No key, no model calls.
"""
import os
from pathlib import Path

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))   # 必须在 import crewai 之前 / before importing crewai

from crewai.flow import Flow, start  # noqa: E402
from crewai.flow.persistence import SQLiteFlowPersistence, persist  # noqa: E402
from pydantic import BaseModel  # noqa: E402

DB_PATH = Path(__file__).parent / "data" / "l58_flow_states.db"
store = SQLiteFlowPersistence(str(DB_PATH))


class VisitState(BaseModel):
    visits: int = 0


@persist(store)                 # 每一步结束后，自动把 state 存进数据库 / save the state after every step
class VisitFlow(Flow[VisitState]):

    @start()
    def count_visit(self):
        self.state.visits += 1
        return self.state.visits


if __name__ == "__main__":
    first = VisitFlow(suppress_flow_events=True)
    print("第一次 / first run:", first.kickoff())
    saved_id = first.state.id                       # state 自动带一个 id / the state gets an id automatically
    print("state id:", saved_id)

    again = VisitFlow(suppress_flow_events=True)
    print("用同一个 id 再跑 / same id again:", again.kickoff(inputs={"id": saved_id}))   # -> 2
    print("数据库 / database:", DB_PATH)
