COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l30",
  "priority": "overview",
  "handwrite": false,
  "studyMinutes": 15,
  "source": "subtitle",
  "summary": {
    "zh": "概念课（视频没有写代码）：LangGraph 的**持久化层**用检查点（checkpoint）把图运行的整个状态存下来，需要时再恢复；**记忆**是建立在持久化之上的能力——短期记忆靠 checkpointer，长期记忆靠 store（可以放在 MySQL、Redis、MongoDB 等数据库里）。最后预告接下来两集的演示：线程隔离、跨线程调用、短期记忆、长期记忆，以及为了不撑爆上下文窗口而做的过滤和总结。",
    "en": "A concepts lesson (no code in the video): LangGraph's **persistence layer** uses checkpoints to save the graph's whole running state and restore it when needed; **memory** is an ability built on top of persistence – short-term memory uses a checkpointer, long-term memory a store (which can live in databases such as MySQL, Redis or MongoDB). It ends with a preview of the next two episodes: thread isolation, cross-thread calls, short-term memory, long-term memory, and the filtering and summarising that keep the context window from overflowing."
  },
  "goals": [
    {
      "zh": "用自己的话说出持久化层做什么：保存并恢复图的整个运行状态",
      "en": "Explain in your own words what the persistence layer does: save and restore the graph's whole running state"
    },
    {
      "zh": "说清楚持久化和记忆的关系：一个管数据放在哪，一个管数据怎么用",
      "en": "Explain how persistence and memory relate: one decides where data lives, the other how it is used"
    },
    {
      "zh": "区分短期记忆（checkpointer）和长期记忆（store），并知道它们可以放在内存或数据库里",
      "en": "Tell short-term memory (checkpointer) from long-term memory (store), and know both can live in memory or in a database"
    },
    {
      "zh": "说出为什么记忆需要过滤或总结",
      "en": "Explain why memory needs filtering or summarising"
    },
    {
      "zh": "说出 31、32 节要演示的五件事",
      "en": "Name the five things lessons 31 and 32 demonstrate"
    }
  ],
  "blocks": [
    {
      "t": "video",
      "zh": "这一集约 7 分钟，**只讲概念，没有写代码**。老师对着一张示意图（图里蓝色的部分代表持久化层）讲了四件事：持久化层是什么（[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=0)）、它和记忆是什么关系（[▶ 02:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=125)）、短期记忆和长期记忆分别靠什么实现（[▶ 02:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=156)），最后列出接下来要演示的内容（[▶ 04:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=280)），并说明为什么记忆还需要「加工」（[▶ 05:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=343)）。动手写代码从下一集（31）开始。",
      "en": "This roughly 7-minute episode is **concepts only, with no code**. Using a diagram (the blue part stands for the persistence layer), the instructor covers four things: what the persistence layer is ([▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=0)), how it relates to memory ([▶ 02:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=125)), what short-term and long-term memory are built on ([▶ 02:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=156)), and finally what the next demos will show ([▶ 04:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=280)) and why memory also needs “processing” ([▶ 05:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=343)). Hands-on code starts in the next lesson (31)."
    },
    {
      "t": "h",
      "zh": "一、持久化层：给图的运行「存档」，以后接着来",
      "en": "1. The persistence layer: save the run, continue later"
    },
    {
      "t": "p",
      "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=0) 老师先举了一个例子：用户 7 点和你的 AI 应用聊了一会儿，这段交互被**自动**存进持久化层；到了 17 点（或者第二天），用户回来接着聊，系统从存储里把状态恢复出来，从上次停下的地方继续。\n\n要注意，恢复的**不只是聊天记录**，而是图在那个时刻的**整个状态**：对话消息、调用过哪些工具、工具返回了什么结果……图运行到哪一步，就恢复到哪一步。\n\n[▶ 01:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=62) LangGraph 用**检查点（checkpoint）**实现这件事：每存一次，就像给图的当前状态拍一张快照。所以可以这样概括：**持久化层是系统层面的一套机制：把图运行到某一刻的状态存下来，需要时再原样还原**，让应用记得之前所有的交互，中断之后还能接着往下走。",
      "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=0) The instructor starts with an example: at 7:00 a user chats with your AI app, and the exchange is **automatically** saved to the persistence layer; at 17:00 (or the next day) the user comes back, the system restores the state from storage and carries on from where it stopped.\n\nNote that what comes back is **not just the chat log** but the graph's **whole state** at that moment: the messages, which tools were called, what they returned… The graph resumes at exactly the step it had reached.\n\n[▶ 01:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=62) LangGraph does this with **checkpoints**: each save is like a snapshot of the graph's current state. In short: **the persistence layer is a system-level mechanism that stores the graph's state at a given moment and brings it back exactly when needed**, so the app remembers all earlier interactions and can continue after an interruption."
    },
    {
      "t": "p",
      "zh": "[▶ 01:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=93) 老师用前端框架打了个比方：React、Vue 这类框架都维护着一份「状态」，可以记下某一刻做了什么，之后再回到那个状态。你也可以把它想成**游戏存档**：关机前存一下，下次读档接着玩。\n\n有了这套存档机制，两件事就有了基础：\n- **调试**：出了问题，可以翻看每一步存下来的状态\n- **人机协作**：图可以停下来等人确认，再从存档处继续（33–36 节的人机交互就建立在它上面）",
      "en": "[▶ 01:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=93) The instructor compares it to front-end frameworks: React or Vue keep a “state”, so you can record what happened at some moment and go back to it later. You can also think of a **game save**: save before switching off, load it next time and play on.\n\nThis save mechanism is the foundation for two things:\n- **Debugging**: when something goes wrong, you can look at the state saved at each step\n- **Human–AI collaboration**: the graph can stop, wait for a person to confirm, and continue from the save (the human-in-the-loop lessons 33–36 build on this)"
    },
    {
      "t": "note",
      "zh": "对照第 06 节：当时我们自己用一个 `message_history` 列表保存对话。那个办法有三个局限——只存了消息、只能有一段对话、程序一退出就没了。LangGraph 的持久化层把这件事做成了系统功能：存的是图的完整状态，按会话分开存，还可以存进数据库。",
      "en": "Compare with lesson 06: there we kept the conversation ourselves in a `message_history` list. That had three limits – only messages were saved, there was only one conversation, and everything vanished when the program exited. LangGraph's persistence layer turns this into a system feature: it saves the graph's whole state, keeps each conversation separate, and can write to a database."
    },
    {
      "t": "p",
      "zh": "**补充：用十几行 Python 模拟「读档 → 运行 → 存档」。** 下面这段不是 LangGraph，只是把思路写出来：一个字典当「存档柜」，键是会话编号 `thread_id`，值是这段对话的消息列表。它在浏览器里用模拟模型运行：",
      "en": "**Extra: imitate “load → run → save” in a dozen lines of Python.** The code below is not LangGraph; it just spells out the idea: a dict serves as the “save cabinet”, keyed by a conversation id `thread_id`, holding that conversation's messages. It runs in the browser against the mock model:"
    },
    {
      "t": "code",
      "file": "mini_checkpointer.py",
      "run": "mock",
      "code": {
        "zh": "from llm import client, MODEL\n\nsaved = {}      # 「存档柜」：thread_id -> 这段对话的消息列表\n\ndef chat(text, thread_id):\n    history = saved.get(thread_id, [])                      # 1. 读档：没有存档就从空列表开始\n    history = history + [{\"role\": \"user\", \"content\": text}]\n    reply = client.chat.completions.create(model=MODEL, messages=history).choices[0].message\n    saved[thread_id] = history + [{\"role\": \"assistant\", \"content\": reply.content}]   # 2. 存档\n    return reply.content\n\nprint(chat(\"你好，我叫托米\", \"1\"))\nprint(chat(\"我叫什么名字？\", \"1\"))     # 会话 1 有存档：记得\nprint(chat(\"我叫什么名字？\", \"2\"))     # 会话 2 没有存档：不知道\n\nfor thread_id in saved:\n    print(\"会话\", thread_id, \"存了\", len(saved[thread_id]), \"条消息\")",
        "en": "from llm import client, MODEL\n\nsaved = {}      # the \"save cabinet\": thread_id -> that conversation's messages\n\ndef chat(text, thread_id):\n    history = saved.get(thread_id, [])                      # 1. load: start empty if nothing is saved\n    history = history + [{\"role\": \"user\", \"content\": text}]\n    reply = client.chat.completions.create(model=MODEL, messages=history).choices[0].message\n    saved[thread_id] = history + [{\"role\": \"assistant\", \"content\": reply.content}]   # 2. save\n    return reply.content\n\nprint(chat(\"Hi, my name is Tommy\", \"1\"))\nprint(chat(\"What is my name?\", \"1\"))     # conversation 1 has a save: remembers\nprint(chat(\"What is my name?\", \"2\"))     # conversation 2 has none: doesn't know\n\nfor thread_id in saved:\n    print(\"conversation\", thread_id, \"holds\", len(saved[thread_id]), \"messages\")"
      },
      "note": {
        "zh": "`saved.get(thread_id, [])` 在键不存在时返回第二个参数，也就是空列表（`.get` 回顾 05、10 节）。真正的 checkpointer 比这里多做两件事：存的是**整个状态**而不只是消息，而且图的**每一步**之后都存一次。",
        "en": "`saved.get(thread_id, [])` returns its second argument, an empty list, when the key is missing (`.get`: see lessons 05 and 10). A real checkpointer does two more things: it saves the **whole state**, not just messages, and it saves after **every step** of the graph."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "老师例子里，用户 17 点回来接着聊时，系统恢复的是什么？",
        "en": "In the instructor's example, what does the system restore when the user comes back at 17:00?"
      },
      "options": [
        {
          "zh": "只有聊天记录",
          "en": "Only the chat log"
        },
        {
          "zh": "只有最后一条消息",
          "en": "Only the last message"
        },
        {
          "zh": "图在那一刻的整个状态：消息、工具调用、工具结果等",
          "en": "The graph's whole state at that moment: messages, tool calls, tool results and so on"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "持久化保存和恢复的是图的完整执行状态，所以能从上次停下的那一步接着运行。",
        "en": "Persistence saves and restores the graph's complete execution state, so it can resume at the very step where it stopped."
      }
    },
    {
      "t": "h",
      "zh": "二、记忆和持久化是什么关系",
      "en": "2. How memory relates to persistence"
    },
    {
      "t": "p",
      "zh": "[▶ 02:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=125) 这两个词经常一起出现，但不是一回事：\n- **记忆（memory）**是一种**认知能力**：让 AI 能存储、检索并使用过去的信息。\n- **持久化**是一种**机制**：负责把数据存下来、需要时取回来。\n\n[▶ 03:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=218) 它们的关系是：**记忆建立在持久化之上**，就像应用程序建立在数据库之上。持久化解决「数据**放在哪里**」，记忆解决「这些数据**怎么用**」。所以不管你用哪种记忆，都得先把持久化层打开。",
      "en": "[▶ 02:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=125) The two words often appear together but mean different things:\n- **Memory** is a **cognitive ability**: it lets the AI store, retrieve and use past information.\n- **Persistence** is a **mechanism**: it stores data and fetches it back when needed.\n\n[▶ 03:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=218) Their relationship: **memory is built on top of persistence**, just as an application is built on a database. Persistence answers “**where** does the data live?”, memory answers “**how** do we use it?”. So whatever kind of memory you use, the persistence layer has to be switched on first."
    },
    {
      "t": "p",
      "zh": "[▶ 04:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=249) 为什么值得费这个劲？存下来的记忆可以在合适的时候放回给模型，模型有了更好的上下文，回答的质量就更高。（第 03 节说过：不管记忆存在哪，最后都要变成文字放进 `messages`，模型才看得到。）",
      "en": "[▶ 04:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=249) Why bother? Stored memories can be handed back to the model at the right moment; with better context the model gives better answers. (As lesson 03 put it: wherever memory is stored, it must end up as text in `messages` for the model to see it.)"
    },
    {
      "t": "h",
      "zh": "三、短期记忆和长期记忆",
      "en": "3. Short-term and long-term memory"
    },
    {
      "t": "p",
      "zh": "[▶ 02:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=156) LangGraph 把记忆分成两种，它们各有一个负责存数据的组件：\n\n| | 短期记忆 | 长期记忆 |\n|---|---|---|\n| 靠什么实现 | checkpointer（检查点） | store（存储） |\n| 老师说的典型存放位置 | 内存 | MySQL、Redis、MongoDB 这类数据库 |\n| 适合的场景 | 简单场景：在一次会话里保持基本状态 | 需要长期保留、以后再检索出来的信息 |\n| 数据的样子 | 按会话保存的整份状态 | 一条条「键-值」记录，可以检索 |\n\n[▶ 03:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=186) 老师接着说明记忆在这里起什么作用：它是持久化的一种用法，让 AI 在一来一回的对话里始终记得前情；信息有结构地组织起来（比如一对一对的「键-值」）；有检索机制，能把过去的记录查出来；还规定了查到的信息怎样融进当前的对话。至于 store 背后用 MySQL、Redis 还是 MongoDB，只是实现方式不同。",
      "en": "[▶ 02:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=156) LangGraph splits memory into two kinds, each with its own storage component:\n\n| | Short-term memory | Long-term memory |\n|---|---|---|\n| Built on | checkpointer | store |\n| Typical place, per the instructor | In memory (RAM) | Databases such as MySQL, Redis, MongoDB |\n| Good for | Simple cases: keeping basic state within one session | Information to keep long-term and retrieve later |\n| Shape of the data | The whole state, saved per conversation | Individual key–value records you can search |\n\n[▶ 03:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=186) The instructor then explains what memory does here: it is one use of persistence that lets the AI keep context across interactions; information is organised in a structured way (for example as key–value pairs); a retrieval mechanism looks up past records; and it defines how what was found is blended into the current conversation. Whether the store runs on MySQL, Redis or MongoDB is just an implementation choice."
    },
    {
      "t": "note",
      "zh": "**两个角度看「长期」。** LangGraph 官方文档按「**谁能看到**」来区分：checkpointer 的存档只属于一段会话（一个 thread），store 里的信息同一个用户的所有会话都能读到。老师更强调「**存在哪里**」：放在内存里的，程序一关就没了；放进数据库的，能长期保留。两个角度合起来是一张表：\n\n| | 存在内存（程序退出就没了） | 存进数据库（重启后还在） |\n|---|---|---|\n| 只属于一段会话：checkpointer | `InMemorySaver`（31、32 节） | `SqliteSaver`；视频用 MongoDB（32 节） |\n| 跨会话共享：store | `InMemoryStore`（31 节） | 数据库版的 store，例如 `SqliteStore`（本课程不展开） |\n\n32 节老师把「存进 MongoDB 的检查点」叫作长期记忆，就是从「存在哪里」这个角度说的。",
      "en": "**Two ways to read “long-term”.** LangGraph's official docs split by **who can see it**: a checkpointer's saves belong to one conversation (one thread), while the store can be read from every conversation of the same user. The instructor stresses **where it is kept**: in memory it vanishes when the program closes; in a database it lasts. Put together, they form one table:\n\n| | In memory (gone on exit) | In a database (survives restarts) |\n|---|---|---|\n| One conversation only: checkpointer | `InMemorySaver` (lessons 31, 32) | `SqliteSaver`; MongoDB in the video (lesson 32) |\n| Shared across conversations: store | `InMemoryStore` (lesson 31) | A database-backed store such as `SqliteStore` (not covered here) |\n\nIn lesson 32 the instructor calls “checkpoints saved in MongoDB” long-term memory – that is the “where it is kept” view."
    },
    {
      "t": "check",
      "q": {
        "zh": "用户明天开一个**新会话**，希望 AI 仍然知道他的名字。按官方文档的分法，名字应该放在哪里？",
        "en": "Tomorrow the user opens a **new conversation** and wants the AI to still know their name. Following the official docs, where should the name go?"
      },
      "options": [
        {
          "zh": "store，按用户保存",
          "en": "The store, saved per user"
        },
        {
          "zh": "checkpointer，用同一个会话编号",
          "en": "The checkpointer, under the same conversation id"
        },
        {
          "zh": "节点函数里的一个局部变量",
          "en": "A local variable inside a node function"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "checkpointer 的存档只属于一段会话，新会话看不到；跨会话共享的信息放进 store。",
        "en": "A checkpointer's saves belong to one conversation, so a new one can't see them; information shared across conversations goes into the store."
      }
    },
    {
      "t": "h",
      "zh": "四、接下来两集要演示什么",
      "en": "4. What the next two episodes demonstrate"
    },
    {
      "t": "p",
      "zh": "[▶ 04:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=280) 老师列出了后面的演示内容，正好对应 31、32 两节：\n1. **线程隔离的持久化层**：同一张图里，线程 1 和线程 2 各聊各的，彼此的记忆互不影响（31 节）\n2. **跨线程调用** [▶ 05:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=313)：同一个用户在线程 1 和线程 2 里都在聊天，用 `user_id` 把信息从一个线程带到另一个线程（31 节）\n3. **短期记忆**：给智能体加上记忆（32 节）\n4. **长期记忆**：把对话存进数据库（32 节）\n5. **记忆的再加工** [▶ 05:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=343)：对记忆做过滤（删除）和总结（32 节）\n\n这里的「线程（thread）」和操作系统里的多线程无关，指的是**一段独立的对话**，就像聊天软件里的一个会话窗口。代码层面开启持久化其实只要两步，31 节会一步步演示：",
      "en": "[▶ 04:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=280) The instructor lists the coming demos, which map onto lessons 31 and 32:\n1. **Thread-isolated persistence**: in one graph, thread 1 and thread 2 each have their own conversation, and their memories don't affect each other (lesson 31)\n2. **Cross-thread calls** [▶ 05:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=313): the same user chats in thread 1 and thread 2, and a `user_id` carries information from one thread to the other (lesson 31)\n3. **Short-term memory**: giving an agent memory (lesson 32)\n4. **Long-term memory**: saving conversations to a database (lesson 32)\n5. **Post-processing memory** [▶ 05:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=343): filtering (deleting) and summarising (lesson 32)\n\nA “thread” here has nothing to do with operating-system threads; it means **one separate conversation**, like one chat window in a messaging app. In code, switching persistence on takes just two steps, which lesson 31 walks through:"
    },
    {
      "t": "code",
      "file": "preview.py",
      "code": {
        "zh": "graph = builder.compile(checkpointer=InMemorySaver())      # 1. 编译时装上检查点\nconfig = {\"configurable\": {\"thread_id\": \"1\"}}             # 2. 调用时说明是哪段对话\ngraph.invoke({\"messages\": [{\"role\": \"user\", \"content\": \"你好\"}]}, config)",
        "en": "graph = builder.compile(checkpointer=InMemorySaver())      # 1. add a checkpointer when compiling\nconfig = {\"configurable\": {\"thread_id\": \"1\"}}             # 2. say which conversation on each call\ngraph.invoke({\"messages\": [{\"role\": \"user\", \"content\": \"Hi\"}]}, config)"
      },
      "note": {
        "zh": "只是预告，不能单独运行；完整代码见 31 节。",
        "en": "A preview only – it doesn't run on its own; the full code is in lesson 31."
      }
    },
    {
      "t": "h",
      "zh": "五、为什么记忆需要「加工」",
      "en": "5. Why memory needs processing"
    },
    {
      "t": "p",
      "zh": "[▶ 05:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=343) 人和 AI 对话是一人一句、一直往下加的。不管这些记录放在短期记忆还是长期记忆里，如果原封不动地全部塞进模型的上下文窗口，迟早会把窗口撑爆——想想和 AI 聊上一整天会积累多少消息 [▶ 06:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=378)。\n\n所以记忆需要优化：删掉一部分（过滤），或者把旧对话压缩成摘要（总结）。删得太多会忘事，留得太多会撑爆，怎么取舍，老师称之为一门「艺术」。第 06 节的 `trim_history` 就是最简单的一种做法；32 节会看到 LangGraph 里的两种做法。",
      "en": "[▶ 05:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=343) A conversation grows one line at a time, back and forth. Whether the records sit in short-term or long-term memory, stuffing all of them unchanged into the model's context window will burst it sooner or later – think how many messages a whole day of chatting piles up [▶ 06:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=31&t=378).\n\nSo memory needs optimising: drop some of it (filtering) or condense old turns into a summary (summarising). Drop too much and it forgets; keep too much and it overflows – the instructor calls striking that balance an “art”. Lesson 06's `trim_history` is the simplest form; lesson 32 shows two ways to do it in LangGraph."
    },
    {
      "t": "check",
      "q": {
        "zh": "为什么不能把全部历史一直原样发给模型？",
        "en": "Why can't you keep sending the whole history to the model unchanged?"
      },
      "options": [
        {
          "zh": "因为 checkpointer 只能保存 10 条消息",
          "en": "Because a checkpointer can only save 10 messages"
        },
        {
          "zh": "因为上下文窗口有限，对话越积越长，迟早会超出",
          "en": "Because the context window is limited and a growing conversation will eventually exceed it"
        },
        {
          "zh": "因为模型不接受 assistant 消息",
          "en": "Because the model doesn't accept assistant messages"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "消息一直在增长，而窗口大小是固定的；所以要过滤或总结。",
        "en": "Messages keep growing while the window size is fixed, so you filter or summarise."
      }
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "LangGraph 的持久化层主要靠什么实现？",
        "en": "What mainly implements LangGraph's persistence layer?"
      },
      "options": [
        {
          "zh": "提示词模板",
          "en": "Prompt templates"
        },
        {
          "zh": "检查点（checkpoint）",
          "en": "Checkpoints"
        },
        {
          "zh": "向量数据库",
          "en": "A vector database"
        },
        {
          "zh": "模型自己的记忆",
          "en": "The model's own memory"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "每存一次检查点，就是给图的当前状态拍一张快照，之后可以从这里恢复。",
        "en": "Each checkpoint is a snapshot of the graph's current state that you can later restore from."
      }
    },
    {
      "q": {
        "zh": "下面哪句话最准确地描述了持久化和记忆的关系？",
        "en": "Which sentence best describes how persistence and memory relate?"
      },
      "options": [
        {
          "zh": "两者是同一个东西的两个名字",
          "en": "They are two names for the same thing"
        },
        {
          "zh": "记忆是机制，持久化是认知能力",
          "en": "Memory is the mechanism; persistence is the cognitive ability"
        },
        {
          "zh": "有了记忆就不需要持久化",
          "en": "With memory you don't need persistence"
        },
        {
          "zh": "记忆建立在持久化之上：持久化管数据放在哪，记忆管数据怎么用",
          "en": "Memory is built on persistence: persistence decides where data lives, memory decides how it is used"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "老师的比喻：就像应用程序建立在数据库之上。任何记忆都要先开启持久化。",
        "en": "The instructor's comparison: like an application built on a database. Any memory needs persistence switched on first."
      }
    },
    {
      "q": {
        "zh": "短期记忆和长期记忆分别由 LangGraph 的哪个组件负责？",
        "en": "Which LangGraph components handle short-term and long-term memory?"
      },
      "options": [
        {
          "zh": "短期：checkpointer；长期：store",
          "en": "Short-term: checkpointer; long-term: store"
        },
        {
          "zh": "短期：store；长期：checkpointer",
          "en": "Short-term: store; long-term: checkpointer"
        },
        {
          "zh": "两者都由 ToolNode 负责",
          "en": "ToolNode handles both"
        },
        {
          "zh": "两者都由模型负责",
          "en": "The model handles both"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "checkpointer 保存每段会话的状态；store 保存可以跨会话检索的键-值记录。",
        "en": "The checkpointer saves each conversation's state; the store keeps key–value records that can be searched across conversations."
      }
    },
    {
      "q": {
        "zh": "为什么「人机协作」（图停下来等人确认，再继续）离不开持久化？",
        "en": "Why does human–AI collaboration (pause for a person, then continue) depend on persistence?"
      },
      "options": [
        {
          "zh": "因为持久化层负责给人发通知",
          "en": "Because the persistence layer notifies the person"
        },
        {
          "zh": "因为没有持久化就不能调用模型",
          "en": "Because without persistence you can't call a model"
        },
        {
          "zh": "因为暂停时的状态必须存下来，人回复后才能从存档处接着运行",
          "en": "Because the state at the pause must be saved so the run can resume from it after the person replies"
        },
        {
          "zh": "其实不需要，两者没有关系",
          "en": "It doesn't – they are unrelated"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "等人回复可能要很久，程序不能一直卡着；状态存档之后，随时可以恢复继续。",
        "en": "Waiting for a reply may take a long time; once the state is saved, the run can resume whenever it comes."
      }
    },
    {
      "q": {
        "zh": "31 节要演示的「线程隔离」指的是什么？",
        "en": "What does the “thread isolation” demo in lesson 31 mean?"
      },
      "options": [
        {
          "zh": "操作系统让两个程序不能同时运行",
          "en": "The OS stops two programs from running at once"
        },
        {
          "zh": "同一张图里，不同 thread_id 的对话各自保存，互不影响",
          "en": "In one graph, conversations with different thread_ids are saved separately and don't affect each other"
        },
        {
          "zh": "每个节点只能运行一次",
          "en": "Each node may only run once"
        },
        {
          "zh": "不同用户必须用不同的模型",
          "en": "Different users must use different models"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "thread 就是一段对话；不同 thread 的记录分开存放。想跨线程共享信息，要用 user_id 加 store。",
        "en": "A thread is one conversation; different threads keep separate records. To share across threads you use a user_id plus a store."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "开启持久化的两步",
        "en": "The two steps to switch on persistence"
      },
      "code": {
        "zh": "graph = builder.compile([[checkpointer]]=InMemorySaver())\nconfig = {\"[[configurable]]\": {\"[[thread_id]]\": \"1\"}}\ngraph.invoke({\"messages\": [{\"role\": \"user\", \"content\": \"你好\"}]}, [[config]])",
        "en": "graph = builder.compile([[checkpointer]]=InMemorySaver())\nconfig = {\"[[configurable]]\": {\"[[thread_id]]\": \"1\"}}\ngraph.invoke({\"messages\": [{\"role\": \"user\", \"content\": \"Hi\"}]}, [[config]])"
      },
      "explain": {
        "zh": "编译时装上检查点，调用时用两层的 config 说明是哪段对话。31 节会详细讲。",
        "en": "Add the checkpointer when compiling and name the conversation with the two-level config on each call. Lesson 31 covers it in detail."
      }
    }
  ],
  "pitfalls": [
    {
      "zh": "把「线程 thread」理解成操作系统的多线程。这里它只是一段对话的编号。",
      "en": "Reading “thread” as an operating-system thread. Here it is just the id of one conversation."
    },
    {
      "zh": "以为持久化只保存聊天记录。它保存的是图的整个状态，包括工具调用和工具结果。",
      "en": "Thinking persistence only saves the chat log. It saves the graph's whole state, including tool calls and their results."
    },
    {
      "zh": "以为有了记忆，就可以把所有历史一直原样发给模型。上下文窗口有限，要过滤或总结。",
      "en": "Assuming that with memory you can keep sending the entire history unchanged. The context window is limited; filter or summarise."
    },
    {
      "zh": "以为名字里带 `InMemory` 的组件能长期保存——程序一退出就清空了。",
      "en": "Expecting anything named `InMemory…` to keep data – it is wiped when the program exits."
    },
    {
      "zh": "把短期 / 长期只理解成「内存 / 数据库」。官方文档的划分是「一段会话 / 跨会话」，两个角度都要知道。",
      "en": "Reading short-term / long-term only as “RAM / database”. The official docs split by “one conversation / across conversations”; know both views."
    }
  ],
  "recap": [
    {
      "zh": "持久化层用检查点保存和恢复图的整个执行状态，中断后可以从停下的地方继续。",
      "en": "The persistence layer uses checkpoints to save and restore the graph's whole execution state, so a run can continue where it stopped."
    },
    {
      "zh": "持久化是机制（数据放在哪），记忆是能力（数据怎么用）；记忆建立在持久化之上。",
      "en": "Persistence is the mechanism (where data lives); memory is the ability (how it is used); memory sits on top of persistence."
    },
    {
      "zh": "短期记忆靠 checkpointer，长期记忆靠 store；store 可以用 MySQL、Redis、MongoDB 等数据库实现。",
      "en": "Short-term memory uses a checkpointer, long-term memory a store; a store can be backed by MySQL, Redis, MongoDB and others."
    },
    {
      "zh": "持久化是调试和人机协作的基础。",
      "en": "Persistence is the foundation for debugging and human–AI collaboration."
    },
    {
      "zh": "接下来：线程隔离、跨线程调用（31 节）；短期记忆、长期记忆、过滤和总结（32 节）。",
      "en": "Coming up: thread isolation and cross-thread calls (lesson 31); short-term memory, long-term memory, filtering and summarising (lesson 32)."
    },
    {
      "zh": "对话会越积越长，记忆必须加工，否则会撑爆上下文窗口。",
      "en": "Conversations keep growing, so memory must be processed or it will overflow the context window."
    }
  ],
  "files": [
    {
      "path": "practice/l30_persistence_demo.py",
      "zh": "补充演示（不调用模型、不需要 key）：同一张图有无 checkpointer、换不同 thread_id 时的区别，可以先跑一下，31 节再细讲。",
      "en": "Extra demo (no model call, no key): the same graph with and without a checkpointer and with different thread_ids – run it now; lesson 31 explains the details."
    }
  ],
  "noPy": true
});
