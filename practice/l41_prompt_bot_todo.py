"""第 41 节练习：提示词生成小助手（TODO 版）
Lesson 41 exercise: the prompt-generator assistant (TODO version)

补全 5 个 TODO：get_prompt_messages、get_state、add_tool_message 节点、图的连线、对话循环里取最后一条消息。
Complete the 5 TODOs: get_prompt_messages, get_state, the add_tool_message node, the edges,
and reading the last message in the chat loop.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l41_prompt_bot_todo.py
需要的 key / Key needed: DEEPSEEK_API_KEY
参考答案 / Solution: l41_prompt_bot_solution.py
输入 q 或 Q 退出。 Type q or Q to quit.
"""
import uuid
from typing import Annotated, TypedDict

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage
from langchain_deepseek import ChatDeepSeek
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages
from pydantic import BaseModel

from llm import API_KEY, MODEL

template = """你的工作是从用户那里了解：他们想创建一个什么样的提示词模板。
你需要弄清楚下面四件事：
- 提示词的目标是什么
- 哪些变量会传进提示词模板
- 输出不能做什么（限制）
- 输出必须满足什么（要求）

如果有哪一项判断不出来，就请用户说清楚，不要胡乱猜。
四件事都弄清楚之后，调用相关的工具。"""


def get_messages_info(messages):
    return [SystemMessage(content=template)] + messages


class PromptInstructions(BaseModel):
    """关于如何编写提示词模板的说明（需求都问清楚后调用）。"""

    objective: str
    variables: list[str]
    constraints: list[str]
    requirements: list[str]


llm = ChatDeepSeek(model=MODEL, api_key=API_KEY)
llm_with_tool = llm.bind_tools([PromptInstructions])


def info_chain(state):
    messages = get_messages_info(state["messages"])
    response = llm_with_tool.invoke(messages)
    return {"messages": [response]}


prompt_system = """根据下面的需求，写一个好的提示词模板：

{reqs}"""


# TODO 1: 遍历 messages：
#   - 带 tool_calls 的 AIMessage → tool_call = 它的 tool_calls[0]["args"]
#   - ToolMessage → 跳过（continue）
#   - 已经找到 tool_call 之后的其他消息 → 放进 other_msgs
#   Walk the messages: take the args of the AI tool call, skip ToolMessages, keep later messages.
def get_prompt_messages(messages):
    tool_call = None
    other_msgs = []

    return [SystemMessage(content=prompt_system.format(reqs=tool_call))] + other_msgs


def prompt_gen_chain(state):
    messages = get_prompt_messages(state["messages"])
    response = llm.invoke(messages)
    return {"messages": [response]}


# TODO 2: get_state(state)：
#   最后一条是 AIMessage 且有 tool_calls → "add_tool_message"
#   最后一条不是 HumanMessage → END
#   其他情况 → "info"
def get_state(state):
    return END


class State(TypedDict):
    messages: Annotated[list, add_messages]


memory = InMemorySaver()
workflow = StateGraph(State)
workflow.add_node("info", info_chain)
workflow.add_node("prompt", prompt_gen_chain)


# TODO 3: 用 @workflow.add_node 装饰下面的函数，并让它返回一条 ToolMessage：
#         content 随便写一句提示，tool_call_id = 最后一条消息的 tool_calls[0]["id"]
#         Decorate it with @workflow.add_node and return a ToolMessage whose tool_call_id matches the call
def add_tool_message(state: State):
    return {"messages": []}


# TODO 4: 连线 / edges
#   info 的条件边：get_state，可能的去向 ["add_tool_message", "info", END]
#   add_tool_message → prompt；prompt → END；START → info


graph = workflow.compile(checkpointer=memory)


if __name__ == "__main__":
    config = {"configurable": {"thread_id": str(uuid.uuid4())}}
    print("说说你想要一个什么样的提示词。 Describe the prompt you want.")
    while True:
        user = input("\n用户 / User（q/Q 退出 / to quit）: ")
        if user in {"q", "Q"}:
            print("AI: 再见！ Byebye")
            break
        output = None
        for output in graph.stream({"messages": [HumanMessage(content=user)]}, config=config, stream_mode="updates"):
            # TODO 5: output 是 {节点名: 更新}；用 next(iter(output.values())) 取出更新，
            #         再取它 "messages" 的最后一条，调用 .pretty_print()
            #         output is {node_name: update}; get the update with next(iter(output.values())),
            #         take the last of its "messages" and call .pretty_print()
            print(output)
        if output and "prompt" in output:
            print("完成！ Done!")
