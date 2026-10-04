"""第 32 节练习参考答案：用「总结」优化记忆（视频第三部分的第二个例子）
Lesson 32 solution: optimise memory with summarization (the second example of part 3 of the video)

state 在 messages 之外多一个 summary 字段。每轮 conversation 节点回答之后，should_continue 检查：
消息超过 6 条就去 summarize_conversation：让模型写（或扩展）摘要，再用 RemoveMessage
删掉除最后 2 条以外的旧消息。之后 call_model 会把摘要作为 system 消息放在最前面。
The state has a summary field besides messages. After each answer, should_continue checks:
more than 6 messages -> summarize_conversation writes (or extends) the summary and deletes all but
the last 2 messages with RemoveMessage. From then on call_model puts the summary first as a system message.

图 / Graph:
    START -> conversation -> 超过 6 条 / more than 6 -> summarize_conversation -> END
                          -> 否则 / otherwise -> END

和视频一样的对话顺序（thread_id 4）/ The same conversation as the video (thread_id 4):
托米自我介绍 -> 问名字 -> 喜欢 AI 应用开发 -> （查看 state）-> 更喜欢 Python（触发总结）-> 再问名字

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l32_summary_solution.py
会调用 6 次 DeepSeek（5 轮对话 + 1 次总结）/ Makes 6 DeepSeek calls (5 turns + 1 summary).
"""
from typing import Literal

from langchain_core.messages import HumanMessage, RemoveMessage, SystemMessage
from langchain_deepseek import ChatDeepSeek
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, MessagesState, StateGraph

from llm import API_KEY, MODEL

model = ChatDeepSeek(model=MODEL, api_key=API_KEY)


class State(MessagesState):
    summary: str                     # messages 之外再加一个摘要字段 / one extra field for the summary


def call_model(state: State):
    summary = state.get("summary", "")
    if summary:                      # 有摘要：作为 system 消息放在最前面 / summary first, as a system message
        system_message = f"之前对话的摘要：{summary}"
        messages = [SystemMessage(content=system_message)] + state["messages"]
    else:
        messages = state["messages"]
    response = model.invoke(messages)
    return {"messages": [response]}


def should_continue(state: State) -> Literal["summarize_conversation", END]:
    messages = state["messages"]
    if len(messages) > 6:            # 超过 6 条（3 问 3 答）就去总结 / more than 6 -> summarize
        return "summarize_conversation"
    return END


def summarize_conversation(state: State):
    summary = state.get("summary", "")
    if summary:
        summary_message = f"这是目前为止的对话摘要：{summary}\n\n请结合上面的新消息，扩展这份摘要："
    else:
        summary_message = "请为上面的对话写一份简短的摘要，保留名字、喜好等关键信息："
    messages = state["messages"] + [HumanMessage(content=summary_message)]
    response = model.invoke(messages)
    delete_messages = [RemoveMessage(id=m.id) for m in state["messages"][:-2]]   # 只留最后 2 条 / keep the last 2
    return {"summary": response.content, "messages": delete_messages}


workflow = StateGraph(State)
workflow.add_node("conversation", call_model)
workflow.add_node(summarize_conversation)        # 只传函数：节点名就是函数名 / node name = function name
workflow.add_edge(START, "conversation")
workflow.add_conditional_edges("conversation", should_continue)
workflow.add_edge("summarize_conversation", END)
app = workflow.compile(checkpointer=InMemorySaver())


def print_update(update):
    """打印 stream_mode="updates" 交出的一次更新 / print one update from stream_mode="updates" """
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

    values = app.get_state(config).values
    print(f"\n--- 还没到阈值：state 里有 {len(values['messages'])} 条消息，"
          f"摘要：{values.get('summary', '（还没有）')} / not over the threshold yet ---\n")

    chat("我更喜欢 Python。", config)            # 答完共 8 条 -> 触发总结 / 8 messages after the answer -> summary

    values = app.get_state(config).values
    print(f"\n--- 总结之后：state 里只剩 {len(values['messages'])} 条消息 / after the summary ---\n")

    chat("我叫什么名字？", config)                # 旧消息已删，只能靠摘要 / old messages are gone; the summary knows
