"""第 44 节演示：LangChain 核心组件一览（不调用真实模型）
Lesson 44 demo: a tour of LangChain's core components (no real model calls)

视频（第 44 集）只讲解、不写代码，把 LangChain 分成六块：模型输入输出、数据连接、对话历史、链、智能体、回调。
这个文件给每一块各举一个最小的例子：消息、提示词模板、一个「假模型」、输出解析器（模型输入输出）；
统一的 .invoke() 和 |（链）；文档和文本切分器（数据连接）；工具（智能体的零件）；对话历史；回调。
The video (episode 44) is talk only and splits LangChain into six groups: model I/O, data connection,
chat history, chains, agents and callbacks. This file gives one tiny example of each: messages, a prompt
template, a fake model and output parsers (model I/O); the shared .invoke() and | (chains); a document and
a text splitter (data connection); a tool (the building block of agents); a chat history; a callback.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l44_components_tour.py
不调用模型，不需要 API key（用 FakeListChatModel 代替真实模型）。
Makes no model calls and needs no API key (FakeListChatModel stands in for a real model).
"""
from langchain_core.callbacks import BaseCallbackHandler
from langchain_core.documents import Document
from langchain_core.language_models.fake_chat_models import FakeListChatModel
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.tools import tool
from langchain_text_splitters import RecursiveCharacterTextSplitter


def section(title):
    print(f"\n===== {title} =====")


class PrintSteps(BaseCallbackHandler):
    """回调处理器：模型开始、结束时，LangChain 会自动调用这两个方法
    A callback handler: LangChain calls these methods when the model starts and ends"""

    def on_chat_model_start(self, serialized, messages, **kwargs):
        print(f"   [回调 / callback] 模型开始，收到 {len(messages[0])} 条消息 / model starts with {len(messages[0])} message(s)")

    def on_llm_end(self, response, **kwargs):
        print("   [回调 / callback] 模型结束，回答 / model ends, answer:", response.generations[0][0].text)


@tool
def get_temperature(city: str) -> str:
    """Return the current temperature of a city."""
    return f"{city}: 20°C"


if __name__ == "__main__":
    # 1. 消息 Messages：对话里的一条条消息
    section("1. 消息 / Messages")
    messages = [
        SystemMessage(content="你是一名导游。"),
        HumanMessage(content="杭州有什么好玩的？"),
        AIMessage(content="推荐西湖和灵隐寺。"),
    ]
    for m in messages:
        print(f"   {type(m).__name__}  type={m.type}  content={m.content}")

    # 2. 提示词模板 Prompt template：带变量的提示词
    section("2. 提示词模板 / Prompt template")
    prompt = ChatPromptTemplate.from_messages([
        ("system", "你是一名{role}。"),
        ("human", "{question}"),
    ])
    prompt_value = prompt.invoke({"role": "导游", "question": "杭州有什么好玩的？"})
    print("  ", prompt_value.to_messages())

    # 3. 模型 Model：这里用一个只会按顺序返回固定回答的假模型，接口和真模型一样
    section("3. 模型（假模型）/ Model (a fake one)")
    fake_model = FakeListChatModel(responses=['{"place": "西湖", "reason": "免费又好看"}'])
    reply = fake_model.invoke(prompt_value)
    print("  ", type(reply).__name__, "->", reply.content)

    # 4. 输出解析器 Output parsers：把 AIMessage 变成程序好用的数据
    section("4. 输出解析器 / Output parsers")
    print("   StrOutputParser  ->", repr(StrOutputParser().invoke(reply)))
    print("   JsonOutputParser ->", JsonOutputParser().invoke(reply))

    # 5. 统一接口：每个组件都有 .invoke()，所以可以一个接一个地串起来
    section("5. 统一接口 Runnable / one interface for all")
    value = {"role": "导游", "question": "杭州有什么好玩的？"}
    for step in [prompt, fake_model, JsonOutputParser()]:
        value = step.invoke(value)          # 上一步的输出 = 下一步的输入
        print(f"   {type(step).__name__} -> 输出 / output: {type(value).__name__}")
    print("   最终结果 / final:", value)
    chain = prompt | fake_model | JsonOutputParser()   # 同一件事的简写，48 节细讲 "|"
    print("   用 | 串起来 / with |:", chain.invoke({"role": "导游", "question": "杭州有什么好玩的？"}))

    # 6. 数据连接 Data connection：文档 + 切分（46 节）
    section("6. 文档与切分 / Documents & splitting")
    doc = Document(page_content="西湖位于杭州市西部。" * 8, metadata={"source": "guide.txt"})
    splitter = RecursiveCharacterTextSplitter(chunk_size=40, chunk_overlap=0)
    chunks = splitter.split_documents([doc])
    print(f"   1 个文档切成了 {len(chunks)} 块 / 1 document -> {len(chunks)} chunks")
    print("   第一块 / first chunk:", chunks[0].page_content, chunks[0].metadata)

    # 7. 工具 Tools：@tool 把函数变成模型能调用的工具（49 节）
    section("7. 工具 / Tools")
    print("   name:", get_temperature.name)
    print("   description:", get_temperature.description)
    print("   args:", get_temperature.args)
    print("   invoke:", get_temperature.invoke({"city": "杭州"}))

    # 8. 对话历史 Chat history（47 节）：最简单的形式就是一个消息列表，
    #    用 MessagesPlaceholder 整段放进提示词模板。
    #    The simplest chat history is a list of messages, dropped into a template with MessagesPlaceholder.
    section("8. 对话历史 / Chat history")
    history = [HumanMessage(content="我叫小明"), AIMessage(content="你好，小明！")]
    chat_prompt = ChatPromptTemplate.from_messages([
        ("system", "你是一个友好的助手。"),
        MessagesPlaceholder("history"),
        ("human", "{question}"),
    ])
    for m in chat_prompt.invoke({"history": history, "question": "我叫什么？"}).to_messages():
        print(f"   {m.type}: {m.content}")

    # 9. 回调 Callbacks：想在每一步开始、结束时做点事（打日志、统计、监控），就传一个回调处理器
    #    Callbacks: to act when each step starts or ends (logging, counting, monitoring), pass a callback handler
    section("9. 回调 / Callbacks")
    quiet_model = FakeListChatModel(responses=["西湖"])
    reply = quiet_model.invoke("杭州最有名的景点是哪个？", config={"callbacks": [PrintSteps()]})
    print("   invoke 的结果 / result:", reply.content)
