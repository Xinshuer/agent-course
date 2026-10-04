"""第 34 节练习：补全会「问人」的智能体（TODO 版）
Lesson 34 exercise: complete the agent that asks a person (TODO version)

要补的地方都标了 TODO。参考答案 / Solution: l34_ask_human_solution.py
Every gap is marked TODO.

运行环境 / Environment: .venv（需要 DEEPSEEK_API_KEY / needs DEEPSEEK_API_KEY）
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l34_ask_human_todo.py
"""
from langchain_core.tools import tool
from langchain_deepseek import ChatDeepSeek
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode
from langgraph.types import Command, interrupt
from pydantic import BaseModel

from llm import API_KEY, MODEL


@tool
def search(query: str) -> str:
    """上网搜索信息。 Search the web for information."""
    return f"搜索「{query}」的结果：晴朗，25°C / sunny, 25°C"


tools = [search]
tool_node = ToolNode(tools)


class AskHuman(BaseModel):
    """向用户提一个问题。 Ask the user a question."""
    question: str


# TODO 1: 把 search 和 AskHuman 一起绑定给模型 / bind search AND AskHuman to the model
model = ChatDeepSeek(model=MODEL, api_key=API_KEY)


def should_continue(state: MessagesState):
    last_message = state["messages"][-1]
    if not last_message.tool_calls:
        return END
    # TODO 2: 第一个调用的名字是 "AskHuman" 时返回 "ask_human"，否则返回 "action"
    #         return "ask_human" when the first call's name is "AskHuman", otherwise "action"
    return "action"


def call_model(state: MessagesState):
    response = model.invoke(state["messages"])
    return {"messages": [response]}


def ask_human(state: MessagesState):
    tool_call = state["messages"][-1].tool_calls[0]
    # TODO 3: 用 AskHuman.model_validate(...) 检查参数，得到 ask
    #         validate the args with AskHuman.model_validate(...) -> ask
    # TODO 4: location = interrupt(ask.question)
    # TODO 5: 返回一条 tool 消息：{"tool_call_id": ..., "type": "tool", "content": location}
    #         return a tool message dict with the matching tool_call_id
    return {"messages": []}


workflow = StateGraph(MessagesState)
workflow.add_node("agent", call_model)
workflow.add_node("action", tool_node)
workflow.add_node("ask_human", ask_human)
workflow.add_edge(START, "agent")
workflow.add_conditional_edges("agent", should_continue, path_map=["ask_human", "action", END])
workflow.add_edge("action", "agent")
# TODO 6: ask_human 回答完要回到 agent / after ask_human, go back to agent

# TODO 7: 编译时加上 checkpointer=InMemorySaver()，否则没法恢复
#         compile with checkpointer=InMemorySaver(), otherwise it cannot resume
app = workflow.compile()


def show(stream):
    for event in stream:
        if "__interrupt__" in event:
            print("\n[暂停 / paused] 问题 / question:", event["__interrupt__"][0].value)
        else:
            event["messages"][-1].pretty_print()


def main():
    config = {"configurable": {"thread_id": "2"}}
    question = "先问问我在哪个城市，然后查一下那里的天气。"
    show(app.stream({"messages": [{"role": "user", "content": question}]}, config, stream_mode="values"))

    while app.get_state(config).interrupts:
        answer = input("你的回答 / your answer: ")
        # TODO 8: 用 Command(resume=answer) 恢复，同样用 show(app.stream(..., config, stream_mode="values")) 打印
        #         resume with Command(resume=answer) and print it the same way
        break


if __name__ == "__main__":
    main()
