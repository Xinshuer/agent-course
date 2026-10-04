"""第 45 节练习（二）：提示词模板（TODO 版，对应视频 04:49–17:22）
Lesson 45 exercise (part 2): prompt templates (TODO version, video 04:49-17:22)

按 TODO 补全代码，然后运行。
Complete the TODOs, then run.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l45_templates_todo.py
参考答案 / Solution: l45_templates_solution.py
补全后会调用 3 次模型，使用 DEEPSEEK_API_KEY。/ Once completed it makes 3 model calls using DEEPSEEK_API_KEY.
"""
from pathlib import Path

from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import (ChatPromptTemplate, HumanMessagePromptTemplate,
                                    MessagesPlaceholder, PromptTemplate,
                                    SystemMessagePromptTemplate)
from langchain_deepseek import ChatDeepSeek

from llm import API_KEY, MODEL

DATA = Path(__file__).parent / "data"
model = ChatDeepSeek(model=MODEL, api_key=API_KEY)


def joke():
    # TODO 1: 用 PromptTemplate.from_template(...) 写一个带 {subject} 槽的模板：「给我讲一个关于{subject}的笑话」
    #         打印模板本身，再用 template.format(subject="小明") 填槽，把结果交给 model.invoke(...)，打印 .content
    #         Write a template with a {subject} slot using PromptTemplate.from_template(...),
    #         print it, fill it with template.format(subject="Xiao Ming"), pass it to model.invoke(...), print .content
    pass


def customer_service():
    # TODO 2: 用 ChatPromptTemplate.from_messages([...]) 写一个聊天模板：
    #         SystemMessagePromptTemplate.from_template("你是{shop}的客服助手，你的名字叫{name}。")
    #         HumanMessagePromptTemplate.from_template("{query}")
    #         Build a chat template from a SystemMessagePromptTemplate (with {shop} and {name})
    #         and a HumanMessagePromptTemplate ("{query}")
    chat_template = None

    # TODO 3: 用 chat_template.format_messages(shop=..., name=..., query="你是谁？") 得到消息列表，
    #         打印每条消息，再交给 model.invoke(...)，打印回答
    #         Get a message list with chat_template.format_messages(shop=..., name=..., query="Who are you?"),
    #         print every message, then pass the list to model.invoke(...) and print the answer


def translate_history():
    # TODO 4: 写一个聊天模板：第一条是 MessagesPlaceholder("history")，
    #         第二条是 HumanMessagePromptTemplate.from_template("把你上面的回答翻译成{language}。")
    #         Build a chat template: MessagesPlaceholder("history") first, then
    #         HumanMessagePromptTemplate.from_template("Translate your answer above into {language}.")
    chat_template = None

    history = [
        HumanMessage(content="Who is Elon Musk?"),
        AIMessage(content="Elon Musk is an entrepreneur who runs Tesla and SpaceX."),
    ]
    # TODO 5: 用 chat_template.invoke({"history": history, "language": "中文"}) 填槽，
    #         打印 prompt_value.to_messages() 里的每条消息，再把 prompt_value 交给模型，打印回答
    #         Fill it with chat_template.invoke({"history": history, "language": "Chinese"}),
    #         print each message in prompt_value.to_messages(), then pass prompt_value to the model and print the answer


def template_from_file():
    # TODO 6: 用 PromptTemplate.from_file(DATA / "l45_guide_prompt.txt", encoding="utf-8") 读入模板，
    #         打印 input_variables，再用 format(role=..., limit=..., question=...) 填值并打印
    #         Load the template with PromptTemplate.from_file(DATA / "l45_guide_prompt.txt", encoding="utf-8"),
    #         print input_variables, then fill it with format(role=..., limit=..., question=...) and print it
    pass


if __name__ == "__main__":
    print("== 1. PromptTemplate ==")
    joke()
    print("\n== 2. ChatPromptTemplate ==")
    customer_service()
    print("\n== 3. MessagesPlaceholder ==")
    translate_history()
    print("\n== 4. from_file ==")
    template_from_file()
