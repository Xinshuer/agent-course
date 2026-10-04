"""第 47 节练习：剪裁和筛选对话历史（按 TODO 补全）
Lesson 47 exercise: trim and filter a chat history (fill in the TODOs).

运行环境 / Environment: .venv
运行 / Run (在 practice 文件夹里 / from the practice folder):
    & ..\\.venv\\Scripts\\python.exe l47_trim_filter_todo.py
需要 / Needs: DEEPSEEK_API_KEY（最后调用 1 次模型 / one model call at the end）
参考答案 / Solution: l47_trim_filter_solution.py
"""
from langchain_core.messages import (
    AIMessage,
    HumanMessage,
    SystemMessage,
    filter_messages,
    trim_messages,
)
from langchain_core.messages.utils import count_tokens_approximately
from langchain_deepseek import ChatDeepSeek

from llm import API_KEY, MODEL

history = [
    SystemMessage("你是一个简洁的中文助手，回答不超过两句话。"),
    HumanMessage("你好，我叫小明。"),
    AIMessage("你好小明！有什么可以帮你？"),
    HumanMessage("推荐几个学 Python 的网站。"),
    AIMessage("可以从这几个网站开始：\n1. Python 官方教程 docs.python.org\n2. 菜鸟教程 runoob.com\n3. 廖雪峰的 Python 教程"),
    HumanMessage("我叫什么名字？"),
]

tagged = [
    SystemMessage("你是一个简洁的中文助手。", id="1"),
    HumanMessage("（示范）把“谢谢”翻译成英文", id="2", name="example_user"),
    AIMessage("（示范）Thank you.", id="3", name="example_assistant"),
    HumanMessage("把“早上好”翻译成英文", id="4", name="xiaoming"),
    AIMessage("Good morning.", id="5", name="assistant"),
]


def show(title, messages):
    print(f"\n== {title}（{len(messages)} 条 / messages）")
    for m in messages:
        print(f"  {m.type:<6} id={m.id} name={m.name} | {m.content!r}")


if __name__ == "__main__":
    # TODO 1: 用 trim_messages 剪裁 history：最多 35 个 token、从后往前保留（strategy="last"）、
    #   token_counter=count_tokens_approximately、保留 system（include_system=True）、
    #   允许只保留一条消息的后半部分（allow_partial=True）
    # TODO 1: trim history to at most 35 tokens from the end, counting with count_tokens_approximately,
    #   keeping the system message and allowing part of a message to be kept
    trimmed = ...
    show("trimmed", trimmed)

    # TODO 2: 用 filter_messages 去掉 tagged 里 name 是 "example_user" 和 "example_assistant" 的示范消息
    # TODO 2: use filter_messages to drop the example_user / example_assistant turns from tagged
    clean = ...
    show("clean", clean)

    # TODO 3: 用 filter_messages 只取出 tagged 里用户说的话（include_types）
    # TODO 3: keep only what the user said in tagged (include_types)
    user_only = ...
    show("user_only", user_only)

    # TODO 4: 创建 ChatDeepSeek(model=MODEL, api_key=API_KEY)，用 trimmed 调用 invoke，打印 .content
    #   想一想：模型还能答出名字吗？为什么？
    # TODO 4: create ChatDeepSeek, invoke it with trimmed and print .content.
    #   Can it still tell your name? Why?
