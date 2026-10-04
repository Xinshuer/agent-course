"""第 19 节练习参考答案：每轮对话后存档，重启程序后 Agent 还记得（对应视频 05:11 起的完整代码）
Lesson 19 solution: save the state after every turn, so the agent still remembers after a restart
(the full program the video shows from 05:11)

- 启动时：practice\\data\\l19_agent_state.json 存在就读档，不存在就从头开始
  On start: load practice\\data\\l19_agent_state.json if it exists, otherwise start fresh
- 每轮对话后：把 agent.state 存进这个文件 / After every turn: save agent.state to that file
- 上下文配置 ContextConfig + 工作空间 offloader，和视频一样 / ContextConfig + workspace offloader, as in the video

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l19_state_solution.py
试试（视频 06:45 起的测试）/ Try (the video's test from 06:45):
    第 1 次运行 / run 1:  我们约定一个暗号：我爱吃香蕉皮。一定要记住。   ->  /exit
    第 2 次运行 / run 2:  暗号是什么？                                   ->  /exit
    /reset 删除存档 / deletes the save file
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

STATE_FILE = Path(__file__).parent / "data" / "l19_agent_state.json"
WORKDIR = Path(__file__).parent / "data" / "l19_workspace"


def save_state(agent: Agent, path) -> None:
    """把 Agent 的状态存成 JSON 文件。 Save the agent's state as a JSON file."""
    data = agent.state.model_dump(mode="json")  # 对象 -> 普通字典（枚举变成字符串）/ object -> plain dict
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def load_state(path) -> AgentState:
    """从 JSON 文件读回状态。 Load the state back from a JSON file."""
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    return AgentState.model_validate(data)  # 普通字典 -> AgentState 对象 / plain dict -> AgentState


async def main():
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)

    # 工作空间 + 上下文配置（视频 01:32 起）/ workspace + context settings
    workspace = LocalWorkspace(workdir=str(WORKDIR))
    await workspace.initialize()
    config = ContextConfig(
        trigger_ratio=0.8,       # 超过上下文窗口的 80% 就压缩 / compress above 80% of the window
        reserve_ratio=0.1,       # 最近约 10% 的内容原样保留 / keep the latest ~10% verbatim
        tool_result_limit=3000,  # 单个工具结果最多 3000 token / cap each tool result at 3000 tokens
    )
    model = DeepSeekChatModel(credential=DeepSeekCredential(api_key=API_KEY), model=MODEL, stream=True)

    # 有存档就读档，没有就不传 state（视频 05:42）/ load the save file if there is one
    state = None
    if STATE_FILE.exists():
        state = load_state(STATE_FILE)
        print(f"读取存档 / loaded: {len(state.context)} 条消息 messages")
    else:
        print("没有存档，从头开始 / no save file: starting fresh")

    agent = Agent(
        name="Friday",
        system_prompt="你是一个简洁的助手。",
        model=model,
        state=state,              # None 时 Agent 会自己新建一个状态 / None -> a fresh state
        offloader=workspace,
        context_config=config,
    )
    # 视频里这里还有一行手动压缩，演示前删掉了 / the video had a manual compression line here, removed before the demo
    # await agent.compress_context()

    while True:
        text = input("\n你 / You: ").strip()
        if not text:
            continue
        if text == "/exit":
            break
        if text == "/reset":
            STATE_FILE.unlink(missing_ok=True)
            print("存档已删除，下次运行从头开始 / save deleted; the next run starts fresh")
            break
        print("Friday: ", end="", flush=True)
        async for event in agent.reply_stream(UserMsg(name="user", content=text)):
            if event.type == EventType.TEXT_BLOCK_DELTA:
                print(event.delta, end="", flush=True)
        print()
        save_state(agent, STATE_FILE)  # 每轮都存档（视频 06:14）/ save after every turn
        print(f"  (已存档 saved: {len(agent.state.context)} 条消息 messages)")

    await workspace.close()


if __name__ == "__main__":
    asyncio.run(main())
