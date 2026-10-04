"""第 30 节演示：有 checkpointer 和没有 checkpointer 的区别（不调用模型，不需要 key）
Lesson 30 demo: a graph with vs without a checkpointer (no model call, no key needed)

图里只有一个节点：数一数「这个线程里用户一共说了几句话」。
- 没有 checkpointer：每次 invoke 都从空状态开始，永远是 1 句。
- 有 checkpointer：同一个 thread_id 会接着上次的状态，数字一直往上加；换一个 thread_id 又从 1 开始。

The graph has one node that counts how many lines the user has said in this thread.
- Without a checkpointer every invoke starts empty, so the count is always 1.
- With a checkpointer the same thread_id continues from last time; a new thread_id starts at 1 again.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l30_persistence_demo.py
"""
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, MessagesState, StateGraph


def counter(state: MessagesState):
    """数一数这个线程里用户说了几句话 / count the user's lines in this thread"""
    n = len([m for m in state["messages"] if m.type == "human"])
    return {"messages": [{"role": "assistant", "content": f"这个线程里你一共说了 {n} 句话"}]}


builder = StateGraph(MessagesState)
builder.add_node("counter", counter)
builder.add_edge(START, "counter")
builder.add_edge("counter", END)


def ask(graph, text, config=None):
    out = graph.invoke({"messages": [{"role": "user", "content": text}]}, config)
    return out["messages"][-1].content


if __name__ == "__main__":
    print("== 1. 没有 checkpointer / without a checkpointer ==")
    no_memory = builder.compile()
    for text in ["你好", "还记得我吗", "第三句"]:
        print(f"  {text} -> {ask(no_memory, text)}")

    print("== 2. 有 checkpointer / with a checkpointer ==")
    graph = builder.compile(checkpointer=InMemorySaver())
    alice = {"configurable": {"thread_id": "alice"}}
    bob = {"configurable": {"thread_id": "bob"}}
    print("  [alice]", ask(graph, "你好", alice))
    print("  [alice]", ask(graph, "还记得我吗", alice))
    print("  [bob]  ", ask(graph, "你好", bob))
    print("  [alice]", ask(graph, "第三句", alice))

    print("== 3. 看看 alice 线程里保存了什么 / what is saved for alice ==")
    snapshot = graph.get_state(alice)
    for m in snapshot.values["messages"]:
        print(f"  {m.type:>5} | {m.content}")
