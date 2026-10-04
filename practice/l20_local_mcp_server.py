"""第 20 节：本地（stdio）MCP 服务器——和视频里的 local 版一样，提供一个加法工具和一个问候模板。
Lesson 20: a local (stdio) MCP server, like the video's local version: one add tool and one greeting template.

这个文件不用自己运行：客户端（l20_mcp_client_test.py 或 AgentScope）会把它当作子进程启动，
通过标准输入输出和它对话。
You don't run this file yourself: the client (l20_mcp_client_test.py or AgentScope) starts it as a
subprocess and talks to it over stdin/stdout.

运行环境 / Environment: .venv ；不需要任何 key / no key needed
测试 / Test:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l20_mcp_client_test.py local
"""
from urllib.parse import unquote

from mcp.server.fastmcp import FastMCP
from mcp.types import ToolAnnotations

# 本地版只需要一个名字，不需要网址和端口 / the local version only needs a name, no host or port
mcp = FastMCP("local_mcp", log_level="WARNING")


# readOnlyHint=True：告诉客户端「这个工具只读、没有副作用」。
# AgentScope 2.0.9 只会自动放行带这个标记的 MCP 工具，否则会停下来等用户批准。
# readOnlyHint=True tells clients "read-only, no side effects". AgentScope 2.0.9 only
# auto-allows MCP tools with this mark; others pause and wait for the user's approval.
@mcp.tool(annotations=ToolAnnotations(readOnlyHint=True))
def add(a: float, b: float) -> float:
    """Add two numbers and return the sum. / 两个数相加，返回和。"""
    return round(a + b, 10)          # round：避免 1.1 + 2.2 显示成 3.3000000000000003


# 资源模板：{name} 的位置填什么，就会作为参数 name 传进函数
# A resource template: whatever fills {name} is passed to the function as name
@mcp.resource("greeting://{name}")
def get_greeting(name: str) -> str:
    """Return a greeting for name. / 返回一句问候。"""
    name = unquote(name)             # 中文在网址里会被编码成 %E5%B0%8F...，先解码回来
    return f"你好，{name}！"


if __name__ == "__main__":
    mcp.run(transport="stdio")       # stdio：通过标准输入输出和客户端通信
