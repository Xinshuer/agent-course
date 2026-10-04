COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l05",
  "priority": "core",
  "handwrite": true,
  "studyMinutes": 60,
  "source": "subtitle",
  "summary": {
    "zh": "模型只会输出文字，查天气这类和外部世界打交道的事要靠「工具」：由你的代码替它动手。这一节按视频的五个步骤走一遍：确认模型支持工具调用 → 写一个查气温的函数 → 用 JSON Schema 描述它 → 把调用模型的代码封装成带对话记录的 `get_completion` → 提问、执行模型要求的工具、把结果交回去，得到最终回答。最后看清对话记录为什么必须完整，以及它越来越长会带来什么问题。",
    "en": "A model only outputs text; anything that touches the outside world, like checking the weather, needs “tools” – your code does the work for it. This lesson follows the video's five steps: check that the model supports tool calls → write a function that looks up the temperature → describe it with JSON Schema → wrap the model call in `get_completion`, which keeps a conversation record → ask, run the tool the model requests, hand the result back and get the final answer. Finally you'll see why the record must be complete and what goes wrong as it keeps growing."
  },
  "goals": [
    {
      "zh": "说清楚工具调用的原理：模型只提出请求，函数由你的代码执行，再把结果交回模型",
      "en": "Explain how tool calling works: the model only asks, your code runs the function and hands the result back"
    },
    {
      "zh": "说出视频的五个步骤，以及第 1 步为什么重要（不是每个模型都支持工具调用）",
      "en": "Name the video's five steps and why step 1 matters (not every model supports tool calls)"
    },
    {
      "zh": "按 JSON Schema 写出工具说明：`type`、`name`、`description`、`parameters`、`required`",
      "en": "Write a tool description in JSON Schema: `type`, `name`, `description`, `parameters`, `required`"
    },
    {
      "zh": "写出视频里的 `get_completion`：用函数外面的列表保存每次的提问和回答",
      "en": "Write the video's `get_completion`, which keeps every question and answer in a list outside the function"
    },
    {
      "zh": "读懂 `tool_calls` 的 `id`、`function.name` 和字符串形式的 `function.arguments`，把结果作为 `role: \"tool\"` 消息交回",
      "en": "Read the `id`, `function.name` and string `function.arguments` of each call in `tool_calls`, and return the result as a `role: \"tool\"` message"
    },
    {
      "zh": "不看资料，独立手写「封装 → 提问 → 执行工具 → 交回结果」的完整代码",
      "en": "Write the whole wrap → ask → run the tool → hand back the result code unaided"
    }
  ],
  "blocks": [
    {
      "t": "h",
      "zh": "一、工具：替模型「动手」",
      "en": "1. Tools: doing the work the model can't"
    },
    {
      "t": "p",
      "zh": "[▶ 00:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=2) 大模型只会输出文字，它自己没法改变外面的世界：不知道此刻的气温，不能查数据库，也不能读写文件。视频里老师的说法是：我们的代码来当模型的「手和脚」。流程是这样的：\n\n1. 你把问题和**工具说明**（`tools`）一起发给模型；\n2. 模型觉得需要工具时，不直接回答，而是用文字写明「想调用哪个函数、参数是什么」，放在返回结果的 `tool_calls` 里；\n3. **你的代码**真正去执行这个函数（跑一段代码、请求一个第三方接口……），再把结果作为一条 `tool` 消息发回去；\n4. 模型读到结果，写出最终回答。在模型看来，就好像它自己用了这个工具。\n\n关键在于：模型**从来不会执行**任何代码。要不要执行、怎么执行，都由你的程序决定。03 节说 Agent 由规划、记忆、工具几部分组成，这一节就是「工具」落到代码上的样子。",
      "en": "[▶ 00:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=2) An LLM only outputs text; on its own it can't change anything in the outside world: it doesn't know the temperature right now, can't query a database and can't read or write files. The instructor puts it this way: our code acts as the model's “hands and feet”. The flow:\n\n1. you send the question together with **tool descriptions** (`tools`);\n2. if the model needs a tool, it doesn't answer directly – it writes out which function it wants and with which arguments, in the `tool_calls` of its reply;\n3. **your code** actually runs that function (some code, a third-party API…) and sends the result back as a `tool` message;\n4. the model reads the result and writes the final answer. From the model's point of view, it's as if it used the tool itself.\n\nThe key point: the model **never runs** any code. Whether and how anything runs is up to your program. Lesson 03 split an agent into planning, memory and tools; this lesson is what “tools” looks like in code."
    },
    {
      "t": "check",
      "q": {
        "zh": "工具调用的过程中，`get_weather` 函数是由谁执行的？",
        "en": "During tool calling, who runs `get_weather`?"
      },
      "options": [
        {
          "zh": "模型在服务器上执行",
          "en": "The model, on the server"
        },
        {
          "zh": "你的 Python 程序执行",
          "en": "Your Python program"
        },
        {
          "zh": "DeepSeek 自动联网执行",
          "en": "DeepSeek, automatically over the internet"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "模型只返回「调用哪个函数、参数是什么」，真正执行函数的是你的代码。",
        "en": "The model only returns which function and which arguments; your code does the actual work."
      }
    },
    {
      "t": "h",
      "zh": "二、五个步骤；第 1 步：确认模型支持工具调用",
      "en": "2. Five steps; step 1: check the model supports tool calls"
    },
    {
      "t": "p",
      "zh": "[▶ 01:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=64) 视频把实现过程分成五步，这一节也按这个顺序展开：\n\n| 步骤 | 做什么 | 本节位置 |\n|---|---|---|\n| 1 | 确认模型支持工具调用 | 本部分 |\n| 2 | 定义一个函数，它就是工具 | 第三部分 |\n| 3 | 用 JSON Schema 把这个函数描述清楚，交给模型 | 第四部分 |\n| 4 | 把调用模型的代码封装成函数（顺便保存对话记录） | 第五部分 |\n| 5 | 调用模型，按它的要求执行工具，再把结果交回去 | 第六部分 |",
      "en": "[▶ 01:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=64) The video splits the work into five steps, and this lesson follows the same order:\n\n| Step | What | Where in this lesson |\n|---|---|---|\n| 1 | Check that the model supports tool calls | this part |\n| 2 | Define a function – that is the tool | part 3 |\n| 3 | Describe the function with JSON Schema for the model | part 4 |\n| 4 | Wrap the model call in a function (keeping a conversation record) | part 5 |\n| 5 | Call the model, run the tool it asks for, hand the result back | part 6 |"
    },
    {
      "t": "video",
      "zh": "[▶ 03:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=221) 第 1 步视频讲得很直接：模型本身不支持工具调用的话，带上工具就会报错，要么换模型，要么别用工具。老师说他上一集用的 DeepSeek V3 当时调用不了工具，所以从这一集起换成了阿里云百炼的通义千问（`qwen-plus`）。\n\n现在情况变了：本课用的 deepseek-flash 支持工具调用（实测），一次回复里还能请求好几个调用，所以我们继续用 DeepSeek，代码不受影响。以后换别的模型时，先在服务商文档里找 function calling / tool calling，确认支持再用。",
      "en": "[▶ 03:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=221) The video is blunt about step 1: if a model doesn't support tool calls, sending tools just produces an error – switch models or do without tools. The instructor says the DeepSeek V3 he used in the last episode couldn't call tools at the time, so from this episode on he switches to Alibaba Bailian's Qwen (`qwen-plus`).\n\nThings have changed since: this course's deepseek-flash supports tool calls (tested), even several in one reply, so we stay with DeepSeek and the code is unaffected. Whenever you switch models, look for “function calling / tool calling” in the provider's docs first."
    },
    {
      "t": "h",
      "zh": "三、第 2 步：定义一个函数当工具",
      "en": "3. Step 2: define a function as the tool"
    },
    {
      "t": "p",
      "zh": "[▶ 04:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=253) 工具本身就是一个普通的 Python 函数。视频的例子是查天气：用一个 HTTP 客户端请求天气接口，按经纬度查出那里当前的气温。老师也提到，函数写多复杂都可以——控制浏览器、查数据库、操作系统里的文件都行，查气温只是最简单的例子。\n\n课程用的是不需要 key 的 Open-Meteo 接口，函数放在 `practice/weather_tool.py`。去掉出错重试的部分，核心就这几行：",
      "en": "[▶ 04:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=253) A tool is just a plain Python function. The video's example checks the weather: an HTTP client asks a weather API for the current temperature at a latitude and longitude. The instructor adds that the function can be as elaborate as you like – driving a browser, querying a database, working with files – and the temperature is simply the easiest example.\n\nThe course uses Open-Meteo, which needs no key; the function lives in `practice/weather_tool.py`. Without its retry logic, the core is just these lines:"
    },
    {
      "t": "code",
      "file": {
        "zh": "weather_tool.py（简化版）",
        "en": "weather_tool.py (simplified)"
      },
      "code": {
        "zh": "import httpx\n\ndef get_weather(latitude, longitude):\n    response = httpx.get(\n        \"https://api.open-meteo.com/v1/forecast\",\n        params={\"latitude\": latitude, \"longitude\": longitude, \"current\": \"temperature_2m\"},\n        timeout=10,\n    )\n    data = response.json()                      # 把返回的 JSON 变成字典\n    return data[\"current\"][\"temperature_2m\"]    # 只取出气温",
        "en": "import httpx\n\ndef get_weather(latitude, longitude):\n    response = httpx.get(\n        \"https://api.open-meteo.com/v1/forecast\",\n        params={\"latitude\": latitude, \"longitude\": longitude, \"current\": \"temperature_2m\"},\n        timeout=10,\n    )\n    data = response.json()                      # turn the returned JSON into a dict\n    return data[\"current\"][\"temperature_2m\"]    # keep only the temperature"
      },
      "note": {
        "zh": "`httpx.get` 发出网络请求，相当于用程序打开一个网址。课程版本还加了「最多试 3 次」：Open-Meteo 偶尔会断开连接，三次都失败就返回一句错误说明，而不是让程序崩溃。网页里的 ▶ 运行不能访问天气网站，所以浏览器里的 `get_weather` 返回一个假气温。",
        "en": "`httpx.get` makes a web request, like opening a URL from code. The course version also tries up to 3 times: Open-Meteo sometimes drops the connection, and after three failures it returns an error message instead of crashing. The browser's ▶ Run can't reach weather sites, so the in-browser `get_weather` returns a fake temperature."
      }
    },
    {
      "t": "py",
      "title": {
        "zh": "def、参数和 return",
        "en": "def, parameters and return"
      },
      "zh": "`def` 用来定义函数：\n- `def 函数名(参数1, 参数2):`，下面缩进的代码是函数体\n- 参数是调用时传进来的值，在函数里当变量用\n- `return 值`：把结果交给调用它的代码，函数到这里结束；没有 `return` 的函数返回 `None`\n\n注意 `return` 和 `print` 的区别：`print` 只是显示在屏幕上，`return` 才是把值交出去，让别的代码接着用。工具函数一定要 `return` 结果，因为你要把它发回给模型。\n\n调用时可以按位置传参，也可以用 04 节学过的关键字参数：`get_weather(39.9, 116.4)` 和 `get_weather(latitude=39.9, longitude=116.4)` 效果一样。",
      "en": "`def` defines a function:\n- `def name(param1, param2):` with the indented body below\n- parameters are the values passed in, used as variables inside\n- `return value` hands the result to the caller and ends the function; without `return` a function returns `None`\n\nMind the difference between `return` and `print`: `print` only shows something on screen, while `return` hands the value over for other code to use. A tool function must `return` its result, because you'll send it back to the model.\n\nYou can pass arguments by position or with lesson 04's keyword arguments: `get_weather(39.9, 116.4)` equals `get_weather(latitude=39.9, longitude=116.4)`.",
      "code": {
        "zh": "def fake_weather(latitude, longitude):\n    \"\"\"返回一个假的气温（摄氏度）。\"\"\"\n    temp = 12 + (latitude + longitude) % 10   # % 是取余数，这里只是为了造一个假数字\n    return round(temp, 1)\n\ndef only_prints(x):\n    print(\"我只打印：\", x)        # 没有 return\n\nt = fake_weather(39.9, 116.4)                                 # 按位置传参\nprint(\"北京：\", t)\nprint(\"上海：\", fake_weather(latitude=31.2, longitude=121.5))  # 按关键字传参\n\nr = only_prints(5)\nprint(\"only_prints 的返回值：\", r)   # None",
        "en": "def fake_weather(latitude, longitude):\n    \"\"\"Return a fake temperature (Celsius).\"\"\"\n    temp = 12 + (latitude + longitude) % 10   # % is the remainder; it just makes up a number\n    return round(temp, 1)\n\ndef only_prints(x):\n    print(\"I only print:\", x)     # no return\n\nt = fake_weather(39.9, 116.4)                                    # by position\nprint(\"Beijing:\", t)\nprint(\"Shanghai:\", fake_weather(latitude=31.2, longitude=121.5))  # by keyword\n\nr = only_prints(5)\nprint(\"only_prints returned:\", r)   # None"
      }
    },
    {
      "t": "h",
      "zh": "四、第 3 步：用 JSON Schema 描述工具",
      "en": "4. Step 3: describe the tool with JSON Schema"
    },
    {
      "t": "p",
      "zh": "[▶ 05:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=314) 函数写好了，你自己可以直接调用，可模型看不到你的代码：它不知道这个函数叫什么、要什么参数、能做什么、返回什么。所以要按 OpenAI 接口规定的格式写一份**工具说明**，格式叫 **JSON Schema**。视频里的说明有这几块：类型是函数；函数名；功能描述（老师特意写明是「根据坐标」查气温，因为参数就是两个坐标）；参数是一个对象，里面有纬度、经度两个属性。\n\n所有工具说明放进一个列表 `tools`，调用模型时用 `tools=tools` 传过去。下面的写法和你跟着课程写的 `weather_tool.py` 一样带了 `strict`（描述换成了更具体的「气温（摄氏度）」）：",
      "en": "[▶ 05:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=314) Once the function exists you can call it yourself, but the model can't see your code: it doesn't know the function's name, arguments, purpose or return value. So you write a **tool description** in the format OpenAI's API defines, called **JSON Schema**. The video's description has these parts: the type (a function); the function name; what it does (the instructor deliberately says it works “from coordinates”, since the arguments are two coordinates); and the arguments – an object with a latitude and a longitude property.\n\nAll tool descriptions go into a list `tools`, passed to the model with `tools=tools`. Like the `weather_tool.py` you wrote along with the course, the version below includes `strict` (with a more specific description: “temperature (Celsius)”):"
    },
    {
      "t": "code",
      "file": "tools",
      "code": {
        "zh": "tools = [{\n    \"type\": \"function\",                       # 工具类型：函数\n    \"function\": {\n        \"name\": \"get_weather\",                # 函数名：模型用这个名字来调用\n        \"description\": \"Get the current temperature (Celsius) for a given latitude and longitude.\",\n        \"parameters\": {                       # 参数说明（JSON Schema 格式）\n            \"type\": \"object\",\n            \"properties\": {\n                \"latitude\": {\"type\": \"number\", \"description\": \"The latitude of the location.\"},\n                \"longitude\": {\"type\": \"number\", \"description\": \"The longitude of the location.\"},\n            },\n            \"required\": [\"latitude\", \"longitude\"],   # 必须提供的参数\n            \"additionalProperties\": False,           # 不允许出现别的参数\n        },\n        \"strict\": True,                       # 严格模式（见下面的说明）\n    },\n}]",
        "en": "tools = [{\n    \"type\": \"function\",                       # tool type: a function\n    \"function\": {\n        \"name\": \"get_weather\",                # the name the model calls it by\n        \"description\": \"Get the current temperature (Celsius) for a given latitude and longitude.\",\n        \"parameters\": {                       # the arguments, in JSON Schema\n            \"type\": \"object\",\n            \"properties\": {\n                \"latitude\": {\"type\": \"number\", \"description\": \"The latitude of the location.\"},\n                \"longitude\": {\"type\": \"number\", \"description\": \"The longitude of the location.\"},\n            },\n            \"required\": [\"latitude\", \"longitude\"],   # arguments that must be given\n            \"additionalProperties\": False,           # no other arguments allowed\n        },\n        \"strict\": True,                       # strict mode (see below)\n    },\n}]"
      }
    },
    {
      "t": "p",
      "zh": "| 字段 | 含义 |\n|---|---|\n| `type` | 固定写 `\"function\"` |\n| `function.name` | 函数名，只用字母、数字、下划线、短横线；模型返回的 `tool_calls` 里就是这个名字 |\n| `function.description` | 这个工具做什么、什么时候用。**模型主要靠它决定要不要调用** |\n| `parameters.type` | 固定写 `\"object\"`：所有参数合起来是一个「对象」 |\n| `parameters.properties` | 每个参数的名字、类型（`string`、`number`、`integer`、`boolean`、`array`、`object`）和说明 |\n| `parameters.required` | 哪些参数必须提供 |\n| `additionalProperties: False` | 不许模型编出列表以外的参数 |\n| `strict` | 严格模式：要求模型生成的参数完全符合上面的格式 |\n\n**描述写得好不好，决定了工具好不好用。** 模型不读函数代码，只看 `name`、`description` 和每个参数的 `description`。描述含糊，模型就可能不调用、调用错工具或者填错参数。好的描述说清三件事：做什么、什么时候用、参数的格式和单位（比如「摄氏度」「纬度，-90 到 90」）。",
      "en": "| Field | Meaning |\n|---|---|\n| `type` | Always `\"function\"` |\n| `function.name` | Function name – letters, digits, underscores, dashes; `tool_calls` will carry this name |\n| `function.description` | What the tool does and when to use it. **The model relies on it to decide whether to call** |\n| `parameters.type` | Always `\"object\"`: the arguments together form one “object” |\n| `parameters.properties` | Each argument's name, type (`string`, `number`, `integer`, `boolean`, `array`, `object`) and description |\n| `parameters.required` | Which arguments must be given |\n| `additionalProperties: False` | The model may not invent arguments outside the list |\n| `strict` | Strict mode: the generated arguments must match the schema exactly |\n\n**Good descriptions make good tools.** The model never reads your function's code – only `name`, `description` and each argument's `description`. Vague text leads to no call, the wrong tool or wrong arguments. A good description says what the tool does, when to use it, and the format and units of each argument (e.g. “Celsius”, “latitude, -90 to 90”)."
    },
    {
      "t": "note",
      "zh": "`\"strict\": True` 来自 OpenAI 的严格模式：开启后，`properties` 里的每个参数都要写进 `required`，还要加 `additionalProperties: False`。DeepSeek 文档说它的严格模式是 Beta 功能，要把 `base_url` 换成 `https://api.deepseek.com/beta` 才生效。课程的 `practice/weather_tool.py` 去掉了 `strict`，普通模式就够用。",
      "en": "`\"strict\": True` comes from OpenAI's strict mode: every argument in `properties` must also be listed in `required`, plus `additionalProperties: False`. DeepSeek's docs call its strict mode a Beta feature that only works with `base_url` set to `https://api.deepseek.com/beta`. The course's `practice/weather_tool.py` leaves `strict` out; normal mode is enough."
    },
    {
      "t": "py",
      "title": {
        "zh": "嵌套字典：一层层取值",
        "en": "Nested dicts: reading layer by layer"
      },
      "zh": "`tools` 是「列表里装字典，字典里又装字典」。取里面的值就是一层层用方括号：列表用下标，字典用键。写的时候注意括号成对、每一层缩进对齐、逗号别漏。\n\n这种用嵌套字典描述「数据长什么样」的格式叫 **JSON Schema**，是一个通用标准。后面学框架时，框架会根据你的函数自动生成它，但看懂它能帮你排查很多问题。",
      "en": "`tools` is “a list of dicts holding more dicts”. Reading inside means brackets layer by layer: indexes for lists, keys for dicts. When writing it, keep brackets paired, indent each level consistently, and don't drop commas.\n\nThis nested-dict format for describing data is called **JSON Schema**, a common standard. Frameworks later generate it from your function automatically, but reading it helps you debug many problems.",
      "code": {
        "zh": "tools = [{\n    \"type\": \"function\",\n    \"function\": {\n        \"name\": \"get_weather\",\n        \"description\": \"查询某个经纬度的当前气温（摄氏度）\",\n        \"parameters\": {\n            \"type\": \"object\",\n            \"properties\": {\n                \"latitude\": {\"type\": \"number\", \"description\": \"纬度\"},\n                \"longitude\": {\"type\": \"number\", \"description\": \"经度\"},\n            },\n            \"required\": [\"latitude\", \"longitude\"],\n        },\n    },\n}]\n\nfn = tools[0][\"function\"]                    # 列表第 0 个 -> 字典 -> \"function\" 键\nprint(fn[\"name\"])                            # get_weather\nprint(fn[\"parameters\"][\"required\"])          # ['latitude', 'longitude']\nprint(fn[\"parameters\"][\"properties\"][\"latitude\"][\"type\"])   # number\nprint(list(fn[\"parameters\"][\"properties\"]))  # 所有参数名",
        "en": "tools = [{\n    \"type\": \"function\",\n    \"function\": {\n        \"name\": \"get_weather\",\n        \"description\": \"Current temperature (Celsius) at a latitude/longitude\",\n        \"parameters\": {\n            \"type\": \"object\",\n            \"properties\": {\n                \"latitude\": {\"type\": \"number\", \"description\": \"Latitude\"},\n                \"longitude\": {\"type\": \"number\", \"description\": \"Longitude\"},\n            },\n            \"required\": [\"latitude\", \"longitude\"],\n        },\n    },\n}]\n\nfn = tools[0][\"function\"]                    # list item 0 -> dict -> key \"function\"\nprint(fn[\"name\"])                            # get_weather\nprint(fn[\"parameters\"][\"required\"])          # ['latitude', 'longitude']\nprint(fn[\"parameters\"][\"properties\"][\"latitude\"][\"type\"])   # number\nprint(list(fn[\"parameters\"][\"properties\"]))  # every argument name"
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "模型决定要不要调用某个工具、参数怎么填，主要依据什么？",
        "en": "What does the model mainly rely on to decide whether to call a tool and how to fill its arguments?"
      },
      "options": [
        {
          "zh": "函数体里的 Python 代码",
          "en": "The Python code in the function body"
        },
        {
          "zh": "函数所在的文件名",
          "en": "The name of the file the function is in"
        },
        {
          "zh": "工具说明里的 `name`、`description` 和参数说明",
          "en": "The `name`, `description` and argument descriptions in the tool description"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "模型只看得到你发过去的 `tools`，看不到你的代码。所以描述要写清楚。",
        "en": "The model sees only the `tools` you send, never your code – so write clear descriptions."
      }
    },
    {
      "t": "h",
      "zh": "五、第 4 步：封装 get_completion，顺便保存对话记录",
      "en": "5. Step 4: wrap the call in get_completion, keeping a record"
    },
    {
      "t": "p",
      "zh": "[▶ 06:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=408) 用一次工具，至少要调用模型**两次**：先提问，再把工具结果交回去。每次都把 `create(...)` 那一大段复制一遍太啰嗦，所以视频把它封装成一个函数 `get_completion`，以后写函数名就能调用。和 04 节的代码相比，有两处变化：\n- 模型换成了支持工具的模型（视频是 `qwen-plus`，我们是 `deepseek-flash`），调用时带上 `tools`；\n- 每次提问，先把这条消息加进一个**对话记录**列表；拿到回答后，也把回答加进去。发给模型的永远是**整个**列表。\n\n为什么要记录？因为模型接口本身没有记忆：每次 `create(...)` 都是一次独立的请求，服务器不会替你记住上一次说了什么。把之前的消息每次都带上，模型才「记得」。视频里把这份列表看作一种短期记忆，它不用存很久，但要把这次对话记全。",
      "en": "[▶ 06:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=408) Using a tool takes at least **two** model calls: ask first, then hand back the tool result. Copying the whole `create(...)` block each time is tedious, so the video wraps it in a function, `get_completion`, that you call by name. Compared with lesson 04's code, two things change:\n- the model is one that supports tools (`qwen-plus` in the video, `deepseek-flash` here), and the call includes `tools`;\n- before each request the message goes into a **conversation record** list, and the reply goes in too once it arrives. The model always receives the **whole** list.\n\nWhy keep a record? Because the model API has no memory: every `create(...)` is an independent request, and the server keeps nothing between calls. Sending the earlier messages each time is what makes the model “remember”. The video treats this list as a kind of short-term memory – it needn't last long, but it must hold the whole conversation."
    },
    {
      "t": "code",
      "file": {
        "zh": "封装LLM.py",
        "en": "wrap_llm.py"
      },
      "run": "mock",
      "code": {
        "zh": "from llm import client, MODEL\nfrom weather_tool import tools\n\nmessage_history = []          # 写在函数外面：每次调用都往同一份记录里加\n\ndef get_completion(message):\n    message_history.append(message)                 # 1. 先记下这次要发的消息\n    response = client.chat.completions.create(\n        model=MODEL,\n        messages=message_history,                   # 2. 发送整个对话记录\n        tools=tools,\n    )\n    reply = dict(response.choices[0].message)       # 3. 回答转成字典\n    message_history.append(reply)                   #    也记进对话记录\n    return reply\n\n# 连着问两句，第二句要用到第一句的信息\nget_completion({\"role\": \"user\", \"content\": \"你好，我叫小明。\"})\nreply = get_completion({\"role\": \"user\", \"content\": \"我叫什么名字？\"})\nprint(reply[\"content\"])\nprint(\"对话记录里有\", len(message_history), \"条消息\")",
        "en": "from llm import client, MODEL\nfrom weather_tool import tools\n\nmessage_history = []          # outside the function: every call adds to the same record\n\ndef get_completion(message):\n    message_history.append(message)                 # 1. record the message we're sending\n    response = client.chat.completions.create(\n        model=MODEL,\n        messages=message_history,                   # 2. send the whole record\n        tools=tools,\n    )\n    reply = dict(response.choices[0].message)       # 3. turn the reply into a dict\n    message_history.append(reply)                   #    and record it too\n    return reply\n\n# two questions in a row; the second needs the first\nget_completion({\"role\": \"user\", \"content\": \"Hi, my name is Ming.\"})\nreply = get_completion({\"role\": \"user\", \"content\": \"What is my name?\"})\nprint(reply[\"content\"])\nprint(\"messages in the record:\", len(message_history))"
      },
      "note": {
        "zh": "三个 Python 要点（06 节的 Python 小课堂会细讲）：\n- `message_history.append(x)`：把 x 加到列表末尾。\n- 列表写在**函数外面**，所以每次调用都往同一份记录里加；要是写进函数里面，每次调用都会重新变成空列表。\n- `dict(...)`：把 SDK 返回的消息对象转成字典，所以之后用 `reply[\"content\"]` 取值。这是视频的写法，`reply.model_dump()` 也可以，两者的区别在 06 节。\n\n你跟着课程写的 `封装LLM.py` 里列表叫 `messages_history`、参数叫 `messages`，还多了一个没用到的 `stream=False`，效果一样。名字随你起，只要前后一致。",
        "en": "Three Python points (lesson 06's mini-lessons go deeper):\n- `message_history.append(x)` adds x to the end of the list.\n- The list lives **outside the function**, so every call adds to the same record; inside the function it would start empty on every call.\n- `dict(...)` turns the SDK's message object into a dict, hence `reply[\"content\"]` afterwards. That's the video's way; `reply.model_dump()` works too – lesson 06 explains the difference.\n\nThe `封装LLM.py` you wrote along with the course calls the list `messages_history` and the parameter `messages`, and has an unused `stream=False`; it behaves the same. Any names work as long as you use them consistently."
      }
    },
    {
      "t": "video",
      "zh": "[▶ 08:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=502) 封装好以后，老师举例说明可以连着问好几个问题：先问「你是谁」，再接着问「我是谁」，每一句都会自动并进之前的记录。这就是封装的两个好处：函数可以反复调用；模型每次都能看到前面的对话。",
      "en": "[▶ 08:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=502) With the wrapper in place, the instructor shows that you can ask several questions in a row – “who are you?” followed by “who am I?” – and each one is merged into the earlier record automatically. That's what the wrapper buys you: a function you can call again and again, and a model that always sees the conversation so far."
    },
    {
      "t": "check",
      "q": {
        "zh": "如果把 `message_history = []` 写进 `get_completion` 函数**里面**，会怎样？",
        "en": "What happens if `message_history = []` goes **inside** `get_completion`?"
      },
      "options": [
        {
          "zh": "没有区别",
          "en": "Nothing changes"
        },
        {
          "zh": "程序报 NameError",
          "en": "The program raises NameError"
        },
        {
          "zh": "每次调用都从空列表开始，模型记不住前面的对话",
          "en": "Every call starts from an empty list, so the model forgets earlier turns"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "函数里的赋值每次调用都会重新执行，列表被重置，之前的消息全部丢失。",
        "en": "The assignment runs on every call, resetting the list and losing every earlier message."
      }
    },
    {
      "t": "h",
      "zh": "六、第 5 步：提问 → 执行工具 → 交回结果",
      "en": "6. Step 5: ask → run the tool → hand back the result"
    },
    {
      "t": "p",
      "zh": "[▶ 08:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=533) 有了 `get_completion`，第 5 步就是这几件事：\n1. 构造一条 user 消息问北京天气，交给 `get_completion`；\n2. 实时天气超出了模型的能力，所以它返回的不是答案，而是一个工具调用请求；\n3. [▶ 09:56](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=596) 从请求里取出三样东西：调用编号 `id`、函数名 `name`、参数 `arguments`；\n4. 用这些参数执行 `get_weather`；\n5. 把结果包成 role 为 `tool` 的消息，再交给 `get_completion`，模型据此写出最终回答。",
      "en": "[▶ 08:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=533) With `get_completion`, step 5 comes down to:\n1. build a user message asking about the weather in Beijing and pass it to `get_completion`;\n2. live weather is beyond the model, so instead of an answer it returns a tool-call request;\n3. [▶ 09:56](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=596) take three things from the request: the call's `id`, the function `name` and the `arguments`;\n4. run `get_weather` with those arguments;\n5. wrap the result in a message with role `tool`, pass it to `get_completion`, and the model writes the final answer from it."
    },
    {
      "t": "code",
      "file": {
        "zh": "调用LLM.py",
        "en": "call_llm.py"
      },
      "run": "mock",
      "code": {
        "zh": "import json\nfrom llm import client, MODEL\nfrom weather_tool import get_weather, tools\n\nmessage_history = []\n\ndef get_completion(message):\n    message_history.append(message)\n    response = client.chat.completions.create(model=MODEL, messages=message_history, tools=tools)\n    reply = dict(response.choices[0].message)\n    message_history.append(reply)\n    return reply\n\n# 第 1 次调用：提问。模型查不到实时天气，会要求调用工具\nmessage = get_completion({\"role\": \"user\", \"content\": \"今天北京天气如何？\"})\n\nif message[\"tool_calls\"]:                          # 有工具调用请求才执行\n    call = message[\"tool_calls\"][0]                 # 视频只处理第一个调用\n    print(\"id:\", call.id)\n    print(\"name:\", call.function.name)\n    print(\"arguments:\", call.function.arguments)    # 注意：这是一个字符串\n\n    args = json.loads(call.function.arguments)      # 字符串 -> 字典\n    result = get_weather(**args)                    # 由你的代码执行函数\n\n    # 第 2 次调用：把结果作为 tool 消息交回去\n    message = get_completion({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": str(result)})\n\nprint(message[\"content\"])\n\n# 看看对话记录里存了什么（第八部分细讲）\nfor m in message_history:\n    print(m[\"role\"], \"|\", m.get(\"content\"), \"|\", m.get(\"tool_calls\") is not None)",
        "en": "import json\nfrom llm import client, MODEL\nfrom weather_tool import get_weather, tools\n\nmessage_history = []\n\ndef get_completion(message):\n    message_history.append(message)\n    response = client.chat.completions.create(model=MODEL, messages=message_history, tools=tools)\n    reply = dict(response.choices[0].message)\n    message_history.append(reply)\n    return reply\n\n# Call 1: ask. The model can't look up live weather, so it asks for a tool\nmessage = get_completion({\"role\": \"user\", \"content\": \"What's the weather in Beijing today?\"})\n\nif message[\"tool_calls\"]:                          # only when a tool was requested\n    call = message[\"tool_calls\"][0]                 # the video handles only the first call\n    print(\"id:\", call.id)\n    print(\"name:\", call.function.name)\n    print(\"arguments:\", call.function.arguments)    # note: this is a string\n\n    args = json.loads(call.function.arguments)      # string -> dict\n    result = get_weather(**args)                    # your code runs the function\n\n    # Call 2: hand the result back as a tool message\n    message = get_completion({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": str(result)})\n\nprint(message[\"content\"])\n\n# what the record now holds (part 8 explains)\nfor m in message_history:\n    print(m[\"role\"], \"|\", m.get(\"content\"), \"|\", m.get(\"tool_calls\") is not None)"
      },
      "note": {
        "zh": "和你的 `调用LLM.py` 是同一个流程：你的版本从 `封装LLM` 导入 `get_completion`，用 `print(message)` 打印整条回复；这里把函数放在同一个文件里，并像视频那样把 id、name、arguments 分开打印。`message[\"tool_calls\"][0].id` 里外层是方括号、里层是点号：`dict(...)` 只把最外层变成字典，里面的调用仍是对象。`m.get(\"tool_calls\")`：字典的 `.get`，键不存在时返回 None 而不报错（tool 消息里就没有这个键）。",
        "en": "Same flow as your `调用LLM.py`: yours imports `get_completion` from `封装LLM` and prints the whole reply with `print(message)`; here the function sits in the same file, and id, name and arguments are printed separately, as in the video. `message[\"tool_calls\"][0].id` uses brackets outside and a dot inside: `dict(...)` converts only the outer layer, and the calls inside stay objects. `m.get(\"tool_calls\")` is a dict's `.get`, which returns None instead of failing when the key is missing (tool messages don't have it)."
      }
    },
    {
      "t": "p",
      "zh": "要点：\n- 模型要用工具时，`finish_reason` 是 `\"tool_calls\"`，这条回复的 `content` 可能是空的，也可能只有一句「我来查一下」，不能当作最终回答。\n- [▶ 12:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=720) 经纬度是模型根据「北京」自己填的，你不用告诉它。\n- [▶ 12:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=752) `arguments` 看起来像字典，其实是一个 **JSON 格式的字符串**（视频里打印整条回复时，能看到它两边带着引号），例如 `'{\"latitude\": 39.9, \"longitude\": 116.4}'`，要先 `json.loads` 才能当字典用。\n- `id` 是这次调用的编号，交回结果时要用它对上号。",
      "en": "Key points:\n- When the model wants a tool, `finish_reason` is `\"tool_calls\"`, and the reply's `content` may be empty or just “let me check” – it is not the final answer.\n- [▶ 12:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=720) The model filled in Beijing's coordinates from the city name by itself.\n- [▶ 12:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=752) `arguments` looks like a dict but is a **JSON string** (when the video prints the whole reply, you can see quotes around it), e.g. `'{\"latitude\": 39.9, \"longitude\": 116.4}'` – `json.loads` it before using it as a dict.\n- `id` numbers this call; you'll use it to match the result."
    },
    {
      "t": "py",
      "title": {
        "zh": "json.loads 和 json.dumps",
        "en": "json.loads and json.dumps"
      },
      "zh": "**JSON** 是一种通用的文本数据格式，长得很像 Python 的字典和列表。程序之间（比如你的代码和 DeepSeek 的服务器）传数据时，传的都是 JSON 文本。\n- `json.loads(字符串)`：JSON 字符串 → Python 字典或列表（`s` 代表 string）\n- `json.dumps(字典)`：Python 字典或列表 → JSON 字符串\n- `json.dumps(..., ensure_ascii=False)`：中文原样保留，不变成 `\\u5317` 这样的编码\n\n模型给的 `arguments` 是字符串，所以要 `json.loads`；工具结果如果是字典，发回去之前要 `json.dumps` 成字符串。",
      "en": "**JSON** is a common text format for data that looks a lot like Python dicts and lists. Whenever programs exchange data (your code and DeepSeek's servers, say), they send JSON text.\n- `json.loads(string)`: JSON string → Python dict or list (`s` for string)\n- `json.dumps(dict)`: Python dict or list → JSON string\n- `json.dumps(..., ensure_ascii=False)` keeps Chinese characters as they are instead of codes like `\\u5317`\n\nThe model's `arguments` is a string, so `json.loads` it; if a tool returns a dict, `json.dumps` it before sending it back.",
      "code": {
        "zh": "import json\n\narguments = '{\"latitude\": 39.9, \"longitude\": 116.4}'   # 模型给的：字符串\nprint(type(arguments))            # <class 'str'>\n# arguments[\"latitude\"]           # 会报错：字符串不能按键取值\n\nargs = json.loads(arguments)      # 字符串 -> 字典\nprint(type(args), args[\"latitude\"])\n\nresult = {\"city\": \"北京\", \"temperature\": 15.0}\ntext = json.dumps(result, ensure_ascii=False)   # 字典 -> 字符串\nprint(text, type(text))\nprint(json.dumps(result))         # 不加 ensure_ascii=False：中文变成 \\u 编码",
        "en": "import json\n\narguments = '{\"latitude\": 39.9, \"longitude\": 116.4}'   # from the model: a string\nprint(type(arguments))            # <class 'str'>\n# arguments[\"latitude\"]           # error: a string has no keys\n\nargs = json.loads(arguments)      # string -> dict\nprint(type(args), args[\"latitude\"])\n\nresult = {\"city\": \"北京\", \"temperature\": 15.0}\ntext = json.dumps(result, ensure_ascii=False)   # dict -> string\nprint(text, type(text))\nprint(json.dumps(result))         # without ensure_ascii=False: Chinese becomes \\u codes"
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "`call.function.arguments` 是什么类型？",
        "en": "What type is `call.function.arguments`?"
      },
      "options": [
        {
          "zh": "字典，可以直接 `args[\"latitude\"]`",
          "en": "A dict – `args[\"latitude\"]` works directly"
        },
        {
          "zh": "JSON 格式的字符串，要先用 `json.loads` 转成字典",
          "en": "A JSON string; convert it with `json.loads` first"
        },
        {
          "zh": "列表，按顺序放着参数值",
          "en": "A list of argument values in order"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "接口传回来的参数是 JSON 文本，`json.loads` 之后才是能按键取值的字典。",
        "en": "The API returns the arguments as JSON text; only after `json.loads` is it a dict you can index."
      }
    },
    {
      "t": "py",
      "title": {
        "zh": "**args：把字典拆成关键字参数",
        "en": "**args: unpacking a dict into keyword arguments"
      },
      "zh": "`get_weather(**args)` 里的 `**` 是**字典解包**：把字典里的每一对「键: 值」拆开，当作关键字参数传进函数。\n\n当 `args = {\"latitude\": 39.9, \"longitude\": 116.4}` 时，`get_weather(**args)` 就等于 `get_weather(latitude=39.9, longitude=116.4)`。\n\n好处是不用一个个写 `args[\"latitude\"]`。前提是字典的键和函数的参数名**完全一样**，所以 tools 里 `properties` 的名字要和函数的参数名保持一致。",
      "en": "The `**` in `get_weather(**args)` **unpacks a dict**: each “key: value” pair becomes a keyword argument.\n\nWith `args = {\"latitude\": 39.9, \"longitude\": 116.4}`, `get_weather(**args)` is the same as `get_weather(latitude=39.9, longitude=116.4)`.\n\nNo need to write `args[\"latitude\"]` one by one – as long as the keys **exactly match** the parameter names. That's why the names in the tool's `properties` must match the function's parameters.",
      "code": {
        "zh": "def get_weather(latitude, longitude):\n    return f\"({latitude}, {longitude}) 的气温是 15.0°C\"\n\nargs = {\"latitude\": 39.9, \"longitude\": 116.4}\n\nprint(get_weather(**args))                               # 字典解包\nprint(get_weather(latitude=39.9, longitude=116.4))       # 等价的写法\nprint(get_weather(args[\"latitude\"], args[\"longitude\"]))  # 一个个取出来，也可以\n\nbad = {\"lat\": 39.9, \"lon\": 116.4}\n# get_weather(**bad)   # TypeError：函数没有叫 lat 的参数",
        "en": "def get_weather(latitude, longitude):\n    return f\"Temperature at ({latitude}, {longitude}) is 15.0°C\"\n\nargs = {\"latitude\": 39.9, \"longitude\": 116.4}\n\nprint(get_weather(**args))                               # unpack the dict\nprint(get_weather(latitude=39.9, longitude=116.4))       # the same call\nprint(get_weather(args[\"latitude\"], args[\"longitude\"]))  # picking values one by one also works\n\nbad = {\"lat\": 39.9, \"lon\": 116.4}\n# get_weather(**bad)   # TypeError: there is no parameter named lat"
      }
    },
    {
      "t": "p",
      "zh": "[▶ 10:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=658) 交回结果的 tool 消息有三个字段：\n- `role`：`\"tool\"`。04 节说过 role 有好几种：user 是提问，assistant 是回答，tool 就是工具的执行结果；\n- `tool_call_id`：对应那次调用的 `id`。Agent 可能连着调用很多次工具，靠这个编号，模型才知道这条结果属于哪一次请求；\n- `content`：结果，**必须是字符串**（用 `str(result)` 或 `json.dumps(result)`）。",
      "en": "[▶ 10:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=658) The tool message that carries the result has three fields:\n- `role`: `\"tool\"`. Lesson 04 showed there are several roles: user asks, assistant answers, and tool carries a tool's result;\n- `tool_call_id`: the `id` of the matching call. An agent may call tools many times in a row, and this id tells the model which request the result belongs to;\n- `content`: the result, **as a string** (`str(result)` or `json.dumps(result)`)."
    },
    {
      "t": "video",
      "zh": "[▶ 12:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=720) 视频运行时，第一次回复里模型先根据问题里的城市给出了北京的经纬度，然后提出调用天气函数；老师指着参数两边的引号说明它是字符串，所以代码里先 `json.loads`。[▶ 13:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=782) 把气温交回去以后，模型回答北京现在大约 30 度，还说明这只是温度，没有别的天气信息，建议再去查更完整的预报。[▶ 13:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=812) 老师的总结：直接问模型某个城市的气温，它答不上来，因为语言模型碰不到现实世界；工具补上了这块能力，没有工具，大模型成不了 Agent。",
      "en": "[▶ 12:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=720) In the video's run, the first reply contains Beijing's coordinates, worked out from the city in the question, plus a request to call the weather function; the instructor points to the quotes around the arguments to show they're a string, which is why the code runs `json.loads` first. [▶ 13:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=782) Once the temperature goes back, the model answers that Beijing is about 30 degrees right now, noting that this is only the temperature, with no other weather details, and suggesting a fuller forecast. [▶ 13:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=812) The instructor's takeaway: ask a model for a city's temperature directly and it can't tell you, because a language model can't touch the real world; tools supply that ability, and without tools a model can't become an agent."
    },
    {
      "t": "warn",
      "zh": "两个最常见的报错：\n- tool 消息前面没有那条带 `tool_calls` 的 assistant 消息（比如忘了存），接口返回 400。用 `get_completion` 时它会自动存进记录，自己维护 `messages` 时就要记得 append。\n- tool 消息的 `content` 放了数字或字典：DeepSeek 实测返回 422，提示 `content should be a string or a list`。要先 `str(...)` 或 `json.dumps(...)` 转成字符串。",
      "en": "The two most common errors:\n- a tool message with no assistant message carrying `tool_calls` before it (say, you forgot to store it): the API returns 400. `get_completion` records it automatically; when you manage `messages` yourself, remember to append it.\n- a number or dict in a tool message's `content`: DeepSeek returned 422 in testing, saying `content should be a string or a list`. Convert it with `str(...)` or `json.dumps(...)` first."
    },
    {
      "t": "h",
      "zh": "七、不封装也行：直接维护 messages 列表",
      "en": "7. Without the wrapper: managing a messages list yourself"
    },
    {
      "t": "p",
      "zh": "你跟着课程写的 `call_tool.py` 是同一个流程，只是没有封装：自己准备 `messages` 列表，先存模型那条带 `tool_calls` 的回复，再为**每一个**调用存一条 tool 消息，最后再调用一次模型。和视频的写法相比，它用 `for` 处理了所有调用（第九部分会看到为什么需要），`messages.append(msg)` 存的是 SDK 的消息对象本身：",
      "en": "The `call_tool.py` you wrote along with the course follows the same flow without the wrapper: it keeps its own `messages` list, stores the model's reply with `tool_calls` first, adds one tool message for **every** call, then calls the model again. Unlike the video's version it handles every call with `for` (part 9 shows why that matters), and `messages.append(msg)` stores the SDK message object itself:"
    },
    {
      "t": "code",
      "file": "call_tool.py",
      "run": "mock",
      "code": {
        "zh": "import json\nfrom llm import client, MODEL\nfrom weather_tool import get_weather, tools\n\nmessages = [{\"role\": \"user\", \"content\": \"斯德哥尔摩现在天气怎么样？\"}]\n\n# 第 1 步：把问题和 tools 一起发给模型，由模型决定要不要调用工具\nresp = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)\nmsg = resp.choices[0].message\nmessages.append(msg)                 # 带 tool_calls 的 assistant 消息，先存进去\n\n# 第 2 步：模型要求调用工具时，由你的代码执行 get_weather\nfor call in msg.tool_calls or []:\n    args = json.loads(call.function.arguments)\n    result = get_weather(**args)\n    messages.append({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": str(result)})\n\n# 第 3 步：把天气结果交回给模型，让它写成回答\nresp = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)\nprint(resp.choices[0].message.content)",
        "en": "import json\nfrom llm import client, MODEL\nfrom weather_tool import get_weather, tools\n\nmessages = [{\"role\": \"user\", \"content\": \"What's the weather in Stockholm right now?\"}]\n\n# Step 1: send the question with the tools; the model decides whether to use one\nresp = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)\nmsg = resp.choices[0].message\nmessages.append(msg)                 # store the assistant message with tool_calls first\n\n# Step 2: when the model asks for a tool, your code runs get_weather\nfor call in msg.tool_calls or []:\n    args = json.loads(call.function.arguments)\n    result = get_weather(**args)\n    messages.append({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": str(result)})\n\n# Step 3: hand the weather back so the model can write the answer\nresp = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)\nprint(resp.choices[0].message.content)"
      },
      "note": {
        "zh": "和你的 `call_tool.py` 只差一处：函数调用写成了 `get_weather(**args)`。`messages.append(msg)` 存的是 SDK 对象，openai 库发送时会自动把它转成字典，连 DeepSeek 思考模式的 `reasoning_content` 也一起发回去（DeepSeek 文档要求带工具的对话把它发回）。",
        "en": "The only difference from your `call_tool.py` is the call, written `get_weather(**args)`. `messages.append(msg)` stores the SDK object; the `openai` library converts it to a dict when sending, including DeepSeek's thinking-mode `reasoning_content`, which DeepSeek's docs ask you to send back in conversations with tools."
      }
    },
    {
      "t": "py",
      "title": {
        "zh": "for 循环、if / else 和「真假判断」",
        "en": "for loops, if / else and truthiness"
      },
      "zh": "**for 循环**：`for 变量 in 列表:` 把列表里的元素一个个取出来，每取一个就执行一遍下面缩进的代码。\n\n**if / else**：条件成立时执行 `if` 下面的代码，否则执行 `else` 下面的代码；中间还可以加 `elif`（否则如果）。\n\n**真假判断**：`if x:` 不一定要写成 `x == True`。Python 把这些值当作「假」：`None`、`False`、`0`、空字符串 `\"\"`、空列表 `[]`，其他值都是「真」。所以：\n- `if message[\"tool_calls\"]:`：有工具调用（不是 None、列表不为空）才执行\n- `msg.tool_calls or []`：`or` 返回第一个为「真」的值。`tool_calls` 是 None 时得到 `[]`，`for` 一次都不执行，也不会报错。04 节的 `delta.content or \"\"` 是同一个道理\n- 想明确判断是不是 None，写 `x is None` 或 `x is not None`",
      "en": "A **for loop** – `for item in a_list:` – takes the items out one by one and runs the indented code once per item.\n\n**if / else** runs the `if` block when the condition holds and the `else` block otherwise; `elif` (“else if”) can go in between.\n\n**Truthiness**: `if x:` doesn't need `x == True`. Python treats these as false: `None`, `False`, `0`, the empty string `\"\"`, the empty list `[]`; everything else is true. So:\n- `if message[\"tool_calls\"]:` runs only when there are tool calls (not None, not empty)\n- `msg.tool_calls or []`: `or` returns the first true value. When `tool_calls` is None you get `[]`, so the `for` loop runs zero times instead of failing. Lesson 04's `delta.content or \"\"` works the same way\n- to test for None explicitly, write `x is None` or `x is not None`",
      "code": {
        "zh": "for city in [\"北京\", \"上海\", \"广州\"]:\n    print(\"查询：\", city)\n\ntool_calls = None                 # 模型没有调用工具时就是 None\n# for call in tool_calls: ...     # 会报 TypeError：None 不能遍历\nfor call in tool_calls or []:     # None or [] -> []，循环 0 次\n    print(\"这一行不会执行\")\n\nfor value in [None, \"\", [], 0, \"你好\", [1]]:\n    if value:\n        print(repr(value), \"-> 真\")   # repr() 显示值本来的样子，字符串带引号\n    else:\n        print(repr(value), \"-> 假\")\n\ncontent = None\nprint(content is None)            # True",
        "en": "for city in [\"Beijing\", \"Shanghai\", \"Guangzhou\"]:\n    print(\"looking up:\", city)\n\ntool_calls = None                 # what you get when the model calls no tool\n# for call in tool_calls: ...     # TypeError: None is not iterable\nfor call in tool_calls or []:     # None or [] -> [], zero rounds\n    print(\"never runs\")\n\nfor value in [None, \"\", [], 0, \"hi\", [1]]:\n    if value:\n        print(repr(value), \"-> true\")    # repr() shows the raw value, strings in quotes\n    else:\n        print(repr(value), \"-> false\")\n\ncontent = None\nprint(content is None)            # True"
      }
    },
    {
      "t": "h",
      "zh": "八、为什么对话记录必须完整",
      "en": "8. Why the record must be complete"
    },
    {
      "t": "p",
      "zh": "[▶ 14:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=842) 视频最后回头把代码复盘了一遍，重点是对话记录。交回工具结果时，不能只把结果丢给模型，还得让它知道：这是哪一次调用的结果、当初为什么要调用。不然模型会一头雾水——它不记得自己要过工具，突然收到一个结果。所以每次发出去的都是**完整**的记录 [▶ 15:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=908)。\n\n问一次天气，记录里会依次多出 4 条消息（上面 `调用LLM.py` 最后打印的就是它们）：\n\n1. `user`：今天北京天气如何\n2. `assistant`：没有文字答案，带着 `tool_calls`（要调用 `get_weather`，编号比如 `call_abc`）\n3. `tool`：你的代码执行函数后交回的结果，`tool_call_id` 是 `call_abc`\n4. `assistant`：模型根据结果写出的最终回答\n\n第 2 条**必须**在记录里，第 3 条的编号才有对应的请求；少了它，接口直接返回 400 错误（DeepSeek 实测：`Messages with role 'tool' must be a response to a preceding message with 'tool_calls'`）。",
      "en": "[▶ 14:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=842) At the end the video walks back through the code, focusing on the conversation record. When you return a tool result, handing over the result alone isn't enough: the model must also know which call it answers and why it asked in the first place. Otherwise it's lost – it doesn't remember requesting a tool and suddenly receives a result. So what goes out each time is the **complete** record [▶ 15:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=908).\n\nAsking about the weather once adds four messages to the record (the last lines of `call_llm.py` above print them):\n\n1. `user`: what's the weather in Beijing today\n2. `assistant`: no text answer, but `tool_calls` (asking for `get_weather`, id `call_abc`, say)\n3. `tool`: the result your code returned after running the function, with `tool_call_id` `call_abc`\n4. `assistant`: the final answer written from that result\n\nMessage 2 **must** be in the record so message 3's id has a request to match; without it the API returns a 400 error (tested on DeepSeek: `Messages with role 'tool' must be a response to a preceding message with 'tool_calls'`)."
    },
    {
      "t": "p",
      "zh": "[▶ 16:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=1003) 这种记忆很简单粗暴：一个全局列表，一直往里加。问题是对话越聊越长，比如聊了半小时，每次请求都带着全部记录：费用越来越高、速度越来越慢，回答质量也可能下降；一旦超过模型能接受的长度上限，请求就直接失败。所以记忆要**管理**，这就是下一节 [06 节](#/lesson/l06) 的内容。",
      "en": "[▶ 16:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=6&t=1003) This kind of memory is crude: one global list that only grows. The trouble is that conversations get long – half an hour of chat, say – and every request carries the whole record: costs rise, responses slow down, quality may drop, and past the model's length limit the request simply fails. So memory has to be **managed**, which is the topic of [lesson 06](#/lesson/l06)."
    },
    {
      "t": "check",
      "q": {
        "zh": "交回工具结果时，为什么要把整段对话记录（而不只是这条 tool 消息）发给模型？",
        "en": "When returning a tool result, why send the whole conversation record rather than just the tool message?"
      },
      "options": [
        {
          "zh": "为了让请求更快",
          "en": "To make the request faster"
        },
        {
          "zh": "模型接口没有记忆，它要看到自己当初的请求和原来的问题，才知道这条结果是干什么用的",
          "en": "The API has no memory; the model must see its own request and the original question to know what the result is for"
        },
        {
          "zh": "tool 消息必须是列表里的第一条",
          "en": "A tool message must be the first in the list"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "记录里要有带 `tool_calls` 的 assistant 消息，tool 消息才能按 `tool_call_id` 对上；没有原来的问题，模型也不知道该回答什么。",
        "en": "The record needs the assistant message with `tool_calls` for the tool message to match by `tool_call_id`, and without the original question the model wouldn't know what to answer."
      }
    },
    {
      "t": "h",
      "zh": "九、补充：视频之外常遇到的三种情况",
      "en": "9. Extra: three situations the video doesn't cover"
    },
    {
      "t": "note",
      "zh": "补充：这一部分视频里没有，但用 deepseek-flash 很快就会遇到，后面的 07 节也会用到。",
      "en": "Extra: not in the video, but you'll meet these quickly with deepseek-flash, and lesson 07 builds on them."
    },
    {
      "t": "p",
      "zh": "**1. 一次请求好几个工具调用。** 问「北京和上海现在天气怎么样？」，deepseek-flash 通常会在**一条**回复里请求**两个**调用（实测）。视频的写法只处理 `tool_calls[0]`，第二个调用没有结果，下一次请求就会报 400。改法：用 `for` 处理每一个调用，**全部**结果存好以后再调用模型。下面这个版本再加上 `if / else`：模型不需要工具时直接打印回答，省掉第二次调用。",
      "en": "**1. Several tool calls at once.** Ask “What's the weather in Beijing and Shanghai?” and deepseek-flash usually requests **two** calls in **one** reply (tested). The video's code handles only `tool_calls[0]`, so the second call gets no result and the next request fails with 400. The fix: handle every call with `for`, and call the model only after **all** results are stored. This version adds `if / else`: when no tool is needed it prints the answer directly and skips the second call."
    },
    {
      "t": "code",
      "file": "two_cities.py",
      "run": "mock",
      "code": {
        "zh": "import json\nfrom llm import client, MODEL\nfrom weather_tool import get_weather, tools\n\nmessages = [{\"role\": \"user\", \"content\": \"北京和上海现在天气怎么样？\"}]\nresponse = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)\nmsg = response.choices[0].message\n\nif msg.tool_calls:                        # 模型要调用工具\n    messages.append(msg)\n    for call in msg.tool_calls:\n        args = json.loads(call.function.arguments)\n        result = get_weather(**args)\n        print(f\"  {call.function.name}({args}) -> {result}\")\n        messages.append({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": str(result)})\n    response = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)\n    print(response.choices[0].message.content)\nelse:                                     # 不需要工具：这就是回答\n    print(msg.content)",
        "en": "import json\nfrom llm import client, MODEL\nfrom weather_tool import get_weather, tools\n\nmessages = [{\"role\": \"user\", \"content\": \"What's the weather in Beijing and Shanghai?\"}]\nresponse = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)\nmsg = response.choices[0].message\n\nif msg.tool_calls:                        # the model wants tools\n    messages.append(msg)\n    for call in msg.tool_calls:\n        args = json.loads(call.function.arguments)\n        result = get_weather(**args)\n        print(f\"  {call.function.name}({args}) -> {result}\")\n        messages.append({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": str(result)})\n    response = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)\n    print(response.choices[0].message.content)\nelse:                                     # no tool needed: this is the answer\n    print(msg.content)"
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "模型一次返回了 2 个 tool_calls，你应该怎么做？",
        "en": "The model returned 2 tool_calls at once. What do you do?"
      },
      "options": [
        {
          "zh": "只执行第一个，第二个忽略",
          "en": "Run only the first and ignore the second"
        },
        {
          "zh": "执行第一个就调用模型，再执行第二个再调用",
          "en": "Run the first, call the model, then run the second and call again"
        },
        {
          "zh": "两个都执行，两条 tool 消息都加进去，再调用模型",
          "en": "Run both, add both tool messages, then call the model"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "每个 `tool_call_id` 都必须有结果，而且要全部交回后才能再次调用模型。",
        "en": "Every `tool_call_id` needs a result, and all of them must be returned before the next model call."
      }
    },
    {
      "t": "p",
      "zh": "**2. 两个工具：按名字选函数。** 工具多了以后，模型会在 `call.function.name` 里告诉你它要哪一个，你的代码根据名字决定执行哪个函数。最直接的写法是 `if / elif`（完整程序见 `practice/l05_two_tools.py`，多了一个没有参数的 `get_time` 工具，它的 `properties` 是空字典）：",
      "en": "**2. Two tools: picking the function by name.** With several tools, the model names the one it wants in `call.function.name`, and your code picks the function to run. The plainest way is `if / elif` (full program in `practice/l05_two_tools.py`, which adds `get_time`, a tool with no arguments – its `properties` is an empty dict):"
    },
    {
      "t": "code",
      "file": {
        "zh": "按名字选函数（片段）",
        "en": "choosing by name (fragment)"
      },
      "code": {
        "zh": "for call in msg.tool_calls:\n    args = json.loads(call.function.arguments)\n    if call.function.name == \"get_weather\":\n        result = get_weather(**args)\n    elif call.function.name == \"get_time\":\n        result = get_time()\n    else:\n        result = f\"没有这个工具：{call.function.name}\"\n    messages.append({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": str(result)})",
        "en": "for call in msg.tool_calls:\n    args = json.loads(call.function.arguments)\n    if call.function.name == \"get_weather\":\n        result = get_weather(**args)\n    elif call.function.name == \"get_time\":\n        result = get_time()\n    else:\n        result = f\"No such tool: {call.function.name}\"\n    messages.append({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": str(result)})"
      },
      "note": {
        "zh": "工具一多，`if / elif` 会越写越长。[07 节](#/lesson/l07) 会换成一个「名字 → 函数」的字典，一行就能查到并执行。",
        "en": "With many tools the `if / elif` chain keeps growing. [Lesson 07](#/lesson/l07) replaces it with a “name → function” dict, so one line looks up and runs the right function."
      }
    },
    {
      "t": "p",
      "zh": "**3. `tool_choice`：控制要不要用工具。** `create` 的 `tool_choice` 参数：\n\n| 取值 | 含义 |\n|---|---|\n| `\"auto\"`（默认） | 模型自己决定：回答文字，或调用一个/多个工具 |\n| `\"none\"` | 不许调用工具，只能回答文字 |\n| `\"required\"` | 必须至少调用一个工具 |\n| `{\"type\": \"function\", \"function\": {\"name\": \"get_weather\"}}` | 必须调用指定的这个工具 |",
      "en": "**3. `tool_choice`: controlling tool use.** The `tool_choice` argument of `create`:\n\n| Value | Meaning |\n|---|---|\n| `\"auto\"` (default) | The model decides: answer in text, or call one or more tools |\n| `\"none\"` | No tools; text only |\n| `\"required\"` | Must call at least one tool |\n| `{\"type\": \"function\", \"function\": {\"name\": \"get_weather\"}}` | Must call this particular tool |"
    },
    {
      "t": "warn",
      "zh": "DeepSeek 实测：deepseek-flash 在默认的思考模式下，传 `tool_choice=\"required\"` 会返回 400 错误 `Thinking mode does not support this tool_choice`；按 DeepSeek 接口文档，指定函数名的写法在思考模式下也会返回 400。需要强制调用时，先用 `extra_body={\"thinking\": {\"type\": \"disabled\"}}` 关掉思考（04 节讲过）。平时用默认的 `\"auto\"` 就够了。网页里的模拟模型不理会 `tool_choice`。",
      "en": "Tested on DeepSeek: in its default thinking mode, deepseek-flash rejects `tool_choice=\"required\"` with a 400 error, `Thinking mode does not support this tool_choice`; per DeepSeek's API docs, naming a specific function is also rejected with a 400 in thinking mode. To force a call, first turn thinking off with `extra_body={\"thinking\": {\"type\": \"disabled\"}}` (see lesson 04). Normally the default `\"auto\"` is all you need. The browser's mock model ignores `tool_choice`."
    },
    {
      "t": "tip",
      "zh": "如果模型看到结果后还想再调用工具（比如先查一个城市，再决定查另一个），只交回一次结果就不够了，要用 `while` 循环一直处理到没有 `tool_calls` 为止。[06 节](#/lesson/l06) 最后的聊天程序会这样写，[07 节](#/lesson/l07) 再把它变成真正的 Agent 循环。",
      "en": "If the model wants more tools after seeing the results (look up one city, then decide on another), returning results once isn't enough; loop with `while` until there are no more `tool_calls`. The chat program at the end of [lesson 06](#/lesson/l06) does this, and [lesson 07](#/lesson/l07) turns it into a real agent loop."
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "模型返回了 `tool_calls`，下面哪个说法是对的？",
        "en": "The model returned `tool_calls`. Which statement is true?"
      },
      "options": [
        {
          "zh": "模型已经在服务器上把函数执行完了",
          "en": "The model has already run the function on the server"
        },
        {
          "zh": "这条消息的 `content` 就是最终回答",
          "en": "This message's `content` is the final answer"
        },
        {
          "zh": "不用再调用模型了，直接打印工具结果即可",
          "en": "No further model call is needed; just print the tool result"
        },
        {
          "zh": "模型只是提出请求，函数要由你的代码执行，再把结果交回去",
          "en": "The model only made a request; your code runs the function and hands the result back"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "模型从不执行代码。你执行函数、交回 tool 消息，再调用一次模型，才得到最终回答。",
        "en": "The model never runs code. You run the function, return a tool message and call the model again to get the final answer."
      }
    },
    {
      "q": {
        "zh": "视频为什么从这一集起把模型从 DeepSeek V3 换成了通义千问？",
        "en": "Why does the video switch from DeepSeek V3 to Qwen in this episode?"
      },
      "options": [
        {
          "zh": "老师当时用的 DeepSeek V3 调用不了工具，而不支持工具调用的模型带上 tools 会报错",
          "en": "The DeepSeek V3 the instructor used then couldn't call tools, and a model without tool support errors out when given tools"
        },
        {
          "zh": "通义千问的回答更短",
          "en": "Qwen gives shorter answers"
        },
        {
          "zh": "DeepSeek 不兼容 OpenAI 接口",
          "en": "DeepSeek isn't OpenAI-compatible"
        },
        {
          "zh": "通义千问不需要 key",
          "en": "Qwen needs no key"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "这就是五步里的第 1 步：先确认模型支持工具调用。现在的 deepseek-flash 支持，所以本课继续用它。",
        "en": "That's step 1 of the five: check that the model supports tool calls. Today's deepseek-flash does, so this course keeps using it."
      }
    },
    {
      "q": {
        "zh": "一条正确的 tool 消息应该包含什么？",
        "en": "What must a correct tool message contain?"
      },
      "options": [
        {
          "zh": "`role: \"assistant\"` 和工具结果",
          "en": "`role: \"assistant\"` and the tool result"
        },
        {
          "zh": "`role: \"tool\"`、对应的 `tool_call_id`、字符串形式的 `content`",
          "en": "`role: \"tool\"`, the matching `tool_call_id`, and `content` as a string"
        },
        {
          "zh": "`role: \"tool\"` 和函数名",
          "en": "`role: \"tool\"` and the function name"
        },
        {
          "zh": "`role: \"user\"`，把结果当成用户的话",
          "en": "`role: \"user\"`, passing the result off as the user's words"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "`tool_call_id` 用来和请求对上号，`content` 必须是字符串。",
        "en": "`tool_call_id` matches the request, and `content` must be a string."
      }
    },
    {
      "q": {
        "zh": "视频里 `get_completion` 每次都把提问和回答存进函数外面的列表，这样做的主要目的是？",
        "en": "In the video, `get_completion` stores every question and answer in a list outside the function. What's the main purpose?"
      },
      "options": [
        {
          "zh": "方便打印日志",
          "en": "Easier logging"
        },
        {
          "zh": "减少 token 用量",
          "en": "To use fewer tokens"
        },
        {
          "zh": "模型接口没有记忆，每次发送完整记录，模型才知道前面说过什么、自己要过什么工具",
          "en": "The API has no memory; sending the full record lets the model know what was said and which tools it asked for"
        },
        {
          "zh": "让模型可以自己执行函数",
          "en": "So the model can run functions itself"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "这份列表就是最简单的短期记忆。代价是它越来越长，06 节讲怎么管理。",
        "en": "That list is the simplest short-term memory. The price is that it keeps growing; lesson 06 manages it."
      }
    },
    {
      "q": {
        "zh": "`args = call.function.arguments` 之后写 `get_weather(**args)` 报错，原因是？",
        "en": "`args = call.function.arguments` followed by `get_weather(**args)` fails. Why?"
      },
      "options": [
        {
          "zh": "`get_weather` 只能按位置传参",
          "en": "`get_weather` only accepts positional arguments"
        },
        {
          "zh": "`**` 只能用在列表上",
          "en": "`**` only works on lists"
        },
        {
          "zh": "模型没有返回参数",
          "en": "The model returned no arguments"
        },
        {
          "zh": "`arguments` 是 JSON 字符串，要先 `json.loads` 成字典",
          "en": "`arguments` is a JSON string; `json.loads` it into a dict first"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "`**` 解包需要字典。`json.loads(call.function.arguments)` 之后才是字典。",
        "en": "`**` unpacking needs a dict, which you only get after `json.loads(call.function.arguments)`."
      }
    },
    {
      "q": {
        "zh": "工具说明里，哪一项最影响模型「要不要调用、参数怎么填」？",
        "en": "Which part of a tool description most affects whether the model calls it and how it fills the arguments?"
      },
      "options": [
        {
          "zh": "`\"type\": \"function\"`",
          "en": "`\"type\": \"function\"`"
        },
        {
          "zh": "工具和参数的 `description`",
          "en": "The `description` of the tool and its arguments"
        },
        {
          "zh": "`tools` 列表里工具的顺序",
          "en": "The order of tools in the list"
        },
        {
          "zh": "函数的 Python 代码写得是否简洁",
          "en": "How tidy the function's Python code is"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "模型看不到代码，只看说明。写清楚做什么、什么时候用、参数的格式和单位。",
        "en": "The model can't see your code, only the description. Say what it does, when to use it, and each argument's format and units."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "写工具说明",
        "en": "Write the tool description"
      },
      "code": "tools = [{\n    \"type\": \"[[function]]\",\n    \"function\": {\n        \"[[name]]\": \"get_weather\",\n        \"[[description]]\": \"Get the current temperature (Celsius) for a given latitude and longitude.\",\n        \"parameters\": {\n            \"type\": \"[[object]]\",\n            \"[[properties]]\": {\n                \"latitude\": {\"type\": \"[[number]]\", \"description\": \"The latitude of the location.\"},\n                \"longitude\": {\"type\": \"number\", \"description\": \"The longitude of the location.\"},\n            },\n            \"[[required]]\": [\"latitude\", \"longitude\"],\n        },\n    },\n}]",
      "explain": {
        "zh": "外层 `type` 固定是 function；`parameters` 是 JSON Schema：类型 object、`properties` 列出每个参数、`required` 列出必填的。",
        "en": "The outer `type` is always function; `parameters` is JSON Schema: type object, `properties` listing each argument, `required` listing the mandatory ones."
      }
    },
    {
      "title": {
        "zh": "封装 get_completion（视频的写法）",
        "en": "Wrap get_completion (the video's way)"
      },
      "code": "message_history = []\n\ndef get_completion(message):\n    message_history.[[append]](message)\n    response = client.chat.completions.create(\n        model=MODEL,\n        messages=[[message_history]],\n        [[tools=tools]],\n    )\n    reply = [[dict]](response.choices[0].message)\n    message_history.append([[reply]])\n    [[return]] reply",
      "explain": {
        "zh": "记录列表写在函数外面；先存提问，再发送**整个**记录，最后把回答也存进去并返回。",
        "en": "The record lives outside the function; store the question, send the **whole** record, then store and return the reply."
      }
    },
    {
      "title": {
        "zh": "执行工具并交回结果",
        "en": "Run the tool and hand back the result"
      },
      "code": "response = client.chat.completions.create(model=MODEL, messages=messages, [[tools=tools]])\nmsg = response.choices[0].message\nif msg.[[tool_calls]]:\n    messages.[[append]](msg)\n    for call in msg.tool_calls:\n        args = json.[[loads]](call.function.[[arguments]])\n        result = get_weather([[**args]])\n        messages.append({\"role\": \"[[tool]]\", \"[[tool_call_id]]\": call.[[id]], \"content\": [[str(result)|json.dumps(result)]]})\n    response = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)\n    print(response.choices[0].message.content)",
      "explain": {
        "zh": "先存带 `tool_calls` 的消息，再为每个调用存一条 tool 消息（编号对上、内容是字符串），最后再调用一次模型。",
        "en": "Store the message with `tool_calls`, add one tool message per call (matching id, string content), then call the model once more."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：视频的五步——封装 get_completion，完成一次工具调用",
        "en": "Write it: the video's five steps – wrap get_completion and make one tool call"
      },
      "task": {
        "zh": "不看上面的代码，写出视频的第 4、5 步：\n1. 在函数外面定义空列表 `message_history`\n2. 定义 `get_completion(message)`：把 message 存进记录 → 带上 `tools`、用整个记录调用模型 → 用 `dict(...)`（或 `model_dump()`）把回答转成字典存进记录 → 返回回答\n3. 问「今天北京天气如何？」；回答里有 `tool_calls` 时，取第一个调用，`json.loads` 参数，执行 `get_weather`，再把结果作为 tool 消息交给 `get_completion`\n4. 打印最终回答",
        "en": "Without looking above, write the video's steps 4 and 5:\n1. define an empty list `message_history` outside the function\n2. define `get_completion(message)`: store the message → call the model with the whole record and `tools` → convert the reply with `dict(...)` (or `model_dump()`) and store it → return it\n3. ask “What's the weather in Beijing today?”; if the reply has `tool_calls`, take the first call, `json.loads` its arguments, run `get_weather`, and pass the result to `get_completion` as a tool message\n4. print the final answer"
      },
      "run": "mock",
      "starter": {
        "zh": "import json\nfrom llm import client, MODEL\nfrom weather_tool import get_weather, tools\n\n# 1. 对话记录列表（写在函数外面）\n\n\n# 2. get_completion(message)：存提问 -> 带 tools 发送整个记录 -> 回答转成字典并存进去 -> 返回回答\n\n\n# 3. 问「今天北京天气如何？」；如果回答里有 tool_calls，执行第一个调用并把结果交回去\n\n\n# 4. 打印最终回答",
        "en": "import json\nfrom llm import client, MODEL\nfrom weather_tool import get_weather, tools\n\n# 1. the conversation record (outside the function)\n\n\n# 2. get_completion(message): store the question -> send the whole record with tools -> store the reply as a dict -> return it\n\n\n# 3. ask \"What's the weather in Beijing today?\"; if the reply has tool_calls, run the first call and hand back the result\n\n\n# 4. print the final answer"
      },
      "solution": {
        "zh": "import json\nfrom llm import client, MODEL\nfrom weather_tool import get_weather, tools\n\n# 1. 对话记录列表（写在函数外面）\nmessage_history = []\n\n# 2. get_completion(message)：存提问 -> 带 tools 发送整个记录 -> 回答转成字典并存进去 -> 返回回答\ndef get_completion(message):\n    message_history.append(message)\n    response = client.chat.completions.create(model=MODEL, messages=message_history, tools=tools)\n    reply = dict(response.choices[0].message)\n    message_history.append(reply)\n    return reply\n\n# 3. 问「今天北京天气如何？」；如果回答里有 tool_calls，执行第一个调用并把结果交回去\nmessage = get_completion({\"role\": \"user\", \"content\": \"今天北京天气如何？\"})\nif message[\"tool_calls\"]:\n    call = message[\"tool_calls\"][0]\n    args = json.loads(call.function.arguments)\n    result = get_weather(**args)\n    message = get_completion({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": str(result)})\n\n# 4. 打印最终回答\nprint(message[\"content\"])",
        "en": "import json\nfrom llm import client, MODEL\nfrom weather_tool import get_weather, tools\n\n# 1. the conversation record (outside the function)\nmessage_history = []\n\n# 2. get_completion(message): store the question -> send the whole record with tools -> store the reply as a dict -> return it\ndef get_completion(message):\n    message_history.append(message)\n    response = client.chat.completions.create(model=MODEL, messages=message_history, tools=tools)\n    reply = dict(response.choices[0].message)\n    message_history.append(reply)\n    return reply\n\n# 3. ask \"What's the weather in Beijing today?\"; if the reply has tool_calls, run the first call and hand back the result\nmessage = get_completion({\"role\": \"user\", \"content\": \"What's the weather in Beijing today?\"})\nif message[\"tool_calls\"]:\n    call = message[\"tool_calls\"][0]\n    args = json.loads(call.function.arguments)\n    result = get_weather(**args)\n    message = get_completion({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": str(result)})\n\n# 4. print the final answer\nprint(message[\"content\"])"
      },
      "checks": [
        {
          "zh": "在函数外面定义了空列表 `message_history = []`",
          "en": "An empty list `message_history = []` outside the function",
          "re": "^message_history\\s*=\\s*\\[\\s*\\]"
        },
        {
          "zh": "定义了 `get_completion(message)`",
          "en": "Defines `get_completion(message)`",
          "re": "def\\s+get_completion\\s*\\(\\s*\\w+\\s*\\)\\s*:"
        },
        {
          "zh": "把提问 `append` 进记录",
          "en": "Adds the question to the record with `append`",
          "re": "message_history\\.append\\(\\s*message\\s*\\)"
        },
        {
          "zh": "用整个记录调用模型：`messages=message_history`",
          "en": "Calls the model with `messages=message_history`",
          "re": "messages\\s*=\\s*message_history"
        },
        {
          "zh": "调用时带上 `tools=tools`",
          "en": "Passes `tools=tools`",
          "re": "tools\\s*=\\s*tools"
        },
        {
          "zh": "把回答转成字典（`dict(...)` 或 `model_dump()`）",
          "en": "Converts the reply (`dict(...)` or `model_dump()`)",
          "re": "(dict\\(\\s*\\w+\\.choices\\[0\\]\\.message\\s*\\)|\\.model_dump\\(\\))"
        },
        {
          "zh": "函数里有 `return`",
          "en": "The function returns something",
          "re": "^\\s+return\\b"
        },
        {
          "zh": "用 `json.loads` 解析参数",
          "en": "Parses the arguments with `json.loads`",
          "re": "json\\.loads\\(\\s*\\w+\\.function\\.arguments\\s*\\)"
        },
        {
          "zh": "交回一条 role 为 tool、带 `tool_call_id` 的消息",
          "en": "Hands back a message with role tool and a `tool_call_id`",
          "re": "[\\\"']role[\\\"']\\s*:\\s*[\\\"']tool[\\\"']\\s*,\\s*[\\\"']tool_call_id[\\\"']\\s*:\\s*\\w+\\.id"
        },
        {
          "zh": "`get_completion` 一共调用了两次",
          "en": "Calls `get_completion` twice",
          "re": "def\\s+get_completion[\\s\\S]*get_completion\\(\\{[\\s\\S]*get_completion\\(\\{"
        }
      ]
    },
    {
      "title": {
        "zh": "手写：给 add(a, b) 写函数和工具说明",
        "en": "Write it: a function and tool description for add(a, b)"
      },
      "task": {
        "zh": "从零写一个新工具（视频的第 2、3 步），再让模型用上它：\n1. 定义函数 `add(a, b)`，返回两个数的和\n2. 写 `tools`：一个名为 `add` 的工具，有 `description`；参数 `a`、`b` 的类型都是 `number`，都必填\n3. 调用模型 → 执行 `add` → 交回结果，打印最终回答\n\n在网页里运行，看模拟模型是不是请求了 `add`，参数是不是 3.5 和 4.2。",
        "en": "Write a brand-new tool (the video's steps 2 and 3), then let the model use it:\n1. define `add(a, b)` returning the sum of two numbers\n2. write `tools`: one tool named `add` with a `description`; arguments `a` and `b`, both of type `number`, both required\n3. call the model → run `add` → hand back the result, and print the final answer\n\nRun it in the browser and check that the mock model requests `add` with 3.5 and 4.2."
      },
      "run": "mock",
      "starter": {
        "zh": "import json\nfrom llm import client, MODEL\n\n# 1. 定义函数 add(a, b)，返回两数之和\n\n\n# 2. 写工具说明：名字 add，参数 a、b 都是数字，都必填\n\n\nmessages = [{\"role\": \"user\", \"content\": \"3.5 + 4.2 等于多少？请用工具计算。\"}]\n\n# 3. 调用模型 -> 执行 add -> 交回结果，打印最终回答",
        "en": "import json\nfrom llm import client, MODEL\n\n# 1. define add(a, b) returning the sum\n\n\n# 2. the tool description: name add, arguments a and b are numbers, both required\n\n\nmessages = [{\"role\": \"user\", \"content\": \"What is 3.5 + 4.2? Please use the tool.\"}]\n\n# 3. call the model -> run add -> hand back the result, print the answer"
      },
      "solution": {
        "zh": "import json\nfrom llm import client, MODEL\n\n# 1. 定义函数 add(a, b)，返回两数之和\ndef add(a, b):\n    return a + b\n\n# 2. 写工具说明：名字 add，参数 a、b 都是数字，都必填\ntools = [{\n    \"type\": \"function\",\n    \"function\": {\n        \"name\": \"add\",\n        \"description\": \"Add two numbers and return the sum.\",\n        \"parameters\": {\n            \"type\": \"object\",\n            \"properties\": {\n                \"a\": {\"type\": \"number\", \"description\": \"The first number.\"},\n                \"b\": {\"type\": \"number\", \"description\": \"The second number.\"},\n            },\n            \"required\": [\"a\", \"b\"],\n        },\n    },\n}]\n\nmessages = [{\"role\": \"user\", \"content\": \"3.5 + 4.2 等于多少？请用工具计算。\"}]\n\n# 3. 调用模型 -> 执行 add -> 交回结果，打印最终回答\nresponse = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)\nmsg = response.choices[0].message\nif msg.tool_calls:\n    messages.append(msg)\n    for call in msg.tool_calls:\n        args = json.loads(call.function.arguments)\n        result = add(**args)\n        print(\"add\", args, \"->\", result)\n        messages.append({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": str(result)})\n    response = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)\n    print(response.choices[0].message.content)\nelse:\n    print(msg.content)",
        "en": "import json\nfrom llm import client, MODEL\n\n# 1. define add(a, b) returning the sum\ndef add(a, b):\n    return a + b\n\n# 2. the tool description: name add, arguments a and b are numbers, both required\ntools = [{\n    \"type\": \"function\",\n    \"function\": {\n        \"name\": \"add\",\n        \"description\": \"Add two numbers and return the sum.\",\n        \"parameters\": {\n            \"type\": \"object\",\n            \"properties\": {\n                \"a\": {\"type\": \"number\", \"description\": \"The first number.\"},\n                \"b\": {\"type\": \"number\", \"description\": \"The second number.\"},\n            },\n            \"required\": [\"a\", \"b\"],\n        },\n    },\n}]\n\nmessages = [{\"role\": \"user\", \"content\": \"What is 3.5 + 4.2? Please use the tool.\"}]\n\n# 3. call the model -> run add -> hand back the result, print the answer\nresponse = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)\nmsg = response.choices[0].message\nif msg.tool_calls:\n    messages.append(msg)\n    for call in msg.tool_calls:\n        args = json.loads(call.function.arguments)\n        result = add(**args)\n        print(\"add\", args, \"->\", result)\n        messages.append({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": str(result)})\n    response = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)\n    print(response.choices[0].message.content)\nelse:\n    print(msg.content)"
      },
      "checks": [
        {
          "zh": "定义了 `def add(a, b):`",
          "en": "Defines `def add(a, b):`",
          "re": "def\\s+add\\s*\\(\\s*a\\s*,\\s*b\\s*\\)\\s*:"
        },
        {
          "zh": "函数 `return a + b`",
          "en": "The function does `return a + b`",
          "re": "^\\s+return\\s+a\\s*\\+\\s*b"
        },
        {
          "zh": "工具的 `name` 是 `\"add\"`",
          "en": "The tool's `name` is `\"add\"`",
          "re": "[\\\"']name[\\\"']\\s*:\\s*[\\\"']add[\\\"']"
        },
        {
          "zh": "写了 `description`",
          "en": "Has a `description`",
          "re": "[\\\"']description[\\\"']\\s*:\\s*[\\\"']"
        },
        {
          "zh": "参数类型写成 `number`",
          "en": "Argument type `number`",
          "re": "[\\\"']type[\\\"']\\s*:\\s*[\\\"']number[\\\"']"
        },
        {
          "zh": "写了 `required` 列表",
          "en": "Has a `required` list",
          "re": "[\\\"']required[\\\"']\\s*:\\s*\\["
        },
        {
          "zh": "调用模型时带上 `tools=tools`",
          "en": "Passes `tools=tools`",
          "re": "tools\\s*=\\s*tools"
        },
        {
          "zh": "用 `json.loads` 解析参数",
          "en": "Parses arguments with `json.loads`",
          "re": "json\\.loads\\("
        },
        {
          "zh": "执行了 `add`（`**args` 或按键取值）",
          "en": "Runs `add` (`**args` or by key)",
          "re": "\\badd\\(\\s*(\\*\\*\\w+|\\w+\\[)"
        },
        {
          "zh": "存了带 `tool_call_id` 的 tool 消息",
          "en": "Stores a tool message with `tool_call_id`",
          "re": "[\\\"']tool_call_id[\\\"']\\s*:"
        }
      ]
    },
    {
      "title": {
        "zh": "手写（补充）：一次查两个城市",
        "en": "Write it (extra): two cities at once"
      },
      "task": {
        "zh": "不看上面的代码，补全程序：\n1. 带上 `tools` 调用模型，取出 `msg`\n2. 如果有 `tool_calls`：先把 `msg` 存进 `messages`；再对**每一个**调用，用 `json.loads` 解析参数、执行 `get_weather`，存一条 tool 消息\n3. 再调用一次模型，打印最终回答；没有 `tool_calls` 时直接打印 `msg.content`\n\n问题是「北京和上海现在天气怎么样？」，模型会一次请求两个调用。",
        "en": "Without looking above, complete the program:\n1. call the model with `tools` and take `msg`\n2. if there are `tool_calls`: store `msg` in `messages`; then for **every** call, parse the arguments with `json.loads`, run `get_weather` and store a tool message\n3. call the model again and print the final answer; with no `tool_calls`, print `msg.content` directly\n\nThe question is about Beijing and Shanghai, so the model requests two calls at once."
      },
      "run": "mock",
      "starter": {
        "zh": "import json\nfrom llm import client, MODEL\nfrom weather_tool import get_weather, tools\n\nmessages = [{\"role\": \"user\", \"content\": \"北京和上海现在天气怎么样？\"}]\n\n# 1. 带上工具说明调用模型，取出 msg\n\n\n# 2. 有工具调用时，先存 msg，再逐个执行 get_weather 并存结果\n\n\n# 3. 再调用一次模型，打印最终回答（没有工具调用就直接打印 msg.content）",
        "en": "import json\nfrom llm import client, MODEL\nfrom weather_tool import get_weather, tools\n\nmessages = [{\"role\": \"user\", \"content\": \"What's the weather in Beijing and Shanghai?\"}]\n\n# 1. call the model with the tool descriptions, take msg\n\n\n# 2. if the model wants tools, store msg, then run get_weather for each call and store the results\n\n\n# 3. call the model again and print the final answer (or print msg.content if no tools were needed)"
      },
      "solution": {
        "zh": "import json\nfrom llm import client, MODEL\nfrom weather_tool import get_weather, tools\n\nmessages = [{\"role\": \"user\", \"content\": \"北京和上海现在天气怎么样？\"}]\n\n# 1. 带上工具说明调用模型，取出 msg\nresponse = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)\nmsg = response.choices[0].message\n\nif msg.tool_calls:\n    # 2. 有工具调用时，先存 msg，再逐个执行 get_weather 并存结果\n    messages.append(msg)\n    for call in msg.tool_calls:\n        args = json.loads(call.function.arguments)\n        result = get_weather(**args)\n        messages.append({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": str(result)})\n    # 3. 再调用一次模型，打印最终回答（没有工具调用就直接打印 msg.content）\n    response = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)\n    print(response.choices[0].message.content)\nelse:\n    print(msg.content)",
        "en": "import json\nfrom llm import client, MODEL\nfrom weather_tool import get_weather, tools\n\nmessages = [{\"role\": \"user\", \"content\": \"What's the weather in Beijing and Shanghai?\"}]\n\n# 1. call the model with the tool descriptions, take msg\nresponse = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)\nmsg = response.choices[0].message\n\nif msg.tool_calls:\n    # 2. if the model wants tools, store msg, then run get_weather for each call and store the results\n    messages.append(msg)\n    for call in msg.tool_calls:\n        args = json.loads(call.function.arguments)\n        result = get_weather(**args)\n        messages.append({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": str(result)})\n    # 3. call the model again and print the final answer (or print msg.content if no tools were needed)\n    response = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)\n    print(response.choices[0].message.content)\nelse:\n    print(msg.content)"
      },
      "checks": [
        {
          "zh": "调用模型时带上 `tools=tools`",
          "en": "Passes `tools=tools` to the model",
          "re": "tools\\s*=\\s*tools"
        },
        {
          "zh": "取出 `choices[0].message`",
          "en": "Takes `choices[0].message`",
          "re": "choices\\[0\\]\\.message\\b"
        },
        {
          "zh": "把带 tool_calls 的消息存进 `messages`",
          "en": "Stores the message with tool_calls in `messages`",
          "re": "messages\\.append\\(\\s*(\\w+|\\w+\\.choices\\[0\\]\\.message)\\s*\\)"
        },
        {
          "zh": "用 `for` 遍历每一个 `tool_calls`",
          "en": "Loops over every item of `tool_calls` with `for`",
          "re": "for\\s+\\w+\\s+in\\s+\\w+\\.tool_calls"
        },
        {
          "zh": "用 `json.loads` 解析 `function.arguments`",
          "en": "Parses `function.arguments` with `json.loads`",
          "re": "json\\.loads\\(\\s*\\w+\\.function\\.arguments\\s*\\)"
        },
        {
          "zh": "执行了 `get_weather`（`**args` 或按键取值）",
          "en": "Runs `get_weather` (`**args` or by key)",
          "re": "get_weather\\(\\s*(\\*\\*\\w+|\\w+\\[)"
        },
        {
          "zh": "存了一条 role 为 tool 的消息",
          "en": "Stores a message with role tool",
          "re": "[\\\"']role[\\\"']\\s*:\\s*[\\\"']tool[\\\"']"
        },
        {
          "zh": "`tool_call_id` 用的是调用的 `.id`",
          "en": "`tool_call_id` uses the call's `.id`",
          "re": "[\\\"']tool_call_id[\\\"']\\s*:\\s*\\w+\\.id"
        },
        {
          "zh": "结果转成了字符串",
          "en": "Converts the result to a string",
          "re": "[\\\"']content[\\\"']\\s*:\\s*(str|json\\.dumps)\\("
        },
        {
          "zh": "一共调用了两次模型",
          "en": "Calls the model twice in total",
          "re": "create\\([\\s\\S]*create\\("
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "没确认模型支持工具调用就带上 `tools`（视频的第 1 步）：不支持的模型会报错。",
      "en": "Sending `tools` to a model without checking it supports tool calls (step 1 in the video): one that doesn't will error."
    },
    {
      "zh": "忘了传 `tools=tools`：模型根本不知道有工具，只能凭空回答，甚至编一个天气出来。",
      "en": "Forgetting `tools=tools`: the model doesn't know the tool exists and answers from nothing – it may even invent the weather."
    },
    {
      "zh": "把 `call.function.arguments` 当字典用。它是 JSON 字符串，要先 `json.loads`。",
      "en": "Treating `call.function.arguments` as a dict. It's a JSON string – `json.loads` it first."
    },
    {
      "zh": "把 `message_history = []` 写进 `get_completion` 里面，每次调用都被清空，模型记不住前面的对话。",
      "en": "Putting `message_history = []` inside `get_completion`, so every call wipes it and the model forgets earlier turns."
    },
    {
      "zh": "自己维护 `messages` 时，没先存带 `tool_calls` 的 assistant 消息就加 tool 消息，或者 `tool_call_id` 填错（比如填了函数名），接口返回 400。",
      "en": "When managing `messages` yourself, adding tool messages before storing the assistant message with `tool_calls`, or a wrong `tool_call_id` (such as the function name) – the API returns 400."
    },
    {
      "zh": "tool 消息的 `content` 放了数字或字典，没有转成字符串（DeepSeek 返回 422）。",
      "en": "Putting a number or dict in a tool message's `content` instead of a string (DeepSeek returns 422)."
    },
    {
      "zh": "只处理 `tool_calls[0]`（视频的写法）：模型一次请求两个调用时，第二个没有结果，下一次请求报 400。",
      "en": "Handling only `tool_calls[0]` (as the video does): when the model asks for two calls, the second gets no result and the next request fails with 400."
    },
    {
      "zh": "`properties` 里的参数名和函数的参数名不一致，`get_weather(**args)` 报 `TypeError`；description 写得太含糊，模型不调用或填错参数。",
      "en": "Argument names in `properties` that differ from the function's parameters (`get_weather(**args)` raises `TypeError`), or a vague description, so the model skips the tool or fills it wrongly."
    }
  ],
  "recap": [
    {
      "zh": "工具调用 = 模型提出请求，你的代码执行函数，再把结果交回模型；模型自己从不执行代码。",
      "en": "Tool calling = the model asks, your code runs the function, the result goes back to the model; the model never runs code itself."
    },
    {
      "zh": "视频的五步：确认模型支持工具 → 定义函数 → 用 JSON Schema 描述 → 封装 `get_completion` 并保存对话记录 → 提问、执行工具、交回结果。",
      "en": "The video's five steps: check tool support → define the function → describe it in JSON Schema → wrap `get_completion` and keep the record → ask, run the tool, return the result."
    },
    {
      "zh": "工具说明：`type: \"function\"` + `function` 里的 `name`、`description`、`parameters`（`type: \"object\"`、`properties`、`required`）；描述写清楚做什么、什么时候用、参数格式和单位。",
      "en": "A tool description: `type: \"function\"` plus `name`, `description`, `parameters` (`type: \"object\"`, `properties`, `required`) inside `function`; say what it does, when to use it, and argument formats and units."
    },
    {
      "zh": "`get_completion`：记录列表写在函数外面；存提问 → 发送整个记录 → 存回答 → 返回。模型的「记忆」就是这份每次都发送的记录。",
      "en": "`get_completion`: the record list lives outside the function; store the question → send the whole record → store the reply → return it. The model's “memory” is this record, sent every time."
    },
    {
      "zh": "`tool_calls` 里每个调用有 `id`、`function.name`、`function.arguments`（JSON 字符串，用 `json.loads`，再 `**args` 传给函数）。",
      "en": "Each call in `tool_calls` has `id`, `function.name` and `function.arguments` (a JSON string – `json.loads` it, then pass it with `**args`)."
    },
    {
      "zh": "交回结果：`{\"role\": \"tool\", \"tool_call_id\": 调用的 id, \"content\": 字符串}`；它前面必须有带 `tool_calls` 的 assistant 消息。",
      "en": "Returning a result: `{\"role\": \"tool\", \"tool_call_id\": the call's id, \"content\": a string}`, preceded by the assistant message with `tool_calls`."
    },
    {
      "zh": "记录只会越来越长：更贵、更慢，超过上限就失败——06 节讲怎么管理。",
      "en": "The record only grows: costlier, slower, and it fails past the limit – lesson 06 shows how to manage it."
    }
  ],
  "files": [
    {
      "path": "practice/l05_get_completion_todo.py",
      "zh": "练习：按视频的第 4、5 步补全 `get_completion` 和一次工具调用（有 TODO 提示）。",
      "en": "Exercise: complete `get_completion` and one tool call, following the video's steps 4 and 5 (with TODO hints)."
    },
    {
      "path": "practice/l05_get_completion_solution.py",
      "zh": "上面练习的参考答案，最后会把对话记录逐条打印出来。",
      "en": "Reference solution for the exercise; it ends by printing the record message by message."
    },
    {
      "path": "practice/l05_call_tool_todo.py",
      "zh": "练习（补充）：不封装，补全「问模型 → 执行 get_weather → 交回结果」，一次查两个城市（有 TODO 提示）。",
      "en": "Exercise (extra): without the wrapper, complete ask → run get_weather → hand back the results for two cities at once (with TODO hints)."
    },
    {
      "path": "practice/l05_call_tool_solution.py",
      "zh": "上面练习的参考答案。",
      "en": "Reference solution for the exercise above."
    },
    {
      "path": "practice/l05_two_tools.py",
      "zh": "补充：两个工具（查天气 + 查时间），用 if / elif 按函数名选择执行哪个。",
      "en": "Extra: two tools (weather + time), choosing the function by name with if / elif."
    }
  ]
});
