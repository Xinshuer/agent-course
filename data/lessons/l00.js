COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l00",
  "priority": "overview",
  "handwrite": false,
  "studyMinutes": 15,
  "source": "subtitle",
  "noPy": true,
  "summary": {
    "zh": "这一集是整套课程约 1 分钟的导学，没有代码。这一节讲义帮你看清全局：59 集分成哪几个模块、每个框架是干什么的、它们之间是什么关系、跟着视频能做出什么，以及时间不多时怎样安排学习。",
    "en": "This roughly one-minute, code-free episode opens the series. These notes give you the big picture: how the 59 episodes split into modules, what each framework is for and how they relate, what you will build along with the videos, and how to plan your study when time is short."
  },
  "goals": [
    {
      "zh": "说出课程 10 个模块的顺序和大致内容",
      "en": "Name the 10 modules of the course, in order, and roughly what each covers"
    },
    {
      "zh": "理解「手写 Agent」和各个框架的关系：框架只是把同一个循环自动化了",
      "en": "See how hand-written agents relate to the frameworks: a framework automates the same loop"
    },
    {
      "zh": "知道每个框架最适合解决什么问题",
      "en": "Know what kind of problem each framework is best at"
    },
    {
      "zh": "知道视频各集用的模型和库版本可能和本机不同，讲义统一改用 DeepSeek 和已安装的版本",
      "en": "Know that the videos' models and library versions may differ from yours, and that these notes use DeepSeek and the installed versions throughout"
    },
    {
      "zh": "根据自己的时间，定一个现实的学习计划",
      "en": "Make a realistic study plan for the time you have"
    }
  ],
  "blocks": [
    {
      "t": "video",
      "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=1&t=0) 这一集只有 1 分钟左右，是整套课的宣传式开场，没有代码。讲师强调零基础也能跟上，并给出一条路线：先配好开发环境，然后做出第一个能运行的 Agent，最后用 RAG 知识库做一个会查资料的 Agent。接着他列了一长串话题，从大模型基础、提示词工程，到 RAG、LangChain / LangGraph、多智能体协作、Agent 调度，还提到了模型微调。\n\n[▶ 00:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=1&t=30) 后半段讲学完能做什么：会回答问题的智能体、替你自动跑任务的 Agent、基于私有资料的知识库机器人，或者继续深入大模型应用的落地。看一遍即可，重点是下面的路线图。\n\n提示词工程和模型微调在这 59 集里没有单独成集；合集简介里另外提到的 Python 入门、Transformer、私有化部署等也一样。这份讲义只跟着这 59 集走，需要用到的 Python 知识，会在第一次用到的那一节穿插讲解。",
      "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=1&t=0) This episode is only about a minute long: a promotional, code-free opening. The instructor stresses that complete beginners can keep up and sketches a route: set up the environment, build a first working agent, and finish with an agent that looks things up in a RAG knowledge base. He then rattles off a long list of topics, from LLM basics and prompt engineering to RAG, LangChain / LangGraph, multi-agent collaboration and agent orchestration, plus fine-tuning.\n\n[▶ 00:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=1&t=30) The second half is about what you can do afterwards: agents that answer questions, agents that run tasks for you, knowledge-base bots built on your own documents, or going deeper into getting LLM applications into production. Watch it once; the roadmap below is what matters.\n\nPrompt engineering and fine-tuning do not get episodes of their own among the 59, and neither do the Python primer, Transformers and private deployment that the collection's description also mentions. These notes follow only those 59 episodes; the Python you need is taught in the lesson that first uses it."
    },
    {
      "t": "h",
      "zh": "一、课程路线图",
      "en": "1. The course roadmap"
    },
    {
      "t": "p",
      "zh": "整套课 59 集、约 17 小时。这份讲义按主题把它们分成 10 个模块（模块是讲义自己的划分，视频里并没有这样分）。前两个模块打基础，后面每个模块学一个框架或一种架构：\n\n| 模块 | 集数 | 视频时长 | 学什么 |\n|---|---|---|---|\n| 1 Agent 基础概念 | 00–03 | 约 2.2 小时 | Agent 是什么、怎么分类、由哪些部分组成、有哪些规划策略和应用场景 |\n| 2 从零手写 Agent | 04–07 | 约 1.6 小时 | 只用模型 API：调用模型、定义工具、管理记忆、写出 ReAct 循环 |\n| 3 OpenAI Agents SDK 与多 Agent 入门 | 08–14 | 约 2.5 小时 | 第一个 Agent 框架：异步与流式、连续对话与多模态、结构化输出、工具与 MCP、多 Agent 分工 |\n| 4 AgentScope | 15–22 | 约 1.9 小时 | 工具、RAG、工作空间与权限、状态持久化、MCP 与技能、中间件，以及一个图像/视频生成助手 |\n| 5 多智能体架构与 LangGraph | 23–29 | 约 1.2 小时 | 为什么要多智能体、常见架构；用节点和边控制流程：串行、分支、循环、map-reduce |\n| 6 LangGraph 核心组件 | 30–39 | 约 1.5 小时 | 持久化与记忆、人机交互、时光旅行、流式输出、工具调用 |\n| 7 LangGraph 实战 | 40–42 | 约 1.1 小时 | 代码助手、提示词生成助手、多智能体版的「小浪助手」 |\n| 8 LangChain | 43–50 | 约 1.8 小时 | 模型输入输出、数据连接、对话历史、LCEL、Agent、LangServe |\n| 9 CrewAI | 51–56 | 约 2.2 小时 | 按角色组建 Agent 团队，用 FastAPI 对外提供服务；研究员、健康档案、软件编码等案例，以及 JSON 格式输出和人工反馈 |\n| 10 Agent 工作流 | 57–58 | 约 1 小时 | 用 CrewAI 把多个步骤串成工作流（视频里是 Pipelines 和 Flows） |",
      "en": "The series has 59 episodes, about 17 hours in all. These notes group them by topic into 10 modules (the grouping is the notes' own; the videos are not split this way). The first two modules lay the foundation; each later module covers one framework or architecture:\n\n| Module | Episodes | Video | What you learn |\n|---|---|---|---|\n| 1 Agent fundamentals | 00–03 | ≈ 2.2 h | What an agent is, how agents are classified, their building blocks, planning strategies and applications |\n| 2 Hand-writing an agent from scratch | 04–07 | ≈ 1.6 h | Using only the model API: calling the model, defining tools, managing memory, writing a ReAct loop |\n| 3 OpenAI Agents SDK & first multi-agent systems | 08–14 | ≈ 2.5 h | Your first agent framework: async and streaming, multi-turn chat and multimodality, structured output, tools and MCP, agents that split the work |\n| 4 AgentScope | 15–22 | ≈ 1.9 h | Tools, RAG, workspaces and permissions, state persistence, MCP and skills, middleware, plus an image/video generation assistant |\n| 5 Multi-agent architectures & LangGraph | 23–29 | ≈ 1.2 h | Why multi-agent, common architectures; controlling flow with nodes and edges: sequences, branches, loops, map-reduce |\n| 6 LangGraph core components | 30–39 | ≈ 1.5 h | Persistence and memory, human-in-the-loop, time travel, streaming, tool calls |\n| 7 LangGraph projects | 40–42 | ≈ 1.1 h | A coding assistant, a prompt-writing assistant, and the multi-agent edition of the “Xiaolang assistant” |\n| 8 LangChain | 43–50 | ≈ 1.8 h | Model I/O, data connections, chat history, LCEL, agents, LangServe |\n| 9 CrewAI | 51–56 | ≈ 2.2 h | Role-based agent teams served through FastAPI; researcher, health-record and software-coding examples, plus JSON output and human feedback |\n| 10 Agent workflows | 57–58 | ≈ 1 h | Chaining steps into workflows with CrewAI (Pipelines and Flows in the videos) |"
    },
    {
      "t": "video",
      "zh": "从 01、04、08 集开头的话可以听出，前面这些集原本是一个「三天训练营」：第一天讲概念（01–03），第二天把理论变成能运行的代码、手写 Agent（04–07），第三天改用成熟的框架（从 08 集的 OpenAI Agents SDK 开始）。之后的 AgentScope、LangGraph、LangChain、CrewAI 等几部分是另外录的，录制时间也不一样：比如 57 集提到录制日期是 2024 年 10 月，用的还是 CrewAI 0.x，而 AgentScope 那几集用的已经是 2.0 版。",
      "en": "The openings of episodes 01, 04 and 08 show that the early episodes were originally a “three-day boot camp”: day 1 covers concepts (01–03), day 2 turns the theory into running code by hand-writing an agent (04–07), and day 3 moves to a mature framework (the OpenAI Agents SDK, from episode 08). The AgentScope, LangGraph, LangChain and CrewAI parts were recorded separately and at different times: episode 57, for example, mentions a recording date of October 2024 and still uses CrewAI 0.x, while the AgentScope episodes already use version 2.0."
    },
    {
      "t": "h",
      "zh": "二、这些框架是什么关系",
      "en": "2. How the frameworks relate"
    },
    {
      "t": "p",
      "zh": "所有 Agent 的核心都是同一个循环：**大模型思考 → 调用工具 → 拿到结果 → 再思考**，直到任务完成（01 节的补充演示里可以看到它真实运行）。\n\n04–07 节你会**亲手**写出这个循环：自己维护消息列表、自己执行工具、自己把结果交回模型。后面每个框架都是在替你完成这些事，只是侧重点不同：\n\n| 方式 | 一句话 | 适合 |\n|---|---|---|\n| 手写（OpenAI 兼容接口） | 自己管理消息和工具循环 | 理解原理；简单需求 |\n| OpenAI Agents SDK | 轻量：定义 `Agent`，交给 `Runner` 自动跑循环 | 快速做出一个或几个 Agent |\n| AgentScope | 阿里巴巴开源的多智能体框架，自带工具箱、RAG、权限、中间件 | 功能齐全的智能体应用 |\n| LangGraph | 用「节点 + 边」把流程画成图，精确控制每一步 | 有分支、循环、人工审核、需要断点续跑的流程 |\n| LangChain | 组件库：模型、提示词模板、文档加载、对话历史；1.x 版本的 Agent 建立在 LangGraph 之上 | 拼装 RAG 和常见的大模型应用 |\n| CrewAI | 给每个 Agent 分配角色和任务，像一个团队一样协作；还能用 Flows 编排成工作流 | 「研究员 + 写手」这类分工明确的多 Agent |\n| FastAPI | Python 的 Web 框架 | 把 Agent 做成别人能调用的接口 |",
      "en": "Every agent runs the same core loop: **the model thinks → calls a tool → gets the result → thinks again**, until the task is done (the extra demo in lesson 01 shows it running for real).\n\nIn lessons 04–07 you write that loop **by hand**: you keep the message list, run the tools and hand results back to the model. Each later framework does that work for you, with a different emphasis:\n\n| Approach | In one line | Good for |\n|---|---|---|\n| By hand (OpenAI-compatible API) | You manage the messages and the tool loop | Understanding the mechanics; simple needs |\n| OpenAI Agents SDK | Lightweight: define an `Agent`, let `Runner` drive the loop | Getting one or a few agents running fast |\n| AgentScope | Alibaba's open-source multi-agent framework with a toolkit, RAG, permissions and middleware built in | Full-featured agent applications |\n| LangGraph | Draws the flow as a graph of nodes and edges, controlling every step | Flows with branches, loops, human review, resumable runs |\n| LangChain | A component library: models, prompt templates, document loaders, chat history; its 1.x agents are built on LangGraph | Assembling RAG and everyday LLM apps |\n| CrewAI | Gives each agent a role and tasks so they work like a team; Flows chain them into workflows | Clear division of labour, e.g. “researcher + writer” |\n| FastAPI | A Python web framework | Turning an agent into an API others can call |"
    },
    {
      "t": "tip",
      "zh": "学每个框架时，随时问自己一句：**这一行代码替我做了 04–07 节里的哪一步？** 能回答这个问题，框架就不再神秘，以后换一个新框架也能很快上手。",
      "en": "With every framework, keep asking: **which step from lessons 04–07 is this line doing for me?** Once you can answer that, frameworks stop being magic, and picking up a new one later is quick."
    },
    {
      "t": "video",
      "zh": "视频各集用的模型并不统一，大致是：\n- 04 集用 DeepSeek；05–07 集换成阿里云百炼上的通义千问 `qwen-plus`（讲师说当时他的 DeepSeek 调不了工具）\n- OpenAI Agents SDK 那几集（09–11）接的是谷歌的模型，讲多模态时它能看图\n- AgentScope 部分（15–22）主要用百炼的千问\n- LangGraph 部分（包括 40–42 的实战）多数用 DeepSeek\n- LangChain 和 CrewAI 部分用到 OpenAI 的 GPT-4o-mini、通义千问等\n\n各节讲义会在相关的地方写明那一集用的是什么模型。这份讲义统一改用你已经配置好的 DeepSeek（`deepseek-flash`）。这些服务商大多提供兼容 OpenAI 的接口，切换时一般只需要改 `base_url`、`model` 和 API key 三处，其余代码不变，详见[环境准备](#/setup)。",
      "en": "The videos don't stick to one model. Roughly:\n- Episode 04 uses DeepSeek; episodes 05–07 switch to Qwen `qwen-plus` on Alibaba Cloud Bailian (the instructor says his DeepSeek couldn't call tools at the time)\n- The OpenAI Agents SDK episodes (09–11) use a Google model, which can read images in the multimodal episode\n- The AgentScope part (15–22) mainly uses Qwen on Bailian\n- The LangGraph part (including the 40–42 projects) mostly uses DeepSeek\n- The LangChain and CrewAI parts use OpenAI's GPT-4o-mini, Qwen and others\n\nThe notes say which model an episode uses wherever it matters. These notes use the DeepSeek setup you already have (`deepseek-flash`) throughout. Most of these providers offer an OpenAI-compatible API, so switching usually means changing just `base_url`, `model` and the API key; the rest of the code stays the same. See [Setup](#/setup)."
    },
    {
      "t": "check",
      "q": {
        "zh": "OpenAI Agents SDK、LangGraph、CrewAI 这些框架，和 04–07 节手写的代码是什么关系？",
        "en": "How do frameworks such as the OpenAI Agents SDK, LangGraph and CrewAI relate to the code you hand-write in lessons 04–07?"
      },
      "options": [
        {
          "zh": "完全不同的技术，学了框架就不用懂手写的原理",
          "en": "They are unrelated; once you know a framework you can skip the hand-written basics"
        },
        {
          "zh": "框架只能配合 OpenAI 自家的模型使用",
          "en": "Frameworks only work with OpenAI's own models"
        },
        {
          "zh": "它们都在自动完成同一个「思考 → 调用工具 → 观察结果」的循环，只是封装方式不同",
          "en": "They all automate the same “think → call a tool → observe” loop, just packaged differently"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "框架把消息管理、工具执行、循环控制这些手写的步骤封装起来。懂了手写版本，才看得懂框架在做什么、出错时该查哪里。",
        "en": "Frameworks wrap the hand-written steps – message handling, running tools, controlling the loop. Knowing the hand-written version is how you understand what a framework does and where to look when it fails."
      }
    },
    {
      "t": "h",
      "zh": "三、跟着视频会做出什么",
      "en": "3. What you will build along with the videos"
    },
    {
      "t": "p",
      "zh": "跟着课程一路学下来，你会做出这些东西（括号里是对应的集数）：\n- 一个手写的 ReAct Agent：边想边调用工具，查出篮球和排球的上场人数再相乘（07）\n- 接入 MCP 工具服务器的 Agent（11）\n- 分工协作的多 Agent：分析销售数据并给出营销创意（14）\n- 能检索知识库（RAG）、带工作空间和权限控制的 AgentScope 智能体，以及一个图像/视频生成助手（17、18、22）\n- 带检查点、能人工审核、能「时光旅行」的 LangGraph 应用，以及代码助手、提示词生成助手、多智能体助手三个实战项目（30–42）\n- 用 CrewAI 组建的 Agent 团队，并通过 FastAPI 对外提供接口；还有技术研究员、健康档案助手、软件编码团队等案例（51–56）\n\n在这之前，04–06 节会先打好零件：调用模型、定义工具、管理对话记忆（数 token、滑动窗口、摘要压缩）。",
      "en": "Working through the course, you will build (episode numbers in brackets):\n- a hand-written ReAct agent that thinks and calls tools to look up how many players a basketball and a volleyball team field, then multiplies them (07)\n- an agent connected to an MCP tool server (11)\n- a multi-agent team that analyses sales data and comes up with marketing ideas (14)\n- AgentScope agents with knowledge-base retrieval (RAG), workspaces and permission control, plus an image/video generation assistant (17, 18, 22)\n- LangGraph apps with checkpoints, human review and “time travel”, plus three projects: a coding assistant, a prompt-writing assistant and a multi-agent assistant (30–42)\n- a CrewAI agent team served through a FastAPI endpoint, plus a tech researcher, a health-record assistant and a software-coding team (51–56)\n\nBefore that, lessons 04–06 build the parts: calling the model, defining tools and managing conversation memory (counting tokens, sliding windows, summarising)."
    },
    {
      "t": "h",
      "zh": "四、时间不多，怎么学",
      "en": "4. Short on time: a study plan"
    },
    {
      "t": "p",
      "zh": "合集标题说「七天」，那是只看视频的速度。要做到**能自己写出代码**，还要读讲义、做练习、在本地运行。按每天 1.5–2 小时算，比较现实的安排是 4 周：\n\n| 时间 | 集数 | 视频时长 | 重点 |\n|---|---|---|---|\n| 第 1 周 | 00–07 | 约 3.8 小时 | 概念快速过；04–07 一定要做到能手写 |\n| 第 2 周 | 08–22 | 约 4.4 小时 | Agents SDK 的基本写法；AgentScope 能看懂并改写 |\n| 第 3 周 | 23–42 | 约 3.8 小时 | LangGraph 的状态、节点、边和检查点 |\n| 第 4 周 | 43–58 | 约 5 小时 | LangChain、CrewAI、工作流 |\n\n每一节顶部都有一个标签，告诉你这一节该花多少力气：\n- **核心**：不看答案也能把代码手写出来\n- **重要**：看得懂，能在示例上改写\n- **了解**：开 1.5 倍速看视频，读一遍「要点回顾」即可\n\n讲义里的 ▶ 时间链接会直接跳到视频对应的位置，方便边看边对照。每节的具体学习步骤见[首页](#/)。学完一节就点「标记为已完成」，之后可以在「随机复习」页抽题巩固。",
      "en": "The collection's title promises “seven days” – that is the pace for just watching. To be able to **write the code yourself** you also need the notes, the exercises and local runs. At 1.5–2 hours a day, four weeks is realistic:\n\n| When | Episodes | Video | Focus |\n|---|---|---|---|\n| Week 1 | 00–07 | ≈ 3.8 h | Skim the concepts; be able to hand-write 04–07 |\n| Week 2 | 08–22 | ≈ 4.4 h | Agents SDK basics; read and adapt AgentScope code |\n| Week 3 | 23–42 | ≈ 3.8 h | LangGraph state, nodes, edges and checkpoints |\n| Week 4 | 43–58 | ≈ 5 h | LangChain, CrewAI, workflows |\n\nEvery lesson has a label at the top telling you how much effort it deserves:\n- **Core**: you can write the code without looking at the answer\n- **Important**: you can read it and adapt the examples\n- **Overview**: watch at 1.5× and read the key takeaways\n\nThe ▶ time links in the notes jump straight to the matching point in the video, so you can follow along. The [home page](#/) lists the steps for each lesson. Press “Mark as done” after each one; the Review page then quizzes you at random."
    },
    {
      "t": "warn",
      "zh": "**第一周最关键。** 04–07 节是整门课的地基，后面所有框架都在自动化这几节手写的东西。宁可在这里多花时间，也不要急着跳到框架——地基不牢，后面每个框架都会看得一头雾水。",
      "en": "**Week 1 matters most.** Lessons 04–07 are the foundation; every framework later automates what you write by hand there. Spend extra time here rather than rushing ahead – without that base, every framework will feel confusing."
    },
    {
      "t": "h",
      "zh": "五、Python 跟着课程学",
      "en": "5. Learning Python along the way"
    },
    {
      "t": "p",
      "zh": "你不需要先学完 Python 再来。每一节用到什么，就在那一节的「🐍 Python 小课堂」里讲什么，所有小课堂也汇总在 [Python 小课堂索引](#/python) 页面。前面几节的安排是：\n\n| 节 | 学到的 Python |\n|---|---|\n| 01 | 注释、print() |\n| 02 | 缩进和代码块 |\n| 04 | 变量和字符串、import、关键字参数、字典和列表、点号「.」与下标「[0]」、f-string、读取环境变量 |\n| 05 | 函数 def / return、嵌套字典、JSON、`**kwargs`、for 循环、if / else |\n| 06 | 列表操作、while 循环、input()、切片、列表推导式 |\n| 07 | 三引号字符串和模板、字符串方法、正则表达式、字典里放函数、try / except、一次返回多个值 |\n| 08 | 类和对象、装饰器、类型注解和 docstring |\n| 09 | import 自己写的文件、async / await、asyncio.gather、print 的 end 和 flush |\n| 10 | 拼接列表、读取二进制文件、base64、pathlib |\n| 11–12 | 用 pydantic 定义数据结构、子进程和服务器是什么、async with |",
      "en": "You don't need to finish a Python course first. Each lesson teaches the Python it uses in its “🐍 Python mini-lesson” boxes, and the [Python Mini-Lessons](#/python) page collects them all. The early lessons cover:\n\n| Lesson | Python you learn |\n|---|---|\n| 01 | Comments, print() |\n| 02 | Indentation and code blocks |\n| 04 | Variables and strings, import, keyword arguments, dicts and lists, the dot “.” vs indexing “[0]”, f-strings, environment variables |\n| 05 | Functions (def / return), nested dicts, JSON, `**kwargs`, for loops, if / else |\n| 06 | List operations, while loops, input(), slicing, list comprehensions |\n| 07 | Triple-quoted strings and templates, string methods, regular expressions, dicts of functions, try / except, returning several values |\n| 08 | Classes and objects, decorators, type hints and docstrings |\n| 09 | Importing your own file, async / await, asyncio.gather, print's end and flush |\n| 10 | Joining lists, reading binary files, base64, pathlib |\n| 11–12 | Data structures with pydantic, what a subprocess and a server are, async with |"
    },
    {
      "t": "tip",
      "zh": "开始 04 节之前，先花 10 分钟看[环境准备](#/setup)：虚拟环境和 API key 都已经配好，那一页告诉你练习文件在哪、怎样在 VS Code 里运行。",
      "en": "Before lesson 04, spend ten minutes on [Setup](#/setup): the virtual environments and API key are ready, and that page shows where the practice files are and how to run them in VS Code."
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "为什么课程要先用 4 集「从零手写 Agent」，再学框架？",
        "en": "Why does the course spend 4 episodes hand-writing an agent from scratch before any framework?"
      },
      "options": [
        {
          "zh": "因为框架很难安装",
          "en": "Because frameworks are hard to install"
        },
        {
          "zh": "因为实际项目里都用手写，不用框架",
          "en": "Because real projects never use frameworks"
        },
        {
          "zh": "框架自动完成的正是手写的那几步；先懂原理，框架代码才看得懂，出了错才知道查哪里",
          "en": "Frameworks automate exactly those hand-written steps; knowing them makes framework code readable and errors traceable"
        },
        {
          "zh": "因为后面的框架都不支持工具调用",
          "en": "Because the later frameworks don't support tool calls"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "每个框架都是在封装「思考 → 调用工具 → 观察」这个循环。手写过一遍，你就知道框架的每个参数对应哪一步。",
        "en": "Each framework wraps the “think → call a tool → observe” loop. Having written it once, you know which step each framework option maps to."
      }
    },
    {
      "q": {
        "zh": "你要做一个流程：检索资料 → 写初稿 → **等人审核**，通过就发布，不通过就退回重写。课程里哪个框架最适合？",
        "en": "You need a flow: retrieve material → write a draft → **wait for a human review**; publish if approved, otherwise rewrite. Which framework in the course fits best?"
      },
      "options": [
        {
          "zh": "LangGraph：用节点和边表达分支和循环，还能在中途暂停等人审核",
          "en": "LangGraph: nodes and edges express the branch and loop, and it can pause mid-run for a human"
        },
        {
          "zh": "FastAPI：把程序包装成网络接口，供别人调用",
          "en": "FastAPI: wraps a program as a web API for others to call"
        },
        {
          "zh": "一次普通的大模型调用就够了",
          "en": "A single plain model call is enough"
        },
        {
          "zh": "LangChain 的提示词模板：它负责把变量填进提示词",
          "en": "LangChain prompt templates: they fill variables into a prompt"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "有分支（通过 / 不通过）、有循环（退回重写）、要暂停等人，正是 LangGraph 擅长的，对应 28 节的条件分支和 33–36 节的人机交互。",
        "en": "A branch (approve / reject), a loop (rewrite) and a pause for a person are LangGraph's strengths – see conditional edges in lesson 28 and human-in-the-loop in lessons 33–36."
      }
    },
    {
      "q": {
        "zh": "「研究员搜集资料、写手成文、编辑校对」这种按角色分工的 Agent 团队，课程里哪个框架最直接？",
        "en": "For a team split by role – a researcher gathers material, a writer drafts, an editor proofreads – which framework in the course is the most direct fit?"
      },
      "options": [
        {
          "zh": "FastAPI：把程序包装成网络接口",
          "en": "FastAPI: wraps a program as a web API"
        },
        {
          "zh": "CrewAI：给每个 Agent 定义角色和任务，组成团队协作",
          "en": "CrewAI: gives each agent a role and tasks so they work as a team"
        },
        {
          "zh": "LangChain 的提示词模板：把变量填进提示词",
          "en": "LangChain prompt templates: fill variables into a prompt"
        },
        {
          "zh": "一次普通的模型调用：一问一答",
          "en": "A single plain model call: one question, one answer"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "CrewAI 的核心概念就是 Agent（角色）、Task（任务）和 Crew（团队），第 9 模块会用到。",
        "en": "CrewAI is built around Agent (role), Task and Crew (team) – the subject of module 9."
      }
    },
    {
      "q": {
        "zh": "视频里先后用过通义千问 `qwen-plus`、谷歌的模型、GPT-4o-mini 等，讲义统一用 DeepSeek。把视频里的代码改成调用 DeepSeek，一般要改什么？",
        "en": "The videos use Qwen `qwen-plus`, a Google model, GPT-4o-mini and others; these notes use DeepSeek throughout. What usually changes when you switch the video's code to DeepSeek?"
      },
      "options": [
        {
          "zh": "整个程序都要重写",
          "en": "The whole program must be rewritten"
        },
        {
          "zh": "要先换成 LangChain 才能用 DeepSeek",
          "en": "You must switch to LangChain first"
        },
        {
          "zh": "要换一个 Python 版本",
          "en": "You need a different Python version"
        },
        {
          "zh": "只改 `base_url`、`model` 和 API key，其余代码基本不变",
          "en": "Just `base_url`, `model` and the API key; the rest stays the same"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "这些服务商大多兼容 OpenAI 接口，请求和返回的格式一样，所以只需要换「连到哪里、用哪个模型、用谁的 key」。个别功能（比如结构化输出、看图）各家支持程度不同，相关小节会单独说明。",
        "en": "Most of these providers are OpenAI-compatible, so requests and responses look the same; you only change where to connect, which model and whose key. A few features (structured output or image input, for example) are supported differently, and the lessons concerned point this out."
      }
    },
    {
      "q": {
        "zh": "时间很紧时，标着「了解」的小节怎样处理最合理？",
        "en": "When time is tight, what is the sensible way to handle lessons labelled “Overview”?"
      },
      "options": [
        {
          "zh": "直接跳过，视频也不看",
          "en": "Skip them entirely, video included"
        },
        {
          "zh": "和核心小节一样，每行代码都手写一遍",
          "en": "Hand-write every line, just like core lessons"
        },
        {
          "zh": "倍速看视频、读要点回顾，把手写的时间留给核心小节",
          "en": "Watch at higher speed, read the takeaways, and save hand-writing time for core lessons"
        },
        {
          "zh": "只做测验，不看视频也不看讲义",
          "en": "Only do the quiz, skipping both video and notes"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "「了解」的小节提供背景和概念，快速过一遍就够；有限的时间应该花在能把核心代码独立写出来上。",
        "en": "Overview lessons give background and ideas, so a quick pass is enough; spend your limited time on writing the core code unaided."
      }
    }
  ],
  "pitfalls": [
    {
      "zh": "跳过 04–07 直接学框架，结果框架一报错，完全不知道是哪一步出了问题。",
      "en": "Skipping lessons 04–07 and jumping into frameworks – then having no idea which step broke when a framework errors."
    },
    {
      "zh": "只看视频不动手：看得懂不等于写得出，核心小节一定要不看答案手写一遍。",
      "en": "Watching without doing: understanding is not the same as writing. Hand-write the core lessons without peeking."
    },
    {
      "zh": "想把每个框架都学得一样深。时间不够时，按「核心 / 重要 / 了解」分配精力。",
      "en": "Trying to learn every framework equally deeply. When time is short, split your effort by Core / Important / Overview."
    },
    {
      "zh": "用电脑上平时的 Python 3.14 运行练习：部分框架装不上。请用课程的 `.venv`，CrewAI 用 `.venv-crewai`。",
      "en": "Running exercises with your usual Python 3.14: some frameworks won't install there. Use the course `.venv`, and `.venv-crewai` for CrewAI."
    },
    {
      "zh": "照抄视频或网上旧教程里的代码却不看版本：框架更新很快，比如视频里的 CrewAI 是 0.x、本机是 1.x（Pipelines 已被 Flows 取代）。遇到报错先看讲义里的「视频写法 vs 现在的写法」对照。",
      "en": "Copying code from the video or old tutorials without checking versions: frameworks change fast – the videos use CrewAI 0.x while you have 1.x, where Flows replace Pipelines, for example. When something fails, check the notes' “video vs current” comparison first."
    }
  ],
  "recap": [
    {
      "zh": "10 个模块：概念 → 手写 Agent → Agents SDK → AgentScope → LangGraph（架构、核心组件、实战）→ LangChain → CrewAI → 工作流。",
      "en": "10 modules: concepts → hand-written agent → Agents SDK → AgentScope → LangGraph (architecture, core components, projects) → LangChain → CrewAI → workflows."
    },
    {
      "zh": "所有 Agent 的核心是同一个循环：思考 → 调用工具 → 观察结果 → 再思考。",
      "en": "Every agent runs the same core loop: think → call a tool → observe the result → think again."
    },
    {
      "zh": "04–07 手写这个循环，是全课的地基；框架只是把它自动化。",
      "en": "Lessons 04–07 hand-write that loop – the foundation of the course; frameworks automate it."
    },
    {
      "zh": "LangGraph 擅长精确控制流程，CrewAI 擅长角色分工，FastAPI 负责对外提供接口。",
      "en": "LangGraph is for precise flow control, CrewAI for role-based teams, FastAPI for serving an API."
    },
    {
      "zh": "视频各集用的模型和库版本不一样，讲义统一用 DeepSeek 和本机已安装的版本，并标出差异。",
      "en": "The videos vary in model and library version; these notes use DeepSeek and the installed versions throughout and flag the differences."
    },
    {
      "zh": "约 17 小时视频，按每天 1.5–2 小时约 4 周学完；核心要手写，重要能改写，了解快速过。",
      "en": "About 17 hours of video – roughly 4 weeks at 1.5–2 hours a day; write the core, adapt the important, skim the overview."
    }
  ]
});
