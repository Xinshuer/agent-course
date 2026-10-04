"""第 49 节练习：照着视频，搭一个会「搜索 + 算星期几」的 ReAct 智能体（按 TODO 补全）
Lesson 49 exercise: following the video, build a ReAct agent that can search and work out weekdays
(fill in the TODOs)

目标 / Goal:
    问「2024年巴黎奥运会开幕式是星期几？」，Agent 先用 search 查日期，再用 weekday 算星期几。
    verbose=True 会打印 Thought / Action / Action Input / Observation 的全过程。
    Ask "What day of the week was the Paris 2024 opening ceremony?": the agent searches for the date,
    then works out the weekday. verbose=True prints every Thought / Action / Action Input / Observation.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l49_react_todo.py
需要 DEEPSEEK_API_KEY；参考答案在 l49_react_solution.py。
Needs DEEPSEEK_API_KEY; the reference solution is l49_react_solution.py.
"""
from datetime import datetime

# TODO 1: 从 langchain_classic.agents 导入 AgentExecutor 和 create_react_agent
# TODO 1: import AgentExecutor and create_react_agent from langchain_classic.agents

from langchain_core.prompts import PromptTemplate
from langchain_core.tools import tool
from langchain_deepseek import ChatDeepSeek

from l49_react_solution import REACT_TEMPLATE   # 模板文字太长，直接拿过来用 / reuse the long template text
from l49_tools import WEEKDAYS, search
from llm import API_KEY, MODEL


# TODO 2: 写工具 weekday(date_str: str) -> str：
#         加 @tool 和 docstring（写明输入格式 YYYY-MM-DD）；
#         用 datetime.strptime(date_str.strip(), "%Y-%m-%d") 把字符串变成日期；格式不对时返回一句提示；
#         返回 WEEKDAYS[d.weekday()]
# TODO 2: write the tool weekday(date_str: str) -> str:
#         add @tool and a docstring (state the input format YYYY-MM-DD);
#         parse with datetime.strptime(date_str.strip(), "%Y-%m-%d"); return a hint on a bad format;
#         return WEEKDAYS[d.weekday()]


if __name__ == "__main__":
    prompt = PromptTemplate.from_template(REACT_TEMPLATE)
    model = ChatDeepSeek(model=MODEL, api_key=API_KEY)

    # TODO 3: tools = [search, weekday]
    #         agent = create_react_agent(模型, 工具列表, 提示词)
    #         executor = AgentExecutor(agent=..., tools=..., verbose=True,
    #                                  handle_parsing_errors=True, max_iterations=5)
    # TODO 3: build tools, agent and executor as above

    # TODO 4: result = executor.invoke({"input": "2024年巴黎奥运会开幕式是星期几？"})
    #         打印 result["output"] / print result["output"]
