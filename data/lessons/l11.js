COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l11",
  "priority": "core",
  "handwrite": true,
  "studyMinutes": 55,
  "source": "subtitle",
  "summary": {
    "zh": "这一集讲三件事。**结构化输出**：用 pydantic 的 `BaseModel` 定好字段，`Agent(output_type=...)` 让结果直接变成对象（DeepSeek 要多加一行设置）。**工具**：给函数写好 docstring、加上 `@function_tool`、放进 `tools` 列表，调用工具的来回由 Runner 自动完成。**MCP**：工具放在独立的 MCP 服务器里，用 `async with MCPServerStdio(...)` 启动它，再通过 `mcp_servers` 交给 Agent。",
    "en": "This episode covers three things. **Structured output**: define the fields with pydantic's `BaseModel`, and `Agent(output_type=...)` turns the result straight into an object (DeepSeek needs one extra setting). **Tools**: give a function a docstring, add `@function_tool` and put it in the `tools` list; the Runner handles the calling back and forth. **MCP**: tools live in a separate MCP server; start it with `async with MCPServerStdio(...)` and hand it to the agent through `mcp_servers`."
  },
  "goals": [
    {
      "zh": "用 pydantic `BaseModel` 定义输出结构，用 `output_type` 让 Agent 直接返回对象，并知道 DeepSeek 需要的那行设置",
      "en": "Define an output structure with pydantic `BaseModel`, get an object back via `output_type`, and know the extra setting DeepSeek needs"
    },
    {
      "zh": "用点号读取结果对象的属性，知道它在对话历史里是一段 JSON 字符串",
      "en": "Read the result object's attributes with a dot, and know it is a JSON string in the history"
    },
    {
      "zh": "用 `@function_tool` + docstring 把函数交给 Agent，说清楚 Runner 替你省掉了哪些步骤",
      "en": "Give a function to an agent with `@function_tool` + a docstring, and say which steps the Runner saves you"
    },
    {
      "zh": "说清楚 MCP 是什么，并用 FastMCP 写一个提供工具的服务器",
      "en": "Explain what MCP is and write a tool server with FastMCP"
    },
    {
      "zh": "不看资料，手写 `async with MCPServerStdio(...)` + `mcp_servers=[...]`，让 Agent 用上 MCP 服务器的工具",
      "en": "Write, unaided, `async with MCPServerStdio(...)` + `mcp_servers=[...]` so an agent uses an MCP server's tools"
    }
  ],
  "blocks": [
    {
      "t": "video",
      "zh": "这一集约 21 分钟，标题是「使用工具和 MCP」，但一开始先讲了上一集结尾预告的**结构化输出**：[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=0) 结构化输出，[▶ 06:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=410) 使用工具，[▶ 11:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=691) MCP，[▶ 20:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=1208) 最后预告下一集的多 Agent 编排。讲义和视频不同的地方：\n- **模型**：老师用的仍是谷歌的模型（[▶ 08:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=533) 他自己提到）。讲义用 DeepSeek 的 `deepseek-flash`；结构化输出那里要多加一行设置，后面会讲。\n- **同步 / 异步**：老师整集都拿第 09 集的异步代码当模板（`async def main()` + `await Runner.run(...)`）。讲义在结构化输出和工具两段改用更短的同步 `Runner.run_sync`，结果一样；MCP 那段必须用异步写法，讲义和视频一样用 `async def` + `await`。",
      "en": "This episode runs about 21 minutes. It is titled “Tools & MCP”, but it opens with the **structured output** promised at the end of the last episode: [▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=0) structured output, [▶ 06:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=410) using tools, [▶ 11:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=691) MCP, and [▶ 20:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=1208) a preview of multi-agent orchestration. Where these notes differ from the video:\n- **Model**: the instructor still uses a Google model (he says so at [▶ 08:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=533)). These notes use DeepSeek's `deepseek-flash`; structured output needs one extra setting, explained below.\n- **Sync / async**: throughout the episode the instructor uses episode 09's async code as his template (`async def main()` + `await Runner.run(...)`). For structured output and tools these notes use the shorter synchronous `Runner.run_sync` instead – the result is the same; the MCP part must be async, so there the notes use `async def` + `await` just like the video."
    },
    {
      "t": "h",
      "zh": "一、结构化输出：让 Agent 按固定格式回答",
      "en": "1. Structured output: answers in a fixed format"
    },
    {
      "t": "p",
      "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=0) 平时 Agent 像聊天一样用句子回答。**结构化输出**则要求它按指定的格式输出，比如 JSON，甚至直接给你一个对象。Agents SDK 支持好几种方式，老师推荐用 **pydantic** 来定义格式。\n\n[▶ 00:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=31) 他先从 pydantic 导入 `BaseModel`，写了一个类 `Data` 作为输出的数据结构，四个字段：名字、性别、事迹（字符串）和年龄（整数）。他特意说明字段名用中文也可以：Python 和 JSON 都允许。",
      "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=0) Normally an agent answers in chatty sentences. **Structured output** makes it answer in a format you specify – JSON, or even a ready-made object. The Agents SDK supports several ways to do this, and the instructor recommends defining the format with **pydantic**.\n\n[▶ 00:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=31) He imports `BaseModel` from pydantic and writes a class `Data` as the output's data structure, with four fields: name, gender, deeds (strings) and age (an integer). He points out that the field names may even be Chinese: both Python and JSON allow it."
    },
    {
      "t": "py",
      "title": {
        "zh": "pydantic BaseModel：给数据定好格式",
        "en": "pydantic BaseModel: give data a fixed shape"
      },
      "zh": "pydantic 是一个第三方库（课程环境已装好），专门做「数据格式检查」。写一个继承 `BaseModel` 的类，每个字段写成 `名字: 类型`（类和对象见第 08 节）：\n- 创建对象用关键字参数。pydantic 会**检查并转换类型**：`\"91\"` 会变成整数 `91`；`\"很老\"` 变不成整数，就抛出 `ValidationError`，并指出是哪个字段\n- 用点号读属性：`obj.名字`\n- `obj.model_dump_json()`：对象 → JSON 字符串；`Data.model_validate_json(文本)`：JSON 字符串 → 对象（相当于 `json.loads` 再加上检查）\n\n字段名用中文没问题，因为 Python 3 的变量名可以是中文。下面这段可以直接运行（第一次运行要加载 pydantic，稍等几秒）：",
      "en": "pydantic is a third-party library (already installed in the course environment) for checking data formats. Write a class that inherits from `BaseModel`, with each field written as `name: type` (classes and objects: lesson 08):\n- Create objects with keyword arguments. pydantic **checks and converts types**: `\"91\"` becomes the integer `91`; `\"very old\"` can't become an integer, so it raises `ValidationError` naming the field\n- Read attributes with a dot: `obj.name`\n- `obj.model_dump_json()`: object → JSON string; `Data.model_validate_json(text)`: JSON string → object (like `json.loads` plus checks)\n\nThe video uses Chinese field names (`名字`, `年龄`…), which is fine because Python 3 identifiers may be Chinese. This runs as is (the first run loads pydantic, so give it a few seconds):",
      "code": {
        "zh": "from pydantic import BaseModel, ValidationError\n\nclass Data(BaseModel):          # 继承 BaseModel\n    名字: str                   # 字段名: 类型（中文字段名也可以）\n    性别: str\n    事迹: str\n    年龄: int\n\nobj = Data(名字=\"袁隆平\", 性别=\"男\", 事迹=\"培育杂交水稻\", 年龄=\"91\")\nprint(obj)                      # 年龄=91：字符串 \"91\" 被转成了整数\nprint(obj.名字, obj.年龄 + 1)    # 用点号读属性\n\nprint(obj.model_dump_json())    # 对象 → JSON 字符串\ntext = '{\"名字\": \"屠呦呦\", \"性别\": \"女\", \"事迹\": \"发现青蒿素\", \"年龄\": 95}'\nobj2 = Data.model_validate_json(text)      # JSON 字符串 → 对象（带检查）\nprint(obj2.事迹)\n\ntry:\n    Data(名字=\"某人\", 性别=\"男\", 事迹=\"……\", 年龄=\"很老\")   # 年龄不是整数\nexcept ValidationError as e:\n    print(\"格式不对：\", e.errors()[0][\"loc\"], e.errors()[0][\"msg\"])",
        "en": "from pydantic import BaseModel, ValidationError\n\nclass Data(BaseModel):          # inherit from BaseModel\n    name: str                   # field_name: type (the video even uses Chinese names)\n    gender: str\n    deeds: str\n    age: int\n\nobj = Data(name=\"Yuan Longping\", gender=\"male\", deeds=\"bred hybrid rice\", age=\"91\")\nprint(obj)                      # age=91: the string \"91\" became an int\nprint(obj.name, obj.age + 1)    # read attributes with a dot\n\nprint(obj.model_dump_json())    # object -> JSON string\ntext = '{\"name\": \"Tu Youyou\", \"gender\": \"female\", \"deeds\": \"discovered artemisinin\", \"age\": 95}'\nobj2 = Data.model_validate_json(text)      # JSON string -> object (with checks)\nprint(obj2.deeds)\n\ntry:\n    Data(name=\"someone\", gender=\"male\", deeds=\"...\", age=\"very old\")   # age is not an int\nexcept ValidationError as e:\n    print(\"bad format:\", e.errors()[0][\"loc\"], e.errors()[0][\"msg\"])"
      }
    },
    {
      "t": "p",
      "zh": "[▶ 02:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=128) 有了结构，就可以要求 Agent 按它输出。老师的问题是「介绍一位值得记住的人」：介绍一个人可以有很多角度（身高、生日……），但现在只要名字、性别、事迹和年龄。[▶ 02:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=159) 关联的方法是创建 Agent 时多传一个参数 `output_type=Data`，SDK 会把这个结构告诉模型。[▶ 03:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=189) 这样一来，`result.final_output` 不再是字符串，甚至也不是 JSON，而是一个 **`Data` 对象**，可以用面向对象的方式读它的属性：",
      "en": "[▶ 02:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=128) With a structure in place you can ask the agent to follow it. The instructor's question is “introduce a person worth remembering”: you could describe someone from many angles (height, birthday…), but here only name, gender, deeds and age are wanted. [▶ 02:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=159) The link is one extra argument when creating the agent, `output_type=Data`, and the SDK tells the model about the structure. [▶ 03:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=189) Now `result.final_output` is no longer a string, not even JSON, but a **`Data` object** whose attributes you read the object-oriented way:"
    },
    {
      "t": "code",
      "file": "structured_output.py",
      "code": {
        "zh": "from pydantic import BaseModel\nfrom agents import Agent, ModelSettings, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\n\nclass Data(BaseModel):\n    名字: str\n    性别: str\n    事迹: str\n    年龄: int\n\nagent = Agent(\n    name=\"助手\",\n    instructions=\"你是一个人物介绍助手。用 JSON 回答，只包含四个字段：名字、性别、事迹、年龄（整数）。\",\n    model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),\n    output_type=Data,           # 视频里加的就是这一行：规定输出的结构\n    # DeepSeek 还要加下面这一行（原因见后面的提示）\n    model_settings=ModelSettings(extra_body={\"response_format\": {\"type\": \"json_object\"}}),\n)\n\nresult = Runner.run_sync(agent, \"介绍一位值得记住的人\")\nobj = result.final_output       # 不是字符串，而是一个 Data 对象\nprint(obj)\nprint(obj.名字, obj.性别, obj.年龄)\nprint(obj.事迹)",
        "en": "from pydantic import BaseModel\nfrom agents import Agent, ModelSettings, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\n\nclass Data(BaseModel):\n    name: str\n    gender: str\n    deeds: str\n    age: int\n\nagent = Agent(\n    name=\"assistant\",\n    instructions=\"You introduce people. Answer in JSON with exactly four fields: name, gender, deeds, age (an integer).\",\n    model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),\n    output_type=Data,           # the one line the video adds: the structure of the output\n    # DeepSeek also needs the next line (see the warning below)\n    model_settings=ModelSettings(extra_body={\"response_format\": {\"type\": \"json_object\"}}),\n)\n\nresult = Runner.run_sync(agent, \"Introduce a person worth remembering\")\nobj = result.final_output       # not a string but a Data object\nprint(obj)\nprint(obj.name, obj.gender, obj.age)\nprint(obj.deeds)"
      }
    },
    {
      "t": "warn",
      "zh": "视频里只加了 `output_type=Data` 一行，谷歌的模型就能用。**换成 DeepSeek，只写这一行会报 400**：`This response_format type is unavailable now`。原因是 `output_type` 让 SDK 在请求里带上 `response_format={\"type\": \"json_schema\", ...}`（把 `Data` 的结构发给模型），而 DeepSeek 只支持 `text` 和 `json_object` 两种。\n\n办法就是代码里多出来的那一行：`ModelSettings(extra_body=...)` 里的同名参数会覆盖 SDK 生成的，于是请求里的 `response_format` 变成了 DeepSeek 支持的 `{\"type\": \"json_object\"}`。这样模型就看不到 `Data` 的结构了，所以要在 `instructions` 里写明字段（json_object 模式也要求提示词里出现 json 字样）。SDK 收到回答后照样按 `Data` 检查，`final_output` 还是 `Data` 对象（2026-10 实测）。",
      "en": "In the video, adding `output_type=Data` is all it takes with the Google model. **With DeepSeek, that line alone fails with a 400**: `This response_format type is unavailable now`. `output_type` makes the SDK add `response_format={\"type\": \"json_schema\", ...}` to the request (sending `Data`'s structure to the model), and DeepSeek accepts only `text` and `json_object`.\n\nThe fix is the extra line in the code: a parameter in `ModelSettings(extra_body=...)` overrides the one the SDK generated, so the request's `response_format` becomes `{\"type\": \"json_object\"}`, which DeepSeek supports. The model no longer sees `Data`'s structure, so the `instructions` must list the fields (json_object mode also wants the word json in the prompt). The SDK still checks the reply against `Data`, and `final_output` is still a `Data` object (tested 2026-10)."
    },
    {
      "t": "p",
      "zh": "[▶ 04:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=252) 运行结果里，`print(obj)` 打出的是一个完整的对象，再用属性取出名字、性别和事迹。老师顺便提醒：同样的属性写法，如果没有设置结构化输出，`final_output` 只是一段字符串，就会出错。[▶ 04:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=285) 他说结构化输出在需要**精确**的场合很有用：避免自然语言的歧义，也避免回答又长又抓不住重点；而且它的结果还可以作为下一个 Agent 的输入。\n\n[▶ 05:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=315) 最后他打印了完整的对话记录：用户的问题后面，模型的回答是一段**文本**——对象被转成了 JSON 字符串。道理和上一节的图片一样：历史是要再发给模型的输入，只能是文字，所以 Python 对象要先变成 JSON 字符串。输出时是对象，可以读属性（甚至可以给类加方法再调用）；放进历史时是字符串。下面是运行 `practice/l11_structured_solution.py` 的实测输出（有省略）：",
      "en": "[▶ 04:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=252) In the output, `print(obj)` shows a complete object, and the attributes give the name, gender and deeds. The instructor notes in passing that the same attribute code fails without structured output, because `final_output` is then just a string. [▶ 04:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=285) He finds structured output valuable whenever you need **precision**: it avoids the ambiguity of natural language and long answers that miss the point, and its result can serve as the next agent's input.\n\n[▶ 05:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=315) Finally he prints the full conversation record: after the user's question, the model's answer is **text** – the object has become a JSON string. It is the same idea as the image in the last lesson: the history is input for the model again, so it must be text, and a Python object is turned into a JSON string first. On output it is an object you can read attributes from (you could even add methods to the class); in the history it is a string. Real output of `practice/l11_structured_solution.py` (shortened):"
    },
    {
      "t": "code",
      "file": {
        "zh": "输出（实测）",
        "en": "output (real run, translated)"
      },
      "lang": "text",
      "code": {
        "zh": "完整对象 / the whole object: 名字='袁隆平' 性别='男' 事迹='中国杂交水稻育种专家，被誉为“杂交水稻之父”，毕生致力于杂交水稻研究，……' 年龄=91\n类型 / type: Data\n名字 / name: 袁隆平\n年龄 / age: 91 （明年 / next year: 92 ）\n\n完整的对话记录 / the full conversation record:\n   {'content': '介绍一位值得记住的人', 'role': 'user'}\n   {'id': '__fake_id__', 'summary': [{'text': '我们需要回答用户……', 'type': 'summary_text'}], 'type': 'reasoning'}\n   {'id': '__fake_id__', 'content': [{'annotations': [], 'text': '{\"名字\":\"袁隆平\",\"性别\":\"男\",\"事迹\":\"……\",\"年龄\":91}', 'type': 'output_text', ...}], 'role': 'assistant', ...}",
        "en": "the whole object: name='Yuan Longping' gender='male' deeds='Chinese hybrid-rice breeder known as \"the father of hybrid rice\", who devoted his life to hybrid rice research, ...' age=91\ntype: Data\nname: Yuan Longping\nage: 91 (next year: 92)\n\nthe full conversation record:\n   {'content': 'Introduce a person worth remembering', 'role': 'user'}\n   {'id': '__fake_id__', 'summary': [{'text': 'We need to answer the user...', 'type': 'summary_text'}], 'type': 'reasoning'}\n   {'id': '__fake_id__', 'content': [{'annotations': [], 'text': '{\"name\":\"Yuan Longping\",\"gender\":\"male\",\"deeds\":\"...\",\"age\":91}', 'type': 'output_text', ...}], 'role': 'assistant', ...}"
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "设置了 `output_type=Data` 之后，`result.final_output` 是什么？",
        "en": "With `output_type=Data`, what is `result.final_output`?"
      },
      "options": [
        {
          "zh": "一段 JSON 字符串，要自己 `json.loads`",
          "en": "A JSON string you must `json.loads` yourself"
        },
        {
          "zh": "一个字典",
          "en": "A dict"
        },
        {
          "zh": "一个 `Data` 对象，可以写 `obj.名字`",
          "en": "A `Data` object: you can write `obj.name`"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "SDK 已经把模型的回答检查并转换成了 `Data` 对象。只有在对话历史（`to_input_list()`）里，它才是 JSON 字符串。",
        "en": "The SDK has already checked the reply and turned it into a `Data` object. Only in the history (`to_input_list()`) is it a JSON string."
      }
    },
    {
      "t": "h",
      "zh": "二、给 Agent 用工具",
      "en": "2. Giving the agent tools"
    },
    {
      "t": "p",
      "zh": "[▶ 06:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=410) 使用工具是 Agent 很重要的基础能力。步骤和第 05 节一样：先写好工具，再描述它，最后交给大模型。老师把第 05 集的查天气函数直接拿过来。\n\n[▶ 07:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=441) 函数名、参数和返回值都有了，还差**说明**。这次不再手写 JSON Schema，而是把说明写进函数的 docstring（文档字符串，Python 能读出来）；再加上装饰器 `@function_tool`，把函数转成 Agent 认识的工具；最后放进 Agent 的 `tools` 参数。`tools` 是列表，一个 Agent 可以有很多工具。（装饰器、类型注解和 docstring 怎样变成工具说明，见第 08 节。）",
      "en": "[▶ 06:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=410) Using tools is one of an agent's most important basic abilities. The steps are the ones from lesson 05: write the tool, describe it, hand it to the model. The instructor simply takes episode 05's weather function.\n\n[▶ 07:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=441) The function name, parameters and return value are there; what's missing is the **description**. Instead of a hand-written JSON Schema, it now goes into the function's docstring (which Python can read); the decorator `@function_tool` turns the function into a tool the agent understands; and the tool goes into the agent's `tools` argument. `tools` is a list – an agent can have many tools. (How decorators, type hints and docstrings become the tool schema: lesson 08.)"
    },
    {
      "t": "code",
      "file": "tool_latlon.py",
      "code": {
        "zh": "from agents import Agent, OpenAIChatCompletionsModel, Runner, function_tool, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nmodel = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)\n\n@function_tool                       # 把普通函数变成 Agent 认识的工具\ndef get_weather(latitude: float, longitude: float) -> str:\n    \"\"\"查询指定经纬度当前的气温。\n\n    Args:\n        latitude: 纬度\n        longitude: 经度\n    \"\"\"\n    return \"31.1℃\"                   # 为了快，先不联网，直接返回固定值\n\nagent = Agent(\n    name=\"天气助手\",\n    instructions=\"你是一个天气助手。需要天气信息时调用工具，回答简洁。\",\n    model=model,\n    tools=[get_weather],             # 列表：一个 Agent 可以有很多工具\n)\nresult = Runner.run_sync(agent, \"今天北京天气如何？\")\nprint(result.final_output)",
        "en": "from agents import Agent, OpenAIChatCompletionsModel, Runner, function_tool, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nmodel = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)\n\n@function_tool                       # turn a plain function into a tool the agent understands\ndef get_weather(latitude: float, longitude: float) -> str:\n    \"\"\"Get the current temperature at a latitude/longitude.\n\n    Args:\n        latitude: The latitude\n        longitude: The longitude\n    \"\"\"\n    return \"31.1℃\"                   # to keep it quick: no network, just a fixed value\n\nagent = Agent(\n    name=\"weather assistant\",\n    instructions=\"You are a weather assistant. Call the tool when you need weather data. Keep answers short.\",\n    model=model,\n    tools=[get_weather],             # a list: one agent can have many tools\n)\nresult = Runner.run_sync(agent, \"What's the weather like in Beijing today?\")\nprint(result.final_output)"
      }
    },
    {
      "t": "p",
      "zh": "[▶ 08:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=502) 对比第 05 节，代码短了很多：工具本身的代码还在，但描述工具的 JSON 和调用工具的代码都省掉了。[▶ 08:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=533) 为了快，老师没有联网，函数直接返回固定的 31.1℃。可是问「今天北京天气如何」，模型却说不知道北京的经纬度；[▶ 09:26](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=566) 换成巴黎也一样。他解释这是模型的问题：他用的谷歌模型缺少这些知识。于是把参数改成**城市名**：",
      "en": "[▶ 08:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=502) Compared with lesson 05 the code is much shorter: the tool's own code remains, but the JSON describing it and the code calling it are gone. [▶ 08:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=533) To keep it quick the instructor skips the network and returns a fixed 31.1℃. But when asked about the weather in Beijing today, the model says it doesn't know Beijing's coordinates; [▶ 09:26](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=566) Paris fails the same way. He explains that this is down to the model: the Google model he uses lacks that knowledge. So he changes the parameter to the **city name**:"
    },
    {
      "t": "code",
      "file": "tool_city.py",
      "code": {
        "zh": "# 接着上面的代码（导入和 model 不变），只改工具的参数\n@function_tool\ndef get_weather(city_name: str) -> str:\n    \"\"\"查询指定城市当前的气温。\n\n    Args:\n        city_name: 城市名，例如 北京、巴黎\n    \"\"\"\n    print(f\"[工具被调用] get_weather({city_name!r})\")\n    return \"31.1℃\"\n\nagent = Agent(\n    name=\"天气助手\",\n    instructions=\"你是一个天气助手。需要天气信息时调用工具，回答简洁。\",\n    model=model,\n    tools=[get_weather],\n)\nresult = Runner.run_sync(agent, \"今天北京天气如何？\")\nprint(result.final_output)                       # 例如：北京今天 31.1℃。\nprint([item.type for item in result.new_items])  # Runner 自动完成的步骤",
        "en": "# continues the code above (same imports and model); only the tool's parameter changes\n@function_tool\ndef get_weather(city_name: str) -> str:\n    \"\"\"Get the current temperature of a city.\n\n    Args:\n        city_name: The city name, e.g. Beijing or Paris\n    \"\"\"\n    print(f\"[tool called] get_weather({city_name!r})\")\n    return \"31.1℃\"\n\nagent = Agent(\n    name=\"weather assistant\",\n    instructions=\"You are a weather assistant. Call the tool when you need weather data. Keep answers short.\",\n    model=model,\n    tools=[get_weather],\n)\nresult = Runner.run_sync(agent, \"What's the weather like in Beijing today?\")\nprint(result.final_output)                       # e.g. It's 31.1℃ in Beijing today.\nprint([item.type for item in result.new_items])  # the steps the Runner did for you"
      }
    },
    {
      "t": "video",
      "zh": "[▶ 09:56](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=596) 老师的补充：模型本身没有的知识，可以再给它一个工具（比如按城市名查经纬度），或者给它长期记忆、知识库去查。DeepSeek 一般知道大城市的经纬度，经纬度版本多半也能跑通；但参数设计成用户和模型都熟悉的东西（城市名），工具更好用。练习文件 `l11_tools_solution.py` 里两个版本都有。",
      "en": "[▶ 09:56](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=596) The instructor adds: knowledge the model lacks can come from another tool (say, city name → coordinates), or from long-term memory or a knowledge base. DeepSeek usually knows the coordinates of big cities, so the latitude/longitude version will probably work too; still, parameters the user and the model both know well (a city name) make a better tool. `l11_tools_solution.py` contains both versions."
    },
    {
      "t": "p",
      "zh": "[▶ 10:28](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=628) 老师重点对比了两种写法的工作量：\n\n| 步骤 | 第 05、06 节手写 | Agents SDK |\n|---|---|---|\n| 描述工具 | 手写 JSON Schema | docstring + 类型注解，`@function_tool` 自动生成 |\n| 判断要不要调用 | 自己看 `message.tool_calls` | Runner 自动 |\n| 执行函数 | 自己 `json.loads` 参数再调用 | Runner 自动 |\n| 把结果发回模型 | 自己 append tool 消息再请求一次 | Runner 自动 |\n\n[▶ 10:59](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=659) 所以运行时你看不到「模型要调用某某工具」这一步，拿到的直接是用上了工具结果的最终回答。这正体现了 Agent 框架的特点：在大模型外面又包了一层。想看看中间发生了什么，就打印 `result.new_items` 里每一步的类型（第 08 节讲过）。",
      "en": "[▶ 10:28](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=628) The instructor compares how much work each approach takes:\n\n| Step | By hand (lessons 05, 06) | Agents SDK |\n|---|---|---|\n| Describe the tool | Hand-written JSON Schema | Docstring + type hints; `@function_tool` generates it |\n| Decide whether to call it | Check `message.tool_calls` yourself | The Runner |\n| Run the function | `json.loads` the arguments and call it yourself | The Runner |\n| Send the result back | Append a tool message and call the model again | The Runner |\n\n[▶ 10:59](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=659) So when it runs you never see “the model wants to call such-and-such tool” – you get the final answer that already uses the tool's result. That is what an agent framework adds: one more layer wrapped around the model. To see what happened in between, print the type of each step in `result.new_items` (covered in lesson 08)."
    },
    {
      "t": "note",
      "zh": "补充（视频没讲）：工具里出错了怎么办？在工具函数里用 `raise ValueError(\"原因\")` **主动抛出异常**：函数立刻停下，后面的代码不再执行（第 07 节的 `try/except` 是「接住」异常，`raise` 是「扔出」异常）。SDK 默认不会让程序崩溃，而是把类似 `An error occurred while running the tool. Please try again. Error: 暂时查不到……` 的文字当作工具结果交给模型，模型通常会向用户解释原因。另外，工具的返回值一般会变成字符串交给模型：返回一个普通字典时 SDK 用 `str()` 转换（得到的是 Python 的写法，不是标准 JSON），想要标准 JSON 就自己 `json.dumps(...)`。",
      "en": "Extra (not in the video): what if a tool fails? Inside the tool, `raise ValueError(\"reason\")` **throws an exception yourself**: the function stops at once and the code after it never runs (lesson 07's `try/except` *catches* exceptions; `raise` *throws* one). By default the SDK doesn't crash; it hands the model text like `An error occurred while running the tool. Please try again. Error: No data for ...` as the tool result, and the model usually explains the problem to the user. Also, a tool's return value normally reaches the model as a string: an ordinary dict is converted with `str()` (Python's notation, not standard JSON), so call `json.dumps(...)` yourself if you want proper JSON."
    },
    {
      "t": "code",
      "file": "tool_error.py",
      "code": {
        "zh": "# 导入和上面一样\nWEATHER = {\"北京\": \"31.1℃\", \"巴黎\": \"18.5℃\"}\n\n@function_tool\ndef get_weather(city_name: str) -> str:\n    \"\"\"查询指定城市当前的气温。\n\n    Args:\n        city_name: 城市名，目前只有 北京、巴黎\n    \"\"\"\n    if city_name not in WEATHER:\n        raise ValueError(f\"暂时查不到{city_name}，目前只有：{'、'.join(WEATHER)}\")   # 主动抛出异常\n    return WEATHER[city_name]",
        "en": "# same imports as above\nWEATHER = {\"Beijing\": \"31.1℃\", \"Paris\": \"18.5℃\"}\n\n@function_tool\ndef get_weather(city_name: str) -> str:\n    \"\"\"Get the current temperature of a city.\n\n    Args:\n        city_name: The city name; only Beijing and Paris for now\n    \"\"\"\n    if city_name not in WEATHER:\n        raise ValueError(f\"No data for {city_name}; available: {', '.join(WEATHER)}\")   # throw an exception yourself\n    return WEATHER[city_name]"
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "用 `@function_tool` + `tools=[get_weather]` 之后，下面哪件事**还需要你自己做**？",
        "en": "With `@function_tool` + `tools=[get_weather]`, which of these do you **still** do yourself?"
      },
      "options": [
        {
          "zh": "手写工具的 JSON Schema",
          "en": "Write the tool's JSON Schema by hand"
        },
        {
          "zh": "写好工具函数本身和它的 docstring",
          "en": "Write the tool function itself and its docstring"
        },
        {
          "zh": "把工具结果 append 成 tool 消息再请求模型",
          "en": "Append the tool result as a tool message and call the model again"
        },
        {
          "zh": "解析模型给的参数 JSON",
          "en": "Parse the argument JSON the model returns"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "工具的代码和说明（docstring）还是要你写；生成 JSON Schema、执行工具、把结果发回模型，都由 SDK 和 Runner 自动完成。",
        "en": "You still write the tool's code and its description (the docstring); generating the schema, running the tool and sending the result back are done by the SDK and the Runner."
      }
    },
    {
      "t": "h",
      "zh": "三、MCP：把工具放进独立的服务器",
      "en": "3. MCP: tools in a separate server"
    },
    {
      "t": "p",
      "zh": "[▶ 11:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=691) **MCP**（Model Context Protocol，模型上下文协议）是一套通信协议。到现在为止，工具都写在你自己的程序里；有了 MCP，工具可以放在一个独立的 **MCP 服务器**里，Agent 通过协议连上去使用，自己就不用再定义这些函数了。一个服务器里可以有很多工具，同一个服务器也可以给不同的程序、不同的框架使用——有点像 USB 接口：设备和电脑都按同一个标准做，就能插到一起。\n\n[▶ 12:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=727) 老师的步骤：先安装 `mcp` 组件（课程的 `.venv` 已经装好），再实现一个 MCP 服务器。[▶ 12:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=757) 他展示了提前写好的服务器，里面有一个**查询目录**的工具。",
      "en": "[▶ 11:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=691) **MCP** (Model Context Protocol) is a communication protocol. So far every tool has lived in your own program; with MCP, tools can live in a separate **MCP server**, and the agent connects to it through the protocol, so you no longer define those functions yourself. One server can hold many tools, and the same server can serve different programs and frameworks – a bit like USB: devices and computers follow one standard, so they plug together.\n\n[▶ 12:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=727) The instructor's steps: install the `mcp` package (already in the course `.venv`), then implement an MCP server. [▶ 12:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=757) He shows a server written in advance that contains a **look-inside-a-folder** tool."
    },
    {
      "t": "py",
      "title": {
        "zh": "什么是子进程、什么是服务器",
        "en": "Subprocesses and servers"
      },
      "zh": "- **进程**：一个正在运行的程序。你运行 `python xxx.py`，就启动了一个进程。\n- **子进程**：由另一个程序启动的进程。Python 的 `subprocess` 模块可以启动别的程序，并读写它的**标准输入**（stdin，平时是键盘输入）和**标准输出**（stdout，平时是打印到屏幕上的内容）。\n- **服务器**：一直运行、等别人发来请求、再把结果送回去的程序。\n\nMCP 最常用的 stdio 方式就是把三者组合起来：你的 Agent 程序把 MCP 服务器作为**子进程**启动，往它的标准输入写请求（「列出工具」「调用 list_files」），再从它的标准输出读结果。所以 stdio 服务器里**不能随便 print**：打印的内容会混进通信通道。\n\n下面这段在本地运行能看到子进程的效果（浏览器里不能启动子进程，所以没有运行按钮）：",
      "en": "- **Process**: a running program. `python xxx.py` starts one.\n- **Subprocess**: a process started by another program. Python's `subprocess` module can launch another program and read/write its **standard input** (stdin, normally the keyboard) and **standard output** (stdout, normally what is printed on screen).\n- **Server**: a program that keeps running, waits for requests and sends results back.\n\nMCP's most common transport, stdio, combines all three: your agent program starts the MCP server as a **subprocess**, writes requests (“list tools”, “call list_files”) to its stdin and reads the results from its stdout. That is why a stdio server **must not print freely**: printed text would get mixed into the channel.\n\nRun this locally to see a subprocess at work (browsers can't start processes, so there is no Run button):",
      "run": false,
      "code": {
        "zh": "import subprocess\nimport sys\n\n# 用当前这个 Python（sys.executable）启动一个子进程，让它运行一行代码\nchild = subprocess.run(\n    [sys.executable, \"-c\", \"name = input(); print('child got: ' + name)\"],\n    input=\"Xiaoming\\n\",       # 写进子进程的标准输入\n    capture_output=True,      # 收集子进程的标准输出\n    text=True,\n)\nprint(child.stdout)           # child got: Xiaoming",
        "en": "import subprocess\nimport sys\n\n# Start a subprocess with this same Python (sys.executable) and run one line of code\nchild = subprocess.run(\n    [sys.executable, \"-c\", \"name = input(); print('child got: ' + name)\"],\n    input=\"Xiaoming\\n\",       # written to the child's stdin\n    capture_output=True,      # collect the child's stdout\n    text=True,\n)\nprint(child.stdout)           # child got: Xiaoming"
      }
    },
    {
      "t": "p",
      "zh": "视频没有现场写服务器的代码，讲义照它的思路写了一个：`mcp` 包里的 `FastMCP` 让写服务器和写 `@function_tool` 差不多——创建服务器对象，用 `@mcp.tool()` 装饰函数，最后 `mcp.run()`。docstring 和类型注解同样会变成工具说明。下面就是练习文件 `practice/l11_mcp_server.py` 的主要内容，提供一个 `list_files` 工具：",
      "en": "The video doesn't write the server on screen, so these notes write one along the same lines. `FastMCP` from the `mcp` package makes a server feel much like `@function_tool`: create a server object, decorate functions with `@mcp.tool()`, and finish with `mcp.run()`. Docstrings and type hints become the tool descriptions here too. Here is the core of the practice file `practice/l11_mcp_server.py`, which offers one tool, `list_files`:"
    },
    {
      "t": "code",
      "file": "l11_mcp_server.py",
      "code": {
        "zh": "from pathlib import Path\nfrom mcp.server.fastmcp import FastMCP\n\nmcp = FastMCP(\"file-tools\", log_level=\"WARNING\")   # 服务器名字；只显示警告以上的日志\n\n@mcp.tool()                      # 注意要带括号\ndef list_files(directory: str = \".\") -> str:\n    \"\"\"列出一个文件夹里的文件和子文件夹，并给出数量。directory 是文件夹路径，默认 \".\" 表示当前目录。\"\"\"\n    folder = Path(directory)\n    if not folder.is_dir():\n        return f\"找不到文件夹：{directory}\"\n    files = sorted([p.name for p in folder.iterdir() if p.is_file()])\n    folders = sorted([p.name for p in folder.iterdir() if p.is_dir()])\n    return (f\"文件夹 {folder.resolve()}：{len(files)} 个文件，{len(folders)} 个子文件夹。\\n\"\n            \"子文件夹：\" + \"、\".join(folders) + \"\\n\"\n            \"文件（最多列出 40 个）：\" + \"、\".join(files[:40]))\n\nif __name__ == \"__main__\":\n    mcp.run()                    # 默认 transport=\"stdio\"",
        "en": "from pathlib import Path\nfrom mcp.server.fastmcp import FastMCP\n\nmcp = FastMCP(\"file-tools\", log_level=\"WARNING\")   # server name; log warnings only\n\n@mcp.tool()                      # mind the parentheses\ndef list_files(directory: str = \".\") -> str:\n    \"\"\"List the files and sub-folders in a folder, with counts. directory is the folder path; \".\" (the default) is the current folder.\"\"\"\n    folder = Path(directory)\n    if not folder.is_dir():\n        return f\"Folder not found: {directory}\"\n    files = sorted([p.name for p in folder.iterdir() if p.is_file()])\n    folders = sorted([p.name for p in folder.iterdir() if p.is_dir()])\n    return (f\"Folder {folder.resolve()}: {len(files)} files, {len(folders)} sub-folders.\\n\"\n            \"Sub-folders: \" + \", \".join(folders) + \"\\n\"\n            \"Files (at most 40 listed): \" + \", \".join(files[:40]))\n\nif __name__ == \"__main__\":\n    mcp.run()                    # default transport=\"stdio\""
      },
      "note": {
        "zh": "这个文件**不用你自己运行**。直接运行它会一直「卡住」：它在等客户端从标准输入发来请求，这是正常的（按 Ctrl+C 退出）。下一部分由 Agent 程序把它作为子进程自动启动。`[p.name for p in ...]` 是第 06 节的列表推导式。",
        "en": "You **don't run this file yourself**. Run directly, it seems to hang: it is waiting for a client to send requests on stdin, which is normal (Ctrl+C quits). In the next part the agent program starts it as a subprocess automatically. `[p.name for p in ...]` is a list comprehension from lesson 06."
      }
    },
    {
      "t": "warn",
      "zh": "- `@mcp.tool()` 一定要带括号。写成 `@mcp.tool` 会报错（mcp 1.30 实测）：`TypeError: The @tool decorator was used incorrectly. Did you forget to call it? Use @tool() instead of @tool`。这一点和 `@function_tool` 不同。\n- stdio 服务器里不要 `print()` 到标准输出，要打日志就写到标准错误：`print(..., file=sys.stderr)`。",
      "en": "- `@mcp.tool()` needs the parentheses. `@mcp.tool` fails (tested with mcp 1.30): `TypeError: The @tool decorator was used incorrectly. Did you forget to call it? Use @tool() instead of @tool`. Unlike `@function_tool`.\n- Never `print()` to stdout in a stdio server; send logs to stderr: `print(..., file=sys.stderr)`."
    },
    {
      "t": "h",
      "zh": "四、在 Agent 里使用 MCP 服务器",
      "en": "4. Using the MCP server from an agent"
    },
    {
      "t": "p",
      "zh": "[▶ 13:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=790) 老师新建了一个使用 MCP 的例子，先列出三个步骤：\n1. 启动 MCP 服务器\n2. 从服务器获取它支持的工具\n3. 把工具交给 Agent\n\n也就是说，Agent 手里的工具不用你自己定义，直接向 MCP 服务器要来，老师认为这正是 MCP 吸引人的地方。[▶ 14:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=854) 他提醒：MCP 也要用**异步**写法，所以这段代码要放进 `async def main()` 这个协程，再用 `asyncio.run(main())` 启动（第 09 节）。讲义前两部分用的是同步的 `run_sync`，到这里就要换成异步写法了。启动服务器用的是 `agents.mcp` 里的 `MCPServerStdio`（标准输入输出方式的服务器），[▶ 14:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=886) 写在 `async with ... as mcp_server:` 里。",
      "en": "[▶ 13:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=790) The instructor creates a new MCP example and first lists three steps:\n1. Start the MCP server\n2. Get the tools the server supports\n3. Give the tools to the agent\n\nIn other words, you don't define the agent's tools yourself; it asks the MCP server for them, which the instructor sees as the whole attraction of MCP. [▶ 14:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=854) He notes that MCP needs the **async** style too, so this code goes inside the coroutine `async def main()`, started with `asyncio.run(main())` (lesson 09). The first two parts of these notes used the synchronous `run_sync`; from here on you need the async style. The server is started with `MCPServerStdio` from `agents.mcp` (a server spoken to over standard input/output), [▶ 14:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=886) written as `async with ... as mcp_server:`."
    },
    {
      "t": "py",
      "title": {
        "zh": "async with：自动「打开 → 使用 → 关闭」",
        "en": "async with: open → use → close, automatically"
      },
      "zh": "第 10 节用过 `with open(...) as f:`：进入 `with` 时打开文件，离开时**自动关闭**，即使中间出错也会关。\n\n`async with` 是它的异步版本：进入和离开时要做的事需要**等待**（启动子进程、和服务器握手、关闭连接），所以用异步方式执行。它只能写在 `async def` 函数里。\n\n`async with MCPServerStdio(...) as mcp_server:` 的意思是：\n1. 进入时：启动服务器子进程，完成 MCP 握手，把连接交给 `mcp_server`\n2. 缩进里面：把 `mcp_server` 交给 Agent、运行 Agent\n3. 离开时：关闭连接、结束子进程，不用你自己写\n\n下面用普通的 `with` 演示「进入和离开时自动做事」，可以在网页里运行。`with` 会在进入时自动调用对象的 `__enter__` 方法、离开时调用 `__exit__` 方法（这种类不需要你会写，看懂调用顺序即可）。`async with` 的规则完全一样，只是进出时调用的是异步的 `__aenter__` / `__aexit__`。",
      "en": "Lesson 10 used `with open(...) as f:`: entering `with` opens the file and leaving it **closes the file automatically**, even after an error.\n\n`async with` is the asynchronous version: the work done on entry and exit has to be **awaited** (starting a subprocess, the server handshake, closing the connection). It can only appear inside an `async def` function.\n\n`async with MCPServerStdio(...) as mcp_server:` means:\n1. On entry: start the server subprocess, do the MCP handshake, hand the connection to `mcp_server`\n2. In the indented block: give `mcp_server` to an agent and run it\n3. On exit: close the connection and end the subprocess – no code needed from you\n\nThe demo below uses a plain `with` to show things happening automatically on entry and exit; it runs in the browser. `with` calls the object's `__enter__` method on entry and its `__exit__` method on exit (you don't need to write classes like this, just follow the order of the calls). `async with` follows exactly the same rules, except entry and exit call the async `__aenter__` / `__aexit__`.",
      "code": {
        "zh": "class FakeServer:\n    def __enter__(self):\n        print(\"进入：启动服务器、建立连接\")\n        return self                    # as 后面的变量拿到的就是它\n\n    def __exit__(self, exc_type, exc, tb):\n        print(\"离开：关闭连接、结束服务器\")\n\n    def call(self, name):\n        return f\"调用了 {name}\"\n\nwith FakeServer() as server:\n    print(server.call(\"list_files\"))\n\nprint(\"------ 出错时也会自动关闭 ------\")\ntry:\n    with FakeServer() as server:\n        raise RuntimeError(\"工具调用失败\")\nexcept RuntimeError as e:\n    print(\"捕获到：\", e)",
        "en": "class FakeServer:\n    def __enter__(self):\n        print(\"enter: start the server, connect\")\n        return self                    # this is what the name after `as` receives\n\n    def __exit__(self, exc_type, exc, tb):\n        print(\"exit: close the connection, stop the server\")\n\n    def call(self, name):\n        return f\"called {name}\"\n\nwith FakeServer() as server:\n    print(server.call(\"list_files\"))\n\nprint(\"------ it also closes after an error ------\")\ntry:\n    with FakeServer() as server:\n        raise RuntimeError(\"tool call failed\")\nexcept RuntimeError as e:\n    print(\"caught:\", e)"
      }
    },
    {
      "t": "code",
      "file": "l11_mcp_solution.py",
      "code": {
        "zh": "import asyncio\nimport sys\nfrom pathlib import Path\n\nfrom agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom agents.mcp import MCPServerStdio\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nSERVER_FILE = Path(__file__).with_name(\"l11_mcp_server.py\")   # 和本文件在同一个文件夹\n\nasync def main():\n    # 第 1 步：启动 MCP 服务器（子进程）\n    async with MCPServerStdio(\n        name=\"文件工具服务器\",\n        params={\"command\": sys.executable, \"args\": [str(SERVER_FILE)]},\n        client_session_timeout_seconds=30,\n    ) as mcp_server:\n        # 第 2 步（可选，看一眼）：服务器提供了哪些工具\n        for tool in await mcp_server.list_tools():\n            print(\"工具：\", tool.name, \"-\", tool.description)\n\n        # 第 3 步：把服务器交给 Agent，SDK 自动取工具、调工具\n        agent = Agent(\n            name=\"文件助手\",\n            instructions=\"你是一个文件助手。需要了解文件夹内容时，使用工具。回答简洁。\",\n            model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),\n            mcp_servers=[mcp_server],\n        )\n        result = await Runner.run(agent, \"当前目录有几个文件？\")\n        print(result.final_output)\n\nasyncio.run(main())",
        "en": "import asyncio\nimport sys\nfrom pathlib import Path\n\nfrom agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom agents.mcp import MCPServerStdio\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nSERVER_FILE = Path(__file__).with_name(\"l11_mcp_server.py\")   # in the same folder as this file\n\nasync def main():\n    # Step 1: start the MCP server (a subprocess)\n    async with MCPServerStdio(\n        name=\"file-tools server\",\n        params={\"command\": sys.executable, \"args\": [str(SERVER_FILE)]},\n        client_session_timeout_seconds=30,\n    ) as mcp_server:\n        # Step 2 (optional, just to look): which tools does the server offer?\n        for tool in await mcp_server.list_tools():\n            print(\"tool:\", tool.name, \"-\", tool.description)\n\n        # Step 3: give the server to the agent; the SDK fetches and calls the tools\n        agent = Agent(\n            name=\"file assistant\",\n            instructions=\"You are a file assistant. Use the tools to look inside folders. Keep answers short.\",\n            model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),\n            mcp_servers=[mcp_server],\n        )\n        result = await Runner.run(agent, \"How many files are in the current folder?\")\n        print(result.final_output)\n\nasyncio.run(main())"
      }
    },
    {
      "t": "p",
      "zh": "[▶ 15:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=920) 启动服务器要告诉它两样：一个名字（`name`，随便起，方便区分），以及启动参数 `params`。[▶ 15:51](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=951) 参数就两项：`command` 是命令，`args` 是命令的参数列表——相当于在终端里敲 `python l11_mcp_server.py`。\n\n[▶ 16:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=983) 第 2 步本来要调用服务器的方法去取工具，但 `MCPServerStdio` 是 Agents SDK 自己封装的（不是直接用 `mcp` 包），所以第 2、3 步可以合成一步：[▶ 17:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=1051) 创建 Agent 时把服务器放进 `mcp_servers` 参数（复数，列表，可以放好几个服务器），Agent 会自己去读取服务器的工具，需要时调用。上面代码里的 `list_tools()` 只是让你看一眼，不写也可以。\n\n讲义和视频写法的两处不同：\n- `\"command\"`：视频写的是 `\"python\"`。讲义用 `sys.executable`，表示**正在运行本程序的那个 Python**（`.venv` 里装了 `mcp` 的那个）；写 `\"python\"` 在 Windows 上可能找到另一个没装 `mcp` 的 Python，服务器就起不来。`args` 用 `Path(__file__).with_name(...)` 找到同一个文件夹里的服务器脚本（`Path` 见第 10 节）。\n- `client_session_timeout_seconds=30`：默认只等 5 秒，Python 服务器第一次启动可能更慢，放宽一些更稳。",
      "en": "[▶ 15:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=920) Starting the server takes two things: a name (`name`, anything that helps you tell servers apart) and the start parameters `params`. [▶ 15:51](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=951) There are just two parameters: `command` is the command and `args` its argument list – like typing `python l11_mcp_server.py` in a terminal.\n\n[▶ 16:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=983) Step 2 would normally call the server's methods to fetch the tools, but `MCPServerStdio` is the Agents SDK's own wrapper (not the bare `mcp` package), so steps 2 and 3 merge: [▶ 17:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=1051) when creating the agent, put the server in the `mcp_servers` argument (plural – a list, so several servers fit), and the agent reads the server's tools itself and calls them when needed. The `list_tools()` loop above is only there so you can look; you can leave it out.\n\nTwo differences from the video's code:\n- `\"command\"`: the video writes `\"python\"`. These notes use `sys.executable`, **the Python running this program** (the `.venv` one with `mcp` installed); on Windows `\"python\"` may find another Python without `mcp`, and the server won't start. `args` uses `Path(__file__).with_name(...)` to find the server script in the same folder (`Path`: lesson 10).\n- `client_session_timeout_seconds=30`: the default wait is only 5 seconds, and a Python server can be slower on its first start, so a longer wait is safer."
    },
    {
      "t": "p",
      "zh": "[▶ 18:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=1084) 老师的问题是「当前目录有几个文件」，[▶ 18:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=1115) 得到 18 个（他数了一下，十几个文件加一个缓存目录，差不多对得上）。从运行日志能看出顺序：先列出服务器的所有工具，再调用工具——和他前面讲的步骤一样。下面是在 `practice` 文件夹里运行 `practice/l11_mcp_solution.py` 的实测输出（文件数会随着课程更新变化）：",
      "en": "[▶ 18:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=1084) The instructor asks how many files are in the current folder [▶ 18:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=1115) and gets 18 (he counts: a dozen-odd files plus a cache folder, which roughly fits). The run log shows the order: first all the server's tools are listed, then a tool is called – just the steps he described. Here is the real output of `practice/l11_mcp_solution.py` run from the `practice` folder (the file count changes as the course grows):"
    },
    {
      "t": "code",
      "file": {
        "zh": "输出（实测）",
        "en": "output (real run, translated)"
      },
      "lang": "text",
      "code": {
        "zh": "工具 / tool: list_files - 列出一个文件夹里的文件和子文件夹，并给出数量。directory 是文件夹路径，默认 \".\" 表示当前目录。\nAI: 当前目录（`practice`）共有 **196 个文件**，还有 3 个子文件夹：`__pycache__`、`data`、`output`。\n步骤 / steps: ['message_output_item', 'tool_call_item', 'tool_call_output_item', 'reasoning_item', 'message_output_item']",
        "en": "tool: list_files - List the files and sub-folders in a folder, with counts. directory is the folder path; \".\" (the default) is the current folder.\nAI: The current folder (`practice`) has **196 files** and 3 sub-folders: `__pycache__`, `data`, `output`.\nsteps: ['message_output_item', 'tool_call_item', 'tool_call_output_item', 'reasoning_item', 'message_output_item']"
      }
    },
    {
      "t": "video",
      "zh": "[▶ 19:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=1147) 老师的总结：SDK 把 MCP 服务器又封装了一层，查询工具、调用工具这些细节都藏起来了，直接把服务器交给 Agent 就行。理解原理就好；想深入的话可以再学 MCP 协议本身，第 20 节会在 AgentScope 里再用一次 MCP。",
      "en": "[▶ 19:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=1147) The instructor's summary: the SDK wraps the MCP server once more and hides the details of listing and calling tools, so you just hand the server to the agent. Understanding the principle is enough; to go deeper, study the MCP protocol itself – lesson 20 uses MCP again with AgentScope."
    },
    {
      "t": "note",
      "zh": "补充（视频没讲）：别人写好的服务器也是这样用，只是 `params` 不同。例如官方的文件系统服务器用 Node.js 启动：`params={\"command\": \"npx\", \"args\": [\"-y\", \"@modelcontextprotocol/server-filesystem\", \"某个文件夹\"]}`（需要装 Node.js）。在线的 MCP 服务用网址连接：`MCPServerStreamableHttp(name=..., params={\"url\": \"https://...\"})`，用法同样是 `async with` + `mcp_servers`。",
      "en": "Extra (not in the video): ready-made servers from others work the same way; only `params` changes. The official filesystem server, for example, starts with Node.js: `params={\"command\": \"npx\", \"args\": [\"-y\", \"@modelcontextprotocol/server-filesystem\", \"some folder\"]}` (Node.js required). Online MCP services connect by URL: `MCPServerStreamableHttp(name=..., params={\"url\": \"https://...\"})`, again with `async with` + `mcp_servers`."
    },
    {
      "t": "check",
      "q": {
        "zh": "用 `MCPServerStdio` 时，MCP 服务器是怎么运行起来的？",
        "en": "With `MCPServerStdio`, how does the MCP server get started?"
      },
      "options": [
        {
          "zh": "要先在另一个终端里手动运行它",
          "en": "You start it by hand in another terminal first"
        },
        {
          "zh": "你的 Agent 程序按 `params` 把它作为子进程启动，离开 `async with` 时自动关闭",
          "en": "Your agent program starts it as a subprocess from `params` and stops it when leaving `async with`"
        },
        {
          "zh": "它运行在 OpenAI 的服务器上",
          "en": "It runs on OpenAI's servers"
        },
        {
          "zh": "它被编译进了 Agent 对象里",
          "en": "It is compiled into the Agent object"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "`params` 里的 `command` 和 `args` 就是启动它的命令；进入 `async with` 时启动，离开时关闭。",
        "en": "`command` and `args` in `params` are the start command; it starts on entering `async with` and stops on leaving."
      }
    },
    {
      "t": "h",
      "zh": "五、下一步：多 Agent 编排",
      "en": "5. Next: orchestrating several agents"
    },
    {
      "t": "p",
      "zh": "[▶ 20:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=1208) 这一集最后，老师预告了多 Agent 编排。他的看法是：不少框架在这方面做得一般；OpenAI 这个框架追求简单、概念不多，所以编排常常要靠 Python 语言本身的功能来完成，这也是他希望大家把 Python 语法学扎实的原因。下一节会具体演示，例如让几个 Agent 依次运行或同时运行。",
      "en": "[▶ 20:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=12&t=1208) At the end the instructor previews multi-agent orchestration. In his view many frameworks handle it only moderately well; OpenAI's framework aims for simplicity with few concepts, so orchestration often relies on features of the Python language itself – which is why he wants learners to be solid in Python. The next lesson shows it in practice, for example agents running one after another or at the same time."
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "视频里，怎样让 Agent 的结果变成 `Data` 对象？",
        "en": "In the video, how does the agent's result become a `Data` object?"
      },
      "options": [
        {
          "zh": "`print(Data(result.final_output))`",
          "en": "`print(Data(result.final_output))`"
        },
        {
          "zh": "在 instructions 里写「请输出 Data」",
          "en": "Write “please output Data” in the instructions"
        },
        {
          "zh": "`Runner.run_sync(agent, \"...\", output=Data)`",
          "en": "`Runner.run_sync(agent, \"...\", output=Data)`"
        },
        {
          "zh": "创建 Agent 时传 `output_type=Data`",
          "en": "Pass `output_type=Data` when creating the agent"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "`output_type` 是 Agent 的参数。SDK 把结构告诉模型，收到回答后检查并转换成 `Data` 对象。",
        "en": "`output_type` is an Agent argument. The SDK tells the model the structure, then checks the reply and turns it into a `Data` object."
      }
    },
    {
      "q": {
        "zh": "用 DeepSeek 时只写了 `output_type=Data`，请求返回 400。正确的处理是？",
        "en": "With DeepSeek and only `output_type=Data`, the request returns a 400. What is the right fix?"
      },
      "options": [
        {
          "zh": "加 `model_settings=ModelSettings(extra_body={\"response_format\": {\"type\": \"json_object\"}})`，并在 instructions 里写明字段",
          "en": "Add `model_settings=ModelSettings(extra_body={\"response_format\": {\"type\": \"json_object\"}})` and list the fields in the instructions"
        },
        {
          "zh": "把 temperature 调低",
          "en": "Lower the temperature"
        },
        {
          "zh": "把字段名改成英文",
          "en": "Rename the fields in English"
        },
        {
          "zh": "改用 `Runner.run` 异步运行",
          "en": "Switch to the async `Runner.run`"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "400 是因为 DeepSeek 不支持 SDK 发送的 `json_schema` 格式。用 `extra_body` 换成它支持的 `json_object`，模型看不到结构了，所以字段要写进 instructions。",
        "en": "The 400 comes from DeepSeek not supporting the `json_schema` format the SDK sends. `extra_body` swaps in `json_object`, which it supports; the model then can't see the structure, so the instructions list the fields."
      }
    },
    {
      "q": {
        "zh": "结构化输出的结果，在 `result.to_input_list()` 的对话历史里是什么样子？",
        "en": "How does a structured result appear in the history from `result.to_input_list()`?"
      },
      "options": [
        {
          "zh": "一个 `Data` 对象",
          "en": "A `Data` object"
        },
        {
          "zh": "历史里没有它",
          "en": "It isn't in the history"
        },
        {
          "zh": "一个 Python 字典",
          "en": "A Python dict"
        },
        {
          "zh": "assistant 消息里的一段 JSON 字符串",
          "en": "A JSON string inside the assistant message"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "历史要作为输入再发给模型，只能是文字，所以对象被转成了 JSON 字符串。只有 `final_output` 是对象。",
        "en": "The history is sent to the model again as input, so it must be text: the object becomes a JSON string. Only `final_output` is an object."
      }
    },
    {
      "q": {
        "zh": "视频里老师把查天气工具的参数从经纬度改成了城市名，原因是？",
        "en": "Why does the instructor change the weather tool's parameters from coordinates to a city name?"
      },
      "options": [
        {
          "zh": "`@function_tool` 不支持 float 参数",
          "en": "`@function_tool` doesn't support float parameters"
        },
        {
          "zh": "他用的模型不知道北京、巴黎的经纬度，没法填参数",
          "en": "His model didn't know the coordinates of Beijing or Paris, so it couldn't fill them in"
        },
        {
          "zh": "Open-Meteo 改了接口",
          "en": "Open-Meteo changed its API"
        },
        {
          "zh": "城市名的工具运行更快",
          "en": "A city-name tool runs faster"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "参数要由模型来填。模型缺少的知识（经纬度），要么换成它熟悉的参数，要么再给它一个查询工具或知识库。",
        "en": "The model fills in the parameters. Knowledge it lacks (coordinates) means either parameters it knows well, or another lookup tool or a knowledge base."
      }
    },
    {
      "q": {
        "zh": "Agent 怎样用上 MCP 服务器的工具？",
        "en": "How does an agent get an MCP server's tools?"
      },
      "options": [
        {
          "zh": "把每个工具重新用 `@function_tool` 写一遍",
          "en": "Rewrite each tool with `@function_tool`"
        },
        {
          "zh": "在 `async with` 里把服务器放进 `Agent(mcp_servers=[mcp_server])`，SDK 自动读取和调用工具",
          "en": "Inside `async with`, put the server in `Agent(mcp_servers=[mcp_server])`; the SDK lists and calls the tools"
        },
        {
          "zh": "`tools=[mcp_server]`",
          "en": "`tools=[mcp_server]`"
        },
        {
          "zh": "把服务器文件 import 进来",
          "en": "Import the server file"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "服务器通过 `mcp_servers` 交给 Agent（复数，可以放多个）。离开 `async with` 后连接就关了，所以运行 Agent 的代码要写在缩进里面。",
        "en": "The server reaches the agent through `mcp_servers` (plural – several fit). The connection closes when you leave `async with`, so run the agent inside the block."
      }
    },
    {
      "q": {
        "zh": "在 stdio 方式的 MCP 服务器里，用 `print()` 打印调试信息有什么问题？",
        "en": "What is wrong with `print()` debugging output in a stdio MCP server?"
      },
      "options": [
        {
          "zh": "没有问题",
          "en": "Nothing"
        },
        {
          "zh": "打印的内容会显示在模型的回答里",
          "en": "The printed text shows up in the model's answer"
        },
        {
          "zh": "标准输出是通信通道，乱打印会破坏协议消息",
          "en": "stdout is the communication channel; stray prints corrupt the protocol messages"
        },
        {
          "zh": "print 在服务器里不能用",
          "en": "print doesn't work in a server"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "客户端从服务器的标准输出读取协议消息。日志要写到标准错误：`print(..., file=sys.stderr)`。",
        "en": "The client reads protocol messages from the server's stdout. Write logs to stderr instead: `print(..., file=sys.stderr)`."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "结构化输出（DeepSeek 版）",
        "en": "Structured output (DeepSeek version)"
      },
      "code": {
        "zh": "from pydantic import [[BaseModel]]\n\nclass Data([[BaseModel]]):\n    名字: [[str]]\n    年龄: [[int]]\n\nagent = Agent(\n    name=\"助手\",\n    instructions=\"用 JSON 回答，字段：名字、年龄（整数）。\",\n    model=model,\n    [[output_type]]=Data,\n    model_settings=ModelSettings(extra_body={\"response_format\": {\"type\": \"[[json_object]]\"}}),\n)\nobj = Runner.run_sync(agent, \"介绍一位值得记住的人\").[[final_output]]\nprint(obj.[[名字]])",
        "en": "from pydantic import [[BaseModel]]\n\nclass Data([[BaseModel]]):\n    name: [[str]]\n    age: [[int]]\n\nagent = Agent(\n    name=\"assistant\",\n    instructions=\"Answer in JSON with the fields name and age (an integer).\",\n    model=model,\n    [[output_type]]=Data,\n    model_settings=ModelSettings(extra_body={\"response_format\": {\"type\": \"[[json_object]]\"}}),\n)\nobj = Runner.run_sync(agent, \"Introduce a person worth remembering\").[[final_output]]\nprint(obj.[[name]])"
      },
      "explain": {
        "zh": "类继承 `BaseModel`，字段写成 `名字: 类型`；`output_type` 规定结构，DeepSeek 再用 `json_object`；`final_output` 是对象，用点号读属性。",
        "en": "The class inherits `BaseModel` with `name: type` fields; `output_type` sets the structure, plus `json_object` for DeepSeek; `final_output` is an object read with a dot."
      }
    },
    {
      "title": {
        "zh": "最小的 FastMCP 服务器",
        "en": "A minimal FastMCP server"
      },
      "code": {
        "zh": "from pathlib import Path\nfrom mcp.server.fastmcp import [[FastMCP]]\n\nmcp = FastMCP(\"file-tools\")\n\n@mcp.[[tool]]()\ndef list_files(directory: str = \".\") -> str:\n    \"\"\"列出文件夹里的文件。\"\"\"\n    files = [p.name for p in Path(directory).iterdir() if p.[[is_file]]()]\n    return f\"{len(files)} 个文件：\" + \"、\".join(files)\n\nif __name__ == \"[[__main__]]\":\n    mcp.[[run]]()",
        "en": "from pathlib import Path\nfrom mcp.server.fastmcp import [[FastMCP]]\n\nmcp = FastMCP(\"file-tools\")\n\n@mcp.[[tool]]()\ndef list_files(directory: str = \".\") -> str:\n    \"\"\"List the files in a folder.\"\"\"\n    files = [p.name for p in Path(directory).iterdir() if p.[[is_file]]()]\n    return f\"{len(files)} files: \" + \", \".join(files)\n\nif __name__ == \"[[__main__]]\":\n    mcp.[[run]]()"
      },
      "explain": {
        "zh": "`@mcp.tool()` 带括号；`mcp.run()` 默认使用 stdio。",
        "en": "`@mcp.tool()` with parentheses; `mcp.run()` uses stdio by default."
      }
    },
    {
      "title": {
        "zh": "让 Agent 连接 MCP 服务器",
        "en": "Connect an agent to an MCP server"
      },
      "code": {
        "zh": "async def main():\n    [[async with]] MCPServerStdio(\n        name=\"文件工具服务器\",\n        params={\"[[command]]\": sys.executable, \"[[args]]\": [str(SERVER_FILE)]},\n    ) [[as]] mcp_server:\n        agent = Agent(name=\"文件助手\", instructions=\"需要时使用工具。\", model=model, [[mcp_servers]]=[mcp_server])\n        result = [[await]] Runner.run(agent, \"当前目录有几个文件？\")\n        print(result.final_output)\n\nasyncio.[[run]](main())",
        "en": "async def main():\n    [[async with]] MCPServerStdio(\n        name=\"file-tools server\",\n        params={\"[[command]]\": sys.executable, \"[[args]]\": [str(SERVER_FILE)]},\n    ) [[as]] mcp_server:\n        agent = Agent(name=\"file assistant\", instructions=\"Use tools when needed.\", model=model, [[mcp_servers]]=[mcp_server])\n        result = [[await]] Runner.run(agent, \"How many files are in the current folder?\")\n        print(result.final_output)\n\nasyncio.[[run]](main())"
      },
      "explain": {
        "zh": "`async with ... as mcp_server` 管理服务器的启动和关闭；`params` 是启动命令；服务器通过 `mcp_servers` 交给 Agent；MCP 要用异步写法。",
        "en": "`async with ... as mcp_server` starts and stops the server; `params` is the start command; the server reaches the agent via `mcp_servers`; MCP needs the async style."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：结构化输出（视频的例子）",
        "en": "Write it: structured output (the video's example)"
      },
      "task": {
        "zh": "1. 写 `class Data(BaseModel)`：名字、性别、事迹是 `str`，年龄是 `int`\n2. 创建 Agent：`instructions` 里写明「用 JSON 回答」和四个字段，传 `output_type=Data`，再加 DeepSeek 需要的 `model_settings=ModelSettings(extra_body={\"response_format\": {\"type\": \"json_object\"}})`\n3. `Runner.run_sync` 问「介绍一位值得记住的人」，把 `final_output` 存进 `obj`，用点号打印名字和年龄\n\n这段代码需要 Agents SDK，不能在网页里运行。写完点「检查关键点」，本地对照 `practice/l11_structured_solution.py`。",
        "en": "1. Write `class Data(BaseModel)`: name, gender and deeds are `str`, age is `int`\n2. Create the agent: the `instructions` say “answer in JSON” and list the four fields; pass `output_type=Data` plus the `model_settings=ModelSettings(extra_body={\"response_format\": {\"type\": \"json_object\"}})` DeepSeek needs\n3. Ask “Introduce a person worth remembering” with `Runner.run_sync`, store `final_output` in `obj`, and print the name and age with dots\n\nThis needs the Agents SDK and can't run in the browser. Use “Check key points”, then compare with `practice/l11_structured_solution.py` locally."
      },
      "starter": {
        "zh": "from pydantic import BaseModel\nfrom agents import Agent, ModelSettings, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nmodel = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)\n\n# 1. 定义输出结构：名字、性别、事迹（字符串），年龄（整数）\n\n\n# 2. 创建 Agent：规定输出结构，并加上 DeepSeek 需要的 model_settings\n\n\n# 3. 运行「介绍一位值得记住的人」，用点号打印名字和年龄\n",
        "en": "from pydantic import BaseModel\nfrom agents import Agent, ModelSettings, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nmodel = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)\n\n# 1. define the output structure: name, gender, deeds (strings), age (an integer)\n\n\n# 2. create the agent: set the output structure and add the model_settings DeepSeek needs\n\n\n# 3. ask \"Introduce a person worth remembering\"; print the name and age with dots\n"
      },
      "solution": {
        "zh": "from pydantic import BaseModel\nfrom agents import Agent, ModelSettings, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nmodel = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)\n\nclass Data(BaseModel):\n    名字: str\n    性别: str\n    事迹: str\n    年龄: int\n\nagent = Agent(\n    name=\"助手\",\n    instructions=\"用 JSON 回答，只包含四个字段：名字、性别、事迹、年龄（整数）。\",\n    model=model,\n    output_type=Data,\n    model_settings=ModelSettings(extra_body={\"response_format\": {\"type\": \"json_object\"}}),\n)\n\nresult = Runner.run_sync(agent, \"介绍一位值得记住的人\")\nobj = result.final_output\nprint(obj.名字, obj.年龄)",
        "en": "from pydantic import BaseModel\nfrom agents import Agent, ModelSettings, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nmodel = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)\n\nclass Data(BaseModel):\n    name: str\n    gender: str\n    deeds: str\n    age: int\n\nagent = Agent(\n    name=\"assistant\",\n    instructions=\"Answer in JSON with exactly four fields: name, gender, deeds, age (an integer).\",\n    model=model,\n    output_type=Data,\n    model_settings=ModelSettings(extra_body={\"response_format\": {\"type\": \"json_object\"}}),\n)\n\nresult = Runner.run_sync(agent, \"Introduce a person worth remembering\")\nobj = result.final_output\nprint(obj.name, obj.age)"
      },
      "checks": [
        {
          "zh": "定义 `class Data(BaseModel)`",
          "en": "Defines `class Data(BaseModel)`",
          "re": "class\\s+Data\\s*\\(\\s*BaseModel\\s*\\)\\s*:"
        },
        {
          "zh": "有一个 `int` 类型的字段（年龄）",
          "en": "Has an `int` field (age)",
          "re": ":\\s*int\\s*$"
        },
        {
          "zh": "Agent 带上 `output_type=Data`",
          "en": "The agent gets `output_type=Data`",
          "re": "output_type\\s*=\\s*Data"
        },
        {
          "zh": "用 `extra_body` 把 `response_format` 换成 `json_object`",
          "en": "Uses `extra_body` to switch `response_format` to `json_object`",
          "re": "extra_body\\s*=\\s*\\{\\s*[\"']response_format[\"']\\s*:\\s*\\{\\s*[\"']type[\"']\\s*:\\s*[\"']json_object[\"']"
        },
        {
          "zh": "用 `Runner.run_sync` 运行并取 `final_output`",
          "en": "Runs with `Runner.run_sync` and takes `final_output`",
          "re": "Runner\\.run_sync\\([\\s\\S]*\\.final_output"
        }
      ]
    },
    {
      "title": {
        "zh": "手写：给 Agent 一个查天气的工具",
        "en": "Write it: give the agent a weather tool"
      },
      "task": {
        "zh": "1. 写工具 `get_weather(city_name: str) -> str`，加上 `@function_tool`；docstring 第一行说明用途，`Args:` 里说明 `city_name`；先直接 `return \"31.1℃\"`（和视频一样不联网）\n2. 创建 Agent，`tools=[get_weather]`\n3. `Runner.run_sync` 问「今天北京天气如何？」，打印 `final_output`\n\n写完点「检查关键点」，本地对照 `practice/l11_tools_solution.py`。",
        "en": "1. Write the tool `get_weather(city_name: str) -> str` with `@function_tool`; the docstring's first line says what it does and `Args:` describes `city_name`; just `return \"31.1℃\"` for now (no network, like the video)\n2. Create an agent with `tools=[get_weather]`\n3. Ask “What's the weather like in Beijing today?” with `Runner.run_sync` and print `final_output`\n\nUse “Check key points”, then compare with `practice/l11_tools_solution.py` locally."
      },
      "starter": {
        "zh": "from agents import Agent, OpenAIChatCompletionsModel, Runner, function_tool, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nmodel = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)\n\n# 1. 工具 get_weather：参数是城市名，写 docstring（含 Args），先返回固定的 \"31.1℃\"\n\n\n# 2. 创建 Agent，把工具放进列表交给它\n\n\n# 3. 问「今天北京天气如何？」，打印最终回答\n",
        "en": "from agents import Agent, OpenAIChatCompletionsModel, Runner, function_tool, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nmodel = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)\n\n# 1. the get_weather tool: takes the city name, has a docstring (with Args), returns a fixed \"31.1℃\" for now\n\n\n# 2. create the agent and give it the tool in a list\n\n\n# 3. ask \"What's the weather like in Beijing today?\" and print the final answer\n"
      },
      "solution": {
        "zh": "from agents import Agent, OpenAIChatCompletionsModel, Runner, function_tool, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nmodel = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)\n\n@function_tool\ndef get_weather(city_name: str) -> str:\n    \"\"\"查询指定城市当前的气温。\n\n    Args:\n        city_name: 城市名，例如 北京、巴黎\n    \"\"\"\n    return \"31.1℃\"\n\nagent = Agent(\n    name=\"天气助手\",\n    instructions=\"你是一个天气助手。需要天气信息时调用工具。\",\n    model=model,\n    tools=[get_weather],\n)\n\nresult = Runner.run_sync(agent, \"今天北京天气如何？\")\nprint(result.final_output)",
        "en": "from agents import Agent, OpenAIChatCompletionsModel, Runner, function_tool, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nmodel = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)\n\n@function_tool\ndef get_weather(city_name: str) -> str:\n    \"\"\"Get the current temperature of a city.\n\n    Args:\n        city_name: The city name, e.g. Beijing or Paris\n    \"\"\"\n    return \"31.1℃\"\n\nagent = Agent(\n    name=\"weather assistant\",\n    instructions=\"You are a weather assistant. Call the tool when you need weather data.\",\n    model=model,\n    tools=[get_weather],\n)\n\nresult = Runner.run_sync(agent, \"What's the weather like in Beijing today?\")\nprint(result.final_output)"
      },
      "checks": [
        {
          "zh": "用 `@function_tool` 装饰",
          "en": "Decorated with `@function_tool`",
          "re": "^@function_tool"
        },
        {
          "zh": "定义 `get_weather(city_name: str) -> str`",
          "en": "Defines `get_weather(city_name: str) -> str`",
          "re": "def\\s+get_weather\\s*\\(\\s*city_name\\s*:\\s*str\\s*\\)\\s*->\\s*str\\s*:"
        },
        {
          "zh": "docstring 里有 `Args:`，并说明了 `city_name`",
          "en": "The docstring has `Args:` describing `city_name`",
          "re": "Args:\\s*\\n\\s+city_name\\s*:"
        },
        {
          "zh": "Agent 带上 `tools=[get_weather]`",
          "en": "The agent gets `tools=[get_weather]`",
          "re": "tools\\s*=\\s*\\[\\s*get_weather\\s*\\]"
        },
        {
          "zh": "用 `Runner.run_sync` 运行并打印 `final_output`",
          "en": "Runs with `Runner.run_sync` and prints `final_output`",
          "re": "Runner\\.run_sync\\([\\s\\S]*\\.final_output"
        }
      ]
    },
    {
      "title": {
        "zh": "手写：让 Agent 使用 MCP 服务器",
        "en": "Write it: let an agent use an MCP server"
      },
      "task": {
        "zh": "服务器已经写好：`practice/l11_mcp_server.py`。在 `practice` 文件夹里新建一个文件：\n1. 写 `async def main():`，在里面用 `async with MCPServerStdio(...) as mcp_server:` 启动服务器：`name` 随意，`params` 里 `command` 用 `sys.executable`，`args` 是 `[str(SERVER_FILE)]`\n2. 在 `async with` 里创建 Agent，传 `mcp_servers=[mcp_server]`；`await Runner.run(...)` 问「当前目录有几个文件？」，打印 `final_output`\n3. 最后 `asyncio.run(main())`\n\n写完点「检查关键点」，本地对照 `practice/l11_mcp_solution.py`。",
        "en": "The server is ready-made: `practice/l11_mcp_server.py`. Create a new file in the `practice` folder:\n1. Write `async def main():` and start the server inside it with `async with MCPServerStdio(...) as mcp_server:` – any `name`; in `params`, `command` is `sys.executable` and `args` is `[str(SERVER_FILE)]`\n2. Inside the `async with`, create an agent with `mcp_servers=[mcp_server]`; `await Runner.run(...)` with “How many files are in the current folder?” and print `final_output`\n3. Finish with `asyncio.run(main())`\n\nUse “Check key points”, then compare with `practice/l11_mcp_solution.py` locally."
      },
      "starter": {
        "zh": "import asyncio\nimport sys\nfrom pathlib import Path\n\nfrom agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom agents.mcp import MCPServerStdio\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nSERVER_FILE = Path(__file__).with_name(\"l11_mcp_server.py\")\n\n# 1. 写 async 的 main 函数，在里面用 async with 启动 MCP 服务器（用 sys.executable 运行 SERVER_FILE）\n\n# 2. 在 async with 里面创建 Agent，把服务器交给它，问「当前目录有几个文件？」，打印回答\n\n# 3. 用 asyncio 启动 main\n",
        "en": "import asyncio\nimport sys\nfrom pathlib import Path\n\nfrom agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom agents.mcp import MCPServerStdio\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nSERVER_FILE = Path(__file__).with_name(\"l11_mcp_server.py\")\n\n# 1. write an async main function; inside it start the MCP server with async with (run SERVER_FILE with sys.executable)\n\n# 2. inside the async with, create the agent, give it the server, ask how many files are here, print the answer\n\n# 3. start main with asyncio\n"
      },
      "solution": {
        "zh": "import asyncio\nimport sys\nfrom pathlib import Path\n\nfrom agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom agents.mcp import MCPServerStdio\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nSERVER_FILE = Path(__file__).with_name(\"l11_mcp_server.py\")\n\nasync def main():\n    async with MCPServerStdio(\n        name=\"文件工具服务器\",\n        params={\"command\": sys.executable, \"args\": [str(SERVER_FILE)]},\n        client_session_timeout_seconds=30,\n    ) as mcp_server:\n        agent = Agent(\n            name=\"文件助手\",\n            instructions=\"需要了解文件夹内容时，使用工具。\",\n            model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),\n            mcp_servers=[mcp_server],\n        )\n        result = await Runner.run(agent, \"当前目录有几个文件？\")\n        print(result.final_output)\n\nasyncio.run(main())",
        "en": "import asyncio\nimport sys\nfrom pathlib import Path\n\nfrom agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom agents.mcp import MCPServerStdio\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nSERVER_FILE = Path(__file__).with_name(\"l11_mcp_server.py\")\n\nasync def main():\n    async with MCPServerStdio(\n        name=\"file-tools server\",\n        params={\"command\": sys.executable, \"args\": [str(SERVER_FILE)]},\n        client_session_timeout_seconds=30,\n    ) as mcp_server:\n        agent = Agent(\n            name=\"file assistant\",\n            instructions=\"Use the tools to look inside folders.\",\n            model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),\n            mcp_servers=[mcp_server],\n        )\n        result = await Runner.run(agent, \"How many files are in the current folder?\")\n        print(result.final_output)\n\nasyncio.run(main())"
      },
      "checks": [
        {
          "zh": "定义 `async def main():`",
          "en": "Defines `async def main():`",
          "re": "async\\s+def\\s+main\\s*\\(\\s*\\)\\s*:"
        },
        {
          "zh": "`async with MCPServerStdio(...)`",
          "en": "`async with MCPServerStdio(...)`",
          "re": "async\\s+with\\s+MCPServerStdio\\("
        },
        {
          "zh": "`command` 用 `sys.executable`",
          "en": "`command` is `sys.executable`",
          "re": "[\"']command[\"']\\s*:\\s*sys\\.executable"
        },
        {
          "zh": "`args` 是一个列表",
          "en": "`args` is a list",
          "re": "[\"']args[\"']\\s*:\\s*\\["
        },
        {
          "zh": "`as mcp_server:` 拿到连接",
          "en": "`as mcp_server:` receives the connection",
          "re": "\\)\\s*as\\s+\\w+\\s*:"
        },
        {
          "zh": "Agent 带上 `mcp_servers=[...]`",
          "en": "The agent gets `mcp_servers=[...]`",
          "re": "mcp_servers\\s*=\\s*\\[\\s*\\w+\\s*\\]"
        },
        {
          "zh": "`await Runner.run(...)` 并打印 `final_output`",
          "en": "`await Runner.run(...)` and print `final_output`",
          "re": "await\\s+Runner\\.run\\([\\s\\S]*\\.final_output"
        },
        {
          "zh": "用 `asyncio.run(main())` 启动",
          "en": "Starts with `asyncio.run(main())`",
          "re": "asyncio\\.run\\(\\s*main\\(\\)\\s*\\)"
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "用 DeepSeek 时只写 `output_type=Data`，请求报 400；要用 `extra_body` 换成 `json_object`，并在 instructions 里写明字段。",
      "en": "Using only `output_type=Data` with DeepSeek gives a 400; switch to `json_object` via `extra_body` and list the fields in the instructions."
    },
    {
      "zh": "instructions 里没写清字段名，模型返回的 JSON 和 `Data` 对不上，SDK 检查时报错。",
      "en": "Not naming the fields in the instructions, so the model's JSON doesn't match `Data` and the SDK's check fails."
    },
    {
      "zh": "把结构化输出的 `final_output` 当字符串来拼接、切片；它是对象，要用 `obj.字段`。",
      "en": "Treating a structured `final_output` as a string to concatenate or slice; it is an object, so use `obj.field`."
    },
    {
      "zh": "工具的 docstring 不写或写得含糊：模型不知道什么时候用、参数怎么填。",
      "en": "A missing or vague docstring: the model can't tell when to use the tool or how to fill in its parameters."
    },
    {
      "zh": "参数设计成模型不一定知道的东西（如经纬度），模型填不出来；换成它熟悉的（城市名），或再给它一个查询工具。",
      "en": "Parameters the model may not know (like coordinates) can't be filled in; use ones it knows (a city name) or add a lookup tool."
    },
    {
      "zh": "FastMCP 里写 `@mcp.tool` 忘了括号，报 `TypeError`；或在 stdio 服务器里 `print()` 到标准输出，破坏通信。",
      "en": "Writing `@mcp.tool` without parentheses in FastMCP (a `TypeError`), or `print()`ing to stdout in a stdio server and corrupting the channel."
    },
    {
      "zh": "`command` 写成 `\"python\"`：Windows 上可能启动了另一个没装 `mcp` 的 Python。用 `sys.executable`。",
      "en": "Using `\"python\"` as the `command`: on Windows it may start another Python without `mcp`. Use `sys.executable`."
    },
    {
      "zh": "在 `async with` 外面使用 `mcp_server`，或者在普通 `def` 里写 `async with`（SyntaxError）。",
      "en": "Using `mcp_server` outside the `async with` block, or writing `async with` inside a plain `def` (SyntaxError)."
    }
  ],
  "recap": [
    {
      "zh": "结构化输出：`class Data(BaseModel)` 定字段 → `Agent(output_type=Data)` → `final_output` 是对象，用 `obj.字段` 读；在历史里它是 JSON 字符串。",
      "en": "Structured output: `class Data(BaseModel)` defines the fields → `Agent(output_type=Data)` → `final_output` is an object read with `obj.field`; in the history it is a JSON string."
    },
    {
      "zh": "DeepSeek 不支持 `json_schema`：加 `model_settings=ModelSettings(extra_body={\"response_format\": {\"type\": \"json_object\"}})`，并在 instructions 里写明字段。",
      "en": "DeepSeek doesn't support `json_schema`: add `model_settings=ModelSettings(extra_body={\"response_format\": {\"type\": \"json_object\"}})` and list the fields in the instructions."
    },
    {
      "zh": "工具：函数 + docstring + `@function_tool` + `tools=[...]`；生成说明、调用工具、发回结果都由 Runner 自动完成。",
      "en": "Tools: a function + docstring + `@function_tool` + `tools=[...]`; the Runner generates the schema, calls the tool and sends the result back."
    },
    {
      "zh": "参数要选模型能填出来的（城市名比经纬度更稳）。",
      "en": "Choose parameters the model can fill in (a city name beats coordinates)."
    },
    {
      "zh": "MCP 服务器：`FastMCP(名字)` + `@mcp.tool()` + `mcp.run()`。",
      "en": "MCP server: `FastMCP(name)` + `@mcp.tool()` + `mcp.run()`."
    },
    {
      "zh": "MCP 客户端：`async with MCPServerStdio(name=..., params={\"command\": sys.executable, \"args\": [脚本]}) as mcp_server:`，再 `Agent(mcp_servers=[mcp_server])`，要用异步写法。",
      "en": "MCP client: `async with MCPServerStdio(name=..., params={\"command\": sys.executable, \"args\": [script]}) as mcp_server:`, then `Agent(mcp_servers=[mcp_server])`, in the async style."
    }
  ],
  "files": [
    {
      "path": "practice/l11_structured_todo.py",
      "zh": "练习：结构化输出，介绍一位值得记住的人（有 TODO 提示）。",
      "en": "Exercise: structured output – introduce a person worth remembering (with TODO hints)."
    },
    {
      "path": "practice/l11_structured_solution.py",
      "zh": "参考答案（含 DeepSeek 需要的设置，已实测），还会打印对话历史。",
      "en": "Solution (with the setting DeepSeek needs; tested), also prints the history."
    },
    {
      "path": "practice/l11_tools_todo.py",
      "zh": "练习：用 `@function_tool` 写查天气工具交给 Agent（有 TODO 提示）。",
      "en": "Exercise: a weather tool with `@function_tool`, given to an agent (with TODO hints)."
    },
    {
      "path": "practice/l11_tools_solution.py",
      "zh": "参考答案：城市名版本和视频里的经纬度版本，并打印 Runner 自动完成的步骤。",
      "en": "Solution: the city-name version and the video's coordinates version, printing the steps the Runner did."
    },
    {
      "path": "practice/l11_mcp_server.py",
      "zh": "写好的 MCP 服务器（FastMCP，stdio），提供查询目录的 `list_files` 工具；不需要单独运行。",
      "en": "A ready-made MCP server (FastMCP, stdio) with a `list_files` tool for looking inside folders; no need to run it yourself."
    },
    {
      "path": "practice/l11_mcp_todo.py",
      "zh": "练习：用 `MCPServerStdio` 连接上面的服务器，交给 Agent（有 TODO 提示）。",
      "en": "Exercise: connect to the server above with `MCPServerStdio` and give it to an agent (with TODO hints)."
    },
    {
      "path": "practice/l11_mcp_solution.py",
      "zh": "上面练习的参考答案（已用 DeepSeek 实测）。",
      "en": "Reference solution for the exercise above (tested with DeepSeek)."
    }
  ]
});
