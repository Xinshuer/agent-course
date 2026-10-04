"""第 41 节：用 LangGraph 做提示词生成小助手（参考答案，结构和视频一致）
Lesson 41: a prompt-generator assistant with LangGraph (solution, same structure as the video)

流程 / Flow:
    START → info（聊天收集需求；问齐了就调用 PromptInstructions 工具）
          → get_state 路由 / routing:
               最后一条是带工具调用的 AI 消息 → add_tool_message → prompt（写出提示词模板）→ END
               最后一条是普通的 AI 消息（模型在提问）→ END，等用户回答下一句
               最后一条是用户消息 → info（兜底）
    START → info (chat to collect the requirements; call the PromptInstructions tool once all are clear)
          → get_state: AI tool call → add_tool_message → prompt (writes the template) → END;
            a plain AI message (a question) → END and wait; a user message → info (fallback)
    InMemorySaver + thread_id 让多轮对话接得上。 InMemorySaver + thread_id carry the chat across turns.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l41_prompt_bot_solution.py
需要的 key / Key needed: DEEPSEEK_API_KEY
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

# ---------------------------------------------------------------- 1. 收集需求 / gather the requirements
template = """你的工作是从用户那里了解：他们想创建一个什么样的提示词模板。
你需要弄清楚下面四件事：
- 提示词的目标是什么
- 哪些变量会传进提示词模板
- 输出不能做什么（限制）
- 输出必须满足什么（要求）

如果有哪一项判断不出来，就请用户说清楚，不要胡乱猜。
四件事都弄清楚之后，调用相关的工具。"""


def get_messages_info(messages):
    """系统提示词 + 到目前为止的全部对话。 The system prompt + the whole conversation so far."""
    return [SystemMessage(content=template)] + messages


class PromptInstructions(BaseModel):
    """关于如何编写提示词模板的说明（需求都问清楚后调用）。Instructions on how to write the prompt template."""

    objective: str
    variables: list[str]
    constraints: list[str]
    requirements: list[str]


llm = ChatDeepSeek(model=MODEL, api_key=API_KEY)
llm_with_tool = llm.bind_tools([PromptInstructions])   # 模型自己决定：继续提问，还是调用工具


def info_chain(state):
    """节点 info：和用户对话，收集需求。 Node info: chat with the user to collect requirements."""
    messages = get_messages_info(state["messages"])
    response = llm_with_tool.invoke(messages)
    return {"messages": [response]}


# ---------------------------------------------------------------- 2. 生成提示词 / generate the prompt
prompt_system = """根据下面的需求，写一个好的提示词模板：

{reqs}"""


def get_prompt_messages(messages):
    """从历史里找到工具调用：它的参数就是需求；只保留工具调用之后的消息。
    Find the tool call in the history (its arguments are the requirements); keep only later messages."""
    tool_call = None
    other_msgs = []
    for m in messages:
        if isinstance(m, AIMessage) and m.tool_calls:
            tool_call = m.tool_calls[0]["args"]
        elif isinstance(m, ToolMessage):
            continue
        elif tool_call is not None:
            other_msgs.append(m)
    return [SystemMessage(content=prompt_system.format(reqs=tool_call))] + other_msgs


def prompt_gen_chain(state):
    """节点 prompt：根据需求写出提示词模板（用不带工具的 llm）。"""
    messages = get_prompt_messages(state["messages"])
    response = llm.invoke(messages)
    return {"messages": [response]}


# ---------------------------------------------------------------- 3. 路由 / routing
def get_state(state):
    messages = state["messages"]
    if isinstance(messages[-1], AIMessage) and messages[-1].tool_calls:
        return "add_tool_message"        # 需求齐了 / requirements complete
    elif not isinstance(messages[-1], HumanMessage):
        return END                       # 模型在提问：这一轮结束 / the model asked: end this turn
    return "info"                        # 兜底 / fallback


# ---------------------------------------------------------------- 4. 组装 / build the graph
class State(TypedDict):
    messages: Annotated[list, add_messages]


memory = InMemorySaver()                 # 视频写的是 MemorySaver，是同一个类 / the video's MemorySaver is the same class
workflow = StateGraph(State)
workflow.add_node("info", info_chain)
workflow.add_node("prompt", prompt_gen_chain)


@workflow.add_node                       # 用装饰器加节点，节点名就是函数名 / the node is named after the function
def add_tool_message(state: State):
    """补一条 ToolMessage：有工具调用，就必须有对应的工具结果。"""
    return {
        "messages": [
            ToolMessage(
                content="需求已收到，开始生成提示词。",
                tool_call_id=state["messages"][-1].tool_calls[0]["id"],
            )
        ]
    }


workflow.add_conditional_edges("info", get_state, ["add_tool_message", "info", END])
workflow.add_edge("add_tool_message", "prompt")
workflow.add_edge("prompt", END)
workflow.add_edge(START, "info")
graph = workflow.compile(checkpointer=memory)


if __name__ == "__main__":
    config = {"configurable": {"thread_id": str(uuid.uuid4())}}   # 每次运行一个新会话 / a new thread per run
    print("说说你想要一个什么样的提示词。 Describe the prompt you want.")
    while True:
        user = input("\n用户 / User（q/Q 退出 / to quit）: ")
        if user in {"q", "Q"}:
            print("AI: 再见！ Byebye")
            break
        output = None
        for output in graph.stream({"messages": [HumanMessage(content=user)]}, config=config, stream_mode="updates"):
            last_message = next(iter(output.values()))["messages"][-1]   # 这个节点返回的最后一条消息
            last_message.pretty_print()
        if output and "prompt" in output:
            print("完成！ Done!")
