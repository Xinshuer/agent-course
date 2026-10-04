"""第 18 节练习参考答案：工作空间 + 三层权限 + 会自己检查权限的加法工具（对应视频 13:03 起的完整代码）
Lesson 18 solution: workspace + three permission layers + an add tool that checks its own permission
(the full program the video builds from 13:03)

三层权限 / The three layers:
1. 全局模式 MODE（默认 ACCEPT_EDITS）                          global mode (ACCEPT_EDITS by default)
2. 精细化规则：工作空间里写 .txt 直接允许、读 .env 一律拒绝、Edit 必须问   fine-grained rules
3. 工具自己的 check_permissions：两个数都大于 1 万才要确认       the tool's own check

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l18_permission_solution.py
试试 / Try:
    帮我算 3 + 4              -> 直接执行 / runs straight away
    帮我算 20000 + 30000      -> 工具要求确认，输入 y 或 n / the tool asks: type y or n
    /exit                     -> 退出 / quit
    再把下面的 MODE 改成 PermissionMode.DEFAULT，或把 DENY_ADD 改成 True，重跑对比（视频 15:46 起的测试）
    Then set MODE = PermissionMode.DEFAULT or DENY_ADD = True and run again (the video's tests from 15:46)
工作空间 / workspace: practice\\data\\l18_workspace\\
"""
import asyncio
import os
from pathlib import Path

from agentscope.agent import Agent
from agentscope.credential import DeepSeekCredential
from agentscope.event import ConfirmResult, EventType, UserConfirmResultEvent
from agentscope.message import TextBlock, UserMsg
from agentscope.model import DeepSeekChatModel
from agentscope.permission import (
    PermissionBehavior,
    PermissionContext,
    PermissionDecision,
    PermissionMode,
    PermissionRule,
)
from agentscope.state import AgentState
from agentscope.tool import ToolBase, ToolChunk, Toolkit
from agentscope.workspace import LocalWorkspace

from llm import API_KEY, MODEL

WORKDIR = Path(__file__).parent / "data" / "l18_workspace"
# 视频第 1 次测试改成 DEFAULT：命令、写文件都先问（加法仍由工具自己的检查决定）
# test 1: DEFAULT - commands and writes ask first (the add call is still settled by the tool's own check)
MODE = PermissionMode.ACCEPT_EDITS
DENY_ADD = False                     # 视频第 2 次测试改成 True：add 进拒绝规则 / test 2: put add into the deny rules


class AddTool(ToolBase):
    """一个会自己检查权限的加法工具（视频 09:55 起）。 An add tool that checks its own permission."""

    name = "add"
    description = "计算两个数的和。Add two numbers."
    input_schema = {
        "type": "object",
        "properties": {
            "a": {"type": "number", "description": "第一个数字 / the first number"},
            "b": {"type": "number", "description": "第二个数字 / the second number"},
        },
        "required": ["a", "b"],
    }
    is_concurrency_safe = True  # 可以和别的工具调用同时执行 / may run alongside other tool calls
    is_read_only = False        # 写 True 的话 check_permissions 根本不会被调用 / True would skip check_permissions

    async def check_permissions(self, tool_input, context):
        """调用前由框架自动执行：返回允许、拒绝或询问。 Runs before every call: allow, deny or ask."""
        a = tool_input.get("a")
        b = tool_input.get("b")
        if isinstance(a, (int, float)) and isinstance(b, (int, float)) and a > 10000 and b > 10000:
            return PermissionDecision(
                behavior=PermissionBehavior.ASK,
                message=f"两个数 {a} 和 {b} 都大于 1 万，确认要计算吗？/ Both numbers exceed 10000 - confirm?",
            )
        return PermissionDecision(behavior=PermissionBehavior.ALLOW, message="加法操作已允许 / addition allowed")

    async def call(self, a: float, b: float) -> ToolChunk:
        """真正干活的方法。 The method that does the work."""
        result = a + b
        return ToolChunk(
            content=[TextBlock(text=f"{a} + {b} = {result}")],     # 交给模型看的文字 / text for the model
            metadata={"input": {"a": a, "b": b}, "result": result},  # 留给程序用的数据 / data for your code
        )


def make_permission_context() -> PermissionContext:
    """全局模式 + 精细化规则（视频 06:45 起）。 Global mode + fine-grained rules."""
    allow_rules = {
        # 往工作空间里写 .txt 不用问。* 能跨文件夹，所以要带上文件夹名，只写 "*.txt" 会放行任何位置的 .txt
        # Writing .txt inside the workspace never asks. * crosses folders, so name the folder: a bare "*.txt" would match anywhere
        "Write": [PermissionRule(tool_name="Write", rule_content="*/l18_workspace/*.txt",
                                 behavior=PermissionBehavior.ALLOW, source="userSettings")],
    }
    deny_rules = {
        "Read": [PermissionRule(tool_name="Read", rule_content="*.env",
                                behavior=PermissionBehavior.DENY, source="userSettings")],
    }
    if DENY_ADD:
        deny_rules["add"] = [PermissionRule(tool_name="add", rule_content="",
                                            behavior=PermissionBehavior.DENY, source="userSettings")]
    ask_rules = {
        # rule_content 写空字符串 = 这个工具的所有调用 / an empty rule_content matches every call
        "Edit": [PermissionRule(tool_name="Edit", rule_content="",
                                behavior=PermissionBehavior.ASK, source="userSettings")],
    }
    return PermissionContext(mode=MODE, allow_rules=allow_rules, deny_rules=deny_rules, ask_rules=ask_rules)


def ask_user(tool_call) -> ConfirmResult:
    """在终端里问用户：允许这次工具调用吗？ Ask in the terminal whether to allow this tool call."""
    print(f"\n[需要确认 / confirm] {tool_call.name}  {tool_call.input}")
    answer = input("允许吗？ y=允许 allow / n=拒绝 deny: ").strip().lower()
    return ConfirmResult(confirmed=(answer == "y"), tool_call=tool_call)


async def main():
    # 1. 工作空间：创建 → initialize → 拿到内置工具（视频 01:34 起）/ workspace: create, initialize, list tools
    workspace = LocalWorkspace(workdir=str(WORKDIR))
    await workspace.initialize()
    tools = await workspace.list_tools()  # PowerShell(Windows)/Bash, Edit, Glob, Grep, Read, Write
    tools.append(AddTool())               # 再加上自己的工具 / plus our own tool
    # ACCEPT_EDITS 也信任「当前目录」，所以切换到工作空间里，边界就是工作空间
    # ACCEPT_EDITS also trusts the current directory, so move into the workspace
    os.chdir(WORKDIR)

    # 2. 模型 + Agent：工作空间交给 offloader，权限上下文放进 AgentState / model + agent
    model = DeepSeekChatModel(credential=DeepSeekCredential(api_key=API_KEY), model=MODEL, stream=True)
    agent = Agent(
        name="Friday",
        system_prompt="你是一个助手。做加法时一定调用 add 工具；文件只在工作空间里操作。回答简洁。",
        model=model,
        toolkit=Toolkit(tools=tools),
        offloader=workspace,
        state=AgentState(permission_context=make_permission_context()),
    )
    print("模式 / mode:", MODE.value, "| DENY_ADD:", DENY_ADD, "| /exit 退出 quit")

    # 3. 对话循环：遇到「请确认」事件就问用户（视频 14:08 起）/ chat loop: ask the user on a confirm event
    confirm = None
    while True:
        if confirm is None:                     # 没有待交回的确认：读用户的新消息 / nothing to hand back
            text = input("\n你 / You: ").strip()
            if text == "/exit":
                break
            if not text:
                continue
            inputs = UserMsg(name="user", content=text)
        else:                                   # 有待交回的确认：这一轮把它交回去 / hand the confirmation back
            inputs = confirm
            confirm = None

        print("Friday: ", end="", flush=True)
        async for event in agent.reply_stream(inputs):
            if event.type == EventType.REQUIRE_USER_CONFIRM:
                results = []
                for tool_call in event.tool_calls:
                    results.append(ask_user(tool_call))
                confirm = UserConfirmResultEvent(reply_id=event.reply_id, confirm_results=results)
            elif event.type == EventType.TEXT_BLOCK_DELTA:
                print(event.delta, end="", flush=True)
        print()

    await workspace.close()


if __name__ == "__main__":
    asyncio.run(main())
