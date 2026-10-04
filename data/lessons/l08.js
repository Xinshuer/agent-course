COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  id: "l08",
  priority: "important",
  handwrite: true,
  studyMinutes: 45,
  source: "subtitle",
  summary: {
    zh: "从这一节开始用框架写 Agent。视频这一集（约 27 分钟）全是概念：先说明为什么要从手写改用框架，再介绍常见的 Agent 开发框架、怎么选、课程为什么选 OpenAI Agents SDK，最后讲这个 SDK 的设计原则、主要功能（Agent 循环、交接、护栏、Python 优先、函数工具、追踪）和一张组件图。视频到 09 集开头才写代码；讲义后半部分是补充：用 DeepSeek 先跑通一个带工具的 Agent，顺便学会类、装饰器、类型标注这几个以后每节都要用的 Python 写法。",
    en: "From here on we build agents with a framework. This episode (about 27 minutes) is all concepts: why to move from hand-written code to a framework, which agent frameworks exist, how to choose, why the course picks the OpenAI Agents SDK, and finally the SDK's design principles, main features (agent loop, handoffs, guardrails, Python first, function tools, tracing) and a component diagram. The video only starts coding at the beginning of episode 09; the second half of these notes is an extra: a first tool-using agent on DeepSeek, plus the Python you will need in every lesson from now on – classes, decorators and type hints.",
  },
  goals: [
    {
      zh: "说出视频介绍的几个框架（LangGraph / LangChain、LlamaIndex、AutoGen / AG2、OpenAI Agents SDK、Pydantic AI、smolagents、CrewAI）的特点，以及按项目规模选框架的思路",
      en: "Describe the frameworks the video covers (LangGraph / LangChain, LlamaIndex, AutoGen / AG2, OpenAI Agents SDK, Pydantic AI, smolagents, CrewAI) and how to choose one by project size",
    },
    {
      zh: "说清 OpenAI Agents SDK 的设计原则和组件图：最核心的 `Runner` + `Agent`（Agent 循环在 Runner 里），以及护栏、交接、工具、模型层、追踪各是干什么的",
      en: "Explain the SDK's design principles and its component diagram: the core `Runner` + `Agent` (the agent loop lives in the Runner), and what guardrails, handoffs, tools, the model layer and tracing are for",
    },
    {
      zh: "知道接 DeepSeek / 通义千问要改的两处：改用 Chat Completions 接口（`OpenAIChatCompletionsModel`）、关掉追踪（`set_tracing_disabled(True)`）",
      en: "Know the two changes DeepSeek / Qwen need: switch to the Chat Completions API (`OpenAIChatCompletionsModel`) and turn off tracing (`set_tracing_disabled(True)`)",
    },
    {
      zh: "理解 `@function_tool` 怎样把函数的类型标注和 docstring 变成工具说明",
      en: "Understand how `@function_tool` turns a function's type hints and docstring into a tool schema",
    },
    { zh: "不看资料，手写一个带工具的 Agent，并用 `Runner.run_sync` 运行", en: "Write, unaided, an agent with a tool and run it with `Runner.run_sync`" },
  ],
  blocks: [
    { t: "h", zh: "一、为什么需要 Agent 框架", en: "1. Why use an agent framework?" },
    {
      t: "video",
      zh: "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=0) 这一集约 27 分钟，**全是概念，没有写代码**。老师先回顾前一天的内容：直接用 `openai` 库调用模型、传工具、管理会话（短期和长期记忆），再按 ReAct「推理 → 行动」的思路写出 Agent 的核心循环。这种原始写法能做出 Agent，但过程啰嗦、代码冗余，所以接下来改用框架。\n\n[▶ 01:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=92) 他给出的路线：常见框架有哪些 → 怎么选、课程为什么选 OpenAI Agents SDK → 这个 SDK 的特点和核心概念 → 不用 OpenAI 的模型（换成通义千问、DeepSeek）时要怎么配置 → 具体用法，最后用它做一个多 Agent 的例子。这一集讲的是前三项；第四项在这一集只是在组件图里提到要改「模型层」，具体配置和写代码都从 09 集开头开始。",
      en: "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=0) This episode runs about 27 minutes and is **all concepts, no code**. The instructor first recaps the previous day: calling the model directly with the `openai` library, passing tools, managing the conversation (short- and long-term memory), and writing the agent's core loop along ReAct's “reason → act” lines. That raw approach works, but it is long-winded and repetitive, so from now on the course uses a framework.\n\n[▶ 01:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=92) His roadmap: which frameworks exist → how to choose, and why the course picks the OpenAI Agents SDK → the SDK's features and core concepts → how to configure it for models other than OpenAI's (Qwen, DeepSeek) → how to use it, ending with a multi-agent example. This episode covers the first three; the fourth only comes up here as the diagram's “model layer”, and the actual configuration and coding start at the beginning of episode 09.",
    },
    {
      t: "p",
      zh: "05–07 节你亲手写出了一个会调用工具的 Agent。回头看，每做一个新的 Agent，下面这些代码几乎都要重写一遍：\n\n| 手写时你要做的事 | 在哪一节写过 |\n|---|---|\n| 为每个工具手写一大段 JSON Schema | 05 |\n| 维护 `messages` 历史列表 | 06 |\n| `while reply.tool_calls:` 循环：执行工具、存结果、再调用模型 | 06 |\n| `json.loads` 解析参数，按名字找到对应的函数 | 05、07 |\n| 让模型「思考 → 行动 → 观察」反复循环 | 07 |\n\n**Agent 框架**把这些重复的部分封装好了：你只需要描述「这个 Agent 是谁、用哪个模型、有哪些工具」，循环交给框架去跑。框架底层做的事和你手写的完全一样——这也是课程先让你手写一遍的原因：出了问题，你知道它在里面干什么。",
      en: "In lessons 05–07 you built a tool-using agent by hand. Looking back, almost all of this has to be rewritten for every new agent:\n\n| What you did by hand | Lesson |\n|---|---|\n| Write a long JSON Schema for every tool | 05 |\n| Maintain the `messages` history list | 06 |\n| The `while reply.tool_calls:` loop: run tools, store results, call the model again | 06 |\n| `json.loads` the arguments and find the matching function by name | 05, 07 |\n| Loop the model through “think → act → observe” | 07 |\n\nAn **agent framework** packages these repetitive parts: you only describe “who this agent is, which model it uses, which tools it has”, and the framework runs the loop. Underneath it does exactly what you wrote by hand – which is why the course had you write it first: when something breaks, you know what is going on inside.",
    },
    {
      t: "check",
      q: { zh: "Agent 框架主要替你省掉的是哪部分工作？", en: "What does an agent framework mainly save you from writing?" },
      options: [
        { zh: "让模型变得更聪明", en: "Making the model smarter" },
        { zh: "「调模型 → 执行工具 → 再调模型」的循环和消息管理", en: "The “call model → run tools → call model again” loop and message bookkeeping" },
        { zh: "免费提供模型的 API key", en: "Providing a free API key" },
      ],
      answer: 1,
      explain: {
        zh: "框架不会改变模型本身的能力，它封装的是你在 05–07 节手写的那套流程。",
        en: "A framework doesn't change what the model can do; it packages the flow you hand-wrote in lessons 05–07.",
      },
    },
    { t: "h", zh: "二、常见的 Agent 开发框架", en: "2. The common agent frameworks" },
    {
      t: "video",
      zh: "[▶ 03:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=224) 老师挑了几个有代表性的框架，结合 GitHub 的 star 数来介绍（开场列提纲时他就提醒过：OpenAI Agents SDK 不是唯一的框架，把它当成唯一选择就进了误区）。他还提醒，看 star 要把有渊源的仓库合起来算：LangGraph 要和拆出它的 LangChain 一起看；AG2 是从 AutoGen 分叉出来的；OpenAI Agents SDK 的前身是一个已经停止维护的实验项目（约 2 万 star）。只看新仓库，会低估它们。\n\n顺序是：LangGraph（从 LangChain 拆出来）、[▶ 04:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=256) LlamaIndex、[▶ 05:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=317) AutoGen 和 AG2、[▶ 06:51](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=411) OpenAI Agents SDK，然后是 [▶ 07:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=472) 几个「大家可能不太熟」的：Pydantic 团队的框架、Hugging Face 主打简单的框架、一个早期基于 LangChain 后来把这个依赖去掉的知名框架，最后 [▶ 09:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=570) 是一个个人维护的小框架——用来说明不只大公司在做框架，作者活跃的个人项目你也可以参与。字幕里有几个名字没念清楚，从描述看分别是 Pydantic AI、smolagents 和 CrewAI；个人维护的那个认不出名字，下表略过。",
      en: "[▶ 03:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=224) The instructor picks a few representative frameworks and introduces them with their GitHub star counts (already in his opening roadmap he warned that the OpenAI Agents SDK is not the only framework – treating it as the only choice is a trap). He also says to count related repositories together: LangGraph together with LangChain, which it was split from; AG2 together with AutoGen, which it forked from; the OpenAI Agents SDK together with its predecessor, an experimental project that is no longer maintained (about 20k stars). Looking at the new repositories alone undersells them.\n\nThe order: LangGraph (split out of LangChain), [▶ 04:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=256) LlamaIndex, [▶ 05:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=317) AutoGen and AG2, [▶ 06:51](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=411) the OpenAI Agents SDK, then [▶ 07:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=472) a few “you may not know”: the Pydantic team's framework, Hugging Face's simplicity-first framework, a well-known framework that started on top of LangChain and later dropped it, and finally [▶ 09:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=570) a small one-person framework – to show that not only big companies build frameworks, and that you can join an active author's project. Some names are unclear in the subtitles; from the descriptions they are Pydantic AI, smolagents and CrewAI. The one-person framework can't be identified, so the table skips it.",
    },
    {
      t: "p",
      zh: "| 框架 | 出品方 | 视频里的要点 | 本课程 |\n|---|---|---|---|\n| **LangGraph / LangChain** | LangChain 团队 | LangGraph 从 LangChain 拆分出来；知名、成熟，但抽象概念多、比较难，适合大团队做大中型项目 | LangGraph 25–42 节，LangChain 43–50 节 |\n| **LlamaIndex** | LlamaIndex | 起家于 RAG（知识库），后来才发力 Agent，很多内容仍偏向知识库 | – |\n| **AutoGen / AG2** | 微软 / 原作者 | 同一个起源：原作者从 0.2 版分叉出 AG2；特别擅长多 Agent 系统 | – |\n| **OpenAI Agents SDK** | OpenAI | 前身是实验项目 Swarm；主打简单，几行代码就能跑起一个 Agent | 08–14 节 |\n| **Pydantic AI** | Pydantic 团队 | 文档细致，调试、测试、追踪这些工程细节考虑得很周到；老师不确定实际有多少团队在用 | – |\n| **smolagents** | Hugging Face | 主打「最简单」，谁都能用，对新手友好 | – |\n| **CrewAI** | CrewAI | 早期以 LangChain 为核心，后来重构去掉了这个依赖、自己实现了一套；知名度和影响力都不错 | 51–56 节（按「角色 + 任务 + 团队」组织多个 Agent） |\n| **AgentScope** | 阿里巴巴 | 视频这一集没提，课程后面会讲：多智能体，自带工具、RAG、MCP、权限和中间件 | 15–22 节 |",
      en: "| Framework | By | Key points in the video | This course |\n|---|---|---|---|\n| **LangGraph / LangChain** | LangChain team | LangGraph was split out of LangChain; well known and mature, but many abstractions and fairly hard – suits big teams and larger projects | LangGraph 25–42, LangChain 43–50 |\n| **LlamaIndex** | LlamaIndex | Started with RAG (knowledge bases) and moved into agents later; much of it still leans towards knowledge bases | – |\n| **AutoGen / AG2** | Microsoft / the original author | Same origin: the original author forked AG2 from version 0.2; especially strong at multi-agent systems | – |\n| **OpenAI Agents SDK** | OpenAI | Successor of the experimental Swarm project; built around simplicity – an agent in a few lines | 08–14 |\n| **Pydantic AI** | Pydantic team | Detailed docs; engineering details like debugging, testing and tracing are well thought out; the instructor isn't sure how many teams actually use it | – |\n| **smolagents** | Hugging Face | Aims to be “the simplest”, usable by anyone, beginner-friendly | – |\n| **CrewAI** | CrewAI | Started on top of LangChain, later rewritten to do without it; well known and influential | 51–56 (agents organised as “roles + tasks + a crew”) |\n| **AgentScope** | Alibaba | Not in this episode; covered later in the course: multi-agent, with tools, RAG, MCP, permissions and middleware | 15–22 |",
    },
    {
      t: "tip",
      zh: "[▶ 10:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=633) 视频里的选法，按项目规模记：\n- **大团队、大中型复杂项目** → LangChain / LangGraph：抽象多、难学，但项目后期更稳定、好扩展\n- **新手、小项目、想快速上手** → smolagents 或 OpenAI Agents SDK：两者都把「简单」当卖点\n- **介于两者之间**（小团队、觉得最简单的框架不够用）→ AG2、Pydantic AI 等\n\n[▶ 12:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=760) 课程为什么选 OpenAI Agents SDK？老师的理由：它够简单，但不是最简单的（smolagents 更简单，他觉得太简单、star 也少一些）。他了解到不少同学有一些代码基础，用最简单的反而体会不到 Agent 里一些较复杂的概念和用法，所以选了「第二简单」的那个，难度稍微高一点；而且有的同学本来就用 OpenAI 的模型，用它家的 SDK 更顺手。学下来觉得难，可以先拿 smolagents 入门。\n\n不管用哪个框架，底层都是你手写过的那一套：**消息列表 + 工具调用 + 循环**。学会一个，再学别的会快很多。",
      en: "[▶ 10:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=633) The video's way of choosing, by project size:\n- **Big teams, larger complex projects** → LangChain / LangGraph: many abstractions and harder to learn, but more stable and extensible as the project grows\n- **Beginners, small projects, a quick start** → smolagents or the OpenAI Agents SDK: both sell themselves on simplicity\n- **In between** (a small team, or the simplest framework feels too limited) → AG2, Pydantic AI and the like\n\n[▶ 12:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=760) Why does the course pick the OpenAI Agents SDK? The instructor's reasons: it is simple but not the simplest (smolagents is simpler, but he finds it too simple, and it has fewer stars); many students already have some coding background, and with the simplest framework they would miss some of the more complex agent concepts, so he picked “the second simplest”, a little more demanding; and some students already use OpenAI models, for which OpenAI's own SDK fits naturally. If it feels hard, start with smolagents instead.\n\nWhichever you pick, underneath it is what you already hand-wrote: **a message list + tool calls + a loop**. Learn one and the rest come much faster.",
    },
    {
      t: "check",
      q: {
        zh: "按视频的说法，新手想用最少的概念快速做出一个 Agent，应该优先考虑哪两个框架？",
        en: "According to the video, which two frameworks should a beginner consider first to build an agent quickly with the fewest concepts?",
      },
      options: [
        { zh: "LlamaIndex 和 AG2", en: "LlamaIndex and AG2" },
        { zh: "LangChain 和 LangGraph", en: "LangChain and LangGraph" },
        { zh: "smolagents 和 OpenAI Agents SDK", en: "smolagents and the OpenAI Agents SDK" },
        { zh: "Pydantic AI 和 LlamaIndex", en: "Pydantic AI and LlamaIndex" },
      ],
      answer: 2,
      explain: {
        zh: "这两个都把「简单」当卖点。LangChain / LangGraph 抽象多、难一些，更适合大团队的复杂项目（课程 25–50 节会讲）。",
        en: "Both sell themselves on simplicity. LangChain / LangGraph have many abstractions and are harder – better for big teams and complex projects (lessons 25–50 cover them).",
      },
    },
    { t: "h", zh: "三、OpenAI Agents SDK 的特点", en: "3. What the OpenAI Agents SDK is like" },
    {
      t: "video",
      zh: "[▶ 14:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=854) 视频总结的两条设计原则：\n- **功能够用，概念尽量少**：只把核心功能做好，不去造一大堆抽象。老师拿 LangChain 对比：LangChain 尽量封装、尽量建抽象类，这个 SDK 正好反过来，所以学起来、理解起来都快。\n- **开箱即用，又能自定义**：用 OpenAI 的模型几行代码就能跑；内部细节也可以重新配置，所以换成通义千问、DeepSeek，改几处配置就行。\n\n[▶ 15:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=946) 主要功能：内置 **Agent 循环**；多个 Agent 之间的**交接**；**护栏**（老师说这是他第一次看到有框架把它当成重点功能来宣传）；[▶ 17:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=1073) **Python 优先**（熟悉 Python 就用得顺手；对比 LangChain 有一大堆新概念要学，甚至有自己的表达式语言 LCEL，等于再学一门语言）；**函数工具**（他认为这一点不算特色，大部分框架都能做到）；**追踪**（OpenAI 自家的服务，配合它的评估、微调使用，我们用 DeepSeek / 千问时基本用不上，除非自己接一套追踪工具）。",
      en: "[▶ 14:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=854) The two design principles the video sums up:\n- **Enough features, as few concepts as possible**: it does the core well and avoids piles of abstractions. The instructor contrasts LangChain, which wraps as much as it can and creates abstract classes everywhere; this SDK does the opposite, so it is quick to learn and understand.\n- **Works out of the box, yet customisable**: a few lines with OpenAI's models, and the internals can be reconfigured – so for Qwen or DeepSeek you change a few settings.\n\n[▶ 15:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=946) Main features: a built-in **agent loop**; **handoffs** between agents; **guardrails** (the instructor says this is the first framework he has seen market them as a headline feature); [▶ 17:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=1073) **Python first** (if you know Python it feels natural – unlike LangChain, with its many new concepts and even its own expression language, LCEL, which is like learning another language); **function tools** (he doesn't think these are special – most frameworks have them); **tracing** (OpenAI's own service, tied to its evaluation and fine-tuning; of little use with DeepSeek / Qwen unless you plug in your own tracing tool).",
    },
    {
      t: "p",
      zh: "[▶ 16:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=977) **护栏**（Guardrails）是视频重点讲的功能：它和 Agent **并行运行**，检查 Agent 收到的输入和给出的输出。比如用户想诱导 Agent 生成违法、暴力的内容，或者 Agent 的回答里出现了这类内容，护栏就会**立即中断这次运行**。给别人用的商业项目，这类合规检查是必须考虑的。\n\n下表把 SDK 的核心概念和你手写过的代码对应起来：\n\n| 概念 | 作用 | 相当于你手写时的 |\n|---|---|---|\n| `Agent` | 一个配置好的智能体：名字、指令（instructions）、模型、工具 | system 消息 + `model` + `tools` |\n| `Runner` | 运行 Agent：自动循环「调模型 → 执行工具 → 再调模型」，直到得到最终回答 | 06 节的 while 循环 |\n| `@function_tool` | 把普通 Python 函数变成工具，自动生成 JSON Schema | 05 节手写的 `tools` |\n| Handoffs（交接） | 一个 Agent 把任务转交给另一个更专业的 Agent | 无（后面多 Agent 的几节会讲） |\n| Guardrails（护栏） | 检查输入和输出，不合规就中断运行 | 自己写 if 判断 |\n| Tracing（追踪） | 记录每一步，默认上传到 OpenAI 后台查看 | 到处 `print` 调试 |",
      en: "[▶ 16:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=977) **Guardrails** get the most attention in the video: they run **in parallel with** the agent and check what it receives and what it produces. If a user tries to lure the agent into illegal or violent content, or the agent's answer contains such content, the guardrail **stops the run immediately**. For a commercial product used by other people, this kind of compliance check is a must.\n\nThe table maps the SDK's core ideas to code you have already written:\n\n| Concept | What it does | What you hand-wrote instead |\n|---|---|---|\n| `Agent` | A configured agent: name, instructions, model, tools | system message + `model` + `tools` |\n| `Runner` | Runs an agent: loops “call model → run tools → call model” until a final answer | The while loop from lesson 06 |\n| `@function_tool` | Turns a plain Python function into a tool and generates its JSON Schema | The hand-written `tools` from lesson 05 |\n| Handoffs | One agent passes the task to a more specialised agent | None (covered in the multi-agent lessons) |\n| Guardrails | Check input and output; stop the run if something breaks the rules | Your own if checks |\n| Tracing | Record every step; uploaded to OpenAI's dashboard by default | `print` everywhere |",
    },
    {
      t: "p",
      zh: "[▶ 19:27](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=1167) 视频里用一张组件图讲这些部分的关系，老师建议按「需要什么加什么」来理解：\n1. [▶ 20:29](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=1229) **最小组合：`Runner` + `Agent`**，这是「核心中的核心」。Agent 背后是大模型；Runner 负责运行 Agent。只想做一个聊天的 Agent，这两个就够了。\n2. **+ 护栏**：锦上添花，没有它也能运行；项目要给别人用、需要合规检查时加上，让运行更安全。\n3. **+ 交接**：多个 Agent 分工时，用它在 Agent 之间转交任务，就成了多 Agent 系统。\n4. [▶ 22:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=1325) **+ 工具**：一种是 OpenAI 托管在自己服务器上的工具，一种是你用 Python 写的函数工具。不用 OpenAI 的模型时，工具基本都要自己写。\n5. [▶ 22:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=1355) **模型层**：平时很少动。SDK 默认用 OpenAI 新的 Responses 接口，只有 OpenAI 的模型支持；接 DeepSeek、通义千问要把这一层改成旧的、兼容的 Chat Completions 接口。\n6. [▶ 23:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=1417) **追踪**在旁边记录以上各个环节。图里单独画了一个 **Agent 循环**，老师说它不该看成单独的组件：它是 Runner 内部的细节——反复调用大模型、处理工具调用请求、完成 Agent 之间的交接。运行结束得到的**结果**（`result`）拿来用就行。\n\n[▶ 25:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=1510) 所以可以循序渐进：聊天用两个组件；商用加护栏；复杂系统加交接；要能力加工具；要细调再改模型层。[▶ 25:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=1544) 老师还建议：以后用这个 SDK 做复杂系统，先对着这张图设计要用哪些组件，做完再拿设计复盘——哪些用上了，哪些原以为要用、最后没用，为什么。",
      en: "[▶ 19:27](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=1167) The video explains how the parts relate with a component diagram, which the instructor suggests reading as “add what you need”:\n1. [▶ 20:29](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=1229) **The minimum: `Runner` + `Agent`** – “the core of the core”. Behind the agent is the model; the Runner runs the agent. For a simple chat agent these two are enough.\n2. **+ Guardrails**: a nice extra – it runs without them; add them when the project is for other people and needs compliance checks, for a safer run.\n3. **+ Handoffs**: when several agents split the work, they pass tasks between agents – now it is a multi-agent system.\n4. [▶ 22:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=1325) **+ Tools**: either tools OpenAI hosts on its own servers, or function tools you write in Python. Without OpenAI's models you write nearly all tools yourself.\n5. [▶ 22:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=1355) **The model layer**: rarely touched. By default the SDK uses OpenAI's newer Responses API, which only OpenAI's models support; for DeepSeek or Qwen this layer must switch to the older, compatible Chat Completions API.\n6. [▶ 23:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=1417) **Tracing** records all of the above from the side. The diagram also draws an **agent loop**, which the instructor says is not really a separate component: it is a detail inside the Runner – calling the model again and again, handling tool-call requests, completing handoffs between agents. The run ends with a **result** (`result`) that you simply use.\n\n[▶ 25:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=1510) So you can grow step by step: two components for chat; guardrails for a commercial product; handoffs for a complex system; tools for abilities; the model layer for detailed customisation. [▶ 25:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=1544) His advice: when you build a complex system with this SDK, first use the diagram to plan which components you need, and afterwards review against that plan – which ones you used, and which you expected to need but didn't, and why.",
    },
    {
      t: "note",
      zh: "包名是 `openai-agents`，导入时却写 `from agents import ...`，名字不一样，别搞混。课程环境里已经装好了 0.20.0 版，安装方法见 [环境准备](#/setup)。这个 SDK 更新很快，如果和视频里的写法有出入，以 [官方文档](https://openai.github.io/openai-agents-python/) 为准。",
      en: "The package is called `openai-agents`, but you import it as `from agents import ...` – different names, don't mix them up. Version 0.20.0 is already installed in the course environment; see [Setup](#/setup) for installing. The SDK changes quickly; if the video's code differs, trust the [official docs](https://openai.github.io/openai-agents-python/).",
    },
    {
      t: "warn",
      zh: "SDK 默认是为 OpenAI 自家模型设计的。接 DeepSeek、通义千问这类「兼容 OpenAI 接口」的模型时，要注意三点：\n1. **接口不同**：SDK 默认调用 OpenAI 新的 Responses 接口，视频里也说了（[▶ 22:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=1355)），这种接口只有 OpenAI 的模型支持；DeepSeek、通义千问（阿里云百炼的兼容模式）这类服务提供的是 Chat Completions 接口（就是你一直在用的 `chat.completions.create`）。所以要用 `OpenAIChatCompletionsModel` 把客户端包一层。\n2. **追踪上传**：SDK 默认把运行记录上传到 OpenAI 后台，这需要 OpenAI 的 key。我们没有，就用 `set_tracing_disabled(True)` 关掉，否则会看到 `OPENAI_API_KEY is not set, skipping trace export` 这样的提示。\n3. **托管工具用不了**：`WebSearchTool`、`FileSearchTool` 这类工具在 OpenAI 的服务器上运行，只能配合 OpenAI 模型。自己用 `@function_tool` 写的工具不受影响。",
      en: "The SDK is designed around OpenAI's own models. With “OpenAI-compatible” models such as DeepSeek or Qwen, watch three things:\n1. **A different API**: by default the SDK calls OpenAI's newer Responses API, which – as the video also says ([▶ 22:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=1355)) – only OpenAI's models support; DeepSeek and Qwen (through Alibaba Cloud Bailian's compatible mode) offer the Chat Completions API (the `chat.completions.create` you have been using). So wrap the client in `OpenAIChatCompletionsModel`.\n2. **Trace upload**: by default the SDK uploads run records to OpenAI's dashboard, which needs an OpenAI key. We have none, so switch it off with `set_tracing_disabled(True)`; otherwise you see messages like `OPENAI_API_KEY is not set, skipping trace export`.\n3. **No hosted tools**: tools like `WebSearchTool` and `FileSearchTool` run on OpenAI's servers and only work with OpenAI models. Your own `@function_tool` tools are unaffected.",
    },
    { t: "h", zh: "四、讲义补充：动手跑第一个 Agent", en: "4. Extra: run your first agent" },
    {
      t: "video",
      zh: "[▶ 26:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=1574) 视频这一集讲完组件图就结束了，没有写代码。下一集（09）开头才安装框架、写设置文件、用同步的 `Runner.run_sync` 跑第一个例子，再改成 async。讲义先在这里用最少的代码跑一次：组件图里最核心的 `Agent` + `Runner`，加上「模型层」的 `OpenAIChatCompletionsModel`。这一部分顺带讲的类、装饰器和类型标注，以后每一节都会用到。\n\n关于模型：下一集老师运行例子时，模型回答自己是「由谷歌训练的大语言模型」——09 到 11 集他接的是谷歌的模型（同样走兼容 OpenAI 的接口）；他写设置文件时也举例说，用 DeepSeek 就把默认模型名填成 DeepSeek 的（接口地址和 key 都放在环境变量里）。讲义统一用 DeepSeek（`llm.py` 里的 `async_client` 和 `MODEL`），代码结构完全一样。",
      en: "[▶ 26:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=1574) The episode ends after the component diagram, with no code. Episode 09 begins by installing the framework, writing a settings file and running a first example with the synchronous `Runner.run_sync`, then converts it to async. These notes run it once here with minimal code: the diagram's core `Agent` + `Runner`, plus `OpenAIChatCompletionsModel` for the “model layer”. The classes, decorators and type hints explained on the way are used in every lesson from now on.\n\nAbout the model: when the instructor runs his example in the next episode, the model says it is “a large language model trained by Google” – in episodes 09 to 11 he uses a Google model (also through an OpenAI-compatible API); while writing the settings file he also notes that for DeepSeek you would fill in DeepSeek's model name as the default (with the address and key in environment variables). These notes use DeepSeek throughout (`async_client` and `MODEL` from `llm.py`); the code structure is identical.",
    },
    {
      t: "code",
      file: "first_agent.py",
      code: {
        zh: "from agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client     # async_client 是异步客户端 AsyncOpenAI\n\nset_tracing_disabled(True)              # 不上传追踪记录（我们没有 OpenAI 的 key）\n\n# 1. 模型：把 DeepSeek 的客户端包成 SDK 认识的 Chat Completions 模型\nmodel = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)\n\n# 2. Agent：名字 + 指令 + 模型\nagent = Agent(\n    name=\"助手\",\n    instructions=\"你是一个简洁的中文助手，回答不超过两句话。\",\n    model=model,\n)\n\n# 3. 运行：Runner 负责和模型来回交互，直到得到最终回答\nresult = Runner.run_sync(agent, \"用一句话介绍一下你自己。\")\nprint(result.final_output)",
        en: "from agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client     # async_client is the async client, AsyncOpenAI\n\nset_tracing_disabled(True)              # don't upload traces (we have no OpenAI key)\n\n# 1. Model: wrap the DeepSeek client as a Chat Completions model the SDK understands\nmodel = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)\n\n# 2. Agent: a name + instructions + a model\nagent = Agent(\n    name=\"assistant\",\n    instructions=\"You are a concise assistant. Answer in at most two sentences.\",\n    model=model,\n)\n\n# 3. Run it: Runner talks to the model back and forth until there is a final answer\nresult = Runner.run_sync(agent, \"Introduce yourself in one sentence.\")\nprint(result.final_output)",
      },
      note: {
        zh: "框架代码不能在浏览器里运行。把它存成 `practice` 文件夹里的 .py 文件，用 `.venv` 的 Python 运行（见 [环境准备](#/setup)）。",
        en: "Framework code can't run in the browser. Save it as a .py file in the `practice` folder and run it with the `.venv` Python (see [Setup](#/setup)).",
      },
    },
    {
      t: "p",
      zh: "逐行看：\n- `OpenAIChatCompletionsModel(model=..., openai_client=...)`：告诉 SDK「用 Chat Completions 接口、用这个客户端、调这个模型」。`openai_client` 必须是**异步**客户端 `AsyncOpenAI`，所以导入的是 `async_client`，不是 `client`。\n- `Agent(name=..., instructions=..., model=...)`：`instructions` 就是 system 消息；`name` 用来区分不同的 Agent，后面多 Agent 时很重要。\n- `Runner.run_sync(agent, \"...\")`：同步运行，等整个过程结束才返回结果。\n- `result.final_output`：最终回答的文字。",
      en: "Line by line:\n- `OpenAIChatCompletionsModel(model=..., openai_client=...)` tells the SDK “use the Chat Completions API, this client, this model”. `openai_client` must be the **async** client `AsyncOpenAI`, which is why we import `async_client`, not `client`.\n- `Agent(name=..., instructions=..., model=...)`: `instructions` is the system message; `name` tells agents apart, which matters once there are several.\n- `Runner.run_sync(agent, \"...\")` runs synchronously and returns only when everything is finished.\n- `result.final_output` is the text of the final answer.",
    },
    {
      t: "py",
      title: { zh: "类和对象：`Agent(...)` 到底造出了什么", en: "Classes and objects: what does `Agent(...)` create?" },
      zh: "`Agent` 是一个**类**（class），可以把它理解成「Agent 的设计图」。`Agent(name=..., instructions=...)` 按这张图造出一个具体的**对象**（也叫实例），对象带着自己的**属性**，用点号读取，比如 `agent.name`。\n\n自己写一个类，记住三点：\n- 用 `class 类名:` 开头，类名习惯首字母大写\n- `__init__` 是创建对象时自动执行的函数，一般在这里把参数存成属性\n- 第一个参数 `self` 指「正在创建的这个对象」，`self.name = name` 就是把参数存到对象身上\n\n下面的 `MiniAgent` 是一个极简版的 Agent 类：",
      en: "`Agent` is a **class** – think of it as “the blueprint of an agent”. `Agent(name=..., instructions=...)` builds a concrete **object** (an instance) from that blueprint, and the object carries its own **attributes**, read with a dot such as `agent.name`.\n\nWriting your own class takes three ideas:\n- start with `class Name:`; class names are usually Capitalised\n- `__init__` runs automatically when an object is created; it usually stores the arguments as attributes\n- the first parameter `self` means “the object being created”, so `self.name = name` stores the argument on the object\n\n`MiniAgent` below is a bare-bones agent class:",
      code: {
        zh: "class MiniAgent:\n    def __init__(self, name, instructions, tools=None):\n        self.name = name                    # 把参数存成对象的属性\n        self.instructions = instructions\n        self.tools = tools or []            # 没给工具就用空列表（回顾 05 节的 x or []）\n\n    def describe(self):                     # 写在类里的函数叫「方法」，用 对象.方法() 调用\n        return f\"{self.name}：{self.instructions}（{len(self.tools)} 个工具）\"\n\na = MiniAgent(name=\"翻译官\", instructions=\"把中文翻译成英文\")\nb = MiniAgent(name=\"天气助手\", instructions=\"回答天气问题\", tools=[\"get_weather\"])\n\nprint(a.name)            # 读取属性\nprint(b.describe())      # 调用方法\nprint(type(a).__name__)  # MiniAgent：a 是 MiniAgent 类造出来的对象\nb.name = \"气象员\"         # 属性也可以改\nprint(b.describe())",
        en: "class MiniAgent:\n    def __init__(self, name, instructions, tools=None):\n        self.name = name                    # store the arguments as attributes of the object\n        self.instructions = instructions\n        self.tools = tools or []            # no tools given -> empty list (see \"x or []\" in lesson 05)\n\n    def describe(self):                     # a function inside a class is a \"method\": object.method()\n        return f\"{self.name}: {self.instructions} (tools: {len(self.tools)})\"\n\na = MiniAgent(name=\"translator\", instructions=\"Translate Chinese into English\")\nb = MiniAgent(name=\"weather bot\", instructions=\"Answer weather questions\", tools=[\"get_weather\"])\n\nprint(a.name)            # read an attribute\nprint(b.describe())      # call a method\nprint(type(a).__name__)  # MiniAgent: a was built from the MiniAgent class\nb.name = \"forecaster\"    # attributes can be changed, too\nprint(b.describe())",
      },
      note: {
        zh: "创建对象时用关键字参数（`name=...`，回顾 04 节），顺序写乱了也没关系，读起来也清楚。SDK 的 `Agent` 参数很多，所以一律用关键字参数。另外，SDK 的 `Agent` 是用 `@dataclass` 写的，Python 会自动生成 `__init__`，所以源码里看不到它。",
        en: "Create objects with keyword arguments (`name=...`, see lesson 04): order doesn't matter and the call reads clearly. The SDK's `Agent` has many parameters, so always use keywords. Also, the SDK's `Agent` is written with `@dataclass`, which makes Python generate `__init__` for you – that's why you won't find one in its source.",
      },
    },
    {
      t: "p",
      zh: "另一种写法是**全局设置**：先把默认客户端、接口和默认模型名设好，之后创建 `Agent` 时可以不写 `model`。09 集开头视频用的就是这种写法（还单独放进一个设置文件），09 节会照着视频完整写一遍。课程练习大多用上面的 `OpenAIChatCompletionsModel`，每个 Agent 用什么模型一眼就能看到；两种写法效果一样。",
      en: "Another style is a **global setup**: set the default client, API and default model name once, and then `Agent`s can omit `model`. This is what the video does at the start of episode 09 (in a separate settings file), and lesson 09 rebuilds it the video's way. Most practice files use `OpenAIChatCompletionsModel` as above, so each agent's model is visible at a glance; both styles behave the same.",
    },
    { t: "h", zh: "五、讲义补充：给 Agent 加工具（@function_tool）", en: "5. Extra: giving the agent a tool (@function_tool)" },
    {
      t: "video",
      zh: "视频这一集只在 [▶ 18:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=1103) 介绍功能时提了一句「函数工具」（老师觉得这一点不算特色，大部分 Python 框架都能做到），讲组件图时 [▶ 22:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=1325) 又说工具分两种：OpenAI 托管的工具，和自己用 Python 写、封装的函数工具。没有演示代码，工具的详细用法在 11 集「使用工具和 MCP」。讲义在这里先介绍 `@function_tool`，是因为装饰器、类型标注这些 Python 写法从下一节开始到处都是，先看懂一次。",
      en: "This episode only mentions “function tools” while listing features at [▶ 18:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=1103) (the instructor doesn't think they are special – most Python frameworks have them), and at [▶ 22:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=1325), on the component diagram, says tools come in two kinds: tools hosted by OpenAI, and function tools you write and wrap in Python yourself. There is no code; tools are covered in detail in episode 11, “Tools & MCP”. These notes introduce `@function_tool` now because decorators and type hints appear everywhere from the next lesson on, so it pays to understand them once.",
    },
    {
      t: "p",
      zh: "05 节里，每个工具都要手写一大段 JSON Schema（就是 `weather_tool.py` 里的 `tools`）。用 SDK 时，只要在普通函数上面加一行 `@function_tool`，SDK 会读取函数的**名字、类型标注和 docstring**，自动生成同样的说明。下面把 05 节的 `get_weather` 包装成一个工具：",
      en: "In lesson 05 every tool needed a long hand-written JSON Schema (the `tools` in `weather_tool.py`). With the SDK you add one line, `@function_tool`, above a plain function; the SDK reads the function's **name, type hints and docstring** and generates the same description. Here lesson 05's `get_weather` becomes a tool:",
    },
    {
      t: "code",
      file: "agent_with_tool.py",
      code: {
        zh: "from agents import Agent, OpenAIChatCompletionsModel, Runner, function_tool, set_tracing_disabled\nfrom llm import MODEL, async_client\nfrom weather_tool import get_weather        # 05 节的查天气函数（Open-Meteo，不需要 key）\n\nset_tracing_disabled(True)\n\n@function_tool\ndef get_temperature(latitude: float, longitude: float) -> str:\n    \"\"\"查询某个经纬度当前的气温（摄氏度）。\n\n    Args:\n        latitude: 纬度，例如北京是 39.9\n        longitude: 经度，例如北京是 116.4\n    \"\"\"\n    return f\"{get_weather(latitude, longitude)}°C\"\n\nagent = Agent(\n    name=\"天气助手\",\n    instructions=\"你是一个简洁的天气助手。需要气温时调用工具，回答不超过两句话。\",\n    model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),\n    tools=[get_temperature],                # 工具放在列表里，可以放好几个\n)\n\nresult = Runner.run_sync(agent, \"北京现在多少度？\")\nprint(result.final_output)                  # 例如：北京现在 15.0°C。",
        en: "from agents import Agent, OpenAIChatCompletionsModel, Runner, function_tool, set_tracing_disabled\nfrom llm import MODEL, async_client\nfrom weather_tool import get_weather        # the weather function from lesson 05 (Open-Meteo, no key)\n\nset_tracing_disabled(True)\n\n@function_tool\ndef get_temperature(latitude: float, longitude: float) -> str:\n    \"\"\"Get the current temperature (Celsius) at a latitude/longitude.\n\n    Args:\n        latitude: The latitude, e.g. 39.9 for Beijing.\n        longitude: The longitude, e.g. 116.4 for Beijing.\n    \"\"\"\n    return f\"{get_weather(latitude, longitude)}°C\"\n\nagent = Agent(\n    name=\"weather assistant\",\n    instructions=\"You are a concise weather assistant. Use the tool for temperatures. At most two sentences.\",\n    model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),\n    tools=[get_temperature],                # tools go in a list - you can add several\n)\n\nresult = Runner.run_sync(agent, \"How warm is it in Beijing right now?\")\nprint(result.final_output)                  # e.g. It's 15.0°C in Beijing right now.",
      },
    },
    {
      t: "py",
      title: { zh: "装饰器：`@function_tool` 做了什么", en: "Decorators: what `@function_tool` does" },
      zh: "写在函数定义上面的 `@名字` 叫**装饰器**。它只是一种简写：在 `def get_temperature(...)` 上面写 `@function_tool`，完全等价于先定义函数，再执行一句 `get_temperature = function_tool(get_temperature)`——把函数交给 `function_tool` 处理，再用它的**返回值**替换掉原来的名字。\n\n关键在于返回值是什么：\n- 有的装饰器原样返回函数，只是顺便做点登记\n- `function_tool` 返回的是一个 `FunctionTool` **对象**，里面装着工具名、描述、参数说明，以及负责调用原函数的 `on_invoke_tool`。所以加了 `@function_tool` 之后，再直接写 `get_temperature(39.9, 116.4)` 会报错 `'FunctionTool' object is not callable`——它已经不是普通函数了，要交给 Agent 去调用。\n\n用两个自己写的装饰器体会一下：",
      en: "An `@name` line above a function definition is a **decorator**. It is only shorthand: `@function_tool` above `def get_temperature(...)` is exactly the same as defining the function and then running `get_temperature = function_tool(get_temperature)` – the function is handed to `function_tool`, and its **return value** replaces the original name.\n\nWhat matters is what comes back:\n- some decorators return the same function and just record it somewhere\n- `function_tool` returns a `FunctionTool` **object** holding the tool name, description, parameter schema and `on_invoke_tool`, which calls the original function. So after `@function_tool`, calling `get_temperature(39.9, 116.4)` directly fails with `'FunctionTool' object is not callable` – it is no longer a plain function; the agent calls it for you.\n\nTry two home-made decorators:",
      code: {
        zh: "TOOLS = {}\n\ndef register(func):\n    TOOLS[func.__name__] = func   # 登记：函数名 → 函数\n    return func                   # 原样还回去\n\n@register                         # 等价于：add = register(add)\ndef add(a, b):\n    return a + b\n\nprint(list(TOOLS))                # ['add']\nprint(add(2, 3))                  # 5：add 还是原来的函数\n\n\ndef as_tool(func):\n    # 返回一个字典而不是函数（function_tool 返回 FunctionTool 对象，道理一样）\n    return {\"name\": func.__name__, \"description\": func.__doc__, \"func\": func}\n\n@as_tool                          # 等价于：get_time = as_tool(get_time)\ndef get_time():\n    \"\"\"返回当前时间\"\"\"\n    return \"12:00\"\n\nprint(type(get_time).__name__)    # dict：名字 get_time 现在指向一个字典\nprint(get_time[\"name\"], \"-\", get_time[\"description\"])\nprint(get_time[\"func\"]())         # 原函数还在里面，可以这样调用",
        en: "TOOLS = {}\n\ndef register(func):\n    TOOLS[func.__name__] = func   # record it: function name -> function\n    return func                   # hand the same function back\n\n@register                         # same as: add = register(add)\ndef add(a, b):\n    return a + b\n\nprint(list(TOOLS))                # ['add']\nprint(add(2, 3))                  # 5: add is still the original function\n\n\ndef as_tool(func):\n    # returns a dict, not a function (function_tool returns a FunctionTool object - same idea)\n    return {\"name\": func.__name__, \"description\": func.__doc__, \"func\": func}\n\n@as_tool                          # same as: get_time = as_tool(get_time)\ndef get_time():\n    \"\"\"Return the current time\"\"\"\n    return \"12:00\"\n\nprint(type(get_time).__name__)    # dict: the name get_time now points to a dict\nprint(get_time[\"name\"], \"-\", get_time[\"description\"])\nprint(get_time[\"func\"]())         # the original function is still inside",
      },
    },
    {
      t: "py",
      title: { zh: "类型标注和 docstring：工具说明从哪来", en: "Type hints and docstrings: where the tool schema comes from" },
      zh: "`def get_temperature(latitude: float, longitude: float) -> str:` 这一行里：\n- `latitude: float` 是**类型标注**，说明这个参数应该是小数；`-> str` 说明返回字符串。Python 运行时**不会**检查它们，但别的代码可以读到。\n- 函数体第一行的三引号字符串叫 **docstring**（文档字符串），说明函数是干什么的。\n\n`@function_tool` 读的正是这两样：类型标注变成 JSON Schema 里的 `type`，docstring 第一段变成工具描述，`Args:` 下面每个参数的说明变成参数描述。模型就是靠这些信息决定**什么时候调用、传什么参数**。\n\n下面用 `inspect` 模块自己读一读，再拼出一个简化版的工具说明——SDK 做的事本质上就是这样：",
      en: "In `def get_temperature(latitude: float, longitude: float) -> str:`\n- `latitude: float` is a **type hint** saying the argument should be a decimal number; `-> str` says it returns a string. Python does **not** check them at run time, but other code can read them.\n- the triple-quoted string on the first line of the body is the **docstring**, describing what the function does.\n\n`@function_tool` reads exactly these: type hints become the `type` entries of the JSON Schema, the docstring's first paragraph becomes the tool description, and each line under `Args:` becomes a parameter description. That is all the model has to decide **when to call it and with what**.\n\nRead them yourself with the `inspect` module and build a simplified schema – essentially what the SDK does:",
      code: {
        zh: "import inspect\nimport json\n\ndef get_temperature(latitude: float, longitude: float) -> str:\n    \"\"\"查询某个经纬度当前的气温（摄氏度）。\"\"\"\n    return \"20°C\"\n\nprint(get_temperature.__annotations__)   # 类型标注存在这里\nprint(get_temperature.__doc__)           # docstring 存在这里\n\nPY_TO_JSON = {str: \"string\", int: \"integer\", float: \"number\", bool: \"boolean\"}\n\ndef make_schema(func):\n    properties = {}\n    # .items() 每次同时取出一对：参数名、参数信息\n    for name, param in inspect.signature(func).parameters.items():\n        properties[name] = {\"type\": PY_TO_JSON[param.annotation]}\n    return {\n        \"name\": func.__name__,\n        \"description\": inspect.getdoc(func),\n        \"parameters\": {\"type\": \"object\", \"properties\": properties, \"required\": list(properties)},\n    }\n\nprint(json.dumps(make_schema(get_temperature), ensure_ascii=False, indent=2))",
        en: "import inspect\nimport json\n\ndef get_temperature(latitude: float, longitude: float) -> str:\n    \"\"\"Get the current temperature (Celsius) at a latitude/longitude.\"\"\"\n    return \"20°C\"\n\nprint(get_temperature.__annotations__)   # the type hints live here\nprint(get_temperature.__doc__)           # the docstring lives here\n\nPY_TO_JSON = {str: \"string\", int: \"integer\", float: \"number\", bool: \"boolean\"}\n\ndef make_schema(func):\n    properties = {}\n    # .items() gives one pair at a time: parameter name, parameter info\n    for name, param in inspect.signature(func).parameters.items():\n        properties[name] = {\"type\": PY_TO_JSON[param.annotation]}\n    return {\n        \"name\": func.__name__,\n        \"description\": inspect.getdoc(func),\n        \"parameters\": {\"type\": \"object\", \"properties\": properties, \"required\": list(properties)},\n    }\n\nprint(json.dumps(make_schema(get_temperature), ensure_ascii=False, indent=2))",
      },
    },
    {
      t: "code",
      file: "get_temperature.params_json_schema",
      lang: "json",
      code: {
        zh: "{\n  \"properties\": {\n    \"latitude\": {\n      \"description\": \"纬度，例如北京是 39.9\",\n      \"title\": \"Latitude\",\n      \"type\": \"number\"\n    },\n    \"longitude\": {\n      \"description\": \"经度，例如北京是 116.4\",\n      \"title\": \"Longitude\",\n      \"type\": \"number\"\n    }\n  },\n  \"required\": [\"latitude\", \"longitude\"],\n  \"title\": \"get_temperature_args\",\n  \"type\": \"object\",\n  \"additionalProperties\": false\n}",
        en: "{\n  \"properties\": {\n    \"latitude\": {\n      \"description\": \"The latitude, e.g. 39.9 for Beijing.\",\n      \"title\": \"Latitude\",\n      \"type\": \"number\"\n    },\n    \"longitude\": {\n      \"description\": \"The longitude, e.g. 116.4 for Beijing.\",\n      \"title\": \"Longitude\",\n      \"type\": \"number\"\n    }\n  },\n  \"required\": [\"latitude\", \"longitude\"],\n  \"title\": \"get_temperature_args\",\n  \"type\": \"object\",\n  \"additionalProperties\": false\n}",
      },
      note: {
        zh: "这是本地运行 `practice/l08_tool_schema.py` 打印出的真实结果。和 `weather_tool.py` 里手写的 `parameters` 对比：结构一样，SDK 还加上了 `title`，并自动设置 `additionalProperties: false`（严格模式）。如果函数**没有**类型标注和 docstring，生成的说明里只剩参数名，描述是空的，模型只能靠猜。",
        en: "This is the real output of `practice/l08_tool_schema.py`. Compare it with the hand-written `parameters` in `weather_tool.py`: same structure, plus a `title`, and `additionalProperties: false` set automatically (strict mode). If the function has **no** type hints or docstring, only the parameter names survive and the description is empty, so the model has to guess.",
      },
    },
    {
      t: "check",
      q: {
        zh: "加了 `@function_tool` 以后，直接写 `get_temperature(39.9, 116.4)` 会怎样？",
        en: "After adding `@function_tool`, what happens if you call `get_temperature(39.9, 116.4)` directly?",
      },
      options: [
        { zh: "正常返回气温", en: "It returns the temperature as usual" },
        { zh: "报错：'FunctionTool' object is not callable", en: "An error: 'FunctionTool' object is not callable" },
        { zh: "自动去调用模型", en: "It calls the model automatically" },
      ],
      answer: 1,
      explain: {
        zh: "装饰器用返回值替换了原来的名字，`get_temperature` 现在是一个 `FunctionTool` 对象，由 Agent 负责调用。",
        en: "The decorator replaced the name with its return value: `get_temperature` is now a `FunctionTool` object, and the agent is the one that calls it.",
      },
    },
    { t: "h", zh: "六、Runner 在背后做了什么", en: "6. What Runner does behind the scenes" },
    {
      t: "p",
      zh: "视频讲组件图时说过（[▶ 23:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=1417)）：Agent 循环藏在 Runner 里面。下面亲眼看看它做了什么。运行上面带工具的例子后，`result.new_items` 记录了这次运行经过的每一步。在本地用 DeepSeek 实际运行一次（`practice/l08_first_agent_solution.py` 会打印每一步的 `type`），得到：\n\n1. `tool_call_item`：模型要求调用 `get_temperature`\n2. `tool_call_output_item`：你的函数返回的结果\n3. `reasoning_item`：模型的思考过程（DeepSeek 会返回，有的模型没有；它出现在第几步、出现几次，每次运行可能不一样）\n4. `message_output_item`：模型根据结果写出的最终回答\n\n很眼熟吧？这正是 06 节 `message_history` 里多出来的那几条消息。`Runner` 跑的就是你手写过的那个循环。下面用模拟模型写一个**简化版的 Runner**，和 SDK 对照着看：",
      en: "On the component diagram the video says ([▶ 23:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=9&t=1417)) that the agent loop is hidden inside the Runner. Let's watch what it does. After running the tool example above, `result.new_items` records every step of the run. One local run against DeepSeek (`practice/l08_first_agent_solution.py` prints the `type` of each step) gave:\n\n1. `tool_call_item`: the model asks for `get_temperature`\n2. `tool_call_output_item`: what your function returned\n3. `reasoning_item`: the model's thinking (DeepSeek returns it, some models don't; where it shows up and how often can change from run to run)\n4. `message_output_item`: the final answer written from that result\n\nLooks familiar? These are the very messages that appeared in lesson 06's `message_history`. `Runner` runs the loop you already wrote. Below, a **tiny Runner** on the mock model, to compare with the SDK:",
    },
    {
      t: "code",
      file: "mini_runner.py",
      run: "mock",
      code: {
        zh: "import json\nfrom llm import client, MODEL\nfrom weather_tool import get_weather, tools\n\nclass MiniAgent:\n    def __init__(self, name, instructions, tools=None, functions=None):\n        self.name = name\n        self.instructions = instructions\n        self.tools = tools or []            # 给模型看的工具说明\n        self.functions = functions or {}    # 工具名 → 真正的函数（回顾 07 节的函数字典）\n\ndef run_sync(agent, user_input, max_turns=10):\n    \"\"\"简化版 Runner：循环「调模型 → 执行工具」，直到拿到最终回答。\"\"\"\n    messages = [\n        {\"role\": \"system\", \"content\": agent.instructions},\n        {\"role\": \"user\", \"content\": user_input},\n    ]\n    for turn in range(max_turns):\n        reply = client.chat.completions.create(model=MODEL, messages=messages, tools=agent.tools).choices[0].message\n        messages.append(reply.model_dump())\n        if not reply.tool_calls:                    # 没有工具调用 = 最终回答\n            return reply.content\n        for call in reply.tool_calls:\n            func = agent.functions[call.function.name]\n            result = func(**json.loads(call.function.arguments))\n            print(f\"  [第 {turn + 1} 轮] 调用 {call.function.name} → {result}\")\n            messages.append({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": str(result)})\n    raise RuntimeError(\"超过 max_turns，还没有得到最终回答\")\n\nagent = MiniAgent(\n    name=\"天气助手\",\n    instructions=\"你是一个简洁的天气助手。\",\n    tools=tools,\n    functions={\"get_weather\": get_weather},\n)\nprint(run_sync(agent, \"北京和上海现在多少度？\"))",
        en: "import json\nfrom llm import client, MODEL\nfrom weather_tool import get_weather, tools\n\nclass MiniAgent:\n    def __init__(self, name, instructions, tools=None, functions=None):\n        self.name = name\n        self.instructions = instructions\n        self.tools = tools or []            # tool descriptions the model reads\n        self.functions = functions or {}    # tool name -> real function (see lesson 07's function dict)\n\ndef run_sync(agent, user_input, max_turns=10):\n    \"\"\"A tiny Runner: loop \"call model -> run tools\" until there is a final answer.\"\"\"\n    messages = [\n        {\"role\": \"system\", \"content\": agent.instructions},\n        {\"role\": \"user\", \"content\": user_input},\n    ]\n    for turn in range(max_turns):\n        reply = client.chat.completions.create(model=MODEL, messages=messages, tools=agent.tools).choices[0].message\n        messages.append(reply.model_dump())\n        if not reply.tool_calls:                    # no tool calls = the final answer\n            return reply.content\n        for call in reply.tool_calls:\n            func = agent.functions[call.function.name]\n            result = func(**json.loads(call.function.arguments))\n            print(f\"  [turn {turn + 1}] called {call.function.name} -> {result}\")\n            messages.append({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": str(result)})\n    raise RuntimeError(\"max_turns exceeded without a final answer\")\n\nagent = MiniAgent(\n    name=\"weather assistant\",\n    instructions=\"You are a concise weather assistant.\",\n    tools=tools,\n    functions={\"get_weather\": get_weather},\n)\nprint(run_sync(agent, \"How warm is it in Beijing and Shanghai right now?\"))",
      },
      note: {
        zh: "对照 SDK：`MiniAgent(...)` ≈ `Agent(...)`，`run_sync(agent, ...)` ≈ `Runner.run_sync(agent, ...)`，`functions` 字典 + `tools` 说明 ≈ `@function_tool` 自动生成的东西。",
        en: "Compare with the SDK: `MiniAgent(...)` ≈ `Agent(...)`, `run_sync(agent, ...)` ≈ `Runner.run_sync(agent, ...)`, and the `functions` dict + `tools` descriptions ≈ what `@function_tool` generates for you.",
      },
    },
    {
      t: "note",
      zh: "SDK 的 `Runner` 也有轮数上限：`max_turns` 默认是 10，超过会抛出 `MaxTurnsExceeded` 异常。需要时可以调大：`Runner.run_sync(agent, \"...\", max_turns=20)`。",
      en: "The SDK's `Runner` has a turn limit too: `max_turns` defaults to 10, and going past it raises `MaxTurnsExceeded`. Raise it when needed: `Runner.run_sync(agent, \"...\", max_turns=20)`.",
    },
    {
      t: "tip",
      zh: "`result` 上常用的几个属性：\n- `result.final_output`：最终回答\n- `result.new_items`：这次运行产生的每一步（工具调用、工具结果、回答……）\n- `result.last_agent`：最后是哪个 Agent 给出的回答（多 Agent 时有用）\n- `result.to_input_list()`：把这次对话整理成消息列表，下一轮可以接着用（多轮对话时会用到）",
      en: "Handy attributes of `result`:\n- `result.final_output`: the final answer\n- `result.new_items`: every step of the run (tool calls, tool results, answers…)\n- `result.last_agent`: which agent gave the final answer (useful with several agents)\n- `result.to_input_list()`: the conversation as a message list you can continue next turn (used for multi-turn chats)",
    },
  ],
  quiz: [
    {
      q: { zh: "用 DeepSeek 时，为什么要用 `OpenAIChatCompletionsModel` 包一层？", en: "Why wrap the client in `OpenAIChatCompletionsModel` when using DeepSeek?" },
      options: [
        { zh: "为了让回答更快", en: "To make answers faster" },
        { zh: "因为 DeepSeek 不支持工具调用", en: "Because DeepSeek doesn't support tool calls" },
        {
          zh: "SDK 默认走 OpenAI 的 Responses 接口，而 DeepSeek 只提供 Chat Completions 接口",
          en: "The SDK defaults to OpenAI's Responses API, but DeepSeek only offers the Chat Completions API",
        },
        { zh: "为了不用写 API key", en: "So you don't need an API key" },
      ],
      answer: 2,
      explain: {
        zh: "`OpenAIChatCompletionsModel` 让 SDK 改用 `chat.completions.create` 和模型对话，DeepSeek、百炼都支持这个接口。",
        en: "`OpenAIChatCompletionsModel` makes the SDK talk to the model through `chat.completions.create`, which DeepSeek and Bailian both support.",
      },
    },
    {
      q: { zh: "在函数上面写 `@function_tool`，等价于哪一句？", en: "Writing `@function_tool` above a function is the same as:" },
      options: [
        { zh: "`get_temperature = function_tool(get_temperature)`", en: "`get_temperature = function_tool(get_temperature)`" },
        { zh: "`function_tool = get_temperature(function_tool)`", en: "`function_tool = get_temperature(function_tool)`" },
        { zh: "`get_temperature()` 之后再调用 `function_tool()`", en: "Calling `get_temperature()` and then `function_tool()`" },
        { zh: "`import function_tool`", en: "`import function_tool`" },
      ],
      answer: 0,
      explain: {
        zh: "装饰器就是把函数交给装饰器函数处理，再用返回值替换原来的名字。",
        en: "A decorator hands the function to the decorator function and replaces the name with what it returns.",
      },
    },
    {
      q: { zh: "`@function_tool` 生成工具说明时，**不会**用到下面哪一项？", en: "Which of these does `@function_tool` **not** use to build the tool schema?" },
      options: [
        { zh: "函数名", en: "The function name" },
        { zh: "参数的类型标注", en: "The parameters' type hints" },
        { zh: "docstring", en: "The docstring" },
        { zh: "函数体里 `return` 的具体值", en: "The actual value the body returns" },
      ],
      answer: 3,
      explain: {
        zh: "工具说明在运行前就生成了，只看函数的「外表」：名字、类型标注、docstring。函数体只在模型真正调用时才执行。",
        en: "The schema is built before anything runs, from the function's “outside”: name, type hints, docstring. The body only runs when the model actually calls the tool.",
      },
    },
    {
      q: { zh: "`set_tracing_disabled(True)` 的作用是？", en: "What does `set_tracing_disabled(True)` do?" },
      options: [
        { zh: "关掉模型的思考过程", en: "Turns off the model's reasoning" },
        { zh: "不把运行记录上传到 OpenAI 后台（上传需要 OpenAI 的 key）", en: "Stops uploading run records to OpenAI's dashboard (which needs an OpenAI key)" },
        { zh: "关掉工具调用", en: "Disables tool calls" },
        { zh: "不在终端打印最终回答", en: "Stops printing the final answer" },
      ],
      answer: 1,
      explain: {
        zh: "追踪（tracing）默认会上传到 OpenAI。我们用 DeepSeek、没有 OpenAI key，所以关掉它，Agent 本身照常运行。",
        en: "Tracing uploads to OpenAI by default. We use DeepSeek with no OpenAI key, so we switch it off; the agent itself runs as usual.",
      },
    },
    {
      q: {
        zh: "视频的组件图里，「Agent 循环」放在哪里？它对应你在 06 节手写的哪部分？",
        en: "In the video's component diagram, where does the “agent loop” live, and which part of your lesson-06 code does it correspond to?",
      },
      options: [
        { zh: "一个单独的组件，对应 05 节手写的 JSON Schema", en: "A separate component, matching the JSON Schema you wrote in lesson 05" },
        { zh: "在护栏里面，对应自己写的 if 判断", en: "Inside the guardrails, matching your own if checks" },
        {
          zh: "在 `Runner` 内部，对应 `while reply.tool_calls:` 循环：执行工具、存结果、再调用模型",
          en: "Inside the `Runner`, matching the `while reply.tool_calls:` loop: run tools, store results, call the model again",
        },
        { zh: "在追踪里面，对应到处 `print` 调试", en: "Inside tracing, matching `print` debugging everywhere" },
      ],
      answer: 2,
      explain: {
        zh: "老师说 Agent 循环不该看成单独的组件，它是 Runner 内部的细节：反复调用模型、处理工具调用、完成交接，直到得到最终回答（或超过 `max_turns`）。这正是你在 06 节手写的那个循环。",
        en: "The instructor says the agent loop is not a separate component but a detail inside the Runner: call the model, handle tool calls, complete handoffs, until there is a final answer (or `max_turns` is exceeded). It is exactly the loop you hand-wrote in lesson 06.",
      },
    },
    {
      q: { zh: "视频特别强调了 OpenAI Agents SDK 的「护栏」（Guardrails）。它的作用是？", en: "The video puts special emphasis on the SDK's guardrails. What do they do?" },
      options: [
        {
          zh: "和 Agent 一起运行，检查输入和输出，发现不合规的内容就中断这次运行",
          en: "Run alongside the agent, check input and output, and stop the run when something breaks the rules",
        },
        { zh: "限制 Agent 最多循环几轮", en: "Limit how many turns the agent may loop" },
        { zh: "把运行记录上传到 OpenAI 后台", en: "Upload run records to OpenAI's dashboard" },
        { zh: "把任务转交给另一个更专业的 Agent", en: "Pass the task to a more specialised agent" },
      ],
      answer: 0,
      explain: {
        zh: "护栏检查输入和输出，不合规就把这次运行掐断（在 SDK 里表现为抛出 `InputGuardrailTripwireTriggered` 或 `OutputGuardrailTripwireTriggered` 异常）。限制轮数是 `max_turns`，上传记录是追踪，转交任务是交接。",
        en: "Guardrails check input and output and cut the run off when something is wrong (in the SDK this raises `InputGuardrailTripwireTriggered` or `OutputGuardrailTripwireTriggered`). Limiting turns is `max_turns`, uploading records is tracing, passing tasks on is a handoff.",
      },
    },
  ],
  fill: [
    {
      title: { zh: "第一个带工具的 Agent", en: "A first agent with a tool" },
      code: {
        zh: "from agents import Agent, OpenAIChatCompletionsModel, Runner, function_tool, set_tracing_disabled\nfrom llm import MODEL, async_client\nfrom weather_tool import get_weather\n\nset_tracing_disabled([[True]])\n\n@[[function_tool]]\ndef get_temperature(latitude: [[float]], longitude: float) -> [[str]]:\n    \"\"\"查询某个经纬度当前的气温（摄氏度）。\"\"\"\n    return f\"{get_weather(latitude, longitude)}°C\"\n\nmodel = [[OpenAIChatCompletionsModel]](model=MODEL, openai_client=[[async_client]])\nagent = [[Agent]](name=\"天气助手\", instructions=\"你是一个简洁的天气助手。\", model=model, [[tools]]=[get_temperature])\nresult = Runner.[[run_sync]](agent, \"北京现在多少度？\")\nprint(result.[[final_output]])",
        en: "from agents import Agent, OpenAIChatCompletionsModel, Runner, function_tool, set_tracing_disabled\nfrom llm import MODEL, async_client\nfrom weather_tool import get_weather\n\nset_tracing_disabled([[True]])\n\n@[[function_tool]]\ndef get_temperature(latitude: [[float]], longitude: float) -> [[str]]:\n    \"\"\"Get the current temperature (Celsius) at a latitude/longitude.\"\"\"\n    return f\"{get_weather(latitude, longitude)}°C\"\n\nmodel = [[OpenAIChatCompletionsModel]](model=MODEL, openai_client=[[async_client]])\nagent = [[Agent]](name=\"weather assistant\", instructions=\"You are a concise weather assistant.\", model=model, [[tools]]=[get_temperature])\nresult = Runner.[[run_sync]](agent, \"How warm is Beijing right now?\")\nprint(result.[[final_output]])",
      },
      explain: {
        zh: "关追踪 → 装饰器定义工具（类型标注 + docstring）→ 用 `OpenAIChatCompletionsModel` 包客户端 → 创建 `Agent` → `Runner.run_sync` → `final_output`。",
        en: "Disable tracing → define the tool with the decorator (type hints + docstring) → wrap the client in `OpenAIChatCompletionsModel` → create the `Agent` → `Runner.run_sync` → `final_output`.",
      },
    },
    {
      title: { zh: "写一个类", en: "Write a class" },
      code: {
        zh: "class MiniAgent:\n    def [[__init__]]([[self]], name, instructions, tools=None):\n        [[self]].name = name\n        self.instructions = instructions\n        self.tools = tools [[or]] []\n\nagent = [[MiniAgent]](name=\"翻译官\", instructions=\"把中文翻译成英文\")\nprint(agent.[[name]])",
        en: "class MiniAgent:\n    def [[__init__]]([[self]], name, instructions, tools=None):\n        [[self]].name = name\n        self.instructions = instructions\n        self.tools = tools [[or]] []\n\nagent = [[MiniAgent]](name=\"translator\", instructions=\"Translate Chinese into English\")\nprint(agent.[[name]])",
      },
      explain: {
        zh: "`__init__` 在创建对象时自动运行；`self` 是正在创建的对象；用 `类名(...)` 创建对象，用点号读属性。",
        en: "`__init__` runs when an object is created; `self` is that object; create objects with `ClassName(...)` and read attributes with a dot.",
      },
    },
  ],
  write: [
    {
      title: { zh: "手写：带工具的第一个 Agent", en: "Write it: a first agent with a tool" },
      task: {
        zh: "不看上面的代码，写一个查气温的 Agent：\n1. 从 `agents` 导入需要的东西，关掉追踪上传\n2. 用 `@function_tool` 定义 `get_temperature(latitude: float, longitude: float) -> str`，写上 docstring，函数里调用 `get_weather` 并返回带 °C 的字符串\n3. 用 `OpenAIChatCompletionsModel` 创建 model，再创建 `Agent`，把工具放进 `tools` 列表\n4. 用 `Runner.run_sync` 问「上海现在多少度？」，打印 `final_output`\n\n框架代码不能在网页里运行：写完点「检查关键点」，然后在本地用 `practice/l08_first_agent_todo.py` 真正跑一遍。",
        en: "Without looking above, write a temperature agent:\n1. import what you need from `agents` and turn off trace upload\n2. define `get_temperature(latitude: float, longitude: float) -> str` with `@function_tool` and a docstring; call `get_weather` inside and return a string with °C\n3. create the model with `OpenAIChatCompletionsModel`, then an `Agent` with the tool in its `tools` list\n4. ask “How warm is Shanghai right now?” with `Runner.run_sync` and print `final_output`\n\nFramework code can't run in the browser: press “Check key points” here, then run it for real locally with `practice/l08_first_agent_todo.py`.",
      },
      starter: {
        zh: "from llm import MODEL, async_client\nfrom weather_tool import get_weather      # get_weather(latitude, longitude) 返回气温数字\n\n# 1. 从 agents 导入需要的类和函数\n\n# 2. 关掉追踪上传\n\n# 3. 定义工具 get_temperature：参数 latitude、longitude 都是小数，返回字符串；写上类型标注和 docstring\n\n# 4. 创建 model 和 agent（把工具放进 tools 列表）\n\n# 5. 用同步方式运行，问「上海现在多少度？」，打印最终回答",
        en: "from llm import MODEL, async_client\nfrom weather_tool import get_weather      # get_weather(latitude, longitude) returns the temperature\n\n# 1. import what you need from agents\n\n# 2. turn off trace upload\n\n# 3. define the tool get_temperature: latitude and longitude are floats, it returns a string; add type hints and a docstring\n\n# 4. create the model and the agent (put the tool in the tools list)\n\n# 5. run it synchronously, ask \"How warm is Shanghai right now?\" and print the final answer",
      },
      solution: {
        zh: "from llm import MODEL, async_client\nfrom weather_tool import get_weather      # get_weather(latitude, longitude) 返回气温数字\n\n# 1. 从 agents 导入需要的类和函数\nfrom agents import Agent, OpenAIChatCompletionsModel, Runner, function_tool, set_tracing_disabled\n\n# 2. 关掉追踪上传\nset_tracing_disabled(True)\n\n# 3. 定义工具 get_temperature\n@function_tool\ndef get_temperature(latitude: float, longitude: float) -> str:\n    \"\"\"查询某个经纬度当前的气温（摄氏度）。\n\n    Args:\n        latitude: 纬度\n        longitude: 经度\n    \"\"\"\n    return f\"{get_weather(latitude, longitude)}°C\"\n\n# 4. 创建 model 和 agent\nmodel = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)\nagent = Agent(\n    name=\"天气助手\",\n    instructions=\"你是一个简洁的天气助手。需要气温时调用工具。\",\n    model=model,\n    tools=[get_temperature],\n)\n\n# 5. 运行并打印最终回答\nresult = Runner.run_sync(agent, \"上海现在多少度？\")\nprint(result.final_output)",
        en: "from llm import MODEL, async_client\nfrom weather_tool import get_weather      # get_weather(latitude, longitude) returns the temperature\n\n# 1. import what you need from agents\nfrom agents import Agent, OpenAIChatCompletionsModel, Runner, function_tool, set_tracing_disabled\n\n# 2. turn off trace upload\nset_tracing_disabled(True)\n\n# 3. define the tool get_temperature\n@function_tool\ndef get_temperature(latitude: float, longitude: float) -> str:\n    \"\"\"Get the current temperature (Celsius) at a latitude/longitude.\n\n    Args:\n        latitude: The latitude.\n        longitude: The longitude.\n    \"\"\"\n    return f\"{get_weather(latitude, longitude)}°C\"\n\n# 4. create the model and the agent\nmodel = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)\nagent = Agent(\n    name=\"weather assistant\",\n    instructions=\"You are a concise weather assistant. Use the tool for temperatures.\",\n    model=model,\n    tools=[get_temperature],\n)\n\n# 5. run it and print the final answer\nresult = Runner.run_sync(agent, \"How warm is Shanghai right now?\")\nprint(result.final_output)",
      },
      checks: [
        { zh: "从 `agents` 导入", en: "Imports from `agents`", re: "^from\\s+agents\\s+import\\s+" },
        {
          zh: "关掉追踪：`set_tracing_disabled(True)`",
          en: "Disables tracing: `set_tracing_disabled(True)`",
          re: "set_tracing_disabled\\(\\s*True\\s*\\)",
        },
        { zh: "函数上面有 `@function_tool`", en: "`@function_tool` above the function", re: "^@function_tool\\s*$" },
        {
          zh: "参数和返回值都有类型标注",
          en: "Type hints on the parameters and the return value",
          re: "def\\s+get_temperature\\s*\\(\\s*latitude\\s*:\\s*float\\s*,\\s*longitude\\s*:\\s*float\\s*\\)\\s*->\\s*str\\s*:",
        },
        { zh: "函数里写了 docstring", en: "The function has a docstring", re: "^\\s+(\\\"{3}|'{3})" },
        {
          zh: "用 `OpenAIChatCompletionsModel` 并传入 `async_client`",
          en: "Uses `OpenAIChatCompletionsModel` with `async_client`",
          re: "OpenAIChatCompletionsModel\\([^)]*openai_client\\s*=\\s*async_client",
        },
        { zh: "工具放进 `tools=[get_temperature]`", en: "The tool is in `tools=[get_temperature]`", re: "tools\\s*=\\s*\\[\\s*get_temperature\\s*\\]" },
        { zh: "用 `Runner.run_sync(agent, ...)` 运行", en: "Runs with `Runner.run_sync(agent, ...)`", re: "Runner\\.run_sync\\(\\s*\\w+\\s*," },
        { zh: "打印 `final_output`", en: "Prints `final_output`", re: "print\\(\\s*\\w+\\.final_output\\s*\\)" },
      ],
    },
  ],
  pitfalls: [
    {
      zh: "创建 `Agent` 时忘了写 `model=`：SDK 会改用 OpenAI 的默认模型和 Responses 接口，运行时报 `Missing credentials ... OPENAI_API_KEY`。",
      en: "Forgetting `model=` on the `Agent`: the SDK falls back to OpenAI's default model and the Responses API, and fails with `Missing credentials ... OPENAI_API_KEY`.",
    },
    {
      zh: "忘了 `set_tracing_disabled(True)`：会冒出 `OPENAI_API_KEY is not set, skipping trace export` 之类的提示。",
      en: "Forgetting `set_tracing_disabled(True)`: you get messages like `OPENAI_API_KEY is not set, skipping trace export`.",
    },
    {
      zh: "给 `OpenAIChatCompletionsModel` 传了同步的 `client`：SDK 内部要 `await` 它，必须传 `async_client`。",
      en: "Passing the synchronous `client` to `OpenAIChatCompletionsModel`: the SDK `await`s it internally, so it must be `async_client`.",
    },
    {
      zh: "把装饰后的工具当普通函数调用：`get_temperature(39.9, 116.4)` 报 `'FunctionTool' object is not callable`。",
      en: "Calling the decorated tool like a plain function: `get_temperature(39.9, 116.4)` raises `'FunctionTool' object is not callable`.",
    },
    {
      zh: "工具函数不写类型标注和 docstring：生成的说明里没有参数类型和描述，模型容易传错参数或不知道什么时候该用。",
      en: "No type hints or docstring on a tool: the schema has no types or descriptions, so the model passes wrong arguments or doesn't know when to use it.",
    },
    { zh: "写成 `tools=get_temperature`（少了方括号）：`tools` 必须是列表。", en: "Writing `tools=get_temperature` without brackets: `tools` must be a list." },
    {
      zh: "用 DeepSeek 时加了 `WebSearchTool` 这类托管工具：它们只能配合 OpenAI 的 Responses 接口使用。",
      en: "Adding hosted tools like `WebSearchTool` with DeepSeek: they only work with OpenAI's Responses API.",
    },
  ],
  recap: [
    { zh: "Agent 框架封装的是你手写过的那套：消息列表 + 工具调用 + 循环。", en: "An agent framework packages what you hand-wrote: a message list + tool calls + a loop." },
    {
      zh: "选框架（视频的思路）：大团队复杂项目用 LangChain / LangGraph；新手、小项目用 smolagents 或 OpenAI Agents SDK；介于中间可以看 AG2、Pydantic AI。课程先学 OpenAI Agents SDK：够简单，又不是最简单。",
      en: "Choosing (the video's view): big teams and complex projects → LangChain / LangGraph; beginners and small projects → smolagents or the OpenAI Agents SDK; in between → AG2, Pydantic AI. The course starts with the OpenAI Agents SDK: simple, but not the simplest.",
    },
    {
      zh: "SDK 的设计原则：功能够用、概念少；开箱即用又能自定义。主要功能：Agent 循环、交接、护栏、Python 优先、函数工具、追踪。组件图：核心是 `Runner` + `Agent`（Agent 循环在 Runner 里），按需再加护栏、交接、工具；接别家模型要改模型层；护栏和 Agent 并行，检查输入输出，不合规就中断运行。",
      en: "The SDK's design principles: enough features, few concepts; ready to use yet customisable. Main features: agent loop, handoffs, guardrails, Python first, function tools, tracing. The diagram: the core is `Runner` + `Agent` (the agent loop lives in the Runner); add guardrails, handoffs and tools as needed; other vendors' models need a change in the model layer. Guardrails run in parallel with the agent, check input and output, and stop a run that breaks the rules.",
    },
    {
      zh: "SDK 三件套：`Agent`（谁、用什么模型、有什么工具）、`Runner`（跑循环）、`@function_tool`（函数变工具）。",
      en: "The SDK's core trio: `Agent` (who, which model, which tools), `Runner` (runs the loop), `@function_tool` (function → tool).",
    },
    {
      zh: "接 DeepSeek / 千问：`OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)` + `set_tracing_disabled(True)`。",
      en: "For DeepSeek / Qwen: `OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)` + `set_tracing_disabled(True)`.",
    },
    {
      zh: "`@function_tool` 等价于 `f = function_tool(f)`，它读取类型标注和 docstring 生成工具说明，返回的是 `FunctionTool` 对象。",
      en: "`@function_tool` means `f = function_tool(f)`; it reads type hints and the docstring to build the schema and returns a `FunctionTool` object.",
    },
    {
      zh: "`Runner.run_sync(agent, 问题)` 返回 `result`，最终回答在 `result.final_output`，每一步在 `result.new_items`。",
      en: "`Runner.run_sync(agent, question)` returns `result`; the answer is `result.final_output` and the steps are `result.new_items`.",
    },
  ],
  files: [
    {
      path: "practice/l08_first_agent_todo.py",
      zh: "练习：补全 TODO，写出带查气温工具的第一个 Agent。",
      en: "Exercise: fill in the TODOs to build a first agent with a temperature tool.",
    },
    {
      path: "practice/l08_first_agent_solution.py",
      zh: "参考答案：运行后打印最终回答和 `new_items` 里的每一步。",
      en: "Solution: prints the final answer and every step in `new_items`.",
    },
    {
      path: "practice/l08_tool_schema.py",
      zh: "小实验（不调用模型、不需要 key）：看看 `@function_tool` 生成的工具名、描述和 JSON Schema。",
      en: "Mini-experiment (no model call, no key): see the name, description and JSON Schema `@function_tool` generates.",
    },
  ],
});
