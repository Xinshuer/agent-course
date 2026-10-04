COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l03",
  "priority": "overview",
  "handwrite": false,
  "studyMinutes": 90,
  "source": "subtitle",
  "noPy": true,
  "summary": {
    "zh": "理论部分的最后一集，没有代码。先讲 Agent 的组成和策略：大模型选合适的就行，重点在规划、记忆和工具。规划部分依次讲了六种策略——思维链 CoT、思维树 ToT、LLM+P、ReAct、自我反思、ReWOO，老师认为最重要的是 ReAct 和自我反思；记忆按人类的记忆分成感觉、短期、长期三种，长期记忆交给数据库；工具从函数调用讲到让模型自己写代码当工具，再到把别的模型和 Agent 当工具（MCP、A2A）。接着讲应用场景，重点拆解了客服智能体。最后的建议是：按自己的需求、从简单的提示词做起，再一步步加复杂度。",
    "en": "The last theory episode, with no code. It first covers an agent's components and strategies: just pick a suitable LLM – the real design work is in planning, memory and tools. Planning gets six strategies in turn – Chain of Thought, Tree of Thoughts, LLM+P, ReAct, self-reflection and ReWOO – and the instructor ranks ReAct and self-reflection as the most important. Memory is split, like human memory, into sensory, short-term and long-term, with long-term memory handed to databases. Tools go from function calling, to letting the model write code as its own tools, to using other models and agents as tools (MCP, A2A). Then come use cases, with a close look at a customer-service agent. The closing advice: build for your own needs, start from a simple prompt and add complexity step by step."
  },
  "goals": [
    {
      "zh": "用自己的话说清六种规划策略（CoT、ToT、LLM+P、ReAct、自我反思、ReWOO）的核心思路，知道老师认为哪两种最重要",
      "en": "Explain in your own words the core idea of the six planning strategies (CoT, ToT, LLM+P, ReAct, self-reflection, ReWOO), and which two the instructor ranks highest"
    },
    {
      "zh": "说明 ReAct 为什么比「只想不做」和「只做不想」都好，读懂一段 Thought / Action / Observation 记录",
      "en": "Explain why ReAct beats both “think only” and “act only”, and read a Thought / Action / Observation trace"
    },
    {
      "zh": "比较 ReAct 和 ReWOO 调用大模型的次数，知道 ReWOO 提升的是速度而不是质量",
      "en": "Compare how often ReAct and ReWOO call the LLM, and know that ReWOO improves speed, not quality"
    },
    {
      "zh": "区分感觉记忆、短期记忆和长期记忆，知道它们各放在哪里",
      "en": "Tell sensory, short-term and long-term memory apart and know where each is kept"
    },
    {
      "zh": "说出工具调用里的三个角色，知道执行函数的是程序而不是大模型，了解 MCP 和 A2A 是做什么的",
      "en": "Name the three roles in tool calling, know that the program – not the LLM – runs the function, and know what MCP and A2A are for"
    },
    {
      "zh": "用客服智能体的例子说明什么样的工作最容易做成 Agent，以及落地时为什么要从简单做起",
      "en": "Use the customer-service example to say which jobs are easiest to turn into agents, and why to start simple"
    },
    {
      "zh": "用三次模型调用写出最简单的自我反思流程",
      "en": "Write the simplest self-reflection flow with three model calls"
    }
  ],
  "blocks": [
    {
      "t": "h",
      "zh": "一、组成：重点在规划、记忆和工具",
      "en": "1. Components: the work is in planning, memory and tools"
    },
    {
      "t": "video",
      "zh": "这一集约 67 分钟，是理论部分的最后一集，仍然没有代码。老师讲策略时，展示的多是论文里的原图和实验结果。顺序是：\n1. [▶ 00:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=2) 组成：回顾 01 节的四个组件，指出重点在规划、记忆、工具，其中规划最难\n2. [▶ 01:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=63) 规划策略：思维链 → 思维树 → LLM+P → ReAct → 自我反思 → ReWOO，最后点评哪两种最重要\n3. [▶ 37:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=2224) 记忆：感觉记忆、短期记忆、长期记忆\n4. [▶ 42:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=2536) 工具：函数调用 → 让模型自己写工具 → 把别的模型和 Agent 当工具（MCP、A2A）\n5. [▶ 52:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=3165) 应用场景：客服、HR、创意、数据、代码，重点拆解客服智能体\n6. [▶ 1:02:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=3725) 总结和落地建议，预告下一集开始写代码\n\n讲义按同样的顺序、用自己的话和小例子重新整理（依据是这一集的 AI 字幕）。本节的代码演示和练习都是讲义补充的。",
      "en": "This episode runs about 67 minutes and is the last theory episode – still no code. For the strategies, the instructor mostly shows the original figures and results from the papers. The order:\n1. [▶ 00:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=2) Components: a recap of the four components from lesson 01, pointing out that the work lies in planning, memory and tools – planning being the hardest\n2. [▶ 01:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=63) Planning strategies: Chain of Thought → Tree of Thoughts → LLM+P → ReAct → self-reflection → ReWOO, then which two matter most\n3. [▶ 37:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=2224) Memory: sensory, short-term and long-term\n4. [▶ 42:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=2536) Tools: function calling → letting the model write its own tools → using other models and agents as tools (MCP, A2A)\n5. [▶ 52:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=3165) Use cases: customer service, HR, creative work, data and code, with a close look at a customer-service agent\n6. [▶ 1:02:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=3725) Summary and practical advice, plus a preview: coding starts next episode\n\nThese notes follow the same order in their own words, with small examples (based on the episode's AI subtitles). The code demos and exercises in this lesson are extras from these notes."
    },
    {
      "t": "p",
      "zh": "[▶ 00:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=2) 01 节说过，落地的 Agent 基本由**大模型、记忆、规划、工具**四部分组成。老师的看法是：大模型是核心基础，但选一个合适的就行，谈不上什么策略；真正需要设计的是后面三块，其中**规划最麻烦**，所以这一集先讲规划，篇幅也最多。这些策略不是死规定，实践中可以按业务需求和实际效果调整。\n\n| 组件 | 这一集的要点 | 课程里在哪写代码 |\n|---|---|---|\n| 大模型 | 选合适的就好 | 04 节调用模型 |\n| 规划 | 六种策略，ReAct 和自我反思最重要 | 07 节 ReAct |\n| 记忆 | 参照人类记忆分三种，长期记忆交给数据库 | 06 节对话记忆，17 节 RAG，32 节长期记忆 |\n| 工具 | 函数调用是基础，新趋势是 MCP 和 A2A | 05 节定义工具，11、20 节 MCP |",
      "en": "[▶ 00:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=2) As lesson 01 said, agents in real use are made of four parts: **the LLM, memory, planning and tools**. The instructor's view: the LLM is the foundation, but you just pick a suitable one – there's no strategy to it. The parts that need design are the other three, and **planning is the trickiest**, so the episode starts with planning and spends the most time on it. None of these strategies is a fixed rule; in practice you adjust them to your business needs and the results you get.\n\n| Component | Key points in this episode | Where the course codes it |\n|---|---|---|\n| LLM | Just pick a suitable one | Lesson 04, calling a model |\n| Planning | Six strategies; ReAct and self-reflection matter most | Lesson 07, ReAct |\n| Memory | Three kinds, modelled on human memory; long-term memory goes to databases | Lesson 06 chat memory, 17 RAG, 32 long-term memory |\n| Tools | Function calling is the basis; MCP and A2A are the new trend | Lesson 05 defining tools; 11 and 20 MCP |"
    },
    {
      "t": "h",
      "zh": "二、规划 ①：思维链（CoT）——把步骤写出来",
      "en": "2. Planning ①: Chain of Thought (CoT) – write the steps out"
    },
    {
      "t": "p",
      "zh": "[▶ 01:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=63) 思维链（Chain of Thought，CoT）出自 2022 年前后的一篇论文（[Wei 等](https://arxiv.org/abs/2201.11903)）。思路很简单：**不让模型直接给答案，而是让它把任务拆成几步，把每一步和每一步的结果都写出来，最后再给答案**。老师先分了两种情况：解题步骤你自己清楚，直接写进提示词就行；不清楚（这往往正是要请模型帮忙的原因），就该让模型自己拆解、一步步做——思维链说的是后一种。\n\n写出来为什么有用？老师用 Transformer 的原理来解释：模型的输出受三样东西影响——提示词、模型本身，还有**它自己前面已经输出的内容**。步骤一旦写进了输出，后面生成答案时就能「看到」这些步骤，所以更容易答对。写出步骤有两个好处：\n- **更准**：减少胡编和低级错误。[▶ 05:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=312) 论文的实验图显示，用了思维链以后，准确率明显提高。\n- **方便排查**：结果对不对取决于思路。步骤摆在那里，你能看出它是不是一开始方向就错了——方向错了，算得再对也不能用。",
      "en": "[▶ 01:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=63) Chain of Thought (CoT) comes from a paper of around 2022 ([Wei et al.](https://arxiv.org/abs/2201.11903)). The idea is simple: **instead of answering straight away, the model splits the task into steps, writes down each step and its result, and only then gives the answer**. The instructor separates two cases: if you know the steps yourself, just write them into the prompt; if you don't (often the very reason you're asking the model), the model should break the task down and work through it – that second case is what chain of thought is about.\n\nWhy does writing it out help? The instructor explains it with how Transformers work: a model's output depends on three things – the prompt, the model itself, and **what it has already output**. Once the steps are part of the output, the model “sees” them while generating the answer, so it is more likely to get it right. Writing the steps out has two benefits:\n- **More accurate**: fewer made-up facts and careless errors. [▶ 05:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=312) The paper's charts show a clear jump in accuracy with chain of thought.\n- **Easier to check**: whether the result is right depends on the line of thinking. With the steps in front of you, you can see whether it went in the wrong direction from the start – and a wrong direction makes the result useless, however correct the arithmetic."
    },
    {
      "t": "code",
      "file": {
        "zh": "思维链示例",
        "en": "CoT example"
      },
      "lang": "text",
      "code": {
        "zh": "问题：一件衣服原价 200 元，先打八折，再用一张「满 180 减 30」的券，最后付多少？\n\n直接回答（容易漏掉条件）：\n130 元\n\n一步一步写出来：\n1. 打八折：200 × 0.8 = 160 元\n2. 券要满 180 才能用，160 < 180，用不了\n3. 所以还是 160 元\n答案：160 元",
        "en": "Question: A jacket costs 200 yuan. It is 20% off, then there is a \"30 off orders of 180 or more\" coupon. What do you pay?\n\nDirect answer (easy to miss the condition):\n130 yuan\n\nWritten out step by step:\n1. 20% off: 200 × 0.8 = 160 yuan\n2. The coupon needs 180 or more; 160 < 180, so it can't be used\n3. So the price stays 160 yuan\nAnswer: 160 yuan"
      }
    },
    {
      "t": "p",
      "zh": "[▶ 06:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=374) 这个技巧有两种用法：\n1. **写进提示词**：在提示词里要求它「先分解任务、规划步骤，再按步骤计算出结果」。\n2. **训练进模型**：效果太好，后来干脆训练进了模型。老师举的是 DeepSeek 的例子：R1 在 V3 的基础上加强了推理；后来这种推理能力又被融回了 V3，所以在 DeepSeek 网页上不开「深度思考」，遇到稍复杂的问题它也会先分析一番再回答。通义千问、谷歌、OpenAI 的新模型也都带「思考」过程。\n\n所以老师的建议是：思路要懂，但大部分新模型已经自带这个能力，不太影响后面的实操；如果你用的是**没有推理能力的小模型或本地模型**，在提示词里写思维链依然有用。\n\n课程用的 `deepseek-flash` 默认就是思考模式：回复消息里总会多一个 `reasoning_content` 字段，里面就是它回答前的思考过程。运行 `practice/l03_cot_demo.py` 可以亲眼看到：即使要求「只回答金额」，它也会先在 `reasoning_content` 里把「券能不能用」想清楚。",
      "en": "[▶ 06:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=374) There are two ways to use the trick:\n1. **In the prompt**: ask the model to “break the task down and plan the steps first, then work out the result step by step”.\n2. **Trained into the model**: it worked so well that it was later built into models. The instructor's example is DeepSeek: R1 strengthened reasoning on top of V3, and that reasoning was later folded back into V3, so even with “deep thinking” switched off on the DeepSeek website, it analyses a slightly harder question before answering. New models from Qwen, Google and OpenAI also come with a “thinking” phase.\n\nSo the instructor's advice: understand the idea, but since most new models have it built in, it changes little in practice; if you use a **small or local model without reasoning ability**, a chain-of-thought prompt is still worth it.\n\nThe course's `deepseek-flash` runs in thinking mode by default: its reply always carries an extra `reasoning_content` field with the thinking it did before answering. Run `practice/l03_cot_demo.py` to see it: even when told to “just give the amount”, it first works out in `reasoning_content` whether the coupon applies."
    },
    {
      "t": "check",
      "q": {
        "zh": "现在大部分新模型都自带思考能力。按老师的说法，什么时候还值得在提示词里写「先分解步骤再回答」？",
        "en": "Most new models think on their own now. According to the instructor, when is it still worth adding “break it into steps first” to the prompt?"
      },
      "options": [
        {
          "zh": "任何时候都不需要了",
          "en": "Never any more"
        },
        {
          "zh": "用没有推理能力的小模型或本地模型时",
          "en": "When using a small or local model without reasoning ability"
        },
        {
          "zh": "只有调用工具的时候",
          "en": "Only when calling tools"
        },
        {
          "zh": "只有用 DeepSeek 的时候",
          "en": "Only with DeepSeek"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "带推理能力的模型已经会自己先想；小模型、本地模型没有这个能力，提示词里的思维链还能帮上忙。",
        "en": "Models with reasoning already think first; small and local models lack that ability, so a chain-of-thought prompt still helps them."
      }
    },
    {
      "t": "h",
      "zh": "三、规划 ②：思维树（ToT）——多想几条路，择优",
      "en": "3. Planning ②: Tree of Thoughts (ToT) – try several paths, keep the best"
    },
    {
      "t": "p",
      "zh": "[▶ 08:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=500) 2023 年出现的思维树（Tree of Thoughts，ToT，[Yao 等](https://arxiv.org/abs/2305.10601)）针对的是思维链的一个弱点：**步骤只拆一次，拆得不好，结果也好不了**。\n\n思维树在每一步都想出几种不同的走法，一层层展开成一棵「树」，再从中挑出最好的那条路。最笨的做法是把每条路都走完再比较，但成本太高；更好的做法是借用搜索算法（广度优先或深度优先）：**从第一步就开始评估、择优**，不好的分支及早剪掉，越往下要比较的就越少。这样在差不多的成本下，结果明显更好，论文的实验也显示它比思维链又高出一截。\n\n老师提醒：我们能看出一个模型有没有推理能力，却很难判断它内部有没有做这种「多路择优」。所以思维树可以当作项目里的一个技巧来用。",
      "en": "[▶ 08:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=500) Tree of Thoughts (ToT, [Yao et al.](https://arxiv.org/abs/2305.10601)), which appeared in 2023, targets a weakness of chain of thought: **the task is split only once, and if the split is poor, so is the result**.\n\nAt every step, a tree of thoughts comes up with several different moves, unfolding level by level into a “tree”, and then picks the best path through it. The naive way is to follow every path to the end and compare – far too costly. The better way borrows search algorithms (breadth-first or depth-first): **evaluate and choose from the very first step**, prune poor branches early, and there is less and less to compare further down. For about the same cost the result is clearly better, and the paper's experiments show another clear gain over chain of thought.\n\nThe instructor notes that we can see whether a model reasons at all, but it is hard to tell whether it does this kind of “try several, keep the best” internally – so tree of thoughts is a technique you can use in your own projects."
    },
    {
      "t": "code",
      "file": {
        "zh": "直接回答、思维链、思维树",
        "en": "Direct, CoT and ToT"
      },
      "lang": "text",
      "code": {
        "zh": "直接回答：  问题 → 答案\n\n思维链 CoT：问题 → 步骤1 → 步骤2 → 步骤3 → 答案      （只拆一次，一条路走到底）\n\n思维树 ToT：每一步先想出几种走法，评估以后只沿着好的往下走\n问题\n├─ 步骤1a  ✗ 评估不好，剪掉\n├─ 步骤1b  ✓\n│   ├─ 步骤2a  ✗ 剪掉\n│   └─ 步骤2b  ✓ → 步骤3 → 答案\n└─ 步骤1c  ✗ 剪掉",
        "en": "Direct answer:  question → answer\n\nChain of Thought:  question → step 1 → step 2 → step 3 → answer   (split once, one path to the end)\n\nTree of Thoughts:  at each step, think of several moves, evaluate them, follow only the good ones\nquestion\n├─ step 1a  ✗ judged poor, pruned\n├─ step 1b  ✓\n│   ├─ step 2a  ✗ pruned\n│   └─ step 2b  ✓ → step 3 → answer\n└─ step 1c  ✗ pruned"
      }
    },
    {
      "t": "h",
      "zh": "四、规划 ③：LLM+P——把规划外包给专业工具",
      "en": "4. Planning ③: LLM+P – outsource planning to a dedicated tool"
    },
    {
      "t": "p",
      "zh": "[▶ 13:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=785) 老师说 LLM+P（[Liu 等，2023](https://arxiv.org/abs/2304.11477)）的思路要「刁钻」得多：既然大模型不擅长规划，那就把规划交给**擅长规划的专业工具**。P 指的是经典规划器（planner），它用一种专门描述规划问题的语言 **PDDL**（Planning Domain Definition Language，规划领域定义语言）工作。\n\n流程分三步：大模型把用户的问题**翻译**成 PDDL → 专业规划器算出规划 → 大模型把规划**翻译**回人能看懂的话。也就是说，输入和输出由大模型负责，中间最难的规划外包给了工具。",
      "en": "[▶ 13:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=785) The instructor calls the idea behind LLM+P ([Liu et al., 2023](https://arxiv.org/abs/2304.11477)) far more “cunning”: since LLMs aren't good at planning, hand the planning to **a tool that is**. The P stands for a classical planner, which works in **PDDL** (Planning Domain Definition Language), a language made for describing planning problems.\n\nIt takes three steps: the LLM **translates** the user's problem into PDDL → the planner computes a plan → the LLM **translates** the plan back into plain language. In other words, the LLM handles input and output, and the hardest part in the middle is outsourced to a tool."
    },
    {
      "t": "code",
      "file": {
        "zh": "LLM+P 的流程",
        "en": "The LLM+P pipeline"
      },
      "lang": "text",
      "code": {
        "zh": "用户的问题（自然语言）\n   ↓  大模型：把问题翻译成 PDDL\n用 PDDL 描述的规划问题\n   ↓  专业规划器（经典规划算法）：算出规划          ← 最难的这一步外包给了工具\nPDDL 格式的规划结果\n   ↓  大模型：把规划翻译回自然语言\n人能看懂的行动方案",
        "en": "The user's problem (natural language)\n   ↓  LLM: translate the problem into PDDL\nThe planning problem written in PDDL\n   ↓  A dedicated planner (classical planning algorithm): compute a plan   ← the hard part, outsourced\nThe plan, in PDDL form\n   ↓  LLM: translate the plan back into natural language\nA plan of action people can read"
      }
    },
    {
      "t": "p",
      "zh": "- **局限**：只适合开放性不高的特定领域，比如机器人；通用 Agent 面对的问题五花八门，大多没法写成 PDDL。\n- **值得学的思路**：不要以为所有事都得在大模型内部完成，**可以给它外挂工具**。后面讲的记忆（持久化数据库、知识库）和工具调用，都是这个思路。论文的实验里，它在绝大多数任务上效果最好。\n\n老师坦言项目里多半不会用到 LLM+P，但这种「外挂」的思路非常值得学。",
      "en": "- **Limits**: it only suits narrow, closed domains such as robotics; a general agent faces all sorts of problems, most of which can't be written in PDDL.\n- **The idea worth keeping**: don't assume everything has to happen inside the LLM – **you can bolt tools onto it**. Memory (persistent databases, knowledge bases) and tool calling, coming up later, follow the same idea. In the paper's experiments it did best on nearly every task.\n\nThe instructor admits you probably won't use LLM+P in a project, but this “bolt-on” way of thinking is well worth learning."
    },
    {
      "t": "h",
      "zh": "五、规划 ④：ReAct——边想边做（最重要）",
      "en": "5. Planning ④: ReAct – think and act in turns (the key one)"
    },
    {
      "t": "p",
      "zh": "[▶ 17:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=1034) ReAct = **Re**asoning + **Act**ing（推理 + 行动），来自 2022 年的论文 [ReAct](https://arxiv.org/abs/2210.03629)。和思维链比：思维链是把步骤和每步的结果一路写下去；ReAct 先**推理**，再**用工具去行动**（查知识库、调第三方接口、获取环境信息），看到结果后**再推理**，这样**多轮**循环。\n\n为什么要这样？大模型最大的毛病是幻觉，而且输出会影响后面的输出，前面一步说错，后面往往越错越远。思维链的步骤会影响结果，但如果思路本身就错了，写得再清楚也救不回来。ReAct 可以在过程中用工具**求证、补充信息**，发现走偏了就及时掰回来。\n\n[▶ 19:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=1161) 老师用论文里的对比图说明（问题大意：除了苹果遥控器 Apple Remote，还有什么设备能控制它原本要控制的那个程序？）：\n\n| 方式 | 做法 | 结果 |\n|---|---|---|\n| 直接回答 | 不思考，直接给答案 | 错 |\n| 只推理（思维链） | 写出思考步骤，但对问题的理解本身就错了 | 错 |\n| 只行动 | 没有深入理解问题，就贸然调用搜索工具 | 错 |\n| ReAct | 先想清楚要查什么 → 搜索 → 根据结果再想 → 再搜索求证 | 对 |\n\n[▶ 22:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=1320) 老师强调：ReAct 的特点是**多轮**，不是一次输出就定结果，这也正是 Agent 循环执行、直到达到目的的特点；它的过程也最接近人思考问题的方式。后面写 Agent 时会大量用到这个策略。",
      "en": "[▶ 17:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=1034) ReAct = **Re**asoning + **Act**ing, from the 2022 paper [ReAct](https://arxiv.org/abs/2210.03629). Compared with chain of thought, which writes out the steps and their results in one go, ReAct first **reasons**, then **acts with a tool** (searches a knowledge base, calls a third-party API, reads the environment), sees the result and **reasons again** – looping over **several rounds**.\n\nWhy? An LLM's biggest weakness is hallucination, and since each output feeds the next, one early mistake tends to snowball. The steps of a chain of thought influence the result, but if the line of thinking is wrong to begin with, no amount of clear writing saves it. ReAct can use tools along the way to **verify and gather more information**, and steer back as soon as it notices it has drifted.\n\n[▶ 19:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=1161) The instructor uses a comparison figure from the paper (the question, roughly: apart from the Apple Remote, what other device can control the program the Apple Remote was originally designed to work with?):\n\n| Approach | What it does | Result |\n|---|---|---|\n| Direct answer | No thinking, just an answer | Wrong |\n| Reason only (CoT) | Writes out its thinking, but has misunderstood the question itself | Wrong |\n| Act only | Rushes into searching without really understanding the question | Wrong |\n| ReAct | Works out what to look up → searches → rethinks from the result → searches again to check | Right |\n\n[▶ 22:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=1320) The instructor stresses that ReAct works in **several rounds** rather than settling the result in one output – which is exactly how an agent loops until it reaches its goal – and that its process is closest to how people think problems through. Agents built later in the course use this strategy heavily."
    },
    {
      "t": "code",
      "file": {
        "zh": "ReAct 的一段记录",
        "en": "A ReAct trace"
      },
      "lang": "text",
      "code": {
        "zh": "问题：北京和上海今天哪里更暖和？\n\nThought（思考）: 我需要两地的气温，先查北京。\nAction（行动）: get_weather(latitude=39.90, longitude=116.40)\nObservation（观察）: 18.5\n\nThought: 北京 18.5°C，再查上海。\nAction: get_weather(latitude=31.23, longitude=121.47)\nObservation: 23.1\n\nThought: 23.1 比 18.5 高，信息够了，可以回答了。\nFinal Answer（最终答案）: 上海更暖和（23.1°C，北京 18.5°C）。",
        "en": "Question: Is Beijing or Shanghai warmer today?\n\nThought: I need both temperatures. Beijing first.\nAction: get_weather(latitude=39.90, longitude=116.40)\nObservation: 18.5\n\nThought: Beijing is 18.5°C. Now Shanghai.\nAction: get_weather(latitude=31.23, longitude=121.47)\nObservation: 23.1\n\nThought: 23.1 is higher than 18.5 - I have enough to answer.\nFinal Answer: Shanghai is warmer (23.1°C vs 18.5°C in Beijing)."
      }
    },
    {
      "t": "p",
      "zh": "07 节会从零写出一个 ReAct Agent。视频在那一集的做法是：用**原生工具调用**（`tools` 参数）+ 一段要求模型按「思考 → 行动 → 观察 → 回答」工作的 **ReAct 系统提示词** + **最多循环几轮**；像上面这样的纯文字格式 ReAct，是讲义在 07 节的拓展。\n\n下面先预览这个循环的骨架（讲义补充），注释标出了每一行是推理、行动还是观察。现在不用看懂每一行：点 ▶ 运行，看输出就好。",
      "en": "Lesson 07 builds a ReAct agent from scratch. The video's approach there is **native tool calling** (the `tools` parameter) + a **ReAct system prompt** asking the model to work as “think → act → observe → answer” + **a cap on the number of rounds**; a plain-text ReAct like the trace above is an extension these notes add in lesson 07.\n\nBelow is a preview of the loop's skeleton (an extra from these notes); the comments mark which lines are reasoning, acting and observing. You don't need to follow every line yet: press ▶ Run and read the output."
    },
    {
      "t": "code",
      "file": {
        "zh": "ReAct循环预览.py",
        "en": "react_loop_preview.py"
      },
      "run": "mock",
      "code": {
        "zh": "import json\nfrom llm import client, MODEL                    # 大脑：大模型\nfrom weather_tool import get_weather, tools     # 工具：函数 + 给模型看的说明书\n\n# 记忆（短期）：一个消息列表。第一条是系统提示词\nmemory = [{\"role\": \"system\", \"content\": \"你是天气助手。先想清楚需要什么信息，再调用工具，看到结果后再决定下一步。\"}]\nmemory.append({\"role\": \"user\", \"content\": \"北京和上海今天哪里更暖和？\"})\n\nwhile True:                                      # ReAct 循环：推理 → 行动 → 观察 → 再推理\n    reply = client.chat.completions.create(model=MODEL, messages=memory, tools=tools).choices[0].message\n    memory.append(reply.model_dump())            # 记住模型这一步说了什么\n    if not reply.tool_calls:                     # 推理的结论：信息够了 → 给出最终回答，结束\n        break\n    for call in reply.tool_calls:                # 行动：由我们的程序执行模型选中的工具\n        args = json.loads(call.function.arguments)\n        result = get_weather(**args)\n        print(\"行动：\", call.function.name, args, \"→ 观察：\", result)\n        # 观察：把结果放回记忆，下一轮模型就能看到\n        memory.append({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": str(result)})\n\nprint(\"回答：\", reply.content)",
        "en": "import json\nfrom llm import client, MODEL                    # brain: the LLM\nfrom weather_tool import get_weather, tools     # tools: functions + the manual the model reads\n\n# memory (short-term): a list of messages. The first is the system prompt\nmemory = [{\"role\": \"system\", \"content\": \"You are a weather assistant. Work out what you need, call a tool, then decide the next step from the result.\"}]\nmemory.append({\"role\": \"user\", \"content\": \"Is Beijing or Shanghai warmer today?\"})\n\nwhile True:                                      # the ReAct loop: reason -> act -> observe -> reason again\n    reply = client.chat.completions.create(model=MODEL, messages=memory, tools=tools).choices[0].message\n    memory.append(reply.model_dump())            # remember what the model said in this step\n    if not reply.tool_calls:                     # its reasoning says: enough information -> final answer, stop\n        break\n    for call in reply.tool_calls:                # act: our program runs the tool the model chose\n        args = json.loads(call.function.arguments)\n        result = get_weather(**args)\n        print(\"act:\", call.function.name, args, \"-> observe:\", result)\n        # observe: put the result back into memory so the model sees it next round\n        memory.append({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": str(result)})\n\nprint(\"answer:\", reply.content)"
      },
      "note": {
        "zh": "整个循环只有十几行：一个列表当记忆，一次模型调用负责推理，我们的程序执行工具，再把结果当作观察放回去。为了好读，这里的 `while True` 没设上限；07 节的代码会限制最多循环几轮。浏览器里用的是模拟模型；想用真实模型跑一个完整的 ReAct Agent，见 07 节的 `practice/l07_react_agent_solution.py`。",
        "en": "The whole loop is a dozen lines: a list as memory, one model call for the reasoning, our program running the tool and putting the result back as the observation. To keep it readable, this `while True` has no cap; the code in lesson 07 limits the number of rounds. The browser uses a mock model; for a complete ReAct agent on the real model, see `practice/l07_react_agent_solution.py` in lesson 07."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "ReAct 循环里，Observation（观察）的内容是从哪里来的？",
        "en": "In a ReAct loop, where does the Observation come from?"
      },
      "options": [
        {
          "zh": "模型自己想出来的",
          "en": "The model makes it up"
        },
        {
          "zh": "用户在每一步手动输入的",
          "en": "The user types it at each step"
        },
        {
          "zh": "工具执行后返回的结果",
          "en": "The result returned by running the tool"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "Observation 必须来自真实的工具结果，模型再根据它继续推理、纠偏。如果是模型自己「编」的，那就是幻觉，也就失去了用工具求证的意义。",
        "en": "The Observation must come from a real tool result, which the model then reasons about and corrects course with. If the model invented it, that would be a hallucination – and the point of checking with tools would be lost."
      }
    },
    {
      "t": "h",
      "zh": "六、规划 ⑤：自我反思——做完先检查",
      "en": "6. Planning ⑤: self-reflection – check before you hand it in"
    },
    {
      "t": "p",
      "zh": "[▶ 22:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=1352) 自我反思（Reflection）建立在 ReAct 的基础上：事情做完先**不急着输出**，而是检查结果——做对的地方给予肯定，失败的地方给出有针对性的反馈。这些反馈作为新内容放进**上下文**里，模型下一次就能做得更好，而且**不需要微调模型**。来自外部的监督意见，也是同一类反馈。老师还强调，Agent 的一大特点就是**循环**：不是答一次就收工，而是一轮轮地做下去，直到找到最好的结果或者达成目标。\n\n[▶ 34:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=2098) 老师展示的结构图，看结构应出自 Reflexion 论文（[Shinn 等，2023](https://arxiv.org/abs/2303.11366)）：里面有三个由大模型担任的角色——**执行者**负责做事，**评估者**评价结果的质量，**自我反思**把评估变成改进建议——再加上短期记忆（这一次的过程）和长期记忆（积累下来的经验）。老师的比喻是开车：方向盘先往左转一点点，看车怎么动，转多了就往回收一点。\n\n最简单的反思只需要三次模型调用：\n1. **生成**：先写出初稿\n2. **批评**：让模型换个角色（比如「严格的审稿人」）指出问题\n3. **改进**：把初稿和意见一起交给模型，写出修改版",
      "en": "[▶ 22:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=1352) Self-reflection builds on ReAct: when the work is done, **don't rush to output it** – check the result first, confirm what went right and give targeted feedback on what failed. That feedback goes into the **context** as new material, so the model does better next time, **without fine-tuning**. Supervision from outside is the same kind of feedback. As the instructor puts it, a defining trait of agents is the **loop**: not one response and done, but running again and again until it reaches the best answer or its goal.\n\n[▶ 34:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=2098) Judging by its structure, the diagram the instructor shows comes from the Reflexion paper ([Shinn et al., 2023](https://arxiv.org/abs/2303.11366)): three roles played by LLMs – an **actor** that does the work, an **evaluator** that judges the result's quality, and **self-reflection** that turns the evaluation into suggestions – plus short-term memory (this attempt) and long-term memory (accumulated experience). His analogy is driving: turn the wheel a little to the left, see how the car responds, and ease back if you overdid it.\n\nThe simplest reflection takes just three model calls:\n1. **Generate**: write a first draft\n2. **Critique**: have the model switch roles (say, “a strict reviewer”) and point out problems\n3. **Improve**: give the model the draft plus the critique and get a revised version"
    },
    {
      "t": "code",
      "file": {
        "zh": "自我反思.py",
        "en": "reflection.py"
      },
      "run": "mock",
      "code": {
        "zh": "from llm import client, MODEL\n\ndef ask(prompt):\n    \"\"\"调用一次模型，返回文字回答。\"\"\"\n    response = client.chat.completions.create(model=MODEL, messages=[{\"role\": \"user\", \"content\": prompt}])\n    return response.choices[0].message.content\n\ntask = \"为一家社区咖啡店写一句 20 字以内的招牌标语，只输出标语本身。\"\n\ndraft = ask(task)                                                                    # 1. 生成\ncritique = ask(\"你是严格的广告审稿人。指出下面这句标语的 2 个具体问题：\\n\" + draft)        # 2. 批评\nfinal = ask(\"任务：\" + task + \"\\n初稿：\" + draft + \"\\n审稿意见：\" + critique + \"\\n请根据意见写出修改后的标语。\")   # 3. 改进\n\nprint(\"初稿：\", draft)\nprint(\"意见：\", critique)\nprint(\"终稿：\", final)",
        "en": "from llm import client, MODEL\n\ndef ask(prompt):\n    \"\"\"Call the model once and return its text.\"\"\"\n    response = client.chat.completions.create(model=MODEL, messages=[{\"role\": \"user\", \"content\": prompt}])\n    return response.choices[0].message.content\n\ntask = \"Write a slogan of at most 8 words for a neighbourhood coffee shop. Output only the slogan.\"\n\ndraft = ask(task)                                                                    # 1. generate\ncritique = ask(\"You are a strict advertising reviewer. Point out 2 concrete problems with this slogan:\\n\" + draft)   # 2. critique\nfinal = ask(\"Task: \" + task + \"\\nDraft: \" + draft + \"\\nReview: \" + critique + \"\\nWrite the revised slogan based on the review.\")   # 3. improve\n\nprint(\"draft:\", draft)\nprint(\"review:\", critique)\nprint(\"final:\", final)"
      },
      "note": {
        "zh": "反思就是**三次模型调用串起来**：后一次的提示词里带上前一次的结果。`+` 把几段文字接起来，`\\n` 表示换行（字符串 04 节细讲）。浏览器里的模拟模型只会复述，看不出改进效果；用真实模型运行 `practice/l03_reflection_solution.py`，对比初稿和终稿。",
        "en": "Reflection is just **three model calls chained**: each prompt carries the previous result. `+` joins pieces of text and `\\n` is a line break (strings are covered in lesson 04). The browser's mock model only echoes, so you won't see an improvement there; run `practice/l03_reflection_solution.py` with the real model and compare the draft with the final version."
      }
    },
    {
      "t": "h",
      "zh": "七、规划 ⑥：ReWOO——先把计划做完，再一口气执行",
      "en": "7. Planning ⑥: ReWOO – plan it all, then execute in one go"
    },
    {
      "t": "p",
      "zh": "[▶ 25:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=1505) ReWOO（Reasoning WithOut Observation，无需观察的推理，[Xu 等，2023](https://arxiv.org/abs/2305.18323)）也受 ReAct 启发，但想解决 ReAct 的一个问题：**慢**。ReAct 每做一步都要停下来看结果（观察），再调用一次大模型决定下一步；问题越复杂、前面越不准，来回的轮数就越多，而大模型生成既不快，成本也不低。\n\nReWOO 干脆省掉「每一步都观察」，把工作分给三个模块：\n- **规划器**（Planner）：一次性把所有步骤和要调用的工具都规划好\n- **执行器**（Worker）：照着计划调用工具，只管执行\n- **求解器**（Solver）：拿到全部结果后统一分析整理——去掉没用的，合并有用的，给出最终答案。它相当于「兜底」：计划里有不对的地方，在这里纠正\n\n[▶ 29:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=1785) 老师形象地说：ReAct 是「走一步看一步」，ReWOO 是「先规划好再一口气执行」。差别最直观地体现在调用大模型的次数上（这也是老师夸论文配图画得直观的地方）：",
      "en": "[▶ 25:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=1505) ReWOO (Reasoning WithOut Observation, [Xu et al., 2023](https://arxiv.org/abs/2305.18323)) is also inspired by ReAct but tackles one of its problems: **speed**. ReAct stops after every step to look at the result (observe) and calls the LLM again to choose the next step; the harder the problem and the shakier the early steps, the more rounds it takes – and LLM generation is neither fast nor cheap.\n\nReWOO simply drops the “observe after every step” part and splits the work among three modules:\n- **Planner**: plans every step and every tool call up front, in one go\n- **Worker**: calls the tools as planned – it only executes\n- **Solver**: once all the results are in, analyses them together – drops what's useless, merges what's useful and gives the final answer. It acts as a safety net: whatever was off in the plan gets corrected here\n\n[▶ 29:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=1785) In the instructor's words, ReAct “takes a step and looks around”, while ReWOO “plans first, then executes in one go”. The clearest difference is in how often the LLM is called (the instructor praises the paper's figure for showing this so plainly):"
    },
    {
      "t": "code",
      "file": {
        "zh": "调用次数对比",
        "en": "Counting the calls"
      },
      "lang": "text",
      "code": {
        "zh": "问题：北京、上海、广州今天哪里最暖和？（要查 3 次天气）\n\nReAct：走一步看一步\n  大模型① 推理：先查北京     → 工具：查北京 → 结果交回大模型\n  大模型② 推理：再查上海     → 工具：查上海 → 结果交回大模型\n  大模型③ 推理：再查广州     → 工具：查广州 → 结果交回大模型\n  大模型④ 推理：信息够了     → 最终回答\n  合计：大模型 4 次（N+1，事先不知道会是几次），工具 3 次，一个接一个\n\nReWOO：先规划好，再一口气执行\n  大模型① 规划器：#E1 = 查北京，#E2 = 查上海，#E3 = 查广州\n  执行器：  查北京、查上海、查广州（不调用大模型，还可以同时进行）\n  大模型② 求解器：根据 #E1、#E2、#E3 给出最终回答\n  合计：大模型 2 次（固定），工具 3 次",
        "en": "Question: Which is warmest today: Beijing, Shanghai or Guangzhou?  (3 weather lookups)\n\nReAct: one step at a time, looking after each\n  LLM call 1  reason: Beijing first   -> tool: Beijing  -> result back to the LLM\n  LLM call 2  reason: now Shanghai    -> tool: Shanghai -> result back to the LLM\n  LLM call 3  reason: now Guangzhou   -> tool: Guangzhou -> result back to the LLM\n  LLM call 4  reason: enough info     -> final answer\n  Total: 4 LLM calls (N+1, unknown in advance), 3 tool calls, one after another\n\nReWOO: plan everything first, then execute in one go\n  LLM call 1  Planner: #E1 = Beijing, #E2 = Shanghai, #E3 = Guangzhou\n  Worker:     look up Beijing, Shanghai, Guangzhou (no LLM calls; can even run at the same time)\n  LLM call 2  Solver: final answer from #E1, #E2, #E3\n  Total: 2 LLM calls (fixed), 3 tool calls"
      }
    },
    {
      "t": "p",
      "zh": "| | ReAct | ReWOO |\n|---|---|---|\n| 调用大模型 | 每用一次工具就要再调用一次，总次数事先不知道（大约 N+1 次） | 固定 2 次：规划 1 次 + 求解 1 次 |\n| 调用工具 | N 次，一个接一个 | N 次，还可以并发执行 |\n| 主要优点 | 每一步都能根据结果纠偏，信息不足时更稳 | **快**，省调用 |\n| 主要缺点 | 轮数多，慢 | 只有规划时那一次获取信息的机会：信息不准或不够，计划就不合理，后面跟着错 |\n\n[▶ 33:24](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=2004) 所以 ReWOO 显著提升的是**速度，不是质量**。在一些任务里它比 ReAct 好，但在信息有限或不准确时表现会差一些——有利有弊。（在别处你可能还会见到 Plan-and-Execute「先计划后执行」，思路和 ReWOO 相近。）\n\n下面用天气工具写一个**简化版** ReWOO（讲义补充）：规划器用一次带 `tools` 的调用，让模型把要查的城市一次性全部列出来，当作计划。",
      "en": "| | ReAct | ReWOO |\n|---|---|---|\n| LLM calls | One more after every tool use; the total is unknown in advance (about N+1) | Always 2: plan once + solve once |\n| Tool calls | N, one after another | N, and they can run concurrently |\n| Main strength | Can correct course after every step; steadier when information is thin | **Fast**, fewer calls |\n| Main weakness | Many rounds, slow | Only one chance to gather information, at planning time: if that information is wrong or thin, the plan is poor and everything after it goes wrong |\n\n[▶ 33:24](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=2004) So what ReWOO really improves is **speed, not quality**. On some tasks it beats ReAct, but with limited or inaccurate information it does worse – there are pros and cons. (Elsewhere you may also meet Plan-and-Execute, which follows a similar idea.)\n\nBelow is a **simplified** ReWOO with the weather tool (an extra from these notes): the planner makes one call with `tools` and lets the model list every city to look up at once – that list is the plan."
    },
    {
      "t": "code",
      "file": {
        "zh": "简化版ReWOO.py",
        "en": "simple_rewoo.py"
      },
      "run": "mock",
      "code": {
        "zh": "import json\nfrom llm import client, MODEL\nfrom weather_tool import get_weather, tools\n\nquestion = \"北京、上海、广州今天哪里最暖和？\"\nllm_calls = 0                                    # 数一数一共调用了几次大模型\n\n# ① 规划器 Planner：调用 1 次大模型，让它一次性列出要调用的全部工具，这就是「计划」\nplan = client.chat.completions.create(\n    model=MODEL,\n    messages=[\n        {\"role\": \"system\", \"content\": \"你是规划器：一次性列出回答问题需要的全部工具调用，不要等任何结果。\"},\n        {\"role\": \"user\", \"content\": question},\n    ],\n    tools=tools,\n).choices[0].message\nllm_calls = llm_calls + 1\n\n# ② 执行器 Worker：照着计划逐个调用工具，这一步不调用大模型\nevidence = \"\"\nfor call in plan.tool_calls or []:\n    args = json.loads(call.function.arguments)\n    result = get_weather(**args)\n    print(\"执行：\", call.function.name, args, \"→\", result)\n    evidence = evidence + call.function.name + str(args) + \" = \" + str(result) + \"\\n\"\n\n# ③ 求解器 Solver：再调用 1 次大模型，根据全部结果给出答案\nanswer = client.chat.completions.create(\n    model=MODEL,\n    messages=[{\"role\": \"user\", \"content\": \"问题：\" + question + \"\\n已查到的结果：\\n\" + evidence + \"请根据这些结果回答问题。\"}],\n).choices[0].message.content\nllm_calls = llm_calls + 1\n\nprint(\"回答：\", answer)\nprint(\"一共调用大模型\", llm_calls, \"次\")",
        "en": "import json\nfrom llm import client, MODEL\nfrom weather_tool import get_weather, tools\n\nquestion = \"Which is warmest today: Beijing, Shanghai or Guangzhou?\"\nllm_calls = 0                                    # count how many times we call the LLM\n\n# (1) Planner: 1 LLM call that lists every tool call it needs, all at once - this is the \"plan\"\nplan = client.chat.completions.create(\n    model=MODEL,\n    messages=[\n        {\"role\": \"system\", \"content\": \"You are a planner: list every tool call needed to answer, all at once. Do not wait for any results.\"},\n        {\"role\": \"user\", \"content\": question},\n    ],\n    tools=tools,\n).choices[0].message\nllm_calls = llm_calls + 1\n\n# (2) Worker: run the tools in the plan one by one - no LLM calls here\nevidence = \"\"\nfor call in plan.tool_calls or []:\n    args = json.loads(call.function.arguments)\n    result = get_weather(**args)\n    print(\"run:\", call.function.name, args, \"->\", result)\n    evidence = evidence + call.function.name + str(args) + \" = \" + str(result) + \"\\n\"\n\n# (3) Solver: 1 more LLM call that answers from all the results\nanswer = client.chat.completions.create(\n    model=MODEL,\n    messages=[{\"role\": \"user\", \"content\": \"Question: \" + question + \"\\nResults so far:\\n\" + evidence + \"Answer the question from these results.\"}],\n).choices[0].message.content\nllm_calls = llm_calls + 1\n\nprint(\"answer:\", answer)\nprint(\"LLM calls in total:\", llm_calls)"
      },
      "note": {
        "zh": "不管查几个城市，大模型都只调用 2 次。论文里的规划器写的是文字计划，后面的步骤还能用 `#E1` 这样的记号引用前面步骤的结果；这里为了简单，直接用模型一次返回的多个工具调用当计划，所以步骤之间不能互相依赖。另外，现在的模型常常一次就返回好几个工具调用（并行工具调用），这样 ReAct 实际跑起来的调用次数也会变少，和 ReWOO 的差别没有论文里那么大。想用真实模型对比两者的调用次数和耗时，运行 `practice/l03_react_vs_rewoo.py`：为了看清「走一步看一步」，它让 ReAct 每轮只执行一个工具。",
        "en": "However many cities there are, the LLM is called only twice. In the paper the planner writes a text plan whose later steps can refer to earlier results with markers like `#E1`; to keep things simple, this version uses the several tool calls the model returns at once as the plan, so steps can't depend on each other. Also, today's models often return several tool calls at once (parallel tool calls), so ReAct in practice may need fewer calls and the gap to ReWOO is smaller than in the paper. To compare the two with the real model – number of calls and time taken – run `practice/l03_react_vs_rewoo.py`; to show “one step at a time” clearly, it lets ReAct run only one tool per round."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "要查 5 个城市的气温再比较，用 ReWOO 大约要调用几次大模型？",
        "en": "To look up and compare 5 cities' temperatures, about how many LLM calls does ReWOO need?"
      },
      "options": [
        {
          "zh": "6 次",
          "en": "6"
        },
        {
          "zh": "5 次",
          "en": "5"
        },
        {
          "zh": "1 次",
          "en": "1"
        },
        {
          "zh": "2 次",
          "en": "2"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "规划 1 次 + 求解 1 次，查天气的 5 次是工具调用，不算大模型调用。ReAct 走一步看一步，大约要 5 + 1 = 6 次。",
        "en": "Plan once + solve once; the 5 weather lookups are tool calls, not LLM calls. ReAct, looking after each step, needs about 5 + 1 = 6."
      }
    },
    {
      "t": "h",
      "zh": "八、六种策略怎么选",
      "en": "8. Choosing among the six strategies"
    },
    {
      "t": "p",
      "zh": "[▶ 34:27](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=2067) 回过头来，老师的结论是：最有启发、效果也比较好的是 **ReAct** 和**自我反思**，后面实现 Agent 时，规划和推理部分要侧重这两种；ReWOO 的思路值得了解，但没那么重要。\n\n| 策略 | 一句话 | 优点 | 代价或局限 |\n|---|---|---|---|\n| 思维链 CoT | 把步骤写出来再回答 | 更准、方便排查 | 思路错了救不回来；新模型大多已自带 |\n| 思维树 ToT | 每一步多想几种走法，择优 | 比思维链更好 | 要多次生成和评估 |\n| LLM+P | 规划外包给专业规划器 | 封闭领域效果很好 | 只适合能写成 PDDL 的问题 |\n| ReAct | 推理 → 行动 → 观察，多轮循环 | 能用工具求证、纠偏 | 调用次数多、慢 |\n| 自我反思 | 做完先检查，把反馈放进上下文 | 不用微调就能改进 | 至少多两次调用 |\n| ReWOO | 规划 → 执行 → 求解 | 快，大模型只调用 2 次 | 一次规划定终身，信息不足就不准 |",
      "en": "[▶ 34:27](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=2067) Looking back, the instructor's conclusion: the most instructive and effective strategies are **ReAct** and **self-reflection**, and when we build agents later, the planning and reasoning parts should centre on these two; ReWOO's idea is worth knowing but less important.\n\n| Strategy | In one line | Strength | Cost or limit |\n|---|---|---|---|\n| Chain of Thought | Write the steps out, then answer | More accurate, easier to check | Can't rescue a wrong line of thinking; mostly built into new models |\n| Tree of Thoughts | Several moves per step, keep the best | Better than CoT | Many generations and evaluations |\n| LLM+P | Outsource planning to a dedicated planner | Excellent in closed domains | Only for problems expressible in PDDL |\n| ReAct | Reason → act → observe, over several rounds | Verifies with tools, corrects course | Many calls, slow |\n| Self-reflection | Check before handing in; feedback goes into the context | Improves without fine-tuning | At least two extra calls |\n| ReWOO | Plan → work → solve | Fast; only 2 LLM calls | One plan decides everything; inaccurate when information is thin |"
    },
    {
      "t": "h",
      "zh": "九、记忆：感觉、短期、长期",
      "en": "9. Memory: sensory, short-term, long-term"
    },
    {
      "t": "p",
      "zh": "[▶ 37:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=2224) 老师说记忆这块「还好」：主要是概念梳理，真正需要持久保存的交给专业数据库就行。图里的分法参照的是人类的记忆：\n\n| 类型 | 相当于人的 | 在 Agent 里是什么 | 放在哪 |\n|---|---|---|---|\n| 感觉记忆 | 此时此刻看到、听到的 | 这一次输入的原始内容：文字、向量、图片等各种模态 | 变量 |\n| 短期记忆 | 刚刚发生的事 | 这一轮对话的上下文；任务结束就可以丢掉，或者转存起来 | 内存、缓存（也常直接放在变量里） |\n| 长期记忆 | 小时候学的知识、上学时的经历 | 知识库、对某个人的长期印象等，量大、要一直保存 | 专业数据库 |\n\n[▶ 39:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=2381) 为什么长期记忆要用数据库？因为量大，得能**快速找回**。数据库用自己的数据结构组织内容、建立**索引**，查起来很快。向量检索常用的近似最近邻算法也一样：**先求快，牺牲一点准确度**——就像人回忆往事，很快想起个大概，再慢慢细化、纠正。17 节讲 RAG 时会用到这种检索。\n\n老师的结论：感觉记忆和短期记忆放变量、内存就行（不用持久化，速度快）；长期记忆交给数据库，细节不用纠结。",
      "en": "[▶ 37:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=2224) The instructor calls memory the “easy” part: it's mostly about getting the concepts straight, and whatever must be kept for good goes to a proper database. The diagram's split follows human memory:\n\n| Kind | Like a person's… | In an agent | Kept in |\n|---|---|---|---|\n| Sensory memory | What you see and hear right now | The raw content of this input: text, vectors, images and other modalities | Variables |\n| Short-term memory | What just happened | The context of this conversation; can be dropped or archived when the task ends | RAM, a cache (often simply variables) |\n| Long-term memory | What you learned as a child, your school years | Knowledge bases, a lasting impression of a person, and so on – large and kept for good | A proper database |\n\n[▶ 39:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=2381) Why a database for long-term memory? Because there is a lot of it and you must **find things fast**. A database organises content in its own data structures and builds **indexes**, so look-ups are quick. The approximate-nearest-neighbour algorithms used for vector search work the same way: **speed first, at the cost of a little accuracy** – like a person recalling the past, getting the rough picture fast and then refining it. Lesson 17 uses this kind of retrieval for RAG.\n\nThe instructor's conclusion: keep sensory and short-term memory in variables and RAM (no persistence needed, and it's fast); hand long-term memory to a database and don't fuss over the details."
    },
    {
      "t": "check",
      "q": {
        "zh": "用户上周告诉 Agent「我对花生过敏」。这周开了一个新对话问菜谱，Agent 还记得避开花生。这靠的是？",
        "en": "Last week the user told the agent “I'm allergic to peanuts”. This week, in a brand-new chat about recipes, it still avoids peanuts. What makes that possible?"
      },
      "options": [
        {
          "zh": "长期记忆：存进数据库，用的时候检索出来，放进这次请求的 `messages`",
          "en": "Long-term memory: stored in a database and retrieved into this request's `messages` when needed"
        },
        {
          "zh": "短期记忆：这次对话的上下文",
          "en": "Short-term memory: this conversation's context"
        },
        {
          "zh": "感觉记忆：这一次的输入",
          "en": "Sensory memory: this input"
        },
        {
          "zh": "模型训练时学到了这位用户的信息",
          "en": "The model learned about this user during training"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "新对话的上下文里本来没有上周的内容，只能靠长期记忆把它存下来，需要时再检索出来放进 `messages`，模型才「记得」。",
        "en": "A new chat's context doesn't contain last week's talk; only long-term memory can keep it and bring it back into `messages` when needed – that is how the model “remembers”."
      }
    },
    {
      "t": "h",
      "zh": "十、工具：从函数调用到 MCP 和 A2A",
      "en": "10. Tools: from function calling to MCP and A2A"
    },
    {
      "t": "p",
      "zh": "[▶ 42:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=2536) 大模型本身只会输出文字，**不能使用工具**；把工具交给它用，正是做智能体要做的事——没有工具，大模型做不成智能体。老师用一张流程图讲了工具调用的过程，里面有**三个角色**：用户、大模型，以及**我们写的程序**。",
      "en": "[▶ 42:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=2536) An LLM by itself only outputs text and **cannot use tools**; giving it tools is exactly what building an agent is about – without tools, an LLM can't be an agent. The instructor walks through tool calling with a flow diagram that has **three roles**: the user, the LLM, and **the program we write**."
    },
    {
      "t": "code",
      "file": {
        "zh": "工具调用的流程",
        "en": "The tool-calling flow"
      },
      "lang": "text",
      "code": {
        "zh": "三个角色：用户、大模型、我们的程序\n\n1. 用户   → 程序  ：「北京现在多少度？」\n2. 程序   → 大模型：问题 + 工具说明书 tools（函数名、功能、参数）\n3. 大模型 → 程序  ：「请调用 get_weather，参数 latitude=39.9，longitude=116.4」\n4. 程序           ：替大模型执行函数 get_weather(39.9, 116.4)，得到 18.5\n5. 程序   → 大模型：把结果 18.5 交回去\n6. 大模型 → 程序  ：结合问题和结果，写出回答「北京现在 18.5°C」\n7. 程序   → 用户  ：显示回答",
        "en": "Three roles: the user, the LLM, our program\n\n1. user    -> program: \"What's the temperature in Beijing now?\"\n2. program -> LLM    : the question + the tool manual, tools (function name, purpose, parameters)\n3. LLM     -> program: \"Please call get_weather with latitude=39.9, longitude=116.4\"\n4. program           : runs get_weather(39.9, 116.4) on the LLM's behalf and gets 18.5\n5. program -> LLM    : hands the result 18.5 back\n6. LLM     -> program: combines question and result: \"It's 18.5°C in Beijing now\"\n7. program -> user   : shows the answer"
      }
    },
    {
      "t": "p",
      "zh": "重点是第三个角色：**执行函数的是我们的程序，不是大模型**。程序执行代码天经地义；大模型拿到结果，和自己调用没有区别，就能接着往下处理。\n\n[▶ 45:24](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=2724) 用 OpenAI 格式的接口时，靠的是 `tools` 参数：用 **JSON Schema** 描述每个函数的名字、功能和参数，模型据此判断要不要调用、参数怎么填。选哪个工具的推理能力是模型自己的，我们只是替它执行。05 节会亲手写出这一套。\n\n[▶ 47:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=2822) 这是早期比较朴素的做法：工具由我们事先写好。后来出现了新思路：既然 Agent 强调自主，**能不能让模型自己创造工具？** 模型不能执行代码，但能**输出代码**：它写一段 Python 函数当工具，我们的程序替它运行。这样工具就不受我们事先提供的范围限制，需要什么就写什么，形成「自己造、自己用」的闭环。\n\n为什么首选 Python？它是解释型语言，不用编译，语法简洁、单词接近英文；Java 代码长、编译麻烦；Node.js 也行，但 Python 更简洁。[▶ 49:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=2978) 老师提到，课程用的 OpenAI 框架里没有内置这种能力，而微软的 AutoGen 框架有：把模型生成的代码存成文件、运行、再把结果交回去。\n\n[▶ 50:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=3011) 更新的做法是把**另一个大模型或 Agent 当作工具**：自己能做的自己做，做不了的委托出去。两个热门协议是 **MCP**（模型上下文协议）和 **A2A**（Agent 之间的协议）。[▶ 51:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=3103) 老师的安排是：MCP 已经很普及，后面会实操（11、20 节）；A2A 暂时不跟进——同一个框架里的多个 Agent 互相协作很容易，不需要协议，A2A 主要用于完全不同体系的 Agent 之间交互，场景更宏大。",
      "en": "The key is the third role: **our program runs the function, not the LLM**. Running code is what programs do; once the LLM has the result, it's no different from having called the tool itself, and it carries on from there.\n\n[▶ 45:24](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=2724) With an OpenAI-style API this works through the `tools` parameter: a **JSON Schema** describes each function's name, purpose and parameters, and the model uses it to decide whether to call one and how to fill in the arguments. The reasoning that picks a tool is the model's own; we just run it on its behalf. You'll write all of this yourself in lesson 05.\n\n[▶ 47:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=2822) That is the early, plain approach: we write the tools in advance. A newer idea followed: since agents are meant to be autonomous, **why not let the model create its own tools?** The model can't run code, but it can **write code**: it writes a Python function as a tool, and our program runs it. The tools are then no longer limited to what we prepared – it writes whatever it needs, closing the loop of “make it, then use it”.\n\nWhy Python first? It is interpreted (no compiling), concise and close to English; Java is long-winded and needs compiling; Node.js works too, but Python is more concise. [▶ 49:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=2978) The instructor notes that the OpenAI framework used in the course doesn't build this in, while Microsoft's AutoGen does: it saves the generated code to a file, runs it and hands back the result.\n\n[▶ 50:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=3011) Newer still is using **another LLM or agent as a tool**: do yourself what you can, delegate what you can't. The two popular protocols are **MCP** (Model Context Protocol) and **A2A** (agent-to-agent). [▶ 51:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=3103) The instructor's plan: MCP is already widespread, so the course practises it later (lessons 11 and 20); A2A can wait – agents inside one framework cooperate easily without any protocol, and A2A is mainly for agents from entirely different systems, a much bigger picture."
    },
    {
      "t": "note",
      "title": {
        "zh": "📝 补充：让模型写代码、我们来运行，要注意什么",
        "en": "📝 Extra: what to watch when the model writes code and we run it"
      },
      "zh": "模型生成的代码可能有错，也可能做出危险操作（删文件、乱发请求），所以真正的系统会把它放在隔离的环境（沙箱）里运行，并限制权限（18 节讲权限管理）。另外，版本有变化：现在装的 openai-agents 0.20 里已经有 `CodeInterpreterTool`（在 OpenAI 服务器的沙箱里运行代码）、`ShellTool`（在本机执行命令）这类工具，但它们都依赖 OpenAI 自家的 Responses 接口。课程通过 Chat Completions 接口使用 DeepSeek，这时框架只接受普通的函数工具，放进这类工具会直接报错（Hosted tools are not supported with the ChatCompletions API）。",
      "en": "Model-written code can be wrong or even dangerous (deleting files, firing off requests), so real systems run it in an isolated environment (a sandbox) with limited permissions (lesson 18 covers permissions). Also, things have changed since the video: the installed openai-agents 0.20 has tools such as `CodeInterpreterTool` (runs code in a sandbox on OpenAI's servers) and `ShellTool` (runs commands on your machine), but both rely on OpenAI's own Responses API. The course uses DeepSeek through the Chat Completions API, where the framework accepts only ordinary function tools; adding one of these raises an error (Hosted tools are not supported with the ChatCompletions API)."
    },
    {
      "t": "check",
      "q": {
        "zh": "工具调用的流程里，真正执行 `get_weather(...)` 这个函数的是谁？",
        "en": "In the tool-calling flow, who actually runs the function `get_weather(...)`?"
      },
      "options": [
        {
          "zh": "大模型自己",
          "en": "The LLM itself"
        },
        {
          "zh": "我们写的程序，替大模型执行",
          "en": "Our program, on the LLM's behalf"
        },
        {
          "zh": "用户",
          "en": "The user"
        },
        {
          "zh": "工具会自动执行，谁也不用管",
          "en": "The tool runs by itself; nobody needs to do anything"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "大模型只会输出「我要调用某某工具，参数是……」，执行函数、把结果交回去的是我们的程序。",
        "en": "The LLM only outputs “I want to call such-and-such tool with these arguments”; running the function and returning the result is our program's job."
      }
    },
    {
      "t": "h",
      "zh": "十一、应用场景",
      "en": "11. Use cases"
    },
    {
      "t": "p",
      "zh": "[▶ 52:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=3165) Agent 能用的地方很多，老师列了五类已经有不少实例的方向：\n\n| 场景 | 老师的点评 |\n|---|---|\n| 客户服务 | DeepSeek 开源以后，很多大型国企在跟进，客服是说得最多的方向 |\n| HR（人力资源） | 主要对内：员工问答、重复性和管理性的事务；规模大的公司才用得上 |\n| 创意内容生成 | 给出内容就能出好几套设计方案和配套素材，对广告、设计行业冲击很大 |\n| 数据分析 | 很早就在做，和传统的 BI（商业智能）一脉相承，比较成熟 |\n| 代码 | 讲需求就能写代码、运行、测试、给出预览，前端和 Python 领域尤其强，对程序员的工作影响很大 |",
      "en": "[▶ 52:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=3165) Agents can be used in many places; the instructor lists five areas that already have plenty of real examples:\n\n| Area | The instructor's comments |\n|---|---|\n| Customer service | Since DeepSeek went open source, many large state-owned companies have followed; support is the most-discussed area |\n| HR | Mostly internal: answering staff questions, repetitive and administrative tasks; only large companies really need it |\n| Creative content | Give it the content and it produces several design proposals with matching material – a big shake-up for advertising and design |\n| Data analysis | Done for a long time, in the line of traditional BI (business intelligence); fairly mature |\n| Code | Describe what you need and it writes the code, runs it, tests it and shows a preview – especially strong for front-end and Python; a big impact on programmers' jobs |"
    },
    {
      "t": "p",
      "zh": "[▶ 56:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=3380) 老师重点拆解了**客服智能体**，对比传统的机器人客服：\n- **机器人客服**：固定话术，不知道你是谁、买过什么，查不了订单，问三句答不上来。\n- **客服智能体**：一上来就知道你最近买了什么，问你是不是这件商品用着有问题；你说质量有问题想退货，它请你**拍照或拍视频**发过来，自己判断是不是质量缺陷、会不会影响二次销售，符合条件就**直接在后台发起退货、预约快递上门取件**；它还能识别你的**情绪**。[▶ 1:00:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=3634) 再比如耳机坏了：它查订单发现买了一年多，就告诉你已经过保；要是才买二十几天，就直接安排换新、预约取件。\n\n[▶ 1:01:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=3664) 老师总结的规律：**一件原本由人做的事，如果流程固定、稳定、成熟，配套的工具也齐全，把它做成智能体就很容易。**\n\n用这一节的四个组件，再加上 02 节说的「感知」，来拆解这个客服智能体（这张表是讲义整理的）：\n\n| 组件 | 在客服智能体里的样子 |\n|---|---|\n| 大模型 | 理解用户的话和情绪，决定下一步 |\n| 感知 | 读文字，看懂用户拍的照片和视频（多模态） |\n| 记忆 | 短期：这次的对话；长期：用户的历史订单和以往对话（数据库） |\n| 工具 | 查订单、发起退货、预约快递 |\n| 规划 | ReAct：先查订单，看结果再决定是退货、换新还是说明过保 |",
      "en": "[▶ 56:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=3380) The instructor takes a close look at a **customer-service agent**, compared with an old-style support bot:\n- **Support bot**: canned replies; doesn't know who you are or what you bought, can't look up orders, and runs out of answers after three questions.\n- **Customer-service agent**: knows straight away what you bought recently and asks whether that item is giving you trouble. You say it's faulty and want to return it; it asks you to **send a photo or video**, judges for itself whether it's a quality defect and whether the item can still be resold, and if so **starts the return in the back office and books a courier pick-up**; it can also read your **mood**. [▶ 1:00:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=3634) Or your earphones break: it checks the order, sees it's over a year old and tells you the warranty has expired; if you bought them twenty-odd days ago, it arranges a replacement and a pick-up right away.\n\n[▶ 1:01:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=3664) The rule the instructor draws: **a job people already do, with a fixed, stable, mature process and all the tools in place, is easy to turn into an agent.**\n\nTaking this customer-service agent apart with this lesson's four components, plus the “perception” from lesson 02 (this table is the notes' own):\n\n| Component | In the customer-service agent |\n|---|---|\n| LLM | Understands what the user says and feels; decides the next step |\n| Perception | Reads text; understands the user's photos and videos (multimodal) |\n| Memory | Short-term: this conversation; long-term: past orders and earlier chats (a database) |\n| Tools | Look up orders, start returns, book couriers |\n| Planning | ReAct: check the order first, then decide on a return, a replacement or explaining the warranty |"
    },
    {
      "t": "check",
      "q": {
        "zh": "按老师总结的规律，下面哪件事最容易做成智能体？",
        "en": "Following the instructor's rule, which of these is easiest to turn into an agent?"
      },
      "options": [
        {
          "zh": "一个还没想清楚流程、也没有现成系统的全新业务",
          "en": "A brand-new business whose process isn't worked out yet and has no systems"
        },
        {
          "zh": "一个什么都能做的通用助手",
          "en": "A general assistant that can do anything"
        },
        {
          "zh": "电商的退换货处理：流程固定，订单查询、退货、预约快递的接口都有",
          "en": "Handling returns for an online shop: a fixed process, with APIs for order look-up, returns and courier booking"
        },
        {
          "zh": "需要不断自我学习、应对各种未知情况的学习型 Agent",
          "en": "A learning agent that must keep teaching itself to handle every unknown situation"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "原本由人做、流程固定稳定、配套工具齐全，正好符合老师说的条件。通用助手和学习型都是很难落地的理想型。",
        "en": "Done by people today, with a fixed, stable process and the tools in place – exactly the instructor's conditions. A general assistant and a learning agent are ideal types that are hard to deliver."
      }
    },
    {
      "t": "h",
      "zh": "十二、总结和落地建议",
      "en": "12. Summary and practical advice"
    },
    {
      "t": "p",
      "zh": "[▶ 1:02:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=3725) 最后老师做了总结：\n- Agent 不是新概念，至少有三十年的历史，大语言模型出现之前就在很多领域探索过；大模型的发展给了它新的动力。\n- [▶ 1:03:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=3786) **优先做符合自己需求的 Agent，不要追求通用 Agent**：02 节讲的理想型（比如学习型）很难实现，容易陷进去。\n- **从简单开始，一点点加复杂度**：先用提示词做 Agent 的核心；评估下来不够，再加工具、加记忆（数据库）、加流程编排，最后才是多 Agent 互相监督和合作。不要一上来就跳到最后。\n- [▶ 1:04:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=3847) 展望：将来人和 Agent、Agent 和 Agent 之间的交互都会越来越密切，形成一种「社会化」的局面：互相配合、竞争，甚至互相监督。\n\n[▶ 1:05:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=3939) 老师也承认这一集偏理论、有点枯燥，建议对照笔记复习，或者把里面的话题拿去和大模型讨论。下一集（04）开始动手：把这些概念写成能运行的代码。",
      "en": "[▶ 1:02:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=3725) The instructor wraps up:\n- Agents are not a new idea – at least thirty years old, explored in many fields before LLMs; the progress of LLMs has given them new momentum.\n- [▶ 1:03:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=3786) **Build the agent your own needs call for; don't chase a general agent**: the ideal types from lesson 02 (such as learning agents) are hard to build and easy to get stuck in.\n- **Start simple and add complexity bit by bit**: make a prompt the core of the agent first; if that proves not enough, add tools, then memory (a database), then orchestration, and only at the end multiple agents supervising and cooperating. Don't jump straight to the end.\n- [▶ 1:04:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=3847) Looking ahead: interaction between people and agents, and between agents, will keep getting closer, forming something like a “society” – agents cooperating, competing and even supervising each other.\n\n[▶ 1:05:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=4&t=3939) The instructor admits this episode is theory-heavy and a bit dry, and suggests reviewing it with the notes or discussing its topics with an LLM. The next episode (04) gets hands-on: turning these ideas into code that runs."
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "按老师的解释，让模型把思维链的步骤写进输出，为什么能提高准确率？",
        "en": "According to the instructor, why does writing the chain-of-thought steps into the output improve accuracy?"
      },
      "options": [
        {
          "zh": "写出步骤时模型会自动联网查资料",
          "en": "Writing steps makes the model search the web automatically"
        },
        {
          "zh": "模型前面输出的内容会影响后面的输出，写出来的步骤成了生成答案时的依据",
          "en": "What the model has already output shapes what comes next, so the written steps become a basis for the answer"
        },
        {
          "zh": "思维链会让模型的参数变多",
          "en": "Chain of thought gives the model more parameters"
        },
        {
          "zh": "思维链只对本地小模型有效",
          "en": "Chain of thought only works for small local models"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "输出受提示词、模型本身和模型已经输出的内容影响；步骤写出来，后面的答案就能「看到」它们。另一个好处是方便排查思路。",
        "en": "The output depends on the prompt, the model and what the model has already written; once the steps are written out, the answer can “see” them. Another benefit is that the reasoning becomes easy to check."
      }
    },
    {
      "q": {
        "zh": "思维树（ToT）比思维链多做了什么？",
        "en": "What does Tree of Thoughts do beyond chain of thought?"
      },
      "options": [
        {
          "zh": "每一步想出几种走法，评估后择优，差的分支及早剪掉",
          "en": "At each step it comes up with several moves, evaluates them, keeps the best and prunes poor branches early"
        },
        {
          "zh": "把规划交给 PDDL 规划器",
          "en": "Hands planning to a PDDL planner"
        },
        {
          "zh": "每一步都调用一次工具",
          "en": "Calls a tool at every step"
        },
        {
          "zh": "做完以后让另一个模型挑毛病",
          "en": "Has another model find faults when it's done"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "思维链只拆一次步骤，拆得不好结果就不好；思维树在每一步保留多种可能并择优。B 是 LLM+P，C 更像 ReAct，D 是自我反思。",
        "en": "Chain of thought splits the task once, and a poor split means a poor result; a tree of thoughts keeps several options at each step and picks the best. B is LLM+P, C is closer to ReAct, D is self-reflection."
      }
    },
    {
      "q": {
        "zh": "在 LLM+P 里，大模型负责什么？",
        "en": "In LLM+P, what does the LLM do?"
      },
      "options": [
        {
          "zh": "自己完成全部规划",
          "en": "All of the planning by itself"
        },
        {
          "zh": "什么也不做，全交给规划器",
          "en": "Nothing – the planner does everything"
        },
        {
          "zh": "检查规划器有没有算错",
          "en": "Checks whether the planner made mistakes"
        },
        {
          "zh": "两头翻译：把问题翻成 PDDL，再把规划结果翻回自然语言",
          "en": "Translating at both ends: the problem into PDDL, then the plan back into plain language"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "中间最难的规划外包给了专业规划器，大模型只管理解需求和表达结果。所以它只适合能写成 PDDL 的封闭领域。",
        "en": "The hardest part, planning, is outsourced to the planner; the LLM only understands the request and phrases the result. That's why it suits only closed domains that can be written in PDDL."
      }
    },
    {
      "q": {
        "zh": "在 Apple Remote 那个对比里，「只行动」的方式为什么也答错了？",
        "en": "In the Apple Remote comparison, why did the “act only” approach also get it wrong?"
      },
      "options": [
        {
          "zh": "它根本没有调用工具",
          "en": "It never called a tool"
        },
        {
          "zh": "搜索工具坏了",
          "en": "The search tool was broken"
        },
        {
          "zh": "没有先想清楚问题的本质，就贸然调用工具",
          "en": "It rushed into using tools without first understanding what the question was really asking"
        },
        {
          "zh": "它想得太多，没来得及行动",
          "en": "It thought too much and never got round to acting"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "用了工具总会有结果，但不等于对。ReAct 把推理和行动结合起来：先想清楚要查什么，再根据结果继续推理、求证。",
        "en": "Using a tool always returns something, but that doesn't make it right. ReAct combines the two: work out what to look up, then keep reasoning and checking from the results."
      }
    },
    {
      "q": {
        "zh": "关于 ReWOO，下面哪个说法符合视频的观点？",
        "en": "Which statement about ReWOO matches the video?"
      },
      "options": [
        {
          "zh": "ReWOO 每一步都观察结果，所以比 ReAct 更准",
          "en": "ReWOO observes after every step, so it is more accurate than ReAct"
        },
        {
          "zh": "ReWOO 显著提升的是速度：大模型只调用规划、求解 2 次；但信息不足时计划容易不合理",
          "en": "ReWOO mainly improves speed – only 2 LLM calls, to plan and to solve – but with thin information the plan is easily off"
        },
        {
          "zh": "ReWOO 不需要调用工具",
          "en": "ReWOO needs no tools"
        },
        {
          "zh": "ReWOO 是老师认为最重要的策略",
          "en": "The instructor ranks ReWOO as the most important strategy"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "ReWOO 省掉了每一步的观察，换来速度；代价是只有规划时那一次获取信息的机会。老师认为最重要的是 ReAct 和自我反思。",
        "en": "ReWOO drops the per-step observation and gains speed; the price is a single chance to gather information, at planning time. The instructor ranks ReAct and self-reflection as most important."
      }
    },
    {
      "q": {
        "zh": "按视频的分法，下面哪种安排是对的？",
        "en": "Following the video's split, which arrangement is right?"
      },
      "options": [
        {
          "zh": "感觉记忆存进数据库，长期记忆放在变量里",
          "en": "Sensory memory in a database, long-term memory in variables"
        },
        {
          "zh": "三种记忆都必须持久化到数据库",
          "en": "All three kinds must be persisted to a database"
        },
        {
          "zh": "短期记忆要永久保存，长期记忆任务结束就丢掉",
          "en": "Short-term memory is kept forever, long-term memory is dropped when the task ends"
        },
        {
          "zh": "感觉记忆和短期记忆放变量或内存，长期记忆交给能快速检索的数据库",
          "en": "Sensory and short-term memory in variables or RAM; long-term memory in a database built for fast retrieval"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "前两种不需要持久化，放内存最快；长期记忆量大、要一直保存，还要能快速找回，所以交给数据库。",
        "en": "The first two don't need persistence, so RAM is fastest; long-term memory is large, kept for good and must be found quickly, so it goes to a database."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "ReAct 记录的四个关键词",
        "en": "The four keywords of a ReAct trace"
      },
      "code": {
        "zh": "# 问题：北京和上海今天哪里更暖和？\n# [[Thought|思考]]: 我需要两地的气温，先查北京。\n# [[Action|行动]]: get_weather(latitude=39.90, longitude=116.40)\n# [[Observation|观察]]: 18.5\n# Thought: 再查上海。\n# Action: get_weather(latitude=31.23, longitude=121.47)\n# Observation: 23.1\n# Thought: 23.1 比 18.5 高，可以回答了。\n# [[Final Answer|最终答案]]: 上海更暖和（23.1°C，北京 18.5°C）。",
        "en": "# Question: Is Beijing or Shanghai warmer today?\n# [[Thought]]: I need both temperatures. Beijing first.\n# [[Action]]: get_weather(latitude=39.90, longitude=116.40)\n# [[Observation]]: 18.5\n# Thought: Now Shanghai.\n# Action: get_weather(latitude=31.23, longitude=121.47)\n# Observation: 23.1\n# Thought: 23.1 is higher than 18.5, so I can answer.\n# [[Final Answer]]: Shanghai is warmer (23.1°C vs 18.5°C in Beijing)."
      },
      "explain": {
        "zh": "推理 → 行动 → 观察，循环到能回答为止，最后给出 Final Answer。Observation 来自工具，不是模型编的。",
        "en": "Thought → Action → Observation, looping until it can answer, then the Final Answer. The Observation comes from the tool, not from the model's imagination."
      }
    },
    {
      "title": {
        "zh": "ReWOO 的三个模块",
        "en": "ReWOO's three modules"
      },
      "code": {
        "zh": "# ReWOO：先规划好，再一口气执行\n# [[Planner|规划器]]：一次性规划好所有步骤和工具调用（调用 1 次大模型）\n# [[Worker|执行器]]：照着计划调用工具，不调用大模型\n# [[Solver|求解器]]：汇总全部结果，给出最终答案（再调用 1 次大模型）",
        "en": "# ReWOO: plan everything first, then execute in one go\n# [[Planner|planner]]: plans every step and tool call up front (1 LLM call)\n# [[Worker|worker]]: calls the tools as planned, with no LLM calls\n# [[Solver|solver]]: combines all the results into the final answer (1 more LLM call)"
      },
      "explain": {
        "zh": "大模型只在规划和求解时各调用一次，所以不管要用几次工具，大模型调用都固定是 2 次。",
        "en": "The LLM is called once to plan and once to solve, so however many tools are used, there are always 2 LLM calls."
      }
    },
    {
      "title": {
        "zh": "把三次调用串成自我反思",
        "en": "Chain three calls into self-reflection"
      },
      "code": {
        "zh": "draft = [[ask]](task)                                           # 1. 生成\ncritique = ask(\"指出下面这句标语的 2 个问题：\\n\" + [[draft]])         # 2. 批评\nfinal = ask(\"初稿：\" + draft + \"\\n意见：\" + [[critique]] + \"\\n请修改。\")   # 3. 改进",
        "en": "draft = [[ask]](task)                                                    # 1. generate\ncritique = ask(\"Point out 2 problems with this slogan:\\n\" + [[draft]])     # 2. critique\nfinal = ask(\"Draft: \" + draft + \"\\nReview: \" + [[critique]] + \"\\nRevise it.\")   # 3. improve"
      },
      "explain": {
        "zh": "每一步的提示词都带上前一步的结果：批评要看初稿，改进要同时看初稿和批评。",
        "en": "Each prompt carries the previous result: the critique needs the draft, and the improvement needs both the draft and the critique."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "选做 · 手写：三步自我反思（生成 → 批评 → 改进）",
        "en": "Optional · Write it: three-step self-reflection (generate → critique → improve)"
      },
      "task": {
        "zh": "`ask(prompt)` 已经写好：传进一段提示词，返回模型的文字回答。请在下面写出反思流程：\n1. 用 `ask(task)` 让模型完成任务，结果存进 `draft`（初稿）\n2. 让模型扮演「严格的审稿人」，指出 `draft` 的问题，结果存进 `critique`\n3. 把 `task`、`draft`、`critique` 一起交给模型，写出修改版，存进 `final`\n4. 用 `print` 打印初稿和终稿\n\n只需要会两件事：`名字 = ask(\"提示词\")` 把回答存起来；用 `+` 把几段文字接在一起。（变量和字符串 04 节正式讲。）",
        "en": "`ask(prompt)` is ready: pass in a prompt, get the model's text back. Write the reflection flow below:\n1. Use `ask(task)` to do the task and store the result in `draft`\n2. Have the model act as “a strict reviewer” and point out problems in `draft`; store that in `critique`\n3. Give the model `task`, `draft` and `critique` together for a revised version; store it in `final`\n4. `print` the draft and the final version\n\nYou only need two things: `name = ask(\"prompt\")` stores an answer, and `+` joins pieces of text. (Variables and strings are covered properly in lesson 04.)"
      },
      "run": "mock",
      "starter": {
        "zh": "from llm import client, MODEL\n\ndef ask(prompt):\n    \"\"\"调用一次模型，返回文字回答（已经写好，直接用）。\"\"\"\n    response = client.chat.completions.create(model=MODEL, messages=[{\"role\": \"user\", \"content\": prompt}])\n    return response.choices[0].message.content\n\ntask = \"为一家社区咖啡店写一句 20 字以内的招牌标语，只输出标语本身。\"\n\n# 1. 生成：初稿存进 draft\n\n\n# 2. 批评：让模型当审稿人，指出 draft 的问题，存进 critique\n\n\n# 3. 改进：把 task、draft、critique 一起交给模型，存进 final\n\n\n# 4. 打印初稿和终稿",
        "en": "from llm import client, MODEL\n\ndef ask(prompt):\n    \"\"\"Call the model once and return its text (ready to use).\"\"\"\n    response = client.chat.completions.create(model=MODEL, messages=[{\"role\": \"user\", \"content\": prompt}])\n    return response.choices[0].message.content\n\ntask = \"Write a slogan of at most 8 words for a neighbourhood coffee shop. Output only the slogan.\"\n\n# 1. generate: store the first draft in draft\n\n\n# 2. critique: the model acts as a reviewer and finds problems in draft; store it in critique\n\n\n# 3. improve: give task, draft and critique to the model together; store it in final\n\n\n# 4. show the draft and the final version"
      },
      "solution": {
        "zh": "from llm import client, MODEL\n\ndef ask(prompt):\n    \"\"\"调用一次模型，返回文字回答（已经写好，直接用）。\"\"\"\n    response = client.chat.completions.create(model=MODEL, messages=[{\"role\": \"user\", \"content\": prompt}])\n    return response.choices[0].message.content\n\ntask = \"为一家社区咖啡店写一句 20 字以内的招牌标语，只输出标语本身。\"\n\n# 1. 生成：初稿存进 draft\ndraft = ask(task)\n\n# 2. 批评：让模型当审稿人，指出 draft 的问题，存进 critique\ncritique = ask(\"你是严格的广告审稿人。指出下面这句标语的 2 个具体问题：\\n\" + draft)\n\n# 3. 改进：把 task、draft、critique 一起交给模型，存进 final\nfinal = ask(\"任务：\" + task + \"\\n初稿：\" + draft + \"\\n审稿意见：\" + critique + \"\\n请根据意见写出修改后的标语。\")\n\n# 4. 打印初稿和终稿\nprint(\"初稿：\", draft)\nprint(\"终稿：\", final)",
        "en": "from llm import client, MODEL\n\ndef ask(prompt):\n    \"\"\"Call the model once and return its text (ready to use).\"\"\"\n    response = client.chat.completions.create(model=MODEL, messages=[{\"role\": \"user\", \"content\": prompt}])\n    return response.choices[0].message.content\n\ntask = \"Write a slogan of at most 8 words for a neighbourhood coffee shop. Output only the slogan.\"\n\n# 1. generate: store the first draft in draft\ndraft = ask(task)\n\n# 2. critique: the model acts as a reviewer and finds problems in draft; store it in critique\ncritique = ask(\"You are a strict advertising reviewer. Point out 2 concrete problems with this slogan:\\n\" + draft)\n\n# 3. improve: give task, draft and critique to the model together; store it in final\nfinal = ask(\"Task: \" + task + \"\\nDraft: \" + draft + \"\\nReview: \" + critique + \"\\nWrite the revised slogan based on the review.\")\n\n# 4. show the draft and the final version\nprint(\"draft:\", draft)\nprint(\"final:\", final)"
      },
      "checks": [
        {
          "zh": "用 `ask(task)` 生成初稿，存进 `draft`",
          "en": "Generates the draft with `ask(task)` into `draft`",
          "re": "^draft\\s*=\\s*ask\\(\\s*task\\s*\\)"
        },
        {
          "zh": "批评：把 `draft` 接进提示词交给模型，结果存进 `critique`",
          "en": "Critique: `draft` goes into the prompt, the result into `critique`",
          "re": "^critique\\s*=\\s*ask\\(.*\\bdraft\\b"
        },
        {
          "zh": "改进：提示词里同时用到 `draft` 和 `critique`，结果存进 `final`",
          "en": "Improve: the prompt uses both `draft` and `critique`, the result goes into `final`",
          "re": "^final\\s*=\\s*ask\\((?=.*\\bdraft\\b)(?=.*\\bcritique\\b)"
        },
        {
          "zh": "用 `print` 打印终稿 `final`",
          "en": "Prints `final` with `print`",
          "re": "print\\(.*\\bfinal\\b"
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "以为模型自己会执行工具：模型只说「要调用什么、参数是什么」，执行函数、交回结果的是我们的程序。",
      "en": "Thinking the model runs tools itself: it only says what to call and with which arguments; running it and returning the result is our program's job."
    },
    {
      "zh": "以为写出思维链就一定对：思路本身错了，步骤写得再清楚也救不回来，这时需要用工具求证（ReAct）。",
      "en": "Assuming a written-out chain of thought must be right: if the line of thinking is wrong, clear steps won't save it – that's when tools are needed to check (ReAct)."
    },
    {
      "zh": "以为 ReWOO 比 ReAct 更准：它主要是更快、更省调用；信息不足时计划一错，后面全错。",
      "en": "Thinking ReWOO is more accurate than ReAct: it is mainly faster and uses fewer calls; when information is thin, one bad plan spoils everything after it."
    },
    {
      "zh": "以为长期记忆存进数据库就够了：不检索出来放进 `messages`，模型根本看不到。",
      "en": "Thinking storing long-term memory in a database is enough: unless it is retrieved into `messages`, the model never sees it."
    },
    {
      "zh": "ReAct 循环不设上限：可能一直调用工具停不下来，又慢又费钱。",
      "en": "No cap on a ReAct loop: it can keep calling tools forever – slow and costly."
    },
    {
      "zh": "一上来就追求通用、复杂的 Agent：先用提示词做核心，不够再一步步加工具、记忆、编排和多 Agent。",
      "en": "Aiming straight for a general, complex agent: start with a prompt at the core, then add tools, memory, orchestration and multiple agents step by step as needed."
    },
    {
      "zh": "自我反思时只把意见发给模型、忘了附上初稿（或者反过来），模型不知道该改什么。",
      "en": "In self-reflection, sending only the critique without the draft (or the other way round), so the model doesn't know what to revise."
    }
  ],
  "recap": [
    {
      "zh": "组成：大模型选合适的就行，真正要设计的是规划、记忆、工具，其中规划最难。",
      "en": "Components: just pick a suitable LLM; the design work is in planning, memory and tools, and planning is the hardest."
    },
    {
      "zh": "六种规划策略：CoT 把步骤写出来；ToT 每步多想几种、择优；LLM+P 把规划外包给专业规划器；ReAct 推理 → 行动 → 观察多轮循环；自我反思做完先检查、把反馈放进上下文；ReWOO 规划 → 执行 → 求解。",
      "en": "Six planning strategies: CoT writes the steps out; ToT tries several moves per step and keeps the best; LLM+P outsources planning to a planner; ReAct loops reason → act → observe; self-reflection checks the work and feeds the critique back into the context; ReWOO plans → works → solves."
    },
    {
      "zh": "老师认为最重要的是 ReAct 和自我反思；ReWOO 大模型只调用 2 次，提升的是速度不是质量。",
      "en": "The instructor ranks ReAct and self-reflection highest; ReWOO calls the LLM only twice and improves speed, not quality."
    },
    {
      "zh": "记忆：感觉记忆（这次的输入）和短期记忆（这轮对话）放变量、内存；长期记忆交给能快速检索的数据库。",
      "en": "Memory: sensory (this input) and short-term (this conversation) live in variables and RAM; long-term memory goes to a database built for fast retrieval."
    },
    {
      "zh": "工具：三个角色里，执行函数的是我们的程序；新趋势是让模型写代码当工具，以及用 MCP、A2A 把别的模型和 Agent 当工具。",
      "en": "Tools: of the three roles, our program runs the function; the new trends are letting the model write code as tools, and using other models and agents as tools via MCP and A2A."
    },
    {
      "zh": "应用：原本由人做、流程固定、工具齐全的工作最容易做成智能体；落地时从简单的提示词开始，一步步加复杂度。",
      "en": "Use cases: jobs people already do, with a fixed process and the tools in place, are the easiest to turn into agents; in practice, start from a simple prompt and add complexity step by step."
    }
  ],
  "files": [
    {
      "path": "practice/l03_cot_demo.py",
      "zh": "演示：同一道打折题问两次，看 DeepSeek 在 `reasoning_content` 里的思考过程（模型自带的思维链）。",
      "en": "Demo: ask the same discount question twice and look at DeepSeek's thinking in `reasoning_content` (built-in chain of thought)."
    },
    {
      "path": "practice/l03_react_vs_rewoo.py",
      "zh": "演示：同一个三城市气温问题，分别用 ReAct（走一步看一步，每轮只执行一个工具）和简化版 ReWOO（先规划再执行）来做，比较调用大模型的次数和耗时（真实模型 + 真实天气）。",
      "en": "Demo: the same three-city temperature question done with ReAct (one step at a time, one tool per round) and a simplified ReWOO (plan, then execute), comparing LLM calls and time taken (real model + real weather)."
    },
    {
      "path": "practice/l03_reflection_todo.py",
      "zh": "选做练习：写 3 行代码，把「生成 → 批评 → 改进」三次模型调用串起来（有 TODO 提示）。",
      "en": "Optional exercise: write 3 lines that chain the “generate → critique → improve” model calls (with TODO hints)."
    },
    {
      "path": "practice/l03_reflection_solution.py",
      "zh": "上面练习的参考答案，用真实模型对比初稿和终稿。",
      "en": "Reference solution for the exercise above; compare the draft and the final version with the real model."
    }
  ]
});
