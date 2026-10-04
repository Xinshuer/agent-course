"""第 56 节补充演示：CrewAI Flow 里的 @human_feedback（不调用模型，不需要 key）
Lesson 56 extra demo: @human_feedback in a CrewAI Flow (no model call, no key needed)

运行环境 / Environment: .venv-crewai
运行 / Run（在终端里运行 / run it in a terminal）:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l56_flow_feedback.py

Task(human_input=True) 是「Agent 自己按意见重写」；
Flow 的 @human_feedback 是「把人的意见交给你的代码」，由你决定下一步做什么。
它还有 provider= 参数，可以把「找人要意见」换成网页、聊天工具等方式——
视频结尾提到的「把反馈交给前端」，在 1.15.23 的 Flow 里可以走这条路（Flow 见第 57、58 节）。
Task(human_input=True) lets the agent rewrite from your feedback;
a Flow's @human_feedback hands your feedback to your own code, which decides what happens next.
It also takes provider=, which swaps the terminal prompt for a web page, a chat tool and so on -
the "send the feedback to a front end" idea from the end of the video (Flows: lessons 57-58).
"""
import os

os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")                      # 不弹出 trace 提示 / no tracing prompt
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))  # CrewAI 的小数据库放进项目的 .cache / keep its db in the project's .cache

from crewai.flow import Flow, human_feedback, listen, start


class PlanFlow(Flow):
    @start()
    @human_feedback(message="请审核这份团建方案（直接回车 = 通过）/ Review this plan (Enter = approve):")
    def draft_plan(self):
        # 真实项目里这里通常是一个 Crew 或一次模型调用；这里用固定文字代替
        # In a real project this would run a crew or call a model; fixed text here
        return "周六 10:00 西湖骑行，下午茶馆桌游，人均 140 元"

    @listen(draft_plan)
    def after_review(self, result):
        # result 是 HumanFeedbackResult：output 是原来的输出，feedback 是你输入的文字
        # result is a HumanFeedbackResult: output = the original output, feedback = what you typed
        if result.feedback.strip():
            print("收到修改意见 / feedback:", result.feedback)
            print("（这里可以把意见交给 Agent 重写 / hand it to an agent to rewrite here）")
        else:
            print("方案通过 / approved:", result.output)
        return result.output


if __name__ == "__main__":
    flow = PlanFlow()
    flow.kickoff()
    # 所有反馈都记录在 flow 上 / every piece of feedback is recorded on the flow
    print("最近一次反馈 / last feedback:", repr(flow.last_human_feedback.feedback))
