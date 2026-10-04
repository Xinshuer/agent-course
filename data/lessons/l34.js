COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l34",
  "priority": "core",
  "handwrite": true,
  "studyMinutes": 45,
  "source": "subtitle",
  "summary": {
    "zh": "第一种人机交互：**等待用户输入**。先跟着视频做一个三个节点的小图：`step_1` → `human_feedback` → `step_3`，中间节点用 `interrupt()` 让图停下，再用 `Command(resume=...)` 把人的反馈送回去。然后做一个会「问人」的智能体：把 pydantic 类 `AskHuman` 当成一个假工具交给模型，模型想问人时，图转到 `ask_human` 节点停下；拿到「北京」这个回答后，模型再去搜索北京的天气。",
    "en": "The first kind of human-in-the-loop: **waiting for user input**. Following the video, build a three-node graph `step_1` → `human_feedback` → `step_3` whose middle node stops the graph with `interrupt()`; then send the person's feedback back with `Command(resume=...)`. After that, build an agent that can ask a person: the pydantic class `AskHuman` is given to the model as a pretend tool, and when the model wants to ask, the graph goes to an `ask_human` node and stops; once it gets the answer “Beijing”, the model searches for Beijing's weather."
  },
  "goals": [
    {
      "zh": "在节点里用 `interrupt(提示)` 暂停，用 `Command(resume=值)` 恢复，并说出恢复需要 checkpointer 和同一个 `thread_id`",
      "en": "Pause in a node with `interrupt(prompt)`, resume with `Command(resume=value)`, and say why resuming needs a checkpointer and the same `thread_id`"
    },
    {
      "zh": "读懂 `stream(..., stream_mode=\"updates\")` 打印的事件，认出表示暂停的 `\"__interrupt__\"`",
      "en": "Read the events printed by `stream(..., stream_mode=\"updates\")` and recognise the `\"__interrupt__\"` that means “paused”"
    },
    {
      "zh": "解释恢复时节点为什么会从头再执行一次，以及这对写代码有什么影响",
      "en": "Explain why a node runs again from the top on resume, and what that means for your code"
    },
    {
      "zh": "用 `AskHuman` 假工具 + 路由函数 + `ask_human` 节点，让智能体缺信息时停下来问人",
      "en": "Use an `AskHuman` pretend tool + a router + an `ask_human` node so an agent stops to ask when information is missing"
    },
    {
      "zh": "不看资料，手写三节点反馈图和 `ask_human` 节点",
      "en": "Write the three-node feedback graph and the `ask_human` node unaided"
    }
  ],
  "blocks": [
    {
      "t": "h",
      "zh": "一、这一集做什么",
      "en": "1. What this episode builds"
    },
    {
      "t": "p",
      "zh": "[▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=1) 从这一集开始写代码。老师准备了三个小例子，正好对应接下来三集：等待用户输入（本集）、审查工具调用（35）、编辑图的状态（36）。这一集分两部分：\n1. 在两个普通节点之间插一个「人类反馈」节点；\n2. 让智能体在缺信息时，自己停下来问人。",
      "en": "[▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=1) Coding starts here. The instructor has three small examples, matching the next three episodes: waiting for user input (this one), reviewing tool calls (lesson 35) and editing graph state (lesson 36). This episode has two parts:\n1. insert a “human feedback” node between two ordinary nodes;\n2. let an agent stop and ask a person when it lacks information."
    },
    {
      "t": "video",
      "zh": "视频里老师的步骤（根据 B 站 AI 字幕整理）：\n- [▶ 00:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=32) 例子一：State 有 `input` 和 `user_feedback` 两个字段；`step_1`、`step_3` 只打印，中间的 `human_feedback` 调用 `interrupt`；checkpointer 用 `MemorySaver`\n- [▶ 02:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=125) 输入「你好」、`thread_id` 设为 1 运行，图在人类反馈节点停下\n- [▶ 03:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=191) 用 `Command(resume=\"go to step 3\")` 恢复，`step_3` 接着执行\n- [▶ 04:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=254) 例子二：一个假的搜索工具 + pydantic 类 `AskHuman`，模型用的是 **DeepSeek**\n- [▶ 06:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=381) 用 `stream` 运行，`thread_id` 为 2；模型先调用 `AskHuman` 问用户在哪\n- [▶ 07:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=442) 用 `Command(resume=\"北京\")` 回答，模型接着搜索北京的天气，拿到写死的「晴朗、25 度」\n\n这里的代码按本机的 LangGraph 1.2.12 改写并运行过，模型通过 `practice/llm.py` 用 deepseek-flash（`ChatDeepSeek`）。视频里的 `MemorySaver` 和这里的 `InMemorySaver` 是**同一个类**，`MemorySaver` 只是旧名字，两种写法都能用。",
      "en": "The instructor's steps in the video (from the Bilibili AI subtitles):\n- [▶ 00:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=32) Example 1: the State has `input` and `user_feedback`; `step_1` and `step_3` only print, while `human_feedback` in the middle calls `interrupt`; the checkpointer is `MemorySaver`\n- [▶ 02:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=125) It runs with the input “hello” and `thread_id` 1, and the graph stops at the human feedback node\n- [▶ 03:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=191) `Command(resume=\"go to step 3\")` resumes it and `step_3` runs\n- [▶ 04:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=254) Example 2: a fake search tool + the pydantic class `AskHuman`; the model is **DeepSeek**\n- [▶ 06:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=381) It runs with `stream` and `thread_id` 2; the model first calls `AskHuman` to ask where the user is\n- [▶ 07:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=442) `Command(resume=\"Beijing\")` answers; the model then searches Beijing's weather and gets the hard-coded “sunny, 25 degrees”\n\nThe code here was adapted to and run with the installed LangGraph 1.2.12; the model is deepseek-flash via `practice/llm.py` (`ChatDeepSeek`). The video's `MemorySaver` and our `InMemorySaver` are **the same class** – `MemorySaver` is just the older name, and both work."
    },
    {
      "t": "h",
      "zh": "二、例子一：在两个节点之间等人的反馈",
      "en": "2. Example 1: wait for feedback between two nodes"
    },
    {
      "t": "p",
      "zh": "[▶ 00:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=32) 「等待用户输入」说穿了，就是**在节点和节点之间加一个人类反馈节点**。[▶ 01:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=62) 状态有两个字段：`input` 是输入，`user_feedback` 用来存人的反馈。三个节点里只有中间那个特别：它调用了 `interrupt(...)`。[▶ 01:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=93) 编译时要带上 checkpointer，否则停下之后没法接着跑。",
      "en": "[▶ 00:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=32) “Waiting for user input” really means **adding a human feedback node between two nodes**. [▶ 01:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=62) The state has two fields: `input` for the input and `user_feedback` for the person's feedback. Of the three nodes only the middle one is special: it calls `interrupt(...)`. [▶ 01:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=93) Compile with a checkpointer, or the graph can't carry on after it stops."
    },
    {
      "t": "code",
      "file": "wait_feedback.py",
      "code": {
        "zh": "from typing import TypedDict\nfrom langgraph.graph import StateGraph, START, END\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.types import interrupt, Command\n\nclass State(TypedDict):\n    input: str\n    user_feedback: str\n\ndef step_1(state: State):\n    print(\"---Step 1---\")                 # 什么都不返回 = 不修改状态\n\ndef human_feedback(state: State):\n    print(\"---human_feedback---\")\n    feedback = interrupt(\"请提供反馈：\")    # 第一次运行：图停在这里\n    return {\"user_feedback\": feedback}     # 恢复之后：feedback 就是人给的值\n\ndef step_3(state: State):\n    print(\"---Step 3---\")\n\nbuilder = StateGraph(State)\nbuilder.add_node(\"step_1\", step_1)\nbuilder.add_node(\"human_feedback\", human_feedback)\nbuilder.add_node(\"step_3\", step_3)\nbuilder.add_edge(START, \"step_1\")\nbuilder.add_edge(\"step_1\", \"human_feedback\")\nbuilder.add_edge(\"human_feedback\", \"step_3\")\nbuilder.add_edge(\"step_3\", END)\ngraph = builder.compile(checkpointer=InMemorySaver())   # 必须有 checkpointer\n\nthread = {\"configurable\": {\"thread_id\": \"1\"}}\n\n# 第一次运行：跑到 human_feedback 就停下\nfor event in graph.stream({\"input\": \"你好\"}, thread, stream_mode=\"updates\"):\n    print(event)\n\n# 恢复：把人的反馈送回去（还是同一个 thread）\nfor event in graph.stream(Command(resume=\"去第三步\"), thread, stream_mode=\"updates\"):\n    print(event)",
        "en": "from typing import TypedDict\nfrom langgraph.graph import StateGraph, START, END\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.types import interrupt, Command\n\nclass State(TypedDict):\n    input: str\n    user_feedback: str\n\ndef step_1(state: State):\n    print(\"---Step 1---\")                 # returns nothing = state unchanged\n\ndef human_feedback(state: State):\n    print(\"---human_feedback---\")\n    feedback = interrupt(\"Please provide feedback:\")   # first run: the graph stops here\n    return {\"user_feedback\": feedback}                 # after resuming: the person's value\n\ndef step_3(state: State):\n    print(\"---Step 3---\")\n\nbuilder = StateGraph(State)\nbuilder.add_node(\"step_1\", step_1)\nbuilder.add_node(\"human_feedback\", human_feedback)\nbuilder.add_node(\"step_3\", step_3)\nbuilder.add_edge(START, \"step_1\")\nbuilder.add_edge(\"step_1\", \"human_feedback\")\nbuilder.add_edge(\"human_feedback\", \"step_3\")\nbuilder.add_edge(\"step_3\", END)\ngraph = builder.compile(checkpointer=InMemorySaver())   # a checkpointer is required\n\nthread = {\"configurable\": {\"thread_id\": \"1\"}}\n\n# First run: goes as far as human_feedback and stops\nfor event in graph.stream({\"input\": \"hello\"}, thread, stream_mode=\"updates\"):\n    print(event)\n\n# Resume: send the person's feedback back (same thread)\nfor event in graph.stream(Command(resume=\"go to step 3\"), thread, stream_mode=\"updates\"):\n    print(event)"
      },
      "note": {
        "zh": "和视频一样，`step_1`、`step_3` 不改状态，只打印一行日志，方便看出执行顺序。完整文件：`practice/l34_human_feedback.py`（不需要 API key）。",
        "en": "As in the video, `step_1` and `step_3` don't change the state; they just print a log line so you can see the order. Full file: `practice/l34_human_feedback.py` (no API key needed)."
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
        "zh": "---Step 1---\n{'step_1': None}\n---human_feedback---\n{'__interrupt__': (Interrupt(value='请提供反馈：', id='…', response_schema=None),)}\n---human_feedback---                 <- 恢复时这个节点又执行了一次（第四部分讲原因）\n{'human_feedback': {'user_feedback': '去第三步'}}\n---Step 3---\n{'step_3': None}",
        "en": "---Step 1---\n{'step_1': None}\n---human_feedback---\n{'__interrupt__': (Interrupt(value='Please provide feedback:', id='…', response_schema=None),)}\n---human_feedback---                 <- on resume this node ran again (why: part 4)\n{'human_feedback': {'user_feedback': 'go to step 3'}}\n---Step 3---\n{'step_3': None}"
      }
    },
    {
      "t": "p",
      "zh": "怎么读这些输出：\n- `stream_mode=\"updates\"` 时，每个事件是 `{节点名: 这个节点返回的更新}`。`None` 表示节点什么都没返回。\n- 键为 `\"__interrupt__\"` 的事件表示**图停下了**，里面的 `Interrupt` 对象的 `.value` 就是你传给 `interrupt()` 的那句提示。\n- 停下时 `graph.get_state(thread).next` 是 `('human_feedback',)`：图记得自己停在哪。\n\n`stream` 老师在 31 集已经用过，38 集会专门讲流式输出。不用 `stream`、改用 `invoke` 也可以：停下时返回的字典里有 `result[\"__interrupt__\"]`，它是一个列表，用 `result[\"__interrupt__\"][0].value` 取出提示。",
      "en": "How to read the output:\n- With `stream_mode=\"updates\"`, each event is `{node name: the update that node returned}`. `None` means the node returned nothing.\n- An event whose key is `\"__interrupt__\"` means **the graph has stopped**; the `.value` of the `Interrupt` object inside is the prompt you passed to `interrupt()`.\n- While stopped, `graph.get_state(thread).next` is `('human_feedback',)`: the graph remembers where it stopped.\n\nThe instructor already used `stream` in lesson 31, and lesson 38 covers streaming in depth. You can use `invoke` instead: the dict it returns when stopped contains `result[\"__interrupt__\"]`, a list – read the prompt with `result[\"__interrupt__\"][0].value`."
    },
    {
      "t": "check",
      "q": {
        "zh": "第一次 `stream` 结束时，哪些节点执行过了？",
        "en": "When the first `stream` ends, which nodes have run?"
      },
      "options": [
        {
          "zh": "三个节点都执行完了",
          "en": "All three nodes"
        },
        {
          "zh": "只有 `step_1`",
          "en": "Only `step_1`"
        },
        {
          "zh": "`step_1` 执行完，`human_feedback` 执行到 `interrupt` 那一行就停了，`step_3` 还没执行",
          "en": "`step_1` finished, `human_feedback` ran up to the `interrupt` line and stopped, `step_3` hasn't run"
        },
        {
          "zh": "一个都没执行，程序在等键盘输入",
          "en": "None – the program is waiting for keyboard input"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "输出里能看到 `---Step 1---` 和 `---human_feedback---`，然后是 `__interrupt__` 事件。`stream` 正常结束返回，并不会卡在那里等输入。",
        "en": "The output shows `---Step 1---` and `---human_feedback---`, then the `__interrupt__` event. `stream` finishes normally; it doesn't block waiting for input."
      }
    },
    {
      "t": "h",
      "zh": "三、interrupt 和 Command(resume) 怎么配合",
      "en": "3. How interrupt and Command(resume) work together"
    },
    {
      "t": "p",
      "zh": "[▶ 02:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=158) 整个过程分四步：\n1. 节点里调用 `interrupt(提示)`，图**立刻停下**，提示交给外面（出现在 `\"__interrupt__\"` 里）。\n2. 停下时的进度由 checkpointer 存在当前 `thread_id` 名下。\n3. [▶ 03:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=191) 人给出反馈后，用 `Command(resume=反馈)` 再调用一次 `stream`（或 `invoke`），`thread` 不变。`Command` 是「给图下指令」的对象，`resume` 这个参数专门和 `interrupt` 配合使用。\n4. 图回到停下的节点，这一次 `interrupt(...)` 不再暂停，而是**返回** resume 的值。\n\n[▶ 03:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=222) 老师恢复时传的是「go to step 3」，然后 `step_3` 就执行了。但要注意，这句话**并不负责跳转**，老师自己也提到随便传一个值，图同样会往下走：下一步去哪由图的边决定，resume 的值只是成了 `interrupt(...)` 的返回值，最后存进了 `user_feedback`。",
      "en": "[▶ 02:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=158) The whole process has four steps:\n1. A node calls `interrupt(prompt)`; the graph **stops at once** and hands the prompt out (it appears under `\"__interrupt__\"`).\n2. The checkpointer stores the progress under the current `thread_id`.\n3. [▶ 03:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=191) Once the person has given feedback, call `stream` (or `invoke`) again with `Command(resume=feedback)` and the same `thread`. `Command` is an object that “gives the graph an instruction”, and its `resume` argument is made to work with `interrupt`.\n4. The graph returns to the stopped node, and this time `interrupt(...)` doesn't pause – it **returns** the resume value.\n\n[▶ 03:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=222) The instructor resumes with “go to step 3”, and `step_3` runs. But note that this text **does not do any routing** – as the instructor himself mentions, any value would make the graph carry on. Where to go next is decided by the edges; the resume value simply becomes the return value of `interrupt(...)` and ends up in `user_feedback`."
    },
    {
      "t": "warn",
      "zh": "恢复要满足三个条件，缺一个都不行（都在本机试过）：\n- **编译时没有 checkpointer**：图能停下，但恢复时报 `RuntimeError: Cannot use Command(resume=...) without checkpointer`。\n- **config 里没有 `thread_id`**：一调用就报 `ValueError`，提示缺少 `thread_id`。\n- **恢复时换了 `thread_id`**：找不到刚才停下的那次运行，图从头开始，又停在同一个地方。",
      "en": "Resuming needs all three of these (each tried on this machine):\n- **No checkpointer at compile time**: the graph can stop, but resuming fails with `RuntimeError: Cannot use Command(resume=...) without checkpointer`.\n- **No `thread_id` in the config**: the very first call fails with a `ValueError` about the missing `thread_id`.\n- **A different `thread_id` when resuming**: the stopped run isn't found, so the graph starts over and stops at the same place again."
    },
    {
      "t": "h",
      "zh": "四、为什么 human_feedback 打印了两次",
      "en": "4. Why human_feedback printed twice"
    },
    {
      "t": "p",
      "zh": "回头看输出：`---human_feedback---` 出现了两次。这是最容易误解的一点：恢复**不是**从 `interrupt(...)` 那一行接着往下走，而是把**整个节点函数重新调用一次**。第二次执行到 `interrupt(...)` 时，LangGraph 发现已经有 resume 的值了，就直接把它返回。\n\n所以：\n- 写在 `interrupt` **前面**的代码会执行**两次**。如果那里是调用模型、发邮件、写数据库这类有副作用的操作，它们就会重复发生。把它们放到 `interrupt` 后面，或者拆到前一个节点里。\n- `interrupt` 能让函数「停在半路」，靠的是**抛出异常**（`raise` 见 11 节，`try/except` 见 07 节）。下面用纯 Python 模拟一下，可以直接点运行：",
      "en": "Look back at the output: `---human_feedback---` appears twice. This is the most misunderstood point: resuming does **not** continue from the `interrupt(...)` line – the **whole node function is called again**. When it reaches `interrupt(...)` the second time, LangGraph sees a resume value is waiting and simply returns it.\n\nSo:\n- Code **before** `interrupt` runs **twice**. If it calls a model, sends an email or writes to a database, those side effects happen twice. Move them after the `interrupt`, or into an earlier node.\n- `interrupt` can stop a function halfway because it **raises an exception** (`raise`: lesson 11; `try/except`: lesson 07). Here is a pure-Python model of it you can run directly:"
    },
    {
      "t": "code",
      "file": {
        "zh": "用异常模拟 interrupt",
        "en": "Simulating interrupt with an exception"
      },
      "run": true,
      "code": {
        "zh": "class Pause(Exception):          # 自定义一种异常，表示「暂停」\n    pass\n\nresume_values = []               # 模拟 checkpointer 里保存的恢复值\n\ndef fake_interrupt(prompt):\n    if resume_values:            # 已经有恢复值了：直接返回它\n        return resume_values[0]\n    raise Pause(prompt)          # 还没有：抛出异常，函数就停在这一行\n\ndef human_feedback():\n    print(\"---human_feedback---\")\n    feedback = fake_interrupt(\"请提供反馈：\")\n    return {\"user_feedback\": feedback}\n\ntry:                             # 第一次运行\n    human_feedback()\nexcept Pause as p:\n    print(\"图停下了，提示是：\", p)\n\nresume_values.append(\"去第三步\")   # 相当于 Command(resume=\"去第三步\")\nprint(human_feedback())          # 恢复 = 把整个节点重新调用一次",
        "en": "class Pause(Exception):          # our own exception type meaning \"pause\"\n    pass\n\nresume_values = []               # stands in for the resume values a checkpointer keeps\n\ndef fake_interrupt(prompt):\n    if resume_values:            # a resume value exists: return it\n        return resume_values[0]\n    raise Pause(prompt)          # none yet: raise, so the function stops on this line\n\ndef human_feedback():\n    print(\"---human_feedback---\")\n    feedback = fake_interrupt(\"Please provide feedback:\")\n    return {\"user_feedback\": feedback}\n\ntry:                             # first run\n    human_feedback()\nexcept Pause as p:\n    print(\"The graph stopped, prompt:\", p)\n\nresume_values.append(\"go to step 3\")   # like Command(resume=\"go to step 3\")\nprint(human_feedback())                # resume = call the whole node again"
      },
      "note": {
        "zh": "LangGraph 真正抛出的异常叫 `GraphInterrupt`，它也是 `Exception` 的子类。所以**不要**用 `try/except Exception` 把 `interrupt()` 包起来：异常被你自己接住，图就停不下来了。",
        "en": "The exception LangGraph really raises is `GraphInterrupt`, also a subclass of `Exception`. So **don't** wrap `interrupt()` in `try/except Exception`: you would catch it yourself and the graph would never stop."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "节点里依次是 `print(\"A\")`、`x = interrupt(\"?\")`、`print(\"B\")`。停一次再恢复，一共打印出什么？",
        "en": "A node does `print(\"A\")`, then `x = interrupt(\"?\")`, then `print(\"B\")`. After one stop and one resume, what has been printed?"
      },
      "options": [
        {
          "zh": "A B",
          "en": "A B"
        },
        {
          "zh": "A B B",
          "en": "A B B"
        },
        {
          "zh": "A A B",
          "en": "A A B"
        },
        {
          "zh": "B",
          "en": "B"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "第一次打印 A 后在 `interrupt` 处停下；恢复时整个节点重新执行，再打印一次 A，这次 `interrupt` 直接返回值，于是打印 B。",
        "en": "The first run prints A and stops at `interrupt`; on resume the whole node runs again, printing A once more, then `interrupt` returns the value and B is printed."
      }
    },
    {
      "t": "h",
      "zh": "五、例子二：让智能体自己决定什么时候问人",
      "en": "5. Example 2: let the agent decide when to ask"
    },
    {
      "t": "p",
      "zh": "[▶ 04:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=254) 第二个例子更接近实际：一个能搜索的智能体，用户让它「先问我在哪，再查那里的天气」。做法是给模型**两个工具**：\n- `search`：真正的工具（假的搜索，结果写死），交给 `ToolNode` 执行；\n- `AskHuman`：一个 pydantic 类，只有一个 `question` 字段。它只是让模型**知道自己可以提问**，并不会被执行。模型「调用」它时，图转到专门的 `ask_human` 节点，在那里 `interrupt`。\n\n这些零件在 32 集的视频里老师搭 ReAct 智能体时已经用过：`bind_tools` 把工具交给模型；`ToolNode` 是 LangGraph 现成的「执行工具」节点，它执行最后一条 AI 消息里的工具调用，把结果包成 tool 消息；路由函数看最后一条消息有没有工具调用来决定去向。39 集会系统地讲工具调用。",
      "en": "[▶ 04:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=254) The second example is closer to real use: an agent that can search, and a user who says “ask me where I am first, then check the weather there”. The model gets **two tools**:\n- `search`: a real tool (a fake search with a hard-coded result) run by `ToolNode`;\n- `AskHuman`: a pydantic class with a single `question` field. It only lets the model **know it may ask a question**; it is never executed. When the model “calls” it, the graph goes to a dedicated `ask_human` node and calls `interrupt` there.\n\nThe instructor already used these parts in lesson 32's video when he built a ReAct agent: `bind_tools` hands tools to the model; `ToolNode` is LangGraph's ready-made “run the tools” node, which runs the tool calls in the last AI message and wraps the results in tool messages; a router looks at whether the last message has tool calls to pick the next node. Lesson 39 covers tool calling systematically."
    },
    {
      "t": "code",
      "file": "ask_human_agent.py",
      "code": {
        "zh": "from pydantic import BaseModel\nfrom langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom langgraph.prebuilt import ToolNode\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.types import interrupt, Command\nfrom llm import API_KEY, MODEL\n\n@tool\ndef search(query: str) -> str:\n    \"\"\"上网搜索信息。\"\"\"\n    return f\"搜索「{query}」的结果：晴朗，25°C\"     # 假的搜索，结果写死\n\ntools = [search]\ntool_node = ToolNode(tools)\n\nclass AskHuman(BaseModel):\n    \"\"\"向用户提一个问题。\"\"\"\n    question: str\n\n# AskHuman 也交给模型，模型才知道可以「提问」；但它不放进 ToolNode\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY).bind_tools(tools + [AskHuman])\n\ndef should_continue(state: MessagesState):\n    last_message = state[\"messages\"][-1]\n    if not last_message.tool_calls:\n        return END                                      # 没有工具调用：结束\n    elif last_message.tool_calls[0][\"name\"] == \"AskHuman\":\n        return \"ask_human\"                              # 想问人\n    else:\n        return \"action\"                                 # 真正的工具\n\ndef call_model(state: MessagesState):\n    response = model.invoke(state[\"messages\"])\n    return {\"messages\": [response]}\n\ndef ask_human(state: MessagesState):\n    tool_call = state[\"messages\"][-1].tool_calls[0]\n    ask = AskHuman.model_validate(tool_call[\"args\"])    # 检查参数的格式\n    location = interrupt(ask.question)                  # 停下，等人回答\n    tool_message = {\"tool_call_id\": tool_call[\"id\"], \"type\": \"tool\", \"content\": location}\n    return {\"messages\": [tool_message]}                 # 人的回答 = 这次调用的结果\n\nworkflow = StateGraph(MessagesState)\nworkflow.add_node(\"agent\", call_model)\nworkflow.add_node(\"action\", tool_node)\nworkflow.add_node(\"ask_human\", ask_human)\nworkflow.add_edge(START, \"agent\")\nworkflow.add_conditional_edges(\"agent\", should_continue, path_map=[\"ask_human\", \"action\", END])\nworkflow.add_edge(\"action\", \"agent\")\nworkflow.add_edge(\"ask_human\", \"agent\")\napp = workflow.compile(checkpointer=InMemorySaver())",
        "en": "from pydantic import BaseModel\nfrom langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom langgraph.prebuilt import ToolNode\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.types import interrupt, Command\nfrom llm import API_KEY, MODEL\n\n@tool\ndef search(query: str) -> str:\n    \"\"\"Search the web for information.\"\"\"\n    return f\"Results for '{query}': sunny, 25°C\"     # a fake search with a fixed result\n\ntools = [search]\ntool_node = ToolNode(tools)\n\nclass AskHuman(BaseModel):\n    \"\"\"Ask the user a question.\"\"\"\n    question: str\n\n# AskHuman is bound too, so the model knows it can ask; it is NOT put in ToolNode\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY).bind_tools(tools + [AskHuman])\n\ndef should_continue(state: MessagesState):\n    last_message = state[\"messages\"][-1]\n    if not last_message.tool_calls:\n        return END                                      # no tool call: finish\n    elif last_message.tool_calls[0][\"name\"] == \"AskHuman\":\n        return \"ask_human\"                              # wants to ask a person\n    else:\n        return \"action\"                                 # a real tool\n\ndef call_model(state: MessagesState):\n    response = model.invoke(state[\"messages\"])\n    return {\"messages\": [response]}\n\ndef ask_human(state: MessagesState):\n    tool_call = state[\"messages\"][-1].tool_calls[0]\n    ask = AskHuman.model_validate(tool_call[\"args\"])    # check the arguments' format\n    location = interrupt(ask.question)                  # stop and wait for the answer\n    tool_message = {\"tool_call_id\": tool_call[\"id\"], \"type\": \"tool\", \"content\": location}\n    return {\"messages\": [tool_message]}                 # the answer = this call's result\n\nworkflow = StateGraph(MessagesState)\nworkflow.add_node(\"agent\", call_model)\nworkflow.add_node(\"action\", tool_node)\nworkflow.add_node(\"ask_human\", ask_human)\nworkflow.add_edge(START, \"agent\")\nworkflow.add_conditional_edges(\"agent\", should_continue, path_map=[\"ask_human\", \"action\", END])\nworkflow.add_edge(\"action\", \"agent\")\nworkflow.add_edge(\"ask_human\", \"agent\")\napp = workflow.compile(checkpointer=InMemorySaver())"
      },
      "note": {
        "zh": "`tools + [AskHuman]` 是用 `+` 拼接两个列表（10 节）。`path_map` 列出 `should_continue` 可能返回的节点，LangGraph 靠它知道有哪些边（画图时用得上）。",
        "en": "`tools + [AskHuman]` joins two lists with `+` (lesson 10). `path_map` lists the nodes `should_continue` may return, so LangGraph knows the edges (handy when drawing the graph)."
      }
    },
    {
      "t": "p",
      "zh": "[▶ 05:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=315) 重点看 `ask_human` 节点，它做了四件事：\n1. 从最后一条消息里取出这次工具调用（里面有 `id`、`name`、`args`）；\n2. 用 `AskHuman.model_validate(...)` 检查参数，老师特意提到这是 pydantic 的校验方式（见下面的 Python 小课堂）；\n3. `interrupt(ask.question)`：把模型想问的问题交出去，图停下；\n4. 恢复后，把人的回答包成一条 **tool 消息**，`tool_call_id` 和这次调用的 `id` 对上。这正是 05 节的规则：带工具调用的 AI 消息后面，每个调用都要有对应的 tool 消息。对模型来说，人的回答就是「AskHuman 这个工具的执行结果」。\n\n字典 `{\"type\": \"tool\", ...}` 会被自动转成 `ToolMessage`，效果和写 `ToolMessage(content=location, tool_call_id=...)` 一样。\n\n[▶ 05:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=348) 图的结构：`agent` 和 `action`、`agent` 和 `ask_human` 之间各有一个循环。",
      "en": "[▶ 05:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=315) Focus on the `ask_human` node. It does four things:\n1. takes this tool call from the last message (it has an `id`, a `name` and `args`);\n2. checks the arguments with `AskHuman.model_validate(...)` – the instructor points out this is pydantic's validation (see the Python mini-lesson below);\n3. `interrupt(ask.question)` hands out the question the model wants to ask, and the graph stops;\n4. after resuming, it wraps the person's answer in a **tool message** whose `tool_call_id` matches the call's `id`. This is the rule from lesson 05: after an AI message with tool calls, every call needs its tool message. To the model, the person's answer is simply “the result of the AskHuman tool”.\n\nThe dict `{\"type\": \"tool\", ...}` is converted into a `ToolMessage` automatically – the same as writing `ToolMessage(content=location, tool_call_id=...)`.\n\n[▶ 05:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=348) The graph's shape: one loop between `agent` and `action`, and another between `agent` and `ask_human`."
    },
    {
      "t": "code",
      "lang": "text",
      "file": {
        "zh": "图的结构",
        "en": "The graph"
      },
      "code": {
        "zh": "START -> agent --没有工具调用----> END\n           |---调用 search-----> action ----> agent\n           |---调用 AskHuman---> ask_human -> agent（ask_human 里 interrupt 等人回答）",
        "en": "START -> agent --no tool call---> END\n           |---calls search-----> action ----> agent\n           |---calls AskHuman---> ask_human -> agent  (ask_human calls interrupt and waits)"
      }
    },
    {
      "t": "py",
      "title": {
        "zh": "pydantic 的 model_validate：拿字典造对象，顺便检查",
        "en": "pydantic's model_validate: build an object from a dict and check it"
      },
      "zh": "`BaseModel` 在 11 节的 Python 小课堂学过：写一个类，规定每个字段的类型；那里用 `model_validate_json` 从 **JSON 文本**创建对象。这里用它的兄弟方法：\n-`类名.model_validate(字典)`：用一个**字典**创建对象，同时按字段类型检查。字段缺了、类型不对，就抛出 `ValidationError`，并指出是哪个字段出的错。\n- 模型给出的 `tool_call[\"args\"]` 就是一个普通字典。校验通过后用 `ask.question` 点号取值；万一模型给的参数格式不对，报错信息也清楚。\n- 类的 docstring 会变成工具说明交给模型（docstring 见 08 节），所以 `AskHuman` 的那句说明就是模型看到的「这个工具是干什么的」。",
      "en": "You met `BaseModel` in lesson 11's Python mini-lesson: write a class that fixes each field's type; there, `model_validate_json` built an object from **JSON text**. Here we use its sibling:\n-`ClassName.model_validate(dict)` builds an object from a **dict** and checks it against the field types. A missing field or a wrong type raises `ValidationError`, naming the field at fault.\n- The model's `tool_call[\"args\"]` is just a plain dict. Once validated, read values with a dot, as in `ask.question`; and if the model sends badly shaped arguments, the error message is clear.\n- The class docstring becomes the tool description sent to the model (docstrings: lesson 08), so `AskHuman`'s one-line docstring is what the model reads as “what this tool is for”.",
      "code": {
        "zh": "from pydantic import BaseModel, ValidationError\n\nclass AskHuman(BaseModel):\n    \"\"\"向用户提一个问题。\"\"\"\n    question: str\n\nargs = {\"question\": \"请问您在哪个城市？\"}     # 模型给出的参数就是这样一个字典\nask = AskHuman.model_validate(args)\nprint(ask)              # question='请问您在哪个城市？'\nprint(ask.question)     # 用点号取字段\n\nfor bad in [{\"q\": \"你在哪？\"}, {\"question\": 123}]:\n    try:\n        AskHuman.model_validate(bad)\n    except ValidationError as e:\n        error = e.errors()[0]\n        print(\"不合格：\", error[\"loc\"], error[\"type\"])   # 哪个字段、什么错误",
        "en": "from pydantic import BaseModel, ValidationError\n\nclass AskHuman(BaseModel):\n    \"\"\"Ask the user a question.\"\"\"\n    question: str\n\nargs = {\"question\": \"Which city are you in?\"}   # the model's arguments are a dict like this\nask = AskHuman.model_validate(args)\nprint(ask)              # question='Which city are you in?'\nprint(ask.question)     # read a field with a dot\n\nfor bad in [{\"q\": \"Where are you?\"}, {\"question\": 123}]:\n    try:\n        AskHuman.model_validate(bad)\n    except ValidationError as e:\n        error = e.errors()[0]\n        print(\"Invalid:\", error[\"loc\"], error[\"type\"])   # which field, what went wrong"
      }
    },
    {
      "t": "h",
      "zh": "六、运行：先问在哪，再查天气",
      "en": "6. Run it: ask where, then check the weather"
    },
    {
      "t": "p",
      "zh": "[▶ 06:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=381) 老师用 `stream` 运行，`stream_mode=\"values\"` 时每个事件是**完整的状态**，打印其中最新的一条消息即可。在本机的 LangGraph 1.2.12 里，停下的那个事件除了 `messages` 还带着 `\"__interrupt__\"`，所以先判断一下（用 `in` 判断字典里有没有某个键，见 07 节）：",
      "en": "[▶ 06:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=381) The instructor runs it with `stream`. With `stream_mode=\"values\"` each event is the **whole state**, so we print its newest message. In the installed LangGraph 1.2.12, the event at the stop carries `\"__interrupt__\"` as well as `messages`, so check for it first (`in` tests whether a dict has a key: lesson 07):"
    },
    {
      "t": "code",
      "file": "run_ask_human.py",
      "code": {
        "zh": "config = {\"configurable\": {\"thread_id\": \"2\"}}\n\ndef show(stream):\n    for event in stream:\n        if \"__interrupt__\" in event:                # 停下的那个事件\n            print(\"[暂停] 问题：\", event[\"__interrupt__\"][0].value)\n        else:\n            event[\"messages\"][-1].pretty_print()    # 打印最新的一条消息\n\nquestion = \"先问问我在哪个城市，然后查一下那里的天气。\"\nshow(app.stream({\"messages\": [{\"role\": \"user\", \"content\": question}]}, config, stream_mode=\"values\"))\n\nshow(app.stream(Command(resume=\"北京\"), config, stream_mode=\"values\"))   # 回答「北京」",
        "en": "config = {\"configurable\": {\"thread_id\": \"2\"}}\n\ndef show(stream):\n    for event in stream:\n        if \"__interrupt__\" in event:                # the event at the stop\n            print(\"[paused] question:\", event[\"__interrupt__\"][0].value)\n        else:\n            event[\"messages\"][-1].pretty_print()    # print the newest message\n\nquestion = \"Ask me which city I'm in first, then check the weather there.\"\nshow(app.stream({\"messages\": [{\"role\": \"user\", \"content\": question}]}, config, stream_mode=\"values\"))\n\nshow(app.stream(Command(resume=\"Beijing\"), config, stream_mode=\"values\"))   # answer \"Beijing\""
      },
      "note": {
        "zh": "完整文件：`practice/l34_ask_human_solution.py`（需要 DeepSeek key），里面用 `while app.get_state(config).interrupts:` 循环，模型问几次都能处理。恢复后第一条打印的是停下前的那条 AI 消息，因为 values 模式会先把当前状态输出一次。",
        "en": "Full file: `practice/l34_ask_human_solution.py` (needs the DeepSeek key); it loops with `while app.get_state(config).interrupts:` so it copes however many times the model asks. After resuming, the first thing printed is the AI message from before the stop, because values mode first emits the current state."
      }
    },
    {
      "t": "p",
      "zh": "用 deepseek-flash 真实运行一次（回答「北京」），对话记录依次是：\n\n| 消息 | 内容 |\n|---|---|\n| Human | 先问问我在哪个城市，然后查一下那里的天气。 |\n| AI | 「我先问一下您所在的城市。」+ 调用 `AskHuman(question=\"请问您现在在哪个城市？\")` |\n| （暂停） | 问题：请问您现在在哪个城市？ |\n| Tool | `北京` ← `Command(resume=\"北京\")` 送进来的回答 |\n| AI | 调用 `search(query=\"北京 天气 今天 实时\")` |\n| Tool | 搜索「北京 天气 今天 实时」的结果：晴朗，25°C |\n| AI | 告诉你北京今天晴朗、25°C，还提醒出门前再看一下天气 App |",
      "en": "A real run with deepseek-flash (answering “Beijing”) produced this history:\n\n| Message | Content |\n|---|---|\n| Human | Ask me which city I'm in first, then check the weather there. |\n| AI | “Let me ask which city you're in.” + a call to `AskHuman(question=\"Which city are you in right now?\")` |\n| (paused) | Question: which city are you in right now? |\n| Tool | `Beijing` ← the answer sent in by `Command(resume=\"Beijing\")` |\n| AI | a call to `search(query=\"Beijing weather today live\")` |\n| Tool | Results for 'Beijing weather today live': sunny, 25°C |\n| AI | Tells you Beijing is sunny and 25°C today, and suggests checking a weather app before going out |"
    },
    {
      "t": "video",
      "zh": "视频里的过程一样：[▶ 06:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=412) 模型先调用 `AskHuman`，问「您在哪里，我可以帮您查当地天气」，图停下等待；[▶ 07:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=475) 老师用 `Command` 回答「北京」后，模型把「北京的天气」交给搜索工具；[▶ 08:27](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=507) 搜索结果是写死的，最后回答「北京天气晴朗，25 度」。老师最后总结：核心就是节点里用 `interrupt` 中断流程，再用 `Command(resume=...)` 恢复。",
      "en": "The video runs the same way: [▶ 06:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=412) the model first calls `AskHuman`, asking where the user is so it can check the local weather, and the graph stops to wait; [▶ 07:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=475) after the instructor answers “Beijing” with `Command`, the model passes “Beijing weather” to the search tool; [▶ 08:27](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=35&t=507) the search result is hard-coded, so the final answer is “sunny in Beijing, 25 degrees”. His summary: the core is `interrupt` inside a node to stop the flow, and `Command(resume=...)` to resume it."
    },
    {
      "t": "warn",
      "zh": "几点要注意：\n- 模型会不会去问，取决于**提示**。视频和这里都在用户的话里直接说了「先问我」；如果用户只说「查天气」，模型可能自己猜一个城市，或者用普通文字反问而不调用 `AskHuman`。想更可靠，可以加一条 system 提示：「缺少城市时必须先调用 AskHuman」。\n- `should_continue` 和 `ask_human` 都只看**第一个**工具调用。如果模型在同一条消息里同时调用了 `AskHuman` 和 `search`，`search` 那个调用没人回答，下一次请求模型会报错（05 节的规则）。教学例子这样够用，正式项目要把每个调用都处理到。\n- 恢复时 `ask_human` 会整个重新执行，所以 `interrupt` 前面只放了检查参数这种没有副作用的代码。",
      "en": "Things to watch:\n- Whether the model asks depends on the **prompt**. Both the video and this page say “ask me first” in the user's message; if the user just says “check the weather”, the model may guess a city or ask back in plain text without calling `AskHuman`. For more reliability, add a system prompt such as “if the city is missing, you must call AskHuman first”.\n- `should_continue` and `ask_human` only look at the **first** tool call. If the model calls `AskHuman` and `search` in the same message, the `search` call goes unanswered and the next model request fails (lesson 05's rule). That's fine for a teaching example; a real project should handle every call.\n- On resume `ask_human` runs again from the top, which is why only side-effect-free code (checking the arguments) sits before `interrupt`."
    },
    {
      "t": "note",
      "zh": "补充：另一种常见写法是把 `interrupt(question)` 直接写进一个 `@tool` 函数里，让 `ToolNode` 去执行它，执行到那一行时整个图同样会停下。效果一样，只是少了专门的 `ask_human` 节点。视频用的是上面「假工具 + 专门节点」的写法，先把它练熟。",
      "en": "Extra: another common style puts `interrupt(question)` straight into a `@tool` function and lets `ToolNode` run it; the whole graph stops when that line runs. The effect is the same, minus the dedicated `ask_human` node. The video uses the “pretend tool + dedicated node” style above, so master that first."
    },
    {
      "t": "check",
      "q": {
        "zh": "在智能体版本里，人回答的「北京」最终以什么形式交给了模型？",
        "en": "In the agent version, how does the person's answer “Beijing” reach the model?"
      },
      "options": [
        {
          "zh": "一条新的 user 消息",
          "en": "As a new user message"
        },
        {
          "zh": "一条 tool 消息，作为 AskHuman 这次调用的结果",
          "en": "As a tool message: the result of the AskHuman call"
        },
        {
          "zh": "写进 system 提示",
          "en": "Inserted into the system prompt"
        },
        {
          "zh": "存进 config 的 thread_id",
          "en": "Stored in the config's thread_id"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "`interrupt` 返回「北京」，`ask_human` 把它包成 `tool_call_id` 对得上的 tool 消息。模型看到的是：「我调用了 AskHuman，结果是北京」。",
        "en": "`interrupt` returns “Beijing”, and `ask_human` wraps it in a tool message with the matching `tool_call_id`. The model sees: “I called AskHuman and the result was Beijing”."
      }
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "老师恢复时传的是 `Command(resume=\"go to step 3\")`。这句话起什么作用？",
        "en": "The instructor resumes with `Command(resume=\"go to step 3\")`. What does that text do?"
      },
      "options": [
        {
          "zh": "让图跳到 `step_3`，不写这句就不会去 `step_3`",
          "en": "It sends the graph to `step_3`; without it `step_3` wouldn't run"
        },
        {
          "zh": "它成为 `interrupt(...)` 的返回值，被存进 `user_feedback`；下一步去哪由边决定",
          "en": "It becomes the return value of `interrupt(...)` and is stored in `user_feedback`; the edges decide what runs next"
        },
        {
          "zh": "它会被发给大模型",
          "en": "It is sent to the language model"
        },
        {
          "zh": "它是新的 `thread_id`",
          "en": "It is the new `thread_id`"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "resume 的值只是交给 `interrupt` 返回。`human_feedback` 后面连着 `step_3` 的边，所以不管传什么，图都会走到 `step_3`。",
        "en": "The resume value is just what `interrupt` returns. The edge after `human_feedback` leads to `step_3`, so the graph gets there whatever you pass."
      }
    },
    {
      "q": {
        "zh": "恢复之后，`---human_feedback---` 又打印了一次。原因是？",
        "en": "After resuming, `---human_feedback---` prints again. Why?"
      },
      "options": [
        {
          "zh": "`stream` 把每个事件打印了两次",
          "en": "`stream` prints every event twice"
        },
        {
          "zh": "图从 START 重新跑了一遍",
          "en": "The graph reran from START"
        },
        {
          "zh": "这是 LangGraph 的 bug",
          "en": "It is a LangGraph bug"
        },
        {
          "zh": "恢复时整个节点函数重新执行，这次 `interrupt` 直接返回 resume 的值",
          "en": "On resume the whole node function runs again, and this time `interrupt` returns the resume value"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "恢复不是从 `interrupt` 那一行接着跑，而是重新调用整个节点。`step_1` 没有再打印，说明并不是从头跑。",
        "en": "Resuming doesn't continue from the `interrupt` line; it calls the whole node again. `step_1` didn't print again, so the graph didn't start over."
      }
    },
    {
      "q": {
        "zh": "编译时忘了写 `checkpointer=...`，会怎样？",
        "en": "You forget `checkpointer=...` when compiling. What happens?"
      },
      "options": [
        {
          "zh": "图能停下，但用 `Command(resume=...)` 恢复时报 `RuntimeError`",
          "en": "The graph can stop, but resuming with `Command(resume=...)` raises `RuntimeError`"
        },
        {
          "zh": "一切正常",
          "en": "Everything works"
        },
        {
          "zh": "`interrupt` 会被忽略，图一口气跑完",
          "en": "`interrupt` is ignored and the graph runs to the end"
        },
        {
          "zh": "编译时就报错",
          "en": "Compiling fails"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "在本机试过：没有 checkpointer 时第一次能停下，恢复时报 `Cannot use Command(resume=...) without checkpointer`。进度没地方存，自然没法接着跑。",
        "en": "Tried on this machine: without a checkpointer the first run can stop, but resuming fails with `Cannot use Command(resume=...) without checkpointer`. With nowhere to keep the progress, it can't carry on."
      }
    },
    {
      "q": {
        "zh": "模型调用了 `AskHuman`，`should_continue` 应该返回什么？",
        "en": "The model called `AskHuman`. What should `should_continue` return?"
      },
      "options": [
        {
          "zh": "`\"action\"`，让 `ToolNode` 去执行 `AskHuman`",
          "en": "`\"action\"`, so `ToolNode` runs `AskHuman`"
        },
        {
          "zh": "`END`",
          "en": "`END`"
        },
        {
          "zh": "`\"ask_human\"`，由专门的节点 `interrupt` 等人回答",
          "en": "`\"ask_human\"`, so the dedicated node calls `interrupt` and waits"
        },
        {
          "zh": "`\"agent\"`",
          "en": "`\"agent\"`"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "`AskHuman` 只是一个让模型「能提问」的假工具，没有放进 `ToolNode`。它要去 `ask_human` 节点，在那里停下等人。",
        "en": "`AskHuman` is only a pretend tool that lets the model ask; it isn't in `ToolNode`. It must go to the `ask_human` node, which stops and waits for a person."
      }
    },
    {
      "q": {
        "zh": "`ask_human` 返回的 tool 消息里，`tool_call_id` 为什么必须等于这次调用的 `id`？",
        "en": "Why must the `tool_call_id` in `ask_human`'s tool message equal the call's `id`?"
      },
      "options": [
        {
          "zh": "不写也行，LangGraph 会自动补上",
          "en": "It's optional; LangGraph fills it in"
        },
        {
          "zh": "模型的每个工具调用都要有对应 id 的 tool 消息回答，否则下一次请求会报错",
          "en": "Every tool call needs a tool message with its id as the answer, or the next request fails"
        },
        {
          "zh": "这样 `interrupt` 才能停下",
          "en": "So that `interrupt` can stop"
        },
        {
          "zh": "id 决定下一步去哪个节点",
          "en": "The id decides the next node"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "这是 05 节讲过的消息规则：带 `tool_calls` 的 AI 消息后面，每个调用都要有一条 `tool_call_id` 对应的 tool 消息。",
        "en": "This is the message rule from lesson 05: after an AI message with `tool_calls`, each call needs a tool message with the matching `tool_call_id`."
      }
    },
    {
      "q": {
        "zh": "恢复时用了一个新的 `thread_id`，会怎样？",
        "en": "You resume with a new `thread_id`. What happens?"
      },
      "options": [
        {
          "zh": "照常恢复",
          "en": "It resumes normally"
        },
        {
          "zh": "报 `RuntimeError`",
          "en": "It raises `RuntimeError`"
        },
        {
          "zh": "两个 thread 的状态合并",
          "en": "The two threads' states are merged"
        },
        {
          "zh": "找不到刚才停下的运行，图当成一次新的运行，又停在同一个地方",
          "en": "The stopped run isn't found; the graph treats it as a new run and stops at the same place again"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "进度存在原来的 `thread_id` 名下。换了编号就是另一段会话，所以要从头开始。",
        "en": "The progress is stored under the original `thread_id`. A different id is a different conversation, so it starts over."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "例子一：等人反馈的节点 + 恢复",
        "en": "Example 1: the feedback node + resuming"
      },
      "code": {
        "zh": "def human_feedback(state: State):\n    print(\"---human_feedback---\")\n    feedback = [[interrupt]](\"请提供反馈：\")\n    return {\"[[user_feedback]]\": feedback}\n\ngraph = builder.compile([[checkpointer]]=InMemorySaver())\nthread = {\"configurable\": {\"[[thread_id]]\": \"1\"}}\n\nfor event in graph.stream({\"input\": \"你好\"}, thread, stream_mode=\"[[updates|values]]\"):\n    print(event)\n\nfor event in graph.stream([[Command]]([[resume]]=\"去第三步\"), thread, stream_mode=\"updates\"):\n    print(event)",
        "en": "def human_feedback(state: State):\n    print(\"---human_feedback---\")\n    feedback = [[interrupt]](\"Please provide feedback:\")\n    return {\"[[user_feedback]]\": feedback}\n\ngraph = builder.compile([[checkpointer]]=InMemorySaver())\nthread = {\"configurable\": {\"[[thread_id]]\": \"1\"}}\n\nfor event in graph.stream({\"input\": \"hello\"}, thread, stream_mode=\"[[updates|values]]\"):\n    print(event)\n\nfor event in graph.stream([[Command]]([[resume]]=\"go to step 3\"), thread, stream_mode=\"updates\"):\n    print(event)"
      },
      "explain": {
        "zh": "`interrupt` 停下并在恢复后返回值；checkpointer + `thread_id` 保存进度；`Command(resume=...)` 把值送回去。",
        "en": "`interrupt` stops and later returns the value; checkpointer + `thread_id` keep the progress; `Command(resume=...)` delivers the value."
      }
    },
    {
      "title": {
        "zh": "例子二：路由和 ask_human 节点",
        "en": "Example 2: the router and the ask_human node"
      },
      "code": {
        "zh": "def should_continue(state: MessagesState):\n    last_message = state[\"messages\"][-1]\n    if not last_message.[[tool_calls]]:\n        return END\n    elif last_message.tool_calls[0][\"name\"] == \"[[AskHuman]]\":\n        return \"[[ask_human]]\"\n    else:\n        return \"action\"\n\ndef ask_human(state: MessagesState):\n    tool_call = state[\"messages\"][-1].tool_calls[0]\n    ask = AskHuman.[[model_validate]](tool_call[\"args\"])\n    location = interrupt(ask.[[question]])\n    tool_message = {\"[[tool_call_id]]\": tool_call[\"id\"], \"type\": \"[[tool]]\", \"content\": location}\n    return {\"messages\": [tool_message]}\n\nworkflow.add_edge(\"ask_human\", \"[[agent]]\")",
        "en": "def should_continue(state: MessagesState):\n    last_message = state[\"messages\"][-1]\n    if not last_message.[[tool_calls]]:\n        return END\n    elif last_message.tool_calls[0][\"name\"] == \"[[AskHuman]]\":\n        return \"[[ask_human]]\"\n    else:\n        return \"action\"\n\ndef ask_human(state: MessagesState):\n    tool_call = state[\"messages\"][-1].tool_calls[0]\n    ask = AskHuman.[[model_validate]](tool_call[\"args\"])\n    location = interrupt(ask.[[question]])\n    tool_message = {\"[[tool_call_id]]\": tool_call[\"id\"], \"type\": \"[[tool]]\", \"content\": location}\n    return {\"messages\": [tool_message]}\n\nworkflow.add_edge(\"ask_human\", \"[[agent]]\")"
      },
      "explain": {
        "zh": "AskHuman 的调用走 `ask_human` 节点；节点里校验参数、`interrupt` 提问，再用 tool 消息回答这次调用，然后回到 `agent`。",
        "en": "AskHuman calls go to the `ask_human` node, which validates the arguments, asks with `interrupt`, answers the call with a tool message and returns to `agent`."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：中间停下等反馈的三节点图",
        "en": "Write it: a three-node graph that stops for feedback"
      },
      "task": {
        "zh": "不看上面的代码，写出视频里的例子一：\n1. `State` 有 `input` 和 `user_feedback` 两个字段\n2. `step_1`、`step_3` 只打印；`human_feedback` 用 `interrupt` 请求反馈，把返回值存进 `user_feedback`\n3. 连成 START → step_1 → human_feedback → step_3 → END，用 `InMemorySaver()` 编译\n4. 写好带 `thread_id` 的 config，用 `stream` 跑第一次，打印每个事件\n5. 用 `Command(resume=...)` 恢复，再打印每个事件\n\n（LangGraph 不能在浏览器里运行：写完点「检查要点」，再到 VS Code 里用 `.venv` 运行。）",
        "en": "Without looking above, write the video's example 1:\n1. a `State` with `input` and `user_feedback`\n2. `step_1` and `step_3` only print; `human_feedback` asks for feedback with `interrupt` and stores the result in `user_feedback`\n3. wire START → step_1 → human_feedback → step_3 → END and compile with `InMemorySaver()`\n4. build a config with a `thread_id`, run once with `stream` and print each event\n5. resume with `Command(resume=...)` and print each event again\n\n(LangGraph can't run in the browser: use “Check key points”, then run it in VS Code with `.venv`.)"
      },
      "starter": {
        "zh": "from typing import TypedDict\nfrom langgraph.graph import StateGraph, START, END\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.types import interrupt, Command\n\n# 1. State\n\n\n# 2. 三个节点\n\n\n# 3. 建图并编译\n\n\n# 4. 第一次运行\n\n\n# 5. 恢复\n",
        "en": "from typing import TypedDict\nfrom langgraph.graph import StateGraph, START, END\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.types import interrupt, Command\n\n# 1. State\n\n\n# 2. the three nodes\n\n\n# 3. build and compile\n\n\n# 4. first run\n\n\n# 5. resume\n"
      },
      "solution": {
        "zh": "from typing import TypedDict\nfrom langgraph.graph import StateGraph, START, END\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.types import interrupt, Command\n\n# 1. State\nclass State(TypedDict):\n    input: str\n    user_feedback: str\n\n# 2. 三个节点\ndef step_1(state: State):\n    print(\"---Step 1---\")\n\ndef human_feedback(state: State):\n    print(\"---human_feedback---\")\n    feedback = interrupt(\"请提供反馈：\")\n    return {\"user_feedback\": feedback}\n\ndef step_3(state: State):\n    print(\"---Step 3---\")\n\n# 3. 建图并编译\nbuilder = StateGraph(State)\nbuilder.add_node(\"step_1\", step_1)\nbuilder.add_node(\"human_feedback\", human_feedback)\nbuilder.add_node(\"step_3\", step_3)\nbuilder.add_edge(START, \"step_1\")\nbuilder.add_edge(\"step_1\", \"human_feedback\")\nbuilder.add_edge(\"human_feedback\", \"step_3\")\nbuilder.add_edge(\"step_3\", END)\ngraph = builder.compile(checkpointer=InMemorySaver())\n\n# 4. 第一次运行\nthread = {\"configurable\": {\"thread_id\": \"1\"}}\nfor event in graph.stream({\"input\": \"你好\"}, thread, stream_mode=\"updates\"):\n    print(event)\n\n# 5. 恢复\nfor event in graph.stream(Command(resume=\"去第三步\"), thread, stream_mode=\"updates\"):\n    print(event)",
        "en": "from typing import TypedDict\nfrom langgraph.graph import StateGraph, START, END\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.types import interrupt, Command\n\n# 1. State\nclass State(TypedDict):\n    input: str\n    user_feedback: str\n\n# 2. the three nodes\ndef step_1(state: State):\n    print(\"---Step 1---\")\n\ndef human_feedback(state: State):\n    print(\"---human_feedback---\")\n    feedback = interrupt(\"Please provide feedback:\")\n    return {\"user_feedback\": feedback}\n\ndef step_3(state: State):\n    print(\"---Step 3---\")\n\n# 3. build and compile\nbuilder = StateGraph(State)\nbuilder.add_node(\"step_1\", step_1)\nbuilder.add_node(\"human_feedback\", human_feedback)\nbuilder.add_node(\"step_3\", step_3)\nbuilder.add_edge(START, \"step_1\")\nbuilder.add_edge(\"step_1\", \"human_feedback\")\nbuilder.add_edge(\"human_feedback\", \"step_3\")\nbuilder.add_edge(\"step_3\", END)\ngraph = builder.compile(checkpointer=InMemorySaver())\n\n# 4. first run\nthread = {\"configurable\": {\"thread_id\": \"1\"}}\nfor event in graph.stream({\"input\": \"hello\"}, thread, stream_mode=\"updates\"):\n    print(event)\n\n# 5. resume\nfor event in graph.stream(Command(resume=\"go to step 3\"), thread, stream_mode=\"updates\"):\n    print(event)"
      },
      "checks": [
        {
          "zh": "`State` 里有 `user_feedback` 字段",
          "en": "`State` has a `user_feedback` field",
          "re": "^\\s+user_feedback\\s*:\\s*str"
        },
        {
          "zh": "节点里用 `变量 = interrupt(...)` 停下并接收反馈",
          "en": "A node stops with `x = interrupt(...)` and receives the feedback",
          "re": "^\\s+\\w+\\s*=\\s*interrupt\\("
        },
        {
          "zh": "把反馈存进 `user_feedback`",
          "en": "Stores the feedback in `user_feedback`",
          "re": "return\\s*\\{\\s*[\"']user_feedback[\"']\\s*:"
        },
        {
          "zh": "`step_1` 连到 `human_feedback`",
          "en": "`step_1` leads to `human_feedback`",
          "re": "add_edge\\(\\s*[\"']step_1[\"']\\s*,\\s*[\"']human_feedback[\"']\\s*\\)"
        },
        {
          "zh": "编译时传入 `checkpointer=`",
          "en": "Compiles with `checkpointer=`",
          "re": "compile\\(\\s*checkpointer\\s*="
        },
        {
          "zh": "config 里有 `thread_id`",
          "en": "The config has a `thread_id`",
          "re": "[\"']configurable[\"']\\s*:\\s*\\{\\s*[\"']thread_id[\"']"
        },
        {
          "zh": "用 `Command(resume=...)` 恢复",
          "en": "Resumes with `Command(resume=...)`",
          "re": "Command\\(\\s*resume\\s*="
        }
      ]
    },
    {
      "title": {
        "zh": "手写：路由函数和 ask_human 节点",
        "en": "Write it: the router and the ask_human node"
      },
      "task": {
        "zh": "工具、`AskHuman`、模型和 `call_model` 都已经写好。补全：\n1. `should_continue`：没有工具调用返回 `END`；第一个调用的名字是 `\"AskHuman\"` 时返回 `\"ask_human\"`；否则返回 `\"action\"`\n2. `ask_human`：取出第一个工具调用，用 `AskHuman.model_validate(...)` 校验参数，`interrupt(ask.question)` 提问，返回一条 `tool_call_id` 对得上的 tool 消息\n3. 建图：`agent`、`action`、`ask_human` 三个节点，`agent` 后面接 `should_continue`，`action` 和 `ask_human` 都回到 `agent`，用 checkpointer 编译\n\n本地练习文件：`practice/l34_ask_human_todo.py`。",
        "en": "The tool, `AskHuman`, the model and `call_model` are given. Complete:\n1. `should_continue`: no tool calls → `END`; first call named `\"AskHuman\"` → `\"ask_human\"`; otherwise `\"action\"`\n2. `ask_human`: take the first tool call, validate its arguments with `AskHuman.model_validate(...)`, ask with `interrupt(ask.question)`, and return a tool message with the matching `tool_call_id`\n3. the graph: nodes `agent`, `action`, `ask_human`; `should_continue` after `agent`; `action` and `ask_human` both back to `agent`; compile with a checkpointer\n\nLocal practice file: `practice/l34_ask_human_todo.py`."
      },
      "starter": {
        "zh": "from pydantic import BaseModel\nfrom langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom langgraph.prebuilt import ToolNode\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.types import interrupt, Command\nfrom llm import API_KEY, MODEL\n\n@tool\ndef search(query: str) -> str:\n    \"\"\"上网搜索信息。\"\"\"\n    return f\"搜索「{query}」的结果：晴朗，25°C\"\n\ntools = [search]\ntool_node = ToolNode(tools)\n\nclass AskHuman(BaseModel):\n    \"\"\"向用户提一个问题。\"\"\"\n    question: str\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY).bind_tools(tools + [AskHuman])\n\ndef call_model(state: MessagesState):\n    return {\"messages\": [model.invoke(state[\"messages\"])]}\n\n# 1. should_continue\n\n\n# 2. ask_human\n\n\n# 3. 建图并编译\n",
        "en": "from pydantic import BaseModel\nfrom langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom langgraph.prebuilt import ToolNode\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.types import interrupt, Command\nfrom llm import API_KEY, MODEL\n\n@tool\ndef search(query: str) -> str:\n    \"\"\"Search the web for information.\"\"\"\n    return f\"Results for '{query}': sunny, 25°C\"\n\ntools = [search]\ntool_node = ToolNode(tools)\n\nclass AskHuman(BaseModel):\n    \"\"\"Ask the user a question.\"\"\"\n    question: str\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY).bind_tools(tools + [AskHuman])\n\ndef call_model(state: MessagesState):\n    return {\"messages\": [model.invoke(state[\"messages\"])]}\n\n# 1. should_continue\n\n\n# 2. ask_human\n\n\n# 3. build and compile\n"
      },
      "solution": {
        "zh": "from pydantic import BaseModel\nfrom langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom langgraph.prebuilt import ToolNode\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.types import interrupt, Command\nfrom llm import API_KEY, MODEL\n\n@tool\ndef search(query: str) -> str:\n    \"\"\"上网搜索信息。\"\"\"\n    return f\"搜索「{query}」的结果：晴朗，25°C\"\n\ntools = [search]\ntool_node = ToolNode(tools)\n\nclass AskHuman(BaseModel):\n    \"\"\"向用户提一个问题。\"\"\"\n    question: str\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY).bind_tools(tools + [AskHuman])\n\ndef call_model(state: MessagesState):\n    return {\"messages\": [model.invoke(state[\"messages\"])]}\n\n# 1. should_continue\ndef should_continue(state: MessagesState):\n    last_message = state[\"messages\"][-1]\n    if not last_message.tool_calls:\n        return END\n    elif last_message.tool_calls[0][\"name\"] == \"AskHuman\":\n        return \"ask_human\"\n    else:\n        return \"action\"\n\n# 2. ask_human\ndef ask_human(state: MessagesState):\n    tool_call = state[\"messages\"][-1].tool_calls[0]\n    ask = AskHuman.model_validate(tool_call[\"args\"])\n    location = interrupt(ask.question)\n    tool_message = {\"tool_call_id\": tool_call[\"id\"], \"type\": \"tool\", \"content\": location}\n    return {\"messages\": [tool_message]}\n\n# 3. 建图并编译\nworkflow = StateGraph(MessagesState)\nworkflow.add_node(\"agent\", call_model)\nworkflow.add_node(\"action\", tool_node)\nworkflow.add_node(\"ask_human\", ask_human)\nworkflow.add_edge(START, \"agent\")\nworkflow.add_conditional_edges(\"agent\", should_continue, path_map=[\"ask_human\", \"action\", END])\nworkflow.add_edge(\"action\", \"agent\")\nworkflow.add_edge(\"ask_human\", \"agent\")\napp = workflow.compile(checkpointer=InMemorySaver())",
        "en": "from pydantic import BaseModel\nfrom langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom langgraph.prebuilt import ToolNode\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.types import interrupt, Command\nfrom llm import API_KEY, MODEL\n\n@tool\ndef search(query: str) -> str:\n    \"\"\"Search the web for information.\"\"\"\n    return f\"Results for '{query}': sunny, 25°C\"\n\ntools = [search]\ntool_node = ToolNode(tools)\n\nclass AskHuman(BaseModel):\n    \"\"\"Ask the user a question.\"\"\"\n    question: str\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY).bind_tools(tools + [AskHuman])\n\ndef call_model(state: MessagesState):\n    return {\"messages\": [model.invoke(state[\"messages\"])]}\n\n# 1. should_continue\ndef should_continue(state: MessagesState):\n    last_message = state[\"messages\"][-1]\n    if not last_message.tool_calls:\n        return END\n    elif last_message.tool_calls[0][\"name\"] == \"AskHuman\":\n        return \"ask_human\"\n    else:\n        return \"action\"\n\n# 2. ask_human\ndef ask_human(state: MessagesState):\n    tool_call = state[\"messages\"][-1].tool_calls[0]\n    ask = AskHuman.model_validate(tool_call[\"args\"])\n    location = interrupt(ask.question)\n    tool_message = {\"tool_call_id\": tool_call[\"id\"], \"type\": \"tool\", \"content\": location}\n    return {\"messages\": [tool_message]}\n\n# 3. build and compile\nworkflow = StateGraph(MessagesState)\nworkflow.add_node(\"agent\", call_model)\nworkflow.add_node(\"action\", tool_node)\nworkflow.add_node(\"ask_human\", ask_human)\nworkflow.add_edge(START, \"agent\")\nworkflow.add_conditional_edges(\"agent\", should_continue, path_map=[\"ask_human\", \"action\", END])\nworkflow.add_edge(\"action\", \"agent\")\nworkflow.add_edge(\"ask_human\", \"agent\")\napp = workflow.compile(checkpointer=InMemorySaver())"
      },
      "checks": [
        {
          "zh": "第一个调用名为 `AskHuman` 时去 `ask_human`",
          "en": "Routes to `ask_human` when the first call is `AskHuman`",
          "re": "tool_calls\\[0\\]\\[[\"']name[\"']\\]\\s*==\\s*[\"']AskHuman[\"']"
        },
        {
          "zh": "路由函数返回 `\"ask_human\"`",
          "en": "The router returns `\"ask_human\"`",
          "re": "return\\s+[\"']ask_human[\"']"
        },
        {
          "zh": "用 `AskHuman.model_validate(...)` 校验参数",
          "en": "Validates with `AskHuman.model_validate(...)`",
          "re": "AskHuman\\.model_validate\\("
        },
        {
          "zh": "用 `interrupt(ask.question)` 提问",
          "en": "Asks with `interrupt(ask.question)`",
          "re": "interrupt\\(\\s*ask\\.question\\s*\\)"
        },
        {
          "zh": "tool 消息带上 `tool_call_id`",
          "en": "The tool message carries `tool_call_id`",
          "re": "[\"']tool_call_id[\"']\\s*:|tool_call_id\\s*="
        },
        {
          "zh": "`ask_human` 回到 `agent`",
          "en": "`ask_human` goes back to `agent`",
          "re": "add_edge\\(\\s*[\"']ask_human[\"']\\s*,\\s*[\"']agent[\"']\\s*\\)"
        },
        {
          "zh": "编译时传入 checkpointer",
          "en": "Compiles with a checkpointer",
          "re": "compile\\(\\s*checkpointer\\s*="
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "编译时没传 `checkpointer`：第一次能停下，恢复时报 `Cannot use Command(resume=...) without checkpointer`。",
      "en": "No `checkpointer` when compiling: the first run stops, then resuming fails with `Cannot use Command(resume=...) without checkpointer`."
    },
    {
      "zh": "恢复时换了 `thread_id`（或者每次都新建一个 config），图从头开始，又停在同一个地方。",
      "en": "Resuming with another `thread_id` (or a fresh config each time): the graph starts over and stops at the same place."
    },
    {
      "zh": "以为 resume 的值能决定下一步去哪。它只是 `interrupt(...)` 的返回值，去向由边决定。",
      "en": "Thinking the resume value decides where to go next. It is only what `interrupt(...)` returns; the edges decide the route."
    },
    {
      "zh": "把调用模型、发消息这类有副作用的代码写在 `interrupt` 前面，恢复时它们又执行了一次。",
      "en": "Putting side effects such as model calls or sending messages before `interrupt`; they run again on resume."
    },
    {
      "zh": "用 `try/except Exception` 包住 `interrupt()`，把暂停用的异常吞掉了，图停不下来。",
      "en": "Wrapping `interrupt()` in `try/except Exception`, swallowing the exception that makes it stop."
    },
    {
      "zh": "`ask_human` 返回的 tool 消息 `tool_call_id` 没对上，或者忘了 `ask_human → agent` 这条边，下一次请求模型报错或图直接结束。",
      "en": "In `ask_human`, a `tool_call_id` that doesn't match, or a missing `ask_human → agent` edge: the next model request fails or the graph just ends."
    }
  ],
  "recap": [
    {
      "zh": "等待用户输入 = 在节点之间加一个人类反馈节点，节点里 `x = interrupt(提示)`。",
      "en": "Waiting for user input = a human feedback node between nodes, containing `x = interrupt(prompt)`."
    },
    {
      "zh": "恢复：`Command(resume=值)` + 同一个 `thread_id`；值成为 `interrupt` 的返回值。必须用 checkpointer 编译。",
      "en": "Resume with `Command(resume=value)` + the same `thread_id`; the value becomes what `interrupt` returns. Compile with a checkpointer."
    },
    {
      "zh": "`stream` 的 updates 事件里出现 `\"__interrupt__\"` 表示停下了；`invoke` 时用 `result[\"__interrupt__\"][0].value` 取提示。",
      "en": "An `\"__interrupt__\"` event in `stream` updates means it stopped; with `invoke`, read the prompt via `result[\"__interrupt__\"][0].value`."
    },
    {
      "zh": "恢复时整个节点重新执行，`interrupt` 前面不要放有副作用的代码。",
      "en": "On resume the whole node runs again; keep side effects out of the code before `interrupt`."
    },
    {
      "zh": "智能体问人：`AskHuman` 假工具绑定给模型 → 路由到 `ask_human` 节点 → `interrupt` 提问 → 用 tool 消息把回答交给模型。",
      "en": "An agent that asks: bind the `AskHuman` pretend tool → route to the `ask_human` node → ask with `interrupt` → hand the answer to the model as a tool message."
    }
  ],
  "files": [
    {
      "path": "practice/l34_human_feedback.py",
      "zh": "例子一：三个节点，中间停下等反馈；还演示了没有 checkpointer 时的报错（不需要 API key）。",
      "en": "Example 1: three nodes that stop in the middle for feedback, plus the error you get without a checkpointer (no API key needed)."
    },
    {
      "path": "practice/l34_ask_human_todo.py",
      "zh": "练习：补全 AskHuman 智能体的路由、`ask_human` 节点、边、checkpointer 和恢复（需要 DeepSeek key）。",
      "en": "Exercise: complete the AskHuman agent's router, `ask_human` node, edge, checkpointer and resume (needs the DeepSeek key)."
    },
    {
      "path": "practice/l34_ask_human_solution.py",
      "zh": "例子二的参考答案，已用 deepseek-flash 真实跑通（默认回答「北京」，可改成自己输入）。",
      "en": "Solution for example 2, tested against the real deepseek-flash (answers “北京” (Beijing) by default; can be switched to typing)."
    }
  ]
});
