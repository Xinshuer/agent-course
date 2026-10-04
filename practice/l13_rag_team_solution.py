"""第 13 节补充练习（参考答案）：把视频里「多智能体 RAG」那张图写成代码
Lesson 13 extra (solution): the video's "multi-agent RAG" diagram turned into code

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
    & ..\\.venv\\Scripts\\python.exe l13_rag_team_solution.py
需要 / Needs: DEEPSEEK_API_KEY；联网（查天气）/ internet for the weather lookup
每个问题大约调用模型 4 到 6 次 / about 4-6 model calls per question
已用真实 DeepSeek 跑通第一个问题（5 次调用）/ the first question was tested with the real DeepSeek API (5 calls)
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


# 子智能体 A：知识库检索。自己决定查哪个库；查到的内容不够就换个关键词再查
# Sub-agent A: knowledge-base search. Picks the KB itself and retries with another keyword if needed
kb_agent = Agent(
    name="kb_agent",
    instructions="你负责在公司知识库里检索。先判断问题属于财务还是法务，只查对应的知识库。"
                 "检查查到的内容能不能回答问题，不够就换一个关键词再查（最多再查两次）。"
                 "只根据查到的内容回答；查不到就直接说知识库里没有。",
    model=model,
    tools=[search_finance_kb, search_law_kb],
)

# 子智能体 B：联网（这里只会查天气）/ Sub-agent B: online lookups (only weather here)
web_agent = Agent(
    name="web_agent",
    instructions="你负责联网查询实时信息。目前你只能查天气：自己填写城市的经纬度，调用 get_temperature。",
    model=model,
    tools=[get_temperature],
)

# 子智能体 C：应用程序数据（邮件）/ Sub-agent C: application data (email)
mail_agent = Agent(
    name="mail_agent",
    instructions="你负责处理邮件。先调用 read_inbox 读取邮件，再按要求整理，例如找出需要回复的邮件并说明原因。",
    model=model,
    tools=[read_inbox],
)

# 主智能体：和用户对话，判断该找哪个子智能体，最后由它回答
# Main agent: talks to the user, decides which sub-agent to ask, and answers at the end
main_agent = Agent(
    name="main_agent",
    instructions="你是公司的智能助手，负责和用户对话。根据问题选择合适的帮手："
                 "公司制度类问题问 ask_knowledge_base，天气等实时信息问 ask_web，邮件相关的问 ask_mailbox。"
                 "把用户需要的信息完整地交代给帮手，拿到结果后用简洁的中文回答用户。",
    model=model,
    tools=[
        kb_agent.as_tool(tool_name="ask_knowledge_base", tool_description="在公司的财务和法务知识库里查找制度规定"),
        web_agent.as_tool(tool_name="ask_web", tool_description="联网查询实时信息（目前只支持天气）"),
        mail_agent.as_tool(tool_name="ask_mailbox", tool_description="读取并整理用户的邮件"),
    ],
)


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
