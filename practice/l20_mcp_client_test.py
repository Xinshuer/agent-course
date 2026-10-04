"""第 20 节：用 Python 的 mcp 库直接连接 MCP 服务器（不经过大模型），调用工具、读取模板。
Lesson 20: connect to an MCP server with the Python mcp library (no model involved): call a tool, read a template.

两种连接方式 / two ways to connect:
    remote  先单独启动 l20_remote_mcp_server.py，再用 streamable HTTP 连接它
            start l20_remote_mcp_server.py first, then connect over streamable HTTP
    local   客户端自己把 l20_local_mcp_server.py 当作子进程启动（stdio），不用提前启动
            the client starts l20_local_mcp_server.py itself as a subprocess (stdio)

运行环境 / Environment: .venv ；不需要任何 key / no key needed
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l20_mcp_client_test.py local
    & ..\\.venv\\Scripts\\python.exe l20_mcp_client_test.py remote   # 服务器要先运行 / server must be running
"""
import asyncio
import sys
from pathlib import Path

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from mcp.client.streamable_http import streamable_http_client

HERE = Path(__file__).parent


async def use_session(session):
    """两种连接方式共用：初始化 → 调用工具 → 读取模板。 Shared by both transports."""
    await session.initialize()                                        # 先握手 / handshake first

    result = await session.call_tool("add", {"a": 1.1, "b": 2.2})      # 调用工具 / call a tool
    print("add(1.1, 2.2) =", result.content[0].text)

    greeting = await session.read_resource("greeting://小花")          # 读取模板 / read a template
    print("greeting://小花 ->", greeting.contents[0].text)


async def remote():
    url = "http://127.0.0.1:8000/mcp"            # FastMCP 的 streamable-http 默认路径是 /mcp
    async with streamable_http_client(url) as (read, write, _):        # 拿到读写通道 / read & write streams
        async with ClientSession(read, write) as session:
            await use_session(session)


async def local():
    params = StdioServerParameters(              # 本地服务的启动参数 / how to start the local server
        command=sys.executable,                  # 用当前这个 Python / this same Python
        args=[str(HERE / "l20_local_mcp_server.py")],
    )
    async with stdio_client(params) as (read, write):                  # 这一步顺便启动了服务器子进程
        async with ClientSession(read, write) as session:
            await use_session(session)


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "local"
    asyncio.run(remote() if mode == "remote" else local())
