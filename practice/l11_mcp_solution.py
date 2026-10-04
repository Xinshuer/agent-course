"""第 11 节练习参考答案：让 Agent 通过 MCP 使用另一个程序里的工具（视频里的例子：当前目录有几个文件？）
Lesson 11 solution: an agent that uses tools from a separate MCP server
(the video's example: how many files are in the current folder?)

视频里的三个步骤 / The video's three steps:
1. 启动 MCP 服务器：async with MCPServerStdio(...)，它会用 python 运行 l11_mcp_server.py
   start the MCP server: async with MCPServerStdio(...) runs l11_mcp_server.py with python
2. 从服务器获取它提供的工具（SDK 会自动做；这里也手动列一次给你看）
   get the server's tools (the SDK does it automatically; we also list them once by hand)
3. 把服务器交给 Agent：Agent(..., mcp_servers=[mcp_server])
   give the server to the agent

运行环境 / Environment: .venv  (openai-agents 0.20.0, mcp 1.30.0)
运行 / Run（要在 practice 文件夹里运行，「当前目录」就是 practice / run it from the practice folder）:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l11_mcp_solution.py
需要 / Needs: DEEPSEEK_API_KEY
"""
import asyncio
import sys
from pathlib import Path

from agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled
from agents.mcp import MCPServerStdio

from llm import MODEL, async_client

set_tracing_disabled(True)

# 和本文件同一个文件夹里的服务器脚本 / the server script next to this file
SERVER_FILE = Path(__file__).with_name("l11_mcp_server.py")


async def main():
    # 第 1 步：启动 MCP 服务器（子进程），离开 async with 时自动关闭
    # Step 1: start the MCP server (a subprocess); it is closed automatically when leaving async with
    async with MCPServerStdio(
        name="文件工具服务器",
        params={
            "command": sys.executable,          # 视频里写的是 "python" / the video writes "python"
            "args": [str(SERVER_FILE)],
        },
        client_session_timeout_seconds=30,      # 默认 5 秒，第一次启动可能更慢 / default 5 s
    ) as mcp_server:
        # 第 2 步（只是看一看）：服务器提供了哪些工具 / Step 2 (just to look): which tools are offered
        tools = await mcp_server.list_tools()
        for tool in tools:
            print("工具 / tool:", tool.name, "-", tool.description)

        # 第 3 步：把服务器交给 Agent / Step 3: give the server to the agent
        agent = Agent(
            name="文件助手",
            instructions="你是一个文件助手。需要了解文件夹内容时，使用工具。回答简洁。",
            model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),
            mcp_servers=[mcp_server],           # 可以放好几个服务器 / there can be several servers
        )
        result = await Runner.run(agent, "当前目录有几个文件？")
        print("AI:", result.final_output)
        print("步骤 / steps:", [item.type for item in result.new_items])


if __name__ == "__main__":
    asyncio.run(main())
