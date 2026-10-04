"""第 31 节练习：线程隔离的持久化层（TODO 版）
Lesson 31 exercise: thread-isolated persistence (TODO version)

目标：先确认没有 checkpointer 时模型记不住名字；再加上 checkpointer 和 thread_id，
让线程 1 记得名字、线程 2 不知道。
Goal: first see that without a checkpointer the model forgets your name; then add a checkpointer
and a thread_id so that thread 1 remembers while thread 2 does not.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l31_threads_todo.py
参考答案 / Solution: l31_threads_solution.py（会调用 6 次 DeepSeek / 6 DeepSeek calls）
"""
from langchain_deepseek import ChatDeepSeek
from langgraph.graph import END, START, MessagesState, StateGraph

# TODO 1: 从 langgraph.checkpoint.memory 导入 InMemorySaver（视频里写的是它的旧名字 MemorySaver）
#         Import InMemorySaver from langgraph.checkpoint.memory (the video uses its old name MemorySaver)

from llm import API_KEY, MODEL

model = ChatDeepSeek(model=MODEL, api_key=API_KEY)


def call_model(state: MessagesState):
    response = model.invoke(state["messages"])
    return {"messages": [response]}


builder = StateGraph(MessagesState)
builder.add_node("call_model", call_model)
builder.add_edge(START, "call_model")
builder.add_edge("call_model", END)


def chat(graph, text, config=None):
    """发一句话，打印每一步状态里的最后一条消息 / send one line and print the last message of each step"""
    inputs = {"messages": [{"role": "user", "content": text}]}
    for chunk in graph.stream(inputs, config, stream_mode="values"):
        chunk["messages"][-1].pretty_print()


if __name__ == "__main__":
    print("\n######## 1. 没有 checkpointer / without a checkpointer ########")
    graph = builder.compile()
    chat(graph, "你好，我是托米。请简短回答。")
    chat(graph, "我叫什么名字？")

    print("\n######## 2. 加上 checkpointer，线程 1 / with a checkpointer, thread 1 ########")
    # TODO 2: 重新编译，传入 checkpointer=InMemorySaver()
    #         Compile again with checkpointer=InMemorySaver()
    graph = builder.compile()

    # TODO 3: 写出两层的 config：{"configurable": {"thread_id": "1"}}
    #         Write the two-level config: {"configurable": {"thread_id": "1"}}
    config = None

    chat(graph, "你好，我是托米。请简短回答。", config)
    chat(graph, "我叫什么名字？", config)

    # TODO 4: 用 thread_id "2" 再问一次「我叫什么名字？」，然后回到 thread_id "1" 再问一次
    #         Ask "我叫什么名字？" on thread_id "2", then once more on thread_id "1"
