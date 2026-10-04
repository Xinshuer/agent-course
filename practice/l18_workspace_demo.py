"""第 18 节演示：LocalWorkspace + 内置文件工具 + 权限模式与规则
Lesson 18 demo: LocalWorkspace + built-in file tools + permission modes and rules

- 工作空间目录 / workspace folder: practice\\data\\l18_workspace\\
- 模式 ACCEPT_EDITS：工作空间里的写入/编辑自动放行；读取（Read/Glob/Grep）本来就放行；
  PowerShell 命令仍然每次都问你。
  ACCEPT_EDITS: writes/edits inside the workspace are auto-allowed; reads are always allowed;
  PowerShell commands still ask every time.
- 规则：禁止读取任何 .env 文件（deny 规则优先级最高）。
  Rule: reading any .env file is denied (deny rules win over everything).

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l18_workspace_demo.py
试试 / Try:
    在工作空间里新建 hello.txt，内容写「你好，AgentScope」      (自动放行 / auto-allowed)
    用 PowerShell 列出工作空间里的文件                          (会问你 / asks you)
    读取工作空间里的 secret.env                                 (被规则拒绝 / denied by the rule)
"""
import asyncio
import os
from pathlib import Path

from agentscope.agent import Agent
from agentscope.event import ConfirmResult, UserConfirmResultEvent
from agentscope.message import UserMsg
from agentscope.permission import (
    AdditionalWorkingDirectory,
    PermissionBehavior,
    PermissionContext,
    PermissionMode,
    PermissionRule,
)
from agentscope.state import AgentState
from agentscope.tool import Toolkit
from agentscope.workspace import LocalWorkspace

WORKDIR = Path(__file__).parent / "data" / "l18_workspace"


def make_model():
    from agentscope.credential import DeepSeekCredential
    from agentscope.model import DeepSeekChatModel

    from llm import API_KEY, MODEL

    return DeepSeekChatModel(credential=DeepSeekCredential(api_key=API_KEY), model=MODEL, stream=False)


def ask_user(tool_call) -> ConfirmResult:
    print(f"\n[需要确认 / confirm] {tool_call.name}  {tool_call.input}")
    answer = input("允许吗？ y=允许 allow / n=拒绝 deny: ").strip().lower()
    return ConfirmResult(confirmed=(answer == "y"), tool_call=tool_call)


async def chat(agent: Agent, text: str):
    reply = await agent.reply(UserMsg(name="user", content=text))
    while True:
        pending = agent.state.get_awaiting_tool_calls(agent.name)
        if not pending:
            return reply
        results = [ask_user(tc) for tc in pending]
        reply = await agent.reply(UserConfirmResultEvent(reply_id=agent.state.reply_id, confirm_results=results))


async def main(model=None):
    WORKDIR.mkdir(parents=True, exist_ok=True)
    (WORKDIR / "secret.env").write_text("API_KEY=demo-not-a-real-key\n", encoding="utf-8")
    # ACCEPT_EDITS 也会信任「当前目录」，所以先切换到工作空间里，边界才是工作空间
    # ACCEPT_EDITS also trusts the current directory, so move into the workspace first
    os.chdir(WORKDIR)

    async with LocalWorkspace(workdir=str(WORKDIR)) as workspace:
        tools = await workspace.list_tools()  # PowerShell(Windows)/Bash, Edit, Glob, Grep, Read, Write
        print("工作空间 / workspace:", workspace.workdir)
        print("内置工具 / tools:", [t.name for t in tools])

        state = AgentState(permission_context=PermissionContext(
            mode=PermissionMode.ACCEPT_EDITS,
            working_directories={
                str(WORKDIR): AdditionalWorkingDirectory(path=str(WORKDIR), source="session"),
            },
            deny_rules={
                "Read": [PermissionRule(tool_name="Read", rule_content="*.env",
                                        behavior=PermissionBehavior.DENY, source="demo")],
            },
        ))
        agent = Agent(
            name="Friday",
            system_prompt="你是一个文件助手，只在工作空间里操作文件，回答简洁。",
            model=model or make_model(),
            toolkit=Toolkit(tools=tools),
            state=state,
            offloader=workspace,  # 系统提示词里会自动加入工作空间说明 / adds workspace instructions to the prompt
        )
        print("开始 / Start (/exit 退出 quit)")
        while True:
            text = input("\n你 / You: ").strip()
            if not text:
                continue
            if text == "/exit":
                break
            reply = await chat(agent, text)
            print("Friday:", reply.get_text_content())
        print("工作空间里的文件 / files:", sorted(os.listdir(WORKDIR)))


if __name__ == "__main__":
    asyncio.run(main())
