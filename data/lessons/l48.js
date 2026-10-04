COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l48",
  "priority": "core",
  "handwrite": true,
  "studyMinutes": 65,
  "source": "subtitle",
  "summary": {
    "zh": "LCEL（LangChain Expression Language）是 LangChain 最核心的设计：用 `|` 把提示词、模型、解析器、检索器这些组件串成一条「A 的输出交给 B」的固定流水线，串好的链自动拥有 `invoke` / `stream` / `batch` / 异步这些调用方式。这一节按视频（31 分钟）的顺序走：语义解析链 → 讲笑话的流式链 → 官方的「用 / 不用 LCEL」对比 → RAG 链 → 选修的「工厂」切换模型和设计模式讨论 → 用 `RunnableWithMessageHistory` 按会话存取历史。学完要能独立手写 `prompt | model | parser` 和一条完整的 RAG 链。",
    "en": "LCEL (LangChain Expression Language) is LangChain's central design: `|` joins components – prompts, models, parsers, retrievers – into a fixed pipeline where A's output goes to B, and the finished chain automatically supports `invoke` / `stream` / `batch` / async. This lesson follows the 31-minute video: a semantic-parsing chain → a streaming joke chain → the official “with / without LCEL” comparison → a RAG chain → the optional model-switching “factory” and a design-pattern discussion → per-session history with `RunnableWithMessageHistory`. By the end you should be able to hand-write `prompt | model | parser` and a complete RAG chain."
  },
  "goals": [
    {
      "zh": "说出 LCEL 是什么、能带来什么好处（流式、批量并发、异步、重试和回退）",
      "en": "Say what LCEL is and what it gives you (streaming, concurrent batches, async, retries and fallbacks)"
    },
    {
      "zh": "看懂 Python 的 `|` 为什么能把对象串起来（`__or__` 运算符重载）",
      "en": "Understand why Python's `|` can join objects (`__or__` operator overloading)"
    },
    {
      "zh": "手写 `{\"x\": RunnablePassthrough()} | prompt | model | parser`，并用 `invoke`、`stream`、`batch` 调用",
      "en": "Hand-write `{\"x\": RunnablePassthrough()} | prompt | model | parser` and call it with `invoke`, `stream` and `batch`"
    },
    {
      "zh": "独立手写 RAG 链：`{\"context\": retriever | format_docs, \"question\": RunnablePassthrough()}` → 提示词 → 模型 → `StrOutputParser`",
      "en": "Write a RAG chain unaided: `{\"context\": retriever | format_docs, \"question\": RunnablePassthrough()}` → prompt → model → `StrOutputParser`"
    },
    {
      "zh": "了解 `configurable_alternatives` + `with_config` 在运行时切换模型，以及讲师说的「建造者模式」",
      "en": "Know `configurable_alternatives` + `with_config` for switching models at run time, and the instructor's “Builder pattern” point"
    },
    {
      "zh": "用 `RunnableWithMessageHistory` + `get_session_history` 按 `session_id` 存取历史",
      "en": "Store and load history by `session_id` with `RunnableWithMessageHistory` + `get_session_history`"
    }
  ],
  "blocks": [
    {
      "t": "h",
      "zh": "一、LCEL 是什么",
      "en": "1. What LCEL is"
    },
    {
      "t": "p",
      "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=0) LangChain 最早把「和大模型打交道的一整套调用」叫 Chain，后来给它起了个正式的名字：**LangChain Expression Language（LCEL）**。讲师认为这是 LangChain 在架构上最核心、最专注的贡献。\n\n[▶ 01:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=65) 它是一种**声明式**写法：你只描述「谁接在谁后面」，至于怎么一步步传数据，交给框架。讲师提醒大家体会「自由组合调用顺序」这句话——所谓调用顺序，就是一条**既定的流水线**（pipeline）：A 的输出交给 B，B 的输出交给 C，C 的输出再交给 D。LangChain 希望这样定义好的流水线，从原型、调试到部署上线都不用改代码，甚至可以把整条链发布出去给别人用。",
      "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=0) LangChain originally called “the whole sequence of calls to a model” a Chain, and later gave it a proper name: **LangChain Expression Language (LCEL)**. The instructor sees it as LangChain's most central and most focused architectural contribution.\n\n[▶ 01:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=65) It's **declarative**: you only describe “what comes after what”, and the framework moves the data along. The instructor asks you to take in the phrase “freely compose the order of calls” – an order of calls is a **fixed pipeline**: A's output goes to B, B's to C, C's to D. LangChain wants a pipeline defined this way to go from prototype through debugging to deployment without code changes – you can even publish the whole chain for others to use."
    },
    {
      "t": "p",
      "zh": "[▶ 03:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=190) 用 LCEL 定义好一条链之后，不改代码就能获得这些能力：\n- **流式输出**、**异步调用**、**并行执行**\n- **失败重试**和**回退**：比如调 OpenAI 一直失败，就自动换另一家的模型（视频举的是文心一言）\n- **中间结果**：每一步的输入输出都能被记录下来（配合 LangSmith 调试，也能用回调函数自己处理）\n- 和 LangChain 团队自己的 **LangSmith**（跟踪调试）、**LangServe**（部署成服务，第 50 节）无缝衔接\n\n讲师还提到，现在文档里 **chain** 和 **Runnable**（可运行对象）这两个词经常混用，指的都是用 LCEL 拼出来的东西。",
      "en": "[▶ 03:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=190) Once a chain is defined with LCEL, you get these without changing code:\n- **streaming**, **async calls** and **parallel execution**\n- **retries** and **fallbacks**: if calls to OpenAI keep failing, switch to another vendor's model automatically (the video's example is Baidu's ERNIE Bot)\n- **intermediate results**: every step's input and output can be recorded (debug them with LangSmith, or handle them yourself with callbacks)\n- seamless integration with the LangChain team's own **LangSmith** (tracing and debugging) and **LangServe** (deploying as a service, lesson 50)\n\nThe instructor also notes that the docs now use **chain** and **Runnable** almost interchangeably for anything built with LCEL."
    },
    {
      "t": "video",
      "zh": "这一集 31 分钟（据 B 站自动字幕），按这个顺序讲，本节也按这个顺序：\n1. [▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=0) 读官方对 LCEL 的介绍和好处\n2. [▶ 04:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=281) 例子一：把用户的一句话解析成流量套餐的结构化查询（`invoke`）\n3. [▶ 09:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=593) 例子二：讲笑话的链，演示 `stream` 流式输出\n4. [▶ 11:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=698) 浏览官方「用 / 不用 LCEL」的代码对比\n5. [▶ 14:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=858) 例子三：RAG 链\n6. [▶ 16:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=983) 选修：用 `configurable_alternatives` 实现「工厂」，以及 LCEL 像哪种设计模式\n7. [▶ 25:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1514) 用 `RunnableWithMessageHistory` 按 session_id 存取对话历史\n8. [▶ 30:28](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1828) 其他功能一笔带过\n\n视频用的是 OpenAI 的模型（选修部分提到 GPT-4o mini，另一个选项是百度文心一言）；本课换成 DeepSeek（`practice/llm.py` 里的 `deepseek-flash`），例子的具体文字是我们自己写的。",
      "en": "This 31-minute episode (per Bilibili's auto-generated subtitles) goes in this order, and so does this lesson:\n1. [▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=0) the official intro to LCEL and its benefits\n2. [▶ 04:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=281) example 1: parse a user's sentence into a structured data-plan query (`invoke`)\n3. [▶ 09:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=593) example 2: a joke chain showing `stream`\n4. [▶ 11:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=698) a tour of the official “with / without LCEL” code comparison\n5. [▶ 14:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=858) example 3: a RAG chain\n6. [▶ 16:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=983) optional: a “factory” with `configurable_alternatives`, and which design pattern LCEL resembles\n7. [▶ 25:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1514) storing and loading chat history per session_id with `RunnableWithMessageHistory`\n8. [▶ 30:28](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1828) a quick mention of other features\n\nThe video uses OpenAI models (the optional part mentions GPT-4o mini, with Baidu's ERNIE Bot as the alternative); this lesson uses DeepSeek instead (`deepseek-flash` from `practice/llm.py`), and the example texts are our own."
    },
    {
      "t": "h",
      "zh": "二、例子一：语义解析链（提示词 → 模型 → 解析）",
      "en": "2. Example 1: a semantic-parsing chain (prompt → model → parser)"
    },
    {
      "t": "p",
      "zh": "[▶ 04:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=281) 和大模型打交道的程序，最常见的流水线是：拿到一个输入 → **填进提示词模板** → **调用模型** → 用**输出解析器**把结果整理好。这就是一条 A → B → C 的既定工作流。\n\n[▶ 05:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=343) 视频的第一个例子沿用了讲师以前讲过的「运营商客服」场景：用户说一句话，要把它解析成**结构化的查询条件**——流量包名称、价格上下限、流量上下限、按什么排序——后面的程序再拿这些条件去查数据库。[▶ 06:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=374) 先定义输出的结构，再写一个多轮消息的提示词模板（system 里告诉模型：你现在只是语义解析器，把用户的话解析成 JSON，不要回答问题），最后准备好模型：",
      "en": "[▶ 04:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=281) The most common pipeline in an LLM program: take an input → **fill it into a prompt template** → **call the model** → tidy the result with an **output parser**. That's a fixed A → B → C workflow.\n\n[▶ 05:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=343) The video's first example reuses the instructor's earlier “telecom customer service” scenario: turn what a user says into **structured query conditions** – plan name, price range, data range, sort order – that the rest of the program can use to query a database. [▶ 06:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=374) First define the output structure, then a multi-message prompt template (the system message says: you are only a semantic parser – turn the user's words into JSON and don't answer the question), and finally the model:"
    },
    {
      "t": "code",
      "file": "semantic_parse.py",
      "code": {
        "zh": "from typing import Literal, Optional\n\nfrom langchain_core.prompts import ChatPromptTemplate\nfrom langchain_core.runnables import RunnablePassthrough\nfrom langchain_deepseek import ChatDeepSeek\nfrom pydantic import BaseModel, Field\nfrom llm import API_KEY, MODEL\n\n# 输出的结构：流量套餐的查询条件\nclass Semantics(BaseModel):\n    \"\"\"从用户的话里解析出的流量套餐查询条件\"\"\"\n    name: Optional[str] = Field(default=None, description=\"流量包名称\")\n    price_lower: Optional[int] = Field(default=None, description=\"价格下限，单位：元/月\")\n    price_upper: Optional[int] = Field(default=None, description=\"价格上限，单位：元/月\")\n    data_lower: Optional[int] = Field(default=None, description=\"流量下限，单位：GB/月\")\n    data_upper: Optional[int] = Field(default=None, description=\"流量上限，单位：GB/月\")\n    sort_by: Optional[Literal[\"price\", \"data\"]] = Field(default=None, description=\"按价格还是按流量排序\")\n    ordering: Optional[Literal[\"ascend\", \"descend\"]] = Field(default=None, description=\"升序还是降序\")\n\n# 提示词模板：system 让模型只做解析，不回答问题\nprompt = ChatPromptTemplate.from_messages([\n    (\"system\", \"你是一个语义解析器：把用户的话解析成 JSON 格式的查询条件。不要回答用户的问题。\"),\n    (\"human\", \"{text}\"),\n])\n\n# 模型：解析用的模型要关掉思考模式（原因见下面的「注意」）\nparse_model = ChatDeepSeek(model=MODEL, api_key=API_KEY, extra_body={\"thinking\": {\"type\": \"disabled\"}})\n\n# 用 | 串起来：A 占位 → B 填提示词 → C 模型按 Semantics 的结构输出\nchain = {\"text\": RunnablePassthrough()} | prompt | parse_model.with_structured_output(Semantics)\n\nquery = chain.invoke(\"不超过 100 元的流量大的套餐有哪些？\")\nprint(query.model_dump())\n# {'name': None, 'price_lower': None, 'price_upper': 100, 'data_lower': None,\n#  'data_upper': None, 'sort_by': 'data', 'ordering': 'descend'}",
        "en": "from typing import Literal, Optional\n\nfrom langchain_core.prompts import ChatPromptTemplate\nfrom langchain_core.runnables import RunnablePassthrough\nfrom langchain_deepseek import ChatDeepSeek\nfrom pydantic import BaseModel, Field\nfrom llm import API_KEY, MODEL\n\n# The output structure: query conditions for a mobile data plan\nclass Semantics(BaseModel):\n    \"\"\"Data-plan query conditions parsed from what the user said\"\"\"\n    name: Optional[str] = Field(default=None, description=\"plan name\")\n    price_lower: Optional[int] = Field(default=None, description=\"minimum price, yuan per month\")\n    price_upper: Optional[int] = Field(default=None, description=\"maximum price, yuan per month\")\n    data_lower: Optional[int] = Field(default=None, description=\"minimum data, GB per month\")\n    data_upper: Optional[int] = Field(default=None, description=\"maximum data, GB per month\")\n    sort_by: Optional[Literal[\"price\", \"data\"]] = Field(default=None, description=\"sort by price or by data\")\n    ordering: Optional[Literal[\"ascend\", \"descend\"]] = Field(default=None, description=\"ascending or descending\")\n\n# The prompt template: the system message says \"parse only, don't answer\"\nprompt = ChatPromptTemplate.from_messages([\n    (\"system\", \"You are a semantic parser: turn what the user says into query conditions as JSON. Do not answer the question.\"),\n    (\"human\", \"{text}\"),\n])\n\n# The model: the parsing model needs thinking switched off (see \"Watch out\" below)\nparse_model = ChatDeepSeek(model=MODEL, api_key=API_KEY, extra_body={\"thinking\": {\"type\": \"disabled\"}})\n\n# Join with |: A placeholder -> B fill the prompt -> C model answers in the shape of Semantics\nchain = {\"text\": RunnablePassthrough()} | prompt | parse_model.with_structured_output(Semantics)\n\nquery = chain.invoke(\"Which plans cost no more than 100 yuan and have lots of data?\")\nprint(query.model_dump())\n# {'name': None, 'price_lower': None, 'price_upper': 100, 'data_lower': None,\n#  'data_upper': None, 'sort_by': 'data', 'ordering': 'descend'}"
      },
      "note": {
        "zh": "注释里的结果来自 `practice/l48_lcel_basics.py` 的一次实际运行：「不超过 100 元」→ `price_upper=100`，「流量大的」→ 按流量（`data`）降序排列，和视频里的解析结果一致。`Optional[int]` 的意思是「可以是 int，也可以是 None」：用户没提到的条件就留空（默认值 `None`）。排序字段用 `Literal`（第 28 节）限定取值，`BaseModel` 和 `Field(description=...)` 见第 12 节，`with_structured_output` 见第 45 节。",
        "en": "The result in the comment is from a real run of `practice/l48_lcel_basics.py`: “no more than 100 yuan” → `price_upper=100`, “lots of data” → sort by data (`data`), descending – the same parse as in the video. `Optional[int]` means “an int, or None”: conditions the user didn't mention stay empty (default `None`). The sort fields use `Literal` (lesson 28) to restrict their values; for `BaseModel` and `Field(description=...)` see lesson 12, and for `with_structured_output` lesson 45."
      }
    },
    {
      "t": "p",
      "zh": "[▶ 07:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=438) 关键是这一行：`chain = {\"text\": RunnablePassthrough()} | prompt | 模型`。LCEL 的语法很简单——**A 的输出交给 B，就在 A 和 B 之间写一条竖线 `|`**。这条链分三段：\n- **A**：`{\"text\": RunnablePassthrough()}`——[▶ 07:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=470) 一个占位符，自己什么也不做。不管输入什么，`RunnablePassthrough()` 都原样交出去，放进字典的 `text` 这个位置\n- **B**：提示词模板拿到这个字典，发现 `{text}` 是自己的槽，就把它填上，交出一份完整的提示词\n- **C**：模型按 `Semantics` 的结构回答，最后得到一个 `Semantics` 对象\n\n[▶ 09:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=563) 调用 `chain.invoke(\"不超过 100 元的流量大的套餐有哪些？\")`，一句话经过这一串调用，就变成了上面那个结构化的对象。",
      "en": "[▶ 07:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=438) The key line is `chain = {\"text\": RunnablePassthrough()} | prompt | model`. LCEL's syntax is simple – **when A's output goes to B, put a vertical bar `|` between A and B**. This chain has three parts:\n- **A**: `{\"text\": RunnablePassthrough()}` – [▶ 07:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=470) a placeholder that does nothing itself. Whatever comes in, `RunnablePassthrough()` hands it on unchanged, under the dict key `text`\n- **B**: the prompt template gets that dict, sees `{text}` is its slot, fills it and hands on a complete prompt\n- **C**: the model answers in the shape of `Semantics`, so the result is a `Semantics` object\n\n[▶ 09:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=563) Call `chain.invoke(\"Which plans cost no more than 100 yuan and have lots of data?\")` and the sentence passes through the whole sequence, coming out as the structured object above."
    },
    {
      "t": "warn",
      "zh": "`with_structured_output` 默认靠「强制模型调用一个工具」来实现，而 `deepseek-flash` 默认开着思考模式，思考模式不接受这种强制，会报 400：`Thinking mode does not support this tool_choice`。解决办法（和第 45 节一样）：解析用的模型加上 `extra_body={\"thinking\": {\"type\": \"disabled\"}}` 关掉思考。视频用的 OpenAI 模型没有这个问题。",
      "en": "`with_structured_output` works by forcing the model to call a tool, but `deepseek-flash` thinks by default and thinking mode refuses that, returning a 400: `Thinking mode does not support this tool_choice`. The fix (as in lesson 45): give the parsing model `extra_body={\"thinking\": {\"type\": \"disabled\"}}` to switch thinking off. The OpenAI model in the video doesn't have this problem."
    },
    {
      "t": "tip",
      "zh": "提示词只有一个占位符时，其实也可以不要 A，直接 `prompt | 模型` 再 `chain.invoke(\"一句话\")`，LangChain 会把字符串填进唯一的那个槽。但写成 `{\"text\": RunnablePassthrough()} | prompt` 更清楚，也是视频的写法；占位符多于一个时（比如后面的 RAG），就必须用字典了。",
      "en": "With a single placeholder you could drop A, write `prompt | model` and call `chain.invoke(\"a sentence\")` – LangChain fills the only slot with the string. Writing `{\"text\": RunnablePassthrough()} | prompt` is clearer and matches the video; with more than one placeholder (like the RAG chain later) a dict is required."
    },
    {
      "t": "check",
      "q": {
        "zh": "链的第一段 `{\"text\": RunnablePassthrough()}` 收到「不超过 100 元的流量大的套餐有哪些？」后，交给提示词模板的是什么？",
        "en": "The chain's first part, `{\"text\": RunnablePassthrough()}`, receives “Which plans cost no more than 100 yuan and have lots of data?”. What does it hand to the prompt template?"
      },
      "options": [
        {
          "zh": "原样的字符串",
          "en": "The string itself"
        },
        {
          "zh": "字典 `{\"text\": \"不超过 100 元的流量大的套餐有哪些？\"}`",
          "en": "The dict `{\"text\": \"Which plans cost no more than 100 yuan and have lots of data?\"}`"
        },
        {
          "zh": "已经填好的提示词",
          "en": "An already filled-in prompt"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "`RunnablePassthrough()` 原样传递，字典把结果放到 `text` 键下，正好对上提示词模板的 `{text}` 槽。",
        "en": "`RunnablePassthrough()` passes the input on unchanged and the dict puts it under the key `text` – exactly the template's `{text}` slot."
      }
    },
    {
      "t": "py",
      "title": {
        "zh": "为什么 | 能把对象串起来：运算符重载 __or__",
        "en": "Why | can join objects: overloading __or__"
      },
      "zh": "在 Python 里，`a | b` 其实是在调用 `a.__or__(b)`。名字前后各有两个下划线的方法叫**特殊方法**，Python 遇到运算符时会去调用它们：`+` 对应 `__add__`，`|` 对应 `__or__`。所以**同一个运算符，在不同的类里可以有不同的意思**——对整数是「按位或」，对集合是「并集」，而 LangChain 的组件把它定义成「把两步串成一条链」。\n\n下面用不到 20 行写一个自己的「链」：`__or__` 返回一个新的 `Step`，它先运行左边，再把结果交给右边。用到的 `class`、`__init__`、`self` 回顾 08 节，`lambda` 回顾 29 节，「每个组件都有 `invoke`」的思路回顾 44 节。",
      "en": "In Python, `a | b` actually calls `a.__or__(b)`. Methods with two underscores on each side are **special methods** that Python calls for operators: `+` is `__add__`, `|` is `__or__`. So **the same operator can mean different things in different classes** – bitwise OR for ints, union for sets, and for LangChain components, “join two steps into a chain”.\n\nBelow is a home-made “chain” in under 20 lines: `__or__` returns a new `Step` that runs the left side, then hands the result to the right side. For `class`, `__init__` and `self` see lesson 08; for `lambda`, lesson 29; for “every component has `invoke`”, lesson 44.",
      "code": {
        "zh": "class Step:\n    def __init__(self, name, func):\n        self.name = name\n        self.func = func\n\n    def invoke(self, x):\n        return self.func(x)\n\n    def __or__(self, other):                    # 写 a | b 时，Python 实际执行 a.__or__(b)\n        def run_both(x):\n            return other.invoke(self.invoke(x))  # 先跑自己，再把结果交给 other\n        return Step(self.name + \" | \" + other.name, run_both)\n\nfill = Step(\"fill\", lambda topic: f\"讲个关于{topic}的笑话\")\nfake_model = Step(\"model\", lambda prompt: f\"<回答：{prompt}>\")\nshout = Step(\"upper\", lambda text: text.upper())\n\nchain = fill | fake_model | shout       # 等于 (fill.__or__(fake_model)).__or__(shout)\nprint(chain.name)\nprint(chain.invoke(\"lcel\"))\n\nprint(6 | 3)              # 对整数：按位或 → 7\nprint({1, 2} | {2, 3})    # 对集合：并集 → {1, 2, 3}",
        "en": "class Step:\n    def __init__(self, name, func):\n        self.name = name\n        self.func = func\n\n    def invoke(self, x):\n        return self.func(x)\n\n    def __or__(self, other):                    # for a | b, Python actually runs a.__or__(b)\n        def run_both(x):\n            return other.invoke(self.invoke(x))  # run self first, then hand the result to other\n        return Step(self.name + \" | \" + other.name, run_both)\n\nfill = Step(\"fill\", lambda topic: f\"Tell a joke about {topic}\")\nfake_model = Step(\"model\", lambda prompt: f\"<answer to: {prompt}>\")\nshout = Step(\"upper\", lambda text: text.upper())\n\nchain = fill | fake_model | shout       # same as (fill.__or__(fake_model)).__or__(shout)\nprint(chain.name)\nprint(chain.invoke(\"lcel\"))\n\nprint(6 | 3)              # for ints: bitwise OR -> 7\nprint({1, 2} | {2, 3})    # for sets: union -> {1, 2, 3}"
      },
      "note": {
        "zh": "`a | b | c` 从左往右算：先得到 `a | b` 这个新对象，再和 `c` 组合。LangChain 里 `a | b` 返回的是 `RunnableSequence`。如果左边是字典或普通函数（它们没有为 Runnable 定义 `|`），Python 会接着去调用右边对象的 `__ror__`（反向版本），所以 `{\"text\": ...} | prompt` 也能工作。但两边都不是 Runnable 时就会报 `TypeError`。",
        "en": "`a | b | c` is evaluated left to right: first `a | b` becomes a new object, which is then combined with `c`. In LangChain `a | b` returns a `RunnableSequence`. If the left side is a dict or a plain function (which don't define `|` for Runnables), Python then tries the right side's `__ror__` (the reflected version) – that's why `{\"text\": ...} | prompt` works. With no Runnable on either side you get a `TypeError`."
      }
    },
    {
      "t": "p",
      "zh": "再进一步，把「模型」换成真正调用接口的函数，就是一个迷你版的 LCEL。下面这段可以在网页里点 ▶ 运行（连接的是课程的模拟模型）：",
      "en": "One step further: make the “model” a function that really calls the API, and you have a mini LCEL. Press ▶ Run below (it talks to the course's mock model):"
    },
    {
      "t": "code",
      "file": "mini_lcel.py",
      "code": {
        "zh": "from llm import client, MODEL\n\nclass Runnable:\n    def __init__(self, func):\n        self.func = func\n\n    def invoke(self, x):\n        return self.func(x)\n\n    def batch(self, xs):\n        return [self.invoke(x) for x in xs]      # 真正的 LCEL 会并发执行，这里简单地一个个跑\n\n    def __or__(self, other):\n        return Runnable(lambda x: other.invoke(self.invoke(x)))\n\n# 三个「组件」：提示词模板、模型、输出解析器\nprompt = Runnable(lambda topic: [{\"role\": \"user\", \"content\": f\"讲个关于{topic}的笑话\"}])\nmodel = Runnable(lambda messages: client.chat.completions.create(model=MODEL, messages=messages).choices[0].message)\nparser = Runnable(lambda message: message.content)\n\nchain = prompt | model | parser\nprint(chain.invoke(\"小明\"))\nprint(chain.batch([\"程序员\", \"猫\"]))",
        "en": "from llm import client, MODEL\n\nclass Runnable:\n    def __init__(self, func):\n        self.func = func\n\n    def invoke(self, x):\n        return self.func(x)\n\n    def batch(self, xs):\n        return [self.invoke(x) for x in xs]      # real LCEL runs these concurrently; here one by one\n\n    def __or__(self, other):\n        return Runnable(lambda x: other.invoke(self.invoke(x)))\n\n# three \"components\": prompt template, model, output parser\nprompt = Runnable(lambda topic: [{\"role\": \"user\", \"content\": f\"Tell a joke about {topic}\"}])\nmodel = Runnable(lambda messages: client.chat.completions.create(model=MODEL, messages=messages).choices[0].message)\nparser = Runnable(lambda message: message.content)\n\nchain = prompt | model | parser\nprint(chain.invoke(\"Xiaoming\"))\nprint(chain.batch([\"programmers\", \"cats\"]))"
      },
      "run": "mock",
      "note": {
        "zh": "LangChain 的 Runnable 本质上就是这样：每个组件都有统一的 `invoke`，`|` 把它们首尾相接。区别在于真正的实现还处理了流式、并发、异步、回调等细节。",
        "en": "That's essentially what a LangChain Runnable is: every component shares `invoke`, and `|` joins them end to end. The real implementation also handles streaming, concurrency, async, callbacks and more."
      }
    },
    {
      "t": "h",
      "zh": "三、例子二：流式输出",
      "en": "3. Example 2: streaming"
    },
    {
      "t": "p",
      "zh": "[▶ 09:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=593) 讲师接着演示「流式调用」。结构化的结果不方便看流式效果，所以换成一个输出自然语言的链：讲一个关于某个主题的笑话。\n- 开头还是占位符 `{\"topic\": RunnablePassthrough()}`，输入什么就填进 `topic` 槽\n- 最后接一个 `StrOutputParser()`。讲师说它「没什么实际作用」：只是把模型吐出的每一小段原样变成字符串交出来\n\n[▶ 10:57](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=657) 刚才用的是 `invoke`，现在把它换成 `stream`，就能看到一段一段蹦出来的输出：",
      "en": "[▶ 09:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=593) The instructor then shows streaming. A structured result is awkward to watch stream, so he switches to a chain with natural-language output: tell a joke about some topic.\n- It still starts with the placeholder `{\"topic\": RunnablePassthrough()}`; whatever comes in fills the `topic` slot\n- It ends with a `StrOutputParser()`. The instructor says it “does nothing much”: it just passes each piece the model produces on as a string\n\n[▶ 10:57](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=657) Earlier we used `invoke`; swap it for `stream` and you see the output arrive piece by piece:"
    },
    {
      "t": "code",
      "file": "joke_stream.py",
      "code": {
        "zh": "from langchain_core.output_parsers import StrOutputParser\nfrom langchain_core.prompts import ChatPromptTemplate\nfrom langchain_core.runnables import RunnablePassthrough\nfrom langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\njoke_prompt = ChatPromptTemplate.from_template(\"讲一个关于{topic}的笑话，不超过三句话。\")\n\njoke_chain = {\"topic\": RunnablePassthrough()} | joke_prompt | model | StrOutputParser()\n\n# 把 invoke 换成 stream：边生成边返回，每次拿到一小段字符串\nfor piece in joke_chain.stream(\"小明\"):\n    print(piece, end=\"\", flush=True)\nprint()",
        "en": "from langchain_core.output_parsers import StrOutputParser\nfrom langchain_core.prompts import ChatPromptTemplate\nfrom langchain_core.runnables import RunnablePassthrough\nfrom langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\njoke_prompt = ChatPromptTemplate.from_template(\"Tell a joke about {topic} in at most three sentences.\")\n\njoke_chain = {\"topic\": RunnablePassthrough()} | joke_prompt | model | StrOutputParser()\n\n# Swap invoke for stream: pieces arrive while being generated, a little text at a time\nfor piece in joke_chain.stream(\"Xiaoming\"):\n    print(piece, end=\"\", flush=True)\nprint()"
      },
      "note": {
        "zh": "`print(..., end=\"\", flush=True)` 见第 09 节：不换行、立刻显示，才能看到一个字一个字蹦出来的效果。`deepseek-flash` 默认先「思考」一会儿，这段时间收到的是空字符串，所以开头会停顿一下，然后文字才出来。",
        "en": "`print(..., end=\"\", flush=True)` is from lesson 09: no newline and show immediately, so you see the text appear bit by bit. `deepseek-flash` “thinks” first by default and the pieces during that time are empty strings, so there's a pause before the text starts."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "在 `{\"topic\": RunnablePassthrough()} | joke_prompt | model | StrOutputParser()` 里，`StrOutputParser()` 收到的是什么？",
        "en": "In `{\"topic\": RunnablePassthrough()} | joke_prompt | model | StrOutputParser()`, what does `StrOutputParser()` receive?"
      },
      "options": [
        {
          "zh": "用户传进来的字符串",
          "en": "The string the user passed in"
        },
        {
          "zh": "模型返回的 `AIMessage`（流式时是一小段一小段的消息）",
          "en": "The model's `AIMessage` (small message chunks when streaming)"
        },
        {
          "zh": "填好的提示词",
          "en": "The filled-in prompt"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "每一步只拿到前一步的输出：parser 前面是 model，所以收到 `AIMessage`，再把它变成字符串。",
        "en": "Each step receives only the previous step's output: the parser follows the model, so it gets an `AIMessage` and turns it into a string."
      }
    },
    {
      "t": "h",
      "zh": "四、为什么要这样写：官方的「用 / 不用 LCEL」对比",
      "en": "4. Why write it this way: the official “with / without LCEL” comparison"
    },
    {
      "t": "p",
      "zh": "[▶ 11:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=698) 讲师说，`|` 的写法好理解，难理解的是「为什么要这么写」——我自己让 A 调 B、B 调 C 不行吗？官方文档专门给了一组对比，展示各种情况下用和不用 LCEL 各要写多少代码。先看最简单的单次调用：",
      "en": "[▶ 11:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=698) The instructor says the `|` syntax is easy; the hard part is “why write it this way” – can't I just have A call B and B call C myself? The official docs give a set of comparisons showing how much code each situation takes with and without LCEL. First, the simplest case, a single call:"
    },
    {
      "t": "code",
      "file": "manual_vs_lcel.py",
      "code": {
        "zh": "# 接着上面的 joke_prompt、model、joke_chain\n\n# 不用 LCEL：自己把上一步的结果递给下一步（第 45 节的写法）\nprompt_value = joke_prompt.invoke({\"topic\": \"小明\"})   # 填好的提示词（里面是消息列表）\nmessage = model.invoke(prompt_value)                  # AIMessage\ntext = StrOutputParser().invoke(message)              # str\n\n# 用 LCEL：只声明「谁的输出交给谁」，调用一次就走完全程\ntext = joke_chain.invoke(\"小明\")",
        "en": "# Continues with joke_prompt, model and joke_chain from above\n\n# Without LCEL: hand each result to the next step yourself (as in lesson 45)\nprompt_value = joke_prompt.invoke({\"topic\": \"Xiaoming\"})   # the filled-in prompt (holding messages)\nmessage = model.invoke(prompt_value)                      # AIMessage\ntext = StrOutputParser().invoke(message)                  # str\n\n# With LCEL: just declare \"whose output goes where\" - one call runs the whole way\ntext = joke_chain.invoke(\"Xiaoming\")"
      }
    },
    {
      "t": "p",
      "zh": "[▶ 12:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=729) 单次调用只是稍微短了一点。差别在后面这些需求上（视频浏览了对比，结论可以总结成这张表）：\n\n| 想要的功能 | 不用 LCEL | 用 LCEL |\n|---|---|---|\n| 流式输出 | 自己处理每个数据块、拼接、解析 | `chain.stream(x)`，一行搞定 |\n| 批量（同一个模板填几个不同的值） | 自己写线程池做并发 | `chain.batch([...])`，后台自动并发 |\n| 异步 | 每个函数再写一个 async 版本 | `await chain.ainvoke(x)` |\n| 换一个模型 | 改所有调用的地方 | 只换链里的那一个组件 |\n| 失败重试 / 换备用模型 | 自己写循环和 `try/except` | `with_retry(...)` / `with_fallbacks([...])` |\n| 记录每一步（打日志） | 到处加 `print` | 回调、LangSmith 自动记录 |\n\n[▶ 13:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=824) 这就是 LCEL 的核心价值：**流程定义一次，想要什么能力就换一个调用方法**，这些功能不用自己写。",
      "en": "[▶ 12:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=729) A single call is only a little shorter. The difference shows up in the needs below (the video tours the comparison; the conclusions fit in this table):\n\n| Feature | Without LCEL | With LCEL |\n|---|---|---|\n| Streaming | Handle every chunk, join and parse yourself | `chain.stream(x)` – one line |\n| Batch (one template, several values) | Write your own thread pool for concurrency | `chain.batch([...])` – concurrent automatically |\n| Async | Write an async twin of every function | `await chain.ainvoke(x)` |\n| Switch models | Edit every call site | Swap one component in the chain |\n| Retries / backup model | Your own loop and `try/except` | `with_retry(...)` / `with_fallbacks([...])` |\n| Record every step (logging) | `print` everywhere | Callbacks, LangSmith record it automatically |\n\n[▶ 13:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=824) That's LCEL's core value: **define the flow once, then pick a call method for the capability you want** – none of these features need writing yourself."
    },
    {
      "t": "code",
      "file": "batch_async.py",
      "code": {
        "zh": "import asyncio\n\n# batch：一批输入，后台同时发出请求，结果按输入顺序返回——不用自己写线程池\njokes = joke_chain.batch([\"程序员\", \"猫\"], config={\"max_concurrency\": 2})\nfor j in jokes:\n    print(j)\n\n# 异步：同一条链直接有 ainvoke / astream / abatch（async / await 回顾第 09 节）\nasync def main():\n    text = await joke_chain.ainvoke(\"小明\")\n    print(text)\n\nasyncio.run(main())",
        "en": "import asyncio\n\n# batch: many inputs, requests sent at the same time, results in input order - no thread pool to write\njokes = joke_chain.batch([\"programmers\", \"cats\"], config={\"max_concurrency\": 2})\nfor j in jokes:\n    print(j)\n\n# async: the same chain already has ainvoke / astream / abatch (async / await: see lesson 09)\nasync def main():\n    text = await joke_chain.ainvoke(\"Xiaoming\")\n    print(text)\n\nasyncio.run(main())"
      },
      "note": {
        "zh": "`batch` 的结果顺序和输入顺序一致；`config={\"max_concurrency\": 2}` 限制最多同时跑几个请求。",
        "en": "`batch` returns results in input order; `config={\"max_concurrency\": 2}` limits how many requests run at once."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "`chain.batch([\"a\", \"b\", \"c\"])` 会怎样执行？",
        "en": "How does `chain.batch([\"a\", \"b\", \"c\"])` run?"
      },
      "options": [
        {
          "zh": "只处理第一个输入",
          "en": "Only the first input is processed"
        },
        {
          "zh": "把三个输入拼成一个字符串再调用一次",
          "en": "The inputs are joined into one string for a single call"
        },
        {
          "zh": "三个输入同时（并发）执行，返回 3 个结果组成的列表，顺序和输入一致",
          "en": "The three run at the same time (concurrently) and return a list of 3 results in input order"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "`batch` 在后台并发执行，不用自己写线程池；可以用 `config={\"max_concurrency\": 2}` 限制同时运行的数量。",
        "en": "`batch` runs concurrently in the background – no thread pool to write; `config={\"max_concurrency\": 2}` limits how many run at once."
      }
    },
    {
      "t": "h",
      "zh": "五、例子三：RAG 链",
      "en": "5. Example 3: a RAG chain"
    },
    {
      "t": "p",
      "zh": "[▶ 14:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=858) 前面只是「拿一个值填提示词再调模型」，稍微复杂一点：用 LCEL 串一个 RAG 流程。讲师说，RAG 的前置处理（加载、切分、灌库）还是照旧在链外面做好——我们直接复用第 46 节的 `build_retriever`；**每次用户提问时**和模型实时交互的那一段，才用 LCEL 串起来。\n\n[▶ 14:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=890) 提示词是一个最简短的 RAG 模板：根据给的上下文回答问题，两个槽 `context` 和 `question`。用户的问题进来后兵分两路：一路原样填进 `question`；[▶ 15:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=921) 同时这个问题也交给检索器，检索器的 `invoke` 返回 2 段资料，填进 `context`。两个槽都填好，就成了完整的提示词，交给模型，生成的就是 RAG 的回答：",
      "en": "[▶ 14:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=858) So far we've only “filled one value into a prompt and called the model”. A bit more complex: a RAG flow in LCEL. The instructor says RAG's preparation (load, split, store) is still done outside the chain as before – we reuse `build_retriever` from lesson 46; only the part that talks to the model live, **for every question**, is strung together with LCEL.\n\n[▶ 14:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=890) The prompt is a minimal RAG template: answer from the given context, with two slots, `context` and `question`. The user's question splits in two: one copy fills `question` unchanged; [▶ 15:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=921) at the same time the question goes to the retriever, whose `invoke` returns 2 chunks for `context`. With both slots filled, the complete prompt goes to the model, and what it generates is the RAG answer:"
    },
    {
      "t": "code",
      "file": "flow",
      "lang": "text",
      "code": {
        "zh": "\"青松模型有多少参数？\"\n   ├─ retriever | format_docs ──→ context ：检索到的 2 段资料（文字）\n   └─ RunnablePassthrough() ───→ question：原来的问题\n               ↓  {\"context\": ..., \"question\": ...}\n           prompt → model → StrOutputParser() → 回答",
        "en": "\"How many parameters does Qingsong have?\"\n   ├─ retriever | format_docs ──→ context : the 2 retrieved chunks (text)\n   └─ RunnablePassthrough() ───→ question: the original question\n               ↓  {\"context\": ..., \"question\": ...}\n           prompt → model → StrOutputParser() → answer"
      }
    },
    {
      "t": "code",
      "file": "rag_chain.py",
      "code": {
        "zh": "from langchain_core.output_parsers import StrOutputParser\nfrom langchain_core.prompts import ChatPromptTemplate\nfrom langchain_core.runnables import RunnablePassthrough\nfrom langchain_deepseek import ChatDeepSeek\n\nfrom l46_retriever_solution import build_retriever     # 第 46 节：加载 → 切分 → 向量化 → 灌进 FAISS\nfrom llm import API_KEY, MODEL\n\nretriever = build_retriever(k=2)                       # 和视频一样，每次取回 2 段\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\nprompt = ChatPromptTemplate.from_template(\n    \"只根据下面的资料回答问题。资料里没有的，就回答「资料里没有提到」。\\n\\n\"\n    \"资料：\\n{context}\\n\\n\"\n    \"问题：{question}\"\n)\n\ndef format_docs(docs):\n    return \"\\n\\n\".join([d.page_content for d in docs])    # Document 列表 → 一段文字\n\nrag_chain = (\n    {\"context\": retriever | format_docs, \"question\": RunnablePassthrough()}\n    | prompt\n    | model\n    | StrOutputParser()\n)\n\nprint(rag_chain.invoke(\"青松模型有多少参数？\"))\n# 例如：青松模型有三个尺寸，参数量分别约为 30 亿（3B）、140 亿（14B）和 720 亿（72B）。",
        "en": "from langchain_core.output_parsers import StrOutputParser\nfrom langchain_core.prompts import ChatPromptTemplate\nfrom langchain_core.runnables import RunnablePassthrough\nfrom langchain_deepseek import ChatDeepSeek\n\nfrom l46_retriever_solution import build_retriever     # lesson 46: load -> split -> embed -> store in FAISS\nfrom llm import API_KEY, MODEL\n\nretriever = build_retriever(k=2)                       # 2 chunks per question, as in the video\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\nprompt = ChatPromptTemplate.from_template(\n    \"Answer only from the material below. If it isn't in the material, reply “The material doesn't mention it.”\\n\\n\"\n    \"Material:\\n{context}\\n\\n\"\n    \"Question: {question}\"\n)\n\ndef format_docs(docs):\n    return \"\\n\\n\".join([d.page_content for d in docs])    # list of Documents -> one string\n\nrag_chain = (\n    {\"context\": retriever | format_docs, \"question\": RunnablePassthrough()}\n    | prompt\n    | model\n    | StrOutputParser()\n)\n\nprint(rag_chain.invoke(\"青松模型有多少参数？\"))\n# e.g. Qingsong comes in three sizes: about 3 billion (3B), 14 billion (14B)\n# and 72 billion (72B) parameters.   (the real reply is in Chinese)"
      },
      "note": {
        "zh": "资料里的数字是编的，模型答对了，说明它确实用了检索到的资料。`practice/l48_rag_chain_solution.py` 用 `rag_chain.stream(...)` 流式打印同一个回答。",
        "en": "The report's numbers are made up, so a correct answer shows the model really used the retrieved material. `practice/l48_rag_chain_solution.py` streams the same answer with `rag_chain.stream(...)`."
      }
    },
    {
      "t": "video",
      "zh": "视频里检索器是直接接在 `context` 上的（`\"context\": retriever`），这样填进提示词的是整个 `Document` 列表的文字形式，类似 `[Document(id='…', metadata={'source': …}, page_content='## 二、模型规模…')]`，带着一层「外壳」，模型一般也能看懂。这里多加一步 `format_docs`，只把 `page_content` 拼起来，提示词更干净、也更省 token。",
      "en": "In the video the retriever is plugged straight into `context` (`\"context\": retriever`), so the prompt receives the whole `Document` list as text, something like `[Document(id='…', metadata={'source': …}, page_content='## 二、模型规模…')]` – wrapped, but the model usually copes. Here an extra `format_docs` joins just the `page_content`, giving a cleaner, cheaper prompt."
    },
    {
      "t": "note",
      "zh": "补充：这条链里藏着 LCEL 的三条小规则，视频没有展开，但看懂它们才能自己写链：\n- **字典写在链里会自动变成 `RunnableParallel`**：同一个输入同时交给字典里的每个值，结果按键收成一个新字典\n- **`RunnablePassthrough()`** 原样传递输入，常用来把「原问题」带到下一步\n- **普通函数**（比如 `format_docs`）和 Runnable 用 `|` 连在一起时，会被自动包成 `RunnableLambda`。`|` 的两边至少要有一个是 Runnable",
      "en": "Extra: this chain hides three small LCEL rules. The video doesn't spell them out, but you need them to write your own chains:\n- **A dict inside a chain becomes a `RunnableParallel` automatically**: the same input goes to every value in the dict, and the results are collected under the same keys\n- **`RunnablePassthrough()`** passes its input on unchanged – handy for carrying the original question forward\n- **A plain function** (like `format_docs`) joined to a Runnable with `|` is wrapped as a `RunnableLambda` automatically. At least one side of `|` must be a Runnable"
    },
    {
      "t": "p",
      "zh": "[▶ 15:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=952) 这样串起来的好处和前面一样：整条 RAG 流程也能直接流式、异步、批量调用，甚至可以用 LangServe 直接部署上线（第 50 节）。",
      "en": "[▶ 15:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=952) Stringing it together pays off as before: the whole RAG flow can stream, run async or in batches, and can even be deployed as is with LangServe (lesson 50)."
    },
    {
      "t": "check",
      "q": {
        "zh": "`{\"context\": retriever | format_docs, \"question\": RunnablePassthrough()}` 收到输入「青松有多少参数？」后，交出什么？",
        "en": "Given “How many parameters does Qingsong have?”, what does `{\"context\": retriever | format_docs, \"question\": RunnablePassthrough()}` hand on?"
      },
      "options": [
        {
          "zh": "一个字典：`context` 是检索并拼好的资料文字，`question` 是原来的问题",
          "en": "A dict: `context` is the retrieved, formatted text and `question` is the original question"
        },
        {
          "zh": "只有检索到的 Document 列表",
          "en": "Only the list of retrieved Documents"
        },
        {
          "zh": "模型的回答",
          "en": "The model's answer"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "字典里的每个值都收到同一个输入：一路去检索，一路原样传递，最后按键收成一个字典，正好填提示词的两个槽。",
        "en": "Every value in the dict receives the same input: one branch retrieves, the other passes it through, and the results are collected by key – exactly the two slots the prompt needs."
      }
    },
    {
      "t": "h",
      "zh": "六、（选修）用 configurable_alternatives 实现「工厂」",
      "en": "6. (Optional) A “factory” with configurable_alternatives"
    },
    {
      "t": "p",
      "zh": "[▶ 16:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=983) 视频把这一段标成了选修，讲师说刚接触编程的同学可以先跳过。\n\n[▶ 16:57](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1017) 背景是「工厂」：写程序时，几个接口一致、可以互相替换的类，上面通常会有一个工厂，传入一个名字就返回对应的对象——这样改配置就能切换，不用改代码。放到大模型应用里，最典型的可替换组件就是**模型本身**。[▶ 17:27](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1047) 讲师举的例子：一个软件给海外用户用 OpenAI 的模型，给国内用户用国产模型（比如文心一言），除了模型不同，其他逻辑完全一样。\n\n[▶ 19:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1140) LangChain 不叫它工厂，但用 `configurable_alternatives` 实现了同样的功能：\n- `ConfigurableField(id=\"llm\")`：声明一个配置项，名字叫 `llm`（自己起）\n- `default_key=\"...\"`：默认选项的名字（视频里叫 `gpt`）\n- 其余的关键字参数就是其他选项，`名字=模型`（视频里另一个选项指向文心一言的模型）；[▶ 20:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1202) 想加几个就加几个\n\n[▶ 20:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1233) 运行链的时候，用 `chain.with_config(configurable={\"llm\": \"选项名\"})` 指定这一次用哪个，再 `invoke`。[▶ 22:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1329) 这招不只能用在模型上，提示词、输出解析器也可以这样切换。",
      "en": "[▶ 16:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=983) The video marks this part optional; the instructor says programming newcomers can skip it for now.\n\n[▶ 16:57](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1017) The background is the “factory”: when several classes share an interface and can replace each other, there's usually a factory on top – pass in a name, get the matching object – so switching is a config change, not a code change. In LLM apps the most typical swappable component is **the model itself**. [▶ 17:27](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1047) The instructor's example: software that uses an OpenAI model for overseas users and a Chinese model (say, ERNIE Bot) for users in China, with all other logic identical.\n\n[▶ 19:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1140) LangChain doesn't call it a factory, but `configurable_alternatives` does the same job:\n- `ConfigurableField(id=\"llm\")`: declares a config field called `llm` (your choice)\n- `default_key=\"...\"`: the name of the default option (`gpt` in the video)\n- the remaining keyword arguments are the other options, `name=model` (in the video the other option points to the ERNIE Bot model); [▶ 20:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1202) add as many as you like\n\n[▶ 20:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1233) When running the chain, `chain.with_config(configurable={\"llm\": \"option name\"})` picks the option for this run, then you `invoke`. [▶ 22:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1329) It's not limited to models – prompts and output parsers can be switched the same way."
    },
    {
      "t": "code",
      "file": "configurable_model.py",
      "code": {
        "zh": "import os\nfrom langchain_core.prompts import ChatPromptTemplate\nfrom langchain_core.runnables import ConfigurableField, RunnablePassthrough\nfrom langchain_deepseek import ChatDeepSeek\nfrom langchain_openai import ChatOpenAI\nfrom llm import API_KEY, MODEL\n\ndef make_qwen():\n    \"\"\"只有选中 \"qwen\" 时才会被调用，所以没有百炼 key 也不影响其他选项\"\"\"\n    return ChatOpenAI(model=\"qwen-plus\", api_key=os.environ[\"DASHSCOPE_API_KEY\"],\n                      base_url=\"https://dashscope.aliyuncs.com/compatible-mode/v1\")\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY).configurable_alternatives(\n    ConfigurableField(id=\"llm\"),     # 配置项的名字叫 \"llm\"（自己起）\n    default_key=\"flash\",             # 默认选项的名字\n    pro=ChatDeepSeek(model=\"deepseek-v4-pro\", api_key=API_KEY),   # 选项 pro\n    qwen=make_qwen,                  # 选项 qwen：也可以给一个「创建模型的函数」\n)\n\nprompt = ChatPromptTemplate.from_messages([(\"human\", \"{query}\")])\nchain = {\"query\": RunnablePassthrough()} | prompt | model\n\nmsg = chain.invoke(\"请用一句话自我介绍。\")                                    # 默认：flash\nprint(msg.response_metadata[\"model_name\"], msg.content)\nmsg = chain.with_config(configurable={\"llm\": \"pro\"}).invoke(\"请用一句话自我介绍。\")   # 运行时切换\nprint(msg.response_metadata[\"model_name\"], msg.content)\n# deepseek-flash 我是DeepSeek，一个乐于为你解答问题、提供帮助的AI助手。\n# deepseek-v4-pro 你好，我是DeepSeek，一个乐于助人、知识丰富的AI助手，……",
        "en": "import os\nfrom langchain_core.prompts import ChatPromptTemplate\nfrom langchain_core.runnables import ConfigurableField, RunnablePassthrough\nfrom langchain_deepseek import ChatDeepSeek\nfrom langchain_openai import ChatOpenAI\nfrom llm import API_KEY, MODEL\n\ndef make_qwen():\n    \"\"\"Called only when \"qwen\" is selected, so a missing Bailian key doesn't affect the other options\"\"\"\n    return ChatOpenAI(model=\"qwen-plus\", api_key=os.environ[\"DASHSCOPE_API_KEY\"],\n                      base_url=\"https://dashscope.aliyuncs.com/compatible-mode/v1\")\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY).configurable_alternatives(\n    ConfigurableField(id=\"llm\"),     # the config field is called \"llm\" (your choice)\n    default_key=\"flash\",             # name of the default option\n    pro=ChatDeepSeek(model=\"deepseek-v4-pro\", api_key=API_KEY),   # option pro\n    qwen=make_qwen,                  # option qwen: a function that creates the model also works\n)\n\nprompt = ChatPromptTemplate.from_messages([(\"human\", \"{query}\")])\nchain = {\"query\": RunnablePassthrough()} | prompt | model\n\nmsg = chain.invoke(\"Introduce yourself in one sentence.\")                                    # default: flash\nprint(msg.response_metadata[\"model_name\"], msg.content)\nmsg = chain.with_config(configurable={\"llm\": \"pro\"}).invoke(\"Introduce yourself in one sentence.\")   # switch at run time\nprint(msg.response_metadata[\"model_name\"], msg.content)\n# deepseek-flash I'm DeepSeek, an AI assistant happy to answer your questions and help you out.\n# deepseek-v4-pro Hi, I'm DeepSeek, a helpful and knowledgeable AI assistant..."
      },
      "note": {
        "zh": "注释里的输出来自 `practice/l48_configurable_model.py` 的实际运行。两个都是 DeepSeek 的模型，自我介绍差不多，所以这里没接 `StrOutputParser`，而是打印 `AIMessage` 的 `response_metadata[\"model_name\"]`，确认这一次到底是哪个模型回答的。设置了百炼的 `DASHSCOPE_API_KEY` 时，练习文件还会用 `qwen` 选项再跑一次。",
        "en": "The outputs in the comments come from a real run of `practice/l48_configurable_model.py`. Both are DeepSeek models with similar self-introductions, so instead of a `StrOutputParser` we print the `AIMessage`'s `response_metadata[\"model_name\"]` to confirm which model answered. With a Bailian `DASHSCOPE_API_KEY` set, the practice file also runs the `qwen` option."
      }
    },
    {
      "t": "video",
      "zh": "[▶ 21:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1265) 视频的默认选项 `gpt` 是 OpenAI 的 GPT-4o mini，另一个选项指向百度文心一言；问的都是「请自我介绍」。切到文心一言那个选项时，回答里说自己是文心一言；切回 `gpt`，回答就不再是文心一言了（它没说自己是谁）。本课没有这两家的 key，所以换成同一个 DeepSeek key 就能用的 `deepseek-flash` / `deepseek-v4-pro`，外加一个需要百炼 key 的 `qwen` 选项——切换的写法完全一样。",
      "en": "[▶ 21:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1265) In the video the default option `gpt` is OpenAI's GPT-4o mini and the other option points to Baidu's ERNIE Bot; both are asked to introduce themselves. Switched to the ERNIE option, the answer says it is ERNIE Bot; switched back to `gpt`, it no longer does (it doesn't name itself). This lesson has no keys for those two, so it uses `deepseek-flash` / `deepseek-v4-pro`, which share one DeepSeek key, plus a `qwen` option that needs a Bailian key – the switching code is exactly the same."
    },
    {
      "t": "note",
      "zh": "[▶ 23:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1393) 视频还给有设计模式基础的同学留了一个思考题：从设计模式的角度看，LCEL 本身是什么模式？[▶ 24:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1453) 讲师排除了策略、代理、工厂、责任链，给出的答案是**建造者（Builder）模式**。他打了个比方：组装一台电脑，CPU、内存、显示器都可以换成别的型号，换了零件，得到的就是一台不同的电脑，可零件之间的协作方式始终不变。链也一样——提示词、模型、解析器（链更长时，中间任何一个组件）都能替换，最终效果会变，但组件之间的连接关系不变。",
      "en": "[▶ 23:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1393) The video also leaves a question for those who know design patterns: in design-pattern terms, what is LCEL itself? [▶ 24:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1453) The instructor rules out strategy, proxy, factory and chain of responsibility, and answers **Builder**. His analogy: assembling a PC, you can swap the CPU, memory or monitor for other models, which gives you a different machine, yet the way the parts cooperate never changes. Likewise in a chain, the prompt, model and parser (or any component of a longer chain) can be replaced; the result changes, but the connections between the components don't."
    },
    {
      "t": "check",
      "q": {
        "zh": "讲师认为 LCEL 最像哪种设计模式？",
        "en": "Which design pattern does the instructor say LCEL resembles most?"
      },
      "options": [
        {
          "zh": "工厂模式",
          "en": "Factory"
        },
        {
          "zh": "建造者（Builder）模式：组件可替换，组件之间的配合关系不变",
          "en": "Builder: components can be swapped while the way they work together stays fixed"
        },
        {
          "zh": "责任链模式",
          "en": "Chain of responsibility"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "`configurable_alternatives` 实现的是工厂的效果，但 LCEL 本身更像建造者：像组装电脑一样换零件，结构不变。",
        "en": "`configurable_alternatives` gives a factory effect, but LCEL itself is more like Builder: swap parts like assembling a PC, keep the structure."
      }
    },
    {
      "t": "h",
      "zh": "七、对话历史的存取：RunnableWithMessageHistory",
      "en": "7. Storing and loading chat history: RunnableWithMessageHistory"
    },
    {
      "t": "p",
      "zh": "[▶ 25:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1514) 第 47 节讲了历史怎么剪、怎么挑；视频最后一段讲历史怎么**存和取**。[▶ 25:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1545) 讲师强调的思路是：**对话历史（状态）和处理逻辑（链）要分开**。用户说一句话 → 从单独的存储里取出这个用户的历史 → 和这句话一起交给链 → 链跑完，再把新的一轮存回去。为了同时服务很多用户、支持多轮对话，本来就该这样设计。\n\n[▶ 26:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1607) LangChain 为此提供了 `RunnableWithMessageHistory`（顾名思义：带着消息历史的 Runnable）。用法分三步：\n1. [▶ 27:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1642) 自己写一个函数 `get_session_history(session_id)`：按会话 id（可以理解成用户 id）返回这个会话的历史对象。历史存在哪、怎么读写，由你决定\n2. [▶ 28:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1702) 在一条基础链外面「套一层」`RunnableWithMessageHistory(链, get_session_history)`：每次调用前，它先取出历史拼在这句话前面，调用后再把这一轮存回去\n3. [▶ 29:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1762) 调用时通过 `config={\"configurable\": {\"session_id\": ...}}` 告诉它是哪个会话（嵌套字典的写法，和第 31、32 节的 `thread_id` 一样）\n\n[▶ 27:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1672) 视频用的是最简单的实现：把历史存进 SQLite 数据库（LangChain 里对应的类是 `SQLChatMessageHistory`），并说实际项目可以换成 Redis、MongoDB。课程环境装好了需要的 `greenlet`，所以本课照视频的做法来：",
      "en": "[▶ 25:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1514) Lesson 47 covered how to trim and pick the history; the video's last part covers how to **store and load** it. [▶ 25:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1545) The instructor's key idea: **keep the history (state) apart from the processing logic (the chain)**. The user says something → load that user's history from separate storage → give it to the chain together with the new message → after the chain runs, save the new turn back. To serve many users at once and support multi-turn chats, this is how it should be designed anyway.\n\n[▶ 26:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1607) LangChain provides `RunnableWithMessageHistory` for this (as the name says: a Runnable that carries a message history). Three steps:\n1. [▶ 27:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1642) write your own function `get_session_history(session_id)`: given a session id (think of it as a user id), return that session's history object. Where the history lives and how it's read and written is up to you\n2. [▶ 28:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1702) wrap a basic chain: `RunnableWithMessageHistory(chain, get_session_history)`. Before each call it loads the history and puts it in front of the new message; after the call it saves the new turn\n3. [▶ 29:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1762) when calling, say which session it is with `config={\"configurable\": {\"session_id\": ...}}` (a nested dict, like `thread_id` in lessons 31–32)\n\n[▶ 27:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1672) The video uses the simplest implementation: store the history in an SQLite database (the LangChain class for this is `SQLChatMessageHistory`), noting that real projects could use Redis or MongoDB. The course environment has the `greenlet` package it needs, so we do as the video does:"
    },
    {
      "t": "code",
      "file": "chat_history.py",
      "code": {
        "zh": "from langchain_community.chat_message_histories import SQLChatMessageHistory\nfrom langchain_core.output_parsers import StrOutputParser\nfrom langchain_core.runnables.history import RunnableWithMessageHistory\nfrom langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\nchain = model | StrOutputParser()                 # 一条最基础的链\n\n# 自己写的函数：按 session_id 取出这个会话的历史（这里存在一个 SQLite 文件里）\ndef get_session_history(session_id):\n    return SQLChatMessageHistory(session_id, connection=\"sqlite:///data/l48_chat_history.db\")\n\n# 在基础链外面套一层：调用前先取出历史拼在前面，调用后把这一轮存回去\nchat = RunnableWithMessageHistory(chain, get_session_history)\n\ndef ask(question, session_id):\n    return chat.invoke(question, config={\"configurable\": {\"session_id\": session_id}})\n\nprint(ask(\"你好，我叫小明。\", \"xiaoming\"))         # 你好，小明！很高兴认识你 😊 有什么我可以帮你的吗？\nprint(ask(\"你知道我叫什么名字吗？\", \"xiaoming\"))   # 当然知道，你叫小明呀 😊 ……\nprint(ask(\"你知道我叫什么名字吗？\", \"test\"))       # 我不知道你的名字，因为你还没有告诉我。……",
        "en": "from langchain_community.chat_message_histories import SQLChatMessageHistory\nfrom langchain_core.output_parsers import StrOutputParser\nfrom langchain_core.runnables.history import RunnableWithMessageHistory\nfrom langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\nchain = model | StrOutputParser()                 # the most basic chain\n\n# Your own function: fetch one session's history by session_id (stored in an SQLite file here)\ndef get_session_history(session_id):\n    return SQLChatMessageHistory(session_id, connection=\"sqlite:///data/l48_chat_history.db\")\n\n# Wrap the basic chain: load the history before each call, save the new turn after it\nchat = RunnableWithMessageHistory(chain, get_session_history)\n\ndef ask(question, session_id):\n    return chat.invoke(question, config={\"configurable\": {\"session_id\": session_id}})\n\nprint(ask(\"Hi, I'm Xiaoming.\", \"xiaoming\"))       # Hi Xiaoming! Nice to meet you 😊 Is there anything I can help with?\nprint(ask(\"Do you know my name?\", \"xiaoming\"))    # Of course - your name is Xiaoming 😊 ...\nprint(ask(\"Do you know my name?\", \"test\"))        # I don't know your name, because you haven't told me yet. ..."
      },
      "note": {
        "zh": "注释里的回答来自 `practice/l48_chat_history.py` 的实际运行。[▶ 29:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1793) 和视频一样：同一个 session_id 第二次问，模型看得到之前的对话，答得出名字；换成 `test` 这个新会话，数据库里还没有它的任何消息，就答不出来。每个用户的历史既保存了，又互相隔离。练习文件开头会先清空这两个会话，方便反复运行。",
        "en": "The answers in the comments come from a real run of `practice/l48_chat_history.py`. [▶ 29:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1793) As in the video: asked again in the same session_id, the model sees the earlier turns and knows the name; in the new session `test`, the database holds nothing yet, so it can't tell. Each user's history is kept, and kept separate. The practice file clears both sessions first so you can rerun it."
      }
    },
    {
      "t": "warn",
      "zh": "两个坑：\n- 讲师口头说这个 SQLite 库是「在内存里」建的，但自己写的时候，连接串别真写成 `\"sqlite:///:memory:\"`：每次调用 `get_session_history` 都会新建一个**空的**内存数据库，历史根本存不住（我们试过，第二轮时历史是 0 条）。要用文件，比如 `\"sqlite:///data/l48_chat_history.db\"`，或者自己把历史对象放进一个字典里复用。\n- `RunnableWithMessageHistory` 在已安装的 langchain-core 里已标记为**弃用**（1.3.3 起，计划 2.0 删除），运行时会看到 `LangChainDeprecationWarning`。现在仍然能正常用，跟视频学原理没问题；新项目里官方推荐用 LangGraph 的检查点保存历史（第 31、32 节）——那里的 `thread_id` 就相当于这里的 `session_id`。",
      "en": "Two pitfalls:\n- The instructor describes the SQLite database as built “in memory”, but don't literally use `\"sqlite:///:memory:\"` as the connection: every call to `get_session_history` creates a new, **empty** in-memory database, so nothing is kept (we tried: zero messages on the second turn). Use a file such as `\"sqlite:///data/l48_chat_history.db\"`, or keep the history objects in a dict yourself.\n- In the installed langchain-core, `RunnableWithMessageHistory` is **deprecated** (since 1.3.3, removal planned for 2.0) and prints a `LangChainDeprecationWarning`. It still works fine for learning the idea from the video; for new projects LangChain recommends LangGraph checkpointers (lessons 31–32), where `thread_id` plays the role of `session_id`."
    },
    {
      "t": "tip",
      "zh": "补充：想要一个固定的 system 提示词？把基础链换成「提示词模板 | 模型 | 解析器」，在模板里用 `MessagesPlaceholder(\"history\")` 留出放历史的位置，再告诉 `RunnableWithMessageHistory` 输入字典里哪个键是新的一句、历史填进哪个占位符：",
      "en": "Extra: want a fixed system prompt? Make the basic chain “prompt template | model | parser”, leave room for the history in the template with `MessagesPlaceholder(\"history\")`, and tell `RunnableWithMessageHistory` which input key holds the new message and which placeholder receives the history:"
    },
    {
      "t": "code",
      "file": "history_with_system.py",
      "code": {
        "zh": "from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder\n\nprompt = ChatPromptTemplate.from_messages([\n    (\"system\", \"你是一个友好的助手，回答尽量简短。\"),\n    MessagesPlaceholder(\"history\"),           # 历史消息插在这里\n    (\"human\", \"{question}\"),\n])\nchat = RunnableWithMessageHistory(\n    prompt | model | StrOutputParser(),\n    get_session_history,\n    input_messages_key=\"question\",            # 输入字典里哪个键是「这一句」\n    history_messages_key=\"history\",           # 历史填进哪个占位符\n)\nchat.invoke({\"question\": \"我叫什么名字？\"}, config={\"configurable\": {\"session_id\": \"xiaoming\"}})",
        "en": "from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder\n\nprompt = ChatPromptTemplate.from_messages([\n    (\"system\", \"You are a friendly assistant. Keep answers short.\"),\n    MessagesPlaceholder(\"history\"),           # past messages go here\n    (\"human\", \"{question}\"),\n])\nchat = RunnableWithMessageHistory(\n    prompt | model | StrOutputParser(),\n    get_session_history,\n    input_messages_key=\"question\",            # which input key holds \"the new message\"\n    history_messages_key=\"history\",           # which placeholder receives the history\n)\nchat.invoke({\"question\": \"What's my name?\"}, config={\"configurable\": {\"session_id\": \"xiaoming\"}})"
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "同一条带历史的链，第二次调用时把 `session_id` 从 `\"xiaoming\"` 换成 `\"test\"`，问「你知道我叫什么名字吗？」，结果是？",
        "en": "Same history-aware chain; on the second call `session_id` changes from `\"xiaoming\"` to `\"test\"` and asks “Do you know my name?”. What happens?"
      },
      "options": [
        {
          "zh": "能答出小明，因为是同一条链",
          "en": "It answers Xiaoming – it's the same chain"
        },
        {
          "zh": "报错，session_id 不能变",
          "en": "An error – session_id can't change"
        },
        {
          "zh": "答不出来：`test` 是新会话，取到的历史是空的",
          "en": "It can't tell: `test` is a new session with an empty history"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "历史按 session_id 分开存放，链本身不保存任何状态。换了会话，`get_session_history` 返回的是一个新的空历史。",
        "en": "History is stored per session_id; the chain itself keeps no state. A new session makes `get_session_history` return a fresh, empty history."
      }
    },
    {
      "t": "h",
      "zh": "八、更多功能（了解即可）",
      "en": "8. More features (just know they exist)"
    },
    {
      "t": "p",
      "zh": "[▶ 30:28](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1828) 视频最后提到，LCEL 还有运行时变量（上面的 `config` 就是一种）、故障回退、并行、逻辑分支等功能，用得没有前面那些频繁，遇到了再查官方文档，文档里都有例子。最常用的两个是重试和回退，都是在组件上「套一层」，链的其余部分不用改：",
      "en": "[▶ 30:28](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=49&t=1828) The video ends by noting that LCEL also offers run-time variables (the `config` above is one), fallbacks, parallelism, branching and more – used less often, so look them up in the docs, which have examples, when you need them. The two most common are retries and fallbacks; both “wrap” a component, leaving the rest of the chain untouched:"
    },
    {
      "t": "code",
      "file": "retry_fallback.py",
      "code": {
        "zh": "# 接着前面的代码：model 是 ChatDeepSeek 模型，prompt 是任意一个提示词模板\n# 备用模型用通义千问，需要阿里云百炼的 DASHSCOPE_API_KEY\nbackup = ChatOpenAI(model=\"qwen-plus\", api_key=os.environ[\"DASHSCOPE_API_KEY\"],\n                    base_url=\"https://dashscope.aliyuncs.com/compatible-mode/v1\")\n\nsafe_model = model.with_fallbacks([backup])              # DeepSeek 出错时自动改用 qwen\npatient_model = model.with_retry(stop_after_attempt=3)   # 出错时最多试 3 次\n\nchain = prompt | safe_model | StrOutputParser()          # 链的其余部分完全不用改",
        "en": "# Continues the code above: model is a ChatDeepSeek model, prompt is any prompt template\n# The backup model is Qwen, which needs an Alibaba Cloud Bailian DASHSCOPE_API_KEY\nbackup = ChatOpenAI(model=\"qwen-plus\", api_key=os.environ[\"DASHSCOPE_API_KEY\"],\n                    base_url=\"https://dashscope.aliyuncs.com/compatible-mode/v1\")\n\nsafe_model = model.with_fallbacks([backup])              # use qwen automatically if DeepSeek fails\npatient_model = model.with_retry(stop_after_attempt=3)   # try up to 3 times on errors\n\nchain = prompt | safe_model | StrOutputParser()          # the rest of the chain is unchanged"
      }
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "Python 执行 `a | b` 时，实际调用的是？",
        "en": "When Python evaluates `a | b`, what does it actually call?"
      },
      "options": [
        {
          "zh": "`b.invoke(a)`",
          "en": "`b.invoke(a)`"
        },
        {
          "zh": "`a.invoke(b)`",
          "en": "`a.invoke(b)`"
        },
        {
          "zh": "`a.__or__(b)`（左边不支持时再试 `b.__ror__(a)`）",
          "en": "`a.__or__(b)` (falling back to `b.__ror__(a)` if the left side can't)"
        },
        {
          "zh": "`or(a, b)`",
          "en": "`or(a, b)`"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "`|` 对应特殊方法 `__or__`。LangChain 的 Runnable 实现了它（以及反向的 `__ror__`），返回一条新的链。",
        "en": "`|` maps to the special method `__or__`. LangChain's Runnable implements it (and the reflected `__ror__`) to return a new chain."
      }
    },
    {
      "q": {
        "zh": "下面哪一行会报 `TypeError: unsupported operand type(s) for |`？",
        "en": "Which line raises `TypeError: unsupported operand type(s) for |`?"
      },
      "options": [
        {
          "zh": "`prompt | model`",
          "en": "`prompt | model`"
        },
        {
          "zh": "`retriever | format_docs`（format_docs 是普通函数）",
          "en": "`retriever | format_docs` (format_docs is a plain function)"
        },
        {
          "zh": "`{\"text\": RunnablePassthrough()} | prompt`",
          "en": "`{\"text\": RunnablePassthrough()} | prompt`"
        },
        {
          "zh": "`format_docs | (lambda s: s.upper())`（两个都是普通函数）",
          "en": "`format_docs | (lambda s: s.upper())` (both plain functions)"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "`|` 至少有一边得是 Runnable，另一边的函数或字典才会被自动转换。两个普通函数之间，Python 不知道 `|` 是什么意思。",
        "en": "At least one side of `|` must be a Runnable for the other side's function or dict to be converted. Between two plain functions Python has no meaning for `|`."
      }
    },
    {
      "q": {
        "zh": "RAG 链里 `{\"context\": retriever | format_docs, \"question\": RunnablePassthrough()}` 这一步，两个分支收到的输入是？",
        "en": "In the RAG chain's `{\"context\": retriever | format_docs, \"question\": RunnablePassthrough()}`, what do the two branches receive?"
      },
      "options": [
        {
          "zh": "context 收到问题，question 收到检索结果",
          "en": "context gets the question, question gets the retrieval result"
        },
        {
          "zh": "两个分支收到的都是用户的原问题",
          "en": "Both branches receive the user's original question"
        },
        {
          "zh": "question 收到 context 的输出",
          "en": "question receives context's output"
        },
        {
          "zh": "两个分支都收到空字典",
          "en": "Both receive an empty dict"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "字典（RunnableParallel）把同一个输入同时交给每个分支，再把各分支的结果按键收集起来。",
        "en": "A dict (RunnableParallel) gives the same input to every branch at once, then collects their results by key."
      }
    },
    {
      "q": {
        "zh": "语义解析链里 `parse_model.with_structured_output(Semantics)` 调用 `deepseek-flash` 时报 400：`Thinking mode does not support this tool_choice`，怎么办？",
        "en": "The semantic-parsing chain's `parse_model.with_structured_output(Semantics)` on `deepseek-flash` returns a 400: `Thinking mode does not support this tool_choice`. What's the fix?"
      },
      "options": [
        {
          "zh": "创建模型时加 `extra_body={\"thinking\": {\"type\": \"disabled\"}}` 关掉思考模式",
          "en": "Create the model with `extra_body={\"thinking\": {\"type\": \"disabled\"}}` to switch thinking off"
        },
        {
          "zh": "把 `Semantics` 的字段都改成字符串",
          "en": "Make every `Semantics` field a string"
        },
        {
          "zh": "去掉 `RunnablePassthrough()`",
          "en": "Remove `RunnablePassthrough()`"
        },
        {
          "zh": "把 `invoke` 换成 `stream`",
          "en": "Use `stream` instead of `invoke`"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "结构化输出默认靠强制调用工具实现，思考模式不支持这种强制；关掉思考即可（第 45 节也讲过 `method=\"json_mode\"` 这种替代方式）。",
        "en": "Structured output forces a tool call by default, which thinking mode refuses; switch thinking off (lesson 45 also shows `method=\"json_mode\"` as an alternative)."
      }
    },
    {
      "q": {
        "zh": "模型用 `configurable_alternatives(ConfigurableField(id=\"llm\"), default_key=\"flash\", pro=...)` 包装后，怎样让这一次调用用 `pro`？",
        "en": "A model is wrapped with `configurable_alternatives(ConfigurableField(id=\"llm\"), default_key=\"flash\", pro=...)`. How do you make one call use `pro`?"
      },
      "options": [
        {
          "zh": "`chain.invoke(\"...\", llm=\"pro\")`",
          "en": "`chain.invoke(\"...\", llm=\"pro\")`"
        },
        {
          "zh": "改掉 `default_key`，重新创建模型",
          "en": "Change `default_key` and rebuild the model"
        },
        {
          "zh": "`chain.pro.invoke(\"...\")`",
          "en": "`chain.pro.invoke(\"...\")`"
        },
        {
          "zh": "`chain.with_config(configurable={\"llm\": \"pro\"}).invoke(\"...\")`",
          "en": "`chain.with_config(configurable={\"llm\": \"pro\"}).invoke(\"...\")`"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "选项通过运行时配置选择：配置项的名字是 `ConfigurableField` 的 id（这里是 `llm`），值是选项名。也可以写 `chain.invoke(x, config={\"configurable\": {\"llm\": \"pro\"}})`。",
        "en": "Options are chosen through run-time config: the key is the `ConfigurableField` id (`llm` here) and the value is the option name. `chain.invoke(x, config={\"configurable\": {\"llm\": \"pro\"}})` works too."
      }
    },
    {
      "q": {
        "zh": "调用 `RunnableWithMessageHistory` 包装的链时，`session_id` 应该怎么传？",
        "en": "How do you pass `session_id` when calling a chain wrapped in `RunnableWithMessageHistory`?"
      },
      "options": [
        {
          "zh": "`chat.invoke(\"你好\", session_id=\"xm\")`（关键字参数）",
          "en": "`chat.invoke(\"hi\", session_id=\"xm\")` (a keyword argument)"
        },
        {
          "zh": "`chat.invoke(\"你好\", config={\"configurable\": {\"session_id\": \"xm\"}})`（放进 config）",
          "en": "`chat.invoke(\"hi\", config={\"configurable\": {\"session_id\": \"xm\"}})` (inside config)"
        },
        {
          "zh": "`chat.session_id = \"xm\"`（设置属性）",
          "en": "`chat.session_id = \"xm\"` (set an attribute)"
        },
        {
          "zh": "不用传，它会自动区分用户",
          "en": "No need – it tells users apart automatically"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "会话 id 是运行时配置，放在 `config[\"configurable\"]` 里；不传会报 `Missing keys ['session_id']`。",
        "en": "The session id is run-time config under `config[\"configurable\"]`; leaving it out raises `Missing keys ['session_id']`."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "讲笑话的链与三种调用",
        "en": "The joke chain and three ways to call it"
      },
      "code": {
        "zh": "prompt = ChatPromptTemplate.[[from_template]](\"讲一个关于{topic}的笑话\")\nchain = {\"topic\": [[RunnablePassthrough]]()} | [[prompt]] | [[model]] | [[StrOutputParser]]()\n\nprint(chain.[[invoke]](\"小明\"))\nfor piece in chain.[[stream]](\"小明\"):\n    print(piece, end=\"\", [[flush]]=True)\njokes = chain.[[batch]]([\"程序员\", \"猫\"])",
        "en": "prompt = ChatPromptTemplate.[[from_template]](\"Tell a joke about {topic}\")\nchain = {\"topic\": [[RunnablePassthrough]]()} | [[prompt]] | [[model]] | [[StrOutputParser]]()\n\nprint(chain.[[invoke]](\"Xiaoming\"))\nfor piece in chain.[[stream]](\"Xiaoming\"):\n    print(piece, end=\"\", [[flush]]=True)\njokes = chain.[[batch]]([\"programmers\", \"cats\"])"
      },
      "explain": {
        "zh": "占位符把输入放进 `topic` 槽，`|` 把各个组件串起来；同一条链可以 `invoke`（一次）、`stream`（流式）、`batch`（并发批量）。",
        "en": "The placeholder puts the input in the `topic` slot and `|` joins the components; the same chain supports `invoke` (once), `stream` (streaming) and `batch` (concurrent)."
      }
    },
    {
      "title": {
        "zh": "RAG 链",
        "en": "The RAG chain"
      },
      "code": {
        "zh": "def format_docs(docs):\n    return \"\\n\\n\".[[join]]([d.[[page_content]] for d in docs])\n\nrag_chain = (\n    {\"context\": [[retriever]] | format_docs, \"question\": [[RunnablePassthrough]]()}\n    | [[prompt]]\n    | model\n    | StrOutputParser()\n)\nprint(rag_chain.invoke(\"青松模型有多少参数？\"))",
        "en": "def format_docs(docs):\n    return \"\\n\\n\".[[join]]([d.[[page_content]] for d in docs])\n\nrag_chain = (\n    {\"context\": [[retriever]] | format_docs, \"question\": [[RunnablePassthrough]]()}\n    | [[prompt]]\n    | model\n    | StrOutputParser()\n)\nprint(rag_chain.invoke(\"青松模型有多少参数？\"))   # \"How many parameters does Qingsong have?\""
      },
      "explain": {
        "zh": "问题同时交给检索器和 `RunnablePassthrough`；检索结果拼成文字填 `context`，原问题填 `question`。",
        "en": "The question goes to both the retriever and `RunnablePassthrough`; the retrieved text fills `context`, the original question fills `question`."
      }
    },
    {
      "title": {
        "zh": "按会话保存历史（视频的写法）",
        "en": "History per session (as in the video)"
      },
      "code": {
        "zh": "def get_session_history(session_id):\n    return [[SQLChatMessageHistory]](session_id, connection=\"sqlite:///data/l48_chat_history.db\")\n\nchat = [[RunnableWithMessageHistory]](chain, [[get_session_history]])\nchat.invoke(\"你知道我叫什么名字吗？\", config={\"[[configurable]]\": {\"[[session_id]]\": \"xiaoming\"}})",
        "en": "def get_session_history(session_id):\n    return [[SQLChatMessageHistory]](session_id, connection=\"sqlite:///data/l48_chat_history.db\")\n\nchat = [[RunnableWithMessageHistory]](chain, [[get_session_history]])\nchat.invoke(\"Do you know my name?\", config={\"[[configurable]]\": {\"[[session_id]]\": \"xiaoming\"}})"
      },
      "explain": {
        "zh": "`get_session_history` 按会话 id 取出历史（这里存在 SQLite 文件里）；`RunnableWithMessageHistory` 套在基础链外面；会话 id 放在 `config[\"configurable\"]` 里。",
        "en": "`get_session_history` fetches a session's history (stored in an SQLite file here); `RunnableWithMessageHistory` wraps the basic chain; the session id goes in `config[\"configurable\"]`."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：自己实现 | 运算符（可在网页运行）",
        "en": "Write it: implement the | operator yourself (runs in the browser)"
      },
      "task": {
        "zh": "不看上面的 Python 小课堂，写一个类 `Step`：保存一个函数，`invoke(x)` 调用它，`__or__(other)` 返回一个先运行自己、再把结果交给 `other` 的新 `Step`。然后用三个 lambda（加 1、乘 2、变成文字）串成一条链，`invoke(3)` 应该打印 `结果是 8`。",
        "en": "Without looking at the Python mini-lesson above, write a class `Step` that stores a function, calls it in `invoke(x)`, and whose `__or__(other)` returns a new `Step` that runs itself and then hands the result to `other`. Chain three lambdas (add 1, double, to text); `invoke(3)` should print `result: 8`."
      },
      "run": true,
      "starter": {
        "zh": "# 写一个类 Step：\n#   __init__(self, func)：保存函数\n#   invoke(self, x)：调用保存的函数\n#   __or__(self, other)：返回一个新的 Step，它先跑 self，再把结果交给 other\n#\n# 然后用三个 lambda 创建三个 Step：加 1、乘 2、变成字符串 \"结果是 …\"\n# 用 | 把它们串起来，invoke(3) 应该打印：结果是 8",
        "en": "# Write a Step class:\n#   __init__(self, func): store the function\n#   invoke(self, x): call the stored function\n#   __or__(self, other): return a new Step that runs self, then hands the result to other\n#\n# Then make three Steps from lambdas: add 1, multiply by 2, turn into the string \"result: ...\"\n# Join them with |; invoke(3) should print: result: 8"
      },
      "solution": {
        "zh": "class Step:\n    def __init__(self, func):\n        self.func = func\n\n    def invoke(self, x):\n        return self.func(x)\n\n    def __or__(self, other):\n        return Step(lambda x: other.invoke(self.invoke(x)))\n\nadd_one = Step(lambda x: x + 1)\ndouble = Step(lambda x: x * 2)\nto_text = Step(lambda x: f\"结果是 {x}\")\n\nchain = add_one | double | to_text\nprint(chain.invoke(3))      # 结果是 8",
        "en": "class Step:\n    def __init__(self, func):\n        self.func = func\n\n    def invoke(self, x):\n        return self.func(x)\n\n    def __or__(self, other):\n        return Step(lambda x: other.invoke(self.invoke(x)))\n\nadd_one = Step(lambda x: x + 1)\ndouble = Step(lambda x: x * 2)\nto_text = Step(lambda x: f\"result: {x}\")\n\nchain = add_one | double | to_text\nprint(chain.invoke(3))      # result: 8"
      },
      "checks": [
        {
          "zh": "定义了类 `Step`",
          "en": "Defines the class `Step`",
          "re": "class\\s+Step\\b"
        },
        {
          "zh": "`__init__` 保存函数",
          "en": "`__init__` stores the function",
          "re": "def\\s+__init__\\s*\\(\\s*self\\s*,\\s*\\w+\\s*\\)\\s*:"
        },
        {
          "zh": "定义了 `invoke` 方法",
          "en": "Defines an `invoke` method",
          "re": "def\\s+invoke\\s*\\(\\s*self\\s*,\\s*\\w+\\s*\\)\\s*:"
        },
        {
          "zh": "定义了 `__or__(self, other)`",
          "en": "Defines `__or__(self, other)`",
          "re": "def\\s+__or__\\s*\\(\\s*self\\s*,\\s*\\w+\\s*\\)\\s*:"
        },
        {
          "zh": "`__or__` 返回一个新的 `Step`",
          "en": "`__or__` returns a new `Step`",
          "re": "return\\s+Step\\("
        },
        {
          "zh": "先运行自己，再交给 other",
          "en": "Runs self first, then hands on to other",
          "re": "\\w+\\.invoke\\(\\s*self\\.invoke\\("
        },
        {
          "zh": "用 `|` 串起三个 Step",
          "en": "Joins three Steps with `|`",
          "re": "=\\s*\\w+\\s*\\|\\s*\\w+\\s*\\|\\s*\\w+"
        }
      ]
    },
    {
      "title": {
        "zh": "手写：讲笑话的链，并流式和批量调用",
        "en": "Write it: the joke chain, streamed and batched"
      },
      "task": {
        "zh": "按注释写出视频例子二那样的链：占位符 → 提示词模板（占位符 `topic`）→ DeepSeek → `StrOutputParser()`。然后用 `stream` 一段一段地打印一个笑话，再用 `batch` 一次讲两个。\n\n这段代码要在本地运行（`practice` 文件夹、`.venv`，会调用 3 次模型）。",
        "en": "Following the comments, build a chain like the video's example 2: placeholder → prompt template (placeholder `topic`) → DeepSeek → `StrOutputParser()`. Then print one joke piece by piece with `stream`, and get two at once with `batch`.\n\nRun it locally (`practice` folder, `.venv`; 3 model calls)."
      },
      "starter": {
        "zh": "from langchain_core.output_parsers import StrOutputParser\nfrom langchain_core.prompts import ChatPromptTemplate\nfrom langchain_core.runnables import RunnablePassthrough\nfrom langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\n# 1. 提示词模板：「讲一个关于 X 的笑话」，X 是占位符 topic\n\n# 2. 模型：DeepSeek\n\n# 3. 用 | 串成：占位（RunnablePassthrough）→ 提示词 → 模型 → 字符串解析器\n\n# 4. 流式输出 topic 为「小明」的笑话（一段一段地打印）\n\n# 5. 批量讲两个笑话：「程序员」和「猫」，打印两个结果",
        "en": "from langchain_core.output_parsers import StrOutputParser\nfrom langchain_core.prompts import ChatPromptTemplate\nfrom langchain_core.runnables import RunnablePassthrough\nfrom langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\n# 1. a prompt template: \"tell a joke about X\", X is the placeholder topic\n\n# 2. the model: DeepSeek\n\n# 3. join with |: placeholder (RunnablePassthrough) -> prompt -> model -> string parser\n\n# 4. stream a joke about \"Xiaoming\" (print it piece by piece)\n\n# 5. batch two jokes, about \"programmers\" and \"cats\", and print both"
      },
      "solution": {
        "zh": "from langchain_core.output_parsers import StrOutputParser\nfrom langchain_core.prompts import ChatPromptTemplate\nfrom langchain_core.runnables import RunnablePassthrough\nfrom langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\n# 1. 提示词模板：「讲一个关于 X 的笑话」，X 是占位符 topic\nprompt = ChatPromptTemplate.from_template(\"讲一个关于{topic}的笑话，不超过三句话。\")\n\n# 2. 模型：DeepSeek\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 3. 用 | 串成：占位（RunnablePassthrough）→ 提示词 → 模型 → 字符串解析器\nchain = {\"topic\": RunnablePassthrough()} | prompt | model | StrOutputParser()\n\n# 4. 流式输出 topic 为「小明」的笑话（一段一段地打印）\nfor piece in chain.stream(\"小明\"):\n    print(piece, end=\"\", flush=True)\nprint()\n\n# 5. 批量讲两个笑话：「程序员」和「猫」，打印两个结果\njokes = chain.batch([\"程序员\", \"猫\"])\nfor j in jokes:\n    print(j)",
        "en": "from langchain_core.output_parsers import StrOutputParser\nfrom langchain_core.prompts import ChatPromptTemplate\nfrom langchain_core.runnables import RunnablePassthrough\nfrom langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\n# 1. a prompt template: \"tell a joke about X\", X is the placeholder topic\nprompt = ChatPromptTemplate.from_template(\"Tell a joke about {topic} in at most three sentences.\")\n\n# 2. the model: DeepSeek\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 3. join with |: placeholder (RunnablePassthrough) -> prompt -> model -> string parser\nchain = {\"topic\": RunnablePassthrough()} | prompt | model | StrOutputParser()\n\n# 4. stream a joke about \"Xiaoming\" (print it piece by piece)\nfor piece in chain.stream(\"Xiaoming\"):\n    print(piece, end=\"\", flush=True)\nprint()\n\n# 5. batch two jokes, about \"programmers\" and \"cats\", and print both\njokes = chain.batch([\"programmers\", \"cats\"])\nfor j in jokes:\n    print(j)"
      },
      "checks": [
        {
          "zh": "用 `ChatPromptTemplate` 创建提示词模板",
          "en": "Creates a prompt with `ChatPromptTemplate`",
          "re": "ChatPromptTemplate\\.from_(template|messages)\\("
        },
        {
          "zh": "模板里有 `{topic}` 占位符",
          "en": "The template has a `{topic}` placeholder",
          "re": "\\{topic\\}"
        },
        {
          "zh": "创建了 `ChatDeepSeek` 模型",
          "en": "Creates a `ChatDeepSeek` model",
          "re": "ChatDeepSeek\\(\\s*model\\s*=\\s*MODEL"
        },
        {
          "zh": "开头用 `RunnablePassthrough()` 占位",
          "en": "Starts with a `RunnablePassthrough()` placeholder",
          "re": "\\{\\s*[\\\"']topic[\\\"']\\s*:\\s*RunnablePassthrough\\(\\)\\s*\\}\\s*\\|"
        },
        {
          "zh": "用 `|` 串成 prompt | model | StrOutputParser()",
          "en": "Joins prompt | model | StrOutputParser() with `|`",
          "re": "prompt\\s*\\|\\s*model\\s*\\|\\s*StrOutputParser\\(\\)"
        },
        {
          "zh": "用 `.stream(...)` 流式输出",
          "en": "Streams with `.stream(...)`",
          "re": "for\\s+\\w+\\s+in\\s+chain\\.stream\\("
        },
        {
          "zh": "`print(..., end=\"\", flush=True)`",
          "en": "`print(..., end=\"\", flush=True)`",
          "re": "end\\s*=\\s*[\\\"'][\\\"'][\\s\\S]*?flush\\s*=\\s*True"
        },
        {
          "zh": "用 `.batch([...])` 批量调用",
          "en": "Batches with `.batch([...])`",
          "re": "chain\\.batch\\(\\s*\\["
        }
      ]
    },
    {
      "title": {
        "zh": "手写：一条完整的 RAG 链",
        "en": "Write it: a complete RAG chain"
      },
      "task": {
        "zh": "检索器和模型已经准备好（检索器来自第 46 节，和视频一样每次取 2 段）。按注释写出：\n1. 有两个占位符 `context` 和 `question` 的 RAG 提示词\n2. `format_docs(docs)`：把每个 Document 的 `page_content` 用空行连成一个字符串\n3. `rag_chain`：字典 → 提示词 → 模型 → `StrOutputParser()`\n4. 问「青松模型有多少参数？」并打印回答\n\n这段代码要在本地运行（`practice` 文件夹、`.venv`，调用 1 次模型），对照 `practice/l48_rag_chain_solution.py`。",
        "en": "The retriever (from lesson 46, fetching 2 chunks each time, like the video) and the model are ready. Following the comments, write:\n1. a RAG prompt with two placeholders, `context` and `question`\n2. `format_docs(docs)`: join every Document's `page_content` with blank lines into one string\n3. `rag_chain`: dict → prompt → model → `StrOutputParser()`\n4. ask “青松模型有多少参数？” (“How many parameters does Qingsong have?”) and print the answer\n\nRun it locally (`practice` folder, `.venv`; one model call) and compare with `practice/l48_rag_chain_solution.py`."
      },
      "starter": {
        "zh": "from langchain_core.output_parsers import StrOutputParser\nfrom langchain_core.prompts import ChatPromptTemplate\nfrom langchain_core.runnables import RunnablePassthrough\nfrom langchain_deepseek import ChatDeepSeek\n\nfrom l46_retriever_solution import build_retriever\nfrom llm import API_KEY, MODEL\n\nretriever = build_retriever(k=2)\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 1. RAG 提示词：两个占位符 context（资料）和 question（问题），要求只根据资料回答\n\n# 2. format_docs(docs)：把每个 Document 的文字用空行连成一个字符串\n\n# 3. rag_chain：字典（context 走检索器再格式化，question 原样传递）→ 提示词 → 模型 → 字符串解析器\n\n# 4. 问「青松模型有多少参数？」并打印回答",
        "en": "from langchain_core.output_parsers import StrOutputParser\nfrom langchain_core.prompts import ChatPromptTemplate\nfrom langchain_core.runnables import RunnablePassthrough\nfrom langchain_deepseek import ChatDeepSeek\n\nfrom l46_retriever_solution import build_retriever\nfrom llm import API_KEY, MODEL\n\nretriever = build_retriever(k=2)\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 1. RAG prompt: two placeholders, context (material) and question; answer only from the material\n\n# 2. format_docs(docs): join every Document's text with blank lines into one string\n\n# 3. rag_chain: a dict (context goes through the retriever and gets formatted, question passes through)\n#    -> prompt -> model -> string parser\n\n# 4. ask \"青松模型有多少参数？\" and print the answer"
      },
      "solution": {
        "zh": "from langchain_core.output_parsers import StrOutputParser\nfrom langchain_core.prompts import ChatPromptTemplate\nfrom langchain_core.runnables import RunnablePassthrough\nfrom langchain_deepseek import ChatDeepSeek\n\nfrom l46_retriever_solution import build_retriever\nfrom llm import API_KEY, MODEL\n\nretriever = build_retriever(k=2)\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 1. RAG 提示词：两个占位符 context（资料）和 question（问题），要求只根据资料回答\nprompt = ChatPromptTemplate.from_template(\n    \"只根据下面的资料回答问题，资料里没有就说没有提到。\\n\\n资料：\\n{context}\\n\\n问题：{question}\"\n)\n\n# 2. format_docs(docs)：把每个 Document 的文字用空行连成一个字符串\ndef format_docs(docs):\n    return \"\\n\\n\".join([d.page_content for d in docs])\n\n# 3. rag_chain：字典（context 走检索器再格式化，question 原样传递）→ 提示词 → 模型 → 字符串解析器\nrag_chain = (\n    {\"context\": retriever | format_docs, \"question\": RunnablePassthrough()}\n    | prompt\n    | model\n    | StrOutputParser()\n)\n\n# 4. 问「青松模型有多少参数？」并打印回答\nprint(rag_chain.invoke(\"青松模型有多少参数？\"))",
        "en": "from langchain_core.output_parsers import StrOutputParser\nfrom langchain_core.prompts import ChatPromptTemplate\nfrom langchain_core.runnables import RunnablePassthrough\nfrom langchain_deepseek import ChatDeepSeek\n\nfrom l46_retriever_solution import build_retriever\nfrom llm import API_KEY, MODEL\n\nretriever = build_retriever(k=2)\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 1. RAG prompt: two placeholders, context (material) and question; answer only from the material\nprompt = ChatPromptTemplate.from_template(\n    \"Answer only from the material below; if it isn't there, say so.\\n\\nMaterial:\\n{context}\\n\\nQuestion: {question}\"\n)\n\n# 2. format_docs(docs): join every Document's text with blank lines into one string\ndef format_docs(docs):\n    return \"\\n\\n\".join([d.page_content for d in docs])\n\n# 3. rag_chain: a dict (context goes through the retriever and gets formatted, question passes through)\n#    -> prompt -> model -> string parser\nrag_chain = (\n    {\"context\": retriever | format_docs, \"question\": RunnablePassthrough()}\n    | prompt\n    | model\n    | StrOutputParser()\n)\n\n# 4. ask \"青松模型有多少参数？\" and print the answer\nprint(rag_chain.invoke(\"青松模型有多少参数？\"))"
      },
      "checks": [
        {
          "zh": "提示词里有 `{context}`",
          "en": "The prompt has `{context}`",
          "re": "\\{context\\}"
        },
        {
          "zh": "提示词里有 `{question}`",
          "en": "The prompt has `{question}`",
          "re": "\\{question\\}"
        },
        {
          "zh": "定义了 `format_docs(docs)`",
          "en": "Defines `format_docs(docs)`",
          "re": "def\\s+format_docs\\s*\\(\\s*\\w+\\s*\\)\\s*:"
        },
        {
          "zh": "用 `join` 拼接 `page_content`",
          "en": "Joins `page_content` with `join`",
          "re": "\\.join\\([\\s\\S]*?page_content"
        },
        {
          "zh": "`\"context\": retriever | format_docs`",
          "en": "`\"context\": retriever | format_docs`",
          "re": "[\\\"']context[\\\"']\\s*:\\s*retriever\\s*\\|\\s*format_docs"
        },
        {
          "zh": "`\"question\": RunnablePassthrough()`",
          "en": "`\"question\": RunnablePassthrough()`",
          "re": "[\\\"']question[\\\"']\\s*:\\s*RunnablePassthrough\\(\\)"
        },
        {
          "zh": "后面依次接 prompt、model、StrOutputParser()",
          "en": "Followed by prompt, model, StrOutputParser()",
          "re": "\\|\\s*prompt\\s*\\|\\s*model\\s*\\|\\s*StrOutputParser\\(\\)"
        },
        {
          "zh": "调用链提问",
          "en": "Calls the chain with a question",
          "re": "rag_chain\\.(invoke|stream)\\("
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "用 `with_structured_output` 时没关思考模式，`deepseek-flash` 报 400 `Thinking mode does not support this tool_choice`。",
      "en": "Using `with_structured_output` without switching thinking off – `deepseek-flash` returns 400 `Thinking mode does not support this tool_choice`."
    },
    {
      "zh": "字典的键和提示词的占位符对不上，报 `KeyError: Input to ChatPromptTemplate is missing variables {'question'}`。",
      "en": "Dict keys that don't match the prompt's placeholders – `KeyError: Input to ChatPromptTemplate is missing variables {'question'}`."
    },
    {
      "zh": "`|` 两边都是普通函数（或字典和函数），报 `TypeError: unsupported operand type(s) for |`；至少一边要是 Runnable。",
      "en": "Plain functions (or a dict and a function) on both sides of `|` – `TypeError: unsupported operand type(s) for |`; at least one side must be a Runnable."
    },
    {
      "zh": "像视频那样把检索器的结果直接填进提示词，里面带着 `Document(metadata=...)` 的外壳；加一个 `format_docs` 只保留文字。",
      "en": "Putting the retriever's raw result into the prompt as the video does, `Document(metadata=...)` wrappers and all; add `format_docs` to keep just the text."
    },
    {
      "zh": "`stream` 时 `print` 没写 `end=\"\"` 和 `flush=True`，每段一行，或者等到最后才一起显示。",
      "en": "With `stream`, a `print` without `end=\"\"` and `flush=True` shows one piece per line, or everything only at the end."
    },
    {
      "zh": "调用带历史的链时忘了 `config={\"configurable\": {\"session_id\": ...}}`，报 `Missing keys ['session_id']`。",
      "en": "Calling a history-aware chain without `config={\"configurable\": {\"session_id\": ...}}` – `Missing keys ['session_id']`."
    },
    {
      "zh": "`SQLChatMessageHistory` 的连接串写成 `sqlite:///:memory:`：每次都是新的空数据库，历史存不住；要用文件。",
      "en": "Using `sqlite:///:memory:` for `SQLChatMessageHistory`: each call gets a new empty database, so nothing is kept; use a file."
    }
  ],
  "recap": [
    {
      "zh": "LCEL 用 `|` 声明「A 的输出交给 B」的既定流水线；`a | b` 就是 `a.__or__(b)`，LangChain 让它返回一条新链（chain 和 Runnable 常混用）。",
      "en": "LCEL declares a fixed “A's output goes to B” pipeline with `|`; `a | b` is `a.__or__(b)`, which LangChain makes return a new chain (“chain” and “Runnable” are used interchangeably)."
    },
    {
      "zh": "视频的两个基础例子：`{\"text\": RunnablePassthrough()} | prompt | 结构化模型`（语义解析）和 `{\"topic\": RunnablePassthrough()} | prompt | model | StrOutputParser()`（讲笑话）。",
      "en": "The video's two basic examples: `{\"text\": RunnablePassthrough()} | prompt | structured model` (semantic parsing) and `{\"topic\": RunnablePassthrough()} | prompt | model | StrOutputParser()` (jokes)."
    },
    {
      "zh": "任何链都能 `invoke`、`stream`、`batch`（并发），还有异步版 `ainvoke` 等——这正是官方对比想说明的价值。",
      "en": "Every chain supports `invoke`, `stream`, `batch` (concurrent) and async versions such as `ainvoke` – the value the official comparison shows."
    },
    {
      "zh": "RAG 链：`{\"context\": retriever | format_docs, \"question\": RunnablePassthrough()} | prompt | model | StrOutputParser()`；字典 = `RunnableParallel`。",
      "en": "RAG chain: `{\"context\": retriever | format_docs, \"question\": RunnablePassthrough()} | prompt | model | StrOutputParser()`; a dict = `RunnableParallel`."
    },
    {
      "zh": "`configurable_alternatives` + `with_config` 在运行时切换组件（工厂的效果）；讲师认为 LCEL 本身像建造者模式。",
      "en": "`configurable_alternatives` + `with_config` switch components at run time (a factory effect); the instructor sees LCEL itself as the Builder pattern."
    },
    {
      "zh": "`RunnableWithMessageHistory` + `get_session_history` 按 `session_id` 存取历史（视频存进 SQLite；已弃用但可用）；新项目用 LangGraph 检查点。",
      "en": "`RunnableWithMessageHistory` + `get_session_history` store and load history by `session_id` (SQLite in the video; deprecated but working); use LangGraph checkpointers in new projects."
    }
  ],
  "files": [
    {
      "path": "practice/l48_lcel_basics.py",
      "zh": "演示：视频的例子一（语义解析，结构化输出）和例子二（讲笑话，`stream`），再加 `batch`（调用 4 次模型）。",
      "en": "Demo: the video's example 1 (semantic parsing, structured output) and example 2 (jokes, `stream`), plus `batch` (4 model calls)."
    },
    {
      "path": "practice/l48_rag_chain_todo.py",
      "zh": "练习：按 TODO 写出 RAG 提示词、`format_docs` 和 `rag_chain`（调用 1 次模型）。",
      "en": "Exercise: write the RAG prompt, `format_docs` and `rag_chain` following the TODOs (1 model call)."
    },
    {
      "path": "practice/l48_rag_chain_solution.py",
      "zh": "参考答案：复用第 46 节的 FAISS 检索器（每次取 2 段），流式输出 RAG 回答。",
      "en": "Solution: reuses lesson 46's FAISS retriever (2 chunks per question) and streams the RAG answer."
    },
    {
      "path": "practice/l48_chat_history.py",
      "zh": "演示：`RunnableWithMessageHistory` + `SQLChatMessageHistory`（和视频一样存进 SQLite），同一会话记得名字、新会话不记得（调用 3 次模型）。",
      "en": "Demo: `RunnableWithMessageHistory` + `SQLChatMessageHistory` (SQLite, as in the video) – the same session remembers the name, a new one doesn't (3 model calls)."
    },
    {
      "path": "practice/l48_configurable_model.py",
      "zh": "选修演示：`configurable_alternatives` 在 deepseek-flash 和 deepseek-v4-pro 之间切换（调用 2 次模型；有百炼 key 时再试 qwen）。",
      "en": "Optional demo: `configurable_alternatives` switching between deepseek-flash and deepseek-v4-pro (2 model calls; also qwen with a Bailian key)."
    }
  ]
});
