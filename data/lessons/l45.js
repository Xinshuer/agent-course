COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l45",
  "priority": "core",
  "handwrite": true,
  "studyMinutes": 75,
  "source": "subtitle",
  "summary": {
    "zh": "这一集讲 LangChain 里最常用的一块：模型的输入和输出。跟着视频的顺序：先用统一的模型类和消息类调用模型，换一家模型只改一行；再用提示词模板（`PromptTemplate`、`ChatPromptTemplate`、`MessagesPlaceholder`、`from_file`）组织输入；然后把输出变成结构化数据——`with_structured_output` 直接约定，或者先输出文字再用解析器解析，格式出错时让模型自动修复；最后用 `@tool` + `bind_tools` 完成一次工具调用。视频用 OpenAI 的模型，这里全部换成 DeepSeek，并标出每一处差别。",
    "en": "This episode covers the part of LangChain you'll use most: model input and output. In the video's order: call the model through uniform model and message classes, where switching providers changes one line; organise the input with prompt templates (`PromptTemplate`, `ChatPromptTemplate`, `MessagesPlaceholder`, `from_file`); turn the output into structured data – agreed up front with `with_structured_output`, or output as text first and then parsed with an output parser, with the model repairing it automatically when the format breaks; and finish with one round of tool calling via `@tool` + `bind_tools`. The video uses OpenAI models; these notes use DeepSeek throughout and mark every difference."
  },
  "goals": [
    {
      "zh": "用 `ChatDeepSeek`（或 `ChatOpenAI` + `base_url`）创建模型，用 `SystemMessage` / `HumanMessage` / `AIMessage` 组成多轮对话并 `invoke`；说清「换模型只换一个类」",
      "en": "Create a model with `ChatDeepSeek` (or `ChatOpenAI` + `base_url`), build a multi-turn conversation from `SystemMessage` / `HumanMessage` / `AIMessage` and `invoke` it; explain why switching models means changing one class"
    },
    {
      "zh": "用 `PromptTemplate`、`ChatPromptTemplate`（`format_messages`）、`MessagesPlaceholder`、`from_file` 写带槽的提示词，说清槽和 f-string 的区别",
      "en": "Write prompts with slots using `PromptTemplate`, `ChatPromptTemplate` (`format_messages`), `MessagesPlaceholder` and `from_file`, and explain how slots differ from f-strings"
    },
    {
      "zh": "用 `with_structured_output` 把回答直接变成 pydantic 对象或字典，知道 deepseek-flash 要关掉思考或改用 json_mode",
      "en": "Turn a reply straight into a pydantic object or a dict with `with_structured_output`, knowing deepseek-flash needs thinking off or json_mode"
    },
    {
      "zh": "用 `JsonOutputParser` / `PydanticOutputParser` 解析模型的文字输出，用 `OutputFixingParser` 自动纠错",
      "en": "Parse the model's text output with `JsonOutputParser` / `PydanticOutputParser`, and repair failures with `OutputFixingParser`"
    },
    {
      "zh": "用 `@tool` + `bind_tools` 完成一轮工具调用：执行工具，把 `ToolMessage` 交回模型",
      "en": "Complete a round of tool calling with `@tool` + `bind_tools`: run the tool and hand the `ToolMessage` back to the model"
    },
    {
      "zh": "不看资料，手写视频里的模型调用、三种模板、结构化输出和工具调用",
      "en": "Hand-write the video's model call, three templates, structured output and tool call without notes"
    }
  ],
  "blocks": [
    {
      "t": "video",
      "zh": "这一集约 36 分钟，是 LangChain 部分最长、最重要的一集。讲师顺着上一集那张图，从最基本的「输入 → 模型 → 输出」讲起，顺序如下（点时间可以跳到视频对应位置）：\n- [▶ 00:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=33) **模型封装**：用 `langchain_openai` 的 `ChatOpenAI`（OpenAI 的 gpt-4o-mini）`invoke` 一句话；[▶ 01:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=97) 用三种消息类组成多轮对话；[▶ 03:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=194) 换成百度千帆的文心模型，其余代码不动\n- [▶ 04:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=289) **提示词模板**：`PromptTemplate` 讲一个关于小明的笑话；[▶ 09:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=574) `ChatPromptTemplate`；[▶ 11:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=697) `MessagesPlaceholder` 把一段历史整个填进去；[▶ 15:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=917) 把提示词放进外部文件\n- [▶ 17:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1042) **输出封装**：pydantic 日期类 + `with_structured_output`；[▶ 21:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1292) 改用 JSON Schema；[▶ 23:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1385) `JsonOutputParser` / `PydanticOutputParser`；[▶ 26:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1579) `OutputFixingParser` 自动纠错\n- [▶ 30:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1832) **工具调用**：`@tool` + `bind_tools`，算「3 的 4 倍」\n- [▶ 34:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=2082) **小结**：这部分设计合理、值得借鉴；流式调用有坑，以后再讲\n\n视频连的是 OpenAI 的模型。这一节的代码全部换成 DeepSeek（`practice/llm.py` 里的 deepseek-flash），每一处和视频不同的地方都会标出来。",
      "en": "This ~36-minute episode is the longest and most important one in the LangChain part. Following the diagram from the previous episode, the instructor starts from the most basic “input → model → output”, in this order (click a time to jump to it in the video):\n- [▶ 00:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=33) **Model wrappers**: `invoke` one sentence with `ChatOpenAI` from `langchain_openai` (OpenAI's gpt-4o-mini); [▶ 01:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=97) a multi-turn conversation built from three message classes; [▶ 03:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=194) a switch to Baidu Qianfan's ERNIE model with the rest of the code untouched\n- [▶ 04:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=289) **Prompt templates**: `PromptTemplate` asks for a joke about Xiao Ming; [▶ 09:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=574) `ChatPromptTemplate`; [▶ 11:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=697) `MessagesPlaceholder` drops in a whole stretch of history; [▶ 15:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=917) prompts kept in an external file\n- [▶ 17:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1042) **Output wrappers**: a pydantic date class + `with_structured_output`; [▶ 21:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1292) the same with a JSON Schema; [▶ 23:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1385) `JsonOutputParser` / `PydanticOutputParser`; [▶ 26:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1579) automatic repair with `OutputFixingParser`\n- [▶ 30:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1832) **Tool calling**: `@tool` + `bind_tools` to work out “3 times 4”\n- [▶ 34:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=2082) **Wrap-up**: this part is well designed and worth copying; streaming has pitfalls, covered later\n\nThe video talks to OpenAI models. All code in these notes uses DeepSeek instead (deepseek-flash from `practice/llm.py`), and every place that differs from the video is marked."
    },
    {
      "t": "code",
      "file": "Model I/O",
      "lang": "text",
      "code": {
        "zh": "{变量}              例如 {\"subject\": \"小明\"}\n   │  提示词模板：PromptTemplate / ChatPromptTemplate / MessagesPlaceholder   ← 第四到七部分\n   ▼\n提示词 / 消息列表    [SystemMessage, HumanMessage, AIMessage, ...]\n   │  模型封装：ChatDeepSeek / ChatOpenAI 的 invoke                          ← 第一到三部分\n   │  （绑定了工具时，回答里是 tool_calls）                                   ← 第十一部分\n   ▼\nAIMessage           .content  .usage_metadata  .tool_calls\n   │  with_structured_output（第八部分）或 输出解析器（第九、十部分）\n   ▼\nstr / dict / 对象",
        "en": "{variables}         e.g. {\"subject\": \"Xiao Ming\"}\n   │  prompt templates: PromptTemplate / ChatPromptTemplate / MessagesPlaceholder   ← sections 4-7\n   ▼\nprompt / messages   [SystemMessage, HumanMessage, AIMessage, ...]\n   │  model wrapper: invoke on ChatDeepSeek / ChatOpenAI                         ← sections 1-3\n   │  (with tools bound, the reply holds tool_calls)                             ← section 11\n   ▼\nAIMessage           .content  .usage_metadata  .tool_calls\n   │  with_structured_output (section 8) or output parsers (sections 9-10)\n   ▼\nstr / dict / object"
      }
    },
    {
      "t": "h",
      "zh": "一、模型封装：换模型不用改代码",
      "en": "1. Model wrappers: switch models without rewriting code"
    },
    {
      "t": "p",
      "zh": "[▶ 00:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=33) 各家大模型的接口都不太一样，如果全靠手写，每接一个模型就要写一套代码。LangChain 的第一个工具就是**模型封装**：每家模型对应一个类，用法却完全一样——先创建模型对象，再调用 `invoke`。\n\n[▶ 01:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=65) 视频里的 hello world：从 `langchain_openai` 导入 `ChatOpenAI`，写上模型名 `gpt-4o-mini`（后面还可以直接加 `temperature` 这类参数），然后 `invoke` 一句话。我们用 DeepSeek 官方集成包里的 `ChatDeepSeek`，key 照旧从 `practice/llm.py` 导入：",
      "en": "[▶ 00:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=33) Every provider's API is a little different; done by hand, each new model means another batch of code. LangChain's first tool is the **model wrapper**: one class per provider, all used the same way – create a model object, then call `invoke`.\n\n[▶ 01:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=65) The video's hello world imports `ChatOpenAI` from `langchain_openai`, gives the model name `gpt-4o-mini` (settings such as `temperature` can be added right there), and `invoke`s one sentence. We use `ChatDeepSeek` from DeepSeek's official integration package, with the key imported from `practice/llm.py` as always:"
    },
    {
      "t": "code",
      "file": "hello.py",
      "code": {
        "zh": "from langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)   # 只是创建对象、保存设置，还没有发请求\n\nreply = model.invoke(\"你是谁？用一句话回答。\")        # 这一行才真正调用模型\nprint(type(reply).__name__)    # AIMessage\nprint(reply.content)           # 回答的文字",
        "en": "from langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)   # only builds the object and stores settings - nothing sent yet\n\nreply = model.invoke(\"Who are you? Answer in one sentence.\")   # this line actually calls the model\nprint(type(reply).__name__)    # AIMessage\nprint(reply.content)           # the answer text"
      },
      "note": {
        "zh": "视频的写法是 `ChatOpenAI(model=\"gpt-4o-mini\")`（还可以加 `temperature` 等参数），要 OpenAI 的 key（环境变量 `OPENAI_API_KEY`），我们没有；`ChatDeepSeek` 用法一样。LangChain 的代码不能在浏览器里运行。第一到三部分的完整代码在 `practice/l45_model_io_solution.py`，用 `.venv` 运行（调用 3 次模型）。",
        "en": "The video writes `ChatOpenAI(model=\"gpt-4o-mini\")` (settings such as `temperature` can be added), which needs an OpenAI key (the `OPENAI_API_KEY` environment variable) that we don't have; `ChatDeepSeek` is used the same way. LangChain code can't run in the browser. The complete code for parts 1–3 is `practice/l45_model_io_solution.py`; run it with `.venv` (3 model calls)."
      }
    },
    {
      "t": "p",
      "zh": "`invoke` 返回一个 `AIMessage` 对象——04 节要写 `response.choices[0].message` 一层层取，现在一步就拿到了。常用的属性：\n\n| 属性 | 内容 | 对应 04 节的 |\n|---|---|---|\n| `reply.content` | 回答的文字 | `message.content` |\n| `reply.usage_metadata` | token 用量（字典）：`input_tokens`、`output_tokens`、`total_tokens` | `response.usage` |\n| `reply.response_metadata` | 厂商返回的其他信息：`finish_reason`、`model_name` 等 | `finish_reason` 等字段 |\n| `reply.tool_calls` | 模型要求调用的工具（第十一部分） | `message.tool_calls` |\n| `reply.additional_kwargs` | 额外字段：DeepSeek 的思考内容 `reasoning_content` 在这里 | `message.reasoning_content` |",
      "en": "`invoke` returns an `AIMessage` object – what took `response.choices[0].message`, layer by layer, in lesson 04 now arrives in one step. The attributes you'll use:\n\n| Attribute | What it holds | Lesson 04 equivalent |\n|---|---|---|\n| `reply.content` | The answer text | `message.content` |\n| `reply.usage_metadata` | Token usage (a dict): `input_tokens`, `output_tokens`, `total_tokens` | `response.usage` |\n| `reply.response_metadata` | Other provider info: `finish_reason`, `model_name`… | fields such as `finish_reason` |\n| `reply.tool_calls` | Tools the model wants called (part 11) | `message.tool_calls` |\n| `reply.additional_kwargs` | Extra fields: DeepSeek's thinking text `reasoning_content` lives here | `message.reasoning_content` |"
    },
    {
      "t": "code",
      "file": "read_reply.py",
      "code": {
        "zh": "print(reply.usage_metadata)\n# {'input_tokens': 51, 'output_tokens': 104, 'total_tokens': 155,\n#  'input_token_details': {'cache_read': 0}, 'output_token_details': {'reasoning': 93}}\nprint(reply.usage_metadata[\"total_tokens\"])        # 155\nprint(reply.response_metadata[\"finish_reason\"])    # stop\n\nthinking = reply.additional_kwargs.get(\"reasoning_content\", \"\")   # DeepSeek 的思考内容\nprint(thinking[:40])                               # 只看前 40 个字",
        "en": "print(reply.usage_metadata)\n# {'input_tokens': 51, 'output_tokens': 104, 'total_tokens': 155,\n#  'input_token_details': {'cache_read': 0}, 'output_token_details': {'reasoning': 93}}\nprint(reply.usage_metadata[\"total_tokens\"])        # 155\nprint(reply.response_metadata[\"finish_reason\"])    # stop\n\nthinking = reply.additional_kwargs.get(\"reasoning_content\", \"\")   # DeepSeek's thinking text\nprint(thinking[:40])                               # just the first 40 characters"
      },
      "note": {
        "zh": "注释里的数字是一次真实运行的结果（每次都不一样）。`reasoning: 93` 说明 104 个输出 token 里有 93 个花在思考上：回答只有一句话，思考却占了大头（04 节讲过思考也计费）。`usage_metadata` 和 `response_metadata` 是字典，用方括号；`reply` 本身是对象，用点号。",
        "en": "The numbers in the comments come from a real run (they change every time). `reasoning: 93` means 93 of the 104 output tokens went into thinking: the answer is a single sentence, yet thinking takes the lion's share (lesson 04 said thinking is billed too). `usage_metadata` and `response_metadata` are dicts, read with brackets; `reply` itself is an object, read with dots."
      }
    },
    {
      "t": "tip",
      "zh": "视频提到可以在创建模型时加 `temperature` 等参数，常用的还有 `max_tokens`、`timeout`、`max_retries`。但别忘了 04 节讲过的 deepseek-flash **思考模式**：思考时 `temperature` 基本不起作用，`max_tokens` 也把思考用的 token 算进去。需要时在创建模型时关掉思考：`ChatDeepSeek(model=MODEL, api_key=API_KEY, extra_body={\"thinking\": {\"type\": \"disabled\"}})`——第八部分的结构化输出就要用到。",
      "en": "The video notes that settings such as `temperature` go in when you create the model; `max_tokens`, `timeout` and `max_retries` are common too. Remember deepseek-flash's **thinking mode** from lesson 04: while thinking, `temperature` has little effect and `max_tokens` includes the thinking tokens. When needed, switch thinking off as you create the model: `ChatDeepSeek(model=MODEL, api_key=API_KEY, extra_body={\"thinking\": {\"type\": \"disabled\"}})` – part 8's structured output needs exactly that."
    },
    {
      "t": "h",
      "zh": "二、消息类：带角色的多轮对话",
      "en": "2. Message classes: a multi-turn conversation with roles"
    },
    {
      "t": "p",
      "zh": "[▶ 01:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=97) 只发一句话还不够：想带上对话历史、给每条消息分角色怎么办？回想 04、06 节，原生接口要的是一个列表，每一项有角色和内容。[▶ 02:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=130) LangChain 在这个基础上给每个角色做了一个消息类：\n\n| 消息类 | 原生接口里的 role |\n|---|---|\n| `SystemMessage` | `system` |\n| `HumanMessage` | `user` |\n| `AIMessage` | `assistant` |\n| `ToolMessage` | `tool`（第十一部分） |\n\n[▶ 02:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=163) 把这些对象排成一个列表，照样交给 `invoke`，就是一次带历史的调用。下面这个例子里，学员先在前面的对话中报上名字，最后再问模型「我叫什么」——模型要从历史里找答案，正好能看出历史有没有传过去：",
      "en": "[▶ 01:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=97) Sending a single sentence isn't enough: what if you want to bring the conversation history along and give each message a role? Recall lessons 04 and 06: the raw API takes a list in which every item has a role and content. [▶ 02:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=130) On top of that, LangChain gives each role its own message class:\n\n| Message class | role in the raw API |\n|---|---|\n| `SystemMessage` | `system` |\n| `HumanMessage` | `user` |\n| `AIMessage` | `assistant` |\n| `ToolMessage` | `tool` (part 11) |\n\n[▶ 02:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=163) Put these objects in a list and hand it to `invoke` as before, and you have a call with history. In the example below, the student gives their name earlier in the conversation and at the end asks the model “What is my name?” – the model has to find the answer in the history, which shows whether the history really got through:"
    },
    {
      "t": "code",
      "file": "messages.py",
      "code": {
        "zh": "from langchain_core.messages import AIMessage, HumanMessage, SystemMessage\n\nmessages = [\n    SystemMessage(content=\"你是 Python 入门课的助教，回答不超过 30 个字。\"),\n    HumanMessage(content=\"我是学员，我叫小明。\"),\n    AIMessage(content=\"欢迎你，小明！有问题随时问我。\"),   # 模型之前说过的话\n    HumanMessage(content=\"我叫什么名字？\"),\n]\nreply = model.invoke(messages)\nprint(reply.content)    # 能答出「小明」：前面的对话它都看到了",
        "en": "from langchain_core.messages import AIMessage, HumanMessage, SystemMessage\n\nmessages = [\n    SystemMessage(content=\"You are the teaching assistant of a Python beginners' course. Answer in under 30 words.\"),\n    HumanMessage(content=\"I'm a student. My name is Ming.\"),\n    AIMessage(content=\"Welcome, Ming! Ask me anything.\"),   # what the model said earlier\n    HumanMessage(content=\"What is my name?\"),\n]\nreply = model.invoke(messages)\nprint(reply.content)    # it can say \"Ming\": it sees the earlier turns"
      }
    },
    {
      "t": "p",
      "zh": "`invoke` 的输入很宽松，LangChain 会先把它统一成消息对象的列表：\n1. 一个字符串：当成一条 `HumanMessage`（第一部分就是这样）\n2. 消息对象的列表（上面的写法）\n3. `(角色, 内容)` 元组的列表，角色写 `\"system\"`、`\"human\"`、`\"ai\"`——最短，后面的聊天模板也能这样写",
      "en": "`invoke` is generous about its input; LangChain first turns it into a list of message objects:\n1. A string: treated as one `HumanMessage` (as in part 1)\n2. A list of message objects (as above)\n3. A list of `(role, content)` tuples with roles `\"system\"`, `\"human\"`, `\"ai\"` – the shortest form, which chat templates can use too"
    },
    {
      "t": "code",
      "file": "short_inputs.py",
      "code": {
        "zh": "model.invoke(\"你好\")                     # 一个字符串 = [HumanMessage(content=\"你好\")]\nmodel.invoke([\n    (\"system\", \"你是一名导游。\"),          # (角色, 内容) 元组；元组回顾 31 节\n    (\"human\", \"杭州有什么好玩的？\"),\n])",
        "en": "model.invoke(\"Hello\")                    # one string = [HumanMessage(content=\"Hello\")]\nmodel.invoke([\n    (\"system\", \"You are a tour guide.\"),  # (role, content) tuples; tuples: see lesson 31\n    (\"human\", \"What's fun in Hangzhou?\"),\n])"
      }
    },
    {
      "t": "p",
      "zh": "**补充：LangChain 替你做了什么？** 没有魔法：它把各种输入统一成消息，再按各家厂商要求的格式发出去。下面用 04 节的 openai 写法模仿一个最简单的 `invoke`，可以在网页里点 ▶ 运行（连的是模拟模型）。`for role, content in messages:` 每次取出一个二元组，直接拆给两个变量；`isinstance(messages, str)` 判断传进来的是不是字符串（回顾 25 节）。",
      "en": "**Extra: what does LangChain do for you?** No magic: it normalises every input into messages, then sends them in the format each provider expects. Below, lesson 04's openai code imitates the simplest possible `invoke`; press ▶ to run it in the browser (against the mock model). `for role, content in messages:` takes one pair at a time and splits it into two variables; `isinstance(messages, str)` checks whether a string was passed (see lesson 25)."
    },
    {
      "t": "code",
      "file": "invoke_by_hand.py",
      "run": "mock",
      "code": {
        "zh": "from llm import client, MODEL\n\n# LangChain 的角色名 → 04 节接口要的 role\nROLE = {\"system\": \"system\", \"human\": \"user\", \"user\": \"user\", \"ai\": \"assistant\", \"assistant\": \"assistant\"}\n\ndef to_dicts(messages):\n    \"\"\"把字符串或 (角色, 内容) 元组列表，统一成 04 节的字典列表。\"\"\"\n    if isinstance(messages, str):                  # 写法 1：字符串\n        return [{\"role\": \"user\", \"content\": messages}]\n    result = []\n    for role, content in messages:                 # 每个元组拆给两个变量\n        result.append({\"role\": ROLE[role], \"content\": content})\n    return result\n\ndef invoke(messages):\n    response = client.chat.completions.create(model=MODEL, messages=to_dicts(messages))\n    return response.choices[0].message\n\nprint(to_dicts(\"你好\"))\nprint(to_dicts([(\"system\", \"你是导游\"), (\"human\", \"杭州有什么好玩的？\")]))\nprint(invoke([(\"system\", \"你是导游\"), (\"human\", \"杭州有什么好玩的？\")]).content)",
        "en": "from llm import client, MODEL\n\n# LangChain role names -> the role values lesson 04's API expects\nROLE = {\"system\": \"system\", \"human\": \"user\", \"user\": \"user\", \"ai\": \"assistant\", \"assistant\": \"assistant\"}\n\ndef to_dicts(messages):\n    \"\"\"Turn a string or a list of (role, content) tuples into lesson 04's list of dicts.\"\"\"\n    if isinstance(messages, str):                  # form 1: a string\n        return [{\"role\": \"user\", \"content\": messages}]\n    result = []\n    for role, content in messages:                 # each tuple is split into two variables\n        result.append({\"role\": ROLE[role], \"content\": content})\n    return result\n\ndef invoke(messages):\n    response = client.chat.completions.create(model=MODEL, messages=to_dicts(messages))\n    return response.choices[0].message\n\nprint(to_dicts(\"Hello\"))\nprint(to_dicts([(\"system\", \"You are a tour guide\"), (\"human\", \"What's fun in Hangzhou?\")]))\nprint(invoke([(\"system\", \"You are a tour guide\"), (\"human\", \"What's fun in Hangzhou?\")]).content)"
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "执行 `model.invoke(\"你好\")` 时，LangChain 把字符串 `\"你好\"` 当成什么？",
        "en": "With `model.invoke(\"Hello\")`, what does LangChain turn the string into?"
      },
      "options": [
        {
          "zh": "一条 `SystemMessage`",
          "en": "A `SystemMessage`"
        },
        {
          "zh": "一条 `HumanMessage`（用户消息）",
          "en": "A `HumanMessage` (a user message)"
        },
        {
          "zh": "一条 `AIMessage`",
          "en": "An `AIMessage`"
        },
        {
          "zh": "报错：必须传消息列表",
          "en": "An error: a message list is required"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "只传一个字符串时，它就是用户说的那一句话，会被转成一条 `HumanMessage`（对应原生接口的 `user`）。",
        "en": "A lone string is what the user says, so it becomes one `HumanMessage` (the raw API's `user`)."
      }
    },
    {
      "t": "h",
      "zh": "三、换一个模型试试",
      "en": "3. Try a different model"
    },
    {
      "t": "p",
      "zh": "[▶ 03:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=194) 前两步的接口都很简单，讲师要强调的是背后的价值：**不同的模型，用同一套接口调用**。视频把模型换成了百度千帆的文心模型：从 LangChain 的第三方集成库里导入对应的类，填上百度的两段 key——其余代码，也就是消息列表和 `invoke`，一行没改。[▶ 04:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=257) 他还提到，讯飞星火、Mistral、Anthropic 的 Claude 等主流模型都有对应的类，换哪家就导入哪家的类、提供它的 key。\n\n我们没有百度的 key，换个办法演示同一件事：DeepSeek 的接口兼容 OpenAI，所以 `ChatOpenAI` 加上 `base_url` 也能连它。同一个消息列表，交给两个不同的类：",
      "en": "[▶ 03:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=194) The first two steps are simple; the point the instructor stresses is the value behind them: **different models, called through one interface**. The video switches to Baidu Qianfan's ERNIE model: import the matching class from LangChain's third-party integrations, give it Baidu's two-part key – and the rest of the code, the message list and `invoke`, doesn't change by a single line. [▶ 04:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=257) He adds that mainstream models such as iFlytek Spark, Mistral and Anthropic's Claude all have their own classes: import the provider's class and supply its key.\n\nWe have no Baidu key, so here is the same idea another way: DeepSeek's API is OpenAI-compatible, so `ChatOpenAI` with a `base_url` can reach it too. One message list, two different classes:"
    },
    {
      "t": "code",
      "file": "swap_model.py",
      "code": {
        "zh": "from langchain_deepseek import ChatDeepSeek\nfrom langchain_openai import ChatOpenAI\nfrom llm import API_KEY, BASE_URL, MODEL\n\nmodel_a = ChatDeepSeek(model=MODEL, api_key=API_KEY)\nmodel_b = ChatOpenAI(model=MODEL, api_key=API_KEY, base_url=BASE_URL)   # 换了一个类\n\nfor model in [model_a, model_b]:\n    reply = model.invoke(messages)        # 消息列表和这一行都不用改\n    print(type(model).__name__, reply.content)",
        "en": "from langchain_deepseek import ChatDeepSeek\nfrom langchain_openai import ChatOpenAI\nfrom llm import API_KEY, BASE_URL, MODEL\n\nmodel_a = ChatDeepSeek(model=MODEL, api_key=API_KEY)\nmodel_b = ChatOpenAI(model=MODEL, api_key=API_KEY, base_url=BASE_URL)   # a different class\n\nfor model in [model_a, model_b]:\n    reply = model.invoke(messages)        # neither the messages nor this line change\n    print(type(model).__name__, reply.content)"
      },
      "note": {
        "zh": "视频 vs 现在：视频用的 `QianfanChatEndpoint` 在你的环境里还能从 `langchain_community.chat_models` 导入，但真正创建对象时会报 `ImportError: qianfan package not found`（实测：要另装百度的 SDK，还要百度的 key），而且 `langchain-community` 正在逐步停止维护。百炼的 qwen-plus 也兼容 OpenAI，写法和上面一样：`ChatOpenAI(model=\"qwen-plus\", api_key=..., base_url=\"https://dashscope.aliyuncs.com/compatible-mode/v1\")`。另外，`init_chat_model(MODEL, model_provider=\"deepseek\", api_key=API_KEY)`（从 `langchain.chat_models` 导入）可以用字符串选厂商，得到的就是 `ChatDeepSeek` 对象。",
        "en": "Video vs now: the video's `QianfanChatEndpoint` still imports from `langchain_community.chat_models` in your environment, but creating one fails with `ImportError: qianfan package not found` (tested – it needs Baidu's SDK installed, plus Baidu keys), and `langchain-community` is being sunset. Bailian's qwen-plus is OpenAI-compatible too, written the same way: `ChatOpenAI(model=\"qwen-plus\", api_key=..., base_url=\"https://dashscope.aliyuncs.com/compatible-mode/v1\")`. Also, `init_chat_model(MODEL, model_provider=\"deepseek\", api_key=API_KEY)` (from `langchain.chat_models`) picks the provider by string and gives you a `ChatDeepSeek` object."
      }
    },
    {
      "t": "note",
      "zh": "补充：除了 `invoke`，模型还有 `stream`（边生成边打印：`for chunk in model.stream(\"介绍一下西湖\"): print(chunk.content, end=\"\", flush=True)`）和 `batch`（一次交一批输入）。这一集没有讲，48 节会和链一起讲。用 deepseek-flash 流式输出时，开头一段是思考阶段，`chunk.content` 是空字符串，所以屏幕会先停几秒。讲师在本集结尾也提醒：LangChain 的流式调用有坑。",
      "en": "Extra: besides `invoke`, models have `stream` (print as it is generated: `for chunk in model.stream(\"Tell me about West Lake\"): print(chunk.content, end=\"\", flush=True)`) and `batch` (several inputs at once). This episode doesn't cover them; lesson 48 does, together with chains. When deepseek-flash streams, the first stretch is its thinking phase with `chunk.content` empty, so the screen pauses a few seconds. The instructor also warns at the end of this episode that LangChain's streaming has pitfalls."
    },
    {
      "t": "h",
      "zh": "四、提示词模板 PromptTemplate",
      "en": "4. Prompt templates: PromptTemplate"
    },
    {
      "t": "p",
      "zh": "[▶ 04:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=289) 第二类工具是**提示词模板**。讲师借官方文档里的一张图解释它的思路：把提示词模板看成一个**函数**，模板里用花括号挖出来的「槽」（比如 `{topic}`）就是函数的参数。给参数赋值，得到一份完整的提示词；拿它调模型，得到输出；[▶ 05:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=353) 输出再解析成结构化数据，程序就能接着处理——这就是一条计算机能处理的流程。\n\n先用纯 Python 看清「槽」和 f-string 的区别——这是本节的 Python 重点：",
      "en": "[▶ 04:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=289) The second kind of tool is the **prompt template**. The instructor uses a diagram from the official docs to explain the idea: treat a prompt template as a **function**, and the “slots” carved out with braces (such as `{topic}`) are its parameters. Give the parameters values and you get a complete prompt; send it to the model and you get output; [▶ 05:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=353) parse that output into structured data and the program can carry on – a flow a computer can process.\n\nFirst, plain Python, to see how a slot differs from an f-string – this lesson's Python focus:"
    },
    {
      "t": "py",
      "title": {
        "zh": "f-string 和模板的槽：什么时候填值",
        "en": "f-strings vs template slots: when the value goes in"
      },
      "zh": "07 节已经用 `.format()` 填过 ReAct 的提示词模板，这里把它和 f-string 放在一起对比。两者都用 `{}`，但**填值的时间**完全不同：\n- **f-string**（04 节）：`f\"...{topic}...\"` 在**这一行运行时**就把 `topic` 的值填好了，得到一个普通字符串。所以 `topic` 必须事先存在。\n- **模板**：前面没有 `f` 的普通字符串 `\"...{topic}...\"`，`{topic}` 只是一个**占位符**（视频里叫「槽」）。之后调用 `.format(topic=...)` 才填值，同一个模板可以填很多次——就像调用一个函数。\n\n两个细节（07 节讲过）：\n- 少给一个变量会报 `KeyError`。\n- 模板里要写真正的花括号（比如 JSON 示例），要连写两个：`{{` 和 `}}`。\n\nLangChain 的 `PromptTemplate` 默认用的正是这套规则——讲师在视频里也说，熟悉 Python 的话，它的 `format` 和字符串自带的 `format` 是同一个用法。注意：LangChain 把这种格式叫作 `f-string`，但你写模板时**不要**在前面加 `f`。",
      "en": "Lesson 07 already filled the ReAct prompt template with `.format()`; here it is compared side by side with an f-string. Both use `{}`, but **when the value goes in** is completely different:\n- **f-string** (lesson 04): `f\"...{topic}...\"` fills in `topic` **when that line runs**, producing an ordinary string. So `topic` must already exist.\n- **Template**: a plain string with no `f`, `\"...{topic}...\"`, where `{topic}` is only a **placeholder** (the video calls it a “slot”). It gets filled later by `.format(topic=...)`, and one template can be filled many times – like calling a function.\n\nTwo details (from lesson 07):\n- Leaving out a variable raises `KeyError`.\n- To put real braces in a template (say, a JSON example), double them: `{{` and `}}`.\n\nLangChain's `PromptTemplate` uses exactly these rules by default – as the instructor says in the video, if you know Python, its `format` works just like a string's own `format`. Note: LangChain calls this format `f-string`, but you must **not** put an `f` in front of your template.",
      "code": {
        "zh": "topic = \"猫\"\nnow = f\"写一首关于{topic}的诗\"            # f-string：这一行运行时就填好了\nprint(now)\n\ntemplate = \"写一首关于{topic}的{style}诗\"   # 没有 f：{topic} 只是占位符（槽）\nprint(template)                            # 原样打印，什么都没填\n\nprint(template.format(topic=\"春天\", style=\"五言\"))\nprint(template.format(topic=\"大海\", style=\"现代\"))   # 同一个模板，换一组值\n\nvalues = {\"topic\": \"月亮\", \"style\": \"七言\"}\nprint(template.format(**values))           # 字典拆成关键字参数（回顾 05 节）\n\ntry:\n    template.format(topic=\"雪\")             # 少给了 style\nexcept KeyError as e:                       # try/except 回顾 07 节\n    print(\"缺少变量：\", e)\n\njson_hint = '只输出 JSON，例如 {{\"name\": \"...\"}}。主题：{topic}'\nprint(json_hint.format(topic=\"狗\"))         # {{ 和 }} 变成真正的花括号",
        "en": "topic = \"cats\"\nnow = f\"Write a poem about {topic}\"        # f-string: filled in when this line runs\nprint(now)\n\ntemplate = \"Write a {style} poem about {topic}\"   # no f: {topic} is just a placeholder (a slot)\nprint(template)                            # printed as-is, nothing filled in\n\nprint(template.format(topic=\"spring\", style=\"short\"))\nprint(template.format(topic=\"the sea\", style=\"modern\"))   # same template, new values\n\nvalues = {\"topic\": \"the moon\", \"style\": \"rhyming\"}\nprint(template.format(**values))           # a dict unpacked into keyword arguments (see lesson 05)\n\ntry:\n    template.format(topic=\"snow\")           # style is missing\nexcept KeyError as e:                       # try/except: see lesson 07\n    print(\"missing variable:\", e)\n\njson_hint = 'Reply in JSON only, e.g. {{\"name\": \"...\"}}. Topic: {topic}'\nprint(json_hint.format(topic=\"dogs\"))       # {{ and }} become real braces"
      },
      "note": {
        "zh": "为什么框架不直接用 f-string？因为写模板的时候，变量的值还不知道——要等用户提问才有。模板可以先写好、存起来、反复使用。",
        "en": "Why don't frameworks just use f-strings? Because when you write the template, the values don't exist yet – they arrive when the user asks. A template can be written once, stored, and reused."
      }
    },
    {
      "t": "p",
      "zh": "[▶ 06:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=375) 最基础的模板类就叫 `PromptTemplate`。`from_template` 接收一个带槽的字符串，`format` 给槽赋值；[▶ 07:28](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=448) 打印模板对象，能看到它自己找出来的槽（`input_variables`）。[▶ 07:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=478) 填好以后就是一个完整的字符串，直接拿去调模型。视频的例子是让模型讲一个关于「小明」的笑话：",
      "en": "[▶ 06:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=375) The most basic template class is `PromptTemplate`. `from_template` takes a string with slots, and `format` fills them; [▶ 07:28](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=448) printing the template object shows the slots it found by itself (`input_variables`). [▶ 07:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=478) Once filled, it is a complete string you can send straight to the model. The video's example asks the model for a joke about “Xiao Ming”:"
    },
    {
      "t": "code",
      "file": "prompt_template.py",
      "code": {
        "zh": "from langchain_core.prompts import PromptTemplate\n\ntemplate = PromptTemplate.from_template(\"给我讲一个关于{subject}的笑话\")\nprint(template)\n# input_variables=['subject'] input_types={} partial_variables={} template='给我讲一个关于{subject}的笑话'\n\nprompt = template.format(subject=\"小明\")    # 填槽，得到一个普通字符串\nprint(prompt)                               # 给我讲一个关于小明的笑话\n\nreply = model.invoke(prompt)                # 填好的字符串直接交给模型\nprint(reply.content)",
        "en": "from langchain_core.prompts import PromptTemplate\n\ntemplate = PromptTemplate.from_template(\"Tell me a joke about {subject}\")\nprint(template)\n# input_variables=['subject'] input_types={} partial_variables={} template='Tell me a joke about {subject}'\n\nprompt = template.format(subject=\"Xiao Ming\")   # fill the slot -> a plain string\nprint(prompt)                                   # Tell me a joke about Xiao Ming\n\nreply = model.invoke(prompt)                    # the filled string goes straight to the model\nprint(reply.content)"
      },
      "note": {
        "zh": "`format` 用关键字参数，返回字符串。模板还有一个 `invoke`：接收**一个字典**，返回 PromptValue，也能直接交给模型：`model.invoke(template.invoke({\"subject\": \"小明\"}))`。所有 LangChain 组件都有 `invoke`（44 节），48 节把它们连成链时靠的就是它。完整代码：`practice/l45_templates_solution.py`（第四到七部分，调用 3 次模型）。",
        "en": "`format` takes keyword arguments and returns a string. A template also has `invoke`: it takes **one dict** and returns a PromptValue, which can go straight to the model too: `model.invoke(template.invoke({\"subject\": \"Xiao Ming\"}))`. Every LangChain component has `invoke` (lesson 44), and that is what lesson 48 relies on to chain them. Full code: `practice/l45_templates_solution.py` (parts 4–7, 3 model calls)."
      }
    },
    {
      "t": "warn",
      "zh": "模板里直接写 JSON 示例会出错。实测：`PromptTemplate.from_template('输出格式：{\"name\": ...}')` 把 `\"name\"` 当成了一个槽，调用时报 `KeyError`。要写成 `{{\"name\": ...}}`。另外，模板字符串前面千万别加 `f`：那样 Python 会立刻去找同名变量，找不到就是 `NameError`。",
      "en": "Writing a JSON example straight into a template breaks it. Tested: `PromptTemplate.from_template('Format: {\"name\": ...}')` treats `\"name\"` as a slot and raises `KeyError` when called. Write `{{\"name\": ...}}` instead. And never put `f` in front of a template string: Python would look up the variables right away and fail with `NameError`."
    },
    {
      "t": "h",
      "zh": "五、聊天模板 ChatPromptTemplate",
      "en": "5. Chat templates: ChatPromptTemplate"
    },
    {
      "t": "p",
      "zh": "[▶ 09:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=542) 实际应用里，提示词常常是一串带角色的消息，槽可能出现在其中某几条里。自己实现要多写不少代码，LangChain 提供了现成的 `ChatPromptTemplate`。[▶ 09:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=574) 视频的写法：`from_messages` 接收一个列表，带槽的那条用 `SystemMessagePromptTemplate.from_template(...)`（用户那条用 `HumanMessagePromptTemplate`）；没有槽的固定内容，直接放一个普通的消息对象。[▶ 10:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=636) 填值用 `format_messages(...)`，每个槽都是一个关键字参数，得到的是一个**消息对象的列表**，直接交给 `invoke`。\n\n视频的例子是给助手设定身份（填在 system 里），用户新一轮的问题填在 human 里。下面照这个结构写一个书店客服（店名、客服名字和用户问题都是槽）：",
      "en": "[▶ 09:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=542) In real apps a prompt is often a run of messages with roles, with slots in some of them. Doing that yourself takes a fair bit of code, so LangChain offers a ready-made `ChatPromptTemplate`. [▶ 09:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=574) The video's style: `from_messages` takes a list; a message with slots is written `SystemMessagePromptTemplate.from_template(...)` (or `HumanMessagePromptTemplate` for the user's message); fixed text with no slots is just a plain message object. [▶ 10:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=636) Fill it with `format_messages(...)`, one keyword argument per slot, and you get a **list of message objects** to pass straight to `invoke`.\n\nThe video's example gives the assistant an identity (filled into the system message), while the user's new question goes into the human message. Below, the same structure becomes a bookshop's customer-service assistant (the shop name, the assistant's name and the user's question are all slots):"
    },
    {
      "t": "code",
      "file": "chat_template.py",
      "code": {
        "zh": "from langchain_core.prompts import (ChatPromptTemplate, HumanMessagePromptTemplate,\n                                    SystemMessagePromptTemplate)\n\nchat_template = ChatPromptTemplate.from_messages([\n    SystemMessagePromptTemplate.from_template(\"你是{shop}的客服助手，你的名字叫{name}。\"),\n    HumanMessagePromptTemplate.from_template(\"{query}\"),\n])\nmessages = chat_template.format_messages(shop=\"西湖书店\", name=\"小书\", query=\"你是谁？\")\nprint(messages)\n# [SystemMessage(content='你是西湖书店的客服助手，你的名字叫小书。', ...),\n#  HumanMessage(content='你是谁？', ...)]\nreply = model.invoke(messages)              # 消息列表直接交给模型\nprint(reply.content)",
        "en": "from langchain_core.prompts import (ChatPromptTemplate, HumanMessagePromptTemplate,\n                                    SystemMessagePromptTemplate)\n\nchat_template = ChatPromptTemplate.from_messages([\n    SystemMessagePromptTemplate.from_template(\"You are the customer-service assistant of {shop}. Your name is {name}.\"),\n    HumanMessagePromptTemplate.from_template(\"{query}\"),\n])\nmessages = chat_template.format_messages(shop=\"West Lake Books\", name=\"Booky\", query=\"Who are you?\")\nprint(messages)\n# [SystemMessage(content='You are the customer-service assistant of West Lake Books. Your name is Booky.', ...),\n#  HumanMessage(content='Who are you?', ...)]\nreply = model.invoke(messages)              # the message list goes straight to the model\nprint(reply.content)"
      }
    },
    {
      "t": "p",
      "zh": "更短的等价写法：每条消息写成 `(角色, 模板文字)` 元组，LangChain 自己判断里面有没有槽。官方文档和 48 节都用这种写法，两种都要认得：",
      "en": "A shorter equivalent: write each message as a `(role, template text)` tuple and LangChain works out whether it has slots. The official docs and lesson 48 use this form, so learn to recognise both:"
    },
    {
      "t": "code",
      "file": "chat_template_short.py",
      "code": {
        "zh": "chat_template = ChatPromptTemplate.from_messages([\n    (\"system\", \"你是{shop}的客服助手，你的名字叫{name}。\"),   # (角色, 模板文字)\n    (\"human\", \"{query}\"),\n])\nprompt_value = chat_template.invoke({\"shop\": \"西湖书店\", \"name\": \"小书\", \"query\": \"你是谁？\"})\nreply = model.invoke(prompt_value)",
        "en": "chat_template = ChatPromptTemplate.from_messages([\n    (\"system\", \"You are the customer-service assistant of {shop}. Your name is {name}.\"),   # (role, template text)\n    (\"human\", \"{query}\"),\n])\nprompt_value = chat_template.invoke({\"shop\": \"West Lake Books\", \"name\": \"Booky\", \"query\": \"Who are you?\"})\nreply = model.invoke(prompt_value)"
      },
      "note": {
        "zh": "对应关系：`PromptTemplate.format(...)` → 字符串；`ChatPromptTemplate.format_messages(...)` → 消息列表；两种模板的 `invoke({...})` → PromptValue。三种结果都能直接交给 `model.invoke`。",
        "en": "How they line up: `PromptTemplate.format(...)` → a string; `ChatPromptTemplate.format_messages(...)` → a message list; both templates' `invoke({...})` → a PromptValue. All three can go straight into `model.invoke`."
      }
    },
    {
      "t": "h",
      "zh": "六、MessagesPlaceholder：一整段历史当成一个槽",
      "en": "6. MessagesPlaceholder: a whole stretch of history as one slot"
    },
    {
      "t": "p",
      "zh": "[▶ 11:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=697) 再进一步：能不能把**一整段消息**做成一个槽？比如前面有 system，最后有一条 human，中间要动态塞进好几轮不同角色的对话。`MessagesPlaceholder` 就是干这个的：把它放在消息模板里，那个位置就空出来，填值时可以填进一个消息列表。\n\n[▶ 12:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=759) 视频的例子：最后一条 human 是带槽的指令「把你的回答翻译成{language}」，前面整段历史是一个槽 `history`。[▶ 13:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=791) 填值时，`history` 给两条消息——用户问「埃隆·马斯克是谁？」和 AI 的一段英文回答，`language` 给「中文」。[▶ 14:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=855) 模型就把上一轮的回答翻译成了中文：",
      "en": "[▶ 11:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=697) One step further: can **a whole stretch of messages** be one slot? Say there is a system message at the top and a human message at the end, with several turns from different roles to be inserted in between. That is what `MessagesPlaceholder` is for: put it in the message template and that spot is left open, to be filled with a list of messages.\n\n[▶ 12:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=759) The video's example: the last human message is an instruction with a slot, “translate your answer into {language}”, and all the history before it is one slot, `history`. [▶ 13:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=791) When filling it, `history` gets two messages – the user asking “Who is Elon Musk?” and an English answer from the AI – and `language` gets “Chinese”. [▶ 14:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=855) The model then translates its previous answer into Chinese:"
    },
    {
      "t": "code",
      "file": "placeholder.py",
      "code": {
        "zh": "from langchain_core.messages import AIMessage, HumanMessage\nfrom langchain_core.prompts import ChatPromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder\n\nchat_template = ChatPromptTemplate.from_messages([\n    MessagesPlaceholder(\"history\"),                 # 这一整段是一个槽\n    HumanMessagePromptTemplate.from_template(\"把你上面的回答翻译成{language}。\"),\n])\nhistory = [\n    HumanMessage(content=\"Who is Elon Musk?\"),\n    AIMessage(content=\"Elon Musk is an entrepreneur who runs Tesla and SpaceX.\"),\n]\nprompt_value = chat_template.invoke({\"history\": history, \"language\": \"中文\"})\nfor m in prompt_value.to_messages():\n    print(m.type, \"|\", m.content)\n# human | Who is Elon Musk?\n# ai | Elon Musk is an entrepreneur who runs Tesla and SpaceX.\n# human | 把你上面的回答翻译成中文。\n\nprint(model.invoke(prompt_value).content)\n# 实测：埃隆·马斯克是一位经营特斯拉和SpaceX的企业家。",
        "en": "from langchain_core.messages import AIMessage, HumanMessage\nfrom langchain_core.prompts import ChatPromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder\n\nchat_template = ChatPromptTemplate.from_messages([\n    MessagesPlaceholder(\"history\"),                 # this whole stretch is one slot\n    HumanMessagePromptTemplate.from_template(\"Translate your answer above into {language}.\"),\n])\nhistory = [\n    HumanMessage(content=\"Who is Elon Musk?\"),\n    AIMessage(content=\"Elon Musk is an entrepreneur who runs Tesla and SpaceX.\"),\n]\nprompt_value = chat_template.invoke({\"history\": history, \"language\": \"Chinese\"})\nfor m in prompt_value.to_messages():\n    print(m.type, \"|\", m.content)\n# human | Who is Elon Musk?\n# ai | Elon Musk is an entrepreneur who runs Tesla and SpaceX.\n# human | Translate your answer above into Chinese.\n\nprint(model.invoke(prompt_value).content)\n# tested: the same sentence came back in Chinese"
      },
      "note": {
        "zh": "`history` 必须是列表（消息对象，或 `(角色, 内容)` 元组）；传一个字符串会报 `ValueError: variable history should be a list of base messages`（实测），没有历史时传空列表 `[]`。旧写法 `chat_template.format_prompt(history=..., language=...)` 和 `invoke({...})` 效果一样。47 节管理对话历史、48 节给链加上历史，靠的都是这个占位符。",
        "en": "`history` must be a list (message objects, or `(role, content)` tuples); a string raises `ValueError: variable history should be a list of base messages` (tested); with no history, pass an empty list `[]`. The older `chat_template.format_prompt(history=..., language=...)` does the same as `invoke({...})`. Lesson 47's history management and lesson 48's chains with history both rely on this placeholder."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "`(\"human\", \"{question}\")` 和 `MessagesPlaceholder(\"history\")` 有什么区别？",
        "en": "How does `(\"human\", \"{question}\")` differ from `MessagesPlaceholder(\"history\")`?"
      },
      "options": [
        {
          "zh": "`{question}` 填进一段文字；`MessagesPlaceholder` 插入一个消息列表",
          "en": "`{question}` fills in a piece of text; `MessagesPlaceholder` inserts a list of messages"
        },
        {
          "zh": "没有区别，都是填文字",
          "en": "No difference – both fill in text"
        },
        {
          "zh": "`MessagesPlaceholder` 只能放 system 消息",
          "en": "`MessagesPlaceholder` holds only system messages"
        },
        {
          "zh": "`{question}` 只能写在 system 消息里",
          "en": "`{question}` may only appear in a system message"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "普通的槽替换的是一条消息里的文字；`MessagesPlaceholder` 在那个位置展开成好几条完整的消息（human、ai……）。",
        "en": "A normal slot replaces text inside one message; `MessagesPlaceholder` expands into several whole messages (human, ai…) at that spot."
      }
    },
    {
      "t": "h",
      "zh": "七、把提示词放进外部文件",
      "en": "7. Keep prompts in external files"
    },
    {
      "t": "p",
      "zh": "[▶ 14:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=887) 讲师先回到「模板就是带参数的函数」：每次给参数赋不同的值，同一份提示词就能完成不同的任务——活是模型干的，模板负责把指令组织好。\n\n[▶ 15:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=917) 不过到目前为止，模板都写在代码里。他建议，正式的项目最好把提示词从代码里剥离出来，放进外部文件单独管理：「自然语言的逻辑」和「代码的逻辑」分开，程序更好读、更好维护。[▶ 15:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=947) `PromptTemplate.from_file(路径)` 读入文件内容，用法和 `from_template` 一样。[▶ 16:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=978) 他还对比说，LlamaIndex 没有内置这个功能（自己写当然也行），LangChain 在这些小地方考虑得更周全。",
      "en": "[▶ 14:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=887) The instructor first returns to “a template is a function with parameters”: give the parameters different values each time and one prompt does different jobs – the model does the work, the template organises the instructions.\n\n[▶ 15:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=917) So far, though, every template lives in the code. He recommends that real projects pull prompts out of the code into external files managed on their own: “natural-language logic” and “code logic” stay apart, and the program is easier to read and maintain. [▶ 15:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=947) `PromptTemplate.from_file(path)` reads the file and works just like `from_template`. [▶ 16:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=978) He notes by comparison that LlamaIndex has no built-in equivalent (you could write one yourself), and that LangChain is more thorough about such small things."
    },
    {
      "t": "code",
      "file": "template_from_file.py",
      "code": {
        "zh": "from langchain_core.prompts import PromptTemplate\n\n# data/l45_guide_prompt.txt 的内容：\n# 你是一名{role}。请用不超过{limit}个字回答下面的问题。\n# 问题：{question}\nguide = PromptTemplate.from_file(\"data/l45_guide_prompt.txt\", encoding=\"utf-8\")\nprint(guide.input_variables)      # ['limit', 'question', 'role']\nprint(guide.format(role=\"杭州导游\", limit=30, question=\"西湖什么季节最好看？\"))",
        "en": "from langchain_core.prompts import PromptTemplate\n\n# Contents of data/l45_guide_prompt_en.txt:\n# You are a {role}. Answer the question below in under {limit} words.\n# Question: {question}\nguide = PromptTemplate.from_file(\"data/l45_guide_prompt_en.txt\", encoding=\"utf-8\")\nprint(guide.input_variables)      # ['limit', 'question', 'role']\nprint(guide.format(role=\"Hangzhou tour guide\", limit=30, question=\"When is West Lake at its best?\"))"
      },
      "note": {
        "zh": "两个坑（实测）：1. `encoding=\"utf-8\"` 不能省——不写的话 Windows 会按系统默认的 GBK 去读，中文模板会报错或变成乱码。2. 相对路径是相对于**运行时所在的文件夹**的，所以要在 `practice` 文件夹里运行。`practice/l45_templates_solution.py` 用 `Path(__file__).parent / \"data\"` 拼出路径，在哪里运行都不怕（pathlib 回顾 10 节）。",
        "en": "Two traps (tested): 1. Don't drop `encoding=\"utf-8\"` – without it Windows reads the file as GBK, and a Chinese template errors out or turns into garbage. 2. A relative path is relative to the **folder you run from**, so run this inside `practice`. `practice/l45_templates_solution.py` builds the path with `Path(__file__).parent / \"data\"`, which works from anywhere (pathlib: see lesson 10)."
      }
    },
    {
      "t": "h",
      "zh": "八、结构化输出 with_structured_output",
      "en": "8. Structured output: with_structured_output"
    },
    {
      "t": "p",
      "zh": "[▶ 17:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1042) 前面讲的都算「输入」，现在看「输出」。程序代码擅长处理结构化的数据，模型给的却是一段文字，所以常常要把回答变成一个对象。[▶ 18:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1105) 视频先用 pydantic 定义了想要的结构：一个日期类，有年、月、日，还有「公元前 / 公元后」（`BaseModel` 回顾 11 节的 Python 小课堂；`Field(description=...)` 是写给模型看的字段说明，12 节用过）：",
      "en": "[▶ 17:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1042) Everything so far has been “input”; now for “output”. Program code is good at handling structured data, but the model gives you a piece of text, so you often need to turn the answer into an object. [▶ 18:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1105) The video first defines the structure it wants with pydantic: a date class with a year, a month, a day and “BC / AD” (`BaseModel`: see the Python mini-lesson in lesson 11; `Field(description=...)` is a field description written for the model, used in lesson 12):"
    },
    {
      "t": "code",
      "file": "date_class.py",
      "code": {
        "zh": "from pydantic import BaseModel, Field\n\nclass Date(BaseModel):\n    \"\"\"从文字里提取出的一个日期\"\"\"\n    year: int = Field(description=\"年份，例如 2024\")\n    month: int = Field(description=\"月份，1 到 12\")\n    day: int = Field(description=\"日，1 到 31\")\n    era: str = Field(description=\"公元前写 BC，公元后写 AD\")",
        "en": "from pydantic import BaseModel, Field\n\nclass Date(BaseModel):\n    \"\"\"A date extracted from some text\"\"\"\n    year: int = Field(description=\"the year, e.g. 2024\")\n    month: int = Field(description=\"the month, 1 to 12\")\n    day: int = Field(description=\"the day, 1 to 31\")\n    era: str = Field(description=\"BC or AD\")"
      }
    },
    {
      "t": "p",
      "zh": "让模型按这个结构输出，有两条路：\n1. **直接约定**：调用模型时就要求它按结构输出——`with_structured_output`（本部分）\n2. **先文字、后解析**：模型照常输出文字（里面是一段 JSON），再用输出解析器把它解析出来（第九部分）\n\n[▶ 18:57](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1137) 先看第一条路。讲师介绍，OpenAI 的接口原生支持「只按指定格式输出 JSON」，但直接用要手写一大段格式定义（JSON Schema）。LangChain 把它封装成 `with_structured_output`：把类传进去，得到一个「带结构化输出能力」的新模型；[▶ 20:29](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1229) 再用一个「提取用户输入中的日期」的模板去调用它，[▶ 21:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1260) 结果直接就是 `Date` 对象，槽都填好了：",
      "en": "There are two ways to make the model follow this structure:\n1. **Agree on it up front**: ask for structured output when calling the model – `with_structured_output` (this part)\n2. **Text first, parse later**: let the model answer in text as usual (containing some JSON), then parse it with an output parser (part 9)\n\n[▶ 18:57](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1137) The first way. The instructor explains that OpenAI's API natively supports “output JSON in exactly this format”, but using it directly means writing a long format definition (a JSON Schema) by hand. LangChain wraps this as `with_structured_output`: pass in the class and you get a new model with structured output built in; [▶ 20:29](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1229) call it through a template that says “extract the date from the user's input”, [▶ 21:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1260) and the result is a `Date` object with every field filled:"
    },
    {
      "t": "code",
      "file": "structured_output.py",
      "code": {
        "zh": "from langchain_core.prompts import PromptTemplate\nfrom langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\n# deepseek-flash 要先关掉思考模式（原因见下表）\nfast_model = ChatDeepSeek(model=MODEL, api_key=API_KEY,\n                          extra_body={\"thinking\": {\"type\": \"disabled\"}})\nstructured_model = fast_model.with_structured_output(Date)   # 带结构化输出能力的新模型\n\nprompt = PromptTemplate.from_template(\"提取用户输入中的日期。\\n用户输入：{query}\")\nquery = \"2024年4月6日，我们全家去西湖划船，天气晴。\"\ndate = structured_model.invoke(prompt.invoke({\"query\": query}))\nprint(repr(date))              # 实测：Date(year=2024, month=4, day=6, era='AD')\nprint(date.year, date.era)     # 2024 AD —— 是对象，用点号取字段",
        "en": "from langchain_core.prompts import PromptTemplate\nfrom langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\n# deepseek-flash needs thinking switched off first (why: see the table below)\nfast_model = ChatDeepSeek(model=MODEL, api_key=API_KEY,\n                          extra_body={\"thinking\": {\"type\": \"disabled\"}})\nstructured_model = fast_model.with_structured_output(Date)   # a new model that returns structured output\n\nprompt = PromptTemplate.from_template(\"Extract the date from the user's input.\\nUser input: {query}\")\nquery = \"On 6 April 2024 our family went boating on West Lake; it was sunny.\"\ndate = structured_model.invoke(prompt.invoke({\"query\": query}))\nprint(repr(date))              # tested: Date(year=2024, month=4, day=6, era='AD')\nprint(date.year, date.era)     # 2024 AD - an object: read fields with dots"
      }
    },
    {
      "t": "p",
      "zh": "视频连的是 OpenAI 的模型（`ChatOpenAI`）。换成 deepseek-flash 时要注意 `with_structured_output` 的 `method` 参数（实现方式）：\n\n| method | 原理 | 用在 deepseek-flash 上 |\n|---|---|---|\n| `\"json_schema\"` | 接口原生的结构化输出，也就是讲师说的那个 OpenAI 功能；`ChatOpenAI` 的默认值 | DeepSeek 不支持，报 400——所以别用 `ChatOpenAI` 连 DeepSeek 再照抄视频这一步 |\n| `\"function_calling\"` | 把类变成一个工具，强制模型调用它；`ChatDeepSeek` 的默认值 | 思考模式下报 400：`Thinking mode does not support this tool_choice`；关掉思考就正常（上面的写法，实测） |\n| `\"json_mode\"` | 只要求接口输出 JSON，再按类解析 | 思考模式下也能用（实测），但提示词里要写明输出 JSON、有哪些字段 |",
      "en": "The video talks to an OpenAI model (`ChatOpenAI`). When you switch to deepseek-flash, mind `with_structured_output`'s `method` argument (how it is implemented):\n\n| method | How it works | On deepseek-flash |\n|---|---|---|\n| `\"json_schema\"` | The API's native structured output – the OpenAI feature the instructor mentions; `ChatOpenAI`'s default | DeepSeek doesn't support it: 400 – so don't point `ChatOpenAI` at DeepSeek and copy this step from the video |\n| `\"function_calling\"` | Turns the class into a tool and forces the model to call it; `ChatDeepSeek`'s default | 400 in thinking mode: `Thinking mode does not support this tool_choice`; fine with thinking off (the code above, tested) |\n| `\"json_mode\"` | Only asks the API for JSON, then parses it into the class | Works with thinking on (tested), but the prompt must ask for JSON and name the fields |"
    },
    {
      "t": "code",
      "file": "json_mode.py",
      "code": {
        "zh": "model = ChatDeepSeek(model=MODEL, api_key=API_KEY)       # 思考模式照常开着\njson_model = model.with_structured_output(Date, method=\"json_mode\")\ndate = json_model.invoke([\n    (\"system\", \"只输出一个 JSON 对象，字段：year、month、day（都是整数）和 era（公元前写 BC，公元后写 AD）。\"),\n    (\"human\", query),\n])\nprint(repr(date))              # 实测：Date(year=2024, month=4, day=6, era='AD')",
        "en": "model = ChatDeepSeek(model=MODEL, api_key=API_KEY)       # thinking stays on\njson_model = model.with_structured_output(Date, method=\"json_mode\")\ndate = json_model.invoke([\n    (\"system\", \"Reply with one JSON object only, fields: year, month, day (integers) and era (BC or AD).\"),\n    (\"human\", query),\n])\nprint(repr(date))              # tested: Date(year=2024, month=4, day=6, era='AD')"
      }
    },
    {
      "t": "p",
      "zh": "[▶ 21:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1292) 不想写类，也可以照 OpenAI 规定的 JSON Schema 格式手写一个字典传进去，在里面逐个列出字段的名字、类型和说明。[▶ 22:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1322) 两种写法的差别在返回值：传 pydantic 类得到**这个类的对象**，传字典得到**字典**，里面的值一样：",
      "en": "[▶ 21:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1292) If you'd rather not write a class, you can hand-write a dict in the JSON Schema format OpenAI specifies and pass that in, listing each field's name, type and description. [▶ 22:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1322) The two forms differ in what they return: a pydantic class gives you **an object of that class**, a dict gives you **a dict**, with the same values inside:"
    },
    {
      "t": "code",
      "file": "json_schema.py",
      "code": {
        "zh": "date_schema = {\n    \"title\": \"Date\",                  # 必须有：会被当成工具名，省掉会报 ValueError（实测）\n    \"description\": \"从文字里提取出的一个日期\",\n    \"type\": \"object\",\n    \"properties\": {\n        \"year\": {\"type\": \"integer\", \"description\": \"年份，例如 2024\"},\n        \"month\": {\"type\": \"integer\", \"description\": \"月份，1 到 12\"},\n        \"day\": {\"type\": \"integer\", \"description\": \"日，1 到 31\"},\n        \"era\": {\"type\": \"string\", \"description\": \"公元前写 BC，公元后写 AD\"},\n    },\n    \"required\": [\"year\", \"month\", \"day\", \"era\"],\n}\nresult = fast_model.with_structured_output(date_schema).invoke(prompt.invoke({\"query\": query}))\nprint(result)            # 实测：{'year': 2024, 'month': 4, 'day': 6, 'era': 'AD'}\nprint(result[\"year\"])    # 字典：用方括号取值",
        "en": "date_schema = {\n    \"title\": \"Date\",                  # required: it becomes the tool name; leaving it out raises ValueError (tested)\n    \"description\": \"A date extracted from some text\",\n    \"type\": \"object\",\n    \"properties\": {\n        \"year\": {\"type\": \"integer\", \"description\": \"the year, e.g. 2024\"},\n        \"month\": {\"type\": \"integer\", \"description\": \"the month, 1 to 12\"},\n        \"day\": {\"type\": \"integer\", \"description\": \"the day, 1 to 31\"},\n        \"era\": {\"type\": \"string\", \"description\": \"BC or AD\"},\n    },\n    \"required\": [\"year\", \"month\", \"day\", \"era\"],\n}\nresult = fast_model.with_structured_output(date_schema).invoke(prompt.invoke({\"query\": query}))\nprint(result)            # tested: {'year': 2024, 'month': 4, 'day': 6, 'era': 'AD'}\nprint(result[\"year\"])    # a dict: read values with brackets"
      },
      "note": {
        "zh": "第八部分的三种写法都在 `practice/l45_structured_output.py` 里（调用 3 次模型，实测都得到 2024 年 4 月 6 日、AD）。",
        "en": "All three forms from part 8 are in `practice/l45_structured_output.py` (3 model calls; each tested run returned 6 April 2024, AD)."
      }
    },
    {
      "t": "h",
      "zh": "九、输出解析器：先输出文字，再解析",
      "en": "9. Output parsers: text first, then parse"
    },
    {
      "t": "p",
      "zh": "[▶ 23:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1385) 第二条路：调用模型时不做约定，让它把答案当文字输出——这段文字本身就是一个 JSON 字符串——再把里面的 JSON 解析出来。用的是 LangChain 的**输出解析器**。`JsonOutputParser(pydantic_object=Date)` 有一个 `get_format_instructions()` 方法，会根据类写出一段「请按这个格式输出」的说明；把它放进提示词，模型就知道该输出什么样的 JSON。\n\n模板用的是 `PromptTemplate(...)` 的完整写法：`input_variables` 列出调用时才给的槽，`partial_variables` 把格式说明**事先填好**。",
      "en": "[▶ 23:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1385) The second way: make no agreement when calling the model, let it give its answer as text – that text simply is a JSON string – and then parse the JSON out. The tool is LangChain's **output parser**. `JsonOutputParser(pydantic_object=Date)` has a `get_format_instructions()` method that writes a “reply in this format” note from the class; put it into the prompt and the model knows what JSON to produce.\n\nThe template uses `PromptTemplate(...)`'s full form: `input_variables` lists the slots given at call time, and `partial_variables` **fills in** the format note up front."
    },
    {
      "t": "code",
      "file": "json_parser.py",
      "code": {
        "zh": "from langchain_core.output_parsers import JsonOutputParser\nfrom langchain_core.prompts import PromptTemplate\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)      # 普通模型，思考模式开着也没关系\nparser = JsonOutputParser(pydantic_object=Date)\n\nprompt = PromptTemplate(\n    template=\"提取用户输入中的日期。\\n用户输入：{query}\\n{format_instructions}\",\n    input_variables=[\"query\"],                                                    # 调用时再填\n    partial_variables={\"format_instructions\": parser.get_format_instructions()},  # 事先填好\n)\noutput = model.invoke(prompt.invoke({\"query\": \"2024年4月6日，我们全家去西湖划船，天气晴。\"}))\nprint(output.content)          # 实测：{\"year\":2024,\"month\":4,\"day\":6,\"era\":\"AD\"}   ← 这还是一个字符串\nprint(parser.invoke(output))   # {'year': 2024, 'month': 4, 'day': 6, 'era': 'AD'} ← 解析成了字典",
        "en": "from langchain_core.output_parsers import JsonOutputParser\nfrom langchain_core.prompts import PromptTemplate\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)      # a plain model; thinking on is fine here\nparser = JsonOutputParser(pydantic_object=Date)\n\nprompt = PromptTemplate(\n    template=\"Extract the date from the user's input.\\nUser input: {query}\\n{format_instructions}\",\n    input_variables=[\"query\"],                                                    # filled at call time\n    partial_variables={\"format_instructions\": parser.get_format_instructions()},  # filled in up front\n)\noutput = model.invoke(prompt.invoke({\"query\": \"On 6 April 2024 our family went boating on West Lake; it was sunny.\"}))\nprint(output.content)          # tested: {\"year\":2024,\"month\":4,\"day\":6,\"era\":\"AD\"}   <- still a string\nprint(parser.invoke(output))   # {'year': 2024, 'month': 4, 'day': 6, 'era': 'AD'} <- parsed into a dict"
      },
      "note": {
        "zh": "[▶ 24:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1482) 视频把两步的结果都打印出来对比：原始输出是一段字符串，解析器从里面解析出了 JSON 对象。第九、十部分的完整代码在 `practice/l45_output_parsers.py`（调用 2 次模型）。",
        "en": "[▶ 24:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1482) The video prints both results side by side: the raw output is a string, and the parser pulls a JSON object out of it. The complete code for parts 9–10 is `practice/l45_output_parsers.py` (2 model calls)."
      }
    },
    {
      "t": "warn",
      "zh": "[▶ 24:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1446) 视频说，约定了类以后，如果模型输出的 JSON 和类的格式不符，`JsonOutputParser` 会解析失败。实测你装的版本不是这样：`JsonOutputParser` 只检查「是不是合法的 JSON」，`pydantic_object` 只用来生成格式说明——`parser.parse('{\"foo\": 1}')` 照样返回 `{'foo': 1}`。要按类检查字段，用下面的 `PydanticOutputParser`。",
      "en": "[▶ 24:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1446) The video says that once a class is given, `JsonOutputParser` fails if the model's JSON doesn't match the class. In your installed version that isn't so (tested): `JsonOutputParser` only checks that the text is valid JSON, and `pydantic_object` is used only to write the format note – `parser.parse('{\"foo\": 1}')` happily returns `{'foo': 1}`. To check the fields against the class, use `PydanticOutputParser` below."
    },
    {
      "t": "p",
      "zh": "[▶ 25:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1514) 讲师说，因为历史原因这里有两个选择：早期用的是 `PydanticOutputParser`，后来又出了 `JsonOutputParser`，接口来回变过，但目前两个都能用，他也没看到哪个要被取消。[▶ 25:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1547) 差别在结果：JSON 解析器得到**字典**，Pydantic 解析器直接得到 **`Date` 对象**（而且会按类检查字段和类型，不符就报 `OutputParserException`）：",
      "en": "[▶ 25:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1514) The instructor explains that, for historical reasons, there are two choices here: `PydanticOutputParser` came first, `JsonOutputParser` later, and the interface has wavered back and forth – but both work today and he sees no sign of either being dropped. [▶ 25:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1547) The difference is the result: the JSON parser gives a **dict**, the Pydantic parser gives a **`Date` object** directly (and checks the fields and types against the class, raising `OutputParserException` on a mismatch):"
    },
    {
      "t": "code",
      "file": "pydantic_parser.py",
      "code": {
        "zh": "from langchain_core.output_parsers import PydanticOutputParser\n\npydantic_parser = PydanticOutputParser(pydantic_object=Date)\ndate = pydantic_parser.invoke(output)    # 同一段模型输出\nprint(repr(date))                        # 实测：Date(year=2024, month=4, day=6, era='AD')\nprint(date.month)                        # 4",
        "en": "from langchain_core.output_parsers import PydanticOutputParser\n\npydantic_parser = PydanticOutputParser(pydantic_object=Date)\ndate = pydantic_parser.invoke(output)    # the same model output\nprint(repr(date))                        # tested: Date(year=2024, month=4, day=6, era='AD')\nprint(date.month)                        # 4"
      }
    },
    {
      "t": "p",
      "zh": "**补充：** `JsonOutputParser` 大致做的事，用纯 Python 写出来是这样（可以点 ▶ 运行）：去掉可能存在的代码块标记，再 `json.loads`（05 节）。`startswith`、`strip` 回顾 07 节。最后一段用的就是第十部分「把 4 换成四」的办法，看看不合法的 JSON 会怎样：",
      "en": "**Extra:** roughly what `JsonOutputParser` does, in plain Python (press ▶ to run): strip a code fence if there is one, then `json.loads` (lesson 05). `startswith` and `strip`: see lesson 07. The last part uses part 10's “swap 4 for 四” trick to show what invalid JSON does:"
    },
    {
      "t": "code",
      "file": "parse_by_hand.py",
      "run": true,
      "code": {
        "zh": "import json\n\ndef parse_json(text):\n    \"\"\"去掉可能存在的代码块标记，再用 json.loads 解析——JsonOutputParser 的核心思路。\"\"\"\n    text = text.strip()\n    if text.startswith(\"```\"):\n        text = text.strip(\"`\")          # 去掉两头的反引号\n        if text.startswith(\"json\"):\n            text = text[4:]             # 去掉开头的 json 四个字母\n    return json.loads(text)\n\nplain = '{\"year\": 2024, \"month\": 4, \"day\": 6, \"era\": \"AD\"}'\nfenced = \"```json\\n\" + plain + \"\\n```\"     # 模型有时会这样包一层\n\nfor reply_text in [plain, fenced]:\n    date = parse_json(reply_text)\n    print(type(date).__name__, date[\"year\"], date[\"month\"], date[\"day\"])\n\ntry:\n    parse_json(plain.replace(\"4\", \"四\"))     # 第十部分的「改坏」办法\nexcept json.JSONDecodeError as e:\n    print(\"不是合法的 JSON：\", e)",
        "en": "import json\n\ndef parse_json(text):\n    \"\"\"Strip a code fence if there is one, then json.loads - the core idea of JsonOutputParser.\"\"\"\n    text = text.strip()\n    if text.startswith(\"```\"):\n        text = text.strip(\"`\")          # drop the backticks at both ends\n        if text.startswith(\"json\"):\n            text = text[4:]             # drop the leading word json\n    return json.loads(text)\n\nplain = '{\"year\": 2024, \"month\": 4, \"day\": 6, \"era\": \"AD\"}'\nfenced = \"```json\\n\" + plain + \"\\n```\"     # models sometimes wrap it like this\n\nfor reply_text in [plain, fenced]:\n    date = parse_json(reply_text)\n    print(type(date).__name__, date[\"year\"], date[\"month\"], date[\"day\"])\n\ntry:\n    parse_json(plain.replace(\"4\", \"四\"))     # part 10's way of breaking it (四 = \"four\")\nexcept json.JSONDecodeError as e:\n    print(\"not valid JSON:\", e)"
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "同一段模型输出 `output`，`JsonOutputParser(pydantic_object=Date).invoke(output)` 和 `PydanticOutputParser(pydantic_object=Date).invoke(output)` 分别得到什么？",
        "en": "For the same model output `output`, what do `JsonOutputParser(pydantic_object=Date).invoke(output)` and `PydanticOutputParser(pydantic_object=Date).invoke(output)` return?"
      },
      "options": [
        {
          "zh": "都得到字典",
          "en": "Both return a dict"
        },
        {
          "zh": "都得到 `Date` 对象",
          "en": "Both return a `Date` object"
        },
        {
          "zh": "前者得到字典（不检查字段），后者得到 `Date` 对象（检查字段和类型）",
          "en": "The first a dict (fields unchecked), the second a `Date` object (fields and types checked)"
        },
        {
          "zh": "前者得到 `Date` 对象，后者得到字典",
          "en": "The first a `Date` object, the second a dict"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "视频说两者的差别就在结果类型上。另外实测：`JsonOutputParser` 的 `pydantic_object` 只用来写格式说明，不检查字段；要检查，用 `PydanticOutputParser`。",
        "en": "The video says the difference lies in the result type. Also tested: `JsonOutputParser`'s `pydantic_object` only writes the format note and checks nothing; for checking, use `PydanticOutputParser`."
      }
    },
    {
      "t": "p",
      "zh": "几种拿结构化结果的方式怎么选：\n\n| 方式 | 得到 | 检查字段吗 | 适合 |\n|---|---|---|---|\n| `with_structured_output(类)` | 这个类的对象 | 检查 | 接口直接按结构输出，最省事（deepseek-flash 要关掉思考或用 json_mode） |\n| `with_structured_output(字典)` | `dict` | 不检查 | 不想写类 |\n| `JsonOutputParser()` | `dict` | 不检查 | 先让模型输出文字再解析，对字段要求不严 |\n| `PydanticOutputParser(pydantic_object=类)` | 这个类的对象 | 检查 | 先让模型输出文字再解析，要可靠的对象 |\n\n48 节还会用到一个最简单的解析器 `StrOutputParser`：它只是取出 `AIMessage` 的 `.content`，让整条链直接返回字符串。",
      "en": "Choosing how to get a structured result:\n\n| Way | You get | Checks fields? | Good for |\n|---|---|---|---|\n| `with_structured_output(cls)` | An object of that class | Yes | The API outputs the structure directly – least effort (deepseek-flash: thinking off, or json_mode) |\n| `with_structured_output(dict)` | `dict` | No | When you'd rather not write a class |\n| `JsonOutputParser()` | `dict` | No | Text first, then parse; loose fields are fine |\n| `PydanticOutputParser(pydantic_object=cls)` | An object of that class | Yes | Text first, then parse, when you need a reliable object |\n\nLesson 48 also uses the simplest parser, `StrOutputParser`: it just takes the `AIMessage`'s `.content`, so a whole chain returns a string."
    },
    {
      "t": "h",
      "zh": "十、OutputFixingParser：解析失败时让模型纠错",
      "en": "10. OutputFixingParser: let the model repair failed parses"
    },
    {
      "t": "p",
      "zh": "[▶ 26:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1579) 讲师提醒，OpenAI 自己的文档也说过：要求结构化输出时，不能保证格式百分之百正确——模型的输出有随机性，结构定义和前面的提示词写得怎么样也有影响。[▶ 26:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1609) 所以开发者要做容错：发现格式不对，就再调一次模型重新生成；如果知道错在哪里，就把错误信息一起给它，让它对着错误改。\n\n`OutputFixingParser` 把这件事做成了现成的工具。[▶ 27:51](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1671) 创建时给它两样东西：**原来的解析器**和**一个模型**。它先用原来的解析器试，成功就直接返回，什么都不做；失败了，才把原输出、格式要求和错误信息交给模型修正，再解析一次。\n\n[▶ 28:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1702) 简单的例子里模型很少出错，所以视频故意把正确的输出改坏：把里面的数字 4 换成汉字「四」。汉字两边没有引号，整个 JSON 就不合法了。下面照做（`output`、`model` 和 `pydantic_parser` 来自第九部分）：",
      "en": "[▶ 26:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1579) The instructor points out that OpenAI's own docs admit it: when you ask for structured output, the format can't be guaranteed 100% – model output has some randomness, and how well the structure definition and the prompt before it are written matters too. [▶ 26:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1609) So developers need fault tolerance: when the format is wrong, call the model again to regenerate; if you know what went wrong, include the error so it can fix exactly that.\n\n`OutputFixingParser` packages this as a ready-made tool. [▶ 27:51](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1671) You give it two things: **the original parser** and **a model**. It tries the original parser first and, on success, simply returns; only on failure does it hand the model the original output, the format instructions and the error to fix, then parse again.\n\n[▶ 28:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1702) Simple examples rarely go wrong, so the video breaks a good output on purpose: it swaps the digit 4 for the Chinese numeral 四. With no quotes around it, the whole JSON becomes invalid. Same trick below (`output`, `model` and `pydantic_parser` come from part 9):"
    },
    {
      "t": "code",
      "file": "output_fixing.py",
      "code": {
        "zh": "from langchain_classic.output_parsers import OutputFixingParser   # 1.x 里只能从 langchain_classic 导入\nfrom langchain_core.exceptions import OutputParserException\n\nbad_output = output.content.replace(\"4\", \"四\")\nprint(bad_output)            # {\"year\":202四,\"month\":四,\"day\":6,\"era\":\"AD\"}\n\ntry:\n    pydantic_parser.invoke(bad_output)             # 原来的解析器：直接报错\nexcept OutputParserException as e:\n    print(\"解析失败：\", str(e).splitlines()[0])     # Invalid json output: ...\n\nfixing_parser = OutputFixingParser.from_llm(llm=model, parser=pydantic_parser)\ndate = fixing_parser.invoke(bad_output)            # 失败 → 交给模型修复 → 再解析（调用 1 次模型）\nprint(repr(date))            # 实测：Date(year=2024, month=4, day=6, era='AD')",
        "en": "from langchain_classic.output_parsers import OutputFixingParser   # in 1.x only importable from langchain_classic\nfrom langchain_core.exceptions import OutputParserException\n\nbad_output = output.content.replace(\"4\", \"四\")      # 四 is the Chinese numeral \"four\", unquoted\nprint(bad_output)            # {\"year\":202四,\"month\":四,\"day\":6,\"era\":\"AD\"}\n\ntry:\n    pydantic_parser.invoke(bad_output)             # the original parser simply fails\nexcept OutputParserException as e:\n    print(\"parse failed:\", str(e).splitlines()[0]) # Invalid json output: ...\n\nfixing_parser = OutputFixingParser.from_llm(llm=model, parser=pydantic_parser)\ndate = fixing_parser.invoke(bad_output)            # fail -> the model repairs it -> parse again (1 model call)\nprint(repr(date))            # tested: Date(year=2024, month=4, day=6, era='AD')"
      },
      "note": {
        "zh": "旧版（0.x）教程里的写法是 `from langchain.output_parsers import OutputFixingParser`；1.x 的 `langchain` 包里已经没有它，只能从 `langchain_classic.output_parsers` 导入，默认只重试 1 次（`max_retries=1`）。[▶ 29:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1794) 讲师说这个功能很实用：就算不用 LangChain，他自己做产品时也会设计同样的「解析不了就交给模型纠错、重新生成」的步骤。不想依赖旧包，可以自己用 `try` / `except` 写：解析失败时把错误信息拼进提示词，再调一次模型。",
        "en": "Older (0.x) tutorials import it with `from langchain.output_parsers import OutputFixingParser`; 1.x's `langchain` package no longer has it, so import it from `langchain_classic.output_parsers`; by default it retries once (`max_retries=1`). [▶ 29:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1794) The instructor finds this very useful: even without LangChain, he builds the same “if it won't parse, let the model fix it and regenerate” step into his own products. To avoid the legacy package, write it yourself with `try` / `except`: on a parse failure, put the error into a prompt and call the model again."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "`OutputFixingParser` 什么时候会调用模型？",
        "en": "When does `OutputFixingParser` call the model?"
      },
      "options": [
        {
          "zh": "每次解析都会调用一次模型",
          "en": "On every parse"
        },
        {
          "zh": "只有原来的解析器失败时，才把原输出和错误信息交给模型修复",
          "en": "Only when the original parser fails – then it sends the output and the error to the model to fix"
        },
        {
          "zh": "从不调用模型，只是把字符串里的汉字换成数字",
          "en": "Never – it just swaps Chinese characters for digits"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "它先用原来的解析器试，成功就直接返回；失败才调用模型纠错，然后再解析一次。",
        "en": "It tries the original parser first and returns on success; only a failure triggers a model call to repair the text, which is then parsed again."
      }
    },
    {
      "t": "h",
      "zh": "十一、工具调用：@tool + bind_tools",
      "en": "11. Tool calling: @tool + bind_tools"
    },
    {
      "t": "p",
      "zh": "[▶ 30:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1832) 最后一段讲 function calling（05、06 节用 openai 库手写过）在 LangChain 里怎么做：\n1. [▶ 31:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1864) `@tool` 装饰器：加在函数上，LangChain 就根据函数名、参数的类型标注和 docstring，自动生成给模型看的工具描述（装饰器、类型标注、docstring 回顾 08 节）。视频定义了加法 `add` 和乘法 `multiply` 两个工具。\n2. [▶ 31:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1894) `bind_tools`：和前面的 `with_structured_output` 类似，在模型上调用 `model.bind_tools([add, multiply])`，得到一个「知道有这些工具」的新模型。\n3. [▶ 32:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1926) 问「3 的 4 倍是多少？」，返回的 `AIMessage` 里有 `tool_calls`：要调用哪个函数、参数是什么。\n4. [▶ 32:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1957) 先把这条回复放进消息列表；按名字找到工具，执行 `工具.invoke(call)`——它直接返回一条 `ToolMessage`——也放进列表。\n5. [▶ 33:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=2018) 带着完整的消息列表再调用一次模型，它看到工具的结果，回答 12。视频最后把整段消息历史打印出来，一轮一轮地对照。",
      "en": "[▶ 30:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1832) The last part shows how function calling (hand-written with the openai library in lessons 05 and 06) works in LangChain:\n1. [▶ 31:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1864) The `@tool` decorator: put it on a function and LangChain uses the function name, parameter type hints and docstring to build the tool description the model reads (decorators, type hints and docstrings: lesson 08). The video defines two tools, `add` and `multiply`.\n2. [▶ 31:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1894) `bind_tools`: much like `with_structured_output` earlier, call `model.bind_tools([add, multiply])` on the model to get a new model that knows these tools.\n3. [▶ 32:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1926) Ask “What is 3 times 4?” and the returned `AIMessage` holds `tool_calls`: which function to call, with which arguments.\n4. [▶ 32:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=1957) Put that reply into the message list first; look the tool up by name and run `the_tool.invoke(call)` – it returns a ready-made `ToolMessage` – and add that to the list too.\n5. [▶ 33:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=2018) Call the model again with the full message list; it sees the tool's result and answers 12. The video ends by printing the whole message history to compare it turn by turn."
    },
    {
      "t": "code",
      "file": "bind_tools.py",
      "code": {
        "zh": "import json\nfrom langchain_core.messages import HumanMessage, SystemMessage\nfrom langchain_core.tools import tool\n\n@tool\ndef add(a: int, b: int) -> int:\n    \"\"\"Add two integers.\n\n    Args:\n        a: First integer\n        b: Second integer\n    \"\"\"\n    return a + b\n\n@tool\ndef multiply(a: int, b: int) -> int:\n    \"\"\"Multiply two integers.\n\n    Args:\n        a: First integer\n        b: Second integer\n    \"\"\"\n    return a * b\n\nmodel_with_tools = model.bind_tools([add, multiply])\nmessages = [\n    SystemMessage(content=\"遇到计算一律调用工具，不要心算。\"),\n    HumanMessage(content=\"3 的 4 倍是多少？\"),\n]\nreply = model_with_tools.invoke(messages)\nprint(json.dumps(reply.tool_calls, indent=2, ensure_ascii=False))\n# 实测：[{\"name\": \"multiply\", \"args\": {\"a\": 3, \"b\": 4}, \"id\": \"call_00_...\", \"type\": \"tool_call\"}]\n\nmessages.append(reply)                           # 1. 带 tool_calls 的回复先放进去\navailable_tools = {\"add\": add, \"multiply\": multiply}\nfor call in reply.tool_calls:                    # 2. 每个调用：按名字找到工具，执行\n    selected_tool = available_tools[call[\"name\"]]\n    messages.append(selected_tool.invoke(call))  #    invoke(call) 直接返回 ToolMessage\n\nfinal = model_with_tools.invoke(messages)        # 3. 带着工具结果再问一次\nprint(final.content)                             # 实测：3 的 4 倍是 **12**。",
        "en": "import json\nfrom langchain_core.messages import HumanMessage, SystemMessage\nfrom langchain_core.tools import tool\n\n@tool\ndef add(a: int, b: int) -> int:\n    \"\"\"Add two integers.\n\n    Args:\n        a: First integer\n        b: Second integer\n    \"\"\"\n    return a + b\n\n@tool\ndef multiply(a: int, b: int) -> int:\n    \"\"\"Multiply two integers.\n\n    Args:\n        a: First integer\n        b: Second integer\n    \"\"\"\n    return a * b\n\nmodel_with_tools = model.bind_tools([add, multiply])\nmessages = [\n    SystemMessage(content=\"Always use the tools for arithmetic; never compute in your head.\"),\n    HumanMessage(content=\"What is 3 times 4?\"),\n]\nreply = model_with_tools.invoke(messages)\nprint(json.dumps(reply.tool_calls, indent=2, ensure_ascii=False))\n# tested: [{\"name\": \"multiply\", \"args\": {\"a\": 3, \"b\": 4}, \"id\": \"call_00_...\", \"type\": \"tool_call\"}]\n\nmessages.append(reply)                           # 1. store the reply carrying tool_calls first\navailable_tools = {\"add\": add, \"multiply\": multiply}\nfor call in reply.tool_calls:                    # 2. for each call: look the tool up by name and run it\n    selected_tool = available_tools[call[\"name\"]]\n    messages.append(selected_tool.invoke(call))  #    invoke(call) returns a ToolMessage\n\nfinal = model_with_tools.invoke(messages)        # 3. ask again, now with the tool results\nprint(final.content)                             # e.g. 3 times 4 is 12."
      },
      "note": {
        "zh": "LangChain 的 `tool_calls` 是**字典**的列表：用 `call[\"name\"]`、`call[\"args\"]` 取值，参数已经是字典，不用再 `json.loads`——这和 05 节 openai 库返回的对象（`call.function.name`）不一样。`invoke(call)` 自动带上 `tool_call_id`，不会对错号。system 消息是我们加的：没有它，deepseek-flash 偶尔会自己心算、不调用工具。想把整段历史打印出来，用 `for m in messages: m.pretty_print()`。完整代码：`practice/l45_bind_tools_solution.py`（调用 2 次模型）。",
        "en": "LangChain's `tool_calls` is a list of **dicts**: read `call[\"name\"]` and `call[\"args\"]`; the arguments are already a dict, so no `json.loads` – unlike the objects the openai library returns in lesson 05 (`call.function.name`). `invoke(call)` fills in the `tool_call_id`, so ids never get mixed up. The system message is our addition: without it deepseek-flash now and then does the sum itself instead of calling the tool. To print the whole history, use `for m in messages: m.pretty_print()`. Full code: `practice/l45_bind_tools_solution.py` (2 model calls)."
      }
    },
    {
      "t": "tip",
      "zh": "视频只处理了一轮工具调用。如果模型拿到结果后可能还要再调用工具（比如「先加再乘」），就把第 2、3 步放进 `while reply.tool_calls:` 循环里，一直做到它不再要工具为止——这就是 06 节手写的工具循环。49 节的 `create_agent` 会把这个循环自动做掉。",
      "en": "The video handles a single round of tool calls. If the model may want more tools after seeing the results (say, “add, then multiply”), put steps 2 and 3 inside a `while reply.tool_calls:` loop and repeat until it stops asking – that is lesson 06's hand-written tool loop. Lesson 49's `create_agent` runs the loop for you."
    },
    {
      "t": "h",
      "zh": "十二、讲师的小结，以及新旧写法对照",
      "en": "12. The instructor's wrap-up, and old vs new code"
    },
    {
      "t": "video",
      "zh": "[▶ 34:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=2082) 讲师的小结：用 LangChain 跟大模型打交道，很多原本要手写的数据结构、接口代码，一两行就能搞定。他认为输入输出这一部分——模型封装、提示词模板、输出解析器——设计得比较合理，可以直接用。[▶ 35:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=2113) 但他也提醒：模型调用目前问题不大，**流式调用**却有坑，讲到时再说。[▶ 35:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=2144) 就算不用 LangChain，自己写代码库时也可以参考这套设计：你同样需要一个模板类、一层模型接口，以及对工具调用和结构化输出的支持。",
      "en": "[▶ 34:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=2082) The instructor's wrap-up: when you work with LLMs through LangChain, much of the data-structure and interface code you'd otherwise write by hand takes a line or two. He considers this input/output part – model wrappers, prompt templates, output parsers – sensibly designed and fine to use as is. [▶ 35:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=2113) He warns, though, that while plain model calls are fine, **streaming** has pitfalls, to be covered when it comes up. [▶ 35:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=46&t=2144) And even without LangChain, it's a good design to copy for your own code base: you'll need a template class, a model interface layer, and support for tool calling and structured output just the same."
    },
    {
      "t": "p",
      "zh": "视频里的导入可能来自更早的版本。照抄遇到 `ImportError` 时，对照这张表（右边的写法都在你的 `.venv` 里实测过）：\n\n| 旧写法 | 1.x 写法（本课程） |\n|---|---|\n| `from langchain.chat_models import ChatOpenAI` | `from langchain_openai import ChatOpenAI` |\n| `from langchain.schema import HumanMessage, SystemMessage` | `from langchain_core.messages import HumanMessage, SystemMessage` |\n| `from langchain.prompts import PromptTemplate, ChatPromptTemplate` | `from langchain_core.prompts import PromptTemplate, ChatPromptTemplate` |\n| `from langchain.output_parsers import PydanticOutputParser` | `from langchain_core.output_parsers import PydanticOutputParser` |\n| `from langchain.output_parsers import OutputFixingParser` | `from langchain_classic.output_parsers import OutputFixingParser`（1.x 只剩这里） |\n| `model.predict(\"...\")` 或直接 `model([...])` | `model.invoke(...)` |\n| `message.dict()` | `message.model_dump()`（`dict()` 会打印弃用警告，回顾 06 节） |\n\n左边的导入在 1.x 里会报 `ImportError` 或 `ModuleNotFoundError`，运行 `practice/l43_ecosystem.py` 可以亲眼看到。",
      "en": "The video's imports may come from an older version. If copying them gives an `ImportError`, use this table (every form on the right was tested in your `.venv`):\n\n| Old | 1.x (this course) |\n|---|---|\n| `from langchain.chat_models import ChatOpenAI` | `from langchain_openai import ChatOpenAI` |\n| `from langchain.schema import HumanMessage, SystemMessage` | `from langchain_core.messages import HumanMessage, SystemMessage` |\n| `from langchain.prompts import PromptTemplate, ChatPromptTemplate` | `from langchain_core.prompts import PromptTemplate, ChatPromptTemplate` |\n| `from langchain.output_parsers import PydanticOutputParser` | `from langchain_core.output_parsers import PydanticOutputParser` |\n| `from langchain.output_parsers import OutputFixingParser` | `from langchain_classic.output_parsers import OutputFixingParser` (the only place left in 1.x) |\n| `model.predict(\"...\")` or calling `model([...])` | `model.invoke(...)` |\n| `message.dict()` | `message.model_dump()` (`dict()` prints a deprecation warning; see lesson 06) |\n\nThe imports on the left fail with `ImportError` or `ModuleNotFoundError` in 1.x – run `practice/l43_ecosystem.py` to see it yourself."
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "视频把 OpenAI 的模型换成百度的文心模型时，哪些代码要改？",
        "en": "When the video switches from an OpenAI model to Baidu's ERNIE model, which code changes?"
      },
      "options": [
        {
          "zh": "消息列表要改写成百度的格式",
          "en": "The message list must be rewritten in Baidu's format"
        },
        {
          "zh": "所有 `invoke` 要换成百度自己的方法",
          "en": "Every `invoke` must become Baidu's own method"
        },
        {
          "zh": "只改创建模型的那一行：换成对应的类、给它自己的 key",
          "en": "Only the line that creates the model: the matching class with its own key"
        },
        {
          "zh": "整个程序重写",
          "en": "The whole program must be rewritten"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "这正是模型封装的价值：每家模型一个类，但接口和数据结构一样，消息列表、`invoke` 都不用动。",
        "en": "That is the point of model wrappers: one class per provider, but the same interface and data structures, so the message list and `invoke` stay put."
      }
    },
    {
      "q": {
        "zh": "`template = \"翻译成{lang}：{text}\"`（前面没有 f），执行 `template.format(lang=\"英文\")` 会怎样？",
        "en": "`template = \"Translate into {lang}: {text}\"` (no f). What does `template.format(lang=\"French\")` do?"
      },
      "options": [
        {
          "zh": "报 `KeyError`，因为没有给 `text`",
          "en": "Raises `KeyError` because `text` is missing"
        },
        {
          "zh": "返回 `\"翻译成英文：\"`",
          "en": "Returns `\"Translate into French: \"`"
        },
        {
          "zh": "返回 `\"翻译成英文：{text}\"`",
          "en": "Returns `\"Translate into French: {text}\"`"
        },
        {
          "zh": "报 `SyntaxError`",
          "en": "Raises `SyntaxError`"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "`.format` 要求每个槽都有值，少一个就是 `KeyError`。LangChain 的模板也一样（它的报错信息会列出缺少的变量）。",
        "en": "`.format` needs a value for every slot; one missing gives `KeyError`. LangChain templates behave the same (their error lists the missing variables)."
      }
    },
    {
      "q": {
        "zh": "要把一整段之前的对话（多条消息）插进 `ChatPromptTemplate`，用哪个？",
        "en": "Which one inserts a whole run of earlier conversation (several messages) into a `ChatPromptTemplate`?"
      },
      "options": [
        {
          "zh": "`PydanticOutputParser`",
          "en": "`PydanticOutputParser`"
        },
        {
          "zh": "`(\"human\", \"{history}\")`",
          "en": "`(\"human\", \"{history}\")`"
        },
        {
          "zh": "`PromptTemplate.from_template(\"{history}\")`",
          "en": "`PromptTemplate.from_template(\"{history}\")`"
        },
        {
          "zh": "`MessagesPlaceholder(\"history\")`",
          "en": "`MessagesPlaceholder(\"history\")`"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "`MessagesPlaceholder` 在那个位置展开成一个消息列表；`(\"human\", \"{history}\")` 只会把历史变成一条用户消息里的文字。",
        "en": "`MessagesPlaceholder` expands into a list of messages at that spot; `(\"human\", \"{history}\")` would squash the history into the text of one user message."
      }
    },
    {
      "q": {
        "zh": "用 deepseek-flash（默认思考模式）执行 `ChatDeepSeek(...).with_structured_output(Date).invoke(...)`，报 400：`Thinking mode does not support this tool_choice`。怎么改？",
        "en": "With deepseek-flash (thinking on by default), `ChatDeepSeek(...).with_structured_output(Date).invoke(...)` fails with 400: `Thinking mode does not support this tool_choice`. The fix?"
      },
      "options": [
        {
          "zh": "把 `Date` 改成普通字典就行",
          "en": "Turning `Date` into a plain dict is enough"
        },
        {
          "zh": "创建模型时加 `extra_body={\"thinking\": {\"type\": \"disabled\"}}`，或改用 `method=\"json_mode\"` 并在提示词里写清字段",
          "en": "Add `extra_body={\"thinking\": {\"type\": \"disabled\"}}` when creating the model, or switch to `method=\"json_mode\"` and list the fields in the prompt"
        },
        {
          "zh": "改用 `ChatOpenAI` 连 DeepSeek，其他照抄视频",
          "en": "Use `ChatOpenAI` pointed at DeepSeek and copy the video otherwise"
        },
        {
          "zh": "把 `max_tokens` 调大",
          "en": "Raise `max_tokens`"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "`ChatDeepSeek` 默认的 function_calling 方法要强制调用工具，思考模式不允许（传字典也是同一个方法，照样报错）。`ChatOpenAI` 默认用 json_schema，DeepSeek 不支持，也会 400。关掉思考或用 json_mode 都实测可行。",
        "en": "`ChatDeepSeek`'s default function_calling method forces a tool call, which thinking mode refuses (a dict schema uses the same method and fails too). `ChatOpenAI` defaults to json_schema, which DeepSeek doesn't support – another 400. Thinking off, or json_mode, both worked in tests."
      }
    },
    {
      "q": {
        "zh": "关于 `JsonOutputParser(pydantic_object=Date)` 和 `PydanticOutputParser(pydantic_object=Date)`，哪句话对？",
        "en": "Which statement about `JsonOutputParser(pydantic_object=Date)` and `PydanticOutputParser(pydantic_object=Date)` is true?"
      },
      "options": [
        {
          "zh": "JSON 解析器得到字典、不检查字段；Pydantic 解析器得到 `Date` 对象、会检查字段和类型",
          "en": "The JSON parser returns a dict and checks no fields; the Pydantic parser returns a `Date` object and checks fields and types"
        },
        {
          "zh": "两个都会检查字段，只是名字不同",
          "en": "Both check fields; only the names differ"
        },
        {
          "zh": "`PydanticOutputParser` 是新出的，`JsonOutputParser` 已经被删除了",
          "en": "`PydanticOutputParser` is new and `JsonOutputParser` has been removed"
        },
        {
          "zh": "两个都要先关掉 deepseek-flash 的思考模式才能用",
          "en": "Both need deepseek-flash's thinking mode switched off"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "两个都能用（讲师说是历史原因并存）。解析器只处理模型输出的文字，和思考模式无关；实测 `JsonOutputParser` 的 `pydantic_object` 只用来生成格式说明。",
        "en": "Both work (they coexist for historical reasons, the instructor says). Parsers only handle the model's text, so thinking mode doesn't matter; tested: `JsonOutputParser`'s `pydantic_object` only writes the format note."
      }
    },
    {
      "q": {
        "zh": "`model_with_tools.invoke(messages)` 返回的 `reply` 里有 `tool_calls`。接下来正确的做法是？",
        "en": "`model_with_tools.invoke(messages)` returned a `reply` with `tool_calls`. What comes next?"
      },
      "options": [
        {
          "zh": "直接打印 `reply.content`，那就是最终答案",
          "en": "Print `reply.content` – that's the final answer"
        },
        {
          "zh": "执行工具，把结果直接打印给用户，不用再调用模型",
          "en": "Run the tools and print their results for the user; no further model call"
        },
        {
          "zh": "只把工具结果放进 `messages`，`reply` 本身不用放",
          "en": "Append only the tool results to `messages`, not `reply` itself"
        },
        {
          "zh": "先把 `reply` 放进 `messages`，再对每个调用执行 `工具.invoke(call)` 并放进返回的 `ToolMessage`，最后再调用一次模型",
          "en": "Append `reply` to `messages`, run `the_tool.invoke(call)` for every call and append the returned `ToolMessage`, then call the model again"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "和视频、06 节一样：带 `tool_calls` 的回复必须在历史里，后面跟上每个调用对应的 `ToolMessage`，模型才能根据结果写出最终回答。少了 `reply`，`ToolMessage` 找不到对应的调用，接口会报错。",
        "en": "As in the video and lesson 06: the reply carrying `tool_calls` must be in the history, followed by a `ToolMessage` for each call, so the model can write the final answer. Without `reply`, the `ToolMessage`s match no call and the API rejects them."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "模型封装 + 消息类",
        "en": "Model wrapper + message classes"
      },
      "code": {
        "zh": "from langchain_core.messages import AIMessage, HumanMessage, [[SystemMessage]]\nfrom langchain_deepseek import [[ChatDeepSeek]]\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=[[API_KEY]])\nmessages = [\n    SystemMessage(content=\"你是 Python 入门课的助教。\"),\n    [[HumanMessage]](content=\"我是学员，我叫小明。\"),\n    [[AIMessage]](content=\"欢迎你，小明！\"),\n    HumanMessage(content=\"我叫什么名字？\"),\n]\nreply = model.[[invoke]](messages)\nprint(reply.[[content]])",
        "en": "from langchain_core.messages import AIMessage, HumanMessage, [[SystemMessage]]\nfrom langchain_deepseek import [[ChatDeepSeek]]\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=[[API_KEY]])\nmessages = [\n    SystemMessage(content=\"You are the teaching assistant of a Python beginners' course.\"),\n    [[HumanMessage]](content=\"I'm a student. My name is Ming.\"),\n    [[AIMessage]](content=\"Welcome, Ming!\"),\n    HumanMessage(content=\"What is my name?\"),\n]\nreply = model.[[invoke]](messages)\nprint(reply.[[content]])"
      },
      "explain": {
        "zh": "用户说的话是 `HumanMessage`，模型之前的回答是 `AIMessage`；`invoke` 返回 `AIMessage`，文字在 `.content` 里。",
        "en": "What the user says is a `HumanMessage`, the model's earlier answer an `AIMessage`; `invoke` returns an `AIMessage` whose text is in `.content`."
      }
    },
    {
      "title": {
        "zh": "三种提示词模板",
        "en": "Three kinds of prompt template"
      },
      "code": {
        "zh": "template = PromptTemplate.[[from_template]](\"给我讲一个关于{subject}的笑话\")\nprint(template.[[format]](subject=\"小明\"))\n\nchat_template = ChatPromptTemplate.[[from_messages]]([\n    SystemMessagePromptTemplate.from_template(\"你是{shop}的客服助手。\"),\n    HumanMessagePromptTemplate.from_template(\"{query}\"),\n])\nmessages = chat_template.[[format_messages]](shop=\"西湖书店\", query=\"你是谁？\")\n\nhistory_template = ChatPromptTemplate.from_messages([\n    [[MessagesPlaceholder]](\"history\"),\n    HumanMessagePromptTemplate.from_template(\"把你上面的回答翻译成{language}。\"),\n])\nprompt_value = history_template.[[invoke]]({\"history\": history, \"[[language]]\": \"中文\"})\nreply = model.invoke(prompt_value)",
        "en": "template = PromptTemplate.[[from_template]](\"Tell me a joke about {subject}\")\nprint(template.[[format]](subject=\"Xiao Ming\"))\n\nchat_template = ChatPromptTemplate.[[from_messages]]([\n    SystemMessagePromptTemplate.from_template(\"You are the customer-service assistant of {shop}.\"),\n    HumanMessagePromptTemplate.from_template(\"{query}\"),\n])\nmessages = chat_template.[[format_messages]](shop=\"West Lake Books\", query=\"Who are you?\")\n\nhistory_template = ChatPromptTemplate.from_messages([\n    [[MessagesPlaceholder]](\"history\"),\n    HumanMessagePromptTemplate.from_template(\"Translate your answer above into {language}.\"),\n])\nprompt_value = history_template.[[invoke]]({\"history\": history, \"[[language]]\": \"Chinese\"})\nreply = model.invoke(prompt_value)"
      },
      "explain": {
        "zh": "`PromptTemplate` 用 `from_template` + `format`；`ChatPromptTemplate` 用 `from_messages`，填值用 `format_messages`（关键字参数）或 `invoke`（一个字典）；整段历史用 `MessagesPlaceholder`。",
        "en": "`PromptTemplate` uses `from_template` + `format`; `ChatPromptTemplate` uses `from_messages`, filled with `format_messages` (keyword arguments) or `invoke` (one dict); a whole history goes in through `MessagesPlaceholder`."
      }
    },
    {
      "title": {
        "zh": "先输出文字再解析，失败时自动修复",
        "en": "Text first, then parse; repair on failure"
      },
      "code": {
        "zh": "parser = [[PydanticOutputParser]](pydantic_object=Date)\nprompt = PromptTemplate(\n    template=\"提取用户输入中的日期。\\n用户输入：{query}\\n{format_instructions}\",\n    input_variables=[\"[[query]]\"],\n    partial_variables={\"format_instructions\": parser.[[get_format_instructions]]()},\n)\noutput = model.invoke(prompt.invoke({\"query\": \"2024年4月6日，我们去西湖划船。\"}))\ndate = parser.[[invoke]](output)\nprint(date.year, date.month, date.day)\n\nbad_output = output.content.replace(\"4\", \"四\")\nfixing_parser = [[OutputFixingParser]].from_llm(llm=[[model]], parser=parser)\ndate = fixing_parser.invoke(bad_output)",
        "en": "parser = [[PydanticOutputParser]](pydantic_object=Date)\nprompt = PromptTemplate(\n    template=\"Extract the date from the user's input.\\nUser input: {query}\\n{format_instructions}\",\n    input_variables=[\"[[query]]\"],\n    partial_variables={\"format_instructions\": parser.[[get_format_instructions]]()},\n)\noutput = model.invoke(prompt.invoke({\"query\": \"On 6 April 2024 we went boating on West Lake.\"}))\ndate = parser.[[invoke]](output)\nprint(date.year, date.month, date.day)\n\nbad_output = output.content.replace(\"4\", \"四\")\nfixing_parser = [[OutputFixingParser]].from_llm(llm=[[model]], parser=parser)\ndate = fixing_parser.invoke(bad_output)"
      },
      "explain": {
        "zh": "`input_variables` 是调用时才给的槽，格式说明用 `partial_variables` 事先填好；`OutputFixingParser.from_llm` 要原来的解析器和一个负责修复的模型。",
        "en": "`input_variables` are the slots given at call time, while the format note is pre-filled through `partial_variables`; `OutputFixingParser.from_llm` needs the original parser and a model to do the repairs."
      }
    },
    {
      "title": {
        "zh": "@tool + bind_tools（视频的流程）",
        "en": "@tool + bind_tools (the video's flow)"
      },
      "code": {
        "zh": "@[[tool]]\ndef multiply(a: int, b: int) -> int:\n    \"\"\"Multiply two integers.\"\"\"\n    return a * b\n\nmodel_with_tools = model.[[bind_tools]]([add, multiply])\nreply = model_with_tools.invoke(messages)\nmessages.[[append]](reply)\nfor call in reply.[[tool_calls]]:\n    selected_tool = available_tools[call[\"[[name]]\"]]\n    messages.append(selected_tool.[[invoke]](call))\nfinal = model_with_tools.invoke([[messages]])\nprint(final.content)",
        "en": "@[[tool]]\ndef multiply(a: int, b: int) -> int:\n    \"\"\"Multiply two integers.\"\"\"\n    return a * b\n\nmodel_with_tools = model.[[bind_tools]]([add, multiply])\nreply = model_with_tools.invoke(messages)\nmessages.[[append]](reply)\nfor call in reply.[[tool_calls]]:\n    selected_tool = available_tools[call[\"[[name]]\"]]\n    messages.append(selected_tool.[[invoke]](call))\nfinal = model_with_tools.invoke([[messages]])\nprint(final.content)"
      },
      "explain": {
        "zh": "`@tool` 把函数变成工具，`bind_tools` 把工具交给模型；先存带 `tool_calls` 的回复，按 `call[\"name\"]` 找到工具，`invoke(call)` 返回 `ToolMessage`，全部存好后用整个 `messages` 再调用一次。",
        "en": "`@tool` turns the function into a tool and `bind_tools` hands it to the model; store the reply with `tool_calls` first, find the tool by `call[\"name\"]`, `invoke(call)` returns a `ToolMessage`, and once everything is stored call the model again with the whole `messages` list."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：模型 + 多轮消息 + 换一个类",
        "en": "Write it: model + multi-turn messages + a different class"
      },
      "task": {
        "zh": "不看上面的代码，写出（对应视频第一段）：\n1. 用 `ChatDeepSeek` 创建模型对象 `model`\n2. 一个消息列表 `messages`：`SystemMessage`（助教设定）→ `HumanMessage`（报上名字）→ `AIMessage`（欢迎语）→ `HumanMessage`（问自己叫什么）\n3. 用 `model.invoke(messages)` 调用，打印回答的文字和这次的 `total_tokens`\n4. 用 `ChatOpenAI(model=MODEL, api_key=API_KEY, base_url=BASE_URL)` 创建另一个模型，用**同一个** `messages` 再调用一次并打印\n\n写完点「检查要点」，再复制到 `practice` 文件夹里用 `.venv` 运行。本地版练习：`practice/l45_model_io_todo.py`。",
        "en": "Without looking above, write (the video's first part):\n1. a model object `model` created with `ChatDeepSeek`\n2. a message list `messages`: `SystemMessage` (the teaching-assistant persona) → `HumanMessage` (giving a name) → `AIMessage` (a welcome) → `HumanMessage` (asking for the name)\n3. a `model.invoke(messages)` call, printing the answer text and this call's `total_tokens`\n4. a second model from `ChatOpenAI(model=MODEL, api_key=API_KEY, base_url=BASE_URL)`, called with the **same** `messages`, and its answer printed\n\nThen press “Check key points”, and copy it into the `practice` folder to run with `.venv`. Local version of this exercise: `practice/l45_model_io_todo.py`."
      },
      "starter": {
        "zh": "from langchain_core.messages import AIMessage, HumanMessage, SystemMessage\nfrom langchain_deepseek import ChatDeepSeek\nfrom langchain_openai import ChatOpenAI\nfrom llm import API_KEY, BASE_URL, MODEL\n\n# 1. 创建模型对象\n\n\n# 2. 消息列表：system → human → ai → human\n\n\n# 3. 调用并打印回答文字和 total_tokens\n\n\n# 4. 换成 ChatOpenAI，用同一个 messages 再调用一次",
        "en": "from langchain_core.messages import AIMessage, HumanMessage, SystemMessage\nfrom langchain_deepseek import ChatDeepSeek\nfrom langchain_openai import ChatOpenAI\nfrom llm import API_KEY, BASE_URL, MODEL\n\n# 1. create the model object\n\n\n# 2. message list: system -> human -> ai -> human\n\n\n# 3. call it and print the answer text and total_tokens\n\n\n# 4. switch to ChatOpenAI and call it again with the same messages"
      },
      "solution": {
        "zh": "from langchain_core.messages import AIMessage, HumanMessage, SystemMessage\nfrom langchain_deepseek import ChatDeepSeek\nfrom langchain_openai import ChatOpenAI\nfrom llm import API_KEY, BASE_URL, MODEL\n\n# 1. 创建模型对象\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 2. 消息列表：system → human → ai → human\nmessages = [\n    SystemMessage(content=\"你是 Python 入门课的助教，回答不超过 30 个字。\"),\n    HumanMessage(content=\"我是学员，我叫小明。\"),\n    AIMessage(content=\"欢迎你，小明！有问题随时问我。\"),\n    HumanMessage(content=\"我叫什么名字？\"),\n]\n\n# 3. 调用并打印回答文字和 total_tokens\nreply = model.invoke(messages)\nprint(reply.content)\nprint(reply.usage_metadata[\"total_tokens\"])\n\n# 4. 换成 ChatOpenAI，用同一个 messages 再调用一次\nother_model = ChatOpenAI(model=MODEL, api_key=API_KEY, base_url=BASE_URL)\nother_reply = other_model.invoke(messages)\nprint(other_reply.content)",
        "en": "from langchain_core.messages import AIMessage, HumanMessage, SystemMessage\nfrom langchain_deepseek import ChatDeepSeek\nfrom langchain_openai import ChatOpenAI\nfrom llm import API_KEY, BASE_URL, MODEL\n\n# 1. create the model object\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 2. message list: system -> human -> ai -> human\nmessages = [\n    SystemMessage(content=\"You are the teaching assistant of a Python beginners' course. Answer in under 30 words.\"),\n    HumanMessage(content=\"I'm a student. My name is Ming.\"),\n    AIMessage(content=\"Welcome, Ming! Ask me anything.\"),\n    HumanMessage(content=\"What is my name?\"),\n]\n\n# 3. call it and print the answer text and total_tokens\nreply = model.invoke(messages)\nprint(reply.content)\nprint(reply.usage_metadata[\"total_tokens\"])\n\n# 4. switch to ChatOpenAI and call it again with the same messages\nother_model = ChatOpenAI(model=MODEL, api_key=API_KEY, base_url=BASE_URL)\nother_reply = other_model.invoke(messages)\nprint(other_reply.content)"
      },
      "checks": [
        {
          "zh": "用 `ChatDeepSeek(...)` 创建了 `model`",
          "en": "Creates `model` with `ChatDeepSeek(...)`",
          "re": "model\\s*=\\s*ChatDeepSeek\\("
        },
        {
          "zh": "消息依次是 `SystemMessage`、`HumanMessage`、`AIMessage`",
          "en": "Messages go `SystemMessage`, `HumanMessage`, `AIMessage` in order",
          "re": "SystemMessage\\([\\s\\S]*HumanMessage\\([\\s\\S]*AIMessage\\("
        },
        {
          "zh": "用 `model.invoke(messages)` 调用",
          "en": "Calls `model.invoke(messages)`",
          "re": "model\\.invoke\\(\\s*messages\\s*\\)"
        },
        {
          "zh": "打印 `.content`",
          "en": "Prints `.content`",
          "re": "print\\(\\s*\\w+\\.content\\s*\\)"
        },
        {
          "zh": "从 `usage_metadata` 里取 `total_tokens`",
          "en": "Reads `total_tokens` from `usage_metadata`",
          "re": "usage_metadata\\[\\s*[\\\"']total_tokens[\\\"']\\s*\\]"
        },
        {
          "zh": "用 `ChatOpenAI(...)` 并传入 `base_url=BASE_URL`",
          "en": "Uses `ChatOpenAI(...)` with `base_url=BASE_URL`",
          "re": "ChatOpenAI\\([^)]*base_url\\s*=\\s*BASE_URL"
        },
        {
          "zh": "第二个模型用的是同一个 `messages`",
          "en": "The second model gets the same `messages`",
          "re": "\\w+\\.invoke\\(\\s*messages\\s*\\)[\\s\\S]*\\w+\\.invoke\\(\\s*messages\\s*\\)"
        }
      ]
    },
    {
      "title": {
        "zh": "手写：三种提示词模板",
        "en": "Write it: three kinds of prompt template"
      },
      "task": {
        "zh": "写出视频里的三个模板例子：\n1. `PromptTemplate.from_template`：带 `{subject}` 槽的「讲一个笑话」模板，用 `format(subject=...)` 填槽，交给模型并打印回答\n2. `ChatPromptTemplate.from_messages`：一条 `SystemMessagePromptTemplate`（带 `{shop}` 和 `{name}`）+ 一条 `HumanMessagePromptTemplate`（`{query}`），用 `format_messages(...)` 填值，交给模型\n3. `ChatPromptTemplate.from_messages`：`MessagesPlaceholder(\"history\")` + 一条带 `{language}` 的翻译指令；`history` 填一个两条消息的列表，`language` 填一种语言，用 `invoke({...})` 填值，交给模型\n\n本地版练习：`practice/l45_templates_todo.py`。",
        "en": "Write the video's three template examples:\n1. `PromptTemplate.from_template`: a “tell a joke” template with a `{subject}` slot, filled with `format(subject=...)`, sent to the model, answer printed\n2. `ChatPromptTemplate.from_messages`: a `SystemMessagePromptTemplate` (with `{shop}` and `{name}`) + a `HumanMessagePromptTemplate` (`{query}`), filled with `format_messages(...)`, sent to the model\n3. `ChatPromptTemplate.from_messages`: `MessagesPlaceholder(\"history\")` + a translation instruction with `{language}`; fill `history` with a two-message list and `language` with a language using `invoke({...})`, then send it to the model\n\nLocal version of this exercise: `practice/l45_templates_todo.py`."
      },
      "starter": {
        "zh": "from langchain_core.messages import AIMessage, HumanMessage\nfrom langchain_core.prompts import (ChatPromptTemplate, HumanMessagePromptTemplate,\n                                    MessagesPlaceholder, PromptTemplate,\n                                    SystemMessagePromptTemplate)\nfrom langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 1. PromptTemplate：讲一个关于 {subject} 的笑话\n\n\n# 2. ChatPromptTemplate：system（{shop}、{name}）+ human（{query}），用 format_messages 填值\n\n\n# 3. 历史占位符（history）+ 翻译成 {language}，用 invoke 填值",
        "en": "from langchain_core.messages import AIMessage, HumanMessage\nfrom langchain_core.prompts import (ChatPromptTemplate, HumanMessagePromptTemplate,\n                                    MessagesPlaceholder, PromptTemplate,\n                                    SystemMessagePromptTemplate)\nfrom langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 1. PromptTemplate: tell a joke about {subject}\n\n\n# 2. ChatPromptTemplate: system ({shop}, {name}) + human ({query}), filled with format_messages\n\n\n# 3. a history placeholder (history) + translate into {language}, filled with invoke"
      },
      "solution": {
        "zh": "from langchain_core.messages import AIMessage, HumanMessage\nfrom langchain_core.prompts import (ChatPromptTemplate, HumanMessagePromptTemplate,\n                                    MessagesPlaceholder, PromptTemplate,\n                                    SystemMessagePromptTemplate)\nfrom langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 1. PromptTemplate：讲一个关于 {subject} 的笑话\ntemplate = PromptTemplate.from_template(\"给我讲一个关于{subject}的笑话\")\nprompt = template.format(subject=\"小明\")\nprint(model.invoke(prompt).content)\n\n# 2. ChatPromptTemplate：system（{shop}、{name}）+ human（{query}），用 format_messages 填值\nchat_template = ChatPromptTemplate.from_messages([\n    SystemMessagePromptTemplate.from_template(\"你是{shop}的客服助手，你的名字叫{name}。\"),\n    HumanMessagePromptTemplate.from_template(\"{query}\"),\n])\nmessages = chat_template.format_messages(shop=\"西湖书店\", name=\"小书\", query=\"你是谁？\")\nprint(model.invoke(messages).content)\n\n# 3. MessagesPlaceholder(\"history\") + 翻译成 {language}，用 invoke 填值\nhistory_template = ChatPromptTemplate.from_messages([\n    MessagesPlaceholder(\"history\"),\n    HumanMessagePromptTemplate.from_template(\"把你上面的回答翻译成{language}。\"),\n])\nhistory = [\n    HumanMessage(content=\"Who is Elon Musk?\"),\n    AIMessage(content=\"Elon Musk is an entrepreneur who runs Tesla and SpaceX.\"),\n]\nprompt_value = history_template.invoke({\"history\": history, \"language\": \"中文\"})\nprint(model.invoke(prompt_value).content)",
        "en": "from langchain_core.messages import AIMessage, HumanMessage\nfrom langchain_core.prompts import (ChatPromptTemplate, HumanMessagePromptTemplate,\n                                    MessagesPlaceholder, PromptTemplate,\n                                    SystemMessagePromptTemplate)\nfrom langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 1. PromptTemplate: tell a joke about {subject}\ntemplate = PromptTemplate.from_template(\"Tell me a joke about {subject}\")\nprompt = template.format(subject=\"Xiao Ming\")\nprint(model.invoke(prompt).content)\n\n# 2. ChatPromptTemplate: system ({shop}, {name}) + human ({query}), filled with format_messages\nchat_template = ChatPromptTemplate.from_messages([\n    SystemMessagePromptTemplate.from_template(\"You are the customer-service assistant of {shop}. Your name is {name}.\"),\n    HumanMessagePromptTemplate.from_template(\"{query}\"),\n])\nmessages = chat_template.format_messages(shop=\"West Lake Books\", name=\"Booky\", query=\"Who are you?\")\nprint(model.invoke(messages).content)\n\n# 3. MessagesPlaceholder(\"history\") + translate into {language}, filled with invoke\nhistory_template = ChatPromptTemplate.from_messages([\n    MessagesPlaceholder(\"history\"),\n    HumanMessagePromptTemplate.from_template(\"Translate your answer above into {language}.\"),\n])\nhistory = [\n    HumanMessage(content=\"Who is Elon Musk?\"),\n    AIMessage(content=\"Elon Musk is an entrepreneur who runs Tesla and SpaceX.\"),\n]\nprompt_value = history_template.invoke({\"history\": history, \"language\": \"Chinese\"})\nprint(model.invoke(prompt_value).content)"
      },
      "checks": [
        {
          "zh": "用 `PromptTemplate.from_template` 写了带 `{subject}` 的模板",
          "en": "Writes a template with `{subject}` via `PromptTemplate.from_template`",
          "re": "PromptTemplate\\.from_template\\(\\s*[\\\"'][^\\\"']*\\{subject\\}"
        },
        {
          "zh": "用 `format(subject=...)` 填槽",
          "en": "Fills the slot with `format(subject=...)`",
          "re": "\\.format\\(\\s*subject\\s*="
        },
        {
          "zh": "用了 `SystemMessagePromptTemplate.from_template(...)`",
          "en": "Uses `SystemMessagePromptTemplate.from_template(...)`",
          "re": "SystemMessagePromptTemplate\\.from_template\\("
        },
        {
          "zh": "用 `format_messages(...)` 填聊天模板",
          "en": "Fills the chat template with `format_messages(...)`",
          "re": "\\.format_messages\\("
        },
        {
          "zh": "用了 `MessagesPlaceholder(\"history\")`",
          "en": "Uses `MessagesPlaceholder(\"history\")`",
          "re": "MessagesPlaceholder\\(\\s*[\\\"']history[\\\"']\\s*\\)"
        },
        {
          "zh": "`invoke` 的字典里同时有 `history` 和 `language`",
          "en": "The `invoke` dict has both `history` and `language`",
          "re": "\\.invoke\\(\\s*\\{\\s*[\\\"']history[\\\"']\\s*:[^}]*[\\\"']language[\\\"']\\s*:"
        }
      ]
    },
    {
      "title": {
        "zh": "手写：with_structured_output 提取日期",
        "en": "Write it: extract a date with with_structured_output"
      },
      "task": {
        "zh": "写出视频里的结构化输出例子：\n1. 继承 `BaseModel` 的 `Date` 类：`year`、`month`、`day` 三个 `int` 字段，`era` 一个 `str` 字段（BC 或 AD），每个字段用 `Field(description=...)` 写说明\n2. 一个**关掉思考模式**的 `ChatDeepSeek` 模型，用 `with_structured_output(Date)` 包一层\n3. 一个 `PromptTemplate`：「提取用户输入中的日期」+ `{query}` 槽\n4. 用一句带日期的话调用，打印 `date.year`、`date.month`、`date.day`、`date.era`\n\n可运行的版本：`practice/l45_structured_output.py`。",
        "en": "Write the video's structured-output example:\n1. a `Date` class inheriting `BaseModel`: three `int` fields `year`, `month`, `day` and one `str` field `era` (BC or AD), each described with `Field(description=...)`\n2. a `ChatDeepSeek` model **with thinking switched off**, wrapped with `with_structured_output(Date)`\n3. a `PromptTemplate`: “extract the date from the user's input” + a `{query}` slot\n4. a call with a sentence containing a date, printing `date.year`, `date.month`, `date.day`, `date.era`\n\nRunnable version: `practice/l45_structured_output.py`."
      },
      "starter": {
        "zh": "from langchain_core.prompts import PromptTemplate\nfrom langchain_deepseek import ChatDeepSeek\nfrom pydantic import BaseModel, Field\nfrom llm import API_KEY, MODEL\n\n# 1. Date 类：year、month、day（int）和 era（str）\n\n\n# 2. 关掉思考模式的模型 + with_structured_output\n\n\n# 3. 「提取用户输入中的日期」模板，带 {query} 槽\n\n\n# 4. 调用并打印四个字段",
        "en": "from langchain_core.prompts import PromptTemplate\nfrom langchain_deepseek import ChatDeepSeek\nfrom pydantic import BaseModel, Field\nfrom llm import API_KEY, MODEL\n\n# 1. the Date class: year, month, day (int) and era (str)\n\n\n# 2. a model with thinking off + with_structured_output\n\n\n# 3. an \"extract the date\" template with a {query} slot\n\n\n# 4. call it and print the four fields"
      },
      "solution": {
        "zh": "from langchain_core.prompts import PromptTemplate\nfrom langchain_deepseek import ChatDeepSeek\nfrom pydantic import BaseModel, Field\nfrom llm import API_KEY, MODEL\n\n# 1. Date 类：year、month、day（int）和 era（str）\nclass Date(BaseModel):\n    \"\"\"从文字里提取出的一个日期\"\"\"\n    year: int = Field(description=\"年份，例如 2024\")\n    month: int = Field(description=\"月份，1 到 12\")\n    day: int = Field(description=\"日，1 到 31\")\n    era: str = Field(description=\"公元前写 BC，公元后写 AD\")\n\n# 2. 关掉思考模式的模型 + with_structured_output\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY, extra_body={\"thinking\": {\"type\": \"disabled\"}})\nstructured_model = model.with_structured_output(Date)\n\n# 3. 「提取用户输入中的日期」模板，带 {query} 槽\nprompt = PromptTemplate.from_template(\"提取用户输入中的日期。\\n用户输入：{query}\")\n\n# 4. 调用并打印四个字段\ndate = structured_model.invoke(prompt.invoke({\"query\": \"2024年4月6日，我们全家去西湖划船。\"}))\nprint(date.year, date.month, date.day, date.era)",
        "en": "from langchain_core.prompts import PromptTemplate\nfrom langchain_deepseek import ChatDeepSeek\nfrom pydantic import BaseModel, Field\nfrom llm import API_KEY, MODEL\n\n# 1. the Date class: year, month, day (int) and era (str)\nclass Date(BaseModel):\n    \"\"\"A date extracted from some text\"\"\"\n    year: int = Field(description=\"the year, e.g. 2024\")\n    month: int = Field(description=\"the month, 1 to 12\")\n    day: int = Field(description=\"the day, 1 to 31\")\n    era: str = Field(description=\"BC or AD\")\n\n# 2. a model with thinking off + with_structured_output\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY, extra_body={\"thinking\": {\"type\": \"disabled\"}})\nstructured_model = model.with_structured_output(Date)\n\n# 3. an \"extract the date\" template with a {query} slot\nprompt = PromptTemplate.from_template(\"Extract the date from the user's input.\\nUser input: {query}\")\n\n# 4. call it and print the four fields\ndate = structured_model.invoke(prompt.invoke({\"query\": \"On 6 April 2024 our family went boating on West Lake.\"}))\nprint(date.year, date.month, date.day, date.era)"
      },
      "checks": [
        {
          "zh": "定义了 `class Date(BaseModel)`",
          "en": "Defines `class Date(BaseModel)`",
          "re": "class\\s+Date\\s*\\(\\s*BaseModel\\s*\\)\\s*:"
        },
        {
          "zh": "有 `year: int` 字段",
          "en": "Has a `year: int` field",
          "re": "^\\s+year\\s*:\\s*int"
        },
        {
          "zh": "有 `era: str` 字段",
          "en": "Has an `era: str` field",
          "re": "^\\s+era\\s*:\\s*str"
        },
        {
          "zh": "字段用 `Field(description=...)` 写了说明",
          "en": "Fields are described with `Field(description=...)`",
          "re": "Field\\(\\s*description\\s*="
        },
        {
          "zh": "关掉了思考模式（`extra_body` 里的 `thinking`）",
          "en": "Thinking is switched off (`thinking` in `extra_body`)",
          "re": "extra_body\\s*=\\s*\\{\\s*[\\\"']thinking[\\\"']\\s*:\\s*\\{\\s*[\\\"']type[\\\"']\\s*:\\s*[\\\"']disabled[\\\"']"
        },
        {
          "zh": "调用了 `with_structured_output(Date)`",
          "en": "Calls `with_structured_output(Date)`",
          "re": "with_structured_output\\(\\s*Date\\s*\\)"
        },
        {
          "zh": "模板里有 `{query}` 槽",
          "en": "The template has a `{query}` slot",
          "re": "from_template\\([^)]*\\{query\\}"
        },
        {
          "zh": "用点号读取字段，比如 `date.year`",
          "en": "Reads fields with dots, e.g. `date.year`",
          "re": "print\\([^)]*\\w+\\.year"
        }
      ]
    },
    {
      "title": {
        "zh": "手写：@tool + bind_tools（视频的流程）",
        "en": "Write it: @tool + bind_tools (the video's flow)"
      },
      "task": {
        "zh": "写出视频最后一段的工具调用：\n1. 用 `@tool` 定义 `add` 和 `multiply` 两个工具（带类型标注和 docstring）\n2. 一个字典 `available_tools`，按名字找到工具\n3. 用 `model.bind_tools([...])` 得到 `model_with_tools`\n4. 一个 `messages` 列表（system + human：「3 的 4 倍是多少？」），调用一次模型，得到 `reply`\n5. `messages.append(reply)`；再用 `for call in reply.tool_calls:` 循环：按 `call[\"name\"]` 找到工具，`invoke(call)` 得到的 `ToolMessage` 放进 `messages`\n6. 用整个 `messages` 再调用一次模型，打印最终回答\n\n本地版练习：`practice/l45_bind_tools_todo.py`。",
        "en": "Write the tool call from the video's last part:\n1. two tools, `add` and `multiply`, with `@tool` (type hints and docstrings included)\n2. a dict `available_tools` to look tools up by name\n3. `model_with_tools` from `model.bind_tools([...])`\n4. a `messages` list (system + human: “What is 3 times 4?”) and one model call giving `reply`\n5. `messages.append(reply)`; then a `for call in reply.tool_calls:` loop: find the tool by `call[\"name\"]` and append the `ToolMessage` that `invoke(call)` returns\n6. one more model call with the whole `messages`, printing the final answer\n\nLocal version of this exercise: `practice/l45_bind_tools_todo.py`."
      },
      "starter": {
        "zh": "from langchain_core.messages import HumanMessage, SystemMessage\nfrom langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 1. 用 @tool 定义 add 和 multiply（带类型标注和 docstring）\n\n\n# 2. 字典 available_tools：名字 → 工具\n\n\n# 3. 绑定两个工具，得到 model_with_tools\n\n\n# 4. messages（system + human），调用一次，得到 reply\n\n\n# 5. 存好 reply，再执行每个工具调用，存好 ToolMessage\n\n\n# 6. 再调用一次，打印最终回答",
        "en": "from langchain_core.messages import HumanMessage, SystemMessage\nfrom langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 1. define add and multiply with @tool (type hints and docstrings)\n\n\n# 2. dict available_tools: name -> tool\n\n\n# 3. bind both tools to get model_with_tools\n\n\n# 4. messages (system + human), one call giving reply\n\n\n# 5. store reply, run each tool call, store the ToolMessages\n\n\n# 6. call again and print the final answer"
      },
      "solution": {
        "zh": "from langchain_core.messages import HumanMessage, SystemMessage\nfrom langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 1. 用 @tool 定义 add 和 multiply（带类型标注和 docstring）\n@tool\ndef add(a: int, b: int) -> int:\n    \"\"\"Add two integers.\"\"\"\n    return a + b\n\n@tool\ndef multiply(a: int, b: int) -> int:\n    \"\"\"Multiply two integers.\"\"\"\n    return a * b\n\n# 2. 字典 available_tools：名字 → 工具\navailable_tools = {\"add\": add, \"multiply\": multiply}\n\n# 3. 绑定两个工具，得到 model_with_tools\nmodel_with_tools = model.bind_tools([add, multiply])\n\n# 4. messages（system + human），调用一次，得到 reply\nmessages = [\n    SystemMessage(content=\"遇到计算一律调用工具，不要心算。\"),\n    HumanMessage(content=\"3 的 4 倍是多少？\"),\n]\nreply = model_with_tools.invoke(messages)\n\n# 5. 存好 reply，再执行每个工具调用，存好 ToolMessage\nmessages.append(reply)\nfor call in reply.tool_calls:\n    selected_tool = available_tools[call[\"name\"]]\n    messages.append(selected_tool.invoke(call))\n\n# 6. 再调用一次，打印最终回答\nfinal = model_with_tools.invoke(messages)\nprint(final.content)",
        "en": "from langchain_core.messages import HumanMessage, SystemMessage\nfrom langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 1. define add and multiply with @tool (type hints and docstrings)\n@tool\ndef add(a: int, b: int) -> int:\n    \"\"\"Add two integers.\"\"\"\n    return a + b\n\n@tool\ndef multiply(a: int, b: int) -> int:\n    \"\"\"Multiply two integers.\"\"\"\n    return a * b\n\n# 2. dict available_tools: name -> tool\navailable_tools = {\"add\": add, \"multiply\": multiply}\n\n# 3. bind both tools to get model_with_tools\nmodel_with_tools = model.bind_tools([add, multiply])\n\n# 4. messages (system + human), one call giving reply\nmessages = [\n    SystemMessage(content=\"Always use the tools for arithmetic; never compute in your head.\"),\n    HumanMessage(content=\"What is 3 times 4?\"),\n]\nreply = model_with_tools.invoke(messages)\n\n# 5. store reply, run each tool call, store the ToolMessages\nmessages.append(reply)\nfor call in reply.tool_calls:\n    selected_tool = available_tools[call[\"name\"]]\n    messages.append(selected_tool.invoke(call))\n\n# 6. call again and print the final answer\nfinal = model_with_tools.invoke(messages)\nprint(final.content)"
      },
      "checks": [
        {
          "zh": "用 `@tool` 定义了 `multiply`",
          "en": "Defines `multiply` with `@tool`",
          "re": "@tool\\s*\\ndef\\s+multiply\\s*\\("
        },
        {
          "zh": "用 `bind_tools([...])` 绑定工具",
          "en": "Binds the tools with `bind_tools([...])`",
          "re": "bind_tools\\(\\s*\\["
        },
        {
          "zh": "先把 `reply` 放进 `messages`",
          "en": "Appends `reply` to `messages` first",
          "re": "messages\\.append\\(\\s*reply\\s*\\)"
        },
        {
          "zh": "用 `for ... in reply.tool_calls:` 处理每个调用",
          "en": "Handles each call with `for ... in reply.tool_calls:`",
          "re": "for\\s+\\w+\\s+in\\s+reply\\.tool_calls\\s*:"
        },
        {
          "zh": "按名字取工具：`call[\"name\"]`",
          "en": "Looks the tool up with `call[\"name\"]`",
          "re": "call\\[\\s*[\\\"']name[\\\"']\\s*\\]"
        },
        {
          "zh": "用 `.invoke(call)` 执行工具，得到 `ToolMessage`",
          "en": "Runs the tool with `.invoke(call)` to get a `ToolMessage`",
          "re": "\\.invoke\\(\\s*call\\s*\\)"
        },
        {
          "zh": "打印最终回答的 `.content`",
          "en": "Prints the final answer's `.content`",
          "re": "print\\(\\s*\\w+\\.content\\s*\\)"
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "照着视频或旧教程写 `from langchain.prompts import ...`、`from langchain.schema import ...`、`from langchain.output_parsers import ...`，在 1.x 里报 `ModuleNotFoundError`。到 `langchain_core` 里导入（`OutputFixingParser` 在 `langchain_classic`）。",
      "en": "Copying `from langchain.prompts import ...`, `from langchain.schema import ...` or `from langchain.output_parsers import ...` from the video or old tutorials – `ModuleNotFoundError` in 1.x. Import from `langchain_core` (`OutputFixingParser` lives in `langchain_classic`)."
    },
    {
      "zh": "结构化输出照抄视频：`ChatOpenAI` 连 DeepSeek 时 `with_structured_output` 默认用 json_schema，DeepSeek 不支持（400）；`ChatDeepSeek` 默认用 function_calling，思考模式下也是 400。用关掉思考的 `ChatDeepSeek`，或者 `method=\"json_mode\"`（提示词里写明 JSON 和字段）。",
      "en": "Copying the video's structured output: `ChatOpenAI` pointed at DeepSeek makes `with_structured_output` use json_schema, which DeepSeek doesn't support (400); `ChatDeepSeek` defaults to function_calling, also a 400 while thinking. Use `ChatDeepSeek` with thinking off, or `method=\"json_mode\"` (asking for JSON and naming the fields in the prompt)."
    },
    {
      "zh": "模板字符串前面加了 `f`（槽当场被填掉，或者 `NameError`），或者在模板里直接写 JSON 示例的花括号（被当成槽，`KeyError`）。模板**不加** `f`，真正的花括号写成 `{{ }}`。",
      "en": "Putting `f` before a template string (slots get filled at once, or `NameError`), or writing a JSON example's braces straight into a template (read as slots – `KeyError`). Templates take **no** `f`; real braces are written `{{ }}`."
    },
    {
      "zh": "填模板时漏了槽（报 `missing variables`），或者给 `MessagesPlaceholder` 传了字符串而不是消息列表（报 `ValueError`）。先 `print(template.input_variables)` 对一下。",
      "en": "Leaving out a slot when filling a template (`missing variables`), or giving `MessagesPlaceholder` a string instead of a message list (`ValueError`). Check with `print(template.input_variables)` first."
    },
    {
      "zh": "以为 `JsonOutputParser(pydantic_object=Date)` 会按类检查字段——它只检查是不是合法 JSON，返回字典。要检查字段、要对象，用 `PydanticOutputParser`。",
      "en": "Expecting `JsonOutputParser(pydantic_object=Date)` to check fields against the class – it only checks for valid JSON and returns a dict. For checked fields and an object, use `PydanticOutputParser`."
    },
    {
      "zh": "给 `with_structured_output` 传手写的 JSON Schema 字典却没写 `\"title\"`：报 `ValueError: Unsupported function`（实测）。`title` 会被当成工具名，`description` 也最好写上。",
      "en": "Passing a hand-written JSON Schema dict to `with_structured_output` without `\"title\"`: `ValueError: Unsupported function` (tested). The `title` becomes the tool name; add a `description` too."
    },
    {
      "zh": "`PromptTemplate.from_file(...)` 没写 `encoding=\"utf-8\"`：Windows 按 GBK 读文件，中文模板报 `UnicodeDecodeError`（实测）。",
      "en": "Calling `PromptTemplate.from_file(...)` without `encoding=\"utf-8\"`: Windows reads the file as GBK and a Chinese template raises `UnicodeDecodeError` (tested)."
    },
    {
      "zh": "工具调用时忘了先 `messages.append(reply)`；或者把 LangChain 的 `tool_calls` 当成对象写 `call.function.name`——它是字典的列表，要写 `call[\"name\"]`、`call[\"args\"]`。",
      "en": "Forgetting `messages.append(reply)` in tool calling, or treating LangChain's `tool_calls` as objects (`call.function.name`) – it's a list of dicts: `call[\"name\"]`, `call[\"args\"]`."
    },
    {
      "zh": "`print(reply)` 打印出一大串对象信息，要的其实是 `reply.content`。",
      "en": "`print(reply)` dumps the whole object; you wanted `reply.content`."
    }
  ],
  "recap": [
    {
      "zh": "Model I/O = 提示词模板（输入）→ 模型 → 结构化输出 / 输出解析器（输出）。",
      "en": "Model I/O = prompt template (input) → model → structured output / output parser (output)."
    },
    {
      "zh": "模型封装：每家模型一个类（`ChatDeepSeek`、`ChatOpenAI`……），接口一样——换模型只换创建模型的那一行；`invoke` 返回 `AIMessage`：`.content`、`.usage_metadata`、`.tool_calls`。",
      "en": "Model wrappers: one class per provider (`ChatDeepSeek`, `ChatOpenAI`…) with one interface – switching models changes only the line that creates it; `invoke` returns an `AIMessage`: `.content`, `.usage_metadata`, `.tool_calls`."
    },
    {
      "zh": "消息类和原生接口的角色一一对应：`SystemMessage`=system、`HumanMessage`=user、`AIMessage`=assistant、`ToolMessage`=tool；排成列表交给 `invoke` 就带上了历史。",
      "en": "Message classes map onto the raw API's roles: `SystemMessage`=system, `HumanMessage`=user, `AIMessage`=assistant, `ToolMessage`=tool; put them in a list for `invoke` to carry the history."
    },
    {
      "zh": "模板的槽是占位符，之后才填值（不加 `f`）：`PromptTemplate.from_template` + `format`；`ChatPromptTemplate.from_messages` + `format_messages` / `invoke`；`MessagesPlaceholder` 把整段历史当成一个槽；`from_file(路径, encoding=\"utf-8\")` 把提示词放进文件。",
      "en": "Template slots are placeholders filled later (no `f`): `PromptTemplate.from_template` + `format`; `ChatPromptTemplate.from_messages` + `format_messages` / `invoke`; `MessagesPlaceholder` makes a whole history one slot; `from_file(path, encoding=\"utf-8\")` keeps prompts in files."
    },
    {
      "zh": "`with_structured_output(类)` 直接得到对象，传 JSON Schema 字典（要有 `title`）得到字典；deepseek-flash 要关掉思考或用 json_mode。",
      "en": "`with_structured_output(cls)` returns an object, a JSON Schema dict (with a `title`) returns a dict; deepseek-flash needs thinking off, or json_mode."
    },
    {
      "zh": "先文字后解析：`get_format_instructions()` 放进提示词（`partial_variables`），`JsonOutputParser` → 字典（不检查字段），`PydanticOutputParser` → 对象（检查）；`OutputFixingParser`（在 `langchain_classic`）在解析失败时让模型纠错。",
      "en": "Text first, then parse: put `get_format_instructions()` into the prompt (`partial_variables`); `JsonOutputParser` → dict (fields unchecked), `PydanticOutputParser` → object (checked); `OutputFixingParser` (in `langchain_classic`) has the model repair failed parses."
    },
    {
      "zh": "工具调用：`@tool` + `bind_tools`；先存回复，再对每个 `tool_calls` 执行 `工具.invoke(call)`、存入 `ToolMessage`，最后再调用一次模型。",
      "en": "Tool calling: `@tool` + `bind_tools`; store the reply, run `the_tool.invoke(call)` for each of its `tool_calls` and store the `ToolMessage`, then call the model again."
    }
  ],
  "files": [
    {
      "path": "practice/l45_model_io_todo.py",
      "zh": "练习（一）：模型封装 + 消息类 + 换一个类（第一到三部分，有 TODO 提示）。",
      "en": "Exercise 1: model wrapper + message classes + a different class (parts 1–3, with TODO hints)."
    },
    {
      "path": "practice/l45_model_io_solution.py",
      "zh": "练习（一）的参考答案，调用 3 次模型。",
      "en": "Solution to exercise 1; 3 model calls."
    },
    {
      "path": "practice/l45_templates_todo.py",
      "zh": "练习（二）：照视频的结构写四个模板例子——笑话、客服、翻译历史、从文件加载（第四到七部分，有 TODO 提示）。",
      "en": "Exercise 2: the video's four template examples – the joke, the customer-service bot, translating the history, loading from a file (parts 4–7, with TODO hints)."
    },
    {
      "path": "practice/l45_templates_solution.py",
      "zh": "练习（二）的参考答案，调用 3 次模型。",
      "en": "Solution to exercise 2; 3 model calls."
    },
    {
      "path": "practice/data/l45_guide_prompt.txt",
      "zh": "`from_file` 用的提示词模板文件（英文版是同一文件夹里的 `l45_guide_prompt_en.txt`）。",
      "en": "The prompt template file for `from_file` (the English one is `l45_guide_prompt_en.txt` in the same folder)."
    },
    {
      "path": "practice/l45_structured_output.py",
      "zh": "演示（第八部分）：日期类 + `with_structured_output`，以及 JSON Schema 字典和 json_mode 两种写法，调用 3 次模型。",
      "en": "Demo (part 8): the date class + `with_structured_output`, plus the JSON Schema dict and json_mode forms; 3 model calls."
    },
    {
      "path": "practice/l45_output_parsers.py",
      "zh": "演示（第九、十部分）：`JsonOutputParser`、`PydanticOutputParser`，以及把 4 改成「四」后用 `OutputFixingParser` 修复，调用 2 次模型。",
      "en": "Demo (parts 9–10): `JsonOutputParser`, `PydanticOutputParser`, and repairing the “4 → 四” breakage with `OutputFixingParser`; 2 model calls."
    },
    {
      "path": "practice/l45_bind_tools_todo.py",
      "zh": "练习（三）：`@tool` + `bind_tools`，按视频的流程完成一轮工具调用（第十一部分，有 TODO 提示）。",
      "en": "Exercise 3: `@tool` + `bind_tools`, one round of tool calling following the video (part 11, with TODO hints)."
    },
    {
      "path": "practice/l45_bind_tools_solution.py",
      "zh": "练习（三）的参考答案：打印 `tool_calls` 和整段对话，通常调用 2 次模型。",
      "en": "Solution to exercise 3: prints the `tool_calls` and the whole conversation; usually 2 model calls."
    }
  ]
});
