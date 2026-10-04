COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l26",
  "priority": "important",
  "handwrite": false,
  "studyMinutes": 30,
  "source": "subtitle",
  "summary": {
    "zh": "这一集是「节点与可控制性」的开场，讲 LangGraph 里「Graph」的三个核心概念：节点（一个具体的功能或操作，最好一个节点只做一件事，有输入有输出）、边（普通边和条件边）、图（节点和连接关系的集合，代表整个流程，可以是直线，也可以有分支和循环）。老师特别指出：这本身是一种计算范式，跟 AI 无关。最后预告后面要演示的代码：第一个 LangGraph、串行、分支、条件分支与循环、运行时配置、map-reduce。讲义用十几行纯 Python 模拟图的运行，帮你看清这套规则。",
    "en": "This episode opens “nodes & controllability” and covers the three core ideas behind the “Graph” in LangGraph: nodes (one concrete function or operation – ideally one job per node, with an input and an output), edges (normal and conditional) and the graph (all nodes plus their connections – the whole workflow, straight, branching or looping). The instructor stresses that this is a computing paradigm in itself, with no AI required. He then previews the code to come: a first LangGraph, sequences, branches, conditional branches and loops, runtime configuration, map-reduce. The notes simulate a graph run in a dozen lines of plain Python so you can see the rules at work."
  },
  "goals": [
    {
      "zh": "说出节点、边、图三个核心概念，并在一张流程图里指出它们",
      "en": "Name the three core ideas – node, edge, graph – and point them out in a flowchart"
    },
    {
      "zh": "说出节点的最佳实践：一个节点只做一件事；输入 → 处理 → 输出；可以是函数、API 调用或模型调用",
      "en": "State the node best practice: one job per node; input → work → output; a function, an API call or a model call"
    },
    {
      "zh": "区分普通边（固定的下一步）和条件边（到这里按条件分岔）",
      "en": "Tell a normal edge (a fixed next step) from a conditional edge (branching on a condition)"
    },
    {
      "zh": "用纯 Python 模拟图的运行：执行节点 → 合并更新 → 沿边前进；会用 `update()` 和 `{**a, **b}` 合并字典",
      "en": "Simulate a graph run in plain Python: run a node → merge its update → follow the edge; merge dicts with `update()` and `{**a, **b}`"
    },
    {
      "zh": "说出「可控制性」包括哪些控制方式，以及它们在第 27–29 节的位置",
      "en": "List the kinds of control behind “controllability” and where lessons 27–29 cover them"
    }
  ],
  "blocks": [
    {
      "t": "video",
      "zh": "这一集只有 4 分多钟，讲 PPT 上的一张流程图，最后说「接下来直接看代码」。顺序：\n- [▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=27&t=0) 三个核心概念：节点、边、图\n- [▶ 00:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=27&t=31) 节点：图里的基本单元，一个节点做一件事\n- [▶ 01:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=27&t=110) 边：普通边和条件边\n- [▶ 02:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=27&t=124) 图：整个流程；它是一种计算范式，跟 AI 无关\n- [▶ 02:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=27&t=175) 预告代码片段：第一个 LangGraph、串行、分支、条件分支与循环、运行时配置、map-reduce\n\n老师在这一集还没有提到「状态（State）」——它是下一集（第 27 节）一上来就要定义的东西。讲义里的纯 Python 模拟是补充内容。",
      "en": "This episode, just over 4 minutes, explains one flowchart on a slide and ends with “now let's look at code”. The order:\n- [▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=27&t=0) Three core ideas: node, edge, graph\n- [▶ 00:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=27&t=31) Nodes: the basic units; one job per node\n- [▶ 01:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=27&t=110) Edges: normal and conditional\n- [▶ 02:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=27&t=124) The graph: the whole workflow; a computing paradigm with no AI required\n- [▶ 02:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=27&t=175) Preview of the code snippets: first LangGraph, sequences, branches, conditional branches & loops, runtime configuration, map-reduce\n\nThe instructor doesn't mention “state” in this episode yet – it is the first thing defined in the next one (lesson 27). The plain-Python simulation in these notes is extra material."
    },
    {
      "t": "h",
      "zh": "一、三个核心概念：节点、边、图",
      "en": "1. Three core ideas: node, edge, graph"
    },
    {
      "t": "p",
      "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=27&t=0) LangGraph 名字里的「Graph」，指的就是三个概念：**节点（Node）**、**边（Edge）**、**图（Graph）**。老师用来讲解的是一张生成出来的流程图——多智能体架构最终都能画成这样的图：",
      "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=27&t=0) The “Graph” in LangGraph comes down to three ideas: **node**, **edge** and **graph**. The instructor explains them with a generated flowchart – any multi-agent architecture can end up drawn like this:"
    },
    {
      "t": "code",
      "file": {
        "zh": "示意图：一张直线型的图",
        "en": "diagram: a straight-line graph"
      },
      "lang": "text",
      "code": {
        "zh": "[START] --> [step_1] --> [step_2] --> [step_3] --> [END]\n\n每个方块 = 节点     每个箭头 = 边     整张图 = 图",
        "en": "[START] --> [step_1] --> [step_2] --> [step_3] --> [END]\n\neach box = a node     each arrow = an edge     the whole thing = the graph"
      }
    },
    {
      "t": "p",
      "zh": "| 概念 | 是什么 | 在上图里 |\n|---|---|---|\n| 节点 Node | 图里的基本单元，代表一个具体的功能或操作 | `START`、`step_1`、`step_2`、`step_3` 这些方块 |\n| 边 Edge | 连接节点的箭头，决定做完这一步接着去哪 | 方块之间的箭头 |\n| 图 Graph | 所有节点和连接关系的集合，代表整个工作流程 | 整张图 |",
      "en": "| Idea | What it is | In the diagram |\n|---|---|---|\n| Node | The basic unit of a graph: one concrete function or operation | The boxes `START`, `step_1`, `step_2`, `step_3` |\n| Edge | An arrow between nodes, deciding where to go after a step | The arrows between boxes |\n| Graph | All nodes plus their connections: the whole workflow | The whole picture |"
    },
    {
      "t": "h",
      "zh": "二、节点：一个节点只做一件事",
      "en": "2. Nodes: one job per node"
    },
    {
      "t": "p",
      "zh": "[▶ 00:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=27&t=31) 图里的每个方块都是一个节点：`START` 代表开始，`step_1` 是第一步的功能，`step_2` 是第二步，依此类推。\n\n[▶ 01:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=27&t=61) 老师给的**最佳实践**：一个节点只完成一项任务。比如 `step_1` 专门查数据，`step_2` 专门生成文本。\n\n所有节点都是同一个模式：**有输入、有输出**——拿到输入，在节点里做一些操作，得到输出。[▶ 01:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=27&t=93) 至于节点里做什么，没有限制：\n- 一个普通的 Python 函数；\n- 一次 API 调用；\n- 一次大模型调用；\n- 其他更复杂的操作（比如一个完整的子 Agent）。",
      "en": "[▶ 00:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=27&t=31) Every box in the diagram is a node: `START` marks the start, `step_1` is the first step's job, `step_2` the second, and so on.\n\n[▶ 01:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=27&t=61) The instructor's **best practice**: each node does exactly one job. For example `step_1` only looks up data and `step_2` only generates text.\n\nEvery node follows the same pattern: **an input and an output** – take the input, do some work inside the node, produce the output. [▶ 01:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=27&t=93) What happens inside is up to you:\n- a plain Python function;\n- an API call;\n- a model call;\n- something more complex (even a whole sub-agent)."
    },
    {
      "t": "p",
      "zh": "节点的「输入」和「输出」具体是什么？在 LangGraph 里，所有节点共用一份数据，叫**状态（State）**：节点拿到当前状态作为输入，返回它想更新的那几个键作为输出。怎样定义状态，是下一节（27）的第一件事；这里先记住「节点 = 接收状态、返回更新的函数」就够了。",
      "en": "What exactly are a node's “input” and “output”? In LangGraph all nodes share one piece of data called the **state**: a node takes the current state as input and returns the keys it wants to update as output. Defining the state is the first thing lesson 27 does; for now just remember “node = a function that takes the state and returns an update”."
    },
    {
      "t": "h",
      "zh": "三、边：普通边和条件边",
      "en": "3. Edges: normal and conditional"
    },
    {
      "t": "p",
      "zh": "[▶ 01:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=27&t=110) 边就是连接节点的箭头，最常见的有两种：\n\n- **普通边**：从这个节点固定流到那个节点，比如 `step_1 → step_2`。\n- **条件边**：走到某个节点之后，按条件**分岔**，可能去 A，也可能去 B。比如「审核通过 → 结束；不通过 → 回去重写」。",
      "en": "[▶ 01:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=27&t=110) Edges are the arrows between nodes; the two most common kinds:\n\n- **Normal edge**: always flows from this node to that one, e.g. `step_1 → step_2`.\n- **Conditional edge**: after a node, the flow **forks** on a condition – maybe to A, maybe to B. For example “review passed → finish; failed → go back and rewrite”."
    },
    {
      "t": "h",
      "zh": "四、图：整个流程，一种计算范式",
      "en": "4. The graph: the whole flow, a computing paradigm"
    },
    {
      "t": "p",
      "zh": "[▶ 02:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=27&t=124) 节点加上它们之间的连接关系，就是图，它代表了整个工作流程：\n- 可以是**直线**的，像上面那张图；\n- 也可以有**分支**、有**循环**，组成复杂的结构。\n\n图控制着整个应用的执行流程和逻辑。[▶ 02:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=27&t=155) 老师特别强调：到这里为止，**连 AI 都还没有出现**——图本身只是一种计算范式，靠节点和边的连接就能搭出复杂的系统。AI 只是可以放进某些节点里的一种操作。",
      "en": "[▶ 02:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=27&t=124) Nodes plus their connections make the graph, which represents the whole workflow:\n- it can be a **straight line**, like the diagram above;\n- or it can have **branches** and **loops**, forming complex structures.\n\nThe graph controls the whole application's flow and logic. [▶ 02:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=27&t=155) The instructor stresses that so far **no AI is involved at all** – a graph is just a computing paradigm; by connecting nodes with edges you can build complex systems. AI is merely one kind of work you may put inside some nodes."
    },
    {
      "t": "check",
      "q": {
        "zh": "「审核节点之后：通过就结束，不通过就回到写稿节点」，这里用的是哪种边？",
        "en": "“After the review node: finish if it passes, otherwise go back to the writing node.” Which kind of edge is this?"
      },
      "options": [
        {
          "zh": "普通边",
          "en": "A normal edge"
        },
        {
          "zh": "条件边",
          "en": "A conditional edge"
        },
        {
          "zh": "不需要边，节点自己会跳转",
          "en": "No edge needed; nodes jump by themselves"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "走到审核节点后要按条件分岔，所以是条件边；「写稿之后总是审核」才是普通边。",
        "en": "The flow forks on a condition after the review, so it is a conditional edge; “review always follows writing” would be a normal edge."
      }
    },
    {
      "t": "h",
      "zh": "五、动手看清：用纯 Python 模拟一张图",
      "en": "5. See it run: simulate a graph in plain Python"
    },
    {
      "t": "p",
      "zh": "既然图只是一种计算方式，不用 LangGraph、不用 AI 也能把它模拟出来（讲义补充）。运行规则很简单：\n\n1. 从 START 出发，找到第一个节点；\n2. 执行当前节点，拿到它返回的「更新」；\n3. 把更新**合并**进状态；\n4. 沿着边找到下一个节点，回到第 2 步，直到 END。\n\n下面按老师图里的思路写三个节点：`step_1` 专门查数据，`step_2` 专门生成文本，`step_3` 做收尾（这段可以直接在浏览器里运行）：",
      "en": "Since a graph is just a way of computing, you can simulate one without LangGraph or AI (an extra from the notes). The run rules are simple:\n\n1. Start at START and find the first node;\n2. run the current node and take the “update” it returns;\n3. **merge** the update into the state;\n4. follow the edge to the next node and go back to step 2, until END.\n\nBelow are three nodes in the spirit of the instructor's diagram: `step_1` only looks up data, `step_2` only generates text, `step_3` finishes off (this runs right in the browser):"
    },
    {
      "t": "code",
      "file": "toy_graph.py",
      "run": true,
      "code": {
        "zh": "# 三个节点：都是普通函数，接收状态，只返回要更新的键\ndef step_1(state):                    # 只负责查数据\n    temps = {\"北京\": 26, \"上海\": 30}\n    return {\"temp\": temps[state[\"city\"]]}\n\ndef step_2(state):                    # 只负责生成文本\n    return {\"text\": f\"{state['city']}现在 {state['temp']}°C\"}\n\ndef step_3(state):                    # 只负责收尾：按气温加一句提醒\n    if state[\"temp\"] >= 28:\n        return {\"text\": state[\"text\"] + \"，注意防暑。\"}\n    return {\"text\": state[\"text\"] + \"，适合出门。\"}\n\nnodes = {\"step_1\": step_1, \"step_2\": step_2, \"step_3\": step_3}       # 节点名 → 函数\nedges = {\"START\": \"step_1\", \"step_1\": \"step_2\", \"step_2\": \"step_3\", \"step_3\": \"END\"}   # 普通边\n\ndef run_graph(state):\n    current = edges[\"START\"]                  # 1. 从 START 出发\n    while current != \"END\":                   # 走到 END 为止\n        update = nodes[current](dict(state))  # 2. 执行节点（交给它一份副本）\n        state.update(update)                  # 3. 把返回的更新合并进状态\n        print(current, \"返回\", update)\n        current = edges[current]              # 4. 沿着边走到下一个节点\n    return state\n\nfinal = run_graph({\"city\": \"上海\"})\nprint(\"最终状态：\", final)",
        "en": "# Three nodes: plain functions that take the state and return only the keys to update\ndef step_1(state):                    # only looks up data\n    temps = {\"Beijing\": 26, \"Shanghai\": 30}\n    return {\"temp\": temps[state[\"city\"]]}\n\ndef step_2(state):                    # only generates text\n    return {\"text\": f\"{state['city']}: {state['temp']}°C now\"}\n\ndef step_3(state):                    # only finishes off: add a tip based on the temperature\n    if state[\"temp\"] >= 28:\n        return {\"text\": state[\"text\"] + \", stay out of the heat.\"}\n    return {\"text\": state[\"text\"] + \", nice weather to go out.\"}\n\nnodes = {\"step_1\": step_1, \"step_2\": step_2, \"step_3\": step_3}       # node name -> function\nedges = {\"START\": \"step_1\", \"step_1\": \"step_2\", \"step_2\": \"step_3\", \"step_3\": \"END\"}   # normal edges\n\ndef run_graph(state):\n    current = edges[\"START\"]                  # 1. start at START\n    while current != \"END\":                   # until END\n        update = nodes[current](dict(state))  # 2. run the node (hand it a copy)\n        state.update(update)                  # 3. merge the update into the state\n        print(current, \"returned\", update)\n        current = edges[current]              # 4. follow the edge to the next node\n    return state\n\nfinal = run_graph({\"city\": \"Shanghai\"})\nprint(\"final state:\", final)"
      },
      "note": {
        "zh": "`nodes` 是第 07 节的分发表：用名字找到函数；`edges` 记录「这一步 → 下一步」，就是普通边。节点拿到的是状态的**副本**，只有它**返回**的更新才会合并进状态。真正的 LangGraph 也是这样：实测 1.2 版，在节点里给 `state[...]` 赋值而不返回，修改会丢失。\n\n不过副本只复制最外层：如果在节点里原地修改状态里的列表（`state[\"items\"].append(...)`），改动反而会「漏」进状态，LangGraph 1.2 里也一样。所以节点里不要原地改状态，一律用 `return` 返回更新。",
        "en": "`nodes` is lesson 07's dispatch table: look a function up by name; `edges` records “this step → next step”, i.e. normal edges. A node gets a **copy** of the state, and only the update it **returns** is merged in. Real LangGraph behaves the same way: tested on 1.2, assigning `state[...]` inside a node without returning it is lost.\n\nBut the copy is only one level deep: changing a list inside the state in place (`state[\"items\"].append(...)`) does leak into the state, in LangGraph 1.2 as well. So never change the state in place inside a node – always `return` the update."
      }
    },
    {
      "t": "py",
      "title": {
        "zh": "合并字典：update()、{**a, **b} 和 dict() 复制",
        "en": "Merging dicts: update(), {**a, **b} and copying with dict()"
      },
      "zh": "节点只返回「要改的那几个键」，由运行器把它合并进状态。Python 里合并字典常用两种写法：\n- `state.update(changes)`：**原地**修改 `state`：同名的键被新值覆盖，新的键被加进来，没提到的键保持不变。它返回 `None`，所以不要写 `state = state.update(...)`。\n- `{**state, **changes}`：生成一个**新**字典，原来的不变。字典里的 `**` 表示「把这个字典的键值对展开放进来」（和第 05 节调用函数时的 `**args` 是同一个符号），后放进来的覆盖先放进来的。\n\n另外，`dict(state)` 会复制出一个新字典，给副本的键赋值不影响原字典。它只复制最外层（第 06 节说过 `dict(...)` 是浅转换），里面的列表仍是同一个。\n\nLangGraph 默认的合并规则就是「同名覆盖」。第 28 节会学怎样让某个键改成「追加」而不是覆盖（reducer），比如对话记录。",
      "en": "A node returns only “the keys to change”, and the runner merges them into the state. Two common ways to merge dicts in Python:\n- `state.update(changes)` changes `state` **in place**: keys with the same name are overwritten, new keys are added, untouched keys stay. It returns `None`, so never write `state = state.update(...)`.\n- `{**state, **changes}` builds a **new** dict and leaves the original alone. Inside a dict, `**` means “unpack this dict's key-value pairs here” (the same symbol as `**args` in lesson 05's function calls); later ones overwrite earlier ones.\n\nAlso, `dict(state)` makes a new copy; assigning to a key of the copy leaves the original untouched. It copies only the outer level (lesson 06: `dict(...)` is shallow), so a list inside is still shared.\n\nLangGraph's default merge rule is exactly “same key, overwrite”. Lesson 28 shows how to make a key “append” instead (a reducer), e.g. for messages.",
      "code": {
        "zh": "state = {\"city\": \"上海\", \"temp\": 0}\nchanges = {\"temp\": 30}\n\nnew_state = {**state, **changes}      # 新字典：temp 被覆盖，city 保留\nprint(new_state)                      # {'city': '上海', 'temp': 30}\nprint(state)                          # 原来的没变：{'city': '上海', 'temp': 0}\n\nstate.update(changes)                 # 原地合并\nstate.update({\"text\": \"上海现在 30°C\"})   # 没有的键会被加进来\nprint(state)                          # {'city': '上海', 'temp': 30, 'text': '上海现在 30°C'}\n\nbackup = dict(state)                  # 复制一份\nbackup[\"city\"] = \"改的是副本\"\nprint(state[\"city\"])                  # 上海 —— 原字典不受影响",
        "en": "state = {\"city\": \"Shanghai\", \"temp\": 0}\nchanges = {\"temp\": 30}\n\nnew_state = {**state, **changes}      # new dict: temp overwritten, city kept\nprint(new_state)                      # {'city': 'Shanghai', 'temp': 30}\nprint(state)                          # the original is unchanged: {'city': 'Shanghai', 'temp': 0}\n\nstate.update(changes)                 # merge in place\nstate.update({\"text\": \"Shanghai: 30°C now\"})   # a missing key is added\nprint(state)                          # {'city': 'Shanghai', 'temp': 30, 'text': 'Shanghai: 30°C now'}\n\nbackup = dict(state)                  # make a copy\nbackup[\"city\"] = \"only the copy changed\"\nprint(state[\"city\"])                  # Shanghai - the original is untouched"
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "状态是 `{\"city\": \"上海\", \"temp\": 0}`，节点返回 `{\"temp\": 30}`。合并后的状态是？",
        "en": "The state is `{\"city\": \"Shanghai\", \"temp\": 0}` and a node returns `{\"temp\": 30}`. What is the state after merging?"
      },
      "options": [
        {
          "zh": "`{\"temp\": 30}`——没返回的键被删掉了",
          "en": "`{\"temp\": 30}` – keys not returned are removed"
        },
        {
          "zh": "`{\"city\": \"上海\", \"temp\": 0}`——节点的返回值被忽略",
          "en": "`{\"city\": \"Shanghai\", \"temp\": 0}` – the return value is ignored"
        },
        {
          "zh": "`{\"city\": \"上海\", \"temp\": 30}`",
          "en": "`{\"city\": \"Shanghai\", \"temp\": 30}`"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "只有返回的键被更新（同名覆盖），没提到的 `city` 保持原样。所以节点只需要返回自己改动的那几个键。",
        "en": "Only the returned keys are updated (overwrite by name); `city`, not mentioned, stays. That is why a node returns only the keys it changed."
      }
    },
    {
      "t": "h",
      "zh": "六、可控制性：后面要演示的几种控制方式",
      "en": "6. Controllability: the kinds of control coming up"
    },
    {
      "t": "p",
      "zh": "[▶ 02:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=27&t=175) 「可控制性」说的是：流程怎么走，由你用节点和边来控制。老师预告了接下来要演示的代码片段：\n\n| 内容 | 意思 | 课程位置 |\n|---|---|---|\n| 第一个 LangGraph（hello world） | 最基本的一张图怎么写 | 27 |\n| 串行 | 一个节点接一个节点，像上面那张直线图 | 28 |\n| 分支 | 走到某个节点后，分成几路 | 28 |\n| 条件分支与循环 | 用条件边决定去哪；必要时回到前面的节点 | 28 |\n| 运行时配置 | 精细控制：运行图的时候再传入配置 | 29 |\n| map-reduce | 精细控制：拆成很多份并行处理，再汇总 | 29 |\n\n[▶ 03:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=27&t=220) 讲到循环，老师举的是最常见的例子：调用一个工具，工具返回结果，模型再看结果决定要不要继续，直到得出最终答案——也就是第 25 节那张 model ⇄ tools 的图。\n\n下面再用纯 Python 模拟一个带**条件边和循环**的图：「写稿 → 审核 → 不通过就重写」，正是第 23 节说的生成–评估循环（讲义补充）：",
      "en": "[▶ 02:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=27&t=175) “Controllability” means you control how the flow runs, using nodes and edges. The instructor previews the code snippets to come:\n\n| Topic | Meaning | Lesson |\n|---|---|---|\n| First LangGraph (hello world) | How to write the most basic graph | 27 |\n| Sequence | One node after another, like the straight-line diagram | 28 |\n| Branches | After a node, the flow splits into several paths | 28 |\n| Conditional branches & loops | A conditional edge picks the way; go back to an earlier node when needed | 28 |\n| Runtime configuration | Fine control: pass in settings when you run the graph | 29 |\n| Map-reduce | Fine control: split into many parallel pieces, then combine | 29 |\n\n[▶ 03:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=27&t=220) For loops the instructor gives the most common case: call a tool, the tool returns a result, the model looks at it and decides whether to continue, until there is a final answer – the model ⇄ tools graph from lesson 25.\n\nHere is one more plain-Python simulation, now with a **conditional edge and a loop**: “write → review → rewrite on failure”, the generate–evaluate loop from lesson 23 (an extra from the notes):"
    },
    {
      "t": "code",
      "file": "toy_loop.py",
      "run": true,
      "code": {
        "zh": "def write(state):\n    # 模拟「改稿」：每写一轮，草稿后面多一个感叹号\n    return {\"draft\": state[\"draft\"] + \"!\", \"rounds\": state[\"rounds\"] + 1}\n\ndef review(state):\n    # 字符串的 .count(\"!\")：数一数里面有几个感叹号，至少 3 个才算通过\n    return {\"approved\": state[\"draft\"].count(\"!\") >= 3}\n\ndef after_review(state):\n    \"\"\"条件边：看状态决定下一步（28 节细讲）。\"\"\"\n    if state[\"approved\"] or state[\"rounds\"] >= 5:   # 通过了，或者已经写了 5 轮（防止无限循环）\n        return \"END\"\n    return \"write\"\n\nnodes = {\"write\": write, \"review\": review}\nstate = {\"draft\": \"初稿\", \"rounds\": 0, \"approved\": False}\n\ncurrent = \"write\"\nwhile current != \"END\":\n    state.update(nodes[current](dict(state)))\n    print(current, \"→\", state)\n    if current == \"write\":\n        current = \"review\"               # 普通边：write 之后总是 review\n    else:\n        current = after_review(state)    # 条件边：由函数看状态决定\n\nprint(\"结束，一共写了\", state[\"rounds\"], \"轮\")",
        "en": "def write(state):\n    # pretend to revise: every round adds one exclamation mark to the draft\n    return {\"draft\": state[\"draft\"] + \"!\", \"rounds\": state[\"rounds\"] + 1}\n\ndef review(state):\n    # the string method .count(\"!\") counts the exclamation marks; 3 or more passes\n    return {\"approved\": state[\"draft\"].count(\"!\") >= 3}\n\ndef after_review(state):\n    \"\"\"Conditional edge: look at the state, pick the next step (details in lesson 28).\"\"\"\n    if state[\"approved\"] or state[\"rounds\"] >= 5:   # approved, or 5 rounds already (no endless loop)\n        return \"END\"\n    return \"write\"\n\nnodes = {\"write\": write, \"review\": review}\nstate = {\"draft\": \"draft\", \"rounds\": 0, \"approved\": False}\n\ncurrent = \"write\"\nwhile current != \"END\":\n    state.update(nodes[current](dict(state)))\n    print(current, \"->\", state)\n    if current == \"write\":\n        current = \"review\"               # normal edge: review always follows write\n    else:\n        current = after_review(state)    # conditional edge: a function decides\n\nprint(\"done after\", state[\"rounds\"], \"rounds\")"
      },
      "note": {
        "zh": "把 `review` 换成「让模型打分」，`write` 换成「让模型改稿」，就是一个真正的 Agent 工作流；但走哪条路、最多循环几轮，仍然由你画的图决定。这就是可控制性：模型只在你允许的路口做选择，循环的上限由代码保证。",
        "en": "Swap `review` for “let the model grade it” and `write` for “let the model revise”, and you have a real agent workflow – yet which path to take and how many rounds at most are still decided by the graph you drew. That is controllability: the model chooses only at junctions you allow, and code guarantees the loop limit."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "在「写稿 → 审核 → 不通过就重写」的图里，「最多写 5 轮」这条规则写在哪里最合适？",
        "en": "In the “write → review → rewrite on failure” graph, where does the rule “at most 5 rounds” belong?"
      },
      "options": [
        {
          "zh": "写进写稿节点的提示词，请模型自觉停下",
          "en": "In the writer's prompt, asking the model to stop by itself"
        },
        {
          "zh": "写在审核后面的条件边函数里，由代码判断轮数",
          "en": "In the conditional-edge function after the review, where code checks the round count"
        },
        {
          "zh": "不需要，模型总会在合适的时候停",
          "en": "Nowhere – the model always stops at the right time"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "路线由图决定：在条件边里用代码检查轮数，100% 可靠。交给模型「自觉」则不一定。",
        "en": "The graph decides the route: checking the round count in code at the conditional edge is fully reliable; trusting the model to stop is not."
      }
    },
    {
      "t": "h",
      "zh": "七、预览：这三个概念在 LangGraph 代码里叫什么",
      "en": "7. Preview: what the three ideas are called in LangGraph code"
    },
    {
      "t": "p",
      "zh": "[▶ 04:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=27&t=251) 老师这一集到这里就转去看代码了。先预览一下：把上面的 `step_1 → step_2 → step_3` 交给真正的 LangGraph，大概长这样。不用记，下一节（27）会一行行讲：",
      "en": "[▶ 04:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=27&t=251) This is where the instructor switches to code. A quick preview: handing the `step_1 → step_2 → step_3` example above to real LangGraph looks roughly like this. No need to memorise it – lesson 27 goes through it line by line:"
    },
    {
      "t": "code",
      "file": "real_graph_preview.py",
      "code": {
        "zh": "from typing import TypedDict\nfrom langgraph.graph import StateGraph, START, END\n\nclass State(TypedDict):          # 节点之间共用的数据：有哪些键（27 节讲）\n    city: str\n    temp: int\n    text: str\n\n# step_1、step_2、step_3 和上面纯 Python 版完全一样，这里省略\n\nbuilder = StateGraph(State)                 # 图：按状态的结构新建一张空图\nbuilder.add_node(\"step_1\", step_1)          # 节点：名字 + 函数本身（不加括号）\nbuilder.add_node(\"step_2\", step_2)\nbuilder.add_node(\"step_3\", step_3)\nbuilder.add_edge(START, \"step_1\")           # 边：START → step_1 → step_2 → step_3 → END\nbuilder.add_edge(\"step_1\", \"step_2\")\nbuilder.add_edge(\"step_2\", \"step_3\")\nbuilder.add_edge(\"step_3\", END)\n\ngraph = builder.compile()                   # 编译：检查结构，得到可运行的图\nprint(graph.invoke({\"city\": \"上海\"}))\n# {'city': '上海', 'temp': 30, 'text': '上海现在 30°C，注意防暑。'}",
        "en": "from typing import TypedDict\nfrom langgraph.graph import StateGraph, START, END\n\nclass State(TypedDict):          # the data shared by all nodes: which keys (lesson 27)\n    city: str\n    temp: int\n    text: str\n\n# step_1, step_2 and step_3 are exactly the plain-Python ones above (omitted here)\n\nbuilder = StateGraph(State)                 # the graph: an empty graph shaped by the state\nbuilder.add_node(\"step_1\", step_1)          # nodes: name + the function itself (no parentheses)\nbuilder.add_node(\"step_2\", step_2)\nbuilder.add_node(\"step_3\", step_3)\nbuilder.add_edge(START, \"step_1\")           # edges: START -> step_1 -> step_2 -> step_3 -> END\nbuilder.add_edge(\"step_1\", \"step_2\")\nbuilder.add_edge(\"step_2\", \"step_3\")\nbuilder.add_edge(\"step_3\", END)\n\ngraph = builder.compile()                   # compile: check the structure, get a runnable graph\nprint(graph.invoke({\"city\": \"Shanghai\"}))\n# {'city': 'Shanghai', 'temp': 30, 'text': 'Shanghai: 30°C now, stay out of the heat.'}"
      },
      "note": {
        "zh": "LangGraph 代码不能在浏览器里运行。完整的可运行版本在 `practice/l26_real_graph_preview.py`（不调用模型、不需要 API key），它会打印和纯 Python 模拟一样的结果。对照着看：`add_node` 就是往 `nodes` 里登记，`add_edge` 就是往 `edges` 里登记，`invoke` 就是 `run_graph`。`START`、`END` 其实就是两个字符串 `\"__start__\"` 和 `\"__end__\"`。",
        "en": "LangGraph code cannot run in the browser. A complete runnable version is in `practice/l26_real_graph_preview.py` (no model calls, no API key); it prints the same result as the plain-Python simulation. Compare: `add_node` registers in `nodes`, `add_edge` registers in `edges`, `invoke` is `run_graph`. `START` and `END` are simply the strings `\"__start__\"` and `\"__end__\"`."
      }
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "这一集讲的 LangGraph「Graph」部分的三个核心概念是？",
        "en": "What are the three core ideas of the “Graph” part of LangGraph in this episode?"
      },
      "options": [
        {
          "zh": "模型、提示词、工具",
          "en": "Model, prompt, tool"
        },
        {
          "zh": "链、记忆、检索",
          "en": "Chain, memory, retrieval"
        },
        {
          "zh": "节点、边、图",
          "en": "Node, edge, graph"
        },
        {
          "zh": "监管者、组长、组员",
          "en": "Supervisor, lead, member"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "节点是基本单元，边是连接节点的箭头，图是节点和连接关系的集合，代表整个流程。",
        "en": "Nodes are the basic units, edges the arrows between them, and the graph is all of them together – the whole workflow."
      }
    },
    {
      "q": {
        "zh": "老师给节点的最佳实践是？",
        "en": "What best practice does the instructor give for nodes?"
      },
      "options": [
        {
          "zh": "一个节点只完成一项任务，比如一个专门查数据、一个专门生成文本",
          "en": "Each node does one job – e.g. one only looks up data, another only generates text"
        },
        {
          "zh": "把所有任务都放进一个节点，越少越好",
          "en": "Put every job in one node; the fewer nodes the better"
        },
        {
          "zh": "每个节点都必须调用一次大模型",
          "en": "Every node must call the model"
        },
        {
          "zh": "节点不能有输入",
          "en": "Nodes must not have an input"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "一个节点一件事，有输入有输出。节点里可以是普通函数、API 调用或模型调用，不一定要用 AI。",
        "en": "One job per node, with an input and an output. Inside can be a plain function, an API call or a model call – AI is optional."
      }
    },
    {
      "q": {
        "zh": "普通边和条件边的区别是？",
        "en": "What is the difference between a normal edge and a conditional edge?"
      },
      "options": [
        {
          "zh": "普通边只能连到 END",
          "en": "A normal edge can only lead to END"
        },
        {
          "zh": "条件边执行得更快",
          "en": "A conditional edge runs faster"
        },
        {
          "zh": "普通边需要调用模型，条件边不需要",
          "en": "A normal edge calls the model; a conditional edge does not"
        },
        {
          "zh": "普通边的下一步是固定的；条件边走到这里会按条件分岔",
          "en": "A normal edge has a fixed next step; a conditional edge forks on a condition"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "「write 之后总是 review」是普通边；「review 之后，通过就 END、不通过就回 write」是条件边。",
        "en": "“review always follows write” is a normal edge; “after review, END if approved, otherwise back to write” is a conditional edge."
      }
    },
    {
      "q": {
        "zh": "老师说「这里甚至都没有 AI，它就是一种计算范式」，意思是？",
        "en": "The instructor says “there isn't even any AI here, it's a computing paradigm”. What does he mean?"
      },
      "options": [
        {
          "zh": "LangGraph 不能调用大模型",
          "en": "LangGraph cannot call models"
        },
        {
          "zh": "节点和边组成的图本身跟 AI 无关；AI 只是可以放进某些节点里的一种操作",
          "en": "A graph of nodes and edges has nothing to do with AI by itself; AI is just one kind of work some nodes may do"
        },
        {
          "zh": "图只能处理数字计算",
          "en": "Graphs can only do arithmetic"
        },
        {
          "zh": "必须先学会数学里的图论才能用 LangGraph",
          "en": "You must study graph theory before using LangGraph"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "所以讲义里能用纯 Python 模拟一张图。节点里放普通函数、API 调用、模型调用都可以。",
        "en": "That is why the notes can simulate a graph in plain Python. A node can hold a plain function, an API call or a model call."
      }
    },
    {
      "q": {
        "zh": "节点函数应该返回什么？",
        "en": "What should a node function return?"
      },
      "options": [
        {
          "zh": "什么都不返回，直接修改传进来的 state",
          "en": "Nothing – it edits the state it was given"
        },
        {
          "zh": "下一个节点的名字",
          "en": "The name of the next node"
        },
        {
          "zh": "一个字典，只包含它要更新的那几个键",
          "en": "A dict containing only the keys it updates"
        },
        {
          "zh": "一个字符串，是模型的回答",
          "en": "A string – the model's answer"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "运行器把返回的字典按「同名覆盖」合并进状态；在节点里给传进来的 state 赋值，LangGraph 不会保存（实测 1.2 版）。直接返回一个节点名字符串会报 `InvalidUpdateError`；在基本的图里，下一步由边决定。",
        "en": "The runner merges the returned dict into the state (overwrite by name); assigning to the given state inside a node is not kept by LangGraph (tested on 1.2). Returning a bare node name raises `InvalidUpdateError`; in a basic graph the edges choose the next step."
      }
    },
    {
      "q": {
        "zh": "「运行图的时候再传入配置」和 map-reduce，属于老师说的哪一类控制？",
        "en": "Passing in settings when running the graph, and map-reduce – which kind of control does the instructor file them under?"
      },
      "options": [
        {
          "zh": "基本控制，和串行一样",
          "en": "Basic control, like sequences"
        },
        {
          "zh": "人机交互",
          "en": "Human-in-the-loop"
        },
        {
          "zh": "持久化",
          "en": "Persistence"
        },
        {
          "zh": "精细控制（第 29 节）",
          "en": "Fine control (lesson 29)"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "串行、分支、条件分支与循环是基本控制（28 节）；运行时配置和 map-reduce 是精细控制（29 节）。",
        "en": "Sequences, branches, conditional branches and loops are basic control (lesson 28); runtime configuration and map-reduce are fine control (lesson 29)."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "认出图的各个部分",
        "en": "Name the parts of a graph"
      },
      "code": {
        "zh": "builder = [[StateGraph]](State)\nbuilder.[[add_node]](\"step_1\", [[step_1]])\nbuilder.add_node(\"step_2\", step_2)\nbuilder.[[add_edge]]([[START]], \"step_1\")\nbuilder.add_edge(\"step_1\", \"step_2\")\nbuilder.add_edge(\"step_2\", [[END]])\n\ngraph = builder.[[compile]]()\nresult = graph.[[invoke]]({\"city\": \"上海\"})",
        "en": "builder = [[StateGraph]](State)\nbuilder.[[add_node]](\"step_1\", [[step_1]])\nbuilder.add_node(\"step_2\", step_2)\nbuilder.[[add_edge]]([[START]], \"step_1\")\nbuilder.add_edge(\"step_1\", \"step_2\")\nbuilder.add_edge(\"step_2\", [[END]])\n\ngraph = builder.[[compile]]()\nresult = graph.[[invoke]]({\"city\": \"Shanghai\"})"
      },
      "explain": {
        "zh": "新建图 → 注册节点（交函数本身，不加括号）→ 用边从 START 连到 END → 编译 → 用初始状态运行。",
        "en": "Create the graph → register nodes (the function itself, no parentheses) → connect START through to END with edges → compile → run with an initial state."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：一个迷你图运行器",
        "en": "Write it: a mini graph runner"
      },
      "task": {
        "zh": "换一组节点，用纯 Python 模拟图的运行（不用 LangGraph）：\n1. 写一个节点 `shout(state)`：返回 `{\"text\": 全部大写的 text}`（用字符串的 `.upper()` 方法）\n2. 把 `shout` 注册进 `nodes`，并把 `edges` 改成 START → clean → shout → count → END\n3. 写运行循环：从 `edges[\"START\"]` 开始；只要当前节点不是 `\"END\"`，就执行它、用 `state.update(...)` 合并返回值、再沿着边走到下一个节点\n4. 打印最终状态，应该是 `{'text': 'HELLO GRAPH', 'length': 11}`",
        "en": "Simulate a graph run in plain Python with a new set of nodes (no LangGraph):\n1. write a node `shout(state)` returning `{\"text\": the text in capitals}` (use the string method `.upper()`)\n2. register `shout` in `nodes` and change `edges` to START → clean → shout → count → END\n3. write the run loop: start from `edges[\"START\"]`; while the current node is not `\"END\"`, run it, merge its return value with `state.update(...)`, then follow the edge to the next node\n4. print the final state – it should be `{'text': 'HELLO GRAPH', 'length': 11}`"
      },
      "run": true,
      "starter": {
        "zh": "def clean(state):\n    return {\"text\": state[\"text\"].strip()}\n\ndef count(state):\n    return {\"length\": len(state[\"text\"])}\n\n# TODO 1: 写节点 shout(state)，返回全部大写的 text\n\n\nnodes = {\"clean\": clean, \"count\": count}                       # TODO 2: 注册 shout\nedges = {\"START\": \"clean\", \"clean\": \"count\", \"count\": \"END\"}   # TODO 2: 在 clean 和 count 之间插入 shout\n\nstate = {\"text\": \"  hello graph  \", \"length\": 0}\n\n# TODO 3: 从 edges[\"START\"] 出发，循环执行节点、合并更新、沿边前进，直到 \"END\"\n\n\nprint(state)",
        "en": "def clean(state):\n    return {\"text\": state[\"text\"].strip()}\n\ndef count(state):\n    return {\"length\": len(state[\"text\"])}\n\n# TODO 1: write the node shout(state), returning the text in capitals\n\n\nnodes = {\"clean\": clean, \"count\": count}                       # TODO 2: register shout\nedges = {\"START\": \"clean\", \"clean\": \"count\", \"count\": \"END\"}   # TODO 2: put shout between clean and count\n\nstate = {\"text\": \"  hello graph  \", \"length\": 0}\n\n# TODO 3: start from edges[\"START\"]; run the node, merge the update, follow the edge - until \"END\"\n\n\nprint(state)"
      },
      "solution": {
        "zh": "def clean(state):\n    return {\"text\": state[\"text\"].strip()}\n\ndef count(state):\n    return {\"length\": len(state[\"text\"])}\n\n# TODO 1: 写节点 shout(state)，返回全部大写的 text\ndef shout(state):\n    return {\"text\": state[\"text\"].upper()}\n\nnodes = {\"clean\": clean, \"shout\": shout, \"count\": count}\nedges = {\"START\": \"clean\", \"clean\": \"shout\", \"shout\": \"count\", \"count\": \"END\"}\n\nstate = {\"text\": \"  hello graph  \", \"length\": 0}\n\n# TODO 3: 从 edges[\"START\"] 出发，循环执行节点、合并更新、沿边前进，直到 \"END\"\ncurrent = edges[\"START\"]\nwhile current != \"END\":\n    update = nodes[current](dict(state))\n    state.update(update)\n    current = edges[current]\n\nprint(state)   # {'text': 'HELLO GRAPH', 'length': 11}",
        "en": "def clean(state):\n    return {\"text\": state[\"text\"].strip()}\n\ndef count(state):\n    return {\"length\": len(state[\"text\"])}\n\n# TODO 1: write the node shout(state), returning the text in capitals\ndef shout(state):\n    return {\"text\": state[\"text\"].upper()}\n\nnodes = {\"clean\": clean, \"shout\": shout, \"count\": count}\nedges = {\"START\": \"clean\", \"clean\": \"shout\", \"shout\": \"count\", \"count\": \"END\"}\n\nstate = {\"text\": \"  hello graph  \", \"length\": 0}\n\n# TODO 3: start from edges[\"START\"]; run the node, merge the update, follow the edge - until \"END\"\ncurrent = edges[\"START\"]\nwhile current != \"END\":\n    update = nodes[current](dict(state))\n    state.update(update)\n    current = edges[current]\n\nprint(state)   # {'text': 'HELLO GRAPH', 'length': 11}"
      },
      "checks": [
        {
          "zh": "定义了节点 `shout(state)`",
          "en": "Defines the node `shout(state)`",
          "re": "def\\s+shout\\s*\\(\\s*state\\s*\\)\\s*:"
        },
        {
          "zh": "`shout` 用 `.upper()` 并返回一个字典",
          "en": "`shout` uses `.upper()` and returns a dict",
          "re": "return\\s*\\{\\s*[\"']text[\"']\\s*:.*\\.upper\\(\\)"
        },
        {
          "zh": "`shout` 注册进了 `nodes`",
          "en": "`shout` is registered in `nodes`",
          "re": "[\"']shout[\"']\\s*:\\s*shout\\b"
        },
        {
          "zh": "边改成了 clean → shout → count",
          "en": "Edges now go clean → shout → count",
          "re": "[\"']clean[\"']\\s*:\\s*[\"']shout[\"'][\\s\\S]*[\"']shout[\"']\\s*:\\s*[\"']count[\"']"
        },
        {
          "zh": "从 `edges[\"START\"]` 出发",
          "en": "Starts from `edges[\"START\"]`",
          "re": "=\\s*edges\\[\\s*[\"']START[\"']\\s*\\]"
        },
        {
          "zh": "`while` 循环直到 `\"END\"`",
          "en": "A `while` loop until `\"END\"`",
          "re": "while\\s+\\w+\\s*!=\\s*[\"']END[\"']\\s*:"
        },
        {
          "zh": "用 `nodes[...]` 找到并执行当前节点",
          "en": "Looks up and runs the current node with `nodes[...]`",
          "re": "nodes\\[\\s*\\w+\\s*\\]\\s*\\("
        },
        {
          "zh": "用 `state.update(...)` 合并更新",
          "en": "Merges the update with `state.update(...)`",
          "re": "state\\.update\\("
        },
        {
          "zh": "沿着边走到下一个节点",
          "en": "Follows the edge to the next node",
          "re": "(\\w+)\\s*=\\s*edges\\[\\s*\\1\\s*\\]"
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "一个节点里塞好几件事（查数据、生成文本、发通知全在一起）：出错时很难判断是哪一步的问题，也没法单独复用。按老师的最佳实践，一个节点只做一件事。",
      "en": "Cramming several jobs into one node (look up data, generate text, send a notice): when it fails you can't tell which step broke, and nothing can be reused alone. Follow the instructor's best practice: one job per node."
    },
    {
      "zh": "`add_node(\"step_1\", step_1())` 多写了括号：Python 会先**调用** `step_1()`，因为没传状态，立刻报 `TypeError: step_1() missing 1 required positional argument`；就算调用成功，交给图的也只是返回值而不是函数本身。要写 `add_node(\"step_1\", step_1)`。",
      "en": "`add_node(\"step_1\", step_1())` with parentheses: Python **calls** `step_1()` first and, with no state passed, fails at once with `TypeError: step_1() missing 1 required positional argument`; even if the call worked, the graph would get the result, not the function. Write `add_node(\"step_1\", step_1)`."
    },
    {
      "zh": "在节点里直接改 `state[\"x\"] = ...` 却不返回——LangGraph 不会保存这种修改（实测 1.2 版）。要 `return {\"x\": ...}`。反过来，原地 `state[\"items\"].append(...)` 却会漏进状态，结果更难排查，同样要避免。",
      "en": "Setting `state[\"x\"] = ...` inside a node without returning it – LangGraph does not keep that change (tested on 1.2). `return {\"x\": ...}` instead. Conversely, an in-place `state[\"items\"].append(...)` does leak into the state, which is even harder to debug – avoid it too."
    },
    {
      "zh": "以为条件边是节点的一部分，在节点里 `return \"step_2\"` 想跳过去：LangGraph 会报 `InvalidUpdateError: Expected dict`（实测 1.2 版）。节点返回状态更新的字典，去哪由边（条件边的判断函数）决定。第 35 节还会见到进阶写法 `Command(goto=...)`，让节点在更新状态的同时指定下一步。",
      "en": "Treating a conditional edge as part of a node and writing `return \"step_2\"` to jump there: LangGraph raises `InvalidUpdateError: Expected dict` (tested on 1.2). A node returns a dict of state updates, and the edge (the conditional edge's routing function) decides where to go. Lesson 35 shows an advanced form, `Command(goto=...)`, which lets a node update the state and name the next step at once."
    },
    {
      "zh": "循环没有退出条件。LangGraph 最终会报 `GraphRecursionError`，但 1.2 版默认上限约一万步——如果每一步都调用模型，费用会很可观。要在条件边里自己设轮数上限。",
      "en": "A loop with no way out. LangGraph eventually raises `GraphRecursionError`, but 1.2's default limit is about ten thousand steps – costly if each step calls a model. Cap the rounds yourself in the conditional edge."
    }
  ],
  "recap": [
    {
      "zh": "Graph 的三个核心概念：节点（基本单元）、边（连接节点的箭头）、图（节点 + 连接关系 = 整个流程）。",
      "en": "The three core ideas: node (the basic unit), edge (an arrow between nodes), graph (nodes + connections = the whole workflow)."
    },
    {
      "zh": "节点最佳实践：一个节点只做一件事，有输入有输出；里面可以是函数、API 调用、模型调用。",
      "en": "Node best practice: one job per node, with an input and an output; inside, a function, an API call or a model call."
    },
    {
      "zh": "普通边 = 固定的下一步；条件边 = 走到这里按条件分岔。图可以是直线，也可以有分支和循环。",
      "en": "Normal edge = a fixed next step; conditional edge = fork on a condition. A graph can be straight, or branch and loop."
    },
    {
      "zh": "图本身是一种计算范式，跟 AI 无关：运行规则就是「执行节点 → 合并更新 → 沿边前进，直到 END」。",
      "en": "A graph is a computing paradigm with no AI required: run the node → merge the update → follow the edge, until END."
    },
    {
      "zh": "可控制性：先写第一个 LangGraph（27 节），再学基本控制（串行、分支、条件分支与循环，28 节）和精细控制（运行时配置、map-reduce，29 节）。",
      "en": "Controllability: first a hello-world LangGraph (lesson 27), then basic control (sequences, branches, conditional branches & loops, lesson 28) and fine control (runtime configuration, map-reduce, lesson 29)."
    }
  ],
  "files": [
    {
      "path": "practice/l26_toy_graph_todo.py",
      "zh": "练习：补全纯 Python 的迷你图运行器，再给「写稿 → 审核」加上条件边（有 TODO 提示，不需要 API key）。",
      "en": "Exercise: complete a plain-Python mini graph runner, then add a conditional edge to “write → review” (TODO hints, no API key needed)."
    },
    {
      "path": "practice/l26_toy_graph_solution.py",
      "zh": "上面练习的参考答案。",
      "en": "Reference solution for the exercise above."
    },
    {
      "path": "practice/l26_real_graph_preview.py",
      "zh": "预览：把 step_1 → step_2 → step_3 交给真正的 LangGraph 运行，并打印 Mermaid 图（不调用模型、不需要 API key）。",
      "en": "Preview: run step_1 → step_2 → step_3 in real LangGraph and print the Mermaid diagram (no model calls, no API key)."
    }
  ]
});
