r"""第 07 节练习：视频里的 ReAct Agent（TODO 版）
Lesson 07 exercise: the video's ReAct agent (TODO version)

补全 4 个 TODO，让 Agent 回答「比赛场上，篮球队的人数乘以排球队的人数，结果是多少？」：
它会先思考，再调用 get_game_info 查篮球和排球的人数（行动），看到结果（观察）后算出答案。
Fill in the 4 TODOs so the agent can answer "On court, basketball team size times volleyball team size?":
it thinks, calls get_game_info for basketball and volleyball (act), reads the results (observe), then answers.

对应视频 / In the video: https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8
    02:07 工具 tool · 04:11 提示词 prompt · 06:48 对话记录 history · 07:52 循环 loop · 11:32 运行 run

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\.venv\Scripts\python.exe l07_react_agent_todo.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY（见 Setup 页）/ the DEEPSEEK_API_KEY environment variable (see Setup).
参考答案 / Solution: l07_react_agent_solution.py
"""
import json

from llm import MODEL, client

# ---------------------------------------------------------------- 工具（已写好）/ the tool (given)
GAMES = [
    {"name": "篮球", "intro": "两队把球投进对方的篮筐得分。", "players": "每队一般有 12 名队员，比赛时每队场上 5 人，其余是替补。"},
    {"name": "排球", "intro": "两队隔着球网击球，不让球落在本方场地上。", "players": "比赛时每队场上 6 人，其余是替补。"},
    {"name": "沙滩排球", "intro": "在沙地上进行的排球比赛。", "players": "每队只有 2 人，没有替补。"},
    {"name": "足球", "intro": "两队用脚把球踢进对方的球门得分。", "players": "比赛时每队场上 11 人，其中 1 人是守门员。"},
]


def get_game_info(game_name):
    """按比赛名称查询：名称里包含 game_name 的比赛都会返回。
    Look up games whose name contains game_name."""
    results = []
    for game in GAMES:
        if game_name in game["name"]:
            results.append(game)
    if not results:
        return f"没有找到和「{game_name}」有关的比赛。"
    return json.dumps(results, ensure_ascii=False)


# TODO 1: 写工具说明 tools（05 节）：一个列表，里面一个 {"type": "function", "function": {...}}
#         name 是 "get_game_info"；description 写清楚「查询球类比赛的基本介绍和人数规模」；
#         parameters 里只有一个字符串参数 game_name，并且是必填（required）。
#         Write the tools list (lesson 05): name "get_game_info", a clear description,
#         and one required string parameter game_name.
tools = []

TOOLS = {"get_game_info": get_game_info}     # 工具字典（已写好）/ dispatch table (given)

# TODO 2: 用三引号写 ReAct 系统提示词，至少要说清楚：
#         - 不要一次给出答案，按 Thought（思考）→ Action（行动：调用工具）→ Observation（观察：工具结果）循环
#         - 每次调用工具之前先写 "Thought: ..."；球类比赛的信息一定要用工具查，不要凭记忆回答
#         - 信息足够了再用 "Final Answer: ..." 给出最终回答
#         Write the ReAct system prompt in triple quotes: the Thought -> Action -> Observation loop,
#         "Thought: ..." before each tool call, always use the tool, finish with "Final Answer: ...".
SYSTEM_PROMPT = """（在这里写 / write it here）"""

messages = [{"role": "system", "content": SYSTEM_PROMPT}]     # 第一条是系统提示词 / the system prompt comes first


def ask_model():
    """把整个对话记录发给模型，并把回复存进对话记录（06 节，已写好）。
    Send the whole history and store the reply (lesson 06, given)."""
    response = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)
    reply = response.choices[0].message
    messages.append(reply.model_dump())
    return reply


def run_tool(name, arguments):
    """执行工具；出错时返回错误说明。 Run a tool; return the error text on failure."""
    # TODO 3: 1) name 不在 TOOLS 里 → 返回一句错误说明
    #         2) try: args = json.loads(arguments)，再 return TOOLS[name](**args)
    #            except Exception as e: return f"错误：{e}"
    #         1) unknown name -> return an error message
    #         2) try: json.loads + TOOLS[name](**args); except Exception as e: return the error
    return "TODO 3"


def react_agent(question, max_iterations=5):
    messages.append({"role": "user", "content": question})
    current_iteration = 1
    # TODO 4: 写循环：while current_iteration <= max_iterations:
    #         1) reply = ask_model()，有 reply.content 就打印出来（这是模型的思考）
    #         2) 如果 reply.tool_calls 是空的（if not reply.tool_calls）→ return reply.content（最终回答）
    #         3) for call in reply.tool_calls：用 run_tool(call.function.name, call.function.arguments) 执行，
    #            打印 Observation，再把 {"role": "tool", "tool_call_id": call.id, "content": str(结果)} 存进 messages
    #         4) 别忘了 current_iteration += 1，否则循环停不下来
    #         Loop while current_iteration <= max_iterations: ask the model and print its thought;
    #         no tool_calls -> return the answer; otherwise run every call, print and store each result
    #         as a tool message; then current_iteration += 1.
    return "达到最大轮数，还没有得到最终答案。/ Reached max_iterations without a final answer."


if __name__ == "__main__":
    question = input("问题 / Question（直接回车用默认问题 / Enter for the default）: ").strip()
    answer = react_agent(question or "比赛场上，篮球队的人数乘以排球队的人数，结果是多少？")
    print("\n===== 最终回答 / Final answer =====")
    print(answer)
