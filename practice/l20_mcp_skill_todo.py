"""第 20 节练习：AgentScope 智能体通过工作空间使用 MCP 服务和 Skill（按 TODO 补全）。
Lesson 20 exercise: an AgentScope agent that uses an MCP server and a Skill through a workspace (fill in the TODOs).

参考答案 / Solution: l20_mcp_skill_solution.py
补全后试着问 / When done, try:
    你有哪些 MCP 工具？ / 用 MCP 工具算 1.1 + 2.2 / 你有哪些 skill？ / 写一篇 800 字左右的深海惊悚小故事
小提示 / Hint: 如果打印出来的 skills 是空列表，删掉 data\\l20_workspace 文件夹再运行
    (if the printed skills list is empty, delete the data\\l20_workspace folder and run again)

运行环境 / Environment: .venv （需要 DEEPSEEK_API_KEY / needs DEEPSEEK_API_KEY）
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l20_mcp_skill_todo.py
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
WORKDIR = HERE / "data" / "l20_workspace"
SKILL_DIR = HERE / "data" / "l20_skills" / "story-writer"

agentscope.setup_logger("WARNING")


async def main():
    # TODO 1: 用 StdioMCPConfig 配置本地服务器：command=sys.executable，args 里放 l20_local_mcp_server.py 的路径
    #         Configure the local server with StdioMCPConfig: command=sys.executable, args = the server script path
    local_config = ...

    # TODO 2: 建一个 MCP 客户端列表，里面放一个 MCPClient（name="local_mcp"，is_stateful=True）
    #         Build a list holding one MCPClient (name="local_mcp", is_stateful=True)
    mcp_clients = ...

    # TODO 3: 创建 LocalWorkspace（workdir、default_mcps、skill_paths），然后 await 初始化
    #         Create a LocalWorkspace (workdir, default_mcps, skill_paths), then await initialize()
    workspace = ...

    try:
        # TODO 4: 从工作空间取出 tools（去掉 PowerShell / Bash）、mcps、skills，放进 Toolkit
        #         Get tools (without PowerShell / Bash), mcps and skills from the workspace; build a Toolkit
        toolkit = ...

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
            offloader=workspace,
            state=AgentState(permission_context=permission),
        )

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
            print()
    finally:
        # TODO 5: 关闭工作空间（它会关掉 MCP 连接）/ close the workspace (it closes the MCP connections)
        pass


if __name__ == "__main__":
    asyncio.run(main())
