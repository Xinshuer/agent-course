"""第 45 节练习（三）：@tool + bind_tools 工具调用（TODO 版，对应视频 30:32–34:42）
Lesson 45 exercise (part 3): tool calling with @tool + bind_tools (TODO version, video 30:32-34:42)

按 TODO 补全代码，然后运行。
Complete the TODOs, then run.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l45_bind_tools_todo.py
参考答案 / Solution: l45_bind_tools_solution.py
补全后通常调用 2 次模型，使用 DEEPSEEK_API_KEY。/ Once completed it usually makes 2 model calls using DEEPSEEK_API_KEY.
"""
import json

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.tools import tool
from langchain_deepseek import ChatDeepSeek

from llm import API_KEY, MODEL


@tool
def add(a: int, b: int) -> int:
    """Add two integers.

    Args:
        a: First integer
        b: Second integer
    """
    return a + b


# TODO 1: 仿照 add，用 @tool 写一个 multiply(a: int, b: int) -> int，别忘了 docstring
#         Following add, write multiply(a: int, b: int) -> int with @tool - don't forget the docstring


# TODO 2: 写一个字典 available_tools，把工具名 "add"、"multiply" 对应到工具本身
#         Build a dict available_tools mapping the names "add" and "multiply" to the tools
available_tools = {}


def main():
    model = ChatDeepSeek(model=MODEL, api_key=API_KEY)
    # TODO 3: 用 model.bind_tools([...]) 把两个工具绑定到模型上，得到 model_with_tools
    #         Bind both tools with model.bind_tools([...]) to get model_with_tools
    model_with_tools = None

    messages = [
        SystemMessage(content="遇到计算一律调用工具，不要心算。"),
        HumanMessage(content="3 的 4 倍是多少？"),
    ]
    reply = model_with_tools.invoke(messages)
    if not reply.tool_calls:
        print("这次模型没有调用工具 / no tool call this time:", reply.content)
        return
    print(json.dumps(reply.tool_calls, indent=2, ensure_ascii=False))

    # TODO 4: 先 messages.append(reply)；
    #         再 for call in reply.tool_calls: 用 available_tools[call["name"]] 找到工具，
    #         tool.invoke(call) 得到 ToolMessage，放进 messages
    #         messages.append(reply) first; then for call in reply.tool_calls: find the tool with
    #         available_tools[call["name"]], get a ToolMessage with tool.invoke(call) and append it

    # TODO 5: 用 model_with_tools.invoke(messages) 再调用一次，得到 final；放进 messages，
    #         再用 for m in messages: m.pretty_print() 打印整段对话
    #         Call model_with_tools.invoke(messages) again to get final; append it,
    #         then print the conversation with for m in messages: m.pretty_print()


if __name__ == "__main__":
    main()
