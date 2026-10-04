COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l19",
  "priority": "important",
  "handwrite": true,
  "studyMinutes": 35,
  "source": "subtitle",
  "summary": {
    "zh": "这一集 8 分钟，讲 AgentScope 2.0 的两件事。**上下文管理**：对话快把上下文窗口占满时，框架用模型把旧内容压缩成摘要，最近的一部分原样保留；被压缩掉的原文有工作空间就存进去，没有就丢掉。用 `ContextConfig` 设置触发比例、保留比例和工具结果上限。**状态持久化**：把 `agent.state`（`AgentState`）存成 JSON 文件，下次启动再读回来，Agent 就还记得聊过什么——视频用一个「暗号」做了测试。",
    "en": "This 8-minute episode covers two AgentScope 2.0 topics. **Context management**: when a conversation nearly fills the context window, the framework has the model compress older content into a summary and keeps the latest part verbatim; the compressed originals are saved to the workspace if there is one, and lost otherwise. `ContextConfig` sets the trigger ratio, the reserve ratio and the tool-result limit. **State persistence**: save `agent.state` (an `AgentState`) to a JSON file and load it on the next start, so the agent still remembers the conversation – the video tests this with a “secret code”."
  },
  "goals": [
    {
      "zh": "说清楚上下文为什么要管理：窗口有限，超过阈值就压缩成摘要，最近的内容原样保留",
      "en": "Explain why the context needs managing: the window is limited, so above a threshold older content becomes a summary and recent content stays verbatim"
    },
    {
      "zh": "知道被压缩掉的内容去哪：有工作空间（`offloader`）就存进文件，没有就永久丢失",
      "en": "Know where compressed content goes: into files if there is a workspace (`offloader`), otherwise it is lost for good"
    },
    {
      "zh": "用 `ContextConfig(trigger_ratio, reserve_ratio, tool_result_limit)` 配置 Agent，会用 `compress_context()` 手动压缩",
      "en": "Configure an agent with `ContextConfig(trigger_ratio, reserve_ratio, tool_result_limit)` and compress by hand with `compress_context()`"
    },
    {
      "zh": "手写存档 / 读档：`model_dump(mode=\"json\")` + `json.dump`，`json.load` + `AgentState.model_validate`，启动时文件存在才读档",
      "en": "Hand-write save / load: `model_dump(mode=\"json\")` + `json.dump`, `json.load` + `AgentState.model_validate`, loading at start-up only if the file exists"
    }
  ],
  "blocks": [
    {
      "t": "h",
      "zh": "一、上下文窗口有限：压缩与卸载",
      "en": "1. A limited context window: compression and offloading"
    },
    {
      "t": "p",
      "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=0) 大模型一次能读的内容有上限，这就是上下文窗口。对话越聊越长，迟早装不下。AgentScope 每次调用模型之前，会把要发出去的内容分成几块：系统提示词、**摘要**（`state.summary`，以前压缩出来的）、**最近的对话**（`state.context`），并估算一共有多少 token。\n\n[▶ 00:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=31) 一旦超过阈值（窗口大小 × 触发比例），框架就调用模型，把较早的对话精简成一份摘要；最近的一部分对话（按保留比例算）原样留着。那被压缩掉的原文去哪了？\n- **分配了工作空间**（18 节的 `offloader=workspace`）：原文存进工作空间的文件 `sessions/<session_id>/context.jsonl`，以后需要还能回头查；\n- **没有工作空间**：直接删除，永远找不回来。\n\n类似的办法也用在单个太长的工具结果上：上下文里只留开头，超过上限的部分被截掉；有工作空间时，被截掉的那部分存成 `sessions/<session_id>/tool_result-<编号>.txt`，并在结果末尾提醒模型文件在哪（按 2.0.9 源码和离线实测）。",
      "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=0) A model can only read so much at once – that is its context window. A conversation that keeps growing will eventually not fit. Before every model call AgentScope looks at what it is about to send in parts: the system prompt, the **summary** (`state.summary`, produced by earlier compressions) and the **recent conversation** (`state.context`), and estimates how many tokens that is.\n\n[▶ 00:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=31) Once it passes the threshold (window size × trigger ratio), the framework asks the model to condense the older conversation into a summary, while the most recent part (set by the reserve ratio) stays word for word. And the compressed originals?\n- **With a workspace** (`offloader=workspace` from lesson 18): they are saved to the workspace file `sessions/<session_id>/context.jsonl`, so you can look them up later;\n- **Without a workspace**: they are deleted and gone for good.\n\nA similar idea applies to a single oversized tool result: only the beginning stays in the context and whatever exceeds the limit is cut; with a workspace, the cut-off part is saved as `sessions/<session_id>/tool_result-<id>.txt`, and a note at the end of the result tells the model where it is (from the 2.0.9 source, tested offline)."
    },
    {
      "t": "video",
      "zh": "这一集 8 分钟，分两半：\n- [▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=0) 上下文窗口和压缩机制；[▶ 01:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=62) 代码：`ContextConfig` 和手动压缩\n- [▶ 03:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=186) 为什么要保存状态；[▶ 03:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=217) 代码：用 `AgentState` 和 `json` 存档、读档\n- [▶ 05:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=311) 完整程序；[▶ 06:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=374) 演示：约定暗号，重启后再问\n\n开头讲上下文结构的那段画面，自动字幕只留下零星几句，上面「分几块」的说法是按 AgentScope 2.0.9 的源码补全的。字幕没有点名模型（前几集用的是阿里云百炼的千问），这里用 DeepSeek。",
      "en": "This 8-minute episode has two halves:\n- [▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=0) the context window and how compression works; [▶ 01:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=62) code: `ContextConfig` and manual compression\n- [▶ 03:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=186) why save the state; [▶ 03:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=217) code: saving and loading with `AgentState` and `json`\n- [▶ 05:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=311) the full program; [▶ 06:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=374) demo: agree on a secret code, restart, ask again\n\nOnly fragments of the opening part about the context's structure made it into the auto-subtitles; the “parts” described above are filled in from the AgentScope 2.0.9 source. The subtitles don't name the model (the previous episodes used Alibaba Bailian's Qwen); this lesson uses DeepSeek."
    },
    {
      "t": "code",
      "file": {
        "zh": "token_estimate.py（补充：模拟「什么时候压缩」）",
        "en": "token_estimate.py (extra: simulating “when to compress”)"
      },
      "code": {
        "zh": "def estimate_tokens(texts):\n    \"\"\"和 AgentScope 默认的估算方法一样：UTF-8 字节数 ÷ 4\"\"\"\n    total_bytes = sum(len(t.encode(\"utf-8\")) for t in texts)\n    return int(total_bytes / 4 + 0.5)\n\nprint(len(\"hi\".encode(\"utf-8\")), len(\"你好\".encode(\"utf-8\")))   # 2 6：一个汉字占 3 个字节\n\ncontext_size = 2000            # 模型一次能读多少 token（演示用的小数字）\ntrigger_ratio = 0.8            # 超过 80% 就压缩\nthreshold = context_size * trigger_ratio\n\ncontext = [\"我叫小明，正在排查线上故障。\", \"好的，请把日志发给我。\"]\nfor turn in range(1, 6):\n    context.append(f\"这是第 {turn} 段很长的日志……\" * 40)\n    tokens = estimate_tokens(context)\n    action = \"需要压缩\" if tokens >= threshold else \"不用压缩\"\n    print(f\"第 {turn} 轮：约 {tokens} token / 阈值 {threshold:.0f} → {action}\")",
        "en": "def estimate_tokens(texts):\n    \"\"\"Same as AgentScope's default estimate: UTF-8 bytes / 4\"\"\"\n    total_bytes = sum(len(t.encode(\"utf-8\")) for t in texts)\n    return int(total_bytes / 4 + 0.5)\n\nprint(len(\"hi\".encode(\"utf-8\")), len(\"你好\".encode(\"utf-8\")))   # 2 6: one Chinese character is 3 bytes\n\ncontext_size = 2000            # how many tokens the model can read (a small demo number)\ntrigger_ratio = 0.8            # compress above 80%\nthreshold = context_size * trigger_ratio\n\ncontext = [\"My name is Ming and I'm chasing a production bug.\", \"OK, send me the logs.\"]\nfor turn in range(1, 6):\n    context.append(f\"This is long log chunk number {turn}... \" * 40)\n    tokens = estimate_tokens(context)\n    action = \"compress\" if tokens >= threshold else \"no need\"\n    print(f\"turn {turn}: ~{tokens} tokens / threshold {threshold:.0f} -> {action}\")"
      },
      "note": {
        "zh": "`t.encode(\"utf-8\")` 把文字变成 UTF-8 字节，`len(...)` 就是字节数。`sum(len(...) for t in texts)` 和 06 节的列表推导式写法一样，只是没有方括号：把每段文字的字节数加起来。`f\"……{turn}……\" * 40`：先用 f-string 把轮数填进去（04 节），再用 `* 40` 把字符串重复 40 次，造出一段长文本。",
        "en": "`t.encode(\"utf-8\")` turns text into UTF-8 bytes, so `len(...)` is the byte count. `sum(len(...) for t in texts)` reads like a list comprehension from lesson 06 without the square brackets: it adds up the byte counts of all the texts. `f\"……{turn}……\" * 40`: the f-string (lesson 04) fills in the turn number, then `* 40` repeats the string 40 times to make a long text."
      },
      "run": true
    },
    {
      "t": "h",
      "zh": "二、ContextConfig：设置压缩",
      "en": "2. ContextConfig: setting up compression"
    },
    {
      "t": "p",
      "zh": "[▶ 01:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=92) `ContextConfig` 和 `Agent` 一起从 `agentscope.agent` 导入。视频按顺序讲了三个参数：\n\n| 参数 | 默认值 | 意思 |\n|---|---|---|\n| `trigger_ratio` | 0.8 | 内容达到窗口的这个比例就压缩；视频也用 0.8（最大 0.9，要给压缩本身留空间） |\n| `reserve_ratio` | 0.1 | 压缩时，最近多大比例的内容原样保留；必须小于 `trigger_ratio`，否则创建 Agent 时报 `ValueError` |\n| `tool_result_limit` | 50000 | 单个工具结果最多留多少 token，超出就截断，省 token；视频设成 3000 |\n\n[▶ 02:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=122) 视频解释后两个参数时提到，有的工具一次返回很长的结果，会占掉大量 token，截断就是为了省这部分。窗口大小设在模型上：`DeepSeekChatModel(..., context_size=65536)`，默认就是 65536。[▶ 02:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=155) 创建 Agent 时，把配置交给 `context_config=` 参数。",
      "en": "[▶ 01:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=92) `ContextConfig` is imported from `agentscope.agent`, together with `Agent`. The video goes through three parameters:\n\n| Parameter | Default | Meaning |\n|---|---|---|\n| `trigger_ratio` | 0.8 | Compress once the content reaches this share of the window; the video also uses 0.8 (max 0.9, leaving room for the compression itself) |\n| `reserve_ratio` | 0.1 | How much of the most recent content is kept verbatim when compressing; must be below `trigger_ratio`, or creating the agent raises `ValueError` |\n| `tool_result_limit` | 50000 | The most tokens a single tool result may keep; the rest is cut to save tokens. The video sets 3000 |\n\n[▶ 02:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=122) Explaining the last two, the video notes that some tools return very long results that eat up tokens – the cut is there to save them. The window size lives on the model: `DeepSeekChatModel(..., context_size=65536)`, and 65536 is the default. [▶ 02:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=155) Hand the config to the agent through the `context_config=` parameter."
    },
    {
      "t": "code",
      "file": "context_config.py",
      "code": {
        "zh": "from agentscope.agent import Agent, ContextConfig     # ContextConfig 和 Agent 在同一个模块\nfrom agentscope.credential import DeepSeekCredential\nfrom agentscope.model import DeepSeekChatModel\nfrom agentscope.tool import Toolkit\nfrom agentscope.workspace import LocalWorkspace\n\nfrom llm import API_KEY, MODEL\n\nasync def main():\n    workspace = LocalWorkspace(workdir=\"data/l19_workspace\")\n    await workspace.initialize()\n    tools = await workspace.list_tools()\n\n    config = ContextConfig(\n        trigger_ratio=0.8,         # 达到窗口的 80% 就压缩\n        reserve_ratio=0.1,         # 最近约 10% 的内容原样保留\n        tool_result_limit=3000,    # 单个工具结果最多 3000 token\n    )\n    model = DeepSeekChatModel(credential=DeepSeekCredential(api_key=API_KEY), model=MODEL,\n                              stream=True, context_size=65536)   # 窗口大小，默认就是 65536\n    agent = Agent(name=\"Friday\", system_prompt=\"...\", model=model,\n                  toolkit=Toolkit(tools=tools),\n                  offloader=workspace,          # 压缩掉的原文存进工作空间\n                  context_config=config)        # 压缩设置\n\n    # 手动触发压缩\n    await agent.compress_context()                     # 按 Agent 自己的设置\n    await agent.compress_context(ContextConfig(trigger_ratio=0.01, reserve_ratio=0.01))   # 换一份设置",
        "en": "from agentscope.agent import Agent, ContextConfig     # ContextConfig lives next to Agent\nfrom agentscope.credential import DeepSeekCredential\nfrom agentscope.model import DeepSeekChatModel\nfrom agentscope.tool import Toolkit\nfrom agentscope.workspace import LocalWorkspace\n\nfrom llm import API_KEY, MODEL\n\nasync def main():\n    workspace = LocalWorkspace(workdir=\"data/l19_workspace\")\n    await workspace.initialize()\n    tools = await workspace.list_tools()\n\n    config = ContextConfig(\n        trigger_ratio=0.8,         # compress at 80% of the window\n        reserve_ratio=0.1,         # keep the latest ~10% verbatim\n        tool_result_limit=3000,    # at most 3000 tokens per tool result\n    )\n    model = DeepSeekChatModel(credential=DeepSeekCredential(api_key=API_KEY), model=MODEL,\n                              stream=True, context_size=65536)   # window size; 65536 is the default\n    agent = Agent(name=\"Friday\", system_prompt=\"...\", model=model,\n                  toolkit=Toolkit(tools=tools),\n                  offloader=workspace,          # compressed originals go to the workspace\n                  context_config=config)        # the compression settings\n\n    # Compress by hand\n    await agent.compress_context()                     # with the agent's own settings\n    await agent.compress_context(ContextConfig(trigger_ratio=0.01, reserve_ratio=0.01))   # with other settings"
      }
    },
    {
      "t": "p",
      "zh": "[▶ 02:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=155) 也可以手动触发压缩：`await agent.compress_context()`。不传参数就按 Agent 自己的设置；也可以传一份新的 `ContextConfig`。注意，手动调用**同样先检查阈值**，没到阈值就什么也不做（离线实测）。所以想马上看到压缩效果，要像上面第二行那样临时传一份触发比例很低的设置。视频的完整代码里也有一行手动压缩，演示前被删掉了——平时交给框架自动处理就行。",
      "en": "[▶ 02:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=155) You can also compress by hand: `await agent.compress_context()`. Without an argument it uses the agent's own settings; you can also pass a new `ContextConfig`. Note that a manual call **still checks the threshold first** and does nothing below it (tested offline). To see a compression right away, pass temporary settings with a very low trigger ratio, as in the second line above. The video's full code also had a manual compression line, removed before the demo – normally the framework handles it automatically."
    },
    {
      "t": "check",
      "q": {
        "zh": "`context_size=65536`、`trigger_ratio=0.8`，下一次调用前估算出 40000 token。会压缩吗？",
        "en": "`context_size=65536`, `trigger_ratio=0.8`, and the next call is estimated at 40000 tokens. Will it compress?"
      },
      "options": [
        {
          "zh": "会，超过一半就压缩",
          "en": "Yes, anything over half is compressed"
        },
        {
          "zh": "不会，阈值约 52429，还没到",
          "en": "No – the threshold is about 52429 and it is not there yet"
        },
        {
          "zh": "会，每次调用前都压缩",
          "en": "Yes, it compresses before every call"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "阈值 = 65536 × 0.8 ≈ 52429。估算值达到阈值才压缩；每次调用前只是**检查**一下。",
        "en": "Threshold = 65536 × 0.8 ≈ 52429. Compression happens only once the estimate reaches it; before each call it is merely **checked**."
      }
    },
    {
      "t": "tip",
      "zh": "截断后模型只看得到工具结果的**开头**。关键内容如果在后面（比如日志第 250 行的 ERROR），模型就会漏掉——除非它有能读文件的工具（比如工作空间的 `Read`），按提醒里的路径去读被截掉的那部分。所以写工具时，尽量让返回结果短而精。练习文件 `l19_context_demo.py` 演示了截断、卸载和手动压缩（约 4 次模型调用），跑完去 `practice\\data\\l19_workspace\\sessions\\` 看生成的文件。",
      "en": "After truncation the model only sees the **beginning** of a tool result. If the key part comes later (say an ERROR on line 250 of a log), the model misses it – unless it has a file-reading tool (such as the workspace's `Read`) to open the cut-off part at the path in the reminder. So keep tool results short and focused. The practice file `l19_context_demo.py` demonstrates truncation, offloading and manual compression (about 4 model calls); afterwards look at the files in `practice\\data\\l19_workspace\\sessions\\`."
    },
    {
      "t": "h",
      "zh": "三、为什么要保存状态",
      "en": "3. Why save the state"
    },
    {
      "t": "p",
      "zh": "[▶ 03:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=186) 视频举了个写小说的例子：用户请 Agent 帮忙写小说，Agent 问想要什么主题；过了一阵程序重启，用户想接着聊，Agent 却完全不记得刚才在说什么。[▶ 03:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=217) 原因是上下文只在内存里，Agent 一结束就被丢掉，每次启动都是一个「全新」的 Agent，体验很差。要让对话接得上，就得把 Agent 的状态存下来。（06 节我们自己维护 `message_history` 列表时也一样：程序一关，列表就没了。）",
      "en": "[▶ 03:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=186) The video's example is about writing a novel: the user asks the agent for help, and the agent asks what theme they want. Some time later the program restarts; the user wants to carry on, but the agent has no idea what they were talking about. [▶ 03:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=217) That's because the context only lives in memory and is thrown away when the agent stops – every start is a brand-new agent, which is a poor experience. To continue a conversation you must save the agent's state. (The same was true of the `message_history` list we kept ourselves in lesson 06: close the program and the list is gone.)"
    },
    {
      "t": "h",
      "zh": "四、AgentState：存档与读档",
      "en": "4. AgentState: saving and loading"
    },
    {
      "t": "p",
      "zh": "[▶ 04:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=248) 状态类是 `agentscope.state` 里的 `AgentState`——18 节放权限上下文时已经见过它。它是一个 pydantic 模型（回顾 12 节的 `BaseModel`），装着这个 Agent 需要记住的一切：\n\n| 字段 | 存什么 |\n|---|---|\n| `context` | 还没被压缩的对话消息 |\n| `summary` | 压缩出来的摘要（没压缩过就是空字符串） |\n| `permission_context` | 18 节的权限模式和规则 |\n| `session_id` | 会话编号，卸载的文件按它分文件夹 |\n| `reply_context` 等 | 当前回复的编号、工具缓存、任务列表等 |\n\n所以，**存下 `agent.state`，就存下了这个 Agent 的全部记忆**。存成文件要用到下面的 Python 知识。",
      "en": "[▶ 04:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=248) The state class is `AgentState` from `agentscope.state` – you met it in lesson 18 when passing the permission context. It is a pydantic model (see `BaseModel` in lesson 12) holding everything the agent needs to remember:\n\n| Field | Holds |\n|---|---|\n| `context` | Conversation messages not yet compressed |\n| `summary` | The compressed summary (an empty string until the first compression) |\n| `permission_context` | Lesson 18's permission mode and rules |\n| `session_id` | The session id; offloaded files are filed under it |\n| `reply_context` etc. | The current reply's id, tool caches, the task list and so on |\n\nSo **saving `agent.state` saves everything the agent remembers**. Writing it to a file needs the Python below."
    },
    {
      "t": "py",
      "title": {
        "zh": "文件读写 + json.dump / json.load",
        "en": "File I/O + json.dump / json.load"
      },
      "zh": "第 10 节用 `with open(..., \"rb\")` 读过二进制文件，这里读写**文本**文件：\n- `open(路径, \"w\", encoding=\"utf-8\")`：写入，文件不存在就新建，**存在就清空重写**；`\"a\"` 是在末尾追加\n- `open(路径, encoding=\"utf-8\")`：不写模式就是 `\"r\"`，只读\n- `with ... as f:` 结束时自动关闭文件，不用自己写 `f.close()`\n- `json.dump(数据, f)`：把字典 / 列表写成 JSON 文本存进文件；`json.load(f)`：从文件读回来\n- 和 05 节的 `json.dumps` / `json.loads` 只差一个 s：**带 s 的处理字符串，不带 s 的直接处理文件**\n- `ensure_ascii=False` 让中文原样保存（否则会变成 `\\u5c0f` 这样的转义），`indent=2` 让文件有缩进、方便人看\n\nWindows 默认的文件编码不是 UTF-8，所以**读和写都要写上 `encoding=\"utf-8\"`**。",
      "en": "Lesson 10 read a binary file with `with open(..., \"rb\")`; here we read and write **text** files:\n- `open(path, \"w\", encoding=\"utf-8\")`: write; creates the file if missing and **empties it if it exists**; `\"a\"` appends to the end instead\n- `open(path, encoding=\"utf-8\")`: no mode means `\"r\"`, read-only\n- `with ... as f:` closes the file automatically at the end – no `f.close()` needed\n- `json.dump(data, f)` writes a dict / list into the file as JSON text; `json.load(f)` reads it back\n- Only one letter away from lesson 05's `json.dumps` / `json.loads`: **with an s they work on strings, without it on files**\n- `ensure_ascii=False` keeps Chinese characters as they are (instead of escapes like `\\u5c0f`), `indent=2` makes the file indented and readable\n\nWindows does not default to UTF-8, so **always pass `encoding=\"utf-8\"` when reading and writing**.",
      "code": {
        "zh": "import json\nimport os\n\nmemo = {\"name\": \"小明\", \"likes\": [\"茶\", \"Python\"], \"turns\": 3}\n\n# 写：把字典存成 JSON 文件\nwith open(\"l19_demo_memo.json\", \"w\", encoding=\"utf-8\") as f:\n    json.dump(memo, f, ensure_ascii=False, indent=2)\n\n# 读：文件内容是纯文本\nwith open(\"l19_demo_memo.json\", encoding=\"utf-8\") as f:\n    print(f.read())\n\n# 读回字典：json.load 从文件对象里解析\nwith open(\"l19_demo_memo.json\", encoding=\"utf-8\") as f:\n    loaded = json.load(f)\nprint(loaded[\"likes\"][0], loaded == memo)     # 茶 True\n\nprint(os.path.exists(\"l19_demo_memo.json\"))   # True\nos.remove(\"l19_demo_memo.json\")               # 演示完删掉\nprint(os.path.exists(\"l19_demo_memo.json\"))   # False",
        "en": "import json\nimport os\n\nmemo = {\"name\": \"Ming\", \"likes\": [\"tea\", \"Python\"], \"turns\": 3}\n\n# Write: save the dict as a JSON file\nwith open(\"l19_demo_memo.json\", \"w\", encoding=\"utf-8\") as f:\n    json.dump(memo, f, ensure_ascii=False, indent=2)\n\n# Read: the file is plain text\nwith open(\"l19_demo_memo.json\", encoding=\"utf-8\") as f:\n    print(f.read())\n\n# Back to a dict: json.load parses straight from the file object\nwith open(\"l19_demo_memo.json\", encoding=\"utf-8\") as f:\n    loaded = json.load(f)\nprint(loaded[\"likes\"][0], loaded == memo)     # tea True\n\nprint(os.path.exists(\"l19_demo_memo.json\"))   # True\nos.remove(\"l19_demo_memo.json\")               # tidy up after the demo\nprint(os.path.exists(\"l19_demo_memo.json\"))   # False"
      }
    },
    {
      "t": "p",
      "zh": "有了这些，存档读档就是两次转换：\n\n1. **存档**：`agent.state.model_dump(mode=\"json\")` 把状态变成只含字符串、数字、列表、字典的普通字典（`mode=\"json\"` 保证每样东西都能写进 JSON）；[▶ 04:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=280) 再用 `open(..., \"w\")` 打开一个存档文件（视频里叫 `agent-state.json`），`json.dump` 写进去。\n2. **读档**：打开文件，`json.load` 读出字典，再用 `AgentState.model_validate(字典)` 变回 `AgentState` 对象（写成 `AgentState(**字典)` 也行，回顾 05 节的 `**` 拆包）。[▶ 05:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=311) 然后在创建 Agent 时用 `state=` 传进去。",
      "en": "With that, saving and loading are two conversions:\n\n1. **Save**: `agent.state.model_dump(mode=\"json\")` turns the state into a plain dict of strings, numbers, lists and dicts (`mode=\"json\"` makes sure everything can go into JSON); [▶ 04:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=280) then open a save file (`agent-state.json` in the video) with `open(..., \"w\")` and write it with `json.dump`.\n2. **Load**: open the file, read the dict with `json.load`, and turn it back into an `AgentState` with `AgentState.model_validate(dict)` (`AgentState(**dict)` works too – see `**` unpacking in lesson 05). [▶ 05:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=311) Then pass it with `state=` when creating the agent."
    },
    {
      "t": "code",
      "file": "save_load.py",
      "code": {
        "zh": "import json\nfrom pathlib import Path\n\nfrom agentscope.state import AgentState\n\nSTATE_FILE = Path(\"data\") / \"l19_agent_state.json\"     # 视频里的文件叫 agent-state.json\n\ndef save_state(agent, path):\n    data = agent.state.model_dump(mode=\"json\")        # AgentState 对象 → 普通字典\n    with open(path, \"w\", encoding=\"utf-8\") as f:\n        json.dump(data, f, ensure_ascii=False, indent=2)\n\ndef load_state(path):\n    with open(path, encoding=\"utf-8\") as f:\n        data = json.load(f)\n    return AgentState.model_validate(data)            # 普通字典 → AgentState 对象",
        "en": "import json\nfrom pathlib import Path\n\nfrom agentscope.state import AgentState\n\nSTATE_FILE = Path(\"data\") / \"l19_agent_state.json\"     # called agent-state.json in the video\n\ndef save_state(agent, path):\n    data = agent.state.model_dump(mode=\"json\")        # AgentState object -> plain dict\n    with open(path, \"w\", encoding=\"utf-8\") as f:\n        json.dump(data, f, ensure_ascii=False, indent=2)\n\ndef load_state(path):\n    with open(path, encoding=\"utf-8\") as f:\n        data = json.load(f)\n    return AgentState.model_validate(data)            # plain dict -> AgentState object"
      }
    },
    {
      "t": "warn",
      "zh": "`mode=\"json\"` 不能省。不写的话，`model_dump()` 里还留着枚举对象（比如权限模式 `PermissionMode.DEFAULT`），`json.dump` 会报错：`TypeError: Object of type PermissionMode is not JSON serializable`（实测）。加上 `mode=\"json\"`，枚举会变成它的值 `\"default\"`（枚举的 `.value` 见 15 节的 Enum 小课堂）。",
      "en": "Don't drop `mode=\"json\"`. Without it `model_dump()` still contains enum objects (such as the permission mode `PermissionMode.DEFAULT`) and `json.dump` fails with `TypeError: Object of type PermissionMode is not JSON serializable` (tested). With `mode=\"json\"` an enum becomes its value, `\"default\"` (see `.value` in lesson 15's Enum mini-lesson)."
    },
    {
      "t": "note",
      "zh": "视频还提到另一种读档方式：先创建 Agent，再通过 `agent.state` 把读回来的状态装进去（字幕里这个方法名识别得不清楚；2.0.9 的 `AgentState` 没有专门的「加载」方法，能做的就是整个替换 `agent.state`）。对话记录这样也能接上，但有个坑：Agent 的权限引擎是**创建时**按当时的状态建好的，事后整个替换 `agent.state`，读回来的权限规则（包括用户选过的「以后都允许」）不会生效（按 2.0.9 源码确认）。所以推荐创建 Agent 时就用 `state=` 传进去。\n\n另外，pydantic 还有一步到位的写法，效果一样：`model_dump_json(indent=2)` 直接得到 JSON 字符串，`AgentState.model_validate_json(字符串)` 直接读回来。",
      "en": "The video also mentions loading the other way round: create the agent first, then load the state in through `agent.state` (the method name is garbled in the subtitles; 2.0.9's `AgentState` has no dedicated “load” method, so in practice this means replacing `agent.state` wholesale). The conversation continues that way too, but there's a catch: the agent's permission engine is built from the state **at creation time**, so after replacing `agent.state` wholesale, loaded permission rules (including any “always allow” the user chose) don't take effect (confirmed in the 2.0.9 source). So pass `state=` when creating the agent.\n\npydantic also has one-step versions with the same effect: `model_dump_json(indent=2)` gives the JSON string directly, and `AgentState.model_validate_json(text)` reads it back."
    },
    {
      "t": "h",
      "zh": "五、完整程序：每轮存档，重启后接着聊",
      "en": "5. The full program: save every turn, continue after a restart"
    },
    {
      "t": "p",
      "zh": "[▶ 05:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=311) 完整代码先初始化工作空间、设置 `ContextConfig`、创建模型，然后加了两处：\n1. [▶ 05:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=342) 启动时先判断存档文件在不在：在，说明之前存过，读档后用 `state=` 交给 Agent；不在，就不传 `state`，Agent 自己新建一个空状态。\n2. [▶ 06:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=374) 对话循环（15 节的流式输出）每跑完一轮，就存一次档。",
      "en": "[▶ 05:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=311) The full code initialises the workspace, sets up `ContextConfig` and creates the model, then adds two things:\n1. [▶ 05:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=342) At start-up, check whether the save file exists: if so, there is a saved state – load it and pass it with `state=`; if not, pass no `state` and the agent creates an empty one.\n2. [▶ 06:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=374) After every turn of the chat loop (lesson 15's streaming output), save again."
    },
    {
      "t": "code",
      "file": {
        "zh": "practice/l19_state_solution.py（节选）",
        "en": "practice/l19_state_solution.py (excerpt)"
      },
      "code": {
        "zh": "async def main():\n    workspace = LocalWorkspace(workdir=str(WORKDIR))\n    await workspace.initialize()\n    config = ContextConfig(trigger_ratio=0.8, reserve_ratio=0.1, tool_result_limit=3000)\n    model = DeepSeekChatModel(credential=DeepSeekCredential(api_key=API_KEY), model=MODEL, stream=True)\n\n    state = None\n    if STATE_FILE.exists():                  # 有存档：读档\n        state = load_state(STATE_FILE)\n    agent = Agent(name=\"Friday\", system_prompt=\"你是一个简洁的助手。\", model=model,\n                  state=state,                # None 时 Agent 自己新建状态\n                  offloader=workspace, context_config=config)\n\n    while True:\n        text = input(\"\\n你：\").strip()\n        if text == \"/exit\":\n            break\n        async for event in agent.reply_stream(UserMsg(name=\"user\", content=text)):\n            if event.type == EventType.TEXT_BLOCK_DELTA:\n                print(event.delta, end=\"\", flush=True)\n        print()\n        save_state(agent, STATE_FILE)         # 每轮都存档\n\n    await workspace.close()\n\nasyncio.run(main())",
        "en": "async def main():\n    workspace = LocalWorkspace(workdir=str(WORKDIR))\n    await workspace.initialize()\n    config = ContextConfig(trigger_ratio=0.8, reserve_ratio=0.1, tool_result_limit=3000)\n    model = DeepSeekChatModel(credential=DeepSeekCredential(api_key=API_KEY), model=MODEL, stream=True)\n\n    state = None\n    if STATE_FILE.exists():                  # a save file exists: load it\n        state = load_state(STATE_FILE)\n    agent = Agent(name=\"Friday\", system_prompt=\"You are a concise assistant.\", model=model,\n                  state=state,                # None -> the agent creates a fresh state\n                  offloader=workspace, context_config=config)\n\n    while True:\n        text = input(\"\\nYou: \").strip()\n        if text == \"/exit\":\n            break\n        async for event in agent.reply_stream(UserMsg(name=\"user\", content=text)):\n            if event.type == EventType.TEXT_BLOCK_DELTA:\n                print(event.delta, end=\"\", flush=True)\n        print()\n        save_state(agent, STATE_FILE)         # save after every turn\n\n    await workspace.close()\n\nasyncio.run(main())"
      },
      "note": {
        "zh": "视频里还把工作空间的工具交给了 Agent；练习文件省掉了工具，免得还要处理确认事件（做法见 18 节）。",
        "en": "The video also gives the workspace's tools to the agent; the practice file leaves them out so it doesn't need to handle confirm events (see lesson 18 for that)."
      }
    },
    {
      "t": "p",
      "zh": "[▶ 06:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=405) 视频的测试很直观：先和 Agent 约定一个暗号（「我爱吃香蕉皮」），叫它一定记住；聊完一轮就关掉程序，[▶ 07:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=439) 文件夹里多出一个 `agent-state.json`；重新启动后问暗号，Agent 答对了，还说得出之前聊过什么。用练习文件和 DeepSeek 实测（每次运行 1 次模型调用）：",
      "en": "[▶ 06:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=405) The video's test is simple: agree on a secret code with the agent (“I love eating banana peels”) and tell it to remember; after one turn close the program, and [▶ 07:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=20&t=439) an `agent-state.json` file has appeared. After a restart, ask for the code – the agent gets it right and even recalls the earlier conversation. Run with the practice file and DeepSeek (one model call per run):"
    },
    {
      "t": "code",
      "file": {
        "zh": "实测输出（运行两次）",
        "en": "Real output (two runs, translated)"
      },
      "lang": "text",
      "code": {
        "zh": "（第 1 次运行 / run 1）\n没有存档，从头开始 / no save file: starting fresh\n\n你 / You: 我们约定一个暗号：我爱吃香蕉皮。一定要记住。\nFriday: 好的，我记住了：**我爱吃香蕉皮**。之后你提到这个暗号时我就知道是你。\n  (已存档 saved: 2 条消息 messages)\n\n你 / You: /exit\n\n（第 2 次运行 / run 2）\n读取存档 / loaded: 2 条消息 messages\n\n你 / You: 暗号是什么？\nFriday: **我爱吃香蕉皮**\n  (已存档 saved: 4 条消息 messages)",
        "en": "(run 1)\nno save file: starting fresh\n\nYou: Let's agree on a secret code: I love eating banana peels. Be sure to remember it.\nFriday: OK, I've got it: **I love eating banana peels**. Whenever you mention this code, I'll know it's you.\n  (saved: 2 messages)\n\nYou: /exit\n\n(run 2)\nloaded: 2 messages\n\nYou: What's the secret code?\nFriday: **I love eating banana peels**\n  (saved: 4 messages)"
      }
    },
    {
      "t": "note",
      "zh": "存下来的是**全部**状态：对话、摘要、权限规则都在里面，连「正在等你批准」的工具调用也会保存——读档后交回 `UserConfirmResultEvent` 就能接着执行（18 节的确认循环照样能用）。",
      "en": "The **whole** state is saved: conversation, summary and permission rules – even a tool call waiting for your approval. After loading, handing back a `UserConfirmResultEvent` carries on (lesson 18's confirm loop works unchanged)."
    },
    {
      "t": "check",
      "q": {
        "zh": "想让程序重启后接着聊，读档后应该怎样把状态交给 Agent？",
        "en": "To continue chatting after a restart, how do you give the loaded state to the agent?"
      },
      "options": [
        {
          "zh": "先创建 Agent，再把 `agent.state.context` 一条条 append 进去",
          "en": "Create the agent, then append to `agent.state.context` one message at a time"
        },
        {
          "zh": "把 JSON 文件的路径写进 `system_prompt`",
          "en": "Put the JSON file's path into `system_prompt`"
        },
        {
          "zh": "创建 Agent 时用 `state=load_state(...)` 传进去",
          "en": "Pass it in with `state=load_state(...)` when creating the agent"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "`Agent(..., state=state)` 一次带上全部记忆；权限引擎也是在创建时根据这个状态建好的。",
        "en": "`Agent(..., state=state)` brings the whole memory at once; the permission engine is also built from this state at creation time."
      }
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "创建 Agent 时**没有**传 `offloader`（没有工作空间）。上下文被压缩时，被压缩掉的旧对话原文会怎样？",
        "en": "An agent was created **without** an `offloader` (no workspace). When the context is compressed, what happens to the original text of the compressed messages?"
      },
      "options": [
        {
          "zh": "存进 `sessions/<session_id>/context.jsonl`",
          "en": "It is saved to `sessions/<session_id>/context.jsonl`"
        },
        {
          "zh": "被删除，只剩下摘要",
          "en": "It is deleted; only the summary remains"
        },
        {
          "zh": "发回模型服务器保存",
          "en": "It is sent back to the model provider for storage"
        },
        {
          "zh": "没有工作空间就不会压缩",
          "en": "Without a workspace there is no compression"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "压缩照常发生；有工作空间才会把原文存成文件，没有就永久丢失。",
        "en": "Compression still happens; only with a workspace are the originals saved to a file – otherwise they are gone for good."
      }
    },
    {
      "q": {
        "zh": "`json.dump(agent.state.model_dump(), f)` 报 `TypeError: Object of type PermissionMode is not JSON serializable`，怎么改？",
        "en": "`json.dump(agent.state.model_dump(), f)` raises `TypeError: Object of type PermissionMode is not JSON serializable`. The fix?"
      },
      "options": [
        {
          "zh": "把 `json.dump` 换成 `json.dumps`",
          "en": "Replace `json.dump` with `json.dumps`"
        },
        {
          "zh": "删掉权限设置",
          "en": "Remove the permission settings"
        },
        {
          "zh": "打开文件时加 `encoding=\"utf-8\"`",
          "en": "Add `encoding=\"utf-8\"` when opening the file"
        },
        {
          "zh": "改成 `model_dump(mode=\"json\")`，让枚举变成字符串",
          "en": "Use `model_dump(mode=\"json\")` so enums become strings"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "`mode=\"json\"` 会把枚举等对象转换成 JSON 能表示的值；编码问题和这个报错无关。",
        "en": "`mode=\"json\"` converts enums and similar objects into JSON-friendly values; encoding has nothing to do with this error."
      }
    },
    {
      "q": {
        "zh": "Agent 什么时候会自动压缩上下文？",
        "en": "When does the agent compress its context automatically?"
      },
      "options": [
        {
          "zh": "每次调用模型前检查，估算 token ≥ `context_size × trigger_ratio` 时",
          "en": "It checks before each model call and compresses when estimated tokens ≥ `context_size × trigger_ratio`"
        },
        {
          "zh": "每过 10 轮对话固定压缩一次",
          "en": "Every 10 turns, regardless"
        },
        {
          "zh": "只有手动调用 `compress_context()` 时",
          "en": "Only when you call `compress_context()` yourself"
        },
        {
          "zh": "程序退出时",
          "en": "When the program exits"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "每次推理前都会检查，到了阈值才压缩；`compress_context()` 只是额外提供的手动入口。",
        "en": "It checks before every reasoning step and compresses at the threshold; `compress_context()` is just an extra manual entry point."
      }
    },
    {
      "q": {
        "zh": "对话才几句，你调用了 `await agent.compress_context()`（不传参数，Agent 用默认设置）。会怎样？",
        "en": "Only a few lines into a chat you call `await agent.compress_context()` (no argument; the agent uses default settings). What happens?"
      },
      "options": [
        {
          "zh": "立刻把所有对话压缩成摘要",
          "en": "Everything is compressed into a summary at once"
        },
        {
          "zh": "报错：还不需要压缩",
          "en": "An error: no compression needed yet"
        },
        {
          "zh": "什么也不做，因为还没到阈值",
          "en": "Nothing, because the threshold hasn't been reached"
        },
        {
          "zh": "清空所有对话",
          "en": "The whole conversation is cleared"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "手动调用同样先检查阈值。想马上看到压缩，要传一份 `trigger_ratio` 很低的 `ContextConfig`。",
        "en": "A manual call checks the threshold too. To see a compression right away, pass a `ContextConfig` with a very low `trigger_ratio`."
      }
    },
    {
      "q": {
        "zh": "先 `agent = Agent(...)`，再写 `agent.state = load_state(path)` 替换状态，有什么隐患？",
        "en": "You create `agent = Agent(...)` and then replace the state with `agent.state = load_state(path)`. What's the risk?"
      },
      "options": [
        {
          "zh": "没有任何问题",
          "en": "None at all"
        },
        {
          "zh": "权限引擎是创建 Agent 时按旧状态建的，读回来的权限规则不会生效",
          "en": "The permission engine was built from the old state at creation, so the loaded permission rules won't take effect"
        },
        {
          "zh": "对话内容会被清空",
          "en": "The conversation gets wiped"
        },
        {
          "zh": "存档文件会被删除",
          "en": "The save file gets deleted"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "`Agent.__init__` 里用 `state.permission_context` 建好了权限引擎，事后整个替换 `state`，引擎还看着旧的那份。应该在创建时传 `state=`。",
        "en": "`Agent.__init__` builds the permission engine from `state.permission_context`; swapping `state` afterwards leaves the engine looking at the old one. Pass `state=` at creation."
      }
    },
    {
      "q": {
        "zh": "一个工具返回的结果远超 `tool_result_limit`，Agent 创建时传了 `offloader=workspace`。会发生什么？",
        "en": "A tool returns far more than `tool_result_limit`, and the agent was created with `offloader=workspace`. What happens?"
      },
      "options": [
        {
          "zh": "整个结果原样放进上下文",
          "en": "The whole result goes into the context as is"
        },
        {
          "zh": "报错，工具调用失败",
          "en": "An error: the tool call fails"
        },
        {
          "zh": "结果被直接丢弃，模型什么也看不到",
          "en": "The result is discarded and the model sees nothing"
        },
        {
          "zh": "上下文里只留开头，被截掉的部分存进 `sessions/<session_id>/tool_result-<编号>.txt`，并提醒模型文件路径",
          "en": "Only the beginning stays in the context; the cut-off part goes to `sessions/<session_id>/tool_result-<id>.txt` with a reminder of the path"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "超出的部分被截断；有 offloader 时，被截掉的那部分落到工作空间文件里，模型能从提醒中知道去哪找。",
        "en": "The excess is cut; with an offloader the cut-off part lands in a workspace file and the reminder tells the model where to look."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "存档、读档、启动时判断",
        "en": "Save, load, and the start-up check"
      },
      "code": "def save_state(agent, path):\n    data = agent.state.[[model_dump]](mode=\"[[json]]\")\n    with [[open]](path, \"[[w]]\", encoding=\"utf-8\") as f:\n        json.[[dump]](data, f, ensure_ascii=False, indent=2)\n\ndef load_state(path):\n    with open(path, encoding=\"utf-8\") as f:\n        data = json.[[load]](f)\n    return AgentState.[[model_validate]](data)\n\nstate = None\nif STATE_FILE.[[exists]]():\n    state = load_state(STATE_FILE)\nagent = Agent(name=\"Friday\", system_prompt=\"...\", model=model, [[state]]=state)",
      "explain": {
        "zh": "存：`model_dump(mode=\"json\")` → `open(..., \"w\")` → `json.dump`；读：`json.load` → `AgentState.model_validate`；启动时先 `exists()`，有存档才读，最后 `state=` 交给 Agent。",
        "en": "Save: `model_dump(mode=\"json\")` → `open(..., \"w\")` → `json.dump`; load: `json.load` → `AgentState.model_validate`; at start-up check `exists()` first, load only if there is a file, and hand it over with `state=`."
      }
    },
    {
      "title": {
        "zh": "上下文设置",
        "en": "Context settings"
      },
      "code": "async def main():\n    config = [[ContextConfig]](\n        [[trigger_ratio]]=0.8,\n        [[reserve_ratio]]=0.1,\n        [[tool_result_limit]]=3000,\n    )\n    agent = Agent(name=\"Friday\", system_prompt=\"...\", model=model, toolkit=toolkit,\n                  [[offloader]]=workspace, [[context_config]]=config)\n    await agent.[[compress_context]]()",
      "explain": {
        "zh": "三个参数分别管「何时压缩」「保留多少最近内容」「工具结果上限」；`offloader` 决定压缩掉的原文去哪；`compress_context()` 手动触发（仍然先看阈值）。",
        "en": "The three parameters control when to compress, how much recent content to keep, and the tool-result cap; `offloader` decides where compressed originals go; `compress_context()` triggers by hand (still checking the threshold)."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：存档、读档和启动时的判断",
        "en": "Write it: save, load and the start-up check"
      },
      "task": {
        "zh": "不看上面的代码，写出：\n1. `save_state(agent, path)`：用 `model_dump(mode=\"json\")` 把 `agent.state` 变成字典，用 `with open(..., \"w\", encoding=\"utf-8\")` 和 `json.dump` 写进文件（`ensure_ascii=False`）。\n2. `load_state(path)`：用 `json.load` 读出字典，再用 `AgentState.model_validate` 变回状态对象并返回。\n3. 启动时的三行：`state` 先设为 `None`；`STATE_FILE.exists()` 为真才读档；最后 `Agent(..., state=state)`。\n\n写完放进 `practice/l19_state_todo.py` 运行两次：第一次约定一个暗号，第二次问暗号是什么。",
        "en": "Without looking above, write:\n1. `save_state(agent, path)`: turn `agent.state` into a dict with `model_dump(mode=\"json\")` and write it with `with open(..., \"w\", encoding=\"utf-8\")` and `json.dump` (`ensure_ascii=False`).\n2. `load_state(path)`: read the dict with `json.load`, turn it back with `AgentState.model_validate` and return it.\n3. The start-up lines: set `state` to `None`; load only if `STATE_FILE.exists()`; finally `Agent(..., state=state)`.\n\nThen put them into `practice/l19_state_todo.py` and run it twice: agree on a secret code the first time, ask for it the second time."
      },
      "starter": {
        "zh": "import json\nfrom pathlib import Path\n\nfrom agentscope.state import AgentState\n\nSTATE_FILE = Path(\"data\") / \"l19_agent_state.json\"\n\n# 1. save_state(agent, path)：agent.state → 普通字典（注意 mode）→ 写进 JSON 文件\n\n\n# 2. load_state(path)：从 JSON 文件读出字典，再变回 AgentState\n\n\n# 3. 启动时：先假设没有存档；存档文件存在才读档；再创建 Agent 并把状态交给它",
        "en": "import json\nfrom pathlib import Path\n\nfrom agentscope.state import AgentState\n\nSTATE_FILE = Path(\"data\") / \"l19_agent_state.json\"\n\n# 1. save_state(agent, path): agent.state -> plain dict (mind the mode) -> written to a JSON file\n\n\n# 2. load_state(path): read the dict from the JSON file and turn it back into an AgentState\n\n\n# 3. At start-up: assume there is no save; load only if the file exists; then create the agent with that state"
      },
      "solution": {
        "zh": "import json\nfrom pathlib import Path\n\nfrom agentscope.state import AgentState\n\nSTATE_FILE = Path(\"data\") / \"l19_agent_state.json\"\n\n# 1. save_state(agent, path)\ndef save_state(agent, path):\n    data = agent.state.model_dump(mode=\"json\")\n    with open(path, \"w\", encoding=\"utf-8\") as f:\n        json.dump(data, f, ensure_ascii=False, indent=2)\n\n\n# 2. load_state(path)\ndef load_state(path):\n    with open(path, encoding=\"utf-8\") as f:\n        data = json.load(f)\n    return AgentState.model_validate(data)\n\n\n# 3. 启动时\nstate = None\nif STATE_FILE.exists():\n    state = load_state(STATE_FILE)\nagent = Agent(name=\"Friday\", system_prompt=\"你是一个简洁的助手。\", model=model, state=state)",
        "en": "import json\nfrom pathlib import Path\n\nfrom agentscope.state import AgentState\n\nSTATE_FILE = Path(\"data\") / \"l19_agent_state.json\"\n\n# 1. save_state(agent, path)\ndef save_state(agent, path):\n    data = agent.state.model_dump(mode=\"json\")\n    with open(path, \"w\", encoding=\"utf-8\") as f:\n        json.dump(data, f, ensure_ascii=False, indent=2)\n\n\n# 2. load_state(path)\ndef load_state(path):\n    with open(path, encoding=\"utf-8\") as f:\n        data = json.load(f)\n    return AgentState.model_validate(data)\n\n\n# 3. At start-up\nstate = None\nif STATE_FILE.exists():\n    state = load_state(STATE_FILE)\nagent = Agent(name=\"Friday\", system_prompt=\"You are a concise assistant.\", model=model, state=state)"
      },
      "checks": [
        {
          "zh": "定义了 `save_state(agent, path)`",
          "en": "Defines `save_state(agent, path)`",
          "re": "def\\s+save_state\\s*\\(\\s*\\w+\\s*,\\s*\\w+\\s*\\)\\s*:"
        },
        {
          "zh": "用 `model_dump(mode=\"json\")` 转成字典",
          "en": "Converts with `model_dump(mode=\"json\")`",
          "re": "model_dump\\(\\s*mode\\s*=\\s*[\"']json[\"']\\s*\\)"
        },
        {
          "zh": "用 `with open(..., \"w\", encoding=\"utf-8\")` 写文件",
          "en": "Writes with `with open(..., \"w\", encoding=\"utf-8\")`",
          "re": "with\\s+open\\([^)]*[\"']w[\"'][^)]*encoding\\s*=\\s*[\"']utf-8[\"']"
        },
        {
          "zh": "用 `json.dump(...)` 写入",
          "en": "Writes with `json.dump(...)`",
          "re": "json\\.dump\\("
        },
        {
          "zh": "定义了 `load_state(path)`",
          "en": "Defines `load_state(path)`",
          "re": "def\\s+load_state\\s*\\(\\s*\\w+\\s*\\)\\s*:"
        },
        {
          "zh": "用 `json.load(...)` 读出字典",
          "en": "Reads the dict with `json.load(...)`",
          "re": "json\\.load\\("
        },
        {
          "zh": "用 `AgentState.model_validate(...)` 变回状态并返回",
          "en": "Returns `AgentState.model_validate(...)`",
          "re": "return\\s+AgentState\\.model_validate\\("
        },
        {
          "zh": "启动时先判断文件是否存在",
          "en": "Checks that the file exists at start-up",
          "re": "if\\s+[\\w.()]*exists\\(\\s*\\)\\s*:"
        },
        {
          "zh": "创建 Agent 时用 `state=` 交给它",
          "en": "Passes it with `state=` when creating the agent",
          "re": "Agent\\([\\s\\S]*?state\\s*=\\s*\\w+"
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "`model_dump()` 忘了 `mode=\"json\"`，`json.dump` 遇到枚举就报 `TypeError`。",
      "en": "Forgetting `mode=\"json\"` in `model_dump()`: `json.dump` hits an enum and raises `TypeError`."
    },
    {
      "zh": "读写文件不写 `encoding=\"utf-8\"`：Windows 默认编码不是 UTF-8，中文可能乱码或报错。",
      "en": "Leaving out `encoding=\"utf-8\"`: Windows doesn't default to UTF-8, so Chinese text may garble or fail."
    },
    {
      "zh": "第一次运行时还没有存档，直接 `open` 读取会 `FileNotFoundError`。启动时先用 `exists()` 判断。",
      "en": "On the first run there is no save file, so opening it raises `FileNotFoundError`. Check `exists()` at start-up."
    },
    {
      "zh": "先创建 Agent 再整个替换 `agent.state`：权限引擎还连着旧状态，读回来的规则不生效。读档要在创建时传 `state=`。",
      "en": "Creating the agent and then replacing `agent.state` wholesale: the permission engine still points at the old state, so loaded rules don't apply. Pass `state=` at creation."
    },
    {
      "zh": "只在程序正常退出时存一次：中途崩溃就全丢了。像视频一样每轮对话后都存。",
      "en": "Saving only on a clean exit: a crash loses everything. Save after every turn, as the video does."
    },
    {
      "zh": "以为手动 `compress_context()` 一定会压缩：没到阈值时它什么也不做。",
      "en": "Assuming a manual `compress_context()` always compresses: below the threshold it does nothing."
    },
    {
      "zh": "没给 Agent 分配工作空间，又想回头查被压缩掉的原文：没有 `offloader`，那些内容已经永久删除了。",
      "en": "Wanting to look up compressed originals without having given the agent a workspace: with no `offloader` they were deleted for good."
    },
    {
      "zh": "`reserve_ratio` 设得不小于 `trigger_ratio`：创建 Agent 时直接报 `ValueError`。",
      "en": "Setting `reserve_ratio` at or above `trigger_ratio`: creating the agent raises `ValueError`."
    }
  ],
  "recap": [
    {
      "zh": "上下文窗口有限：每次调用模型前估算 token，≥ `context_size × trigger_ratio` 就把旧对话压缩成 `summary`，最近约 `reserve_ratio` 的内容原样留在 `context`。",
      "en": "The window is limited: before each model call tokens are estimated; at ≥ `context_size × trigger_ratio` older turns are compressed into `summary`, and roughly the latest `reserve_ratio` stays in `context` verbatim."
    },
    {
      "zh": "被压缩掉的原文、超长工具结果被截掉的部分：有 `offloader=workspace` 就存进 `sessions/<session_id>/`，没有就永久丢失。",
      "en": "Compressed originals and the cut-off part of oversized tool results: with `offloader=workspace` they are saved under `sessions/<session_id>/`; without it they are lost for good."
    },
    {
      "zh": "`ContextConfig(trigger_ratio, reserve_ratio, tool_result_limit)` → `Agent(..., context_config=config)`；手动压缩用 `await agent.compress_context(...)`，同样先看阈值。",
      "en": "`ContextConfig(trigger_ratio, reserve_ratio, tool_result_limit)` → `Agent(..., context_config=config)`; compress by hand with `await agent.compress_context(...)`, which still checks the threshold."
    },
    {
      "zh": "程序一结束，内存里的上下文就没了；`agent.state`（`AgentState`）装着 Agent 的全部记忆，存下它就能接着聊。",
      "en": "When the program ends, the in-memory context is gone; `agent.state` (`AgentState`) holds the agent's whole memory, and saving it lets you carry on."
    },
    {
      "zh": "存档：`model_dump(mode=\"json\")` → `with open(..., \"w\", encoding=\"utf-8\")` → `json.dump`，每轮对话后都存。",
      "en": "Save: `model_dump(mode=\"json\")` → `with open(..., \"w\", encoding=\"utf-8\")` → `json.dump`, after every turn."
    },
    {
      "zh": "读档：`exists()` 判断 → `json.load` → `AgentState.model_validate` → `Agent(..., state=state)`。",
      "en": "Load: check `exists()` → `json.load` → `AgentState.model_validate` → `Agent(..., state=state)`."
    },
    {
      "zh": "`json.dump` / `json.load` 处理文件，`json.dumps` / `json.loads` 处理字符串。",
      "en": "`json.dump` / `json.load` work on files, `json.dumps` / `json.loads` on strings."
    }
  ],
  "files": [
    {
      "path": "practice/l19_state_todo.py",
      "zh": "练习：补全 `save_state` / `load_state` 和启动时的读档判断（5 个 TODO），让 Agent 重启后还记得暗号。",
      "en": "Exercise: complete `save_state` / `load_state` and the start-up check (5 TODOs) so the agent remembers the secret code after a restart."
    },
    {
      "path": "practice/l19_state_solution.py",
      "zh": "参考答案：视频的完整程序——工作空间 + `ContextConfig` + 每轮存档到 `practice/data/l19_agent_state.json`，启动时读档；`/reset` 删除存档。",
      "en": "Solution: the video's full program – workspace + `ContextConfig` + saving to `practice/data/l19_agent_state.json` after every turn and loading on start; `/reset` deletes the save."
    },
    {
      "path": "practice/l19_context_demo.py",
      "zh": "补充演示：大工具结果被截断并卸载到工作空间、手动压缩成摘要、再靠摘要回答（约 4 次模型调用）。",
      "en": "Extra demo: a huge tool result is cut and offloaded to the workspace, the context is compressed into a summary by hand, and the agent answers from it (about 4 model calls)."
    }
  ]
});
