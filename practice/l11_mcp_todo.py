"""第 11 节练习：让 Agent 通过 MCP 使用另一个程序里的工具（TODO 版）
Lesson 11 exercise: an agent that uses tools from a separate MCP server (TODO version)

服务器已经写好了：l11_mcp_server.py（先读一读它，只有二十几行代码）。
The server is ready-made in l11_mcp_server.py (read it first - about 20 lines of code).

运行环境 / Environment: .venv  (openai-agents 0.20.0, mcp 1.30.0)
运行 / Run（在 practice 文件夹里运行 / run it from the practice folder）:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l11_mcp_todo.py
需要 / Needs: DEEPSEEK_API_KEY
参考答案 / Solution: l11_mcp_solution.py
"""
import asyncio
import sys
from pathlib import Path

from agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled
from agents.mcp import MCPServerStdio

from llm import MODEL, async_client

set_tracing_disabled(True)

SERVER_FILE = Path(__file__).with_name("l11_mcp_server.py")


async def main():
    # TODO 1: 用 async with 启动服务器：
    #         async with MCPServerStdio(
    #             name="文件工具服务器",
    #             params={"command": sys.executable, "args": [str(SERVER_FILE)]},
    #             client_session_timeout_seconds=30,
    #         ) as mcp_server:
    #         下面的代码都要缩进到 async with 里面
    #         Start the server with async with ... as mcp_server; indent everything below inside it

    # TODO 2: tools = await mcp_server.list_tools()，打印每个工具的 name 和 description
    #         List the server's tools and print each name and description

    # TODO 3: 创建 Agent，传入 mcp_servers=[mcp_server]
    #         await Runner.run(agent, "当前目录有几个文件？")，打印 final_output
    #         Create an Agent with mcp_servers=[mcp_server], ask how many files are here, print the answer
    pass


if __name__ == "__main__":
    asyncio.run(main())
