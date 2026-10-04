"""第 37 节演示：时光旅行——查看历史、重放、分叉（模拟模型，不调用 API，免费运行）
Lesson 37 demo: time travel - history, replay, fork (fake model, no API calls, free)

和视频一样的「放歌」智能体：agent 节点决定调用哪个工具，action 节点执行工具。
这里的 agent 节点用固定规则代替真模型，所以可以随便重放、分叉，不花钱。
每个节点、每个工具运行时都会打印一行，方便看出重放时哪些步骤又执行了一遍。
The same music agent as in the video: the agent node decides which tool to call and the
action node runs it. Here the agent node follows fixed rules instead of a real model, so you
can replay and fork as often as you like for free. Every node and tool prints a line when it
runs, so you can see which steps run again during a replay.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l37_time_travel.py
不需要 API key / No API key needed.
真模型版本 / Real-model version: l37_time_travel_solution.py
"""
from langchain_core.messages import AIMessage
from langchain_core.tools import tool
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode


@tool
def play_song_on_qq(song: str):
    """在 QQ 音乐上播放一首歌。/ Play a song on QQ Music."""
    print(f"    [工具 / tool] QQ 音乐播放 / QQ Music plays: {song}")
    return f"成功在 QQ 音乐上播放了《{song}》"


@tool
def play_song_on_163(song: str):
    """在网易云音乐上播放一首歌。/ Play a song on NetEase Cloud Music."""
    print(f"    [工具 / tool] 网易云音乐播放 / NetEase plays: {song}")
    return f"成功在网易云音乐上播放了《{song}》"


tools = [play_song_on_qq, play_song_on_163]


def call_model(state: MessagesState):
    # 模拟模型 / fake model:
    #   用户刚提问 → 请求调用 play_song_on_qq / the user just asked → ask for play_song_on_qq
    #   工具执行完 → 根据工具结果回答       / a tool has run → answer from the tool result
    print("    [节点 / node] agent")
    last_message = state["messages"][-1]
    if last_message.type == "human":
        call = {"name": "play_song_on_qq", "args": {"song": "晴天"}, "id": "call_1", "type": "tool_call"}
        return {"messages": [AIMessage(content="", tool_calls=[call])]}
    return {"messages": [AIMessage(content=f"好的！{last_message.content}，希望你喜欢。")]}


def should_continue(state: MessagesState):
    last_message = state["messages"][-1]
    if not last_message.tool_calls:
        return "end"
    return "continue"


def build_app():
    workflow = StateGraph(MessagesState)
    workflow.add_node("agent", call_model)
    workflow.add_node("action", ToolNode(tools))
    workflow.add_edge(START, "agent")
    workflow.add_conditional_edges("agent", should_continue, {"continue": "action", "end": END})
    workflow.add_edge("action", "agent")
    return workflow.compile(checkpointer=InMemorySaver())   # 没有检查点就没有时光旅行 / no checkpointer, no time travel


if __name__ == "__main__":
    app = build_app()
    config = {"configurable": {"thread_id": "1"}}

    print("== 1. 正常运行一次 / run once")
    question = {"role": "user", "content": "你能播放一首周杰伦播放量最高的歌吗？"}
    for event in app.stream({"messages": [question]}, config, stream_mode="values"):
        event["messages"][-1].pretty_print()

    print("\n== 2. 当前状态 / current state")
    print("消息条数 / messages:", len(app.get_state(config).values["messages"]))

    print("\n== 3. 历史快照（最新的在前）/ history (newest first)")
    all_states = []
    for state in app.get_state_history(config):
        all_states.append(state)
    for i, state in enumerate(all_states):          # enumerate：同时拿到下标和元素 / index + item
        print(f"  all_states[{i}]  step={state.metadata['step']:>2}  next={state.next}")

    print("\n== 4. 重放：从 all_states[2] 开始 / replay from all_states[2]")
    to_replay = all_states[2]
    print("to_replay.next =", to_replay.next)
    for event in app.stream(None, to_replay.config, stream_mode="values"):
        event["messages"][-1].pretty_print()

    print("\n== 5. 分叉：改成网易云音乐再继续 / fork: switch to NetEase and continue")
    last_message = to_replay.values["messages"][-1]
    last_message.tool_calls[0]["name"] = "play_song_on_163"
    branch_config = app.update_state(to_replay.config, {"messages": [last_message]})
    for event in app.stream(None, branch_config, stream_mode="values"):
        event["messages"][-1].pretty_print()

    print("\n== 6. 现在的历史：旧的检查点一个都没少 / the history now: no checkpoint was lost")
    for state in app.get_state_history(config):
        print(f"  step={state.metadata['step']:>2}  source={state.metadata['source']:<6}  next={state.next}")
