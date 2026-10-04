COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l14",
  "priority": "important",
  "handwrite": true,
  "studyMinutes": 45,
  "source": "subtitle",
  "summary": {
    "zh": "一个企业里很常见的多 Agent 实战：潜在客户在官网留下表单后，由两个销售 Agent 接力——**销售代表**查资料、做客户画像、判断高/中/低意向；**首席销售代表**根据画像写一封个性化的联系邮件（这就是标题里的「创意输出」）。视频用 CrewAI 演示：用 role/goal/backstory 定义两个 Agent，挂上读文件和联网搜索工具，定义两个任务，组成 Crew，再把表单数据作为 `inputs` 交给 `kickoff`。讲义换成 DeepSeek，用本地资料文件夹代替联网搜索；Python 小课堂讲 csv 和数字格式。",
    "en": "A multi-agent project common in companies: after a prospect leaves a form on the website, two sales agents work in relay – the **sales representative** researches the company, builds a lead profile and rates the intent high/medium/low; the **lead sales representative** writes a personalised outreach email from that profile (the “creative output” of the title). The video uses CrewAI: two agents defined by role/goal/backstory, file-reading and web-search tools, two tasks, a Crew, and the form data passed to `kickoff` as `inputs`. These notes use DeepSeek and a local research folder instead of web search; the Python mini-lesson covers csv and number formatting."
  },
  "goals": [
    {
      "zh": "说清销售线索的场景：根据公司规模、行业、职位、地点判断高/中/低意向，再决定跟进策略",
      "en": "Explain the sales-lead scenario: rate intent high/medium/low from company size, industry, position and location, then pick a follow-up strategy"
    },
    {
      "zh": "用 `csv.DictReader` 把表单数据读成字典的列表，并用 f-string 格式化数字（千位逗号、对齐、百分比）",
      "en": "Read form data into a list of dicts with `csv.DictReader`, and format numbers in f-strings (thousands separators, alignment, percentages)"
    },
    {
      "zh": "用 CrewAI 的 `Agent(role, goal, backstory, tools, llm)` 定义两个销售 Agent",
      "en": "Define the two sales agents with CrewAI's `Agent(role, goal, backstory, tools, llm)`"
    },
    {
      "zh": "用 `Task(description, expected_output, agent)` 写两个任务，用 `{占位符}` 接收表单字段",
      "en": "Write two tasks with `Task(description, expected_output, agent)`, using `{placeholders}` for the form fields"
    },
    {
      "zh": "用 `Crew(...).kickoff(inputs=...)` 运行，并说出第二个任务怎样用上第一个任务的结果",
      "en": "Run with `Crew(...).kickoff(inputs=...)` and explain how the second task uses the first task's result"
    }
  ],
  "blocks": [
    {
      "t": "video",
      "zh": "这一集和第 13 集来自同一堂直播课：有同学问老师能不能带大家设计一个智能体，老师就打开了一个**已经写好的例子**逐段讲解，没有现场写代码。例子用的是 **CrewAI** 框架、**GPT-3.5-turbo** 模型和一个联网搜索的 API。老师反复强调：没有编程基础也没关系，重要的是看懂整个工程里数据是怎么流转的、AI 能做什么。\n\n[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=0) 开讲前他还提醒：Agent 怎么推理、怎么规划，底层算法现阶段不用去钻，已经有成熟的框架替你做好了，先把框架用起来。\n\n标题里的「销售数据分析」指的是分析销售线索（潜在客户），「创意输出」指的是最后生成的个性化邮件。CrewAI 在第 51 到 56 节会系统地讲，这一节先读懂、跑通一个小版本。",
      "en": "This episode comes from the same live class as lesson 13: a student asks whether the instructor can show how to design an agent, so he opens an **already written example** and explains it section by section – no live coding. It uses the **CrewAI** framework, the **GPT-3.5-turbo** model and a web-search API. He keeps stressing that you don't need a programming background; what matters is understanding how data flows through the project and what AI can do.\n\n[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=0) Before starting he also says not to dig into the algorithms behind an agent's reasoning and planning for now: mature frameworks already handle that, so learn to use a framework first.\n\n“Sales data analysis” in the title means analysing sales leads (prospects); “creative output” is the personalised email produced at the end. CrewAI is covered systematically in lessons 51 to 56; here you read and run a small version first."
    },
    {
      "t": "tip",
      "zh": "本节的 CrewAI 代码要用**另一个环境** `.venv-crewai` 运行：在 `practice` 里执行 `& ..\\.venv-crewai\\Scripts\\python.exe l14_leads_solution.py`。加 `--screen` 只做规则初筛、不调用模型；加数字（比如 `4`）分析第几条线索。结果保存在 `practice\\data\\l14_output` 里。",
      "en": "The CrewAI code in this lesson runs in a **separate environment**, `.venv-crewai`: from `practice` run `& ..\\.venv-crewai\\Scripts\\python.exe l14_leads_solution.py`. Add `--screen` for the rule-based screening only (no model calls), or a number (such as `4`) to analyse that lead. Results are saved in `practice\\data\\l14_output`."
    },
    {
      "t": "h",
      "zh": "一、场景：表单线索要先「画像」再跟进",
      "en": "1. The scenario: profile each lead before following up"
    },
    {
      "t": "p",
      "zh": "[▶ 00:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=30) 假设你的公司有一个产品展示页。访客对产品感兴趣，就会留下表单信息，这些信息交给销售团队。[▶ 01:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=60) 销售拿到以后，先要判断这个人能不能成为客户：是**高意向、中意向还是低意向**？判断的依据是一些指标，比如：\n- 公司规模有多大\n- 属于什么行业、做什么业务\n- 留表单的人是谁、在公司里担任什么角色\n- 公司在哪里，方不方便上门拜访\n\n[▶ 01:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=92) 老师把销售的工作分成两大块：一块是收集和分析客户画像，另一块是根据画像制定并执行销售策略。销售有很大一部分时间花在第一块上。[▶ 02:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=122) 如果拿到表单之后，直接就能得到一份完整的客户画像报告——这家公司是做什么的、最近有什么里程碑事件、按我们的标准算不算高意向、该重点跟进什么——销售就能省下大量时间，直接进入跟进环节。这一块正好交给智能体。",
      "en": "[▶ 00:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=30) Suppose your company has a product page. Interested visitors leave their details on a form, and the details go to the sales team. [▶ 01:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=60) The first thing a salesperson must decide is whether this person can become a customer: **high, medium or low intent**? That judgement rests on indicators such as:\n- how big the company is\n- its industry and business\n- who filled in the form and what their role in the company is\n- where the company is, and whether a visit is convenient\n\n[▶ 01:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=92) The instructor splits sales work into two big parts: collecting and analysing the customer profile, and then designing and carrying out a sales strategy from it. A large share of a salesperson's time goes into the first part. [▶ 02:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=122) If a complete profile report arrived together with the form – what the company does, its recent milestones, whether it counts as high intent by our criteria, what to focus on – sales could skip straight to following up. That first part is exactly what the agents take over."
    },
    {
      "t": "py",
      "title": {
        "zh": "csv 模块和数字格式：把表单数据读进来、排整齐",
        "en": "The csv module and number formats: read the form data and line it up"
      },
      "zh": "表单数据常常导出成 CSV 文件：第一行是表头，后面每行一条记录。Python 自带的 `csv` 模块可以直接读：\n- `csv.DictReader(f)` 把第一行当作**表头**，后面每一行变成一个字典，例如 `{\"company\": \"星河智造\", \"employees\": \"2300\", ...}`；外面套一层 `list(...)`，就得到「字典的列表」。\n- 读出来的**值全是字符串**：`\"2300\"` 要先用 `int(...)` 转成整数，才能和 500 比大小。\n- 读真实文件时写 `with open(路径, encoding=\"utf-8\", newline=\"\") as f:`（`with open` 见第 10 节）。`encoding=\"utf-8\"` 防止中文乱码；`newline=\"\"` 是 csv 模块要求的写法，交给它自己处理换行。\n- 网页里没有文件，下面用 `io.StringIO(字符串)` 把一段字符串当作打开的文件来读，效果一样。\n\n打印报表时，f-string（第 04 节）的花括号里，冒号后面还能写**数字格式**：\n\n| 写法 | 结果 | 含义 |\n|---|---|---|\n| `{2300:,}` | `2,300` | 千位加逗号 |\n| `{2300:>8,}` | `   2,300` | 右对齐，占 8 格，适合把数字排成一列 |\n| `{766.67:.1f}` | `766.7` | 保留 1 位小数 |\n| `{5 / 6:.0%}` | `83%` | 乘以 100 加百分号，不留小数 |",
      "en": "Form data is often exported as a CSV file: the first line is the header, then one record per line. Python's built-in `csv` module reads it directly:\n- `csv.DictReader(f)` treats the first line as the **header** and turns every following line into a dict such as `{\"company\": \"Xinghe Robotics\", \"employees\": \"2300\", ...}`; wrap it in `list(...)` to get a list of dicts.\n- Every value is read as a **string**: convert `\"2300\"` with `int(...)` before comparing it with 500.\n- For a real file write `with open(path, encoding=\"utf-8\", newline=\"\") as f:` (`with open`: lesson 10). `encoding=\"utf-8\"` keeps Chinese text intact; `newline=\"\"` is what the csv module asks for, so it can handle line endings itself.\n- The browser has no files, so below `io.StringIO(some_string)` lets a string act as an open file – same effect.\n\nWhen printing a report, an f-string (lesson 04) can take a **number format** after a colon inside the braces:\n\n| Code | Result | Meaning |\n|---|---|---|\n| `{2300:,}` | `2,300` | thousands separator |\n| `{2300:>8,}` | `   2,300` | right-aligned in 8 columns – good for lining numbers up in a column |\n| `{766.67:.1f}` | `766.7` | 1 decimal place |\n| `{5 / 6:.0%}` | `83%` | times 100 with a percent sign, no decimals |",
      "code": {
        "zh": "import csv\nimport io\n\ntext = \"\"\"company,employees,position\n星河智造,2300,CTO\n小满咖啡,12,店长\"\"\"\n\n# 网页里没有文件，用 io.StringIO 把一段字符串当作「打开的文件」来读\nrows = list(csv.DictReader(io.StringIO(text)))\nprint(rows[0])                       # 第一行数据变成了一个字典，键来自表头\nprint(type(rows[0][\"employees\"]))    # <class 'str'>：读出来的值都是字符串\n\nn = int(rows[0][\"employees\"])        # 要比较大小、做计算，先转成数字\nprint(n >= 500)\n\n# f-string 的数字格式：冒号后面写格式说明\nprint(f\"[{n:,}]\")          # 千位加逗号\nprint(f\"[{n:>8,}]\")        # 右对齐，占 8 格\nprint(f\"[{n / 3:.1f}]\")    # 保留 1 位小数\nprint(f\"[{5 / 6:.0%}]\")    # 变成百分数，不留小数",
        "en": "import csv\nimport io\n\ntext = \"\"\"company,employees,position\nXinghe Robotics,2300,CTO\nXiaoman Coffee,12,Manager\"\"\"\n\n# there are no files in the browser, so io.StringIO lets a string act as an \"open file\"\nrows = list(csv.DictReader(io.StringIO(text)))\nprint(rows[0])                       # the first data row became a dict keyed by the header\nprint(type(rows[0][\"employees\"]))    # <class 'str'>: every value is read as a string\n\nn = int(rows[0][\"employees\"])        # convert before comparing or calculating\nprint(n >= 500)\n\n# number formats in f-strings: a format spec after the colon\nprint(f\"[{n:,}]\")          # thousands separator\nprint(f\"[{n:>8,}]\")        # right-aligned in 8 columns\nprint(f\"[{n / 3:.1f}]\")    # 1 decimal place\nprint(f\"[{5 / 6:.0%}]\")    # as a percentage, no decimals"
      }
    },
    {
      "t": "p",
      "zh": "视频里，判断意向这件事是交给智能体按「你的评估标准」去做的。在把线索交给 Agent 之前，讲义先补充一步：用视频里提到的几个指标，在代码里给每条线索打个粗略的分。规则写死的部分交给代码，又快又不花钱；需要查资料、做判断、写文字的部分再交给 Agent。直接点运行：",
      "en": "In the video, rating the intent is left to the agents, following “your evaluation criteria”. Before handing leads to the agents, the notes add one step: score each lead roughly in code, using the indicators the video lists. Fixed rules belong in code – fast and free; researching, judging and writing go to the agents. Press run:"
    },
    {
      "t": "code",
      "file": "quick_screen.py",
      "run": true,
      "code": {
        "zh": "import csv\nimport io\n\nTEXT = \"\"\"company,industry,employees,contact,position,city,message\n星河智造,智能制造,2300,张伟,CTO,苏州,想了解能不能用 AI 自动回答经销商的技术咨询\n青禾教育,在线教育,180,李娜,客服主管,杭州,寒暑假咨询量太大，客服忙不过来\n小满咖啡,餐饮,12,王磊,店长,成都,先随便看看\n云帆物流,物流,860,陈静,CEO,上海,想做一个能自动查运单、处理投诉的智能客服\"\"\"\n\nDECISION_MAKERS = [\"CEO\", \"CTO\", \"总经理\", \"创始人\", \"运营总监\"]\nTARGET_INDUSTRIES = [\"在线教育\", \"物流\", \"电商\", \"智能制造\"]\nNEARBY_CITIES = [\"上海\", \"杭州\", \"苏州\"]          # 方便上门拜访的城市\n\ndef quick_screen(lead):\n    \"\"\"按公司规模、联系人职位、行业、城市打一个粗略的分（满分 6 分）\"\"\"\n    score = 0\n    employees = int(lead[\"employees\"])\n    if employees >= 500:\n        score += 2\n    elif employees >= 100:\n        score += 1\n    if lead[\"position\"] in DECISION_MAKERS:\n        score += 2\n    if lead[\"industry\"] in TARGET_INDUSTRIES:\n        score += 1\n    if lead[\"city\"] in NEARBY_CITIES:\n        score += 1\n    if score >= 5:\n        return score, \"高\"\n    if score >= 3:\n        return score, \"中\"\n    return score, \"低\"\n\nleads = list(csv.DictReader(io.StringIO(TEXT)))\nfor lead in leads:\n    score, level = quick_screen(lead)\n    print(f\"员工 {int(lead['employees']):>6,} 人  {score} 分（{score / 6:.0%}）  {level}意向  {lead['company']}\")",
        "en": "import csv\nimport io\n\nTEXT = \"\"\"company,industry,employees,contact,position,city,message\nXinghe Robotics,manufacturing,2300,Zhang Wei,CTO,Suzhou,Can AI answer our dealers' technical questions?\nQinghe Education,online education,180,Li Na,support lead,Hangzhou,Holiday enquiries swamp our support team\nXiaoman Coffee,catering,12,Wang Lei,manager,Chengdu,Just looking\nYunfan Logistics,logistics,860,Chen Jing,CEO,Shanghai,We want a bot that tracks parcels and handles complaints\"\"\"\n\nDECISION_MAKERS = [\"CEO\", \"CTO\", \"general manager\", \"founder\", \"head of operations\"]\nTARGET_INDUSTRIES = [\"online education\", \"logistics\", \"e-commerce\", \"manufacturing\"]\nNEARBY_CITIES = [\"Shanghai\", \"Hangzhou\", \"Suzhou\"]     # cities we can visit easily\n\ndef quick_screen(lead):\n    \"\"\"A rough score from company size, contact's position, industry and city (out of 6)\"\"\"\n    score = 0\n    employees = int(lead[\"employees\"])\n    if employees >= 500:\n        score += 2\n    elif employees >= 100:\n        score += 1\n    if lead[\"position\"] in DECISION_MAKERS:\n        score += 2\n    if lead[\"industry\"] in TARGET_INDUSTRIES:\n        score += 1\n    if lead[\"city\"] in NEARBY_CITIES:\n        score += 1\n    if score >= 5:\n        return score, \"high\"\n    if score >= 3:\n        return score, \"medium\"\n    return score, \"low\"\n\nleads = list(csv.DictReader(io.StringIO(TEXT)))\nfor lead in leads:\n    score, level = quick_screen(lead)\n    print(f\"{int(lead['employees']):>6,} staff  {score} pts ({score / 6:.0%})  {level:<6}  {lead['company']}\")"
      },
      "note": {
        "zh": "`if ... elif ...` 只会加其中一档分（第 05 节）；`return score, level` 一次返回两个值，调用时用 `score, level = ...` 拆开（第 07 节）。公司和人物都是虚构的。",
        "en": "`if ... elif ...` adds only one of the two size scores (lesson 05); `return score, level` returns two values, unpacked with `score, level = ...` (lesson 07). All companies and people are made up."
      }
    },
    {
      "t": "h",
      "zh": "二、用 prompt 定义两个智能体",
      "en": "2. Two agents defined by prompts"
    },
    {
      "t": "p",
      "zh": "[▶ 02:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=153) 接下来是智能体的设计，老师说它没有想象的那么复杂。[▶ 03:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=184) 他特别对没有编程基础的同学（包括产品经理）说：学技术不是为了让你去写代码，而是要知道整个工程是怎么运转的、数据是怎么流转的、AI 能做什么，这样才有举一反三的能力。\n\n[▶ 03:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=215) 代码开头是模型（GPT-3.5-turbo）和一个联网检索的 API。然后是两个智能体，用大白话写提示词就能设计出来：**你是谁（role）、你的任务是什么（goal）、你的背景是什么（backstory）**。一个是**销售代表**，负责识别客户画像；一个是**首席销售代表**，负责和客户建立联系，用量身定制、能打动对方的沟通，一步步把潜在客户培养成真正的客户。[▶ 04:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=246) 老师的总结：说白了，这两个智能体就是用 prompt 定义出来的——所以 prompt 很重要。",
      "en": "[▶ 02:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=153) Next comes the agent design, which the instructor says is simpler than you'd think. [▶ 03:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=184) He speaks directly to students without a coding background, product managers included: learning the technology isn't about writing code yourself but about knowing how the project runs, how data flows and what AI can do – that's what lets you transfer the idea to new problems.\n\n[▶ 03:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=215) The code starts with the model (GPT-3.5-turbo) and a web-search API. Then come two agents, designed with plain-language prompts: **who you are (role), what your job is (goal), and your background (backstory)**. One is the **sales representative**, who identifies the customer profile; the other is the **lead sales representative**, who builds relationships with customers and, through tailored communication that wins them over, gradually turns leads into real customers. [▶ 04:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=246) His summary: these two agents are simply defined by prompts – which is why prompts matter so much."
    },
    {
      "t": "code",
      "file": "l14_leads_solution.py",
      "code": {
        "zh": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")                       # 必须写在 import crewai 之前\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import LLM, Agent, Crew, Task\nfrom crewai_tools import DirectoryReadTool, FileReadTool\nfrom llm import API_KEY, BASE_URL, MODEL\n\nllm = LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY)    # 视频里是 GPT-3.5-turbo\n\ndirectory_tool = DirectoryReadTool(directory=\"data/l14_research\")   # 列出资料文件夹里有哪些文件\nfile_tool = FileReadTool(base_dir=\"data/l14_research\")              # 读文件（只允许读这个文件夹）\n\nsales_rep = Agent(\n    role=\"销售代表\",\n    goal=\"分析潜在客户，找出最值得跟进的高意向客户\",\n    backstory=\"你在智语科技做销售。你擅长根据公司规模、行业、联系人职位、所在城市和公司最近的动态，\"\n              \"判断一个潜在客户是高意向、中意向还是低意向，并写出清楚的客户画像。\",\n    tools=[directory_tool, file_tool],\n    llm=llm,\n    allow_delegation=False,      # 不把活转给别的 Agent\n    verbose=True,                # 把思考和工具调用过程打印出来\n)\n\nlead_sales_rep = Agent(\n    role=\"首席销售代表\",\n    goal=\"用个性化、有吸引力的沟通方式培育潜在客户\",\n    backstory=\"你是智语科技最资深的销售。你写的邮件总能抓住对方最近关心的事，\"\n              \"把我们的产品和对方的目标联系起来，语气真诚，从不夸大。\",\n    tools=[directory_tool, file_tool],\n    llm=llm,\n    allow_delegation=False,\n    verbose=True,\n)",
        "en": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")                       # must come before import crewai\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import LLM, Agent, Crew, Task\nfrom crewai_tools import DirectoryReadTool, FileReadTool\nfrom llm import API_KEY, BASE_URL, MODEL\n\nllm = LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY)    # the video uses GPT-3.5-turbo\n\ndirectory_tool = DirectoryReadTool(directory=\"data/l14_research\")   # lists the files in the research folder\nfile_tool = FileReadTool(base_dir=\"data/l14_research\")              # reads files (only inside that folder)\n\nsales_rep = Agent(\n    role=\"Sales Representative\",\n    goal=\"Analyse leads and find the high-intent ones most worth following up\",\n    backstory=\"You sell for Zhiyu Tech. From company size, industry, the contact's position, the city and the \"\n              \"company's recent news you can tell whether a lead is high, medium or low intent, and you write clear profiles.\",\n    tools=[directory_tool, file_tool],\n    llm=llm,\n    allow_delegation=False,      # don't pass work on to other agents\n    verbose=True,                # print the reasoning and tool calls\n)\n\nlead_sales_rep = Agent(\n    role=\"Lead Sales Representative\",\n    goal=\"Nurture leads with personalised, engaging communication\",\n    backstory=\"You are Zhiyu Tech's most senior salesperson. Your emails always pick up what the other side cares \"\n              \"about right now and tie our product to their goals - sincere, never overstated.\",\n    tools=[directory_tool, file_tool],\n    llm=llm,\n    allow_delegation=False,\n    verbose=True,\n)"
      },
      "note": {
        "zh": "完整文件里资料文件夹的路径是用 `Path(__file__).parent / \"data\" / \"l14_research\"` 算出来的。但要注意：crewai-tools 出于安全考虑，`DirectoryReadTool` 只允许列出**当前工作文件夹**里面的路径，所以一定要先进入 `practice` 文件夹再运行；在别的文件夹里运行，智能体列目录时只会收到一条「is outside the allowed directory」的错误，拿不到资料。CrewAI 的 `role`、`goal`、`backstory` 合起来，作用就相当于 OpenAI Agents SDK 里的 `instructions`。",
        "en": "In the full file the research folder's path is computed with `Path(__file__).parent / \"data\" / \"l14_research\"`. But note: for security reasons crewai-tools' `DirectoryReadTool` only lists paths inside the **current working folder**, so you must change into the `practice` folder before running. Run it from any other folder and the agent only gets an “is outside the allowed directory” error when it lists the folder – no research material. Together, CrewAI's `role`, `goal` and `backstory` do the job of `instructions` in the OpenAI Agents SDK."
      }
    },
    {
      "t": "h",
      "zh": "三、给智能体挂工具",
      "en": "3. Give the agents tools"
    },
    {
      "t": "p",
      "zh": "[▶ 04:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=246) 视频里给智能体挂了两类工具：\n- **读文件的工具**：比如有些客户本来就是老客户，资料在你的数据库里，可以直接调出来；老师还准备了一些文档给智能体做参考方案。\n- **联网检索的工具**：上网搜这家公司和它的老板。\n\n讲义的版本没有搜索 API 的 key，所以用一个本地资料文件夹 `practice/data/l14_research` 代替联网搜索：里面是每家公司的「公开资料摘要」和我们自己的产品介绍（都是虚构的）。`DirectoryReadTool` 负责列出文件夹里有哪些文件，`FileReadTool` 负责读其中一个文件——智能体会先列目录，再挑相关的文件来读。",
      "en": "[▶ 04:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=246) The video gives the agents two kinds of tools:\n- **File-reading tools**: some leads are existing customers whose data is already in your database and can be pulled straight out; the instructor also prepared some documents as reference material for the agents.\n- **A web-search tool**: to look up the company and its boss online.\n\nThe notes' version has no search-API key, so a local research folder, `practice/data/l14_research`, stands in for web search: it holds a “public information summary” for each company and our own product description (all made up). `DirectoryReadTool` lists the files in the folder and `FileReadTool` reads one of them – the agent lists the folder first, then picks the relevant files to read."
    },
    {
      "t": "note",
      "zh": "有搜索 API 的 key 的话，可以像视频一样加上联网搜索（视频没有说用的是哪个搜索服务）。比如 `crewai_tools` 里的 `SerperDevTool`，它需要环境变量 `SERPER_API_KEY`（第 52 节有介绍）。把它加进两个 Agent 的 `tools` 列表就行，其余代码不用改。",
      "en": "If you have a search-API key you can add web search as in the video (the video doesn't say which search service it uses) – for example `SerperDevTool` from `crewai_tools`, which needs the `SERPER_API_KEY` environment variable (introduced in lesson 52). Add it to both agents' `tools` lists; nothing else changes."
    },
    {
      "t": "h",
      "zh": "四、两个任务：一个了解公司，一个写邮件",
      "en": "4. Two tasks: understand the company, then write the email"
    },
    {
      "t": "p",
      "zh": "[▶ 04:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=278) 两个智能体各有一个任务（Task）。第一个任务是去了解这家公司：属于什么行业、有什么解决方案……[▶ 05:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=308) 任务的输出要写清楚：针对这家公司的一份综合报告，报告要包含哪几个方面。第二个任务是去了解这家公司、特别是它的老板最近的活动，最终输出一封电子邮件，把我们的方案和对方的目标联系起来。老师一句话概括：一个任务了解公司，一个任务了解老板，然后给老板写邮件。",
      "en": "[▶ 04:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=278) Each agent has one task. The first task is to understand the company: its industry, its solutions and so on. [▶ 05:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=308) The task also spells out the expected output: a comprehensive report on this company, and which aspects the report must cover. The second task is to learn about the company and especially its boss's recent activities, and to produce an email that ties our solution to their goals. The instructor's one-liner: one task gets to know the company, one gets to know the boss, then writes the boss an email."
    },
    {
      "t": "code",
      "file": "l14_leads_solution.py",
      "code": {
        "zh": "profiling_task = Task(\n    description=\"\"\"分析潜在客户「{company}」：行业 {industry}，员工约 {employees} 人，所在城市 {city}。\n联系人是 {contact}（{position}），他在表单里的留言是：「{message}」。\n先查看资料文件夹，阅读这家公司的资料和我们的产品介绍，再按下面的标准判断意向：\n- 高意向：规模和行业都适合我们的产品，联系人能拍板，最近的动态显示有明确需求；\n- 中意向：有一定需求，但规模、职位或时机不太理想；\n- 低意向：规模太小或者看不出需求。\"\"\",\n    expected_output=\"一份客户画像报告：公司概况、最近的重要动态、可能的需求、和我们产品的契合点；\"\n                    \"最后一行写「意向等级：高/中/低」，并用一句话说明理由。\",\n    agent=sales_rep,\n)\n\noutreach_task = Task(\n    description=\"\"\"根据上一步的客户画像报告，给「{company}」的 {contact}（{position}）写一封首次联系的邮件。\n要提到对方公司最近的动态，把我们的产品和对方的目标联系起来；如果意向等级是低，就写得简短一些。\"\"\",\n    expected_output=\"一封完整的中文邮件草稿：第一行是邮件主题，后面是正文，不超过 300 字。\",\n    agent=lead_sales_rep,\n)",
        "en": "profiling_task = Task(\n    description=\"\"\"Analyse the lead \"{company}\": industry {industry}, about {employees} staff, based in {city}.\nThe contact is {contact} ({position}); their message on the form: \"{message}\".\nFirst look through the research folder and read about this company and about our product, then rate the intent:\n- high: size and industry fit our product, the contact can decide, and recent news shows a clear need;\n- medium: some need, but size, position or timing is not ideal;\n- low: too small, or no visible need.\"\"\",\n    expected_output=\"A lead profile: company overview, important recent news, likely needs, fit with our product; \"\n                    \"the last line reads 'Intent: high/medium/low' with a one-sentence reason.\",\n    agent=sales_rep,\n)\n\noutreach_task = Task(\n    description=\"\"\"Using the lead profile from the previous step, write a first outreach email to {contact} ({position})\nat \"{company}\". Mention the company's recent news and tie our product to their goals; keep it short if the intent is low.\"\"\",\n    expected_output=\"A complete email draft: the subject on the first line, then the body, at most 200 words.\",\n    agent=lead_sales_rep,\n)"
      }
    },
    {
      "t": "p",
      "zh": "几个要点：\n- `description` 是交代给智能体的任务，`expected_output` 写清楚要交出什么样的结果，`agent` 指定由谁来做。\n- `{company}`、`{contact}` 这些花括号是**占位符**，运行时会被 `kickoff(inputs=...)` 里同名的值替换。讲义让占位符的名字和 CSV 的表头一模一样，这样表单的一行可以原样交给 `inputs`。\n- 第二个任务里写着「根据上一步的客户画像报告」：CrewAI 默认按顺序执行任务，并自动把前面任务的结果交给后面的任务作参考。这和第 12 节的顺序编排是一个道理。",
      "en": "Key points:\n- `description` is the job given to the agent, `expected_output` says what the result must look like, and `agent` names who does it.\n- `{company}`, `{contact}` and the like are **placeholders**, replaced at run time by the values of the same name in `kickoff(inputs=...)`. The notes name them exactly like the CSV header, so one row of the form can go straight into `inputs`.\n- The second task says “using the lead profile from the previous step”: by default CrewAI runs tasks in order and automatically hands earlier results to later tasks as context – the same idea as sequential orchestration in lesson 12."
    },
    {
      "t": "h",
      "zh": "五、组队，把表单数据交给 kickoff",
      "en": "5. Form the crew and pass the form data to kickoff"
    },
    {
      "t": "p",
      "zh": "[▶ 05:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=340) 最后一段把两个智能体和两个任务整合成一个团队（Crew）。`inputs` 就是输入信息，也就是表单数据：公司名称、行业、老板、职位……[▶ 06:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=371) 老师说这部分完全可以接到数据库上，直接取出表单数据，然后执行任务就行——整个逻辑其实一点也不复杂。",
      "en": "[▶ 05:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=340) The last section combines the two agents and two tasks into a team, the Crew. `inputs` is the input information – the form data: company name, industry, the boss, the position… [▶ 06:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=371) The instructor points out that you could connect this to a database and pull the form data straight in, then just run the tasks – the whole logic is really not complicated."
    },
    {
      "t": "code",
      "file": "l14_leads_solution.py",
      "code": {
        "zh": "import csv\n\ncrew = Crew(\n    agents=[sales_rep, lead_sales_rep],\n    tasks=[profiling_task, outreach_task],     # 默认按顺序执行：先画像，再写邮件\n    verbose=True,\n)\n\nif __name__ == \"__main__\":\n    with open(\"data/l14_leads.csv\", encoding=\"utf-8\", newline=\"\") as f:\n        leads = list(csv.DictReader(f))        # 表单数据：每一行是一个字典\n    lead = leads[0]                            # 先分析第 1 条线索\n    result = crew.kickoff(inputs=lead)         # 字典的键填进任务里同名的 {占位符}\n    print(profiling_task.output.raw)           # 第 1 个任务的结果：客户画像报告\n    print(result.raw)                          # 最后一个任务的结果：邮件草稿",
        "en": "import csv\n\ncrew = Crew(\n    agents=[sales_rep, lead_sales_rep],\n    tasks=[profiling_task, outreach_task],     # run in order by default: profile first, then the email\n    verbose=True,\n)\n\nif __name__ == \"__main__\":\n    with open(\"data/l14_leads.csv\", encoding=\"utf-8\", newline=\"\") as f:\n        leads = list(csv.DictReader(f))        # the form data: one dict per row\n    lead = leads[0]                            # analyse the first lead\n    result = crew.kickoff(inputs=lead)         # dict keys fill the {placeholders} of the same name\n    print(profiling_task.output.raw)           # the first task's result: the lead profile\n    print(result.raw)                          # the last task's result: the email draft"
      },
      "note": {
        "zh": "完整文件还会把画像报告和邮件草稿一起存成 `data/l14_output/<公司名>.md`。一条线索大约调用模型 4 到 8 次（实测一次是 4 次：模型会在一次回复里同时请求好几个工具）。",
        "en": "The full file also saves the profile and the email draft together as `data/l14_output/<company>.md`. One lead takes about 4 to 8 model calls (one real run needed 4, because the model can request several tools in a single reply)."
      }
    },
    {
      "t": "h",
      "zh": "六、看运行过程：先检索，再加工",
      "en": "6. Reading the run: research first, then write"
    },
    {
      "t": "p",
      "zh": "[▶ 06:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=371) 老师接着展示了完整的运行记录（他用自己公司的信息作为演示线索）：\n- **销售代表**先说明要分析和收集这家公司的信息，做了任务拆解和行动规划，然后用输入的信息去联网搜索，[▶ 06:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=404) 搜到了公司官网、创始人的采访、知乎上的内容，还有公司参加人工智能奖项颁奖典礼、拿到获奖证书的报道。最后给出 final answer：把检索到的信息加工整理成公司概况。\n- [▶ 07:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=436) **首席销售代表**要深入了解这家公司和它的 CEO，以 CEO 的名字为关键词又搜了一轮：采访、融资消息、大会演讲……[▶ 07:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=466) 最终写出一封邮件，开头就祝贺对方刚获得的奖项——[▶ 08:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=496) 这正是第一步检索到的内容。邮件是基于检索到的信息、按你定义的标准写出来的。\n\n讲义版本运行时，CrewAI 的 `verbose=True` 会打印出类似的过程（内容省略）：",
      "en": "[▶ 06:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=371) The instructor then shows the full run log (he used his own company as the demo lead):\n- The **sales representative** states that it will analyse and gather information on the company, breaks the task down and plans its actions, then searches the web with the input details. [▶ 06:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=404) It finds the company website, interviews with the founder, posts on Zhihu, and reports of the company receiving an AI award with its certificate. Its final answer turns the findings into a company overview.\n- [▶ 07:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=436) The **lead sales representative** wants to understand the company and its CEO, and searches again using the CEO's name: interviews, funding news, conference talks… [▶ 07:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=466) It ends with an email that opens by congratulating them on the award – [▶ 08:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=496) exactly what the first step had found. The email is written from the retrieved information, following the criteria you set.\n\nWhen you run the notes' version, CrewAI's `verbose=True` prints a similar trail (content omitted):"
    },
    {
      "t": "code",
      "file": {
        "zh": "输出结构（节选，正文省略）",
        "en": "output structure (excerpt, content omitted)"
      },
      "lang": "text",
      "code": {
        "zh": "┌── 🚀 Crew Execution Started ──┐\n┌── 📋 Task Started ──┐   Name: 分析潜在客户「云帆物流」：行业 物流，员工约 860 人……\n┌── 🤖 Agent Started ──┐   Agent: 销售代表\n┌── 🔧 Tool Execution Started (#1) ──┐   Tool: list_files_in_directory\n┌── ✅ Tool Execution Completed (#1) ──┐   Output: File paths: …\\l14_research\\云帆物流.md …\n┌── 🔧 Tool Execution Started (#1) ──┐   Tool: read_a_files_content\n     Args: {'file_path': '…\\\\l14_research\\\\云帆物流.md'}\n┌── ✅ Agent Final Answer ──┐   Agent: 销售代表   Final Answer: （客户画像报告……）\n┌── 🤖 Agent Started ──┐   Agent: 首席销售代表\n┌── ✅ Agent Final Answer ──┐   Agent: 首席销售代表   Final Answer: （邮件草稿……）\n┌── Crew Completion ──┐",
        "en": "┌── 🚀 Crew Execution Started ──┐\n┌── 📋 Task Started ──┐   Name: Analyse the lead \"Yunfan Logistics\": industry logistics, about 860 staff…\n┌── 🤖 Agent Started ──┐   Agent: Sales Representative\n┌── 🔧 Tool Execution Started (#1) ──┐   Tool: list_files_in_directory\n┌── ✅ Tool Execution Completed (#1) ──┐   Output: File paths: …\\l14_research\\云帆物流.md …\n┌── 🔧 Tool Execution Started (#1) ──┐   Tool: read_a_files_content\n     Args: {'file_path': '…\\\\l14_research\\\\云帆物流.md'}\n┌── ✅ Agent Final Answer ──┐   Agent: Sales Representative   Final Answer: (lead profile report…)\n┌── 🤖 Agent Started ──┐   Agent: Lead Sales Representative\n┌── ✅ Agent Final Answer ──┐   Agent: Lead Sales Representative   Final Answer: (email draft…)\n┌── Crew Completion ──┐"
      }
    },
    {
      "t": "p",
      "zh": "[▶ 08:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=496) 老师指出它和平时用的对话产品最大的区别：这里的邮件和最终结果，是经过一系列步骤灵活、动态地处理出来的；而用对话产品，是一个输入一个输出，你得不断地给它喂信息，一点点让它了解你，非常麻烦。智能体则是按任务的工作流来定制的。[▶ 08:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=528) 他说这是企业里用得非常多的一类智能体实践。",
      "en": "[▶ 08:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=496) The instructor points out the big difference from the chat products people normally use: here the email and the final result come out of a series of steps, handled flexibly and dynamically; with a chat product it's one input, one output, and you keep feeding it information so it slowly gets to know you – very tedious. The agents are tailored to the task's workflow. [▶ 08:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=528) He says this kind of agent is used a great deal in companies."
    },
    {
      "t": "check",
      "q": {
        "zh": "视频里最后那封邮件为什么能祝贺对方刚获得的奖项？",
        "en": "Why could the final email in the video congratulate the company on its recent award?"
      },
      "options": [
        {
          "zh": "GPT-3.5-turbo 本来就知道这家公司",
          "en": "GPT-3.5-turbo already knew the company"
        },
        {
          "zh": "表单里填了获奖信息",
          "en": "The award was written on the form"
        },
        {
          "zh": "智能体先检索到了获奖的报道，写邮件时用上了检索结果",
          "en": "The agents had found reports of the award and used them when writing"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "两个智能体都先检索再加工；邮件的内容来自前面检索、整理出来的信息，而不是模型凭空编的。",
        "en": "Both agents research first and then write; the email's content comes from the information found and organised earlier, not from the model's imagination."
      }
    },
    {
      "t": "h",
      "zh": "七、课堂问答：要联网吗？为什么不用 Dify？",
      "en": "7. Q&A: does it need the internet? Why not Dify?"
    },
    {
      "t": "note",
      "zh": "[▶ 08:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=528) 有同学问这个例子要不要联网才能用。老师说当然要；不想联网，就得换成能在你本地跑起来的方案。\n\n[▶ 09:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=559) 还有同学问：不用 Python，用 Dify 这类平台行不行？老师的看法是：Dify、FastGPT、扣子这类工具课程后面也会讲，它们是很好的学习工具，做些小东西没问题；但面对垂直、定制化的复杂场景就不够了。[▶ 09:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=590) 比如他前面讲的 RAG 场景，文档里同时有图片、文字和表格，这类平台就处理不好；场景越复杂、数据越多，结果越不准。做大型商业项目，还是要自己定制开发。",
      "en": "[▶ 08:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=528) A student asks whether the example needs internet access. Of course, says the instructor; if you don't want to go online, you have to switch to a setup that runs on your own machine.\n\n[▶ 09:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=559) Another asks whether a platform like Dify could replace Python. His view: Dify, FastGPT, Coze and the like will be covered later in the course; they are good learning tools and fine for small things, but not enough for vertical, customised, complex scenarios. [▶ 09:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=15&t=590) For instance, in the RAG scenario he described earlier, documents mix images, text and tables, which such platforms handle poorly; the more complex the scenario and the more data, the less accurate they get. Large commercial projects still need custom development."
    },
    {
      "t": "h",
      "zh": "八、和第 12 节对照（补充）",
      "en": "8. Compared with lesson 12 (extra)"
    },
    {
      "t": "p",
      "zh": "换个框架，思路还是第 12 节的**顺序编排**——上一个的结果交给下一个：\n\n| CrewAI（本节） | OpenAI Agents SDK（第 12 节） |\n|---|---|\n| `Agent(role=..., goal=..., backstory=...)` | `Agent(instructions=...)` |\n| `Task(description=..., expected_output=..., agent=...)` | 传给 `Runner.run` 的那段输入文字 |\n| `Crew(tasks=[任务1, 任务2])`，自动把任务 1 的结果交给任务 2 | 自己写两次 `Runner.run`，把 `r1.final_output` 放进第二次的输入 |\n| `crew.kickoff(inputs=字典)` 填占位符 | 用 f-string 把变量拼进输入 |\n\nCrewAI 把「角色」「任务」「团队」拆得更细，适合这种步骤固定的业务流程。",
      "en": "Different framework, same idea as **sequential orchestration** in lesson 12 – each result feeds the next step:\n\n| CrewAI (this lesson) | OpenAI Agents SDK (lesson 12) |\n|---|---|\n| `Agent(role=..., goal=..., backstory=...)` | `Agent(instructions=...)` |\n| `Task(description=..., expected_output=..., agent=...)` | the input text passed to `Runner.run` |\n| `Crew(tasks=[task1, task2])` hands task 1's result to task 2 automatically | two `Runner.run` calls, with `r1.final_output` in the second input |\n| `crew.kickoff(inputs=a_dict)` fills the placeholders | an f-string puts variables into the input |\n\nCrewAI splits roles, tasks and the team more finely, which suits business processes with fixed steps like this one."
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "视频里，销售拿到表单线索后首先要判断什么？",
        "en": "In the video, what does a salesperson judge first on receiving a form lead?"
      },
      "options": [
        {
          "zh": "这条线索是高意向、中意向还是低意向",
          "en": "Whether the lead is high, medium or low intent"
        },
        {
          "zh": "要不要给对方打折",
          "en": "Whether to offer a discount"
        },
        {
          "zh": "对方用的是什么浏览器",
          "en": "Which browser the visitor used"
        },
        {
          "zh": "表单有没有填错别字",
          "en": "Whether the form has typos"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "依据公司规模、行业、联系人角色、地点等指标判断意向，再决定销售策略。",
        "en": "Intent is judged from indicators such as company size, industry, the contact's role and location, and the sales strategy follows from it."
      }
    },
    {
      "q": {
        "zh": "`csv.DictReader` 读出来的 `row[\"employees\"]` 是 `\"2300\"`。直接写 `row[\"employees\"] >= 500` 会怎样？",
        "en": "`csv.DictReader` reads `row[\"employees\"]` as `\"2300\"`. What happens if you write `row[\"employees\"] >= 500` directly?"
      },
      "options": [
        {
          "zh": "得到 True",
          "en": "It gives True"
        },
        {
          "zh": "报 TypeError：字符串和整数不能比较大小，要先 `int(...)`",
          "en": "TypeError: a string can't be compared with an int – convert with `int(...)` first"
        },
        {
          "zh": "得到 False",
          "en": "It gives False"
        },
        {
          "zh": "自动转换成数字再比较",
          "en": "It converts to a number automatically"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "csv 读出来的值都是字符串。比较大小或计算之前，用 `int()` 或 `float()` 转换。",
        "en": "Every value from csv is a string. Convert with `int()` or `float()` before comparing or calculating."
      }
    },
    {
      "q": {
        "zh": "在 CrewAI 里，视频说智能体用哪三样来定义？",
        "en": "In CrewAI, which three things define an agent, as the video describes?"
      },
      "options": [
        {
          "zh": "model、temperature、max_tokens",
          "en": "model, temperature, max_tokens"
        },
        {
          "zh": "description、expected_output、agent",
          "en": "description, expected_output, agent"
        },
        {
          "zh": "role（你是谁）、goal（任务是什么）、backstory（背景）",
          "en": "role (who you are), goal (your job), backstory (your background)"
        },
        {
          "zh": "agents、tasks、verbose",
          "en": "agents, tasks, verbose"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "智能体用大白话的 prompt 定义：身份、任务和背景。`description`/`expected_output` 是 Task 的参数，`agents`/`tasks` 是 Crew 的参数。",
        "en": "An agent is defined with plain-language prompts: identity, job and background. `description`/`expected_output` belong to Task, and `agents`/`tasks` to Crew."
      }
    },
    {
      "q": {
        "zh": "任务描述里的 `{company}` 是在什么时候被替换成真实公司名的？",
        "en": "When is `{company}` in a task description replaced by the real company name?"
      },
      "options": [
        {
          "zh": "创建 `Task(...)` 的时候",
          "en": "When `Task(...)` is created"
        },
        {
          "zh": "模型自己猜出来填进去",
          "en": "The model guesses and fills it in"
        },
        {
          "zh": "读 CSV 的时候",
          "en": "When the CSV is read"
        },
        {
          "zh": "运行 `crew.kickoff(inputs=...)` 时，用 `inputs` 里同名的值替换",
          "en": "When `crew.kickoff(inputs=...)` runs, using the value of the same name in `inputs`"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "占位符要等到 `kickoff` 时才填。所以占位符的名字要和 `inputs` 字典的键一致——讲义让它们和 CSV 表头一模一样。",
        "en": "Placeholders are filled only at `kickoff`, so their names must match the keys of the `inputs` dict – the notes make them identical to the CSV header."
      }
    },
    {
      "q": {
        "zh": "`f\"{2300:>8,}\"` 的结果是什么？",
        "en": "What is `f\"{2300:>8,}\"`?"
      },
      "options": [
        {
          "zh": "`'2300    '`",
          "en": "`'2300    '`"
        },
        {
          "zh": "`'   2,300'`：加千位逗号，右对齐占 8 格",
          "en": "`'   2,300'`: thousands separator, right-aligned in 8 columns"
        },
        {
          "zh": "`'2,300.00'`",
          "en": "`'2,300.00'`"
        },
        {
          "zh": "`'230000%'`",
          "en": "`'230000%'`"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "`>8` 表示右对齐、宽 8 格，`,` 表示千位加逗号。`2,300` 有 5 个字符，前面补 3 个空格。",
        "en": "`>8` means right-aligned in a width of 8, and `,` adds the thousands separator. `2,300` is 5 characters, so 3 spaces are added in front."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "读表单数据并打分",
        "en": "Read the form data and score it"
      },
      "code": {
        "zh": "import csv\n\nwith [[open]](\"data/l14_leads.csv\", encoding=\"utf-8\", newline=\"\") as f:\n    leads = list(csv.[[DictReader]](f))\n\nfor lead in leads:\n    employees = [[int]](lead[\"employees\"])\n    score, level = quick_screen(lead)\n    print(f\"{employees:>6[[,]]} 人  {score / 6:.0[[%]]}  {level}意向  {lead['company']}\")",
        "en": "import csv\n\nwith [[open]](\"data/l14_leads.csv\", encoding=\"utf-8\", newline=\"\") as f:\n    leads = list(csv.[[DictReader]](f))\n\nfor lead in leads:\n    employees = [[int]](lead[\"employees\"])\n    score, level = quick_screen(lead)\n    print(f\"{employees:>6[[,]]} staff  {score / 6:.0[[%]]}  {level}  {lead['company']}\")"
      },
      "explain": {
        "zh": "`open` 打开文件，`csv.DictReader` 把每行变成字典；值是字符串，先 `int()`；`,` 加千位逗号，`%` 显示成百分数。",
        "en": "`open` opens the file and `csv.DictReader` turns each row into a dict; values are strings, so `int()` first; `,` adds thousands separators and `%` shows a percentage."
      }
    },
    {
      "title": {
        "zh": "CrewAI：智能体、任务、团队",
        "en": "CrewAI: agent, task, crew"
      },
      "code": {
        "zh": "sales_rep = Agent(\n    [[role]]=\"销售代表\",\n    [[goal]]=\"找出最值得跟进的高意向客户\",\n    [[backstory]]=\"你擅长根据公司规模、行业和职位判断客户意向。\",\n    tools=[directory_tool, file_tool],\n    llm=llm,\n)\n\nprofiling_task = Task(\n    description=\"分析潜在客户「{company}」，联系人是 {contact}（{position}）。\",\n    [[expected_output]]=\"一份客户画像报告，最后一行写意向等级。\",\n    agent=sales_rep,\n)\n\ncrew = [[Crew]](agents=[sales_rep, lead_sales_rep], tasks=[profiling_task, outreach_task])\nresult = crew.[[kickoff]]([[inputs]]=lead)",
        "en": "sales_rep = Agent(\n    [[role]]=\"Sales Representative\",\n    [[goal]]=\"Find the high-intent leads most worth following up\",\n    [[backstory]]=\"You can tell a lead's intent from company size, industry and position.\",\n    tools=[directory_tool, file_tool],\n    llm=llm,\n)\n\nprofiling_task = Task(\n    description=\"Analyse the lead {company}; the contact is {contact} ({position}).\",\n    [[expected_output]]=\"A lead profile whose last line gives the intent level.\",\n    agent=sales_rep,\n)\n\ncrew = [[Crew]](agents=[sales_rep, lead_sales_rep], tasks=[profiling_task, outreach_task])\nresult = crew.[[kickoff]]([[inputs]]=lead)"
      },
      "explain": {
        "zh": "Agent 用 `role`、`goal`、`backstory` 定义；Task 用 `expected_output` 写清要交的结果；`Crew` 把智能体和任务组合起来，`kickoff(inputs=...)` 填入表单数据开始运行。",
        "en": "An Agent is defined by `role`, `goal` and `backstory`; a Task states its result in `expected_output`; `Crew` combines agents and tasks, and `kickoff(inputs=...)` fills in the form data and starts the run."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：读表单 CSV 并粗筛意向",
        "en": "Write it: read the form CSV and screen the leads"
      },
      "run": true,
      "task": {
        "zh": "不看上面的代码，补全 starter：\n1. 用 `csv.DictReader` 和 `io.StringIO(TEXT)` 读出字典的列表 `leads`\n2. 写 `quick_screen(lead)`：员工数（先 `int()`）≥ 500 加 2 分、≥ 100 加 1 分；职位在 `DECISION_MAKERS` 里加 2 分；总分 ≥ 3 返回 `\"高\"`，否则返回 `\"低\"`\n3. 逐条打印：员工数右对齐 6 格并带千位逗号，后面是意向等级和公司名\n\n可以直接点运行。",
        "en": "Without looking above, complete the starter:\n1. read the list of dicts `leads` with `csv.DictReader` and `io.StringIO(TEXT)`\n2. write `quick_screen(lead)`: employees (convert with `int()`) ≥ 500 scores 2, ≥ 100 scores 1; a position in `DECISION_MAKERS` scores 2; a total ≥ 3 returns `\"high\"`, otherwise `\"low\"`\n3. print each lead: employees right-aligned in 6 columns with thousands separators, then the level and the company\n\nYou can run it right here."
      },
      "starter": {
        "zh": "import csv\nimport io\n\nTEXT = \"\"\"company,employees,position\n星河智造,2300,CTO\n青禾教育,180,客服主管\n云帆物流,860,CEO\"\"\"\nDECISION_MAKERS = [\"CEO\", \"CTO\", \"总经理\"]\n\n# 1. 读出字典的列表 leads\n\n\n# 2. quick_screen(lead)：按员工数和职位打分，返回 \"高\" 或 \"低\"\n\n\n# 3. 逐条打印：员工数（右对齐 6 格、千位逗号）、意向等级、公司名\n",
        "en": "import csv\nimport io\n\nTEXT = \"\"\"company,employees,position\nXinghe Robotics,2300,CTO\nQinghe Education,180,support lead\nYunfan Logistics,860,CEO\"\"\"\nDECISION_MAKERS = [\"CEO\", \"CTO\", \"general manager\"]\n\n# 1. read the list of dicts leads\n\n\n# 2. quick_screen(lead): score by employees and position, return \"high\" or \"low\"\n\n\n# 3. print each lead: employees (right-aligned in 6 columns, thousands separators), level, company\n"
      },
      "solution": {
        "zh": "import csv\nimport io\n\nTEXT = \"\"\"company,employees,position\n星河智造,2300,CTO\n青禾教育,180,客服主管\n云帆物流,860,CEO\"\"\"\nDECISION_MAKERS = [\"CEO\", \"CTO\", \"总经理\"]\n\n# 1. 读出字典的列表 leads\nleads = list(csv.DictReader(io.StringIO(TEXT)))\n\n# 2. quick_screen(lead)：按员工数和职位打分，返回 \"高\" 或 \"低\"\ndef quick_screen(lead):\n    score = 0\n    employees = int(lead[\"employees\"])\n    if employees >= 500:\n        score += 2\n    elif employees >= 100:\n        score += 1\n    if lead[\"position\"] in DECISION_MAKERS:\n        score += 2\n    if score >= 3:\n        return \"高\"\n    return \"低\"\n\n# 3. 逐条打印：员工数（右对齐 6 格、千位逗号）、意向等级、公司名\nfor lead in leads:\n    level = quick_screen(lead)\n    print(f\"{int(lead['employees']):>6,}  {level}  {lead['company']}\")\n",
        "en": "import csv\nimport io\n\nTEXT = \"\"\"company,employees,position\nXinghe Robotics,2300,CTO\nQinghe Education,180,support lead\nYunfan Logistics,860,CEO\"\"\"\nDECISION_MAKERS = [\"CEO\", \"CTO\", \"general manager\"]\n\n# 1. read the list of dicts leads\nleads = list(csv.DictReader(io.StringIO(TEXT)))\n\n# 2. quick_screen(lead): score by employees and position, return \"high\" or \"low\"\ndef quick_screen(lead):\n    score = 0\n    employees = int(lead[\"employees\"])\n    if employees >= 500:\n        score += 2\n    elif employees >= 100:\n        score += 1\n    if lead[\"position\"] in DECISION_MAKERS:\n        score += 2\n    if score >= 3:\n        return \"high\"\n    return \"low\"\n\n# 3. print each lead: employees (right-aligned in 6 columns, thousands separators), level, company\nfor lead in leads:\n    level = quick_screen(lead)\n    print(f\"{int(lead['employees']):>6,}  {level}  {lead['company']}\")\n"
      },
      "checks": [
        {
          "zh": "用 `csv.DictReader(io.StringIO(TEXT))` 读数据",
          "en": "Reads with `csv.DictReader(io.StringIO(TEXT))`",
          "re": "csv\\.DictReader\\(\\s*io\\.StringIO\\(\\s*TEXT\\s*\\)\\s*\\)"
        },
        {
          "zh": "定义了 `quick_screen(lead)`",
          "en": "Defines `quick_screen(lead)`",
          "re": "def\\s+quick_screen\\s*\\(\\s*lead\\s*\\)"
        },
        {
          "zh": "把员工数用 `int(...)` 转成整数",
          "en": "Converts employees with `int(...)`",
          "re": "int\\(\\s*lead\\[\\s*[\"']employees[\"']\\s*\\]\\s*\\)"
        },
        {
          "zh": "用 `in DECISION_MAKERS` 判断职位",
          "en": "Checks the position with `in DECISION_MAKERS`",
          "re": "in\\s+DECISION_MAKERS"
        },
        {
          "zh": "打印时用了右对齐加千位逗号的格式 `:>6,`",
          "en": "Prints with the right-aligned, comma format `:>6,`",
          "re": ":>6,\\}"
        }
      ]
    },
    {
      "title": {
        "zh": "手写：两个销售智能体的 Crew",
        "en": "Write it: a crew of two sales agents"
      },
      "task": {
        "zh": "按 starter 的注释写出视频里的结构：\n- 两个 Agent：`sales_rep`（销售代表，做客户画像、判断意向）和 `lead_sales_rep`（首席销售代表，写个性化邮件），都写 `role`、`goal`、`backstory`、`tools`、`llm`\n- 两个 Task：`profiling_task`（描述里用 `{company}`、`{contact}`、`{position}`）和 `outreach_task`，都写 `expected_output` 和 `agent`\n- 用 `Crew` 组队，`kickoff(inputs=lead)` 运行，打印 `result.raw`\n\n写完复制到 `practice` 文件夹，**在这个文件夹里**用 `.venv-crewai` 运行（工具只能读当前文件夹里面的资料）。",
        "en": "Following the starter's comments, write the structure from the video:\n- two Agents: `sales_rep` (sales representative: profiles the lead and rates its intent) and `lead_sales_rep` (lead sales representative: writes the personalised email), each with `role`, `goal`, `backstory`, `tools` and `llm`\n- two Tasks: `profiling_task` (using `{company}`, `{contact}` and `{position}` in its description) and `outreach_task`, each with `expected_output` and `agent`\n- form a `Crew`, run `kickoff(inputs=lead)` and print `result.raw`\n\nThen copy it into the `practice` folder and run it with `.venv-crewai` **from inside that folder** (the tools can only read material inside the current folder)."
      },
      "starter": {
        "zh": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import LLM, Agent, Crew, Task\nfrom crewai_tools import DirectoryReadTool, FileReadTool\nfrom llm import API_KEY, BASE_URL, MODEL\n\nllm = LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY)\ntools = [DirectoryReadTool(directory=\"data/l14_research\"), FileReadTool(base_dir=\"data/l14_research\")]\nlead = {\"company\": \"云帆物流\", \"contact\": \"陈静\", \"position\": \"CEO\"}\n\n# 1. sales_rep：销售代表（role、goal、backstory、tools、llm）\n\n# 2. lead_sales_rep：首席销售代表\n\n# 3. profiling_task：分析 {company}，联系人 {contact}（{position}），输出客户画像报告\n\n# 4. outreach_task：根据画像报告给 {contact} 写邮件\n\n# 5. 组成 Crew，用 kickoff(inputs=lead) 运行，打印 result.raw\n",
        "en": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import LLM, Agent, Crew, Task\nfrom crewai_tools import DirectoryReadTool, FileReadTool\nfrom llm import API_KEY, BASE_URL, MODEL\n\nllm = LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY)\ntools = [DirectoryReadTool(directory=\"data/l14_research\"), FileReadTool(base_dir=\"data/l14_research\")]\nlead = {\"company\": \"云帆物流\", \"contact\": \"陈静\", \"position\": \"CEO\"}\n\n# 1. sales_rep: the sales representative (role, goal, backstory, tools, llm)\n\n# 2. lead_sales_rep: the lead sales representative\n\n# 3. profiling_task: analyse {company}, contact {contact} ({position}); output a lead profile\n\n# 4. outreach_task: write {contact} an email based on the profile\n\n# 5. form the Crew, run kickoff(inputs=lead), print result.raw\n"
      },
      "solution": {
        "zh": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import LLM, Agent, Crew, Task\nfrom crewai_tools import DirectoryReadTool, FileReadTool\nfrom llm import API_KEY, BASE_URL, MODEL\n\nllm = LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY)\ntools = [DirectoryReadTool(directory=\"data/l14_research\"), FileReadTool(base_dir=\"data/l14_research\")]\nlead = {\"company\": \"云帆物流\", \"contact\": \"陈静\", \"position\": \"CEO\"}\n\n# 1. sales_rep：销售代表（role、goal、backstory、tools、llm）\nsales_rep = Agent(\n    role=\"销售代表\",\n    goal=\"分析潜在客户，判断高、中、低意向\",\n    backstory=\"你擅长根据公司规模、行业、职位和最近的动态做客户画像。\",\n    tools=tools,\n    llm=llm,\n)\n\n# 2. lead_sales_rep：首席销售代表\nlead_sales_rep = Agent(\n    role=\"首席销售代表\",\n    goal=\"用个性化、有吸引力的沟通方式培育潜在客户\",\n    backstory=\"你写的邮件总能把我们的产品和对方的目标联系起来。\",\n    tools=tools,\n    llm=llm,\n)\n\n# 3. profiling_task：分析 {company}，联系人 {contact}（{position}），输出客户画像报告\nprofiling_task = Task(\n    description=\"先查看资料文件夹，分析潜在客户「{company}」，联系人是 {contact}（{position}）。\",\n    expected_output=\"一份客户画像报告，最后一行写「意向等级：高/中/低」。\",\n    agent=sales_rep,\n)\n\n# 4. outreach_task：根据画像报告给 {contact} 写邮件\noutreach_task = Task(\n    description=\"根据客户画像报告，给 {contact}（{position}）写一封首次联系的邮件。\",\n    expected_output=\"一封中文邮件草稿：第一行是主题，后面是正文。\",\n    agent=lead_sales_rep,\n)\n\n# 5. 组成 Crew，用 kickoff(inputs=lead) 运行，打印 result.raw\ncrew = Crew(agents=[sales_rep, lead_sales_rep], tasks=[profiling_task, outreach_task])\nresult = crew.kickoff(inputs=lead)\nprint(result.raw)\n",
        "en": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import LLM, Agent, Crew, Task\nfrom crewai_tools import DirectoryReadTool, FileReadTool\nfrom llm import API_KEY, BASE_URL, MODEL\n\nllm = LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY)\ntools = [DirectoryReadTool(directory=\"data/l14_research\"), FileReadTool(base_dir=\"data/l14_research\")]\nlead = {\"company\": \"云帆物流\", \"contact\": \"陈静\", \"position\": \"CEO\"}\n\n# 1. sales_rep: the sales representative (role, goal, backstory, tools, llm)\nsales_rep = Agent(\n    role=\"Sales Representative\",\n    goal=\"Analyse leads and rate them high, medium or low intent\",\n    backstory=\"You build lead profiles from company size, industry, position and recent news.\",\n    tools=tools,\n    llm=llm,\n)\n\n# 2. lead_sales_rep: the lead sales representative\nlead_sales_rep = Agent(\n    role=\"Lead Sales Representative\",\n    goal=\"Nurture leads with personalised, engaging communication\",\n    backstory=\"Your emails always tie our product to the other side's goals.\",\n    tools=tools,\n    llm=llm,\n)\n\n# 3. profiling_task: analyse {company}, contact {contact} ({position}); output a lead profile\nprofiling_task = Task(\n    description=\"Look through the research folder, then analyse the lead {company}; the contact is {contact} ({position}).\",\n    expected_output=\"A lead profile whose last line reads 'Intent: high/medium/low'.\",\n    agent=sales_rep,\n)\n\n# 4. outreach_task: write {contact} an email based on the profile\noutreach_task = Task(\n    description=\"Using the lead profile, write a first outreach email to {contact} ({position}).\",\n    expected_output=\"An email draft: the subject on the first line, then the body.\",\n    agent=lead_sales_rep,\n)\n\n# 5. form the Crew, run kickoff(inputs=lead), print result.raw\ncrew = Crew(agents=[sales_rep, lead_sales_rep], tasks=[profiling_task, outreach_task])\nresult = crew.kickoff(inputs=lead)\nprint(result.raw)\n"
      },
      "checks": [
        {
          "zh": "Agent 写了 `role=`",
          "en": "The Agent has `role=`",
          "re": "Agent\\(\\s*role\\s*="
        },
        {
          "zh": "Agent 写了 `backstory=`",
          "en": "The Agent has `backstory=`",
          "re": "backstory\\s*="
        },
        {
          "zh": "任务描述里用了 `{company}` 占位符",
          "en": "A task description uses the `{company}` placeholder",
          "re": "description\\s*=\\s*\"[^\"\\n]*\\{company\\}"
        },
        {
          "zh": "Task 写了 `expected_output=`",
          "en": "The Task has `expected_output=`",
          "re": "expected_output\\s*="
        },
        {
          "zh": "用 `Crew(agents=[...], tasks=[...])` 组队",
          "en": "Forms a crew with `Crew(agents=[...], tasks=[...])`",
          "re": "Crew\\(\\s*agents\\s*=\\s*\\[[^\\]]+\\]\\s*,\\s*tasks\\s*=\\s*\\["
        },
        {
          "zh": "用 `kickoff(inputs=lead)` 运行",
          "en": "Runs with `kickoff(inputs=lead)`",
          "re": "\\.kickoff\\(\\s*inputs\\s*=\\s*lead\\s*\\)"
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "用 `.venv` 运行 CrewAI 代码：报 `ModuleNotFoundError: No module named 'crewai'`。CrewAI 装在单独的 `.venv-crewai` 里。",
      "en": "Running CrewAI code with `.venv`: `ModuleNotFoundError: No module named 'crewai'`. CrewAI lives in the separate `.venv-crewai`."
    },
    {
      "zh": "不在 `practice` 文件夹里运行：`DirectoryReadTool` 会报 `... is outside the allowed directory`（crewai-tools 只允许访问当前文件夹里面的文件），智能体拿不到资料，写出来的画像就没有依据。先 `cd practice` 再运行。",
      "en": "Not running from the `practice` folder: `DirectoryReadTool` reports `... is outside the allowed directory` (crewai-tools only allows access to files inside the current folder), so the agent gets no research material and the profile it writes has nothing to rest on. Run `cd practice` first."
    },
    {
      "zh": "`CREWAI_TRACING_ENABLED`、`CREWAI_STORAGE_DIR` 写在 `import crewai` 之后就不起作用了：要放在导入之前。",
      "en": "Setting `CREWAI_TRACING_ENABLED` or `CREWAI_STORAGE_DIR` after `import crewai` has no effect – set them before the import."
    },
    {
      "zh": "csv 读出来的值都是字符串：`\"2300\" >= 500` 会报 TypeError，先 `int()`。",
      "en": "Values from csv are strings: `\"2300\" >= 500` raises TypeError – use `int()` first."
    },
    {
      "zh": "Windows 上打开中文 CSV 不写 `encoding=\"utf-8\"`，会按系统默认编码读，出现乱码或 `UnicodeDecodeError`。",
      "en": "Opening a Chinese CSV on Windows without `encoding=\"utf-8\"` reads it with the system default encoding: garbled text or `UnicodeDecodeError`."
    },
    {
      "zh": "占位符名字和 `inputs` 的键对不上（比如任务里写 `{company_name}`，字典里是 `company`）：`kickoff` 时会报缺少模板变量的错。",
      "en": "Placeholder names that don't match the `inputs` keys (e.g. `{company_name}` in the task but `company` in the dict): `kickoff` fails with a missing template variable."
    },
    {
      "zh": "想像视频一样联网搜索，加了 `SerperDevTool` 却没有设置 `SERPER_API_KEY`：搜索工具会出错。没有 key 就先用本地资料文件夹。",
      "en": "Adding `SerperDevTool` for web search like the video's, without setting `SERPER_API_KEY`: the search tool fails. Without a key, use the local research folder."
    }
  ],
  "recap": [
    {
      "zh": "场景：表单线索 → 按公司规模、行业、职位、地点判断高/中/低意向 → 定策略跟进。智能体接手画像和写邮件，销售只做后续跟进。",
      "en": "Scenario: form lead → rate high/medium/low intent from size, industry, position and location → follow up with a strategy. Agents take over profiling and the email; sales handles the follow-up."
    },
    {
      "zh": "csv：`list(csv.DictReader(f))` 得到字典的列表，值都是字符串；数字格式 `{n:,}`、`{n:>8,}`、`{x:.1f}`、`{r:.0%}`。",
      "en": "csv: `list(csv.DictReader(f))` gives a list of dicts of strings; number formats `{n:,}`, `{n:>8,}`, `{x:.1f}`, `{r:.0%}`."
    },
    {
      "zh": "CrewAI 智能体 = `Agent(role, goal, backstory, tools, llm)`：用 prompt 定义角色。",
      "en": "A CrewAI agent = `Agent(role, goal, backstory, tools, llm)`: a role defined by prompts."
    },
    {
      "zh": "任务 = `Task(description, expected_output, agent)`；`{占位符}` 在 `kickoff(inputs=...)` 时填入；默认按顺序执行，后面的任务能用到前面任务的结果。",
      "en": "A task = `Task(description, expected_output, agent)`; `{placeholders}` are filled at `kickoff(inputs=...)`; tasks run in order and later ones get earlier results."
    },
    {
      "zh": "团队 = `Crew(agents=[...], tasks=[...])`，`result.raw` 是最后一个任务的结果，`某个任务.output.raw` 是那个任务的结果。",
      "en": "A team = `Crew(agents=[...], tasks=[...])`; `result.raw` is the last task's result and `some_task.output.raw` that task's own result."
    },
    {
      "zh": "和对话产品的区别：结果来自「先检索、再加工」的一系列步骤，而不是一问一答。",
      "en": "Unlike a chat product, the result comes from a series of steps – research, then write – rather than one question, one answer."
    }
  ],
  "files": [
    {
      "path": "practice/l14_leads_todo.py",
      "zh": "练习：补全读 CSV、规则初筛、两个 Agent、两个任务和 Crew（有 TODO 提示；先用 `--screen` 测试不调用模型的部分）。",
      "en": "Exercise: complete reading the CSV, the rule-based screening, the two agents, the two tasks and the Crew (with TODO hints; test the model-free part with `--screen` first)."
    },
    {
      "path": "practice/l14_leads_solution.py",
      "zh": "参考答案（`.venv-crewai`）：两个销售 Agent 接力，结果存到 `data/l14_output/<公司名>.md`；`--screen` 只打印规则初筛。已用真实 DeepSeek 跑通（第 4 条线索）。",
      "en": "Solution (`.venv-crewai`): two sales agents in relay, saving to `data/l14_output/<company>.md`; `--screen` prints only the rule-based screening. Tested with the real DeepSeek API (lead 4)."
    },
    {
      "path": "practice/data/l14_leads.csv",
      "zh": "表单线索：4 家虚构公司（规模、行业、联系人、职位、城市、留言）。",
      "en": "Form leads: 4 made-up companies (size, industry, contact, position, city, message)."
    },
    {
      "path": "practice/data/l14_research",
      "zh": "代替联网搜索的资料文件夹：每家公司的公开资料摘要 + 我们的产品介绍（都是虚构的）。",
      "en": "The research folder standing in for web search: a public-information summary per company + our product description (all made up)."
    }
  ]
});
