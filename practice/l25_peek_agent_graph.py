"""第 25 节演示：LangChain 的 create_agent 生成的其实是一张 LangGraph 图
Lesson 25 demo: what LangChain's create_agent builds is really a LangGraph graph

打印 create_agent 返回的对象类型、图里的节点和边，并输出 Mermaid 文本
（粘贴到 https://mermaid.live 就能看到图）。
Prints the type of the object create_agent returns, the nodes and edges of its graph,
and Mermaid text you can paste into https://mermaid.live to see the picture.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l25_peek_agent_graph.py
不调用模型，不花钱（只是创建对象）。 / Makes no model calls (it only builds objects).
"""
from importlib.metadata import version

from langchain.agents import create_agent
from langchain_core.tools import tool
from langchain_deepseek import ChatDeepSeek

from llm import API_KEY, MODEL


@tool
def get_temperature(city: str) -> str:
    """Return the current temperature of a city."""
    return f"{city}: 20°C"


if __name__ == "__main__":
    print("langgraph", version("langgraph"), "| langchain", version("langchain"))

    model = ChatDeepSeek(model=MODEL, api_key=API_KEY)  # 只创建对象，不发请求 / builds an object, sends nothing
    agent = create_agent(model=model, tools=[get_temperature], system_prompt="你是一个乐于助人的助手。")

    print("create_agent 返回的类型 / type returned:", type(agent).__name__)

    graph = agent.get_graph()
    print("节点 / nodes:", list(graph.nodes))
    print("边 / edges:")
    for edge in graph.edges:
        kind = "条件边 conditional" if edge.conditional else "普通边 normal"
        print(f"  {edge.source} -> {edge.target}   ({kind})")

    print("\nMermaid 文本（粘贴到 https://mermaid.live 可以看到图）/ paste into https://mermaid.live:\n")
    print(graph.draw_mermaid())
