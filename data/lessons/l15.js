COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  id: "l15",
  priority: "important",
  handwrite: true,
  studyMinutes: 35,
  source: "subtitle",
  summary: {
    zh: "AgentScope 2.0 入门：认识它的四个基本要素——消息（`Msg` 和里面的内容块）、模型（`OpenAIChatModel` + 凭证）、智能体（`Agent`）和事件（Event），然后跟着视频写两个聊天智能体：一个等整段回答生成完再打印，一个用 `reply_stream` 一边生成一边打印。",
    en: "Getting started with AgentScope 2.0: its four basic elements – the message (`Msg` and the content blocks inside it), the model (`OpenAIChatModel` + a credential), the agent (`Agent`) and events – then, following the video, two chat agents: one prints the answer after it is fully generated, the other prints it while it is generated with `reply_stream`.",
  },
  goals: [
    { zh: "说出 AgentScope 是什么、怎么安装，以及「用户输入 → Msg → 智能体 → 大模型 → Msg → 用户」这条消息流", en: "Say what AgentScope is, how to install it, and trace the flow “user input → Msg → agent → LLM → Msg → user”" },
    { zh: "用 `Msg` + `TextBlock` 打包一条消息，知道 `role` 只能是 user / assistant / system", en: "Wrap a message with `Msg` + `TextBlock`, knowing that `role` can only be user / assistant / system" },
    { zh: "用 `OpenAICredential`（key + 地址）和 `OpenAIChatModel` 连上 DeepSeek，理解这里的「OpenAI」指的是接口标准", en: "Connect to DeepSeek with `OpenAICredential` (key + address) and `OpenAIChatModel`, understanding that “OpenAI” here means the API standard" },
    { zh: "用 `Agent(name, system_prompt, model)` 创建智能体，写出 `await agent.reply(...)` 的多轮聊天循环", en: "Create an agent with `Agent(name, system_prompt, model)` and write a multi-turn chat loop with `await agent.reply(...)`" },
    { zh: "用 `async for event in agent.reply_stream(...)` 流式打印，分得清思考片段和回答片段", en: "Stream the output with `async for event in agent.reply_stream(...)` and tell thinking pieces from answer pieces" },
  ],
  blocks: [
    { t: "h", zh: "一、AgentScope 是什么，怎么安装", en: "1. What AgentScope is and how to install it" },
    {
      t: "p",
      zh: "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=16&t=0) 从这一集开始，课程换到第二个框架 **AgentScope**。它是阿里巴巴通义实验室开源的多智能体开发框架，面向真正上线的应用；视频讲的是 2026 年发布的 **2.0** 版本。老师列出的优点大致是：上手快，几分钟就能搭出一个简单的智能体；能和常见的模型、工具生态对接；编排方式灵活；从部署到运行监控都有支持；运行过程看得见、管得住。\n\n[▶ 00:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=16&t=50) 安装有两种方式：直接 `pip install agentscope`，或者用 git 克隆官方仓库，进入文件夹后 `pip install -e .`。本课程的 `.venv` 里已经装好了 **AgentScope 2.0.9**，不用再装。",
      en: "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=16&t=0) From this episode on, the course moves to its second framework, **AgentScope**: an open-source multi-agent framework from Alibaba's Tongyi Lab, aimed at applications that really go into production. The video covers version **2.0**, released in 2026. The instructor's list of strengths is roughly: quick to start (a simple agent in minutes), connects to the usual model and tool ecosystem, flexible orchestration, support from deployment through monitoring, and a run you can see into and keep under control.\n\n[▶ 00:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=16&t=50) Two ways to install: `pip install agentscope`, or clone the official repository with git, enter the folder and run `pip install -e .`. The course's `.venv` already has **AgentScope 2.0.9**, so there is nothing to install.",
    },
    {
      t: "warn",
      zh: "网上很多 AgentScope 教程是 **1.x** 的写法：`ReActAgent`、`InMemoryMemory`（整个 `agentscope.memory` 模块）、`toolkit.register_tool_function`、`agentscope.init(...)`，还会给智能体传 `formatter=`、`memory=`。这些在 2.0.9 里都没有了，照抄会报 `ImportError` / `AttributeError` / `TypeError`。看到这些写法，就说明那份资料是旧版本的。本课代码都在 2.0.9 上实际运行过。",
      en: "Many AgentScope tutorials online use the **1.x** API: `ReActAgent`, `InMemoryMemory` (the whole `agentscope.memory` module), `toolkit.register_tool_function`, `agentscope.init(...)`, and they pass `formatter=` and `memory=` to the agent. None of this exists in 2.0.9; copying it gives `ImportError` / `AttributeError` / `TypeError`. If you see these patterns, the material is for the old version. All code in this lesson was run on 2.0.9.",
    },

    { t: "h", zh: "二、整体架构：一切都靠消息传递", en: "2. The architecture: everything travels as messages" },
    {
      t: "p",
      zh: "[▶ 01:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=16&t=65) 老师先画了一张数据流的图，用文字说就是：\n\n1. 用户输入一句话，程序把它**打包成一条消息（message）**；\n2. 消息交给**智能体（Agent）**，智能体解析它，再把信息发给**大模型**；\n3. 大模型的回答也被包装成一条消息返回；\n4. 程序把消息**拆开**，把结果显示给用户。\n\n不只是用户和智能体之间：智能体和智能体交流、智能体和知识库（RAG，17 节）交互，用的也是同一种消息格式。所以这一集按「消息 → 模型 → 智能体 → 事件」四个要素来讲。",
      en: "[▶ 01:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=16&t=65) The instructor first draws the data flow. In words:\n\n1. the user types something and the program **wraps it in a message**;\n2. the message goes to the **agent**, which parses it and passes the information to the **LLM**;\n3. the LLM's answer comes back wrapped in a message too;\n4. the program **unwraps** the message and shows the result to the user.\n\nThis is not only for user ↔ agent: agents talking to agents, and agents working with a knowledge base (RAG, lesson 17), use the same message format. So the episode goes through four elements: message → model → agent → event.",
    },

    { t: "h", zh: "三、要素一：消息 Msg 和内容块", en: "3. Element 1: the message Msg and content blocks" },
    {
      t: "p",
      zh: "[▶ 01:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=16&t=100) 一条消息分**两层**：里面是一个个**内容块（block）**，外面是 `Msg`。不同种类的数据用不同的块：文字用 `TextBlock`；视频里说图片要用图像块——在 2.0.9 里，图片、音频这类数据统一用 `DataBlock`（本课只用文字）。把块放进一个**列表**交给 `Msg`，就可以发给智能体了。\n\n[▶ 02:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=16&t=130) 视频的代码：从 `agentscope.message` 导入 `Msg` 和 `TextBlock`，读到用户输入的字符串后创建消息：",
      en: "[▶ 01:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=16&t=100) A message has **two layers**: inside are **content blocks**, outside is the `Msg`. Each kind of data has its own block: text uses `TextBlock`; the video mentions an image block for pictures – in 2.0.9, images, audio and similar data all use `DataBlock` (this lesson only needs text). Put the blocks in a **list**, hand it to `Msg`, and the message is ready for the agent.\n\n[▶ 02:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=16&t=130) The video's code imports `Msg` and `TextBlock` from `agentscope.message` and, once it has the user's input string, builds the message:",
    },
    {
      t: "code",
      file: "msg_demo.py",
      code: {
        zh: String.raw`from agentscope.message import Msg, TextBlock

user_input = input("你：")

msg = Msg(
    name="user",                              # 这条消息的名字，可以随便起
    role="user",                              # 谁发的：user / assistant / system
    content=[TextBlock(text=user_input)],     # 块的列表；这里只有一个文字块
)
print(msg.get_text_content())                 # 取回里面的文字`,
        en: String.raw`from agentscope.message import Msg, TextBlock

user_input = input("You: ")

msg = Msg(
    name="user",                              # a name for this message - anything you like
    role="user",                              # who sent it: user / assistant / system
    content=[TextBlock(text=user_input)],     # a list of blocks; here just one text block
)
print(msg.get_text_content())                 # get the text back out`,
      },
      note: {
        zh: "框架代码不能在浏览器里运行，请在 VS Code 里用 `.venv` 运行（命令见[环境准备](#/setup)）。",
        en: "Framework code can't run in the browser; run it in VS Code with `.venv` (commands on the [Setup](#/setup) page).",
      },
    },
    {
      t: "p",
      zh: "三个参数：\n\n| 参数 | 作用 | 注意 |\n|---|---|---|\n| `name` | 给这条消息命名 | 必须写，名字随意，影响不大 |\n| `role` | 这条消息是谁发出的 | 只能是 `\"user\"`（用户）、`\"assistant\"`（智能体）、`\"system\"`（系统）。视频口头把第二种叫「agent 的信息」，代码里要写 `assistant`，写 `\"agent\"` 会报 `ValidationError` |\n| `content` | 消息内容 | 必须是**块的列表**，只有一个块也要用 `[...]` 包起来；直接传字符串会报 `ValidationError` |\n\n`TextBlock` 的文字要用关键字写成 `TextBlock(text=...)`，写成 `TextBlock(\"你好\")` 会报 `TypeError`。\n\n后面几节（18 节起）常见一个更短的写法 `UserMsg(name=\"user\", content=\"你好\")`：它是现成的快捷函数，接受字符串，内部替你建好 `role=\"user\"` 和 `TextBlock`，结果和上面一样。",
      en: "The three parameters:\n\n| Parameter | Purpose | Watch out |\n|---|---|---|\n| `name` | Names this message | Required; any name works, it matters little |\n| `role` | Who sent the message | Only `\"user\"`, `\"assistant\"` (the agent) or `\"system\"`. The video calls the second one “the agent's message” out loud, but the code says `assistant`; `\"agent\"` raises a `ValidationError` |\n| `content` | The content | Must be a **list of blocks** – even one block goes inside `[...]`; a plain string raises a `ValidationError` |\n\n`TextBlock` takes its text as a keyword, `TextBlock(text=...)`; `TextBlock(\"Hi\")` raises a `TypeError`.\n\nFrom lesson 18 on you'll often see the shorter `UserMsg(name=\"user\", content=\"Hi\")`: a ready-made shortcut that accepts a string and builds `role=\"user\"` and the `TextBlock` for you – the result is the same.",
    },
    {
      t: "check",
      q: { zh: "下面哪条能正确创建一条用户消息？", en: "Which line correctly creates a user message?" },
      options: [
        { zh: "`Msg(name=\"user\", role=\"user\", content=\"你好\")`", en: "`Msg(name=\"user\", role=\"user\", content=\"Hi\")`" },
        { zh: "`Msg(name=\"user\", role=\"agent\", content=[TextBlock(text=\"你好\")])`", en: "`Msg(name=\"user\", role=\"agent\", content=[TextBlock(text=\"Hi\")])`" },
        { zh: "`Msg(name=\"user\", role=\"user\", content=[TextBlock(text=\"你好\")])`", en: "`Msg(name=\"user\", role=\"user\", content=[TextBlock(text=\"Hi\")])`" },
      ],
      answer: 2,
      explain: { zh: "`content` 必须是块的列表；`role` 只能是 user / assistant / system。", en: "`content` must be a list of blocks; `role` can only be user / assistant / system." },
    },

    { t: "h", zh: "四、要素二：模型和凭证（通行证）", en: "4. Element 2: the model and its credential (the “pass”)" },
    {
      t: "p",
      zh: "[▶ 03:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=16&t=200) 第二个要素是模型。视频从 `agentscope.model` 导入 `OpenAIChatModel`。老师特别解释：名字里的 OpenAI **不是**指 OpenAI 公司的模型，而是说调用接口时遵守 **OpenAI 的接口标准**。这个标准用得非常广，绝大多数模型服务（阿里云百炼、DeepSeek……）都支持它（04 节用 `OpenAI(...)` 客户端连 DeepSeek，也是同一个道理）。\n\n[▶ 03:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=16&t=230) 光有模型类还不够，还要一张「**通行证**」——代码里叫**凭证（credential）**。可以把它理解成一份配置：里面放 **API key** 和**要请求的网址**（base_url）。\n\n然后用凭证创建模型对象。老师强调：这个对象是**和云端模型通信的配置**，并不是大模型本身。它的三个参数：`model`（模型名）、`credential`（刚才的凭证）、`stream`（是否流式输出，视频里写 `True`）。",
      en: "[▶ 03:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=16&t=200) The second element is the model. The video imports `OpenAIChatModel` from `agentscope.model`. The instructor stresses that “OpenAI” in the name does **not** mean OpenAI's own models: it means the call follows the **OpenAI API standard**, which is so widespread that most model services (Alibaba Bailian, DeepSeek…) support it – the same reason lesson 04's `OpenAI(...)` client could talk to DeepSeek.\n\n[▶ 03:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=16&t=230) The model class also needs a “**pass**” – in code, a **credential**. Think of it as a config object holding the **API key** and **the address to call** (base_url).\n\nThe credential then goes into the model object. The instructor points out that this object is **the configuration for talking to the cloud model**, not the LLM itself. Its three parameters: `model` (the model name), `credential` (the pass above) and `stream` (streaming output or not; the video uses `True`).",
    },
    {
      t: "code",
      file: { zh: "模型和凭证（DeepSeek 版）", en: "model and credential (DeepSeek version)" },
      code: {
        zh: String.raw`from agentscope.credential import OpenAICredential
from agentscope.model import OpenAIChatModel

from llm import API_KEY, BASE_URL, MODEL       # 04 节的公用配置：DeepSeek 的 key、地址、模型名

# 凭证（通行证）：API key + 要请求的地址
credential = OpenAICredential(api_key=API_KEY, base_url=BASE_URL)

# 模型：用 OpenAI 接口标准和云端模型通信的配置
model = OpenAIChatModel(model=MODEL, credential=credential, stream=True)`,
        en: String.raw`from agentscope.credential import OpenAICredential
from agentscope.model import OpenAIChatModel

from llm import API_KEY, BASE_URL, MODEL       # the shared config from lesson 04: DeepSeek key, address, model

# the credential (the "pass"): API key + the address to call
credential = OpenAICredential(api_key=API_KEY, base_url=BASE_URL)

# the model: settings for talking to the cloud model through the OpenAI API standard
model = OpenAIChatModel(model=MODEL, credential=credential, stream=True)`,
      },
    },
    {
      t: "video",
      zh: "视频里老师用的是阿里云百炼：凭证里的地址是百炼的 OpenAI 兼容地址，key 是百炼的 key，模型是通义千问的 Plus 模型（字幕听起来是「千问 3.6 plus」）。我们只有 DeepSeek 的 key，所以三样东西都换成 `practice/llm.py` 里的 DeepSeek 配置，**类和写法完全不变**：\n\n| | 视频 | 本课 |\n|---|---|---|\n| 模型类 | `OpenAIChatModel` | `OpenAIChatModel` |\n| `base_url` | 百炼的兼容地址 | `https://api.deepseek.com`（`BASE_URL`） |\n| `api_key` | 百炼的 key | `DEEPSEEK_API_KEY`（`API_KEY`） |\n| `model` | 千问 Plus | `deepseek-flash`（`MODEL`） |",
      en: "In the video the instructor uses Alibaba Bailian: the credential's address is Bailian's OpenAI-compatible endpoint, the key is a Bailian key, and the model is a Qwen Plus model (it sounds like “Qwen 3.6 plus” in the subtitles). We only have a DeepSeek key, so all three come from the DeepSeek settings in `practice/llm.py`; **the class and the code stay exactly the same**:\n\n| | Video | This lesson |\n|---|---|---|\n| Model class | `OpenAIChatModel` | `OpenAIChatModel` |\n| `base_url` | Bailian's compatible endpoint | `https://api.deepseek.com` (`BASE_URL`) |\n| `api_key` | A Bailian key | `DEEPSEEK_API_KEY` (`API_KEY`) |\n| `model` | Qwen Plus | `deepseek-flash` (`MODEL`) |",
    },
    {
      t: "note",
      zh: "AgentScope 还为常见厂商准备了专用的类，比如 `DeepSeekChatModel` + `DeepSeekCredential`（凭证里只要 key，地址已经内置）：\n`DeepSeekChatModel(credential=DeepSeekCredential(api_key=API_KEY), model=MODEL)`\n效果和上面一样。18 节以后的讲义多用这种写法，看到时知道是同一回事就行。",
      en: "AgentScope also has dedicated classes for common providers, e.g. `DeepSeekChatModel` + `DeepSeekCredential` (the credential needs only the key; the address is built in):\n`DeepSeekChatModel(credential=DeepSeekCredential(api_key=API_KEY), model=MODEL)`\nIt does the same job. The notes from lesson 18 on mostly use this form; when you see it, it's the same thing.",
    },
    {
      t: "check",
      q: { zh: "`OpenAIChatModel` 名字里的「OpenAI」指的是？", en: "What does “OpenAI” in `OpenAIChatModel` refer to?" },
      options: [
        { zh: "只能调用 OpenAI 公司的 GPT 模型", en: "It can only call OpenAI's GPT models" },
        { zh: "调用时遵守的 OpenAI 接口标准，百炼、DeepSeek 等都兼容", en: "The OpenAI API standard the call follows, which Bailian, DeepSeek and others support" },
        { zh: "请求会先转发到 OpenAI 的服务器", en: "Requests are first forwarded to OpenAI's servers" },
      ],
      answer: 1,
      explain: { zh: "它是接口标准；真正连到哪家，由凭证里的 `base_url` 决定。", en: "It is the API standard; which provider you actually reach is decided by the credential's `base_url`." },
    },

    { t: "h", zh: "五、要素三：智能体 Agent", en: "5. Element 3: the Agent" },
    {
      t: "p",
      zh: "[▶ 04:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=16&t=275) 智能体系统是**包在大模型外面的一层**。大模型只会输出文字，要靠智能体帮它解析这些文字、调用各种工具（16 节）。从 `agentscope.agent` 导入 `Agent`，创建时给三样东西：\n- `name`：智能体的名字\n- `system_prompt`：系统提示词，也就是要智能体记住、坚决执行的指令和信息\n- `model`：上一步建好的模型对象",
      en: "[▶ 04:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=16&t=275) The agent system is **a layer wrapped around the LLM**. The LLM can only output text; the agent parses that text and calls all kinds of tools (lesson 16). Import `Agent` from `agentscope.agent` and give it three things:\n- `name`: the agent's name\n- `system_prompt`: the system prompt – instructions and facts the agent must remember and follow\n- `model`: the model object from the previous step",
    },
    {
      t: "code",
      file: { zh: "创建智能体", en: "creating the agent" },
      code: {
        zh: String.raw`from agentscope.agent import Agent

agent = Agent(
    name="Friday",
    system_prompt="你是一个友好的中文助手，回答简洁。",
    model=model,
)`,
        en: String.raw`from agentscope.agent import Agent

agent = Agent(
    name="Friday",
    system_prompt="You are a friendly assistant. Keep answers short.",
    model=model,
)`,
      },
    },
    {
      t: "note",
      zh: "补充：智能体**自带对话记忆**。每次回答前后，它都会把收到的消息和自己的回答存进 `agent.state.context`，所以对**同一个** `agent` 连续提问，它记得前面聊过什么，不用像 [06 节](#/lesson/l06)那样自己维护历史列表。记忆只在程序运行期间存在；新建一个 `Agent` 就从空白开始。",
      en: "Extra: the agent **keeps its own conversation memory**. Around every answer it stores the incoming message and its reply in `agent.state.context`, so the **same** `agent` remembers earlier turns – no hand-made history list as in [lesson 06](#/lesson/l06). The memory only lasts while the program runs; a new `Agent` starts blank.",
    },

    { t: "h", zh: "六、要素四：事件 Event 与流式输出", en: "6. Element 4: events and streaming" },
    {
      t: "p",
      zh: "[▶ 05:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=16&t=312) 事件（event）有两个用处：支持**流式输出**，以及对智能体的行为做**精细控制**（第二个用处在 16 节的「请求批准」里会用到）。\n\n为什么需要流式输出？模型生成回答是一小块一小块地往外「蹦」的，每一小块叫一个 **token**。整段回答要一段时间才能生成完，如果非要等全部完成再显示，用户只能干等，体验很差。流式输出就是**每生成一点就先返回一点**，用户可以边看边等。而且在流式输出的过程中，程序还能随时介入、管控模型的行为。\n\nAgentScope 会把每一小块打包成一个**事件对象**交给你，接下来的两个实例分别演示「不用事件」和「用事件」。",
      en: "[▶ 05:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=16&t=312) Events serve two purposes: **streaming output**, and **fine-grained control** over the agent's behaviour (the second one appears in lesson 16's “please approve” step).\n\nWhy stream? A model produces its answer in small pieces, one **token** at a time. The whole answer takes a while; if you wait until it is complete before showing anything, the user just sits there. Streaming **returns each bit as soon as it's ready**, so the user can read along. While streaming, your program can also step in and control what the model does.\n\nAgentScope wraps each piece in an **event object** and hands it to you. The two examples below show the version without events and the version with them.",
    },

    { t: "h", zh: "七、实例一：非流式的聊天智能体", en: "7. Example 1: a non-streaming chat agent" },
    {
      t: "p",
      zh: "[▶ 06:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=16&t=375) 第一个实例把前面的零件拼起来：导入 `Msg`、`TextBlock`、`OpenAIChatModel`、`Agent`、凭证类，以及异步库 `asyncio`（例子里有很多需要「挂起等待」的操作，比如等模型回答）。凭证、模型、智能体的创建和前面完全一样。\n\n然后定义一个和智能体对话的函数 `chat_with_agent`：\n- 用 `async def` 声明它是一个**协程**；\n- 里面用 `while True` 死循环，实现持续不断的对话（06 节）；\n- 每一轮读用户输入 → 打包成 `Msg` → 用 `await agent.reply(msg)` 挂起、等智能体回答 → 打印。\n\n最后，协程**不能直接调用**，要交给 `asyncio.run(...)` 运行（回顾 [09 节的 Python 小课堂](#/lesson/l09)）。",
      en: "[▶ 06:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=16&t=375) The first example puts the parts together: import `Msg`, `TextBlock`, `OpenAIChatModel`, `Agent`, the credential class, and the async library `asyncio` (the example has many operations that “suspend and wait”, such as waiting for the model). Creating the credential, model and agent is exactly as above.\n\nThen a function to talk to the agent, `chat_with_agent`:\n- `async def` declares it a **coroutine**;\n- inside, an endless `while True` loop keeps the conversation going (lesson 06);\n- each round reads the input → wraps it in a `Msg` → suspends with `await agent.reply(msg)` until the agent answers → prints it.\n\nFinally, a coroutine **can't be called directly**; it is run with `asyncio.run(...)` (see the [Python mini-lesson in lesson 09](#/lesson/l09)).",
    },
    {
      t: "code",
      file: "practice/l15_agent_solution.py",
      code: {
        zh: String.raw`import asyncio

from agentscope.agent import Agent
from agentscope.credential import OpenAICredential
from agentscope.message import Msg, TextBlock
from agentscope.model import OpenAIChatModel

from llm import API_KEY, BASE_URL, MODEL

credential = OpenAICredential(api_key=API_KEY, base_url=BASE_URL)
model = OpenAIChatModel(model=MODEL, credential=credential, stream=True)
agent = Agent(
    name="Friday",
    system_prompt="你是一个友好的中文助手，回答简洁。",
    model=model,
)


async def chat_with_agent():
    while True:                                          # 一直聊下去
        user_input = input("你：").strip()
        if user_input == "exit":
            break
        if not user_input:
            continue
        msg = Msg(name="user", role="user", content=[TextBlock(text=user_input)])
        reply = await agent.reply(msg)                   # 等整段回答完成
        print("Friday：", reply.get_text_content())


if __name__ == "__main__":
    asyncio.run(chat_with_agent())                       # 协程要交给 asyncio.run`,
        en: String.raw`import asyncio

from agentscope.agent import Agent
from agentscope.credential import OpenAICredential
from agentscope.message import Msg, TextBlock
from agentscope.model import OpenAIChatModel

from llm import API_KEY, BASE_URL, MODEL

credential = OpenAICredential(api_key=API_KEY, base_url=BASE_URL)
model = OpenAIChatModel(model=MODEL, credential=credential, stream=True)
agent = Agent(
    name="Friday",
    system_prompt="You are a friendly assistant. Keep answers short.",
    model=model,
)


async def chat_with_agent():
    while True:                                          # keep chatting
        user_input = input("You: ").strip()
        if user_input == "exit":
            break
        if not user_input:
            continue
        msg = Msg(name="user", role="user", content=[TextBlock(text=user_input)])
        reply = await agent.reply(msg)                   # wait for the whole answer
        print("Friday:", reply.get_text_content())


if __name__ == "__main__":
    asyncio.run(chat_with_agent())                       # coroutines are run with asyncio.run`,
      },
      note: {
        zh: "实测（DeepSeek）：输入「你好，用一句话介绍你自己」，等了几秒后一次性打印 `Friday： 你好！我是一个友好的中文AI助手，乐于用简洁的方式回答你的问题、提供帮助。` 输入 `exit` 退出。`reply` 是一个 `Msg`，它的 `content` 也是块的列表，所以用 `get_text_content()` 把文字取出来。",
        en: "Real run (DeepSeek): typing “Hi, introduce yourself in one sentence” printed, after a few seconds and all at once, a one-sentence greeting from Friday. Type `exit` to quit. `reply` is a `Msg` whose `content` is again a list of blocks, so `get_text_content()` pulls out the text.",
      },
    },
    {
      t: "video",
      zh: "[▶ 07:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=16&t=437) 老师运行这个例子，输入「你好」，过了一会儿回答才整段出现。他指出：因为没有用流式输出，返回会比较慢——这正是下一个实例要解决的问题。\n\n补充一点：`agent.reply` 总是等整段回答生成完才返回，即使模型设了 `stream=True` 也一样；想边生成边显示，就得换成下面的 `reply_stream`。",
      en: "[▶ 07:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=16&t=437) The instructor runs this example, types “hello”, and the answer appears all at once after a pause. He notes that without streaming the reply is slow to arrive – which is what the next example fixes.\n\nOne more detail: `agent.reply` always waits until the whole answer is generated, even with `stream=True` on the model; to show the answer as it is produced you need `reply_stream`, below.",
    },
    {
      t: "check",
      q: { zh: "`chat_with_agent` 是用 `async def` 定义的。在文件末尾应该怎样启动它？", en: "`chat_with_agent` is defined with `async def`. How do you start it at the end of the file?" },
      options: [
        { zh: "`chat_with_agent()`", en: "`chat_with_agent()`" },
        { zh: "`asyncio.run(chat_with_agent())`", en: "`asyncio.run(chat_with_agent())`" },
        { zh: "`asyncio.run(chat_with_agent)`", en: "`asyncio.run(chat_with_agent)`" },
      ],
      answer: 1,
      explain: { zh: "直接调用协程只会得到一个协程对象，里面的代码不会执行；要把**调用结果** `chat_with_agent()` 交给 `asyncio.run`。", en: "Calling a coroutine function only creates a coroutine object; nothing runs. Pass the **call** `chat_with_agent()` to `asyncio.run`." },
    },

    { t: "h", zh: "八、实例二：流式输出的聊天智能体", en: "8. Example 2: a streaming chat agent" },
    {
      t: "p",
      zh: "[▶ 07:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=16&t=475) 第二个实例的导入、凭证、模型、智能体都和前面一样，`while` 循环也照旧，**唯一的区别**在交给智能体之后：不再 `await agent.reply(msg)`，而是用 `async for event in agent.reply_stream(msg)` 一个一个地接住事件（`async for` 见 09 节）。\n\n每拿到一个事件，先看看它**有没有 `delta` 这个属性**：`delta` 装的是这次新生成的那一小段文字。有，说明这不是一个空的事件，就把它打印出来（不换行，马上显示）；所有事件都处理完，循环自然结束。检查「有没有某个属性」用的是 Python 自带的 `hasattr`：",
      en: "[▶ 07:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=16&t=475) In the second example the imports, credential, model, agent and `while` loop are all unchanged. **The only difference** is after the message is handed over: instead of `await agent.reply(msg)`, `async for event in agent.reply_stream(msg)` catches the events one at a time (`async for`: lesson 09).\n\nFor each event, first check **whether it has a `delta` attribute** – `delta` holds the small piece of text just generated. If it does, the event isn't empty, so print the piece (no newline, show it at once); when all events are handled, the loop ends by itself. Checking “does it have this attribute?” uses Python's built-in `hasattr`:",
    },
    {
      t: "py",
      title: { zh: "hasattr：先问一句「你有这个属性吗」", en: "hasattr: ask “do you have this attribute?” first" },
      zh: "对象的属性用 `对象.属性名` 来取（08 节）。可如果这个对象**根本没有**这个属性，就会报 `AttributeError`，程序停下来。\n\n`hasattr(对象, \"属性名\")` 先检查一下：有就返回 `True`，没有返回 `False`，**不会报错**。注意属性名要写成**字符串**。\n\n`reply_stream` 吐出来的事件种类很多：有的带 `delta`（一小段文字），有的不带（比如「回答开始」「回答结束」）。所以视频先用 `hasattr` 过滤，再去取 `event.delta`。下面用两个简单的类模拟这两种事件：",
      en: "You read an object's attribute with `object.attribute` (lesson 08). But if the object **doesn't have** that attribute at all, you get an `AttributeError` and the program stops.\n\n`hasattr(object, \"name\")` checks first: `True` if it exists, `False` if not – **no error**. Note the attribute name is a **string**.\n\n`reply_stream` yields many kinds of events: some carry a `delta` (a small piece of text), others don't (such as “reply started” or “reply ended”). That's why the video filters with `hasattr` before reading `event.delta`. Two tiny classes stand in for the two kinds of event:",
      code: {
        zh: String.raw`class TextDelta:                       # 模拟「文字片段」事件：有 delta
    def __init__(self, delta):
        self.delta = delta

class ReplyEnd:                        # 模拟「回答结束」事件：没有 delta
    pass

events = [TextDelta("你好，"), TextDelta("我是 Friday。"), ReplyEnd()]

print(hasattr(events[0], "delta"))     # True
print(hasattr(events[2], "delta"))     # False

for event in events:
    if hasattr(event, "delta"):        # 有 delta 才打印
        print(event.delta, end="", flush=True)
print()

try:
    print(events[2].delta)             # 不检查就直接取
except AttributeError as e:
    print("AttributeError:", e)

print(getattr(events[2], "delta", "（没有 delta）"))   # 取不到时用默认值`,
        en: String.raw`class TextDelta:                       # stands in for a "text piece" event: has a delta
    def __init__(self, delta):
        self.delta = delta

class ReplyEnd:                        # stands in for a "reply ended" event: no delta
    pass

events = [TextDelta("Hi, "), TextDelta("I'm Friday."), ReplyEnd()]

print(hasattr(events[0], "delta"))     # True
print(hasattr(events[2], "delta"))     # False

for event in events:
    if hasattr(event, "delta"):        # print only if there is a delta
        print(event.delta, end="", flush=True)
print()

try:
    print(events[2].delta)             # reading it without checking
except AttributeError as e:
    print("AttributeError:", e)

print(getattr(events[2], "delta", "(no delta)"))   # a default when it's missing`,
      },
      note: {
        zh: "最后一行的 `getattr(对象, \"属性名\", 默认值)` 是 `hasattr` 的好搭档：有这个属性就返回它的值，没有就返回默认值。",
        en: "The last line's `getattr(object, \"name\", default)` pairs well with `hasattr`: it returns the attribute's value if present, otherwise the default.",
      },
    },
    {
      t: "code",
      file: "practice/l15_stream_chat.py · chat_stream()",
      code: {
        zh: String.raw`async def chat_stream():
    while True:
        user_input = input("\n你：").strip()
        if user_input == "exit":
            break
        if not user_input:
            continue
        msg = Msg(name="user", role="user", content=[TextBlock(text=user_input)])
        print("Friday：", end="", flush=True)
        async for event in agent.reply_stream(msg):     # 一个接一个地拿到事件
            if hasattr(event, "delta"):                 # 有新文字片段
                print(event.delta, end="", flush=True)  # 不换行，马上显示
        print()

asyncio.run(chat_stream())`,
        en: String.raw`async def chat_stream():
    while True:
        user_input = input("\nYou: ").strip()
        if user_input == "exit":
            break
        if not user_input:
            continue
        msg = Msg(name="user", role="user", content=[TextBlock(text=user_input)])
        print("Friday: ", end="", flush=True)
        async for event in agent.reply_stream(msg):     # events arrive one by one
            if hasattr(event, "delta"):                 # a new piece of text
                print(event.delta, end="", flush=True)  # no newline, show it now
        print()

asyncio.run(chat_stream())`,
      },
      note: {
        zh: "`print(..., end=\"\", flush=True)` 在 09 节讲过：不换行，并且马上显示。完整文件是 `practice/l15_stream_chat.py`。",
        en: "`print(..., end=\"\", flush=True)` was covered in lesson 09: no newline, and show it right away. The full file is `practice/l15_stream_chat.py`.",
      },
    },
    {
      t: "video",
      zh: "[▶ 08:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=16&t=534) 演示时，回答一段一段地蹦出来。老师指出：最先出来的那段**英文**，是模型的**思考和规划过程**，后面那部分才是真正的回答；再问一个长一点的问题，能更清楚地看到一点点输出的过程。\n\n换成 DeepSeek 也一样：`deepseek-flash` 默认先思考。实测输入「你好，用一句话介绍你自己」，多数时候先打出一段思考（大意是「用户要一句话的中文自我介绍，简单回答就行」），紧接着才是中文回答。思考多半是英文，有时也会是中文；偶尔思考内容很少，几乎看不出来。",
      en: "[▶ 08:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=16&t=534) In the demo the answer pops out piece by piece. The instructor points out that the **English** text that comes first is the model's **thinking and planning**; only what follows is the real answer. He then asks something longer to show the gradual output more clearly.\n\nDeepSeek behaves the same: `deepseek-flash` thinks first by default. In real runs, “Hi, introduce yourself in one sentence” usually printed some reasoning first (roughly “they want a one-sentence intro in Chinese – keep it simple”), followed by the Chinese answer. The reasoning is mostly in English but sometimes in Chinese, and occasionally there is so little of it that you hardly notice it.",
    },
    {
      t: "p",
      zh: "为什么思考也被打印了？因为**好几种事件都有 `delta`**，`hasattr` 只问「有没有」，不分种类：\n\n| 事件类 | `event.type` | `delta` 里是什么 |\n|---|---|---|\n| `ThinkingBlockDeltaEvent` | `THINKING_BLOCK_DELTA` | 一小段**思考过程** |\n| `TextBlockDeltaEvent` | `TEXT_BLOCK_DELTA` | 一小段**回答** |\n| `ToolCallDeltaEvent` | `TOOL_CALL_DELTA` | 工具调用的参数（16 节） |\n| `ToolResultTextDeltaEvent` | `TOOL_RESULT_TEXT_DELTA` | 工具返回的结果（16 节） |\n\n只想显示回答时，改成判断事件的种类：`event.type == EventType.TEXT_BLOCK_DELTA`（`from agentscope.event import EventType`）。`practice/l15_stream_chat.py` 里把 `ONLY_ANSWER` 改成 `True` 就是这个效果。",
      en: "Why was the thinking printed too? Because **several kinds of events have a `delta`**, and `hasattr` only asks whether it exists, not which kind of event it is:\n\n| Event class | `event.type` | What `delta` holds |\n|---|---|---|\n| `ThinkingBlockDeltaEvent` | `THINKING_BLOCK_DELTA` | A piece of **reasoning** |\n| `TextBlockDeltaEvent` | `TEXT_BLOCK_DELTA` | A piece of the **answer** |\n| `ToolCallDeltaEvent` | `TOOL_CALL_DELTA` | A tool call's arguments (lesson 16) |\n| `ToolResultTextDeltaEvent` | `TOOL_RESULT_TEXT_DELTA` | A tool's result (lesson 16) |\n\nTo show only the answer, check the event's type instead: `event.type == EventType.TEXT_BLOCK_DELTA` (`from agentscope.event import EventType`). Setting `ONLY_ANSWER = True` in `practice/l15_stream_chat.py` does exactly that.",
    },
    {
      t: "py",
      title: { zh: "Enum：一组有名字的常量", en: "Enum: a set of named constants" },
      zh: "`EventType.TEXT_BLOCK_DELTA` 这种写法来自**枚举（Enum）**：把一组固定的取值收在一个名字下面。比起到处手写字符串 `\"TEXT_BLOCK_DELTA\"`，用枚举拼错了会直接报错，编辑器也能自动补全。\n- 用 `类名.成员` 取出一个成员；`成员.name` 是它的名字，`成员.value` 是它代表的值\n- AgentScope 的 `EventType` 是**字符串枚举**，成员本身就是字符串，所以 `event.type == \"TEXT_BLOCK_DELTA\"` 也成立，但推荐写 `EventType.TEXT_BLOCK_DELTA`\n\n下面自己定义一个简化版，再用一串假事件模拟「只打印回答」：",
      en: "`EventType.TEXT_BLOCK_DELTA` comes from an **enumeration (Enum)**: a fixed set of values grouped under one name. Compared with typing the string `\"TEXT_BLOCK_DELTA\"` everywhere, a typo in an enum name fails immediately, and your editor can autocomplete it.\n- `ClassName.MEMBER` gives you a member; `member.name` is its name and `member.value` the value it stands for\n- AgentScope's `EventType` is a **string enum**: members are strings, so `event.type == \"TEXT_BLOCK_DELTA\"` also works, but `EventType.TEXT_BLOCK_DELTA` is preferred\n\nBelow we define a simplified one and fake a stream to print only the answer:",
      code: {
        zh: String.raw`from enum import Enum

class EventType(str, Enum):          # 简化版，真正的在 agentscope.event 里
    THINKING_BLOCK_DELTA = "THINKING_BLOCK_DELTA"
    TEXT_BLOCK_DELTA = "TEXT_BLOCK_DELTA"
    REPLY_END = "REPLY_END"

print(EventType.TEXT_BLOCK_DELTA.name)
print(EventType.TEXT_BLOCK_DELTA.value)                   # 这里名字和值碰巧写成一样
print(EventType.TEXT_BLOCK_DELTA == "TEXT_BLOCK_DELTA")   # True：字符串枚举
print([e.name for e in EventType])                        # 所有成员

events = [
    {"type": EventType.THINKING_BLOCK_DELTA, "delta": "用户在打招呼……"},
    {"type": EventType.TEXT_BLOCK_DELTA, "delta": "你好，"},
    {"type": EventType.TEXT_BLOCK_DELTA, "delta": "我是 Friday。"},
    {"type": EventType.REPLY_END},
]
for event in events:
    if event["type"] == EventType.TEXT_BLOCK_DELTA:      # 只要回答，跳过思考
        print(event["delta"], end="", flush=True)
print()`,
        en: String.raw`from enum import Enum

class EventType(str, Enum):          # simplified; the real one is in agentscope.event
    THINKING_BLOCK_DELTA = "THINKING_BLOCK_DELTA"
    TEXT_BLOCK_DELTA = "TEXT_BLOCK_DELTA"
    REPLY_END = "REPLY_END"

print(EventType.TEXT_BLOCK_DELTA.name)
print(EventType.TEXT_BLOCK_DELTA.value)                   # name and value happen to match here
print(EventType.TEXT_BLOCK_DELTA == "TEXT_BLOCK_DELTA")   # True: a string enum
print([e.name for e in EventType])                        # every member

events = [
    {"type": EventType.THINKING_BLOCK_DELTA, "delta": "The user is greeting me..."},
    {"type": EventType.TEXT_BLOCK_DELTA, "delta": "Hi, "},
    {"type": EventType.TEXT_BLOCK_DELTA, "delta": "I'm Friday."},
    {"type": EventType.REPLY_END},
]
for event in events:
    if event["type"] == EventType.TEXT_BLOCK_DELTA:      # answer only, skip the thinking
        print(event["delta"], end="", flush=True)
print()`,
      },
    },
    {
      t: "note",
      zh: "补充（视频没讲）：只想快速试聊，AgentScope 自带一个现成的终端聊天：`from agentscope.console import launch_console`，然后 `asyncio.run(launch_console(agent))`。它把读输入、流式打印都包好了，输入 `exit` 退出。想自己决定打印什么，还是用本节的 `reply_stream`。",
      en: "Extra (not in the video): to try a chat quickly, AgentScope ships a ready-made terminal chat: `from agentscope.console import launch_console`, then `asyncio.run(launch_console(agent))`. It handles input and streaming output for you; type `exit` to quit. To decide yourself what gets printed, use this lesson's `reply_stream`.",
    },
    {
      t: "video",
      zh: "[▶ 09:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=16&t=585) 老师的总结：消息是用户与智能体、智能体与智能体、智能体与 RAG 交互的统一格式；模型和智能体系统一起构成一个智能体；事件支持流式输出和对模型行为的管控；最后用两个实例分别做了非流式和流式的聊天智能体。",
      en: "[▶ 09:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=16&t=585) The instructor's summary: the message is the common format for user ↔ agent, agent ↔ agent and agent ↔ RAG; the model plus the agent system make up an agent; events enable streaming and control over the model's behaviour; and the two examples built a non-streaming and a streaming chat agent.",
    },
  ],
  quiz: [
    {
      q: { zh: "AgentScope 里，凭证（视频里叫「通行证」）里面放的是什么？", en: "In AgentScope, what goes into the credential (the video's “pass”)?" },
      options: [
        { zh: "API key 和要请求的地址 `base_url`", en: "The API key and the address to call, `base_url`" },
        { zh: "模型名和 `stream` 开关", en: "The model name and the `stream` switch" },
        { zh: "系统提示词", en: "The system prompt" },
        { zh: "之前的对话历史", en: "The earlier conversation history" },
      ],
      answer: 0,
      explain: { zh: "`OpenAICredential(api_key=..., base_url=...)` 只管「用哪把 key、连哪个地址」；模型名和 `stream` 是 `OpenAIChatModel` 的参数，系统提示词交给 `Agent`。", en: "`OpenAICredential(api_key=..., base_url=...)` only says which key and which address; the model name and `stream` belong to `OpenAIChatModel`, and the system prompt to `Agent`." },
    },
    {
      q: { zh: "视频说 `OpenAIChatModel` 创建出来的对象「并不是大语言模型本身」。它其实是？", en: "The video says the `OpenAIChatModel` object “is not the LLM itself”. What is it?" },
      options: [
        { zh: "下载到本地的模型文件", en: "A model file downloaded to your computer" },
        { zh: "和云端模型通信的配置：模型名、凭证、要不要流式", en: "The settings for talking to the cloud model: model name, credential, streaming or not" },
        { zh: "一个智能体，可以直接聊天", en: "An agent you can chat with directly" },
        { zh: "OpenAI 公司的账号", en: "An OpenAI account" },
      ],
      answer: 1,
      explain: { zh: "真正的大模型在服务商的服务器上，这个对象只是记录「怎么联系它」。要聊天，还得把它交给 `Agent`。", en: "The real LLM runs on the provider's servers; this object only records how to reach it. To chat, hand it to an `Agent`." },
    },
    {
      q: { zh: "下面哪条消息能顺利创建？", en: "Which message can be created without an error?" },
      options: [
        { zh: "`Msg(name=\"user\", role=\"user\", content=\"你好\")`", en: "`Msg(name=\"user\", role=\"user\", content=\"Hi\")`" },
        { zh: "`Msg(role=\"user\", content=[TextBlock(text=\"你好\")])`", en: "`Msg(role=\"user\", content=[TextBlock(text=\"Hi\")])`" },
        { zh: "`Msg(name=\"user\", role=\"agent\", content=[TextBlock(text=\"你好\")])`", en: "`Msg(name=\"user\", role=\"agent\", content=[TextBlock(text=\"Hi\")])`" },
        { zh: "`Msg(name=\"user\", role=\"user\", content=[TextBlock(text=\"你好\")])`", en: "`Msg(name=\"user\", role=\"user\", content=[TextBlock(text=\"Hi\")])`" },
      ],
      answer: 3,
      explain: { zh: "依次的错误：`content` 不是列表；缺了必填的 `name`；`role` 只能是 user / assistant / system。三个都会报 `ValidationError`。", en: "In order: `content` isn't a list; the required `name` is missing; `role` can only be user / assistant / system. All three raise a `ValidationError`." },
    },
    {
      q: { zh: "实例一用 `await agent.reply(msg)`，演示时回答过了一会儿才整段出现。原因是？", en: "Example 1 uses `await agent.reply(msg)`, and in the demo the answer appears all at once after a pause. Why?" },
      options: [
        { zh: "DeepSeek 不支持流式输出", en: "DeepSeek doesn't support streaming" },
        { zh: "`stream=True` 写错了位置", en: "`stream=True` is in the wrong place" },
        { zh: "`agent.reply` 要等整段回答生成完才返回；想边生成边显示要用 `reply_stream`", en: "`agent.reply` returns only after the whole answer is generated; to show it as it comes, use `reply_stream`" },
        { zh: "`while True` 循环太慢", en: "The `while True` loop is slow" },
      ],
      answer: 2,
      explain: { zh: "`reply` 返回的是完整的 `Msg`，所以一定要等全部生成完。`reply_stream` 才会把一小段一小段的事件交给你。", en: "`reply` returns the complete `Msg`, so it has to wait for everything. Only `reply_stream` hands you the pieces as events." },
    },
    {
      q: { zh: "用 `if hasattr(event, \"delta\")` 打印流式输出，DeepSeek 先打出一段英文，然后才是中文回答。那段英文是？", en: "Printing the stream with `if hasattr(event, \"delta\")`, DeepSeek first prints some English, then the Chinese answer. What is the English text?" },
      options: [
        { zh: "程序的报错信息", en: "An error message from the program" },
        { zh: "模型的思考过程：思考片段事件也有 `delta`", en: "The model's reasoning: thinking-piece events have a `delta` too" },
        { zh: "系统提示词被打印了出来", en: "The system prompt being printed" },
        { zh: "上一轮的回答", en: "The previous answer" },
      ],
      answer: 1,
      explain: { zh: "`ThinkingBlockDeltaEvent` 和 `TextBlockDeltaEvent` 都有 `delta`，`hasattr` 不分种类。视频里老师用千问时也看到了同样的现象。", en: "Both `ThinkingBlockDeltaEvent` and `TextBlockDeltaEvent` have a `delta`, and `hasattr` doesn't tell them apart. The instructor saw the same thing with Qwen in the video." },
    },
    {
      q: { zh: "只想打印**回答**、不要思考过程，`async for` 里应该怎么判断？", en: "To print only the **answer** and skip the reasoning, what do you check inside the `async for`?" },
      options: [
        { zh: "`if hasattr(event, \"delta\"):`", en: "`if hasattr(event, \"delta\"):`" },
        { zh: "`if event.type == EventType.THINKING_BLOCK_DELTA:`", en: "`if event.type == EventType.THINKING_BLOCK_DELTA:`" },
        { zh: "`if event.type == EventType.REPLY_END:`", en: "`if event.type == EventType.REPLY_END:`" },
        { zh: "`if event.type == EventType.TEXT_BLOCK_DELTA:`", en: "`if event.type == EventType.TEXT_BLOCK_DELTA:`" },
      ],
      answer: 3,
      explain: { zh: "回答的片段是 `TEXT_BLOCK_DELTA` 事件；思考片段是 `THINKING_BLOCK_DELTA`；`REPLY_END` 表示这一轮结束，没有文字。", en: "Answer pieces are `TEXT_BLOCK_DELTA` events; reasoning pieces are `THINKING_BLOCK_DELTA`; `REPLY_END` marks the end of the turn and carries no text." },
    },
  ],
  fill: [
    {
      title: { zh: "实例一：非流式聊天", en: "Example 1: a non-streaming chat" },
      code: {
        zh: String.raw`credential = [[OpenAICredential]](api_key=API_KEY, [[base_url]]=BASE_URL)
model = [[OpenAIChatModel]](model=MODEL, credential=credential, stream=True)
agent = Agent(name="Friday", [[system_prompt]]="你是一个友好的助手。", model=model)

async def chat_with_agent():
    while True:
        user_input = input("你：")
        msg = [[Msg]](name="user", role="[[user]]", content=[TextBlock(text=user_input)])
        reply = [[await]] agent.reply(msg)
        print(reply.[[get_text_content]]())

asyncio.[[run]](chat_with_agent())`,
        en: String.raw`credential = [[OpenAICredential]](api_key=API_KEY, [[base_url]]=BASE_URL)
model = [[OpenAIChatModel]](model=MODEL, credential=credential, stream=True)
agent = Agent(name="Friday", [[system_prompt]]="You are a friendly assistant.", model=model)

async def chat_with_agent():
    while True:
        user_input = input("You: ")
        msg = [[Msg]](name="user", role="[[user]]", content=[TextBlock(text=user_input)])
        reply = [[await]] agent.reply(msg)
        print(reply.[[get_text_content]]())

asyncio.[[run]](chat_with_agent())`,
      },
      explain: { zh: "凭证（key + 地址）→ 模型 → 智能体 → 消息；`reply` 要 `await`，协程交给 `asyncio.run`。", en: "Credential (key + address) → model → agent → message; `reply` needs `await`, and `asyncio.run` runs the coroutine." },
    },
    {
      title: { zh: "实例二：流式打印", en: "Example 2: streaming print" },
      code: {
        zh: String.raw`async def print_all(agent, msg):
    async for event in agent.[[reply_stream]](msg):
        if [[hasattr]](event, "[[delta]]"):            # 视频的写法：有 delta 就打印
            print(event.delta, end="", flush=[[True]])

async def print_answer_only(agent, msg):
    async for event in agent.reply_stream(msg):
        if event.type == EventType.[[TEXT_BLOCK_DELTA]]:   # 改进：只打印回答
            print(event.delta, end="", flush=True)`,
        en: String.raw`async def print_all(agent, msg):
    async for event in agent.[[reply_stream]](msg):
        if [[hasattr]](event, "[[delta]]"):            # the video's way: print anything with a delta
            print(event.delta, end="", flush=[[True]])

async def print_answer_only(agent, msg):
    async for event in agent.reply_stream(msg):
        if event.type == EventType.[[TEXT_BLOCK_DELTA]]:   # improved: the answer only
            print(event.delta, end="", flush=True)`,
      },
      explain: { zh: "`reply_stream` 产生事件；`hasattr` 先检查有没有 `delta`；只要回答就判断 `TEXT_BLOCK_DELTA`。", en: "`reply_stream` yields events; `hasattr` checks for a `delta` first; for the answer only, check `TEXT_BLOCK_DELTA`." },
    },
  ],
  write: [
    {
      title: { zh: "手写：非流式聊天智能体（实例一）", en: "Write it: a non-streaming chat agent (example 1)" },
      task: {
        zh: "只看注释，写出完整程序（在 VS Code 里用 `.venv` 运行，浏览器里不能运行框架代码）：\n1. 从 `agentscope` 导入 `Agent`、`OpenAICredential`、`Msg`、`TextBlock`、`OpenAIChatModel`\n2. 用 `OpenAICredential(api_key=..., base_url=...)` 和 `OpenAIChatModel(...)` 建模型，再建一个 `Agent`（要有系统提示词）\n3. 写 `async def chat_with_agent()`：`while True` 读输入，输入 `exit` 退出；把输入打包成 `Msg`（`role=\"user\"`，`content` 是装着 `TextBlock` 的列表），`await agent.reply(...)` 后打印文字\n4. 用 `asyncio.run` 启动",
        en: "Write the whole program from the comments only (run it in VS Code with `.venv`; framework code can't run in the browser):\n1. import `Agent`, `OpenAICredential`, `Msg`, `TextBlock`, `OpenAIChatModel` from `agentscope`\n2. build the model with `OpenAICredential(api_key=..., base_url=...)` and `OpenAIChatModel(...)`, then an `Agent` with a system prompt\n3. write `async def chat_with_agent()`: a `while True` loop reads input and quits on `exit`; wrap the input in a `Msg` (`role=\"user\"`, `content` a list holding a `TextBlock`), `await agent.reply(...)` and print the text\n4. start it with `asyncio.run`",
      },
      starter: {
        zh: String.raw`import asyncio

# 1. 导入 AgentScope 的零件

from llm import API_KEY, BASE_URL, MODEL

# 2. 凭证、模型、智能体


# 3. 异步函数 chat_with_agent：循环读输入 → 打包消息 → 等回答 → 打印


# 4. 启动
`,
        en: String.raw`import asyncio

# 1. import the AgentScope parts

from llm import API_KEY, BASE_URL, MODEL

# 2. credential, model, agent


# 3. an async function chat_with_agent: loop reading input -> wrap -> await the answer -> print


# 4. start it
`,
      },
      solution: {
        zh: String.raw`import asyncio

# 1. 导入 AgentScope 的零件
from agentscope.agent import Agent
from agentscope.credential import OpenAICredential
from agentscope.message import Msg, TextBlock
from agentscope.model import OpenAIChatModel

from llm import API_KEY, BASE_URL, MODEL

# 2. 凭证、模型、智能体
credential = OpenAICredential(api_key=API_KEY, base_url=BASE_URL)
model = OpenAIChatModel(model=MODEL, credential=credential, stream=True)
agent = Agent(name="Friday", system_prompt="你是一个友好的中文助手。", model=model)

# 3. 异步函数 chat_with_agent
async def chat_with_agent():
    while True:
        user_input = input("你：").strip()
        if user_input == "exit":
            break
        msg = Msg(name="user", role="user", content=[TextBlock(text=user_input)])
        reply = await agent.reply(msg)
        print("Friday：", reply.get_text_content())

# 4. 启动
asyncio.run(chat_with_agent())`,
        en: String.raw`import asyncio

# 1. import the AgentScope parts
from agentscope.agent import Agent
from agentscope.credential import OpenAICredential
from agentscope.message import Msg, TextBlock
from agentscope.model import OpenAIChatModel

from llm import API_KEY, BASE_URL, MODEL

# 2. credential, model, agent
credential = OpenAICredential(api_key=API_KEY, base_url=BASE_URL)
model = OpenAIChatModel(model=MODEL, credential=credential, stream=True)
agent = Agent(name="Friday", system_prompt="You are a friendly assistant.", model=model)

# 3. the async function chat_with_agent
async def chat_with_agent():
    while True:
        user_input = input("You: ").strip()
        if user_input == "exit":
            break
        msg = Msg(name="user", role="user", content=[TextBlock(text=user_input)])
        reply = await agent.reply(msg)
        print("Friday:", reply.get_text_content())

# 4. start it
asyncio.run(chat_with_agent())`,
      },
      checks: [
        { zh: "从 `agentscope.message` 导入 `Msg` 和 `TextBlock`", en: "Imports `Msg` and `TextBlock` from `agentscope.message`", re: String.raw`from\s+agentscope\.message\s+import\s+.*\bTextBlock\b` },
        { zh: "凭证里写了 `api_key=` 和 `base_url=`", en: "The credential gets `api_key=` and `base_url=`", re: String.raw`OpenAICredential\(\s*api_key\s*=[^)]*base_url\s*=` },
        { zh: "`OpenAIChatModel(...)` 通过 `credential=` 拿到凭证", en: "`OpenAIChatModel(...)` gets the credential through `credential=`", re: String.raw`OpenAIChatModel\([^)]*credential\s*=` },
        { zh: "创建 `Agent(...)` 时传了 `system_prompt=`", en: "`Agent(...)` gets `system_prompt=`", re: String.raw`\bAgent\([\s\S]*?system_prompt\s*=` },
        { zh: "定义了 `async def chat_with_agent()`", en: "Defines `async def chat_with_agent()`", re: String.raw`async\s+def\s+chat_with_agent\s*\(` },
        { zh: "`while True` 循环里读 `input(...)`", en: "Reads `input(...)` in a `while True` loop", re: String.raw`while\s+True\s*:[\s\S]*input\(` },
        { zh: "`Msg(...)` 写了 `role=\"user\"`", en: "`Msg(...)` has `role=\"user\"`", re: String.raw`Msg\([\s\S]*?role\s*=\s*["']user["']` },
        { zh: "`content` 是装着 `TextBlock(text=...)` 的列表", en: "`content` is a list holding `TextBlock(text=...)`", re: String.raw`content\s*=\s*\[\s*TextBlock\(\s*text\s*=` },
        { zh: "用 `await agent.reply(...)` 等回答", en: "Waits with `await agent.reply(...)`", re: String.raw`await\s+agent\.reply\(` },
        { zh: "用 `asyncio.run(chat_with_agent())` 启动", en: "Starts with `asyncio.run(chat_with_agent())`", re: String.raw`asyncio\.run\(\s*chat_with_agent\(\s*\)\s*\)` },
      ],
    },
    {
      title: { zh: "手写：流式聊天（实例二）", en: "Write it: a streaming chat (example 2)" },
      task: {
        zh: "模型和智能体已经给出。写 `async def chat_stream()` 并启动：\n- `while True` 读输入，`exit` 退出，打包成 `Msg`\n- 用 `async for event in agent.reply_stream(msg)` 接收事件\n- 用 `hasattr(event, \"delta\")` 判断，有就不换行、马上打印 `event.delta`\n- 每轮结束后 `print()` 换行",
        en: "The model and agent are given. Write `async def chat_stream()` and start it:\n- a `while True` loop reads input, quits on `exit`, and wraps it in a `Msg`\n- receive events with `async for event in agent.reply_stream(msg)`\n- check `hasattr(event, \"delta\")`; if so, print `event.delta` with no newline, immediately\n- `print()` a newline after each turn",
      },
      starter: {
        zh: String.raw`import asyncio

from agentscope.agent import Agent
from agentscope.credential import OpenAICredential
from agentscope.message import Msg, TextBlock
from agentscope.model import OpenAIChatModel

from llm import API_KEY, BASE_URL, MODEL

model = OpenAIChatModel(model=MODEL, credential=OpenAICredential(api_key=API_KEY, base_url=BASE_URL), stream=True)
agent = Agent(name="Friday", system_prompt="你是一个友好的中文助手。", model=model)

# 写 chat_stream()，再启动它
`,
        en: String.raw`import asyncio

from agentscope.agent import Agent
from agentscope.credential import OpenAICredential
from agentscope.message import Msg, TextBlock
from agentscope.model import OpenAIChatModel

from llm import API_KEY, BASE_URL, MODEL

model = OpenAIChatModel(model=MODEL, credential=OpenAICredential(api_key=API_KEY, base_url=BASE_URL), stream=True)
agent = Agent(name="Friday", system_prompt="You are a friendly assistant.", model=model)

# write chat_stream(), then start it
`,
      },
      solution: {
        zh: String.raw`import asyncio

from agentscope.agent import Agent
from agentscope.credential import OpenAICredential
from agentscope.message import Msg, TextBlock
from agentscope.model import OpenAIChatModel

from llm import API_KEY, BASE_URL, MODEL

model = OpenAIChatModel(model=MODEL, credential=OpenAICredential(api_key=API_KEY, base_url=BASE_URL), stream=True)
agent = Agent(name="Friday", system_prompt="你是一个友好的中文助手。", model=model)

async def chat_stream():
    while True:
        user_input = input("你：").strip()
        if user_input == "exit":
            break
        msg = Msg(name="user", role="user", content=[TextBlock(text=user_input)])
        async for event in agent.reply_stream(msg):
            if hasattr(event, "delta"):
                print(event.delta, end="", flush=True)
        print()

asyncio.run(chat_stream())`,
        en: String.raw`import asyncio

from agentscope.agent import Agent
from agentscope.credential import OpenAICredential
from agentscope.message import Msg, TextBlock
from agentscope.model import OpenAIChatModel

from llm import API_KEY, BASE_URL, MODEL

model = OpenAIChatModel(model=MODEL, credential=OpenAICredential(api_key=API_KEY, base_url=BASE_URL), stream=True)
agent = Agent(name="Friday", system_prompt="You are a friendly assistant.", model=model)

async def chat_stream():
    while True:
        user_input = input("You: ").strip()
        if user_input == "exit":
            break
        msg = Msg(name="user", role="user", content=[TextBlock(text=user_input)])
        async for event in agent.reply_stream(msg):
            if hasattr(event, "delta"):
                print(event.delta, end="", flush=True)
        print()

asyncio.run(chat_stream())`,
      },
      checks: [
        { zh: "定义了 `async def chat_stream()`", en: "Defines `async def chat_stream()`", re: String.raw`async\s+def\s+chat_stream\s*\(` },
        { zh: "`while True` 循环里读 `input(...)`", en: "Reads `input(...)` in a `while True` loop", re: String.raw`while\s+True\s*:[\s\S]*input\(` },
        { zh: "用 `async for ... in agent.reply_stream(...)` 接收事件", en: "Receives events with `async for ... in agent.reply_stream(...)`", re: String.raw`async\s+for\s+\w+\s+in\s+agent\.reply_stream\(` },
        { zh: "用 `hasattr(event, \"delta\")` 判断", en: "Checks `hasattr(event, \"delta\")`", re: String.raw`hasattr\(\s*\w+\s*,\s*["']delta["']\s*\)` },
        { zh: "不换行、马上打印 `event.delta`", en: "Prints `event.delta` with no newline, flushing", re: String.raw`print\(\s*\w+\.delta\s*,\s*end\s*=\s*["']{2}\s*,\s*flush\s*=\s*True` },
        { zh: "用 `asyncio.run(chat_stream())` 启动", en: "Starts with `asyncio.run(chat_stream())`", re: String.raw`asyncio\.run\(\s*chat_stream\(\s*\)\s*\)` },
      ],
    },
  ],
  pitfalls: [
    { zh: "`Msg(content=\"你好\")` 直接传字符串：`ValidationError: Input should be a valid list`。要写 `content=[TextBlock(text=...)]`，或者用快捷的 `UserMsg(name=\"user\", content=\"你好\")`。", en: "Passing a string, `Msg(content=\"Hi\")`: `ValidationError: Input should be a valid list`. Write `content=[TextBlock(text=...)]`, or use the shortcut `UserMsg(name=\"user\", content=\"Hi\")`." },
    { zh: "`role=\"agent\"`：视频口头这么叫，但代码只认 `user` / `assistant` / `system`，否则 `ValidationError`。漏了 `name` 也会报错（Field required）。", en: "`role=\"agent\"`: the video says it out loud, but the code accepts only `user` / `assistant` / `system` (`ValidationError` otherwise). Leaving out `name` fails too (Field required)." },
    { zh: "`TextBlock(\"你好\")` 用了位置参数：`TypeError`，要写 `TextBlock(text=\"你好\")`。", en: "`TextBlock(\"Hi\")` with a positional argument: `TypeError`; write `TextBlock(text=\"Hi\")`." },
    { zh: "凭证里漏了 `base_url`：请求会发到 OpenAI 的默认地址，DeepSeek 的 key 在那里无效，调用失败。", en: "Leaving `base_url` out of the credential: requests go to OpenAI's default address, where a DeepSeek key isn't valid, and the call fails." },
    { zh: "直接写 `chat_with_agent()` 而不是 `asyncio.run(chat_with_agent())`：协程根本没运行，只有一个 `coroutine ... was never awaited` 警告。", en: "Writing `chat_with_agent()` instead of `asyncio.run(chat_with_agent())`: the coroutine never runs; you only get a `coroutine ... was never awaited` warning." },
    { zh: "用 `hasattr(event, \"delta\")` 打印时，思考过程和回答连在一起；只要回答就判断 `event.type == EventType.TEXT_BLOCK_DELTA`。", en: "With `hasattr(event, \"delta\")`, the reasoning and the answer run together; for the answer only, check `event.type == EventType.TEXT_BLOCK_DELTA`." },
    { zh: "照抄网上 1.x 的代码（`ReActAgent`、`InMemoryMemory`、`agentscope.init`），在 2.0.9 里直接报错。", en: "Copying 1.x code from the web (`ReActAgent`, `InMemoryMemory`, `agentscope.init`) fails straight away on 2.0.9." },
  ],
  recap: [
    { zh: "AgentScope 是阿里通义实验室开源的多智能体框架；本课程用 2.0.9，网上的 1.x 写法不能照抄。", en: "AgentScope is Alibaba Tongyi Lab's open-source multi-agent framework; the course uses 2.0.9, and 1.x code from the web won't work." },
    { zh: "数据流：用户输入 → 打包成 `Msg` → 智能体 → 大模型 → `Msg` → 拆开显示；智能体之间、和 RAG 之间也用 `Msg`。", en: "Data flow: user input → wrapped in a `Msg` → agent → LLM → `Msg` → unwrapped and shown; agents and RAG also exchange `Msg`s." },
    { zh: "消息两层：`Msg(name=..., role=\"user\", content=[TextBlock(text=...)])`，role 只有 user / assistant / system。", en: "Two layers: `Msg(name=..., role=\"user\", content=[TextBlock(text=...)])`; role is user / assistant / system." },
    { zh: "模型：`OpenAIChatModel(model=..., credential=OpenAICredential(api_key=..., base_url=...), stream=True)`，「OpenAI」指接口标准；换厂商只改 key、地址和模型名。", en: "Model: `OpenAIChatModel(model=..., credential=OpenAICredential(api_key=..., base_url=...), stream=True)`; “OpenAI” is the API standard – switching providers changes only key, address and model name." },
    { zh: "智能体：`Agent(name=..., system_prompt=..., model=...)`，同一个智能体自动记住对话。", en: "Agent: `Agent(name=..., system_prompt=..., model=...)`; the same agent remembers the conversation." },
    { zh: "非流式：`reply = await agent.reply(msg)`，`reply.get_text_content()` 取文字；协程用 `asyncio.run(...)` 启动。", en: "Non-streaming: `reply = await agent.reply(msg)`, `reply.get_text_content()` for the text; start the coroutine with `asyncio.run(...)`." },
    { zh: "流式：`async for event in agent.reply_stream(msg)`，`hasattr(event, \"delta\")` 就打印；只要回答就判断 `EventType.TEXT_BLOCK_DELTA`。", en: "Streaming: `async for event in agent.reply_stream(msg)`, print when `hasattr(event, \"delta\")`; for the answer only, check `EventType.TEXT_BLOCK_DELTA`." },
  ],
  files: [
    { path: "practice/l15_agent_todo.py", zh: "练习：补全凭证、模型、智能体和非流式聊天循环（有 TODO 提示）。", en: "Exercise: fill in the credential, model, agent and the non-streaming chat loop (with TODO hints)." },
    { path: "practice/l15_agent_solution.py", zh: "参考答案：视频实例一，非流式的多轮聊天智能体，输入 `exit` 退出。", en: "Solution: the video's example 1, a non-streaming multi-turn chat agent; type `exit` to quit." },
    { path: "practice/l15_stream_chat.py", zh: "视频实例二：流式聊天。`ONLY_ANSWER = False` 和视频一样打印所有带 delta 的事件，改成 `True` 只打印回答。", en: "The video's example 2: a streaming chat. `ONLY_ANSWER = False` prints every event with a delta like the video; `True` prints only the answer." },
  ],
});
