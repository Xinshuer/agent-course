COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l04",
  "priority": "core",
  "handwrite": true,
  "studyMinutes": 55,
  "source": "subtitle",
  "summary": {
    "zh": "很多模型服务商都提供和 OpenAI 格式一样的接口，所以学会 `openai` 这个库以后，换一个 `base_url`、`api_key` 和 `model` 就能调用 DeepSeek、通义千问等模型。这一节学习创建 client、组织 messages、读懂返回结果、调节 temperature 等参数，以及用 `stream=True` 做流式输出。",
    "en": "Many model providers offer an API in the same format as OpenAI's, so once you know the `openai` library you can call DeepSeek, Qwen and others by changing just `base_url`, `api_key` and `model`. This lesson covers creating a client, building messages, reading the response, tuning parameters such as temperature, and streaming with `stream=True`."
  },
  "goals": [
    {
      "zh": "说清楚「OpenAI 兼容」是什么意思，换服务商时要改哪三样东西",
      "en": "Explain what “OpenAI-compatible” means and which three things change when you switch providers"
    },
    {
      "zh": "用两种方式创建 client（直接传参 / 环境变量），并且不把 key 写进代码",
      "en": "Create a client two ways (arguments / environment variables) without putting the key in your code"
    },
    {
      "zh": "写出一次完整的调用：带 system 和 user 消息，取出 `choices[0].message.content`",
      "en": "Make a complete call with system and user messages and read `choices[0].message.content`"
    },
    {
      "zh": "读懂 `finish_reason` 和 `usage`，知道 temperature、max_tokens、top_p 各管什么",
      "en": "Read `finish_reason` and `usage`, and know what temperature, max_tokens and top_p control"
    },
    {
      "zh": "用 `stream=True` 做流式输出，并处理 `delta.content` 为 None 的情况",
      "en": "Stream with `stream=True` and handle `delta.content` being None"
    },
    {
      "zh": "不看资料，独立手写一次普通调用和一次流式调用",
      "en": "Write a normal call and a streaming call unaided"
    }
  ],
  "blocks": [
    {
      "t": "h",
      "zh": "一、什么是「OpenAI 兼容接口」",
      "en": "1. What “OpenAI-compatible” means"
    },
    {
      "t": "p",
      "zh": "[▶ 05:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=316) OpenAI 的 **Chat Completions** 接口规定了「请求怎么发、结果长什么样」。后来大部分模型服务商都按这个格式提供接口，这就叫 **OpenAI 兼容**。\n\n好处是同一套代码（Python 的 `openai` 库）能调用不同公司的模型。换服务商时只需要改三样东西：\n\n| 要改的 | 作用 | DeepSeek（本课） | 阿里云百炼（视频从 05 集起） |\n|---|---|---|---|\n| `base_url` | 请求发到哪个地址 | `https://api.deepseek.com` | `https://dashscope.aliyuncs.com/compatible-mode/v1` |\n| `api_key` | 证明你是谁，按用量计费 | 环境变量 `DEEPSEEK_API_KEY` | 环境变量 `DASHSCOPE_API_KEY` |\n| `model` | 用哪个模型 | `deepseek-flash` | `qwen-plus` |\n\n不传 `base_url` 时，`openai` 库默认把请求发给 OpenAI 自己的服务器。地址和 key 是**配套**的：DeepSeek 的 key 只能配 DeepSeek 的地址。",
      "en": "[▶ 05:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=316) OpenAI's **Chat Completions** API defines how a request is sent and what the result looks like. Most model providers later adopted the same format; that is what **OpenAI-compatible** means.\n\nThe benefit: one piece of code (Python's `openai` library) can call models from different companies. Switching providers changes only three things:\n\n| What changes | Purpose | DeepSeek (this course) | Alibaba Bailian (the video, from episode 05) |\n|---|---|---|---|\n| `base_url` | Where requests go | `https://api.deepseek.com` | `https://dashscope.aliyuncs.com/compatible-mode/v1` |\n| `api_key` | Who you are, for billing | env var `DEEPSEEK_API_KEY` | env var `DASHSCOPE_API_KEY` |\n| `model` | Which model | `deepseek-flash` | `qwen-plus` |\n\nWithout a `base_url`, the `openai` library sends requests to OpenAI's own servers. The address and the key **belong together**: a DeepSeek key only works with DeepSeek's address."
    },
    {
      "t": "video",
      "zh": "视频的顺序：回顾上节课，列出这一天要学的内容：兼容接口、工具、Agent 循环、记忆（[▶ 02:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=157)）→ 在终端里用 pip 安装 `openai`（[▶ 05:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=348)）→ 设置接口地址和 key 两个环境变量（[▶ 06:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=408)）→ 运行代码问模型「你是谁」，确认环境可用（[▶ 10:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=625)）→ 讲两个必填参数和 messages（[▶ 11:26](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=686)）→ 加一条 system 消息限制回答长度（[▶ 16:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=998)）→ temperature 和温度实验（[▶ 19:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=1185)）→ `stream=True` 流式输出（[▶ 26:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=1597)）。这一集用的模型是当时的 DeepSeek V3，结尾强调：换成通义千问等平台，只要改模型名和接口地址（以及配套的 key）。你跟着课程写的 `api_setting.py`、`temp_test.py`、`stream_case.py` 就对应其中几步，下面按这个顺序展开。\n\n关于安装（[▶ 06:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=378)）：老师提醒，安装时只冒出一两行红字一般没关系，大段的红色报错才说明失败了，要把完整的报错拿去求助。课程的 `.venv` 已经装好了 `openai`。",
      "en": "The video's order: a recap and the day's plan – compatible API, tools, the agent loop, memory ([▶ 02:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=157)) → install `openai` with pip in a terminal ([▶ 05:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=348)) → set two environment variables, the API address and the key ([▶ 06:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=408)) → run the code, asking the model “who are you?”, to check the setup works ([▶ 10:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=625)) → the two required parameters and messages ([▶ 11:26](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=686)) → a system message that limits the answer length ([▶ 16:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=998)) → temperature and a temperature experiment ([▶ 19:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=1185)) → streaming with `stream=True` ([▶ 26:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=1597)). The model in this episode is the DeepSeek V3 of that time, and the video ends by stressing that switching to Qwen or another platform only means changing the model name and address (plus the matching key). The files you wrote along with the course – `api_setting.py`, `temp_test.py`, `stream_case.py` – cover several of these steps; the notes follow the same order.\n\nOn installing ([▶ 06:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=378)): the instructor notes that one or two red lines during installation are usually harmless; only a big block of red error text means it failed, and then you should share the full error when asking for help. The course's `.venv` already has `openai` installed."
    },
    {
      "t": "check",
      "q": {
        "zh": "代码从 DeepSeek 换到通义千问（都用 `openai` 库），通常要改什么？",
        "en": "Moving code from DeepSeek to Qwen (both via the `openai` library), what usually changes?"
      },
      "options": [
        {
          "zh": "整个程序重写一遍",
          "en": "Rewrite the whole program"
        },
        {
          "zh": "只改 `base_url`、`api_key` 和 `model`",
          "en": "Only `base_url`, `api_key` and `model`"
        },
        {
          "zh": "只改 `model`，地址会自动识别",
          "en": "Only `model`; the address is detected automatically"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "请求和返回的格式一样，所以调用代码不用动，只要告诉 client 发到哪里、用哪个 key、调用哪个模型。",
        "en": "The request and response formats match, so the calling code stays; you only tell the client where to send, which key and which model."
      }
    },
    {
      "t": "h",
      "zh": "二、Python 准备：变量、字符串和 import",
      "en": "2. Python basics: variables, strings and import"
    },
    {
      "t": "py",
      "title": {
        "zh": "变量、字符串、import 和 from ... import",
        "en": "Variables, strings, import and from ... import"
      },
      "zh": "**变量**就是给一个值起名字：写了 `MODEL = \"deepseek-flash\"` 之后，`MODEL` 就代表这个字符串。**字符串**是用引号括起来的文字，单引号、双引号都可以，用 `+` 可以把两个字符串接起来。\n\n别人写好的代码放在**模块**里，用之前要先导入：\n- `import os`：导入整个模块，用的时候写 `os.environ`\n- `from llm import client, MODEL`：只从 `llm.py` 里拿出这两个名字，之后直接写 `client`\n\n`from llm import ...` 能成功，是因为 `llm.py` 和你的练习文件在同一个文件夹 `practice` 里。全大写的名字（`MODEL`、`BASE_URL`）是一种习惯写法，表示「这是配置，别在程序里改它」。",
      "en": "A **variable** is a name for a value: after `MODEL = \"deepseek-flash\"`, `MODEL` stands for that string. A **string** is text in quotes – single or double both work – and `+` joins two strings.\n\nCode written by others lives in **modules**, which you import first:\n- `import os` imports the whole module; you then write `os.environ`\n- `from llm import client, MODEL` takes just these two names from `llm.py`, so you can write `client` directly\n\n`from llm import ...` works because `llm.py` sits in the same folder (`practice`) as your exercise. ALL-CAPS names (`MODEL`, `BASE_URL`) are a convention meaning “this is configuration, don't change it in the program”.",
      "code": {
        "zh": "import math                   # 导入整个模块\nfrom math import sqrt         # 只拿出 sqrt 这一个名字\n\nBASE_URL = \"https://api.deepseek.com\"\nMODEL = 'deepseek-flash'      # 单引号也可以\ngreeting = \"你好，\" + \"世界\"    # 用 + 拼接字符串\n\nprint(MODEL)\nprint(greeting)\nprint(math.sqrt(16), sqrt(16))  # 两种导入方式，结果一样\nprint(type(BASE_URL))           # <class 'str'>：字符串类型",
        "en": "import math                   # import the whole module\nfrom math import sqrt         # take only the name sqrt\n\nBASE_URL = \"https://api.deepseek.com\"\nMODEL = 'deepseek-flash'      # single quotes work too\ngreeting = \"Hello, \" + \"world\"  # + joins strings\n\nprint(MODEL)\nprint(greeting)\nprint(math.sqrt(16), sqrt(16))  # both imports give the same result\nprint(type(BASE_URL))           # <class 'str'>: a string"
      }
    },
    {
      "t": "h",
      "zh": "三、创建 client：两种写法",
      "en": "3. Creating the client: two ways"
    },
    {
      "t": "p",
      "zh": "[▶ 06:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=408) 用 `openai` 库调用模型，第一步是创建一个 **client**（客户端）对象，它负责把请求发到 `base_url`，并在请求里带上你的 key。\n\n**写法一：直接把参数传给 `OpenAI(...)`**。key 不要写成字符串，而是从环境变量里读出来。课程的 `practice/llm.py` 用的就是这种写法：",
      "en": "[▶ 06:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=408) To call a model with the `openai` library, you first create a **client** object. It sends requests to `base_url` and attaches your key.\n\n**Way 1: pass the settings to `OpenAI(...)`.** Don't type the key as a string; read it from an environment variable. The course's `practice/llm.py` does exactly this:"
    },
    {
      "t": "code",
      "file": "写法一 / way 1",
      "code": {
        "zh": "import os\nfrom openai import OpenAI\n\nclient = OpenAI(\n    api_key=os.environ.get(\"DEEPSEEK_API_KEY\"),   # 从环境变量读取 key\n    base_url=\"https://api.deepseek.com\",          # 请求发到 DeepSeek\n)",
        "en": "import os\nfrom openai import OpenAI\n\nclient = OpenAI(\n    api_key=os.environ.get(\"DEEPSEEK_API_KEY\"),   # read the key from an env var\n    base_url=\"https://api.deepseek.com\",          # send requests to DeepSeek\n)"
      }
    },
    {
      "t": "p",
      "zh": "**写法二：先设置环境变量，再调用不带参数的 `OpenAI()`**。`OpenAI()` 没收到参数时，会自己去读 `OPENAI_API_KEY` 和 `OPENAI_BASE_URL` 这两个环境变量（这是 openai 库定好的名字，不能改）。",
      "en": "**Way 2: set environment variables, then call `OpenAI()` with no arguments.** Without arguments, `OpenAI()` reads the environment variables `OPENAI_API_KEY` and `OPENAI_BASE_URL` itself (names fixed by the library)."
    },
    {
      "t": "code",
      "file": "写法二 / way 2 (practice/l04_env_client.py)",
      "code": {
        "zh": "import os\nfrom openai import OpenAI\n\n# 把 DeepSeek 的 key 复制给 openai 库认识的变量名（只在本程序里有效）\nos.environ[\"OPENAI_API_KEY\"] = os.environ[\"DEEPSEEK_API_KEY\"]\nos.environ[\"OPENAI_BASE_URL\"] = \"https://api.deepseek.com\"\n\nclient = OpenAI()      # 不传参数：自动读取上面两个环境变量",
        "en": "import os\nfrom openai import OpenAI\n\n# copy the DeepSeek key into the name the library looks for (this program only)\nos.environ[\"OPENAI_API_KEY\"] = os.environ[\"DEEPSEEK_API_KEY\"]\nos.environ[\"OPENAI_BASE_URL\"] = \"https://api.deepseek.com\"\n\nclient = OpenAI()      # no arguments: reads the two variables above"
      }
    },
    {
      "t": "video",
      "zh": "视频用的是写法二：在代码开头设置「接口地址」和「密钥」两个环境变量（变量名很可能就是 `OPENAI_BASE_URL` 和 `OPENAI_API_KEY`），然后 `client = OpenAI()`。老师强调这两个要**配套修改**：用 DeepSeek 的地址就要配 DeepSeek 的 key，换成通义千问就两个一起换；不写地址，请求就会发到 OpenAI 去。\n\n[▶ 08:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=500) 视频里的 key 打了码：谁拿到地址和 key，谁就能用你的模型。在 Python 代码里设置能用，但看代码的人都能看到你的 key；更好的做法是在系统里设置环境变量，这样代码里那两行就可以删掉。本课程的 `DEEPSEEK_API_KEY` 就是这样设置在系统里的（方法见[环境准备](#/setup)）。\n\n[▶ 09:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=563) 老师把整段代码分成三部分：准备（导入、创建客户端，基本是固定写法）→ 调用接口 → 打印结果。运行后能得到一个通顺合理的回答，就说明环境准备好了。真正决定效果的，是调用时传的那些参数。",
      "en": "The video uses way 2: it sets two environment variables at the top of the code, the API address and the key (most likely named `OPENAI_BASE_URL` and `OPENAI_API_KEY`), then calls `client = OpenAI()`. The instructor stresses that the two **change together**: a DeepSeek address needs a DeepSeek key, and switching to Qwen means changing both; with no address at all, requests go to OpenAI.\n\n[▶ 08:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=500) The key is blurred in the video: anyone with the address and the key can use your model. Setting it in Python works, but anyone reading the code sees your key; it's better to set the variables in the system, and then those two lines can go. This course sets `DEEPSEEK_API_KEY` in the system that way (see [Setup](#/setup)).\n\n[▶ 09:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=563) The instructor splits the code into three parts: preparation (imports and creating the client – essentially boilerplate) → calling the API → printing the result. If running it gives a sensible answer, your environment is ready. What really shapes the result is the parameters you pass in the call."
    },
    {
      "t": "warn",
      "zh": "**key 不能写进代码。** 代码会被复制、截图、上传到 GitHub，key 一旦泄露，别人就能花你账户里的钱。正确做法：key 放在环境变量里，代码只负责读取。如果 key 已经泄露，马上到服务商的控制台删掉它，重新生成一个。",
      "en": "**Never put the key in your code.** Code gets copied, screenshotted and pushed to GitHub; a leaked key lets others spend your money. Keep the key in an environment variable and only read it in code. If a key leaks, delete it in the provider's console right away and create a new one."
    },
    {
      "t": "py",
      "title": {
        "zh": "环境变量 os.environ",
        "en": "Environment variables: os.environ"
      },
      "zh": "**环境变量**是操作系统保存的一组「名字 = 值」，每个程序启动时都会拿到一份。Python 里用 `os.environ` 读写，用法像一个字典：\n- `os.environ[\"名字\"]`：读取；变量不存在时报 `KeyError`\n- `os.environ.get(\"名字\")`：读取；不存在时返回 `None`，不报错。还可以给一个默认值：`.get(\"名字\", \"默认值\")`\n- `os.environ[\"名字\"] = \"值\"`：设置；**只对当前这个 Python 程序有效**，程序结束就没了，不会改动 Windows 的设置\n\n所以写法二其实是：先在程序里设置好 `OPENAI_API_KEY`，再让 `OpenAI()` 自己去读。你的 `DEEPSEEK_API_KEY` 则是保存在 Windows 用户环境变量里的，见 [环境准备](#/setup)。",
      "en": "**Environment variables** are “name = value” pairs kept by the operating system; every program gets a copy when it starts. In Python you use `os.environ`, which works like a dict:\n- `os.environ[\"NAME\"]` reads; raises `KeyError` if it doesn't exist\n- `os.environ.get(\"NAME\")` reads; returns `None` instead of failing. You can add a default: `.get(\"NAME\", \"default\")`\n- `os.environ[\"NAME\"] = \"value\"` sets it **for this Python program only**; it vanishes when the program ends and Windows settings are untouched\n\nSo way 2 sets `OPENAI_API_KEY` inside the program and lets `OpenAI()` read it. Your `DEEPSEEK_API_KEY` lives in the Windows user environment – see [Setup](#/setup).",
      "code": {
        "zh": "import os\n\nos.environ[\"MY_DEMO_KEY\"] = \"demo-123\"           # 设置（只在本程序里有效）\nprint(os.environ[\"MY_DEMO_KEY\"])                 # 读取：demo-123\n\nprint(os.environ.get(\"NOT_SET_AT_ALL\"))          # 不存在 -> None\nprint(os.environ.get(\"NOT_SET_AT_ALL\", \"默认值\"))  # 不存在时用默认值\n# os.environ[\"NOT_SET_AT_ALL\"]  这样读不存在的变量会报 KeyError",
        "en": "import os\n\nos.environ[\"MY_DEMO_KEY\"] = \"demo-123\"            # set (this program only)\nprint(os.environ[\"MY_DEMO_KEY\"])                  # read: demo-123\n\nprint(os.environ.get(\"NOT_SET_AT_ALL\"))           # missing -> None\nprint(os.environ.get(\"NOT_SET_AT_ALL\", \"default\"))  # missing -> the default\n# os.environ[\"NOT_SET_AT_ALL\"]  reading a missing variable this way raises KeyError"
      }
    },
    {
      "t": "h",
      "zh": "四、第一次调用：messages 和 role",
      "en": "4. The first call: messages and roles"
    },
    {
      "t": "p",
      "zh": "[▶ 11:26](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=686) 调用模型用 `client.chat.completions.create(...)`，最少要两个参数：\n- `model`：模型名。一个接口后面往往有好几个模型（视频里 DeepSeek 当时有普通的 V3 和推理用的 R1），所以要说清用哪个\n- `messages`：对话内容。它是一个**列表**，每一条消息是一个**字典**，有 `role`（谁说的）和 `content`（说了什么）\n\n[▶ 14:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=844) role 用来区分每条发言是谁说的：`user` 是用户的提问或指令；`assistant` 是模型的回答；`system` 不是提问也不是回答，而是开发者给模型的设定（比如「回答简洁一点」），一般放在最前面。下一节还会遇到第四种 `tool`：工具的执行结果。",
      "en": "[▶ 11:26](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=686) You call the model with `client.chat.completions.create(...)`, which needs at least two arguments:\n- `model`: the model name. One API often offers several models (DeepSeek then had the regular V3 and the reasoning R1, as the video mentions), so you say which one\n- `messages`: the conversation – a **list** in which every message is a **dict** with `role` (who speaks) and `content` (what is said)\n\n[▶ 14:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=844) The role tells you who said what: `user` is the user's question or instruction; `assistant` is the model's answer; `system` is neither – it's the developer's setup for the model (e.g. “keep answers short”) and usually comes first. The next lesson adds a fourth, `tool`: a tool's result."
    },
    {
      "t": "code",
      "file": "api_setting.py",
      "run": "mock",
      "code": {
        "zh": "from llm import client, MODEL\n\ncompletion = client.chat.completions.create(\n    model=MODEL,\n    messages=[\n        {\"role\": \"system\", \"content\": \"You are a helpful assistant.\"},\n        {\"role\": \"user\", \"content\": \"给我讲个笑话\"},\n    ],\n)\n\nprint(completion.choices[0].message.content)",
        "en": "from llm import client, MODEL\n\ncompletion = client.chat.completions.create(\n    model=MODEL,\n    messages=[\n        {\"role\": \"system\", \"content\": \"You are a helpful assistant.\"},\n        {\"role\": \"user\", \"content\": \"Hello! Can you tell me a joke?\"},\n    ],\n)\n\nprint(completion.choices[0].message.content)"
      },
      "note": {
        "zh": "你写的 `api_setting.py` 里直接写了 `model=\"deepseek-flash\"`，效果和 `model=MODEL` 一样。用 `MODEL` 的好处是：以后换模型只改 `llm.py` 一处。",
        "en": "Your `api_setting.py` writes `model=\"deepseek-flash\"` directly, which works the same as `model=MODEL`. Using `MODEL` means a model change touches only `llm.py`."
      }
    },
    {
      "t": "p",
      "zh": "[▶ 11:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=718) **两个必填参数**：`model` 和 `messages` 缺一不可，视频里老师删掉一个参数演示了报错。漏掉其中一个，`openai` 库在发请求之前就会报错：`TypeError: Missing required arguments; Expected either ('messages' and 'model') ...`（实测）。\n\n**system 消息的作用**：它不是提问，也不是回答，而是给这次对话定规则，对后面每一轮都有效，所以放在最前面。下面问同一个问题，第二次只多加了一条限制回答长度的 system 消息：",
      "en": "[▶ 11:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=718) **Two required arguments**: `model` and `messages` must both be there; the instructor removes one in the video to show the error. Leave one out and the `openai` library fails before sending anything: `TypeError: Missing required arguments; Expected either ('messages' and 'model') ...` (tested).\n\n**What the system message does**: it is neither a question nor an answer; it sets rules for the conversation that hold for every later turn, so it goes first. Below, the same question is asked twice; the second time adds just one system message that limits the answer length:"
    },
    {
      "t": "code",
      "file": "system_demo.py",
      "run": "mock",
      "code": {
        "zh": "from llm import client, MODEL\n\nquestion = {\"role\": \"user\", \"content\": \"你是谁？\"}\n\n# 不加 system：回答可能有好几句\nr1 = client.chat.completions.create(model=MODEL, messages=[question])\nprint(\"没有 system：\", r1.choices[0].message.content)\n\n# 加一条 system 消息，放在最前面\nr2 = client.chat.completions.create(\n    model=MODEL,\n    messages=[\n        {\"role\": \"system\", \"content\": \"回答不要超过十个字。\"},\n        question,\n    ],\n)\nprint(\"有 system：\", r2.choices[0].message.content)",
        "en": "from llm import client, MODEL\n\nquestion = {\"role\": \"user\", \"content\": \"Who are you?\"}\n\n# no system message: the answer may run to several sentences\nr1 = client.chat.completions.create(model=MODEL, messages=[question])\nprint(\"without system:\", r1.choices[0].message.content)\n\n# add one system message, placed first\nr2 = client.chat.completions.create(\n    model=MODEL,\n    messages=[\n        {\"role\": \"system\", \"content\": \"Answer in at most ten words.\"},\n        question,\n    ],\n)\nprint(\"with system:\", r2.choices[0].message.content)"
      }
    },
    {
      "t": "video",
      "zh": "[▶ 16:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=998) 视频里就是这样演示的：同样问「你是谁」，加上「不超过十个字」的设定后，原来两行的回答一下子只剩几个字。[▶ 18:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=1124) 老师接着提醒：模型能理解「简短一点」的意思，但很难精确控制字数，要求「正好十个字」往往做不到。所以写设定时，要写模型做得到的要求（「不超过」比「正好」可靠），并且建议把 system 设定放在第一条。",
      "en": "[▶ 16:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=998) This is the video's demo: the same “who are you?”, and with a “no more than ten characters” rule the two-line answer shrinks to a few characters. [▶ 18:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=1124) The instructor then warns that a model understands “keep it short” but can't count characters precisely, so “exactly ten characters” often fails. Write rules the model can actually follow (“at most” is more reliable than “exactly”), and put the system message first."
    },
    {
      "t": "py",
      "title": {
        "zh": "关键字参数、字典和列表",
        "en": "Keyword arguments, dicts and lists"
      },
      "zh": "`create(model=MODEL, messages=[...])` 里的 `model=`、`messages=` 叫**关键字参数**：用「参数名=值」的方式传参。顺序可以随便写，读代码的人也一眼看出每个值是干什么的。`create` 的所有参数都要这样写。\n\n- **字典** `{\"role\": \"user\", \"content\": \"你好\"}`：一组「键: 值」，用 `d[\"role\"]` 按键取值\n- **列表** `[a, b, c]`：按顺序放多个值，用 `xs[0]` 取第一个（下标从 0 开始）\n\n`messages` 就是「列表里装着字典」。下面顺便看看 `print` 的两个关键字参数 `sep` 和 `end`，后面流式输出会用到 `end`。",
      "en": "In `create(model=MODEL, messages=[...])`, `model=` and `messages=` are **keyword arguments**: you pass values as “name=value”. Their order doesn't matter, and readers see at once what each value is for. Every argument of `create` is passed this way.\n\n- A **dict** `{\"role\": \"user\", \"content\": \"Hi\"}` holds “key: value” pairs; `d[\"role\"]` reads by key\n- A **list** `[a, b, c]` holds values in order; `xs[0]` is the first (indexes start at 0)\n\n`messages` is “a list of dicts”. Below you also meet two keyword arguments of `print`, `sep` and `end`; streaming will need `end`.",
      "code": {
        "zh": "# print 的关键字参数\nprint(\"a\", \"b\", \"c\", sep=\"-\")    # a-b-c：用 - 隔开\nprint(\"不换行\", end=\"\")           # end=\"\"：打印完不换行\nprint(\"……接着上一行\")\n\n# 字典：键 -> 值\nmsg = {\"role\": \"user\", \"content\": \"你好\"}\nprint(msg[\"role\"])                # user\n\n# 列表里装字典：这就是 messages\nmessages = [\n    {\"role\": \"system\", \"content\": \"你是一个乐于助人的助手。\"},\n    {\"role\": \"user\", \"content\": \"给我讲个笑话\"},\n]\nprint(messages[0][\"role\"])        # system：第一条消息的 role\nprint(messages[1][\"content\"])     # 第二条消息的内容",
        "en": "# keyword arguments of print\nprint(\"a\", \"b\", \"c\", sep=\"-\")    # a-b-c: separated by -\nprint(\"no newline\", end=\"\")       # end=\"\": don't end the line\nprint(\" ...continued\")\n\n# a dict: key -> value\nmsg = {\"role\": \"user\", \"content\": \"Hi\"}\nprint(msg[\"role\"])                # user\n\n# a list of dicts: that's messages\nmessages = [\n    {\"role\": \"system\", \"content\": \"You are a helpful assistant.\"},\n    {\"role\": \"user\", \"content\": \"Tell me a joke\"},\n]\nprint(messages[0][\"role\"])        # system: role of the first message\nprint(messages[1][\"content\"])     # content of the second message"
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "下面哪一种 `messages` 写法是对的？",
        "en": "Which `messages` value is correct?"
      },
      "options": [
        {
          "zh": "`messages={\"role\": \"user\", \"content\": \"你好\"}`",
          "en": "`messages={\"role\": \"user\", \"content\": \"Hi\"}`"
        },
        {
          "zh": "`messages=[\"user\", \"你好\"]`",
          "en": "`messages=[\"user\", \"Hi\"]`"
        },
        {
          "zh": "`messages=[{\"role\": \"user\", \"content\": \"你好\"}]`",
          "en": "`messages=[{\"role\": \"user\", \"content\": \"Hi\"}]`"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "`messages` 必须是列表，列表里每一项是带 `role` 和 `content` 的字典。只有一条消息时也要放进列表。",
        "en": "`messages` must be a list whose items are dicts with `role` and `content` – even when there is only one message."
      }
    },
    {
      "t": "h",
      "zh": "五、读懂返回结果（补充）",
      "en": "5. Reading the response (extra)"
    },
    {
      "t": "note",
      "zh": "补充：视频只用到了 `choices[0].message.content`。下面多看几个字段，是因为 05 节要靠 `finish_reason` 判断模型想不想用工具，06 节要用 `usage` 和分词器数 token。",
      "en": "Extra: the video only uses `choices[0].message.content`. We look at a few more fields because lesson 05 relies on `finish_reason` to tell whether the model wants a tool, and lesson 06 counts tokens with `usage` and a tokenizer."
    },
    {
      "t": "p",
      "zh": "`create(...)` 返回的 `completion` 是一个嵌套的对象，简化后的结构是这样（数字来自一次真实调用）：",
      "en": "The `completion` returned by `create(...)` is a nested object. Simplified, it looks like this (numbers from a real call):"
    },
    {
      "t": "code",
      "lang": "text",
      "file": "completion 的结构 / structure",
      "code": {
        "zh": "completion\n├── id       \"789a3ade-...\"\n├── model    \"deepseek-flash\"\n├── choices  [ ... ]                  ← 列表，平时只有 1 个回答\n│   └── [0]\n│       ├── message\n│       │   ├── role     \"assistant\"\n│       │   └── content  \"小时候我妈说……\"   ← 我们要的文字\n│       └── finish_reason  \"stop\"      ← 为什么停下\n└── usage\n    ├── prompt_tokens      45          ← 输入用了多少 token\n    ├── completion_tokens  313         ← 输出用了多少（含思考）\n    └── total_tokens       358",
        "en": "completion\n├── id       \"789a3ade-...\"\n├── model    \"deepseek-flash\"\n├── choices  [ ... ]                  ← a list, usually 1 answer\n│   └── [0]\n│       ├── message\n│       │   ├── role     \"assistant\"\n│       │   └── content  \"When I was little...\"  ← the text we want\n│       └── finish_reason  \"stop\"      ← why it stopped\n└── usage\n    ├── prompt_tokens      45          ← tokens in the input\n    ├── completion_tokens  313         ← tokens in the output (incl. thinking)\n    └── total_tokens       358"
      }
    },
    {
      "t": "p",
      "zh": "`completion.choices[0].message.content` 就是沿着这棵树一层层往下取。另外几个常用字段：\n- **`finish_reason`**：`\"stop\"` 正常说完；`\"length\"` 达到长度上限被截断了；`\"tool_calls\"` 模型想调用工具（下一节）。\n- **`usage`**：这次请求用了多少 **token**。token 是模型切分文字的小单位，计费和长度限制都按 token 算。\n- **`choices` 为什么是列表**：接口允许一次要几个候选回答（参数 `n`），平时只有一个，所以总是写 `[0]`。\n\n看不懂某个返回结果时，用 `print(completion.model_dump_json(indent=2))` 把完整结构打印出来看看。",
      "en": "`completion.choices[0].message.content` simply walks down this tree. Other useful fields:\n- **`finish_reason`**: `\"stop\"` – finished normally; `\"length\"` – hit the length limit and was cut off; `\"tool_calls\"` – the model wants a tool (next lesson).\n- **`usage`**: how many **tokens** the request used. Tokens are the small pieces a model splits text into; billing and length limits count tokens.\n- **Why `choices` is a list**: the API can return several candidate answers (parameter `n`). Normally there is one, so you always write `[0]`.\n\nWhen a response puzzles you, print the whole thing: `print(completion.model_dump_json(indent=2))`."
    },
    {
      "t": "code",
      "file": "inspect_response.py",
      "run": "mock",
      "code": {
        "zh": "from llm import client, MODEL\n\ncompletion = client.chat.completions.create(\n    model=MODEL,\n    messages=[{\"role\": \"user\", \"content\": \"用一句话介绍杭州\"}],\n)\n\nmessage = completion.choices[0].message\nprint(\"回答：\", message.content)\nprint(\"角色：\", message.role)\nprint(\"结束原因：\", completion.choices[0].finish_reason)\nprint(f\"输入 {completion.usage.prompt_tokens} 个 token，输出 {completion.usage.completion_tokens} 个，共 {completion.usage.total_tokens} 个\")\n\nprint(completion.model_dump_json(indent=2))   # 打印完整结构",
        "en": "from llm import client, MODEL\n\ncompletion = client.chat.completions.create(\n    model=MODEL,\n    messages=[{\"role\": \"user\", \"content\": \"Describe Hangzhou in one sentence\"}],\n)\n\nmessage = completion.choices[0].message\nprint(\"answer:\", message.content)\nprint(\"role:\", message.role)\nprint(\"finish reason:\", completion.choices[0].finish_reason)\nprint(f\"{completion.usage.prompt_tokens} tokens in, {completion.usage.completion_tokens} out, {completion.usage.total_tokens} in total\")\n\nprint(completion.model_dump_json(indent=2))   # print the whole structure"
      }
    },
    {
      "t": "py",
      "title": {
        "zh": "点号「.」、下标「[0]」和 f-string",
        "en": "Dots, [0] indexing and f-strings"
      },
      "zh": "`completion.choices[0].message.content` 从左往右一层层取，三种写法各有用处：\n- `.名字`：取**对象**的属性。SDK 返回的结果是对象，所以写 `.choices`、`.message`\n- `[0]`：取**列表**的第 0 个元素\n- `[\"键\"]`：取**字典**里某个键的值\n\n用错了会报错：对列表写 `.message` 会出现 `AttributeError: 'list' object has no attribute 'message'`。不确定一个值是什么类型时，先 `print(type(x))`。\n\n**f-string**：在字符串前面加 `f`，里面用 `{}` 放变量，Python 会把值填进去，比用 `+` 拼接方便，也不用先把数字转成字符串。\n\n下面用 `SimpleNamespace` 造一个和 SDK 结构相同的假结果来练习（它只是一个可以用点号取属性的简单对象）：",
      "en": "`completion.choices[0].message.content` is read left to right, and each notation has a job:\n- `.name` reads an **object's** attribute. The SDK returns objects, hence `.choices` and `.message`\n- `[0]` takes element 0 of a **list**\n- `[\"key\"]` reads a key from a **dict**\n\nMixing them up fails: `.message` on a list gives `AttributeError: 'list' object has no attribute 'message'`. When unsure what something is, `print(type(x))`.\n\n**f-strings**: put `f` before the quotes and variables inside `{}`; Python fills in the values. Easier than joining with `+`, and numbers need no conversion.\n\nBelow, `SimpleNamespace` builds a fake result with the SDK's shape to practise on (it is just a simple object you can read with dots):",
      "code": {
        "zh": "from types import SimpleNamespace as Obj   # 能用点号取属性的简单对象；as Obj 是导入时起的短名字\n\n# 模拟 SDK 的结构：对象里有列表，列表里又是对象\ncompletion = Obj(\n    choices=[Obj(message=Obj(role=\"assistant\", content=\"杭州有西湖。\"), finish_reason=\"stop\")],\n    usage=Obj(total_tokens=32),\n)\n\nfirst = completion.choices[0]       # .choices 取属性，[0] 取列表第一个\nprint(first.message.content)        # 杭州有西湖。\nprint(type(completion.choices))     # <class 'list'>\n\nn = completion.usage.total_tokens\nprint(f\"这次用了 {n} 个 token\")       # f-string：把 n 的值填进 {}\nprint(f\"结束原因：{first.finish_reason}\")\nprint(\"用 + 拼接要先转字符串：\" + str(n))",
        "en": "from types import SimpleNamespace as Obj   # a simple object read with dots; \"as Obj\" gives it a short name\n\n# the SDK's shape: an object holding a list holding objects\ncompletion = Obj(\n    choices=[Obj(message=Obj(role=\"assistant\", content=\"Hangzhou has West Lake.\"), finish_reason=\"stop\")],\n    usage=Obj(total_tokens=32),\n)\n\nfirst = completion.choices[0]       # .choices reads the attribute, [0] the first item\nprint(first.message.content)        # Hangzhou has West Lake.\nprint(type(completion.choices))     # <class 'list'>\n\nn = completion.usage.total_tokens\nprint(f\"This used {n} tokens\")       # f-string: n's value goes into {}\nprint(f\"Finish reason: {first.finish_reason}\")\nprint(\"With + you must convert first: \" + str(n))"
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "写成 `completion.choices.message.content` 会怎样？",
        "en": "What happens with `completion.choices.message.content`?"
      },
      "options": [
        {
          "zh": "正常取到回答",
          "en": "It reads the answer as usual"
        },
        {
          "zh": "取到所有回答拼在一起的文字",
          "en": "It returns all answers joined together"
        },
        {
          "zh": "报 `AttributeError`：`choices` 是列表，要先用 `[0]` 取出一个",
          "en": "`AttributeError`: `choices` is a list; take one item with `[0]` first"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "列表没有 `message` 属性。先 `[0]` 取出第一个回答（一个对象），再用 `.message`。",
        "en": "A list has no `message` attribute. Take the first answer (an object) with `[0]`, then use `.message`."
      }
    },
    {
      "t": "h",
      "zh": "六、常用参数：temperature、max_tokens、top_p",
      "en": "6. Common parameters: temperature, max_tokens, top_p"
    },
    {
      "t": "p",
      "zh": "[▶ 19:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=1185) 除了两个必填参数，`create` 还可以用关键字参数控制生成方式：\n\n| 参数 | 作用 | 取值 |\n|---|---|---|\n| `temperature` | 随机程度：越低越稳定，越高越多样 | 0–2，DeepSeek 默认 1.0 |\n| `top_p` | 只在概率最高、加起来占 p 的那些候选词里挑 | 0–1，一般不改；不要和 temperature 同时调 |\n| `max_tokens` | 回答最多多少个 token，超过就截断（`finish_reason` 变成 `\"length\"`） | 按需要设 |\n\nDeepSeek 文档给的 temperature 建议大致是：写代码、解数学题用 0；数据处理用 1.0；日常对话和翻译用 1.3；写诗、写故事用 1.5。需要稳定、可复现的结果就调低，需要创意就调高。",
      "en": "[▶ 19:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=1185) Besides the two required arguments, `create` takes more keyword arguments that shape the output:\n\n| Parameter | What it does | Values |\n|---|---|---|\n| `temperature` | Randomness: lower is steadier, higher is more varied | 0–2, DeepSeek default 1.0 |\n| `top_p` | Picks only from the most likely words whose probabilities add up to p | 0–1; usually left alone, and don't tune it together with temperature |\n| `max_tokens` | Maximum tokens in the answer; longer output is cut off (`finish_reason` becomes `\"length\"`) | As needed |\n\nDeepSeek's docs roughly suggest: 0 for coding and maths, 1.0 for data work, 1.3 for chat and translation, 1.5 for poems and stories. Go lower for stable, repeatable output and higher for creativity."
    },
    {
      "t": "video",
      "zh": "视频只讲了 temperature（`max_tokens`、`top_p` 是这里补充的）：取值 0–2，默认 1。调低，模型每次都挑最可能的词，回答保守、容易重复；调高，它会选平时不太选的词，更发散、更有新意。[▶ 21:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=1283) 做知识库这类要求严谨的场景，一般用 0 或零点几；艺术创作、找灵感可以调到 1.5～1.7 左右。[▶ 22:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=1345) 老师当场给刚才的代码加上 temperature：设成 0，回答和不加时差不多；调到 1.6、2.0，回答明显换了样，还变长了，system 里「正好十个字」的要求也没守住。他借此再提醒一次：精确的字数要求本来就很难做到，写设定时要考虑模型能不能办到。\n\n[▶ 23:59](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=1439) 温度实验（`temp_test.py`）是留给你课后做的练习：同一个问题，温度从 0 逐步加到 2。老师展示的结果是：1.0 以下的几次回答很像；超过 1.0 后几乎不再重复，语气和篇幅也变了。[▶ 25:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=1537) 他举的 Agent 例子：法律条文类的 Agent 要调低，别天马行空；客服类的 Agent 不能太低，否则像复读机，用户会觉得在跟机器人说话。[▶ 27:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=1658) 后面演示流式输出时，温度还是刚才调大的值，回答写到后面就开始胡言乱语，老师随手改回了 0.9。",
      "en": "The video covers only temperature (`max_tokens` and `top_p` are extras added here): range 0–2, default 1. Turn it down and the model keeps picking the likeliest words – cautious and repetitive; turn it up and it picks words it normally wouldn't – more varied and inventive. [▶ 21:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=1283) Strict tasks such as a knowledge base usually get 0 or a few tenths; art and brainstorming can go to around 1.5–1.7. [▶ 22:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=1345) The instructor then adds temperature to the code on screen: at 0 the answer is about the same as without it; at 1.6 or 2.0 it changes noticeably and gets longer, ignoring the system rule of “exactly ten characters”. He uses this to repeat that exact length requirements are hard for a model, so write rules it can actually meet.\n\n[▶ 23:59](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=1439) The temperature experiment (`temp_test.py`) is homework: the same question with the temperature raised step by step from 0 to 2. The results shown in the video: below 1.0 the answers are very alike; above 1.0 they hardly repeat, and their tone and length change. [▶ 25:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=1537) His agent examples: a legal-texts agent should be low and not let its imagination run; a customer-service agent shouldn't be too low, or it sounds like a parrot and users feel they're talking to a bot. [▶ 27:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=1658) Later, during the streaming demo, the temperature is still at the high value from before and the answer drifts into nonsense towards the end, so the instructor sets it back to 0.9."
    },
    {
      "t": "code",
      "file": "temp_test.py",
      "run": "mock",
      "code": {
        "zh": "from llm import client, MODEL\n\nfor t in [0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8, 2.0]:\n    completion = client.chat.completions.create(\n        model=MODEL,\n        messages=[\n            {\"role\": \"system\", \"content\": \"You are a helpful assistant.\"},\n            {\"role\": \"user\", \"content\": \"给我讲个笑话\"},\n        ],\n        temperature=t,\n        extra_body={\"thinking\": {\"type\": \"disabled\"}},   # DeepSeek：关掉思考，温度才起作用\n    )\n    print(f\"Temperature: {t}, Completion: {completion.choices[0].message.content}\")",
        "en": "from llm import client, MODEL\n\nfor t in [0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8, 2.0]:\n    completion = client.chat.completions.create(\n        model=MODEL,\n        messages=[\n            {\"role\": \"system\", \"content\": \"You are a helpful assistant.\"},\n            {\"role\": \"user\", \"content\": \"Tell me a joke\"},\n        ],\n        temperature=t,\n        extra_body={\"thinking\": {\"type\": \"disabled\"}},   # DeepSeek: thinking off, so temperature applies\n    )\n    print(f\"Temperature: {t}, Completion: {completion.choices[0].message.content}\")"
      },
      "note": {
        "zh": "`for t in [...]:` 让下面缩进的代码对列表里的每个值各执行一次（05 节的 Python 小课堂细讲 for 循环）。网页里的模拟模型不理会 temperature，8 次回答都一样；真实效果请运行 `practice/l04_temperature.py`（会调用 8 次模型）。",
        "en": "`for t in [...]:` runs the indented code once for each value in the list (lesson 05's Python mini-lesson covers for loops). The browser's mock model ignores temperature, so all 8 answers match; for real results run `practice/l04_temperature.py` (8 model calls)."
      }
    },
    {
      "t": "warn",
      "zh": "**deepseek-flash 默认是「思考模式」**：先在 `reasoning_content` 里想一段，再在 `content` 里回答。和视频里不思考的模型相比，有三处不同（实测过）：\n1. 按 DeepSeek 接口文档，思考模式不支持 `temperature`：传了不报错，但不起作用。所以温度实验要加 `extra_body={\"thinking\": {\"type\": \"disabled\"}}` 关掉思考，你自己写的 `temp_test.py` 也要加上这一行。\n2. `max_tokens` 把思考用的 token 也算进去。实测设成 40 时，40 个 token 全用在思考上，`content` 是空字符串，`finish_reason` 是 `\"length\"`。\n3. 思考也计费：`usage.completion_tokens` 里包含了思考的 token。\n\n`extra_body` 用来传 openai 库本身没有、但服务商支持的参数。",
      "en": "**deepseek-flash runs in “thinking mode” by default**: it first reasons in `reasoning_content`, then answers in `content`. Compared with the non-thinking model in the video, three things differ (tested):\n1. Per DeepSeek's API docs, thinking mode doesn't support `temperature`: passing it raises no error but has no effect. For the temperature experiment, turn thinking off with `extra_body={\"thinking\": {\"type\": \"disabled\"}}` – add that line to your own `temp_test.py` too.\n2. `max_tokens` counts the thinking tokens. With 40, all 40 went into thinking: `content` was an empty string and `finish_reason` was `\"length\"`.\n3. Thinking is billed: `usage.completion_tokens` includes those tokens.\n\n`extra_body` passes provider-specific parameters that the `openai` library itself doesn't know."
    },
    {
      "t": "check",
      "q": {
        "zh": "想让模型每次的回答尽量一样（比如生成代码），temperature 应该怎么设？",
        "en": "You want nearly the same answer every time (say, generating code). How should temperature be set?"
      },
      "options": [
        {
          "zh": "调低，接近 0",
          "en": "Low, close to 0"
        },
        {
          "zh": "调高到 2.0",
          "en": "High, up to 2.0"
        },
        {
          "zh": "temperature 和稳定性没有关系",
          "en": "Temperature has nothing to do with stability"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "温度越低，模型越倾向于选最可能的词，结果越稳定。（用 deepseek-flash 时记得先关掉思考模式，温度才起作用。）",
        "en": "The lower the temperature, the more the model sticks to the likeliest words, so output is steadier. (With deepseek-flash, turn thinking off first or temperature has no effect.)"
      }
    },
    {
      "t": "h",
      "zh": "七、流式输出：stream=True",
      "en": "7. Streaming: stream=True"
    },
    {
      "t": "p",
      "zh": "[▶ 26:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=1597) 默认情况下，模型把整段回答生成完才一次性返回，回答长的时候要干等好几秒，用户还以为程序卡住了。加上 `stream=True` 后，`create` 返回的不再是完整结果，而是一个可以**逐块读取**的流：模型每生成一小段就发过来一块（chunk）。网页版聊天机器人的「打字机效果」就是这样做的。\n\n每一块的结构和普通结果很像，只是文字放在 `delta`（增量）里：`chunk.choices[0].delta.content`。",
      "en": "[▶ 26:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=1597) By default the model generates the whole answer before returning it, so a long answer means waiting several seconds – long enough for users to think the program has hung. With `stream=True`, `create` returns a stream you read **piece by piece** instead of a finished result: each small piece (chunk) arrives as soon as it is generated. That's how chatbot websites get their “typewriter” effect.\n\nEach chunk looks like a normal result, except the text sits in `delta` (the increment): `chunk.choices[0].delta.content`."
    },
    {
      "t": "code",
      "file": "stream_case.py",
      "run": "mock",
      "code": {
        "zh": "from llm import client, MODEL\n\ncompletion = client.chat.completions.create(\n    model=MODEL,\n    messages=[\n        {\"role\": \"system\", \"content\": \"You are a helpful assistant.\"},\n        {\"role\": \"user\", \"content\": \"给我讲个笑话\"},\n    ],\n    stream=True,\n)\n\nfor chunk in completion:\n    print(chunk.choices[0].delta.content, end=\"|\")",
        "en": "from llm import client, MODEL\n\ncompletion = client.chat.completions.create(\n    model=MODEL,\n    messages=[\n        {\"role\": \"system\", \"content\": \"You are a helpful assistant.\"},\n        {\"role\": \"user\", \"content\": \"Hello! Can you tell me a joke?\"},\n    ],\n    stream=True,\n)\n\nfor chunk in completion:\n    print(chunk.choices[0].delta.content, end=\"|\")"
      },
      "note": {
        "zh": "`for chunk in completion:` 每收到一块，就把下面缩进的那行执行一次（for 循环在 05 节细讲）。`end=\"|\"` 让每块之间用竖线隔开，能看清回答是一块一块来的。在网页里运行时，注意开头打印出的两个 `None|`：模拟模型学 deepseek-flash 的样子，先发两块「思考」，那时 `content` 是 None，最后一块的 `content` 是空字符串。真实模型的 None 要多得多，见下面的提醒。",
        "en": "`for chunk in completion:` runs the indented line once for every chunk that arrives (lesson 05 covers for loops). `end=\"|\"` separates the chunks with a bar so you can see the answer arrive piece by piece. When you run it in the browser, notice the two `None|` at the start: like deepseek-flash, the mock first sends two “thinking” chunks whose `content` is None, and its last chunk's `content` is an empty string. The real model sends far more None chunks – see the warning below."
      }
    },
    {
      "t": "video",
      "zh": "[▶ 29:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=1754) 视频里加上 `stream=True` 以后，原来打印 `message.content` 的那行就不能用了：结果还没生成完。老师改成用 for 循环一块块取出 `chunk.choices[0].delta.content` 打印。一开始每块各占一行，很难看；[▶ 30:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=1816) 加上 `end=\"\"` 后文字就接成一行；[▶ 30:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=1848) 再把 `end` 换成一个分隔符，就能看出回答确实是有多少输出多少。[▶ 31:51](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=1911) 老师的结论：流式输出的好处只在用户体验，能马上给用户反应；回答的内容本身和不流式没有区别。",
      "en": "[▶ 29:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=1754) In the video, once `stream=True` is added, the old line printing `message.content` no longer works: the result isn't finished yet. The instructor switches to a for loop that takes `chunk.choices[0].delta.content` out piece by piece. At first each piece lands on its own line, which looks bad; [▶ 30:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=1816) with `end=\"\"` the text joins into one line; [▶ 30:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=1848) switching `end` to a separator shows the answer really does come out as it's produced. [▶ 31:51](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=1911) His conclusion: streaming only helps the user experience by responding at once; the answer itself is the same either way."
    },
    {
      "t": "warn",
      "zh": "用 deepseek-flash 真实运行 `stream_case.py`，开头会先打出**几百个** `None|`，然后才是笑话。因为思考阶段的块里只有 `reasoning_content`，`content` 一直是 None（实测两次分别约 860 块和 210 块，每次不一样）。DeepSeek 最后一块的 `content` 是空字符串 `\"\"`，所以末尾不会出现 None。视频里用的模型不思考，不会有这一长串 None。",
      "en": "Running `stream_case.py` for real with deepseek-flash prints **hundreds** of `None|` before the joke: during thinking each chunk carries only `reasoning_content`, and `content` stays None (about 860 and 210 chunks in two tests; it varies). DeepSeek's last chunk has `content` set to the empty string `\"\"`, so no None appears at the end. The model in the video doesn't think, so it shows no such run of None."
    },
    {
      "t": "p",
      "zh": "改进的写法：把 None 换成空字符串，不加分隔符，同时把所有块拼成完整的回答（之后要存进对话记录时会用到）：",
      "en": "A better version: turn None into an empty string, drop the separator, and join the pieces into the full answer (you'll need it later to store in the conversation history):"
    },
    {
      "t": "code",
      "file": "stream_better.py",
      "run": "mock",
      "code": {
        "zh": "from llm import client, MODEL\n\nstream = client.chat.completions.create(\n    model=MODEL,\n    messages=[{\"role\": \"user\", \"content\": \"给我讲个笑话\"}],\n    stream=True,\n)\n\nfull_text = \"\"\nfor chunk in stream:\n    piece = chunk.choices[0].delta.content or \"\"   # None 换成空字符串\n    print(piece, end=\"\")                           # 不换行，接着上一块打印\n    full_text = full_text + piece                  # 拼成完整的回答\nprint()\nprint(\"完整回答：\", full_text)",
        "en": "from llm import client, MODEL\n\nstream = client.chat.completions.create(\n    model=MODEL,\n    messages=[{\"role\": \"user\", \"content\": \"Tell me a joke\"}],\n    stream=True,\n)\n\nfull_text = \"\"\nfor chunk in stream:\n    piece = chunk.choices[0].delta.content or \"\"   # None becomes an empty string\n    print(piece, end=\"\")                           # no newline: continue the line\n    full_text = full_text + piece                  # build the full answer\nprint()\nprint(\"Full answer:\", full_text)"
      },
      "note": {
        "zh": "`x or \"\"`：x 是 None 时得到 `\"\"`，否则就是 x 本身（05 节细讲 `or` 的这种用法）。`full_text = full_text + piece` 也可以简写成 `full_text += piece`。本地运行时如果文字是一下子全部出来的，可以给 print 加上 `flush=True`（09 节细讲）。",
        "en": "`x or \"\"` gives `\"\"` when x is None and x itself otherwise (lesson 05 explains this use of `or`). `full_text = full_text + piece` can be shortened to `full_text += piece`. If the text appears all at once locally, add `flush=True` to print (covered in lesson 09)."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "流式输出时，每一块的文字在哪里？",
        "en": "When streaming, where is each chunk's text?"
      },
      "options": [
        {
          "zh": "`chunk.choices[0].message.content`",
          "en": "`chunk.choices[0].message.content`"
        },
        {
          "zh": "`chunk.choices[0].delta.content`",
          "en": "`chunk.choices[0].delta.content`"
        },
        {
          "zh": "`chunk.content`",
          "en": "`chunk.content`"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "流式的每一块只带「新增的部分」，放在 `delta` 里；`message` 是非流式结果才有的。",
        "en": "Each streamed chunk carries only the new part, in `delta`; `message` exists only in non-streaming results."
      }
    },
    {
      "t": "h",
      "zh": "八、换成视频里的通义千问",
      "en": "8. Switching to the video's Qwen"
    },
    {
      "t": "p",
      "zh": "[▶ 32:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=1943) 这一集视频用的是当时的 DeepSeek V3，老师最后强调：代码和 OpenAI 自己的用法一样，换平台只改模型名和接口地址，参数、输出这些都不用动。现在 DeepSeek 接口只接受 `deepseek-flash` 和 `deepseek-v4-pro` 两个模型名（实测：模型名写错时，报错信息会列出这两个），所以本课用 `deepseek-flash`。从下一集起，视频换成了阿里云百炼的 `qwen-plus`。想和视频完全一致，可以在百炼申请 key，存进环境变量 `DASHSCOPE_API_KEY`，然后把 `llm.py` 里的三项改掉：",
      "en": "[▶ 32:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=5&t=1943) This episode uses the DeepSeek V3 of that time, and the instructor ends by stressing that the code is the same as OpenAI's own usage: switching platforms changes only the model name and the address, while parameters and output handling stay put. Today DeepSeek's API accepts only two model names, `deepseek-flash` and `deepseek-v4-pro` (tested: a misspelled model name gets an error listing both), so this course uses `deepseek-flash`. From the next episode on, the video switches to Alibaba Cloud Bailian's `qwen-plus`. To match the video exactly, get a Bailian key, store it in the environment variable `DASHSCOPE_API_KEY`, and change three lines in `llm.py`:"
    },
    {
      "t": "code",
      "file": "llm.py（百炼版 / Bailian version）",
      "code": {
        "zh": "import os\nfrom openai import OpenAI\n\nBASE_URL = \"https://dashscope.aliyuncs.com/compatible-mode/v1\"   # 改 1：地址\nMODEL = \"qwen-plus\"                                               # 改 2：模型\nAPI_KEY = os.environ.get(\"DASHSCOPE_API_KEY\")                     # 改 3：key\n\nclient = OpenAI(api_key=API_KEY, base_url=BASE_URL)",
        "en": "import os\nfrom openai import OpenAI\n\nBASE_URL = \"https://dashscope.aliyuncs.com/compatible-mode/v1\"   # change 1: address\nMODEL = \"qwen-plus\"                                               # change 2: model\nAPI_KEY = os.environ.get(\"DASHSCOPE_API_KEY\")                     # change 3: key\n\nclient = OpenAI(api_key=API_KEY, base_url=BASE_URL)"
      }
    },
    {
      "t": "p",
      "zh": "调用、取结果、流式输出的代码一行都不用改，这就是「OpenAI 兼容」的意义。各家之间的小差别：\n- 支持的参数和取值范围不完全一样（比如 DeepSeek 的思考模式），以各家文档为准；\n- 有的服务商会在结果里多加自己的字段，比如 DeepSeek 的 `reasoning_content`，用 `model_dump_json(indent=2)` 打印出来就能看到。",
      "en": "Not one line of the calling, reading or streaming code changes – that is the point of “OpenAI-compatible”. Small differences between providers:\n- supported parameters and value ranges vary (e.g. DeepSeek's thinking mode); check each provider's docs\n- some add their own fields to the result, like DeepSeek's `reasoning_content`; print `model_dump_json(indent=2)` to see them."
    },
    {
      "t": "tip",
      "zh": "常见报错先看状态码：\n- **401**：key 不对，或者根本没读到（`os.environ.get` 返回了 None）\n- **402**（DeepSeek）：账户余额不足\n- **400**：请求内容有问题；DeepSeek 的模型名写错就是 400（实测）\n- **422**（DeepSeek）：请求格式不对，比如 role 拼成了 `\"users\"`（实测）\n- **404**：`base_url` 写错了，比如百炼地址漏了末尾的 `/v1`\n- **429**：请求太频繁，稍等再试",
      "en": "Read the status code first:\n- **401**: wrong key, or none was read (`os.environ.get` returned None)\n- **402** (DeepSeek): insufficient balance\n- **400**: something is wrong in the request; a wrong model name on DeepSeek is a 400 (tested)\n- **422** (DeepSeek): the request is malformed, e.g. a role spelled `\"users\"` (tested)\n- **404**: wrong `base_url`, e.g. Bailian's address missing the trailing `/v1`\n- **429**: too many requests; wait and retry"
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "「OpenAI 兼容接口」指的是什么？",
        "en": "What is an “OpenAI-compatible API”?"
      },
      "options": [
        {
          "zh": "只有 OpenAI 公司的模型才能用的接口",
          "en": "An API only OpenAI's own models can use"
        },
        {
          "zh": "把模型下载到本地运行的方式",
          "en": "A way to download and run models locally"
        },
        {
          "zh": "请求和返回的格式与 OpenAI 一样，所以能用 `openai` 库调用别家的模型",
          "en": "An API whose requests and responses match OpenAI's, so the `openai` library can call other providers' models"
        },
        {
          "zh": "OpenAI 收购的其他模型公司",
          "en": "Model companies that OpenAI acquired"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "格式一样，所以同一套代码只要换 `base_url`、`api_key`、`model` 就能调用 DeepSeek、通义千问等。",
        "en": "The formats match, so the same code calls DeepSeek, Qwen and others after changing `base_url`, `api_key` and `model`."
      }
    },
    {
      "q": {
        "zh": "`client = OpenAI()` 一个参数都不传，key 从哪里来？",
        "en": "`client = OpenAI()` gets no arguments. Where does the key come from?"
      },
      "options": [
        {
          "zh": "环境变量 `OPENAI_API_KEY`（地址则来自 `OPENAI_BASE_URL`）",
          "en": "The env var `OPENAI_API_KEY` (and the address from `OPENAI_BASE_URL`)"
        },
        {
          "zh": "环境变量 `DEEPSEEK_API_KEY`",
          "en": "The env var `DEEPSEEK_API_KEY`"
        },
        {
          "zh": "openai 库自带一个免费的 key",
          "en": "The library ships with a free key"
        },
        {
          "zh": "会弹出窗口让你输入",
          "en": "A window pops up asking for it"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "openai 库只认 `OPENAI_API_KEY` 和 `OPENAI_BASE_URL` 这两个名字。用 DeepSeek 时，要么显式传参，要么先把 key 复制到 `OPENAI_API_KEY`。",
        "en": "The library only looks at `OPENAI_API_KEY` and `OPENAI_BASE_URL`. For DeepSeek, either pass the values explicitly or copy the key into `OPENAI_API_KEY` first."
      }
    },
    {
      "q": {
        "zh": "下面哪种保存 key 的做法最合适？",
        "en": "Which way of handling the key is best?"
      },
      "options": [
        {
          "zh": "写在代码第一行，方便修改",
          "en": "On the first line of the code, easy to edit"
        },
        {
          "zh": "写在代码注释里",
          "en": "In a code comment"
        },
        {
          "zh": "存在环境变量里，代码用 `os.environ.get(...)` 读取",
          "en": "In an environment variable, read with `os.environ.get(...)`"
        },
        {
          "zh": "每次运行前发给同事保管",
          "en": "Send it to a colleague before each run"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "代码会被复制和上传，key 不能出现在代码里。环境变量只存在你的电脑上。",
        "en": "Code gets copied and uploaded, so the key must never appear in it. An environment variable stays on your machine."
      }
    },
    {
      "q": {
        "zh": "`finish_reason` 是 `\"length\"` 说明什么？",
        "en": "What does `finish_reason == \"length\"` mean?"
      },
      "options": [
        {
          "zh": "回答正常结束",
          "en": "The answer finished normally"
        },
        {
          "zh": "模型想调用工具",
          "en": "The model wants to call a tool"
        },
        {
          "zh": "输入的 messages 太长了",
          "en": "The input messages were too long"
        },
        {
          "zh": "回答达到 `max_tokens` 上限被截断了（deepseek-flash 甚至可能全用在思考上，`content` 为空）",
          "en": "The answer hit `max_tokens` and was cut off (with deepseek-flash, thinking may even use it all and leave `content` empty)"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "`\"stop\"` 是正常结束，`\"tool_calls\"` 是要调用工具，`\"length\"` 是被长度上限截断。思考模型的思考 token 也算在 `max_tokens` 里。",
        "en": "`\"stop\"` means a normal finish, `\"tool_calls\"` a tool request, `\"length\"` a cut-off at the limit. A thinking model's thinking tokens count towards `max_tokens`."
      }
    },
    {
      "q": {
        "zh": "`stream_case.py` 开头打印出一串 `None|`（网页里两个，真实的 deepseek-flash 几百个），原因和改法是？",
        "en": "`stream_case.py` starts by printing a run of `None|` (two in the browser, hundreds with the real deepseek-flash). Why, and how do you fix it?"
      },
      "options": [
        {
          "zh": "网络断了；重新运行即可",
          "en": "The network dropped; just rerun"
        },
        {
          "zh": "有些块不带文字，`delta.content` 是 None；写成 `delta.content or \"\"`",
          "en": "Some chunks carry no text, so `delta.content` is None; write `delta.content or \"\"`"
        },
        {
          "zh": "模型回答错了；调低 temperature",
          "en": "The model answered wrongly; lower the temperature"
        },
        {
          "zh": "应该用 `message.content` 而不是 `delta.content`",
          "en": "Use `message.content` instead of `delta.content`"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "思考阶段的块只带 `reasoning_content`，`content` 是 None（模拟模型也学了这一点；OpenAI 官方接口则是最后一块不带文字）。`or \"\"` 把 None 换成空字符串，打印和拼接都不会出问题。",
        "en": "Thinking chunks carry only `reasoning_content`, so `content` is None (the mock imitates this; with OpenAI's own API it's the last chunk that has no text). `or \"\"` turns None into an empty string, so printing and joining work."
      }
    },
    {
      "q": {
        "zh": "用 deepseek-flash 做 temperature 实验，0 和 2.0 的回答风格看不出区别，最可能的原因是？",
        "en": "In a temperature experiment with deepseek-flash, 0 and 2.0 look the same. The most likely reason?"
      },
      "options": [
        {
          "zh": "思考模式下 temperature 不起作用，要先用 `extra_body` 关掉思考",
          "en": "Temperature has no effect in thinking mode; turn thinking off with `extra_body` first"
        },
        {
          "zh": "temperature 必须写成字符串",
          "en": "Temperature must be a string"
        },
        {
          "zh": "DeepSeek 不支持 temperature 参数，会直接报错",
          "en": "DeepSeek rejects temperature with an error"
        },
        {
          "zh": "要同时把 top_p 设成 0",
          "en": "top_p must also be set to 0"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "按 DeepSeek 文档，思考模式不支持 temperature，传了也不报错。加上 `extra_body={\"thinking\": {\"type\": \"disabled\"}}` 再试。",
        "en": "Per DeepSeek's docs, thinking mode doesn't support temperature, and passing it raises no error. Add `extra_body={\"thinking\": {\"type\": \"disabled\"}}` and try again."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "创建 client（写法一）",
        "en": "Create the client (way 1)"
      },
      "code": {
        "zh": "import [[os]]\nfrom openai import [[OpenAI]]\n\nclient = OpenAI(\n    api_key=os.environ.[[get]](\"DEEPSEEK_API_KEY\"),\n    [[base_url]]=\"https://api.deepseek.com\",\n)",
        "en": "import [[os]]\nfrom openai import [[OpenAI]]\n\nclient = OpenAI(\n    api_key=os.environ.[[get]](\"DEEPSEEK_API_KEY\"),\n    [[base_url]]=\"https://api.deepseek.com\",\n)"
      },
      "explain": {
        "zh": "key 从环境变量读，`base_url` 决定请求发到哪家服务商。",
        "en": "The key comes from an environment variable; `base_url` decides which provider receives the request."
      }
    },
    {
      "title": {
        "zh": "一次普通调用",
        "en": "A normal call"
      },
      "code": {
        "zh": "from llm import client, MODEL\n\ncompletion = client.[[chat]].[[completions]].[[create]](\n    model=MODEL,\n    messages=[\n        {\"role\": \"[[system]]\", \"content\": \"You are a helpful assistant.\"},\n        {\"role\": \"[[user]]\", \"content\": \"给我讲个笑话\"},\n    ],\n)\nprint(completion.[[choices]][0].[[message]].[[content]])\nprint(f\"共用了 {completion.[[usage]].total_tokens} 个 token\")",
        "en": "from llm import client, MODEL\n\ncompletion = client.[[chat]].[[completions]].[[create]](\n    model=MODEL,\n    messages=[\n        {\"role\": \"[[system]]\", \"content\": \"You are a helpful assistant.\"},\n        {\"role\": \"[[user]]\", \"content\": \"Tell me a joke\"},\n    ],\n)\nprint(completion.[[choices]][0].[[message]].[[content]])\nprint(f\"{completion.[[usage]].total_tokens} tokens used\")"
      },
      "explain": {
        "zh": "`client.chat.completions.create` 是固定写法；回答在 `choices[0].message.content`，用量在 `usage`。",
        "en": "`client.chat.completions.create` is fixed; the answer is at `choices[0].message.content`, token counts in `usage`."
      }
    },
    {
      "title": {
        "zh": "流式输出",
        "en": "Streaming"
      },
      "code": {
        "zh": "stream = client.chat.completions.create(model=MODEL, messages=messages, [[stream=True]])\nfull_text = \"\"\nfor chunk in [[stream]]:\n    piece = chunk.choices[0].[[delta]].content [[or \"\"]]\n    print(piece, [[end=\"\"]])\n    full_text = full_text + piece",
        "en": "stream = client.chat.completions.create(model=MODEL, messages=messages, [[stream=True]])\nfull_text = \"\"\nfor chunk in [[stream]]:\n    piece = chunk.choices[0].[[delta]].content [[or \"\"]]\n    print(piece, [[end=\"\"]])\n    full_text = full_text + piece"
      },
      "explain": {
        "zh": "流式结果要用 for 一块块读；文字在 `delta` 里，可能是 None；`end=\"\"` 让文字接在同一行。",
        "en": "Read a stream chunk by chunk with for; the text is in `delta` and may be None; `end=\"\"` keeps it on one line."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：第一次调用模型",
        "en": "Write it: your first model call"
      },
      "task": {
        "zh": "不看上面的代码，写出：\n1. 从 `llm` 导入 `client` 和 `MODEL`\n2. 准备 `messages`：一条 system 消息（随便设定一个角色），一条 user 消息（让它讲个笑话）\n3. 调用 `client.chat.completions.create`\n4. 打印回答的文字，再用 f-string 打印 `finish_reason` 和 `usage.total_tokens`",
        "en": "Without looking above, write:\n1. import `client` and `MODEL` from `llm`\n2. build `messages`: one system message (any persona) and one user message (ask for a joke)\n3. call `client.chat.completions.create`\n4. print the answer text, then print `finish_reason` and `usage.total_tokens` with f-strings"
      },
      "run": "mock",
      "starter": {
        "zh": "# 1. 从 llm 导入 client 和 MODEL\n\n\n# 2. 准备对话：一条 system，一条 user\n\n\n# 3. 调用模型\n\n\n# 4. 打印回答，再打印结束原因和 token 总数\n",
        "en": "# 1. import client and MODEL from llm\n\n\n# 2. the conversation: one system, one user message\n\n\n# 3. call the model\n\n\n# 4. print the answer, then the finish reason and total tokens\n"
      },
      "solution": {
        "zh": "# 1. 从 llm 导入 client 和 MODEL\nfrom llm import client, MODEL\n\n# 2. 准备对话：一条 system，一条 user\nmessages = [\n    {\"role\": \"system\", \"content\": \"你是一个幽默的助手。\"},\n    {\"role\": \"user\", \"content\": \"给我讲个笑话\"},\n]\n\n# 3. 调用模型\ncompletion = client.chat.completions.create(model=MODEL, messages=messages)\n\n# 4. 打印回答，再打印结束原因和 token 总数\nprint(completion.choices[0].message.content)\nprint(f\"finish_reason: {completion.choices[0].finish_reason}\")\nprint(f\"total_tokens: {completion.usage.total_tokens}\")",
        "en": "# 1. import client and MODEL from llm\nfrom llm import client, MODEL\n\n# 2. the conversation: one system, one user message\nmessages = [\n    {\"role\": \"system\", \"content\": \"You are a funny assistant.\"},\n    {\"role\": \"user\", \"content\": \"Tell me a joke\"},\n]\n\n# 3. call the model\ncompletion = client.chat.completions.create(model=MODEL, messages=messages)\n\n# 4. print the answer, then the finish reason and total tokens\nprint(completion.choices[0].message.content)\nprint(f\"finish_reason: {completion.choices[0].finish_reason}\")\nprint(f\"total_tokens: {completion.usage.total_tokens}\")"
      },
      "checks": [
        {
          "zh": "从 `llm` 导入了 `client`",
          "en": "Imports `client` from `llm`",
          "re": "^from\\s+llm\\s+import\\b.*\\bclient\\b"
        },
        {
          "zh": "有一条 role 为 system 的消息",
          "en": "Has a message with role system",
          "re": "[\"']role[\"']\\s*:\\s*[\"']system[\"']"
        },
        {
          "zh": "有一条 role 为 user 的消息",
          "en": "Has a message with role user",
          "re": "[\"']role[\"']\\s*:\\s*[\"']user[\"']"
        },
        {
          "zh": "调用了 `client.chat.completions.create(...)`",
          "en": "Calls `client.chat.completions.create(...)`",
          "re": "client\\.chat\\.completions\\.create\\("
        },
        {
          "zh": "用关键字参数传入 `model=MODEL`",
          "en": "Passes `model=MODEL` as a keyword argument",
          "re": "model\\s*=\\s*MODEL"
        },
        {
          "zh": "用关键字参数传入 `messages=...`",
          "en": "Passes `messages=...` as a keyword argument",
          "re": "create\\([^)]*messages\\s*="
        },
        {
          "zh": "取出 `choices[0].message.content`",
          "en": "Reads `choices[0].message.content`",
          "re": "choices\\[0\\]\\.message\\.content"
        },
        {
          "zh": "用 f-string 打印 `finish_reason`",
          "en": "Prints `finish_reason` in an f-string",
          "re": "\\bf[\"'].*\\{[^}]*finish_reason"
        },
        {
          "zh": "读取了 `usage.total_tokens`",
          "en": "Reads `usage.total_tokens`",
          "re": "usage\\.total_tokens"
        }
      ]
    },
    {
      "title": {
        "zh": "手写：流式输出并拼出完整回答",
        "en": "Write it: stream and rebuild the full answer"
      },
      "task": {
        "zh": "在 starter 的基础上：\n1. 用流式方式调用模型\n2. 用 for 循环逐块读取，把每块文字不换行地打印出来，并拼到 `full_text` 上（注意文字可能是 None）\n3. 最后换一行，再打印一次完整回答",
        "en": "Starting from the starter code:\n1. call the model in streaming mode\n2. loop over the chunks with for, print each piece without a newline and add it to `full_text` (the text may be None)\n3. end the line, then print the full answer once more"
      },
      "run": "mock",
      "starter": {
        "zh": "from llm import client, MODEL\n\nmessages = [{\"role\": \"user\", \"content\": \"用三句话介绍一下你自己\"}]\n\n# 1. 用流式方式调用模型\n\n\n# 2. 逐块打印（不换行），拼成完整回答\n\n\n# 3. 换行后打印完整回答\n",
        "en": "from llm import client, MODEL\n\nmessages = [{\"role\": \"user\", \"content\": \"Introduce yourself in three sentences\"}]\n\n# 1. call the model in streaming mode\n\n\n# 2. print each piece (no newline) and build the full answer\n\n\n# 3. end the line and print the full answer\n"
      },
      "solution": {
        "zh": "from llm import client, MODEL\n\nmessages = [{\"role\": \"user\", \"content\": \"用三句话介绍一下你自己\"}]\n\n# 1. 用流式方式调用模型\nstream = client.chat.completions.create(model=MODEL, messages=messages, stream=True)\n\n# 2. 逐块打印（不换行），拼成完整回答\nfull_text = \"\"\nfor chunk in stream:\n    piece = chunk.choices[0].delta.content or \"\"\n    print(piece, end=\"\")\n    full_text += piece\n\n# 3. 换行后打印完整回答\nprint()\nprint(\"完整回答：\", full_text)",
        "en": "from llm import client, MODEL\n\nmessages = [{\"role\": \"user\", \"content\": \"Introduce yourself in three sentences\"}]\n\n# 1. call the model in streaming mode\nstream = client.chat.completions.create(model=MODEL, messages=messages, stream=True)\n\n# 2. print each piece (no newline) and build the full answer\nfull_text = \"\"\nfor chunk in stream:\n    piece = chunk.choices[0].delta.content or \"\"\n    print(piece, end=\"\")\n    full_text += piece\n\n# 3. end the line and print the full answer\nprint()\nprint(\"Full answer:\", full_text)"
      },
      "checks": [
        {
          "zh": "调用时加了 `stream=True`",
          "en": "Passes `stream=True`",
          "re": "stream\\s*=\\s*True"
        },
        {
          "zh": "用 `for ... in ...:` 逐块读取",
          "en": "Reads chunks with `for ... in ...:`",
          "re": "for\\s+\\w+\\s+in\\s+\\w+\\s*:"
        },
        {
          "zh": "从 `choices[0].delta.content` 取文字",
          "en": "Takes the text from `choices[0].delta.content`",
          "re": "choices\\[0\\]\\.delta\\.content"
        },
        {
          "zh": "处理了 None（例如 `or \"\"`）",
          "en": "Handles None (e.g. `or \"\"`)",
          "re": "(or\\s*[\"'][\"']|is\\s+not\\s+None|if\\s+[\\w.\\[\\]]+\\s*:)"
        },
        {
          "zh": "打印时用 `end=\"\"` 不换行",
          "en": "Prints with `end=\"\"` (no newline)",
          "re": "end\\s*=\\s*[\"'][\"']"
        },
        {
          "zh": "把每块拼到 `full_text` 上",
          "en": "Adds each piece to `full_text`",
          "re": "full_text\\s*(\\+=|=\\s*full_text\\s*\\+)"
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "把 key 直接写进代码，然后截图、上传或者发给别人。",
      "en": "Typing the key into the code, then screenshotting, uploading or sharing it."
    },
    {
      "zh": "漏写 `[0]`：`completion.choices.message` 会报 `AttributeError`，因为 `choices` 是列表。",
      "en": "Forgetting `[0]`: `completion.choices.message` raises `AttributeError` because `choices` is a list."
    },
    {
      "zh": "`messages` 少了外面的方括号，或者 role 拼错（`\"users\"`、`\"System\"`），接口直接报错（DeepSeek 实测 role 拼错返回 422）。",
      "en": "Leaving out the outer brackets of `messages`, or misspelling a role (`\"users\"`, `\"System\"`) – the API rejects it (DeepSeek returned 422 for a misspelled role in testing)."
    },
    {
      "zh": "流式输出时直接打印 `delta.content`，打出一串 `None`（deepseek-flash 的思考阶段尤其多）。用 `or \"\"`。",
      "en": "Printing `delta.content` directly while streaming and getting a run of `None` (especially during deepseek-flash's thinking). Use `or \"\"`."
    },
    {
      "zh": "deepseek-flash 的 `max_tokens` 设得太小：额度全被思考用掉，`content` 是空的，`finish_reason` 是 `\"length\"`。",
      "en": "Setting `max_tokens` too low for deepseek-flash: thinking uses it all, `content` is empty and `finish_reason` is `\"length\"`."
    },
    {
      "zh": "百炼的 `base_url` 漏了末尾的 `/v1`，返回 404；DeepSeek 的模型名写错（比如照抄视频里旧的模型名），返回 400。",
      "en": "Dropping the trailing `/v1` from Bailian's `base_url` gives a 404; a wrong DeepSeek model name (say, the video's old one) gives a 400."
    },
    {
      "zh": "刚设置完环境变量，没有关掉所有 VS Code 窗口再打开，程序读到的是 None。",
      "en": "Setting the environment variable without closing every VS Code window and reopening, so the program reads None."
    },
    {
      "zh": "只换了 `base_url` 没换 key（或反过来）：地址和 key 必须是同一家的，要一起改。",
      "en": "Changing `base_url` but not the key (or vice versa): the address and key must come from the same provider and change together."
    },
    {
      "zh": "在 system 里要求「正好十个字」这类精确数量：模型能理解大意，但数不准，写「不超过」更可靠。",
      "en": "Asking in the system message for an exact count such as “exactly ten characters”: the model gets the gist but can't count precisely; “at most” is more reliable."
    }
  ],
  "recap": [
    {
      "zh": "OpenAI 兼容 = 请求和返回的格式一样；换服务商只改 `base_url`、`api_key`、`model`。",
      "en": "OpenAI-compatible = same request and response format; switching providers changes only `base_url`, `api_key` and `model`."
    },
    {
      "zh": "创建 client：`OpenAI(api_key=..., base_url=...)`，或者设置 `OPENAI_API_KEY` / `OPENAI_BASE_URL` 后用 `OpenAI()`；key 永远从环境变量读取。",
      "en": "Create a client with `OpenAI(api_key=..., base_url=...)`, or set `OPENAI_API_KEY` / `OPENAI_BASE_URL` and use `OpenAI()`; always read the key from an environment variable."
    },
    {
      "zh": "`messages` 是装着字典的列表，每条消息有 `role`（system / user / assistant）和 `content`。",
      "en": "`messages` is a list of dicts; each message has a `role` (system / user / assistant) and `content`."
    },
    {
      "zh": "`model` 和 `messages` 是必填参数；system 消息放最前面给对话定规则，规则要写模型做得到的（「不超过十个字」比「正好十个字」可靠）。",
      "en": "`model` and `messages` are required; a system message goes first and sets the rules – write rules the model can follow (“at most ten characters” beats “exactly ten”)."
    },
    {
      "zh": "回答在 `completion.choices[0].message.content`；`finish_reason` 说明为什么停下，`usage` 记录 token 用量。",
      "en": "The answer is at `completion.choices[0].message.content`; `finish_reason` says why it stopped, `usage` counts tokens."
    },
    {
      "zh": "temperature 控制随机程度，max_tokens 限制长度，top_p 一般不动；deepseek-flash 的思考模式下 temperature 不起作用。",
      "en": "temperature controls randomness, max_tokens caps length, top_p is usually left alone; temperature has no effect in deepseek-flash's thinking mode."
    },
    {
      "zh": "`stream=True` 返回一块块的 chunk，文字在 `chunk.choices[0].delta.content`，可能是 None，用 `or \"\"` 处理。",
      "en": "`stream=True` yields chunks; the text is in `chunk.choices[0].delta.content`, which may be None – handle it with `or \"\"`."
    }
  ],
  "files": [
    {
      "path": "practice/l04_api_todo.py",
      "zh": "练习：补全一次普通调用和一次流式调用（有 TODO 提示）。",
      "en": "Exercise: complete a normal call and a streaming call (with TODO hints)."
    },
    {
      "path": "practice/l04_api_solution.py",
      "zh": "上面练习的参考答案。",
      "en": "Reference solution for the exercise above."
    },
    {
      "path": "practice/l04_env_client.py",
      "zh": "视频的写法：设置 `OPENAI_API_KEY` / `OPENAI_BASE_URL` 后用不带参数的 `OpenAI()`（key 从 `DEEPSEEK_API_KEY` 复制）。",
      "en": "The video's way: set `OPENAI_API_KEY` / `OPENAI_BASE_URL`, then call `OpenAI()` with no arguments (key copied from `DEEPSEEK_API_KEY`)."
    },
    {
      "path": "practice/l04_temperature.py",
      "zh": "temperature 实验：8 个温度各问一次（已关掉思考模式，会调用 8 次模型）。",
      "en": "Temperature experiment: one call at each of 8 temperatures (thinking turned off; 8 model calls)."
    }
  ]
});
