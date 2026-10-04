COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l16",
  "priority": "important",
  "handwrite": true,
  "studyMinutes": 40,
  "source": "subtitle",
  "summary": {
    "zh": "给 AgentScope 智能体装上工具：为什么大模型离不开工具；`Toolkit` 工具箱和内置的 `Read` 读文件工具；视频里自定义工具的三层包装（`FunctionTool` 包函数，返回值用 `TextBlock` + `ToolChunk` 包两层）以及 docstring 为什么必须写；最后是事件的第二个作用——工具调用要先批准：在流式输出里接住 `RequireUserConfirmEvent`，交回一个 `UserConfirmResultEvent`，智能体才会执行工具并继续回答。",
    "en": "Giving an AgentScope agent tools: why an LLM needs them; the `Toolkit` and the built-in `Read` file tool; the video's three-layer wrapping for a custom tool (`FunctionTool` around the function, the return value wrapped in `TextBlock` + `ToolChunk`) and why the docstring is a must; and the second job of events – tool calls must be approved first: catch the `RequireUserConfirmEvent` while streaming, hand back a `UserConfirmResultEvent`, and only then does the agent run the tool and carry on."
  },
  "goals": [
    {
      "zh": "说清楚大模型为什么要靠智能体系统和工具才能「动手做事」",
      "en": "Explain why an LLM needs the agent system and tools to actually do things"
    },
    {
      "zh": "创建 `Toolkit`，放进内置的 `Read()` 和自己的工具，并用 `toolkit=` 交给 `Agent`",
      "en": "Create a `Toolkit` with the built-in `Read()` and your own tool, and give it to `Agent` with `toolkit=`"
    },
    {
      "zh": "按视频写出自定义工具：`FunctionTool(函数)`，函数返回 `ToolChunk(content=[TextBlock(text=...)])`，docstring 写清作用、参数和返回值",
      "en": "Write a custom tool the video's way: `FunctionTool(function)`, returning `ToolChunk(content=[TextBlock(text=...)])`, with a docstring for purpose, parameters and return value"
    },
    {
      "zh": "解释「请求批准」事件：不处理为什么会报错，怎样用 `ConfirmResult` + `UserConfirmResultEvent` 让智能体继续",
      "en": "Explain the “please approve” event: why ignoring it fails, and how `ConfirmResult` + `UserConfirmResultEvent` let the agent continue"
    },
    {
      "zh": "看懂流式输出里依次出现的思考、工具参数、工具结果和回答",
      "en": "Read the streamed output in order: reasoning, tool arguments, tool result and answer"
    }
  ],
  "blocks": [
    {
      "t": "h",
      "zh": "一、为什么需要工具",
      "en": "1. Why tools"
    },
    {
      "t": "p",
      "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=17&t=0) 老师先回顾：大模型只会输出文字。问它「猫是什么」「狗是什么」，它能答得很好；可如果让它「写一段代码、运行它、把运行结果告诉我」，它就做不到了——它没法和外界交互。\n\n所以大模型要依靠**智能体系统**：模型输出一段文字后，智能体系统去解析它，按模型的要求完成相应的操作。本节的**工具**，就是交给大模型使用的、能和外界打交道的手段：模型想用哪个工具，就由智能体系统替它去调用。\n\n这和 [05 节](#/lesson/l05)手写的工具调用是同一个原理，只是那时我们要自己写工具说明、解析 `tool_calls`、调用函数、把结果放回历史；现在这些都由 AgentScope 完成。",
      "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=17&t=0) The instructor starts with a reminder: an LLM only outputs text. Ask it what a cat or a dog is and it answers well; ask it to “write some code, run it and tell me the result” and it can't – it has no way to touch the outside world.\n\nSo the LLM relies on the **agent system**: after the model outputs some text, the agent system parses it and carries out what the model asked for. The **tools** in this lesson are the means of dealing with the outside world that we hand to the model: when it wants a tool, the agent system calls it on the model's behalf.\n\nIt's the same principle as the hand-written tool calls of [lesson 05](#/lesson/l05), where we wrote the tool description, parsed `tool_calls`, called the function and put the result back into the history ourselves; now AgentScope does all of that."
    },
    {
      "t": "h",
      "zh": "二、工具箱 Toolkit 和内置工具 Read",
      "en": "2. The Toolkit and the built-in Read tool"
    },
    {
      "t": "p",
      "zh": "[▶ 01:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=17&t=62) 从 `agentscope.tool` 导入工具箱类 `Toolkit`，创建一个工具箱；模型照 15 节的流程创建；创建智能体时，把工具箱作为参数 `toolkit=` 传进去。这样智能体就有了一个工具箱，可以调用里面的工具。\n\n[▶ 01:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=17&t=92) 但新建的工具箱是**空的**：没有工具，传进去也没有实际意义。往里加工具的第一种来源是 AgentScope **自带的工具**，比如读文件的 `Read`：创建工具箱时传一个列表 `tools=[...]`，把工具对象放进去即可。",
      "en": "[▶ 01:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=17&t=62) Import the `Toolkit` class from `agentscope.tool` and create a toolkit; create the model as in lesson 15; when creating the agent, pass the toolkit in as `toolkit=`. Now the agent has a toolkit and can call the tools in it.\n\n[▶ 01:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=17&t=92) But a new toolkit is **empty**: with no tools in it, passing it in achieves nothing. The first source of tools is AgentScope's **built-in tools**, such as `Read` for reading files: give the toolkit a list, `tools=[...]`, holding the tool objects."
    },
    {
      "t": "code",
      "file": {
        "zh": "工具箱（节选）",
        "en": "the toolkit (excerpt)"
      },
      "code": {
        "zh": "from agentscope.agent import Agent\nfrom agentscope.tool import Read, Toolkit\n\nempty_toolkit = Toolkit()                  # 空工具箱：智能体没有工具可用\ntoolkit = Toolkit(tools=[Read()])          # 放进内置的读文件工具（注意要加括号，创建对象）\n\nagent = Agent(\n    name=\"Friday\",\n    system_prompt=\"你是一个乐于助人的助手。\",\n    model=model,                           # 15 节的 OpenAIChatModel\n    toolkit=toolkit,                       # 把工具箱交给智能体\n)",
        "en": "from agentscope.agent import Agent\nfrom agentscope.tool import Read, Toolkit\n\nempty_toolkit = Toolkit()                  # an empty toolkit: the agent has nothing to use\ntoolkit = Toolkit(tools=[Read()])          # add the built-in file reader (note the brackets: create an object)\n\nagent = Agent(\n    name=\"Friday\",\n    system_prompt=\"You are a helpful assistant.\",\n    model=model,                           # the OpenAIChatModel from lesson 15\n    toolkit=toolkit,                       # hand the toolkit to the agent\n)"
      }
    },
    {
      "t": "note",
      "zh": "补充：视频只用了 `Read`，说其他内置工具可以自己查官方文档。2.0.9 里常见的几个：\n\n| 工具 | 做什么 | 要批准吗（第四部分） |\n|---|---|---|\n| `Read()` | 读文件，**路径要写绝对路径** | 不用，只读 |\n| `Glob()` | 按模式找文件，如 `**/*.py` | 不用，只读 |\n| `Grep()` | 在文件里搜文字（电脑上要装 ripgrep，本课环境没装） | 不用，只读 |\n| `Write()`、`Edit()` | 新建、修改文件 | 要 |\n| `Bash()`、`PowerShell()` | 执行命令 | 一般要 |",
      "en": "Extra: the video only uses `Read` and points to the official docs for the rest. Common ones in 2.0.9:\n\n| Tool | What it does | Needs approval? (part 4) |\n|---|---|---|\n| `Read()` | Reads a file; **the path must be absolute** | No, read-only |\n| `Glob()` | Finds files by pattern, e.g. `**/*.py` | No, read-only |\n| `Grep()` | Searches text in files (needs ripgrep installed, which this course doesn't have) | No, read-only |\n| `Write()`, `Edit()` | Create or change files | Yes |\n| `Bash()`, `PowerShell()` | Run commands | Usually |"
    },
    {
      "t": "h",
      "zh": "三、自定义工具：三层包装",
      "en": "3. A custom tool: three layers of wrapping"
    },
    {
      "t": "p",
      "zh": "[▶ 02:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=17&t=130) 实际项目里，官方工具往往满足不了需求，要自己写。视频里的自定义工具一共包了**三层**：\n\n1. **最外层**：函数本身要用 `FunctionTool(...)` 包起来，才能放进工具箱；\n2. **中间层**：函数的返回值要放进一个**工具块** `ToolChunk`，写在它的 `content=` 列表里；\n3. **最里层**：如果返回的是文字，先用 `TextBlock(text=...)` 包好（和 15 节消息里的文字块是同一个类）。\n\n视频的例子是一个计算两数之和的函数：",
      "en": "[▶ 02:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=17&t=130) In real projects the official tools often aren't enough, so you write your own. The video's custom tool is wrapped in **three layers**:\n\n1. **outermost**: the function itself is wrapped in `FunctionTool(...)` so it can go into the toolkit;\n2. **middle**: the return value goes into a **tool chunk**, `ToolChunk`, inside its `content=` list;\n3. **innermost**: if the result is text, it is first wrapped in `TextBlock(text=...)` (the same block class as in lesson 15's messages).\n\nThe video's example is a function that adds two numbers:"
    },
    {
      "t": "code",
      "file": "practice/l16_tools_solution.py · add",
      "code": {
        "zh": "from agentscope.message import TextBlock\nfrom agentscope.tool import FunctionTool, Read, ToolChunk, Toolkit\n\ndef add(a: float, b: float) -> ToolChunk:\n    \"\"\"计算两个数字之和。\n\n    Args:\n        a (float): 第一个加数\n        b (float): 第二个加数\n\n    Returns:\n        ToolChunk: 两数之和\n    \"\"\"\n    result = a + b\n    return ToolChunk(content=[TextBlock(text=str(result))])   # 第 2、3 层：TextBlock 放进 ToolChunk\n\ntoolkit = Toolkit(tools=[Read(), FunctionTool(add)])          # 第 1 层：FunctionTool 包住函数",
        "en": "from agentscope.message import TextBlock\nfrom agentscope.tool import FunctionTool, Read, ToolChunk, Toolkit\n\ndef add(a: float, b: float) -> ToolChunk:\n    \"\"\"Add two numbers.\n\n    Args:\n        a (float): the first number\n        b (float): the second number\n\n    Returns:\n        ToolChunk: the sum of the two numbers\n    \"\"\"\n    result = a + b\n    return ToolChunk(content=[TextBlock(text=str(result))])   # layers 2 and 3: a TextBlock inside a ToolChunk\n\ntoolkit = Toolkit(tools=[Read(), FunctionTool(add)])          # layer 1: FunctionTool wraps the function"
      },
      "note": {
        "zh": "`str(result)` 把数字变成字符串，因为 `TextBlock` 里装的是文字。注意 `FunctionTool(add)` 里的 `add` **没有括号**：交给它的是函数本身，不是调用结果。",
        "en": "`str(result)` turns the number into a string because a `TextBlock` holds text. Note there are **no brackets** after `add` in `FunctionTool(add)`: you hand over the function itself, not the result of calling it."
      }
    },
    {
      "t": "p",
      "zh": "[▶ 03:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=17&t=225) 还有一件**非常重要**的事：函数的描述（docstring，08 节）。工具箱会解析它，把它作为函数说明交给模型，所以要尽量写清楚：\n- 第一行：这个函数**是做什么的**（例子里是「计算两个数字之和」）\n- `Args:` 下面：每个参数的作用，格式是 `名字 (类型): 说明`\n- `Returns:` 下面：返回的是什么\n\n老师特别提醒：没有这段描述，模型就拿不到任何函数说明；拿不到说明，模型就不会去调用它，这个工具等于被**废弃**了。下面是工具箱根据上面的 `add` 生成、交给模型的说明（用 `await toolkit.get_tool_schemas()` 打印出来的实测结果）：",
      "en": "[▶ 03:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=17&t=225) One more **very important** thing: the function's description, its docstring (lesson 08). The toolkit parses it and hands it to the model as the function's description, so make it as clear as you can:\n- the first line: **what the function does** (“add two numbers” in the example)\n- under `Args:`: what each parameter is, in the form `name (type): description`\n- under `Returns:`: what comes back\n\nThe instructor stresses that without this description the model gets no explanation of the function; without one it won't call it, and the tool is effectively **abandoned**. Below is what the toolkit generated from `add` above for the model (printed with `await toolkit.get_tool_schemas()` in a real run):"
    },
    {
      "t": "code",
      "lang": "json",
      "file": "await toolkit.get_tool_schemas()  ·  add",
      "code": {
        "zh": "{\n  \"type\": \"function\",\n  \"function\": {\n    \"name\": \"add\",\n    \"description\": \"计算两个数字之和。\",\n    \"parameters\": {\n      \"properties\": {\n        \"a\": {\"description\": \"第一个加数\", \"type\": \"number\"},\n        \"b\": {\"description\": \"第二个加数\", \"type\": \"number\"}\n      },\n      \"required\": [\"a\", \"b\"],\n      \"type\": \"object\"\n    }\n  }\n}",
        "en": "{\n  \"type\": \"function\",\n  \"function\": {\n    \"name\": \"add\",\n    \"description\": \"Add two numbers.\",\n    \"parameters\": {\n      \"properties\": {\n        \"a\": {\"description\": \"the first number\", \"type\": \"number\"},\n        \"b\": {\"description\": \"the second number\", \"type\": \"number\"}\n      },\n      \"required\": [\"a\", \"b\"],\n      \"type\": \"object\"\n    }\n  }\n}"
      },
      "note": {
        "zh": "对照 05 节手写的 `tools` 列表：格式完全一样，只是这次是框架生成的。函数名 → 工具名；docstring 第一段 → `description`；`Args:` → 参数说明；类型标注 `float` → `\"number\"`。`Returns:` 那段没有进入说明（实测），它是写给读代码的人看的，照样值得写。",
        "en": "Compare with the `tools` list you wrote by hand in lesson 05: the same format, generated this time. Function name → tool name; the docstring's first part → `description`; `Args:` → parameter descriptions; the hint `float` → `\"number\"`. The `Returns:` section doesn't appear (tested); it's for people reading the code, and still worth writing."
      }
    },
    {
      "t": "note",
      "zh": "补充：工具也可以直接 `return str(result)`，`FunctionTool` 会自动把字符串包成 `TextBlock` 和 `ToolChunk`（实测，模型收到的内容一样）；返回数字、字典也会被转成文字。视频的三层写法是完整、明确的形式，以后要返回图片之类的数据块时就需要它。但如果函数只 `print` 不 `return`，模型收到的是 `null`。",
      "en": "Extra: a tool may also just `return str(result)`; `FunctionTool` wraps the string in a `TextBlock` and `ToolChunk` for you (tested – the model receives the same content), and numbers or dicts are turned into text too. The video's three-layer form is the complete, explicit one, which you'll need when returning data blocks such as images. But a function that only `print`s and returns nothing gives the model `null`."
    },
    {
      "t": "check",
      "q": {
        "zh": "工具箱交给模型的工具说明（`description`）来自哪里？",
        "en": "Where does the tool description (`description`) the model sees come from?"
      },
      "options": [
        {
          "zh": "函数名",
          "en": "The function name"
        },
        {
          "zh": "`ToolChunk` 里的文字",
          "en": "The text inside the `ToolChunk`"
        },
        {
          "zh": "函数 docstring 开头的说明文字",
          "en": "The description at the start of the function's docstring"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "docstring 的说明 → 工具描述，`Args:` → 参数说明。不写 docstring，描述就是空的，模型不知道什么时候该用它。",
        "en": "The docstring's description → tool description, `Args:` → parameter descriptions. Without a docstring the description is empty and the model can't tell when to use the tool."
      }
    },
    {
      "t": "h",
      "zh": "四、事件的第二个作用：工具调用要先批准",
      "en": "4. The second job of events: tool calls need approval"
    },
    {
      "t": "p",
      "zh": "[▶ 04:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=17&t=275) 想让模型正常调用工具，还要理解事件机制的另一个作用。15 节说过，流式输出靠的就是事件；事件还能**精细地控制模型的行为**。\n\n[▶ 05:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=17&t=313) 只是输出文字，没有任何危险，事件只用来流式输出。但像 Claude Code 这样的工具，为了安全，会在模型做某些操作之前**先问用户要授权**。AgentScope 也是这样：模型要求调用工具时，这次调用处于「**还没授权**」的状态。智能体会暂停，发出一个「**请求用户批准**」的事件；你的程序必须处理它——问用户（或者自己决定）同不同意，把答复交回去，智能体才**重新启动**，执行工具、继续输出。\n\n如果不处理这个事件，就会出错：实测在没有答复的情况下直接发下一句话，会报 `ValueError: Agent is waiting for 1 tool calls ... but received no event.`——智能体还在等那次批准。",
      "en": "[▶ 04:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=17&t=275) For the model to call tools properly, you need the other job of events. Lesson 15 showed that streaming runs on events; events can also **control the model's behaviour in detail**.\n\n[▶ 05:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=17&t=313) Plain text output is harmless, and there events just carry the stream. But tools such as Claude Code, to stay safe, **ask the user for permission** before the model does certain things. AgentScope does the same: when the model asks for a tool, that call is **not yet authorised**. The agent pauses and emits a “**please approve**” event; your program must handle it – ask the user (or decide yourself), hand the answer back – and only then does the agent **restart**, run the tool and carry on.\n\nIgnore the event and things break: in a test, sending the next message without answering raised `ValueError: Agent is waiting for 1 tool calls ... but received no event.` – the agent was still waiting for that approval."
    },
    {
      "t": "note",
      "zh": "补充：为什么实测里只有 `add` 要批准，`Read` 不用？内置的 `Read` 被标记为**只读**（只读取、不改动任何东西），权限系统直接放行；`FunctionTool` 包的自定义工具默认不是只读，所以要问。查询类的自定义工具可以写 `FunctionTool(add, is_read_only=True)` 跳过批准——但会写文件、发消息的工具不要这样标。权限的完整用法见 [18 节](#/lesson/l18)。",
      "en": "Extra: why does only `add` need approval in the tests, not `Read`? The built-in `Read` is marked **read-only** (it reads and changes nothing), so the permission system lets it through; a custom tool wrapped in `FunctionTool` is not read-only by default, so it asks. A look-up tool of your own can use `FunctionTool(add, is_read_only=True)` to skip approval – but never mark tools that write files or send messages that way. The full permission system is in [lesson 18](#/lesson/l18)."
    },
    {
      "t": "h",
      "zh": "五、完整实例：一边流式输出，一边处理批准",
      "en": "5. The complete example: streaming while handling approvals"
    },
    {
      "t": "p",
      "zh": "[▶ 05:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=17&t=350) 完整代码先导入需要的库，重点是从 `agentscope.event` 导入三个**处理事件**用的类：`RequireUserConfirmEvent`（智能体请求批准）、`ConfirmResult`（对一次调用的答复）、`UserConfirmResultEvent`（把所有答复打包交回去）。接着是上面的 `add`，工具箱里放一个官方工具 `Read` 和我们的 `add`，再初始化模型、创建带工具箱的智能体。\n\n[▶ 06:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=17&t=385) 重头戏是主循环。先用一个变量 `confirm_event` 存「**系统对模型的应答**」——因为模型有一个暂停再重启的过程，可以理解成系统在和模型对话。每一轮：\n- `confirm_event` 是 `None`：说明系统不需要和模型交互，正常读用户输入、打包成消息；\n- 不是 `None`：这一轮就把它当作输入交给智能体，并清空变量。\n\n然后流式输出。循环里**上半部分**判断是不是请求批准的事件，**下半部分**是 15 节的正常流式打印；把上半部分删掉，就变回单纯的流式输出。",
      "en": "[▶ 05:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=17&t=350) The full code starts with the imports; the key ones are three **event-handling** classes from `agentscope.event`: `RequireUserConfirmEvent` (the agent asks for approval), `ConfirmResult` (the answer for one call) and `UserConfirmResultEvent` (all the answers packed up to hand back). Then comes `add` from above, a toolkit with the official `Read` and our `add`, the model, and an agent that gets the toolkit.\n\n[▶ 06:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=17&t=385) The heart of it is the main loop. A variable `confirm_event` holds “**the system's answer to the model**” – since the model pauses and restarts, you can think of it as the system talking to the model. Each round:\n- `confirm_event` is `None`: the system has nothing to say to the model, so read the user's input as usual and wrap it in a message;\n- otherwise: hand it to the agent as this round's input, and clear the variable.\n\nThen stream. Inside the loop, the **top half** checks for the approval event and the **bottom half** is lesson 15's ordinary streaming print; delete the top half and you're back to plain streaming."
    },
    {
      "t": "code",
      "file": "practice/l16_tools_solution.py · main()",
      "code": {
        "zh": "from agentscope.event import ConfirmResult, RequireUserConfirmEvent, UserConfirmResultEvent\n\nasync def main():\n    confirm_event = None        # 系统对模型的应答（批准结果）；None 表示没有\n\n    while True:\n        if confirm_event is None:\n            user_input = input(\"\\n你：\").strip()\n            if user_input == \"exit\":\n                break\n            inputs = Msg(name=\"user\", role=\"user\", content=[TextBlock(text=user_input)])\n        else:\n            inputs = confirm_event                      # 把批准结果交回去，智能体从暂停处继续\n            confirm_event = None\n\n        async for event in agent.reply_stream(inputs):\n            if isinstance(event, RequireUserConfirmEvent):          # 上半部分：请求批准\n                confirm_results = []\n                for tool_call in event.tool_calls:                  # 一次可能请求好几个工具\n                    print(f\"\\n[请求调用工具] {tool_call.name} {tool_call.input}\")\n                    confirm_results.append(\n                        ConfirmResult(\n                            confirmed=True,                         # 同意；False 是拒绝\n                            tool_call=tool_call,                    # 答复的是哪一个调用\n                            rules=tool_call.suggested_rules,        # 以后同类调用自动允许\n                        )\n                    )\n                confirm_event = UserConfirmResultEvent(reply_id=event.reply_id, confirm_results=confirm_results)\n            elif hasattr(event, \"delta\"):                           # 下半部分：正常的流式输出\n                print(event.delta, end=\"\", flush=True)\n\nasyncio.run(main())",
        "en": "from agentscope.event import ConfirmResult, RequireUserConfirmEvent, UserConfirmResultEvent\n\nasync def main():\n    confirm_event = None        # the system's answer to the model (approvals); None = nothing pending\n\n    while True:\n        if confirm_event is None:\n            user_input = input(\"\\nYou: \").strip()\n            if user_input == \"exit\":\n                break\n            inputs = Msg(name=\"user\", role=\"user\", content=[TextBlock(text=user_input)])\n        else:\n            inputs = confirm_event                      # hand back the approvals; the agent resumes\n            confirm_event = None\n\n        async for event in agent.reply_stream(inputs):\n            if isinstance(event, RequireUserConfirmEvent):          # top half: approval request\n                confirm_results = []\n                for tool_call in event.tool_calls:                  # maybe several calls at once\n                    print(f\"\\n[tool request] {tool_call.name} {tool_call.input}\")\n                    confirm_results.append(\n                        ConfirmResult(\n                            confirmed=True,                         # allow; False denies\n                            tool_call=tool_call,                    # which call this answers\n                            rules=tool_call.suggested_rules,        # auto-allow similar calls later\n                        )\n                    )\n                confirm_event = UserConfirmResultEvent(reply_id=event.reply_id, confirm_results=confirm_results)\n            elif hasattr(event, \"delta\"):                           # bottom half: ordinary streaming\n                print(event.delta, end=\"\", flush=True)\n\nasyncio.run(main())"
      },
      "note": {
        "zh": "节选，模型、智能体等在前面创建；完整可运行的版本是 `practice/l16_tools_solution.py`。`isinstance(对象, 类)` 判断「这个对象是不是这个类的」，09 节流式输出时用过，25 节会细讲。",
        "en": "An excerpt – the model, agent and so on are created earlier; the full runnable file is `practice/l16_tools_solution.py`. `isinstance(object, Class)` asks “is this object of that class?”; you used it for streaming in lesson 09, and lesson 25 covers it in depth."
      }
    },
    {
      "t": "p",
      "zh": "[▶ 07:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=17&t=440) 细看处理批准的那一小块：\n- 模型一次可能请求**不止一个**工具，所以要遍历 `event.tool_calls` 里的每个请求，为每个请求放一条答复进列表（中间的 `print` 只是提示信息，可以不管）；\n- 每条答复是一个 `ConfirmResult`：\n\n| 参数 | 含义 |\n|---|---|\n| `confirmed` | `True` 同意，`False` 拒绝 |\n| `tool_call` | 标明答复的是哪一个工具调用 |\n| `rules` | 把建议的规则 `tool_call.suggested_rules` 交回去，以后同类调用就**自动允许**，不用重复确认 |\n\n- 答复都放好后，用 `UserConfirmResultEvent(reply_id=event.reply_id, confirm_results=...)` 打包，赋给 `confirm_event`；这一轮流式结束后进入下一轮，这个事件就被当作输入交给智能体，智能体重启并执行工具。\n\n视频的系统比较简单，所以对所有请求都直接同意。复杂的系统一定要认真处理这些请求，比如先打印出来问用户 y/n——18 节会这样做。",
      "en": "[▶ 07:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=17&t=440) A closer look at the approval block:\n- the model may ask for **more than one** tool at once, so loop over every request in `event.tool_calls` and put one answer per request into a list (the `print` in between is just information);\n- each answer is a `ConfirmResult`:\n\n| Argument | Meaning |\n|---|---|\n| `confirmed` | `True` allows, `False` denies |\n| `tool_call` | Which tool call this answer is for |\n| `rules` | Hand back the suggested rules `tool_call.suggested_rules`, so similar calls are **allowed automatically** later instead of asking again |\n\n- once all answers are in, pack them with `UserConfirmResultEvent(reply_id=event.reply_id, confirm_results=...)` and store it in `confirm_event`; after this round's stream ends, the next round hands that event to the agent as input, and the agent restarts and runs the tool.\n\nThe video's system is simple, so it approves every request. A real system must handle them carefully – for example print them and ask the user y/n, as lesson 18 does."
    },
    {
      "t": "py",
      "title": {
        "zh": "用一个变量在两轮循环之间「传话」",
        "en": "Passing a message between two loop rounds with one variable"
      },
      "zh": "主循环里最绕的是 `confirm_event`：它在**这一轮**被赋值，却要到**下一轮**才被用掉。这是一个常见的套路：\n- 先设成 `None`，表示「没有待办的事」（`None` 见 05 节）；\n- 某一轮发现有事要留给下一轮，就把它存进变量；\n- 下一轮开头先检查变量：有，就先处理它并清回 `None`；没有，就照常做事。\n\n下面不用 AgentScope，用一个假的智能体把这个流程跑一遍。注意第一个问题要**跑两轮**循环才得到答案：",
      "en": "The trickiest part of the main loop is `confirm_event`: it is set in **this** round but used up in the **next**. That's a common pattern:\n- start with `None`, meaning “nothing pending” (`None`: lesson 05);\n- when a round finds something to leave for the next one, store it in the variable;\n- each round first checks the variable: if something is there, handle it and reset to `None`; otherwise carry on as usual.\n\nHere is the flow with a fake agent instead of AgentScope. Notice that the first question takes **two rounds** of the loop to get its answer:",
      "code": {
        "zh": "questions = [\"算一下 3 加 5\", \"你好\", \"exit\"]\n\ndef fake_agent(inputs):\n    \"\"\"假的智能体：要算数时先请求批准；收到批准后才给出结果\"\"\"\n    if inputs == \"批准：add\":\n        return [\"工具结果：8\", \"回答：3 加 5 等于 8\"]\n    if \"加\" in inputs:\n        return [\"请求批准\"]\n    return [\"回答：你好！\"]\n\npending = None                       # 留给下一轮的东西；None 表示没有\nround_no = 0\nwhile True:\n    round_no += 1\n    if pending is None:              # 没有待办：正常读「用户输入」\n        inputs = questions.pop(0)\n        if inputs == \"exit\":\n            break\n        print(f\"第 {round_no} 轮，用户：{inputs}\")\n    else:                            # 有待办：这一轮把它交出去，然后清空\n        inputs = pending\n        pending = None\n        print(f\"第 {round_no} 轮，交回：{inputs}\")\n\n    for event in fake_agent(inputs):\n        if event == \"请求批准\":\n            pending = \"批准：add\"     # 这一轮记下，下一轮才用\n            print(\"    智能体：请批准调用 add\")\n        else:\n            print(\"    \" + event)",
        "en": "questions = [\"what is 3 plus 5\", \"hello\", \"exit\"]\n\ndef fake_agent(inputs):\n    \"\"\"A fake agent: asks for approval before adding; gives the result once approved\"\"\"\n    if inputs == \"approve: add\":\n        return [\"tool result: 8\", \"answer: 3 plus 5 is 8\"]\n    if \"plus\" in inputs:\n        return [\"please approve\"]\n    return [\"answer: hi!\"]\n\npending = None                       # something left for the next round; None = nothing\nround_no = 0\nwhile True:\n    round_no += 1\n    if pending is None:              # nothing pending: read the \"user input\" as usual\n        inputs = questions.pop(0)\n        if inputs == \"exit\":\n            break\n        print(f\"round {round_no}, user: {inputs}\")\n    else:                            # something pending: hand it over this round, then clear it\n        inputs = pending\n        pending = None\n        print(f\"round {round_no}, handing back: {inputs}\")\n\n    for event in fake_agent(inputs):\n        if event == \"please approve\":\n            pending = \"approve: add\"  # noted this round, used next round\n            print(\"    agent: please approve calling add\")\n        else:\n            print(\"    \" + event)"
      },
      "note": {
        "zh": "`questions.pop(0)` 取出并删掉列表的第一项，相当于「读下一句输入」。",
        "en": "`questions.pop(0)` removes and returns the list's first item – our stand-in for “read the next input”."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "流式循环里没有处理 `RequireUserConfirmEvent`，接着又输入了下一个问题。会怎样？",
        "en": "The streaming loop ignores `RequireUserConfirmEvent`, and then you type the next question. What happens?"
      },
      "options": [
        {
          "zh": "工具自动执行，一切正常",
          "en": "The tool runs automatically and all is fine"
        },
        {
          "zh": "报 `ValueError`：智能体还在等那次工具调用的批准",
          "en": "A `ValueError`: the agent is still waiting for that tool call's approval"
        },
        {
          "zh": "智能体忽略上一个问题，直接回答新问题",
          "en": "The agent drops the previous question and answers the new one"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "暂停的智能体只接受 `UserConfirmResultEvent` 这类答复，收到普通消息就报错。这就是视频说的「不处理事件，流式输出就会报错」。",
        "en": "A paused agent only accepts an answer such as a `UserConfirmResultEvent`; an ordinary message raises an error. That's what the video means by “if you don't handle the event, streaming fails”."
      }
    },
    {
      "t": "h",
      "zh": "六、演示：加法和读文件",
      "en": "6. Demo: adding and reading a file"
    },
    {
      "t": "video",
      "zh": "[▶ 09:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=17&t=540) 老师用两个工具测试：先测自定义的加法，再测官方的读文件工具。\n\n[▶ 09:29](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=17&t=569) 让模型算两个数之和，答案正确。他解释：模型其实进行了**两轮**对话——一轮是和系统的对话（请求批准、得到同意，这部分界面上看不到），第二轮才是调用工具、重启之后的结果。\n\n[▶ 10:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=17&t=602) 测读文件：他在一个文件里写了一句暗号，把文件的**绝对路径**告诉模型，让它读出来；模型顺利读到并说出了暗号。我们的练习文件 `practice/data/l16_secret.txt` 里也藏了一句（自己的）暗号，`l16_tools_solution.py` 启动时会打印它的绝对路径，复制进问题里即可。",
      "en": "[▶ 09:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=17&t=540) The instructor tests both tools: first the custom add, then the official file reader.\n\n[▶ 09:29](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=17&t=569) He asks for the sum of two numbers and gets the right answer. He explains that the model actually went through **two rounds**: one with the system (asking for approval and getting it – not visible on screen) and a second one, after restarting, with the tool's result.\n\n[▶ 10:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=17&t=602) For the file reader he wrote a secret phrase into a file, gave the model the file's **absolute path** and asked it to read it; the model read the file and reported the phrase. Our practice file `practice/data/l16_secret.txt` hides a (different) secret phrase too; `l16_tools_solution.py` prints its absolute path at start-up, ready to paste into your question."
    },
    {
      "t": "code",
      "lang": "text",
      "file": {
        "zh": "实测输出（DeepSeek，运行 practice/l16_tools_solution.py，节选）",
        "en": "real run output (DeepSeek, practice/l16_tools_solution.py, excerpt, translated)"
      },
      "code": {
        "zh": "你：帮我算一下 12.5 加 30 等于多少\nJust add 12.5 + 30 = 42.5.{\"a\": 12.5, \"b\": 30}\n[请求调用工具 / tool request] add {\"a\": 12.5, \"b\": 30}\n42.512.5 + 30 = **42.5**\n你：读一下这个文件，告诉我里面的暗号：<项目文件夹>\\practice\\data\\l16_secret.txt\nThe user asks to read a file. ...{\"file_path\": \"<项目文件夹>\\\\practice\\\\data\\\\l16_secret.txt\"}     1\t这是第 16 节的测试文件。\n     2\t今天的暗号是：西瓜在月亮上唱歌 ...\n暗号是：**西瓜在月亮上唱歌**",
        "en": "You: What is 12.5 plus 30?\nJust add 12.5 + 30 = 42.5.{\"a\": 12.5, \"b\": 30}\n[tool request] add {\"a\": 12.5, \"b\": 30}\n42.512.5 + 30 = **42.5**\nYou: Read this file and tell me the secret phrase in it: <project folder>\\practice\\data\\l16_secret.txt\nThe user asks to read a file. ...{\"file_path\": \"<project folder>\\\\practice\\\\data\\\\l16_secret.txt\"}     1\tThis is the test file for lesson 16.\n     2\tToday's secret phrase is: the watermelon sings on the moon ...\nThe secret phrase is: **the watermelon sings on the moon**"
      },
      "note": {
        "zh": "因为 `hasattr(event, \"delta\")` 不分种类（15 节），各种片段首尾相连：英文的**思考** → 工具**参数** `{\"a\": 12.5, \"b\": 30}` → 我们打印的批准提示 → 工具**结果** `42.5` → **回答**。读文件那一轮没有出现批准提示：`Read` 是只读的；它返回的文件内容带着行号。",
        "en": "Because `hasattr(event, \"delta\")` doesn't distinguish kinds (lesson 15), the pieces run together: English **reasoning** → tool **arguments** `{\"a\": 12.5, \"b\": 30}` → our approval message → tool **result** `42.5` → the **answer**. The file round has no approval message: `Read` is read-only; the file content it returns carries line numbers."
      }
    },
    {
      "t": "tip",
      "zh": "调试工具时，先**不经过模型**直接调用你的函数，确认它本身没问题：`print(add(3, 5))`。它就是一个普通函数，`FunctionTool` 没有改变它。",
      "en": "When debugging a tool, first call your function **without the model** to make sure it works: `print(add(3, 5))`. It is still a plain function; `FunctionTool` didn't change it."
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "视频开头说：让大模型「写代码、运行它、返回结果」，它自己做不到。根本原因是？",
        "en": "The video opens by saying an LLM can't “write code, run it and return the result” on its own. Why not?"
      },
      "options": [
        {
          "zh": "大模型不会写代码",
          "en": "LLMs can't write code"
        },
        {
          "zh": "大模型回答太慢",
          "en": "LLMs answer too slowly"
        },
        {
          "zh": "大模型只会输出文字，要靠智能体系统解析它的要求、调用工具去执行",
          "en": "An LLM only outputs text; the agent system has to parse its request and call tools to act on it"
        },
        {
          "zh": "需要先付费开通代码功能",
          "en": "You must pay to unlock a code feature"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "模型只产出文字。和外界打交道（运行代码、读文件）要靠工具，由智能体系统替模型调用。",
        "en": "The model only produces text. Dealing with the outside world (running code, reading files) takes tools, which the agent system calls on the model's behalf."
      }
    },
    {
      "q": {
        "zh": "`Agent(..., toolkit=Toolkit())` 传了一个新建的空工具箱，会怎样？",
        "en": "`Agent(..., toolkit=Toolkit())` gets a brand-new empty toolkit. What happens?"
      },
      "options": [
        {
          "zh": "智能体没有任何工具可用，传了也没有实际意义",
          "en": "The agent has no tools to use, so passing it achieves nothing"
        },
        {
          "zh": "自动装上所有内置工具",
          "en": "All built-in tools are added automatically"
        },
        {
          "zh": "报错：工具箱不能为空",
          "en": "An error: the toolkit can't be empty"
        },
        {
          "zh": "模型会自己写一个工具",
          "en": "The model writes a tool itself"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "工具要自己放进去：`Toolkit(tools=[Read(), FunctionTool(add)])`。",
        "en": "You add tools yourself: `Toolkit(tools=[Read(), FunctionTool(add)])`."
      }
    },
    {
      "q": {
        "zh": "按视频的三层包装，下面哪种写法正确？",
        "en": "Following the video's three layers, which is correct?"
      },
      "options": [
        {
          "zh": "`Toolkit(tools=[add])`，`add` 返回 `TextBlock(text=str(result))`",
          "en": "`Toolkit(tools=[add])`, with `add` returning `TextBlock(text=str(result))`"
        },
        {
          "zh": "`Toolkit(tools=[FunctionTool(add())])`，`add` 返回 `str(result)`",
          "en": "`Toolkit(tools=[FunctionTool(add())])`, with `add` returning `str(result)`"
        },
        {
          "zh": "`Toolkit(tools=[ToolChunk(add)])`，`add` 返回 `FunctionTool(result)`",
          "en": "`Toolkit(tools=[ToolChunk(add)])`, with `add` returning `FunctionTool(result)`"
        },
        {
          "zh": "`Toolkit(tools=[FunctionTool(add)])`，`add` 返回 `ToolChunk(content=[TextBlock(text=str(result))])`",
          "en": "`Toolkit(tools=[FunctionTool(add)])`, with `add` returning `ToolChunk(content=[TextBlock(text=str(result))])`"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "`FunctionTool` 包**函数本身**（不加括号）；返回值是文字放进 `TextBlock`，再放进 `ToolChunk` 的 `content` 列表。",
        "en": "`FunctionTool` wraps **the function itself** (no brackets); the result is text in a `TextBlock`, inside the `content` list of a `ToolChunk`."
      }
    },
    {
      "q": {
        "zh": "自定义工具忘了写 docstring，会怎样？",
        "en": "You forget the docstring on a custom tool. What happens?"
      },
      "options": [
        {
          "zh": "程序报错，无法创建 `FunctionTool`",
          "en": "An error: the `FunctionTool` can't be created"
        },
        {
          "zh": "工具描述是空的，参数也没有说明，模型不知道什么时候该用它，这个工具很可能被晾在一边",
          "en": "The tool description is empty and the parameters are unexplained, so the model can't tell when to use it and will likely ignore it"
        },
        {
          "zh": "框架会根据函数体自动写出描述",
          "en": "The framework writes a description from the function body"
        },
        {
          "zh": "没有影响",
          "en": "No effect"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "实测：没有 docstring 时 `description` 是空字符串。视频强调：拿不到说明，模型就不会调用，等于把工具废弃了。",
        "en": "Tested: without a docstring `description` is an empty string. The video stresses that without a description the model won't call it, so the tool is as good as abandoned."
      }
    },
    {
      "q": {
        "zh": "处理 `RequireUserConfirmEvent` 后，要把什么交回给智能体，它才会执行工具并继续？",
        "en": "After handling a `RequireUserConfirmEvent`, what do you hand back so the agent runs the tool and continues?"
      },
      "options": [
        {
          "zh": "一条新的用户消息 `Msg(..., content=[TextBlock(text=\"同意\")])`",
          "en": "A new user message `Msg(..., content=[TextBlock(text=\"yes\")])`"
        },
        {
          "zh": "直接调用 `add(...)` 的返回值",
          "en": "The return value of calling `add(...)` yourself"
        },
        {
          "zh": "`UserConfirmResultEvent(reply_id=event.reply_id, confirm_results=[ConfirmResult(...), ...])`，在下一轮交给 `reply_stream`",
          "en": "`UserConfirmResultEvent(reply_id=event.reply_id, confirm_results=[ConfirmResult(...), ...])`, passed to `reply_stream` in the next round"
        },
        {
          "zh": "什么都不用交，智能体等一会儿会自己继续",
          "en": "Nothing – the agent continues by itself after a while"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "每个工具调用一条 `ConfirmResult`，打包成 `UserConfirmResultEvent`（带上请求事件的 `reply_id`），作为下一轮的输入交回去。",
        "en": "One `ConfirmResult` per tool call, packed into a `UserConfirmResultEvent` (with the request event's `reply_id`) and handed back as the next round's input."
      }
    },
    {
      "q": {
        "zh": "实测里算加法时出现了批准请求，读文件时却没有。为什么？",
        "en": "In the tests, adding triggered an approval request but reading the file didn't. Why?"
      },
      "options": [
        {
          "zh": "读文件的问题里写了绝对路径",
          "en": "The file question included an absolute path"
        },
        {
          "zh": "内置的 `Read` 是只读工具，直接放行；`FunctionTool(add)` 默认不是只读，所以要问",
          "en": "The built-in `Read` is read-only and is let through; `FunctionTool(add)` isn't read-only by default, so it asks"
        },
        {
          "zh": "第一次批准时交回了 `rules`，所以之后的所有工具都不用问了",
          "en": "The `rules` handed back with the first approval let every later tool through"
        },
        {
          "zh": "DeepSeek 自己决定哪些工具要批准",
          "en": "DeepSeek decides which tools need approval"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "只读工具不改动任何东西，权限系统直接允许。`suggested_rules` 只放行**同一类**调用（这里是 `add`），不会放行别的工具。",
        "en": "Read-only tools change nothing, so the permission system allows them. `suggested_rules` only covers **the same kind** of call (here `add`), not other tools."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "自定义工具和工具箱",
        "en": "A custom tool and the toolkit"
      },
      "code": {
        "zh": "def add(a: [[float]], b: float) -> ToolChunk:\n    \"\"\"计算两个数字之和。\n\n    [[Args]]:\n        a (float): 第一个加数\n        b (float): 第二个加数\n\n    [[Returns]]:\n        ToolChunk: 两数之和\n    \"\"\"\n    return [[ToolChunk]](content=[ [[TextBlock]](text=str(a + b)) ])\n\ntoolkit = [[Toolkit]](tools=[ [[Read]](), [[FunctionTool]](add) ])\nagent = Agent(name=\"Friday\", system_prompt=\"你是一个助手。\", model=model, [[toolkit]]=toolkit)",
        "en": "def add(a: [[float]], b: float) -> ToolChunk:\n    \"\"\"Add two numbers.\n\n    [[Args]]:\n        a (float): the first number\n        b (float): the second number\n\n    [[Returns]]:\n        ToolChunk: the sum\n    \"\"\"\n    return [[ToolChunk]](content=[ [[TextBlock]](text=str(a + b)) ])\n\ntoolkit = [[Toolkit]](tools=[ [[Read]](), [[FunctionTool]](add) ])\nagent = Agent(name=\"Friday\", system_prompt=\"You are an assistant.\", model=model, [[toolkit]]=toolkit)"
      },
      "explain": {
        "zh": "docstring 的 `Args:`、`Returns:` 写给模型和读者看；返回值 `TextBlock` 放进 `ToolChunk`；函数用 `FunctionTool` 包好，和内置的 `Read()` 一起放进 `Toolkit`，再用 `toolkit=` 交给智能体。",
        "en": "The docstring's `Args:` and `Returns:` are for the model and the reader; the result is a `TextBlock` inside a `ToolChunk`; the function is wrapped in `FunctionTool` and goes into the `Toolkit` with the built-in `Read()`, which is passed to the agent with `toolkit=`."
      }
    },
    {
      "title": {
        "zh": "处理批准请求的主循环",
        "en": "The main loop that handles approvals"
      },
      "code": {
        "zh": "async def main():\n    confirm_event = None\n    while True:\n        if confirm_event [[is]] None:\n            user_input = input(\"你：\")\n            inputs = Msg(name=\"user\", role=\"user\", content=[TextBlock(text=user_input)])\n        else:\n            inputs = [[confirm_event]]\n            confirm_event = None\n        async for event in agent.reply_stream(inputs):\n            if isinstance(event, [[RequireUserConfirmEvent]]):\n                results = []\n                for tool_call in event.[[tool_calls]]:\n                    results.append([[ConfirmResult]](confirmed=[[True]], tool_call=tool_call,\n                                                 rules=tool_call.suggested_rules))\n                confirm_event = [[UserConfirmResultEvent]](reply_id=event.[[reply_id]], confirm_results=results)\n            elif hasattr(event, \"delta\"):\n                print(event.delta, end=\"\", flush=True)",
        "en": "async def main():\n    confirm_event = None\n    while True:\n        if confirm_event [[is]] None:\n            user_input = input(\"You: \")\n            inputs = Msg(name=\"user\", role=\"user\", content=[TextBlock(text=user_input)])\n        else:\n            inputs = [[confirm_event]]\n            confirm_event = None\n        async for event in agent.reply_stream(inputs):\n            if isinstance(event, [[RequireUserConfirmEvent]]):\n                results = []\n                for tool_call in event.[[tool_calls]]:\n                    results.append([[ConfirmResult]](confirmed=[[True]], tool_call=tool_call,\n                                                 rules=tool_call.suggested_rules))\n                confirm_event = [[UserConfirmResultEvent]](reply_id=event.[[reply_id]], confirm_results=results)\n            elif hasattr(event, \"delta\"):\n                print(event.delta, end=\"\", flush=True)"
      },
      "explain": {
        "zh": "没有待交回的批准就读用户输入；请求批准事件里的每个 `tool_call` 都要一条 `ConfirmResult`，打包成带 `reply_id` 的 `UserConfirmResultEvent`，下一轮交回给智能体。",
        "en": "With no approval pending, read the user's input; every `tool_call` in the request event gets a `ConfirmResult`, packed into a `UserConfirmResultEvent` with the `reply_id` and handed back next round."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：加法工具 + 工具箱 + 智能体",
        "en": "Write it: the add tool + toolkit + agent"
      },
      "task": {
        "zh": "模型已经给出。写：\n1. 工具函数 `add(a: float, b: float) -> ToolChunk`：docstring 第一行写作用，`Args:` 下说明两个参数，`Returns:` 下说明返回值；返回 `ToolChunk(content=[TextBlock(text=...)])`\n2. 工具箱：内置的 `Read()` 加上用 `FunctionTool` 包好的 `add`\n3. 创建 `Agent`，用 `toolkit=` 把工具箱交给它",
        "en": "The model is given. Write:\n1. the tool `add(a: float, b: float) -> ToolChunk`: the docstring's first line says what it does, `Args:` covers both parameters, `Returns:` the return value; it returns `ToolChunk(content=[TextBlock(text=...)])`\n2. a toolkit: the built-in `Read()` plus `add` wrapped in `FunctionTool`\n3. an `Agent` that receives the toolkit through `toolkit=`"
      },
      "starter": {
        "zh": "from agentscope.agent import Agent\nfrom agentscope.credential import OpenAICredential\nfrom agentscope.message import TextBlock\nfrom agentscope.model import OpenAIChatModel\nfrom agentscope.tool import FunctionTool, Read, ToolChunk, Toolkit\n\nfrom llm import API_KEY, BASE_URL, MODEL\n\nmodel = OpenAIChatModel(model=MODEL, credential=OpenAICredential(api_key=API_KEY, base_url=BASE_URL), stream=True)\n\n# 1. 工具函数 add（docstring 写全）\n\n\n# 2. 工具箱\n\n\n# 3. 智能体\n",
        "en": "from agentscope.agent import Agent\nfrom agentscope.credential import OpenAICredential\nfrom agentscope.message import TextBlock\nfrom agentscope.model import OpenAIChatModel\nfrom agentscope.tool import FunctionTool, Read, ToolChunk, Toolkit\n\nfrom llm import API_KEY, BASE_URL, MODEL\n\nmodel = OpenAIChatModel(model=MODEL, credential=OpenAICredential(api_key=API_KEY, base_url=BASE_URL), stream=True)\n\n# 1. the add tool (with a full docstring)\n\n\n# 2. the toolkit\n\n\n# 3. the agent\n"
      },
      "solution": {
        "zh": "from agentscope.agent import Agent\nfrom agentscope.credential import OpenAICredential\nfrom agentscope.message import TextBlock\nfrom agentscope.model import OpenAIChatModel\nfrom agentscope.tool import FunctionTool, Read, ToolChunk, Toolkit\n\nfrom llm import API_KEY, BASE_URL, MODEL\n\nmodel = OpenAIChatModel(model=MODEL, credential=OpenAICredential(api_key=API_KEY, base_url=BASE_URL), stream=True)\n\n# 1. 工具函数 add（docstring 写全）\ndef add(a: float, b: float) -> ToolChunk:\n    \"\"\"计算两个数字之和。\n\n    Args:\n        a (float): 第一个加数\n        b (float): 第二个加数\n\n    Returns:\n        ToolChunk: 两数之和\n    \"\"\"\n    result = a + b\n    return ToolChunk(content=[TextBlock(text=str(result))])\n\n# 2. 工具箱\ntoolkit = Toolkit(tools=[Read(), FunctionTool(add)])\n\n# 3. 智能体\nagent = Agent(name=\"Friday\", system_prompt=\"你是一个助手，需要时调用工具。\", model=model, toolkit=toolkit)",
        "en": "from agentscope.agent import Agent\nfrom agentscope.credential import OpenAICredential\nfrom agentscope.message import TextBlock\nfrom agentscope.model import OpenAIChatModel\nfrom agentscope.tool import FunctionTool, Read, ToolChunk, Toolkit\n\nfrom llm import API_KEY, BASE_URL, MODEL\n\nmodel = OpenAIChatModel(model=MODEL, credential=OpenAICredential(api_key=API_KEY, base_url=BASE_URL), stream=True)\n\n# 1. the add tool (with a full docstring)\ndef add(a: float, b: float) -> ToolChunk:\n    \"\"\"Add two numbers.\n\n    Args:\n        a (float): the first number\n        b (float): the second number\n\n    Returns:\n        ToolChunk: the sum of the two numbers\n    \"\"\"\n    result = a + b\n    return ToolChunk(content=[TextBlock(text=str(result))])\n\n# 2. the toolkit\ntoolkit = Toolkit(tools=[Read(), FunctionTool(add)])\n\n# 3. the agent\nagent = Agent(name=\"Friday\", system_prompt=\"You are an assistant. Use tools when needed.\", model=model, toolkit=toolkit)"
      },
      "checks": [
        {
          "zh": "`add` 的两个参数都有 `float` 类型标注",
          "en": "Both `add` parameters are annotated `float`",
          "re": "def\\s+add\\s*\\(\\s*a\\s*:\\s*float\\s*,\\s*b\\s*:\\s*float"
        },
        {
          "zh": "docstring 里有 `Args:` 段",
          "en": "The docstring has an `Args:` section",
          "re": "^\\s+Args:\\s*$"
        },
        {
          "zh": "docstring 里有 `Returns:` 段",
          "en": "The docstring has a `Returns:` section",
          "re": "^\\s+Returns:\\s*$"
        },
        {
          "zh": "返回 `ToolChunk(content=[TextBlock(text=...)])`",
          "en": "Returns `ToolChunk(content=[TextBlock(text=...)])`",
          "re": "return\\s+ToolChunk\\(\\s*content\\s*=\\s*\\[\\s*TextBlock\\(\\s*text\\s*="
        },
        {
          "zh": "工具箱里有 `Read()` 和 `FunctionTool(add)`",
          "en": "The toolkit holds `Read()` and `FunctionTool(add)`",
          "re": "Toolkit\\(\\s*tools\\s*=\\s*\\[[^\\]]*Read\\(\\)[^\\]]*FunctionTool\\(\\s*add\\s*\\)|Toolkit\\(\\s*tools\\s*=\\s*\\[[^\\]]*FunctionTool\\(\\s*add\\s*\\)[^\\]]*Read\\(\\)"
        },
        {
          "zh": "`Agent(...)` 传了 `toolkit=`",
          "en": "`Agent(...)` gets `toolkit=`",
          "re": "\\bAgent\\([\\s\\S]*?toolkit\\s*="
        }
      ]
    },
    {
      "title": {
        "zh": "手写：会处理批准请求的流式主循环",
        "en": "Write it: a streaming main loop that handles approvals"
      },
      "task": {
        "zh": "接着上一题（`agent` 已创建，事件类已导入），写 `async def main()` 并启动：\n- 变量 `confirm_event` 先设为 `None`；`while True` 里：是 `None` 就读用户输入（`exit` 退出）并打包成 `Msg`，否则把 `confirm_event` 当输入、再清回 `None`\n- `async for event in agent.reply_stream(inputs)`：遇到 `RequireUserConfirmEvent`，对 `event.tool_calls` 里每个调用追加一条 `ConfirmResult(confirmed=True, tool_call=..., rules=...)`，再打包成 `UserConfirmResultEvent(reply_id=event.reply_id, confirm_results=...)` 存进 `confirm_event`\n- 其他带 `delta` 的事件照常不换行打印",
        "en": "Continuing from the previous task (`agent` exists, the event classes are imported), write `async def main()` and start it:\n- set `confirm_event = None`; inside `while True`: if it is `None`, read the user's input (`exit` quits) and wrap it in a `Msg`; otherwise use `confirm_event` as the input and reset it to `None`\n- `async for event in agent.reply_stream(inputs)`: on a `RequireUserConfirmEvent`, append one `ConfirmResult(confirmed=True, tool_call=..., rules=...)` per call in `event.tool_calls`, then pack them into `UserConfirmResultEvent(reply_id=event.reply_id, confirm_results=...)` and store it in `confirm_event`\n- print other events that have a `delta` as usual, without newlines"
      },
      "starter": {
        "zh": "import asyncio\n\nfrom agentscope.event import ConfirmResult, RequireUserConfirmEvent, UserConfirmResultEvent\nfrom agentscope.message import Msg, TextBlock\n\n# （agent 在上一题已经创建好）\n\n# 写 main()，再启动它\n",
        "en": "import asyncio\n\nfrom agentscope.event import ConfirmResult, RequireUserConfirmEvent, UserConfirmResultEvent\nfrom agentscope.message import Msg, TextBlock\n\n# (agent was created in the previous task)\n\n# write main(), then start it\n"
      },
      "solution": {
        "zh": "import asyncio\n\nfrom agentscope.event import ConfirmResult, RequireUserConfirmEvent, UserConfirmResultEvent\nfrom agentscope.message import Msg, TextBlock\n\n# （agent 在上一题已经创建好）\n\nasync def main():\n    confirm_event = None\n    while True:\n        if confirm_event is None:\n            user_input = input(\"你：\").strip()\n            if user_input == \"exit\":\n                break\n            inputs = Msg(name=\"user\", role=\"user\", content=[TextBlock(text=user_input)])\n        else:\n            inputs = confirm_event\n            confirm_event = None\n\n        async for event in agent.reply_stream(inputs):\n            if isinstance(event, RequireUserConfirmEvent):\n                confirm_results = []\n                for tool_call in event.tool_calls:\n                    confirm_results.append(\n                        ConfirmResult(confirmed=True, tool_call=tool_call, rules=tool_call.suggested_rules)\n                    )\n                confirm_event = UserConfirmResultEvent(reply_id=event.reply_id, confirm_results=confirm_results)\n            elif hasattr(event, \"delta\"):\n                print(event.delta, end=\"\", flush=True)\n\nasyncio.run(main())",
        "en": "import asyncio\n\nfrom agentscope.event import ConfirmResult, RequireUserConfirmEvent, UserConfirmResultEvent\nfrom agentscope.message import Msg, TextBlock\n\n# (agent was created in the previous task)\n\nasync def main():\n    confirm_event = None\n    while True:\n        if confirm_event is None:\n            user_input = input(\"You: \").strip()\n            if user_input == \"exit\":\n                break\n            inputs = Msg(name=\"user\", role=\"user\", content=[TextBlock(text=user_input)])\n        else:\n            inputs = confirm_event\n            confirm_event = None\n\n        async for event in agent.reply_stream(inputs):\n            if isinstance(event, RequireUserConfirmEvent):\n                confirm_results = []\n                for tool_call in event.tool_calls:\n                    confirm_results.append(\n                        ConfirmResult(confirmed=True, tool_call=tool_call, rules=tool_call.suggested_rules)\n                    )\n                confirm_event = UserConfirmResultEvent(reply_id=event.reply_id, confirm_results=confirm_results)\n            elif hasattr(event, \"delta\"):\n                print(event.delta, end=\"\", flush=True)\n\nasyncio.run(main())"
      },
      "checks": [
        {
          "zh": "`confirm_event` 先设成 `None`",
          "en": "`confirm_event` starts as `None`",
          "re": "confirm_event\\s*=\\s*None"
        },
        {
          "zh": "判断 `confirm_event is None`",
          "en": "Checks `confirm_event is None`",
          "re": "if\\s+confirm_event\\s+is\\s+None\\s*:"
        },
        {
          "zh": "用 `async for ... in agent.reply_stream(...)` 接收事件",
          "en": "Receives events with `async for ... in agent.reply_stream(...)`",
          "re": "async\\s+for\\s+\\w+\\s+in\\s+agent\\.reply_stream\\("
        },
        {
          "zh": "用 `isinstance(..., RequireUserConfirmEvent)` 认出批准请求",
          "en": "Spots the request with `isinstance(..., RequireUserConfirmEvent)`",
          "re": "isinstance\\(\\s*\\w+\\s*,\\s*RequireUserConfirmEvent\\s*\\)"
        },
        {
          "zh": "遍历 `event.tool_calls`",
          "en": "Loops over `event.tool_calls`",
          "re": "for\\s+\\w+\\s+in\\s+\\w+\\.tool_calls\\s*:"
        },
        {
          "zh": "每个调用一条 `ConfirmResult(confirmed=..., tool_call=...)`",
          "en": "One `ConfirmResult(confirmed=..., tool_call=...)` per call",
          "re": "ConfirmResult\\(\\s*confirmed\\s*=[^)]*tool_call\\s*="
        },
        {
          "zh": "打包成带 `reply_id` 的 `UserConfirmResultEvent`",
          "en": "Packs a `UserConfirmResultEvent` with `reply_id`",
          "re": "UserConfirmResultEvent\\(\\s*reply_id\\s*=\\s*\\w+\\.reply_id\\s*,\\s*confirm_results\\s*="
        },
        {
          "zh": "其他事件用 `hasattr(..., \"delta\")` 判断后打印",
          "en": "Other events are printed after `hasattr(..., \"delta\")`",
          "re": "hasattr\\(\\s*\\w+\\s*,\\s*[\"']delta[\"']\\s*\\)"
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "`Toolkit()` 里什么都没放，或者把工具箱建好了却忘了 `Agent(..., toolkit=toolkit)`：智能体手里没有工具。",
      "en": "Leaving `Toolkit()` empty, or building the toolkit but forgetting `Agent(..., toolkit=toolkit)`: the agent has no tools."
    },
    {
      "zh": "`FunctionTool(add())` 多写了括号：交出去的是调用结果（还会因为缺参数报 `TypeError`），要写 `FunctionTool(add)`。",
      "en": "`FunctionTool(add())` with brackets hands over the result of a call (and fails with a `TypeError` for missing arguments); write `FunctionTool(add)`."
    },
    {
      "zh": "不写 docstring，或 `Args:` 格式不是 `名字 (类型): 说明`：模型拿不到说明，可能根本不调用这个工具。",
      "en": "No docstring, or `Args:` lines not in `name (type): description` form: the model gets no description and may never call the tool."
    },
    {
      "zh": "工具里只 `print` 结果、不 `return`：模型收到的是 `null`。",
      "en": "A tool that only `print`s its result without `return`: the model receives `null`."
    },
    {
      "zh": "流式循环里不处理 `RequireUserConfirmEvent`：工具不执行，下一句话报 `ValueError: Agent is waiting for 1 tool calls ...`。",
      "en": "Not handling `RequireUserConfirmEvent` in the stream: the tool never runs and the next message raises `ValueError: Agent is waiting for 1 tool calls ...`."
    },
    {
      "zh": "用非流式的 `agent.reply(...)` 时遇到要批准的工具，回答直接变成 `I'm waiting for your permission or the external execution to finish.`，工具没有执行。",
      "en": "With the non-streaming `agent.reply(...)`, a tool that needs approval turns the answer into `I'm waiting for your permission or the external execution to finish.` and the tool doesn't run."
    },
    {
      "zh": "`UserConfirmResultEvent` 的 `reply_id` 要用请求事件的 `event.reply_id`，每个工具调用都要有一条 `ConfirmResult`。",
      "en": "`UserConfirmResultEvent` needs the request event's `event.reply_id`, and every tool call needs its own `ConfirmResult`."
    },
    {
      "zh": "给 `Read` 相对路径：它只接受绝对路径。在问题或系统提示词里写出完整路径。",
      "en": "Giving `Read` a relative path: it only accepts absolute paths; put the full path in the question or system prompt."
    }
  ],
  "recap": [
    {
      "zh": "大模型只会输出文字；工具让它能和外界交互，由智能体系统解析请求并替它调用。",
      "en": "An LLM only outputs text; tools let it act on the world, with the agent system parsing the request and calling them."
    },
    {
      "zh": "工具箱：`Toolkit(tools=[Read(), FunctionTool(add)])` → `Agent(..., toolkit=toolkit)`；空工具箱没有意义。",
      "en": "Toolkit: `Toolkit(tools=[Read(), FunctionTool(add)])` → `Agent(..., toolkit=toolkit)`; an empty toolkit is pointless."
    },
    {
      "zh": "自定义工具三层：`FunctionTool(函数)`；函数返回 `ToolChunk(content=[TextBlock(text=...)])`（直接返回字符串也行）。",
      "en": "Custom tool, three layers: `FunctionTool(function)`; the function returns `ToolChunk(content=[TextBlock(text=...)])` (a plain string also works)."
    },
    {
      "zh": "docstring 必须写：作用 → 工具描述，`Args:` → 参数说明，类型标注 → 参数类型；没有说明，模型就不会用它。",
      "en": "The docstring is a must: purpose → description, `Args:` → parameter descriptions, type hints → types; without it the model won't use the tool."
    },
    {
      "zh": "非只读的工具要先批准：流式里接住 `RequireUserConfirmEvent`，每个调用一条 `ConfirmResult`，打包成 `UserConfirmResultEvent(reply_id=event.reply_id, ...)`，下一轮交回。",
      "en": "Non-read-only tools need approval: catch `RequireUserConfirmEvent` in the stream, one `ConfirmResult` per call, pack a `UserConfirmResultEvent(reply_id=event.reply_id, ...)` and hand it back next round."
    },
    {
      "zh": "不处理批准请求就会报错；`rules=tool_call.suggested_rules` 让同类调用以后自动允许。",
      "en": "Ignoring an approval request causes an error; `rules=tool_call.suggested_rules` auto-allows similar calls later."
    }
  ],
  "files": [
    {
      "path": "practice/l16_tools_todo.py",
      "zh": "练习：补全 docstring、三层包装、工具箱和处理批准的代码（有 TODO 提示）。",
      "en": "Exercise: complete the docstring, the three layers, the toolkit and the approval handling (with TODO hints)."
    },
    {
      "path": "practice/l16_tools_solution.py",
      "zh": "参考答案：视频的完整实例，`Read` + 自定义 `add`，流式输出并自动批准工具调用。",
      "en": "Solution: the video's complete example – `Read` + a custom `add`, streaming with automatic approval of tool calls."
    },
    {
      "path": "practice/data/l16_secret.txt",
      "zh": "演示读文件用的小文件，里面藏着一句暗号。",
      "en": "A small file for the file-reading demo, hiding a secret phrase."
    }
  ]
});
