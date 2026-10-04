"""第 14 节练习：两个销售 Agent 协作——先给潜在客户做画像、判断意向，再写个性化的联系邮件
Lesson 14 exercise: two sales agents work together - profile a lead and rate its intent,
then write a personalised outreach email

按 TODO 补全代码，写完和 l14_leads_solution.py 对照。先用 --screen 测试不调用模型的部分。
Fill in the TODOs, then compare with l14_leads_solution.py. Test the model-free part with --screen first.

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
    & ..\\.venv-crewai\\Scripts\\python.exe l14_leads_todo.py          # 第 1 条线索 / lead 1
    & ..\\.venv-crewai\\Scripts\\python.exe l14_leads_todo.py 4        # 第 4 条线索 / lead 4
    & ..\\.venv-crewai\\Scripts\\python.exe l14_leads_todo.py --screen # 只做规则初筛，不调用模型
    一定要在 practice 文件夹里运行：crewai-tools 的 DirectoryReadTool 只允许访问当前工作文件夹里面的路径。
    Run it from the practice folder: crewai-tools' DirectoryReadTool only allows paths under the working folder.
需要 / Needs: DEEPSEEK_API_KEY（一条线索大约调用模型 4 到 8 次 / about 4-8 model calls per lead）
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
    # TODO 1: 用 with open(..., encoding="utf-8", newline="") 打开文件，
    #         用 csv.DictReader 读取，再用 list(...) 变成「字典的列表」返回
    #         Open the file, read it with csv.DictReader and return list(...) of the rows
    return []


DECISION_MAKERS = ["CEO", "CTO", "总经理", "创始人", "运营总监"]
TARGET_INDUSTRIES = ["在线教育", "物流", "电商", "智能制造"]
NEARBY_CITIES = ["上海", "杭州", "苏州"]


def quick_screen(lead):
    """规则初筛：按公司规模、职位、行业、城市打一个粗略的分（满分 6 分）"""
    score = 0
    # TODO 2: 员工数（先用 int() 转成整数）>= 500 加 2 分，>= 100 加 1 分；
    #         职位在 DECISION_MAKERS 里加 2 分；行业在 TARGET_INDUSTRIES 里加 1 分；城市在 NEARBY_CITIES 里加 1 分
    #         employees (convert with int()) >= 500: +2, >= 100: +1; decision maker: +2; target industry: +1; nearby city: +1
    # TODO 3: 总分 >= 5 返回 (score, "高")，>= 3 返回 (score, "中")，否则返回 (score, "低")
    #         score >= 5 -> (score, "高"); >= 3 -> (score, "中"); otherwise (score, "低")
    return score, "低"


def print_screen(leads):
    high = 0
    for lead in leads:
        score, level = quick_screen(lead)
        if level == "高":
            high += 1
        # TODO 4: 用 f-string 打印：员工数右对齐 6 格并带千位逗号（:>6,），得分占满分 6 分的百分比（:.0%）
        #         Print employees right-aligned in 6 columns with commas (:>6,) and score / 6 as a percentage (:.0%)
        print(lead["employees"], score, level, lead["company"])
    print(f"高意向占比 / share of high intent: {high / len(leads):.0%}")


# ---------------------------------------------------------------- 2. 两个 Agent / two agents
llm = LLM(model=f"openai/{MODEL}", base_url=BASE_URL, api_key=API_KEY)

# 工具：列出资料文件夹里的文件、读文件（代替视频里的联网搜索）
# Tools: list the research folder and read files (instead of the video's web search)
directory_tool = DirectoryReadTool(directory=str(RESEARCH_DIR))
file_tool = FileReadTool(base_dir=str(RESEARCH_DIR))

# TODO 5: 创建 sales_rep（销售代表）：role、goal、backstory 写清楚它负责「客户画像 + 判断意向」，
#         tools=[directory_tool, file_tool]，llm=llm，allow_delegation=False，verbose=True
#         Create sales_rep: role/goal/backstory for "profile the lead and rate its intent", plus tools, llm, ...
sales_rep = None

# TODO 6: 创建 lead_sales_rep（首席销售代表）：负责写个性化的联系邮件
#         Create lead_sales_rep: writes the personalised outreach email
lead_sales_rep = None

# TODO 7: 创建 profiling_task：description 里用 {company}、{industry}、{employees}、{city}、{contact}、
#         {position}、{message} 这些占位符（就是 CSV 的表头），写清意向的判断标准；
#         expected_output 要求报告最后一行写「意向等级：高/中/低」；agent=sales_rep
#         Create profiling_task with placeholders named after the CSV header, and the intent criteria
profiling_task = None

# TODO 8: 创建 outreach_task：根据画像报告给 {contact}（{position}）写邮件；agent=lead_sales_rep
#         Create outreach_task: write the email to {contact} ({position}) from the profile report
outreach_task = None

# TODO 9: 用 Crew(agents=[...], tasks=[...], verbose=True) 把两个 Agent 和两个任务组成团队
#         Form the crew from the two agents and the two tasks
crew = None


if __name__ == "__main__":
    leads = load_leads(LEADS_FILE)
    if not leads:
        print("先完成 TODO 1：load_leads 还没有读出数据 / finish TODO 1 first")
        sys.exit()
    if "--screen" in sys.argv:
        print_screen(leads)
        sys.exit()

    # sys.argv 是命令行参数的列表，sys.argv[0] 是文件名；写了数字就分析第几条线索，没写就分析第 1 条
    # sys.argv lists the command-line arguments; a number picks which lead to analyse (default: 1)
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    lead = leads[n - 1]
    print("本次分析的线索 / lead:", lead)

    # TODO 10: 用 crew.kickoff(inputs=lead) 运行（表单的一行 = 一份 inputs），结果存进 result
    #          Run crew.kickoff(inputs=lead) and keep the result in result
    result = None

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_file = OUTPUT_DIR / f"{lead['company']}.md"
    out_file.write_text(
        "# 客户画像报告 / Lead profile\n\n" + profiling_task.output.raw
        + "\n\n# 邮件草稿 / Email draft\n\n" + result.raw + "\n",
        encoding="utf-8",
    )
    print("已保存 / saved:", out_file)
