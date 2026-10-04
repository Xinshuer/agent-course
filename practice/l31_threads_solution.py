"""第 31 节练习参考答案：线程隔离的持久化层（视频第一部分）
Lesson 31 solution: thread-isolated persistence (part 1 of the video)

和视频的顺序一样 / Same order as the video:
1. 没有 checkpointer：自我介绍之后再问名字，模型不知道。
2. 编译时加上 checkpointer，调用时在 config 里给出 thread_id：线程 1 记得名字。
3. 换成线程 2：全新的一段对话，不知道名字；回到线程 1：还记得。
1. Without a checkpointer the model forgets your name between calls.
2. Compile with a checkpointer and pass a thread_id in config: thread 1 remembers.
3. Thread 2 is a brand-new conversation and doesn't know; back on thread 1 it still remembers.

视频写的是 MemorySaver，它是 InMemorySaver 的旧名字（同一个类）。
The video writes MemorySaver, the old name of InMemorySaver (the same class).

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l31_threads_solution.py
会调用 6 次 DeepSeek / Makes 6 DeepSeek calls.
"""
from langchain_deepseek import ChatDeepSeek
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, MessagesState, StateGraph

from llm import API_KEY, MODEL

model = ChatDeepSeek(model=MODEL, api_key=API_KEY)


def call_model(state: MessagesState):
    response = model.invoke(state["messages"])   # 把状态里的全部消息发给模型 / send every message in the state
    return {"messages": [response]}              # add_messages 把回答追加进去 / appended by add_messages


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
    chat(graph, "我叫什么名字？")                       # 不知道 / doesn't know

    print("\n######## 2. 加上 checkpointer，线程 1 / with a checkpointer, thread 1 ########")
    graph = builder.compile(checkpointer=InMemorySaver())
    config = {"configurable": {"thread_id": "1"}}
    chat(graph, "你好，我是托米。请简短回答。", config)
    chat(graph, "我叫什么名字？", config)               # 记得 / remembers

    print("\n######## 3. 线程 2：全新的对话 / thread 2: a brand-new conversation ########")
    chat(graph, "我叫什么名字？", {"configurable": {"thread_id": "2"}})   # 不知道 / doesn't know

    print("\n######## 4. 回到线程 1 / back to thread 1 ########")
    chat(graph, "我叫什么名字？", {"configurable": {"thread_id": "1"}})   # 还记得 / still remembers
