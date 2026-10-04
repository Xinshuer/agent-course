"""第 22 节练习：把图像编辑与视频生成助手组装起来（按 TODO 补全 main 函数）。
Lesson 22 exercise: assemble the image editing & video generation assistant (fill in the TODOs in main).

已经写好、直接导入的部分 / ready-made parts you import:
    l22_mcp_server.py   图像生成 MCP 服务 / the image generation MCP server
    l22_my_tool.py      read_image + VideoGenerate
    data\\l22_skills\\   image-prompt、video-prompt 两个技能 / the two skills
参考答案 / Solution: l22_media_assistant_solution.py
没有 DASHSCOPE_API_KEY 时是演练模式 / dry-run mode without DASHSCOPE_API_KEY

运行环境 / Environment: .venv （需要 DEEPSEEK_API_KEY / needs DEEPSEEK_API_KEY）
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l22_media_assistant_todo.py
"""
import asyncio
import os
import sys
from pathlib import Path

import agentscope
from agentscope.agent import Agent
from agentscope.credential import DeepSeekCredential
from agentscope.event import EventType
from agentscope.formatter import DeepSeekChatFormatter
from agentscope.mcp import MCPClient, StdioMCPConfig
from agentscope.message import UserMsg
from agentscope.model import DeepSeekChatModel
from agentscope.permission import (
    AdditionalWorkingDirectory,
    PermissionBehavior,
    PermissionContext,
    PermissionMode,
    PermissionRule,
)
from agentscope.state import AgentState
from agentscope.tool import FunctionTool, Toolkit
from agentscope.workspace import LocalWorkspace

from l22_my_tool import VideoGenerate, read_image
from llm import API_KEY, MODEL

HERE = Path(__file__).parent
WORKDIR = HERE / "data" / "l22_workspace"
OUTPUT_DIR = WORKDIR / "output"
SKILL_DIRS = [HERE / "data" / "l22_skills" / "image-prompt", HERE / "data" / "l22_skills" / "video-prompt"]
DASHSCOPE_KEY = os.environ.get("DASHSCOPE_API_KEY")

SYSTEM_PROMPT = f"""你是一个图像编辑与视频生成助手。
- 生成图片或视频之前，先用 Skill 工具读对应的技能：图片读 image-prompt，视频读 video-prompt。
- 所有图片和视频都保存到 {OUTPUT_DIR} 里，文件名用英文，图片以 .jpg 结尾，视频以 .mp4 结尾。
- 生成或修改图片后，用 read_image 看一眼，确认符合要求，再告诉用户文件位置。"""
if not DASHSCOPE_KEY:
    SYSTEM_PROMPT += "\n- 现在是演练模式：生成结果都是占位图 / 占位动图。看到占位图就当作生成成功，继续后面的步骤，不要停下来。"

agentscope.setup_logger("WARNING")


async def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # TODO 1: 用 StdioMCPConfig 配置 l22_mcp_server.py（command=sys.executable），
    #         有百炼 key 时通过 env={"DASHSCOPE_API_KEY": ...} 传进去；再放进一个 MCPClient 列表（name="image_mcp"）
    # Configure l22_mcp_server.py with StdioMCPConfig; pass the Bailian key via env when it exists;
    # put it into a list with one MCPClient (name="image_mcp")
    mcp_clients = ...

    # TODO 2: 创建 LocalWorkspace（workdir、default_mcps、skill_paths），并 await 初始化
    #         Create a LocalWorkspace (workdir, default_mcps, skill_paths) and await initialize()
    workspace = ...

    try:
        # TODO 3: tools = 工作空间默认工具（去掉 PowerShell / Bash）+ VideoGenerate() + FunctionTool(read_image, is_read_only=True)
        #         再建 Toolkit：tools、mcps=await workspace.list_mcps()、skills_or_loaders=await workspace.list_skills()
        # tools = workspace defaults (minus the shell) + VideoGenerate() + FunctionTool(read_image, ...); then a Toolkit
        toolkit = ...

        # TODO 4: 建一个能接收图片的格式化器：DeepSeekChatFormatter(input_types=["text/plain", "image/jpeg", "image/png"])
        #         并在 DeepSeekChatModel(...) 里用 formatter= 传进去（stream=True）
        # A formatter that accepts images, passed to DeepSeekChatModel(..., formatter=...)
        model = ...

        image_tool = "mcp__image_mcp__generate_image"
        permission = PermissionContext(
            mode=PermissionMode.ACCEPT_EDITS,
            working_directories={str(WORKDIR): AdditionalWorkingDirectory(path=str(WORKDIR), source="session")},
            allow_rules={image_tool: [PermissionRule(tool_name=image_tool, rule_content=None,
                                                     behavior=PermissionBehavior.ALLOW, source="me")]},
        )
        agent = Agent(
            name="Artist",
            system_prompt=SYSTEM_PROMPT,
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
            print("Artist: ", end="", flush=True)
            async for event in agent.reply_stream(UserMsg(name="user", content=text)):
                if event.type == EventType.TEXT_BLOCK_DELTA:
                    print(event.delta, end="", flush=True)
                elif event.type == EventType.TOOL_CALL_START:
                    print(f"\n  [调用工具 / tool] {event.tool_call_name}", flush=True)
            print()
    finally:
        await workspace.close()


if __name__ == "__main__":
    asyncio.run(main())
