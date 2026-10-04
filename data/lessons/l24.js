COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l24",
  "priority": "overview",
  "handwrite": false,
  "studyMinutes": 15,
  "source": "subtitle",
  "noPy": true,
  "summary": {
    "zh": "老师对着几张架构图介绍了五种常见的多智能体架构：网状、监管者、智能体当工具、分级、自定义，并用「写一篇博客」的例子讲分级团队怎样一层层拆任务、汇总结果、返工。区分它们最好用的问题是：谁有决策权。结论：多智能体是把单智能体这个「黑盒」拆成更小的颗粒，控制更精细，但要关注的点更多、难度更高。讲义最后补充一个不用框架的「智能体当工具」小例子。",
    "en": "With a few architecture diagrams the instructor introduces five common multi-agent architectures – network, supervisor, agents as tools, hierarchical and custom – and uses a “write a blog post” example to show how a hierarchical team splits the work level by level, gathers results and loops back for fixes. The best question for telling them apart: who has the power to decide. Conclusion: multi-agent splits the single-agent “black box” into finer pieces – finer control, but more to watch and harder to build. The notes end with a framework-free “agents as tools” example."
  },
  "goals": [
    {
      "zh": "说出五种常见架构的名字，并画出它们的示意图",
      "en": "Name the five common architectures and sketch each one"
    },
    {
      "zh": "用「谁有决策权、谁决定下一步」区分这几种架构",
      "en": "Tell them apart by asking who has the power to decide the next step"
    },
    {
      "zh": "用「写博客」的例子讲清分级架构怎样拆任务、汇总结果、不合格时返工",
      "en": "Use the “write a blog post” example to explain how a hierarchy splits work, gathers results and loops back when the result is not good enough"
    },
    {
      "zh": "说出把系统拆细的好处（控制更精细）和代价（关注点更多、难度更高）",
      "en": "Explain the gain of splitting a system finer (finer control) and the price (more to watch, harder)"
    },
    {
      "zh": "（补充）看懂「智能体当工具」的实现：本质还是工具调用循环",
      "en": "(Extra) Read an “agents as tools” implementation and see that it is still the tool-call loop"
    }
  ],
  "blocks": [
    {
      "t": "video",
      "zh": "这一集约 5 分钟，老师对着架构图逐一讲解，没有代码。他讲的五种架构和顺序，与 LangGraph 旧版文档多智能体页面的分类一致（Network、Supervisor、Supervisor (tool-calling)、Hierarchical、Custom），图多半就出自那里。讲解顺序：\n- [▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=1) 回顾单智能体的图\n- [▶ 00:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=34) 网状\n- [▶ 00:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=55) 监管者\n- [▶ 01:28](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=88) 智能体当工具\n- [▶ 01:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=98) 分级，以及「写博客」的例子\n- [▶ 03:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=235) 自定义\n- [▶ 04:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=253) 总结：拆得更细，控制更精细，难度也更高",
      "en": "In this ~5-minute episode the instructor goes through architecture diagrams one by one; there is no code. The five architectures he covers, in the same order, match the categories on the multi-agent page of LangGraph's older docs (Network, Supervisor, Supervisor (tool-calling), Hierarchical, Custom), which is most likely where the diagrams come from. The order:\n- [▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=1) Recap of the single-agent diagram\n- [▶ 00:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=34) Network\n- [▶ 00:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=55) Supervisor\n- [▶ 01:28](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=88) Agents as tools\n- [▶ 01:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=98) Hierarchical, with the “write a blog post” example\n- [▶ 03:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=235) Custom\n- [▶ 04:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=253) Wrap-up: finer pieces, finer control, more difficulty"
    },
    {
      "t": "h",
      "zh": "一、从单智能体说起",
      "en": "1. Starting from a single agent"
    },
    {
      "t": "p",
      "zh": "[▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=1) 先回顾上一节的单智能体图：大模型和工具来回互动，把输入任务变成输出结果。简单任务这样做没问题，复杂任务就可能在这个循环里出岔子，于是才有了多智能体。多智能体的搭法有很多种，下面看最常见的五种。\n\n看每一种时，都问自己一个问题：**谁有决策权——下一步做什么、交给谁，由谁说了算？** 老师讲网状、监管者和自定义架构时，都特意点出了这一点。",
      "en": "[▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=1) First a recap of last lesson's single-agent diagram: the model and the tools go back and forth to turn the input into a result. That works for simple tasks; on complex ones things can go wrong inside the loop, which is why multi-agent exists. There are many ways to wire agents together; here are the five most common.\n\nFor each one, ask: **who has the power to decide – what happens next, and who handles it?** The instructor makes a point of it for the network, supervisor and custom architectures."
    },
    {
      "t": "h",
      "zh": "二、网状（Network）",
      "en": "2. Network"
    },
    {
      "t": "code",
      "file": {
        "zh": "示意图：网状",
        "en": "diagram: network"
      },
      "lang": "text",
      "code": " [A] <-----> [B]\n  ^  \\       /  ^\n  |    \\   /    |\n  |      X      |\n  |    /   \\    |\n  v  /       \\  v\n [C] <-----> [D]"
    },
    {
      "t": "p",
      "zh": "[▶ 00:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=34) 每两个 Agent 之间都是**双向通信**的。系统里**任何一个 Agent 都能做决策**，可以把任务发给其他任何一个 Agent。\n- 好处：灵活，没有中心。\n- 要小心：流程难预测、难调试，Agent 之间可能来回踢皮球、绕圈。\n\n第 12 节 OpenAI Agents SDK 的交接（`handoffs`）就带有这种味道：决定权跟着对话交给下一个 Agent。如果每个 Agent 都能交接给其他所有 Agent，就成了网状。",
      "en": "[▶ 00:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=34) Every pair of agents talks **in both directions**. **Any agent can make decisions** and send work to any other agent.\n- Upside: flexible, no centre.\n- Watch out: the flow is hard to predict and debug; agents may pass work back and forth or go round in circles.\n\nHandoffs (`handoffs`) in the OpenAI Agents SDK, from lesson 12, have this flavour: the decision power moves with the conversation to the next agent. If every agent can hand off to every other agent, you have a network."
    },
    {
      "t": "h",
      "zh": "三、监管者（Supervisor）",
      "en": "3. Supervisor"
    },
    {
      "t": "code",
      "file": {
        "zh": "示意图：监管者",
        "en": "diagram: supervisor"
      },
      "lang": "text",
      "code": {
        "zh": "              [ 监管者 ]\n          派任务 ↓     ↑ 交结果\n      /           |           \\\n [Agent A]    [Agent B]    [Agent C]",
        "en": "            [ supervisor ]\n        assign ↓       ↑ report\n      /            |            \\\n [agent A]     [agent B]     [agent C]"
      }
    },
    {
      "t": "p",
      "zh": "[▶ 00:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=55) 这种最像人类的工作方式：几个 Agent 组成一个小团队，有一个监管者（leader）。监管者把任务派给下面的「员工」，员工做完把结果交回监管者；监管者再派下一个任务、再收结果……**决策权在监管者手里**。\n- 好处：流程清楚，出了问题先看监管者的决定。\n- 要小心：每派一次任务，监管者都要调用一次模型；它还得知道每个员工能干什么。",
      "en": "[▶ 00:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=55) This is the closest to how people work: a few agents form a small team with a supervisor (the leader). The supervisor hands tasks to the “staff”, they report results back, the supervisor hands out the next task and collects again… **The supervisor holds the decision power.**\n- Upside: a clear flow; when something goes wrong, check the supervisor's decisions first.\n- Watch out: every handoff costs the supervisor a model call, and it must know what each member can do."
    },
    {
      "t": "h",
      "zh": "四、智能体当工具（工具调用式监管者）",
      "en": "4. Agents as tools (tool-calling supervisor)"
    },
    {
      "t": "code",
      "file": {
        "zh": "示意图：智能体当工具",
        "en": "diagram: agents as tools"
      },
      "lang": "text",
      "code": {
        "zh": "输入 --> [ 大模型 ]（中间的大脑：一个普通的大模型，不是 Agent）\n             |  tools = [ Agent A, Agent B, Agent C ]\n             v\n   「调用工具」= 让某个 Agent 去干活，它的回答作为工具结果交回 --> 输出",
        "en": "input --> [ model ]  (the central brain: an ordinary model, not an agent)\n              |  tools = [ agent A, agent B, agent C ]\n              v\n   “calling a tool” = sending an agent to work; its answer returns as the tool result --> output"
      }
    },
    {
      "t": "p",
      "zh": "[▶ 01:28](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=88) 这种架构看起来和单智能体一模一样：中间一个「主脑」，周围一圈工具。区别在于，**这些工具其实是一个个 Agent**，而主脑用的是一个普通的大模型——它通过工具调用决定把任务交给哪个 Agent。\n\n它是监管者架构的一个特例，也是最容易实现的一种：你在第 05–07 节写的工具调用循环原样就能用。第 12 节学过的 OpenAI Agents SDK `agent.as_tool(...)` 做的就是这件事，第 13 节的实战也用了它。本节最后的「补充」用纯 Python 把它写了出来。",
      "en": "[▶ 01:28](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=88) This looks exactly like a single agent: a central “brain” with tools around it. The difference: **those tools are actually agents**, and the brain is an ordinary model that decides, through tool calls, which agent gets the task.\n\nIt is a special case of the supervisor, and the easiest one to build: the tool-call loop from lessons 05–07 works as is. `agent.as_tool(...)` in the OpenAI Agents SDK (lesson 12, used again in the lesson 13 project) does exactly this. The “Extra” at the end of this lesson writes it in plain Python."
    },
    {
      "t": "h",
      "zh": "五、分级（Hierarchical）：一层层拆任务",
      "en": "5. Hierarchical: splitting work level by level"
    },
    {
      "t": "code",
      "file": {
        "zh": "示意图：分级（写博客）",
        "en": "diagram: hierarchical (writing a blog post)"
      },
      "lang": "text",
      "code": {
        "zh": "                        [ 总监管者 ]\n             /               |               \\\n     [ 搜索组长 ]       [ 写作组长 ]       [ 评估组长 ]\n      /   |   \\          /   |   \\          /      \\\n   搜1  搜2  搜3      写1  写2  写3       评1      评2",
        "en": "                        [ top supervisor ]\n             /                  |                  \\\n     [ search lead ]     [ writing lead ]     [ review lead ]\n      /    |    \\         /    |    \\          /       \\\n   srch1 srch2 srch3   part1 part2 part3   check1   check2"
      }
    },
    {
      "t": "p",
      "zh": "[▶ 01:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=98) 分级架构最像一家公司：总经理把任务拆给几个小团队，每个小团队又有自己的组长，组长再把任务拆给下面的人。这样任务能分得很清楚。\n\n[▶ 02:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=129) 老师用「帮我写一篇博客」这个笼统的任务走了一遍：\n\n1. 总监管者手下有三个团队：搜索、写作、评估。它先把搜索任务交给**搜索团队**。\n2. 搜索组长看清要搜什么，把它拆成几个具体的搜索分给组员；大家搜完，组长把结果汇总，交回给总监管者。\n3. [▶ 02:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=160) 素材有了，总监管者把任务交给**写作团队**。写作组长把文章分成几部分，分给组员写，写完汇总交回。\n4. [▶ 03:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=191) 总监管者再交给**评估团队**。评估组长同样拆分任务，最后给出结论：写得行不行、还缺什么。\n5. 如果不行，总监管者就继续给搜索团队、写作团队派补充任务，直到满意为止。\n\n每一层的**决策权在各自的组长手里**，总监管者只和组长打交道。老师说，多智能体在很大程度上就是借鉴人类团队和自然界群体的协作方式——群体的智慧，往往比单个个体更强。",
      "en": "[▶ 01:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=98) A hierarchy works like a company: the general manager splits the job among small teams, each team has its own lead, and the lead splits it further among the members. That keeps the work clearly divided.\n\n[▶ 02:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=129) The instructor walks through a vague task, “write me a blog post”:\n\n1. The top supervisor has three teams: search, writing and review. It first gives the search task to the **search team**.\n2. The search lead works out what to look for, splits it into specific searches for the members, gathers their results and reports back to the top.\n3. [▶ 02:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=160) With the material ready, the top supervisor hands over to the **writing team**. The writing lead splits the post into parts, members write them, and the lead sends the combined text back.\n4. [▶ 03:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=191) Next the **review team**. Its lead splits the checking too and finally reports whether the post is good enough and what is missing.\n5. If it isn't, the top supervisor sends follow-up tasks to the search and writing teams again, until the result is satisfactory.\n\nAt each level **the decision power lies with that team's lead**; the top supervisor only talks to the leads. The instructor notes that multi-agent design largely borrows from how human teams and groups in nature cooperate – a group's intelligence is often greater than any individual's."
    },
    {
      "t": "check",
      "q": {
        "zh": "写博客的例子里，评估团队认为文章还缺内容。接下来会怎样？",
        "en": "In the blog example, the review team finds the post is missing content. What happens next?"
      },
      "options": [
        {
          "zh": "评估组员直接自己把文章改完",
          "en": "The review members finish rewriting the post themselves"
        },
        {
          "zh": "总监管者再给搜索团队、写作团队派补充任务",
          "en": "The top supervisor sends follow-up tasks to the search and writing teams"
        },
        {
          "zh": "整个流程失败，直接结束",
          "en": "The whole run fails and stops"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "评估结果交回总监管者，由它决定下一步：继续给搜索、写作团队派活，直到满意。",
        "en": "The review result goes back to the top supervisor, which decides the next step: more work for the search and writing teams until it is satisfied."
      }
    },
    {
      "t": "h",
      "zh": "六、自定义（Custom）",
      "en": "6. Custom"
    },
    {
      "t": "code",
      "file": {
        "zh": "示意图：自定义",
        "en": "diagram: custom"
      },
      "lang": "text",
      "code": {
        "zh": "[A] ---> [B] ---> [C*] --可以--> [D] ---> 结束\n          ^         |\n          +--不行---+\n\n* 只有 C 有决策权：由它决定往哪走；A、B、D 只负责干活，按固定的箭头往下传",
        "en": "[A] ---> [B] ---> [C*] --ok--> [D] ---> end\n          ^         |\n          +--redo---+\n\n* only C may decide where to go; A, B and D just do their work and pass it along fixed arrows"
      }
    },
    {
      "t": "p",
      "zh": "[▶ 03:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=235) 自定义架构里，Agent 们没有固定的上下级，看上去有点「乱」；关键是**只有一部分 Agent 有决策权**，其他 Agent 只做自己那一步，没法决定流程往哪走。\n\n换句话说：大部分路线是你事先定好的，只在少数几个地方让某个 Agent 判断走哪条路。这种「按业务量身定制」的流程，正是后面 LangGraph 最擅长画的东西（节点、边、条件边，第 26–28 节）。",
      "en": "[▶ 03:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=235) In a custom architecture the agents have no fixed ranks, which can look a bit “chaotic”; the key is that **only some agents have decision power** – the rest just do their own step and cannot decide where the flow goes.\n\nIn other words, most of the route is fixed in advance, and only at a few points does an agent choose the way. This kind of tailor-made flow is exactly what LangGraph is best at drawing (nodes, edges, conditional edges – lessons 26–28)."
    },
    {
      "t": "h",
      "zh": "七、对比和总结：拆得越细，控制越细，难度越高",
      "en": "7. Comparison and wrap-up: finer pieces, finer control, more difficulty"
    },
    {
      "t": "p",
      "zh": "| 架构 | 谁有决策权 | 像什么 |\n|---|---|---|\n| 网状 | 每个 Agent 都可以 | 一群人自由讨论，谁都能把事交给别人 |\n| 监管者 | 监管者（leader） | 小团队：组长派活、收结果 |\n| 智能体当工具 | 中间的大模型（通过工具调用） | 单智能体，只是工具换成了 Agent |\n| 分级 | 各级监管者 | 公司：总经理 → 组长 → 组员 |\n| 自定义 | 只有部分 Agent | 按业务量身定制的流程 |\n\n[▶ 04:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=253) 老师的总结：多智能体其实是在**更小的颗粒度、更低的层面**做封装。单智能体的内部像一个黑盒，各部分耦合得比较紧；多智能体把它拆成了更细的零件。\n- 好处：**控制可以更精细**，也更灵活。\n- 代价：要关注的地方更多，难度也随之提高。\n\n[▶ 04:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=285) 所以老师把多智能体放在课程的「拔高」部分：先把单智能体（在他原来的课程里还有 LangChain）的基础打牢，再学这部分会轻松很多。",
      "en": "| Architecture | Who has decision power | Like |\n|---|---|---|\n| Network | Every agent | A free discussion where anyone can pass work to anyone |\n| Supervisor | The supervisor (leader) | A small team: the lead assigns and collects |\n| Agents as tools | The central model (via tool calls) | A single agent whose tools are agents |\n| Hierarchical | Supervisors at each level | A company: manager → team leads → members |\n| Custom | Only some agents | A flow tailor-made for the business |\n\n[▶ 04:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=253) The instructor's summary: multi-agent is encapsulation at a **finer grain and a lower level**. Inside, a single agent is like a black box whose parts are tightly coupled; multi-agent breaks it into smaller pieces.\n- Gain: **finer control**, and more flexibility.\n- Price: more things to watch, and higher difficulty.\n\n[▶ 04:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=25&t=285) That is why he puts multi-agent in the “advanced” part of the course: get the single-agent basics solid first (in his original course, LangChain too), and this part becomes much easier."
    },
    {
      "t": "note",
      "zh": "补充：名字会变，问题不变。新版 LangChain 文档把多智能体模式改叫 Subagents（主 Agent 把子 Agent 当工具调用，相当于「智能体当工具」）、Handoffs（按状态切换到另一个 Agent，接近网状里的交接）、Skills、Router、Custom workflow。看到新名字时，照样问一句「谁有决策权」就能对上号。",
      "en": "Extra: names change, the question doesn't. Newer LangChain docs call the patterns Subagents (a main agent calls sub-agents as tools – “agents as tools”), Handoffs (switching to another agent based on state – close to the network's handoffs), Skills, Router and Custom workflow. When you meet a new name, ask “who has the decision power?” and it maps right back."
    },
    {
      "t": "h",
      "zh": "八、补充：不用框架实现「智能体当工具」",
      "en": "8. Extra: “agents as tools” without a framework"
    },
    {
      "t": "note",
      "zh": "补充 / Extra：视频里没有代码，这一段是讲义补充的，可以先跳过。它说明「智能体当工具」并不神秘：主管就是第 06 节的工具调用循环，只不过某个「工具函数」内部又调用了一次模型。",
      "en": "Extra: the video has no code; this part is added by the notes and can be skipped for now. It shows that “agents as tools” is nothing mysterious: the supervisor is the tool-call loop from lesson 06, except that a “tool function” calls the model again inside."
    },
    {
      "t": "code",
      "file": "supervisor_tools.py",
      "run": "mock",
      "code": {
        "zh": "import json\nfrom llm import client, MODEL\n\n# ---------- 两个子 Agent：各有自己的提示词、自己的 messages ----------\ndef run_agent(system_prompt, task):\n    messages = [\n        {\"role\": \"system\", \"content\": system_prompt},\n        {\"role\": \"user\", \"content\": task},\n    ]\n    response = client.chat.completions.create(model=MODEL, messages=messages)\n    return response.choices[0].message.content\n\ndef translator(text):\n    return run_agent(\"你是翻译专家，只把内容翻译成英文，不要解释。\", text)\n\ndef poet(topic):\n    return run_agent(\"你是诗人，围绕主题写一首四行短诗。\", topic)\n\nworkers = {\"translator\": translator, \"poet\": poet}   # 工具名 → 函数（第 07 节的分发表）\n\ndef as_tool(name, description, param):\n    \"\"\"把一个子 Agent 包装成主管能看懂的工具说明。\"\"\"\n    return {\"type\": \"function\", \"function\": {\n        \"name\": name,\n        \"description\": description,\n        \"parameters\": {\"type\": \"object\",\n                       \"properties\": {param: {\"type\": \"string\"}},\n                       \"required\": [param]},\n    }}\n\ntools = [\n    as_tool(\"translator\", \"翻译专家：把中文翻译成英文\", \"text\"),\n    as_tool(\"poet\", \"诗人：根据主题写一首短诗\", \"topic\"),\n]\n\n# ---------- 主管：就是第 06 节的工具调用循环 ----------\nhistory = [\n    {\"role\": \"system\", \"content\": \"你是主管。把任务交给合适的专家，最后汇总结果。\"},\n    {\"role\": \"user\", \"content\": \"请让 translator 翻译「我喜欢学习编程」，再让 poet 以秋天为主题写首短诗。\"},\n]\n\ndef ask_supervisor():\n    reply = client.chat.completions.create(model=MODEL, messages=history, tools=tools).choices[0].message\n    history.append(reply.model_dump())\n    return reply\n\nreply = ask_supervisor()\nwhile reply.tool_calls:\n    for call in reply.tool_calls:\n        args = json.loads(call.function.arguments)\n        print(f\"[主管 → {call.function.name}]\", args)\n        result = workers[call.function.name](**args)    # 运行子 Agent\n        print(\"   子 Agent 回答：\", result)\n        history.append({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": result})\n    reply = ask_supervisor()\n\nprint(\"主管最终回答：\", reply.content)",
        "en": "import json\nfrom llm import client, MODEL\n\n# ---------- two sub-agents: each has its own prompt and its own messages ----------\ndef run_agent(system_prompt, task):\n    messages = [\n        {\"role\": \"system\", \"content\": system_prompt},\n        {\"role\": \"user\", \"content\": task},\n    ]\n    response = client.chat.completions.create(model=MODEL, messages=messages)\n    return response.choices[0].message.content\n\ndef translator(text):\n    return run_agent(\"You are a translator. Translate the text into French. No explanations.\", text)\n\ndef poet(topic):\n    return run_agent(\"You are a poet. Write a four-line poem about the topic.\", topic)\n\nworkers = {\"translator\": translator, \"poet\": poet}   # tool name -> function (dispatch table, lesson 07)\n\ndef as_tool(name, description, param):\n    \"\"\"Wrap a sub-agent as a tool definition the supervisor understands.\"\"\"\n    return {\"type\": \"function\", \"function\": {\n        \"name\": name,\n        \"description\": description,\n        \"parameters\": {\"type\": \"object\",\n                       \"properties\": {param: {\"type\": \"string\"}},\n                       \"required\": [param]},\n    }}\n\ntools = [\n    as_tool(\"translator\", \"Translation expert: translates text into French\", \"text\"),\n    as_tool(\"poet\", \"Poet: writes a short poem on a topic\", \"topic\"),\n]\n\n# ---------- the supervisor: exactly the tool-call loop from lesson 06 ----------\nhistory = [\n    {\"role\": \"system\", \"content\": \"You are a supervisor. Give each task to the right expert, then sum up.\"},\n    {\"role\": \"user\", \"content\": \"Ask translator to put 'I enjoy learning to code' into French, then ask poet for a short poem about autumn.\"},\n]\n\ndef ask_supervisor():\n    reply = client.chat.completions.create(model=MODEL, messages=history, tools=tools).choices[0].message\n    history.append(reply.model_dump())\n    return reply\n\nreply = ask_supervisor()\nwhile reply.tool_calls:\n    for call in reply.tool_calls:\n        args = json.loads(call.function.arguments)\n        print(f\"[supervisor -> {call.function.name}]\", args)\n        result = workers[call.function.name](**args)    # run the sub-agent\n        print(\"   sub-agent answer:\", result)\n        history.append({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": result})\n    reply = ask_supervisor()\n\nprint(\"Supervisor's final answer:\", reply.content)"
      },
      "note": {
        "zh": "看几个要点：\n- 主管部分和第 06 节的 `while reply.tool_calls` 循环一模一样，没有新语法。\n- `workers[call.function.name](**args)`：用工具名在分发表里找到函数，再用 `**args` 把参数传进去（第 05、07 节）。\n- 每个子 Agent 调用模型时只带 **2 条**消息：自己的 system 提示词 + 主管交给它的任务，看不到主管的记录。在网页里运行时，模拟模型会告诉你「这次请求一共带了 2 条消息」。\n- 网页里的模拟模型只会调用提问里**点名**的工具，所以提问里写了 translator 和 poet；而且它会把整句提问原样当作参数。真实模型会根据工具说明自己判断找谁、传什么（实测时传的是「我喜欢学习编程」和「秋天」）。\n- 本地文件 `practice/l24_supervisor_tools.py` 用真实的 DeepSeek 运行。制作讲义时实测：主管第一次回复就同时发出了两个工具调用，一共调用 4 次模型；主管的记录有 6 条消息，每个子 Agent 只看到 2 条。",
        "en": "Points to notice:\n- The supervisor part is the `while reply.tool_calls` loop from lesson 06, unchanged – no new syntax.\n- `workers[call.function.name](**args)` looks the function up by tool name in the dispatch table and passes the arguments with `**args` (lessons 05 and 07).\n- Each sub-agent calls the model with only **2** messages – its own system prompt + the task from the supervisor – and never sees the supervisor's history. In the browser the mock model reports “This request carried 2 messages”.\n- The browser's mock model only calls tools **named** in the question, hence “translator” and “poet” in it, and it passes the whole question as the argument. A real model decides from the tool descriptions whom to call and what to pass (in the test run: just the sentence to translate, and “autumn”).\n- The local file `practice/l24_supervisor_tools.py` runs this against the real DeepSeek. In a test run while writing these notes, the supervisor issued both tool calls in its first reply, for 4 model calls in total; its history held 6 messages while each sub-agent saw only 2."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "在上面的例子里，`poet` 子 Agent 调用模型时能看到什么？",
        "en": "In the example above, what does the `poet` sub-agent see when it calls the model?"
      },
      "options": [
        {
          "zh": "主管的全部对话记录，包括翻译的结果",
          "en": "The supervisor's whole history, including the translation"
        },
        {
          "zh": "只有它自己的 system 提示词和主管交给它的任务",
          "en": "Only its own system prompt and the task the supervisor gave it"
        },
        {
          "zh": "什么都看不到，只能返回固定的诗",
          "en": "Nothing; it can only return a fixed poem"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "`run_agent` 每次都新建一个只有 2 条消息的列表，子 Agent 看不到主管的记录。",
        "en": "`run_agent` builds a fresh 2-message list every time, so the sub-agent never sees the supervisor's history."
      }
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "「每两个 Agent 之间都能双向通信，任何一个 Agent 都能决定把任务交给谁」描述的是哪种架构？",
        "en": "“Every pair of agents talks both ways, and any agent can decide whom to pass the work to.” Which architecture is this?"
      },
      "options": [
        {
          "zh": "监管者",
          "en": "Supervisor"
        },
        {
          "zh": "分级",
          "en": "Hierarchical"
        },
        {
          "zh": "网状",
          "en": "Network"
        },
        {
          "zh": "智能体当工具",
          "en": "Agents as tools"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "网状架构没有中心，每个 Agent 都有决策权。",
        "en": "A network has no centre; every agent has decision power."
      }
    },
    {
      "q": {
        "zh": "「智能体当工具」这种架构里，中间负责做决策的是什么？",
        "en": "In the “agents as tools” architecture, what makes the decisions in the middle?"
      },
      "options": [
        {
          "zh": "一个普通的大模型：它通过工具调用决定把任务交给哪个 Agent",
          "en": "An ordinary model that decides, via tool calls, which agent gets the task"
        },
        {
          "zh": "所有 Agent 轮流做决策",
          "en": "All agents take turns deciding"
        },
        {
          "zh": "用户每一步手动选择",
          "en": "The user picks manually at every step"
        },
        {
          "zh": "没有人做决策，Agent 们按随机顺序运行",
          "en": "Nobody; the agents run in random order"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "老师说它模拟的是单智能体的结构，只是主脑是一个普通大模型，而工具换成了一个个 Agent。",
        "en": "As the instructor puts it, it mimics the single-agent structure: the brain is an ordinary model, and the tools are agents."
      }
    },
    {
      "q": {
        "zh": "老师的「写博客」分级例子里，搜索组长拿到任务后做什么？",
        "en": "In the instructor's hierarchical blog example, what does the search lead do with its task?"
      },
      "options": [
        {
          "zh": "直接把任务退回给总监管者",
          "en": "Sends it straight back to the top supervisor"
        },
        {
          "zh": "自己开始写文章",
          "en": "Starts writing the post itself"
        },
        {
          "zh": "把任务交给评估团队",
          "en": "Passes it to the review team"
        },
        {
          "zh": "把搜索任务拆给几个组员，汇总大家的结果后交回给总监管者",
          "en": "Splits the search among several members, gathers their results and reports back to the top supervisor"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "每一层的组长负责拆分本组的任务、汇总结果；总监管者只和组长打交道。",
        "en": "Each lead splits its team's work and gathers the results; the top supervisor talks only to the leads."
      }
    },
    {
      "q": {
        "zh": "按老师的说法，自定义架构的关键特点是？",
        "en": "According to the instructor, what is the key trait of a custom architecture?"
      },
      "options": [
        {
          "zh": "必须有一个总监管者",
          "en": "There must be a top supervisor"
        },
        {
          "zh": "只有一部分 Agent 有决策权，其他 Agent 只做自己那一步",
          "en": "Only some agents have decision power; the rest just do their own step"
        },
        {
          "zh": "所有 Agent 都能决定下一步",
          "en": "Every agent can decide the next step"
        },
        {
          "zh": "只能有两个 Agent",
          "en": "There can be only two agents"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "自定义架构里大家没有固定的上下级，但只有部分 Agent 能决定流程往哪走。",
        "en": "There are no fixed ranks, but only some agents can decide where the flow goes."
      }
    },
    {
      "q": {
        "zh": "老师怎样总结多智能体相对单智能体的变化？",
        "en": "How does the instructor sum up what changes from single-agent to multi-agent?"
      },
      "options": [
        {
          "zh": "多智能体一定更便宜",
          "en": "Multi-agent is always cheaper"
        },
        {
          "zh": "多智能体不需要任何设计，模型会自己商量",
          "en": "Multi-agent needs no design; the models sort it out"
        },
        {
          "zh": "把系统拆成更小的颗粒：控制更精细、更灵活，但要关注的地方更多、难度更高",
          "en": "The system is split into finer pieces: finer control and more flexibility, but more to watch and more difficulty"
        },
        {
          "zh": "多智能体的内部是一个更大的黑盒",
          "en": "Inside, multi-agent is an even bigger black box"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "单智能体像一个耦合紧密的黑盒；多智能体把它拆细了，控制更精细，代价是难度提升。所以它被放在课程的拔高部分。",
        "en": "A single agent is a tightly coupled black box; multi-agent breaks it up for finer control, at the price of more difficulty – hence its place in the advanced part."
      }
    },
    {
      "q": {
        "zh": "系统里有 20 个 Agent，分属搜索、写作、设计、审核四个小组。最合适的架构是？",
        "en": "A system has 20 agents in four teams: search, writing, design and review. Which architecture fits best?"
      },
      "options": [
        {
          "zh": "一个监管者直接管理 20 个 Agent",
          "en": "One supervisor managing all 20 agents directly"
        },
        {
          "zh": "分级：每组一个组长，上面一个总监管者",
          "en": "Hierarchical: a lead per team, with a top supervisor above"
        },
        {
          "zh": "网状：20 个 Agent 互相交接",
          "en": "Network: 20 agents handing off to each other"
        },
        {
          "zh": "单个 Agent 带上所有工具",
          "en": "One agent with every tool"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "像公司一样分组，每一层只需要管几个对象，任务分得清楚。",
        "en": "Group them like a company; each level then manages only a few, and the work stays clearly divided."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "（补充）主管循环：把工具调用交给子 Agent",
        "en": "(Extra) Supervisor loop: route tool calls to sub-agents"
      },
      "code": {
        "zh": "workers = {\"translator\": translator, \"poet\": poet}\n\nreply = ask_supervisor()\nwhile reply.[[tool_calls]]:\n    for call in reply.tool_calls:\n        args = json.[[loads]](call.function.arguments)\n        result = [[workers]][call.function.[[name]]]([[**args]])\n        history.append({\"role\": \"tool\", \"tool_call_id\": call.[[id]], \"content\": result})\n    reply = ask_supervisor()",
        "en": "workers = {\"translator\": translator, \"poet\": poet}\n\nreply = ask_supervisor()\nwhile reply.[[tool_calls]]:\n    for call in reply.tool_calls:\n        args = json.[[loads]](call.function.arguments)\n        result = [[workers]][call.function.[[name]]]([[**args]])\n        history.append({\"role\": \"tool\", \"tool_call_id\": call.[[id]], \"content\": result})\n    reply = ask_supervisor()"
      },
      "explain": {
        "zh": "用工具名在分发表 `workers` 里找到子 Agent 函数并运行，它的回答作为 tool 消息交回主管。",
        "en": "Look the sub-agent function up in the `workers` dispatch table by tool name, run it, and hand its answer back to the supervisor as a tool message."
      }
    }
  ],
  "pitfalls": [
    {
      "zh": "把五个架构名字背下来却说不出区别——问一句「谁有决策权、谁决定下一步」就能分清。",
      "en": "Memorising the five names without knowing the difference – ask “who has decision power, who decides the next step?” to tell them apart."
    },
    {
      "zh": "网状架构不设退出条件，Agent 之间来回交接停不下来。要限制最大轮数。",
      "en": "A network with no stop condition, where agents keep handing work back and forth forever. Cap the number of rounds."
    },
    {
      "zh": "分级架构层级太多：每多一层，就多几次模型调用，更慢也更贵。",
      "en": "Too many levels in a hierarchy: each extra level adds model calls, making it slower and pricier."
    },
    {
      "zh": "「智能体当工具」时，工具的 `description` 写得含糊，主脑不知道该找谁。要写清楚每个 Agent 能做什么。",
      "en": "Vague tool `description`s in “agents as tools”, so the brain cannot tell whom to ask. Say clearly what each agent does."
    },
    {
      "zh": "单智能体还没掌握就直接上多智能体：拆得越细，要关注的地方越多。先打好单智能体的基础。",
      "en": "Jumping to multi-agent before mastering single agents: the finer you split, the more there is to watch. Build the single-agent basics first."
    }
  ],
  "recap": [
    {
      "zh": "五种常见架构：网状、监管者、智能体当工具、分级、自定义。",
      "en": "Five common architectures: network, supervisor, agents as tools, hierarchical, custom."
    },
    {
      "zh": "区分它们的问题：谁有决策权——网状人人都有，监管者在 leader，智能体当工具在中间的大模型，分级在各级组长，自定义只有部分 Agent。",
      "en": "Tell them apart by decision power: everyone (network), the leader (supervisor), the central model (agents as tools), each level's lead (hierarchical), only some agents (custom)."
    },
    {
      "zh": "分级架构像公司：总监管者把任务派给各团队，组长再拆分、汇总，评估不合格就返工。",
      "en": "A hierarchy works like a company: the top supervisor assigns teams, leads split and gather, and a failed review sends work back."
    },
    {
      "zh": "多智能体 = 在更小的颗粒度上封装：控制更精细，但关注点更多、难度更高。",
      "en": "Multi-agent = encapsulation at a finer grain: finer control, but more to watch and more difficulty."
    },
    {
      "zh": "（补充）智能体当工具 = 把子 Agent 包装成工具，主管就是普通的工具调用循环。",
      "en": "(Extra) Agents as tools = sub-agents wrapped as tools; the supervisor is an ordinary tool-call loop."
    }
  ],
  "files": [
    {
      "path": "practice/l24_supervisor_tools.py",
      "zh": "补充演示：用真实模型运行「主管 + 两个子 Agent 工具」，打印主管把任务交给了谁、每个子 Agent 看到了几条消息（约 4 次模型调用）。",
      "en": "Extra demo: run “supervisor + two sub-agent tools” against the real model, printing whom the supervisor delegated to and how many messages each sub-agent saw (about 4 model calls)."
    }
  ]
});
