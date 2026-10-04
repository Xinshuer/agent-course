"""第 45 节练习参考答案（一）：模型封装 + 消息类（对应视频 00:33–04:49）
Lesson 45 solution (part 1): model wrappers + message classes (video 00:33-04:49)

1. hello world：创建模型对象，用 invoke 发一句话，读出 AIMessage 的 content 和 usage_metadata
2. 用 SystemMessage / HumanMessage / AIMessage 组成一段多轮对话，再 invoke
3. 换一个类：消息列表和调用的那一行都不改，只把 ChatDeepSeek 换成 ChatOpenAI（指向同一个 DeepSeek 接口）。
   视频里是把 OpenAI 的 gpt-4o-mini 换成百度千帆的文心模型；我们没有这两家的 key，用这个办法演示同一件事。
1. Hello world: create the model object, send one sentence with invoke, read the AIMessage's content and usage_metadata
2. Build a multi-turn conversation from SystemMessage / HumanMessage / AIMessage and invoke it
3. Swap the class: the message list and the calling line stay the same; only ChatDeepSeek becomes ChatOpenAI
   (pointed at the same DeepSeek API). The video swaps OpenAI's gpt-4o-mini for Baidu Qianfan's ERNIE model;
   we have neither key, so this shows the same idea.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l45_model_io_solution.py
会调用 3 次模型，使用 DEEPSEEK_API_KEY。/ Makes 3 model calls using DEEPSEEK_API_KEY.
"""
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_deepseek import ChatDeepSeek
from langchain_openai import ChatOpenAI

from llm import API_KEY, BASE_URL, MODEL


def hello(model):
    reply = model.invoke("你是谁？用一句话回答。")      # 一个字符串 = 一条用户消息 / a string = one user message
    print("类型 / type:", type(reply).__name__)        # AIMessage
    print("回答 / content:", reply.content)
    print("token 用量 / usage:", reply.usage_metadata)


def build_messages():
    # 每个角色对应一个消息类 / one message class per role
    return [
        SystemMessage(content="你是 Python 入门课的助教，回答不超过 30 个字。"),   # system
        HumanMessage(content="我是学员，我叫小明。"),                             # user
        AIMessage(content="欢迎你，小明！有问题随时问我。"),                       # assistant
        HumanMessage(content="我叫什么名字？"),                                   # user
    ]


def ask(model, messages):
    reply = model.invoke(messages)
    print(f"[{type(model).__name__}] {reply.content}")


if __name__ == "__main__":
    # 创建模型对象只是把设置存起来，这一步还不发请求 / creating the object only stores settings; nothing is sent yet
    model = ChatDeepSeek(model=MODEL, api_key=API_KEY)
    hello(model)
    print()

    messages = build_messages()
    ask(model, messages)

    # 换一个类，下面 ask(...) 这一行不改 / swap the class; the ask(...) line stays the same
    other_model = ChatOpenAI(model=MODEL, api_key=API_KEY, base_url=BASE_URL)
    ask(other_model, messages)
