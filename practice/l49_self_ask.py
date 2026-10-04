"""第 49 节演示：视频里的第二种智能体——Self-Ask with Search（自问自答 + 搜索）
Lesson 49 demo: the video's second kind of agent - Self-Ask with Search

只有一个搜索工具。模型遇到需要多步推理的问题时，不断给自己提「追问」（Follow up），
每个追问都去搜索，拿到中间答案（Intermediate answer）后再追问，直到能给出最终答案。
There is only one tool, a search. Faced with a multi-hop question, the model keeps asking itself
follow-up questions, searches each one, reads the intermediate answer, and asks again until it can answer.

视频（LangChain 0.x）用的是 LangChain Hub 上现成的模板 hwchase17/self-ask-with-search（0.x 里用 hub.pull 下载）；
LangChain 1.x 里 hub.pull 默认拒绝下载公开提示词，所以这里直接写出模板（原模板有 4 个例子，这里保留 2 个）。
工具名必须是 "Intermediate Answer"，而且只能有一个工具，否则 create_self_ask_with_search_agent 报 ValueError。
The video downloads the template with hub.pull("hwchase17/self-ask-with-search"); on LangChain 1.x hub.pull
refuses public prompts by default, so the template is written here (the original has 4 examples; 2 are kept).
The tool must be named "Intermediate Answer" and be the only tool, or create_self_ask_with_search_agent
raises ValueError.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l49_self_ask.py
需要 DEEPSEEK_API_KEY；顺利时调用模型 3 次，最多 5 次。搜索是 l49_tools.py 里的模拟搜索。
Needs DEEPSEEK_API_KEY; 3 model calls when it goes well, at most 5. Search is the mock in l49_tools.py.

实测记录 / Test note:
    用原模板 + deepseek-flash（思考模式）实测时，第一个追问正常（搜到「徐帆」），但随后模型没有按
    "So the final answer is:" 的格式写，而是凭记忆写了一大段答案，解析失败，直到 max_iterations 用完。
    所以这里加了三处改动：模板开头写明格式要求、关闭思考模式、解析失败时把正确格式告诉模型。
    三处改动一起用后再次实测成功：追问「冯小刚的老婆是谁」→ 徐帆 → 追问「徐帆演过什么电影」→ 给出最终答案，
    共调用 3 次模型。但这类「靠文字格式」的 Agent 仍然脆弱：换个问题或换个模型，结果可能又不一样。
    With the original template and deepseek-flash (thinking mode), the first follow-up worked (it found Xu Fan),
    but then the model wrote a long answer from memory instead of a "So the final answer is:" line, so parsing
    failed until max_iterations ran out. Hence three changes: format rules at the top of the template, thinking
    switched off, and a parsing-error message that restates the format. With all three, a re-test succeeded
    (3 model calls), but text-format agents stay fragile.
"""
from langchain_classic.agents import AgentExecutor, create_self_ask_with_search_agent
from langchain_core.prompts import PromptTemplate
from langchain_core.tools import Tool
from langchain_deepseek import ChatDeepSeek

from l49_tools import search
from llm import API_KEY, MODEL

# hwchase17/self-ask-with-search 模板（节选两个例子），开头加了三行格式要求。注意最后一行固定的写法。
# The hwchase17/self-ask-with-search template (two of its examples) with three format rules added on top.
# Note the fixed last line.
SELF_ASK_TEMPLATE = """Answer the last question in exactly the same format as the examples.
End every reply with one line that starts with "Follow up:" or "So the final answer is:".
Take facts only from the intermediate answers, not from your own memory.

Question: Who lived longer, Muhammad Ali or Alan Turing?
Are follow up questions needed here: Yes.
Follow up: How old was Muhammad Ali when he died?
Intermediate answer: Muhammad Ali was 74 years old when he died.
Follow up: How old was Alan Turing when he died?
Intermediate answer: Alan Turing was 41 years old when he died.
So the final answer is: Muhammad Ali

Question: When was the founder of craigslist born?
Are follow up questions needed here: Yes.
Follow up: Who was the founder of craigslist?
Intermediate answer: Craigslist was founded by Craig Newmark.
Follow up: When was Craig Newmark born?
Intermediate answer: Craig Newmark was born on December 6, 1952.
So the final answer is: December 6, 1952

Question: {input}
Are followup questions needed here:{agent_scratchpad}"""


if __name__ == "__main__":
    # 工具名是模板里写死的 "Intermediate Answer"；func 就是我们的搜索
    # The tool name is fixed by the template; func is our search
    search_tool = Tool(
        name="Intermediate Answer",
        func=search.invoke,
        description="搜索引擎，用来回答追问 / a search engine for answering follow-up questions",
    )

    # 关闭思考模式：让模型更像「照着例子往下续写」，而不是直接给出一大段回答
    # Thinking off: the model then continues the examples instead of writing a long answer straight away
    model = ChatDeepSeek(model=MODEL, api_key=API_KEY, extra_body={"thinking": {"type": "disabled"}})
    prompt = PromptTemplate.from_template(SELF_ASK_TEMPLATE)
    agent = create_self_ask_with_search_agent(model, [search_tool], prompt)
    executor = AgentExecutor(
        agent=agent, tools=[search_tool], verbose=True, max_iterations=5,
        # 解析失败时，把这句话作为「中间答案」交回模型 / sent back to the model when parsing fails
        handle_parsing_errors='Wrong format. End with a line "Follow up: ..." or "So the final answer is: ...".',
    )

    result = executor.invoke({"input": "冯小刚的老婆演过什么电影？"})
    print("最终回答 / final answer:", result["output"])
