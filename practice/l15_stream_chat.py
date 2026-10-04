"""第 15 节：流式输出的聊天智能体（视频的第二个实例）
Lesson 15: a streaming chat agent (the video's second example)

和 l15_agent_solution.py 的唯一区别：把 await agent.reply(msg) 换成 async for event in agent.reply_stream(msg)，
回答一边生成一边打印。
The only change from l15_agent_solution.py: await agent.reply(msg) becomes
async for event in agent.reply_stream(msg), so the answer is printed while it is generated.

ONLY_ANSWER = False：和视频一样，凡是带 delta 的事件都打印 —— 先出来的是模型的思考过程，后面才是回答。
ONLY_ANSWER = True ：只打印回答文字（TEXT_BLOCK_DELTA 事件）。
ONLY_ANSWER = False: like the video, print every event that has a delta - the model's thinking comes first,
then the answer. ONLY_ANSWER = True: print only the answer text (TEXT_BLOCK_DELTA events).

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l15_stream_chat.py
需要 / Needs: DEEPSEEK_API_KEY
输入 exit 退出 / type exit to quit
"""
import asyncio

from agentscope.agent import Agent
from agentscope.credential import OpenAICredential
from agentscope.event import EventType
from agentscope.message import Msg, TextBlock
from agentscope.model import OpenAIChatModel

from llm import API_KEY, BASE_URL, MODEL

ONLY_ANSWER = False

model = OpenAIChatModel(
    model=MODEL,
    credential=OpenAICredential(api_key=API_KEY, base_url=BASE_URL),
    stream=True,                                   # 模型一小段一小段地返回 / the model streams its output
)
agent = Agent(name="Friday", system_prompt="你是一个友好的中文助手。", model=model)


async def chat_stream():
    while True:
        user_input = input("\n你：").strip()
        if user_input == "exit":
            break
        if not user_input:
            continue
        msg = Msg(name="user", role="user", content=[TextBlock(text=user_input)])
        print("Friday：", end="", flush=True)
        # reply_stream 不直接返回消息，而是一个接一个地产生事件 / reply_stream yields events one by one
        async for event in agent.reply_stream(msg):
            if ONLY_ANSWER:
                if event.type == EventType.TEXT_BLOCK_DELTA:      # 只要回答的文字片段 / answer text only
                    print(event.delta, end="", flush=True)
            elif hasattr(event, "delta"):                         # 视频的写法：有 delta 就打印 / video style
                print(event.delta, end="", flush=True)
        print()


if __name__ == "__main__":
    asyncio.run(chat_stream())
