"""第 13 节补充练习：把视频里「多智能体 RAG」那张图写成代码
Lesson 13 extra (exercise): the video's "multi-agent RAG" diagram turned into code

工具函数已经写好。按 TODO 补全四个 Agent，写完和 l13_rag_team_solution.py 对照。
The tool functions are ready. Fill in the four agents (TODOs), then compare with l13_rag_team_solution.py.

视频这一集只讲概念、没有代码（05:43 起讲这张图）：一个主智能体负责和用户对话，
下面有三个子智能体——A 在知识库里检索（知识库 A、知识库 B），B 联网查信息，C 处理应用程序里的数据（比如邮件）。
The episode is concepts only (the diagram starts at 05:43): a main agent talks to the user and has
three sub-agents - A searches the knowledge bases (KB A and KB B), B looks things up online,
C works with application data such as email.

这里用第 12 节学的 as_tool 把三个子智能体交给主智能体：子智能体干完活，结果回到主智能体，由主智能体回答。
Here the three sub-agents are given to the main agent with as_tool (lesson 12): each sub-agent's
result returns to the main agent, which writes the answer.
知识库和邮件都是虚构的练习数据 / The knowledge bases and emails are made-up practice data.
「联网」只演示查天气（Open-Meteo，免费、不用 key）/ "Online" here means a live weather lookup.

运行环境 / Environment: .venv  (openai-agents 0.20.0)
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l13_rag_team_todo.py
需要 / Needs: DEEPSEEK_API_KEY；联网（查天气）/ internet for the weather lookup
每个问题大约调用模型 4 到 6 次 / about 4-6 model calls per question
"""
import asyncio
import json
from pathlib import Path

from agents import Agent, OpenAIChatCompletionsModel, Runner, function_tool, set_tracing_disabled

from llm import MODEL, async_client
from weather_tool import get_weather

set_tracing_disabled(True)
model = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)
DATA = Path(__file__).parent / "data"


def load_kb(filename):
    """知识库就是一个文本文件：空行隔开的每一段算一条知识"""
    text = (DATA / filename).read_text(encoding="utf-8")
    return [part.strip() for part in text.split("\n\n") if part.strip()]


FINANCE_KB = load_kb("l13_kb_finance.txt")    # 知识库 A：财务 / KB A: finance
LAW_KB = load_kb("l13_kb_law.txt")            # 知识库 B：法务 / KB B: legal


def search(kb, keyword):
    found = [part for part in kb if keyword in part]
    return "\n".join(found) if found else f"没有找到包含「{keyword}」的内容"


@function_tool
def search_finance_kb(keyword: str) -> str:
    """在【财务知识库】里查找包含关键词的段落。适合报销、发票、差旅、审批金额等问题。keyword 用一个简短的中文词。"""
    return search(FINANCE_KB, keyword)


@function_tool
def search_law_kb(keyword: str) -> str:
    """在【法务知识库】里查找包含关键词的段落。适合合同、保密协议、盖章、劳动合同等问题。keyword 用一个简短的中文词。"""
    return search(LAW_KB, keyword)


@function_tool
def get_temperature(latitude: float, longitude: float) -> str:
    """联网查询某个经纬度现在的气温。成功时返回摄氏度数值，失败时返回出错原因。"""
    return str(get_weather(latitude, longitude))


@function_tool
def read_inbox() -> str:
    """读取收件箱里的全部邮件（发件人、主题、正文）。"""
    mails = json.loads((DATA / "l13_inbox.json").read_text(encoding="utf-8"))
    lines = []
    for m in mails:
        lines.append(f"发件人：{m['from']}｜主题：{m['subject']}｜正文：{m['body']}")
    return "\n".join(lines)


# TODO 1: 子智能体 A：kb_agent。instructions：先判断问题属于财务还是法务，只查对应的知识库；
#         查到的内容不够就换个关键词再查；只根据查到的内容回答。tools=[search_finance_kb, search_law_kb]
#         Sub-agent A (kb_agent): pick the right KB, retry with another keyword, answer only from results
kb_agent = None

# TODO 2: 子智能体 B：web_agent，负责联网查实时信息（目前只会查天气），tools=[get_temperature]
#         Sub-agent B (web_agent): online lookups (weather only for now)
web_agent = None

# TODO 3: 子智能体 C：mail_agent，先调用 read_inbox 读邮件，再按要求整理，tools=[read_inbox]
#         Sub-agent C (mail_agent): read the inbox with read_inbox, then sort the mail as asked
mail_agent = None

# TODO 4: 主智能体 main_agent：和用户对话，按问题选择帮手。tools 里放三个子智能体的 as_tool(...)：
#         tool_name 分别是 ask_knowledge_base、ask_web、ask_mailbox，并写好 tool_description
#         Main agent: tools = the three sub-agents wrapped with as_tool(tool_name=..., tool_description=...)
main_agent = None


async def ask(question):
    result = await Runner.run(main_agent, question)
    used = []
    for item in result.new_items:                        # 看看主智能体找了哪些帮手
        if item.type == "tool_call_item":
            used.append(item.raw_item.name)
    print("问 / Q:", question)
    print("找了 / asked:", used)
    print("答 / A:", result.final_output)
    print("-" * 40)


async def main():
    await ask("我下周去上海出差，住酒店每晚最多能报销多少钱？")
    await ask("我的邮件里有哪些需要我回复？")


if __name__ == "__main__":
    asyncio.run(main())
