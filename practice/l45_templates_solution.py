"""第 45 节练习参考答案（二）：提示词模板（对应视频 04:49–17:22）
Lesson 45 solution (part 2): prompt templates (video 04:49-17:22)

和视频结构相同的四个例子（客服的店名是自拟的）/ Four examples built like the video's:
1. PromptTemplate.from_template + format：让模型讲一个关于「小明」的笑话
2. ChatPromptTemplate：SystemMessagePromptTemplate / HumanMessagePromptTemplate，用 format_messages 填值
3. MessagesPlaceholder：把一段对话历史整个填进模板，让模型把上一轮的回答翻译成中文
4. PromptTemplate.from_file：提示词放在单独的文件 data/l45_guide_prompt.txt 里（不调用模型）
1. PromptTemplate.from_template + format: ask the model for a joke about "Xiao Ming"
2. ChatPromptTemplate: SystemMessagePromptTemplate / HumanMessagePromptTemplate, filled with format_messages
3. MessagesPlaceholder: drop a whole conversation into the template and ask for the last answer in Chinese
4. PromptTemplate.from_file: the prompt lives in its own file, data/l45_guide_prompt.txt (no model call)

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l45_templates_solution.py
会调用 3 次模型，使用 DEEPSEEK_API_KEY。/ Makes 3 model calls using DEEPSEEK_API_KEY.
"""
from pathlib import Path

from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import (ChatPromptTemplate, HumanMessagePromptTemplate,
                                    MessagesPlaceholder, PromptTemplate,
                                    SystemMessagePromptTemplate)
from langchain_deepseek import ChatDeepSeek

from llm import API_KEY, MODEL

DATA = Path(__file__).parent / "data"     # 本文件旁边的 data 文件夹（pathlib 回顾 10 节）/ the data folder next to this file
model = ChatDeepSeek(model=MODEL, api_key=API_KEY)


def joke():
    # {subject} 是占位符（槽），不是 f-string：这时候还没有填值
    # {subject} is a placeholder (a slot), not an f-string: nothing is filled in yet
    template = PromptTemplate.from_template("给我讲一个关于{subject}的笑话，不超过 50 个字。")
    print(template)                                   # 能看到 input_variables=['subject']
    prompt = template.format(subject="小明")           # 填槽，得到一个普通字符串 / fill the slot -> a plain string
    print("填好的提示词 / filled prompt:", prompt)
    print(model.invoke(prompt).content)


def customer_service():
    chat_template = ChatPromptTemplate.from_messages([
        SystemMessagePromptTemplate.from_template("你是{shop}的客服助手，你的名字叫{name}。回答不超过 40 个字。"),
        HumanMessagePromptTemplate.from_template("{query}"),
    ])
    messages = chat_template.format_messages(shop="西湖书店", name="小书", query="你是谁？")   # -> 消息列表
    for m in messages:
        print(f"  [{m.type}] {m.content}")
    print(model.invoke(messages).content)


def translate_history():
    chat_template = ChatPromptTemplate.from_messages([
        MessagesPlaceholder("history"),               # 这一整段是一个槽，可以填好几条消息 / one slot for several messages
        HumanMessagePromptTemplate.from_template("把你上面的回答翻译成{language}。"),
    ])
    history = [
        HumanMessage(content="Who is Elon Musk?"),
        AIMessage(content="Elon Musk is an entrepreneur who runs Tesla and SpaceX."),
    ]
    prompt_value = chat_template.invoke({"history": history, "language": "中文"})
    for m in prompt_value.to_messages():              # 看看填好以后有哪些消息 / see the filled-in messages
        print(f"  [{m.type}] {m.content}")
    print(model.invoke(prompt_value).content)


def template_from_file():
    # encoding="utf-8" 不能省：Windows 默认按 GBK 读文件，中文会出错
    # Don't drop encoding="utf-8": Windows reads files as GBK by default and Chinese text breaks
    template = PromptTemplate.from_file(DATA / "l45_guide_prompt.txt", encoding="utf-8")
    print("变量 / variables:", template.input_variables)
    print(template.format(role="杭州导游", limit=30, question="西湖什么季节最好看？"))


if __name__ == "__main__":
    print("== 1. PromptTemplate ==")
    joke()
    print("\n== 2. ChatPromptTemplate ==")
    customer_service()
    print("\n== 3. MessagesPlaceholder ==")
    translate_history()
    print("\n== 4. from_file ==")
    template_from_file()
