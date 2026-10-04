"""第 18 节练习（TODO 版）：工作空间 + 三层权限 + 会自己检查权限的加法工具
Lesson 18 exercise (TODO version): workspace + three permission layers + an add tool that checks its own permission

补全 4 个 TODO（工具的检查方法、工具的执行方法、一条禁止规则、确认事件的处理）。
Complete the 4 TODOs (the tool's check method, its call method, one deny rule, handling the confirm event).

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l18_permission_todo.py
试试 / Try:  帮我算 3 + 4   ->   帮我算 20000 + 30000   ->   /exit
参考答案 / Solution: l18_permission_solution.py
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
MODE = PermissionMode.ACCEPT_EDITS


class AddTool(ToolBase):
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
    is_concurrency_safe = True
    is_read_only = False

    async def check_permissions(self, tool_input, context):
        a = tool_input.get("a")
        b = tool_input.get("b")
        # TODO 1: a 和 b 都大于 10000 时，返回 PermissionDecision(behavior=PermissionBehavior.ASK, message="...")；
        #         否则返回 behavior=PermissionBehavior.ALLOW 的 PermissionDecision
        #         If a and b are both above 10000 return an ASK decision, otherwise an ALLOW decision
        return PermissionDecision(behavior=PermissionBehavior.ALLOW, message="TODO")

    async def call(self, a: float, b: float) -> ToolChunk:
        # TODO 2: 算出 a + b，返回 ToolChunk(content=[TextBlock(text=...)], metadata={...})
        #         Compute a + b and return ToolChunk(content=[TextBlock(text=...)], metadata={...})
        return ToolChunk(content=[TextBlock(text="TODO")])


def make_permission_context() -> PermissionContext:
    allow_rules = {
        # 往工作空间里写 .txt 不用问。* 能跨文件夹，所以要带上文件夹名，只写 "*.txt" 会放行任何位置的 .txt
        # Writing .txt inside the workspace never asks. * crosses folders, so name the folder: a bare "*.txt" would match anywhere
        "Write": [PermissionRule(tool_name="Write", rule_content="*/l18_workspace/*.txt",
                                 behavior=PermissionBehavior.ALLOW, source="userSettings")],
    }
    # TODO 3: 写一条禁止规则：工具 "Read"，匹配 "*.env"，behavior 用 PermissionBehavior.DENY，source="userSettings"
    #         A deny rule: tool "Read", pattern "*.env", behavior PermissionBehavior.DENY, source "userSettings"
    deny_rules = {}
    ask_rules = {
        "Edit": [PermissionRule(tool_name="Edit", rule_content="",
                                behavior=PermissionBehavior.ASK, source="userSettings")],
    }
    return PermissionContext(mode=MODE, allow_rules=allow_rules, deny_rules=deny_rules, ask_rules=ask_rules)


def ask_user(tool_call) -> ConfirmResult:
    print(f"\n[需要确认 / confirm] {tool_call.name}  {tool_call.input}")
    answer = input("允许吗？ y=允许 allow / n=拒绝 deny: ").strip().lower()
    return ConfirmResult(confirmed=(answer == "y"), tool_call=tool_call)


async def main():
    workspace = LocalWorkspace(workdir=str(WORKDIR))
    await workspace.initialize()
    tools = await workspace.list_tools()
    tools.append(AddTool())
    os.chdir(WORKDIR)

    model = DeepSeekChatModel(credential=DeepSeekCredential(api_key=API_KEY), model=MODEL, stream=True)
    agent = Agent(
        name="Friday",
        system_prompt="你是一个助手。做加法时一定调用 add 工具；文件只在工作空间里操作。回答简洁。",
        model=model,
        toolkit=Toolkit(tools=tools),
        offloader=workspace,
        state=AgentState(permission_context=make_permission_context()),
    )

    confirm = None
    while True:
        if confirm is None:
            text = input("\n你 / You: ").strip()
            if text == "/exit":
                break
            if not text:
                continue
            inputs = UserMsg(name="user", content=text)
        else:
            inputs = confirm
            confirm = None

        print("Friday: ", end="", flush=True)
        async for event in agent.reply_stream(inputs):
            if event.type == EventType.REQUIRE_USER_CONFIRM:
                # TODO 4: 对 event.tool_calls 里的每个调用执行 ask_user，结果放进列表 results；
                #         再把 confirm 设为 UserConfirmResultEvent(reply_id=event.reply_id, confirm_results=results)
                #         Run ask_user for every call in event.tool_calls, collect the results,
                #         then set confirm = UserConfirmResultEvent(reply_id=event.reply_id, confirm_results=results)
                pass
            elif event.type == EventType.TEXT_BLOCK_DELTA:
                print(event.delta, end="", flush=True)
        print()

    await workspace.close()


if __name__ == "__main__":
    asyncio.run(main())
