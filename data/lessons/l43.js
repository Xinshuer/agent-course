COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l43",
  "priority": "overview",
  "handwrite": false,
  "studyMinutes": 12,
  "source": "subtitle",
  "summary": {
    "zh": "LangChain 部分的开场。视频讲了三件事：LangChain 是什么（一个把常用功能封装好的大模型应用 SDK）、它和 LlamaIndex 怎么分工（LlamaIndex 专注 RAG，LangChain 更通用），以及该怎样学这类还很年轻、几乎一天一个版本的框架（学设计思想、勤查文档）。讲义按讲师的提醒补充了两件事：你装的 LangChain 1.x 由哪些包组成，以及看到视频里的旧写法时该怎么改。",
    "en": "The opening of the LangChain part. The video covers three things: what LangChain is (an SDK for LLM apps with common features pre-packaged), how it divides the work with LlamaIndex (LlamaIndex focuses on RAG, LangChain is more general), and how to learn frameworks this young that release almost daily (study the design ideas, read the docs often). Following that advice, the notes add two things: which packages make up your installed LangChain 1.x, and how to fix older code you see in the video."
  },
  "goals": [
    {
      "zh": "用一句话说清 LangChain 是什么，以及 SDK 封装的价值",
      "en": "Say in one sentence what LangChain is and what an SDK's packaging is worth"
    },
    {
      "zh": "说出视频里 LangChain 和 LlamaIndex 的定位差别",
      "en": "State how the video positions LangChain against LlamaIndex"
    },
    {
      "zh": "说出讲师给不同基础的同学的学习建议，以及为什么要勤查文档",
      "en": "Give the instructor's advice for learners at different levels, and why to read the docs often"
    },
    {
      "zh": "补充：说出 LangChain 家族主要的包各管什么，知道 pip 名和 import 名怎么对应，说清它和 LangGraph、LangSmith 的关系",
      "en": "Extra: name what each main package in the LangChain family does, match pip names to import names, and explain how it relates to LangGraph and LangSmith"
    },
    {
      "zh": "补充：知道 1.x 的主要变化，看到旧写法知道去哪里找新写法",
      "en": "Extra: know the main 1.x changes, and where to find the new form of old-style code"
    }
  ],
  "blocks": [
    {
      "t": "video",
      "zh": "这一集约 6 分钟，是 LangChain 部分（43–50 节）的开场，只讲解、不写代码。顺序如下（点时间可以跳到视频对应位置）：\n- [▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=0) LangChain 是什么：又一个开发大模型应用的 SDK，把常用功能封装好\n- [▶ 00:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=33) 和 LlamaIndex「错位竞争」：LlamaIndex 专注数据连接（RAG），LangChain 更通用\n- [▶ 02:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=125) 这一部分代码要求中高；不同基础的同学该怎么学\n- [▶ 03:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=187) 这类框架远没成为行业标准，重点学设计思想\n- [▶ 04:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=279) LangChain 的定位：一次探索、一个原型；更新快、接口常变，要勤查文档\n\n第一到四部分跟着视频走；第五、六部分是讲义补充的：你装的 LangChain 1.x 由哪些包组成，以及看到视频里的旧写法时该怎么改——正好落实讲师「勤查文档、注意接口变化」的提醒。",
      "en": "This ~6-minute episode opens the LangChain part (lessons 43–50); it is all talk, no code. In order (click a time to jump to it in the video):\n- [▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=0) What LangChain is: another SDK for building LLM apps, with common features pre-packaged\n- [▶ 00:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=33) “Competing on different ground” with LlamaIndex: LlamaIndex focuses on data connection (RAG), LangChain is more general\n- [▶ 02:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=125) This part expects mid-to-high coding skills; how learners at different levels should approach it\n- [▶ 03:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=187) Such frameworks are far from becoming industry standards, so focus on their design ideas\n- [▶ 04:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=279) How LangChain sees itself: an exploration, a prototype; fast releases and changing interfaces, so read the docs often\n\nParts 1–4 follow the video; parts 5–6 are extras from these notes: which packages make up your installed LangChain 1.x, and how to fix the older code you'll see in the video – putting the instructor's “read the docs, watch for interface changes” advice into practice."
    },
    {
      "t": "h",
      "zh": "一、LangChain 是什么：又一个大模型应用 SDK",
      "en": "1. What LangChain is: another SDK for LLM apps"
    },
    {
      "t": "p",
      "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=0) 讲师介绍，LangChain 是一个很有名的开源项目，和他原课程上一讲的 LlamaIndex 一样，是开发大模型应用的 **SDK 框架**（这套合集没有收录 LlamaIndex 那一集）。SDK 的目的是让开发更方便：把常用的功能封装好，原本从头写要很复杂的功能，用一两行代码就能实现。[▶ 00:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=33) 换句话说，它把很多功能**标准化**了。\n\n注意它本身**不是模型**：真正生成回答的还是 DeepSeek、qwen-plus 这些模型，LangChain 负责把调用它们的代码组织好。对照 04 节的写法感受一下：",
      "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=0) The instructor introduces LangChain as a well-known open-source project which, like LlamaIndex from the previous lecture of his original course, is an **SDK framework** for building LLM applications (the LlamaIndex episode isn't in this collection). An SDK exists to make development easier: it packages common features so that things that would be complex to write from scratch take a line or two. [▶ 00:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=33) In other words, it **standardises** many features.\n\nNote that it is **not a model** itself: models such as DeepSeek or qwen-plus still produce the answers; LangChain organises the code that calls them. Compare with the lesson 04 style:"
    },
    {
      "t": "code",
      "file": "compare.py",
      "code": {
        "zh": "from llm import API_KEY, BASE_URL, MODEL\n\n# 04 节：直接用 openai 库\nfrom openai import OpenAI\nclient = OpenAI(api_key=API_KEY, base_url=BASE_URL)\nresponse = client.chat.completions.create(\n    model=MODEL,\n    messages=[{\"role\": \"user\", \"content\": \"用一句话介绍杭州\"}],\n)\nprint(response.choices[0].message.content)\n\n# LangChain：先创建模型对象，再 invoke\nfrom langchain_deepseek import ChatDeepSeek\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\nprint(model.invoke(\"用一句话介绍杭州\").content)",
        "en": "from llm import API_KEY, BASE_URL, MODEL\n\n# Lesson 04: the openai library directly\nfrom openai import OpenAI\nclient = OpenAI(api_key=API_KEY, base_url=BASE_URL)\nresponse = client.chat.completions.create(\n    model=MODEL,\n    messages=[{\"role\": \"user\", \"content\": \"Describe Hangzhou in one sentence\"}],\n)\nprint(response.choices[0].message.content)\n\n# LangChain: create a model object, then invoke it\nfrom langchain_deepseek import ChatDeepSeek\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\nprint(model.invoke(\"Describe Hangzhou in one sentence\").content)"
      },
      "note": {
        "zh": "LangChain 的代码不能在浏览器里运行，要在本地用 `.venv` 运行。只调一次模型时两种写法差不多；LangChain 的好处在项目变大以后才明显：模板、解析、检索、工具、换模型都有现成的写法，而且能互相连起来（44、45 节）。",
        "en": "LangChain code can't run in the browser; run it locally with `.venv`. For a single call the two styles are about the same; LangChain pays off as projects grow: templates, parsing, retrieval, tools and model switching all have ready-made forms that connect to each other (lessons 44 and 45)."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "LangChain 和 DeepSeek 是什么关系？",
        "en": "How do LangChain and DeepSeek relate?"
      },
      "options": [
        {
          "zh": "LangChain 是一个比 DeepSeek 更强的大模型",
          "en": "LangChain is a stronger model than DeepSeek"
        },
        {
          "zh": "LangChain 是开发框架（SDK），DeepSeek 是它可以调用的模型之一",
          "en": "LangChain is a development framework (an SDK); DeepSeek is one of the models it can call"
        },
        {
          "zh": "LangChain 是 DeepSeek 官方的 SDK",
          "en": "LangChain is DeepSeek's official SDK"
        },
        {
          "zh": "两者没有关系，不能一起用",
          "en": "They are unrelated and can't be used together"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "LangChain 只是帮你组织代码；真正生成回答的是 DeepSeek、qwen-plus 这些模型。换模型只要换创建模型的那一行（45 节）。",
        "en": "LangChain only organises your code; models such as DeepSeek or qwen-plus produce the answers. Switching models means changing the one line that creates the model (lesson 45)."
      }
    },
    {
      "t": "h",
      "zh": "二、和 LlamaIndex 的分工",
      "en": "2. How it divides the work with LlamaIndex"
    },
    {
      "t": "p",
      "zh": "[▶ 00:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=33) 讲师说，LangChain 和 LlamaIndex 是**错位竞争**：LlamaIndex 把更多精力放在它所说的「数据连接」上，也就是广义的 RAG 流程，[▶ 01:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=63) 所以面向 RAG 的工具更丰富、更全面，细节考虑得更多。LangChain 则是一个更**通用**的大模型应用开发框架，提供的是开发时方方面面都用得上的工具包。[▶ 01:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=94) 他举的例子：提示词要做的工作、上下文的管理、把不同的大模型抽象成统一接口，还有更底层的流式调用、回调等等，它都封装了一系列工具。[▶ 02:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=125) 代价是在 RAG 上花的精力和细致程度不如 LlamaIndex。\n\n| | LlamaIndex | LangChain |\n|---|---|---|\n| 定位 | 专注「数据连接」：加载、切分、索引、检索，也就是 RAG | 通用框架：提示词、模型调用、输出解析、对话历史、链、智能体、回调…… |\n| RAG 方面 | 工具更多，细节考虑更周全 | 有，但没那么细 |\n| 第三方集成 | 较少 | 很多：各家模型、向量库、向量模型、工具（这一点出自 44 节的视频） |",
      "en": "[▶ 00:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=33) The instructor says LangChain and LlamaIndex **compete on different ground**: LlamaIndex puts more of its effort into what it calls “data connection”, i.e. RAG in the broad sense, [▶ 01:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=63) so its RAG tools are richer, more complete and more careful about detail. LangChain is a more **general** framework for LLM app development – a toolkit for every part of the job. [▶ 01:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=94) His examples: the work you do on prompts, managing context, abstracting different models behind one interface, plus lower-level things like streaming and callbacks – it wraps all of these in tools. [▶ 02:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=125) The price is that it spends less effort, and less care, on RAG than LlamaIndex.\n\n| | LlamaIndex | LangChain |\n|---|---|---|\n| Focus | “Data connection”: loading, splitting, indexing, retrieval – i.e. RAG | General purpose: prompts, model calls, output parsing, chat history, chains, agents, callbacks… |\n| RAG | More tools, more care for detail | Present, but less thorough |\n| Third-party integrations | Fewer | Many: model providers, vector stores, embedding models, tools (this point comes from lesson 44's video) |"
    },
    {
      "t": "h",
      "zh": "三、讲师的学习建议",
      "en": "3. The instructor's advice on how to learn it"
    },
    {
      "t": "p",
      "zh": "[▶ 02:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=125) 讲师提醒，这一部分讲的是面向开发者的框架，代码要求中高。他给不同基础的同学的建议：\n- [▶ 02:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=155) **刚接触开发、没什么编程经验**：先从整体上弄懂「为什么要这样做」——为什么要把大模型抽象成统一接口、为什么要把提示词抽象成模板。理解了它真正的价值，就有很大收获；会不会写，可以以后慢慢学，或者和别人合作。\n- [▶ 03:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=187) **有编程经验**：任何开发框架都要经过很长时间的检验和打磨，才能从新提出的东西变得成熟、再变成行业标准。大模型出现到现在才两年左右，框架出现得更晚，[▶ 03:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=217) 所以今天不存在「学会这一个、以后就不用学别的」的框架——不像前端，学会一套主流框架就够用。[▶ 04:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=248) 更有价值的是学它的**设计思想**：它的模型封装设计得好不好、好不好用？提示词这块呢？好的设计就沿用或参考到自己的代码库里，有坑的设计就避开。",
      "en": "[▶ 02:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=125) The instructor points out that this part covers a framework for developers, with mid-to-high coding demands. His advice for learners at different levels:\n- [▶ 02:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=155) **New to development, little programming experience**: first understand the big picture – “why it is done this way”: why abstract models behind one interface, why turn prompts into templates. Understanding its real value is already a big gain; as for writing it yourself, you can learn that slowly later, or work with others.\n- [▶ 03:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=187) **With programming experience**: any development framework needs a long time of testing and polishing to go from a new proposal to maturity, and then to an industry standard. LLMs have only been around for about two years and the frameworks are younger still, [▶ 03:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=217) so today there is no framework you can “learn once and never need another” – unlike front-end work, where learning one mainstream framework is enough. [▶ 04:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=248) What is more valuable is studying its **design ideas**: is its model wrapper well designed and easy to use? What about its prompt handling? Reuse or borrow the good designs in your own code base, and steer clear of the ones with traps."
    },
    {
      "t": "tip",
      "zh": "对你（Python 刚入门、时间不多）来说：43、44 节理解思路就够；45 节是 LangChain 部分的重点，要能手写模型调用、提示词模板、结构化输出和工具调用。",
      "en": "For you (new to Python, short on time): for lessons 43 and 44, understanding the ideas is enough; lesson 45 is the heart of the LangChain part – you should be able to hand-write model calls, prompt templates, structured output and tool calls."
    },
    {
      "t": "h",
      "zh": "四、它还很年轻：更新快、接口常变",
      "en": "4. It's still young: fast releases, changing interfaces"
    },
    {
      "t": "p",
      "zh": "[▶ 04:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=279) 讲师对 LangChain 的定位：一套给大模型应用开发者用的 SDK，也是 AGI 时代软件工程的**一次探索、一个原型**。所谓原型，是说它还不够成熟：没有成为行业通用的标准，甚至不能保证生产环境一定能用——他自己用过，在很小的细节上还会踩坑。\n\n[▶ 05:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=312) 也正因为如此，它更新得非常快，几乎一天发一个版本，个别接口难免变化。所以学这类东西一定要**勤查文档**；真要用的话，要关注接口的变化。",
      "en": "[▶ 04:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=279) How the instructor sees LangChain: an SDK for developers of LLM applications, and also **an exploration, a prototype** of software engineering in the AGI era. “Prototype” means it isn't mature yet: it has not become an industry-wide standard, and it can't even be guaranteed to work in production – he has used it himself and still hit traps in small details.\n\n[▶ 05:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=44&t=312) That is also why it is updated so fast, with almost one release a day, so some interfaces are bound to change. When learning this kind of thing, **read the docs often**; if you really use it, keep an eye on interface changes."
    },
    {
      "t": "note",
      "zh": "这句提醒今天依然成立。从讲师的话推断，视频大约录于 2024 年下半年：他说大模型出现才两年左右，45 集又说 OpenAI 的结构化输出是「今年中旬」推出的（那是 2024 年 8 月）。那时 LangChain 还是 0.x；你装的是 1.x（1.0 在 2025 年发布），很多导入路径都变了。下面两部分就是为这件事做的补充。",
      "en": "That advice still holds today. Judging from what the instructor says, the video was recorded around the second half of 2024: he says LLMs have only been around for about two years, and in lesson 45's video he says OpenAI's structured outputs came out “in the middle of this year” (that was August 2024). LangChain was still 0.x then; you have 1.x installed (1.0 came out in 2025), and many import paths have changed. The next two parts are extras for exactly this."
    },
    {
      "t": "h",
      "zh": "五、补充：你装的 LangChain 家族",
      "en": "5. Extra: the LangChain family you have installed"
    },
    {
      "t": "p",
      "zh": "LangChain 不是一个包，而是一组包。你的 `.venv` 里装了这些（版本可以运行 `practice/l43_ecosystem.py` 查看）：\n\n| 包（pip 名） | 管什么 | 本课程里的例子 |\n|---|---|---|\n| `langchain-core` | 基础组件：消息、提示词模板、输出解析器、Runnable、工具 | `ChatPromptTemplate`、`PydanticOutputParser` |\n| `langchain` | 1.x 里变得很精简：主要是智能体 `create_agent`、`init_chat_model`、中间件 | `create_agent`（25、49 节） |\n| `langchain-deepseek`、`langchain-openai` 等 | 各家厂商的官方集成包 | `ChatDeepSeek`、`ChatOpenAI` |\n| `langchain-community` | 社区维护的大量集成：文档加载器、向量模型等 | `TextLoader`、`DashScopeEmbeddings` |\n| `langchain-text-splitters` | 文本切分器 | `RecursiveCharacterTextSplitter`（46 节） |\n| `langchain-classic` | 0.x 的旧组件：旧的链、Memory、`AgentExecutor`、`OutputFixingParser` | 运行旧代码时用（45 节用到一次） |\n| `langgraph` | 底层的流程编排框架：状态、节点、边 | 25–42 节 |\n| `langsmith` | 追踪和评估平台的客户端（平台需要注册） | 本课程不用 |\n\n三个名字来自同一家公司，关系是：**LangGraph** 管流程编排（你在 25–42 节学过）；**LangChain** 提供组件和现成的智能体——1.x 的 `create_agent` 生成的就是一张 LangGraph 图；**LangSmith** 是可选的网页平台，记录每次调用的经过。其实你在 LangGraph 部分已经在用 LangChain 了：`ChatDeepSeek`、`@tool`、`HumanMessage` 都是它的组件。",
      "en": "LangChain is not one package but a family. Your `.venv` has these (run `practice/l43_ecosystem.py` to see the versions):\n\n| Package (pip name) | What it covers | Example in this course |\n|---|---|---|\n| `langchain-core` | Basic components: messages, prompt templates, output parsers, Runnable, tools | `ChatPromptTemplate`, `PydanticOutputParser` |\n| `langchain` | Very slim in 1.x: mainly the agent `create_agent`, `init_chat_model`, middleware | `create_agent` (lessons 25, 49) |\n| `langchain-deepseek`, `langchain-openai`… | Official integration packages per provider | `ChatDeepSeek`, `ChatOpenAI` |\n| `langchain-community` | Many community-maintained integrations: document loaders, embedding models… | `TextLoader`, `DashScopeEmbeddings` |\n| `langchain-text-splitters` | Text splitters | `RecursiveCharacterTextSplitter` (lesson 46) |\n| `langchain-classic` | Old 0.x components: old chains, Memory, `AgentExecutor`, `OutputFixingParser` | For running old code (used once in lesson 45) |\n| `langgraph` | Low-level flow orchestration: state, nodes, edges | lessons 25–42 |\n| `langsmith` | Client for the tracing and evaluation platform (needs sign-up) | Not used in this course |\n\nAll three names come from the same company: **LangGraph** orchestrates flows (you learned it in lessons 25–42); **LangChain** supplies components and ready-made agents – 1.x's `create_agent` builds a LangGraph graph; **LangSmith** is an optional web platform that records how each call went. You were already using LangChain in the LangGraph lessons: `ChatDeepSeek`, `@tool` and `HumanMessage` are its components."
    },
    {
      "t": "note",
      "zh": "实测：你装的 `langchain-community` 0.4.2 在导入时会发出警告，说这个包「正在逐步停止维护」，建议改用各家独立的集成包（比如 `langchain-deepseek` 这种）。它现在还能正常用，46 节的文档加载器也还要用到它，看到这条 `DeprecationWarning` 不用慌。",
      "en": "Tested: your `langchain-community` 0.4.2 warns on import that the package “is being sunset” and points to standalone integration packages (like `langchain-deepseek`). It still works fine, and lesson 46's document loaders still use it – no need to panic when you see that `DeprecationWarning`."
    },
    {
      "t": "py",
      "title": {
        "zh": "pip 包名和 import 名；查看装了哪个版本",
        "en": "pip names vs import names; checking the installed version"
      },
      "zh": "安装时用的名字和代码里 import 的名字常常不一样：\n- pip 名用**横线**：`pip install langchain-deepseek`\n- import 名用**下划线**：`from langchain_deepseek import ChatDeepSeek`\n\n因为 Python 的变量名和模块名里不能有 `-`（会被当成减号）。\n\n想知道某个包装的是哪个版本，用标准库 `importlib.metadata` 里的 `version(\"pip 名\")`；没装的话会抛出 `PackageNotFoundError`。这正是讲师说的「注意接口变化」的第一步：看视频时对一下版本号，就知道它和你装的是不是同一代。",
      "en": "The name you install with often differs from the name you import:\n- pip names use **hyphens**: `pip install langchain-deepseek`\n- import names use **underscores**: `from langchain_deepseek import ChatDeepSeek`\n\nThat's because Python variable and module names can't contain `-` (it would be read as a minus sign).\n\nTo see which version of a package is installed, use `version(\"pip name\")` from the standard library's `importlib.metadata`; if it isn't installed you get `PackageNotFoundError`. That is the first step of the instructor's “watch for interface changes”: compare version numbers with the video to see whether it uses the same generation as you.",
      "code": {
        "zh": "from importlib.metadata import PackageNotFoundError, version\n\npackages = [\"langchain-core\", \"langchain\", \"langchain-deepseek\", \"langgraph\"]\nfor pip_name in packages:\n    import_name = pip_name.replace(\"-\", \"_\")     # 把 - 换成 _\n    try:\n        v = version(pip_name)                    # 查这个包装的是哪个版本\n    except PackageNotFoundError:                 # try/except 回顾 07 节\n        v = \"没有安装\"\n    print(f\"pip install {pip_name}  →  import {import_name}  →  {v}\")",
        "en": "from importlib.metadata import PackageNotFoundError, version\n\npackages = [\"langchain-core\", \"langchain\", \"langchain-deepseek\", \"langgraph\"]\nfor pip_name in packages:\n    import_name = pip_name.replace(\"-\", \"_\")     # swap - for _\n    try:\n        v = version(pip_name)                    # which version is installed\n    except PackageNotFoundError:                 # try/except: see lesson 07\n        v = \"not installed\"\n    print(f\"pip install {pip_name}  ->  import {import_name}  ->  {v}\")"
      },
      "note": {
        "zh": "在网页里运行会显示「没有安装」——浏览器里没有装 LangChain。在本地运行 `practice/l43_ecosystem.py` 能看到真实版本，比如 langchain 1.4.3、langchain-core 1.6.6、langchain-deepseek 1.1.1、langgraph 1.2.12。",
        "en": "In the browser it prints “not installed” – there is no LangChain there. Run `practice/l43_ecosystem.py` locally to see the real versions, e.g. langchain 1.4.3, langchain-core 1.6.6, langchain-deepseek 1.1.1, langgraph 1.2.12."
      }
    },
    {
      "t": "h",
      "zh": "六、补充：视频里的旧写法在 1.x 里怎么改",
      "en": "6. Extra: fixing the video's older code for 1.x"
    },
    {
      "t": "p",
      "zh": "和 0.x 相比，最影响你看视频的是这几点：\n1. **`langchain` 包大瘦身**：旧的 `langchain.prompts`、`langchain.schema`、`langchain.chains`、`langchain.memory`、`langchain.output_parsers` 等模块都没了，基础组件要从 `langchain_core` 导入。\n2. **旧组件搬家**：`LLMChain`、`ConversationBufferMemory`、`AgentExecutor`、`OutputFixingParser` 等搬进了新包 `langchain-classic`。\n3. **智能体统一成 `create_agent`**，底层是 LangGraph。\n4. **统一的调用方法**：所有组件都用 `invoke` / `stream` / `batch`；旧教程里的 `predict`、`run` 这类写法不再使用。\n\n`practice/l43_ecosystem.py` 会把旧教程常见的几行导入挨个试一遍，实际输出是这样的：",
      "en": "Compared with 0.x, these points matter most when you watch the video:\n1. **The `langchain` package slimmed down**: old modules such as `langchain.prompts`, `langchain.schema`, `langchain.chains`, `langchain.memory` and `langchain.output_parsers` are gone; import basic components from `langchain_core`.\n2. **Old components moved**: `LLMChain`, `ConversationBufferMemory`, `AgentExecutor`, `OutputFixingParser` and friends went into the new `langchain-classic` package.\n3. **Agents unified as `create_agent`**, built on LangGraph.\n4. **One way to call things**: every component uses `invoke` / `stream` / `batch`; old-tutorial forms like `predict` and `run` are gone.\n\n`practice/l43_ecosystem.py` tries several common old-tutorial imports one by one; this is its real output, with the Chinese labels shown in English:"
    },
    {
      "t": "code",
      "file": "l43_ecosystem.py output",
      "lang": "text",
      "code": {
        "zh": "== 旧教程的导入写法在 1.x 里 / old tutorial imports under 1.x ==\n  失败  from langchain.prompts import PromptTemplate\n        -> ModuleNotFoundError: No module named 'langchain.prompts'\n  失败  from langchain.schema import HumanMessage\n        -> ModuleNotFoundError: No module named 'langchain.schema'\n  失败  from langchain.chat_models import ChatOpenAI\n        -> ImportError: cannot import name 'ChatOpenAI' from 'langchain.chat_models' (...)\n  失败  from langchain.chains import LLMChain\n        -> ModuleNotFoundError: No module named 'langchain.chains'\n  失败  from langchain.memory import ConversationBufferMemory\n        -> ModuleNotFoundError: No module named 'langchain.memory'",
        "en": "== old tutorial imports under 1.x ==\n  FAIL  from langchain.prompts import PromptTemplate\n        -> ModuleNotFoundError: No module named 'langchain.prompts'\n  FAIL  from langchain.schema import HumanMessage\n        -> ModuleNotFoundError: No module named 'langchain.schema'\n  FAIL  from langchain.chat_models import ChatOpenAI\n        -> ImportError: cannot import name 'ChatOpenAI' from 'langchain.chat_models' (...)\n  FAIL  from langchain.chains import LLMChain\n        -> ModuleNotFoundError: No module named 'langchain.chains'\n  FAIL  from langchain.memory import ConversationBufferMemory\n        -> ModuleNotFoundError: No module named 'langchain.memory'"
      }
    },
    {
      "t": "tip",
      "zh": "看视频遇到旧写法时：\n1. 报 `ImportError` / `ModuleNotFoundError` → 查 45 节第十二部分、44 节第七部分的对照表，换成 1.x 的导入。\n2. 一时找不到对应写法 → 先把 `from langchain.xxx` 改成 `from langchain_classic.xxx` 跑起来，再慢慢换。\n3. 看到 `LLMChain`、`ConversationBufferMemory` → 分别对应 48 节的 LCEL 和 47 节的对话历史。",
      "en": "When the video shows old-style code:\n1. `ImportError` / `ModuleNotFoundError` → look up the tables in lesson 45 part 12 and lesson 44 part 7, and switch to the 1.x import.\n2. Can't find the new form yet → change `from langchain.xxx` to `from langchain_classic.xxx` to get it running, then migrate.\n3. `LLMChain` or `ConversationBufferMemory` → see LCEL in lesson 48 and chat history in lesson 47."
    },
    {
      "t": "check",
      "q": {
        "zh": "你照着视频写了 `from langchain.prompts import ChatPromptTemplate`，运行报 `ModuleNotFoundError`。最好的改法是？",
        "en": "You copied `from langchain.prompts import ChatPromptTemplate` from the video and got `ModuleNotFoundError`. The best fix?"
      },
      "options": [
        {
          "zh": "重新安装 Python",
          "en": "Reinstall Python"
        },
        {
          "zh": "把 langchain 降级到 0.x",
          "en": "Downgrade langchain to 0.x"
        },
        {
          "zh": "改成 `from langchain_core.prompts import ChatPromptTemplate`",
          "en": "Change it to `from langchain_core.prompts import ChatPromptTemplate`"
        },
        {
          "zh": "删掉这一行",
          "en": "Delete the line"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "1.x 里提示词模板在 `langchain_core.prompts`。降级会和课程里其他包（LangGraph 1.x 等）冲突，不划算。",
        "en": "In 1.x prompt templates live in `langchain_core.prompts`. Downgrading would clash with the course's other packages (LangGraph 1.x and more) – not worth it."
      }
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "视频里讲师怎样比较 LangChain 和 LlamaIndex？",
        "en": "How does the instructor compare LangChain with LlamaIndex in the video?"
      },
      "options": [
        {
          "zh": "两者完全一样，只是名字不同",
          "en": "They are identical apart from the name"
        },
        {
          "zh": "LangChain 只能做 RAG，LlamaIndex 什么都能做",
          "en": "LangChain can only do RAG; LlamaIndex can do everything"
        },
        {
          "zh": "LlamaIndex 是大模型，LangChain 是框架",
          "en": "LlamaIndex is an LLM; LangChain is a framework"
        },
        {
          "zh": "LlamaIndex 专注数据连接（RAG），在这方面更细致；LangChain 更通用，覆盖开发的方方面面",
          "en": "LlamaIndex focuses on data connection (RAG) and is more thorough there; LangChain is more general and covers every part of development"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "讲师的看法是两者错位竞争：LlamaIndex 把主要精力放在 RAG 上；LangChain 提供的是开发大模型应用时各个环节都用得上的工具包，RAG 部分相对没那么细。",
        "en": "In the instructor's view they compete on different ground: LlamaIndex pours its effort into RAG, while LangChain is a toolkit for every stage of building an LLM app and is less detailed on RAG."
      }
    },
    {
      "q": {
        "zh": "对有编程经验的同学，讲师建议怎样学这类框架？",
        "en": "How does the instructor advise experienced programmers to learn frameworks like this?"
      },
      "options": [
        {
          "zh": "挑一个框架学透，以后就不用再学别的",
          "en": "Master one framework and never learn another"
        },
        {
          "zh": "重点学它的设计思想：好的设计借鉴到自己的代码库，有坑的设计避开",
          "en": "Focus on its design ideas: borrow the good designs for your own code base, avoid the ones with traps"
        },
        {
          "zh": "等它成为行业标准以后再学",
          "en": "Wait until it becomes an industry standard"
        },
        {
          "zh": "只看视频，不用查文档",
          "en": "Just watch the video; no need for the docs"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "这类框架还很年轻，离行业标准很远，而且几乎一天一个版本、接口常变。所以要学设计思想、取长补短，并且勤查文档。",
        "en": "These frameworks are young, far from being standards, and release almost daily with changing interfaces. So learn the design ideas, take the best and leave the rest – and read the docs often."
      }
    },
    {
      "q": {
        "zh": "`ChatPromptTemplate`、`PydanticOutputParser` 这些基础组件在哪个包里？",
        "en": "Which package holds basic components like `ChatPromptTemplate` and `PydanticOutputParser`?"
      },
      "options": [
        {
          "zh": "`langchain-community`",
          "en": "`langchain-community`"
        },
        {
          "zh": "`langchain-core`",
          "en": "`langchain-core`"
        },
        {
          "zh": "`langsmith`",
          "en": "`langsmith`"
        },
        {
          "zh": "`langchain-text-splitters`",
          "en": "`langchain-text-splitters`"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "和厂商无关的基础组件都在 `langchain-core`，导入时写 `langchain_core`。",
        "en": "Provider-neutral basics live in `langchain-core`, imported as `langchain_core`."
      }
    },
    {
      "q": {
        "zh": "`pip install langchain-deepseek` 之后，代码里怎么导入？",
        "en": "After `pip install langchain-deepseek`, how do you import it?"
      },
      "options": [
        {
          "zh": "`from langchain.deepseek import ChatDeepSeek`",
          "en": "`from langchain.deepseek import ChatDeepSeek`"
        },
        {
          "zh": "`import langchain-deepseek`",
          "en": "`import langchain-deepseek`"
        },
        {
          "zh": "`from deepseek import ChatDeepSeek`",
          "en": "`from deepseek import ChatDeepSeek`"
        },
        {
          "zh": "`from langchain_deepseek import ChatDeepSeek`",
          "en": "`from langchain_deepseek import ChatDeepSeek`"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "pip 名里的 `-` 在 import 名里换成 `_`。`import langchain-deepseek` 会被当成减法，直接语法错误。",
        "en": "The `-` in the pip name becomes `_` in the import name. `import langchain-deepseek` reads as a subtraction – a syntax error."
      }
    },
    {
      "q": {
        "zh": "讲师为什么说学 LangChain 一定要勤查文档？",
        "en": "Why does the instructor say you must read LangChain's docs often?"
      },
      "options": [
        {
          "zh": "它还很年轻：更新极快，几乎一天一个版本，个别接口难免变化",
          "en": "It is still young: it moves very fast, with almost one release a day, so some interfaces are bound to change"
        },
        {
          "zh": "因为它的文档写得很差，要反复看才能看懂",
          "en": "Its docs are so poor you must read them again and again"
        },
        {
          "zh": "因为它只支持 OpenAI 的模型，换模型要查文档",
          "en": "It only supports OpenAI models, so switching models needs the docs"
        },
        {
          "zh": "因为不查文档就没法安装",
          "en": "You can't install it without reading the docs"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "讲师把 LangChain 看成一次探索、一个原型：还没成熟到行业标准，发版很勤，接口会变。所以要勤查文档，真要用时关注接口变化。（44 集里他反而夸 API 文档写得还可以。）",
        "en": "The instructor sees LangChain as an exploration, a prototype: not yet mature enough to be a standard, releasing constantly, with interfaces that change. So read the docs often and watch for interface changes when you use it. (In lesson 44's video he actually praises the API reference as decently written.)"
      }
    },
    {
      "q": {
        "zh": "旧教程里的 `LLMChain`，在你的环境里情况如何？",
        "en": "What about the old tutorials' `LLMChain` in your environment?"
      },
      "options": [
        {
          "zh": "`from langchain.chains import LLMChain` 照常可用",
          "en": "`from langchain.chains import LLMChain` works as before"
        },
        {
          "zh": "已经彻底删除，任何包里都找不到",
          "en": "Deleted entirely – no package has it"
        },
        {
          "zh": "在 `langchain_classic` 里还能导入；新代码改用 LCEL（48 节）",
          "en": "Still importable from `langchain_classic`; new code uses LCEL (lesson 48)"
        },
        {
          "zh": "改名叫 `ChatDeepSeek` 了",
          "en": "Renamed to `ChatDeepSeek`"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "`langchain.chains` 在 1.x 里已不存在（实测 `ModuleNotFoundError`），`from langchain_classic.chains import LLMChain` 还能用。",
        "en": "`langchain.chains` no longer exists in 1.x (tested: `ModuleNotFoundError`), but `from langchain_classic.chains import LLMChain` still works."
      }
    }
  ],
  "pitfalls": [
    {
      "zh": "期待学会一个框架就一劳永逸。讲师强调这类框架还在快速变化：学设计思想，用的时候勤查文档、留意接口变化。",
      "en": "Expecting to learn one framework and be done. The instructor stresses that these frameworks keep changing fast: learn the design ideas, and read the docs and watch for interface changes when you use them."
    },
    {
      "zh": "照着旧版视频或教程的导入路径写，1.x 报 `ImportError`。基础组件从 `langchain_core` 导入，模型从各家集成包导入。",
      "en": "Copying import paths from older videos or tutorials – `ImportError` in 1.x. Import basics from `langchain_core` and models from each provider's package."
    },
    {
      "zh": "把 pip 名和 import 名搞混：安装用 `langchain-deepseek`，导入用 `langchain_deepseek`。",
      "en": "Mixing pip and import names: install `langchain-deepseek`, import `langchain_deepseek`."
    },
    {
      "zh": "以为学了 LangGraph 就用不着 LangChain（或者反过来）。LangGraph 管流程，LangChain 提供零件，两者经常一起用。",
      "en": "Thinking LangGraph makes LangChain unnecessary (or vice versa). LangGraph runs the flow, LangChain supplies the parts; they are often used together."
    },
    {
      "zh": "新代码继续用 `langchain_classic` 里的旧组件。它只是为了让旧代码能跑，不是推荐写法。",
      "en": "Writing new code with old components from `langchain_classic`. It exists so old code keeps running, not as the recommended way."
    }
  ],
  "recap": [
    {
      "zh": "LangChain 是开发大模型应用的开源 SDK：把常用功能封装、标准化，一两行代码实现原本复杂的功能；它不是模型。",
      "en": "LangChain is an open-source SDK for LLM apps: it packages and standardises common features so complex things take a line or two; it is not a model."
    },
    {
      "zh": "视频的观点：LlamaIndex 专注数据连接（RAG），更细致；LangChain 更通用，覆盖提示词、上下文、统一模型接口、流式、回调等方方面面。",
      "en": "The video's view: LlamaIndex focuses on data connection (RAG) and is more thorough; LangChain is more general, covering prompts, context, a unified model interface, streaming, callbacks and more."
    },
    {
      "zh": "学法：基础薄的先理解「为什么要这样封装」；有经验的学设计思想、取长补短。框架还年轻、几乎一天一个版本，要勤查文档、留意接口变化。",
      "en": "How to learn: beginners first grasp why things are wrapped this way; experienced developers study the design ideas and borrow selectively. The framework is young and releases almost daily – read the docs often and watch for interface changes."
    },
    {
      "zh": "补充——家族成员：`langchain-core`（基础）、`langchain`（智能体）、集成包（`langchain-deepseek` 等）、`langchain-community`、`langchain-text-splitters`、`langchain-classic`（旧组件）；pip 名用 `-`，import 名用 `_`。",
      "en": "Extra – the family: `langchain-core` (basics), `langchain` (agents), integration packages (`langchain-deepseek`…), `langchain-community`, `langchain-text-splitters`, `langchain-classic` (old parts); pip names use `-`, import names `_`."
    },
    {
      "zh": "补充——1.x 变化：`langchain` 包瘦身、旧组件进 `langchain-classic`、智能体统一为 `create_agent`（建在 LangGraph 上）、调用统一为 `invoke` / `stream` / `batch`。",
      "en": "Extra – 1.x changes: a slim `langchain` package, old parts in `langchain-classic`, agents unified as `create_agent` (built on LangGraph), calls unified as `invoke` / `stream` / `batch`."
    }
  ],
  "files": [
    {
      "path": "practice/l43_ecosystem.py",
      "zh": "打印 LangChain 家族各个包的版本、常用类来自哪个包，并逐个试旧教程的导入写法（不调用模型，不需要 key）。",
      "en": "Prints each LangChain-family package's version and where everyday classes live, then tries old-tutorial imports one by one (no model calls, no key needed)."
    }
  ]
});
