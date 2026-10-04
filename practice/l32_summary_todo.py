"""第 32 节练习：用「总结」优化记忆（TODO 版）
Lesson 32 exercise: optimise memory with summarization (TODO version)

目标：消息超过 6 条时，把旧对话压缩成摘要存进 state["summary"]，并删掉旧消息，只留最后 2 条；
之后回答时把摘要放在最前面，所以最后一问还能答出名字。
Goal: with more than 6 messages, condense the old turns into state["summary"] and delete them,
keeping only the last 2; later answers send the summary first, so the final question still gets the name.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l32_summary_todo.py
参考答案 / Solution: l32_summary_solution.py（会调用 6 次 DeepSeek / 6 DeepSeek calls）
"""
from typing import Literal

from langchain_core.messages import HumanMessage, RemoveMessage, SystemMessage
from langchain_deepseek import ChatDeepSeek
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, MessagesState, StateGraph

from llm import API_KEY, MODEL

model = ChatDeepSeek(model=MODEL, api_key=API_KEY)


# TODO 1: State 继承 MessagesState，再加一个字段 summary: str（把 pass 换掉）
#         State inherits MessagesState and adds a field summary: str (replace pass)
class State(MessagesState):
    pass


def call_model(state: State):
    summary = state.get("summary", "")
    # TODO 2: 有摘要时，messages = [SystemMessage(content=f"之前对话的摘要：{summary}")] + state["messages"]
    #         否则 messages = state["messages"]
    #         With a summary, put SystemMessage(...) in front of state["messages"]; otherwise use them as they are
    messages = state["messages"]
    response = model.invoke(messages)
    return {"messages": [response]}


def should_continue(state: State) -> Literal["summarize_conversation", END]:
    # TODO 3: 消息超过 6 条返回 "summarize_conversation"，否则返回 END
    #         Return "summarize_conversation" for more than 6 messages, otherwise END
    return END


def summarize_conversation(state: State):
    summary = state.get("summary", "")
    if summary:
        summary_message = f"这是目前为止的对话摘要：{summary}\n\n请结合上面的新消息，扩展这份摘要："
    else:
        summary_message = "请为上面的对话写一份简短的摘要，保留名字、喜好等关键信息："
    messages = state["messages"] + [HumanMessage(content=summary_message)]
    response = model.invoke(messages)
    # TODO 4: 为除了最后 2 条之外的每条消息建一个 RemoveMessage(id=m.id)（用列表推导式和切片 [:-2]）
    #         Build RemoveMessage(id=m.id) for every message except the last 2 (list comprehension + [:-2])
    delete_messages = []
    return {"summary": response.content, "messages": delete_messages}


workflow = StateGraph(State)
workflow.add_node("conversation", call_model)
workflow.add_node(summarize_conversation)
workflow.add_edge(START, "conversation")
workflow.add_conditional_edges("conversation", should_continue)
workflow.add_edge("summarize_conversation", END)
app = workflow.compile(checkpointer=InMemorySaver())


def print_update(update):
    for node_name, values in update.items():
        for m in values["messages"]:
            m.pretty_print()
        if "summary" in values:
            print("【摘要 / summary】", values["summary"])


def chat(text, config):
    input_message = HumanMessage(content=text)
    input_message.pretty_print()
    for event in app.stream({"messages": [input_message]}, config, stream_mode="updates"):
        print_update(event)


if __name__ == "__main__":
    config = {"configurable": {"thread_id": "4"}}
    chat("你好，我是托米。之后请每次只用一两句话回答。", config)
    chat("我叫什么名字？", config)
    chat("我喜欢 AI 应用开发。", config)
    print("\n--- state 里有", len(app.get_state(config).values["messages"]), "条消息 / messages ---\n")
    chat("我更喜欢 Python。", config)            # 应该触发总结 / should trigger the summary
    print("\n--- state 里有", len(app.get_state(config).values["messages"]), "条消息 / messages（应为 2 / should be 2）---\n")
    chat("我叫什么名字？", config)
