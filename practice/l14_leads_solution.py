"""第 14 节练习参考答案：两个销售 Agent 协作——先给潜在客户做画像、判断意向，再写个性化的联系邮件
Lesson 14 solution: two sales agents work together - profile a lead and rate its intent,
then write a personalised outreach email

对应视频 / Matches the video (P15):
    视频用 CrewAI + GPT-3.5-turbo + 联网搜索工具，演示「销售代表」和「首席销售代表」两个 Agent。
    The video uses CrewAI + GPT-3.5-turbo + a web-search tool with a "sales representative"
    and a "lead sales representative" agent.
    这里换成 DeepSeek；没有搜索 API 的 key，所以用本地资料文件夹 data/l14_research 代替联网搜索。
    Here we use DeepSeek; without a search-API key, the local folder data/l14_research stands in
    for web search.
    公司和人物都是虚构的。/ All companies and people are made up.

运行环境 / Environment: .venv-crewai  (crewai 1.15.23, crewai-tools 1.15.23)
运行 / Run:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l14_leads_solution.py          # 第 1 条线索 / lead 1
    & ..\\.venv-crewai\\Scripts\\python.exe l14_leads_solution.py 4        # 第 4 条线索 / lead 4
    & ..\\.venv-crewai\\Scripts\\python.exe l14_leads_solution.py --screen # 只做规则初筛，不调用模型
    一定要在 practice 文件夹里运行：crewai-tools 的 DirectoryReadTool 只允许访问当前工作文件夹里面的路径。
    Run it from the practice folder: crewai-tools' DirectoryReadTool only allows paths under the working folder.
需要 / Needs: DEEPSEEK_API_KEY（一条线索大约调用模型 4 到 8 次 / about 4-8 model calls per lead）
    已用真实 DeepSeek 跑通第 4 条线索（4 次调用）/ tested with the real DeepSeek API on lead 4 (4 calls)
输出 / Output: practice\\data\\l14_output\\<公司名>.md（客户画像报告 + 邮件草稿 / profile report + email draft）
"""
import csv
import os
import sys
from pathlib import Path

# 这两行必须写在 import crewai 之前 / these two lines must come before importing crewai
os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")                       # 不弹出 trace 提示
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级 = 项目文件夹 / the project folder
os.environ.setdefault("CREWAI_STORAGE_DIR", os.path.join(PROJECT_DIR, ".cache", "crewai"))  # 缓存放进项目的 .cache

from crewai import LLM, Agent, Crew, Task                   # noqa: E402
from crewai_tools import DirectoryReadTool, FileReadTool    # noqa: E402

from llm import API_KEY, BASE_URL, MODEL                    # noqa: E402

HERE = Path(__file__).parent
LEADS_FILE = HERE / "data" / "l14_leads.csv"
RESEARCH_DIR = HERE / "data" / "l14_research"
OUTPUT_DIR = HERE / "data" / "l14_output"


# ---------------------------------------------------------------- 1. 表单数据 / the form data
def load_leads(path):
    """读 CSV：每一行变成一个字典，表头就是字典的键（值都是字符串）"""
    with open(path, encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


DECISION_MAKERS = ["CEO", "CTO", "总经理", "创始人", "运营总监"]
TARGET_INDUSTRIES = ["在线教育", "物流", "电商", "智能制造"]
NEARBY_CITIES = ["上海", "杭州", "苏州"]


def quick_screen(lead):
    """规则初筛：按公司规模、职位、行业、城市打一个粗略的分（满分 6 分）"""
    score = 0
    employees = int(lead["employees"])
    if employees >= 500:
        score += 2
    elif employees >= 100:
        score += 1
    if lead["position"] in DECISION_MAKERS:
        score += 2
    if lead["industry"] in TARGET_INDUSTRIES:
        score += 1
    if lead["city"] in NEARBY_CITIES:
        score += 1
    if score >= 5:
        return score, "高"
    if score >= 3:
        return score, "中"
    return score, "低"


def print_screen(leads):
    high = 0
    for lead in leads:
        score, level = quick_screen(lead)
        if level == "高":
            high += 1
        print(f"员工 {int(lead['employees']):>6,} 人  {score} 分（{score / 6:.0%}）  {level}意向  {lead['company']}")
    print(f"高意向占比 / share of high intent: {high / len(leads):.0%}")


# ---------------------------------------------------------------- 2. 两个 Agent / two agents
llm = LLM(model=f"openai/{MODEL}", base_url=BASE_URL, api_key=API_KEY)

# 工具：列出资料文件夹里的文件、读文件（代替视频里的联网搜索）
# Tools: list the research folder and read files (instead of the video's web search)
directory_tool = DirectoryReadTool(directory=str(RESEARCH_DIR))
file_tool = FileReadTool(base_dir=str(RESEARCH_DIR))

sales_rep = Agent(
    role="销售代表",
    goal="分析潜在客户，找出最值得跟进的高意向客户",
    backstory="你在智语科技做销售。你擅长根据公司规模、行业、联系人职位、所在城市和公司最近的动态，"
              "判断一个潜在客户是高意向、中意向还是低意向，并写出清楚的客户画像。",
    tools=[directory_tool, file_tool],
    llm=llm,
    allow_delegation=False,
    verbose=True,
)

lead_sales_rep = Agent(
    role="首席销售代表",
    goal="用个性化、有吸引力的沟通方式培育潜在客户",
    backstory="你是智语科技最资深的销售。你写的邮件总能抓住对方最近关心的事，"
              "把我们的产品和对方的目标联系起来，语气真诚，从不夸大。",
    tools=[directory_tool, file_tool],
    llm=llm,
    allow_delegation=False,
    verbose=True,
)

# ---------------------------------------------------------------- 3. 两个任务 / two tasks
# 花括号里的名字会被 kickoff(inputs=...) 里同名的值替换，正好就是 CSV 的表头
# Names in braces are filled from kickoff(inputs=...) - they match the CSV header
profiling_task = Task(
    description="""分析潜在客户「{company}」：行业 {industry}，员工约 {employees} 人，所在城市 {city}。
联系人是 {contact}（{position}），他在表单里的留言是：「{message}」。
先查看资料文件夹，阅读这家公司的资料和我们的产品介绍，再按下面的标准判断意向：
- 高意向：规模和行业都适合我们的产品，联系人能拍板，最近的动态显示有明确需求；
- 中意向：有一定需求，但规模、职位或时机不太理想；
- 低意向：规模太小或者看不出需求。""",
    expected_output="一份客户画像报告：公司概况、最近的重要动态、可能的需求、和我们产品的契合点；"
                    "最后一行写「意向等级：高/中/低」，并用一句话说明理由。",
    agent=sales_rep,
)

outreach_task = Task(
    description="""根据上一步的客户画像报告，给「{company}」的 {contact}（{position}）写一封首次联系的邮件。
要提到对方公司最近的动态，把我们的产品和对方的目标联系起来；如果意向等级是低，就写得简短一些，
只表示随时可以提供帮助。""",
    expected_output="一封完整的中文邮件草稿：第一行是邮件主题，后面是正文，不超过 300 字。",
    agent=lead_sales_rep,
)

# ---------------------------------------------------------------- 4. 组队并运行 / form the crew and run
crew = Crew(
    agents=[sales_rep, lead_sales_rep],
    tasks=[profiling_task, outreach_task],     # 按顺序执行：先画像，再写邮件
    verbose=True,
)


if __name__ == "__main__":
    leads = load_leads(LEADS_FILE)
    if "--screen" in sys.argv:
        print_screen(leads)
        sys.exit()

    # sys.argv 是命令行参数的列表，sys.argv[0] 是文件名；写了数字就分析第几条线索，没写就分析第 1 条
    # sys.argv lists the command-line arguments; a number picks which lead to analyse (default: 1)
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    lead = leads[n - 1]
    print("本次分析的线索 / lead:", lead)

    result = crew.kickoff(inputs=lead)                  # 表单的一行 = 一份 inputs

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_file = OUTPUT_DIR / f"{lead['company']}.md"
    out_file.write_text(
        "# 客户画像报告 / Lead profile\n\n" + profiling_task.output.raw
        + "\n\n# 邮件草稿 / Email draft\n\n" + result.raw + "\n",
        encoding="utf-8",
    )
    print("已保存 / saved:", out_file)
