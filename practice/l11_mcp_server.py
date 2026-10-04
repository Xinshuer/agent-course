"""第 11 节：一个最小的 MCP 服务器（stdio 方式），提供「查询目录」的工具（和视频里的例子一样）
Lesson 11: a minimal MCP server (stdio transport) with a "look inside a folder" tool, like the video's example

工具 / Tool:
    list_files(directory=".")：列出一个文件夹里有多少个文件、多少个子文件夹，以及它们的名字
    list_files(directory="."): how many files and sub-folders a folder holds, plus their names

运行环境 / Environment: .venv  (mcp 1.30.0)；不需要任何 key / no key needed
怎么用 / How to use it:
    不需要单独运行！l11_mcp_solution.py 会把它当作「子进程」自动启动，用标准输入/输出和它通信。
    You don't run it yourself: l11_mcp_solution.py starts it as a subprocess and talks to it over stdin/stdout.
    如果直接运行它（cd practice
    然后 & ..\\.venv\\Scripts\\python.exe l11_mcp_server.py），
    它会一直「卡住」不动 —— 它在等客户端发消息，这是正常的。按 Ctrl+C 退出。
    Running it directly looks like it "hangs": it is waiting for a client. Press Ctrl+C to quit.

注意 / Note:
    stdio 服务器里不要用 print() 打印到标准输出 —— 标准输出是和客户端通信的通道，乱打印会破坏协议。
    Never print() to stdout in a stdio server: stdout carries the protocol messages.
"""
from pathlib import Path

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("file-tools", log_level="WARNING")  # 服务器名字；只显示警告以上的日志 / server name; log warnings only

MAX_NAMES = 40  # 名字最多列出 40 个，免得太长 / list at most 40 names to keep the reply short


@mcp.tool()  # 注意要带括号 / note the parentheses
def list_files(directory: str = ".") -> str:
    """列出一个文件夹里的文件和子文件夹，并给出数量。directory 是文件夹路径，默认 "." 表示当前目录。"""
    folder = Path(directory)
    if not folder.is_dir():
        return f"找不到文件夹：{directory}"
    files = sorted([p.name for p in folder.iterdir() if p.is_file()])
    folders = sorted([p.name for p in folder.iterdir() if p.is_dir()])
    lines = [
        f"文件夹 {folder.resolve()}：{len(files)} 个文件，{len(folders)} 个子文件夹。",
        "子文件夹：" + "、".join(folders),
        "文件（最多列出 40 个）：" + "、".join(files[:MAX_NAMES]),
    ]
    return "\n".join(lines)


if __name__ == "__main__":
    mcp.run()  # 默认 transport="stdio"：通过标准输入/输出通信 / default transport is stdio
