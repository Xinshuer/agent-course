COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l44",
  "priority": "overview",
  "handwrite": false,
  "studyMinutes": 18,
  "source": "subtitle",
  "summary": {
    "zh": "这一集用 9 分钟给 LangChain 画了一张「零件地图」：先看一个大模型应用里数据怎么流动——文本填进提示词模板、交给大模型、用输出解析器变成结构化数据，旁边还有对话历史和检索器；再归纳成六大模块：模型输入输出、数据连接、对话历史、链（后来的 LCEL）、智能体、回调；最后介绍该读哪些文档。讲义补充了每个零件在 1.x 里从哪里导入，以及它们为什么能拼在一起。",
    "en": "This 9-minute episode draws a “parts map” of LangChain: first how data flows through an LLM app – text is filled into a prompt template, sent to the model and turned into structured data by an output parser, with chat history and a retriever alongside; then six module groups: model I/O, data connection, chat history, chains (later LCEL), agents and callbacks; and finally which docs to read. These notes add where each part is imported from in 1.x, and why the parts fit together."
  },
  "goals": [
    {
      "zh": "说出视频里一个大模型应用的基本数据流：提示词模板 → 大模型 → 输出解析器，以及对话历史和检索器各在哪里",
      "en": "Describe the video's basic data flow in an LLM app – prompt template → LLM → output parser – and where chat history and the retriever fit"
    },
    {
      "zh": "说出 LangChain 的六大模块，以及 45–49 节分别讲哪一块",
      "en": "Name LangChain's six module groups and which of lessons 45–49 covers each"
    },
    {
      "zh": "说清 LangChain 名字里「链」的含义、LCEL 是什么，以及智能体和链的关系",
      "en": "Explain the “chain” in LangChain's name, what LCEL is, and how agents relate to chains"
    },
    {
      "zh": "知道回调用来做什么，以及该去哪里查文档（模块总览、API 文档、集成页面）",
      "en": "Know what callbacks are for, and where to read the docs (module overview, API reference, integrations)"
    },
    {
      "zh": "补充：知道各组件在 1.x 里从哪个包导入，理解统一的 `invoke` 为什么能让它们连成链",
      "en": "Extra: know which 1.x package each component comes from, and why the shared `invoke` lets them chain"
    }
  ],
  "blocks": [
    {
      "t": "video",
      "zh": "这一集约 9 分钟，只讲解、不写代码：在正式动手之前，先给 LangChain 提供的工具画一张总览图。顺序如下（点时间可以跳到视频对应位置）：\n- [▶ 00:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=33) 一个大模型应用里数据怎么流动：提示词模板 → 大模型 → 输出解析器，旁边还有对话历史和检索器\n- [▶ 04:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=251) 归纳成几大块：模型输入输出、数据连接、对话历史管理\n- [▶ 04:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=281) 链 Chain（LangChain 名字的由来），后来发展成 LCEL\n- [▶ 05:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=313) 智能体：在链的基础上多次推理、调用工具\n- [▶ 06:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=408) 回调：监控每一步发生的事件\n- [▶ 07:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=438) 该读哪些文档：模块总览、API 文档、第三方集成页面\n\n第一到四部分跟着视频走；第五到七部分是本讲义补充的：每个零件在你装的 1.x 里叫什么、从哪里导入，它们为什么能拼在一起，以及旧教程里的组件去了哪里。",
      "en": "This ~9-minute episode is all talk, no code: before any hands-on work, it draws an overview of the tools LangChain provides. In order (click a time to jump to it in the video):\n- [▶ 00:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=33) How data flows through an LLM app: prompt template → LLM → output parser, with chat history and a retriever alongside\n- [▶ 04:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=251) Grouped into modules: model I/O, data connection, chat-history management\n- [▶ 04:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=281) Chains (where the name LangChain comes from), which later grew into LCEL\n- [▶ 05:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=313) Agents: repeated reasoning and tool use built on chains\n- [▶ 06:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=408) Callbacks: monitoring the events of each step\n- [▶ 07:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=438) Which docs to read: the module overview, the API reference, the integrations pages\n\nParts 1–4 follow the video; parts 5–7 are extras from these notes: what each part is called in your installed 1.x, where to import it from, why the parts fit together, and where old tutorials' components went."
    },
    {
      "t": "h",
      "zh": "一、一个大模型应用里，数据怎么流动",
      "en": "1. How data flows through an LLM app"
    },
    {
      "t": "p",
      "zh": "[▶ 00:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=33) 讲师让我们先想象一个基于大模型的应用。先不谈多模态，跟大语言模型打交道，主要处理的还是**文本**：可能是用户的提问，也可能是线下的文档。\n1. [▶ 01:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=63) 文本先填进**提示词模板**——模板里写好了要模型拿这些文本做什么。\n2. 填好的完整提示词拿去调**大模型**。\n3. [▶ 01:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=95) 除了聊天，很多场景要模型分析文本、给出**结构化的结果**。讲师用前面课上的例子：用户说「我要订一个 10 元的流量包」，要解析成「价格 = 10 元、类型 = 流量包」，再拿去调后端接口。[▶ 02:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=127) 模型输出的只是一段文字（比如一个 JSON 字符串），把它变成程序能用的数据，靠的是**输出解析器**。\n\n[▶ 02:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=158) 这三步是最基本的交互流程。在它旁边还有两样：多轮对话要管理**对话历史**——历史不能无限长，要筛选、[▶ 03:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=189) 截断；RAG 应用要通过**检索器**（retriever）去查数据源。讲师提醒，检索这块 LangChain 也提供了工具，但没有 LlamaIndex 做得细。",
      "en": "[▶ 00:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=33) The instructor asks us to picture an app built on an LLM. Leaving multimodal aside, working with a language model mostly means handling **text**: a user's question, or offline documents.\n1. [▶ 01:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=63) The text is first filled into a **prompt template** – the template says what the model should do with it.\n2. The complete prompt is sent to the **LLM**.\n3. [▶ 01:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=95) Beyond chatting, many tasks need the model to analyse text and return a **structured result**. The instructor reuses an example from earlier in his course: a user says “I want to subscribe to a 10-yuan data plan”, which must become “price = 10 yuan, type = data plan” before a backend API is called. [▶ 02:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=127) What the model returns is just text (say, a JSON string); turning it into data the program can use is the job of an **output parser**.\n\n[▶ 02:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=158) These three steps are the most basic interaction. Beside them sit two more things: a multi-turn chat must manage its **chat history** – it can't grow forever, so it gets filtered and [▶ 03:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=189) trimmed; a RAG app queries a data source through a **retriever**. The instructor notes that LangChain has tools for retrieval too, but they are less thorough than LlamaIndex's."
    },
    {
      "t": "code",
      "file": {
        "zh": "数据流",
        "en": "data flow"
      },
      "lang": "text",
      "code": {
        "zh": "                      数据源（离线文档、数据库……）\n                              │  检索器 Retriever：按问题查出相关内容\n                              ▼\n用户的话 ──► 提示词模板 ──► 大模型 ──► 输出解析器 ──► 结构化数据 ──► 后端接口\n （文本）     填进模板        调用        JSON 文本 → 字段     例如 价格=10、类型=流量包\n                  ▲\n                  │  对话历史：多轮对话要带上，但要筛选、截断，不能无限长\n\n中间这一行是最基本的交互流程：输入 → 模型 → 输出。",
        "en": "                              data source (offline documents, databases...)\n                                      │  Retriever: finds the content relevant to the question\n                                      ▼\nuser's words ──► prompt template ──► LLM ──► output parser ──► structured data ──► backend API\n   (text)           filled in        call    JSON text → fields  e.g. price=10, type=data plan\n                        ▲\n                        │  chat history: multi-turn chats carry it along, but filtered and trimmed – it can't grow forever\n\nThe middle row is the most basic interaction flow: input → model → output."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "视频的例子里，把模型输出的「价格 10、类型流量包」这段 JSON 文本变成程序里的字段，靠的是哪个组件？",
        "en": "In the video's example, which component turns the model's JSON text “price 10, type data plan” into fields the program can use?"
      },
      "options": [
        {
          "zh": "提示词模板",
          "en": "The prompt template"
        },
        {
          "zh": "检索器",
          "en": "The retriever"
        },
        {
          "zh": "输出解析器",
          "en": "The output parser"
        },
        {
          "zh": "对话历史",
          "en": "The chat history"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "模型只会输出文字。输出解析器把这段文字（JSON 字符串）解析成结构化数据，程序才能拿去调后端接口。45 节会动手做。",
        "en": "The model only outputs text. The output parser turns that text (a JSON string) into structured data the program can pass to the backend. Lesson 45 does it hands-on."
      }
    },
    {
      "t": "h",
      "zh": "二、归纳成六大模块",
      "en": "2. Six module groups"
    },
    {
      "t": "p",
      "zh": "[▶ 04:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=251) 回到文字说明，讲师把这些工具归纳成几大块，每一块都可以看成一个工具包：\n\n| 模块 | 视频怎么说 | 你会用到的组件（1.x） | 本课程 |\n|---|---|---|---|\n| 模型输入输出 Model I/O | 调用模型本身；提示词模板、多轮对话模板算输入的封装，对输出的解析算输出的封装 | 聊天模型、消息、提示词模板、输出解析器 | 45 节 |\n| 数据连接 | 文档的加载和处理、向量模型、向量数据库检索 | 文档加载器、文本切分器、向量模型、向量库、检索器 | 46 节 |\n| 对话历史管理 | 专门管理多轮对话历史的工具 | 消息列表、`MessagesPlaceholder`（45 节）；`trim_messages`、`filter_messages`（47 节） | 45、47 节 |\n| 链 Chain | 把调用大模型的流程定义成一条链；后来变成 LCEL | 竖线写法 `prompt` → `model` → `parser`（LCEL）、Runnable | 48 节 |\n| 智能体 Agent | 在链的基础上多次推理、使用不同工具完成复杂任务 | `@tool`、`create_agent`（视频第 49 集用的是旧的 `AgentExecutor`） | 49 节 |\n| 回调 Callback | 监控每一步的结果、响应各种事件 | 回调处理器 | 本节第三部分 |",
      "en": "[▶ 04:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=251) Going back to his written explanation, the instructor sums these tools up in groups – think of each group as a toolkit:\n\n| Module | What the video says | Components you'll use (1.x) | In this course |\n|---|---|---|---|\n| Model I/O | Calling the model itself; prompt templates and multi-turn templates wrap the input, parsing wraps the output | chat models, messages, prompt templates, output parsers | lesson 45 |\n| Data connection | Loading and processing documents, embedding models, vector-database retrieval | document loaders, text splitters, embedding models, vector stores, retrievers | lesson 46 |\n| Chat-history management | Dedicated tools for multi-turn history | message lists, `MessagesPlaceholder` (lesson 45); `trim_messages`, `filter_messages` (lesson 47) | lessons 45, 47 |\n| Chains | The flow of calling the model, defined as a chain; later became LCEL | the vertical-bar notation chaining `prompt` → `model` → `parser` (LCEL), Runnables | lesson 48 |\n| Agents | Repeated reasoning on top of chains, using different tools to finish complex tasks | `@tool`, `create_agent` (the lesson 49 video uses the older `AgentExecutor`) | lesson 49 |\n| Callbacks | Monitoring each step's result and reacting to events | callback handlers | part 3 of this lesson |"
    },
    {
      "t": "p",
      "zh": "[▶ 04:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=281) **链**是 LangChain 的核心设计，名字就是这么来的：Lang 是 language（语言），Chain 是链——「语言链」。它把调用大模型这种一步接一步的流程定义成一条链，最早就叫 chain；[▶ 05:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=313) 后来又发展出一套专门的表达方式，叫 **LangChain Expression Language（LCEL）**，用来描述这种流程。讲师说这是课上要重点讲的内容（本课程 48 节）。",
      "en": "[▶ 04:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=281) **Chains** are LangChain's core design, and the source of its name: Lang for language, Chain for chain – a “language chain”. It defines the step-by-step flow of calling an LLM as a chain, originally just called a chain; [▶ 05:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=313) later it grew a dedicated way of expressing such flows, the **LangChain Expression Language (LCEL)**. The instructor flags it as a key topic (lesson 48 in this course)."
    },
    {
      "t": "check",
      "q": {
        "zh": "视频里说的 LCEL 是什么？",
        "en": "What is the LCEL mentioned in the video?"
      },
      "options": [
        {
          "zh": "LangChain Expression Language：描述「调用大模型的流程」的一套表达方式，由早期的 chain 发展而来",
          "en": "LangChain Expression Language: a way to express “the flow of calling an LLM”, grown out of the early chains"
        },
        {
          "zh": "LangChain 自己训练的一个大模型",
          "en": "An LLM trained by LangChain itself"
        },
        {
          "zh": "一种向量数据库",
          "en": "A kind of vector database"
        },
        {
          "zh": "LangChain 的网页版聊天工具",
          "en": "LangChain's web chat tool"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "LangChain = Language + Chain。最早把流程叫 chain，后来用 LCEL（`prompt | model | parser` 这种写法）来表达，48 节细讲。",
        "en": "LangChain = Language + Chain. Flows were first called chains and are now expressed with LCEL (writing like `prompt | model | parser`), covered in lesson 48."
      }
    },
    {
      "t": "h",
      "zh": "三、智能体和回调",
      "en": "3. Agents and callbacks"
    },
    {
      "t": "p",
      "zh": "[▶ 05:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=313) **智能体**：上面那条「模板 → 模型 → 解析」的调用链路，只是智能体里的一步。[▶ 05:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=345) 智能体会多次推理，一遍遍地执行这种链式的步骤、调用不同的工具，去完成一个复杂任务。为此，LangChain 在基础链路上面又加了一层专为智能体准备的开发框架。\n\n[▶ 06:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=376) 讲师说，这一部分只会用 LangChain 自带的两个「玩具型」例子简单演示一下，让大家知道智能体是什么、怎么工作；他的原课程后面还有三堂课专门讲怎样做出能实战的智能体（提示词怎么设计、贴合业务的复杂工作流怎么搭、怎么用微调等）。本课程 49 节就是这两个玩具例子（ReAct 和 Self-Ask），讲义还补充了 1.x 推荐的 `create_agent`；在那之前，你已经在 05–07 节手写过智能体、在 25–42 节用 LangGraph 搭过。",
      "en": "[▶ 05:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=313) **Agents**: the “template → model → parser” chain above is only one step inside an agent. [▶ 05:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=345) An agent reasons several times, running such chain-like steps again and again and using different tools to finish a complex task. On top of the basic chain, LangChain adds a framework layer aimed specifically at agents.\n\n[▶ 06:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=376) The instructor says this part will only be demonstrated briefly with two “toy” examples that ship with LangChain, to show what an agent is and how it works; his original course has three later lectures devoted to building agents that work in practice (how to design the prompts, how to build complex workflows that fit the business, how to use fine-tuning, and so on). Lesson 49 of this course covers those two toy examples (ReAct and Self-Ask), and its notes add `create_agent`, the 1.x recommendation; before that, you will already have hand-written agents in lessons 05–07 and built them with LangGraph in 25–42."
    },
    {
      "t": "p",
      "zh": "[▶ 06:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=408) **回调**：如果想监控每个环节的结果、在每个事件触发时做出响应（打日志、统计 token、报警……），LangChain 提供了回调机制。用法是写一个类继承 `BaseCallbackHandler`，实现你关心的那几个方法，调用时通过 `config` 传进去。下面用一个不联网的假模型演示（类和方法回顾 08 节）：",
      "en": "[▶ 06:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=408) **Callbacks**: to monitor each stage's result and react whenever an event fires (logging, counting tokens, alerting…), LangChain has a callback mechanism. Write a class that inherits `BaseCallbackHandler`, implement the methods you care about, and pass it in through `config` when calling. Below, a demo with an offline fake model (classes and methods: lesson 08):"
    },
    {
      "t": "code",
      "file": "callbacks_demo.py",
      "code": {
        "zh": "from langchain_core.callbacks import BaseCallbackHandler\nfrom langchain_core.language_models.fake_chat_models import FakeListChatModel\n\nclass PrintSteps(BaseCallbackHandler):\n    \"\"\"模型开始、结束时，LangChain 会自动调用这两个方法\"\"\"\n    def on_chat_model_start(self, serialized, messages, **kwargs):\n        print(\"[回调] 模型开始，收到\", len(messages[0]), \"条消息\")\n\n    def on_llm_end(self, response, **kwargs):\n        print(\"[回调] 模型结束，回答：\", response.generations[0][0].text)\n\nmodel = FakeListChatModel(responses=[\"西湖\"])\nreply = model.invoke(\"杭州最有名的景点是哪个？\", config={\"callbacks\": [PrintSteps()]})\n# [回调] 模型开始，收到 1 条消息\n# [回调] 模型结束，回答： 西湖",
        "en": "from langchain_core.callbacks import BaseCallbackHandler\nfrom langchain_core.language_models.fake_chat_models import FakeListChatModel\n\nclass PrintSteps(BaseCallbackHandler):\n    \"\"\"LangChain calls these methods automatically when the model starts and ends\"\"\"\n    def on_chat_model_start(self, serialized, messages, **kwargs):\n        print(\"[callback] model starts with\", len(messages[0]), \"message(s)\")\n\n    def on_llm_end(self, response, **kwargs):\n        print(\"[callback] model ends, answer:\", response.generations[0][0].text)\n\nmodel = FakeListChatModel(responses=[\"West Lake\"])\nreply = model.invoke(\"What is Hangzhou's most famous sight?\", config={\"callbacks\": [PrintSteps()]})\n# [callback] model starts with 1 message(s)\n# [callback] model ends, answer: West Lake"
      },
      "note": {
        "zh": "注释里是实际运行的输出。`practice/l44_components_tour.py` 第 9 部分就是这段代码，不调用真实模型、不花钱。补充：实际开发中更常用 LangChain 官方的 **LangSmith** 平台做这件事——设置环境变量 `LANGSMITH_TRACING=true` 和 `LANGSMITH_API_KEY` 后，每次调用的提示词、回答、耗时、token 都会记录到网页上。它要单独注册，本课程不使用。",
        "en": "The comments show the real output. Part 9 of `practice/l44_components_tour.py` is this code – no real model calls, free. Extra: in practice people more often use LangChain's own **LangSmith** platform for this – set the environment variables `LANGSMITH_TRACING=true` and `LANGSMITH_API_KEY`, and every call's prompt, reply, duration and tokens are recorded on a web page. It needs its own sign-up, so this course doesn't use it."
      }
    },
    {
      "t": "h",
      "zh": "四、去哪里查文档",
      "en": "4. Where to read the docs"
    },
    {
      "t": "p",
      "zh": "[▶ 07:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=438) 讲师建议想把 LangChain 学透的同学深入读文档，重点看三类：\n1. **功能模块总览**：官方的 overview，介绍核心有哪些模块、各干什么、配什么例子。\n2. **API 文档**：真要用某个模块时查它；他评价 API 文档写得还可以，能用到的东西基本都能查明白。\n3. [▶ 07:51](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=471) **第三方集成（integrations）页面**：LangChain 和外部服务的集成比 LlamaIndex 丰富得多——各家大模型、向量数据库、向量模型、工具……都能在这里查到接口和示例。\n\n[▶ 08:24](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=504) 另外还有官方应用案例、部署指南等。\n\n补充：视频里展示的是旧版文档。LangChain 1.x 的文档现在集中在 [docs.langchain.com](https://docs.langchain.com/)（选 Python → LangChain），集成页面也在那里；网上搜到的旧文档页面，内容可能对不上你装的版本。",
      "en": "[▶ 07:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=438) The instructor advises anyone who wants to master LangChain to read its docs in depth, mainly three kinds:\n1. **The module overview**: the official overview of which core modules exist, what each does, with examples.\n2. **The API reference**: look a module up when you actually use it; he finds it decently written – you can work out almost anything you need from it.\n3. [▶ 07:51](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=471) **The integrations pages**: LangChain's integrations with outside services are far richer than LlamaIndex's – model providers, vector databases, embedding models, tools… you can find their interfaces and examples here.\n\n[▶ 08:24](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=45&t=504) There are also official use cases, deployment guides and more.\n\nExtra: the video shows older docs. LangChain 1.x's documentation now lives at [docs.langchain.com](https://docs.langchain.com/) (choose Python → LangChain), integrations included; old doc pages you find through search may not match your installed version."
    },
    {
      "t": "h",
      "zh": "五、补充：每个组件在 1.x 里叫什么、从哪里导入",
      "en": "5. Extra: what each component is called in 1.x, and where to import it"
    },
    {
      "t": "p",
      "zh": "| 组件 | 一句话 | 1.x 里的代表 | 导入自 |\n|---|---|---|---|\n| 聊天模型 | 用同一种写法调用各家模型 | `ChatDeepSeek`、`ChatOpenAI` | `langchain_deepseek`、`langchain_openai` |\n| 消息 | 对话里的一条消息 | `SystemMessage`、`HumanMessage`、`AIMessage`、`ToolMessage` | `langchain_core.messages` |\n| 提示词模板 | 带变量（槽）的提示词 | `PromptTemplate`、`ChatPromptTemplate` | `langchain_core.prompts` |\n| 输出解析器 | 把回答变成字符串、字典、对象 | `StrOutputParser`、`JsonOutputParser`、`PydanticOutputParser` | `langchain_core.output_parsers` |\n| 文档 | 一段文字，加上来源等信息 | `Document` | `langchain_core.documents` |\n| 文档加载器 | 把文件读成文档 | `TextLoader`、`PyPDFLoader` | `langchain_community.document_loaders` |\n| 文本切分器 | 把长文档切成小块 | `RecursiveCharacterTextSplitter` | `langchain_text_splitters` |\n| 向量模型 | 把文字变成一串数字（向量） | `DashScopeEmbeddings`、`FastEmbedEmbeddings` | `langchain_community.embeddings` |\n| 向量库 | 存向量，按意思相近程度查找 | `InMemoryVectorStore` | `langchain_core.vectorstores` |\n| 检索器 | 给一个问题，返回相关文档 | `vector_store.as_retriever()` | 由向量库生成 |\n| 工具 | 模型可以要求调用的函数 | `@tool` | `langchain_core.tools` |\n| 智能体 | 模型 + 工具 + 循环 | `create_agent` | `langchain.agents` |\n| 回调 | 每一步开始、结束时自动调用 | `BaseCallbackHandler` | `langchain_core.callbacks` |",
      "en": "| Component | In one line | 1.x example | Import from |\n|---|---|---|---|\n| Chat model | Call any provider's model the same way | `ChatDeepSeek`, `ChatOpenAI` | `langchain_deepseek`, `langchain_openai` |\n| Message | One message in a conversation | `SystemMessage`, `HumanMessage`, `AIMessage`, `ToolMessage` | `langchain_core.messages` |\n| Prompt template | A prompt with variables (slots) | `PromptTemplate`, `ChatPromptTemplate` | `langchain_core.prompts` |\n| Output parser | Turns a reply into a string, dict or object | `StrOutputParser`, `JsonOutputParser`, `PydanticOutputParser` | `langchain_core.output_parsers` |\n| Document | A piece of text plus info such as its source | `Document` | `langchain_core.documents` |\n| Document loader | Reads files into documents | `TextLoader`, `PyPDFLoader` | `langchain_community.document_loaders` |\n| Text splitter | Cuts long documents into chunks | `RecursiveCharacterTextSplitter` | `langchain_text_splitters` |\n| Embedding model | Turns text into a list of numbers (a vector) | `DashScopeEmbeddings`, `FastEmbedEmbeddings` | `langchain_community.embeddings` |\n| Vector store | Stores vectors and finds the closest in meaning | `InMemoryVectorStore` | `langchain_core.vectorstores` |\n| Retriever | Given a question, returns relevant documents | `vector_store.as_retriever()` | made from a vector store |\n| Tool | A function the model may ask to call | `@tool` | `langchain_core.tools` |\n| Agent | Model + tools + a loop | `create_agent` | `langchain.agents` |\n| Callback | Called automatically as each step starts and ends | `BaseCallbackHandler` | `langchain_core.callbacks` |"
    },
    {
      "t": "note",
      "zh": "不用背这张表。45–49 节会一个个用到，现在只要知道「有这些零件、大概在哪个包」。规律是：基础的、和厂商无关的组件在 `langchain_core`；和某家厂商有关的在它自己的集成包（`langchain_deepseek`、`langchain_openai`）；智能体在 `langchain`。上面这些导入都在你的 `.venv` 里实测过。",
      "en": "No need to memorise the table – lessons 45–49 use each part in turn; for now, just know the parts exist and roughly which package holds them. The pattern: basic, provider-neutral components live in `langchain_core`; provider-specific ones in their own integration packages (`langchain_deepseek`, `langchain_openai`); agents in `langchain`. Every import above was tested in your `.venv`."
    },
    {
      "t": "h",
      "zh": "六、补充：为什么这些零件能拼起来——统一的 invoke",
      "en": "6. Extra: why the parts fit together – one shared invoke"
    },
    {
      "t": "p",
      "zh": "视频说每一块都是一个工具包，链把它们串起来。能串起来的原因是：LangChain 里几乎所有组件都实现了同一个接口，叫 **Runnable**——都有 `invoke`（处理一个输入），还有 `stream`、`batch` 和对应的异步版本。提示词模板 `invoke` 一个字典，得到消息；模型 `invoke` 消息，得到 `AIMessage`；解析器 `invoke` 一个 `AIMessage`，得到字典……**上一步的输出正好是下一步的输入**。先用纯 Python 体会这个想法：",
      "en": "The video calls each group a toolkit and says chains string them together. They can be strung together because almost every LangChain component implements one interface called **Runnable**: each has `invoke` (one input), plus `stream`, `batch` and async versions. A prompt template `invoke`s a dict and yields messages; a model `invoke`s messages and yields an `AIMessage`; a parser `invoke`s an `AIMessage` and yields a dict… **each step's output is exactly the next step's input**. First, the idea in plain Python:"
    },
    {
      "t": "py",
      "title": {
        "zh": "同名方法，不同对象：统一接口的思路",
        "en": "Same method name, different objects: the idea of a shared interface"
      },
      "zh": "下面三个类做的事完全不同，但都有一个叫 `invoke` 的方法：接收一个输入，返回一个输出。调用的人不需要知道对方是哪个类，只管写 `step.invoke(value)`。这在 Python 里叫**鸭子类型**（duck typing）：「走起来像鸭子、叫起来像鸭子，就把它当鸭子」——只看它有没有这个方法，不看它是什么类。\n\n于是可以把它们放进一个列表，用 `for` 循环依次调用，把上一步的结果交给下一步。LangChain 的「链」就是这个思路。类和对象回顾 08 节；`type(step).__name__` 取出对象所属类的名字，`type()` 回顾 25 节。",
      "en": "The three classes below do completely different jobs, but each has a method called `invoke`: one input in, one output out. The caller doesn't need to know which class it is dealing with – it just writes `step.invoke(value)`. Python calls this **duck typing**: “if it walks like a duck and quacks like a duck, treat it as a duck” – what matters is having the method, not the class.\n\nSo they can sit in one list and be called in turn by a `for` loop, each result handed to the next. LangChain's “chains” are exactly this idea. For classes and objects, see lesson 08; `type(step).__name__` gets the name of the object's class (`type()`: see lesson 25).",
      "code": {
        "zh": "class Prompt:\n    def invoke(self, city):                 # 输入：城市名 → 输出：提示词\n        return f\"用一句话介绍{city}\"\n\nclass FakeModel:\n    def invoke(self, prompt):               # 输入：提示词 → 输出：带前缀的“回答”\n        return \"AI：\" + prompt + \"？好的，这是一座美丽的城市。\"\n\nclass Parser:\n    def invoke(self, reply):                # 输入：回答 → 输出：去掉前缀的文字\n        return reply.removeprefix(\"AI：\")   # removeprefix：去掉开头的那几个字\n\nsteps = [Prompt(), FakeModel(), Parser()]   # 三个完全不同的对象\nvalue = \"杭州\"\nfor step in steps:\n    value = step.invoke(value)              # 上一步的输出 = 下一步的输入\n    print(f\"{type(step).__name__} → {value}\")",
        "en": "class Prompt:\n    def invoke(self, city):                 # in: a city name -> out: a prompt\n        return f\"Describe {city} in one sentence\"\n\nclass FakeModel:\n    def invoke(self, prompt):               # in: a prompt -> out: an \"answer\" with a prefix\n        return \"AI: \" + prompt + \"? Sure - it is a beautiful city.\"\n\nclass Parser:\n    def invoke(self, reply):                # in: the answer -> out: the text without the prefix\n        return reply.removeprefix(\"AI: \")   # removeprefix: drop those leading characters\n\nsteps = [Prompt(), FakeModel(), Parser()]   # three completely different objects\nvalue = \"Hangzhou\"\nfor step in steps:\n    value = step.invoke(value)              # each output is the next step's input\n    print(f\"{type(step).__name__} -> {value}\")"
      }
    },
    {
      "t": "code",
      "file": "fake_chain.py",
      "code": {
        "zh": "from langchain_core.language_models.fake_chat_models import FakeListChatModel\nfrom langchain_core.output_parsers import JsonOutputParser\nfrom langchain_core.prompts import ChatPromptTemplate\n\nprompt = ChatPromptTemplate.from_messages([\n    (\"system\", \"从用户的话里提取套餐信息，只输出 JSON。\"),\n    (\"human\", \"{text}\"),\n])\nfake_model = FakeListChatModel(responses=['{\"price\": 10, \"type\": \"流量包\"}'])   # 假模型：按顺序返回写好的回答\nparser = JsonOutputParser()\n\nvalue = {\"text\": \"我要订一个 10 元的流量包\"}\nfor step in [prompt, fake_model, parser]:\n    value = step.invoke(value)              # 和上面的纯 Python 版一模一样\n    print(type(step).__name__, \"->\", type(value).__name__)\n# ChatPromptTemplate -> ChatPromptValue\n# FakeListChatModel -> AIMessage\n# JsonOutputParser -> dict\nprint(value)                                # {'price': 10, 'type': '流量包'}\n\nchain = prompt | fake_model | parser        # 同一件事的简写，48 节细讲 |",
        "en": "from langchain_core.language_models.fake_chat_models import FakeListChatModel\nfrom langchain_core.output_parsers import JsonOutputParser\nfrom langchain_core.prompts import ChatPromptTemplate\n\nprompt = ChatPromptTemplate.from_messages([\n    (\"system\", \"Extract the plan details from the user's message. Reply with JSON only.\"),\n    (\"human\", \"{text}\"),\n])\nfake_model = FakeListChatModel(responses=['{\"price\": 10, \"type\": \"data plan\"}'])   # a fake model: returns the given replies in order\nparser = JsonOutputParser()\n\nvalue = {\"text\": \"I want to subscribe to a 10-yuan data plan\"}\nfor step in [prompt, fake_model, parser]:\n    value = step.invoke(value)              # exactly like the plain-Python version above\n    print(type(step).__name__, \"->\", type(value).__name__)\n# ChatPromptTemplate -> ChatPromptValue\n# FakeListChatModel -> AIMessage\n# JsonOutputParser -> dict\nprint(value)                                # {'price': 10, 'type': 'data plan'}\n\nchain = prompt | fake_model | parser        # shorthand for the same thing; lesson 48 covers |"
      },
      "note": {
        "zh": "用的是视频里「订流量包」的例子。`FakeListChatModel` 是 LangChain 自带的「假模型」：不联网、不要 key，按顺序返回你写好的回答，常用来测试。它和 `ChatDeepSeek` 一样有 `invoke`，所以换成真模型时其他代码一行都不用改。运行 `practice/l44_components_tour.py` 可以看到六大模块各自的小例子（不调用真实模型，不花钱）。",
        "en": "This uses the video's “subscribe to a data plan” example. `FakeListChatModel` is LangChain's built-in fake model: offline, no key, it returns the replies you gave it in order – handy for tests. It has `invoke` just like `ChatDeepSeek`, so switching to the real model changes no other line. Run `practice/l44_components_tour.py` for a small example of each of the six groups (no real model calls, free)."
      }
    },
    {
      "t": "h",
      "zh": "七、补充：旧组件在 1.x 里去了哪里",
      "en": "7. Extra: where the old components went in 1.x"
    },
    {
      "t": "p",
      "zh": "如果视频或旧教程用的是 0.x，下面几个组件你会经常看到，但在 1.x 里已经换了做法：\n\n| 旧组件（0.x） | 1.x 的做法 | 本课程 |\n|---|---|---|\n| `LLMChain`、`SequentialChain` 等链类 | 用 LCEL 把组件连起来 | 48 节 |\n| `ConversationBufferMemory` 等 Memory 类 | 自己维护消息列表 + `MessagesPlaceholder`，太长时用 `trim_messages` 剪裁；智能体用 LangGraph 的检查点 | 45、47 节，30–32 节 |\n| `AgentExecutor`、`initialize_agent` | `create_agent`（底层就是一张 LangGraph 图） | 49 节、25 节 |\n\n这些旧类都搬进了 `langchain_classic` 包（实测还能导入），旧代码可以临时运行，新代码请用中间一列的做法。",
      "en": "If the video or an older tutorial uses 0.x, you'll often meet the components below, but 1.x does these jobs differently:\n\n| Old component (0.x) | The 1.x way | In this course |\n|---|---|---|\n| chain classes such as `LLMChain`, `SequentialChain` | connect components with LCEL | lesson 48 |\n| Memory classes such as `ConversationBufferMemory` | keep a message list yourself + `MessagesPlaceholder`, trimmed with `trim_messages` when it grows; agents use LangGraph checkpoints | lessons 45, 47, 30–32 |\n| `AgentExecutor`, `initialize_agent` | `create_agent` (under the hood, a LangGraph graph) | lessons 49, 25 |\n\nAll these old classes moved into the `langchain_classic` package (they still import – tested), so old code can run for now; write new code the way the middle column says."
    },
    {
      "t": "warn",
      "zh": "你装的 langchain-core 1.6 把 `InMemoryChatMessageHistory` 和 `RunnableWithMessageHistory` 也标成了**弃用**（实测会打印警告：`RunnableWithMessageHistory is deprecated. Use LangGraph's built-in persistence instead.`），计划在 2.0 删除。很多教程用它们管理对话历史；能跑，但官方建议改用 LangGraph 的持久化，也就是 30–32 节学过的检查点。",
      "en": "Your installed langchain-core 1.6 also marks `InMemoryChatMessageHistory` and `RunnableWithMessageHistory` as **deprecated** (tested – it warns `RunnableWithMessageHistory is deprecated. Use LangGraph's built-in persistence instead.`), with removal planned for 2.0. Many tutorials manage chat history with them; they still run, but the official advice is LangGraph persistence, i.e. the checkpoints from lessons 30–32."
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "文本切分器（`RecursiveCharacterTextSplitter`）属于哪个模块？",
        "en": "Which module group does the text splitter (`RecursiveCharacterTextSplitter`) belong to?"
      },
      "options": [
        {
          "zh": "模型输入输出",
          "en": "Model I/O"
        },
        {
          "zh": "数据连接",
          "en": "Data connection"
        },
        {
          "zh": "智能体",
          "en": "Agents"
        },
        {
          "zh": "回调",
          "en": "Callbacks"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "视频把文档的加载、处理、向量化、向量库检索都归到数据连接（46 节）。",
        "en": "The video puts loading and processing documents, embedding and vector-store retrieval under data connection (lesson 46)."
      }
    },
    {
      "q": {
        "zh": "按视频的划分，下面哪个**不属于**模型输入输出（Model I/O）？",
        "en": "By the video's grouping, which one is **not** part of Model I/O?"
      },
      "options": [
        {
          "zh": "提示词模板（输入的封装）",
          "en": "Prompt templates (wrapping the input)"
        },
        {
          "zh": "输出解析器（输出的封装）",
          "en": "Output parsers (wrapping the output)"
        },
        {
          "zh": "调用模型本身的统一接口",
          "en": "The uniform interface for calling the model"
        },
        {
          "zh": "向量数据库检索",
          "en": "Vector-database retrieval"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "模板（输入）、模型调用、解析器（输出）组成 Model I/O；向量库检索属于数据连接。",
        "en": "Templates (input), the model call and parsers (output) make up Model I/O; vector-store retrieval belongs to data connection."
      }
    },
    {
      "q": {
        "zh": "讲师说「LangChain」这个名字里的 Chain 指什么？",
        "en": "According to the instructor, what does the “Chain” in “LangChain” refer to?"
      },
      "options": [
        {
          "zh": "区块链",
          "en": "A blockchain"
        },
        {
          "zh": "一条把多个大模型串联训练的流水线",
          "en": "A pipeline that trains several LLMs in series"
        },
        {
          "zh": "把调用大模型这种一步接一步的流程定义成一条链；后来发展成 LCEL",
          "en": "The step-by-step flow of calling an LLM, defined as a chain; it later grew into LCEL"
        },
        {
          "zh": "LangChain 公司的连锁门店",
          "en": "LangChain's chain of stores"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "Lang 是 language，Chain 是链。链是 LangChain 的核心设计，后来用 LangChain Expression Language（LCEL）来表达，48 节细讲。",
        "en": "Lang is language, Chain is chain. Chains are LangChain's core design, later expressed with the LangChain Expression Language (LCEL) – lesson 48."
      }
    },
    {
      "q": {
        "zh": "视频里，智能体和链是什么关系？",
        "en": "In the video, how do agents relate to chains?"
      },
      "options": [
        {
          "zh": "智能体会多次推理，一遍遍执行这种链式步骤、调用不同工具来完成复杂任务；一条调用链只是其中一步",
          "en": "An agent reasons several times, running chain-like steps again and again with different tools to finish a complex task; one chain is just one step of it"
        },
        {
          "zh": "两者毫无关系",
          "en": "They are unrelated"
        },
        {
          "zh": "链是智能体的旧名字",
          "en": "“Chain” is the old name for agents"
        },
        {
          "zh": "智能体只能在 LangSmith 网页上运行",
          "en": "Agents run only on the LangSmith website"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "讲师的说法：一次「模板 → 模型 → 解析」只是智能体里的一步；智能体在这个基础上反复推理、用工具。你在 05–07 节手写的循环就是这样。",
        "en": "In the instructor's words: one “template → model → parser” pass is only one step of an agent, which reasons repeatedly and uses tools on top of it – just like the loop you hand-wrote in lessons 05–07."
      }
    },
    {
      "q": {
        "zh": "想在每次调用模型开始和结束时自动打日志，按视频的划分该用哪一块？",
        "en": "To log automatically whenever a model call starts and ends, which group (by the video's split) do you use?"
      },
      "options": [
        {
          "zh": "数据连接",
          "en": "Data connection"
        },
        {
          "zh": "对话历史管理",
          "en": "Chat-history management"
        },
        {
          "zh": "回调",
          "en": "Callbacks"
        },
        {
          "zh": "输出解析器",
          "en": "Output parsers"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "回调用来监控每一步、响应事件：写一个继承 `BaseCallbackHandler` 的类，通过 `config={\"callbacks\": [...]}` 传进去。",
        "en": "Callbacks monitor each step and react to events: write a class inheriting `BaseCallbackHandler` and pass it via `config={\"callbacks\": [...]}`."
      }
    },
    {
      "q": {
        "zh": "讲师说，和 LlamaIndex 相比，LangChain 哪方面明显更丰富？",
        "en": "Compared with LlamaIndex, where does the instructor say LangChain is clearly richer?"
      },
      "options": [
        {
          "zh": "RAG 检索做得更细",
          "en": "More thorough RAG retrieval"
        },
        {
          "zh": "和第三方服务的集成：各家模型、向量库、向量模型、工具等",
          "en": "Third-party integrations: model providers, vector stores, embedding models, tools and more"
        },
        {
          "zh": "自带一个更强的大模型",
          "en": "It ships a stronger LLM"
        },
        {
          "zh": "不需要写代码",
          "en": "No code needed"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "他说检索这块 LlamaIndex 更细，但集成的丰富程度 LangChain 好很多，官方专门有 integrations 页面。",
        "en": "He says LlamaIndex is more thorough at retrieval, but LangChain's range of integrations is much richer, with a dedicated integrations section in its docs."
      }
    }
  ],
  "pitfalls": [
    {
      "zh": "把 LangChain 当成一个模型。它是一套组件库，真正回答问题的还是 DeepSeek、qwen-plus 这些模型。",
      "en": "Thinking LangChain is a model. It is a component library; the answers still come from models such as DeepSeek or qwen-plus."
    },
    {
      "zh": "以为模型给的就是结构化数据。模型只输出文字，要用输出解析器（或 45 节的结构化输出）才能变成程序能用的字段。",
      "en": "Assuming the model returns structured data. It only outputs text; an output parser (or lesson 45's structured output) turns it into fields a program can use."
    },
    {
      "zh": "照抄旧教程里的 `LLMChain`、`ConversationBufferMemory`、`AgentExecutor`，在 1.x 里报 `ImportError`。先看第七部分的对照表。",
      "en": "Copying `LLMChain`, `ConversationBufferMemory` or `AgentExecutor` from old tutorials – `ImportError` in 1.x. Check the table in part 7 first."
    },
    {
      "zh": "以为所有组件都在 `langchain` 包里。大部分基础组件在 `langchain_core`，各家厂商的在自己的集成包里。",
      "en": "Assuming every component is in the `langchain` package. Most basic ones are in `langchain_core`; provider-specific ones in their own integration packages."
    },
    {
      "zh": "照着网上搜到的旧文档页面写代码。1.x 的文档在 docs.langchain.com，先确认文档和你装的版本对得上。",
      "en": "Coding from old doc pages found through search. 1.x's docs are at docs.langchain.com – check that the docs match your installed version first."
    }
  ],
  "recap": [
    {
      "zh": "最基本的数据流：文本 → 提示词模板 → 大模型 → 输出解析器 → 结构化数据；旁边是对话历史（筛选、截断）和检索器（查数据源）。",
      "en": "The basic flow: text → prompt template → LLM → output parser → structured data; beside it, chat history (filtered, trimmed) and a retriever (queries a data source)."
    },
    {
      "zh": "六大模块：模型输入输出、数据连接、对话历史管理、链、智能体、回调，分别对应 45、46、47、48、49 节和本节的回调示例。",
      "en": "Six groups: Model I/O, data connection, chat-history management, chains, agents and callbacks – lessons 45, 46, 47, 48, 49 and this lesson's callback demo."
    },
    {
      "zh": "LangChain = Language + Chain；链后来发展成 LCEL（LangChain Expression Language）。",
      "en": "LangChain = Language + Chain; chains later grew into LCEL (LangChain Expression Language)."
    },
    {
      "zh": "智能体在链的基础上多次推理、调用工具；回调用来监控每一步，写一个继承 `BaseCallbackHandler` 的类传进 `config`。",
      "en": "Agents reason repeatedly and use tools on top of chains; callbacks monitor each step via a `BaseCallbackHandler` subclass passed in `config`."
    },
    {
      "zh": "查文档：模块总览、API 文档、第三方集成页面；LangChain 的集成比 LlamaIndex 丰富得多。1.x 文档在 docs.langchain.com。",
      "en": "Docs: the module overview, the API reference and the integrations pages; LangChain's integrations are far richer than LlamaIndex's. 1.x docs live at docs.langchain.com."
    },
    {
      "zh": "补充：基础组件在 `langchain_core`，厂商集成在各自的包里；所有组件都有 `invoke`，上一步的输出是下一步的输入，所以能连成链。",
      "en": "Extra: basic components live in `langchain_core`, provider integrations in their own packages; every component has `invoke`, each output feeds the next input, so they chain."
    }
  ],
  "files": [
    {
      "path": "practice/l44_components_tour.py",
      "zh": "组件一览：按视频的六大模块各举一个小例子——消息、模板、假模型、解析器、统一的 `invoke`、文档切分、工具、对话历史、回调。不调用真实模型，不需要 key。",
      "en": "Component tour: one small example per module group from the video – messages, templates, a fake model, parsers, the shared `invoke`, document splitting, tools, chat history and callbacks. No real model calls, no key needed."
    }
  ]
});
