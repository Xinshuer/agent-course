"""第 49 节参考答案：视频里的 ReAct 智能体——提示词模板 + create_react_agent + AgentExecutor
Lesson 49 solution: the video's ReAct agent - prompt template + create_react_agent + AgentExecutor

视频用的是 LangChain 0.x，当时的写法是（字幕里只说从 LangChain Hub 下载提示词、用 executor 运行，下面是 0.x 的标准写法）：
    from langchain import hub
    from langchain.agents import AgentExecutor, create_react_agent
    prompt = hub.pull("hwchase17/react")
在你安装的 LangChain 1.x 里要改两处：
    1. AgentExecutor / create_react_agent 搬到了 langchain_classic.agents；
    2. hub.pull 默认拒绝下载公开提示词（报 ValueError），所以这里直接把模板文字写在代码里，
       并补了两句规则，让 deepseek-flash 每次只写下一步、事实要用工具查。
The video uses LangChain 0.x, where the standard code imports AgentExecutor/create_react_agent from
langchain.agents and downloads the prompt with hub.pull("hwchase17/react"). On the installed LangChain 1.x: (1) both now live in
langchain_classic.agents; (2) hub.pull refuses public prompts by default (ValueError), so the template
text is written here directly, plus two extra rules so deepseek-flash writes one step at a time and
looks facts up with a tool.

视频用 OpenAI 的模型；这里换成 DeepSeek（practice/llm.py）。搜索是 l49_tools.py 里的模拟搜索。
The video uses an OpenAI model; here it is DeepSeek (practice/llm.py). Search is the mock in l49_tools.py.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l49_react_solution.py
需要 DEEPSEEK_API_KEY；一次运行通常调用模型 3 次（最多 5 次）。
Needs DEEPSEEK_API_KEY; one run usually makes 3 model calls (at most 5).
"""
from datetime import datetime

from langchain_classic.agents import AgentExecutor, create_react_agent
from langchain_core.prompts import PromptTemplate
from langchain_core.tools import tool
from langchain_deepseek import ChatDeepSeek

from l49_tools import WEEKDAYS, search
from llm import API_KEY, MODEL


@tool
def weekday(date_str: str) -> str:
    """计算某个日期是星期几。输入必须是 YYYY-MM-DD 格式的日期，例如 2024-07-26。
    Work out the day of the week for a date. The input must be a YYYY-MM-DD date, e.g. 2024-07-26."""
    try:
        d = datetime.strptime(date_str.strip(), "%Y-%m-%d")
    except ValueError:
        return "日期格式不对，请用 YYYY-MM-DD。/ Bad date format, use YYYY-MM-DD."
    return WEEKDAYS[d.weekday()]


# LangChain Hub 上 hwchase17/react 的模板原文，最后加了两句规则（"Look up ..." 和 "Write only ..."）
# The hwchase17/react template from LangChain Hub, plus two extra rules near the end
REACT_TEMPLATE = """Answer the following questions as best you can. You have access to the following tools:

{tools}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Look up facts and dates with a tool instead of relying on memory.
Write only the next step. If an Observation is already shown below, do not repeat the Question or earlier Actions; continue with a new Thought.

Begin!

Question: {input}
Thought:{agent_scratchpad}"""


if __name__ == "__main__":
    prompt = PromptTemplate.from_template(REACT_TEMPLATE)
    print("占位符 / placeholders:", prompt.input_variables)

    model = ChatDeepSeek(model=MODEL, api_key=API_KEY)
    tools = [search, weekday]

    agent = create_react_agent(model, tools, prompt)       # 只负责「想下一步」/ only decides the next step
    executor = AgentExecutor(agent=agent, tools=tools,      # 负责循环：调工具、填回 Observation / runs the loop
                             verbose=True, handle_parsing_errors=True, max_iterations=5)

    # 视频问的是「2024 年周杰伦的演唱会是星期几」；模拟搜索里只有示例数据，所以换成这个问题
    # The video asks which weekday Jay Chou's 2024 concert was; our mock search only has sample data
    result = executor.invoke({"input": "2024年巴黎奥运会开幕式是星期几？"})
    print("最终回答 / final answer:", result["output"])
