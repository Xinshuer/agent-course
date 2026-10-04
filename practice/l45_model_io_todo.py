"""第 45 节练习（一）：模型封装 + 消息类（TODO 版，对应视频 00:33–04:49）
Lesson 45 exercise (part 1): model wrappers + message classes (TODO version, video 00:33-04:49)

按 TODO 补全代码，然后运行。
Complete the TODOs, then run.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l45_model_io_todo.py
参考答案 / Solution: l45_model_io_solution.py
补全后会调用 3 次模型，使用 DEEPSEEK_API_KEY。/ Once completed it makes 3 model calls using DEEPSEEK_API_KEY.
"""
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_deepseek import ChatDeepSeek
from langchain_openai import ChatOpenAI

from llm import API_KEY, BASE_URL, MODEL


def hello(model):
    # TODO 2: 用 model.invoke("你是谁？用一句话回答。") 调用模型，得到 reply；
    #         再打印 reply.content 和 reply.usage_metadata
    #         Call model.invoke("Who are you? One sentence.") to get reply,
    #         then print reply.content and reply.usage_metadata
    pass


def build_messages():
    # TODO 3: 返回一个消息列表，依次是：
    #         SystemMessage（助教的设定）→ HumanMessage（"我是学员，我叫小明。"）
    #         → AIMessage（助教的欢迎语）→ HumanMessage（"我叫什么名字？"）
    #         Return a list: SystemMessage (the assistant persona) -> HumanMessage ("I'm a student, my name is Ming.")
    #         -> AIMessage (a welcome) -> HumanMessage ("What is my name?")
    return []


def ask(model, messages):
    # TODO 4: 用 model.invoke(messages) 调用模型，打印 f"[{type(model).__name__}] {reply.content}"
    #         Call model.invoke(messages) and print f"[{type(model).__name__}] {reply.content}"
    pass


if __name__ == "__main__":
    # TODO 1: 用 ChatDeepSeek 创建模型对象，传入 model=MODEL 和 api_key=API_KEY
    #         Create the model with ChatDeepSeek, passing model=MODEL and api_key=API_KEY
    model = None
    hello(model)
    print()

    messages = build_messages()
    ask(model, messages)

    # TODO 5: 换一个类：用 ChatOpenAI(model=MODEL, api_key=API_KEY, base_url=BASE_URL) 创建 other_model，
    #         再调用 ask(other_model, messages)——消息列表和 ask 都不用改
    #         Swap the class: create other_model with ChatOpenAI(model=MODEL, api_key=API_KEY, base_url=BASE_URL),
    #         then call ask(other_model, messages) - neither the messages nor ask need to change
