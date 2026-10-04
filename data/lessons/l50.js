COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
 "id": "l50",
 "priority": "overview",
 "handwrite": false,
 "studyMinutes": 25,
 "source": "subtitle",
 "summary": {
  "zh": "视频这一集（约 6 分钟）是 LangChain 部分的收尾：先演示 LangServe——用 FastAPI 加一行 `add_routes` 把一条讲笑话的链部署成 HTTP 服务，在 playground 网页里调试，再用 HTTP 请求调用；然后简单介绍 LangChain.js、LangChain 和 LlamaIndex 的分工，谈谈 LangChain 到底能不能用，并提醒一个坑：Python 版的流式输出停不下来。LangServe 已停止开发、本课程没有安装，讲义用 FastAPI 写出格式相同的接口，视频里的客户端代码照样能用；流式的坑也在 1.x 上实测了一遍。",
  "en": "This episode (about 6 minutes) wraps up the LangChain part: first LangServe – FastAPI plus one `add_routes` line deploys a joke chain as an HTTP service, debugged in the playground page and called over HTTP; then a brief look at LangChain.js, how LangChain and LlamaIndex divide the work, whether LangChain is worth using, and a pitfall: streaming output in the Python version cannot be stopped. LangServe is deprecated and not installed here, so the notes build an endpoint with the same format in FastAPI, and the video's client code still works; the streaming pitfall is re-tested on 1.x."
 },
 "goals": [
  {
   "zh": "说清「把链部署成 Web 服务」是什么：HTTP 请求 → 调用链 → 返回 JSON",
   "en": "Explain what “deploying a chain as a web service” means: HTTP request → call the chain → return JSON"
  },
  {
   "zh": "知道 LangServe 的 `add_routes` 会生成哪些接口（`/invoke`、`/batch`、`/stream`、`/playground/`），以及它现在的状态",
   "en": "Know which endpoints LangServe's `add_routes` creates (`/invoke`, `/batch`, `/stream`, `/playground/`) and its current status"
  },
  {
   "zh": "运行一个和 LangServe 格式相同的 FastAPI 接口，并用 `requests.post` 调用它",
   "en": "Run a FastAPI endpoint with LangServe's format and call it with `requests.post`"
  },
  {
   "zh": "说出 LangChain.js 是什么，以及 LangChain 和 LlamaIndex 各自侧重什么",
   "en": "Say what LangChain.js is, and what LangChain and LlamaIndex each focus on"
  },
  {
   "zh": "了解老师说的流式输出的坑，以及在 LangChain 1.x 里怎样才能中途停下一个流",
   "en": "Understand the instructor's streaming pitfall and how to stop a stream midway on LangChain 1.x"
  }
 ],
 "blocks": [
  {
   "t": "h",
   "zh": "一、LangServe：把链部署成 Web 服务",
   "en": "1. LangServe: deploying a chain as a web service"
  },
  {
   "t": "p",
   "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=51&t=0) 老师说，前面讲的都是**开发**用的工具；LangServe 是 LangChain 自己的**部署**工具：用 LCEL 写好的链，可以直接用它发布出去。部署成 Web 服务后，网页、App、用别的语言写的后端都能通过 HTTP 来用这条链，API key 只留在服务器上。\n\n一次 HTTP 调用由三样东西组成：\n- **地址**（URL），例如 `http://127.0.0.1:9999/joke/invoke`；\n- **方法**：`GET` 一般是读取，`POST` 一般是提交数据让服务器处理；\n- **请求体和响应体**：通常都是 JSON 文本。\n\n老师还提到，这部分没法在课件（网页里的笔记本）里运行，所以他是直接在本机把程序跑起来演示的。我们的练习文件也一样，要在本机运行。",
   "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=51&t=0) The instructor says the tools covered so far are all for **development**; LangServe is LangChain's own **deployment** tool: a chain written with LCEL can be published with it directly. Once it is deployed as a web service, web pages, apps and back ends written in other languages can all use the chain over HTTP, and the API key stays on the server.\n\nAn HTTP call has three parts:\n- the **address** (URL), e.g. `http://127.0.0.1:9999/joke/invoke`;\n- the **method**: `GET` usually reads, `POST` usually submits data for the server to process;\n- the **request and response bodies**: usually both JSON text.\n\nHe also mentions that this part cannot run in the courseware (the notebook in the web page), so he runs the program directly on his own machine for the demo. Our practice files are the same: run them on your machine."
  },
  {
   "t": "video",
   "zh": "视频（约 6 分钟，据 B 站自动字幕）的顺序是：LangServe 服务端代码 → 运行服务、打开 playground → 用客户端调用 → LangChain.js → LangChain 和 LlamaIndex 的关系 → 老师对 LangChain 的总体看法 → 流式输出停不下来的坑 → 作业。视频里的模型是 OpenAI 的，讲义换成 DeepSeek。LangServe 本课程没有安装，第四部分用 FastAPI 写出格式完全相同的接口，视频里的客户端代码照样能用。",
   "en": "The video (about 6 minutes, per Bilibili's auto-subtitles) goes: the LangServe server code → running it and opening the playground → calling it from a client → LangChain.js → how LangChain and LlamaIndex relate → the instructor's overall view of LangChain → the pitfall of streams you cannot stop → homework. The video uses an OpenAI model; these notes use DeepSeek. LangServe is not installed in this course, so part 4 builds an endpoint with exactly the same format in FastAPI, and the video's client code still works."
  },
  {
   "t": "p",
   "zh": "[▶ 00:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=51&t=38) 服务端的代码很短：\n1. LangServe 底层用的是 **FastAPI**（第 51 节细讲），先创建一个 FastAPI 应用；\n2. 定义一条最简单的链：提示词模板「讲一个关于某某的笑话」→ 模型 → 输出（第 48 节的视频里也有这样一条讲笑话的链）；\n3. 用 `add_routes` 把这条链挂到一个路径（endpoint）上。",
   "en": "[▶ 00:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=51&t=38) The server code is short:\n1. LangServe is built on **FastAPI** (covered in lesson 51), so first create a FastAPI app;\n2. define the simplest chain: the prompt template “tell me a joke about X” → model → output (lesson 48's video has a joke chain just like it);\n3. hang the chain on a path (an endpoint) with `add_routes`."
  },
  {
   "t": "code",
   "file": {
    "zh": "langserve_server.py（参考，不用运行）",
    "en": "langserve_server.py (reference, do not run)"
   },
   "code": {
    "zh": "# 参考代码：需要 pip install \"langserve[all]\"。本课程环境没有安装 LangServe，不用运行\nimport uvicorn\nfrom fastapi import FastAPI\nfrom langchain_core.output_parsers import StrOutputParser\nfrom langchain_core.prompts import ChatPromptTemplate\nfrom langchain_deepseek import ChatDeepSeek          # 视频用的是 OpenAI 的模型\nfrom langserve import add_routes\nfrom llm import API_KEY, MODEL\n\n# 最简单的链：提示词模板 → 模型 → 输出\nchain = (ChatPromptTemplate.from_template(\"讲一个关于{topic}的笑话\")\n         | ChatDeepSeek(model=MODEL, api_key=API_KEY)\n         | StrOutputParser())\n\napp = FastAPI(title=\"笑话服务\")\nadd_routes(app, chain, path=\"/joke\")    # 一行：自动生成 /joke/invoke、/joke/batch、/joke/stream、/joke/playground/ 等\n\nif __name__ == \"__main__\":\n    uvicorn.run(app, host=\"127.0.0.1\", port=9999)",
    "en": "# Reference only: needs pip install \"langserve[all]\". LangServe is not installed in this course - do not run\nimport uvicorn\nfrom fastapi import FastAPI\nfrom langchain_core.output_parsers import StrOutputParser\nfrom langchain_core.prompts import ChatPromptTemplate\nfrom langchain_deepseek import ChatDeepSeek          # the video uses an OpenAI model\nfrom langserve import add_routes\nfrom llm import API_KEY, MODEL\n\n# The simplest chain: prompt template -> model -> output\nchain = (ChatPromptTemplate.from_template(\"Tell me a joke about {topic}\")\n         | ChatDeepSeek(model=MODEL, api_key=API_KEY)\n         | StrOutputParser())\n\napp = FastAPI(title=\"Joke service\")\nadd_routes(app, chain, path=\"/joke\")    # one line: creates /joke/invoke, /joke/batch, /joke/stream, /joke/playground/ ...\n\nif __name__ == \"__main__\":\n    uvicorn.run(app, host=\"127.0.0.1\", port=9999)"
   }
  },
  {
   "t": "p",
   "zh": "`add_routes(app, chain, path=\"/joke\")` 会自动生成一组接口：\n\n| 接口 | 作用 |\n|---|---|\n| `POST /joke/invoke` | 调用一次，相当于 `chain.invoke(...)` |\n| `POST /joke/batch` | 一次处理多个输入，相当于 `chain.batch([...])` |\n| `POST /joke/stream` | 流式返回，相当于 `chain.stream(...)` |\n| `POST /joke/stream_log` | 流式返回，并带上中间步骤 |\n| `GET /joke/input_schema`、`/output_schema` | 输入、输出的 JSON Schema |\n| `GET /joke/playground/` | 网页上的调试界面 |\n\n下面这段纯 Python 小程序不联网，只是模拟 `add_routes` 替你做的事：把「路径」和「链」对应起来，收到 JSON 就调用链，再把结果转回 JSON。点 ▶ 运行看看：",
   "en": "`add_routes(app, chain, path=\"/joke\")` creates a set of endpoints:\n\n| Endpoint | What it does |\n|---|---|\n| `POST /joke/invoke` | One call, like `chain.invoke(...)` |\n| `POST /joke/batch` | Several inputs at once, like `chain.batch([...])` |\n| `POST /joke/stream` | Streams the result, like `chain.stream(...)` |\n| `POST /joke/stream_log` | Streams, including intermediate steps |\n| `GET /joke/input_schema`, `/output_schema` | JSON Schemas of the input and output |\n| `GET /joke/playground/` | A debugging page in the browser |\n\nThe plain-Python program below uses no network; it only imitates what `add_routes` does for you: map “paths” to “chains”, call the chain when JSON arrives, and turn the result back into JSON. Press ▶ to run it:"
  },
  {
   "t": "code",
   "file": "toy_server.py",
   "run": true,
   "code": {
    "zh": "import json\n\ndef joke_chain(inputs):                  # 假装这是一条 LCEL 链：输入字典，输出文字\n    return f\"（假装的笑话）关于{inputs['topic']}的笑话……\"\n\nroutes = {}                              # 路径 → (接口类型, 链)\n\ndef add_routes(chain, path):             # 模仿 LangServe：一次注册好几个接口\n    routes[path + \"/invoke\"] = (\"invoke\", chain)\n    routes[path + \"/batch\"] = (\"batch\", chain)\n\ndef handle_post(path, body_text):        # 服务器收到一次 POST 请求\n    if path not in routes:\n        return 404, json.dumps({\"detail\": \"Not Found\"})\n    kind, chain = routes[path]           # 元组拆包：一次取出两个值\n    body = json.loads(body_text)         # 请求体：JSON 文本 → 字典\n    if kind == \"invoke\":\n        result = {\"output\": chain(body[\"input\"])}\n    else:\n        result = {\"output\": [chain(x) for x in body[\"inputs\"]]}\n    return 200, json.dumps(result, ensure_ascii=False)    # 字典 → JSON 文本\n\nadd_routes(joke_chain, \"/joke\")\nprint(list(routes))\nprint(handle_post(\"/joke/invoke\", '{\"input\": {\"topic\": \"程序员\"}}'))\nprint(handle_post(\"/joke/batch\", '{\"inputs\": [{\"topic\": \"猫\"}, {\"topic\": \"狗\"}]}'))\nprint(handle_post(\"/joke/stream\", '{\"input\": {\"topic\": \"猫\"}}'))",
    "en": "import json\n\ndef joke_chain(inputs):                  # pretend this is an LCEL chain: dict in, text out\n    return f\"(pretend joke) a joke about {inputs['topic']}...\"\n\nroutes = {}                              # path -> (endpoint kind, chain)\n\ndef add_routes(chain, path):             # mimics LangServe: registers several endpoints at once\n    routes[path + \"/invoke\"] = (\"invoke\", chain)\n    routes[path + \"/batch\"] = (\"batch\", chain)\n\ndef handle_post(path, body_text):        # the server receives one POST request\n    if path not in routes:\n        return 404, json.dumps({\"detail\": \"Not Found\"})\n    kind, chain = routes[path]           # tuple unpacking: two values at once\n    body = json.loads(body_text)         # request body: JSON text -> dict\n    if kind == \"invoke\":\n        result = {\"output\": chain(body[\"input\"])}\n    else:\n        result = {\"output\": [chain(x) for x in body[\"inputs\"]]}\n    return 200, json.dumps(result, ensure_ascii=False)    # dict -> JSON text\n\nadd_routes(joke_chain, \"/joke\")\nprint(list(routes))\nprint(handle_post(\"/joke/invoke\", '{\"input\": {\"topic\": \"programmers\"}}'))\nprint(handle_post(\"/joke/batch\", '{\"inputs\": [{\"topic\": \"cats\"}, {\"topic\": \"dogs\"}]}'))\nprint(handle_post(\"/joke/stream\", '{\"input\": {\"topic\": \"cats\"}}'))"
   }
  },
  {
   "t": "check",
   "q": {
    "zh": "在上面的玩具服务器里，请求没有注册过的 `/joke/stream` 会得到什么？",
    "en": "In the toy server above, what does a request to the unregistered `/joke/stream` get?"
   },
   "options": [
    {
     "zh": "200 和一个笑话",
     "en": "200 and a joke"
    },
    {
     "zh": "404 和 `Not Found`",
     "en": "404 and `Not Found`"
    },
    {
     "zh": "程序崩溃",
     "en": "The program crashes"
    }
   ],
   "answer": 1,
   "explain": {
    "zh": "只有 `add_routes` 注册过的路径才有处理逻辑，其他路径返回 404。真正的 LangServe 还会注册 `/stream` 等接口。",
    "en": "Only paths registered by `add_routes` are handled; anything else returns 404. Real LangServe also registers `/stream` and more."
   }
  },
  {
   "t": "h",
   "zh": "二、运行服务，在 playground 里调试",
   "en": "2. Run it and debug in the playground"
  },
  {
   "t": "p",
   "zh": "[▶ 01:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=51&t=69) 运行服务端后，这条讲笑话的链就变成了本机上的一个 HTTP 服务。LangServe 还会顺带生成一个 **playground** 网页（`/joke/playground/`）。[▶ 01:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=51&t=108) 老师在网页里填一个主题，网页调用后台的服务，得到了笑话；还能展开看中间结果——填好的提示词模板、实际调用 OpenAI 模型时的请求结构等，用来调试很方便。",
   "en": "[▶ 01:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=51&t=69) Once the server runs, the joke chain is an HTTP service on the local machine. LangServe also generates a **playground** page (`/joke/playground/`). [▶ 01:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=51&t=108) The instructor types a topic, the page calls the service behind it, and a joke comes back; he can also expand the intermediate results – the filled-in prompt template, the structure of the actual request to the OpenAI model, and so on – which is handy for debugging."
  },
  {
   "t": "h",
   "zh": "三、客户端：两种调用方式",
   "en": "3. The client: two ways to call it"
  },
  {
   "t": "p",
   "zh": "[▶ 02:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=51&t=141) 既然是 HTTP 服务，任何能发 HTTP 请求的程序都能调用它。老师提到两种方式：用 LangServe 自带的客户端，或者直接发 HTTP 请求（Python 里用 `requests`）。他实际演示的是直接发 HTTP 请求：调用一次讲笑话的服务，拿到的结果和 playground 里一样。下面两种写法都列出来（方式二的 `RemoteRunnable` 是 LangServe 客户端的常见用法，字幕里没有细讲）：",
   "en": "[▶ 02:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=51&t=141) Since it is an HTTP service, any program that can send HTTP requests can call it. The instructor mentions two ways: LangServe's own client, or sending HTTP requests directly (with `requests` in Python). What he actually demonstrates is a direct HTTP request: one call to the joke service, with the same result as in the playground. Both ways are shown below (option 2's `RemoteRunnable` is the usual way to use the LangServe client; the subtitles do not go into it):"
  },
  {
   "t": "code",
   "file": {
    "zh": "langserve_client.py（参考）",
    "en": "langserve_client.py (reference)"
   },
   "code": {
    "zh": "# 参考代码：方式二需要安装 LangServe（本课程没装）\nimport requests\n\n# 方式一：普通的 HTTP 请求。输入要包一层 \"input\"，结果在 \"output\" 里\nr = requests.post(\"http://127.0.0.1:9999/joke/invoke\", json={\"input\": {\"topic\": \"程序员\"}})\nprint(r.json()[\"output\"])\n\n# 方式二：LangServe 自带的客户端 RemoteRunnable，把远程的链当成本地的链来用\nfrom langserve import RemoteRunnable\njoke = RemoteRunnable(\"http://127.0.0.1:9999/joke/\")\nprint(joke.invoke({\"topic\": \"程序员\"}))",
    "en": "# Reference only: option 2 needs LangServe (not installed in this course)\nimport requests\n\n# Option 1: a plain HTTP request. The input is wrapped in \"input\"; the result is in \"output\"\nr = requests.post(\"http://127.0.0.1:9999/joke/invoke\", json={\"input\": {\"topic\": \"programmers\"}})\nprint(r.json()[\"output\"])\n\n# Option 2: LangServe's own client RemoteRunnable, which treats the remote chain like a local one\nfrom langserve import RemoteRunnable\njoke = RemoteRunnable(\"http://127.0.0.1:9999/joke/\")\nprint(joke.invoke({\"topic\": \"programmers\"}))"
   }
  },
  {
   "t": "h",
   "zh": "四、现在怎么跑：用 FastAPI 写出同样的接口",
   "en": "4. Running it today: the same endpoint in FastAPI"
  },
  {
   "t": "warn",
   "zh": "**LangServe 现在不推荐用于新项目。** 它的官方仓库从 2024 年 11 月起标注为 deprecated：只接受社区的 bug 修复，不再加新功能。官方建议改用 LangGraph Platform（2025 年 10 月起改名为 LangSmith Deployment）。本课程环境**没有安装** LangServe，上面两段代码只作对照，照抄会报 `ModuleNotFoundError: No module named 'langserve'`。自己做项目时，用下面几行 FastAPI 就够了。",
   "en": "**LangServe is no longer recommended for new projects.** Since November 2024 its official repository has been marked deprecated: community bug fixes only, no new features. The official advice is LangGraph Platform (renamed LangSmith Deployment in October 2025). LangServe is **not installed** in this course, so the two snippets above are for comparison only; copying them gives `ModuleNotFoundError: No module named 'langserve'`. For your own projects, the few lines of FastAPI below are enough."
  },
  {
   "t": "p",
   "zh": "LangServe 替你做的核心工作，用 FastAPI 几行就能写出来。练习文件 `practice/l50_joke_server.py` 手写了它生成的 `/joke/invoke` 接口，而且**请求和响应的格式和 LangServe 一样**（`{\"input\": {...}}` → `{\"output\": ...}`），所以上面视频里的 `requests` 客户端代码一个字都不用改。`@app.post(...)` 和请求模型第 51 节细讲，这里看懂流程即可：",
   "en": "The core of what LangServe does for you takes only a few lines of FastAPI. The practice file `practice/l50_joke_server.py` writes the `/joke/invoke` endpoint by hand, **with the same request and response shape as LangServe** (`{\"input\": {...}}` → `{\"output\": ...}`), so the video's `requests` client above works without changing a character. `@app.post(...)` and request models are covered in lesson 51; for now just follow the flow:"
  },
  {
   "t": "code",
   "file": "l50_joke_server.py",
   "code": {
    "zh": "from fastapi import FastAPI\nfrom langchain_core.output_parsers import StrOutputParser\nfrom langchain_core.prompts import ChatPromptTemplate\nfrom langchain_deepseek import ChatDeepSeek\nfrom pydantic import BaseModel\nfrom llm import API_KEY, MODEL\n\n# 1. 视频里那条最简单的链（48 节的视频里也有这样一条讲笑话的链）\nprompt = ChatPromptTemplate.from_template(\"讲一个关于{topic}的笑话，不超过三句话。\")\nchain = prompt | ChatDeepSeek(model=MODEL, api_key=API_KEY) | StrOutputParser()\n\n# 2. Web 应用\napp = FastAPI(title=\"Joke chain (LangServe-style API)\")\n\nclass JokeInput(BaseModel):        # 链的输入：{\"topic\": \"...\"}（BaseModel 见 11、12 节）\n    topic: str\n\nclass InvokeRequest(BaseModel):    # 请求体：{\"input\": {\"topic\": \"...\"}}，和 LangServe 一样\n    input: JokeInput\n\n@app.post(\"/joke/invoke\")          # 收到 POST /joke/invoke 时调用这个函数（51 节细讲）\ndef joke_invoke(req: InvokeRequest):\n    text = chain.invoke({\"topic\": req.input.topic})\n    return {\"output\": text}        # 响应体：{\"output\": \"...\"}，和 LangServe 一样\n\nif __name__ == \"__main__\":         # 直接运行这个文件时，才启动服务\n    import uvicorn\n    uvicorn.run(app, host=\"127.0.0.1\", port=9999)",
    "en": "from fastapi import FastAPI\nfrom langchain_core.output_parsers import StrOutputParser\nfrom langchain_core.prompts import ChatPromptTemplate\nfrom langchain_deepseek import ChatDeepSeek\nfrom pydantic import BaseModel\nfrom llm import API_KEY, MODEL\n\n# 1. The video's simplest chain (lesson 48's video has a joke chain just like it)\nprompt = ChatPromptTemplate.from_template(\"Tell me a joke about {topic}, three sentences at most.\")\nchain = prompt | ChatDeepSeek(model=MODEL, api_key=API_KEY) | StrOutputParser()\n\n# 2. The web app\napp = FastAPI(title=\"Joke chain (LangServe-style API)\")\n\nclass JokeInput(BaseModel):        # the chain's input: {\"topic\": \"...\"} (BaseModel: lessons 11 and 12)\n    topic: str\n\nclass InvokeRequest(BaseModel):    # request body: {\"input\": {\"topic\": \"...\"}}, same as LangServe\n    input: JokeInput\n\n@app.post(\"/joke/invoke\")          # called for POST /joke/invoke (details in lesson 51)\ndef joke_invoke(req: InvokeRequest):\n    text = chain.invoke({\"topic\": req.input.topic})\n    return {\"output\": text}        # response body: {\"output\": \"...\"}, same as LangServe\n\nif __name__ == \"__main__\":         # start the server only when this file is run directly\n    import uvicorn\n    uvicorn.run(app, host=\"127.0.0.1\", port=9999)"
   }
  },
  {
   "t": "p",
   "zh": "运行要开**两个终端**：一个启动服务（它会一直运行，等着请求），另一个运行客户端。服务启动后，用浏览器打开 `http://127.0.0.1:9999/docs`：FastAPI 自动生成了一个接口文档页面，点开 `POST /joke/invoke` → Try it out 就能直接在网页上试，作用和 playground 差不多（只是看不到中间步骤）。",
   "en": "You need **two terminals**: one starts the server (it keeps running, waiting for requests), the other runs the client. Once the server is up, open `http://127.0.0.1:9999/docs` in a browser: FastAPI generates an API documentation page; open `POST /joke/invoke` → Try it out to test it right there, much like the playground (just without the intermediate steps)."
  },
  {
   "t": "code",
   "file": "PowerShell",
   "lang": "powershell",
   "code": {
    "zh": "# 终端 1：启动服务（一直运行，按 Ctrl+C 停止）/ terminal 1: start the server (Ctrl+C to stop)\ncd practice\n& ..\\.venv\\Scripts\\python.exe l50_joke_server.py\n\n# 终端 2：调用它 / terminal 2: call it\ncd practice\n& ..\\.venv\\Scripts\\python.exe l50_joke_client.py",
    "en": "# terminal 1: start the server (keeps running; press Ctrl+C to stop)\ncd practice\n& ..\\.venv\\Scripts\\python.exe l50_joke_server.py\n\n# terminal 2: call it\ncd practice\n& ..\\.venv\\Scripts\\python.exe l50_joke_client.py"
   }
  },
  {
   "t": "py",
   "title": {
    "zh": "调用 Web 接口：`requests.post` 和 `response.json()`",
    "en": "Calling a web API: `requests.post` and `response.json()`"
   },
   "zh": "视频里用 `requests` 发 HTTP 请求（`.venv` 里已安装）：\n- `requests.post(url, json=字典)`：`json=` 会把字典转成 JSON 文本作为请求体发出去，并告诉服务器「这是 JSON」；\n- `response.status_code`：状态码。`200` 成功；`404` 路径不存在；`422` 请求体格式不对（比如少了 `input` 这一层）；`500` 服务器内部出错；\n- `response.raise_for_status()`：状态码不是 2xx 就直接报错；\n- `response.json()`：把响应体的 JSON 文本转回字典；\n- `timeout=60`：`requests` 默认**不设超时**，服务器卡住时会一直等下去；模型回答又可能要十几秒，设一个上限更稳妥。\n\n这段代码要连到你自己启动的服务，不能在浏览器里运行，本地文件是 `practice/l50_joke_client.py`。",
   "en": "The video sends HTTP requests with `requests` (installed in `.venv`):\n- `requests.post(url, json=a_dict)`: `json=` turns the dict into JSON text for the request body and tells the server “this is JSON”;\n- `response.status_code`: the status. `200` success; `404` no such path; `422` the request body has the wrong shape (e.g. the `input` layer is missing); `500` the server failed;\n- `response.raise_for_status()`: raise straight away on a non-2xx status;\n- `response.json()`: turn the JSON response body back into a dict;\n- `timeout=60`: `requests` has **no timeout by default** and waits forever if the server hangs; a model can take ten seconds or more, so set a limit.\n\nThis code needs the server you started, so it cannot run in the browser; the local file is `practice/l50_joke_client.py`.",
   "code": {
    "zh": "import requests\n\nURL = \"http://127.0.0.1:9999/joke/invoke\"\n\nresponse = requests.post(URL, json={\"input\": {\"topic\": \"程序员\"}}, timeout=60)\nprint(response.status_code)          # 200 表示成功；422 表示请求体格式不对\nresponse.raise_for_status()          # 状态码不是 2xx 就直接报错，免得后面取值时莫名其妙\ndata = response.json()               # 响应体：JSON 文本 → 字典\nprint(data[\"output\"])",
    "en": "import requests\n\nURL = \"http://127.0.0.1:9999/joke/invoke\"\n\nresponse = requests.post(URL, json={\"input\": {\"topic\": \"programmers\"}}, timeout=60)\nprint(response.status_code)          # 200 means success; 422 means the request body has the wrong shape\nresponse.raise_for_status()          # raise straight away on a non-2xx status, not a confusing error later when reading data\ndata = response.json()               # response body: JSON text -> dict\nprint(data[\"output\"])"
   },
   "run": false
  },
  {
   "t": "tip",
   "zh": "本地实测：直接发 `{\"topic\": \"猫\"}`（少了 `input` 这一层）时，FastAPI 返回 `422`，错误详情里写着缺少 `body.input`，接口函数根本不会被调用。格式检查是请求模型自动做的，不用自己写。",
   "en": "Tested locally: sending `{\"topic\": \"cats\"}` (without the `input` layer) makes FastAPI return `422`, with details saying `body.input` is missing; the endpoint function never runs. The request model does this format check for you."
  },
  {
   "t": "h",
   "zh": "五、LangChain.js",
   "en": "5. LangChain.js"
  },
  {
   "t": "p",
   "zh": "[▶ 02:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=51&t=172) LangChain 还有一个 JavaScript / TypeScript 版本 **LangChain.js**，同样是 LangChain 团队的官方项目。老师说本课以 Python 为主，就不展开了；他还提到，JS 版的接口有些地方甚至比 Python 版还超前一点（以前是落后一点）。\n\n如果你的产品本身是 JavaScript 写的（比如一个 Next.js 网站），可以考虑它；作为 Python 学习者，**认得**就够了。概念几乎一样，写法上的主要差别：\n\n| | Python | JavaScript |\n|---|---|---|\n| 安装 | `pip install langchain` | `npm install langchain @langchain/core` |\n| 把组件串成链 | 竖线运算符（48 节讲的运算符重载） | `.pipe()` 方法，如 `prompt.pipe(model)` |\n| 调用 | `chain.invoke({...})` | `await chain.invoke({...})`（JS 里模型调用都是异步的） |",
   "en": "[▶ 02:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=51&t=172) LangChain also has a JavaScript / TypeScript version, **LangChain.js**, another official project of the LangChain team. The instructor says the course focuses on Python, so he does not go into it; he adds that in places the JS version's API is even slightly ahead of Python's (it used to lag a little).\n\nIf your product is itself written in JavaScript (say a Next.js website), consider it; as a Python learner, **recognising** it is enough. The concepts are almost the same; the main differences in writing:\n\n| | Python | JavaScript |\n|---|---|---|\n| Install | `pip install langchain` | `npm install langchain @langchain/core` |\n| Chaining components | The pipe operator (operator overloading, lesson 48) | The `.pipe()` method, e.g. `prompt.pipe(model)` |\n| Calling | `chain.invoke({...})` | `await chain.invoke({...})` (model calls are asynchronous in JS) |"
  },
  {
   "t": "h",
   "zh": "六、LangChain 和 LlamaIndex",
   "en": "6. LangChain and LlamaIndex"
  },
  {
   "t": "p",
   "zh": "[▶ 03:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=51&t=203) 老师顺带回答了「LangChain 和 LlamaIndex 是什么关系」：不是谁取代谁，而是**错位竞争**，各有侧重（他说之前已经讲过，这里不再展开）：\n- **LangChain**：侧重和**模型**打交道，以及把这些交互流程封装起来（提示词、模型、链、智能体……）；\n- **LlamaIndex**：侧重和**数据**打交道，也就是广义的 RAG（加载、索引、检索你的数据）。",
   "en": "[▶ 03:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=51&t=203) The instructor also answers “how do LangChain and LlamaIndex relate”: neither replaces the other; they **compete in different niches**, each with its own focus (he says this was covered before and does not repeat it):\n- **LangChain** focuses on working with the **model** and wrapping those interaction flows (prompts, models, chains, agents…);\n- **LlamaIndex** focuses on working with **data** – RAG in the broad sense (loading, indexing and retrieving your data)."
  },
  {
   "t": "h",
   "zh": "七、老师的看法：LangChain 到底能不能用？",
   "en": "7. The instructor's view: can LangChain really be used?"
  },
  {
   "t": "p",
   "zh": "[▶ 03:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=51&t=233) 收尾时老师回答了学到这里最实际的问题：LangChain 在项目里到底能不能用？他的个人看法：\n- 它的很多小功能很值得参考，像提示词模板这类组件完全可以直接用；\n- 如果你一定要百分之百自己掌控，它这些组件的代码量不大，可以把需要的部分拷出来改一改，变成一套自己能维护的代码。\n\n这和第 45 节结尾他的评价一致：设计合理的部分放心用，同时留意它的坑——下面就是他说的那个坑。",
   "en": "[▶ 03:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=51&t=233) To wrap up, the instructor answers the most practical question at this point: can LangChain actually be used in projects? His personal view:\n- many of its small features are well worth borrowing, and components such as prompt templates can be used directly;\n- if you insist on 100% control, these components are not much code, so you can copy the parts you need and adapt them into code of your own that you can maintain.\n\nThat matches his verdict at the end of lesson 45: use the well-designed parts with confidence, but watch for its pitfalls – the next part is the pitfall he means."
  },
  {
   "t": "h",
   "zh": "八、一个坑：流式输出停不下来",
   "en": "8. A pitfall: a stream you cannot stop"
  },
  {
   "t": "p",
   "zh": "[▶ 04:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=51&t=265) 老师说他遇到的最大的坑是：用 LangChain 的**流式调用**时，流一旦开始，就没有办法让它停下来。这在产品里是个问题：用户和模型有大段文字交互时，可能出于各种原因想中途停止——不想再花 token、不想再等、发现前面已经答错了，或者要离开了。JS 版有能停止流的接口，Python 版没有；他说这是 LangChain 升级到新版本之后遇到的最大的坑（字幕识别成「二点几」，很可能指的是 0.2 版）。（第 45 节结尾他预告过「流式调用有坑」，说的就是这个。）",
   "en": "[▶ 04:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=51&t=265) The instructor says the biggest pitfall he has hit is this: with LangChain's **streaming calls**, once a stream has started there is no way to make it stop. In a product that is a problem: during a long text exchange with the model, the user may want to stop midway for all sorts of reasons – not wanting to spend more tokens, not wanting to wait, seeing the answer has already gone wrong, or having to leave. The JS version has an interface for stopping a stream; the Python version does not. He calls it the biggest pitfall he met after LangChain upgraded to its new version (the subtitles read “two-point-something”, most likely version 0.2). (At the end of lesson 45 he announced that “streaming calls have a pitfall” – this is it.)"
  },
  {
   "t": "note",
   "title": {
    "zh": "📝 补充：在 LangChain 1.x 里实测",
    "en": "📝 Extra: tested on LangChain 1.x"
   },
   "zh": "我们在本机（langchain-core 1.6.6）用一个**模拟的流式服务器**（每 0.25 秒发一段，一共 40 段）测了三种写法，都是收到几段之后就 `break`：\n\n| 写法 | `break` 之后 | 服务器那边 |\n|---|---|---|\n| 同步：`for piece in chain.stream(...)`（LCEL 链） | 要等约 10 秒，整段回答全部生成完，循环才真正结束 | 40 段全部发完 |\n| 同步：`for chunk in model.stream(...)`（直接用模型） | 立刻结束 | 连接断开，只发了 `break` 前的几段 |\n| 异步：`async for piece in chain.astream(...)` | 立刻结束 | 连接断开，只发了 `break` 前的几段 |\n\n再用真实的 deepseek-flash 跑练习文件 `practice/l50_stream_stop.py`（收到 10 段就 `break`）：同步版 0.8 秒时 `break`，循环到 4.1 秒、整篇故事生成完才结束；异步版 0.7 秒 `break`，循环当场结束。\n\n也就是说，老师说的坑在**同步的链**上现在仍然存在：`break` 只是你不再往下读了，后台还会把整段读完。要做「停止生成」按钮，就用**异步**写法：在 `async for` 里 `break`，或者把这次调用放进一个 asyncio 任务，需要停时 `task.cancel()`（实测同样立刻停止）。异步的写法见第 09 节。",
   "en": "On this machine (langchain-core 1.6.6) we tested three ways of writing it against a **mock streaming server** (one piece every 0.25 s, 40 pieces in all), each doing a `break` after a few pieces:\n\n| Code | After `break` | On the server |\n|---|---|---|\n| Sync: `for piece in chain.stream(...)` (an LCEL chain) | About 10 s pass – the whole answer is generated – before the loop really ends | All 40 pieces sent |\n| Sync: `for chunk in model.stream(...)` (the model directly) | Ends at once | Connection closed; only the pieces before `break` were sent |\n| Async: `async for piece in chain.astream(...)` | Ends at once | Connection closed; only the pieces before `break` were sent |\n\nThen we ran the practice file `practice/l50_stream_stop.py` against the real deepseek-flash (`break` after 10 pieces): the sync version hit `break` at 0.8 s, but the loop only ended at 4.1 s, once the whole story had been generated; the async version hit `break` at 0.7 s and the loop ended on the spot.\n\nIn other words, the instructor's pitfall still exists for **synchronous chains**: `break` only means you stop reading; in the background the whole answer is still read to the end. For a “stop generating” button, use the **async** version: `break` inside `async for`, or put the call in an asyncio task and `task.cancel()` it when you need to stop (tested: it also stops at once). For async code, see lesson 09."
  },
  {
   "t": "code",
   "file": {
    "zh": "stop_stream.py（完整对比见 practice/l50_stream_stop.py）",
    "en": "stop_stream.py (full comparison: practice/l50_stream_stop.py)"
   },
   "code": {
    "zh": "import asyncio\nfrom langchain_core.output_parsers import StrOutputParser\nfrom langchain_core.prompts import ChatPromptTemplate\nfrom langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\n# 关闭思考模式：思考阶段的每一段在 StrOutputParser 之后都是空字符串 \"\"\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY, extra_body={\"thinking\": {\"type\": \"disabled\"}})\nchain = ChatPromptTemplate.from_template(\"写一个关于{topic}的小故事，大约 500 字。\") | model | StrOutputParser()\n\nasync def main():\n    count = 0\n    async for piece in chain.astream({\"topic\": \"狗\"}):   # 异步流式（async for 见 09 节）\n        if not piece:            # 跳过空字符串，否则还没看到正文就数满 10 段了\n            continue\n        print(piece, end=\"\", flush=True)\n        count += 1\n        if count == 10:          # 用户点了「停止」：break 之后连接立刻断开，不再继续生成\n            break\n\nasyncio.run(main())",
    "en": "import asyncio\nfrom langchain_core.output_parsers import StrOutputParser\nfrom langchain_core.prompts import ChatPromptTemplate\nfrom langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\n# Thinking mode off: every piece of the thinking phase is an empty string \"\" after StrOutputParser\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY, extra_body={\"thinking\": {\"type\": \"disabled\"}})\nchain = ChatPromptTemplate.from_template(\"Write a short story about {topic}, about 500 words.\") | model | StrOutputParser()\n\nasync def main():\n    count = 0\n    async for piece in chain.astream({\"topic\": \"a dog\"}):   # async streaming (async for: lesson 09)\n        if not piece:            # skip empty strings, or the count reaches 10 before any story text appears\n            continue\n        print(piece, end=\"\", flush=True)\n        count += 1\n        if count == 10:          # the user pressed \"stop\": after break the connection closes at once, no more generation\n            break\n\nasyncio.run(main())"
   }
  },
  {
   "t": "tip",
   "zh": "上面代码里的两处处理不能省：deepseek-flash 默认开着思考模式，流的开头是一长串「思考」片段，经过 `StrOutputParser` 后每段都是空字符串 `\"\"`。本机用模拟服务器实测：如果不跳过空字符串，`count` 在思考阶段就数到了 10，`break` 时一个正文字都还没打印出来。",
   "en": "Neither of the two measures in the code above can be left out: deepseek-flash has thinking mode on by default, so the stream starts with a long run of “thinking” pieces, and after `StrOutputParser` each of them is an empty string `\"\"`. Tested on this machine with the mock server: without skipping empty strings, `count` reached 10 during the thinking phase, and at `break` not a single character of the answer had been printed yet."
  },
  {
   "t": "h",
   "zh": "九、作业",
   "en": "9. Homework"
  },
  {
   "t": "p",
   "zh": "[▶ 04:56](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=51&t=296) 老师留的作业：从你自己手头的项目里挑一个——小 demo、小工具，只要是调用大模型的都行——用 LangChain 改写一遍，亲自体会它在真实开发里能帮上多少忙。\n\n在本课程里，一个现成的选择是：用 LangChain（`ChatDeepSeek` + `@tool` + `create_agent`，见 45、49 节）重写第 05–07 节手写的查天气智能体，再对比两版代码的长短和可读性。",
   "en": "[▶ 04:56](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=51&t=296) The instructor's homework: take a small demo or tool you are working on – anything built on an LLM – and try rewriting it with LangChain, to see for yourself how much it helps in real development.\n\nWithin this course, a ready-made choice: rewrite the weather agent you hand-wrote in lessons 05–07 with LangChain (`ChatDeepSeek` + `@tool` + `create_agent`, see lessons 45 and 49), then compare the two versions for length and readability."
  }
 ],
 "quiz": [
  {
   "q": {
    "zh": "用 LangServe 执行 `add_routes(app, chain, path=\"/joke\")` 后，想调用一次这条链，应该请求哪个接口？",
    "en": "After `add_routes(app, chain, path=\"/joke\")`, which endpoint calls the chain once?"
   },
   "options": [
    {
     "zh": "`GET /joke`",
     "en": "`GET /joke`"
    },
    {
     "zh": "`POST /joke/invoke`",
     "en": "`POST /joke/invoke`"
    },
    {
     "zh": "`POST /invoke/joke`",
     "en": "`POST /invoke/joke`"
    },
    {
     "zh": "`GET /joke/playground/`",
     "en": "`GET /joke/playground/`"
    }
   ],
   "answer": 1,
   "explain": {
    "zh": "路径前缀 + 方法名：`/joke/invoke` 对应 `invoke`，`/joke/batch` 对应 `batch`；`playground` 是网页调试界面。",
    "en": "Path prefix + method name: `/joke/invoke` maps to `invoke`, `/joke/batch` to `batch`; `playground` is the debugging page."
   }
  },
  {
   "q": {
    "zh": "关于 LangServe 现在的状态，哪一项是对的？",
    "en": "Which statement about LangServe today is correct?"
   },
   "options": [
    {
     "zh": "是 LangChain 1.x 自带的功能，不用安装",
     "en": "It is built into LangChain 1.x, nothing to install"
    },
    {
     "zh": "已经从网上删除，无法安装",
     "en": "It has been removed and cannot be installed"
    },
    {
     "zh": "官方推荐所有新项目使用",
     "en": "It is officially recommended for all new projects"
    },
    {
     "zh": "官方已标为 deprecated，只修 bug、不加新功能；新项目可以自己用 FastAPI 包装，或用 LangSmith Deployment",
     "en": "It is officially deprecated – bug fixes only, no new features; new projects can wrap chains with FastAPI themselves or use LangSmith Deployment"
    }
   ],
   "answer": 3,
   "explain": {
    "zh": "它还能安装，但不再发展。本课程用几行 FastAPI 实现了同样格式的 `/joke/invoke`。",
    "en": "It can still be installed but is no longer developed. This course builds the same-format `/joke/invoke` in a few lines of FastAPI."
   }
  },
  {
   "q": {
    "zh": "`requests.post(URL, json={\"input\": {\"topic\": \"猫\"}})` 里的 `json=` 起什么作用？",
    "en": "What does `json=` do in `requests.post(URL, json={\"input\": {\"topic\": \"cats\"}})`?"
   },
   "options": [
    {
     "zh": "把字典转成 JSON 文本作为请求体发出去",
     "en": "Turns the dict into JSON text sent as the request body"
    },
    {
     "zh": "把服务器返回的结果转成字典",
     "en": "Turns the server's reply into a dict"
    },
    {
     "zh": "指定服务器的地址",
     "en": "Sets the server address"
    },
    {
     "zh": "只是一个说明，没有作用",
     "en": "It is only a label with no effect"
    }
   ],
   "answer": 0,
   "explain": {
    "zh": "发出去用 `json=`（字典 → JSON），收回来用 `response.json()`（JSON → 字典）。",
    "en": "Sending uses `json=` (dict → JSON); receiving uses `response.json()` (JSON → dict)."
   }
  },
  {
   "q": {
    "zh": "客户端向本课程的 `POST /joke/invoke` 发送 `{\"topic\": \"猫\"}`（少了 `input` 这一层），会发生什么？",
    "en": "A client sends `{\"topic\": \"cats\"}` (no `input` layer) to this course's `POST /joke/invoke`. What happens?"
   },
   "options": [
    {
     "zh": "返回 200 和一个笑话",
     "en": "It returns 200 and a joke"
    },
    {
     "zh": "服务器崩溃，返回 500",
     "en": "The server crashes with 500"
    },
    {
     "zh": "FastAPI 返回 422，说明缺少 `input`，接口函数不会被调用",
     "en": "FastAPI returns 422 saying `input` is missing; the endpoint function never runs"
    },
    {
     "zh": "返回 404",
     "en": "It returns 404"
    }
   ],
   "answer": 2,
   "explain": {
    "zh": "请求模型先检查请求体的格式，不符合就直接返回 422（本机实测）。真正的 LangServe 也要求输入包在 `input` 里。",
    "en": "The request model checks the body first and returns 422 on a mismatch (tested here). Real LangServe also expects the input wrapped in `input`."
   }
  },
  {
   "q": {
    "zh": "按老师的说法，LlamaIndex 和 LangChain 相比侧重什么？",
    "en": "According to the instructor, what does LlamaIndex focus on compared with LangChain?"
   },
   "options": [
    {
     "zh": "和模型交互、封装调用流程",
     "en": "Working with models and wrapping the call flow"
    },
    {
     "zh": "和数据打交道，也就是广义的 RAG",
     "en": "Working with data, i.e. RAG in the broad sense"
    },
    {
     "zh": "JavaScript 开发",
     "en": "JavaScript development"
    },
    {
     "zh": "部署 Web 服务",
     "en": "Deploying web services"
    }
   ],
   "answer": 1,
   "explain": {
    "zh": "两者是错位竞争：LangChain 侧重模型交互和流程封装，LlamaIndex 侧重数据（加载、索引、检索）。",
    "en": "They compete in different niches: LangChain focuses on model interaction and flow wrapping, LlamaIndex on data (loading, indexing, retrieval)."
   }
  },
  {
   "q": {
    "zh": "在 LangChain 1.x 里，想让用户能中途停止一段流式回答，按本节的实测应该怎么写？",
    "en": "On LangChain 1.x, per this lesson's test, how should you write streaming so the user can stop it midway?"
   },
   "options": [
    {
     "zh": "同步 `for piece in chain.stream(...)` 里 `break` 就行，立刻停止",
     "en": "`break` inside a sync `for piece in chain.stream(...)` stops it at once"
    },
    {
     "zh": "没有任何办法，只能等它生成完",
     "en": "There is no way; wait until it finishes"
    },
    {
     "zh": "用异步 `chain.astream(...)`：在 `async for` 里 `break`，或把调用放进 asyncio 任务再 `task.cancel()`",
     "en": "Use the async `chain.astream(...)`: `break` inside `async for`, or run it as an asyncio task and `task.cancel()`"
    },
    {
     "zh": "把 `timeout` 设成 0",
     "en": "Set `timeout` to 0"
    }
   ],
   "answer": 2,
   "explain": {
    "zh": "实测：同步链里 `break` 后还要等整段生成完；异步的 `break` 或取消任务会立刻断开连接。",
    "en": "Tested: after `break` in a sync chain you still wait for the whole answer; an async `break` or task cancel closes the connection at once."
   }
  }
 ],
 "fill": [
  {
   "title": {
    "zh": "服务端：把链挂到 POST /joke/invoke",
    "en": "Server: hang the chain on POST /joke/invoke"
   },
   "code": {
    "zh": "class JokeInput(BaseModel):\n    topic: str\n\nclass InvokeRequest(BaseModel):\n    input: [[JokeInput]]\n\n@app.[[post]](\"/joke/invoke\")\ndef joke_invoke(req: [[InvokeRequest]]):\n    text = chain.[[invoke]]({\"topic\": req.input.[[topic]]})\n    return {\"[[output]]\": text}",
    "en": "class JokeInput(BaseModel):\n    topic: str\n\nclass InvokeRequest(BaseModel):\n    input: [[JokeInput]]\n\n@app.[[post]](\"/joke/invoke\")\ndef joke_invoke(req: [[InvokeRequest]]):\n    text = chain.[[invoke]]({\"topic\": req.input.[[topic]]})\n    return {\"[[output]]\": text}"
   },
   "explain": {
    "zh": "`@app.post` 指定方法和路径；参数的类型是请求模型；函数里调用链，按 LangServe 的格式把结果放进 `output` 返回。",
    "en": "`@app.post` sets the method and path; the parameter's type is the request model; the function calls the chain and returns the result under `output`, LangServe-style."
   }
  },
  {
   "title": {
    "zh": "客户端：调用 /joke/invoke",
    "en": "Client: call /joke/invoke"
   },
   "code": {
    "zh": "import requests\n\nresponse = requests.[[post]](\"http://127.0.0.1:9999/joke/invoke\", [[json]]={\"[[input]]\": {\"topic\": \"程序员\"}}, [[timeout]]=60)\nresponse.[[raise_for_status]]()\nprint(response.[[json]]()[\"output\"])",
    "en": "import requests\n\nresponse = requests.[[post]](\"http://127.0.0.1:9999/joke/invoke\", [[json]]={\"[[input]]\": {\"topic\": \"programmers\"}}, [[timeout]]=60)\nresponse.[[raise_for_status]]()\nprint(response.[[json]]()[\"output\"])"
   },
   "explain": {
    "zh": "发请求用 `requests.post` 加 `json=`，输入包在 `input` 里；设上 `timeout`；读结果用 `response.json()`。",
    "en": "Send with `requests.post` and `json=`, the input wrapped in `input`; set a `timeout`; read the result with `response.json()`."
   }
  }
 ],
 "write": [
  {
   "title": {
    "zh": "手写：调用讲笑话服务的客户端",
    "en": "Write it yourself: a client for the joke service"
   },
   "task": {
    "zh": "不看上面的代码，写一个客户端：\n1. 导入 `requests`，定义 `URL`；\n2. 定义 `tell_joke(topic)`：用 `requests.post` 按 LangServe 的格式发请求（`{\"input\": {\"topic\": ...}}`，带 `timeout`），`raise_for_status()`，返回 `response.json()[\"output\"]`；\n3. 调用它并打印。\n\n本地验证：先启动 `practice/l50_joke_server.py`，再运行你的代码（参考 `practice/l50_joke_client.py`）。",
    "en": "Without looking at the code above, write a client:\n1. Import `requests` and define `URL`;\n2. Define `tell_joke(topic)`: send a LangServe-style request with `requests.post` (`{\"input\": {\"topic\": ...}}`, with a `timeout`), call `raise_for_status()`, and return `response.json()[\"output\"]`;\n3. Call it and print the result.\n\nTo check locally: start `practice/l50_joke_server.py`, then run your code (reference: `practice/l50_joke_client.py`)."
   },
   "starter": {
    "zh": "# 先在另一个终端启动 l50_joke_server.py\n# 1. 导入 requests，定义 URL（http://127.0.0.1:9999/joke/invoke）\n\n\n# 2. 定义函数 tell_joke(topic)：发 POST 请求（LangServe 的格式：输入包在 \"input\" 里，设置超时），\n#    状态码不对就报错，返回结果里的 \"output\"\n\n\n# 3. 调用 tell_joke(\"程序员\") 并打印",
    "en": "# Start l50_joke_server.py in another terminal first\n# 1. Import requests and define URL (http://127.0.0.1:9999/joke/invoke)\n\n\n# 2. Define tell_joke(topic): send a POST request (LangServe's shape: the input wrapped in \"input\",\n#    with a timeout), raise on a bad status, return the result's \"output\"\n\n\n# 3. Call tell_joke(\"programmers\") and print it"
   },
   "solution": {
    "zh": "# 先在另一个终端启动 l50_joke_server.py\n# 1. 导入 requests，定义 URL（http://127.0.0.1:9999/joke/invoke）\nimport requests\n\nURL = \"http://127.0.0.1:9999/joke/invoke\"\n\n# 2. 定义函数 tell_joke(topic)：发 POST 请求（LangServe 的格式：输入包在 \"input\" 里，设置超时），\n#    状态码不对就报错，返回结果里的 \"output\"\ndef tell_joke(topic):\n    response = requests.post(URL, json={\"input\": {\"topic\": topic}}, timeout=60)\n    response.raise_for_status()\n    return response.json()[\"output\"]\n\n# 3. 调用 tell_joke(\"程序员\") 并打印\nprint(tell_joke(\"程序员\"))",
    "en": "# Start l50_joke_server.py in another terminal first\n# 1. Import requests and define URL (http://127.0.0.1:9999/joke/invoke)\nimport requests\n\nURL = \"http://127.0.0.1:9999/joke/invoke\"\n\n# 2. Define tell_joke(topic): send a POST request (LangServe's shape: the input wrapped in \"input\",\n#    with a timeout), raise on a bad status, return the result's \"output\"\ndef tell_joke(topic):\n    response = requests.post(URL, json={\"input\": {\"topic\": topic}}, timeout=60)\n    response.raise_for_status()\n    return response.json()[\"output\"]\n\n# 3. Call tell_joke(\"programmers\") and print it\nprint(tell_joke(\"programmers\"))"
   },
   "checks": [
    {
     "re": "^import\\s+requests",
     "zh": "导入 `requests`",
     "en": "Import `requests`"
    },
    {
     "re": "def\\s+tell_joke\\s*\\(\\s*\\w+\\s*\\)\\s*:",
     "zh": "定义了 `tell_joke(topic)`",
     "en": "Define `tell_joke(topic)`"
    },
    {
     "re": "requests\\.post\\(",
     "zh": "用 `requests.post(...)` 发请求",
     "en": "Send with `requests.post(...)`"
    },
    {
     "re": "json\\s*=\\s*\\{\\s*[\\\"']input[\\\"']\\s*:",
     "zh": "请求体是 `{\"input\": ...}`",
     "en": "The body is `{\"input\": ...}`"
    },
    {
     "re": "timeout\\s*=",
     "zh": "设置了 `timeout`",
     "en": "Set a `timeout`"
    },
    {
     "re": "\\.raise_for_status\\(\\)",
     "zh": "调用了 `raise_for_status()`",
     "en": "Call `raise_for_status()`"
    },
    {
     "re": "\\.json\\(\\)\\s*\\[\\s*[\\\"']output[\\\"']\\s*\\]",
     "zh": "从 `response.json()[\"output\"]` 取结果",
     "en": "Read `response.json()[\"output\"]`"
    }
   ]
  }
 ],
 "pitfalls": [
  {
   "zh": "照抄视频的 `from langserve import add_routes`：本课程环境没装 LangServe，报 `ModuleNotFoundError`。它已不再开发新功能，用 FastAPI 自己写几行就能替代。",
   "en": "Copying the video's `from langserve import add_routes`: LangServe is not installed here, so you get `ModuleNotFoundError`. It gets no new features; a few lines of FastAPI replace it."
  },
  {
   "zh": "服务还没启动就运行客户端，报 `requests.ConnectionError`。先在另一个终端启动服务。",
   "en": "Running the client before the server: `requests.ConnectionError`. Start the server in another terminal first."
  },
  {
   "zh": "忘了把输入包进 `{\"input\": ...}`：返回 `422`；结果在 `output` 里，不在别的字段。",
   "en": "Forgetting to wrap the input in `{\"input\": ...}`: you get `422`; the result is under `output`, not some other field."
  },
  {
   "zh": "端口被占用：另一个程序已经在用 9999，启动时报 `error while attempting to bind on address`（Windows 上还会说每个套接字地址只允许使用一次）。关掉之前那个服务，或者服务端、客户端一起换个端口。",
   "en": "Port in use: another program already holds 9999, and start-up fails with `error while attempting to bind on address` (on Windows it also says each socket address may only be used once). Stop the earlier server, or change the port in both server and client."
  },
  {
   "zh": "改了服务端代码却没重启服务：正在运行的还是旧代码。按 Ctrl+C 停止再重新运行。",
   "en": "Changing the server code without restarting: the old code is still running. Press Ctrl+C and start it again."
  },
  {
   "zh": "`requests.post` 没设 `timeout`：默认会一直等下去，服务器卡住时程序也跟着卡住。",
   "en": "No `timeout` on `requests.post`: by default it waits forever, so a stuck server freezes your program too."
  },
  {
   "zh": "以为同步 `chain.stream(...)` 里 `break` 就能省下后面的 token：实测循环要等整段回答生成完才结束。要能中途停止，用 `astream` 的异步写法。",
   "en": "Assuming `break` in a sync `chain.stream(...)` saves the remaining tokens: in tests the loop only ends after the whole answer is generated. To stop midway, use async `astream`."
  }
 ],
 "recap": [
  {
   "zh": "把链部署成 Web 服务 = 收 HTTP 请求 → 调用链 → 返回 JSON；API key 只留在服务器上。",
   "en": "Deploying a chain as a web service = receive an HTTP request → call the chain → return JSON; the API key stays on the server."
  },
  {
   "zh": "LangServe：FastAPI + `add_routes(app, chain, path=\"/joke\")` 自动生成 `/invoke`、`/batch`、`/stream`、`/playground/` 等接口；它已停止开发新功能，本课程没有安装。",
   "en": "LangServe: FastAPI + `add_routes(app, chain, path=\"/joke\")` creates `/invoke`, `/batch`, `/stream`, `/playground/` and more; it no longer gets new features and is not installed here."
  },
  {
   "zh": "今天的做法：FastAPI 写一个 `@app.post(\"/joke/invoke\")`，格式和 LangServe 一样；`/docs` 页面可以直接试用。",
   "en": "Today: write `@app.post(\"/joke/invoke\")` in FastAPI with LangServe's format; try it on the `/docs` page."
  },
  {
   "zh": "客户端：`requests.post(url, json={\"input\": {...}}, timeout=60)`，`raise_for_status()`，`response.json()[\"output\"]`。",
   "en": "Client: `requests.post(url, json={\"input\": {...}}, timeout=60)`, `raise_for_status()`, `response.json()[\"output\"]`."
  },
  {
   "zh": "LangChain.js 是官方的 JS 版本（串链用 `.pipe()`）；LangChain 侧重模型交互和流程封装，LlamaIndex 侧重数据（RAG）。",
   "en": "LangChain.js is the official JS version (chains use `.pipe()`); LangChain focuses on model interaction and flows, LlamaIndex on data (RAG)."
  },
  {
   "zh": "老师说的流式坑：Python 版流一旦开始停不下来。1.x 实测：同步链 `break` 后仍会读完整段；要能中途停止，用 `astream`（`async for` 里 `break` 或 `task.cancel()`）。",
   "en": "The instructor's streaming pitfall: a Python stream cannot be stopped once started. Tested on 1.x: a sync chain still reads to the end after `break`; to stop midway use `astream` (`break` inside `async for`, or `task.cancel()`)."
  }
 ],
 "files": [
  {
   "path": "practice/l50_joke_server.py",
   "zh": "服务端：用 FastAPI 把讲笑话的链挂到 `POST /joke/invoke`（格式和 LangServe 一样），启动后可打开 `/docs` 试用。",
   "en": "Server: the joke chain on `POST /joke/invoke` with FastAPI (LangServe's format); once it runs, open `/docs` to try it."
  },
  {
   "path": "practice/l50_joke_client.py",
   "zh": "客户端：像视频那样用 `requests.post` 调用上面的服务（先启动服务端）。",
   "en": "Client: call the service with `requests.post`, as in the video (start the server first)."
  },
  {
   "path": "practice/l50_stream_stop.py",
   "zh": "演示：同步 `chain.stream` 和异步 `chain.astream` 收到 10 段后 `break`，对比循环真正结束的时间（调用模型 2 次）。",
   "en": "Demo: break after 10 pieces with sync `chain.stream` and async `chain.astream`, comparing when each loop really ends (2 model calls)."
  }
 ]
});
