"""第 35 节练习：补全「人工审查工具调用」的图（TODO 版）
Lesson 35 exercise: complete the graph that lets a person review tool calls (TODO version)

要补的地方都标了 TODO。参考答案 / Solution: l35_review_tools_solution.py
Every gap is marked TODO.

运行环境 / Environment: .venv（需要 DEEPSEEK_API_KEY / needs DEEPSEEK_API_KEY）
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l35_review_tools_todo.py
"""
from typing import Literal

from langchain_core.tools import tool
from langchain_deepseek import ChatDeepSeek
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.types import Command, interrupt

from llm import API_KEY, MODEL


@tool
def weather_search(city: str) -> str:
    """查询某个城市的天气。 Search for the weather of a city."""
    print(f"    正在查询 / searching for: {city}")
    return "晴朗！/ Sunny!"


model = ChatDeepSeek(model=MODEL, api_key=API_KEY).bind_tools([weather_search])


class State(MessagesState):
    """简单的状态。 A simple state."""


def call_llm(state: State):
    return {"messages": [model.invoke(state["messages"])]}


def human_review_node(state: State) -> Command[Literal["call_llm", "run_tool"]]:
    last_message = state["messages"][-1]
    tool_call = last_message.tool_calls[-1]

    # TODO 1: 用 interrupt({...}) 暂停，把 "question" 和 "tool_call" 交给人，结果存进 human_review
    #         pause with interrupt({...}) showing "question" and "tool_call"; store the result in human_review
    human_review = {"action": "continue"}
    review_action = human_review["action"]
    review_data = human_review.get("data")

    if review_action == "continue":
        # TODO 2: 去 run_tool / go to run_tool
        pass
    elif review_action == "update":
        # TODO 3: 造一条 "role": "ai" 的消息：content 不变，tool_calls 里换成 review_data 当参数，
        #         "id" 必须等于 last_message.id；然后 Command(goto="run_tool", update={"messages": [...]})
        #         build a "role": "ai" message with the same content, args = review_data, and
        #         "id" = last_message.id; then go to run_tool with update={"messages": [...]}
        pass
    elif review_action == "feedback":
        # TODO 4: 造一条 "role": "tool" 的消息（content=review_data，tool_call_id 对上），回到 call_llm
        #         build a "role": "tool" message (content=review_data, matching tool_call_id); go back to call_llm
        pass


def run_tool(state: State):
    new_messages = []
    tools = {"weather_search": weather_search}
    for tool_call in state["messages"][-1].tool_calls:
        result = tools[tool_call["name"]].invoke(tool_call["args"])
        new_messages.append(
            {"role": "tool", "name": tool_call["name"], "content": result, "tool_call_id": tool_call["id"]}
        )
    return {"messages": new_messages}


def route_after_llm(state: State) -> Literal[END, "human_review_node"]:
    # TODO 5: 最后一条消息没有工具调用 -> END；有 -> "human_review_node"
    #         no tool calls in the last message -> END; otherwise -> "human_review_node"
    return END


builder = StateGraph(State)
builder.add_node(call_llm)
builder.add_node(run_tool)
builder.add_node(human_review_node)
builder.add_edge(START, "call_llm")
builder.add_conditional_edges("call_llm", route_after_llm)
builder.add_edge("run_tool", "call_llm")
# TODO 6: 编译时加上 checkpointer=InMemorySaver() / compile with checkpointer=InMemorySaver()
graph = builder.compile()


def main():
    config = {"configurable": {"thread_id": "2"}}
    for event in graph.stream({"messages": [{"role": "user", "content": "北京天气如何？"}]}, config,
                              stream_mode="updates"):
        print(event)
    # TODO 7: 图停在审查节点时，用 Command(resume={"action": "continue"}) 恢复，再把事件打印出来
    #         when paused at the review node, resume with Command(resume={"action": "continue"}) and print the events


if __name__ == "__main__":
    main()
