"""第 37 节练习：时光旅行——查看历史、重放、分叉（TODO 版，真模型）
Lesson 37 exercise: time travel - history, replay, fork (TODO version, real model)

图已经搭好了：视频里的「放歌」智能体（agent ⇄ action 循环，带检查点）。
你要补全 __main__ 里的 4 个 TODO：运行一次、查看历史、重放、分叉。
The graph is ready: the music agent from the video (agent ⇄ action loop, with a checkpointer).
Complete the 4 TODOs in __main__: run once, inspect the history, replay, fork.

做完一共调用模型 4 次。想先免费练习，可以换成 l37_time_travel.py 里的模拟版：
在 __main__ 里写 from l37_time_travel import build_app，再写 app = build_app()（模拟版不需要 model 参数）。
Done, it calls the model 4 times. To practise for free first, switch to the fake model in
l37_time_travel.py: in __main__ write from l37_time_travel import build_app and then
app = build_app() (the fake version takes no model argument).

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l37_time_travel_todo.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY（见 Setup 页）/ the DEEPSEEK_API_KEY variable (see Setup)
参考答案 / Solution: l37_time_travel_solution.py
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
    return f"成功在 QQ 音乐上播放了《{song}》"


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

    # TODO 1: 用 config 运行一次，问「你能播放一首周杰伦播放量最高的歌吗？」
    #         用 stream_mode="values"，每次打印最后一条消息：event["messages"][-1].pretty_print()
    #         Run once with config and the question above; with stream_mode="values",
    #         pretty_print the last message of every event

    # TODO 2: 新建空列表 all_states，用 for 遍历 app.get_state_history(config)，
    #         打印每个快照的 metadata["step"] 和 next，并 append 进 all_states
    #         Make an empty list all_states; loop over app.get_state_history(config),
    #         print each snapshot's metadata["step"] and next, and append it to all_states

    # TODO 3: 重放：to_replay = all_states[2]（打印 to_replay.next 确认是 ('action',)），
    #         再用 app.stream(None, to_replay.config, stream_mode="values") 重新执行并打印
    #         Replay: to_replay = all_states[2] (print to_replay.next: it should be ('action',)),
    #         then rerun with app.stream(None, to_replay.config, stream_mode="values") and print

    # TODO 4: 分叉：取 to_replay.values["messages"][-1]，把 tool_calls[0]["name"] 改成 "play_song_on_163"，
    #         用 app.update_state(to_replay.config, {"messages": [改过的消息]}) 得到 branch_config，
    #         再用 app.stream(None, branch_config, stream_mode="values") 继续并打印
    #         Fork: take the last message of to_replay, rename tool_calls[0]["name"] to "play_song_on_163",
    #         get branch_config from update_state, then continue from it with app.stream and print
