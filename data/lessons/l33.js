COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l33",
  "priority": "overview",
  "handwrite": false,
  "studyMinutes": 10,
  "source": "subtitle",
  "noPy": true,
  "summary": {
    "zh": "这一集只讲概念、不写代码：为什么追求自动化的 AI 应用里还要加一个**人工环节**。大模型按概率「猜」答案，总有出错的可能；在容错低、影响大的系统里，要让人对模型的决定查看、批准或修改。老师列出了几种人工介入的方式（批准/拒绝、编辑状态、审查工具调用、多轮问答），并用爬虫→写作、问卷调查、AI 自动推送三个例子说明。代码在接下来三集。",
    "en": "A concept-only episode with no code: why an AI application meant to automate things still needs a **human step**. Language models “guess” answers by probability, so they can always be wrong; in systems with little tolerance for errors and big consequences, a person should look at, approve or change the model's decisions. The instructor lists the ways a person can step in (approve/reject, edit state, review tool calls, multi-turn Q&A) and illustrates them with three examples: crawler → writer, a questionnaire, and AI-written push notifications. The code comes in the next three episodes."
  },
  "goals": [
    {
      "zh": "说清楚：既然要自动化，为什么还要加人工环节",
      "en": "Explain why an application meant to automate still needs a human step"
    },
    {
      "zh": "说出几种人工介入方式，并各举一个视频里的例子",
      "en": "Name the ways a person can step in, with an example of each from the video"
    },
    {
      "zh": "判断一个流程里人工审核应该放在哪一步",
      "en": "Decide where a human check belongs in a workflow"
    },
    {
      "zh": "知道接下来三集分别用代码实现哪一种人工介入",
      "en": "Know which kind of human step each of the next three episodes implements"
    }
  ],
  "blocks": [
    {
      "t": "h",
      "zh": "一、自动化了，为什么还要人？",
      "en": "1. If the point is automation, why add a person?"
    },
    {
      "t": "p",
      "zh": "[▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=34&t=1) 前面几集学了图的结构（节点、边）和持久化、记忆。这一集讲 LangGraph 很有特色的一个核心组件：**人机交互**（Human-in-the-Loop，常简写为 HITL）。说得简单点，就是在 AI 应用的流程里**插入一个人工审核的环节**。\n\n[▶ 00:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=34&t=32) 老师先回答了一个很自然的疑问：做 AI 应用不就是为了自动化、少用人吗？他的回答是：人工环节是为了让系统**更成熟、更稳定**。这也是他建议在生产或商业环境里做智能体时选用 LangGraph 的原因之一：这个能力是框架本身就提供的。",
      "en": "[▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=34&t=1) The previous episodes covered the structure of a graph (nodes, edges) plus persistence and memory. This one introduces a distinctive LangGraph component: **human-in-the-loop** (HITL). Put simply, it means **inserting a human review step** into the flow of an AI application.\n\n[▶ 00:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=34&t=32) The instructor first answers an obvious question: isn't the whole point of AI applications to automate and need fewer people? His answer: the human step is there to make the system **more mature and more stable**. It is also one reason he recommends LangGraph for agents in production or commercial settings – the framework provides this capability itself."
    },
    {
      "t": "p",
      "zh": "[▶ 01:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=34&t=63) 为什么需要这层保障？现在的大模型都建立在 Transformer 架构上，本质上是按**统计概率**算出答案，说白了是在「猜」。只要是猜，就有猜错的时候：\n- 系统对错误不太敏感：偶尔错一次，问题不大。\n- 系统对错误**容忍度很低**、一出错影响就很大：哪怕只错一次也不行。老师设想了一个例子：用智能体做**航班调度**，一次概率上的失误就可能酿成大祸，这样的系统不可能全交给模型。\n\n所以在这类系统里，要让人对模型的决定**查看、批准，必要时修改**。",
      "en": "[▶ 01:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=34&t=63) Why is this safeguard needed? Today's large models are built on the Transformer architecture and work out answers by **statistical probability** – in plain words, they guess. Anything that guesses will sometimes guess wrong:\n- If the system is not very sensitive to errors, an occasional mistake is no big deal.\n- If the system has **very little tolerance** for errors and a mistake has big consequences, even one error is too many. The instructor imagines an agent doing **flight scheduling**: a single unlucky guess could lead to disaster, so such a system can't be handed entirely to a model.\n\nIn systems like these, a person should **look at, approve and, if needed, change** the model's decisions."
    },
    {
      "t": "video",
      "zh": "这一集约 5 分钟，**只有概念、没有代码**。老师的主线是：模型靠概率得出答案 → 会出错 → 关键环节要有人把关；接着列出人能做的几件事（[▶ 02:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=34&t=126)），再用爬虫→写作（[▶ 02:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=34&t=156)）、问卷调查（[▶ 03:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=34&t=221)）和 AI 自动推送（[▶ 04:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=34&t=251)）三个例子说明。写代码从下一集开始。",
      "en": "This episode is about 5 minutes long and is **concepts only, no code**. The instructor's thread: models reach answers by probability → they make mistakes → key steps need a person to check them. He then lists what a person can do ([▶ 02:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=34&t=126)) and gives three examples: crawler → writer ([▶ 02:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=34&t=156)), a questionnaire ([▶ 03:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=34&t=221)) and AI-written push notifications ([▶ 04:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=34&t=251)). Coding starts in the next episode."
    },
    {
      "t": "check",
      "q": {
        "zh": "按老师的说法，下面哪个系统**最需要**人工把关？",
        "en": "Following the instructor's reasoning, which system **most** needs a human check?"
      },
      "options": [
        {
          "zh": "陪用户闲聊、讲笑话的聊天机器人",
          "en": "A chatbot that chats and tells jokes"
        },
        {
          "zh": "帮用户给文章起几个备选标题的小工具",
          "en": "A small tool that suggests a few titles for an article"
        },
        {
          "zh": "负责航班调度的智能体",
          "en": "An agent that schedules flights"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "航班调度对错误几乎零容忍，一次失误后果严重。闲聊和起标题错了也无伤大雅，不必每步都让人审核。",
        "en": "Flight scheduling has almost zero tolerance for errors, and one mistake is serious. A wrong joke or title is harmless, so those don't need a person at every step."
      }
    },
    {
      "t": "h",
      "zh": "二、人可以在哪些地方插手",
      "en": "2. Where a person can step in"
    },
    {
      "t": "p",
      "zh": "[▶ 02:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=34&t=126) 老师列出了人工环节常见的几种做法：\n\n| 做法 | 人做什么 | 视频里的例子 |\n|---|---|---|\n| 批准或拒绝 | 模型要执行某个指令时，人点「通过」或「拒绝」 | 模型决定执行某条指令 |\n| 编辑状态 | 在两个节点之间看一眼状态，有问题就改 | 爬虫节点 → 写作节点 |\n| 审查工具调用 | 先检查模型选的**工具**对不对、**参数**对不对，再让它执行 | 调用工具之前 |\n| 多轮对话 | 智能体问一个问题，人回答，再问下一个 | 问卷调查 |",
      "en": "[▶ 02:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=34&t=126) The instructor lists the common ways to add a human step:\n\n| Way | What the person does | Example in the video |\n|---|---|---|\n| Approve or reject | Clicks “approve” or “reject” when the model is about to carry out an instruction | The model decides to run a command |\n| Edit state | Looks at the state between two nodes and fixes it if something is wrong | Crawler node → writer node |\n| Review tool calls | Checks that the **tool** and its **arguments** are right before letting it run | Before a tool is called |\n| Multi-turn conversation | The agent asks a question, the person answers, then the next question | A questionnaire |"
    },
    {
      "t": "p",
      "zh": "[▶ 02:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=34&t=156) 「编辑状态」那个例子值得细想：第一个节点是爬虫，去某个网站抓资料；第二个节点根据资料写文章。哪天目标网站加了反爬虫措施，抓回来的东西其实是错的，可下游的写作节点并不知道，照样认真地写，最后得到一篇建立在错误资料上的文章。如果在两个节点之间加一个人工环节，人看一眼抓到的内容，不对就改掉（或者叫停），后面的节点就不会被带偏。",
      "en": "[▶ 02:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=34&t=156) The “edit state” example is worth a closer look. The first node is a crawler that fetches material from a website; the second writes an article from it. One day the site adds anti-scraping measures and what the crawler brings back is wrong – but the writer node downstream has no idea and dutifully writes anyway, producing an article built on bad material. With a human step between the two nodes, a person glances at what was fetched and fixes it (or stops the run) when it's wrong, so the later nodes aren't led astray."
    },
    {
      "t": "code",
      "lang": "text",
      "file": {
        "zh": "爬虫 → 写作：有没有人工环节",
        "en": "Crawler → writer: with and without a human step"
      },
      "code": {
        "zh": "没有人工环节： 爬虫节点 --(抓到错误的资料)--> 写作节点 --> 一篇错误的文章\n加上人工环节： 爬虫节点 --> [人：看一眼，必要时修改状态] --> 写作节点 --> 文章",
        "en": "No human step:   crawler --(wrong material)--> writer --> a wrong article\nWith a human step: crawler --> [person: look, fix the state if needed] --> writer --> article"
      }
    },
    {
      "t": "p",
      "zh": "[▶ 03:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=34&t=189) **审查工具调用**在智能体里很常见（下一集开头老师还说它是最常见的一种）：模型说「我要调用某个工具，参数是……」，人先确认工具和参数都对，再放行。这样系统的稳定性就有了保证。\n\n[▶ 03:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=34&t=221) **多轮对话**最典型的场景是问卷：智能体一次问一个问题，人回答完再问下一个。这里「停下来等人」本身就是流程的一部分。",
      "en": "[▶ 03:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=34&t=189) **Reviewing tool calls** is very common in agents (at the start of the next episode the instructor calls it the most common kind): the model says “I want to call this tool with these arguments”, and a person confirms both are right before letting it through. That keeps the system stable.\n\n[▶ 03:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=34&t=221) The classic case of **multi-turn conversation** is a questionnaire: the agent asks one question at a time and moves on after the person answers. Here, “stop and wait for a person” is part of the flow itself."
    },
    {
      "t": "check",
      "q": {
        "zh": "爬虫节点抓到的资料可能有错，在它和写作节点之间加一个人工环节，属于哪种做法？",
        "en": "The crawler may fetch bad material, so a human step is added between it and the writer. Which way of stepping in is this?"
      },
      "options": [
        {
          "zh": "多轮对话",
          "en": "Multi-turn conversation"
        },
        {
          "zh": "编辑状态",
          "en": "Edit state"
        },
        {
          "zh": "审查工具调用",
          "en": "Reviewing tool calls"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "人在两个节点之间查看并修改图里保存的数据（抓到的资料），这就是编辑状态。",
        "en": "The person inspects and changes the data the graph holds (the fetched material) between two nodes – that is editing state."
      }
    },
    {
      "t": "h",
      "zh": "三、一个完整的场景：AI 写稿、自动推送",
      "en": "3. A full scenario: AI writes, the system pushes"
    },
    {
      "t": "p",
      "zh": "[▶ 04:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=34&t=251) 最后老师设想了一个用户量很大的推送系统：AI 自动写内容，再自动推送给所有用户。如果中间没有人工环节，一旦写出来的东西有问题，推出去就**覆水难收**了。合理的设计是：前面的活都交给 AI，在「发布」之前加一个人工审查节点，人点了通过，内容才真正推送到用户那里。\n\n由此可以总结一条放置原则：**把人工环节放在不可撤回、影响面大的动作之前**。只读的、错了可以重来的步骤，一般不需要打断。",
      "en": "[▶ 04:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=34&t=251) Finally the instructor imagines a push system with a huge number of users: AI writes the content and pushes it to everyone automatically. Without a human step, a flawed piece goes out and **can't be taken back**. The sensible design: let AI do all the earlier work, add a human review node right before “publish”, and only push to users once a person clicks approve.\n\nA placement rule follows from this: **put the human step before actions that can't be undone or that affect many people**. Read-only steps, or steps you can simply redo, usually don't need an interruption."
    },
    {
      "t": "code",
      "lang": "text",
      "file": {
        "zh": "推送系统里人工审查的位置",
        "en": "Where the human review goes in the push system"
      },
      "code": {
        "zh": "AI 自动写稿 --> [人工审查] --通过----> 推送给所有用户\n                           --不通过--> 不推送，改好再审",
        "en": "AI writes the content --> [human review] --approve--> push to all users\n                                         --reject---> not pushed; fix it and review again"
      }
    },
    {
      "t": "h",
      "zh": "四、接下来三集：用代码实现",
      "en": "4. The next three episodes: the code"
    },
    {
      "t": "p",
      "zh": "下一集开头，老师会用三个小例子演示代码，正好是接下来的三集：\n\n| 集数 | 做什么 | 会用到 |\n|---|---|---|\n| [34 等待用户输入](#/lesson/l34) | 在两个节点之间停下来等人的反馈；让智能体在缺信息时停下来问人 | `interrupt()`、`Command(resume=...)` |\n| [35 审查工具调用](#/lesson/l35) | 工具执行之前，让人批准、修改参数或写意见 | `interrupt()`、`Command(goto=..., update=...)` |\n| [36 编辑图的状态](#/lesson/l36) | 在断点处停下，直接改掉状态再继续 | `interrupt_before`、`update_state` |",
      "en": "At the start of the next episode the instructor demonstrates the code with three small examples – exactly the next three episodes:\n\n| Lesson | What it does | Uses |\n|---|---|---|\n| [34 Waiting for user input](#/lesson/l34) | Stop between two nodes for a person's feedback; let an agent stop and ask when information is missing | `interrupt()`, `Command(resume=...)` |\n| [35 Reviewing tool calls](#/lesson/l35) | Before a tool runs, a person approves, edits the arguments or writes feedback | `interrupt()`, `Command(goto=..., update=...)` |\n| [36 Editing graph state](#/lesson/l36) | Stop at a breakpoint, change the state directly, then continue | `interrupt_before`, `update_state` |"
    },
    {
      "t": "note",
      "zh": "补充：三集有一个共同前提——图要能**停下来、过一会儿再接着跑**，所以进度必须先存起来。这正是 30–32 集讲的 checkpointer（持久化）和 `thread_id` 的用处：暂停时的状态存在这个 thread 名下，恢复时用同一个 `thread_id` 找回来。",
      "en": "Extra: all three episodes share one requirement – the graph must be able to **stop and carry on later**, so its progress has to be saved first. That is exactly what the checkpointer (persistence) and `thread_id` from lessons 30–32 are for: the paused state is stored under that thread, and resuming with the same `thread_id` picks it up again."
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "老师认为，即使目标是自动化，AI 应用里也要有人工环节。主要原因是？",
        "en": "The instructor argues an AI application needs a human step even when the goal is automation. Why, mainly?"
      },
      "options": [
        {
          "zh": "大模型运行太慢，需要人帮忙加速",
          "en": "Models are slow and need people to speed them up"
        },
        {
          "zh": "大模型按统计概率得出答案，总有出错的可能；在容错低的系统里，一次错误就可能造成严重后果",
          "en": "Models produce answers by statistical probability and can always be wrong; in low-tolerance systems a single error can be serious"
        },
        {
          "zh": "人工审核比模型便宜",
          "en": "Human review is cheaper than the model"
        },
        {
          "zh": "LangGraph 要求每个图都必须有人工节点",
          "en": "LangGraph requires every graph to have a human node"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "基于 Transformer 的模型本质是概率猜测，不可能保证百分之百正确。人工环节是给关键步骤加保险，让系统更稳定。",
        "en": "Transformer-based models are essentially guessing by probability and can't be 100% right. The human step insures the key steps and makes the system more stable."
      }
    },
    {
      "q": {
        "zh": "在「爬虫 → 写作」的例子里，人工环节防止的是什么问题？",
        "en": "In the “crawler → writer” example, what problem does the human step prevent?"
      },
      "options": [
        {
          "zh": "爬虫运行得太慢",
          "en": "The crawler runs too slowly"
        },
        {
          "zh": "写作节点不会写文章",
          "en": "The writer node can't write"
        },
        {
          "zh": "目标网站需要登录",
          "en": "The target site needs a login"
        },
        {
          "zh": "上游抓到了错误的资料，下游节点察觉不到，照样往下写",
          "en": "The upstream node fetched bad material and the downstream node, unaware, writes anyway"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "网站加了反爬虫后，抓回来的内容可能是错的。节点之间没有人看一眼，错误就会一路传到最后的文章里。",
        "en": "After the site adds anti-scraping, the fetched content may be wrong. Without a person looking between the nodes, the error flows all the way into the article."
      }
    },
    {
      "q": {
        "zh": "AI 自动写稿并推送给所有用户。人工审查放在哪里最合适？",
        "en": "AI writes content and pushes it to all users. Where should the human review go?"
      },
      "options": [
        {
          "zh": "AI 写完之后、推送给用户之前",
          "en": "After the AI writes, before pushing to users"
        },
        {
          "zh": "推送给用户之后",
          "en": "After pushing to users"
        },
        {
          "zh": "系统上线前检查一次就够了",
          "en": "One check before the system goes live is enough"
        },
        {
          "zh": "不需要，AI 写的内容不会出错",
          "en": "Nowhere – AI-written content is never wrong"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "推送出去就收不回来，所以要在这个不可撤回的动作之前让人通过。",
        "en": "Once pushed it can't be recalled, so the person must approve before that irreversible action."
      }
    },
    {
      "q": {
        "zh": "下面哪一项**不是**视频里列出的人工介入方式？",
        "en": "Which of these is **not** one of the ways to step in listed in the video?"
      },
      "options": [
        {
          "zh": "批准或拒绝模型的决定",
          "en": "Approving or rejecting the model's decision"
        },
        {
          "zh": "编辑图里保存的状态",
          "en": "Editing the state the graph holds"
        },
        {
          "zh": "由人重新训练模型的参数",
          "en": "Having a person retrain the model's weights"
        },
        {
          "zh": "审查工具调用和它的参数",
          "en": "Reviewing a tool call and its arguments"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "人机交互是在**运行时**让人参与流程：批准、修改状态、审查工具调用、回答问题。重新训练模型不在其中。",
        "en": "Human-in-the-loop brings a person into the flow **at run time**: approving, editing state, reviewing tool calls, answering questions. Retraining the model is not part of it."
      }
    },
    {
      "q": {
        "zh": "智能体做问卷调查：问一题、等人回答、再问下一题。这对应哪种人机交互？",
        "en": "An agent runs a questionnaire: ask, wait for the answer, ask the next. Which kind of human-in-the-loop is this?"
      },
      "options": [
        {
          "zh": "编辑状态",
          "en": "Editing state"
        },
        {
          "zh": "审查工具调用",
          "en": "Reviewing tool calls"
        },
        {
          "zh": "批准或拒绝",
          "en": "Approve or reject"
        },
        {
          "zh": "多轮对话：停下来等人回答本身就是流程的一部分",
          "en": "Multi-turn conversation: stopping to wait for the answer is part of the flow"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "老师把问卷调查当作多轮对话的典型例子。下一集「等待用户输入」里「停下来等人回答」的写法，就是实现这种流程要用的基本功。",
        "en": "The instructor uses the questionnaire as the classic multi-turn example. The “stop and wait for the answer” technique in the next episode, “waiting for user input”, is the building block for this kind of flow."
      }
    }
  ],
  "pitfalls": [
    {
      "zh": "以为「加人工环节 = AI 不行」。其实它只是给关键步骤加保险，前后大部分工作仍然是自动完成的。",
      "en": "Thinking “a human step means the AI is useless”. It only insures the key steps; most of the work before and after is still automatic."
    },
    {
      "zh": "把人工审查放在不可撤回的动作之后（例如已经推送了才审），这时已经来不及了。",
      "en": "Putting the human review after an irreversible action (reviewing after the push) – by then it's too late."
    },
    {
      "zh": "默认上游节点的输出一定正确，结果错误数据一路传到最后（爬虫遇到反爬虫的例子）。",
      "en": "Assuming the upstream node's output is always right, so bad data flows to the end (the anti-scraping crawler example)."
    },
    {
      "zh": "每一步都加人工审核，流程变得很慢。只在容错低、影响大的地方加。",
      "en": "Adding human review to every step, which makes the flow slow. Add it only where errors are costly."
    }
  ],
  "recap": [
    {
      "zh": "大模型按统计概率得出答案，总可能出错；容错低、影响大的系统需要人把关。",
      "en": "Models produce answers by probability and can always be wrong; low-tolerance, high-impact systems need a person to check."
    },
    {
      "zh": "人可以：批准或拒绝、编辑状态、审查工具调用（工具和参数）、在多轮对话里回答问题。",
      "en": "A person can approve or reject, edit state, review tool calls (tool and arguments), and answer questions in a multi-turn conversation."
    },
    {
      "zh": "视频的例子：爬虫和写作之间检查资料；问卷逐题问答；AI 写稿后、推送前由人通过。",
      "en": "The video's examples: check the material between crawler and writer; a question-by-question questionnaire; a person approves AI-written content before it is pushed."
    },
    {
      "zh": "放置原则：把人工环节放在不可撤回、影响面大的动作之前。",
      "en": "Placement rule: put the human step before actions that can't be undone or affect many people."
    },
    {
      "zh": "34、35、36 集分别实现：等待用户输入、审查工具调用、编辑图的状态；它们都依赖 checkpointer 和 `thread_id`。",
      "en": "Lessons 34, 35 and 36 implement waiting for user input, reviewing tool calls and editing graph state; all rely on a checkpointer and a `thread_id`."
    }
  ]
});
