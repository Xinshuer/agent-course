"""第 26 节练习：用纯 Python 模拟 LangGraph 的运行规则（TODO 版）
Lesson 26 exercise: simulate LangGraph's run rules in plain Python (TODO version)

视频里说图本身是一种计算范式、跟 AI 无关：节点做事，边决定下一步。这里不用 LangGraph 也不用模型，
自己写一个迷你运行器来验证这一点。
The video says a graph is a computing paradigm with no AI required: nodes do the work, edges decide
what comes next. Here you prove it with a mini runner - no LangGraph, no model.

第 1 部分：普通边 —— START → clean → shout → count → END
第 2 部分：条件边 + 循环 —— write → review →（通过就 END，不通过回到 write，最多 MAX_ROUNDS 轮）
Part 1: normal edges - START -> clean -> shout -> count -> END
Part 2: a conditional edge + loop - write -> review -> (END if approved, else back to write, at most MAX_ROUNDS)

不使用 LangGraph，也不调用模型，不需要 API key。
No LangGraph, no model calls, no API key needed.

运行环境 / Environment: .venv（其实任何 Python 3 都可以 / any Python 3 works）
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l26_toy_graph_todo.py
参考答案 / Solution: l26_toy_graph_solution.py
"""


# ---------- 第 1 部分：只有普通边 / Part 1: normal edges only ----------
def clean(state):
    return {"text": state["text"].strip()}


def shout(state):
    # TODO 1: 返回一个字典：键 "text"，值是全部大写的 text（字符串的 .upper() 方法）
    #         Return a dict: key "text", value = the text in capitals (string method .upper())
    pass


def count(state):
    return {"length": len(state["text"])}


# TODO 2: 把 shout 注册进 nodes，并在 edges 里把它插到 clean 和 count 之间
#         （先完成 TODO 1：没写完的 shout 返回 None，state.update(None) 会报 TypeError）
#         Register shout in nodes, and put it between clean and count in edges
#         (finish TODO 1 first: an unfinished shout returns None, and state.update(None) raises TypeError)
nodes = {"clean": clean, "count": count}
edges = {"START": "clean", "clean": "count", "count": "END"}


def run_graph(nodes, edges, state):
    """执行节点 → 合并更新 → 沿边前进，直到 END。 Run node -> merge update -> follow edge, until END."""
    current = edges["START"]
    # TODO 3: 写一个 while 循环，只要 current 不是 "END" 就：
    #         Write a while loop that, as long as current is not "END":
    #   1) update = nodes[current](dict(state))   执行节点（给它一份副本）/ run the node on a copy
    #   2) state.update(update)                   合并更新 / merge the update
    #   3) current = edges[current]               沿边前进 / follow the edge
    return state


# ---------- 第 2 部分：条件边 + 循环 / Part 2: conditional edge + loop ----------
MAX_ROUNDS = 5


def write(state):
    """模拟改稿：每轮在草稿后面加一个感叹号。 Pretend to revise: add one '!' per round."""
    return {"draft": state["draft"] + "!", "rounds": state["rounds"] + 1}


def review(state):
    """模拟审核：至少 3 个感叹号才通过。 Pretend to review: approve at 3 or more '!'."""
    return {"approved": state["draft"].count("!") >= 3}


def after_review(state):
    """条件边：决定审核之后去哪。 Conditional edge: where to go after the review."""
    # TODO 4: 如果 state["approved"] 为 True，或者 state["rounds"] 已经 >= MAX_ROUNDS，返回 "END"；
    #         否则返回 "write"（回去重写）。现在它总是返回 "END"，所以只会写 1 轮。
    #         Return "END" if state["approved"] is True or state["rounds"] >= MAX_ROUNDS;
    #         otherwise return "write". Right now it always returns "END", so only 1 round runs.
    return "END"


def run_review_loop(state):
    review_nodes = {"write": write, "review": review}
    current = "write"
    while current != "END":
        state.update(review_nodes[current](dict(state)))
        print(f"  {current} -> {state}")
        if current == "write":
            current = "review"               # 普通边 / normal edge
        else:
            current = after_review(state)    # 条件边 / conditional edge
    return state


if __name__ == "__main__":
    print("第 1 部分 / Part 1")
    final = run_graph(nodes, edges, {"text": "  hello graph  ", "length": 0})
    print("最终状态 / final state:", final)  # 应该是 / should be {'text': 'HELLO GRAPH', 'length': 11}

    print("\n第 2 部分 / Part 2")
    final = run_review_loop({"draft": "初稿 draft", "rounds": 0, "approved": False})
    print(f"一共写了 {final['rounds']} 轮 / {final['rounds']} rounds, approved = {final['approved']}")
    # 完成 TODO 4 后应该是 3 轮、approved = True / after TODO 4: 3 rounds, approved = True
