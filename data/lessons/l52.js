COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
 "id": "l52",
 "priority": "important",
 "handwrite": true,
 "studyMinutes": 45,
 "source": "subtitle",
 "summary": {
  "zh": "在 51 节的项目上再做一个「技术研究员」案例：研究员分析某个领域的最新技术趋势，报告撰写者把分析写成报告，再**调用一个自己写的外部工具**，把报告存成本地 PDF。视频相对上一集只改了两处：模型先在外面创建好，通过 crew 类的 `__init__` 交给 Agent；撰写者拿到一个用 `@tool` 写的「存 PDF」工具。本节用 DeepSeek 和 CrewAI 1.15 重做这个案例，重点讲清楚：工具的描述为什么最重要，为什么要先单独测试工具。",
  "en": "Building on the project from lesson 51, this lesson adds a “tech researcher” case: a researcher analyses the latest technology trends in a field, and a report writer turns the analysis into a report and then **calls an external tool you write yourself** to save the report as a local PDF. Compared with the previous episode, the video changes only two things: the model is created outside and handed to the agents through the crew class's `__init__`, and the writer gets a “save as PDF” tool written with `@tool`. This lesson redoes the case with DeepSeek and CrewAI 1.15 and focuses on two points: why the tool's description matters most, and why you should test a tool on its own first."
 },
 "goals": [
  {
   "zh": "说出这个案例里两个 Agent、两个 Task 各做什么，以及撰写者为什么需要一个工具",
   "en": "Say what each of the case's two agents and two tasks does, and why the writer needs a tool"
  },
  {
   "zh": "用 `@tool` 写一个自定义工具（工具名、文档字符串、类型提示），并用 `.run()` 单独测试",
   "en": "Write a custom tool with `@tool` (tool name, docstring, type hints) and test it on its own with `.run()`"
  },
  {
   "zh": "说清楚 Agent 根据什么决定调用哪个工具、参数怎么填",
   "en": "Explain what an agent goes on when it decides which tool to call and how to fill in the arguments"
  },
  {
   "zh": "让 crew 类通过 `__init__` 接收模型，用 `llm=self.llm` 和 `tools=[...]` 配置 Agent",
   "en": "Make the crew class receive the model through `__init__`, and configure the agents with `llm=self.llm` and `tools=[...]`"
  },
  {
   "zh": "读懂运行日志里的工具调用，算出一次运行要调用几次模型",
   "en": "Read the tool calls in the run log and work out how many model calls one run makes"
  }
 ],
 "blocks": [
  {
   "t": "h",
   "zh": "一、这一集讲什么",
   "en": "1. What this episode covers"
  },
  {
   "t": "video",
   "zh": "视频的内容和顺序（点时间可以直接跳到那一段）：\n- [▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=0) 项目仓库的组织方式（每个文件夹是一个案例），以及这一集的案例：两个 Agent 协作写技术趋势报告，最后调用外部工具存成 PDF\n- [▶ 00:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=31) 两个 Agent：高级技术研究员、技术趋势报告撰写者；[▶ 01:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=93) 两个 Task：研究任务、写报告任务\n- [▶ 02:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=156) 准备工作：开发环境和三种接模型的方式，都请回看上一集（本课程的 51 节）\n- [▶ 04:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=248) 下载这一集的案例文件夹，放进上一集建好的项目；[▶ 05:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=354) 安装依赖，看目录结构\n- [▶ 07:28](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=448) 配置模型和端口，[▶ 08:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=510) 启动服务、用 apitest 发请求（主题「人工智能」），[▶ 10:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=635) 对着日志看两个 Agent 怎么协作、工具怎么被调用，[▶ 12:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=726) 打开生成的 PDF\n- [▶ 12:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=757) 代码讲解：main 脚本的两处改动；[▶ 15:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=949) crew.py 的两处改动（接收模型、使用工具）；[▶ 17:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=1042) 自定义工具怎么写\n- [▶ 18:56](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=1136) 为什么把 YAML 和代码分开，[▶ 19:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=1198) 几个模型的对比\n\n模型：视频演示用的是通过代理访问的 GPT-4o-mini；老师说 qwen-max 和 Ollama 本地模型也跑过，但没有演示。本课程统一用 DeepSeek（`practice/llm.py`）。",
   "en": "The video's contents, in order (click a time to jump there):\n- [▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=0) How the project repository is organised (one folder per case), and this episode's case: two agents work together on a technology-trends report, then call an external tool to save it as a PDF\n- [▶ 00:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=31) The two agents: a senior technology researcher and a tech-trends report writer; [▶ 01:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=93) the two tasks: a research task and a report-writing task\n- [▶ 02:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=156) Preparation: for the development environment and the three ways to reach a model, see the previous episode (lesson 51 of this course)\n- [▶ 04:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=248) Download this episode's case folder into the project built in the previous episode; [▶ 05:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=354) install the dependencies and look at the folder structure\n- [▶ 07:28](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=448) Configure the model and the port, [▶ 08:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=510) start the server and send a request with apitest (topic “AI”), [▶ 10:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=635) follow the log to see how the two agents cooperate and how the tool gets called, [▶ 12:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=726) open the generated PDF\n- [▶ 12:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=757) Code walkthrough: the two changes in the main script; [▶ 15:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=949) the two changes in crew.py (receiving the model, using the tool); [▶ 17:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=1042) how to write a custom tool\n- [▶ 18:56](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=1136) Why the YAML is kept apart from the code, [▶ 19:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=1198) a comparison of several models\n\nModels: the video's demo uses GPT-4o-mini through a proxy; the instructor says he has also run it on qwen-max and on local Ollama models, but doesn't show them. This course uses DeepSeek throughout (`practice/llm.py`)."
  },
  {
   "t": "warn",
   "zh": "CrewAI 的练习都要用 `..\\.venv-crewai\\Scripts\\python.exe` 运行（51 节讲过原因），用 `.venv` 会报 `No module named 'crewai'`。",
   "en": "Run every CrewAI exercise with `..\\.venv-crewai\\Scripts\\python.exe` (lesson 51 explains why); with `.venv` you get `No module named 'crewai'`."
  },
  {
   "t": "h",
   "zh": "二、案例：研究员 + 报告撰写者",
   "en": "2. The case: researcher + report writer"
  },
  {
   "t": "p",
   "zh": "[▶ 00:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=31) 这次的 crew 还是两个 Agent、两个 Task，按顺序执行，和 51 节一样。新东西在最后一步：报告要**存成本地的 PDF 文件**，这件事交给撰写者，由它调用一个外部工具完成。\n\n| | 研究员 `researcher` | 报告撰写者 `reporting_writer` |\n|---|---|---|\n| 角色 | {topic} 高级技术研究员 | {topic} 技术趋势报告撰写者 |\n| 目标 | 研究这个领域的最新技术趋势，做详细分析 | 根据研究员的分析，写一份全面、好懂又有深度的趋势报告 |\n| 背景故事 | 这个领域的技术专家，擅长挖掘最新动态并讲清楚 | 擅长写技术文章，能把复杂的概念讲得通俗 |\n| 任务 | `research_task`：分析最新趋势的优缺点和影响，交出 **5 个要点** | `reporting_task`：写成结构清晰的趋势报告，再**调用工具存成 PDF** |\n| 工具 | 无 | `save_report`（自己写的） |\n\nAgent 和 Task 的文字还是放在两个 YAML 文件里（中文，按视频的意思重新写过）。下面是任务文件：",
   "en": "[▶ 00:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=31) The crew again has two agents and two tasks that run in order, just like lesson 51. What's new is the last step: the report has to be **saved as a local PDF file**, and that job goes to the writer, which does it by calling an external tool.\n\n| | Researcher `researcher` | Report writer `reporting_writer` |\n|---|---|---|\n| Role | {topic} Senior Technology Researcher | {topic} Tech Trends Report Writer |\n| Goal | Research the field's latest technology trends and analyse them in detail | From the researcher's analysis, write a thorough trends report that is easy to read yet insightful |\n| Backstory | A technology expert in the field, good at digging up the latest developments and explaining them clearly | A skilled technical writer who makes complex concepts easy to grasp |\n| Task | `research_task`: analyse the pros, cons and impact of the latest trends, deliver **5 key points** | `reporting_task`: write a well-structured trends report, then **call the tool to save it as a PDF** |\n| Tools | None | `save_report` (written by us) |\n\nThe agent and task texts again live in two YAML files (the practice files are in Chinese, reworded from the video; shown here in English). Here is the task file:"
  },
  {
   "t": "code",
   "file": "practice/data/l52_tasks.yaml",
   "lang": "yaml",
   "code": {
    "zh": "# practice/data/l52_tasks.yaml\nresearch_task:\n  description: >\n    研究 {topic} 的最新技术趋势，关注最新的技术进展，评估它们的优点和缺点，并给出详细的分析。\n    内容至少包括三部分：当前的趋势技术、这些技术的利弊、可能带来的影响。\n  expected_output: >\n    一个包含 5 个要点的中文列表，介绍 {topic} 的前沿动态和最新技术发展趋势，每点不超过 100 字。\n  agent: researcher\n\nreporting_task:\n  description: >\n    根据研究员提供的技术分析，写一份「{topic} 技术趋势报告」：结构清晰、有见解，\n    包括当前趋势、技术利弊、潜在影响和结论，适合行业读者阅读。\n    写完后必须调用 save_report 工具把报告保存成 PDF，filename 用「{topic}技术趋势报告」。\n  expected_output: >\n    save_report 工具返回的保存提示（告诉用户去哪里查看报告），不要再重复报告全文。\n  agent: reporting_writer",
    "en": "# practice/data/l52_tasks.yaml\nresearch_task:\n  description: >\n    Research the latest technology trends in {topic}, focusing on recent technical advances; assess their strengths and weaknesses and give a detailed analysis.\n    Cover at least three parts: the current trending technologies, their pros and cons, and their likely impact.\n  expected_output: >\n    A list of 5 key points in English on the frontier developments and latest technology trends in {topic}, each point at most 100 words.\n  agent: researcher\n\nreporting_task:\n  description: >\n    Based on the researcher's technical analysis, write a \"{topic} Tech Trends Report\": well structured and insightful,\n    covering current trends, pros and cons, potential impact and a conclusion, for industry readers.\n    When it is finished you must call the save_report tool to save the report as a PDF, with filename \"{topic} Tech Trends Report\".\n  expected_output: >\n    The confirmation returned by the save_report tool (telling the user where to find the report); do not repeat the full report.\n  agent: reporting_writer"
   },
   "note": {
    "zh": "撰写任务里写明「必须调用 save_report 工具」并给出文件名，模型会更稳定地去调用它；`expected_output` 只要保存提示，是为了不让它把整篇报告再输出一遍（见第四部分）。",
    "en": "The writing task says outright “you must call the save_report tool” and gives the file name, which makes the model call it more reliably; `expected_output` asks only for the confirmation so that the model doesn't output the whole report again (see part 4)."
   }
  },
  {
   "t": "video",
   "zh": "[▶ 11:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=665) 视频里研究员正好交了 5 条，老师解释：这是因为任务描述里已经规定了只要 5 点。上一集用 qwen-max 时，要 10 条却给了 15 条。`expected_output` 写得越具体（几条、什么格式、什么语言），结果越可控。",
   "en": "[▶ 11:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=665) In the video the researcher delivers exactly 5 points, and the instructor explains why: the task description already asks for just 5. In the previous episode, with qwen-max, it asked for 10 and got 15. The more specific `expected_output` is (how many items, what format, what language), the more predictable the result."
  },
  {
   "t": "check",
   "q": {
    "zh": "撰写者为什么需要一个工具才能把报告存成 PDF？",
    "en": "Why does the writer need a tool to save the report as a PDF?"
   },
   "options": [
    {
     "zh": "工具能让模型写出更好的报告",
     "en": "A tool makes the model write a better report"
    },
    {
     "zh": "模型只会生成文字，写文件这种事要靠在你电脑上运行的函数来做",
     "en": "The model only generates text; writing a file takes a function running on your computer"
    },
    {
     "zh": "CrewAI 规定每个 Agent 都必须有工具",
     "en": "CrewAI requires every agent to have a tool"
    },
    {
     "zh": "没有工具，模型就读不到研究员的要点",
     "en": "Without a tool the model can't read the researcher's points"
    }
   ],
   "answer": 1,
   "explain": {
    "zh": "模型本身只能生成文字。它可以「请求」调用某个工具，真正写文件的是 CrewAI 在你电脑上执行的函数（05 节的工具调用也是这个道理）。研究员的要点是顺序流程自动传过去的，和工具无关。",
    "en": "The model itself can only generate text. It can “request” a tool call, but the file is written by a function that CrewAI runs on your computer (the same idea as the tool calls in lesson 05). The researcher's points are passed on automatically by the sequential process and have nothing to do with tools."
   }
  },
  {
   "t": "h",
   "zh": "三、项目结构和运行",
   "en": "3. Project structure and running it"
  },
  {
   "t": "p",
   "zh": "[▶ 05:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=354) 这一集的案例文件夹放在上一集的项目里，依赖比上一集多了一个包（应该就是生成 PDF 用的库）。[▶ 06:24](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=384) 目录结构和本课对应的文件：\n\n| 视频 | 作用 | 本课 |\n|---|---|---|\n| `config/agents.yaml`、`config/tasks.yaml` | Agent、Task 的文字 | `practice/data/l52_agents.yaml`、`l52_tasks.yaml` |\n| `crew.py` | 组装 Agent、Task、Crew 的类 | `l52_research_crew.py` |\n| `tools/custom_tool.py` | 自定义工具 | `l52_tools_solution.py` |\n| unit test 文件夹 | 单独测试工具 | 直接运行 `l52_tools_solution.py` |\n| `output/` | 生成的 PDF 放这里（没有就新建一个） | `practice/output/` |\n| main 脚本 | FastAPI 服务，8012 端口 | `l52_api.py` |\n| apiTest 脚本 | 发 POST 请求 | `l51_api_client.py`（51 节写的客户端） |\n| 中文字体文件 | 让 PDF 能显示中文 | 不需要（见下面的补充） |",
   "en": "[▶ 05:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=354) This episode's case folder goes inside the previous episode's project, and it needs one more package than before (presumably the library that generates the PDF). [▶ 06:24](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=384) The folder structure and the matching files in this lesson:\n\n| Video | Purpose | This lesson |\n|---|---|---|\n| `config/agents.yaml`, `config/tasks.yaml` | Agent and task texts | `practice/data/l52_agents.yaml`, `l52_tasks.yaml` |\n| `crew.py` | The class that assembles agents, tasks and the crew | `l52_research_crew.py` |\n| `tools/custom_tool.py` | The custom tool | `l52_tools_solution.py` |\n| unit test folder | Tests the tool on its own | Just run `l52_tools_solution.py` |\n| `output/` | Where the generated PDFs go (create it if it's missing) | `practice/output/` |\n| main script | FastAPI server on port 8012 | `l52_api.py` |\n| apiTest script | Sends the POST request | `l51_api_client.py` (the client from lesson 51) |\n| Chinese font file | Lets the PDF display Chinese | Not needed (see the note below) |"
  },
  {
   "t": "note",
   "zh": "视频的工具用一个 PDF 库加上单独下载的中文字体来生成 PDF，不加字体中文会变成乱码。`.venv-crewai` 里已经有 PyMuPDF（crewai-tools 自带的依赖），它内置了简体中文字体，所以本课的 `practice/l52_pdf.py` 不用另外下载字体，还会顺手去掉报告里的 `#`、`**` 这类 Markdown 记号。这个文件只是「PDF 的细节」，不需要会写，知道 `text_to_pdf(文字, 路径)` 能把文字存成 PDF 就行。",
   "en": "The video's tool builds the PDF with a PDF library plus a separately downloaded Chinese font; without the font, Chinese text comes out garbled. `.venv-crewai` already has PyMuPDF (a dependency of crewai-tools), which has a built-in Simplified Chinese font, so this lesson's `practice/l52_pdf.py` needs no extra font download, and it also strips Markdown marks such as `#` and `**` from the report. This file is just “PDF details” – you don't need to be able to write it; just know that `text_to_pdf(text, path)` saves text as a PDF."
  },
  {
   "t": "code",
   "file": "PowerShell",
   "lang": "powershell",
   "code": {
    "zh": "cd practice\n# 1. 先单独测试工具（不调模型、不花钱），output 里会多出几个测试 PDF\n& ..\\.venv-crewai\\Scripts\\python.exe l52_tools_solution.py\n\n# 2. 直接运行整个 crew（约 3 次模型调用，1–2 分钟）\n& ..\\.venv-crewai\\Scripts\\python.exe l52_research_crew.py 人工智能\n\n# 3. 或者像视频那样：终端 1 启动服务（Ctrl+C 停止）……\n& ..\\.venv-crewai\\Scripts\\python.exe l52_api.py\n# ……终端 2 发请求（51 节写的客户端）\n& ..\\.venv-crewai\\Scripts\\python.exe l51_api_client.py 人工智能 --openai",
    "en": "cd practice\n# 1. First test the tool on its own (no model, no cost); a few test PDFs appear in output\n& ..\\.venv-crewai\\Scripts\\python.exe l52_tools_solution.py\n\n# 2. Run the whole crew directly (about 3 model calls, 1–2 minutes)\n& ..\\.venv-crewai\\Scripts\\python.exe l52_research_crew.py AI\n\n# 3. Or do it like the video: terminal 1 starts the server (Ctrl+C to stop)...\n& ..\\.venv-crewai\\Scripts\\python.exe l52_api.py\n# ...terminal 2 sends a request (the client from lesson 51)\n& ..\\.venv-crewai\\Scripts\\python.exe l51_api_client.py AI --openai"
   }
  },
  {
   "t": "video",
   "zh": "[▶ 07:28](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=448) 启动前，老师先在 main 脚本里配好模型（三类模型各有一套地址、key、模型名，用一个标志位选，这次选的是 OpenAI 的 GPT-4o-mini）和端口 8012。[▶ 08:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=510) 先启动服务，再在另一个终端运行 apitest，传入的主题是「人工智能」。[▶ 09:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=572) 第一次请求报了错，老师说是他自己网络的问题，和代码无关，重启服务再发一次就好了。",
   "en": "[▶ 07:28](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=448) Before starting, the instructor configures the model in the main script (each of the three kinds of model has its own address, key and model name, picked with a flag; this time he picks OpenAI's GPT-4o-mini) and port 8012. [▶ 08:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=510) He starts the server first, then runs apitest in another terminal with the topic “AI”. [▶ 09:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=572) The first request fails; the instructor says it was a problem with his own network, not the code, and after restarting the server the request goes through."
  },
  {
   "t": "h",
   "zh": "四、看懂运行过程",
   "en": "4. Understanding the run"
  },
  {
   "t": "p",
   "zh": "[▶ 10:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=635) 跑完以后，老师对着日志把过程讲了一遍。本课用 DeepSeek 跑 `l52_research_crew.py`（主题「人工智能」），日志的顺序和视频一样：\n1. 🤖 Agent Started：`人工智能 高级技术研究员`，任务里的 `{topic}` 已经换成了「人工智能」\n2. ✅ Agent Final Answer：5 个趋势要点（这次是多模态大模型、AI 智能体、推理模型、端侧小模型、安全治理），每条都写了优点、缺点和影响\n3. 🤖 Agent Started：`人工智能 技术趋势报告撰写者`，拿着上面的 5 点写报告\n4. 🔧 Tool Execution Started：`Tool: save_report`，`Args` 里是模型填好的 `text`（整篇报告）和 `filename`\n5. ✅ Tool Execution Completed：`Output: 报告已保存，请前往 output\\人工智能技术趋势报告.pdf 查看报告。`\n6. ✅ Agent Final Answer：撰写者的最终回答就是这句保存提示\n\n第 4、5 步就是 05 节讲过的工具调用：模型只是**发出请求**（用哪个工具、参数填什么），真正写文件的是 CrewAI 在你电脑上执行的函数；函数的返回值再交回给模型，模型据此写出最终回答。[▶ 12:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=726) 最后到 `output` 文件夹打开 PDF：标题、当前趋势、利弊、潜在影响、结论，和视频里看到的结构一样。",
   "en": "[▶ 10:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=635) After the run, the instructor walks through the log. This lesson runs `l52_research_crew.py` with DeepSeek (topic “AI”), and the log comes in the same order as in the video:\n1. 🤖 Agent Started: `AI Senior Technology Researcher` – the `{topic}` in the task has already been replaced with “AI”\n2. ✅ Agent Final Answer: 5 trend points (this time multimodal large models, AI agents, reasoning models, small on-device models, and safety and governance), each with its strengths, weaknesses and impact\n3. 🤖 Agent Started: `AI Tech Trends Report Writer` writes the report from those 5 points\n4. 🔧 Tool Execution Started: `Tool: save_report`, with `Args` holding the `text` (the whole report) and the `filename` that the model filled in\n5. ✅ Tool Execution Completed: `Output: Report saved. Open output\\AI_Tech_Trends_Report.pdf to view the report.`\n6. ✅ Agent Final Answer: the writer's final answer is just that confirmation\n\nSteps 4 and 5 are a tool call, as covered in lesson 05: the model only **sends a request** (which tool, which arguments); the file is written by a function that CrewAI runs on your computer, and the function's return value goes back to the model, which writes its final answer from it. [▶ 12:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=726) Finally, open the PDF in the `output` folder: title, current trends, pros and cons, potential impact, conclusion – the same structure as in the video."
  },
  {
   "t": "tip",
   "zh": "这次运行一共调用了 3 次模型：研究员 1 次（不用工具，直接回答）；撰写者 2 次（第 1 次发出工具调用，第 2 次看到工具结果后给出最终回答）。撰写者的最终回答只有一句保存提示，是因为 `expected_output` 里写了「不要重复报告全文」；不写这一句，它常常把整篇报告再输出一遍，白白多花 token。如果想让工具的返回值**直接**成为最终回答、连第 2 次调用都省掉，可以写 `@tool(\"save_report\", result_as_answer=True)`。",
   "en": "This run calls the model 3 times in total: once for the researcher (no tool, it answers directly) and twice for the writer (the 1st call issues the tool call, the 2nd sees the tool's result and gives the final answer). The writer's final answer is only a one-line confirmation because `expected_output` says “do not repeat the full report”; without that line it often outputs the whole report again, wasting tokens. If you want the tool's return value to become the final answer **directly**, saving even the 2nd call, write `@tool(\"save_report\", result_as_answer=True)`."
  },
  {
   "t": "check",
   "q": {
    "zh": "撰写者先调用 `save_report`，再给出最终回答。撰写者这一步一共要调用几次模型？",
    "en": "The writer first calls `save_report` and then gives its final answer. How many model calls does the writer's step take in total?"
   },
   "options": [
    {
     "zh": "1 次：工具调用和最终回答在同一次请求里完成",
     "en": "1: the tool call and the final answer happen in the same request"
    },
    {
     "zh": "0 次：工具不需要模型",
     "en": "0: tools don't need the model"
    },
    {
     "zh": "2 次：一次发出工具调用，一次看到工具结果后写最终回答",
     "en": "2: one to issue the tool call, one to write the final answer after seeing the tool's result"
    },
    {
     "zh": "要看报告有多长",
     "en": "It depends on how long the report is"
    }
   ],
   "answer": 2,
   "explain": {
    "zh": "模型发出工具调用后，要等 CrewAI 执行完函数、把结果交回，才能写最终回答，所以是两次请求。`result_as_answer=True` 可以省掉第二次。",
    "en": "After the model issues a tool call, it has to wait for CrewAI to run the function and hand back the result before it can write the final answer – so that's two requests. `result_as_answer=True` saves the second one."
   }
  },
  {
   "t": "h",
   "zh": "五、改动一：模型在外面创建，交给 crew 类",
   "en": "5. Change 1: create the model outside and hand it to the crew class"
  },
  {
   "t": "p",
   "zh": "[▶ 12:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=757) 上一集的 main 脚本照官方模板的做法，把地址、key、模型名写进环境变量，Agent 自己去读。[▶ 13:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=791) 这一集改成**先创建一个模型对象，再把它交给 crew**。老师说这样做的好处是能自己设模型的参数，比如把温度改成 0.7 或 1，看看输出有什么变化。\n\n视频用的是 LangChain 的 `ChatOpenAI` 来创建模型。CrewAI 1.x 不需要 LangChain：它自带的 `LLM` 类同样能设地址、key、模型名和温度（`.venv-crewai` 里也没有装 langchain-openai）。",
   "en": "[▶ 12:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=757) The previous episode's main script followed the official template: it wrote the address, key and model name into environment variables, and the agents read them on their own. [▶ 13:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=791) This episode instead **creates a model object first and then hands it to the crew**. The instructor says the benefit is that you can set the model's parameters yourself, for example change the temperature to 0.7 or 1 and see how the output changes.\n\nThe video creates the model with LangChain's `ChatOpenAI`. CrewAI 1.x doesn't need LangChain: its built-in `LLM` class can set the address, key, model name and temperature just the same (and langchain-openai isn't installed in `.venv-crewai` anyway)."
  },
  {
   "t": "code",
   "file": {
    "zh": "视频的写法 vs 现在的写法",
    "en": "The video's way vs today's way"
   },
   "code": {
    "zh": "# 视频（CrewAI 0.x）：用 LangChain 的模型类创建模型\n# from langchain_openai import ChatOpenAI\n# model = ChatOpenAI(base_url=..., api_key=..., model=\"gpt-4o-mini\", temperature=0.7)\n\n# 现在（CrewAI 1.15）：用 CrewAI 自带的 LLM 类，能设的参数一样\nfrom crewai import LLM\nfrom llm import API_KEY, BASE_URL, MODEL\n\n\ndef make_llm():\n    return LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY, temperature=0.7)",
    "en": "# The video (CrewAI 0.x): create the model with LangChain's model class\n# from langchain_openai import ChatOpenAI\n# model = ChatOpenAI(base_url=..., api_key=..., model=\"gpt-4o-mini\", temperature=0.7)\n\n# Today (CrewAI 1.15): CrewAI's built-in LLM class takes the same parameters\nfrom crewai import LLM\nfrom llm import API_KEY, BASE_URL, MODEL\n\n\ndef make_llm():\n    return LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY, temperature=0.7)"
   }
  },
  {
   "t": "note",
   "zh": "`deepseek-flash` 默认开着思考模式，温度对它基本不起作用。想看出温度的效果，要同时关掉思考：`LLM(..., temperature=0.7, extra_body={\"thinking\": {\"type\": \"disabled\"}})`。",
   "en": "`deepseek-flash` has thinking mode on by default, and temperature has little effect on it. To see what temperature does, turn thinking off as well: `LLM(..., temperature=0.7, extra_body={\"thinking\": {\"type\": \"disabled\"}})`."
  },
  {
   "t": "p",
   "zh": "[▶ 15:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=949) crew 类那边加了一个 `__init__`：模型作为参数传进来，存到 `self` 上，[▶ 16:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=980) 每个 `@agent` 方法里用 `llm=self.llm` 交给 Agent。老师顺带提到，这样也可以给不同的 Agent 配不同的模型。下面是 `l52_research_crew.py` 的主体，第二处改动（`tools=[...]`）第六部分再讲：",
   "en": "[▶ 15:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=949) On the crew class side, an `__init__` is added: the model comes in as a parameter and is stored on `self`, [▶ 16:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=980) and each `@agent` method hands it to its agent with `llm=self.llm`. The instructor mentions in passing that this also lets you give different agents different models. Below is the body of `l52_research_crew.py`; the second change (`tools=[...]`) is covered in part 6:"
  },
  {
   "t": "code",
   "file": {
    "zh": "practice/l52_research_crew.py（整理）",
    "en": "practice/l52_research_crew.py (condensed)"
   },
   "code": {
    "zh": "from crewai import LLM, Agent, Crew, Process, Task\nfrom crewai.project import CrewBase, agent, crew, task\n\nfrom l52_tools_solution import save_report      # 视频：从 tools 文件夹的 custom_tool.py 导入\nfrom llm import API_KEY, BASE_URL, MODEL\n\n\n@CrewBase\nclass TechResearchCrew:\n    agents_config = \"data/l52_agents.yaml\"\n    tasks_config = \"data/l52_tasks.yaml\"\n\n    def __init__(self, llm):                    # 改动一：模型从外面传进来\n        self.llm = llm\n\n    @agent\n    def researcher(self) -> Agent:\n        return Agent(config=self.agents_config[\"researcher\"], llm=self.llm, verbose=True)\n\n    @agent\n    def reporting_writer(self) -> Agent:\n        return Agent(\n            config=self.agents_config[\"reporting_writer\"],\n            llm=self.llm,                       # 也可以给这个 Agent 换一个模型\n            tools=[save_report],                # 改动二：只有撰写者拿到这个工具\n            verbose=True,\n        )\n\n    @task\n    def research_task(self) -> Task:\n        return Task(config=self.tasks_config[\"research_task\"])\n\n    @task\n    def reporting_task(self) -> Task:\n        return Task(config=self.tasks_config[\"reporting_task\"])\n\n    @crew\n    def crew(self) -> Crew:\n        return Crew(agents=self.agents, tasks=self.tasks, process=Process.sequential, verbose=True)\n\n\nllm = LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY, temperature=0.7)\nresult = TechResearchCrew(llm).crew().kickoff(inputs={\"topic\": \"人工智能\"})\nprint(result.raw)",
    "en": "from crewai import LLM, Agent, Crew, Process, Task\nfrom crewai.project import CrewBase, agent, crew, task\n\nfrom l52_tools_solution import save_report      # video: imported from custom_tool.py in the tools folder\nfrom llm import API_KEY, BASE_URL, MODEL\n\n\n@CrewBase\nclass TechResearchCrew:\n    agents_config = \"data/l52_agents.yaml\"\n    tasks_config = \"data/l52_tasks.yaml\"\n\n    def __init__(self, llm):                    # change 1: the model is passed in from outside\n        self.llm = llm\n\n    @agent\n    def researcher(self) -> Agent:\n        return Agent(config=self.agents_config[\"researcher\"], llm=self.llm, verbose=True)\n\n    @agent\n    def reporting_writer(self) -> Agent:\n        return Agent(\n            config=self.agents_config[\"reporting_writer\"],\n            llm=self.llm,                       # you could give this agent a different model\n            tools=[save_report],                # change 2: only the writer gets this tool\n            verbose=True,\n        )\n\n    @task\n    def research_task(self) -> Task:\n        return Task(config=self.tasks_config[\"research_task\"])\n\n    @task\n    def reporting_task(self) -> Task:\n        return Task(config=self.tasks_config[\"reporting_task\"])\n\n    @crew\n    def crew(self) -> Crew:\n        return Crew(agents=self.agents, tasks=self.tasks, process=Process.sequential, verbose=True)\n\n\nllm = LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY, temperature=0.7)\nresult = TechResearchCrew(llm).crew().kickoff(inputs={\"topic\": \"AI\"})\nprint(result.raw)"
   }
  },
  {
   "t": "py",
   "title": {
    "zh": "回顾 08 节：用 __init__ 把外面的对象交给类",
    "en": "Lesson 08 recap: handing an outside object to a class with __init__"
   },
   "zh": "08 节学过：`__init__` 是创建对象时自动调用的方法，括号里的参数在 `类名(...)` 时传入；`self.名字 = 值` 把值存在这个对象身上，同一个对象的其他方法都能用 `self.名字` 取到。crew 类接收模型用的就是这个写法（`@CrewBase` 装饰过的类照样可以写 `__init__`）。\n\n下面用一个假的模型对象模拟一下，不需要 CrewAI，可以直接运行：",
   "en": "Lesson 08 covered this: `__init__` is the method that runs automatically when an object is created, and the arguments in its parentheses are passed in with `ClassName(...)`; `self.name = value` stores a value on the object, and the object's other methods can read it with `self.name`. That is exactly how the crew class receives the model (a class decorated with `@CrewBase` can still have an `__init__`).\n\nBelow, a fake model object simulates it – no CrewAI needed, so you can run it right away:",
   "code": {
    "zh": "class FakeLLM:                          # 假装是一个模型对象，只记住名字和温度\n    def __init__(self, name, temperature):\n        self.name = name\n        self.temperature = temperature\n\n\nclass TechResearchCrew:\n    def __init__(self, llm):            # 创建对象时传进来的参数……\n        self.llm = llm                  # ……存到 self 上，其他方法都能用\n\n    def researcher(self):\n        return f\"研究员用 {self.llm.name}，温度 {self.llm.temperature}\"\n\n    def reporting_writer(self):\n        return f\"撰写者也用 {self.llm.name}\"\n\n\ncrew_a = TechResearchCrew(FakeLLM(\"deepseek-flash\", 0.7))\ncrew_b = TechResearchCrew(FakeLLM(\"deepseek-v4-pro\", 1.0))\nprint(crew_a.researcher())\nprint(crew_a.reporting_writer())\nprint(crew_b.researcher())             # 换一个模型，只要换传进去的对象",
    "en": "class FakeLLM:                          # pretends to be a model object; only remembers a name and a temperature\n    def __init__(self, name, temperature):\n        self.name = name\n        self.temperature = temperature\n\n\nclass TechResearchCrew:\n    def __init__(self, llm):            # the argument passed in when the object is created...\n        self.llm = llm                  # ...is stored on self, so the other methods can use it\n\n    def researcher(self):\n        return f\"The researcher uses {self.llm.name}, temperature {self.llm.temperature}\"\n\n    def reporting_writer(self):\n        return f\"The writer also uses {self.llm.name}\"\n\n\ncrew_a = TechResearchCrew(FakeLLM(\"deepseek-flash\", 0.7))\ncrew_b = TechResearchCrew(FakeLLM(\"deepseek-v4-pro\", 1.0))\nprint(crew_a.researcher())\nprint(crew_a.reporting_writer())\nprint(crew_b.researcher())             # to switch models, just pass in a different object"
   },
   "run": true,
   "note": {
    "zh": "想换模型，只要换传进去的对象，类本身一行都不用改。这就是视频说的「可以自己定义模型的参数」。",
    "en": "To switch models you only change the object you pass in; the class itself doesn't change by a single line. That is what the video means by “you can define the model's parameters yourself”."
   }
  },
  {
   "t": "p",
   "zh": "[▶ 13:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=823) main 脚本的第二处改动：上一集把「运行 crew」单独写成一个 `run()` 函数，这一集直接在接口函数里创建并运行 crew，逻辑没有变。[▶ 14:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=885) 模型对象在 `lifespan` 里（服务启动时）创建一次，每个请求都用它。`l52_api.py` 的主体：",
   "en": "[▶ 13:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=823) The second change in the main script: the previous episode put “run the crew” into a separate `run()` function; this episode creates and runs the crew right inside the endpoint function – the logic is the same. [▶ 14:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=885) The model object is created once in `lifespan` (when the server starts), and every request uses it. The body of `l52_api.py`:"
  },
  {
   "t": "code",
   "file": {
    "zh": "practice/l52_api.py（节选）",
    "en": "practice/l52_api.py (excerpt)"
   },
   "code": {
    "zh": "from l51_api_solution import ChatRequest, chat_response, chat_stream   # 51 节写好的 OpenAI 格式\nfrom l52_research_crew import TechResearchCrew, make_llm\n\nMODELS = {}                             # 改字典里的内容不需要 global（06 节）\n\n\n@asynccontextmanager\nasync def lifespan(app: FastAPI):\n    MODELS[\"llm\"] = make_llm()          # 启动时创建一次模型对象\n    print(\"模型初始化完成，服务启动\")\n    yield\n    print(\"正在关闭\")\n\n\napp = FastAPI(lifespan=lifespan)\n\n\n@app.post(\"/v1/chat/completions\")\nasync def chat_completions(req: ChatRequest):\n    topic = req.messages[-1][\"content\"]                     # 例如「人工智能」\n    crew = TechResearchCrew(MODELS[\"llm\"]).crew()           # 不再写 run()，直接在这里创建 crew\n    result = await crew.kickoff_async(inputs={\"topic\": topic})\n    if req.stream:\n        return chat_stream(result.raw, req.model)\n    return chat_response(result.raw, req.model)",
    "en": "from l51_api_solution import ChatRequest, chat_response, chat_stream   # the OpenAI format written in lesson 51\nfrom l52_research_crew import TechResearchCrew, make_llm\n\nMODELS = {}                             # changing what's inside a dict needs no global (lesson 06)\n\n\n@asynccontextmanager\nasync def lifespan(app: FastAPI):\n    MODELS[\"llm\"] = make_llm()          # create the model object once at startup\n    print(\"Model ready, server starting\")\n    yield\n    print(\"Shutting down\")\n\n\napp = FastAPI(lifespan=lifespan)\n\n\n@app.post(\"/v1/chat/completions\")\nasync def chat_completions(req: ChatRequest):\n    topic = req.messages[-1][\"content\"]                     # e.g. \"AI\"\n    crew = TechResearchCrew(MODELS[\"llm\"]).crew()           # no run() any more: create the crew right here\n    result = await crew.kickoff_async(inputs={\"topic\": topic})\n    if req.stream:\n        return chat_stream(result.raw, req.model)\n    return chat_response(result.raw, req.model)"
   }
  },
  {
   "t": "h",
   "zh": "六、改动二：给撰写者一个自定义工具",
   "en": "6. Change 2: give the writer a custom tool"
  },
  {
   "t": "p",
   "zh": "[▶ 16:51](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=1011) 第二处改动是让 Agent 能调用**外部工具**。视频把工具写在 `tools/custom_tool.py` 里，目前只有一个「把文字存成 PDF」的工具；`crew.py` 把它导入进来，用 `tools=[...]` 交给撰写者（上一部分代码里的 `tools=[save_report]`）。\n\n[▶ 17:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=1072) 工具的写法：在一个普通函数上面加 `@tool(\"工具名\")` 装饰器。老师特别强调：**描述最重要**。Agent 处理任务时看不到函数里的代码，只能靠工具的名字和描述判断「这个工具是做什么的、什么时候该用、参数填什么」。所以描述里要写清楚：工具做什么、每个参数是什么意思、返回什么。`@tool` 从函数上取这三样：\n- 工具名：括号里的字符串\n- 描述：函数的文档字符串（没写文档字符串，装饰时就报 `ValueError: Function must have a docstring`）\n- 参数说明：根据参数的类型提示生成",
   "en": "[▶ 16:51](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=1011) The second change lets an agent call an **external tool**. The video puts its tools in `tools/custom_tool.py`, which for now holds a single “save text as a PDF” tool; `crew.py` imports it and hands it to the writer with `tools=[...]` (the `tools=[save_report]` in the previous part's code).\n\n[▶ 17:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=1072) How to write a tool: put a `@tool(\"tool name\")` decorator on an ordinary function. The instructor stresses that **the description matters most**. While working on a task, the agent can't see the code inside the function; it can only judge from the tool's name and description “what this tool does, when to use it and what to pass as arguments”. So the description should spell out what the tool does, what each parameter means and what it returns. `@tool` takes these three things from the function:\n- Tool name: the string in the parentheses\n- Description: the function's docstring (without a docstring you get `ValueError: Function must have a docstring` as soon as it is decorated)\n- Parameter info: generated from the parameters' type hints"
  },
  {
   "t": "code",
   "file": {
    "zh": "practice/l52_tools_solution.py（节选）",
    "en": "practice/l52_tools_solution.py (excerpt)"
   },
   "code": {
    "zh": "import re\nfrom pathlib import Path\n\nfrom crewai.tools import tool        # 视频（0.x）：from crewai_tools import tool\n\nfrom l52_pdf import text_to_pdf      # PDF 的细节写在 l52_pdf.py 里，不用会写\n\nOUTPUT_DIR = Path(\"output\")          # 相对于运行命令时所在的文件夹\n\n\ndef clean_filename(name: str) -> str:\n    \"\"\"把 Windows 文件名里不允许的字符和空白换成下划线；结果为空时用 report。\"\"\"\n    name = re.sub(r'[\\\\/:*?\"<>|\\s]+', \"_\", name).strip(\"_.\")\n    return name or \"report\"\n\n\n@tool(\"save_report\")                 # 括号里是工具名\ndef save_report(text: str, filename: str) -> str:\n    \"\"\"把一份报告保存成本地 PDF 文件（支持中文）。\n    text：要保存的报告全文。\n    filename：PDF 文件名，不带路径和扩展名，例如「人工智能技术趋势报告」。\n    返回保存状态的提示，告诉用户去哪里查看报告。\"\"\"\n    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)                 # 文件夹不存在就建\n    path = OUTPUT_DIR / f\"{clean_filename(filename)}.pdf\"\n    text_to_pdf(text, path)\n    return f\"报告已保存，请前往 {path} 查看报告。\"",
    "en": "import re\nfrom pathlib import Path\n\nfrom crewai.tools import tool        # video (0.x): from crewai_tools import tool\n\nfrom l52_pdf import text_to_pdf      # the PDF details live in l52_pdf.py; no need to write them yourself\n\nOUTPUT_DIR = Path(\"output\")          # relative to the folder you run the command from\n\n\ndef clean_filename(name: str) -> str:\n    \"\"\"Replace characters Windows forbids in file names, and whitespace, with underscores; use report if nothing is left.\"\"\"\n    name = re.sub(r'[\\\\/:*?\"<>|\\s]+', \"_\", name).strip(\"_.\")\n    return name or \"report\"\n\n\n@tool(\"save_report\")                 # the tool name goes in the parentheses\ndef save_report(text: str, filename: str) -> str:\n    \"\"\"Save a report as a local PDF file (Chinese is supported).\n    text: the full text of the report to save.\n    filename: the PDF file name, without path or extension, e.g. \"AI Tech Trends Report\".\n    Returns a status message telling the user where to find the report.\"\"\"\n    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)                 # create the folder if it doesn't exist\n    path = OUTPUT_DIR / f\"{clean_filename(filename)}.pdf\"\n    text_to_pdf(text, path)\n    return f\"Report saved. Open {path} to view the report.\""
   },
   "note": {
    "zh": "`clean_filename` 是本课加的：文件名是模型填的，要当作「不可信的输入」。它用 `re.sub`（12 节见过）把 Windows 文件名里不允许的字符换成下划线，免得模型给出 `AI/趋势: 2026` 这种名字时报错，或者把文件写到别的文件夹。",
    "en": "`clean_filename` is added in this lesson: the file name is filled in by the model, so treat it as “untrusted input”. It uses `re.sub` (seen in lesson 12) to replace characters Windows forbids in file names with underscores, so a name like `AI/trends: 2026` from the model doesn't cause an error or put the file in another folder."
   }
  },
  {
   "t": "note",
   "zh": "视频（CrewAI 0.x）写的是 `from crewai_tools import tool`。1.x 里 `tool` 移到了 `crewai.tools`，照视频写会报 `ImportError: cannot import name 'tool' from 'crewai_tools'`（本机验证过）。",
   "en": "The video (CrewAI 0.x) writes `from crewai_tools import tool`. In 1.x `tool` moved to `crewai.tools`, so following the video gives `ImportError: cannot import name 'tool' from 'crewai_tools'` (verified on this machine)."
  },
  {
   "t": "p",
   "zh": "[▶ 06:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=415) 视频的项目里专门有一个 unit test 文件夹：工具写好后**先单独运行、测通**，再交给 Agent。这样出了问题能分清是工具坏了还是模型没用好，而且测试工具不花钱。`@tool` 装饰后得到的是一个工具对象，用 `.run(参数=...)` 就能直接调用，不经过模型：",
   "en": "[▶ 06:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=415) The video's project has a dedicated unit test folder: once a tool is written, **run it on its own and get it working first**, and only then give it to an agent. That way, when something goes wrong you can tell whether the tool is broken or the model is misusing it – and testing a tool costs nothing. Decorating with `@tool` gives you a tool object, which you can call directly with `.run(arg=...)`, without going through the model:"
  },
  {
   "t": "code",
   "file": {
    "zh": "单独测试工具",
    "en": "Testing the tool on its own"
   },
   "code": {
    "zh": "# 运行 l52_tools_solution.py 时做的事：不调模型，单独测试工具\nprint(save_report.name)              # save_report\nprint(save_report.description)       # 就是上面的文档字符串\nprint(save_report.args_schema.model_json_schema()[\"properties\"])\n# {'text': {'title': 'Text', 'type': 'string'}, 'filename': {'title': 'Filename', 'type': 'string'}}\n\nprint(save_report.run(text=\"你好，欢迎使用 PDF 保存工具！\", filename=\"PDF工具测试\"))\n# 报告已保存，请前往 output\\PDF工具测试.pdf 查看报告。\n\nsave_report.run(text=\"只有正文\")       # 少了 filename\n# ValueError: Tool 'save_report' arguments validation failed ... filename  Field required",
    "en": "# What running l52_tools_solution.py does: test the tool on its own, without the model\nprint(save_report.name)              # save_report\nprint(save_report.description)       # the docstring above\nprint(save_report.args_schema.model_json_schema()[\"properties\"])\n# {'text': {'title': 'Text', 'type': 'string'}, 'filename': {'title': 'Filename', 'type': 'string'}}\n\nprint(save_report.run(text=\"Hello, welcome to the PDF saving tool!\", filename=\"PDF_tool_test\"))\n# Report saved. Open output\\PDF_tool_test.pdf to view the report.\n\nsave_report.run(text=\"Body text only\")       # filename is missing\n# ValueError: Tool 'save_report' arguments validation failed ... filename  Field required"
   }
  },
  {
   "t": "check",
   "q": {
    "zh": "模型决定要不要调用 `save_report`、`filename` 填什么，主要依据是？",
    "en": "What does the model mainly go on when it decides whether to call `save_report` and what to put in `filename`?"
   },
   "options": [
    {
     "zh": "函数体里的代码",
     "en": "The code in the function body"
    },
    {
     "zh": "工具保存出来的 PDF 内容",
     "en": "The content of the PDF the tool saves"
    },
    {
     "zh": "工具名、文档字符串（描述）和参数说明",
     "en": "The tool name, the docstring (description) and the parameter info"
    },
    {
     "zh": "撰写者的 backstory",
     "en": "The writer's backstory"
    }
   ],
   "answer": 2,
   "explain": {
    "zh": "模型拿到的只有名字、描述和参数结构，看不到代码。描述写得越清楚（做什么、每个参数是什么、举个例子），模型用得越准。",
    "en": "All the model gets is the name, the description and the parameter structure – it can't see the code. The clearer the description (what it does, what each parameter is, an example), the more accurately the model uses the tool."
   }
  },
  {
   "t": "p",
   "zh": "[▶ 18:24](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=1104) 老师还提到，写好的工具可以交给 Agent，也可以交给任务：\n- `Agent(tools=[...])`：这个 Agent 做任何任务时都能用\n- `Task(tools=[...])`：只在这个任务里能用，而且会**代替** Agent 自己的工具列表（本机 1.15 的源码：任务没写 `tools` 时，才用 Agent 的）\n\n想加别的工具，就在同一个文件里再写一个 `@tool` 函数，导入后放进对应的列表。",
   "en": "[▶ 18:24](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=1104) The instructor also mentions that a finished tool can be given to an agent or to a task:\n- `Agent(tools=[...])`: this agent can use it in any task it works on\n- `Task(tools=[...])`: usable only in this task, and it **replaces** the agent's own tool list (per the installed 1.15 source: the agent's tools are used only when the task sets no `tools`)\n\nTo add another tool, write another `@tool` function in the same file, import it and put it in the right list."
  },
  {
   "t": "note",
   "zh": "官方模板生成的 `tools/custom_tool.py` 用的是另一种写法：继承 `BaseTool`，用 pydantic 模型逐个说明参数，在 `_run` 方法里干活。`l52_tools_solution.py` 里也写了这个版本（`SaveReportTool`）。简单的工具用 `@tool` 就够了，下面的写法了解即可。",
   "en": "The `tools/custom_tool.py` generated by the official template uses another style: subclass `BaseTool`, describe each parameter with a pydantic model, and do the work in a `_run` method. `l52_tools_solution.py` contains this version too (`SaveReportTool`). For simple tools `@tool` is enough; the style below is just for reference."
  },
  {
   "t": "code",
   "file": {
    "zh": "BaseTool 写法（了解即可）",
    "en": "The BaseTool style (for reference)"
   },
   "code": {
    "zh": "from crewai.tools import BaseTool\nfrom pydantic import BaseModel, Field\n\n\nclass SaveReportInput(BaseModel):\n    text: str = Field(description=\"要保存的报告全文\")\n    filename: str = Field(description=\"PDF 文件名，不带路径和扩展名\")\n\n\nclass SaveReportTool(BaseTool):\n    name: str = \"save_report\"\n    description: str = \"把一份报告保存成本地 PDF 文件（支持中文），返回保存状态的提示。\"\n    args_schema: type[BaseModel] = SaveReportInput\n\n    def _run(self, text: str, filename: str) -> str:      # 真正干活的方法\n        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)\n        path = OUTPUT_DIR / f\"{clean_filename(filename)}.pdf\"\n        text_to_pdf(text, path)\n        return f\"报告已保存，请前往 {path} 查看报告。\"\n\n\nwriter = Agent(role=\"报告撰写者\", goal=\"写报告并保存\", backstory=\"你擅长写作。\",\n               llm=llm, tools=[SaveReportTool()])          # 注意要先创建实例",
    "en": "from crewai.tools import BaseTool\nfrom pydantic import BaseModel, Field\n\n\nclass SaveReportInput(BaseModel):\n    text: str = Field(description=\"The full text of the report to save\")\n    filename: str = Field(description=\"The PDF file name, without path or extension\")\n\n\nclass SaveReportTool(BaseTool):\n    name: str = \"save_report\"\n    description: str = \"Save a report as a local PDF file (Chinese is supported) and return a status message.\"\n    args_schema: type[BaseModel] = SaveReportInput\n\n    def _run(self, text: str, filename: str) -> str:      # the method that does the actual work\n        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)\n        path = OUTPUT_DIR / f\"{clean_filename(filename)}.pdf\"\n        text_to_pdf(text, path)\n        return f\"Report saved. Open {path} to view the report.\"\n\n\nwriter = Agent(role=\"Report writer\", goal=\"Write the report and save it\", backstory=\"You are a skilled writer.\",\n               llm=llm, tools=[SaveReportTool()])          # note: create an instance first"
   }
  },
  {
   "t": "h",
   "zh": "七、YAML 和代码分开，以及换模型的效果",
   "en": "7. Keeping YAML apart from code, and what switching models does"
  },
  {
   "t": "p",
   "zh": "[▶ 18:56](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=1136) 最后老师回到两个 YAML 文件，说明这样分工的好处：`agents.yaml` 只放 Agent 的文字，`tasks.yaml` 只放任务的文字，`crew.py` 负责组装和分配工具，main 脚本负责服务——改提示词不用碰代码，结构也清楚。这种「各管各的」叫**解耦**。\n\n[▶ 19:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=1198) 关于模型，老师私下比较过：GPT-4o-mini 效果最好；qwen-max 很慢，推理也不如它；Ollama 本地模型最好选参数量大的，7B、8B 的小模型基本完成不了这种既要推理、又要调用工具的任务。DeepSeek 的 `deepseek-flash` 跑这个案例没有问题。",
   "en": "[▶ 18:56](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=1136) Finally the instructor returns to the two YAML files and explains the benefit of this split: `agents.yaml` holds only the agent texts, `tasks.yaml` only the task texts, `crew.py` assembles everything and assigns the tools, and the main script runs the server – so you can change prompts without touching code, and the structure stays clear. Letting each part mind its own job like this is called **decoupling**.\n\n[▶ 19:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=53&t=1198) On models, the instructor has compared them on his own: GPT-4o-mini works best; qwen-max is slow and doesn't reason as well; for Ollama local models, pick one with as many parameters as possible – small 7B or 8B models basically can't finish a task like this that needs both reasoning and tool calls. DeepSeek's `deepseek-flash` handles this case without problems."
  },
  {
   "t": "note",
   "zh": "视频里的研究员没有搜索工具，只能靠模型训练时学到的知识，讲不了训练截止以后的新进展。`crewai-tools` 里有 100 多个现成工具（比如搜网页的 `SerperDevTool` 要 `SERPER_API_KEY`，搜论文的 `ArxivPaperTool` 不要 key）。想试试让研究员真的去查资料，可以运行 `practice\\l52_arxiv_researcher.py`（加 `--tool-only` 只测工具、不调模型）。",
   "en": "The video's researcher has no search tool, so it can only rely on what the model learned in training and can't cover anything after its training cutoff. `crewai-tools` has more than 100 ready-made tools (for example `SerperDevTool` for web search needs `SERPER_API_KEY`, while `ArxivPaperTool` for searching papers needs no key). To have the researcher actually look things up, run `practice\\l52_arxiv_researcher.py` (add `--tool-only` to test just the tool, without calling the model)."
  }
 ],
 "quiz": [
  {
   "q": {
    "zh": "用 `@tool(\"save_report\")` 装饰的函数没有写文档字符串，会怎样？",
    "en": "What happens if a function decorated with `@tool(\"save_report\")` has no docstring?"
   },
   "options": [
    {
     "zh": "工具正常创建，描述为空",
     "en": "The tool is created normally, with an empty description"
    },
    {
     "zh": "CrewAI 自动用函数名当描述",
     "en": "CrewAI automatically uses the function name as the description"
    },
    {
     "zh": "模型调用这个工具时才报错",
     "en": "It fails only when the model calls the tool"
    },
    {
     "zh": "装饰时就报 `ValueError: Function must have a docstring`",
     "en": "It fails as soon as it is decorated: `ValueError: Function must have a docstring`"
    }
   ],
   "answer": 3,
   "explain": {
    "zh": "文档字符串就是工具的描述，CrewAI 要求必须有（本机验证过）。描述是模型决定怎么用工具的主要依据。",
    "en": "The docstring is the tool's description, and CrewAI requires one (verified on this machine). The description is the main thing the model goes on when deciding how to use the tool."
   }
  },
  {
   "q": {
    "zh": "视频为什么给 crew 类加了一个 `__init__`？",
    "en": "Why does the video add an `__init__` to the crew class?"
   },
   "options": [
    {
     "zh": "CrewAI 1.x 规定 crew 类必须写 `__init__`",
     "en": "CrewAI 1.x requires every crew class to have an `__init__`"
    },
    {
     "zh": "让模型在外面创建好再传进来，Agent 里用 `llm=self.llm`，参数可以自己设，不同 Agent 也能用不同模型",
     "en": "So the model can be created outside and passed in: the agents use `llm=self.llm`, you can set the parameters yourself, and different agents can use different models"
    },
    {
     "zh": "为了让 YAML 文件能被读到",
     "en": "So that the YAML files can be read"
    },
    {
     "zh": "为了让工具能被调用",
     "en": "So that the tool can be called"
    }
   ],
   "answer": 1,
   "explain": {
    "zh": "`__init__` 把传进来的模型存到 `self` 上，每个 `@agent` 方法都能取到。YAML 由 `agents_config` / `tasks_config` 读取，和 `__init__` 无关。",
    "en": "`__init__` stores the model that is passed in on `self`, where every `@agent` method can reach it. The YAML is read through `agents_config` / `tasks_config` and has nothing to do with `__init__`."
   }
  },
  {
   "q": {
    "zh": "视频里研究员交了 5 个要点，而上一集要 10 条却给了 15 条。这一集为什么正好是 5 条？",
    "en": "In the video the researcher hands in 5 points, while in the previous episode it was asked for 10 and gave 15. Why exactly 5 this time?"
   },
   "options": [
    {
     "zh": "任务描述 / 期望输出里规定了 5 个要点，这次的模型照做了",
     "en": "The task description / expected output asks for 5 points, and this time the model followed it"
    },
    {
     "zh": "CrewAI 默认每个任务输出 5 条",
     "en": "CrewAI outputs 5 items per task by default"
    },
    {
     "zh": "撰写者的工具只能保存 5 条",
     "en": "The writer's tool can only save 5 items"
    },
    {
     "zh": "因为用了 `__init__`",
     "en": "Because `__init__` was used"
    }
   ],
   "answer": 0,
   "explain": {
    "zh": "条数来自任务的文字（提示词）。写得越具体越可控，但模型不一定每次都严格照做，所以要看日志检查。",
    "en": "The count comes from the task text (the prompt). The more specific it is, the more predictable the result, but the model doesn't always follow it strictly, so check the log."
   }
  },
  {
   "q": {
    "zh": "`save_report` 写在 `Task(tools=[save_report])` 上，而不是 Agent 上，区别是？",
    "en": "What's the difference if `save_report` goes on `Task(tools=[save_report])` instead of on the agent?"
   },
   "options": [
    {
     "zh": "没有区别",
     "en": "No difference"
    },
    {
     "zh": "工具会被所有 Agent 共享",
     "en": "The tool is shared by all agents"
    },
    {
     "zh": "只在这个任务里能用，并且代替 Agent 自己的工具列表",
     "en": "It's usable only in this task, and it replaces the agent's own tool list"
    },
    {
     "zh": "工具会在任务开始前自动运行一次",
     "en": "The tool runs once automatically before the task starts"
    }
   ],
   "answer": 2,
   "explain": {
    "zh": "Task 上的工具只在这个任务里生效；任务没写 `tools` 时，才用 Agent 自己的。Agent 上的工具在它做的所有任务里都能用。",
    "en": "Tools on a Task apply only to that task; the agent's own tools are used only when the task sets no `tools`. Tools on an Agent are available in every task it does."
   }
  },
  {
   "q": {
    "zh": "照视频写 `from crewai_tools import tool`，在本机的 CrewAI 1.15 里会怎样？",
    "en": "What happens if you write `from crewai_tools import tool`, as in the video, with the installed CrewAI 1.15?"
   },
   "options": [
    {
     "zh": "正常导入",
     "en": "It imports fine"
    },
    {
     "zh": "报 `ImportError`，要改成 `from crewai.tools import tool`",
     "en": "You get an `ImportError`; change it to `from crewai.tools import tool`"
    },
    {
     "zh": "能导入，但工具不会被调用",
     "en": "It imports, but the tool is never called"
    },
    {
     "zh": "要先设置 `SERPER_API_KEY`",
     "en": "You have to set `SERPER_API_KEY` first"
    }
   ],
   "answer": 1,
   "explain": {
    "zh": "1.x 把 `tool` 移到了 `crewai.tools`。`crewai_tools` 包里现在放的是各种现成工具（如 `ArxivPaperTool`）。",
    "en": "1.x moved `tool` to `crewai.tools`. The `crewai_tools` package now holds the various ready-made tools (such as `ArxivPaperTool`)."
   }
  },
  {
   "q": {
    "zh": "视频想设置模型的温度，用的是 LangChain 的 `ChatOpenAI`。在 CrewAI 1.15 里怎么做？",
    "en": "To set the model's temperature, the video uses LangChain's `ChatOpenAI`. How do you do it in CrewAI 1.15?"
   },
   "options": [
    {
     "zh": "必须先装 langchain-openai",
     "en": "You must install langchain-openai first"
    },
    {
     "zh": "温度只能写在 YAML 里",
     "en": "Temperature can only be set in the YAML"
    },
    {
     "zh": "改不了温度",
     "en": "You can't change the temperature"
    },
    {
     "zh": "用 CrewAI 自带的 `LLM(..., temperature=0.7)`；对 deepseek-flash 还要关掉思考模式，温度才明显生效",
     "en": "Use CrewAI's built-in `LLM(..., temperature=0.7)`; for deepseek-flash, also turn off thinking mode, or the temperature has little visible effect"
    }
   ],
   "answer": 3,
   "explain": {
    "zh": "`LLM` 能直接传 `temperature`、`max_tokens` 等参数。deepseek-flash 默认思考模式，要加 `extra_body={\"thinking\": {\"type\": \"disabled\"}}`。",
    "en": "`LLM` takes parameters such as `temperature` and `max_tokens` directly. deepseek-flash uses thinking mode by default, so add `extra_body={\"thinking\": {\"type\": \"disabled\"}}`."
   }
  }
 ],
 "fill": [
  {
   "title": {
    "zh": "写一个工具，并让 crew 类接收模型",
    "en": "Write a tool and make the crew class receive the model"
   },
   "code": {
    "zh": "from crewai.tools import [[tool]]\n\n@tool(\"[[save_report]]\")\ndef save_report(text: [[str]], filename: str) -> str:\n    \"\"\"把一份报告保存成本地 PDF 文件。text 是报告全文，filename 是不带扩展名的文件名。\"\"\"\n    OUTPUT_DIR.mkdir(parents=True, [[exist_ok]]=True)\n    path = OUTPUT_DIR / f\"{filename}.pdf\"\n    text_to_pdf(text, path)\n    return f\"报告已保存，请前往 {path} 查看报告。\"\n\nprint(save_report.[[run]](text=\"你好\", filename=\"测试\"))\n\n\n@CrewBase\nclass TechResearchCrew:\n    agents_config = \"data/l52_agents.yaml\"\n    tasks_config = \"data/l52_tasks.yaml\"\n\n    def [[__init__]](self, llm):\n        self.llm = llm\n\n    @agent\n    def reporting_writer(self) -> Agent:\n        return Agent(config=self.agents_config[\"reporting_writer\"],\n                     llm=[[self.llm]], [[tools]]=[save_report])",
    "en": "from crewai.tools import [[tool]]\n\n@tool(\"[[save_report]]\")\ndef save_report(text: [[str]], filename: str) -> str:\n    \"\"\"Save a report as a local PDF file. text is the full report; filename is the file name without extension.\"\"\"\n    OUTPUT_DIR.mkdir(parents=True, [[exist_ok]]=True)\n    path = OUTPUT_DIR / f\"{filename}.pdf\"\n    text_to_pdf(text, path)\n    return f\"Report saved. Open {path} to view the report.\"\n\nprint(save_report.[[run]](text=\"Hello\", filename=\"test\"))\n\n\n@CrewBase\nclass TechResearchCrew:\n    agents_config = \"data/l52_agents.yaml\"\n    tasks_config = \"data/l52_tasks.yaml\"\n\n    def [[__init__]](self, llm):\n        self.llm = llm\n\n    @agent\n    def reporting_writer(self) -> Agent:\n        return Agent(config=self.agents_config[\"reporting_writer\"],\n                     llm=[[self.llm]], [[tools]]=[save_report])"
   },
   "explain": {
    "zh": "`@tool(\"名字\")` + 类型提示 + 文档字符串；`mkdir(parents=True, exist_ok=True)` 建文件夹；`.run(...)` 单独测试；`__init__` 接收模型，Agent 里用 `llm=self.llm`；`tools=[...]` 把工具交给 Agent。",
    "en": "`@tool(\"name\")` + type hints + a docstring; `mkdir(parents=True, exist_ok=True)` creates the folder; `.run(...)` tests the tool on its own; `__init__` receives the model and the agent uses `llm=self.llm`; `tools=[...]` gives the tool to the agent."
   }
  }
 ],
 "write": [
  {
   "title": {
    "zh": "手写：存 PDF 的工具",
    "en": "Write it by hand: the save-to-PDF tool"
   },
   "task": {
    "zh": "不看上面的代码，写出：\n1. 用 `@tool` 定义 `save_report(text: str, filename: str) -> str`，带文档字符串；用 `text_to_pdf` 把 `text` 存成 `output/<filename>.pdf`，返回带路径的提示\n2. 不调用模型，用 `.run(...)` 单独测试它\n3. 创建一个撰写者 Agent，用 `tools=[...]` 把工具交给它\n\n在 `.venv-crewai` 里运行（第 3 步只创建 Agent，不会调用模型）。也可以直接补全 `practice/l52_tools_todo.py`。",
    "en": "Without looking at the code above, write:\n1. `save_report(text: str, filename: str) -> str` defined with `@tool`, with a docstring; it uses `text_to_pdf` to save `text` as `output/<filename>.pdf` and returns a message containing the path\n2. A test of the tool on its own with `.run(...)`, without calling the model\n3. A writer agent that gets the tool through `tools=[...]`\n\nRun it in `.venv-crewai` (step 3 only creates the agent; it doesn't call the model). You can also just complete `practice/l52_tools_todo.py`."
   },
   "starter": {
    "zh": "import os\nfrom pathlib import Path\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import LLM, Agent\nfrom crewai.tools import tool\n\nfrom l52_pdf import text_to_pdf\nfrom llm import API_KEY, BASE_URL, MODEL\n\nOUTPUT_DIR = Path(\"output\")\n\n# 1. 写工具：名字叫 save_report，两个字符串参数（报告全文、文件名），写清文档字符串；\n#    把全文存成 output 文件夹里的 PDF（用 text_to_pdf），返回一句带路径的提示\n\n\n# 2. 不调模型，单独测试：打印工具名和描述，再保存一份「测试报告」\n\n\n# 3. 创建撰写者 Agent，把工具交给它（只创建，不运行）\n",
    "en": "import os\nfrom pathlib import Path\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import LLM, Agent\nfrom crewai.tools import tool\n\nfrom l52_pdf import text_to_pdf\nfrom llm import API_KEY, BASE_URL, MODEL\n\nOUTPUT_DIR = Path(\"output\")\n\n# 1. Write the tool: name it save_report, with two string parameters (the full report, the file name) and a clear docstring;\n#    save the text as a PDF in the output folder (with text_to_pdf) and return a message containing the path\n\n\n# 2. Test it on its own, without the model: print the tool's name and description, then save a \"test report\"\n\n\n# 3. Create the writer agent and give it the tool (create only, don't run)\n"
   },
   "solution": {
    "zh": "import os\nfrom pathlib import Path\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import LLM, Agent\nfrom crewai.tools import tool\n\nfrom l52_pdf import text_to_pdf\nfrom llm import API_KEY, BASE_URL, MODEL\n\nOUTPUT_DIR = Path(\"output\")\n\n# 1. 写工具：名字叫 save_report，两个字符串参数（报告全文、文件名），写清文档字符串；\n#    把全文存成 output 文件夹里的 PDF（用 text_to_pdf），返回一句带路径的提示\n@tool(\"save_report\")\ndef save_report(text: str, filename: str) -> str:\n    \"\"\"把一份报告保存成本地 PDF 文件。\n    text：要保存的报告全文。filename：不带路径和扩展名的文件名。\n    返回保存状态的提示。\"\"\"\n    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)\n    path = OUTPUT_DIR / f\"{filename}.pdf\"\n    text_to_pdf(text, path)\n    return f\"报告已保存，请前往 {path} 查看报告。\"\n\n\n# 2. 不调模型，单独测试：打印工具名和描述，再保存一份「测试报告」\nprint(save_report.name)\nprint(save_report.description)\nprint(save_report.run(text=\"你好，欢迎使用 PDF 保存工具！\", filename=\"测试报告\"))\n\n# 3. 创建撰写者 Agent，把工具交给它（只创建，不运行）\nllm = LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY)\nwriter = Agent(\n    role=\"技术趋势报告撰写者\",\n    goal=\"写出技术趋势报告，并用 save_report 工具保存成 PDF\",\n    backstory=\"你擅长把复杂的技术讲得通俗易懂。\",\n    tools=[save_report],\n    llm=llm,\n)\n",
    "en": "import os\nfrom pathlib import Path\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import LLM, Agent\nfrom crewai.tools import tool\n\nfrom l52_pdf import text_to_pdf\nfrom llm import API_KEY, BASE_URL, MODEL\n\nOUTPUT_DIR = Path(\"output\")\n\n# 1. Write the tool: name it save_report, with two string parameters (the full report, the file name) and a clear docstring;\n#    save the text as a PDF in the output folder (with text_to_pdf) and return a message containing the path\n@tool(\"save_report\")\ndef save_report(text: str, filename: str) -> str:\n    \"\"\"Save a report as a local PDF file.\n    text: the full text of the report to save. filename: the file name without path or extension.\n    Returns a status message.\"\"\"\n    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)\n    path = OUTPUT_DIR / f\"{filename}.pdf\"\n    text_to_pdf(text, path)\n    return f\"Report saved. Open {path} to view the report.\"\n\n\n# 2. Test it on its own, without the model: print the tool's name and description, then save a \"test report\"\nprint(save_report.name)\nprint(save_report.description)\nprint(save_report.run(text=\"Hello, welcome to the PDF saving tool!\", filename=\"test_report\"))\n\n# 3. Create the writer agent and give it the tool (create only, don't run)\nllm = LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY)\nwriter = Agent(\n    role=\"Tech Trends Report Writer\",\n    goal=\"Write a tech trends report and save it as a PDF with the save_report tool\",\n    backstory=\"You are good at explaining complex technology in plain words.\",\n    tools=[save_report],\n    llm=llm,\n)\n"
   },
   "checks": [
    {
     "re": "@tool\\(\\s*[\\\"']save_report[\\\"']",
     "zh": "用 `@tool(\"save_report\")` 装饰",
     "en": "Decorated with `@tool(\"save_report\")`"
    },
    {
     "re": "def\\s+save_report\\(\\s*text\\s*:\\s*str\\s*,\\s*filename\\s*:\\s*str\\s*\\)",
     "zh": "两个参数都有 `str` 类型提示",
     "en": "Both parameters have a `str` type hint"
    },
    {
     "re": "def\\s+save_report[^\\n]*\\n\\s+(\\\"\\\"\\\"|''')",
     "zh": "函数下一行就是文档字符串",
     "en": "The docstring is on the line right after the def"
    },
    {
     "re": "mkdir\\([^)]*exist_ok\\s*=\\s*True",
     "zh": "建文件夹时用 `exist_ok=True`",
     "en": "Uses `exist_ok=True` when creating the folder"
    },
    {
     "re": "text_to_pdf\\(\\s*text\\s*,",
     "zh": "用 `text_to_pdf(text, ...)` 存成 PDF",
     "en": "Saves the PDF with `text_to_pdf(text, ...)`"
    },
    {
     "re": "save_report\\.run\\(",
     "zh": "用 `.run(...)` 单独测试",
     "en": "Tests the tool on its own with `.run(...)`"
    },
    {
     "re": "tools\\s*=\\s*\\[\\s*save_report\\s*\\]",
     "zh": "`tools=[save_report]` 交给 Agent",
     "en": "Gives it to the agent with `tools=[save_report]`"
    }
   ]
  },
  {
   "title": {
    "zh": "手写：crew 类接收模型、分配工具",
    "en": "Write it by hand: a crew class that receives the model and assigns the tool"
   },
   "task": {
    "zh": "补全 crew 类（Agent 和 Task 的文字在 `practice/data/l52_*.yaml` 里）：\n1. `__init__` 接收一个模型参数，存到 `self` 上\n2. 两个 `@agent` 方法 `researcher`、`reporting_writer`，配置从 `agents_config` 里取，模型用存好的那个；只有撰写者拿到 `save_report`\n3. 在外面创建温度 0.7 的模型，交给 crew 类，用主题「人工智能」运行，打印 `result.raw`\n\n把文件存到 `practice` 文件夹里再运行（约 3 次模型调用），对照 `practice/l52_research_crew.py`。",
    "en": "Complete the crew class (the agent and task texts are in `practice/data/l52_*.yaml`):\n1. `__init__` takes a model parameter and stores it on `self`\n2. Two `@agent` methods, `researcher` and `reporting_writer`, take their config from `agents_config` and use the stored model; only the writer gets `save_report`\n3. Outside the class, create a model with temperature 0.7, hand it to the crew class, run it with the topic “AI” and print `result.raw`\n\nSave the file in the `practice` folder before running it (about 3 model calls), and compare it with `practice/l52_research_crew.py`."
   },
   "starter": {
    "zh": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import LLM, Agent, Crew, Process, Task\nfrom crewai.project import CrewBase, agent, crew, task\n\nfrom l52_tools_solution import save_report\nfrom llm import API_KEY, BASE_URL, MODEL\n\n\n@CrewBase\nclass TechResearchCrew:\n    agents_config = \"data/l52_agents.yaml\"\n    tasks_config = \"data/l52_tasks.yaml\"\n\n    # 1. __init__：接收一个模型参数，存到 self 上\n\n\n    # 2. 两个 @agent 方法 researcher、reporting_writer：配置从 agents_config 里取，\n    #    模型用存好的那个；只有 reporting_writer 拿到 save_report 工具\n\n\n    @task\n    def research_task(self) -> Task:\n        return Task(config=self.tasks_config[\"research_task\"])\n\n    @task\n    def reporting_task(self) -> Task:\n        return Task(config=self.tasks_config[\"reporting_task\"])\n\n    @crew\n    def crew(self) -> Crew:\n        return Crew(agents=self.agents, tasks=self.tasks, process=Process.sequential, verbose=True)\n\n\n# 3. 在外面创建模型（温度 0.7），交给 crew 类，主题填「人工智能」运行，打印最终结果\n",
    "en": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import LLM, Agent, Crew, Process, Task\nfrom crewai.project import CrewBase, agent, crew, task\n\nfrom l52_tools_solution import save_report\nfrom llm import API_KEY, BASE_URL, MODEL\n\n\n@CrewBase\nclass TechResearchCrew:\n    agents_config = \"data/l52_agents.yaml\"\n    tasks_config = \"data/l52_tasks.yaml\"\n\n    # 1. __init__: take a model parameter and store it on self\n\n\n    # 2. Two @agent methods, researcher and reporting_writer: take their config from agents_config\n    #    and use the stored model; only reporting_writer gets the save_report tool\n\n\n    @task\n    def research_task(self) -> Task:\n        return Task(config=self.tasks_config[\"research_task\"])\n\n    @task\n    def reporting_task(self) -> Task:\n        return Task(config=self.tasks_config[\"reporting_task\"])\n\n    @crew\n    def crew(self) -> Crew:\n        return Crew(agents=self.agents, tasks=self.tasks, process=Process.sequential, verbose=True)\n\n\n# 3. Outside the class, create the model (temperature 0.7), hand it to the crew class, run it with the topic \"AI\" and print the final result\n"
   },
   "solution": {
    "zh": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import LLM, Agent, Crew, Process, Task\nfrom crewai.project import CrewBase, agent, crew, task\n\nfrom l52_tools_solution import save_report\nfrom llm import API_KEY, BASE_URL, MODEL\n\n\n@CrewBase\nclass TechResearchCrew:\n    agents_config = \"data/l52_agents.yaml\"\n    tasks_config = \"data/l52_tasks.yaml\"\n\n    # 1. __init__：接收一个模型参数，存到 self 上\n    def __init__(self, llm):\n        self.llm = llm\n\n    # 2. 两个 @agent 方法 researcher、reporting_writer：配置从 agents_config 里取，\n    #    模型用存好的那个；只有 reporting_writer 拿到 save_report 工具\n    @agent\n    def researcher(self) -> Agent:\n        return Agent(config=self.agents_config[\"researcher\"], llm=self.llm, verbose=True)\n\n    @agent\n    def reporting_writer(self) -> Agent:\n        return Agent(config=self.agents_config[\"reporting_writer\"], llm=self.llm,\n                     tools=[save_report], verbose=True)\n\n    @task\n    def research_task(self) -> Task:\n        return Task(config=self.tasks_config[\"research_task\"])\n\n    @task\n    def reporting_task(self) -> Task:\n        return Task(config=self.tasks_config[\"reporting_task\"])\n\n    @crew\n    def crew(self) -> Crew:\n        return Crew(agents=self.agents, tasks=self.tasks, process=Process.sequential, verbose=True)\n\n\n# 3. 在外面创建模型（温度 0.7），交给 crew 类，主题填「人工智能」运行，打印最终结果\nllm = LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY, temperature=0.7)\nresult = TechResearchCrew(llm).crew().kickoff(inputs={\"topic\": \"人工智能\"})\nprint(result.raw)\n",
    "en": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import LLM, Agent, Crew, Process, Task\nfrom crewai.project import CrewBase, agent, crew, task\n\nfrom l52_tools_solution import save_report\nfrom llm import API_KEY, BASE_URL, MODEL\n\n\n@CrewBase\nclass TechResearchCrew:\n    agents_config = \"data/l52_agents.yaml\"\n    tasks_config = \"data/l52_tasks.yaml\"\n\n    # 1. __init__: take a model parameter and store it on self\n    def __init__(self, llm):\n        self.llm = llm\n\n    # 2. Two @agent methods, researcher and reporting_writer: take their config from agents_config\n    #    and use the stored model; only reporting_writer gets the save_report tool\n    @agent\n    def researcher(self) -> Agent:\n        return Agent(config=self.agents_config[\"researcher\"], llm=self.llm, verbose=True)\n\n    @agent\n    def reporting_writer(self) -> Agent:\n        return Agent(config=self.agents_config[\"reporting_writer\"], llm=self.llm,\n                     tools=[save_report], verbose=True)\n\n    @task\n    def research_task(self) -> Task:\n        return Task(config=self.tasks_config[\"research_task\"])\n\n    @task\n    def reporting_task(self) -> Task:\n        return Task(config=self.tasks_config[\"reporting_task\"])\n\n    @crew\n    def crew(self) -> Crew:\n        return Crew(agents=self.agents, tasks=self.tasks, process=Process.sequential, verbose=True)\n\n\n# 3. Outside the class, create the model (temperature 0.7), hand it to the crew class, run it with the topic \"AI\" and print the final result\nllm = LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY, temperature=0.7)\nresult = TechResearchCrew(llm).crew().kickoff(inputs={\"topic\": \"AI\"})\nprint(result.raw)\n"
   },
   "checks": [
    {
     "re": "def\\s+__init__\\(\\s*self\\s*,\\s*\\w+\\s*\\)",
     "zh": "写了 `__init__(self, llm)`",
     "en": "Has `__init__(self, llm)`"
    },
    {
     "re": "self\\.\\w+\\s*=\\s*\\w+\\s*$",
     "zh": "把模型存到 `self` 上",
     "en": "Stores the model on `self`"
    },
    {
     "re": "llm\\s*=\\s*self\\.\\w+",
     "zh": "Agent 里用 `llm=self.llm`",
     "en": "The agents use `llm=self.llm`"
    },
    {
     "re": "def\\s+researcher\\(\\s*self\\s*\\)",
     "zh": "定义了 `researcher` 方法",
     "en": "Defines a `researcher` method"
    },
    {
     "re": "tools\\s*=\\s*\\[\\s*save_report\\s*\\]",
     "zh": "撰写者拿到 `tools=[save_report]`",
     "en": "The writer gets `tools=[save_report]`"
    },
    {
     "re": "temperature\\s*=\\s*0\\.7",
     "zh": "模型温度 0.7",
     "en": "Model temperature 0.7"
    },
    {
     "re": "TechResearchCrew\\(\\s*\\w+\\s*\\)\\.crew\\(\\)\\.kickoff\\(\\s*inputs\\s*=",
     "zh": "`TechResearchCrew(llm).crew().kickoff(inputs=...)`",
     "en": "`TechResearchCrew(llm).crew().kickoff(inputs=...)`"
    }
   ]
  }
 ],
 "pitfalls": [
  {
   "zh": "`@tool` 函数没写文档字符串，装饰时就报 `Function must have a docstring`。",
   "en": "A `@tool` function without a docstring fails as soon as it is decorated: `Function must have a docstring`."
  },
  {
   "zh": "描述写得含糊（只写「保存」），模型不知道什么时候用、参数怎么填，结果不调用或乱填。",
   "en": "A vague description (just “save”) leaves the model unsure when to use the tool and how to fill in the arguments, so it doesn't call it or fills in nonsense."
  },
  {
   "zh": "照视频写 `from crewai_tools import tool`，1.x 里报 `ImportError`；要写 `from crewai.tools import tool`。",
   "en": "Writing `from crewai_tools import tool` as in the video gives an `ImportError` in 1.x; write `from crewai.tools import tool`."
  },
  {
   "zh": "`OUTPUT_DIR = Path(\"output\")` 是相对路径：没先 `cd` 到 `practice` 就运行，PDF 会存到别的文件夹。",
   "en": "`OUTPUT_DIR = Path(\"output\")` is a relative path: if you don't `cd` into `practice` before running, the PDF is saved in some other folder."
  },
  {
   "zh": "`expected_output` 没说「不要重复全文」，撰写者把整篇报告又输出一遍，token 翻倍。",
   "en": "If `expected_output` doesn't say “don't repeat the full text”, the writer outputs the whole report again and the tokens double."
  },
  {
   "zh": "`BaseTool` 子类交给 Agent 时忘了加括号创建实例：要写 `SaveReportTool()`。",
   "en": "Forgetting the parentheses when giving a `BaseTool` subclass to an agent: you must create an instance, `SaveReportTool()`."
  },
  {
   "zh": "给 deepseek-flash 设了温度却看不出变化：思考模式下温度基本不起作用，要关掉思考。",
   "en": "Setting a temperature for deepseek-flash but seeing no change: in thinking mode temperature has little effect, so turn thinking off."
  }
 ],
 "recap": [
  {
   "zh": "案例：研究员交 5 个趋势要点 → 撰写者写成报告，并调用自定义工具存成 PDF；按顺序执行。",
   "en": "The case: the researcher delivers 5 trend points → the writer turns them into a report and saves it as a PDF with a custom tool; the tasks run in order."
  },
  {
   "zh": "改动一：模型在外面创建（视频用 LangChain 的 `ChatOpenAI`，现在用 CrewAI 的 `LLM`），通过 crew 类的 `__init__` 传进来，Agent 里写 `llm=self.llm`。",
   "en": "Change 1: the model is created outside (the video uses LangChain's `ChatOpenAI`, now CrewAI's `LLM`), passed in through the crew class's `__init__`, and the agents use `llm=self.llm`."
  },
  {
   "zh": "改动二：`@tool(\"名字\")` + 文档字符串 + 类型提示 = 一个工具；`tools=[...]` 交给 Agent（或 Task）。",
   "en": "Change 2: `@tool(\"name\")` + a docstring + type hints = a tool; `tools=[...]` gives it to an agent (or a task)."
  },
  {
   "zh": "模型只看工具的名字、描述和参数说明，所以描述最重要；先用 `.run(...)` 单独测通工具，再交给 Agent。",
   "en": "The model sees only the tool's name, description and parameter info, so the description matters most; get the tool working on its own with `.run(...)` first, then give it to an agent."
  },
  {
   "zh": "一次工具调用 = 模型发请求 → CrewAI 执行函数 → 结果交回模型；撰写者因此要调用 2 次模型，整个 crew 共 3 次。",
   "en": "One tool call = the model sends a request → CrewAI runs the function → the result goes back to the model; that's why the writer needs 2 model calls and the whole crew 3."
  },
  {
   "zh": "YAML 放文字、crew.py 组装、main 提供服务（解耦）；小模型很难完成要推理又要用工具的任务。",
   "en": "YAML holds the texts, crew.py assembles, main serves (decoupling); small models struggle with tasks that need both reasoning and tools."
  }
 ],
 "files": [
  {
   "path": "practice/l52_tools_todo.py",
   "zh": "练习：写 `save_report` 工具并单独测试（不调模型、不花钱）。",
   "en": "Exercise: write the `save_report` tool and test it on its own (no model, no cost)."
  },
  {
   "path": "practice/l52_tools_solution.py",
   "zh": "参考答案：`@tool` 版和 `BaseTool` 版的存 PDF 工具；直接运行就是视频里「单独测试工具」那一步。",
   "en": "Solution: the save-to-PDF tool in both the `@tool` and the `BaseTool` style; running it directly is the video's “test the tool on its own” step."
  },
  {
   "path": "practice/l52_pdf.py",
   "zh": "PDF 的细节：用 PyMuPDF 自带的中文字体把文字存成 PDF（不需要会写）。",
   "en": "PDF details: saves text as a PDF with PyMuPDF's built-in Chinese font (you don't need to be able to write this)."
  },
  {
   "path": "practice/l52_research_crew.py",
   "zh": "完整案例：`@CrewBase` + YAML，`__init__` 接收模型，撰写者调用 `save_report` 存 PDF（约 3 次模型调用）。",
   "en": "The full case: `@CrewBase` + YAML, `__init__` receives the model, and the writer calls `save_report` to save a PDF (about 3 model calls)."
  },
  {
   "path": "practice/data/l52_agents.yaml",
   "zh": "研究员和撰写者的 role / goal / backstory。",
   "en": "The researcher's and the writer's role / goal / backstory."
  },
  {
   "path": "practice/data/l52_tasks.yaml",
   "zh": "研究任务和撰写任务的描述与期望输出。",
   "en": "Descriptions and expected outputs of the research task and the writing task."
  },
  {
   "path": "practice/l52_api.py",
   "zh": "视频的 main 脚本：`lifespan` 里创建模型，接口里直接创建并运行 crew，8012 端口（用 `l51_api_client.py` 调用）。",
   "en": "The video's main script: creates the model in `lifespan`, creates and runs the crew right in the endpoint, port 8012 (call it with `l51_api_client.py`)."
  },
  {
   "path": "practice/l52_arxiv_researcher.py",
   "zh": "补充：研究员使用现成的 `ArxivPaperTool` 查真实论文（`--tool-only` 只测工具）。",
   "en": "Extra: the researcher uses the ready-made `ArxivPaperTool` to search real papers (`--tool-only` tests just the tool)."
  }
 ]
});
