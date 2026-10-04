"""第 15 节练习：AgentScope 2.x 的基础聊天智能体（TODO 版）
Lesson 15 exercise: a basic AgentScope 2.x chat agent (TODO version)

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l15_agent_todo.py
需要 / Needs: DEEPSEEK_API_KEY
参考答案 / Solution: l15_agent_solution.py
"""
import asyncio

from agentscope.agent import Agent
from agentscope.credential import OpenAICredential
from agentscope.message import Msg, TextBlock
from agentscope.model import OpenAIChatModel

from llm import API_KEY, BASE_URL, MODEL

# TODO 1: 凭证：OpenAICredential(api_key=API_KEY, base_url=BASE_URL)
#         The credential: OpenAICredential(api_key=API_KEY, base_url=BASE_URL)
credential = None

# TODO 2: 模型：OpenAIChatModel(model=MODEL, credential=credential, stream=True)
#         The model: OpenAIChatModel(model=MODEL, credential=credential, stream=True)
model = None

# TODO 3: 智能体：Agent(name=..., system_prompt=..., model=model)
#         The agent: Agent(name=..., system_prompt=..., model=model)
agent = None


async def chat_with_agent():
    while True:
        user_input = input("你：").strip()
        if user_input == "exit":
            break
        if not user_input:
            continue
        # TODO 4: 打包消息：Msg(name="user", role="user", content=[TextBlock(text=user_input)])
        #         Wrap the input: Msg(name="user", role="user", content=[TextBlock(text=user_input)])

        # TODO 5: reply = await agent.reply(msg)，再打印 reply.get_text_content()
        #         reply = await agent.reply(msg), then print reply.get_text_content()
        pass


if __name__ == "__main__":
    # TODO 6: 协程不能直接调用，要交给 asyncio.run(...) 运行（回顾 09 节）
    #         A coroutine isn't called directly; run it with asyncio.run(...) (see lesson 09)
    pass
