"""第 19 节练习（TODO 版）：每轮对话后存档，重启程序后 Agent 还记得
Lesson 19 exercise (TODO version): save the state after every turn, so the agent still remembers after a restart

补全 save_state、load_state 和启动时的读档判断（共 5 个 TODO）。
Complete save_state, load_state and the start-up check (5 TODOs in total).

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l19_state_todo.py
试试 / Try:  第 1 次 run 1: 我们约定一个暗号：我爱吃香蕉皮  ->  /exit ；第 2 次 run 2: 暗号是什么？  ->  /exit
参考答案 / Solution: l19_state_solution.py
"""
import asyncio
import json
from pathlib import Path

from agentscope.agent import Agent, ContextConfig
from agentscope.credential import DeepSeekCredential
from agentscope.event import EventType
from agentscope.message import UserMsg
from agentscope.model import DeepSeekChatModel
from agentscope.state import AgentState
from agentscope.workspace import LocalWorkspace

from llm import API_KEY, MODEL

STATE_FILE = Path(__file__).parent / "data" / "l19_agent_state_todo.json"
WORKDIR = Path(__file__).parent / "data" / "l19_workspace"


def save_state(agent: Agent, path) -> None:
    # TODO 1: 用 agent.state.model_dump(mode="json") 把状态变成普通字典
    #         Turn the state into a plain dict with agent.state.model_dump(mode="json")
    data = {}

    # TODO 2: 用 with open(path, "w", encoding="utf-8") as f: 打开文件，
    #         再用 json.dump(data, f, ensure_ascii=False, indent=2) 写进去
    #         Open the file for writing and json.dump the dict into it
    pass


def load_state(path) -> AgentState:
    # TODO 3: 用 with open(path, encoding="utf-8") as f: 打开文件，用 json.load(f) 读出字典
    #         Open the file and read the dict back with json.load(f)
    data = {}

    # TODO 4: 用 AgentState.model_validate(data) 把字典变回 AgentState 并 return
    #         Turn the dict back into an AgentState with AgentState.model_validate(data) and return it
    return AgentState()


async def main():
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    workspace = LocalWorkspace(workdir=str(WORKDIR))
    await workspace.initialize()
    config = ContextConfig(trigger_ratio=0.8, reserve_ratio=0.1, tool_result_limit=3000)
    model = DeepSeekChatModel(credential=DeepSeekCredential(api_key=API_KEY), model=MODEL, stream=True)

    state = None
    # TODO 5: 如果 STATE_FILE 存在（STATE_FILE.exists()），就用 load_state 读档，结果存进 state
    #         If STATE_FILE exists, load it with load_state and store the result in state

    agent = Agent(name="Friday", system_prompt="你是一个简洁的助手。", model=model,
                  state=state, offloader=workspace, context_config=config)

    while True:
        text = input("\n你 / You: ").strip()
        if not text:
            continue
        if text == "/exit":
            break
        print("Friday: ", end="", flush=True)
        async for event in agent.reply_stream(UserMsg(name="user", content=text)):
            if event.type == EventType.TEXT_BLOCK_DELTA:
                print(event.delta, end="", flush=True)
        print()
        save_state(agent, STATE_FILE)

    await workspace.close()


if __name__ == "__main__":
    asyncio.run(main())
