"""第 42 节扩展：同一支团队，自己用 LangGraph 搭成「路由版」
Lesson 42 extra: the same team, hand-wired in LangGraph as a router graph

和 l42_xiaolang_solution.py（主管版，视频的结构）的区别 / Difference from the supervisor version:
    路由版 router：router 节点用结构化输出只选「一位」员工，员工的回答直接给用户；流程是固定的图。
    The router node picks exactly ONE worker with structured output, and that worker answers the user.
    START → router →（条件边 / conditional edge）→ research | dev | chat → END

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l42_router_graph.py
需要的 key / Key needed: DEEPSEEK_API_KEY
它从 l42_xiaolang_solution.py 导入模型和两位员工，所以先把参考答案跑通。
It imports the model and both workers from l42_xiaolang_solution.py, so get that working first.
输入 /exit 退出。 Type /exit to quit.
"""
import uuid
from typing import Literal

from langchain.agents import create_agent
from langchain_core.messages import SystemMessage
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, MessagesState, StateGraph
from pydantic import BaseModel, Field

from l42_xiaolang_solution import dev_agent, model, research_agent

chat_agent = create_agent(
    model,
    tools=[],
    system_prompt="你是小浪，一个友好的 AI 学习助手，负责打招呼和闲聊，回答简洁。",
    name="chat_agent",
)


# ---------------------------------------------------------------- 1. 调度员 / the router
class Route(BaseModel):
    """决定把用户最新的一句话交给谁。Decide who handles the user's latest message."""

    next: Literal["research", "dev", "chat"] = Field(
        description="research=课程、概念、环境、练习文件；dev=写代码、计算、查 bug；chat=打招呼和其他闲聊"
    )
    reason: str = Field(description="一句话说明理由 / one-sentence reason")


ROUTER_SYSTEM = "你是小浪助手的调度员。你不回答问题，只根据用户最新的一句话，决定交给谁处理。"
router_llm = model.with_structured_output(Route)   # 需要关掉思考模式，solution 里的 model 已经关了 / thinking is off


class XiaolangState(MessagesState):      # messages 之外，多存一个「下一步交给谁」 / plus who goes next
    next: str


def router(state: XiaolangState):
    route = router_llm.invoke([SystemMessage(ROUTER_SYSTEM)] + state["messages"])
    print(f"  [小浪调度 / router] → {route.next}（{route.reason}）")
    return {"next": route.next}           # 只记下决定，不往对话里加消息 / record the decision only


def pick_worker(state: XiaolangState):   # 条件边用的路由函数 / routing function for the conditional edge
    return state["next"]


# ---------------------------------------------------------------- 2. 员工节点 / worker nodes
def run_agent(agent, state):
    """把整段对话交给员工，只把它最后的回答带回主图。 Whole chat in, final answer out."""
    result = agent.invoke({"messages": state["messages"]})
    return {"messages": [result["messages"][-1]]}


def research_node(state: XiaolangState):
    return run_agent(research_agent, state)


def dev_node(state: XiaolangState):
    return run_agent(dev_agent, state)


def chat_node(state: XiaolangState):
    return run_agent(chat_agent, state)


# ---------------------------------------------------------------- 3. 组装 / build
builder = StateGraph(XiaolangState)
builder.add_node("router", router)
builder.add_node("research", research_node)
builder.add_node("dev", dev_node)
builder.add_node("chat", chat_node)
builder.add_edge(START, "router")
builder.add_conditional_edges("router", pick_worker, ["research", "dev", "chat"])
builder.add_edge("research", END)
builder.add_edge("dev", END)
builder.add_edge("chat", END)
graph = builder.compile(checkpointer=InMemorySaver())


if __name__ == "__main__":
    config = {"configurable": {"thread_id": str(uuid.uuid4())}}
    print("小浪（路由版）。输入 /exit 退出。 Xiaolang (router version). Type /exit to quit.")
    while True:
        user_input = input("\n你 / You: ").strip()
        if not user_input:
            continue
        if user_input == "/exit":
            break
        result = graph.invoke({"messages": [("user", user_input)]}, config)
        answer = result["messages"][-1]
        print(f"小浪（{answer.name}）:", answer.content)
