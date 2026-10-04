COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l06",
  "priority": "core",
  "handwrite": true,
  "studyMinutes": 55,
  "source": "subtitle",
  "summary": {
    "zh": "05 节的对话记录只会越来越长，而模型的上下文长度有硬性上限，而且是按 token 算的，不是按字数。这一节跟着视频：先用 DeepSeek 的分词器数出一句话、一整段对话有多少 token；再学两种管理短期记忆的办法——只保留最近几条的「滑动窗口」（别把 system 提示切掉）和让模型把旧对话写成摘要；最后了解长期记忆的两种做法：知识图谱和向量数据库。综合练习把这些放进一个会调用工具的终端聊天程序。",
    "en": "Lesson 05's conversation record only grows, while a model's context length has a hard limit – counted in tokens, not characters. Following the video, this lesson first counts the tokens in a sentence and in a whole conversation with DeepSeek's tokenizer, then covers two ways to manage short-term memory: a “sliding window” that keeps only the latest messages (without losing the system prompt) and letting the model summarise older turns. It ends with two approaches to long-term memory: knowledge graphs and vector databases. A hands-on section puts it all into a terminal chat that can call tools."
  },
  "goals": [
    {
      "zh": "说清楚上下文长度为什么按 token 算，用 `deepseek_tokenizer` 数出一句话和一整段对话的 token 数",
      "en": "Explain why context length is counted in tokens, and count the tokens in a sentence and a whole conversation with `deepseek_tokenizer`"
    },
    {
      "zh": "用切片写出滑动窗口，并保证 system 提示不会被切掉",
      "en": "Write a sliding window with a slice that never loses the system prompt"
    },
    {
      "zh": "用模型把旧对话总结成新的 system 提示，知道原来的设定该怎么处理",
      "en": "Have the model summarise older turns into a new system prompt, and know what to do with the original setup"
    },
    {
      "zh": "说出知识图谱和向量数据库做长期记忆的区别（存什么、成本、效果）",
      "en": "Contrast knowledge graphs and vector databases for long-term memory (what they store, cost, payoff)"
    },
    {
      "zh": "不看资料，独立手写保留 system 的滑动窗口，以及一个会管理记忆的终端聊天程序",
      "en": "Write, unaided, a sliding window that keeps the system prompt and a terminal chat that manages its memory"
    }
  ],
  "blocks": [
    {
      "t": "h",
      "zh": "一、为什么要管理记忆：上下文按 token 算",
      "en": "1. Why manage memory: context is counted in tokens"
    },
    {
      "t": "p",
      "zh": "[▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=1) 05 节的 `get_completion` 把每一句都存进 `message_history`，每次请求都全部发出去。给模型的上下文越多，它越了解前因后果，但不能无限往后加：费用越来越高、速度越来越慢；更硬的一条是**上下文长度**——模型一次能读的内容有上限，超过了，请求直接失败。所以对话记录（也就是短期记忆）要管理。\n\n[▶ 00:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=32) 上下文长度**不是按字数算的**。模型读文字之前先做**分词**：把文字切成一个个小片段，每个片段叫一个 **token**，再依次处理。长度限制和计费都按分词后的 token 数算。所以管理记忆的第一步，是能自己算出一段对话有多少 token。",
      "en": "[▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=1) Lesson 05's `get_completion` stores every line in `message_history` and sends all of it with each request. More context helps the model understand what's going on, but you can't keep appending forever: cost rises, speed drops, and the hardest limit is the **context length** – a model can only read so much at once, and beyond that the request fails. So the conversation record (short-term memory) has to be managed.\n\n[▶ 00:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=32) Context length is **not counted in characters**. Before reading text, a model **tokenizes** it: it cuts the text into small pieces called **tokens** and processes them one after another. Length limits and billing both count tokens. So the first step in managing memory is being able to count the tokens in a conversation yourself."
    },
    {
      "t": "check",
      "q": {
        "zh": "模型的上下文长度限制，是按什么来算的？",
        "en": "What is a model's context-length limit measured in?"
      },
      "options": [
        {
          "zh": "字符数（字数）",
          "en": "Characters"
        },
        {
          "zh": "消息的条数",
          "en": "Number of messages"
        },
        {
          "zh": "分词之后的 token 数",
          "en": "Tokens after tokenization"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "模型先分词再处理，限制和计费都按 token 数算，和字数不是一回事。",
        "en": "The model tokenizes first; limits and billing count tokens, which is not the same as characters."
      }
    },
    {
      "t": "h",
      "zh": "二、用 DeepSeek 的分词器数 token",
      "en": "2. Counting tokens with DeepSeek's tokenizer"
    },
    {
      "t": "p",
      "zh": "[▶ 01:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=95) 不同的模型训练方式和语料不同，分词规则也不同：有的会把常见的词、短语整个当成一个 token。所以要数得准，就用**你正在用的那个模型**的分词器。视频以 DeepSeek 为例 [▶ 02:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=127)：先用一条 pip 命令装好 DeepSeek 的分词器，再在代码里导入它，对一段文字做编码。\n\n这里用 PyPI 上的 `deepseek_tokenizer` 包（社区开发者打包的，不是 DeepSeek 官方发布）：纯 Python、不依赖别的包，自带 deepseek-flash 所属的 DeepSeek V4 系列分词器。课程的 `.venv` 里默认没有它，在终端里安装一次：",
      "en": "[▶ 01:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=95) Models are trained differently on different data, so their tokenization rules differ too: some treat common words or phrases as a single token. To count accurately, use the tokenizer of **the model you are actually using**. The video uses DeepSeek [▶ 02:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=127): install DeepSeek's tokenizer with one pip command, then import it in code and encode a piece of text.\n\nHere we use the `deepseek_tokenizer` package from PyPI (packaged by a community developer, not an official DeepSeek release): pure Python with no dependencies, bundling the tokenizer of the DeepSeek V4 family that deepseek-flash belongs to. The course `.venv` doesn't include it by default, so install it once in a terminal:"
    },
    {
      "t": "code",
      "lang": "powershell",
      "file": "PowerShell",
      "code": "& ..\\.venv\\Scripts\\python.exe -m pip install deepseek_tokenizer"
    },
    {
      "t": "code",
      "file": {
        "zh": "数 token（本地运行）",
        "en": "count tokens (run locally)"
      },
      "code": {
        "zh": "from deepseek_tokenizer import ds_token\n\nids = ds_token.encode(\"你是谁？\")\nprint(ids)           # [122294, 1148]：每个数字是一个 token 的编号\nprint(len(ids))      # 2：列表有多长，就是多少个 token\n\nfor i in ids:        # 看看每个 token 对应哪段文字\n    print(i, \"->\", ds_token.decode([i]))   # 122294 -> 你是谁，1148 -> ？",
        "en": "from deepseek_tokenizer import ds_token\n\nids = ds_token.encode(\"你是谁？\")      # \"Who are you?\" in Chinese\nprint(ids)           # [122294, 1148]: each number is a token's id\nprint(len(ids))      # 2: the length of the list is the token count\n\nfor i in ids:        # which text each token stands for\n    print(i, \"->\", ds_token.decode([i]))   # 122294 -> 你是谁, 1148 -> ？"
      },
      "note": {
        "zh": "网页里装不了这个分词器，这段要在本地运行，完整示例见 `practice/l06_tokens.py`。",
        "en": "The tokenizer isn't available in the browser, so run this locally; the full example is `practice/l06_tokens.py`."
      }
    },
    {
      "t": "video",
      "zh": "[▶ 03:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=190) 视频里编码的结果是一串很大的数字，老师提醒：这些是 token 的**编号**，不是数量，数量要看结果列表的长度。「你是谁？」是四个字符，却只有 2 个 token：DeepSeek 把「你是谁」整个当成一个 token，问号是另一个。[▶ 04:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=252) 老师由此建议：做中文场景，最好选对中文支持好的模型，它对中文的理解和分词都更好；对中文不擅长的模型，可能把这三个字切成三个 token。\n\n字幕没有念出安装命令里的包名。`deepseek_tokenizer` 的用法（导入、`encode`、看长度）和视频演示的一样，用它实测「你是谁？」同样是 2 个 token。",
      "en": "[▶ 03:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=190) In the video the encoded result is a list of large numbers, and the instructor points out that these are token **ids**, not a count – the count is the length of the list. “你是谁？” (“Who are you?”) is four characters but only 2 tokens: DeepSeek treats “你是谁” as one token and the question mark as another. [▶ 04:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=252) His advice: for Chinese use cases, pick a model with good Chinese support – it understands and tokenizes Chinese better, while a model weak in Chinese might cut those three characters into three tokens.\n\nThe subtitles don't say the package name in the install command. `deepseek_tokenizer` works the way the video shows (import, `encode`, take the length), and with it “你是谁？” is also 2 tokens."
    },
    {
      "t": "py",
      "title": {
        "zh": "列表 list：append、len、下标",
        "en": "Lists: append, len, indexing"
      },
      "zh": "`encode` 返回的、对话记录本身，都是**列表**：按顺序存放多个值的容器，写在方括号里。这一节用到的操作：\n- `xs.append(x)`：把 `x` 加到列表**末尾**\n- `len(xs)`：列表里有几项\n- `xs[0]`：第一项（下标从 0 开始）；`xs[-1]`：最后一项\n\n`append` 会**直接修改**原来的列表，它本身返回 `None`，所以不要写成 `xs = xs.append(x)`。",
      "en": "What `encode` returns, and the conversation record itself, are **lists**: containers holding values in order, written in square brackets. This lesson needs:\n- `xs.append(x)` adds `x` to the **end**\n- `len(xs)` is the number of items\n- `xs[0]` is the first item (indexes start at 0); `xs[-1]` is the last\n\n`append` **changes the list in place** and returns `None`, so never write `xs = xs.append(x)`.",
      "code": {
        "zh": "ids = [122294, 1148]           # 「你是谁？」编码后的 token 编号\nprint(len(ids))                # 2：有几个 token\nprint(ids[0], ids[-1])         # 第一个和最后一个编号\n\nhistory = []\nhistory.append({\"role\": \"system\", \"content\": \"回答尽量简短。\"})\nhistory.append({\"role\": \"user\", \"content\": \"你是谁？\"})\nprint(len(history))            # 2 条消息\nprint(history[0][\"role\"])      # system：第一条是谁说的\nprint(history[-1][\"content\"])  # 最后一条的内容\n\nwrong = history.append({\"role\": \"user\", \"content\": \"再见\"})\nprint(wrong)                   # None：append 没有返回值\nprint(len(history))            # 3：但列表确实变长了",
        "en": "ids = [122294, 1148]           # token ids of \"你是谁？\"\nprint(len(ids))                # 2: how many tokens\nprint(ids[0], ids[-1])         # the first and the last id\n\nhistory = []\nhistory.append({\"role\": \"system\", \"content\": \"Keep answers short.\"})\nhistory.append({\"role\": \"user\", \"content\": \"Who are you?\"})\nprint(len(history))            # 2 messages\nprint(history[0][\"role\"])      # system: who sent the first one\nprint(history[-1][\"content\"])  # content of the last one\n\nwrong = history.append({\"role\": \"user\", \"content\": \"Bye\"})\nprint(wrong)                   # None: append returns nothing\nprint(len(history))            # 3: but the list did grow"
      }
    },
    {
      "t": "note",
      "zh": "补充：服务器也会告诉你用了多少 token，就是 04 节的 `usage.prompt_tokens`。但它要等请求发出去才知道，而且会比你自己数的多一些：每条消息还有角色标记之类的格式 token（`practice/l06_tokens.py` 关掉思考时实测：两条消息自己数是 42 个，服务器算的是 47 个）。自己数的好处是**发送之前**就能判断会不会超限；要卡得很准时，给上限留一点余量。",
      "en": "Extra: the server also reports token usage – lesson 04's `usage.prompt_tokens`. But you only learn it after sending, and it's a bit higher than your own count because each message adds formatting tokens such as role markers (measured with `practice/l06_tokens.py`, thinking off: 42 tokens counted locally for two messages, 47 reported by the server). Counting yourself tells you **before sending** whether you'll go over; if you cut it fine, leave some headroom below the limit."
    },
    {
      "t": "h",
      "zh": "三、数一整段对话有多少 token",
      "en": "3. Counting the tokens in a whole conversation"
    },
    {
      "t": "p",
      "zh": "[▶ 05:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=315) 发给模型的是一串消息（每条是一个字典），模型的回复也可以看成一条消息，对话记录就是这样一个列表。要知道整段对话有多少 token，就写一个函数 [▶ 05:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=346)：遍历列表里的每一条消息，取出内容，分词后数长度，全部加起来。",
      "en": "[▶ 05:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=315) What you send is a list of messages (each one a dict), and the model's reply can be seen as one more message – the conversation record is such a list. To get the token count of a whole conversation, write a function [▶ 05:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=346): go through every message, take its content, tokenize it, count, and add everything up."
    },
    {
      "t": "code",
      "file": {
        "zh": "count_tokens.py（本地运行）",
        "en": "count_tokens.py (run locally)"
      },
      "code": {
        "zh": "from deepseek_tokenizer import ds_token\n\ndef count_tokens(messages):\n    total = 0\n    for m in messages:\n        text = m.get(\"content\") or \"\"      # 带 tool_calls 的回复，content 可能是 None\n        total += len(ds_token.encode(text))\n    return total\n\nhistory = [\n    {\"role\": \"system\", \"content\": \"你是一个专业的旅行助手，回答要简洁，每次不超过三句话。\"},\n    {\"role\": \"user\", \"content\": \"我下个月想去杭州玩三天，请帮我推荐一下必去的景点和当地美食，再告诉我大概要准备多少预算。\"},\n]\n\nchars = 0\nfor m in history:\n    chars += len(m[\"content\"])\nprint(\"字数：\", chars)                      # 71\nprint(\"token 数：\", count_tokens(history))  # 42",
        "en": "from deepseek_tokenizer import ds_token\n\ndef count_tokens(messages):\n    total = 0\n    for m in messages:\n        text = m.get(\"content\") or \"\"      # a reply with tool_calls may have content None\n        total += len(ds_token.encode(text))\n    return total\n\nhistory = [\n    {\"role\": \"system\", \"content\": \"你是一个专业的旅行助手，回答要简洁，每次不超过三句话。\"},\n    {\"role\": \"user\", \"content\": \"我下个月想去杭州玩三天，请帮我推荐一下必去的景点和当地美食，再告诉我大概要准备多少预算。\"},\n]   # a travel-assistant system prompt and a question about a 3-day trip to Hangzhou\n\nchars = 0\nfor m in history:\n    chars += len(m[\"content\"])\nprint(\"characters:\", chars)              # 71\nprint(\"tokens:\", count_tokens(history))  # 42"
      },
      "note": {
        "zh": "`total += x` 是 `total = total + x` 的简写。`m.get(\"content\") or \"\"`：内容是 None 时换成空字符串，`encode` 才不会报错（`or` 的用法见 05 节）。",
        "en": "`total += x` is short for `total = total + x`. `m.get(\"content\") or \"\"` swaps None for an empty string so `encode` doesn't fail (`or` is covered in lesson 05)."
      }
    },
    {
      "t": "video",
      "zh": "[▶ 06:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=408) 视频的例子也是一条 system 提示加一条用户提问：直接数字数是 139，按 DeepSeek 分词只有 81 个 token。老师借此说明：假如上限是 100，按字数算会以为超了、请求会失败，其实按 token 算并没有超。[▶ 07:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=472) 所以每次发送对话记录之前先算一下：没超就照常发；超了，再用下面的办法调整，避免请求失败。",
      "en": "[▶ 06:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=408) The video's example is also a system prompt plus one user question: 139 characters, but only 81 tokens with DeepSeek's tokenizer. The instructor's point: if the limit were 100, counting characters would make you think you're over and the request would fail, when in tokens you're actually under. [▶ 07:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=472) So count before sending the record: if it's under, send as usual; if it's over, adjust it with the methods below so the request doesn't fail."
    },
    {
      "t": "py",
      "title": {
        "zh": "列表推导式：一行生成新列表",
        "en": "List comprehensions: a new list in one line"
      },
      "zh": "`[表达式 for 变量 in 列表]` 叫**列表推导式**：遍历列表，对每一项算出一个值，收集成一个新列表。后面还能加 `if` 条件，只收集满足条件的项：`[m for m in history if m[\"role\"] != \"system\"]`。\n\n它和「先建空列表，再用 for + append」完全等价，只是更短。配合 `sum(...)`（把列表里的数字加起来），`count_tokens` 可以写成一行：\n`sum([len(ds_token.encode(m[\"content\"])) for m in messages])`\n\n网页里没有分词器，下面先用字数演示写法。",
      "en": "`[expression for item in a_list]` is a **list comprehension**: it walks the list, computes a value for each item and collects them into a new list. An `if` can follow to keep only matching items: `[m for m in history if m[\"role\"] != \"system\"]`.\n\nIt is exactly “an empty list plus for and append”, just shorter. With `sum(...)` (adds up a list of numbers), `count_tokens` fits in one line:\n`sum([len(ds_token.encode(m[\"content\"])) for m in messages])`\n\nThere's no tokenizer in the browser, so the demo below uses character counts to show the pattern.",
      "code": {
        "zh": "history = [\n    {\"role\": \"system\", \"content\": \"回答尽量简短。\"},\n    {\"role\": \"user\", \"content\": \"你是谁？\"},\n    {\"role\": \"assistant\", \"content\": \"我是你的助手。\"},\n]\n\n# 先建空列表，再 for + append\nlengths = []\nfor m in history:\n    lengths.append(len(m[\"content\"]))\nprint(lengths)                                        # [7, 4, 7]\n\n# 列表推导式：同样的结果，一行写完\nprint([len(m[\"content\"]) for m in history])           # [7, 4, 7]\nprint(sum([len(m[\"content\"]) for m in history]))      # 18\n\n# 加 if：只要不是 system 的消息\nprint([m[\"role\"] for m in history if m[\"role\"] != \"system\"])   # ['user', 'assistant']",
        "en": "history = [\n    {\"role\": \"system\", \"content\": \"Keep answers short.\"},\n    {\"role\": \"user\", \"content\": \"Who are you?\"},\n    {\"role\": \"assistant\", \"content\": \"Your assistant.\"},\n]\n\n# an empty list, then for + append\nlengths = []\nfor m in history:\n    lengths.append(len(m[\"content\"]))\nprint(lengths)                                        # [19, 12, 15]\n\n# a list comprehension: same result in one line\nprint([len(m[\"content\"]) for m in history])           # [19, 12, 15]\nprint(sum([len(m[\"content\"]) for m in history]))      # 46\n\n# with if: only the messages that aren't system\nprint([m[\"role\"] for m in history if m[\"role\"] != \"system\"])   # ['user', 'assistant']"
      }
    },
    {
      "t": "py",
      "title": {
        "zh": "记录里每一条都要是字典：dict(...) 和 model_dump()",
        "en": "Every record entry must be a dict: dict(...) vs model_dump()"
      },
      "zh": "`count_tokens` 用 `m.get(\"content\")` 取内容，后面的切片、总结也都按字典来读，所以**记录里每一条都必须是字典**。如果像 05 节 `call_tool.py` 那样直接 `messages.append(msg)` 存进 SDK 的消息对象，`m[\"content\"]` 就会报 `TypeError: 'ChatCompletionMessage' object is not subscriptable`。\n\n把 SDK 消息转成字典有两种写法：\n- `dict(reply)`：只把**最外层**变成字典，里面的 `tool_calls` 仍然是对象。所以视频里写 `message['tool_calls'][0].id`：外层方括号，里层点号。\n- `reply.model_dump()`：**每一层**都变成字典，统一用方括号：`m['tool_calls'][0]['id']`。\n\n两种发给模型都没问题；要打印、保存或计数整份记录时，`model_dump()` 更省心。",
      "en": "`count_tokens` reads `m.get(\"content\")`, and trimming and summarising read the record as dicts too, so **every entry must be a dict**. If you store the SDK's message object directly with `messages.append(msg)`, as lesson 05's `call_tool.py` does, `m[\"content\"]` raises `TypeError: 'ChatCompletionMessage' object is not subscriptable`.\n\nTwo ways to turn an SDK message into a dict:\n- `dict(reply)` converts only the **outer layer**; `tool_calls` stays a list of objects. That's why the video writes `message['tool_calls'][0].id` – brackets outside, a dot inside.\n- `reply.model_dump()` converts **every layer**, so brackets all the way: `m['tool_calls'][0]['id']`.\n\nThe model accepts either; when you print, save or count the whole record, `model_dump()` is less hassle.",
      "run": "mock",
      "code": {
        "zh": "from llm import client, MODEL\nfrom weather_tool import tools\n\nr = client.chat.completions.create(\n    model=MODEL,\n    messages=[{\"role\": \"user\", \"content\": \"北京天气怎么样？\"}],\n    tools=tools,\n)\nreply = r.choices[0].message\n# reply[\"content\"]   # 会报 TypeError：SDK 对象不能用方括号取值\n\nshallow = dict(reply)\nprint(type(shallow[\"tool_calls\"][0]).__name__)   # 还是对象\nprint(shallow[\"tool_calls\"][0].id)\n\ndeep = reply.model_dump()\nprint(type(deep[\"tool_calls\"][0]).__name__)      # dict\nprint(deep[\"tool_calls\"][0][\"id\"])",
        "en": "from llm import client, MODEL\nfrom weather_tool import tools\n\nr = client.chat.completions.create(\n    model=MODEL,\n    messages=[{\"role\": \"user\", \"content\": \"What's the weather in Beijing?\"}],\n    tools=tools,\n)\nreply = r.choices[0].message\n# reply[\"content\"]   # TypeError: brackets don't work on the SDK object\n\nshallow = dict(reply)\nprint(type(shallow[\"tool_calls\"][0]).__name__)   # still an object\nprint(shallow[\"tool_calls\"][0].id)\n\ndeep = reply.model_dump()\nprint(type(deep[\"tool_calls\"][0]).__name__)      # dict\nprint(deep[\"tool_calls\"][0][\"id\"])"
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "上下文上限假设是 100。一段对话 139 个字，按 DeepSeek 分词是 81 个 token，会超限吗？",
        "en": "Suppose the context limit is 100. A conversation has 139 characters but 81 DeepSeek tokens. Is it over the limit?"
      },
      "options": [
        {
          "zh": "会，139 大于 100",
          "en": "Yes, 139 is more than 100"
        },
        {
          "zh": "不会，限制按 token 算，81 小于 100",
          "en": "No, the limit counts tokens, and 81 is under 100"
        },
        {
          "zh": "要看消息有几条",
          "en": "It depends on the number of messages"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "这是视频里的例子：按字数估算会误判。用对应模型的分词器数 token 才准。",
        "en": "That's the video's example: counting characters misleads you. Count tokens with the model's own tokenizer."
      }
    },
    {
      "t": "h",
      "zh": "四、方法一：滑动窗口",
      "en": "4. Method 1: the sliding window"
    },
    {
      "t": "p",
      "zh": "[▶ 08:24](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=504) 第一种办法叫**滑动窗口**：想象一个固定大小的窗口压在对话记录上，对话往后增长，窗口就跟着往右移。每次只把窗口里**最近的几条**发给模型，更早的先不管。窗口大小固定，发出去的长度就有了上限。\n\n窗口开多大？视频的思路是从大往小试 [▶ 09:57](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=597)：先取最近 10 条，算一下还超就改成 5 条，再超就 2 条、1 条；连 1 条都超，说明这一条消息本身就太长了。「取最近 k 条」用 Python 的切片一行就能写完。",
      "en": "[▶ 08:24](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=504) The first method is the **sliding window**: picture a window of fixed size over the record; as the conversation grows, the window slides right. Only the **latest few** messages inside the window go to the model, and older ones are left out. A fixed window size puts a ceiling on what you send.\n\nHow big should the window be? The video tries from large to small [▶ 09:57](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=597): take the latest 10, count, and if it's still over try 5, then 2, then 1; if even one message is too long, that message itself is the problem. “The latest k messages” is one line with a Python slice."
    },
    {
      "t": "py",
      "title": {
        "zh": "列表切片：取最后 k 项",
        "en": "List slicing: the last k items"
      },
      "zh": "[▶ 10:28](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=628) 视频里老师专门讲了这个写法。`xs[a:b]` 取下标 `a` 到 `b-1` 的部分，得到一个**新列表**，原列表不变：\n- 冒号左边不写表示从头开始，右边不写表示一直取到最后\n- 负数下标从末尾往回数：`xs[-2:]` 是最后 2 项，`xs[-k:]` 是最后 k 项\n- `xs[:1] + xs[-2:]`：第一项加最后 2 项，两个列表用 `+` 拼成新列表\n- k 比列表还长也不会报错，得到整个列表\n\n视频里老师一开始写死了 `-2`，随后改成用变量 k（写法类似 `-1*k`，效果和 `-k` 一样），这样窗口大小就成了可以调的参数。",
      "en": "[▶ 10:28](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=628) The instructor explains this one in the video. `xs[a:b]` takes indexes `a` to `b-1` as a **new list**, leaving the original alone:\n- leave out the left side to start from the beginning, the right side to go to the end\n- negative indexes count from the end: `xs[-2:]` is the last 2 items, `xs[-k:]` the last k\n- `xs[:1] + xs[-2:]` is the first item plus the last 2, joined into a new list with `+`\n- a k longer than the list is fine – you get the whole list\n\nThe instructor first hard-codes `-2`, then switches to a variable k (written along the lines of `-1*k`, which equals `-k`), turning the window size into a parameter you can tune.",
      "code": {
        "zh": "xs = [\"a\", \"b\", \"c\", \"d\", \"e\"]\nprint(xs[1:3])          # ['b', 'c']：下标 1 到 2\nprint(xs[-2:])          # ['d', 'e']：最后 2 项\nk = 3\nprint(xs[-k:])          # ['c', 'd', 'e']：最后 k 项\nprint(xs[:1] + xs[-2:]) # ['a', 'd', 'e']：第一项 + 最后 2 项\nprint(xs[-10:])         # k 太大也不报错：整个列表\nprint(xs)               # 原列表没变",
        "en": "xs = [\"a\", \"b\", \"c\", \"d\", \"e\"]\nprint(xs[1:3])          # ['b', 'c']: indexes 1 to 2\nprint(xs[-2:])          # ['d', 'e']: the last 2\nk = 3\nprint(xs[-k:])          # ['c', 'd', 'e']: the last k\nprint(xs[:1] + xs[-2:]) # ['a', 'd', 'e']: first + last 2\nprint(xs[-10:])         # a big k is fine: the whole list\nprint(xs)               # the original is unchanged"
      }
    },
    {
      "t": "p",
      "zh": "[▶ 11:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=691) 视频的示例记录是这样的：一条 system 提示，两条内容一样的用户提问（问的是一个人数问题），最后两条做加法的提问。下面照这个结构编了一份记录（具体问题是我们自己写的），先只取最近 2 条：",
      "en": "[▶ 11:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=691) The video's sample record looks like this: a system prompt, two identical user questions (about how many people something involves), and finally two addition questions. The record below follows that shape (the exact questions are our own); first keep only the latest 2:"
    },
    {
      "t": "code",
      "file": "sliding_window.py",
      "run": true,
      "code": {
        "zh": "history = [\n    {\"role\": \"system\", \"content\": \"你是一个数学老师，回答尽量简短。\"},\n    {\"role\": \"user\", \"content\": \"一支篮球队上场几个人？\"},\n    {\"role\": \"user\", \"content\": \"一支篮球队上场几个人？\"},\n    {\"role\": \"user\", \"content\": \"1 + 1 等于几？\"},\n    {\"role\": \"user\", \"content\": \"2 + 3 等于几？\"},\n]\n\ndef sliding_window(messages, k):\n    return messages[-k:]          # 只留最近 k 条\n\nfor m in sliding_window(history, 2):\n    print(m[\"role\"], \"|\", m[\"content\"])\n# 只剩两条加法题——最前面的 system 设定也被切掉了！",
        "en": "history = [\n    {\"role\": \"system\", \"content\": \"You are a maths teacher. Keep answers short.\"},\n    {\"role\": \"user\", \"content\": \"How many basketball players per team are on court?\"},\n    {\"role\": \"user\", \"content\": \"How many basketball players per team are on court?\"},\n    {\"role\": \"user\", \"content\": \"What is 1 + 1?\"},\n    {\"role\": \"user\", \"content\": \"What is 2 + 3?\"},\n]\n\ndef sliding_window(messages, k):\n    return messages[-k:]          # keep only the latest k\n\nfor m in sliding_window(history, 2):\n    print(m[\"role\"], \"|\", m[\"content\"])\n# only the two sums are left - and the system prompt at the top was cut off too!"
      }
    },
    {
      "t": "h",
      "zh": "五、别把 system 提示切掉",
      "en": "5. Don't cut off the system prompt"
    },
    {
      "t": "p",
      "zh": "[▶ 12:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=753) 只取最近几条，有个容易忽略的地方：最前面的 system 消息也会被切掉。04 节讲过，system 是你给模型的设定；设定丢了，模型后面就不按它来了，聊着聊着风格突然就变了。\n\n视频的处理办法 [▶ 13:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=786)：切完以后看第一条是不是 system；如果不是，而原来的记录里第一条是 system，就把它补回最前面。这样不管对话多长，设定一直都在。下面是补上这一步的 `trim_history`：",
      "en": "[▶ 12:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=753) Keeping only the latest few has an easy-to-miss side effect: the system message at the top gets cut off too. As lesson 04 showed, the system message is your setup for the model; lose it and the model stops following it, so the style suddenly changes mid-conversation.\n\nThe video's fix [▶ 13:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=786): after cutting, check whether the first message is a system message; if not, and the original record started with one, put it back in front. That way the setup survives however long the chat gets. Here is `trim_history` with that step added:"
    },
    {
      "t": "code",
      "file": "trim_history.py",
      "run": true,
      "code": {
        "zh": "history = [\n    {\"role\": \"system\", \"content\": \"你是一个数学老师，回答尽量简短。\"},\n    {\"role\": \"user\", \"content\": \"一支篮球队上场几个人？\"},\n    {\"role\": \"user\", \"content\": \"一支篮球队上场几个人？\"},\n    {\"role\": \"user\", \"content\": \"1 + 1 等于几？\"},\n    {\"role\": \"user\", \"content\": \"2 + 3 等于几？\"},\n]\n\ndef trim_history(messages, k):\n    recent = messages[-k:]                       # 1. 只留最近 k 条\n    if recent[0][\"role\"] != \"system\" and messages[0][\"role\"] == \"system\":\n        recent = [messages[0]] + recent          # 2. system 被切掉了：补回最前面\n    return recent\n\nfor m in trim_history(history, 2):\n    print(m[\"role\"], \"|\", m[\"content\"])\n# system + 最近两条：设定保住了",
        "en": "history = [\n    {\"role\": \"system\", \"content\": \"You are a maths teacher. Keep answers short.\"},\n    {\"role\": \"user\", \"content\": \"How many basketball players per team are on court?\"},\n    {\"role\": \"user\", \"content\": \"How many basketball players per team are on court?\"},\n    {\"role\": \"user\", \"content\": \"What is 1 + 1?\"},\n    {\"role\": \"user\", \"content\": \"What is 2 + 3?\"},\n]\n\ndef trim_history(messages, k):\n    recent = messages[-k:]                       # 1. keep only the latest k\n    if recent[0][\"role\"] != \"system\" and messages[0][\"role\"] == \"system\":\n        recent = [messages[0]] + recent          # 2. system was cut off: put it back in front\n    return recent\n\nfor m in trim_history(history, 2):\n    print(m[\"role\"], \"|\", m[\"content\"])\n# system + the latest two: the setup survives"
      }
    },
    {
      "t": "p",
      "zh": "再把「从大往小试」也写出来。网页里没有分词器，`count_tokens` 先用字数代替，只为演示流程；本地把它换成上一部分用 `ds_token` 的版本即可：",
      "en": "Now the “try from large to small” part. There's no tokenizer in the browser, so `count_tokens` uses character counts here just to show the flow; locally, swap in the `ds_token` version from part 3:"
    },
    {
      "t": "code",
      "file": "fit_window.py",
      "run": true,
      "code": {
        "zh": "history = [\n    {\"role\": \"system\", \"content\": \"你是一个数学老师，回答尽量简短。\"},\n    {\"role\": \"user\", \"content\": \"一支篮球队上场几个人？\"},\n    {\"role\": \"user\", \"content\": \"一支篮球队上场几个人？\"},\n    {\"role\": \"user\", \"content\": \"1 + 1 等于几？\"},\n    {\"role\": \"user\", \"content\": \"2 + 3 等于几？\"},\n]\n\ndef trim_history(messages, k):\n    recent = messages[-k:]                       # 1. 只留最近 k 条\n    if recent[0][\"role\"] != \"system\" and messages[0][\"role\"] == \"system\":\n        recent = [messages[0]] + recent          # 2. system 被切掉了：补回最前面\n    return recent\n\ndef count_tokens(messages):\n    # 网页里装不了分词器，先用字数代替；本地换成 len(ds_token.encode(...))\n    return sum([len(m[\"content\"]) for m in messages])\n\nLIMIT = 40\nprint(\"全部：\", count_tokens(history))\nfor k in [10, 5, 2, 1]:\n    window = trim_history(history, k)\n    print(f\"k={k}：{count_tokens(window)}\")\n    if count_tokens(window) <= LIMIT:\n        break                     # 够短了就停下（break 在第八部分细讲）\nprint(\"最后发送\", len(window), \"条消息\")",
        "en": "history = [\n    {\"role\": \"system\", \"content\": \"You are a maths teacher. Keep answers short.\"},\n    {\"role\": \"user\", \"content\": \"How many basketball players per team are on court?\"},\n    {\"role\": \"user\", \"content\": \"How many basketball players per team are on court?\"},\n    {\"role\": \"user\", \"content\": \"What is 1 + 1?\"},\n    {\"role\": \"user\", \"content\": \"What is 2 + 3?\"},\n]\n\ndef trim_history(messages, k):\n    recent = messages[-k:]                       # 1. keep only the latest k\n    if recent[0][\"role\"] != \"system\" and messages[0][\"role\"] == \"system\":\n        recent = [messages[0]] + recent          # 2. system was cut off: put it back in front\n    return recent\n\ndef count_tokens(messages):\n    # no tokenizer in the browser, so count characters; locally use len(ds_token.encode(...))\n    return sum([len(m[\"content\"]) for m in messages])\n\nLIMIT = 120\nprint(\"everything:\", count_tokens(history))\nfor k in [10, 5, 2, 1]:\n    window = trim_history(history, k)\n    print(f\"k={k}: {count_tokens(window)}\")\n    if count_tokens(window) <= LIMIT:\n        break                     # short enough: stop (break is covered in part 8)\nprint(\"sending\", len(window), \"messages\")"
      }
    },
    {
      "t": "note",
      "zh": "补充：如果记录里有工具调用，切的时候还要注意一点——窗口不能以 tool 消息开头。tool 消息必须跟在那条带 `tool_calls` 的 assistant 消息后面（05 节）；如果 assistant 那条被切掉、它的 tool 结果却留下了，接口会报 400。所以真正用的 `trim_history` 会把开头的 tool 消息也去掉，见第八部分的聊天程序。",
      "en": "Extra: when the record contains tool calls, one more rule applies – the window must not start with a tool message. A tool message has to follow the assistant message with `tool_calls` (lesson 05); if that assistant message is cut off while its tool results stay, the API returns 400. So the `trim_history` used for real also drops leading tool messages – see the chat program in part 8."
    },
    {
      "t": "h",
      "zh": "六、方法二：让模型写摘要",
      "en": "6. Method 2: let the model write a summary"
    },
    {
      "t": "p",
      "zh": "[▶ 15:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=943) 滑动窗口简单粗暴：旧的直接扔掉。可前面的内容有时还有用，扔了可惜，效果也可能变差。第二种办法是**摘要**：对话攒到一定长度，就调用一次模型，请它把之前的对话总结一下 [▶ 16:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=1004)。总结出来的精华留下，原来的消息就可以丢掉了；这段总结作为**新的 system 提示**，后面的对话接着往下聊。总结这种事模型很擅长，不用自己写规则。\n\n[▶ 17:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=1035) 会不会把原来的 system 提示覆盖掉？关键在于：总结的材料里**包括** system 提示，总结出来的内容就带着原来的设定（可能少些细节），可以直接替换。如果担心总结后的设定效果打折，也可以只总结普通对话，再把原来的 system 提示单独放回最前面 [▶ 18:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=1096)。",
      "en": "[▶ 15:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=943) The sliding window is crude: old messages are simply thrown away. But earlier content can still matter, and losing it may hurt the answers. The second method is a **summary**: once the conversation has grown long enough, call the model once and ask it to summarise what came before [▶ 16:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=1004). The gist stays, the original messages can go, and the summary becomes the **new system prompt** for the rest of the chat. Models are good at summarising; you don't need to write any rules.\n\n[▶ 17:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=1035) Won't that overwrite the original system prompt? The key is to **include** the system prompt in what gets summarised: the summary then carries the original setup (perhaps minus some detail) and can replace it. If you worry the summarised setup works less well, summarise only the ordinary turns and put the original system prompt back in front yourself [▶ 18:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=1096)."
    },
    {
      "t": "code",
      "file": "summary_memory.py",
      "run": "mock",
      "code": {
        "zh": "from llm import client, MODEL\n\nhistory = [\n    {\"role\": \"system\", \"content\": \"你是一个数学老师，回答尽量简短。\"},\n    {\"role\": \"user\", \"content\": \"一支篮球队上场几个人？\"},\n    {\"role\": \"assistant\", \"content\": \"5 个人。\"},\n    {\"role\": \"user\", \"content\": \"1 + 1 等于几？\"},\n    {\"role\": \"assistant\", \"content\": \"等于 2。\"},\n]\n\ndef summarize_history(messages):\n    text = \"\"\n    for m in messages:                       # 把整段对话（包括 system）拼成一段文字\n        text += f\"{m['role']}: {m['content']}\\n\"\n    response = client.chat.completions.create(\n        model=MODEL,\n        messages=[{\"role\": \"user\", \"content\": \"请总结下面这段对话，保留对助手的设定、用户问过的问题和关键结论：\\n\" + text}],\n    )\n    summary = response.choices[0].message.content\n    return [{\"role\": \"system\", \"content\": \"此前对话的总结如下：\\n\" + summary}]\n\nhistory = summarize_history(history)\nprint(len(history))              # 1：只剩一条 system 消息\nprint(history[0][\"content\"])\nhistory.append({\"role\": \"user\", \"content\": \"2 + 3 呢？\"})   # 之后照常往里加",
        "en": "from llm import client, MODEL\n\nhistory = [\n    {\"role\": \"system\", \"content\": \"You are a maths teacher. Keep answers short.\"},\n    {\"role\": \"user\", \"content\": \"How many basketball players per team are on court?\"},\n    {\"role\": \"assistant\", \"content\": \"Five.\"},\n    {\"role\": \"user\", \"content\": \"What is 1 + 1?\"},\n    {\"role\": \"assistant\", \"content\": \"2.\"},\n]\n\ndef summarize_history(messages):\n    text = \"\"\n    for m in messages:                       # the whole conversation (system included) as one text\n        text += f\"{m['role']}: {m['content']}\\n\"\n    response = client.chat.completions.create(\n        model=MODEL,\n        messages=[{\"role\": \"user\", \"content\": \"Summarise this conversation, keeping the assistant's setup, the user's questions and the key conclusions:\\n\" + text}],\n    )\n    summary = response.choices[0].message.content\n    return [{\"role\": \"system\", \"content\": \"Summary of the conversation so far:\\n\" + summary}]\n\nhistory = summarize_history(history)\nprint(len(history))              # 1: a single system message\nprint(history[0][\"content\"])\nhistory.append({\"role\": \"user\", \"content\": \"And 2 + 3?\"})   # carry on appending as usual"
      },
      "note": {
        "zh": "网页里的模拟模型不会真的总结，只会复述收到的话；本地用真实模型运行 `practice/l06_memory_solution.py`，能看到 DeepSeek 写出的摘要。`f\"{m['role']}: ...\"`：f-string 外面用双引号，里面取键就用单引号，免得引号打架。",
        "en": "The browser's mock model doesn't really summarise – it just echoes what it got; run `practice/l06_memory_solution.py` locally to see DeepSeek's summary. In `f\"{m['role']}: ...\"` the f-string uses double quotes outside and single quotes for the keys inside, so the quotes don't clash."
      }
    },
    {
      "t": "p",
      "zh": "[▶ 19:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=1160) 结果是一个干净的新列表，只有一条 system 消息，里面写着原来的设定和聊过的内容，之后照常往里追加新的提问和回答。旧消息虽然删掉了，模型仍然大致知道之前聊了什么，回答的内容和风格也能保持一致。\n\n[▶ 20:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=1221) 两种办法可以配合使用：对话还不太长时用滑动窗口；特别长了，就让模型总结一次。",
      "en": "[▶ 19:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=1160) The result is a clean new list holding one system message with the original setup and what was discussed; new questions and answers are appended to it as usual. The old messages are gone, yet the model still roughly knows what was said, and the content and style of its answers stay consistent.\n\n[▶ 20:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=1221) The two methods work together: use the sliding window while the conversation isn't too long, and have the model summarise once it gets really long."
    },
    {
      "t": "check",
      "q": {
        "zh": "用模型的总结替换掉整段记录、当作新的 system 提示之前，原来的 system 提示应该怎么处理？",
        "en": "Before replacing the whole record with the model's summary as the new system prompt, what should happen to the original system prompt?"
      },
      "options": [
        {
          "zh": "不用管，模型会自己记得",
          "en": "Nothing – the model remembers it anyway"
        },
        {
          "zh": "把它一起交给模型总结，或者总结完再单独放回最前面",
          "en": "Include it in what gets summarised, or put it back in front after summarising"
        },
        {
          "zh": "删掉，摘要里不需要设定",
          "en": "Delete it; a summary needs no setup"
        },
        {
          "zh": "放到列表最后面",
          "en": "Move it to the end of the list"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "模型接口没有记忆。设定要么被总结进新的 system 提示，要么原样保留，否则就丢了。",
        "en": "The API has no memory. The setup must either be summarised into the new system prompt or kept as is; otherwise it's lost."
      }
    },
    {
      "t": "h",
      "zh": "七、长期记忆：知识图谱和向量数据库（了解）",
      "en": "7. Long-term memory: knowledge graphs and vector databases (overview)"
    },
    {
      "t": "p",
      "zh": "[▶ 20:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=1253) 滑动窗口和摘要管的都是**短期记忆**：这一次对话里的内容。如果和用户已经聊了一两年、天南地北什么都聊过，这种在 `messages` 上剪剪补补的办法就不够用了，要用专门的数据库做**长期记忆**。视频介绍了两种 [▶ 21:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=1283)：\n\n| | 知识图谱 | 向量数据库 |\n|---|---|---|\n| 存什么 | 从对话里提取出的**实体**和实体之间的**关系**，存进图数据库 | 把对话内容转成**向量**（embedding）存起来 |\n| 怎么找回 | 在海量数据里快速检索，还能沿着关系找到相关的内容 | 按语义相似度检索：聊到汽车时，能找到以前聊过的某款车 |\n| 门槛和成本 | 高：判断有几个话题、提取实体和关系，都得反复大量调用模型，又慢又贵 | 低：对话记录直接存进去，甚至不用裁剪，就能搜 |\n| 效果 | 搭好以后效果好，高投入、高回报 | 简单够用，也是 RAG（知识库检索）的基础 |\n\n[▶ 24:27](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=1467) 老师的建议是先掌握知识库（RAG）这一块，它在智能体里马上就能用上。课程后面会用到：17 节 RAG，32 节长期记忆。",
      "en": "[▶ 20:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=1253) The sliding window and summaries both manage **short-term memory**: what's in the current conversation. Once you've talked with a user for a year or two about everything under the sun, trimming and patching `messages` no longer works; you need a dedicated database for **long-term memory**. The video covers two kinds [▶ 21:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=1283):\n\n| | Knowledge graph | Vector database |\n|---|---|---|\n| What's stored | **Entities** extracted from the conversation and the **relations** between them, in a graph database | The conversation content turned into **vectors** (embeddings) |\n| How it's found again | Fast retrieval over huge data, and related content can be reached through the relations | Search by semantic similarity: talking about cars brings up a model discussed long ago |\n| Entry cost | High: working out the topics and extracting entities and relations takes many model calls – slow and expensive | Low: drop the conversation in as is, no trimming needed, and search |\n| Payoff | Very good once built – high investment, high return | Simple and good enough; also the basis of RAG (knowledge-base retrieval) |\n\n[▶ 24:27](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=1467) The instructor's advice is to master knowledge bases (RAG) first, since agents can use them right away. Later in the course: lesson 17 covers RAG and lesson 32 long-term memory."
    },
    {
      "t": "check",
      "q": {
        "zh": "知识图谱和向量数据库相比，为什么门槛和成本更高？",
        "en": "Why does a knowledge graph cost more to set up than a vector database?"
      },
      "options": [
        {
          "zh": "图数据库必须花钱买",
          "en": "Graph databases must be bought"
        },
        {
          "zh": "它不能检索",
          "en": "It can't be searched"
        },
        {
          "zh": "要从对话里提取实体和关系，需要反复大量调用模型",
          "en": "Extracting entities and relations from conversations takes many model calls"
        },
        {
          "zh": "它只能存英文",
          "en": "It only stores English"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "提取这一步交给模型做，对话越多调用越多，又慢又贵；向量数据库把内容直接转成向量存进去就行。",
        "en": "The extraction is done by the model, so more conversation means more calls – slow and costly; a vector database just stores the content as vectors."
      }
    },
    {
      "t": "h",
      "zh": "八、综合练习：带记忆管理的终端聊天（视频之外）",
      "en": "8. Hands-on: a terminal chat that manages its memory (beyond the video)"
    },
    {
      "t": "note",
      "zh": "补充：视频这一集讲到长期记忆就结束了 [▶ 26:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=1565)，老师说接下来要用 Python 代码写一个推理执行的 Agent（[07 节](#/lesson/l07)）。下面先把 05 节的工具调用和本节的记忆管理拼成一个能在终端里一直聊下去的程序，顺便学 `while True` 循环和 `input()`。",
      "en": "Extra: the episode ends after long-term memory [▶ 26:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=7&t=1565), announcing a reasoning-and-acting agent written in Python next ([lesson 07](#/lesson/l07)). First, let's combine lesson 05's tool calling with this lesson's memory management into a program you can keep chatting with in the terminal, picking up `while True` loops and `input()` along the way."
    },
    {
      "t": "py",
      "title": {
        "zh": "while True、break、continue 和 input()",
        "en": "while True, break, continue and input()"
      },
      "zh": "聊天程序的骨架是一个**一直循环**的 `while True`：\n- `input(\"提示\")`：显示提示文字，等用户输入一行并按回车，返回输入的**字符串**\n- `break`：跳出整个循环，程序往下走（通常就结束了）\n- `continue`：跳过这一轮剩下的代码，直接开始下一轮\n\n下面用一个列表模拟用户的几次输入，看看 `break` 和 `continue` 的效果（`.strip()` 去掉首尾空格，字符串方法在 07 节细讲）：",
      "en": "A chat program is built on a loop that **runs forever**, `while True`:\n- `input(\"prompt\")` shows the prompt, waits for the user to type a line and press Enter, and returns it as a **string**\n- `break` leaves the loop entirely (usually ending the program)\n- `continue` skips the rest of this round and starts the next one\n\nHere a list stands in for what a user types, to show what `break` and `continue` do (`.strip()` removes surrounding spaces; string methods are covered in lesson 07):",
      "code": {
        "zh": "fake_inputs = [\"你好\", \"  \", \"/history\", \"天气\", \"/exit\", \"这句不会被处理\"]\ni = 0\n\nwhile True:\n    user_input = fake_inputs[i].strip()   # 真实程序里是 input(\"你：\").strip()\n    i += 1\n    if not user_input:          # 空输入：跳过\n        continue\n    if user_input == \"/exit\":   # 退出命令：跳出循环\n        break\n    if user_input == \"/history\":\n        print(\"（这里会打印记录）\")\n        continue\n    print(\"处理：\", user_input)\n\nprint(\"循环结束\")",
        "en": "fake_inputs = [\"hi\", \"  \", \"/history\", \"weather\", \"/exit\", \"never handled\"]\ni = 0\n\nwhile True:\n    user_input = fake_inputs[i].strip()   # in a real program: input(\"You: \").strip()\n    i += 1\n    if not user_input:          # empty input: skip\n        continue\n    if user_input == \"/exit\":   # exit command: leave the loop\n        break\n    if user_input == \"/history\":\n        print(\"(the record would be printed here)\")\n        continue\n    print(\"handling:\", user_input)\n\nprint(\"loop finished\")"
      }
    },
    {
      "t": "py",
      "title": {
        "zh": "函数里改外面的列表：append 可以，重新赋值不行",
        "en": "Changing an outer list in a function: append yes, reassignment no"
      },
      "zh": "05 节的 `get_completion` 在函数里 `message_history.append(...)`，不需要 `global`：`append` 是**往同一个列表里加东西**，没有让这个名字指向新的对象。\n\n裁剪记录就不一样了：`trim_history` 返回的是一个**新列表**。如果在函数里写 `history = trim_history(history, 10)`（**重新赋值**），Python 会把 `history` 当成函数自己的局部变量，外面的记录根本没变。两种改法：\n- `history[:] = trim_history(history, 10)`：把列表的**内容**整个换掉，还是原来那个列表（推荐）\n- 或者在函数开头写 `global history`",
      "en": "Lesson 05's `get_completion` calls `message_history.append(...)` inside the function without `global`: `append` **adds to the same list** and never makes the name point to a new object.\n\nTrimming is different: `trim_history` returns a **new list**. Writing `history = trim_history(history, 10)` inside a function (**reassignment**) makes Python treat `history` as the function's own local variable, so the outer record doesn't change at all. Two fixes:\n- `history[:] = trim_history(history, 10)` replaces the list's **contents** while keeping the same list (recommended)\n- or put `global history` at the top of the function",
      "code": {
        "zh": "history = [\"system\", \"a\", \"b\", \"c\"]\n\ndef trim_wrong():\n    history = [\"system\", \"c\"]      # 只创建了一个局部变量，外面的 history 没变\n\ndef trim_right():\n    history[:] = [\"system\", \"c\"]   # 原地替换内容：外面的 history 也变了\n\ntrim_wrong(); print(history)   # ['system', 'a', 'b', 'c']\ntrim_right(); print(history)   # ['system', 'c']",
        "en": "history = [\"system\", \"a\", \"b\", \"c\"]\n\ndef trim_wrong():\n    history = [\"system\", \"c\"]      # only creates a local variable; the outer history is untouched\n\ndef trim_right():\n    history[:] = [\"system\", \"c\"]   # replace the contents in place: the outer history changes\n\ntrim_wrong(); print(history)   # ['system', 'a', 'b', 'c']\ntrim_right(); print(history)   # ['system', 'c']"
      }
    },
    {
      "t": "p",
      "zh": "把学过的拼起来：`input()` 读一句 → 存进记录 → 用 `trim_history` 裁剪（保留 system，开头不留孤立的 tool 消息）→ 调用模型 → 模型要工具就执行，**全部**结果存好再问 → 打印回答 → 回到开头。在网页里点 ▶ 运行时，`input()` 会弹出输入框，输入 `/exit` 或点「取消」结束程序。",
      "en": "Put it together: `input()` reads a line → store it → trim with `trim_history` (keeping the system prompt, never starting with an orphaned tool message) → call the model → if it wants tools, run them and store **all** results before asking again → print the answer → back to the top. In the browser, ▶ Run turns `input()` into a dialog; type `/exit` or press Cancel to stop."
    },
    {
      "t": "code",
      "file": "chat.py",
      "run": "mock",
      "code": {
        "zh": "import json\nfrom llm import client, MODEL\nfrom weather_tool import get_weather, tools\n\nhistory = [{\"role\": \"system\", \"content\": \"你是一个乐于助人的助手，回答简洁。\"}]\n\ndef trim_history(messages, k):\n    recent = messages[-k:]\n    while recent and recent[0][\"role\"] == \"tool\":     # 开头不能是孤立的 tool 消息\n        recent = recent[1:]\n    if (not recent or recent[0][\"role\"] != \"system\") and messages[0][\"role\"] == \"system\":\n        recent = [messages[0]] + recent               # 补回 system\n    return recent\n\ndef ask_model():\n    \"\"\"把整个 history 发给模型，并把回答（字典）存进 history。\"\"\"\n    reply = client.chat.completions.create(model=MODEL, messages=history, tools=tools).choices[0].message\n    history.append(reply.model_dump())\n    return reply\n\nwhile True:\n    user_input = input(\"你：\").strip()\n    if not user_input:\n        continue\n    if user_input == \"/exit\":\n        break\n    history.append({\"role\": \"user\", \"content\": user_input})\n    history[:] = trim_history(history, 10)            # 只留 system + 最近 10 条\n    reply = ask_model()\n    while reply.tool_calls:                           # 模型可能连着要好几轮工具\n        for call in reply.tool_calls:                 # 一次可能要好几个：全部存好再问\n            args = json.loads(call.function.arguments)\n            print(\"  [调用工具]\", call.function.name, args)\n            history.append({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": str(get_weather(**args))})\n        reply = ask_model()\n    print(\"AI：\", reply.content)",
        "en": "import json\nfrom llm import client, MODEL\nfrom weather_tool import get_weather, tools\n\nhistory = [{\"role\": \"system\", \"content\": \"You are a helpful assistant. Be concise.\"}]\n\ndef trim_history(messages, k):\n    recent = messages[-k:]\n    while recent and recent[0][\"role\"] == \"tool\":     # never start with an orphaned tool message\n        recent = recent[1:]\n    if (not recent or recent[0][\"role\"] != \"system\") and messages[0][\"role\"] == \"system\":\n        recent = [messages[0]] + recent               # put the system prompt back\n    return recent\n\ndef ask_model():\n    \"\"\"Send the whole history and store the reply (as a dict) in it.\"\"\"\n    reply = client.chat.completions.create(model=MODEL, messages=history, tools=tools).choices[0].message\n    history.append(reply.model_dump())\n    return reply\n\nwhile True:\n    user_input = input(\"You: \").strip()\n    if not user_input:\n        continue\n    if user_input == \"/exit\":\n        break\n    history.append({\"role\": \"user\", \"content\": user_input})\n    history[:] = trim_history(history, 10)            # keep system + the latest 10\n    reply = ask_model()\n    while reply.tool_calls:                           # the model may want tools several rounds in a row\n        for call in reply.tool_calls:                 # maybe several at once: store them all, then ask\n            args = json.loads(call.function.arguments)\n            print(\"  [tool call]\", call.function.name, args)\n            history.append({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": str(get_weather(**args))})\n        reply = ask_model()\n    print(\"AI:\", reply.content)"
      },
      "note": {
        "zh": "和 05 节的 `get_completion` 比：这里「存提问」放在了函数外面，好在发送之前先 `trim_history`；`ask_model()` 只负责「发送整个记录 + 存回答」。只在刚存完用户提问时裁剪，记录的最后一条一定是这句提问，工具调用的往返不会被切断。\n\n本地完整版 `practice/l06_chat.py` 按 **token 数**（用 `ds_token`）而不是条数来裁剪，还有 `/history`、`/tokens`、`/clear` 命令。",
        "en": "Compared with lesson 05's `get_completion`: storing the question happens outside the function here, so the record can be trimmed with `trim_history` before sending; `ask_model()` only sends the whole record and stores the reply. Trimming right after the user's question is stored means the record ends with that question, so no tool-call round trip gets cut in half.\n\nThe full local version, `practice/l06_chat.py`, trims by **token count** (using `ds_token`) instead of message count, and adds `/history`, `/tokens` and `/clear` commands."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "模型一次请求了 2 个工具调用，正确的顺序是？",
        "en": "The model requested 2 tool calls at once. What is the right order?"
      },
      "options": [
        {
          "zh": "存第 1 个结果 → 调用模型 → 存第 2 个结果 → 调用模型",
          "en": "Store result 1 → call model → store result 2 → call model"
        },
        {
          "zh": "存第 1 个结果 → 存第 2 个结果 → 调用模型",
          "en": "Store result 1 → store result 2 → call model"
        },
        {
          "zh": "只存第 1 个结果就够了，模型会自己补上第 2 个",
          "en": "Storing result 1 is enough; the model fills in the second"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "带 `tool_calls` 的 assistant 消息后面，必须先跟上**每一个** `tool_call_id` 对应的 tool 消息，才能再次调用模型（05 节）。",
        "en": "After an assistant message with `tool_calls`, a tool message for **every** `tool_call_id` must follow before the next model call (lesson 05)."
      }
    },
    {
      "t": "tip",
      "zh": "清空记录（比如聊天程序的 `/clear` 命令）时，记得**保留 system 消息**，否则模型会丢掉你给它的设定：`history[:] = history[:1]`。",
      "en": "When clearing the record (say, a `/clear` command), **keep the system message**, or the model loses its setup: `history[:] = history[:1]`."
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "`ds_token.encode(\"你是谁？\")` 返回 `[122294, 1148]`，这说明什么？",
        "en": "`ds_token.encode(\"你是谁？\")` returns `[122294, 1148]`. What does that tell you?"
      },
      "options": [
        {
          "zh": "这句话有 2 个 token；数字是 token 的编号，数量要看列表长度",
          "en": "The sentence is 2 tokens; the numbers are token ids, and the count is the list's length"
        },
        {
          "zh": "这句话有 123442 个 token",
          "en": "The sentence is 123442 tokens"
        },
        {
          "zh": "这句话有 4 个 token，一个字一个",
          "en": "The sentence is 4 tokens, one per character"
        },
        {
          "zh": "分词失败了，应该返回文字",
          "en": "Tokenization failed; it should return text"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "视频专门提醒过：大数字是编号。DeepSeek 把「你是谁」当成一个 token，问号是另一个，所以 `len(...)` 是 2。",
        "en": "The video stresses this: the big numbers are ids. DeepSeek treats “你是谁” as one token and the question mark as another, so `len(...)` is 2."
      }
    },
    {
      "q": {
        "zh": "想准确知道一段对话会占用 deepseek-flash 多少上下文，最好的办法是？",
        "en": "What's the best way to know how much of deepseek-flash's context a conversation will use?"
      },
      "options": [
        {
          "zh": "用 `len()` 数字符串有几个字",
          "en": "Count characters with `len()`"
        },
        {
          "zh": "数消息有几条",
          "en": "Count the messages"
        },
        {
          "zh": "用任意一个模型的分词器都一样",
          "en": "Any model's tokenizer gives the same result"
        },
        {
          "zh": "用 DeepSeek 自己的分词器，对每条消息的内容分词再加起来",
          "en": "Use DeepSeek's own tokenizer on each message's content and add up the counts"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "不同模型的分词规则不同，用对应模型的分词器才准；字数和条数都不能代表 token 数。",
        "en": "Tokenization rules differ between models, so use the matching tokenizer; neither characters nor message counts equal tokens."
      }
    },
    {
      "q": {
        "zh": "记录是 `[system, user1, assistant1, user2]`，执行 `history[-2:]` 得到什么？问题出在哪？",
        "en": "The record is `[system, user1, assistant1, user2]`. What does `history[-2:]` give, and what's the problem?"
      },
      "options": [
        {
          "zh": "`[system, user1]`，丢了最新的提问",
          "en": "`[system, user1]` – the latest question is lost"
        },
        {
          "zh": "`[assistant1, user2]`，system 设定被切掉了，要补回最前面",
          "en": "`[assistant1, user2]` – the system prompt was cut off and must be put back in front"
        },
        {
          "zh": "`[user2]`，只剩一条",
          "en": "`[user2]` – only one is left"
        },
        {
          "zh": "报错，因为下标不能是负数",
          "en": "An error, because indexes can't be negative"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "`[-2:]` 是最后两项。滑动窗口要检查第一条是不是 system，不是就把原来的 system 补回去。",
        "en": "`[-2:]` is the last two items. A sliding window must check whether the first item is the system message and restore it if not."
      }
    },
    {
      "q": {
        "zh": "用模型做摘要来管理记忆，下面哪个说法是对的？",
        "en": "Which statement about summary memory is true?"
      },
      "options": [
        {
          "zh": "摘要会原样保留每一句话",
          "en": "The summary keeps every sentence word for word"
        },
        {
          "zh": "摘要只能放在列表最后",
          "en": "The summary can only go at the end of the list"
        },
        {
          "zh": "让模型总结旧对话，结果作为新的 system 提示；原来的设定要一起总结进去或单独保留",
          "en": "The model summarises the old turns and the result becomes the new system prompt; the original setup is summarised with them or kept separately"
        },
        {
          "zh": "做了摘要就不能再追加新消息",
          "en": "After summarising you can't append new messages"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "摘要会丢掉一些细节，但保留了要点；之后照常往新列表里追加消息。",
        "en": "A summary loses some detail but keeps the gist; afterwards you append to the new list as usual."
      }
    },
    {
      "q": {
        "zh": "滑动窗口和摘要，视频建议怎么搭配？",
        "en": "How does the video suggest combining the sliding window and summaries?"
      },
      "options": [
        {
          "zh": "对话还不太长时用滑动窗口，特别长了再让模型总结一次",
          "en": "Use the sliding window while the conversation isn't too long, and summarise once it gets really long"
        },
        {
          "zh": "只能二选一",
          "en": "Pick one; they can't be combined"
        },
        {
          "zh": "每说一句话都总结一次",
          "en": "Summarise after every message"
        },
        {
          "zh": "长期记忆也只用这两种就够了",
          "en": "These two also cover long-term memory"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "两者都管短期记忆，可以配合使用；跨越很长时间的长期记忆，要用知识图谱或向量数据库。",
        "en": "Both manage short-term memory and work together; long-term memory across months needs a knowledge graph or a vector database."
      }
    },
    {
      "q": {
        "zh": "裁剪带工具调用的记录时，下面哪种情况会让接口报错？",
        "en": "When trimming a record that contains tool calls, which situation makes the API fail?"
      },
      "options": [
        {
          "zh": "保留了最前面的 system 消息",
          "en": "Keeping the system message at the top"
        },
        {
          "zh": "最后一条是用户的提问",
          "en": "The last message is the user's question"
        },
        {
          "zh": "把旧对话总结成一段话",
          "en": "Summarising older turns into one paragraph"
        },
        {
          "zh": "窗口以 tool 消息开头，它前面那条带 tool_calls 的 assistant 消息被切掉了",
          "en": "The window starts with a tool message whose assistant message with tool_calls was cut off"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "孤立的 tool 消息找不到对应的调用，接口返回 400。裁剪时要把开头的 tool 消息也去掉。",
        "en": "An orphaned tool message has no matching call, so the API returns 400. Drop leading tool messages when trimming."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "数整段对话的 token",
        "en": "Count the tokens in a conversation"
      },
      "code": "from deepseek_tokenizer import [[ds_token]]\n\ndef count_tokens(messages):\n    total = 0\n    for m in [[messages]]:\n        text = m.get(\"content\") [[or]] \"\"\n        total += [[len]](ds_token.[[encode]](text))\n    [[return]] total",
      "explain": {
        "zh": "`encode` 返回 token 编号的列表，`len(...)` 才是数量；遍历每条消息累加起来。",
        "en": "`encode` returns a list of token ids and `len(...)` is the count; add it up over every message."
      }
    },
    {
      "title": {
        "zh": "保留 system 的滑动窗口",
        "en": "A sliding window that keeps the system prompt"
      },
      "code": "def trim_history(messages, k):\n    recent = messages[-[[k]]:]\n    if recent[0][\"role\"] != \"[[system]]\" and messages[0][\"role\"] == \"system\":\n        recent = [messages[0]] [[+]] recent\n    return [[recent]]",
      "explain": {
        "zh": "`messages[-k:]` 取最近 k 条；第一条不是 system 而原记录有 system，就用 `+` 把它拼回最前面。",
        "en": "`messages[-k:]` keeps the latest k; if the first isn't system but the record has one, join it back in front with `+`."
      }
    },
    {
      "title": {
        "zh": "让模型写摘要",
        "en": "Let the model write a summary"
      },
      "code": {
        "zh": "def summarize_history(messages):\n    text = \"\"\n    for m in messages:\n        text [[+=]] f\"{m['role']}: {m['content']}\\n\"\n    response = client.chat.completions.[[create]](\n        model=MODEL,\n        messages=[{\"role\": \"user\", \"content\": \"请总结下面这段对话：\\n\" + text}],\n    )\n    summary = response.choices[0].message.[[content]]\n    return [{\"role\": \"[[system]]\", \"content\": \"此前对话的总结如下：\\n\" + summary}]",
        "en": "def summarize_history(messages):\n    text = \"\"\n    for m in messages:\n        text [[+=]] f\"{m['role']}: {m['content']}\\n\"\n    response = client.chat.completions.[[create]](\n        model=MODEL,\n        messages=[{\"role\": \"user\", \"content\": \"Summarise this conversation:\\n\" + text}],\n    )\n    summary = response.choices[0].message.[[content]]\n    return [{\"role\": \"[[system]]\", \"content\": \"Summary of the conversation so far:\\n\" + summary}]"
      },
      "explain": {
        "zh": "把整段对话拼成文字交给模型总结，结果包成一条 system 消息，作为新的记录。",
        "en": "Turn the conversation into text, have the model summarise it, and wrap the result in one system message as the new record."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：保留 system 的滑动窗口",
        "en": "Write it: a sliding window that keeps the system prompt"
      },
      "task": {
        "zh": "不看上面的代码，写出视频里的滑动窗口 `trim_history(messages, k)`：\n1. 用切片取最近 `k` 条\n2. 如果取出来的第一条不是 system，而原记录的第一条是 system，就把它补回最前面\n3. 返回结果\n\n运行后应该打印 3 行：system 设定加上最近的两条。",
        "en": "Without looking above, write the video's sliding window `trim_history(messages, k)`:\n1. take the latest `k` messages with a slice\n2. if the first of them isn't a system message but the record's first one is, put it back in front\n3. return the result\n\nRunning it should print 3 lines: the system setup plus the latest two messages."
      },
      "run": true,
      "starter": {
        "zh": "history = [\n    {\"role\": \"system\", \"content\": \"你是一个数学老师，回答尽量简短。\"},\n    {\"role\": \"user\", \"content\": \"一支篮球队上场几个人？\"},\n    {\"role\": \"assistant\", \"content\": \"5 个人。\"},\n    {\"role\": \"user\", \"content\": \"1 + 1 等于几？\"},\n    {\"role\": \"assistant\", \"content\": \"等于 2。\"},\n    {\"role\": \"user\", \"content\": \"2 + 3 等于几？\"},\n]\n\n# 写 trim_history(messages, k)：只留最近 k 条；如果第一条不是 system、而原记录第一条是 system，就把它补回最前面\n\n\nfor m in trim_history(history, 2):\n    print(m[\"role\"], \"|\", m[\"content\"])",
        "en": "history = [\n    {\"role\": \"system\", \"content\": \"You are a maths teacher. Keep answers short.\"},\n    {\"role\": \"user\", \"content\": \"How many basketball players per team are on court?\"},\n    {\"role\": \"assistant\", \"content\": \"Five.\"},\n    {\"role\": \"user\", \"content\": \"What is 1 + 1?\"},\n    {\"role\": \"assistant\", \"content\": \"2.\"},\n    {\"role\": \"user\", \"content\": \"What is 2 + 3?\"},\n]\n\n# write trim_history(messages, k): keep the latest k; if the first isn't system but the record starts with one, put it back in front\n\n\nfor m in trim_history(history, 2):\n    print(m[\"role\"], \"|\", m[\"content\"])"
      },
      "solution": {
        "zh": "history = [\n    {\"role\": \"system\", \"content\": \"你是一个数学老师，回答尽量简短。\"},\n    {\"role\": \"user\", \"content\": \"一支篮球队上场几个人？\"},\n    {\"role\": \"assistant\", \"content\": \"5 个人。\"},\n    {\"role\": \"user\", \"content\": \"1 + 1 等于几？\"},\n    {\"role\": \"assistant\", \"content\": \"等于 2。\"},\n    {\"role\": \"user\", \"content\": \"2 + 3 等于几？\"},\n]\n\n# 写 trim_history(messages, k)：只留最近 k 条；如果第一条不是 system、而原记录第一条是 system，就把它补回最前面\ndef trim_history(messages, k):\n    recent = messages[-k:]                       # 1. 只留最近 k 条\n    if recent[0][\"role\"] != \"system\" and messages[0][\"role\"] == \"system\":\n        recent = [messages[0]] + recent          # 2. system 被切掉了：补回最前面\n    return recent\n\nfor m in trim_history(history, 2):\n    print(m[\"role\"], \"|\", m[\"content\"])",
        "en": "history = [\n    {\"role\": \"system\", \"content\": \"You are a maths teacher. Keep answers short.\"},\n    {\"role\": \"user\", \"content\": \"How many basketball players per team are on court?\"},\n    {\"role\": \"assistant\", \"content\": \"Five.\"},\n    {\"role\": \"user\", \"content\": \"What is 1 + 1?\"},\n    {\"role\": \"assistant\", \"content\": \"2.\"},\n    {\"role\": \"user\", \"content\": \"What is 2 + 3?\"},\n]\n\n# write trim_history(messages, k): keep the latest k; if the first isn't system but the record starts with one, put it back in front\ndef trim_history(messages, k):\n    recent = messages[-k:]                       # 1. keep only the latest k\n    if recent[0][\"role\"] != \"system\" and messages[0][\"role\"] == \"system\":\n        recent = [messages[0]] + recent          # 2. system was cut off: put it back in front\n    return recent\n\nfor m in trim_history(history, 2):\n    print(m[\"role\"], \"|\", m[\"content\"])"
      },
      "checks": [
        {
          "zh": "定义了 `trim_history(messages, k)`",
          "en": "Defines `trim_history(messages, k)`",
          "re": "def\\s+trim_history\\s*\\(\\s*\\w+\\s*,\\s*\\w+\\s*\\)\\s*:"
        },
        {
          "zh": "用切片 `[-k:]` 取最近 k 条",
          "en": "Takes the latest k with the slice `[-k:]`",
          "re": "\\w+\\[\\s*-\\s*(\\w+|1\\s*\\*\\s*\\w+)\\s*:\\s*\\]"
        },
        {
          "zh": "检查第一条的 role 是不是 system",
          "en": "Checks whether the first message's role is system",
          "re": "\\[0\\]\\[[\\\"']role[\\\"']\\]\\s*(!=|==)\\s*[\\\"']system[\\\"']"
        },
        {
          "zh": "把 system 补回最前面（列表 `+` 或 `insert(0, ...)`）",
          "en": "Puts the system message back in front (list `+` or `insert(0, ...)`)",
          "re": "(\\[\\s*\\w+\\[0\\]\\s*\\]\\s*\\+|\\.insert\\(\\s*0\\s*,)"
        },
        {
          "zh": "函数里有 `return`",
          "en": "The function returns something",
          "re": "^\\s+return\\b"
        }
      ]
    },
    {
      "title": {
        "zh": "手写：让模型把旧对话写成摘要",
        "en": "Write it: have the model summarise the old turns"
      },
      "task": {
        "zh": "写出 `summarize_history(messages)`：\n1. 用 `for` 循环把每条消息拼成 `role: content` 形式的一行行文字（包括 system）\n2. 调用模型，请它总结这段文字\n3. 返回一个新列表，里面只有一条 system 消息，内容是总结\n\n在网页里运行时，模拟模型只会复述收到的话；本地用真实模型才会真的总结。",
        "en": "Write `summarize_history(messages)`:\n1. with a `for` loop, turn each message (system included) into a `role: content` line of text\n2. call the model and ask it to summarise the text\n3. return a new list holding a single system message with the summary\n\nIn the browser the mock model just echoes what it received; a real model locally will actually summarise."
      },
      "run": "mock",
      "starter": {
        "zh": "from llm import client, MODEL\n\nhistory = [\n    {\"role\": \"system\", \"content\": \"你是一个数学老师，回答尽量简短。\"},\n    {\"role\": \"user\", \"content\": \"一支篮球队上场几个人？\"},\n    {\"role\": \"assistant\", \"content\": \"5 个人。\"},\n]\n\n# 写 summarize_history(messages)：\n# 1. 用 for 循环把每条消息拼成 \"role: content\" 一行行的文字\n# 2. 调用模型，请它总结这段文字\n# 3. 返回一个只有一条 system 消息的新列表，内容是「此前对话的总结如下：」加上总结\n\n\nhistory = summarize_history(history)\nprint(history)",
        "en": "from llm import client, MODEL\n\nhistory = [\n    {\"role\": \"system\", \"content\": \"You are a maths teacher. Keep answers short.\"},\n    {\"role\": \"user\", \"content\": \"How many basketball players per team are on court?\"},\n    {\"role\": \"assistant\", \"content\": \"Five.\"},\n]\n\n# write summarize_history(messages):\n# 1. use a for loop to turn each message into a \"role: content\" line of text\n# 2. call the model and ask it to summarise that text\n# 3. return a new list holding one system message: \"Summary of the conversation so far:\" plus the summary\n\n\nhistory = summarize_history(history)\nprint(history)"
      },
      "solution": {
        "zh": "from llm import client, MODEL\n\nhistory = [\n    {\"role\": \"system\", \"content\": \"你是一个数学老师，回答尽量简短。\"},\n    {\"role\": \"user\", \"content\": \"一支篮球队上场几个人？\"},\n    {\"role\": \"assistant\", \"content\": \"5 个人。\"},\n]\n\n# 写 summarize_history(messages)：\n# 1. 用 for 循环把每条消息拼成 \"role: content\" 一行行的文字\n# 2. 调用模型，请它总结这段文字\n# 3. 返回一个只有一条 system 消息的新列表，内容是「此前对话的总结如下：」加上总结\ndef summarize_history(messages):\n    text = \"\"\n    for m in messages:\n        text += f\"{m['role']}: {m['content']}\\n\"\n    response = client.chat.completions.create(\n        model=MODEL,\n        messages=[{\"role\": \"user\", \"content\": \"请总结下面这段对话，保留设定、问过的问题和结论：\\n\" + text}],\n    )\n    summary = response.choices[0].message.content\n    return [{\"role\": \"system\", \"content\": \"此前对话的总结如下：\\n\" + summary}]\n\nhistory = summarize_history(history)\nprint(history)",
        "en": "from llm import client, MODEL\n\nhistory = [\n    {\"role\": \"system\", \"content\": \"You are a maths teacher. Keep answers short.\"},\n    {\"role\": \"user\", \"content\": \"How many basketball players per team are on court?\"},\n    {\"role\": \"assistant\", \"content\": \"Five.\"},\n]\n\n# write summarize_history(messages):\n# 1. use a for loop to turn each message into a \"role: content\" line of text\n# 2. call the model and ask it to summarise that text\n# 3. return a new list holding one system message: \"Summary of the conversation so far:\" plus the summary\ndef summarize_history(messages):\n    text = \"\"\n    for m in messages:\n        text += f\"{m['role']}: {m['content']}\\n\"\n    response = client.chat.completions.create(\n        model=MODEL,\n        messages=[{\"role\": \"user\", \"content\": \"Summarise this conversation, keeping the setup, the questions and the conclusions:\\n\" + text}],\n    )\n    summary = response.choices[0].message.content\n    return [{\"role\": \"system\", \"content\": \"Summary of the conversation so far:\\n\" + summary}]\n\nhistory = summarize_history(history)\nprint(history)"
      },
      "checks": [
        {
          "zh": "定义了 `summarize_history(messages)`",
          "en": "Defines `summarize_history(messages)`",
          "re": "def\\s+summarize_history\\s*\\(\\s*\\w+\\s*\\)\\s*:"
        },
        {
          "zh": "用 `for` 遍历每条消息",
          "en": "Loops over the messages with `for`",
          "re": "for\\s+\\w+\\s+in\\s+\\w+\\s*:"
        },
        {
          "zh": "调用了模型 `client.chat.completions.create(...)`",
          "en": "Calls the model with `client.chat.completions.create(...)`",
          "re": "client\\.chat\\.completions\\.create\\("
        },
        {
          "zh": "取出模型回答的 `content`",
          "en": "Reads the reply's `content`",
          "re": "choices\\[0\\]\\.message\\.content"
        },
        {
          "zh": "返回只含一条 system 消息的新列表",
          "en": "Returns a new list with one system message",
          "re": "return\\s*\\[\\s*\\{\\s*[\\\"']role[\\\"']\\s*:\\s*[\\\"']system[\\\"']"
        }
      ]
    },
    {
      "title": {
        "zh": "手写：会管理记忆、会调用工具的终端聊天",
        "en": "Write it: a terminal chat that manages memory and calls tools"
      },
      "task": {
        "zh": "`trim_history` 已经写好。补全聊天程序：\n- `ask_model()`：用整个 `history` 和 `tools` 调用模型，把回答用 `model_dump()` 存进 `history`，返回回答\n- `while True` 循环读取输入：`/exit` 退出，空输入跳过\n- 每句话存进 `history`，然后用 `history[:] = trim_history(history, 10)` 裁剪\n- 用 `while reply.tool_calls:` 处理工具调用：对**每一个**调用执行 `get_weather`，结果作为 tool 消息存进记录，全部存完再调用模型\n- 打印最终回答\n\n在网页里运行时，试着输入「北京和上海天气怎么样」，再输入 `/exit`。",
        "en": "`trim_history` is already written. Complete the chat:\n- `ask_model()`: call the model with the whole `history` and `tools`, store the reply with `model_dump()`, return it\n- a `while True` loop reading input: `/exit` quits, empty input is skipped\n- store each line in `history`, then trim with `history[:] = trim_history(history, 10)`\n- handle tools with `while reply.tool_calls:` – run `get_weather` for **every** call, store each result as a tool message, and call the model once all are stored\n- print the final answer\n\nIn the browser, try “Weather in Beijing and Shanghai?” and then `/exit`."
      },
      "run": "mock",
      "starter": {
        "zh": "import json\nfrom llm import client, MODEL\nfrom weather_tool import get_weather, tools\n\nhistory = [{\"role\": \"system\", \"content\": \"你是一个乐于助人的助手，回答简洁。\"}]\n\ndef trim_history(messages, k):\n    recent = messages[-k:]\n    while recent and recent[0][\"role\"] == \"tool\":\n        recent = recent[1:]\n    if (not recent or recent[0][\"role\"] != \"system\") and messages[0][\"role\"] == \"system\":\n        recent = [messages[0]] + recent\n    return recent\n\n# 在这里写 ask_model() 和聊天循环",
        "en": "import json\nfrom llm import client, MODEL\nfrom weather_tool import get_weather, tools\n\nhistory = [{\"role\": \"system\", \"content\": \"You are a helpful assistant. Be concise.\"}]\n\ndef trim_history(messages, k):\n    recent = messages[-k:]\n    while recent and recent[0][\"role\"] == \"tool\":\n        recent = recent[1:]\n    if (not recent or recent[0][\"role\"] != \"system\") and messages[0][\"role\"] == \"system\":\n        recent = [messages[0]] + recent\n    return recent\n\n# write ask_model() and the chat loop here"
      },
      "solution": {
        "zh": "import json\nfrom llm import client, MODEL\nfrom weather_tool import get_weather, tools\n\nhistory = [{\"role\": \"system\", \"content\": \"你是一个乐于助人的助手，回答简洁。\"}]\n\ndef trim_history(messages, k):\n    recent = messages[-k:]\n    while recent and recent[0][\"role\"] == \"tool\":\n        recent = recent[1:]\n    if (not recent or recent[0][\"role\"] != \"system\") and messages[0][\"role\"] == \"system\":\n        recent = [messages[0]] + recent\n    return recent\n\n# 在这里写 ask_model() 和聊天循环\ndef ask_model():\n    reply = client.chat.completions.create(model=MODEL, messages=history, tools=tools).choices[0].message\n    history.append(reply.model_dump())\n    return reply\n\nwhile True:\n    user_input = input(\"你：\").strip()\n    if not user_input:\n        continue\n    if user_input == \"/exit\":\n        break\n    history.append({\"role\": \"user\", \"content\": user_input})\n    history[:] = trim_history(history, 10)\n    reply = ask_model()\n    while reply.tool_calls:\n        for call in reply.tool_calls:\n            args = json.loads(call.function.arguments)\n            result = get_weather(**args)\n            history.append({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": str(result)})\n        reply = ask_model()\n    print(\"AI：\", reply.content)",
        "en": "import json\nfrom llm import client, MODEL\nfrom weather_tool import get_weather, tools\n\nhistory = [{\"role\": \"system\", \"content\": \"You are a helpful assistant. Be concise.\"}]\n\ndef trim_history(messages, k):\n    recent = messages[-k:]\n    while recent and recent[0][\"role\"] == \"tool\":\n        recent = recent[1:]\n    if (not recent or recent[0][\"role\"] != \"system\") and messages[0][\"role\"] == \"system\":\n        recent = [messages[0]] + recent\n    return recent\n\n# write ask_model() and the chat loop here\ndef ask_model():\n    reply = client.chat.completions.create(model=MODEL, messages=history, tools=tools).choices[0].message\n    history.append(reply.model_dump())\n    return reply\n\nwhile True:\n    user_input = input(\"You: \").strip()\n    if not user_input:\n        continue\n    if user_input == \"/exit\":\n        break\n    history.append({\"role\": \"user\", \"content\": user_input})\n    history[:] = trim_history(history, 10)\n    reply = ask_model()\n    while reply.tool_calls:\n        for call in reply.tool_calls:\n            args = json.loads(call.function.arguments)\n            result = get_weather(**args)\n            history.append({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": str(result)})\n        reply = ask_model()\n    print(\"AI:\", reply.content)"
      },
      "checks": [
        {
          "zh": "定义了 `ask_model()`，把回答 `model_dump()` 后存进记录",
          "en": "Defines `ask_model()` and stores the reply with `model_dump()`",
          "re": "history\\.append\\(\\s*\\w+\\.model_dump\\(\\)\\s*\\)"
        },
        {
          "zh": "用 `while True:` 做主循环",
          "en": "Uses `while True:` as the main loop",
          "re": "while\\s+True\\s*:"
        },
        {
          "zh": "用 `input(...)` 读取用户输入",
          "en": "Reads input with `input(...)`",
          "re": "input\\("
        },
        {
          "zh": "输入 `/exit` 时 `break`",
          "en": "`break` on `/exit`",
          "re": "/exit[\\s\\S]*?break"
        },
        {
          "zh": "把用户的话存进记录（role 是 user）",
          "en": "Stores the user's line (role user)",
          "re": "[\\\"']role[\\\"']\\s*:\\s*[\\\"']user[\\\"']"
        },
        {
          "zh": "用 `history[:] = trim_history(...)` 原地裁剪",
          "en": "Trims in place with `history[:] = trim_history(...)`",
          "re": "history\\[\\s*:\\s*\\]\\s*=\\s*trim_history\\("
        },
        {
          "zh": "调用模型时带上 `tools=tools`",
          "en": "Passes `tools=tools`",
          "re": "tools\\s*=\\s*tools"
        },
        {
          "zh": "用 `while reply.tool_calls` 循环处理工具调用",
          "en": "Loops with `while reply.tool_calls`",
          "re": "while\\s+\\w+\\.tool_calls"
        },
        {
          "zh": "`for` 遍历每一个调用",
          "en": "`for` over every call",
          "re": "for\\s+\\w+\\s+in\\s+\\w+\\.tool_calls"
        },
        {
          "zh": "存入带 `tool_call_id` 的 tool 消息",
          "en": "Stores a tool message with `tool_call_id`",
          "re": "[\\\"']tool_call_id[\\\"']\\s*:\\s*\\w+\\.id"
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "按字数估算上下文长度：限制和计费都按 token 算，字数会让你误判超没超。",
      "en": "Estimating context length by characters: limits and billing count tokens, so characters mislead you."
    },
    {
      "zh": "把 `encode` 返回的编号当成数量：token 数是 `len(ds_token.encode(...))`。",
      "en": "Taking the ids from `encode` for a count: the token count is `len(ds_token.encode(...))`."
    },
    {
      "zh": "用别的模型的分词器数 DeepSeek 的 token：分词规则不同，数出来不准。",
      "en": "Counting DeepSeek tokens with another model's tokenizer: the rules differ, so the count is off."
    },
    {
      "zh": "滑动窗口把最前面的 system 消息切掉了，模型忘了设定，风格突然变了。",
      "en": "A sliding window that cuts off the system message, so the model forgets its setup and the style suddenly changes."
    },
    {
      "zh": "用摘要替换整段记录时，原来的 system 设定既没写进摘要，也没单独放回去。",
      "en": "Replacing the record with a summary without either summarising the system setup or putting it back."
    },
    {
      "zh": "裁剪后窗口以 tool 消息开头（它的 assistant 请求被切掉了），接口报 400。",
      "en": "A trimmed window that starts with a tool message whose assistant request was cut off – the API returns 400."
    },
    {
      "zh": "在函数里写 `history = trim_history(...)`：只创建了局部变量，外面的记录没变。用 `history[:] = ...`。",
      "en": "Writing `history = trim_history(...)` inside a function: it only creates a local variable and the outer record doesn't change. Use `history[:] = ...`."
    },
    {
      "zh": "记录里混着 SDK 消息对象，`m[\"content\"]` 报 TypeError。存进记录前用 `model_dump()` 或 `dict(...)`。",
      "en": "SDK message objects mixed into the record make `m[\"content\"]` raise TypeError. Store `model_dump()` or `dict(...)` instead."
    }
  ],
  "recap": [
    {
      "zh": "上下文长度和计费都按分词后的 token 算，不是字数；记录太长会更贵、更慢，超过上限请求就失败。",
      "en": "Context length and billing count tokens after tokenization, not characters; a long record is costlier and slower, and past the limit the request fails."
    },
    {
      "zh": "用对应模型的分词器数 token：`from deepseek_tokenizer import ds_token`，`len(ds_token.encode(文字))`；「你是谁？」是 2 个 token。",
      "en": "Count tokens with the model's own tokenizer: `from deepseek_tokenizer import ds_token`, `len(ds_token.encode(text))`; “你是谁？” is 2 tokens."
    },
    {
      "zh": "整段对话：遍历每条消息的 content（可能是 None）分词计数再加起来；发送前先算，超了再管理。",
      "en": "A whole conversation: tokenize each message's content (which may be None) and add up the counts; check before sending and manage only if over."
    },
    {
      "zh": "滑动窗口：`messages[-k:]` 只留最近 k 条，从大往小试；切掉了 system 就补回最前面。",
      "en": "Sliding window: `messages[-k:]` keeps the latest k, trying from large to small; if the system message was cut off, put it back in front."
    },
    {
      "zh": "摘要：让模型总结旧对话，结果作为新的 system 提示；原设定一起总结或单独保留。两种方法可以配合。",
      "en": "Summary: have the model summarise the old turns and use the result as the new system prompt, with the original setup summarised too or kept separately. The two methods combine."
    },
    {
      "zh": "长期记忆用专门的数据库：知识图谱（实体和关系，门槛高、效果好）、向量数据库（语义检索，简单便宜，RAG 的基础）。",
      "en": "Long-term memory needs dedicated databases: knowledge graphs (entities and relations; costly but strong) and vector databases (semantic search; simple, cheap, the basis of RAG)."
    },
    {
      "zh": "Python：切片 `xs[-k:]`、列表推导式、`while True` + `input()` + `break`/`continue`；函数里替换整个列表用 `xs[:] = ...`。",
      "en": "Python: slices `xs[-k:]`, list comprehensions, `while True` + `input()` + `break`/`continue`; to replace a whole list inside a function, use `xs[:] = ...`."
    }
  ],
  "files": [
    {
      "path": "practice/l06_tokens.py",
      "zh": "用 `deepseek_tokenizer` 数 token：「你是谁？」、一整段对话的字数和 token 数，再和服务器的 `usage.prompt_tokens` 对比（会调用 1 次模型）。",
      "en": "Counting tokens with `deepseek_tokenizer`: “你是谁？”, characters vs tokens for a whole conversation, compared with the server's `usage.prompt_tokens` (1 model call)."
    },
    {
      "path": "practice/l06_memory_todo.py",
      "zh": "练习：补全 `count_tokens`、`trim_history`（保留 system）和 `summarize_history`，再接进 05 节的 `get_completion`（有 TODO 提示）。",
      "en": "Exercise: complete `count_tokens`, `trim_history` (keeping the system prompt) and `summarize_history`, then plug them into lesson 05's `get_completion` (with TODO hints)."
    },
    {
      "path": "practice/l06_memory_solution.py",
      "zh": "上面练习的参考答案：超过 token 上限时自动裁剪的 `get_completion`，以及一次真实的摘要（会调用 2 次模型）。",
      "en": "Reference solution: a `get_completion` that trims automatically past a token limit, plus one real summary (2 model calls)."
    },
    {
      "path": "practice/l06_chat.py",
      "zh": "完整的终端聊天程序：工具调用 + 按 token 数裁剪记录 + `/history`、`/tokens`、`/clear`、`/exit` 命令。",
      "en": "A complete terminal chat: tool calls + trimming by token count + `/history`, `/tokens`, `/clear`, `/exit` commands."
    }
  ]
});
