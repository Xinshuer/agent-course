"""第 40 节：用 LangGraph 构建代码助手（参考答案，结构和视频一致）
Lesson 40: a coding assistant built with LangGraph (solution, same structure as the video)

流程 / Flow:
    START → generate（参考 LCEL 文档，生成 prefix / imports / code）
          → check_code（检查 1：只运行 imports；检查 2：运行 imports + code）
          → decide_to_finish：
               error == "no" 或已经生成了 max_iterations 次 → END
               否则 flag == "reflect" → reflect → generate；否则直接 → generate
    START → generate (reads the LCEL docs, returns prefix / imports / code)
          → check_code (check 1: run the imports alone; check 2: run imports + code)
          → decide_to_finish: passed or out of attempts → END,
            otherwise reflect (if flag == "reflect") or straight back to generate

和视频的区别 / Differences from the video:
    - 视频用网页加载器抓 LCEL 文档；那个网址现在会跳到新文档首页，这里改读本地笔记 data/l40_lcel_docs.md
      The video scrapes the LCEL docs page, which now redirects; we read the local data/l40_lcel_docs.md
    - 视频在本进程里 exec() 代码；这里放进子进程运行，并加 10 秒超时（更安全）
      The video exec()s the code in-process; here it runs in a subprocess with a 10 s timeout (safer)

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l40_code_assistant_solution.py
需要的 key / Key needed: DEEPSEEK_API_KEY（见环境准备页 / see the Setup page）

注意 / Warning:
    这个程序会在你的电脑上运行「模型写的代码」。子进程 + 超时只能防止死循环和崩溃，防不了恶意代码。
    This program runs model-written code on your machine. A subprocess with a timeout stops endless
    loops and crashes, not malicious code. Use it for practice only.
"""
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import TypedDict

from langchain_core.prompts import ChatPromptTemplate
from langchain_deepseek import ChatDeepSeek
from langgraph.graph import END, START, StateGraph
from pydantic import BaseModel, Field

from llm import API_KEY, MODEL

# ---------------------------------------------------------------- 1. 参考文档 / reference docs
DOCS_FILE = Path(__file__).parent / "data" / "l40_lcel_docs.md"
concatenated_content = DOCS_FILE.read_text(encoding="utf-8")

# ---------------------------------------------------------------- 2. 提示词 + 结构化输出 / prompt + structured output
code_gen_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        "你是精通 LCEL（LangChain 表达式语言）的编程助手。下面是 LCEL 的文档：\n"
        "-------\n{context}\n-------\n"
        "请根据上面的文档回答用户的问题。确保你给出的代码可以直接运行，包含所有需要的 import 和变量定义。"
        "回答分三部分：先描述解决方案，再列出 import 语句，最后给出完整、可运行的代码。"
        "代码里不要调用真实的大模型（没有 key），需要模型的地方用 RunnableLambda 写一个假模型代替；"
        "代码最后用 print 打印结果。以下是用户的问题：",
    ),
    ("placeholder", "{messages}"),       # 这里插入整段对话 / the whole conversation goes here
])


class CodeSolution(BaseModel):
    """回答 LCEL 编程问题的代码方案。A code answer to an LCEL question."""

    prefix: str = Field(description="问题和解决思路的说明 / the problem and the approach")
    imports: str = Field(description="代码需要的 import 语句 / the import statements")
    code: str = Field(description="不含 import 语句的代码 / the code without the imports")


# DeepSeek 的思考模式不支持 with_structured_output 用到的「强制 tool_choice」，会报 400，所以关掉思考模式
# DeepSeek's thinking mode rejects the forced tool_choice that with_structured_output uses, so switch it off
llm = ChatDeepSeek(model=MODEL, api_key=API_KEY, extra_body={"thinking": {"type": "disabled"}})
code_gen_chain = code_gen_prompt | llm.with_structured_output(CodeSolution)   # 先填模板，再调用模型


# ---------------------------------------------------------------- 3. 状态 / state
class GraphState(TypedDict):
    error: str                  # "yes" = 上一次检查没通过 / last check failed; "no" = passed
    messages: list              # 问题、答案、错误提示都在这里 / question, answers and error notes
    generation: CodeSolution    # 最近一次生成的方案 / the latest solution
    iterations: int             # 已经生成了几次 / attempts so far


max_iterations = 3              # 最多生成 3 次 / at most 3 attempts
flag = "do not reflect"         # 改成 "reflect" 就会先反思再重新生成 / set to "reflect" to turn reflection on


def run_program(program):
    """在子进程里运行一段代码（10 秒超时）。出错返回错误说明，没出错返回空字符串。
    Run code in a subprocess (10 s timeout); return the error text, or "" if it ran fine."""
    with tempfile.TemporaryDirectory() as workdir:        # 临时文件夹，用完自动删除 / deleted afterwards
        try:
            result = subprocess.run(
                [sys.executable, "-X", "utf8", "-c", program],
                capture_output=True, text=True, encoding="utf-8", errors="replace",
                timeout=10, cwd=workdir,
            )
        except subprocess.TimeoutExpired:
            return "运行超过 10 秒还没结束，可能写成了死循环。 / Still running after 10 s - an endless loop?"
    if result.returncode != 0:
        return "\n".join(result.stderr.strip().splitlines()[-4:])   # 报错的最后几行 / last lines of the traceback
    return ""


# ---------------------------------------------------------------- 4. 节点 / nodes
def generate(state: GraphState):
    """节点 1：生成代码方案。上一次没通过时，先提醒模型再试一次。"""
    print("---生成代码方案 / GENERATING CODE SOLUTION---")
    messages = state["messages"]
    iterations = state["iterations"]
    error = state["error"]

    if error == "yes":
        messages = messages + [("user", "请再试一次。按 prefix、imports、code 三部分给出完整的答案。")]

    code_solution = code_gen_chain.invoke({"context": concatenated_content, "messages": messages})
    print("  prefix:", code_solution.prefix[:120])
    messages = messages + [
        ("assistant", f"{code_solution.prefix}\n导入 / imports:\n{code_solution.imports}\n代码 / code:\n{code_solution.code}")
    ]
    return {"generation": code_solution, "messages": messages, "iterations": iterations + 1}


def code_check(state: GraphState):
    """节点 2：两项检查——导入检查、执行检查。没通过就把错误写进 messages，error 设为 "yes"。"""
    print("---检查代码 / CHECKING CODE---")
    messages = state["messages"]
    code_solution = state["generation"]

    error = run_program(code_solution.imports)                              # 检查 1 / check 1
    if error:
        print("---导入检查没通过 / IMPORT CHECK FAILED---\n ", error.splitlines()[-1])
        messages = messages + [("user", f"你的方案没有通过导入检查：{error}")]
        return {"messages": messages, "error": "yes"}

    error = run_program(code_solution.imports + "\n" + code_solution.code)  # 检查 2 / check 2
    if error:
        print("---执行检查没通过 / CODE EXECUTION FAILED---\n ", error.splitlines()[-1])
        messages = messages + [("user", f"你的方案没有通过执行检查：{error}")]
        return {"messages": messages, "error": "yes"}

    print("---没有发现错误 / NO CODE TEST FAILURES---")
    return {"error": "no"}


def reflect(state: GraphState):
    """节点 3（默认不用）：让模型先分析一下为什么错了。"""
    print("---反思错误原因 / REFLECTING---")
    messages = state["messages"]
    reflections = code_gen_chain.invoke({"context": concatenated_content, "messages": messages})
    messages = messages + [("assistant", f"对错误的反思 / reflections on the error: {reflections.prefix}")]
    return {"messages": messages}


# ---------------------------------------------------------------- 5. 条件边 / conditional edge
def decide_to_finish(state: GraphState):
    """通过了，或者次数用完 → "end"；否则看开关：反思，或者直接重新生成。"""
    error = state["error"]
    iterations = state["iterations"]
    if error == "no" or iterations >= max_iterations:
        print("---决定：结束 / DECISION: FINISH---")
        return "end"
    print("---决定：重试 / DECISION: RE-TRY SOLUTION---")
    if flag == "reflect":
        return "reflect"
    return "generate"


# ---------------------------------------------------------------- 6. 组装 / build the graph
workflow = StateGraph(GraphState)
workflow.add_node("generate", generate)
workflow.add_node("check_code", code_check)
workflow.add_node("reflect", reflect)
workflow.add_edge(START, "generate")
workflow.add_edge("generate", "check_code")
workflow.add_conditional_edges(
    "check_code",
    decide_to_finish,
    {"end": END, "reflect": "reflect", "generate": "generate"},   # 返回值 → 节点 / return value → node
)
workflow.add_edge("reflect", "generate")
app = workflow.compile()


if __name__ == "__main__":
    question = "如何用 LCEL 并行执行两条链？"
    # 视频里的第一个测试问题 / the video's first test question:
    # question = "怎样把原始输入直接传给 Runnable，再用它构造提示词需要的输入？"

    solution = app.invoke({"messages": [("user", question)], "iterations": 0, "error": ""})

    final = solution["generation"]
    status = "通过 / passed" if solution["error"] == "no" else "没通过 / failed"
    print("\n========== 结果 / result ==========")
    print("生成次数 / attempts:", solution["iterations"], "|", status)
    print("----- prefix -----")
    print(final.prefix)
    print("----- imports -----")
    print(final.imports)
    print("----- code -----")
    print(final.code)
