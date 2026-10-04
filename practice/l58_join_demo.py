"""第 58 节示例（补充）：多个 @start 并行、and_ 汇合、or_ 抢先 —— 不调用模型，随便运行不花钱
Lesson 58 demo (extra): parallel @start steps, and_ joins, or_ first-wins - no model calls, free to run

视频在概念部分讲了这几样（多个 @start 会并行、or_ / and_ 的区别），没有写代码；这里补上演示。
The video explains these in its concept part (several @start run in parallel, or_ vs and_)
without code; this file demonstrates them.

做了什么 / What it does:
    check_stock 和 check_weather 都是 @start，Flow 启动时两个都会运行。
      - plan_promo  用 and_(check_stock, check_weather)：两个都完成后才运行一次
      - log_first   用 or_(check_stock, check_weather)：任意一个完成就运行（只运行一次）
      - choose_channel 是 @router(plan_promo)，按天气返回 "outdoor" 或 "online"
    每一步都打印出来，看清楚运行顺序。
    check_stock and check_weather are both @start, so both run when the flow starts.
      - plan_promo  uses and_(check_stock, check_weather): runs once, after both finish
      - log_first   uses or_(check_stock, check_weather): runs as soon as either finishes (once)
      - choose_channel is @router(plan_promo) and returns "outdoor" or "online" from the weather
    Every step prints, so you can see the order.

运行环境 / Environment: .venv-crewai  (crewai 1.15.23)
运行 / Run:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l58_join_demo.py
需要 / Needs: 不需要 key，不调用模型。/ No key, no model calls.
"""
import os
from typing import Literal

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))   # 必须在 import crewai 之前 / before importing crewai

from crewai.flow import Flow, and_, listen, or_, router, start  # noqa: E402
from pydantic import BaseModel  # noqa: E402


class PromoState(BaseModel):
    stock: int = 0
    weather: str = ""
    plan: str = ""


class PromoFlow(Flow[PromoState]):

    @start()
    def check_stock(self):
        self.state.stock = 120              # 假装查了库存 / pretend we checked the stock
        print("① 库存 / stock:", self.state.stock)
        return "stock ok"

    @start()
    def check_weather(self):
        self.state.weather = "晴"            # 假装查了天气 / pretend we checked the weather
        print("① 天气 / weather:", self.state.weather)
        return "weather ok"

    @listen(or_(check_stock, check_weather))
    def log_first(self, first_result):      # 能收到触发它的那一步的返回值 / receives the triggering step's return value
        print("② or_ 先到的结果 / first result in:", first_result)

    @listen(and_(check_stock, check_weather))
    def plan_promo(self):
        self.state.plan = f"库存 {self.state.stock} 杯，天气{self.state.weather}"
        print("③ and_ 两个都完成了 / both done:", self.state.plan)

    @router(plan_promo)
    def choose_channel(self) -> Literal["outdoor", "online"]:
        return "outdoor" if self.state.weather == "晴" else "online"

    @listen("outdoor")
    def street_event(self):
        return "④ 周末门口摆摊试饮 / tasting stand outside the shop this weekend"

    @listen("online")
    def online_coupon(self):
        return "④ 发线上优惠券 / send online coupons"


if __name__ == "__main__":
    flow = PromoFlow(suppress_flow_events=True)   # 关掉框框日志，只看 print / hide the boxed logs
    print("结果 / result:", flow.kickoff())
    print("流程图 / flow chart:", flow.plot("l58_promo_flow.html", show=False))
