"""第 16 节练习参考答案：给 AgentScope 智能体装上工具箱，并在流式输出里处理「请求批准」事件（视频的完整实例）
Lesson 16 solution: give an AgentScope agent a toolkit and handle the "please approve" event while streaming
(the video's complete example)

工具箱里两个工具 / Two tools in the toolkit:
    - Read：AgentScope 自带的读文件工具（要给绝对路径）/ AgentScope's built-in file reader (absolute paths)
    - add ：自己写的加法工具，三层包装：FunctionTool(函数)，函数返回 ToolChunk(content=[TextBlock(...)])
            our own add tool, wrapped three times: FunctionTool(function), returning ToolChunk(content=[TextBlock(...)])
add 没有标记为只读，所以模型想调用它时，智能体会先发出 RequireUserConfirmEvent 等我们批准；
我们把批准结果打包成 UserConfirmResultEvent，下一轮交回给智能体，它才会真正执行工具并继续回答。
add is not marked read-only, so when the model wants it the agent first emits a RequireUserConfirmEvent;
we pack our answer into a UserConfirmResultEvent and hand it back next round, and only then does the tool run.

和视频一样，这里对所有工具调用都直接批准（confirmed=True）。真实项目要先问用户，见第 18 节。
As in the video, every tool call is approved automatically (confirmed=True). Real projects ask the user (lesson 18).

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l16_tools_solution.py
需要 / Needs: DEEPSEEK_API_KEY
试着问 / Try: 帮我算一下 12.5 加 30 等于多少
             读一下这个文件，告诉我里面的暗号：<程序启动时打印的绝对路径 / the absolute path printed at start>
输入 exit 退出 / type exit to quit
"""
import asyncio
from pathlib import Path

from agentscope.agent import Agent
from agentscope.credential import OpenAICredential
from agentscope.event import ConfirmResult, RequireUserConfirmEvent, UserConfirmResultEvent
from agentscope.message import Msg, TextBlock
from agentscope.model import OpenAIChatModel
from agentscope.tool import FunctionTool, Read, ToolChunk, Toolkit

from llm import API_KEY, BASE_URL, MODEL

SECRET_FILE = (Path(__file__).parent / "data" / "l16_secret.txt").resolve()   # 绝对路径 / absolute path


# ---------- 1. 自定义工具：docstring 会变成给模型看的说明 / custom tool: the docstring becomes its description ----------
def add(a: float, b: float) -> ToolChunk:
    """计算两个数字之和。

    Args:
        a (float): 第一个加数
        b (float): 第二个加数

    Returns:
        ToolChunk: 两数之和
    """
    result = a + b
    # 返回值包两层：文字先放进 TextBlock，再放进 ToolChunk 的 content 列表
    # the result is wrapped twice: text in a TextBlock, inside ToolChunk's content list
    return ToolChunk(content=[TextBlock(text=str(result))])


# ---------- 2. 工具箱：内置的 Read + 用 FunctionTool 包起来的 add / toolkit: built-in Read + wrapped add ----------
toolkit = Toolkit(tools=[Read(), FunctionTool(add)])

# ---------- 3. 模型和智能体，把工具箱交给智能体 / model and agent; hand the toolkit to the agent ----------
model = OpenAIChatModel(
    model=MODEL,
    credential=OpenAICredential(api_key=API_KEY, base_url=BASE_URL),
    stream=True,
)
agent = Agent(
    name="Friday",
    system_prompt="你是一个乐于助人的助手。需要计算或读取文件时，调用工具完成。回答要简短。",
    model=model,
    toolkit=toolkit,
)


async def main():
    print(f"可以让它读这个文件 / ask it to read this file:\n{SECRET_FILE}")
    confirm_event = None        # 存放「系统对模型的应答」（批准结果）/ holds our answer to the model (the approvals)

    while True:
        if confirm_event is None:
            # 没有待回复的批准请求：正常读用户输入 / nothing to answer: read the user's input as usual
            user_input = input("\n你：").strip()
            if user_input == "exit":
                break
            if not user_input:
                continue
            inputs = Msg(name="user", role="user", content=[TextBlock(text=user_input)])
        else:
            # 有：这一轮把批准结果交给智能体，让它从暂停处继续 / otherwise: hand back the approvals and resume
            inputs = confirm_event
            confirm_event = None

        async for event in agent.reply_stream(inputs):
            if isinstance(event, RequireUserConfirmEvent):          # 智能体请求批准 / the agent asks for approval
                confirm_results = []
                for tool_call in event.tool_calls:                  # 一次可能请求好几个工具 / maybe several calls
                    print(f"\n[请求调用工具 / tool request] {tool_call.name} {tool_call.input}")
                    confirm_results.append(
                        ConfirmResult(
                            confirmed=True,                         # True 同意，False 拒绝 / True allow, False deny
                            tool_call=tool_call,                    # 答复的是哪一个调用 / which call this answers
                            rules=tool_call.suggested_rules,        # 以后同类调用自动允许 / auto-allow next time
                        )
                    )
                confirm_event = UserConfirmResultEvent(reply_id=event.reply_id, confirm_results=confirm_results)
            elif hasattr(event, "delta"):                           # 正常的流式输出 / normal streaming output
                print(event.delta, end="", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
