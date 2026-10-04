COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
 "id": "l51",
 "priority": "core",
 "handwrite": true,
 "studyMinutes": 80,
 "source": "subtitle",
 "summary": {
  "zh": "CrewAI 把多个 Agent 组织成一个「团队」：每个 Agent 有角色、目标和背景故事，每个 Task 写清要做什么、要交出什么，Crew 按流程把任务交给 Agent。视频先讲这几个核心概念，再用官方模板跑通「研究员 → 报告分析员」案例，最后用 FastAPI 把它包装成对外的 HTTP 接口。本节按同样的顺序，用 DeepSeek 和本机的 CrewAI 1.15 重做一遍，并补一个不用模板的单文件写法，方便你手写。",
  "en": "CrewAI organises several agents as a “team”: each agent has a role, a goal and a backstory, each task states what to do and what to deliver, and the crew hands the tasks to the agents according to a process. The video first explains these concepts, then runs the official template's “researcher → reporting analyst” case, and finally wraps it in a FastAPI HTTP service. This lesson follows the same order with DeepSeek and the installed CrewAI 1.15, and adds a one-file version without the template so you can write it by hand."
 },
 "goals": [
  {
   "zh": "说清楚 CrewAI 的四个核心概念：Agent、Task、Process、Crew，以及 role / goal / backstory、description / expected_output 各管什么",
   "en": "Explain CrewAI's four core concepts – Agent, Task, Process, Crew – and what role / goal / backstory and description / expected_output each control"
  },
  {
   "zh": "看懂官方模板项目的结构（YAML + `@CrewBase` 类 + 环境变量里的模型配置），并在 `.venv-crewai` 里用 DeepSeek 跑通",
   "en": "Understand how the official template project is structured (YAML + an `@CrewBase` class + model settings in environment variables) and run it with DeepSeek in `.venv-crewai`"
  },
  {
   "zh": "不看资料，手写一个按顺序执行的两人小组：`LLM(...)`、两个 Agent、两个 Task、`kickoff(inputs=...)`",
   "en": "Write, unaided, a sequential two-agent crew: `LLM(...)`, two agents, two tasks, `kickoff(inputs=...)`"
  },
  {
   "zh": "读懂运行日志和结果 `CrewOutput`（`.raw`、`.tasks_output`），用 `output_file` 保存报告",
   "en": "Read the run log and the `CrewOutput` result (`.raw`, `.tasks_output`), and save the report with `output_file`"
  },
  {
   "zh": "用 FastAPI 写出视频那样的服务：`lifespan` 里配置模型、带请求模型的 POST 接口、用 uvicorn 启动，再用客户端调用",
   "en": "Build a FastAPI service like the video's: configure the model in `lifespan`, add a POST endpoint with a request model, start it with uvicorn, then call it from a client"
  },
  {
   "zh": "知道换模型对多 Agent 协作效果的影响",
   "en": "Know how much the choice of model affects multi-agent results"
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
   "zh": "视频的内容和顺序（点时间可以直接跳到那一段）：\n- [▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=0) CrewAI 是什么，以及 Agent、Task、Process、Crew、Pipeline 几个核心概念\n- [▶ 04:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=283) 官方入门案例：研究员 + 报告分析员，两个 Agent、两个 Task\n- [▶ 06:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=409) 准备工作：Anaconda + PyCharm 开发环境，三种接模型的方式（代理用 GPT、OneAPI 转发国产模型、Ollama 跑本地模型）\n- [▶ 18:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1100) 测试一：用 `crewai create crew` 生成官方模板项目，改 `.env`，`crewai install`、`crewai run` 跑通，得到 `report.md`\n- [▶ 24:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1449) 测试二：加一层 FastAPI，`main` 脚本在 8012 端口提供接口，`apitest` 脚本发 POST 请求拿回报告；接着逐段讲 `main` 脚本（[▶ 28:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1699)）和 `crew.py`、两个 YAML 文件（[▶ 33:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1981)）\n- [▶ 36:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=2170) 换成 Ollama 本地模型再跑一遍，比较三个模型的效果\n\n模型：测试一用的是经 OneAPI 转发的通义千问 qwen-max，测试二用 GPT-4o-mini，最后用 Ollama 跑 Llama 3.1 8B。本课程统一用 DeepSeek（`practice/llm.py`）。",
   "en": "The video's contents, in order (click a time to jump there):\n- [▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=0) What CrewAI is, and the core concepts Agent, Task, Process, Crew and Pipeline\n- [▶ 04:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=283) The official starter case: a researcher + a reporting analyst – two agents, two tasks\n- [▶ 06:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=409) Preparation: Anaconda + PyCharm, and three ways to reach a model (GPT through a proxy, Chinese models through OneAPI, local models through Ollama)\n- [▶ 18:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1100) Test 1: generate the official template with `crewai create crew`, edit `.env`, run `crewai install` and `crewai run`, and get `report.md`\n- [▶ 24:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1449) Test 2: a FastAPI layer – a `main` script serves on port 8012 and an `apitest` script POSTs a request and gets the report back; then a walk through `main` ([▶ 28:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1699)) and `crew.py` plus the two YAML files ([▶ 33:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1981))\n- [▶ 36:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=2170) The same run on a local Ollama model, and a comparison of the three models\n\nModels: test 1 uses Qwen qwen-max through OneAPI, test 2 uses GPT-4o-mini, and the last run uses Llama 3.1 8B in Ollama. This course uses DeepSeek throughout (`practice/llm.py`)."
  },
  {
   "t": "warn",
   "zh": "CrewAI 装在单独的环境 `.venv-crewai` 里（它要求的依赖版本和其他框架冲突，见环境准备页）。本模块的练习都要用 `..\\.venv-crewai\\Scripts\\python.exe` 运行；用 `.venv` 会报 `ModuleNotFoundError: No module named 'crewai'`。",
   "en": "CrewAI lives in its own environment, `.venv-crewai` (its dependency versions clash with other frameworks; see the Setup page). Run every exercise in this module with `..\\.venv-crewai\\Scripts\\python.exe`; with `.venv` you get `ModuleNotFoundError: No module named 'crewai'`."
  },
  {
   "t": "h",
   "zh": "二、CrewAI 的核心概念",
   "en": "2. CrewAI's core concepts"
  },
  {
   "t": "p",
   "zh": "[▶ 00:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=32) CrewAI 是搭建多 Agent 系统的框架：几个角色、目标各不相同的 Agent 分工合作，把一个复杂任务拆开完成。视频把它比作一个项目团队：\n\n| 概念 | 类比 | 主要参数 |\n|---|---|---|\n| **Agent** 智能体 | 团队里的一名成员 | `role` 角色、`goal` 目标、`backstory` 背景故事；另外有 `llm`（用哪个模型）、`tools`（能用的工具） |\n| **Task** 任务 | 分给某个成员的一项工作 | `description` 要做什么、`expected_output` 期望交出什么、`agent` 交给谁、`tools` 做这项工作能用的工具、`context` 参考哪些任务的输出、`output_json` / `output_file` 把结果存成 JSON 或文件 |\n| **Process** 流程 | 项目经理安排工作的方式 | `Process.sequential` 按任务列表的顺序执行，前一个的输出交给下一个；`Process.hierarchical` 由一个经理 Agent 分配任务、检查结果 |\n| **Crew** 团队 | 整个项目组 | `agents`、`tasks`、`process`、`verbose`；层级流程还要 `manager_llm`；用 `kickoff()` 开工 |\n\n`role`、`goal`、`backstory` 最后都会写进发给模型的系统提示词，所以它们本质上就是**提示词**：写得越具体，Agent 的表现越稳定。",
   "en": "[▶ 00:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=32) CrewAI is a framework for multi-agent systems: several agents with different roles and goals split a complex job between them. The video compares it to a project team:\n\n| Concept | Analogy | Main parameters |\n|---|---|---|\n| **Agent** | A team member | `role`, `goal`, `backstory`; plus `llm` (which model) and `tools` (the tools it can use) |\n| **Task** | A piece of work given to one member | `description` (what to do), `expected_output` (what to deliver), `agent` (who does it), `tools` (tools for this task), `context` (which tasks' outputs to read), `output_json` / `output_file` (save the result as JSON or a file) |\n| **Process** | How the project manager schedules the work | `Process.sequential` runs the task list in order, passing each output on; `Process.hierarchical` lets a manager agent assign work and check results |\n| **Crew** | The whole team | `agents`, `tasks`, `process`, `verbose`; a hierarchical process also needs `manager_llm`; `kickoff()` starts it |\n\n`role`, `goal` and `backstory` all end up in the system prompt sent to the model, so they really are **prompts**: the more specific they are, the steadier the agent behaves."
  },
  {
   "t": "note",
   "title": {
    "zh": "视频里的旧功能",
    "en": "Older features in the video"
   },
   "zh": "[▶ 03:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=220) 视频还讲了 Crew 的 `language` 参数和 **Pipeline**（流水线：把多个 crew 按顺序或并行串起来，前一阶段的输出给后一阶段）。本机的 CrewAI 1.15.23 里这两样都没有了（已验证：没有 `crewai.pipeline` 模块，Crew 也没有 `language` 字段）。串联多个 crew 的需求，新版用 **Flow** 来做，57、58 节再讲。",
   "en": "[▶ 03:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=220) The video also covers the crew's `language` parameter and **Pipeline** (chaining several crews in sequence or in parallel, each stage feeding the next). Neither exists in the installed CrewAI 1.15.23 (verified: there is no `crewai.pipeline` module and Crew has no `language` field). Chaining crews is done with **Flow** in newer versions – see lessons 57 and 58."
  },
  {
   "t": "check",
   "q": {
    "zh": "Task 的哪个参数说明「做完以后要交出什么样的结果」？",
    "en": "Which Task parameter says what the finished result should look like?"
   },
   "options": [
    {
     "zh": "`description`",
     "en": "`description`"
    },
    {
     "zh": "`backstory`",
     "en": "`backstory`"
    },
    {
     "zh": "`expected_output`",
     "en": "`expected_output`"
    }
   ],
   "answer": 2,
   "explain": {
    "zh": "`description` 说要做什么，`expected_output` 说交出什么（格式、条数、语言等）。`backstory` 是 Agent 的参数，不属于 Task。",
    "en": "`description` says what to do and `expected_output` what to deliver (format, count, language…). `backstory` belongs to the Agent, not the Task."
   }
  },
  {
   "t": "h",
   "zh": "三、官方入门案例：研究员 + 报告分析员",
   "en": "3. The official starter case: researcher + reporting analyst"
  },
  {
   "t": "p",
   "zh": "[▶ 04:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=283) 视频用的是 CrewAI 官方模板自带的案例（老师把英文翻成中文来讲，本节的 YAML 也是中文版）。主题在运行时传入，视频里是 `AI LLMs`：\n\n| | 研究员 `researcher` | 报告分析员 `reporting_analyst` |\n|---|---|---|\n| 角色 | {topic} 高级数据研究员 | {topic} 报告分析员 |\n| 目标 | 发掘这个主题的前沿进展 | 根据研究结果写出详细报告 |\n| 背景故事 | 经验丰富，擅长找到最相关的信息并讲清楚 | 一丝不苟，擅长把复杂信息整理成易懂的报告 |\n| 任务 | `research_task`：深入调研主题，交出 **10 个要点** | `reporting_task`：把每个要点扩展成报告里的一个小节，交出 Markdown 报告 |\n\n两个任务按顺序执行：研究员的 10 个要点会自动成为报告分析员的「上下文」。视频录制时，调研任务里写死了「今年是 2024 年」；本机 1.15 版的模板改成了占位符 `{current_year}`，运行时再填。",
   "en": "[▶ 04:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=283) The video uses the case that ships with CrewAI's official template (the instructor translates it into Chinese to explain it; this lesson's YAML is in Chinese too). The topic is passed in at run time – `AI LLMs` in the video:\n\n| | Researcher `researcher` | Reporting analyst `reporting_analyst` |\n|---|---|---|\n| Role | {topic} Senior Data Researcher | {topic} Reporting Analyst |\n| Goal | Uncover cutting-edge developments in the topic | Write a detailed report from the findings |\n| Backstory | Seasoned; finds the most relevant information and explains it clearly | Meticulous; turns complex information into easy-to-read reports |\n| Task | `research_task`: research the topic in depth, deliver **10 bullet points** | `reporting_task`: expand each point into a section of the report, deliver a Markdown report |\n\nThe two tasks run in order: the researcher's 10 points automatically become the analyst's “context”. When the video was recorded, the research task hard-coded “the current year is 2024”; the installed 1.15 template uses a `{current_year}` placeholder instead, filled in at run time."
  },
  {
   "t": "note",
   "title": {
    "zh": "补充：Crew 在背后做了什么（视频没讲）",
    "en": "Extra: what a crew does behind the scenes (not in the video)"
   },
   "zh": "CrewAI 并没有什么魔法。按顺序执行时，它对每个任务大致做四件事：\n1. 用 Agent 的 `role`、`backstory`、`goal` 拼出系统提示词（实际格式是 `You are {role}. {backstory}` 加 `Your personal goal is: {goal}`）\n2. 用 Task 的 `description` 和 `expected_output` 拼出用户消息\n3. 从第二个任务开始，把前一个任务的输出作为「上下文」附在后面\n4. 调用模型，拿到结果，再交给下一个任务\n\n下面用 04、06 节学过的原生调用模拟一遍（网页里连的是模拟模型，回答是固定模板，但能看清消息是怎么拼的）。它只用来理解原理，不是 CrewAI 的源码。",
   "en": "There is no magic in CrewAI. In a sequential crew it roughly does four things per task:\n1. Builds a system prompt from the agent's `role`, `backstory` and `goal` (literally `You are {role}. {backstory}` plus `Your personal goal is: {goal}`)\n2. Builds a user message from the task's `description` and `expected_output`\n3. From the second task on, appends the previous task's output as “context”\n4. Calls the model and passes the result on to the next task\n\nBelow is a simulation with the raw calls from lessons 04 and 06 (in the browser it talks to the mock model, whose answers are canned, but you can see how the messages are built). It only illustrates the idea; it is not CrewAI's source."
  },
  {
   "t": "code",
   "file": "mini_crew.py",
   "run": "mock",
   "code": {
    "zh": "from llm import client, MODEL\n\nagents = {\n    \"researcher\": {\"role\": \"AI LLMs 高级数据研究员\", \"goal\": \"发掘前沿进展\", \"backstory\": \"你是经验丰富的研究员。\"},\n    \"reporting_analyst\": {\"role\": \"AI LLMs 报告分析员\", \"goal\": \"把要点写成报告\", \"backstory\": \"你擅长写清楚的报告。\"},\n}\ntasks = [\n    {\"description\": \"调研 AI LLMs，列出 3 个要点。\", \"expected_output\": \"3 个要点\", \"agent\": \"researcher\"},\n    {\"description\": \"把要点扩写成一份短报告。\", \"expected_output\": \"一份短报告\", \"agent\": \"reporting_analyst\"},\n]\n\ncontext = \"\"                                      # 上一个任务的输出\nfor task in tasks:                                # sequential：按顺序一个一个来\n    a = agents[task[\"agent\"]]\n    system = f\"You are {a['role']}. {a['backstory']}\\nYour personal goal is: {a['goal']}\"\n    user = f\"Current Task: {task['description']}\\n期望的结果：{task['expected_output']}\"\n    if context:                                   # 第二个任务开始，带上前一个任务的结果\n        user += f\"\\n\\n可以参考的上下文：\\n{context}\"\n    reply = client.chat.completions.create(\n        model=MODEL,\n        messages=[{\"role\": \"system\", \"content\": system}, {\"role\": \"user\", \"content\": user}],\n    )\n    context = reply.choices[0].message.content    # 这个输出交给下一个任务\n    print(f\"【{a['role']}】{context}\\n\")",
    "en": "from llm import client, MODEL\n\nagents = {\n    \"researcher\": {\"role\": \"AI LLMs Senior Data Researcher\", \"goal\": \"uncover cutting-edge developments\", \"backstory\": \"You are a seasoned researcher.\"},\n    \"reporting_analyst\": {\"role\": \"AI LLMs Reporting Analyst\", \"goal\": \"turn the points into a report\", \"backstory\": \"You write clear reports.\"},\n}\ntasks = [\n    {\"description\": \"Research AI LLMs and list 3 key points.\", \"expected_output\": \"3 bullet points\", \"agent\": \"researcher\"},\n    {\"description\": \"Expand the points into a short report.\", \"expected_output\": \"a short report\", \"agent\": \"reporting_analyst\"},\n]\n\ncontext = \"\"                                      # output of the previous task\nfor task in tasks:                                # sequential: one task after another\n    a = agents[task[\"agent\"]]\n    system = f\"You are {a['role']}. {a['backstory']}\\nYour personal goal is: {a['goal']}\"\n    user = f\"Current Task: {task['description']}\\nExpected output: {task['expected_output']}\"\n    if context:                                   # from the second task on, add the previous result\n        user += f\"\\n\\nContext you can use:\\n{context}\"\n    reply = client.chat.completions.create(\n        model=MODEL,\n        messages=[{\"role\": \"system\", \"content\": system}, {\"role\": \"user\", \"content\": user}],\n    )\n    context = reply.choices[0].message.content    # this output goes to the next task\n    print(f\"[{a['role']}] {context}\\n\")"
   }
  },
  {
   "t": "check",
   "q": {
    "zh": "按顺序执行（sequential）时，报告分析员是怎么拿到研究员的 10 个要点的？",
    "en": "In a sequential crew, how does the reporting analyst get the researcher's 10 points?"
   },
   "options": [
    {
     "zh": "要自己写代码把结果传过去",
     "en": "You must pass them yourself in code"
    },
    {
     "zh": "CrewAI 自动把前一个任务的输出作为上下文交给下一个任务",
     "en": "CrewAI automatically passes the previous task's output to the next task as context"
    },
    {
     "zh": "两个 Agent 共用同一个对话历史",
     "en": "Both agents share one chat history"
    }
   ],
   "answer": 1,
   "explain": {
    "zh": "顺序流程里，前一个任务的输出会自动成为下一个任务的上下文。需要更精确时，可以用 Task 的 `context=[某个任务]` 指定参考哪些任务。",
    "en": "In a sequential process the previous output becomes the next task's context automatically. For finer control, set `context=[some_task]` on a Task."
   }
  },
  {
   "t": "h",
   "zh": "四、准备工作：环境和模型",
   "en": "4. Preparation: environment and models"
  },
  {
   "t": "p",
   "zh": "[▶ 06:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=409) 视频先用 Anaconda 建一个 Python 3.11 的虚拟环境，在 PyCharm 里建项目，再用 `pip install` 装上 crewai、crewai-tools、fastapi 等依赖（[▶ 16:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1004)）。本课程已经准备好了 `.venv-crewai`（CrewAI 1.15.23），这一步可以跳过。\n\n接模型这部分视频讲得很细，介绍了三种方式：\n- [▶ 07:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=440) **GPT**：通过代理访问 OpenAI，用 GPT-4o-mini\n- [▶ 08:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=502) **OneAPI**：一个开源的「OpenAI 接口管理和分发系统」，自己部署在服务器上（默认 3000 端口）。在里面添加「渠道」（比如填上阿里百炼的 key 接通义千问），再创建「令牌」；代码里用这个令牌当 key、用 OneAPI 的地址当 base_url\n- [▶ 11:59](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=719) **Ollama**：在本机运行开源模型，`ollama list` 查看已下载的模型，`ollama run 模型名` 下载并启动（视频里有 qwen2 7B、llama3.1 8B、gemma2 9B）\n\n这三种方式有一个共同点：都提供 **OpenAI 兼容的接口**。所以对 CrewAI 来说，换模型只是换「地址、key、模型名」三样东西。DeepSeek 也一样：",
   "en": "[▶ 06:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=409) The video first creates a Python 3.11 virtual environment with Anaconda, makes a project in PyCharm, and installs crewai, crewai-tools, fastapi and other dependencies with `pip install` ([▶ 16:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1004)). This course already has `.venv-crewai` (CrewAI 1.15.23), so you can skip that.\n\nThe video covers connecting to a model in detail, with three options:\n- [▶ 07:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=440) **GPT** through a proxy to OpenAI, using GPT-4o-mini\n- [▶ 08:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=502) **OneAPI**: an open-source “OpenAI API management and distribution system” you deploy on a server (port 3000 by default). You add a “channel” (e.g. your Alibaba Bailian key for Qwen) and create a “token”; your code then uses the token as the key and OneAPI's address as base_url\n- [▶ 11:59](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=719) **Ollama**: runs open models on your own machine; `ollama list` shows downloaded models and `ollama run <model>` downloads and starts one (the video has qwen2 7B, llama3.1 8B and gemma2 9B)\n\nAll three offer an **OpenAI-compatible API**, so for CrewAI switching models just means changing three things: address, key and model name. DeepSeek works the same way:"
  },
  {
   "t": "code",
   "file": {
    "zh": "llm 设置",
    "en": "llm setup"
   },
   "code": {
    "zh": "from crewai import LLM\nfrom llm import API_KEY, BASE_URL, MODEL       # 和前面各节一样，从 practice/llm.py 取配置\n\nllm = LLM(\n    model=f\"openai/{MODEL}\",    # \"openai/\" = 按 OpenAI 兼容协议说话；后面是模型名\n    base_url=BASE_URL,          # 请求发到 DeepSeek（视频：OneAPI 的地址）\n    api_key=API_KEY,            # DeepSeek 的 key（视频：OneAPI 的令牌）\n)",
    "en": "from crewai import LLM\nfrom llm import API_KEY, BASE_URL, MODEL       # same settings as earlier lessons, from practice/llm.py\n\nllm = LLM(\n    model=f\"openai/{MODEL}\",    # \"openai/\" = speak the OpenAI-compatible protocol; then the model name\n    base_url=BASE_URL,          # send requests to DeepSeek (video: the OneAPI address)\n    api_key=API_KEY,            # the DeepSeek key (video: the OneAPI token)\n)"
   }
  },
  {
   "t": "p",
   "zh": "`model` 里斜杠前的 `openai/` 告诉 CrewAI「按 OpenAI 兼容协议说话」，`base_url` 把请求改发到 DeepSeek。换成视频里的模型也只改这三项（本课程没有逐个测试，用之前先确认服务和 key 已准备好）：\n- 通义千问（百炼直连）：`model=\"openai/qwen-plus\"`，`base_url=\"https://dashscope.aliyuncs.com/compatible-mode/v1\"`，百炼的 key\n- OneAPI：`base_url` 写 `http://你的服务器:3000/v1`，key 写 OneAPI 的令牌，`model` 写 `openai/` 加渠道里的模型名\n- Ollama：`base_url` 写 `http://localhost:11434/v1`，`model` 写 `openai/` 加你下载的模型名",
   "en": "The `openai/` before the slash in `model` tells CrewAI to “speak the OpenAI-compatible protocol”, and `base_url` sends the requests to DeepSeek. The video's models need only these three values changed (not tested in this course – make sure the service and key are ready first):\n- Qwen (Bailian directly): `model=\"openai/qwen-plus\"`, `base_url=\"https://dashscope.aliyuncs.com/compatible-mode/v1\"`, your Bailian key\n- OneAPI: `base_url` = `http://your-server:3000/v1`, the key = your OneAPI token, `model` = `openai/` plus the channel's model name\n- Ollama: `base_url` = `http://localhost:11434/v1`, `model` = `openai/` plus the model you downloaded"
  },
  {
   "t": "tip",
   "zh": "每个练习文件开头都有两行 `os.environ.setdefault(...)`，必须写在 `import crewai` 之前（中间那行 `PROJECT_DIR` 用 `__file__` 算出项目文件夹，也就是 practice 的上一级）：\n- `CREWAI_TRACING_ENABLED=false`：关掉 CrewAI 的执行追踪，否则它可能在运行结束时问你要不要上传追踪数据。\n- `CREWAI_STORAGE_DIR`：CrewAI 每次运行都会写一个记录任务输出的小数据库，默认放在 C 盘的 AppData 里；这一行把它放到项目的 `.cache\\crewai`。",
   "en": "Every practice file starts with two `os.environ.setdefault(...)` lines, and they must come before `import crewai` (the `PROJECT_DIR` line between them uses `__file__` to find the project folder, the one above practice):\n- `CREWAI_TRACING_ENABLED=false` turns off CrewAI's execution tracing, which may otherwise ask about uploading trace data at the end of a run.\n- `CREWAI_STORAGE_DIR`: on every run CrewAI writes a small database of task outputs, by default under AppData on drive C; this line moves it to the project's `.cache\\crewai`."
  },
  {
   "t": "h",
   "zh": "五、测试一：官方模板项目",
   "en": "5. Test 1: the official template project"
  },
  {
   "t": "p",
   "zh": "[▶ 18:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1100) 第一个测试走的是 CrewAI 官方推荐的流程：\n1. `crewai create crew test_project` 生成项目模板（本机 1.15 版默认生成新的 JSON 结构，要得到视频里的结构需要加 `--classic`）\n2. [▶ 19:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1194) 改项目里的 `.env`：填模型服务的地址、key 和模型名（视频填的是 OneAPI 的地址、令牌和 qwen-max）\n3. [▶ 20:24](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1224) 在项目文件夹里运行 `crewai install` 安装依赖\n4. [▶ 21:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1291) 运行 `crewai run`，结束后项目里多出一个 `report.md`\n\n生成的项目结构（[▶ 19:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1162)）：\n\n| 文件 | 作用 |\n|---|---|\n| `config/agents.yaml` | 每个 Agent 的 role / goal / backstory |\n| `config/tasks.yaml` | 每个 Task 的 description / expected_output / agent |\n| `crew.py` | 一个 `@CrewBase` 类，把 YAML 组装成 Agent、Task 和 Crew |\n| `main.py` | 入口，`run()` 里准备 `inputs` 并调用 `kickoff` |\n| `.env` | 模型服务的地址、key、模型名 |\n| `README.md`、`pyproject.toml` | 说明和依赖 |\n\n`crewai install` 会用 uv 为项目另建一个虚拟环境、下载一整套依赖（缓存默认在 C 盘），所以本课程不运行这两条命令，而是在 `practice` 里写出同样的结构。先看两个 YAML（模板内容的中文版）：",
   "en": "[▶ 18:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1100) Test 1 follows CrewAI's recommended workflow:\n1. `crewai create crew test_project` generates the template (1.15 now generates a new JSON layout by default; add `--classic` to get the video's layout)\n2. [▶ 19:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1194) Edit the project's `.env`: the model service's address, key and model name (the video uses the OneAPI address, its token and qwen-max)\n3. [▶ 20:24](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1224) Run `crewai install` in the project folder\n4. [▶ 21:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1291) Run `crewai run`; afterwards the project contains a `report.md`\n\nThe generated project ([▶ 19:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1162)):\n\n| File | Purpose |\n|---|---|\n| `config/agents.yaml` | role / goal / backstory of each agent |\n| `config/tasks.yaml` | description / expected_output / agent of each task |\n| `crew.py` | An `@CrewBase` class that turns the YAML into agents, tasks and a crew |\n| `main.py` | The entry point; `run()` prepares `inputs` and calls `kickoff` |\n| `.env` | The model service's address, key and model name |\n| `README.md`, `pyproject.toml` | Notes and dependencies |\n\n`crewai install` uses uv to build a separate virtual environment and download a full set of packages (its cache defaults to drive C), so this course skips those commands and writes the same structure in `practice`. First the two YAML files (a Chinese version of the template):"
  },
  {
   "t": "code",
   "file": "practice/data/l51_agents.yaml + l51_tasks.yaml",
   "lang": "yaml",
   "code": {
    "zh": "# practice/data/l51_agents.yaml（节选 / excerpt）\nresearcher:                 # 名字 = crew 类里 @agent 方法的名字 / = the @agent method name\n  role: >\n    {topic} 高级数据研究员\n  goal: >\n    发掘 {topic} 领域的前沿进展\n  backstory: >\n    你是一名经验丰富的研究员，擅长发现 {topic} 的最新进展，\n    以能找到最相关的信息、并用清楚简洁的方式讲出来而闻名。\n\n# practice/data/l51_tasks.yaml（节选 / excerpt）\nresearch_task:\n  description: >\n    对 {topic} 做一次深入的调研，找出所有有趣且相关的信息。\n    注意：今年是 {current_year} 年。\n  expected_output: >\n    一个包含 10 个要点的列表，列出 {topic} 最相关的信息，用中文。\n  agent: researcher         # 交给哪个 Agent / which agent does it",
    "en": "# practice/data/l51_agents.yaml (excerpt, translated)\nresearcher:                 # name = the @agent method name in the crew class\n  role: >\n    {topic} Senior Data Researcher\n  goal: >\n    Uncover cutting-edge developments in {topic}\n  backstory: >\n    You're a seasoned researcher with a knack for uncovering the latest developments in {topic},\n    known for finding the most relevant information and presenting it clearly and concisely.\n\n# practice/data/l51_tasks.yaml (excerpt, translated)\nresearch_task:\n  description: >\n    Conduct thorough research on {topic} and find any interesting, relevant information.\n    Note: the current year is {current_year}.\n  expected_output: >\n    A list of 10 bullet points with the most relevant information about {topic}, in English.\n  agent: researcher         # which agent does it"
   },
   "note": {
    "zh": "YAML 里 `>` 表示「下面几行合成一段文字」。顶层的名字要和 `@agent` / `@task` 方法同名；tasks.yaml 里 `agent: researcher` 指的就是 `researcher` 这个方法。",
    "en": "In YAML, `>` means “join the following lines into one text”. Top-level names must match the `@agent` / `@task` method names; `agent: researcher` in tasks.yaml refers to the `researcher` method."
   }
  },
  {
   "t": "p",
   "zh": "`crew.py` 对应 `practice/l51_yaml_crew.py`。视频在 [▶ 33:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1981) 逐行讲了这个文件：用 `@agent` 定义两个 Agent，配置取自 `agents.yaml`，`verbose=True` 控制终端里那些带颜色的详细日志；用 `@task` 定义两个任务；最后用 `@crew` 把它们组成按顺序执行的 Crew（[▶ 35:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=2137)）。",
   "en": "`crew.py` corresponds to `practice/l51_yaml_crew.py`. The video walks through it at [▶ 33:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1981): `@agent` defines the two agents from `agents.yaml`, `verbose=True` controls the detailed coloured log in the terminal, `@task` defines the two tasks, and `@crew` combines them into a sequential crew ([▶ 35:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=2137))."
  },
  {
   "t": "code",
   "file": "practice/l51_yaml_crew.py",
   "code": {
    "zh": "import os\nfrom datetime import datetime\n\nfrom crewai import Agent, Crew, Process, Task\nfrom crewai.project import CrewBase, agent, crew, task\nfrom llm import API_KEY, BASE_URL, MODEL\n\n\ndef use_deepseek_env():\n    \"\"\"视频把这三项写在 .env 里；这里在创建 Agent 之前用代码设置。\"\"\"\n    os.environ[\"OPENAI_API_BASE\"] = BASE_URL      # 模型服务的地址\n    os.environ[\"OPENAI_API_KEY\"] = API_KEY        # key\n    os.environ[\"OPENAI_MODEL_NAME\"] = MODEL       # 模型名\n\n\ndef make_inputs(topic):\n    return {\"topic\": topic, \"current_year\": str(datetime.now().year)}\n\n\n@CrewBase\nclass ReportCrew:\n    agents_config = \"data/l51_agents.yaml\"     # 相对于这个 .py 文件所在的文件夹\n    tasks_config = \"data/l51_tasks.yaml\"\n\n    @agent\n    def researcher(self) -> Agent:\n        # 和模板一样不写 llm=...，模型从环境变量里读\n        return Agent(config=self.agents_config[\"researcher\"], verbose=True)\n\n    @agent\n    def reporting_analyst(self) -> Agent:\n        return Agent(config=self.agents_config[\"reporting_analyst\"], verbose=True)\n\n    @task\n    def research_task(self) -> Task:\n        return Task(config=self.tasks_config[\"research_task\"])\n\n    @task\n    def reporting_task(self) -> Task:\n        return Task(config=self.tasks_config[\"reporting_task\"], output_file=\"output/l51_report.md\")\n\n    @crew\n    def crew(self) -> Crew:\n        # self.agents、self.tasks 是 @CrewBase 按定义顺序收集好的列表\n        return Crew(agents=self.agents, tasks=self.tasks, process=Process.sequential, verbose=True)\n\n\nif __name__ == \"__main__\":\n    use_deepseek_env()\n    result = ReportCrew().crew().kickoff(inputs=make_inputs(\"AI LLMs\"))\n    print(result.raw)",
    "en": "import os\nfrom datetime import datetime\n\nfrom crewai import Agent, Crew, Process, Task\nfrom crewai.project import CrewBase, agent, crew, task\nfrom llm import API_KEY, BASE_URL, MODEL\n\n\ndef use_deepseek_env():\n    \"\"\"The video keeps these three in .env; here code sets them before any Agent is created.\"\"\"\n    os.environ[\"OPENAI_API_BASE\"] = BASE_URL      # address of the model service\n    os.environ[\"OPENAI_API_KEY\"] = API_KEY        # key\n    os.environ[\"OPENAI_MODEL_NAME\"] = MODEL       # model name\n\n\ndef make_inputs(topic):\n    return {\"topic\": topic, \"current_year\": str(datetime.now().year)}\n\n\n@CrewBase\nclass ReportCrew:\n    agents_config = \"data/l51_agents.yaml\"     # relative to this .py file's folder\n    tasks_config = \"data/l51_tasks.yaml\"\n\n    @agent\n    def researcher(self) -> Agent:\n        # no llm=..., just like the template: the model comes from environment variables\n        return Agent(config=self.agents_config[\"researcher\"], verbose=True)\n\n    @agent\n    def reporting_analyst(self) -> Agent:\n        return Agent(config=self.agents_config[\"reporting_analyst\"], verbose=True)\n\n    @task\n    def research_task(self) -> Task:\n        return Task(config=self.tasks_config[\"research_task\"])\n\n    @task\n    def reporting_task(self) -> Task:\n        return Task(config=self.tasks_config[\"reporting_task\"], output_file=\"output/l51_report.md\")\n\n    @crew\n    def crew(self) -> Crew:\n        # self.agents and self.tasks are lists @CrewBase collected in definition order\n        return Crew(agents=self.agents, tasks=self.tasks, process=Process.sequential, verbose=True)\n\n\nif __name__ == \"__main__\":\n    use_deepseek_env()\n    result = ReportCrew().crew().kickoff(inputs=make_inputs(\"AI LLMs\"))\n    print(result.raw)"
   }
  },
  {
   "t": "p",
   "zh": "注意模板里的 Agent **没有写 `llm=`**。这时 CrewAI 会去读环境变量：`OPENAI_MODEL_NAME`（或 `MODEL`）是模型名，`OPENAI_API_BASE`（或 `OPENAI_BASE_URL`）是地址，`OPENAI_API_KEY` 是 key。模板项目把它们写在 `.env` 里，`crewai run` 会自动读取；我们直接运行 Python 文件，所以用 `use_deepseek_env()` 在创建 Agent 之前把三个变量设好。本机已验证：这样创建出的 Agent 用的就是 `deepseek-flash`，请求发往 DeepSeek。\n\n如果忘了设置，CrewAI 不会提醒你，而是悄悄用默认模型 `gpt-4.1-mini`，到真正调用时才报 `OPENAI_API_KEY is required`。",
   "en": "Notice that the template's agents have **no `llm=`**. CrewAI then reads environment variables: `OPENAI_MODEL_NAME` (or `MODEL`) for the model name, `OPENAI_API_BASE` (or `OPENAI_BASE_URL`) for the address and `OPENAI_API_KEY` for the key. The template keeps them in `.env`, which `crewai run` loads; we run the Python file directly, so `use_deepseek_env()` sets the three variables before any agent is created. Verified locally: the agents built this way use `deepseek-flash` and send their requests to DeepSeek.\n\nIf you forget, CrewAI does not warn you; it quietly falls back to its default `gpt-4.1-mini` and fails only at the first call with `OPENAI_API_KEY is required`."
  },
  {
   "t": "py",
   "title": {
    "zh": "装饰器的另一种用法：登记函数",
    "en": "Another use of decorators: registering functions"
   },
   "zh": "08 节说过，装饰器就是「接收一个函数、返回一个函数」的函数。`@agent`、`@task` 主要做的是**登记**：把被装饰的方法记下来，函数本身原样返回。之后 `@CrewBase` 按登记的顺序调用它们，得到 `self.agents` 和 `self.tasks` 两个列表。\n\n下面是一个极简版本，帮你理解这个思路（不是 CrewAI 的真实代码）：",
   "en": "Lesson 08 showed that a decorator is a function that takes a function and returns one. `@agent` and `@task` mainly **register**: they record the decorated method and hand it back unchanged. Later `@CrewBase` calls them in that order to build `self.agents` and `self.tasks`.\n\nHere is a tiny version of the idea (not CrewAI's real code):",
   "code": {
    "zh": "agent_methods = []                 # 被 @agent 标记过的方法名\n\ndef agent(func):                   # 装饰器：收到一个函数……\n    agent_methods.append(func.__name__)   # ……把它登记下来……\n    return func                    # ……再原样还回去\n\n@agent\ndef researcher():\n    return \"研究员\"\n\n@agent\ndef reporting_analyst():\n    return \"报告分析员\"\n\nprint(agent_methods)               # ['researcher', 'reporting_analyst']\nprint(researcher())                # 函数本身没变，照样能调用",
    "en": "agent_methods = []                 # names of methods marked with @agent\n\ndef agent(func):                   # a decorator receives a function...\n    agent_methods.append(func.__name__)   # ...records it...\n    return func                    # ...and hands it back unchanged\n\n@agent\ndef researcher():\n    return \"researcher\"\n\n@agent\ndef reporting_analyst():\n    return \"reporting analyst\"\n\nprint(agent_methods)               # ['researcher', 'reporting_analyst']\nprint(researcher())                # the function itself is unchanged and still callable"
   },
   "note": {
    "zh": "所以 `@agent` 方法的**定义顺序**就是 Agent 的顺序，`@task` 方法的定义顺序就是任务执行的顺序。",
    "en": "So the **definition order** of the `@agent` methods is the agent order, and the definition order of the `@task` methods is the task order."
   }
  },
  {
   "t": "code",
   "file": "PowerShell",
   "lang": "powershell",
   "code": {
    "zh": "cd practice\n& ..\\.venv-crewai\\Scripts\\python.exe l51_yaml_crew.py\n& ..\\.venv-crewai\\Scripts\\python.exe l51_yaml_crew.py \"多模态大模型\"",
    "en": "cd practice\n& ..\\.venv-crewai\\Scripts\\python.exe l51_yaml_crew.py\n& ..\\.venv-crewai\\Scripts\\python.exe l51_yaml_crew.py \"multimodal LLMs\""
   },
   "note": {
    "zh": "一次运行约 2 次模型调用、一两分钟。报告同时写进 `practice\\output\\l51_report.md`。",
    "en": "One run is about 2 model calls and a minute or two. The report is also written to `practice\\output\\l51_report.md`."
   }
  },
  {
   "t": "p",
   "zh": "[▶ 22:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1322) 视频跑完后对着日志讲了一遍过程。你的终端里也是同样的顺序（`verbose=True` 打印的一个个方框）：\n1. 🚀 Crew Execution Started → 📋 Task Started：开始第一个任务\n2. 🤖 Agent Started：`AI LLMs 高级数据研究员` 接到调研任务，`{topic}` 已经换成了真正的主题\n3. ✅ Agent Final Answer：研究员交出要点列表\n4. 第二个任务开始，`AI LLMs 报告分析员` 拿着上面的要点写报告，它的 ✅ Agent Final Answer 就是报告正文\n5. Crew Completion，报告同时写进 `output/l51_report.md`\n\n视频里用 qwen-max 跑时，研究员交了 15 条而不是要求的 10 条——模型不一定严格照做，这也是最后要比较模型的原因。",
   "en": "[▶ 22:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1322) After the run the video goes through the log. Your terminal shows the same sequence (the boxes printed by `verbose=True`):\n1. 🚀 Crew Execution Started → 📋 Task Started: the first task begins\n2. 🤖 Agent Started: `AI LLMs Senior Data Researcher` gets the research task, with `{topic}` already replaced\n3. ✅ Agent Final Answer: the researcher hands in the list of points\n4. The second task starts; `AI LLMs Reporting Analyst` writes the report from those points, and its ✅ Agent Final Answer is the report itself\n5. Crew Completion; the report is also written to `output/l51_report.md`\n\nWith qwen-max the video's researcher returned 15 points instead of the requested 10 – models don't always follow instructions exactly, which is why the video compares models at the end."
  },
  {
   "t": "h",
   "zh": "六、不用模板：一个文件写完（手写练习用这种）",
   "en": "6. Without the template: one file (use this for hand-writing)"
  },
  {
   "t": "p",
   "zh": "视频只用了模板的写法。为了手写练习，可以把同一个案例直接写成 Python 对象，一个文件就能看清全部结构：2 个 Agent、2 个 Task、1 个 Crew。模型用 `LLM(...)` 显式传给每个 Agent——下一集视频也改成了这种「把模型对象传进去」的做法。",
   "en": "The video only uses the template. For hand-writing practice, the same case can be written directly as Python objects, so one file shows the whole structure: 2 agents, 2 tasks, 1 crew. The model is passed to each agent explicitly with `LLM(...)` – the next episode switches to this “pass the model object in” style too."
  },
  {
   "t": "code",
   "file": {
    "zh": "practice/l51_crew_solution.py（整理 / condensed）",
    "en": "practice/l51_crew_solution.py (condensed)"
   },
   "code": {
    "zh": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")                      # 不上传执行追踪\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))  # CrewAI 的小数据库放进项目的 .cache\n\nfrom crewai import LLM, Agent, Crew, Process, Task\nfrom llm import API_KEY, BASE_URL, MODEL\n\nllm = LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY)\n\n\ndef build_crew():\n    researcher = Agent(\n        role=\"{topic} 高级数据研究员\",\n        goal=\"发掘 {topic} 领域的前沿进展\",\n        backstory=\"你是一名经验丰富的研究员，擅长发现 {topic} 的最新进展，并用清楚简洁的方式讲出来。\",\n        llm=llm,\n        verbose=True,\n    )\n    reporting_analyst = Agent(\n        role=\"{topic} 报告分析员\",\n        goal=\"根据研究结果写出详细的 {topic} 报告\",\n        backstory=\"你是一名一丝不苟的分析师，擅长把复杂的信息整理成别人一看就懂的报告。\",\n        llm=llm,\n        verbose=True,\n    )\n    research_task = Task(\n        description=\"对 {topic} 做一次深入的调研，找出最近一两年里有趣且相关的信息。\",\n        expected_output=\"一个包含 10 个要点的列表，列出 {topic} 最相关的信息，用中文。\",\n        agent=researcher,\n    )\n    reporting_task = Task(\n        description=\"阅读研究员给出的要点，把每个要点扩展成报告里完整的一个小节。\",\n        expected_output=\"一份 Markdown 格式的中文报告，每个要点一个小节。\",\n        agent=reporting_analyst,\n        output_file=\"output/l51_report.md\",       # 结果同时存成文件\n    )\n    return Crew(\n        agents=[researcher, reporting_analyst],\n        tasks=[research_task, reporting_task],\n        process=Process.sequential,               # 按顺序执行\n        verbose=True,                             # 在终端打印每一步\n    )\n\n\nif __name__ == \"__main__\":\n    result = build_crew().kickoff(inputs={\"topic\": \"AI LLMs\"})\n    print(result.raw)                             # 最后一个任务的输出\n    for t in result.tasks_output:                 # 每个任务各自的输出\n        print(t.agent, \"->\", t.raw[:60])",
    "en": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")                      # no trace upload\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))  # keep CrewAI's small db in the project's .cache\n\nfrom crewai import LLM, Agent, Crew, Process, Task\nfrom llm import API_KEY, BASE_URL, MODEL\n\nllm = LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY)\n\n\ndef build_crew():\n    researcher = Agent(\n        role=\"{topic} Senior Data Researcher\",\n        goal=\"Uncover cutting-edge developments in {topic}\",\n        backstory=\"You are a seasoned researcher who finds the latest developments in {topic} and explains them clearly.\",\n        llm=llm,\n        verbose=True,\n    )\n    reporting_analyst = Agent(\n        role=\"{topic} Reporting Analyst\",\n        goal=\"Write a detailed {topic} report from the research findings\",\n        backstory=\"You are a meticulous analyst who turns complex information into reports anyone can follow.\",\n        llm=llm,\n        verbose=True,\n    )\n    research_task = Task(\n        description=\"Research {topic} thoroughly and find interesting, relevant information from the last two years.\",\n        expected_output=\"A list of 10 bullet points with the most relevant information about {topic}, in English.\",\n        agent=researcher,\n    )\n    reporting_task = Task(\n        description=\"Read the researcher's points and expand each one into a full section of a report.\",\n        expected_output=\"A Markdown report in English, with one section per point.\",\n        agent=reporting_analyst,\n        output_file=\"output/l51_report.md\",       # also saved to a file\n    )\n    return Crew(\n        agents=[researcher, reporting_analyst],\n        tasks=[research_task, reporting_task],\n        process=Process.sequential,               # run in order\n        verbose=True,                             # print every step in the terminal\n    )\n\n\nif __name__ == \"__main__\":\n    result = build_crew().kickoff(inputs={\"topic\": \"AI LLMs\"})\n    print(result.raw)                             # output of the last task\n    for t in result.tasks_output:                 # each task's own output\n        print(t.agent, \"->\", t.raw[:60])"
   }
  },
  {
   "t": "p",
   "zh": "注意 `role`、`goal`、`description` 里的 `{topic}`：它不是 f-string（前面没有 `f`），Python 不会马上替换它。等到 `kickoff(inputs={\"topic\": \"AI LLMs\"})` 时，CrewAI 才把所有 Agent 和 Task 文字里的 `{topic}` 换成真正的主题。这和 07 节 `.format()` 填模板、45 节 `PromptTemplate` 的占位符是同一个思路：",
   "en": "Look at `{topic}` in `role`, `goal` and `description`: it is not an f-string (there is no `f`), so Python leaves it alone. Only at `kickoff(inputs={\"topic\": \"AI LLMs\"})` does CrewAI replace `{topic}` in every agent and task text – the same idea as filling templates with `.format()` in lesson 07 and the `PromptTemplate` placeholders in lesson 45:"
  },
  {
   "t": "code",
   "file": "placeholder.py",
   "run": true,
   "code": {
    "zh": "description = \"对 {topic} 做一次深入的调研。注意：今年是 {current_year} 年。\"   # 前面没有 f\nprint(description)                                  # 花括号原样保留\n\n# kickoff(inputs={...}) 时，CrewAI 做的就是类似这样的替换\nprint(description.format(topic=\"AI LLMs\", current_year=\"2026\"))\nprint(description.format(topic=\"量子计算\", current_year=\"2026\"))",
    "en": "description = \"Research {topic} thoroughly. Note: the current year is {current_year}.\"   # no f prefix\nprint(description)                                  # the braces stay as they are\n\n# kickoff(inputs={...}) does a replacement much like this\nprint(description.format(topic=\"AI LLMs\", current_year=\"2026\"))\nprint(description.format(topic=\"quantum computing\", current_year=\"2026\"))"
   }
  },
  {
   "t": "warn",
   "zh": "三个容易踩的坑（都在本机验证过）：\n- `inputs` 里缺了某个占位符，比如模板写了 `{current_year}` 却只传了 `topic`：报 `ValueError`，提示 `Template variable 'current_year' not found in inputs dictionary`。\n- 干脆不传 `inputs`：**不会报错**，`{topic}` 原样发给模型，结果文不对题。\n- 写成 `f\"调研 {topic}\"`：Python 立刻去找变量 `topic`，找不到就报 `NameError`。",
   "en": "Three easy traps (all verified locally):\n- A placeholder missing from `inputs`, e.g. the template uses `{current_year}` but you pass only `topic`: a `ValueError` saying `Template variable 'current_year' not found in inputs dictionary`.\n- No `inputs` at all: **no error**; `{topic}` reaches the model literally and the result is off-topic.\n- Writing `f\"Research {topic}\"`: Python looks for a variable `topic` immediately and raises `NameError`."
  },
  {
   "t": "p",
   "zh": "`kickoff()` 返回一个 `CrewOutput` 对象：\n\n| 属性 | 是什么 |\n|---|---|\n| `result.raw` | 最后一个任务的输出文字（最常用；`str(result)` 也得到它） |\n| `result.tasks_output` | 每个任务的输出列表，每项有 `.agent`（谁做的）、`.raw`（输出文字） |\n| `result.token_usage` | 这次运行消耗的 token |\n| `result.json_dict` / `result.pydantic` | 任务要求结构化输出时才有值（55 节讲） |\n\n`output_file=\"output/l51_report.md\"` 会把这个任务的输出同时写进文件。路径是相对于**运行命令时所在的文件夹**的，所以要先 `cd` 到 `practice`；路径里不能有 `..`，否则报 `Path traversal attempts are not allowed`。",
   "en": "`kickoff()` returns a `CrewOutput` object:\n\n| Attribute | What it is |\n|---|---|\n| `result.raw` | The last task's output text (the one you use most; `str(result)` gives the same) |\n| `result.tasks_output` | A list with each task's output; each item has `.agent` (who did it) and `.raw` (the text) |\n| `result.token_usage` | Tokens used by this run |\n| `result.json_dict` / `result.pydantic` | Filled only when a task asks for structured output (lesson 55) |\n\n`output_file=\"output/l51_report.md\"` also writes that task's output to a file. The path is relative to **the folder you run the command from**, so `cd` into `practice` first; it may not contain `..` or you get `Path traversal attempts are not allowed`."
  },
  {
   "t": "h",
   "zh": "七、测试二：用 FastAPI 对外提供服务",
   "en": "7. Test 2: serving the crew with FastAPI"
  },
  {
   "t": "video",
   "zh": "[▶ 24:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1449) 第二个测试在模板的基础上加了一层 FastAPI。[▶ 25:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1511) 先在 `main` 脚本里选模型（三套配置用一个标志位切换，这次用 GPT-4o-mini），服务开在 **8012** 端口；[▶ 25:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1542) 启动服务后，[▶ 26:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1573) 再运行 `apitest` 脚本发 POST 请求，问题和官方示例一样是 `AI LLMs`。[▶ 26:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1604) 服务端日志里的执行过程和测试一一样，只是这次没有生成 `report.md`——老师在代码里关掉了写文件。他的感受是 GPT-4o-mini 比 qwen-max 快，而且老老实实只给了 10 条。",
   "en": "[▶ 24:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1449) Test 2 adds a FastAPI layer on top of the template. [▶ 25:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1511) First the model is chosen in the `main` script (three configurations switched by one flag; this time GPT-4o-mini), and the server runs on port **8012**; [▶ 25:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1542) after the server starts, [▶ 26:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1573) the `apitest` script sends a POST request with the same question as the official example, `AI LLMs`. [▶ 26:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1604) The server log shows the same run as in test 1, except that no `report.md` is produced this time – the instructor turned off file writing in the code. His impression: GPT-4o-mini is faster than qwen-max, and it dutifully returned exactly 10 points."
  },
  {
   "t": "p",
   "zh": "到目前为止，只有你自己能在终端里运行 crew。把它包成 **HTTP 接口**以后，网页、手机 App、别的服务都能通过网络调用它，这就是标题里「对外提供」的意思。\n\nFastAPI 是一个写 HTTP 接口的 Python 框架，这一集用到四样东西：\n1. `app = FastAPI(...)`：创建应用\n2. `@app.post(\"/research\")`：把一个函数登记为「处理 POST /research 请求」的函数\n3. 请求模型：一个继承 `BaseModel` 的类，规定请求体（JSON）长什么样\n4. `lifespan`：服务启动和关闭时各运行一次的代码（视频在这里配置模型）",
   "en": "So far only you can run the crew, in a terminal. Wrapped as an **HTTP endpoint**, it can be called over the network by web pages, apps or other services – that is what “serving” means in the title.\n\nFastAPI is a Python framework for HTTP endpoints; this episode needs four things:\n1. `app = FastAPI(...)` creates the application\n2. `@app.post(\"/research\")` registers a function as the handler for POST /research\n3. A request model: a class based on `BaseModel` that defines the shape of the JSON body\n4. `lifespan`: code that runs once at startup and once at shutdown (where the video configures the model)"
  },
  {
   "t": "py",
   "title": {
    "zh": "路由装饰器：@app.post(\"/research\") 在做什么",
    "en": "Route decorators: what @app.post(\"/research\") does"
   },
   "zh": "`@app.post(\"/research\")` 是一个**带参数的装饰器**：`app.post(\"/research\")` 先执行，返回一个真正的装饰器，再用它装饰下面的函数。它做的事和上面的 `@agent` 一样是**登记**：在一张「路径 → 函数」的表里记下「`/research` 由这个函数处理」。服务器收到请求时，按路径查表，找到函数并调用它。\n\n用纯 Python 模拟一下（FastAPI 真实的实现更复杂，但思路相同）：",
   "en": "`@app.post(\"/research\")` is a **decorator with an argument**: `app.post(\"/research\")` runs first and returns the real decorator, which then decorates the function below. Like `@agent` above, it **registers**: it notes in a “path → function” table that `/research` is handled by this function. When a request arrives, the server looks up the path and calls the function.\n\nA plain-Python simulation (FastAPI's real code is more involved, but the idea is the same):",
   "code": {
    "zh": "routes = {}                          # 路径 -> 处理这个路径的函数\n\ndef post(path):                      # 带参数的装饰器：先收下路径……\n    def register(func):              # ……再收下被装饰的函数\n        routes[path] = func          # 登记：这个路径交给这个函数\n        return func\n    return register\n\n@post(\"/research\")                   # 等于 research = post(\"/research\")(research)\ndef research(body):\n    return {\"topic\": body[\"topic\"], \"report\": \"（这里会运行 crew）\"}\n\n# 模拟服务器收到一个请求：按路径找到函数，把请求体交给它\nrequest = {\"path\": \"/research\", \"body\": {\"topic\": \"AI LLMs\"}}\nhandler = routes[request[\"path\"]]\nprint(handler(request[\"body\"]))\nprint(list(routes))",
    "en": "routes = {}                          # path -> the function that handles it\n\ndef post(path):                      # a decorator with an argument: first it takes the path...\n    def register(func):              # ...then the decorated function\n        routes[path] = func          # record: this path is handled by this function\n        return func\n    return register\n\n@post(\"/research\")                   # same as research = post(\"/research\")(research)\ndef research(body):\n    return {\"topic\": body[\"topic\"], \"report\": \"(the crew would run here)\"}\n\n# Pretend the server got a request: look up the function by path and pass it the body\nrequest = {\"path\": \"/research\", \"body\": {\"topic\": \"AI LLMs\"}}\nhandler = routes[request[\"path\"]]\nprint(handler(request[\"body\"]))\nprint(list(routes))"
   },
   "note": {
    "zh": "除了 `post`，还有 `@app.get`、`@app.put`、`@app.delete` 等，分别对应不同的 HTTP 方法。提交数据、让服务器去做事（比如运行 crew）一般用 POST。",
    "en": "Besides `post` there are `@app.get`, `@app.put`, `@app.delete` and so on, one per HTTP method. Sending data or asking the server to do work (like running a crew) usually uses POST."
   }
  },
  {
   "t": "py",
   "title": {
    "zh": "请求模型：用 BaseModel 规定请求体",
    "en": "Request models: describing the body with BaseModel"
   },
   "zh": "11、12 节用 pydantic 的 `BaseModel` 定义过数据格式，这里用它定义**请求体**。把函数参数写成 `req: ResearchRequest`，FastAPI 就会：\n- 把收到的 JSON 转成 `ResearchRequest` 对象，用 `req.topic` 取值\n- 先检查字段和类型，不对就直接返回 **422** 错误，你的函数根本不会被调用\n- 在 `/docs` 页面自动生成说明和「Try it out」表单\n\n（这段代码需要 pydantic，网页里不能运行。）",
   "en": "Lessons 11 and 12 used pydantic's `BaseModel` to define data shapes; here it describes the **request body**. With the parameter `req: ResearchRequest`, FastAPI:\n- turns the incoming JSON into a `ResearchRequest` object you read with `req.topic`\n- checks fields and types first, answering **422** on its own if they are wrong – your function is never called\n- documents it on the `/docs` page with a “Try it out” form\n\n(This needs pydantic, so it cannot run in the browser.)",
   "code": {
    "zh": "from pydantic import BaseModel\n\nclass ResearchRequest(BaseModel):\n    topic: str                       # 请求体必须有 topic，而且是字符串\n\n# FastAPI 收到的 JSON：{\"topic\": \"AI LLMs\"}\n#   -> 自动变成 ResearchRequest(topic=\"AI LLMs\")，在函数里用 req.topic 取值\n# 收到 {\"title\": \"AI\"}（缺了 topic）\n#   -> 函数根本不会被调用，FastAPI 直接返回 422：\n#      {\"detail\": [{\"type\": \"missing\", \"loc\": [\"body\", \"topic\"], \"msg\": \"Field required\", ...}]}",
    "en": "from pydantic import BaseModel\n\nclass ResearchRequest(BaseModel):\n    topic: str                       # the body must contain topic, as a string\n\n# JSON received by FastAPI: {\"topic\": \"AI LLMs\"}\n#   -> becomes ResearchRequest(topic=\"AI LLMs\"); read it with req.topic\n# Received {\"title\": \"AI\"} (no topic)\n#   -> your function is never called; FastAPI answers 422 by itself:\n#      {\"detail\": [{\"type\": \"missing\", \"loc\": [\"body\", \"topic\"], \"msg\": \"Field required\", ...}]}"
   },
   "run": false
  },
  {
   "t": "p",
   "zh": "[▶ 28:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1699) 视频逐段讲了 `main` 脚本，结构是：\n1. 文件开头是模型的全局配置（三套）和端口 8012\n2. [▶ 29:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1761) `app = FastAPI(lifespan=...)`：`lifespan` 函数分成两半，`yield` 之前在**服务启动时**执行——按标志位把对应模型的地址、key、模型名写进环境变量；`yield` 之后在**服务关闭时**执行——视频只打印了一句「正在关闭」，实际项目可以在这里做清理\n3. [▶ 29:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1795) 一个 POST 接口：从请求体里取出用户的问题当作 `topic`，调用 `run(topic)`，也就是 `模板的 crew 类().crew().kickoff(inputs=...)`\n4. [▶ 31:29](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1889) 把结果对象转成字符串，按请求选择流式或非流式返回\n\n`practice/l51_api_solution.py` 按这个结构写，模型固定用 DeepSeek。先看最简单的 `/research` 接口：",
   "en": "[▶ 28:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1699) The video walks through the `main` script. Its structure:\n1. At the top, the global model settings (three sets) and port 8012\n2. [▶ 29:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1761) `app = FastAPI(lifespan=...)`: `lifespan` has two halves – before `yield` it runs **at startup**, writing the chosen model's address, key and name into environment variables; after `yield` it runs **at shutdown** – the video only prints “Shutting down”, but real projects clean up here\n3. [▶ 29:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1795) A POST endpoint: takes the user's question from the body as `topic` and calls `run(topic)`, i.e. `TemplateCrew().crew().kickoff(inputs=...)`\n4. [▶ 31:29](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1889) Turns the result object into a string and returns it, streamed or not, as requested\n\n`practice/l51_api_solution.py` follows this structure, always using DeepSeek. First the simplest endpoint, `/research`:"
  },
  {
   "t": "code",
   "file": {
    "zh": "practice/l51_api_solution.py（节选 / excerpt）",
    "en": "practice/l51_api_solution.py (excerpt)"
   },
   "code": {
    "zh": "import os\nfrom contextlib import asynccontextmanager\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nimport uvicorn\nfrom fastapi import FastAPI\nfrom pydantic import BaseModel\n\nfrom l51_yaml_crew import ReportCrew, make_inputs, use_deepseek_env   # 视频：导入模板生成的 crew 类\n\n\n@asynccontextmanager\nasync def lifespan(app: FastAPI):\n    use_deepseek_env()                  # 启动时执行一次：配置模型（视频按标志位选 OneAPI / Ollama / OpenAI）\n    print(\"模型配置完成，服务启动\")\n    yield                               # 服务运行期间停在这里\n    print(\"正在关闭\")                    # 关闭时执行：可以做清理\n\n\napp = FastAPI(title=\"研究报告服务\", lifespan=lifespan)\n\n\nclass ResearchRequest(BaseModel):\n    topic: str\n\n\n@app.post(\"/research\")                  # POST http://127.0.0.1:8012/research\nasync def research(req: ResearchRequest):\n    crew = ReportCrew().crew()          # 每个请求新建一个 crew\n    result = await crew.kickoff_async(inputs=make_inputs(req.topic))\n    return {\"topic\": req.topic, \"report\": result.raw}   # 字典会自动变成 JSON\n\n\nif __name__ == \"__main__\":\n    uvicorn.run(app, host=\"127.0.0.1\", port=8012)",
    "en": "import os\nfrom contextlib import asynccontextmanager\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nimport uvicorn\nfrom fastapi import FastAPI\nfrom pydantic import BaseModel\n\nfrom l51_yaml_crew import ReportCrew, make_inputs, use_deepseek_env   # video: import the template's crew class\n\n\n@asynccontextmanager\nasync def lifespan(app: FastAPI):\n    use_deepseek_env()                  # runs once at startup: configure the model (the video picks OneAPI / Ollama / OpenAI)\n    print(\"Model configured, server starting\")\n    yield                               # the server runs while we wait here\n    print(\"Shutting down\")              # runs at shutdown: clean-up goes here\n\n\napp = FastAPI(title=\"Research report service\", lifespan=lifespan)\n\n\nclass ResearchRequest(BaseModel):\n    topic: str\n\n\n@app.post(\"/research\")                  # POST http://127.0.0.1:8012/research\nasync def research(req: ResearchRequest):\n    crew = ReportCrew().crew()          # a fresh crew for every request\n    result = await crew.kickoff_async(inputs=make_inputs(req.topic))\n    return {\"topic\": req.topic, \"report\": result.raw}   # the dict becomes JSON automatically\n\n\nif __name__ == \"__main__\":\n    uvicorn.run(app, host=\"127.0.0.1\", port=8012)"
   }
  },
  {
   "t": "p",
   "zh": "`lifespan` 要用标准库 `contextlib` 里的 `@asynccontextmanager` 装饰。它把一个带 `yield` 的函数变成 11 节讲过的「打开 → 使用 → 关闭」结构：FastAPI 启动时运行到 `yield` 停下，服务一直在 `yield` 这里运行，关闭时再从 `yield` 往下执行。`yield` 本身在 38 节讲。",
   "en": "`lifespan` is decorated with `@asynccontextmanager` from the standard library's `contextlib`. It turns a function with a `yield` into the “open → use → close” shape from lesson 11: FastAPI runs it up to `yield` at startup, the server runs while it waits at `yield`, and at shutdown it continues after `yield`. `yield` itself is covered in lesson 38."
  },
  {
   "t": "warn",
   "zh": "`async def` 的接口里**不要**直接调用 `crew.kickoff()`。它要跑一两分钟，会卡住整个服务的事件循环（09 节讲过），这期间别的请求都得等。两种正确写法：\n- `async def` + `await crew.kickoff_async(...)`：CrewAI 在后台线程里运行 crew（本机源码里就是用 `asyncio.to_thread` 包了一层 `kickoff`）\n- 普通 `def` + `crew.kickoff(...)`：FastAPI 会自动把普通函数放到线程池里运行\n\n另外，每个请求都新建一个 crew，不要让多个请求共用同一个 crew 对象。",
   "en": "Inside an `async def` endpoint, **don't** call `crew.kickoff()` directly. It runs for a minute or two and blocks the server's event loop (lesson 09), so every other request waits. Two correct options:\n- `async def` + `await crew.kickoff_async(...)`: CrewAI runs the crew in a worker thread (the installed source wraps `kickoff` in `asyncio.to_thread`)\n- a plain `def` + `crew.kickoff(...)`: FastAPI runs plain functions in a thread pool for you\n\nAlso build a fresh crew for every request instead of sharing one crew object."
  },
  {
   "t": "code",
   "file": "PowerShell",
   "lang": "powershell",
   "code": {
    "zh": "# 终端 1：启动服务（Ctrl+C 停止）/ terminal 1: start the server (Ctrl+C to stop)\ncd practice\n& ..\\.venv-crewai\\Scripts\\python.exe l51_api_solution.py\n\n# 终端 2：运行客户端 / terminal 2: run the client\ncd practice\n& ..\\.venv-crewai\\Scripts\\python.exe l51_api_client.py\n& ..\\.venv-crewai\\Scripts\\python.exe l51_api_client.py \"AI LLMs\" --openai\n& ..\\.venv-crewai\\Scripts\\python.exe l51_api_client.py \"AI LLMs\" --stream",
    "en": "# terminal 1: start the server (Ctrl+C to stop)\ncd practice\n& ..\\.venv-crewai\\Scripts\\python.exe l51_api_solution.py\n\n# terminal 2: run the client\ncd practice\n& ..\\.venv-crewai\\Scripts\\python.exe l51_api_client.py\n& ..\\.venv-crewai\\Scripts\\python.exe l51_api_client.py \"AI LLMs\" --openai\n& ..\\.venv-crewai\\Scripts\\python.exe l51_api_client.py \"AI LLMs\" --stream"
   },
   "note": {
    "zh": "服务启动后，也可以在浏览器打开 `http://127.0.0.1:8012/docs`，展开 POST /research → Try it out → 填写 topic → Execute。",
    "en": "Once the server is up you can also open `http://127.0.0.1:8012/docs`, expand POST /research → Try it out → fill in topic → Execute."
   }
  },
  {
   "t": "p",
   "zh": "[▶ 32:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1950) 视频的 `apitest` 脚本做三件事：拼出服务地址（本机 `localhost:8012`），构造请求体（用户输入 + 是否流式），用 `requests.post` 发出去，再把返回的 JSON 解析出来。`l51_api_client.py` 用的是 05 节学过的 httpx，写法和 requests 几乎一样：",
   "en": "[▶ 32:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=1950) The video's `apitest` script builds the server address (`localhost:8012`), builds a body (the user's input + whether to stream), sends it with `requests.post` and parses the returned JSON. `l51_api_client.py` uses httpx from lesson 05, which is written almost the same way:"
  },
  {
   "t": "code",
   "file": {
    "zh": "practice/l51_api_client.py（节选 / excerpt）",
    "en": "practice/l51_api_client.py (excerpt)"
   },
   "code": {
    "zh": "import httpx\n\n# crew 要跑一两分钟，timeout 要设长（httpx 默认只等 5 秒）\nresponse = httpx.post(\n    \"http://127.0.0.1:8012/research\",\n    json={\"topic\": \"AI LLMs\"},        # json= 会把字典转成 JSON 请求体\n    timeout=600,\n)\nresponse.raise_for_status()           # 状态码不是 2xx 就抛出异常\nprint(response.json()[\"report\"])      # 把返回的 JSON 变回字典，取出报告",
    "en": "import httpx\n\n# a crew takes a minute or two, so use a long timeout (httpx waits only 5 s by default)\nresponse = httpx.post(\n    \"http://127.0.0.1:8012/research\",\n    json={\"topic\": \"AI LLMs\"},        # json= turns the dict into a JSON body\n    timeout=600,\n)\nresponse.raise_for_status()           # raise unless the status code is 2xx\nprint(response.json()[\"report\"])      # turn the JSON back into a dict and take the report"
   }
  },
  {
   "t": "check",
   "q": {
    "zh": "客户端发送了 `{\"title\": \"AI\"}`，而请求模型只有 `topic: str`。会发生什么？",
    "en": "The client sends `{\"title\": \"AI\"}` but the request model only has `topic: str`. What happens?"
   },
   "options": [
    {
     "zh": "FastAPI 返回 422，提示缺少 topic，接口函数不会运行",
     "en": "FastAPI answers 422 saying topic is missing; the endpoint function never runs"
    },
    {
     "zh": "接口函数照常运行，`req.topic` 是空字符串",
     "en": "The function runs with `req.topic` set to an empty string"
    },
    {
     "zh": "crew 把 title 当成 topic 使用",
     "en": "The crew uses title as the topic"
    }
   ],
   "answer": 0,
   "explain": {
    "zh": "请求体先按请求模型检查，缺字段或类型不对时 FastAPI 直接返回 422（本机测试：`\"type\": \"missing\", \"loc\": [\"body\", \"topic\"]`），不会进入你的函数。",
    "en": "The body is checked against the model first; a missing field or wrong type gets a 422 (tested locally: `\"type\": \"missing\", \"loc\": [\"body\", \"topic\"]`) before your function is entered."
   }
  },
  {
   "t": "p",
   "zh": "视频的接口其实不是简单的 `/research`：请求体里带着用户的消息和「是否流式」两项，服务从消息里取出用户的问题当作主题，跑完 crew 后把报告封装成 JSON 返回，分流式、非流式两种。这种「消息列表 + 是否流式」的格式和 OpenAI 的聊天接口一样，所以 `l51_api_solution.py` 干脆按 OpenAI 的格式来实现。好处是：**任何会调用 OpenAI 的程序都能直接调用你的 crew**，包括 04 节写过的代码。",
   "en": "The video's endpoint is actually more than a simple `/research`: the request body carries the user's messages and a “stream or not” flag, the server takes the user's question from the messages as the topic, runs the crew, and wraps the report in JSON, either streamed or not. This “message list + stream flag” format is the same as OpenAI's chat API, so `l51_api_solution.py` simply implements OpenAI's format. The payoff: **any program that can call OpenAI can call your crew directly**, including the code you wrote in lesson 04."
  },
  {
   "t": "code",
   "file": {
    "zh": "l51_api_solution.py + l51_api_client.py（节选 / excerpt）",
    "en": "l51_api_solution.py + l51_api_client.py (excerpt)"
   },
   "code": {
    "zh": "# 服务端（节选自 l51_api_solution.py）：模仿 OpenAI 的 /v1/chat/completions\nclass ChatRequest(BaseModel):\n    model: str = \"report-crew\"\n    messages: list[dict]\n    stream: bool = False                           # 是否流式返回\n\n\n@app.post(\"/v1/chat/completions\")\nasync def chat_completions(req: ChatRequest):\n    topic = req.messages[-1][\"content\"]            # 最后一条用户消息当作主题\n    result = await ReportCrew().crew().kickoff_async(inputs=make_inputs(topic))\n    text = str(result)                             # 结果对象转成字符串（等于 result.raw）\n    if req.stream:\n        return chat_stream(text, req.model)        # 切成小段，按 SSE 格式一段段发\n    return chat_response(text, req.model)          # 按 OpenAI 的格式一次返回\n\n\n# 客户端：直接用 OpenAI SDK，把 base_url 指向自己的服务\nfrom openai import OpenAI\nclient = OpenAI(base_url=\"http://127.0.0.1:8012/v1\", api_key=\"not-needed\", timeout=600)\nr = client.chat.completions.create(model=\"crew\", messages=[{\"role\": \"user\", \"content\": \"AI LLMs\"}])\nprint(r.choices[0].message.content)               # 和 04 节一样的取值路径",
    "en": "# Server (excerpt of l51_api_solution.py): mimic OpenAI's /v1/chat/completions\nclass ChatRequest(BaseModel):\n    model: str = \"report-crew\"\n    messages: list[dict]\n    stream: bool = False                           # stream the reply or not\n\n\n@app.post(\"/v1/chat/completions\")\nasync def chat_completions(req: ChatRequest):\n    topic = req.messages[-1][\"content\"]            # the last user message is the topic\n    result = await ReportCrew().crew().kickoff_async(inputs=make_inputs(topic))\n    text = str(result)                             # turn the result object into a string (same as result.raw)\n    if req.stream:\n        return chat_stream(text, req.model)        # cut into pieces, sent one by one as SSE\n    return chat_response(text, req.model)          # one reply in OpenAI's format\n\n\n# Client: the plain OpenAI SDK, with base_url pointing at our own server\nfrom openai import OpenAI\nclient = OpenAI(base_url=\"http://127.0.0.1:8012/v1\", api_key=\"not-needed\", timeout=600)\nr = client.chat.completions.create(model=\"crew\", messages=[{\"role\": \"user\", \"content\": \"AI LLMs\"}])\nprint(r.choices[0].message.content)               # the same path as in lesson 04"
   },
   "note": {
    "zh": "`chat_stream` 用 38 节的生成器把报告切成小段，按 OpenAI 的流式格式（`data: {...}` 一行一段，最后 `data: [DONE]`）发出去，客户端用 09 节的写法 `print(delta.content or \"\")` 接收。注意 crew 要全部跑完才有报告，所以这里的「流式」只是把现成的结果分段发送。服务端和三种客户端调用（`/research`、`--openai`、`--stream`）都在本机用模拟模型完整测试过。",
    "en": "`chat_stream` uses a generator (lesson 38) to cut the report into pieces and send them in OpenAI's streaming format (one `data: {...}` line per piece, then `data: [DONE]`); the client receives them with `print(delta.content or \"\")` as in lesson 09. The crew has to finish before there is a report, so this “streaming” just sends a finished result in pieces. The server and all three client modes (`/research`, `--openai`, `--stream`) were tested end to end locally against a mock model."
   }
  },
  {
   "t": "h",
   "zh": "八、换模型的效果差别",
   "en": "8. How much the model matters"
  },
  {
   "t": "p",
   "zh": "[▶ 36:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=2170) 最后老师把标志位换成 Ollama，用本地的 Llama 3.1 8B 再跑一次。第一次返回了 500 错误，他解释是自己网络的问题，重启服务后就好了。[▶ 37:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=2273) 本地模型的结果很单薄：研究员只找出 3 条，报告也跟着变差。[▶ 38:56](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=2336) 他的结论：GPT-4o-mini 效果好、速度快；qwen-max 也能用，但慢一些，还多给了 5 条；本地 8B 模型跑得吃力、效果不理想（也和电脑配置有关）。\n\n要点：**多 Agent 协作对模型理解和遵循指令的能力要求很高**，小模型容易跑偏。换模型后要重新检查每个 Agent 的输出，再决定要不要改提示词。",
   "en": "[▶ 36:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=2170) Finally the instructor switches the flag to Ollama and runs the local Llama 3.1 8B. The first attempt returns a 500 error, which he puts down to his own network; after restarting the server it works. [▶ 37:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=2273) The local model's result is thin: the researcher finds only 3 points, and the report suffers with it. [▶ 38:56](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=52&t=2336) His verdict: GPT-4o-mini is good and fast; qwen-max works but is slower and gave 5 extra points; the local 8B model struggles and disappoints (his hardware plays a part too).\n\nTakeaway: **multi-agent collaboration demands a model that understands and follows instructions well**, and small models drift easily. After switching models, check each agent's output again before deciding whether to change the prompts."
  }
 ],
 "quiz": [
  {
   "q": {
    "zh": "`role`、`goal`、`backstory` 是哪个类的参数？",
    "en": "`role`, `goal` and `backstory` are parameters of which class?"
   },
   "options": [
    {
     "zh": "Task",
     "en": "Task"
    },
    {
     "zh": "Crew",
     "en": "Crew"
    },
    {
     "zh": "Agent",
     "en": "Agent"
    },
    {
     "zh": "LLM",
     "en": "LLM"
    }
   ],
   "answer": 2,
   "explain": {
    "zh": "它们定义一个 Agent 的「人设」，会被写进发给模型的系统提示词。Task 用的是 `description`、`expected_output`、`agent`。",
    "en": "They define an agent's persona and go into the system prompt. A Task uses `description`, `expected_output` and `agent`."
   }
  },
  {
   "q": {
    "zh": "YAML 里写了 `{topic}`，运行时却调用了 `crew.kickoff()`，没有传 `inputs`。结果是？",
    "en": "The YAML uses `{topic}`, but you call `crew.kickoff()` without `inputs`. What happens?"
   },
   "options": [
    {
     "zh": "报 ValueError，提示缺少 topic",
     "en": "A ValueError about the missing topic"
    },
    {
     "zh": "不报错，`{topic}` 原样发给模型，结果文不对题",
     "en": "No error; `{topic}` is sent literally and the result is off-topic"
    },
    {
     "zh": "CrewAI 自动让模型猜一个主题",
     "en": "CrewAI asks the model to guess a topic"
    },
    {
     "zh": "程序卡住等待输入",
     "en": "The program waits for input"
    }
   ],
   "answer": 1,
   "explain": {
    "zh": "本机验证：完全不传 `inputs` 时占位符保持原样、不会报错；传了 `inputs` 但缺了某个占位符时才报 `Template variable ... not found`。",
    "en": "Verified locally: with no `inputs` the placeholders stay as they are and nothing fails; only `inputs` missing a placeholder raises `Template variable ... not found`."
   }
  },
  {
   "q": {
    "zh": "官方模板 `crew.py` 里的 Agent 没有写 `llm=`。CrewAI 怎么知道用哪个模型？",
    "en": "The agents in the template's `crew.py` have no `llm=`. How does CrewAI know which model to use?"
   },
   "options": [
    {
     "zh": "创建 Agent 时直接报错，必须写 `llm=`",
     "en": "It fails when the agent is created; `llm=` is required"
    },
    {
     "zh": "自动用 DeepSeek",
     "en": "It uses DeepSeek automatically"
    },
    {
     "zh": "每次运行时在终端里问你",
     "en": "It asks you in the terminal on every run"
    },
    {
     "zh": "从环境变量里读模型名、地址和 key（模板写在 `.env` 里；没设置就用默认的 gpt-4.1-mini）",
     "en": "It reads the model name, address and key from environment variables (the template keeps them in `.env`; without them it uses the default gpt-4.1-mini)"
    }
   ],
   "answer": 3,
   "explain": {
    "zh": "CrewAI 读 `OPENAI_MODEL_NAME`/`MODEL`、`OPENAI_API_BASE`/`OPENAI_BASE_URL`、`OPENAI_API_KEY`。视频的 `main` 脚本在 `lifespan` 里设置它们；忘了设置时，会用默认的 `gpt-4.1-mini` 并在调用时报 `OPENAI_API_KEY is required`。",
    "en": "CrewAI reads `OPENAI_MODEL_NAME`/`MODEL`, `OPENAI_API_BASE`/`OPENAI_BASE_URL` and `OPENAI_API_KEY`. The video's `main` script sets them in `lifespan`; if you forget, it falls back to `gpt-4.1-mini` and fails at call time with `OPENAI_API_KEY is required`."
   }
  },
  {
   "q": {
    "zh": "下面哪个接口写法会让服务在 crew 运行期间无法处理其他请求？",
    "en": "Which endpoint blocks the server from handling other requests while the crew runs?"
   },
   "options": [
    {
     "zh": "普通函数：`def research(req): return build_crew().kickoff(...)`",
     "en": "A plain function: `def research(req): return build_crew().kickoff(...)`"
    },
    {
     "zh": "异步函数 + 异步启动：`async def research(req): await build_crew().kickoff_async(...)`",
     "en": "Async function + async kickoff: `async def research(req): await build_crew().kickoff_async(...)`"
    },
    {
     "zh": "异步函数里直接调用：`async def research(req): build_crew().kickoff(...)`",
     "en": "A direct call inside async: `async def research(req): build_crew().kickoff(...)`"
    },
    {
     "zh": "三种都不会",
     "en": "None of them"
    }
   ],
   "answer": 2,
   "explain": {
    "zh": "`async def` 里直接调用耗时的同步函数会占住事件循环。普通 `def` 会被 FastAPI 放进线程池；`kickoff_async` 会在后台线程里运行。",
    "en": "A long synchronous call inside `async def` holds the event loop. A plain `def` runs in FastAPI's thread pool; `kickoff_async` runs in a worker thread."
   }
  },
  {
   "q": {
    "zh": "`lifespan` 函数里写在 `yield` **之前**的代码什么时候执行？",
    "en": "When does the code **before** `yield` in a `lifespan` function run?"
   },
   "options": [
    {
     "zh": "每个请求到来时",
     "en": "Whenever a request arrives"
    },
    {
     "zh": "服务启动时，只执行一次",
     "en": "Once, when the server starts"
    },
    {
     "zh": "服务关闭时",
     "en": "When the server shuts down"
    },
    {
     "zh": "从不执行，除非手动调用",
     "en": "Never, unless you call it yourself"
    }
   ],
   "answer": 1,
   "explain": {
    "zh": "`yield` 之前的部分在启动时运行一次（视频在这里配置模型），`yield` 之后的部分在关闭时运行一次（视频打印「正在关闭」）。",
    "en": "The part before `yield` runs once at startup (the video configures the model there) and the part after it runs once at shutdown (the video prints “Shutting down”)."
   }
  },
  {
   "q": {
    "zh": "客户端写成 `httpx.post(url, json={...})`，没有设置 timeout，经常报 `ReadTimeout`。原因是？",
    "en": "The client uses `httpx.post(url, json={...})` without a timeout and often gets `ReadTimeout`. Why?"
   },
   "options": [
    {
     "zh": "httpx 默认只等 5 秒，而 crew 要跑一两分钟",
     "en": "httpx waits only 5 s by default, but a crew takes a minute or two"
    },
    {
     "zh": "服务端没有启动",
     "en": "The server isn't running"
    },
    {
     "zh": "json= 应该写成 data=",
     "en": "json= should be data="
    },
    {
     "zh": "DeepSeek 不支持 POST",
     "en": "DeepSeek doesn't support POST"
    }
   ],
   "answer": 0,
   "explain": {
    "zh": "调用多 Agent 服务要把 timeout 设长，例如 `timeout=600`。服务没启动时报的是连接错误（ConnectError），不是超时。",
    "en": "Use a long timeout such as `timeout=600` for a multi-agent service. If the server were down you'd get a ConnectError, not a timeout."
   }
  }
 ],
 "fill": [
  {
   "title": {
    "zh": "组一个两人小组",
    "en": "Build a two-agent crew"
   },
   "code": {
    "zh": "llm = LLM(model=f\"[[openai]]/{MODEL}\", [[base_url]]=BASE_URL, api_key=API_KEY)\n\nresearcher = Agent(\n    [[role]]=\"{topic} 高级数据研究员\",\n    goal=\"发掘 {topic} 领域的前沿进展\",\n    [[backstory]]=\"你是经验丰富的研究员。\",\n    llm=llm,\n)\nresearch_task = Task(\n    description=\"对 {topic} 做一次深入的调研。\",\n    [[expected_output]]=\"10 个要点的列表\",\n    agent=[[researcher]],\n)\ncrew = Crew(agents=[researcher, reporting_analyst], tasks=[research_task, reporting_task],\n            process=Process.[[sequential]])\nresult = crew.kickoff([[inputs]]={\"topic\": \"AI LLMs\"})\nprint(result.[[raw]])",
    "en": "llm = LLM(model=f\"[[openai]]/{MODEL}\", [[base_url]]=BASE_URL, api_key=API_KEY)\n\nresearcher = Agent(\n    [[role]]=\"{topic} Senior Data Researcher\",\n    goal=\"Uncover cutting-edge developments in {topic}\",\n    [[backstory]]=\"You are a seasoned researcher.\",\n    llm=llm,\n)\nresearch_task = Task(\n    description=\"Research {topic} thoroughly.\",\n    [[expected_output]]=\"A list of 10 bullet points\",\n    agent=[[researcher]],\n)\ncrew = Crew(agents=[researcher, reporting_analyst], tasks=[research_task, reporting_task],\n            process=Process.[[sequential]])\nresult = crew.kickoff([[inputs]]={\"topic\": \"AI LLMs\"})\nprint(result.[[raw]])"
   },
   "explain": {
    "zh": "模型前缀 `openai/` + `base_url`；Agent 三件套 role / goal / backstory；Task 要写 expected_output 并指定 agent；顺序流程；`inputs` 填占位符；`.raw` 取最终文字。",
    "en": "The `openai/` prefix + `base_url`; the agent trio role / goal / backstory; a task needs expected_output and an agent; a sequential process; `inputs` fills the placeholders; `.raw` is the final text."
   }
  },
  {
   "title": {
    "zh": "官方模板写法：环境变量 + @CrewBase",
    "en": "Template style: environment variables + @CrewBase"
   },
   "code": "def use_deepseek_env():\n    os.environ[\"[[OPENAI_API_BASE]]\"] = BASE_URL\n    os.environ[\"OPENAI_API_KEY\"] = API_KEY\n    os.environ[\"[[OPENAI_MODEL_NAME]]\"] = MODEL\n\n\n@[[CrewBase]]\nclass ReportCrew:\n    agents_config = \"data/l51_agents.yaml\"\n    [[tasks_config]] = \"data/l51_tasks.yaml\"\n\n    @[[agent]]\n    def researcher(self) -> Agent:\n        return Agent(config=self.agents_config[\"[[researcher]]\"], verbose=True)\n\n    @task\n    def research_task(self) -> Task:\n        return Task(config=self.tasks_config[\"research_task\"])\n\n    @[[crew]]\n    def crew(self) -> Crew:\n        return Crew(agents=self.[[agents]], tasks=self.tasks, process=Process.sequential)\n\n\nuse_deepseek_env()\nresult = ReportCrew().crew().kickoff(inputs={\"topic\": \"AI LLMs\", \"current_year\": \"2026\"})",
   "explain": {
    "zh": "模板的 Agent 不写 `llm=`，靠 `OPENAI_API_BASE` / `OPENAI_API_KEY` / `OPENAI_MODEL_NAME`；类用 `@CrewBase` 装饰，`agents_config` / `tasks_config` 指向 YAML；`@agent` 方法名和 YAML 的键对应；`@crew` 里用 `self.agents`、`self.tasks`。",
    "en": "Template agents have no `llm=` and rely on `OPENAI_API_BASE` / `OPENAI_API_KEY` / `OPENAI_MODEL_NAME`; the class is decorated with `@CrewBase` and `agents_config` / `tasks_config` point at the YAML; `@agent` method names match the YAML keys; `@crew` uses `self.agents` and `self.tasks`."
   }
  },
  {
   "title": {
    "zh": "FastAPI 包装（含 lifespan）",
    "en": "Wrap it with FastAPI (with lifespan)"
   },
   "code": {
    "zh": "@[[asynccontextmanager]]\nasync def lifespan(app: FastAPI):\n    use_deepseek_env()\n    print(\"服务启动\")\n    [[yield]]\n    print(\"正在关闭\")\n\napp = [[FastAPI]](lifespan=[[lifespan]])\n\nclass ResearchRequest([[BaseModel]]):\n    topic: [[str]]\n\n@app.[[post]](\"/research\")\nasync def research(req: [[ResearchRequest]]):\n    result = [[await]] ReportCrew().crew().[[kickoff_async]](inputs=make_inputs(req.[[topic]]))\n    return {\"topic\": req.topic, \"report\": result.raw}\n\nif __name__ == \"__main__\":\n    uvicorn.[[run]](app, host=\"127.0.0.1\", port=8012)",
    "en": "@[[asynccontextmanager]]\nasync def lifespan(app: FastAPI):\n    use_deepseek_env()\n    print(\"Server starting\")\n    [[yield]]\n    print(\"Shutting down\")\n\napp = [[FastAPI]](lifespan=[[lifespan]])\n\nclass ResearchRequest([[BaseModel]]):\n    topic: [[str]]\n\n@app.[[post]](\"/research\")\nasync def research(req: [[ResearchRequest]]):\n    result = [[await]] ReportCrew().crew().[[kickoff_async]](inputs=make_inputs(req.[[topic]]))\n    return {\"topic\": req.topic, \"report\": result.raw}\n\nif __name__ == \"__main__\":\n    uvicorn.[[run]](app, host=\"127.0.0.1\", port=8012)"
   },
   "explain": {
    "zh": "`@asynccontextmanager` + `yield` 分出启动和关闭两段；`FastAPI(lifespan=lifespan)`；请求模型继承 `BaseModel`；`@app.post` 登记路径；`await` + `kickoff_async` 不阻塞服务；`uvicorn.run` 启动。",
    "en": "`@asynccontextmanager` + `yield` split startup from shutdown; `FastAPI(lifespan=lifespan)`; the request model extends `BaseModel`; `@app.post` registers the path; `await` + `kickoff_async` keeps the server free; `uvicorn.run` starts it."
   }
  }
 ],
 "write": [
  {
   "title": {
    "zh": "手写：研究员 → 报告分析员两人小组",
    "en": "Write it: a researcher → reporting analyst crew"
   },
   "task": {
    "zh": "不看上面的代码，在 `.venv-crewai` 里写出：\n1. 用 `LLM` 把 CrewAI 接到 DeepSeek\n2. 两个 Agent（role 里用 `{topic}`）\n3. 两个 Task，分别交给两个 Agent\n4. 按顺序执行的 Crew，用 `inputs` 把主题填进去，打印 `result.raw`\n\n写完复制到 `practice` 里的新文件，用 `.venv-crewai` 运行。也可以直接补全 `practice/l51_crew_todo.py`。",
    "en": "Without looking at the code above, write for `.venv-crewai`:\n1. an `LLM` that connects CrewAI to DeepSeek\n2. two agents (with `{topic}` in the role)\n3. two tasks, one per agent\n4. a sequential crew; fill the topic through `inputs` and print `result.raw`\n\nCopy it into a new file in `practice` and run it with `.venv-crewai`, or complete `practice/l51_crew_todo.py`."
   },
   "starter": {
    "zh": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import LLM, Agent, Crew, Process, Task\nfrom llm import API_KEY, BASE_URL, MODEL\n\n# 1. 创建 llm：协议前缀 + 模型名、base_url、api_key\n\n\n# 2. 两个 Agent：研究员 researcher、报告分析员 reporting_analyst（每个都要角色、目标、背景故事和模型）\n\n\n# 3. 两个 Task：research_task 交给研究员，reporting_task 交给报告分析员\n\n\n# 4. 组成 Crew（按顺序执行），启动时把主题填成「AI LLMs」，打印最终结果的文字\n",
    "en": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import LLM, Agent, Crew, Process, Task\nfrom llm import API_KEY, BASE_URL, MODEL\n\n# 1. Create llm: protocol prefix + model name, base_url, api_key\n\n\n# 2. Two agents: researcher and reporting_analyst (each needs a role, goal, backstory and model)\n\n\n# 3. Two tasks: research_task goes to the researcher, reporting_task to the reporting analyst\n\n\n# 4. Build the crew (sequential), fill the topic with \"AI LLMs\" at kickoff, and print the final result's text\n"
   },
   "solution": {
    "zh": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import LLM, Agent, Crew, Process, Task\nfrom llm import API_KEY, BASE_URL, MODEL\n\n# 1. 创建 llm：协议前缀 + 模型名、base_url、api_key\nllm = LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY)\n\n# 2. 两个 Agent：研究员 researcher、报告分析员 reporting_analyst（每个都要角色、目标、背景故事和模型）\nresearcher = Agent(\n    role=\"{topic} 高级数据研究员\",\n    goal=\"发掘 {topic} 领域的前沿进展\",\n    backstory=\"你是经验丰富的研究员，擅长找到最相关的信息。\",\n    llm=llm,\n)\nreporting_analyst = Agent(\n    role=\"{topic} 报告分析员\",\n    goal=\"根据研究结果写出详细的报告\",\n    backstory=\"你一丝不苟，擅长把复杂信息整理成好懂的报告。\",\n    llm=llm,\n)\n\n# 3. 两个 Task：research_task 交给研究员，reporting_task 交给报告分析员\nresearch_task = Task(\n    description=\"对 {topic} 做一次深入的调研，找出最近有趣且相关的信息。\",\n    expected_output=\"一个包含 10 个要点的列表\",\n    agent=researcher,\n)\nreporting_task = Task(\n    description=\"把研究员的每个要点扩展成报告里的一个小节。\",\n    expected_output=\"一份 Markdown 格式的报告\",\n    agent=reporting_analyst,\n)\n\n# 4. 组成 Crew（按顺序执行），启动时把主题填成「AI LLMs」，打印最终结果的文字\ncrew = Crew(\n    agents=[researcher, reporting_analyst],\n    tasks=[research_task, reporting_task],\n    process=Process.sequential,\n)\nresult = crew.kickoff(inputs={\"topic\": \"AI LLMs\"})\nprint(result.raw)",
    "en": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import LLM, Agent, Crew, Process, Task\nfrom llm import API_KEY, BASE_URL, MODEL\n\n# 1. Create llm: protocol prefix + model name, base_url, api_key\nllm = LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY)\n\n# 2. Two agents: researcher and reporting_analyst (each needs a role, goal, backstory and model)\nresearcher = Agent(\n    role=\"{topic} Senior Data Researcher\",\n    goal=\"Uncover cutting-edge developments in {topic}\",\n    backstory=\"You are a seasoned researcher who is good at finding the most relevant information.\",\n    llm=llm,\n)\nreporting_analyst = Agent(\n    role=\"{topic} Reporting Analyst\",\n    goal=\"Write a detailed report from the research findings\",\n    backstory=\"You are meticulous and good at turning complex information into easy-to-read reports.\",\n    llm=llm,\n)\n\n# 3. Two tasks: research_task goes to the researcher, reporting_task to the reporting analyst\nresearch_task = Task(\n    description=\"Research {topic} thoroughly and find recent, interesting and relevant information.\",\n    expected_output=\"A list of 10 bullet points\",\n    agent=researcher,\n)\nreporting_task = Task(\n    description=\"Expand each of the researcher's points into a section of a report.\",\n    expected_output=\"A report in Markdown format\",\n    agent=reporting_analyst,\n)\n\n# 4. Build the crew (sequential), fill the topic with \"AI LLMs\" at kickoff, and print the final result's text\ncrew = Crew(\n    agents=[researcher, reporting_analyst],\n    tasks=[research_task, reporting_task],\n    process=Process.sequential,\n)\nresult = crew.kickoff(inputs={\"topic\": \"AI LLMs\"})\nprint(result.raw)"
   },
   "checks": [
    {
     "zh": "用 `LLM(model=\"openai/...\")` 创建模型",
     "en": "Creates the model with `LLM(model=\"openai/...\")`",
     "re": "LLM\\(\\s*model\\s*=\\s*f?[\\\"']openai/"
    },
    {
     "zh": "传了 `base_url`（发到 DeepSeek）",
     "en": "Passes `base_url` (to reach DeepSeek)",
     "re": "base_url\\s*=\\s*BASE_URL"
    },
    {
     "zh": "Agent 写了 `role`",
     "en": "An Agent with `role`",
     "re": "Agent\\(\\s*\\n?\\s*role\\s*="
    },
    {
     "zh": "Agent 写了 `backstory`",
     "en": "An Agent with `backstory`",
     "re": "backstory\\s*="
    },
    {
     "zh": "Task 写了 `expected_output`",
     "en": "A Task with `expected_output`",
     "re": "expected_output\\s*="
    },
    {
     "zh": "任务交给研究员：`agent=researcher`",
     "en": "Gives a task to the researcher: `agent=researcher`",
     "re": "agent\\s*=\\s*researcher"
    },
    {
     "zh": "Crew 的 `agents=[...]` 列表",
     "en": "The Crew's `agents=[...]` list",
     "re": "agents\\s*=\\s*\\["
    },
    {
     "zh": "按顺序执行：`Process.sequential`",
     "en": "Sequential: `Process.sequential`",
     "re": "Process\\.sequential"
    },
    {
     "zh": "`kickoff(inputs={\"topic\": ...})`",
     "en": "`kickoff(inputs={\"topic\": ...})`",
     "re": "kickoff\\(\\s*inputs\\s*=\\s*\\{\\s*[\\\"']topic[\\\"']"
    },
    {
     "zh": "打印 `result.raw`",
     "en": "Prints `result.raw`",
     "re": "print\\(\\s*\\w+\\.raw\\s*\\)"
    }
   ]
  },
  {
   "title": {
    "zh": "手写：视频那样的 FastAPI 服务",
    "en": "Write it: a FastAPI service like the video's"
   },
   "task": {
    "zh": "不看上面的代码，写一个 FastAPI 服务（crew 从 `l51_yaml_crew.py` 导入）：\n1. `lifespan`：启动时调用 `use_deepseek_env()` 并打印一句话，关闭时再打印一句话\n2. 创建 `app`，把 `lifespan` 交给它\n3. 请求模型 `ResearchRequest`，只有 `topic: str`\n4. `POST /research`：新建 crew，用 `await ... kickoff_async(inputs=make_inputs(...))` 运行，返回包含 `report` 的字典\n5. 用 uvicorn 在 8012 端口启动\n\n运行后打开 `http://127.0.0.1:8012/docs` 测试，或运行 `l51_api_client.py`。也可以直接补全 `practice/l51_api_todo.py`。",
    "en": "Without looking at the code above, write a FastAPI service (import the crew from `l51_yaml_crew.py`):\n1. `lifespan`: call `use_deepseek_env()` and print a line at startup, print another at shutdown\n2. create `app` and hand it the `lifespan`\n3. a request model `ResearchRequest` with only `topic: str`\n4. `POST /research`: build a crew, run it with `await ... kickoff_async(inputs=make_inputs(...))`, return a dict containing `report`\n5. start it with uvicorn on port 8012\n\nRun it, then test it at `http://127.0.0.1:8012/docs` or with `l51_api_client.py`. You can also complete `practice/l51_api_todo.py` directly."
   },
   "starter": {
    "zh": "import os\nfrom contextlib import asynccontextmanager\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nimport uvicorn\nfrom fastapi import FastAPI\nfrom pydantic import BaseModel\n\nfrom l51_yaml_crew import ReportCrew, make_inputs, use_deepseek_env\n\n# 1. lifespan 函数：启动时配置模型（调用 use_deepseek_env）并打印一句话，关闭时再打印一句话\n\n\n# 2. 创建应用对象，并把 lifespan 交给它\n\n\n# 3. 请求模型：请求体里只有一个字符串字段 topic\n\n\n# 4. 注册「POST /research」：新建 crew，异步启动它，返回主题和报告\n\n\n# 5. 直接运行本文件时，在 127.0.0.1:8012 启动服务\n",
    "en": "import os\nfrom contextlib import asynccontextmanager\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nimport uvicorn\nfrom fastapi import FastAPI\nfrom pydantic import BaseModel\n\nfrom l51_yaml_crew import ReportCrew, make_inputs, use_deepseek_env\n\n# 1. lifespan function: at startup configure the model (call use_deepseek_env) and print a line; print another line at shutdown\n\n\n# 2. Create the application object and hand it the lifespan\n\n\n# 3. Request model: the body has a single string field, topic\n\n\n# 4. Register \"POST /research\": build a crew, start it asynchronously, return the topic and the report\n\n\n# 5. When this file is run directly, start the server on 127.0.0.1:8012\n"
   },
   "solution": {
    "zh": "import os\nfrom contextlib import asynccontextmanager\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nimport uvicorn\nfrom fastapi import FastAPI\nfrom pydantic import BaseModel\n\nfrom l51_yaml_crew import ReportCrew, make_inputs, use_deepseek_env\n\n# 1. lifespan 函数：启动时配置模型（调用 use_deepseek_env）并打印一句话，关闭时再打印一句话\n@asynccontextmanager\nasync def lifespan(app: FastAPI):\n    use_deepseek_env()\n    print(\"服务启动\")\n    yield\n    print(\"正在关闭\")\n\n\n# 2. 创建应用对象，并把 lifespan 交给它\napp = FastAPI(lifespan=lifespan)\n\n\n# 3. 请求模型：请求体里只有一个字符串字段 topic\nclass ResearchRequest(BaseModel):\n    topic: str\n\n\n# 4. 注册「POST /research」：新建 crew，异步启动它，返回主题和报告\n@app.post(\"/research\")\nasync def research(req: ResearchRequest):\n    crew = ReportCrew().crew()\n    result = await crew.kickoff_async(inputs=make_inputs(req.topic))\n    return {\"topic\": req.topic, \"report\": result.raw}\n\n\n# 5. 直接运行本文件时，在 127.0.0.1:8012 启动服务\nif __name__ == \"__main__\":\n    uvicorn.run(app, host=\"127.0.0.1\", port=8012)",
    "en": "import os\nfrom contextlib import asynccontextmanager\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nimport uvicorn\nfrom fastapi import FastAPI\nfrom pydantic import BaseModel\n\nfrom l51_yaml_crew import ReportCrew, make_inputs, use_deepseek_env\n\n# 1. lifespan function: at startup configure the model (call use_deepseek_env) and print a line; print another line at shutdown\n@asynccontextmanager\nasync def lifespan(app: FastAPI):\n    use_deepseek_env()\n    print(\"Server starting\")\n    yield\n    print(\"Shutting down\")\n\n\n# 2. Create the application object and hand it the lifespan\napp = FastAPI(lifespan=lifespan)\n\n\n# 3. Request model: the body has a single string field, topic\nclass ResearchRequest(BaseModel):\n    topic: str\n\n\n# 4. Register \"POST /research\": build a crew, start it asynchronously, return the topic and the report\n@app.post(\"/research\")\nasync def research(req: ResearchRequest):\n    crew = ReportCrew().crew()\n    result = await crew.kickoff_async(inputs=make_inputs(req.topic))\n    return {\"topic\": req.topic, \"report\": result.raw}\n\n\n# 5. When this file is run directly, start the server on 127.0.0.1:8012\nif __name__ == \"__main__\":\n    uvicorn.run(app, host=\"127.0.0.1\", port=8012)"
   },
   "checks": [
    {
     "zh": "`lifespan` 用 `@asynccontextmanager` 装饰",
     "en": "`lifespan` decorated with `@asynccontextmanager`",
     "re": "@asynccontextmanager\\s*\\n\\s*async\\s+def\\s+lifespan"
    },
    {
     "zh": "`lifespan` 里有 `yield`",
     "en": "`lifespan` contains `yield`",
     "re": "^\\s+yield\\s*$"
    },
    {
     "zh": "`FastAPI(lifespan=lifespan)`",
     "en": "`FastAPI(lifespan=lifespan)`",
     "re": "FastAPI\\(\\s*lifespan\\s*=\\s*lifespan"
    },
    {
     "zh": "请求模型继承 `BaseModel`",
     "en": "A request model based on `BaseModel`",
     "re": "class\\s+\\w+\\(\\s*BaseModel\\s*\\)\\s*:"
    },
    {
     "zh": "字段 `topic: str`",
     "en": "Field `topic: str`",
     "re": "^\\s+topic\\s*:\\s*str"
    },
    {
     "zh": "用 `@app.post(\"/research\")` 登记接口",
     "en": "Registers `@app.post(\"/research\")`",
     "re": "@app\\.post\\(\\s*[\\\"']/research[\\\"']\\s*\\)"
    },
    {
     "zh": "参数类型是请求模型",
     "en": "The parameter is typed with the request model",
     "re": "def\\s+\\w+\\(\\s*\\w+\\s*:\\s*ResearchRequest\\s*\\)"
    },
    {
     "zh": "`await` + `kickoff_async`",
     "en": "`await` + `kickoff_async`",
     "re": "await\\s+[\\w.()]*kickoff_async\\("
    },
    {
     "zh": "返回字典里有 `report`",
     "en": "Returns a dict with `report`",
     "re": "return\\s*\\{[^}]*[\\\"']report[\\\"']"
    },
    {
     "zh": "`uvicorn.run(app, ...)` 启动",
     "en": "Starts with `uvicorn.run(app, ...)`",
     "re": "uvicorn\\.run\\(\\s*app"
    }
   ]
  }
 ],
 "pitfalls": [
  {
   "zh": "用 `.venv` 运行 CrewAI 练习，报 `No module named 'crewai'`。本模块要用 `.venv-crewai`。",
   "en": "Running CrewAI exercises with `.venv` and getting `No module named 'crewai'`. This module needs `.venv-crewai`."
  },
  {
   "zh": "`model` 没写 `openai/` 前缀或漏了 `base_url`，请求被发到 OpenAI 官方，报 key 无效之类的认证错误。",
   "en": "`model` without the `openai/` prefix, or a missing `base_url`: requests go to OpenAI itself and fail with an authentication error such as an invalid key."
  },
  {
   "zh": "模板写法的 Agent 没写 `llm=`，又忘了在创建 Agent 之前设置环境变量：CrewAI 悄悄改用 `gpt-4.1-mini`，调用时报 `OPENAI_API_KEY is required`。",
   "en": "Template-style agents without `llm=`, and the environment variables not set before the agents are created: CrewAI quietly uses `gpt-4.1-mini` and fails with `OPENAI_API_KEY is required`."
  },
  {
   "zh": "把任务描述写成 f-string（`f\"调研 {topic}\"`），Python 立刻替换并报 `NameError`。占位符要用普通字符串。",
   "en": "Writing the description as an f-string (`f\"Research {topic}\"`): Python substitutes immediately and raises `NameError`. Placeholders need a plain string."
  },
  {
   "zh": "`inputs` 缺了某个占位符（报 `Template variable ... not found`），比如模板里的 `{current_year}`；或者干脆忘了传 `inputs`（不报错但文不对题）。",
   "en": "`inputs` missing a placeholder such as the template's `{current_year}` (`Template variable ... not found`), or no `inputs` at all (no error, off-topic result)."
  },
  {
   "zh": "`output_file` 写了 `../` 之类的路径，报 `Path traversal attempts are not allowed`；或者没 `cd` 到 `practice`，文件存到了别处。",
   "en": "An `output_file` with `../` in it (`Path traversal attempts are not allowed`), or not `cd`-ing into `practice` so the file lands elsewhere."
  },
  {
   "zh": "在 `async def` 接口里直接调用 `crew.kickoff()`，整个服务被卡住一两分钟。",
   "en": "Calling `crew.kickoff()` directly inside an `async def` endpoint, freezing the whole server for a minute or two."
  },
  {
   "zh": "客户端没设 timeout（httpx 默认 5 秒），crew 还没跑完就报 `ReadTimeout`。",
   "en": "No client timeout (httpx defaults to 5 s), so you get `ReadTimeout` before the crew finishes."
  }
 ],
 "recap": [
  {
   "zh": "智能体 Agent = role + goal + backstory（+ llm、tools）；任务 Task = description + expected_output + agent；团队 Crew = agents + tasks + process。",
   "en": "Agent = role + goal + backstory (+ llm, tools); Task = description + expected_output + agent; Crew = agents + tasks + process."
  },
  {
   "zh": "顺序流程里，前一个任务的输出自动成为下一个任务的上下文；层级流程需要 `manager_llm`。Pipeline 和 `language` 在 1.x 已删除。",
   "en": "In a sequential process each output becomes the next task's context; a hierarchical process needs `manager_llm`. Pipeline and `language` are gone in 1.x."
  },
  {
   "zh": "视频的三种模型（代理 GPT、OneAPI、Ollama）和 DeepSeek 都是 OpenAI 兼容接口，换模型只换地址、key、模型名。",
   "en": "The video's three model routes (proxied GPT, OneAPI, Ollama) and DeepSeek are all OpenAI-compatible: switching means changing address, key and model name."
  },
  {
   "zh": "官方模板：YAML 写提示词，`@CrewBase` 类里用 `@agent` / `@task` / `@crew` 组装；Agent 不写 `llm=` 时，模型来自环境变量（`.env`）。",
   "en": "Official template: prompts in YAML, wired in an `@CrewBase` class with `@agent` / `@task` / `@crew`; agents without `llm=` take the model from environment variables (`.env`)."
  },
  {
   "zh": "手写时用 `LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY)` 显式传给 Agent；`{topic}` 是占位符，`kickoff(inputs=...)` 时才替换；结果看 `result.raw`。",
   "en": "By hand, pass `LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY)` to each agent explicitly; `{topic}` is a placeholder, filled in only at `kickoff(inputs=...)`; read `result.raw`."
  },
  {
   "zh": "FastAPI：`lifespan` 启动时配置模型、关闭时清理；`@app.post(路径)` 登记函数；请求模型继承 `BaseModel`（字段不对返回 422）；`uvicorn.run` 启动。",
   "en": "FastAPI: `lifespan` configures the model at startup and cleans up at shutdown; `@app.post(path)` registers a function; the request model extends `BaseModel` (422 on bad fields); `uvicorn.run` starts it."
  },
  {
   "zh": "接口里用 `await crew.kickoff_async(...)`，每个请求新建 crew；客户端 timeout 要设长；做成 OpenAI 兼容格式后，任何 OpenAI 客户端都能调用。",
   "en": "Use `await crew.kickoff_async(...)` with a fresh crew per request and a long client timeout; an OpenAI-compatible format lets any OpenAI client call it."
  }
 ],
 "files": [
  {
   "zh": "练习：补全两人小组（LLM、两个 Agent、两个 Task、Crew、kickoff）。",
   "en": "Exercise: complete the two-agent crew (LLM, two agents, two tasks, crew, kickoff).",
   "path": "practice/l51_crew_todo.py"
  },
  {
   "zh": "参考答案：同一个案例的单文件写法，`build_crew()` + 运行并打印每个任务的输出。",
   "en": "Solution: the same case in one file, `build_crew()` plus a run that prints every task's output.",
   "path": "practice/l51_crew_solution.py"
  },
  {
   "zh": "视频「测试一」的官方模板写法：`@CrewBase` 类 + YAML，模型来自环境变量（`use_deepseek_env()`）。被 API 文件导入。",
   "en": "The video's test 1, template style: an `@CrewBase` class + YAML, model from environment variables (`use_deepseek_env()`). Imported by the API files.",
   "path": "practice/l51_yaml_crew.py"
  },
  {
   "zh": "模板里的 Agent 定义（中文版）。",
   "en": "The template's agent definitions (Chinese).",
   "path": "practice/data/l51_agents.yaml"
  },
  {
   "zh": "模板里的 Task 定义（中文版，含 `{current_year}`）。",
   "en": "The template's task definitions (Chinese, with `{current_year}`).",
   "path": "practice/data/l51_tasks.yaml"
  },
  {
   "zh": "练习：写 `lifespan` 和 `POST /research` 接口。",
   "en": "Exercise: write `lifespan` and the `POST /research` endpoint.",
   "path": "practice/l51_api_todo.py"
  },
  {
   "zh": "参考答案（视频「测试二」的 main 脚本）：`lifespan` + `POST /research` + OpenAI 兼容接口 `/v1/chat/completions`（流式/非流式），端口 8012。",
   "en": "Solution (the video's test-2 main script): `lifespan` + `POST /research` + the OpenAI-compatible `/v1/chat/completions` (streamed or not), port 8012.",
   "path": "practice/l51_api_solution.py"
  },
  {
   "zh": "客户端（视频的 apitest）：默认用 httpx 调 `/research`；`--openai`、`--stream` 用 OpenAI SDK 调兼容接口。52、53 节的服务也用它。",
   "en": "Client (the video's apitest): calls `/research` with httpx by default; `--openai` and `--stream` call the compatible endpoint with the OpenAI SDK. The services in lessons 52 and 53 use it too.",
   "path": "practice/l51_api_client.py"
  }
 ]
});
