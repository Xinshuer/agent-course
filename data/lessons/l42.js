COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l42",
  "priority": "important",
  "handwrite": true,
  "studyMinutes": 75,
  "source": "subtitle",
  "summary": {
    "zh": "视频里的「小浪助手（多智能体版）」是一个完整项目：前端是会说话的数字人网页（微软云 WebRTC），后端是 FastAPI 服务器，用 WebSocket 实时通信，核心是一支多智能体团队——主管「小浪」带着信息搜索专家和 AI 应用程序员。这一节按视频的顺序走一遍：项目结构、服务器（心跳、thread_id、流式推送）、视频里 `create_supervisor` 的写法，然后在本机重建这支团队——两位员工用 `create_agent` 做，主管把员工当成工具来调用，checkpointer + `thread_id` 给每个用户一份记忆；服务器有一个可运行的对照文件，数字人只讲思路。",
    "en": "The video's “Xiaolang assistant (multi-agent edition)” is a complete project: a talking digital-human web page (Azure WebRTC) in front, a FastAPI server behind it talking over WebSocket, and at its core a multi-agent team – the supervisor “Xiaolang” leading a research expert and an AI programmer. This lesson follows the video's order: the project layout, the server (heartbeat, thread_id, streaming), the video's `create_supervisor` code; then it rebuilds the team on your machine – two workers from `create_agent`, a supervisor that calls them as tools, and a checkpointer + `thread_id` giving every user their own memory. The server has a runnable comparison file; the avatar is covered as concepts only."
  },
  "goals": [
    {
      "zh": "说出视频项目的结构：数字人前端 + WebSocket + FastAPI 服务器 + 多智能体后台，以及服务器里心跳、thread_id、流式推送分别在做什么",
      "en": "Describe the video project – avatar front end + WebSocket + FastAPI server + multi-agent backend – and what the heartbeat, thread_id and streaming do in the server"
    },
    {
      "zh": "看懂视频里 `create_supervisor` + 两个 `create_react_agent` 的写法，知道在 LangGraph 1.x 里该怎么换",
      "en": "Read the video's `create_supervisor` + two `create_react_agent` code, and know what replaces it in LangGraph 1.x"
    },
    {
      "zh": "用 `create_agent` 做出两位带工具的员工（查手册、运行代码），并单独测试",
      "en": "Build two workers with tools (handbook search, running code) using `create_agent`, and test each alone"
    },
    {
      "zh": "把员工包装成工具交给主管 Agent——这就是 `create_supervisor` 的思路",
      "en": "Wrap the workers as tools for a supervisor agent – the idea behind `create_supervisor`"
    },
    {
      "zh": "用 checkpointer + `thread_id` 给每个用户一份短期记忆，并认得忘传 thread_id 时的报错",
      "en": "Give every user their own short-term memory with a checkpointer + `thread_id`, and recognise the error when thread_id is missing"
    },
    {
      "zh": "用 `sorted(..., key=...)` 写一个简单的本地检索工具",
      "en": "Write a simple local search tool with `sorted(..., key=...)`"
    }
  ],
  "blocks": [
    {
      "t": "h",
      "zh": "一、视频演示：一个会说话的多智能体客服",
      "en": "1. The demo: a talking multi-agent help desk"
    },
    {
      "t": "p",
      "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=0) 这是 LangGraph 部分的综合实战。老师提到之前做过单智能体版的小浪助手，这一版是**多智能体版**，有三个特色：基于微软云 TTS Avatar 的 WebRTC **数字人**、**多智能体**系统、**WebSocket** 通信。\n\n[▶ 01:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=63) 先看演示：本地网页上方是一个会说话的数字人，画面由微软云实时合成、推送到浏览器；下方的聊天通过 WebSocket 连到后台的多智能体系统，它的定位是一个帮你学 LangChain 的客服。[▶ 01:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=94) 老师打了招呼、切换了几种语音，[▶ 02:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=127) 问「LangChain 里怎样最快实现一条最简单的链」，[▶ 03:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=224) 又问 LangChain 有哪些竞品，[▶ 05:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=322) 最后道别。",
      "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=0) This is the capstone project of the LangGraph part. The instructor mentions an earlier single-agent Xiaolang; this is the **multi-agent edition**, with three highlights: a WebRTC **digital human** based on Azure's TTS Avatar, a **multi-agent** system, and **WebSocket** communication.\n\n[▶ 01:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=63) First the demo: at the top of a local web page a digital human talks, its video synthesised by Azure in real time and streamed to the browser; below it, the chat goes over WebSocket to the multi-agent backend, positioned as a help desk for learning LangChain. [▶ 01:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=94) The instructor says hello and switches between voices, [▶ 02:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=127) asks for the quickest way to build the simplest chain in LangChain, [▶ 03:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=224) asks about LangChain's competitors, [▶ 05:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=322) and says goodbye."
    },
    {
      "t": "p",
      "zh": "视频里的小浪是一个帮你学 LangChain 的 AI 客服，由四块组成：\n\n| 部分 | 用了什么 | 做什么 |\n|---|---|---|\n| 前端网页 | 一个普通的 HTML 页面 + 微软云的数字人（WebRTC） | 显示会说话的数字人和聊天框 |\n| 通信 | WebSocket | 浏览器和服务器之间双向、实时地收发消息 |\n| 服务器 | FastAPI + uvicorn | 收到问题就交给多智能体，把回答一段段推回浏览器 |\n| 多智能体后台 | LangGraph 的主管 + 两位员工 | 真正回答问题的部分 |\n\n只有最后一块是 Agent，也是这一节要动手做的部分。",
      "en": "In the video, Xiaolang is an AI help desk for learning LangChain, made of four parts:\n\n| Part | Built with | Job |\n|---|---|---|\n| Front-end page | A plain HTML page + Microsoft Azure's digital human (WebRTC) | Shows the talking avatar and the chat box |\n| Connection | WebSocket | Two-way, real-time messages between browser and server |\n| Server | FastAPI + uvicorn | Hands each question to the agents and streams the answer back |\n| Multi-agent backend | A LangGraph supervisor + two workers | The part that actually answers |\n\nOnly the last part is the agent, and it's the part this lesson builds."
    },
    {
      "t": "code",
      "file": "architecture",
      "lang": "text",
      "code": {
        "zh": "浏览器（show.html）                         服务器（FastAPI，端口 8000）\n+--------------------------+   WebSocket   +-------------------------------------------+\n| 数字人视频（微软云 WebRTC） | <-----------> | /ws/chat：收消息 → 运行多智能体 → 流式推回 |\n| 聊天框                    |  ping / pong  |          → 情绪识别链 → 数字人动作         |\n+--------------------------+               +---------------------+---------------------+\n                                                                 |\n                                       多智能体后台（本节要做的部分）\n                                       小浪（主管） --+--> 信息搜索专家（搜索工具）\n                                                      +--> AI 应用程序员（运行 Python）",
        "en": "Browser (show.html)                          Server (FastAPI, port 8000)\n+---------------------------+   WebSocket   +--------------------------------------------+\n| avatar (Azure WebRTC)     | <-----------> | /ws/chat: receive -> run the agents ->     |\n| chat box                  |  ping / pong  |   stream back -> mood chain -> avatar move |\n+---------------------------+               +---------------------+----------------------+\n                                                                  |\n                                      Multi-agent backend (what this lesson builds)\n                                      Xiaolang (supervisor) --+--> research expert (search tool)\n                                                              +--> AI programmer (runs Python)"
      }
    },
    {
      "t": "tip",
      "zh": "演示里有三个值得留意的细节：\n- 数字人把回答里的 Markdown 符号（加粗用的星号）和整段代码也念了出来。回答要拿去做语音时，应该在提示词里要求**输出纯文字**。\n- 它推荐的「最简单的链」是 `LLMChain` 的老写法，在 LangChain 1.x 里早已过时（48 节学 LCEL）。模型的知识会过时，这正是 40 节让助手先读文档的原因。\n- 提示词明明要求「不要透露分配任务的过程」，小浪道别时还是说出了「按问题类型分派给团队成员」。提示词里的规则只是要求，不是保证。",
      "en": "Three details in the demo are worth noting:\n- The avatar reads out the Markdown symbols in the answer (the asterisks used for bold) and whole code blocks. When answers are going to be spoken, ask for **plain text** in the prompt.\n- Its “simplest chain” is the old `LLMChain` style, long outdated in LangChain 1.x (LCEL comes in lesson 48). A model's knowledge goes stale – exactly why lesson 40's assistant reads docs first.\n- The prompt says “don't reveal how tasks are assigned”, yet Xiaolang's goodbye mentions routing questions to team members by type. Rules in a prompt are requests, not guarantees."
    },
    {
      "t": "video",
      "zh": "视频约 35 分钟。老师没有逐行敲代码（[▶ 07:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=450) 他说因为课时原因只拆解关键代码），而是按「项目结构 → 服务器 → 多智能体 → 后台测试 → 前端」的顺序讲，下面的每一部分都标了对应时间点。本课程没法原样照做的地方：`langgraph-supervisor` 库没有安装，`create_react_agent` 在 LangGraph 1.x 已弃用，搜索 API、Riza 沙盒和微软云数字人都要额外的 key 或审批。所以第五到第八部分用本机能跑的方式重建多智能体后台，思路和视频一致；服务器有一个对照用的练习文件；数字人只讲思路。",
      "en": "The video runs about 35 minutes. The instructor doesn't type the code line by line ([▶ 07:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=450) for time reasons he only dissects the key code); he goes project layout → server → agents → backend test → front end, and each part below carries its timestamp. What we can't copy as is: the `langgraph-supervisor` library isn't installed, `create_react_agent` is deprecated in LangGraph 1.x, and the search API, the Riza sandbox and the Azure avatar all need extra keys or approval. So parts 5–8 rebuild the multi-agent backend in a way that runs locally, with the same design; the server has a practice file for comparison; the avatar is covered as concepts only."
    },
    {
      "t": "h",
      "zh": "二、项目结构",
      "en": "2. Project layout"
    },
    {
      "t": "p",
      "zh": "[▶ 05:56](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=356) 项目分前后端。后端两个文件：`server`——用 FastAPI 起一个本地服务器，对外提供接口；`agents`——多智能体系统。服务器跑起来后，`static` 文件夹里的 `show.html` 就是前端。[▶ 06:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=418) 前端没有用任何框架，因为微软云数字人的 API 封装得不多，直接写原生 HTML 最省事。\n\n[▶ 07:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=450) 项目用 **Poetry** 管理：`pyproject.toml` 里写着 Python 版本要求、依赖包和启动脚本，从 Python 版本到每个依赖包的版本都由它统一管。本课程不用 Poetry，用课程准备好的虚拟环境，直接用它的 `python.exe` 运行文件即可。",
      "en": "[▶ 05:56](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=356) The project has a back end and a front end. Two back-end files: `server` – a local FastAPI server exposing the endpoints – and `agents` – the multi-agent system. Once the server runs, `show.html` in the `static` folder is the front end. [▶ 06:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=418) No front-end framework: Azure's avatar API isn't wrapped much, so plain HTML is simplest.\n\n[▶ 07:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=450) The project is managed with **Poetry**: `pyproject.toml` lists the Python version, the dependencies and a run script, so one tool controls everything from the Python version to each package's version. This course doesn't use Poetry; use the course's virtual environment and run files with its `python.exe`."
    },
    {
      "t": "code",
      "file": {
        "zh": "项目结构",
        "en": "project layout"
      },
      "lang": "text",
      "code": {
        "zh": "xiaolang/（示意）\n├── pyproject.toml        Poetry：Python 版本、依赖包、启动脚本（poetry run start）\n├── background/\n│   ├── server.py         服务器：FastAPI，POST /chat 和 WebSocket /ws/chat\n│   └── agents.py         多智能体：主管小浪 + 信息搜索专家 + AI 应用程序员\n└── static/\n    └── show.html         前端：数字人视频 + 聊天框（原生 HTML + JavaScript）",
        "en": "xiaolang/ (sketch)\n├── pyproject.toml        Poetry: Python version, dependencies, run script (poetry run start)\n├── background/\n│   ├── server.py         the server: FastAPI, POST /chat and WebSocket /ws/chat\n│   └── agents.py         the agents: supervisor Xiaolang + research expert + AI programmer\n└── static/\n    └── show.html         the front end: avatar video + chat box (plain HTML + JavaScript)"
      }
    },
    {
      "t": "h",
      "zh": "三、服务器：FastAPI + WebSocket",
      "en": "3. The server: FastAPI + WebSocket"
    },
    {
      "t": "p",
      "zh": "[▶ 08:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=482) 服务器代码不长，做的事情可以按顺序列出来：\n1. 导入 FastAPI，定义请求的数据模型，创建应用；把 `static` 挂成静态目录，并允许来自 localhost 的跨域请求\n2. [▶ 09:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=545) 入口 `main` 用 uvicorn 把应用跑在 **8000** 端口，对外两个接口：测试用的 POST `/chat`，和主要使用的 WebSocket `/ws/chat`\n3. [▶ 09:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=576) WebSocket 连上后，记下这个客户端最后一次活动的时间；[▶ 10:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=607) 再用 `asyncio.create_task` 在后台开一个**心跳任务**，[▶ 10:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=641) 每 30 秒检查一次：太久没有活动就关闭连接\n4. [▶ 11:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=672) 然后循环接收消息：类型是 `ping` 的是心跳，直接回一个 `pong`，前后端这样「乒乓」来回，连接就不会因为闲置被断开；其他消息交给 `process_message`\n5. [▶ 11:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=703) `process_message` 取出消息内容、用户 id（没有就记为匿名）等参数，消息为空就请用户重新输入；[▶ 12:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=766) 否则以**流式**方式运行小浪，`thread_id` 用前端传来的用户 id，保证不同用户的对话互相隔离；把回答一段段发回前端，最后发一条 `complete`\n6. [▶ 13:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=799) 主流程结束后，再用一条小的 LCEL 链根据用户的话判断情绪，给每种情绪配一个数字人动作，把 feeling 和 action 发给前端（[▶ 14:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=862)）",
      "en": "[▶ 08:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=482) The server code is short; here's what it does, in order:\n1. Import FastAPI, define the request models, create the app; mount `static` as a static folder and allow cross-origin requests from localhost\n2. [▶ 09:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=545) The `main` entry runs the app with uvicorn on port **8000**, exposing two endpoints: a test POST `/chat` and the main WebSocket `/ws/chat`\n3. [▶ 09:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=576) When a WebSocket connects, it records the client's last activity time; [▶ 10:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=607) `asyncio.create_task` starts a background **heartbeat task** [▶ 10:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=641) that checks every 30 seconds and closes connections that have been idle too long\n4. [▶ 11:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=672) Then it loops over incoming messages: a `ping` is a heartbeat and gets a `pong` straight back – this ping-pong keeps the connection from being dropped as idle; anything else goes to `process_message`\n5. [▶ 11:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=703) `process_message` reads the message, the user id (anonymous if missing) and other parameters, and asks the user to retry on an empty message; [▶ 12:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=766) otherwise it runs Xiaolang in **streaming** mode with the browser's user id as `thread_id`, keeping users' chats isolated, sends the answer back piece by piece, then a `complete` message\n6. [▶ 13:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=799) After that, a small LCEL chain guesses the user's mood from their message, picks an avatar gesture for each mood, and sends feeling and action to the front end ([▶ 14:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=862))"
    },
    {
      "t": "code",
      "file": "l42_server.py",
      "code": {
        "zh": "# 节选自练习文件 l42_server.py（略有简化）：和视频 server.py 里 WebSocket 部分做的事一样（FastAPI 在 51 节细讲）\n@app.websocket(\"/ws/chat\")\nasync def websocket_chat(websocket: WebSocket):\n    await websocket.accept()\n    client_id = id(websocket)\n    last_active[client_id] = time.time()                                    # 记下最后一次活动的时间\n    heartbeat = asyncio.create_task(check_heartbeat(websocket, client_id))  # 后台心跳任务：每 30 秒检查一次\n    try:\n        while True:\n            data = json.loads(await websocket.receive_text())\n            last_active[client_id] = time.time()\n            if data.get(\"type\") == \"ping\":                    # 心跳：回一个 pong，不交给 Agent\n                await send_json(websocket, {\"type\": \"pong\"})\n                continue\n            await process_message(websocket, data)            # 真正的聊天消息\n    except WebSocketDisconnect:\n        print(\"连接断开\", client_id)\n    finally:\n        heartbeat.cancel()\n\nasync def process_message(websocket, data):\n    message = str(data.get(\"message\", \"\")).strip()\n    user_id = data.get(\"user_id\") or \"anonymous\"             # 浏览器传来的用户 id，没有就是匿名\n    if not message:\n        await send_json(websocket, {\"type\": \"error\", \"content\": \"消息是空的，请输入内容后再发送\"})\n        return\n    config = {\"configurable\": {\"thread_id\": user_id}}         # 用户 id 当 thread_id：一个用户一条线程\n    async for update in xiaolang.astream({\"messages\": [(\"user\", message)]}, config, stream_mode=\"updates\"):\n        for node, value in update.items():\n            for msg in (value or {}).get(\"messages\", []):\n                if node == \"model\" and msg.content and not msg.tool_calls:   # 小浪自己说的话\n                    await send_json(websocket, {\"type\": \"stream\", \"content\": msg.content})\n    await send_json(websocket, {\"type\": \"complete\"})          # 告诉前端：这句话说完了",
        "en": "# Excerpt from the practice file l42_server.py (slightly simplified): the same job as the WebSocket part of the video's server.py\n# (FastAPI is covered in lesson 51)\n@app.websocket(\"/ws/chat\")\nasync def websocket_chat(websocket: WebSocket):\n    await websocket.accept()\n    client_id = id(websocket)\n    last_active[client_id] = time.time()                                    # remember the last activity time\n    heartbeat = asyncio.create_task(check_heartbeat(websocket, client_id))  # background heartbeat: checks every 30 s\n    try:\n        while True:\n            data = json.loads(await websocket.receive_text())\n            last_active[client_id] = time.time()\n            if data.get(\"type\") == \"ping\":                    # heartbeat: answer pong, don't bother the agent\n                await send_json(websocket, {\"type\": \"pong\"})\n                continue\n            await process_message(websocket, data)            # a real chat message\n    except WebSocketDisconnect:\n        print(\"disconnected\", client_id)\n    finally:\n        heartbeat.cancel()\n\nasync def process_message(websocket, data):\n    message = str(data.get(\"message\", \"\")).strip()\n    user_id = data.get(\"user_id\") or \"anonymous\"             # the browser's user id, or anonymous\n    if not message:\n        await send_json(websocket, {\"type\": \"error\", \"content\": \"Empty message, please type something\"})\n        return\n    config = {\"configurable\": {\"thread_id\": user_id}}         # user id as thread_id: one thread per user\n    async for update in xiaolang.astream({\"messages\": [(\"user\", message)]}, config, stream_mode=\"updates\"):\n        for node, value in update.items():\n            for msg in (value or {}).get(\"messages\", []):\n                if node == \"model\" and msg.content and not msg.tool_calls:   # Xiaolang's own words\n                    await send_json(websocket, {\"type\": \"stream\", \"content\": msg.content})\n    await send_json(websocket, {\"type\": \"complete\"})          # tell the front end the answer is finished"
      },
      "note": {
        "zh": "`async def` / `await` / `async for` 见 09 节。`asyncio.create_task(协程)` 让一个协程在**后台**同时运行，不用等它结束；心跳检查就这样和收消息的循环并行。`xiaolang.astream(...)` 是 `stream` 的异步版本，`stream_mode=\"updates\"`（38 节）每一步给出 `{节点名: 更新}`。视频是把模型输出的小块拼起来再发；这里简化为小浪每说完一段就发一段。",
        "en": "`async def` / `await` / `async for`: lesson 09. `asyncio.create_task(coroutine)` runs a coroutine **in the background** without waiting for it, which is how the heartbeat check runs alongside the receive loop. `xiaolang.astream(...)` is the async version of `stream`; `stream_mode=\"updates\"` (lesson 38) yields `{node_name: update}` per step. The video accumulates the model's chunks before sending; here, simplified, each finished piece of Xiaolang's answer is sent as it comes."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "视频的服务器为什么要让前后端定时互发 ping / pong？",
        "en": "Why does the video's server have both sides exchange ping / pong regularly?"
      },
      "options": [
        {
          "zh": "ping 消息会被交给多智能体回答",
          "en": "Ping messages are answered by the agents"
        },
        {
          "zh": "为了测试模型的速度",
          "en": "To measure the model's speed"
        },
        {
          "zh": "WebSocket 是长连接：没人说话时也定期发个心跳，连接就不会因闲置被断开，服务器也能发现早已离开的客户端",
          "en": "A WebSocket stays open: a regular heartbeat keeps an idle connection from being dropped, and lets the server spot clients that have gone"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "心跳消息不交给 Agent，只用来「报平安」。服务器每 30 秒检查一次最后活动时间，太久没动静就关掉连接。",
        "en": "Heartbeats never reach the agent; they just say “still here”. Every 30 seconds the server checks the last activity time and closes connections that have gone quiet."
      }
    },
    {
      "t": "h",
      "zh": "四、多智能体后台：视频的写法",
      "en": "4. The multi-agent backend: the video's version"
    },
    {
      "t": "p",
      "zh": "[▶ 15:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=955) `agents` 文件先导入社区包里的 **Riza** 工具：Riza 是一个云端代码执行沙盒，支持好几种语言，把代码发上去，它在远端运行并返回结果，要先去它的网站注册拿 key。[▶ 17:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1020) 配置里还有 LangSmith 的 key（做监控和调优）。模型用 **DeepSeek**：一开始是推理模型 R1，老师嫌它慢，换成了 V3。\n\n[▶ 17:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1051) 架构很简单：老师说，LangGraph 0.3 之后官方封装了很多预制 Agent，比如监管者模式的 `create_supervisor`，不用再像前面那样自己一个个连节点。它的参数就是员工列表、驱动主管的模型和提示词。[▶ 18:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1113) 两位员工都用 `create_react_agent` 创建：信息搜索专家带一个联网搜索工具；AI 应用程序员带 Python 执行工具，提示词说明它只能运行 Python 代码，输出代码要用 `<pre>` 标签包起来。",
      "en": "[▶ 15:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=955) The `agents` file first imports the **Riza** tool from the community package: Riza is a cloud code-execution sandbox supporting several languages – you send code, it runs remotely and returns the result; you need to register on its site for a key. [▶ 17:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1020) The config also holds a LangSmith key (for monitoring and tuning). The model is **DeepSeek**: at first the reasoning model R1, which the instructor finds slow, so he switches to V3.\n\n[▶ 17:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1051) The architecture is simple: since LangGraph 0.3, he says, the official packages provide many prebuilt agents, such as `create_supervisor` for the supervisor pattern, so you no longer wire nodes one by one as before. Its arguments are the list of workers, the model driving the supervisor, and a prompt. [▶ 18:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1113) Both workers come from `create_react_agent`: the research expert has a web-search tool; the AI programmer has a Python execution tool, and its prompt says it can only run Python and must wrap code in `<pre>` tags."
    },
    {
      "t": "code",
      "file": {
        "zh": "视频的写法（示意）",
        "en": "the video's version (sketch)"
      },
      "code": {
        "zh": "# 按视频的讲解整理的示意，仅供对照（具体代码以视频为准）：\n# 需要 langgraph-supervisor 库（本课程环境没有安装），还需要搜索 API 和 Riza 的 key，所以不能运行\nfrom langchain_community.tools.riza.command import ExecPython   # 在 Riza 云端沙盒里运行 Python\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.prebuilt import create_react_agent        # LangGraph 1.x 里已弃用，现在用 create_agent\nfrom langgraph_supervisor import create_supervisor\n\nmodel = ChatDeepSeek(model=\"deepseek-chat\")   # 当时的 V3（先用 R1 嫌慢才换）；现在的模型名只有 deepseek-flash 和 deepseek-v4-pro\n\n# web_search 代表视频里的联网搜索工具（需要搜索服务的 key）\nresearch_agent = create_react_agent(model, tools=[web_search], name=\"research_agent\",\n                                    prompt=\"你是信息搜索专家，请使用工具回答问题。\")\ndev_agent = create_react_agent(model, tools=[ExecPython()], name=\"dev_agent\",\n                               prompt=\"你是 AI 应用程序员，用工具回答应用开发的问题。你只能运行 Python 代码，\"\n                                      \"输出代码时用 <pre> 标签包起来。\")\nworkflow = create_supervisor(\n    agents=[research_agent, dev_agent],            # 两位员工\n    model=model,                                   # 驱动主管的模型\n    prompt=\"你是小浪……管理着信息搜索专家和 AI 应用程序员。LangChain 相关问题交给信息搜索专家，\"\n           \"程序设计、bug、AI 应用代码交给程序员，结合他们的意见统一回答用户……\",\n)\napp = workflow.compile(checkpointer=InMemorySaver())     # 只有短期记忆",
        "en": "# A sketch reconstructed from the video's walkthrough, for comparison only (the video has the exact code):\n# it needs the langgraph-supervisor library (not installed in the course environment) plus keys for a\n# search API and Riza, so it doesn't run here\nfrom langchain_community.tools.riza.command import ExecPython   # runs Python in the Riza cloud sandbox\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.prebuilt import create_react_agent        # deprecated in LangGraph 1.x; use create_agent now\nfrom langgraph_supervisor import create_supervisor\n\nmodel = ChatDeepSeek(model=\"deepseek-chat\")   # V3 at the time (R1 first, too slow); today's names are deepseek-flash / deepseek-v4-pro\n\n# web_search stands for the video's web-search tool (needs a search-service key)\nresearch_agent = create_react_agent(model, tools=[web_search], name=\"research_agent\",\n                                    prompt=\"You are a research expert; answer with your tool.\")\ndev_agent = create_react_agent(model, tools=[ExecPython()], name=\"dev_agent\",\n                               prompt=\"You are an AI programmer answering app-development questions with your tool. \"\n                                      \"You can only run Python code; wrap any code you output in <pre> tags.\")\nworkflow = create_supervisor(\n    agents=[research_agent, dev_agent],            # the two workers\n    model=model,                                   # the model driving the supervisor\n    prompt=\"You are Xiaolang... leading a research expert and an AI programmer. LangChain questions go to the \"\n           \"research expert, programming, bugs and AI-app code to the programmer; merge their input into one answer...\",\n)\napp = workflow.compile(checkpointer=InMemorySaver())     # short-term memory only"
      }
    },
    {
      "t": "p",
      "zh": "[▶ 19:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1176) 主管的提示词给了小浪一个人设（某 AI 网站的超级客服，名叫小浪），说明她管理着信息搜索专家和 AI 应用程序员：LangChain 相关的问题交给信息搜索专家，程序设计、bug、AI 应用代码交给程序员，再结合成员的意见给用户一个统一的回答。后面还有几条规则：不透露推理过程、不透露分配任务的过程；要输出代码就用 `<pre>` 包起来、尖括号要转义——因为回答会被放进 SSML 合成语音，代码里的尖括号会和 SSML 的标签冲突。[▶ 20:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1239) 编译时加了 checkpointer，只做了短期记忆，没有长期记忆。",
      "en": "[▶ 19:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1176) The supervisor prompt gives Xiaolang a persona (the super help-desk agent of an AI website, named Xiaolang) and says she leads a research expert and an AI programmer: LangChain questions go to the research expert, programming, bugs and AI-app code to the programmer, and she merges their input into one answer for the user. Then come a few rules: don't reveal the reasoning or how tasks are assigned; wrap any code in `<pre>` and escape angle brackets – because the answer goes into SSML for speech, and angle brackets in code would clash with SSML tags. [▶ 20:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1239) The graph is compiled with a checkpointer: short-term memory only, no long-term memory."
    },
    {
      "t": "note",
      "zh": "视频的提示词里还有「永远不要透露你是 AI」「不要透露团队成员是 AI」这类规则，本课程的版本**没有照抄**：让用户知道自己在和 AI 对话是基本的诚信，很多地方的法规也有要求。人设、语气、分派规则都可以照学。",
      "en": "The video's prompt also says never to reveal that it, or its team members, are AI. The course version **deliberately leaves that out**: users should know they're talking to an AI – it's basic honesty, and many places require it by law. The persona, tone and routing rules are all fine to copy."
    },
    {
      "t": "h",
      "zh": "五、在本机重建：监管者模式",
      "en": "5. Rebuilding it locally: the supervisor pattern"
    },
    {
      "t": "p",
      "zh": "24 节讲过监管者模式：一个**主管**不亲自干活，而是判断问题该交给哪位**员工**，必要时问好几位，最后把结果汇总给用户。比起一个什么都管的大 Agent，每位员工的提示词短、工具少，更可靠；以后要加新能力，加一位员工就行。\n\n小浪的团队：\n\n| 成员 | 视频里的工具 | 本节的替代 | 负责 |\n|---|---|---|---|\n| 小浪（主管） | 无，靠 `create_supervisor` | 把两位员工当工具 | 分配、汇总、闲聊 |\n| 信息搜索专家 | 联网搜索 API | `search_docs`：查本地《小浪学习手册》 | 课程、概念类问题 |\n| AI 应用程序员 | Riza 云端沙盒 | `run_python`：子进程 + 超时（40 节） | 写代码、计算、查 bug |\n\n「分派」的本质很简单：判断类别 → 找到负责的人 → 交给他。先用纯 Python 和关键词试一下，注意最后一句：",
      "en": "Lesson 24 covered the supervisor pattern: a **supervisor** does no work itself; it decides which **worker** should handle a question, asks several if needed, and merges the results for the user. Compared with one do-everything agent, each worker has a short prompt and few tools, so it's more reliable, and a new ability is just one more worker.\n\nXiaolang's team:\n\n| Member | Tool in the video | Our replacement | Job |\n|---|---|---|---|\n| Xiaolang (supervisor) | none, via `create_supervisor` | the two workers, as tools | Assign, merge, small talk |\n| Research expert | a web-search API | `search_docs`: the local Xiaolang handbook | Course and concept questions |\n| AI programmer | the Riza cloud sandbox | `run_python`: subprocess + timeout (lesson 40) | Code, calculations, bugs |\n\nDispatching boils down to: decide the category → find who handles it → hand it over. Try it first with plain Python and keywords, and look at the last line:"
    },
    {
      "t": "code",
      "file": "dispatch_demo.py",
      "run": true,
      "code": {
        "zh": "def research_expert(q):\n    return \"（信息搜索专家）我去查查学习手册。\"\n\ndef dev_expert(q):\n    return \"（AI 应用程序员）我写段代码跑一下。\"\n\ndef chat_expert(q):\n    return \"（小浪）你好呀！\"\n\n# 回顾 07 节：把函数放进字典，按名字取出来调用\nexperts = {\"research\": research_expert, \"dev\": dev_expert, \"chat\": chat_expert}\n\ndef keyword_router(question):\n    if \"LangChain\" in question or \"环境\" in question or \"是什么\" in question:\n        return \"research\"\n    if \"代码\" in question or \"计算\" in question or \"报错\" in question:\n        return \"dev\"\n    return \"chat\"\n\nfor q in [\"LangGraph 是什么？\", \"帮我计算 2 的 20 次方\", \"你好\", \"1 到 100 加起来等于多少？\"]:\n    name = keyword_router(q)\n    print(f\"{q}  ->  {name}  ->  {experts[name](q)}\")",
        "en": "def research_expert(q):\n    return \"(research expert) Let me look in the handbook.\"\n\ndef dev_expert(q):\n    return \"(AI programmer) Let me write and run some code.\"\n\ndef chat_expert(q):\n    return \"(Xiaolang) Hi there!\"\n\n# See lesson 07: functions stored in a dict, looked up by name and called\nexperts = {\"research\": research_expert, \"dev\": dev_expert, \"chat\": chat_expert}\n\ndef keyword_router(question):\n    if \"LangChain\" in question or \"setup\" in question or \"What is\" in question:\n        return \"research\"\n    if \"code\" in question or \"Calculate\" in question or \"error\" in question:\n        return \"dev\"\n    return \"chat\"\n\nfor q in [\"What is LangGraph?\", \"Calculate 2 to the power 20\", \"Hi\", \"What do 1 to 100 add up to?\"]:\n    name = keyword_router(q)\n    print(f\"{q}  ->  {name}  ->  {experts[name](q)}\")"
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "「1 到 100 加起来等于多少？」被关键词规则送去了闲聊。真正的小浪怎么避免这个问题？",
        "en": "“What do 1 to 100 add up to?” went to small talk. How does the real Xiaolang avoid that?"
      },
      "options": [
        {
          "zh": "把能想到的关键词全部加进 if 判断",
          "en": "Add every keyword you can think of to the if-checks"
        },
        {
          "zh": "让模型来当主管：它理解句子的意思，按工具说明决定交给谁",
          "en": "Let a model be the supervisor: it understands meaning and picks a worker from the tool descriptions"
        },
        {
          "zh": "把所有问题都交给程序员",
          "en": "Send every question to the programmer"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "关键词永远列不全。让模型当主管，它看得懂「加起来等于多少」是计算题；员工工具的说明就是它分派的依据。",
        "en": "Keyword lists are never complete. A model supervisor understands that “add up to” is a calculation, and the worker tools' descriptions tell it whom to ask."
      }
    },
    {
      "t": "h",
      "zh": "六、员工的工具：查手册、运行代码",
      "en": "6. The workers' tools: search the handbook, run code"
    },
    {
      "t": "p",
      "zh": "信息搜索专家的知识库是 `practice/data/l42_faq.md`，一段一个问答。检索方法很朴素：中文没有空格，没法按词切，我们就把问题切成「相邻的两个字」（比如「虚拟环境」→「虚拟」「拟环」「环境」），数一数每段里出现了几个，分数最高的两段交给模型。17 节的 RAG 用的是向量检索，这里只是一个够用的简化版。",
      "en": "The research expert's knowledge base is `practice/data/l42_faq.md`, one Q&A per paragraph. The search is deliberately simple: Chinese has no spaces to split words on, so we cut the question into “pairs of neighbouring characters” (e.g. “file” → “fi”, “il”, “le”) and count how many appear in each paragraph; the two best paragraphs go to the model. Lesson 17's RAG used vector search; this is a good-enough simplified version."
    },
    {
      "t": "py",
      "title": {
        "zh": "sorted() / max() 的 key=：按自己的规则排序、挑最大",
        "en": "key= in sorted() / max(): sort and pick by your own rule"
      },
      "zh": "- `sorted(列表)` 返回一个**排好序的新列表**，原列表不变。\n- `sorted(列表, key=函数)`：先对每个元素算一次 `函数(元素)`，再按算出来的值排序。比如 `key=len` 就是按长度排。\n- `reverse=True`：从大到小。排好后用切片 `[:2]` 取前两名（06 节）。\n- `max(列表, key=函数)`：直接返回分数最高的**那个元素**（不是分数）。\n\n`key` 要的是「只接收一个参数」的函数，而 `score` 需要两个参数（问题和段落），所以用 29 节的 `lambda p: score(question, p)` 包一下：每次传进来一个段落 `p`，问题固定不变。",
      "en": "- `sorted(a_list)` returns a **new sorted list**; the original is unchanged.\n- `sorted(a_list, key=func)` computes `func(item)` for each item and sorts by those values; `key=len` sorts by length, for example.\n- `reverse=True` sorts from largest to smallest. Take the top two with the slice `[:2]` (lesson 06).\n- `max(a_list, key=func)` returns **the item** with the highest value (not the value).\n\n`key` needs a function of **one** argument, but `score` takes two (question and paragraph), so wrap it with lesson 29's `lambda p: score(question, p)`: each call receives one paragraph `p` while the question stays fixed.",
      "code": {
        "zh": "paragraphs = [\n    \"为什么有两个虚拟环境？CrewAI 的依赖和 AgentScope 冲突，所以分开装。\",\n    \"练习文件怎么运行？在 VS Code 里选好解释器，然后点运行按钮。\",\n    \"找不到 DEEPSEEK_API_KEY 怎么办？关掉所有 VS Code 窗口再重新打开。\",\n]\n\ndef score(question, paragraph):\n    count = 0\n    for i in range(len(question) - 1):\n        if question[i:i + 2] in paragraph:     # 相邻的两个字当作一个小片段\n            count += 1\n    return count\n\nquestion = \"练习文件要怎么运行\"\nfor p in paragraphs:\n    print(score(question, p), \"分 |\", p[:12])\n\nbest = max(paragraphs, key=lambda p: score(question, p))\nprint(\"最相关：\", best)\n\nranked = sorted(paragraphs, key=lambda p: score(question, p), reverse=True)\nprint(\"前两名：\", [p[:8] for p in ranked[:2]])\nprint(\"原列表没变：\", paragraphs[0][:8])\n\nwords = [\"banana\", \"kiwi\", \"apple\"]\nprint(sorted(words))              # 默认：按字母顺序\nprint(sorted(words, key=len))     # key=len：按长度",
        "en": "paragraphs = [\n    \"Why two virtual environments? CrewAI's dependencies clash with AgentScope's.\",\n    \"How do I run a practice file? Pick the interpreter in VS Code, then press Run.\",\n    \"DEEPSEEK_API_KEY not found? Close every VS Code window and reopen.\",\n]\n\ndef score(question, paragraph):\n    count = 0\n    for i in range(len(question) - 1):\n        if question[i:i + 2] in paragraph:     # every pair of neighbouring characters is a small piece\n            count += 1\n    return count\n\nquestion = \"how to run a practice file\"\nfor p in paragraphs:\n    print(score(question, p), \"points |\", p[:12])\n\nbest = max(paragraphs, key=lambda p: score(question, p))\nprint(\"best match:\", best)\n\nranked = sorted(paragraphs, key=lambda p: score(question, p), reverse=True)\nprint(\"top two:\", [p[:8] for p in ranked[:2]])\nprint(\"original unchanged:\", paragraphs[0][:8])\n\nwords = [\"banana\", \"kiwi\", \"apple\"]\nprint(sorted(words))              # default: alphabetical\nprint(sorted(words, key=len))     # key=len: by length"
      }
    },
    {
      "t": "p",
      "zh": "AI 应用程序员要能**真的运行代码**。视频把代码发到 Riza 的云端沙盒里运行；我们用 40 节练习文件里的办法：`subprocess.run` 另起一个 Python 进程，加上 10 秒超时，在临时文件夹里运行，把输出或报错的最后几行交回给模型。",
      "en": "The AI programmer must **actually run code**. The video sends it to Riza's cloud sandbox; we use the approach from lesson 40's practice file: `subprocess.run` starts a separate Python process with a 10-second timeout inside a temporary folder, and the output, or the last lines of the error, go back to the model."
    },
    {
      "t": "code",
      "file": "tools.py",
      "code": {
        "zh": "import subprocess\nimport sys\nimport tempfile\nfrom pathlib import Path\nfrom langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\n# 主管和员工只需要「选工具、写回答」，关掉思考模式更快（第十一部分路由版的结构化输出也必须关，见 40 节）\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY, extra_body={\"thinking\": {\"type\": \"disabled\"}})\n\n# ---------- 信息搜索专家的工具：查本地手册（视频用的是联网搜索）\nFAQ_FILE = Path(__file__).parent / \"data\" / \"l42_faq.md\"      # pathlib 见 10 节\nPARAGRAPHS = [p.strip() for p in FAQ_FILE.read_text(encoding=\"utf-8\").split(\"\\n\\n\")\n              if p.strip() and not p.startswith(\"#\")]          # 按空行切段，跳过标题\n\ndef score(question, paragraph):\n    count = 0\n    for i in range(len(question) - 1):\n        if question[i:i + 2].lower() in paragraph.lower():\n            count += 1\n    return count\n\n@tool\ndef search_docs(question: str) -> str:\n    \"\"\"在《小浪学习手册》里查找和问题最相关的两段内容。\"\"\"\n    ranked = sorted(PARAGRAPHS, key=lambda p: score(question, p), reverse=True)\n    return \"\\n\\n\".join(ranked[:2])\n\n# ---------- AI 应用程序员的工具：运行 Python（视频用的是 Riza 云端沙盒）\n@tool\ndef run_python(code: str) -> str:\n    \"\"\"运行一段 Python 代码（只能用标准库），返回 print 的输出或报错信息。\"\"\"\n    with tempfile.TemporaryDirectory() as workdir:\n        try:\n            result = subprocess.run(\n                [sys.executable, \"-X\", \"utf8\", \"-c\", code],\n                capture_output=True, text=True, encoding=\"utf-8\", errors=\"replace\",\n                timeout=10, cwd=workdir,\n            )\n        except subprocess.TimeoutExpired:\n            return \"运行超过 10 秒，已经停止。\"\n    if result.returncode != 0:\n        return \"运行出错：\\n\" + \"\\n\".join(result.stderr.strip().splitlines()[-4:])\n    return result.stdout.strip() or \"（运行成功，没有输出）\"",
        "en": "import subprocess\nimport sys\nimport tempfile\nfrom pathlib import Path\nfrom langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom llm import API_KEY, MODEL\n\n# Supervisor and workers only pick tools and write answers, so thinking off is faster\n# (part 11's router uses structured output, which needs it off anyway - see lesson 40)\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY, extra_body={\"thinking\": {\"type\": \"disabled\"}})\n\n# ---------- research expert's tool: search a local handbook (the video searches the web)\nFAQ_FILE = Path(__file__).parent / \"data\" / \"l42_faq.md\"      # pathlib: see lesson 10\nPARAGRAPHS = [p.strip() for p in FAQ_FILE.read_text(encoding=\"utf-8\").split(\"\\n\\n\")\n              if p.strip() and not p.startswith(\"#\")]          # split on blank lines, skip the title\n\ndef score(question, paragraph):\n    count = 0\n    for i in range(len(question) - 1):\n        if question[i:i + 2].lower() in paragraph.lower():\n            count += 1\n    return count\n\n@tool\ndef search_docs(question: str) -> str:\n    \"\"\"Search the Xiaolang handbook for the two paragraphs most relevant to the question.\"\"\"\n    ranked = sorted(PARAGRAPHS, key=lambda p: score(question, p), reverse=True)\n    return \"\\n\\n\".join(ranked[:2])\n\n# ---------- AI programmer's tool: run Python (the video uses the Riza cloud sandbox)\n@tool\ndef run_python(code: str) -> str:\n    \"\"\"Run Python code (standard library only) and return what it prints, or the error.\"\"\"\n    with tempfile.TemporaryDirectory() as workdir:\n        try:\n            result = subprocess.run(\n                [sys.executable, \"-X\", \"utf8\", \"-c\", code],\n                capture_output=True, text=True, encoding=\"utf-8\", errors=\"replace\",\n                timeout=10, cwd=workdir,\n            )\n        except subprocess.TimeoutExpired:\n            return \"Stopped after 10 seconds.\"\n    if result.returncode != 0:\n        return \"Error:\\n\" + \"\\n\".join(result.stderr.strip().splitlines()[-4:])\n    return result.stdout.strip() or \"(ran fine, no output)\""
      },
      "note": {
        "zh": "`.split(\"\\n\\n\")` 按空行把文件切成段；`\"\\n\\n\".join(列表)` 反过来，用空行把几段连成一个字符串（join 见 07 节）。`splitlines()` 把报错按行切开，`[-4:]` 取最后 4 行。子进程、超时和临时文件夹的细节见 40 节。",
        "en": "`.split(\"\\n\\n\")` cuts the file into paragraphs at blank lines; `\"\\n\\n\".join(a_list)` does the reverse, joining paragraphs with blank lines (join: lesson 07). `splitlines()` cuts the error into lines and `[-4:]` keeps the last four. The subprocess, timeout and temp-folder details are in lesson 40."
      }
    },
    {
      "t": "warn",
      "zh": "`run_python` 会在你的电脑上运行模型写的代码。子进程 + 超时只能防死循环和崩溃，防不了删文件、联网这类操作——视频用云端沙盒正是为了隔离。只拿它做练习，不要把这样的程序开放给陌生人用。",
      "en": "`run_python` runs model-written code on your computer. A subprocess with a timeout stops endless loops and crashes, not file deletion or network access – which is exactly why the video uses a cloud sandbox. Use it for practice only, and never expose such a program to strangers."
    },
    {
      "t": "h",
      "zh": "七、两位员工：create_agent",
      "en": "7. Two workers with create_agent"
    },
    {
      "t": "p",
      "zh": "视频用 `create_react_agent` 建员工；它在 LangGraph 1.x 已经弃用，现在用 `create_agent`（39 节），参数名 `prompt` 改成了 `system_prompt`。每位员工都是一个完整的小 Agent：模型 + 工具 + 系统提示词，自己处理「调用工具 → 拿到结果 → 回答」的循环。`name=` 会写进它回答的消息里（`AIMessage.name`），方便看出是谁回答的。\n\n建议**先单独测试每位员工**，确认各自没问题再组装；团队出错时也更容易分清是谁的问题。",
      "en": "The video builds its workers with `create_react_agent`; that is deprecated in LangGraph 1.x, so we use `create_agent` (lesson 39), where `prompt` is now called `system_prompt`. Each worker is a complete small agent – model + tools + system prompt – that runs its own “call a tool → get the result → answer” loop. `name=` is stamped onto its reply messages (`AIMessage.name`), so you can see who answered.\n\n**Test each worker on its own** before assembling the team; when the team fails, it's then much easier to tell who is at fault."
    },
    {
      "t": "code",
      "file": "workers.py",
      "code": {
        "zh": "from langchain.agents import create_agent\n\nresearch_agent = create_agent(\n    model,\n    tools=[search_docs],\n    system_prompt=\"你是小浪团队的信息搜索专家。先用 search_docs 查学习手册，只根据查到的内容回答；\"\n                  \"手册里没有就直说不知道。\",\n    name=\"research_agent\",\n)\ndev_agent = create_agent(\n    model,\n    tools=[run_python],\n    system_prompt=\"你是小浪团队的 AI 应用程序员。需要计算或验证时，写 Python 代码并用 run_python 运行，\"\n                  \"根据运行结果回答，并附上你运行的代码。\",\n    name=\"dev_agent\",\n)\n\n# 先单独测试一位员工（先测零件，再组装）\nresult = dev_agent.invoke({\"messages\": [(\"user\", \"1 到 100 里所有 3 的倍数加起来是多少？\")]})\nprint(result[\"messages\"][-1].name, \":\", result[\"messages\"][-1].content)",
        "en": "from langchain.agents import create_agent\n\nresearch_agent = create_agent(\n    model,\n    tools=[search_docs],\n    system_prompt=\"You are the research expert on Xiaolang's team. Search the handbook with search_docs first and \"\n                  \"answer only from what it returns; if it isn't there, say you don't know.\",\n    name=\"research_agent\",\n)\ndev_agent = create_agent(\n    model,\n    tools=[run_python],\n    system_prompt=\"You are the AI programmer on Xiaolang's team. To calculate or check something, write Python code, \"\n                  \"run it with run_python, answer from the result and include the code you ran.\",\n    name=\"dev_agent\",\n)\n\n# Test one worker on its own (test the parts before assembling)\nresult = dev_agent.invoke({\"messages\": [(\"user\", \"What is the sum of all multiples of 3 from 1 to 100?\")]})\nprint(result[\"messages\"][-1].name, \":\", result[\"messages\"][-1].content)"
      }
    },
    {
      "t": "tip",
      "zh": "信息搜索专家的提示词写了「只根据查到的内容回答；手册里没有就直说不知道」。员工的职责越窄、规则越明确，越不容易编造答案。",
      "en": "The research expert's prompt says “answer only from what the search returns; if it isn't there, say you don't know”. The narrower the job and the clearer the rules, the less a worker makes things up."
    },
    {
      "t": "h",
      "zh": "八、主管小浪：员工变成工具",
      "en": "8. The supervisor: workers become tools"
    },
    {
      "t": "p",
      "zh": "`create_supervisor` 内部的做法，是给主管准备几个「转交给某位员工」的工具。我们直接把这层意思写出来：**每位员工包装成一个 `@tool` 函数**——函数里调用员工，只返回它最后的回答——再把这两个工具交给另一个 `create_agent`，它就是主管。主管怎么选员工？和选普通工具一样，看工具的名字、参数和**文档字符串**（08、39 节）。所以文档字符串要写清楚「什么问题交给谁」。这也是 `langgraph-supervisor` 的维护者现在推荐的写法。",
      "en": "Under the hood, `create_supervisor` gives the supervisor “hand over to worker X” tools. We write that idea out directly: **wrap each worker in a `@tool` function** that calls the worker and returns only its final answer, then give both tools to another `create_agent` – that's the supervisor. How does it pick a worker? Just as it picks any tool: by the tool's name, parameters and **docstring** (lessons 08 and 39). So the docstring must say clearly which questions go to whom. This is also what the maintainers of `langgraph-supervisor` now recommend."
    },
    {
      "t": "code",
      "file": "supervisor.py",
      "code": {
        "zh": "from langchain.agents import create_agent\nfrom langchain_core.tools import tool\nfrom langgraph.checkpoint.memory import InMemorySaver\n\n@tool\ndef ask_researcher(question: str) -> str:\n    \"\"\"把关于本课程、LangChain/LangGraph 概念、环境和练习文件的问题交给信息搜索专家，返回他的回答。\"\"\"\n    result = research_agent.invoke({\"messages\": [(\"user\", question)]})\n    return result[\"messages\"][-1].content          # 只要员工最后的回答\n\n@tool\ndef ask_programmer(question: str) -> str:\n    \"\"\"把写代码、计算、查 bug 的任务交给 AI 应用程序员，返回他的回答。任务要写完整。\"\"\"\n    result = dev_agent.invoke({\"messages\": [(\"user\", question)]})\n    return result[\"messages\"][-1].content\n\nXIAOLANG_PROMPT = (\n    \"你是「小浪」，一个 AI 学习客服，管理着一个小团队：信息搜索专家（ask_researcher）和 AI 应用程序员（ask_programmer）。\\n\"\n    \"- 课程、概念、环境、练习文件的问题交给信息搜索专家\\n\"\n    \"- 写代码、计算、查 bug 的任务交给 AI 应用程序员\\n\"\n    \"- 一个问题涉及两方面时，分别询问，再把结果整理成一个简洁的回答\\n\"\n    \"- 打招呼、闲聊直接回答\\n\"\n    \"交给员工的问题要写完整，因为他们看不到之前的对话。不要向用户提起分配任务的过程。\"\n)\n\nxiaolang = create_agent(\n    model,\n    tools=[ask_researcher, ask_programmer],    # 员工 = 主管的工具\n    system_prompt=XIAOLANG_PROMPT,\n    checkpointer=InMemorySaver(),              # 短期记忆，第九部分细讲\n    name=\"xiaolang\",\n)",
        "en": "from langchain.agents import create_agent\nfrom langchain_core.tools import tool\nfrom langgraph.checkpoint.memory import InMemorySaver\n\n@tool\ndef ask_researcher(question: str) -> str:\n    \"\"\"Ask the research expert about this course, LangChain/LangGraph ideas, setup or practice files; returns the answer.\"\"\"\n    result = research_agent.invoke({\"messages\": [(\"user\", question)]})\n    return result[\"messages\"][-1].content          # only the worker's final answer\n\n@tool\ndef ask_programmer(question: str) -> str:\n    \"\"\"Give a coding, calculation or debugging task to the AI programmer; returns the answer. Describe the task fully.\"\"\"\n    result = dev_agent.invoke({\"messages\": [(\"user\", question)]})\n    return result[\"messages\"][-1].content\n\nXIAOLANG_PROMPT = (\n    \"You are Xiaolang, an AI study helper leading a small team: a research expert (ask_researcher) \"\n    \"and an AI programmer (ask_programmer).\\n\"\n    \"- Questions about the course, concepts, setup or practice files go to the research expert\\n\"\n    \"- Coding, calculations and bugs go to the AI programmer\\n\"\n    \"- If a question has both parts, ask both, then merge the results into one short answer\\n\"\n    \"- Answer greetings and small talk yourself\\n\"\n    \"Write complete questions for your team: they cannot see the earlier chat. Never mention the delegation to the user.\"\n)\n\nxiaolang = create_agent(\n    model,\n    tools=[ask_researcher, ask_programmer],    # workers = the supervisor's tools\n    system_prompt=XIAOLANG_PROMPT,\n    checkpointer=InMemorySaver(),              # short-term memory, see part 9\n    name=\"xiaolang\",\n)"
      },
      "note": {
        "zh": "员工每次被调用都是一次全新的 `invoke`，只收到主管写的 `question`，**看不到之前的对话**。所以提示词要求主管把问题写完整：用户说「那换成 5 的倍数呢？」，主管要改写成「计算 1 到 100 里所有 5 的倍数之和」。另外，两个员工工具的参数都叫 `question`：我们实测时用过不同的名字（`task`），模型就把参数名弄混了一次，报错后才重试成功。",
        "en": "Each worker call is a fresh `invoke` that receives only the supervisor's `question` and **can't see the earlier chat**. That's why the prompt tells the supervisor to write complete questions: when the user says “and multiples of 5?”, the supervisor must rewrite it as “sum all multiples of 5 from 1 to 100”. Also, both worker tools take a parameter named `question`: when we tested with a different name (`task`), the model mixed the names up once and only succeeded after an error and a retry."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "主管小浪靠什么决定调用 `ask_researcher` 还是 `ask_programmer`？",
        "en": "How does Xiaolang decide between `ask_researcher` and `ask_programmer`?"
      },
      "options": [
        {
          "zh": "员工 Agent 的 `name` 参数",
          "en": "The workers' `name` arguments"
        },
        {
          "zh": "LangGraph 的条件边",
          "en": "A LangGraph conditional edge"
        },
        {
          "zh": "工具的名字、参数和文档字符串：`@tool` 把它们变成工具说明发给模型",
          "en": "The tools' names, parameters and docstrings, which `@tool` turns into the tool descriptions the model reads"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "对主管来说，员工就是两个普通的工具，选择方式和 39 节选工具完全一样。文档字符串写得越清楚，分派越准。",
        "en": "To the supervisor the workers are just two ordinary tools, chosen exactly as in lesson 39. The clearer the docstrings, the better the routing."
      }
    },
    {
      "t": "h",
      "zh": "九、后台测试：thread_id 和记忆",
      "en": "9. Testing the backend: thread_id and memory"
    },
    {
      "t": "p",
      "zh": "[▶ 20:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1239) 后台写好后，老师先单独测试后台：[▶ 21:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1271) 用 `poetry run start` 启动（`pyproject.toml` 里把 `start` 定义成运行服务器的 `main` 函数，效果一样），服务开在 localhost:8000。[▶ 21:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1302) 打开 `/docs`——FastAPI 自动生成的接口文档页（Swagger UI）——这里只看得到 POST `/chat`，WebSocket 接口显示不出来。发一句「你好」，报错了：[▶ 22:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1334) 缺少 `thread_id`。他在接口里补上一个模拟的线程 id，重启再试，[▶ 22:57](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1377) 很快就收到了小浪的回答，后端跑通。",
      "en": "[▶ 20:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1239) With the backend written, the instructor tests it on its own: [▶ 21:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1271) he starts it with `poetry run start` (`pyproject.toml` defines `start` as the server's `main` function – same effect), serving on localhost:8000. [▶ 21:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1302) He opens `/docs` – FastAPI's auto-generated API page (Swagger UI) – which shows only POST `/chat`; WebSocket endpoints can't be shown there. Sending “hello” fails: [▶ 22:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1334) `thread_id` is missing. He adds a simulated thread id in the endpoint, restarts, [▶ 22:57](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1377) and quickly gets Xiaolang's reply – the backend works."
    },
    {
      "t": "p",
      "zh": "主管创建时传了 `checkpointer=InMemorySaver()`，对话就按 `thread_id` 保存（30–31 节）。视频的服务器用前端传来的**用户 id 当 thread_id**：同一个人前后几句接得上，不同的人互相看不到。员工不需要记忆，它们每次只处理主管交来的一个问题。\n\n加了 checkpointer 却忘了传 `thread_id`，运行时会直接报错——视频里讲师测试 POST `/chat` 时就碰到了它，补上 thread_id 才跑通：\n\n`ValueError: Checkpointer requires one or more of the following 'configurable' keys: thread_id, checkpoint_ns, checkpoint_id`",
      "en": "The supervisor was created with `checkpointer=InMemorySaver()`, so the chat is stored per `thread_id` (lessons 30–31). The video's server uses **the user id sent by the browser as the thread_id**: one person's messages connect, and different people never see each other's chats. The workers need no memory; each call handles one question from the supervisor.\n\nAdd a checkpointer but forget the `thread_id`, and the run fails at once – the instructor hits exactly this when testing POST `/chat` in the video, and adding a thread_id fixes it:\n\n`ValueError: Checkpointer requires one or more of the following 'configurable' keys: thread_id, checkpoint_ns, checkpoint_id`"
    },
    {
      "t": "code",
      "file": "chat_loop.py",
      "code": {
        "zh": "import uuid\n\nuser_id = str(uuid.uuid4())                       # 视频里是前端传来的用户 id\nconfig = {\"configurable\": {\"thread_id\": user_id}}  # 一个用户一条线程\n\nwhile True:\n    user_input = input(\"\\n你：\").strip()\n    if user_input == \"/exit\":\n        break\n    result = xiaolang.invoke({\"messages\": [(\"user\", user_input)]}, config)\n    print(\"小浪：\", result[\"messages\"][-1].content)",
        "en": "import uuid\n\nuser_id = str(uuid.uuid4())                       # in the video: the user id sent by the browser\nconfig = {\"configurable\": {\"thread_id\": user_id}}  # one thread per user\n\nwhile True:\n    user_input = input(\"\\nYou: \").strip()\n    if user_input == \"/exit\":\n        break\n    result = xiaolang.invoke({\"messages\": [(\"user\", user_input)]}, config)\n    print(\"Xiaolang:\", result[\"messages\"][-1].content)"
      }
    },
    {
      "t": "p",
      "zh": "完整代码在 `practice/l42_xiaolang_solution.py`，它还会打印主管这一轮调用了哪些员工。下面是一次运行的输出（节选，回答有删减）：一个问题两件事，主管分别问了两位员工，再汇总成一个回答。",
      "en": "The full code is in `practice/l42_xiaolang_solution.py`; it also prints which workers the supervisor called this turn. Below is the output of one run (excerpt, answer shortened; translated): one question with two parts, so the supervisor asked both workers and merged the results."
    },
    {
      "t": "code",
      "file": "输出示例 / sample output",
      "lang": "text",
      "code": {
        "zh": "你 / You: LangChain 和 LangGraph 是什么关系？另外帮我算一下 1 到 100 里所有 3 的倍数之和。\n  [小浪交给 / delegates] ask_researcher({'question': 'LangChain 和 LangGraph 是什么关系？请解释两者的定位、区别和联系……'})\n  [小浪交给 / delegates] ask_programmer({'question': '请计算 1 到 100 之间（含 1 和 100）所有 3 的倍数之和，并给出计算过程和结果。'})\n小浪 / Xiaolang: ## 一、LangChain 和 LangGraph 的关系\n- LangChain 提供\"积木\"——模型、提示词、工具，还有 create_agent 这样开箱即用的 Agent。\n- LangGraph 更底层——用节点和边把流程画成一张图，负责状态管理、循环、持久化和人机交互。\n……\n## 二、1 到 100 中所有 3 的倍数之和\n结果：1683（3, 6, 9, …, 99，共 33 个）……",
        "en": "You: What's the relationship between LangChain and LangGraph? Also, work out the sum of all multiples of 3 from 1 to 100.\n  [delegates] ask_researcher({'question': 'What is the relationship between LangChain and LangGraph? Explain their roles, differences and connections…'})\n  [delegates] ask_programmer({'question': 'Calculate the sum of all multiples of 3 between 1 and 100 (inclusive), showing the working and the result.'})\nXiaolang: ## 1. How LangChain and LangGraph relate\n- LangChain provides the \"building blocks\" – models, prompts, tools, plus ready-to-use agents such as create_agent.\n- LangGraph is lower-level – it draws the flow as a graph of nodes and edges and handles state, loops, persistence and human-in-the-loop.\n…\n## 2. The sum of all multiples of 3 from 1 to 100\nResult: 1683 (3, 6, 9, …, 99 – 33 numbers)…"
      }
    },
    {
      "t": "p",
      "zh": "选做：想像视频那样测试一下服务器，运行练习文件 `practice/l42_server.py`（它导入参考答案里的小浪，按视频的思路提供 POST `/chat` 和 WebSocket `/ws/chat`，还带一个没有数字人的极简聊天页）：\n1. 在 VS Code 里运行它，看到 `Uvicorn running on http://127.0.0.1:8000` 就说明服务器起来了\n2. 浏览器打开 `http://127.0.0.1:8000/docs`，展开 POST `/chat`，点 Try it out，填 `{\"message\": \"你好\", \"user_id\": \"u1\"}` 再点 Execute\n3. 打开 `http://127.0.0.1:8000/` 就是聊天页，它通过 WebSocket 发消息，每 20 秒发一次 ping\n4. 按 Ctrl+C 停止服务器\n\n下面是通过 WebSocket 发「你好，你是谁？」时，服务器真实推回的两条消息（有删节）：",
      "en": "Optional: to test the server the way the video does, run the practice file `practice/l42_server.py` (it imports Xiaolang from the solution and, following the video's design, offers POST `/chat` and WebSocket `/ws/chat`, plus a minimal chat page without the avatar):\n1. Run it in VS Code; `Uvicorn running on http://127.0.0.1:8000` means the server is up\n2. Open `http://127.0.0.1:8000/docs` in a browser, expand POST `/chat`, click Try it out, enter `{\"message\": \"hello\", \"user_id\": \"u1\"}` and click Execute\n3. `http://127.0.0.1:8000/` is the chat page; it sends messages over WebSocket and a ping every 20 seconds\n4. Press Ctrl+C to stop the server\n\nBelow are the two messages the server really pushed back over WebSocket for “Hi, who are you?” (shortened and translated):"
    },
    {
      "t": "code",
      "file": {
        "zh": "WebSocket 收到的消息",
        "en": "WebSocket messages received"
      },
      "lang": "text",
      "code": {
        "zh": "{\"type\": \"stream\", \"content\": \"你好！我是小浪，你的 AI 学习客服助手 😊\\n\\n我这边可以帮你处理学习上的问题，比如：\\n\\n- **课程内容、概念讲解**：LangChain / LangGraph 的相关知识、环境配置、练习文件等\\n- **代码相关**：写代码、算结果、查 bug\\n\\n……\"}\n{\"type\": \"complete\"}",
        "en": "{\"type\": \"stream\", \"content\": \"Hi! I'm Xiaolang, your AI study help-desk assistant 😊\\n\\nI can help with your study questions, for example:\\n\\n- **Course content and concepts**: LangChain / LangGraph topics, environment setup, practice files and so on\\n- **Code**: writing code, working out results, finding bugs\\n\\n…\"}\n{\"type\": \"complete\"}"
      }
    },
    {
      "t": "h",
      "zh": "十、前端：数字人和 WebSocket（只讲思路）",
      "en": "10. The front end: avatar and WebSocket (concepts only)"
    },
    {
      "t": "p",
      "zh": "[▶ 23:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1410) 前端 `show.html` 比较长，老师只讲两件事：WebRTC 连接和 WebSocket 连接。\n- [▶ 24:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1441) 页面加载完（`DOMContentLoaded`）后，先用微软云的 Speech SDK、你的 key 和区域生成配置，[▶ 25:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1503) 再建一个数字人配置（默认形象 lisa 和默认的姿势）。[▶ 25:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1535) 老师顺便打开微软云门户，看了语音服务的 key 和区域，以及 Speech Studio 里的实时聊天数字人示例。\n- [▶ 27:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1660) 向微软云请求 WebRTC 资源，建立一个**对等连接**（peer connection）。它和 WebSocket 一样是双向通道，只不过传的是视频和音频流；[▶ 28:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1691) 收到视频、音频轨道时（`ontrack` 事件），更新页面上的播放器，数字人就在浏览器里动起来了。\n- [▶ 28:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1723) 数字人连上之后再连 WebSocket：[▶ 29:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1759) 连接打开就开始发 ping；收到 pong 不处理；[▶ 29:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1789) 收到流式消息，就像打字机一样逐段加进聊天框；[▶ 30:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1821) 收到 `complete` 说明这句话说完了。\n- [▶ 31:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1883) 剩下的是页面上的杂事：绑定发送按钮、让音视频自动播放、把用户的话加进对话记录、出错时的容错；回答里有代码时识别语言、单独排版；新消息到来时自动滚到底部。\n- [▶ 31:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1913) 让数字人开口用的是 **SSML**：一种类似 XML 的标记语言，可以指定音色、说话的情绪和动作。[▶ 32:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1943) 后端情绪识别得到的 feeling 和 action 就填进 SSML，交给微软云合成后，再实时推流回浏览器。\n\n[▶ 34:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=2041) 最后老师在浏览器的网络面板里展示：一条对等连接在持续接收数字人的视频流，另一条 WebSocket 连着后端。[▶ 35:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=2103) 他说完整的项目代码会放进课程的代码仓库，供大家下载研究。",
      "en": "[▶ 23:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1410) The front end `show.html` is long; the instructor covers two things: the WebRTC connection and the WebSocket connection.\n- [▶ 24:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1441) Once the page has loaded (`DOMContentLoaded`), it builds a config from Azure's Speech SDK, your key and region, [▶ 25:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1503) then an avatar config (the default character lisa and its default pose). [▶ 25:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1535) He also opens the Azure portal to show the Speech service's key and region, and the real-time chat avatar sample in Speech Studio.\n- [▶ 27:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1660) It requests WebRTC resources from Azure and opens a **peer connection** – a two-way channel like WebSocket, but carrying video and audio streams; [▶ 28:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1691) when video and audio tracks arrive (the `ontrack` event) it updates the page's players, and the avatar comes alive in the browser.\n- [▶ 28:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1723) Once the avatar is connected, it opens the WebSocket: [▶ 29:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1759) on open it starts sending pings; pongs are ignored; [▶ 29:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1789) streamed messages are appended to the chat box typewriter-style; [▶ 30:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1821) a `complete` message means the answer is finished.\n- [▶ 31:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1883) The rest is page housekeeping: binding the send button, auto-playing audio and video, adding the user's message to the chat log, error handling; detecting the language of code in an answer and formatting it separately; and scrolling to the bottom as new messages arrive.\n- [▶ 31:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1913) The avatar speaks via **SSML**, an XML-like markup that sets the voice, speaking style (emotion) and gestures. [▶ 32:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1943) The feeling and action from the backend's mood check go into the SSML, Azure synthesises it, and the result streams back to the browser in real time.\n\n[▶ 34:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=2041) Finally he shows the browser's network panel: one peer connection continuously receiving the avatar's video stream, and a WebSocket connected to the backend. [▶ 35:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=2103) He says the full project code will be put in the course's code repository for you to download and study."
    },
    {
      "t": "warn",
      "zh": "老师提醒了几次微软云数字人的限制：[▶ 14:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=894) 服务升级后，请求频率等都有限制，测试时不好用可能要联系微软云；[▶ 27:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1627) 只有部分区域开放数字人（他用 West US 2，文档里还列了 Southeast Asia、West Europe 等），申请资源时要选对区域；[▶ 33:28](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=2008) 想在商业环境使用，要以公司身份注册，并提交申请说明你的应用，审批通过才能大量调用——通过后还可以克隆自己的形象和声音。所以这一部分本课程不动手，只讲思路。",
      "en": "The instructor warns several times about the Azure avatar's limits: [▶ 14:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=894) after a service upgrade, request rates and more are limited, and you may need to contact Azure if testing fails; [▶ 27:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1627) avatars are only available in some regions (he uses West US 2; the docs also list Southeast Asia, West Europe and others), so pick the right region; [▶ 33:28](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=2008) commercial use requires registering as a company and submitting an application describing your app, with approval needed before heavy use – after which you can even clone your own appearance and voice. That's why this course covers this part as concepts only."
    },
    {
      "t": "h",
      "zh": "十一、补充：自己用 LangGraph 连一个路由版",
      "en": "11. Extra: a router hand-wired in LangGraph"
    },
    {
      "t": "note",
      "zh": "补充 / Extra：视频里没有这一部分。它把同一支团队用前面学过的节点和条件边自己连一遍，用来对照理解「预制的监管者」和「手连的路由」各自适合什么情况；时间紧可以跳过。",
      "en": "Extra: this part isn't in the video. It wires the same team by hand with the nodes and conditional edges from earlier lessons, to compare a prebuilt supervisor with a hand-wired router; skip it if you're short of time."
    },
    {
      "t": "p",
      "zh": "[▶ 17:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1051) 视频说，有了现成的 `create_supervisor`，就不用再像前面那样自己一个个连节点。但自己连一遍，最能看清多智能体的骨架。路由版不让主管来回调用员工，而是一个 `router` 节点只做一件事：用 40 节的结构化输出选出**一位**员工，`Literal[\"research\", \"dev\", \"chat\"]`（28 节）保证选出来的一定是图里存在的节点名，再用条件边把对话交过去。`chat` 是多出来的闲聊员工，因为路由版里没有主管替你打招呼。\n\n`run_agent` 把**整段对话**交给员工（这样追问时它知道上下文），但只把它的**最后一条回答**带回主图，员工内部的工具调用留在员工那里。路由节点只返回 `{\"next\": ...}`，不往对话里加消息。",
      "en": "[▶ 17:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=43&t=1051) The video says that with a ready-made `create_supervisor` you no longer wire nodes yourself as in earlier lessons. Wiring it once by hand, though, shows the skeleton of a multi-agent system best. The router version has no supervisor going back and forth; a `router` node does one thing: it picks **one** worker with lesson 40's structured output, `Literal[\"research\", \"dev\", \"chat\"]` (lesson 28) guarantees the pick is a real node name, and a conditional edge hands the chat over. `chat` is an extra small-talk worker, since there's no supervisor to say hello.\n\n`run_agent` gives the worker the **whole chat** (so follow-ups have context) but brings back only its **final answer**; the worker's tool calls stay inside it. The router node returns only `{\"next\": ...}` and adds no message to the chat."
    },
    {
      "t": "code",
      "file": "router_graph.py",
      "code": {
        "zh": "from typing import Literal\nfrom langchain_core.messages import SystemMessage\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.graph import END, START, MessagesState, StateGraph\nfrom pydantic import BaseModel, Field\n\nchat_agent = create_agent(model, tools=[], system_prompt=\"你是小浪，负责打招呼和闲聊，回答简洁。\", name=\"chat_agent\")\n\nclass Route(BaseModel):\n    \"\"\"决定把用户最新的一句话交给谁。\"\"\"\n    next: Literal[\"research\", \"dev\", \"chat\"] = Field(\n        description=\"research=课程、概念、环境、练习文件；dev=写代码、计算、查 bug；chat=打招呼和闲聊\"\n    )\n    reason: str = Field(description=\"一句话说明理由\")\n\nROUTER_SYSTEM = \"你是小浪助手的调度员。你不回答问题，只根据用户最新的一句话，决定交给谁处理。\"\nrouter_llm = model.with_structured_output(Route)   # 需要关掉思考模式（见 40 节）\n\nclass XiaolangState(MessagesState):     # messages 之外，多存一个「下一步交给谁」\n    next: str\n\ndef router(state: XiaolangState):\n    route = router_llm.invoke([SystemMessage(ROUTER_SYSTEM)] + state[\"messages\"])\n    print(f\"  [小浪调度] → {route.next}（{route.reason}）\")\n    return {\"next\": route.next}           # 只记下决定，不往对话里加消息\n\ndef pick_worker(state: XiaolangState):   # 条件边用的路由函数\n    return state[\"next\"]\n\ndef run_agent(agent, state):\n    \"\"\"把整段对话交给员工，只把它最后的回答带回主图。\"\"\"\n    result = agent.invoke({\"messages\": state[\"messages\"]})\n    return {\"messages\": [result[\"messages\"][-1]]}\n\nbuilder = StateGraph(XiaolangState)\nbuilder.add_node(\"router\", router)\nbuilder.add_node(\"research\", lambda state: run_agent(research_agent, state))\nbuilder.add_node(\"dev\", lambda state: run_agent(dev_agent, state))\nbuilder.add_node(\"chat\", lambda state: run_agent(chat_agent, state))\nbuilder.add_edge(START, \"router\")\nbuilder.add_conditional_edges(\"router\", pick_worker, [\"research\", \"dev\", \"chat\"])\nbuilder.add_edge(\"research\", END)\nbuilder.add_edge(\"dev\", END)\nbuilder.add_edge(\"chat\", END)\ngraph = builder.compile(checkpointer=InMemorySaver())",
        "en": "from typing import Literal\nfrom langchain_core.messages import SystemMessage\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.graph import END, START, MessagesState, StateGraph\nfrom pydantic import BaseModel, Field\n\nchat_agent = create_agent(model, tools=[], system_prompt=\"You are Xiaolang; handle greetings and small talk briefly.\", name=\"chat_agent\")\n\nclass Route(BaseModel):\n    \"\"\"Decide who handles the user's latest message.\"\"\"\n    next: Literal[\"research\", \"dev\", \"chat\"] = Field(\n        description=\"research=course, concepts, setup, practice files; dev=coding, calculations, bugs; chat=greetings and small talk\"\n    )\n    reason: str = Field(description=\"a one-sentence reason\")\n\nROUTER_SYSTEM = \"You are Xiaolang's dispatcher. You never answer; from the user's latest message you only decide who handles it.\"\nrouter_llm = model.with_structured_output(Route)   # needs thinking mode off (see lesson 40)\n\nclass XiaolangState(MessagesState):     # besides messages, remember who goes next\n    next: str\n\ndef router(state: XiaolangState):\n    route = router_llm.invoke([SystemMessage(ROUTER_SYSTEM)] + state[\"messages\"])\n    print(f\"  [dispatch] → {route.next} ({route.reason})\")\n    return {\"next\": route.next}           # record the decision only; no message is added\n\ndef pick_worker(state: XiaolangState):   # the routing function for the conditional edge\n    return state[\"next\"]\n\ndef run_agent(agent, state):\n    \"\"\"Give the whole chat to a worker; bring back only its final answer.\"\"\"\n    result = agent.invoke({\"messages\": state[\"messages\"]})\n    return {\"messages\": [result[\"messages\"][-1]]}\n\nbuilder = StateGraph(XiaolangState)\nbuilder.add_node(\"router\", router)\nbuilder.add_node(\"research\", lambda state: run_agent(research_agent, state))\nbuilder.add_node(\"dev\", lambda state: run_agent(dev_agent, state))\nbuilder.add_node(\"chat\", lambda state: run_agent(chat_agent, state))\nbuilder.add_edge(START, \"router\")\nbuilder.add_conditional_edges(\"router\", pick_worker, [\"research\", \"dev\", \"chat\"])\nbuilder.add_edge(\"research\", END)\nbuilder.add_edge(\"dev\", END)\nbuilder.add_edge(\"chat\", END)\ngraph = builder.compile(checkpointer=InMemorySaver())"
      },
      "note": {
        "zh": "`add_node` 的第二个参数要一个「接收 state 的函数」，`lambda state: run_agent(research_agent, state)`（29 节）就是现做一个这样的小函数，省得为每位员工各写一个 `def`。练习文件 `l42_router_graph.py` 里用的是普通的 `def`，两种写法一样。",
        "en": "`add_node`'s second argument must be a function that takes the state; `lambda state: run_agent(research_agent, state)` (lesson 29) makes one on the spot, saving a `def` per worker. The practice file `l42_router_graph.py` uses plain `def`s; both are the same."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "`next` 为什么用 `Literal[\"research\", \"dev\", \"chat\"]`，而不是普通的 `str`？",
        "en": "Why is `next` typed `Literal[\"research\", \"dev\", \"chat\"]` rather than plain `str`?"
      },
      "options": [
        {
          "zh": "把模型的选择限制在三个合法的节点名里，不会出现「程序员」「dev_agent」这类图里不存在的名字",
          "en": "It limits the model to three legal node names, so nothing like “programmer” or “dev_agent” that isn't in the graph can appear"
        },
        {
          "zh": "`Literal` 比 `str` 运行得快",
          "en": "`Literal` is faster than `str`"
        },
        {
          "zh": "pydantic 不支持 `str` 类型",
          "en": "pydantic doesn't support `str`"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "这三个值会写进发给模型的 JSON Schema（enum），模型只能从中选；就算返回了别的，pydantic 也会校验失败，而不是悄悄走错路。",
        "en": "The three values go into the JSON Schema sent to the model (as an enum), so it can only choose among them; anything else fails pydantic validation instead of silently taking a wrong turn."
      }
    },
    {
      "t": "p",
      "zh": "用练习文件 `l42_router_graph.py` 真实运行一次（调度 1 次 + 程序员 2 次模型调用）：",
      "en": "A real run of the practice file `l42_router_graph.py` (1 dispatch call + 2 model calls inside the programmer; translated):"
    },
    {
      "t": "code",
      "file": "输出示例 / sample output",
      "lang": "text",
      "code": {
        "zh": "你 / You: 帮我算一下 2 的 20 次方是多少\n  [小浪调度 / router] → dev（用户要求做数学计算，属于计算类任务，交给 dev 处理。）\n小浪（dev_agent）: 2 的 20 次方 = **1048576**\n\n```python\nprint(2 ** 20)\n```\n\n运行结果：`1048576`",
        "en": "You: Work out 2 to the power 20 for me\n  [dispatch] → dev (The user wants a math calculation, which is a computing task, so dev handles it.)\nXiaolang (dev_agent): 2 to the power 20 = **1048576**\n\n```python\nprint(2 ** 20)\n```\n\nResult: `1048576`"
      }
    },
    {
      "t": "p",
      "zh": "| | 主管版（视频的结构） | 路由版（自己连的图） |\n|---|---|---|\n| 谁回答用户 | 主管汇总后回答 | 被选中的员工 |\n| 一个问题能找几位员工 | 多位 | 1 位 |\n| 模型调用次数 | 多（主管至少 2 次 + 每位员工各自的调用） | 少（调度 1 次 + 一位员工） |\n| 流程是否可预测 | 由主管临场决定 | 是，图是固定的 |\n| 员工看到什么 | 主管写的问题 | 整段对话 |\n| 适合 | 问题复杂，要组合多位员工 | 问题类型清楚，追求速度和成本 |\n\n路由还有一种写法：不用条件边，让 `router` 节点自己返回 `Command(goto=...)` 决定下一站（35 节），效果一样。",
      "en": "| | Supervisor (the video's design) | Router (hand-wired graph) |\n|---|---|---|\n| Who answers the user | The supervisor, after merging | The chosen worker |\n| Workers per question | Several | 1 |\n| Model calls | More (≥2 for the supervisor + each worker's own) | Fewer (1 dispatch + one worker) |\n| Predictable flow | Decided by the supervisor on the fly | Yes, the graph is fixed |\n| What a worker sees | The supervisor's question | The whole chat |\n| Best for | Complex questions combining workers | Clear question types, speed and cost |\n\nAnother way to route: drop the conditional edge and let the `router` node return `Command(goto=...)` to pick the next stop itself (lesson 35); the effect is the same."
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "视频的服务器用什么当 `thread_id`？",
        "en": "What does the video's server use as the `thread_id`?"
      },
      "options": [
        {
          "zh": "一个固定的字符串，所有人共用",
          "en": "One fixed string shared by everyone"
        },
        {
          "zh": "前端传来的用户 id：每个用户一条线程，各自的记忆互不干扰",
          "en": "The user id sent by the browser: one thread per user, so memories never mix"
        },
        {
          "zh": "每条消息都生成一个新的 uuid",
          "en": "A new uuid for every message"
        },
        {
          "zh": "不需要 thread_id",
          "en": "No thread_id is needed"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "checkpointer 按 thread_id 存对话。共用一个就会把大家的对话混在一起；每条消息都换新的，就等于没有记忆。",
        "en": "The checkpointer stores chats by thread_id. One shared id mixes everyone's chats; a new id per message means no memory at all."
      }
    },
    {
      "q": {
        "zh": "主管把员工包装成 `@tool` 后，靠什么决定该找谁？",
        "en": "Once workers are wrapped with `@tool`, how does the supervisor decide whom to ask?"
      },
      "options": [
        {
          "zh": "随机选一个",
          "en": "It picks one at random"
        },
        {
          "zh": "员工 Agent 的 `name`",
          "en": "The workers' `name`"
        },
        {
          "zh": "LangGraph 的条件边",
          "en": "A LangGraph conditional edge"
        },
        {
          "zh": "工具的名字、参数和文档字符串，它们变成了发给模型的工具说明",
          "en": "The tools' names, parameters and docstrings, which become the tool descriptions the model reads"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "对主管来说员工就是普通工具，选法和 39 节一样，所以文档字符串要写清「什么问题交给谁」。",
        "en": "To the supervisor, workers are ordinary tools chosen as in lesson 39, so the docstrings must say which questions go to whom."
      }
    },
    {
      "q": {
        "zh": "视频里小浪的提示词要求：输出代码要用 `<pre>` 包起来，尖括号要转义。为什么？",
        "en": "Xiaolang's prompt in the video says to wrap code in `<pre>` and escape angle brackets. Why?"
      },
      "options": [
        {
          "zh": "这样模型生成得更快",
          "en": "It makes the model generate faster"
        },
        {
          "zh": "WebSocket 不能传输尖括号",
          "en": "WebSocket can't carry angle brackets"
        },
        {
          "zh": "回答会被放进 SSML（类似 XML 的标记）交给微软云合成语音，代码里没转义的尖括号会被当成标签，和 SSML 冲突",
          "en": "The answer goes into SSML (an XML-like markup) for Azure's speech synthesis, and unescaped angle brackets in code would be read as tags and clash with it"
        },
        {
          "zh": "FastAPI 会自动删掉没有转义的尖括号",
          "en": "FastAPI strips unescaped angle brackets"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "数字人说话用的是 SSML，`<` 和 `>` 在里面有特殊含义。回答要拿去做语音时，提示词里就得考虑后面的环节——同样的道理，还应该要求输出纯文字，免得把 Markdown 符号念出来。",
        "en": "The avatar speaks via SSML, where `<` and `>` have a special meaning. When answers feed a speech step, the prompt has to account for it – and for the same reason it should ask for plain text so Markdown symbols aren't read aloud."
      }
    },
    {
      "q": {
        "zh": "用户先问「1 到 100 里 3 的倍数之和」，接着说「那换成 5 的倍数呢？」。主管调用 `ask_programmer` 时，`question` 应该是？",
        "en": "The user asks for “the sum of multiples of 3 from 1 to 100”, then says “and multiples of 5?”. What should the supervisor pass as `question` to `ask_programmer`?"
      },
      "options": [
        {
          "zh": "「计算 1 到 100 里所有 5 的倍数之和」：改写成完整的任务",
          "en": "“Sum all multiples of 5 from 1 to 100” – a complete task"
        },
        {
          "zh": "「那换成 5 的倍数呢？」：原话照抄",
          "en": "“and multiples of 5?” – the user's exact words"
        },
        {
          "zh": "留空，程序员会自己看历史",
          "en": "Nothing – the programmer reads the history itself"
        },
        {
          "zh": "不用交给程序员",
          "en": "It shouldn't go to the programmer"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "每次调用员工都是全新的 `invoke`，员工只看到 `question`，看不到之前的对话，所以主管要把问题写完整。",
        "en": "Every worker call is a fresh `invoke` that sees only `question`, not the earlier chat, so the supervisor must write the full task."
      }
    },
    {
      "q": {
        "zh": "运行 `xiaolang.invoke({\"messages\": [...]})` 报 `ValueError: Checkpointer requires one or more of the following 'configurable' keys: thread_id, ...`。原因是？",
        "en": "`xiaolang.invoke({\"messages\": [...]})` fails with `ValueError: Checkpointer requires one or more of the following 'configurable' keys: thread_id, ...`. Why?"
      },
      "options": [
        {
          "zh": "没有设置 DEEPSEEK_API_KEY",
          "en": "DEEPSEEK_API_KEY isn't set"
        },
        {
          "zh": "`InMemorySaver` 只能用在 `StateGraph` 上",
          "en": "`InMemorySaver` only works with `StateGraph`"
        },
        {
          "zh": "创建主管时加了 checkpointer，运行时却没在 config 里给 `thread_id`",
          "en": "The supervisor has a checkpointer, but the run passes no `thread_id` in the config"
        },
        {
          "zh": "员工工具没有文档字符串",
          "en": "The worker tools lack docstrings"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "有 checkpointer 就必须告诉它存到哪条线程：`invoke(..., {\"configurable\": {\"thread_id\": ...}})`。视频里的 POST `/chat` 就是因为没传它而报错。",
        "en": "With a checkpointer you must say which thread to use: `invoke(..., {\"configurable\": {\"thread_id\": ...}})`. The video's POST `/chat` failed for exactly this reason."
      }
    },
    {
      "q": {
        "zh": "用户问：「LangGraph 是什么？另外帮我算一下 2 的 20 次方。」哪种结构更合适？",
        "en": "The user asks: “What is LangGraph? Also, what is 2 to the power 20?” Which structure fits better?"
      },
      "options": [
        {
          "zh": "路由版：一次只选一位员工，正好",
          "en": "Router: it picks exactly one worker – perfect"
        },
        {
          "zh": "主管版：分别询问信息搜索专家和程序员，再汇总回答",
          "en": "Supervisor: ask both the research expert and the programmer, then merge"
        },
        {
          "zh": "只用闲聊员工",
          "en": "Just the small-talk worker"
        },
        {
          "zh": "两种都不行",
          "en": "Neither works"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "一个问题涉及两位员工时，路由版只能顾一头；主管版可以连续调用两个员工工具，代价是模型调用更多。",
        "en": "When one question needs two workers, the router covers only one; the supervisor can call both worker tools, at the cost of more model calls."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "员工与主管",
        "en": "Workers and the supervisor"
      },
      "code": {
        "zh": "dev_agent = [[create_agent]](\n    model,\n    tools=[run_python],\n    system_prompt=\"你是 AI 应用程序员，用 run_python 运行代码。\",\n    [[name]]=\"dev_agent\",\n)\n\n@[[tool]]\ndef ask_programmer(question: str) -> str:\n    \"\"\"把写代码、计算、查 bug 的任务交给 AI 应用程序员。\"\"\"\n    result = dev_agent.[[invoke]]({\"messages\": [(\"user\", question)]})\n    return result[\"messages\"][-1].[[content]]\n\nxiaolang = create_agent(model, tools=[ask_researcher, ask_programmer],\n                        system_prompt=XIAOLANG_PROMPT, [[checkpointer]]=InMemorySaver())\nconfig = {\"[[configurable]]\": {\"[[thread_id]]\": user_id}}",
        "en": "dev_agent = [[create_agent]](\n    model,\n    tools=[run_python],\n    system_prompt=\"You are the AI programmer; run code with run_python.\",\n    [[name]]=\"dev_agent\",\n)\n\n@[[tool]]\ndef ask_programmer(question: str) -> str:\n    \"\"\"Give a coding, calculation or debugging task to the AI programmer.\"\"\"\n    result = dev_agent.[[invoke]]({\"messages\": [(\"user\", question)]})\n    return result[\"messages\"][-1].[[content]]\n\nxiaolang = create_agent(model, tools=[ask_researcher, ask_programmer],\n                        system_prompt=XIAOLANG_PROMPT, [[checkpointer]]=InMemorySaver())\nconfig = {\"[[configurable]]\": {\"[[thread_id]]\": user_id}}"
      },
      "explain": {
        "zh": "员工用 `create_agent` 创建；`@tool` 把调用员工的函数变成主管的工具，只返回最后一条消息的文字；主管带 checkpointer，运行时用 `thread_id` 区分用户。",
        "en": "Workers come from `create_agent`; `@tool` turns the function that calls a worker into a supervisor tool returning only the last message's text; the supervisor has a checkpointer, and `thread_id` separates users at run time."
      }
    },
    {
      "title": {
        "zh": "路由版的图",
        "en": "The router graph"
      },
      "code": "class Route(BaseModel):\n    next: [[Literal]][\"research\", \"dev\", \"chat\"]\n    reason: str\n\nrouter_llm = model.[[with_structured_output]](Route)\n\ndef pick_worker(state):\n    return state[\"[[next]]\"]\n\nbuilder.add_edge([[START]], \"router\")\nbuilder.[[add_conditional_edges]](\"router\", [[pick_worker]], [\"research\", \"dev\", \"chat\"])\nbuilder.add_edge(\"dev\", [[END]])\ngraph = builder.compile([[checkpointer]]=InMemorySaver())",
      "explain": {
        "zh": "`Literal` 限定三个节点名，结构化输出返回 `Route`；`pick_worker` 读出决定；条件边从 router 出发；加 checkpointer 共享记忆。",
        "en": "`Literal` limits the choice to three node names and structured output returns a `Route`; `pick_worker` reads the decision; the conditional edge starts at router; a checkpointer shares memory."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：本地知识库检索",
        "en": "Write it: local knowledge-base search"
      },
      "task": {
        "zh": "不看上面的代码，写出两个函数：\n1. `score(question, paragraph)`：遍历问题里每一组「相邻的两个字」（`question[i:i + 2]`），数一数有几组出现在 `paragraph` 里\n2. `search(question, paragraphs, top_k=2)`：用 `sorted` + `key=lambda ...` + `reverse=True` 按分数从高到低排序，返回前 `top_k` 段\n\n点 ▶ 运行：第一次应该找到「练习文件怎么运行」那段，第二次排第一的应该是「虚拟环境」那段。",
        "en": "Without looking above, write two functions:\n1. `score(question, paragraph)`: walk over every pair of neighbouring characters in the question (`question[i:i + 2]`) and count how many appear in `paragraph`\n2. `search(question, paragraphs, top_k=2)`: sort by score, highest first, with `sorted` + `key=lambda ...` + `reverse=True`, and return the first `top_k`\n\nPress ▶ Run: the first search should find the “run a practice file” paragraph; the second should rank the “virtual environments” paragraph first."
      },
      "run": true,
      "starter": {
        "zh": "paragraphs = [\n    \"为什么有两个虚拟环境？CrewAI 的依赖和 AgentScope 冲突，所以分开装。\",\n    \"练习文件怎么运行？在 VS Code 里选好解释器，然后点运行按钮。\",\n    \"找不到 DEEPSEEK_API_KEY 怎么办？关掉所有 VS Code 窗口再重新打开。\",\n]\n\n# 1. score(question, paragraph)：问题里相邻的两个字，有几组出现在 paragraph 里\n\n\n# 2. search(question, paragraphs, top_k=2)：按分数从高到低排好，返回前 top_k 段\n\n\nprint(search(\"练习文件要怎么运行\", paragraphs, top_k=1))\nprint(search(\"为什么要分开装环境\", paragraphs))",
        "en": "paragraphs = [\n    \"Why two virtual environments? CrewAI's dependencies clash with AgentScope's.\",\n    \"How do I run a practice file? Pick the interpreter in VS Code, then press Run.\",\n    \"DEEPSEEK_API_KEY not found? Close every VS Code window and reopen.\",\n]\n\n# 1. score(question, paragraph): how many pairs of neighbouring characters of the question appear in paragraph\n\n\n# 2. search(question, paragraphs, top_k=2): order by score, highest first, and return the first top_k\n\n\nprint(search(\"how to run a practice file\", paragraphs, top_k=1))\nprint(search(\"why two environments\", paragraphs))"
      },
      "solution": {
        "zh": "paragraphs = [\n    \"为什么有两个虚拟环境？CrewAI 的依赖和 AgentScope 冲突，所以分开装。\",\n    \"练习文件怎么运行？在 VS Code 里选好解释器，然后点运行按钮。\",\n    \"找不到 DEEPSEEK_API_KEY 怎么办？关掉所有 VS Code 窗口再重新打开。\",\n]\n\n# 1. score(question, paragraph)：问题里相邻的两个字，有几组出现在 paragraph 里\ndef score(question, paragraph):\n    count = 0\n    for i in range(len(question) - 1):\n        if question[i:i + 2] in paragraph:\n            count += 1\n    return count\n\n# 2. search(question, paragraphs, top_k=2)：按分数从高到低排好，返回前 top_k 段\ndef search(question, paragraphs, top_k=2):\n    ranked = sorted(paragraphs, key=lambda p: score(question, p), reverse=True)\n    return ranked[:top_k]\n\nprint(search(\"练习文件要怎么运行\", paragraphs, top_k=1))\nprint(search(\"为什么要分开装环境\", paragraphs))",
        "en": "paragraphs = [\n    \"Why two virtual environments? CrewAI's dependencies clash with AgentScope's.\",\n    \"How do I run a practice file? Pick the interpreter in VS Code, then press Run.\",\n    \"DEEPSEEK_API_KEY not found? Close every VS Code window and reopen.\",\n]\n\n# 1. score(question, paragraph): how many pairs of neighbouring characters of the question appear in paragraph\ndef score(question, paragraph):\n    count = 0\n    for i in range(len(question) - 1):\n        if question[i:i + 2] in paragraph:\n            count += 1\n    return count\n\n# 2. search(question, paragraphs, top_k=2): order by score, highest first, and return the first top_k\ndef search(question, paragraphs, top_k=2):\n    ranked = sorted(paragraphs, key=lambda p: score(question, p), reverse=True)\n    return ranked[:top_k]\n\nprint(search(\"how to run a practice file\", paragraphs, top_k=1))\nprint(search(\"why two environments\", paragraphs))"
      },
      "checks": [
        {
          "zh": "定义了 `score(question, paragraph)`",
          "en": "Defines `score(question, paragraph)`",
          "re": "def\\s+score\\s*\\(\\s*\\w+\\s*,\\s*\\w+\\s*\\)\\s*:"
        },
        {
          "zh": "用 `range(len(...) - 1)` 遍历",
          "en": "Loops with `range(len(...) - 1)`",
          "re": "range\\(\\s*len\\(\\s*\\w+\\s*\\)\\s*-\\s*1\\s*\\)"
        },
        {
          "zh": "用切片取相邻的两个字",
          "en": "Slices out two neighbouring characters",
          "re": "\\[\\s*i\\s*:\\s*i\\s*\\+\\s*2\\s*\\]"
        },
        {
          "zh": "用 `in` 判断有没有出现，并计数",
          "en": "Uses `in` and counts",
          "re": "\\+=\\s*1"
        },
        {
          "zh": "定义了 `search`，`top_k` 默认 2",
          "en": "Defines `search` with `top_k` defaulting to 2",
          "re": "def\\s+search\\s*\\([^)]*top_k\\s*=\\s*2\\s*\\)"
        },
        {
          "zh": "`sorted` 配 `key=lambda`",
          "en": "`sorted` with `key=lambda`",
          "re": "sorted\\([\\s\\S]*?key\\s*=\\s*lambda"
        },
        {
          "zh": "`reverse=True` 从高到低",
          "en": "`reverse=True` for highest first",
          "re": "reverse\\s*=\\s*True"
        },
        {
          "zh": "切片取前 `top_k` 个",
          "en": "Slices the first `top_k`",
          "re": "\\[\\s*:\\s*top_k\\s*\\]"
        }
      ]
    },
    {
      "title": {
        "zh": "手写：主管小浪",
        "en": "Write it: the supervisor Xiaolang"
      },
      "task": {
        "zh": "假设 `model`、`research_agent`、`dev_agent` 已经写好。写出：\n1. 员工工具 `ask_researcher(question: str) -> str`：用 `@tool` 装饰，写好文档字符串，调用 `research_agent`，返回它最后一条消息的 `content`\n2. 员工工具 `ask_programmer(question: str) -> str`：同样的写法，交给 `dev_agent`\n3. 主管 `xiaolang = create_agent(...)`：两个员工工具、`XIAOLANG_PROMPT`、`checkpointer=InMemorySaver()`\n4. 准备 `config = {\"configurable\": {\"thread_id\": ...}}`，问一句话，打印回答\n\n（框架代码不能在浏览器里运行：写完点「检查关键点」，再补全 `l42_xiaolang_todo.py` 实际运行。）",
        "en": "Assume `model`, `research_agent` and `dev_agent` exist. Write:\n1. the worker tool `ask_researcher(question: str) -> str`: decorated with `@tool`, with a docstring; it calls `research_agent` and returns its last message's `content`\n2. the worker tool `ask_programmer(question: str) -> str`: the same, for `dev_agent`\n3. the supervisor `xiaolang = create_agent(...)`: both worker tools, `XIAOLANG_PROMPT`, `checkpointer=InMemorySaver()`\n4. a `config = {\"configurable\": {\"thread_id\": ...}}`; ask one question and print the answer\n\n(Framework code can't run in the browser: use “Check key points”, then complete and run `l42_xiaolang_todo.py`.)"
      },
      "starter": {
        "zh": "from langchain.agents import create_agent\nfrom langchain_core.tools import tool\nfrom langgraph.checkpoint.memory import InMemorySaver\n# model、research_agent、dev_agent 已经写好（见上文）\n\nXIAOLANG_PROMPT = (\"你是小浪，管理着信息搜索专家（ask_researcher）和 AI 应用程序员（ask_programmer）。\"\n                   \"按问题类型分配，涉及两方面就分别询问再汇总。交给员工的问题要写完整。\")\n\n# 1. 员工工具 ask_researcher(question)：交给信息搜索专家，返回它最后的回答\n\n\n# 2. 员工工具 ask_programmer(question)：交给 AI 应用程序员，返回它最后的回答\n\n\n# 3. 主管 xiaolang：两个员工工具 + XIAOLANG_PROMPT + 短期记忆\n\n\n# 4. 准备带 thread_id 的 config，问一句话，打印小浪的回答\n",
        "en": "from langchain.agents import create_agent\nfrom langchain_core.tools import tool\nfrom langgraph.checkpoint.memory import InMemorySaver\n# model, research_agent and dev_agent are already written (see above)\n\nXIAOLANG_PROMPT = (\"You are Xiaolang, leading a research expert (ask_researcher) and an AI programmer (ask_programmer). \"\n                   \"Route by question type; for two-part questions ask both and merge. Write complete questions for them.\")\n\n# 1. worker tool ask_researcher(question): hand it to the research expert, return its final answer\n\n\n# 2. worker tool ask_programmer(question): hand it to the AI programmer, return its final answer\n\n\n# 3. the supervisor xiaolang: both worker tools + XIAOLANG_PROMPT + short-term memory\n\n\n# 4. build a config with a thread_id, ask one question, print Xiaolang's answer\n"
      },
      "solution": {
        "zh": "from langchain.agents import create_agent\nfrom langchain_core.tools import tool\nfrom langgraph.checkpoint.memory import InMemorySaver\n# model、research_agent、dev_agent 已经写好（见上文）\n\nXIAOLANG_PROMPT = (\"你是小浪，管理着信息搜索专家（ask_researcher）和 AI 应用程序员（ask_programmer）。\"\n                   \"按问题类型分配，涉及两方面就分别询问再汇总。交给员工的问题要写完整。\")\n\n# 1. 员工工具 ask_researcher(question)：交给信息搜索专家，返回它最后的回答\n@tool\ndef ask_researcher(question: str) -> str:\n    \"\"\"把关于本课程、概念、环境、练习文件的问题交给信息搜索专家，返回他的回答。\"\"\"\n    result = research_agent.invoke({\"messages\": [(\"user\", question)]})\n    return result[\"messages\"][-1].content\n\n# 2. 员工工具 ask_programmer(question)：交给 AI 应用程序员，返回它最后的回答\n@tool\ndef ask_programmer(question: str) -> str:\n    \"\"\"把写代码、计算、查 bug 的任务交给 AI 应用程序员，返回他的回答。\"\"\"\n    result = dev_agent.invoke({\"messages\": [(\"user\", question)]})\n    return result[\"messages\"][-1].content\n\n# 3. 主管 xiaolang：两个员工工具 + XIAOLANG_PROMPT + 短期记忆\nxiaolang = create_agent(\n    model,\n    tools=[ask_researcher, ask_programmer],\n    system_prompt=XIAOLANG_PROMPT,\n    checkpointer=InMemorySaver(),\n    name=\"xiaolang\",\n)\n\n# 4. 准备带 thread_id 的 config，问一句话，打印小浪的回答\nconfig = {\"configurable\": {\"thread_id\": \"user-1\"}}\nresult = xiaolang.invoke({\"messages\": [(\"user\", \"LangGraph 是什么？另外算一下 2 的 20 次方\")]}, config)\nprint(result[\"messages\"][-1].content)",
        "en": "from langchain.agents import create_agent\nfrom langchain_core.tools import tool\nfrom langgraph.checkpoint.memory import InMemorySaver\n# model, research_agent and dev_agent are already written (see above)\n\nXIAOLANG_PROMPT = (\"You are Xiaolang, leading a research expert (ask_researcher) and an AI programmer (ask_programmer). \"\n                   \"Route by question type; for two-part questions ask both and merge. Write complete questions for them.\")\n\n# 1. worker tool ask_researcher(question): hand it to the research expert, return its final answer\n@tool\ndef ask_researcher(question: str) -> str:\n    \"\"\"Ask the research expert about this course, concepts, setup or practice files; returns the answer.\"\"\"\n    result = research_agent.invoke({\"messages\": [(\"user\", question)]})\n    return result[\"messages\"][-1].content\n\n# 2. worker tool ask_programmer(question): hand it to the AI programmer, return its final answer\n@tool\ndef ask_programmer(question: str) -> str:\n    \"\"\"Give a coding, calculation or debugging task to the AI programmer; returns the answer.\"\"\"\n    result = dev_agent.invoke({\"messages\": [(\"user\", question)]})\n    return result[\"messages\"][-1].content\n\n# 3. the supervisor xiaolang: both worker tools + XIAOLANG_PROMPT + short-term memory\nxiaolang = create_agent(\n    model,\n    tools=[ask_researcher, ask_programmer],\n    system_prompt=XIAOLANG_PROMPT,\n    checkpointer=InMemorySaver(),\n    name=\"xiaolang\",\n)\n\n# 4. build a config with a thread_id, ask one question, print Xiaolang's answer\nconfig = {\"configurable\": {\"thread_id\": \"user-1\"}}\nresult = xiaolang.invoke({\"messages\": [(\"user\", \"What is LangGraph? Also, what is 2 to the power 20?\")]}, config)\nprint(result[\"messages\"][-1].content)"
      },
      "checks": [
        {
          "zh": "用 `@tool` 定义 `ask_researcher`",
          "en": "Defines `ask_researcher` with `@tool`",
          "re": "@tool\\s*\\n\\s*def\\s+ask_researcher\\s*\\("
        },
        {
          "zh": "`ask_programmer` 接收一个字符串参数并返回字符串",
          "en": "`ask_programmer` takes a string and returns a string",
          "re": "def\\s+ask_programmer\\s*\\(\\s*\\w+\\s*:\\s*str\\s*\\)\\s*->\\s*str\\s*:"
        },
        {
          "zh": "员工工具里调用 `research_agent.invoke(...)`",
          "en": "A worker tool calls `research_agent.invoke(...)`",
          "re": "research_agent\\.invoke\\("
        },
        {
          "zh": "员工工具里调用 `dev_agent.invoke(...)`",
          "en": "A worker tool calls `dev_agent.invoke(...)`",
          "re": "dev_agent\\.invoke\\("
        },
        {
          "zh": "只返回最后一条消息的 `content`",
          "en": "Returns only the last message's `content`",
          "re": "\\[\\s*-1\\s*\\]\\.content"
        },
        {
          "zh": "两个员工工具交给主管",
          "en": "Both worker tools go to the supervisor",
          "re": "tools\\s*=\\s*\\[\\s*ask_researcher\\s*,\\s*ask_programmer\\s*\\]"
        },
        {
          "zh": "主管带 `checkpointer=InMemorySaver()`",
          "en": "The supervisor has `checkpointer=InMemorySaver()`",
          "re": "checkpointer\\s*=\\s*InMemorySaver\\(\\s*\\)"
        },
        {
          "zh": "config 里有 `thread_id`",
          "en": "The config has a `thread_id`",
          "re": "[\\\"']configurable[\\\"']\\s*:\\s*\\{\\s*[\\\"']thread_id[\\\"']"
        },
        {
          "zh": "运行主管 `xiaolang.invoke(...)`",
          "en": "Runs the supervisor with `xiaolang.invoke(...)`",
          "re": "xiaolang\\.invoke\\("
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "员工工具只把用户的原话转过去：员工看不到之前的对话，「那换成 5 的倍数呢？」这种追问要由主管改写完整。",
      "en": "Forwarding the user's words verbatim to a worker: workers can't see the earlier chat, so a follow-up like “and multiples of 5?” must be rewritten in full by the supervisor."
    },
    {
      "zh": "两个员工工具的参数名不一样（比如 `question` 和 `task`）：模型容易混用，实测就出现过一次参数错误后重试。用同一个名字更稳。",
      "en": "Different parameter names for the two worker tools (e.g. `question` and `task`): the model mixes them up – in our test it hit an argument error and had to retry. One shared name is safer."
    },
    {
      "zh": "创建主管时加了 checkpointer，运行时却忘了在 config 里给 `thread_id`，得到 `ValueError: Checkpointer requires ... thread_id`。",
      "en": "Adding a checkpointer to the supervisor but forgetting `thread_id` in the config, which raises `ValueError: Checkpointer requires ... thread_id`."
    },
    {
      "zh": "所有用户共用一个 `thread_id`：大家的对话混在一起；每条消息都换新的：就没有记忆了。",
      "en": "One `thread_id` for every user mixes everyone's chats; a new one per message means no memory."
    },
    {
      "zh": "员工工具把整个 `result` 或全部消息交回主管：主管看到一堆中间步骤，又长又乱。",
      "en": "Returning the whole `result` or all messages to the supervisor: it wades through intermediate steps, long and messy."
    },
    {
      "zh": "在本机直接运行模型写的代码，既没有超时也没有隔离（视频用云端沙盒就是为了隔离）。",
      "en": "Running model-written code on your machine with no timeout and no isolation (the video uses a cloud sandbox precisely for isolation)."
    },
    {
      "zh": "路由版用开着思考模式的 deepseek-flash 做 `with_structured_output`，得到 400（见 40 节）。",
      "en": "Routing with `with_structured_output` on deepseek-flash in thinking mode and getting a 400 (see lesson 40)."
    },
    {
      "zh": "回答要拿去做语音合成，却没要求模型输出纯文字：数字人会把 Markdown 的星号和整段代码念出来（视频演示里就出现了）。",
      "en": "Sending answers to speech synthesis without asking for plain text: the avatar reads out Markdown asterisks and whole code blocks (it happens in the video's demo)."
    },
    {
      "zh": "以为提示词里写了「不要透露……」就万无一失：视频里小浪还是说出了分派任务的过程。",
      "en": "Assuming a “never reveal…” rule in the prompt is watertight: in the video Xiaolang still describes how tasks are assigned."
    }
  ],
  "recap": [
    {
      "zh": "视频的小浪 = 数字人前端 + WebSocket + FastAPI 服务 + 多智能体后台；Agent 部分是「主管 + 信息搜索专家 + AI 应用程序员」。",
      "en": "The video's Xiaolang = avatar front end + WebSocket + FastAPI server + multi-agent backend; the agent part is “supervisor + research expert + AI programmer”."
    },
    {
      "zh": "服务器：FastAPI 在 8000 端口提供 POST /chat 和 WebSocket /ws/chat；ping/pong 心跳保活；用户 id 当 thread_id，流式推回答，最后发 complete；再用情绪识别链给数字人配动作。",
      "en": "Server: FastAPI on port 8000 with POST /chat and WebSocket /ws/chat; a ping/pong heartbeat keeps it alive; the user id is the thread_id, the answer is streamed, then complete; a mood chain picks the avatar's gesture."
    },
    {
      "zh": "员工用 `create_agent(model, tools=[...], system_prompt=..., name=...)` 创建，先单独测试。",
      "en": "Workers come from `create_agent(model, tools=[...], system_prompt=..., name=...)`; test each alone first."
    },
    {
      "zh": "主管 = 另一个 `create_agent`，员工包装成 `@tool` 交给它，文档字符串说清交给谁——这就是 `create_supervisor` 的思路，也是现在官方推荐的写法。",
      "en": "The supervisor = another `create_agent` whose tools are the workers wrapped with `@tool`, with docstrings saying who handles what – the idea behind `create_supervisor`, and today's recommended way."
    },
    {
      "zh": "记忆：主管带 checkpointer，运行时 config 里给 `thread_id`，一个用户一条线程。",
      "en": "Memory: give the supervisor a checkpointer and pass a `thread_id` in the config – one thread per user."
    },
    {
      "zh": "`sorted(列表, key=lambda p: ..., reverse=True)[:k]` 取得分最高的 k 项，可以做简单的本地检索。",
      "en": "`sorted(items, key=lambda p: ..., reverse=True)[:k]` takes the top k – enough for simple local search."
    },
    {
      "zh": "路由版（结构化输出 + `Literal` + 条件边）只选一位员工，快而可预测；主管版能组合多位员工，但调用更多。",
      "en": "The router (structured output + `Literal` + a conditional edge) picks one worker, fast and predictable; the supervisor can combine several, at the cost of more calls."
    }
  ],
  "files": [
    {
      "path": "practice/l42_xiaolang_todo.py",
      "zh": "练习：补全检索工具、程序员员工、两个员工工具、带记忆的主管和 thread_id（有 TODO 提示）。",
      "en": "Exercise: complete the search tool, the programmer worker, both worker tools, the supervisor with memory and the thread_id (with TODO hints)."
    },
    {
      "path": "practice/l42_xiaolang_solution.py",
      "zh": "参考答案：主管小浪 + 信息搜索专家 + AI 应用程序员（视频的结构），终端里多轮对话，会打印主管调用了谁。",
      "en": "Solution: supervisor Xiaolang + research expert + AI programmer (the video's design), a multi-turn terminal chat that shows whom the supervisor asked."
    },
    {
      "path": "practice/l42_server.py",
      "zh": "选做：按视频思路给小浪套上 FastAPI 服务器（POST /chat、WebSocket /ws/chat、心跳、极简聊天页），没有数字人。",
      "en": "Optional: a FastAPI server around Xiaolang following the video (POST /chat, WebSocket /ws/chat, heartbeat, a minimal chat page), without the avatar."
    },
    {
      "path": "practice/l42_router_graph.py",
      "zh": "对照：同一支团队用 LangGraph 手动连成路由版（结构化输出 + 条件边），从参考答案导入员工。",
      "en": "Comparison: the same team hand-wired as a LangGraph router (structured output + conditional edge), importing the workers from the solution."
    },
    {
      "path": "practice/data/l42_faq.md",
      "zh": "信息搜索专家的知识库《小浪学习手册》，可以自己添加问答（每段之间空一行）。",
      "en": "The research expert's knowledge base, the Xiaolang handbook; add your own Q&As (one blank line between paragraphs)."
    }
  ]
});
