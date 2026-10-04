COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l09",
  "priority": "core",
  "handwrite": true,
  "studyMinutes": 55,
  "source": "subtitle",
  "summary": {
    "zh": "这一集是框架的第一次实操，顺序是：安装框架 → 写一个可以 import 的设置文件，把 SDK 的默认设置从 OpenAI 改成自己的模型 → 用 `Runner.run_sync` 跑通第一个例子 → 学 Python 的 async 写法（`async def`、`await`、`asyncio.run`），把例子改成 `await Runner.run(...)` → 用 `Runner.run_streamed` + `async for` 让 Agent 边生成边输出 → 把流式运行的所有事件打印出来，看清 Agent 运行时发生了什么。讲义另外补充了 `asyncio.gather` 并发和不用框架的异步写法。后面的 AgentScope、LangGraph 等章节也到处是 async 代码，这一节是基础。",
    "en": "This episode is the first hands-on session with the framework, in this order: install it → write an importable settings file that switches the SDK's defaults from OpenAI to your own model → run a first example with `Runner.run_sync` → learn Python's async style (`async def`, `await`, `asyncio.run`) and rewrite the example as `await Runner.run(...)` → stream the agent's output with `Runner.run_streamed` + `async for` → print every event of a streamed run to see what happens inside. The notes also add `asyncio.gather` for concurrency and async calls without a framework. Async code appears everywhere later (AgentScope, LangGraph…), so this lesson is a foundation."
  },
  "goals": [
    {
      "zh": "按视频的写法把全局配置放进一个可导入的设置文件，跑通第一个 `Runner.run_sync` 例子",
      "en": "Put the global configuration in an importable settings file, as the video does, and run a first `Runner.run_sync` example"
    },
    {
      "zh": "写出 async 的标准结构：`async def main()` + `await Runner.run(...)` + `asyncio.run(main())`，并知道 `async` 和 `await` 为什么要配对",
      "en": "Write the standard async shape – `async def main()` + `await Runner.run(...)` + `asyncio.run(main())` – and know why `async` and `await` go together"
    },
    {
      "zh": "知道 `Runner.run`、`Runner.run_sync`、`Runner.run_streamed` 的区别和各自的坑",
      "en": "Know how `Runner.run`, `Runner.run_sync` and `Runner.run_streamed` differ, and their traps"
    },
    {
      "zh": "用 `Runner.run_streamed` + `async for` 让 Agent 边生成边输出，用 `print(..., end=\"\", flush=True)` 逐块打印",
      "en": "Stream an agent's answer with `Runner.run_streamed` + `async for`, printing piece by piece with `print(..., end=\"\", flush=True)`"
    },
    {
      "zh": "认识 `stream_events()` 里的三类事件和它们出现的顺序，筛选出回答文字和工具调用事件",
      "en": "Know the three kinds of events in `stream_events()` and the order they arrive in, and pick out the answer text and tool-call events"
    },
    {
      "zh": "（补充）用 `asyncio.gather` 同时运行多个 Agent 或多个请求",
      "en": "(Extra) Run several agents or requests at once with `asyncio.gather`"
    }
  ],
  "blocks": [
    {
      "t": "h",
      "zh": "一、安装和配置：写一个设置文件",
      "en": "1. Install and configure: a settings file"
    },
    {
      "t": "video",
      "zh": "[▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=1) 这一集一开始就进入实操。老师先用 pip 安装框架，然后 [▶ 00:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=32) 写一个**设置文件**，把 SDK 里针对 OpenAI 的默认设置换掉，一共四步：新建一个兼容 OpenAI 接口的客户端（接口地址和 key 提前放在环境变量里，从环境变量读取），设为默认客户端；改用旧的、兼容的 Chat Completions 接口模式（否则 SDK 会按 OpenAI 新的接口去调，兼容的客户端会报错）；[▶ 01:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=94) 关掉 OpenAI 自家的追踪服务；最后 [▶ 02:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=125) 把默认模型名改成自己的（他举例说，用 DeepSeek 的话就填 DeepSeek 的模型名）。\n\n这些设置只在当前程序里生效，不会永久保存，所以他把它们放进一个**能被 import 的文件**，别的脚本一导入就生效。[▶ 02:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=156) 他还提醒：这个文件的名字不能用中文、不能以数字开头，要起一个 Python 能导入的名字。",
      "en": "[▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=1) This episode goes straight into hands-on work. The instructor installs the framework with pip, then [▶ 00:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=32) writes a **settings file** that replaces the SDK's OpenAI-specific defaults in four steps: create an OpenAI-compatible client (address and key stored beforehand in environment variables and read from there) and make it the default client; switch to the older, compatible Chat Completions API mode (otherwise the SDK calls OpenAI's newer API and the compatible client fails); [▶ 01:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=94) turn off OpenAI's own tracing service; and finally [▶ 02:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=125) set the default model name to your own (for DeepSeek, he says, fill in DeepSeek's model name).\n\nThese settings only last for the current program and are not saved anywhere, so he puts them in an **importable file** that takes effect as soon as another script imports it. [▶ 02:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=156) He also warns that this file's name must not be Chinese or start with a digit – pick a name Python can import."
    },
    {
      "t": "p",
      "zh": "框架已经装在课程的 `.venv` 里（openai-agents 0.20.0，安装方法见 [环境准备](#/setup)）。DeepSeek 的客户端在 `llm.py` 里已经建好了（同样是从环境变量 `DEEPSEEK_API_KEY` 读 key），设置文件直接导入它即可。四件事对照如下：\n\n| 设置 | 作用 |\n|---|---|\n| `set_default_openai_client(async_client, use_for_tracing=False)` | 默认使用 DeepSeek 的异步客户端 |\n| `set_default_openai_api(\"chat_completions\")` | 改走 Chat Completions 接口（DeepSeek 不支持 SDK 默认的 Responses 接口） |\n| `set_tracing_disabled(True)` | 不上传追踪记录（我们没有 OpenAI 的 key） |\n| `os.environ[\"OPENAI_DEFAULT_MODEL\"] = MODEL` | `Agent(...)` 不写 `model` 时，SDK 从这个环境变量读模型名 |",
      "en": "The framework is already installed in the course `.venv` (openai-agents 0.20.0; see [Setup](#/setup) for installing). The DeepSeek client already exists in `llm.py` (it, too, reads the key from the `DEEPSEEK_API_KEY` environment variable), so the settings file just imports it. The four steps:\n\n| Setting | Effect |\n|---|---|\n| `set_default_openai_client(async_client, use_for_tracing=False)` | Use DeepSeek's async client by default |\n| `set_default_openai_api(\"chat_completions\")` | Use the Chat Completions API (DeepSeek doesn't support the SDK's default Responses API) |\n| `set_tracing_disabled(True)` | Don't upload traces (we have no OpenAI key) |\n| `os.environ[\"OPENAI_DEFAULT_MODEL\"] = MODEL` | When `Agent(...)` has no `model`, the SDK reads the model name from this environment variable |"
    },
    {
      "t": "code",
      "file": "l09_settings.py",
      "code": {
        "zh": "import os\n\nfrom agents import set_default_openai_api, set_default_openai_client, set_tracing_disabled\nfrom llm import MODEL, async_client     # DeepSeek 的异步客户端，地址和 key 在 llm.py 里\n\nset_default_openai_client(async_client, use_for_tracing=False)   # 1. 默认客户端\nset_default_openai_api(\"chat_completions\")                       # 2. 改走 Chat Completions 接口\nset_tracing_disabled(True)                                       # 3. 关掉追踪上传\nos.environ[\"OPENAI_DEFAULT_MODEL\"] = MODEL                       # 4. 默认模型名",
        "en": "import os\n\nfrom agents import set_default_openai_api, set_default_openai_client, set_tracing_disabled\nfrom llm import MODEL, async_client     # DeepSeek's async client; address and key live in llm.py\n\nset_default_openai_client(async_client, use_for_tracing=False)   # 1. the default client\nset_default_openai_api(\"chat_completions\")                       # 2. use the Chat Completions API\nset_tracing_disabled(True)                                       # 3. no trace upload\nos.environ[\"OPENAI_DEFAULT_MODEL\"] = MODEL                       # 4. the default model name"
      }
    },
    {
      "t": "py",
      "title": {
        "zh": "import 一个文件时发生了什么",
        "en": "What happens when you import a file"
      },
      "zh": "`import l09_settings` 会在当前文件夹里找到 `l09_settings.py`，**把它从头到尾执行一遍**。所以设置文件里的四行设置，在 import 的那一刻就生效了。\n\n三个细节：\n- 同一个程序里，同一个模块只执行**一次**；再 import 只是拿到已经执行过的那个模块。\n- 编辑器可能把这行 import 显示成灰色（导入了却没用到里面的名字）。视频里也提到了：不用管，我们要的就是「执行一遍」这个效果。\n- 要被 import 的文件，名字必须能当 Python 名字用：字母、数字、下划线，**不能以数字开头**，也不能有减号和空格。视频里的练习文件用数字开头命名，这样的文件能直接运行，但没法被 import。（中文文件名在 Python 3 里其实能 import，但不推荐。）\n\n用标准库里一个有趣的模块 `this` 看看「import 时执行，而且只执行一次」：",
      "en": "`import l09_settings` finds `l09_settings.py` in the current folder and **runs it from top to bottom**. That is why the four settings take effect at the moment of the import.\n\nThree details:\n- Within one program a module runs only **once**; importing it again just hands you the module that already ran.\n- Your editor may grey out the import line (imported but no name from it is used). The video mentions this too: ignore it – running the file once is exactly what we want.\n- A file you want to import needs a name that works as a Python name: letters, digits and underscores, **not starting with a digit**, no hyphens or spaces. The video's exercise files start with digits; such files run fine directly but cannot be imported. (Chinese file names actually import in Python 3, but they are not recommended.)\n\nUse a fun standard-library module, `this`, to see “runs on import, and only once”:",
      "code": {
        "zh": "import sys\n\nimport this          # 第一次导入：执行 this.py 里的代码，它会打印一段英文的「Python 之禅」\nprint(\"-\" * 30)\nimport this          # 再导入一次：已经执行过了，不会重复执行，什么也不打印\nprint(\"this\" in sys.modules)   # True：导入过的模块都登记在 sys.modules 里",
        "en": "import sys\n\nimport this          # first import: runs the code in this.py, which prints \"The Zen of Python\"\nprint(\"-\" * 30)\nimport this          # import again: it already ran, so nothing runs and nothing is printed\nprint(\"this\" in sys.modules)   # True: every imported module is recorded in sys.modules"
      },
      "note": {
        "zh": "在网页里再点一次 ▶ 运行，连第一个 `import this` 也不会打印了：网页里的 Python 在两次运行之间一直开着，算同一个程序，`this` 早就导入过。刷新页面就能重新看到。",
        "en": "Press ▶ Run a second time in this site and even the first `import this` prints nothing: the in-browser Python stays alive between runs, so it counts as one program and `this` was imported long ago. Reload the page to see it again."
      }
    },
    {
      "t": "h",
      "zh": "二、第一个例子：Runner.run_sync",
      "en": "2. A first example: Runner.run_sync"
    },
    {
      "t": "video",
      "zh": "[▶ 03:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=190) 接着老师新建一个文件：导入框架，再导入设置文件，创建 Agent（没有写模型名），用同步的 `Runner.run_sync` 问一句话。他故意先删掉导入设置的那一行，运行就报各种错（没有 API key、模型名不对、404、超时）；[▶ 03:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=221) 加回来再运行就正常了——模型回答说自己是「由谷歌训练的大语言模型」，因为他这一集接的是谷歌的模型接口。\n\n[▶ 04:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=254) 他还说了两件事：导入设置文件的那一行在编辑器里是灰色的（导入了却没用到里面的名字），不用管；和以前手写的版本比，以前要先建客户端、把参数一个个传进去、再从 `response.choices[0].message.content` 一层层取结果，现在创建 Agent、把问题交给 Runner，直接拿 `result.final_output`，代码短得多。能看到结果，就说明环境准备好了。",
      "en": "[▶ 03:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=190) Next the instructor creates a new file: import the framework, import the settings file, create an agent (with no model name) and ask one question with the synchronous `Runner.run_sync`. He first deletes the settings import on purpose, and the run fails in all sorts of ways (no API key, wrong model name, 404, timeouts); [▶ 03:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=221) with the line back, it works – the model replies that it is “a large language model trained by Google”, because in this episode he is using Google's model API.\n\n[▶ 04:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=254) He makes two more points: the settings import is greyed out in the editor (imported, but no name from it is used) – ignore that; and compared with the hand-written version, where you built a client, passed every parameter yourself and dug the text out of `response.choices[0].message.content`, you now create an agent, hand the question to the Runner and read `result.final_output` – much shorter. Seeing an answer means your environment is ready."
    },
    {
      "t": "code",
      "file": "l09_first_run.py",
      "code": {
        "zh": "from agents import Agent, Runner\n\nimport l09_settings     # 导入设置文件：里面的四行设置在这一刻执行\n\n# 没写 model：用设置文件里定下的默认模型名\nagent = Agent(name=\"助手\", instructions=\"你是一个简洁的中文助手，回答不超过两句话。\")\n\nresult = Runner.run_sync(agent, \"你是谁？\")\nprint(result.final_output)      # 以前要写 response.choices[0].message.content",
        "en": "from agents import Agent, Runner\n\nimport l09_settings     # import the settings file: its four settings run right now\n\n# No model given: the default model name from the settings file is used\nagent = Agent(name=\"assistant\", instructions=\"You are a concise assistant. Answer in at most two sentences.\")\n\nresult = Runner.run_sync(agent, \"Who are you?\")\nprint(result.final_output)      # before, this was response.choices[0].message.content"
      },
      "note": {
        "zh": "两个文件都在 `practice` 文件夹里，运行 `l09_first_run.py` 即可（本地用 DeepSeek 实测可以运行）。把 `import l09_settings` 那一行注释掉再运行，SDK 就回到 OpenAI 的默认设置，报 `OpenAIError: Missing credentials ... OPENAI_API_KEY`（视频里是 404、超时之类的错误，原因相同）。框架代码不能在网页里运行。",
        "en": "Both files are in the `practice` folder; run `l09_first_run.py` (tested locally against DeepSeek). Comment out the `import l09_settings` line and run again: the SDK falls back to OpenAI's defaults and fails with `OpenAIError: Missing credentials ... OPENAI_API_KEY` (the video gets 404s and timeouts instead – same cause). Framework code can't run in the browser."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "`l09_first_run.py` 里的 Agent 没有写 `model`，它为什么能用 DeepSeek？",
        "en": "The agent in `l09_first_run.py` has no `model`. Why does it still use DeepSeek?"
      },
      "options": [
        {
          "zh": "SDK 会自动识别电脑上装了哪个模型",
          "en": "The SDK detects which model is installed on the computer"
        },
        {
          "zh": "`Agent` 默认就是 DeepSeek",
          "en": "`Agent` defaults to DeepSeek"
        },
        {
          "zh": "`import l09_settings` 时设好了默认客户端、Chat Completions 接口和默认模型名",
          "en": "`import l09_settings` set the default client, the Chat Completions API and the default model name"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "导入设置文件时，那四行全局设置就执行了。删掉这行 import，SDK 会回到 OpenAI 的默认设置并报错。",
        "en": "Importing the settings file runs the four global settings. Remove the import and the SDK falls back to OpenAI's defaults and fails."
      }
    },
    {
      "t": "note",
      "zh": "课程练习的约定：后面的练习文件大多不用设置文件，而是像 08 节那样给每个 Agent 写 `model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)`，再加一行 `set_tracing_disabled(True)`。两种写法效果一样：设置文件是「一次配置，全局生效」，`OpenAIChatCompletionsModel` 是「每个 Agent 自己写清楚用哪个模型」。看视频时遇到 `import` 设置文件的写法，就知道它在做什么。",
      "en": "Course convention: most later practice files don't use a settings file; like lesson 08, each agent gets `model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)` plus one `set_tracing_disabled(True)` line. Both behave the same: the settings file is “configure once, applies everywhere”, while `OpenAIChatCompletionsModel` is “each agent states its own model”. When the video imports its settings file, you now know what it does."
    },
    {
      "t": "h",
      "zh": "三、async 写法：Runner.run",
      "en": "3. The async style: Runner.run"
    },
    {
      "t": "video",
      "zh": "[▶ 05:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=350) 老师说接下来必须先掌握 async：后面的流式传输、和工具更复杂的配合、MCP，基本都要用异步写法。[▶ 06:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=381) 他先单独讲语法：定义 `async def main()`，在里面 `await asyncio.sleep(...)`——`await` 后面跟的是协程，也就是「可等待的对象」。[▶ 07:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=443) 他演示 `async` 和 `await` 要配合使用：去掉 `await`，编辑器提示这个协程没有被等待；函数前面不写 `async` 却在里面写 `await`，直接报错。[▶ 07:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=475) 在函数里写一句打印，直接运行文件没有任何输出；在后面写 `main()` 调用也不行；必须用 `asyncio.run(main())` 启动，打印才出现。他建议想多了解，可以去看 Python 官方教程里 async / await 的部分。\n\n[▶ 08:57](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=537) 然后把开头那个 `run_sync` 例子搬进 `async def main()`：`run_sync` 改成 `run`，前面加 `await`。[▶ 10:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=600) 他特别提到：创建 Agent 这种普通代码放在函数里外都可以，**只有 `await` 必须写在 `async def` 里面**。运行结果和同步版本一样，只是从同步变成了异步。",
      "en": "[▶ 05:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=350) The instructor says async comes first: streaming, more complex tool use and MCP later on all need the async style. [▶ 06:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=381) He covers the syntax on its own: define `async def main()` and `await asyncio.sleep(...)` inside it – what follows `await` is a coroutine, an “awaitable object”. [▶ 07:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=443) He shows that `async` and `await` go together: drop the `await` and the editor warns that the coroutine was never awaited; write `await` inside a function without `async` and you get an error. [▶ 07:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=475) A print inside the function shows nothing when you run the file; adding a `main()` call doesn't help either; only `asyncio.run(main())` starts it, and the print appears. For more, he suggests the async / await part of the official Python tutorial.\n\n[▶ 08:57](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=537) He then moves the opening `run_sync` example into `async def main()`: `run_sync` becomes `run`, with `await` in front. [▶ 10:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=600) He stresses that plain code such as creating the agent can live inside or outside the function – **only `await` must be inside `async def`**. The output is the same as the synchronous version; only the style changed."
    },
    {
      "t": "py",
      "title": {
        "zh": "async def、await、asyncio.run",
        "en": "async def, await, asyncio.run"
      },
      "zh": "异步代码只有三个关键词，规则也只有几条（和视频里演示的一样）：\n- `async def 函数名(...)`：定义一个**异步函数**（也叫协程函数）。\n- 调用异步函数**不会**马上执行，只会得到一个「协程对象」，相当于一张还没交出去的任务单——所以单写 `main()` 什么也不打印。\n- `await 协程`：真正运行它，**等它结束**，拿到返回值。`await` 只能写在 `async def` 里面；反过来，在 `async def` 里调用协程却忘了 `await`，它就不会运行（Python 会提示 coroutine was never awaited）。\n- `asyncio.run(main())`：程序的**入口**，启动「事件循环」（负责安排所有异步任务的调度员），运行 `main()` 直到结束。整个程序一般只调用一次。\n\n所以 async 程序几乎都长这样：把要做的事写进 `async def main()`，最后一行 `asyncio.run(main())`。",
      "en": "Async code uses three keywords and a handful of rules (the same ones the video demonstrates):\n- `async def name(...)` defines an **async function** (a coroutine function).\n- Calling it does **not** run it; you only get a “coroutine object”, like a job ticket not yet handed in – which is why a bare `main()` prints nothing.\n- `await coroutine` actually runs it, **waits until it finishes** and gives you the return value. `await` is only allowed inside `async def`; conversely, a coroutine called inside `async def` without `await` never runs (Python warns that the coroutine was never awaited).\n- `asyncio.run(main())` is the program's **entry point**: it starts the “event loop” (the scheduler that juggles all async tasks) and runs `main()` to the end. A program normally calls it once.\n\nSo nearly every async program looks the same: put the work in `async def main()` and finish with `asyncio.run(main())`.",
      "code": {
        "zh": "import asyncio\n\nasync def greet(name):\n    await asyncio.sleep(0.1)          # 要等待的地方写 await\n    return f\"你好，{name}\"\n\nasync def main():\n    print(123)\n    text = await greet(\"小明\")         # await：运行 greet、等它结束、拿到返回值\n    print(text)\n\nc = main()                            # 只造出一个「协程对象」：函数体没执行，123 没有打印\nprint(type(c).__name__)               # coroutine\nc.close()                             # 不用它了，关掉（否则会有 never awaited 警告）\n\nasyncio.run(main())                   # 程序入口：启动事件循环运行 main，这时才打印 123",
        "en": "import asyncio\n\nasync def greet(name):\n    await asyncio.sleep(0.1)          # wherever you wait, write await\n    return f\"Hello, {name}\"\n\nasync def main():\n    print(123)\n    text = await greet(\"Ming\")        # await: run greet, wait for it, take its return value\n    print(text)\n\nc = main()                            # only a \"coroutine object\": the body hasn't run, 123 isn't printed\nprint(type(c).__name__)               # coroutine\nc.close()                             # not needed - close it (or you get a never-awaited warning)\n\nasyncio.run(main())                   # the entry point: start the event loop and run main - now 123 appears"
      }
    },
    {
      "t": "tip",
      "zh": "网页里的 ▶ 运行：浏览器里的 Python 本身已经运行在一个事件循环里，所以运行前会把最外层的 `asyncio.run(main())` 自动换成等价的 `await main()`。你照常写 `asyncio.run(main())` 就行，本地运行时也是这样写。",
      "en": "▶ Run in this site: the in-browser Python already runs inside an event loop, so before running, a top-level `asyncio.run(main())` is automatically turned into the equivalent `await main()`. Just write `asyncio.run(main())` as usual – the same as when you run locally."
    },
    {
      "t": "code",
      "file": "l09_first_async.py",
      "code": {
        "zh": "import asyncio\nfrom agents import Agent, Runner\n\nimport l09_settings     # 设置文件：默认客户端、接口、追踪、默认模型名\n\n# 创建 Agent 是普通代码，放在函数外面也可以\nagent = Agent(name=\"助手\", instructions=\"你是一个简洁的中文助手，回答不超过两句话。\")\n\nasync def main():\n    result = await Runner.run(agent, \"你是谁？\")   # run_sync 改成 run，前面加 await\n    print(result.final_output)\n\nasyncio.run(main())                                # 用 asyncio.run 启动 main",
        "en": "import asyncio\nfrom agents import Agent, Runner\n\nimport l09_settings     # the settings file: default client, API, tracing, default model name\n\n# Creating the agent is plain code - it may stay outside the function\nagent = Agent(name=\"assistant\", instructions=\"You are a concise assistant. Answer in at most two sentences.\")\n\nasync def main():\n    result = await Runner.run(agent, \"Who are you?\")   # run_sync becomes run, with await in front\n    print(result.final_output)\n\nasyncio.run(main())                                    # start main with asyncio.run"
      },
      "note": {
        "zh": "这就是视频里把第一个例子改成 async 的样子，本地文件是 `practice/l09_first_async.py`（用 DeepSeek 实测可以运行）。不想用设置文件的话，像 08 节那样给 Agent 写 `model=OpenAIChatCompletionsModel(...)` 也一样，练习 `practice/l09_async_todo.py` 用的就是这种写法。",
        "en": "This is the video's first example converted to async; the local file is `practice/l09_first_async.py` (tested against DeepSeek). Without a settings file, give the agent `model=OpenAIChatCompletionsModel(...)` as in lesson 08 – the exercise `practice/l09_async_todo.py` does it that way."
      }
    },
    {
      "t": "p",
      "zh": "`Runner` 有三种运行方式：\n\n| 写法 | 是什么 | 怎么用 |\n|---|---|---|\n| `await Runner.run(agent, 输入)` | 异步函数 | 写在 `async def` 里，前面加 `await` |\n| `Runner.run_sync(agent, 输入)` | 同步包装：内部替你启动事件循环再运行 | 写在普通代码里，不用 `await` |\n| `Runner.run_streamed(agent, 输入)` | 流式运行，**马上**返回一个还在运行中的结果 | 不用 `await`，再用 `async for` 读事件（第五部分） |\n\n`run_sync` 用起来最省事，但它要自己启动事件循环，所以在**已经有事件循环在运行**的地方（Jupyter Notebook、`async def` 函数里面）会直接报错。这时改用 `await Runner.run(...)` 就行。",
      "en": "`Runner` can run an agent in three ways:\n\n| Call | What it is | How to use it |\n|---|---|---|\n| `await Runner.run(agent, input)` | An async function | Inside `async def`, with `await` |\n| `Runner.run_sync(agent, input)` | A sync wrapper that starts an event loop for you | In plain code, no `await` |\n| `Runner.run_streamed(agent, input)` | Streams; returns a still-running result **immediately** | No `await`; read events with `async for` (part 5) |\n\n`run_sync` is the easiest, but it starts its own event loop, so it fails wherever **a loop is already running** (Jupyter notebooks, inside an `async def`). Use `await Runner.run(...)` there instead."
    },
    {
      "t": "warn",
      "zh": "在 Jupyter 或 `async def` 里调用 `Runner.run_sync` 会报：`RuntimeError: AgentRunner.run_sync() cannot be called when an event loop is already running.`\n\nJupyter 的单元格里本来就可以直接写 `await`，所以在 Notebook 里写 `result = await Runner.run(agent, \"...\")` 即可，不需要 `asyncio.run`。",
      "en": "Calling `Runner.run_sync` in Jupyter or inside an `async def` raises: `RuntimeError: AgentRunner.run_sync() cannot be called when an event loop is already running.`\n\nJupyter cells already allow a bare `await`, so in a notebook just write `result = await Runner.run(agent, \"...\")` – no `asyncio.run` needed."
    },
    {
      "t": "check",
      "q": {
        "zh": "忘了写 `await`：`result = Runner.run(agent, \"你好\")`，接着 `print(result.final_output)`，会怎样？",
        "en": "You forget `await`: `result = Runner.run(agent, \"hi\")`, then `print(result.final_output)`. What happens?"
      },
      "options": [
        {
          "zh": "正常打印回答",
          "en": "The answer is printed"
        },
        {
          "zh": "打印 None",
          "en": "It prints None"
        },
        {
          "zh": "报错：'coroutine' object has no attribute 'final_output'",
          "en": "An error: 'coroutine' object has no attribute 'final_output'"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "不 await，`Runner.run(...)` 只返回一个协程对象，Agent 根本没运行，协程对象上当然没有 `final_output`。",
        "en": "Without `await`, `Runner.run(...)` only returns a coroutine object; the agent never ran, so there is no `final_output`."
      }
    },
    {
      "t": "h",
      "zh": "四、补充：用 asyncio.gather 让几件事同时进行",
      "en": "4. Extra: several things at once with asyncio.gather"
    },
    {
      "t": "note",
      "zh": "**补充 / Extra**：视频这一集没有演示并发。讲义补充它，是因为 async 最直接的好处就是让几个请求一起等，后面多 Agent 分工时也用得上。赶时间可以先跳到第五部分。",
      "en": "**Extra**: the video doesn't show concurrency. These notes add it because the most direct payoff of async is letting several requests wait together, which also helps once several agents split the work. Short on time? Skip to part 5."
    },
    {
      "t": "p",
      "zh": "调用一次模型，通常要等 1 到 10 秒。这段时间里你的程序其实什么也没干，只是在**等网络**。\n\n打个比方：你煮一锅水要 5 分钟。**同步**的做法是站在锅前一直盯着，水开了再去切菜；**异步**的做法是开火以后先去切菜，水开了再回来。活儿没变少，但总时间短多了。\n\n放到 Agent 程序里：\n- 要同时问好几个 Agent，同步写法是一个接一个，总时间是它们的**和**；异步写法让它们一起等，总时间约等于**最慢的那个**。\n- 做网页服务时，一个用户在等模型回复，异步的服务器可以同时接待别的用户。\n\n先不碰模型，用 `sleep` 模拟「等网络」，感受一下差别：",
      "en": "One model call usually takes 1–10 seconds, and during that time your program does nothing but **wait on the network**.\n\nAn analogy: boiling water takes 5 minutes. The **synchronous** way is to stand and stare at the pot, then chop vegetables once it boils; the **asynchronous** way is to light the stove, chop while you wait, and come back when it boils. Same work, much less total time.\n\nFor agent programs:\n- Asking several agents synchronously goes one after another, so the total is the **sum**; asynchronously they wait together, so the total is roughly **the slowest one**.\n- In a web service, while one user waits for the model, an async server can serve other users.\n\nNo model yet – `sleep` stands in for “waiting on the network”:"
    },
    {
      "t": "code",
      "file": "sync_vs_async.py",
      "run": true,
      "code": {
        "zh": "import asyncio\nimport time\n\ndef fake_call_sync(name):\n    time.sleep(0.5)                 # 模拟等待模型回复：这段时间程序什么也干不了\n    return f\"{name} 完成\"\n\nasync def fake_call(name):\n    await asyncio.sleep(0.5)        # 也是等 0.5 秒，但等的时候可以先去处理别的任务\n    return f\"{name} 完成\"\n\n# 同步：一个接一个，3 × 0.5 秒\nstart = time.perf_counter()         # 记下当前时刻（秒）；结束时再取一次，相减就是用时\nfor n in [\"A\", \"B\", \"C\"]:\n    print(fake_call_sync(n))\nprint(f\"同步用时：{time.perf_counter() - start:.1f} 秒\")   # :.1f 表示保留 1 位小数\n\n# 异步：三个一起等，总共约 0.5 秒\nasync def main():\n    start = time.perf_counter()\n    results = await asyncio.gather(fake_call(\"A\"), fake_call(\"B\"), fake_call(\"C\"))\n    print(results)\n    print(f\"异步并发用时：{time.perf_counter() - start:.1f} 秒\")\n\nasyncio.run(main())",
        "en": "import asyncio\nimport time\n\ndef fake_call_sync(name):\n    time.sleep(0.5)                 # pretend to wait for the model: the program can do nothing else\n    return f\"{name} done\"\n\nasync def fake_call(name):\n    await asyncio.sleep(0.5)        # also waits 0.5 s, but other tasks can run meanwhile\n    return f\"{name} done\"\n\n# Synchronous: one after another, 3 x 0.5 s\nstart = time.perf_counter()         # the current moment in seconds; read it again at the end and subtract\nfor n in [\"A\", \"B\", \"C\"]:\n    print(fake_call_sync(n))\nprint(f\"sync took {time.perf_counter() - start:.1f} s\")   # :.1f means one decimal place\n\n# Asynchronous: all three wait together, about 0.5 s in total\nasync def main():\n    start = time.perf_counter()\n    results = await asyncio.gather(fake_call(\"A\"), fake_call(\"B\"), fake_call(\"C\"))\n    print(results)\n    print(f\"async (concurrent) took {time.perf_counter() - start:.1f} s\")\n\nasyncio.run(main())"
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "三个请求各要等 2 秒。用 `asyncio.gather` 并发执行，总时间大约是？",
        "en": "Three requests each wait 2 seconds. Run concurrently with `asyncio.gather`, the total is about:"
      },
      "options": [
        {
          "zh": "6 秒",
          "en": "6 seconds"
        },
        {
          "zh": "2 秒",
          "en": "2 seconds"
        },
        {
          "zh": "0 秒",
          "en": "0 seconds"
        },
        {
          "zh": "18 秒",
          "en": "18 seconds"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "三个请求是一起等的，总时间约等于最慢的那一个，也就是 2 秒左右。",
        "en": "They wait together, so the total is about the slowest one – roughly 2 seconds."
      }
    },
    {
      "t": "p",
      "zh": "async 真正的好处在**并发**：`asyncio.gather(协程1, 协程2, ...)` 把几个任务同时交给事件循环，等它们**全部**完成后，按**传入的顺序**返回一个结果列表。\n\n下面让三个不同的 Agent 同时工作。本地用 DeepSeek 实际运行了几次，三个一起用时 2 到 4 秒，和单独跑最慢的那一个差不多：",
      "en": "The real payoff of async is **concurrency**: `asyncio.gather(coro1, coro2, ...)` hands several tasks to the event loop at once, waits until **all** are done, and returns a list of results in the **order you passed them**.\n\nBelow, three different agents work at the same time. In several local runs against DeepSeek, all three together took 2 to 4 seconds – about as long as the slowest one alone:"
    },
    {
      "t": "code",
      "file": "gather_agents.py",
      "code": {
        "zh": "import asyncio\nimport time\nfrom agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nmodel = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)\ntranslator = Agent(name=\"翻译\", instructions=\"把用户的话翻译成英文，只输出译文。\", model=model)\npoet = Agent(name=\"诗人\", instructions=\"根据主题写一句不超过 20 个字的中文短诗。\", model=model)\nexplainer = Agent(name=\"解释员\", instructions=\"用一句话向小学生解释用户给的词。\", model=model)\n\nasync def main():\n    start = time.perf_counter()\n    results = await asyncio.gather(          # 三个 Agent 同时工作\n        Runner.run(translator, \"秋天来了\"),\n        Runner.run(poet, \"秋天\"),\n        Runner.run(explainer, \"秋分\"),\n    )\n    for r in results:                        # 结果顺序 = 传入顺序\n        print(f\"{r.last_agent.name}: {r.final_output}\")\n    print(f\"用时 {time.perf_counter() - start:.1f} 秒\")\n\nasyncio.run(main())",
        "en": "import asyncio\nimport time\nfrom agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nmodel = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)\ntranslator = Agent(name=\"translator\", instructions=\"Translate the user's text into English. Output only the translation.\", model=model)\npoet = Agent(name=\"poet\", instructions=\"Write a one-line poem of at most 12 words on the topic.\", model=model)\nexplainer = Agent(name=\"explainer\", instructions=\"Explain the user's word to a child in one sentence.\", model=model)\n\nasync def main():\n    start = time.perf_counter()\n    results = await asyncio.gather(          # three agents working at the same time\n        Runner.run(translator, \"秋天来了\"),\n        Runner.run(poet, \"autumn\"),\n        Runner.run(explainer, \"equinox\"),\n    )\n    for r in results:                        # results come back in the order you passed them\n        print(f\"{r.last_agent.name}: {r.final_output}\")\n    print(f\"took {time.perf_counter() - start:.1f} s\")\n\nasyncio.run(main())"
      }
    },
    {
      "t": "py",
      "title": {
        "zh": "asyncio.gather 和 * 拆包",
        "en": "asyncio.gather and * unpacking"
      },
      "zh": "`asyncio.gather` 的要点：\n- 参数是**一个个协程**，不是列表：`gather(a(), b(), c())`。\n- 返回值是列表，顺序和**传入顺序**一致，和谁先完成无关。\n- 要先 `await` 才能拿到结果。\n\n如果协程已经放在一个列表 `tasks` 里，就写 `gather(*tasks)`：`*` 把列表**拆开**，变成一个个单独的参数（和 05 节用 `**` 把字典拆成关键字参数是一个道理）。",
      "en": "Key points of `asyncio.gather`:\n- its arguments are **individual coroutines**, not a list: `gather(a(), b(), c())`.\n- it returns a list in the **order you passed them**, regardless of which finishes first.\n- you must `await` it to get the results.\n\nIf the coroutines are already in a list `tasks`, write `gather(*tasks)`: `*` **unpacks** the list into separate arguments (the same idea as `**` unpacking a dict into keyword arguments in lesson 05).",
      "code": {
        "zh": "import asyncio\n\nasync def ask(question, seconds):\n    await asyncio.sleep(seconds)              # 模拟：不同问题等待的时间不同\n    return f\"答案（{question}）\"\n\nasync def main():\n    # 1. 直接把几个协程传给 gather\n    a, b = await asyncio.gather(ask(\"问题1\", 0.3), ask(\"问题2\", 0.1))\n    print(a, b)                               # 问题2 先完成，但结果仍按传入顺序\n\n    # 2. 问题很多时，先用列表推导式（06 节）准备好，再用 * 拆开传进去\n    questions = [\"天气\", \"新闻\", \"股票\"]\n    tasks = [ask(q, 0.1) for q in questions]\n    answers = await asyncio.gather(*tasks)    # 等价于 gather(tasks[0], tasks[1], tasks[2])\n    print(answers)                            # 一个列表\n\nasyncio.run(main())",
        "en": "import asyncio\n\nasync def ask(question, seconds):\n    await asyncio.sleep(seconds)              # pretend different questions take different times\n    return f\"answer ({question})\"\n\nasync def main():\n    # 1. pass several coroutines straight to gather\n    a, b = await asyncio.gather(ask(\"q1\", 0.3), ask(\"q2\", 0.1))\n    print(a, b)                               # q2 finishes first, but results keep the order you passed\n\n    # 2. with many questions, build them with a list comprehension (lesson 06), then unpack with *\n    questions = [\"weather\", \"news\", \"stocks\"]\n    tasks = [ask(q, 0.1) for q in questions]\n    answers = await asyncio.gather(*tasks)    # same as gather(tasks[0], tasks[1], tasks[2])\n    print(answers)                            # a list\n\nasyncio.run(main())"
      }
    },
    {
      "t": "warn",
      "zh": "在 async 代码里**不要**用 `time.sleep()`：它会让整个事件循环停下来，所有任务都跟着卡住，并发就没了。要等待就用 `await asyncio.sleep(秒数)`。同理，`async def` 里调用模型要用 `async_client`，不要用同步的 `client`。",
      "en": "Do **not** use `time.sleep()` in async code: it freezes the whole event loop, every task stalls, and the concurrency is gone. Use `await asyncio.sleep(seconds)`. Likewise, inside `async def` call the model with `async_client`, not the synchronous `client`."
    },
    {
      "t": "h",
      "zh": "五、流式传输：Runner.run_streamed",
      "en": "5. Streaming: Runner.run_streamed"
    },
    {
      "t": "video",
      "zh": "[▶ 11:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=664) 学会 async 之后，老师马上用它做流式传输：边生成边输出（04 集讲过），而 Agent 的流式输出必须用异步写法。[▶ 12:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=726) 他新建一个文件，先用普通写法让 Agent 讲一个至少 300 字的故事：要等全部生成完才一次性输出，用户可能等得不耐烦。[▶ 12:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=756) 于是改用 `Runner.run_streamed(...)`，并特意指出这里**不要 await**——它返回的不是协程，只是一个对象，这时还没有开始输出。[▶ 13:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=786) 接着用 `async for event in result.stream_events()` 一个个取事件，[▶ 13:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=817) 只要 `event.type == \"raw_response_event\"`（来自大模型的原始响应）就打印 `event.data.delta`，每次只打印新增的那一小段。[▶ 14:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=879) 他解释：除了来自大模型的事件，还有来自 Runner 的事件（工具调用、Agent 交接等），这个框架是「事件驱动」的；这些先不管，注释掉。\n\n[▶ 16:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=974) 运行时报错了：最先到的原始事件是「响应已创建」，它没有 `delta`。[▶ 16:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=1006) 他到 `openai.types.responses` 里找文本相关的事件类型，看到「文本片段」和「文本完成」两种，于是导入 `ResponseTextDeltaEvent`，用 `isinstance` 只留下文字片段。[▶ 17:27](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=1047) 再运行，故事就一点一点地出现了。",
      "en": "[▶ 11:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=664) With async in hand, the instructor uses it for streaming right away: print while generating (covered in episode 04) – and an agent's streamed output requires the async style. [▶ 12:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=726) In a new file he first asks the agent, the ordinary way, for a story of at least 300 characters: everything is printed at once at the end, and users may lose patience waiting. [▶ 12:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=756) So he switches to `Runner.run_streamed(...)` and stresses that it takes **no await** – it returns not a coroutine but an object, and nothing has been printed yet. [▶ 13:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=786) He then reads the events one by one with `async for event in result.stream_events()`, [▶ 13:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=817) printing `event.data.delta` whenever `event.type == \"raw_response_event\"` (a raw response from the model) – only the newly added piece each time. [▶ 14:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=879) Besides the model's events, he explains, there are events from the Runner (tool calls, agent handoffs…) – the framework is “event-driven” – but he leaves those aside and comments them out.\n\n[▶ 16:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=974) The run fails: the first raw event is “response created”, which has no `delta`. [▶ 16:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=1006) He looks through the text-related event types in `openai.types.responses`, finds a “text delta” and a “text done” event, imports `ResponseTextDeltaEvent` and keeps only text pieces with `isinstance`. [▶ 17:27](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=1047) Run again, and the story appears bit by bit."
    },
    {
      "t": "p",
      "zh": "不开流式时，要等模型**全部**写完才能看到回答，长回答可能要等十几秒。**流式传输**让服务器每生成一小段就发过来一段，用户很快就能看到第一个字——总时间差不多，体验好得多。04 节你用 `stream=True` 写过同步的流式输出；Agent 的流式输出要用异步写法，先准备两个工具：`print` 的 `end` / `flush` 参数，和 `async for`。",
      "en": "Without streaming you see nothing until the model has written **everything**, which can take over ten seconds for a long answer. **Streaming** makes the server send each small piece as soon as it is generated, so the first words appear quickly – the total time is about the same, but it feels far better. In lesson 04 you streamed synchronously with `stream=True`; streaming an agent needs the async style, so first get two tools ready: `print`'s `end` / `flush` arguments, and `async for`."
    },
    {
      "t": "py",
      "title": {
        "zh": "print 的 flush（顺便复习 end、sep）",
        "en": "print's flush (plus a review of end and sep)"
      },
      "zh": "`print` 的 `end` 和 `sep` 在 04 节的 Python 小课堂里见过。流式打印要同时用两个参数：\n- `end=\"\"`：结尾什么也不加，下一段接在同一行后面（04 节学过）\n- `flush=True`：立刻显示。不加的话，Python 可能先把文字攒在缓冲区里，攒够了才一起显示，流式效果就没了\n\n代码最后三行复习 `end` 和 `sep`（`sep` 是多个值之间的分隔符，默认是一个空格）。",
      "en": "You met `print`'s `end` and `sep` in the Python mini-lesson of lesson 04. Streaming needs two arguments together:\n- `end=\"\"`: add nothing at the end, so the next piece continues on the same line (from lesson 04)\n- `flush=True`: show it right now. Otherwise Python may hold text in a buffer and show it in bursts, which ruins the streaming effect\n\nThe last three lines of the code review `end` and `sep` (`sep` goes between several values; a space by default).",
      "code": {
        "zh": "import time\n\npieces = [\"流式\", \"输出\", \"就是\", \"一块\", \"一块\", \"地打印。\"]\nfor p in pieces:\n    print(p, end=\"\", flush=True)   # end=\"\": 结尾不换行；flush=True: 马上显示，不攒着\n    time.sleep(0.15)               # 模拟网络上一块一块地到达\nprint()                            # 全部打完，补一个换行\n\nprint(\"默认\", \"结尾\", \"是换行\")\nprint(\"改成\", \"感叹号\", end=\"！\\n\")\nprint(\"A\", \"B\", \"C\", sep=\"-\")      # sep 是多个值之间的分隔符，默认是空格",
        "en": "import time\n\npieces = [\"Stream\", \"ing \", \"means \", \"printing \", \"piece by \", \"piece.\"]\nfor p in pieces:\n    print(p, end=\"\", flush=True)   # end=\"\": no newline at the end; flush=True: show it now\n    time.sleep(0.15)               # pretend the pieces arrive over the network\nprint()                            # all done - add the newline\n\nprint(\"by default\", \"it ends\", \"with a newline\")\nprint(\"now with\", \"a bang\", end=\"!\\n\")\nprint(\"A\", \"B\", \"C\", sep=\"-\")      # sep goes between values; the default is a space"
      },
      "note": {
        "zh": "在网页里点 ▶ 运行时，`time.sleep` 会让页面暂时停住，这几段文字可能一起出现；复制到本地终端里运行，才能看到一段一段出现的效果。",
        "en": "When you press ▶ Run in this site, `time.sleep` pauses the page, so the pieces may appear all at once; run it in a local terminal to see them appear one by one."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "流式打印时写成 `print(piece)`（没有 `end` 和 `flush`），会看到什么？",
        "en": "What do you see if you stream with plain `print(piece)` (no `end`, no `flush`)?"
      },
      "options": [
        {
          "zh": "每一小段单独占一行，回答被切得七零八落",
          "en": "Each small piece on its own line, the answer chopped up"
        },
        {
          "zh": "和加了参数完全一样",
          "en": "Exactly the same as with the arguments"
        },
        {
          "zh": "什么都不显示",
          "en": "Nothing at all"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "`print` 默认以换行结尾。用 `end=\"\"` 让各段接在一起，用 `flush=True` 让每段马上出现。",
        "en": "`print` ends with a newline by default. `end=\"\"` joins the pieces and `flush=True` shows each one at once."
      }
    },
    {
      "t": "p",
      "zh": "**`async for`** 和普通 `for` 一样是循环，区别是：每取下一项之前都要**等一等**（下一块数据还在网络上），等的时候事件循环可以去忙别的。数据一块一块从网络上到达，就用 `async for`；和 `await` 一样，它只能写在 `async def` 里面。\n\n下面是视频这个例子的 DeepSeek 版（为了省 token，故事改成 100 字以内）：",
      "en": "**`async for`** is a loop like `for`, except that it **waits** before each next item (the next chunk is still on the network), and the event loop can do other work meanwhile. When data arrives piece by piece over the network, use `async for`; like `await`, it only works inside `async def`.\n\nHere is the video's example on DeepSeek (with a story of under 80 words, to save tokens):"
    },
    {
      "t": "code",
      "file": "stream_agent.py",
      "code": {
        "zh": "import asyncio\nfrom agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom openai.types.responses import ResponseTextDeltaEvent\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nagent = Agent(\n    name=\"讲故事的人\",\n    instructions=\"你会讲简短有趣的小故事。\",\n    model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),\n)\n\nasync def main():\n    result = Runner.run_streamed(agent, \"讲一个 100 字以内的小猫故事。\")   # 注意：没有 await\n    async for event in result.stream_events():\n        if event.type == \"raw_response_event\" and isinstance(event.data, ResponseTextDeltaEvent):\n            print(event.data.delta, end=\"\", flush=True)                    # 一小段回答文字\n    print()\n    print(\"完整回答：\", result.final_output)                                # 流读完后才完整\n\nasyncio.run(main())",
        "en": "import asyncio\nfrom agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom openai.types.responses import ResponseTextDeltaEvent\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nagent = Agent(\n    name=\"storyteller\",\n    instructions=\"You tell short, fun stories.\",\n    model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),\n)\n\nasync def main():\n    result = Runner.run_streamed(agent, \"Tell a cat story in under 80 words.\")   # note: no await\n    async for event in result.stream_events():\n        if event.type == \"raw_response_event\" and isinstance(event.data, ResponseTextDeltaEvent):\n            print(event.data.delta, end=\"\", flush=True)                         # a small piece of the answer\n    print()\n    print(\"full answer:\", result.final_output)                                   # complete only after the stream\n\nasyncio.run(main())"
      }
    },
    {
      "t": "p",
      "zh": "和前面的写法比，有三处不同：\n1. `Runner.run_streamed(...)` **不加 await**，它马上返回一个 `RunResultStreaming` 对象，Agent 在后台开始运行。\n2. `result.stream_events()` 是一串**事件**，用 `async for` 一个个读出来。\n3. 读完以后 `result.final_output` 才是完整的回答。\n\n事件分三种，用 `event.type` 区分：\n\n| `event.type` | 是什么 | 常用字段 |\n|---|---|---|\n| `raw_response_event` | 模型输出的**原始小片段**：一小段回答、一小段工具参数、一小段思考过程…… | `event.data`（看它的类型判断是哪一种） |\n| `run_item_stream_event` | **完整的一步**完成了：工具被调用、工具返回结果、回答写完…… | `event.name`、`event.item` |\n| `agent_updated_stream_event` | 当前负责的 Agent 变了（开始运行时，或发生交接时） | `event.new_agent` |",
      "en": "Compared with before, three things change:\n1. `Runner.run_streamed(...)` takes **no await**; it returns a `RunResultStreaming` object at once while the agent starts running in the background.\n2. `result.stream_events()` is a series of **events** you read one by one with `async for`.\n3. Only after that does `result.final_output` hold the complete answer.\n\nThere are three kinds of events, told apart by `event.type`:\n\n| `event.type` | What it is | Useful fields |\n|---|---|---|\n| `raw_response_event` | A **raw small piece** of model output: a bit of answer, a bit of tool arguments, a bit of thinking… | `event.data` (its type tells you which) |\n| `run_item_stream_event` | **A whole step** finished: a tool was called, a tool returned, the answer is done… | `event.name`, `event.item` |\n| `agent_updated_stream_event` | The agent in charge changed (at the start, or on a handoff) | `event.new_agent` |"
    },
    {
      "t": "warn",
      "zh": "`Runner.run_streamed` 的三个易错点：\n1. **不要 await 它**：`await Runner.run_streamed(...)` 会报 `TypeError: object RunResultStreaming can't be used in 'await' expression`。\n2. **要用 `async for`**：写成普通的 `for event in result.stream_events()` 会报 `'async_generator' object is not iterable`。\n3. **`final_output` 要等流读完**：`async for` 循环结束以后，`result.final_output` 才是完整的回答。",
      "en": "Three traps with `Runner.run_streamed`:\n1. **Don't await it**: `await Runner.run_streamed(...)` raises `TypeError: object RunResultStreaming can't be used in 'await' expression`.\n2. **Use `async for`**: a plain `for event in result.stream_events()` raises `'async_generator' object is not iterable`.\n3. **`final_output` waits for the stream**: only after the `async for` loop ends is `result.final_output` complete."
    },
    {
      "t": "check",
      "q": {
        "zh": "只想把 Agent 的回答文字逐段打印出来（不要思考过程和工具参数），应该筛选哪种事件？",
        "en": "To print only the agent's answer text piece by piece (no thinking, no tool arguments), which events do you keep?"
      },
      "options": [
        {
          "zh": "`event.type == \"agent_updated_stream_event\"`",
          "en": "`event.type == \"agent_updated_stream_event\"`"
        },
        {
          "zh": "所有 `raw_response_event`",
          "en": "Every `raw_response_event`"
        },
        {
          "zh": "`raw_response_event` 并且 `event.data` 是 `ResponseTextDeltaEvent`",
          "en": "`raw_response_event` whose `event.data` is a `ResponseTextDeltaEvent`"
        },
        {
          "zh": "`run_item_stream_event` 里的 `tool_output`",
          "en": "`tool_output` among the `run_item_stream_event`s"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "`raw_response_event` 里还混着思考过程和工具参数的片段，要再用 `isinstance(event.data, ResponseTextDeltaEvent)` 筛出回答文字。",
        "en": "`raw_response_event`s also carry pieces of thinking and tool arguments, so filter with `isinstance(event.data, ResponseTextDeltaEvent)` to keep the answer text."
      }
    },
    {
      "t": "h",
      "zh": "六、把所有事件都打印出来",
      "en": "6. Print every event"
    },
    {
      "t": "video",
      "zh": "[▶ 17:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=1078) 为了看清流式运行时到底发生了什么，老师把每个事件的类型和内容都打印出来（有的事件没有 `data`，他干脆直接打印整个事件）。[▶ 19:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=1140) 然后逐个解释：最先是 Agent 更新事件——这个 Agent「进入状态、开始工作」了；框架是按多 Agent 设计的，Agent 之间可以交接，所以每换一个 Agent 都会发这个事件。[▶ 20:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=1202) 接着是来自大模型的原始事件：响应已创建 → 新增一个输出项 → 开始输出内容 → 一大串文字片段；[▶ 20:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=1233) 然后是「这一段内容完整了」的事件，[▶ 21:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=1265) 最后是「响应完成」。[▶ 21:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=1296) 再往后是 Runner 发出的运行事件，表示消息已经生成好了。\n\n他的要点：不用流式时，相当于一直等到最后这些「完成」事件，一次拿到完整结果；流式就是不等到最后，在过程中就参与进来。",
      "en": "[▶ 17:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=1078) To see what really happens during a streamed run, the instructor prints the type and content of every event (some events have no `data`, so he simply prints the whole event). [▶ 19:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=1140) Then he walks through them: first an agent-updated event – the agent has “started work”; the framework is built for multiple agents that can hand off to each other, so a new agent in charge always triggers this event. [▶ 20:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=1202) Next come raw events from the model: response created → output item added → content starts → a long run of text pieces; [▶ 20:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=1233) then events saying “this piece of content is complete”, and [▶ 21:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=1265) finally “response completed”. [▶ 21:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=1296) After that come run events from the Runner, saying the message is ready.\n\nHis point: without streaming you effectively wait for those final “done” events and get the whole result at once; streaming means taking part along the way instead of waiting for the end."
    },
    {
      "t": "p",
      "zh": "像视频里那样，把每个事件的种类都打印出来看看。下面的程序把连续出现的同一种事件合并成一行，并数出现了几次（否则一个字一行，太长）。它用的是第一部分的设置文件，所以 Agent 没写 `model`：",
      "en": "As in the video, print the kind of every event. The program below merges consecutive events of the same kind into one line with a count (otherwise there would be a line per piece of text). It uses the settings file from part 1, so the agent has no `model`:"
    },
    {
      "t": "code",
      "file": "l09_events.py",
      "code": {
        "zh": "import asyncio\nfrom agents import Agent, Runner\nimport l09_settings          # 第一部分的设置文件\n\nagent = Agent(name=\"讲故事的人\", instructions=\"你会讲简短有趣的小故事。\")\n\ndef describe(event):\n    \"\"\"把一个事件变成一行简短的说明。\"\"\"\n    if event.type == \"raw_response_event\":           # 模型发来的原始片段\n        return f\"raw_response_event         {type(event.data).__name__}\"\n    if event.type == \"run_item_stream_event\":        # Runner 完成了完整的一步\n        return f\"run_item_stream_event      {event.name}\"\n    return f\"agent_updated_stream_event {event.new_agent.name}\"   # 当前 Agent 变了\n\nasync def main():\n    result = Runner.run_streamed(agent, \"讲一个 50 字以内的小故事。\")\n    previous, count = None, 0\n    async for event in result.stream_events():\n        line = describe(event)\n        if line == previous:        # 和上一个事件是同一种：只计数\n            count += 1\n            continue\n        if previous:\n            print(f\"{previous}  x{count}\")\n        previous, count = line, 1\n    print(f\"{previous}  x{count}\")\n\nasyncio.run(main())",
        "en": "import asyncio\nfrom agents import Agent, Runner\nimport l09_settings          # the settings file from part 1\n\nagent = Agent(name=\"storyteller\", instructions=\"You tell short, fun stories.\")\n\ndef describe(event):\n    \"\"\"Turn one event into a short one-line description.\"\"\"\n    if event.type == \"raw_response_event\":           # raw pieces from the model\n        return f\"raw_response_event         {type(event.data).__name__}\"\n    if event.type == \"run_item_stream_event\":        # the Runner finished a whole step\n        return f\"run_item_stream_event      {event.name}\"\n    return f\"agent_updated_stream_event {event.new_agent.name}\"   # the agent in charge changed\n\nasync def main():\n    result = Runner.run_streamed(agent, \"Tell a story in under 40 words.\")\n    previous, count = None, 0\n    async for event in result.stream_events():\n        line = describe(event)\n        if line == previous:        # same kind as the previous event: just count it\n            count += 1\n            continue\n        if previous:\n            print(f\"{previous}  x{count}\")\n        previous, count = line, 1\n    print(f\"{previous}  x{count}\")\n\nasyncio.run(main())"
      }
    },
    {
      "t": "code",
      "file": "输出 / output",
      "lang": "text",
      "code": {
        "zh": "agent_updated_stream_event 讲故事的人  x1\nraw_response_event         ResponseCreatedEvent  x1\nraw_response_event         ResponseOutputItemAddedEvent  x1\nraw_response_event         ResponseReasoningSummaryPartAddedEvent  x1\nraw_response_event         ResponseReasoningSummaryTextDeltaEvent  x480\nraw_response_event         ResponseReasoningSummaryPartDoneEvent  x1\nraw_response_event         ResponseOutputItemAddedEvent  x1\nraw_response_event         ResponseContentPartAddedEvent  x1\nraw_response_event         ResponseTextDeltaEvent  x14\nraw_response_event         ResponseOutputItemDoneEvent  x1\nraw_response_event         ResponseContentPartDoneEvent  x1\nraw_response_event         ResponseOutputItemDoneEvent  x1\nraw_response_event         ResponseCompletedEvent  x1\nrun_item_stream_event      reasoning_item_created  x1\nrun_item_stream_event      message_output_created  x1",
        "en": "agent_updated_stream_event storyteller  x1\nraw_response_event         ResponseCreatedEvent  x1\nraw_response_event         ResponseOutputItemAddedEvent  x1\nraw_response_event         ResponseReasoningSummaryPartAddedEvent  x1\nraw_response_event         ResponseReasoningSummaryTextDeltaEvent  x480\nraw_response_event         ResponseReasoningSummaryPartDoneEvent  x1\nraw_response_event         ResponseOutputItemAddedEvent  x1\nraw_response_event         ResponseContentPartAddedEvent  x1\nraw_response_event         ResponseTextDeltaEvent  x14\nraw_response_event         ResponseOutputItemDoneEvent  x1\nraw_response_event         ResponseContentPartDoneEvent  x1\nraw_response_event         ResponseOutputItemDoneEvent  x1\nraw_response_event         ResponseCompletedEvent  x1\nrun_item_stream_event      reasoning_item_created  x1\nrun_item_stream_event      message_output_created  x1"
      },
      "note": {
        "zh": "本地用 DeepSeek 实际运行的结果（每次的次数会不一样）。可以看到：第一个原始事件是 `ResponseCreatedEvent`（就是视频里报错的那个，它没有 `delta`）；DeepSeek 会先「思考」，产生几百段 `ResponseReasoningSummaryTextDeltaEvent`；真正的回答只在 `ResponseTextDeltaEvent` 里；以 `Done` 和 `Completed` 结尾的就是视频里说的「完成」事件。视频里老师讲解的事件中没有 Reasoning 这几行。",
        "en": "A real local run against DeepSeek (the counts differ every time). Notice: the first raw event is `ResponseCreatedEvent` (the one that broke the video's first attempt – it has no `delta`); DeepSeek “thinks” first, producing hundreds of `ResponseReasoningSummaryTextDeltaEvent`s; the actual answer is only in the `ResponseTextDeltaEvent`s; the events ending in `Done` and `Completed` are the “done” events the video talks about. The events the instructor walks through in the video have no Reasoning lines."
      }
    },
    {
      "t": "p",
      "zh": "带工具时（比如问「北京现在多少度？」），中间还会多出工具参数的片段 `ResponseFunctionCallArgumentsDeltaEvent`，以及 `run_item_stream_event` 里的 `tool_called`、`tool_output` 两步。\n\n所以只想打印回答时，要同时判断 `event.type == \"raw_response_event\"` **和** `isinstance(event.data, ResponseTextDeltaEvent)`，否则「响应已创建」这类没有 `delta` 的事件会让程序报错，思考过程和工具参数也会混进来。`isinstance(对象, 类)` 判断这个对象是不是由某个类造出来的（类和对象见 08 节）。",
      "en": "With a tool (say, “How warm is Beijing now?”) you also get pieces of the tool arguments, `ResponseFunctionCallArgumentsDeltaEvent`, plus the `tool_called` and `tool_output` steps among the `run_item_stream_event`s.\n\nSo to print only the answer, check `event.type == \"raw_response_event\"` **and** `isinstance(event.data, ResponseTextDeltaEvent)`; otherwise an event without `delta` such as “response created” crashes the program, and thinking and tool arguments sneak in. `isinstance(obj, Class)` tells whether an object was built from a class (classes and objects: lesson 08)."
    },
    {
      "t": "p",
      "zh": "再加上 `run_item_stream_event`，就能在回答之外看到工具调用的过程（完整代码见 `practice/l09_stream_solution.py`）：",
      "en": "Add `run_item_stream_event` and you also see the tool calls alongside the answer (full code: `practice/l09_stream_solution.py`):"
    },
    {
      "t": "code",
      "file": "stream_with_tools.py",
      "code": {
        "zh": "# 这里的 agent 是带 get_temperature 工具的天气助手，导入和定义见 practice/l09_stream_solution.py\nasync def main():\n    result = Runner.run_streamed(agent, \"北京现在多少度？再用三句话说说北京秋天适合去哪玩。\")\n    async for event in result.stream_events():\n        # 1. 回答的文字片段\n        if event.type == \"raw_response_event\" and isinstance(event.data, ResponseTextDeltaEvent):\n            print(event.data.delta, end=\"\", flush=True)\n        # 2. 完整的一步：工具被调用、工具返回结果（前面加 \\n，免得和之前的文字挤在同一行）\n        elif event.type == \"run_item_stream_event\":\n            if event.name == \"tool_called\":\n                print(f\"\\n[调用工具] {event.item.raw_item.name}({event.item.raw_item.arguments})\")\n            elif event.name == \"tool_output\":\n                print(f\"[工具结果] {event.item.output}\")\n    print()\n\n# 本地实际运行的输出（节选）：\n# [调用工具] get_temperature({\"latitude\": 39.9, \"longitude\": 116.4})\n# [工具结果] 14.7°C\n# 北京现在大约 **14.7°C**。 ……（后面的文字一段一段地出现）",
        "en": "# agent here is the weather assistant with the get_temperature tool; imports and definitions: practice/l09_stream_solution.py\nasync def main():\n    result = Runner.run_streamed(agent, \"How warm is Beijing now? Then suggest, in three sentences, where to go there in autumn.\")\n    async for event in result.stream_events():\n        # 1. a piece of the answer text\n        if event.type == \"raw_response_event\" and isinstance(event.data, ResponseTextDeltaEvent):\n            print(event.data.delta, end=\"\", flush=True)\n        # 2. a whole step finished: a tool was called, a tool returned (\\n first, so it doesn't share a line with earlier text)\n        elif event.type == \"run_item_stream_event\":\n            if event.name == \"tool_called\":\n                print(f\"\\n[tool call] {event.item.raw_item.name}({event.item.raw_item.arguments})\")\n            elif event.name == \"tool_output\":\n                print(f\"[tool result] {event.item.output}\")\n    print()\n\n# Real local output (excerpt):\n# [tool call] get_temperature({\"latitude\": 39.9, \"longitude\": 116.4})\n# [tool result] 14.7°C\n# It's about **14.7°C** in Beijing right now. ... (the rest appears piece by piece)"
      }
    },
    {
      "t": "note",
      "zh": "想把 DeepSeek 的思考过程也显示出来？再加一个分支：先 `from openai.types.responses import ResponseReasoningSummaryTextDeltaEvent`，当 `isinstance(event.data, ResponseReasoningSummaryTextDeltaEvent)` 时打印 `event.data.delta`（最好换个颜色或加前缀，和回答区分开）。",
      "en": "Want to show DeepSeek's thinking too? Add one more branch: `from openai.types.responses import ResponseReasoningSummaryTextDeltaEvent`, and when `isinstance(event.data, ResponseReasoningSummaryTextDeltaEvent)` print `event.data.delta` (ideally with a prefix or another colour so it stands apart from the answer)."
    },
    {
      "t": "h",
      "zh": "七、为什么一定要掌握 async（视频的总结）",
      "en": "7. Why async matters (the video's takeaway)"
    },
    {
      "t": "p",
      "zh": "[▶ 22:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=1326) 老师用这个例子回答了「为什么先学 async」：同步运行时，你只能发出问题、拿到结果，中间发生了什么既不知道，也没法干预；用 async 流式运行，你可以**在 Agent 循环进行的过程中**随时介入——[▶ 22:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=1358) 根据事件的类型决定要不要打印，根据事件的内容判断任务进行到哪一步、这次对话结束了没有，再做新的决策。所以后面的代码基本都用异步写法。\n\n[▶ 23:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=1422) 下一集（10 节）讲连续对话，也就是让 Agent 记住前面聊过的内容。",
      "en": "[▶ 22:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=1326) The instructor uses this example to answer “why learn async first”: run synchronously and you can only send a question and receive a result – you neither see nor influence what happens in between; run async and streamed, and you can step in **while the agent loop is running** – [▶ 22:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=1358) decide whether to print based on the event type, tell from the event content how far the task has got and whether the conversation is over, and make new decisions. That is why nearly all later code is async.\n\n[▶ 23:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=10&t=1422) The next episode (lesson 10) covers multi-turn conversations – letting the agent remember what was said before."
    },
    {
      "t": "h",
      "zh": "八、补充：不用框架时的异步调用",
      "en": "8. Extra: async calls without a framework"
    },
    {
      "t": "note",
      "zh": "**补充 / Extra**：这一部分视频没有讲。框架代码不能在网页里运行，这里改用不带框架的异步客户端 `async_client`（连接模拟模型，可以直接点 ▶ 运行）练习 `await`、`gather` 和 `async for`；后两个「手写」练习也是这种写法。",
      "en": "**Extra**: not in the video. Framework code can't run in the browser, so this part practises `await`, `gather` and `async for` with the plain async client `async_client` (connected to the mock model – press ▶ Run); the last two “write it” exercises use the same style."
    },
    {
      "t": "p",
      "zh": "不用框架也一样：异步客户端 `async_client` 的 `create` 方法也是异步的，前面加 `await`。下面这段连接的是模拟模型，可以直接运行：",
      "en": "It works without a framework too: `create` on the async client `async_client` is also async, so put `await` in front. This one talks to the mock model and runs right here:"
    },
    {
      "t": "code",
      "file": "gather_client.py",
      "run": "mock",
      "code": {
        "zh": "import asyncio\nfrom llm import async_client, MODEL\n\nasync def ask(question):\n    response = await async_client.chat.completions.create(   # 异步客户端：前面要 await\n        model=MODEL,\n        messages=[{\"role\": \"user\", \"content\": question}],\n    )\n    return response.choices[0].message.content\n\nasync def main():\n    answers = await asyncio.gather(ask(\"你好\"), ask(\"北京有什么好吃的？\"), ask(\"推荐一本书\"))\n    for a in answers:\n        print(a)\n\nasyncio.run(main())",
        "en": "import asyncio\nfrom llm import async_client, MODEL\n\nasync def ask(question):\n    response = await async_client.chat.completions.create(   # the async client needs await\n        model=MODEL,\n        messages=[{\"role\": \"user\", \"content\": question}],\n    )\n    return response.choices[0].message.content\n\nasync def main():\n    answers = await asyncio.gather(ask(\"Hello\"), ask(\"What should I eat in Beijing?\"), ask(\"Recommend a book\"))\n    for a in answers:\n        print(a)\n\nasyncio.run(main())"
      }
    },
    {
      "t": "p",
      "zh": "流式也一样：`create(...)` 前面要 `await`，拿到流以后用 `async for` 一块一块地读：",
      "en": "Streaming works the same way: `await` before `create(...)`, then read the stream piece by piece with `async for`:"
    },
    {
      "t": "code",
      "file": "stream_client.py",
      "run": "mock",
      "code": {
        "zh": "import asyncio\nfrom llm import async_client, MODEL\n\nasync def main():\n    stream = await async_client.chat.completions.create(\n        model=MODEL,\n        messages=[{\"role\": \"user\", \"content\": \"用一句话介绍你自己\"}],\n        stream=True,                              # 要求流式返回\n    )\n    async for chunk in stream:                    # 每到一块，循环体就执行一次\n        piece = chunk.choices[0].delta.content    # 这一块新增的文字，可能是 None\n        if piece:\n            print(piece, end=\"\", flush=True)\n    print()\n\nasyncio.run(main())",
        "en": "import asyncio\nfrom llm import async_client, MODEL\n\nasync def main():\n    stream = await async_client.chat.completions.create(\n        model=MODEL,\n        messages=[{\"role\": \"user\", \"content\": \"Introduce yourself in one sentence\"}],\n        stream=True,                              # ask for a streamed reply\n    )\n    async for chunk in stream:                    # the body runs once per arriving chunk\n        piece = chunk.choices[0].delta.content    # the new text in this chunk; may be None\n        if piece:\n            print(piece, end=\"\", flush=True)\n    print()\n\nasyncio.run(main())"
      },
      "note": {
        "zh": "真实模型的完整示例在 `practice/l09_stream_client.py`。DeepSeek 会先发「思考过程」，这些块的 `delta.content` 是 `None`，所以要用 `if piece:` 跳过。",
        "en": "The full real-model version is `practice/l09_stream_client.py`. DeepSeek sends its “thinking” first, and those chunks have `delta.content` set to `None` – hence the `if piece:` check."
      }
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "调用一个 `async def` 定义的函数但不 `await`，会得到什么？",
        "en": "You call an `async def` function without `await`. What do you get?"
      },
      "options": [
        {
          "zh": "函数的返回值",
          "en": "The function's return value"
        },
        {
          "zh": "None",
          "en": "None"
        },
        {
          "zh": "一个协程对象，函数体还没有执行",
          "en": "A coroutine object; the body hasn't run"
        },
        {
          "zh": "立刻报 SyntaxError",
          "en": "An immediate SyntaxError"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "调用异步函数只是创建协程对象。要么 `await` 它，要么交给 `asyncio.run` / `asyncio.gather`，它才会真正运行。",
        "en": "Calling an async function only creates a coroutine object. It runs only when awaited or handed to `asyncio.run` / `asyncio.gather`."
      }
    },
    {
      "q": {
        "zh": "视频把全局设置写在一个设置文件里，别的文件只写一行 `import l09_settings`，后面再也没用到它。这一行起什么作用？",
        "en": "The video puts the global settings in a settings file; other files just write `import l09_settings` and never use it again. What does that line do?"
      },
      "options": [
        {
          "zh": "导入时把设置文件从头执行一遍，里面的全局设置因此生效",
          "en": "Importing runs the settings file from top to bottom, so its global settings take effect"
        },
        {
          "zh": "没有作用，编辑器都把它显示成灰色了，可以删掉",
          "en": "Nothing – the editor even greys it out, so it can be deleted"
        },
        {
          "zh": "把设置文件的内容复制进当前文件",
          "en": "It copies the settings file's text into the current file"
        },
        {
          "zh": "只是为了让编辑器不报错",
          "en": "It only keeps the editor from complaining"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "import 一个模块会执行它的代码（同一个程序里只执行一次）。删掉这一行，SDK 就回到 OpenAI 的默认设置，报缺少 `OPENAI_API_KEY`。",
        "en": "Importing a module runs its code (once per program). Delete the line and the SDK falls back to OpenAI's defaults and complains about a missing `OPENAI_API_KEY`."
      }
    },
    {
      "q": {
        "zh": "`results = await asyncio.gather(a(), b(), c())`，其中 `c()` 最先完成。`results[0]` 是谁的结果？",
        "en": "`results = await asyncio.gather(a(), b(), c())`, and `c()` finishes first. Whose result is `results[0]`?"
      },
      "options": [
        {
          "zh": "`c()` 的",
          "en": "`c()`'s"
        },
        {
          "zh": "随机的",
          "en": "Random"
        },
        {
          "zh": "`b()` 的",
          "en": "`b()`'s"
        },
        {
          "zh": "`a()` 的",
          "en": "`a()`'s"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "`gather` 的结果顺序和传入顺序一致，和完成先后无关。",
        "en": "`gather` returns results in the order passed, regardless of which finished first."
      }
    },
    {
      "q": {
        "zh": "`print(piece, end=\"\", flush=True)` 里 `flush=True` 的作用是？",
        "en": "In `print(piece, end=\"\", flush=True)`, what does `flush=True` do?"
      },
      "options": [
        {
          "zh": "打印完清空变量 `piece`",
          "en": "Clears the variable `piece`"
        },
        {
          "zh": "让文字马上显示出来，不在缓冲区里攒着",
          "en": "Shows the text right away instead of holding it in a buffer"
        },
        {
          "zh": "在末尾加一个换行",
          "en": "Adds a newline at the end"
        },
        {
          "zh": "把文字写进文件",
          "en": "Writes the text to a file"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "不加 `flush=True`，没有换行的文字可能先留在缓冲区，攒一批才显示，流式效果就没了。",
        "en": "Without `flush=True`, text without a newline may sit in a buffer and appear in bursts, which defeats streaming."
      }
    },
    {
      "q": {
        "zh": "下面哪一种是 `Runner.run_streamed` 的正确用法？",
        "en": "Which is the correct way to use `Runner.run_streamed`?"
      },
      "options": [
        {
          "zh": "`result = await Runner.run_streamed(agent, q)`，然后 `for event in result.stream_events():`",
          "en": "`result = await Runner.run_streamed(agent, q)`, then `for event in result.stream_events():`"
        },
        {
          "zh": "`result = Runner.run_streamed(agent, q)`，然后 `for event in result.stream_events():`",
          "en": "`result = Runner.run_streamed(agent, q)`, then `for event in result.stream_events():`"
        },
        {
          "zh": "`result = Runner.run_streamed(agent, q)`，然后在 `async def` 里 `async for event in result.stream_events():`",
          "en": "`result = Runner.run_streamed(agent, q)`, then inside `async def`: `async for event in result.stream_events():`"
        },
        {
          "zh": "`result = await Runner.run_streamed(agent, q)`，然后 `print(result.final_output)`",
          "en": "`result = await Runner.run_streamed(agent, q)`, then `print(result.final_output)`"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "`run_streamed` 不 await，马上返回结果对象；`stream_events()` 是异步的，要在 `async def` 里用 `async for` 读取。",
        "en": "`run_streamed` is not awaited and returns the result object at once; `stream_events()` is async, so read it with `async for` inside `async def`."
      }
    },
    {
      "q": {
        "zh": "视频里第一次写 Agent 的流式输出时，只判断了 `event.type == \"raw_response_event\"` 就去打印 `event.data.delta`，结果报错。原因是？",
        "en": "The first time the video streams an agent, it only checks `event.type == \"raw_response_event\"` before printing `event.data.delta`, and it crashes. Why?"
      },
      "options": [
        {
          "zh": "`Runner.run_streamed` 前面忘了写 `await`",
          "en": "`await` is missing before `Runner.run_streamed`"
        },
        {
          "zh": "`raw_response_event` 只在调用工具时才出现",
          "en": "`raw_response_event`s only appear during tool calls"
        },
        {
          "zh": "`print` 少了 `flush=True`",
          "en": "`print` lacks `flush=True`"
        },
        {
          "zh": "最先到的原始事件是「响应已创建」（`ResponseCreatedEvent`），它没有 `delta` 属性",
          "en": "The first raw event is “response created” (`ResponseCreatedEvent`), which has no `delta` attribute"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "原始事件里不只有文字片段，还有「响应已创建」「内容完成」这类事件。要再加 `isinstance(event.data, ResponseTextDeltaEvent)`，只留下文字片段。`run_streamed` 本来就不该 await；少了 `flush` 只会让文字攒着显示，不会报错。",
        "en": "Raw events carry more than text pieces – there are also “response created”, “content done” and so on. Add `isinstance(event.data, ResponseTextDeltaEvent)` to keep only text pieces. `run_streamed` must not be awaited anyway, and a missing `flush` only delays the output, it doesn't crash."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "async 骨架 + 并发",
        "en": "The async skeleton + concurrency"
      },
      "code": {
        "zh": "import [[asyncio]]\nfrom agents import Runner\n\n[[async]] def main():\n    result = [[await]] Runner.run(agent, \"你好\")\n    print(result.final_output)\n\n    results = await asyncio.[[gather]](\n        Runner.run(agent, \"问题一\"),\n        Runner.run(agent, \"问题二\"),\n    )\n    for r in results:\n        print(r.final_output)\n\nasyncio.[[run]]([[main()]])",
        "en": "import [[asyncio]]\nfrom agents import Runner\n\n[[async]] def main():\n    result = [[await]] Runner.run(agent, \"Hello\")\n    print(result.final_output)\n\n    results = await asyncio.[[gather]](\n        Runner.run(agent, \"question 1\"),\n        Runner.run(agent, \"question 2\"),\n    )\n    for r in results:\n        print(r.final_output)\n\nasyncio.[[run]]([[main()]])"
      },
      "explain": {
        "zh": "`async def` 定义、`await` 等结果、`asyncio.gather` 并发、`asyncio.run(main())` 启动——注意传的是 `main()`（协程对象），不是 `main`。",
        "en": "`async def` to define, `await` for results, `asyncio.gather` for concurrency, `asyncio.run(main())` to start – note it takes `main()` (a coroutine object), not `main`."
      }
    },
    {
      "title": {
        "zh": "Agent 流式输出",
        "en": "Streaming an agent"
      },
      "code": {
        "zh": "from openai.types.responses import ResponseTextDeltaEvent\n\nasync def main():\n    result = Runner.[[run_streamed]](agent, \"讲个笑话\")\n    [[async]] for event in result.[[stream_events]]():\n        if event.type == \"[[raw_response_event]]\" and isinstance(event.data, [[ResponseTextDeltaEvent]]):\n            print(event.data.[[delta]], end=[[\"\"|'']], flush=[[True]])\n    print()",
        "en": "from openai.types.responses import ResponseTextDeltaEvent\n\nasync def main():\n    result = Runner.[[run_streamed]](agent, \"Tell a joke\")\n    [[async]] for event in result.[[stream_events]]():\n        if event.type == \"[[raw_response_event]]\" and isinstance(event.data, [[ResponseTextDeltaEvent]]):\n            print(event.data.[[delta]], end=[[\"\"|'']], flush=[[True]])\n    print()"
      },
      "explain": {
        "zh": "`run_streamed` 不 await；`async for` 读 `stream_events()`；只保留 `raw_response_event` 里的 `ResponseTextDeltaEvent`，打印它的 `delta`。",
        "en": "No await on `run_streamed`; `async for` over `stream_events()`; keep only `ResponseTextDeltaEvent`s among the `raw_response_event`s and print their `delta`."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：Agent 流式输出",
        "en": "Write it: streaming an agent"
      },
      "task": {
        "zh": "Agent 已经创建好了。补全：\n1. 从 `openai.types.responses` 导入 `ResponseTextDeltaEvent`\n2. `async def main()`：用 `Runner.run_streamed` 运行 agent（不要 await），`async for` 遍历 `stream_events()`，只在 `event.type == \"raw_response_event\"` 并且 `event.data` 是 `ResponseTextDeltaEvent` 时打印 `event.data.delta`（不换行、立即刷新）\n3. 用 `asyncio.run(main())` 启动\n\n框架代码不能在网页里运行：写完点「检查关键点」，再用 `practice/l09_stream_todo.py` 在本地真正跑一遍。",
        "en": "The agent is already created. Complete it:\n1. import `ResponseTextDeltaEvent` from `openai.types.responses`\n2. `async def main()`: run the agent with `Runner.run_streamed` (no await), loop over `stream_events()` with `async for`, and print `event.data.delta` (no newline, immediate flush) only when `event.type == \"raw_response_event\"` and `event.data` is a `ResponseTextDeltaEvent`\n3. start it with `asyncio.run(main())`\n\nFramework code can't run in the browser: press “Check key points”, then run it for real with `practice/l09_stream_todo.py`."
      },
      "starter": {
        "zh": "import asyncio\nfrom agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nagent = Agent(\n    name=\"讲故事的人\",\n    instructions=\"你会讲简短有趣的小故事。\",\n    model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),\n)\n\n# 1. 导入表示「一小段回答文字」的事件类\n\n# 2. 定义异步函数 main：流式运行 agent，只把回答文字一块一块地打印出来\n\n# 3. 在程序入口启动 main",
        "en": "import asyncio\nfrom agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nagent = Agent(\n    name=\"storyteller\",\n    instructions=\"You tell short, fun stories.\",\n    model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),\n)\n\n# 1. import the event class for \"a small piece of answer text\"\n\n# 2. define the async function main: run the agent streamed and print only the answer text, piece by piece\n\n# 3. start main at the program's entry point"
      },
      "solution": {
        "zh": "import asyncio\nfrom agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nagent = Agent(\n    name=\"讲故事的人\",\n    instructions=\"你会讲简短有趣的小故事。\",\n    model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),\n)\n\n# 1. 导入事件类\nfrom openai.types.responses import ResponseTextDeltaEvent\n\n# 2. 定义异步函数 main\nasync def main():\n    result = Runner.run_streamed(agent, \"讲一个 100 字以内的小猫故事。\")\n    async for event in result.stream_events():\n        if event.type == \"raw_response_event\" and isinstance(event.data, ResponseTextDeltaEvent):\n            print(event.data.delta, end=\"\", flush=True)\n    print()\n\n# 3. 启动 main\nasyncio.run(main())",
        "en": "import asyncio\nfrom agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nagent = Agent(\n    name=\"storyteller\",\n    instructions=\"You tell short, fun stories.\",\n    model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),\n)\n\n# 1. import the event class\nfrom openai.types.responses import ResponseTextDeltaEvent\n\n# 2. the async function main\nasync def main():\n    result = Runner.run_streamed(agent, \"Tell a cat story in under 80 words.\")\n    async for event in result.stream_events():\n        if event.type == \"raw_response_event\" and isinstance(event.data, ResponseTextDeltaEvent):\n            print(event.data.delta, end=\"\", flush=True)\n    print()\n\n# 3. start main\nasyncio.run(main())"
      },
      "checks": [
        {
          "zh": "导入 `ResponseTextDeltaEvent`",
          "en": "Imports `ResponseTextDeltaEvent`",
          "re": "from\\s+openai\\.types\\.responses\\s+import\\s+.*ResponseTextDeltaEvent"
        },
        {
          "zh": "`Runner.run_streamed(agent, ...)`，前面没有 await",
          "en": "`Runner.run_streamed(agent, ...)` without await",
          "re": "=\\s*Runner\\.run_streamed\\(\\s*agent\\s*,"
        },
        {
          "zh": "`async for` 遍历 `stream_events()`",
          "en": "`async for` over `stream_events()`",
          "re": "async\\s+for\\s+\\w+\\s+in\\s+\\w+\\.stream_events\\(\\s*\\)\\s*:"
        },
        {
          "zh": "判断 `raw_response_event`",
          "en": "Checks for `raw_response_event`",
          "re": "[\\\"']raw_response_event[\\\"']"
        },
        {
          "zh": "用 `isinstance(event.data, ResponseTextDeltaEvent)` 筛选",
          "en": "Filters with `isinstance(event.data, ResponseTextDeltaEvent)`",
          "re": "isinstance\\(\\s*\\w+\\.data\\s*,\\s*ResponseTextDeltaEvent\\s*\\)"
        },
        {
          "zh": "打印 `event.data.delta`，不换行并刷新",
          "en": "Prints `event.data.delta` with no newline and a flush",
          "re": "print\\(\\s*\\w+\\.data\\.delta\\s*,.*flush\\s*=\\s*True"
        },
        {
          "zh": "用 `asyncio.run(main())` 启动",
          "en": "Starts with `asyncio.run(main())`",
          "re": "^asyncio\\.run\\(\\s*main\\(\\)\\s*\\)"
        }
      ]
    },
    {
      "title": {
        "zh": "手写：异步并发提问",
        "en": "Write it: concurrent async questions"
      },
      "task": {
        "zh": "（补充练习，对应第八部分）不看上面的代码，写出：\n1. 异步函数 `ask(question)`：用 `async_client` 提问（记得 `await`），返回回答文字\n2. 异步函数 `main()`：用 `asyncio.gather` 同时问三个问题，用 for 循环打印每个回答\n3. 用 `asyncio.run` 启动 `main()`\n\n可以点 ▶ 运行（连接模拟模型）。",
        "en": "(Extra exercise, see part 8) Without looking above, write:\n1. an async function `ask(question)` that asks with `async_client` (remember `await`) and returns the answer text\n2. an async function `main()` that asks three questions at once with `asyncio.gather` and prints each answer in a for loop\n3. start `main()` with `asyncio.run`\n\nYou can press ▶ Run (it uses the mock model)."
      },
      "run": "mock",
      "starter": {
        "zh": "from llm import async_client, MODEL\n\n# 1. 导入 asyncio\n\n# 2. 定义异步函数 ask：用 async_client 提一个问题，返回回答文字\n\n# 3. 定义异步函数 main：用 gather 同时问三个问题，打印每个回答\n\n# 4. 在程序入口启动 main",
        "en": "from llm import async_client, MODEL\n\n# 1. import asyncio\n\n# 2. define the async function ask: ask one question with async_client and return the answer text\n\n# 3. define the async function main: ask three questions at once with gather and print each answer\n\n# 4. start main at the program's entry point"
      },
      "solution": {
        "zh": "from llm import async_client, MODEL\n\n# 1. 导入 asyncio\nimport asyncio\n\n# 2. 定义异步函数 ask\nasync def ask(question):\n    response = await async_client.chat.completions.create(\n        model=MODEL,\n        messages=[{\"role\": \"user\", \"content\": question}],\n    )\n    return response.choices[0].message.content\n\n# 3. 定义异步函数 main\nasync def main():\n    answers = await asyncio.gather(\n        ask(\"什么是协程？\"),\n        ask(\"什么是事件循环？\"),\n        ask(\"北京有什么好吃的？\"),\n    )\n    for a in answers:\n        print(a)\n\n# 4. 启动 main\nasyncio.run(main())",
        "en": "from llm import async_client, MODEL\n\n# 1. import asyncio\nimport asyncio\n\n# 2. the async function ask\nasync def ask(question):\n    response = await async_client.chat.completions.create(\n        model=MODEL,\n        messages=[{\"role\": \"user\", \"content\": question}],\n    )\n    return response.choices[0].message.content\n\n# 3. the async function main\nasync def main():\n    answers = await asyncio.gather(\n        ask(\"What is a coroutine?\"),\n        ask(\"What is an event loop?\"),\n        ask(\"What should I eat in Beijing?\"),\n    )\n    for a in answers:\n        print(a)\n\n# 4. start main\nasyncio.run(main())"
      },
      "checks": [
        {
          "zh": "导入了 `asyncio`",
          "en": "Imports `asyncio`",
          "re": "^import\\s+asyncio"
        },
        {
          "zh": "定义了异步函数 `ask(question)`",
          "en": "Defines the async function `ask(question)`",
          "re": "async\\s+def\\s+ask\\s*\\(\\s*\\w+\\s*\\)\\s*:"
        },
        {
          "zh": "调用模型时 `await async_client.chat.completions.create(...)`",
          "en": "Calls `await async_client.chat.completions.create(...)`",
          "re": "await\\s+async_client\\.chat\\.completions\\.create\\("
        },
        {
          "zh": "返回 `choices[0].message.content`",
          "en": "Returns `choices[0].message.content`",
          "re": "return\\s+\\w+\\.choices\\[0\\]\\.message\\.content"
        },
        {
          "zh": "定义了 `async def main()`",
          "en": "Defines `async def main()`",
          "re": "async\\s+def\\s+main\\s*\\(\\s*\\)\\s*:"
        },
        {
          "zh": "用 `await asyncio.gather(...)` 并发",
          "en": "Uses `await asyncio.gather(...)`",
          "re": "await\\s+asyncio\\.gather\\("
        },
        {
          "zh": "用 `asyncio.run(main())` 启动",
          "en": "Starts with `asyncio.run(main())`",
          "re": "^asyncio\\.run\\(\\s*main\\(\\)\\s*\\)"
        }
      ]
    },
    {
      "title": {
        "zh": "手写：异步流式输出",
        "en": "Write it: async streaming"
      },
      "task": {
        "zh": "（补充练习，对应第八部分）写一个 `async def main()`：\n1. 用 `async_client` 发起 `stream=True` 的请求（`create` 前面要 `await`）\n2. 用 `async for` 逐块读取，取出 `chunk.choices[0].delta.content`，不是空的才打印，打印时不换行、立即刷新\n3. 循环结束后补一个换行\n\n最后用 `asyncio.run(main())` 启动。可以点 ▶ 运行检查能不能跑通（模拟模型会一下子返回所有片段；一段一段出现的效果要在本地用真实模型看）。",
        "en": "(Extra exercise, see part 8) Write `async def main()`:\n1. start a `stream=True` request with `async_client` (`await` before `create`)\n2. read it with `async for`, take `chunk.choices[0].delta.content`, print it only when not empty, with no newline and an immediate flush\n3. print a newline after the loop\n\nThen start it with `asyncio.run(main())`. Press ▶ Run to check that it works (the mock model returns all pieces at once; to watch them appear one by one, run it locally against the real model)."
      },
      "run": "mock",
      "starter": {
        "zh": "import asyncio\nfrom llm import async_client, MODEL\n\n# 定义异步函数 main：\n#   1. 用 async_client 发起流式请求，问「用三句话介绍一下杭州」（别忘了 await）\n#   2. 逐块读取，打印每块新增的文字：不换行、立即刷新\n#   3. 最后补一个换行\n\n# 在程序入口启动 main",
        "en": "import asyncio\nfrom llm import async_client, MODEL\n\n# define the async function main:\n#   1. start a streamed request with async_client: \"Introduce Hangzhou in three sentences\" (don't forget await)\n#   2. read it chunk by chunk and print each chunk's new text: no newline, flush at once\n#   3. print a final newline\n\n# start main at the program's entry point"
      },
      "solution": {
        "zh": "import asyncio\nfrom llm import async_client, MODEL\n\nasync def main():\n    stream = await async_client.chat.completions.create(\n        model=MODEL,\n        messages=[{\"role\": \"user\", \"content\": \"用三句话介绍一下杭州\"}],\n        stream=True,\n    )\n    async for chunk in stream:\n        piece = chunk.choices[0].delta.content\n        if piece:\n            print(piece, end=\"\", flush=True)\n    print()\n\nasyncio.run(main())",
        "en": "import asyncio\nfrom llm import async_client, MODEL\n\nasync def main():\n    stream = await async_client.chat.completions.create(\n        model=MODEL,\n        messages=[{\"role\": \"user\", \"content\": \"Introduce Hangzhou in three sentences\"}],\n        stream=True,\n    )\n    async for chunk in stream:\n        piece = chunk.choices[0].delta.content\n        if piece:\n            print(piece, end=\"\", flush=True)\n    print()\n\nasyncio.run(main())"
      },
      "checks": [
        {
          "zh": "定义了 `async def main()`",
          "en": "Defines `async def main()`",
          "re": "async\\s+def\\s+main\\s*\\(\\s*\\)\\s*:"
        },
        {
          "zh": "`await` 异步客户端的 `create(...)`",
          "en": "`await`s the async client's `create(...)`",
          "re": "=\\s*await\\s+async_client\\.chat\\.completions\\.create\\("
        },
        {
          "zh": "请求里有 `stream=True`",
          "en": "The request has `stream=True`",
          "re": "stream\\s*=\\s*True"
        },
        {
          "zh": "用 `async for` 读取流",
          "en": "Reads the stream with `async for`",
          "re": "async\\s+for\\s+\\w+\\s+in\\s+\\w+\\s*:"
        },
        {
          "zh": "取出 `delta.content`",
          "en": "Reads `delta.content`",
          "re": "\\.delta\\.content"
        },
        {
          "zh": "打印时 `end=\"\"`",
          "en": "Prints with `end=\"\"`",
          "re": "end\\s*=\\s*(\\\"\\\"|'')"
        },
        {
          "zh": "打印时 `flush=True`",
          "en": "Prints with `flush=True`",
          "re": "flush\\s*=\\s*True"
        },
        {
          "zh": "用 `asyncio.run(main())` 启动",
          "en": "Starts with `asyncio.run(main())`",
          "re": "^asyncio\\.run\\(\\s*main\\(\\)\\s*\\)"
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "用设置文件时忘了 `import l09_settings`：SDK 回到 OpenAI 的默认设置，报 `Missing credentials ... OPENAI_API_KEY`。设置文件的名字以数字开头或带减号，则连 import 都写不出来：`import 01_settings` 直接报 SyntaxError。",
      "en": "Forgetting `import l09_settings` when using a settings file: the SDK falls back to OpenAI's defaults and fails with `Missing credentials ... OPENAI_API_KEY`. If the settings file's name starts with a digit or contains a hyphen you can't even import it: `import 01_settings` is a SyntaxError."
    },
    {
      "zh": "忘了 `await`：`result = Runner.run(...)` 只得到协程对象，再取 `.final_output` 报 `AttributeError: 'coroutine' object has no attribute 'final_output'`。反过来，`await` 写在 `async def` 外面是语法错误：文件最外层报 `'await' outside function`，普通函数里报 `'await' outside async function`（`async for` 写在外面报 `'async for' outside async function`）。",
      "en": "Forgetting `await`: `result = Runner.run(...)` is just a coroutine object, so `.final_output` raises `AttributeError: 'coroutine' object has no attribute 'final_output'`. Conversely, `await` outside `async def` is a syntax error: at the top of a file it is `'await' outside function`, in a plain function `'await' outside async function` (`async for` outside gives `'async for' outside async function`)."
    },
    {
      "zh": "在 `async def` 里调用 `Runner.run_sync(...)` 或 `asyncio.run(...)`：分别报 `run_sync() cannot be called when an event loop is already running` 和 `asyncio.run() cannot be called from a running event loop`。在 async 代码里一律用 `await`，`asyncio.run` 只在程序入口用一次。",
      "en": "Calling `Runner.run_sync(...)` or `asyncio.run(...)` inside `async def`: they raise `run_sync() cannot be called when an event loop is already running` and `asyncio.run() cannot be called from a running event loop`. Inside async code always `await`; use `asyncio.run` once, at the entry point."
    },
    {
      "zh": "`await Runner.run_streamed(...)`，或者用普通 `for` 遍历 `stream_events()`——前者报 `can't be used in 'await' expression`，后者报 `'async_generator' object is not iterable`。",
      "en": "`await Runner.run_streamed(...)`, or a plain `for` over `stream_events()` – the first raises `can't be used in 'await' expression`, the second `'async_generator' object is not iterable`."
    },
    {
      "zh": "只判断 `event.type == \"raw_response_event\"` 就去打印 `event.data.delta`：第一个原始事件是「响应已创建」，报 `AttributeError: 'ResponseCreatedEvent' object has no attribute 'delta'`（视频里也踩了这个坑）。要再加 `isinstance(event.data, ResponseTextDeltaEvent)`。",
      "en": "Checking only `event.type == \"raw_response_event\"` before printing `event.data.delta`: the first raw event is “response created”, which raises `AttributeError: 'ResponseCreatedEvent' object has no attribute 'delta'` (the video hits this too). Add `isinstance(event.data, ResponseTextDeltaEvent)`."
    },
    {
      "zh": "在异步代码里用 `time.sleep()` 或同步的 `client`：会卡住整个事件循环，并发失效。",
      "en": "Using `time.sleep()` or the synchronous `client` in async code: it blocks the whole event loop and kills the concurrency."
    },
    {
      "zh": "`asyncio.gather([a(), b()])` 直接传了列表：报 `TypeError: unhashable type: 'list'`。要写 `gather(a(), b())` 或 `gather(*tasks)`。",
      "en": "Passing a list, `asyncio.gather([a(), b()])`: it raises `TypeError: unhashable type: 'list'`. Write `gather(a(), b())` or `gather(*tasks)`."
    }
  ],
  "recap": [
    {
      "zh": "视频的配置写法：把 `set_default_openai_client`、`set_default_openai_api(\"chat_completions\")`、`set_tracing_disabled(True)` 和默认模型名放进一个设置文件，别的文件 `import` 它就生效；课程练习多用 `OpenAIChatCompletionsModel`，效果一样。",
      "en": "The video's configuration: put `set_default_openai_client`, `set_default_openai_api(\"chat_completions\")`, `set_tracing_disabled(True)` and the default model name in a settings file that other files `import`; the practice files mostly use `OpenAIChatCompletionsModel`, which behaves the same."
    },
    {
      "zh": "三件套：`async def` 定义异步函数，`await` 运行并等结果，`asyncio.run(main())` 在程序入口启动。",
      "en": "The trio: `async def` defines, `await` runs and waits, `asyncio.run(main())` starts it all at the entry point."
    },
    {
      "zh": "`await Runner.run(...)` 是异步写法；`Runner.run_sync(...)` 是同步包装，不能在已有事件循环里用；`Runner.run_streamed(...)` 不 await，返回流式结果。",
      "en": "`await Runner.run(...)` is the async way; `Runner.run_sync(...)` is a sync wrapper that can't run inside a running loop; `Runner.run_streamed(...)` is not awaited and returns a streaming result."
    },
    {
      "zh": "流式：`async for` 逐块读取，`print(x, end=\"\", flush=True)` 逐块打印。",
      "en": "Streaming: read with `async for`, print with `print(x, end=\"\", flush=True)`."
    },
    {
      "zh": "Agent 流式：`raw_response_event` + `ResponseTextDeltaEvent` 是回答文字，`run_item_stream_event` 看工具调用；流读完后 `final_output` 才完整。",
      "en": "Agent streaming: `raw_response_event` + `ResponseTextDeltaEvent` is answer text, `run_item_stream_event` shows tool calls; `final_output` is complete only after the stream."
    },
    {
      "zh": "流式运行的事件顺序：Agent 更新 → 大模型的原始事件（已创建 → 一串文字片段 → 完成）→ Runner 的运行事件。不用流式，就相当于一直等到最后。",
      "en": "Event order in a streamed run: agent updated → raw model events (created → many text pieces → done) → the Runner's run events. Without streaming you simply wait for the end."
    },
    {
      "zh": "async 的意义：等网络时不干等；流式运行时还能在 Agent 循环进行中随时介入。几个请求可以用 `asyncio.gather` 一起等，结果按传入顺序返回（列表用 `gather(*tasks)`）。",
      "en": "Why async: no idle waiting on the network, and in a streamed run you can step into the agent loop while it runs. Several requests can wait together with `asyncio.gather`, results in the order passed (for a list, `gather(*tasks)`)."
    }
  ],
  "files": [
    {
      "path": "practice/l09_settings.py",
      "zh": "视频写法的设置文件：把 SDK 的默认客户端、接口、追踪和默认模型名改成 DeepSeek（被其他文件 import）。",
      "en": "The video-style settings file: switches the SDK's default client, API, tracing and default model name to DeepSeek (imported by other files)."
    },
    {
      "path": "practice/l09_first_run.py",
      "zh": "视频开头的第一个例子：导入设置文件，用 `Runner.run_sync` 跑一个不写 model 的 Agent。",
      "en": "The video's first example: import the settings file and run an agent without `model` using `Runner.run_sync`."
    },
    {
      "path": "practice/l09_first_async.py",
      "zh": "视频把第一个例子改成 async 的样子：`async def main()` + `await Runner.run(...)` + `asyncio.run(main())`。",
      "en": "The video's first example converted to async: `async def main()` + `await Runner.run(...)` + `asyncio.run(main())`."
    },
    {
      "path": "practice/l09_events.py",
      "zh": "把流式运行时收到的每一种事件都打印出来（连续重复的合并计数）。",
      "en": "Prints every kind of event a streamed run produces (consecutive repeats merged with a count)."
    },
    {
      "path": "practice/l09_async_todo.py",
      "zh": "练习：把同步写法改成 async，再用 `asyncio.gather` 让三个 Agent 同时工作。",
      "en": "Exercise: convert to async, then run three agents at once with `asyncio.gather`."
    },
    {
      "path": "practice/l09_async_solution.py",
      "zh": "参考答案（实测：三个 Agent 一起 2 到 4 秒）。",
      "en": "Solution (measured: 2 to 4 s for all three agents)."
    },
    {
      "path": "practice/l09_stream_todo.py",
      "zh": "练习：用 `Runner.run_streamed` 逐段打印回答，并显示工具调用。",
      "en": "Exercise: print the answer piece by piece with `Runner.run_streamed` and show the tool calls."
    },
    {
      "path": "practice/l09_stream_solution.py",
      "zh": "参考答案：流式回答 + 工具调用和工具结果。",
      "en": "Solution: streamed answer + tool calls and results."
    },
    {
      "path": "practice/l09_stream_client.py",
      "zh": "演示：不用框架，直接用 `async_client` 流式输出，以及用 `gather` 并发提问。",
      "en": "Demo: streaming with the plain `async_client`, plus concurrent questions with `gather`."
    }
  ]
});
