COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l23",
  "priority": "overview",
  "handwrite": false,
  "studyMinutes": 20,
  "source": "subtitle",
  "noPy": true,
  "summary": {
    "zh": "这一集没有代码，老师对着几张对比图讲选型：单智能体是「一个兵王 + 一堆工具」，效果全看底层模型；多智能体让几个各有专长的 Agent 组成网络、互相配合，结果更好、更稳，但系统更复杂，token 和等待时间都会成倍增加。结论是按场景选：简单、专一的任务用单 Agent 就够了。讲义附一个可运行的小例子：同一个任务，一个 Agent 直接写 vs 两个 Agent 串行接力。",
    "en": "No code in this episode: with a few comparison diagrams the instructor explains how to choose. A single agent is “one elite soldier with a pile of tools”, and its quality depends entirely on the underlying model; a multi-agent system lets several specialised agents form a network and cooperate, giving better and more stable results, but the system gets more complex and tokens and waiting time multiply. The conclusion: choose by scenario – a simple, focused task needs only one agent. The notes add a small runnable example: the same task done by one agent vs two agents in series."
  },
  "goals": [
    {
      "zh": "说出单智能体的结构和适用场景，以及「工具调用总出错」时为什么要先看模型",
      "en": "Describe a single agent's structure and best use, and why to look at the model first when tool calls keep going wrong"
    },
    {
      "zh": "说出多智能体的特点：分工、通信、并行、容错，以及「三个臭皮匠顶个诸葛亮」的道理",
      "en": "Describe what multi-agent systems offer – division of labour, communication, parallelism, fault tolerance – and the “three cobblers beat one genius” idea"
    },
    {
      "zh": "说出多智能体的三项代价：架构更复杂、token 成倍增加、等待时间变长，并据此为任务选型",
      "en": "Name the three costs – more complex architecture, multiplied tokens, longer waits – and use them to choose an approach for a task"
    },
    {
      "zh": "认出视频里的几种多智能体工作流：串行接力、并行（先分后合）、生成–评估循环、路由",
      "en": "Recognise the multi-agent workflows shown in the video: serial relay, parallel (split then merge), generate–evaluate loop, router"
    }
  ],
  "blocks": [
    {
      "t": "video",
      "zh": "这一集约 10 分钟，全程讲 PPT 上的对比图，没有写代码。老师的讲解顺序：\n- [▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=0) 单智能体：一个「兵王」挂一堆工具\n- [▶ 01:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=62) 提醒：工具调用总出问题，先看模型支不支持、能力强不强\n- [▶ 02:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=127) 多智能体：三个臭皮匠顶个诸葛亮，像蚂蚁、蜜蜂那样的群体智能\n- [▶ 03:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=222) 代价和选型：复杂度、token 成本、时间成本\n- [▶ 06:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=379) 看图：单智能体的盲点，多智能体的串行、并行、生成–评估、路由\n- [▶ 09:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=571) 总结：灵活强大，但很考验架构能力\n\n老师说单智能体「在 LangChain 里是内置的，前面学过」：他原来的课程先讲 LangChain。这套合集把 LangChain 放在了第 43–50 节，没学过也不影响看懂这一集。",
      "en": "This ~10-minute episode walks through comparison diagrams on slides; no code is written. The instructor covers, in order:\n- [▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=0) Single agent: one “elite soldier” carrying a pile of tools\n- [▶ 01:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=62) A warning: if tool calls keep failing, check whether the model supports them and how good it is at them\n- [▶ 02:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=127) Multi-agent: “three cobblers beat one genius”, collective intelligence like ants and bees\n- [▶ 03:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=222) Costs and choosing: complexity, token cost, time cost\n- [▶ 06:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=379) The diagrams: a single agent's blind spot; multi-agent serial, parallel, generate–evaluate and router flows\n- [▶ 09:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=571) Wrap-up: flexible and powerful, but demanding on your architecture skills\n\nThe instructor says single agents are “built into LangChain, which we covered earlier”: his original course taught LangChain first. This series puts LangChain in lessons 43–50, so you can follow this episode without it."
    },
    {
      "t": "h",
      "zh": "一、单智能体：一个「兵王」带一堆工具",
      "en": "1. A single agent: one elite soldier with a pile of tools"
    },
    {
      "t": "p",
      "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=0) 老师把单智能体比作「单兵作战」：只有一个 Agent，给它挂上一堆工具，所有任务都由它一个人完成，像个超人。它的特点：\n\n- **结构简单**：一个模型 + 一组工具 + 一个循环。你在第 05–07 节手写过，在 OpenAI Agents SDK 和 AgentScope 部分用框架写过。\n- **效果全看模型**：做得好不好，基本取决于它背后那个大模型的能力。\n- **适合简单、专一的任务**；任务一复杂，效果就不太理想。\n- **计算量小、响应快**：没有 Agent 之间互相协调的过程。",
      "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=0) The instructor calls a single agent “fighting alone”: there is one agent with a pile of tools attached, and it does every task by itself, like a superhero. Its traits:\n\n- **Simple structure**: one model + a set of tools + a loop. You hand-wrote one in lessons 05–07 and built them with frameworks in the OpenAI Agents SDK and AgentScope parts.\n- **Quality depends on the model**: how well it does is almost entirely down to the model behind it.\n- **Good for simple, focused tasks**; on complex tasks the results are less satisfying.\n- **Less computation, faster replies**: there is no coordination between agents."
    },
    {
      "t": "code",
      "file": {
        "zh": "示意图：单智能体",
        "en": "diagram: single agent"
      },
      "lang": "text",
      "code": {
        "zh": "输入 --> [ 大模型 ] --要用工具--> [ 工具 ]\n              ^                     |\n              +------ 工具结果 -----+\n              |\n              +--不再需要工具--> 输出",
        "en": "input --> [ model ] --needs a tool--> [ tool ]\n              ^                       |\n              +----- tool result -----+\n              |\n              +--no more tools--> output"
      }
    },
    {
      "t": "h",
      "zh": "二、工具老是调不对？先看模型",
      "en": "2. Tool calls keep going wrong? Look at the model first"
    },
    {
      "t": "p",
      "zh": "[▶ 01:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=62) 很多同学问：为什么我的 Agent 调工具老出问题，要么选错工具，要么参数不对？老师提醒两点：\n\n1. **不是所有大模型都支持工具调用**（function calling / tool calling）。用之前先查清楚。\n2. **支持的模型，能力也有高低**。这取决于模型训练时在指令微调上下了多少功夫。老师录课时的看法是：DeepSeek 的工具调用能力比 Claude、OpenAI 的模型差一些，可能出现调了不想要的工具、或者参数填得不对的情况。视频从第 05 集起改用阿里百炼的 Qwen（qwen-plus），也是因为他当时的 DeepSeek 调不了工具。",
      "en": "[▶ 01:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=62) Many students ask why their agent keeps messing up tool calls – the wrong tool, or the wrong arguments. The instructor makes two points:\n\n1. **Not every model supports tool calling** (function calling). Check before you rely on it.\n2. **Models that do support it differ in skill**, depending on how much instruction fine-tuning went into them. His view at recording time: DeepSeek was weaker at tool calling than Claude or OpenAI models, so it might call a tool you didn't want or fill in the wrong arguments. That is also why the video switches to Qwen (qwen-plus on Alibaba Bailian) from episode 05: his DeepSeek couldn't call tools back then."
    },
    {
      "t": "note",
      "zh": "现在的情况：本课程用的 `deepseek-flash` 实测能正常跑完工具调用循环。但它默认开着思考模式，这时**强制**它调用工具（`tool_choice=\"required\"` 或指定某个函数）会返回 400 错误。所以工具调用出问题时，按这个顺序排查：模型支不支持 → 工具的 `description` 和参数说明写清楚没有 → 换一个更强的模型试试。",
      "en": "Today: `deepseek-flash`, the model this course uses, runs tool-call loops fine in our tests. It runs in thinking mode by default, though, and **forcing** a tool call (`tool_choice=\"required\"` or naming a function) then returns a 400 error. So when tool calls go wrong, check in this order: does the model support tools → are the tool `description` and parameter descriptions clear → try a stronger model."
    },
    {
      "t": "check",
      "q": {
        "zh": "Agent 经常选错工具、参数也填不对。按视频的提醒，首先该想到什么？",
        "en": "An agent often picks the wrong tool and fills in wrong arguments. Following the video, what should you think of first?"
      },
      "options": [
        {
          "zh": "工具函数的代码写得太短",
          "en": "The tool functions' code is too short"
        },
        {
          "zh": "模型本身：它支不支持工具调用、这方面的能力强不强",
          "en": "The model itself: does it support tool calling, and how good is it at it"
        },
        {
          "zh": "网络太慢，请求被截断了",
          "en": "The network is slow and the request was cut off"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "老师强调两点：不是所有模型都支持工具调用；支持的模型能力也有差别。工具调用的好坏首先取决于模型。",
        "en": "The instructor stresses two points: not every model supports tool calling, and those that do differ in skill. Tool-calling quality depends on the model first."
      }
    },
    {
      "t": "h",
      "zh": "三、多智能体：三个臭皮匠，顶个诸葛亮",
      "en": "3. Multi-agent: three cobblers beat one genius"
    },
    {
      "t": "p",
      "zh": "[▶ 02:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=127) 多智能体的思路用一句俗话就能概括：三个臭皮匠，顶个诸葛亮。每个 Agent 背后的模型也许没那么强，但几个 Agent 连成一张网络，就可能出现「群体智能」——就像蚂蚁、蜜蜂，单只能力有限，成群以后却能完成复杂的工程。\n\n多智能体系统的特点：\n- 由**多个互相协作**的 Agent 组成，每个 Agent 有**自己的专业领域和功能**；\n- Agent 之间会**互相通信**，可以**并行**处理多个任务；\n- 整个系统更复杂，也更强大，**更容易扩展、更能容错**：一个 Agent 出错，不会所有 Agent 都出错，最后的结果反而更好。\n\n老师还提到，LangGraph 内置的就是这样一套系统。本课程从第 25 节起就用 LangGraph 来搭多智能体。",
      "en": "[▶ 02:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=127) The multi-agent idea fits a Chinese proverb: three cobblers together beat one genius. The model behind each agent may not be very strong, but several agents joined into a network can show “collective intelligence” – like ants or bees, each limited alone, yet able to build complex structures together.\n\nWhat a multi-agent system looks like:\n- **several cooperating** agents, each with **its own specialty and job**;\n- agents **communicate** with each other and can work on several tasks **in parallel**;\n- the whole system is more complex but also more powerful, **easier to scale and more fault-tolerant**: when one agent makes a mistake, not all of them do, so the final result can be better.\n\nThe instructor also notes that LangGraph has this kind of system built in. From lesson 25 on, this course uses LangGraph to build multi-agent systems."
    },
    {
      "t": "h",
      "zh": "四、代价和选型：复杂、费 token、费时间",
      "en": "4. Costs and choosing: complexity, tokens, time"
    },
    {
      "t": "p",
      "zh": "[▶ 03:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=222) 好处之外，老师花了不少时间讲代价：\n\n- **系统更复杂**：哪怕不是 AI 应用，普通软件也一样——系统越复杂，越难保持稳定、越难维护，对架构的要求也越高。\n- [▶ 04:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=286) **成本更高**：一个 Agent 只有它自己在消耗 token；换成多个 Agent，每个都要消耗，token 用量成倍增加。做 AI 应用一定要有成本意识。\n- **时间更长**：单智能体只等一个模型推理；多智能体里每个模型都要推理，等待时间叠加起来。\n\n| 对比 | 单智能体 | 多智能体 |\n|---|---|---|\n| 结构 | 一个 Agent + 一堆工具，比较固定 | 多个 Agent 协作，要按场景自己设计 |\n| 适合 | 简单、专一的任务 | 复杂、对结果质量要求高的任务 |\n| token 消耗 | 少 | 成倍增加 |\n| 响应时间 | 快 | 慢（每个 Agent 都要推理） |\n| 结果 | 只靠一个模型 | 可以互相补充、互相检查，更稳 |\n| 对架构能力的要求 | 低 | 高 |",
      "en": "[▶ 03:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=222) Beyond the benefits, the instructor spends a good while on the costs:\n\n- **A more complex system**: as with any software, AI or not, the more complex it is, the harder it is to keep stable and maintain, and the more it asks of your architecture.\n- [▶ 04:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=286) **Higher cost**: with one agent only that agent consumes tokens; with several, each one does, so token usage multiplies. Building AI apps means keeping an eye on cost.\n- **More time**: a single agent waits for one model; in a multi-agent system every model has to run, and the waits add up.\n\n| Aspect | Single agent | Multi-agent |\n|---|---|---|\n| Structure | One agent + many tools, fairly fixed | Several cooperating agents, designed per scenario |\n| Good for | Simple, focused tasks | Complex tasks that need high-quality results |\n| Tokens | Few | Multiplied |\n| Response time | Fast | Slow (every agent has to run) |\n| Result | Rests on one model | Agents complement and check each other – more stable |\n| Architecture skill needed | Low | High |"
    },
    {
      "t": "p",
      "zh": "[▶ 04:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=253) 所以选型要看场景，两者没有绝对的好坏：\n- 任务简单、专一，一个 Agent 就能解决 → 用单智能体。硬上多智能体，只会让架构变复杂、成本和时间都上去。老师说前面的实战案例就属于这种情况。\n- 场景复杂 → 多智能体更合适。老师的例子：一个 Agent 专门处理文本，一个专门处理图片（多模态），一个专门负责写作，几个配合起来，效果可能比一个 Agent 好。\n\n做决定前想清楚三件事：时间成本、token 成本，以及你有没有驾驭复杂系统的架构能力。",
      "en": "[▶ 04:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=253) So the choice depends on the scenario; neither is better in general:\n- A simple, focused task that one agent can handle → use a single agent. Forcing multi-agent onto it only makes the architecture more complex and raises cost and time. The instructor says the earlier hands-on case was exactly this kind of task.\n- A complex scenario → multi-agent fits better. His example: one agent handles text, one handles images (multimodal), one does the writing; together they may beat a single agent.\n\nBefore deciding, weigh three things: time cost, token cost, and whether you have the architecture skills to manage a complex system."
    },
    {
      "t": "warn",
      "zh": "经验法则：**先用一个 Agent 把功能跑通**，确实遇到复杂度或质量瓶颈时，再考虑拆成多个 Agent。不要为了显得高级而上多智能体。",
      "en": "Rule of thumb: **get it working with one agent first**, and consider several agents only when you really hit a complexity or quality ceiling. Don't go multi-agent just to look sophisticated."
    },
    {
      "t": "h",
      "zh": "五、看图：单智能体的盲点，多智能体怎么补",
      "en": "5. The diagrams: a single agent's blind spot, and how multi-agent helps"
    },
    {
      "t": "p",
      "zh": "[▶ 06:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=379) 单智能体的图（上面第一节那张）是「输入 → 模型和工具来回循环 → 输出」。它的问题在于：结果好不好，**只由它自己这一个「大脑」来判断**。老师引了一句古话「独学而无友，则孤陋而寡闻」：一个人闷头学，容易出了偏差还不自知。Agent 也一样，它觉得自己的答案没问题，实际上可能已经偏离了目标。\n\n[▶ 07:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=442) 多智能体的工作流可以克服这一点。最简单的是**串行**：第一个模型处理完，交给第二个模型接着处理。这会带来一些冗余（多调用一次），但结果能更上一层楼。[▶ 07:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=474) 老师的例子：任务是写中文材料，第一步用 OpenAI 的模型出一个基础版本（他认为它的中文调教弱一些），再交给 DeepSeek 加工，因为 DeepSeek 的训练数据里有不少中文写作、公文写作的内容。两步下来，比只用一个模型的效果好。",
      "en": "[▶ 06:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=379) The single-agent diagram (the one in part 1) is “input → model and tools loop → output”. Its weakness: whether the result is good is **judged only by its own single “brain”**. The instructor quotes an old saying – study alone, without friends, and you end up narrow and ill-informed: working alone, you can drift off course without noticing. An agent is the same: it thinks its answer is fine while it may have strayed from the goal.\n\n[▶ 07:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=442) Multi-agent workflows fix this. The simplest is **serial**: the first model finishes, the second continues from its output. This adds some redundancy (one more call), but lifts the result. [▶ 07:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=474) His example: the task is Chinese writing; first an OpenAI model produces a basic version (he finds its Chinese tuning weaker), then DeepSeek polishes it, since its training data includes plenty of Chinese and official-document writing. After two steps the result beats either model alone."
    },
    {
      "t": "p",
      "zh": "下面把这个串行例子写成代码。两个 Agent 都用 DeepSeek，靠不同的 system 提示词分工：起草人先写初稿，公文写作专家再把初稿改正式。注意第二个 Agent 的输入，就是第一个 Agent 的输出。",
      "en": "Here is that serial example as code. Both agents use DeepSeek and are told apart by their system prompts: a drafter writes a first version, then an official-writing expert makes it formal. Note that the second agent's input is the first agent's output."
    },
    {
      "t": "code",
      "file": "single_vs_serial.py",
      "run": "mock",
      "code": {
        "zh": "from llm import client, MODEL\n\ndef run_agent(system_prompt, task):\n    \"\"\"最简单的「Agent」：自己的 system 提示词 + 一个任务，调用一次模型。\"\"\"\n    response = client.chat.completions.create(\n        model=MODEL,\n        messages=[\n            {\"role\": \"system\", \"content\": system_prompt},\n            {\"role\": \"user\", \"content\": task},\n        ],\n    )\n    # 一次返回两个值：回答 + 这次用掉的 token 数（第 07 节）\n    return response.choices[0].message.content, response.usage.total_tokens\n\ntask = \"通知全体员工：本周五下午 3 点在 302 会议室参加消防安全培训。\"\n\n# 方案一：单智能体，调用 1 次\nanswer, tokens = run_agent(\"你是办公室助理，把要求写成一则简短的通知。\", task)\nprint(\"【单智能体】\", answer)\nprint(\"  调用 1 次，共\", tokens, \"个 token\\n\")\n\n# 方案二：两个 Agent 串行接力，调用 2 次\ndraft, t1 = run_agent(\"你是办公室助理，先列出通知要点，写一份初稿。\", task)\nfinal, t2 = run_agent(\"你是公文写作专家，把初稿改成格式规范的正式通知。\", draft)\nprint(\"【串行·初稿】\", draft)\nprint(\"【串行·定稿】\", final)\nprint(\"  调用 2 次，共\", t1 + t2, \"个 token\")",
        "en": "from llm import client, MODEL\n\ndef run_agent(system_prompt, task):\n    \"\"\"The simplest “agent”: its own system prompt + one task, one model call.\"\"\"\n    response = client.chat.completions.create(\n        model=MODEL,\n        messages=[\n            {\"role\": \"system\", \"content\": system_prompt},\n            {\"role\": \"user\", \"content\": task},\n        ],\n    )\n    # return two values at once: the answer + tokens used by this call (lesson 07)\n    return response.choices[0].message.content, response.usage.total_tokens\n\ntask = \"Tell all staff: fire-safety training in room 302 this Friday at 3 pm.\"\n\n# Option 1: one agent, 1 call\nanswer, tokens = run_agent(\"You are an office assistant. Turn the request into a short notice.\", task)\nprint(\"[single agent]\", answer)\nprint(\"  1 call,\", tokens, \"tokens\\n\")\n\n# Option 2: two agents in series, 2 calls\ndraft, t1 = run_agent(\"You are an office assistant. List the key points, then write a first draft.\", task)\nfinal, t2 = run_agent(\"You are an expert in formal writing. Rewrite the draft as a properly formatted official notice.\", draft)\nprint(\"[serial: draft]\", draft)\nprint(\"[serial: final]\", final)\nprint(\"  2 calls,\", t1 + t2, \"tokens\")"
      },
      "note": {
        "zh": "网页里用的是模拟模型，回答是固定格式，token 也是估算的，只用来看清流程。本地运行 `practice/l23_single_vs_serial.py` 会调用真实的 DeepSeek（3 次）。制作讲义时实测：单智能体约 300 个 token、2 秒；串行接力约 1400 个 token、6 秒，定稿确实更像正式公文（有标题、分条列出时间地点和要求）。质量上去了，成本和等待时间也翻了几倍——正是老师说的取舍。",
        "en": "The browser uses a mock model: canned replies and estimated token counts, just to show the flow. Running `practice/l23_single_vs_serial.py` locally calls the real DeepSeek (3 calls). A test run while writing these notes: the single agent used about 300 tokens and 2 seconds; the serial pair about 1,400 tokens and 6 seconds, and its final version really did read more like an official notice (a title, numbered time / place / requirements). Better quality, several times the cost and waiting – exactly the trade-off the instructor describes."
      }
    },
    {
      "t": "p",
      "zh": "[▶ 08:26](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=506) 除了串行，图上还有几种常见的多智能体工作流：",
      "en": "[▶ 08:26](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=506) Besides serial, the slide shows a few more common multi-agent workflows:"
    },
    {
      "t": "code",
      "file": {
        "zh": "示意图：几种多智能体工作流",
        "en": "diagram: multi-agent workflows"
      },
      "lang": "text",
      "code": {
        "zh": "串行接力：     输入 -> [Agent A] -> [Agent B] -> 输出\n\n并行（先分后合）：      +-> [Agent A] -+\n                  输入 -+-> [Agent B] -+-> 汇总 -> 输出\n                        +-> [Agent C] -+\n\n生成-评估循环： 输入 -> [生成] -> [评估] --通过--> 输出\n                        ^          |\n                        +--不通过--+\n\n路由：         输入 -> [路由] --文本--> [文本 Agent]\n                              --图片--> [图片 Agent]",
        "en": "serial relay:  input -> [agent A] -> [agent B] -> output\n\nparallel (split, then merge):  +-> [agent A] -+\n                        input -+-> [agent B] -+-> combine -> output\n                               +-> [agent C] -+\n\ngenerate-evaluate loop:  input -> [generate] -> [evaluate] --pass--> output\n                                     ^              |\n                                     +----fail------+\n\nrouter:  input -> [router] --text---> [text agent]\n                           --image--> [image agent]"
      }
    },
    {
      "t": "p",
      "zh": "- **并行，先分后合**：几个 Agent 同时处理各自的部分，最后汇总。后面第 29 节的 map-reduce 就是这种结构。\n- [▶ 08:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=538) **生成–评估循环**：有点像 ReAct，只不过是在 Agent 之间循环。一个 Agent 负责生成，另一个负责评估；评估不通过就把意见反馈给生成的 Agent 重写，直到通过才输出。\n- **路由**：先判断该交给谁，再分给对应的 Agent。\n\n老师的结论：选了多智能体，系统更灵活、更智能，输出也更可靠、更稳定。",
      "en": "- **Parallel, split then merge**: several agents work on their own parts at the same time, then the results are combined. Map-reduce in lesson 29 has exactly this shape.\n- [▶ 08:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=538) **Generate–evaluate loop**: a bit like ReAct, but looping between agents. One agent generates, another evaluates; if it fails, the feedback goes back to the generator for a rewrite, until it passes and is output.\n- **Router**: first decide who should handle the input, then pass it to that agent.\n\nThe instructor's verdict: with multiple agents the system is more flexible and smarter, and its output more reliable and stable."
    },
    {
      "t": "check",
      "q": {
        "zh": "「一个 Agent 写稿，另一个 Agent 打分，不合格就把意见交回去重写，直到合格」是哪种工作流？",
        "en": "“One agent writes, another grades it; if it fails, the feedback goes back for a rewrite until it passes.” Which workflow is this?"
      },
      "options": [
        {
          "zh": "串行接力",
          "en": "Serial relay"
        },
        {
          "zh": "并行，先分后合",
          "en": "Parallel, split then merge"
        },
        {
          "zh": "生成–评估循环",
          "en": "Generate–evaluate loop"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "生成和评估之间形成一个循环，评估不通过就回到生成，这是视频里「类似 ReAct、但在 Agent 之间循环」的结构。",
        "en": "Generation and evaluation form a loop that returns to the generator on failure – the video's “like ReAct, but looping between agents” structure."
      }
    },
    {
      "t": "h",
      "zh": "六、老师的总结：灵活，但考验架构能力",
      "en": "6. The instructor's wrap-up: flexible, but a test of your architecture skills"
    },
    {
      "t": "p",
      "zh": "[▶ 09:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=571) 多智能体有好有坏：\n- **好**：灵活、强大，结果更可靠。\n- **坏**：系统架构复杂，框架替你封装的东西少（封装层次低），怎么搭要你自己根据场景设计，非常考验架构能力。\n\n单智能体则基本就是固定的那个结构：把它搭起来，把工具写好，再优化一下流程，就能跑。多智能体没有现成的固定结构，需要你按场景灵活设计——下一节先看看常见的几种架构长什么样。",
      "en": "[▶ 09:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=24&t=571) Multi-agent has upsides and downsides:\n- **Upside**: flexible and powerful, with more reliable results.\n- **Downside**: a complex architecture, and little is packaged for you (a low level of encapsulation), so you must design the setup yourself for each scenario – a real test of your architecture skills.\n\nA single agent, by contrast, is basically one fixed structure: build it, write good tools, tune the process, and it runs. Multi-agent has no ready-made shape; you design it flexibly per scenario. The next lesson looks at the common architectures."
    },
    {
      "t": "tip",
      "zh": "下一节（24）介绍常见的多智能体架构；从第 25 节开始用 LangGraph 把这些结构真正搭出来。",
      "en": "The next lesson (24) introduces the common multi-agent architectures; from lesson 25 on, LangGraph builds these structures for real."
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "视频里老师把单智能体比作什么？它的效果主要取决于什么？",
        "en": "What does the instructor compare a single agent to, and what does its quality mainly depend on?"
      },
      "options": [
        {
          "zh": "一支分工明确的团队；取决于成员之间的沟通",
          "en": "A team with clear roles; it depends on how the members communicate"
        },
        {
          "zh": "一条流水线；取决于工序的多少",
          "en": "An assembly line; it depends on the number of stations"
        },
        {
          "zh": "一个带着一堆工具单兵作战的「兵王」；取决于它背后大模型的能力",
          "en": "An elite soldier fighting alone with a pile of tools; it depends on the underlying model's ability"
        },
        {
          "zh": "一群蚂蚁；取决于数量",
          "en": "An ant colony; it depends on numbers"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "单智能体只有一个 Agent，挂一堆工具完成所有任务，做得好不好基本看它用的模型。团队、蚂蚁是用来比喻多智能体的。",
        "en": "A single agent is one agent doing everything with its tools, so its quality rests on its model. Teams and ants are the multi-agent analogies."
      }
    },
    {
      "q": {
        "zh": "关于工具调用，下面哪句符合视频里的提醒？",
        "en": "Which statement matches the video's warning about tool calling?"
      },
      "options": [
        {
          "zh": "不是所有大模型都支持工具调用；支持的模型，能力也有差别",
          "en": "Not every model supports tool calling, and those that do differ in skill"
        },
        {
          "zh": "所有大模型调用工具的能力都一样",
          "en": "All models are equally good at tool calling"
        },
        {
          "zh": "只要工具函数写对了，任何模型都能调对",
          "en": "If the tool function is correct, any model will call it correctly"
        },
        {
          "zh": "工具调用出错一定是网络问题",
          "en": "Tool-call errors are always network problems"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "老师的两点提醒：先确认模型支持工具调用；即使支持，能力也受训练时指令微调程度的影响。",
        "en": "His two points: first make sure the model supports tool calling; even then, its skill depends on its instruction fine-tuning."
      }
    },
    {
      "q": {
        "zh": "下面哪一项**不是**视频里提到的多智能体代价？",
        "en": "Which is **not** one of the multi-agent costs mentioned in the video?"
      },
      "options": [
        {
          "zh": "系统架构更复杂，更难维护",
          "en": "A more complex architecture that is harder to maintain"
        },
        {
          "zh": "每个 Agent 都消耗 token，总用量成倍增加",
          "en": "Every agent consumes tokens, so the total multiplies"
        },
        {
          "zh": "每个 Agent 都要推理，等待时间变长",
          "en": "Every agent has to run, so waiting time grows"
        },
        {
          "zh": "多智能体系统里的 Agent 不能再调用工具",
          "en": "Agents in a multi-agent system can no longer call tools"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "代价是复杂度、token 成本、时间成本三项。多智能体里的 Agent 照样可以调用工具。",
        "en": "The costs are complexity, token cost and time cost. Agents in a multi-agent system can still call tools."
      }
    },
    {
      "q": {
        "zh": "任务是「把一句中文翻译成英文」，按视频的选型建议该怎么做？",
        "en": "The task is “translate one Chinese sentence into English”. Following the video's advice, what should you use?"
      },
      "options": [
        {
          "zh": "监管者 + 三个专家的多智能体系统",
          "en": "A supervisor plus three specialist agents"
        },
        {
          "zh": "单智能体（甚至一次 API 调用）就够了",
          "en": "A single agent – or even one API call – is enough"
        },
        {
          "zh": "并行：每个词交给一个 Agent",
          "en": "Parallel: one agent per word"
        },
        {
          "zh": "生成–评估循环，评估十轮",
          "en": "A generate–evaluate loop with ten rounds"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "简单、专一的任务用单智能体。硬上多智能体，只会让架构更复杂、token 和时间成本更高。",
        "en": "A simple, focused task needs one agent. Forcing multiple agents only adds complexity, tokens and time."
      }
    },
    {
      "q": {
        "zh": "老师引用「独学而无友」，想说明单智能体的什么问题？",
        "en": "The instructor quotes the saying about “studying alone without friends”. Which single-agent problem does it illustrate?"
      },
      "options": [
        {
          "zh": "单智能体不能使用工具",
          "en": "A single agent cannot use tools"
        },
        {
          "zh": "单智能体的响应速度太慢",
          "en": "A single agent replies too slowly"
        },
        {
          "zh": "结果只由它自己这一个「大脑」判断，可能偏离了目标却不自知",
          "en": "Its result is judged only by its own single “brain”, so it may stray from the goal without noticing"
        },
        {
          "zh": "单智能体消耗的 token 太多",
          "en": "A single agent uses too many tokens"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "没有别的 Agent 帮它检查，它认为对的答案可能已经跑偏。串行加工、生成–评估循环等多智能体结构可以弥补这一点。",
        "en": "With no other agent checking, an answer it believes correct may be off target. Serial refinement or a generate–evaluate loop can make up for this."
      }
    },
    {
      "q": {
        "zh": "视频里的串行例子（先用 OpenAI 模型出基础版本，再交给 DeepSeek 加工）为什么能提高质量？",
        "en": "Why does the video's serial example (an OpenAI model writes a basic version, then DeepSeek refines it) improve quality?"
      },
      "options": [
        {
          "zh": "因为调用两次一定比一次便宜",
          "en": "Because two calls are always cheaper than one"
        },
        {
          "zh": "后一个模型在前一个的结果上继续加工，而且它在中文写作上更擅长，各用所长",
          "en": "The second model builds on the first one's result and is better at Chinese writing – each plays to its strengths"
        },
        {
          "zh": "因为两个模型会同时运行",
          "en": "Because both models run at the same time"
        },
        {
          "zh": "因为第二个模型看不到第一个模型的输出",
          "en": "Because the second model never sees the first one's output"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "串行就是「前一个的输出是后一个的输入」。代价是多一次调用（冗余），换来更好的结果。",
        "en": "Serial means “the output of one is the input of the next”. The price is an extra call (redundancy); the gain is a better result."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "两个 Agent 串行接力",
        "en": "Two agents in series"
      },
      "code": {
        "zh": "def run_agent(system_prompt, task):\n    response = client.chat.completions.create(\n        model=MODEL,\n        messages=[\n            {\"role\": \"[[system]]\", \"content\": system_prompt},\n            {\"role\": \"[[user]]\", \"content\": task},\n        ],\n    )\n    return response.choices[0].message.[[content]], response.[[usage]].total_tokens\n\ndraft, t1 = run_agent(\"你是办公室助理，写一份初稿。\", task)\nfinal, t2 = run_agent(\"你是公文写作专家，把初稿改正式。\", [[draft]])\nprint(\"一共用了\", [[t1 + t2|t2 + t1]], \"个 token\")",
        "en": "def run_agent(system_prompt, task):\n    response = client.chat.completions.create(\n        model=MODEL,\n        messages=[\n            {\"role\": \"[[system]]\", \"content\": system_prompt},\n            {\"role\": \"[[user]]\", \"content\": task},\n        ],\n    )\n    return response.choices[0].message.[[content]], response.[[usage]].total_tokens\n\ndraft, t1 = run_agent(\"You are an office assistant. Write a first draft.\", task)\nfinal, t2 = run_agent(\"You are a formal-writing expert. Make the draft formal.\", [[draft]])\nprint(\"used\", [[t1 + t2|t2 + t1]], \"tokens in total\")"
      },
      "explain": {
        "zh": "每个 Agent 有自己的 system 提示词；第一个 Agent 的输出 `draft` 就是第二个 Agent 的输入。两次调用的 token 要加起来算。",
        "en": "Each agent has its own system prompt; the first agent's output `draft` is the second agent's input. Add up the tokens of both calls."
      }
    }
  ],
  "pitfalls": [
    {
      "zh": "为了显得高级而上多智能体：简单任务用多个 Agent，只会更复杂、更费 token、更慢。",
      "en": "Going multi-agent to look sophisticated: on a simple task, several agents only add complexity, tokens and waiting time."
    },
    {
      "zh": "工具调用总出错时只查自己的代码，不看模型：先确认模型支持工具调用，再看它这方面的能力（以及工具说明写得清不清楚）。",
      "en": "Debugging only your own code when tool calls keep failing: first check that the model supports tool calling and how good it is at it (and whether the tool descriptions are clear)."
    },
    {
      "zh": "只算一个 Agent 的成本：多智能体里每个 Agent 都要推理，token 和等待时间都要加起来算。",
      "en": "Counting the cost of one agent only: every agent in the system runs, so add up all the tokens and waiting time."
    },
    {
      "zh": "以为多智能体一定更稳：只有架构设计得当，才能得到「更可靠、更稳定」的好处；设计不好反而更难维护。",
      "en": "Assuming multi-agent is always more stable: you only get “more reliable” results with a sound design; a poor one is just harder to maintain."
    }
  ],
  "recap": [
    {
      "zh": "单智能体 = 一个 Agent + 一堆工具，结构简单、响应快，效果全看模型，适合简单专一的任务。",
      "en": "Single agent = one agent + many tools: simple and fast, quality depends on the model, good for simple focused tasks."
    },
    {
      "zh": "工具调用出问题先看模型：不是所有模型都支持，支持的能力也有高低。",
      "en": "When tool calls go wrong, check the model first: not all support it, and skill varies."
    },
    {
      "zh": "多智能体 = 多个各有专长的 Agent 协作、通信、并行，三个臭皮匠顶个诸葛亮，更可扩展、更能容错。",
      "en": "Multi-agent = specialised agents cooperating, communicating and working in parallel: three cobblers beat one genius, with better scaling and fault tolerance."
    },
    {
      "zh": "代价：架构复杂、token 成倍增加、等待时间变长——按场景选型。",
      "en": "Costs: complex architecture, multiplied tokens, longer waits – choose by scenario."
    },
    {
      "zh": "常见工作流：串行接力、并行先分后合、生成–评估循环、路由。",
      "en": "Common workflows: serial relay, parallel split-and-merge, generate–evaluate loop, router."
    }
  ],
  "files": [
    {
      "path": "practice/l23_single_vs_serial.py",
      "zh": "演示：同一个通知任务，单智能体写一次 vs 两个 Agent 串行接力，对比结果、调用次数、token 和耗时（调用 3 次真实模型）。",
      "en": "Demo: the same notice written by one agent vs two agents in series, comparing results, calls, tokens and time (3 real model calls)."
    }
  ]
});
