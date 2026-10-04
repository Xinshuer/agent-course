COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l39",
  "priority": "core",
  "handwrite": true,
  "studyMinutes": 50,
  "source": "subtitle",
  "summary": {
    "zh": "LangGraph 核心组件的最后一个：工具调用。老师先回答一个常见疑问：「模型调用了工具，为什么没有结果？」原因是 LangGraph 把它拆成了四步：定义工具（`@tool`）、绑定工具（`bind_tools`）、模型生成工具调用（只是一条「调哪个工具、传什么参数」的指令）、执行工具（`ToolNode`）。拆开后，中间还能插入人工审核。接着用视频里的天气例子搭出一个最简单的 ReAct 智能体：问「最冷的城市天气如何」，它先查出最冷的城市，再分别查这两个城市的天气。",
    "en": "The last LangGraph core component: tool calling. The instructor first answers a common question – “the model called a tool, so why is there no result?” The answer is that LangGraph splits the process into four steps: define tools (`@tool`), bind them (`bind_tools`), let the model write a tool call (just an instruction naming the tool and its arguments), and run the tool (`ToolNode`). With the steps split, a human review can go in between. Then the video's weather example becomes the simplest ReAct agent: asked about the weather in the coolest cities, it first looks up those cities, then the weather of each."
  },
  "goals": [
    {
      "zh": "说出工具调用的四个步骤，并解释为什么「工具调用」这一步还没有结果",
      "en": "Name the four steps of tool use and explain why the “tool call” step has no result yet"
    },
    {
      "zh": "用 `@tool` 定义工具，知道工具也是 Runnable，可以直接 `invoke`",
      "en": "Define tools with `@tool` and know that a tool is a Runnable you can `invoke` directly"
    },
    {
      "zh": "用 `bind_tools` 绑定工具，读懂模型返回的 `tool_calls`",
      "en": "Bind tools with `bind_tools` and read the `tool_calls` the model returns"
    },
    {
      "zh": "手动执行一个工具调用，并知道 LangGraph 1.2.12 里 `ToolNode` 要放进图里运行",
      "en": "Run a tool call by hand, knowing that in LangGraph 1.2.12 `ToolNode` must run inside a graph"
    },
    {
      "zh": "搭出视频里的智能体图（`call_model` + `should_continue` 条件边 + `ToolNode`），看懂连环调用和一次多个调用",
      "en": "Build the video's agent graph (`call_model` + the `should_continue` conditional edge + `ToolNode`) and follow chained and parallel tool calls"
    },
    {
      "zh": "不看资料，独立手写一个会调用工具的 LangGraph 智能体",
      "en": "Write a tool-calling LangGraph agent unaided"
    }
  ],
  "blocks": [
    {
      "t": "h",
      "zh": "一、为什么「调用了工具」却没有结果：工具调用的四步",
      "en": "1. Why a “tool call” has no result yet: the four steps"
    },
    {
      "t": "p",
      "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=0) 这是 LangGraph 核心组件的最后一个。工具调用前面多多少少讲过，这次系统地讲一遍。老师先回答一个常被问到的问题：「工具调用之后，为什么没有结果？」问这个问题，说明还习惯单智能体的思路。[▶ 00:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=33) LangGraph 把整个过程拆成了更细的步骤：\n\n| 步骤 | 做什么 | 代码 |\n|---|---|---|\n| 1. 定义工具 | 把普通函数变成工具，目前最常用的是 `@tool` 装饰器 | `@tool` |\n| 2. 绑定工具 | 告诉模型有哪些工具。**不是所有模型都支持工具调用**，所以也不是所有模型都能绑定 | `model.bind_tools(tools)` |\n| 3. 工具调用 | 模型把用户的自然语言翻译成「调哪个工具 + 传什么参数」，得到的只是一条结构化的**指令**，**还没有执行** | `reply.tool_calls` |\n| 4. 工具执行 | 真正运行函数、拿到结果；在多智能体里一般由专门的 `ToolNode` 节点负责 | `ToolNode(tools)` |",
      "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=0) This is the last LangGraph core component. Tool calling has come up before; this time it is covered systematically. The instructor first answers a frequent question: “after the tool call, why is there no result?” Asking it shows you are still thinking in single-agent terms. [▶ 00:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=33) LangGraph splits the whole process into finer steps:\n\n| Step | What happens | Code |\n|---|---|---|\n| 1. Define tools | Turn a plain function into a tool; the `@tool` decorator is the most common way | `@tool` |\n| 2. Bind tools | Tell the model which tools exist. **Not every model supports tool calling**, so not every model can be bound | `model.bind_tools(tools)` |\n| 3. Tool call | The model turns the user's natural language into “which tool + which arguments”: only a structured **instruction**, **not yet run** | `reply.tool_calls` |\n| 4. Tool execution | Actually run the function and get the result; in multi-agent setups a dedicated `ToolNode` node does this | `ToolNode(tools)` |"
    },
    {
      "t": "p",
      "zh": "（视频里：第 2 步 [▶ 01:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=66)，第 3 步 [▶ 01:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=97)，第 4 步 [▶ 02:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=128)）所以「为什么没有结果」的答案是：第 3 步只产出指令，结果要到第 4 步执行工具时才有。老师用一张图举例：把一个查数据库的函数做成 database 工具，模型在第 3 步选中它、填好三个参数；到第 4 步才真正带着这三个参数运行函数，拿到结果。",
      "en": "(In the video: step 2 at [▶ 01:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=66), step 3 at [▶ 01:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=97), step 4 at [▶ 02:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=128).) So the answer to “why no result?” is: step 3 produces only an instruction; the result appears in step 4, when the tool runs. The instructor's diagram example: a database-query function becomes a database tool; in step 3 the model picks it and fills in three arguments, and only in step 4 is the function actually run with those arguments to get a result."
    },
    {
      "t": "p",
      "zh": "[▶ 02:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=161) 为什么要拆得这么细？在 LangChain 的智能体里，第 3、4 步是混在一起的：调用和执行一气呵成，不打开调试就看不到中间发生了什么，看到了也没法插手。[▶ 03:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=192) 想让工具调得更准、参数更好，在单智能体模式下只能换更好的模型、把提示词写好、给工具参数加上约束，而且仍然不能保证百分之百正确。[▶ 03:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=224) 在 LangGraph 里这两步是分开的，中间可以插入 35 节学过的人工审核节点：模型给出工具和参数后，先让人检查对不对，批准了才进入第 4 步执行。",
      "en": "[▶ 02:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=161) Why split things so finely? In a LangChain agent, steps 3 and 4 are merged: calling and running happen in one go, you can't see what happens in between without debugging, and even if you can see it you can't step in. [▶ 03:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=192) To get more accurate tool calls and arguments in single-agent mode, all you can do is use a better model, write better prompts or constrain the tool's parameters – and there is still no 100% guarantee. [▶ 03:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=224) In LangGraph the two steps are separate, so a human review node (lesson 35) can go between them: once the model has picked the tool and arguments, a person checks them, and only after approval does step 4 run."
    },
    {
      "t": "code",
      "file": "flow",
      "lang": "text",
      "code": {
        "zh": "用户的问题 → [第 3 步：模型生成 tool_calls] → （可选：人工审核） → [第 4 步：ToolNode 执行] → 结果交回模型",
        "en": "user question → [step 3: model writes tool_calls] → (optional: human review) → [step 4: ToolNode runs them] → results back to the model"
      }
    },
    {
      "t": "video",
      "zh": "这一集的代码（[▶ 04:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=258) 起）结构和 LangGraph 官方文档里「用 ToolNode 调用工具」的示例几乎一样，看得出是照着它改的，城市换成了中文：`get_weather` 查北京、深圳返回「20 度有雾」，其他城市返回「10 度晴朗」；`get_coolest_cities` 返回「哈尔滨,北京」。字幕里没有提到这一集用的是哪个模型；本站统一用 DeepSeek（`ChatDeepSeek`），下面的代码都在 LangGraph 1.2.12 上跑过。",
      "en": "This episode's code (from [▶ 04:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=258)) has almost the same structure as the “call tools with ToolNode” example in the LangGraph docs – apparently adapted from it, with Chinese cities: `get_weather` returns “20 degrees, foggy” for Beijing and Shenzhen and “10 degrees, sunny” elsewhere; `get_coolest_cities` returns “Harbin, Beijing”. The subtitles don't say which model this episode uses; this site uses DeepSeek (`ChatDeepSeek`) throughout, and all code below was run with LangGraph 1.2.12."
    },
    {
      "t": "h",
      "zh": "二、第 1 步：用 @tool 定义工具",
      "en": "2. Step 1: define tools with @tool"
    },
    {
      "t": "p",
      "zh": "[▶ 04:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=258) 定义工具很简单：`from langchain_core.tools import tool`，用 `@tool` 装饰函数（装饰器、docstring 见 08 节），函数就变成了一个工具对象：函数名是工具名，docstring 是工具说明，类型注解决定参数结构。视频里定义了两个结果写死的工具，一个查天气，一个返回最冷城市的列表：",
      "en": "[▶ 04:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=258) Defining a tool is easy: `from langchain_core.tools import tool`, then decorate the function with `@tool` (decorators and docstrings: lesson 08). The function becomes a tool object: the function name is the tool name, the docstring is its description, and the type hints define its arguments. The video defines two tools with hard-coded results, one for the weather and one listing the coolest cities:"
    },
    {
      "t": "code",
      "file": "tools_def.py",
      "code": {
        "zh": "from langchain_core.tools import tool\n\n@tool\ndef get_weather(location: str):\n    \"\"\"查询城市现在的天气。location 是中文城市名，例如：北京。\"\"\"\n    if location in [\"北京\", \"深圳\"]:\n        return \"现在 20 度，有雾。\"\n    return \"现在 10 度，晴朗。\"\n\n@tool\ndef get_coolest_cities():\n    \"\"\"获取最冷的城市列表。\"\"\"\n    return \"哈尔滨,北京\"\n\ntools = [get_weather, get_coolest_cities]\n\nprint(get_weather.name)                          # get_weather\nprint(get_weather.args)                          # {'location': {'title': 'Location', 'type': 'string'}}\nprint(get_coolest_cities.args)                   # {}：这个工具没有参数\nprint(get_weather.invoke({\"location\": \"北京\"}))    # 现在 20 度，有雾。\nprint(get_weather.invoke({\"location\": \"哈尔滨\"}))  # 现在 10 度，晴朗。",
        "en": "from langchain_core.tools import tool\n\n@tool\ndef get_weather(location: str):\n    \"\"\"Get the current weather of a city. location is the city's English name, e.g. Beijing.\"\"\"\n    if location in [\"Beijing\", \"Shenzhen\"]:\n        return \"20 degrees and foggy now.\"\n    return \"10 degrees and sunny now.\"\n\n@tool\ndef get_coolest_cities():\n    \"\"\"Get a list of the coolest cities.\"\"\"\n    return \"Harbin, Beijing\"\n\ntools = [get_weather, get_coolest_cities]\n\nprint(get_weather.name)                             # get_weather\nprint(get_weather.args)                             # {'location': {'title': 'Location', 'type': 'string'}}\nprint(get_coolest_cities.args)                      # {}: this tool takes no arguments\nprint(get_weather.invoke({\"location\": \"Beijing\"}))  # 20 degrees and foggy now.\nprint(get_weather.invoke({\"location\": \"Harbin\"}))   # 10 degrees and sunny now."
      }
    },
    {
      "t": "p",
      "zh": "[▶ 04:51](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=291) 老师强调：LangGraph 提供的是比较底层的封装，工具本身也是一个 Runnable（LangChain 里「能 `invoke` 的组件」，48 节 LCEL 会细讲），所以支持 `invoke` 和异步的 `ainvoke`，可以不经过模型、直接手动执行，方便测试。",
      "en": "[▶ 04:51](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=291) The instructor stresses that LangGraph offers fairly low-level building blocks: a tool is itself a Runnable (LangChain's name for “something you can `invoke`”, covered in lesson 48 on LCEL), so it supports `invoke` and the async `ainvoke`, and you can run it by hand without any model – handy for testing."
    },
    {
      "t": "note",
      "zh": "docstring 要写清楚「什么时候用、参数是什么」，模型就是靠它决定调不调用、怎么填参数的；没有 docstring 的函数，`@tool` 会直接报错。",
      "en": "Make the docstring say when to use the tool and what the arguments mean: the model relies on it to decide whether and how to call. A function without a docstring makes `@tool` raise an error."
    },
    {
      "t": "h",
      "zh": "三、手动执行一个工具调用：ToolNode",
      "en": "3. Run a tool call by hand: ToolNode"
    },
    {
      "t": "p",
      "zh": "[▶ 05:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=321) 接着老师单独演示第 4 步：按模型的格式自己构造一个工具调用——`name` 是工具名，`args` 是参数（`location` 填北京），再加上 `id` 和 `\"type\": \"tool_call\"`——放进一条 AI 消息，交给 `ToolNode` 执行。`ToolNode` 是专门运行工具的节点：它读取最后一条消息里的 `tool_calls`，按名字找到工具，逐个执行。[▶ 05:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=353) 执行后得到一条 `ToolMessage`，内容是「现在 20 度，有雾」。老师也说，实际中很少这样手动执行，一般都是自动的。",
      "en": "[▶ 05:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=321) Next the instructor shows step 4 on its own: build a tool call by hand in the model's format – `name` is the tool name, `args` the arguments (`location` set to Beijing), plus an `id` and `\"type\": \"tool_call\"` – put it in an AI message and hand it to `ToolNode`. `ToolNode` is the node dedicated to running tools: it reads the `tool_calls` of the last message, finds each tool by name and runs it. [▶ 05:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=353) The result is a `ToolMessage` saying “20 degrees, foggy”. The instructor adds that in practice you rarely run tool calls by hand; it is normally automatic."
    },
    {
      "t": "warn",
      "zh": "视频 vs 现在：视频里直接写 `tool_node.invoke({\"messages\": [message]})`。在这里安装的 LangGraph 1.2.12 中，`ToolNode` 离开图单独调用会报错 `ValueError: Missing required config key 'N/A' for 'tools'.`——它现在需要图在运行时提供的环境。下面是两种能用的写法：A 直接把调用字典交给工具；B 把 `ToolNode` 放进只有一个节点的小图。",
      "en": "Video vs now: the video simply calls `tool_node.invoke({\"messages\": [message]})`. With the LangGraph 1.2.12 installed here, `ToolNode` on its own raises `ValueError: Missing required config key 'N/A' for 'tools'.` – it now needs the runtime a graph provides. Two working alternatives follow: A hands the call dict straight to the tool; B puts `ToolNode` in a one-node graph."
    },
    {
      "t": "code",
      "file": "manual_tools.py",
      "code": {
        "zh": "from langchain_core.messages import AIMessage\nfrom langgraph.graph import StateGraph, MessagesState, START\nfrom langgraph.prebuilt import ToolNode\n\ntool_node = ToolNode(tools)\ncall = {\"name\": \"get_weather\", \"args\": {\"location\": \"北京\"}, \"id\": \"tool_call_id\", \"type\": \"tool_call\"}\nmessage = AIMessage(content=\"\", tool_calls=[call])      # 一条「请求调用工具」的 AI 消息\n\n# 视频里的写法，在 LangGraph 1.2.12 会报 ValueError：\n# tool_node.invoke({\"messages\": [message]})\n\n# 写法 A：把整个调用字典交给工具，直接得到 ToolMessage\nprint(get_weather.invoke(call))\n# content='现在 20 度，有雾。' name='get_weather' tool_call_id='tool_call_id'\n\n# 写法 B：把 ToolNode 放进只有一个节点的小图里运行\nmini = StateGraph(MessagesState)\nmini.add_node(\"tools\", tool_node)\nmini.add_edge(START, \"tools\")\nrun_tools = mini.compile()\nresult = run_tools.invoke({\"messages\": [message]})\nprint(result[\"messages\"][-1].content)                 # 现在 20 度，有雾。",
        "en": "from langchain_core.messages import AIMessage\nfrom langgraph.graph import StateGraph, MessagesState, START\nfrom langgraph.prebuilt import ToolNode\n\ntool_node = ToolNode(tools)\ncall = {\"name\": \"get_weather\", \"args\": {\"location\": \"Beijing\"}, \"id\": \"tool_call_id\", \"type\": \"tool_call\"}\nmessage = AIMessage(content=\"\", tool_calls=[call])      # an AI message asking for a tool\n\n# The video's way - raises ValueError with LangGraph 1.2.12:\n# tool_node.invoke({\"messages\": [message]})\n\n# Way A: pass the whole call dict to the tool and get a ToolMessage back\nprint(get_weather.invoke(call))\n# content='20 degrees and foggy now.' name='get_weather' tool_call_id='tool_call_id'\n\n# Way B: run ToolNode inside a graph with a single node\nmini = StateGraph(MessagesState)\nmini.add_node(\"tools\", tool_node)\nmini.add_edge(START, \"tools\")\nrun_tools = mini.compile()\nresult = run_tools.invoke({\"messages\": [message]})\nprint(result[\"messages\"][-1].content)                 # 20 degrees and foggy now."
      }
    },
    {
      "t": "p",
      "zh": "写法 A 适合单独测试一个工具；写法 B 和 `ToolNode` 在智能体里的行为完全一样（自动按名字挑工具、一次执行所有调用、每个结果带上对应的 `tool_call_id`）。完整演示见 `practice/l39_manual_tools.py`，不调用模型，可以免费运行。",
      "en": "Way A is handy for testing one tool; way B behaves exactly like `ToolNode` inside an agent (it picks tools by name, runs every call at once and tags each result with its `tool_call_id`). The full demo is `practice/l39_manual_tools.py`; it calls no model and runs for free."
    },
    {
      "t": "h",
      "zh": "四、第 2、3 步：绑定工具，看模型生成的 tool_calls",
      "en": "4. Steps 2 and 3: bind the tools and look at the model's tool_calls"
    },
    {
      "t": "p",
      "zh": "[▶ 05:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=353) 绑定工具最常用的就是 `bind_tools`，把工具绑定到大模型上。老师再次提醒：不是所有模型都支持工具绑定。[▶ 06:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=383) 用绑定了工具的模型问「深圳的天气如何？」，看它返回的 `tool_calls`：模型把这句话转换成了正确的工具调用，工具是 `get_weather`，参数里提取出了「深圳」。",
      "en": "[▶ 05:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=353) The usual way to bind tools to a model is `bind_tools`. The instructor repeats that not every model supports binding tools. [▶ 06:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=383) Ask the tool-bound model “What's the weather like in Shenzhen?” and look at the `tool_calls` it returns: the model has turned the sentence into the right tool call, `get_weather`, with Shenzhen extracted as the argument."
    },
    {
      "t": "code",
      "file": "bind_tools.py",
      "code": {
        "zh": "from langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\nmodel_with_tools = model.bind_tools(tools)    # 返回一个「带着工具说明」的新对象，model 本身不变\n\nreply = model_with_tools.invoke(\"深圳的天气如何？\")\nprint(reply.tool_calls)\n# 输出类似：[{'name': 'get_weather', 'args': {'location': '深圳'}, 'id': 'call_00_…', 'type': 'tool_call'}]",
        "en": "from langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\nmodel_with_tools = model.bind_tools(tools)    # a NEW object that carries the tool specs; model is unchanged\n\nreply = model_with_tools.invoke(\"What's the weather like in Shenzhen?\")\nprint(reply.tool_calls)\n# Something like: [{'name': 'get_weather', 'args': {'location': 'Shenzhen'}, 'id': 'call_00_…', 'type': 'tool_call'}]"
      }
    },
    {
      "t": "p",
      "zh": "和原生 SDK（05–06 节）相比，有三点不同：\n- `bind_tools` **返回一个新对象**，原来的 `model` 不变。后面要用 `model_with_tools` 调用，否则模型看不到工具\n- `reply.tool_calls` 是**字典**组成的列表，用 `call[\"name\"]`、`call[\"args\"]`、`call[\"id\"]` 取值\n- `args` 已经是解析好的字典，不用再 `json.loads`",
      "en": "Three differences from the raw SDK (lessons 05–06):\n- `bind_tools` **returns a new object**; `model` itself is unchanged. Call `model_with_tools` from now on, or the model can't see the tools\n- `reply.tool_calls` is a list of **dicts**: read `call[\"name\"]`, `call[\"args\"]`, `call[\"id\"]`\n- `args` is already a parsed dict – no `json.loads` needed"
    },
    {
      "t": "check",
      "q": {
        "zh": "写了 `model.bind_tools(tools)` 这一行（没有接住返回值），然后 `model.invoke(\"深圳的天气如何？\")`。会怎样？",
        "en": "You run `model.bind_tools(tools)` without keeping the result, then `model.invoke(\"Weather in Shenzhen?\")`. What happens?"
      },
      "options": [
        {
          "zh": "模型正常调用工具",
          "en": "The model calls the tool as usual"
        },
        {
          "zh": "模型看不到任何工具，只能直接用文字回答",
          "en": "The model sees no tools and can only answer in text"
        },
        {
          "zh": "程序报错",
          "en": "The program raises an error"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "`bind_tools` 不修改 `model`，而是返回一个带工具的新对象。要写 `model_with_tools = model.bind_tools(tools)` 并用它调用。",
        "en": "`bind_tools` does not change `model`; it returns a new object with the tools. Write `model_with_tools = model.bind_tools(tools)` and call that."
      }
    },
    {
      "t": "h",
      "zh": "五、第 4 步：执行模型给出的调用",
      "en": "5. Step 4: run the call the model produced"
    },
    {
      "t": "p",
      "zh": "[▶ 06:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=415) 有了这份 `tool_calls`，就可以执行工具了。视频里把模型返回的那条消息直接交给 `tool_node.invoke(...)`，`ToolNode` 自动找到 `get_weather` 并执行，不用我们自己动手，得到的 ToolMessage 是「现在 20 度，有雾」。用上一部分的写法 B，同样的事情是：",
      "en": "[▶ 06:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=415) With those `tool_calls` in hand, the tool can run. In the video, the message the model returned goes straight into `tool_node.invoke(...)`; `ToolNode` finds `get_weather` and runs it for us, and the ToolMessage reads “20 degrees, foggy”. With way B from part 3, the same thing is:"
    },
    {
      "t": "code",
      "file": "manual_tools.py",
      "code": {
        "zh": "result = run_tools.invoke({\"messages\": [reply]})   # reply：上一步模型返回的 AI 消息\nprint(result[\"messages\"][-1].content)              # 现在 20 度，有雾。",
        "en": "result = run_tools.invoke({\"messages\": [reply]})   # reply: the AI message the model just returned\nprint(result[\"messages\"][-1].content)              # 20 degrees and foggy now."
      }
    },
    {
      "t": "h",
      "zh": "六、组装成智能体图",
      "en": "6. Put it together as an agent graph"
    },
    {
      "t": "p",
      "zh": "[▶ 07:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=445) 最常见的用法是把这几步放进一个智能体图。视频里的图有两个节点、一条条件边：\n- `agent` 节点（函数 `call_model`）：用绑定了工具的模型 `invoke` 当前所有消息\n- `tools` 节点：`ToolNode(tools)`，执行工具\n- [▶ 07:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=478) 条件边 `should_continue`：看最后一条消息里有没有工具调用，有就去 `tools`，没有就返回 `END` 结束\n- `tools → agent`：工具结果交回模型，由模型决定下一步",
      "en": "[▶ 07:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=445) The most common use is to put these steps in an agent graph. The video's graph has two nodes and one conditional edge:\n- the `agent` node (function `call_model`): `invoke` the tool-bound model on all messages so far\n- the `tools` node: `ToolNode(tools)`, which runs the tools\n- [▶ 07:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=478) the conditional edge `should_continue`: if the last message has tool calls go to `tools`, otherwise return `END`\n- `tools → agent`: tool results go back to the model, which decides what to do next"
    },
    {
      "t": "code",
      "file": "agent_graph.py",
      "code": {
        "zh": "from langgraph.graph import StateGraph, MessagesState, START, END\nfrom langgraph.prebuilt import ToolNode\n\n# tools、model_with_tools 见上面几部分\n\ndef should_continue(state: MessagesState):\n    last_message = state[\"messages\"][-1]\n    if last_message.tool_calls:          # 有工具调用：去执行\n        return \"tools\"\n    return END                           # 没有：结束\n\ndef call_model(state: MessagesState):\n    response = model_with_tools.invoke(state[\"messages\"])\n    return {\"messages\": [response]}      # add_messages 会把它追加到 messages 末尾\n\nworkflow = StateGraph(MessagesState)\nworkflow.add_node(\"agent\", call_model)\nworkflow.add_node(\"tools\", ToolNode(tools))\nworkflow.add_edge(START, \"agent\")\nworkflow.add_conditional_edges(\"agent\", should_continue, [\"tools\", END])\nworkflow.add_edge(\"tools\", \"agent\")      # 工具结果交回模型\napp = workflow.compile()",
        "en": "from langgraph.graph import StateGraph, MessagesState, START, END\nfrom langgraph.prebuilt import ToolNode\n\n# tools and model_with_tools: see the parts above\n\ndef should_continue(state: MessagesState):\n    last_message = state[\"messages\"][-1]\n    if last_message.tool_calls:          # tool calls: go and run them\n        return \"tools\"\n    return END                           # none: finish\n\ndef call_model(state: MessagesState):\n    response = model_with_tools.invoke(state[\"messages\"])\n    return {\"messages\": [response]}      # add_messages appends it to messages\n\nworkflow = StateGraph(MessagesState)\nworkflow.add_node(\"agent\", call_model)\nworkflow.add_node(\"tools\", ToolNode(tools))\nworkflow.add_edge(START, \"agent\")\nworkflow.add_conditional_edges(\"agent\", should_continue, [\"tools\", END])\nworkflow.add_edge(\"tools\", \"agent\")      # hand tool results back to the model\napp = workflow.compile()"
      }
    },
    {
      "t": "p",
      "zh": "`MessagesState` 只有一个 `messages` 字段，自带的 reducer `add_messages` 会把节点返回的消息**追加**到列表末尾（reducer 见 28 节），所以 `call_model` 只要返回 `{\"messages\": [response]}`。`add_conditional_edges` 的第三个参数 `[\"tools\", END]` 列出可能去往的节点：可以省略，但省略后 LangGraph 不知道 `should_continue` 可能返回 `\"tools\"`，画出来的图会漏掉这条边（实测如此），所以建议写上。",
      "en": "`MessagesState` has a single `messages` field whose built-in reducer `add_messages` **appends** whatever a node returns (reducers: lesson 28), so `call_model` just returns `{\"messages\": [response]}`. The third argument of `add_conditional_edges`, `[\"tools\", END]`, lists the possible destinations. It is optional, but without it LangGraph can't know that `should_continue` may return `\"tools\"`, and the drawn graph misses that edge (checked), so write it."
    },
    {
      "t": "p",
      "zh": "[▶ 08:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=510) 画出来就是一个典型的 ReAct 智能体：START 进入 agent，agent 和 tools 之间反复循环，直到模型给出最终答案就结束。视频里直接显示了一张图；这里可以打印 Mermaid 文本，复制到 mermaid.live 网站上就能看到图（虚线是条件边）：",
      "en": "[▶ 08:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=510) Drawn out, it is a typical ReAct agent: START enters agent, agent and tools loop until the model gives its final answer, then it ends. The video shows a picture; here you can print the Mermaid text and paste it into the mermaid.live website to see it (dotted lines are conditional edges):"
    },
    {
      "t": "code",
      "file": "agent_graph.py",
      "code": {
        "zh": "print(app.get_graph().draw_mermaid())\n# ---\n# config:\n#   flowchart:\n#     curve: linear\n# ---\n# graph TD;\n#     __start__([<p>__start__</p>]):::first\n#     agent(agent)\n#     tools(tools)\n#     __end__([<p>__end__</p>]):::last\n#     __start__ --> agent;\n#     agent -.-> __end__;\n#     agent -.-> tools;\n#     tools --> agent;\n#     ……（后面几行是样式 / style lines follow）",
        "en": "print(app.get_graph().draw_mermaid())\n# ---\n# config:\n#   flowchart:\n#     curve: linear\n# ---\n# graph TD;\n#     __start__([<p>__start__</p>]):::first\n#     agent(agent)\n#     tools(tools)\n#     __end__([<p>__end__</p>]):::last\n#     __start__ --> agent;\n#     agent -.-> __end__;\n#     agent -.-> tools;\n#     tools --> agent;\n#     … (style lines follow)"
      }
    },
    {
      "t": "tip",
      "zh": "`should_continue` 这种「有工具调用就去 tools，否则结束」的判断太常用了，LangGraph 自带一个现成的：`from langgraph.prebuilt import tools_condition`，写成 `workflow.add_conditional_edges(\"agent\", tools_condition)`。它返回的是固定字符串 `\"tools\"`（或 `END`），所以工具节点必须叫 `\"tools\"`。像 37 节那样把工具节点叫 `action` 的图，就只能自己写路由函数。",
      "en": "A check like `should_continue` – “tools if there are tool calls, otherwise end” – is so common that LangGraph ships one: `from langgraph.prebuilt import tools_condition`, used as `workflow.add_conditional_edges(\"agent\", tools_condition)`. It returns the fixed string `\"tools\"` (or `END`), so the tool node must be named `\"tools\"`. A graph whose tool node has another name, like `action` in lesson 37, needs its own routing function."
    },
    {
      "t": "check",
      "q": {
        "zh": "如果漏掉了 `workflow.add_edge(\"tools\", \"agent\")`，问「深圳的天气如何？」会怎样？",
        "en": "If you leave out `workflow.add_edge(\"tools\", \"agent\")`, what happens with “Weather in Shenzhen?”"
      },
      "options": [
        {
          "zh": "编译时报错",
          "en": "Compiling fails"
        },
        {
          "zh": "和原来一样，得到最终回答",
          "en": "Same as before – you get the final answer"
        },
        {
          "zh": "工具执行完图就结束了，最后一条消息是 ToolMessage，没有最终回答",
          "en": "The graph ends right after the tool runs; the last message is a ToolMessage and there is no final answer"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "`tools` 节点后面没有边，图就在那里结束了。模型没机会看到工具结果，也就写不出最终回答。",
        "en": "With no edge after `tools`, the graph stops there. The model never sees the tool result, so it never writes the final answer."
      }
    },
    {
      "t": "h",
      "zh": "七、运行：深圳的天气，最冷城市的天气",
      "en": "7. Run it: Shenzhen's weather, the coolest cities' weather"
    },
    {
      "t": "p",
      "zh": "[▶ 08:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=510) 先问「深圳的天气如何？」。视频里按执行顺序逐条展示每一步新出现的消息（下面的代码用 38 节的 `stream_mode=\"values\"` 做到同样的效果）：用户提问 → AI 发出工具调用 `get_weather`，参数「深圳」是从问题里提取出来的 → ToolMessage「现在 20 度，有雾」→ 模型把结果和问题合在一起，回答深圳现在 20 度、有雾。",
      "en": "[▶ 08:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=510) First ask “What's the weather like in Shenzhen?”. The video shows the new message of each step in order (the code below does the same with `stream_mode=\"values\"` from lesson 38): the user's question → an AI tool call to `get_weather`, with Shenzhen extracted from the question → the ToolMessage “20 degrees, foggy” → the model combines result and question and answers that Shenzhen is at 20 degrees and foggy."
    },
    {
      "t": "code",
      "file": "agent_graph.py",
      "code": {
        "zh": "inputs = {\"messages\": [{\"role\": \"user\", \"content\": \"深圳的天气如何？\"}]}\nfor chunk in app.stream(inputs, stream_mode=\"values\"):\n    chunk[\"messages\"][-1].pretty_print()      # 每走一步，打印最新的那条消息",
        "en": "inputs = {\"messages\": [{\"role\": \"user\", \"content\": \"What's the weather like in Shenzhen?\"}]}\nfor chunk in app.stream(inputs, stream_mode=\"values\"):\n    chunk[\"messages\"][-1].pretty_print()      # after every step, print the newest message"
      }
    },
    {
      "t": "p",
      "zh": "[▶ 09:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=571) 再问「最冷的城市天气如何？」。模型自己选了 `get_coolest_cities`（这个工具没有参数），拿到「哈尔滨,北京」。[▶ 10:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=603) 接着它继续调用 `get_weather`，而且是在**同一条回答里**请求了两次：一次查哈尔滨，一次查北京；`ToolNode` 把两个都执行完，再一起交回模型。[▶ 10:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=634) 工具里只有北京、深圳是「20 度有雾」，哈尔滨走的是「10 度晴朗」那个分支，所以最终回答是哈尔滨 10 度晴朗、北京 20 度有雾。老师把这叫作连环调用：前一个工具的结果决定下一步调什么，而且对每个城市分别调用一次。\n\n下面是 DeepSeek 的真实运行结果（`practice/l39_tool_agent_solution.py`，用 `invoke` 跑完后打印全部消息，略去了部分 ID）。模型在第一次发出工具调用时还顺手用英文写了一句打算；`agent` 一共运行 3 次，`tools` 运行 2 次：",
      "en": "[▶ 09:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=571) Then ask “What's the weather like in the coolest cities?”. The model picks `get_coolest_cities` on its own (a tool with no arguments) and gets “Harbin, Beijing”. [▶ 10:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=603) It then calls `get_weather` – twice **in the same reply**, once for Harbin and once for Beijing; `ToolNode` runs both and hands both results back together. [▶ 10:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=40&t=634) Only Beijing and Shenzhen are “20 degrees, foggy” in the tool, so Harbin takes the “10 degrees, sunny” branch, and the final answer is Harbin 10 degrees and sunny, Beijing 20 degrees and foggy. The instructor calls this chained calling: one tool's result decides what to call next, and each city gets its own call.\n\nBelow is a real DeepSeek run (`practice/l39_tool_agent_solution.py`, printing every message after `invoke`; some ids trimmed; translated from a run in Chinese). Along with its first tool call the model also wrote a line about its plan, in English; `agent` ran 3 times and `tools` twice:"
    },
    {
      "t": "code",
      "file": "output",
      "lang": "text",
      "code": {
        "zh": "================================ Human Message =================================\n最冷的城市天气如何？\n================================== Ai Message ==================================\nI'll first find out which cities are the coldest, then check their weather.\nTool Calls:\n  get_coolest_cities (call_00_4YQO…)\n  Args:\n================================= Tool Message =================================\nName: get_coolest_cities\n哈尔滨,北京\n================================== Ai Message ==================================\nTool Calls:\n  get_weather (call_00_LWM7…)\n  Args:\n    location: 哈尔滨\n  get_weather (call_01_dygn…)\n  Args:\n    location: 北京\n================================= Tool Message =================================\nName: get_weather\n现在 10 度，晴朗。\n================================= Tool Message =================================\nName: get_weather\n现在 20 度，有雾。\n================================== Ai Message ==================================\n目前最冷的两个城市天气如下：\n- **哈尔滨**：10 度，晴朗 ☀️\n- **北京**：20 度，有雾 🌫️\n……",
        "en": "================================ Human Message =================================\nWhat's the weather like in the coolest cities?\n================================== Ai Message ==================================\nI'll first find out which cities are the coldest, then check their weather.\nTool Calls:\n  get_coolest_cities (call_00_4YQO…)\n  Args:\n================================= Tool Message =================================\nName: get_coolest_cities\nHarbin, Beijing\n================================== Ai Message ==================================\nTool Calls:\n  get_weather (call_00_LWM7…)\n  Args:\n    location: Harbin\n  get_weather (call_01_dygn…)\n  Args:\n    location: Beijing\n================================= Tool Message =================================\nName: get_weather\n10 degrees and sunny now.\n================================= Tool Message =================================\nName: get_weather\n20 degrees and foggy now.\n================================== Ai Message ==================================\nHere is the weather in the two coldest cities right now:\n- **Harbin**: 10 degrees, sunny ☀️\n- **Beijing**: 20 degrees, foggy 🌫️\n…"
      }
    },
    {
      "t": "note",
      "zh": "用视频的写法（`stream_mode=\"values\"`、每次只打印 `[-1]`）时，`tools` 那一步一下子加了两条 ToolMessage，只会打印出最后一条（北京的结果）。从老师的讲解看，视频里显示的工具结果也只有一条「20 度有雾」，哈尔滨的结果是他从最终回答里读出来的。想看到全部，就像练习文件那样 `invoke` 完再把 `result[\"messages\"]` 全部打印。",
      "en": "With the video's approach (`stream_mode=\"values\"`, printing only `[-1]`), the `tools` step adds two ToolMessages at once and only the last one (Beijing's) gets printed. Judging by the instructor's commentary, the video likewise shows just one tool result, “20 degrees, foggy”, and he reads Harbin's result from the final answer. To see everything, `invoke` and print all of `result[\"messages\"]`, as the practice file does."
    },
    {
      "t": "h",
      "zh": "八、补充：自己写 ToolNode，以及一行搞定的 create_agent",
      "en": "8. Extra: a hand-written ToolNode, and the one-call create_agent"
    },
    {
      "t": "p",
      "zh": "视频到这里就结束了。下面两点是补充：一是看看 `ToolNode` 在背后做了什么，二是以后最常用的一行写法。先学一个要用到的 Python 写法：",
      "en": "The video ends here. Two extras follow: what `ToolNode` does behind the scenes, and the one-call version you will use most often later. First, one piece of Python you need:"
    },
    {
      "t": "py",
      "title": {
        "zh": "字典推导式：`{键: 值 for x in 列表}`",
        "en": "Dict comprehensions: `{key: value for x in items}`"
      },
      "zh": "06 节学过列表推导式 `[x for x in xs if ...]`。把方括号换成花括号、写成 `键: 值`，就是**字典推导式**，一行建出一个字典：\n- `{t.name: t for t in tools}`：工具名 → 工具对象\n- 模型说要调用哪个名字，就用 `tools_by_name[名字]` 直接找到对应的工具。这和 07 节的「函数字典」（分发表）是一回事，只是自动生成，不用一个个手写\n\n下面用普通函数演示（普通函数的名字在 `f.__name__` 里；LangChain 工具对象用 `t.name`）：",
      "en": "Lesson 06 taught list comprehensions, `[x for x in xs if ...]`. Swap the square brackets for curly ones and write `key: value`, and you have a **dict comprehension** that builds a dict in one line:\n- `{t.name: t for t in tools}`: tool name → tool object\n- When the model names a tool, `tools_by_name[name]` finds it directly. It is the “dict of functions” (dispatch table) from lesson 07, generated instead of written out by hand\n\nThe demo uses plain functions (a plain function's name is `f.__name__`; a LangChain tool object uses `t.name`):",
      "code": {
        "zh": "def get_weather(location):\n    return \"现在 20 度，有雾。\"\n\ndef get_coolest_cities():\n    return \"哈尔滨,北京\"\n\nfuncs = [get_weather, get_coolest_cities]\n\nby_name = {f.__name__: f for f in funcs}          # 函数名 → 函数\nprint(list(by_name))                              # ['get_weather', 'get_coolest_cities']\n\nsame = {}                                         # 等价的 for 循环写法\nfor f in funcs:\n    same[f.__name__] = f\nprint(by_name == same)                            # True\n\ncall = {\"name\": \"get_weather\", \"args\": {\"location\": \"深圳\"}, \"id\": \"c1\"}\nchosen = by_name[call[\"name\"]]                    # 按名字找到函数\nprint(chosen(**call[\"args\"]))                     # 现在 20 度，有雾。（**args 见 05 节）\n\nlengths = {city: len(city) for city in [\"北京\", \"哈尔滨\"]}\nprint(lengths)                                    # {'北京': 2, '哈尔滨': 3}",
        "en": "def get_weather(location):\n    return \"20 degrees and foggy now.\"\n\ndef get_coolest_cities():\n    return \"Harbin, Beijing\"\n\nfuncs = [get_weather, get_coolest_cities]\n\nby_name = {f.__name__: f for f in funcs}          # function name -> function\nprint(list(by_name))                              # ['get_weather', 'get_coolest_cities']\n\nsame = {}                                         # the same thing with a for loop\nfor f in funcs:\n    same[f.__name__] = f\nprint(by_name == same)                            # True\n\ncall = {\"name\": \"get_weather\", \"args\": {\"location\": \"Shenzhen\"}, \"id\": \"c1\"}\nchosen = by_name[call[\"name\"]]                    # look the function up by name\nprint(chosen(**call[\"args\"]))                     # 20 degrees and foggy now. (**args: lesson 05)\n\nlengths = {city: len(city) for city in [\"Beijing\", \"Harbin\"]}\nprint(lengths)                                    # {'Beijing': 7, 'Harbin': 6}"
      }
    },
    {
      "t": "p",
      "zh": "有了 `tools_by_name`，自己写的工具节点就是 06 节那个 `for` 循环的翻版：取最后一条消息，执行其中的每个调用，每个结果包成带 `tool_call_id` 的 `ToolMessage`。把它换掉视频图里的 `ToolNode(tools)`，其余不变。完整可运行的版本见 `practice/l39_tool_agent_by_hand.py`：",
      "en": "With `tools_by_name`, a hand-written tool node is lesson 06's `for` loop in a new place: take the last message, run each call in it, and wrap each result as a `ToolMessage` with its `tool_call_id`. Swap it in for `ToolNode(tools)` in the video's graph and leave the rest as is. The full runnable version is `practice/l39_tool_agent_by_hand.py`:"
    },
    {
      "t": "code",
      "file": "practice/l39_tool_agent_by_hand.py",
      "code": {
        "zh": "from langchain_core.messages import ToolMessage\n\ntools_by_name = {t.name: t for t in tools}         # 工具名 → 工具对象\n\ndef call_tools(state: MessagesState):              # 自己写的「ToolNode」\n    last_message = state[\"messages\"][-1]\n    results = []\n    for call in last_message.tool_calls:           # 每个调用：{\"name\", \"args\", \"id\", \"type\"}\n        chosen = tools_by_name[call[\"name\"]]\n        output = chosen.invoke(call[\"args\"])\n        results.append(ToolMessage(content=str(output), tool_call_id=call[\"id\"]))\n    return {\"messages\": results}\n\nworkflow.add_node(\"tools\", call_tools)             # 其余和视频的图一样",
        "en": "from langchain_core.messages import ToolMessage\n\ntools_by_name = {t.name: t for t in tools}         # tool name -> tool object\n\ndef call_tools(state: MessagesState):              # a hand-written \"ToolNode\"\n    last_message = state[\"messages\"][-1]\n    results = []\n    for call in last_message.tool_calls:           # each call: {\"name\", \"args\", \"id\", \"type\"}\n        chosen = tools_by_name[call[\"name\"]]\n        output = chosen.invoke(call[\"args\"])\n        results.append(ToolMessage(content=str(output), tool_call_id=call[\"id\"]))\n    return {\"messages\": results}\n\nworkflow.add_node(\"tools\", call_tools)             # everything else as in the video's graph"
      }
    },
    {
      "t": "p",
      "zh": "「agent ⇄ tools」这个循环太常用了，所以有现成的封装。在这里安装的版本中，推荐写法是 LangChain 的 `create_agent`，它内部就是这一节搭的循环图，返回的也是编译好的图，`invoke`、`stream`、`checkpointer` 的用法都一样（`practice/l39_prebuilt_agent.py`）：",
      "en": "The agent ⇄ tools loop is so common that it comes packaged. In the installed versions the recommended way is LangChain's `create_agent`; inside is the loop graph built in this lesson, and it returns a compiled graph, so `invoke`, `stream` and `checkpointer` work the same (`practice/l39_prebuilt_agent.py`):"
    },
    {
      "t": "code",
      "file": "practice/l39_prebuilt_agent.py",
      "code": {
        "zh": "from langchain.agents import create_agent\n\nagent = create_agent(\n    model=model,                         # 传没有 bind_tools 的原始 model，create_agent 会替你绑定\n    tools=[get_weather, get_coolest_cities],\n    system_prompt=\"你是天气助手，回答要简短。\",\n)\nresult = agent.invoke({\"messages\": [{\"role\": \"user\", \"content\": \"深圳的天气如何？\"}]})\nprint(result[\"messages\"][-1].content)",
        "en": "from langchain.agents import create_agent\n\nagent = create_agent(\n    model=model,                         # pass the plain model (no bind_tools): create_agent binds the tools\n    tools=[get_weather, get_coolest_cities],\n    system_prompt=\"You are a weather assistant. Keep answers short.\",\n)\nresult = agent.invoke({\"messages\": [{\"role\": \"user\", \"content\": \"What's the weather like in Shenzhen?\"}]})\nprint(result[\"messages\"][-1].content)"
      }
    },
    {
      "t": "note",
      "zh": "旧教程里常见的 `from langgraph.prebuilt import create_react_agent` 在 LangGraph 1.x 里仍能运行，但已标记为弃用，警告会让你改用 `from langchain.agents import create_agent`；参数也略有不同（旧的 `prompt=` 对应新的 `system_prompt=`）。",
      "en": "`from langgraph.prebuilt import create_react_agent`, common in older tutorials, still runs in LangGraph 1.x but is deprecated; its warning points you to `from langchain.agents import create_agent`. The parameters differ slightly (the old `prompt=` became `system_prompt=`)."
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "第 3 步「工具调用」完成后，我们手上有的是什么？",
        "en": "After step 3, the “tool call”, what do we actually have?"
      },
      "options": [
        {
          "zh": "工具的运行结果",
          "en": "The tool's result"
        },
        {
          "zh": "一条指令：要调用的工具名和参数，还没有执行",
          "en": "An instruction: the tool name and arguments, not yet run"
        },
        {
          "zh": "模型的最终回答",
          "en": "The model's final answer"
        },
        {
          "zh": "一条 ToolMessage",
          "en": "A ToolMessage"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "这正是老师回答的「为什么没有结果」：第 3 步只把自然语言翻译成指令，结果要到第 4 步执行工具才有。",
        "en": "This is the instructor's answer to “why is there no result?”: step 3 only turns language into an instruction; the result comes in step 4, when the tool runs."
      }
    },
    {
      "q": {
        "zh": "LangGraph 把工具调用（第 3 步）和工具执行（第 4 步）拆成两个节点，老师说的好处是？",
        "en": "LangGraph splits the tool call (step 3) and tool execution (step 4) into separate nodes. What benefit does the instructor point out?"
      },
      "options": [
        {
          "zh": "运行速度更快",
          "en": "It runs faster"
        },
        {
          "zh": "不再需要模型支持工具调用",
          "en": "The model no longer needs to support tool calling"
        },
        {
          "zh": "可以在两步之间插入人工审核，检查工具和参数对不对再执行",
          "en": "A human review can go between them, checking the tool and arguments before anything runs"
        },
        {
          "zh": "可以省掉 `bind_tools`",
          "en": "You can skip `bind_tools`"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "在 LangChain 的智能体里调用和执行混在一起，没法插手；拆开后可以在中间加人工节点（35 节），批准了才执行。",
        "en": "In a LangChain agent calling and running are merged, so you can't step in; split apart, a human node (lesson 35) can approve the call before it runs."
      }
    },
    {
      "q": {
        "zh": "视频里的 `should_continue`：最后一条消息**没有** `tool_calls` 时返回什么？",
        "en": "In the video's `should_continue`, what is returned when the last message has **no** `tool_calls`?"
      },
      "options": [
        {
          "zh": "`END`（即 `\"__end__\"`），图结束",
          "en": "`END` (that is `\"__end__\"`) – the graph ends"
        },
        {
          "zh": "`\"tools\"`",
          "en": "`\"tools\"`"
        },
        {
          "zh": "`\"agent\"`",
          "en": "`\"agent\"`"
        },
        {
          "zh": "`None`",
          "en": "`None`"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "有工具调用去 `\"tools\"`，没有就去 `END`。模型给出最终文字回答时就是这种情况。",
        "en": "Tool calls go to `\"tools\"`, otherwise `END`. That is what happens when the model writes its final text answer."
      }
    },
    {
      "q": {
        "zh": "问「最冷的城市天气如何？」时，模型的第二条回答里同时请求了两次 `get_weather`。`ToolNode` 会怎么做？",
        "en": "Asked about the coolest cities, the model's second reply requests `get_weather` twice at once. What does `ToolNode` do?"
      },
      "options": [
        {
          "zh": "只执行第一个",
          "en": "Runs only the first"
        },
        {
          "zh": "执行第一个，交回模型，再执行第二个",
          "en": "Runs the first, hands back to the model, then runs the second"
        },
        {
          "zh": "报错，一次只能调用一个工具",
          "en": "Raises an error: one tool at a time"
        },
        {
          "zh": "两个都执行，返回两条 ToolMessage（各带对应的 `tool_call_id`），再一起交回模型",
          "en": "Runs both, returns two ToolMessages (each with its `tool_call_id`), and hands them back together"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "`ToolNode` 会把最后一条消息里的每个调用都执行完，结果一起追加到 messages，再走 `tools → agent` 交回模型。",
        "en": "`ToolNode` runs every call in the last message, appends all the results to messages, then `tools → agent` hands them back."
      }
    },
    {
      "q": {
        "zh": "在这里安装的 LangGraph 1.2.12 中，想像视频那样手动执行一个工具调用字典 `call`（`get_weather` 的调用），哪种写法能用？",
        "en": "With the LangGraph 1.2.12 installed here, you want to run a tool-call dict `call` (for `get_weather`) by hand, as the video does. Which works?"
      },
      "options": [
        {
          "zh": "`ToolNode(tools).invoke({\"messages\": [AIMessage(content=\"\", tool_calls=[call])]})`",
          "en": "`ToolNode(tools).invoke({\"messages\": [AIMessage(content=\"\", tool_calls=[call])]})`"
        },
        {
          "zh": "`get_weather.invoke(call)`，直接得到一条 ToolMessage",
          "en": "`get_weather.invoke(call)`, which returns a ToolMessage directly"
        },
        {
          "zh": "`get_weather(call)`",
          "en": "`get_weather(call)`"
        },
        {
          "zh": "`call.invoke()`",
          "en": "`call.invoke()`"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "`ToolNode` 离开图单独调用会报 `Missing required config key`；把整个调用字典交给工具的 `invoke` 就能得到带 `tool_call_id` 的 ToolMessage。另外两种写法都不对。",
        "en": "`ToolNode` on its own raises `Missing required config key`; passing the whole call dict to the tool's `invoke` returns a ToolMessage with the `tool_call_id`. The other two are not valid."
      }
    },
    {
      "q": {
        "zh": "关于 `model.bind_tools(tools)`，说法正确的是？",
        "en": "Which is true about `model.bind_tools(tools)`?"
      },
      "options": [
        {
          "zh": "它会立刻执行所有工具",
          "en": "It runs all the tools immediately"
        },
        {
          "zh": "它把工具永久写进了 `model`",
          "en": "It permanently adds the tools to `model`"
        },
        {
          "zh": "它返回一个新对象，用它调用时会把工具说明一起发给模型；原来的 `model` 不变",
          "en": "It returns a new object that sends the tool specs with every call; the original `model` is unchanged"
        },
        {
          "zh": "用了 `ToolNode` 就不需要 `bind_tools`",
          "en": "With `ToolNode` you don't need `bind_tools`"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "`bind_tools` 只负责第 2 步「告诉模型有哪些工具」，真正执行工具的是第 4 步的 `ToolNode`。两者都需要。",
        "en": "`bind_tools` only does step 2, telling the model which tools exist; `ToolNode` does the running in step 4. You need both."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "搭出视频里的智能体图",
        "en": "Build the video's agent graph"
      },
      "code": {
        "zh": "model_with_tools = model.[[bind_tools]](tools)\n\ndef call_model(state: [[MessagesState]]):\n    response = model_with_tools.invoke(state[\"[[messages]]\"])\n    return {\"messages\": [response]}\n\ndef should_continue(state: MessagesState):\n    last_message = state[\"messages\"][-1]\n    if last_message.[[tool_calls]]:\n        return \"[[tools]]\"\n    return [[END]]\n\nworkflow = StateGraph(MessagesState)\nworkflow.add_node(\"agent\", call_model)\nworkflow.add_node(\"tools\", [[ToolNode]](tools))\nworkflow.add_edge([[START]], \"agent\")\nworkflow.[[add_conditional_edges]](\"agent\", should_continue, [\"tools\", END])\nworkflow.add_edge(\"tools\", \"[[agent]]\")\napp = workflow.compile()",
        "en": "model_with_tools = model.[[bind_tools]](tools)\n\ndef call_model(state: [[MessagesState]]):\n    response = model_with_tools.invoke(state[\"[[messages]]\"])\n    return {\"messages\": [response]}\n\ndef should_continue(state: MessagesState):\n    last_message = state[\"messages\"][-1]\n    if last_message.[[tool_calls]]:\n        return \"[[tools]]\"\n    return [[END]]\n\nworkflow = StateGraph(MessagesState)\nworkflow.add_node(\"agent\", call_model)\nworkflow.add_node(\"tools\", [[ToolNode]](tools))\nworkflow.add_edge([[START]], \"agent\")\nworkflow.[[add_conditional_edges]](\"agent\", should_continue, [\"tools\", END])\nworkflow.add_edge(\"tools\", \"[[agent]]\")\napp = workflow.compile()"
      },
      "explain": {
        "zh": "`should_continue` 返回的 `\"tools\"` 要和节点名对上；最后那条边让工具结果回到 agent。",
        "en": "The `\"tools\"` returned by `should_continue` must match the node name; the last edge sends tool results back to the agent."
      }
    },
    {
      "title": {
        "zh": "补充：自己写工具节点",
        "en": "Extra: write the tool node yourself"
      },
      "code": {
        "zh": "tools_by_name = {t.[[name]]: t for t in tools}\n\ndef call_tools(state: MessagesState):\n    last_message = state[\"messages\"][-1]\n    results = []\n    for call in last_message.[[tool_calls]]:\n        chosen = tools_by_name[call[\"[[name]]\"]]\n        output = chosen.[[invoke]](call[\"args\"])\n        results.append([[ToolMessage]](content=str(output), tool_call_id=call[\"[[id]]\"]))\n    return {\"messages\": results}",
        "en": "tools_by_name = {t.[[name]]: t for t in tools}\n\ndef call_tools(state: MessagesState):\n    last_message = state[\"messages\"][-1]\n    results = []\n    for call in last_message.[[tool_calls]]:\n        chosen = tools_by_name[call[\"[[name]]\"]]\n        output = chosen.[[invoke]](call[\"args\"])\n        results.append([[ToolMessage]](content=str(output), tool_call_id=call[\"[[id]]\"]))\n    return {\"messages\": results}"
      },
      "explain": {
        "zh": "每个调用是一个字典；ToolMessage 必须带上对应的 `tool_call_id`，和 06 节的 tool 消息是同一个规则。",
        "en": "Each call is a dict; every ToolMessage needs the matching `tool_call_id` – the same rule as lesson 06's tool messages."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：视频里的工具调用智能体",
        "en": "Write it: the video's tool-calling agent"
      },
      "task": {
        "zh": "不看上面的代码，写出完整的工具调用智能体：\n1. 用 `@tool` 定义 `get_weather(location: str)`（带 docstring）：北京、深圳返回「现在 20 度，有雾。」，其他城市返回「现在 10 度，晴朗。」\n2. `model_with_tools = model.bind_tools(tools)`，写 `call_model(state: MessagesState)` 节点，返回 `{\"messages\": [response]}`\n3. 写 `should_continue`：最后一条消息有 `tool_calls` 返回 `\"tools\"`，否则返回 `END`\n4. 搭图：`agent` 和 `tools`（`ToolNode(tools)`）两个节点，`START → agent`，从 agent 出发用 `should_continue` 的条件边，`tools → agent`\n5. 问「深圳的天气如何？」，打印最后一条消息的内容\n\n写完存到 `practice` 文件夹，用 `.venv` 运行（会调用模型 2 次左右）。",
        "en": "Without looking above, write a complete tool-calling agent:\n1. define `get_weather(location: str)` with `@tool` (with a docstring): Beijing and Shenzhen return “20 degrees and foggy now.”, other cities “10 degrees and sunny now.”\n2. `model_with_tools = model.bind_tools(tools)`; write the node `call_model(state: MessagesState)` returning `{\"messages\": [response]}`\n3. write `should_continue`: return `\"tools\"` if the last message has `tool_calls`, otherwise `END`\n4. build the graph: nodes `agent` and `tools` (`ToolNode(tools)`), `START → agent`, a conditional edge from agent using `should_continue`, and `tools → agent`\n5. ask “What's the weather like in Shenzhen?” and print the content of the last message\n\nSave it in the `practice` folder and run it with `.venv` (about 2 model calls)."
      },
      "starter": {
        "zh": "from langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom langgraph.prebuilt import ToolNode\nfrom llm import API_KEY, MODEL\n\n# 1. 用 @tool 定义 get_weather(location: str)：北京、深圳返回「现在 20 度，有雾。」，其他返回「现在 10 度，晴朗。」（别忘了 docstring）\n\n\ntools = [get_weather]\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 2. 绑定工具，写 call_model 节点函数\n\n\n# 3. 写 should_continue：最后一条消息有 tool_calls 返回 \"tools\"，否则返回 END\n\n\n# 4. 搭图：agent、tools 两个节点，START → agent，条件边，tools → agent\n\n\n# 5. 问「深圳的天气如何？」，打印最后一条消息",
        "en": "from langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom langgraph.prebuilt import ToolNode\nfrom llm import API_KEY, MODEL\n\n# 1. define get_weather(location: str) with @tool: Beijing / Shenzhen -> \"20 degrees and foggy now.\", others -> \"10 degrees and sunny now.\" (don't forget the docstring)\n\n\ntools = [get_weather]\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 2. bind the tools and write the call_model node function\n\n\n# 3. write should_continue: return \"tools\" if the last message has tool_calls, otherwise END\n\n\n# 4. build the graph: nodes agent and tools, START -> agent, the conditional edge, tools -> agent\n\n\n# 5. ask \"What's the weather like in Shenzhen?\" and print the last message"
      },
      "solution": {
        "zh": "from langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom langgraph.prebuilt import ToolNode\nfrom llm import API_KEY, MODEL\n\n# 1. 用 @tool 定义 get_weather(location: str)：北京、深圳返回「现在 20 度，有雾。」，其他返回「现在 10 度，晴朗。」（别忘了 docstring）\n@tool\ndef get_weather(location: str):\n    \"\"\"查询城市现在的天气。location 是中文城市名，例如：北京。\"\"\"\n    if location in [\"北京\", \"深圳\"]:\n        return \"现在 20 度，有雾。\"\n    return \"现在 10 度，晴朗。\"\n\ntools = [get_weather]\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 2. 绑定工具，写 call_model 节点函数\nmodel_with_tools = model.bind_tools(tools)\n\ndef call_model(state: MessagesState):\n    response = model_with_tools.invoke(state[\"messages\"])\n    return {\"messages\": [response]}\n\n# 3. 写 should_continue：最后一条消息有 tool_calls 返回 \"tools\"，否则返回 END\ndef should_continue(state: MessagesState):\n    last_message = state[\"messages\"][-1]\n    if last_message.tool_calls:\n        return \"tools\"\n    return END\n\n# 4. 搭图：agent、tools 两个节点，START → agent，条件边，tools → agent\nworkflow = StateGraph(MessagesState)\nworkflow.add_node(\"agent\", call_model)\nworkflow.add_node(\"tools\", ToolNode(tools))\nworkflow.add_edge(START, \"agent\")\nworkflow.add_conditional_edges(\"agent\", should_continue, [\"tools\", END])\nworkflow.add_edge(\"tools\", \"agent\")\napp = workflow.compile()\n\n# 5. 问「深圳的天气如何？」，打印最后一条消息\nresult = app.invoke({\"messages\": [{\"role\": \"user\", \"content\": \"深圳的天气如何？\"}]})\nprint(result[\"messages\"][-1].content)",
        "en": "from langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom langgraph.prebuilt import ToolNode\nfrom llm import API_KEY, MODEL\n\n# 1. define get_weather(location: str) with @tool: Beijing / Shenzhen -> \"20 degrees and foggy now.\", others -> \"10 degrees and sunny now.\" (don't forget the docstring)\n@tool\ndef get_weather(location: str):\n    \"\"\"Get the current weather of a city. location is the city's English name, e.g. Beijing.\"\"\"\n    if location in [\"Beijing\", \"Shenzhen\"]:\n        return \"20 degrees and foggy now.\"\n    return \"10 degrees and sunny now.\"\n\ntools = [get_weather]\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 2. bind the tools and write the call_model node function\nmodel_with_tools = model.bind_tools(tools)\n\ndef call_model(state: MessagesState):\n    response = model_with_tools.invoke(state[\"messages\"])\n    return {\"messages\": [response]}\n\n# 3. write should_continue: return \"tools\" if the last message has tool_calls, otherwise END\ndef should_continue(state: MessagesState):\n    last_message = state[\"messages\"][-1]\n    if last_message.tool_calls:\n        return \"tools\"\n    return END\n\n# 4. build the graph: nodes agent and tools, START -> agent, the conditional edge, tools -> agent\nworkflow = StateGraph(MessagesState)\nworkflow.add_node(\"agent\", call_model)\nworkflow.add_node(\"tools\", ToolNode(tools))\nworkflow.add_edge(START, \"agent\")\nworkflow.add_conditional_edges(\"agent\", should_continue, [\"tools\", END])\nworkflow.add_edge(\"tools\", \"agent\")\napp = workflow.compile()\n\n# 5. ask \"What's the weather like in Shenzhen?\" and print the last message\nresult = app.invoke({\"messages\": [{\"role\": \"user\", \"content\": \"What's the weather like in Shenzhen?\"}]})\nprint(result[\"messages\"][-1].content)"
      },
      "checks": [
        {
          "zh": "用 `@tool` 装饰 `get_weather`",
          "en": "Decorates `get_weather` with `@tool`",
          "re": "^@tool\\s*\\n\\s*def\\s+get_weather\\s*\\("
        },
        {
          "zh": "工具函数有 docstring",
          "en": "The tool function has a docstring",
          "re": "def\\s+get_weather\\([^)]*\\)[^:]*:\\s*\\n\\s+(\"\"\"|''')"
        },
        {
          "zh": "`bind_tools(tools)` 并接住返回值",
          "en": "Calls `bind_tools(tools)` and keeps the result",
          "re": "\\w+\\s*=\\s*model\\.bind_tools\\(\\s*tools\\s*\\)"
        },
        {
          "zh": "节点返回 `{\"messages\": [...]}`",
          "en": "The node returns `{\"messages\": [...]}`",
          "re": "return\\s*\\{\\s*[\"']messages[\"']\\s*:\\s*\\["
        },
        {
          "zh": "`should_continue` 返回 `\"tools\"` 或 `END`",
          "en": "`should_continue` returns `\"tools\"` or `END`",
          "re": "return\\s+[\"']tools[\"'][\\s\\S]*return\\s+END"
        },
        {
          "zh": "加了名叫 `\"tools\"` 的 `ToolNode(tools)` 节点",
          "en": "Adds a `ToolNode(tools)` node named `\"tools\"`",
          "re": "add_node\\(\\s*[\"']tools[\"']\\s*,\\s*ToolNode\\(\\s*tools\\s*\\)\\s*\\)"
        },
        {
          "zh": "`START → agent`",
          "en": "`START → agent`",
          "re": "add_edge\\(\\s*START\\s*,\\s*[\"']agent[\"']\\s*\\)"
        },
        {
          "zh": "从 agent 出发、用 `should_continue` 的条件边",
          "en": "A conditional edge from agent using `should_continue`",
          "re": "add_conditional_edges\\(\\s*[\"']agent[\"']\\s*,\\s*should_continue"
        },
        {
          "zh": "`tools → agent` 的回头边",
          "en": "The edge back `tools → agent`",
          "re": "add_edge\\(\\s*[\"']tools[\"']\\s*,\\s*[\"']agent[\"']\\s*\\)"
        }
      ]
    },
    {
      "title": {
        "zh": "补充：自己写工具节点",
        "en": "Extra: write your own tool node"
      },
      "task": {
        "zh": "假设 `tools` 和 `call_model` 节点函数已经有了。不用 `ToolNode`，写出：\n1. 用字典推导式建 `tools_by_name`\n2. `call_tools(state)`：取最后一条消息，`for` 遍历它的 `tool_calls`，按名字找到工具、`.invoke(call[\"args\"])` 执行，每个结果包成 `ToolMessage(content=..., tool_call_id=call[\"id\"])`，返回 `{\"messages\": 结果列表}`；再写一个 `should_continue`\n3. 搭图，`tools` 节点用 `call_tools`\n\n完整可运行的版本见 `practice/l39_tool_agent_by_hand.py`。",
        "en": "Assume `tools` and the `call_model` node function exist. Without `ToolNode`, write:\n1. `tools_by_name` with a dict comprehension\n2. `call_tools(state)`: take the last message, loop over its `tool_calls` with `for`, find each tool by name, run it with `.invoke(call[\"args\"])`, wrap each result as `ToolMessage(content=..., tool_call_id=call[\"id\"])`, and return `{\"messages\": results}`; also write `should_continue`\n3. build the graph with `call_tools` as the `tools` node\n\nThe complete runnable version is `practice/l39_tool_agent_by_hand.py`."
      },
      "starter": {
        "zh": "from langchain_core.messages import ToolMessage\nfrom langgraph.graph import StateGraph, MessagesState, START, END\n\n# 已有：tools（工具列表）和 call_model 节点函数（和上一题一样）\n\n# 1. 用字典推导式建 tools_by_name：工具名 → 工具对象\n\n\n# 2. call_tools(state)：执行最后一条消息里的每一个工具调用，返回 ToolMessage 列表\n\n\n# 3. 搭图（agent、tools 两个节点），tools 节点用 call_tools，条件边用 should_continue",
        "en": "from langchain_core.messages import ToolMessage\nfrom langgraph.graph import StateGraph, MessagesState, START, END\n\n# Given: tools (the tool list) and the call_model node function (same as the previous task)\n\n# 1. build tools_by_name with a dict comprehension: tool name -> tool object\n\n\n# 2. call_tools(state): run every tool call in the last message; return a list of ToolMessages\n\n\n# 3. build the graph (nodes agent and tools), using call_tools for tools and should_continue for the conditional edge"
      },
      "solution": {
        "zh": "from langchain_core.messages import ToolMessage\nfrom langgraph.graph import StateGraph, MessagesState, START, END\n\n# 已有：tools（工具列表）和 call_model 节点函数（和上一题一样）\n\n# 1. 用字典推导式建 tools_by_name：工具名 → 工具对象\ntools_by_name = {t.name: t for t in tools}\n\n# 2. call_tools(state)：执行最后一条消息里的每一个工具调用，返回 ToolMessage 列表\ndef call_tools(state: MessagesState):\n    last_message = state[\"messages\"][-1]\n    results = []\n    for call in last_message.tool_calls:\n        chosen = tools_by_name[call[\"name\"]]\n        output = chosen.invoke(call[\"args\"])\n        results.append(ToolMessage(content=str(output), tool_call_id=call[\"id\"]))\n    return {\"messages\": results}\n\ndef should_continue(state: MessagesState):\n    if state[\"messages\"][-1].tool_calls:\n        return \"tools\"\n    return END\n\n# 3. 搭图（agent、tools 两个节点），tools 节点用 call_tools，条件边用 should_continue\nworkflow = StateGraph(MessagesState)\nworkflow.add_node(\"agent\", call_model)\nworkflow.add_node(\"tools\", call_tools)\nworkflow.add_edge(START, \"agent\")\nworkflow.add_conditional_edges(\"agent\", should_continue, [\"tools\", END])\nworkflow.add_edge(\"tools\", \"agent\")\napp = workflow.compile()",
        "en": "from langchain_core.messages import ToolMessage\nfrom langgraph.graph import StateGraph, MessagesState, START, END\n\n# Given: tools (the tool list) and the call_model node function (same as the previous task)\n\n# 1. build tools_by_name with a dict comprehension: tool name -> tool object\ntools_by_name = {t.name: t for t in tools}\n\n# 2. call_tools(state): run every tool call in the last message; return a list of ToolMessages\ndef call_tools(state: MessagesState):\n    last_message = state[\"messages\"][-1]\n    results = []\n    for call in last_message.tool_calls:\n        chosen = tools_by_name[call[\"name\"]]\n        output = chosen.invoke(call[\"args\"])\n        results.append(ToolMessage(content=str(output), tool_call_id=call[\"id\"]))\n    return {\"messages\": results}\n\ndef should_continue(state: MessagesState):\n    if state[\"messages\"][-1].tool_calls:\n        return \"tools\"\n    return END\n\n# 3. build the graph (nodes agent and tools), using call_tools for tools and should_continue for the conditional edge\nworkflow = StateGraph(MessagesState)\nworkflow.add_node(\"agent\", call_model)\nworkflow.add_node(\"tools\", call_tools)\nworkflow.add_edge(START, \"agent\")\nworkflow.add_conditional_edges(\"agent\", should_continue, [\"tools\", END])\nworkflow.add_edge(\"tools\", \"agent\")\napp = workflow.compile()"
      },
      "checks": [
        {
          "zh": "字典推导式 `{t.name: t for t in tools}`",
          "en": "The dict comprehension `{t.name: t for t in tools}`",
          "re": "\\{\\s*(\\w+)\\.name\\s*:\\s*\\1\\s+for\\s+\\1\\s+in\\s+tools\\s*\\}"
        },
        {
          "zh": "取最后一条消息 `[-1]`",
          "en": "Takes the last message with `[-1]`",
          "re": "\\[\\s*[\"']messages[\"']\\s*\\]\\s*\\[\\s*-1\\s*\\]"
        },
        {
          "zh": "`for` 遍历 `tool_calls`",
          "en": "Loops over `tool_calls` with `for`",
          "re": "for\\s+\\w+\\s+in\\s+\\w+\\.tool_calls\\s*:"
        },
        {
          "zh": "按名字找工具",
          "en": "Finds the tool by name",
          "re": "tools_by_name\\[\\s*\\w+\\[\\s*[\"']name[\"']\\s*\\]\\s*\\]"
        },
        {
          "zh": "`ToolMessage` 带 `tool_call_id`",
          "en": "`ToolMessage` with `tool_call_id`",
          "re": "ToolMessage\\([\\s\\S]*?tool_call_id\\s*=\\s*\\w+\\[\\s*[\"']id[\"']\\s*\\]"
        },
        {
          "zh": "`tools` 节点用 `call_tools`",
          "en": "Uses `call_tools` as the `tools` node",
          "re": "add_node\\(\\s*[\"']tools[\"']\\s*,\\s*call_tools\\s*\\)"
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "以为第 3 步就有结果：`reply.tool_calls` 只是指令，要有执行工具的节点（第 4 步）和 `tools → agent` 这条边，模型才能拿到结果写出最终回答。",
      "en": "Expecting a result from step 3: `reply.tool_calls` is only an instruction; you need a node that runs the tools (step 4) and the `tools → agent` edge before the model can see results and answer."
    },
    {
      "zh": "写了 `model.bind_tools(tools)` 却没接住返回值，或者节点里还在用原来的 `model`：模型根本不知道有工具。",
      "en": "Calling `model.bind_tools(tools)` without keeping the result, or still using the original `model` in the node: the model never learns about the tools."
    },
    {
      "zh": "`should_continue`（或 `tools_condition`）返回的字符串和节点名对不上，比如返回 `\"tools\"` 但节点叫 `\"tool_node\"`：编译或运行时会报找不到目标节点的错误。",
      "en": "`should_continue` (or `tools_condition`) returns a string that doesn't match the node name, e.g. `\"tools\"` while the node is `\"tool_node\"`: you get an unknown-target error at compile time or run time."
    },
    {
      "zh": "工具函数没写 docstring：`@tool` 直接报错；docstring 写得含糊，模型就不知道什么时候该用它、参数该怎么填。",
      "en": "A tool function without a docstring: `@tool` raises an error; a vague docstring leaves the model unsure when to use it and how to fill the arguments."
    },
    {
      "zh": "照视频单独 `tool_node.invoke(...)`：LangGraph 1.2.12 会报 `Missing required config key 'N/A' for 'tools'`。单独测试用 `工具.invoke(调用字典)`，或者把 ToolNode 放进一个单节点的小图。",
      "en": "Calling `tool_node.invoke(...)` on its own as in the video: LangGraph 1.2.12 raises `Missing required config key 'N/A' for 'tools'`. To test, use `tool.invoke(call_dict)` or put the ToolNode in a one-node graph."
    },
    {
      "zh": "用 `stream_mode=\"values\"` 只打印 `[-1]`，以为模型只调用了一个工具：一步里有多条 ToolMessage 时只显示最后一条。",
      "en": "Printing only `[-1]` with `stream_mode=\"values\"` and concluding the model called just one tool: when one step adds several ToolMessages, only the last is shown."
    },
    {
      "zh": "沿用 `langgraph.prebuilt.create_react_agent`：仍能运行但已弃用，新代码用 `langchain.agents.create_agent`。",
      "en": "Sticking with `langgraph.prebuilt.create_react_agent`: it still runs but is deprecated; new code should use `langchain.agents.create_agent`."
    }
  ],
  "recap": [
    {
      "zh": "工具调用四步：定义（`@tool`）→ 绑定（`bind_tools`）→ 模型生成 `tool_calls`（只是指令）→ 执行（`ToolNode`）。",
      "en": "Four steps: define (`@tool`) → bind (`bind_tools`) → the model writes `tool_calls` (just an instruction) → run (`ToolNode`)."
    },
    {
      "zh": "LangGraph 把第 3、4 步拆成不同节点，中间可以插入人工审核；LangChain 的智能体里它们混在一起。",
      "en": "LangGraph puts steps 3 and 4 in separate nodes, so a human review can go between them; in a LangChain agent they are merged."
    },
    {
      "zh": "工具是 Runnable：`get_weather.invoke({...})` 直接执行；`get_weather.invoke(调用字典)` 返回 ToolMessage。",
      "en": "A tool is a Runnable: `get_weather.invoke({...})` runs it; `get_weather.invoke(call_dict)` returns a ToolMessage."
    },
    {
      "zh": "`model_with_tools = model.bind_tools(tools)`；`reply.tool_calls` 是字典列表，`args` 已解析好。",
      "en": "`model_with_tools = model.bind_tools(tools)`; `reply.tool_calls` is a list of dicts with `args` already parsed."
    },
    {
      "zh": "智能体图 = `START → agent`，`should_continue` 有工具调用去 `tools`、否则 `END`，`tools → agent` 循环；现成的路由是 `tools_condition`。",
      "en": "The agent graph = `START → agent`, `should_continue` goes to `tools` on tool calls or `END` otherwise, and `tools → agent` loops; the ready-made router is `tools_condition`."
    },
    {
      "zh": "一条回答可以请求多个工具，`ToolNode` 一次全部执行；前一个工具的结果还能决定下一个调什么（连环调用）。",
      "en": "One reply can request several tools and `ToolNode` runs them all; one tool's result can also decide the next call (chained calls)."
    }
  ],
  "files": [
    {
      "zh": "演示（不调用模型、免费）：第 1 步定义工具、第 4 步手动执行工具，对比视频的 ToolNode 写法和现在能用的两种写法。",
      "en": "Demo (no model calls, free): step 1 (define tools) and step 4 (run them by hand), comparing the video's ToolNode call with the two ways that work now.",
      "path": "practice/l39_manual_tools.py"
    },
    {
      "zh": "练习：补全 `@tool`、`bind_tools`、`call_model`、`should_continue`、ToolNode 和边（6 个 TODO）。",
      "en": "Exercise: fill in `@tool`, `bind_tools`, `call_model`, `should_continue`, the ToolNode and the edges (6 TODOs).",
      "path": "practice/l39_tool_agent_todo.py"
    },
    {
      "zh": "参考答案：视频里的天气智能体，问「最冷的城市天气如何？」（一般调用模型 3 次）。",
      "en": "Solution: the video's weather agent asking about the coolest cities (usually 3 model calls).",
      "path": "practice/l39_tool_agent_solution.py"
    },
    {
      "zh": "补充：不用 ToolNode、自己写工具节点的版本，用 `stream_mode=\"updates\"` 打印每一步。",
      "en": "Extra: the version with a hand-written tool node instead of ToolNode, printing every step with `stream_mode=\"updates\"`.",
      "path": "practice/l39_tool_agent_by_hand.py"
    },
    {
      "zh": "补充：用 `create_agent` 一行创建同样的智能体。",
      "en": "Extra: the same agent in one call with `create_agent`.",
      "path": "practice/l39_prebuilt_agent.py"
    }
  ]
});
