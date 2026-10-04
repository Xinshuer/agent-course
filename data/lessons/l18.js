COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l18",
  "priority": "important",
  "handwrite": true,
  "studyMinutes": 60,
  "source": "subtitle",
  "summary": {
    "zh": "这一集继续 AgentScope 2.0，讲两件事。**工作空间**：给 Agent 划一块专门干活的地方，视频用 `LocalWorkspace`（创建 → `initialize()` → `list_tools()` → 交给 `offloader`）。**权限管理**：工作空间本身拦不住 Agent，所以 AgentScope 安排了三层把关——全局模式（5 种）、精细化规则（允许 / 拒绝 / 询问）、工具自己的 `check_permissions`。最后把它们装进一个程序：收到「请确认」事件就问用户。",
    "en": "This episode continues with AgentScope 2.0 and covers two things. **Workspaces**: a dedicated place for the agent to work; the video uses `LocalWorkspace` (create → `initialize()` → `list_tools()` → hand it over as `offloader`). **Permission management**: a workspace cannot stop the agent by itself, so AgentScope adds three layers of control – a global mode (five of them), fine-grained rules (allow / deny / ask), and the tool's own `check_permissions`. Finally everything goes into one program that asks the user whenever a “please confirm” event arrives."
  },
  "goals": [
    {
      "zh": "说出工作空间的四个好处，知道 `LocalWorkspace` 只是本机文件夹、`DockerWorkspace` / `E2BWorkspace` 才是沙箱",
      "en": "Name the four benefits of a workspace, and know that `LocalWorkspace` is just a local folder while `DockerWorkspace` / `E2BWorkspace` are sandboxes"
    },
    {
      "zh": "用 `LocalWorkspace` + `await initialize()` + `await list_tools()` 给 Agent 配工作空间，并把自己的工具合进同一个 `Toolkit`",
      "en": "Set up a workspace with `LocalWorkspace` + `await initialize()` + `await list_tools()`, and merge your own tools into the same `Toolkit`"
    },
    {
      "zh": "说出权限的三层（全局模式、精细化规则、工具自己的检查）和 5 种模式各适合什么场景",
      "en": "Describe the three permission layers (global mode, fine-grained rules, the tool's own check) and when each of the five modes fits"
    },
    {
      "zh": "写出带允许 / 拒绝 / 询问规则的 `PermissionContext`，通过 `AgentState` 交给 Agent",
      "en": "Write a `PermissionContext` with allow / deny / ask rules and give it to the agent through `AgentState`"
    },
    {
      "zh": "继承 `ToolBase` 写一个带 `check_permissions` 的工具，并手写「收到确认事件 → 问用户 → 交回结果」的循环",
      "en": "Subclass `ToolBase` to write a tool with `check_permissions`, and hand-write the “confirm event → ask the user → hand the answer back” loop"
    }
  ],
  "blocks": [
    {
      "t": "h",
      "zh": "一、工作空间是什么，有什么用",
      "en": "1. What a workspace is and why it helps"
    },
    {
      "t": "p",
      "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=0) 工作空间就是专门分给 Agent 干活的一块地方。视频列了它的四个好处：\n\n| 好处 | 意思 | 例子 |\n|---|---|---|\n| 隔离、专注 | 不同任务各用各的空间，Agent 只关注和自己有关的信息 | 客服 Agent 和管仓库的 Agent 混在一起，信息会互相干扰 |\n| 资源与权限管理 | Agent 只在指定的空间里操作 | 重要文件、不想被看到或改动的文件放在外面 |\n| 协作有序 | 每个 Agent 有自己的空间，另有公共空间交换信息 | 多个 Agent 分工合作 |\n| 生命周期管理 | 临时 Agent 以工作空间为容器，统一启动、暂停、销毁 | 临时任务做完，一次清掉它用过的资源 |\n\n[▶ 01:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=94) AgentScope 的工作空间都在 `agentscope.workspace` 里，视频提到三种：`LocalWorkspace`（直接用本机的一个文件夹）、`DockerWorkspace` 和 `E2BWorkspace`（后两种用容器或云端沙箱隔离，更安全）。视频只用 `LocalWorkspace` 演示，本节也一样。",
      "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=0) A workspace is a place set aside for the agent to do its work. The video lists four benefits:\n\n| Benefit | Meaning | Example |\n|---|---|---|\n| Isolation and focus | Each task gets its own space; the agent only sees what concerns it | A customer-service agent and a warehouse agent sharing one space would get in each other's way |\n| Resource and permission control | The agent only works inside the given space | Important files, or files it must not see or change, stay outside |\n| Orderly collaboration | Each agent has its own space, plus a shared space for exchanging information | Several agents dividing up the work |\n| Lifecycle management | Temporary agents use the workspace as a container that is started, paused and destroyed as a unit | When a temporary job is done, everything it used is cleared in one go |\n\n[▶ 01:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=94) AgentScope's workspaces live in `agentscope.workspace`. The video names three: `LocalWorkspace` (a folder on your machine), `DockerWorkspace` and `E2BWorkspace` (the last two isolate the agent in a container or a cloud sandbox, which is safer). The video only demonstrates `LocalWorkspace`, and so does this lesson."
    },
    {
      "t": "video",
      "zh": "这一集 18 分钟，前 3 分半讲工作空间，后面都在讲权限：\n- [▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=0) 工作空间的概念和四个好处\n- [▶ 01:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=94) 代码：创建 `LocalWorkspace`、初始化、取工具、交给 Agent\n- [▶ 03:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=219) 权限的三层结构；[▶ 04:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=281) 5 种全局模式\n- [▶ 06:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=405) 代码：权限上下文和允许 / 拒绝 / 询问规则\n- [▶ 09:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=595) 代码：继承 `ToolBase`，写一个会自己检查权限的加法工具\n- [▶ 13:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=783) 完整程序；[▶ 15:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=946) 三次测试\n\n字幕里没有点名模型，创建模型的写法和前几集一样（前几集用的是阿里云百炼的千问）。本节统一换成 DeepSeek（`practice/llm.py` 里的 `API_KEY` 和 `MODEL`），其余代码都按本机的 AgentScope 2.0.9 验证过。",
      "en": "This 18-minute episode spends the first three and a half minutes on workspaces and the rest on permissions:\n- [▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=0) what a workspace is and its four benefits\n- [▶ 01:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=94) code: create a `LocalWorkspace`, initialise it, get its tools, give it to the agent\n- [▶ 03:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=219) the three permission layers; [▶ 04:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=281) the five global modes\n- [▶ 06:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=405) code: the permission context and allow / deny / ask rules\n- [▶ 09:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=595) code: subclass `ToolBase` to build an add tool that checks its own permission\n- [▶ 13:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=783) the full program; [▶ 15:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=946) three test runs\n\nThe subtitles don't name the model; it is created the same way as in the previous episodes (which used Alibaba Bailian's Qwen). This lesson uses DeepSeek throughout (`API_KEY` and `MODEL` from `practice/llm.py`); all other code has been checked against the installed AgentScope 2.0.9."
    },
    {
      "t": "h",
      "zh": "二、给 Agent 分配工作空间",
      "en": "2. Giving the agent a workspace"
    },
    {
      "t": "p",
      "zh": "[▶ 02:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=126) 代码分四步：\n\n1. `LocalWorkspace(workdir=文件夹)` 创建工作空间，再 `await workspace.initialize()` 初始化（文件夹不存在会自动建）。\n2. [▶ 02:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=157) `tools = await workspace.list_tools()`：取出工作空间自带的工具。\n3. [▶ 03:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=188) 把这些工具放进 `Toolkit`。还想要别的工具，就另外准备一个列表，和它们合在一起再交给 `Toolkit`。\n4. 创建 Agent 时写 `offloader=workspace`，这块工作空间就分给了这个 Agent（系统提示词里会自动加上一段工作空间说明；19 节还会用它存放被压缩掉的内容）。",
      "en": "[▶ 02:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=126) The code has four steps:\n\n1. Create the workspace with `LocalWorkspace(workdir=folder)`, then initialise it with `await workspace.initialize()` (a missing folder is created).\n2. [▶ 02:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=157) `tools = await workspace.list_tools()` gives you the workspace's built-in tools.\n3. [▶ 03:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=188) Put those tools into a `Toolkit`. If you want other tools as well, keep them in a second list and combine the two before handing them to `Toolkit`.\n4. Pass `offloader=workspace` when creating the agent, and the workspace now belongs to it (a description of the workspace is added to the system prompt automatically; lesson 19 also uses it to store compressed content)."
    },
    {
      "t": "code",
      "file": "workspace_basic.py",
      "code": {
        "zh": "import asyncio\nfrom pathlib import Path\n\nfrom agentscope.agent import Agent\nfrom agentscope.credential import DeepSeekCredential\nfrom agentscope.message import UserMsg\nfrom agentscope.model import DeepSeekChatModel\nfrom agentscope.tool import FunctionTool, Toolkit\nfrom agentscope.workspace import LocalWorkspace\n\nfrom llm import API_KEY, MODEL\n\nWORKDIR = Path(\"data\") / \"l18_workspace\"           # 相对 practice 文件夹\n\n\ndef word_count(text: str) -> str:\n    \"\"\"统计一段文字有多少个字符。\n\n    Args:\n        text (str): 要统计的文字\n    \"\"\"\n    return f\"{len(text)} 个字符\"\n\n\nasync def main():\n    workspace = LocalWorkspace(workdir=str(WORKDIR))\n    await workspace.initialize()                      # 1. 初始化：准备好文件夹\n    tools = await workspace.list_tools()              # 2. 工作空间自带的工具\n    print([t.name for t in tools])    # ['PowerShell', 'Edit', 'Glob', 'Grep', 'Read', 'Write']\n\n    my_tools = [FunctionTool(word_count, is_read_only=True)]   # 自己的工具另放一个列表\n    agent = Agent(\n        name=\"Friday\",\n        system_prompt=\"你是一个文件助手。\",\n        model=DeepSeekChatModel(credential=DeepSeekCredential(api_key=API_KEY), model=MODEL, stream=False),\n        toolkit=Toolkit(tools=tools + my_tools),      # 3. 两个列表合在一起\n        offloader=workspace,                          # 4. 把工作空间分给这个 Agent\n    )\n    # 模型用 Glob 列文件会直接放行；若它选了 PowerShell，回复会暂停等你确认（第七部分讲怎么处理）\n    reply = await agent.reply(UserMsg(name=\"user\", content=\"工作空间里现在有哪些文件？\"))\n    print(reply.get_text_content())\n    await workspace.close()                           # 用完关掉\n\nasyncio.run(main())",
        "en": "import asyncio\nfrom pathlib import Path\n\nfrom agentscope.agent import Agent\nfrom agentscope.credential import DeepSeekCredential\nfrom agentscope.message import UserMsg\nfrom agentscope.model import DeepSeekChatModel\nfrom agentscope.tool import FunctionTool, Toolkit\nfrom agentscope.workspace import LocalWorkspace\n\nfrom llm import API_KEY, MODEL\n\nWORKDIR = Path(\"data\") / \"l18_workspace\"           # relative to the practice folder\n\n\ndef word_count(text: str) -> str:\n    \"\"\"Count the characters in a piece of text.\n\n    Args:\n        text (str): The text to count\n    \"\"\"\n    return f\"{len(text)} characters\"\n\n\nasync def main():\n    workspace = LocalWorkspace(workdir=str(WORKDIR))\n    await workspace.initialize()                      # 1. initialise: prepares the folder\n    tools = await workspace.list_tools()              # 2. the workspace's built-in tools\n    print([t.name for t in tools])    # ['PowerShell', 'Edit', 'Glob', 'Grep', 'Read', 'Write']\n\n    my_tools = [FunctionTool(word_count, is_read_only=True)]   # your own tools in a second list\n    agent = Agent(\n        name=\"Friday\",\n        system_prompt=\"You are a file assistant.\",\n        model=DeepSeekChatModel(credential=DeepSeekCredential(api_key=API_KEY), model=MODEL, stream=False),\n        toolkit=Toolkit(tools=tools + my_tools),      # 3. both lists combined\n        offloader=workspace,                          # 4. give the workspace to this agent\n    )\n    # Listing files with Glob goes through; if the model picks PowerShell the reply pauses for your OK (part 7)\n    reply = await agent.reply(UserMsg(name=\"user\", content=\"Which files are in the workspace now?\"))\n    print(reply.get_text_content())\n    await workspace.close()                           # close it when done\n\nasyncio.run(main())"
      },
      "note": {
        "zh": "`tools + my_tools` 是 10 节学过的列表相加。也可以写成 `async with LocalWorkspace(workdir=...) as workspace:`（回顾 11 节的 `async with`）：进入时自动 `initialize()`，离开时自动 `close()`，补充演示 `l18_workspace_demo.py` 用的就是这种写法。工作空间还能管理技能和 MCP，留到 20 节；20 节还会用 `try/finally` 保证 `close()` 一定执行。",
        "en": "`tools + my_tools` is the list addition from lesson 10. You can also write `async with LocalWorkspace(workdir=...) as workspace:` (see `async with` in lesson 11): it calls `initialize()` on entry and `close()` on exit, and the extra demo `l18_workspace_demo.py` uses that form. Workspaces can also manage skills and MCP – that is lesson 20, which also uses `try/finally` to make sure `close()` always runs."
      }
    },
    {
      "t": "p",
      "zh": "`list_tools()` 给的 6 个工具，以及默认模式下会不会被拦下（规则见第三、四部分）：\n\n| 工具 | 作用 | 只读？ | 默认模式下 |\n|---|---|---|---|\n| `Read` | 读文件 | 是 | 直接放行 |\n| `Glob` | 按通配符找文件 | 是 | 直接放行 |\n| `Grep` | 搜文件内容（需要电脑上装有 ripgrep，本课程环境没装） | 是 | 直接放行 |\n| `Write` | 写入整个文件 | 否 | 要问 |\n| `Edit` | 替换文件里的一段文字 | 否 | 要问 |\n| `PowerShell` / `Bash` | 执行命令（Windows 上给 PowerShell，Linux / macOS 给 Bash） | 否 | PowerShell 每次都问；Bash 会放行 `ls` 这类只读命令 |",
      "en": "The six tools from `list_tools()` and whether the default mode stops them (the rules follow in parts 3 and 4):\n\n| Tool | Does | Read-only? | In the default mode |\n|---|---|---|---|\n| `Read` | Reads a file | Yes | Allowed |\n| `Glob` | Finds files by wildcard | Yes | Allowed |\n| `Grep` | Searches file contents (needs ripgrep installed; the course environment doesn't have it) | Yes | Allowed |\n| `Write` | Writes a whole file | No | Asks |\n| `Edit` | Replaces a piece of text in a file | No | Asks |\n| `PowerShell` / `Bash` | Runs commands (PowerShell on Windows, Bash on Linux / macOS) | No | PowerShell asks every time; Bash lets read-only commands such as `ls` through |"
    },
    {
      "t": "warn",
      "zh": "[▶ 02:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=157) 视频特别强调：工作空间只是一块存储区域，它不替 Agent 干活，也不监视 Agent 有没有越界，工具和权限都得自己配置。`LocalWorkspace` 的工具直接在你的电脑上、以你的用户身份运行，一条 PowerShell 命令能碰到你能碰到的任何文件。真想把 Agent 关起来，要用 `DockerWorkspace`、`E2BWorkspace` 这类沙箱；在本机上守住边界，靠的是下面的**权限管理**。",
      "en": "[▶ 02:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=157) The video stresses this: a workspace is only a storage area. It does no work for the agent and doesn't watch whether the agent stays inside, so tools and permissions are yours to configure. `LocalWorkspace` tools run directly on your computer under your user account, and one PowerShell command can reach any file you can. To really lock an agent in, use a sandbox such as `DockerWorkspace` or `E2BWorkspace`; on your own machine the boundary is held by the **permission management** below."
    },
    {
      "t": "check",
      "q": {
        "zh": "关于 `LocalWorkspace`，哪句话是对的？",
        "en": "Which statement about `LocalWorkspace` is true?"
      },
      "options": [
        {
          "zh": "它会自动阻止 Agent 读写工作空间外面的文件",
          "en": "It automatically stops the agent from reading or writing files outside the workspace"
        },
        {
          "zh": "它只是本机上的一块工作区域，工具和权限都要自己配置",
          "en": "It is just a working area on your machine; tools and permissions are yours to configure"
        },
        {
          "zh": "用了它就不需要 `Toolkit` 了",
          "en": "With it you no longer need a `Toolkit`"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "工作空间不负责检查 Agent 的行为；工具要用 `list_tools()` 取出来放进 `Toolkit`，越界要靠权限管理来拦。",
        "en": "A workspace doesn't police the agent: you take its tools with `list_tools()` and put them in a `Toolkit`, and the permission system has to stop anything out of bounds."
      }
    },
    {
      "t": "h",
      "zh": "三、权限管理的三层结构",
      "en": "3. Three layers of permission control"
    },
    {
      "t": "p",
      "zh": "[▶ 03:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=219) 工作空间管不住 Agent 在外面读写文件，所以要靠权限管理。AgentScope 的权限分三层：\n\n| 层 | 管什么 | 写在哪 |\n|---|---|---|\n| 全局配置（模式） | 一次决定一大类操作的待遇：全都问？工作目录里随便改？只许看？ | `PermissionContext(mode=PermissionMode.…)` |\n| 精细化配置（规则） | 点名某个工具、某种参数：总是允许、总是拒绝、必须询问 | `allow_rules` / `deny_rules` / `ask_rules` |\n| 工具自己的检查 | 最后一道防线：调用前由工具自己看参数做决定，前两层漏掉的危险操作也能在这里拦住 | 工具类里的 `check_permissions` 方法 |\n\n视频从 [▶ 04:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=250) 起讲后两层。补充一点（按 2.0.9 源码整理）：每次 Agent 想调用工具，这三层合起来只给出三种结论之一：`ALLOW`（执行）、`DENY`（不执行，把「被拒绝」当作工具结果告诉模型）、`ASK`（先不执行，整个回复暂停，等用户决定——16 节见过的「I'm waiting for your permission…」就是它）。",
      "en": "[▶ 03:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=219) A workspace can't stop the agent from reading or writing outside it, so permission management takes over. AgentScope has three layers:\n\n| Layer | Controls | Where you write it |\n|---|---|---|\n| Global setting (mode) | How a whole class of actions is treated: always ask? edit freely in the working directory? look only? | `PermissionContext(mode=PermissionMode.…)` |\n| Fine-grained setting (rules) | A named tool or argument pattern: always allow, always deny, always ask | `allow_rules` / `deny_rules` / `ask_rules` |\n| The tool's own check | The last line of defence: the tool inspects the arguments before it runs, catching dangerous calls the first two layers missed | A `check_permissions` method on the tool class |\n\nThe video covers the last two layers from [▶ 04:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=250). One addition (from the 2.0.9 source): whenever the agent wants a tool, the three layers together reach one of three results: `ALLOW` (run it), `DENY` (don't run it; the model receives “denied” as the tool result), or `ASK` (don't run it yet – the whole reply pauses until the user decides; the “I'm waiting for your permission…” from lesson 16 is exactly this)."
    },
    {
      "t": "note",
      "zh": "补充：三层的实际检查顺序（按 AgentScope 2.0.9 源码整理）：\n1. 拒绝规则命中 → 拒绝（**任何模式下都最优先**）\n2. 询问规则命中 → 询问\n3. 只读调用 → 放行（`is_read_only=True` 的工具、Bash 的 `ls` 这类只读命令）\n4. 工具自己的 `check_permissions`：返回 ALLOW 或 DENY 就直接定案\n5. 允许规则命中 → 放行\n6. 还没定下来就看模式：DEFAULT / ACCEPT_EDITS 询问，DONT_ASK 拒绝，BYPASS 放行\n\nEXPLORE 模式过了第 3 步直接拒绝，不看工具的检查，也不看允许规则。",
      "en": "Extra: the order in which the layers are actually checked (from the AgentScope 2.0.9 source):\n1. A deny rule matches → deny (**always first, in every mode**)\n2. An ask rule matches → ask\n3. A read-only call → allow (tools with `is_read_only=True`, read-only Bash commands such as `ls`)\n4. The tool's own `check_permissions`: ALLOW or DENY settles it\n5. An allow rule matches → allow\n6. Still undecided → the mode decides: DEFAULT / ACCEPT_EDITS ask, DONT_ASK denies, BYPASS allows\n\nEXPLORE denies right after step 3, without consulting the tool's check or the allow rules."
    },
    {
      "t": "h",
      "zh": "四、全局配置：5 种模式",
      "en": "4. The global setting: five modes"
    },
    {
      "t": "p",
      "zh": "[▶ 04:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=281) 模式写在 `PermissionContext` 的 `mode` 里，共 5 种：\n\n| 模式 | 行为 | 适合 |\n|---|---|---|\n| `DEFAULT` | 最稳妥：只读操作放行（包括 `ls` 这类只读命令），其余都要有允许规则或用户确认 | 对安全要求高的正式环境 |\n| `ACCEPT_EDITS` | **工作目录里**的写入、修改、删除自动放行；命令只有在涉及的路径全在工作目录里时才放行 | 开发调试，省掉频繁确认的打扰 |\n| `EXPLORE` | 只读：读和搜放行，任何修改都拒绝——只能看，不能改、不能加、不能删 | 读代码、读论文 |\n| `BYPASS` | 跳过所有检查，只受你写的拒绝 / 询问规则约束 | 完全可信的沙箱（Docker、E2B）里 |\n| `DONT_ASK` | 所有「询问」都变成「拒绝」（工作目录里的编辑照样放行） | 没人值守的定时任务、自动化脚本 |\n\n视频对应位置：[▶ 05:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=313) ACCEPT_EDITS，[▶ 05:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=344) EXPLORE 和 BYPASS，[▶ 06:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=375) DONT_ASK。",
      "en": "[▶ 04:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=281) The mode goes into the `mode` of a `PermissionContext`. There are five:\n\n| Mode | Behaviour | Good for |\n|---|---|---|\n| `DEFAULT` | The safest: read-only actions go through (including read-only commands such as `ls`); everything else needs an allow rule or the user's confirmation | Production settings where safety matters |\n| `ACCEPT_EDITS` | Writes, edits and deletions **inside the working directory** go through; a command goes through only if every path it touches is inside the working directory | Active development, without constant prompts |\n| `EXPLORE` | Read-only: reading and searching go through, every change is denied – look, but no editing, adding or deleting | Reading code or papers |\n| `BYPASS` | Skips all checks; only your deny / ask rules still apply | A fully trusted sandbox (Docker, E2B) |\n| `DONT_ASK` | Every “ask” becomes a “deny” (edits inside the working directory still go through) | Unattended scheduled jobs and automation scripts |\n\nIn the video: [▶ 05:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=313) ACCEPT_EDITS, [▶ 05:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=344) EXPLORE and BYPASS, [▶ 06:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=375) DONT_ASK."
    },
    {
      "t": "code",
      "file": "modes.py",
      "code": {
        "zh": "from agentscope.permission import PermissionContext, PermissionMode\nfrom agentscope.state import AgentState\n\ncontext = PermissionContext(mode=PermissionMode.ACCEPT_EDITS)   # 视频选的是第二种\nagent = Agent(name=\"Friday\", system_prompt=\"...\", model=model, toolkit=toolkit,\n              state=AgentState(permission_context=context))       # 通过 AgentState 交给 Agent\n\n# 运行中也可以随时切换\nagent.state.permission_context.mode = PermissionMode.EXPLORE",
        "en": "from agentscope.permission import PermissionContext, PermissionMode\nfrom agentscope.state import AgentState\n\ncontext = PermissionContext(mode=PermissionMode.ACCEPT_EDITS)   # the video picks the second one\nagent = Agent(name=\"Friday\", system_prompt=\"...\", model=model, toolkit=toolkit,\n              state=AgentState(permission_context=context))       # handed over through AgentState\n\n# You can also switch at any time while it runs\nagent.state.permission_context.mode = PermissionMode.EXPLORE"
      },
      "note": {
        "zh": "`PermissionMode.ACCEPT_EDITS` 是**枚举**（回顾 15 节的 Enum 小课堂）。它是普通枚举，不是字符串枚举，所以要写 `PermissionMode.ACCEPT_EDITS`，不能写字符串 `\"accept_edits\"`；它的 `.value` 才是 `\"accept_edits\"`（19 节存档时存的就是它）。",
        "en": "`PermissionMode.ACCEPT_EDITS` is an **enum** (see the Enum mini-lesson in lesson 15). It is a plain enum, not a string enum, so write `PermissionMode.ACCEPT_EDITS`, not the string `\"accept_edits\"`; its `.value` is `\"accept_edits\"` (which is what lesson 19 stores when it saves the state)."
      }
    },
    {
      "t": "warn",
      "zh": "`ACCEPT_EDITS` 认的「工作目录」= **程序的当前目录** + 你在 `PermissionContext(working_directories=...)` 里加的目录。在 `practice` 文件夹里运行脚本，整个 `practice` 都会被当成可以随便改的地方。想让边界只是工作空间，就先 `os.chdir(工作空间文件夹)`——本节的练习文件就是这样做的。",
      "en": "For `ACCEPT_EDITS`, “working directory” = **the program's current directory** + any directories you add via `PermissionContext(working_directories=...)`. Run a script from the `practice` folder and all of `practice` becomes fair game for edits. To make the workspace the only boundary, `os.chdir(workspace_folder)` first – this lesson's practice file does exactly that."
    },
    {
      "t": "h",
      "zh": "五、精细化配置：允许、拒绝、询问规则",
      "en": "5. Fine-grained rules: allow, deny, ask"
    },
    {
      "t": "p",
      "zh": "[▶ 06:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=405) 需要的类都从 `agentscope.permission` 导入：`PermissionContext`（权限上下文）、`PermissionMode`（模式）、`PermissionRule`（一条规则）、`PermissionBehavior`（允许 / 拒绝 / 询问）。[▶ 08:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=501) 老师在这里提醒过：幻灯片上的代码漏了 `PermissionRule` 的导入，自己写时记得补上。\n\n[▶ 07:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=470) 三种规则都是**字典**：键是工具名字符串，值是这个工具的规则列表。一条 `PermissionRule` 有四个参数：\n- `tool_name`：管哪个工具，和字典的键写成一样（框架其实是按**字典的键**找规则的，所以键必须和工具名一字不差，区分大小写）\n- `rule_content`：匹配什么。文件工具（`Read` / `Write` / `Edit`）用通配符匹配**完整的文件路径**，如 `\"*.env\"`；`Bash` 匹配命令；**空字符串 `\"\"` 或 `None` 表示这个工具的所有调用**\n- `behavior`：`PermissionBehavior.ALLOW` / `DENY` / `ASK`\n- `source`：规则从哪来，视频写的是 `\"userSettings\"`（用户设置）\n\n[▶ 08:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=532) `allow_rules` 里的直接放行，`deny_rules` 里的直接拒绝，`ask_rules` 里的每次都问用户；[▶ 09:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=563) 询问规则没有特别要匹配的内容时，`rule_content` 写空字符串即可。最后把权限上下文包进 `AgentState(permission_context=...)`（从 `agentscope.state` 导入），创建 Agent 时用 `state=` 传进去。",
      "en": "[▶ 06:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=405) Everything comes from `agentscope.permission`: `PermissionContext` (the permission context), `PermissionMode` (the mode), `PermissionRule` (one rule) and `PermissionBehavior` (allow / deny / ask). [▶ 08:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=501) The instructor points out that the slide's code forgot to import `PermissionRule` – add it when you write it yourself.\n\n[▶ 07:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=470) All three kinds of rules are **dicts**: the key is the tool name as a string, the value is that tool's list of rules. A `PermissionRule` takes four arguments:\n- `tool_name`: which tool – spelled the same as the dict key (the framework actually looks rules up by the **dict key**, so the key must match the tool name exactly, case included)\n- `rule_content`: what to match. File tools (`Read` / `Write` / `Edit`) match the **full file path** with a wildcard such as `\"*.env\"`; `Bash` matches the command; **an empty string `\"\"` or `None` means every call of this tool**\n- `behavior`: `PermissionBehavior.ALLOW` / `DENY` / `ASK`\n- `source`: where the rule comes from; the video uses `\"userSettings\"`\n\n[▶ 08:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=532) Calls matching `allow_rules` go through, those matching `deny_rules` are refused, and those matching `ask_rules` always ask the user; [▶ 09:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=563) when an ask rule has nothing specific to match, an empty string will do for `rule_content`. Finally wrap the permission context in `AgentState(permission_context=...)` (from `agentscope.state`) and pass it with `state=` when creating the agent."
    },
    {
      "t": "code",
      "file": "rules.py",
      "code": {
        "zh": "from agentscope.permission import (PermissionBehavior, PermissionContext,\n                                   PermissionMode, PermissionRule)   # 别漏了 PermissionRule\nfrom agentscope.state import AgentState\n\ncontext = PermissionContext(\n    mode=PermissionMode.ACCEPT_EDITS,\n    # 允许：往 l18_workspace 文件夹里写 .txt 不用问（路径里要带上文件夹名，见下面的说明）\n    allow_rules={\"Write\": [PermissionRule(tool_name=\"Write\", rule_content=\"*/l18_workspace/*.txt\",\n                                          behavior=PermissionBehavior.ALLOW, source=\"userSettings\")]},\n    # 拒绝：任何 .env 文件都不许读\n    deny_rules={\"Read\": [PermissionRule(tool_name=\"Read\", rule_content=\"*.env\",\n                                        behavior=PermissionBehavior.DENY, source=\"userSettings\")]},\n    # 询问：Edit 的每次调用都要问（rule_content 写空字符串）\n    ask_rules={\"Edit\": [PermissionRule(tool_name=\"Edit\", rule_content=\"\",\n                                       behavior=PermissionBehavior.ASK, source=\"userSettings\")]},\n)\nagent = Agent(name=\"Friday\", system_prompt=\"...\", model=model, toolkit=toolkit,\n              offloader=workspace, state=AgentState(permission_context=context))",
        "en": "from agentscope.permission import (PermissionBehavior, PermissionContext,\n                                   PermissionMode, PermissionRule)   # don't forget PermissionRule\nfrom agentscope.state import AgentState\n\ncontext = PermissionContext(\n    mode=PermissionMode.ACCEPT_EDITS,\n    # Allow: writing .txt files inside the l18_workspace folder never asks (the folder is in the pattern; see below)\n    allow_rules={\"Write\": [PermissionRule(tool_name=\"Write\", rule_content=\"*/l18_workspace/*.txt\",\n                                          behavior=PermissionBehavior.ALLOW, source=\"userSettings\")]},\n    # Deny: no .env file may be read\n    deny_rules={\"Read\": [PermissionRule(tool_name=\"Read\", rule_content=\"*.env\",\n                                        behavior=PermissionBehavior.DENY, source=\"userSettings\")]},\n    # Ask: every Edit call asks (empty rule_content)\n    ask_rules={\"Edit\": [PermissionRule(tool_name=\"Edit\", rule_content=\"\",\n                                       behavior=PermissionBehavior.ASK, source=\"userSettings\")]},\n)\nagent = Agent(name=\"Friday\", system_prompt=\"...\", model=model, toolkit=toolkit,\n              offloader=workspace, state=AgentState(permission_context=context))"
      }
    },
    {
      "t": "note",
      "zh": "三个容易忽略的地方：\n- 通配符里的 `*` 能跨过文件夹，而文件工具拿到的是完整路径（比如 `G:\\...\\l18_workspace\\a.txt`）。所以 `\"*.env\"` 会匹配电脑上**任何位置**的 .env 文件——用在拒绝规则里正合适；但如果允许规则写成 `\"*.txt\"`，Agent 往任何文件夹写 .txt 都不会再问你（离线实测）。允许规则要把文件夹也写进去，比如上面的 `\"*/l18_workspace/*.txt\"`（Windows 上 `/` 和 `\\` 都能匹配）。\n- Windows 上的命令工具叫 `PowerShell`，它不认按命令匹配的规则，只认 `rule_content` 为空的「整个工具」级规则。\n- `Read`、`Glob`、`Grep` 是只读的，任何模式下都放行，所以**默认情况下 Agent 能读你电脑上它找得到的任何文件**。不想让它看的东西（`.env`、密钥文件）要用拒绝规则挡住。",
      "en": "Three easy-to-miss details:\n- A `*` in the pattern also crosses folders, and file tools receive the full path (such as `G:\\...\\l18_workspace\\a.txt`). So `\"*.env\"` matches a .env file **anywhere** on your computer – just right for a deny rule; but an allow rule written as `\"*.txt\"` lets the agent write .txt files into any folder without asking (tested offline). Put the folder into allow rules, like `\"*/l18_workspace/*.txt\"` above (on Windows both `/` and `\\` match).\n- On Windows the command tool is `PowerShell`, which ignores command patterns and only honours tool-level rules with an empty `rule_content`.\n- `Read`, `Glob` and `Grep` are read-only and go through in every mode, so **by default the agent can read any file on your computer it can find**. Block what it must not see (`.env`, key files) with deny rules."
    },
    {
      "t": "py",
      "title": {
        "zh": "集合 set 和 in：判断「在不在名单里」",
        "en": "Sets and `in`: “is it on the list?”"
      },
      "zh": "权限判断本质上是一连串「这个工具在不在某张名单里」。Python 里装一组名字最合适的是**集合**（set）：\n- 写法：`{\"Read\", \"Glob\"}`；**空集合必须写 `set()`**，`{}` 是空字典\n- `x in s` / `x not in s`：在不在里面，结果是 `True` / `False`\n- `s.add(x)`：加一个；重复加只保留一个（集合自动去重，也没有顺序）\n\n下面用集合写一个简化版的权限判断，顺序和 AgentScope 一致：先拒绝、再询问、再只读、再允许，最后看模式。",
      "en": "A permission check is basically a series of “is this tool on that list?” questions. The best Python container for a group of names is a **set**:\n- Written `{\"Read\", \"Glob\"}`; **an empty set must be `set()`** – `{}` is an empty dict\n- `x in s` / `x not in s`: membership, giving `True` / `False`\n- `s.add(x)`: add one item; adding it twice keeps one (sets drop duplicates and have no order)\n\nBelow, a simplified permission check built from sets, in the same order as AgentScope: deny, then ask, then read-only, then allow, and finally the mode.",
      "code": {
        "zh": "READ_ONLY = {\"Read\", \"Glob\", \"Grep\"}       # 集合：用花括号\ndeny_rules = {\"PowerShell\"}\nask_rules = {\"Edit\"}\nallow_rules = set()                         # 空集合必须写 set()，{} 是空字典\n\ndef decide(tool_name, mode=\"default\"):\n    \"\"\"简化版：拒绝 → 询问 → 只读 → 允许 → 看模式\"\"\"\n    if tool_name in deny_rules:\n        return \"deny\"\n    if tool_name in ask_rules:\n        return \"ask\"\n    if tool_name in READ_ONLY:\n        return \"allow\"\n    if tool_name in allow_rules:\n        return \"allow\"\n    if mode == \"dont_ask\":                  # 没人回答：询问变拒绝\n        return \"deny\"\n    return \"ask\"\n\nfor name in [\"Read\", \"Edit\", \"Write\", \"PowerShell\"]:\n    print(name, \"->\", decide(name))\n\nprint(\"add (dont_ask) ->\", decide(\"add\", mode=\"dont_ask\"))\nallow_rules.add(\"Write\")                    # 用户选了「以后都允许」\nallow_rules.add(\"Write\")                    # 再加一次也只有一个：集合自动去重\nprint(\"Write ->\", decide(\"Write\"), \"| allow_rules =\", allow_rules)\nprint(\"Write\" not in READ_ONLY)             # True",
        "en": "READ_ONLY = {\"Read\", \"Glob\", \"Grep\"}       # a set: curly braces\ndeny_rules = {\"PowerShell\"}\nask_rules = {\"Edit\"}\nallow_rules = set()                         # an empty set must be set(); {} is an empty dict\n\ndef decide(tool_name, mode=\"default\"):\n    \"\"\"Simplified: deny -> ask -> read-only -> allow -> mode\"\"\"\n    if tool_name in deny_rules:\n        return \"deny\"\n    if tool_name in ask_rules:\n        return \"ask\"\n    if tool_name in READ_ONLY:\n        return \"allow\"\n    if tool_name in allow_rules:\n        return \"allow\"\n    if mode == \"dont_ask\":                  # nobody to answer: ask becomes deny\n        return \"deny\"\n    return \"ask\"\n\nfor name in [\"Read\", \"Edit\", \"Write\", \"PowerShell\"]:\n    print(name, \"->\", decide(name))\n\nprint(\"add (dont_ask) ->\", decide(\"add\", mode=\"dont_ask\"))\nallow_rules.add(\"Write\")                    # the user chose \"always allow\"\nallow_rules.add(\"Write\")                    # adding it again changes nothing: sets drop duplicates\nprint(\"Write ->\", decide(\"Write\"), \"| allow_rules =\", allow_rules)\nprint(\"Write\" not in READ_ONLY)             # True"
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "给 `Read` 加了一条拒绝规则 `*.env`，同时又有一条允许 `Read` 全部调用的允许规则。Agent 读 `secret.env` 时会怎样？",
        "en": "`Read` has a deny rule `*.env` and also an allow rule for every `Read` call. What happens when the agent reads `secret.env`?"
      },
      "options": [
        {
          "zh": "放行，因为允许规则覆盖所有调用",
          "en": "Allowed, because the allow rule covers every call"
        },
        {
          "zh": "拒绝，因为拒绝规则最先检查",
          "en": "Denied, because deny rules are checked first"
        },
        {
          "zh": "暂停问你",
          "en": "It pauses and asks you"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "拒绝规则在任何模式下都最先检查，命中就直接拒绝，后面的允许规则根本轮不到。",
        "en": "Deny rules come first in every mode; a match denies immediately and the allow rule is never reached."
      }
    },
    {
      "t": "h",
      "zh": "六、最后一道防线：工具自己的 check_permissions",
      "en": "6. The last line of defence: the tool's own check_permissions"
    },
    {
      "t": "p",
      "zh": "[▶ 09:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=595) 想让工具自己检查权限，就不能只写一个函数，而要写一个**类**，继承 `agentscope.tool` 里的 `ToolBase`。视频的例子是一个加法工具，类里要写这些：\n\n| 写什么 | 作用 |\n|---|---|\n| `name` | 工具名，模型调用时用它 |\n| `description` | 工具说明，帮模型理解什么时候该用 |\n| `input_schema` | 参数说明，就是 05 节的 JSON Schema：`type` 为 `\"object\"`，`a`、`b` 都是 `number`，各带一句描述，再写清楚哪些必填 |\n| `is_concurrency_safe` | 能不能和别的工具调用同时（并发）执行，视频设为 `True` |\n| `is_read_only` | 写 `False`。写成 `True` 的话框架在「只读」那一步就放行了，`check_permissions` 根本不会运行 |\n| `async def check_permissions(self, tool_input, context)` | 检查方法：从 `tool_input` 字典里取参数，返回一个 `PermissionDecision` |\n| `async def call(self, a, b)` | 真正干活的方法，返回 `ToolChunk` |\n\n视频位置：[▶ 10:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=625) 描述和参数，[▶ 10:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=658) 并发、只读和检查方法。\n\n[▶ 11:29](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=689) 视频的检查规则是：先确认 `a`、`b` 是数字，两个数**都大于 1 万**就返回 `PermissionDecision(behavior=PermissionBehavior.ASK, message=...)` 去问用户，否则返回 `ALLOW`。`message` 是你自己写的说明。[▶ 12:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=751) `call` 返回的 `ToolChunk` 里，`content` 必须是列表，结果文字用 `TextBlock` 包起来，这部分交给模型看；`metadata` 可以放输入和结果，留给程序自己用。",
      "en": "[▶ 09:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=595) For a tool to check its own permission, a plain function is not enough: you write a **class** that inherits `ToolBase` from `agentscope.tool`. The video's example is an add tool, and the class needs:\n\n| What | Purpose |\n|---|---|\n| `name` | The tool name the model calls |\n| `description` | Tells the model when to use it |\n| `input_schema` | The parameters – lesson 05's JSON Schema: `type` is `\"object\"`, `a` and `b` are both `number` with a short description each, plus which ones are required |\n| `is_concurrency_safe` | Whether it may run at the same time as other tool calls; the video sets `True` |\n| `is_read_only` | Set `False`. With `True` the framework allows the call at the read-only step and `check_permissions` never runs |\n| `async def check_permissions(self, tool_input, context)` | The check: take the arguments from the `tool_input` dict and return a `PermissionDecision` |\n| `async def call(self, a, b)` | The method that does the work, returning a `ToolChunk` |\n\nIn the video: [▶ 10:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=625) description and parameters, [▶ 10:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=658) concurrency, read-only and the check method.\n\n[▶ 11:29](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=689) The video's rule: make sure `a` and `b` are numbers; if **both are above 10,000**, return `PermissionDecision(behavior=PermissionBehavior.ASK, message=...)` to ask the user, otherwise return `ALLOW`. The `message` is your own explanation. [▶ 12:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=751) In the `ToolChunk` that `call` returns, `content` must be a list with the result text wrapped in a `TextBlock` – that is what the model sees; `metadata` can hold the input and result for your own code."
    },
    {
      "t": "code",
      "file": "add_tool.py",
      "code": {
        "zh": "from agentscope.message import TextBlock\nfrom agentscope.permission import PermissionBehavior, PermissionDecision\nfrom agentscope.tool import ToolBase, ToolChunk\n\n\nclass AddTool(ToolBase):                     # 继承 ToolBase\n    name = \"add\"\n    description = \"计算两个数的和。\"\n    input_schema = {\n        \"type\": \"object\",\n        \"properties\": {\n            \"a\": {\"type\": \"number\", \"description\": \"第一个数字\"},\n            \"b\": {\"type\": \"number\", \"description\": \"第二个数字\"},\n        },\n        \"required\": [\"a\", \"b\"],\n    }\n    is_concurrency_safe = True\n    is_read_only = False                     # 写 True 的话，下面的检查不会运行\n\n    async def check_permissions(self, tool_input, context):\n        a = tool_input.get(\"a\")\n        b = tool_input.get(\"b\")\n        if isinstance(a, (int, float)) and isinstance(b, (int, float)) and a > 10000 and b > 10000:\n            return PermissionDecision(behavior=PermissionBehavior.ASK,\n                                      message=f\"两个数 {a} 和 {b} 都大于 1 万，确认要计算吗？\")\n        return PermissionDecision(behavior=PermissionBehavior.ALLOW, message=\"加法操作已允许\")\n\n    async def call(self, a: float, b: float) -> ToolChunk:\n        result = a + b\n        return ToolChunk(\n            content=[TextBlock(text=f\"{a} + {b} = {result}\")],      # 交给模型看\n            metadata={\"input\": {\"a\": a, \"b\": b}, \"result\": result},  # 留给程序用\n        )",
        "en": "from agentscope.message import TextBlock\nfrom agentscope.permission import PermissionBehavior, PermissionDecision\nfrom agentscope.tool import ToolBase, ToolChunk\n\n\nclass AddTool(ToolBase):                     # inherit from ToolBase\n    name = \"add\"\n    description = \"Add two numbers.\"\n    input_schema = {\n        \"type\": \"object\",\n        \"properties\": {\n            \"a\": {\"type\": \"number\", \"description\": \"the first number\"},\n            \"b\": {\"type\": \"number\", \"description\": \"the second number\"},\n        },\n        \"required\": [\"a\", \"b\"],\n    }\n    is_concurrency_safe = True\n    is_read_only = False                     # with True, the check below never runs\n\n    async def check_permissions(self, tool_input, context):\n        a = tool_input.get(\"a\")\n        b = tool_input.get(\"b\")\n        if isinstance(a, (int, float)) and isinstance(b, (int, float)) and a > 10000 and b > 10000:\n            return PermissionDecision(behavior=PermissionBehavior.ASK,\n                                      message=f\"Both {a} and {b} exceed 10000 - go ahead?\")\n        return PermissionDecision(behavior=PermissionBehavior.ALLOW, message=\"Addition allowed\")\n\n    async def call(self, a: float, b: float) -> ToolChunk:\n        result = a + b\n        return ToolChunk(\n            content=[TextBlock(text=f\"{a} + {b} = {result}\")],      # what the model sees\n            metadata={\"input\": {\"a\": a, \"b\": b}, \"result\": result},  # data for your code\n        )"
      },
      "note": {
        "zh": "`isinstance(a, (int, float))` 判断 `a` 是不是整数或小数（25 节会细讲 `isinstance`），防止模型传来奇怪的参数时比较出错。用的时候要先实例化：`Toolkit(tools=[AddTool()])`。视频里老师口头说「定义 call 方法」：2.0.9 里重写的就是 `call`，框架自己的 `__call__` 会去调用它。若你在视频画面里看到的是 `async def __call__(self, a, b)`，那种写法在 2.0.9 里也能运行（离线实测），只是绕过了工具中间件。",
        "en": "`isinstance(a, (int, float))` checks that `a` is an integer or a decimal (lesson 25 covers `isinstance`), so odd arguments from the model can't break the comparison. Instantiate it before use: `Toolkit(tools=[AddTool()])`. The instructor says to “define the call method”: in 2.0.9 the method to override is `call`, which the framework's own `__call__` invokes. If the video's screen shows `async def __call__(self, a, b)` instead, that also runs on 2.0.9 (tested offline) but bypasses tool middlewares."
      }
    },
    {
      "t": "py",
      "title": {
        "zh": "继承：在现成的类上改写",
        "en": "Inheritance: building on an existing class"
      },
      "zh": "`class AddTool(ToolBase):` 的括号里写着另一个类，这叫**继承**（类和对象的基础见 08 节）：\n- 子类自动拥有父类的全部属性和方法，不用重写一遍\n- 写在类里、方法外面的变量叫**类属性**，比如 `name = \"add\"`；子类写同名的属性，就盖掉父类的\n- 子类写一个和父类同名的方法，叫**重写**（override）。父类的代码调用 `self.check(...)` 时，执行的是子类的版本——框架就是这样调到你写的 `check_permissions` 和 `call` 的\n\n下面用一个迷你「工具父类」演示：父类负责「先看只读、再检查、最后执行」的流程，子类只填自己的规则。",
      "en": "`class AddTool(ToolBase):` names another class in the brackets – that is **inheritance** (classes and objects are introduced in lesson 08):\n- The subclass automatically gets all of the parent's attributes and methods\n- A variable written inside the class but outside any method is a **class attribute**, such as `name = \"add\"`; a subclass attribute with the same name replaces the parent's\n- A subclass method with the same name as a parent method **overrides** it. When the parent's code calls `self.check(...)`, the subclass version runs – that is how the framework reaches your `check_permissions` and `call`\n\nBelow, a mini “tool parent class”: the parent runs the “read-only first, then check, then execute” flow, and the subclass only supplies its own rule.",
      "code": {
        "zh": "class MiniToolBase:                         # 父类：规定一个工具怎么被执行\n    name = \"base\"                           # 类属性\n    is_read_only = False\n\n    def check(self, tool_input):            # 父类的默认做法：一律询问\n        return \"ask\"\n\n    def run(self, tool_input):\n        decision = \"allow\" if self.is_read_only else self.check(tool_input)\n        if decision == \"allow\":\n            return f\"{self.name} 执行了，结果 {self.call(**tool_input)}\"\n        return f\"{self.name} 需要确认（{decision}）\"\n\n\nclass Add(MiniToolBase):                    # 括号里写父类 = 继承\n    name = \"add\"                            # 盖掉父类的类属性\n\n    def check(self, tool_input):            # 重写父类的方法\n        if tool_input[\"a\"] > 10000 and tool_input[\"b\"] > 10000:\n            return \"ask\"\n        return \"allow\"\n\n    def call(self, a, b):\n        return a + b\n\n\ntool = Add()\nprint(tool.name, tool.is_read_only)         # add False：is_read_only 是从父类继承来的\nprint(tool.run({\"a\": 3, \"b\": 4}))           # 父类的 run 调到了子类的 check 和 call\nprint(tool.run({\"a\": 20000, \"b\": 30000}))",
        "en": "class MiniToolBase:                         # parent: decides how a tool is run\n    name = \"base\"                           # class attributes\n    is_read_only = False\n\n    def check(self, tool_input):            # the parent's default: always ask\n        return \"ask\"\n\n    def run(self, tool_input):\n        decision = \"allow\" if self.is_read_only else self.check(tool_input)\n        if decision == \"allow\":\n            return f\"{self.name} ran, result {self.call(**tool_input)}\"\n        return f\"{self.name} needs confirmation ({decision})\"\n\n\nclass Add(MiniToolBase):                    # parent in the brackets = inheritance\n    name = \"add\"                            # replaces the parent's class attribute\n\n    def check(self, tool_input):            # overrides the parent's method\n        if tool_input[\"a\"] > 10000 and tool_input[\"b\"] > 10000:\n            return \"ask\"\n        return \"allow\"\n\n    def call(self, a, b):\n        return a + b\n\n\ntool = Add()\nprint(tool.name, tool.is_read_only)         # add False: is_read_only is inherited\nprint(tool.run({\"a\": 3, \"b\": 4}))           # the parent's run reaches the subclass's check and call\nprint(tool.run({\"a\": 20000, \"b\": 30000}))"
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "把 `AddTool` 的 `is_read_only` 改成 `True`，再让它算 20000 + 30000，会怎样？",
        "en": "You change `AddTool`'s `is_read_only` to `True` and ask it for 20000 + 30000. What happens?"
      },
      "options": [
        {
          "zh": "照样弹出询问",
          "en": "It still asks"
        },
        {
          "zh": "被拒绝",
          "en": "It is denied"
        },
        {
          "zh": "直接执行，`check_permissions` 根本没有运行",
          "en": "It runs straight away – `check_permissions` never runs"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "只读调用在第 3 步就放行了，轮不到第 4 步的工具检查（离线实测）。所以带检查的工具要写 `is_read_only = False`。",
        "en": "A read-only call is allowed at step 3, before the tool's check at step 4 (tested offline). A tool with a check must keep `is_read_only = False`."
      }
    },
    {
      "t": "tip",
      "zh": "`check_permissions` 返回 `ALLOW` 或 `DENY` 就是最终结论，后面的允许规则不再看；返回普通的 `ASK` 则还会再看允许规则——如果给 `add` 加了允许规则（或用户选过「以后都允许」），这个询问就不再出现。想让它**无论如何都问**，返回 `PermissionDecision(..., bypass_immune=True)`。另外，`BYPASS` 模式会忽略工具发出的询问，`EXPLORE` 模式根本不调用这个方法。（都用离线脚本实测过。）",
      "en": "A `check_permissions` result of `ALLOW` or `DENY` is final – allow rules are not consulted. A plain `ASK` still lets allow rules have their say: if `add` has an allow rule (or the user chose “always allow”), the question disappears. To make it ask **no matter what**, return `PermissionDecision(..., bypass_immune=True)`. Also, `BYPASS` ignores a tool's ask, and `EXPLORE` never calls this method at all. (All tested with offline scripts.)"
    },
    {
      "t": "h",
      "zh": "七、完整程序：收到「请确认」就问用户",
      "en": "7. The full program: ask the user on a confirm event"
    },
    {
      "t": "p",
      "zh": "[▶ 13:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=783) 完整代码把前面的零件拼在一起。[▶ 13:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=816) `main` 里初始化工作空间、取出工具，再加上 `AddTool()` 的实例（它是类，要先实例化）；然后创建模型和权限上下文；[▶ 14:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=848) 创建 Agent 时传入名字、系统提示词、模型、工具箱、`offloader=workspace` 和 `state=AgentState(...)`。\n\n接着是对话循环，用的是 15 节的 `reply_stream`。关键是一个记着「待交回的确认」的变量 `confirm`，一开始是 `None`：\n1. `confirm` 是 `None`：照常读用户输入，包成 `UserMsg` 发给 Agent；\n2. `confirm` 不是 `None`：这一轮不读输入，直接把 `confirm` 交回去，再把它清空；\n3. [▶ 14:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=881) 收事件时，遇到 `EventType.REQUIRE_USER_CONFIRM`（请用户确认），就遍历 `event.tool_calls`，逐个问用户，把答复做成 `ConfirmResult`，打包成 `UserConfirmResultEvent` 存进 `confirm`；其他事件照常流式打印文字。\n\n[▶ 15:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=912) 视频说，和之前的代码相比，这里多的就是「问用户」这一步：不再由程序自动同意，而是让人来决定。",
      "en": "[▶ 13:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=783) The full code puts the pieces together. [▶ 13:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=816) In `main`: initialise the workspace, take its tools and add an `AddTool()` instance (it's a class, so instantiate it first); then create the model and the permission context; [▶ 14:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=848) create the agent with a name, system prompt, model, toolkit, `offloader=workspace` and `state=AgentState(...)`.\n\nThen comes the chat loop, using `reply_stream` from lesson 15. The key is a variable `confirm` holding “a confirmation to hand back”, starting as `None`:\n1. `confirm` is `None`: read the user's input as usual, wrap it in a `UserMsg` and send it;\n2. `confirm` is not `None`: skip the input this round, hand `confirm` back, then clear it;\n3. [▶ 14:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=881) while receiving events, on `EventType.REQUIRE_USER_CONFIRM` (please confirm) loop over `event.tool_calls`, ask the user about each, turn the answers into `ConfirmResult`s and pack them into a `UserConfirmResultEvent` stored in `confirm`; any other event just prints its text as it streams.\n\n[▶ 15:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=912) As the video says, compared with the earlier code the only addition is this “ask the user” step: instead of the program agreeing automatically, a person decides."
    },
    {
      "t": "code",
      "file": {
        "zh": "chat_loop.py（练习文件里这段写在 main() 中）",
        "en": "chat_loop.py (inside main() in the practice file)"
      },
      "code": {
        "zh": "from agentscope.event import ConfirmResult, EventType, UserConfirmResultEvent\nfrom agentscope.message import UserMsg\n\ndef ask_user(tool_call):\n    \"\"\"在终端里问用户：允许这次工具调用吗？\"\"\"\n    print(f\"\\n[需要确认] {tool_call.name}  {tool_call.input}\")\n    answer = input(\"允许吗？(y/n) \").strip().lower()\n    return ConfirmResult(confirmed=(answer == \"y\"), tool_call=tool_call)\n\nasync def chat_loop(agent):\n    confirm = None\n    while True:\n        if confirm is None:                       # 1. 没有待交回的确认：读用户输入\n            text = input(\"\\n你：\").strip()\n            if text == \"/exit\":\n                break\n            inputs = UserMsg(name=\"user\", content=text)\n        else:                                     # 2. 有：这一轮把确认结果交回去\n            inputs = confirm\n            confirm = None\n\n        async for event in agent.reply_stream(inputs):\n            if event.type == EventType.REQUIRE_USER_CONFIRM:           # 3. 请用户确认\n                results = []\n                for tool_call in event.tool_calls:\n                    results.append(ask_user(tool_call))\n                confirm = UserConfirmResultEvent(reply_id=event.reply_id, confirm_results=results)\n            elif event.type == EventType.TEXT_BLOCK_DELTA:             # 普通文字：流式打印\n                print(event.delta, end=\"\", flush=True)\n        print()",
        "en": "from agentscope.event import ConfirmResult, EventType, UserConfirmResultEvent\nfrom agentscope.message import UserMsg\n\ndef ask_user(tool_call):\n    \"\"\"Ask in the terminal: allow this tool call?\"\"\"\n    print(f\"\\n[confirm] {tool_call.name}  {tool_call.input}\")\n    answer = input(\"Allow? (y/n) \").strip().lower()\n    return ConfirmResult(confirmed=(answer == \"y\"), tool_call=tool_call)\n\nasync def chat_loop(agent):\n    confirm = None\n    while True:\n        if confirm is None:                       # 1. nothing to hand back: read the user's input\n            text = input(\"\\nYou: \").strip()\n            if text == \"/exit\":\n                break\n            inputs = UserMsg(name=\"user\", content=text)\n        else:                                     # 2. something to hand back: send it this round\n            inputs = confirm\n            confirm = None\n\n        async for event in agent.reply_stream(inputs):\n            if event.type == EventType.REQUIRE_USER_CONFIRM:           # 3. please confirm\n                results = []\n                for tool_call in event.tool_calls:\n                    results.append(ask_user(tool_call))\n                confirm = UserConfirmResultEvent(reply_id=event.reply_id, confirm_results=results)\n            elif event.type == EventType.TEXT_BLOCK_DELTA:             # ordinary text: stream it\n                print(event.delta, end=\"\", flush=True)\n        print()"
      }
    },
    {
      "t": "p",
      "zh": "用到的几样东西：\n\n| 名字 | 是什么 |\n|---|---|\n| `event.tool_calls` | 等确认的工具调用列表，每个有 `name`（工具名）和 `input`（参数，JSON 字符串） |\n| `ConfirmResult(confirmed=..., tool_call=...)` | 对一个调用的答复：`True` 允许，`False` 拒绝 |\n| `UserConfirmResultEvent(reply_id=..., confirm_results=[...])` | 把所有答复打包交回；`reply_id` 用确认事件自带的 `event.reply_id` |\n\n被拒绝的调用不会执行，模型会收到「被用户拒绝」的工具结果，再决定怎么回答。",
      "en": "The pieces involved:\n\n| Name | What it is |\n|---|---|\n| `event.tool_calls` | The tool calls waiting for confirmation; each has `name` (tool name) and `input` (arguments as a JSON string) |\n| `ConfirmResult(confirmed=..., tool_call=...)` | The answer for one call: `True` allows, `False` denies |\n| `UserConfirmResultEvent(reply_id=..., confirm_results=[...])` | All answers packed together; `reply_id` comes from the confirm event's own `event.reply_id` |\n\nA denied call never runs: the model receives a “denied by the user” tool result and decides how to answer."
    },
    {
      "t": "note",
      "zh": "补充（视频没讲）：\n- 不用流式时：`await agent.reply(...)` 返回后，用 `agent.state.get_awaiting_tool_calls(agent.name)` 取出等确认的调用，答复后用 `await agent.reply(UserConfirmResultEvent(reply_id=agent.state.reply_id, confirm_results=...))` 继续，循环到没有等确认的调用为止。练习文件 `l18_workspace_demo.py` 用的就是这种写法。\n- 想「以后都允许」：`ConfirmResult(confirmed=True, tool_call=tool_call, rules=tool_call.suggested_rules)`，框架会把建议的规则加进允许规则。\n- 只想快速试用：15 节的 `launch_console(agent)` 会自动处理确认，在终端里问你 y/N。",
      "en": "Extra (not in the video):\n- Without streaming: after `await agent.reply(...)` returns, get the waiting calls with `agent.state.get_awaiting_tool_calls(agent.name)`, answer them, and resume with `await agent.reply(UserConfirmResultEvent(reply_id=agent.state.reply_id, confirm_results=...))`, looping until nothing is waiting. The practice file `l18_workspace_demo.py` uses this style.\n- For “always allow”: `ConfirmResult(confirmed=True, tool_call=tool_call, rules=tool_call.suggested_rules)` – the framework adds the suggested rules to the allow rules.\n- Just trying an agent out: `launch_console(agent)` from lesson 15 handles confirmations and asks y/N in the terminal."
    },
    {
      "t": "check",
      "q": {
        "zh": "收到 `REQUIRE_USER_CONFIRM` 事件、问完用户之后，下一次交给 `agent.reply_stream(...)` 的应该是什么？",
        "en": "After a `REQUIRE_USER_CONFIRM` event and asking the user, what do you pass to the next `agent.reply_stream(...)`?"
      },
      "options": [
        {
          "zh": "再发一遍原来的用户消息",
          "en": "The original user message again"
        },
        {
          "zh": "一个字符串 \"y\"",
          "en": "The string \"y\""
        },
        {
          "zh": "`UserConfirmResultEvent(reply_id=event.reply_id, confirm_results=[ConfirmResult(...)])`",
          "en": "`UserConfirmResultEvent(reply_id=event.reply_id, confirm_results=[ConfirmResult(...)])`"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "要从暂停的地方接着跑，就得交回确认事件。这时再发一条新消息会开始一轮新的回复，而 Agent 还在等确认，会直接报错。",
        "en": "Resuming the paused reply needs the confirmation event. A new message would start a new reply while the agent is still waiting, which raises an error."
      }
    },
    {
      "t": "h",
      "zh": "八、视频里的三次测试",
      "en": "8. The video's three test runs"
    },
    {
      "t": "p",
      "zh": "[▶ 15:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=946) 老师把同一个程序改了三次设置来跑：\n\n| 测试 | 设置 | 结果 |\n|---|---|---|\n| 1 | 全局模式改成「什么都问」（`DEFAULT`） | [▶ 16:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=978) 模型想先调一个工具确认工作目录在不在，被拦下来问；同意后调用加法，又问一次 |\n| 2 | 把加法工具写进 `deny_rules` | [▶ 17:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=1022) 调用直接被拒绝 |\n| 3 | 靠工具自己的检查 | [▶ 17:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=1057) 两个数都大于 1 万时弹出询问；都小于 1 万时直接执行 |\n\n练习文件 `l18_permission_solution.py` 就是这个完整程序，可以复现三次测试：把开头的 `MODE` 改成 `PermissionMode.DEFAULT` 是测试 1，把 `DENY_ADD` 改成 `True` 是测试 2，保持原样（`ACCEPT_EDITS`）就是测试 3。注意测试 1 在 2.0.9 里的细节：PowerShell 命令、写文件都会先问（只有允许规则点名的「工作空间里的 .txt」例外），但加法由工具自己的检查定案——小数字返回 ALLOW 就直接执行，只有两个数都大于 1 万才问（离线实测）；想让小数字的加法也问，就给 `add` 加一条询问规则。视频里的版本可能更早，行为细节不完全一样，以你本机的运行结果为准。下面是用 DeepSeek 实测测试 3 的输出（4 次模型调用）：",
      "en": "[▶ 15:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=946) The instructor runs the same program with three different settings:\n\n| Test | Setting | Result |\n|---|---|---|\n| 1 | Global mode set to “ask about everything” (`DEFAULT`) | [▶ 16:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=978) The model first wants a tool to check that the working directory exists and is stopped with a question; after approval it calls the add tool and is asked again |\n| 2 | The add tool put into `deny_rules` | [▶ 17:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=1022) The call is denied outright |\n| 3 | Relying on the tool's own check | [▶ 17:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=19&t=1057) Both numbers above 10,000 → a question; both below → it just runs |\n\nThe practice file `l18_permission_solution.py` is this full program and reproduces all three: set `MODE` at the top to `PermissionMode.DEFAULT` for test 1, set `DENY_ADD` to `True` for test 2, and leave it as is (`ACCEPT_EDITS`) for test 3. One 2.0.9 detail for test 1: PowerShell commands and file writes ask first (except the “.txt inside the workspace” that the allow rule names), but the add call is settled by the tool's own check – small numbers return ALLOW and run straight away, and only two numbers above 10,000 trigger a question (tested offline); to make small additions ask too, add an ask rule for `add`. The video may use an earlier version whose details differ, so trust what your own machine shows. Here is test 3 run with DeepSeek (4 model calls):"
    },
    {
      "t": "code",
      "file": {
        "zh": "实测输出（测试 3）",
        "en": "Real output (test 3, translated)"
      },
      "lang": "text",
      "code": {
        "zh": "模式 / mode: accept_edits | DENY_ADD: False | /exit 退出 quit\n\n你 / You: 帮我算 3 + 4\nFriday: 3 + 4 = 7\n\n你 / You: 帮我算 20000 + 30000\nFriday:\n[需要确认 / confirm] add  {\"a\": 20000, \"b\": 30000}\n允许吗？ y=允许 allow / n=拒绝 deny: y\n\nFriday: 20000 + 30000 = 50000",
        "en": "mode: accept_edits | DENY_ADD: False | /exit to quit\n\nYou: Work out 3 + 4 for me\nFriday: 3 + 4 = 7\n\nYou: Work out 20000 + 30000 for me\nFriday:\n[confirm] add  {\"a\": 20000, \"b\": 30000}\nAllow? y = allow / n = deny: y\n\nFriday: 20000 + 30000 = 50000"
      }
    },
    {
      "t": "p",
      "zh": "本节的练习文件（都只在 `practice\\data\\` 下面的文件夹里写东西）：\n- `l18_permission_todo.py`：上面的完整程序挖掉 4 处——工具的检查方法、工具的执行方法、一条拒绝规则、确认事件的处理。**这几处是本节要能手写的部分。**\n- `l18_permission_solution.py`：参考答案，开头两个开关可以复现视频的三次测试。\n- `l18_workspace_demo.py`（补充）：工作空间的内置工具 + `ACCEPT_EDITS` + 禁止读 `*.env`，确认部分用不带流式的写法。试着让它在工作空间里建文件（自动放行）、用 PowerShell 列文件（会问你）、读 `secret.env`（被规则拒绝）。",
      "en": "This lesson's practice files (they only ever write inside folders under `practice\\data\\`):\n- `l18_permission_todo.py`: the full program above with 4 gaps – the tool's check method, its call method, one deny rule and handling the confirm event. **These are the parts you should be able to write by hand.**\n- `l18_permission_solution.py`: the solution; two switches at the top reproduce the video's three tests.\n- `l18_workspace_demo.py` (extra): the workspace's built-in tools + `ACCEPT_EDITS` + a rule denying reads of `*.env`, with the non-streaming confirmation style. Ask it to create a file in the workspace (allowed automatically), list files with PowerShell (asks you) and read `secret.env` (denied by the rule)."
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "视频讲了工作空间的四个好处，下面哪一项**不在**其中？",
        "en": "The video gives four benefits of a workspace. Which of these is **not** one of them?"
      },
      "options": [
        {
          "zh": "环境隔离，让 Agent 专注于相关信息",
          "en": "Isolation, so the agent focuses on relevant information"
        },
        {
          "zh": "资源与权限管理，保护重要文件",
          "en": "Resource and permission control that protects important files"
        },
        {
          "zh": "让模型回答得更快、更准",
          "en": "Making the model answer faster and more accurately"
        },
        {
          "zh": "临时 Agent 的生命周期管理",
          "en": "Lifecycle management for temporary agents"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "四个好处是：隔离专注、资源与权限管理、协作有序、生命周期管理。工作空间不影响模型本身的速度和准确度。",
        "en": "The four are isolation and focus, resource and permission control, orderly collaboration, and lifecycle management. A workspace doesn't change the model's speed or accuracy."
      }
    },
    {
      "q": {
        "zh": "想让 Agent 用上工作空间自带的工具，并把工作空间分给它，应该怎么写？",
        "en": "How do you give an agent the workspace's built-in tools and assign the workspace to it?"
      },
      "options": [
        {
          "zh": "`Agent(..., workspace=workspace)` 就够了",
          "en": "`Agent(..., workspace=workspace)` is enough"
        },
        {
          "zh": "`Toolkit(tools=await workspace.list_tools())` 交给 `toolkit=`，再写 `offloader=workspace`",
          "en": "Pass `Toolkit(tools=await workspace.list_tools())` as `toolkit=`, plus `offloader=workspace`"
        },
        {
          "zh": "把文件夹路径写进 `system_prompt`",
          "en": "Put the folder path into `system_prompt`"
        },
        {
          "zh": "`await workspace.initialize()` 会自动把工具装进所有 Agent",
          "en": "`await workspace.initialize()` installs the tools into every agent automatically"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "工具要自己用 `list_tools()` 取出来放进 `Toolkit`；`offloader=workspace` 把工作空间分给这个 Agent。`Agent` 没有 `workspace` 参数。",
        "en": "You fetch the tools with `list_tools()` and put them into a `Toolkit` yourself; `offloader=workspace` assigns the workspace. `Agent` has no `workspace` parameter."
      }
    },
    {
      "q": {
        "zh": "每天凌晨自动运行、没人在电脑前的定时任务，最适合哪种模式？",
        "en": "A scheduled job runs every night with nobody at the computer. Which mode fits best?"
      },
      "options": [
        {
          "zh": "`DEFAULT`",
          "en": "`DEFAULT`"
        },
        {
          "zh": "`BYPASS`",
          "en": "`BYPASS`"
        },
        {
          "zh": "`EXPLORE`",
          "en": "`EXPLORE`"
        },
        {
          "zh": "`DONT_ASK`",
          "en": "`DONT_ASK`"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "没人能回答询问，`DONT_ASK` 把所有「问」都变成「拒绝」，安全又不会卡住。`BYPASS` 会跳过检查，只适合完全可信的沙箱；`DEFAULT` 会一直停着等人。",
        "en": "Nobody can answer, so `DONT_ASK` turns every ask into a deny: safe and never stuck. `BYPASS` skips the checks and belongs in a fully trusted sandbox; `DEFAULT` would sit waiting forever."
      }
    },
    {
      "q": {
        "zh": "自定义工具继承了 `ToolBase`，却写了 `is_read_only = True`。它的 `check_permissions` 会怎样？",
        "en": "A custom `ToolBase` tool sets `is_read_only = True`. What happens to its `check_permissions`?"
      },
      "options": [
        {
          "zh": "不会被调用：只读调用在前面就直接放行了",
          "en": "It is never called: read-only calls are allowed before it"
        },
        {
          "zh": "每次调用前照常运行",
          "en": "It runs before every call as usual"
        },
        {
          "zh": "只在 `DEFAULT` 模式下运行",
          "en": "It only runs in `DEFAULT` mode"
        },
        {
          "zh": "程序报错，提示两者冲突",
          "en": "The program raises an error about the conflict"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "检查顺序里「只读放行」排在「工具自己的检查」前面，所以要靠 `check_permissions` 把关的工具必须写 `is_read_only = False`。",
        "en": "“Read-only → allow” comes before the tool's own check, so a tool that relies on `check_permissions` must set `is_read_only = False`."
      }
    },
    {
      "q": {
        "zh": "`deny_rules` 里有一条 `add` 的规则（`rule_content=\"\"`），而 `AddTool.check_permissions` 对 3 + 4 返回 `ALLOW`。Agent 调用 `add(3, 4)` 时会怎样？",
        "en": "`deny_rules` has a rule for `add` (`rule_content=\"\"`), while `AddTool.check_permissions` returns `ALLOW` for 3 + 4. What happens when the agent calls `add(3, 4)`?"
      },
      "options": [
        {
          "zh": "执行，因为工具自己允许了",
          "en": "It runs, because the tool allowed it"
        },
        {
          "zh": "暂停问用户",
          "en": "It pauses to ask the user"
        },
        {
          "zh": "被拒绝，因为拒绝规则最先检查",
          "en": "It is denied, because deny rules are checked first"
        },
        {
          "zh": "报错，规则内容不能为空",
          "en": "An error: rule content can't be empty"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "拒绝规则在第 1 步，工具的检查在第 4 步，根本轮不到。这正是视频第 2 次测试的效果。空字符串表示匹配这个工具的所有调用。",
        "en": "Deny rules are step 1 and the tool's check is step 4, so it never gets a say – exactly the video's second test. An empty string matches every call of the tool."
      }
    },
    {
      "q": {
        "zh": "把 `PermissionRule(tool_name=\"add\", rule_content=\"\", behavior=PermissionBehavior.ASK, source=\"userSettings\")` 放进 `ask_rules`，效果是？",
        "en": "What does putting `PermissionRule(tool_name=\"add\", rule_content=\"\", behavior=PermissionBehavior.ASK, source=\"userSettings\")` into `ask_rules` do?"
      },
      "options": [
        {
          "zh": "只有参数为空时才问",
          "en": "It asks only when the arguments are empty"
        },
        {
          "zh": "`add` 的每次调用都要问用户",
          "en": "Every `add` call asks the user"
        },
        {
          "zh": "规则无效，必须写匹配内容",
          "en": "Nothing – a rule needs a pattern"
        },
        {
          "zh": "`add` 永远被拒绝",
          "en": "`add` is always denied"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "`rule_content` 为空字符串（或 `None`）表示这个工具的所有调用；询问规则排在第 2 步，连工具自己的 ALLOW 都轮不到。",
        "en": "An empty `rule_content` (or `None`) matches every call of the tool; ask rules are step 2, ahead of even the tool's own ALLOW."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "会自己检查权限的加法工具",
        "en": "An add tool that checks its own permission"
      },
      "code": {
        "zh": "class AddTool([[ToolBase]]):\n    name = \"add\"\n    description = \"计算两个数的和。\"\n    input_schema = {\"type\": \"object\",\n                    \"properties\": {\"a\": {\"type\": \"number\"}, \"b\": {\"type\": \"number\"}},\n                    \"required\": [\"a\", \"b\"]}\n    is_concurrency_safe = True\n    is_read_only = [[False]]\n\n    async def [[check_permissions]](self, tool_input, context):\n        a = tool_input.get(\"a\")\n        b = tool_input.get(\"b\")\n        if a > 10000 and b > 10000:\n            return [[PermissionDecision]](behavior=PermissionBehavior.[[ASK]], message=\"两个数都大于 1 万，确认吗？\")\n        return PermissionDecision(behavior=PermissionBehavior.[[ALLOW]], message=\"加法操作已允许\")\n\n    async def [[call]](self, a, b):\n        return [[ToolChunk]](content=[ [[TextBlock]](text=f\"{a} + {b} = {a + b}\") ])",
        "en": "class AddTool([[ToolBase]]):\n    name = \"add\"\n    description = \"Add two numbers.\"\n    input_schema = {\"type\": \"object\",\n                    \"properties\": {\"a\": {\"type\": \"number\"}, \"b\": {\"type\": \"number\"}},\n                    \"required\": [\"a\", \"b\"]}\n    is_concurrency_safe = True\n    is_read_only = [[False]]\n\n    async def [[check_permissions]](self, tool_input, context):\n        a = tool_input.get(\"a\")\n        b = tool_input.get(\"b\")\n        if a > 10000 and b > 10000:\n            return [[PermissionDecision]](behavior=PermissionBehavior.[[ASK]], message=\"Both exceed 10000 - go ahead?\")\n        return PermissionDecision(behavior=PermissionBehavior.[[ALLOW]], message=\"Addition allowed\")\n\n    async def [[call]](self, a, b):\n        return [[ToolChunk]](content=[ [[TextBlock]](text=f\"{a} + {b} = {a + b}\") ])"
      },
      "explain": {
        "zh": "继承 `ToolBase`；带检查的工具 `is_read_only` 必须是 `False`；`check_permissions` 返回 `PermissionDecision`（ASK 或 ALLOW）；`call` 返回 `ToolChunk`，`content` 是装着 `TextBlock` 的列表。",
        "en": "Inherit `ToolBase`; a tool with a check keeps `is_read_only` `False`; `check_permissions` returns a `PermissionDecision` (ASK or ALLOW); `call` returns a `ToolChunk` whose `content` is a list holding a `TextBlock`."
      }
    },
    {
      "title": {
        "zh": "工作空间 + 权限上下文",
        "en": "Workspace + permission context"
      },
      "code": {
        "zh": "async def main():\n    workspace = LocalWorkspace(workdir=\"data/l18_workspace\")\n    await workspace.[[initialize]]()\n    tools = await workspace.[[list_tools]]()\n    tools.append(AddTool())\n\n    context = [[PermissionContext]](\n        mode=PermissionMode.[[ACCEPT_EDITS]],           # 工作目录里的编辑自动放行\n        [[deny_rules]]={\"Read\": [PermissionRule(tool_name=\"Read\", rule_content=\"[[*.env]]\",\n                                            behavior=PermissionBehavior.[[DENY]], source=\"userSettings\")]},\n    )\n    agent = Agent(name=\"Friday\", system_prompt=\"...\", model=model,\n                  toolkit=[[Toolkit]](tools=tools),\n                  [[offloader]]=workspace,\n                  state=[[AgentState]](permission_context=context))",
        "en": "async def main():\n    workspace = LocalWorkspace(workdir=\"data/l18_workspace\")\n    await workspace.[[initialize]]()\n    tools = await workspace.[[list_tools]]()\n    tools.append(AddTool())\n\n    context = [[PermissionContext]](\n        mode=PermissionMode.[[ACCEPT_EDITS]],           # edits in the working directory go through\n        [[deny_rules]]={\"Read\": [PermissionRule(tool_name=\"Read\", rule_content=\"[[*.env]]\",\n                                            behavior=PermissionBehavior.[[DENY]], source=\"userSettings\")]},\n    )\n    agent = Agent(name=\"Friday\", system_prompt=\"...\", model=model,\n                  toolkit=[[Toolkit]](tools=tools),\n                  [[offloader]]=workspace,\n                  state=[[AgentState]](permission_context=context))"
      },
      "explain": {
        "zh": "工作空间先 `initialize()` 再 `list_tools()`；模式和规则放进 `PermissionContext`，通过 `AgentState` 交给 Agent；`offloader=workspace` 把工作空间分给它。",
        "en": "Call the workspace's `initialize()`, then `list_tools()`; the mode and rules go into a `PermissionContext`, handed over through `AgentState`; `offloader=workspace` assigns the workspace."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：会自己检查权限的加法工具",
        "en": "Write it: an add tool that checks its own permission"
      },
      "task": {
        "zh": "不看上面的代码，写一个继承 `ToolBase` 的类 `AddTool`：\n- 类属性：`name`、`description`、`input_schema`（`a`、`b` 都是 number，都必填）、`is_concurrency_safe = True`、`is_read_only = False`\n- `async def check_permissions(self, tool_input, context)`：两个数都大于 10000 返回 `ASK` 的 `PermissionDecision`，否则返回 `ALLOW` 的\n- `async def call(self, a, b)`：返回 `ToolChunk`，`content` 是装着 `TextBlock` 的列表\n\n写完可以对照 `practice/l18_permission_todo.py` 的 TODO 1、2，放进去用真实模型试。",
        "en": "Without looking above, write a class `AddTool` that inherits `ToolBase`:\n- Class attributes: `name`, `description`, `input_schema` (`a` and `b` both numbers, both required), `is_concurrency_safe = True`, `is_read_only = False`\n- `async def check_permissions(self, tool_input, context)`: return an `ASK` `PermissionDecision` when both numbers exceed 10000, otherwise an `ALLOW` one\n- `async def call(self, a, b)`: return a `ToolChunk` whose `content` is a list holding a `TextBlock`\n\nThen compare with TODO 1 and 2 in `practice/l18_permission_todo.py` and try it with the real model."
      },
      "starter": {
        "zh": "from agentscope.message import TextBlock\nfrom agentscope.permission import PermissionBehavior, PermissionDecision\nfrom agentscope.tool import ToolBase, ToolChunk\n\n# 1. 定义类 AddTool，继承工具基类\n#    类属性：工具名、描述、参数说明（a、b 两个数字，都必填）、可以并发、不是只读\n\n# 2. 检查方法：取出 a 和 b；两个都大于 10000 就要求询问，否则允许\n\n# 3. 执行方法：算出 a + b，用 ToolChunk 返回（结果文字装在 TextBlock 里）",
        "en": "from agentscope.message import TextBlock\nfrom agentscope.permission import PermissionBehavior, PermissionDecision\nfrom agentscope.tool import ToolBase, ToolChunk\n\n# 1. Define a class AddTool that inherits the tool base class\n#    Class attributes: name, description, parameter schema (numbers a and b, both required), concurrency-safe, not read-only\n\n# 2. The check method: get a and b; if both exceed 10000 ask, otherwise allow\n\n# 3. The call method: compute a + b and return it in a ToolChunk (the text inside a TextBlock)"
      },
      "solution": {
        "zh": "from agentscope.message import TextBlock\nfrom agentscope.permission import PermissionBehavior, PermissionDecision\nfrom agentscope.tool import ToolBase, ToolChunk\n\n\nclass AddTool(ToolBase):\n    name = \"add\"\n    description = \"计算两个数的和。\"\n    input_schema = {\n        \"type\": \"object\",\n        \"properties\": {\n            \"a\": {\"type\": \"number\", \"description\": \"第一个数字\"},\n            \"b\": {\"type\": \"number\", \"description\": \"第二个数字\"},\n        },\n        \"required\": [\"a\", \"b\"],\n    }\n    is_concurrency_safe = True\n    is_read_only = False\n\n    async def check_permissions(self, tool_input, context):\n        a = tool_input.get(\"a\")\n        b = tool_input.get(\"b\")\n        if a > 10000 and b > 10000:\n            return PermissionDecision(behavior=PermissionBehavior.ASK,\n                                      message=\"两个数都大于 1 万，确认要计算吗？\")\n        return PermissionDecision(behavior=PermissionBehavior.ALLOW, message=\"加法操作已允许\")\n\n    async def call(self, a, b):\n        return ToolChunk(content=[TextBlock(text=f\"{a} + {b} = {a + b}\")])",
        "en": "from agentscope.message import TextBlock\nfrom agentscope.permission import PermissionBehavior, PermissionDecision\nfrom agentscope.tool import ToolBase, ToolChunk\n\n\nclass AddTool(ToolBase):\n    name = \"add\"\n    description = \"Add two numbers.\"\n    input_schema = {\n        \"type\": \"object\",\n        \"properties\": {\n            \"a\": {\"type\": \"number\", \"description\": \"the first number\"},\n            \"b\": {\"type\": \"number\", \"description\": \"the second number\"},\n        },\n        \"required\": [\"a\", \"b\"],\n    }\n    is_concurrency_safe = True\n    is_read_only = False\n\n    async def check_permissions(self, tool_input, context):\n        a = tool_input.get(\"a\")\n        b = tool_input.get(\"b\")\n        if a > 10000 and b > 10000:\n            return PermissionDecision(behavior=PermissionBehavior.ASK,\n                                      message=\"Both numbers exceed 10000 - go ahead?\")\n        return PermissionDecision(behavior=PermissionBehavior.ALLOW, message=\"Addition allowed\")\n\n    async def call(self, a, b):\n        return ToolChunk(content=[TextBlock(text=f\"{a} + {b} = {a + b}\")])"
      },
      "checks": [
        {
          "zh": "定义了继承 `ToolBase` 的类",
          "en": "Defines a class inheriting `ToolBase`",
          "re": "class\\s+\\w+\\(\\s*ToolBase\\s*\\)\\s*:"
        },
        {
          "zh": "`input_schema` 的 `type` 是 `\"object\"`",
          "en": "`input_schema` has `type` `\"object\"`",
          "re": "input_schema\\s*=\\s*\\{[\\s\\S]*?[\"']type[\"']\\s*:\\s*[\"']object[\"']"
        },
        {
          "zh": "写了 `is_read_only = False`",
          "en": "Sets `is_read_only = False`",
          "re": "is_read_only\\s*=\\s*False"
        },
        {
          "zh": "定义了 `async def check_permissions(self, tool_input, context)`",
          "en": "Defines `async def check_permissions(self, tool_input, context)`",
          "re": "async\\s+def\\s+check_permissions\\s*\\(\\s*self\\s*,\\s*\\w+\\s*,\\s*\\w+\\s*\\)"
        },
        {
          "zh": "大于 10000 时返回 `PermissionBehavior.ASK`",
          "en": "Returns `PermissionBehavior.ASK` above 10000",
          "re": "10000[\\s\\S]*?PermissionDecision\\(\\s*behavior\\s*=\\s*PermissionBehavior\\.ASK"
        },
        {
          "zh": "其余情况返回 `PermissionBehavior.ALLOW`",
          "en": "Otherwise returns `PermissionBehavior.ALLOW`",
          "re": "return\\s+PermissionDecision\\(\\s*behavior\\s*=\\s*PermissionBehavior\\.ALLOW"
        },
        {
          "zh": "定义了 `async def call(self, a, b)`",
          "en": "Defines `async def call(self, a, b)`",
          "re": "async\\s+def\\s+call\\s*\\(\\s*self\\s*,"
        },
        {
          "zh": "返回 `ToolChunk(content=[TextBlock(...)])`",
          "en": "Returns `ToolChunk(content=[TextBlock(...)])`",
          "re": "ToolChunk\\(\\s*content\\s*=\\s*\\[\\s*TextBlock\\("
        }
      ]
    },
    {
      "title": {
        "zh": "手写：收到确认事件就问用户的对话循环",
        "en": "Write it: a chat loop that asks the user on a confirm event"
      },
      "task": {
        "zh": "不看上面的代码，写出两个函数：\n1. `ask_user(tool_call)`：打印工具名和参数，用 `input` 问 y/n，返回 `ConfirmResult`（`confirmed` 为用户是否输入 y）。\n2. `async def chat_loop(agent)`：变量 `confirm` 一开始是 `None`。循环里：`confirm` 为 `None` 就读用户输入（`/exit` 退出）并包成 `UserMsg`，否则把 `confirm` 当作这一轮的输入并清空；用 `async for` 遍历 `agent.reply_stream(...)`，遇到 `EventType.REQUIRE_USER_CONFIRM` 就对 `event.tool_calls` 逐个 `ask_user`，把结果打包成 `UserConfirmResultEvent`（`reply_id` 用 `event.reply_id`）存进 `confirm`；遇到 `EventType.TEXT_BLOCK_DELTA` 就打印 `event.delta`。\n\n写完对照 `practice/l18_permission_todo.py` 的 TODO 4。",
        "en": "Without looking above, write two functions:\n1. `ask_user(tool_call)`: print the tool name and input, ask y/n with `input`, return a `ConfirmResult` (`confirmed` = whether the user typed y).\n2. `async def chat_loop(agent)`: a variable `confirm` starts as `None`. In the loop: if `confirm` is `None`, read the user's input (`/exit` quits) and wrap it in a `UserMsg`; otherwise use `confirm` as this round's input and clear it. Go through `agent.reply_stream(...)` with `async for`; on `EventType.REQUIRE_USER_CONFIRM` run `ask_user` for each of `event.tool_calls` and pack the results into a `UserConfirmResultEvent` (`reply_id` = `event.reply_id`) stored in `confirm`; on `EventType.TEXT_BLOCK_DELTA` print `event.delta`.\n\nThen compare with TODO 4 in `practice/l18_permission_todo.py`."
      },
      "starter": {
        "zh": "from agentscope.event import ConfirmResult, EventType, UserConfirmResultEvent\nfrom agentscope.message import UserMsg\n\n# 1. ask_user(tool_call)：打印工具名和参数，问 y/n，返回答复对象\n\n\n# 2. 异步函数 chat_loop(agent)：\n#    「待交回的确认」一开始为空 → 循环：为空就读输入，否则把它当输入并清空 →\n#    遍历流式事件：请确认 → 逐个问用户、打包；文字片段 → 打印",
        "en": "from agentscope.event import ConfirmResult, EventType, UserConfirmResultEvent\nfrom agentscope.message import UserMsg\n\n# 1. ask_user(tool_call): print the tool name and input, ask y/n, return the answer object\n\n\n# 2. an async function chat_loop(agent):\n#    \"confirmation to hand back\" starts empty -> loop: if empty read input, else use it and clear it ->\n#    go through the streamed events: please-confirm -> ask about each and pack; text pieces -> print"
      },
      "solution": {
        "zh": "from agentscope.event import ConfirmResult, EventType, UserConfirmResultEvent\nfrom agentscope.message import UserMsg\n\n\ndef ask_user(tool_call):\n    print(f\"[需要确认] {tool_call.name}  {tool_call.input}\")\n    answer = input(\"允许吗？(y/n) \").strip().lower()\n    return ConfirmResult(confirmed=(answer == \"y\"), tool_call=tool_call)\n\n\nasync def chat_loop(agent):\n    confirm = None\n    while True:\n        if confirm is None:\n            text = input(\"你：\").strip()\n            if text == \"/exit\":\n                break\n            inputs = UserMsg(name=\"user\", content=text)\n        else:\n            inputs = confirm\n            confirm = None\n\n        async for event in agent.reply_stream(inputs):\n            if event.type == EventType.REQUIRE_USER_CONFIRM:\n                results = []\n                for tool_call in event.tool_calls:\n                    results.append(ask_user(tool_call))\n                confirm = UserConfirmResultEvent(reply_id=event.reply_id, confirm_results=results)\n            elif event.type == EventType.TEXT_BLOCK_DELTA:\n                print(event.delta, end=\"\", flush=True)\n        print()",
        "en": "from agentscope.event import ConfirmResult, EventType, UserConfirmResultEvent\nfrom agentscope.message import UserMsg\n\n\ndef ask_user(tool_call):\n    print(f\"[confirm] {tool_call.name}  {tool_call.input}\")\n    answer = input(\"Allow? (y/n) \").strip().lower()\n    return ConfirmResult(confirmed=(answer == \"y\"), tool_call=tool_call)\n\n\nasync def chat_loop(agent):\n    confirm = None\n    while True:\n        if confirm is None:\n            text = input(\"You: \").strip()\n            if text == \"/exit\":\n                break\n            inputs = UserMsg(name=\"user\", content=text)\n        else:\n            inputs = confirm\n            confirm = None\n\n        async for event in agent.reply_stream(inputs):\n            if event.type == EventType.REQUIRE_USER_CONFIRM:\n                results = []\n                for tool_call in event.tool_calls:\n                    results.append(ask_user(tool_call))\n                confirm = UserConfirmResultEvent(reply_id=event.reply_id, confirm_results=results)\n            elif event.type == EventType.TEXT_BLOCK_DELTA:\n                print(event.delta, end=\"\", flush=True)\n        print()"
      },
      "checks": [
        {
          "zh": "定义了 `ask_user(tool_call)`",
          "en": "Defines `ask_user(tool_call)`",
          "re": "def\\s+ask_user\\s*\\(\\s*\\w+\\s*\\)\\s*:"
        },
        {
          "zh": "返回 `ConfirmResult(confirmed=..., tool_call=...)`",
          "en": "Returns `ConfirmResult(confirmed=..., tool_call=...)`",
          "re": "ConfirmResult\\(\\s*confirmed\\s*=[\\s\\S]*?tool_call\\s*="
        },
        {
          "zh": "定义了 `async def chat_loop(agent)`",
          "en": "Defines `async def chat_loop(agent)`",
          "re": "async\\s+def\\s+chat_loop\\s*\\("
        },
        {
          "zh": "判断 `confirm is None`",
          "en": "Checks `confirm is None`",
          "re": "if\\s+\\w+\\s+is\\s+None\\s*:"
        },
        {
          "zh": "用 `async for` 遍历 `reply_stream(...)`",
          "en": "Uses `async for` over `reply_stream(...)`",
          "re": "async\\s+for\\s+\\w+\\s+in\\s+agent\\.reply_stream\\("
        },
        {
          "zh": "处理 `EventType.REQUIRE_USER_CONFIRM`",
          "en": "Handles `EventType.REQUIRE_USER_CONFIRM`",
          "re": "==\\s*EventType\\.REQUIRE_USER_CONFIRM"
        },
        {
          "zh": "遍历 `event.tool_calls`",
          "en": "Loops over `event.tool_calls`",
          "re": "for\\s+\\w+\\s+in\\s+\\w+\\.tool_calls"
        },
        {
          "zh": "打包 `UserConfirmResultEvent(reply_id=event.reply_id, ...)`",
          "en": "Packs `UserConfirmResultEvent(reply_id=event.reply_id, ...)`",
          "re": "UserConfirmResultEvent\\(\\s*reply_id\\s*=\\s*\\w+\\.reply_id\\s*,\\s*confirm_results\\s*="
        },
        {
          "zh": "打印 `TEXT_BLOCK_DELTA` 的 `delta`",
          "en": "Prints the `delta` of `TEXT_BLOCK_DELTA`",
          "re": "EventType\\.TEXT_BLOCK_DELTA[\\s\\S]*?print\\(\\s*\\w+\\.delta"
        }
      ]
    },
    {
      "title": {
        "zh": "手写：用集合写一个简化版权限判断",
        "en": "Write it: a simplified permission check with sets"
      },
      "task": {
        "zh": "用集合实现 `decide(tool_name, mode=\"default\")`：\n- `READ_ONLY` 包含 Read、Glob、Grep；`deny_rules` 包含 PowerShell；`allow_rules` 一开始是空集合\n- 判断顺序：在 `deny_rules` 里 → `\"deny\"`；在 `READ_ONLY` 里 → `\"allow\"`；`mode` 是 `\"explore\"` → `\"deny\"`；在 `allow_rules` 里 → `\"allow\"`；其余 → `\"ask\"`\n- 测试 Read、Write、`explore` 模式下的 Write、PowerShell；再把 Write 加进 `allow_rules`，测一次 Write。\n\n这个顺序和 AgentScope 的 EXPLORE 模式一致：只读的放行，允许规则也救不了修改操作。",
        "en": "Implement `decide(tool_name, mode=\"default\")` with sets:\n- `READ_ONLY` holds Read, Glob, Grep; `deny_rules` holds PowerShell; `allow_rules` starts as an empty set\n- Order: in `deny_rules` → `\"deny\"`; in `READ_ONLY` → `\"allow\"`; `mode` is `\"explore\"` → `\"deny\"`; in `allow_rules` → `\"allow\"`; otherwise → `\"ask\"`\n- Test Read, Write, Write in `explore` mode, PowerShell; then add Write to `allow_rules` and test Write once more.\n\nThis order matches AgentScope's EXPLORE mode: read-only goes through, and no allow rule can rescue a change."
      },
      "run": true,
      "starter": {
        "zh": "# 1. 三个集合：READ_ONLY = Read、Glob、Grep；deny_rules = PowerShell；allow_rules = 空集合\n\n\n# 2. 函数 decide：参数 tool_name 和 mode（默认值 \"default\"），按这个顺序返回 \"deny\" / \"allow\" / \"ask\"：\n#    在 deny_rules 里 → deny；在 READ_ONLY 里 → allow；mode 是 \"explore\" → deny；\n#    在 allow_rules 里 → allow；其余 → ask\n\n\n# 3. 测试：Read、Write、Write(explore)、PowerShell；把 Write 加进 allow_rules 后再测 Write",
        "en": "# 1. Three sets: READ_ONLY = Read, Glob, Grep; deny_rules = PowerShell; allow_rules = an empty set\n\n\n# 2. a function decide taking tool_name and mode (default \"default\"), returning \"deny\" / \"allow\" / \"ask\" in this order:\n#    a deny_rules member -> deny; a READ_ONLY member -> allow; mode is \"explore\" -> deny;\n#    an allow_rules member -> allow; anything else -> ask\n\n\n# 3. Test: Read, Write, Write(explore), PowerShell; then add Write to allow_rules and test Write again"
      },
      "solution": {
        "zh": "# 1. 三个集合\nREAD_ONLY = {\"Read\", \"Glob\", \"Grep\"}\ndeny_rules = {\"PowerShell\"}\nallow_rules = set()\n\n\n# 2. 按顺序判断\ndef decide(tool_name, mode=\"default\"):\n    if tool_name in deny_rules:\n        return \"deny\"\n    if tool_name in READ_ONLY:\n        return \"allow\"\n    if mode == \"explore\":\n        return \"deny\"\n    if tool_name in allow_rules:\n        return \"allow\"\n    return \"ask\"\n\n\n# 3. 测试\nprint(decide(\"Read\"))                    # allow\nprint(decide(\"Write\"))                   # ask\nprint(decide(\"Write\", mode=\"explore\"))   # deny\nprint(decide(\"PowerShell\"))              # deny\nallow_rules.add(\"Write\")\nprint(decide(\"Write\"))                   # allow",
        "en": "# 1. Three sets\nREAD_ONLY = {\"Read\", \"Glob\", \"Grep\"}\ndeny_rules = {\"PowerShell\"}\nallow_rules = set()\n\n\n# 2. Check in order\ndef decide(tool_name, mode=\"default\"):\n    if tool_name in deny_rules:\n        return \"deny\"\n    if tool_name in READ_ONLY:\n        return \"allow\"\n    if mode == \"explore\":\n        return \"deny\"\n    if tool_name in allow_rules:\n        return \"allow\"\n    return \"ask\"\n\n\n# 3. Test\nprint(decide(\"Read\"))                    # allow\nprint(decide(\"Write\"))                   # ask\nprint(decide(\"Write\", mode=\"explore\"))   # deny\nprint(decide(\"PowerShell\"))              # deny\nallow_rules.add(\"Write\")\nprint(decide(\"Write\"))                   # allow"
      },
      "checks": [
        {
          "zh": "`READ_ONLY` 是一个集合（花括号）",
          "en": "`READ_ONLY` is a set (curly braces)",
          "re": "^READ_ONLY\\s*=\\s*\\{"
        },
        {
          "zh": "`allow_rules` 用 `set()` 创建空集合",
          "en": "`allow_rules` is created with `set()`",
          "re": "^allow_rules\\s*=\\s*set\\(\\s*\\)"
        },
        {
          "zh": "定义了 `decide(tool_name, mode=\"default\")`",
          "en": "Defines `decide(tool_name, mode=\"default\")`",
          "re": "def\\s+decide\\s*\\(\\s*\\w+\\s*,\\s*mode\\s*=\\s*[\"']default[\"']\\s*\\)"
        },
        {
          "zh": "先判断 `in deny_rules`",
          "en": "Checks `in deny_rules` first",
          "re": "if\\s+\\w+\\s+in\\s+deny_rules\\s*:\\s*\\n\\s+return\\s+[\"']deny[\"']"
        },
        {
          "zh": "用 `in READ_ONLY` 判断只读",
          "en": "Uses `in READ_ONLY`",
          "re": "in\\s+READ_ONLY"
        },
        {
          "zh": "explore 模式拒绝修改",
          "en": "Denies changes in explore mode",
          "re": "mode\\s*==\\s*[\"']explore[\"']\\s*:\\s*\\n\\s+return\\s+[\"']deny[\"']"
        },
        {
          "zh": "默认返回 `\"ask\"`",
          "en": "Falls back to `\"ask\"`",
          "re": "return\\s+[\"']ask[\"']"
        },
        {
          "zh": "用 `.add(...)` 往 `allow_rules` 里加",
          "en": "Adds to `allow_rules` with `.add(...)`",
          "re": "allow_rules\\.add\\("
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "照着幻灯片抄代码，漏了 `from agentscope.permission import PermissionRule`（视频 08:21 特别提醒过），运行时报 `NameError`。",
      "en": "Copying the slide's code and missing `from agentscope.permission import PermissionRule` (the video warns about it at 08:21) – a `NameError` at run time."
    },
    {
      "zh": "带 `check_permissions` 的工具写了 `is_read_only = True`：只读调用直接放行，检查方法永远不会运行。",
      "en": "Setting `is_read_only = True` on a tool with `check_permissions`: read-only calls are allowed at once and the check never runs."
    },
    {
      "zh": "`check_permissions` 没写成 `async def`，或者返回 `True` / `False`。它必须是协程，并返回 `PermissionDecision`。",
      "en": "Writing `check_permissions` as a plain `def` instead of `async def`, or returning `True` / `False`. It must be a coroutine returning a `PermissionDecision`."
    },
    {
      "zh": "收到「请确认」后又发了一条新消息，而不是交回 `UserConfirmResultEvent`：Agent 还在等确认，会直接报 `ValueError`。",
      "en": "Sending a new message after a “please confirm” instead of handing back a `UserConfirmResultEvent`: the agent is still waiting and raises `ValueError`."
    },
    {
      "zh": "规则字典的键没和工具名写得一模一样（区分大小写）：键写成 `\"write\"`，而工具叫 `\"Write\"`，规则永远匹配不上——框架是按字典的键去找规则的（离线实测）。规则里的 `tool_name` 也写成同一个名字，别人读代码时不会糊涂。",
      "en": "A rule dict key that isn't spelled exactly like the tool name (case counts): with the key `\"write\"` and the tool called `\"Write\"`, the rule never matches – the framework looks rules up by the dict key (tested offline). Spell the rule's `tool_name` the same way too, so the code stays clear."
    },
    {
      "zh": "以为工作空间能拦住 Agent。`LocalWorkspace` 只是一个文件夹，它的 PowerShell / Bash 工具能碰到你能碰到的任何文件，边界要靠权限管理。",
      "en": "Expecting the workspace to hold the agent back. `LocalWorkspace` is just a folder; its PowerShell / Bash tool can reach any file you can, and the boundary comes from permission management."
    },
    {
      "zh": "用 `ACCEPT_EDITS` 却忘了当前目录也算工作目录：在哪个文件夹里运行脚本，哪个文件夹就能被自动改动。",
      "en": "Using `ACCEPT_EDITS` and forgetting that the current directory counts too: whatever folder you run from can be edited automatically."
    },
    {
      "zh": "允许规则写成 `\"*.txt\"` 这样宽泛的通配符：`*` 能跨过文件夹，Agent 往电脑上任何地方写 .txt 都不会再问。允许规则要把文件夹写进去，比如 `\"*/l18_workspace/*.txt\"`。",
      "en": "Writing a broad allow pattern such as `\"*.txt\"`: `*` crosses folders, so the agent may write .txt files anywhere on your computer without asking. Put the folder into allow rules, e.g. `\"*/l18_workspace/*.txt\"`."
    },
    {
      "zh": "想写空集合却写成 `{}`——那是空字典，`.add()` 会报错。空集合要写 `set()`。",
      "en": "Writing `{}` for an empty set – that is an empty dict and `.add()` fails. Use `set()`."
    }
  ],
  "recap": [
    {
      "zh": "工作空间 = 专门给 Agent 干活的地方：隔离专注、资源与权限管理、协作有序、生命周期管理；视频用 `LocalWorkspace`，`DockerWorkspace` / `E2BWorkspace` 才是沙箱。",
      "en": "A workspace is a dedicated place for the agent to work: isolation, resource and permission control, orderly collaboration, lifecycle management. The video uses `LocalWorkspace`; `DockerWorkspace` / `E2BWorkspace` are the sandboxes."
    },
    {
      "zh": "`LocalWorkspace(workdir=...)` → `await initialize()` → `await list_tools()` → `Toolkit(tools=工作空间工具 + 自己的工具)` → `Agent(..., offloader=workspace)`。",
      "en": "`LocalWorkspace(workdir=...)` → `await initialize()` → `await list_tools()` → `Toolkit(tools=workspace tools + your tools)` → `Agent(..., offloader=workspace)`."
    },
    {
      "zh": "工作空间不管权限。权限三层：全局模式、精细化规则、工具自己的 `check_permissions`；结论只有 ALLOW / DENY / ASK，ASK 会让回复暂停。",
      "en": "Workspaces don't enforce permissions. Three layers do: the global mode, fine-grained rules and the tool's own `check_permissions`; the result is ALLOW / DENY / ASK, and ASK pauses the reply."
    },
    {
      "zh": "5 种模式：DEFAULT（最稳妥）、ACCEPT_EDITS（工作目录里随便改）、EXPLORE（只读）、BYPASS（只在可信沙箱里用）、DONT_ASK（无人值守，询问变拒绝）。",
      "en": "Five modes: DEFAULT (safest), ACCEPT_EDITS (edit freely in the working directory), EXPLORE (read-only), BYPASS (trusted sandboxes only), DONT_ASK (unattended; ask becomes deny)."
    },
    {
      "zh": "规则是「工具名 → [PermissionRule(...)]」的字典，`rule_content` 为空表示所有调用；拒绝规则最先检查；权限上下文通过 `AgentState(permission_context=...)` 交给 Agent。",
      "en": "Rules are dicts of “tool name → [PermissionRule(...)]”; an empty `rule_content` matches every call; deny rules are checked first; the permission context reaches the agent through `AgentState(permission_context=...)`."
    },
    {
      "zh": "自定义检查：继承 `ToolBase`，写好 `name` / `description` / `input_schema` / `is_concurrency_safe` / `is_read_only = False`，`check_permissions` 返回 `PermissionDecision`，`call` 返回 `ToolChunk`。",
      "en": "A custom check: inherit `ToolBase`, set `name` / `description` / `input_schema` / `is_concurrency_safe` / `is_read_only = False`; `check_permissions` returns a `PermissionDecision`, `call` returns a `ToolChunk`."
    },
    {
      "zh": "确认循环：`REQUIRE_USER_CONFIRM` → 逐个问用户得到 `ConfirmResult` → `UserConfirmResultEvent(reply_id=event.reply_id, ...)` → 下一轮交回。",
      "en": "The confirm loop: `REQUIRE_USER_CONFIRM` → ask about each call to get `ConfirmResult`s → `UserConfirmResultEvent(reply_id=event.reply_id, ...)` → hand it back next round."
    }
  ],
  "files": [
    {
      "path": "practice/l18_permission_todo.py",
      "zh": "练习：补全 4 个 TODO（工具的检查方法、执行方法、一条拒绝规则、确认事件的处理）。",
      "en": "Exercise: complete 4 TODOs (the tool's check method, its call method, one deny rule, handling the confirm event)."
    },
    {
      "path": "practice/l18_permission_solution.py",
      "zh": "参考答案：视频的完整程序——工作空间 + 三层权限 + 加法工具 + 流式确认循环；开头的 `MODE`、`DENY_ADD` 可复现视频的三次测试。",
      "en": "Solution: the video's full program – workspace + three permission layers + add tool + streaming confirm loop; `MODE` and `DENY_ADD` at the top reproduce the video's three tests."
    },
    {
      "path": "practice/l18_workspace_demo.py",
      "zh": "补充演示：工作空间内置工具 + `ACCEPT_EDITS` + 禁止读 `*.env` 的规则，用不带流式的写法处理确认。",
      "en": "Extra demo: the workspace's built-in tools + `ACCEPT_EDITS` + a rule denying reads of `*.env`, handling confirmations without streaming."
    }
  ]
});
