COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l37",
  "priority": "important",
  "handwrite": false,
  "studyMinutes": 30,
  "source": "subtitle",
  "summary": {
    "zh": "视频用一个会「放歌」的小智能体演示 LangGraph 的时光旅行：有了检查点，图每走一步都会留下一份状态快照。用 `get_state_history` 翻出这些快照，就能从过去任意一步**重放**（再执行一遍），或者先用 `update_state` 改掉那一步的数据再继续，走出另一条路（**分叉**）。视频里就是把「用 QQ 音乐播放」改成了「用网易云音乐播放」。",
    "en": "The video demonstrates LangGraph time travel with a small music-playing agent. With a checkpointer, every step of the graph leaves a snapshot of the state. `get_state_history` lists those snapshots, so you can **replay** from any past step (run it again), or first change that step's data with `update_state` and continue down a different path (**fork**). In the video, “play it on QQ Music” becomes “play it on NetEase Cloud Music”."
  },
  "goals": [
    {
      "zh": "用自己的话说清重放和分叉的区别和用途（老师拿 React 的 Redux 做类比）",
      "en": "Explain in your own words how replay and fork differ and what each is for (the instructor compares it to Redux in React)"
    },
    {
      "zh": "搭出视频里的放歌智能体：两个模拟工具、agent ⇄ action 循环、带 checkpointer 编译",
      "en": "Build the video's music agent: two mock tools, the agent ⇄ action loop, compiled with a checkpointer"
    },
    {
      "zh": "用 `get_state` / `get_state_history` 查看状态和历史，读懂快照的 `values`、`next`、`config`",
      "en": "Inspect the state and history with `get_state` / `get_state_history` and read a snapshot's `values`, `next` and `config`"
    },
    {
      "zh": "用 `stream(None, 过去的config)` 重放，并说出哪些步骤会真的重新执行",
      "en": "Replay with `stream(None, past_config)` and say which steps really run again"
    },
    {
      "zh": "改掉过去那条 AI 消息里的工具名，用 `update_state` 写回再继续，得到一条分支",
      "en": "Rename the tool in a past AI message, write it back with `update_state` and continue, creating a branch"
    }
  ],
  "blocks": [
    {
      "t": "h",
      "zh": "一、时光旅行：重放和分叉",
      "en": "1. Time travel: replay and fork"
    },
    {
      "t": "p",
      "zh": "[▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=38&t=1) 「时光旅行」是 LangGraph 官方文档里的叫法（time travel），名字听着玄乎，其实就是**状态管理**。老师的类比：写过前端的同学可能用过 React 的 Redux，它把应用状态集中起来、按单向数据流来管理，所以能回看每一次状态变化。LangGraph 也一样：编译时传入 checkpointer（30–31 节），图每走一步都会存下一份状态快照。时光旅行就是沿着这条「状态时间线」**往回走，再做点什么**。核心操作有两个：\n\n| 操作 | 做什么 | 用途举例 |\n|---|---|---|\n| **重放** replay | 回到过去某一步，从那里再执行一遍 | 把智能体一步步完成任务的过程重新演示给别人看；调试 |\n| **分叉** fork | 回到过去某一步，**先改数据**，再执行 | 换一种选择，看看另一条路径会得到什么 |",
      "en": "[▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=38&t=1) “Time travel” is the name the LangGraph docs use. It sounds mysterious, but it is really **state management**. The instructor's analogy: if you have done front-end work you may know Redux for React, which keeps the app state in one place and manages it as a one-way data flow, so you can look back at every state change. LangGraph is similar: compile with a checkpointer (lessons 30–31) and every step of the graph saves a snapshot of the state. Time travel means walking **back along this timeline of states and doing something there**. There are two core operations:\n\n| Operation | What it does | Example use |\n|---|---|---|\n| **Replay** | Go back to a past step and run again from there | Show someone how an agent completed a task step by step; debugging |\n| **Fork** | Go back to a past step, **change the data first**, then run | Make a different choice and see where the other path leads |"
    },
    {
      "t": "p",
      "zh": "[▶ 00:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=38&t=33) 老师举的重放场景：一个多智能体应用接到「写一份报告」的任务，要理解需求、调工具查资料、生成文件、再优化……走了好多步才交出结果。有了重放，就能把整个过程重新播放一遍，甚至把这个回放页面分享出去，让别人看到结果是怎么一步步得出来的。\n\n[▶ 01:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=38&t=96) 分叉则是「不光能看，还能改」：回到比如第三步，手动改掉那一步的数据再往下跑。例如流程里有一个分支点，第一次运行走了其中一条路；回到分支点、改掉决定走向的数据，它就会走另一条，这样就能探索图里的其他路径。",
      "en": "[▶ 00:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=38&t=33) The instructor's replay scenario: a multi-agent app is asked to write a report. It works out the request, calls tools to gather material, produces a file, polishes it… many steps before the result appears. With replay you can play the whole process back, and even share the replay page so others can see how the result came about, step by step.\n\n[▶ 01:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=38&t=96) A fork goes further: you don't just watch, you change things. Go back to, say, step three, edit that step's data by hand, and run on. If the flow has a branch point and the first run took one path, go back to the branch point, change the data that decides the direction, and it takes the other path. That is how you explore alternative paths through the graph."
    },
    {
      "t": "code",
      "file": "fork",
      "lang": "text",
      "code": {
        "zh": "                              ┌─→ 路线 A → …   第一次运行走的路\nSTART → 第 1 步 → 第 2 步 → 分支点\n                              └─→ 路线 B → …   回到分支点、改了数据之后走的路（分叉）",
        "en": "                               ┌─→ path A → …   taken on the first run\nSTART → step 1 → step 2 → branch point\n                               └─→ path B → …   taken after going back and changing the data (a fork)"
      }
    },
    {
      "t": "h",
      "zh": "二、示例：一个会放歌的智能体",
      "en": "2. The example: an agent that plays songs"
    },
    {
      "t": "video",
      "zh": "[▶ 03:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=38&t=188) 写代码之前老师提醒：他实测 DeepSeek 的工具调用能力比 OpenAI 的模型弱一些，调试时如果发现 DeepSeek 调工具不对劲，可以换个模型对比。所以这一集他用的是 OpenAI 的 **GPT-4o**。本站统一用 DeepSeek 的 `deepseek-flash`（`ChatDeepSeek`），这个例子实测能正确调用工具，其余代码和视频一致。",
      "en": "[▶ 03:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=38&t=188) Before coding, the instructor warns that in his tests DeepSeek's tool calling was weaker than OpenAI's models; if DeepSeek misbehaves with tools while you debug, try another model and compare. So this episode uses OpenAI's **GPT-4o**. This site uses DeepSeek's `deepseek-flash` (`ChatDeepSeek`) throughout; it calls the tools correctly in this example, and the rest of the code matches the video."
    },
    {
      "t": "p",
      "zh": "[▶ 03:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=38&t=220) 先定义两个**模拟**工具：一个「在 QQ 音乐上播放」，一个「在网易云音乐上播放」。它们不会真的去调音乐 App 的接口，只是输入歌名、返回一句「播放成功」，好让我们看清流程。[▶ 04:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=38&t=251) 然后搭一个最简单的智能体：\n- `agent` 节点（函数 `call_model`）：用绑定了工具的模型回答\n- `action` 节点：`ToolNode(tools)`，执行最后一条消息里的工具调用（39 节会详细讲）\n- 条件边 `should_continue`：最后一条消息没有 `tool_calls` 就返回 `\"end\"`，有就返回 `\"continue\"`；第三个参数的字典把这两个字符串对应到真正的去处（`\"continue\"` → `action`，`\"end\"` → `END`）\n- `action → agent`：工具结果交回模型\n- 编译时传入 `checkpointer`，这是时光旅行的前提",
      "en": "[▶ 03:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=38&t=220) First, two **mock** tools: one “plays on QQ Music”, the other “plays on NetEase Cloud Music”. They don't call any music app; they take a song name and return a “played successfully” line, so the flow is easy to follow. [▶ 04:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=38&t=251) Then the simplest possible agent:\n- the `agent` node (function `call_model`): answers with the tool-bound model\n- the `action` node: `ToolNode(tools)`, which runs the tool calls in the last message (lesson 39 covers it in detail)\n- the conditional edge `should_continue`: returns `\"end\"` if the last message has no `tool_calls`, otherwise `\"continue\"`; the dict in the third argument maps those strings to real destinations (`\"continue\"` → `action`, `\"end\"` → `END`)\n- `action → agent`: tool results go back to the model\n- compile with a `checkpointer` – the precondition for time travel"
    },
    {
      "t": "code",
      "file": "time_travel.py",
      "code": {
        "zh": "from langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom langgraph.prebuilt import ToolNode\nfrom llm import API_KEY, MODEL\n\n@tool\ndef play_song_on_qq(song: str):\n    \"\"\"在 QQ 音乐上播放一首歌。\"\"\"\n    return f\"成功在 QQ 音乐上播放了《{song}》\"      # 模拟：并没有真的调用 QQ 音乐\n\n@tool\ndef play_song_on_163(song: str):\n    \"\"\"在网易云音乐上播放一首歌。\"\"\"\n    return f\"成功在网易云音乐上播放了《{song}》\"\n\ntools = [play_song_on_qq, play_song_on_163]\ntool_node = ToolNode(tools)\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)   # 视频里是 OpenAI 的 GPT-4o\nmodel = model.bind_tools(tools)\n\ndef should_continue(state: MessagesState):\n    last_message = state[\"messages\"][-1]\n    if not last_message.tool_calls:      # 没有工具调用：结束\n        return \"end\"\n    return \"continue\"                    # 有工具调用：去执行\n\ndef call_model(state: MessagesState):\n    response = model.invoke(state[\"messages\"])\n    return {\"messages\": [response]}\n\nworkflow = StateGraph(MessagesState)\nworkflow.add_node(\"agent\", call_model)\nworkflow.add_node(\"action\", tool_node)\nworkflow.add_edge(START, \"agent\")\nworkflow.add_conditional_edges(\"agent\", should_continue, {\"continue\": \"action\", \"end\": END})\nworkflow.add_edge(\"action\", \"agent\")\napp = workflow.compile(checkpointer=InMemorySaver())   # 没有 checkpointer 就没有历史可回",
        "en": "from langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom langgraph.prebuilt import ToolNode\nfrom llm import API_KEY, MODEL\n\n@tool\ndef play_song_on_qq(song: str):\n    \"\"\"Play a song on QQ Music.\"\"\"\n    return f\"Played {song} on QQ Music\"         # mock: QQ Music is not really called\n\n@tool\ndef play_song_on_163(song: str):\n    \"\"\"Play a song on NetEase Cloud Music.\"\"\"\n    return f\"Played {song} on NetEase Cloud Music\"\n\ntools = [play_song_on_qq, play_song_on_163]\ntool_node = ToolNode(tools)\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)   # the video uses OpenAI's GPT-4o\nmodel = model.bind_tools(tools)\n\ndef should_continue(state: MessagesState):\n    last_message = state[\"messages\"][-1]\n    if not last_message.tool_calls:      # no tool calls: finish\n        return \"end\"\n    return \"continue\"                    # tool calls: go and run them\n\ndef call_model(state: MessagesState):\n    response = model.invoke(state[\"messages\"])\n    return {\"messages\": [response]}\n\nworkflow = StateGraph(MessagesState)\nworkflow.add_node(\"agent\", call_model)\nworkflow.add_node(\"action\", tool_node)\nworkflow.add_edge(START, \"agent\")\nworkflow.add_conditional_edges(\"agent\", should_continue, {\"continue\": \"action\", \"end\": END})\nworkflow.add_edge(\"action\", \"agent\")\napp = workflow.compile(checkpointer=InMemorySaver())   # no checkpointer, no history to go back to"
      }
    },
    {
      "t": "note",
      "zh": "视频里写的是 `from langgraph.checkpoint.memory import MemorySaver`。现在推荐用 `InMemorySaver`；旧名字 `MemorySaver` 仍然能导入，两者是同一个类（在 LangGraph 1.2.12 里验证过）。",
      "en": "The video writes `from langgraph.checkpoint.memory import MemorySaver`. The recommended name is now `InMemorySaver`; the old name `MemorySaver` still imports and is the very same class (checked with LangGraph 1.2.12)."
    },
    {
      "t": "h",
      "zh": "三、先正常运行一次",
      "en": "3. Run it once"
    },
    {
      "t": "p",
      "zh": "[▶ 05:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=38&t=312) 和 30–31 节一样，用 `config` 指定 `thread_id`，然后提问「你能播放一首周杰伦播放量最高的歌吗？」。用 `stream_mode=\"values\"`（38 节细讲）每走一步就打印最新的那条消息：",
      "en": "[▶ 05:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=38&t=312) As in lessons 30–31, set a `thread_id` in `config`, then ask “Can you play Jay Chou's most-played song?”. With `stream_mode=\"values\"` (details in lesson 38) the newest message is printed after every step:"
    },
    {
      "t": "code",
      "file": "time_travel.py",
      "code": {
        "zh": "config = {\"configurable\": {\"thread_id\": \"1\"}}\nquestion = {\"role\": \"user\", \"content\": \"你能播放一首周杰伦播放量最高的歌吗？\"}\n\nfor event in app.stream({\"messages\": [question]}, config, stream_mode=\"values\"):\n    event[\"messages\"][-1].pretty_print()        # 每走一步，打印最新的那条消息",
        "en": "config = {\"configurable\": {\"thread_id\": \"1\"}}\nquestion = {\"role\": \"user\", \"content\": \"Can you play Jay Chou's most-played song?\"}\n\nfor event in app.stream({\"messages\": [question]}, config, stream_mode=\"values\"):\n    event[\"messages\"][-1].pretty_print()        # after every step, print the newest message"
      }
    },
    {
      "t": "p",
      "zh": "视频里模型选了 `play_song_on_qq`，歌名填「晴天」；工具返回播放成功后，模型再总结一句已经在 QQ 音乐上为你播放了《晴天》。DeepSeek 的真实运行结果几乎一样（`practice/l37_time_travel_solution.py`，有删节）：",
      "en": "In the video the model picks `play_song_on_qq` with the song “Sunny Day”; after the tool reports success, the model sums up that it is now playing the song on QQ Music. A real DeepSeek run looks almost the same (`practice/l37_time_travel_solution.py`, trimmed and translated):"
    },
    {
      "t": "code",
      "file": "output",
      "lang": "text",
      "code": {
        "zh": "================================ Human Message =================================\n你能播放一首周杰伦播放量最高的歌吗？\n================================== Ai Message ==================================\n我猜你想听的是《晴天》——它常年是周杰伦在各大平台上播放量和评论数最高的歌。这就帮你放上。\nTool Calls:\n  play_song_on_qq (call_00_K50U…)\n  Args:\n    song: 晴天 周杰伦\n================================= Tool Message =================================\nName: play_song_on_qq\n成功在 QQ 音乐上播放了《晴天 周杰伦》\n================================== Ai Message ==================================\n已在 QQ 音乐上为你播放周杰伦的《晴天》🎵\n……",
        "en": "================================ Human Message =================================\nCan you play Jay Chou's most-played song?\n================================== Ai Message ==================================\nI guess you mean \"Sunny Day\" - for years it has been Jay Chou's most-played and most-commented song on the big platforms. Playing it for you now.\nTool Calls:\n  play_song_on_qq (call_00_K50U…)\n  Args:\n    song: Sunny Day Jay Chou\n================================= Tool Message =================================\nName: play_song_on_qq\nPlayed Sunny Day Jay Chou on QQ Music\n================================== Ai Message ==================================\nNow playing Jay Chou's \"Sunny Day\" on QQ Music 🎵\n…"
      }
    },
    {
      "t": "h",
      "zh": "四、查看状态和历史",
      "en": "4. Inspect the state and the history"
    },
    {
      "t": "p",
      "zh": "[▶ 06:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=38&t=373) `app.get_state(config)` 返回这个线程**当前**的状态快照，`.values` 就是状态本身（这里是 4 条消息）。`app.get_state_history(config)` 则把**每一步**的快照都翻出来，最新的在前。老师把每个快照比作一张「截图」：记下了那一刻每个节点留下的结果。视频里把它们逐个放进列表 `all_states`（列表的 `append` 见 06 节），方便后面用下标挑一个：",
      "en": "[▶ 06:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=38&t=373) `app.get_state(config)` returns the thread's **current** snapshot; `.values` is the state itself (4 messages here). `app.get_state_history(config)` brings back the snapshot of **every** step, newest first. The instructor likens each snapshot to a screenshot of what every node had produced at that moment. The video puts them one by one into a list, `all_states` (list `append`: lesson 06), so one can be picked by index later:"
    },
    {
      "t": "code",
      "file": "time_travel.py",
      "code": {
        "zh": "print(len(app.get_state(config).values[\"messages\"]))   # 当前状态：4 条消息\n\nall_states = []\nfor state in app.get_state_history(config):        # 从新到旧\n    print(state.metadata[\"step\"], state.next)\n    all_states.append(state)\n# 3 ()\n# 2 ('agent',)\n# 1 ('action',)\n# 0 ('agent',)\n# -1 ('__start__',)",
        "en": "print(len(app.get_state(config).values[\"messages\"]))   # current state: 4 messages\n\nall_states = []\nfor state in app.get_state_history(config):        # newest first\n    print(state.metadata[\"step\"], state.next)\n    all_states.append(state)\n# 3 ()\n# 2 ('agent',)\n# 1 ('action',)\n# 0 ('agent',)\n# -1 ('__start__',)"
      }
    },
    {
      "t": "p",
      "zh": "[▶ 06:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=38&t=403) 一次完整的对话留下了 **5** 个快照（老师数的「1 2 3 4 5 五个状态」）：\n\n| 下标 | step | next（下一步） | 此时的 messages | 说明 |\n|---|---|---|---|---|\n| `all_states[0]` | 3 | `()` | 4 条 | 全部跑完（最新） |\n| `all_states[1]` | 2 | `('agent',)` | 3 条 | 工具已执行，等模型总结 |\n| `all_states[2]` | 1 | `('action',)` | 2 条 | 模型刚发出工具调用，**工具还没执行** |\n| `all_states[3]` | 0 | `('agent',)` | 1 条 | 只有用户的问题 |\n| `all_states[4]` | -1 | `('__start__',)` | 0 条 | 输入 |\n\n快照常用的属性：\n- `values`：那一刻的状态\n- `next`：接下来要运行的节点。它是元组（31 节 Python 小课堂）：单元素写作 `('action',)`，空元组 `()` 表示跑完了\n- `config`：指向这个检查点的配置，里面有 `checkpoint_id`，时光旅行就靠它\n- `metadata`：`step` 是第几步，`source` 说明它是怎么来的（`input`、`loop`、`update`、`fork`）",
      "en": "[▶ 06:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=38&t=403) One complete conversation leaves **5** snapshots (the instructor counts “1 2 3 4 5, five states”):\n\n| Index | step | next | messages at that point | Meaning |\n|---|---|---|---|---|\n| `all_states[0]` | 3 | `()` | 4 | finished (newest) |\n| `all_states[1]` | 2 | `('agent',)` | 3 | tool has run; the model will sum up |\n| `all_states[2]` | 1 | `('action',)` | 2 | the model has just asked for a tool; **the tool has not run yet** |\n| `all_states[3]` | 0 | `('agent',)` | 1 | only the user's question |\n| `all_states[4]` | -1 | `('__start__',)` | 0 | the input |\n\nUseful snapshot attributes:\n- `values`: the state at that moment\n- `next`: the nodes to run next. It is a tuple (see the Python mini-lesson in lesson 31): one item is written `('action',)`, and the empty tuple `()` means the run has finished\n- `config`: the config pointing at this checkpoint, including its `checkpoint_id` – time travel relies on it\n- `metadata`: `step` is the step number, `source` says how it was made (`input`, `loop`, `update`, `fork`)"
    },
    {
      "t": "check",
      "q": {
        "zh": "想从「模型发出了工具调用、但工具还没执行」那一刻重新开始，应该选哪个快照？",
        "en": "You want to restart from the moment the model has asked for a tool but the tool has not run yet. Which snapshot?"
      },
      "options": [
        {
          "zh": "`all_states[0]`",
          "en": "`all_states[0]`"
        },
        {
          "zh": "`all_states[2]`，它的 `next` 是 `('action',)`",
          "en": "`all_states[2]`, whose `next` is `('action',)`"
        },
        {
          "zh": "`all_states[4]`",
          "en": "`all_states[4]`"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "历史是从新到旧排的。`next` 为 `('action',)` 说明下一步是执行工具，也就是工具还没执行。`[0]` 是已经跑完的最新快照，`[4]` 是最初的输入。",
        "en": "The history is newest-first. `next == ('action',)` means running the tool comes next, so it hasn't run yet. `[0]` is the finished newest snapshot and `[4]` is the original input."
      }
    },
    {
      "t": "h",
      "zh": "五、重放：从过去的某一步再执行一遍",
      "en": "5. Replay: run again from a past step"
    },
    {
      "t": "p",
      "zh": "[▶ 07:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=38&t=436) 老师选了下标为 2 的快照 `all_states[2]`。看它的 `values`，状态停在模型发出工具调用的那一刻；看它的 `next`，下一步是 `action`。[▶ 07:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=38&t=467) 重放只要把这个快照的 `config` 传进去，输入写 `None`（不给新输入，从这个检查点接着跑）：",
      "en": "[▶ 07:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=38&t=436) The instructor picks the snapshot at index 2, `all_states[2]`. Its `values` stop at the moment the model asked for a tool; its `next` says `action` comes next. [▶ 07:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=38&t=467) To replay, pass that snapshot's `config` and use `None` as the input (no new input, carry on from this checkpoint):"
    },
    {
      "t": "code",
      "file": "time_travel.py",
      "code": {
        "zh": "to_replay = all_states[2]\nprint(to_replay.next)                  # ('action',)：下一步是执行工具\n\n# 输入写 None（不给新输入），config 用过去那个快照的\nfor event in app.stream(None, to_replay.config, stream_mode=\"values\"):\n    event[\"messages\"][-1].pretty_print()",
        "en": "to_replay = all_states[2]\nprint(to_replay.next)                  # ('action',): running the tool comes next\n\n# input None (no new input), config of the past snapshot\nfor event in app.stream(None, to_replay.config, stream_mode=\"values\"):\n    event[\"messages\"][-1].pretty_print()"
      }
    },
    {
      "t": "p",
      "zh": "输出从那条带工具调用的 AI 消息开始（它来自快照，不是新生成的），然后 `action` 再执行一次工具，`agent` 再调用一次模型。检查点**之前**的步骤（用户提问、模型决定调用哪个工具）不会重跑。真实运行中，重放后模型写的总结和第一次不一样，说明它确实又被调用了一次：",
      "en": "The output starts with the AI message holding the tool call (it comes from the snapshot, it is not new), then `action` runs the tool again and `agent` calls the model again. Steps **before** the checkpoint (the question, the model's choice of tool) do not rerun. In the real run the model's summary after the replay differs from the first one – proof that it really was called again:"
    },
    {
      "t": "code",
      "file": "output",
      "lang": "text",
      "code": {
        "zh": "================================== Ai Message ==================================\n我猜你想听的是《晴天》……这就帮你放上。\nTool Calls:\n  play_song_on_qq (call_00_K50U…)\n  Args:\n    song: 晴天 周杰伦\n================================= Tool Message =================================\nName: play_song_on_qq\n成功在 QQ 音乐上播放了《晴天 周杰伦》\n================================== Ai Message ==================================\n已经在 QQ 音乐上开始播放《晴天》啦 🎵\n……",
        "en": "================================== Ai Message ==================================\nI guess you mean \"Sunny Day\"… Playing it for you now.\nTool Calls:\n  play_song_on_qq (call_00_K50U…)\n  Args:\n    song: Sunny Day Jay Chou\n================================= Tool Message =================================\nName: play_song_on_qq\nPlayed Sunny Day Jay Chou on QQ Music\n================================== Ai Message ==================================\n\"Sunny Day\" is now playing on QQ Music 🎵\n…"
      }
    },
    {
      "t": "warn",
      "zh": "重放会把检查点之后的节点**真的再执行一遍**：模型要再调用（再花一次钱，回答也可能不同），工具也会再执行。如果工具真能放歌，歌就会再放一次；如果是发消息、写数据库、付款，也会再发生一次。",
      "en": "Replay **really runs every node after the checkpoint again**: the model is called (and billed) again and may answer differently, and the tools run again. If the tool really played music, the song would play again; if it sent a message, wrote to a database or made a payment, that would happen again too."
    },
    {
      "t": "note",
      "zh": "重放不会覆盖原来的历史：LangGraph 先把那个检查点复制一份（`metadata[\"source\"]` 是 `\"fork\"`），再从复制品往下跑。重放之后再看 `get_state_history`，原来的 5 个快照都还在。",
      "en": "Replay does not overwrite the old history: LangGraph first copies that checkpoint (`metadata[\"source\"]` is `\"fork\"`) and runs on from the copy. After a replay, `get_state_history` still shows the original 5 snapshots."
    },
    {
      "t": "h",
      "zh": "六、分叉：改掉过去的数据，换一条路走",
      "en": "6. Fork: change the past data and take another path"
    },
    {
      "t": "p",
      "zh": "[▶ 08:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=38&t=498) 分叉接着上面的例子。[▶ 08:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=38&t=529) 从 `to_replay` 里取出最后一条消息，也就是那条带工具调用的 AI 消息，把第一个工具调用的名字从 `play_song_on_qq` 改成 `play_song_on_163`；再用 `update_state` 把改过的消息写回这个检查点，然后从它返回的新 config 继续：",
      "en": "[▶ 08:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=38&t=498) The fork continues the same example. [▶ 08:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=38&t=529) Take the last message of `to_replay` – the AI message with the tool call – and rename its first tool call from `play_song_on_qq` to `play_song_on_163`. Write the edited message back to that checkpoint with `update_state`, then continue from the new config it returns:"
    },
    {
      "t": "code",
      "file": "time_travel.py",
      "code": {
        "zh": "last_message = to_replay.values[\"messages\"][-1]          # 那条带工具调用的 AI 消息\nlast_message.tool_calls[0][\"name\"] = \"play_song_on_163\"  # 把 QQ 音乐改成网易云音乐\n\nbranch_config = app.update_state(to_replay.config, {\"messages\": [last_message]})\n\nfor event in app.stream(None, branch_config, stream_mode=\"values\"):   # 从新的检查点继续\n    event[\"messages\"][-1].pretty_print()",
        "en": "last_message = to_replay.values[\"messages\"][-1]          # the AI message with the tool call\nlast_message.tool_calls[0][\"name\"] = \"play_song_on_163\"  # switch QQ Music to NetEase Cloud Music\n\nbranch_config = app.update_state(to_replay.config, {\"messages\": [last_message]})\n\nfor event in app.stream(None, branch_config, stream_mode=\"values\"):   # continue from the new checkpoint\n    event[\"messages\"][-1].pretty_print()"
      }
    },
    {
      "t": "code",
      "file": "output",
      "lang": "text",
      "code": {
        "zh": "================================== Ai Message ==================================\n我猜你想听的是《晴天》……这就帮你放上。\nTool Calls:\n  play_song_on_163 (call_00_K50U…)\n  Args:\n    song: 晴天 周杰伦\n================================= Tool Message =================================\nName: play_song_on_163\n成功在网易云音乐上播放了《晴天 周杰伦》\n================================== Ai Message ==================================\n已经帮你在网易云音乐上播放《晴天》（周杰伦）🎵\n……",
        "en": "================================== Ai Message ==================================\nI guess you mean \"Sunny Day\"… Playing it for you now.\nTool Calls:\n  play_song_on_163 (call_00_K50U…)\n  Args:\n    song: Sunny Day Jay Chou\n================================= Tool Message =================================\nName: play_song_on_163\nPlayed Sunny Day Jay Chou on NetEase Cloud Music\n================================== Ai Message ==================================\n\"Sunny Day\" (Jay Chou) is now playing for you on NetEase Cloud Music 🎵\n…"
      }
    },
    {
      "t": "p",
      "zh": "[▶ 09:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=38&t=561) 和视频里一样：工具调用变成了 `play_song_on_163`，后面的执行路径跟着改变，最后在网易云音乐上播放。几个要点：\n- `update_state` **不修改**原来的检查点，而是在它后面新建一个（`source` 为 `update`），并返回指向新检查点的 config。要从**返回的** `branch_config` 继续；还用 `to_replay.config` 的话，只是把没改过的版本重放一遍\n- messages 里为什么没有多出一条？`MessagesState` 的 reducer `add_messages` 遇到 **id 相同**的消息会**替换**，不会追加（36 节讲过）。改过的消息还是原来的 id，所以它顶替了原来那条\n- `update_state` 默认把这次修改算在「最后运行的节点」（这里是 `agent`）名下，所以下一步仍然是 `action`，执行的正是改过的工具调用",
      "en": "[▶ 09:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=38&t=561) Just as in the video, the tool call is now `play_song_on_163`, the rest of the run follows a different path, and the song plays on NetEase Cloud Music. Key points:\n- `update_state` does **not modify** the old checkpoint; it creates a new one after it (`source` is `update`) and returns a config pointing at it. Continue from the **returned** `branch_config`; using `to_replay.config` would just replay the unchanged version\n- Why is there no extra message? The `add_messages` reducer of `MessagesState` **replaces** a message with the **same id** instead of appending (lesson 36). The edited message keeps its id, so it takes the old one's place\n- By default `update_state` records the change as written by the last node that ran (`agent` here), so `action` still comes next and runs the edited tool call"
    },
    {
      "t": "check",
      "q": {
        "zh": "`branch_config = app.update_state(to_replay.config, {...})` 之后，想让修改生效并继续运行，应该写？",
        "en": "After `branch_config = app.update_state(to_replay.config, {...})`, how do you continue with the change applied?"
      },
      "options": [
        {
          "zh": "`app.stream(None, to_replay.config)`",
          "en": "`app.stream(None, to_replay.config)`"
        },
        {
          "zh": "`app.stream({\"messages\": [last_message]}, config)`",
          "en": "`app.stream({\"messages\": [last_message]}, config)`"
        },
        {
          "zh": "`app.stream(None, branch_config)`",
          "en": "`app.stream(None, branch_config)`"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "修改存在 `update_state` 新建的检查点里，要从它返回的 `branch_config` 继续。用 `to_replay.config` 只是重放没改过的检查点；传新输入则会当成新一轮对话从 START 开始。",
        "en": "The change lives in the new checkpoint `update_state` created, so continue from the `branch_config` it returned. `to_replay.config` would only replay the unchanged checkpoint; a new input starts a new turn from START."
      }
    },
    {
      "t": "py",
      "title": {
        "zh": "名字只是标签：改的是同一个对象",
        "en": "Names are labels: you are changing the same object"
      },
      "zh": "分叉代码里 `last_message = to_replay.values[\"messages\"][-1]` 并**没有复制**那条消息，只是给同一个对象多贴了一个名字。所以执行 `last_message.tool_calls[0][\"name\"] = ...` 之后，从 `to_replay.values` 里看到的也是改过的版本。\n- `a = b`：不复制，`a` 和 `b` 指向同一个对象；对里面嵌套的列表、字典**原地修改**，从哪个名字看都变了\n- `a is b` 判断是不是**同一个对象**；`a == b` 判断**内容**是否相等\n- 想保留原样再改，先用 `copy.deepcopy(x)` 做一份完整的副本\n- 回顾 06 节：`append`、`x[...] = ...` 这类原地修改会影响所有指向它的名字；重新赋值 `b = 新东西` 只是让 `b` 换了个对象\n\n不用担心弄坏历史：检查点存在 checkpointer 里，`get_state_history` 每次交给你的都是重新读出来的副本，这样改不会悄悄改掉已保存的检查点。要真正写进去，靠的是 `update_state`。",
      "en": "In the fork code, `last_message = to_replay.values[\"messages\"][-1]` does **not copy** the message; it just puts a second name on the same object. So after `last_message.tool_calls[0][\"name\"] = ...`, `to_replay.values` shows the edited version too.\n- `a = b` copies nothing: `a` and `b` name the same object; **changing** a nested list or dict **in place** is visible through either name\n- `a is b` asks whether they are **the same object**; `a == b` asks whether their **contents** are equal\n- To keep the original before editing, make a full copy first with `copy.deepcopy(x)`\n- Recall lesson 06: in-place changes such as `append` or `x[...] = ...` affect every name for the object; reassigning `b = something_else` only makes `b` name another object\n\nYour saved history is safe: checkpoints live in the checkpointer, and `get_state_history` hands you freshly loaded copies, so editing them does not secretly change a saved checkpoint. Writing a change back is what `update_state` is for.",
      "code": {
        "zh": "import copy\n\nsnapshot = {\"messages\": [\n    {\"role\": \"user\", \"content\": \"放一首周杰伦的歌\"},\n    {\"role\": \"assistant\", \"tool_calls\": [{\"name\": \"play_song_on_qq\", \"args\": {\"song\": \"晴天\"}}]},\n]}\n\nlast_message = snapshot[\"messages\"][-1]          # 没有复制：同一个字典多了一个名字\nprint(last_message is snapshot[\"messages\"][-1])  # True\n\nbackup = copy.deepcopy(last_message)             # 完整副本：之后怎么改都不影响它\nlast_message[\"tool_calls\"][0][\"name\"] = \"play_song_on_163\"\n\nprint(snapshot[\"messages\"][-1][\"tool_calls\"][0][\"name\"])   # play_song_on_163：原来的名字看过去也变了\nprint(backup[\"tool_calls\"][0][\"name\"])                     # play_song_on_qq：副本没变\nprint(backup == last_message, backup is last_message)      # False False\n\na = [1, 2]\nb = a              # 同一个列表，两个名字\nb.append(3)        # 原地修改\nprint(a)           # [1, 2, 3]\nb = [9]            # 重新赋值：b 换成另一个对象，a 不受影响\nprint(a, b)        # [1, 2, 3] [9]",
        "en": "import copy\n\nsnapshot = {\"messages\": [\n    {\"role\": \"user\", \"content\": \"Play a Jay Chou song\"},\n    {\"role\": \"assistant\", \"tool_calls\": [{\"name\": \"play_song_on_qq\", \"args\": {\"song\": \"Sunny Day\"}}]},\n]}\n\nlast_message = snapshot[\"messages\"][-1]          # no copy: one dict, now with a second name\nprint(last_message is snapshot[\"messages\"][-1])  # True\n\nbackup = copy.deepcopy(last_message)             # a full copy: later changes never touch it\nlast_message[\"tool_calls\"][0][\"name\"] = \"play_song_on_163\"\n\nprint(snapshot[\"messages\"][-1][\"tool_calls\"][0][\"name\"])   # play_song_on_163: changed through the old name too\nprint(backup[\"tool_calls\"][0][\"name\"])                     # play_song_on_qq: the copy is unchanged\nprint(backup == last_message, backup is last_message)      # False False\n\na = [1, 2]\nb = a              # one list, two names\nb.append(3)        # change in place\nprint(a)           # [1, 2, 3]\nb = [9]            # reassignment: b now names another object; a is untouched\nprint(a, b)        # [1, 2, 3] [9]"
      }
    },
    {
      "t": "h",
      "zh": "七、小结：两个核心方法",
      "en": "7. Wrap-up: the two key methods"
    },
    {
      "t": "p",
      "zh": "[▶ 09:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=38&t=592) 老师的总结：通过分叉可以动态改变图里的数据，LangGraph 在这方面非常灵活，尤其是干预工具调用的时候。要记住的核心有两个：**`update_state`**（更新图的状态）和 **`get_state_history`**（拿到运行历史）。\n\n| 想做什么 | 写法 |\n|---|---|\n| 看当前状态 | `app.get_state(config)` |\n| 看全部历史（从新到旧） | `app.get_state_history(config)` |\n| 重放 | `app.stream(None, 过去的快照.config)`（用 `invoke` 也可以） |\n| 分叉 | `new_config = app.update_state(过去的快照.config, {...})`，再 `app.stream(None, new_config)` |",
      "en": "[▶ 09:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=38&t=592) The instructor's summary: forking lets you change the graph's data on the fly, and LangGraph is very flexible here, especially for stepping into tool calls. The two things to remember are **`update_state`** (update the graph's state) and **`get_state_history`** (get the run history).\n\n| Goal | Code |\n|---|---|\n| See the current state | `app.get_state(config)` |\n| See the whole history (newest first) | `app.get_state_history(config)` |\n| Replay | `app.stream(None, past_snapshot.config)` (`invoke` works too) |\n| Fork | `new_config = app.update_state(past_snapshot.config, {...})`, then `app.stream(None, new_config)` |"
    },
    {
      "t": "note",
      "zh": "补充：做完一次重放、一次分叉后再打印历史，会看到 11 个快照：最初的 5 个一个不少，又多出了重放和分叉两条分支。每个快照的 `parent_config` 指向它的上一个，所以历史其实是一棵**树**。`app.get_state(config)`（只带 `thread_id`）拿到的永远是最新那条分支的最后一个快照。`InMemorySaver` 存在内存里，程序一结束就没了；想以后还能回来，要用持久化的 checkpointer（比如 32 节的 `SqliteSaver`），并记下检查点的 `checkpoint_id`。",
      "en": "Extra: after one replay and one fork, the history holds 11 snapshots – the original 5 are all still there, plus two new branches. Each snapshot's `parent_config` points at the one before it, so the history is really a **tree**. `app.get_state(config)` (with just the `thread_id`) always returns the last snapshot of the newest branch. `InMemorySaver` lives in memory and is gone when the program ends; to come back later, use a persistent checkpointer (such as `SqliteSaver` from lesson 32) and keep the `checkpoint_id`."
    },
    {
      "t": "tip",
      "zh": "想免费地反复试重放和分叉？`practice/l37_time_travel.py` 用固定规则的「模拟模型」代替 DeepSeek，图的结构和视频完全一样，运行时还会打印每个节点和工具，能清楚看到重放时哪些步骤又执行了一遍。",
      "en": "Want to try replay and fork as often as you like for free? `practice/l37_time_travel.py` swaps DeepSeek for a rule-based fake model; the graph is exactly the video's, and it prints every node and tool as it runs, so you can see which steps run again during a replay."
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "想使用时光旅行，下面哪一项是**必须**的？",
        "en": "Which of these is **required** for time travel?"
      },
      "options": [
        {
          "zh": "状态必须是 `MessagesState`",
          "en": "The state must be `MessagesState`"
        },
        {
          "zh": "编译时传入 checkpointer，运行时 config 里带 `thread_id`",
          "en": "Compile with a checkpointer and run with a `thread_id` in the config"
        },
        {
          "zh": "图里必须有 `interrupt`",
          "en": "The graph must contain an `interrupt`"
        },
        {
          "zh": "必须用 GPT-4o",
          "en": "You must use GPT-4o"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "历史就是 checkpointer 按线程保存的快照。没有 checkpointer 就没有历史；没有 `thread_id` 就不知道查哪个线程。",
        "en": "The history is the snapshots a checkpointer saves per thread. No checkpointer, no history; no `thread_id`, no thread to look up."
      }
    },
    {
      "q": {
        "zh": "一次完整的放歌对话后，`all_states` 里有 5 个快照。`all_states[0]` 是哪一个？",
        "en": "After one complete music request, `all_states` holds 5 snapshots. Which one is `all_states[0]`?"
      },
      "options": [
        {
          "zh": "最初的输入快照（step 为 -1）",
          "en": "The original input snapshot (step -1)"
        },
        {
          "zh": "模型刚发出工具调用时的快照",
          "en": "The snapshot right after the model asked for a tool"
        },
        {
          "zh": "只有用户问题时的快照",
          "en": "The snapshot with only the user's question"
        },
        {
          "zh": "最新的快照，`next` 是 `()`，图已经跑完",
          "en": "The newest snapshot: `next` is `()` and the run has finished"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "`get_state_history` 从新到旧给出快照，所以 `[0]` 是最新的、已经跑完的那一个，`[-1]` 才是最初的输入。",
        "en": "`get_state_history` yields snapshots newest first, so `[0]` is the newest, finished one and `[-1]` is the original input."
      }
    },
    {
      "q": {
        "zh": "执行 `app.stream(None, all_states[2].config)` 重放时，哪些步骤会真的再执行？",
        "en": "When you replay with `app.stream(None, all_states[2].config)`, which steps really run again?"
      },
      "options": [
        {
          "zh": "`action` 再执行一次工具，然后 `agent` 再调用一次模型",
          "en": "`action` runs the tool again, then `agent` calls the model again"
        },
        {
          "zh": "从 START 开始全部重跑",
          "en": "Everything again from START"
        },
        {
          "zh": "都不执行，直接返回当时保存的结果",
          "en": "Nothing – the saved result is returned"
        },
        {
          "zh": "只有模型决定调用哪个工具的那一步",
          "en": "Only the step where the model chose the tool"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "快照之前的步骤已经保存，不会重跑；快照之后的节点（这里是 action 和 agent）会真的执行，模型和工具都会再被调用。",
        "en": "Steps before the snapshot are saved and do not rerun; the nodes after it (action and agent here) really run, so the tool and the model are called again."
      }
    },
    {
      "q": {
        "zh": "分叉时，`branch_config = app.update_state(to_replay.config, {...})` 这一行刚执行完（还没有调用 `stream`），发生了什么？",
        "en": "When forking, `branch_config = app.update_state(to_replay.config, {...})` has just run (no `stream` yet). What has happened?"
      },
      "options": [
        {
          "zh": "后面的节点已经运行完，歌已经在网易云音乐上播放了",
          "en": "The remaining nodes have run and the song is already playing on NetEase"
        },
        {
          "zh": "原来那个检查点被改掉了，历史里再也找不到 QQ 音乐的版本",
          "en": "The old checkpoint was overwritten; the QQ Music version is gone from the history"
        },
        {
          "zh": "新建了一个检查点（`source` 为 `update`），里面是改过的消息；还没有运行任何节点",
          "en": "A new checkpoint (`source` is `update`) holding the edited message was created; no node has run yet"
        },
        {
          "zh": "报错：只能修改最新的检查点",
          "en": "An error: only the newest checkpoint can be changed"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "`update_state` 只写入状态、新建检查点，不运行节点，旧检查点也原样保留。要从它返回的 `branch_config` 用 `app.stream(None, branch_config)` 继续，后面的节点才会运行。",
        "en": "`update_state` only writes the state into a new checkpoint; it runs nothing and leaves the old checkpoint as it was. The remaining nodes run only when you continue with `app.stream(None, branch_config)`."
      }
    },
    {
      "q": {
        "zh": "用 `update_state` 写回改过工具名的那条 AI 消息后，状态里的消息条数会怎样？",
        "en": "After writing the AI message with the renamed tool back with `update_state`, what happens to the number of messages?"
      },
      "options": [
        {
          "zh": "多出一条，因为 `add_messages` 总是追加",
          "en": "One more, because `add_messages` always appends"
        },
        {
          "zh": "不变：这条消息的 id 和原来的相同，`add_messages` 会替换掉原来那条",
          "en": "Unchanged: the message keeps its id, so `add_messages` replaces the old one"
        },
        {
          "zh": "全部清空",
          "en": "All messages are cleared"
        },
        {
          "zh": "报错：不能修改已经保存的消息",
          "en": "An error: saved messages cannot be changed"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "`add_messages` 按 id 判断：新 id 追加，已有的 id 替换。所以分叉后那条 AI 消息被换成了改过的版本。",
        "en": "`add_messages` looks at ids: a new id is appended, an existing id is replaced. So the AI message is swapped for the edited version."
      }
    },
    {
      "q": {
        "zh": "`last_message = to_replay.values[\"messages\"][-1]` 之后执行 `last_message.tool_calls[0][\"name\"] = \"play_song_on_163\"`。这时 `to_replay.values[\"messages\"][-1]` 里的工具名是？",
        "en": "After `last_message = to_replay.values[\"messages\"][-1]` you run `last_message.tool_calls[0][\"name\"] = \"play_song_on_163\"`. What tool name does `to_replay.values[\"messages\"][-1]` now show?"
      },
      "options": [
        {
          "zh": "还是 `play_song_on_qq`，因为 `last_message` 是一份副本",
          "en": "Still `play_song_on_qq`, because `last_message` is a copy"
        },
        {
          "zh": "报错：快照不能修改",
          "en": "An error: snapshots cannot be changed"
        },
        {
          "zh": "`None`",
          "en": "`None`"
        },
        {
          "zh": "`play_song_on_163`：两个名字指向同一个对象",
          "en": "`play_song_on_163`: both names refer to the same object"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "赋值不会复制对象，原地修改从哪个名字看都一样。想保留原样要先 `copy.deepcopy`。",
        "en": "Assignment copies nothing, and an in-place change shows through every name. Use `copy.deepcopy` first to keep the original."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "搭图并收集历史",
        "en": "Build the graph and collect the history"
      },
      "code": {
        "zh": "workflow = StateGraph(MessagesState)\nworkflow.add_node(\"agent\", call_model)\nworkflow.add_node(\"action\", [[ToolNode]](tools))\nworkflow.add_edge(START, \"agent\")\nworkflow.add_conditional_edges(\"agent\", should_continue, {\"continue\": \"[[action]]\", \"end\": [[END]]})\nworkflow.add_edge(\"action\", \"agent\")\napp = workflow.compile([[checkpointer]]=InMemorySaver())\n\nconfig = {\"configurable\": {\"[[thread_id]]\": \"1\"}}\napp.invoke({\"messages\": [question]}, config)\n\nall_states = []\nfor state in app.[[get_state_history]](config):\n    all_states.[[append]](state)",
        "en": "workflow = StateGraph(MessagesState)\nworkflow.add_node(\"agent\", call_model)\nworkflow.add_node(\"action\", [[ToolNode]](tools))\nworkflow.add_edge(START, \"agent\")\nworkflow.add_conditional_edges(\"agent\", should_continue, {\"continue\": \"[[action]]\", \"end\": [[END]]})\nworkflow.add_edge(\"action\", \"agent\")\napp = workflow.compile([[checkpointer]]=InMemorySaver())\n\nconfig = {\"configurable\": {\"[[thread_id]]\": \"1\"}}\napp.invoke({\"messages\": [question]}, config)\n\nall_states = []\nfor state in app.[[get_state_history]](config):\n    all_states.[[append]](state)"
      },
      "explain": {
        "zh": "工具节点叫 `action`，路由字典把 `\"continue\"`/`\"end\"` 对应到 `action`/`END`；有 checkpointer 和 `thread_id` 才有历史，用 `append` 逐个收进列表。",
        "en": "The tool node is `action`; the routing dict maps `\"continue\"`/`\"end\"` to `action`/`END`. A checkpointer plus `thread_id` gives you a history, collected into a list with `append`."
      }
    },
    {
      "title": {
        "zh": "重放与分叉",
        "en": "Replay and fork"
      },
      "code": {
        "zh": "to_replay = all_states[2]\nprint(to_replay.[[next]])      # ('action',)\n\n# 重放\nfor event in app.stream([[None]], to_replay.[[config]], stream_mode=\"values\"):\n    event[\"messages\"][-1].pretty_print()\n\n# 分叉\nlast_message = to_replay.[[values]][\"messages\"][-1]\nlast_message.[[tool_calls]][0][\"name\"] = \"play_song_on_163\"\nbranch_config = app.[[update_state]](to_replay.config, {\"messages\": [last_message]})\nfor event in app.stream(None, [[branch_config]], stream_mode=\"values\"):\n    event[\"messages\"][-1].pretty_print()",
        "en": "to_replay = all_states[2]\nprint(to_replay.[[next]])      # ('action',)\n\n# replay\nfor event in app.stream([[None]], to_replay.[[config]], stream_mode=\"values\"):\n    event[\"messages\"][-1].pretty_print()\n\n# fork\nlast_message = to_replay.[[values]][\"messages\"][-1]\nlast_message.[[tool_calls]][0][\"name\"] = \"play_song_on_163\"\nbranch_config = app.[[update_state]](to_replay.config, {\"messages\": [last_message]})\nfor event in app.stream(None, [[branch_config]], stream_mode=\"values\"):\n    event[\"messages\"][-1].pretty_print()"
      },
      "explain": {
        "zh": "重放：输入 `None` + 过去快照的 `config`。分叉：改 `values` 里那条消息的 `tool_calls`，`update_state` 写回，再从返回的 config 继续。",
        "en": "Replay: input `None` + the past snapshot's `config`. Fork: edit `tool_calls` of that message in `values`, write it back with `update_state`, then continue from the config it returns."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：查看历史、重放、分叉（免费版）",
        "en": "Write it: history, replay, fork (free version)"
      },
      "task": {
        "zh": "`practice/l37_time_travel.py` 里的 `build_app()` 搭好了视频里的放歌智能体（用模拟模型，不花钱）。在它的基础上写出：\n1. 用给出的 `config` 和 `question` 运行一次，`stream_mode=\"values\"`，打印每一步的最后一条消息\n2. 新建列表 `all_states`，遍历 `app.get_state_history(config)`，打印每个快照的 `step` 和 `next`，并 `append` 进列表\n3. 重放：`to_replay = all_states[2]`，从它的 `config` 重新执行并打印\n4. 分叉：把 `to_replay` 最后一条消息的工具名改成 `play_song_on_163`，用 `update_state` 写回，再从返回的 config 继续并打印\n\n在 `practice` 文件夹里新建文件，用 `.venv` 运行，观察每一步打印出哪些 `[节点]`、`[工具]` 行。",
        "en": "`build_app()` in `practice/l37_time_travel.py` builds the video's music agent (with a fake model, free). On top of it, write:\n1. run once with the given `config` and `question`, `stream_mode=\"values\"`, printing the last message of every step\n2. make a list `all_states`; loop over `app.get_state_history(config)`, print each snapshot's `step` and `next`, and `append` it\n3. replay: `to_replay = all_states[2]`; run again from its `config` and print\n4. fork: rename the tool in the last message of `to_replay` to `play_song_on_163`, write it back with `update_state`, then continue from the returned config and print\n\nSave it as a new file in the `practice` folder, run it with `.venv`, and watch which `[node]` and `[tool]` lines each step prints."
      },
      "starter": {
        "zh": "from l37_time_travel import build_app\n\napp = build_app()          # 视频里的放歌智能体（模拟模型，不花钱）\nconfig = {\"configurable\": {\"thread_id\": \"1\"}}\nquestion = {\"role\": \"user\", \"content\": \"你能播放一首周杰伦播放量最高的歌吗？\"}\n\n# 1. 运行一次：用 stream_mode=\"values\"，打印每一步的最后一条消息\n\n\n# 2. 新建列表 all_states，把历史快照逐个放进去，并打印 step 和 next\n\n\n# 3. 重放：从 all_states[2] 重新执行\n\n\n# 4. 分叉：把那条 AI 消息的工具名改成 play_song_on_163，写回状态，再继续",
        "en": "from l37_time_travel import build_app\n\napp = build_app()          # the video's music agent (fake model, free)\nconfig = {\"configurable\": {\"thread_id\": \"1\"}}\nquestion = {\"role\": \"user\", \"content\": \"Can you play Jay Chou's most-played song?\"}\n\n# 1. run once with stream_mode=\"values\", printing the last message of every step\n\n\n# 2. make a list all_states, put every history snapshot into it, and print step and next\n\n\n# 3. replay: run again from all_states[2]\n\n\n# 4. fork: rename the tool in that AI message to play_song_on_163, write it back, then continue"
      },
      "solution": {
        "zh": "from l37_time_travel import build_app\n\napp = build_app()          # 视频里的放歌智能体（模拟模型，不花钱）\nconfig = {\"configurable\": {\"thread_id\": \"1\"}}\nquestion = {\"role\": \"user\", \"content\": \"你能播放一首周杰伦播放量最高的歌吗？\"}\n\n# 1. 运行一次：用 stream_mode=\"values\"，打印每一步的最后一条消息\nfor event in app.stream({\"messages\": [question]}, config, stream_mode=\"values\"):\n    event[\"messages\"][-1].pretty_print()\n\n# 2. 新建列表 all_states，把历史快照逐个放进去，并打印 step 和 next\nall_states = []\nfor state in app.get_state_history(config):\n    print(state.metadata[\"step\"], state.next)\n    all_states.append(state)\n\n# 3. 重放：从 all_states[2] 重新执行\nto_replay = all_states[2]\nfor event in app.stream(None, to_replay.config, stream_mode=\"values\"):\n    event[\"messages\"][-1].pretty_print()\n\n# 4. 分叉：把那条 AI 消息的工具名改成 play_song_on_163，写回状态，再继续\nlast_message = to_replay.values[\"messages\"][-1]\nlast_message.tool_calls[0][\"name\"] = \"play_song_on_163\"\nbranch_config = app.update_state(to_replay.config, {\"messages\": [last_message]})\nfor event in app.stream(None, branch_config, stream_mode=\"values\"):\n    event[\"messages\"][-1].pretty_print()",
        "en": "from l37_time_travel import build_app\n\napp = build_app()          # the video's music agent (fake model, free)\nconfig = {\"configurable\": {\"thread_id\": \"1\"}}\nquestion = {\"role\": \"user\", \"content\": \"Can you play Jay Chou's most-played song?\"}\n\n# 1. run once with stream_mode=\"values\", printing the last message of every step\nfor event in app.stream({\"messages\": [question]}, config, stream_mode=\"values\"):\n    event[\"messages\"][-1].pretty_print()\n\n# 2. make a list all_states, put every history snapshot into it, and print step and next\nall_states = []\nfor state in app.get_state_history(config):\n    print(state.metadata[\"step\"], state.next)\n    all_states.append(state)\n\n# 3. replay: run again from all_states[2]\nto_replay = all_states[2]\nfor event in app.stream(None, to_replay.config, stream_mode=\"values\"):\n    event[\"messages\"][-1].pretty_print()\n\n# 4. fork: rename the tool in that AI message to play_song_on_163, write it back, then continue\nlast_message = to_replay.values[\"messages\"][-1]\nlast_message.tool_calls[0][\"name\"] = \"play_song_on_163\"\nbranch_config = app.update_state(to_replay.config, {\"messages\": [last_message]})\nfor event in app.stream(None, branch_config, stream_mode=\"values\"):\n    event[\"messages\"][-1].pretty_print()"
      },
      "checks": [
        {
          "zh": "带着 `config` 用 `stream` 运行一次",
          "en": "Runs once with `stream` and `config`",
          "re": "app\\.stream\\(\\s*\\{\\s*[\"']messages[\"']\\s*:\\s*\\[\\s*question\\s*\\]\\s*\\}\\s*,\\s*config"
        },
        {
          "zh": "用 `get_state_history(config)` 取历史",
          "en": "Gets the history with `get_state_history(config)`",
          "re": "get_state_history\\(\\s*config\\s*\\)"
        },
        {
          "zh": "把快照 `append` 进 `all_states`",
          "en": "Adds each snapshot to `all_states` with `append`",
          "re": "all_states\\.append\\(\\s*\\w+\\s*\\)"
        },
        {
          "zh": "重放：`stream(None, to_replay.config, ...)`",
          "en": "Replay: `stream(None, to_replay.config, ...)`",
          "re": "stream\\(\\s*None\\s*,\\s*to_replay\\.config"
        },
        {
          "zh": "把工具名改成 `play_song_on_163`",
          "en": "Renames the tool to `play_song_on_163`",
          "re": "tool_calls\\[\\s*0\\s*\\]\\[\\s*[\"']name[\"']\\s*\\]\\s*=\\s*[\"']play_song_on_163[\"']"
        },
        {
          "zh": "用 `update_state` 返回的 config 继续",
          "en": "Continues with the config `update_state` returned",
          "re": "(\\w+)\\s*=\\s*app\\.update_state\\(\\s*to_replay\\.config[\\s\\S]*stream\\(\\s*None\\s*,\\s*\\1\\b"
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "编译时没传 checkpointer：`get_state_history` 报 `ValueError: No checkpointer set`；config 里没有 `thread_id`：`invoke` / `stream` 会报缺少 `thread_id` 的错误。",
      "en": "Compiling without a checkpointer: `get_state_history` raises `ValueError: No checkpointer set`. A config without `thread_id`: `invoke` / `stream` complain that `thread_id` is missing."
    },
    {
      "zh": "重放时传了新输入而不是 `None`：图会把它当成新一轮对话，从 START 开始跑，而不是从那个快照继续。",
      "en": "Passing a new input instead of `None` when replaying: the graph treats it as a new turn and starts from START instead of continuing from the snapshot."
    },
    {
      "zh": "`update_state` 之后还用旧的 `to_replay.config` 去运行：那只是重放没改过的检查点，改动不会生效。要用 `update_state` 返回的 config。",
      "en": "Running with the old `to_replay.config` after `update_state`: that only replays the unchanged checkpoint and ignores your edit. Use the config `update_state` returns."
    },
    {
      "zh": "以为重放是「读缓存」：快照之后的节点会真的重新执行，模型要再花钱，工具的副作用（放歌、发消息、写数据库）也会再发生一次。",
      "en": "Thinking replay reads a cache: nodes after the snapshot really rerun, the model is billed again, and tool side effects (playing music, sending messages, writing to a database) happen again."
    },
    {
      "zh": "以为 `last_message = ...[-1]` 拿到的是副本：改它就是改快照里的同一个对象。想保留原样先 `copy.deepcopy`。",
      "en": "Assuming `last_message = ...[-1]` is a copy: editing it edits the same object inside the snapshot. Use `copy.deepcopy` first to keep the original."
    },
    {
      "zh": "直接照抄 `all_states[2]`：这个下标只对「一问一答、调用一次工具」的这次运行成立。换了问题或图，先打印每个快照的 `next`，确认选的是哪一步。",
      "en": "Copying `all_states[2]` blindly: that index is right only for this run (one question, one tool call). With another question or graph, print every snapshot's `next` first to be sure which step you are picking."
    }
  ],
  "recap": [
    {
      "zh": "时光旅行 = 沿着 checkpointer 每一步存下的状态快照往回走；两个操作：重放、分叉。",
      "en": "Time travel = walking back along the snapshots a checkpointer saves after every step; two operations: replay and fork."
    },
    {
      "zh": "`get_state(config)` 看当前状态；`get_state_history(config)` 从新到旧列出所有快照（`values`、`next`、`config`、`metadata`）。",
      "en": "`get_state(config)` shows the current state; `get_state_history(config)` lists every snapshot newest first (`values`, `next`, `config`, `metadata`)."
    },
    {
      "zh": "重放：`app.stream(None, 过去快照.config)`——之前的步骤不重跑，之后的节点真的重跑。",
      "en": "Replay: `app.stream(None, past_snapshot.config)` – earlier steps don't rerun, later nodes really do."
    },
    {
      "zh": "分叉：改掉过去消息里的数据（如工具名）→ `new_config = app.update_state(过去快照.config, {...})` → `app.stream(None, new_config)`。",
      "en": "Fork: edit data in a past message (such as the tool name) → `new_config = app.update_state(past_snapshot.config, {...})` → `app.stream(None, new_config)`."
    },
    {
      "zh": "`add_messages` 遇到相同 id 会替换；`update_state` 不改旧检查点，历史因此长成一棵树。",
      "en": "`add_messages` replaces a message with the same id; `update_state` never alters old checkpoints, so the history grows into a tree."
    },
    {
      "zh": "老师强调的两个核心方法：`update_state` 和 `get_state_history`。",
      "en": "The instructor's two key methods: `update_state` and `get_state_history`."
    }
  ],
  "files": [
    {
      "zh": "演示（模拟模型，免费）：视频里的放歌智能体，运行、查看历史、重放、分叉，最后打印整棵历史树。",
      "en": "Demo (fake model, free): the video's music agent – run, inspect the history, replay, fork, then print the whole history tree.",
      "path": "practice/l37_time_travel.py"
    },
    {
      "zh": "练习：图已搭好（真模型），补全运行、查看历史、重放、分叉 4 个 TODO。",
      "en": "Exercise: the graph is ready (real model); complete the 4 TODOs – run, history, replay, fork.",
      "path": "practice/l37_time_travel_todo.py"
    },
    {
      "zh": "上面练习的参考答案（调用模型 4 次）。",
      "en": "Reference solution for the exercise above (4 model calls).",
      "path": "practice/l37_time_travel_solution.py"
    }
  ]
});
