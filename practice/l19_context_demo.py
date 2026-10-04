"""第 19 节演示：工具结果截断 + 卸载，以及上下文压缩成摘要（ContextConfig + LocalWorkspace）
Lesson 19 demo: truncating + offloading a huge tool result, and compressing the context into a summary

流程 / Flow (约 4 次模型调用 / about 4 model calls):
1. 让 Agent 读一份很长的日志 -> 上下文里只留开头，超过 tool_result_limit 的部分被截掉并存进工作空间的文件
   The agent reads a long log -> only the beginning stays in the context; the part beyond tool_result_limit is cut and saved to a file
2. 手动调用 agent.compress_context(...)，把旧消息压缩成摘要（平时 Agent 会在每次推理前自动检查）
   Call agent.compress_context(...) by hand to summarise old messages (normally automatic)
3. 再提问，看 Agent 能否靠摘要回答
   Ask again and see the agent answer from the summary

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l19_context_demo.py
输出文件 / Output: practice\\data\\l19_workspace\\sessions\\<session_id>\\
"""
import asyncio
from pathlib import Path

from agentscope.agent import Agent, ContextConfig
from agentscope.message import UserMsg
from agentscope.tool import FunctionTool, Toolkit
from agentscope.workspace import LocalWorkspace

WORKDIR = Path(__file__).parent / "data" / "l19_workspace"


def make_model():
    from agentscope.credential import DeepSeekCredential
    from agentscope.model import DeepSeekChatModel

    from llm import API_KEY, MODEL

    # context_size 告诉框架「模型一次能读多少 token」，压缩阈值按它计算
    # context_size tells the framework how many tokens the model can read; thresholds are based on it
    return DeepSeekChatModel(credential=DeepSeekCredential(api_key=API_KEY), model=MODEL,
                             stream=False, context_size=8000)


def read_server_log() -> str:
    """读取今天的服务器日志（内容很长）。"""
    lines = []
    for i in range(1, 301):
        level = "ERROR" if i in (7, 250) else "INFO"
        lines.append(f"{i:03d} {level} request handled in {i % 7 + 1}ms")
    return "\n".join(lines)


def show(agent: Agent, title: str) -> None:
    summary = "有 yes" if agent.state.summary else "无 no"
    print(f"  [{title}] context: {len(agent.state.context)} 条消息 messages | summary: {summary}")


async def main(model=None):
    config = ContextConfig(
        trigger_ratio=0.8,       # 超过 context_size 的 80% 自动压缩 / auto-compress above 80%
        reserve_ratio=0.1,       # 压缩时原样保留最近约 context_size×10% 个 token / keep ~10% of context_size verbatim
        tool_result_limit=300,   # 单个工具结果最多 300 token，多的截掉 / cut tool results above 300 tokens
    )
    async with LocalWorkspace(workdir=str(WORKDIR),
                              instructions="<workspace>你的工作空间在 {workdir}</workspace>") as workspace:
        agent = Agent(
            name="Friday",
            system_prompt="你是一个简洁的运维助手。",
            model=model or make_model(),
            toolkit=Toolkit(tools=[FunctionTool(read_server_log, is_read_only=True)]),
            offloader=workspace,      # 截掉的内容、压缩掉的旧消息都存进工作空间 / offloaded content goes here
            context_config=config,
        )

        print("\n1) 你 / You: 我叫小明。请读取服务器日志，告诉我你看到了哪些 ERROR。")
        reply = await agent.reply(UserMsg(name="user", content="我叫小明。请读取服务器日志，告诉我你看到了哪些 ERROR。"))
        print("Friday:", reply.get_text_content())
        show(agent, "读日志后 after the log")

        print("\n2) 手动压缩 / compress by hand")
        # 把触发比例临时调得很低，保证这次一定压缩 / a tiny trigger ratio forces compression this time
        await agent.compress_context(ContextConfig(trigger_ratio=0.01, reserve_ratio=0.01))
        show(agent, "压缩后 after compression")
        print("  摘要开头 / summary starts with:", str(agent.state.summary)[:160].replace("\n", " "), "...")

        print("\n3) 你 / You: 我叫什么名字？刚才日志里你看到了哪些 ERROR？")
        reply = await agent.reply(UserMsg(name="user", content="我叫什么名字？刚才日志里你看到了哪些 ERROR？"))
        print("Friday:", reply.get_text_content())

        session_dir = WORKDIR / "sessions" / agent.state.session_id
        print("\n卸载到工作空间的文件 / offloaded files:")
        for path in sorted(session_dir.glob("*")):
            print("  ", path.name, f"({path.stat().st_size} bytes)")


if __name__ == "__main__":
    asyncio.run(main())
