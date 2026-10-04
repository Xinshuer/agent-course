COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l47",
  "priority": "important",
  "handwrite": false,
  "studyMinutes": 25,
  "source": "subtitle",
  "summary": {
    "zh": "对话历史就是一个消息列表，聊得越久越长，不能让它无限增长。这一集（7 分钟）介绍 LangChain 管理历史的两个工具：`trim_messages` 按 token 上限从后往前剪掉旧消息，可以要求保留 system、允许只留半条消息；`filter_messages` 按消息类型、你自己打的 `name` / `id` 标签来「包含」或「排除」消息。你在第 06 节手写过「保留最近 N 条」，这里换成现成的工具，并学会给消息打标签。",
    "en": "A chat history is a list of messages that grows with every turn, and it must not grow forever. This 7-minute episode covers LangChain's two tools for it: `trim_messages` works backwards from the newest message and cuts old ones to fit a token limit, and can be told to keep the system message and to keep part of a message; `filter_messages` includes or excludes messages by type or by `name` / `id` tags you add yourself. You hand-wrote “keep the last N” in lesson 06; here you use ready-made tools and learn to tag messages."
  },
  "goals": [
    {
      "zh": "说清楚为什么不能让对话历史无限增长，剪裁和筛选有什么区别",
      "en": "Explain why a chat history must not grow forever, and how trimming differs from filtering"
    },
    {
      "zh": "用 `trim_messages` 按 token 上限保留最近的消息，会用 `strategy`、`include_system`、`allow_partial`",
      "en": "Use `trim_messages` to keep the latest messages under a token limit, with `strategy`, `include_system` and `allow_partial`"
    },
    {
      "zh": "知道视频是用模型对象数 token，而 DeepSeek 模型对象不能当 `token_counter`，改用 `count_tokens_approximately`",
      "en": "Know that the video counts tokens with a model object, that a DeepSeek model can't be the `token_counter`, and use `count_tokens_approximately` instead"
    },
    {
      "zh": "给消息打 `name` / `id` 标签，用 `filter_messages` 按类型、名字、id 包含或排除",
      "en": "Tag messages with `name` / `id` and use `filter_messages` to include or exclude by type, name or id"
    },
    {
      "zh": "能举出需要自定义标签来筛选历史的场景（视频的思考题）",
      "en": "Give examples of when custom tags help filter a history (the video's question)"
    }
  ],
  "blocks": [
    {
      "t": "h",
      "zh": "一、对话历史为什么要管",
      "en": "1. Why manage the chat history"
    },
    {
      "t": "p",
      "zh": "[▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=48&t=1) 第 45 节讲过，LangChain 里的对话历史就是一个**消息列表**，每条消息有自己的角色（`SystemMessage`、`HumanMessage`、`AIMessage`……）。用户聊得越多，这个列表越长。一个合格的应用不会让它无限增长：\n- **省钱**：每次请求都要把历史整个发过去，按 token 收费\n- **可控**：太早或无关的内容会干扰回答；而且模型一次能读的长度也有上限\n\n控制历史有两类办法：**剪裁**（比如规定历史最多 1000 个 token，超了就把最旧的剪掉，只留最近的）和**筛选**（按条件挑出有用的、去掉没用的）。第 06 节我们手写过一个 `trim_history`，这一节用 LangChain 现成的工具来做。",
      "en": "[▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=48&t=1) As lesson 45 showed, a chat history in LangChain is a **list of messages**, each with a role (`SystemMessage`, `HumanMessage`, `AIMessage`…). The longer the user chats, the longer the list. A sensible app doesn't let it grow forever:\n- **Cost**: every request resends the whole history, and you pay per token\n- **Control**: very old or irrelevant content can distract the model – and a model can only read so much at once\n\nThere are two ways to keep it in check: **trimming** (say, cap the history at 1,000 tokens and cut the oldest messages beyond that, keeping the latest) and **filtering** (keep what's useful by some condition, drop the rest). You hand-wrote `trim_history` in lesson 06; this lesson uses LangChain's ready-made tools."
    },
    {
      "t": "video",
      "zh": "这一集 7 分钟（据 B 站自动字幕），分两段：\n- [▶ 01:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=48&t=94) `trim_messages`：给一段很短的历史，为了演示把上限设成 45 个 token，`strategy` 用默认的「从后往前」，并告诉它按哪个模型的规则数 token——剪完只剩最后两条\n- [▶ 02:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=48&t=156) 再加上「必须保留 system」和 `allow_partial`（允许把一条消息截断）：结果变成 system + 最后一轮\n- [▶ 03:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=48&t=220) `filter_messages`：先给每条消息自定义 `id` 和 `name` 两个标签，再按类型、id、名字三种条件筛选，每种都可以「包含」或「不包含」，还能组合\n- [▶ 06:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=48&t=380) 最后留了一道思考题：什么场景需要用自定义标签筛选历史？讲师把答案留到了答疑（本节第四部分给出参考思路）\n\n视频是把一个模型交给 `trim_messages`，让它按这个模型的规则数 token（字幕没说具体型号；这几集 LangChain 课主要用的是 OpenAI 的 gpt-4o-mini）。本课用 DeepSeek，数 token 的方法要换（见下面的「注意」）。",
      "en": "This 7-minute episode (per Bilibili's auto-generated subtitles) has two parts:\n- [▶ 01:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=48&t=94) `trim_messages`: a very short history, a limit of 45 tokens for the demo, the default keep-from-the-end `strategy`, and a model whose rules are used to count tokens – only the last two messages survive\n- [▶ 02:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=48&t=156) Then “always keep the system message” plus `allow_partial` (a message may be cut): the result becomes system + the last round\n- [▶ 03:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=48&t=220) `filter_messages`: first tag each message with your own `id` and `name`, then filter by type, id or name – each as “include” or “exclude”, and combinable\n- [▶ 06:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=48&t=380) It ends with a question: when would you filter a history by custom tags? The instructor saves the answer for the Q&A (part 4 of this lesson gives some ideas)\n\nThe video hands a model to `trim_messages` so that tokens are counted by that model's rules (the subtitles don't name the model; these LangChain episodes mainly use OpenAI's gpt-4o-mini). This lesson uses DeepSeek, so the counting method has to change (see “Watch out” below)."
    },
    {
      "t": "h",
      "zh": "二、trim_messages：按 token 上限剪裁",
      "en": "2. trim_messages: trim to a token limit"
    },
    {
      "t": "p",
      "zh": "[▶ 01:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=48&t=94) `trim_messages(消息列表, ...)` 返回一个**新的**、剪短了的列表，原列表不变。常用参数：\n\n| 参数 | 作用 |\n|---|---|\n| `max_tokens` | 最多保留多少 token |\n| `strategy` | `\"last\"`（默认）从后往前保留最近的；`\"first\"` 从前往后保留最早的 |\n| `token_counter` | 怎么数 token：一个模型对象、一个函数，或字符串 `\"approximate\"` |\n| `include_system` | `True` 时开头的 system 消息永远保留，其余消息再去分剩下的额度 |\n| `allow_partial` | 额度不够放下一整条消息时，允许只保留它的一部分（默认按换行拆，从后面留） |\n| `start_on`（补充） | 剪完后（system 之外）第一条必须是哪种消息，常用 `\"human\"` |\n\n下面按视频的两步来：先只说「从后往前、最多多少 token」，再加上 `include_system` 和 `allow_partial`。为了让 `allow_partial` 看得出效果，历史里有一条多行的 AI 回答：",
      "en": "[▶ 01:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=48&t=94) `trim_messages(messages, ...)` returns a **new**, shorter list and leaves the original alone. Common parameters:\n\n| Parameter | What it does |\n|---|---|\n| `max_tokens` | Maximum tokens to keep |\n| `strategy` | `\"last\"` (default) keeps the latest; `\"first\"` keeps the earliest |\n| `token_counter` | How to count tokens: a model object, a function, or the string `\"approximate\"` |\n| `include_system` | If `True`, the leading system message always stays and the rest share what's left |\n| `allow_partial` | When a whole message doesn't fit, keep part of it (split on line breaks by default, keeping the end) |\n| `start_on` (extra) | Which kind of message must come first after trimming (besides system); usually `\"human\"` |\n\nBelow we follow the video's two steps: first just “from the end, at most N tokens”, then add `include_system` and `allow_partial`. So that `allow_partial` has a visible effect, the history contains a multi-line AI reply:"
    },
    {
      "t": "code",
      "file": "trim_demo.py",
      "code": {
        "zh": "from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, trim_messages\nfrom langchain_core.messages.utils import count_tokens_approximately\n\nhistory = [\n    SystemMessage(\"你是一个简洁的中文助手，回答不超过两句话。\"),\n    HumanMessage(\"你好，我叫小明。\"),\n    AIMessage(\"你好小明！有什么可以帮你？\"),\n    HumanMessage(\"推荐几个学 Python 的网站。\"),\n    AIMessage(\"可以从这几个网站开始：\\n1. Python 官方教程 docs.python.org\\n2. 菜鸟教程 runoob.com\\n3. 廖雪峰的 Python 教程\"),\n    HumanMessage(\"我叫什么名字？\"),\n]\nprint(count_tokens_approximately(history))     # 65（估算值）\n\n# 第一步：从后往前（strategy=\"last\"）保留，最多 35 个 token\na = trim_messages(history, max_tokens=35, strategy=\"last\",\n                  token_counter=count_tokens_approximately)\n# [ai 可以从这几个网站开始：……（整条网站列表）, human 我叫什么名字？]\n#   ← 只剩最后两条，开头的 system 也被剪掉了\n\n# 第二步：加上 include_system=True 和 allow_partial=True\nb = trim_messages(history, max_tokens=35, strategy=\"last\",\n                  token_counter=count_tokens_approximately,\n                  include_system=True, allow_partial=True)\n# [system 你是一个简洁的中文助手……,\n#  ai '2. 菜鸟教程 runoob.com\\n3. 廖雪峰的 Python 教程',\n#  human 我叫什么名字？]\n#   ← system 保住了；网站列表那条 AI 消息放不下，只留下了最后两行",
        "en": "from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, trim_messages\nfrom langchain_core.messages.utils import count_tokens_approximately\n\nhistory = [\n    SystemMessage(\"你是一个简洁的中文助手，回答不超过两句话。\"),   # \"a concise assistant, two sentences max\"\n    HumanMessage(\"你好，我叫小明。\"),                            # \"Hi, I'm Xiaoming.\"\n    AIMessage(\"你好小明！有什么可以帮你？\"),                      # \"Hi Xiaoming! How can I help?\"\n    HumanMessage(\"推荐几个学 Python 的网站。\"),                   # \"Recommend some sites for learning Python.\"\n    AIMessage(\"可以从这几个网站开始：\\n1. Python 官方教程 docs.python.org\\n2. 菜鸟教程 runoob.com\\n3. 廖雪峰的 Python 教程\"),\n    HumanMessage(\"我叫什么名字？\"),                              # \"What's my name?\"\n]\nprint(count_tokens_approximately(history))     # 65 (an estimate)\n\n# Step 1: keep from the end (strategy=\"last\"), at most 35 tokens\na = trim_messages(history, max_tokens=35, strategy=\"last\",\n                  token_counter=count_tokens_approximately)\n# [ai 可以从这几个网站开始：... (the whole list of sites), human 我叫什么名字？]\n#   <- only the last two messages; the system message is gone too\n\n# Step 2: add include_system=True and allow_partial=True\nb = trim_messages(history, max_tokens=35, strategy=\"last\",\n                  token_counter=count_tokens_approximately,\n                  include_system=True, allow_partial=True)\n# [system 你是一个简洁的中文助手...,\n#  ai '2. 菜鸟教程 runoob.com\\n3. 廖雪峰的 Python 教程',\n#  human 我叫什么名字？]\n#   <- system is kept; the list of sites doesn't fit, so only its last two lines remain"
      },
      "note": {
        "zh": "注释里的结果来自实际运行。和视频的效果一样：第一步只剩最后两条，system 被剪掉，机器人的身份设定也跟着丢了；第二步 system 保住了，再用剩下的额度留最近的内容，放不下的那条消息只留了后半截。视频的上限是 45，是按它所用模型的分词规则数的；本课用估算的方法数，所以换成了 35，剪出来的样子相同。",
        "en": "The results in the comments come from a real run, and they match the video's: step 1 keeps only the last two messages and drops the system message, so the bot's identity is lost with it; step 2 keeps the system message and fills the remaining budget with the latest content, keeping only the tail of the message that doesn't fit. The video's limit of 45 is counted with its model's tokenizer; we count with an estimate, so we use 35 to get the same shape."
      }
    },
    {
      "t": "p",
      "zh": "[▶ 02:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=48&t=156) 讲师解释了这两个参数的用处：system 提示词里通常定义了机器人的身份和功能，一旦被剪掉，机器人就忘了自己的角色，所以要求先保住 system，再在剩下的额度里留后面的轮次；`allow_partial` 决定能不能把一条消息拦腰截断，只留一部分。",
      "en": "[▶ 02:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=48&t=156) The instructor explains what the two are for: the system prompt usually defines the bot's identity and functions, and without it the bot no longer knows who it is – so keep the system message first, then fill the remaining budget with the latest turns; `allow_partial` decides whether a message may be cut, keeping only part of it."
    },
    {
      "t": "warn",
      "zh": "视频是把一个**模型对象**传给 `token_counter`，让它按这个模型的分词规则数 token。换成 DeepSeek 不行：`token_counter=ChatDeepSeek(...)` 会报 `NotImplementedError: get_num_tokens_from_messages() is not presently implemented for model deepseek-flash`。\n\n改用 `langchain_core.messages.utils` 里的 `count_tokens_approximately`（或直接写 `token_counter=\"approximate\"`）。它大约按「4 个字符 ≈ 1 个 token」估算，这是英文的经验值；中文平均每个 token 对应的字符少得多，所以对中文会**估少**：上面那段历史估算是 65，按 gpt-4o-mini 的分词规则其实是 105。想保守一点，就把 `max_tokens` 设小一些，或者自己写一个计数函数传进去。",
      "en": "The video passes a **model object** as `token_counter`, so tokens are counted by that model's tokenizer. That doesn't work with DeepSeek: `token_counter=ChatDeepSeek(...)` raises `NotImplementedError: get_num_tokens_from_messages() is not presently implemented for model deepseek-flash`.\n\nUse `count_tokens_approximately` from `langchain_core.messages.utils` (or simply `token_counter=\"approximate\"`). It estimates roughly “4 characters ≈ 1 token”, a rule of thumb for English; Chinese packs far fewer characters into a token, so it **underestimates** Chinese: the history above is estimated at 65, while gpt-4o-mini's tokenizer counts 105. To be safe, use a smaller `max_tokens` or pass your own counting function."
    },
    {
      "t": "note",
      "zh": "想像视频那样用模型对象、按 OpenAI 模型的规则精确数？`token_counter=ChatOpenAI(model=\"gpt-4o-mini\", api_key=\"任意字符串\")` 在课程环境里也能用：数 token 是本地的 `tiktoken` 包在做，不会调用 OpenAI 的接口（只是创建 `ChatOpenAI` 时必须给一个 api_key；第一次用时 tiktoken 会联网下载几 MB 的词表文件，缓存在临时文件夹里）。按它数，上面这段历史有 105 个 token，比估算多得多，所以上限要放宽到 55 左右，才能剪出和上面差不多的结果。不过它数的是 OpenAI 模型的 token，和 DeepSeek 实际收费的 token 数也不完全一样，所以本课还是用估算。",
      "en": "Want to count precisely with a model object, like the video, by an OpenAI model's rules? `token_counter=ChatOpenAI(model=\"gpt-4o-mini\", api_key=\"any string\")` works in the course environment too: the local `tiktoken` package does the counting and no OpenAI API is called (creating `ChatOpenAI` just requires some api_key; on first use tiktoken downloads a vocabulary file of a few MB and caches it in the temp folder). Counted this way, the history above has 105 tokens – far more than the estimate – so the limit has to go up to about 55 to get roughly the same trimming as above. But it counts OpenAI tokens, which don't exactly match the tokens DeepSeek actually bills, so this lesson sticks with the estimate."
    },
    {
      "t": "note",
      "zh": "补充（视频没讲）：`start_on=\"human\"`。从后往前剪的时候，切口可能落在一问一答的中间，剪完的历史以一条「没头没尾」的 AI 回答开头。加上 `start_on=\"human\"`，它会继续往后丢，直到第一条是用户说的话。实际项目里通常会和 `include_system=True` 一起用：",
      "en": "Extra (not in the video): `start_on=\"human\"`. Trimming from the end can cut between a question and its answer, leaving the history starting with an AI reply that lost its question. With `start_on=\"human\"`, it keeps dropping until the first message is the user's. Real projects usually combine it with `include_system=True`:"
    },
    {
      "t": "code",
      "file": "start_on_extra.py",
      "code": {
        "zh": "# 接着上面的 history：额度放宽到 45，只加 include_system=True\nc1 = trim_messages(history, max_tokens=45, strategy=\"last\",\n                   token_counter=count_tokens_approximately, include_system=True)\n# [system ……, ai 可以从这几个网站开始：……, human 我叫什么名字？]\n#   ← system 后面直接是一条 AI 回答，它回答的那个问题已经被剪掉了\n\nc2 = trim_messages(history, max_tokens=45, strategy=\"last\",\n                   token_counter=count_tokens_approximately, include_system=True, start_on=\"human\")\n# [system ……, human 我叫什么名字？]   ← system 之后从用户的话开始",
        "en": "# Same history as above: a budget of 45, with only include_system=True\nc1 = trim_messages(history, max_tokens=45, strategy=\"last\",\n                   token_counter=count_tokens_approximately, include_system=True)\n# [system ..., ai 可以从这几个网站开始：..., human 我叫什么名字？]\n#   <- an AI reply right after system; the question it answered has been cut\n\nc2 = trim_messages(history, max_tokens=45, strategy=\"last\",\n                   token_counter=count_tokens_approximately, include_system=True, start_on=\"human\")\n# [system ..., human 我叫什么名字？]   <- after system, it starts with the user"
      }
    },
    {
      "t": "py",
      "title": {
        "zh": "倒着遍历列表：reversed() 和 insert(0, x)",
        "en": "Walking a list backwards: reversed() and insert(0, x)"
      },
      "zh": "`trim_messages` 的 `strategy=\"last\"` 做的事，用纯 Python 写出来就是：**从最后一条往前看**，能放下就留着，放不下就停。这里用到两个新写法：\n- `reversed(列表)`：倒着一个个取出元素，原列表不变\n- `列表.insert(0, x)`：把 `x` 插到最前面（下标 0 的位置）。倒着取、往前插，留下来的消息就还是原来的顺序\n\n顺便注意：`token_counter=count_tokens_approximately` 传的是**函数本身**，没有括号，`trim_messages` 需要数的时候自己去调用它（函数本身和函数调用的区别，回顾 25 节；把函数交给另一个函数，回顾 21 节）。",
      "en": "What `strategy=\"last\"` in `trim_messages` does, in plain Python: **look from the last message backwards**, keep each one that fits, stop at the first that doesn't. Two new bits:\n- `reversed(list)`: yields the items backwards, leaving the list unchanged\n- `list.insert(0, x)`: puts `x` at the front (index 0). Taking items backwards and inserting at the front keeps the kept messages in their original order\n\nAlso note: `token_counter=count_tokens_approximately` passes the **function itself**, without parentheses; `trim_messages` calls it whenever it needs a count (function vs. function call: see lesson 25; handing a function to another function: lesson 21).",
      "code": {
        "zh": "def keep_last(messages, limit):\n    \"\"\"从最后一条往前数，总字数不超过 limit 的都留下\"\"\"\n    kept = []\n    total = 0\n    for m in reversed(messages):          # 从最后一条往前看\n        size = len(m[\"content\"])\n        if total + size > limit:          # 再加上这一条就超了 → 停\n            break\n        kept.insert(0, m)                 # 插到最前面，保持原来的顺序\n        total = total + size\n    return kept\n\nhistory = [\n    {\"role\": \"user\", \"content\": \"你好，我叫小明。\"},\n    {\"role\": \"assistant\", \"content\": \"你好小明！\"},\n    {\"role\": \"user\", \"content\": \"推荐一个学 Python 的网站。\"},\n    {\"role\": \"assistant\", \"content\": \"可以看官方教程。\"},\n    {\"role\": \"user\", \"content\": \"我叫什么名字？\"},\n]\n\nprint([m[\"content\"] for m in keep_last(history, 20)])   # 只留下最后两条\nprint(list(reversed([1, 2, 3])))                         # [3, 2, 1]\nnums = [2, 3]\nnums.insert(0, 1)                                        # 插到下标 0 的位置\nprint(nums)                                              # [1, 2, 3]",
        "en": "def keep_last(messages, limit):\n    \"\"\"Count back from the last message; keep messages while the total length stays within limit\"\"\"\n    kept = []\n    total = 0\n    for m in reversed(messages):          # walk from the last message backwards\n        size = len(m[\"content\"])\n        if total + size > limit:          # adding this one would exceed the limit -> stop\n            break\n        kept.insert(0, m)                 # put it at the front to keep the original order\n        total = total + size\n    return kept\n\nhistory = [\n    {\"role\": \"user\", \"content\": \"Hi, I'm Xiaoming.\"},\n    {\"role\": \"assistant\", \"content\": \"Hi Xiaoming!\"},\n    {\"role\": \"user\", \"content\": \"A site to learn Python?\"},\n    {\"role\": \"assistant\", \"content\": \"python.org\"},\n    {\"role\": \"user\", \"content\": \"My name?\"},\n]\n\nprint([m[\"content\"] for m in keep_last(history, 20)])   # only the last two are kept\nprint(list(reversed([1, 2, 3])))                         # [3, 2, 1]\nnums = [2, 3]\nnums.insert(0, 1)                                        # insert at index 0\nprint(nums)                                              # [1, 2, 3]"
      },
      "note": {
        "zh": "`trim_messages` 内部做的事和 `keep_last` 很像，只是按 token 而不是字数来数，还多了保留 system、`allow_partial` 这些规则。",
        "en": "`trim_messages` works much like `keep_last`, except that it counts tokens rather than characters and adds rules such as keeping system and `allow_partial`."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "`include_system=True` 的作用是？",
        "en": "What does `include_system=True` do?"
      },
      "options": [
        {
          "zh": "只保留 system 消息",
          "en": "Keep only the system message"
        },
        {
          "zh": "开头的 system 消息永远保留，其余消息再按额度从后往前保留",
          "en": "The leading system message always stays; the rest are kept from the end within the remaining budget"
        },
        {
          "zh": "把 system 消息放到最后",
          "en": "Move the system message to the end"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "system 里通常是机器人的身份和规则，剪掉了它可能就不知道自己是谁。`include_system=True` 先保住它，再用剩下的额度保留最近的消息。",
        "en": "The system message usually holds the bot's identity and rules; losing it can make the bot forget who it is. `include_system=True` keeps it first, then fills the remaining budget with the latest messages."
      }
    },
    {
      "t": "h",
      "zh": "三、filter_messages：按类型、名字、id 筛选",
      "en": "3. filter_messages: filter by type, name and id"
    },
    {
      "t": "p",
      "zh": "[▶ 03:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=48&t=220) 视频接着介绍了一个更灵活的工具。每条消息除了内容，还可以带两个「标签」字段：`name` 和 `id`。它们都是字符串，LangChain 不规定是什么意思，由你按业务自己定义——比如 `name` 记谁说的，`id` 给消息编号。\n\n[▶ 04:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=48&t=284) `filter_messages` 按三种条件筛选，每种都有「包含」和「排除」两个参数：\n\n| 条件 | 只要这些 | 去掉这些 |\n|---|---|---|\n| 类型（角色） | `include_types` | `exclude_types` |\n| 名字 | `include_names` | `exclude_names` |\n| id | `include_ids` | `exclude_ids` |\n\n类型可以写字符串 `\"human\"`、`\"ai\"`、`\"system\"`、`\"tool\"`，也可以写类名 `HumanMessage`、`AIMessage`。几个参数可以组合使用。下面三种筛选和视频里演示的三种一一对应（[▶ 05:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=48&t=346)）：",
      "en": "[▶ 03:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=48&t=220) The video then introduces a more flexible tool. Besides content, every message can carry two “tag” fields: `name` and `id`. Both are strings, and LangChain doesn't define what they mean – you decide to suit your app, e.g. `name` for who spoke and `id` to number the messages.\n\n[▶ 04:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=48&t=284) `filter_messages` filters on three criteria, each with an “include” and an “exclude” parameter:\n\n| Criterion | Keep only these | Drop these |\n|---|---|---|\n| Type (role) | `include_types` | `exclude_types` |\n| Name | `include_names` | `exclude_names` |\n| id | `include_ids` | `exclude_ids` |\n\nTypes can be the strings `\"human\"`, `\"ai\"`, `\"system\"`, `\"tool\"` or the classes `HumanMessage`, `AIMessage`. Parameters can be combined. The three filters below match the three the video demonstrates ([▶ 05:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=48&t=346)):"
    },
    {
      "t": "code",
      "file": "filter_demo.py",
      "code": {
        "zh": "from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, filter_messages\n\ntagged = [\n    SystemMessage(\"你是一个简洁的中文助手。\", id=\"1\"),\n    HumanMessage(\"（示范）把“谢谢”翻译成英文\", id=\"2\", name=\"example_user\"),\n    AIMessage(\"（示范）Thank you.\", id=\"3\", name=\"example_assistant\"),\n    HumanMessage(\"把“早上好”翻译成英文\", id=\"4\", name=\"xiaoming\"),\n    AIMessage(\"Good morning.\", id=\"5\", name=\"assistant\"),\n]\n\n# 1. 按类型：只要用户说的话 → id 2、4\nfilter_messages(tagged, include_types=\"human\")\n\n# 2. 按名字：去掉两条示范 → id 1、4、5\nfilter_messages(tagged, exclude_names=[\"example_user\", \"example_assistant\"])\n\n# 3. 组合：人和 AI 的消息，但不要 id 3 → id 2、4、5\nfilter_messages(tagged, include_types=[HumanMessage, AIMessage], exclude_ids=[\"3\"])",
        "en": "from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, filter_messages\n\ntagged = [\n    SystemMessage(\"You are a concise assistant.\", id=\"1\"),\n    HumanMessage(\"(example) Translate 'gracias' into English\", id=\"2\", name=\"example_user\"),\n    AIMessage(\"(example) Thank you.\", id=\"3\", name=\"example_assistant\"),\n    HumanMessage(\"Translate 'buenos días' into English\", id=\"4\", name=\"xiaoming\"),\n    AIMessage(\"Good morning.\", id=\"5\", name=\"assistant\"),\n]\n\n# 1. by type: only what the user said -> ids 2, 4\nfilter_messages(tagged, include_types=\"human\")\n\n# 2. by name: drop the two example messages -> ids 1, 4, 5\nfilter_messages(tagged, exclude_names=[\"example_user\", \"example_assistant\"])\n\n# 3. combined: human and AI messages, but not id 3 -> ids 2, 4, 5\nfilter_messages(tagged, include_types=[HumanMessage, AIMessage], exclude_ids=[\"3\"])"
      },
      "note": {
        "zh": "注释里的 id 是实际运行的结果。第 1 种只留下两条用户消息（其中一条是示范），第 2 种把两条示范都去掉，第 3 种保留人和 AI 的消息、再排除 id 为 \"3\" 的那条。",
        "en": "The ids in the comments come from a real run. Filter 1 keeps the two user messages (one of them an example), filter 2 drops both example turns, and filter 3 keeps human and AI messages but excludes the one with id \"3\"."
      }
    },
    {
      "t": "p",
      "zh": "其实这就是第 06 节学过的**列表推导式**加上 `if` 条件（`in` 的用法回顾 18 节）。用普通字典模拟一遍，在网页里点 ▶ 运行看看结果是不是一样：",
      "en": "Under the hood this is just a **list comprehension** with an `if`, as in lesson 06 (for `in`, see lesson 18). Here it is with plain dicts – press ▶ Run and compare the results:"
    },
    {
      "t": "code",
      "file": "filter_by_hand.py",
      "code": {
        "zh": "tagged = [\n    {\"type\": \"system\", \"name\": None, \"id\": \"1\", \"content\": \"你是一个简洁的中文助手。\"},\n    {\"type\": \"human\", \"name\": \"example_user\", \"id\": \"2\", \"content\": \"（示范）把“谢谢”翻译成英文\"},\n    {\"type\": \"ai\", \"name\": \"example_assistant\", \"id\": \"3\", \"content\": \"（示范）Thank you.\"},\n    {\"type\": \"human\", \"name\": \"xiaoming\", \"id\": \"4\", \"content\": \"把“早上好”翻译成英文\"},\n    {\"type\": \"ai\", \"name\": \"assistant\", \"id\": \"5\", \"content\": \"Good morning.\"},\n]\n\nonly_human = [m for m in tagged if m[\"type\"] == \"human\"]\nno_examples = [m for m in tagged if m[\"name\"] not in (\"example_user\", \"example_assistant\")]\ncombo = [m for m in tagged if m[\"type\"] in (\"human\", \"ai\") and m[\"id\"] != \"3\"]\n\nprint([m[\"id\"] for m in only_human])     # ['2', '4']\nprint([m[\"id\"] for m in no_examples])    # ['1', '4', '5']\nprint([m[\"id\"] for m in combo])          # ['2', '4', '5']",
        "en": "tagged = [\n    {\"type\": \"system\", \"name\": None, \"id\": \"1\", \"content\": \"You are a concise assistant.\"},\n    {\"type\": \"human\", \"name\": \"example_user\", \"id\": \"2\", \"content\": \"(example) Translate 'gracias' into English\"},\n    {\"type\": \"ai\", \"name\": \"example_assistant\", \"id\": \"3\", \"content\": \"(example) Thank you.\"},\n    {\"type\": \"human\", \"name\": \"xiaoming\", \"id\": \"4\", \"content\": \"Translate 'buenos días' into English\"},\n    {\"type\": \"ai\", \"name\": \"assistant\", \"id\": \"5\", \"content\": \"Good morning.\"},\n]\n\nonly_human = [m for m in tagged if m[\"type\"] == \"human\"]\nno_examples = [m for m in tagged if m[\"name\"] not in (\"example_user\", \"example_assistant\")]\ncombo = [m for m in tagged if m[\"type\"] in (\"human\", \"ai\") and m[\"id\"] != \"3\"]\n\nprint([m[\"id\"] for m in only_human])     # ['2', '4']\nprint([m[\"id\"] for m in no_examples])    # ['1', '4', '5']\nprint([m[\"id\"] for m in combo])          # ['2', '4', '5']"
      },
      "run": true
    },
    {
      "t": "warn",
      "zh": "类型要写 `\"human\"` / `\"ai\"`，不是 OpenAI 格式里的 `\"user\"` / `\"assistant\"`：`filter_messages(tagged, include_types=\"user\")` 不报错，但会返回空列表。另外，没打标签的消息 `name` 是 `None`：用 `include_names=[\"xiaoming\"]` 筛选时，没有名字的 system 消息也会被一起去掉。",
      "en": "Types are `\"human\"` / `\"ai\"`, not OpenAI's `\"user\"` / `\"assistant\"`: `filter_messages(tagged, include_types=\"user\")` raises no error but returns an empty list. Also, an untagged message has `name` set to `None`: when you filter with `include_names=[\"xiaoming\"]`, the unnamed system message is dropped as well."
    },
    {
      "t": "check",
      "q": {
        "zh": "`filter_messages(tagged, include_types=[HumanMessage, AIMessage], exclude_ids=[\"3\"])` 会得到？",
        "en": "What does `filter_messages(tagged, include_types=[HumanMessage, AIMessage], exclude_ids=[\"3\"])` return?"
      },
      "options": [
        {
          "zh": "所有用户和 AI 的消息，但去掉 id 为 \"3\" 的那条",
          "en": "All human and AI messages except the one with id \"3\""
        },
        {
          "zh": "只有 id 为 \"3\" 的消息",
          "en": "Only the message with id \"3\""
        },
        {
          "zh": "所有消息，包括 system",
          "en": "Every message, including system"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "几个条件同时生效：先要求类型是人或 AI（所以 system 被去掉），再排除 id 为 \"3\" 的那条。",
        "en": "All conditions apply together: the type must be human or AI (so system goes), and the message with id \"3\" is excluded."
      }
    },
    {
      "t": "h",
      "zh": "四、视频的思考题：什么时候需要自定义 name / id？",
      "en": "4. The video's question: when do custom name / id tags help?"
    },
    {
      "t": "p",
      "zh": "[▶ 06:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=48&t=380) 讲师承认这样演示看起来很抽象，于是留了一道题：你能想出一个需要按自己定义的 id 或 name 来筛选多轮对话历史的应用吗？他说场景其实很多，答案留到了答疑环节。这里给几个常见的思路，供你对照自己的想法：\n- **样例对话（few-shot）**：在历史开头放几轮示范问答，`name` 标成 `example_user` / `example_assistant`。保存历史、做总结、统计用户问题时，用 `exclude_names` 把示范去掉。\n- **多人或多个智能体共用一段历史**：群聊里有好几个用户，或者像第 24 节的网状架构那样几个 Agent 轮流发言，用 `name` 标出是谁说的；轮到某个 Agent 时，只给它看和它有关的消息。\n- **撤回某一轮**：用户说「刚才那句不算」，按 `id` 把那一轮排除掉。\n- **只要用户的问题**：生成对话标题、统计常见问题时，用 `include_types=\"human\"` 只取用户说的话。",
      "en": "[▶ 06:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=48&t=380) The instructor admits the demo looks abstract, so he leaves a question: can you think of an app that needs to filter a multi-turn history by ids or names you define? He says there are plenty, and saves the answer for the Q&A. Here are a few common ideas to compare with your own:\n- **Few-shot examples**: put a few demo turns at the start of the history, with `name` set to `example_user` / `example_assistant`. When saving or summarising the history, or analysing the user's questions, drop them with `exclude_names`.\n- **Several users or agents sharing one history**: a group chat with several users, or several agents taking turns as in lesson 24's network architecture – tag who said what with `name`, and when it's an agent's turn, show it only the messages relevant to it.\n- **Undoing a turn**: the user says “ignore what I just said” – exclude that turn by `id`.\n- **Just the user's questions**: to title a conversation or find frequent questions, keep only what the user said with `include_types=\"human\"`."
    },
    {
      "t": "h",
      "zh": "五、补充：把剪裁后的历史交给模型",
      "en": "5. Extra: feeding the trimmed history to the model"
    },
    {
      "t": "p",
      "zh": "视频只演示了剪裁和筛选本身。剪裁、筛选的结果还是普通的消息列表，直接交给 `model.invoke(...)` 就行。用第二部分那段历史试一下：剪到 35 个 token（保留 system、从用户的话开始）时，「我叫小明」那一轮已经被剪掉，模型就答不出名字了。",
      "en": "The video only demonstrates trimming and filtering themselves. The result is still an ordinary message list – pass it straight to `model.invoke(...)`. Try it with the history from part 2: trimmed to 35 tokens (keeping system, starting on a human message), the “I'm Xiaoming” turn is gone, so the model can no longer tell the name."
    },
    {
      "t": "code",
      "file": "trim_then_call.py",
      "code": {
        "zh": "# 接着上面的 trim_demo.py：history、trim_messages、count_tokens_approximately 都来自那里\nfrom langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\ntrimmed = trim_messages(history, max_tokens=35, strategy=\"last\",\n                        token_counter=count_tokens_approximately,\n                        include_system=True, start_on=\"human\")\nprint(model.invoke(trimmed).content)    # 我不知道你的名字，因为你还没有告诉我。\nprint(model.invoke(history).content)    # 你叫小明。\n\n# 不传 history 时，trim_messages 返回一个「剪裁器」，可以直接串在模型前面（| 在第 48 节讲）\ntrimmer = trim_messages(max_tokens=35, strategy=\"last\",\n                        token_counter=count_tokens_approximately,\n                        include_system=True, start_on=\"human\")\nchain = trimmer | model\nprint(chain.invoke(history).content)",
        "en": "# Continues trim_demo.py above: history, trim_messages and count_tokens_approximately come from there\nfrom langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\ntrimmed = trim_messages(history, max_tokens=35, strategy=\"last\",\n                        token_counter=count_tokens_approximately,\n                        include_system=True, start_on=\"human\")\nprint(model.invoke(trimmed).content)    # 我不知道你的名字，因为你还没有告诉我。 (\"I don't know your name - you haven't told me.\")\nprint(model.invoke(history).content)    # 你叫小明。 (\"Your name is Xiaoming.\")\n\n# Without history, trim_messages returns a \"trimmer\" you can put in front of the model (| is lesson 48)\ntrimmer = trim_messages(max_tokens=35, strategy=\"last\",\n                        token_counter=count_tokens_approximately,\n                        include_system=True, start_on=\"human\")\nchain = trimmer | model\nprint(chain.invoke(history).content)"
      },
      "note": {
        "zh": "回答是 `practice/l47_trim_filter_solution.py` 实际运行时的一次结果，每次措辞可能不同。`trimmer | model` 这种写法就是下一节 LCEL 的主角。",
        "en": "The answers are from one real run of `practice/l47_trim_filter_solution.py`; the wording varies. The `trimmer | model` form is the star of the next lesson, LCEL."
      }
    },
    {
      "t": "tip",
      "zh": "这一节只解决「发给模型之前，历史怎么剪、怎么挑」。至于每个用户的历史**存在哪、怎么按用户取出来**，视频放在了下一节（LCEL）的最后讲 `RunnableWithMessageHistory`。另外，在 LangChain 1.x 里做智能体时，官方更推荐用 LangGraph 的检查点保存历史（第 31、32 节），第 32 节还讲了用总结来压缩旧对话。",
      "en": "This lesson only covers “how to trim and pick the history before sending it”. As for **where each user's history is stored and how to load it per user**, the video covers that at the end of the next lesson (LCEL), with `RunnableWithMessageHistory`. For agents in LangChain 1.x, the recommended way to keep history is a LangGraph checkpointer (lessons 31–32); lesson 32 also shows summarising older turns."
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "`trim_messages(history, max_tokens=50, strategy=\"last\", token_counter=...)` 保留的是哪些消息？",
        "en": "Which messages does `trim_messages(history, max_tokens=50, strategy=\"last\", token_counter=...)` keep?"
      },
      "options": [
        {
          "zh": "最早的几条，总共不超过 50 个 token",
          "en": "The earliest ones, up to 50 tokens"
        },
        {
          "zh": "最近的几条，总共不超过 50 个 token",
          "en": "The latest ones, up to 50 tokens"
        },
        {
          "zh": "最长的几条",
          "en": "The longest ones"
        },
        {
          "zh": "随机挑选，总共 50 条",
          "en": "50 random messages"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "`\"last\"` 从最后一条往前数，直到再加一条就超出 `max_tokens` 为止；`\"first\"` 则从最前面开始保留。",
        "en": "`\"last\"` counts back from the end until one more message would exceed `max_tokens`; `\"first\"` keeps from the start instead."
      }
    },
    {
      "q": {
        "zh": "用 DeepSeek 时，下面哪种 `token_counter` 写法**会报错**？",
        "en": "With DeepSeek, which `token_counter` **raises an error**?"
      },
      "options": [
        {
          "zh": "`token_counter=count_tokens_approximately`（估算）",
          "en": "`token_counter=count_tokens_approximately` (estimate)"
        },
        {
          "zh": "`token_counter=\"approximate\"`",
          "en": "`token_counter=\"approximate\"`"
        },
        {
          "zh": "`token_counter=len`（按条数算）",
          "en": "`token_counter=len` (counts messages)"
        },
        {
          "zh": "`token_counter=ChatDeepSeek(model=MODEL, api_key=API_KEY)`（像视频那样用模型对象数）",
          "en": "`token_counter=ChatDeepSeek(model=MODEL, api_key=API_KEY)` (a model object, as in the video)"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "模型对象数 token 要靠它自己的分词规则，`deepseek-flash` 没有实现，会报 `NotImplementedError`。其余三种都能用。",
        "en": "A model object counts tokens with its own tokenizer, which isn't implemented for `deepseek-flash` – `NotImplementedError`. The other three work."
      }
    },
    {
      "q": {
        "zh": "`allow_partial=True` 的作用是？",
        "en": "What does `allow_partial=True` do?"
      },
      "options": [
        {
          "zh": "额度放不下一整条消息时，允许只保留它的一部分（按换行拆，留后面的）",
          "en": "When a whole message doesn't fit, part of it may be kept (split on line breaks, keeping the end)"
        },
        {
          "zh": "允许结果稍微超过 `max_tokens`",
          "en": "The result may exceed `max_tokens` slightly"
        },
        {
          "zh": "允许把 system 消息剪掉",
          "en": "The system message may be dropped"
        },
        {
          "zh": "允许打乱消息顺序",
          "en": "Messages may be reordered"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "视频里加上 `allow_partial` 后，结果变成 system 加最后一轮；本课的例子里，网站列表那条 AI 消息只留下了最后两行。",
        "en": "In the video, adding `allow_partial` gives system plus the last round; in this lesson's example, only the last two lines of the list-of-sites reply remain."
      }
    },
    {
      "q": {
        "zh": "剪裁时加 `start_on=\"human\"`（补充内容）是为了什么？",
        "en": "What is `start_on=\"human\"` (extra material) for when trimming?"
      },
      "options": [
        {
          "zh": "让模型只回答人类的问题",
          "en": "So the model only answers humans"
        },
        {
          "zh": "把所有 AI 消息删掉",
          "en": "To delete every AI message"
        },
        {
          "zh": "让剪下来的历史（system 之外）从用户的话开始，不会以一条没头没尾的 AI 回答开头",
          "en": "So the kept history (after system) starts with the user, not with an AI reply that lost its question"
        },
        {
          "zh": "加快剪裁速度",
          "en": "To trim faster"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "从后往前剪的时候，切口可能落在一问一答的中间。`start_on=\"human\"` 会继续往后丢，直到第一条是用户的话。",
        "en": "Trimming from the end can cut between a question and its answer. `start_on=\"human\"` keeps dropping until the first message is the user's."
      }
    },
    {
      "q": {
        "zh": "`filter_messages(tagged, include_types=\"user\")` 的结果是？",
        "en": "What does `filter_messages(tagged, include_types=\"user\")` return?"
      },
      "options": [
        {
          "zh": "所有用户消息",
          "en": "All user messages"
        },
        {
          "zh": "报错：参数不对",
          "en": "An error: wrong parameter"
        },
        {
          "zh": "所有消息",
          "en": "Every message"
        },
        {
          "zh": "空列表：LangChain 里用户消息的类型叫 `\"human\"`",
          "en": "An empty list: in LangChain the user's type is `\"human\"`"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "LangChain 消息的 `type` 是 `human`、`ai`、`system`、`tool`。写 `\"user\"` 不会报错，只是一条也匹配不上。",
        "en": "LangChain message types are `human`, `ai`, `system`, `tool`. `\"user\"` raises no error; it just matches nothing."
      }
    },
    {
      "q": {
        "zh": "视频的思考题：下面哪个场景最适合用自定义的 `name` 标签加 `exclude_names`？",
        "en": "The video's question: which case suits custom `name` tags plus `exclude_names` best?"
      },
      "options": [
        {
          "zh": "把历史按时间排序",
          "en": "Sorting the history by time"
        },
        {
          "zh": "保存或总结历史前，去掉开头那几轮 few-shot 示范对话",
          "en": "Dropping the few-shot demo turns at the start before saving or summarising"
        },
        {
          "zh": "统计一共聊了多少个 token",
          "en": "Counting the total tokens"
        },
        {
          "zh": "把 AI 的回答翻译成英文",
          "en": "Translating the AI's replies into English"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "示范对话标上 `example_*` 这样的名字，需要时用 `exclude_names` 一次去掉，不影响真正的对话。",
        "en": "Tag demo turns with names like `example_*` and drop them with `exclude_names` when needed, leaving the real conversation intact."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "剪裁历史（视频的第二步）",
        "en": "Trim the history (the video's second step)"
      },
      "code": "trimmed = [[trim_messages]](\n    history,\n    [[max_tokens]]=35,\n    strategy=\"[[last]]\",\n    token_counter=[[count_tokens_approximately|\"approximate\"]],\n    [[include_system]]=True,\n    [[allow_partial]]=True,\n)\nprint(model.[[invoke]](trimmed).content)",
      "explain": {
        "zh": "从后往前保留不超过 35 个 token；DeepSeek 用估算计数；system 永远保留；放不下的消息允许只留一部分。",
        "en": "Keep up to 35 tokens from the end; count approximately for DeepSeek; always keep system; a message that doesn't fit may be kept in part."
      }
    },
    {
      "title": {
        "zh": "筛选历史（视频的三个例子）",
        "en": "Filter the history (the video's three examples)"
      },
      "code": "user_only = filter_messages(tagged, [[include_types]]=\"[[human]]\")\nclean = filter_messages(tagged, [[exclude_names]]=[\"example_user\", \"example_assistant\"])\ncombo = filter_messages(tagged, include_types=[HumanMessage, [[AIMessage]]], [[exclude_ids]]=[\"3\"])",
      "explain": {
        "zh": "三种条件（类型、名字、id）各有 include_ 和 exclude_ 两个参数，可以组合使用。",
        "en": "Each criterion (type, name, id) has an include_ and an exclude_ parameter, and they combine."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：筛选 + 剪裁 + 调用模型",
        "en": "Write it: filter + trim + call the model"
      },
      "task": {
        "zh": "按注释补全：\n1. 用 `filter_messages` 按名字去掉两条示范消息，得到 `clean`\n2. 用 `trim_messages` 剪裁 `clean`：最多 25 个 token、从后往前、估算计数、保留 system、从用户的话开始，得到 `trimmed`\n3. 用 `ChatDeepSeek` 回答 `trimmed`，打印 `.content`\n\n这段代码要在本地运行（`practice` 文件夹、`.venv`，调用 1 次模型）。想一想：剪到 25 个 token 后，模型还知道你的名字吗？",
        "en": "Complete the comments:\n1. drop the two example messages by name with `filter_messages` → `clean`\n2. trim `clean` with `trim_messages`: at most 25 tokens, from the end, approximate counting, keep system, start on a human message → `trimmed`\n3. answer `trimmed` with `ChatDeepSeek` and print `.content`\n\nRun it locally (`practice` folder, `.venv`, one model call). Think: after trimming to 25 tokens, does the model still know your name?"
      },
      "starter": {
        "zh": "from langchain_core.messages import (\n    AIMessage,\n    HumanMessage,\n    SystemMessage,\n    filter_messages,\n    trim_messages,\n)\nfrom langchain_core.messages.utils import count_tokens_approximately\nfrom langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\nhistory = [\n    SystemMessage(\"你是一个简洁的中文助手。\", id=\"1\"),\n    HumanMessage(\"（示范）把“谢谢”翻译成英文\", id=\"2\", name=\"example_user\"),\n    AIMessage(\"（示范）Thank you.\", id=\"3\", name=\"example_assistant\"),\n    HumanMessage(\"你好，我叫小明。\", id=\"4\", name=\"xiaoming\"),\n    AIMessage(\"你好小明！有什么可以帮你？\", id=\"5\", name=\"assistant\"),\n    HumanMessage(\"我叫什么名字？\", id=\"6\", name=\"xiaoming\"),\n]\n\n# 1. 去掉两条示范消息（按名字排除），结果叫 clean\n\n# 2. 剪裁 clean：最多 25 个 token，保留最近的，用估算计数，保留 system，从用户的话开始\n\n# 3. 用 DeepSeek 模型回答剪裁后的历史，打印回答",
        "en": "from langchain_core.messages import (\n    AIMessage,\n    HumanMessage,\n    SystemMessage,\n    filter_messages,\n    trim_messages,\n)\nfrom langchain_core.messages.utils import count_tokens_approximately\nfrom langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\nhistory = [\n    SystemMessage(\"You are a concise assistant.\", id=\"1\"),\n    HumanMessage(\"(example) Translate 'gracias' into English\", id=\"2\", name=\"example_user\"),\n    AIMessage(\"(example) Thank you.\", id=\"3\", name=\"example_assistant\"),\n    HumanMessage(\"Hi, I'm Xiaoming.\", id=\"4\", name=\"xiaoming\"),\n    AIMessage(\"Hi Xiaoming! How can I help?\", id=\"5\", name=\"assistant\"),\n    HumanMessage(\"What's my name?\", id=\"6\", name=\"xiaoming\"),\n]\n\n# 1. drop the two example messages (exclude by name); call the result clean\n\n# 2. trim clean: at most 25 tokens, keep the latest, approximate counting, keep system, start on a human message\n\n# 3. have the DeepSeek model answer the trimmed history and print the reply"
      },
      "solution": {
        "zh": "from langchain_core.messages import (\n    AIMessage,\n    HumanMessage,\n    SystemMessage,\n    filter_messages,\n    trim_messages,\n)\nfrom langchain_core.messages.utils import count_tokens_approximately\nfrom langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\nhistory = [\n    SystemMessage(\"你是一个简洁的中文助手。\", id=\"1\"),\n    HumanMessage(\"（示范）把“谢谢”翻译成英文\", id=\"2\", name=\"example_user\"),\n    AIMessage(\"（示范）Thank you.\", id=\"3\", name=\"example_assistant\"),\n    HumanMessage(\"你好，我叫小明。\", id=\"4\", name=\"xiaoming\"),\n    AIMessage(\"你好小明！有什么可以帮你？\", id=\"5\", name=\"assistant\"),\n    HumanMessage(\"我叫什么名字？\", id=\"6\", name=\"xiaoming\"),\n]\n\n# 1. 去掉两条示范消息（按名字排除），结果叫 clean\nclean = filter_messages(history, exclude_names=[\"example_user\", \"example_assistant\"])\n\n# 2. 剪裁 clean：最多 25 个 token，保留最近的，用估算计数，保留 system，从用户的话开始\ntrimmed = trim_messages(\n    clean,\n    max_tokens=25,\n    strategy=\"last\",\n    token_counter=count_tokens_approximately,\n    include_system=True,\n    start_on=\"human\",\n)\n\n# 3. 用 DeepSeek 模型回答剪裁后的历史，打印回答\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\nprint(model.invoke(trimmed).content)\n# 剪完只剩 system 和最后那句「我叫什么名字？」（count_tokens_approximately(clean) 是 35，超过了 25），\n# 自我介绍那一轮已经被剪掉，所以模型答不出名字。",
        "en": "from langchain_core.messages import (\n    AIMessage,\n    HumanMessage,\n    SystemMessage,\n    filter_messages,\n    trim_messages,\n)\nfrom langchain_core.messages.utils import count_tokens_approximately\nfrom langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\nhistory = [\n    SystemMessage(\"You are a concise assistant.\", id=\"1\"),\n    HumanMessage(\"(example) Translate 'gracias' into English\", id=\"2\", name=\"example_user\"),\n    AIMessage(\"(example) Thank you.\", id=\"3\", name=\"example_assistant\"),\n    HumanMessage(\"Hi, I'm Xiaoming.\", id=\"4\", name=\"xiaoming\"),\n    AIMessage(\"Hi Xiaoming! How can I help?\", id=\"5\", name=\"assistant\"),\n    HumanMessage(\"What's my name?\", id=\"6\", name=\"xiaoming\"),\n]\n\n# 1. drop the two example messages (exclude by name); call the result clean\nclean = filter_messages(history, exclude_names=[\"example_user\", \"example_assistant\"])\n\n# 2. trim clean: at most 25 tokens, keep the latest, approximate counting, keep system, start on a human message\ntrimmed = trim_messages(\n    clean,\n    max_tokens=25,\n    strategy=\"last\",\n    token_counter=count_tokens_approximately,\n    include_system=True,\n    start_on=\"human\",\n)\n\n# 3. have the DeepSeek model answer the trimmed history and print the reply\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\nprint(model.invoke(trimmed).content)\n# Only system and the last \"What's my name?\" are left (count_tokens_approximately(clean) is 48 here, over 25);\n# the self-introduction turn has been cut, so the model can't tell the name."
      },
      "checks": [
        {
          "zh": "用 `filter_messages` 按名字排除示范",
          "en": "Excludes the examples by name with `filter_messages`",
          "re": "filter_messages\\([\\s\\S]*?exclude_names\\s*=\\s*\\["
        },
        {
          "zh": "调用了 `trim_messages(...)` 剪裁 clean",
          "en": "Calls `trim_messages(...)` on clean",
          "re": "trim_messages\\(\\s*\\n?\\s*clean"
        },
        {
          "zh": "设置 `max_tokens`",
          "en": "Sets `max_tokens`",
          "re": "max_tokens\\s*=\\s*\\d+"
        },
        {
          "zh": "`strategy=\"last\"`",
          "en": "`strategy=\"last\"`",
          "re": "strategy\\s*=\\s*[\\\"']last[\\\"']"
        },
        {
          "zh": "用估算方式数 token",
          "en": "Counts tokens approximately",
          "re": "token_counter\\s*=\\s*(count_tokens_approximately|[\\\"']approximate[\\\"'])"
        },
        {
          "zh": "`include_system=True`",
          "en": "`include_system=True`",
          "re": "include_system\\s*=\\s*True"
        },
        {
          "zh": "`start_on=\"human\"`",
          "en": "`start_on=\"human\"`",
          "re": "start_on\\s*=\\s*[\\\"']human[\\\"']"
        },
        {
          "zh": "用剪裁后的历史调用模型",
          "en": "Calls the model with the trimmed history",
          "re": "\\.invoke\\(\\s*trimmed\\s*\\)"
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "照抄视频把模型对象传给 `token_counter`，换成 `ChatDeepSeek(...)` 后报 `NotImplementedError`；改用 `count_tokens_approximately` 或 `\"approximate\"`。",
      "en": "Copying the video's model-object `token_counter` with `ChatDeepSeek(...)` – `NotImplementedError`; use `count_tokens_approximately` or `\"approximate\"`."
    },
    {
      "zh": "忘了 `include_system=True`，system 被剪掉，机器人忘了自己的角色和规则。",
      "en": "Forgetting `include_system=True`: the system message is cut and the bot forgets its role and rules."
    },
    {
      "zh": "没加 `start_on=\"human\"`，剪完的历史以一条没头没尾的 AI 回答（甚至孤立的工具结果）开头。",
      "en": "No `start_on=\"human\"`: the trimmed history starts with an AI reply (or even an orphaned tool result) that lost its question."
    },
    {
      "zh": "以为 `trim_messages` 会修改原列表。它返回新列表；想真正缩短保存的历史，要把结果赋值回去。",
      "en": "Assuming `trim_messages` changes the original list. It returns a new one; assign the result back if you want the stored history shortened."
    },
    {
      "zh": "类型写成 `\"user\"` / `\"assistant\"`：不报错，但一条也匹配不上。LangChain 里是 `\"human\"` / `\"ai\"`。",
      "en": "Writing `\"user\"` / `\"assistant\"` as types: no error, but nothing matches. LangChain uses `\"human\"` / `\"ai\"`."
    },
    {
      "zh": "用 `include_names` 筛选时忘了没打标签的消息 `name` 是 `None`，结果 system 之类没有名字的消息全被去掉。",
      "en": "Filtering with `include_names` and forgetting that untagged messages have `name=None`, so unnamed ones such as system disappear."
    },
    {
      "zh": "估算计数对中文偏少（例子里估 65，实际按 gpt-4o-mini 数是 105）：按估算刚好卡在上限，实际 token 可能已经超了，要留余量。",
      "en": "Approximate counting underestimates Chinese (65 estimated vs 105 by gpt-4o-mini in the example): a history right at the estimated limit may really be over it – leave a margin."
    }
  ],
  "recap": [
    {
      "zh": "对话历史 = 消息列表；为了省钱、保持可控、不超窗口，要剪裁（截掉旧的）或筛选（挑有用的）。",
      "en": "Chat history = a list of messages; to save money, keep control and stay within the context window, trim it (cut the old) or filter it (pick the useful)."
    },
    {
      "zh": "`trim_messages`：`max_tokens` + `strategy=\"last\"` + `token_counter`；`include_system=True` 保住 system，`allow_partial=True` 允许只留半条消息。",
      "en": "`trim_messages`: `max_tokens` + `strategy=\"last\"` + `token_counter`; `include_system=True` keeps system, `allow_partial=True` allows part of a message."
    },
    {
      "zh": "视频用模型对象数 token；DeepSeek 用 `count_tokens_approximately`（对中文估少，要留余量）。",
      "en": "The video counts tokens with a model object; with DeepSeek use `count_tokens_approximately` (it underestimates Chinese – leave a margin)."
    },
    {
      "zh": "`name`、`id` 是你自己定义的标签；`filter_messages` 按类型 / 名字 / id 做 include 或 exclude，可以组合。",
      "en": "`name` and `id` are your own tags; `filter_messages` includes or excludes by type / name / id, and they combine."
    },
    {
      "zh": "剪裁、筛选的结果还是消息列表，直接交给 `model.invoke(...)`；补充：`start_on=\"human\"` 让历史从用户的话开始。",
      "en": "Trimmed or filtered results are still message lists for `model.invoke(...)`; extra: `start_on=\"human\"` makes the history start with the user."
    },
    {
      "zh": "按用户存取历史在第 48 节（`RunnableWithMessageHistory`）；智能体的记忆推荐用 LangGraph 检查点（第 31、32 节）。",
      "en": "Storing and loading history per user comes in lesson 48 (`RunnableWithMessageHistory`); for agents, LangGraph checkpointers are recommended (lessons 31–32)."
    }
  ],
  "files": [
    {
      "path": "practice/l47_trim_filter_todo.py",
      "zh": "练习：按 TODO 剪裁一段历史、筛选一段带标签的历史，最后调用 1 次模型。",
      "en": "Exercise: trim one history and filter a tagged one following the TODOs, then make one model call."
    },
    {
      "path": "practice/l47_trim_filter_solution.py",
      "zh": "参考答案：打印视频那两步剪裁、补充的 `start_on` 和三种筛选的结果，并对比剪裁前后模型能否答出名字（调用 2 次模型）。",
      "en": "Solution: prints the video's two trimming steps, the extra `start_on` and the three filters, then compares whether the model can tell your name before and after trimming (2 model calls)."
    }
  ]
});
