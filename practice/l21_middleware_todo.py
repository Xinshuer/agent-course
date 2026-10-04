"""第 21 节练习：照着视频写一个自己的中间件（按 TODO 补全）。
Lesson 21 exercise: write your own middleware as in the video (fill in the TODOs).

参考答案 / Solution: l21_middleware_solution.py
补全后试着问 / When done, try:
    你好 -> 思考和回答之间出现分隔线，data\\l21_my_agent.json 被创建
            dividers between thinking and answer; data\\l21_my_agent.json is created
    读一下 data 文件夹里的 l21_note.txt -> 打印工具开始 / 结束 / tool start / end lines
    你叫什么名字？ -> AAG

运行环境 / Environment: .venv （需要 DEEPSEEK_API_KEY / needs DEEPSEEK_API_KEY）
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l21_middleware_todo.py
"""
import asyncio
import json
from pathlib import Path

import agentscope
from agentscope.agent import Agent
from agentscope.credential import DeepSeekCredential
from agentscope.event import EventType, TextBlockDeltaEvent
from agentscope.message import UserMsg
from agentscope.middleware import MiddlewareBase
from agentscope.model import DeepSeekChatModel
from agentscope.tool import Read, Toolkit

from llm import API_KEY, MODEL

HERE = Path(__file__).parent
DATA_DIR = HERE / "data"

agentscope.setup_logger("WARNING")


class MyMiddleware(MiddlewareBase):
    def __init__(self, file_path):
        self.file_path = file_path

    async def on_reply(self, agent, input_kwargs, next_handler):
        # TODO 1: 用 async for 把 next_handler(**input_kwargs) 产生的事件原样 yield 出去；
        #         循环结束后，用 json.dump 把 agent.state.model_dump(mode="json") 写进 self.file_path
        # Pass every event from next_handler(**input_kwargs) on with async for + yield;
        # after the loop, json.dump agent.state.model_dump(mode="json") into self.file_path
        async for event in next_handler(**input_kwargs):
            yield event

    async def on_reasoning(self, agent, input_kwargs, next_handler):
        async for event in next_handler(**input_kwargs):
            # TODO 2: 如果 event 有 type 属性，并且是 THINKING_BLOCK_START 或 TEXT_BLOCK_START，
            #         先 yield 一个 TextBlockDeltaEvent（reply_id、block_id 照抄，delta 写分隔线）
            # If event has a type that is THINKING_BLOCK_START or TEXT_BLOCK_START, first yield a
            # TextBlockDeltaEvent (copy reply_id and block_id; delta = a divider line)
            yield event

    async def on_acting(self, agent, input_kwargs, next_handler):
        call = input_kwargs["tool_call"]
        # TODO 3: 调用前打印「工具开始调用 + call.name」，把 next_handler 的每一项 yield 出去，最后打印「调用结束」
        # Print "tool starts + call.name", yield every item from next_handler, then print "tool done"
        async for item in next_handler(**input_kwargs):
            yield item

    async def on_system_prompt(self, agent, current_prompt):
        # TODO 4: 在 current_prompt 末尾加上「你的角色名叫 AAG。」再返回
        # Append "your persona name is AAG" to current_prompt and return it
        return current_prompt

    # 选做 TODO 6：照视频写 on_model_call（包住每一次模型请求）。
    #   先 result = await next_handler(**input_kwargs)；再在里面定义 async def wrapped()，
    #   用 async for 把 result 的每一块 yield 出去，结束后打印一行；最后 return wrapped()。
    #   写的时候把下面几行的 # 去掉（只写 def 不写内容会让智能体拿到 None 而出错）。
    # async def on_model_call(self, agent, input_kwargs, next_handler):
    #     ...


async def main():
    model = DeepSeekChatModel(
        credential=DeepSeekCredential(api_key=API_KEY),
        model=MODEL,
        stream=True,
        parameters=DeepSeekChatModel.Parameters(thinking_enable=True),
    )
    agent = Agent(
        name="Friday",
        system_prompt=f"你是一个简洁的中文助手。练习文件在 {DATA_DIR} 里，调用 Read 时使用绝对路径。",
        model=model,
        toolkit=Toolkit(tools=[Read()]),
        # TODO 5: 用 middlewares=[...] 挂上 MyMiddleware(DATA_DIR / "l21_my_agent.json")
        #         Attach MyMiddleware(DATA_DIR / "l21_my_agent.json") with middlewares=[...]
    )

    while True:
        text = input("\n你 / You: ").strip()
        if not text:
            continue
        if text == "/exit":
            break
        async for event in agent.reply_stream(UserMsg(name="user", content=text)):
            if event.type in (EventType.THINKING_BLOCK_DELTA, EventType.TEXT_BLOCK_DELTA):
                print(event.delta, end="", flush=True)
        print()


if __name__ == "__main__":
    asyncio.run(main())
