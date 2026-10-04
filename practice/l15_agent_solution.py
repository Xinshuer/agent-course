"""第 15 节练习参考答案：AgentScope 2.x 的基础聊天智能体（非流式，视频的第一个实例）
Lesson 15 solution: a basic AgentScope 2.x chat agent (non-streaming, the video's first example)

四个要素 / The four parts:
    消息 Msg（里面装 TextBlock）→ 凭证 OpenAICredential（key + 地址）→ 模型 OpenAIChatModel → 智能体 Agent
    message Msg (holding TextBlocks) -> credential OpenAICredential (key + address) -> model OpenAIChatModel -> Agent

视频用阿里云百炼的千问（OpenAIChatModel + 百炼的兼容地址）；这里同样用 OpenAIChatModel，
只把 key、地址和模型名换成 DeepSeek 的（从 llm.py 导入）。
The video uses Qwen on Bailian (OpenAIChatModel + Bailian's compatible address); here the same
OpenAIChatModel just gets DeepSeek's key, address and model name (imported from llm.py).

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l15_agent_solution.py
需要 / Needs: DEEPSEEK_API_KEY（见环境准备页 / see the Setup page）
输入 exit 退出 / type exit to quit
"""
import asyncio

from agentscope.agent import Agent
from agentscope.credential import OpenAICredential
from agentscope.message import Msg, TextBlock
from agentscope.model import OpenAIChatModel

from llm import API_KEY, BASE_URL, MODEL

# 1. 凭证（视频叫它「通行证」）：API key + 接口地址 / the credential: API key + API address
credential = OpenAICredential(api_key=API_KEY, base_url=BASE_URL)

# 2. 模型：按 OpenAI 接口标准和云端模型通信的配置 / the model: how to talk to the cloud model
model = OpenAIChatModel(model=MODEL, credential=credential, stream=True)

# 3. 智能体：名字 + 系统提示词 + 模型 / the agent: name + system prompt + model
agent = Agent(
    name="Friday",
    system_prompt="你是一个友好的中文助手，回答简洁。",
    model=model,
)


async def chat_with_agent():
    while True:                                          # 一直聊下去 / keep chatting
        user_input = input("你：").strip()
        if user_input == "exit":
            break
        if not user_input:
            continue
        # 4. 把用户输入打包成消息：文字先装进 TextBlock，再放进 Msg 的 content 列表
        #    wrap the input: text goes into a TextBlock, which goes into Msg's content list
        msg = Msg(name="user", role="user", content=[TextBlock(text=user_input)])
        reply = await agent.reply(msg)                   # 等整段回答完成 / wait for the whole answer
        print("Friday：", reply.get_text_content())


if __name__ == "__main__":
    asyncio.run(chat_with_agent())                       # 协程要交给 asyncio.run / coroutines need asyncio.run
