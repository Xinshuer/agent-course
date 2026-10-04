"""第 26 节练习：用纯 Python 模拟 LangGraph 的运行规则（参考答案）
Lesson 26 exercise: simulate LangGraph's run rules in plain Python (solution)

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
    ..\\.venv\\Scripts\\python.exe l26_toy_graph_solution.py
"""


# ---------- 第 1 部分：只有普通边 / Part 1: normal edges only ----------
def clean(state):
    return {"text": state["text"].strip()}


def shout(state):
    return {"text": state["text"].upper()}


def count(state):
    return {"length": len(state["text"])}


nodes = {"clean": clean, "shout": shout, "count": count}  # 节点名 → 函数 / node name -> function
edges = {"START": "clean", "clean": "shout", "shout": "count", "count": "END"}  # 这一步 → 下一步 / this -> next


def run_graph(nodes, edges, state):
    """执行节点 → 合并更新 → 沿边前进，直到 END。 Run node -> merge update -> follow edge, until END."""
    current = edges["START"]
    while current != "END":
        update = nodes[current](dict(state))  # 节点拿到的是副本 / the node gets a copy
        state.update(update)
        print(f"  {current} -> {update}")
        current = edges[current]
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
    """条件边：通过了或达到轮数上限就结束，否则回去重写。 Conditional edge."""
    if state["approved"] or state["rounds"] >= MAX_ROUNDS:
        return "END"
    return "write"


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
    print("最终状态 / final state:", final)  # {'text': 'HELLO GRAPH', 'length': 11}

    print("\n第 2 部分 / Part 2")
    final = run_review_loop({"draft": "初稿 draft", "rounds": 0, "approved": False})
    print(f"一共写了 {final['rounds']} 轮 / {final['rounds']} rounds, approved = {final['approved']}")
    # 试试把 review 里的 3 改成 10：会在第 MAX_ROUNDS 轮被上限截停。
    # Try changing 3 to 10 in review(): the loop is stopped by the MAX_ROUNDS cap.
