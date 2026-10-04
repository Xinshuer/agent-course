"""第 42 节：小浪助手（多智能体版）——参考答案：主管 + 两位员工
Lesson 42: Xiaolang assistant, multi-agent edition (solution): a supervisor + two workers

结构 / Structure（和视频一样是「监管者模式」/ the supervisor pattern, as in the video）:
    小浪（主管 supervisor：create_agent + checkpointer）
      ├─ 工具 ask_researcher → research_agent（信息搜索专家 / research expert，工具 search_docs）
      └─ 工具 ask_programmer → dev_agent     （AI 应用程序员 / AI programmer，工具 run_python）
    视频用 langgraph-supervisor 库的 create_supervisor、联网搜索 API 和 Riza 云端代码沙盒；
    这里换成本机就能跑的版本：员工包装成工具、本地手册检索、在子进程里运行代码。
    The video uses create_supervisor (langgraph-supervisor), a web-search API and the Riza cloud
    sandbox; this version runs locally: workers wrapped as tools, a local handbook, a subprocess.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l42_xiaolang_solution.py
需要的 key / Key needed: DEEPSEEK_API_KEY（不需要其他 key / no other key）
注意 / Warning: run_python 会在你的电脑上运行模型写的代码（子进程 + 10 秒超时），只用来练习。
    run_python runs model-written code on your machine (subprocess + 10 s timeout) - practice only.
输入 /exit 退出。 Type /exit to quit.
"""
import subprocess
import sys
import tempfile
import uuid
from pathlib import Path

from langchain.agents import create_agent
from langchain_core.tools import tool
from langchain_deepseek import ChatDeepSeek
from langgraph.checkpoint.memory import InMemorySaver

from llm import API_KEY, MODEL

# 主管和员工都只是「选工具、写回答」，不需要长时间思考：关掉思考模式更快
# Neither the supervisor nor the workers need long deliberation: thinking off is faster
model = ChatDeepSeek(model=MODEL, api_key=API_KEY, extra_body={"thinking": {"type": "disabled"}})


# ---------------------------------------------------------------- 1. 员工的工具 / the workers' tools
FAQ_FILE = Path(__file__).parent / "data" / "l42_faq.md"
PARAGRAPHS = [p.strip() for p in FAQ_FILE.read_text(encoding="utf-8").split("\n\n")
              if p.strip() and not p.startswith("#")]          # 按空行切段，跳过标题 / split on blank lines


def score(question, paragraph):
    """数一数：问题里相邻的两个字，有几组出现在这段文字里。 Count shared 2-character pieces."""
    count = 0
    for i in range(len(question) - 1):
        if question[i:i + 2].lower() in paragraph.lower():
            count += 1
    return count


@tool
def search_docs(question: str) -> str:
    """在《小浪学习手册》里查找和问题最相关的两段内容。Search the handbook for the two most relevant paragraphs."""
    ranked = sorted(PARAGRAPHS, key=lambda p: score(question, p), reverse=True)
    return "\n\n".join(ranked[:2])


@tool
def run_python(code: str) -> str:
    """运行一段 Python 代码（只能用标准库），返回 print 的输出或报错信息。Run Python code and return its output or error."""
    with tempfile.TemporaryDirectory() as workdir:              # 在临时文件夹里运行 / run in a temp folder
        try:
            result = subprocess.run(
                [sys.executable, "-X", "utf8", "-c", code],
                capture_output=True, text=True, encoding="utf-8", errors="replace",
                timeout=10, cwd=workdir,
            )
        except subprocess.TimeoutExpired:
            return "运行超过 10 秒，已经停止。 Stopped after 10 seconds."
    if result.returncode != 0:
        return "运行出错 / error:\n" + "\n".join(result.stderr.strip().splitlines()[-4:])
    return result.stdout.strip() or "（运行成功，没有输出 / ran fine, no output）"


# ---------------------------------------------------------------- 2. 两位员工 / two workers
research_agent = create_agent(
    model,
    tools=[search_docs],
    system_prompt="你是小浪团队的信息搜索专家。先用 search_docs 查学习手册，只根据查到的内容回答；"
                  "手册里没有就直说不知道。回答简洁。",
    name="research_agent",
)
dev_agent = create_agent(
    model,
    tools=[run_python],
    system_prompt="你是小浪团队的 AI 应用程序员。需要计算或验证时，写 Python 代码并用 run_python 运行，"
                  "根据运行结果回答，并附上你运行的代码。",
    name="dev_agent",
)


# ---------------------------------------------------------------- 3. 主管：把员工包装成工具 / the supervisor
@tool
def ask_researcher(question: str) -> str:
    """把关于本课程、LangChain/LangGraph 概念、环境和练习文件的问题交给信息搜索专家，返回他的回答。
    Ask the research expert about the course, LangChain/LangGraph ideas, setup or practice files."""
    result = research_agent.invoke({"messages": [("user", question)]})
    return result["messages"][-1].content


@tool
def ask_programmer(question: str) -> str:
    """把写代码、计算、查 bug 的任务交给 AI 应用程序员，返回他的回答。任务要写完整。
    Give a coding, calculation or debugging task to the AI programmer. Describe the task fully."""
    result = dev_agent.invoke({"messages": [("user", question)]})
    return result["messages"][-1].content


XIAOLANG_PROMPT = (
    "你是「小浪」，一个 AI 学习客服，管理着一个小团队：信息搜索专家（ask_researcher）和 AI 应用程序员（ask_programmer）。\n"
    "- 课程、概念、环境、练习文件的问题交给信息搜索专家\n"
    "- 写代码、计算、查 bug 的任务交给 AI 应用程序员\n"
    "- 一个问题涉及两方面时，分别询问，再把结果整理成一个简洁的回答\n"
    "- 打招呼、闲聊直接回答\n"
    "交给员工的问题要写完整，因为他们看不到之前的对话。不要向用户提起分配任务的过程。"
)

xiaolang = create_agent(
    model,
    tools=[ask_researcher, ask_programmer],
    system_prompt=XIAOLANG_PROMPT,
    checkpointer=InMemorySaver(),          # 短期记忆：按 thread_id 保存对话 / short-term memory per thread_id
    name="xiaolang",
)


if __name__ == "__main__":
    # 视频里用每个用户自己的 id 当 thread_id；这里每次运行生成一个新的
    # The video uses each user's id as the thread_id; here every run gets a new one
    config = {"configurable": {"thread_id": str(uuid.uuid4())}}
    print("我是小浪：课程问题、写代码算数，或者随便聊聊都可以。输入 /exit 退出。")
    print("I'm Xiaolang: course questions, code and calculations, or a chat. Type /exit to quit.")
    while True:
        user_input = input("\n你 / You: ").strip()
        if not user_input:
            continue
        if user_input == "/exit":
            break
        before = len(xiaolang.get_state(config).values.get("messages", []))
        result = xiaolang.invoke({"messages": [("user", user_input)]}, config)
        for msg in result["messages"][before:]:            # 只看这一轮新增的消息 / this turn's new messages
            # 只有 AI 消息有 tool_calls；getattr(对象, 名字, None) 在没有这个属性时返回 None
            # only AI messages have tool_calls; getattr(obj, name, None) gives None when it's missing
            for call in getattr(msg, "tool_calls", None) or []:
                print(f"  [小浪交给 / delegates] {call['name']}({call['args']})")
        print("小浪 / Xiaolang:", result["messages"][-1].content)
