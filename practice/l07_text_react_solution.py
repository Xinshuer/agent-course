r"""第 07 节拓展练习参考答案：不用 tools 参数，纯文字版的 ReAct Agent（视频里没有这一部分）
Lesson 07 extension solution: a text-only ReAct agent without the tools parameter (not in the video)

视频的写法（ReAct 提示词 + 原生工具调用）见 l07_react_agent_solution.py。这里是 ReAct 论文的原始写法：
模型只会写文字：它按 Thought / Action / Action Input 的格式说出「想做什么」，
我们的代码用正则把工具名和参数解析出来，从工具字典里找到函数执行，
再把结果作为 Observation 发回给模型，一直循环到模型写出 Final Answer。
The video's version (ReAct prompt + native tool calling) is l07_react_agent_solution.py. This is the
original ReAct style: the model only writes text, stating what it wants in a Thought / Action /
Action Input format. Our code parses the tool name and arguments with regular expressions, runs the
function from a dict of tools, sends the result back as an Observation, and loops until the model
writes a Final Answer.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\.venv\Scripts\python.exe l07_text_react_solution.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY（见 Setup 页）；天气来自 Open-Meteo，不需要 key。
              the DEEPSEEK_API_KEY environment variable (see Setup); weather comes from Open-Meteo, no key.
"""
import json
import re

from llm import MODEL, client
from weather_tool import get_weather

# ---------------------------------------------------------------- 1. 工具 / tools
CITY_COORDS = {
    "北京": {"latitude": 39.9042, "longitude": 116.4074},
    "上海": {"latitude": 31.2304, "longitude": 121.4737},
    "广州": {"latitude": 23.1291, "longitude": 113.2644},
    "深圳": {"latitude": 22.5431, "longitude": 114.0579},
    "杭州": {"latitude": 30.2741, "longitude": 120.1551},
    "成都": {"latitude": 30.5728, "longitude": 104.0668},
}


def get_coordinates(city):
    """查城市的经纬度 / Look up a city's latitude and longitude."""
    if city not in CITY_COORDS:
        return f"没有找到城市：{city}（可以查：{', '.join(CITY_COORDS)}）"
    return json.dumps(CITY_COORDS[city])


# 工具字典：名字 → 函数 / dispatch table: name -> function
TOOLS = {
    "get_coordinates": get_coordinates,
    "get_weather": get_weather,
}

TOOL_DESCRIPTIONS = """- get_coordinates: 查询城市的经纬度。Action Input 示例：{"city": "北京"}
- get_weather: 根据经纬度查询当前气温（摄氏度）。Action Input 示例：{"latitude": 39.9, "longitude": 116.4}"""

# ---------------------------------------------------------------- 2. 提示词模板 / prompt template
REACT_PROMPT = """你是一个会使用工具的助手。请按「思考 → 行动 → 观察」的方式一步一步解决问题。

你可以使用这些工具：
{tools}

每次回复只能使用下面两种格式之一。

格式一（需要调用工具时）：
Thought: 你现在的想法，以及下一步要做什么
Action: 工具名，必须是 {tool_names} 之一
Action Input: 工具参数，写成一个 JSON 对象

格式二（已经能回答时）：
Thought: 我已经知道最终答案了
Final Answer: 给用户的最终回答

规则：
1. 每次只写一个 Action，写完 Action Input 就停下，等待 Observation（工具结果）。
2. 不要自己编写 Observation。
3. 只根据 Observation 里的真实数据回答。"""

SYSTEM_PROMPT = REACT_PROMPT.format(tools=TOOL_DESCRIPTIONS, tool_names=", ".join(TOOLS))

MAX_STEPS = 6


# ---------------------------------------------------------------- 3. 解析 / parsing
def parse_action(text):
    """从模型回复里取出 (工具名, 参数字符串)；格式不对就返回 None。
    Return (tool name, argument string) from the reply, or None if the format is wrong."""
    action = re.search(r"Action:\s*(\w+)", text)
    action_input = re.search(r"Action Input:\s*(\{.*\})", text, re.DOTALL)
    if action is None or action_input is None:
        return None
    return action.group(1), action_input.group(1)


# ---------------------------------------------------------------- 4. 执行工具 / running a tool
def run_tool(name, args_text):
    """执行工具，返回结果；出错时返回错误说明，让模型自己改正。
    Run the tool and return its result; on failure return the error so the model can fix it."""
    if name not in TOOLS:
        return f"错误：没有叫 {name} 的工具，可用的工具有：{', '.join(TOOLS)}"
    try:
        args = json.loads(args_text)
        return TOOLS[name](**args)
    except Exception as e:
        return f"错误：{type(e).__name__}: {e}"


# ---------------------------------------------------------------- 5. 调用模型 / calling the model
def call_model(messages):
    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        stop=["Observation:"],        # 模型要写 Observation: 时就停下 / stop before it writes an Observation
    )
    return response.choices[0].message.content or ""


# ---------------------------------------------------------------- 6. ReAct 循环 / the ReAct loop
def react_agent(question):
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"Question: {question}"},
    ]
    for step in range(1, MAX_STEPS + 1):
        text = call_model(messages)
        text = text.split("Observation:")[0].strip()      # 保险：切掉模型自己编的部分 / safety net
        print(f"\n----- 第 {step} 步 / step {step} -----\n{text}")
        messages.append({"role": "assistant", "content": text})

        if "Final Answer:" in text:                       # 结束 / done
            return text.split("Final Answer:")[-1].strip()

        parsed = parse_action(text)
        if parsed is None:
            observation = "格式不对：请按 Thought / Action / Action Input 的格式回复，或者给出 Final Answer。"
        else:
            name, args_text = parsed
            observation = run_tool(name, args_text)
        print(f"Observation: {observation}")
        messages.append({"role": "user", "content": f"Observation: {observation}"})

    return "达到最大步数，还没有得到最终答案。/ Reached MAX_STEPS without a final answer."


if __name__ == "__main__":
    question = input("问题 / Question（直接回车用默认问题 / Enter for the default）: ").strip()
    answer = react_agent(question or "北京现在多少度？")
    print("\n===== 最终回答 / Final answer =====")
    print(answer)
