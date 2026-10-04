COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l31",
  "priority": "important",
  "handwrite": true,
  "studyMinutes": 45,
  "source": "subtitle",
  "summary": {
    "zh": "跟着视频动手：一个只有 `call_model` 节点的聊天图，没有持久化时记不住名字；编译时加上检查点（视频用 `MemorySaver`），调用时在 config 里给出 `thread_id`，多轮对话就接上了，换一个 `thread_id` 又是一段全新的对话——这就是线程隔离。然后用 `InMemoryStore` 做中转站：节点从 config 读出 `user_id`，在 store 里按意思搜索这位用户的记忆，用户说「记住」时写入一条；于是同一个用户换了线程也能被认出来，另一个用户则什么都查不到。",
    "en": "Hands-on with the video: a chat graph with a single `call_model` node forgets your name without persistence; add a checkpointer when compiling (the video uses `MemorySaver`) and a `thread_id` in the config, and the turns connect – while a different `thread_id` is a brand-new conversation. That is thread isolation. Then an `InMemoryStore` serves as a relay: the node reads `user_id` from the config, searches that user's memories by meaning, and saves one when the user says “remember”; the same user is now recognised on a new thread, while another user finds nothing."
  },
  "goals": [
    {
      "zh": "说出没有 checkpointer 时多轮对话为什么接不上",
      "en": "Explain why turns don't connect without a checkpointer"
    },
    {
      "zh": "用 `compile(checkpointer=InMemorySaver())` 和 `{\"configurable\": {\"thread_id\": ...}}` 实现线程隔离的多轮对话",
      "en": "Build thread-isolated multi-turn chat with `compile(checkpointer=InMemorySaver())` and `{\"configurable\": {\"thread_id\": ...}}`"
    },
    {
      "zh": "用 `graph.stream(..., stream_mode=\"values\")` 和 `pretty_print()` 观察每一步的消息",
      "en": "Watch each step's messages with `graph.stream(..., stream_mode=\"values\")` and `pretty_print()`"
    },
    {
      "zh": "建一个带向量索引的 `InMemoryStore`，知道 `dims` 要和向量模型一致",
      "en": "Create an `InMemoryStore` with a vector index and know that `dims` must match the embedding model"
    },
    {
      "zh": "在节点里用 `config[\"configurable\"][\"user_id\"]` 和注入的 `store` 做 `search` / `put`，实现跨线程记忆",
      "en": "Use `config[\"configurable\"][\"user_id\"]` and the injected `store` to `search` / `put` inside a node for cross-thread memory"
    },
    {
      "zh": "区分 thread_id（哪段对话）和 user_id（哪个用户的记忆）",
      "en": "Tell thread_id (which conversation) from user_id (whose memories)"
    }
  ],
  "blocks": [
    {
      "t": "video",
      "zh": "这一集 13 分钟，老师在 notebook 里一段一段运行代码，模型用的是 **DeepSeek**。分两部分：\n- **线程隔离的持久化层**（[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=0)–[▶ 04:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=286)）：一个只有 `call_model` 节点的图，先不加持久化，问名字答不上来；加上 `MemorySaver` 和 `thread_id` 之后就记住了；换成线程 2 又不知道。\n- **跨线程持久化**（[▶ 04:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=286) 起）：用 `InMemoryStore` 当中转站，节点从 config 里取出 `user_id`，在 store 里搜索这位用户的记忆；用户说「记住」时写入一条。\n\n和视频的两处差别：视频写 `MemorySaver`，这里写它的新名字 `InMemorySaver`（同一个类）；视频的 store 用 `OpenAIEmbeddings` 封装去调用 BGE-M3 向量模型（1024 维，需要另外的服务和 key），这里换成本机的 fastembed 小模型 `BAAI/bge-small-zh-v1.5`（512 维，17 节用过，不需要 key）。例子里的名字「托米」「托米张」和视频一样。",
      "en": "In this 13-minute episode the instructor runs code cell by cell in a notebook, using **DeepSeek**. Two parts:\n- **Thread-isolated persistence** ([▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=0)–[▶ 04:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=286)): a graph with a single `call_model` node; without persistence it can't answer “what's my name?”; with `MemorySaver` and a `thread_id` it remembers; on thread 2 it doesn't know again.\n- **Cross-thread persistence** (from [▶ 04:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=286)): an `InMemoryStore` acts as a relay; the node reads `user_id` from config and searches that user's memories in the store; when the user says “remember”, it saves one.\n\nTwo differences from the video: it writes `MemorySaver`, here we use the new name `InMemorySaver` (the same class); its store calls a BGE-M3 embedding model through the `OpenAIEmbeddings` wrapper (1024 dims, needs its own service and key), here we use a local fastembed model, `BAAI/bge-small-zh-v1.5` (512 dims, used in lesson 17, no key). The example names, Tommy and Tommy Zhang, follow the video."
    },
    {
      "t": "h",
      "zh": "一、先看没有持久化的图",
      "en": "1. First, a graph without persistence"
    },
    {
      "t": "p",
      "zh": "[▶ 00:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=31) 老师搭了一张最简单的图：只有一个节点 `call_model`，它把状态里的全部消息交给模型，再把回答返回。状态用 LangGraph 自带的 **`MessagesState`**：只有一个 `messages` 字段，它的 reducer 是 `add_messages`（reducer 回顾 28 节），所以节点返回的消息会被**追加**到列表末尾。",
      "en": "[▶ 00:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=31) The instructor builds the simplest possible graph: one node, `call_model`, which hands every message in the state to the model and returns the answer. The state is LangGraph's built-in **`MessagesState`**: a single `messages` field whose reducer is `add_messages` (reducers: see lesson 28), so messages returned by a node are **appended** to the list."
    },
    {
      "t": "code",
      "file": "no_memory.py",
      "code": {
        "zh": "from langchain_deepseek import ChatDeepSeek\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\ndef call_model(state: MessagesState):\n    response = model.invoke(state[\"messages\"])    # 把状态里的全部消息发给模型\n    return {\"messages\": [response]}               # 回答会被追加到 messages 末尾\n\nbuilder = StateGraph(MessagesState)\nbuilder.add_node(\"call_model\", call_model)\nbuilder.add_edge(START, \"call_model\")\nbuilder.add_edge(\"call_model\", END)\ngraph = builder.compile()                         # 还没有 checkpointer\n\nfor text in [\"你好，我是托米\", \"我叫什么名字？\"]:\n    inputs = {\"messages\": [{\"role\": \"user\", \"content\": text}]}\n    for chunk in graph.stream(inputs, stream_mode=\"values\"):\n        chunk[\"messages\"][-1].pretty_print()",
        "en": "from langchain_deepseek import ChatDeepSeek\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\ndef call_model(state: MessagesState):\n    response = model.invoke(state[\"messages\"])    # send every message in the state\n    return {\"messages\": [response]}               # the reply is appended to messages\n\nbuilder = StateGraph(MessagesState)\nbuilder.add_node(\"call_model\", call_model)\nbuilder.add_edge(START, \"call_model\")\nbuilder.add_edge(\"call_model\", END)\ngraph = builder.compile()                         # no checkpointer yet\n\nfor text in [\"Hi, I'm Tommy\", \"What's my name?\"]:\n    inputs = {\"messages\": [{\"role\": \"user\", \"content\": text}]}\n    for chunk in graph.stream(inputs, stream_mode=\"values\"):\n        chunk[\"messages\"][-1].pretty_print()"
      },
      "note": {
        "zh": "LangGraph 不能在浏览器里运行。完整的可运行版本：`practice/l31_threads_solution.py`（在 VS Code 里运行，会调用 DeepSeek）。",
        "en": "LangGraph can't run in the browser. The full runnable version is `practice/l31_threads_solution.py` (run it in VS Code; it calls DeepSeek)."
      }
    },
    {
      "t": "p",
      "zh": "视频用的是 `stream` 而不是 `invoke`。两者都会把整张图跑完，区别是 `stream` **每走一步就交给你一次**当时的结果；`stream_mode=\"values\"` 表示每次交出的是**完整的状态**。第一次交出的是刚放进去的输入，第二次是 `call_model` 运行之后的状态，所以 `chunk[\"messages\"][-1]` 依次是你的问题和模型的回答。`pretty_print()` 是消息对象自带的方法，会带一行标题（Human Message / Ai Message）打印出来。流式输出的更多用法见 38 节。",
      "en": "The video uses `stream` instead of `invoke`. Both run the whole graph; the difference is that `stream` **hands you the result after each step**, and `stream_mode=\"values\"` means each hand-over is the **complete state**. The first one is the input you just put in, the second is the state after `call_model`, so `chunk[\"messages\"][-1]` is first your question, then the model's answer. `pretty_print()` is a method of message objects that prints them under a header line (Human Message / Ai Message). More on streaming in lesson 38."
    },
    {
      "t": "p",
      "zh": "[▶ 01:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=94) 运行结果：第一句自我介绍，模型热情地打招呼；第二句问「我叫什么名字？」，模型却说你还没告诉过它。原因很简单——没有持久化时，每次调用都从**空状态**开始，跑完以后状态就被丢掉了，第二次调用根本看不到第一句。",
      "en": "[▶ 01:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=94) The result: after the introduction the model greets you warmly; asked “what's my name?”, it says you haven't told it. The reason is simple – without persistence every call starts from an **empty state** and the state is thrown away afterwards, so the second call never sees the first line."
    },
    {
      "t": "h",
      "zh": "二、激活持久化层：检查点 + thread_id",
      "en": "2. Switch on persistence: a checkpointer + thread_id"
    },
    {
      "t": "p",
      "zh": "[▶ 02:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=126) 开启持久化只需要两步：导入一个 checkpointer（检查点保存器）并在**编译时**传进去；然后在**每次调用时**多传一个 `config`，说明这是哪一段对话。老师用的 `MemorySaver` 把检查点记在**内存**里。",
      "en": "[▶ 02:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=126) Switching persistence on takes two steps: import a checkpointer and pass it **when compiling**; then pass an extra `config` **on every call** to say which conversation this is. The instructor's `MemorySaver` keeps the checkpoints **in memory**."
    },
    {
      "t": "code",
      "file": "with_memory.py",
      "code": {
        "zh": "from langgraph.checkpoint.memory import InMemorySaver    # 视频里写 MemorySaver（旧名字，同一个类）\n\ngraph = builder.compile(checkpointer=InMemorySaver())    # 1. 编译时装上检查点\nconfig = {\"configurable\": {\"thread_id\": \"1\"}}            # 2. 调用时说明是哪段对话\n\nfor text in [\"你好，我是托米\", \"我叫什么名字？\"]:\n    inputs = {\"messages\": [{\"role\": \"user\", \"content\": text}]}\n    for chunk in graph.stream(inputs, config, stream_mode=\"values\"):   # config 是第二个参数\n        chunk[\"messages\"][-1].pretty_print()",
        "en": "from langgraph.checkpoint.memory import InMemorySaver    # the video writes MemorySaver (old name, same class)\n\ngraph = builder.compile(checkpointer=InMemorySaver())    # 1. add a checkpointer when compiling\nconfig = {\"configurable\": {\"thread_id\": \"1\"}}            # 2. say which conversation on each call\n\nfor text in [\"Hi, I'm Tommy\", \"What's my name?\"]:\n    inputs = {\"messages\": [{\"role\": \"user\", \"content\": text}]}\n    for chunk in graph.stream(inputs, config, stream_mode=\"values\"):   # config is the 2nd argument\n        chunk[\"messages\"][-1].pretty_print()"
      }
    },
    {
      "t": "note",
      "zh": "视频写的是 `from langgraph.checkpoint.memory import MemorySaver`、`memory = MemorySaver()`、`compile(checkpointer=memory)`。`MemorySaver` 是 `InMemorySaver` 的旧名字，在你安装的 LangGraph 1.2.12 里两者是**同一个类**，照视频写也能运行。官方文档和本课程后面的章节都用 `InMemorySaver`。",
      "en": "The video writes `from langgraph.checkpoint.memory import MemorySaver`, `memory = MemorySaver()`, `compile(checkpointer=memory)`. `MemorySaver` is the old name of `InMemorySaver`; in your LangGraph 1.2.12 they are **the same class**, so the video's code runs too. The official docs and the rest of this course use `InMemorySaver`."
    },
    {
      "t": "p",
      "zh": "[▶ 03:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=188) 这一次第二句就答对了：模型说你刚刚告诉过它，你叫托米。\n\n[▶ 03:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=220) 老师特别提醒注意 `stream` 的**第二个参数** `config`。它是一个两层的字典（嵌套字典回顾 05 节）：外层的键 `\"configurable\"` 放「这次运行可以调整的参数」（29 节用它切换过模型），里面的 `thread_id` 是这段对话的编号。编译时装了 checkpointer，就**必须**传 `thread_id`，否则它不知道该读写哪一份存档，会直接报错。\n\n带着 `thread_id` 调用时，图会：\n1. **读档**：找到这个线程最新的检查点，恢复状态（没有就从空状态开始）\n2. **合并输入**：新消息经过 `add_messages` 追加进 `messages`\n3. **运行节点**，每一步之后存档\n\n所以每次只需要传入**新的一句**，之前的对话由 checkpointer 负责接上。",
      "en": "[▶ 03:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=188) This time the second line is answered correctly: the model says you just told it – you're Tommy.\n\n[▶ 03:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=220) The instructor points out the **second argument** of `stream`, `config`. It is a two-level dict (nested dicts: see lesson 05): the outer key `\"configurable\"` holds “parameters you can change for this run” (lesson 29 used it to switch models), and inside it `thread_id` is the id of this conversation. Once a checkpointer is compiled in, a `thread_id` is **required** – otherwise it doesn't know which save to read and write, and raises an error.\n\nCalled with a `thread_id`, the graph:\n1. **Loads** the thread's latest checkpoint and restores the state (or starts empty)\n2. **Merges the input**: `add_messages` appends the new message to `messages`\n3. **Runs the nodes**, saving after each step\n\nSo each call passes **only the new line**; the checkpointer joins it to the earlier conversation."
    },
    {
      "t": "warn",
      "zh": "有了 checkpointer，**不要**每次把整段历史再传一遍。传入的字典消息会被分配新的 id，`add_messages` 会把它们当成新消息再追加一次，历史就重复了：第二次传 `[第1句, 第2句]`，状态会变成 `[第1句, 回答, 第1句, 第2句, 回答]`。",
      "en": "With a checkpointer, **don't** resend the whole history each time. Dict messages you pass get new ids, so `add_messages` appends them again as new messages and the history is duplicated: sending `[line 1, line 2]` the second time turns the state into `[line 1, answer, line 1, line 2, answer]`."
    },
    {
      "t": "h",
      "zh": "三、线程隔离：换一个 thread_id，就是一段新对话",
      "en": "3. Thread isolation: a new thread_id is a new conversation"
    },
    {
      "t": "p",
      "zh": "[▶ 04:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=252) 接着老师把 `thread_id` 从 `\"1\"` 改成 `\"2\"`，同样问「我叫什么名字？」——模型说它没办法知道。再改回 `\"1\"` 问一次，它又记得了。",
      "en": "[▶ 04:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=252) Next the instructor changes `thread_id` from `\"1\"` to `\"2\"` and asks the same “what's my name?” – the model says it has no way of knowing. Switched back to `\"1\"`, it remembers again."
    },
    {
      "t": "code",
      "file": "two_threads.py",
      "code": {
        "zh": "def chat(text, config):\n    inputs = {\"messages\": [{\"role\": \"user\", \"content\": text}]}\n    for chunk in graph.stream(inputs, config, stream_mode=\"values\"):\n        chunk[\"messages\"][-1].pretty_print()\n\nchat(\"我叫什么名字？\", {\"configurable\": {\"thread_id\": \"2\"}})   # 线程 2：没有存档，不知道\nchat(\"我叫什么名字？\", {\"configurable\": {\"thread_id\": \"1\"}})   # 回到线程 1：还记得",
        "en": "def chat(text, config):\n    inputs = {\"messages\": [{\"role\": \"user\", \"content\": text}]}\n    for chunk in graph.stream(inputs, config, stream_mode=\"values\"):\n        chunk[\"messages\"][-1].pretty_print()\n\nchat(\"What's my name?\", {\"configurable\": {\"thread_id\": \"2\"}})   # thread 2: no save, doesn't know\nchat(\"What's my name?\", {\"configurable\": {\"thread_id\": \"1\"}})   # back on thread 1: still remembers"
      }
    },
    {
      "t": "p",
      "zh": "这就是**线程隔离**：同一张图、同一个 checkpointer，存档按 `thread_id` 分开放，不同线程之间互相看不到。这里的「线程」和操作系统的多线程无关，指的是**一段独立的对话**，就像聊天软件里的一个会话窗口——给每个用户、每个窗口一个不同的 `thread_id`，它们的对话就不会串在一起。",
      "en": "That is **thread isolation**: the same graph and the same checkpointer, but saves are filed by `thread_id` and threads can't see each other. A “thread” has nothing to do with operating-system threads; it means **one separate conversation**, like one chat window – give each user and each window its own `thread_id`, and their conversations never mix."
    },
    {
      "t": "check",
      "q": {
        "zh": "线程 1 里已经有「自我介绍 + 回答」2 条消息。再用线程 1 问「我叫什么名字？」，这次调用结束后，线程 1 的状态里一共有几条消息？",
        "en": "Thread 1 already holds 2 messages (introduction + answer). You ask “what's my name?” on thread 1 again. After this call, how many messages does thread 1's state hold?"
      },
      "options": [
        {
          "zh": "1 条",
          "en": "1"
        },
        {
          "zh": "2 条",
          "en": "2"
        },
        {
          "zh": "3 条",
          "en": "3"
        },
        {
          "zh": "4 条",
          "en": "4"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "原有 2 条，加上新问题是 3 条，`call_model` 再追加 1 条回答，一共 4 条。模型这次收到的是前 3 条。",
        "en": "2 already there, plus the new question makes 3, and `call_model` appends 1 answer: 4. The model received the first 3."
      }
    },
    {
      "t": "h",
      "zh": "四、跨线程共享：用 store 做中转站",
      "en": "4. Sharing across threads: the store as a relay"
    },
    {
      "t": "p",
      "zh": "[▶ 04:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=286) 线程隔离很好，但如果**同一个用户**开了两个窗口（两个线程），我们又希望 AI 在新窗口里也认得他，该怎么办？老师的办法是 **store**：它是内存里一块**公共**的存储区，不管哪个线程都可以往里写、从里读 [▶ 05:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=348)。用它做中转，信息就能从线程 1 传到线程 2。\n\nstore 里的数据按三层定位：\n- **namespace（命名空间）**：一个**元组**，比如 `(\"memories\", \"1\")` 表示「用户 1 的记忆」，相当于一个抽屉的标签\n- **key**：抽屉里每条记录的编号，一个字符串\n- **value**：记录的内容，一个**字典**",
      "en": "[▶ 04:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=286) Thread isolation is great, but what if **the same user** opens two windows (two threads) and we want the AI to recognise them in the new one? The instructor's answer is the **store**: a **shared** storage area in memory that any thread can write to and read from [▶ 05:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=348). Used as a relay, it carries information from thread 1 to thread 2.\n\nData in a store is located on three levels:\n- **namespace**: a **tuple** such as `(\"memories\", \"1\")` – “user 1's memories”, like the label on a drawer\n- **key**: the id of each record in the drawer, a string\n- **value**: the record itself, a **dict**"
    },
    {
      "t": "py",
      "title": {
        "zh": "元组 tuple：不能修改的「标签」",
        "en": "Tuples: labels that can't change"
      },
      "zh": "元组用圆括号写：`(\"memories\", \"1\")`。它和列表很像，也能用下标取值，但**创建之后不能修改**。正因为不能改，元组可以当字典的键，很适合做「抽屉标签」。只有一个元素时要加逗号：`(\"memories\",)`，否则括号只是普通的括号。\n\n下面用一个普通字典模拟 store 的结构，帮你看清 namespace + key + value 是怎么配合的：",
      "en": "A tuple is written in round brackets: `(\"memories\", \"1\")`. It is like a list – you can index it – but it **cannot be changed after creation**. Because it can't change, a tuple can be a dict key, which makes it a good drawer label. With a single item you need a comma: `(\"memories\",)`; otherwise the brackets are just brackets.\n\nThe code below imitates a store with a plain dict, to show how namespace + key + value fit together:",
      "code": {
        "zh": "namespace = (\"memories\", \"1\")\nprint(namespace[0], namespace[1])        # memories 1\n# namespace[1] = \"2\"                    # 会报错：元组不能修改\n\n# 用字典模拟 store：{namespace: {key: value}}\nfake_store = {}\n\ndef put(namespace, key, value):\n    if namespace not in fake_store:\n        fake_store[namespace] = {}\n    fake_store[namespace][key] = value\n\nput((\"memories\", \"1\"), \"a1\", {\"data\": \"用户的名字是托米张\"})\nput((\"memories\", \"1\"), \"a2\", {\"data\": \"用户喜欢喝美式咖啡\"})\nput((\"memories\", \"2\"), \"b1\", {\"data\": \"用户住在深圳\"})\n\nprint(fake_store[(\"memories\", \"1\")])            # 用户 1 抽屉里的全部记录\nprint(fake_store.get((\"memories\", \"3\"), {}))    # 没有这个抽屉：得到空字典\n\none = (\"memories\")      # 这不是元组，只是加了括号的字符串\ntwo = (\"memories\",)     # 这才是只有一个元素的元组\nprint(type(one).__name__, type(two).__name__)",
        "en": "namespace = (\"memories\", \"1\")\nprint(namespace[0], namespace[1])        # memories 1\n# namespace[1] = \"2\"                    # error: tuples can't be changed\n\n# imitate a store with a dict: {namespace: {key: value}}\nfake_store = {}\n\ndef put(namespace, key, value):\n    if namespace not in fake_store:\n        fake_store[namespace] = {}\n    fake_store[namespace][key] = value\n\nput((\"memories\", \"1\"), \"a1\", {\"data\": \"The user's name is Tommy Zhang\"})\nput((\"memories\", \"1\"), \"a2\", {\"data\": \"The user likes Americanos\"})\nput((\"memories\", \"2\"), \"b1\", {\"data\": \"The user lives in Shenzhen\"})\n\nprint(fake_store[(\"memories\", \"1\")])            # everything in user 1's drawer\nprint(fake_store.get((\"memories\", \"3\"), {}))    # no such drawer: an empty dict\n\none = (\"memories\")      # not a tuple - just a string in brackets\ntwo = (\"memories\",)     # this is a one-item tuple\nprint(type(one).__name__, type(two).__name__)"
      }
    },
    {
      "t": "p",
      "zh": "[▶ 05:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=317) 视频里的 store 存的是**向量化**的记忆：存进去时，向量模型把文字变成一串数字（向量，17 节讲过）；查的时候按「意思相近」来找，而不是逐字匹配。所以建 store 时要给一个 `index`：\n- `embed`：负责把文字变成向量的东西。视频里是 `OpenAIEmbeddings(...)` 对象，这里是一个普通函数，两种都可以\n- `dims`：向量的长度，**要和向量模型输出的维度一致**。老师强调 BGE-M3 是 1024 维，所以写 1024；这里的 bge-small-zh 是 512 维，就写 512",
      "en": "[▶ 05:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=317) The video's store holds **vectorised** memories: on the way in, an embedding model turns the text into a list of numbers (a vector, see lesson 17); a search finds records with **similar meaning** rather than matching words. So the store gets an `index`:\n- `embed`: whatever turns text into vectors. In the video it is an `OpenAIEmbeddings(...)` object; here it is a plain function – both work\n- `dims`: the vector length, which **must match the embedding model's output size**. The instructor stresses that BGE-M3 has 1024 dimensions, hence 1024; our bge-small-zh has 512, hence 512"
    },
    {
      "t": "code",
      "file": "store_with_index.py",
      "code": {
        "zh": "import os\nimport uuid\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"HF_HOME\", os.path.join(PROJECT_DIR, \".cache\", \"hf\"))      # 模型缓存放进项目的 .cache\n\nfrom fastembed import TextEmbedding\nfrom langgraph.store.memory import InMemoryStore\n\nembedder = TextEmbedding(\"BAAI/bge-small-zh-v1.5\", cache_dir=os.path.join(PROJECT_DIR, \".cache\", \"fastembed\"))\n\ndef embed(texts):\n    \"\"\"把一批文字变成一批向量（每个 512 个数字）\"\"\"\n    return [vector.tolist() for vector in embedder.embed(texts)]\n\nin_memory_store = InMemoryStore(index={\"embed\": embed, \"dims\": 512})   # dims = 模型的维度\n\nnamespace = (\"memories\", \"1\")                   # 用户 1 的「抽屉」\nin_memory_store.put(namespace, str(uuid.uuid4()), {\"data\": \"用户的名字是托米张\"})\nin_memory_store.put(namespace, str(uuid.uuid4()), {\"data\": \"用户喜欢喝美式咖啡\"})\n\nfor item in in_memory_store.search(namespace, query=\"我叫什么名字？\"):   # 按意思搜索\n    print(round(item.score, 2), item.value)",
        "en": "import os\nimport uuid\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"HF_HOME\", os.path.join(PROJECT_DIR, \".cache\", \"hf\"))      # keep model caches in the project's .cache\n\nfrom fastembed import TextEmbedding\nfrom langgraph.store.memory import InMemoryStore\n\nembedder = TextEmbedding(\"BAAI/bge-small-zh-v1.5\", cache_dir=os.path.join(PROJECT_DIR, \".cache\", \"fastembed\"))\n\ndef embed(texts):\n    \"\"\"Turn a batch of texts into a batch of vectors (512 numbers each).\"\"\"\n    return [vector.tolist() for vector in embedder.embed(texts)]\n\nin_memory_store = InMemoryStore(index={\"embed\": embed, \"dims\": 512})   # dims = the model's size\n\nnamespace = (\"memories\", \"1\")                   # user 1's \"drawer\"\nin_memory_store.put(namespace, str(uuid.uuid4()), {\"data\": \"The user's name is Tommy Zhang\"})\nin_memory_store.put(namespace, str(uuid.uuid4()), {\"data\": \"The user likes Americanos\"})\n\nfor item in in_memory_store.search(namespace, query=\"What's my name?\"):   # search by meaning\n    print(round(item.score, 2), item.value)"
      },
      "note": {
        "zh": "`search(namespace, query=...)` 把 query 也变成向量，按相似度从高到低返回记录，每条结果的 `.value` 是存进去的字典，`.score` 是相似度。实测「我叫什么名字？」排第一的是「用户的名字是托米张」。`uuid.uuid4()` 生成一个几乎不可能重复的随机编号，`str(...)` 把它变成字符串当 key，这样每条记忆都不会互相覆盖。",
        "en": "`search(namespace, query=...)` turns the query into a vector too and returns records from most to least similar; each result's `.value` is the stored dict and `.score` the similarity. In a test run, “What's my name?” ranked “The user's name is Tommy Zhang” first. `uuid.uuid4()` makes a random id that practically never repeats; `str(...)` turns it into a string key, so memories never overwrite each other."
      }
    },
    {
      "t": "video",
      "zh": "**视频里的写法 vs 这里的写法**\n\n| | 视频 | 这里 |\n|---|---|---|\n| 向量模型 | BGE-M3，通过 `OpenAIEmbeddings` 封装调用一个向量服务 | `BAAI/bge-small-zh-v1.5`，fastembed 在本机运行 |\n| 需要什么 | 向量服务的地址和 key | 不需要 key，模型在 17 节已下载到项目的 `.cache\\fastembed` |\n| `dims` | 1024 | 512 |\n\n换模型时只改 `embed` 和 `dims` 这两处，节点和图的代码完全不用动。DeepSeek 没有向量接口，所以这里不能用 DeepSeek 做 embedding。",
      "en": "**The video's version vs ours**\n\n| | Video | Here |\n|---|---|---|\n| Embedding model | BGE-M3, called through the `OpenAIEmbeddings` wrapper on an embedding service | `BAAI/bge-small-zh-v1.5`, run locally by fastembed |\n| What it needs | The service's address and key | No key; the model was downloaded to the project's `.cache\\fastembed` in lesson 17 |\n| `dims` | 1024 | 512 |\n\nSwitching models only touches `embed` and `dims`; the node and graph code stay the same. DeepSeek has no embeddings API, so it can't do the embedding here."
    },
    {
      "t": "note",
      "zh": "两个细节：\n- 实测 `InMemoryStore` 本身并不检查 `dims`（写错也不报错），但数据库版的 store 要按这个数字准备存向量的位置，写错就会出问题，所以照老师说的，和模型保持一致。\n- `search` 默认最多返回 **10 条**（参数 `limit=10`）。不带 `query` 时，它按存入顺序列出这个 namespace 下的记录；记录多了要写 `search(namespace, limit=100)`。",
      "en": "Two details:\n- In testing, `InMemoryStore` itself doesn't check `dims` (a wrong value raises nothing), but database-backed stores size their vector storage by it, so a wrong value causes trouble there – keep it equal to the model's, as the instructor says.\n- `search` returns at most **10 items** by default (`limit=10`). Without `query` it lists the namespace's records in the order they were stored; with more records, write `search(namespace, limit=100)`."
    },
    {
      "t": "h",
      "zh": "五、在节点里读写 store",
      "en": "5. Reading and writing the store in a node"
    },
    {
      "t": "p",
      "zh": "[▶ 06:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=379) 接下来的图仍然只有一个节点，但这个节点复杂一些。它接收**三个参数**：`state`、`config` 和 `store`。老师一句一句地讲了它做的事：\n1. [▶ 06:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=412) 从 `config` 里取出这次调用的 `user_id`，拼出这个用户的 namespace\n2. 用 `store.search` 做**向量搜索**：拿最后一条消息（用户刚说的话）去查最相关的记忆\n3. [▶ 07:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=443) 把查到的记忆拼进 system 提示词：「你是一个正在和用户聊天的助手。用户信息：……」\n4. [▶ 07:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=475) 如果用户最新一句话里有「记住」或 remember，就用 `store.put` 存一条记忆。为了演示，这条记忆是**写死**的「用户的名字是托米张」；真实项目里应该从对话中提取（比如让模型来提取）\n5. 把 system 提示词和对话拼在一起调用模型，返回回答",
      "en": "[▶ 06:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=379) The next graph still has one node, but a more involved one. It takes **three parameters**: `state`, `config` and `store`. The instructor walks through it line by line:\n1. [▶ 06:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=412) Read this call's `user_id` from `config` and build that user's namespace\n2. Run a **vector search** with `store.search`, using the last message (what the user just said) to find the most relevant memories\n3. [▶ 07:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=443) Put the memories into the system prompt: “You are a helpful assistant talking to the user. User info: …”\n4. [▶ 07:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=475) If the user's latest line contains “记住” or “remember”, save a memory with `store.put`. For the demo this memory is **hard-coded** as “the user's name is Tommy Zhang”; a real project would extract it from the conversation (for example, by asking the model)\n5. Call the model with the system prompt plus the conversation and return the answer"
    },
    {
      "t": "py",
      "title": {
        "zh": "参数列表里单独的 `*`：后面的参数只能按名字传",
        "en": "A lone `*` in a parameter list: what follows is keyword-only"
      },
      "zh": "`def call_model(state, config, *, store):` 里那个单独的星号不是参数，它是一条规则：**写在 `*` 后面的参数，调用时必须写出名字**，比如 `store=...`，不能按位置传。\n\n为什么 LangGraph 的节点要这样写？因为节点不是你自己调用的，而是 LangGraph 调用的：它**按参数名**把对应的东西传进去——第一个参数是当前状态，名叫 `config` 的参数收到这次运行的配置，**名叫 `store` 的参数**收到编译时给的 store（实测名字必须一字不差）。LangGraph 本来就按名字传，所以 `*` 去掉也能运行；写上它是在提醒读代码的人：`store` 不是你按位置传的普通参数。下面用普通函数体验一下这条规则：",
      "en": "In `def call_model(state, config, *, store):` the lone star is not a parameter but a rule: **parameters after `*` must be passed by name** when calling, e.g. `store=...` – never by position.\n\nWhy write LangGraph nodes this way? You don't call nodes yourself; LangGraph does, and it fills parameters **by name** – the first parameter gets the current state, a parameter named `config` gets this run's configuration, and a **parameter named `store`** gets the store given at compile time (the names must match exactly). Since LangGraph passes them by name anyway, the code still runs without the `*`; writing it tells readers that `store` is not an ordinary positional argument. Try the rule with an ordinary function:",
      "code": {
        "zh": "def call_model(state, config, *, store):\n    print(\"state =\", state, \"| config =\", config, \"| store =\", store)\n\ncall_model(\"状态\", \"配置\", store=\"公共仓库\")     # 按名字传 store：可以\n\ntry:\n    call_model(\"状态\", \"配置\", \"公共仓库\")       # 按位置传 store：不行\nexcept TypeError as e:\n    print(\"TypeError:\", e)",
        "en": "def call_model(state, config, *, store):\n    print(\"state =\", state, \"| config =\", config, \"| store =\", store)\n\ncall_model(\"the state\", \"the config\", store=\"shared store\")    # store by name: fine\n\ntry:\n    call_model(\"the state\", \"the config\", \"shared store\")      # store by position: not allowed\nexcept TypeError as e:\n    print(\"TypeError:\", e)"
      }
    },
    {
      "t": "code",
      "file": "cross_thread_node.py",
      "code": {
        "zh": "from langchain_core.runnables import RunnableConfig\nfrom langgraph.store.base import BaseStore\n\ndef call_model(state: MessagesState, config: RunnableConfig, *, store: BaseStore):\n    user_id = config[\"configurable\"][\"user_id\"]                  # 1. 从 config 取出 user_id\n    namespace = (\"memories\", user_id)\n    memories = store.search(namespace, query=str(state[\"messages\"][-1].content))   # 2. 按意思搜索\n    info = \"\\n\".join([d.value[\"data\"] for d in memories])\n    print(\"[日志] 检索到的用户信息：\", info)\n    system_msg = f\"你是一个正在和用户聊天的助手。用户信息：{info}\"  # 3. 拼进 system 提示词\n\n    last_message = state[\"messages\"][-1]                          # 4. 用户要求「记住」就存一条\n    if \"记住\" in last_message.content or \"remember\" in last_message.content.lower():\n        memory = \"用户的名字是托米张\"                               #    演示用：写死的内容\n        store.put(namespace, str(uuid.uuid4()), {\"data\": memory})\n\n    response = model.invoke([{\"role\": \"system\", \"content\": system_msg}] + state[\"messages\"])   # 5.\n    return {\"messages\": [response]}\n\nbuilder = StateGraph(MessagesState)\nbuilder.add_node(\"call_model\", call_model)\nbuilder.add_edge(START, \"call_model\")\nbuilder.add_edge(\"call_model\", END)\ngraph = builder.compile(checkpointer=InMemorySaver(), store=in_memory_store)   # 两样都要传",
        "en": "from langchain_core.runnables import RunnableConfig\nfrom langgraph.store.base import BaseStore\n\ndef call_model(state: MessagesState, config: RunnableConfig, *, store: BaseStore):\n    user_id = config[\"configurable\"][\"user_id\"]                  # 1. read user_id from config\n    namespace = (\"memories\", user_id)\n    memories = store.search(namespace, query=str(state[\"messages\"][-1].content))   # 2. semantic search\n    info = \"\\n\".join([d.value[\"data\"] for d in memories])\n    print(\"[log] user info found:\", info)\n    system_msg = f\"You are a helpful assistant talking to the user. User info: {info}\"  # 3. system prompt\n\n    last_message = state[\"messages\"][-1]                          # 4. save a memory when asked to\n    if \"记住\" in last_message.content or \"remember\" in last_message.content.lower():\n        memory = \"The user's name is Tommy Zhang\"                 #    hard-coded for the demo\n        store.put(namespace, str(uuid.uuid4()), {\"data\": memory})\n\n    response = model.invoke([{\"role\": \"system\", \"content\": system_msg}] + state[\"messages\"])   # 5.\n    return {\"messages\": [response]}\n\nbuilder = StateGraph(MessagesState)\nbuilder.add_node(\"call_model\", call_model)\nbuilder.add_edge(START, \"call_model\")\nbuilder.add_edge(\"call_model\", END)\ngraph = builder.compile(checkpointer=InMemorySaver(), store=in_memory_store)   # pass both"
      },
      "note": {
        "zh": "接着前面的代码往下写（`model`、`MessagesState`、`InMemorySaver`、`in_memory_store`、`uuid` 都已经有了）。完整版：`practice/l31_cross_thread_solution.py`。\n- `\"记住\" in 文字` 判断一段文字里有没有这个词（字符串的 `in` 回顾 07 节），`.lower()` 把英文转成小写，Remember 也能匹配上。\n- `\"\\n\".join(...)` 用换行把多条记忆连成一段文字（`join` 回顾 07 节）。\n- 先搜索、后存储：说「记住」的那一轮，system 提示词里还没有这条记忆，所以模型只是回答「好的，记住了」；之后的调用才能搜到它。",
        "en": "This continues the code above (`model`, `MessagesState`, `InMemorySaver`, `in_memory_store` and `uuid` already exist). Full version: `practice/l31_cross_thread_solution.py`.\n- `\"记住\" in text` checks whether a piece of text contains that word (string `in`: see lesson 07); `.lower()` lowercases English, so “Remember” matches too.\n- `\"\\n\".join(...)` joins the memories into one text with newlines (`join`: see lesson 07).\n- Search first, save second: in the turn where the user says “remember”, the system prompt doesn't contain the new memory yet, so the model just says “OK, noted”; later calls find it."
      }
    },
    {
      "t": "h",
      "zh": "六、跨线程调用：同一个用户，换个线程也认得",
      "en": "6. Cross-thread calls: the same user is recognised on a new thread"
    },
    {
      "t": "p",
      "zh": "[▶ 08:57](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=537) 调用时要特别注意 config：现在 `configurable` 里除了 `thread_id`，还多了一个 `user_id`。`thread_id` 决定**用哪一份对话存档**，`user_id` 决定**打开哪个用户的记忆抽屉**，两者互不相干。（`chat` 函数和第三部分一样，只是用的是新的 `graph`。）",
      "en": "[▶ 08:57](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=537) Watch the config on these calls: besides `thread_id`, `configurable` now also has a `user_id`. `thread_id` picks **which conversation save** to use; `user_id` picks **whose memory drawer** to open – the two are independent. (`chat` is the same function as in part 3, now using the new `graph`.)"
    },
    {
      "t": "code",
      "file": "cross_thread_calls.py",
      "code": {
        "zh": "chat(\"你好！请记住：我的名字叫托米张\", {\"configurable\": {\"thread_id\": \"1\", \"user_id\": \"1\"}})\nchat(\"我叫什么名字？\", {\"configurable\": {\"thread_id\": \"2\", \"user_id\": \"1\"}})   # 新线程，同一个用户\n\nfor memory in in_memory_store.search((\"memories\", \"1\")):   # 直接看看 store 里存了什么\n    print(memory.value)\n\nchat(\"我叫什么名字？\", {\"configurable\": {\"thread_id\": \"3\", \"user_id\": \"2\"}})   # 另一个用户",
        "en": "chat(\"Hi! Please remember: my name is Tommy Zhang\", {\"configurable\": {\"thread_id\": \"1\", \"user_id\": \"1\"}})\nchat(\"What's my name?\", {\"configurable\": {\"thread_id\": \"2\", \"user_id\": \"1\"}})   # new thread, same user\n\nfor memory in in_memory_store.search((\"memories\", \"1\")):   # look inside the store directly\n    print(memory.value)\n\nchat(\"What's my name?\", {\"configurable\": {\"thread_id\": \"3\", \"user_id\": \"2\"}})   # another user"
      }
    },
    {
      "t": "p",
      "zh": "三次调用的结果：\n\n| 调用 | thread_id | user_id | 发生了什么 |\n|---|---|---|---|\n| 第 1 次 | 1 | 1 | 句子里有「记住」→ 写入「用户的名字是托米张」；模型回答「好的，记住了」 |\n| 第 2 次 | 2 | 1 | 新线程，没有对话存档；但在用户 1 的抽屉里搜到了这条记忆 → 答出「托米张」[▶ 10:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=633) |\n| 第 3 次 | 3 | 2 | 用户 2 的抽屉是空的 → 不知道名字 [▶ 12:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=732) |\n\n[▶ 10:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=633) 老师还在节点里加了一行日志，把搜到的用户信息打印出来，能清楚地看到第 2 次调用是从 store 里取到名字的。[▶ 11:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=701) 他也直接调用 `in_memory_store.search((\"memories\", \"1\"))` 看了 store 里存着什么。真实运行（DeepSeek）时三次的回答依次是：「好的，托米张，我记住了！」「你叫托米张。」「抱歉，我目前不知道你的名字。」\n\n这样就做到了两件事：按线程隔离对话，同时按用户通过 store 中转，跨线程取回记忆。",
      "en": "The three calls:\n\n| Call | thread_id | user_id | What happens |\n|---|---|---|---|\n| 1st | 1 | 1 | The line contains “remember” → “the user's name is Tommy Zhang” is saved; the model says “OK, noted” |\n| 2nd | 2 | 1 | New thread, no conversation save; but the memory is found in user 1's drawer → it answers “Tommy Zhang” [▶ 10:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=633) |\n| 3rd | 3 | 2 | User 2's drawer is empty → it doesn't know the name [▶ 12:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=732) |\n\n[▶ 10:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=633) The instructor also adds a log line in the node to print the user info found, which shows clearly that the 2nd call got the name from the store. [▶ 11:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=32&t=701) He also calls `in_memory_store.search((\"memories\", \"1\"))` directly to see what the store holds. In a real run (DeepSeek), the three answers were: “OK, Tommy Zhang, noted!”, “You're Tommy Zhang.”, “Sorry, I don't know your name yet.”\n\nSo we get both: conversations isolated per thread, and per-user memories relayed through the store and fetched across threads."
    },
    {
      "t": "check",
      "q": {
        "zh": "用户 1 在线程 1 里说「请记住我叫托米张」。之后哪一次调用里，模型**拿不到**这条记忆？",
        "en": "User 1 says “please remember I'm Tommy Zhang” on thread 1. In which later call can the model **not** get this memory?"
      },
      "options": [
        {
          "zh": "线程 2、用户 1",
          "en": "Thread 2, user 1"
        },
        {
          "zh": "线程 3、用户 2",
          "en": "Thread 3, user 2"
        },
        {
          "zh": "线程 1、用户 1",
          "en": "Thread 1, user 1"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "store 按 namespace（里面带着 user_id）存放，和线程无关：用户 1 在任何线程都能搜到，用户 2 的抽屉里没有。",
        "en": "The store is organised by namespace (which contains the user_id), not by thread: user 1 finds it on any thread; user 2's drawer is empty."
      }
    },
    {
      "t": "tip",
      "zh": "一句话区分：**checkpointer + thread_id = 这一段对话说过什么；store + user_id = 这个人是谁、喜欢什么**。前者每个窗口各有一份，后者同一个用户的所有窗口共用一份。",
      "en": "One line to tell them apart: **checkpointer + thread_id = what was said in this conversation; store + user_id = who this person is and what they like**. The former is one per window; the latter is shared by all of one user's windows."
    },
    {
      "t": "note",
      "zh": "**另一种写法（29 节的新写法）。** 视频把 `user_id` 放在 `config[\"configurable\"]` 里，节点用 `config` 和 `store` 两个参数读取——这在 LangGraph 1.2.12 里完全可以运行。29 节说过，1.x 更推荐把「自己的设置」放进运行时上下文 `context`，节点只写一个 `runtime` 参数，用 `runtime.context` 和 `runtime.store`。两种写法效果一样，下面是对照：",
      "en": "**Another style (lesson 29's newer one).** The video keeps `user_id` in `config[\"configurable\"]` and the node reads it through two parameters, `config` and `store` – this runs fine in LangGraph 1.2.12. As lesson 29 explained, 1.x prefers putting your own settings in the runtime `context`; the node then takes a single `runtime` parameter and uses `runtime.context` and `runtime.store`. Both behave the same; here is the comparison:"
    },
    {
      "t": "code",
      "file": "runtime_style.py",
      "code": {
        "zh": "from typing import TypedDict\nfrom langgraph.runtime import Runtime\n\nclass Context(TypedDict):\n    user_id: str\n\ndef call_model(state: MessagesState, runtime: Runtime[Context]):\n    namespace = (\"memories\", runtime.context[\"user_id\"])     # user_id 从 context 来\n    memories = runtime.store.search(namespace, query=str(state[\"messages\"][-1].content))\n    ...                                                       # 其余和上面一样\n\nbuilder = StateGraph(MessagesState, context_schema=Context)\n# ...加节点、连边、compile(checkpointer=..., store=...) 同上...\ngraph.stream(inputs, {\"configurable\": {\"thread_id\": \"2\"}}, context={\"user_id\": \"1\"}, stream_mode=\"values\")",
        "en": "from typing import TypedDict\nfrom langgraph.runtime import Runtime\n\nclass Context(TypedDict):\n    user_id: str\n\ndef call_model(state: MessagesState, runtime: Runtime[Context]):\n    namespace = (\"memories\", runtime.context[\"user_id\"])     # user_id comes from the context\n    memories = runtime.store.search(namespace, query=str(state[\"messages\"][-1].content))\n    ...                                                       # the rest as above\n\nbuilder = StateGraph(MessagesState, context_schema=Context)\n# ...add the node, the edges and compile(checkpointer=..., store=...) as before...\ngraph.stream(inputs, {\"configurable\": {\"thread_id\": \"2\"}}, context={\"user_id\": \"1\"}, stream_mode=\"values\")"
      }
    },
    {
      "t": "warn",
      "zh": "三个常见报错：\n- 忘了 `compile(store=in_memory_store)`：节点收到的 `store` 是 `None`，报 `'NoneType' object has no attribute 'search'`。\n- config 里没放 `user_id`：`config[\"configurable\"][\"user_id\"]` 报 `KeyError: 'user_id'`。\n- 编译时装了 checkpointer，调用时却没传 config：报 `ValueError: Checkpointer requires one or more of the following 'configurable' keys: thread_id, ...`。",
      "en": "Three common errors:\n- Forgetting `compile(store=in_memory_store)`: the node's `store` is `None` and you get `'NoneType' object has no attribute 'search'`.\n- No `user_id` in the config: `config[\"configurable\"][\"user_id\"]` raises `KeyError: 'user_id'`.\n- A checkpointer compiled in but no config on the call: `ValueError: Checkpointer requires one or more of the following 'configurable' keys: thread_id, ...`."
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "没有 checkpointer 时，先说「我是托米」，再问「我叫什么名字？」，为什么答不上来？",
        "en": "Without a checkpointer you say “I'm Tommy” and then ask “what's my name?”. Why can't it answer?"
      },
      "options": [
        {
          "zh": "因为 DeepSeek 不支持中文名字",
          "en": "DeepSeek doesn't support Chinese names"
        },
        {
          "zh": "因为 stream 只能运行一次",
          "en": "stream can only run once"
        },
        {
          "zh": "因为每次调用都从空状态开始，第一句跑完就被丢掉了",
          "en": "Every call starts from an empty state; the first line was thrown away after its run"
        },
        {
          "zh": "因为 MessagesState 只能存一条消息",
          "en": "MessagesState can only hold one message"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "模型本身没有记忆，图也没有存档，第二次调用只带着第二句话。",
        "en": "The model has no memory and the graph keeps no save, so the second call carries only the second line."
      }
    },
    {
      "q": {
        "zh": "编译时加了 `checkpointer=InMemorySaver()`，调用时却只写 `graph.invoke(inputs)`，会怎样？",
        "en": "You compiled with `checkpointer=InMemorySaver()` but call `graph.invoke(inputs)` with no config. What happens?"
      },
      "options": [
        {
          "zh": "报 ValueError：checkpointer 需要 `thread_id` 等 configurable 键",
          "en": "A ValueError: the checkpointer needs configurable keys such as `thread_id`"
        },
        {
          "zh": "自动使用 thread_id \"default\"",
          "en": "It uses thread_id \"default\" automatically"
        },
        {
          "zh": "正常运行，只是不保存",
          "en": "It runs normally but saves nothing"
        },
        {
          "zh": "所有调用都算作同一个线程",
          "en": "Every call counts as the same thread"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "有 checkpointer 就必须说明用哪个线程，否则它不知道该读、写哪一份存档。",
        "en": "With a checkpointer you must say which thread to use; otherwise it doesn't know which save to read and write."
      }
    },
    {
      "q": {
        "zh": "`MemorySaver` 和 `InMemorySaver` 是什么关系？",
        "en": "How are `MemorySaver` and `InMemorySaver` related?"
      },
      "options": [
        {
          "zh": "MemorySaver 存进数据库，InMemorySaver 存在内存",
          "en": "MemorySaver writes to a database, InMemorySaver to memory"
        },
        {
          "zh": "MemorySaver 已经被删除，不能用了",
          "en": "MemorySaver has been removed and no longer works"
        },
        {
          "zh": "InMemorySaver 是 store，MemorySaver 是 checkpointer",
          "en": "InMemorySaver is a store, MemorySaver a checkpointer"
        },
        {
          "zh": "同一个类：MemorySaver 是旧名字，两种写法都能用",
          "en": "The same class: MemorySaver is the old name, and both spellings work"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "视频用旧名字 `MemorySaver`；在 LangGraph 1.2.12 里 `MemorySaver is InMemorySaver` 的结果是 True。",
        "en": "The video uses the old name `MemorySaver`; in LangGraph 1.2.12 `MemorySaver is InMemorySaver` is True."
      }
    },
    {
      "q": {
        "zh": "视频用 BGE-M3（1024 维），这里用 bge-small-zh（512 维）。`InMemoryStore(index={...})` 里的 `dims` 该怎么写？",
        "en": "The video uses BGE-M3 (1024 dims); we use bge-small-zh (512 dims). What should `dims` be in `InMemoryStore(index={...})`?"
      },
      "options": [
        {
          "zh": "随便写，越大越好",
          "en": "Anything – bigger is better"
        },
        {
          "zh": "和实际使用的向量模型一致：这里写 512",
          "en": "Equal to the embedding model actually used: 512 here"
        },
        {
          "zh": "永远写 1024，因为视频这么写",
          "en": "Always 1024, because the video says so"
        },
        {
          "zh": "写对话的条数",
          "en": "The number of messages in the conversation"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "dims 是向量的长度，必须和模型输出一致；换了模型就要跟着改。",
        "en": "dims is the vector length and must match the model's output; change the model, change dims."
      }
    },
    {
      "q": {
        "zh": "节点写成 `def call_model(state, config: RunnableConfig, *, store: BaseStore)`，`store` 是从哪里来的？",
        "en": "With `def call_model(state, config: RunnableConfig, *, store: BaseStore)`, where does `store` come from?"
      },
      "options": [
        {
          "zh": "LangGraph 调用节点时，把 `compile(store=...)` 传入的那个 store 按名字传进来",
          "en": "When LangGraph calls the node, it passes in the store given to `compile(store=...)`, by name"
        },
        {
          "zh": "从 state 里取出来",
          "en": "It is taken from the state"
        },
        {
          "zh": "从 config 的 thread_id 里取出来",
          "en": "It comes from the config's thread_id"
        },
        {
          "zh": "每次调用都新建一个空的 store",
          "en": "A new empty store is created on every call"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "`*` 后面的 `store` 是关键字参数，LangGraph 会把编译时给的 store 传给它；忘了 `compile(store=...)` 它就是 None。",
        "en": "`store` after the `*` is a keyword parameter that LangGraph fills with the store given at compile time; without `compile(store=...)` it is None."
      }
    },
    {
      "q": {
        "zh": "第 3 次调用用的是 `thread_id=\"3\"`、`user_id=\"2\"`。为什么模型不知道名字？",
        "en": "The 3rd call uses `thread_id=\"3\"`, `user_id=\"2\"`. Why doesn't the model know the name?"
      },
      "options": [
        {
          "zh": "因为线程 3 的存档被删除了",
          "en": "Thread 3's save was deleted"
        },
        {
          "zh": "因为 store 只能保存一条记忆",
          "en": "The store can only hold one memory"
        },
        {
          "zh": "因为向量模型出错了",
          "en": "The embedding model failed"
        },
        {
          "zh": "因为它在 `(\"memories\", \"2\")` 里搜索，而名字存在 `(\"memories\", \"1\")` 里",
          "en": "It searches `(\"memories\", \"2\")`, but the name was stored under `(\"memories\", \"1\")`"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "namespace 里带着 user_id，不同用户各用各的抽屉，这就是用户级的记忆隔离。",
        "en": "The namespace contains the user_id, so each user has their own drawer – per-user memory isolation."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "激活持久化，按线程对话",
        "en": "Switch on persistence and chat per thread"
      },
      "code": {
        "zh": "from langgraph.checkpoint.memory import InMemorySaver\n\ngraph = builder.compile([[checkpointer]]=[[InMemorySaver()|MemorySaver()]])\nconfig = {\"[[configurable]]\": {\"[[thread_id]]\": \"1\"}}\n\ninputs = {\"messages\": [{\"role\": \"user\", \"content\": \"你好，我是托米\"}]}\nfor chunk in graph.[[stream]](inputs, [[config]], stream_mode=\"[[values]]\"):\n    chunk[\"messages\"][-1].pretty_print()",
        "en": "from langgraph.checkpoint.memory import InMemorySaver\n\ngraph = builder.compile([[checkpointer]]=[[InMemorySaver()|MemorySaver()]])\nconfig = {\"[[configurable]]\": {\"[[thread_id]]\": \"1\"}}\n\ninputs = {\"messages\": [{\"role\": \"user\", \"content\": \"Hi, I'm Tommy\"}]}\nfor chunk in graph.[[stream]](inputs, [[config]], stream_mode=\"[[values]]\"):\n    chunk[\"messages\"][-1].pretty_print()"
      },
      "explain": {
        "zh": "编译时装上检查点；thread_id 放在两层 config 里，作为第二个参数传给 `stream`；`stream_mode=\"values\"` 每一步交出完整状态。",
        "en": "Add the checkpointer at compile time; thread_id goes in the two-level config, passed as `stream`'s second argument; `stream_mode=\"values\"` hands over the whole state at each step."
      }
    },
    {
      "title": {
        "zh": "在节点里读写 store",
        "en": "Reading and writing the store in a node"
      },
      "code": {
        "zh": "def call_model(state: MessagesState, [[config]]: RunnableConfig, [[*]], store: BaseStore):\n    user_id = config[\"configurable\"][\"[[user_id]]\"]\n    namespace = (\"memories\", user_id)\n    memories = store.[[search]](namespace, [[query]]=str(state[\"messages\"][-1].content))\n    info = \"\\n\".join([d.[[value]][\"data\"] for d in memories])\n    if \"记住\" in state[\"messages\"][-1].content:\n        store.[[put]](namespace, str(uuid.uuid4()), {\"data\": \"用户的名字是托米张\"})\n    ...\n\ngraph = builder.compile(checkpointer=InMemorySaver(), [[store]]=in_memory_store)",
        "en": "def call_model(state: MessagesState, [[config]]: RunnableConfig, [[*]], store: BaseStore):\n    user_id = config[\"configurable\"][\"[[user_id]]\"]\n    namespace = (\"memories\", user_id)\n    memories = store.[[search]](namespace, [[query]]=str(state[\"messages\"][-1].content))\n    info = \"\\n\".join([d.[[value]][\"data\"] for d in memories])\n    if \"remember\" in state[\"messages\"][-1].content:\n        store.[[put]](namespace, str(uuid.uuid4()), {\"data\": \"The user's name is Tommy Zhang\"})\n    ...\n\ngraph = builder.compile(checkpointer=InMemorySaver(), [[store]]=in_memory_store)"
      },
      "explain": {
        "zh": "`*` 之后的 `store` 由 LangGraph 按名字传入；`user_id` 从 config 里取；`search(..., query=...)` 按意思搜索，`put` 存入；编译时别忘了 `store=`。",
        "en": "LangGraph passes `store` (after the `*`) by name; `user_id` comes from the config; `search(..., query=...)` searches by meaning and `put` saves; don't forget `store=` when compiling."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：线程隔离的聊天图",
        "en": "Write it: a thread-isolated chat graph"
      },
      "task": {
        "zh": "不看上面的代码，写出视频第一部分的程序：\n1. `call_model` 节点：把 `state[\"messages\"]` 发给模型，返回 `{\"messages\": [回答]}`\n2. 用 `MessagesState` 建图：START → call_model → END，编译时加上 `InMemorySaver()`\n3. 函数 `chat(text, config)`：用 `graph.stream(..., config, stream_mode=\"values\")` 运行，每一步用 `pretty_print()` 打印最后一条消息\n4. 线程 \"1\" 先自我介绍再问名字，线程 \"2\" 问名字\n\n写完可以对照 `practice/l31_threads_todo.py` 补全并运行。",
        "en": "Without looking above, write the program from part 1 of the video:\n1. a `call_model` node that sends `state[\"messages\"]` to the model and returns `{\"messages\": [reply]}`\n2. a `MessagesState` graph START → call_model → END, compiled with `InMemorySaver()`\n3. `chat(text, config)`: run `graph.stream(..., config, stream_mode=\"values\")` and `pretty_print()` the last message of each step\n4. on thread \"1\" introduce yourself, then ask your name; on thread \"2\" ask your name\n\nThen complete `practice/l31_threads_todo.py` the same way and run it."
      },
      "starter": {
        "zh": "from langchain_deepseek import ChatDeepSeek\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 1. call_model 节点\n\n\n# 2. 建图，编译时加上 checkpointer\n\n\n# 3. chat(text, config)：用 stream(..., stream_mode=\"values\") 打印每一步的最后一条消息\n\n\n# 4. 线程 1：自我介绍、问名字；线程 2：问名字",
        "en": "from langchain_deepseek import ChatDeepSeek\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 1. the call_model node\n\n\n# 2. build the graph and compile it with a checkpointer\n\n\n# 3. chat(text, config): print each step's last message with stream(..., stream_mode=\"values\")\n\n\n# 4. thread 1: introduce yourself, ask your name; thread 2: ask your name"
      },
      "solution": {
        "zh": "from langchain_deepseek import ChatDeepSeek\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 1. call_model 节点\ndef call_model(state: MessagesState):\n    response = model.invoke(state[\"messages\"])\n    return {\"messages\": [response]}\n\n# 2. 建图，编译时加上 checkpointer\nbuilder = StateGraph(MessagesState)\nbuilder.add_node(\"call_model\", call_model)\nbuilder.add_edge(START, \"call_model\")\nbuilder.add_edge(\"call_model\", END)\ngraph = builder.compile(checkpointer=InMemorySaver())\n\n# 3. chat(text, config)：用 stream(..., stream_mode=\"values\") 打印每一步的最后一条消息\ndef chat(text, config):\n    inputs = {\"messages\": [{\"role\": \"user\", \"content\": text}]}\n    for chunk in graph.stream(inputs, config, stream_mode=\"values\"):\n        chunk[\"messages\"][-1].pretty_print()\n\n# 4. 线程 1：自我介绍、问名字；线程 2：问名字\nconfig1 = {\"configurable\": {\"thread_id\": \"1\"}}\nchat(\"你好，我是托米\", config1)\nchat(\"我叫什么名字？\", config1)\nchat(\"我叫什么名字？\", {\"configurable\": {\"thread_id\": \"2\"}})",
        "en": "from langchain_deepseek import ChatDeepSeek\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 1. the call_model node\ndef call_model(state: MessagesState):\n    response = model.invoke(state[\"messages\"])\n    return {\"messages\": [response]}\n\n# 2. build the graph and compile it with a checkpointer\nbuilder = StateGraph(MessagesState)\nbuilder.add_node(\"call_model\", call_model)\nbuilder.add_edge(START, \"call_model\")\nbuilder.add_edge(\"call_model\", END)\ngraph = builder.compile(checkpointer=InMemorySaver())\n\n# 3. chat(text, config): print each step's last message with stream(..., stream_mode=\"values\")\ndef chat(text, config):\n    inputs = {\"messages\": [{\"role\": \"user\", \"content\": text}]}\n    for chunk in graph.stream(inputs, config, stream_mode=\"values\"):\n        chunk[\"messages\"][-1].pretty_print()\n\n# 4. thread 1: introduce yourself, ask your name; thread 2: ask your name\nconfig1 = {\"configurable\": {\"thread_id\": \"1\"}}\nchat(\"Hi, I'm Tommy\", config1)\nchat(\"What's my name?\", config1)\nchat(\"What's my name?\", {\"configurable\": {\"thread_id\": \"2\"}})"
      },
      "checks": [
        {
          "zh": "定义了节点 `call_model(state...)`",
          "en": "Defines the node `call_model(state...)`",
          "re": "def\\s+call_model\\s*\\(\\s*state"
        },
        {
          "zh": "节点返回 `{\"messages\": [...]}`",
          "en": "The node returns `{\"messages\": [...]}`",
          "re": "return\\s*\\{\\s*[\\\"']messages[\\\"']\\s*:\\s*\\["
        },
        {
          "zh": "用 `StateGraph(MessagesState)` 建图",
          "en": "Builds `StateGraph(MessagesState)`",
          "re": "StateGraph\\(\\s*MessagesState\\s*\\)"
        },
        {
          "zh": "编译时传入 `checkpointer=InMemorySaver()`",
          "en": "Compiles with `checkpointer=InMemorySaver()`",
          "re": "compile\\(\\s*checkpointer\\s*=\\s*(InMemorySaver|MemorySaver)\\(\\)\\s*\\)"
        },
        {
          "zh": "两层 config：`{\"configurable\": {\"thread_id\": ...}}`",
          "en": "Two-level config: `{\"configurable\": {\"thread_id\": ...}}`",
          "re": "\\{\\s*[\\\"']configurable[\\\"']\\s*:\\s*\\{\\s*[\\\"']thread_id[\\\"']\\s*:"
        },
        {
          "zh": "用 `stream(..., stream_mode=\"values\")` 运行",
          "en": "Runs with `stream(..., stream_mode=\"values\")`",
          "re": "\\.stream\\([^)]*stream_mode\\s*=\\s*[\\\"']values[\\\"']"
        },
        {
          "zh": "用 `pretty_print()` 打印消息",
          "en": "Prints messages with `pretty_print()`",
          "re": "\\.pretty_print\\(\\)"
        }
      ]
    },
    {
      "title": {
        "zh": "手写：跨线程读取记忆的节点",
        "en": "Write it: a node that reads memories across threads"
      },
      "task": {
        "zh": "向量模型和带索引的 `in_memory_store` 已经准备好。请写出视频第二部分的程序：\n1. `call_model(state, config, *, store)`：从 `config[\"configurable\"][\"user_id\"]` 取用户；namespace 是 `(\"memories\", user_id)`；用 `store.search(namespace, query=最后一条消息)` 搜索，拼进 system 提示词；最后一句里有「记住」或 remember 时，用 `store.put` 存一条「用户的名字是托米张」，key 用 `str(uuid.uuid4())`\n2. 建图，编译时同时传 `checkpointer` 和 `store`\n3. 三次调用：（线程 1，用户 1）请它记住；（线程 2，用户 1）问名字；（线程 3，用户 2）问名字\n\n可以对照 `practice/l31_cross_thread_todo.py` 补全并运行（3 次 DeepSeek 调用）。",
        "en": "The embedding model and the indexed `in_memory_store` are ready. Write the program from part 2 of the video:\n1. `call_model(state, config, *, store)`: get the user from `config[\"configurable\"][\"user_id\"]`; the namespace is `(\"memories\", user_id)`; search with `store.search(namespace, query=last message)` and put the results into the system prompt; if the last line contains “记住” or “remember”, save “The user's name is Tommy Zhang” with `store.put` and key `str(uuid.uuid4())`\n2. build the graph and compile it with both `checkpointer` and `store`\n3. three calls: (thread 1, user 1) ask it to remember; (thread 2, user 1) ask the name; (thread 3, user 2) ask the name\n\nYou can complete and run `practice/l31_cross_thread_todo.py` the same way (3 DeepSeek calls)."
      },
      "starter": {
        "zh": "import os\nimport uuid\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"HF_HOME\", os.path.join(PROJECT_DIR, \".cache\", \"hf\"))\nfrom fastembed import TextEmbedding\nfrom langchain_core.runnables import RunnableConfig\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom langgraph.store.base import BaseStore\nfrom langgraph.store.memory import InMemoryStore\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\nembedder = TextEmbedding(\"BAAI/bge-small-zh-v1.5\", cache_dir=os.path.join(PROJECT_DIR, \".cache\", \"fastembed\"))\n\ndef embed(texts):\n    return [vector.tolist() for vector in embedder.embed(texts)]\n\nin_memory_store = InMemoryStore(index={\"embed\": embed, \"dims\": 512})\n\n# 1. call_model(state, config, *, store)：取 user_id → 搜索记忆 → 拼 system 提示词\n#    → 有「记住」就 put 一条「用户的名字是托米张」→ 调用模型\n\n\n# 2. 建图，编译时同时传 checkpointer 和 store\n\n\n# 3. 三次调用：(线程1, 用户1) 请它记住；(线程2, 用户1) 问名字；(线程3, 用户2) 问名字",
        "en": "import os\nimport uuid\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"HF_HOME\", os.path.join(PROJECT_DIR, \".cache\", \"hf\"))\nfrom fastembed import TextEmbedding\nfrom langchain_core.runnables import RunnableConfig\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom langgraph.store.base import BaseStore\nfrom langgraph.store.memory import InMemoryStore\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\nembedder = TextEmbedding(\"BAAI/bge-small-zh-v1.5\", cache_dir=os.path.join(PROJECT_DIR, \".cache\", \"fastembed\"))\n\ndef embed(texts):\n    return [vector.tolist() for vector in embedder.embed(texts)]\n\nin_memory_store = InMemoryStore(index={\"embed\": embed, \"dims\": 512})\n\n# 1. call_model(state, config, *, store): read user_id -> search memories -> build the system prompt\n#    -> if \"remember\" is in the line, put \"The user's name is Tommy Zhang\" -> call the model\n\n\n# 2. build the graph; compile with both a checkpointer and the store\n\n\n# 3. three calls: (thread 1, user 1) ask it to remember; (thread 2, user 1) and (thread 3, user 2) ask the name"
      },
      "solution": {
        "zh": "import os\nimport uuid\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"HF_HOME\", os.path.join(PROJECT_DIR, \".cache\", \"hf\"))\nfrom fastembed import TextEmbedding\nfrom langchain_core.runnables import RunnableConfig\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom langgraph.store.base import BaseStore\nfrom langgraph.store.memory import InMemoryStore\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\nembedder = TextEmbedding(\"BAAI/bge-small-zh-v1.5\", cache_dir=os.path.join(PROJECT_DIR, \".cache\", \"fastembed\"))\n\ndef embed(texts):\n    return [vector.tolist() for vector in embedder.embed(texts)]\n\nin_memory_store = InMemoryStore(index={\"embed\": embed, \"dims\": 512})\n\n# 1. call_model(state, config, *, store)：取 user_id → 搜索记忆 → 拼 system 提示词\n#    → 有「记住」就 put 一条「用户的名字是托米张」→ 调用模型\ndef call_model(state: MessagesState, config: RunnableConfig, *, store: BaseStore):\n    user_id = config[\"configurable\"][\"user_id\"]\n    namespace = (\"memories\", user_id)\n    memories = store.search(namespace, query=str(state[\"messages\"][-1].content))\n    info = \"\\n\".join([d.value[\"data\"] for d in memories])\n    system_msg = f\"你是一个正在和用户聊天的助手。用户信息：{info}\"\n    last_message = state[\"messages\"][-1]\n    if \"记住\" in last_message.content or \"remember\" in last_message.content.lower():\n        store.put(namespace, str(uuid.uuid4()), {\"data\": \"用户的名字是托米张\"})\n    response = model.invoke([{\"role\": \"system\", \"content\": system_msg}] + state[\"messages\"])\n    return {\"messages\": [response]}\n\n# 2. 建图，编译时同时传 checkpointer 和 store\nbuilder = StateGraph(MessagesState)\nbuilder.add_node(\"call_model\", call_model)\nbuilder.add_edge(START, \"call_model\")\nbuilder.add_edge(\"call_model\", END)\ngraph = builder.compile(checkpointer=InMemorySaver(), store=in_memory_store)\n\n# 3. 三次调用：(线程1, 用户1) 请它记住；(线程2, 用户1) 问名字；(线程3, 用户2) 问名字\ndef chat(text, config):\n    out = graph.invoke({\"messages\": [{\"role\": \"user\", \"content\": text}]}, config)\n    print(out[\"messages\"][-1].content)\n\nchat(\"请记住：我的名字叫托米张\", {\"configurable\": {\"thread_id\": \"1\", \"user_id\": \"1\"}})\nchat(\"我叫什么名字？\", {\"configurable\": {\"thread_id\": \"2\", \"user_id\": \"1\"}})\nchat(\"我叫什么名字？\", {\"configurable\": {\"thread_id\": \"3\", \"user_id\": \"2\"}})",
        "en": "import os\nimport uuid\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"HF_HOME\", os.path.join(PROJECT_DIR, \".cache\", \"hf\"))\nfrom fastembed import TextEmbedding\nfrom langchain_core.runnables import RunnableConfig\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom langgraph.store.base import BaseStore\nfrom langgraph.store.memory import InMemoryStore\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\nembedder = TextEmbedding(\"BAAI/bge-small-zh-v1.5\", cache_dir=os.path.join(PROJECT_DIR, \".cache\", \"fastembed\"))\n\ndef embed(texts):\n    return [vector.tolist() for vector in embedder.embed(texts)]\n\nin_memory_store = InMemoryStore(index={\"embed\": embed, \"dims\": 512})\n\n# 1. call_model(state, config, *, store): read user_id -> search memories -> build the system prompt\n#    -> if \"remember\" is in the line, put \"The user's name is Tommy Zhang\" -> call the model\ndef call_model(state: MessagesState, config: RunnableConfig, *, store: BaseStore):\n    user_id = config[\"configurable\"][\"user_id\"]\n    namespace = (\"memories\", user_id)\n    memories = store.search(namespace, query=str(state[\"messages\"][-1].content))\n    info = \"\\n\".join([d.value[\"data\"] for d in memories])\n    system_msg = f\"You are a helpful assistant talking to the user. User info: {info}\"\n    last_message = state[\"messages\"][-1]\n    if \"记住\" in last_message.content or \"remember\" in last_message.content.lower():\n        store.put(namespace, str(uuid.uuid4()), {\"data\": \"The user's name is Tommy Zhang\"})\n    response = model.invoke([{\"role\": \"system\", \"content\": system_msg}] + state[\"messages\"])\n    return {\"messages\": [response]}\n\n# 2. build the graph; compile with both a checkpointer and the store\nbuilder = StateGraph(MessagesState)\nbuilder.add_node(\"call_model\", call_model)\nbuilder.add_edge(START, \"call_model\")\nbuilder.add_edge(\"call_model\", END)\ngraph = builder.compile(checkpointer=InMemorySaver(), store=in_memory_store)\n\n# 3. three calls: (thread 1, user 1) ask it to remember; (thread 2, user 1) and (thread 3, user 2) ask the name\ndef chat(text, config):\n    out = graph.invoke({\"messages\": [{\"role\": \"user\", \"content\": text}]}, config)\n    print(out[\"messages\"][-1].content)\n\nchat(\"Please remember: my name is Tommy Zhang\", {\"configurable\": {\"thread_id\": \"1\", \"user_id\": \"1\"}})\nchat(\"What's my name?\", {\"configurable\": {\"thread_id\": \"2\", \"user_id\": \"1\"}})\nchat(\"What's my name?\", {\"configurable\": {\"thread_id\": \"3\", \"user_id\": \"2\"}})"
      },
      "checks": [
        {
          "zh": "节点参数是 `config: RunnableConfig, *, store: BaseStore`",
          "en": "The node takes `config: RunnableConfig, *, store: BaseStore`",
          "re": "config\\s*:\\s*RunnableConfig\\s*,\\s*\\*\\s*,\\s*store\\s*:\\s*BaseStore"
        },
        {
          "zh": "从 `config[\"configurable\"][\"user_id\"]` 取用户",
          "en": "Reads `config[\"configurable\"][\"user_id\"]`",
          "re": "config\\[\\s*[\\\"']configurable[\\\"']\\s*\\]\\[\\s*[\\\"']user_id[\\\"']\\s*\\]"
        },
        {
          "zh": "namespace 是 `(\"memories\", user_id)`",
          "en": "The namespace is `(\"memories\", user_id)`",
          "re": "\\(\\s*[\\\"']memories[\\\"']\\s*,\\s*user_id\\s*\\)"
        },
        {
          "zh": "用 `store.search(namespace, query=...)` 搜索",
          "en": "Searches with `store.search(namespace, query=...)`",
          "re": "store\\.search\\(\\s*namespace\\s*,\\s*query\\s*="
        },
        {
          "zh": "用 `store.put(...)` 和 `str(uuid.uuid4())` 存记忆",
          "en": "Saves with `store.put(...)` and `str(uuid.uuid4())`",
          "re": "store\\.put\\(\\s*namespace\\s*,\\s*str\\(\\s*uuid\\.uuid4\\(\\)\\s*\\)"
        },
        {
          "zh": "编译时传入 `store=`",
          "en": "Compiles with `store=`",
          "re": "compile\\([^\\n]*?store\\s*=\\s*in_memory_store\\s*\\)"
        },
        {
          "zh": "调用时 config 里同时有 thread_id 和 user_id",
          "en": "The call's config has both thread_id and user_id",
          "re": "[\\\"']thread_id[\\\"']\\s*:\\s*[\\\"']\\d[\\\"']\\s*,\\s*[\\\"']user_id[\\\"']"
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "编译时加了 checkpointer，调用时忘了传 config（或 config 里没有 thread_id），报 ValueError。",
      "en": "Compiling with a checkpointer but calling without a config (or without thread_id) – ValueError."
    },
    {
      "zh": "有了 checkpointer 还每次把整段历史传进去，历史会重复。每次只传新的一句。",
      "en": "Resending the whole history although a checkpointer is present – it gets duplicated. Pass only the new line."
    },
    {
      "zh": "忘了 `compile(store=...)`：节点里的 `store` 是 `None`，报 `'NoneType' object has no attribute 'search'`。",
      "en": "Forgetting `compile(store=...)`: the node's `store` is `None` – `'NoneType' object has no attribute 'search'`."
    },
    {
      "zh": "config 里只放了 thread_id，节点却去读 user_id：`KeyError: 'user_id'`。",
      "en": "Putting only thread_id in the config while the node reads user_id: `KeyError: 'user_id'`."
    },
    {
      "zh": "换了向量模型却没改 `dims`。要和模型的输出维度保持一致（这里 512，视频的 BGE-M3 是 1024）。",
      "en": "Changing the embedding model but not `dims`. Keep it equal to the model's output size (512 here, 1024 for the video's BGE-M3)."
    },
    {
      "zh": "namespace 里没带 user_id（只写 `(\"memories\",)`），所有用户共用一个抽屉，信息会串到别人那里。",
      "en": "Leaving user_id out of the namespace (just `(\"memories\",)`), so every user shares one drawer and facts leak between users."
    },
    {
      "zh": "只有一个元素的元组忘了逗号：`(\"memories\")` 是字符串，不是元组。",
      "en": "Forgetting the comma in a one-item tuple: `(\"memories\")` is a string, not a tuple."
    }
  ],
  "recap": [
    {
      "zh": "没有 checkpointer：每次调用都从空状态开始，多轮对话接不上。",
      "en": "Without a checkpointer every call starts empty, so turns don't connect."
    },
    {
      "zh": "`compile(checkpointer=InMemorySaver())` + `{\"configurable\": {\"thread_id\": ...}}` = 线程隔离的多轮对话；视频里的 `MemorySaver` 是同一个类。",
      "en": "`compile(checkpointer=InMemorySaver())` + `{\"configurable\": {\"thread_id\": ...}}` = thread-isolated multi-turn chat; the video's `MemorySaver` is the same class."
    },
    {
      "zh": "`stream(..., stream_mode=\"values\")` 每一步交出完整状态，`pretty_print()` 漂亮地打印消息。",
      "en": "`stream(..., stream_mode=\"values\")` hands over the whole state at each step; `pretty_print()` prints a message nicely."
    },
    {
      "zh": "store = namespace（元组）+ key + value（字典）；带 `index` 时可以按意思 `search(..., query=...)`，`dims` 要和向量模型一致。",
      "en": "store = namespace (tuple) + key + value (dict); with an `index` you can `search(..., query=...)` by meaning, and `dims` must match the embedding model."
    },
    {
      "zh": "节点写成 `(state, config: RunnableConfig, *, store: BaseStore)`，从 config 取 user_id，用 store 搜索和存储；编译时传 `store=`。",
      "en": "Write the node as `(state, config: RunnableConfig, *, store: BaseStore)`, take user_id from config, search and save with the store; compile with `store=`."
    },
    {
      "zh": "thread_id 管「哪段对话」，user_id 管「哪个用户的记忆」：同一个用户换线程也能被认出来，不同用户互相隔离。",
      "en": "thread_id picks the conversation, user_id picks whose memories: the same user is recognised on any thread, and different users stay isolated."
    }
  ],
  "files": [
    {
      "path": "practice/l31_threads_todo.py",
      "zh": "练习：给聊天图加 checkpointer，用两个 thread_id 验证线程隔离（有 TODO 提示）。",
      "en": "Exercise: add a checkpointer to the chat graph and prove thread isolation with two thread_ids (with TODO hints)."
    },
    {
      "path": "practice/l31_threads_solution.py",
      "zh": "参考答案，和视频第一部分同样的顺序：无持久化 → 线程 1 → 线程 2 → 回到线程 1（6 次 DeepSeek 调用）。",
      "en": "Solution in the video's order: no persistence → thread 1 → thread 2 → back to thread 1 (6 DeepSeek calls)."
    },
    {
      "path": "practice/l31_cross_thread_todo.py",
      "zh": "练习：补全 dims、user_id、search、put 和 compile(store=...)，实现跨线程记忆（有 TODO 提示）。",
      "en": "Exercise: fill in dims, user_id, search, put and compile(store=...) for cross-thread memory (with TODO hints)."
    },
    {
      "path": "practice/l31_cross_thread_solution.py",
      "zh": "参考答案：视频第二部分的三次调用，带检索日志，最后查看 store（3 次 DeepSeek 调用，本机向量模型不需要 key）。",
      "en": "Solution: the video's three calls with retrieval logs, then a look inside the store (3 DeepSeek calls; the local embedding model needs no key)."
    }
  ]
});
