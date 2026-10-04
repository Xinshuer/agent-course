"""第 35 节补充（视频里没有）：用 LangChain 1.x 的 HumanInTheLoopMiddleware 实现同样的审查（不用自己画图）
Lesson 35 extra (not in the video): the same review with LangChain 1.x HumanInTheLoopMiddleware (no hand-built graph)

视频里的 continue / update / feedback 在这里分别对应 approve / edit / reject。
The video's continue / update / feedback correspond to approve / edit / reject here.

create_agent 生成的也是一张 LangGraph 图，中间件在模型提出工具调用后用 interrupt() 暂停。
恢复时要传 {"decisions": [...]}，每个被审查的调用对应一个决定：
  {"type": "approve"}
  {"type": "edit", "edited_action": {"name": 工具名, "args": {...}}}
  {"type": "reject", "message": "理由"}
create_agent builds a LangGraph graph too; the middleware calls interrupt() after the model proposes tool calls.
Resume with {"decisions": [...]}, one decision per reviewed call (formats above).

运行环境 / Environment: .venv（需要 DEEPSEEK_API_KEY / needs DEEPSEEK_API_KEY）
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l35_hitl_middleware.py
不想手动输入时，把回答写进 SCRIPTED_ANSWERS，例如 ["a"] 或 ["r", "先别发"]。
To skip typing, fill SCRIPTED_ANSWERS, e.g. ["a"] or ["r", "Not yet"].
"""
from langchain.agents import create_agent
from langchain.agents.middleware import HumanInTheLoopMiddleware
from langchain_core.tools import tool
from langchain_deepseek import ChatDeepSeek
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import Command

from llm import API_KEY, MODEL

# 按顺序自动回答（空列表 = 用键盘输入）/ answers used in order (empty = type them)
SCRIPTED_ANSWERS = []


def ask_user(prompt):
    """优先使用 SCRIPTED_ANSWERS 里的回答，否则用 input()。 Use a scripted answer if there is one, else input()."""
    if SCRIPTED_ANSWERS:
        answer = SCRIPTED_ANSWERS.pop(0)
        print(prompt + answer)
        return answer
    return input(prompt)


@tool
def send_email(to: str, content: str) -> str:
    """给收件人 to 发送一封内容为 content 的邮件。 Send an email with `content` to `to`."""
    print(f"  [send_email] 邮件真的发出去了 / email sent -> to={to!r}, content={content!r}")
    return f"邮件已发送给 {to}"


@tool
def get_time() -> str:
    """返回现在的时间（只读工具，不需要审查）。 Return the current time (read-only, no review)."""
    return "2026-10-02 10:00"


agent = create_agent(
    model=ChatDeepSeek(model=MODEL, api_key=API_KEY),
    tools=[send_email, get_time],
    system_prompt="你是办公助手，回答简洁。",
    middleware=[
        # True = 这个工具每次调用都要审查；不在字典里的工具（get_time）直接执行
        # True = always review this tool; tools not listed (get_time) run without review
        HumanInTheLoopMiddleware(interrupt_on={"send_email": True}),
    ],
    checkpointer=InMemorySaver(),        # 和自己画图一样：中断需要 checkpointer / interrupts need a checkpointer
)


def decide(request):
    """对 action_requests 里的每个调用问一次人，返回 decisions 列表。 Ask once per requested action."""
    decisions = []
    for action in request["action_requests"]:
        print(f"\nAI 想调用 / AI wants to call: {action['name']}  参数 / args: {action['args']}")
        choice = ask_user("批准 a / 拒绝 r  (approve / reject): ").strip().lower()
        if choice == "r":
            decisions.append({"type": "reject", "message": ask_user("拒绝理由 / reason: ")})
        else:
            decisions.append({"type": "approve"})
    return decisions


def main():
    config = {"configurable": {"thread_id": "office-1"}}
    question = "给 tom@example.com 发邮件，告诉他明天上午 10 点开会。"
    result = agent.invoke({"messages": [{"role": "user", "content": question}]}, config)

    while "__interrupt__" in result:
        request = result["__interrupt__"][0].value          # {"action_requests": [...], "review_configs": [...]}
        result = agent.invoke(Command(resume={"decisions": decide(request)}), config)

    print("\nAI:", result["messages"][-1].content)


if __name__ == "__main__":
    main()
