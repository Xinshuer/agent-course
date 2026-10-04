COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l36",
  "priority": "important",
  "handwrite": false,
  "studyMinutes": 15,
  "source": "subtitle",
  "summary": {
    "zh": "第三种人机交互：**直接编辑图的状态**。和视频一样用三个串联的节点 `step_1` → `step_2` → `step_3`，编译时加上 `interrupt_before=[\"step_2\"]`，图跑完 `step_1` 就在断点处停下。这时用 `get_state` 看状态、`update_state` 改掉 `input`，再用 `stream(None, ...)` 继续，后面的节点拿到的就是改过的值。",
    "en": "The third kind of human-in-the-loop: **editing the graph's state directly**. As in the video, three chained nodes `step_1` → `step_2` → `step_3` are compiled with `interrupt_before=[\"step_2\"]`, so the graph stops at that breakpoint after `step_1`. Then `get_state` shows the state, `update_state` changes `input`, and `stream(None, ...)` carries on – the later nodes receive the edited value."
  },
  "goals": [
    {
      "zh": "用 `compile(interrupt_before=[...])` 设断点，让图在某个节点之前停下",
      "en": "Set a breakpoint with `compile(interrupt_before=[...])` so the graph stops before a node"
    },
    {
      "zh": "用 `get_state(config)` 查看 `.values` 和 `.next`",
      "en": "Inspect `.values` and `.next` with `get_state(config)`"
    },
    {
      "zh": "用 `update_state(config, {...})` 修改状态，再传 `None` 继续执行",
      "en": "Change the state with `update_state(config, {...})`, then continue by passing `None`"
    },
    {
      "zh": "分清节点里的 `interrupt()` 和编译时的 `interrupt_before` 两种暂停方式",
      "en": "Tell `interrupt()` inside a node apart from `interrupt_before` at compile time"
    }
  ],
  "blocks": [
    {
      "t": "h",
      "zh": "一、用断点在第二步之前停下",
      "en": "1. Stop before step 2 with a breakpoint"
    },
    {
      "t": "p",
      "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=37&t=0) 最后一种人机交互：直接编辑图的状态。这次不在节点里调用 `interrupt()`，而是用**断点**。图还是之前做过的那种：三个节点 `step_1`、`step_2`、`step_3` 串成一条线。[▶ 00:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=37&t=32) 唯一要注意的区别在 `compile(...)` 里：多了一个参数 `interrupt_before=[\"step_2\"]`，意思是每次运行到 `step_2` **之前**，图都会停下。",
      "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=37&t=0) The last kind of human-in-the-loop: editing the graph's state directly. This time there's no `interrupt()` in a node; we use a **breakpoint** instead. The graph is the kind built before: three nodes, `step_1`, `step_2` and `step_3`, in a line. [▶ 00:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=37&t=32) The one difference to notice is in `compile(...)`: an extra argument, `interrupt_before=[\"step_2\"]`, which means the graph stops every time it is about to run `step_2`."
    },
    {
      "t": "code",
      "file": {
        "zh": "edit_state.py（第 1 段）",
        "en": "edit_state.py (part 1)"
      },
      "code": {
        "zh": "from typing import TypedDict\nfrom langgraph.graph import StateGraph, START, END\nfrom langgraph.checkpoint.memory import InMemorySaver\n\nclass State(TypedDict):\n    input: str\n\ndef step_1(state: State):\n    print(\"---Step 1---  input =\", state[\"input\"])\n\ndef step_2(state: State):\n    print(\"---Step 2---  input =\", state[\"input\"])\n\ndef step_3(state: State):\n    print(\"---Step 3---  input =\", state[\"input\"])\n\nbuilder = StateGraph(State)\nbuilder.add_node(\"step_1\", step_1)\nbuilder.add_node(\"step_2\", step_2)\nbuilder.add_node(\"step_3\", step_3)\nbuilder.add_edge(START, \"step_1\")\nbuilder.add_edge(\"step_1\", \"step_2\")\nbuilder.add_edge(\"step_2\", \"step_3\")\nbuilder.add_edge(\"step_3\", END)\n\n# 断点：每次运行到 step_2 之前都停下\ngraph = builder.compile(checkpointer=InMemorySaver(), interrupt_before=[\"step_2\"])",
        "en": "from typing import TypedDict\nfrom langgraph.graph import StateGraph, START, END\nfrom langgraph.checkpoint.memory import InMemorySaver\n\nclass State(TypedDict):\n    input: str\n\ndef step_1(state: State):\n    print(\"---Step 1---  input =\", state[\"input\"])\n\ndef step_2(state: State):\n    print(\"---Step 2---  input =\", state[\"input\"])\n\ndef step_3(state: State):\n    print(\"---Step 3---  input =\", state[\"input\"])\n\nbuilder = StateGraph(State)\nbuilder.add_node(\"step_1\", step_1)\nbuilder.add_node(\"step_2\", step_2)\nbuilder.add_node(\"step_3\", step_3)\nbuilder.add_edge(START, \"step_1\")\nbuilder.add_edge(\"step_1\", \"step_2\")\nbuilder.add_edge(\"step_2\", \"step_3\")\nbuilder.add_edge(\"step_3\", END)\n\n# Breakpoint: stop every time step_2 is about to run\ngraph = builder.compile(checkpointer=InMemorySaver(), interrupt_before=[\"step_2\"])"
      },
      "note": {
        "zh": "这里让每个节点顺便打印 `input`，好看出后面的节点拿到的是不是改过的值。断点同样要靠 checkpointer 保存进度。",
        "en": "Here every node also prints `input`, so you can see whether later nodes get the edited value. A breakpoint also relies on the checkpointer to save progress."
      }
    },
    {
      "t": "video",
      "zh": "视频里的过程（根据 B 站 AI 字幕整理）：[▶ 00:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=37&t=32) 编译时设置 `interrupt_before`，画图用的 mermaid 在线服务又连不上，老师就跳过了画图；[▶ 01:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=37&t=65) 正常传入输入运行，`step_1` 跑完图就停了，接着用 `graph.update_state(线程 config, 新的值)` 改掉 `input`；[▶ 01:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=37&t=95) 继续执行到三个节点都跑完，老师指着输出说明 `input` 已经是改过的那句话。这一集只有 3 分钟，没有用到模型。代码在本机的 LangGraph 1.2.12 上运行过。",
      "en": "What happens in the video (from the Bilibili AI subtitles): [▶ 00:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=37&t=32) `interrupt_before` is set when compiling; the online mermaid service used for drawing is unreachable again, so the instructor skips the picture; [▶ 01:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=37&t=65) he runs with a normal input, the graph stops after `step_1`, and he changes `input` with `graph.update_state(thread config, new value)`; [▶ 01:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=37&t=95) he continues until all three nodes have run and points out in the output that `input` now holds the edited sentence. The episode is only 3 minutes long and uses no model. The code was run with the installed LangGraph 1.2.12."
    },
    {
      "t": "h",
      "zh": "二、看一看、改一改、再继续",
      "en": "2. Look, change, continue"
    },
    {
      "t": "p",
      "zh": "[▶ 01:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=37&t=65) 运行一次，图在 `step_2` 之前停下。这时人就可以介入了。视频里老师直接用 `update_state` 把 `input` 改掉；这里在改之前多加一步，用 `get_state` 看看当前状态（下一集「时光旅行」会经常用到它）。[▶ 01:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=37&t=95) 改完传 `None` 继续执行。",
      "en": "[▶ 01:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=37&t=65) Run once and the graph stops before `step_2`. Now a person can step in. In the video the instructor changes `input` straight away with `update_state`; here we add one step first and look at the current state with `get_state` (next episode, “time travel”, uses it a lot). [▶ 01:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=37&t=95) After the change, pass `None` to continue."
    },
    {
      "t": "code",
      "file": {
        "zh": "edit_state.py（第 2 段）",
        "en": "edit_state.py (part 2)"
      },
      "code": {
        "zh": "thread = {\"configurable\": {\"thread_id\": \"1\"}}\n\nfor event in graph.stream({\"input\": \"你好\"}, thread, stream_mode=\"values\"):\n    print(event)                                 # 跑完 step_1，停在 step_2 之前\n\nprint(graph.get_state(thread).values)            # 看：当前状态\nprint(graph.get_state(thread).next)              # 看：下一步要执行哪个节点\n\ngraph.update_state(thread, {\"input\": \"你好，这是人工改过的输入\"})   # 改\nprint(graph.get_state(thread).values)\n\nfor event in graph.stream(None, thread, stream_mode=\"values\"):     # 继续：传 None\n    print(event)",
        "en": "thread = {\"configurable\": {\"thread_id\": \"1\"}}\n\nfor event in graph.stream({\"input\": \"hello\"}, thread, stream_mode=\"values\"):\n    print(event)                                 # step_1 runs, then it stops before step_2\n\nprint(graph.get_state(thread).values)            # look: the current state\nprint(graph.get_state(thread).next)              # look: which node runs next\n\ngraph.update_state(thread, {\"input\": \"hello, a person edited this input\"})   # change\nprint(graph.get_state(thread).values)\n\nfor event in graph.stream(None, thread, stream_mode=\"values\"):     # continue: pass None\n    print(event)"
      }
    },
    {
      "t": "code",
      "lang": "text",
      "file": {
        "zh": "输出（本机运行）",
        "en": "Output (run on this machine)"
      },
      "code": {
        "zh": "{'input': '你好'}\n---Step 1---  input = 你好\n{'input': '你好'}\n('step_2',)\n{'input': '你好，这是人工改过的输入'}\n{'input': '你好，这是人工改过的输入'}\n---Step 2---  input = 你好，这是人工改过的输入\n---Step 3---  input = 你好，这是人工改过的输入",
        "en": "{'input': 'hello'}\n---Step 1---  input = hello\n{'input': 'hello'}\n('step_2',)\n{'input': 'hello, a person edited this input'}\n{'input': 'hello, a person edited this input'}\n---Step 2---  input = hello, a person edited this input\n---Step 3---  input = hello, a person edited this input"
      }
    },
    {
      "t": "p",
      "zh": "三个方法各管一步：\n\n| 步骤 | 方法 | 作用 |\n|---|---|---|\n| 看 | `graph.get_state(config)` | 返回一个快照：`.values` 是当前状态，`.next` 是接下来要执行的节点 |\n| 改 | `graph.update_state(config, {...})` | 把新值写进这个 `thread_id` 的状态 |\n| 继续 | `graph.stream(None, config)` 或 `graph.invoke(None, config)` | 不给新输入，从停下的地方接着跑 |\n\n为什么继续时要传 `None`？`None` 的意思是「没有新输入」。如果传一个新字典，LangGraph 会把它当成一次新的运行，从 START 重新开始（本机试过：`step_1` 又执行了一遍，又停在断点前）。\n\n`stream_mode=\"values\"` 时每个事件是完整的状态。`step_1`、`step_2` 什么都不返回，状态没变，所以它们执行后没有新的事件；输出里的 `{...}` 是开始运行时的状态，继续时第一行是改过之后的状态。",
      "en": "Each method handles one step:\n\n| Step | Method | What it does |\n|---|---|---|\n| Look | `graph.get_state(config)` | Returns a snapshot: `.values` is the state, `.next` the node(s) to run next |\n| Change | `graph.update_state(config, {...})` | Writes new values into this `thread_id`'s state |\n| Continue | `graph.stream(None, config)` or `graph.invoke(None, config)` | No new input; carry on from where it stopped |\n\nWhy pass `None` to continue? `None` means “no new input”. A new dict is treated as a fresh run that starts again from START (tried here: `step_1` ran again and the graph stopped at the breakpoint again).\n\nWith `stream_mode=\"values\"` each event is the whole state. `step_1` and `step_2` return nothing and the state doesn't change, so no new event follows them; the `{...}` lines are the state at the start of each run, and on continuing the first line is the edited state."
    },
    {
      "t": "p",
      "zh": "到这里两种暂停方式都见过了：\n\n| | 节点里的 `interrupt()`（34、35 集） | 编译时的 `interrupt_before`（本集） |\n|---|---|---|\n| 写在哪 | 节点函数里 | `compile(...)` 的参数 |\n| 什么时候停 | 执行到这一行时；可以写在 `if` 里按条件停 | 每次到达指定节点之前 |\n| 能带内容给人吗 | 能，`interrupt(值)` 把值交出去 | 不能，只是停下 |\n| 怎么继续 | `Command(resume=值)` | 传 `None` |\n\n还有一个对应的 `interrupt_after=[...]`：在指定节点**执行完之后**停下。",
      "en": "You have now seen both ways to pause:\n\n| | `interrupt()` in a node (lessons 34, 35) | `interrupt_before` at compile time (this episode) |\n|---|---|---|\n| Where | Inside the node function | An argument to `compile(...)` |\n| When it stops | When that line runs; can sit inside an `if` | Every time before the named node |\n| Carries content to the person? | Yes, `interrupt(value)` hands it out | No, it just stops |\n| How to continue | `Command(resume=value)` | Pass `None` |\n\nThere is also `interrupt_after=[...]`, which stops **after** the named node has run."
    },
    {
      "t": "py",
      "title": {
        "zh": "带名字的元组：get_state 的结果为什么能用点号",
        "en": "Named tuples: why get_state's result works with a dot"
      },
      "zh": "`graph.get_state(thread).next` 打印出来是 `('step_2',)`，这是 31 节讲过的**元组**：只有一个元素时要带逗号。快照本身（`StateSnapshot`）是一个 **NamedTuple（带名字的元组）**：\n- 它是元组，所以字段不能重新赋值，也能用下标取：`snapshot[1]` 和 `snapshot.next` 是同一个东西；\n- 每个位置都有名字，所以可以用 `.values`、`.next` 这样的点号取，比记下标清楚；\n- 元组本身不能改，但里面的 `values` 是普通字典。改它**不会报错**，只是改了你手里这一份，图里保存的状态不变，所以改状态一定要调用 `update_state`；\n- 空元组 `()` 在 `if` 里算「假」（05 节），`if snapshot.next:` 读作「图还有下一步」。\n\n下面自己定义一个只有两个字段的「小快照」试一试（类和类型标注见 08 节）：",
      "en": "`graph.get_state(thread).next` prints as `('step_2',)` – a **tuple** from lesson 31: a one-item tuple needs a comma. The snapshot itself (`StateSnapshot`) is a **NamedTuple (a tuple with named fields)**:\n- it is a tuple, so fields can't be reassigned, and indexing works: `snapshot[1]` is the same as `snapshot.next`;\n- every position has a name, so `.values` and `.next` read better than indexes;\n- the tuple can't change, but the `values` inside is an ordinary dict. Changing it raises **no error**, yet it only changes your copy – the graph's saved state stays the same, which is why changes must go through `update_state`;\n- an empty tuple `()` is falsy in an `if` (lesson 05), so `if snapshot.next:` reads “the graph still has a next step”.\n\nTry it with a two-field “mini snapshot” of your own (classes and type hints: lesson 08):",
      "code": {
        "zh": "from typing import NamedTuple\n\nclass Snapshot(NamedTuple):       # 仿照 StateSnapshot 的小例子（真正的字段更多）\n    values: dict\n    next: tuple\n\nsnap = Snapshot(values={\"input\": \"你好\"}, next=(\"step_2\",))\nprint(snap.next)         # ('step_2',)  用名字取\nprint(snap[1])           # ('step_2',)  也能用下标取\n\ntry:\n    snap.next = ()       # 字段不能重新赋值\nexcept AttributeError as e:\n    print(\"不能改：\", type(e).__name__)\n\nsnap.values[\"input\"] = \"改了\"     # 里面的字典能改，但只是你手里这一份\nprint(snap.values)\n\ndone = Snapshot(values={}, next=())\nif not done.next:                  # 空元组 () 算「假」\n    print(\"next 是 ()：图已经跑完了\")",
        "en": "from typing import NamedTuple\n\nclass Snapshot(NamedTuple):       # a mini version of StateSnapshot (the real one has more fields)\n    values: dict\n    next: tuple\n\nsnap = Snapshot(values={\"input\": \"hello\"}, next=(\"step_2\",))\nprint(snap.next)         # ('step_2',)  by name\nprint(snap[1])           # ('step_2',)  or by index\n\ntry:\n    snap.next = ()       # fields can't be reassigned\nexcept AttributeError as e:\n    print(\"can't change it:\", type(e).__name__)\n\nsnap.values[\"input\"] = \"changed\"   # the dict inside can change - but only your copy\nprint(snap.values)\n\ndone = Snapshot(values={}, next=())\nif not done.next:                  # an empty tuple () is falsy\n    print(\"next is (): the graph has finished\")"
      }
    },
    {
      "t": "p",
      "zh": "`update_state` 做的事，很像「一个节点返回了这个字典」：\n- 它会写入一个**新的检查点**，旧的那个还留在历史里。下一集「时光旅行」就是利用这些历史检查点。\n- 新值同样要经过 **reducer**：普通字段直接覆盖；用 `Annotated[list, operator.add]` 声明的列表会**追加**（28 节）；`messages` 里 id 相同的消息会被**替换**（35 集改工具参数就是这个原理）。",
      "en": "`update_state` behaves much like “a node returned this dict”:\n- It writes a **new checkpoint**; the old one stays in the history. Next episode's “time travel” builds on those past checkpoints.\n- New values go through the **reducers**: plain fields are overwritten; a list declared with `Annotated[list, operator.add]` is **appended to** (lesson 28); a message in `messages` with the same id is **replaced** (the principle behind editing tool arguments in lesson 35)."
    },
    {
      "t": "check",
      "q": {
        "zh": "用 `update_state` 改完 `input` 之后，怎样继续执行并用上新值？",
        "en": "After changing `input` with `update_state`, how do you continue so the new value is used?"
      },
      "options": [
        {
          "zh": "`graph.stream({\"input\": \"新值\"}, thread)`",
          "en": "`graph.stream({\"input\": \"new value\"}, thread)`"
        },
        {
          "zh": "`snapshot.values[\"input\"] = \"新值\"`",
          "en": "`snapshot.values[\"input\"] = \"new value\"`"
        },
        {
          "zh": "`graph.stream(None, thread)`",
          "en": "`graph.stream(None, thread)`"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "`None` 表示「没有新输入，从停下的地方继续」。传新字典会从 START 重新跑；改 `snapshot.values` 只是改了本地的一个字典。",
        "en": "`None` means “no new input, continue from the stop”. A new dict reruns from START; changing `snapshot.values` only edits a local dict."
      }
    },
    {
      "t": "h",
      "zh": "三、什么时候用它",
      "en": "3. When to use it"
    },
    {
      "t": "p",
      "zh": "[▶ 02:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=37&t=126) 回顾一下刚才做的事：第一个节点的结果传到第二个节点之前，人把状态里的 `input` 改掉了，这就是一次人工介入。[▶ 02:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=37&t=158) 老师总结说，最常见的场景是在智能体选择工具、执行动作的时候，让人去审核、批准甚至编辑，这对做出一个**稳健**的应用很有帮助。\n\n把三集放在一起看：34 集「停下来问人」，35 集「工具执行前让人审」，36 集「直接改状态」。底层都是：图停下 → 进度存在 checkpointer 里 → 人做点什么 → 从停下的地方继续。",
      "en": "[▶ 02:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=37&t=126) Recap what just happened: before the first node's result reached the second node, a person changed `input` in the state – one human intervention. [▶ 02:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=37&t=158) The instructor sums up that the most common use is letting a person review, approve or even edit an agent's tool choices and actions, which goes a long way towards a **robust** application.\n\nPut the three lessons side by side: lesson 34 “stop and ask a person”, lesson 35 “a person reviews before a tool runs”, lesson 36 “edit the state directly”. Underneath it's always: the graph stops → the checkpointer holds the progress → a person does something → the graph continues from where it stopped."
    },
    {
      "t": "tip",
      "zh": "补充：改智能体的工具参数，也可以用这一集的办法，不写审查节点：编译时用 `interrupt_before=[\"tools\"]` 停在执行工具之前，取出最后一条 AI 消息，造一条 **id 相同**、参数改过的 `AIMessage`，用 `update_state(config, {\"messages\": [新消息]})` 写回去（相同 id 会替换旧消息），再传 `None` 继续。这个流程在本机用假模型测试过，工具执行的是改过的参数。",
      "en": "Extra: you can also edit an agent's tool arguments this way, without a review node: compile with `interrupt_before=[\"tools\"]` to stop before tools run, take the last AI message, build an `AIMessage` with **the same id** and edited arguments, write it back with `update_state(config, {\"messages\": [new_msg]})` (the same id replaces the old one), then pass `None` to continue. This flow was tested here with a fake model, and the tool ran with the edited arguments."
    },
    {
      "t": "note",
      "zh": "补充（视频里没有）：`update_state` 还有一个参数 `as_node`，意思是「就当这些值是**这个节点**刚刚返回的」，LangGraph 会按这个节点后面的边决定下一步。比如图停在 34 集那种会提问的节点里，你不想回答，而是直接替它给出结果，让图跳过提问：\n- `graph.update_state(config, {\"city\": \"广州\"}, as_node=\"ask_city\")` 之后，`next` 变成 `('make_report',)`，再传 `None` 继续即可（见 `practice/l36_edit_state_solution.py` 第 2 部分）。\n- 用错了会跳过关键步骤：例如写成 `as_node=\"step_3\"`，LangGraph 会以为 `step_3` 已经执行过，图直接结束。不确定时就别写 `as_node`。",
      "en": "Extra (not in the video): `update_state` also takes `as_node`, meaning “treat these values as if **this node** just returned them”; LangGraph then follows that node's outgoing edges. For example, when the graph is paused in an asking node like those in lesson 34, you can supply that node's result instead of answering, and the graph skips the question:\n- after `graph.update_state(config, {\"city\": \"Guangzhou\"}, as_node=\"ask_city\")`, `next` becomes `('make_report',)`; pass `None` to continue (see part 2 of `practice/l36_edit_state_solution.py`).\n- Used wrongly it skips key steps: with `as_node=\"step_3\"`, LangGraph thinks `step_3` already ran and the graph just ends. If unsure, leave `as_node` out."
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "编译时写了 `interrupt_before=[\"step_2\"]`，第一次运行时图停在哪里？",
        "en": "With `interrupt_before=[\"step_2\"]`, where does the first run stop?"
      },
      "options": [
        {
          "zh": "`step_1` 执行之前",
          "en": "Before `step_1` runs"
        },
        {
          "zh": "`step_1` 执行完之后、`step_2` 执行之前",
          "en": "After `step_1`, before `step_2` runs"
        },
        {
          "zh": "`step_2` 执行完之后",
          "en": "After `step_2` has run"
        },
        {
          "zh": "不会停，一口气跑完",
          "en": "It doesn't stop at all"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "`interrupt_before` 在到达指定节点**之前**停下。此时 `get_state(...).next` 是 `('step_2',)`。",
        "en": "`interrupt_before` stops **before** the named node. At that point `get_state(...).next` is `('step_2',)`."
      }
    },
    {
      "q": {
        "zh": "下面哪种做法**不能**真正修改图保存的状态？",
        "en": "Which of these does **not** actually change the graph's saved state?"
      },
      "options": [
        {
          "zh": "`graph.update_state(thread, {\"input\": \"新值\"})`",
          "en": "`graph.update_state(thread, {\"input\": \"new value\"})`"
        },
        {
          "zh": "在节点里 return 新的值",
          "en": "Returning new values from a node"
        },
        {
          "zh": "带 `as_node` 调用 `update_state`",
          "en": "Calling `update_state` with `as_node`"
        },
        {
          "zh": "`snapshot = graph.get_state(thread)` 之后执行 `snapshot.values[\"input\"] = \"新值\"`",
          "en": "`snapshot = graph.get_state(thread)` then `snapshot.values[\"input\"] = \"new value\"`"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "快照只是一份拷贝，改它不会写回检查点（本机试过，再次 `get_state` 还是旧值）。要改状态必须调用 `update_state`。",
        "en": "A snapshot is just a copy; changing it writes nothing back (tried here: `get_state` still returns the old value). To change the state, call `update_state`."
      }
    },
    {
      "q": {
        "zh": "改完状态后，有人用 `graph.stream({\"input\": \"新值\"}, thread)` 继续。结果会怎样？",
        "en": "After editing, someone continues with `graph.stream({\"input\": \"new value\"}, thread)`. What happens?"
      },
      "options": [
        {
          "zh": "这被当成一次新的运行，图从 START 重新开始，又停在 `step_2` 之前",
          "en": "It counts as a new run: the graph starts again from START and stops before `step_2` again"
        },
        {
          "zh": "和传 `None` 完全一样",
          "en": "Exactly the same as passing `None`"
        },
        {
          "zh": "报错",
          "en": "An error"
        },
        {
          "zh": "直接跳到 `step_3`",
          "en": "It jumps straight to `step_3`"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "只有传 `None` 才表示「从断点继续」。传新的输入就是重新跑一遍。",
        "en": "Only `None` means “continue from the breakpoint”. New input means a fresh run."
      }
    },
    {
      "q": {
        "zh": "状态里有 `log: Annotated[list, operator.add]`，当前是 `[\"step_1\"]`。执行 `update_state(thread, {\"log\": [\"人工修改\"]})` 之后，`log` 是？",
        "en": "The state has `log: Annotated[list, operator.add]`, currently `[\"step_1\"]`. After `update_state(thread, {\"log\": [\"human edit\"]})`, what is `log`?"
      },
      "options": [
        {
          "zh": "`[\"人工修改\"]`",
          "en": "`[\"human edit\"]`"
        },
        {
          "zh": "`[\"step_1\"]`，update_state 不能改列表",
          "en": "`[\"step_1\"]` – update_state can't change lists"
        },
        {
          "zh": "`[\"step_1\", \"人工修改\"]`",
          "en": "`[\"step_1\", \"human edit\"]`"
        },
        {
          "zh": "报错",
          "en": "An error"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "`update_state` 和节点的返回值一样经过 reducer，`operator.add` 会把新列表接在后面（本机验证过）。",
        "en": "`update_state` goes through the reducer like a node's return value, and `operator.add` appends the new list (verified on this machine)."
      }
    },
    {
      "q": {
        "zh": "`graph.get_state(thread).next` 是 `()`，说明什么？",
        "en": "`graph.get_state(thread).next` is `()`. What does that mean?"
      },
      "options": [
        {
          "zh": "图停在了 START",
          "en": "The graph is stopped at START"
        },
        {
          "zh": "checkpointer 没有生效",
          "en": "The checkpointer isn't working"
        },
        {
          "zh": "图出错了",
          "en": "The graph failed"
        },
        {
          "zh": "这个 thread 的运行已经结束，没有下一步了",
          "en": "This thread's run has finished; nothing is left to run"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "`.next` 列出接下来要执行的节点。空元组就是没有要执行的了，也就是跑完了。",
        "en": "`.next` lists the nodes to run next. An empty tuple means nothing is left, i.e. the run is finished."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "断点 → 看 → 改 → 继续",
        "en": "Breakpoint → look → change → continue"
      },
      "code": {
        "zh": "graph = builder.compile(checkpointer=InMemorySaver(), [[interrupt_before]]=[\"step_2\"])\nthread = {\"configurable\": {\"thread_id\": \"1\"}}\n\nfor event in graph.stream({\"input\": \"你好\"}, thread, stream_mode=\"values\"):\n    print(event)\n\nprint(graph.[[get_state]](thread).[[values]])\nprint(graph.get_state(thread).[[next]])\n\ngraph.[[update_state]](thread, {\"input\": \"你好，这是人工改过的输入\"})\n\nfor event in graph.stream([[None]], thread, stream_mode=\"values\"):\n    print(event)",
        "en": "graph = builder.compile(checkpointer=InMemorySaver(), [[interrupt_before]]=[\"step_2\"])\nthread = {\"configurable\": {\"thread_id\": \"1\"}}\n\nfor event in graph.stream({\"input\": \"hello\"}, thread, stream_mode=\"values\"):\n    print(event)\n\nprint(graph.[[get_state]](thread).[[values]])\nprint(graph.get_state(thread).[[next]])\n\ngraph.[[update_state]](thread, {\"input\": \"hello, a person edited this input\"})\n\nfor event in graph.stream([[None]], thread, stream_mode=\"values\"):\n    print(event)"
      },
      "explain": {
        "zh": "断点停下 → `get_state` 看 → `update_state` 改 → 传 `None` 继续。",
        "en": "Stop at the breakpoint → look with `get_state` → change with `update_state` → continue with `None`."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：停下、改状态、继续",
        "en": "Write it: stop, edit the state, continue"
      },
      "task": {
        "zh": "三个节点和建图的代码已经给好。补全：\n1. 编译时加上 checkpointer 和 `interrupt_before=[\"step_2\"]`\n2. 写好 config，传入 `{\"input\": \"你好\"}` 用 `stream` 跑第一次\n3. 用 `get_state` 打印 `.values` 和 `.next`\n4. 用 `update_state` 把 `input` 改成一句新的话\n5. 传 `None` 继续执行\n\n本地练习文件：`practice/l36_edit_state_todo.py`（不需要 API key）。",
        "en": "The three nodes and the graph wiring are given. Complete:\n1. compile with a checkpointer and `interrupt_before=[\"step_2\"]`\n2. build a config and run once with `stream`, passing `{\"input\": \"hello\"}`\n3. print `.values` and `.next` with `get_state`\n4. change `input` to a new sentence with `update_state`\n5. continue by passing `None`\n\nLocal practice file: `practice/l36_edit_state_todo.py` (no API key needed)."
      },
      "starter": {
        "zh": "from typing import TypedDict\nfrom langgraph.graph import StateGraph, START, END\nfrom langgraph.checkpoint.memory import InMemorySaver\n\nclass State(TypedDict):\n    input: str\n\ndef step_1(state: State):\n    print(\"---Step 1---  input =\", state[\"input\"])\n\ndef step_2(state: State):\n    print(\"---Step 2---  input =\", state[\"input\"])\n\ndef step_3(state: State):\n    print(\"---Step 3---  input =\", state[\"input\"])\n\nbuilder = StateGraph(State)\nbuilder.add_node(\"step_1\", step_1)\nbuilder.add_node(\"step_2\", step_2)\nbuilder.add_node(\"step_3\", step_3)\nbuilder.add_edge(START, \"step_1\")\nbuilder.add_edge(\"step_1\", \"step_2\")\nbuilder.add_edge(\"step_2\", \"step_3\")\nbuilder.add_edge(\"step_3\", END)\n\n# 1. 编译\n\n\n# 2. 第一次运行\n\n\n# 3. 看\n\n\n# 4. 改\n\n\n# 5. 继续\n",
        "en": "from typing import TypedDict\nfrom langgraph.graph import StateGraph, START, END\nfrom langgraph.checkpoint.memory import InMemorySaver\n\nclass State(TypedDict):\n    input: str\n\ndef step_1(state: State):\n    print(\"---Step 1---  input =\", state[\"input\"])\n\ndef step_2(state: State):\n    print(\"---Step 2---  input =\", state[\"input\"])\n\ndef step_3(state: State):\n    print(\"---Step 3---  input =\", state[\"input\"])\n\nbuilder = StateGraph(State)\nbuilder.add_node(\"step_1\", step_1)\nbuilder.add_node(\"step_2\", step_2)\nbuilder.add_node(\"step_3\", step_3)\nbuilder.add_edge(START, \"step_1\")\nbuilder.add_edge(\"step_1\", \"step_2\")\nbuilder.add_edge(\"step_2\", \"step_3\")\nbuilder.add_edge(\"step_3\", END)\n\n# 1. compile\n\n\n# 2. first run\n\n\n# 3. look\n\n\n# 4. change\n\n\n# 5. continue\n"
      },
      "solution": {
        "zh": "from typing import TypedDict\nfrom langgraph.graph import StateGraph, START, END\nfrom langgraph.checkpoint.memory import InMemorySaver\n\nclass State(TypedDict):\n    input: str\n\ndef step_1(state: State):\n    print(\"---Step 1---  input =\", state[\"input\"])\n\ndef step_2(state: State):\n    print(\"---Step 2---  input =\", state[\"input\"])\n\ndef step_3(state: State):\n    print(\"---Step 3---  input =\", state[\"input\"])\n\nbuilder = StateGraph(State)\nbuilder.add_node(\"step_1\", step_1)\nbuilder.add_node(\"step_2\", step_2)\nbuilder.add_node(\"step_3\", step_3)\nbuilder.add_edge(START, \"step_1\")\nbuilder.add_edge(\"step_1\", \"step_2\")\nbuilder.add_edge(\"step_2\", \"step_3\")\nbuilder.add_edge(\"step_3\", END)\n\n# 1. 编译\ngraph = builder.compile(checkpointer=InMemorySaver(), interrupt_before=[\"step_2\"])\n\n# 2. 第一次运行\nthread = {\"configurable\": {\"thread_id\": \"1\"}}\nfor event in graph.stream({\"input\": \"你好\"}, thread, stream_mode=\"values\"):\n    print(event)\n\n# 3. 看\nsnapshot = graph.get_state(thread)\nprint(snapshot.values, snapshot.next)\n\n# 4. 改\ngraph.update_state(thread, {\"input\": \"你好，这是人工改过的输入\"})\n\n# 5. 继续\nfor event in graph.stream(None, thread, stream_mode=\"values\"):\n    print(event)",
        "en": "from typing import TypedDict\nfrom langgraph.graph import StateGraph, START, END\nfrom langgraph.checkpoint.memory import InMemorySaver\n\nclass State(TypedDict):\n    input: str\n\ndef step_1(state: State):\n    print(\"---Step 1---  input =\", state[\"input\"])\n\ndef step_2(state: State):\n    print(\"---Step 2---  input =\", state[\"input\"])\n\ndef step_3(state: State):\n    print(\"---Step 3---  input =\", state[\"input\"])\n\nbuilder = StateGraph(State)\nbuilder.add_node(\"step_1\", step_1)\nbuilder.add_node(\"step_2\", step_2)\nbuilder.add_node(\"step_3\", step_3)\nbuilder.add_edge(START, \"step_1\")\nbuilder.add_edge(\"step_1\", \"step_2\")\nbuilder.add_edge(\"step_2\", \"step_3\")\nbuilder.add_edge(\"step_3\", END)\n\n# 1. compile\ngraph = builder.compile(checkpointer=InMemorySaver(), interrupt_before=[\"step_2\"])\n\n# 2. first run\nthread = {\"configurable\": {\"thread_id\": \"1\"}}\nfor event in graph.stream({\"input\": \"hello\"}, thread, stream_mode=\"values\"):\n    print(event)\n\n# 3. look\nsnapshot = graph.get_state(thread)\nprint(snapshot.values, snapshot.next)\n\n# 4. change\ngraph.update_state(thread, {\"input\": \"hello, a person edited this input\"})\n\n# 5. continue\nfor event in graph.stream(None, thread, stream_mode=\"values\"):\n    print(event)"
      },
      "checks": [
        {
          "zh": "编译时设置 `interrupt_before=[\"step_2\"]`",
          "en": "Compiles with `interrupt_before=[\"step_2\"]`",
          "re": "interrupt_before\\s*=\\s*\\[\\s*[\"']step_2[\"']\\s*\\]"
        },
        {
          "zh": "编译时传入 checkpointer",
          "en": "Compiles with a checkpointer",
          "re": "checkpointer\\s*="
        },
        {
          "zh": "用 `get_state(...)` 查看状态",
          "en": "Looks at the state with `get_state(...)`",
          "re": "\\.get_state\\("
        },
        {
          "zh": "用 `update_state(..., {...})` 修改状态",
          "en": "Changes the state with `update_state(..., {...})`",
          "re": "\\.update_state\\(\\s*\\w+\\s*,\\s*\\{"
        },
        {
          "zh": "传 `None` 继续执行",
          "en": "Continues by passing `None`",
          "re": "\\.(stream|invoke)\\(\\s*None\\s*,"
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "编译时只写了 `interrupt_before`、没写 checkpointer：图能停下，但进度没保存，`get_state` / `update_state` 报 `ValueError: No checkpointer set`，传 `None` 也接不上（本机试过）。",
      "en": "Compiling with `interrupt_before` but no checkpointer: the graph stops, but nothing is saved – `get_state` / `update_state` raise `ValueError: No checkpointer set` and passing `None` can't continue (tried here)."
    },
    {
      "zh": "改完状态后用新字典继续（`graph.stream({...}, thread)`）：这是新输入，图从 START 重新跑。要传 `None`。",
      "en": "Continuing with a new dict (`graph.stream({...}, thread)`) after editing: that's new input and the graph reruns from START. Pass `None`."
    },
    {
      "zh": "直接改 `snapshot.values[...]`，以为状态变了；其实只改了本地拷贝，必须调用 `update_state`。",
      "en": "Editing `snapshot.values[...]` and assuming the state changed – it's a local copy; call `update_state`."
    },
    {
      "zh": "对带 reducer 的列表字段用 `update_state`，以为会覆盖，结果是追加。",
      "en": "Calling `update_state` on a list field with a reducer, expecting an overwrite, and getting an append."
    },
    {
      "zh": "`update_state` 用了另一个 `thread_id`，改的是别的会话。",
      "en": "Using another `thread_id` in `update_state`, so a different session gets changed."
    }
  ],
  "recap": [
    {
      "zh": "断点：`compile(checkpointer=..., interrupt_before=[\"节点名\"])`，每次到达这个节点之前都停下。",
      "en": "Breakpoint: `compile(checkpointer=..., interrupt_before=[\"node\"])` stops every time before that node."
    },
    {
      "zh": "看：`graph.get_state(config)` → `.values` 状态、`.next` 下一步（`()` 表示结束）。",
      "en": "Look: `graph.get_state(config)` → `.values` for the state, `.next` for the next step (`()` means finished)."
    },
    {
      "zh": "改：`graph.update_state(config, {...})`，写入新检查点，并经过 reducer。",
      "en": "Change: `graph.update_state(config, {...})` writes a new checkpoint and goes through the reducers."
    },
    {
      "zh": "继续：`graph.stream(None, config)` 或 `graph.invoke(None, config)`；传新字典会从头重跑。",
      "en": "Continue: `graph.stream(None, config)` or `graph.invoke(None, config)`; a new dict reruns from the start."
    },
    {
      "zh": "节点里的 `interrupt()` 能带话给人、用 `Command(resume=...)` 继续；`interrupt_before` 只是停下、用 `None` 继续。",
      "en": "`interrupt()` in a node can hand content to a person and resumes with `Command(resume=...)`; `interrupt_before` just stops and continues with `None`."
    }
  ],
  "files": [
    {
      "path": "practice/l36_edit_state_todo.py",
      "zh": "练习：补全断点、`get_state`、`update_state` 和继续执行（不需要 API key）。",
      "en": "Exercise: complete the breakpoint, `get_state`, `update_state` and continuing (no API key needed)."
    },
    {
      "path": "practice/l36_edit_state_solution.py",
      "zh": "参考答案：第 1 部分和视频一样改 `input`；第 2 部分补充演示 `as_node`。",
      "en": "Solution: part 1 edits `input` as in the video; part 2 is an extra demo of `as_node`."
    }
  ]
});
