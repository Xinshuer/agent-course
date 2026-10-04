"""第 22 节练习（参考答案）：图像编辑与视频生成助手（视频里的 main.py）。
Lesson 22 exercise (solution): the image editing & video generation assistant (the video's main.py).

结构 / Structure:
  - MCP 服务 / MCP server   l22_mcp_server.py   generate_image：生成 / 修改图片（万相 wan2.7-image-pro）
  - 工具箱里的工具 / tools    l22_my_tool.py      read_image（看图）+ VideoGenerate（万相 wan2.7-r2v 生成视频）
  - 两个技能 / two skills    data\\l22_skills\\   image-prompt（图像提示词）、video-prompt（视频提示词 + 流程）
  - 工作空间 / workspace     data\\l22_workspace\\ 生成的图片和视频在 output 文件夹里

没有 DASHSCOPE_API_KEY（阿里云百炼的 key）时自动进入演练模式：生成占位图和 GIF，不联网、不花钱；
DeepSeek（deepseek-flash 能看图）照样负责理解需求、写提示词、看图检查。
Without DASHSCOPE_API_KEY (a Bailian key) it runs in dry-run mode: placeholder images and a GIF, offline and free;
DeepSeek (deepseek-flash can see images) still understands requests, writes prompts and checks the images.

试着说 / Try:
    画一张骑士骑马的图          Draw a knight riding a horse
    把骑士的头盔换成黑色高礼帽   Replace the knight's helmet with a black top hat
    生成一段视频：戴高礼帽的猫在赛博朋克城市里散步   Make a video: a cat in a top hat walking in a cyberpunk city
  输入 /exit 退出 / type /exit to quit

运行环境 / Environment: .venv
需要 / Needs: DEEPSEEK_API_KEY；可选 / optional: DASHSCOPE_API_KEY（真实生成，按量收费 / real generation, paid）
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l22_media_assistant_solution.py
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

from l22_my_tool import VideoGenerate, read_image      # 我们自己写的两个工具 / our two tools
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
if not DASHSCOPE_KEY:          # 演练模式：告诉模型占位图也算成功，流程才能走完 / placeholders count as success
    SYSTEM_PROMPT += "\n- 现在是演练模式：生成结果都是占位图 / 占位动图。看到占位图就当作生成成功，继续后面的步骤，不要停下来。"

agentscope.setup_logger("WARNING")


async def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # 1. MCP 配置：Python 脚本 l22_mcp_server.py。stdio 子进程默认不继承你的环境变量，
    #    所以百炼 key 要通过 env 传进去（没有 key 就不传，服务器会走演练模式）
    #    MCP config. A stdio subprocess does not inherit your environment variables by default,
    #    so pass the Bailian key through env (no key -> nothing passed -> dry-run mode)
    mcp_config = StdioMCPConfig(
        command=sys.executable,
        args=[str(HERE / "l22_mcp_server.py")],
        env={"DASHSCOPE_API_KEY": DASHSCOPE_KEY} if DASHSCOPE_KEY else None,
    )
    mcp_clients = [MCPClient(name="image_mcp", is_stateful=True, mcp_config=mcp_config)]

    # 2. 工作空间：MCP 客户端列表 + 两个技能 / workspace: the MCP list + two skills
    workspace = LocalWorkspace(
        workdir=str(WORKDIR),
        default_mcps=mcp_clients,
        skill_paths=[str(p) for p in SKILL_DIRS],
    )
    await workspace.initialize()
    try:
        # 3. 工具：工作空间的默认工具（去掉命令行）+ 我们的两个工具
        #    tools: the workspace defaults (without the shell) + our two tools
        tools = [t for t in await workspace.list_tools() if t.name not in ("PowerShell", "Bash")]
        tools = tools + [VideoGenerate(), FunctionTool(read_image, is_read_only=True)]   # 函数要用 FunctionTool 包一下
        toolkit = Toolkit(
            tools=tools,
            mcps=await workspace.list_mcps(),                  # 图像生成 MCP / the image MCP
            skills_or_loaders=await workspace.list_skills(),   # 两个技能 / the two skills
        )

        # 4. 模型：DeepSeek 的格式化器默认只发文字，要声明图片类型，read_image 的图才能交给模型
        #    model: DeepSeek's formatter sends text only by default; list image types so read_image works
        formatter = DeepSeekChatFormatter(input_types=["text/plain", "image/jpeg", "image/png"])
        model = DeepSeekChatModel(
            credential=DeepSeekCredential(api_key=API_KEY), model=MODEL, stream=True, formatter=formatter,
        )

        # 5. 权限：MCP 的生图工具不是只读的，用一条允许规则放行；工作空间里写文件也放行（第 18 节）
        #    permissions: allow the (non read-only) MCP image tool with a rule; allow edits in the workspace
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

        print("演练模式 / dry-run mode" if not DASHSCOPE_KEY else "真实模式：会调用万相并产生费用 / real mode (paid)")
        # 6. 循环 + 流式输出（和第 20 节一样）/ chat loop with streaming output (as in lesson 20)
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
                elif event.type == EventType.REQUIRE_USER_CONFIRM:
                    print("\n  [需要批准，本练习不处理，见第 18 节 / needs approval, see lesson 18]")
            print()
    finally:
        await workspace.close()


if __name__ == "__main__":
    asyncio.run(main())
