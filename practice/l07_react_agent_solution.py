r"""第 07 节练习参考答案：视频里的 ReAct Agent（ReAct 提示词 + 原生工具调用 + 最大轮数）
Lesson 07 solution: the video's ReAct agent (a ReAct system prompt + native tool calling + a max-iterations guard)

和视频的思路一样：
1. 用一个函数模拟「球类比赛数据库」，再用 JSON Schema 把它描述给模型（tools 参数）；
2. 系统提示词要求模型按「思考 → 行动 → 观察 → 回答」一步一步来，不要一次就给答案；
3. 对话记录是一个列表，第一条是系统提示词，每次的提问、模型回复、工具结果都存进去；
4. Agent 在一个最多 5 轮的循环里：调用模型 → 打印思考 → 执行工具（行动）→ 打印并交回结果（观察），
   直到模型不再调用工具、给出最终回答。
Same idea as the video:
1. a function simulates a "ball-games database" and is described to the model with JSON Schema (tools);
2. the system prompt asks the model to go step by step (think -> act -> observe -> answer), not answer at once;
3. the conversation is a list whose first item is the system prompt; questions, replies and tool results all go in;
4. the agent loops at most 5 times: call the model -> print its thought -> run the tool (act) ->
   print and hand back the result (observe), until the model stops calling tools and answers.

这一集视频（P8，约 18 分钟）没有再说用的是哪个模型，应该还是 05 集换上的阿里通义千问 qwen-plus；
这里通过 practice/llm.py 用 DeepSeek（deepseek-flash），其余代码的思路和视频一样。
This episode (P8, about 18 min) doesn't name the model again; it presumably still uses Alibaba's
Qwen qwen-plus, which the teacher switched to in episode 05. Here DeepSeek (deepseek-flash) comes
from practice/llm.py; the rest follows the video's approach.
对应视频 / In the video: https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8
    02:07 工具 tool · 04:11 提示词 prompt · 06:48 对话记录 history · 07:52 循环 loop · 11:32 运行 run

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\.venv\Scripts\python.exe l07_react_agent_solution.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY（见 Setup 页）/ the DEEPSEEK_API_KEY environment variable (see Setup).
"""
import json

from llm import MODEL, client

# ---------------------------------------------------------------- 1. 工具：模拟的数据库 / the tool: a fake database
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
        if game_name in game["name"]:          # "排球" 能匹配「排球」和「沙滩排球」/ matches both kinds
            results.append(game)
    if not results:
        return f"没有找到和「{game_name}」有关的比赛。"
    return json.dumps(results, ensure_ascii=False)


# 给模型看的工具说明（05 节）/ the tool description the model reads (lesson 05)
tools = [{
    "type": "function",
    "function": {
        "name": "get_game_info",
        "description": "查询球类比赛的基本介绍和人数规模（每队有几人、比赛时场上有几人）。",
        "parameters": {
            "type": "object",
            "properties": {
                "game_name": {"type": "string", "description": "比赛名称，例如：篮球、排球"},
            },
            "required": ["game_name"],
        },
    },
}]

# 工具字典：名字 → 函数 / dispatch table: name -> function
TOOLS = {"get_game_info": get_game_info}

# ---------------------------------------------------------------- 2. ReAct 系统提示词 / the ReAct system prompt
SYSTEM_PROMPT = """你是一个会使用工具解决问题的助手。不要急着一次给出答案，请按下面的循环一步一步来：

Thought（思考）：写下你对问题的理解，以及下一步打算做什么。
Action（行动）：需要信息时，调用工具去获取。
Observation（观察）：工具的结果会返回给你。读懂它，再进入下一轮思考。

重复「思考 → 行动 → 观察」，直到信息足够，再给出：
Final Answer（回答）：给用户的最终回答。

规则：
1. 每次调用工具之前，先用 "Thought: ..." 写出你的思考。
2. 球类比赛的信息一定要先用工具查询，不要凭记忆回答。
3. 最终回答以 "Final Answer: " 开头，只根据工具返回的真实数据回答。"""

# ---------------------------------------------------------------- 3. 对话记录 + 调用模型 / history + model call
messages = [{"role": "system", "content": SYSTEM_PROMPT}]     # 第一条是系统提示词 / the system prompt comes first


def ask_model():
    """把整个对话记录发给模型，并把模型的回复存进对话记录（06 节）。
    Send the whole history and store the model's reply in it (lesson 06)."""
    response = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)
    reply = response.choices[0].message
    messages.append(reply.model_dump())
    return reply


def run_tool(name, arguments):
    """执行工具；出错时把错误说明当作结果返回，让模型自己改正。
    Run a tool; on failure return the error text so the model can correct itself."""
    if name not in TOOLS:
        return f"错误：没有叫 {name} 的工具，可用的工具有：{', '.join(TOOLS)}"
    try:
        args = json.loads(arguments)          # 字符串 → 字典 / string -> dict
        return TOOLS[name](**args)            # 字典 → 关键字参数 / dict -> keyword arguments
    except Exception as e:
        return f"错误：{type(e).__name__}: {e}"


# ---------------------------------------------------------------- 4. ReAct 循环 / the ReAct loop
def react_agent(question, max_iterations=5):
    messages.append({"role": "user", "content": question})
    current_iteration = 1                                     # 当前是第几轮 / which round we are in
    while current_iteration <= max_iterations:                # 最多循环 max_iterations 轮 / at most max_iterations rounds
        print(f"\n----- 第 {current_iteration} 轮 / round {current_iteration} -----")
        reply = ask_model()
        if reply.content:
            print(reply.content)                              # 思考（最后一轮是回答）/ the thought (or the answer)
        if not reply.tool_calls:                              # 不再调用工具 = 最终回答 / no tool call = final answer
            return reply.content
        for call in reply.tool_calls:                         # 行动：一次可能有好几个 / act: maybe several at once
            print(f"Action: {call.function.name} {call.function.arguments}")
            observation = run_tool(call.function.name, call.function.arguments)
            print(f"Observation: {observation}")              # 观察 / observe
            messages.append({"role": "tool", "tool_call_id": call.id, "content": str(observation)})
        current_iteration += 1                                # 所有结果都存好了，进入下一轮 / next round
    return "达到最大轮数，还没有得到最终答案。/ Reached max_iterations without a final answer."


if __name__ == "__main__":
    question = input("问题 / Question（直接回车用默认问题 / Enter for the default）: ").strip()
    answer = react_agent(question or "比赛场上，篮球队的人数乘以排球队的人数，结果是多少？")
    print("\n===== 最终回答 / Final answer =====")
    print(answer)
