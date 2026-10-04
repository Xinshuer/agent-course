"""第 20 节练习（参考答案）：AgentScope 智能体通过工作空间使用 MCP 服务和 Skill——视频后半段的做法。
Lesson 20 exercise (solution): an AgentScope agent that uses an MCP server and a Skill through a workspace,
following the second half of the video.

流程 / Flow:
  1. MCP 配置：StdioMCPConfig 说明怎样启动本地服务器（远程服务器用 HttpMCPConfig）
     MCP config: StdioMCPConfig says how to start the local server (HttpMCPConfig for a remote one)
  2. MCP 客户端列表：可以放多个，但名字不能重复
     a list of MCP clients: several are allowed, but names must be unique
  3. 工作空间：把 MCP 客户端列表和技能文件夹交给 LocalWorkspace，然后 initialize()
     workspace: hand the MCP list and the skill folder to LocalWorkspace, then initialize()
  4. 工具箱：工作空间的内置工具 + MCP + 技能，一起交给智能体
     toolkit: the workspace's built-in tools + MCP + skills, all handed to the agent
  5. 循环 + 流式输出（第 15 节）
     a chat loop with streaming output (lesson 15)

试着问 / Try:
    你有哪些 MCP 工具？              What MCP tools do you have?
    用 MCP 工具算 1.1 + 2.2          Use the MCP tool to add 1.1 and 2.2
    你有哪些 skill？                 What skills do you have?
    写一篇 800 字左右的深海惊悚小故事  Write a ~500-word deep-sea thriller story
  小说文件会出现在 data\\l20_workspace\\ 里 / the story files appear under data\\l20_workspace\\
  输入 /exit 退出 / type /exit to quit

运行环境 / Environment: .venv （需要 DEEPSEEK_API_KEY / needs DEEPSEEK_API_KEY）
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l20_mcp_skill_solution.py
"""
import asyncio
import sys
from pathlib import Path

import agentscope
from agentscope.agent import Agent
from agentscope.credential import DeepSeekCredential
from agentscope.event import EventType
from agentscope.mcp import MCPClient, StdioMCPConfig
from agentscope.message import UserMsg
from agentscope.model import DeepSeekChatModel
from agentscope.permission import AdditionalWorkingDirectory, PermissionContext, PermissionMode
from agentscope.state import AgentState
from agentscope.tool import Toolkit
from agentscope.workspace import LocalWorkspace

from llm import API_KEY, MODEL

HERE = Path(__file__).parent
WORKDIR = HERE / "data" / "l20_workspace"                    # 工作空间的位置 / where the workspace lives
SKILL_DIR = HERE / "data" / "l20_skills" / "story-writer"     # 准备好的写小说技能 / the prepared skill

agentscope.setup_logger("WARNING")                            # 少打印框架日志 / fewer framework log lines


async def main():
    # 1. MCP 配置：本地服务器用 StdioMCPConfig（解释器 + 脚本位置）
    #    MCP config: StdioMCPConfig for a local server (the interpreter + the script)
    local_config = StdioMCPConfig(command=sys.executable, args=[str(HERE / "l20_local_mcp_server.py")])
    # 远程服务器：先运行 l20_remote_mcp_server.py，再改用下面这行（还要 import HttpMCPConfig）
    # Remote server: run l20_remote_mcp_server.py first, then use this line (and import HttpMCPConfig)
    # remote_config = HttpMCPConfig(url="http://127.0.0.1:8000/mcp")

    # 2. MCP 客户端列表：is_stateful=True 表示保持连接；多个客户端的 name 不能重复
    #    The MCP client list: is_stateful=True keeps the connection; names must not repeat
    mcp_clients = [
        MCPClient(name="local_mcp", is_stateful=True, mcp_config=local_config),
    ]

    # 3. 工作空间：交给它 MCP 列表和技能文件夹，再初始化
    #    The workspace: give it the MCP list and the skill folder, then initialize it
    workspace = LocalWorkspace(
        workdir=str(WORKDIR),
        default_mcps=mcp_clients,
        skill_paths=[str(SKILL_DIR)],   # 只在第一次创建工作空间时生效 / only takes effect when the workspace is first created
    )
    await workspace.initialize()
    try:
        # 4. 工具箱：内置文件工具（去掉命令行工具，这个演示用不到）+ MCP + 技能
        #    Toolkit: built-in file tools (minus the shell tool, not needed here) + MCP + skills
        tools = [t for t in await workspace.list_tools() if t.name not in ("PowerShell", "Bash")]
        mcps = await workspace.list_mcps()          # 工作空间负责连接 / the workspace connects them
        skills = await workspace.list_skills()
        print("MCP:", [m.name for m in mcps], "| skills:", [s.name for s in skills])
        toolkit = Toolkit(tools=tools, mcps=mcps, skills_or_loaders=skills)

        # 在工作空间里写文件自动放行（第 18 节的 ACCEPT_EDITS 模式）
        # Writing files inside the workspace is allowed automatically (ACCEPT_EDITS mode, lesson 18)
        permission = PermissionContext(
            mode=PermissionMode.ACCEPT_EDITS,
            working_directories={str(WORKDIR): AdditionalWorkingDirectory(path=str(WORKDIR), source="session")},
        )
        model = DeepSeekChatModel(credential=DeepSeekCredential(api_key=API_KEY), model=MODEL, stream=True)
        agent = Agent(
            name="Friday",
            system_prompt="你是一个乐于助人的中文助手。",
            model=model,
            toolkit=toolkit,
            offloader=workspace,                       # 系统提示词里会加上工作空间说明 / adds workspace instructions
            state=AgentState(permission_context=permission),
        )

        # 5. 循环 + 流式输出 / chat loop with streaming output
        while True:
            text = input("\n你 / You: ").strip()
            if not text:
                continue
            if text == "/exit":
                break
            print("Friday: ", end="", flush=True)
            async for event in agent.reply_stream(UserMsg(name="user", content=text)):
                if event.type == EventType.TEXT_BLOCK_DELTA:
                    print(event.delta, end="", flush=True)
                elif event.type == EventType.TOOL_CALL_START:
                    print(f"\n  [调用工具 / tool] {event.tool_call_name}", flush=True)
                elif event.type == EventType.REQUIRE_USER_CONFIRM:
                    print("\n  [需要批准，本练习不处理，见第 18 节 / needs approval, see lesson 18]")
            print()
    finally:
        await workspace.close()                       # 关闭工作空间里的 MCP 连接 / closes the MCP connections


if __name__ == "__main__":
    asyncio.run(main())
