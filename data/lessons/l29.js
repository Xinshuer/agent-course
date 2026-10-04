COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l29",
  "priority": "important",
  "handwrite": false,
  "studyMinutes": 45,
  "source": "subtitle",
  "summary": {
    "zh": "两种「精细控制」，都真正调用了模型。一是**图的运行时配置**：图里提前准备好两个模型，节点通过第二个参数 `config` 读取 `config[\"configurable\"]`，调用时传入 `{\"configurable\": {\"model\": ...}}` 就能切换，图不用改（1.x 还有更新的 `context_schema` + `Runtime` 写法）。二是 **map-reduce**：主题 → 模型扩展出几个子话题 → 用 `Send` 为每个子话题并行生成一个笑话 → 再让模型选出最好的一个。",
    "en": "Two kinds of fine control, both calling a real model. **Runtime configuration**: the graph holds two prepared models, the node reads `config[\"configurable\"]` through its second parameter `config`, and passing `{\"configurable\": {\"model\": ...}}` at call time switches models without touching the graph (1.x also offers the newer `context_schema` + `Runtime` style). **Map-reduce**: a topic → the model expands it into a few subjects → `Send` writes one joke per subject in parallel → the model picks the best one."
  },
  "goals": [
    {
      "zh": "写出视频里的「运行时选模型」：模型字典 + 节点参数 `config: RunnableConfig` + `config[\"configurable\"].get(...)`",
      "en": "Write the video's “choose the model at run time”: a dict of models + a `config: RunnableConfig` parameter + `config[\"configurable\"].get(...)`"
    },
    {
      "zh": "调用时用 `invoke(输入, config={\"configurable\": {...}})` 切换，并用 `response_metadata[\"model_name\"]` 确认",
      "en": "Switch with `invoke(input, config={\"configurable\": {...}})` and confirm with `response_metadata[\"model_name\"]`"
    },
    {
      "zh": "认识 1.x 推荐的 `context_schema` + `Runtime` 写法，知道它和视频写法的对应关系",
      "en": "Recognise the 1.x `context_schema` + `Runtime` style and how it maps to the video's style"
    },
    {
      "zh": "说清 map-reduce 的流程，用 `Send` 按运行时的数量并行启动节点，用 reducer 收集结果",
      "en": "Explain the map-reduce flow, start nodes in parallel with `Send` for a count known only at run time, and collect results with a reducer"
    },
    {
      "zh": "知道 DeepSeek 用 `with_structured_output` 时要关掉思考模式",
      "en": "Know that DeepSeek needs thinking mode off for `with_structured_output`"
    },
    {
      "zh": "会用 `lambda` 给 `min` / `sorted` 写比较规则",
      "en": "Use `lambda` as the comparison rule for `min` / `sorted`"
    }
  ],
  "blocks": [
    {
      "t": "video",
      "zh": "这一集约 14 分钟，演示两种「精细控制」。前半段是**图的运行时配置**：图里准备两个模型（视频里是 DeepSeek 和 OpenAI 的 gpt-3.5-turbo），调用时通过配置决定用哪一个。后半段是 **map-reduce**：给一个主题，先扩展出几个子话题，再给每个子话题各写一个笑话，最后让模型选出最好的一个，这部分视频用的是 DeepSeek。代码都是老师事先写好、粘贴进来讲解的。讲义全部改用 DeepSeek（只需要一个 DeepSeek key），两个模型换成 `deepseek-flash` 和 `deepseek-v4-pro`。",
      "en": "This ~14-minute episode shows two kinds of fine control. The first half is **runtime configuration**: the graph holds two models (DeepSeek and OpenAI's gpt-3.5-turbo in the video), and a setting passed at call time decides which one runs. The second half is **map-reduce**: a topic is expanded into a few subjects, a joke is written for each, and the model picks the best one; the video uses DeepSeek here. The instructor pastes prepared code and explains it. These notes use DeepSeek throughout (one DeepSeek key is all you need), with `deepseek-flash` and `deepseek-v4-pro` as the two models."
    },
    {
      "t": "h",
      "zh": "一、运行时配置：调用时再选模型",
      "en": "1. Runtime configuration: pick the model at call time"
    },
    {
      "t": "p",
      "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=0) 同一张图，有时想这次用 A 模型、下次用 B 模型，或者换别的参数，但不想为此改代码、重新编译。做法是：**把可选项提前准备好，调用时通过「配置」告诉节点用哪一个**。\n\n[▶ 00:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=31) 视频里建了两个模型，一个 DeepSeek、一个 OpenAI，放进一个字典，键分别叫 `\"deepseek\"` 和 `\"openai\"`。我们没有 OpenAI 的 key，就换成同一个 DeepSeek key 下的两个模型：`deepseek-flash`（默认）和 `deepseek-v4-pro`，键叫 `\"deepseek\"` 和 `\"pro\"`。",
      "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=0) Sometimes you want one graph to use model A this time and model B next time, or some other setting, without editing code or recompiling. The trick: **prepare the options in advance and tell the node which one to use through a “config” at call time**.\n\n[▶ 00:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=31) The video builds two models, one DeepSeek and one OpenAI, and puts them in a dict under the keys `\"deepseek\"` and `\"openai\"`. We have no OpenAI key, so we use two models under the same DeepSeek key: `deepseek-flash` (default) and `deepseek-v4-pro`, under the keys `\"deepseek\"` and `\"pro\"`."
    },
    {
      "t": "code",
      "file": "runtime_config.py",
      "code": {
        "zh": "from typing import Annotated\nfrom typing_extensions import TypedDict\nfrom langchain_core.messages import HumanMessage\nfrom langchain_core.runnables import RunnableConfig\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.graph import StateGraph, START, END\nfrom langgraph.graph.message import add_messages\nfrom llm import API_KEY, MODEL\n\n# 可以切换的模型：名字 → 模型对象，提前建好\nmodels = {\n    \"deepseek\": ChatDeepSeek(model=MODEL, api_key=API_KEY),           # deepseek-flash，默认\n    \"pro\": ChatDeepSeek(model=\"deepseek-v4-pro\", api_key=API_KEY),    # 视频里这里是 OpenAI 模型\n}\n\nclass AgentState(TypedDict):\n    messages: Annotated[list, add_messages]   # 新消息自动追加到末尾\n\ndef _call_model(state: AgentState, config: RunnableConfig):\n    model_name = config[\"configurable\"].get(\"model\", \"deepseek\")   # 没配置就用 \"deepseek\"\n    model = models[model_name]\n    response = model.invoke(state[\"messages\"])\n    return {\"messages\": [response]}\n\nbuilder = StateGraph(AgentState)\nbuilder.add_node(\"model\", _call_model)\nbuilder.add_edge(START, \"model\")\nbuilder.add_edge(\"model\", END)\ngraph = builder.compile()\n\nquestion = {\"messages\": [HumanMessage(\"嗨，你是谁？请用一句话回答。\")]}\n\nr1 = graph.invoke(question)                                            # 不传配置\nr2 = graph.invoke(question, config={\"configurable\": {\"model\": \"pro\"}})  # 运行时切换\nfor r in (r1, r2):\n    reply = r[\"messages\"][-1]\n    print(reply.content)\n    print(\"model_name:\", reply.response_metadata[\"model_name\"])\n\n# 讲义实测输出（回答每次会不同）：\n# 我是由深度求索公司创造的DeepSeek AI助手，很高兴认识你！\n# model_name: deepseek-flash\n# 嗨，我是 DeepSeek，由深度求索公司创造的 AI 助手，很高兴认识你！\n# model_name: deepseek-v4-pro",
        "en": "from typing import Annotated\nfrom typing_extensions import TypedDict\nfrom langchain_core.messages import HumanMessage\nfrom langchain_core.runnables import RunnableConfig\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.graph import StateGraph, START, END\nfrom langgraph.graph.message import add_messages\nfrom llm import API_KEY, MODEL\n\n# the models to switch between: name -> model object, built in advance\nmodels = {\n    \"deepseek\": ChatDeepSeek(model=MODEL, api_key=API_KEY),           # deepseek-flash, the default\n    \"pro\": ChatDeepSeek(model=\"deepseek-v4-pro\", api_key=API_KEY),    # the video has an OpenAI model here\n}\n\nclass AgentState(TypedDict):\n    messages: Annotated[list, add_messages]   # new messages are appended automatically\n\ndef _call_model(state: AgentState, config: RunnableConfig):\n    model_name = config[\"configurable\"].get(\"model\", \"deepseek\")   # \"deepseek\" when nothing is configured\n    model = models[model_name]\n    response = model.invoke(state[\"messages\"])\n    return {\"messages\": [response]}\n\nbuilder = StateGraph(AgentState)\nbuilder.add_node(\"model\", _call_model)\nbuilder.add_edge(START, \"model\")\nbuilder.add_edge(\"model\", END)\ngraph = builder.compile()\n\nquestion = {\"messages\": [HumanMessage(\"Hi, who are you? Answer in one sentence.\")]}\n\nr1 = graph.invoke(question)                                            # no config\nr2 = graph.invoke(question, config={\"configurable\": {\"model\": \"pro\"}})  # switch at run time\nfor r in (r1, r2):\n    reply = r[\"messages\"][-1]\n    print(reply.content)\n    print(\"model_name:\", reply.response_metadata[\"model_name\"])\n\n# Output from a test run of these notes (asked in Chinese; replies vary):\n# I'm DeepSeek, an AI assistant made by DeepSeek. Nice to meet you!   (translated)\n# model_name: deepseek-flash\n# Hi, I'm DeepSeek, an AI assistant created by DeepSeek. Nice to meet you!   (translated)\n# model_name: deepseek-v4-pro"
      },
      "note": {
        "zh": "本地运行：`practice/l29_runtime_config.py`（运行一次 = 2 次 API 调用）。",
        "en": "Run locally: `practice/l29_runtime_config.py` (one run = 2 API calls)."
      }
    },
    {
      "t": "p",
      "zh": "逐段看：\n- [▶ 01:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=61) 状态 `AgentState` 只有一个消息列表 `messages`。这里写成 `Annotated[list, add_messages]`：`add_messages` 是 LangGraph 自带的「消息版 reducer」，和 28 节的 `operator.add` 一样，把节点返回的新消息**追加**到末尾。所以节点只返回 `[response]` 就够了，不用像 27 节那样自己写「旧消息 + 新消息」。31、32 节还会经常用到它。\n- [▶ 01:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=92) 节点 `_call_model` 多了第二个参数 `config: RunnableConfig`。LangGraph 看到这个参数，就会把**这次运行的配置**传进来。`config[\"configurable\"]` 是一个字典，放的是你自己定义的设置；`.get(\"model\", \"deepseek\")` 表示没配置时用 `\"deepseek\"`。\n- [▶ 02:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=123) 图很简单：`START → model → END`。\n- [▶ 03:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=217) 调用时用 `invoke` 的第二个参数传配置：`config={\"configurable\": {\"model\": \"pro\"}}`。28 节的 `recursion_limit` 和 `thread_id` 也放在这个参数里。",
      "en": "Piece by piece:\n- [▶ 01:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=61) The state `AgentState` holds a single message list, `messages`, written as `Annotated[list, add_messages]`. `add_messages` is LangGraph's built-in “reducer for messages”: like `operator.add` in lesson 28, it **appends** the node's new messages. So the node returns just `[response]` instead of lesson 27's “old messages + new one”. Lessons 31 and 32 use it a lot.\n- [▶ 01:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=92) The node `_call_model` has a second parameter, `config: RunnableConfig`. Seeing it, LangGraph passes in **this run's configuration**. `config[\"configurable\"]` is a dict holding your own settings; `.get(\"model\", \"deepseek\")` falls back to `\"deepseek\"` when nothing is set.\n- [▶ 02:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=123) The graph is simple: `START → model → END`.\n- [▶ 03:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=217) At call time the config goes in `invoke`'s second argument: `config={\"configurable\": {\"model\": \"pro\"}}`. Lesson 28's `recursion_limit` and `thread_id` live in that argument too."
    },
    {
      "t": "video",
      "zh": "[▶ 02:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=155) 视频里不传配置时问「你是谁」，模型说自己是 DeepSeek；[▶ 03:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=187) 老师再从回答的 `response_metadata` 里确认 `model_name` 是 DeepSeek 的模型名。传入 `{\"configurable\": {\"model\": \"openai\"}}` 后，回答里看不出是谁，但 `model_name` 变成了 OpenAI 的 `gpt-3.5-turbo` 系列，说明已经切换。讲义实测时两次的 `model_name` 分别是 `deepseek-flash` 和 `deepseek-v4-pro`。两个模型都说自己是 DeepSeek，所以同样要看 `model_name` 才能分辨。（视频里当时的 DeepSeek 模型名 `deepseek-chat` 已经停用，现在只能用 `deepseek-flash` 和 `deepseek-v4-pro`。）",
      "en": "[▶ 02:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=155) In the video, without a config, the model answers “who are you” by saying it's DeepSeek; [▶ 03:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=187) the instructor then checks the reply's `response_metadata`, where `model_name` is a DeepSeek model name. With `{\"configurable\": {\"model\": \"openai\"}}` the answer doesn't reveal who replied, but `model_name` now shows OpenAI's `gpt-3.5-turbo`, so the switch worked. In our test run the two `model_name`s were `deepseek-flash` and `deepseek-v4-pro`. Both models call themselves DeepSeek, so again `model_name` is how you tell them apart. (The DeepSeek model name of that time, `deepseek-chat`, has been retired; only `deepseek-flash` and `deepseek-v4-pro` are valid now.)"
    },
    {
      "t": "h",
      "zh": "二、1.x 的新写法：context_schema + Runtime",
      "en": "2. The newer 1.x style: context_schema + Runtime"
    },
    {
      "t": "p",
      "zh": "视频用的 `config[\"configurable\"]` 在 1.2.12 里照样能用（上面就是实测结果）。不过 LangGraph 1.x 给「自己的运行设置」准备了一个更清楚的写法，叫**运行时上下文（context）**。做同一件事，改动如下：",
      "en": "The video's `config[\"configurable\"]` still works on 1.2.12 (the output above is real). LangGraph 1.x, however, offers a clearer place for your own run settings, the **runtime context**. Doing the same job looks like this:"
    },
    {
      "t": "code",
      "file": "runtime_context.py",
      "code": {
        "zh": "from langgraph.runtime import Runtime\n\nclass Context(TypedDict):          # ① 声明有哪些运行时设置\n    model: str\n\ndef call_model(state: AgentState, runtime: Runtime[Context]):    # ② 第二个参数换成 runtime\n    ctx = runtime.context or {}    # 没传 context 时是 None，用 or {} 兜底（05 节的 x or [] 写法）\n    model = models[ctx.get(\"model\", \"deepseek\")]\n    response = model.invoke(state[\"messages\"])\n    return {\"messages\": [response]}\n\nbuilder = StateGraph(AgentState, context_schema=Context)          # ③ 建图时告诉它 context 的格式\nbuilder.add_node(\"model\", call_model)\nbuilder.add_edge(START, \"model\")\nbuilder.add_edge(\"model\", END)\ngraph = builder.compile()\n\ngraph.invoke(question)                              # 默认：deepseek\ngraph.invoke(question, context={\"model\": \"pro\"})    # ④ 调用时用 context= 传入",
        "en": "from langgraph.runtime import Runtime\n\nclass Context(TypedDict):          # (1) declare the run-time settings\n    model: str\n\ndef call_model(state: AgentState, runtime: Runtime[Context]):    # (2) the second parameter becomes runtime\n    ctx = runtime.context or {}    # None when no context is passed; `or {}` covers it (lesson 05's x or [])\n    model = models[ctx.get(\"model\", \"deepseek\")]\n    response = model.invoke(state[\"messages\"])\n    return {\"messages\": [response]}\n\nbuilder = StateGraph(AgentState, context_schema=Context)          # (3) tell the graph the context's format\nbuilder.add_node(\"model\", call_model)\nbuilder.add_edge(START, \"model\")\nbuilder.add_edge(\"model\", END)\ngraph = builder.compile()\n\ngraph.invoke(question)                              # default: deepseek\ngraph.invoke(question, context={\"model\": \"pro\"})    # (4) pass it with context= when calling"
      },
      "note": {
        "zh": "完整代码：`practice/l29_runtime_context.py`（运行一次 = 2 次 API 调用）。`AgentState`、`models`、`question` 和上一段一样。",
        "en": "Full code: `practice/l29_runtime_context.py` (one run = 2 API calls). `AgentState`, `models` and `question` are as in the previous part."
      }
    },
    {
      "t": "p",
      "zh": "| | 视频的写法 | 1.x 推荐的写法 |\n|---|---|---|\n| 节点的第二个参数 | `config: RunnableConfig` | `runtime: Runtime[Context]` |\n| 读取设置 | `config[\"configurable\"].get(\"model\", ...)` | `runtime.context` |\n| 调用时传入 | `invoke(输入, config={\"configurable\": {...}})` | `invoke(输入, context={...})` |\n| 声明格式 | 不需要 | `StateGraph(State, context_schema=Context)` |\n\n一个简单的分工：**自己的业务设置**（用哪个模型、什么风格）放 `context`；**LangGraph 自己的运行参数**（`recursion_limit`、30 节的 `thread_id`）继续放 `config`。旧教程里还有一种 `StateGraph(State, config_schema=...)` 的写法，1.2.12 会给出弃用警告，不要再用。",
      "en": "| | The video's style | Recommended in 1.x |\n|---|---|---|\n| The node's second parameter | `config: RunnableConfig` | `runtime: Runtime[Context]` |\n| Reading a setting | `config[\"configurable\"].get(\"model\", ...)` | `runtime.context` |\n| Passing it at call time | `invoke(input, config={\"configurable\": {...}})` | `invoke(input, context={...})` |\n| Declaring the format | Not needed | `StateGraph(State, context_schema=Context)` |\n\nA simple split: **your own settings** (which model, what style) go in `context`; **LangGraph's own run parameters** (`recursion_limit`, lesson 30's `thread_id`) stay in `config`. Older tutorials also show `StateGraph(State, config_schema=...)`; 1.2.12 warns that it's deprecated, so don't use it."
    },
    {
      "t": "warn",
      "zh": "用 context 写法时，调用忘了传 `context=`，`runtime.context` 就是 `None`。直接写 `runtime.context[\"model\"]` 会报 `TypeError: 'NoneType' object is not subscriptable`，所以上面的代码先写了 `runtime.context or {}`。",
      "en": "With the context style, forgetting `context=` leaves `runtime.context` as `None`, and `runtime.context[\"model\"]` raises `TypeError: 'NoneType' object is not subscriptable`. That's why the code above starts with `runtime.context or {}`."
    },
    {
      "t": "check",
      "q": {
        "zh": "按视频的写法，想让这次调用用 `\"pro\"` 模型，应该怎么写？",
        "en": "In the video's style, how do you make this call use the `\"pro\"` model?"
      },
      "options": [
        {
          "zh": "`graph.invoke({\"messages\": [...], \"model\": \"pro\"})`",
          "en": "`graph.invoke({\"messages\": [...], \"model\": \"pro\"})`"
        },
        {
          "zh": "`graph.invoke({\"messages\": [...]}, config={\"configurable\": {\"model\": \"pro\"}})`",
          "en": "`graph.invoke({\"messages\": [...]}, config={\"configurable\": {\"model\": \"pro\"}})`"
        },
        {
          "zh": "改 `_call_model` 里的默认值，再重新编译",
          "en": "Change the default in `_call_model` and recompile"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "设置放在 `invoke` 的第二个参数里，键名是 `\"configurable\"`；节点用 `config[\"configurable\"]` 读出来。放进第一个参数的话，`model` 不是状态里的字段，会被悄悄丢掉。",
        "en": "Settings go in `invoke`'s second argument under `\"configurable\"`, and the node reads them from `config[\"configurable\"]`. Put in the first argument, `model` isn't a state field and is silently dropped."
      }
    },
    {
      "t": "h",
      "zh": "三、map-reduce：先拆开并行做，再合起来挑",
      "en": "3. Map-reduce: split, work in parallel, then combine"
    },
    {
      "t": "p",
      "zh": "[▶ 04:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=249) map-reduce 是处理「一批同类任务」的经典套路：\n- **map（分发）**：把一个大任务拆成几个小任务，每个小任务做同样的事，**并行**执行\n- **reduce（归约）**：把所有小任务的结果合在一起，得出最终结果\n\n视频的例子：用户给一个主题（比如「动物」）→ 模型扩展出几个相关的子话题 → 每个子话题**各写一个笑话**（map）→ 把所有笑话交给模型，**选出最好的一个**（reduce）。\n\n难点在于：子话题有几个，要等模型回答了才知道。28 节的分支是建图时用边写死的（连两条边就是两路），这里做不到。LangGraph 的办法是 `Send`。",
      "en": "[▶ 04:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=249) Map-reduce is the classic pattern for a batch of similar tasks:\n- **map**: split a big job into small tasks that each do the same thing, **in parallel**\n- **reduce**: combine all their results into the final answer\n\nThe video's example: the user gives a topic (say “animals”) → the model expands it into a few related subjects → **one joke per subject** (map) → all jokes go back to the model, which **picks the best one** (reduce).\n\nThe catch: how many subjects there are is only known once the model has answered. Lesson 28's branches were fixed by edges when building the graph (two edges, two paths), which can't work here. LangGraph's answer is `Send`."
    },
    {
      "t": "p",
      "zh": "[▶ 05:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=311) 先准备三段提示词，`{}` 里的部分在运行时用 07 节学过的 `.format(topic=...)` 填入：\n- `subjects_prompt`：生成一个逗号分隔的列表，包含几个和 `{topic}` 相关的例子\n- `joke_prompt`：写一个关于 `{subject}` 的笑话\n- `best_joke_prompt`：从这些关于 `{topic}` 的笑话里选出最好的，返回它的 ID\n\n[▶ 06:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=372) 再用 Pydantic（12 节）定义三种输出格式：`Subjects`（子话题列表）、`Joke`（一个笑话）、`BestJoke`（最佳笑话的编号 `id`，从 0 开始）。字段可以用 `Field(description=...)` 写上说明，这段说明会随格式一起发给模型：讲义实测时，没写说明的 `Subjects` 有一次只返回了 `['动物']`（主题本身），写上说明后就正常列出了几个子话题。节点里写 `model.with_structured_output(格式类)`，模型就直接返回这个类的对象，而不是一段文字。老师问「还记得这个方法吗」，不过在本课程里它是第一次出现，先知道它的作用就行，45 节会细讲。",
      "en": "[▶ 05:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=311) First, three prompts; the parts in `{}` are filled in at run time with `.format(topic=...)` from lesson 07:\n- `subjects_prompt`: generate a comma-separated list of a few examples related to `{topic}`\n- `joke_prompt`: write a joke about `{subject}`\n- `best_joke_prompt`: pick the best of these jokes about `{topic}` and return its ID\n\n[▶ 06:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=372) Then three output formats with Pydantic (lesson 12): `Subjects` (a list of subjects), `Joke` (one joke) and `BestJoke` (the best joke's index `id`, starting at 0). A field can carry a `Field(description=...)`, which is sent to the model along with the format: in our tests, `Subjects` without a description once came back as just the topic itself (`['animals']`), and with a description the model listed proper subtopics. In a node, `model.with_structured_output(FormatClass)` makes the model return an object of that class instead of plain text. The instructor asks whether you remember this method, but in this course it appears here for the first time; just know what it does for now, as lesson 45 covers it in depth."
    },
    {
      "t": "warn",
      "zh": "DeepSeek 的 `deepseek-flash` 默认开启**思考模式**。`with_structured_output` 默认靠「强制模型调用一个工具」来拿到结构化结果，而思考模式不允许强制调用，会报 400 错误。所以创建模型时要关掉思考：`ChatDeepSeek(..., extra_body={\"thinking\": {\"type\": \"disabled\"}})`，和 40、45 节的做法一样。视频录制时的 DeepSeek 没有这个限制。",
      "en": "DeepSeek's `deepseek-flash` runs in **thinking mode** by default. `with_structured_output` normally gets structured results by forcing the model to call a tool, and thinking mode refuses forced calls with a 400 error. So switch thinking off when creating the model: `ChatDeepSeek(..., extra_body={\"thinking\": {\"type\": \"disabled\"}})`, just as in lessons 40 and 45. The DeepSeek used when the video was recorded had no such restriction."
    },
    {
      "t": "p",
      "zh": "[▶ 06:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=403) 状态分成两个：\n- `OverallState`：整张图的状态，有 `topic`（用户的主题）、`subjects`（子话题）、`jokes`（所有笑话）、`best_selected_joke`（最佳笑话）。`jokes` 会被好几个节点**同时**写入，所以要用 28 节的 `Annotated[list, operator.add]` 拼接。\n- `JokeState`：只有一个 `subject`。被 `Send` 启动的 `generate_joke` 只会收到这么一小份数据，看不到整个状态。",
      "en": "[▶ 06:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=403) There are two states:\n- `OverallState`: the whole graph's state, with `topic` (the user's topic), `subjects`, `jokes` (all the jokes) and `best_selected_joke`. Several nodes write `jokes` **at the same time**, so it uses lesson 28's `Annotated[list, operator.add]` to join them.\n- `JokeState`: just one `subject`. A `generate_joke` run started by `Send` receives only this small piece of data and can't see the whole state."
    },
    {
      "t": "code",
      "file": "map_reduce_llm.py",
      "code": {
        "zh": "import operator\nfrom typing import Annotated\nfrom typing_extensions import TypedDict\nfrom pydantic import BaseModel, Field\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.graph import StateGraph, START, END\nfrom langgraph.types import Send\nfrom llm import API_KEY, MODEL\n\n# 1. 三段提示词\nsubjects_prompt = \"生成一个用逗号分隔的列表，包含 2 到 3 个与下面这个主题相关的例子：{topic}\"\njoke_prompt = \"写一个关于{subject}的笑话，一两句话就好。\"\nbest_joke_prompt = \"\"\"下面是一些关于{topic}的笑话。选出最好的一个，返回它的 ID（第一个是 0）。\n\n{jokes}\"\"\"\n\n# 2. 三种输出格式（Pydantic，12 节）\nclass Subjects(BaseModel):\n    subjects: list[str] = Field(description=\"2 到 3 个与主题相关的具体子话题，每项一个，不要只写主题本身\")\n\nclass Joke(BaseModel):\n    joke: str\n\nclass BestJoke(BaseModel):\n    id: int = Field(description=\"最好的那个笑话的索引，从 0 开始\", ge=0)\n\n# 3. 模型：关掉思考模式，with_structured_output 才能用\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY, extra_body={\"thinking\": {\"type\": \"disabled\"}})\n\n# 4. 状态\nclass OverallState(TypedDict):\n    topic: str\n    subjects: list\n    jokes: Annotated[list, operator.add]   # 多个 generate_joke 同时写入，用 reducer 拼接\n    best_selected_joke: str\n\nclass JokeState(TypedDict):                # 每个 generate_joke 只拿到一个子话题\n    subject: str\n\n# 5. 节点\ndef generate_topics(state: OverallState):\n    prompt = subjects_prompt.format(topic=state[\"topic\"])\n    response = model.with_structured_output(Subjects).invoke(prompt)\n    return {\"subjects\": response.subjects}\n\ndef generate_joke(state: JokeState):\n    prompt = joke_prompt.format(subject=state[\"subject\"])\n    response = model.with_structured_output(Joke).invoke(prompt)\n    return {\"jokes\": [response.joke]}\n\ndef continue_to_jokes(state: OverallState):            # map：每个子话题一个 Send\n    return [Send(\"generate_joke\", {\"subject\": s}) for s in state[\"subjects\"]]\n\ndef best_joke(state: OverallState):                    # reduce：笑话到齐后执行一次\n    jokes = \"\\n\\n\".join(state[\"jokes\"])\n    prompt = best_joke_prompt.format(topic=state[\"topic\"], jokes=jokes)\n    response = model.with_structured_output(BestJoke).invoke(prompt)\n    return {\"best_selected_joke\": state[\"jokes\"][response.id]}\n\n# 6. 建图\ngraph = StateGraph(OverallState)\ngraph.add_node(\"generate_topics\", generate_topics)\ngraph.add_node(\"generate_joke\", generate_joke)\ngraph.add_node(\"best_joke\", best_joke)\ngraph.add_edge(START, \"generate_topics\")\ngraph.add_conditional_edges(\"generate_topics\", continue_to_jokes, [\"generate_joke\"])\ngraph.add_edge(\"generate_joke\", \"best_joke\")\ngraph.add_edge(\"best_joke\", END)\napp = graph.compile()\n\n# 7. 用 stream 运行：每个节点跑完就打印它返回的更新\nfor step in app.stream({\"topic\": \"动物\"}):\n    print(step)",
        "en": "import operator\nfrom typing import Annotated\nfrom typing_extensions import TypedDict\nfrom pydantic import BaseModel, Field\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.graph import StateGraph, START, END\nfrom langgraph.types import Send\nfrom llm import API_KEY, MODEL\n\n# 1. three prompts\nsubjects_prompt = \"Generate a comma-separated list of 2 to 3 examples related to this topic: {topic}\"\njoke_prompt = \"Write a joke about {subject}, one or two sentences.\"\nbest_joke_prompt = \"\"\"Below are some jokes about {topic}. Pick the best one and return its ID (the first is 0).\n\n{jokes}\"\"\"\n\n# 2. three output formats (Pydantic, lesson 12)\nclass Subjects(BaseModel):\n    subjects: list[str] = Field(description=\"2 to 3 concrete subtopics related to the topic, one per item, not just the topic itself\")\n\nclass Joke(BaseModel):\n    joke: str\n\nclass BestJoke(BaseModel):\n    id: int = Field(description=\"index of the best joke, starting at 0\", ge=0)\n\n# 3. the model: thinking off, so with_structured_output works\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY, extra_body={\"thinking\": {\"type\": \"disabled\"}})\n\n# 4. state\nclass OverallState(TypedDict):\n    topic: str\n    subjects: list\n    jokes: Annotated[list, operator.add]   # several generate_joke runs write at once; the reducer joins them\n    best_selected_joke: str\n\nclass JokeState(TypedDict):                # each generate_joke run gets one subject\n    subject: str\n\n# 5. nodes\ndef generate_topics(state: OverallState):\n    prompt = subjects_prompt.format(topic=state[\"topic\"])\n    response = model.with_structured_output(Subjects).invoke(prompt)\n    return {\"subjects\": response.subjects}\n\ndef generate_joke(state: JokeState):\n    prompt = joke_prompt.format(subject=state[\"subject\"])\n    response = model.with_structured_output(Joke).invoke(prompt)\n    return {\"jokes\": [response.joke]}\n\ndef continue_to_jokes(state: OverallState):            # map: one Send per subject\n    return [Send(\"generate_joke\", {\"subject\": s}) for s in state[\"subjects\"]]\n\ndef best_joke(state: OverallState):                    # reduce: runs once all jokes are in\n    jokes = \"\\n\\n\".join(state[\"jokes\"])\n    prompt = best_joke_prompt.format(topic=state[\"topic\"], jokes=jokes)\n    response = model.with_structured_output(BestJoke).invoke(prompt)\n    return {\"best_selected_joke\": state[\"jokes\"][response.id]}\n\n# 6. build the graph\ngraph = StateGraph(OverallState)\ngraph.add_node(\"generate_topics\", generate_topics)\ngraph.add_node(\"generate_joke\", generate_joke)\ngraph.add_node(\"best_joke\", best_joke)\ngraph.add_edge(START, \"generate_topics\")\ngraph.add_conditional_edges(\"generate_topics\", continue_to_jokes, [\"generate_joke\"])\ngraph.add_edge(\"generate_joke\", \"best_joke\")\ngraph.add_edge(\"best_joke\", END)\napp = graph.compile()\n\n# 7. run with stream: print each node's update as soon as it finishes\nfor step in app.stream({\"topic\": \"animals\"}):\n    print(step)"
      },
      "note": {
        "zh": "本地运行：`practice/l29_map_reduce_llm.py`。运行一次 = 1 次拆话题 + 每个子话题 1 次 + 1 次评选，最多 5 次 API 调用。",
        "en": "Run locally: `practice/l29_map_reduce_llm.py`. One run = 1 call to expand the topic + 1 per subject + 1 to judge, at most 5 API calls."
      }
    },
    {
      "t": "p",
      "zh": "节点逐个看：\n- [▶ 07:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=465) `generate_topics`：用 `topic` 填好提示词，让模型按 `Subjects` 格式返回，写入 `subjects`。\n- [▶ 08:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=528) `generate_joke`：同样的套路，按 `Joke` 格式返回一个笑话。返回的是 `[response.joke]`（外面套一层列表），reducer 才能拼接。\n- [▶ 09:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=561) `continue_to_jokes`：**map 的关键**。视频把它也算进了「四个节点」，其实它不是节点，而是挂在条件边上的路由函数（28 节），但它返回的不是节点名，而是一个 `Send` 列表（用 06 节的列表推导式生成）。`Send(\"generate_joke\", {\"subject\": s})` 的意思是「启动一次 `generate_joke`，交给它 `{\"subject\": s}`」。有几个子话题就有几个 `Send`，`generate_joke` 就并行跑几次。\n- [▶ 10:27](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=627) `best_joke`：**reduce**。所有笑话到齐后执行一次：把笑话拼成一段交给模型，按 `BestJoke` 拿到编号，再从列表里取出那个笑话。\n\n[▶ 10:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=658) 建图：`START → generate_topics`；然后 `add_conditional_edges(\"generate_topics\", continue_to_jokes, [\"generate_joke\"])`，第三个参数列出可能的去向（不写也能运行，但画出来的图里没有这条虚线，反而像是 `generate_topics` 直接连到了结束）；最后 `generate_joke → best_joke → END`。",
      "en": "Node by node:\n- [▶ 07:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=465) `generate_topics`: fills the prompt with `topic`, has the model answer in the `Subjects` format, and writes `subjects`.\n- [▶ 08:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=528) `generate_joke`: the same pattern, returning one joke in the `Joke` format. It returns `[response.joke]` (wrapped in a list) so the reducer can join it.\n- [▶ 09:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=561) `continue_to_jokes`: **the heart of map**. The video counts it among “four nodes”, but it isn't a node; it is a routing function on a conditional edge (lesson 28); instead of a node name it returns a list of `Send` (built with lesson 06's list comprehension). `Send(\"generate_joke\", {\"subject\": s})` means “start `generate_joke` once and hand it `{\"subject\": s}`”. One `Send` per subject, so `generate_joke` runs that many times in parallel.\n- [▶ 10:27](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=627) `best_joke`: **reduce**. It runs once, after all jokes are in: it joins them into one text for the model, gets an index in the `BestJoke` format, and takes that joke from the list.\n\n[▶ 10:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=658) The graph: `START → generate_topics`; then `add_conditional_edges(\"generate_topics\", continue_to_jokes, [\"generate_joke\"])`, whose third argument lists the possible targets (it runs without it, but the drawing then lacks this dashed arrow and shows `generate_topics` going straight to the end); finally `generate_joke → best_joke → END`."
    },
    {
      "t": "p",
      "zh": "[▶ 11:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=690) 视频用 `app.stream(...)` 运行：`stream` 每跑完一个节点就产出一次那个节点返回的更新，很适合观察流程。下面是讲义实测的输出（每次运行笑话都不一样）：",
      "en": "[▶ 11:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=690) The video runs it with `app.stream(...)`, which yields each node's update as soon as that node finishes, a good way to watch the flow. Below is the output from a test run of these notes (the jokes differ every time):"
    },
    {
      "t": "code",
      "file": {
        "zh": "运行结果",
        "en": "Output (translated)"
      },
      "lang": "text",
      "code": {
        "zh": "{'generate_topics': {'subjects': ['猫', '狗', '大象']}}\n{'generate_joke': {'jokes': ['我家猫说它要减肥，结果只把猫粮从大碗换成了小碗，然后连吃了三碗。']}}\n{'generate_joke': {'jokes': ['我家狗特别爱干净，每次我拖完地它都要在地上打几个滚——毕竟它觉得，这地是它刚拖的。']}}\n{'generate_joke': {'jokes': ['为什么大象从不使用电脑？因为它害怕不小心按到「删除」键，然后把整个鼠标删掉了。']}}\n{'best_joke': {'best_selected_joke': '我家狗特别爱干净，每次我拖完地它都要在地上打几个滚——毕竟它觉得，这地是它刚拖的。'}}",
        "en": "{'generate_topics': {'subjects': ['cat', 'dog', 'elephant']}}\n{'generate_joke': {'jokes': ['My cat says it is on a diet: it swapped the big bowl for a small one, then ate three bowls.']}}\n{'generate_joke': {'jokes': ['My dog loves a clean floor: after I mop, it rolls all over it - it thinks it did the mopping.']}}\n{'generate_joke': {'jokes': ['Why do elephants avoid computers? They are afraid of hitting Delete and deleting the whole mouse.']}}\n{'best_joke': {'best_selected_joke': 'My dog loves a clean floor: after I mop, it rolls all over it - it thinks it did the mopping.'}}"
      }
    },
    {
      "t": "video",
      "zh": "[▶ 12:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=722) 视频里「动物」被扩展成狮子、大象、企鹅、海豚、蝴蝶 5 个子话题，于是并行生成了 5 个笑话，最后选中一个关于狮子和猎豹的谐音梗（猎豹的英文 cheetah 和「作弊者」cheater 读音相近）。视频的提示词要 2～5 个例子，讲义改成 2～3 个，少花几次调用。[▶ 12:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=752) 老师最后对比说：LangChain 早期版本（0.1、0.2）也有现成的 map-reduce 链，而用 LangGraph 自己搭，每一步做什么、数据怎么流动都写在图里，控制更细，也更清楚。",
      "en": "[▶ 12:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=722) In the video, “animals” expands into 5 subjects (lion, elephant, penguin, dolphin, butterfly), so 5 jokes are written in parallel, and the winner is a pun about a lion and a cheetah (“cheetah” sounds like “cheater”). The video's prompt asks for 2–5 examples; these notes ask for 2–3 to save a few calls. [▶ 12:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=30&t=752) The instructor closes with a comparison: early LangChain (0.1, 0.2) had ready-made map-reduce chains, but building it yourself in LangGraph puts every step and every data flow into the graph, giving finer and clearer control."
    },
    {
      "t": "warn",
      "zh": "`Send` 的三个坑（1.2.12 实测）：\n1. **只测了一项**：只有 1 个 `Send` 时，结果字段没有 reducer 也不报错；一到 2 项就报 `InvalidUpdateError`。测试时至少用两三项。\n2. **列表是空的**：一个 `Send` 都没有时，map 节点和后面的 reduce 节点都**不会执行**，图直接结束，结果里没有 `best_selected_joke`。\n3. **数据给少了**：被启动的节点只看得到 `Send` 里的数据，读别的字段会 `KeyError`。需要什么，就在 `Send` 的字典里带上什么。",
      "en": "Three `Send` traps (tested on 1.2.12):\n1. **Testing with one item**: with a single `Send`, a results field without a reducer raises nothing; with two you get `InvalidUpdateError`. Test with two or three items.\n2. **An empty list**: with no `Send` at all, neither the map node nor the reduce node **runs**; the graph just ends and `best_selected_joke` is missing.\n3. **Too little data**: a started node sees only its `Send` data, and reading any other field raises `KeyError`. Put everything it needs into the `Send` dict."
    },
    {
      "t": "check",
      "q": {
        "zh": "`continue_to_jokes` 返回 `[Send(\"generate_joke\", {\"subject\": \"猫\"}), Send(\"generate_joke\", {\"subject\": \"狗\"})]`。第一次运行的 `generate_joke` 收到的 `state` 是什么？",
        "en": "`continue_to_jokes` returns `[Send(\"generate_joke\", {\"subject\": \"cat\"}), Send(\"generate_joke\", {\"subject\": \"dog\"})]`. What `state` does the first `generate_joke` run receive?"
      },
      "options": [
        {
          "zh": "整个 `OverallState`，包括 `topic` 和 `subjects`",
          "en": "The whole `OverallState`, including `topic` and `subjects`"
        },
        {
          "zh": "两个子话题组成的列表",
          "en": "A list of both subjects"
        },
        {
          "zh": "`{\"subject\": \"猫\"}`",
          "en": "`{\"subject\": \"cat\"}`"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "每个 `Send` 的第二个参数就是那一次运行收到的输入，节点看不到其他字段，所以给它单独定义了 `JokeState`。",
        "en": "Each `Send`'s second argument is exactly that run's input; the node sees no other fields, which is why it has its own `JokeState`."
      }
    },
    {
      "t": "h",
      "zh": "四、不花钱再练一遍：离线版 map-reduce",
      "en": "4. Practise again for free: an offline map-reduce"
    },
    {
      "t": "p",
      "zh": "上面的例子每跑一次都要调用模型。练习时可以把三处模型调用换成「查字典 + 一条简单规则」，图的结构一模一样：子话题和笑话都从字典里取，评选规则改成**最短的笑话最好**。要从一堆笑话里选出「最短」的那一个，就要用到 `min(..., key=lambda ...)`。",
      "en": "The example above calls the model on every run. For practice, swap the three model calls for “a dict lookup + one simple rule” and keep the graph exactly the same: subjects and jokes come from dicts, and the judging rule becomes **the shortest joke wins**. Picking the shortest from a pile of jokes calls for `min(..., key=lambda ...)`."
    },
    {
      "t": "py",
      "title": {
        "zh": "lambda：一行写完的小函数",
        "en": "lambda: a tiny one-line function"
      },
      "zh": "`lambda 参数: 表达式` 定义一个**没有名字、只有一个表达式**的函数，表达式的值就是返回值（不写 `return`）。它最适合「只在这里用一次的小规则」，最常见的是给 `min`、`max`、`sorted` 的 `key` 参数：告诉它们「按什么比较」。\n\n`key=lambda item: len(item[\"joke\"])` 等价于先写一个 `def joke_length(item): return len(item[\"joke\"])`，再传 `key=joke_length`。注意 `key` 要的是**函数**，写成 `key=len(item[\"joke\"])` 是错的。\n\nlambda 里不能写 `if` 语句块、循环或赋值；规则一复杂，就老老实实写 `def`。",
      "en": "`lambda params: expression` defines a function with **no name and a single expression**, whose value is returned (no `return`). It suits a small rule used in one place, most often the `key` argument of `min`, `max` and `sorted`, which says what to compare by.\n\n`key=lambda item: len(item[\"joke\"])` is the same as writing `def joke_length(item): return len(item[\"joke\"])` and passing `key=joke_length`. Note that `key` wants a **function**; `key=len(item[\"joke\"])` is wrong.\n\nA lambda can't contain `if` blocks, loops or assignments; once the rule gets complicated, write a `def`.",
      "code": {
        "zh": "jokes = [\n    {\"subject\": \"企鹅\", \"joke\": \"企鹅为什么不怕冷？因为它一年到头都穿着燕尾服。\"},\n    {\"subject\": \"蜗牛\", \"joke\": \"蜗牛去面试，被问到优点，它说：我从来不着急。\"},\n    {\"subject\": \"长颈鹿\", \"joke\": \"长颈鹿最怕嗓子疼，一疼就是好几米。\"},\n]\n\ndef joke_length(item):                 # 普通函数：告诉 min「按什么比较」\n    return len(item[\"joke\"])\n\nprint(min(jokes, key=joke_length)[\"subject\"])                     # 长颈鹿\nprint(min(jokes, key=lambda item: len(item[\"joke\"]))[\"subject\"])  # 用 lambda，效果一样\n\nranking = sorted(jokes, key=lambda item: len(item[\"joke\"]))       # 从短到长\nprint([item[\"subject\"] for item in ranking])\n\nranking = sorted(jokes, key=lambda item: len(item[\"joke\"]), reverse=True)   # 从长到短\nprint([item[\"subject\"] for item in ranking])",
        "en": "jokes = [\n    {\"subject\": \"penguin\", \"joke\": \"Why do penguins never feel cold? They wear a tuxedo all year.\"},\n    {\"subject\": \"snail\", \"joke\": \"A snail at a job interview: my best quality? I never rush.\"},\n    {\"subject\": \"giraffe\", \"joke\": \"Giraffes dread sore throats: the pain goes on for metres.\"},\n]\n\ndef joke_length(item):                 # a normal function: tells min what to compare by\n    return len(item[\"joke\"])\n\nprint(min(jokes, key=joke_length)[\"subject\"])                     # giraffe\nprint(min(jokes, key=lambda item: len(item[\"joke\"]))[\"subject\"])  # with a lambda - same result\n\nranking = sorted(jokes, key=lambda item: len(item[\"joke\"]))       # shortest first\nprint([item[\"subject\"] for item in ranking])\n\nranking = sorted(jokes, key=lambda item: len(item[\"joke\"]), reverse=True)   # longest first\nprint([item[\"subject\"] for item in ranking])"
      }
    },
    {
      "t": "code",
      "file": "map_reduce_offline.py",
      "code": {
        "zh": "SUBJECTS = {\"动物\": [\"企鹅\", \"蜗牛\", \"长颈鹿\"]}\nJOKES = {\n    \"企鹅\": \"企鹅为什么不怕冷？因为它一年到头都穿着燕尾服。\",\n    \"蜗牛\": \"蜗牛去面试，被问到优点，它说：我从来不着急。\",\n    \"长颈鹿\": \"长颈鹿最怕嗓子疼，一疼就是好几米。\",\n}\n\ndef generate_topics(state: OverallState):          # 原来问模型，现在查字典\n    return {\"subjects\": SUBJECTS[state[\"topic\"]]}\n\ndef generate_joke(state: JokeState):               # 结果带上子话题，合并后不会乱\n    return {\"jokes\": [{\"subject\": state[\"subject\"], \"joke\": JOKES[state[\"subject\"]]}]}\n\ndef best_joke(state: OverallState):                # 规则：最短的笑话最好\n    best = min(state[\"jokes\"], key=lambda j: len(j[\"joke\"]))\n    return {\"best_selected_joke\": best[\"joke\"]}\n\n# continue_to_jokes、OverallState、JokeState 和建图的代码与上面完全一样\n# graph.invoke({\"topic\": \"动物\"})[\"best_selected_joke\"]  →  长颈鹿最怕嗓子疼，一疼就是好几米。",
        "en": "SUBJECTS = {\"animals\": [\"penguin\", \"snail\", \"giraffe\"]}\nJOKES = {\n    \"penguin\": \"Why do penguins never feel cold? They wear a tuxedo all year.\",\n    \"snail\": \"A snail at a job interview: my best quality? I never rush.\",\n    \"giraffe\": \"Giraffes dread sore throats: the pain goes on for metres.\",\n}\n\ndef generate_topics(state: OverallState):          # used to ask the model; now a dict lookup\n    return {\"subjects\": SUBJECTS[state[\"topic\"]]}\n\ndef generate_joke(state: JokeState):               # keep the subject so merged results stay labelled\n    return {\"jokes\": [{\"subject\": state[\"subject\"], \"joke\": JOKES[state[\"subject\"]]}]}\n\ndef best_joke(state: OverallState):                # rule: the shortest joke wins\n    best = min(state[\"jokes\"], key=lambda j: len(j[\"joke\"]))\n    return {\"best_selected_joke\": best[\"joke\"]}\n\n# continue_to_jokes, OverallState, JokeState and the graph code are exactly as above\n# graph.invoke({\"topic\": \"animals\"})[\"best_selected_joke\"]  ->  Giraffes dread sore throats: ..."
      },
      "note": {
        "zh": "本地练习：`practice/l29_map_reduce_todo.py`（参考答案 `l29_map_reduce_solution.py`，不需要 API key，会打印 stream 过程和 Mermaid 图）。",
        "en": "Local exercise: `practice/l29_map_reduce_todo.py` (solution `l29_map_reduce_solution.py`; no API key; prints the stream and the Mermaid diagram)."
      }
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "节点里写的是 `config[\"configurable\"].get(\"model\", \"deepseek\")`。调用时不传任何配置，会用哪个模型？",
        "en": "The node reads `config[\"configurable\"].get(\"model\", \"deepseek\")`. With no config at call time, which model is used?"
      },
      "options": [
        {
          "zh": "报 `KeyError`，必须传配置",
          "en": "`KeyError` – a config is required"
        },
        {
          "zh": "`models[\"deepseek\"]`，也就是默认值",
          "en": "`models[\"deepseek\"]`, the default"
        },
        {
          "zh": "`models` 里的第一个模型，不管键名",
          "en": "The first model in `models`, whatever its key"
        },
        {
          "zh": "两个模型各调用一次",
          "en": "Both models, once each"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "`.get(键, 默认值)` 在键不存在时返回默认值，所以没配置时用 `\"deepseek\"`。视频里第一次调用就是这样。",
        "en": "`.get(key, default)` returns the default when the key is missing, so with no config it uses `\"deepseek\"`. That's the video's first call."
      }
    },
    {
      "q": {
        "zh": "怎样确认这次回答到底是哪个模型给的？",
        "en": "How do you confirm which model actually produced a reply?"
      },
      "options": [
        {
          "zh": "看回答的 `response_metadata[\"model_name\"]`",
          "en": "Look at the reply's `response_metadata[\"model_name\"]`"
        },
        {
          "zh": "问模型「你是谁」，看它怎么回答",
          "en": "Ask the model “who are you” and read its answer"
        },
        {
          "zh": "看 `graph.get_graph()` 画出的图",
          "en": "Look at the drawing from `graph.get_graph()`"
        },
        {
          "zh": "看状态里的 `extra_field`",
          "en": "Look at `extra_field` in the state"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "模型的自我介绍不可靠（两个 DeepSeek 模型都说自己是 DeepSeek，视频里 OpenAI 模型的回答也看不出来）。接口返回的 `model_name` 才是准的。",
        "en": "A model's self-description is unreliable (both DeepSeek models say “DeepSeek”, and the video's OpenAI reply didn't say). The `model_name` returned by the API is reliable."
      }
    },
    {
      "q": {
        "zh": "把视频的写法改成 1.x 推荐的写法，下面哪一组是对应的？",
        "en": "Converting the video's style to the recommended 1.x style, which set matches?"
      },
      "options": [
        {
          "zh": "`config: RunnableConfig` → `state: Context`；`config=` → `state=`",
          "en": "`config: RunnableConfig` → `state: Context`; `config=` → `state=`"
        },
        {
          "zh": "只要把 `configurable` 改名为 `context`，别的不变",
          "en": "Just rename `configurable` to `context`; nothing else changes"
        },
        {
          "zh": "`config: RunnableConfig` → `runtime: Runtime[Context]`；`config[\"configurable\"]` → `runtime.context`；`config={\"configurable\": ...}` → `context=...`；建图时加 `context_schema=Context`",
          "en": "`config: RunnableConfig` → `runtime: Runtime[Context]`; `config[\"configurable\"]` → `runtime.context`; `config={\"configurable\": ...}` → `context=...`; add `context_schema=Context` when building"
        },
        {
          "zh": "改用 `StateGraph(State, config_schema=Context)`",
          "en": "Switch to `StateGraph(State, config_schema=Context)`"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "context 写法有四处改动。`config_schema` 是更早的写法，1.2.12 会给弃用警告。",
        "en": "The context style changes four places. `config_schema` is an even older style, and 1.2.12 warns that it's deprecated."
      }
    },
    {
      "q": {
        "zh": "map-reduce 里，为什么 `jokes` 要写成 `Annotated[list, operator.add]`？",
        "en": "In the map-reduce, why must `jokes` be `Annotated[list, operator.add]`?"
      },
      "options": [
        {
          "zh": "因为 `Send` 只能发送列表",
          "en": "Because `Send` can only send lists"
        },
        {
          "zh": "为了让笑话按好笑程度排序",
          "en": "So the jokes are sorted by how funny they are"
        },
        {
          "zh": "不加也行，只是画图不好看",
          "en": "It's optional – only the drawing suffers"
        },
        {
          "zh": "几个 `generate_joke` 在同一步写 `jokes`，需要 reducer 把结果拼起来",
          "en": "Several `generate_joke` runs write `jokes` in the same step; a reducer joins the results"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "和 28 节的分支一样：同一步多个写入需要 reducer。只有一个子话题时不会暴露问题，两个以上就报 `InvalidUpdateError`。",
        "en": "Just like lesson 28's branches: several writes in one step need a reducer. One subject hides the problem; two or more raise `InvalidUpdateError`."
      }
    },
    {
      "q": {
        "zh": "用 `deepseek-flash` 跑视频的 map-reduce，`with_structured_output` 报了 400 错误。怎么办？",
        "en": "Running the video's map-reduce on `deepseek-flash`, `with_structured_output` fails with a 400 error. What do you do?"
      },
      "options": [
        {
          "zh": "把模型换成 `deepseek-chat`",
          "en": "Switch the model to `deepseek-chat`"
        },
        {
          "zh": "创建模型时关掉思考模式：`extra_body={\"thinking\": {\"type\": \"disabled\"}}`",
          "en": "Turn thinking off when creating the model: `extra_body={\"thinking\": {\"type\": \"disabled\"}}`"
        },
        {
          "zh": "去掉 `JokeState`",
          "en": "Remove `JokeState`"
        },
        {
          "zh": "把 `Send` 换成普通的边",
          "en": "Replace `Send` with plain edges"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "思考模式不允许「强制调用工具」，而 `with_structured_output` 默认就靠它。`deepseek-chat` 已经不能用了，有效的模型名只有 `deepseek-flash` 和 `deepseek-v4-pro`。",
        "en": "Thinking mode refuses forced tool calls, which `with_structured_output` relies on by default. `deepseek-chat` no longer exists; the valid names are `deepseek-flash` and `deepseek-v4-pro`."
      }
    },
    {
      "q": {
        "zh": "`min(jokes, key=lambda j: len(j[\"joke\"]))` 返回什么？（`jokes` 是一组 `{\"subject\": ..., \"joke\": ...}` 字典）",
        "en": "What does `min(jokes, key=lambda j: len(j[\"joke\"]))` return? (`jokes` is a list of `{\"subject\": ..., \"joke\": ...}` dicts)"
      },
      "options": [
        {
          "zh": "最短的那个笑话的长度（一个数字）",
          "en": "The length of the shortest joke (a number)"
        },
        {
          "zh": "按长度排好序的新列表",
          "en": "A new list sorted by length"
        },
        {
          "zh": "`joke` 文字最短的那一个字典",
          "en": "The dict whose `joke` text is shortest"
        },
        {
          "zh": "第一个字典",
          "en": "The first dict"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "`key` 只决定「按什么比较」，`min` 返回的仍然是原列表里的那一项（整个字典）。要排序用 `sorted`。",
        "en": "`key` only decides what to compare by; `min` still returns the item itself (the whole dict). Use `sorted` to sort."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "运行时配置（视频的写法）",
        "en": "Runtime configuration (the video's style)"
      },
      "code": {
        "zh": "from langchain_core.runnables import [[RunnableConfig]]\n\ndef _call_model(state: AgentState, config: RunnableConfig):\n    model_name = config[\"[[configurable]]\"].[[get]](\"model\", \"deepseek\")\n    model = models[model_name]\n    response = model.[[invoke]](state[\"messages\"])\n    return {\"messages\": [response]}\n\ngraph.invoke(question, config={\"configurable\": {\"[[model]]\": \"pro\"}})",
        "en": "from langchain_core.runnables import [[RunnableConfig]]\n\ndef _call_model(state: AgentState, config: RunnableConfig):\n    model_name = config[\"[[configurable]]\"].[[get]](\"model\", \"deepseek\")\n    model = models[model_name]\n    response = model.[[invoke]](state[\"messages\"])\n    return {\"messages\": [response]}\n\ngraph.invoke(question, config={\"configurable\": {\"[[model]]\": \"pro\"}})"
      },
      "explain": {
        "zh": "节点的第二个参数 `config` 由 LangGraph 传入；自己的设置在 `config[\"configurable\"]` 里，用 `.get` 给默认值；调用时放在 `invoke` 的第二个参数里。",
        "en": "LangGraph passes the node's second parameter, `config`; your settings sit in `config[\"configurable\"]`, read with `.get` and a default; at call time they go in `invoke`'s second argument."
      }
    },
    {
      "title": {
        "zh": "用 Send 做 map-reduce",
        "en": "Map-reduce with Send"
      },
      "code": {
        "zh": "from langgraph.types import [[Send]]\n\ndef continue_to_jokes(state: OverallState):\n    return [Send(\"[[generate_joke]]\", {\"subject\": s}) [[for]] s in state[\"[[subjects]]\"]]\n\ndef best_joke(state: OverallState):\n    best = min(state[\"jokes\"], key=[[lambda]] j: len(j[\"joke\"]))\n    return {\"best_selected_joke\": best[\"joke\"]}\n\nbuilder.[[add_conditional_edges]](\"generate_topics\", [[continue_to_jokes]], [\"generate_joke\"])\nbuilder.add_edge(\"generate_joke\", \"[[best_joke]]\")",
        "en": "from langgraph.types import [[Send]]\n\ndef continue_to_jokes(state: OverallState):\n    return [Send(\"[[generate_joke]]\", {\"subject\": s}) [[for]] s in state[\"[[subjects]]\"]]\n\ndef best_joke(state: OverallState):\n    best = min(state[\"jokes\"], key=[[lambda]] j: len(j[\"joke\"]))\n    return {\"best_selected_joke\": best[\"joke\"]}\n\nbuilder.[[add_conditional_edges]](\"generate_topics\", [[continue_to_jokes]], [\"generate_joke\"])\nbuilder.add_edge(\"generate_joke\", \"[[best_joke]]\")"
      },
      "explain": {
        "zh": "路由函数为每个子话题返回一个 `Send`，挂在条件边上；所有笑话生成完后，普通边把流程带到 reduce 节点。",
        "en": "The routing function returns one `Send` per subject and sits on a conditional edge; once every joke is written, a plain edge leads to the reduce node."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：离线版笑话 map-reduce",
        "en": "Write it: the offline joke map-reduce"
      },
      "task": {
        "zh": "不调用模型，写出和视频结构相同的 map-reduce 图：\n1. 从 `langgraph.types` 导入 `Send`\n2. `OverallState`：`topic: str`、`subjects: list`、`jokes`（`Annotated[list, operator.add]`）、`best_selected_joke: str`；`JokeState`：`subject: str`\n3. `generate_topics`：从 `SUBJECTS` 取出子话题\n4. `continue_to_jokes`：每个子话题返回一个 `Send(\"generate_joke\", {\"subject\": s})`\n5. `generate_joke`：返回 `{\"jokes\": [{\"subject\": ..., \"joke\": ...}]}`\n6. `best_joke`：用 `min(..., key=lambda ...)` 选出笑话最短的那一项\n7. 建图（条件边的第三个参数写 `[\"generate_joke\"]`），用 `{\"topic\": \"动物\"}` 运行，打印 `best_selected_joke`\n\n本地运行（`.venv`）应该打印长颈鹿那个笑话。",
        "en": "Without calling a model, write a map-reduce graph shaped like the video's:\n1. import `Send` from `langgraph.types`\n2. `OverallState`: `topic: str`, `subjects: list`, `jokes` (`Annotated[list, operator.add]`), `best_selected_joke: str`; `JokeState`: `subject: str`\n3. `generate_topics`: take the subjects from `SUBJECTS`\n4. `continue_to_jokes`: one `Send(\"generate_joke\", {\"subject\": s})` per subject\n5. `generate_joke`: return `{\"jokes\": [{\"subject\": ..., \"joke\": ...}]}`\n6. `best_joke`: pick the item with the shortest joke using `min(..., key=lambda ...)`\n7. build the graph (third argument of the conditional edge: `[\"generate_joke\"]`), run it with `{\"topic\": \"animals\"}` and print `best_selected_joke`\n\nLocally (`.venv`) it should print the giraffe joke."
      },
      "starter": {
        "zh": "import operator\nfrom typing import Annotated\nfrom typing_extensions import TypedDict\nfrom langgraph.graph import StateGraph, START, END\n\nSUBJECTS = {\"动物\": [\"企鹅\", \"蜗牛\", \"长颈鹿\"]}\nJOKES = {\n    \"企鹅\": \"企鹅为什么不怕冷？因为它一年到头都穿着燕尾服。\",\n    \"蜗牛\": \"蜗牛去面试，被问到优点，它说：我从来不着急。\",\n    \"长颈鹿\": \"长颈鹿最怕嗓子疼，一疼就是好几米。\",\n}\n\n# 1. 导入 Send；定义 OverallState（jokes 要能合并）和 JokeState\n\n\n# 2. generate_topics、continue_to_jokes、generate_joke、best_joke\n\n\n# 3. 建图并运行\n",
        "en": "import operator\nfrom typing import Annotated\nfrom typing_extensions import TypedDict\nfrom langgraph.graph import StateGraph, START, END\n\nSUBJECTS = {\"animals\": [\"penguin\", \"snail\", \"giraffe\"]}\nJOKES = {\n    \"penguin\": \"Why do penguins never feel cold? They wear a tuxedo all year.\",\n    \"snail\": \"A snail at a job interview: my best quality? I never rush.\",\n    \"giraffe\": \"Giraffes dread sore throats: the pain goes on for metres.\",\n}\n\n# 1. import Send; define OverallState (jokes must merge) and JokeState\n\n\n# 2. generate_topics, continue_to_jokes, generate_joke, best_joke\n\n\n# 3. build the graph and run it\n"
      },
      "solution": {
        "zh": "import operator\nfrom typing import Annotated\nfrom typing_extensions import TypedDict\nfrom langgraph.graph import StateGraph, START, END\n\nSUBJECTS = {\"动物\": [\"企鹅\", \"蜗牛\", \"长颈鹿\"]}\nJOKES = {\n    \"企鹅\": \"企鹅为什么不怕冷？因为它一年到头都穿着燕尾服。\",\n    \"蜗牛\": \"蜗牛去面试，被问到优点，它说：我从来不着急。\",\n    \"长颈鹿\": \"长颈鹿最怕嗓子疼，一疼就是好几米。\",\n}\n\n# 1. 导入 Send；定义 OverallState（jokes 要能合并）和 JokeState\nfrom langgraph.types import Send\n\nclass OverallState(TypedDict):\n    topic: str\n    subjects: list\n    jokes: Annotated[list, operator.add]\n    best_selected_joke: str\n\nclass JokeState(TypedDict):\n    subject: str\n\n# 2. generate_topics、continue_to_jokes、generate_joke、best_joke\ndef generate_topics(state: OverallState):\n    return {\"subjects\": SUBJECTS[state[\"topic\"]]}\n\ndef continue_to_jokes(state: OverallState):\n    return [Send(\"generate_joke\", {\"subject\": s}) for s in state[\"subjects\"]]\n\ndef generate_joke(state: JokeState):\n    return {\"jokes\": [{\"subject\": state[\"subject\"], \"joke\": JOKES[state[\"subject\"]]}]}\n\ndef best_joke(state: OverallState):\n    best = min(state[\"jokes\"], key=lambda j: len(j[\"joke\"]))\n    return {\"best_selected_joke\": best[\"joke\"]}\n\n# 3. 建图并运行\nbuilder = StateGraph(OverallState)\nbuilder.add_node(\"generate_topics\", generate_topics)\nbuilder.add_node(\"generate_joke\", generate_joke)\nbuilder.add_node(\"best_joke\", best_joke)\nbuilder.add_edge(START, \"generate_topics\")\nbuilder.add_conditional_edges(\"generate_topics\", continue_to_jokes, [\"generate_joke\"])\nbuilder.add_edge(\"generate_joke\", \"best_joke\")\nbuilder.add_edge(\"best_joke\", END)\ngraph = builder.compile()\n\nresult = graph.invoke({\"topic\": \"动物\"})\nprint(result[\"best_selected_joke\"])",
        "en": "import operator\nfrom typing import Annotated\nfrom typing_extensions import TypedDict\nfrom langgraph.graph import StateGraph, START, END\n\nSUBJECTS = {\"animals\": [\"penguin\", \"snail\", \"giraffe\"]}\nJOKES = {\n    \"penguin\": \"Why do penguins never feel cold? They wear a tuxedo all year.\",\n    \"snail\": \"A snail at a job interview: my best quality? I never rush.\",\n    \"giraffe\": \"Giraffes dread sore throats: the pain goes on for metres.\",\n}\n\n# 1. import Send; define OverallState (jokes must merge) and JokeState\nfrom langgraph.types import Send\n\nclass OverallState(TypedDict):\n    topic: str\n    subjects: list\n    jokes: Annotated[list, operator.add]\n    best_selected_joke: str\n\nclass JokeState(TypedDict):\n    subject: str\n\n# 2. generate_topics, continue_to_jokes, generate_joke, best_joke\ndef generate_topics(state: OverallState):\n    return {\"subjects\": SUBJECTS[state[\"topic\"]]}\n\ndef continue_to_jokes(state: OverallState):\n    return [Send(\"generate_joke\", {\"subject\": s}) for s in state[\"subjects\"]]\n\ndef generate_joke(state: JokeState):\n    return {\"jokes\": [{\"subject\": state[\"subject\"], \"joke\": JOKES[state[\"subject\"]]}]}\n\ndef best_joke(state: OverallState):\n    best = min(state[\"jokes\"], key=lambda j: len(j[\"joke\"]))\n    return {\"best_selected_joke\": best[\"joke\"]}\n\n# 3. build the graph and run it\nbuilder = StateGraph(OverallState)\nbuilder.add_node(\"generate_topics\", generate_topics)\nbuilder.add_node(\"generate_joke\", generate_joke)\nbuilder.add_node(\"best_joke\", best_joke)\nbuilder.add_edge(START, \"generate_topics\")\nbuilder.add_conditional_edges(\"generate_topics\", continue_to_jokes, [\"generate_joke\"])\nbuilder.add_edge(\"generate_joke\", \"best_joke\")\nbuilder.add_edge(\"best_joke\", END)\ngraph = builder.compile()\n\nresult = graph.invoke({\"topic\": \"animals\"})\nprint(result[\"best_selected_joke\"])"
      },
      "checks": [
        {
          "zh": "从 `langgraph.types` 导入 `Send`",
          "en": "Imports `Send` from `langgraph.types`",
          "re": "from\\s+langgraph\\.types\\s+import\\s+.*\\bSend\\b"
        },
        {
          "zh": "`jokes` 写成 `Annotated[list, operator.add]`",
          "en": "`jokes` is `Annotated[list, operator.add]`",
          "re": "jokes\\s*:\\s*Annotated\\[\\s*list\\s*,\\s*operator\\.add\\s*\\]"
        },
        {
          "zh": "定义了单个任务的状态 `JokeState`",
          "en": "Defines the per-task `JokeState`",
          "re": "class\\s+JokeState\\s*\\(\\s*TypedDict\\s*\\)"
        },
        {
          "zh": "每个子话题返回一个 `Send(\"generate_joke\", {...})`",
          "en": "One `Send(\"generate_joke\", {...})` per subject",
          "re": "Send\\(\\s*[\"']generate_joke[\"']\\s*,\\s*\\{[^}]*\\}\\s*\\)\\s*for\\s+\\w+\\s+in\\s+state\\[[\"']subjects[\"']\\]"
        },
        {
          "zh": "`generate_joke` 返回列表形式的 `jokes`",
          "en": "`generate_joke` returns `jokes` as a list",
          "re": "return\\s*\\{\\s*[\"']jokes[\"']\\s*:\\s*\\["
        },
        {
          "zh": "用 `min(..., key=lambda ...)` 选最短的笑话",
          "en": "Picks the shortest with `min(..., key=lambda ...)`",
          "re": "min\\([^)]*key\\s*=\\s*lambda"
        },
        {
          "zh": "条件边写了第三个参数 `[\"generate_joke\"]`",
          "en": "The conditional edge has the third argument `[\"generate_joke\"]`",
          "re": "add_conditional_edges\\(\\s*[\"']generate_topics[\"']\\s*,\\s*continue_to_jokes\\s*,\\s*\\[\\s*[\"']generate_joke[\"']\\s*\\]\\s*\\)"
        },
        {
          "zh": "`generate_joke → best_joke` 普通边",
          "en": "Plain edge `generate_joke → best_joke`",
          "re": "add_edge\\(\\s*[\"']generate_joke[\"']\\s*,\\s*[\"']best_joke[\"']\\s*\\)"
        }
      ]
    },
    {
      "title": {
        "zh": "手写：用运行时配置切换问候语",
        "en": "Write it: switch the greeting with a runtime config"
      },
      "task": {
        "zh": "不调用模型，练习视频的配置写法：\n1. 节点 `greet(state, config: RunnableConfig)`：用 `config[\"configurable\"].get(\"lang\", \"zh\")` 读出语言，返回 `{\"greeting\": GREETINGS[语言] + \"，\" + state[\"name\"]}`\n2. 建图 `START → greet → END`\n3. 先不传配置运行，再用 `config={\"configurable\": {\"lang\": \"en\"}}` 运行，分别打印 `greeting`\n\n本地运行（`.venv`）应该先打印「你好，Tommy」，再打印「Hello，Tommy」。",
        "en": "Practise the video's config style without a model:\n1. node `greet(state, config: RunnableConfig)`: read the language with `config[\"configurable\"].get(\"lang\", \"zh\")` and return `{\"greeting\": GREETINGS[lang] + \", \" + state[\"name\"]}`\n2. build `START → greet → END`\n3. run once without a config, then with `config={\"configurable\": {\"lang\": \"en\"}}`, printing `greeting` each time\n\nLocally (`.venv`) it should print “你好, Tommy” first, then “Hello, Tommy”."
      },
      "starter": {
        "zh": "from typing_extensions import TypedDict\nfrom langchain_core.runnables import RunnableConfig\nfrom langgraph.graph import StateGraph, START, END\n\nGREETINGS = {\"zh\": \"你好\", \"en\": \"Hello\", \"ja\": \"こんにちは\"}\n\nclass State(TypedDict):\n    name: str\n    greeting: str\n\n# 1. 节点 greet：从运行时配置读 \"lang\"（默认 \"zh\"），返回 {\"greeting\": 问候语 + \"，\" + 名字}\n\n\n# 2. 建图：START → greet → END\n\n\n# 3. 不传配置运行一次，再用运行时配置把 lang 换成 \"en\" 运行一次，分别打印 greeting\n",
        "en": "from typing_extensions import TypedDict\nfrom langchain_core.runnables import RunnableConfig\nfrom langgraph.graph import StateGraph, START, END\n\nGREETINGS = {\"zh\": \"你好\", \"en\": \"Hello\", \"ja\": \"こんにちは\"}\n\nclass State(TypedDict):\n    name: str\n    greeting: str\n\n# 1. node greet: read \"lang\" from the run config (default \"zh\"); update greeting to the greeting word + \", \" + name\n\n\n# 2. build: START → greet → END\n\n\n# 3. run once without config, then once with a run config that sets lang to \"en\"; print greeting each time\n"
      },
      "solution": {
        "zh": "from typing_extensions import TypedDict\nfrom langchain_core.runnables import RunnableConfig\nfrom langgraph.graph import StateGraph, START, END\n\nGREETINGS = {\"zh\": \"你好\", \"en\": \"Hello\", \"ja\": \"こんにちは\"}\n\nclass State(TypedDict):\n    name: str\n    greeting: str\n\n# 1. 节点 greet：从运行时配置读 \"lang\"（默认 \"zh\"），返回 {\"greeting\": 问候语 + \"，\" + 名字}\ndef greet(state: State, config: RunnableConfig):\n    lang = config[\"configurable\"].get(\"lang\", \"zh\")\n    return {\"greeting\": GREETINGS[lang] + \"，\" + state[\"name\"]}\n\n# 2. 建图：START → greet → END\nbuilder = StateGraph(State)\nbuilder.add_node(\"greet\", greet)\nbuilder.add_edge(START, \"greet\")\nbuilder.add_edge(\"greet\", END)\ngraph = builder.compile()\n\n# 3. 不传配置运行一次，再用运行时配置把 lang 换成 \"en\" 运行一次，分别打印 greeting\nprint(graph.invoke({\"name\": \"Tommy\"})[\"greeting\"])\nprint(graph.invoke({\"name\": \"Tommy\"}, config={\"configurable\": {\"lang\": \"en\"}})[\"greeting\"])",
        "en": "from typing_extensions import TypedDict\nfrom langchain_core.runnables import RunnableConfig\nfrom langgraph.graph import StateGraph, START, END\n\nGREETINGS = {\"zh\": \"你好\", \"en\": \"Hello\", \"ja\": \"こんにちは\"}\n\nclass State(TypedDict):\n    name: str\n    greeting: str\n\n# 1. node greet: read \"lang\" from the run config (default \"zh\"); update greeting to the greeting word + \", \" + name\ndef greet(state: State, config: RunnableConfig):\n    lang = config[\"configurable\"].get(\"lang\", \"zh\")\n    return {\"greeting\": GREETINGS[lang] + \", \" + state[\"name\"]}\n\n# 2. build: START → greet → END\nbuilder = StateGraph(State)\nbuilder.add_node(\"greet\", greet)\nbuilder.add_edge(START, \"greet\")\nbuilder.add_edge(\"greet\", END)\ngraph = builder.compile()\n\n# 3. run once without config, then once with a run config that sets lang to \"en\"; print greeting each time\nprint(graph.invoke({\"name\": \"Tommy\"})[\"greeting\"])\nprint(graph.invoke({\"name\": \"Tommy\"}, config={\"configurable\": {\"lang\": \"en\"}})[\"greeting\"])"
      },
      "checks": [
        {
          "zh": "节点多一个参数 `config: RunnableConfig`",
          "en": "The node takes `config: RunnableConfig`",
          "re": "def\\s+greet\\s*\\(\\s*state[^,]*,\\s*config\\s*:\\s*RunnableConfig\\s*\\)"
        },
        {
          "zh": "用 `config[\"configurable\"].get(\"lang\", ...)` 读设置",
          "en": "Reads `config[\"configurable\"].get(\"lang\", ...)`",
          "re": "config\\[[\"']configurable[\"']\\]\\.get\\(\\s*[\"']lang[\"']"
        },
        {
          "zh": "返回 `greeting`",
          "en": "Returns `greeting`",
          "re": "return\\s*\\{\\s*[\"']greeting[\"']\\s*:"
        },
        {
          "zh": "调用时传入 `{\"configurable\": {\"lang\": ...}}`",
          "en": "Passes `{\"configurable\": {\"lang\": ...}}` when calling",
          "re": "\\.invoke\\([^)]*[\"']configurable[\"']\\s*:\\s*\\{\\s*[\"']lang[\"']"
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "把配置塞进 `invoke` 的第一个参数（状态）：`model` 不是状态字段，会被悄悄丢掉。配置放第二个参数 `config={\"configurable\": {...}}`，或用 1.x 的 `context=`。",
      "en": "Putting the setting in `invoke`'s first argument (the state): `model` isn't a state field and is silently dropped. Use the second argument `config={\"configurable\": {...}}`, or 1.x's `context=`."
    },
    {
      "zh": "照着旧教程写 `StateGraph(State, config_schema=...)`：1.2.12 给出弃用警告。用 `context_schema` + `Runtime`，或者像视频一样直接读 `config[\"configurable\"]`。",
      "en": "Following old tutorials with `StateGraph(State, config_schema=...)`: 1.2.12 warns it's deprecated. Use `context_schema` + `Runtime`, or read `config[\"configurable\"]` directly as the video does."
    },
    {
      "zh": "用 context 写法却忘了传 `context=`：`runtime.context` 是 `None`，直接取下标报 `TypeError`。用 `runtime.context or {}` 兜底。",
      "en": "Using the context style but forgetting `context=`: `runtime.context` is `None` and indexing it raises `TypeError`. Guard with `runtime.context or {}`."
    },
    {
      "zh": "靠模型的自我介绍判断用了哪个模型：不可靠。看 `response_metadata[\"model_name\"]`。",
      "en": "Judging the model by its self-introduction: unreliable. Check `response_metadata[\"model_name\"]`."
    },
    {
      "zh": "`deepseek-flash` 默认思考模式下用 `with_structured_output`：报 400。创建模型时加 `extra_body={\"thinking\": {\"type\": \"disabled\"}}`。",
      "en": "`with_structured_output` on `deepseek-flash` in its default thinking mode: a 400 error. Add `extra_body={\"thinking\": {\"type\": \"disabled\"}}` when creating the model."
    },
    {
      "zh": "map 的结果字段忘了 reducer：只测 1 项时正常，2 项以上报 `InvalidUpdateError`。",
      "en": "No reducer on the map results: fine with 1 item, `InvalidUpdateError` with 2 or more."
    },
    {
      "zh": "被 `Send` 启动的节点去读 `Send` 里没给的字段：`KeyError`。需要的数据都放进 `Send`。",
      "en": "A `Send`-started node reading a field not in its `Send` data: `KeyError`. Put everything it needs into the `Send`."
    },
    {
      "zh": "`key=len(j[\"joke\"])` 传了一个值而不是函数：要写 `key=lambda j: len(j[\"joke\"])`。",
      "en": "`key=len(j[\"joke\"])` passes a value, not a function: write `key=lambda j: len(j[\"joke\"])`."
    },
    {
      "zh": "结构化输出的字段不写说明：模型可能理解偏，比如 `Subjects` 只返回主题本身 `['动物']`，map 就只跑一次。用 `Field(description=...)` 说清楚要什么。",
      "en": "Leaving structured-output fields without a description: the model may misread them, e.g. `Subjects` returns just the topic `['animals']` and the map runs only once. Say what you want with `Field(description=...)`."
    }
  ],
  "recap": [
    {
      "zh": "运行时配置：提前准备好可选项（比如模型字典），节点通过第二个参数 `config: RunnableConfig` 读 `config[\"configurable\"]`。",
      "en": "Runtime configuration: prepare the options in advance (e.g. a dict of models); the node reads `config[\"configurable\"]` through its second parameter `config: RunnableConfig`."
    },
    {
      "zh": "调用时 `graph.invoke(输入, config={\"configurable\": {\"model\": \"pro\"}})` 就能切换，图不用改；用 `response_metadata[\"model_name\"]` 确认。",
      "en": "`graph.invoke(input, config={\"configurable\": {\"model\": \"pro\"}})` switches without touching the graph; confirm with `response_metadata[\"model_name\"]`."
    },
    {
      "zh": "1.x 推荐写法：`context_schema=Context` + 节点参数 `runtime: Runtime[Context]` + `invoke(..., context={...})`；`config` 留给 `recursion_limit`、`thread_id`。",
      "en": "The 1.x style: `context_schema=Context` + a `runtime: Runtime[Context]` parameter + `invoke(..., context={...})`; `config` stays for `recursion_limit` and `thread_id`."
    },
    {
      "zh": "map-reduce：路由函数返回 `[Send(\"节点\", 数据) for ...]`，节点按数量并行运行；结果字段用 reducer 合并，再由普通边接到 reduce 节点。",
      "en": "Map-reduce: a routing function returns `[Send(\"node\", data) for ...]`, the node runs once per item in parallel, a reducer merges the results, and a plain edge leads to the reduce node."
    },
    {
      "zh": "被 `Send` 启动的节点只看到 `Send` 给的数据，所以常给它单独定义一个小状态（如 `JokeState`）。",
      "en": "A `Send`-started node sees only its `Send` data, so it usually gets its own small state (like `JokeState`)."
    },
    {
      "zh": "DeepSeek 用 `with_structured_output` 要关掉思考模式；`lambda 参数: 表达式` 是一行小函数，常用作 `min` / `sorted` 的 `key`。",
      "en": "DeepSeek needs thinking off for `with_structured_output`; `lambda params: expression` is a one-line function, often the `key` for `min` / `sorted`."
    }
  ],
  "files": [
    {
      "path": "practice/l29_runtime_config.py",
      "zh": "示例（视频写法）：模型字典 + `config[\"configurable\"]`，调用时在 `deepseek-flash` 和 `deepseek-v4-pro` 之间切换并打印 `model_name`（运行一次 = 2 次 API 调用）。",
      "en": "Demo (the video's style): a dict of models + `config[\"configurable\"]`, switching between `deepseek-flash` and `deepseek-v4-pro` per call and printing `model_name` (one run = 2 API calls)."
    },
    {
      "path": "practice/l29_runtime_context.py",
      "zh": "示例（1.x 写法）：同样的切换，改用 `context_schema` + `Runtime` + `context=`（运行一次 = 2 次 API 调用）。",
      "en": "Demo (the 1.x style): the same switch with `context_schema` + `Runtime` + `context=` (one run = 2 API calls)."
    },
    {
      "path": "practice/l29_map_reduce_llm.py",
      "zh": "示例（视频的例子）：主题 → 子话题 → 并行写笑话 → 选出最好的，用 `stream` 打印过程（运行一次最多 5 次 API 调用）。",
      "en": "Demo (the video's example): topic → subjects → jokes in parallel → pick the best, printed with `stream` (at most 5 API calls per run)."
    },
    {
      "path": "practice/l29_map_reduce_todo.py",
      "zh": "练习：补全 reducer、`Send` 列表、条件边和 `lambda`，完成离线版笑话 map-reduce（有 TODO 提示，不需要 API key）。",
      "en": "Exercise: complete the reducer, the `Send` list, the conditional edge and the `lambda` for the offline joke map-reduce (with TODO hints, no API key)."
    },
    {
      "path": "practice/l29_map_reduce_solution.py",
      "zh": "参考答案：离线版笑话 map-reduce，打印 stream 过程、排名和 Mermaid 图。",
      "en": "Solution: the offline joke map-reduce, printing the stream, the ranking and the Mermaid diagram."
    }
  ]
});
