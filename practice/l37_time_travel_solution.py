"""第 37 节练习：时光旅行——查看历史、重放、分叉（参考答案，真模型）
Lesson 37 exercise: time travel - history, replay, fork (solution, real model)

视频里的「放歌」智能体：两个模拟工具（QQ 音乐 / 网易云音乐），agent ⇄ action 循环。
视频用的是 OpenAI 的 GPT-4o，这里换成 DeepSeek（practice/llm.py 里的 MODEL）。
The music agent from the video: two mock tools (QQ Music / NetEase Cloud Music) and an
agent ⇄ action loop. The video uses OpenAI's GPT-4o; here we use DeepSeek (MODEL in llm.py).

本程序一共调用模型 4 次：第一次运行 2 次，重放 1 次，分叉 1 次。
This program calls the model 4 times: 2 for the first run, 1 for the replay, 1 for the fork.
不花钱的模拟版 / Free fake-model version: l37_time_travel.py

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l37_time_travel_solution.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY（见 Setup 页）/ the DEEPSEEK_API_KEY variable (see Setup)
TODO 版 / TODO version: l37_time_travel_todo.py
"""
from langchain_core.tools import tool
from langchain_deepseek import ChatDeepSeek
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode

from llm import API_KEY, MODEL


@tool
def play_song_on_qq(song: str):
    """在 QQ 音乐上播放一首歌。"""
    return f"成功在 QQ 音乐上播放了《{song}》"      # 模拟：没有真的调用 QQ 音乐 / mock: no real API


@tool
def play_song_on_163(song: str):
    """在网易云音乐上播放一首歌。"""
    return f"成功在网易云音乐上播放了《{song}》"


tools = [play_song_on_qq, play_song_on_163]


def build_app(model):
    model_with_tools = model.bind_tools(tools)

    def call_model(state: MessagesState):
        response = model_with_tools.invoke(state["messages"])
        return {"messages": [response]}

    def should_continue(state: MessagesState):
        last_message = state["messages"][-1]
        if not last_message.tool_calls:
            return "end"
        return "continue"

    workflow = StateGraph(MessagesState)
    workflow.add_node("agent", call_model)
    workflow.add_node("action", ToolNode(tools))
    workflow.add_edge(START, "agent")
    workflow.add_conditional_edges("agent", should_continue, {"continue": "action", "end": END})
    workflow.add_edge("action", "agent")
    return workflow.compile(checkpointer=InMemorySaver())


if __name__ == "__main__":
    model = ChatDeepSeek(model=MODEL, api_key=API_KEY)
    app = build_app(model)
    config = {"configurable": {"thread_id": "1"}}

    # 1. 正常运行一次 / run once
    question = {"role": "user", "content": "你能播放一首周杰伦播放量最高的歌吗？"}
    for event in app.stream({"messages": [question]}, config, stream_mode="values"):
        event["messages"][-1].pretty_print()

    # 2. 查看历史：每个快照放进列表（最新的在前）/ the history as a list (newest first)
    all_states = []
    for state in app.get_state_history(config):
        print("step", state.metadata["step"], "next", state.next)
        all_states.append(state)

    # 3. 重放：从 all_states[2]（下一步是 action）重新执行 / replay from all_states[2] (next: action)
    to_replay = all_states[2]
    print("\n== 重放 / replay, to_replay.next =", to_replay.next)
    for event in app.stream(None, to_replay.config, stream_mode="values"):
        event["messages"][-1].pretty_print()

    # 4. 分叉：把工具名改成 play_song_on_163，写回状态，再继续
    #    Fork: rename the tool call to play_song_on_163, write it back, then continue
    last_message = to_replay.values["messages"][-1]
    last_message.tool_calls[0]["name"] = "play_song_on_163"
    branch_config = app.update_state(to_replay.config, {"messages": [last_message]})
    print("\n== 分叉 / fork")
    for event in app.stream(None, branch_config, stream_mode="values"):
        event["messages"][-1].pretty_print()

    print("\n检查点总数 / checkpoints:", len(list(app.get_state_history(config))))
