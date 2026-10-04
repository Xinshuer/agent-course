"""第 42 节练习：小浪助手（多智能体版）——TODO 版
Lesson 42 exercise: Xiaolang assistant, multi-agent edition (TODO version)

补全 5 个 TODO：检索工具、程序员员工、两个「员工工具」、带记忆的主管、运行时的 thread_id。
Complete the 5 TODOs: the search tool, the programmer worker, the two "worker tools",
the supervisor with memory, and the thread_id used at run time.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l42_xiaolang_todo.py
需要的 key / Key needed: DEEPSEEK_API_KEY
参考答案 / Solution: l42_xiaolang_solution.py
注意 / Warning: run_python 会在你的电脑上运行模型写的代码，只用来练习。 It runs model-written code - practice only.
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

model = ChatDeepSeek(model=MODEL, api_key=API_KEY, extra_body={"thinking": {"type": "disabled"}})

FAQ_FILE = Path(__file__).parent / "data" / "l42_faq.md"
PARAGRAPHS = [p.strip() for p in FAQ_FILE.read_text(encoding="utf-8").split("\n\n")
              if p.strip() and not p.startswith("#")]


def score(question, paragraph):
    count = 0
    for i in range(len(question) - 1):
        if question[i:i + 2].lower() in paragraph.lower():
            count += 1
    return count


# TODO 1: 用 sorted(PARAGRAPHS, key=lambda p: score(question, p), reverse=True) 排序，
#         返回最相关的 2 段，用 "\n\n" 连接
#         Sort PARAGRAPHS by score (highest first) and return the top 2 joined by "\n\n"
@tool
def search_docs(question: str) -> str:
    """在《小浪学习手册》里查找和问题最相关的两段内容。"""
    return ""


@tool
def run_python(code: str) -> str:
    """运行一段 Python 代码（只能用标准库），返回 print 的输出或报错信息。"""
    with tempfile.TemporaryDirectory() as workdir:
        try:
            result = subprocess.run(
                [sys.executable, "-X", "utf8", "-c", code],
                capture_output=True, text=True, encoding="utf-8", errors="replace",
                timeout=10, cwd=workdir,
            )
        except subprocess.TimeoutExpired:
            return "运行超过 10 秒，已经停止。"
    if result.returncode != 0:
        return "运行出错：\n" + "\n".join(result.stderr.strip().splitlines()[-4:])
    return result.stdout.strip() or "（运行成功，没有输出）"


research_agent = create_agent(
    model,
    tools=[search_docs],
    system_prompt="你是小浪团队的信息搜索专家。先用 search_docs 查学习手册，只根据查到的内容回答；手册里没有就直说不知道。",
    name="research_agent",
)

# TODO 2: 仿照 research_agent，用 create_agent 创建 dev_agent：
#         工具 [run_python]，提示词「你是小浪团队的 AI 应用程序员……用 run_python 运行代码……」，name="dev_agent"
#         Create dev_agent like research_agent: tools [run_python], a programmer prompt, name="dev_agent"
dev_agent = None


# TODO 3: 写两个「员工工具」。函数体：worker.invoke({"messages": [("user", 问题)]})，
#         返回 result["messages"][-1].content。文档字符串写清楚什么问题交给谁（主管靠它来选）。
#         Write the two "worker tools": invoke the worker and return the last message's content.
#         The docstring says which questions go to whom - the supervisor chooses by it.
@tool
def ask_researcher(question: str) -> str:
    """把关于本课程、LangChain/LangGraph 概念、环境和练习文件的问题交给信息搜索专家，返回他的回答。"""
    return ""


@tool
def ask_programmer(question: str) -> str:
    """把写代码、计算、查 bug 的任务交给 AI 应用程序员，返回他的回答。任务要写完整。"""
    return ""


XIAOLANG_PROMPT = (
    "你是「小浪」，一个 AI 学习客服，管理着一个小团队：信息搜索专家（ask_researcher）和 AI 应用程序员（ask_programmer）。\n"
    "- 课程、概念、环境、练习文件的问题交给信息搜索专家\n"
    "- 写代码、计算、查 bug 的任务交给 AI 应用程序员\n"
    "- 一个问题涉及两方面时，分别询问，再把结果整理成一个简洁的回答\n"
    "- 打招呼、闲聊直接回答\n"
    "交给员工的问题要写完整，因为他们看不到之前的对话。不要向用户提起分配任务的过程。"
)

# TODO 4: 创建主管 xiaolang：create_agent(model, tools=[两个员工工具], system_prompt=XIAOLANG_PROMPT,
#         checkpointer=InMemorySaver(), name="xiaolang")
#         Create the supervisor with both worker tools, the prompt and an InMemorySaver checkpointer
xiaolang = None


if __name__ == "__main__":
    # TODO 5: 准备 config：{"configurable": {"thread_id": 一个字符串}}，可以用 str(uuid.uuid4())
    #         Build config = {"configurable": {"thread_id": some string}}, e.g. str(uuid.uuid4())
    config = None
    print("我是小浪。输入 /exit 退出。 I'm Xiaolang. Type /exit to quit.")
    while True:
        user_input = input("\n你 / You: ").strip()
        if not user_input:
            continue
        if user_input == "/exit":
            break
        result = xiaolang.invoke({"messages": [("user", user_input)]}, config)
        print("小浪 / Xiaolang:", result["messages"][-1].content)
