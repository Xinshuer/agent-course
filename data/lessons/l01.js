COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l01",
  "priority": "overview",
  "handwrite": false,
  "studyMinutes": 50,
  "source": "subtitle",
  "summary": {
    "zh": "Agent（智能体）是能感知环境、并根据自己的目标自主行动的独立个体；这门课讲的是以大模型为「大脑」的智能体。这一集全是概念，讲义按视频的顺序整理：三天训练营的安排、为什么译作「智能体」、教材里的宽泛定义和生活中的例子、为什么用大模型来做、复旦综述的「感知 · 大脑 · 行动」框架、大模型 + 记忆 + 规划 + 工具四个组件以及哪两个要按业务定制，聊天机器人、AI 助理和智能体的区别，最后是一句话定义。讲义末尾另外加了一个能运行的小演示，让你看到普通调用和 Agent 循环的不同。",
    "en": "An agent is an independent entity that perceives its environment and acts on its own towards its goals; this course is about agents with a large language model as their “brain”. The episode is all concepts, and these notes follow its order: the plan of the three-day boot camp, why Chinese calls an agent 智能体, the textbook's broad definition with everyday examples, why LLMs are used to build agents, the “perception · brain · action” framework from a Fudan University survey, the four components (LLM + memory + planning + tools) and which two need custom work, how chatbots, AI assistants and agents differ, and finally a one-line definition. At the end the notes add a small runnable demo that shows a plain model call next to an agent loop."
  },
  "goals": [
    {
      "zh": "用自己的话说清 Agent（智能体）是什么，以及为什么不译作「代理」",
      "en": "Say in your own words what an agent is, and why Chinese calls it 智能体 rather than 代理 (“proxy”)"
    },
    {
      "zh": "说出教材对智能体的宽泛定义（感知环境、作用于环境），并举出生活中的例子",
      "en": "Give the textbook's broad definition of an agent (perceives and acts on its environment) with everyday examples"
    },
    {
      "zh": "说出视频给的两个理由：为什么用大模型来做智能体",
      "en": "Give the video's two reasons for building agents on LLMs"
    },
    {
      "zh": "说出复旦综述的三个模块（感知、大脑、行动）和落地时的四个组件（大模型、记忆、规划、工具），并知道哪两个组件要按业务定制",
      "en": "Name the Fudan survey's three modules (perception, brain, action) and the four practical components (LLM, memory, planning, tools), and know which two need custom work"
    },
    {
      "zh": "区分聊天机器人、AI 助理和智能体：关键在于被动响应还是围绕目标主动推进",
      "en": "Tell chatbots, AI assistants and agents apart: the key is passive response versus actively pursuing a goal"
    },
    {
      "zh": "（讲义补充）知道工具是由你的代码执行的，模型只负责提出请求",
      "en": "(Extra) Know that your code runs the tools; the model only asks for them"
    }
  ],
  "blocks": [
    {
      "t": "video",
      "zh": "这一集约 32 分钟，全是概念，没有代码。讲义的一到八部分按视频的顺序整理，每部分开头的 ▶ 时间链接可以直接跳到视频里对应的位置。第九部分的代码演示是讲义自己加的，视频里没有。",
      "en": "This episode runs about 32 minutes: all concepts, no code. Parts 1–8 of these notes follow the video's order, and the ▶ time link at the start of each part jumps to that point in the video. The code demo in part 9 is an extra from these notes and is not in the video."
    },
    {
      "t": "h",
      "zh": "一、开场：三天的安排和今天讲什么",
      "en": "1. Opening: the three-day plan and today's agenda"
    },
    {
      "t": "p",
      "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=0) 这一集是一个「三天训练营」的第一天。讲师先交代三天怎么安排：\n\n| 天 | 对应集数 | 内容 |\n|---|---|---|\n| 第一天 | 01–03 | 理论：Agent 是什么、怎么分类、由什么组成、有哪些经典应用，几乎没有代码 |\n| 第二天 | 04–07 | 技术细节：把理论变成一个真正能运行、能使用的智能体 |\n| 第三天 | 08 起 | 用成熟的框架：框架把技术细节封装起来，开发更方便，代码更简洁 |\n\n[▶ 01:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=62) 说到框架，老师提到了历史较长的 LangChain 和 LlamaIndex（2022–2023 年出现），以及第三天要用的 OpenAI Agents SDK——它在录制那年（2025 年）的 3 月才发布。那段时间前后，微软、谷歌、Hugging Face、OpenAI 等大公司纷纷推出自己的 Agent 框架，从侧面说明了大厂对 Agent 的重视。\n\n[▶ 02:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=127) 第一天要讲四件事，正好对应讲义的 01–03 节：\n1. 基本概念：Agent 到底是什么（本节）\n2. 分类：Agent 没有统一的标准，不同的分类各有特点，做项目时要先决定用哪一类（02 节）\n3. 核心组件和基本策略：Agent 由哪些部分组成，它的「智能」体现在哪里（03 节）\n4. 经典应用：Agent 不只存在于论文里，已经有很多落地的应用（03 节）",
      "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=0) This episode is day 1 of a “three-day boot camp”. The instructor first lays out the three days:\n\n| Day | Episodes | Content |\n|---|---|---|\n| Day 1 | 01–03 | Theory: what an agent is, how agents are classified, what they are made of, classic applications – almost no code |\n| Day 2 | 04–07 | Technical details: turning the theory into an agent that actually runs and can be used |\n| Day 3 | 08 on | Mature frameworks: they wrap the technical details so development is easier and the code shorter |\n\n[▶ 01:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=62) On frameworks, he mentions the older LangChain and LlamaIndex (which appeared in 2022–2023) and the OpenAI Agents SDK used on day 3, released only in March of the year he recorded (2025). Around that time Microsoft, Google, Hugging Face, OpenAI and other big companies all released agent frameworks of their own – a sign of how seriously big tech takes agents.\n\n[▶ 02:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=127) Day 1 covers four things, which map onto lessons 01–03 of these notes:\n1. Basic concepts: what an agent actually is (this lesson)\n2. Classification: there is no single standard; different classifications have different traits, and a project starts by choosing which kind to build (lesson 02)\n3. Core components and basic strategies: what an agent is made of and where its “intelligence” comes from (lesson 03)\n4. Classic applications: agents are not just in papers; many are already in real use (lesson 03)"
    },
    {
      "t": "note",
      "zh": "[▶ 03:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=191) 老师推荐的延伸读物：\n- 经典教材《人工智能：一种现代方法》（Russell 和 Norvig 著）\n- 一篇 1995 年关于智能体的论文（很可能是 Wooldridge 和 Jennings 的 Intelligent Agents: Theory and Practice）——可见「智能体」这个概念提出已经 30 多年了\n- 2023 年以来（包括 2024、2025 年）关于大模型 Agent 的新论文，走学术路线的可以多看\n\n他的建议是：不管走学术路线还是工程路线，前两份都值得读一读。",
      "en": "[▶ 03:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=191) Further reading the instructor recommends:\n- the classic textbook *Artificial Intelligence: A Modern Approach* (Russell and Norvig)\n- a 1995 paper on agents (most likely Wooldridge and Jennings, Intelligent Agents: Theory and Practice) – so the idea of an agent is more than 30 years old\n- newer papers on LLM agents from 2023 onwards (including 2024 and 2025), especially if you lean towards research\n\nHis advice: whether you go the research or the engineering route, the first two are worth reading."
    },
    {
      "t": "h",
      "zh": "二、为什么叫「智能体」",
      "en": "2. Why 智能体 (“intelligent entity”)"
    },
    {
      "t": "p",
      "zh": "[▶ 04:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=253) 英文 agent 直译过来是「代理」。可「代理」听起来像替别人跑腿的工具或代言人，表达不出 AI 领域对 agent 的设想：一个**能独立感知环境、独立做出决策、最终实现既定目标的个体**。正因为强调独立自主、以目标为导向，经典著作里通常把 AI agent 译成**智能体**。\n\n所以你会遇到好几种叫法：AI Agent、Agent、人工智能代理、智能体。课程里（这份讲义也一样）「Agent」和「智能体」混着用，意思相同。",
      "en": "[▶ 04:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=253) The literal Chinese translation of “agent” is 代理 (“proxy”). But a proxy sounds like someone's errand-runner or representative, which misses what AI has in mind: an **entity that independently perceives its environment, makes its own decisions and ends up achieving a set goal**. Because of that emphasis on autonomy and goals, classic Chinese texts translate AI agent as 智能体 (“intelligent entity”).\n\nSo you will meet several names: AI Agent, Agent, 人工智能代理 (“AI proxy”) and 智能体. The course – and these notes – use “Agent” and 智能体 interchangeably; they mean the same thing."
    },
    {
      "t": "h",
      "zh": "三、教材里的定义：能感知环境，也能作用于环境",
      "en": "3. The textbook definition: perceiving and acting on an environment"
    },
    {
      "t": "p",
      "zh": "[▶ 06:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=377) 老师从《人工智能：一种现代方法》里挑了两个观点：\n1. **智能体是研究人工智能的核心概念。** 老师的引申是：AI 的长远目标是通用人工智能，而要让绝大多数人都能简单方便地用上 AI，靠的就是智能体，所以智能体一直是 AI 的方向和目标。\n2. [▶ 06:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=408) **一个很宽泛的定义**：凡是能通过**传感器**感知环境、再通过**执行器**作用于这个环境的东西，都可以叫智能体。",
      "en": "[▶ 06:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=377) The instructor picks two ideas from *Artificial Intelligence: A Modern Approach*:\n1. **The agent is a central concept in AI.** His gloss: AI's long-term aim is general intelligence, and agents are how AI becomes simple and convenient for almost everyone to use – so agents have always been one of AI's directions and goals.\n2. [▶ 06:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=408) **A very broad definition**: anything that perceives its environment through **sensors** and acts on that environment through **actuators** can be called an agent."
    },
    {
      "t": "code",
      "lang": "text",
      "file": {
        "zh": "智能体和环境",
        "en": "agent and environment"
      },
      "code": {
        "zh": "            感知（通过传感器）\n   环境  ─────────────────────▶  智能体\n    ▲                              │\n    └──────────────────────────────┘\n        行动（通过执行器）：改变环境",
        "en": "            perceive (through sensors)\n   environment  ───────────────────▶  agent\n        ▲                               │\n        └───────────────────────────────┘\n        act (through actuators): change the environment"
      }
    },
    {
      "t": "p",
      "zh": "[▶ 07:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=439) 只要既能了解环境、又能改变环境，就符合这个定义。按这个标准，生活里的智能体其实很多：\n- **自动驾驶**：了解路况是感知，加速和刹车是行动；而它的行动又会反过来改变路况（本来不堵的可能变堵，反之亦然）\n- **扫地机器人**：根据地形决定怎么走，发现哪里脏就多扫几遍，把脏的地方变干净\n- **智能家居**：根据温度、湿度、光线自动调节和开关设备\n- **游戏里的电脑对手**：老师举的是《王者荣耀》的人机——你厉害它也厉害；你们抱团它就集合开团，你去推塔它就回来守塔\n- **AI 英语陪练**：道理一样，先了解你的情况再做出回应\n\n不过这是一个很宽、也很老的定义。这门课要讲的，是其中的一类：**以大模型为基础的智能体**。",
      "en": "[▶ 07:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=439) Anything that can both learn about its environment and change it fits the definition. By that standard there are plenty of agents in everyday life:\n- **self-driving cars**: reading the road is perceiving, speeding up or braking is acting – and those actions change the traffic in turn (a clear road may jam up, or the other way round)\n- **robot vacuums**: they choose a route from the room's layout and go over dirty spots again until they are clean\n- **smart homes**: they adjust and switch devices based on temperature, humidity and light\n- **computer opponents in games**: the instructor's example is the bots in the mobile game *Honor of Kings* – they play as well as you do, gather for a team fight when your side groups up, and fall back to defend a tower you attack\n- **AI English tutors**: the same idea – they read your situation and respond to it\n\nBut this is a broad and old definition. This course is about one kind of agent: **agents built on large language models**."
    },
    {
      "t": "check",
      "q": {
        "zh": "按教材的宽泛定义，下面哪个**不算**智能体？",
        "en": "By the textbook's broad definition, which of these is **not** an agent?"
      },
      "options": [
        {
          "zh": "扫地机器人",
          "en": "A robot vacuum"
        },
        {
          "zh": "一张纸质地图",
          "en": "A paper map"
        },
        {
          "zh": "游戏里的电脑对手",
          "en": "A computer opponent in a game"
        },
        {
          "zh": "自动驾驶汽车",
          "en": "A self-driving car"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "定义要求同时做到两件事：感知环境、并通过行动改变环境。纸质地图既不感知也不行动；其他三个都会观察环境，再做出改变环境的动作。",
        "en": "The definition needs both: perceiving the environment and acting to change it. A paper map does neither; the other three observe their surroundings and act in ways that change them."
      }
    },
    {
      "t": "h",
      "zh": "四、为什么用大模型来做智能体",
      "en": "4. Why build agents on LLMs"
    },
    {
      "t": "p",
      "zh": "[▶ 09:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=561) 这门课讨论的不是几十年前那种广义的智能体，而是**基于大语言模型的智能体**，比如用 DeepSeek、ChatGPT 这类模型做的。国内外大厂现在做的智能体，也基本都是这一类。\n\n[▶ 09:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=593) 为什么偏偏用大模型？老师给了两个理由：\n1. **能力强**：获取知识、理解内容、规划、推理，都有目共睹。他举了个例子：有人把自己的病情交给 DeepSeek 分析，再去看医生，发现医生的判断和 DeepSeek 的分析基本一致。\n2. **天生适合和人交流**：大模型很容易从人这里获取信息，也容易产出人看得懂的信息。多模态模型能读文字、图片、音频、视频，也能输出文字、图片，甚至生成视频。它本来就是为「机器和人」沟通设计的，而不是为两个程序之间高效通信设计的——拿来做智能体，这一点天生占优势。\n\n[▶ 11:26](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=686) 这些能力放到智能体身上：\n- **多模态**用来感知环境\n- **工具**用来改变环境（也能帮忙获取信息）\n- **思维链**（让模型一步步推理）用来拆解任务、求解、推理和规划\n- 大模型还能**从反馈中学习和改进**：现在不擅长的事情也有提升空间，所以前景更值得期待",
      "en": "[▶ 09:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=561) This course is not about the broad, decades-old kind of agent but about **agents built on large language models (LLMs)**, such as those made with DeepSeek or ChatGPT-style models. The agents big companies in China and abroad are building today are mostly of this kind.\n\n[▶ 09:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=593) Why LLMs in particular? The instructor gives two reasons:\n1. **They are capable**: their knowledge, understanding, planning and reasoning are plain for all to see. His example: someone had DeepSeek analyse their symptoms, then saw a doctor and found the doctor's judgement largely matched DeepSeek's analysis.\n2. **They are made for talking to people**: an LLM easily takes in information from humans and produces information humans can follow. Multimodal models read text, images, audio and video, and can output text, images and even video. They were designed for machine-to-human communication, not for efficient program-to-program messaging – a built-in advantage when you build an agent.\n\n[▶ 11:26](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=686) Applied to an agent, these abilities become:\n- **multimodality** to perceive the environment\n- **tools** to change the environment (they can also help gather information)\n- **chain-of-thought** (reasoning step by step) to break tasks down, solve them, reason and plan\n- and LLMs can **learn from feedback and improve**: what they are weak at today still has room to grow, which makes the outlook even more promising"
    },
    {
      "t": "h",
      "zh": "五、复旦综述：感知、大脑、行动",
      "en": "5. The Fudan survey: perception, brain, action"
    },
    {
      "t": "p",
      "zh": "[▶ 12:28](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=748) 2023 年，复旦大学的一个团队发表了一篇大模型 Agent 综述（The Rise and Potential of Large Language Model Based Agents: A Survey），对这类智能体做了梳理和抽象，提出一个通用框架，把它分成三部分：\n\n| 模块 | 负责什么 | 在大模型 Agent 里靠什么 |\n|---|---|---|\n| 感知 | 用各种手段获取信息：文字、图片、音频、视频，再转成模型能处理的表示（向量） | 多模态输入；工具也能辅助获取信息 |\n| 大脑 | 思考和决策：推理、规划、安排任务，并用上记忆——短期记忆是刚刚做过什么，长期记忆比如一个知识库，有了它决策更专业 | 大模型本身 |\n| 行动 | 把大脑的决策和任务安排落到实处 | 工具：以前主要是函数，现在形式更多（后面会讲） |\n\n[▶ 14:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=844) 论文的图里有个例子：用户说「看看天气，你觉得明天会下雨吗？会的话帮我把伞拿来」。\n- **感知**：看天空的照片、天气预报、卫星云图等\n- **大脑**：把这些信息和常识结合起来（比如现在是不是梅雨季节），判断明天会不会下雨\n- **行动**：不下雨就告诉用户；要下雨的话，光说一句「会下雨」还不够，它会调用工具——图里是一只机械臂——把伞递过来\n\n它不只给出结论，还把事情替你办了：自己收集信息、分析决策，再做出实际的动作，这就是智能体的样子。老师认为这个三分法很经典，以后设计或实现一个 Agent 时，可以把它当作学术上的参考。",
      "en": "[▶ 12:28](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=748) In 2023 a team at Fudan University published a survey of LLM agents (The Rise and Potential of Large Language Model Based Agents: A Survey). It organised and abstracted such agents into a general framework with three parts:\n\n| Module | Responsible for | How an LLM agent does it |\n|---|---|---|\n| Perception | Taking in information by various means – text, images, audio, video – and turning it into something the model can process (vectors) | Multimodal input; tools can also help gather information |\n| Brain | Thinking and deciding: reasoning, planning, arranging tasks, using memory – short-term memory is what just happened, long-term memory is e.g. a knowledge base that makes decisions more expert | The LLM itself |\n| Action | Carrying out the brain's decisions and task plans | Tools: once mostly functions, now many more forms (covered later) |\n\n[▶ 14:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=844) A figure in the paper gives an example: a user says “Check the weather – do you think it will rain tomorrow? If so, bring me the umbrella.”\n- **Perception**: look at photos of the sky, the weather forecast, satellite cloud images and so on\n- **Brain**: combine that with background knowledge (is this the rainy season?) and judge whether it will rain\n- **Action**: if not, tell the user; if so, merely saying “it will rain” isn't enough – it uses a tool (a robot arm in the figure) to hand over the umbrella\n\nIt doesn't just reach a conclusion; it gets the job done. Gathering information, analysing and deciding, then taking real action – that is what an agent looks like. The instructor considers this three-part split a classic and a good academic reference when you design or build an agent."
    },
    {
      "t": "check",
      "q": {
        "zh": "在复旦综述的例子里，Agent 用机械臂把伞递给用户。这属于哪个模块？",
        "en": "In the Fudan survey's example, the agent hands over the umbrella with a robot arm. Which module is that?"
      },
      "options": [
        {
          "zh": "行动",
          "en": "Action"
        },
        {
          "zh": "感知",
          "en": "Perception"
        },
        {
          "zh": "大脑",
          "en": "Brain"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "感知负责获取信息，大脑负责判断和决策，**行动**负责把决定落到实处、改变环境——递伞就是对外部世界做出的动作。",
        "en": "Perception takes information in, the brain judges and decides, and **action** carries the decision out and changes the environment – handing over the umbrella is an action on the outside world."
      }
    },
    {
      "t": "h",
      "zh": "六、落地的四个组件：大模型、记忆、规划、工具",
      "en": "6. Four components in practice: LLM, memory, planning, tools"
    },
    {
      "t": "p",
      "zh": "[▶ 17:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=1029) 除了学术框架，还可以直接观察已经落地的产品：到 2025 年，大模型智能体早就不只存在于论文里了。从主流的产品里能看出一个规律：**一个 Agent 基本由四个组件构成**。\n\n| 组件 | 作用 | 课程里在哪学 |\n|---|---|---|\n| 大模型 | 理解目标、推理、决定下一步，是一切的基础 | 04 调用模型 |\n| 记忆 | 保存做决策要用的信息（分短期和长期） | 06 记忆管理、17 RAG、32 长期记忆 |\n| 规划 | 把任务拆开、安排步骤；有很多种不同的方法 | 03 组成和策略、07 ReAct |\n| 工具 | 对外部世界产生作用，并拿到反馈 | 05 定义工具、11 MCP |\n\n记忆分两种：**短期记忆**放眼下要用的东西，比如最近的几轮对话；**长期记忆**放过去的、历史上的内容，同样可以作为决策依据——回忆起来可以慢一点，但必须能稳定地保存足够久。\n\n视频里那张示意图是 2023 年画的，图中的工具还都是「调用一段代码」的样子。现在工具的用法多了很多：调用函数、调用接口、通过 **MCP** 接入现成的工具服务，还有让智能体之间互相调用的 **A2A**，整体更成熟了（03 节会再讲 MCP 和 A2A）。",
      "en": "[▶ 17:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=1029) Besides the academic framework, you can simply look at products already in use: by 2025, LLM agents had long since left the papers. Mainstream products show a pattern: **an agent is basically built from four components**.\n\n| Component | What it does | Where in this course |\n|---|---|---|\n| LLM | Understands the goal, reasons, picks the next step – the foundation of everything | 04 calling the model |\n| Memory | Keeps the information decisions need (short-term and long-term) | 06 memory management, 17 RAG, 32 long-term memory |\n| Planning | Breaks the task down and orders the steps; there are many different methods | 03 components and strategies, 07 ReAct |\n| Tools | Act on the outside world and bring back feedback | 05 defining tools, 11 MCP |\n\nMemory comes in two kinds: **short-term memory** holds what is needed right now, such as the last few turns of conversation; **long-term memory** holds past, historical content that can also inform decisions – recall may be slower, but it must be stored reliably for long enough.\n\nThe diagram in the video was drawn in 2023, and its tools all look like “call a piece of code”. Tools now come in many more forms: function calls, API calls, ready-made tool services plugged in through **MCP**, and **A2A** for agents calling other agents – the whole area has matured (lesson 03 returns to MCP and A2A)."
    },
    {
      "t": "note",
      "zh": "补充：这张「四个组件」示意图一般认为出自 Lilian Weng 2023 年的文章 [LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/)，常被概括成一个公式：**Agent = 大模型 + 记忆 + 规划 + 工具**。",
      "en": "Extra: the “four components” diagram is generally credited to Lilian Weng's 2023 article [LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/), and is often summed up as a formula: **Agent = LLM + memory + planning + tools**."
    },
    {
      "t": "p",
      "zh": "[▶ 19:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=1156) 从落地的角度看，这四个组件的成熟度差别很大：\n\n| 组件 | 成熟吗 | 为什么 |\n|---|---|---|\n| 大模型 | 成熟 | 付费的、开源的、多模态的模型都有很多，直接拿来用；自己训练一个模型太吃力，一般是大公司在做 |\n| 记忆 | 成熟 | 短期记忆直接放内存或文件；长期记忆用关系型数据库，AI 领域更常用向量数据库——数据库本身就是有大量成熟产品的专业领域 |\n| 规划 | 不成熟 | 规划不是一个能单独买来的产品，还处在探索和成长阶段，没有第三方维护的成熟方案可以直接拿来用 |\n| 工具 | 要定制 | 单个工具可以做成产品，难在挑选和对接：现成的工具不一定适合你，适合的也不一定找得到，而且不可能有一套适合所有项目的通用工具 |\n\n[▶ 20:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=1248) 关于工具，老师打了个比方：螺丝刀、电钻各自都是成熟的产品，可工具店里的工具多得数不过来，哪件适合你手上的活、你能不能找到它，都说不准；想想自己工具箱里有多少样东西，就知道工具没法统一。\n\n所以落地时，**大模型和记忆通常直接用成熟产品，规划和工具要按业务需求定制**，这两块占了大部分工作量。这也解释了为什么论文和产品已经那么多，企业还在大量招 Agent 工程师：现成的东西往往没法直接套到具体的场景和需求上。",
      "en": "[▶ 19:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=1156) In practice, the four components are at very different levels of maturity:\n\n| Component | Mature? | Why |\n|---|---|---|\n| LLM | Yes | Plenty of paid, open-source and multimodal models are ready to use; training your own is too much work and usually left to big companies |\n| Memory | Yes | Short-term memory lives in RAM or a file; long-term memory in a relational database or, more often in AI, a vector database – and databases are a specialist field full of mature products |\n| Planning | No | Planning isn't a product you can buy; it is still being explored, with no mature third-party solution to pick up |\n| Tools | Custom | A single tool can be a product; the hard part is choosing and connecting: an existing tool may not suit you, a suitable one may be hard to find, and no single tool set fits every project |\n\n[▶ 20:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=1248) On tools, the instructor uses an analogy: a screwdriver or a drill is a mature product, yet a tool shop holds more tools than you can count, and whether one suits your job – or whether you can even find it – is never certain. Think how many things are in your own toolbox and you see why tools can't be unified.\n\nSo in real projects **the LLM and memory are usually off-the-shelf, while planning and tools are customised to the business** – and those two take most of the work. That is also why, despite all the papers and products, companies keep hiring agent engineers: what exists rarely fits a concrete scenario and its requirements as is."
    },
    {
      "t": "video",
      "zh": "[▶ 22:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=1372) 讲到这里老师做了个小结：广义上，能感知环境并作用于环境的都叫智能体；而现在讨论的主要是**基于大模型的智能体**，要充分用上大模型自身的能力和优势。2025 年常被叫作「Agent 元年」，原因就是普通人也能实实在在感受到它成熟、方便、强大。四个组件的细节（工具怎么接、规划怎么做、记忆怎么存）后面几集再展开。",
      "en": "[▶ 22:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=1372) Here the instructor sums up: broadly, anything that perceives and acts on its environment is an agent; what people mean today is mainly **LLM-based agents**, which make full use of the model's own abilities. 2025 is often called “year one of agents” because ordinary people can genuinely feel how mature, convenient and powerful they have become. The details of the four components – how to connect tools, how to plan, how to store memory – come in later episodes."
    },
    {
      "t": "h",
      "zh": "七、聊天机器人、AI 助理和智能体",
      "en": "7. Chatbots, AI assistants and agents"
    },
    {
      "t": "p",
      "zh": "[▶ 24:24](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=1464) 很多人会问：DeepSeek、ChatGPT 早就在用了，为什么 2025 年还要专门强调 Agent，还有必要学吗？老师把「用大模型」分成三个层次来对比：\n\n| | 聊天机器人 | AI 助理 | AI 智能体 |\n|---|---|---|---|\n| 怎么用 | 直接打开 DeepSeek、ChatGPT 的网页 | 通过 API 调用模型，再给它接上一批工具 | 交给它一个目标 |\n| 能做什么 | 理解和生成文字：聊天、对话、写文章 | 借助工具做文字以外的事：开灯、开窗、查数据库 | 自己拆解任务、决定做什么和怎么做、评估效果、继续跟进 |\n| 主动还是被动 | 被动：你说一句它回一句，你不说它就停 | 仍然被动：要人不断下指令，人中途走开，事情就停了 | **主动**：以目标为导向，自己往前推进 |\n| 能力从哪来 | 模型本身的文字能力 | 主要来自工具 | 工具之外，还有长期记忆、学习和适应、任务拆解、自主决策 |\n\nAI 助理的例子有财务数据分析、AI 辅助医疗诊断。它们起的是**辅助**作用：数据分析助理收集信息、算出结果，决策还是交给人；医疗助理根据症状和以往病例做分析，真正负责下诊断的仍是医生。医生不上班、没人配合，它也就闲着了。\n\n[▶ 28:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=1682) 到了智能体，最大的特点是**化被动为主动**：它以目标为导向，自己想清楚为了实现目标要做哪些事、怎么做、交给谁做、做完效果好不好、要不要补做别的。为了撑起这种主动性，它还需要长期记忆、学习和适应的能力、处理复杂任务（尤其是拆分步骤）的能力，以及独立决策、根据目标主动创建任务的能力。\n\n一句话：前两层都是**被动**的；智能体一旦有了目标，就会自己发现需求、拆解任务、执行、评估完成情况，再跟进或改进，过程中几乎不需要人参与。",
      "en": "[▶ 24:24](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=1464) A common question: people have been using DeepSeek and ChatGPT for a while, so why the fuss about agents in 2025 – do I really need to learn them? The instructor compares three levels of using an LLM:\n\n| | Chatbot | AI assistant | AI agent |\n|---|---|---|---|\n| How you use it | Open the DeepSeek or ChatGPT web page | Call the model through an API and connect a set of tools | Give it a goal |\n| What it can do | Understand and generate text: chat, converse, write articles | Use tools for things beyond text: switch on a light, open a window, query a database | Break the task down, decide what to do and how, evaluate the result, follow up |\n| Passive or active | Passive: you say something, it replies; stop talking and it stops | Still passive: needs instruction after instruction; leave halfway and the job stops | **Active**: goal-driven, pushes the work forward itself |\n| Where its power comes from | The model's own text abilities | Mainly the tools | Tools plus long-term memory, learning and adapting, task breakdown, independent decisions |\n\nExamples of AI assistants are financial data analysis and AI-supported medical diagnosis. Their role is **supporting**: a data-analysis assistant gathers information and produces results, but people make the decision; a medical assistant analyses symptoms and past cases, but the doctor is the one responsible for the diagnosis. When the doctor is off duty and nobody works with it, it just sits idle.\n\n[▶ 28:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=1682) With an agent, the defining change is **from passive to active**: it is goal-driven and works out for itself what needs doing to reach the goal, how, who should do it, whether the result is good enough and whether more is needed. To support that, it also needs long-term memory, the ability to learn and adapt, the ability to handle complex tasks (especially by splitting them into steps), and the ability to make decisions on its own and create tasks from its goal.\n\nIn one sentence: the first two levels are **passive**; once an agent has a goal, it finds what is needed, breaks the work down, carries it out, evaluates how well it went and follows up or improves – with hardly any human involvement."
    },
    {
      "t": "check",
      "q": {
        "zh": "按视频的说法，AI 助理和 AI 智能体最根本的区别是什么？",
        "en": "According to the video, what is the fundamental difference between an AI assistant and an AI agent?"
      },
      "options": [
        {
          "zh": "AI 助理不能接工具，智能体可以",
          "en": "An AI assistant can't use tools; an agent can"
        },
        {
          "zh": "AI 助理被动地等人下指令；智能体以目标为导向，主动推进任务",
          "en": "An AI assistant waits passively for instructions; an agent is goal-driven and pushes the task forward itself"
        },
        {
          "zh": "AI 助理用网页，智能体用 API",
          "en": "An AI assistant uses a web page; an agent uses the API"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "AI 助理也接了工具、也通过 API 调用，但它仍然是被动的：人不下指令它就不动。智能体的关键是**化被动为主动**。",
        "en": "An AI assistant also has tools and is also called through an API, but it is still passive: without an instruction it does nothing. The key to an agent is turning **passive into active**."
      }
    },
    {
      "t": "h",
      "zh": "八、为什么大厂都在抢，以及一句话定义",
      "en": "8. Why everyone is racing, and a one-line definition"
    },
    {
      "t": "p",
      "zh": "[▶ 30:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=1808) 为什么公司和学术界都把 Agent 当作主要发力点？老师的看法是：聊天机器人和 AI 助理这两层，学术上和工程上都已经很成熟了；智能体这一层，学术界已经有大量论文给出了很好的指导，但工程上还没有真正做到——还没让它变得普及、简单、人人都能用。缺的正是**把学术理论落到具体应用**这一步，所以现在很多公司都在抢这个位置。\n\n[▶ 31:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=1870) 最后老师给了一句话的概括（他也鼓励大家用自己的话来描述）：**智能体是一个独立自主的个体，能感知环境，并根据自己的目标做出行动。** 公认的几个要素是：\n- **独立自主**：不用人一步步指挥\n- **目标导向**：围绕目标决定要做什么\n- **了解环境并作出反应**：感知环境，再用行动影响环境\n\n下一集（02 节）接着讲 Agent 的分类。",
      "en": "[▶ 30:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=1808) Why do companies and researchers alike treat agents as the main battleground? The instructor's view: chatbots and AI assistants are already mature in both research and engineering. For agents, research has produced plenty of papers with good guidance, but engineering hasn't caught up – agents are not yet common, simple and usable by everyone. What is missing is the step of **turning academic theory into concrete applications**, and many companies are racing to claim that spot.\n\n[▶ 31:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=2&t=1870) He ends with a one-line summary (and encourages you to put it in your own words): **an agent is an independent, autonomous entity that perceives its environment and acts according to its goals.** The widely agreed elements are:\n- **autonomy**: no step-by-step instructions needed\n- **goal orientation**: decides what to do around its goal\n- **understanding and reacting to the environment**: perceives it and acts to affect it\n\nThe next episode (lesson 02) moves on to how agents are classified."
    },
    {
      "t": "note",
      "zh": "补充：老师推荐的那篇 1995 年的论文（Wooldridge 和 Jennings）把智能体的特征归纳成四条：**自主性**（不需要人直接干预）、**反应性**（能对环境的变化及时做出反应）、**主动性**（为了目标主动采取行动）、**社交性**（能和人或其他智能体沟通协作）。前三条和上面的三个要素基本对应；第四条在后面的多智能体部分（13 节、23 节起）会用到。",
      "en": "Extra: the 1995 paper the instructor recommends (Wooldridge and Jennings) lists four traits of an agent: **autonomy** (works without direct human intervention), **reactivity** (responds to changes in its environment in time), **proactiveness** (takes the initiative towards its goals) and **social ability** (communicates and cooperates with people or other agents). The first three roughly match the three elements above; the fourth matters in the multi-agent parts later (lesson 13, and from lesson 23)."
    },
    {
      "t": "h",
      "zh": "九、补充：动手看一看——普通调用 vs. Agent 循环",
      "en": "9. Extra: see it run – a plain call vs. an agent loop"
    },
    {
      "t": "p",
      "zh": "这一集没有代码，这一部分是讲义自己加的，帮你把上面的概念和后面的代码对上号。把复旦框架的「感知 → 大脑 → 行动」放进大模型 Agent，它会变成一个反复转的循环：\n- **感知**：读到用户的问题，以及工具返回的结果\n- **思考**（大脑）：大模型推理，决定下一步——直接回答，还是先用某个工具\n- **行动**：执行工具，比如查天气\n- **观察**：把行动的结果交回模型，成为下一轮的感知\n\n一圈一圈地转，直到模型判断「信息够了」，不再请求工具，直接给出回答。写代码时一般还会加一个「最多 N 轮」的上限，防止停不下来。04–07 节会亲手写出这个循环，现在先看它跑起来是什么样子。\n\n下面的代码可以直接点 ▶ 运行（浏览器里连接的是模拟模型，不调用真实的 API，也不花钱）。**现在不需要看懂每一行**，只看输出、对照注释理解流程就好。想看真实模型的效果，可以在本地运行 `practice/l01_plain_vs_agent.py`。",
      "en": "This episode has no code; this part is an extra from these notes, to connect the concepts above with the code to come. Put the Fudan framework's “perception → brain → action” inside an LLM agent and it becomes a loop that goes round and round:\n- **Perceive**: read the user's question and any tool results\n- **Think** (the brain): the model reasons and picks the next step – answer now, or use a tool first\n- **Act**: run a tool, e.g. check the weather\n- **Observe**: hand the result back to the model; it becomes the next round's perception\n\nRound after round, until the model decides it knows enough, asks for no more tools and answers. Code usually adds an “at most N rounds” limit so it can't run forever. You will write this loop yourself in lessons 04–07; for now, just watch it run.\n\nYou can press ▶ Run on the code below (in the browser it talks to a mock model: no real API calls, no cost). **You don't need to understand every line yet** – read the output and follow the comments. To see a real model, run `practice/l01_plain_vs_agent.py` locally."
    },
    {
      "t": "py",
      "title": {
        "zh": "第一次读 Python 代码：注释和 print()",
        "en": "Reading Python for the first time: comments and print()"
      },
      "zh": "演示代码里有两样东西随处可见，先认识它们：\n- `#` 后面直到行尾是**注释**：写给人看的说明，Python 运行时直接跳过。\n- `print(...)` 把括号里的内容**显示**出来。括号里可以用逗号隔开好几样东西，显示时中间自动加一个空格。\n\nPython 从上到下**一行一行**执行，所以输出的顺序就是代码的顺序。点 ▶ 运行试试，再改一改文字重新运行。",
      "en": "Two things appear all over the demo, so meet them first:\n- From `#` to the end of the line is a **comment**: a note for humans that Python skips.\n- `print(...)` **displays** what is in the brackets. Separate several things with commas and they are shown with a space between them.\n\nPython runs **line by line, top to bottom**, so the output comes out in the same order as the code. Press ▶ Run, then change some text and run it again.",
      "code": {
        "zh": "# 这一行是注释，运行时会被跳过\nprint(\"感知：读到问题\")\nprint(\"思考：需要查天气\")          # 注释也可以写在代码后面\nprint(\"行动：调用\", \"get_weather\")  # 逗号隔开的内容之间会自动加空格\nprint(\"观察：\", 15.2, \"°C\")         # 文字和数字可以一起打印",
        "en": "# This line is a comment; Python skips it\nprint(\"Perceive: read the question\")\nprint(\"Think: need the weather\")      # a comment can also follow code\nprint(\"Act: call\", \"get_weather\")     # items separated by commas get a space between them\nprint(\"Observe:\", 15.2, \"°C\")         # text and numbers can be printed together"
      }
    },
    {
      "t": "p",
      "zh": "第一段：同一个问题问两次。A 是普通调用，相当于视频里的「聊天机器人」；B 多传了一个 `tools`，告诉模型「你有一个查天气的工具」。",
      "en": "First, the same question asked twice. A is a plain call – the video's “chatbot” level; B also passes `tools`, telling the model “you have a weather tool”."
    },
    {
      "t": "code",
      "file": "plain_vs_tools.py",
      "run": "mock",
      "code": {
        "zh": "from llm import client, MODEL\nfrom weather_tool import tools\n\nquestion = [{\"role\": \"user\", \"content\": \"北京现在多少度？\"}]\n\n# A. 普通调用：只把问题发给模型\na = client.chat.completions.create(model=MODEL, messages=question).choices[0].message\nprint(\"A 的文字回答：\", a.content)\nprint(\"A 的工具请求：\", a.tool_calls)\n\n# B. 同一个问题，但告诉模型「你有一个查天气的工具」\nb = client.chat.completions.create(model=MODEL, messages=question, tools=tools).choices[0].message\nprint(\"B 的工具请求：\", b.tool_calls[0].function.name, b.tool_calls[0].function.arguments)",
        "en": "from llm import client, MODEL\nfrom weather_tool import tools\n\nquestion = [{\"role\": \"user\", \"content\": \"What's the temperature in Beijing right now?\"}]\n\n# A. Plain call: just send the question\na = client.chat.completions.create(model=MODEL, messages=question).choices[0].message\nprint(\"A text answer:\", a.content)\nprint(\"A tool request:\", a.tool_calls)\n\n# B. Same question, but tell the model it has a weather tool\nb = client.chat.completions.create(model=MODEL, messages=question, tools=tools).choices[0].message\nprint(\"B tool request:\", b.tool_calls[0].function.name, b.tool_calls[0].function.arguments)"
      },
      "note": {
        "zh": "A 只能返回文字，`tool_calls` 是 `None`。真实模型要么说查不到实时天气，要么凭「这个季节一般多少度」猜一个（本节最后有一次真实运行的记录）。\n\nB 没有直接回答，而是**请求**调用 `get_weather`，还自己从「北京」推出了经纬度参数。注意：到这里工具**还没有被执行**。谁来执行？看下一段。",
        "en": "A can only return text, and `tool_calls` is `None`. A real model either says it can't access live weather or guesses from typical seasonal temperatures (a real run is recorded at the end of this lesson).\n\nB doesn't answer; it **asks** for `get_weather` and works out Beijing's latitude and longitude on its own. Note that the tool **has not run yet**. Who runs it? See the next block."
      }
    },
    {
      "t": "p",
      "zh": "第二段：把 Agent 循环的一圈完整走一遍。注释里的 1–4 对应「感知 → 思考 → 行动 → 观察」。",
      "en": "Second, one full turn of the agent loop. Steps 1–4 in the comments match “perceive → think → act → observe”."
    },
    {
      "t": "code",
      "file": "agent_step.py",
      "run": "mock",
      "code": {
        "zh": "import json\nfrom llm import client, MODEL\nfrom weather_tool import get_weather, tools\n\n# 1. 感知：收到用户的目标\nmessages = [{\"role\": \"user\", \"content\": \"北京现在多少度？\"}]\n\n# 2. 思考：模型读了工具说明，自己决定要不要用工具、用哪个\nreply = client.chat.completions.create(model=MODEL, messages=messages, tools=tools).choices[0].message\ncall = reply.tool_calls[0]\nprint(\"[思考] 模型请求调用：\", call.function.name, call.function.arguments)\n\n# 3. 行动：由我们的代码真正执行工具（模型自己不会执行）\nargs = json.loads(call.function.arguments)\nresult = get_weather(**args)\nprint(\"[行动] 工具返回：\", result)\n\n# 4. 观察：把结果交回模型，让它接着思考\nmessages.append(reply.model_dump())\nmessages.append({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": str(result)})\nfinal = client.chat.completions.create(model=MODEL, messages=messages, tools=tools).choices[0].message\nprint(\"[回答]\", final.content)",
        "en": "import json\nfrom llm import client, MODEL\nfrom weather_tool import get_weather, tools\n\n# 1. Perceive: receive the user's goal\nmessages = [{\"role\": \"user\", \"content\": \"What's the temperature in Beijing right now?\"}]\n\n# 2. Think: the model reads the tool descriptions and decides whether (and which) to use\nreply = client.chat.completions.create(model=MODEL, messages=messages, tools=tools).choices[0].message\ncall = reply.tool_calls[0]\nprint(\"[think] the model asks for:\", call.function.name, call.function.arguments)\n\n# 3. Act: OUR code actually runs the tool (the model never does)\nargs = json.loads(call.function.arguments)\nresult = get_weather(**args)\nprint(\"[act] the tool returned:\", result)\n\n# 4. Observe: hand the result back so the model can keep thinking\nmessages.append(reply.model_dump())\nmessages.append({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": str(result)})\nfinal = client.chat.completions.create(model=MODEL, messages=messages, tools=tools).choices[0].message\nprint(\"[answer]\", final.content)"
      },
      "note": {
        "zh": "这就是 Agent 循环的一圈。真正的 Agent 会把「思考 → 行动 → 观察」放进循环里反复执行，直到模型不再请求工具（06、07 节你会写出完整的循环）。\n\n试一试：把问题改成「你好，介绍一下你自己」再运行，会报错 `TypeError: 'NoneType' object is not subscriptable`。这是因为模型判断这次**不需要工具**，`reply.tool_calls` 是 `None`，取不出第 0 项。这恰好说明：**要不要用工具，是模型每一轮自己决定的**。正式的代码要先判断有没有工具请求，05 节会教。",
        "en": "That is one turn of the agent loop. A real agent repeats “think → act → observe” in a loop until the model stops asking for tools (you will write the full loop in lessons 06 and 07).\n\nTry it: change the question to “Hi, please introduce yourself” and run again. You get `TypeError: 'NoneType' object is not subscriptable`, because the model decided it **needs no tool** this time, so `reply.tool_calls` is `None` and has no item 0. That is the point: **the model decides, every round, whether to use a tool**. Proper code checks for a tool request first – lesson 05 shows how."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "在上面的 `agent_step.py` 里，是谁真正执行了 `get_weather`？",
        "en": "In `agent_step.py` above, who actually ran `get_weather`?"
      },
      "options": [
        {
          "zh": "大模型在它的服务器上执行的",
          "en": "The model, on its own server"
        },
        {
          "zh": "我们自己的代码：`result = get_weather(**args)` 这一行",
          "en": "Our own code: the line `result = get_weather(**args)`"
        },
        {
          "zh": "天气网站主动把结果推送给了模型",
          "en": "The weather website pushed the result to the model"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "模型只返回「想调用什么、参数是什么」，执行函数、把结果交回去，都是我们的代码做的。框架做的也是这件事，只是替你写好了。",
        "en": "The model only says what it wants to call and with which arguments; our code runs the function and hands the result back. Frameworks do the same thing – they just write that code for you."
      }
    },
    {
      "t": "code",
      "lang": "text",
      "file": {
        "zh": "l01_plain_vs_agent.py · 真实运行记录",
        "en": "l01_plain_vs_agent.py · a real run (translated)"
      },
      "code": {
        "zh": "问题：北京和上海现在哪个更暖和？\n\n=== A. 普通调用（没有工具）===\n按当前季节（5月上旬）来看，通常上海比北京更暖和……\n如果要问“此刻实时哪里更暖”，最好看天气 App 的实时气温……\n\n=== B. Agent 循环（有查天气工具）===\n  第 1 轮 [思考] The user asks: which is warmer now, Beijing or Shanghai? I n...\n  第 1 轮 [请求] get_weather({'latitude': 39.9042, 'longitude': 116.4074})\n  第 1 轮 [观察] 14.3\n  第 1 轮 [请求] get_weather({'latitude': 31.2304, 'longitude': 121.4737})\n  第 1 轮 [观察] 19.0\n  第 2 轮：不再请求工具，给出回答\n\n回答：上海更暖和。北京 14.3 °C，上海 19.0 °C，上海目前比北京高约 4.7 °C。",
        "en": "Question: Which is warmer right now, Beijing or Shanghai?\n\n=== A. Plain call (no tools) ===\nGoing by the current season (early May), Shanghai is usually warmer than Beijing...\nIf you mean right this moment, check the live temperature in a weather app...\n\n=== B. Agent loop (with a weather tool) ===\n  round 1 [think]   The user asks: which is warmer now, Beijing or Shanghai? I n...\n  round 1 [request] get_weather({'latitude': 39.9042, 'longitude': 116.4074})\n  round 1 [observe] 14.3\n  round 1 [request] get_weather({'latitude': 31.2304, 'longitude': 121.4737})\n  round 1 [observe] 19.0\n  round 2: no more tools, answering\n\nAnswer: Shanghai is warmer. Beijing 14.3 °C, Shanghai 19.0 °C - Shanghai is about 4.7 °C warmer right now."
      },
      "note": {
        "zh": "这是 10 月初制作讲义时，用 `practice/l01_plain_vs_agent.py` 连接真实 DeepSeek（`deepseek-flash`）跑的一次记录，输出有删减。\n- A 没有工具，只能凭季节猜，还以为现在是「5 月上旬」——它连今天是几号都不知道。\n- B 第 1 轮一次就请求了两个城市；拿到结果后，第 2 轮**自己决定**不用再查，直接回答。DeepSeek 默认开着思考模式，「[思考]」那一行是它的思考内容（`reasoning_content`）的开头，常常是英文。\n\n对照视频的三个层次：A 就是聊天机器人；B 已经由模型自己决定查几次、什么时候停，是 Agent 循环的雏形。不过离视频里「主动推进」的智能体还差长期记忆、任务拆解、自我评估这些能力，后面的课会一点点加上。",
        "en": "A run of `practice/l01_plain_vs_agent.py` against the real DeepSeek model (`deepseek-flash`), recorded in early October while these notes were made; the output is shortened.\n- A has no tools, so it guesses from the season – and thinks it is “early May”: it doesn't even know today's date.\n- B asks for both cities at once in round 1; with the results in hand, in round 2 it **decides on its own** that no more lookups are needed and answers. DeepSeek has thinking mode on by default; the “[think]” line is the start of its thinking (`reasoning_content`), often in English.\n\nIn terms of the video's three levels: A is a chatbot; in B the model already decides how many lookups to make and when to stop – the seed of an agent loop. It still lacks what the video's “active” agent needs, such as long-term memory, task breakdown and self-evaluation; later lessons add them step by step."
      }
    },
    {
      "t": "note",
      "zh": "补充：Agent 也有明显的短板——会出错，而且一步错、步步错；一个任务要调用模型好几次，所以更慢、更贵；可能停不下来，所以要设最大轮数；能删文件、能花钱的工具有安全风险，要靠权限控制（18 节）和人工审核（33–36 节）把关。",
      "en": "Extra: agents have clear weak spots too – they make mistakes, and one wrong step derails the rest; a task calls the model several times, so it is slower and costlier; they may not stop, so cap the rounds; and tools that delete files or spend money are a safety risk, handled by permission control (lesson 18) and human review (lessons 33–36)."
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "为什么 AI 领域更愿意把 agent 译成「智能体」，而不是「代理」？",
        "en": "Why does the AI field prefer to translate “agent” as 智能体 rather than 代理 (“proxy”)?"
      },
      "options": [
        {
          "zh": "因为「代理」这个词已经被网络代理占用了",
          "en": "Because 代理 is already taken by network proxies"
        },
        {
          "zh": "「代理」听起来像替人跑腿的工具，体现不出它独立感知、独立决策、以目标为导向的特点",
          "en": "代理 sounds like someone's errand-runner and misses that an agent perceives and decides on its own, driven by a goal"
        },
        {
          "zh": "因为智能体必须用大模型来实现",
          "en": "Because an agent must be built on an LLM"
        },
        {
          "zh": "两种译法指不同的东西：代理是规则程序，智能体是大模型程序",
          "en": "The two words mean different things: 代理 is a rule-based program, 智能体 an LLM program"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "AI 领域设想的 agent 是能独立感知环境、独立决策、实现既定目标的个体，「智能体」更贴近这个意思。两种叫法指的是同一个东西，课程里混着用。",
        "en": "AI pictures an agent as an entity that perceives, decides and reaches set goals on its own, and 智能体 captures that better. Both words name the same thing; the course uses them interchangeably."
      }
    },
    {
      "q": {
        "zh": "视频认为，用大模型来做智能体有哪两个优势？",
        "en": "According to the video, what are the two advantages of building agents on LLMs?"
      },
      "options": [
        {
          "zh": "运行成本低，而且不会出错",
          "en": "They are cheap to run and never make mistakes"
        },
        {
          "zh": "可以完全离线运行，不需要任何工具",
          "en": "They run fully offline and need no tools"
        },
        {
          "zh": "参数量大，并且只处理文字，不容易被干扰",
          "en": "They have many parameters and only handle text, so they are hard to distract"
        },
        {
          "zh": "能力强（知识、理解、推理、规划），而且天生便于和人交流（多模态的输入输出）",
          "en": "They are capable (knowledge, understanding, reasoning, planning) and naturally suited to communicating with people (multimodal input and output)"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "老师划的两个重点：一是大模型本身能力强，二是它在人机交互上的优势——能读、能写人看得懂的各种内容。",
        "en": "The instructor's two key points: the model's own strong abilities, and its advantage in human–machine interaction – it reads and produces all kinds of content people understand."
      }
    },
    {
      "q": {
        "zh": "在复旦综述的三模块框架里，短期记忆和长期记忆（比如知识库）属于哪个模块？",
        "en": "In the Fudan survey's three-module framework, which module do short-term and long-term memory (e.g. a knowledge base) belong to?"
      },
      "options": [
        {
          "zh": "大脑：思考和决策时要用上记忆",
          "en": "Brain: thinking and deciding draw on memory"
        },
        {
          "zh": "感知：记忆也是一种输入",
          "en": "Perception: memory is a kind of input"
        },
        {
          "zh": "行动：记忆要靠工具来保存",
          "en": "Action: memory is saved by tools"
        },
        {
          "zh": "它不属于任何模块，是单独的第四部分",
          "en": "None of them; it is a separate fourth part"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "复旦框架里，记忆放在大脑里，帮助思考和决策。到了「四个组件」的说法里，记忆才被单独列为一个组件。",
        "en": "In the Fudan framework, memory sits inside the brain and supports thinking and deciding. Only in the “four components” view is memory listed as a component of its own."
      }
    },
    {
      "q": {
        "zh": "按视频的分析，落地一个 Agent 时，哪两个组件通常要按业务定制、占了大部分工作量？",
        "en": "According to the video, which two components usually need custom work for the business and take most of the effort?"
      },
      "options": [
        {
          "zh": "大模型和记忆",
          "en": "The LLM and memory"
        },
        {
          "zh": "大模型和工具",
          "en": "The LLM and tools"
        },
        {
          "zh": "规划和工具",
          "en": "Planning and tools"
        },
        {
          "zh": "记忆和规划",
          "en": "Memory and planning"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "大模型（付费或开源模型）和记忆（内存、文件、数据库）都有成熟产品可以直接用；规划还没有现成的产品，工具则要按业务挑选和对接，所以这两块工作量最大。",
        "en": "The LLM (paid or open models) and memory (RAM, files, databases) have mature products ready to use; planning has no off-the-shelf product, and tools must be chosen and connected for the business – so those two take the most work."
      }
    },
    {
      "q": {
        "zh": "一个财务分析程序通过 API 调用大模型，还接入了查数据库的工具：你下一条指令，它就查数据、出一份报表；你不再下指令，它就停下，最终决定也由人来做。按视频的三个层次，它属于哪一种？",
        "en": "A financial-analysis program calls an LLM through the API and has a database-query tool: give it an instruction and it pulls the data and produces a report; stop instructing it and it stops, and people make the final decisions. By the video's three levels, what is it?"
      },
      "options": [
        {
          "zh": "聊天机器人：它主要靠文字和人交流",
          "en": "A chatbot: it mainly communicates with people in text"
        },
        {
          "zh": "AI 助理：能借助工具办事，但仍然被动，要人一步步下指令",
          "en": "An AI assistant: tools let it get things done, but it is still passive and needs step-by-step instructions"
        },
        {
          "zh": "AI 智能体：只要接上了工具，就算智能体",
          "en": "An AI agent: anything with tools counts as an agent"
        },
        {
          "zh": "AI 智能体：它能自己生成报表，说明它是主动的",
          "en": "An AI agent: it produces reports by itself, so it is active"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "视频的分界线是「被动还是主动」。接上工具让它能办文字以外的事，但只要还得人不断下指令、人一走就停、由人做最终决定，它就是 AI 助理。智能体会围绕目标自己拆解任务、往前推进、评估结果。",
        "en": "The video's dividing line is passive versus active. Tools let it do more than text, but as long as people must keep instructing it, it stops when they leave and people make the decisions, it is an AI assistant. An agent breaks the goal down, pushes forward and evaluates the results on its own."
      }
    },
    {
      "q": {
        "zh": "（讲义补充的演示）关于工具调用，下面哪句话是对的？",
        "en": "(From the extra demo in these notes) Which statement about tool calls is correct?"
      },
      "options": [
        {
          "zh": "模型会在服务器上直接运行你的 Python 函数",
          "en": "The model runs your Python function directly on its server"
        },
        {
          "zh": "只要传了 `tools` 参数，模型每次都一定会调用工具",
          "en": "Whenever you pass `tools`, the model always calls a tool"
        },
        {
          "zh": "工具结果不需要交回模型，模型会自己猜到",
          "en": "Tool results needn't go back to the model; it will guess them"
        },
        {
          "zh": "模型返回工具请求（工具名 + 参数），由你的代码执行函数，再把结果交回模型",
          "en": "The model returns a request (tool name + arguments); your code runs the function and hands the result back"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "模型只「提出请求」；执行、交回结果都是你的代码负责。要不要调用工具，模型每一轮都会自己判断，比如打招呼时就不会调用。",
        "en": "The model only asks; running the tool and returning the result is your code's job. Whether to call a tool is decided by the model each round – a greeting, for instance, triggers none."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "用 print() 默写本节的两个框架",
        "en": "Recall this lesson's two frameworks with print()"
      },
      "code": {
        "zh": "# 复旦综述：大模型 Agent 的三个模块\nprint(\"[[感知]]\")   # 获取信息：文字、图片、音频、视频\nprint(\"[[大脑]]\")   # 思考和决策，用上短期和长期记忆；由大模型担任\nprint(\"[[行动]]\")   # 把决策落到实处，比如用机械臂把伞递过来\n\n# 落地时的四个组件，以及它们成熟不成熟\nprint(\"[[大模型|LLM|大语言模型]]\", \"成熟\")    # 有大量付费和开源模型可以直接用\nprint(\"[[记忆|记忆体]]\", \"成熟\")             # 短期放内存或文件，长期放数据库\nprint(\"[[规划]]\", \"[[不成熟|要定制|需要定制|定制]]\")   # 拆任务、排步骤，还没有现成的产品\nprint(\"[[工具]]\", \"要定制\")                 # 种类太多，要按业务挑选和对接",
        "en": "# The Fudan survey: three modules of an LLM agent\nprint(\"[[perception|Perception|感知]]\")   # takes in information: text, images, audio, video\nprint(\"[[brain|Brain|大脑]]\")             # thinks and decides, using short- and long-term memory; played by the LLM\nprint(\"[[action|Action|行动]]\")           # carries decisions out, e.g. a robot arm handing over the umbrella\n\n# The four practical components, and how mature they are\nprint(\"[[LLM|llm|large language model|大模型]]\", \"mature\")   # plenty of paid and open models ready to use\nprint(\"[[memory|Memory|记忆]]\", \"mature\")                   # short-term in RAM or files, long-term in databases\nprint(\"[[planning|Planning|规划]]\", \"[[immature|not mature|custom|customised|customized]]\")   # breaking tasks down, ordering steps; no off-the-shelf product\nprint(\"[[tools|Tools|tool|工具]]\", \"custom\")                # so many kinds; pick and connect them to fit the business"
      },
      "explain": {
        "zh": "复旦综述：感知 → 大脑 → 行动。落地四件套：大模型和记忆有成熟产品；规划还不成熟，工具要按业务挑选和对接，所以这两块都要定制（规划那一空填「不成熟」或「要定制」都算对）。",
        "en": "Fudan survey: perception → brain → action. The practical four: the LLM and memory are off-the-shelf; planning is still immature and tools must be chosen and connected for the business, so both need custom work (for planning, “immature” and “custom” both count)."
      }
    },
    {
      "title": {
        "zh": "给代码标出 Agent 循环的阶段（讲义补充的演示）",
        "en": "Label the phases of the agent loop (the extra demo in these notes)"
      },
      "code": {
        "zh": "# [[感知|perceive|Perceive]]：收到用户的目标\nmessages = [{\"role\": \"user\", \"content\": \"北京现在多少度？\"}]\n\n# [[思考|think|Think]]：模型读了工具说明，决定要不要用工具\nreply = client.chat.completions.create(model=MODEL, messages=messages, tools=[[tools]]).choices[0].message\ncall = reply.[[tool_calls]][0]\n\n# [[行动|act|Act]]：由我们的代码执行工具\nresult = get_weather(**json.loads(call.function.arguments))\n\n# [[观察|observe|Observe]]：把结果交回模型，让它接着思考\nmessages.append(reply.model_dump())\nmessages.append({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": str(result)})",
        "en": "# [[Perceive|perceive|感知]]: receive the user's goal\nmessages = [{\"role\": \"user\", \"content\": \"What's the temperature in Beijing right now?\"}]\n\n# [[Think|think|思考]]: the model reads the tool descriptions and decides whether to use one\nreply = client.chat.completions.create(model=MODEL, messages=messages, tools=[[tools]]).choices[0].message\ncall = reply.[[tool_calls]][0]\n\n# [[Act|act|行动]]: our code runs the tool\nresult = get_weather(**json.loads(call.function.arguments))\n\n# [[Observe|observe|观察]]: hand the result back so the model can keep thinking\nmessages.append(reply.model_dump())\nmessages.append({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": str(result)})"
      },
      "explain": {
        "zh": "四个阶段按顺序是感知 → 思考 → 行动 → 观察。传了 `tools` 模型才知道有哪些工具可用；它的请求放在 `tool_calls` 里。",
        "en": "The four phases, in order: perceive → think → act → observe. The model only knows which tools exist because you pass `tools`; its requests arrive in `tool_calls`."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "选做 · 手写：用 print() 做一张智能体速记卡",
        "en": "Optional · Write it: an agent cheat card with print()"
      },
      "task": {
        "zh": "只用本节学的 `print()` 和 `#` 注释，把这一集的要点打印成一张小卡片：\n1. 打印一句话定义，里面要同时出现「感知」和「目标」\n2. 用**一个** `print()`、逗号隔开，打印三个要素：独立自主、目标导向、了解环境并作出反应\n3. 用一个 `print()` 按顺序打印四个组件：大模型、记忆、规划、工具\n4. 用一个 `print()` 打印哪两个组件要按业务定制：先写「要定制：」，再写那两个组件\n5. 至少在一行 `print(...)` 的**后面**加一条 `#` 注释\n\n写完点 ▶ 运行，看看输出的顺序是不是和代码的顺序一样。",
        "en": "Using only this lesson's `print()` and `#` comments, print the episode's key points as a small card:\n1. Print a one-line definition that contains both “perceive” (or “perceives”) and “goal”\n2. With **one** `print()` and commas, print the three elements: autonomy, goal orientation, reacting to the environment\n3. With one `print()`, print the four components in order: LLM, memory, planning, tools\n4. With one `print()`, print which two components need custom work: first “Custom:”, then the two components\n5. Put a `#` comment **after** at least one `print(...)` on the same line\n\nPress ▶ Run and check that the output comes out in the same order as the code."
      },
      "run": true,
      "starter": {
        "zh": "# 智能体速记卡（第 01 节）\n\n# 1. 一句话定义（要有「感知」和「目标」）\n\n\n# 2. 三个要素：一个 print()，逗号隔开\n\n\n# 3. 四个组件，按顺序\n\n\n# 4. 哪两个组件要定制\n",
        "en": "# Agent cheat card (lesson 01)\n\n# 1. One-line definition (with \"perceive\" and \"goal\")\n\n\n# 2. Three elements: one print(), separated by commas\n\n\n# 3. Four components, in order\n\n\n# 4. Which two need custom work\n"
      },
      "solution": {
        "zh": "# 智能体速记卡（第 01 节）\n\n# 1. 一句话定义（要有「感知」和「目标」）\nprint(\"智能体：能感知环境、根据自己的目标自主行动的独立个体\")\n\n# 2. 三个要素：一个 print()，逗号隔开\nprint(\"三个要素：\", \"独立自主\", \"目标导向\", \"了解环境并作出反应\")\n\n# 3. 四个组件，按顺序\nprint(\"四个组件：\", \"大模型\", \"记忆\", \"规划\", \"工具\")   # 前两个有成熟产品\n\n# 4. 哪两个组件要定制\nprint(\"要定制：\", \"规划\", \"工具\")   # 这两块工作量最大",
        "en": "# Agent cheat card (lesson 01)\n\n# 1. One-line definition (with \"perceive\" and \"goal\")\nprint(\"Agent: an independent entity that perceives its environment and acts towards its own goal\")\n\n# 2. Three elements: one print(), separated by commas\nprint(\"Three elements:\", \"autonomy\", \"goal orientation\", \"reacting to the environment\")\n\n# 3. Four components, in order\nprint(\"Four components:\", \"LLM\", \"memory\", \"planning\", \"tools\")   # the first two are off-the-shelf\n\n# 4. Which two need custom work\nprint(\"Custom:\", \"planning\", \"tools\")   # these take most of the work"
      },
      "checks": [
        {
          "zh": "一句话定义里有「感知」和「目标」",
          "en": "The definition mentions perceiving and a goal",
          "re": "^print\\(.*(感知|[Pp]erceiv).*(目标|[Gg]oal)"
        },
        {
          "zh": "一个 `print()` 打印三个要素",
          "en": "One `print()` shows the three elements",
          "re": "^print\\(.*(独立自主|[Aa]utonom).*(目标导向|[Gg]oal).*(环境|[Ee]nvironment)"
        },
        {
          "zh": "一个 `print()` 按顺序打印四个组件",
          "en": "One `print()` shows the four components in order",
          "re": "^print\\(.*(大模型|LLM).*(记忆|[Mm]emory).*(规划|[Pp]lanning).*(工具|[Tt]ools?)"
        },
        {
          "zh": "先写「要定制」，再写规划和工具",
          "en": "“Custom” first, then planning and tools",
          "re": "^print\\(.*(定制|[Cc]ustom).*(规划|[Pp]lanning).*(工具|[Tt]ools?)"
        },
        {
          "zh": "至少一行 `print(...)` 后面跟着 `#` 注释",
          "en": "At least one `print(...)` is followed by a `#` comment",
          "re": "^print\\(.*\\)[ \\t]+#"
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "把 Agent 理解成「替人跑腿的代理」。它的关键是能独立感知、独立决策、围绕目标行动，所以才叫「智能体」。",
      "en": "Thinking of an agent as a mere proxy running errands. What matters is that it perceives, decides and acts towards a goal on its own – hence 智能体."
    },
    {
      "zh": "把聊天机器人、接了工具的 AI 助理都叫 Agent。只会一问一答的是聊天机器人；能用工具、但每一步都要人下指令的是 AI 助理；Agent 的关键是围绕目标主动推进。",
      "en": "Calling every chatbot or tool-equipped AI assistant an agent. Question-and-answer only is a chatbot; using tools but needing an instruction for every step is an AI assistant; an agent actively drives towards a goal."
    },
    {
      "zh": "以为买来模型、搭好数据库就能做好 Agent。大模型和记忆有成熟产品，规划和工具却要按业务定制，这才是工作量最大的部分。",
      "en": "Thinking a model plus a database is all an agent needs. The LLM and memory are off-the-shelf, but planning and tools must be tailored to the business – that is where most of the work goes."
    },
    {
      "zh": "把复旦综述的三个模块和落地的四个组件搞混：前者是感知、大脑、行动（记忆在大脑里），后者是大模型、记忆、规划、工具。",
      "en": "Mixing up the Fudan survey's three modules with the four practical components: the first are perception, brain and action (memory sits in the brain); the second are LLM, memory, planning and tools."
    },
    {
      "zh": "（演示）以为模型会自己执行工具。模型只提出请求，执行的是你的代码（或框架）。",
      "en": "(Demo) Thinking the model runs tools itself. It only asks; your code (or a framework) runs them."
    },
    {
      "zh": "（演示）Agent 循环不设最大轮数，模型反复调用工具，既停不下来又费钱。",
      "en": "(Demo) No round limit on the agent loop, so a model that keeps calling tools never stops and runs up costs."
    }
  ],
  "recap": [
    {
      "zh": "Agent（智能体）：独立自主、能感知环境、并根据目标做出行动的个体；不译作「代理」，是为了突出它的自主和目标导向。",
      "en": "An agent (智能体): an independent, autonomous entity that perceives its environment and acts towards its goals; it isn't called a “proxy” because autonomy and goals are the point."
    },
    {
      "zh": "教材的宽泛定义：能通过传感器感知环境、通过执行器作用于环境的东西都算，比如自动驾驶、扫地机器人、游戏人机；这门课讲的是以大模型为基础的智能体。",
      "en": "The textbook's broad definition: anything that perceives through sensors and acts through actuators – self-driving cars, robot vacuums, game bots; this course is about LLM-based agents."
    },
    {
      "zh": "用大模型的两个理由：能力强，而且天生便于和人交流（多模态）。",
      "en": "Two reasons for LLMs: they are capable, and naturally suited to communicating with people (multimodal)."
    },
    {
      "zh": "复旦综述的三个模块：感知、大脑、行动（递伞的例子）；落地的四个组件：大模型 + 记忆 + 规划 + 工具。",
      "en": "The Fudan survey's three modules: perception, brain, action (the umbrella example); the four practical components: LLM + memory + planning + tools."
    },
    {
      "zh": "大模型和记忆已经很成熟；规划和工具要按业务定制，是开发的主要工作量。",
      "en": "The LLM and memory are mature; planning and tools need custom work and take most of the development effort."
    },
    {
      "zh": "聊天机器人 → AI 助理 → 智能体：关键区别是从被动响应变成以目标为导向、主动推进。",
      "en": "Chatbot → AI assistant → agent: the key shift is from passive response to goal-driven, active work."
    },
    {
      "zh": "（演示）核心循环：感知 → 思考 → 行动 → 观察；模型只「请求」工具，真正执行的是你的代码。",
      "en": "(Demo) The core loop: perceive → think → act → observe; the model only requests tools, and your code runs them."
    }
  ],
  "files": [
    {
      "path": "practice/l01_plain_vs_agent.py",
      "zh": "讲义补充的演示：同一个问题，先用普通调用问，再交给一个最小的 Agent 循环（连接真实的 DeepSeek 模型和 Open-Meteo 天气），对比两者的输出。只需要运行和观察，不需要修改。",
      "en": "Extra demo from the notes: the same question asked by a plain call and then by a minimal agent loop (real DeepSeek model, real Open-Meteo weather), so you can compare the outputs. Just run it and watch; no editing needed."
    }
  ]
});
