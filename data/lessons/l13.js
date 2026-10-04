COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l13",
  "priority": "overview",
  "handwrite": false,
  "studyMinutes": 30,
  "source": "subtitle",
  "summary": {
    "zh": "一集 7 分钟的概念课，没有代码。用厨房分工引出**多智能体协作**：不同的智能体干不同的事。协作的逻辑由四块组成——Profile（用 prompt 定义角色）、Memory（长短期记忆和**共享记忆**）、Planning（拆解任务、决定何时停止）、Action（分派给智能体和工具执行），结果写回记忆，再交给规划，循环到完成。后半段用多智能体改造 RAG：从「只能挂一个知识库」到「检索智能体选库」，再到「主智能体 + 三个子智能体」。讲义配了一个可直接运行的协作循环模拟，Python 小课堂讲「对象的列表」。",
    "en": "A 7-minute concept episode with no code. A kitchen where everyone has their own job introduces **multi-agent collaboration**: different agents do different work. The collaboration logic has four parts – Profile (a role defined by the prompt), Memory (short- and long-term plus **shared memory**), Planning (break the task down and decide when to stop) and Action (hand the work to agents and tools); results go back into memory and on to planning, looping until done. The second half upgrades RAG with agents: from “one knowledge base only” to “a retrieval agent picks the base”, to “a main agent plus three sub-agents”. The notes add a runnable simulation of the loop; the Python mini-lesson covers lists of objects."
  },
  "goals": [
    {
      "zh": "用厨房的比方说明为什么要多智能体协作：分工让每个智能体更专注",
      "en": "Use the kitchen analogy to explain why agents should collaborate: division of labour keeps each one focused"
    },
    {
      "zh": "说出协作逻辑的四块：Profile、Memory（含共享记忆）、Planning、Action，以及它们怎样循环、由谁决定停止",
      "en": "Name the four parts of the collaboration logic – Profile, Memory (including shared memory), Planning, Action – how they loop, and who decides when to stop"
    },
    {
      "zh": "说出多智能体的好处：更专注；不同智能体可以挂不同的工具、知识库和模型",
      "en": "List the benefits: more focus; each agent can have its own tools, knowledge bases and model"
    },
    {
      "zh": "说清普通 RAG 挂多个知识库时的问题，以及「检索智能体」和「主智能体 + 子智能体」怎样解决",
      "en": "Explain the problem of a plain RAG with several knowledge bases, and how a retrieval agent and then a main agent with sub-agents solve it"
    },
    {
      "zh": "会用「对象的列表」：遍历读属性、列表推导式收集属性、按条件查找",
      "en": "Work with lists of objects: loop and read attributes, collect attributes with list comprehensions, find by condition"
    }
  ],
  "blocks": [
    {
      "t": "video",
      "zh": "这一集是一段 7 分钟的直播课片段（中间还回答了弹幕提问），只讲概念、没有代码：先用厨房分工引出多智能体协作，讲协作的逻辑和好处，再用多智能体来改进 RAG。讲义在概念之外补了两样东西：一个能在网页里直接运行的协作循环模拟，以及一个把视频里那张「多智能体 RAG」图写成代码的选做练习。",
      "en": "This 7-minute episode is a clip from a live class (with a few viewer questions answered along the way). It is concepts only, no code: a kitchen with a division of labour introduces multi-agent collaboration, then come its logic and benefits, and finally agents are used to improve RAG. Beyond the concepts, the notes add a simulation of the collaboration loop that runs right in the page, and an optional exercise that turns the video's multi-agent RAG diagram into code."
    },
    {
      "t": "h",
      "zh": "一、厨房里的分工：不同的人干不同的事",
      "en": "1. The kitchen: different people, different jobs"
    },
    {
      "t": "p",
      "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=14&t=0) 老师先放了一张厨房的图：有人切菜、有人炒菜、有人洗碗，每个人干的活都不一样。现实里完成一件事，也不会一个人包揽所有环节——这就是**多智能体协作**：不同的智能体干不同的事情。\n\n[▶ 00:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=14&t=30) 好处是什么？一个厨师又切又洗又炒，效率低、不专注，手艺也难提高；只负责炒菜的厨师进步更快、菜也更好吃。智能体也一样，分工以后每个智能体都**更专注**。",
      "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=14&t=0) The instructor opens with a picture of a kitchen: one person chops, one cooks, one washes up – everybody does something different. In real life nobody does every part of a job alone either, and that is **multi-agent collaboration**: different agents do different jobs.\n\n[▶ 00:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=14&t=30) Why bother? A cook who chops, washes and cooks is slow and unfocused and improves slowly; one who only cooks gets better faster and the food tastes better. Agents are the same: with a division of labour, each one is **more focused**."
    },
    {
      "t": "h",
      "zh": "二、协作的逻辑：Profile、Memory、Planning、Action",
      "en": "2. The collaboration logic: Profile, Memory, Planning, Action"
    },
    {
      "t": "p",
      "zh": "[▶ 00:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=14&t=30) 视频里的协作图由四块组成：\n\n| 部分 | 负责什么 | 视频里的说法 |\n|---|---|---|\n| Profile（角色） | 定义这个智能体是谁、能做什么、边界在哪 | 用 **prompt** 来定义——老师说 prompt 又出现了，它很重要 |\n| Memory（记忆） | 短期记忆、长期记忆，以及**记忆共享** | 共享记忆就像团队定期开的项目进度同步会，大家都看得到当前进度 |\n| Planning（规划） | 拿到大任务后拆解：第一步、第二步、第三步…… | 还要判断任务什么时候算完成、什么时候停止 |\n| Action（行动） | 把拆好的任务分派给智能体，决定它们用什么工具，然后执行 | 执行结果放回 Memory |\n\n[▶ 01:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=14&t=94) 它们怎样转起来：Planning 拆任务 → Action 分派执行 → 结果写进 Memory → 再交给 Planning 判断「到目前为止行不行」。不行就继续规划、再行动，**循环下去，直到 Planning 认为任务完成**。[▶ 02:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=14&t=124) 所以 Planning 除了规划，还负责决定什么时候停。",
      "en": "[▶ 00:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=14&t=30) The collaboration diagram in the video has four parts:\n\n| Part | Job | How the video puts it |\n|---|---|---|\n| Profile | defines who the agent is, what it can do and where its limits are | defined by the **prompt** – “the prompt shows up again”, the instructor says; it matters |\n| Memory | short-term and long-term memory, plus **shared memory** | shared memory is like a team's regular progress meeting: everyone can see where things stand |\n| Planning | breaks a big task down: step one, step two, step three… | also judges when the task is finished and when to stop |\n| Action | hands the steps to agents, decides which tools they use, and executes | the results go back into Memory |\n\n[▶ 01:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=14&t=94) How it turns: Planning breaks the task down → Action dispatches and executes → the results are written to Memory → Planning checks “is this good enough so far?”. If not, it plans again and acts again, **looping until Planning decides the task is done**. [▶ 02:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=14&t=124) So besides planning, Planning also decides when to stop."
    },
    {
      "t": "py",
      "title": {
        "zh": "对象的列表：遍历、收集属性、按条件查找",
        "en": "Lists of objects: loop, collect attributes, find by condition"
      },
      "zh": "多智能体系统里到处是「装着对象的列表」：一队智能体、一串运行步骤、一组检索结果。处理它们常用的就三招：\n- `for a in team:` 逐个取出，用 `a.name` 读属性（类和对象见第 08 节）\n- `[a.name for a in team]`：列表推导式（第 06 节），把每个对象的某个属性收集成新列表；后面加 `if 条件` 就只留下满足条件的。条件里常用 `元素 in 列表`：列表里有这个元素就是 True（`in` 的更多用法在第 18 节）\n- 遍历时用 `if` 找到想要的对象就 `return`；循环结束还没找到，就返回 `None`\n\n下面用一个简单的类表示每个智能体的 Profile：除了角色，还记下它能用的工具、挂的知识库和用的模型——正好对应视频说的「不同的智能体可以挂不同的工具、知识库和模型」。",
      "en": "Multi-agent systems are full of “lists of objects”: a team of agents, a series of run steps, a set of search results. Three moves cover most of what you'll do with them:\n- `for a in team:` take them out one by one and read attributes like `a.name` (classes and objects: lesson 08)\n- `[a.name for a in team]`: a list comprehension (lesson 06) that collects one attribute of every object into a new list; add `if condition` at the end to keep only the ones that meet it. A common condition is `element in list`, which is True when the list contains that element (more on `in` in lesson 18)\n- inside a loop, `return` the object as soon as `if` finds it; if the loop ends without a match, return `None`\n\nBelow, a small class represents each agent's Profile: besides its role it records its tools, its knowledge base and its model – matching the video's point that different agents can have different tools, knowledge bases and models.",
      "code": {
        "zh": "class AgentProfile:\n    def __init__(self, name, role, tools, knowledge, model):\n        self.name = name              # 名字\n        self.role = role              # 负责什么（真实系统里写在 prompt 里）\n        self.tools = tools            # 能用的工具：一个列表\n        self.knowledge = knowledge    # 挂的知识库\n        self.model = model            # 用哪个模型\n\nteam = [\n    AgentProfile(\"kb_agent\", \"在知识库里检索\", [\"search_kb\"], \"财务库、法务库\", \"deepseek-flash\"),\n    AgentProfile(\"web_agent\", \"联网搜索\", [\"web_search\"], \"无\", \"deepseek-flash\"),\n    AgentProfile(\"writer\", \"整理成报告\", [], \"写作规范\", \"deepseek-v4-pro\"),\n]\n\n# 1. 逐个取出，读属性\nfor a in team:\n    print(f\"{a.name}：{a.role}，工具 {len(a.tools)} 个，模型 {a.model}\")\n\n# 2. 列表推导式：把每个对象的某个属性收集成新列表\nprint([a.name for a in team])\n\n# 3. 带 if 的列表推导式：只挑出会用 web_search 的（in 判断列表里有没有这个元素）\nprint([a.name for a in team if \"web_search\" in a.tools])\n\n# 4. 按名字查找：找到就 return，循环结束还没找到就返回 None\ndef find(team, name):\n    for a in team:\n        if a.name == name:\n            return a\n    return None\n\nprint(find(team, \"writer\").model)\nprint(find(team, \"boss\"))",
        "en": "class AgentProfile:\n    def __init__(self, name, role, tools, knowledge, model):\n        self.name = name              # its name\n        self.role = role              # what it does (in a real system: written in its prompt)\n        self.tools = tools            # the tools it may use: a list\n        self.knowledge = knowledge    # the knowledge base attached to it\n        self.model = model            # which model it runs on\n\nteam = [\n    AgentProfile(\"kb_agent\", \"search the knowledge bases\", [\"search_kb\"], \"finance, legal\", \"deepseek-flash\"),\n    AgentProfile(\"web_agent\", \"search the web\", [\"web_search\"], \"none\", \"deepseek-flash\"),\n    AgentProfile(\"writer\", \"write the report\", [], \"style guide\", \"deepseek-v4-pro\"),\n]\n\n# 1. take them out one by one and read attributes\nfor a in team:\n    print(f\"{a.name}: {a.role}, {len(a.tools)} tool(s), model {a.model}\")\n\n# 2. list comprehension: collect one attribute of every object into a new list\nprint([a.name for a in team])\n\n# 3. a list comprehension with if: keep only those that can use web_search\n#    (in checks whether the list contains that element)\nprint([a.name for a in team if \"web_search\" in a.tools])\n\n# 4. find by name: return as soon as it's found; after the loop, return None\ndef find(team, name):\n    for a in team:\n        if a.name == name:\n            return a\n    return None\n\nprint(find(team, \"writer\").model)\nprint(find(team, \"boss\"))"
      }
    },
    {
      "t": "p",
      "zh": "再把四块连起来。下面用纯 Python 模拟一次协作：三个智能体（查资料、写报告、检查质量）共用一个 `memory` 列表当共享记忆；`planning` 每次读共享记忆决定下一步交给谁，`action` 用一句话代替真正的工作。第一次检查故意不通过，你会看到 Planning 让写手回去重写，检查通过后才停止。直接点运行：",
      "en": "Now connect the four parts. The pure-Python simulation below has three agents (research, write, check) sharing one `memory` list as their shared memory; `planning` reads it each time to decide who goes next, and `action` stands in for the real work with one sentence. The first check fails on purpose, so you'll see Planning send the writer back, and the loop stops only after the check passes. Just press run:"
    },
    {
      "t": "code",
      "file": "collab_loop.py",
      "run": true,
      "code": {
        "zh": "team = {\"researcher\": \"查资料\", \"writer\": \"写报告\", \"checker\": \"检查质量\"}   # Profile：谁负责什么\nmemory = []      # 共享记忆：每一步的结果都记在这里，所有智能体都能看到\n\ndef planning(memory):\n    \"\"\"规划：看共享记忆，决定下一步交给谁；返回 None 表示任务完成\"\"\"\n    done = [m[\"who\"] for m in memory]\n    if \"researcher\" not in done:\n        return \"researcher\"\n    if \"writer\" not in done:\n        return \"writer\"\n    last = memory[-1]\n    if last[\"who\"] == \"writer\":\n        return \"checker\"\n    if last[\"result\"] == \"不合格\":\n        return \"writer\"              # 检查没通过：回去重写\n    return None                      # 检查通过：结束\n\ndef action(who, memory):\n    \"\"\"行动：用一句话代替真正的工作（真实系统里是调用模型和工具）\"\"\"\n    if who == \"checker\":\n        checked_before = [m for m in memory if m[\"who\"] == \"checker\"]\n        if not checked_before:\n            return \"不合格\"           # 故意让第一次检查不通过\n        return \"合格\"\n    return f\"完成了「{team[who]}」\"\n\nfor step in range(1, 11):            # 最多 10 步，防止停不下来\n    who = planning(memory)\n    if who is None:\n        print(\"规划：任务完成，停止\")\n        break\n    result = action(who, memory)\n    memory.append({\"who\": who, \"result\": result})     # 结果写回共享记忆\n    print(f\"第 {step} 步：{who} → {result}\")",
        "en": "team = {\"researcher\": \"research\", \"writer\": \"write the report\", \"checker\": \"check quality\"}   # Profile: who does what\nmemory = []      # shared memory: every result is recorded here, visible to every agent\n\ndef planning(memory):\n    \"\"\"Planning: read the shared memory and decide who goes next; None means the task is done\"\"\"\n    done = [m[\"who\"] for m in memory]\n    if \"researcher\" not in done:\n        return \"researcher\"\n    if \"writer\" not in done:\n        return \"writer\"\n    last = memory[-1]\n    if last[\"who\"] == \"writer\":\n        return \"checker\"\n    if last[\"result\"] == \"failed\":\n        return \"writer\"              # the check failed: rewrite\n    return None                      # the check passed: finish\n\ndef action(who, memory):\n    \"\"\"Action: one sentence stands in for the real work (a real system calls models and tools)\"\"\"\n    if who == \"checker\":\n        checked_before = [m for m in memory if m[\"who\"] == \"checker\"]\n        if not checked_before:\n            return \"failed\"          # the first check fails on purpose\n        return \"passed\"\n    return f\"did: {team[who]}\"\n\nfor step in range(1, 11):            # at most 10 steps, so it always stops\n    who = planning(memory)\n    if who is None:\n        print(\"planning: task complete, stopping\")\n        break\n    result = action(who, memory)\n    memory.append({\"who\": who, \"result\": result})     # write the result back to shared memory\n    print(f\"step {step}: {who} -> {result}\")"
      },
      "note": {
        "zh": "对照四块来看：`team` 是 Profile，`memory` 是共享记忆，`planning` 是规划（包括返回 `None` 表示停止），`action` 是行动。`range(1, 11)` 限制最多 10 步，和第 12 节调度循环的 `max_rounds` 是同一个道理：Planning 出了问题，程序也一定会停。",
        "en": "Map it onto the four parts: `team` is the Profile, `memory` the shared memory, `planning` the planning (returning `None` means stop) and `action` the action. `range(1, 11)` caps it at 10 steps – the same idea as `max_rounds` in lesson 12's planner loop: even if Planning goes wrong, the program stops."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "在视频的协作逻辑里，谁决定任务什么时候结束？",
        "en": "In the video's collaboration logic, who decides when the task ends?"
      },
      "options": [
        {
          "zh": "Action：执行完最后一个工具就结束",
          "en": "Action: it ends after the last tool runs"
        },
        {
          "zh": "Memory：记满了就结束",
          "en": "Memory: it ends when memory is full"
        },
        {
          "zh": "Planning：看了执行结果，判断任务已经完成",
          "en": "Planning: after looking at the results, it judges the task complete"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "执行结果写进 Memory 后交给 Planning，由它判断要继续规划、行动，还是可以停止。",
        "en": "Results go into Memory and on to Planning, which decides whether to plan and act again or to stop."
      }
    },
    {
      "t": "h",
      "zh": "三、多智能体的好处",
      "en": "3. Why multiple agents"
    },
    {
      "t": "p",
      "zh": "[▶ 02:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=14&t=124) 老师总结了几点：\n1. **更专注、效率更高**：就像厨房分工。\n2. **各挂各的工具和知识库**：不同的智能体可以挂不同的工具，也可以挂不同的知识库。\n3. [▶ 02:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=14&t=155) **各用各的模型**：不同的设备上跑的模型参数、规格不一样，每个智能体用合适的模型，成本控制和资源利用都会更好。\n\n他的看法是：真正落地到商业里的场景，几乎都要靠多个智能体分工协作。",
      "en": "[▶ 02:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=14&t=124) The instructor sums up a few points:\n1. **More focus and efficiency** – like the kitchen.\n2. **Each agent gets its own tools and knowledge bases**: different agents can have different tools and different knowledge bases attached.\n3. [▶ 02:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=14&t=155) **Each agent gets its own model**: devices run models of different sizes and specs, so giving every agent a suitable model is better for cost and for resource use.\n\nHis view: real-world commercial deployments almost all depend on several agents dividing up the work."
    },
    {
      "t": "note",
      "zh": "[▶ 02:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=14&t=170) 课上有同学问老师会不会带大家设计一个，老师说有，稍后就给大家看——就是第 14 节的销售例子。还有同学问要不要 GPU。老师的回答是：调用线上的模型就可以；在本地部署的话，一般的显卡（比如 4090）只能跑量化过的模型，跑不动完整的大模型。他顺便聊了几句英伟达当年推出的桌面级 AI 电脑，觉得本地跑大模型的成本在快速下降。本课程全程调用线上的 DeepSeek，不需要 GPU。",
      "en": "[▶ 02:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=14&t=170) A student asks whether the class will design one together; the instructor says yes and promises to show one shortly – that is the sales example in lesson 14. Another asks whether a GPU is needed. The instructor says online models are fine; for local deployment, an ordinary graphics card (such as a 4090) can only run quantised models, not full-size ones. He also chats briefly about the desktop AI computer NVIDIA launched back then and feels the cost of running big models locally is falling fast. This course calls DeepSeek online throughout – no GPU needed."
    },
    {
      "t": "h",
      "zh": "四、用多智能体改进 RAG",
      "en": "4. Improving RAG with agents"
    },
    {
      "t": "p",
      "zh": "[▶ 04:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=14&t=248) 接着老师拿出一张熟悉的结构图：用户提问 → 到知识库（向量数据库）里检索 → 把检索到的内容和问题一起交给大模型回答，这就是 RAG。它有一个很大的局限：**只能挂一个知识库**。[▶ 04:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=14&t=279) 挂多个也可以，但每次检索都会把所有知识库查一遍——你问的是法律问题，财务资料也一起被检索出来，显然不合适。\n\n**第一步改进：加一个检索智能体。** 它先接收问题，再判断：这个问题该去知识库里查，还是联网查？要查的话，查 A 库还是 B 库？[▶ 05:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=14&t=310) 比如发现知识库里没有，就分配给联网搜索的工具去查。这样就能挂多个知识库，也不再局限于一个向量数据库，可以从更多来源取数据。",
      "en": "[▶ 04:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=14&t=248) Next the instructor shows a familiar diagram: the user asks → the knowledge base (a vector database) is searched → the results and the question go to the LLM, which answers. That is RAG, and it has a big limitation: **only one knowledge base**. [▶ 04:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=14&t=279) You can attach several, but every search then goes through all of them – ask a legal question and the finance documents come back too, which is clearly wrong.\n\n**First improvement: add a retrieval agent.** It receives the question first and then decides: should it be looked up in a knowledge base or on the web? If in a knowledge base, which one – A or B? [▶ 05:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=14&t=310) If, say, the answer isn't in any knowledge base, it hands the question to a web-search tool. Now you can attach several knowledge bases and pull data from more sources than one vector database."
    },
    {
      "t": "p",
      "zh": "[▶ 05:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=14&t=343) **第二步改进：拆成多个智能体。** 只有一个检索智能体，效率还是不高。于是再拆一层：\n\n| 角色 | 负责 |\n|---|---|\n| 主智能体 | 和用户交互、和模型交互，判断问题该交给谁 |\n| 智能体 A | 在知识库里检索（知识库 A、知识库 B） |\n| 智能体 B | 联网检索 |\n| 智能体 C | 处理应用程序里的数据，比如邮件 |\n\n[▶ 06:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=14&t=373) 举个例子：用户问了一个财务问题，主智能体发现要查知识库，就交给智能体 A；A 判断是财务知识，就去知识库 A 里检索。返回之前还会检查一下质量，不达标就回去重新检索。[▶ 06:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=14&t=404) 如果用户要处理邮件里的事，就交给智能体 C，它打开邮件、处理好数据再返回，最后由模型给出回复。[▶ 07:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=14&t=435) 结论：把多个智能体接进 RAG，信息检索会更高效、更准确。",
      "en": "[▶ 05:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=14&t=343) **Second improvement: split into several agents.** A single retrieval agent is still not very efficient, so split once more:\n\n| Role | Job |\n|---|---|\n| Main agent | talks to the user and the model, decides who should handle the question |\n| Agent A | searches the knowledge bases (KB A, KB B) |\n| Agent B | searches the web |\n| Agent C | handles application data, e.g. email |\n\n[▶ 06:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=14&t=373) For example: the user asks a finance question; the main agent sees it needs the knowledge base and passes it to agent A; A recognises finance and searches KB A. Before returning, it checks the quality of what it found and searches again if it isn't good enough. [▶ 06:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=14&t=404) If the user wants something done with their email, the question goes to agent C, which opens the mail, processes it and returns the data; finally the model replies. [▶ 07:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=14&t=435) The takeaway: wiring several agents into RAG makes retrieval more efficient and more accurate."
    },
    {
      "t": "check",
      "q": {
        "zh": "普通 RAG 同时挂了财务和法务两个知识库，问一个法务问题时会出现什么问题？",
        "en": "A plain RAG has both a finance and a legal knowledge base attached. What goes wrong with a legal question?"
      },
      "options": [
        {
          "zh": "什么都查不到",
          "en": "Nothing is found"
        },
        {
          "zh": "两个知识库都会被检索，财务资料也混进结果里",
          "en": "Both knowledge bases are searched, so finance material gets mixed into the results"
        },
        {
          "zh": "模型会拒绝回答",
          "en": "The model refuses to answer"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "普通 RAG 不会先判断问题属于哪个领域，每次都把所有知识库检索一遍。检索智能体的作用就是先判断该查哪里。",
        "en": "A plain RAG doesn't first decide which domain a question belongs to, so it searches every knowledge base each time. The retrieval agent's job is to decide where to search first."
      }
    },
    {
      "t": "h",
      "zh": "五、选做练习：把这张图写成代码",
      "en": "5. Optional exercise: turn the diagram into code"
    },
    {
      "t": "p",
      "zh": "视频这一集没有代码。学完第 12 节以后，你已经能把上面的「主智能体 + 三个子智能体」写出来了：子智能体干完活，结果要**回到主智能体手里**，再由主智能体回复用户，所以用的是第 12 节的 `as_tool`，而不是交接。`practice/l13_rag_team_solution.py` 里：\n- 智能体 A 挂两个工具，分别查财务知识库和法务知识库（两个小文本文件，内容是虚构的公司制度），查不到就换关键词再查；\n- 智能体 B 的「联网」只演示查天气（Open-Meteo）；\n- 智能体 C 读取一个虚构的收件箱 `data/l13_inbox.json`。",
      "en": "The episode has no code. After lesson 12 you can already write the main agent with three sub-agents: each sub-agent's result has to **come back to the main agent**, which then replies to the user – so this uses `as_tool` from lesson 12, not handoffs. In `practice/l13_rag_team_solution.py`:\n- agent A has two tools, one for the finance knowledge base and one for the legal one (two small text files of made-up company rules), and tries another keyword if nothing is found;\n- agent B's “online” lookup only demonstrates the weather (Open-Meteo);\n- agent C reads a made-up inbox, `data/l13_inbox.json`."
    },
    {
      "t": "code",
      "file": "l13_rag_team_solution.py",
      "code": {
        "zh": "# 省略了 import、model，以及 search_finance_kb 等工具函数（见完整文件）\nkb_agent = Agent(name=\"kb_agent\", model=model, tools=[search_finance_kb, search_law_kb],\n                 instructions=\"你负责在公司知识库里检索。先判断问题属于财务还是法务，只查对应的知识库。\"\n                              \"查到的内容不够就换一个关键词再查。只根据查到的内容回答。\")\nweb_agent = Agent(name=\"web_agent\", model=model, tools=[get_temperature],\n                  instructions=\"你负责联网查询实时信息（目前只能查天气）。\")\nmail_agent = Agent(name=\"mail_agent\", model=model, tools=[read_inbox],\n                   instructions=\"你负责处理邮件：先调用 read_inbox 读取邮件，再按要求整理。\")\n\nmain_agent = Agent(\n    name=\"main_agent\",\n    model=model,\n    instructions=\"你是公司的智能助手。制度类问题问 ask_knowledge_base，实时信息问 ask_web，\"\n                 \"邮件相关的问 ask_mailbox。拿到结果后用简洁的中文回答用户。\",\n    tools=[\n        kb_agent.as_tool(tool_name=\"ask_knowledge_base\", tool_description=\"在财务和法务知识库里查找制度规定\"),\n        web_agent.as_tool(tool_name=\"ask_web\", tool_description=\"联网查询实时信息（目前只支持天气）\"),\n        mail_agent.as_tool(tool_name=\"ask_mailbox\", tool_description=\"读取并整理用户的邮件\"),\n    ],\n)",
        "en": "# imports, the model and the tool functions such as search_finance_kb are omitted (see the full file)\nkb_agent = Agent(name=\"kb_agent\", model=model, tools=[search_finance_kb, search_law_kb],\n                 instructions=\"You search the company knowledge bases. First decide whether the question is about finance or legal matters, and search only that knowledge base. \"\n                              \"If what you find isn't enough, try another keyword. Answer only from what you found.\")\nweb_agent = Agent(name=\"web_agent\", model=model, tools=[get_temperature],\n                  instructions=\"You look up live information online (for now, only the weather).\")\nmail_agent = Agent(name=\"mail_agent\", model=model, tools=[read_inbox],\n                   instructions=\"You handle email: call read_inbox first, then sort the mail as asked.\")\n\nmain_agent = Agent(\n    name=\"main_agent\",\n    model=model,\n    instructions=\"You are the company assistant. Ask ask_knowledge_base about company rules, ask_web for live information \"\n                 \"and ask_mailbox about email. Once you have the results, answer the user briefly.\",\n    tools=[\n        kb_agent.as_tool(tool_name=\"ask_knowledge_base\", tool_description=\"Look up rules in the finance and legal knowledge bases\"),\n        web_agent.as_tool(tool_name=\"ask_web\", tool_description=\"Look up live information online (weather only for now)\"),\n        mail_agent.as_tool(tool_name=\"ask_mailbox\", tool_description=\"Read and sort the user's email\"),\n    ],\n)"
      }
    },
    {
      "t": "tip",
      "zh": "运行：在 `practice` 里执行 `& ..\\.venv\\Scripts\\python.exe l13_rag_team_solution.py`。每个问题大约调用模型 4 到 6 次（主智能体、子智能体和它们的工具调用都算）。程序会打印主智能体找了哪些帮手，可以试着换几个问题，看它会不会选错。",
      "en": "Run it from `practice` with `& ..\\.venv\\Scripts\\python.exe l13_rag_team_solution.py`. Each question costs about 4 to 6 model calls (the main agent, the sub-agents and their tool calls all count). The program prints which helpers the main agent asked; try a few other questions and see whether it ever picks the wrong one."
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "视频说智能体的 Profile（角色）是用什么定义的？",
        "en": "According to the video, what defines an agent's Profile?"
      },
      "options": [
        {
          "zh": "模型的参数量",
          "en": "The model's parameter count"
        },
        {
          "zh": "prompt（提示词）：写清楚它的角色、能力和边界",
          "en": "The prompt: it spells out the role, the abilities and the limits"
        },
        {
          "zh": "向量数据库",
          "en": "A vector database"
        },
        {
          "zh": "工具的数量",
          "en": "The number of tools"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "老师特别强调：角色、能力和边界都靠 prompt 来定义，所以 prompt 非常重要。",
        "en": "The instructor stresses that role, abilities and limits are all defined by the prompt – which is why prompts matter so much."
      }
    },
    {
      "q": {
        "zh": "老师用什么来比喻「记忆共享」？",
        "en": "What does the instructor compare shared memory to?"
      },
      "options": [
        {
          "zh": "团队定期开的项目进度同步会",
          "en": "A team's regular project progress meeting"
        },
        {
          "zh": "厨房里的冰箱",
          "en": "The fridge in a kitchen"
        },
        {
          "zh": "每个人自己的笔记本",
          "en": "Everyone's private notebook"
        },
        {
          "zh": "公司的保险柜",
          "en": "The company safe"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "共享记忆就像进度同步会：每个人都能看到当前做到哪一步，后面的工作才接得上。",
        "en": "Shared memory is like a progress meeting: everyone can see how far things have got, so the next piece of work can pick up from there."
      }
    },
    {
      "q": {
        "zh": "协作循环 Planning → Action → Memory → Planning……什么时候停下来？",
        "en": "When does the loop Planning → Action → Memory → Planning… stop?"
      },
      "options": [
        {
          "zh": "固定执行 4 次",
          "en": "After exactly 4 rounds"
        },
        {
          "zh": "所有工具都调用过一遍",
          "en": "When every tool has been called once"
        },
        {
          "zh": "Memory 里的内容超过一定长度",
          "en": "When Memory holds more than a certain amount"
        },
        {
          "zh": "Planning 判断任务已经完成",
          "en": "When Planning judges the task complete"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "Planning 除了拆任务，还负责判断什么时候停止。写代码时最好再加一个最大次数，防止它一直判断「还没完成」。",
        "en": "Besides breaking the task down, Planning decides when to stop. In code, add a maximum count too, in case it keeps judging “not finished yet”."
      }
    },
    {
      "q": {
        "zh": "下面哪一条**不是**视频里说的多智能体的好处？",
        "en": "Which of these is **not** a benefit the video mentions?"
      },
      "options": [
        {
          "zh": "每个智能体更专注，效率更高",
          "en": "Each agent is more focused and efficient"
        },
        {
          "zh": "不同的智能体可以挂不同的知识库和工具",
          "en": "Different agents can have different knowledge bases and tools"
        },
        {
          "zh": "不需要再写任何 prompt",
          "en": "No prompts need to be written any more"
        },
        {
          "zh": "不同的智能体可以用不同的模型，便于控制成本",
          "en": "Different agents can use different models, which helps control cost"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "恰恰相反：每个智能体的角色都要用 prompt 来定义，prompt 更重要了。",
        "en": "Quite the opposite: every agent's role is defined by a prompt, so prompts matter even more."
      }
    },
    {
      "q": {
        "zh": "在「主智能体 + 三个子智能体」的 RAG 里，用户问「我的邮件里有什么要回复的」，应该交给谁？",
        "en": "In the main-agent-plus-three-sub-agents RAG, the user asks “which of my emails need a reply?”. Who should get it?"
      },
      "options": [
        {
          "zh": "智能体 A：知识库检索",
          "en": "Agent A: knowledge-base search"
        },
        {
          "zh": "智能体 B：联网检索",
          "en": "Agent B: web search"
        },
        {
          "zh": "直接交给向量数据库",
          "en": "Straight to the vector database"
        },
        {
          "zh": "智能体 C：处理应用程序数据（邮件）",
          "en": "Agent C: application data (email)"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "邮件属于应用程序里的数据，视频里正是用这个例子说明智能体 C 的作用。",
        "en": "Email is application data – the video uses exactly this example to show what agent C is for."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "协作循环",
        "en": "The collaboration loop"
      },
      "code": {
        "zh": "memory = []                              # 共享记忆\n\nfor step in [[range]](1, 11):            # 最多 10 步\n    who = planning(memory)               # 规划：下一步交给谁\n    if who is [[None]]:                    # 规划说任务完成了\n        [[break]]\n    result = action(who, memory)         # 行动\n    memory.[[append]]({\"who\": who, \"result\": result})   # 结果写回共享记忆",
        "en": "memory = []                              # shared memory\n\nfor step in [[range]](1, 11):            # at most 10 steps\n    who = planning(memory)               # planning: who goes next\n    if who is [[None]]:                    # planning says the task is done\n        [[break]]\n    result = action(who, memory)         # action\n    memory.[[append]]({\"who\": who, \"result\": result})   # write the result to shared memory"
      },
      "explain": {
        "zh": "`range(1, 11)` 给出 1 到 10；规划返回 `None` 表示完成，用 `break` 跳出循环；每一步的结果用 `append` 加进共享记忆。",
        "en": "`range(1, 11)` gives 1 to 10; planning returns `None` when done, so `break` leaves the loop; each result is added to shared memory with `append`."
      }
    },
    {
      "title": {
        "zh": "主智能体 + 子智能体",
        "en": "Main agent + sub-agents"
      },
      "code": {
        "zh": "main_agent = Agent(\n    name=\"main_agent\",\n    model=model,\n    instructions=\"制度类问题问 ask_knowledge_base，邮件相关的问 ask_mailbox。\",\n    [[tools]]=[\n        kb_agent.[[as_tool]](tool_name=\"ask_knowledge_base\", [[tool_description]]=\"在知识库里查找制度规定\"),\n        mail_agent.as_tool(tool_name=\"ask_mailbox\", tool_description=\"读取并整理用户的邮件\"),\n    ],\n)",
        "en": "main_agent = Agent(\n    name=\"main_agent\",\n    model=model,\n    instructions=\"Ask ask_knowledge_base about company rules and ask_mailbox about email.\",\n    [[tools]]=[\n        kb_agent.[[as_tool]](tool_name=\"ask_knowledge_base\", [[tool_description]]=\"Look up rules in the knowledge bases\"),\n        mail_agent.as_tool(tool_name=\"ask_mailbox\", tool_description=\"Read and sort the user's email\"),\n    ],\n)"
      },
      "explain": {
        "zh": "子智能体用 `as_tool` 包装成工具，放进主智能体的 `tools`；`tool_description` 告诉主智能体什么时候该用它。",
        "en": "Sub-agents are wrapped with `as_tool` and put in the main agent's `tools`; `tool_description` tells the main agent when to use each one."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：处理一队智能体的 Profile",
        "en": "Write it: work with a team of agent profiles"
      },
      "run": true,
      "task": {
        "zh": "starter 里已经有 `AgentProfile` 类和 `team` 列表。不看上面的代码，写出：\n1. 用列表推导式得到所有智能体的名字 `names`，打印出来\n2. 函数 `find_by_tool(team, tool)`：返回会用这个工具的智能体名字列表（带 if 的列表推导式）\n3. 函数 `find(team, name)`：按名字找到并返回对象，找不到返回 `None`\n\n可以直接点运行。",
        "en": "The starter already has the `AgentProfile` class and the `team` list. Without looking above, write:\n1. a list comprehension that collects every agent's name into `names`, and print it\n2. a function `find_by_tool(team, tool)` that returns the names of the agents that can use that tool (a list comprehension with if)\n3. a function `find(team, name)` that returns the object with that name, or `None`\n\nYou can run it right here."
      },
      "starter": {
        "zh": "class AgentProfile:\n    def __init__(self, name, tools, model):\n        self.name = name\n        self.tools = tools\n        self.model = model\n\nteam = [\n    AgentProfile(\"kb_agent\", [\"search_finance_kb\", \"search_law_kb\"], \"deepseek-flash\"),\n    AgentProfile(\"web_agent\", [\"web_search\"], \"deepseek-flash\"),\n    AgentProfile(\"mail_agent\", [\"read_inbox\"], \"deepseek-v4-pro\"),\n]\n\n# 1. 用列表推导式得到所有名字，打印\n\n\n# 2. find_by_tool(team, tool)：返回会用这个工具的智能体名字列表\n\n\n# 3. find(team, name)：找到就返回对象，找不到返回 None\n\n\nprint(find_by_tool(team, \"web_search\"))\nprint(find(team, \"mail_agent\").model)\nprint(find(team, \"boss\"))\n",
        "en": "class AgentProfile:\n    def __init__(self, name, tools, model):\n        self.name = name\n        self.tools = tools\n        self.model = model\n\nteam = [\n    AgentProfile(\"kb_agent\", [\"search_finance_kb\", \"search_law_kb\"], \"deepseek-flash\"),\n    AgentProfile(\"web_agent\", [\"web_search\"], \"deepseek-flash\"),\n    AgentProfile(\"mail_agent\", [\"read_inbox\"], \"deepseek-v4-pro\"),\n]\n\n# 1. collect every name with a list comprehension and print it\n\n\n# 2. find_by_tool(team, tool): return the names of the agents that can use that tool\n\n\n# 3. find(team, name): return the object, or None if there is none\n\n\nprint(find_by_tool(team, \"web_search\"))\nprint(find(team, \"mail_agent\").model)\nprint(find(team, \"boss\"))\n"
      },
      "solution": {
        "zh": "class AgentProfile:\n    def __init__(self, name, tools, model):\n        self.name = name\n        self.tools = tools\n        self.model = model\n\nteam = [\n    AgentProfile(\"kb_agent\", [\"search_finance_kb\", \"search_law_kb\"], \"deepseek-flash\"),\n    AgentProfile(\"web_agent\", [\"web_search\"], \"deepseek-flash\"),\n    AgentProfile(\"mail_agent\", [\"read_inbox\"], \"deepseek-v4-pro\"),\n]\n\n# 1. 用列表推导式得到所有名字，打印\nnames = [a.name for a in team]\nprint(names)\n\n# 2. find_by_tool(team, tool)：返回会用这个工具的智能体名字列表\ndef find_by_tool(team, tool):\n    return [a.name for a in team if tool in a.tools]\n\n# 3. find(team, name)：找到就返回对象，找不到返回 None\ndef find(team, name):\n    for a in team:\n        if a.name == name:\n            return a\n    return None\n\nprint(find_by_tool(team, \"web_search\"))\nprint(find(team, \"mail_agent\").model)\nprint(find(team, \"boss\"))\n",
        "en": "class AgentProfile:\n    def __init__(self, name, tools, model):\n        self.name = name\n        self.tools = tools\n        self.model = model\n\nteam = [\n    AgentProfile(\"kb_agent\", [\"search_finance_kb\", \"search_law_kb\"], \"deepseek-flash\"),\n    AgentProfile(\"web_agent\", [\"web_search\"], \"deepseek-flash\"),\n    AgentProfile(\"mail_agent\", [\"read_inbox\"], \"deepseek-v4-pro\"),\n]\n\n# 1. collect every name with a list comprehension and print it\nnames = [a.name for a in team]\nprint(names)\n\n# 2. find_by_tool(team, tool): return the names of the agents that can use that tool\ndef find_by_tool(team, tool):\n    return [a.name for a in team if tool in a.tools]\n\n# 3. find(team, name): return the object, or None if there is none\ndef find(team, name):\n    for a in team:\n        if a.name == name:\n            return a\n    return None\n\nprint(find_by_tool(team, \"web_search\"))\nprint(find(team, \"mail_agent\").model)\nprint(find(team, \"boss\"))\n"
      },
      "checks": [
        {
          "zh": "用列表推导式收集名字",
          "en": "Collects the names with a list comprehension",
          "re": "\\[\\s*(\\w+)\\.name\\s+for\\s+\\1\\s+in\\s+team\\s*\\]"
        },
        {
          "zh": "定义了 `find_by_tool(team, tool)`",
          "en": "Defines `find_by_tool(team, tool)`",
          "re": "def\\s+find_by_tool\\s*\\(\\s*team\\s*,\\s*tool\\s*\\)"
        },
        {
          "zh": "列表推导式里用 `if tool in ... .tools` 过滤",
          "en": "Filters with `if tool in ... .tools` in the comprehension",
          "re": "for\\s+(\\w+)\\s+in\\s+team\\s+if\\s+tool\\s+in\\s+\\1\\.tools"
        },
        {
          "zh": "定义了 `find(team, name)`",
          "en": "Defines `find(team, name)`",
          "re": "def\\s+find\\s*\\(\\s*team\\s*,\\s*name\\s*\\)"
        },
        {
          "zh": "找不到时 `return None`",
          "en": "Uses `return None` when nothing is found",
          "re": "return\\s+None"
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "以为多智能体就是「多调用几次模型」。关键在分工：每个智能体有清楚的角色（prompt）、自己的工具和知识库，还要有共享记忆和规划把它们串起来。",
      "en": "Thinking multi-agent just means “call the model a few more times”. The point is the division of labour: each agent has a clear role (prompt) and its own tools and knowledge bases, with shared memory and planning tying them together."
    },
    {
      "zh": "只顾拆任务，忘了「什么时候停」。Planning 要判断任务完成；写成代码时再加一个最大次数，防止无限循环。",
      "en": "Breaking the task down but forgetting when to stop. Planning must judge completion, and in code you should also cap the number of rounds to avoid an endless loop."
    },
    {
      "zh": "智能体之间不共享进度：后面的智能体不知道前面做到哪了，就会重复劳动或者接不上。",
      "en": "Agents that don't share progress: later agents don't know how far earlier ones got, so work is repeated or doesn't connect."
    },
    {
      "zh": "RAG 里把所有知识库一股脑全检索：无关领域的资料会混进来，干扰回答。先判断该查哪个库。",
      "en": "Searching every knowledge base in a RAG: material from unrelated domains creeps in and muddles the answer. Decide which base to search first."
    },
    {
      "zh": "在 `find` 里把 `return None` 写进了循环里面（和 `if` 对齐成了 `else`）：第一个对象不匹配就直接返回 `None`，后面的根本没检查。",
      "en": "Putting `return None` inside the loop in `find` (as an `else` of the `if`): the function returns `None` as soon as the first object doesn't match, without checking the rest."
    }
  ],
  "recap": [
    {
      "zh": "多智能体协作 = 不同的智能体干不同的事，像厨房分工一样让每个智能体更专注。",
      "en": "Multi-agent collaboration = different agents doing different jobs; like a kitchen, it keeps each agent focused."
    },
    {
      "zh": "协作逻辑四块：Profile（prompt 定义角色）、Memory（长短期 + 共享记忆）、Planning（拆解、判断何时停止）、Action（分派执行）；结果写回记忆，再交给规划，循环到完成。",
      "en": "Four parts: Profile (role defined by the prompt), Memory (short/long-term + shared), Planning (break down, decide when to stop), Action (dispatch and execute); results go back to memory and on to planning, looping until done."
    },
    {
      "zh": "好处：更专注；每个智能体可以挂不同的工具、知识库和模型，成本和资源更好控制。",
      "en": "Benefits: more focus; each agent can have its own tools, knowledge bases and model, which helps with cost and resources."
    },
    {
      "zh": "RAG 的升级路线：单一知识库 → 检索智能体选库（知识库 A/B 或联网）→ 主智能体 + 子智能体（知识库、联网、应用数据），结果还会做质量检查。",
      "en": "RAG upgrade path: one knowledge base → a retrieval agent picks the source (KB A/B or the web) → a main agent with sub-agents (knowledge bases, web, application data), with a quality check on results."
    },
    {
      "zh": "对象的列表：`for a in team` 读属性，`[a.name for a in team if ...]` 收集并过滤，循环里找到就 `return`，找不到最后返回 `None`。",
      "en": "Lists of objects: `for a in team` reads attributes, `[a.name for a in team if ...]` collects and filters, and a search returns inside the loop or `None` after it."
    }
  ],
  "files": [
    {
      "path": "practice/l13_rag_team_todo.py",
      "zh": "选做练习：工具函数已写好，补全知识库、联网、邮件三个子智能体和主智能体（有 TODO 提示）。",
      "en": "Optional exercise: the tool functions are ready; complete the knowledge-base, web and email sub-agents and the main agent (with TODO hints)."
    },
    {
      "path": "practice/l13_rag_team_solution.py",
      "zh": "参考答案：视频里「主智能体 + 三个子智能体」的 RAG，用第 12 节的 `as_tool` 实现。报销问题已用真实 DeepSeek 跑通。",
      "en": "Solution: the video's main-agent-plus-three-sub-agents RAG, built with `as_tool` from lesson 12. The expense question was tested with the real DeepSeek API."
    },
    {
      "path": "practice/data/l13_kb_finance.txt",
      "zh": "知识库 A：虚构的财务制度（差旅、发票、审批）。",
      "en": "Knowledge base A: made-up finance rules (travel, invoices, approvals)."
    },
    {
      "path": "practice/data/l13_kb_law.txt",
      "zh": "知识库 B：虚构的法务制度（合同审批、保密协议、用章）。",
      "en": "Knowledge base B: made-up legal rules (contract review, NDAs, company seals)."
    },
    {
      "path": "practice/data/l13_inbox.json",
      "zh": "虚构的收件箱：三封邮件，给邮件智能体用。",
      "en": "A made-up inbox with three emails for the email agent."
    }
  ]
});
