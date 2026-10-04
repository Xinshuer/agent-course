COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
 "id": "l49",
 "priority": "important",
 "handwrite": true,
 "studyMinutes": 40,
 "source": "subtitle",
 "summary": {
  "zh": "视频这一集（约 9 分钟）是 LangChain 智能体的快速入门：先讲智能体由什么组成（工具、规划推理、记忆），再用两个工具（搜索 + 算星期几）、LangChain Hub 上的 ReAct 提示词和 `create_react_agent` + `AgentExecutor` 搭出一个 ReAct 智能体，最后演示只靠一个搜索工具不断追问的 Self-Ask with Search。讲义按同样的顺序走，把代码改成在 LangChain 1.x 上能跑的写法，并补充 1.x 推荐的 `create_agent`。",
  "en": "This episode (about 9 minutes) is a quick start on agents in LangChain: what an agent is made of (tools, planning/reasoning, memory), then a ReAct agent built from two tools (search + day of the week), the ReAct prompt from LangChain Hub and `create_react_agent` + `AgentExecutor`, and finally Self-Ask with Search, which keeps asking follow-up questions with a single search tool. The notes follow the same order, adapt the code so it runs on LangChain 1.x, and add `create_agent`, the 1.x recommendation."
 },
 "goals": [
  {
   "zh": "说出智能体的要素：工具、规划/推理、记忆（短期记这次任务的过程，长期记多轮对话，可选），以及为什么「模型 + function calling」是最简单的智能体",
   "en": "Name an agent's ingredients – tools, planning/reasoning, memory (short-term: this task's trail; long-term: chat history, optional) – and why “LLM + function calling” is the simplest agent"
  },
  {
   "zh": "写出视频里「算星期几」的工具：`@tool` + 写清输入格式的 docstring + `datetime.strptime`",
   "en": "Write the video's day-of-the-week tool: `@tool` + a docstring stating the input format + `datetime.strptime`"
  },
  {
   "zh": "读懂 ReAct 提示词模板和它的四个占位符，知道 `hub.pull` 在 1.x 里为什么出错、怎么替代",
   "en": "Read the ReAct prompt template and its four placeholders, and know why `hub.pull` fails on 1.x and what to use instead"
  },
  {
   "zh": "用 `create_react_agent` + `AgentExecutor`（从 `langchain_classic.agents` 导入）搭出 ReAct 智能体，读懂 `verbose` 的输出",
   "en": "Build a ReAct agent with `create_react_agent` + `AgentExecutor` (imported from `langchain_classic.agents`) and read its `verbose` output"
  },
  {
   "zh": "说清 Self-Ask with Search 和 ReAct 的区别，以及它对工具的两条硬性要求",
   "en": "Explain how Self-Ask with Search differs from ReAct, and its two hard rules about the tool"
  },
  {
   "zh": "用 1.x 的 `create_agent` 写出同一个智能体，说出它和视频写法的主要区别",
   "en": "Write the same agent with 1.x's `create_agent` and name the main differences from the video's code"
  }
 ],
 "blocks": [
  {
   "t": "h",
   "zh": "一、什么是智能体",
   "en": "1. What an agent is"
  },
  {
   "t": "p",
   "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=50&t=0) 老师从任务的难易讲起：\n- **简单任务**：调用一两个函数就完成了。这就是「大模型 + function calling」（05 节），可以看成**最简单的智能体**。\n- **复杂任务**：模型要分好几步来完成——想一步，自己挑一个工具，看工具的结果，再想下一步，再挑工具……用户只问了一句，它在内部转了很多轮才给出答案。通常说的「智能体」指的就是这种应用。\n\n[▶ 01:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=50&t=62) 由此可以总结出智能体的几个要素：\n\n| 要素 | 是什么 | 本课程在哪学过 |\n|---|---|---|\n| 工具集 | 一组可以调用的工具 | 05 节 |\n| 规划 / 推理 | 自己想下一步，看了结果再想，再选工具 | 07 节 ReAct |\n| 短期记忆（一定有） | 这一次任务的过程：每一步想了什么、调了哪个工具、结果是什么 | 06 节的消息列表 |\n| 长期记忆（可选） | 一般用来存多轮对话的历史 | 06、47 节 |",
   "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=50&t=0) The instructor starts from how hard a task is:\n- **Simple task**: one or two function calls and it is done. That is “LLM + function calling” (lesson 05), which you can think of as **the simplest agent**.\n- **Complex task**: the model needs several steps – think, pick a tool itself, look at the tool's result, think again, pick another tool… The user asks one question, and it goes round many times internally before it answers. This is what people usually mean by an “agent”.\n\n[▶ 01:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=50&t=62) From this we can sum up an agent's ingredients:\n\n| Ingredient | What it is | Where this course covered it |\n|---|---|---|\n| A toolset | A set of tools it can call | Lesson 05 |\n| Planning / reasoning | Decide the next step itself, look at the result, decide again, pick a tool | Lesson 07, ReAct |\n| Short-term memory (always there) | This task's trail: what it thought at each step, which tool it called, what came back | Lesson 06's message list |\n| Long-term memory (optional) | Usually stores the history of a multi-turn chat | Lessons 06 and 47 |"
  },
  {
   "t": "video",
   "zh": "视频（约 9 分钟，据 B 站自动字幕）的顺序是：智能体的要素 → 准备两个工具（搜索 + 算星期几）→ ReAct 的思路 → 从 LangChain Hub 下载 ReAct 提示词 → `create_react_agent` + `AgentExecutor` 运行 → 第二种模式 Self-Ask with Search → 两种模式对比。讲义按这个顺序走，最后补充 LangChain 1.x 推荐的 `create_agent`。\n\n老师说这一集只做简单介绍，智能体的开发方法后面会专门讲。在本课程的顺序里，那些内容（手写工具循环、ReAct、LangGraph）你已经在 05–07 节和第 25 节以后学过，这一节可以当作复习。他还特意说明：接下来演示的是 LangChain 内置的智能体，只是个「玩具」。这一集用的是 OpenAI 的模型，讲义换成 DeepSeek（deepseek-flash）。",
   "en": "The video (about 9 minutes, per Bilibili's auto-subtitles) goes: an agent's ingredients → preparing two tools (search + day of the week) → the idea of ReAct → downloading the ReAct prompt from LangChain Hub → running it with `create_react_agent` + `AgentExecutor` → a second pattern, Self-Ask with Search → comparing the two. The notes follow this order and finish with `create_agent`, which LangChain 1.x recommends.\n\nThe instructor says this episode is only a brief introduction; how to develop agents is covered properly later. In this course's order you have already learned that material (hand-written tool loops, ReAct, LangGraph) in lessons 05–07 and from lesson 25 on, so treat this lesson as a review. He also makes a point of saying that what he demonstrates next is LangChain's built-in agent, which is only a “toy”. The episode uses an OpenAI model; the notes use DeepSeek (deepseek-flash) instead."
  },
  {
   "t": "check",
   "q": {
    "zh": "老师说的「短期记忆」记的是什么？",
    "en": "What does the instructor's “short-term memory” hold?"
   },
   "options": [
    {
     "zh": "用户和它聊过的多轮对话历史",
     "en": "The history of earlier conversations with the user"
    },
    {
     "zh": "这一次任务里每一步的思考、选了哪个工具、工具返回了什么",
     "en": "This task's steps: each thought, which tool was chosen and what it returned"
    },
    {
     "zh": "模型训练时学到的知识",
     "en": "What the model learned during training"
    },
    {
     "zh": "系统提示词",
     "en": "The system prompt"
    }
   ],
   "answer": 1,
   "explain": {
    "zh": "短期记忆就是这次任务的「草稿纸」。多轮对话历史属于长期记忆，老师说那一项是可选的。在下面的 ReAct 提示词里，这张草稿纸就是 `{agent_scratchpad}`。",
    "en": "Short-term memory is this task's scratch paper. Multi-turn history is long-term memory, which the instructor calls optional. In the ReAct prompt below, the scratch paper is `{agent_scratchpad}`."
   }
  },
  {
   "t": "h",
   "zh": "二、准备两个工具：搜索 + 算星期几",
   "en": "2. Two tools: search and day of the week"
  },
  {
   "t": "p",
   "zh": "[▶ 02:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=50&t=124) 为了演示，老师先定义了两个工具：\n1. **搜索引擎**：一个背后走谷歌搜索的搜索接口，要先注册拿到 API key（注册方法他写在文档里，课上没讲，key 也在画面里隐去了）；\n2. **自己写的小工具**：给它一个日期字符串，算出那天是星期几。\n\n他强调这两个工具只是为了演示：一个能上网查东西，一个能把日期换成星期几。\n\n本课程没有搜索 key，所以讲义把搜索换成一个**模拟搜索**：只在几条写好的示例摘要里按关键词查找。对智能体来说它和真搜索没有区别——都是「输入一个问题，返回一段文字」。",
   "en": "[▶ 02:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=50&t=124) For the demo, the instructor first defines two tools:\n1. **A search engine**: a search API backed by Google search; you have to register for an API key first (he put the sign-up steps in his notes and skipped them in class; the key is hidden on screen);\n2. **A small tool of his own**: give it a date string and it works out the day of the week.\n\nHe stresses that the two tools are only for the demo: one can look things up online, the other turns a date into a day of the week.\n\nThis course has no search key, so the notes replace the search with a **mock search**: it only looks up keywords in a few pre-written sample snippets. To the agent it is no different from a real search – both take a question and return a piece of text."
  },
  {
   "t": "py",
   "title": {
    "zh": "`datetime`：日期字符串 → 星期几",
    "en": "`datetime`: from a date string to a weekday"
   },
   "zh": "老师的第二个工具要把 `\"2024-07-26\"` 这样的字符串变成「星期五」。Python 自带的 `datetime` 模块就能做到：\n- `datetime.strptime(文字, 格式)`：按格式把字符串**解析**成日期对象。格式里 `%Y` 是四位年份，`%m` 是月，`%d` 是日，中间的 `-` 原样对应。\n- `日期.weekday()`：返回 0–6，**星期一是 0**，星期日是 6。拿它当下标，去一个「星期名称」列表里取值就行（列表下标见 06 节）。\n- 字符串和格式对不上时，`strptime` 报 `ValueError`。工具里最好用 `try/except`（07 节）接住，返回一句提示，而不是让整个智能体崩溃。\n- 反过来，`日期.strftime(格式)` 把日期对象**格式化**成字符串。",
   "en": "The instructor's second tool turns a string like `\"2024-07-26\"` into “Friday”. Python's built-in `datetime` module does this:\n- `datetime.strptime(text, format)` **parses** a string into a date object. In the format, `%Y` is the four-digit year, `%m` the month, `%d` the day; the `-` characters must match literally.\n- `date.weekday()` returns 0–6, **Monday is 0** and Sunday is 6. Use it as an index into a list of day names (list indexing: lesson 06).\n- When the string does not match the format, `strptime` raises `ValueError`. A tool should catch it with `try/except` (lesson 07) and return a hint, instead of crashing the whole agent.\n- The other way round, `date.strftime(format)` **formats** a date object as a string.",
   "code": {
    "zh": "from datetime import datetime\n\nWEEKDAYS = [\"星期一\", \"星期二\", \"星期三\", \"星期四\", \"星期五\", \"星期六\", \"星期日\"]\n\nd = datetime.strptime(\"2024-07-26\", \"%Y-%m-%d\")   # 字符串 → 日期对象\nprint(d.year, d.month, d.day)                        # 2024 7 26\nprint(d.weekday())                                   # 4（星期一是 0）\nprint(WEEKDAYS[d.weekday()])                         # 星期五\nprint(d.strftime(\"%Y年%m月%d日\"))                    # 日期对象 → 字符串：2024年07月26日\n\ndef weekday(date_str):\n    try:\n        d = datetime.strptime(date_str.strip(), \"%Y-%m-%d\")\n    except ValueError:                               # 格式不对：返回提示，不让程序崩溃\n        return \"日期格式不对，请用 YYYY-MM-DD\"\n    return WEEKDAYS[d.weekday()]\n\nprint(weekday(\" 2024-12-25 \"))    # strip() 先去掉两头的空格 → 星期三\nprint(weekday(\"2024年7月26日\"))   # → 日期格式不对，请用 YYYY-MM-DD",
    "en": "from datetime import datetime\n\nWEEKDAYS = [\"Monday\", \"Tuesday\", \"Wednesday\", \"Thursday\", \"Friday\", \"Saturday\", \"Sunday\"]\n\nd = datetime.strptime(\"2024-07-26\", \"%Y-%m-%d\")   # string -> date object\nprint(d.year, d.month, d.day)                        # 2024 7 26\nprint(d.weekday())                                   # 4 (Monday is 0)\nprint(WEEKDAYS[d.weekday()])                         # Friday\nprint(d.strftime(\"%d %B %Y\"))                        # date object -> string: 26 July 2024\n\ndef weekday(date_str):\n    try:\n        d = datetime.strptime(date_str.strip(), \"%Y-%m-%d\")\n    except ValueError:                               # wrong format: return a hint instead of crashing\n        return \"Bad date format, use YYYY-MM-DD\"\n    return WEEKDAYS[d.weekday()]\n\nprint(weekday(\" 2024-12-25 \"))    # strip() removes the spaces at both ends -> Wednesday\nprint(weekday(\"26/07/2024\"))      # -> Bad date format, use YYYY-MM-DD"
   }
  },
  {
   "t": "p",
   "zh": "在这两个函数上面加 `@tool`（45 节）就成了工具。注意 docstring：模型只能靠它知道「什么时候用这个工具、输入要写成什么样」，所以 `weekday` 的说明里写清了日期格式。练习文件 `practice/l49_tools.py` 是同样的代码，只是中英文关键词都能查到：",
   "en": "Put `@tool` (lesson 45) above the two functions and they become tools. Mind the docstrings: they are all the model knows about when to use a tool and how to write its input, so `weekday`'s docstring spells out the date format. The practice file `practice/l49_tools.py` is the same code, except that it finds both Chinese and English keywords:"
  },
  {
   "t": "code",
   "file": {
    "zh": "l49_tools.py（简化版）",
    "en": "l49_tools.py (simplified)"
   },
   "code": {
    "zh": "from datetime import datetime\nfrom langchain_core.tools import tool\n\n# 模拟搜索的「网页摘要」（示例数据）。更具体的关键词放前面：问题里同时出现两个名字时，先匹配到徐帆\nFAKE_PAGES = {\n    \"徐帆\": \"徐帆，中国女演员，冯小刚的妻子，主演过电影《唐山大地震》（2010）和《一九四二》（2012）。\",\n    \"冯小刚\": \"冯小刚，中国导演，代表作有《甲方乙方》《唐山大地震》。他的妻子是演员徐帆。\",\n    \"奥运\": \"2024 年巴黎奥运会开幕式于 2024 年 7 月 26 日晚在塞纳河上举行。\",\n}\nWEEKDAYS = [\"星期一\", \"星期二\", \"星期三\", \"星期四\", \"星期五\", \"星期六\", \"星期日\"]\n\n@tool\ndef search(query: str) -> str:\n    \"\"\"搜索引擎：查询人物、事件、日期等事实信息。输入是一个搜索问题。\"\"\"\n    for keyword, page in FAKE_PAGES.items():\n        if keyword in query:\n            return page\n    return \"没有找到相关结果。\"\n\n@tool\ndef weekday(date_str: str) -> str:\n    \"\"\"计算某个日期是星期几。输入必须是 YYYY-MM-DD 格式的日期，例如 2024-07-26。\"\"\"\n    try:\n        d = datetime.strptime(date_str.strip(), \"%Y-%m-%d\")\n    except ValueError:\n        return \"日期格式不对，请用 YYYY-MM-DD，例如 2024-07-26。\"\n    return WEEKDAYS[d.weekday()]",
    "en": "from datetime import datetime\nfrom langchain_core.tools import tool\n\n# The mock search's \"web snippets\" (sample data). The more specific keyword comes first: a query naming both people matches Xu Fan first\nFAKE_PAGES = {\n    \"Xu Fan\": \"Xu Fan is a Chinese actress, Feng Xiaogang's wife; she starred in Aftershock (2010) and Back to 1942 (2012).\",\n    \"Feng Xiaogang\": \"Feng Xiaogang is a Chinese film director whose best-known films include The Dream Factory and Aftershock. His wife is the actress Xu Fan.\",\n    \"Olympic\": \"The opening ceremony of the Paris 2024 Olympic Games was held on the Seine on the evening of 26 July 2024.\",\n}\nWEEKDAYS = [\"Monday\", \"Tuesday\", \"Wednesday\", \"Thursday\", \"Friday\", \"Saturday\", \"Sunday\"]\n\n@tool\ndef search(query: str) -> str:\n    \"\"\"Search engine for facts about people, events and dates. The input is a search query.\"\"\"\n    for keyword, page in FAKE_PAGES.items():\n        if keyword in query:\n            return page\n    return \"No results found.\"\n\n@tool\ndef weekday(date_str: str) -> str:\n    \"\"\"Work out the day of the week for a date. The input must be a YYYY-MM-DD date, e.g. 2024-07-26.\"\"\"\n    try:\n        d = datetime.strptime(date_str.strip(), \"%Y-%m-%d\")\n    except ValueError:\n        return \"Bad date format, use YYYY-MM-DD, e.g. 2024-07-26.\"\n    return WEEKDAYS[d.weekday()]"
   }
  },
  {
   "t": "video",
   "zh": "视频里的搜索是真的谷歌搜索。字幕没有念出接口的名字；LangChain 里接谷歌搜索最常见的是 SerpAPI：用 `langchain_community.utilities` 里的 `SerpAPIWrapper`，再用 `Tool(name=\"Search\", func=search.run, description=...)` 包成工具。它需要 `google-search-results` 包和 `SERPAPI_API_KEY` 环境变量，本课程环境都没有。想接真搜索时，只要把上面的 `search` 换掉，后面的代码都不用改。",
   "en": "The search in the video is a real Google search. The subtitles do not name the API; the most common way to use Google search in LangChain is SerpAPI: take `SerpAPIWrapper` from `langchain_community.utilities` and wrap it as a tool with `Tool(name=\"Search\", func=search.run, description=...)`. It needs the `google-search-results` package and the `SERPAPI_API_KEY` environment variable, and this course's environment has neither. To use a real search, just swap out the `search` above; none of the later code needs to change."
  },
  {
   "t": "h",
   "zh": "三、ReAct：想一步，做一步",
   "en": "3. ReAct: think a step, act a step"
  },
  {
   "t": "p",
   "zh": "[▶ 03:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=50&t=188) 有了工具，智能体是这样工作的：\n1. 拿到任务（用户的问题）；\n2. **推理（Reasoning）**：模型想下一步该做什么；\n3. **行动（Acting）**：选一个工具来执行。工具会和外部环境打交道，比如搜索引擎，或者本地的代码运行环境；\n4. **观察（Observation）**：拿到工具的结果，回到第 2 步继续想；\n5. 模型认为任务完成了，就给出答案。\n\nReasoning + Acting，合起来就是 **ReAct**。这和 07 节你手写的循环是同一回事，只不过现在由 LangChain 来跑。",
   "en": "[▶ 03:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=50&t=188) With tools in place, the agent works like this:\n1. It receives the task (the user's question);\n2. **Reasoning**: the model decides what to do next;\n3. **Acting**: it picks a tool and runs it. Tools deal with the outside world, such as a search engine or the local code environment;\n4. **Observation**: it reads the tool's result and goes back to step 2;\n5. When the model decides the task is done, it gives the answer.\n\nReasoning + Acting is **ReAct**. It is the same loop you hand-wrote in lesson 07; this time LangChain runs it."
  },
  {
   "t": "h",
   "zh": "四、ReAct 提示词：从 LangChain Hub 下载",
   "en": "4. The ReAct prompt from LangChain Hub"
  },
  {
   "t": "p",
   "zh": "[▶ 04:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=50&t=249) 模型要「先想、再选工具」，得靠提示词告诉它。老师没有自己写，而是从 **LangChain Hub**（LangChain 官方存放、分享提示词的网站）下载了官方的 ReAct 演示模板（它在 Hub 上的名字是 `hwchase17/react`）。他也说这个提示词很简单，毕竟是个玩具级的应用。模板全文如下（本机下载核对过）：",
   "en": "[▶ 04:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=50&t=249) For the model to “think first, then pick a tool”, the prompt has to tell it so. The instructor did not write one himself; he downloaded the official ReAct demo template from **LangChain Hub** (LangChain's official site for storing and sharing prompts); its name on the Hub is `hwchase17/react`. He also says the prompt is very simple – after all, this is a toy-level application. Here is the full template (downloaded and checked here):"
  },
  {
   "t": "code",
   "file": "hwchase17/react",
   "lang": "text",
   "code": "Answer the following questions as best you can. You have access to the following tools:\n\n{tools}\n\nUse the following format:\n\nQuestion: the input question you must answer\nThought: you should always think about what to do\nAction: the action to take, should be one of [{tool_names}]\nAction Input: the input to the action\nObservation: the result of the action\n... (this Thought/Action/Action Input/Observation can repeat N times)\nThought: I now know the final answer\nFinal Answer: the final answer to the original input question\n\nBegin!\n\nQuestion: {input}\nThought:{agent_scratchpad}"
  },
  {
   "t": "p",
   "zh": "它做了三件事：列出可用的工具；规定输出格式——`Thought` 想、`Action` 选工具、`Action Input` 给工具的输入、`Observation` 工具的结果，可以重复多轮，最后写 `Final Answer`；末尾放上用户的问题和到目前为止的过程。四个占位符由不同的角色来填：\n\n| 占位符 | 谁来填 | 填什么 |\n|---|---|---|\n| `{tools}` | `create_react_agent` | 每个工具的名字和 docstring |\n| `{tool_names}` | `create_react_agent` | 工具名，用逗号隔开 |\n| `{input}` | 你调用时传入 | 用户的问题 |\n| `{agent_scratchpad}` | `AgentExecutor` 每一轮更新 | 之前每一步的 Thought / Action / Observation（短期记忆） |",
   "en": "It does three things: lists the available tools; fixes the output format – `Thought` to think, `Action` to pick a tool, `Action Input` for the tool's input, `Observation` for its result, repeatable, ending with `Final Answer`; and puts the user's question and the progress so far at the end. Each placeholder is filled by a different party:\n\n| Placeholder | Filled by | With |\n|---|---|---|\n| `{tools}` | `create_react_agent` | Each tool's name and docstring |\n| `{tool_names}` | `create_react_agent` | The tool names, comma-separated |\n| `{input}` | You, when you call it | The user's question |\n| `{agent_scratchpad}` | `AgentExecutor`, every round | Every earlier Thought / Action / Observation (short-term memory) |"
  },
  {
   "t": "warn",
   "zh": "视频用的是 LangChain 0.x，那时从 Hub 下载的写法是 `from langchain import hub` 加 `hub.pull(\"hwchase17/react\")`。这两行在你安装的版本里都走不通（本机实测）：\n- `from langchain import hub` → `ImportError`。1.x 里它搬到了 `langchain_classic.hub`，而且已标记弃用；\n- 改成 `from langchain_classic import hub` 后，`hub.pull(\"hwchase17/react\")` 又报 `ValueError`：为了安全，现在默认**不允许**按「作者/名字」下载别人公开的提示词（下载下来的内容可能夹带模型配置）。\n\n两种替代办法：\n1. 用 LangSmith 的客户端，明确表示你信任这个提示词：`from langsmith import Client`，再 `Client().pull_prompt(\"hwchase17/react\", dangerously_pull_public_prompt=True)`（本机实测能下载，不需要 key）；\n2. **更推荐**：模板就十几行，直接把文字写进代码，用 `PromptTemplate.from_template(...)` 创建。不用联网，也没有安全顾虑。练习文件就是这么做的。",
   "en": "The video uses LangChain 0.x, where downloading from the Hub was `from langchain import hub` plus `hub.pull(\"hwchase17/react\")`. Neither line works on the versions you installed (tested here):\n- `from langchain import hub` → `ImportError`. In 1.x it moved to `langchain_classic.hub`, and it is marked deprecated;\n- after switching to `from langchain_classic import hub`, `hub.pull(\"hwchase17/react\")` raises `ValueError`: for safety, pulling someone else's public prompt by “owner/name” is now **not allowed by default** (a downloaded prompt can carry model configuration).\n\nTwo replacements:\n1. Use the LangSmith client and say explicitly that you trust the prompt: `from langsmith import Client`, then `Client().pull_prompt(\"hwchase17/react\", dangerously_pull_public_prompt=True)` (downloads fine here, no key needed);\n2. **Recommended**: the template is only a dozen or so lines, so put the text straight into your code and build it with `PromptTemplate.from_template(...)`. No network, no security worry. The practice files do this."
  },
  {
   "t": "h",
   "zh": "五、create_react_agent + AgentExecutor",
   "en": "5. create_react_agent + AgentExecutor"
  },
  {
   "t": "p",
   "zh": "[▶ 04:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=50&t=279) 接下来用 LangChain 把三样东西组装起来：模型（视频里是 OpenAI 的模型）、两个工具、上面的提示词。分两步：\n- `create_react_agent(模型, 工具列表, 提示词)`：造出智能体。但它只管**一步**：把提示词填好交给模型，再把模型写的文字解析成「调用某个工具」或「最终答案」。\n- [▶ 05:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=50&t=312) `AgentExecutor(agent=..., tools=...)`：执行器。一个提示词只能让模型想一步，要让智能体真正跑起来，得有人把「想一步 → 执行工具 → 再想一步」串成**循环**：执行工具，把结果作为 `Observation` 写到草稿纸上，再问模型……直到出现 `Final Answer`。这就是执行器的活。\n\n模板文字和视频里的一样，只在末尾加了两句规则（原因见下面的「注意」）：",
   "en": "[▶ 04:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=50&t=279) Next, we use LangChain to put three things together: the model (an OpenAI model in the video), the two tools and the prompt above. Two steps:\n- `create_react_agent(model, tools, prompt)` builds the agent. But it only handles **one step**: fill in the prompt, send it to the model, and parse what the model wrote into “call this tool” or “final answer”.\n- [▶ 05:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=50&t=312) `AgentExecutor(agent=..., tools=...)` is the executor. One prompt only gets the model to think one step; to actually run the agent, something must chain “think → run a tool → think again” into a **loop**: run the tool, write its result onto the scratch paper as an `Observation`, ask the model again… until a `Final Answer` appears. That is the executor's job.\n\nThe template text is the same as in the video; only two rules are added at the end (see the warning below for why):"
  },
  {
   "t": "code",
   "file": {
    "zh": "react_agent.py（对应 practice/l49_react_solution.py）",
    "en": "react_agent.py (see practice/l49_react_solution.py)"
   },
   "code": {
    "zh": "from langchain_classic.agents import AgentExecutor, create_react_agent   # 1.x：旧版智能体在 langchain_classic 里\nfrom langchain_core.prompts import PromptTemplate\nfrom langchain_deepseek import ChatDeepSeek\nfrom l49_tools import search, weekday                                   # 上一部分的两个工具\nfrom llm import API_KEY, MODEL\n\n# hwchase17/react 原文 + 末尾两句规则（\"Look up ...\" 和 \"Write only ...\"，原因见下面的「注意」）\nREACT_TEMPLATE = \"\"\"Answer the following questions as best you can. You have access to the following tools:\n\n{tools}\n\nUse the following format:\n\nQuestion: the input question you must answer\nThought: you should always think about what to do\nAction: the action to take, should be one of [{tool_names}]\nAction Input: the input to the action\nObservation: the result of the action\n... (this Thought/Action/Action Input/Observation can repeat N times)\nThought: I now know the final answer\nFinal Answer: the final answer to the original input question\n\nLook up facts and dates with a tool instead of relying on memory.\nWrite only the next step. If an Observation is already shown below, do not repeat the Question or earlier Actions; continue with a new Thought.\n\nBegin!\n\nQuestion: {input}\nThought:{agent_scratchpad}\"\"\"\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)      # 视频用的是 OpenAI 的模型\ntools = [search, weekday]\nprompt = PromptTemplate.from_template(REACT_TEMPLATE)\n\nagent = create_react_agent(model, tools, prompt)        # 只负责「想下一步」\nexecutor = AgentExecutor(agent=agent, tools=tools,       # 负责循环：调工具、把 Observation 填回去\n                         verbose=True,                   # 打印每一步\n                         handle_parsing_errors=True,     # 模型格式写错时，告诉它让它重写\n                         max_iterations=5)               # 最多 5 轮，防止停不下来\n\nresult = executor.invoke({\"input\": \"2024年巴黎奥运会开幕式是星期几？\"})   # 键是 input\nprint(result[\"output\"])",
    "en": "from langchain_classic.agents import AgentExecutor, create_react_agent   # 1.x: the old agents live in langchain_classic\nfrom langchain_core.prompts import PromptTemplate\nfrom langchain_deepseek import ChatDeepSeek\nfrom l49_tools import search, weekday                                   # the two tools from the previous part\nfrom llm import API_KEY, MODEL\n\n# hwchase17/react word for word + two rules near the end (\"Look up ...\" and \"Write only ...\", see the warning below)\nREACT_TEMPLATE = \"\"\"Answer the following questions as best you can. You have access to the following tools:\n\n{tools}\n\nUse the following format:\n\nQuestion: the input question you must answer\nThought: you should always think about what to do\nAction: the action to take, should be one of [{tool_names}]\nAction Input: the input to the action\nObservation: the result of the action\n... (this Thought/Action/Action Input/Observation can repeat N times)\nThought: I now know the final answer\nFinal Answer: the final answer to the original input question\n\nLook up facts and dates with a tool instead of relying on memory.\nWrite only the next step. If an Observation is already shown below, do not repeat the Question or earlier Actions; continue with a new Thought.\n\nBegin!\n\nQuestion: {input}\nThought:{agent_scratchpad}\"\"\"\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)      # the video uses an OpenAI model\ntools = [search, weekday]\nprompt = PromptTemplate.from_template(REACT_TEMPLATE)\n\nagent = create_react_agent(model, tools, prompt)        # only works out the next step\nexecutor = AgentExecutor(agent=agent, tools=tools,       # runs the loop: call tools, feed Observations back\n                         verbose=True,                   # print every step\n                         handle_parsing_errors=True,     # badly formatted output: tell the model, let it retry\n                         max_iterations=5)               # at most 5 rounds, so it cannot run forever\n\nresult = executor.invoke({\"input\": \"What day of the week was the Paris 2024 Olympics opening ceremony?\"})  # key: input\nprint(result[\"output\"])"
   }
  },
  {
   "t": "video",
   "zh": "视频用的是 LangChain 0.x，那时的导入写法是 `from langchain.agents import AgentExecutor, create_react_agent`。在 1.x 里这样写会报 `ImportError`：`langchain.agents` 里只剩新的 `create_agent` 等接口，旧的智能体搬进了 `langchain_classic` 包（已安装），用法不变。模型方面，视频用 OpenAI 的模型，这里换成 `ChatDeepSeek`。",
   "en": "The video (LangChain 0.x) imports `from langchain.agents import AgentExecutor, create_react_agent`. In 1.x that raises `ImportError`: `langchain.agents` now only holds the new interfaces such as `create_agent`, and the old agents moved into the `langchain_classic` package (installed), used exactly the same way. The video uses an OpenAI model; here it is `ChatDeepSeek`."
  },
  {
   "t": "p",
   "zh": "[▶ 05:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=50&t=344) 视频问的是「2024 年周杰伦的演唱会是星期几」：智能体得先上网搜到演唱会的日期，再用日期工具换算成星期几，正好用上两个工具。我们的模拟搜索里只有示例数据，所以换成同样要走两步的「2024 年巴黎奥运会开幕式是星期几？」。用 deepseek-flash 实际运行，`verbose=True` 打印出来是这样的（去掉了终端颜色）：",
   "en": "[▶ 05:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=50&t=344) The video asks which day of the week Jay Chou's 2024 concert fell on: the agent must first search online for the concert date, then turn it into a weekday with the date tool – exactly the two tools. Our mock search only has sample data, so we switch to a question that also takes two steps: “What day of the week was the Paris 2024 Olympics opening ceremony?”. A real run with deepseek-flash (with the question in Chinese, as in the practice file) prints this with `verbose=True` (terminal colours removed):"
  },
  {
   "t": "code",
   "file": {
    "zh": "verbose 输出（本地实测）",
    "en": "verbose output (real run)"
   },
   "lang": "text",
   "code": {
    "zh": "> Entering new AgentExecutor chain...\nThought: 我需要先确认2024年巴黎奥运会开幕式的日期，然后计算该日期是星期几。\n\nAction: search\nAction Input: 2024年巴黎奥运会开幕式 日期\n2024 年巴黎奥运会开幕式于 2024 年 7 月 26 日晚在塞纳河上举行。      ← Observation：工具结果\nAction: weekday\nAction Input: 2024-07-26\n星期五 Friday                                                        ← Observation\nFinal Answer: 2024年巴黎奥运会开幕式是星期五。\n\n> Finished chain.",
    "en": "> Entering new AgentExecutor chain...\nThought: 我需要先确认2024年巴黎奥运会开幕式的日期，然后计算该日期是星期几。\n         (I first need the date of the Paris 2024 opening ceremony, then work out its weekday.)\n\nAction: search\nAction Input: 2024年巴黎奥运会开幕式 日期\n2024 年巴黎奥运会开幕式于 2024 年 7 月 26 日晚在塞纳河上举行。      ← Observation: the tool's result (26 July 2024)\nAction: weekday\nAction Input: 2024-07-26\n星期五 Friday                                                        ← Observation\nFinal Answer: 2024年巴黎奥运会开幕式是星期五。  (It was a Friday.)\n\n> Finished chain."
   }
  },
  {
   "t": "p",
   "zh": "对照模板来读：每一轮模型写出 `Action` 和 `Action Input` 后就停下（`create_react_agent` 让模型一写到 `Observation` 就停），`AgentExecutor` 去执行工具，把结果当作 `Observation` 接上去，再请模型继续。这次一共调用了 3 次模型：查日期 → 算星期 → 给答案。",
   "en": "Read it against the template: each round the model stops after writing `Action` and `Action Input` (`create_react_agent` makes it stop as soon as it reaches `Observation`); `AgentExecutor` runs the tool, appends the result as the `Observation` and asks the model to go on. This run took 3 model calls: find the date → work out the weekday → answer."
  },
  {
   "t": "warn",
   "zh": "[▶ 06:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=50&t=379) 视频里第一次运行就出了岔子：智能体少用了一个工具（没用日期工具换算），老师重新运行时又遇到了问题，排查一会儿后讲完意思就继续往下了。这说明「靠文字格式」的智能体很脆弱：模型稍微不按格式写，或者自作主张跳过工具，结果就不可靠。我们用 deepseek-flash 实测时也遇到过：模板里如果没有「每次只写下一步」那句，模型每一轮都从 `Question:` 重新写起、反复调用同一个工具，停不下来。所以：\n- 模板末尾加上「事实要用工具查」「每次只写下一步」两句规则；\n- 一定要设置 `max_iterations`；\n- 打开 `handle_parsing_errors=True`：格式出错时把错误告诉模型让它重写，而不是直接抛异常。",
   "en": "[▶ 06:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=50&t=379) In the video the first run goes wrong: the agent skips one tool (it never uses the date tool), and when the instructor re-runs it he hits another problem, looks into it briefly, makes his point and moves on. That shows how fragile “text-format” agents are: if the model drifts from the format or decides to skip a tool, the result cannot be trusted. We saw it with deepseek-flash too: without the “write only the next step” rule, the model restarted from `Question:` every round and called the same tool over and over, never stopping. So:\n- add the two rules “look facts up with a tool” and “write only the next step” near the end of the template;\n- always set `max_iterations`;\n- turn on `handle_parsing_errors=True`: on a format error the model is told and retries, instead of an exception ending the run."
  },
  {
   "t": "check",
   "q": {
    "zh": "在视频的写法里，`create_react_agent` 和 `AgentExecutor` 是怎么分工的？",
    "en": "In the video's code, how do `create_react_agent` and `AgentExecutor` split the work?"
   },
   "options": [
    {
     "zh": "`create_react_agent` 负责循环和执行工具，`AgentExecutor` 负责想下一步",
     "en": "`create_react_agent` runs the loop and the tools; `AgentExecutor` decides the next step"
    },
    {
     "zh": "两个做的是同一件事，任选一个就行",
     "en": "They do the same thing; use either"
    },
    {
     "zh": "`create_react_agent` 让模型想出下一步并解析成动作；`AgentExecutor` 负责循环：执行工具、把 Observation 填回去，直到 Final Answer",
     "en": "`create_react_agent` has the model decide the next step and parses it into an action; `AgentExecutor` runs the loop: run tools, feed back Observations, until Final Answer"
    },
    {
     "zh": "`AgentExecutor` 负责下载提示词",
     "en": "`AgentExecutor` downloads the prompt"
    }
   ],
   "answer": 2,
   "explain": {
    "zh": "`create_react_agent` 返回的只是「提示词 → 模型 → 解析」这一步；`AgentExecutor` 把这一步放进循环，还负责执行工具、维护草稿纸。",
    "en": "`create_react_agent` returns just the “prompt → model → parse” step; `AgentExecutor` puts that step in a loop, runs the tools and keeps the scratch paper."
   }
  },
  {
   "t": "h",
   "zh": "六、另一种模式：Self-Ask with Search",
   "en": "6. Another pattern: Self-Ask with Search"
  },
  {
   "t": "p",
   "zh": "[▶ 07:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=50&t=424) 老师演示的第二种智能体只有**一个工具：搜索**。遇到问题时它不急着回答，而是不断给自己提**追问**，每个追问都去搜索，拿到「中间答案」后再提下一个追问，有点像递归，直到能回答原来的问题。\n\n[▶ 07:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=50&t=457) 他举的例子是「冯小刚的老婆演过什么电影」：\n1. 追问：冯小刚的老婆是谁？→ 搜索 → 徐帆\n2. 追问：徐帆演过什么电影？→ 搜索 → 电影名单\n3. 给出最终答案\n\n这个模板也是 LangChain 现成的（Hub 上叫 `hwchase17/self-ask-with-search`）。它用几个完整的例子教模型照着写（few-shot），最后一行留给你的问题。其中一个例子和结尾长这样：",
   "en": "[▶ 07:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=50&t=424) The instructor's second agent has **only one tool: search**. Faced with a question, it does not rush to answer; it keeps asking itself **follow-up questions**, searches each one, and after getting the “intermediate answer” asks the next follow-up – a bit like recursion – until it can answer the original question.\n\n[▶ 07:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=50&t=457) His example is “what films has Feng Xiaogang's wife acted in”:\n1. Follow-up: who is Feng Xiaogang's wife? → search → Xu Fan\n2. Follow-up: what films has Xu Fan acted in? → search → a list of films\n3. Give the final answer\n\nThis template is also ready-made in LangChain (on the Hub it is `hwchase17/self-ask-with-search`). It teaches the model with several complete examples to imitate (few-shot), and leaves the last line for your question. One of the examples plus the ending look like this:"
  },
  {
   "t": "code",
   "file": {
    "zh": "self-ask 模板（节选）",
    "en": "self-ask template (excerpt)"
   },
   "lang": "text",
   "code": "Question: When was the founder of craigslist born?\nAre follow up questions needed here: Yes.\nFollow up: Who was the founder of craigslist?\nIntermediate answer: Craigslist was founded by Craig Newmark.\nFollow up: When was Craig Newmark born?\nIntermediate answer: Craig Newmark was born on December 6, 1952.\nSo the final answer is: December 6, 1952\n\nQuestion: {input}\nAre followup questions needed here:{agent_scratchpad}"
  },
  {
   "t": "p",
   "zh": "[▶ 08:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=50&t=491) 老师特别指出：这个搜索工具的名字是固定的，被模板写死了。看上面的模板就明白原因：搜索结果那一行固定以 **Intermediate answer:** 开头，程序就按这个名字去找工具。本机核对 `create_self_ask_with_search_agent` 的源码，它有两条硬性要求，不满足就报 `ValueError`：\n- 只能有**一个**工具；\n- 工具名必须是 `\"Intermediate Answer\"`。名字里有空格，不能当函数名，所以这里用 `Tool(name=..., func=..., description=...)` 包装，而不是 `@tool`。\n\n视频里这次运行很顺利：第一个追问是「冯小刚的老婆是谁」，搜到徐帆；第二个追问是「徐帆演过哪些电影」，再搜一次，然后给出最终答案。",
   "en": "[▶ 08:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=50&t=491) The instructor points out that this search tool's name is fixed: the template hard-codes it. The template above shows why: the search-result line always starts with **Intermediate answer:**, and the program finds the tool by that name. Checking the source of `create_self_ask_with_search_agent` here, it has two hard rules and raises `ValueError` if either is broken:\n- there can be only **one** tool;\n- the tool's name must be `\"Intermediate Answer\"`. The name contains a space, so it cannot be a function name; that is why it is wrapped with `Tool(name=..., func=..., description=...)` here instead of `@tool`.\n\nIn the video this run goes smoothly: the first follow-up is “who is Feng Xiaogang's wife”, which finds Xu Fan; the second is “what films has Xu Fan acted in”, searched again, and then comes the final answer."
  },
  {
   "t": "code",
   "file": {
    "zh": "self_ask.py（对应 practice/l49_self_ask.py）",
    "en": "self_ask.py (see practice/l49_self_ask.py)"
   },
   "code": {
    "zh": "from langchain_classic.agents import AgentExecutor, create_self_ask_with_search_agent\nfrom langchain_core.prompts import PromptTemplate\nfrom langchain_core.tools import Tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom l49_self_ask import SELF_ASK_TEMPLATE      # 模板较长（几个完整的例子），放在练习文件里\nfrom l49_tools import search\nfrom llm import API_KEY, MODEL\n\nsearch_tool = Tool(\n    name=\"Intermediate Answer\",                  # 名字是模板写死的，带空格，所以不用 @tool\n    func=search.invoke,                          # 真正干活的还是我们的搜索\n    description=\"搜索引擎，用来回答追问\",\n)\n\n# 关闭思考模式，让模型照着例子往下写（原因见下面的实测记录）\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY, extra_body={\"thinking\": {\"type\": \"disabled\"}})\nprompt = PromptTemplate.from_template(SELF_ASK_TEMPLATE)\nagent = create_self_ask_with_search_agent(model, [search_tool], prompt)   # 只能有一个工具\nexecutor = AgentExecutor(\n    agent=agent, tools=[search_tool], verbose=True, max_iterations=5,\n    handle_parsing_errors='Wrong format. End with a line \"Follow up: ...\" or \"So the final answer is: ...\".',\n)\n\nresult = executor.invoke({\"input\": \"冯小刚的老婆演过什么电影？\"})\nprint(result[\"output\"])",
    "en": "from langchain_classic.agents import AgentExecutor, create_self_ask_with_search_agent\nfrom langchain_core.prompts import PromptTemplate\nfrom langchain_core.tools import Tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom l49_self_ask import SELF_ASK_TEMPLATE      # the template is long (several worked examples): kept in the practice file\nfrom l49_tools import search\nfrom llm import API_KEY, MODEL\n\nsearch_tool = Tool(\n    name=\"Intermediate Answer\",                  # fixed by the template; it has a space, so no @tool here\n    func=search.invoke,                          # the real work is still done by our search\n    description=\"A search engine for answering follow-up questions\",\n)\n\n# thinking switched off so the model continues the examples (see the test note below)\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY, extra_body={\"thinking\": {\"type\": \"disabled\"}})\nprompt = PromptTemplate.from_template(SELF_ASK_TEMPLATE)\nagent = create_self_ask_with_search_agent(model, [search_tool], prompt)   # exactly one tool allowed\nexecutor = AgentExecutor(\n    agent=agent, tools=[search_tool], verbose=True, max_iterations=5,\n    handle_parsing_errors='Wrong format. End with a line \"Follow up: ...\" or \"So the final answer is: ...\".',\n)\n\nresult = executor.invoke({\"input\": \"What films has Feng Xiaogang's wife acted in?\"})\nprint(result[\"output\"])"
   }
  },
  {
   "t": "warn",
   "zh": "**实测记录。** 我们先用模板原文 + deepseek-flash（默认的思考模式）运行。第一个追问很正常：搜「冯小刚的老婆是谁」，拿到「徐帆」。但接下来模型没有写 `Follow up:` 或 `So the final answer is:`，而是凭自己的记忆直接写了一大段电影名单（内容也未必准确）。解析器只看回复的**最后一行**，那里既没有追问也没有最终答案，于是认不出来；`handle_parsing_errors` 让它重写，它还是照旧，直到 `max_iterations` 用完，最后只得到 `Agent stopped due to iteration limit or time limit.`。\n\n所以上面的代码和练习文件做了三处改动：模板开头加了三行格式要求（照例子的格式写、最后一行必须是追问或最终答案、事实只能来自搜索结果）、关闭思考模式、解析失败时把正确的格式告诉模型。三处改动一起用，再次实测就成功了，一共调用 3 次模型（见下面的输出）。不过这只说明「这一次」模型听话了：这类靠文字格式的智能体，成败很依赖模型是否严格照格式写。",
   "en": "**Test notes.** We first ran the original template with deepseek-flash (thinking mode on, the default). The first follow-up went fine: it searched “who is Feng Xiaogang's wife” and got “Xu Fan”. But then, instead of writing `Follow up:` or `So the final answer is:`, the model wrote out a long list of films from its own memory (not necessarily accurate). The parser only looks at the **last line** of the reply, which held neither a follow-up nor a final answer, so it could not recognise it; `handle_parsing_errors` had the model rewrite it, but it did the same again until `max_iterations` ran out, leaving only `Agent stopped due to iteration limit or time limit.`.\n\nSo the code above and the practice file make three changes: three lines of format rules at the top of the template (follow the examples' format, the last line must be a follow-up or the final answer, facts may only come from search results), thinking mode switched off, and the correct format told to the model when parsing fails. With all three changes together, the rerun succeeded, with 3 model calls in all (see the output below). But that only shows the model behaved “this time”: whether a text-format agent like this works depends heavily on the model sticking strictly to the format."
  },
  {
   "t": "code",
   "file": {
    "zh": "verbose 输出（改动后本地实测）",
    "en": "verbose output (real run after the changes, question asked in Chinese)"
   },
   "lang": "text",
   "code": {
    "zh": "> Entering new AgentExecutor chain...\nYes.\nFollow up: 冯小刚的老婆是谁？\n冯小刚，中国导演，代表作有《甲方乙方》《唐山大地震》。他的妻子是演员徐帆。      ← Intermediate answer：搜索结果\nFollow up: 徐帆演过什么电影？\n徐帆，中国女演员，冯小刚的妻子，主演过电影《唐山大地震》（2010）和《一九四二》（2012）。\nSo the final answer is: 《唐山大地震》（2010）和《一九四二》（2012）\n\n> Finished chain.",
    "en": "> Entering new AgentExecutor chain...\nYes.\nFollow up: 冯小刚的老婆是谁？   (Who is Feng Xiaogang's wife?)\n冯小刚，中国导演，代表作有《甲方乙方》《唐山大地震》。他的妻子是演员徐帆。      ← Intermediate answer: the search result (his wife is Xu Fan)\nFollow up: 徐帆演过什么电影？   (What films has Xu Fan acted in?)\n徐帆，中国女演员，冯小刚的妻子，主演过电影《唐山大地震》（2010）和《一九四二》（2012）。\nSo the final answer is: 《唐山大地震》（2010）和《一九四二》（2012）   (Aftershock (2010) and Back to 1942 (2012))\n\n> Finished chain."
   }
  },
  {
   "t": "p",
   "zh": "[▶ 08:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=50&t=522) 两种模式对比，老师的结论是第一种更常用：\n\n| | ReAct | Self-Ask with Search |\n|---|---|---|\n| 工具 | 任意多个 | 只能有一个搜索工具，名字固定 |\n| 每一步 | 想 → 选工具 → 看结果 | 提一个追问 → 搜索 → 看中间答案 |\n| 适合 | 各种任务，更通用 | 需要多级推理的问题，像在知识图谱上从一个节点走到下一个节点 |",
   "en": "[▶ 08:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=50&t=522) Comparing the two patterns, the instructor concludes that the first is more common:\n\n| | ReAct | Self-Ask with Search |\n|---|---|---|\n| Tools | Any number | Exactly one search tool, with a fixed name |\n| Each step | Think → pick a tool → read the result | Ask a follow-up → search → read the intermediate answer |\n| Good for | All kinds of tasks, more general | Questions that need multi-hop reasoning, like walking a knowledge graph from one node to the next |"
  },
  {
   "t": "check",
   "q": {
    "zh": "下面哪个问题最适合用 Self-Ask with Search？",
    "en": "Which question suits Self-Ask with Search best?"
   },
   "options": [
    {
     "zh": "帮我查北京的天气，再把结果发邮件给同事",
     "en": "Look up Beijing's weather and email it to a colleague"
    },
    {
     "zh": "把一段英文翻译成中文",
     "en": "Translate a paragraph from English to Chinese"
    },
    {
     "zh": "计算 123 × 456",
     "en": "Work out 123 × 456"
    },
    {
     "zh": "《三体》作者的家乡在哪个省？",
     "en": "Which province is the author of The Three-Body Problem from?"
    }
   ],
   "answer": 3,
   "explain": {
    "zh": "「某作品的作者的家乡」要先查出作者，再查作者的家乡，正是一层层追问、每层都靠搜索的多级推理。要用好几种工具的任务（查天气 + 发邮件）用 ReAct；翻译和计算不需要搜索。",
    "en": "“The hometown of the author of a book” means finding the author first, then the author's hometown – multi-hop questions answered by searching at each step. Tasks needing several kinds of tools (weather + email) suit ReAct; translating and arithmetic need no search."
   }
  },
  {
   "t": "h",
   "zh": "七、补充：今天的写法 create_agent",
   "en": "7. Extra: today's way, create_agent"
  },
  {
   "t": "note",
   "title": {
    "zh": "📝 补充：视频之外",
    "en": "📝 Extra: beyond the video"
   },
   "zh": "视频到上一部分就结束了。上面两种智能体都靠模型写出特定格式的**文字**、再由程序解析，所以很脆弱。LangChain 1.x 推荐的 `create_agent`（第 25、39 节已经用过）让模型通过结构化的 `tool_calls` 请求工具（05、45 节）：不需要 ReAct 模板，也不需要解析文字。同样的两个工具：",
   "en": "The video ends with the previous part. Both agents above rely on the model writing **text** in a set format that a program then parses, which is fragile. `create_agent`, which LangChain 1.x recommends (already used in lessons 25 and 39), lets the model request tools through structured `tool_calls` (lessons 05 and 45): no ReAct template, no text parsing. The same two tools:"
  },
  {
   "t": "code",
   "file": {
    "zh": "create_agent.py（对应 practice/l49_create_agent.py）",
    "en": "create_agent.py (see practice/l49_create_agent.py)"
   },
   "code": {
    "zh": "from langchain.agents import create_agent\nfrom langchain_deepseek import ChatDeepSeek\nfrom l49_tools import search, weekday\nfrom llm import API_KEY, MODEL\n\nagent = create_agent(\n    model=ChatDeepSeek(model=MODEL, api_key=API_KEY),\n    tools=[search, weekday],                     # 同样的两个工具\n    system_prompt=\"你是一个简洁的助手。事实和日期要用 search 查，星期几要用 weekday 算，不要凭记忆。\",\n)\nout = agent.invoke({\"messages\": [{\"role\": \"user\", \"content\": \"2024年巴黎奥运会开幕式是星期几？\"}]})\nprint(out[\"messages\"][-1].content)               # 最后一条消息就是最终回答\n\nfor m in out[\"messages\"]:                        # 逐条看过程\n    if m.type == \"ai\" and m.tool_calls:          # 先判断类型：HumanMessage 根本没有 tool_calls 属性\n        for call in m.tool_calls:\n            print(\"[AI 要调用工具]\", call[\"name\"], call[\"args\"])   # args 已经是字典\n    elif m.type == \"tool\":\n        print(\"[工具结果]\", m.name, \"->\", m.content)\n    else:\n        print(f\"[{m.type}]\", m.content)",
    "en": "from langchain.agents import create_agent\nfrom langchain_deepseek import ChatDeepSeek\nfrom l49_tools import search, weekday\nfrom llm import API_KEY, MODEL\n\nagent = create_agent(\n    model=ChatDeepSeek(model=MODEL, api_key=API_KEY),\n    tools=[search, weekday],                     # the same two tools\n    system_prompt=\"You are a concise assistant. Look facts and dates up with search, work out weekdays with weekday; never rely on memory.\",\n)\nout = agent.invoke({\"messages\": [{\"role\": \"user\", \"content\": \"What day of the week was the Paris 2024 Olympics opening ceremony?\"}]})\nprint(out[\"messages\"][-1].content)               # the last message is the final answer\n\nfor m in out[\"messages\"]:                        # walk through the steps\n    if m.type == \"ai\" and m.tool_calls:          # check the type first: HumanMessage has no tool_calls at all\n        for call in m.tool_calls:\n            print(\"[AI tool call]\", call[\"name\"], call[\"args\"])     # args is already a dict\n    elif m.type == \"tool\":\n        print(\"[tool result]\", m.name, \"->\", m.content)\n    else:\n        print(f\"[{m.type}]\", m.content)"
   }
  },
  {
   "t": "p",
   "zh": "`out[\"messages\"]` 是完整的消息记录，和 06 节手写的消息列表是同一个东西。按部就班时是：`HumanMessage`（问题）→ `AIMessage`（tool_calls：search）→ `ToolMessage`（搜索结果）→ `AIMessage`（tool_calls：weekday）→ `ToolMessage`（星期五）→ `AIMessage`（最终回答）。我们用 deepseek-flash 实测时，模型在第一条 `AIMessage` 里就**同时**请求了 search 和 weekday（日期它自己记得），于是记录变成 Human → AI（两个 tool_calls）→ Tool → Tool → AI，只调用了 2 次模型。所以打印过程时要像上面那样遍历 `m.tool_calls`，不要假设每次只有一个。系统提示词不在记录里：每次调用模型时临时放在最前面。新旧写法对照：\n\n| | 视频：`create_react_agent` + `AgentExecutor` | 1.x：`create_agent` |\n|---|---|---|\n| 从哪导入 | `langchain_classic.agents` | `langchain.agents` |\n| 提示词 | 需要 ReAct 模板（4 个占位符） | 一句 `system_prompt` 就够 |\n| 模型怎么要工具 | 写 `Action:` 文字，程序解析 | 返回结构化的 `tool_calls` |\n| 工具参数 | 一个字符串 | 任意多个带类型的参数 |\n| 输入 → 回答 | `{\"input\": ...}` → `result[\"output\"]` | `{\"messages\": [...]}` → `out[\"messages\"][-1].content` |\n| 防止死循环 | `max_iterations=5` | `middleware=[ModelCallLimitMiddleware(run_limit=5)]` |\n| 底层 | 一个 Python 循环（对应 07 节） | 一张 LangGraph 图（第 25 节起） |",
   "en": "`out[\"messages\"]` is the full message record – the same thing as the message list you hand-wrote in lesson 06. Strictly step by step it would be: `HumanMessage` (the question) → `AIMessage` (tool_calls: search) → `ToolMessage` (the search result) → `AIMessage` (tool_calls: weekday) → `ToolMessage` (Friday) → `AIMessage` (the final answer). When we tested with deepseek-flash, the model requested search and weekday **at the same time** in the first `AIMessage` (it remembered the date itself), so the record became Human → AI (two tool_calls) → Tool → Tool → AI, with only 2 model calls. That is why the code above loops over `m.tool_calls` when printing the steps, instead of assuming there is only one each time. The system prompt is not in the record: it is added at the front temporarily each time the model is called. Old vs new:\n\n| | The video: `create_react_agent` + `AgentExecutor` | 1.x: `create_agent` |\n|---|---|---|\n| Import from | `langchain_classic.agents` | `langchain.agents` |\n| Prompt | A ReAct template (4 placeholders) | One `system_prompt` is enough |\n| How the model asks for a tool | Writes `Action:` text that the program parses | Returns structured `tool_calls` |\n| Tool arguments | One string | Any number of typed arguments |\n| Input → answer | `{\"input\": ...}` → `result[\"output\"]` | `{\"messages\": [...]}` → `out[\"messages\"][-1].content` |\n| Guard against endless loops | `max_iterations=5` | `middleware=[ModelCallLimitMiddleware(run_limit=5)]` |\n| Underneath | A Python loop (lesson 07) | A LangGraph graph (from lesson 25 on) |"
  }
 ],
 "quiz": [
  {
   "q": {
    "zh": "按视频的说法，下面哪一项是智能体**可选**的要素？",
    "en": "According to the video, which ingredient of an agent is **optional**?"
   },
   "options": [
    {
     "zh": "工具集",
     "en": "A toolset"
    },
    {
     "zh": "规划和推理能力",
     "en": "Planning and reasoning"
    },
    {
     "zh": "长期记忆，比如多轮对话的历史",
     "en": "Long-term memory, such as multi-turn chat history"
    },
    {
     "zh": "记录这次任务每一步的短期记忆",
     "en": "Short-term memory of this task's steps"
    }
   ],
   "answer": 2,
   "explain": {
    "zh": "老师说工具和规划推理是必需的，短期记忆（思考过程）肯定有；长期记忆用来存多轮对话，是可选的。",
    "en": "The instructor says tools and planning/reasoning are required, and short-term memory (the reasoning trail) is always there; long-term memory, used to store multi-turn chats, is optional."
   }
  },
  {
   "q": {
    "zh": "ReAct 模板里的 `{agent_scratchpad}` 会被填成什么？",
    "en": "What fills `{agent_scratchpad}` in the ReAct template?"
   },
   "options": [
    {
     "zh": "之前每一步的 Thought / Action / Action Input / Observation",
     "en": "Every earlier Thought / Action / Action Input / Observation"
    },
    {
     "zh": "所有工具的名字和说明",
     "en": "All tools' names and descriptions"
    },
    {
     "zh": "用户的问题",
     "en": "The user's question"
    },
    {
     "zh": "模型的系统提示词",
     "en": "The model's system prompt"
    }
   ],
   "answer": 0,
   "explain": {
    "zh": "`AgentExecutor` 每一轮都把已经做过的步骤和工具结果写进这里，相当于草稿纸（短期记忆）。工具说明填进 `{tools}`，问题填进 `{input}`。",
    "en": "Each round `AgentExecutor` writes the steps so far and their results here – the scratch paper (short-term memory). Tool descriptions go into `{tools}`, the question into `{input}`."
   }
  },
  {
   "q": {
    "zh": "在 1.x 里照视频写 `hub.pull(\"hwchase17/react\")`（已改成从 `langchain_classic` 导入 `hub`），会怎样？",
    "en": "On 1.x, what happens with the video's `hub.pull(\"hwchase17/react\")` (with `hub` imported from `langchain_classic`)?"
   },
   "options": [
    {
     "zh": "正常下载模板",
     "en": "It downloads the template normally"
    },
    {
     "zh": "要先设置 LangSmith 的 API key 才行",
     "en": "It needs a LangSmith API key first"
    },
    {
     "zh": "只打印一个弃用警告，照样能用",
     "en": "It only prints a deprecation warning and still works"
    },
    {
     "zh": "报 `ValueError`：默认不允许下载公开提示词；可改用 `Client().pull_prompt(..., dangerously_pull_public_prompt=True)`，或者把模板文字写进代码",
     "en": "`ValueError`: public prompts are disabled by default; use `Client().pull_prompt(..., dangerously_pull_public_prompt=True)` or put the template text in your code"
    }
   ],
   "answer": 3,
   "explain": {
    "zh": "本机实测：除了弃用警告，还会因为安全默认值报 `ValueError`。模板只有十几行，直接写进代码最省事。",
    "en": "Tested here: besides the deprecation warning, the safety default raises `ValueError`. The template is a dozen lines, so writing it into the code is simplest."
   }
  },
  {
   "q": {
    "zh": "`AgentExecutor(..., max_iterations=5)` 起什么作用？",
    "en": "What does `AgentExecutor(..., max_iterations=5)` do?"
   },
   "options": [
    {
     "zh": "让模型每次最多写 5 行",
     "en": "Limits each model reply to 5 lines"
    },
    {
     "zh": "最多循环 5 轮，超过就停下，防止智能体停不下来",
     "en": "Stops after at most 5 rounds, so the agent cannot loop forever"
    },
    {
     "zh": "最多只能有 5 个工具",
     "en": "Allows at most 5 tools"
    },
    {
     "zh": "同时运行 5 个智能体",
     "en": "Runs 5 agents at once"
    }
   ],
   "answer": 1,
   "explain": {
    "zh": "文本格式的 ReAct 很容易卡在同一个工具上（视频和我们的实测都出过状况），设一个轮数上限能保证它一定会结束；超过时输出 `Agent stopped due to iteration limit or time limit.`。",
    "en": "Text-format ReAct easily gets stuck on one tool (it went wrong in the video and in our tests), and a round limit guarantees it ends; past the limit the output is `Agent stopped due to iteration limit or time limit.`."
   }
  },
  {
   "q": {
    "zh": "`create_self_ask_with_search_agent` 对工具有什么硬性要求？",
    "en": "What does `create_self_ask_with_search_agent` require of its tools?"
   },
   "options": [
    {
     "zh": "至少要有两个工具：搜索和计算",
     "en": "At least two tools: search and calculation"
    },
    {
     "zh": "工具必须用 `@tool` 定义",
     "en": "Tools must be defined with `@tool`"
    },
    {
     "zh": "只能有一个工具，而且名字必须是 \"Intermediate Answer\"",
     "en": "Exactly one tool, named “Intermediate Answer”"
    },
    {
     "zh": "没有要求，任何工具都行",
     "en": "None; any tools will do"
    }
   ],
   "answer": 2,
   "explain": {
    "zh": "模板把搜索结果固定叫 Intermediate answer，所以源码里检查：工具数不是 1，或名字不对，都报 `ValueError`。名字带空格，所以用 `Tool(name=...)` 包装。",
    "en": "The template calls search results Intermediate answer, so the source checks it: a tool count other than 1 or a wrong name raises `ValueError`. The name has a space, hence `Tool(name=...)`."
   }
  },
  {
   "q": {
    "zh": "改用 1.x 的 `create_agent` 后，怎么提问、怎么取回答？",
    "en": "With 1.x's `create_agent`, how do you ask and where is the answer?"
   },
   "options": [
    {
     "zh": "`agent.invoke({\"messages\": [...]})`，回答是 `out[\"messages\"][-1].content`",
     "en": "`agent.invoke({\"messages\": [...]})`; the answer is `out[\"messages\"][-1].content`"
    },
    {
     "zh": "`agent.invoke({\"input\": ...})`，回答是 `out[\"output\"]`",
     "en": "`agent.invoke({\"input\": ...})`; the answer is `out[\"output\"]`"
    },
    {
     "zh": "`agent.run(\"问题\")`，直接返回字符串",
     "en": "`agent.run(\"question\")`, which returns a string"
    },
    {
     "zh": "必须先套一层 `AgentExecutor`",
     "en": "It must be wrapped in an `AgentExecutor` first"
    }
   ],
   "answer": 0,
   "explain": {
    "zh": "`{\"input\": ...}` → `result[\"output\"]` 是 `AgentExecutor` 的格式。`create_agent` 收发的是消息列表；传 `{\"input\": ...}` 不会报错，但这个键会被悄悄丢掉（本机实测），模型根本看不到问题。",
    "en": "`{\"input\": ...}` → `result[\"output\"]` is `AgentExecutor`'s format. `create_agent` takes and returns a message list; passing `{\"input\": ...}` raises no error, but the key is silently dropped (tested here), so the model never sees the question."
   }
  }
 ],
 "fill": [
  {
   "title": {
    "zh": "组装 ReAct 智能体（视频的写法）",
    "en": "Assemble the ReAct agent (the video's way)"
   },
   "code": {
    "zh": "from langchain_classic.agents import [[AgentExecutor]], [[create_react_agent]]\n\nprompt = PromptTemplate.[[from_template]](REACT_TEMPLATE)\ntools = [search, weekday]\nagent = create_react_agent(model, [[tools]], [[prompt]])\nexecutor = AgentExecutor(agent=[[agent]], tools=tools, [[verbose]]=True, [[max_iterations]]=5)\nresult = executor.invoke({\"[[input]]\": \"2024年巴黎奥运会开幕式是星期几？\"})\nprint(result[\"[[output]]\"])",
    "en": "from langchain_classic.agents import [[AgentExecutor]], [[create_react_agent]]\n\nprompt = PromptTemplate.[[from_template]](REACT_TEMPLATE)\ntools = [search, weekday]\nagent = create_react_agent(model, [[tools]], [[prompt]])\nexecutor = AgentExecutor(agent=[[agent]], tools=tools, [[verbose]]=True, [[max_iterations]]=5)\nresult = executor.invoke({\"[[input]]\": \"What day of the week was the Paris 2024 Olympics opening ceremony?\"})\nprint(result[\"[[output]]\"])"
   },
   "explain": {
    "zh": "旧版智能体从 `langchain_classic.agents` 导入；`create_react_agent` 收模型、工具、提示词；`AgentExecutor` 负责循环；输入键是 `input`，结果在 `output` 里。",
    "en": "Old-style agents come from `langchain_classic.agents`; `create_react_agent` takes the model, tools and prompt; `AgentExecutor` runs the loop; the input key is `input`, the result is in `output`."
   }
  },
  {
   "title": {
    "zh": "「算星期几」工具",
    "en": "The day-of-the-week tool"
   },
   "code": {
    "zh": "@[[tool]]\ndef weekday(date_str: str) -> str:\n    \"\"\"计算某个日期是星期几。输入必须是 YYYY-MM-DD 格式的日期。\"\"\"\n    try:\n        d = datetime.[[strptime]](date_str.strip(), \"[[%Y-%m-%d]]\")\n    except [[ValueError]]:\n        return \"日期格式不对，请用 YYYY-MM-DD。\"\n    return WEEKDAYS[d.[[weekday]]()]",
    "en": "@[[tool]]\ndef weekday(date_str: str) -> str:\n    \"\"\"Work out the day of the week for a date. The input must be a YYYY-MM-DD date.\"\"\"\n    try:\n        d = datetime.[[strptime]](date_str.strip(), \"[[%Y-%m-%d]]\")\n    except [[ValueError]]:\n        return \"Bad date format, use YYYY-MM-DD.\"\n    return WEEKDAYS[d.[[weekday]]()]"
   },
   "explain": {
    "zh": "`strptime` 按 `%Y-%m-%d` 把字符串解析成日期，对不上就报 `ValueError`；`weekday()` 返回 0–6，星期一是 0。",
    "en": "`strptime` parses the string with `%Y-%m-%d` and raises `ValueError` on a mismatch; `weekday()` returns 0–6, Monday is 0."
   }
  },
  {
   "title": {
    "zh": "Self-Ask 的工具和智能体",
    "en": "Self-Ask's tool and agent"
   },
   "code": {
    "zh": "search_tool = [[Tool]](name=\"[[Intermediate Answer]]\", func=search.invoke, description=\"搜索引擎，用来回答追问\")\nagent = [[create_self_ask_with_search_agent]](model, [search_tool], prompt)\nexecutor = AgentExecutor(agent=agent, tools=[search_tool], max_iterations=5)",
    "en": "search_tool = [[Tool]](name=\"[[Intermediate Answer]]\", func=search.invoke, description=\"A search engine for answering follow-up questions\")\nagent = [[create_self_ask_with_search_agent]](model, [search_tool], prompt)\nexecutor = AgentExecutor(agent=agent, tools=[search_tool], max_iterations=5)"
   },
   "explain": {
    "zh": "工具名被模板写死成 \"Intermediate Answer\"，带空格，所以用 `Tool(...)` 包装；创建函数是 `create_self_ask_with_search_agent`，工具列表里只能有这一个。",
    "en": "The template fixes the tool name as “Intermediate Answer”, with a space, so it is wrapped with `Tool(...)`; the factory is `create_self_ask_with_search_agent`, and that must be the only tool."
   }
  }
 ],
 "write": [
  {
   "title": {
    "zh": "手写：视频里的 ReAct 智能体",
    "en": "Write it yourself: the video's ReAct agent"
   },
   "task": {
    "zh": "不看上面的代码，按注释补全：\n1. 从 `langchain_classic.agents` 导入 `AgentExecutor` 和 `create_react_agent`；\n2. 写工具 `weekday(date_str: str) -> str`：`@tool`、写明输入格式的 docstring、`datetime.strptime` 解析、格式不对时用 `try/except` 返回提示、返回 `WEEKDAYS[d.weekday()]`；\n3. 创建模型、工具列表、提示词，再用 `create_react_agent` 和 `AgentExecutor`（`verbose=True`、`max_iterations=5`）组装；\n4. 用 `invoke({\"input\": ...})` 提问，打印 `result[\"output\"]`。\n\n写完点「检查关键点」，再到本地运行 `practice/l49_react_todo.py` 验证（参考答案 `practice/l49_react_solution.py`）。",
    "en": "Without looking at the code above, fill in the code under each comment:\n1. Import `AgentExecutor` and `create_react_agent` from `langchain_classic.agents`;\n2. Write the tool `weekday(date_str: str) -> str`: `@tool`, a docstring stating the input format, parse with `datetime.strptime`, return a hint via `try/except` on a bad format, return `WEEKDAYS[d.weekday()]`;\n3. Create the model, tool list and prompt, then assemble with `create_react_agent` and `AgentExecutor` (`verbose=True`, `max_iterations=5`);\n4. Ask with `invoke({\"input\": ...})` and print `result[\"output\"]`.\n\nWhen you are done, click “Check key points”, then run `practice/l49_react_todo.py` locally to verify it (solution: `practice/l49_react_solution.py`)."
   },
   "starter": {
    "zh": "from datetime import datetime\nfrom langchain_core.prompts import PromptTemplate\nfrom langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom l49_react_solution import REACT_TEMPLATE   # 模板文字直接拿来用\nfrom l49_tools import WEEKDAYS, search\nfrom llm import API_KEY, MODEL\n\n# 1. 从 langchain_classic.agents 导入 AgentExecutor 和 create_react_agent\n\n\n# 2. 写工具 weekday(date_str: str) -> str：加 @tool 和 docstring（写明 YYYY-MM-DD），\n#    用 datetime 的 strptime 解析，格式不对时返回提示，否则返回 WEEKDAYS 里对应的那一项\n\n\n# 3. 创建模型、工具列表 [search, weekday]、提示词、agent 和 executor（verbose、max_iterations=5）\n\n\n# 4. 问「2024年巴黎奥运会开幕式是星期几？」，打印 result 里的 output",
    "en": "from datetime import datetime\nfrom langchain_core.prompts import PromptTemplate\nfrom langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom l49_react_solution import REACT_TEMPLATE   # reuse the template text as is\nfrom l49_tools import WEEKDAYS, search\nfrom llm import API_KEY, MODEL\n\n# 1. Import AgentExecutor and create_react_agent from langchain_classic.agents\n\n\n# 2. Write the tool weekday(date_str: str) -> str: add @tool and a docstring (stating YYYY-MM-DD),\n#    parse with datetime's strptime, return a hint on a bad format, otherwise the matching item in WEEKDAYS\n\n\n# 3. Create the model, the tool list [search, weekday], the prompt, the agent and the executor (verbose, max_iterations=5)\n\n\n# 4. Ask \"What day of the week was the Paris 2024 Olympics opening ceremony?\" and print the output in result"
   },
   "solution": {
    "zh": "from datetime import datetime\nfrom langchain_core.prompts import PromptTemplate\nfrom langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom l49_react_solution import REACT_TEMPLATE   # 模板文字直接拿来用\nfrom l49_tools import WEEKDAYS, search\nfrom llm import API_KEY, MODEL\n\n# 1. 从 langchain_classic.agents 导入 AgentExecutor 和 create_react_agent\nfrom langchain_classic.agents import AgentExecutor, create_react_agent\n\n# 2. 写工具 weekday(date_str: str) -> str：加 @tool 和 docstring（写明 YYYY-MM-DD），\n#    用 datetime 的 strptime 解析，格式不对时返回提示，否则返回 WEEKDAYS 里对应的那一项\n@tool\ndef weekday(date_str: str) -> str:\n    \"\"\"计算某个日期是星期几。输入必须是 YYYY-MM-DD 格式的日期，例如 2024-07-26。\"\"\"\n    try:\n        d = datetime.strptime(date_str.strip(), \"%Y-%m-%d\")\n    except ValueError:\n        return \"日期格式不对，请用 YYYY-MM-DD。\"\n    return WEEKDAYS[d.weekday()]\n\n# 3. 创建模型、工具列表 [search, weekday]、提示词、agent 和 executor（verbose、max_iterations=5）\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\ntools = [search, weekday]\nprompt = PromptTemplate.from_template(REACT_TEMPLATE)\nagent = create_react_agent(model, tools, prompt)\nexecutor = AgentExecutor(agent=agent, tools=tools, verbose=True,\n                         handle_parsing_errors=True, max_iterations=5)\n\n# 4. 问「2024年巴黎奥运会开幕式是星期几？」，打印 result 里的 output\nresult = executor.invoke({\"input\": \"2024年巴黎奥运会开幕式是星期几？\"})\nprint(result[\"output\"])",
    "en": "from datetime import datetime\nfrom langchain_core.prompts import PromptTemplate\nfrom langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom l49_react_solution import REACT_TEMPLATE   # reuse the template text as is\nfrom l49_tools import WEEKDAYS, search\nfrom llm import API_KEY, MODEL\n\n# 1. Import AgentExecutor and create_react_agent from langchain_classic.agents\nfrom langchain_classic.agents import AgentExecutor, create_react_agent\n\n# 2. Write the tool weekday(date_str: str) -> str: add @tool and a docstring (stating YYYY-MM-DD),\n#    parse with datetime's strptime, return a hint on a bad format, otherwise the matching item in WEEKDAYS\n@tool\ndef weekday(date_str: str) -> str:\n    \"\"\"Work out the day of the week for a date. The input must be a YYYY-MM-DD date, e.g. 2024-07-26.\"\"\"\n    try:\n        d = datetime.strptime(date_str.strip(), \"%Y-%m-%d\")\n    except ValueError:\n        return \"Bad date format, use YYYY-MM-DD.\"\n    return WEEKDAYS[d.weekday()]\n\n# 3. Create the model, the tool list [search, weekday], the prompt, the agent and the executor (verbose, max_iterations=5)\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\ntools = [search, weekday]\nprompt = PromptTemplate.from_template(REACT_TEMPLATE)\nagent = create_react_agent(model, tools, prompt)\nexecutor = AgentExecutor(agent=agent, tools=tools, verbose=True,\n                         handle_parsing_errors=True, max_iterations=5)\n\n# 4. Ask \"What day of the week was the Paris 2024 Olympics opening ceremony?\" and print the output in result\nresult = executor.invoke({\"input\": \"What day of the week was the Paris 2024 Olympics opening ceremony?\"})\nprint(result[\"output\"])"
   },
   "checks": [
    {
     "re": "from\\s+langchain_classic\\.agents\\s+import\\s+[^\\n]*create_react_agent",
     "zh": "从 `langchain_classic.agents` 导入 `create_react_agent`",
     "en": "Import `create_react_agent` from `langchain_classic.agents`"
    },
    {
     "re": "from\\s+langchain_classic\\.agents\\s+import\\s+[^\\n]*AgentExecutor",
     "zh": "从 `langchain_classic.agents` 导入 `AgentExecutor`",
     "en": "Import `AgentExecutor` from `langchain_classic.agents`"
    },
    {
     "re": "@tool\\s*\\n\\s*def\\s+weekday\\s*\\(\\s*date_str\\s*:\\s*str\\s*\\)",
     "zh": "`@tool` 下面定义 `weekday(date_str: str)`",
     "en": "`@tool` above `def weekday(date_str: str)`"
    },
    {
     "re": "def\\s+weekday[^\\n]*\\n\\s+(\\\"\\\"\\\"|''')",
     "zh": "函数第一行是 docstring",
     "en": "The function starts with a docstring"
    },
    {
     "re": "datetime\\.strptime\\(",
     "zh": "用 `datetime.strptime(...)` 解析日期",
     "en": "Parse the date with `datetime.strptime(...)`"
    },
    {
     "re": "except\\s+ValueError",
     "zh": "用 `except ValueError` 接住格式错误",
     "en": "Catch format errors with `except ValueError`"
    },
    {
     "re": "\\.weekday\\(\\)",
     "zh": "用 `.weekday()` 取星期几",
     "en": "Get the weekday with `.weekday()`"
    },
    {
     "re": "create_react_agent\\(\\s*\\w+\\s*,\\s*\\w+\\s*,\\s*\\w+\\s*\\)",
     "zh": "`create_react_agent(模型, 工具, 提示词)`",
     "en": "`create_react_agent(model, tools, prompt)`"
    },
    {
     "re": "AgentExecutor\\([\\s\\S]*?max_iterations\\s*=",
     "zh": "`AgentExecutor` 设置了 `max_iterations`",
     "en": "`AgentExecutor` sets `max_iterations`"
    },
    {
     "re": "\\.invoke\\(\\s*\\{\\s*[\\\"']input[\\\"']",
     "zh": "用 `invoke({\"input\": ...})` 提问",
     "en": "Ask with `invoke({\"input\": ...})`"
    },
    {
     "re": "\\[[\\\"']output[\\\"']\\]",
     "zh": "打印 `result[\"output\"]`",
     "en": "Print `result[\"output\"]`"
    }
   ]
  },
  {
   "title": {
    "zh": "手写：用 create_agent 改写",
    "en": "Write it yourself: the create_agent version"
   },
   "task": {
    "zh": "用 LangChain 1.x 推荐的 `create_agent` 写出同一个智能体（工具直接从 `l49_tools` 导入）：\n1. 导入 `create_agent`（`langchain.agents`）和 `ChatDeepSeek`；\n2. `create_agent(model=..., tools=[search, weekday], system_prompt=...)`；\n3. 用 `invoke({\"messages\": [...]})` 提问，打印最后一条消息的 `content`。\n\n本地参考：`practice/l49_create_agent.py`。",
    "en": "Write the same agent with `create_agent`, which LangChain 1.x recommends (import the tools from `l49_tools`):\n1. Import `create_agent` (`langchain.agents`) and `ChatDeepSeek`;\n2. `create_agent(model=..., tools=[search, weekday], system_prompt=...)`;\n3. Ask with `invoke({\"messages\": [...]})` and print the last message's `content`.\n\nLocal reference: `practice/l49_create_agent.py`."
   },
   "starter": {
    "zh": "from l49_tools import search, weekday\nfrom llm import API_KEY, MODEL\n\n# 1. 导入 create_agent 和 ChatDeepSeek\n\n\n# 2. 用 create_agent 创建智能体：模型、工具 [search, weekday]、一句 system_prompt\n\n\n# 3. 问「2024年巴黎奥运会开幕式是星期几？」，打印最后一条消息的内容",
    "en": "from l49_tools import search, weekday\nfrom llm import API_KEY, MODEL\n\n# 1. Import create_agent and ChatDeepSeek\n\n\n# 2. Build the agent with create_agent: the model, the tools [search, weekday] and a system_prompt\n\n\n# 3. Ask \"What day of the week was the Paris 2024 Olympics opening ceremony?\" and print the last message's content"
   },
   "solution": {
    "zh": "from l49_tools import search, weekday\nfrom llm import API_KEY, MODEL\n\n# 1. 导入 create_agent 和 ChatDeepSeek\nfrom langchain.agents import create_agent\nfrom langchain_deepseek import ChatDeepSeek\n\n# 2. 用 create_agent 创建智能体：模型、工具 [search, weekday]、一句 system_prompt\nagent = create_agent(\n    model=ChatDeepSeek(model=MODEL, api_key=API_KEY),\n    tools=[search, weekday],\n    system_prompt=\"事实和日期要用 search 查，星期几要用 weekday 算，不要凭记忆。\",\n)\n\n# 3. 问「2024年巴黎奥运会开幕式是星期几？」，打印最后一条消息的内容\nout = agent.invoke({\"messages\": [{\"role\": \"user\", \"content\": \"2024年巴黎奥运会开幕式是星期几？\"}]})\nprint(out[\"messages\"][-1].content)",
    "en": "from l49_tools import search, weekday\nfrom llm import API_KEY, MODEL\n\n# 1. Import create_agent and ChatDeepSeek\nfrom langchain.agents import create_agent\nfrom langchain_deepseek import ChatDeepSeek\n\n# 2. Build the agent with create_agent: the model, the tools [search, weekday] and a system_prompt\nagent = create_agent(\n    model=ChatDeepSeek(model=MODEL, api_key=API_KEY),\n    tools=[search, weekday],\n    system_prompt=\"Look facts and dates up with search, work out weekdays with weekday; never rely on memory.\",\n)\n\n# 3. Ask \"What day of the week was the Paris 2024 Olympics opening ceremony?\" and print the last message's content\nout = agent.invoke({\"messages\": [{\"role\": \"user\", \"content\": \"What day of the week was the Paris 2024 Olympics opening ceremony?\"}]})\nprint(out[\"messages\"][-1].content)"
   },
   "checks": [
    {
     "re": "from\\s+langchain\\.agents\\s+import\\s+[^\\n]*\\bcreate_agent\\b",
     "zh": "从 `langchain.agents` 导入 `create_agent`",
     "en": "Import `create_agent` from `langchain.agents`"
    },
    {
     "re": "ChatDeepSeek\\(\\s*model\\s*=\\s*MODEL",
     "zh": "用 `ChatDeepSeek(model=MODEL, ...)` 创建模型",
     "en": "Create the model with `ChatDeepSeek(model=MODEL, ...)`"
    },
    {
     "re": "tools\\s*=\\s*\\[\\s*search\\s*,\\s*weekday\\s*\\]",
     "zh": "传入 `tools=[search, weekday]`",
     "en": "Pass `tools=[search, weekday]`"
    },
    {
     "re": "system_prompt\\s*=",
     "zh": "设置了 `system_prompt`",
     "en": "Set a `system_prompt`"
    },
    {
     "re": "\\.invoke\\(\\s*\\{\\s*[\\\"']messages[\\\"']\\s*:\\s*\\[",
     "zh": "用 `invoke({\"messages\": [...]})` 提问",
     "en": "Ask with `invoke({\"messages\": [...]})`"
    },
    {
     "re": "\\[[\\\"']messages[\\\"']\\]\\[-1\\]\\.content",
     "zh": "打印最后一条消息的 `content`",
     "en": "Print the last message's `content`"
    }
   ]
  }
 ],
 "pitfalls": [
  {
   "zh": "照视频写 `from langchain.agents import AgentExecutor, create_react_agent` 或 `from langchain import hub`，在 1.x 报 `ImportError`。前两个改从 `langchain_classic.agents` 导入；提示词直接写进代码。",
   "en": "Copying the video's `from langchain.agents import AgentExecutor, create_react_agent` or `from langchain import hub` raises `ImportError` on 1.x. Import the first two from `langchain_classic.agents`; put the prompt in your code."
  },
  {
   "zh": "`hub.pull(\"hwchase17/react\")` 报 `ValueError`（默认不允许下载公开提示词）。把模板文字写进代码，或用 `Client().pull_prompt(..., dangerously_pull_public_prompt=True)`。",
   "en": "`hub.pull(\"hwchase17/react\")` raises `ValueError` (public prompts are disabled by default). Write the template into your code, or use `Client().pull_prompt(..., dangerously_pull_public_prompt=True)`."
  },
  {
   "zh": "自己改 ReAct 模板时删掉了某个占位符：少了 `{tools}` `{tool_names}` `{agent_scratchpad}` 中的任何一个，`create_react_agent` 报 `ValueError: Prompt missing required variables: {'tool_names'}` 之类的错误；少了 `{input}` 反而**不报错**，但模型根本看不到问题（源码只检查前三个）。四个都要留着。",
   "en": "Losing a placeholder when editing the ReAct template yourself: without any one of `{tools}` `{tool_names}` `{agent_scratchpad}`, `create_react_agent` raises an error like `ValueError: Prompt missing required variables: {'tool_names'}`; without `{input}` there is **no error** at all, but the model never sees the question (the source only checks the first three). Keep all four."
  },
  {
   "zh": "工具里不处理格式错误：模型传来 `2024年7月26日`，`strptime` 抛 `ValueError`，`AgentExecutor` 不会替你接住，整个运行直接报错退出（本机实测）。用 `try/except` 返回一句提示。",
   "en": "A tool that ignores bad input: the model passes `26/07/2024`, `strptime` raises `ValueError`, `AgentExecutor` does not catch it, and the whole run crashes (tested here). Return a hint via `try/except`."
  },
  {
   "zh": "没设 `max_iterations`、模板里也没写「每次只写下一步」：deepseek-flash 会每轮从 `Question:` 重写、反复调用同一个工具，停不下来。",
   "en": "No `max_iterations` and no “write only the next step” rule: deepseek-flash rewrites from `Question:` every round and calls the same tool forever."
  },
  {
   "zh": "Self-Ask 的工具名不是 `\"Intermediate Answer\"`，或者给了不止一个工具：`create_self_ask_with_search_agent` 直接报 `ValueError`。",
   "en": "A Self-Ask tool not named `\"Intermediate Answer\"`, or more than one tool: `create_self_ask_with_search_agent` raises `ValueError`."
  },
  {
   "zh": "两种输入格式混用：`AgentExecutor` 收到 `{\"messages\": ...}` 报 `KeyError`（缺少 `input`）；`create_agent` 收到 `{\"input\": ...}` 不报错，但问题被悄悄丢掉。",
   "en": "Mixing the input formats: `AgentExecutor` given `{\"messages\": ...}` raises `KeyError` (missing `input`); `create_agent` given `{\"input\": ...}` raises nothing but silently drops the question."
  }
 ],
 "recap": [
  {
   "zh": "智能体 = 工具 + 规划推理 + 记忆（短期：这次任务的过程；长期：多轮对话，可选）；「模型 + function calling」是最简单的智能体。",
   "en": "Agent = tools + planning/reasoning + memory (short-term: this task's trail; long-term: chat history, optional); “LLM + function calling” is the simplest agent."
  },
  {
   "zh": "ReAct = Reasoning + Acting：想 → 选工具 → 看结果 → 再想，直到给出答案。",
   "en": "ReAct = Reasoning + Acting: think → pick a tool → read the result → think again, until it answers."
  },
  {
   "zh": "视频的写法：`hwchase17/react` 模板（4 个占位符）+ `create_react_agent`（想一步）+ `AgentExecutor`（循环、`verbose`、`max_iterations`）；1.x 里从 `langchain_classic.agents` 导入，模板直接写进代码。",
   "en": "The video's way: the `hwchase17/react` template (4 placeholders) + `create_react_agent` (one step) + `AgentExecutor` (the loop, `verbose`, `max_iterations`); on 1.x import from `langchain_classic.agents` and keep the template in your code."
  },
  {
   "zh": "工具要有写清输入格式的 docstring；`datetime.strptime` 解析日期，`.weekday()` 星期一是 0；格式错误用 `try/except` 返回提示。",
   "en": "Tools need a docstring that states the input format; `datetime.strptime` parses dates and `.weekday()` has Monday as 0; return a hint via `try/except` on bad input."
  },
  {
   "zh": "Self-Ask with Search：只有一个名为 \"Intermediate Answer\" 的搜索工具，一层层追问，适合多级推理；没有 ReAct 常用。",
   "en": "Self-Ask with Search: a single search tool named “Intermediate Answer”, follow-up after follow-up, suited to multi-hop questions; less common than ReAct."
  },
  {
   "zh": "靠文字格式的智能体很脆弱（视频里也出了岔子）；1.x 推荐 `create_agent`：结构化的 `tool_calls`，输入 `{\"messages\": [...]}`，回答在 `out[\"messages\"][-1].content`。",
   "en": "Text-format agents are fragile (the video's demo went wrong too); 1.x recommends `create_agent`: structured `tool_calls`, input `{\"messages\": [...]}`, answer in `out[\"messages\"][-1].content`."
  }
 ],
 "files": [
  {
   "path": "practice/l49_tools.py",
   "zh": "两个工具：模拟搜索 `search`（示例数据，中英文关键词）和 `weekday`；直接运行可离线测试。",
   "en": "The two tools: the mock `search` (sample data, Chinese and English keywords) and `weekday`; run it to test them offline."
  },
  {
   "path": "practice/l49_react_todo.py",
   "zh": "练习：按 TODO 写出 `weekday` 工具，并用 `create_react_agent` + `AgentExecutor` 组装视频里的 ReAct 智能体。",
   "en": "Exercise: following the TODOs, write the `weekday` tool and assemble the video's ReAct agent with `create_react_agent` + `AgentExecutor`."
  },
  {
   "path": "practice/l49_react_solution.py",
   "zh": "参考答案：视频里的 ReAct 智能体（`langchain_classic`），`verbose=True` 打印全过程（已用 DeepSeek 实测）。",
   "en": "Solution: the video's ReAct agent (`langchain_classic`), printing every step with `verbose=True` (tested with DeepSeek)."
  },
  {
   "path": "practice/l49_self_ask.py",
   "zh": "演示：Self-Ask with Search（冯小刚的例子）。原模板实测失败；加了三处改动后用 deepseek-flash 实测成功（调用 3 次模型）。",
   "en": "Demo: Self-Ask with Search (the Feng Xiaogang example). The original template failed in testing; with three changes it worked with deepseek-flash (3 model calls)."
  },
  {
   "path": "practice/l49_create_agent.py",
   "zh": "补充：同样的两个工具换成 1.x 的 `create_agent`，并逐条打印消息记录。",
   "en": "Extra: the same two tools with 1.x's `create_agent`, printing the message record one message at a time."
  }
 ]
});
