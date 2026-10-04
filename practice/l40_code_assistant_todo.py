"""第 40 节练习：用 LangGraph 构建代码助手（TODO 版）
Lesson 40 exercise: a coding assistant built with LangGraph (TODO version)

补全 5 个 TODO，让图跑起来：generate → check_code → decide_to_finish →（结束 / 重新生成 / 反思）。
Complete the 5 TODOs so the graph runs: generate → check_code → decide_to_finish → (end / regenerate / reflect).

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l40_code_assistant_todo.py
需要的 key / Key needed: DEEPSEEK_API_KEY
参考答案 / Solution: l40_code_assistant_solution.py
注意 / Warning: 会在你的电脑上运行模型写的代码，只用来练习。 It runs model-written code - practice only.
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

DOCS_FILE = Path(__file__).parent / "data" / "l40_lcel_docs.md"
concatenated_content = DOCS_FILE.read_text(encoding="utf-8")

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
    ("placeholder", "{messages}"),
])


# TODO 1: 补全另外两个字段 imports 和 code（都是 str，用 Field(description=...) 写清楚是什么）
#         Add the other two str fields, imports and code, each with Field(description=...)
class CodeSolution(BaseModel):
    """回答 LCEL 编程问题的代码方案。A code answer to an LCEL question."""

    prefix: str = Field(description="问题和解决思路的说明 / the problem and the approach")
    # imports: ...
    # code: ...


# 提示：DeepSeek 的思考模式不支持 with_structured_output 用到的强制 tool_choice，所以要关掉思考模式
# Hint: DeepSeek's thinking mode rejects the forced tool_choice, so switch thinking off
llm = ChatDeepSeek(model=MODEL, api_key=API_KEY, extra_body={"thinking": {"type": "disabled"}})

# TODO 2: 用 | 把 code_gen_prompt 和「返回 CodeSolution 的模型」连成一条链
#         Chain code_gen_prompt with llm.with_structured_output(CodeSolution) using |
code_gen_chain = None


class GraphState(TypedDict):
    error: str
    messages: list
    generation: CodeSolution
    iterations: int


max_iterations = 3
flag = "do not reflect"


def run_program(program):
    """在子进程里运行一段代码（10 秒超时）。出错返回错误说明，没出错返回空字符串。"""
    with tempfile.TemporaryDirectory() as workdir:
        try:
            result = subprocess.run(
                [sys.executable, "-X", "utf8", "-c", program],
                capture_output=True, text=True, encoding="utf-8", errors="replace",
                timeout=10, cwd=workdir,
            )
        except subprocess.TimeoutExpired:
            return "运行超过 10 秒还没结束，可能写成了死循环。"
    if result.returncode != 0:
        return "\n".join(result.stderr.strip().splitlines()[-4:])
    return ""


def generate(state: GraphState):
    print("---生成代码方案 / GENERATING CODE SOLUTION---")
    messages = state["messages"]
    if state["error"] == "yes":
        messages = messages + [("user", "请再试一次。按 prefix、imports、code 三部分给出完整的答案。")]
    code_solution = code_gen_chain.invoke({"context": concatenated_content, "messages": messages})
    messages = messages + [
        ("assistant", f"{code_solution.prefix}\n导入：\n{code_solution.imports}\n代码：\n{code_solution.code}")
    ]
    return {"generation": code_solution, "messages": messages, "iterations": state["iterations"] + 1}


def code_check(state: GraphState):
    print("---检查代码 / CHECKING CODE---")
    messages = state["messages"]
    code_solution = state["generation"]

    # TODO 3: 两项检查 / two checks
    #   检查 1：error = run_program(只有 imports)；有错误就在 messages 后面加一条
    #           ("user", "你的方案没有通过导入检查：" + 错误)，返回 messages 和 error 为 "yes"
    #   检查 2：error = run_program(imports + 换行 + code)；有错误同样处理（执行检查）
    #   都通过：返回 error 为 "no"
    #   Check 1: run the imports alone; check 2: run imports + "\n" + code.
    #   On failure append a ("user", ...) message and set error to "yes"; otherwise error is "no".
    return {"error": "no"}


def reflect(state: GraphState):
    print("---反思错误原因 / REFLECTING---")
    messages = state["messages"]
    reflections = code_gen_chain.invoke({"context": concatenated_content, "messages": messages})
    messages = messages + [("assistant", f"对错误的反思：{reflections.prefix}")]
    return {"messages": messages}


# TODO 4: decide_to_finish(state)：error 是 "no"，或者 iterations >= max_iterations → 返回 "end"；
#         否则 flag == "reflect" 时返回 "reflect"，不然返回 "generate"
#         Return "end" when passed or out of attempts; otherwise "reflect" or "generate" depending on flag
def decide_to_finish(state: GraphState):
    return "end"


# TODO 5: 组装图 / build the graph
#   三个节点：generate、check_code（函数是 code_check）、reflect
#   连线：START → generate → check_code；reflect → generate
#   条件边：从 check_code 出发，用 decide_to_finish，路径映射 {"end": END, "reflect": "reflect", "generate": "generate"}
workflow = StateGraph(GraphState)

app = None


if __name__ == "__main__":
    question = "如何用 LCEL 并行执行两条链？"
    solution = app.invoke({"messages": [("user", question)], "iterations": 0, "error": ""})
    final = solution["generation"]
    print("\n生成次数 / attempts:", solution["iterations"], "| error:", solution["error"])
    print(final.prefix)
    print(final.imports)
    print(final.code)
