COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l32",
  "priority": "core",
  "handwrite": true,
  "studyMinutes": 60,
  "source": "subtitle",
  "summary": {
    "zh": "跟着视频把记忆用到智能体上，并解决记忆越来越长的问题：①**短期记忆**——给一个用 `ToolNode` 和 `bind_tools` 搭的 ReAct 智能体装上 checkpointer，多轮对话就接上了；②**长期保存**——视频用 Docker 跑 MongoDB，配合 `MongoDBSaver` 和 `create_react_agent`，这里换成不用装服务的 `SqliteSaver` 和新版 `create_agent`，程序重启后同一个 thread_id 的对话还在；③**记忆优化**——只把最后一条消息发给模型的「过滤」虽然省，却让它什么都记不住；更常用的是「总结」：消息超过 6 条时让模型写摘要，再用 `RemoveMessage` 删掉除最后两条以外的旧消息。",
    "en": "Following the video, memory goes into an agent and the ever-growing history gets tamed: ① **short-term memory** – a ReAct agent built with `ToolNode` and `bind_tools`, compiled with a checkpointer, handles multi-turn chat; ② **keeping it for good** – the video runs MongoDB in Docker with `MongoDBSaver` and `create_react_agent`; here `SqliteSaver` (no server needed) and the newer `create_agent`, so the same thread_id's conversation survives a restart; ③ **optimising memory** – a “filter” that sends only the last message is cheap but forgets everything; the common fix is summarisation: past 6 messages, the model writes a summary and `RemoveMessage` deletes all but the last two."
  },
  "goals": [
    {
      "zh": "给 ReAct 智能体（`ToolNode` + `bind_tools` + 条件边）装上 checkpointer，实现多轮记忆",
      "en": "Give a ReAct agent (`ToolNode` + `bind_tools` + a conditional edge) multi-turn memory with a checkpointer"
    },
    {
      "zh": "用 `with SqliteSaver.from_conn_string(...)` 把检查点写进数据库，并看懂视频里 MongoDB 版本的写法",
      "en": "Write checkpoints to a database with `with SqliteSaver.from_conn_string(...)` and read the video's MongoDB version"
    },
    {
      "zh": "用 `create_agent(..., checkpointer=...)` 代替已弃用的 `create_react_agent`",
      "en": "Use `create_agent(..., checkpointer=...)` instead of the deprecated `create_react_agent`"
    },
    {
      "zh": "说出「过滤」和「总结」两种记忆优化的取舍",
      "en": "Explain the trade-off between filtering and summarising"
    },
    {
      "zh": "手写总结记忆：`summary` 字段、`should_continue` 阈值、`summarize_conversation` 节点和 `RemoveMessage`",
      "en": "Write summary memory by hand: the `summary` field, the `should_continue` threshold, the `summarize_conversation` node and `RemoveMessage`"
    },
    {
      "zh": "用 `stream_mode=\"updates\"` 和 `get_state(config).values` 观察记忆的变化",
      "en": "Watch memory change with `stream_mode=\"updates\"` and `get_state(config).values`"
    }
  ],
  "blocks": [
    {
      "t": "video",
      "zh": "这一集 22 分钟，模型仍然是 **DeepSeek**，分三部分：\n- **短期记忆**（[▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=1)–[▶ 03:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=223)）：一个经典的 ReAct 智能体（`ToolNode` + `bind_tools` + 条件边），编译时装上 `MemorySaver`，就能多轮对话。\n- **长期记忆**（[▶ 03:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=223)–[▶ 10:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=647)）：大部分时间在用 Docker 安装并启动 MongoDB（国内网络要换镜像站、要开放 27017 端口），然后用 `MongoDBSaver` 和 `create_react_agent` 做了一个天气智能体。这里改用不需要安装任何服务的 SQLite，以及新版的 `create_agent`。\n- **记忆优化**（[▶ 10:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=647) 起）：先演示「只留最后一条消息」的过滤，结果记不住了；再演示更常用的「总结」：消息超过 6 条时写摘要、删旧消息。\n\n例子里的名字「托米」、线程编号 20、2、4 都和视频一样。",
      "en": "This 22-minute episode still uses **DeepSeek** and has three parts:\n- **Short-term memory** ([▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=1)–[▶ 03:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=223)): a classic ReAct agent (`ToolNode` + `bind_tools` + a conditional edge) compiled with `MemorySaver`, which gives multi-turn chat.\n- **Long-term memory** ([▶ 03:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=223)–[▶ 10:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=647)): most of the time goes into installing and starting MongoDB with Docker (mirror sites for networks in China, opening port 27017), then a weather agent built with `MongoDBSaver` and `create_react_agent`. Here we use SQLite, which needs no server, and the newer `create_agent`.\n- **Optimising memory** (from [▶ 10:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=647)): first a filter that keeps only the last message – and the agent forgets; then the more common summarisation: past 6 messages, write a summary and delete old messages.\n\nThe example name Tommy and the thread ids 20, 2 and 4 follow the video."
    },
    {
      "t": "h",
      "zh": "一、短期记忆：给 ReAct 智能体装上检查点",
      "en": "1. Short-term memory: a checkpointer for a ReAct agent"
    },
    {
      "t": "p",
      "zh": "[▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=1) 31 节已经用 `MemorySaver` 实现过记忆，这次把它放进一个**智能体**里。老师用的是一个简单、经典的 ReAct 智能体，有三个新零件：\n- [▶ 00:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=33) **`ToolNode`**：LangGraph 预置组件（`langgraph.prebuilt`）里的一个现成节点，专门执行工具——它找到最后一条 AI 消息里的工具调用，逐个运行，把结果包成 tool 消息返回\n- 一个**模拟的联网搜索工具** `search`：不管搜什么都返回一段写死的文字，真实项目里要换成真正的搜索\n- [▶ 01:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=66) **`bind_tools`**：把工具说明交给模型，模型才知道自己可以调用哪些工具\n\n[▶ 01:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=99) 图里有两个节点：`agent`（调用绑定了工具的模型）和 `action`（`ToolNode`）。从 `agent` 出来是一条**条件边** `should_continue`：最后一条消息里有工具调用，就去 `action`；没有就结束。`action` 执行完再回到 `agent`，形成循环 [▶ 02:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=130)。",
      "en": "[▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=1) Lesson 31 already gave a graph memory with `MemorySaver`; now it goes into an **agent**. The instructor uses a simple, classic ReAct agent with three new parts:\n- [▶ 00:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=33) **`ToolNode`**: a ready-made node from LangGraph's prebuilt components (`langgraph.prebuilt`) that runs tools – it finds the tool calls in the last AI message, runs each one and returns the results as tool messages\n- a **simulated web-search tool** `search` that returns the same hard-coded text whatever you search for; a real project would plug in a real search\n- [▶ 01:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=66) **`bind_tools`**: hands the tool descriptions to the model so it knows which tools it may call\n\n[▶ 01:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=99) The graph has two nodes: `agent` (calls the tool-aware model) and `action` (the `ToolNode`). Out of `agent` runs a **conditional edge**, `should_continue`: if the last message contains tool calls, go to `action`; otherwise finish. `action` leads back to `agent`, closing the loop [▶ 02:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=130)."
    },
    {
      "t": "code",
      "file": "react_memory.py",
      "code": {
        "zh": "from langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom langgraph.prebuilt import ToolNode\nfrom llm import API_KEY, MODEL\n\n@tool\ndef search(query: str):\n    \"\"\"模拟联网搜索。\"\"\"\n    return \"（模拟搜索结果）今天北京晴，气温 20 度左右。\"   # 不管搜什么都返回这一句\n\ntools = [search]\ntool_node = ToolNode(tools)                  # 现成的「执行工具」节点\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\nbound_model = model.bind_tools(tools)        # 把工具说明交给模型\n\ndef should_continue(state: MessagesState):\n    last_message = state[\"messages\"][-1]\n    if not last_message.tool_calls:          # 没有工具调用：结束\n        return END\n    return \"action\"                          # 有工具调用：去执行工具\n\ndef call_model(state: MessagesState):\n    response = bound_model.invoke(state[\"messages\"])\n    return {\"messages\": [response]}\n\nworkflow = StateGraph(MessagesState)\nworkflow.add_node(\"agent\", call_model)\nworkflow.add_node(\"action\", tool_node)\nworkflow.add_edge(START, \"agent\")\nworkflow.add_conditional_edges(\"agent\", should_continue, [\"action\", END])\nworkflow.add_edge(\"action\", \"agent\")         # 工具执行完，回到 agent\napp = workflow.compile(checkpointer=InMemorySaver())   # 关键：装上检查点",
        "en": "from langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom langgraph.prebuilt import ToolNode\nfrom llm import API_KEY, MODEL\n\n@tool\ndef search(query: str):\n    \"\"\"Simulated web search.\"\"\"\n    return \"(mock search result) Sunny in Beijing today, around 20 degrees.\"   # same answer for any query\n\ntools = [search]\ntool_node = ToolNode(tools)                  # a ready-made \"run the tools\" node\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\nbound_model = model.bind_tools(tools)        # give the model the tool descriptions\n\ndef should_continue(state: MessagesState):\n    last_message = state[\"messages\"][-1]\n    if not last_message.tool_calls:          # no tool call: finish\n        return END\n    return \"action\"                          # a tool call: go and run the tool\n\ndef call_model(state: MessagesState):\n    response = bound_model.invoke(state[\"messages\"])\n    return {\"messages\": [response]}\n\nworkflow = StateGraph(MessagesState)\nworkflow.add_node(\"agent\", call_model)\nworkflow.add_node(\"action\", tool_node)\nworkflow.add_edge(START, \"agent\")\nworkflow.add_conditional_edges(\"agent\", should_continue, [\"action\", END])\nworkflow.add_edge(\"action\", \"agent\")         # after the tool, back to the agent\napp = workflow.compile(checkpointer=InMemorySaver())   # the key part: a checkpointer"
      },
      "note": {
        "zh": "完整可运行版：`practice/l32_react_memory_solution.py`（2 次 DeepSeek 调用）。\n- `@tool`（来自 `langchain_core.tools`）把普通函数变成 LangChain 工具，函数的 docstring 就是工具说明——和 08 节的 `@function_tool` 是同一个思路。\n- `bind_tools` 返回一个**新的**模型对象，所以要用 `bound_model` 调用，原来的 `model` 不知道有工具。\n- 路由函数返回下一个节点的名字或 `END`（回顾 28 节）。",
        "en": "Full runnable version: `practice/l32_react_memory_solution.py` (2 DeepSeek calls).\n- `@tool` (from `langchain_core.tools`) turns a plain function into a LangChain tool, and its docstring becomes the tool description – the same idea as lesson 08's `@function_tool`.\n- `bind_tools` returns a **new** model object, so call `bound_model`; the original `model` knows nothing about tools.\n- A routing function returns the next node's name or `END` (see lesson 28)."
      }
    },
    {
      "t": "p",
      "zh": "这张图就是 06 节手写的工具循环换成了 LangGraph 的零件：\n\n| 06 节（手写） | 这里 |\n|---|---|\n| 调用时传 `tools=[...]` | `model.bind_tools(tools)` |\n| `while reply.tool_calls:` | 条件边 `should_continue` |\n| 用 `for` 循环执行每个工具调用，把结果存成 tool 消息 | `ToolNode(tools)` |\n| 执行完再调用一次模型 | 边 `action → agent` |\n| 自己维护 `message_history` | `MessagesState` + checkpointer |",
      "en": "This graph is lesson 06's hand-written tool loop rebuilt from LangGraph parts:\n\n| Lesson 06 (by hand) | Here |\n|---|---|\n| Pass `tools=[...]` on each call | `model.bind_tools(tools)` |\n| `while reply.tool_calls:` | The conditional edge `should_continue` |\n| A `for` loop runs each tool call and stores tool messages | `ToolNode(tools)` |\n| Call the model again afterwards | The edge `action → agent` |\n| Keep `message_history` yourself | `MessagesState` + a checkpointer |"
    },
    {
      "t": "note",
      "zh": "[▶ 01:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=99) 视频讲 `should_continue` 时口头说反了一句（听起来像「有工具调用就结束」），以代码为准：**没有**工具调用才结束，有工具调用就去 `action`。",
      "en": "[▶ 01:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=99) While explaining `should_continue`, the instructor misspeaks once (it sounds like “end if there is a tool call”). Trust the code: finish when there is **no** tool call, go to `action` when there is one."
    },
    {
      "t": "p",
      "zh": "[▶ 02:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=160) 调用方式和 31 节一样，只是老师把 `thread_id` 改成了 `\"20\"`：先说「你好，我是托米」，再问「我叫什么名字？」。[▶ 03:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=192) 因为编译时已经 `checkpointer=...`，所有消息都写进了内存，第二句它就答出了托米——智能体也有了多轮对话。实测 DeepSeek 的两次回答是「你好，托米！有什么可以帮你的吗？」和「你叫托米。」",
      "en": "[▶ 02:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=160) Calling it works as in lesson 31, except the instructor changes `thread_id` to `\"20\"`: first “Hi, I'm Tommy”, then “What's my name?”. [▶ 03:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=192) Because the graph was compiled with `checkpointer=...`, every message was written to memory, so the second answer is “Tommy” – the agent now handles multi-turn chat. In a real run, DeepSeek answered “Hi Tommy! How can I help?” and “You're Tommy.”"
    },
    {
      "t": "code",
      "file": "react_run.py",
      "code": {
        "zh": "config = {\"configurable\": {\"thread_id\": \"20\"}}\nfor text in [\"你好，我是托米\", \"我叫什么名字？\"]:\n    for chunk in app.stream({\"messages\": [{\"role\": \"user\", \"content\": text}]}, config, stream_mode=\"values\"):\n        chunk[\"messages\"][-1].pretty_print()",
        "en": "config = {\"configurable\": {\"thread_id\": \"20\"}}\nfor text in [\"Hi, I'm Tommy\", \"What's my name?\"]:\n    for chunk in app.stream({\"messages\": [{\"role\": \"user\", \"content\": text}]}, config, stream_mode=\"values\"):\n        chunk[\"messages\"][-1].pretty_print()"
      }
    },
    {
      "t": "p",
      "zh": "[▶ 03:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=223) 老师总结这一部分的核心：**选一个合适的记忆组件，把它放进 checkpointer**。智能体本身的代码一行都不用为「记忆」改。",
      "en": "[▶ 03:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=223) The instructor sums this part up: **pick a suitable memory component and plug it in as the checkpointer**. Not one line of the agent itself changes for “memory”."
    },
    {
      "t": "h",
      "zh": "二、长期保存：把检查点写进数据库",
      "en": "2. Keeping it for good: checkpoints in a database"
    },
    {
      "t": "p",
      "zh": "[▶ 03:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=223) 第二部分老师选了 MongoDB。他先介绍了几种安装方式（Windows 和 macOS 各有办法，macOS 可以用 brew，最推荐的是 Docker）[▶ 04:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=257)，然后用 Docker 拉取镜像——国内网络要换镜像站——在 Docker Desktop 里运行起来，安装 MongoDB 对应的 LangGraph 依赖包，测试连接时发现还要开放默认端口 27017 才连得上 [▶ 06:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=418)。\n\n[▶ 08:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=490) 接着他做了一个最简单的天气智能体：工具 `get_weather` 是写死的——北京返回一句、深圳返回一句、其他城市返回「未知城市」。[▶ 08:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=522) 检查点用 `MongoDBSaver`（基于 MongoDB 客户端的封装，默认地址 `localhost:27017`），智能体用 LangGraph 预置的 `create_react_agent(model, tools, prompt, checkpointer)` 一行创建。[▶ 09:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=585) 问「北京今天天气如何？」，智能体调用了工具，回答北京晴、20 度左右、适合外出。[▶ 10:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=616) 这些消息都写进了数据库（视频这里口误说成了 Redis，实际是 MongoDB），系统重启后用同一个 `thread_id` 访问，依然能拿到。",
      "en": "[▶ 03:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=223) For part 2 the instructor picks MongoDB. He goes through the install options (Windows and macOS each have their own way – brew on macOS – with Docker recommended) [▶ 04:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=257), pulls the image with Docker – networks in China need a mirror site – runs it in Docker Desktop, installs the matching LangGraph package for MongoDB, and while testing the connection finds he must also expose the default port 27017 [▶ 06:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=418).\n\n[▶ 08:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=490) Then he builds the simplest weather agent: the `get_weather` tool is hard-coded – one sentence for Beijing, one for Shenzhen, “unknown city” for anything else. [▶ 08:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=522) The checkpointer is `MongoDBSaver` (a wrapper around the MongoDB client, default address `localhost:27017`), and the agent is created in one line with LangGraph's prebuilt `create_react_agent(model, tools, prompt, checkpointer)`. [▶ 09:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=585) Asked “How's the weather in Beijing today?”, the agent calls the tool and answers: sunny, about 20 degrees, good for going out. [▶ 10:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=616) These messages are now in the database (the instructor says “Redis” here by mistake; it is MongoDB); after a restart, the same `thread_id` gets them back."
    },
    {
      "t": "video",
      "zh": "**视频里的写法 vs 这里的写法**\n\n| | 视频 | 这里 |\n|---|---|---|\n| 数据库 | MongoDB（Docker 运行，端口 27017） | SQLite：一个文件 `practice/data/l32_checkpoints.db`，Python 自带支持，不用装服务 |\n| 检查点 | `MongoDBSaver`（`langgraph-checkpoint-mongodb` 包） | `SqliteSaver`（`langgraph-checkpoint-sqlite`，课程环境已装） |\n| 创建智能体 | `create_react_agent(model, tools, prompt=..., checkpointer=...)` | `create_agent(model, tools=..., system_prompt=..., checkpointer=...)` |\n\n`create_react_agent` 在 LangGraph 1.x 里仍然能用，但会提示已弃用、让你改用 `from langchain.agents import create_agent`（25 节提过）。两者用法几乎一样，主要是 `prompt` 改名成了 `system_prompt`。想换回视频的 MongoDB，需要自己装好 MongoDB 服务和 `langgraph-checkpoint-mongodb` 包；检查点部分只改两行：导入那一行，以及 `with` 那一行（类名换成 `MongoDBSaver`，地址换成 `localhost:27017`）。",
      "en": "**The video's version vs ours**\n\n| | Video | Here |\n|---|---|---|\n| Database | MongoDB (in Docker, port 27017) | SQLite: one file, `practice/data/l32_checkpoints.db`, supported by Python out of the box, no server |\n| Checkpointer | `MongoDBSaver` (`langgraph-checkpoint-mongodb` package) | `SqliteSaver` (`langgraph-checkpoint-sqlite`, already installed) |\n| Creating the agent | `create_react_agent(model, tools, prompt=..., checkpointer=...)` | `create_agent(model, tools=..., system_prompt=..., checkpointer=...)` |\n\n`create_react_agent` still works in LangGraph 1.x but warns that it is deprecated and points you to `from langchain.agents import create_agent` (mentioned in lesson 25). Usage is nearly identical; mainly `prompt` became `system_prompt`. To switch back to the video's MongoDB you would install a MongoDB server and the `langgraph-checkpoint-mongodb` package yourself; the checkpointer part changes in just two lines: the import, and the `with` line (class name `MongoDBSaver`, address `localhost:27017`)."
    },
    {
      "t": "code",
      "file": "sqlite_weather_agent.py",
      "code": {
        "zh": "from langchain.agents import create_agent\nfrom langgraph.checkpoint.sqlite import SqliteSaver\n\ndef get_weather(city: str) -> str:\n    \"\"\"查询某个城市今天的天气。\"\"\"\n    if city == \"北京\":\n        return \"北京今天晴，气温 20 度左右，适合外出。\"\n    elif city == \"深圳\":\n        return \"深圳今天多云，有阵雨，气温 28 度。\"\n    else:\n        return \"未知城市\"\n\nconfig = {\"configurable\": {\"thread_id\": \"1\"}}\nwith SqliteSaver.from_conn_string(\"data/l32_checkpoints.db\") as checkpointer:   # 一个数据库文件\n    graph = create_agent(model, tools=[get_weather], system_prompt=\"你是一个天气助手，回答要简短。\",\n                         checkpointer=checkpointer)\n    response = graph.invoke({\"messages\": [{\"role\": \"user\", \"content\": \"北京今天天气如何？\"}]}, config)\n    for message in response[\"messages\"]:\n        message.pretty_print()\n# 出了 with 块，数据库连接就关闭了；图要在 with 里面用",
        "en": "from langchain.agents import create_agent\nfrom langgraph.checkpoint.sqlite import SqliteSaver\n\ndef get_weather(city: str) -> str:\n    \"\"\"Get today's weather for a city.\"\"\"\n    if city == \"Beijing\":\n        return \"Beijing today: sunny, around 20 degrees, good for going out.\"\n    elif city == \"Shenzhen\":\n        return \"Shenzhen today: cloudy with showers, 28 degrees.\"\n    else:\n        return \"Unknown city\"\n\nconfig = {\"configurable\": {\"thread_id\": \"1\"}}\nwith SqliteSaver.from_conn_string(\"data/l32_checkpoints.db\") as checkpointer:   # one database file\n    graph = create_agent(model, tools=[get_weather], system_prompt=\"You are a weather assistant. Keep answers short.\",\n                         checkpointer=checkpointer)\n    response = graph.invoke({\"messages\": [{\"role\": \"user\", \"content\": \"How's the weather in Beijing today?\"}]}, config)\n    for message in response[\"messages\"]:\n        message.pretty_print()\n# after the with block the connection is closed; use the graph inside it"
      },
      "note": {
        "zh": "接着第一部分的 `model` 往下写。完整版：`practice/l32_sqlite_weather_agent.py`——**运行两次**：第一次问北京天气（模型调用 `get_weather`），第二次程序会先从数据库读出上次的 4 条消息，再问「我刚才问的是哪个城市？」。实测第二次 DeepSeek 直接答「北京。」想从头再来，删掉数据库文件即可。\n`with` 块离开时自动关闭数据库连接（`with` 回顾 10、11 节），所以用到 `graph` 的代码都写在 `with` 里面。",
        "en": "This continues with `model` from part 1. Full version: `practice/l32_sqlite_weather_agent.py` – **run it twice**: the first run asks about Beijing's weather (the model calls `get_weather`); the second run first loads the previous 4 messages from the database, then asks “which city did I just ask about?”. In a real run DeepSeek simply answered “Beijing.” Delete the database file to start over.\nLeaving the `with` block closes the database connection automatically (`with`: see lessons 10 and 11), so all code that uses `graph` stays inside it."
      }
    },
    {
      "t": "code",
      "file": "mongodb_version.py",
      "code": {
        "zh": "# 视频里的写法（需要 MongoDB 服务和 langgraph-checkpoint-mongodb 包，本课程环境没有装）\nfrom langgraph.checkpoint.mongodb import MongoDBSaver\nfrom langgraph.prebuilt import create_react_agent        # 在 LangGraph 1.x 里已弃用\n\nwith MongoDBSaver.from_conn_string(\"localhost:27017\") as checkpointer:\n    graph = create_react_agent(model, tools=[get_weather], prompt=\"你是一个天气助手\", checkpointer=checkpointer)\n    response = graph.invoke({\"messages\": [{\"role\": \"user\", \"content\": \"北京今天天气如何？\"}]}, config)",
        "en": "# The video's version (needs a MongoDB server and the langgraph-checkpoint-mongodb package - not installed here)\nfrom langgraph.checkpoint.mongodb import MongoDBSaver\nfrom langgraph.prebuilt import create_react_agent        # deprecated in LangGraph 1.x\n\nwith MongoDBSaver.from_conn_string(\"localhost:27017\") as checkpointer:\n    graph = create_react_agent(model, tools=[get_weather], prompt=\"You are a weather assistant\", checkpointer=checkpointer)\n    response = graph.invoke({\"messages\": [{\"role\": \"user\", \"content\": \"How's the weather in Beijing today?\"}]}, config)"
      },
      "note": {
        "zh": "仅供对照，课程环境里不能运行。",
        "en": "For comparison only; it can't run in the course environment."
      }
    },
    {
      "t": "note",
      "zh": "**它算「长期记忆」吗？** 老师把「存进 MongoDB 的检查点」叫作长期记忆，是从「存在哪里」来说的：程序重启也不丢。但按 LangGraph 官方文档的分法，`SqliteSaver` / `MongoDBSaver` 仍然是 **checkpointer**，记忆仍然只属于**一个 thread**——换一个 `thread_id` 就看不到了。想让同一个用户的所有会话共享信息，要用 31 节的 **store**（数据库版的 store 同样能跨重启保存）。两个角度的对照见 30 节的表。",
      "en": "**Is this “long-term memory”?** The instructor calls “checkpoints saved in MongoDB” long-term memory from the “where it is kept” angle: it survives restarts. In LangGraph's official terms, though, `SqliteSaver` / `MongoDBSaver` are still **checkpointers**, and the memory still belongs to **one thread** – a different `thread_id` can't see it. To share information across all of a user's conversations, use the **store** from lesson 31 (database-backed stores also survive restarts). Lesson 30's table compares both views."
    },
    {
      "t": "check",
      "q": {
        "zh": "用 `SqliteSaver` 的天气智能体，程序重启后换成 `thread_id=\"2\"` 问「我刚才问的是哪个城市？」，会怎样？",
        "en": "With the `SqliteSaver` weather agent, after a restart you ask “which city did I just ask about?” on `thread_id=\"2\"`. What happens?"
      },
      "options": [
        {
          "zh": "答出北京，因为数据库里有记录",
          "en": "It says Beijing – the database has the record"
        },
        {
          "zh": "报错，SQLite 只能有一个线程",
          "en": "An error – SQLite allows only one thread"
        },
        {
          "zh": "不知道：检查点按 thread_id 分开保存，线程 2 没有记录",
          "en": "It doesn't know: checkpoints are kept per thread_id and thread 2 has no record"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "存进数据库只解决了「重启不丢」，记忆仍然属于线程 1。跨线程要用 store。",
        "en": "The database only solves “survives restarts”; the memory still belongs to thread 1. Across threads you need a store."
      }
    },
    {
      "t": "h",
      "zh": "三、记忆越来越长：召回和精度之间的平衡",
      "en": "3. Ever-growing memory: balancing recall and precision"
    },
    {
      "t": "p",
      "zh": "[▶ 10:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=647) 有了短期和长期记忆，还剩一个核心问题：聊得越多，记忆就越长，上下文窗口迟早会被塞满。老师介绍了两类优化办法 [▶ 11:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=678)：\n- **消息过滤**：对旧消息做删除、编辑之类的处理\n- **消息总结**：把旧消息总结成一段摘要\n\n目的都一样：别撑爆上下文。老师提醒，管理消息其实是一门在**召回率和精度之间找平衡**的艺术。[▶ 11:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=709) 举个极端的例子：每轮都把过去的消息删光，窗口永远不会满，可聊了七八轮之后你问「我们一开始说的那件事是什么？」，它完全不记得。理想的效果应该像人一样：能想起开头聊过什么，又不会把窗口撑爆 [▶ 12:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=740)。",
      "en": "[▶ 10:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=647) With short- and long-term memory in place, one core problem remains: the longer you chat, the longer the memory, and sooner or later the context window fills up. The instructor presents two kinds of fixes [▶ 11:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=678):\n- **Message filtering**: delete or edit old messages\n- **Message summarisation**: condense old messages into a summary\n\nBoth aim to keep the context from bursting. The instructor stresses that managing messages is an art of **balancing recall and precision**. [▶ 11:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=709) An extreme example: delete all past messages every turn, and the window never fills – but after seven or eight turns, ask “what was that thing we talked about at the start?” and it has no idea. Ideally it should behave like a person: recall what was said at the beginning without bursting the window [▶ 12:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=740)."
    },
    {
      "t": "h",
      "zh": "四、消息过滤：只把最近的消息发给模型",
      "en": "4. Filtering: send only the latest messages to the model"
    },
    {
      "t": "p",
      "zh": "[▶ 12:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=773) 还是第一部分那个智能体，唯一的区别是多了一个 `filter_messages` 函数：它接收消息列表，**只返回最后一条**，其余全部过滤掉；`call_model` 先过滤，再把结果发给模型。",
      "en": "[▶ 12:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=773) It is the same agent as in part 1; the only change is a new `filter_messages` function that takes the message list and **returns only the last message**, filtering out the rest; `call_model` filters first and sends the result to the model."
    },
    {
      "t": "code",
      "file": "filter_messages.py",
      "code": {
        "zh": "def filter_messages(messages: list):\n    return messages[-1:]                     # 非常简单粗暴：只留最后一条\n\ndef call_model(state: MessagesState):\n    messages = filter_messages(state[\"messages\"])    # 唯一的区别：先过滤，再发给模型\n    response = bound_model.invoke(messages)\n    return {\"messages\": [response]}\n\n# 其余（工具、should_continue、建图、checkpointer）和第一部分完全一样",
        "en": "def filter_messages(messages: list):\n    return messages[-1:]                     # crude: keep only the last message\n\ndef call_model(state: MessagesState):\n    messages = filter_messages(state[\"messages\"])    # the only change: filter, then send\n    response = bound_model.invoke(messages)\n    return {\"messages\": [response]}\n\n# everything else (tools, should_continue, the graph, the checkpointer) is exactly as in part 1"
      },
      "note": {
        "zh": "完整可运行版：`practice/l32_filter_messages.py`（2 次 DeepSeek 调用，带一行日志显示「发给模型几条 / 状态里共几条」）。`messages[-1:]` 是切片：从倒数第 1 条取到末尾，结果仍然是一个列表（切片回顾 06 节）。",
        "en": "Full runnable version: `practice/l32_filter_messages.py` (2 DeepSeek calls, with a log line showing how many messages are sent vs stored). `messages[-1:]` is a slice: from the last item to the end, still a list (slicing: see lesson 06)."
      }
    },
    {
      "t": "p",
      "zh": "[▶ 13:24](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=804) 老师用 `thread_id=\"2\"` 跑了两句。checkpointer 照样把每条消息都存了下来，但 `call_model` 每次只把最后一条发给模型，所以 [▶ 13:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=835)「你好，我是托米」之后再问「我叫什么名字？」，它回答你还没告诉它。\n\n[▶ 14:29](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=869) 这样做能保证发给模型的消息永远只有 1 条，却丢掉了记忆功能，所以并不是好办法。这只是一个简单粗暴的示例：`filter_messages` 里可以做很多事，比如只留最近 3 条、4 条（`messages[-4:]`），那么更早的内容就记不住了。",
      "en": "[▶ 13:24](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=804) The instructor runs two lines on `thread_id=\"2\"`. The checkpointer still stores every message, but `call_model` sends only the last one each time, so [▶ 13:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=835) after “Hi, I'm Tommy”, the question “What's my name?” gets “you haven't told me”.\n\n[▶ 14:29](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=869) This keeps the list sent to the model at exactly 1 message, but loses memory altogether, so it is not a good approach. It is only a crude example: `filter_messages` can do much more, e.g. keep the last 3 or 4 (`messages[-4:]`) – anything earlier is then forgotten."
    },
    {
      "t": "warn",
      "zh": "过滤只改变**这一次发给模型**的内容，checkpointer 里存的完整历史一条不少。另外，在带工具的智能体里留最近 N 条时，不要把 AI 的工具调用和它对应的 tool 结果拆开：如果切出来的第一条是 tool 消息，DeepSeek 会因为找不到对应的工具调用而返回 400 错误（和 06 节 `trim_history` 里「不能以 tool 消息开头」是同一条规则）。LangChain 还有现成的 `trim_messages` 可以按 token 数修剪（47 节）。",
      "en": "Filtering only changes **what is sent this time**; the full history in the checkpointer is untouched. Also, when keeping the last N messages in an agent with tools, never split an AI tool call from its tool result: if the slice starts with a tool message, DeepSeek returns a 400 error because the matching tool call is missing (the same rule as “never start with a tool message” in lesson 06's `trim_history`). LangChain also has a ready-made `trim_messages` that trims by token count (lesson 47)."
    },
    {
      "t": "h",
      "zh": "五、总结：先写摘要，再删除旧消息",
      "en": "5. Summarising: write a summary, then delete old messages"
    },
    {
      "t": "p",
      "zh": "[▶ 14:59](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=899) 更科学、在实战中也更常见的做法是**总结**。其他部分都差不多，主要的变化是多了一个 `summarize_conversation` 节点，以及状态里多了一个 `summary` 字段：\n1. [▶ 15:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=931) 先读出状态里的 `summary`。如果已经有了，说明以前总结过，就让模型「在这份摘要的基础上，结合新消息扩展它」；如果还没有，就让模型新写一份\n2. 把这句要求作为一条用户消息接在对话后面，调用模型得到摘要\n3. [▶ 16:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=961) 用 `RemoveMessage` 删掉**除最后两条以外**的所有消息——前面的对话已经压缩进摘要了，删掉它们就腾出了空间\n4. `call_model` 回答之前，如果有摘要，就把它包成一条 `SystemMessage` 放在最前面\n5. 条件边 `should_continue`：消息**超过 6 条**就去 `summarize_conversation`，否则结束",
      "en": "[▶ 14:59](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=899) The more principled approach, and the more common one in practice, is **summarisation**. Everything else stays much the same; the main changes are a new `summarize_conversation` node and a `summary` field in the state:\n1. [▶ 15:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=931) Read `summary` from the state. If it exists, an earlier summary was made, so ask the model to “extend this summary with the new messages”; if not, ask it to write a new one\n2. Append that request as a user message after the conversation and call the model to get the summary\n3. [▶ 16:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=961) Delete every message **except the last two** with `RemoveMessage` – the earlier conversation now lives in the summary, so deleting it frees up space\n4. Before `call_model` answers, if there is a summary, it is wrapped in a `SystemMessage` and put first\n5. The conditional edge `should_continue`: **more than 6 messages** → `summarize_conversation`, otherwise finish"
    },
    {
      "t": "py",
      "title": {
        "zh": "回顾 18 节的继承：在 MessagesState 上加一个字段",
        "en": "Inheritance again (lesson 18): adding a field to MessagesState"
      },
      "zh": "`class State(MessagesState):` 就是 18 节学过的**继承**，这次用在状态上：`State` 自动拥有 `MessagesState` 的全部字段（`messages` 和它的 reducer），只需在下面补上新字段 `summary: str`，不用把 `messages` 的写法重抄一遍。`MessagesState` 本身是一个 TypedDict（回顾 27 节），TypedDict 也可以这样继承，状态在节点里仍然是一个字典。\n\n第一次运行时还没有摘要，`summary` 这个键可能根本不在状态里，所以要用 `state.get(\"summary\", \"\")` 给一个默认值（`.get` 回顾 05、10 节）；直接写 `state[\"summary\"]` 会 KeyError。",
      "en": "`class State(MessagesState):` is the **inheritance** you met in lesson 18, now applied to a state: `State` gets every field of `MessagesState` (`messages` and its reducer), and you only add the new field `summary: str` below, without copying how `messages` is declared. `MessagesState` is itself a TypedDict (see lesson 27); TypedDicts can be extended this way too, and inside a node the state is still a dict.\n\nOn the first run there is no summary yet and the `summary` key may be missing entirely, so read it with a default, `state.get(\"summary\", \"\")` (`.get`: see lessons 05 and 10); `state[\"summary\"]` would raise KeyError.",
      "code": {
        "zh": "from typing import TypedDict\n\nclass BaseState(TypedDict):       # 相当于 MessagesState\n    messages: list\n\nclass State(BaseState):           # 继承：自动拥有 messages\n    summary: str                  # 再加一个新字段\n\nprint(State.__annotations__)      # 两个字段都在\n\nfirst_run = {\"messages\": [\"你好\"]}             # 第一次运行：还没有 summary\nprint(repr(first_run.get(\"summary\", \"\")))      # ''：空字符串，不报错\nif not first_run.get(\"summary\", \"\"):\n    print(\"还没有摘要，直接把 messages 发给模型\")\n\ntry:\n    print(first_run[\"summary\"])\nexcept KeyError as e:\n    print(\"直接取会报 KeyError:\", e)",
        "en": "from typing import TypedDict\n\nclass BaseState(TypedDict):       # plays the role of MessagesState\n    messages: list\n\nclass State(BaseState):           # inherits messages\n    summary: str                  # and adds a new field\n\nprint(State.__annotations__)      # both fields are there\n\nfirst_run = {\"messages\": [\"Hi\"]}               # first run: no summary yet\nprint(repr(first_run.get(\"summary\", \"\")))      # '': an empty string, no error\nif not first_run.get(\"summary\", \"\"):\n    print(\"no summary yet - send messages as they are\")\n\ntry:\n    print(first_run[\"summary\"])\nexcept KeyError as e:\n    print(\"plain indexing raises KeyError:\", e)"
      }
    },
    {
      "t": "code",
      "file": "summary_graph.py",
      "code": {
        "zh": "from typing import Literal\nfrom langchain_core.messages import HumanMessage, RemoveMessage, SystemMessage\n\nclass State(MessagesState):\n    summary: str                             # messages 之外，再加一个摘要字段\n\ndef call_model(state: State):\n    summary = state.get(\"summary\", \"\")\n    if summary:                              # 有摘要：作为 system 消息放在最前面\n        system_message = f\"之前对话的摘要：{summary}\"\n        messages = [SystemMessage(content=system_message)] + state[\"messages\"]\n    else:\n        messages = state[\"messages\"]\n    response = model.invoke(messages)\n    return {\"messages\": [response]}\n\ndef should_continue(state: State) -> Literal[\"summarize_conversation\", END]:\n    messages = state[\"messages\"]\n    if len(messages) > 6:                    # 超过 6 条就去总结\n        return \"summarize_conversation\"\n    return END\n\ndef summarize_conversation(state: State):\n    summary = state.get(\"summary\", \"\")\n    if summary:                              # 已经有摘要：让模型在旧摘要的基础上扩展\n        summary_message = f\"这是目前为止的对话摘要：{summary}\\n\\n请结合上面的新消息，扩展这份摘要：\"\n    else:                                    # 还没有：新写一份\n        summary_message = \"请为上面的对话写一份摘要：\"\n    messages = state[\"messages\"] + [HumanMessage(content=summary_message)]\n    response = model.invoke(messages)\n    delete_messages = [RemoveMessage(id=m.id) for m in state[\"messages\"][:-2]]   # 只留最后 2 条\n    return {\"summary\": response.content, \"messages\": delete_messages}\n\nworkflow = StateGraph(State)\nworkflow.add_node(\"conversation\", call_model)\nworkflow.add_node(summarize_conversation)    # 只传函数：节点名就是函数名\nworkflow.add_edge(START, \"conversation\")\nworkflow.add_conditional_edges(\"conversation\", should_continue)\nworkflow.add_edge(\"summarize_conversation\", END)\napp = workflow.compile(checkpointer=InMemorySaver())",
        "en": "from typing import Literal\nfrom langchain_core.messages import HumanMessage, RemoveMessage, SystemMessage\n\nclass State(MessagesState):\n    summary: str                             # one more field besides messages\n\ndef call_model(state: State):\n    summary = state.get(\"summary\", \"\")\n    if summary:                              # a summary exists: send it first as a system message\n        system_message = f\"Summary of the conversation earlier: {summary}\"\n        messages = [SystemMessage(content=system_message)] + state[\"messages\"]\n    else:\n        messages = state[\"messages\"]\n    response = model.invoke(messages)\n    return {\"messages\": [response]}\n\ndef should_continue(state: State) -> Literal[\"summarize_conversation\", END]:\n    messages = state[\"messages\"]\n    if len(messages) > 6:                    # more than 6 messages: go and summarise\n        return \"summarize_conversation\"\n    return END\n\ndef summarize_conversation(state: State):\n    summary = state.get(\"summary\", \"\")\n    if summary:                              # there is one already: extend it\n        summary_message = f\"This is the summary of the conversation to date: {summary}\\n\\nExtend the summary by taking into account the new messages above:\"\n    else:                                    # none yet: write a new one\n        summary_message = \"Create a summary of the conversation above:\"\n    messages = state[\"messages\"] + [HumanMessage(content=summary_message)]\n    response = model.invoke(messages)\n    delete_messages = [RemoveMessage(id=m.id) for m in state[\"messages\"][:-2]]   # keep the last 2\n    return {\"summary\": response.content, \"messages\": delete_messages}\n\nworkflow = StateGraph(State)\nworkflow.add_node(\"conversation\", call_model)\nworkflow.add_node(summarize_conversation)    # function only: the node is named after it\nworkflow.add_edge(START, \"conversation\")\nworkflow.add_conditional_edges(\"conversation\", should_continue)\nworkflow.add_edge(\"summarize_conversation\", END)\napp = workflow.compile(checkpointer=InMemorySaver())"
      },
      "note": {
        "zh": "接着第一部分的导入往下写（`model`、`MessagesState`、`START`、`END`、`InMemorySaver`）。完整可运行版：`practice/l32_summary_solution.py`。\n- `-> Literal[\"summarize_conversation\", END]` 写明路由函数只会返回这两个值（`Literal` 回顾 28 节），LangGraph 据此知道条件边通向哪里，所以 `add_conditional_edges` 不用再写第三个参数。\n- `add_node(summarize_conversation)` 只传函数时，节点名就是函数名。",
        "en": "This continues from part 1's imports (`model`, `MessagesState`, `START`, `END`, `InMemorySaver`). Full runnable version: `practice/l32_summary_solution.py`.\n- `-> Literal[\"summarize_conversation\", END]` states that the router only returns these two values (`Literal`: see lesson 28); LangGraph reads it to know where the edge can go, so `add_conditional_edges` needs no third argument.\n- `add_node(summarize_conversation)` with only a function names the node after the function."
      }
    },
    {
      "t": "p",
      "zh": "**`RemoveMessage` 是怎么删掉消息的？** 节点不能直接修改 `state[\"messages\"]`，只能**返回更新**；而 `messages` 的 reducer 是 `add_messages`，返回的消息默认会被追加。所以 LangChain 约定了一种特殊消息 `RemoveMessage(id=...)`：`add_messages` 看到它，就把这个 id 对应的消息从列表里**删掉**。每条消息进入状态时都会被分配一个唯一的 `id`，用 `m.id` 读到。下面用纯 Python 写一个简化版，可以直接在浏览器里运行：",
      "en": "**How does `RemoveMessage` delete messages?** A node can't edit `state[\"messages\"]` directly – it can only **return updates**, and `messages` uses the `add_messages` reducer, which appends. So LangChain defines a special message, `RemoveMessage(id=...)`: when `add_messages` sees it, it **removes** the message with that id. Every message gets a unique `id` when it enters the state; read it with `m.id`. Here is a simplified version in plain Python that runs in the browser:"
    },
    {
      "t": "code",
      "file": "add_messages_demo.py",
      "run": true,
      "code": {
        "zh": "def add_messages_demo(old, new):\n    # 简化版 add_messages：普通消息追加到末尾；type 为 \"remove\" 的按 id 删除\n    result = list(old)                      # 复制一份，不改原列表\n    for msg in new:\n        if msg[\"type\"] == \"remove\":\n            result = [m for m in result if m[\"id\"] != msg[\"id\"]]\n        else:\n            result.append(msg)\n    return result\n\nstate = [\n    {\"id\": \"1\", \"type\": \"human\", \"content\": \"你好，我是托米\"},\n    {\"id\": \"2\", \"type\": \"ai\", \"content\": \"你好托米\"},\n    {\"id\": \"3\", \"type\": \"human\", \"content\": \"我喜欢 AI 应用开发\"},\n    {\"id\": \"4\", \"type\": \"ai\", \"content\": \"很棒的方向\"},\n]\n\n# summarize_conversation 返回的更新：删除除最后 2 条以外的消息\nupdate = [{\"id\": m[\"id\"], \"type\": \"remove\"} for m in state[:-2]]\nstate = add_messages_demo(state, update)\nfor m in state:\n    print(m[\"id\"], m[\"type\"], m[\"content\"])\n\n# 再追加一条新消息\nstate = add_messages_demo(state, [{\"id\": \"5\", \"type\": \"human\", \"content\": \"我叫什么名字？\"}])\nprint(\"现在有\", len(state), \"条消息\")",
        "en": "def add_messages_demo(old, new):\n    # simplified add_messages: append normal messages; delete by id when type is \"remove\"\n    result = list(old)                      # copy, so the original list is left alone\n    for msg in new:\n        if msg[\"type\"] == \"remove\":\n            result = [m for m in result if m[\"id\"] != msg[\"id\"]]\n        else:\n            result.append(msg)\n    return result\n\nstate = [\n    {\"id\": \"1\", \"type\": \"human\", \"content\": \"Hi, I'm Tommy\"},\n    {\"id\": \"2\", \"type\": \"ai\", \"content\": \"Hi Tommy\"},\n    {\"id\": \"3\", \"type\": \"human\", \"content\": \"I like building AI apps\"},\n    {\"id\": \"4\", \"type\": \"ai\", \"content\": \"Great direction\"},\n]\n\n# the update summarize_conversation returns: delete everything except the last 2\nupdate = [{\"id\": m[\"id\"], \"type\": \"remove\"} for m in state[:-2]]\nstate = add_messages_demo(state, update)\nfor m in state:\n    print(m[\"id\"], m[\"type\"], m[\"content\"])\n\n# append one more message\nstate = add_messages_demo(state, [{\"id\": \"5\", \"type\": \"human\", \"content\": \"What's my name?\"}])\nprint(\"now there are\", len(state), \"messages\")"
      },
      "note": {
        "zh": "真正的 `add_messages` 还多一条规则：新消息的 id 如果和已有消息相同，就**替换**那条消息，而不是追加。第 36 节「编辑图的状态」会用到这一点。",
        "en": "The real `add_messages` has one more rule: a new message whose id matches an existing one **replaces** it instead of being appended. Lesson 36 (editing graph state) relies on this."
      }
    },
    {
      "t": "warn",
      "zh": "删除时要注意：删掉的 id 必须存在，否则报 `ValueError: Attempting to delete a message with an ID that doesn't exist`。另外别忘了在 `State` 里声明 `summary: str`——没声明的字段，节点返回了也会被**悄悄丢掉**，不报错，表现为「明明总结了，模型却什么都不记得」。",
      "en": "When deleting: the id must exist, or you get `ValueError: Attempting to delete a message with an ID that doesn't exist`. And don't forget to declare `summary: str` in `State` – an undeclared field returned by a node is **silently dropped** with no error, which looks like “it summarised, yet the model remembers nothing”."
    },
    {
      "t": "h",
      "zh": "六、运行一遍，看记忆怎样被压缩",
      "en": "6. A full run: watching memory get compressed"
    },
    {
      "t": "p",
      "zh": "[▶ 16:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=993) 运行前，老师先把打印函数升级成 `print_update`，好看清记忆变化的过程。这次用 `stream_mode=\"updates\"`：它每一步只交出**这个节点返回的更新**，格式是 `{节点名: 更新内容}`，正好能看到总结节点删了什么、写了什么摘要。因为这种模式不会交出输入，所以用户的话要自己先 `pretty_print()`。",
      "en": "[▶ 16:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=993) Before running, the instructor upgrades the printing to a `print_update` function so the memory process is visible. This time it uses `stream_mode=\"updates\"`: each step hands over only **the update that node returned**, shaped like `{node name: update}`, which shows exactly what the summary node deleted and what summary it wrote. Since this mode doesn't hand back the input, the user's line is `pretty_print()`ed first."
    },
    {
      "t": "code",
      "file": "run_summary.py",
      "code": {
        "zh": "def print_update(update):\n    for node_name, values in update.items():         # .items()：同时取出键和值\n        for m in values[\"messages\"]:\n            m.pretty_print()\n        if \"summary\" in values:\n            print(values[\"summary\"])\n\ndef chat(text, config):\n    input_message = HumanMessage(content=text)\n    input_message.pretty_print()                     # updates 模式不会交出输入，自己先打印\n    for event in app.stream({\"messages\": [input_message]}, config, stream_mode=\"updates\"):\n        print_update(event)\n\nconfig = {\"configurable\": {\"thread_id\": \"4\"}}\nchat(\"你好，我是托米\", config)\nchat(\"我叫什么名字？\", config)\nchat(\"我喜欢 AI 应用开发\", config)\nprint(app.get_state(config).values)                  # 看看原始的状态：6 条消息，还没有摘要\nchat(\"我更喜欢 Python\", config)                       # 这一轮答完共 8 条 → 触发总结\nprint(app.get_state(config).values)                  # 只剩 2 条消息 + 一份摘要\nchat(\"我叫什么名字？\", config)                        # 靠摘要答出名字",
        "en": "def print_update(update):\n    for node_name, values in update.items():         # .items(): each key with its value\n        for m in values[\"messages\"]:\n            m.pretty_print()\n        if \"summary\" in values:\n            print(values[\"summary\"])\n\ndef chat(text, config):\n    input_message = HumanMessage(content=text)\n    input_message.pretty_print()                     # updates mode doesn't hand back the input\n    for event in app.stream({\"messages\": [input_message]}, config, stream_mode=\"updates\"):\n        print_update(event)\n\nconfig = {\"configurable\": {\"thread_id\": \"4\"}}\nchat(\"Hi, I'm Tommy\", config)\nchat(\"What's my name?\", config)\nchat(\"I like building AI applications\", config)\nprint(app.get_state(config).values)                  # the raw state: 6 messages, no summary yet\nchat(\"I prefer Python\", config)                      # 8 messages after this answer -> summary\nprint(app.get_state(config).values)                  # only 2 messages left + a summary\nchat(\"What's my name?\", config)                      # answered from the summary"
      },
      "note": {
        "zh": "`update.items()` 同时取出字典的每个键和值（回顾 08 节）。删除消息时 `values[\"messages\"]` 里是一串 `RemoveMessage`，`pretty_print()` 会打印成一行行「Remove Message」。",
        "en": "`update.items()` gives each key of the dict together with its value (see lesson 08). When messages are deleted, `values[\"messages\"]` holds `RemoveMessage`s, which `pretty_print()` shows as a row of “Remove Message” headers."
      }
    },
    {
      "t": "p",
      "zh": "老师的运行过程（`thread_id=\"4\"`）：\n1. [▶ 17:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=1024) 三轮对话：「我是托米」「我叫什么名字？」「我喜欢 AI 应用开发」——每轮一问一答，一共 6 条消息，没有超过阈值，所以没有出现摘要\n2. [▶ 18:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=1089) 用 `app.get_state(config).values` 直接看原始状态：6 条消息都在，还没有 `summary`\n3. [▶ 18:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=1120) 第四轮「我更喜欢 Python」：模型回答后变成 8 条，超过 6 条，触发总结\n4. [▶ 19:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=1152) 前面的消息一条条被 remove，同时生成了一份摘要，概括了自我介绍、名字托米、偏好 Python 等要点；[▶ 19:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=1187) 再看原始状态，消息只剩最后一问一答\n5. [▶ 20:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=1217) 再问「我叫什么名字？」：说名字的那条消息早就删了，但摘要还在，模型照样答出托米\n\n[▶ 20:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=1247) 阈值为什么这样算：`should_continue` 判断的是「消息**超过 6 条**」，三轮对话正好 6 条（人和 AI 各 3 条），不触发；再加一轮就触发了。这样聊天记录大幅缩短，核心信息又保住了——老师说这是实际应用开发里最常见的记忆管理方式。",
      "en": "The instructor's run (`thread_id=\"4\"`):\n1. [▶ 17:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=1024) Three turns: “I'm Tommy”, “What's my name?”, “I like building AI applications” – one question and one answer each, 6 messages in total, not over the threshold, so no summary appears\n2. [▶ 18:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=1089) `app.get_state(config).values` shows the raw state: all 6 messages, no `summary` yet\n3. [▶ 18:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=1120) Turn 4, “I prefer Python”: after the answer there are 8 messages, more than 6, so the summary kicks in\n4. [▶ 19:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=1152) The earlier messages are removed one by one and a summary is written, covering the introduction, the name Tommy, the preference for Python and so on; [▶ 19:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=1187) the raw state now holds only the last question and answer\n5. [▶ 20:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=1217) Asked “What's my name?” again: the message with the name is long gone, but the summary remains, so the model still says Tommy\n\n[▶ 20:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=1247) Why the threshold works this way: `should_continue` checks for **more than 6** messages; three turns make exactly 6 (3 from the user, 3 from the AI), which doesn't trigger it, and one more turn does. The chat history shrinks dramatically while the key facts survive – the instructor calls this the most common way to manage memory in real applications."
    },
    {
      "t": "note",
      "zh": "[▶ 17:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=1057) 视频中途有一处口误，听起来像是「阈值是两条」；[▶ 20:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=1247) 老师后面讲清楚了，判断条件是「消息超过 6 条」，以代码为准。",
      "en": "[▶ 17:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=1057) Midway the instructor misspeaks and seems to say the threshold is “two”; [▶ 20:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=33&t=1247) he later makes clear the condition is “more than 6 messages” – trust the code."
    },
    {
      "t": "check",
      "q": {
        "zh": "第四轮回答之后 `summarize_conversation` 运行完，状态里还剩几条消息？",
        "en": "After the 4th answer, once `summarize_conversation` has run, how many messages are left in the state?"
      },
      "options": [
        {
          "zh": "8 条",
          "en": "8"
        },
        {
          "zh": "6 条",
          "en": "6"
        },
        {
          "zh": "0 条",
          "en": "0"
        },
        {
          "zh": "2 条",
          "en": "2"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "`state[\"messages\"][:-2]` 里的消息都被 `RemoveMessage` 删除，只留最后一问一答；被删的内容保存在 `summary` 里。",
        "en": "Everything in `state[\"messages\"][:-2]` is deleted with `RemoveMessage`, leaving the last question and answer; the deleted content lives on in `summary`."
      }
    },
    {
      "t": "tip",
      "zh": "两种办法怎么选：\n\n| 办法 | 状态里的历史 | 早期信息 | 额外开销 |\n|---|---|---|---|\n| 过滤（只发最近几条） | 不变，只是少发 | 模型看不到，会忘 | 无 |\n| 总结 + `RemoveMessage` | 变短，多一段摘要 | 细节丢了，要点保留 | 每次总结多一次模型调用 |",
      "en": "How to choose:\n\n| Method | History in the state | Early information | Extra cost |\n|---|---|---|---|\n| Filtering (send only the latest few) | Unchanged, less is sent | Invisible to the model, so forgotten | None |\n| Summary + `RemoveMessage` | Shorter, plus a summary | Details lost, gist kept | One extra model call per summary |"
    },
    {
      "t": "note",
      "zh": "补充：LangChain 1.x 给 `create_agent` 准备了现成的 `SummarizationMiddleware`（49 节会讲中间件），原理和这里手写的一样：超过阈值就总结旧消息、保留最近几条。",
      "en": "Extra: LangChain 1.x ships a ready-made `SummarizationMiddleware` for `create_agent` (middleware is covered in lesson 49); the principle is the same as the hand-written version: past a threshold, summarise old messages and keep the latest few."
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "给第一部分的 ReAct 智能体加上多轮记忆，最关键的改动是哪一处？",
        "en": "What is the key change that gives part 1's ReAct agent multi-turn memory?"
      },
      "options": [
        {
          "zh": "给 `search` 工具加 docstring",
          "en": "Adding a docstring to the `search` tool"
        },
        {
          "zh": "`workflow.compile(checkpointer=InMemorySaver())`，并在调用时传 thread_id",
          "en": "`workflow.compile(checkpointer=InMemorySaver())`, plus a thread_id on each call"
        },
        {
          "zh": "把 `ToolNode` 换成普通函数",
          "en": "Replacing `ToolNode` with a plain function"
        },
        {
          "zh": "把 `stream` 换成 `invoke`",
          "en": "Switching `stream` to `invoke`"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "智能体的其余代码不用改：选好记忆组件，放进 checkpointer 就行。",
        "en": "The rest of the agent stays the same: pick a memory component and plug it in as the checkpointer."
      }
    },
    {
      "q": {
        "zh": "`ToolNode(tools)` 负责做什么？",
        "en": "What does `ToolNode(tools)` do?"
      },
      "options": [
        {
          "zh": "执行最后一条 AI 消息里的工具调用，把结果包成 tool 消息",
          "en": "Runs the tool calls in the last AI message and wraps the results as tool messages"
        },
        {
          "zh": "把工具说明交给模型",
          "en": "Hands the tool descriptions to the model"
        },
        {
          "zh": "决定下一步去哪个节点",
          "en": "Decides which node runs next"
        },
        {
          "zh": "保存对话历史",
          "en": "Saves the conversation history"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "把工具说明交给模型的是 `bind_tools`，决定去向的是条件边，保存历史的是 checkpointer。",
        "en": "Handing descriptions to the model is `bind_tools`, routing is the conditional edge, and saving history is the checkpointer."
      }
    },
    {
      "q": {
        "zh": "视频用 `MongoDBSaver` + `create_react_agent`。在本课程环境里对应的写法是？",
        "en": "The video uses `MongoDBSaver` + `create_react_agent`. What is the equivalent in this course environment?"
      },
      "options": [
        {
          "zh": "`InMemoryStore` + `ToolNode`",
          "en": "`InMemoryStore` + `ToolNode`"
        },
        {
          "zh": "`trim_messages` + `create_agent`",
          "en": "`trim_messages` + `create_agent`"
        },
        {
          "zh": "`SqliteSaver` + `create_agent(..., system_prompt=..., checkpointer=...)`",
          "en": "`SqliteSaver` + `create_agent(..., system_prompt=..., checkpointer=...)`"
        },
        {
          "zh": "不需要任何检查点，DeepSeek 会自己记住",
          "en": "No checkpointer – DeepSeek remembers by itself"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "都是「把检查点写进数据库」：SQLite 是一个文件，不用装服务；`create_react_agent` 已弃用，换成 `create_agent`，`prompt` 改叫 `system_prompt`。",
        "en": "Both put checkpoints in a database: SQLite is one file with no server; `create_react_agent` is deprecated in favour of `create_agent`, where `prompt` is called `system_prompt`."
      }
    },
    {
      "q": {
        "zh": "`filter_messages` 只返回 `messages[-1:]`。第二句问「我叫什么名字？」时为什么答不上来？",
        "en": "`filter_messages` returns only `messages[-1:]`. Why can't the agent answer “What's my name?”"
      },
      "options": [
        {
          "zh": "因为 checkpointer 没有保存第一句",
          "en": "The checkpointer didn't save the first line"
        },
        {
          "zh": "因为 `ToolNode` 删除了旧消息",
          "en": "`ToolNode` deleted the old messages"
        },
        {
          "zh": "因为 thread_id 变了",
          "en": "The thread_id changed"
        },
        {
          "zh": "消息都存着，但发给模型的只有最后一条，模型看不到自我介绍",
          "en": "Everything is saved, but only the last message is sent, so the model never sees the introduction"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "过滤只影响发给模型的内容，状态里的历史是完整的；代价是模型「失忆」。",
        "en": "Filtering only affects what is sent; the state's history is complete – the price is a model with amnesia."
      }
    },
    {
      "q": {
        "zh": "节点想删除 id 为 `\"abc\"` 的消息，应该怎么做？",
        "en": "A node wants to delete the message with id `\"abc\"`. What should it do?"
      },
      "options": [
        {
          "zh": "直接执行 `state[\"messages\"].remove(...)`",
          "en": "Run `state[\"messages\"].remove(...)` directly"
        },
        {
          "zh": "返回 `{\"messages\": [RemoveMessage(id=\"abc\")]}`",
          "en": "Return `{\"messages\": [RemoveMessage(id=\"abc\")]}`"
        },
        {
          "zh": "返回 `{\"messages\": []}`",
          "en": "Return `{\"messages\": []}`"
        },
        {
          "zh": "返回 `{\"delete\": \"abc\"}`",
          "en": "Return `{\"delete\": \"abc\"}`"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "节点只返回更新；`add_messages` 看到 `RemoveMessage` 就按 id 删除。返回空列表什么也不会删。",
        "en": "Nodes only return updates; `add_messages` deletes by id when it sees a `RemoveMessage`. An empty list deletes nothing."
      }
    },
    {
      "q": {
        "zh": "`should_continue` 的条件是 `len(messages) > 6`。下面哪种情况会触发总结？",
        "en": "`should_continue` checks `len(messages) > 6`. Which case triggers the summary?"
      },
      "options": [
        {
          "zh": "第三轮回答之后（共 6 条）",
          "en": "After the third answer (6 messages)"
        },
        {
          "zh": "第一轮回答之后（共 2 条）",
          "en": "After the first answer (2 messages)"
        },
        {
          "zh": "第四轮回答之后（共 8 条）",
          "en": "After the fourth answer (8 messages)"
        },
        {
          "zh": "只要用户说了「总结」两个字",
          "en": "Whenever the user says “summarise”"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "6 条不大于 6，不触发；第四轮后 8 条大于 6，进入 `summarize_conversation`，删到只剩 2 条。",
        "en": "6 is not more than 6, so nothing happens; after turn 4 there are 8, more than 6, so `summarize_conversation` runs and cuts it down to 2."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "带记忆的 ReAct 智能体",
        "en": "A ReAct agent with memory"
      },
      "code": {
        "zh": "tool_node = [[ToolNode]](tools)\nbound_model = model.[[bind_tools]](tools)\n\ndef should_continue(state: MessagesState):\n    last_message = state[\"messages\"][-1]\n    if not last_message.[[tool_calls]]:\n        return [[END]]\n    return \"action\"\n\nworkflow.add_edge(START, \"agent\")\nworkflow.[[add_conditional_edges]](\"agent\", should_continue, [\"action\", END])\nworkflow.add_edge(\"[[action]]\", \"agent\")\napp = workflow.compile([[checkpointer]]=InMemorySaver())",
        "en": "tool_node = [[ToolNode]](tools)\nbound_model = model.[[bind_tools]](tools)\n\ndef should_continue(state: MessagesState):\n    last_message = state[\"messages\"][-1]\n    if not last_message.[[tool_calls]]:\n        return [[END]]\n    return \"action\"\n\nworkflow.add_edge(START, \"agent\")\nworkflow.[[add_conditional_edges]](\"agent\", should_continue, [\"action\", END])\nworkflow.add_edge(\"[[action]]\", \"agent\")\napp = workflow.compile([[checkpointer]]=InMemorySaver())"
      },
      "explain": {
        "zh": "`ToolNode` 执行工具，`bind_tools` 把工具交给模型；没有工具调用就结束；工具执行完回到 agent；装上 checkpointer 才有多轮记忆。",
        "en": "`ToolNode` runs tools and `bind_tools` hands them to the model; with no tool calls, finish; after a tool, back to the agent; the checkpointer gives multi-turn memory."
      }
    },
    {
      "title": {
        "zh": "总结节点",
        "en": "The summary node"
      },
      "code": {
        "zh": "class State([[MessagesState]]):\n    summary: [[str]]\n\ndef summarize_conversation(state: State):\n    summary = state.[[get]](\"summary\", \"\")\n    if summary:\n        summary_message = f\"这是目前为止的对话摘要：{summary}\\n\\n请结合上面的新消息，扩展这份摘要：\"\n    else:\n        summary_message = \"请为上面的对话写一份摘要：\"\n    response = model.invoke(state[\"messages\"] + [HumanMessage(content=summary_message)])\n    delete_messages = [\n        [[RemoveMessage]](id=m.[[id]]) for m in state[\"messages\"][:[[-2]]]\n    ]\n    return {\"[[summary]]\": response.content, \"messages\": delete_messages}",
        "en": "class State([[MessagesState]]):\n    summary: [[str]]\n\ndef summarize_conversation(state: State):\n    summary = state.[[get]](\"summary\", \"\")\n    if summary:\n        summary_message = f\"This is the summary of the conversation to date: {summary}\\n\\nExtend the summary by taking into account the new messages above:\"\n    else:\n        summary_message = \"Create a summary of the conversation above:\"\n    response = model.invoke(state[\"messages\"] + [HumanMessage(content=summary_message)])\n    delete_messages = [\n        [[RemoveMessage]](id=m.[[id]]) for m in state[\"messages\"][:[[-2]]]\n    ]\n    return {\"[[summary]]\": response.content, \"messages\": delete_messages}"
      },
      "explain": {
        "zh": "State 继承 MessagesState 再加 summary；用 `.get` 读可能不存在的摘要；`[:-2]` 是「除最后 2 条以外」；返回新摘要和删除列表。",
        "en": "State inherits MessagesState and adds summary; `.get` reads a summary that may be missing; `[:-2]` is “all but the last 2”; return the new summary and the deletions."
      }
    },
    {
      "title": {
        "zh": "什么时候去总结",
        "en": "When to summarise"
      },
      "code": "def should_continue(state: State) -> Literal[\"summarize_conversation\", END]:\n    if [[len]](state[\"messages\"]) > [[6]]:\n        return \"[[summarize_conversation]]\"\n    return END\n\nworkflow.add_node(\"conversation\", call_model)\nworkflow.add_node(summarize_conversation)\nworkflow.add_edge(START, \"conversation\")\nworkflow.[[add_conditional_edges]](\"conversation\", should_continue)\nworkflow.add_edge(\"summarize_conversation\", [[END]])\napp = workflow.compile(checkpointer=InMemorySaver())",
      "explain": {
        "zh": "路由函数用 `Literal` 写明可能的去向，所以条件边不用第三个参数；总结完直接结束。",
        "en": "The router declares its targets with `Literal`, so the conditional edge needs no third argument; after summarising, the run ends."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：用总结优化记忆",
        "en": "Write it: optimise memory with summaries"
      },
      "task": {
        "zh": "不看上面的代码，在已经导入好的基础上写出视频第三部分的总结记忆：\n1. `State`：继承 `MessagesState`，加字段 `summary: str`\n2. `call_model`：有摘要时把 `SystemMessage(...)` 放在消息最前面，再调用模型\n3. `should_continue`：消息超过 6 条返回 `\"summarize_conversation\"`，否则返回 `END`\n4. `summarize_conversation`：让模型写（或扩展）摘要；返回新摘要，并用 `RemoveMessage` 删除除最后 2 条以外的消息\n5. 建图：START → conversation，条件边到 summarize_conversation 或 END，summarize_conversation → END，编译时加 checkpointer\n\n写完可以对照 `practice/l32_summary_todo.py` 补全并运行（6 次 DeepSeek 调用）。",
        "en": "Without looking above, starting from the given imports, write part 3's summary memory:\n1. `State`: inherit `MessagesState` and add `summary: str`\n2. `call_model`: if there is a summary, put a `SystemMessage(...)` first, then call the model\n3. `should_continue`: return `\"summarize_conversation\"` for more than 6 messages, else `END`\n4. `summarize_conversation`: have the model write (or extend) the summary; return it and delete all but the last 2 messages with `RemoveMessage`\n5. Build the graph: START → conversation, a conditional edge to summarize_conversation or END, summarize_conversation → END, compiled with a checkpointer\n\nThen complete `practice/l32_summary_todo.py` the same way and run it (6 DeepSeek calls)."
      },
      "starter": {
        "zh": "from typing import Literal\nfrom langchain_core.messages import HumanMessage, RemoveMessage, SystemMessage\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 1. State：继承 MessagesState，加 summary\n\n\n# 2. call_model：有摘要时把 SystemMessage 放在最前面\n\n\n# 3. should_continue：超过 6 条去 \"summarize_conversation\"，否则 END\n\n\n# 4. summarize_conversation：写或扩展摘要，删除除最后 2 条以外的消息\n\n\n# 5. 建图并编译",
        "en": "from typing import Literal\nfrom langchain_core.messages import HumanMessage, RemoveMessage, SystemMessage\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 1. State: inherit MessagesState, add summary\n\n\n# 2. call_model: put a SystemMessage first when there is a summary\n\n\n# 3. should_continue: more than 6 -> \"summarize_conversation\", otherwise END\n\n\n# 4. summarize_conversation: write or extend the summary, delete all but the last 2 messages\n\n\n# 5. build and compile the graph"
      },
      "solution": {
        "zh": "from typing import Literal\nfrom langchain_core.messages import HumanMessage, RemoveMessage, SystemMessage\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 1. State：继承 MessagesState，加 summary\nclass State(MessagesState):\n    summary: str\n\n# 2. call_model：有摘要时把 SystemMessage 放在最前面\ndef call_model(state: State):\n    summary = state.get(\"summary\", \"\")\n    if summary:\n        messages = [SystemMessage(content=f\"之前对话的摘要：{summary}\")] + state[\"messages\"]\n    else:\n        messages = state[\"messages\"]\n    response = model.invoke(messages)\n    return {\"messages\": [response]}\n\n# 3. should_continue：超过 6 条去 \"summarize_conversation\"，否则 END\ndef should_continue(state: State) -> Literal[\"summarize_conversation\", END]:\n    if len(state[\"messages\"]) > 6:\n        return \"summarize_conversation\"\n    return END\n\n# 4. summarize_conversation：写或扩展摘要，删除除最后 2 条以外的消息\ndef summarize_conversation(state: State):\n    summary = state.get(\"summary\", \"\")\n    if summary:\n        summary_message = f\"这是目前为止的对话摘要：{summary}\\n\\n请结合上面的新消息，扩展这份摘要：\"\n    else:\n        summary_message = \"请为上面的对话写一份摘要：\"\n    response = model.invoke(state[\"messages\"] + [HumanMessage(content=summary_message)])\n    delete_messages = [RemoveMessage(id=m.id) for m in state[\"messages\"][:-2]]\n    return {\"summary\": response.content, \"messages\": delete_messages}\n\n# 5. 建图并编译\nworkflow = StateGraph(State)\nworkflow.add_node(\"conversation\", call_model)\nworkflow.add_node(summarize_conversation)\nworkflow.add_edge(START, \"conversation\")\nworkflow.add_conditional_edges(\"conversation\", should_continue)\nworkflow.add_edge(\"summarize_conversation\", END)\napp = workflow.compile(checkpointer=InMemorySaver())",
        "en": "from typing import Literal\nfrom langchain_core.messages import HumanMessage, RemoveMessage, SystemMessage\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 1. State: inherit MessagesState, add summary\nclass State(MessagesState):\n    summary: str\n\n# 2. call_model: put a SystemMessage first when there is a summary\ndef call_model(state: State):\n    summary = state.get(\"summary\", \"\")\n    if summary:\n        messages = [SystemMessage(content=f\"Summary of the conversation earlier: {summary}\")] + state[\"messages\"]\n    else:\n        messages = state[\"messages\"]\n    response = model.invoke(messages)\n    return {\"messages\": [response]}\n\n# 3. should_continue: more than 6 -> \"summarize_conversation\", otherwise END\ndef should_continue(state: State) -> Literal[\"summarize_conversation\", END]:\n    if len(state[\"messages\"]) > 6:\n        return \"summarize_conversation\"\n    return END\n\n# 4. summarize_conversation: write or extend the summary, delete all but the last 2 messages\ndef summarize_conversation(state: State):\n    summary = state.get(\"summary\", \"\")\n    if summary:\n        summary_message = f\"This is the summary of the conversation to date: {summary}\\n\\nExtend the summary by taking into account the new messages above:\"\n    else:\n        summary_message = \"Create a summary of the conversation above:\"\n    response = model.invoke(state[\"messages\"] + [HumanMessage(content=summary_message)])\n    delete_messages = [RemoveMessage(id=m.id) for m in state[\"messages\"][:-2]]\n    return {\"summary\": response.content, \"messages\": delete_messages}\n\n# 5. build and compile the graph\nworkflow = StateGraph(State)\nworkflow.add_node(\"conversation\", call_model)\nworkflow.add_node(summarize_conversation)\nworkflow.add_edge(START, \"conversation\")\nworkflow.add_conditional_edges(\"conversation\", should_continue)\nworkflow.add_edge(\"summarize_conversation\", END)\napp = workflow.compile(checkpointer=InMemorySaver())"
      },
      "checks": [
        {
          "zh": "`State` 继承 `MessagesState`",
          "en": "`State` inherits `MessagesState`",
          "re": "class\\s+State\\s*\\(\\s*MessagesState\\s*\\)\\s*:"
        },
        {
          "zh": "声明了字段 `summary: str`",
          "en": "Declares the field `summary: str`",
          "re": "^\\s+summary\\s*:\\s*str"
        },
        {
          "zh": "用 `state.get(\"summary\", ...)` 读摘要",
          "en": "Reads the summary with `state.get(\"summary\", ...)`",
          "re": "state\\.get\\(\\s*[\\\"']summary[\\\"']"
        },
        {
          "zh": "把摘要包成 `SystemMessage(...)`",
          "en": "Wraps the summary in `SystemMessage(...)`",
          "re": "SystemMessage\\("
        },
        {
          "zh": "用 `len(state[\"messages\"]) > 6` 判断",
          "en": "Checks `len(state[\"messages\"]) > 6`",
          "re": "len\\(\\s*state\\[[\\\"']messages[\\\"']\\]\\s*\\)\\s*>\\s*6"
        },
        {
          "zh": "用 `RemoveMessage(id=m.id)` 删除",
          "en": "Deletes with `RemoveMessage(id=m.id)`",
          "re": "RemoveMessage\\(\\s*id\\s*=\\s*\\w+\\.id\\s*\\)"
        },
        {
          "zh": "保留最后 2 条：`[:-2]`",
          "en": "Keeps the last 2: `[:-2]`",
          "re": "\\[\\s*:\\s*-\\s*2\\s*\\]"
        },
        {
          "zh": "返回新的 `summary`",
          "en": "Returns the new `summary`",
          "re": "return\\s*\\{\\s*[\\\"']summary[\\\"']\\s*:"
        },
        {
          "zh": "用 `add_conditional_edges` 接上 `should_continue`",
          "en": "Wires `should_continue` with `add_conditional_edges`",
          "re": "add_conditional_edges\\(\\s*[\\\"']conversation[\\\"']\\s*,\\s*should_continue"
        },
        {
          "zh": "编译时加 checkpointer",
          "en": "Compiles with a checkpointer",
          "re": "compile\\(\\s*checkpointer\\s*="
        }
      ]
    },
    {
      "title": {
        "zh": "手写：带记忆的 ReAct 智能体",
        "en": "Write it: a ReAct agent with memory"
      },
      "task": {
        "zh": "写出视频第一部分的智能体：\n1. 用 `@tool` 定义模拟搜索工具 `search(query: str)`，不管搜什么都返回一句固定的文字\n2. `ToolNode(tools)`，以及 `model.bind_tools(tools)` 得到 `bound_model`\n3. `should_continue`：最后一条消息没有 `tool_calls` 就返回 `END`，否则返回 `\"action\"`\n4. `call_model`：用 `bound_model` 回答\n5. 建图：`agent`、`action` 两个节点；START → agent；条件边；action → agent；编译时加 `InMemorySaver()`\n6. 用 `thread_id` \"20\" 先自我介绍，再问名字\n\n可以对照 `practice/l32_react_memory_todo.py` 补全并运行（2 次 DeepSeek 调用）。",
        "en": "Write the agent from part 1 of the video:\n1. a simulated search tool `search(query: str)` with `@tool` that returns the same sentence for any query\n2. `ToolNode(tools)`, and `model.bind_tools(tools)` as `bound_model`\n3. `should_continue`: `END` when the last message has no `tool_calls`, otherwise `\"action\"`\n4. `call_model`: answer with `bound_model`\n5. the graph: nodes `agent` and `action`; START → agent; the conditional edge; action → agent; compiled with `InMemorySaver()`\n6. on `thread_id` \"20\", introduce yourself, then ask your name\n\nYou can complete and run `practice/l32_react_memory_todo.py` the same way (2 DeepSeek calls)."
      },
      "starter": {
        "zh": "from langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom langgraph.prebuilt import ToolNode\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 1. 用 @tool 定义模拟搜索工具 search(query: str)，返回一句固定的文字\n\n\n# 2. ToolNode 和 bind_tools\n\n\n# 3. should_continue：没有工具调用返回 END，否则返回 \"action\"\n\n\n# 4. call_model：用绑定了工具的模型回答\n\n\n# 5. 建图：agent、action 两个节点，条件边，action -> agent，编译时加 checkpointer\n\n\n# 6. thread_id \"20\"：先自我介绍，再问名字",
        "en": "from langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom langgraph.prebuilt import ToolNode\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 1. define a simulated search tool search(query: str) with @tool, returning a fixed sentence\n\n\n# 2. ToolNode and bind_tools\n\n\n# 3. should_continue: END when there are no tool calls, otherwise \"action\"\n\n\n# 4. call_model: answer with the tool-aware model\n\n\n# 5. the graph: nodes agent and action, the conditional edge, action -> agent, compiled with a checkpointer\n\n\n# 6. thread_id \"20\": introduce yourself, then ask your name"
      },
      "solution": {
        "zh": "from langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom langgraph.prebuilt import ToolNode\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 1. 用 @tool 定义模拟搜索工具 search(query: str)，返回一句固定的文字\n@tool\ndef search(query: str):\n    \"\"\"模拟联网搜索。\"\"\"\n    return \"（模拟搜索结果）今天北京晴，气温 20 度左右。\"\n\n# 2. ToolNode 和 bind_tools\ntools = [search]\ntool_node = ToolNode(tools)\nbound_model = model.bind_tools(tools)\n\n# 3. should_continue：没有工具调用返回 END，否则返回 \"action\"\ndef should_continue(state: MessagesState):\n    last_message = state[\"messages\"][-1]\n    if not last_message.tool_calls:\n        return END\n    return \"action\"\n\n# 4. call_model：用绑定了工具的模型回答\ndef call_model(state: MessagesState):\n    response = bound_model.invoke(state[\"messages\"])\n    return {\"messages\": [response]}\n\n# 5. 建图：agent、action 两个节点，条件边，action -> agent，编译时加 checkpointer\nworkflow = StateGraph(MessagesState)\nworkflow.add_node(\"agent\", call_model)\nworkflow.add_node(\"action\", tool_node)\nworkflow.add_edge(START, \"agent\")\nworkflow.add_conditional_edges(\"agent\", should_continue, [\"action\", END])\nworkflow.add_edge(\"action\", \"agent\")\napp = workflow.compile(checkpointer=InMemorySaver())\n\n# 6. thread_id \"20\"：先自我介绍，再问名字\nconfig = {\"configurable\": {\"thread_id\": \"20\"}}\nfor text in [\"你好，我是托米\", \"我叫什么名字？\"]:\n    out = app.invoke({\"messages\": [{\"role\": \"user\", \"content\": text}]}, config)\n    print(out[\"messages\"][-1].content)",
        "en": "from langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom langgraph.prebuilt import ToolNode\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 1. define a simulated search tool search(query: str) with @tool, returning a fixed sentence\n@tool\ndef search(query: str):\n    \"\"\"Simulated web search.\"\"\"\n    return \"(mock search result) Sunny in Beijing today, around 20 degrees.\"\n\n# 2. ToolNode and bind_tools\ntools = [search]\ntool_node = ToolNode(tools)\nbound_model = model.bind_tools(tools)\n\n# 3. should_continue: END when there are no tool calls, otherwise \"action\"\ndef should_continue(state: MessagesState):\n    last_message = state[\"messages\"][-1]\n    if not last_message.tool_calls:\n        return END\n    return \"action\"\n\n# 4. call_model: answer with the tool-aware model\ndef call_model(state: MessagesState):\n    response = bound_model.invoke(state[\"messages\"])\n    return {\"messages\": [response]}\n\n# 5. the graph: nodes agent and action, the conditional edge, action -> agent, compiled with a checkpointer\nworkflow = StateGraph(MessagesState)\nworkflow.add_node(\"agent\", call_model)\nworkflow.add_node(\"action\", tool_node)\nworkflow.add_edge(START, \"agent\")\nworkflow.add_conditional_edges(\"agent\", should_continue, [\"action\", END])\nworkflow.add_edge(\"action\", \"agent\")\napp = workflow.compile(checkpointer=InMemorySaver())\n\n# 6. thread_id \"20\": introduce yourself, then ask your name\nconfig = {\"configurable\": {\"thread_id\": \"20\"}}\nfor text in [\"Hi, I'm Tommy\", \"What's my name?\"]:\n    out = app.invoke({\"messages\": [{\"role\": \"user\", \"content\": text}]}, config)\n    print(out[\"messages\"][-1].content)"
      },
      "checks": [
        {
          "zh": "用 `@tool` 定义 `search`",
          "en": "Defines `search` with `@tool`",
          "re": "@tool\\s*\\n\\s*def\\s+search\\s*\\("
        },
        {
          "zh": "创建 `ToolNode(tools)`",
          "en": "Creates `ToolNode(tools)`",
          "re": "ToolNode\\(\\s*tools\\s*\\)"
        },
        {
          "zh": "用 `bind_tools` 绑定工具",
          "en": "Binds the tools with `bind_tools`",
          "re": "\\.bind_tools\\(\\s*tools\\s*\\)"
        },
        {
          "zh": "没有 `tool_calls` 时返回 `END`",
          "en": "Returns `END` when there are no `tool_calls`",
          "re": "if\\s+not\\s+\\w+\\.tool_calls\\s*:\\s*\\n\\s*return\\s+END"
        },
        {
          "zh": "条件边从 `agent` 出发",
          "en": "The conditional edge starts at `agent`",
          "re": "add_conditional_edges\\(\\s*[\\\"']agent[\\\"']\\s*,\\s*should_continue"
        },
        {
          "zh": "工具执行完回到 agent：`add_edge(\"action\", \"agent\")`",
          "en": "Back to the agent after tools: `add_edge(\"action\", \"agent\")`",
          "re": "add_edge\\(\\s*[\\\"']action[\\\"']\\s*,\\s*[\\\"']agent[\\\"']\\s*\\)"
        },
        {
          "zh": "编译时加 `checkpointer=InMemorySaver()`",
          "en": "Compiles with `checkpointer=InMemorySaver()`",
          "re": "compile\\(\\s*checkpointer\\s*=\\s*(InMemorySaver|MemorySaver)\\(\\)\\s*\\)"
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "给智能体加了 checkpointer，调用时却没传 `thread_id`，报 ValueError；或者每次换一个 thread_id，结果「记不住」。",
      "en": "Adding a checkpointer to the agent but calling without a `thread_id` – ValueError; or using a new thread_id each time and wondering why it forgets."
    },
    {
      "zh": "用 `model` 而不是 `bind_tools` 返回的 `bound_model` 去调用，模型根本不知道有工具。",
      "en": "Calling `model` instead of the `bound_model` returned by `bind_tools`, so the model never learns about the tools."
    },
    {
      "zh": "把 `should_continue` 的判断写反（有工具调用就结束），工具永远不会被执行。",
      "en": "Inverting `should_continue` (ending when there is a tool call), so tools never run."
    },
    {
      "zh": "用 `SqliteSaver` 时在 `with` 块外面调用图：数据库连接已经关闭，报 `Cannot operate on a closed database`。",
      "en": "Using the graph outside the `SqliteSaver` `with` block: the connection is closed – `Cannot operate on a closed database`."
    },
    {
      "zh": "以为存进数据库的检查点能跨线程共享。它只是重启不丢，记忆仍然按 thread_id 分开。",
      "en": "Expecting database checkpoints to be shared across threads. They survive restarts, but memory is still per thread_id."
    },
    {
      "zh": "过滤时把 AI 的工具调用和它的 tool 结果拆开，发出去的第一条是 tool 消息，DeepSeek 返回 400。",
      "en": "Filtering so that an AI tool call is split from its tool result; the first message sent is a tool message and DeepSeek returns 400."
    },
    {
      "zh": "忘了在 `State` 里声明 `summary`：返回的摘要被悄悄丢掉，不报错。",
      "en": "Forgetting to declare `summary` in `State`: the returned summary is silently dropped, with no error."
    },
    {
      "zh": "用 `state[\"summary\"]` 直接取，第一次运行时 KeyError。用 `state.get(\"summary\", \"\")`。",
      "en": "Reading `state[\"summary\"]` directly – KeyError on the first run. Use `state.get(\"summary\", \"\")`."
    }
  ],
  "recap": [
    {
      "zh": "智能体的短期记忆：ReAct 图（`ToolNode` + `bind_tools` + 条件边）编译时装上 checkpointer，调用时带 thread_id。",
      "en": "An agent's short-term memory: compile the ReAct graph (`ToolNode` + `bind_tools` + a conditional edge) with a checkpointer and call it with a thread_id."
    },
    {
      "zh": "把检查点写进数据库，重启后同一个 thread_id 的对话还在：视频用 MongoDB（`MongoDBSaver`），这里用 `with SqliteSaver.from_conn_string(...)`。",
      "en": "Put checkpoints in a database and the same thread_id's conversation survives a restart: MongoDB (`MongoDBSaver`) in the video, `with SqliteSaver.from_conn_string(...)` here."
    },
    {
      "zh": "`create_react_agent` 已弃用，换成 `create_agent(model, tools=..., system_prompt=..., checkpointer=...)`。",
      "en": "`create_react_agent` is deprecated; use `create_agent(model, tools=..., system_prompt=..., checkpointer=...)`."
    },
    {
      "zh": "记忆管理是召回和精度的平衡：只发最后一条虽然省，却会失忆。",
      "en": "Managing memory balances recall and precision: sending only the last message is cheap but causes amnesia."
    },
    {
      "zh": "总结 = `summary` 字段 + 条件边（超过 6 条）+ `summarize_conversation`（写摘要、`RemoveMessage` 删到只剩 2 条）+ 回答时把摘要作为 SystemMessage 放在最前面。",
      "en": "Summarisation = a `summary` field + a conditional edge (more than 6) + `summarize_conversation` (write the summary, `RemoveMessage` down to 2) + the summary sent first as a SystemMessage."
    },
    {
      "zh": "`stream_mode=\"updates\"` 看每个节点返回的更新，`get_state(config).values` 看原始状态。",
      "en": "`stream_mode=\"updates\"` shows each node's update; `get_state(config).values` shows the raw state."
    }
  ],
  "files": [
    {
      "path": "practice/l32_react_memory_todo.py",
      "zh": "练习：补全 bind_tools、条件边、连线和 checkpointer，让 ReAct 智能体记住名字（有 TODO 提示）。",
      "en": "Exercise: fill in bind_tools, the conditional edge, the wiring and the checkpointer so the ReAct agent remembers your name (with TODO hints)."
    },
    {
      "path": "practice/l32_react_memory_solution.py",
      "zh": "参考答案：视频第一部分的智能体，thread_id 20，两轮对话（2 次 DeepSeek 调用）。",
      "en": "Solution: part 1's agent on thread_id 20, two turns (2 DeepSeek calls)."
    },
    {
      "path": "practice/l32_sqlite_weather_agent.py",
      "zh": "演示：视频第二部分的天气智能体，MongoDB 换成 SqliteSaver、create_react_agent 换成 create_agent。运行两次，第二次它还记得问过哪个城市。",
      "en": "Demo: part 2's weather agent with SqliteSaver instead of MongoDB and create_agent instead of create_react_agent. Run it twice; the second run still knows which city you asked about."
    },
    {
      "path": "practice/l32_filter_messages.py",
      "zh": "演示：只把最后一条消息发给模型的过滤，第二句就答不出名字（2 次 DeepSeek 调用）。",
      "en": "Demo: a filter that sends only the last message, so the second line can't get the name (2 DeepSeek calls)."
    },
    {
      "path": "practice/l32_summary_todo.py",
      "zh": "练习：补全 summary 字段、摘要注入、阈值判断和 RemoveMessage（有 TODO 提示）。",
      "en": "Exercise: complete the summary field, summary injection, the threshold check and RemoveMessage (with TODO hints)."
    },
    {
      "path": "practice/l32_summary_solution.py",
      "zh": "参考答案：和视频同样的对话（thread_id 4），第 4 轮后自动总结、只留 2 条，最后靠摘要答出名字（6 次 DeepSeek 调用）。",
      "en": "Solution: the video's conversation (thread_id 4); after turn 4 it summarises and keeps 2 messages, and the last answer comes from the summary (6 DeepSeek calls)."
    }
  ]
});
