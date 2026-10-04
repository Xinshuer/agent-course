"""第 20 节：远程（streamable-http）MCP 服务器——和视频里的 remote 版一样：加法工具 + 问候模板。
Lesson 20: a remote (streamable-http) MCP server, like the video's remote version: add tool + greeting template.

远程版是一个独立运行的网络服务：要先在一个终端里把它启动起来，并保持运行，
再在另一个终端里运行客户端。
The remote version is a separate network service: start it in one terminal and keep it running,
then run the client in a second terminal.

运行环境 / Environment: .venv ；不需要任何 key / no key needed
运行 / Run (终端 1 / terminal 1):
    cd practice
    & ..\\.venv\\Scripts\\python.exe l20_remote_mcp_server.py
测试 / Test (终端 2 / terminal 2):
    & ..\\.venv\\Scripts\\python.exe l20_mcp_client_test.py remote
按 Ctrl+C 停止服务器 / press Ctrl+C to stop the server
"""
from urllib.parse import unquote

from mcp.server.fastmcp import FastMCP
from mcp.types import ToolAnnotations

# 远程版：名字 + 地址 + 端口。视频里写的是 0.0.0.0（同一局域网的其他电脑也能连），
# 自己练习用 127.0.0.1（只有本机能连）更安全。
# Remote version: name + host + port. The video uses 0.0.0.0 (other computers on the network
# can connect); 127.0.0.1 (this computer only) is safer for practice.
mcp = FastMCP("remote_mcp", host="127.0.0.1", port=8000, log_level="WARNING")


@mcp.tool(annotations=ToolAnnotations(readOnlyHint=True))
def add(a: float, b: float) -> float:
    """Add two numbers and return the sum. / 两个数相加，返回和。"""
    return round(a + b, 10)


@mcp.resource("greeting://{name}")
def get_greeting(name: str) -> str:
    """Return a greeting for name. / 返回一句问候。"""
    return f"你好，{unquote(name)}！"


if __name__ == "__main__":
    print("MCP 服务器已启动 / server running: http://127.0.0.1:8000/mcp  (Ctrl+C 停止 / to stop)")
    mcp.run(transport="streamable-http")   # 远程连接方式 / the remote transport
