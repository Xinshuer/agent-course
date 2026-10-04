"""第 50 节演示：视频最后说的坑——LangChain 的流式输出「停不下来」，现在怎么样？
Lesson 50 demo: the pitfall from the end of the video - "you cannot stop a LangChain stream". What about now?

做两次同样的流式调用，都在收到 10 段文字后 break：
    1. 同步：for piece in chain.stream(...)        —— 本地实测：break 之后要等整段回答生成完，循环才真正结束
    2. 异步：async for piece in chain.astream(...) —— 本地实测：break 之后立刻结束，连接随之断开
Two identical streaming calls, each breaking after 10 pieces of text:
    1. sync:  for piece in chain.stream(...)        - tested locally: after break, the loop only ends once the
                                                      whole answer has been generated
    2. async: async for piece in chain.astream(...) - tested locally: ends right after break, connection closed

（先用一个模拟的流式服务器测过，见第 50 节讲义；直接 model.stream(...) 时 break 也能立刻停。
用真实的 deepseek-flash 运行本文件的一次结果：同步版 0.8 秒 break、4.1 秒才真正结束；异步版 0.7 秒 break 后立刻结束。）
(First tested against a mock streaming server, see the lesson notes; breaking out of model.stream(...) also
stops at once. One real run with deepseek-flash: sync broke at 0.8 s but only ended at 4.1 s; async ended at 0.7 s.)

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l50_stream_stop.py
需要 DEEPSEEK_API_KEY；调用模型 2 次（为了看得清楚，关闭了思考模式）。
Needs DEEPSEEK_API_KEY; 2 model calls (thinking mode is off so the timing is easier to read).
"""
import asyncio
import time

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_deepseek import ChatDeepSeek

from llm import API_KEY, MODEL

model = ChatDeepSeek(model=MODEL, api_key=API_KEY, extra_body={"thinking": {"type": "disabled"}})
chain = ChatPromptTemplate.from_template("写一个关于{topic}的小故事，大约 500 字。") | model | StrOutputParser()
STOP_AFTER = 10   # 收到 10 段文字后就不想要了 / we stop wanting more after 10 pieces


def sync_demo():
    start = time.time()
    count = 0
    for piece in chain.stream({"topic": "猫"}):
        if not piece:              # 跳过空字符串 / skip empty strings
            continue
        print(piece, end="", flush=True)
        count += 1
        if count == STOP_AFTER:
            print(f"\n[同步 / sync] break 时 / at break: {time.time() - start:.1f}s")
            break
    print(f"[同步 / sync] 循环真正结束 / loop really ended: {time.time() - start:.1f}s")


async def async_demo():
    start = time.time()
    count = 0
    async for piece in chain.astream({"topic": "狗"}):
        if not piece:
            continue
        print(piece, end="", flush=True)
        count += 1
        if count == STOP_AFTER:
            print(f"\n[异步 / async] break 时 / at break: {time.time() - start:.1f}s")
            break
    print(f"[异步 / async] 循环真正结束 / loop really ended: {time.time() - start:.1f}s")


if __name__ == "__main__":
    sync_demo()
    print()
    asyncio.run(async_demo())
