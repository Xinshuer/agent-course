r"""第 07 节拓展练习：不用 tools 参数，纯文字版的 ReAct Agent（TODO 版；视频里没有这一部分）
Lesson 07 extension exercise: a text-only ReAct agent without the tools parameter (TODO version; not in the video)

先完成视频版的 l07_react_agent_todo.py，再做这个拓展。
补全 5 个 TODO，让 Agent 能回答「北京现在多少度？」：
它会先用 get_coordinates 查经纬度，再用 get_weather 查气温，最后给出 Final Answer。
Do the video's version (l07_react_agent_todo.py) first, then this extension.
Fill in the 5 TODOs so the agent can answer "北京现在多少度？" (How warm is Beijing now?):
it looks up the coordinates, then the temperature, then gives a Final Answer.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\.venv\Scripts\python.exe l07_text_react_todo.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY；天气来自 Open-Meteo，不需要 key。
              the DEEPSEEK_API_KEY environment variable; weather comes from Open-Meteo, no key.
参考答案 / Solution: l07_text_react_solution.py
"""
import json
import re

from llm import MODEL, client
from weather_tool import get_weather

# ---------------------------------------------------------------- 工具（已写好）/ tools (given)
CITY_COORDS = {
    "北京": {"latitude": 39.9042, "longitude": 116.4074},
    "上海": {"latitude": 31.2304, "longitude": 121.4737},
    "广州": {"latitude": 23.1291, "longitude": 113.2644},
}


def get_coordinates(city):
    """查城市的经纬度 / Look up a city's latitude and longitude."""
    if city not in CITY_COORDS:
        return f"没有找到城市：{city}"
    return json.dumps(CITY_COORDS[city])


# TODO 1: 工具字典：把工具名（字符串）对应到函数本身（不要加括号）
#         A dict from tool name (string) to the function itself (no parentheses)
TOOLS = {}

TOOL_DESCRIPTIONS = """- get_coordinates: 查询城市的经纬度。Action Input 示例：{"city": "北京"}
- get_weather: 根据经纬度查询当前气温（摄氏度）。Action Input 示例：{"latitude": 39.9, "longitude": 116.4}"""

# TODO 2: 补全提示词模板。要说明：
#         - 输出格式：Thought / Action / Action Input，或者 Thought / Final Answer
#         - 规则：每次只写一个 Action；写完 Action Input 就停下；不要自己写 Observation
#         模板里留两个占位符 {tools} 和 {tool_names}，下面用 .format() 填进去。
#         Complete the template: the output format and the rules above.
#         Keep the placeholders {tools} and {tool_names}; .format() fills them below.
REACT_PROMPT = """你是一个会使用工具的助手。请按「思考 → 行动 → 观察」的方式一步一步解决问题。

你可以使用这些工具：
{tools}

（在这里写输出格式和规则 / write the format and the rules here）
"""

SYSTEM_PROMPT = REACT_PROMPT.format(tools=TOOL_DESCRIPTIONS, tool_names=", ".join(TOOLS))
MAX_STEPS = 6


def parse_action(text):
    """返回 (工具名, 参数字符串)；格式不对返回 None。 Return (name, argument string) or None."""
    # TODO 3: 用 re.search 找到 "Action: 工具名" 和 "Action Input: {...}"
    #         提示：r"Action:\s*(\w+)"，以及 r"Action Input:\s*(\{.*\})" 加上 re.DOTALL
    #         任何一个没找到（是 None）就 return None，否则 return 两个 group(1)
    #         Hint: the two patterns above; return None if either is missing, else both group(1)
    return None


def run_tool(name, args_text):
    """执行工具；出错时返回错误说明。 Run the tool; return an error message on failure."""
    # TODO 4: 1) name 不在 TOOLS 里 → 返回一句错误说明（列出可用的工具）
    #         2) try: json.loads 参数，再 TOOLS[name](**args)，返回结果
    #            except Exception as e: 返回 f"错误：{e}"
    #         1) unknown name -> return an error listing the tools
    #         2) try: json.loads + TOOLS[name](**args); except Exception as e: return the error
    return "TODO"


def call_model(messages):
    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        stop=["Observation:"],        # 模型要写 Observation: 时就停下 / stop before it writes an Observation
    )
    return response.choices[0].message.content or ""


def react_agent(question):
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"Question: {question}"},
    ]
    for step in range(1, MAX_STEPS + 1):
        text = call_model(messages)
        text = text.split("Observation:")[0].strip()
        print(f"\n----- 第 {step} 步 / step {step} -----\n{text}")

        # TODO 5: 1) 把模型这次的回复作为 assistant 消息存进 messages
        #         2) 如果 text 里有 "Final Answer:"，返回它后面的文字（split + strip）
        #         3) 否则 parse_action(text)：是 None → observation 写一句格式提醒；
        #            不是 None → name, args_text = parsed，再 observation = run_tool(name, args_text)
        #         4) 把 f"Observation: {observation}" 作为 user 消息存进 messages
        #         1) store the reply as an assistant message
        #         2) if "Final Answer:" is in text, return what follows it
        #         3) else parse it; None -> a format reminder, otherwise run the tool
        #         4) append f"Observation: {observation}" as a user message
        return "TODO 5 还没写 / TODO 5 is not done yet"   # 写完后删掉这一行 / delete this line when done

    return "达到最大步数，还没有得到最终答案。/ Reached MAX_STEPS without a final answer."


if __name__ == "__main__":
    question = input("问题 / Question（直接回车用默认问题 / Enter for the default）: ").strip()
    answer = react_agent(question or "北京现在多少度？")
    print("\n===== 最终回答 / Final answer =====")
    print(answer)
