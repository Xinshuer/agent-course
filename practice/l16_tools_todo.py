"""第 16 节练习：工具箱 + 自定义工具 + 处理「请求批准」事件（TODO 版）
Lesson 16 exercise: a toolkit + a custom tool + handling the "please approve" event (TODO version)

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l16_tools_todo.py
需要 / Needs: DEEPSEEK_API_KEY
参考答案 / Solution: l16_tools_solution.py
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

SECRET_FILE = (Path(__file__).parent / "data" / "l16_secret.txt").resolve()


# TODO 1: 补全 docstring：第一行写工具做什么；Args: 下每个参数一行「名字 (类型): 说明」；Returns: 写返回什么
#         Complete the docstring: line 1 = what the tool does; under Args: one line per parameter
#         "name (type): description"; under Returns: what it returns
def add(a: float, b: float) -> ToolChunk:
    """

    Args:

    Returns:

    """
    result = a + b
    # TODO 2: 把结果包两层再返回：ToolChunk(content=[TextBlock(text=str(result))])
    #         Wrap the result twice: ToolChunk(content=[TextBlock(text=str(result))])
    return None


# TODO 3: 工具箱：Toolkit(tools=[Read(), FunctionTool(add)])
#         The toolkit: Toolkit(tools=[Read(), FunctionTool(add)])
toolkit = None

model = OpenAIChatModel(
    model=MODEL,
    credential=OpenAICredential(api_key=API_KEY, base_url=BASE_URL),
    stream=True,
)

# TODO 4: 创建 Agent，记得传 toolkit=toolkit
#         Create the Agent and pass toolkit=toolkit
agent = None


async def main():
    print(f"可以让它读这个文件 / ask it to read this file:\n{SECRET_FILE}")
    confirm_event = None

    while True:
        if confirm_event is None:
            user_input = input("\n你：").strip()
            if user_input == "exit":
                break
            if not user_input:
                continue
            inputs = Msg(name="user", role="user", content=[TextBlock(text=user_input)])
        else:
            inputs = confirm_event
            confirm_event = None

        async for event in agent.reply_stream(inputs):
            if isinstance(event, RequireUserConfirmEvent):
                confirm_results = []
                # TODO 5: 遍历 event.tool_calls，对每个 tool_call 追加
                #         ConfirmResult(confirmed=True, tool_call=tool_call, rules=tool_call.suggested_rules)
                #         For every tool_call in event.tool_calls append the ConfirmResult above

                # TODO 6: 打包成 UserConfirmResultEvent(reply_id=event.reply_id, confirm_results=confirm_results)，
                #         存进 confirm_event，下一轮交回给智能体
                #         Pack them into a UserConfirmResultEvent and store it in confirm_event for the next round
                pass
            elif hasattr(event, "delta"):
                print(event.delta, end="", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
