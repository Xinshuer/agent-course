COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l25",
  "priority": "overview",
  "handwrite": false,
  "studyMinutes": 20,
  "source": "subtitle",
  "summary": {
    "zh": "这一集讲 LangChain 和 LangGraph 的分工：LangChain 提供组件，简化大模型应用开发，它的 Agent 是单智能体，适合简单、专一的任务；LangGraph 专注智能体编排和工作流，适合复杂工作流、多智能体和生产环境。LangGraph 多出来的东西：用「图」代替「链」，默认带一层持久化（记忆 + 人机交互，可以看成一个状态机），大幅增强的流式输出，以及面向生产的部署和监控平台。讲义补充：在你装的 1.x 里，LangChain 的 `create_agent` 本身就是一张 LangGraph 图。",
    "en": "This episode explains how LangChain and LangGraph divide the work: LangChain supplies components that simplify building LLM apps, and its agents are single agents for simple, focused tasks; LangGraph focuses on orchestrating agents and workflows – complex workflows, multi-agent systems, production. What LangGraph adds: a “graph” instead of a “chain”, a built-in persistence layer (memory + human-in-the-loop, best seen as a state machine), much stronger streaming, and a platform for deploying and monitoring in production. The notes add that in your installed 1.x, LangChain's `create_agent` itself is a LangGraph graph."
  },
  "goals": [
    {
      "zh": "说清 LangChain 和 LangGraph 的定位区别，判断一个需求该用哪个",
      "en": "Explain how LangChain and LangGraph differ in purpose, and pick the right one for a need"
    },
    {
      "zh": "说出 LangGraph 比 LangChain 多出来的几样：图、持久化层（记忆、人机交互）、流式输出、生产环境的平台和监控",
      "en": "Name what LangGraph adds over LangChain: graphs, a persistence layer (memory, human-in-the-loop), streaming, production platform and monitoring"
    },
    {
      "zh": "把第 06 节的工具调用循环看成一张图（model ⇄ tools），并会用 `type()`、`isinstance()`、`dir()` 查看陌生的框架对象",
      "en": "See lesson 06's tool-call loop as a graph (model ⇄ tools), and inspect unfamiliar framework objects with `type()`, `isinstance()`, `dir()`"
    },
    {
      "zh": "知道后面第 26–42 节分别讲 LangGraph 的哪项能力",
      "en": "Know which LangGraph capability each of lessons 26–42 covers"
    }
  ],
  "blocks": [
    {
      "t": "video",
      "zh": "这一集不到 5 分钟，是 LangGraph 部分的开场，只讲解、不写代码。顺序：\n- [▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=26&t=0) LangChain 解决什么问题，它的 Agent 适合什么\n- [▶ 01:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=26&t=64) LangGraph 聚焦编排和工作流；两个框架怎么选\n- [▶ 01:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=26&t=96) LangGraph 多了什么：图，持久化层\n- [▶ 03:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=26&t=191) 流式输出，面向生产的平台和监控工具\n- [▶ 03:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=26&t=223) 为什么推荐 LangGraph\n\n老师说「前面学过 LangChain」，是按他原来的课程顺序讲的；这套合集的 LangChain 部分在第 43–50 节。这一集用到的 LangChain 知识只有一点点，下面会顺带解释。",
      "en": "This episode, under 5 minutes, opens the LangGraph part; it is talk only, no code. The order:\n- [▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=26&t=0) What LangChain solves, and what its agents are good for\n- [▶ 01:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=26&t=64) LangGraph focuses on orchestration and workflows; how to choose between the two\n- [▶ 01:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=26&t=96) What LangGraph adds: graphs, a persistence layer\n- [▶ 03:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=26&t=191) Streaming, and a production platform with monitoring tools\n- [▶ 03:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=26&t=223) Why he recommends LangGraph\n\nWhen the instructor says “we learned LangChain earlier”, he means his original course order; in this series LangChain is lessons 43–50. This episode needs only a little LangChain knowledge, explained below as it comes up."
    },
    {
      "t": "h",
      "zh": "一、LangChain 管「组件」，LangGraph 管「编排」",
      "en": "1. LangChain does components, LangGraph does orchestration"
    },
    {
      "t": "p",
      "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=26&t=0) 上两节讲了多智能体架构，那在 LangChain 这个生态里怎么实现它？先分清两个框架：\n\n- **LangChain** 的目标是简化大模型应用开发：它提供各种组件（接入模型、提示词模板、检索等）和把组件组合起来的方式。\n- [▶ 00:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=26&t=33) LangChain 里也有 Agent，但它是**单智能体**架构，官方的建议是：简单、专一的任务用它就好。老师还提到，从 0.2 版本以后，LangChain 里「记忆」这一层已经被挪到了 LangGraph 里。\n- [▶ 01:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=26&t=64) **LangGraph** 的重点是**智能体的编排**和**工作流的搭建**。\n\n| 你的需求 | 用哪个 |\n|---|---|\n| 在系统里加一条链、调一下模型、做一个简单的 RAG | LangChain 就够了（第 43–48 节） |\n| 复杂的工作流、多个 Agent 协作完成复杂任务 | LangGraph |\n| 还要部署到生产环境 | LangGraph |",
      "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=26&t=0) The last two lessons covered multi-agent architectures – so how are they built in the LangChain ecosystem? First, tell the two frameworks apart:\n\n- **LangChain** aims to simplify building LLM apps: it provides components (model access, prompt templates, retrieval and so on) and ways to combine them.\n- [▶ 00:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=26&t=33) LangChain has agents too, but they are **single-agent** designs, and the official advice is to use them for simple, focused tasks. The instructor adds that since version 0.2, LangChain's “memory” layer has moved into LangGraph.\n- [▶ 01:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=26&t=64) **LangGraph** focuses on **orchestrating agents** and **building workflows**.\n\n| What you need | Use |\n|---|---|\n| Add a chain to a system, call a model, build a simple RAG | LangChain is enough (lessons 43–48) |\n| Complex workflows; several agents cooperating on complex tasks | LangGraph |\n| On top of that, deployment to production | LangGraph |"
    },
    {
      "t": "note",
      "zh": "在你装的版本里，这个分工更明显了：LangChain 1.x 里旧的对话记忆写法（`RunnableWithMessageHistory`、`InMemoryChatMessageHistory`）已被标记为弃用，官方让你改用 LangGraph 的持久化；而 LangChain 1.x 的 `create_agent` 本身就搭在 LangGraph 上（第二节马上验证）。",
      "en": "In your installed versions the split is even clearer: LangChain 1.x marks its old chat-memory classes (`RunnableWithMessageHistory`, `InMemoryChatMessageHistory`) as deprecated in favour of LangGraph persistence, and LangChain 1.x's `create_agent` is itself built on LangGraph (verified in part 2)."
    },
    {
      "t": "h",
      "zh": "二、名字就是区别：链（Chain）和图（Graph）",
      "en": "2. The names say it: chain vs graph"
    },
    {
      "t": "p",
      "zh": "[▶ 01:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=26&t=96) LangGraph 多出来的第一样，就写在名字里：Graph，图。LangChain 的核心是**链**，LangGraph 引入了**图计算**的方式来重新组织整个系统——老师觉得这两个名字起得很准：一个是语言的链，一个是语言的图。\n\n- 链：A → B → C，一路往前走。\n- 图：由节点和边组成，可以分支，也可以**往回走（循环）**。\n\nAgent 恰恰离不开循环：想一想、调工具、再想一想……你在第 06 节写的工具调用循环，画出来就是一张图：",
      "en": "[▶ 01:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=26&t=96) The first thing LangGraph adds is in its name: Graph. LangChain's core is the **chain**; LangGraph reorganises the whole system around **graph computation**. The instructor finds the names very apt: one is a chain of language steps, the other a graph.\n\n- A chain: A → B → C, always forward.\n- A graph: nodes joined by edges; it can branch and can **go back (loop)**.\n\nAgents depend on loops: think, call a tool, think again… The tool-call loop you wrote in lesson 06, drawn out, is a graph:"
    },
    {
      "t": "code",
      "file": {
        "zh": "示意图：工具调用循环就是一张图",
        "en": "diagram: the tool-call loop is a graph"
      },
      "lang": "text",
      "code": "START --> [model] --has tool_calls--> [tools]\n            |  ^                         |\n            |  +-------------------------+\n            |\n            +--no tool_calls--> END"
    },
    {
      "t": "p",
      "zh": "对照第 06 节的代码：`model` 节点 = 调一次模型；`tools` 节点 = 执行模型要求的工具；从 `model` 出发是一条**条件边**（有 `tool_calls` 去 `tools`，没有就到 `END`）；`tools` 执行完回到 `model`，形成循环。\n\n讲义补充：LangChain 1.x 的 `create_agent` 生成的正是这张图，可以直接打印出来看（不调用模型、不花钱）：",
      "en": "Compare with lesson 06: the `model` node = one model call; the `tools` node = run the tools the model asked for; leaving `model` is a **conditional edge** (with `tool_calls` go to `tools`, otherwise to `END`); after `tools`, back to `model` – the loop.\n\nAn extra from the notes: LangChain 1.x's `create_agent` builds exactly this graph, and you can print it (no model calls, free):"
    },
    {
      "t": "code",
      "file": "peek_agent_graph.py",
      "code": {
        "zh": "from langchain.agents import create_agent\nfrom langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\n@tool\ndef get_temperature(city: str) -> str:\n    \"\"\"Return the current temperature of a city.\"\"\"\n    return f\"{city}: 20°C\"\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)       # 只创建对象，不发请求\nagent = create_agent(model=model, tools=[get_temperature])\n\nprint(type(agent).__name__)          # CompiledStateGraph —— 一张编译好的 LangGraph 图\ngraph = agent.get_graph()\nprint(list(graph.nodes))             # ['__start__', 'model', 'tools', '__end__']\nfor edge in graph.edges:\n    print(edge.source, \"->\", edge.target, \"条件边\" if edge.conditional else \"普通边\")\n# __start__ -> model 普通边\n# model -> __end__ 条件边\n# model -> tools 条件边\n# tools -> model 条件边",
        "en": "from langchain.agents import create_agent\nfrom langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\n@tool\ndef get_temperature(city: str) -> str:\n    \"\"\"Return the current temperature of a city.\"\"\"\n    return f\"{city}: 20°C\"\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)       # only builds an object, sends nothing\nagent = create_agent(model=model, tools=[get_temperature])\n\nprint(type(agent).__name__)          # CompiledStateGraph - a compiled LangGraph graph\ngraph = agent.get_graph()\nprint(list(graph.nodes))             # ['__start__', 'model', 'tools', '__end__']\nfor edge in graph.edges:\n    print(edge.source, \"->\", edge.target, \"conditional\" if edge.conditional else \"normal\")\n# __start__ -> model normal\n# model -> __end__ conditional\n# model -> tools conditional\n# tools -> model conditional"
      },
      "note": {
        "zh": "框架代码不能在浏览器里运行，请运行本地文件 `practice/l25_peek_agent_graph.py`，它还会打印一段 Mermaid 文本，粘贴到 [mermaid.live](https://mermaid.live) 就能看到这张图。`tools -> model` 也标成了条件边，是因为 `create_agent` 允许某些工具执行完直接结束；一般情况下就是回到 `model`。`@tool` 和 `ChatDeepSeek` 是 LangChain 的组件，第 43 节以后细讲，这里只需要认得。",
        "en": "Framework code cannot run in the browser; run the local file `practice/l25_peek_agent_graph.py`. It also prints Mermaid text – paste it into [mermaid.live](https://mermaid.live) to see the picture. `tools -> model` is marked conditional because `create_agent` lets some tools end the run directly; normally it just goes back to `model`. `@tool` and `ChatDeepSeek` are LangChain components covered from lesson 43 on; here you only need to recognise them."
      }
    },
    {
      "t": "note",
      "zh": "如果旧教程里写的是 `from langgraph.prebuilt import create_react_agent`：在你装的 LangGraph 1.x 里它已被标记为**弃用**，提示你改用 `from langchain.agents import create_agent`。旧写法暂时还能运行，但会打印警告。",
      "en": "If an older tutorial uses `from langgraph.prebuilt import create_react_agent`: in your installed LangGraph 1.x it is marked **deprecated** and points you to `from langchain.agents import create_agent`. The old form still runs for now, but prints a warning."
    },
    {
      "t": "py",
      "title": {
        "zh": "看清一个对象是什么：type()、isinstance()、dir()",
        "en": "What is this object? type(), isinstance(), dir()"
      },
      "zh": "用框架时经常拿到一个从没见过的对象（比如上面的 `agent`）。先别猜，打印出来看：\n- `type(x).__name__`：它是什么类型；\n- `isinstance(x, 某个类型)`：它是不是这种类型，返回 `True` / `False`；\n- `dir(x)`：它有哪些属性和方法（以 `_` 开头的是内部用的，可以先忽略）。\n\n顺便注意**函数本身**和**函数调用的结果**的区别：`clean` 是函数，`clean(...)` 是它返回的值。后面往图里注册节点时，要交的是函数本身。",
      "en": "Frameworks often hand you an object you have never seen (like `agent` above). Don't guess – print it:\n- `type(x).__name__`: what type it is;\n- `isinstance(x, SomeType)`: whether it is that type, `True` / `False`;\n- `dir(x)`: its attributes and methods (names starting with `_` are internal; ignore them for now).\n\nAlso note the difference between **a function** and **the result of calling it**: `clean` is the function, `clean(...)` is the value it returns. When you register graph nodes later, you hand over the function itself.",
      "code": {
        "zh": "history = [{\"role\": \"user\", \"content\": \"你好\"}]\nprint(type(history).__name__)        # list\nprint(type(history[0]).__name__)     # dict\nprint(isinstance(history, list))     # True\nprint(isinstance(history, dict))     # False\n\ndef clean(state):\n    return {\"text\": state[\"text\"].strip()}\n\nprint(type(clean).__name__)                      # function —— 函数本身\nprint(type(clean({\"text\": \" hi \"})).__name__)   # dict —— 加了括号就是调用，得到返回值\n\nmethods = [name for name in dir(history) if not name.startswith(\"_\")]\nprint(methods)                       # 列表能用的方法：append、clear、copy……",
        "en": "history = [{\"role\": \"user\", \"content\": \"Hi\"}]\nprint(type(history).__name__)        # list\nprint(type(history[0]).__name__)     # dict\nprint(isinstance(history, list))     # True\nprint(isinstance(history, dict))     # False\n\ndef clean(state):\n    return {\"text\": state[\"text\"].strip()}\n\nprint(type(clean).__name__)                      # function - the function itself\nprint(type(clean({\"text\": \" hi \"})).__name__)   # dict - parentheses call it and give the return value\n\nmethods = [name for name in dir(history) if not name.startswith(\"_\")]\nprint(methods)                       # what a list can do: append, clear, copy..."
      }
    },
    {
      "t": "h",
      "zh": "三、LangGraph 多出来的几样东西",
      "en": "3. What else LangGraph adds"
    },
    {
      "t": "p",
      "zh": "[▶ 02:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=26&t=128) 除了「图」，老师认为 LangGraph 还有三样东西是 LangChain 没有、或者被大幅改进的：\n\n1. [▶ 02:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=26&t=159) **持久化层**：把整个 AI 交互过程保存下来。LangGraph 默认就带这一层，**记忆管理**和**人机交互**都建立在它上面。可以把它理解成一个**状态机**。老师拿前端的 Redux 作类比，Redux 就是专门管理状态的一层：所有状态集中放在一个地方，每一步都去读它、更新它。\n2. [▶ 03:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=26&t=191) **流式输出**大幅增强：图一边运行，一边把进度和文字推出来。\n3. **面向生产环境的 Agent 运维**：部署用的云平台，以及做监控和调优的 Studio 工具（老师说它有点像 LangSmith）。所以 LangGraph 是完全面向生产、商业环境设计的。\n\n这些能力在课程后面的位置：\n\n| 能力 | 一句话 | 课程位置 |\n|---|---|---|\n| 节点与可控制性 | 流程由你画：串行、分支、条件分支、循环 | 26–29 |\n| 持久化与记忆 | 每走一步存一个检查点；能接着聊，中断了能续跑 | 30–32 |\n| 人机交互 | 在某一步暂停，等人确认或修改后再继续 | 33–36 |\n| 时光旅行 | 回到之前的检查点查看，或改一改重新跑 | 37 |\n| 流式输出 | 一边运行一边输出 | 38 |\n| 工具调用 | 预置组件帮你执行模型要求的工具 | 39 |\n| 实战 | 代码助手、提示词生成助手、多智能体版助手 | 40–42 |",
      "en": "[▶ 02:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=26&t=128) Besides graphs, the instructor sees three things LangChain lacks or LangGraph greatly improves:\n\n1. [▶ 02:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=26&t=159) **A persistence layer** that saves the whole AI interaction. LangGraph ships with it, and both **memory management** and **human-in-the-loop** are built on it. Think of it as a **state machine**. The instructor compares it to Redux from front-end work, a layer whose whole job is managing state: all state lives in one central place, and every step reads and updates it.\n2. [▶ 03:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=26&t=191) **Much stronger streaming**: the graph pushes out progress and text while it runs.\n3. **Agent operations for production**: a cloud platform for deployment and a Studio tool for monitoring and tuning (a bit like LangSmith, he says). LangGraph is designed squarely for production and commercial use.\n\nWhere these appear later in the course:\n\n| Capability | In one sentence | Lessons |\n|---|---|---|\n| Nodes & controllability | You draw the flow: sequences, branches, conditions, loops | 26–29 |\n| Persistence & memory | A checkpoint after every step; chats continue, interrupted runs resume | 30–32 |\n| Human-in-the-loop | Pause at a step until a person approves or edits | 33–36 |\n| Time travel | Go back to an earlier checkpoint to inspect it or re-run with changes | 37 |\n| Streaming | Output while running | 38 |\n| Tool calling | Ready-made pieces that run the tools the model asks for | 39 |\n| Projects | A coding assistant, a prompt-generator assistant, a multi-agent assistant | 40–42 |"
    },
    {
      "t": "note",
      "zh": "名字的变化：视频里说的部署云平台（当时叫 LangGraph Platform）和 Studio，现在都归到了 LangSmith 名下，官方文档里部署平台叫 LangSmith Deployment。本课程只在本地运行，用不到它们。",
      "en": "Name changes: the deployment platform in the video (then called LangGraph Platform) and Studio now live under the LangSmith brand; the official docs call the deployment platform LangSmith Deployment. This course runs everything locally and doesn't need them."
    },
    {
      "t": "check",
      "q": {
        "zh": "老师用前端的 Redux 来比喻 LangGraph 的哪一部分？",
        "en": "Which part of LangGraph does the instructor compare to Redux from front-end work?"
      },
      "options": [
        {
          "zh": "流式输出",
          "en": "Streaming"
        },
        {
          "zh": "部署用的云平台",
          "en": "The cloud deployment platform"
        },
        {
          "zh": "持久化层：像一个集中管理状态的状态机，记忆和人机交互都靠它",
          "en": "The persistence layer: a state machine that manages state centrally; memory and human-in-the-loop rely on it"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "持久化层把状态集中保存起来，每一步都读它、更新它，所以像一个状态机。",
        "en": "The persistence layer keeps the state in one place that every step reads and updates – like a state machine."
      }
    },
    {
      "t": "h",
      "zh": "四、老师为什么推荐 LangGraph",
      "en": "4. Why the instructor recommends LangGraph"
    },
    {
      "t": "p",
      "zh": "[▶ 03:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=26&t=223) 很多人吐槽 LangChain 生态学习曲线陡、文档乱。老师承认这些问题，但他认为这个生态考虑到了实际开发中的很多需求：有的框架做个 demo 没问题，真放到业务场景里就用不起来；LangGraph 则是奔着生产环境去的。这是他推荐它的主要原因。\n\n[▶ 04:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=26&t=254) 接下来，老师会把 LangGraph 的核心组件一个个拆开讲，下一节从「节点与可控制性」开始。",
      "en": "[▶ 03:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=26&t=223) Many people complain that the LangChain ecosystem has a steep learning curve and messy docs. The instructor admits this, but argues it takes real-world development needs into account: some frameworks are fine for a demo but fall apart in a real business setting, whereas LangGraph is built for production. That is his main reason for recommending it.\n\n[▶ 04:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=26&t=254) Next, the instructor takes LangGraph's core components apart one by one, starting in the next lesson with “nodes & controllability”."
    },
    {
      "t": "warn",
      "zh": "LangGraph 是底层框架：控制力最强，要写的代码也更多。如果需求只是一次调用或一个普通的工具调用 Agent，直接调 API、手写循环或用 `create_agent` 更省事。另外，网上很多教程还是 0.x 时代的写法，你装的是 LangGraph 1.2；对不上时，以本课程验证过的代码和[官方文档](https://docs.langchain.com/oss/python/langgraph/overview)为准。",
      "en": "LangGraph is low-level: the most control, and more code. If you only need one call or an ordinary tool-calling agent, calling the API, a hand-written loop or `create_agent` is simpler. Also, many online tutorials still use 0.x-era code while you have LangGraph 1.2; when they disagree, trust this course's tested code and the [official docs](https://docs.langchain.com/oss/python/langgraph/overview)."
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "按视频的说法，LangChain 自带的 Agent 适合什么任务？",
        "en": "According to the video, what are LangChain's own agents suited for?"
      },
      "options": [
        {
          "zh": "多个 Agent 协作的复杂任务",
          "en": "Complex tasks with several cooperating agents"
        },
        {
          "zh": "简单、专一的任务——它是单智能体架构",
          "en": "Simple, focused tasks – it is a single-agent design"
        },
        {
          "zh": "只能用来做 RAG",
          "en": "Only RAG"
        },
        {
          "zh": "只能在生产环境里用",
          "en": "Only production use"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "LangChain 的 Agent 是单智能体，官方建议用于简单、专一的任务；复杂工作流和多智能体交给 LangGraph。",
        "en": "LangChain's agents are single agents, recommended for simple, focused tasks; complex workflows and multi-agent systems go to LangGraph."
      }
    },
    {
      "q": {
        "zh": "你只想在现有系统里加一步「调用模型把文章总结成三句话」。该用哪个？",
        "en": "You only want to add one step to an existing system: “call a model to summarise an article in three sentences”. Which should you use?"
      },
      "options": [
        {
          "zh": "LangChain（甚至直接调 API）就够了",
          "en": "LangChain – or even a direct API call – is enough"
        },
        {
          "zh": "必须用 LangGraph 搭一张多智能体图",
          "en": "You must build a multi-agent graph in LangGraph"
        },
        {
          "zh": "必须先部署到云平台",
          "en": "You must deploy to a cloud platform first"
        },
        {
          "zh": "必须用分级架构",
          "en": "You must use a hierarchical architecture"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "老师的划分：加条链、调个模型、做简单 RAG，用 LangChain 就够了；复杂工作流、多智能体、上生产才推荐 LangGraph。",
        "en": "The instructor's split: a chain, a model call or a simple RAG needs only LangChain; complex workflows, multiple agents and production call for LangGraph."
      }
    },
    {
      "q": {
        "zh": "下面哪一项**不是**视频里说的 LangGraph 比 LangChain 多出来（或大幅改进）的东西？",
        "en": "Which is **not** something the video says LangGraph adds to (or greatly improves over) LangChain?"
      },
      "options": [
        {
          "zh": "用图计算代替链来组织系统",
          "en": "Organising the system as a graph instead of a chain"
        },
        {
          "zh": "默认带一层持久化（记忆 + 人机交互）",
          "en": "A built-in persistence layer (memory + human-in-the-loop)"
        },
        {
          "zh": "让任何不支持工具调用的模型都能调用工具",
          "en": "Letting any model without tool support call tools"
        },
        {
          "zh": "面向生产的部署平台和监控工具",
          "en": "A production deployment platform and monitoring tools"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "老师列的是图、持久化层、流式输出、生产部署和监控，没有这一项。模型原生支不支持工具调用取决于模型本身（第 23 节），换成 LangGraph 也不会让它突然支持。",
        "en": "The instructor lists graphs, the persistence layer, streaming, and production deployment and monitoring – not this. Whether a model natively supports tool calling depends on the model itself (lesson 23); switching to LangGraph won't suddenly add it."
      }
    },
    {
      "q": {
        "zh": "程序跑到一半中断了，重启后想从刚才那一步接着跑，依靠的是哪一层？",
        "en": "A run stops halfway; after restarting you want to continue from the last step. Which layer makes that possible?"
      },
      "options": [
        {
          "zh": "流式输出",
          "en": "Streaming"
        },
        {
          "zh": "条件边",
          "en": "Conditional edges"
        },
        {
          "zh": "工具调用",
          "en": "Tool calling"
        },
        {
          "zh": "持久化层：每一步的状态都存了下来",
          "en": "The persistence layer: the state after every step is saved"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "持久化层保存了每一步之后的状态，所以能从中断处继续；记忆、人机交互、时光旅行也都建立在它上面。",
        "en": "The persistence layer saves the state after each step, so a run can resume where it stopped; memory, human-in-the-loop and time travel build on it too."
      }
    },
    {
      "q": {
        "zh": "`create_agent(...)` 在你装的 LangChain 1.x 里返回的是什么？",
        "en": "In your installed LangChain 1.x, what does `create_agent(...)` return?"
      },
      "options": [
        {
          "zh": "一个字符串，是模型的回答",
          "en": "A string – the model's answer"
        },
        {
          "zh": "一张编译好的 LangGraph 图（`CompiledStateGraph`），节点是 model 和 tools",
          "en": "A compiled LangGraph graph (`CompiledStateGraph`) with model and tools nodes"
        },
        {
          "zh": "一个 OpenAI 的 `client` 对象",
          "en": "An OpenAI `client` object"
        },
        {
          "zh": "一个字典，里面是工具说明",
          "en": "A dict of tool definitions"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "用 `type(agent).__name__` 打印就能看到。LangChain 1.x 的 Agent 运行在 LangGraph 之上。",
        "en": "Print `type(agent).__name__` to see it. LangChain 1.x agents run on top of LangGraph."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "看清陌生对象：type()、isinstance()、dir()",
        "en": "Inspect an unfamiliar object: type(), isinstance(), dir()"
      },
      "code": {
        "zh": "history = [{\"role\": \"user\", \"content\": \"你好\"}]\nprint([[type]](history).__name__)          # list\nprint([[isinstance]](history, list))       # True\nmethods = [name for name in [[dir]](history) if not name.[[startswith]](\"_\")]\nprint(methods)                            # append、clear、copy……\n\ndef clean(state):\n    return {\"text\": state[\"text\"].strip()}\n\nnode = [[clean]]                    # 函数本身：后面往图里注册节点时交的就是它\nresult = clean({\"text\": \" hi \"})   # 加了括号就是调用，得到返回值\nprint(type(node).__name__, type(result).__name__)   # function dict",
        "en": "history = [{\"role\": \"user\", \"content\": \"Hi\"}]\nprint([[type]](history).__name__)          # list\nprint([[isinstance]](history, list))       # True\nmethods = [name for name in [[dir]](history) if not name.[[startswith]](\"_\")]\nprint(methods)                            # append, clear, copy...\n\ndef clean(state):\n    return {\"text\": state[\"text\"].strip()}\n\nnode = [[clean]]                    # the function itself: what you hand over when registering a graph node\nresult = clean({\"text\": \" hi \"})   # parentheses call it and give the return value\nprint(type(node).__name__, type(result).__name__)   # function dict"
      },
      "explain": {
        "zh": "`type(x).__name__` 看类型名，`isinstance(x, 类型)` 判断是不是某种类型，`dir(x)` 列出属性和方法（去掉 `_` 开头的内部名字）。`clean` 不加括号是函数本身，`clean(...)` 是调用后的返回值。",
        "en": "`type(x).__name__` gives the type name, `isinstance(x, SomeType)` checks the type, `dir(x)` lists attributes and methods (drop the internal names starting with `_`). `clean` without parentheses is the function itself; `clean(...)` is the value returned by calling it."
      }
    }
  ],
  "pitfalls": [
    {
      "zh": "简单需求也上 LangGraph：加条链、调个模型、简单 RAG 用 LangChain 或直接调 API 就够了，用图只会多写代码。",
      "en": "Using LangGraph for simple needs: a chain, a model call or a simple RAG needs only LangChain or a direct API call; a graph just adds code."
    },
    {
      "zh": "把视频里的「前面学过 LangChain」当成自己漏学了：那是老师原来课程的顺序，这套合集的 LangChain 在第 43–50 节。",
      "en": "Thinking you missed something when the video says “we learned LangChain earlier”: that is his original course order; here LangChain is lessons 43–50."
    },
    {
      "zh": "照搬 0.x 时代的旧教程代码（如 `create_react_agent`、`RunnableWithMessageHistory`），遇到弃用警告或参数对不上。以已验证的代码和官方文档为准。",
      "en": "Copying 0.x-era tutorial code (such as `create_react_agent` or `RunnableWithMessageHistory`) and hitting deprecation warnings or mismatched parameters. Trust tested code and the official docs."
    },
    {
      "zh": "拿到框架返回的陌生对象就开始猜用法。先 `print(type(x).__name__)`、`dir(x)` 看一看。",
      "en": "Guessing how to use an unfamiliar framework object. First `print(type(x).__name__)` and `dir(x)`."
    }
  ],
  "recap": [
    {
      "zh": "LangChain 管组件，简化大模型应用开发，它的 Agent 是单智能体；LangGraph 管编排和工作流。",
      "en": "LangChain does components that simplify LLM apps, and its agents are single agents; LangGraph does orchestration and workflows."
    },
    {
      "zh": "选型：加链、调模型、简单 RAG → LangChain；复杂工作流、多智能体、上生产 → LangGraph。",
      "en": "Choosing: chains, model calls, simple RAG → LangChain; complex workflows, multiple agents, production → LangGraph."
    },
    {
      "zh": "LangGraph 多出来的：图（可以分支和循环）、持久化层（记忆 + 人机交互，像状态机）、增强的流式输出、生产部署和监控。",
      "en": "LangGraph adds: graphs (branches and loops), a persistence layer (memory + human-in-the-loop, like a state machine), stronger streaming, production deployment and monitoring."
    },
    {
      "zh": "工具调用循环就是一张图：model ⇄ tools；LangChain 1.x 的 `create_agent` 返回的正是这样一张 LangGraph 图。",
      "en": "The tool-call loop is a graph: model ⇄ tools; LangChain 1.x's `create_agent` returns exactly such a LangGraph graph."
    },
    {
      "zh": "后面依次讲：节点与可控制性、持久化与记忆、人机交互、时光旅行、流式输出、工具调用，最后是三个实战。",
      "en": "Coming up in order: nodes & controllability, persistence & memory, human-in-the-loop, time travel, streaming, tool calling, then three projects."
    },
    {
      "zh": "Python：用 `type(x).__name__`、`isinstance(x, 类型)`、`dir(x)` 看清陌生对象；`clean` 是函数本身，`clean(...)` 是调用后的返回值。",
      "en": "Python: inspect unfamiliar objects with `type(x).__name__`, `isinstance(x, SomeType)` and `dir(x)`; `clean` is the function itself, `clean(...)` is the value its call returns."
    }
  ],
  "files": [
    {
      "path": "practice/l25_peek_agent_graph.py",
      "zh": "演示：打印 `create_agent` 生成的图的类型、节点、边和 Mermaid 文本（不调用模型、不花钱）。",
      "en": "Demo: print the type, nodes, edges and Mermaid text of the graph `create_agent` builds (no model calls, free)."
    }
  ]
});
