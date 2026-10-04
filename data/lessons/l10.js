COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l10",
  "priority": "important",
  "handwrite": true,
  "studyMinutes": 40,
  "source": "subtitle",
  "summary": {
    "zh": "这一集分两半。前半讲**连续对话**：两次 `Runner.run_sync` 互不相识，第二句「再加一呢」接不上；Agents SDK 用普通列表保存对话，`result.to_input_list()` 把这一轮变成列表，`append` 新问题后再交给 Runner。后半讲**多模态**：把本地图片读成字节、base64 编码、拼成 data URL，用 `input_image` 发给 Agent，并弄清楚「框架支持」和「模型支持」缺一不可。",
    "en": "The episode has two halves. First, **multi-turn conversation**: two `Runner.run_sync` calls know nothing of each other, so the follow-up “And plus one more?” makes no sense; the Agents SDK keeps a conversation as a plain list, `result.to_input_list()` turns a run into that list, and you `append` the new question and hand it back to the Runner. Second, **multimodal input**: read a local image as bytes, base64-encode it into a data URL, send it with `input_image`, and see why both the framework and the model must support a format."
  },
  "goals": [
    {
      "zh": "说清楚为什么连着两次 `Runner.run_sync`，第二句「再加一呢」接不上",
      "en": "Explain why the follow-up “And plus one more?” fails across two separate `Runner.run_sync` calls"
    },
    {
      "zh": "用 `result.to_input_list()` + `append` 把上一轮带进下一轮，并看懂打印出来的历史",
      "en": "Carry a run into the next one with `result.to_input_list()` + `append`, and read the printed history"
    },
    {
      "zh": "知道历史就是列表，可以加、删、裁剪、保存",
      "en": "Know that the history is just a list you can add to, trim and save"
    },
    {
      "zh": "把本地图片编码成 base64 data URL，用 `input_image` 发给 Agent 并追问",
      "en": "Encode a local image as a base64 data URL, send it with `input_image` and ask a follow-up"
    },
    {
      "zh": "分清框架支持和模型支持：两边都支持，多模态才能用",
      "en": "Tell framework support from model support: multimodal input needs both"
    },
    {
      "zh": "不看资料，手写「多轮对话」和「看图」两段代码",
      "en": "Write, unaided, the multi-turn and the image programs"
    }
  ],
  "blocks": [
    {
      "t": "video",
      "zh": "这一集约 22 分钟，分两半：[▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=1) 连续对话（多轮对话），[▶ 07:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=437) 多模态（给模型发图片）。讲义和视频不同的地方：\n- **模型**：老师这几集用的是谷歌的模型（09 集运行时模型自称由谷歌训练；这一集讲多模态时他也说选谷歌的模型是因为它能看图）。讲义统一用 DeepSeek 的 `deepseek-flash`（`practice/llm.py`），代码写法一样。\n- **同步写法**：老师拿第 09 集的异步代码当模板（`async def main()` 里写 `await Runner.run(...)`，再用 `asyncio.run(main())` 启动）。讲义为了让代码短一些，改用同步的 `Runner.run_sync`，结果一样；想和视频一致，就换回第 09 节的写法。\n- **图片**：老师截了一张写着 hello world 的图；练习里准备了一张类似的 `practice/data/l10_hello.png`（深灰底、白字）。",
      "en": "This episode runs about 22 minutes in two halves: [▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=1) multi-turn conversation, and [▶ 07:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=437) multimodal input (sending the model an image). Where these notes differ from the video:\n- **Model**: in these episodes the instructor uses a Google model (in episode 09 the model introduces itself as trained by Google, and here he says he picked it because it can read images). These notes use DeepSeek's `deepseek-flash` (`practice/llm.py`); the code is the same.\n- **Sync style**: the instructor uses episode 09's async code as his template (`await Runner.run(...)` inside `async def main()`, started with `asyncio.run(main())`). To keep the code short these notes use the synchronous `Runner.run_sync` instead; the result is the same. To match the video, switch back to lesson 09's style.\n- **Image**: the instructor screenshots the words hello world; the practice folder has a similar `practice/data/l10_hello.png` (white text on dark grey)."
    },
    {
      "t": "h",
      "zh": "一、连续对话：第二句为什么接不上",
      "en": "1. Multi-turn: why the second question falls flat"
    },
    {
      "t": "p",
      "zh": "[▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=1) 老师先用一个很小的例子：先问「1+1 等于几」，再单独问一句「再加一呢」。第一句答 2 没问题，第二句却对不上——模型根本不知道要在什么基础上「再加一」。\n\n原因和第 06 节一样：每次 `Runner.run_sync` 都是一场全新的对话，SDK 发给模型的只有 Agent 的 `instructions` 和**这一次**的输入，上一次聊了什么不会自动带上。要让它接着聊，就要做**对话管理**：保存对话记录，下次连同新问题一起发过去。",
      "en": "[▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=1) The instructor starts with a tiny example: ask “what is 1+1”, then, separately, “and plus one more?”. The first answer, 2, is fine, but the second makes no sense – the model has no idea what to add one to.\n\nThe reason is the one from lesson 06: every `Runner.run_sync` is a brand-new conversation. The SDK sends the model only the agent's `instructions` and the input of **this** run; nothing from earlier runs comes along. To keep talking you need **conversation management**: keep the record and send it again together with the new question."
    },
    {
      "t": "code",
      "file": "no_memory_sdk.py",
      "code": {
        "zh": "from agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nagent = Agent(\n    name=\"助手\",\n    instructions=\"你是一个简洁的中文助手，回答尽量简短。\",\n    model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),\n)\n\nr1 = Runner.run_sync(agent, \"1+1等于几？\")\nprint(r1.final_output)                       # 2\nr2 = Runner.run_sync(agent, \"再加一呢？\")      # 和上一次毫无关系\nprint(r2.final_output)                       # 模型不知道要在什么基础上「再加一」",
        "en": "from agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nagent = Agent(\n    name=\"assistant\",\n    instructions=\"You are a concise assistant. Keep answers short.\",\n    model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),\n)\n\nr1 = Runner.run_sync(agent, \"What is 1+1?\")\nprint(r1.final_output)                       # 2\nr2 = Runner.run_sync(agent, \"And plus one more?\")   # unrelated to the first run\nprint(r2.final_output)                       # the model doesn't know what to add one to"
      },
      "note": {
        "zh": "后面的例子省略开头这几行（导入、`set_tracing_disabled`、创建 `agent`），只写后面的部分。完整可运行的文件见本节的练习文件。",
        "en": "Later examples skip this header (imports, `set_tracing_disabled`, creating `agent`) and show only the rest. The practice files contain complete, runnable versions."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "两次 `Runner.run_sync` 之间，SDK 默认会帮你保存对话吗？",
        "en": "Between two `Runner.run_sync` calls, does the SDK save the conversation by default?"
      },
      "options": [
        {
          "zh": "会，历史保存在 Agent 对象里",
          "en": "Yes, the history is stored in the Agent object"
        },
        {
          "zh": "不会，每次只发送 instructions 和这一次的输入",
          "en": "No, each run sends only the instructions and this run's input"
        },
        {
          "zh": "会，但只保存最近 10 条",
          "en": "Yes, but only the last 10 messages"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "Agent 对象只保存配置（名字、instructions、模型、工具），不保存对话。要「记得」，就得把历史一起传进去。",
        "en": "An Agent holds configuration only (name, instructions, model, tools), never the conversation. For it to “remember”, you pass the history in."
      }
    },
    {
      "t": "h",
      "zh": "二、to_input_list()：把这一轮变成列表",
      "en": "2. to_input_list(): turn a run into a list"
    },
    {
      "t": "p",
      "zh": "[▶ 01:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=99) 不同框架管理对话的方式不一样。OpenAI 的 Agents SDK 做得很简单：它没有另造一个「对话记录」类，而是沿用第 04、06 节的做法——**对话就是一个列表**，里面一条一条是消息。所以最直接的办法，是像第 06 节那样自己维护一个列表（比如一个全局变量），每次把整个列表发过去。\n\n[▶ 02:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=160) 老师演示的是更省事的另一种：第一次照常只发一句话，运行完再调用运行结果的一个方法 `result.to_input_list()`。它把这一轮的全部内容（你的问题、模型的思考和回答，有工具调用的话还有调用和结果）整理成一个**普通的 Python 列表**。而 `Runner.run_sync` 的第二个参数既可以是字符串，也可以是这样的列表。所以 [▶ 03:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=222) 做法就是：取出列表，`append` 一条新的用户消息，把整个列表交给下一次运行。",
      "en": "[▶ 01:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=99) Frameworks manage conversations in different ways. The OpenAI Agents SDK keeps it simple: rather than inventing a “conversation record” class, it sticks with what you saw in lessons 04 and 06 – **a conversation is a list** of messages. So the most direct approach is lesson 06's: keep a list yourself (a global variable, say) and send the whole list every time.\n\n[▶ 02:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=160) The instructor shows a handier alternative: send just a sentence the first time as usual, and afterwards call a method of the run result, `result.to_input_list()`. It packs everything from this run (your question, the model's reasoning and answer, plus tool calls and results if any) into an **ordinary Python list**. And the second argument of `Runner.run_sync` can be a string or exactly such a list. So [▶ 03:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=222) you take the list, `append` a new user message and pass the whole list to the next run."
    },
    {
      "t": "code",
      "file": "to_input_list.py",
      "code": {
        "zh": "result = Runner.run_sync(agent, \"1+1等于几？\")\nprint(result.final_output)\n\nhistory = result.to_input_list()             # 这一轮对话 → 一个普通的 Python 列表\nprint(\"对话历史：\", history)\n\nhistory.append({\"role\": \"user\", \"content\": \"再加一呢？\"})   # 在列表末尾加上新问题\nresult = Runner.run_sync(agent, history)     # 第二个参数也可以是列表\nprint(result.final_output)                   # 3\n\nprint(\"最新的完整对话历史：\", result.to_input_list())",
        "en": "result = Runner.run_sync(agent, \"What is 1+1?\")\nprint(result.final_output)\n\nhistory = result.to_input_list()             # this run -> an ordinary Python list\nprint(\"history:\", history)\n\nhistory.append({\"role\": \"user\", \"content\": \"And plus one more?\"})   # add the new question at the end\nresult = Runner.run_sync(agent, history)     # the second argument can be a list too\nprint(result.final_output)                   # 3\n\nprint(\"latest full history:\", result.to_input_list())"
      }
    },
    {
      "t": "p",
      "zh": "[▶ 04:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=284) 老师把历史打印出来逐项看：用户的问题、模型的回答，追问之后后面又多了新问题和新回答（2+1=3）。下面是用 DeepSeek 实测打印的最新历史（为了好看，每项换了一行，内容有省略）：",
      "en": "[▶ 04:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=284) The instructor prints the history and walks through it: the user's question, the model's answer, and after the follow-up a new question and a new answer (2+1=3). Here is the latest history printed in a real DeepSeek run (one item per line for readability, shortened and translated):"
    },
    {
      "t": "code",
      "file": {
        "zh": "最新的完整对话历史（实测）",
        "en": "latest full history (real run)"
      },
      "lang": "text",
      "code": {
        "zh": "[\n  {'content': '1+1等于几？', 'role': 'user'},\n  {'id': '__fake_id__', 'summary': [{'text': '……答案是2。直接回答。', 'type': 'summary_text'}], 'type': 'reasoning'},\n  {'id': '__fake_id__', 'content': [{'annotations': [], 'text': '2', 'type': 'output_text', 'logprobs': []}],\n   'role': 'assistant', 'status': 'completed', 'type': 'message', ...},\n  {'role': 'user', 'content': '再加一呢？'},\n  {'id': '__fake_id__', 'summary': [{'text': '……用户问再加一呢？意思2+1=3……', 'type': 'summary_text'}], 'type': 'reasoning'},\n  {'id': '__fake_id__', 'content': [{'annotations': [], 'text': '3', 'type': 'output_text', 'logprobs': []}],\n   'role': 'assistant', 'status': 'completed', 'type': 'message', ...},\n]",
        "en": "[\n  {'content': 'What is 1+1?', 'role': 'user'},\n  {'id': '__fake_id__', 'summary': [{'text': '... the answer is 2 ...', 'type': 'summary_text'}], 'type': 'reasoning'},\n  {'id': '__fake_id__', 'content': [{'annotations': [], 'text': '2', 'type': 'output_text', 'logprobs': []}],\n   'role': 'assistant', 'status': 'completed', 'type': 'message', ...},\n  {'role': 'user', 'content': 'And plus one more?'},\n  {'id': '__fake_id__', 'summary': [{'text': '... \"plus one more\" means 2+1=3 ...', 'type': 'summary_text'}], 'type': 'reasoning'},\n  {'id': '__fake_id__', 'content': [{'annotations': [], 'text': '3', 'type': 'output_text', 'logprobs': []}],\n   'role': 'assistant', 'status': 'completed', 'type': 'message', ...},\n]"
      },
      "note": {
        "zh": "三点值得注意：\n- 列表里**没有 system 消息**：`instructions` 每次运行都由 Agent 自动放在最前面，不会重复。\n- 你自己加的消息是 `{\"role\": \"user\", \"content\": ...}` 这种简单写法；模型的回答是 SDK 自己的格式（`type` 为 `message`，文字在 `content[0][\"text\"]`）。不用自己构造它，原样传回去就行。\n- 用 DeepSeek 时还多了 `type` 为 `reasoning` 的项，是模型的思考过程。视频里的谷歌模型没有这一项。原样传回去没有问题。",
        "en": "Three things to notice:\n- There is **no system message**: the agent puts its `instructions` in front on every run, so they never repeat.\n- The message you add is the simple `{\"role\": \"user\", \"content\": ...}` form; the model's answers are in the SDK's own format (`type` `message`, text in `content[0][\"text\"]`). You never build those yourself – just pass them back unchanged.\n- With DeepSeek there are extra items of `type` `reasoning`: the model's thinking. The Google model in the video has none. Passing them back works fine."
      }
    },
    {
      "t": "py",
      "title": {
        "zh": "append 和 +：往列表里加新消息",
        "en": "append and +: adding a message to a list"
      },
      "zh": "视频用 `append`（第 06 节学过）。还有一种写法是 `+`，两者的区别：\n- `history.append(x)`：**原地修改**，在末尾加**一个元素**，自己返回 `None`\n- `history + [x]`：把两个列表接成一个**新列表**，原来的不变；`+` 两边**都必须是列表**，所以单条消息要先放进 `[ ]`\n- `history + {...}`：报 `TypeError`，列表不能直接加字典\n\n老师写的时候也碰到过：一开始把新消息又包了一层列表交给 `append`，编辑器标出了波浪线，改成直接 `append` 那个字典才对。",
      "en": "The video uses `append` (from lesson 06). Another way is `+`. The difference:\n- `history.append(x)` **changes the list in place**, adds **one item** at the end and itself returns `None`\n- `history + [x]` joins two lists into a **new list** and leaves the old one alone; **both sides of `+` must be lists**, so wrap a single message in `[ ]`\n- `history + {...}` raises `TypeError`: you can't add a dict to a list\n\nThe instructor trips over this too: at first he wraps the new message in an extra list before `append`, the editor underlines it, and he fixes it by appending the dict itself.",
      "code": {
        "zh": "question = {\"role\": \"user\", \"content\": \"再加一呢？\"}\n\n# 写法一（视频的写法）：append 原地修改，加一个元素\nhistory = [{\"role\": \"user\", \"content\": \"1+1等于几？\"},\n           {\"role\": \"assistant\", \"content\": \"2\"}]\nhistory.append(question)\nprint(len(history))                     # 3\n\n# append 自己返回 None，所以不能写成 x = 列表.append(...)\nx = [1, 2].append(3)\nprint(x)                                # None\n\n# 写法二：+ 生成一个新列表，原来的列表不变；+ 两边都必须是列表\nold = [{\"role\": \"user\", \"content\": \"1+1等于几？\"}]\nnew_input = old + [question]            # 单条消息要先放进 [ ]\nprint(len(old), len(new_input))         # 1 2\n\ntry:\n    old + question                      # 列表 + 字典\nexcept TypeError as e:\n    print(\"TypeError:\", e)",
        "en": "question = {\"role\": \"user\", \"content\": \"And plus one more?\"}\n\n# Style 1 (the video's): append changes the list in place and adds one item\nhistory = [{\"role\": \"user\", \"content\": \"What is 1+1?\"},\n           {\"role\": \"assistant\", \"content\": \"2\"}]\nhistory.append(question)\nprint(len(history))                     # 3\n\n# append itself returns None, so never write x = some_list.append(...)\nx = [1, 2].append(3)\nprint(x)                                # None\n\n# Style 2: + builds a new list and leaves the old one alone; both sides must be lists\nold = [{\"role\": \"user\", \"content\": \"What is 1+1?\"}]\nnew_input = old + [question]            # wrap a single message in [ ] first\nprint(len(old), len(new_input))         # 1 2\n\ntry:\n    old + question                      # list + dict\nexcept TypeError as e:\n    print(\"TypeError:\", e)"
      }
    },
    {
      "t": "note",
      "zh": "补充（视频没有演示）：把同样的做法放进第 06 节的 `while True` 循环，就是一个终端聊天程序。注意每轮结束后用 `to_input_list()` **替换**历史，因为它返回的已经是从头到现在的全部记录。练习文件里的 `chat()` 就是它。",
      "en": "Extra (not shown in the video): put the same idea inside lesson 06's `while True` loop and you have a terminal chat. After each turn, **replace** the history with `to_input_list()`, because it already returns the whole record from the start. `chat()` in the practice file is exactly this."
    },
    {
      "t": "code",
      "file": "chat_loop.py",
      "code": {
        "zh": "history = []                                   # 一开始没有历史\nwhile True:\n    text = input(\"你：\").strip()\n    if not text:\n        continue\n    if text == \"/exit\":\n        break\n    history.append({\"role\": \"user\", \"content\": text})\n    result = Runner.run_sync(agent, history)\n    print(\"AI：\", result.final_output)\n    history = result.to_input_list()           # 这一轮的完整记录成为新的历史",
        "en": "history = []                                   # no history yet\nwhile True:\n    text = input(\"You: \").strip()\n    if not text:\n        continue\n    if text == \"/exit\":\n        break\n    history.append({\"role\": \"user\", \"content\": text})\n    result = Runner.run_sync(agent, history)\n    print(\"AI:\", result.final_output)\n    history = result.to_input_list()           # this turn's full record becomes the history"
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "在聊天循环里，每轮结束写成 `history = history + result.to_input_list()` 会怎样？",
        "en": "In the chat loop you end each turn with `history = history + result.to_input_list()`. What happens?"
      },
      "options": [
        {
          "zh": "完全正确",
          "en": "It is exactly right"
        },
        {
          "zh": "报 TypeError",
          "en": "It raises TypeError"
        },
        {
          "zh": "旧历史被重复了一遍，越聊越长",
          "en": "The old history is duplicated, and it keeps growing"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "这一轮的输入里已经包含了旧历史，`to_input_list()` 又把它原样带了回来。直接 `history = result.to_input_list()` 即可。",
        "en": "This turn's input already contained the old history, and `to_input_list()` returns it again. Just write `history = result.to_input_list()`."
      }
    },
    {
      "t": "h",
      "zh": "三、历史就是列表，可以自己管理",
      "en": "3. The history is a list you can manage"
    },
    {
      "t": "p",
      "zh": "[▶ 06:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=376) 老师特别强调：对话一旦变成了 Python 里最常见的数据结构——列表，里面是字典——能做的事就多了：往里加内容、删掉一些、裁短一点让它更精简，或者存进数据库、按语义检索。怎么管，看实际业务需要。\n\n下面用一份和 `to_input_list()` 结构相同的手写历史，练几种常见操作（列表推导式和切片见第 06 节）：",
      "en": "[▶ 06:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=376) The instructor stresses this point: once the conversation is Python's most common data structure – a list of dicts – you can do a lot with it: add items, delete some, trim it to keep it lean, store it in a database or search it by meaning. How you manage it depends on what your application needs.\n\nBelow, a hand-written history with the same structure as `to_input_list()` lets you try a few common operations (list comprehensions and slicing are in lesson 06):"
    },
    {
      "t": "code",
      "file": "manage_history.py",
      "run": true,
      "code": {
        "zh": "# 一份和 to_input_list() 结构相同的历史（内容是手写的，结构照着实测结果）\nhistory = [\n    {\"role\": \"user\", \"content\": \"1+1等于几？\"},\n    {\"type\": \"reasoning\", \"summary\": [{\"type\": \"summary_text\", \"text\": \"答案是2\"}]},\n    {\"type\": \"message\", \"role\": \"assistant\", \"content\": [{\"type\": \"output_text\", \"text\": \"2\"}]},\n    {\"role\": \"user\", \"content\": \"再加一呢？\"},\n    {\"type\": \"reasoning\", \"summary\": [{\"type\": \"summary_text\", \"text\": \"2+1=3\"}]},\n    {\"type\": \"message\", \"role\": \"assistant\", \"content\": [{\"type\": \"output_text\", \"text\": \"3\"}]},\n]\nprint(\"一共\", len(history), \"项\")\n\n# 1. 每一项是什么？有 role 就看 role，没有就看 type（.get 取不到时返回第二个参数）\nfor item in history:\n    print(\" \", item.get(\"role\", item.get(\"type\")))\n\n# 2. 删掉模型的思考过程：历史变短，下次发送更省 token\nshort = [item for item in history if item.get(\"type\") != \"reasoning\"]\nprint(\"去掉思考过程：\", len(history), \"->\", len(short))\n\n# 3. 只保留最近一轮（最后 3 项：问题、思考、回答）\nrecent = history[-3:]\nprint(\"最近一轮从这里开始：\", recent[0])\n\n# 4. 列出用户问过的所有问题\nquestions = [item[\"content\"] for item in history if item.get(\"role\") == \"user\"]\nprint(questions)",
        "en": "# A history with the same structure as to_input_list() (hand-written content, real structure)\nhistory = [\n    {\"role\": \"user\", \"content\": \"What is 1+1?\"},\n    {\"type\": \"reasoning\", \"summary\": [{\"type\": \"summary_text\", \"text\": \"the answer is 2\"}]},\n    {\"type\": \"message\", \"role\": \"assistant\", \"content\": [{\"type\": \"output_text\", \"text\": \"2\"}]},\n    {\"role\": \"user\", \"content\": \"And plus one more?\"},\n    {\"type\": \"reasoning\", \"summary\": [{\"type\": \"summary_text\", \"text\": \"2+1=3\"}]},\n    {\"type\": \"message\", \"role\": \"assistant\", \"content\": [{\"type\": \"output_text\", \"text\": \"3\"}]},\n]\nprint(\"items:\", len(history))\n\n# 1. What is each item? Show role if there is one, else type (.get returns its 2nd argument when the key is missing)\nfor item in history:\n    print(\" \", item.get(\"role\", item.get(\"type\")))\n\n# 2. Drop the model's reasoning: a shorter history, fewer tokens next time\nshort = [item for item in history if item.get(\"type\") != \"reasoning\"]\nprint(\"without reasoning:\", len(history), \"->\", len(short))\n\n# 3. Keep only the latest round (the last 3 items: question, reasoning, answer)\nrecent = history[-3:]\nprint(\"the latest round starts with:\", recent[0])\n\n# 4. List every question the user asked\nquestions = [item[\"content\"] for item in history if item.get(\"role\") == \"user\"]\nprint(questions)"
      }
    },
    {
      "t": "note",
      "zh": "补充（视频没讲）：Agents SDK 还有 **Session**，可以替你保存和读取这份列表，每次只传新问题再加上 `session=session`。会话的长期保存，课程在 LangGraph 部分（第 30 节起）会系统地讲。用了 Session 就不要再自己拼历史，否则历史会发两遍。",
      "en": "Extra (not covered in the video): the Agents SDK also has **Sessions**, which store and load this list for you; each time you pass only the new question plus `session=session`. The course covers saving conversations properly in the LangGraph part (from lesson 30). With a Session, don't also build the history yourself, or it gets sent twice."
    },
    {
      "t": "code",
      "file": "session_extra.py",
      "code": {
        "zh": "from agents import SQLiteSession\n\nsession = SQLiteSession(\"user_1\", \"chat.db\")      # 会话编号 + 数据库文件（不给文件就只存在内存里）\nRunner.run_sync(agent, \"1+1等于几？\", session=session)\nresult = Runner.run_sync(agent, \"再加一呢？\", session=session)   # 历史由 SDK 自动读出、存回\nprint(result.final_output)",
        "en": "from agents import SQLiteSession\n\nsession = SQLiteSession(\"user_1\", \"chat.db\")      # session id + database file (no file = memory only)\nRunner.run_sync(agent, \"What is 1+1?\", session=session)\nresult = Runner.run_sync(agent, \"And plus one more?\", session=session)   # the SDK loads and saves the history\nprint(result.final_output)"
      }
    },
    {
      "t": "h",
      "zh": "四、多模态：前提是模型支持",
      "en": "4. Multimodal: the model must support it"
    },
    {
      "t": "p",
      "zh": "[▶ 07:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=437) **多模态**指模型除了文字，还能理解图片、音频、视频等输入。老师先讲前提：这个能力来自**模型本身**，不是框架给的；模型不支持，怎么写代码都没用。他这里用谷歌的模型，正是因为它能接收图片、音频这类输入。",
      "en": "[▶ 07:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=437) **Multimodal** means a model can understand inputs other than text – images, audio, video. The instructor starts with the precondition: this ability comes from **the model itself**, not the framework; if the model can't do it, no code will help. He uses a Google model here precisely because it accepts images and audio."
    },
    {
      "t": "video",
      "zh": "[▶ 07:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=468) 视频里老师说，DeepSeek 官网写明接口不支持直接传图片——那是录制时的情况。我们 2026-10 实测，`deepseek-flash` 已经可以接收图片（data URL 或网址都行），能读出图里的文字和颜色。所以本节练习直接用 DeepSeek，不需要别的 key。",
      "en": "[▶ 07:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=468) In the video the instructor says DeepSeek's website states that its API does not accept images – true when it was recorded. In our test (2026-10), `deepseek-flash` does accept images (as a data URL or a web address) and reads both the text and the colours. So the exercises use DeepSeek directly; no other key is needed."
    },
    {
      "t": "h",
      "zh": "五、把图片变成 base64 字符串",
      "en": "5. Turning an image into a base64 string"
    },
    {
      "t": "p",
      "zh": "[▶ 09:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=565) 图片怎么交给模型？OpenAI 风格的接口用 **JSON** 传参数，JSON 里只能放文字，图片的二进制数据塞不进去。通用的办法是先把二进制数据编码成 **base64 字符串**。老师为此写了一个辅助函数：传入图片路径，用二进制方式打开文件、读出字节，再用 `base64` 模块编码，最后转成 UTF-8 字符串返回。",
      "en": "[▶ 09:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=565) How do you hand an image to the model? OpenAI-style APIs pass parameters as **JSON**, and JSON holds only text – raw binary image data doesn't fit. The usual trick is to encode the binary data as a **base64 string** first. The instructor writes a helper for it: take the image path, open the file in binary mode and read the bytes, encode them with the `base64` module, and return them as a UTF-8 string."
    },
    {
      "t": "py",
      "title": {
        "zh": "读二进制文件、base64 和 pathlib",
        "en": "Binary files, base64 and pathlib"
      },
      "zh": "图片在硬盘上就是一串**字节**（bytes）。读取它要用二进制模式：\n- `with open(路径, \"rb\") as f:`：`r` 是读，`b` 是二进制；`with` 保证用完**自动关闭**文件（在 `with` 里直接 `return` 也会关）\n- `f.read()` 得到 `bytes`，打印出来像 `b'\\x89PNG...'`\n- `base64.b64encode(data)` 把任意字节变成只含字母、数字、`+`、`/`、`=` 的文本（结果仍是 bytes），再 `.decode(\"utf-8\")` 变成字符串\n- `pathlib.Path` 把路径当成对象：`p.name` 文件名，`p.suffix` 扩展名，`p.exists()` 是否存在，`p.parent / \"data\"` 用 `/` 拼路径。练习文件用 `Path(__file__).parent / \"data\" / \"l10_hello.png\"`（`__file__` 是当前 .py 文件的路径），在哪个目录运行都找得到图片\n\n下面读取网页运行环境里现成的 `weather_tool.py` 来演示：任何文件都是字节，图片也一样。",
      "en": "On disk an image is just a sequence of **bytes**. Read it in binary mode:\n- `with open(path, \"rb\") as f:` – `r` is read, `b` is binary; `with` **closes the file automatically** when done (a `return` inside `with` closes it too)\n- `f.read()` returns `bytes`, printed like `b'\\x89PNG...'`\n- `base64.b64encode(data)` turns any bytes into text made only of letters, digits, `+`, `/` and `=` (still bytes); `.decode(\"utf-8\")` makes it a str\n- `pathlib.Path` treats a path as an object: `p.name` is the file name, `p.suffix` the extension, `p.exists()` checks it exists, and `p.parent / \"data\"` joins paths with `/`. The practice files use `Path(__file__).parent / \"data\" / \"l10_hello.png\"` (`__file__` is the current .py file's path), which finds the image from any folder\n\nThe demo reads `weather_tool.py`, which already exists in the browser's Python: every file is bytes, images included.",
      "code": {
        "zh": "import base64\nfrom pathlib import Path\n\np = Path(\"weather_tool.py\")\nprint(p.name, p.suffix, p.exists())        # weather_tool.py .py True\n\nwith open(p, \"rb\") as f:                    # rb = 按二进制读取\n    data = f.read()\nprint(type(data).__name__, len(data))       # bytes 和字节数\nprint(data[:20])                            # 前 20 个字节\n\nb64_text = base64.b64encode(data).decode(\"utf-8\")   # bytes -> base64 -> str\nprint(b64_text[:40], \"...\")\nprint(\"长度：\", len(data), \"->\", len(b64_text))    # 大约变成 4/3 倍\n\nprint(base64.b64decode(b64_text) == data)  # 还原回来，完全一样：True\n\nprint(Path(\"practice\") / \"data\" / \"l10_hello.png\")   # 用 / 拼路径",
        "en": "import base64\nfrom pathlib import Path\n\np = Path(\"weather_tool.py\")\nprint(p.name, p.suffix, p.exists())        # weather_tool.py .py True\n\nwith open(p, \"rb\") as f:                    # rb = read as binary\n    data = f.read()\nprint(type(data).__name__, len(data))       # bytes and the byte count\nprint(data[:20])                            # the first 20 bytes\n\nb64_text = base64.b64encode(data).decode(\"utf-8\")   # bytes -> base64 -> str\nprint(b64_text[:40], \"...\")\nprint(\"length:\", len(data), \"->\", len(b64_text))   # about 4/3 as long\n\nprint(base64.b64decode(b64_text) == data)  # decodes back exactly: True\n\nprint(Path(\"practice\") / \"data\" / \"l10_hello.png\")   # join paths with /"
      }
    },
    {
      "t": "code",
      "file": "encode_image.py",
      "code": {
        "zh": "import base64\n\ndef encode_image(image_path):\n    with open(image_path, \"rb\") as image_file:          # \"rb\"：按二进制读取\n        return base64.b64encode(image_file.read()).decode(\"utf-8\")   # 字节 → base64 → 字符串",
        "en": "import base64\n\ndef encode_image(image_path):\n    with open(image_path, \"rb\") as image_file:          # \"rb\": read raw bytes\n        return base64.b64encode(image_file.read()).decode(\"utf-8\")   # bytes -> base64 -> str"
      },
      "note": {
        "zh": "这就是视频里的辅助函数，一行做了三件事：`image_file.read()` 读出字节 → `base64.b64encode(...)` 编码 → `.decode(\"utf-8\")` 变成字符串。",
        "en": "This is the video's helper; one line does three things: `image_file.read()` reads the bytes → `base64.b64encode(...)` encodes them → `.decode(\"utf-8\")` turns them into a str."
      }
    },
    {
      "t": "h",
      "zh": "六、把图片发给 Agent",
      "en": "6. Sending the image to the agent"
    },
    {
      "t": "p",
      "zh": "[▶ 11:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=694) 这次要发两样东西：图片本身，以及告诉模型拿图片做什么的提示词。老师在消息列表里放了**两条用户消息**：第一条是图片，第二条是问题「图片中是什么内容？」。`Runner.run_sync` 既然能接收列表，就适合做这种精细的安排。\n\n[▶ 13:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=818) 图片那一条的 `content` 不能直接放 base64 字符串：那样模型只看到一长串字母，会把它当普通文字去理解。要写成一个列表，里面放一个对象，声明「这是用户输入的图片」：`{\"type\": \"input_image\", \"image_url\": ...}`。",
      "en": "[▶ 11:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=694) This time two things go out: the image itself, and a prompt saying what to do with it. The instructor puts **two user messages** in the list: the first is the image, the second the question “What is in the picture?”. Since `Runner.run_sync` accepts a list, it suits this kind of fine-grained arrangement.\n\n[▶ 13:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=818) The image message's `content` can't just be the base64 string: the model would see a long run of letters and treat it as ordinary text. Instead it is a list holding an object that declares “this is an image from the user”: `{\"type\": \"input_image\", \"image_url\": ...}`."
    },
    {
      "t": "p",
      "zh": "[▶ 15:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=918) 手上没有图片网址，`image_url` 填什么？用前端开发里常见的 **data URL**：`data:image/png;base64,` 后面紧跟 base64 字符串。它不是真正的网址，但浏览器和很多程序都认识：看到这个开头，就把后面的内容按 base64 解码，当成图片。这样图片就以字符串的身份放进了 JSON。老师提醒这一串里**不要加空格**。另外，类型最好和图片的实际格式一致（png 写 `image/png`，jpg 写 `image/jpeg`）。",
      "en": "[▶ 15:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=918) There's no web address for the image, so what goes in `image_url`? A **data URL**, common in front-end work: `data:image/png;base64,` followed directly by the base64 string. It isn't a real address, but browsers and many programs understand it: on seeing that prefix they base64-decode the rest and treat it as an image. That is how the image travels inside JSON as a string. The instructor warns: **no spaces** anywhere in it. Also, the type should match the image's real format (`image/png` for png, `image/jpeg` for jpg)."
    },
    {
      "t": "code",
      "file": "vision_agent.py",
      "code": {
        "zh": "base64_image = encode_image(\"data/l10_hello.png\")\nprint(base64_image[:60], \"...\")              # 先看一眼：就是一串普通的字符\n\nmessages = [\n    # 第一条用户消息：图片。content 是列表，里面声明「这是一张图片」\n    {\n        \"role\": \"user\",\n        \"content\": [\n            {\"type\": \"input_image\", \"image_url\": f\"data:image/png;base64,{base64_image}\"},\n        ],\n    },\n    # 第二条用户消息：提示词，告诉模型拿图片做什么\n    {\"role\": \"user\", \"content\": \"图片中是什么内容？\"},\n]\nresult = Runner.run_sync(agent, messages)\nprint(result.final_output)\n\n# 追问颜色：用第二部分的方法，图片还留在历史里\nhistory = result.to_input_list()\nhistory.append({\"role\": \"user\", \"content\": \"文字和背景分别是什么颜色？\"})\nresult = Runner.run_sync(agent, history)\nprint(result.final_output)",
        "en": "base64_image = encode_image(\"data/l10_hello.png\")\nprint(base64_image[:60], \"...\")              # take a look: just ordinary characters\n\nmessages = [\n    # user message 1: the image. content is a list that declares \"this is an image\"\n    {\n        \"role\": \"user\",\n        \"content\": [\n            {\"type\": \"input_image\", \"image_url\": f\"data:image/png;base64,{base64_image}\"},\n        ],\n    },\n    # user message 2: the prompt - what to do with the image\n    {\"role\": \"user\", \"content\": \"What is in the picture?\"},\n]\nresult = Runner.run_sync(agent, messages)\nprint(result.final_output)\n\n# ask about the colours with the method from part 2: the image stays in the history\nhistory = result.to_input_list()\nhistory.append({\"role\": \"user\", \"content\": \"What colours are the text and the background?\"})\nresult = Runner.run_sync(agent, history)\nprint(result.final_output)"
      },
      "note": {
        "zh": "`data/l10_hello.png` 是相对路径，要在 `practice` 文件夹里运行。也可以把文字和图片放进**同一条**用户消息：`content` 写成 `[{\"type\": \"input_text\", \"text\": \"图片中是什么内容？\"}, {\"type\": \"input_image\", \"image_url\": ...}]`，效果一样。",
        "en": "`data/l10_hello.png` is a relative path, so run it from the `practice` folder. You can also put the text and the image in **one** user message: `content` = `[{\"type\": \"input_text\", \"text\": \"What is in the picture?\"}, {\"type\": \"input_image\", \"image_url\": ...}]` works the same."
      }
    },
    {
      "t": "p",
      "zh": "[▶ 16:51](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=1011) 运行前，老师先把编码结果打印出来：它真的是一串普通字符，不是 0 和 1。[▶ 17:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=1072) 运行后，模型读出了 Hello World，和图片一致。[▶ 18:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=1103) 老师接着强调，多模态**不只是 OCR（文字识别）**：图片里还有颜色、形状甚至情绪。于是他在发送的内容里再加一个问题「是什么颜色」，重新运行，[▶ 18:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=1134) 模型答出白色的字、深灰色的背景。讲义换了个做法：用第二部分的 `to_input_list()` + `append` 追问颜色——图片还留在历史里，所以模型照样能回答。实测 DeepSeek 的输出：",
      "en": "[▶ 16:51](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=1011) Before running it, the instructor prints the encoded result: it really is a string of ordinary characters, not 0s and 1s. [▶ 17:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=1072) After running, the model reads out Hello World, matching the image. [▶ 18:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=1103) He then stresses that multimodal input is **more than OCR** (text recognition): an image also carries colours, shapes, even mood. So he adds a second question – what colours? – to what he sends and runs it again, [▶ 18:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=1134) and the model answers white text on a dark grey background. These notes do it differently: they ask about the colours as a follow-up with `to_input_list()` + `append` from part 2 – the image is still in the history, so the model can answer. Real DeepSeek output:"
    },
    {
      "t": "code",
      "file": {
        "zh": "输出（实测）",
        "en": "output (real run, translated)"
      },
      "lang": "text",
      "code": {
        "zh": "base64 字符串开头：iVBORw0KGgoAAAANSUhEUgAAAWgAAAB4CAIAAABQJv+tAAALeElEQVR42u3d ...\nAI：图片中显示的是白色文字 **“Hello World”**，背景是深灰色。\nAI：文字是白色，背景是深灰色。",
        "en": "start of the base64 string: iVBORw0KGgoAAAANSUhEUgAAAWgAAAB4CAIAAABQJv+tAAALeElEQVR42u3d ...\nAI: The picture shows the white text **“Hello World”** on a dark grey background.\nAI: The text is white and the background is dark grey."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "想让模型看你电脑上的 `G:\\pics\\cat.png`，`image_url` 应该填什么？",
        "en": "To show the model `G:\\pics\\cat.png` from your computer, what goes in `image_url`?"
      },
      "options": [
        {
          "zh": "直接填 `G:\\pics\\cat.png`",
          "en": "`G:\\pics\\cat.png` as is"
        },
        {
          "zh": "读出文件字节，base64 编码后填 `data:image/png;base64,...`",
          "en": "Read the bytes, base64-encode them and use `data:image/png;base64,...`"
        },
        {
          "zh": "把 base64 字符串当作普通文字放进 `content`",
          "en": "Put the base64 string into `content` as plain text"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "模型在服务商的服务器上运行，读不到你的硬盘，本地路径没用；把 base64 当普通文字发过去，模型只会看到一串字母。要么用公网能访问的网址，要么用 data URL，并放在 `input_image` 里。",
        "en": "The model runs on the provider's servers and can't read your disk, so a local path is useless; sending base64 as plain text just shows the model a run of letters. Use a public web address or a data URL, inside an `input_image` part."
      }
    },
    {
      "t": "h",
      "zh": "七、框架支持和模型支持，缺一不可",
      "en": "7. Framework support and model support: you need both"
    },
    {
      "t": "p",
      "zh": "[▶ 19:26](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=1166) 多模态不只有图片，还有音频、视频、PDF 等。但老师在 SDK 源码里搜 `input_image` 后指出：当时这个框架在兼容接口（Chat Completions）下只处理文字和图片，图片还必须给 `image_url`（网址或 data URL），传别的文件类型会直接提示不支持。\n\n[▶ 21:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=1260) 他的结论：**框架是框架，模型是模型**。框架能传过去，模型不一定看得懂；模型看得懂，框架也不一定传得过去。两边都支持，多模态才能用好。遇到 PDF、Word 这类文件，可以先在代码里转换成两边都支持的格式，比如 PDF 转成图片、Word 转成网页文字。",
      "en": "[▶ 19:26](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=1166) Multimodal input isn't only images – there is audio, video, PDF and more. But after searching the SDK source for `input_image`, the instructor points out that back then the framework handled only text and images through the compatible API (Chat Completions); an image had to come as an `image_url` (a web address or data URL), and other file types were simply reported as unsupported.\n\n[▶ 21:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=11&t=1260) His conclusion: **the framework is one thing, the model another**. The framework may pass something on that the model can't understand, and the model may understand something the framework can't pass on. Only when both support a format does multimodal input work well. For files like PDF or Word, convert them in your code into a format both sides support – PDF pages into images, a Word file into web-page text."
    },
    {
      "t": "note",
      "zh": "版本差异：我们装的 openai-agents 0.20.0 比视频新。同一个转换函数现在除了 `input_text` 和 `input_image`，还能转换 `input_audio`（音频数据）、`input_file`（文件数据）和 `video_url`。但模型那一边仍要支持——我们只实测了 `deepseek-flash` 看图片，其他类型没有测试。",
      "en": "Version difference: our openai-agents 0.20.0 is newer than the video's. The same conversion function now handles `input_audio` (audio data), `input_file` (file data) and `video_url` besides `input_text` and `input_image`. The model still has to support them, though – we only tested images with `deepseek-flash`; the other types are untested."
    },
    {
      "t": "p",
      "zh": "SDK 实际发给模型的是什么？我们用的是 `OpenAIChatCompletionsModel`，SDK 会把自己的格式翻译成 Chat Completions 接口的格式（第 04 节直接调用 API 用的那种）：\n\n| Agents SDK 里写的 | 实际发给模型的 |\n|---|---|\n| `{\"type\": \"input_text\", \"text\": ...}` | `{\"type\": \"text\", \"text\": ...}` |\n| `{\"type\": \"input_image\", \"image_url\": \"...\"}` | `{\"type\": \"image_url\", \"image_url\": {\"url\": \"...\", \"detail\": \"auto\"}}` |\n\n所以不用框架、直接调用 `client.chat.completions.create` 时，要写右边这种格式（`detail` 表示看图的精细程度，可以不写）。下面这段可以在网页里运行：连的是模拟模型，它不会真的看图，但会检查消息格式。",
      "en": "What does the SDK actually send? With `OpenAIChatCompletionsModel`, the SDK translates its own format into the Chat Completions format (the one you used to call the API directly in lesson 04):\n\n| Written in the Agents SDK | Sent to the model |\n|---|---|\n| `{\"type\": \"input_text\", \"text\": ...}` | `{\"type\": \"text\", \"text\": ...}` |\n| `{\"type\": \"input_image\", \"image_url\": \"...\"}` | `{\"type\": \"image_url\", \"image_url\": {\"url\": \"...\", \"detail\": \"auto\"}}` |\n\nSo when you call `client.chat.completions.create` without a framework, use the right-hand format (`detail`, how closely the model looks at the image, is optional). This snippet runs in the browser against the mock model: it won't really look at the image, but it does check the message format."
    },
    {
      "t": "code",
      "file": "raw_image_message.py",
      "run": "mock",
      "code": {
        "zh": "from llm import client, MODEL\n\n# 一张 2×2 像素的红色 PNG，已经是 base64 文本（网页里没有图片文件可读）\nTINY_PNG = \"iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR42mO8o6HBwMDAxMDAwMDAAAAO7gEwnuiAAQAAAABJRU5ErkJggg==\"\ndata_url = \"data:image/png;base64,\" + TINY_PNG\n\nmessages = [{\n    \"role\": \"user\",\n    \"content\": [\n        {\"type\": \"text\", \"text\": \"这张图片是什么颜色？\"},\n        {\"type\": \"image_url\", \"image_url\": {\"url\": data_url}},\n    ],\n}]\nr = client.chat.completions.create(model=MODEL, messages=messages)\nprint(r.choices[0].message.content)\nprint(\"content 一共有\", len(messages[0][\"content\"]), \"个部分\")",
        "en": "from llm import client, MODEL\n\n# a 2x2-pixel red PNG, already base64 text (there is no image file to read in the browser)\nTINY_PNG = \"iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR42mO8o6HBwMDAxMDAwMDAAAAO7gEwnuiAAQAAAABJRU5ErkJggg==\"\ndata_url = \"data:image/png;base64,\" + TINY_PNG\n\nmessages = [{\n    \"role\": \"user\",\n    \"content\": [\n        {\"type\": \"text\", \"text\": \"What colour is this image?\"},\n        {\"type\": \"image_url\", \"image_url\": {\"url\": data_url}},\n    ],\n}]\nr = client.chat.completions.create(model=MODEL, messages=messages)\nprint(r.choices[0].message.content)\nprint(\"parts in content:\", len(messages[0][\"content\"]))"
      }
    },
    {
      "t": "warn",
      "zh": "- base64 会让数据变大约 1/3。手机拍的大照片最好先缩小再发，服务商对图片大小有限制。\n- 图片也按 token 计费。用 `to_input_list()` 继续聊天时，图片**一直留在历史里，每轮都重新发送一次**，聊得久了费用会明显增加；可以用第三部分的方法把旧图片从历史里去掉。",
      "en": "- base64 makes the data about a third larger. Shrink big phone photos before sending; providers limit image size.\n- Images cost tokens too. When you keep chatting with `to_input_list()`, the image **stays in the history and is resent every turn**, so long chats get noticeably more expensive; use the techniques from part 3 to drop old images from the history."
    },
    {
      "t": "check",
      "q": {
        "zh": "框架能把音频传给模型，但你用的模型只认文字和图片。会怎样？",
        "en": "The framework can pass audio to the model, but your model only understands text and images. What happens?"
      },
      "options": [
        {
          "zh": "框架会自动把音频转成文字",
          "en": "The framework turns the audio into text automatically"
        },
        {
          "zh": "没问题，框架支持就够了",
          "en": "Fine – framework support is enough"
        },
        {
          "zh": "用不了：模型那一边也必须支持，否则要先自己转换格式",
          "en": "It won't work: the model must support it too, or you convert the format yourself first"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "框架是框架，模型是模型。两边都支持才行；不支持的格式，先在代码里转换成两边都支持的（例如 PDF → 图片）。",
        "en": "The framework and the model are separate. Both must support a format; otherwise convert it in your code into one both support (e.g. PDF → images)."
      }
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "视频里先单独问「1+1 等于几」，再单独问「再加一呢」，第二个回答对不上。根本原因是？",
        "en": "In the video, “What is 1+1?” and then, separately, “And plus one more?” – the second answer makes no sense. Why?"
      },
      "options": [
        {
          "zh": "模型数学不好",
          "en": "The model is bad at maths"
        },
        {
          "zh": "第二次运行只发送了 instructions 和「再加一呢」，没有上一轮的内容",
          "en": "The second run sends only the instructions and “And plus one more?”, nothing from the first run"
        },
        {
          "zh": "应该把 temperature 调低",
          "en": "The temperature should be lower"
        },
        {
          "zh": "`run_sync` 不支持中文",
          "en": "`run_sync` doesn't support Chinese"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "每次运行都是新对话。要接着聊，就要把上一轮的记录（`to_input_list()`）和新问题一起发过去。",
        "en": "Every run is a new conversation. To continue, send the previous record (`to_input_list()`) together with the new question."
      }
    },
    {
      "q": {
        "zh": "`result.to_input_list()` 返回的是什么？",
        "en": "What does `result.to_input_list()` return?"
      },
      "options": [
        {
          "zh": "只有模型最后的回答",
          "en": "Only the model's final answer"
        },
        {
          "zh": "包括 instructions 在内的全部消息",
          "en": "Every message, including the instructions"
        },
        {
          "zh": "这一轮的输入 + 运行中产生的全部内容（思考、回答、工具调用和结果），是一个普通列表",
          "en": "This run's input + everything the run produced (reasoning, answers, tool calls and results) as an ordinary list"
        },
        {
          "zh": "一个只能用 SDK 读取的特殊对象",
          "en": "A special object only the SDK can read"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "它是普通的 Python 列表（里面是字典），可以直接传回 `Runner.run_sync`，也可以自己加、删、保存。`instructions` 不在里面，Agent 每次运行会自动放在最前面。",
        "en": "It is an ordinary Python list of dicts: pass it back to `Runner.run_sync`, or add to it, trim it, save it. The `instructions` aren't in it; the agent adds them at the front on every run."
      }
    },
    {
      "q": {
        "zh": "按视频的写法，下面哪一段能正确地接着问「再加一呢？」",
        "en": "Following the video, which snippet correctly asks the follow-up “plus one more?”"
      },
      "options": [
        {
          "zh": "`history = result.to_input_list()`，`history.append({\"role\": \"user\", \"content\": \"再加一呢？\"})`，`Runner.run_sync(agent, history)`",
          "en": "`history = result.to_input_list()`, `history.append({\"role\": \"user\", \"content\": \"And plus one more?\"})`, `Runner.run_sync(agent, history)`"
        },
        {
          "zh": "`history = result.to_input_list().append({...})`，再 `Runner.run_sync(agent, history)`",
          "en": "`history = result.to_input_list().append({...})`, then `Runner.run_sync(agent, history)`"
        },
        {
          "zh": "`Runner.run_sync(agent, result.final_output + \"再加一呢？\")`",
          "en": "`Runner.run_sync(agent, result.final_output + \"And plus one more?\")`"
        },
        {
          "zh": "`history.append([{\"role\": \"user\", \"content\": \"再加一呢？\"}])`",
          "en": "`history.append([{\"role\": \"user\", \"content\": \"And plus one more?\"}])`"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "`append` 返回 `None`，所以第二个写法把 `history` 变成了 `None`；第三个只发了一段文字，丢掉了问题和对话结构；第四个多套了一层列表。",
        "en": "`append` returns `None`, so option 2 makes `history` None; option 3 sends one piece of text and loses the question and the structure; option 4 adds an extra layer of list."
      }
    },
    {
      "q": {
        "zh": "为什么本地图片要先转成 base64？",
        "en": "Why must a local image be converted to base64 first?"
      },
      "options": [
        {
          "zh": "base64 能压缩图片，更省钱",
          "en": "base64 compresses the image and saves money"
        },
        {
          "zh": "只有 PNG 图片需要这样做",
          "en": "Only PNG images need it"
        },
        {
          "zh": "Agents SDK 要求所有文字都用 base64",
          "en": "The Agents SDK requires all text in base64"
        },
        {
          "zh": "参数用 JSON 传递，JSON 里只能放文字，二进制要先编码成字符串",
          "en": "Parameters travel as JSON, which holds only text, so the binary data must become a string"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "base64 只是把字节变成可以放进 JSON 的文字，数据反而变大约 1/3。所有格式的本地图片都要这样处理。",
        "en": "base64 only turns bytes into text that fits in JSON – the data gets about a third larger. Local images of every format need it."
      }
    },
    {
      "q": {
        "zh": "视频里，图片那一条用户消息是怎么写的？",
        "en": "In the video, how is the image message written?"
      },
      "options": [
        {
          "zh": "`{\"role\": \"user\", \"content\": base64_image}`",
          "en": "`{\"role\": \"user\", \"content\": base64_image}`"
        },
        {
          "zh": "`{\"role\": \"user\", \"content\": [{\"type\": \"input_image\", \"image_url\": f\"data:image/png;base64,{base64_image}\"}]}`",
          "en": "`{\"role\": \"user\", \"content\": [{\"type\": \"input_image\", \"image_url\": f\"data:image/png;base64,{base64_image}\"}]}`"
        },
        {
          "zh": "`{\"role\": \"image\", \"content\": base64_image}`",
          "en": "`{\"role\": \"image\", \"content\": base64_image}`"
        },
        {
          "zh": "`{\"role\": \"user\", \"image\": \"data/l10_hello.png\"}`",
          "en": "`{\"role\": \"user\", \"image\": \"data/l10_hello.png\"}`"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "`content` 是一个列表，里面用 `input_image` 声明这是图片，`image_url` 填 data URL。直接放 base64 字符串，模型会把它当普通文字；没有 `image` 这种角色，也不能填本地路径。",
        "en": "`content` is a list whose `input_image` part declares an image, with the data URL in `image_url`. A bare base64 string is read as ordinary text; there is no `image` role, and a local path is useless."
      }
    },
    {
      "q": {
        "zh": "发过一张图片后，又用 `to_input_list()` 继续聊了 5 轮，这张图片会怎样？",
        "en": "After sending an image you chat 5 more turns with `to_input_list()`. What happens to the image?"
      },
      "options": [
        {
          "zh": "只发送一次，服务器会记住",
          "en": "It is sent once; the server remembers it"
        },
        {
          "zh": "SDK 会自动删除旧图片",
          "en": "The SDK deletes old images automatically"
        },
        {
          "zh": "自动变成一段文字描述",
          "en": "It turns into a text description automatically"
        },
        {
          "zh": "一直在历史里，每轮都重新发送，每轮都要为它付费",
          "en": "It stays in the history and is resent – and paid for – every turn"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "历史里的每一项每次都会完整发送，图片也不例外。长对话里可以把旧图片从列表里去掉。",
        "en": "Every item in the history is sent in full each time, images included. In long chats, remove old images from the list."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "带上历史接着问",
        "en": "Follow up with the history"
      },
      "code": {
        "zh": "result = Runner.[[run_sync]](agent, \"1+1等于几？\")\nhistory = result.[[to_input_list]]()\nhistory.[[append]]({\"[[role]]\": \"user\", \"content\": \"再加一呢？\"})\nresult = Runner.run_sync(agent, [[history]])\nprint(result.[[final_output]])",
        "en": "result = Runner.[[run_sync]](agent, \"What is 1+1?\")\nhistory = result.[[to_input_list]]()\nhistory.[[append]]({\"[[role]]\": \"user\", \"content\": \"And plus one more?\"})\nresult = Runner.run_sync(agent, [[history]])\nprint(result.[[final_output]])"
      },
      "explain": {
        "zh": "这一轮 → `to_input_list()` 列表 → `append` 新问题 → 整个列表交给下一次运行。",
        "en": "This run → the `to_input_list()` list → `append` the new question → pass the whole list to the next run."
      }
    },
    {
      "title": {
        "zh": "本地图片 → base64 → 发给 Agent",
        "en": "Local image → base64 → the agent"
      },
      "code": {
        "zh": "def encode_image(image_path):\n    with open(image_path, \"[[rb]]\") as image_file:\n        return base64.[[b64encode]](image_file.[[read]]()).[[decode]](\"utf-8\")\n\nbase64_image = encode_image(\"data/l10_hello.png\")\nmessages = [\n    {\"role\": \"user\", \"content\": [\n        {\"type\": \"[[input_image]]\", \"image_url\": f\"data:image/png;[[base64]],{base64_image}\"},\n    ]},\n    {\"role\": \"user\", \"content\": \"图片中是什么内容？\"},\n]\nresult = Runner.run_sync(agent, [[messages]])",
        "en": "def encode_image(image_path):\n    with open(image_path, \"[[rb]]\") as image_file:\n        return base64.[[b64encode]](image_file.[[read]]()).[[decode]](\"utf-8\")\n\nbase64_image = encode_image(\"data/l10_hello.png\")\nmessages = [\n    {\"role\": \"user\", \"content\": [\n        {\"type\": \"[[input_image]]\", \"image_url\": f\"data:image/png;[[base64]],{base64_image}\"},\n    ]},\n    {\"role\": \"user\", \"content\": \"What is in the picture?\"},\n]\nresult = Runner.run_sync(agent, [[messages]])"
      },
      "explain": {
        "zh": "二进制读取 → base64 编码 → `.decode` 成字符串 → 拼成 data URL 放进 `input_image`；问题单独放在第二条用户消息里。",
        "en": "Read as binary → base64-encode → `.decode` to a str → build the data URL inside `input_image`; the question goes in a second user message."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：连续对话（视频的例子）",
        "en": "Write it: a multi-turn conversation (the video's example)"
      },
      "task": {
        "zh": "在给好的开头后面写：\n1. 用 `Runner.run_sync` 问「1+1等于几？」，打印 `final_output`\n2. 用 `result.to_input_list()` 取出历史列表并打印\n3. 用 `append` 加上新问题「再加一呢？」（`role` 是 `user`）\n4. 把整个历史列表交给 `Runner.run_sync`，打印回答（应该是 3）\n\n这段代码需要 Agents SDK，不能在网页里运行。写完点「检查关键点」，再到本地对照 `practice/l10_multiturn_solution.py` 运行。",
        "en": "After the given header, write:\n1. ask “What is 1+1?” with `Runner.run_sync` and print `final_output`\n2. get the history list with `result.to_input_list()` and print it\n3. `append` the new question “And plus one more?” (`role` `user`)\n4. pass the whole history list to `Runner.run_sync` and print the answer (it should be 3)\n\nThis needs the Agents SDK and can't run in the browser. Use “Check key points”, then compare with `practice/l10_multiturn_solution.py` locally."
      },
      "starter": {
        "zh": "from agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nagent = Agent(\n    name=\"助手\",\n    instructions=\"你是一个简洁的中文助手，回答尽量简短。\",\n    model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),\n)\n\n# 1. 运行一次：问「1+1等于几？」，打印回答\n\n# 2. 用 to_input_list() 取出历史列表，打印出来\n\n# 3. 用 append 在历史末尾加上新问题「再加一呢？」（role 是 user）\n\n# 4. 把整个历史列表交给 Runner.run_sync，打印回答\n",
        "en": "from agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nagent = Agent(\n    name=\"assistant\",\n    instructions=\"You are a concise assistant. Keep answers short.\",\n    model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),\n)\n\n# 1. run once: ask \"What is 1+1?\" and print the answer\n\n# 2. get the history list with to_input_list() and print it\n\n# 3. append the new question \"And plus one more?\" (role user) to the history\n\n# 4. pass the whole history list to Runner.run_sync and print the answer\n"
      },
      "solution": {
        "zh": "from agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nagent = Agent(\n    name=\"助手\",\n    instructions=\"你是一个简洁的中文助手，回答尽量简短。\",\n    model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),\n)\n\nresult = Runner.run_sync(agent, \"1+1等于几？\")\nprint(result.final_output)\n\nhistory = result.to_input_list()\nprint(\"对话历史：\", history)\n\nhistory.append({\"role\": \"user\", \"content\": \"再加一呢？\"})\nresult = Runner.run_sync(agent, history)\nprint(result.final_output)",
        "en": "from agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nagent = Agent(\n    name=\"assistant\",\n    instructions=\"You are a concise assistant. Keep answers short.\",\n    model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),\n)\n\nresult = Runner.run_sync(agent, \"What is 1+1?\")\nprint(result.final_output)\n\nhistory = result.to_input_list()\nprint(\"history:\", history)\n\nhistory.append({\"role\": \"user\", \"content\": \"And plus one more?\"})\nresult = Runner.run_sync(agent, history)\nprint(result.final_output)"
      },
      "checks": [
        {
          "zh": "先用字符串运行一次 `Runner.run_sync(agent, \"...\")`",
          "en": "First run with a string: `Runner.run_sync(agent, \"...\")`",
          "re": "Runner\\.run_sync\\(\\s*\\w+\\s*,\\s*[\"']"
        },
        {
          "zh": "用 `to_input_list()` 取出历史",
          "en": "Gets the history with `to_input_list()`",
          "re": "\\w+\\s*=\\s*\\w+\\.to_input_list\\(\\)"
        },
        {
          "zh": "用 `append` 加上 role 为 user 的新消息",
          "en": "`append`s a new message with role user",
          "re": "\\.append\\(\\s*\\{\\s*[\"']role[\"']\\s*:\\s*[\"']user[\"']"
        },
        {
          "zh": "把历史列表交给 `Runner.run_sync`",
          "en": "Passes the history list to `Runner.run_sync`",
          "re": "Runner\\.run_sync\\(\\s*\\w+\\s*,\\s*[A-Za-z_]\\w*\\s*\\)"
        },
        {
          "zh": "打印 `final_output`",
          "en": "Prints `final_output`",
          "re": "print\\([^)]*\\.final_output"
        }
      ]
    },
    {
      "title": {
        "zh": "手写：让 Agent 看本地图片",
        "en": "Write it: show the agent a local image"
      },
      "task": {
        "zh": "1. 写函数 `encode_image(image_path)`：`open(..., \"rb\")` 读字节 → `base64.b64encode` → `.decode(\"utf-8\")`，返回字符串\n2. 编码 `data/l10_hello.png`；组成 `messages`：第一条用户消息的 `content` 是列表，里面一个 `input_image`（`image_url` 是 data URL），第二条用户消息是问题\n3. `Runner.run_sync(agent, messages)`，打印回答\n\n在 `practice` 文件夹里运行。写完点「检查关键点」，本地对照 `practice/l10_vision_solution.py`。",
        "en": "1. Write `encode_image(image_path)`: read bytes with `open(..., \"rb\")` → `base64.b64encode` → `.decode(\"utf-8\")`, return the str\n2. Encode `data/l10_hello.png`; build `messages`: user message 1 has a list `content` with one `input_image` part (`image_url` is the data URL), user message 2 is the question\n3. `Runner.run_sync(agent, messages)` and print the answer\n\nRun it from the `practice` folder. Use “Check key points”, then compare with `practice/l10_vision_solution.py` locally."
      },
      "starter": {
        "zh": "import base64\nfrom agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nagent = Agent(\n    name=\"看图助手\",\n    instructions=\"你是一个看图助手，用中文简洁地回答。\",\n    model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),\n)\n\n# 1. 写函数 encode_image(image_path)：二进制读文件 → base64 编码 → 转成字符串返回\n\n\n# 2. 编码 data/l10_hello.png；组成 messages：第一条用户消息放图片，第二条放问题\n\n\n# 3. 运行并打印回答\n",
        "en": "import base64\nfrom agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nagent = Agent(\n    name=\"vision_assistant\",\n    instructions=\"You describe images briefly.\",\n    model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),\n)\n\n# 1. write encode_image(image_path): read the file as binary -> base64-encode -> return a str\n\n\n# 2. encode data/l10_hello.png; build messages: user message 1 holds the image, message 2 the question\n\n\n# 3. run it and print the answer\n"
      },
      "solution": {
        "zh": "import base64\nfrom agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nagent = Agent(\n    name=\"看图助手\",\n    instructions=\"你是一个看图助手，用中文简洁地回答。\",\n    model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),\n)\n\ndef encode_image(image_path):\n    with open(image_path, \"rb\") as image_file:\n        return base64.b64encode(image_file.read()).decode(\"utf-8\")\n\nbase64_image = encode_image(\"data/l10_hello.png\")\nmessages = [\n    {\n        \"role\": \"user\",\n        \"content\": [\n            {\"type\": \"input_image\", \"image_url\": f\"data:image/png;base64,{base64_image}\"},\n        ],\n    },\n    {\"role\": \"user\", \"content\": \"图片中是什么内容？\"},\n]\nresult = Runner.run_sync(agent, messages)\nprint(result.final_output)",
        "en": "import base64\nfrom agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nagent = Agent(\n    name=\"vision_assistant\",\n    instructions=\"You describe images briefly.\",\n    model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),\n)\n\ndef encode_image(image_path):\n    with open(image_path, \"rb\") as image_file:\n        return base64.b64encode(image_file.read()).decode(\"utf-8\")\n\nbase64_image = encode_image(\"data/l10_hello.png\")\nmessages = [\n    {\n        \"role\": \"user\",\n        \"content\": [\n            {\"type\": \"input_image\", \"image_url\": f\"data:image/png;base64,{base64_image}\"},\n        ],\n    },\n    {\"role\": \"user\", \"content\": \"What is in the picture?\"},\n]\nresult = Runner.run_sync(agent, messages)\nprint(result.final_output)"
      },
      "checks": [
        {
          "zh": "定义了 `encode_image(image_path)`",
          "en": "Defines `encode_image(image_path)`",
          "re": "def\\s+encode_image\\s*\\(\\s*\\w+\\s*\\)\\s*:"
        },
        {
          "zh": "用 `open(..., \"rb\")` 按二进制读取",
          "en": "Reads in binary with `open(..., \"rb\")`",
          "re": "open\\([^)]*[\"']rb[\"']"
        },
        {
          "zh": "用 `base64.b64encode(...)` 编码",
          "en": "Encodes with `base64.b64encode(...)`",
          "re": "base64\\.b64encode\\("
        },
        {
          "zh": "用 `.decode(...)` 把 bytes 变成字符串",
          "en": "Turns bytes into a str with `.decode(...)`",
          "re": "\\.decode\\("
        },
        {
          "zh": "拼出 `data:image/...;base64,` 开头的 data URL",
          "en": "Builds a data URL starting with `data:image/...;base64,`",
          "re": "data:image/\\w+;base64,"
        },
        {
          "zh": "有 `input_image` 部分，并给了 `image_url`",
          "en": "Has an `input_image` part with `image_url`",
          "re": "[\"']type[\"']\\s*:\\s*[\"']input_image[\"'][\\s\\S]*?[\"']image_url[\"']\\s*:"
        },
        {
          "zh": "用 `Runner.run_sync` 运行并打印 `final_output`",
          "en": "Runs with `Runner.run_sync` and prints `final_output`",
          "re": "Runner\\.run_sync\\([\\s\\S]*\\.final_output"
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "以为 Agent 会自己记住上一轮，结果第二次 `Runner.run_sync` 什么都不知道。",
      "en": "Assuming the agent remembers the last turn – the second `Runner.run_sync` knows nothing."
    },
    {
      "zh": "写成 `history = result.to_input_list().append(...)`：`append` 返回 `None`，历史就没了。",
      "en": "Writing `history = result.to_input_list().append(...)`: `append` returns `None`, so the history is gone."
    },
    {
      "zh": "`append` 时又多套了一层列表：`history.append([{...}])`。",
      "en": "Adding an extra list layer: `history.append([{...}])`."
    },
    {
      "zh": "聊天循环里写 `history = history + result.to_input_list()`：旧历史被重复。",
      "en": "Writing `history = history + result.to_input_list()` in a chat loop: the old history is duplicated."
    },
    {
      "zh": "把 base64 字符串直接当普通文字发过去，没有 `input_image` 和 data URL，模型只看到一串字母。",
      "en": "Sending the base64 string as plain text without `input_image` and a data URL – the model just sees letters."
    },
    {
      "zh": "忘了 `.decode(\"utf-8\")`，data URL 里出现 `b'...'`；或者在 data URL 里加了空格。",
      "en": "Forgetting `.decode(\"utf-8\")` so the data URL contains `b'...'`, or putting spaces into the data URL."
    },
    {
      "zh": "只看框架支不支持某种文件，忘了确认模型能不能理解它。",
      "en": "Checking only whether the framework supports a file type and forgetting to check the model."
    }
  ],
  "recap": [
    {
      "zh": "每次 `Runner.run_sync` 都是新对话；「记得」就是把历史一起发过去。",
      "en": "Each `Runner.run_sync` is a fresh conversation; “remembering” means sending the history along."
    },
    {
      "zh": "`result.to_input_list()` 把这一轮变成普通列表；`append` 新问题后，把整个列表交给下一次运行。",
      "en": "`result.to_input_list()` turns a run into an ordinary list; `append` the new question and pass the whole list to the next run."
    },
    {
      "zh": "历史就是列表 + 字典，可以加、删、裁剪、保存；DeepSeek 的列表里还有 `reasoning` 项。",
      "en": "The history is a list of dicts you can add to, trim and save; with DeepSeek it also holds `reasoning` items."
    },
    {
      "zh": "多模态的能力来自模型：视频用谷歌模型，`deepseek-flash` 现在也能看图。",
      "en": "Multimodal ability comes from the model: the video uses a Google model; `deepseek-flash` can read images now too."
    },
    {
      "zh": "本地图片 → `open(..., \"rb\")` → `base64.b64encode` → `.decode(\"utf-8\")` → `data:image/png;base64,...` → `{\"type\": \"input_image\", \"image_url\": ...}`。",
      "en": "Local image → `open(..., \"rb\")` → `base64.b64encode` → `.decode(\"utf-8\")` → `data:image/png;base64,...` → `{\"type\": \"input_image\", \"image_url\": ...}`."
    },
    {
      "zh": "框架和模型都要支持；不支持的格式先转换（PDF → 图片）。",
      "en": "Both the framework and the model must support a format; convert unsupported ones first (PDF → images)."
    }
  ],
  "files": [
    {
      "path": "practice/l10_multiturn_todo.py",
      "zh": "练习：视频的「1+1 → 再加一」例子，用 `to_input_list()` + `append` 接着问（有 TODO 提示）。",
      "en": "Exercise: the video's “1+1 → plus one more” example, continued with `to_input_list()` + `append` (with TODO hints)."
    },
    {
      "path": "practice/l10_multiturn_solution.py",
      "zh": "参考答案；另有一个可选的终端聊天函数 `chat()`。",
      "en": "Solution, plus an optional terminal chat `chat()`."
    },
    {
      "path": "practice/l10_vision_todo.py",
      "zh": "练习：把本地图片编码成 data URL，让 Agent 看图并追问颜色（有 TODO 提示）。",
      "en": "Exercise: encode a local image as a data URL, let the agent read it and ask about the colours (with TODO hints)."
    },
    {
      "path": "practice/l10_vision_solution.py",
      "zh": "参考答案（已用 deepseek-flash 实测）。",
      "en": "Solution (tested with deepseek-flash)."
    },
    {
      "path": "practice/data/l10_hello.png",
      "zh": "练习用的图片：深灰底、白色的 Hello World，和视频里的截图类似。",
      "en": "The practice image: white “Hello World” on dark grey, like the video's screenshot."
    },
    {
      "path": "practice/data/l10_shapes.png",
      "zh": "另一张可以试的图片：红色圆形、蓝色正方形和一行英文。",
      "en": "Another image to try: a red circle, a blue square and a line of English text."
    }
  ]
});
