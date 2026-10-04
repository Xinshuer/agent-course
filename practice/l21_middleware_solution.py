"""第 21 节练习（参考答案）：自己写一个 AgentScope 中间件——视频里的五个例子。
Lesson 21 exercise (solution): write your own AgentScope middleware - the five examples from the video.

MyMiddleware 重写了五个钩子 / MyMiddleware overrides five hooks:
    on_reply          整次回复结束后，把智能体状态存成 JSON 文件（第 19 节的持久化）
                      after a whole reply, save the agent state to a JSON file (persistence, lesson 19)
    on_reasoning      在「思考」和「回答」开始的地方插入分隔线，让两者分开显示
                      insert divider lines where thinking and answering start, so they print separately
    on_model_call     模型调用开始 / 结束时各打印一行（简单演示）
                      print a line when a model call starts and ends (a simple demo)
    on_acting         工具开始调用 / 调用结束时各打印一行
                      print a line when a tool call starts and ends
    on_system_prompt  在系统提示词末尾加上角色名（不是洋葱，是流水线）
                      append a persona name to the system prompt (a pipeline, not an onion)

试着问 / Try:
    你好                                  -> 看分隔线 / watch the dividers; data\\l21_my_agent.json appears
    读一下 data 文件夹里的 l21_note.txt    -> 看工具开始 / 结束 / watch tool start / end
    你叫什么名字？                        -> 回答 AAG / answers AAG
  输入 /exit 退出 / type /exit to quit

运行环境 / Environment: .venv （需要 DEEPSEEK_API_KEY / needs DEEPSEEK_API_KEY）
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l21_middleware_solution.py
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
    """视频里的自定义中间件。 The custom middleware from the video."""

    def __init__(self, file_path):
        self.file_path = file_path                     # 存档文件的位置，后面 on_reply 要用

    # ① on_reply：包住一整次回复（洋葱型）
    #    on_reply: wraps one whole reply (onion)
    async def on_reply(self, agent, input_kwargs, next_handler):
        # 前置代码：这里不需要 / no "before" code needed here
        async for event in next_handler(**input_kwargs):   # 交给下一层，事件原样往外交
            yield event
        # 后置代码：整次回复结束后存档 / "after" code: save once the reply is finished
        with open(self.file_path, "w", encoding="utf-8") as f:
            json.dump(agent.state.model_dump(mode="json"), f, ensure_ascii=False, indent=2)

    # ② on_reasoning：包住一次推理（洋葱型），在思考 / 回答开始处插入分隔线
    #    on_reasoning: wraps one reasoning step (onion); insert dividers where thinking / answering start
    async def on_reasoning(self, agent, input_kwargs, next_handler):
        async for event in next_handler(**input_kwargs):
            # 最后一项是 Msg，它没有 type 属性，所以先用 hasattr 检查
            # the last item is a Msg, which has no type attribute, so check with hasattr first
            if hasattr(event, "type") and event.type in (EventType.THINKING_BLOCK_START, EventType.TEXT_BLOCK_START):
                label = "🧠 思考 / thinking" if event.type == EventType.THINKING_BLOCK_START else "💬 回答 / answer"
                yield TextBlockDeltaEvent(               # 造一个「文字片段」事件，输出循环会把它打印出来
                    reply_id=event.reply_id,
                    block_id=event.block_id,            # 编号原样带上 / keep the same ids
                    delta=f"\n////////////// {label} //////////////\n",
                )
            yield event                                  # 原来的事件也照常交出去 / pass the original on too

    # ③ on_model_call：包住一次模型 API 调用。流式模型返回的是异步生成器，
    #    所以要再定义一个函数把它包起来，最后返回这个函数产生的生成器
    #    on_model_call: wraps one model API call. A streaming model returns an async generator,
    #    so define another function that wraps it and return the generator it produces
    async def on_model_call(self, agent, input_kwargs, next_handler):
        print("\n[模型调用开始 / model call starts]")
        result = await next_handler(**input_kwargs)     # 先 await 拿到结果（一个异步生成器）

        async def wrapped():
            async for chunk in result:                  # 一块一块原样交出去 / pass every chunk on
                yield chunk
            print("\n[模型调用结束 / model call ends]")

        return wrapped()                                # 返回包好的生成器 / return the wrapped generator

    # ④ on_acting：包住一次工具执行（洋葱型）
    #    on_acting: wraps one tool execution (onion)
    async def on_acting(self, agent, input_kwargs, next_handler):
        call = input_kwargs["tool_call"]                # 这次要执行的工具调用 / the tool call to run
        print(f"\n[工具开始调用 / tool starts] {call.name}")
        async for item in next_handler(**input_kwargs):
            yield item
        print(f"[工具调用结束 / tool done] {call.name}")

    # ⑤ on_system_prompt：收到当前的系统提示词，返回改过的（流水线型）
    #    on_system_prompt: receive the current system prompt, return a changed one (pipeline)
    async def on_system_prompt(self, agent, current_prompt):
        return current_prompt + "\n你的角色名叫 AAG。被问到名字时就这样回答。"


async def main():
    model = DeepSeekChatModel(
        credential=DeepSeekCredential(api_key=API_KEY),
        model=MODEL,
        stream=True,
        parameters=DeepSeekChatModel.Parameters(thinking_enable=True),   # 打开思考，才有思考过程可分隔
    )
    agent = Agent(
        name="Friday",
        system_prompt=f"你是一个简洁的中文助手。练习文件在 {DATA_DIR} 里，调用 Read 时使用绝对路径。",
        model=model,
        toolkit=Toolkit(tools=[Read()]),                # 只读的内置读文件工具 / the read-only built-in Read tool
        middlewares=[MyMiddleware(DATA_DIR / "l21_my_agent.json")],
    )

    while True:
        text = input("\n你 / You: ").strip()
        if not text:
            continue
        if text == "/exit":
            break
        async for event in agent.reply_stream(UserMsg(name="user", content=text)):
            if event.type in (EventType.THINKING_BLOCK_DELTA, EventType.TEXT_BLOCK_DELTA):
                print(event.delta, end="", flush=True)  # 思考和回答都打印 / print thinking and answer
        print()


if __name__ == "__main__":
    asyncio.run(main())
