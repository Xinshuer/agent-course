COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l20",
  "priority": "important",
  "handwrite": true,
  "studyMinutes": 45,
  "source": "subtitle",
  "summary": {
    "zh": "这一集分两半。前半用 Python 的 `mcp` 库亲手搭两个 MCP 服务——远程的 streamable-http 版和本地的 stdio 版，各有一个加法工具和一个问候模板，再写客户端测试它们；后半回到 AgentScope：用 `StdioMCPConfig` / `HttpMCPConfig` + `MCPClient` 描述 MCP 服务，交给工作空间 `LocalWorkspace`，把工作空间的工具、MCP 和技能一起放进工具箱，让智能体调用 MCP 做加法，再按一个「写小说」技能把小说分成好几个文件写出来。",
    "en": "The episode has two halves. First, the Python `mcp` library is used to build two MCP servers by hand – a remote streamable-http one and a local stdio one, each with an add tool and a greeting template – plus a client that tests them. Then back to AgentScope: describe the servers with `StdioMCPConfig` / `HttpMCPConfig` + `MCPClient`, hand them to a `LocalWorkspace`, put the workspace's tools, MCP servers and skills into one toolkit, and let the agent add numbers through MCP and write a novel into several files by following a story-writing skill."
  },
  "goals": [
    {
      "zh": "说清楚 MCP 和 Skill 的区别：MCP 是要去连接的服务，Skill 是直接挂在智能体上的说明书文件夹",
      "en": "Explain how MCP and Skills differ: MCP is a service the agent connects to; a Skill is a folder of instructions mounted directly on the agent"
    },
    {
      "zh": "用 `FastMCP` 写远程（streamable-http）和本地（stdio）两种 MCP 服务，会用 `@mcp.tool()` 和 `@mcp.resource()`",
      "en": "Write remote (streamable-http) and local (stdio) MCP servers with `FastMCP`, using `@mcp.tool()` and `@mcp.resource()`"
    },
    {
      "zh": "用 `mcp` 库的 `ClientSession` 连接两种服务，调用工具、读取资源模板",
      "en": "Connect to both kinds of server with the `mcp` library's `ClientSession`, call a tool and read a resource template"
    },
    {
      "zh": "在 AgentScope 里用 `StdioMCPConfig` / `HttpMCPConfig` + `MCPClient` 描述 MCP 服务，知道名字为什么不能重复",
      "en": "Describe MCP servers in AgentScope with `StdioMCPConfig` / `HttpMCPConfig` + `MCPClient`, and know why names must be unique"
    },
    {
      "zh": "用 `LocalWorkspace` 管理 MCP 和技能，把工作空间的工具、MCP、技能一起交给 `Toolkit`",
      "en": "Let a `LocalWorkspace` manage MCP servers and skills, and hand its tools, MCP servers and skills to a `Toolkit`"
    },
    {
      "zh": "知道 2.0.9 里技能文件夹该放在工作空间的哪里，以及 `skill_paths` 什么时候才生效",
      "en": "Know where skill folders go inside a 2.0.9 workspace, and when `skill_paths` takes effect"
    }
  ],
  "blocks": [
    {
      "t": "h",
      "zh": "一、MCP 和 Skill 有什么不同",
      "en": "1. How MCP and Skills differ"
    },
    {
      "t": "p",
      "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=0) 这一集继续 AgentScope 2.0，讲智能体怎样使用 **MCP** 和 **Skill**。老师先比较这两者：\n- **MCP** 需要一个独立的 **MCP 服务**。智能体启动后去连接这个服务，从服务那里拿到工具的说明和用法。工具信息有两种「注入」方式：一种是一开始就把所有工具的信息一次性交给智能体；另一种是等智能体真正需要时，它再去问 MCP 服务。\n- **Skill** 不需要服务，它直接「挂」在智能体上：一个文件夹，里面是一份说明书 `SKILL.md`，可能还有模板、脚本之类的资料。\n\n| | MCP | Skill |\n|---|---|---|\n| 是什么 | 一个运行着的服务，对外提供工具 | 一个文件夹：说明书 + 资料 |\n| 智能体怎么用 | 连接服务 → 拿到工具 → 调用 | 先只看名字和简介，用到时再读全文，照着做 |\n| 带来什么 | 新的「手」：能执行的工具 | 新的「经验」：做某件事的步骤和规范 |\n\n[▶ 00:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=32) 既然 MCP 先得有服务，老师就先用一半时间讲 Python 的 `mcp` 库：怎样开一个 MCP 服务、怎样从客户端调用它。弄懂这一层，再看 AgentScope 里的 MCP 配置就很轻松。",
      "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=0) This episode continues with AgentScope 2.0 and shows how an agent uses **MCP** and **Skills**. The instructor first compares them:\n- **MCP** needs a separate **MCP server**. When the agent starts it connects to that server and gets the tools' descriptions and usage from it. Tool information can be “injected” in two ways: either all of it is handed to the agent up front, or the agent asks the server only when it actually needs a tool.\n- A **Skill** needs no server; it is mounted directly on the agent: a folder holding a manual, `SKILL.md`, plus perhaps templates, scripts and other material.\n\n| | MCP | Skill |\n|---|---|---|\n| What it is | A running service that offers tools | A folder: a manual + resources |\n| How the agent uses it | connect → get the tools → call them | sees only the name and summary at first, reads the full text when needed, then follows it |\n| What it adds | new “hands”: tools it can run | new “know-how”: steps and conventions for a task |\n\n[▶ 00:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=32) Because MCP needs a server first, the instructor spends the first half on the Python `mcp` library: how to start an MCP server and how to call it from a client. Once that layer is clear, the MCP settings in AgentScope are easy to follow."
    },
    {
      "t": "check",
      "q": {
        "zh": "关于 MCP 和 Skill，哪种说法是对的？",
        "en": "Which statement about MCP and Skills is correct?"
      },
      "options": [
        {
          "zh": "Skill 也要先启动一个服务，智能体才能连接",
          "en": "A Skill also needs a running server for the agent to connect to"
        },
        {
          "zh": "MCP 要连接一个服务来获得工具；Skill 是直接挂在智能体上的文件夹",
          "en": "MCP connects to a server to get tools; a Skill is a folder mounted directly on the agent"
        },
        {
          "zh": "MCP 只能提供说明文字，不能执行任何操作",
          "en": "MCP can only provide text, it cannot run anything"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "MCP 服务对外提供能执行的工具，需要先有服务；Skill 是一份说明书（加资料），告诉智能体某件事该怎么做。",
        "en": "An MCP server offers runnable tools and must exist first; a Skill is a manual (plus resources) telling the agent how to do a task."
      }
    },
    {
      "t": "h",
      "zh": "二、用 mcp 库写 MCP 服务端",
      "en": "2. Writing MCP servers with the mcp library"
    },
    {
      "t": "p",
      "zh": "[▶ 01:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=63) 11 节已经用 `FastMCP` 写过一个 stdio 服务器。这一集多了两样东西：**远程**服务和**资源模板**。视频里远程服务端的步骤：\n1. 从 `mcp.server.fastmcp` 导入 `FastMCP`；另外从 `urllib` 导入做 URL 编码、解码的函数\n2. [▶ 01:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=95) 创建实例。远程版要给**名字、网址和端口**：名字 `remote_mcp`，网址 `0.0.0.0`，端口 `8000`\n3. 用 `@mcp.tool()` 装饰一个加法函数 `add(a, b)`，它就被打包成了 MCP 工具：模型连上服务后，传两个数进来，拿回它们的和。[▶ 02:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=127) 注意这里的 `mcp` 是**刚创建的实例**，不是导入的 `mcp` 库\n4. 用 `@mcp.resource(\"greeting://{name}\")` 定义一个**资源模板**：地址里 `{name}` 的位置填了什么，就作为参数传进函数，函数返回一句问候\n5. [▶ 02:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=157) 最后 `mcp.run(transport=\"streamable-http\")` 启动服务",
      "en": "[▶ 01:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=63) Lesson 11 already wrote a stdio server with `FastMCP`. This episode adds two things: a **remote** server and a **resource template**. The video's remote server, step by step:\n1. Import `FastMCP` from `mcp.server.fastmcp`, plus the URL-encoding/decoding helpers from `urllib`\n2. [▶ 01:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=95) Create the instance. The remote version needs a **name, a host and a port**: name `remote_mcp`, host `0.0.0.0`, port `8000`\n3. Decorate an addition function `add(a, b)` with `@mcp.tool()` and it becomes an MCP tool: once a model connects, it passes in two numbers and gets their sum back. [▶ 02:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=127) Note that `mcp` here is **the instance just created**, not the imported `mcp` library\n4. Define a **resource template** with `@mcp.resource(\"greeting://{name}\")`: whatever fills the `{name}` slot in the address is passed into the function, which returns a greeting\n5. [▶ 02:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=157) Finally `mcp.run(transport=\"streamable-http\")` starts the server"
    },
    {
      "t": "code",
      "file": "l20_remote_mcp_server.py",
      "code": {
        "zh": "from urllib.parse import unquote\n\nfrom mcp.server.fastmcp import FastMCP\nfrom mcp.types import ToolAnnotations\n\n# 远程版：名字 + 网址 + 端口（视频里网址写的是 0.0.0.0）\nmcp = FastMCP(\"remote_mcp\", host=\"127.0.0.1\", port=8000, log_level=\"WARNING\")\n\n\n@mcp.tool(annotations=ToolAnnotations(readOnlyHint=True))   # 装饰器：把函数变成 MCP 工具\ndef add(a: float, b: float) -> float:\n    \"\"\"Add two numbers and return the sum.\"\"\"\n    return round(a + b, 10)\n\n\n@mcp.resource(\"greeting://{name}\")          # 资源模板：{name} 的内容会传给参数 name\ndef get_greeting(name: str) -> str:\n    \"\"\"Return a greeting for name.\"\"\"\n    return f\"你好，{unquote(name)}！\"          # 中文在地址里被编码过，先解码\n\n\nif __name__ == \"__main__\":\n    mcp.run(transport=\"streamable-http\")    # 远程连接方式",
        "en": "from urllib.parse import unquote\n\nfrom mcp.server.fastmcp import FastMCP\nfrom mcp.types import ToolAnnotations\n\n# remote version: name + host + port (the video uses 0.0.0.0)\nmcp = FastMCP(\"remote_mcp\", host=\"127.0.0.1\", port=8000, log_level=\"WARNING\")\n\n\n@mcp.tool(annotations=ToolAnnotations(readOnlyHint=True))   # decorator: turns the function into an MCP tool\ndef add(a: float, b: float) -> float:\n    \"\"\"Add two numbers and return the sum.\"\"\"\n    return round(a + b, 10)\n\n\n@mcp.resource(\"greeting://{name}\")          # resource template: whatever fills {name} becomes the name argument\ndef get_greeting(name: str) -> str:\n    \"\"\"Return a greeting for name.\"\"\"\n    return f\"你好，{unquote(name)}！\"          # \"Hello, <name>!\"; Chinese arrives URL-encoded, so decode it first\n\n\nif __name__ == \"__main__\":\n    mcp.run(transport=\"streamable-http\")    # the remote transport"
      }
    },
    {
      "t": "p",
      "zh": "几处细节：\n- `0.0.0.0` 的意思是「本机所有网卡都监听」，同一局域网里的其他电脑也能连上。自己练习写 `127.0.0.1`（只有本机能连）更安全。\n- 客户端请求 `greeting://小花` 时，「小花」到了服务端会变成 `%E5%B0%8F%E8%8A%B1` 这样的编码（实测确实如此），所以要用 `unquote` 解码——这就是视频导入 `urllib` 的原因。\n- `readOnlyHint=True` 是视频里没有的，原因见第四部分。\n- `round(a + b, 10)`：小数在电脑里有微小误差，`1.1 + 2.2` 直接算出来是 `3.3000000000000003`，四舍五入一下才显示成 `3.3`。",
      "en": "A few details:\n- `0.0.0.0` means “listen on every network interface”, so other computers on the same network can connect. For practice, `127.0.0.1` (this computer only) is safer.\n- When a client requests `greeting://小花`, the name reaches the server encoded as `%E5%B0%8F%E8%8A%B1` (verified), so `unquote` decodes it – that is why the video imports `urllib`.\n- `readOnlyHint=True` is not in the video; part 4 explains why we add it.\n- `round(a + b, 10)`: decimals carry tiny errors inside a computer – `1.1 + 2.2` is really `3.3000000000000003` – so rounding makes it print as `3.3`."
    },
    {
      "t": "py",
      "title": {
        "zh": "URL 编码：网址里的中文为什么变成了 %E5……",
        "en": "URL encoding: why Chinese in an address turns into %E5…"
      },
      "zh": "网址里只能出现英文字母、数字和少数几个符号。中文、空格这样的字符要先**编码**：把它在 UTF-8 里的每个字节写成 `%` 加两位十六进制数。一个汉字占 3 个字节，所以「小」变成 `%E5%B0%8F` 三组。\n\n`urllib.parse` 是 Python 自带的模块：`quote(文字)` 负责编码，`unquote(文字)` 负责解码。服务端从地址里拿到的是编码后的样子，用 `unquote` 还原成中文再使用。",
      "en": "An address may only contain English letters, digits and a few symbols. Characters such as Chinese or spaces must first be **encoded**: each of their UTF-8 bytes is written as `%` plus two hex digits. A Chinese character takes 3 bytes, so “小” becomes the three groups `%E5%B0%8F`.\n\n`urllib.parse` ships with Python: `quote(text)` encodes and `unquote(text)` decodes. The server receives the encoded form from the address and uses `unquote` to get the Chinese back.",
      "code": {
        "zh": "from urllib.parse import quote, unquote\n\nname = \"小花\"\nencoded = quote(name)                 # 编码：中文 → %XX\nprint(encoded)                        # %E5%B0%8F%E8%8A%B1\nprint(unquote(encoded))               # 解码：变回中文\n\nuri = \"greeting://\" + encoded         # 客户端请求 greeting://小花 时，服务端拿到的样子\npart = uri.split(\"://\")[1]            # 取出 {name} 那一段\nprint(part, \"->\", unquote(part))",
        "en": "from urllib.parse import quote, unquote\n\nname = \"小花\"\nencoded = quote(name)                 # encode: Chinese -> %XX\nprint(encoded)                        # %E5%B0%8F%E8%8A%B1\nprint(unquote(encoded))               # decode: back to Chinese\n\nuri = \"greeting://\" + encoded         # what the server sees for greeting://小花\npart = uri.split(\"://\")[1]            # take the {name} part\nprint(part, \"->\", unquote(part))"
      }
    },
    {
      "t": "p",
      "zh": "[▶ 02:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=157) `transport` 参数决定服务端和客户端**怎样通信**。老师讲了三种：\n\n| 方式 | `transport=` | 类型 | 要不要先启动服务端 |\n|---|---|---|---|\n| 标准输入输出 | `\"stdio\"` | 本地 | 不用：客户端会把服务端脚本当作子进程启动 |\n| SSE | `\"sse\"` | 远程 | 要 |\n| 可流式 HTTP | `\"streamable-http\"` | 远程 | 要 |\n\nSSE 是较早的远程方式，streamable HTTP 是它的替代和升级版，所以视频只讲 stdio 和 streamable HTTP。\n\n[▶ 03:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=189) 本地版几乎一样，只有两处不同：创建实例时**只给名字**（视频里叫 `local_mcp`），不用网址和端口；`run` 的 `transport` 换成 `\"stdio\"`。这个文件不需要自己运行，[▶ 03:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=221) 只有远程版才需要先把服务端跑起来。",
      "en": "[▶ 02:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=157) The `transport` argument decides **how** server and client talk. The instructor covers three:\n\n| Way | `transport=` | Kind | Start the server first? |\n|---|---|---|---|\n| Standard input/output | `\"stdio\"` | local | No: the client starts the server script as a subprocess |\n| SSE | `\"sse\"` | remote | Yes |\n| Streamable HTTP | `\"streamable-http\"` | remote | Yes |\n\nSSE is the older remote transport and streamable HTTP replaces and improves on it, so the video only uses stdio and streamable HTTP.\n\n[▶ 03:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=189) The local version is almost identical, with two differences: the instance gets **only a name** (`local_mcp` in the video), no host or port; and `run` uses `transport=\"stdio\"`. You never run this file yourself; [▶ 03:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=221) only the remote version has to be started first."
    },
    {
      "t": "code",
      "file": "l20_local_mcp_server.py",
      "code": {
        "zh": "# 和远程版只有两处不同 ↓\nmcp = FastMCP(\"local_mcp\", log_level=\"WARNING\")     # 1. 只要名字，不要网址和端口\n\n# ……add 工具和 greeting 模板与远程版完全相同……\n\nif __name__ == \"__main__\":\n    mcp.run(transport=\"stdio\")                      # 2. 本地方式：通过标准输入输出通信",
        "en": "# only two differences from the remote version ↓\nmcp = FastMCP(\"local_mcp\", log_level=\"WARNING\")     # 1. a name only, no host or port\n\n# ... the add tool and the greeting template are the same as in the remote version ...\n\nif __name__ == \"__main__\":\n    mcp.run(transport=\"stdio\")                      # 2. local: talk over stdin/stdout"
      }
    },
    {
      "t": "h",
      "zh": "三、用 mcp 库写客户端，测试两个服务",
      "en": "3. A client with the mcp library to test both servers"
    },
    {
      "t": "p",
      "zh": "[▶ 03:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=221) 远程客户端：导入 `asyncio`，再从 `mcp.client.streamable_http` 导入客户端函数，然后写一个异步函数：\n1. 连接服务端，从上下文管理器（`async with`，见 11 节）里拿到**读、写两个通道**\n2. 用这两个通道开一个会话 `ClientSession`，先 `await session.initialize()` 初始化\n3. [▶ 04:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=252) `call_tool(\"add\", {\"a\": 1.1, \"b\": 2.2})` 调用加法工具，打印结果\n4. `read_resource(\"greeting://小花\")` 按模板取内容，打印\n\n[▶ 04:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=283) 本地客户端的不同之处：先用 `StdioServerParameters` 写好**服务的启动参数**——`command` 是用什么程序运行，`args` 是服务端脚本；客户端函数换成 `mcp.client.stdio` 里的 `stdio_client`。[▶ 05:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=315) 拿读写通道的同时，它会**顺便把服务端启动起来**；之后的会话、调用工具、读模板，和远程版一模一样。所以下面把这几步提成了一个公用函数 `use_session`。",
      "en": "[▶ 03:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=221) The remote client: import `asyncio` and the client function from `mcp.client.streamable_http`, then write an async function that\n1. connects to the server and gets **a read stream and a write stream** from the context manager (`async with`, lesson 11)\n2. opens a `ClientSession` on those streams and first runs `await session.initialize()`\n3. [▶ 04:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=252) calls the add tool with `call_tool(\"add\", {\"a\": 1.1, \"b\": 2.2})` and prints the result\n4. reads through the template with `read_resource(\"greeting://小花\")` and prints it\n\n[▶ 04:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=283) What changes for the local client: first describe **how to start the server** with `StdioServerParameters` – `command` is the program to run and `args` the server script – and use `stdio_client` from `mcp.client.stdio`. [▶ 05:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=315) Getting the streams **also starts the server**; the session, tool call and template read are then exactly the same as for the remote version. That is why the code below moves those steps into one shared function, `use_session`."
    },
    {
      "t": "code",
      "file": "l20_mcp_client_test.py",
      "code": {
        "zh": "import asyncio\nimport sys\nfrom pathlib import Path\n\nfrom mcp import ClientSession, StdioServerParameters\nfrom mcp.client.stdio import stdio_client\nfrom mcp.client.streamable_http import streamable_http_client\n\nHERE = Path(__file__).parent\n\n\nasync def use_session(session):\n    await session.initialize()                                        # 先握手\n    result = await session.call_tool(\"add\", {\"a\": 1.1, \"b\": 2.2})      # 调用工具\n    print(\"add(1.1, 2.2) =\", result.content[0].text)\n    greeting = await session.read_resource(\"greeting://小花\")          # 按模板取内容\n    print(\"greeting://小花 ->\", greeting.contents[0].text)\n\n\nasync def remote():                              # 服务端要先在另一个终端里运行\n    async with streamable_http_client(\"http://127.0.0.1:8000/mcp\") as (read, write, _):   # 读、写两个通道\n        async with ClientSession(read, write) as session:\n            await use_session(session)\n\n\nasync def local():\n    params = StdioServerParameters(              # 本地服务的启动参数\n        command=sys.executable,                  # 用哪个程序运行：当前这个 Python\n        args=[str(HERE / \"l20_local_mcp_server.py\")],\n    )\n    async with stdio_client(params) as (read, write):    # 这一步顺便启动了服务端\n        async with ClientSession(read, write) as session:\n            await use_session(session)\n\n\nif __name__ == \"__main__\":\n    mode = sys.argv[1] if len(sys.argv) > 1 else \"local\"\n    asyncio.run(remote() if mode == \"remote\" else local())",
        "en": "import asyncio\nimport sys\nfrom pathlib import Path\n\nfrom mcp import ClientSession, StdioServerParameters\nfrom mcp.client.stdio import stdio_client\nfrom mcp.client.streamable_http import streamable_http_client\n\nHERE = Path(__file__).parent\n\n\nasync def use_session(session):\n    await session.initialize()                                        # handshake first\n    result = await session.call_tool(\"add\", {\"a\": 1.1, \"b\": 2.2})      # call a tool\n    print(\"add(1.1, 2.2) =\", result.content[0].text)\n    greeting = await session.read_resource(\"greeting://小花\")          # read through the template\n    print(\"greeting://小花 ->\", greeting.contents[0].text)\n\n\nasync def remote():                              # the server must already be running\n    async with streamable_http_client(\"http://127.0.0.1:8000/mcp\") as (read, write, _):   # read and write streams\n        async with ClientSession(read, write) as session:\n            await use_session(session)\n\n\nasync def local():\n    params = StdioServerParameters(              # how to start the local server\n        command=sys.executable,                  # which program: this same Python\n        args=[str(HERE / \"l20_local_mcp_server.py\")],\n    )\n    async with stdio_client(params) as (read, write):    # this also starts the server\n        async with ClientSession(read, write) as session:\n            await use_session(session)\n\n\nif __name__ == \"__main__\":\n    mode = sys.argv[1] if len(sys.argv) > 1 else \"local\"\n    asyncio.run(remote() if mode == \"remote\" else local())"
      }
    },
    {
      "t": "note",
      "zh": "版本差异：远程客户端函数在较早的 mcp 版本里叫 `streamablehttp_client`（中间没有下划线），很多教程和视频里都是这个名字。本机装的 mcp 1.30 里它已经标成过时（还能用，但会给出警告），新名字是 `streamable_http_client`，用法一样，`async with` 后面同样拿到 `(read, write, _)` 三个值。",
      "en": "Version difference: in older mcp versions the remote client function is called `streamablehttp_client` (no underscore in the middle), the name many tutorials and videos use. In the installed mcp 1.30 that name is deprecated (it still works but warns); the new name is `streamable_http_client`, used the same way – `async with` still gives three values, `(read, write, _)`."
    },
    {
      "t": "video",
      "zh": "[▶ 05:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=346) 演示：老师先在一个终端里启动远程服务端，再运行测试脚本，[▶ 06:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=377) 得到两数之和 3.3 和模板返回的「你好小花」；本地服务不用提前启动，测试脚本自己把它拉起来，结果一样。\n\n照着做：在 `practice` 文件夹里，本地版直接运行 `python l20_mcp_client_test.py local`；远程版先在一个终端运行 `python l20_remote_mcp_server.py` 并保持运行，再在另一个终端运行 `python l20_mcp_client_test.py remote`。（`python` 指 `..\\.venv\\Scripts\\python.exe`。）",
      "en": "[▶ 05:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=346) Demo: the instructor starts the remote server in one terminal, then runs the test script [▶ 06:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=377) and gets the sum 3.3 and the template's greeting “你好小花” (“Hello, Xiaohua”). The local server needs no head start – the test script launches it itself – and gives the same result.\n\nTry it: in the `practice` folder, run the local test directly with `python l20_mcp_client_test.py local`. For the remote test, first run `python l20_remote_mcp_server.py` in one terminal and leave it running, then run `python l20_mcp_client_test.py remote` in a second terminal. (`python` means `..\\.venv\\Scripts\\python.exe`.)"
    },
    {
      "t": "code",
      "file": {
        "zh": "输出",
        "en": "Output"
      },
      "code": {
        "zh": "> python l20_mcp_client_test.py local\nadd(1.1, 2.2) = 3.3\ngreeting://小花 -> 你好，小花！",
        "en": "> python l20_mcp_client_test.py local\nadd(1.1, 2.2) = 3.3\ngreeting://小花 -> 你好，小花！"
      },
      "lang": "text"
    },
    {
      "t": "check",
      "q": {
        "zh": "运行 `l20_mcp_client_test.py remote` 时报连接错误，最可能的原因是？",
        "en": "`l20_mcp_client_test.py remote` fails with a connection error. The most likely cause?"
      },
      "options": [
        {
          "zh": "没有先在另一个终端里启动 `l20_remote_mcp_server.py`",
          "en": "`l20_remote_mcp_server.py` was not started in another terminal first"
        },
        {
          "zh": "没有写 `StdioServerParameters`",
          "en": "`StdioServerParameters` is missing"
        },
        {
          "zh": "加法工具没有写 docstring",
          "en": "The add tool has no docstring"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "远程（streamable-http）服务是一个独立运行的网络服务，客户端连接之前它必须已经在运行；只有 stdio 方式才由客户端自己启动服务端。",
        "en": "A remote (streamable-http) server is a separate network service and must be running before the client connects; only with stdio does the client start the server itself."
      }
    },
    {
      "t": "h",
      "zh": "四、在 AgentScope 里配置 MCP",
      "en": "4. Configuring MCP in AgentScope"
    },
    {
      "t": "p",
      "zh": "[▶ 06:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=408) 回到主题：在 AgentScope 里调用 MCP 服务。主程序要导入：`asyncio`；智能体和模型相关的类；工具箱 `Toolkit`；MCP 的配置类和 MCP 客户端；工作空间；消息和事件。（Skill 的配置很简单，放在代码里一起讲。）\n\n[▶ 07:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=439) **MCP 配置**说明「这个服务在哪、怎么连」：\n- 本地服务用 `StdioMCPConfig`：传入用什么程序运行（Python）和脚本位置，和上一部分的 `StdioServerParameters` 很像\n- 远程服务用 `HttpMCPConfig`：只要传入请求网址 `url`\n\n[▶ 07:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=469) 然后准备一个 **MCP 客户端列表**，每一项是一个 `MCPClient`：传入刚才的配置、服务名称 `name`，以及 `is_stateful`——客户端要不要保持连接、记住会话，老师建议一般设成 `True`。列表里可以放多个客户端，但[▶ 08:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=499) **名字不能重复**，否则可能出错。",
      "en": "[▶ 06:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=408) Back to the main topic: using MCP servers in AgentScope. The main program imports `asyncio`, the agent and model classes, the `Toolkit`, the MCP config classes and the MCP client, the workspace, and the message and event types. (Skills are simple to set up, so they are explained along with the code.)\n\n[▶ 07:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=439) An **MCP config** says “where the server is and how to reach it”:\n- a local server uses `StdioMCPConfig`: the program to run (Python) and the script's location, much like `StdioServerParameters` in part 3\n- a remote server uses `HttpMCPConfig`: just the request `url`\n\n[▶ 07:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=469) Next comes a **list of MCP clients**, each an `MCPClient` given the config, a server `name`, and `is_stateful` – whether the client keeps the connection and remembers the session; the instructor says `True` is the usual choice. The list may hold several clients, but [▶ 08:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=499) **names must not repeat**, or things can break."
    },
    {
      "t": "code",
      "file": "mcp_config.py",
      "code": {
        "zh": "import sys\nfrom pathlib import Path\n\nfrom agentscope.mcp import HttpMCPConfig, MCPClient, StdioMCPConfig\n\nHERE = Path(__file__).parent\n\n# 本地服务：用什么程序运行 + 脚本位置\nlocal_config = StdioMCPConfig(command=sys.executable, args=[str(HERE / \"l20_local_mcp_server.py\")])\n# 远程服务：只要网址（服务端要先运行）\nremote_config = HttpMCPConfig(url=\"http://127.0.0.1:8000/mcp\")\n\n# MCP 客户端列表：可以放多个，但 name 不能重复\nmcp_clients = [\n    MCPClient(name=\"local_mcp\", is_stateful=True, mcp_config=local_config),\n    # MCPClient(name=\"remote_mcp\", is_stateful=True, mcp_config=remote_config),\n]",
        "en": "import sys\nfrom pathlib import Path\n\nfrom agentscope.mcp import HttpMCPConfig, MCPClient, StdioMCPConfig\n\nHERE = Path(__file__).parent\n\n# local server: which program + the script\nlocal_config = StdioMCPConfig(command=sys.executable, args=[str(HERE / \"l20_local_mcp_server.py\")])\n# remote server: just the URL (the server must be running)\nremote_config = HttpMCPConfig(url=\"http://127.0.0.1:8000/mcp\")\n\n# the MCP client list: several allowed, but names must not repeat\nmcp_clients = [\n    MCPClient(name=\"local_mcp\", is_stateful=True, mcp_config=local_config),\n    # MCPClient(name=\"remote_mcp\", is_stateful=True, mcp_config=remote_config),\n]"
      }
    },
    {
      "t": "note",
      "zh": "实测重名的后果：两个客户端的工具会得到同一个名字（比如都叫 `mcp__a__add`），工具箱只留下一个（日志里提示「覆盖」），程序结束关闭连接时还可能报错。名字本身也有限制：只能用字母、数字、`_` 和 `-`，`my server`、`倒计时`、`count.down` 在创建 `MCPClient` 时就会报 `ValidationError`。",
      "en": "What duplicates actually do: both clients' tools get the same name (e.g. both `mcp__a__add`), so the toolkit keeps only one (the log says it is overwriting), and closing the connections at exit may raise an error. Names are restricted too: only letters, digits, `_` and `-`; `my server`, `倒计时` or `count.down` raise `ValidationError` when the `MCPClient` is created."
    },
    {
      "t": "warn",
      "zh": "**MCP 工具默认要用户批准。** AgentScope 2.0.9 只会自动放行带 `readOnlyHint=True` 标记的 MCP 工具（服务端声明「我只读、没有副作用」）。没有这个标记，智能体想调用时会停下来等批准（18 节的权限系统），看起来像卡住了。视频里没有这一步，所以本课的两个服务端给 `add` 加上了 `annotations=ToolAnnotations(readOnlyHint=True)`——加法确实没有副作用。会改东西的工具不要乱标只读，要用 18 节的允许规则单独放行（22 节就是这样做的）。\n\n智能体看到的 MCP 工具名是 `mcp__客户端名__工具名`，比如 `mcp__local_mcp__add`，这样不同服务的同名工具不会冲突。",
      "en": "**MCP tools need approval by default.** AgentScope 2.0.9 only auto-allows MCP tools marked `readOnlyHint=True` (the server declares “read-only, no side effects”). Without the mark the agent stops and waits for approval when it wants the tool (the permission system of lesson 18), which looks like a hang. The video has no such step, so both servers in this lesson give `add` the `annotations=ToolAnnotations(readOnlyHint=True)` mark – adding numbers really has no side effects. Do not mark tools that change things as read-only; allow them with a lesson-18 allow rule instead (lesson 22 does exactly that).\n\nThe agent sees MCP tools as `mcp__<client name>__<tool name>`, e.g. `mcp__local_mcp__add`, so same-named tools from different servers never clash."
    },
    {
      "t": "h",
      "zh": "五、工作空间：把 MCP 和 Skill 一起交给智能体",
      "en": "5. The workspace: handing MCP and Skills to the agent together"
    },
    {
      "t": "p",
      "zh": "[▶ 08:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=499) 接下来配置**工作空间**（18 节）。为什么要指定工作空间？工作空间初始化之后，里面会出现一个 `skills` 文件夹：把现成的技能文件夹复制进去，工作空间就能识别；或者在创建工作空间时直接告诉它技能文件夹在哪（`skill_paths`）。[▶ 08:51](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=531) 创建时还把上一步的 MCP 客户端列表交给它（`default_mcps`），然后初始化。\n\n建工具箱时，把**工作空间里的工具**（18 节的内置文件工具）、**MCP 服务**、**技能**三样一起交给 `Toolkit`，模型就既能用 MCP，也能用配置给它的技能。最后照常创建模型、智能体，进入循环 + 流式输出（15 节）。",
      "en": "[▶ 08:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=499) Next comes the **workspace** (lesson 18). Why a workspace? After it is initialised it contains a `skills` folder: copy an existing skill folder into it and the workspace recognises it – or tell the workspace where the skill folders are when you create it (`skill_paths`). [▶ 08:51](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=531) The MCP client list from the previous step is handed over at creation too (`default_mcps`), then the workspace is initialised.\n\nWhen building the toolkit, hand three things to `Toolkit` together: the **workspace's tools** (the built-in file tools of lesson 18), the **MCP servers** and the **skills**, so the model can use both MCP and the skills configured for it. Finally create the model and the agent as usual and enter the chat loop with streaming output (lesson 15)."
    },
    {
      "t": "code",
      "file": {
        "zh": "l20_mcp_skill_solution.py（main）",
        "en": "l20_mcp_skill_solution.py (main)"
      },
      "code": {
        "zh": "async def main():\n    local_config = StdioMCPConfig(command=sys.executable, args=[str(HERE / \"l20_local_mcp_server.py\")])\n    mcp_clients = [MCPClient(name=\"local_mcp\", is_stateful=True, mcp_config=local_config)]\n\n    workspace = LocalWorkspace(\n        workdir=str(WORKDIR),              # 工作空间的位置：data/l20_workspace\n        default_mcps=mcp_clients,          # MCP 客户端列表交给工作空间\n        skill_paths=[str(SKILL_DIR)],      # 技能文件夹（只在第一次创建工作空间时复制进去）\n    )\n    await workspace.initialize()\n    try:\n        # 工具箱 = 工作空间的工具（去掉命令行）+ MCP + 技能\n        tools = [t for t in await workspace.list_tools() if t.name not in (\"PowerShell\", \"Bash\")]\n        mcps = await workspace.list_mcps()          # 工作空间负责连接\n        skills = await workspace.list_skills()\n        print(\"MCP:\", [m.name for m in mcps], \"| skills:\", [s.name for s in skills])\n        toolkit = Toolkit(tools=tools, mcps=mcps, skills_or_loaders=skills)\n\n        permission = PermissionContext(            # 在工作空间里写文件自动放行（18 节）\n            mode=PermissionMode.ACCEPT_EDITS,\n            working_directories={str(WORKDIR): AdditionalWorkingDirectory(path=str(WORKDIR), source=\"session\")},\n        )\n        model = DeepSeekChatModel(credential=DeepSeekCredential(api_key=API_KEY), model=MODEL, stream=True)\n        agent = Agent(name=\"Friday\", system_prompt=\"你是一个乐于助人的中文助手。\", model=model,\n                      toolkit=toolkit, offloader=workspace, state=AgentState(permission_context=permission))\n\n        while True:                                 # 循环 + 流式输出（15 节）\n            text = input(\"\\n你 / You: \").strip()\n            if not text:\n                continue\n            if text == \"/exit\":\n                break\n            print(\"Friday: \", end=\"\", flush=True)\n            async for event in agent.reply_stream(UserMsg(name=\"user\", content=text)):\n                if event.type == EventType.TEXT_BLOCK_DELTA:\n                    print(event.delta, end=\"\", flush=True)\n                elif event.type == EventType.TOOL_CALL_START:\n                    print(f\"\\n  [调用工具 / tool] {event.tool_call_name}\", flush=True)\n            print()\n    finally:\n        await workspace.close()                     # 关闭工作空间里的 MCP 连接\n\n\nasyncio.run(main())",
        "en": "async def main():\n    local_config = StdioMCPConfig(command=sys.executable, args=[str(HERE / \"l20_local_mcp_server.py\")])\n    mcp_clients = [MCPClient(name=\"local_mcp\", is_stateful=True, mcp_config=local_config)]\n\n    workspace = LocalWorkspace(\n        workdir=str(WORKDIR),              # where it lives: data/l20_workspace\n        default_mcps=mcp_clients,          # hand the MCP list to the workspace\n        skill_paths=[str(SKILL_DIR)],      # skill folders (copied in only when the workspace is first created)\n    )\n    await workspace.initialize()\n    try:\n        # toolkit = workspace tools (minus the shell) + MCP + skills\n        tools = [t for t in await workspace.list_tools() if t.name not in (\"PowerShell\", \"Bash\")]\n        mcps = await workspace.list_mcps()          # the workspace connects them\n        skills = await workspace.list_skills()\n        print(\"MCP:\", [m.name for m in mcps], \"| skills:\", [s.name for s in skills])\n        toolkit = Toolkit(tools=tools, mcps=mcps, skills_or_loaders=skills)\n\n        permission = PermissionContext(            # file edits inside the workspace are allowed (lesson 18)\n            mode=PermissionMode.ACCEPT_EDITS,\n            working_directories={str(WORKDIR): AdditionalWorkingDirectory(path=str(WORKDIR), source=\"session\")},\n        )\n        model = DeepSeekChatModel(credential=DeepSeekCredential(api_key=API_KEY), model=MODEL, stream=True)\n        agent = Agent(name=\"Friday\", system_prompt=\"You are a helpful assistant.\", model=model,\n                      toolkit=toolkit, offloader=workspace, state=AgentState(permission_context=permission))\n\n        while True:                                 # chat loop with streaming (lesson 15)\n            text = input(\"\\n你 / You: \").strip()\n            if not text:\n                continue\n            if text == \"/exit\":\n                break\n            print(\"Friday: \", end=\"\", flush=True)\n            async for event in agent.reply_stream(UserMsg(name=\"user\", content=text)):\n                if event.type == EventType.TEXT_BLOCK_DELTA:\n                    print(event.delta, end=\"\", flush=True)\n                elif event.type == EventType.TOOL_CALL_START:\n                    print(f\"\\n  [调用工具 / tool] {event.tool_call_name}\", flush=True)\n            print()\n    finally:\n        await workspace.close()                     # closes the MCP connections\n\n\nasyncio.run(main())"
      }
    },
    {
      "t": "p",
      "zh": "和视频相比，这份代码多了三处，都是为了在 2.0.9 上顺利跑通：\n- 去掉了命令行工具 PowerShell / Bash：这个演示用不到，留着它，智能体可能去执行命令，又要停下来等批准\n- 用 18 节的 `ACCEPT_EDITS` 模式，智能体在工作空间里写文件不用每次批准（写小说要建好几个文件）\n- 启动时打印 MCP 和技能的名字，一眼就能确认它们加载上了",
      "en": "Compared with the video, this code adds three things, all to run smoothly on 2.0.9:\n- the PowerShell / Bash shell tool is left out: the demo does not need it, and with it the agent might run commands and stop for approval again\n- lesson 18's `ACCEPT_EDITS` mode lets the agent write files inside the workspace without approval each time (the novel needs several files)\n- the names of the MCP servers and skills are printed at start-up, so you can see at a glance that they loaded"
    },
    {
      "t": "py",
      "title": {
        "zh": "try / finally：不管成功还是出错，都要收尾",
        "en": "try / finally: always clean up, success or error"
      },
      "zh": "工作空间初始化后会启动 MCP 服务的子进程。如果程序中途出错（网络断了、模型报错……）而没有执行 `workspace.close()`，子进程可能留在后台。\n\n`try ... finally` 保证：不管 `try` 里的代码是正常结束、`return` 了，还是抛出了异常，`finally` 里的代码**一定会执行**。07 节的 `try/except` 解决「出错了怎么办」，`finally` 解决「最后一定要做的事」，两者可以一起用。\n\n18 节用的 `async with LocalWorkspace(...) as ws:` 也会自动收尾，效果和 `initialize()` + `try/finally` + `close()` 一样。本课按「先创建、再 `initialize()`、用完 `close()`」的顺序写（22 节视频里组装工作空间也是先创建再初始化），所以配 `try/finally`。",
      "en": "Initialising the workspace starts the MCP server subprocesses. If the program fails halfway (network down, model error…) and `workspace.close()` never runs, those subprocesses may linger in the background.\n\n`try ... finally` guarantees that the `finally` part **always runs**, whether the `try` part finishes normally, `return`s or raises an exception. Lesson 07's `try/except` answers “what to do on an error”; `finally` answers “what must happen at the end”. They can be combined.\n\nLesson 18's `async with LocalWorkspace(...) as ws:` also cleans up automatically – the same as `initialize()` + `try/finally` + `close()`. This lesson follows the order “create, then `initialize()`, then `close()` when done” (the lesson 22 video also creates the workspace first and then initialises it), so it pairs that with `try/finally`.",
      "code": {
        "zh": "def use_workspace(fail):\n    print(\"打开工作空间\")\n    try:\n        print(\"  和智能体聊天中……\")\n        if fail:\n            raise ValueError(\"网络断了\")      # raise：主动抛出异常（11 节）\n        return \"正常结束\"\n    finally:\n        print(\"关闭工作空间（MCP 子进程随之退出）\")   # 不管上面发生什么都会执行\n\n\nprint(use_workspace(fail=False))\n\ntry:\n    use_workspace(fail=True)\nexcept ValueError as e:\n    print(\"外面捕获到：\", e)",
        "en": "def use_workspace(fail):\n    print(\"open the workspace\")\n    try:\n        print(\"  chatting with the agent...\")\n        if fail:\n            raise ValueError(\"network down\")      # raise: throw an exception yourself (lesson 11)\n        return \"finished normally\"\n    finally:\n        print(\"close the workspace (the MCP subprocess exits)\")   # runs whatever happened above\n\n\nprint(use_workspace(fail=False))\n\ntry:\n    use_workspace(fail=True)\nexcept ValueError as e:\n    print(\"caught outside:\", e)"
      }
    },
    {
      "t": "warn",
      "zh": "**2.0.9 的技能文件夹和视频里不一样。** 视频里的工作空间下面是 `skills/` 文件夹，里面有一个 `.skills` 文件，技能直接复制进 `skills/`。2.0.9 按智能体分了区：\n- `skills/.seed/`：模板区，`skill_paths` 指定的技能先复制到这里\n- `skills/default/`：智能体真正读取的地方（`list_skills()` 不指定智能体时用它），里面的索引文件叫 `.index`\n\n实测：手动复制技能时要放进 `skills/default/` 才会被识别；放进 `skills/` 最外层，下次初始化会被挪进 `.seed`，而已经存在的 `default` 区**不会**再收到它。同理，`skill_paths` 只在第一次创建工作空间时生效——工作空间已经存在时再加，技能列表还是空的。这时删掉 `data/l20_workspace` 重来，或者调用 `await workspace.add_skill(技能文件夹)`。",
      "en": "**Skill folders in 2.0.9 differ from the video.** In the video the workspace has a `skills/` folder holding a `.skills` file, and skills are copied straight into `skills/`. 2.0.9 partitions it per agent:\n- `skills/.seed/`: the template area; skills from `skill_paths` are copied here first\n- `skills/default/`: where the agent actually reads skills (`list_skills()` without an agent id uses it); its index file is called `.index`\n\nVerified: a skill copied by hand must go into `skills/default/` to be found. Put into the top level of `skills/`, it is moved into `.seed` at the next initialisation, and the already existing `default` area does **not** receive it. Likewise `skill_paths` only works when the workspace is first created – added to an existing workspace, the skill list stays empty. Then delete `data/l20_workspace` and start again, or call `await workspace.add_skill(skill_folder)`."
    },
    {
      "t": "check",
      "q": {
        "zh": "`data/l20_workspace` 已经存在（之前运行过），这次才在 `LocalWorkspace(...)` 里加上 `skill_paths=[...]`。结果会怎样？",
        "en": "`data/l20_workspace` already exists from an earlier run, and only now is `skill_paths=[...]` added to `LocalWorkspace(...)`. What happens?"
      },
      "options": [
        {
          "zh": "技能被正常加载",
          "en": "The skill loads normally"
        },
        {
          "zh": "程序报错退出",
          "en": "The program crashes with an error"
        },
        {
          "zh": "技能列表是空的：`skill_paths` 只在第一次创建工作空间时生效",
          "en": "The skill list is empty: `skill_paths` only works when the workspace is first created"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "2.0.9 只在智能体的技能分区第一次出现时，从 `.seed` 模板复制技能。解决办法：删掉工作空间文件夹重来，或用 `await workspace.add_skill(路径)`，或把技能文件夹复制进 `skills/default/`。",
        "en": "2.0.9 copies skills from the `.seed` template only when an agent's skill area first appears. Fix it by deleting the workspace folder, calling `await workspace.add_skill(path)`, or copying the skill folder into `skills/default/`."
      }
    },
    {
      "t": "h",
      "zh": "六、演示：问 MCP、做加法、用写小说的 Skill",
      "en": "6. Demo: ask about MCP, add numbers, use a novel-writing Skill"
    },
    {
      "t": "video",
      "zh": "[▶ 09:24](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=564) 老师启动智能体，先问它有哪些 MCP 服务，它认出了加法工具；再让它做一道加法，它算出了结果。\n\n[▶ 10:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=604) 打开工作空间：多了一个 `skills` 文件夹，里面是空的，只有一个 `.skills` 文件。他把准备好的「写小说」技能复制进去——这个技能会像做工程一样，一步步地写小说。重启智能体后，[▶ 10:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=641) 问它有哪些 skill，它认出了这个技能；接着让它写一篇不超过 1 万字的小说，题材是「深海迷航」加恐怖。\n\n[▶ 11:24](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=684) 跳过生成过程直接看结果：工作空间里多了好几个文件——第一个是舞台设定和背景，第二个是人物设定，第三个是时间线和章节规划，其余是正文。智能体确实按要求做了「工程化」写作。",
      "en": "[▶ 09:24](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=564) The instructor starts the agent and asks which MCP services it has; it recognises the add tool. Asked to add two numbers, it computes the result.\n\n[▶ 10:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=604) In the workspace a `skills` folder has appeared, empty except for a `.skills` file. He copies in a prepared novel-writing skill, which writes a novel step by step like an engineering project. After restarting the agent [▶ 10:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=641) he asks which skills it has – it recognises the new one – and then asks for a novel of at most 10,000 characters: horror about being lost in the deep sea.\n\n[▶ 11:24](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=21&t=684) Skipping the generation, the result: the workspace now holds several files – first the setting and background, second the characters, third the timeline and chapter plan, and the rest is the story itself. The agent really did write it as a structured project."
    },
    {
      "t": "p",
      "zh": "视频没有展示那个技能的内容，所以 `practice/data/l20_skills/story-writer/SKILL.md` 是我们照着同样思路写的简化版：建项目文件夹 → 写设定 → 写人物 → 写大纲 → 一章一个文件。\n\n技能文件（视频里没有展开讲）的结构是这样的：开头两行 `---` 之间是 **front matter**，必须有 `name`（技能名）和 `description`（什么时候用它）；后面是普通的 Markdown 正文。技能是**按需加载**的：系统提示词里只放每个技能的名字、简介和位置，智能体判断用得上时，才调用内置的 `Skill` 工具读正文，再照着做。所以下面的运行结果里，写小说时第一个工具调用是 `Skill`。",
      "en": "The video does not show that skill's content, so `practice/data/l20_skills/story-writer/SKILL.md` is our simplified version of the same idea: create a project folder → setting → characters → outline → one file per chapter.\n\nHere is how a skill file is built (the video does not go into it): between the two `---` lines at the top is the **front matter**, which must have `name` (the skill's name) and `description` (when to use it); plain Markdown follows. Skills are **loaded on demand**: the system prompt only lists each skill's name, description and location, and only when the agent decides a skill applies does it call the built-in `Skill` tool to read the body and follow it. That is why, in the run below, the first tool call for the story is `Skill`."
    },
    {
      "t": "code",
      "file": "data/l20_skills/story-writer/SKILL.md",
      "code": {
        "zh": "---\nname: story-writer\ndescription: Plan and write a short story step by step, saving every planning document and chapter as a separate file. Use it whenever the user asks for a story or novel.\n---\n\n# Story writer / 分步写小说\n\nWrite the story like a small project: plan first, then write, and keep everything in files.\n\n## Steps\n\n1. Create one project folder for this story inside the workspace.\n2. Write `01_setting.md`: the world, place and time, the overall mood, and the central conflict.\n3. Write `02_characters.md`: 2-4 characters, each with a name, goal, fear and one memorable detail.\n4. Write `03_outline.md`: a timeline of events and a plan for each chapter (one or two lines per chapter).\n5. Write each chapter into its own file: `chapter_01.md`, `chapter_02.md`, ...\n   Follow the outline; keep names and facts consistent with the planning files.\n6. Finish with a short reply listing the files you created and a two-sentence summary of the story.\n\n## Rules\n\n- Respect the length the user asks for. If no length is given, write 2 chapters of about 400 Chinese characters (or 250 English words) each.\n- Write in the user's language.\n- Do not paste the full story into the chat; it lives in the files.",
        "en": "---\nname: story-writer\ndescription: Plan and write a short story step by step, saving every planning document and chapter as a separate file. Use it whenever the user asks for a story or novel.\n---\n\n# Story writer\n\nWrite the story like a small project: plan first, then write, and keep everything in files.\n\n## Steps\n\n1. Create one project folder for this story inside the workspace.\n2. Write `01_setting.md`: the world, place and time, the overall mood, and the central conflict.\n3. Write `02_characters.md`: 2-4 characters, each with a name, goal, fear and one memorable detail.\n4. Write `03_outline.md`: a timeline of events and a plan for each chapter (one or two lines per chapter).\n5. Write each chapter into its own file: `chapter_01.md`, `chapter_02.md`, ...\n   Follow the outline; keep names and facts consistent with the planning files.\n6. Finish with a short reply listing the files you created and a two-sentence summary of the story.\n\n## Rules\n\n- Respect the length the user asks for. If no length is given, write 2 chapters of about 400 Chinese characters (or 250 English words) each.\n- Write in the user's language.\n- Do not paste the full story into the chat; it lives in the files."
      },
      "lang": "markdown"
    },
    {
      "t": "code",
      "file": {
        "zh": "输出（用 DeepSeek 实际运行）",
        "en": "Output (a real run with DeepSeek, translated)"
      },
      "code": {
        "zh": "MCP: ['local_mcp'] | skills: ['story-writer']\n\n你 / You: 你有哪些 MCP 工具和 skill？一句话回答\nFriday: 我有一个 MCP 工具（add，两数相加）和一个名为 story-writer 的 skill（分步规划并撰写短篇故事）。\n\n你 / You: 用 MCP 工具算 1.1 + 2.2\nFriday:\n  [调用工具 / tool] mcp__local_mcp__add\n1.1 + 2.2 = 3.3\n\n你 / You: 写一篇 300 字左右的深海惊悚小故事，分 2 章\nFriday:\n  [调用工具 / tool] Skill\n  [调用工具 / tool] Write\n  [调用工具 / tool] Write\n  …… （一共 6 次 Write）\n故事已写好，全部存为文件（未粘贴到聊天中）：\n项目目录 `20261002_deep-sea-horror/`\n- `README.md` — 项目说明与关键决策\n- `01_setting.md` — 设定\n- `02_characters.md` — 人物\n- `03_outline.md` — 大纲\n- `chapter_01.md` — 第一章《三下》\n- `chapter_02.md` — 第二章《回应》",
        "en": "MCP: ['local_mcp'] | skills: ['story-writer']\n\n你 / You: What MCP tools and skills do you have? Answer in one sentence.\nFriday: I have one MCP tool (add, which adds two numbers) and one skill called story-writer (plans and writes a short story step by step).\n\n你 / You: Use the MCP tool to work out 1.1 + 2.2\nFriday:\n  [调用工具 / tool] mcp__local_mcp__add\n1.1 + 2.2 = 3.3\n\n你 / You: Write a short deep-sea thriller of about 300 characters, in 2 chapters\nFriday:\n  [调用工具 / tool] Skill\n  [调用工具 / tool] Write\n  [调用工具 / tool] Write\n  ... (6 Write calls in total)\nThe story is done and saved entirely as files (not pasted into the chat):\nProject folder `20261002_deep-sea-horror/`\n- `README.md` — project notes and key decisions\n- `01_setting.md` — setting\n- `02_characters.md` — characters\n- `03_outline.md` — outline\n- `chapter_01.md` — Chapter 1, \"Three Knocks\"\n- `chapter_02.md` — Chapter 2, \"The Reply\""
      },
      "lang": "text",
      "note": {
        "zh": "智能体先用 `Skill` 读了说明书，再按步骤用 `Write` 写了 6 个文件（工作空间的说明还要求每个项目带一个 README.md）。文件都在 `practice/data/l20_workspace/20261002_deep-sea-horror/` 里，文件夹名里的日期是运行当天。",
        "en": "The agent first read the manual with `Skill`, then followed its steps and wrote 6 files with `Write` (the workspace instructions also ask for a README.md in every project). They are in `practice/data/l20_workspace/20261002_deep-sea-horror/`; the date in the folder name is the day of the run."
      }
    },
    {
      "t": "tip",
      "zh": "什么写成 Skill，什么写进系统提示词？只在**某类任务**里才需要的长说明（写作流程、报告模板、团队规范）适合做成 Skill；每次对话都要遵守的短规则（语气、语言、身份）直接写进系统提示词。",
      "en": "What becomes a Skill and what goes into the system prompt? Long instructions needed only for **certain tasks** (a writing process, report templates, team conventions) make good Skills; short rules for every turn (tone, language, persona) belong in the system prompt."
    },
    {
      "t": "note",
      "zh": "补充 / Extra（视频没讲）：不用工作空间也能接 MCP 和技能——自己 `connect()` / `close()` 客户端，用 `LocalSkillLoader` 加载技能文件夹。注意顺序：有状态的客户端必须**先连接再建 `Toolkit`**，否则会报 `ValueError: The MCP client ... is stateful, but not connected`。",
      "en": "Extra (not in the video): MCP and skills also work without a workspace – `connect()` / `close()` the client yourself and load skill folders with `LocalSkillLoader`. Mind the order: a stateful client must be **connected before the `Toolkit` is built**, otherwise you get `ValueError: The MCP client ... is stateful, but not connected`."
    },
    {
      "t": "code",
      "file": "no_workspace.py",
      "code": {
        "zh": "# 补充：不用工作空间，自己连接 MCP、自己加载技能\nfrom agentscope.skill import LocalSkillLoader\n\n\nasync def main():\n    client = MCPClient(name=\"local_mcp\", is_stateful=True, mcp_config=local_config)\n    await client.connect()                 # 有状态的客户端要先连接，否则 Toolkit 报 ValueError\n    try:\n        toolkit = Toolkit(\n            mcps=[client],\n            skills_or_loaders=[LocalSkillLoader(\"data/l20_skills\", scan_subdir=True)],   # 扫描每个子文件夹\n        )\n        ...                                # 创建模型、智能体，和上面一样\n    finally:\n        await client.close()",
        "en": "# Extra: no workspace - connect MCP and load skills yourself\nfrom agentscope.skill import LocalSkillLoader\n\n\nasync def main():\n    client = MCPClient(name=\"local_mcp\", is_stateful=True, mcp_config=local_config)\n    await client.connect()                 # connect a stateful client first, or Toolkit raises ValueError\n    try:\n        toolkit = Toolkit(\n            mcps=[client],\n            skills_or_loaders=[LocalSkillLoader(\"data/l20_skills\", scan_subdir=True)],   # search every sub-folder\n        )\n        ...                                # model and agent as above\n    finally:\n        await client.close()"
      }
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "用 `FastMCP` 创建远程服务和本地服务，区别是？",
        "en": "What differs when creating a remote vs a local server with `FastMCP`?"
      },
      "options": [
        {
          "zh": "远程版要多给网址和端口，并用 `transport=\"streamable-http\"` 运行；本地版只给名字，用 `\"stdio\"`",
          "en": "The remote one also gets a host and port and runs with `transport=\"streamable-http\"`; the local one gets only a name and uses `\"stdio\"`"
        },
        {
          "zh": "本地版要给端口，远程版不用",
          "en": "The local one needs a port, the remote one does not"
        },
        {
          "zh": "两者完全一样，只是文件名不同",
          "en": "They are identical; only the file names differ"
        },
        {
          "zh": "远程版不能定义资源模板",
          "en": "A remote server cannot define resource templates"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "远程服务要在网络上监听，所以要网址和端口；本地 stdio 服务由客户端当作子进程启动，通过标准输入输出通信，只需要名字。",
        "en": "A remote server listens on the network, so it needs a host and port; a local stdio server is started by the client as a subprocess and talks over stdin/stdout, so a name is enough."
      }
    },
    {
      "q": {
        "zh": "哪种连接方式**不需要**你提前启动服务端？",
        "en": "Which transport does **not** require starting the server beforehand?"
      },
      "options": [
        {
          "zh": "`streamable-http`",
          "en": "`streamable-http`"
        },
        {
          "zh": "`sse`",
          "en": "`sse`"
        },
        {
          "zh": "`stdio`",
          "en": "`stdio`"
        },
        {
          "zh": "三种都需要",
          "en": "All three do"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "stdio 方式下，客户端（`stdio_client` 或 AgentScope 的 `StdioMCPConfig`）会自己把服务端脚本作为子进程启动；两种远程方式都要服务端先跑起来。",
        "en": "With stdio the client (`stdio_client` or AgentScope's `StdioMCPConfig`) starts the server script itself as a subprocess; both remote transports need the server running first."
      }
    },
    {
      "q": {
        "zh": "资源模板 `greeting://{name}` 的函数里，为什么要 `unquote(name)`？",
        "en": "Why does the `greeting://{name}` template function call `unquote(name)`?"
      },
      "options": [
        {
          "zh": "为了把名字变成大写",
          "en": "To turn the name into upper case"
        },
        {
          "zh": "因为中文在地址里会被编码成 `%E5%B0%8F…`，要先解码回中文",
          "en": "Because Chinese in an address arrives encoded as `%E5%B0%8F…` and must be decoded"
        },
        {
          "zh": "因为 MCP 规定资源函数必须调用它",
          "en": "Because MCP requires every resource function to call it"
        },
        {
          "zh": "为了防止加法出现小数误差",
          "en": "To avoid decimal errors in the addition"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "网址里不能直接放中文，所以 `小花` 传到服务端时是 URL 编码后的样子，`unquote` 把它还原。",
        "en": "Chinese cannot appear in an address as-is, so `小花` reaches the server URL-encoded; `unquote` restores it."
      }
    },
    {
      "q": {
        "zh": "下面哪个 `MCPClient` 的 `name` 是合法的？",
        "en": "Which `MCPClient` `name` is valid?"
      },
      "options": [
        {
          "zh": "`my server`",
          "en": "`my server`"
        },
        {
          "zh": "`count.down`",
          "en": "`count.down`"
        },
        {
          "zh": "`倒计时`",
          "en": "`倒计时`"
        },
        {
          "zh": "`local-mcp_2`",
          "en": "`local-mcp_2`"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "名字会拼进工具名 `mcp__名字__工具`，只允许字母、数字、`_` 和 `-`；空格、点号、中文在创建时就报 `ValidationError`。另外同一个列表里的名字不能重复。",
        "en": "The name becomes part of `mcp__name__tool`, so only letters, digits, `_` and `-` are allowed; spaces, dots or Chinese raise `ValidationError` at creation. Names in one list must also be unique."
      }
    },
    {
      "q": {
        "zh": "智能体想调用一个 MCP 工具，却停下来回复「等待许可」。最可能的原因是？",
        "en": "The agent wants an MCP tool but stops, saying it is waiting for permission. Most likely cause?"
      },
      "options": [
        {
          "zh": "这个工具没有 `readOnlyHint=True` 标记，2.0.9 默认要用户批准",
          "en": "The tool lacks `readOnlyHint=True`, so 2.0.9 asks the user by default"
        },
        {
          "zh": "MCP 服务没有启动",
          "en": "The MCP server is not running"
        },
        {
          "zh": "`is_stateful` 写成了 `True`",
          "en": "`is_stateful` was set to `True`"
        },
        {
          "zh": "技能文件夹放错了地方",
          "en": "The skill folder is in the wrong place"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "只读标记的 MCP 工具自动放行；其余的权限结果是「询问」。只读的工具在服务端加标记，会改东西的工具用 18 节的允许规则放行。",
        "en": "Read-only MCP tools are allowed automatically; the rest get an “ask” decision. Mark genuinely read-only tools on the server, and allow tools that change things with a lesson-18 allow rule."
      }
    },
    {
      "q": {
        "zh": "关于 Skill，下面哪种说法**不对**？",
        "en": "Which statement about Skills is **wrong**?"
      },
      "options": [
        {
          "zh": "`SKILL.md` 的 front matter 必须有 `name` 和 `description`",
          "en": "The `SKILL.md` front matter must have `name` and `description`"
        },
        {
          "zh": "智能体用内置的 `Skill` 工具读取技能正文",
          "en": "The agent reads a skill's body with the built-in `Skill` tool"
        },
        {
          "zh": "技能文件夹里可以附带模板和脚本",
          "en": "A skill folder may include templates and scripts"
        },
        {
          "zh": "技能像 MCP 工具一样，可以被模型直接当函数调用",
          "en": "Like an MCP tool, a skill can be called directly by the model as a function"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "技能不是工具，是说明书：先用 `Skill` 工具读，再按说明去调用其他工具（比如 `Write`、MCP 工具）。",
        "en": "A skill is not a tool but a manual: the agent reads it with the `Skill` tool, then calls other tools (such as `Write` or MCP tools) as it says."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "远程 MCP 服务端",
        "en": "A remote MCP server"
      },
      "code": {
        "zh": "from mcp.server.fastmcp import [[FastMCP]]\n\nmcp = FastMCP(\"remote_mcp\", host=\"127.0.0.1\", port=[[8000]])\n\n\n@mcp.[[tool]]()\ndef add(a: float, b: float) -> float:\n    return a + b\n\n\n@mcp.[[resource]](\"greeting://{name}\")\ndef get_greeting(name: str) -> str:\n    return f\"你好，{unquote(name)}！\"\n\n\nif __name__ == \"__main__\":\n    mcp.[[run]](transport=\"[[streamable-http]]\")",
        "en": "from mcp.server.fastmcp import [[FastMCP]]\n\nmcp = FastMCP(\"remote_mcp\", host=\"127.0.0.1\", port=[[8000]])\n\n\n@mcp.[[tool]]()\ndef add(a: float, b: float) -> float:\n    return a + b\n\n\n@mcp.[[resource]](\"greeting://{name}\")\ndef get_greeting(name: str) -> str:\n    return f\"你好，{unquote(name)}！\"\n\n\nif __name__ == \"__main__\":\n    mcp.[[run]](transport=\"[[streamable-http]]\")"
      },
      "explain": {
        "zh": "实例方法 `tool()` 和 `resource()` 当装饰器用；远程方式的 transport 是 `streamable-http`（中间是连字符）。",
        "en": "The instance's `tool()` and `resource()` methods are used as decorators; the remote transport is `streamable-http` (with a hyphen)."
      }
    },
    {
      "title": {
        "zh": "AgentScope：MCP + 工作空间 + 工具箱",
        "en": "AgentScope: MCP + workspace + toolkit"
      },
      "code": "async def main():\n    local_config = [[StdioMCPConfig]](command=sys.executable, args=[str(HERE / \"l20_local_mcp_server.py\")])\n    mcp_clients = [MCPClient(name=\"local_mcp\", is_stateful=[[True]], mcp_config=local_config)]\n\n    workspace = [[LocalWorkspace]](workdir=str(WORKDIR), [[default_mcps]]=mcp_clients, skill_paths=[str(SKILL_DIR)])\n    await workspace.[[initialize]]()\n    try:\n        toolkit = Toolkit(\n            tools=await workspace.list_tools(),\n            mcps=await workspace.[[list_mcps]](),\n            [[skills_or_loaders]]=await workspace.list_skills(),\n        )\n    finally:\n        await workspace.[[close]]()",
      "explain": {
        "zh": "MCP 客户端列表交给工作空间的 `default_mcps`；初始化后从工作空间取出 tools、mcps、skills 放进 `Toolkit`；最后在 `finally` 里关闭。",
        "en": "The MCP client list goes into the workspace's `default_mcps`; after initialising, take tools, mcps and skills from the workspace into the `Toolkit`; close it in `finally`."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：通过工作空间使用 MCP 和 Skill",
        "en": "Write it: MCP and Skills through a workspace"
      },
      "task": {
        "zh": "在给好的 import 下面写 `async def main()`：\n1. 用 `StdioMCPConfig` 配置本地服务 `l20_local_mcp_server.py`，再建一个只有一个 `MCPClient`（`name=\"local_mcp\"`，`is_stateful=True`）的列表\n2. 创建 `LocalWorkspace`（`workdir`、`default_mcps`、`skill_paths`），然后 `await` 初始化\n3. 在 `try` 里：`Toolkit` 放入工作空间的 tools、mcps、skills；创建 DeepSeek 模型和 `Agent`（`offloader=workspace`）；问一句「你有哪些 MCP 工具和 skill？」并打印回答\n4. 在 `finally` 里关闭工作空间\n5. 用 `asyncio.run(main())` 运行\n\n写完复制到 `practice` 文件夹里运行（浏览器里不能运行 AgentScope）。",
        "en": "Below the given imports, write `async def main()`:\n1. configure the local server `l20_local_mcp_server.py` with `StdioMCPConfig`, then build a list holding one `MCPClient` (`name=\"local_mcp\"`, `is_stateful=True`)\n2. create a `LocalWorkspace` (`workdir`, `default_mcps`, `skill_paths`) and `await` its initialisation\n3. inside `try`: a `Toolkit` with the workspace's tools, mcps and skills; a DeepSeek model and an `Agent` (`offloader=workspace`); ask “What MCP tools and skills do you have?” and print the answer\n4. close the workspace in `finally`\n5. run it with `asyncio.run(main())`\n\nThen copy it into the `practice` folder and run it there (AgentScope cannot run in the browser)."
      },
      "starter": {
        "zh": "import asyncio\nimport sys\nfrom pathlib import Path\n\nfrom agentscope.agent import Agent\nfrom agentscope.credential import DeepSeekCredential\nfrom agentscope.mcp import MCPClient, StdioMCPConfig\nfrom agentscope.message import UserMsg\nfrom agentscope.model import DeepSeekChatModel\nfrom agentscope.tool import Toolkit\nfrom agentscope.workspace import LocalWorkspace\n\nfrom llm import API_KEY, MODEL\n\nHERE = Path(__file__).parent\nWORKDIR = HERE / \"data\" / \"l20_workspace\"\nSKILL_DIR = HERE / \"data\" / \"l20_skills\" / \"story-writer\"\n\n# 写 main()：\n# 1. MCP 配置（本地 stdio）+ MCP 客户端列表\n# 2. 工作空间：交给它 MCP 列表和技能文件夹，然后初始化\n# 3. try：工具箱（工作空间的 tools + mcps + skills）→ 模型 → 智能体 → 提问并打印\n# 4. finally：关闭工作空间\n# 最后运行 main()",
        "en": "import asyncio\nimport sys\nfrom pathlib import Path\n\nfrom agentscope.agent import Agent\nfrom agentscope.credential import DeepSeekCredential\nfrom agentscope.mcp import MCPClient, StdioMCPConfig\nfrom agentscope.message import UserMsg\nfrom agentscope.model import DeepSeekChatModel\nfrom agentscope.tool import Toolkit\nfrom agentscope.workspace import LocalWorkspace\n\nfrom llm import API_KEY, MODEL\n\nHERE = Path(__file__).parent\nWORKDIR = HERE / \"data\" / \"l20_workspace\"\nSKILL_DIR = HERE / \"data\" / \"l20_skills\" / \"story-writer\"\n\n# Write main():\n# 1. MCP config (local stdio) + the MCP client list\n# 2. a workspace with the MCP list and the skill folder, then initialize it\n# 3. try: toolkit (workspace tools + mcps + skills) -> model -> agent -> ask and print\n# 4. finally: close the workspace\n# then run main()"
      },
      "solution": {
        "zh": "import asyncio\nimport sys\nfrom pathlib import Path\n\nfrom agentscope.agent import Agent\nfrom agentscope.credential import DeepSeekCredential\nfrom agentscope.mcp import MCPClient, StdioMCPConfig\nfrom agentscope.message import UserMsg\nfrom agentscope.model import DeepSeekChatModel\nfrom agentscope.tool import Toolkit\nfrom agentscope.workspace import LocalWorkspace\n\nfrom llm import API_KEY, MODEL\n\nHERE = Path(__file__).parent\nWORKDIR = HERE / \"data\" / \"l20_workspace\"\nSKILL_DIR = HERE / \"data\" / \"l20_skills\" / \"story-writer\"\n\n\nasync def main():\n    # 1. MCP 配置 + MCP 客户端列表\n    local_config = StdioMCPConfig(command=sys.executable, args=[str(HERE / \"l20_local_mcp_server.py\")])\n    mcp_clients = [MCPClient(name=\"local_mcp\", is_stateful=True, mcp_config=local_config)]\n\n    # 2. 工作空间\n    workspace = LocalWorkspace(workdir=str(WORKDIR), default_mcps=mcp_clients, skill_paths=[str(SKILL_DIR)])\n    await workspace.initialize()\n    try:\n        # 3. 工具箱 → 模型 → 智能体 → 提问\n        toolkit = Toolkit(\n            tools=await workspace.list_tools(),\n            mcps=await workspace.list_mcps(),\n            skills_or_loaders=await workspace.list_skills(),\n        )\n        model = DeepSeekChatModel(credential=DeepSeekCredential(api_key=API_KEY), model=MODEL, stream=False)\n        agent = Agent(name=\"Friday\", system_prompt=\"你是一个简洁的中文助手。\", model=model,\n                      toolkit=toolkit, offloader=workspace)\n        reply = await agent.reply(UserMsg(name=\"user\", content=\"你有哪些 MCP 工具和 skill？\"))\n        print(reply.get_text_content())\n    finally:\n        # 4. 关闭工作空间\n        await workspace.close()\n\n\nasyncio.run(main())",
        "en": "import asyncio\nimport sys\nfrom pathlib import Path\n\nfrom agentscope.agent import Agent\nfrom agentscope.credential import DeepSeekCredential\nfrom agentscope.mcp import MCPClient, StdioMCPConfig\nfrom agentscope.message import UserMsg\nfrom agentscope.model import DeepSeekChatModel\nfrom agentscope.tool import Toolkit\nfrom agentscope.workspace import LocalWorkspace\n\nfrom llm import API_KEY, MODEL\n\nHERE = Path(__file__).parent\nWORKDIR = HERE / \"data\" / \"l20_workspace\"\nSKILL_DIR = HERE / \"data\" / \"l20_skills\" / \"story-writer\"\n\n\nasync def main():\n    # 1. MCP config + the MCP client list\n    local_config = StdioMCPConfig(command=sys.executable, args=[str(HERE / \"l20_local_mcp_server.py\")])\n    mcp_clients = [MCPClient(name=\"local_mcp\", is_stateful=True, mcp_config=local_config)]\n\n    # 2. the workspace\n    workspace = LocalWorkspace(workdir=str(WORKDIR), default_mcps=mcp_clients, skill_paths=[str(SKILL_DIR)])\n    await workspace.initialize()\n    try:\n        # 3. toolkit -> model -> agent -> ask\n        toolkit = Toolkit(\n            tools=await workspace.list_tools(),\n            mcps=await workspace.list_mcps(),\n            skills_or_loaders=await workspace.list_skills(),\n        )\n        model = DeepSeekChatModel(credential=DeepSeekCredential(api_key=API_KEY), model=MODEL, stream=False)\n        agent = Agent(name=\"Friday\", system_prompt=\"You are a concise assistant.\", model=model,\n                      toolkit=toolkit, offloader=workspace)\n        reply = await agent.reply(UserMsg(name=\"user\", content=\"What MCP tools and skills do you have?\"))\n        print(reply.get_text_content())\n    finally:\n        # 4. close the workspace\n        await workspace.close()\n\n\nasyncio.run(main())"
      },
      "checks": [
        {
          "zh": "用 `StdioMCPConfig(...)` 配置本地服务",
          "en": "Configures the local server with `StdioMCPConfig(...)`",
          "re": "StdioMCPConfig\\("
        },
        {
          "zh": "创建了 `MCPClient(...)`，并且 `is_stateful=True`",
          "en": "Creates an `MCPClient(...)` with `is_stateful=True`",
          "re": "MCPClient\\([\\s\\S]*?is_stateful\\s*=\\s*True"
        },
        {
          "zh": "创建了 `LocalWorkspace(...)`",
          "en": "Creates a `LocalWorkspace(...)`",
          "re": "LocalWorkspace\\("
        },
        {
          "zh": "MCP 列表交给 `default_mcps=`",
          "en": "Passes the MCP list as `default_mcps=`",
          "re": "default_mcps\\s*="
        },
        {
          "zh": "用 `skill_paths=` 指定技能文件夹",
          "en": "Gives the skill folder with `skill_paths=`",
          "re": "skill_paths\\s*="
        },
        {
          "zh": "`await ....initialize()`",
          "en": "`await ....initialize()`",
          "re": "await\\s+\\w+\\.initialize\\(\\)"
        },
        {
          "zh": "从工作空间取 MCP：`list_mcps()`",
          "en": "Gets MCP servers from the workspace: `list_mcps()`",
          "re": "\\.list_mcps\\(\\)"
        },
        {
          "zh": "从工作空间取技能：`list_skills()`",
          "en": "Gets the skills from the workspace: `list_skills()`",
          "re": "\\.list_skills\\(\\)"
        },
        {
          "zh": "技能交给 `Toolkit` 的 `skills_or_loaders=`",
          "en": "Passes the skills to the `Toolkit` via `skills_or_loaders=`",
          "re": "skills_or_loaders\\s*="
        },
        {
          "zh": "在 `finally` 里 `await ....close()`",
          "en": "`await ....close()` inside `finally`",
          "re": "finally\\s*:[\\s\\S]*?await\\s+\\w+\\.close\\(\\)"
        },
        {
          "zh": "用 `asyncio.run(main())` 运行",
          "en": "Runs it with `asyncio.run(main())`",
          "re": "asyncio\\.run\\(\\s*main\\(\\)\\s*\\)"
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "`transport` 写成 `\"streamable_http\"`（下划线）或 `\"http\"`：`mcp.run` 直接报 `ValueError: Unknown transport`。远程方式是 `\"streamable-http\"`。",
      "en": "Writing `transport` as `\"streamable_http\"` (underscore) or `\"http\"`: `mcp.run` raises `ValueError: Unknown transport`. The remote transport is `\"streamable-http\"`."
    },
    {
      "zh": "还没启动远程服务端就运行 `l20_mcp_client_test.py remote`，连接失败。远程服务要在另一个终端里先跑起来并保持运行。",
      "en": "Running `l20_mcp_client_test.py remote` before the remote server is up – the connection fails. Start the server in another terminal first and keep it running."
    },
    {
      "zh": "资源模板函数忘了 `unquote`，中文名字打印出来是 `%E5%B0%8F%E8%8A%B1`。",
      "en": "Forgetting `unquote` in the template function – the Chinese name prints as `%E5%B0%8F%E8%8A%B1`."
    },
    {
      "zh": "两个 `MCPClient` 用了同一个 `name`：工具互相覆盖，关闭时还可能报错；名字里有空格、点号或中文会直接报 `ValidationError`。",
      "en": "Two `MCPClient`s with the same `name`: their tools overwrite each other and closing may fail; spaces, dots or Chinese in a name raise `ValidationError`."
    },
    {
      "zh": "MCP 工具没有 `readOnlyHint`，智能体停在「等待许可」，以为程序卡住了。",
      "en": "An MCP tool without `readOnlyHint` makes the agent wait for permission, which looks like a hang."
    },
    {
      "zh": "照视频把技能复制进工作空间的 `skills/` 最外层：2.0.9 会把它挪进 `skills/.seed/`，智能体看不到。要放进 `skills/default/`，或用 `add_skill`。",
      "en": "Copying a skill into the top level of the workspace's `skills/` as in the video: 2.0.9 moves it into `skills/.seed/` and the agent never sees it. Put it in `skills/default/`, or use `add_skill`."
    },
    {
      "zh": "工作空间已经存在时才加 `skill_paths`，技能列表是空的。删掉工作空间文件夹重来，或 `await workspace.add_skill(路径)`。",
      "en": "Adding `skill_paths` after the workspace already exists – the skill list is empty. Delete the workspace folder or call `await workspace.add_skill(path)`."
    }
  ],
  "recap": [
    {
      "zh": "MCP = 要去连接的服务，提供能执行的工具；Skill = 挂在智能体上的说明书文件夹，按需读取。",
      "en": "MCP = a service to connect to, offering runnable tools; Skill = a folder of instructions mounted on the agent and read on demand."
    },
    {
      "zh": "`FastMCP(名字, host=..., port=...)` + `@mcp.tool()` / `@mcp.resource(\"greeting://{name}\")` + `mcp.run(transport=...)`：远程用 `streamable-http`，本地用 `stdio`。",
      "en": "`FastMCP(name, host=..., port=...)` + `@mcp.tool()` / `@mcp.resource(\"greeting://{name}\")` + `mcp.run(transport=...)`: `streamable-http` for remote, `stdio` for local."
    },
    {
      "zh": "客户端：拿到读写通道 → `ClientSession` → `initialize()` → `call_tool` / `read_resource`；stdio 客户端会顺便启动服务端。",
      "en": "Client: get the read/write streams → `ClientSession` → `initialize()` → `call_tool` / `read_resource`; a stdio client also starts the server."
    },
    {
      "zh": "AgentScope：`StdioMCPConfig` / `HttpMCPConfig` → `MCPClient(name, is_stateful=True, mcp_config)`，名字唯一；工具名变成 `mcp__名字__工具`。",
      "en": "AgentScope: `StdioMCPConfig` / `HttpMCPConfig` → `MCPClient(name, is_stateful=True, mcp_config)` with unique names; tools become `mcp__name__tool`."
    },
    {
      "zh": "`LocalWorkspace(default_mcps=..., skill_paths=...)` → `initialize()` → `Toolkit(tools=list_tools(), mcps=list_mcps(), skills_or_loaders=list_skills())` → 用完 `close()`。",
      "en": "`LocalWorkspace(default_mcps=..., skill_paths=...)` → `initialize()` → `Toolkit(tools=list_tools(), mcps=list_mcps(), skills_or_loaders=list_skills())` → `close()` when done."
    },
    {
      "zh": "2.0.9 的技能放在 `skills/default/`；`skill_paths` 只对新工作空间生效；只读的 MCP 工具才自动放行。",
      "en": "In 2.0.9 skills live in `skills/default/`; `skill_paths` only affects a new workspace; only read-only MCP tools are allowed automatically."
    }
  ],
  "files": [
    {
      "path": "practice/l20_remote_mcp_server.py",
      "zh": "远程 MCP 服务端（streamable-http，端口 8000）：加法工具 + 问候模板。要先在一个终端里运行。",
      "en": "The remote MCP server (streamable-http, port 8000): add tool + greeting template. Start it in a terminal first."
    },
    {
      "path": "practice/l20_local_mcp_server.py",
      "zh": "本地 MCP 服务端（stdio）：同样的工具和模板，由客户端自动启动。",
      "en": "The local MCP server (stdio): the same tool and template, started automatically by clients."
    },
    {
      "path": "practice/l20_mcp_client_test.py",
      "zh": "用 mcp 库测试两个服务：参数 `local` 或 `remote`，不需要任何 key。",
      "en": "Tests both servers with the mcp library: argument `local` or `remote`; no key needed."
    },
    {
      "path": "practice/data/l20_skills/story-writer/SKILL.md",
      "zh": "示例技能「分步写小说」，可以照着它写自己的技能。",
      "en": "The example “story writer” skill – a template for your own skills."
    },
    {
      "path": "practice/l20_mcp_skill_todo.py",
      "zh": "练习：MCP 配置 + 工作空间 + 工具箱（有 TODO 提示）。",
      "en": "Exercise: MCP config + workspace + toolkit (with TODO hints)."
    },
    {
      "path": "practice/l20_mcp_skill_solution.py",
      "zh": "参考答案：可以聊天的智能体，会用 MCP 做加法、按技能写小说（已用 DeepSeek 实际运行）。",
      "en": "Solution: a chat agent that adds through MCP and writes a novel with the skill (tested with DeepSeek)."
    }
  ]
});
