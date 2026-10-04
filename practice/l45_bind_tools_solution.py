"""第 45 节练习参考答案（三）：@tool + bind_tools 工具调用（对应视频 30:32–34:42）
Lesson 45 solution (part 3): tool calling with @tool + bind_tools (video 30:32-34:42)

和视频同样的流程 / The same flow as the video:
1. @tool 把 add、multiply 两个普通函数变成工具：函数名、类型标注、docstring 变成给模型看的说明（回顾 08 节）
2. model.bind_tools([...]) 得到一个「知道有哪些工具」的模型
3. 问「3 的 4 倍是多少？」，模型回一条带 tool_calls 的 AIMessage（用 json.dumps 打印出来看看）
4. 先把这条回复放进消息列表；再按名字找到工具，tool.invoke(call) 直接得到 ToolMessage，也放进列表
5. 带着整个消息列表再调用一次模型，得到最终回答；最后把整段对话打印出来
1. @tool turns two plain functions, add and multiply, into tools: name, type hints and docstring become
   the description the model reads (see lesson 08)
2. model.bind_tools([...]) gives a model that knows which tools exist
3. Ask "What is 3 times 4?" - the model replies with an AIMessage holding tool_calls (printed with json.dumps)
4. Append that reply to the message list; look each tool up by name - tool.invoke(call) returns a ToolMessage - append it
5. Call the model again with the whole list for the final answer, then print the whole conversation

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l45_bind_tools_solution.py
通常调用 2 次模型（请求工具 1 次、给出答案 1 次），使用 DEEPSEEK_API_KEY。
Usually makes 2 model calls (one asks for the tool, one answers) using DEEPSEEK_API_KEY.
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


@tool
def multiply(a: int, b: int) -> int:
    """Multiply two integers.

    Args:
        a: First integer
        b: Second integer
    """
    return a * b


available_tools = {"add": add, "multiply": multiply}   # 名字 -> 工具（分派表，回顾 07 节）/ name -> tool (lesson 07)


def main():
    model = ChatDeepSeek(model=MODEL, api_key=API_KEY)
    model_with_tools = model.bind_tools([add, multiply])

    messages = [
        SystemMessage(content="遇到计算一律调用工具，不要心算。"),
        HumanMessage(content="3 的 4 倍是多少？"),
    ]
    reply = model_with_tools.invoke(messages)
    if not reply.tool_calls:                         # 偶尔模型会直接回答 / now and then the model answers directly
        print("这次模型没有调用工具 / no tool call this time:", reply.content)
        return
    print("模型要调用的工具 / tool_calls:")
    print(json.dumps(reply.tool_calls, indent=2, ensure_ascii=False))

    messages.append(reply)                           # 1. 带 tool_calls 的回复先放进去 / store the reply first
    for call in reply.tool_calls:                    # 2. 每个调用都执行 / run every call
        selected_tool = available_tools[call["name"]]
        tool_message = selected_tool.invoke(call)    # 返回 ToolMessage，tool_call_id 自动带上 / returns a ToolMessage
        messages.append(tool_message)

    final = model_with_tools.invoke(messages)        # 3. 带着工具结果再问一次 / ask again with the results
    messages.append(final)

    print("\n完整的对话 / the whole conversation:")
    for m in messages:
        m.pretty_print()                             # 每条消息按类型格式化打印 / formatted by message type


if __name__ == "__main__":
    main()
