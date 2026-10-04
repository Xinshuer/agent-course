"""第 35 节：工具真正执行之前，先让人审查（参考答案，和视频的例子一样）
Lesson 35: a person reviews the tool call before it runs (solution, same example as the video)

图的结构 / Graph:
    START -> call_llm --没有工具调用 / no tool call--> END
                 |---有工具调用 / tool call--> human_review_node（interrupt）
    human_review_node --continue--> run_tool -> call_llm
                      --update（改参数 / edited args）--> run_tool -> call_llm
                      --feedback（人写的意见 / written feedback）--> call_llm
视频里用的也是 DeepSeek；这里通过 llm.py 用 deepseek-flash。
The video uses DeepSeek too; here it is deepseek-flash via llm.py.

运行环境 / Environment: .venv（需要 DEEPSEEK_API_KEY / needs DEEPSEEK_API_KEY）
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l35_review_tools_solution.py
默认按视频的顺序跑三个例子（大约 5～6 次模型调用）。
RUN_FEEDBACK_DEMO = True 再加一个「feedback」例子（视频只讲了代码，没有演示）。
INTERACTIVE = True 时，问题和审查决定都由你在终端里输入。
By default it runs the video's three examples (about 5-6 model calls).
RUN_FEEDBACK_DEMO = True adds a "feedback" example (the video only explains that branch).
INTERACTIVE = True lets you type the question and the review decision yourself.
"""
from typing import Literal

from langchain_core.tools import tool
from langchain_deepseek import ChatDeepSeek
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.types import Command, interrupt

from llm import API_KEY, MODEL

RUN_FEEDBACK_DEMO = False
INTERACTIVE = False


@tool
def weather_search(city: str) -> str:
    """查询某个城市的天气。 Search for the weather of a city."""
    print("    ----")
    print(f"    正在查询 / searching for: {city}")
    print("    ----")
    return "晴朗！/ Sunny!"          # 不管哪个城市都是晴天（视频里也是写死的）/ always sunny, as in the video


model = ChatDeepSeek(model=MODEL, api_key=API_KEY).bind_tools([weather_search])


class State(MessagesState):
    """简单的状态：什么都不加，和 MessagesState 一样。 Nothing added: the same as MessagesState."""


def call_llm(state: State):
    return {"messages": [model.invoke(state["messages"])]}


def human_review_node(state: State) -> Command[Literal["call_llm", "run_tool"]]:
    last_message = state["messages"][-1]
    tool_call = last_message.tool_calls[-1]

    # 暂停，把工具调用交给人看；恢复时 human_review 就是 Command(resume=...) 里的字典
    # Pause and show the tool call; on resume, human_review is the dict passed in Command(resume=...)
    human_review = interrupt({"question": "这样调用对吗？/ Is this correct?", "tool_call": tool_call})
    review_action = human_review["action"]
    review_data = human_review.get("data")

    if review_action == "continue":                      # 批准：照原样执行 / approve: run it as is
        return Command(goto="run_tool")

    elif review_action == "update":                      # 改参数再执行 / edit the args, then run
        updated_message = {
            "role": "ai",
            "content": last_message.content,
            "tool_calls": [{"id": tool_call["id"], "name": tool_call["name"], "args": review_data}],
            "id": last_message.id,                       # 同一个 id = 替换原消息 / same id = replace the original
        }
        return Command(goto="run_tool", update={"messages": [updated_message]})

    elif review_action == "feedback":                    # 不执行，把人的意见当成工具结果交给模型
        tool_message = {                                 # don't run; give the feedback to the model as the tool result
            "role": "tool",
            "content": review_data,
            "name": tool_call["name"],
            "tool_call_id": tool_call["id"],
        }
        return Command(goto="call_llm", update={"messages": [tool_message]})

    raise ValueError(f"不认识的审查动作 / unknown review action: {review_action}")


def run_tool(state: State):
    new_messages = []
    tools = {"weather_search": weather_search}           # 工具名 -> 工具（分派表，07 节）/ name -> tool
    tool_calls = state["messages"][-1].tool_calls
    for tool_call in tool_calls:
        tool_ = tools[tool_call["name"]]
        result = tool_.invoke(tool_call["args"])
        new_messages.append(
            {"role": "tool", "name": tool_call["name"], "content": result, "tool_call_id": tool_call["id"]}
        )
    return {"messages": new_messages}


def route_after_llm(state: State) -> Literal[END, "human_review_node"]:   # END 就是字符串 "__end__"
    if len(state["messages"][-1].tool_calls) == 0:
        return END
    else:
        return "human_review_node"


builder = StateGraph(State)
builder.add_node(call_llm)                 # 只传函数时，节点名就是函数名 / node name = function name
builder.add_node(run_tool)
builder.add_node(human_review_node)
builder.add_edge(START, "call_llm")
builder.add_conditional_edges("call_llm", route_after_llm)
builder.add_edge("run_tool", "call_llm")
# human_review_node 自己用 Command(goto=...) 决定去哪，所以不用给它加边
# human_review_node picks its next node with Command(goto=...), so it needs no edges
graph = builder.compile(checkpointer=InMemorySaver())


def show(stream):
    """把每一步简短地打印出来（完整的 AIMessage 太长）。 Print each step briefly."""
    for event in stream:
        for node, update in event.items():
            if node == "__interrupt__":
                payload = update[0].value
                call = payload["tool_call"]
                print(f"  [暂停 / paused] {payload['question']}  {call['name']}({call['args']})")
                continue
            if not update:                               # 例如 continue：只跳转，不改状态 / e.g. continue: no update
                print(f"  [{node}] （没有修改状态 / no state update）")
                continue
            msg = update["messages"][-1]
            if isinstance(msg, dict):                    # 我们自己写的字典消息 / our own dict messages
                print(f"  [{node}]", msg.get("tool_calls") or msg.get("content"))
            else:                                        # 模型返回的 AIMessage / an AIMessage from the model
                print(f"  [{node}]", msg.tool_calls or msg.content)


def ask_decision():
    """INTERACTIVE 模式下在终端里做决定。 Make the decision in the terminal (INTERACTIVE mode)."""
    choice = input("continue / update / feedback: ").strip()
    if choice == "update":
        return {"action": "update", "data": {"city": input("新的 city / new city: ")}}
    if choice == "feedback":
        return {"action": "feedback", "data": input("你的意见 / your feedback: ")}
    return {"action": "continue"}


def run_demo(thread_id, question, decisions):
    """问一个问题；每次暂停时按顺序用 decisions 里的决定恢复。 Ask, then resume with each decision in turn."""
    print(f"\n===== thread {thread_id}: {question} =====")
    config = {"configurable": {"thread_id": thread_id}}
    show(graph.stream({"messages": [{"role": "user", "content": question}]}, config, stream_mode="updates"))
    while graph.get_state(config).interrupts:
        if INTERACTIVE:
            decision = ask_decision()
        elif decisions:
            decision = decisions.pop(0)
        else:
            # 预先写好的决定用完了，图却又停下来了（模型又提出了新的调用）：不自动批准，演示到此为止
            # The scripted decisions ran out but the graph paused again (a new call): don't auto-approve, stop here
            print("  （图又停在审查节点了，预设的决定已用完；把 INTERACTIVE 改成 True 可以自己决定）")
            print("  (paused for review again and no scripted decision is left; set INTERACTIVE = True to decide yourself)")
            return
        print("  人的决定 / human decision:", decision)
        show(graph.stream(Command(resume=decision), config, stream_mode="updates"))


def main():
    if INTERACTIVE:
        run_demo("me", input("问点什么 / ask something: "), [])
        return
    # 1. 没有工具调用：不会触发审查 / no tool call: no review
    run_demo("1", "你好", [])
    # 2. 审查后批准 / review and approve
    run_demo("2", "北京天气如何？", [{"action": "continue"}])
    # 3. 审查时修改参数 / edit the arguments during review
    run_demo("3", "深圳天气如何？", [{"action": "update", "data": {"city": "上海, 中国"}}])
    # 4. 补充：用意见让模型自己重新调用 / extra: written feedback, the model retries by itself
    if RUN_FEEDBACK_DEMO:
        run_demo("4", "深圳天气如何？",
                 [{"action": "feedback", "data": "地点请写成「城市, 国家」的格式"}, {"action": "continue"}])


if __name__ == "__main__":
    main()
