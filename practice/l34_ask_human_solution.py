"""第 34 节 例子二：智能体缺信息时，调用 AskHuman 停下来问人（参考答案）
Lesson 34, example 2: when the agent lacks information it "calls" AskHuman and waits for a person (solution)

和视频的结构一样 / Same structure as the video:
    START -> agent --没有工具调用 / no tool call--> END
               |---AskHuman--> ask_human（interrupt 等人回答 / waits for the answer）--> agent
               |---其他工具 / other tools--> action（ToolNode 执行 search / runs search）--> agent
视频里用的也是 DeepSeek；这里通过 llm.py 用 deepseek-flash。
The video uses DeepSeek too; here it is deepseek-flash via llm.py.

运行环境 / Environment: .venv（需要 DEEPSEEK_API_KEY / needs DEEPSEEK_API_KEY）
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l34_ask_human_solution.py
默认自动回答「北京」（和视频一样）；想自己输入，把 ASK_IN_TERMINAL 改成 True。
By default it answers "北京" (Beijing) like the video; set ASK_IN_TERMINAL = True to type it yourself.
"""
from langchain_core.tools import tool
from langchain_deepseek import ChatDeepSeek
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode
from langgraph.types import Command, interrupt
from pydantic import BaseModel

from llm import API_KEY, MODEL

ASK_IN_TERMINAL = False
DEFAULT_ANSWER = "北京"


@tool
def search(query: str) -> str:
    """上网搜索信息。 Search the web for information."""
    # 假的搜索：不管搜什么都返回同一句话（视频里也是写死的）/ fake: always the same text, as in the video
    return f"搜索「{query}」的结果：晴朗，25°C / sunny, 25°C"


tools = [search]
tool_node = ToolNode(tools)


class AskHuman(BaseModel):
    """向用户提一个问题。 Ask the user a question."""
    question: str


# AskHuman 也交给模型，模型才知道自己可以「提问」；但它不放进 ToolNode
# AskHuman is bound too, so the model knows it can ask; it is NOT put in ToolNode
model = ChatDeepSeek(model=MODEL, api_key=API_KEY).bind_tools(tools + [AskHuman])


def should_continue(state: MessagesState):
    last_message = state["messages"][-1]
    if not last_message.tool_calls:                          # 没有工具调用：结束 / no tool call: finish
        return END
    elif last_message.tool_calls[0]["name"] == "AskHuman":   # 想问人 / wants to ask a person
        return "ask_human"
    else:                                                    # 真正的工具 / a real tool
        return "action"


def call_model(state: MessagesState):
    response = model.invoke(state["messages"])
    return {"messages": [response]}


def ask_human(state: MessagesState):
    tool_call = state["messages"][-1].tool_calls[0]
    ask = AskHuman.model_validate(tool_call["args"])    # 用 pydantic 检查参数 / validate the args
    location = interrupt(ask.question)                   # 暂停，等人回答 / pause for the answer
    # 用一条 tool 消息回答这次 AskHuman 调用，tool_call_id 必须对上
    # Answer the AskHuman call with a tool message; tool_call_id must match
    tool_message = {"tool_call_id": tool_call["id"], "type": "tool", "content": location}
    return {"messages": [tool_message]}


workflow = StateGraph(MessagesState)
workflow.add_node("agent", call_model)
workflow.add_node("action", tool_node)
workflow.add_node("ask_human", ask_human)
workflow.add_edge(START, "agent")
workflow.add_conditional_edges("agent", should_continue, path_map=["ask_human", "action", END])
workflow.add_edge("action", "agent")
workflow.add_edge("ask_human", "agent")
app = workflow.compile(checkpointer=InMemorySaver())


def show(stream):
    """打印流里每一步的最后一条消息；遇到暂停就打印问题。 Print each step; show the question on a pause."""
    for event in stream:
        if "__interrupt__" in event:
            print("\n[暂停 / paused] 问题 / question:", event["__interrupt__"][0].value)
        else:
            event["messages"][-1].pretty_print()


def main():
    config = {"configurable": {"thread_id": "2"}}
    question = "先问问我在哪个城市，然后查一下那里的天气。"
    show(app.stream({"messages": [{"role": "user", "content": question}]}, config, stream_mode="values"))

    # 可能不止问一次，所以用 while：只要图还停着，就回答并恢复
    # It may ask more than once, so loop: while the graph is paused, answer and resume
    while app.get_state(config).interrupts:
        if ASK_IN_TERMINAL:
            answer = input("你的回答 / your answer: ")
        else:
            answer = DEFAULT_ANSWER
            print("你的回答 / your answer:", answer)
        show(app.stream(Command(resume=answer), config, stream_mode="values"))


if __name__ == "__main__":
    main()
