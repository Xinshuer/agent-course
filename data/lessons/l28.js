COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l28",
  "priority": "core",
  "handwrite": true,
  "studyMinutes": 50,
  "source": "subtitle",
  "summary": {
    "zh": "跟着视频用四张小图学会 LangGraph 的基本控制：串行（step_1 → step_2 → step_3，后面的节点读前面写的值）；分支（a 同时连到 b 和 c，再汇合到 d，并行写同一字段时用 `Annotated[list, operator.add]` 合并）；条件分支与循环（路由函数看列表长度决定回到 b 还是结束，用 `recursion_limit` 防止停不下来）；以及带分支的循环（`add_edge([\"c\", \"d\"], \"a\")` 等两条路都完成再继续）。所有节点都不调模型。",
    "en": "Four small graphs from the video teach LangGraph's basic control: a sequence (step_1 → step_2 → step_3, later nodes reading what earlier ones wrote); a branch (a fans out to b and c, which meet again at d; parallel writes to one field are merged with `Annotated[list, operator.add]`); a conditional loop (a routing function checks the list length to go back to b or finish, with `recursion_limit` as a brake); and a loop with a branch (`add_edge([\"c\", \"d\"], \"a\")` waits for both paths). No node calls a model."
  },
  "goals": [
    {
      "zh": "用 `add_edge` 把节点串成 `START → … → END` 的串行图，说清后面的节点怎样读到前面写的值",
      "en": "Chain nodes into a `START → … → END` sequence with `add_edge` and explain how later nodes read earlier values"
    },
    {
      "zh": "让一个节点连出多条边形成分支，用 `Annotated[list, operator.add]` 合并同一步里的多个写入",
      "en": "Fan out from one node with several edges and merge same-step writes with `Annotated[list, operator.add]`"
    },
    {
      "zh": "用 `add_conditional_edges` 和路由函数（返回值标注 `Literal`）做条件分支，让边指回前面形成循环",
      "en": "Branch with `add_conditional_edges` and a routing function annotated with `Literal`, and loop by pointing back"
    },
    {
      "zh": "用 `invoke` 的第二个参数设置 `recursion_limit`，认识 `GraphRecursionError`",
      "en": "Set `recursion_limit` in `invoke`'s second argument and recognise `GraphRecursionError`"
    },
    {
      "zh": "看懂 `add_edge([\"c\", \"d\"], \"a\")`：两条分支都完成后才继续",
      "en": "Read `add_edge([\"c\", \"d\"], \"a\")`: continue only once both branches are done"
    },
    {
      "zh": "不看资料，手写出分支图和条件循环图",
      "en": "Write a branching graph and a conditional loop from memory"
    }
  ],
  "blocks": [
    {
      "t": "video",
      "zh": "这一集约 19 分钟，依次演示四张图：**串行 → 分支 → 条件分支与循环 → 带分支的循环**。所有节点都不调用模型，只返回写死的字母或数字，好让你专心看「边」如何决定执行顺序；每张图都先画出来看结构，再调用看结果。从条件分支开始，老师直接粘贴写好的代码来讲解。下面的代码和视频里的例子一致。",
      "en": "This ~19-minute episode walks through four graphs: **sequence → branch → conditional branch & loop → loop with a branch**. No node calls a model; they return hard-coded letters or numbers so you can focus on how edges decide the order. Each graph is drawn first, then run. From the conditional branch on, the instructor pastes prepared code and explains it. The code below follows the video's examples."
    },
    {
      "t": "h",
      "zh": "一、串行控制：一条线走到底",
      "en": "1. Sequences: one line from start to end"
    },
    {
      "t": "p",
      "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=0) 串行就是把几个节点**首尾相连**：上一个做完，下一个接着做。[▶ 01:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=61) 视频的状态有两个字段：`value_1`（字符串）和 `value_2`。[▶ 01:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=92) 然后写三个节点：\n- `step_1`：直接返回 `\"a\"`（写死的值）\n- `step_2`：先读出 `step_1` 写进去的 `value_1`，在后面加上 `\" b\"`\n- `step_3`：把 `value_2` 设成 10\n\n`step_2` 能读到 `step_1` 的结果，是因为它们共享同一份 state：这就是「数据在节点之间流动」。\n\n两处和视频略有不同：老师口头说 `value_2` 也是字符串，可 `step_3` 写进去的是数字 10，所以讲义把它标成 `int`（`TypedDict` 运行时不检查，标成 `str` 也照样能跑，这正是 27 节说的「只是一份说明」）；老师还提议在 `step_2` 里用加号代替空格，让结果更醒目，所以视频里的结果读作「A 加 B」，讲义保留空格，结果是 `'a b'`。",
      "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=0) A sequence links nodes **end to end**: when one finishes, the next starts. [▶ 01:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=61) The video's state has two fields, `value_1` (a string) and `value_2`. [▶ 01:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=92) Then come three nodes:\n- `step_1`: returns `\"a\"` (hard-coded)\n- `step_2`: reads the `value_1` that `step_1` wrote and appends `\" b\"`\n- `step_3`: sets `value_2` to 10\n\n`step_2` can see `step_1`'s result because they share one state: that's “data flowing between nodes”.\n\nTwo small differences from the video: the instructor says `value_2` is a string too, but `step_3` writes the number 10, so these notes annotate it as `int` (`TypedDict` isn't checked at run time, so `str` would run just as well – the “only a description” point from lesson 27); and he suggests a plus sign instead of the space in `step_2` to make the result stand out, so in the video it reads “a plus b”, while the notes keep the space and get `'a b'`."
    },
    {
      "t": "code",
      "file": "sequence.py",
      "code": {
        "zh": "from typing_extensions import TypedDict\nfrom langgraph.graph import StateGraph, START, END\n\nclass State(TypedDict):\n    value_1: str\n    value_2: int\n\ndef step_1(state: State):\n    return {\"value_1\": \"a\"}                      # 写死返回 \"a\"\n\ndef step_2(state: State):\n    current_value_1 = state[\"value_1\"]           # 读出 step_1 写进去的值\n    return {\"value_1\": f\"{current_value_1} b\"}\n\ndef step_3(state: State):\n    return {\"value_2\": 10}\n\nbuilder = StateGraph(State)\nbuilder.add_node(step_1)\nbuilder.add_node(step_2)\nbuilder.add_node(step_3)\nbuilder.add_edge(START, \"step_1\")                # 从入口到 step_1\nbuilder.add_edge(\"step_1\", \"step_2\")\nbuilder.add_edge(\"step_2\", \"step_3\")\nbuilder.add_edge(\"step_3\", END)                  # 视频后来补上的结束边\ngraph = builder.compile()\n\nprint(graph.invoke({\"value_1\": \"c\"}))\n# {'value_1': 'a b', 'value_2': 10}",
        "en": "from typing_extensions import TypedDict\nfrom langgraph.graph import StateGraph, START, END\n\nclass State(TypedDict):\n    value_1: str\n    value_2: int\n\ndef step_1(state: State):\n    return {\"value_1\": \"a\"}                      # always returns \"a\"\n\ndef step_2(state: State):\n    current_value_1 = state[\"value_1\"]           # read what step_1 wrote\n    return {\"value_1\": f\"{current_value_1} b\"}\n\ndef step_3(state: State):\n    return {\"value_2\": 10}\n\nbuilder = StateGraph(State)\nbuilder.add_node(step_1)\nbuilder.add_node(step_2)\nbuilder.add_node(step_3)\nbuilder.add_edge(START, \"step_1\")                # from the entry to step_1\nbuilder.add_edge(\"step_1\", \"step_2\")\nbuilder.add_edge(\"step_2\", \"step_3\")\nbuilder.add_edge(\"step_3\", END)                  # the exit edge the video adds later\ngraph = builder.compile()\n\nprint(graph.invoke({\"value_1\": \"c\"}))\n# {'value_1': 'a b', 'value_2': 10}"
      },
      "note": {
        "zh": "本地运行：`practice/l28_sequence_branch.py`（串行和分支两部分都在里面，不需要 API key）。",
        "en": "Run locally: `practice/l28_sequence_branch.py` (both the sequence and the branch, no API key)."
      }
    },
    {
      "t": "p",
      "zh": "[▶ 04:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=254) 建图时用 `add_edge(起点, 终点)` 连边，一条边就是一个箭头。节点名是**字符串**，要加引号（视频里自动补全漏了引号，老师手动补上）；`START`、`END` 是从 `langgraph.graph` 导入的常量，不加引号。[▶ 05:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=315) `compile()` 把图编译成一个 Runnable（可运行对象），所以能用 `invoke` 调用，也能用 `stream` 一步步地拿结果。\n\n[▶ 06:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=375) 调用时传入 `{\"value_1\": \"c\"}`，结果却是 `{'value_1': 'a b', 'value_2': 10}`。传进去的 `c` 去哪了？`step_1` 返回的 `\"a\"` 把它**覆盖**了，`step_2` 再在 `a` 后面加上 ` b`；`value_2` 由 `step_3` 写入。普通字段的规则就是「后写的覆盖先写的」。",
      "en": "[▶ 04:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=254) Edges are added with `add_edge(source, target)`; each edge is one arrow. Node names are **strings** and need quotes (the editor's autocomplete dropped them in the video and the instructor added them back); `START` and `END` are constants imported from `langgraph.graph`, without quotes. [▶ 05:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=315) `compile()` turns the graph into a Runnable, so you can call it with `invoke`, or with `stream` to get results step by step.\n\n[▶ 06:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=375) The call passes `{\"value_1\": \"c\"}`, yet the result is `{'value_1': 'a b', 'value_2': 10}`. Where did `c` go? `step_1`'s `\"a\"` **overwrote** it, then `step_2` appended ` b`; `value_2` came from `step_3`. For a plain field, the later write wins."
    },
    {
      "t": "note",
      "zh": "[▶ 07:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=437) 视频随后补了一条 `add_edge(\"step_3\", END)`，让图「有开始也有结束」，结果不变。在 1.2.12 里，不写这条边时图在 `step_3` 之后也会结束，画出来同样有 `step_3 → __end__`；不过写上 `END` 更清楚，建议总是写。",
      "en": "[▶ 07:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=437) The video then adds `add_edge(\"step_3\", END)` so the graph has a clear start and end; the result is unchanged. In 1.2.12 the graph also ends after `step_3` without that edge, and the drawing shows `step_3 → __end__` either way, but writing `END` is clearer, so always do it."
    },
    {
      "t": "check",
      "q": {
        "zh": "调用 `graph.invoke({\"value_1\": \"c\"})` 时，`step_2` 里的 `state[\"value_1\"]` 是什么？",
        "en": "When calling `graph.invoke({\"value_1\": \"c\"})`, what is `state[\"value_1\"]` inside `step_2`?"
      },
      "options": [
        {
          "zh": "`\"c\"`",
          "en": "`\"c\"`"
        },
        {
          "zh": "`\"a\"`",
          "en": "`\"a\"`"
        },
        {
          "zh": "`\"c a\"`",
          "en": "`\"c a\"`"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "`step_1` 先执行，返回的 `\"a\"` 覆盖了输入的 `\"c\"`，所以 `step_2` 读到的是 `\"a\"`，再改成 `\"a b\"`。",
        "en": "`step_1` runs first and its `\"a\"` overwrites the input `\"c\"`, so `step_2` reads `\"a\"` and turns it into `\"a b\"`."
      }
    },
    {
      "t": "h",
      "zh": "二、分支控制：一个节点连出两条边",
      "en": "2. Branches: two edges out of one node"
    },
    {
      "t": "p",
      "zh": "[▶ 07:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=469) 分支就是让一个节点**同时**连出多条边。视频的例子：`a` 之后同时去 `b` 和 `c`，两条路再一起汇合到 `d`。\n\n这次的状态只有一个字段 `aggregate`（一个列表），四个节点各往里面加一个大写字母。[▶ 08:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=534) 老师特别提醒：这个字段用 `Annotated` 来写。",
      "en": "[▶ 07:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=469) A branch means one node has **several** outgoing edges at once. In the video, `a` goes to both `b` and `c`, and the two paths meet again at `d`.\n\nThis time the state has a single field, `aggregate` (a list), and each of the four nodes adds one capital letter to it. [▶ 08:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=534) The instructor stresses that this field is written with `Annotated`."
    },
    {
      "t": "py",
      "title": {
        "zh": "Annotated 和 operator.add：给类型挂上「附加说明」",
        "en": "Annotated and operator.add: attaching extra info to a type"
      },
      "zh": "- `Annotated[类型, 附加信息]` 来自 `typing`：第一个参数是真正的类型，后面可以挂任意附加信息（元数据）。老师特别强调：挂上去的附加信息**不会改变**类型本身，类型检查工具照常把它当 `list` 看，Python 也不理会它，这些信息是**留给框架读取**的。\n- `operator` 是标准库模块，把运算符做成了函数：`operator.add(x, y)` 就是 `x + y`。两个列表相加 = 拼接成一个新列表。\n\n所以 `aggregate: Annotated[list, operator.add]` 的意思是：`aggregate` 是一个列表；LangGraph 收到对它的更新时，不要覆盖，而是用 `operator.add` 把新列表拼到旧列表后面。这个合并函数叫 **reducer**。注意写的是 `operator.add`（函数本身），不是 `operator.add()`。",
      "en": "- `Annotated[type, extra]` comes from `typing`: the first argument is the real type, and any extra information (metadata) can follow. As the instructor stresses, the attached information **doesn't change** the type itself: type checkers still see a `list`, Python ignores it, and it is **left for frameworks to read**.\n- `operator` is a standard module that turns operators into functions: `operator.add(x, y)` is `x + y`. Adding two lists joins them into a new list.\n\nSo `aggregate: Annotated[list, operator.add]` means: `aggregate` is a list, and when LangGraph receives an update for it, it should not overwrite but join the new list onto the old one with `operator.add`. Such a merge function is called a **reducer**. Note it's `operator.add` (the function itself), not `operator.add()`.",
      "code": {
        "zh": "import operator\nfrom typing import Annotated, TypedDict, get_type_hints\n\nprint(operator.add(1, 2))              # 3，就是 1 + 2\nprint(operator.add([\"A\"], [\"B\"]))      # ['A', 'B']：两个列表相加 = 拼接\n\nclass State(TypedDict):\n    aggregate: Annotated[list, operator.add]   # 类型是 list，附加信息是 operator.add\n\nhints = get_type_hints(State, include_extras=True)\nprint(hints[\"aggregate\"].__metadata__)  # 附加信息就挂在这里，LangGraph 从这里读到合并函数\n\n# 合并时 LangGraph 做的事，大致相当于：\naggregate = [\"A\"]\nfor update in ([\"B\"], [\"C\"]):           # 同一步里 b、c 各自返回的列表\n    aggregate = operator.add(aggregate, update)\nprint(aggregate)                        # ['A', 'B', 'C']",
        "en": "import operator\nfrom typing import Annotated, TypedDict, get_type_hints\n\nprint(operator.add(1, 2))              # 3 - the same as 1 + 2\nprint(operator.add([\"A\"], [\"B\"]))      # ['A', 'B']: adding two lists joins them\n\nclass State(TypedDict):\n    aggregate: Annotated[list, operator.add]   # the type is list, the extra info is operator.add\n\nhints = get_type_hints(State, include_extras=True)\nprint(hints[\"aggregate\"].__metadata__)  # the extra info lives here; LangGraph reads the merge function from it\n\n# Roughly what LangGraph does when merging:\naggregate = [\"A\"]\nfor update in ([\"B\"], [\"C\"]):           # the lists returned by b and c in the same step\n    aggregate = operator.add(aggregate, update)\nprint(aggregate)                        # ['A', 'B', 'C']"
      }
    },
    {
      "t": "p",
      "zh": "[▶ 10:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=630) 连边时从 `a` 出发写两条：`add_edge(\"a\", \"b\")` 和 `add_edge(\"a\", \"c\")`（老师提醒别照着自动补全写成一条直线），再让 `b`、`c` 都连到 `d`。画出来就能看到 `a` 分叉成 `b`、`c`，再汇合到 `d`。",
      "en": "[▶ 10:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=630) Two edges leave `a`: `add_edge(\"a\", \"b\")` and `add_edge(\"a\", \"c\")` (the instructor warns not to follow the autocomplete into a straight line), and both `b` and `c` connect to `d`. The drawing shows `a` forking into `b` and `c`, which meet again at `d`."
    },
    {
      "t": "code",
      "file": "branch.py",
      "code": {
        "zh": "import operator\nfrom typing import Annotated\nfrom typing_extensions import TypedDict\nfrom langgraph.graph import StateGraph, START, END\n\nclass State(TypedDict):\n    aggregate: Annotated[list, operator.add]   # 返回的列表拼接到后面，而不是覆盖\n\ndef a(state: State):\n    print(f'Adding \"A\" to {state[\"aggregate\"]}')\n    return {\"aggregate\": [\"A\"]}\n\ndef b(state: State):\n    print(f'Adding \"B\" to {state[\"aggregate\"]}')\n    return {\"aggregate\": [\"B\"]}\n\ndef c(state: State):\n    print(f'Adding \"C\" to {state[\"aggregate\"]}')\n    return {\"aggregate\": [\"C\"]}\n\ndef d(state: State):\n    print(f'Adding \"D\" to {state[\"aggregate\"]}')\n    return {\"aggregate\": [\"D\"]}\n\nbuilder = StateGraph(State)\nbuilder.add_node(a)\nbuilder.add_node(b)\nbuilder.add_node(c)\nbuilder.add_node(d)\nbuilder.add_edge(START, \"a\")\nbuilder.add_edge(\"a\", \"b\")       # a 连出两条边：分叉\nbuilder.add_edge(\"a\", \"c\")\nbuilder.add_edge(\"b\", \"d\")       # 两条路都汇合到 d\nbuilder.add_edge(\"c\", \"d\")\nbuilder.add_edge(\"d\", END)\ngraph = builder.compile()\n\nprint(graph.invoke({\"aggregate\": []}, {\"configurable\": {\"thread_id\": \"foo\"}}))\n# Adding \"A\" to []\n# Adding \"B\" to ['A']\n# Adding \"C\" to ['A']\n# Adding \"D\" to ['A', 'B', 'C']\n# {'aggregate': ['A', 'B', 'C', 'D']}",
        "en": "import operator\nfrom typing import Annotated\nfrom typing_extensions import TypedDict\nfrom langgraph.graph import StateGraph, START, END\n\nclass State(TypedDict):\n    aggregate: Annotated[list, operator.add]   # returned lists are joined on, not overwritten\n\ndef a(state: State):\n    print(f'Adding \"A\" to {state[\"aggregate\"]}')\n    return {\"aggregate\": [\"A\"]}\n\ndef b(state: State):\n    print(f'Adding \"B\" to {state[\"aggregate\"]}')\n    return {\"aggregate\": [\"B\"]}\n\ndef c(state: State):\n    print(f'Adding \"C\" to {state[\"aggregate\"]}')\n    return {\"aggregate\": [\"C\"]}\n\ndef d(state: State):\n    print(f'Adding \"D\" to {state[\"aggregate\"]}')\n    return {\"aggregate\": [\"D\"]}\n\nbuilder = StateGraph(State)\nbuilder.add_node(a)\nbuilder.add_node(b)\nbuilder.add_node(c)\nbuilder.add_node(d)\nbuilder.add_edge(START, \"a\")\nbuilder.add_edge(\"a\", \"b\")       # two edges leave a: a fork\nbuilder.add_edge(\"a\", \"c\")\nbuilder.add_edge(\"b\", \"d\")       # both paths meet again at d\nbuilder.add_edge(\"c\", \"d\")\nbuilder.add_edge(\"d\", END)\ngraph = builder.compile()\n\nprint(graph.invoke({\"aggregate\": []}, {\"configurable\": {\"thread_id\": \"foo\"}}))\n# Adding \"A\" to []\n# Adding \"B\" to ['A']\n# Adding \"C\" to ['A']\n# Adding \"D\" to ['A', 'B', 'C']\n# {'aggregate': ['A', 'B', 'C', 'D']}"
      }
    },
    {
      "t": "p",
      "zh": "[▶ 12:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=755) 看打印出来的过程：`b` 和 `c` 看到的都是 `['A']`。它们在**同一步**里执行（并行），谁也看不到对方的结果；这一步结束后，LangGraph 用 `operator.add` 把两个返回的列表都拼进 `aggregate`，所以 `d` 看到的是 `['A', 'B', 'C']`。",
      "en": "[▶ 12:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=755) Look at the printed trace: `b` and `c` both see `['A']`. They run in the **same step** (in parallel) and can't see each other's result; when the step ends, LangGraph joins both returned lists into `aggregate` with `operator.add`, so `d` sees `['A', 'B', 'C']`."
    },
    {
      "t": "warn",
      "zh": "如果把 `aggregate` 写成普通的 `list`（不加 `Annotated`），`b` 和 `c` 在同一步里都要写它，LangGraph 不知道该留哪个，直接报错：`InvalidUpdateError: At key 'aggregate': Can receive only one value per step. Use an Annotated key to handle multiple values.`（1.2.12 实测）。串行时没有这个问题，因为每一步只有一个节点在写。",
      "en": "Write `aggregate` as a plain `list` (no `Annotated`) and `b` and `c` both write it in the same step; LangGraph can't choose and raises `InvalidUpdateError: At key 'aggregate': Can receive only one value per step. Use an Annotated key to handle multiple values.` (tested on 1.2.12). Sequences don't have this problem, since only one node writes per step."
    },
    {
      "t": "note",
      "zh": "视频调用时还传了第二个参数 `{\"configurable\": {\"thread_id\": \"foo\"}}`，用来演示 `invoke` 的第二个参数是「运行配置」。在这张图里它不起作用：`thread_id` 要配合 30、31 节的持久化才有意义，去掉它结果完全一样。下面的 `recursion_limit` 也放在这个参数里。",
      "en": "The video also passes a second argument, `{\"configurable\": {\"thread_id\": \"foo\"}}`, to show that `invoke`'s second argument is the run configuration. It does nothing in this graph: `thread_id` only matters with the persistence of lessons 30–31, and removing it changes nothing. `recursion_limit` below goes into the same argument."
    },
    {
      "t": "check",
      "q": {
        "zh": "`d` 执行时看到的 `aggregate` 是什么？",
        "en": "What `aggregate` does `d` see when it runs?"
      },
      "options": [
        {
          "zh": "`['A', 'B']`",
          "en": "`['A', 'B']`"
        },
        {
          "zh": "`['A', 'C']`",
          "en": "`['A', 'C']`"
        },
        {
          "zh": "`['A', 'B', 'C']`",
          "en": "`['A', 'B', 'C']`"
        },
        {
          "zh": "`['A', 'B', 'C', 'D']`",
          "en": "`['A', 'B', 'C', 'D']`"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "`b`、`c` 同一步执行完后，两者的结果都被拼进列表，`d` 才开始执行；`D` 是 `d` 自己返回的，执行时还没加进去。",
        "en": "Once `b` and `c` finish their step, both results are joined into the list, and only then does `d` run; `D` is what `d` itself returns, so it isn't there yet."
      }
    },
    {
      "t": "h",
      "zh": "三、条件分支与循环",
      "en": "3. Conditional branches and loops"
    },
    {
      "t": "p",
      "zh": "[▶ 13:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=787) 普通边总是去同一个地方；**条件边**在运行时看状态决定去哪：\n\n`builder.add_conditional_edges(\"a\", route)`\n\n意思是：`a` 执行完后调用 `route(state)`，它返回哪个节点名，就去哪个节点。`route` 叫**路由函数**。视频里把它说成一个「route 节点」，其实它不是节点（图上没有叫 route 的方框），只负责「指路」：返回下一个节点的名字或 `END`，不修改状态。\n\n例子只有 `a`、`b` 两个节点：`a` 之后，列表长度不到 7 就去 `b`，否则结束；`b` 之后回到 `a`。`b → a` 这条边指回了前面的节点，于是形成**循环**。",
      "en": "[▶ 13:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=787) A plain edge always goes to the same place; a **conditional edge** decides at run time by looking at the state:\n\n`builder.add_conditional_edges(\"a\", route)`\n\nAfter `a` runs, `route(state)` is called and the graph goes to whichever node name it returns. `route` is a **routing function**. The video calls it a “route node”, but it isn't a node (there's no route box in the drawing); it only points the way: it returns the next node's name or `END` and never changes the state.\n\nThe example has just `a` and `b`: after `a`, go to `b` while the list is shorter than 7, otherwise finish; after `b`, go back to `a`. The edge `b → a` points back to an earlier node, which makes a **loop**."
    },
    {
      "t": "py",
      "title": {
        "zh": "Literal：把「只能是这几个值」写进类型",
        "en": "Literal: “only these values” as a type"
      },
      "zh": "`Literal[\"b\", END]` 来自 `typing`，意思是「值只能是 `\"b\"` 或 `END`」。写在函数的返回值上：`def route(state) -> Literal[\"b\", END]:`（`->` 后面写返回值的类型）。LangGraph 的 `END` 其实就是字符串 `\"__end__\"`。\n\n写它有两个好处：LangGraph 读这个标注就知道条件边可能通向哪些节点，**画图才完整**；编辑器也能帮你发现拼写错误。但和 `TypedDict` 一样，Python 运行时**不检查**：下面的 `sloppy` 返回了清单外的值，Python 照样运行。",
      "en": "`Literal[\"b\", END]` from `typing` means “the value can only be `\"b\"` or `END`”. Put it on a function's return: `def route(state) -> Literal[\"b\", END]:` (`->` introduces the return type). LangGraph's `END` is really the string `\"__end__\"`.\n\nTwo benefits: LangGraph reads the annotation to learn where the conditional edge can lead, so **the drawing is complete**, and your editor can catch typos. Like `TypedDict`, though, Python does **not** check it at run time: `sloppy` below returns something outside the list and Python runs it anyway.",
      "code": {
        "zh": "from typing import Literal, get_args\n\nEND = \"__end__\"                  # LangGraph 的 END 其实就是这个字符串\n\ndef route(length: int) -> Literal[\"b\", END]:\n    if length < 7:\n        return \"b\"\n    else:\n        return END\n\nprint(get_args(Literal[\"b\", END]))    # ('b', '__end__')：框架就是从这里读出所有可能的去向\nfor n in [1, 6, 7]:\n    print(n, \"->\", route(n))\n\ndef sloppy(length: int) -> Literal[\"b\", END]:\n    return \"bb\"                  # 拼错了，Python 自己照样运行\nprint(sloppy(1))",
        "en": "from typing import Literal, get_args\n\nEND = \"__end__\"                  # LangGraph's END is really just this string\n\ndef route(length: int) -> Literal[\"b\", END]:\n    if length < 7:\n        return \"b\"\n    else:\n        return END\n\nprint(get_args(Literal[\"b\", END]))    # ('b', '__end__'): a framework reads every possible target here\nfor n in [1, 6, 7]:\n    print(n, \"->\", route(n))\n\ndef sloppy(length: int) -> Literal[\"b\", END]:\n    return \"bb\"                  # a typo, yet Python itself runs it\nprint(sloppy(1))"
      }
    },
    {
      "t": "code",
      "file": "loop.py",
      "code": {
        "zh": "import operator\nfrom typing import Annotated, Literal\nfrom typing_extensions import TypedDict\nfrom langgraph.graph import StateGraph, START, END\n\nclass State(TypedDict):\n    aggregate: Annotated[list, operator.add]\n\ndef a(state: State):\n    print(f'Node A sees {state[\"aggregate\"]}')\n    return {\"aggregate\": [\"A\"]}\n\ndef b(state: State):\n    print(f'Node B sees {state[\"aggregate\"]}')\n    return {\"aggregate\": [\"B\"]}\n\nbuilder = StateGraph(State)\nbuilder.add_node(a)\nbuilder.add_node(b)\n\n# 路由函数：看状态决定下一步，返回节点名或 END\ndef route(state: State) -> Literal[\"b\", END]:\n    if len(state[\"aggregate\"]) < 7:\n        return \"b\"\n    else:\n        return END\n\nbuilder.add_edge(START, \"a\")\nbuilder.add_conditional_edges(\"a\", route)   # a 之后去哪，由 route 决定\nbuilder.add_edge(\"b\", \"a\")                  # b 指回 a：循环\ngraph = builder.compile()\n\nprint(graph.invoke({\"aggregate\": []}))\n# Node A sees []\n# Node B sees ['A']\n# Node A sees ['A', 'B']\n# ...（A、B 交替）\n# Node A sees ['A', 'B', 'A', 'B', 'A', 'B']\n# {'aggregate': ['A', 'B', 'A', 'B', 'A', 'B', 'A']}",
        "en": "import operator\nfrom typing import Annotated, Literal\nfrom typing_extensions import TypedDict\nfrom langgraph.graph import StateGraph, START, END\n\nclass State(TypedDict):\n    aggregate: Annotated[list, operator.add]\n\ndef a(state: State):\n    print(f'Node A sees {state[\"aggregate\"]}')\n    return {\"aggregate\": [\"A\"]}\n\ndef b(state: State):\n    print(f'Node B sees {state[\"aggregate\"]}')\n    return {\"aggregate\": [\"B\"]}\n\nbuilder = StateGraph(State)\nbuilder.add_node(a)\nbuilder.add_node(b)\n\n# routing function: looks at the state, returns a node name or END\ndef route(state: State) -> Literal[\"b\", END]:\n    if len(state[\"aggregate\"]) < 7:\n        return \"b\"\n    else:\n        return END\n\nbuilder.add_edge(START, \"a\")\nbuilder.add_conditional_edges(\"a\", route)   # route decides what follows a\nbuilder.add_edge(\"b\", \"a\")                  # b points back to a: a loop\ngraph = builder.compile()\n\nprint(graph.invoke({\"aggregate\": []}))\n# Node A sees []\n# Node B sees ['A']\n# Node A sees ['A', 'B']\n# ... (A and B take turns)\n# Node A sees ['A', 'B', 'A', 'B', 'A', 'B']\n# {'aggregate': ['A', 'B', 'A', 'B', 'A', 'B', 'A']}"
      }
    },
    {
      "t": "p",
      "zh": "[▶ 14:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=879) 运行结果：`a` 和 `b` 交替执行，`a` 跑了 4 次、`b` 跑了 3 次；列表长度到 7 时 `route` 返回 `END`，循环结束，正好 7 个字母。画出来的图里，从 `a` 出发的两条**虚线**（`a -.-> b`、`a -.-> __end__`）就是条件边的两个可能去向，`b --> a` 是指回去的实线。",
      "en": "[▶ 14:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=879) The result: `a` and `b` take turns, `a` four times and `b` three times; when the list reaches 7, `route` returns `END` and the loop ends with exactly 7 letters. In the drawing, the two **dashed** arrows from `a` (`a -.-> b`, `a -.-> __end__`) are the conditional edge's possible targets, and `b --> a` is the solid arrow back."
    },
    {
      "t": "warn",
      "zh": "路由函数标注了 `Literal` 后，LangGraph 把清单里的名字当成**全部**去向：返回清单之外的名字（比如拼错成 `\"bb\"`），运行时直接报 `KeyError`（1.2.12 实测）。以后给路由函数新增去向，记得同时改 `Literal`。",
      "en": "Once a routing function is annotated with `Literal`, LangGraph treats the listed names as **all** possible targets: returning anything else (say the typo `\"bb\"`) raises `KeyError` at run time (tested on 1.2.12). When you add a new target later, update the `Literal` too."
    },
    {
      "t": "h",
      "zh": "四、recursion_limit：防止循环停不下来",
      "en": "4. recursion_limit: stopping a loop that won't stop"
    },
    {
      "t": "p",
      "zh": "[▶ 15:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=943) 老师把这张循环图和单智能体做了对比：Agent 也是「模型 ↔ 工具」来回循环，直到得出结果。有同学反映，模型能力不够时会循环很多次，又慢又费钱。[▶ 16:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=1009) LangGraph 的办法是 `recursion_limit`（递归上限）：在 `invoke` 的**第二个参数**里写 `{\"recursion_limit\": 4}`，表示最多执行 4 步，到了还没结束就抛出 `GraphRecursionError`。",
      "en": "[▶ 15:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=943) The instructor compares this loop with a single agent: an agent also loops “model ↔ tool” until it has an answer. Learners had complained that a weak model loops many times, which is slow and expensive. [▶ 16:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=1009) LangGraph's answer is `recursion_limit`: put `{\"recursion_limit\": 4}` in `invoke`'s **second argument** to allow at most 4 steps; if the graph hasn't finished by then, it raises `GraphRecursionError`."
    },
    {
      "t": "code",
      "file": "recursion_limit.py",
      "code": {
        "zh": "from langgraph.errors import GraphRecursionError\n\ntry:\n    graph.invoke({\"aggregate\": []}, {\"recursion_limit\": 4})   # 第二个参数：最多 4 步\nexcept GraphRecursionError as e:\n    print(\"Recursion Error:\", e)\n# Node A sees []\n# Node B sees ['A']\n# Node A sees ['A', 'B']\n# Node B sees ['A', 'B', 'A']\n# Recursion Error: Recursion limit of 4 reached without hitting a stop condition. ...",
        "en": "from langgraph.errors import GraphRecursionError\n\ntry:\n    graph.invoke({\"aggregate\": []}, {\"recursion_limit\": 4})   # second argument: at most 4 steps\nexcept GraphRecursionError as e:\n    print(\"Recursion Error:\", e)\n# Node A sees []\n# Node B sees ['A']\n# Node A sees ['A', 'B']\n# Node B sees ['A', 'B', 'A']\n# Recursion Error: Recursion limit of 4 reached without hitting a stop condition. ..."
      }
    },
    {
      "t": "p",
      "zh": "这张图每一步只执行一个节点，所以 `a`、`b`、`a`、`b` 跑完 4 步就停了，和视频里看到的一样。如果同一步里有几个节点并行，它们只算一步。实测要让这张图正常跑完（7 次节点执行），`recursion_limit` 至少要设成 8。",
      "en": "Each step of this graph runs one node, so it stops after `a`, `b`, `a`, `b`, just like in the video. Nodes running in parallel within one step count as one step. Tested: for this graph to finish normally (7 node runs), `recursion_limit` must be at least 8."
    },
    {
      "t": "warn",
      "zh": "安装的 LangGraph 1.2.12 里，`recursion_limit` 的**默认值是 10007**。很多旧教程说默认 25，那是旧版本的值。也就是说，一个忘了写结束条件的循环要跑上万步才会停；如果循环里调用了模型，就是上万次付费请求。**有循环的图，一定要写好结束条件，并显式传入较小的 `recursion_limit`。**",
      "en": "In the installed LangGraph 1.2.12 the **default `recursion_limit` is 10007**. Many older tutorials say 25, the old default. So a loop without an exit condition runs ten thousand steps before stopping; with a model inside, that's ten thousand paid requests. **For any graph with a loop, write a proper exit condition and pass a small `recursion_limit` explicitly.**"
    },
    {
      "t": "h",
      "zh": "五、带分支的循环",
      "en": "5. A loop with a branch"
    },
    {
      "t": "p",
      "zh": "[▶ 17:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=1039) 最后一个例子把分支和循环合在一起：`a`、`b`、`c`、`d` 四个节点，`a` 后面接同样的条件边；`b` 之后连出两条边到 `c` 和 `d`；最后用 `add_edge([\"c\", \"d\"], \"a\")` 回到 `a`。",
      "en": "[▶ 17:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=1039) The last example combines a branch and a loop: four nodes `a`, `b`, `c`, `d`; `a` has the same conditional edge; `b` has two edges, to `c` and `d`; finally `add_edge([\"c\", \"d\"], \"a\")` leads back to `a`."
    },
    {
      "t": "code",
      "file": "loop_branch.py",
      "code": {
        "zh": "# State、route 和 a、b 同上；c、d 和 a、b 一样，打印后返回 [\"C\"]、[\"D\"]\nbuilder = StateGraph(State)\nbuilder.add_node(a)\nbuilder.add_node(b)\nbuilder.add_node(c)\nbuilder.add_node(d)\nbuilder.add_edge(START, \"a\")\nbuilder.add_conditional_edges(\"a\", route)\nbuilder.add_edge(\"b\", \"c\")              # b 之后分叉到 c 和 d\nbuilder.add_edge(\"b\", \"d\")\nbuilder.add_edge([\"c\", \"d\"], \"a\")       # 列表写法：c 和 d 都完成后才回到 a\ngraph = builder.compile()\n\nresult = graph.invoke({\"aggregate\": []})\n# Node A sees []\n# Node B sees ['A']\n# Node C sees ['A', 'B']\n# Node D sees ['A', 'B']\n# Node A sees ['A', 'B', 'C', 'D']\n# Node B sees ['A', 'B', 'C', 'D', 'A']\n# Node C sees ['A', 'B', 'C', 'D', 'A', 'B']\n# Node D sees ['A', 'B', 'C', 'D', 'A', 'B']\n# Node A sees ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D']\nprint(result)\n# {'aggregate': ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A']}",
        "en": "# State, route, a and b as above; c and d work like a and b, returning [\"C\"] and [\"D\"]\nbuilder = StateGraph(State)\nbuilder.add_node(a)\nbuilder.add_node(b)\nbuilder.add_node(c)\nbuilder.add_node(d)\nbuilder.add_edge(START, \"a\")\nbuilder.add_conditional_edges(\"a\", route)\nbuilder.add_edge(\"b\", \"c\")              # after b, fork to c and d\nbuilder.add_edge(\"b\", \"d\")\nbuilder.add_edge([\"c\", \"d\"], \"a\")       # list form: back to a once both c and d are done\ngraph = builder.compile()\n\nresult = graph.invoke({\"aggregate\": []})\n# Node A sees []\n# Node B sees ['A']\n# Node C sees ['A', 'B']\n# Node D sees ['A', 'B']\n# Node A sees ['A', 'B', 'C', 'D']\n# Node B sees ['A', 'B', 'C', 'D', 'A']\n# Node C sees ['A', 'B', 'C', 'D', 'A', 'B']\n# Node D sees ['A', 'B', 'C', 'D', 'A', 'B']\n# Node A sees ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D']\nprint(result)\n# {'aggregate': ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A']}"
      },
      "note": {
        "zh": "本地练习：`practice/l28_loops_todo.py`（参考答案 `l28_loops_solution.py`，三张循环图都在里面，会打印 Mermaid 图）。",
        "en": "Local exercise: `practice/l28_loops_todo.py` (solution `l28_loops_solution.py` contains all three loop graphs and prints their Mermaid diagrams)."
      }
    },
    {
      "t": "p",
      "zh": "[▶ 18:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=1101) 运行过程说明了两件事：\n1. `b` 之后，`c` 和 `d` **都会**执行，而且在同一步里（它们看到的列表一样）。这是分支，不是「二选一」。\n2. `add_edge([\"c\", \"d\"], \"a\")` 的**列表写法**表示：`c` 和 `d` **都完成后**才执行 `a`。\n\n每一圈加 4 个字母（A、B、C、D），而 `route` 只在 `a` 之后检查。第一圈后 `a` 看到 4 个、加完是 5 个，小于 7，再转一圈；第二圈后 `a` 看到 8 个、加完是 9 个，这时才结束。所以最终是 9 个字母：`ABCDABCDA`。",
      "en": "[▶ 18:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=1101) The trace shows two things:\n1. After `b`, **both** `c` and `d` run, in the same step (they see the same list). It's a branch, not an either/or.\n2. The **list form** `add_edge([\"c\", \"d\"], \"a\")` means `a` runs only once `c` **and** `d` have finished.\n\nEach round adds 4 letters (A, B, C, D), and `route` only checks after `a`. After the first round `a` sees 4 and makes it 5, still below 7, so another round; after the second, `a` sees 8 and makes it 9, and only then does the graph end. Hence 9 letters: `ABCDABCDA`."
    },
    {
      "t": "video",
      "zh": "[▶ 18:51](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=1131) 视频里老师把这张图讲成 `b` 之后「到 `c` **或者**到 `d`」，把列表写法解释成「可能从 `c` 来，也可能从 `d` 来」，看结果时说「是不是七次」，读到 ABCDABCD 就说结束了。按 1.2.12 实际运行：`c`、`d` 每一圈**都**执行，`a` 要等两者都完成才继续，结果是 9 个字母。以运行结果为准，自己跑一下 `practice/l28_loops_solution.py` 就能看到。",
      "en": "[▶ 18:51](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=29&t=1131) In the video the instructor describes `b` as going “to `c` **or** to `d`”, reads the list form as “coming from either `c` or `d`”, and, looking at the output, calls it “seven times” and stops reading at ABCDABCD. Running it on 1.2.12 shows otherwise: `c` and `d` **both** run every round, `a` waits for both, and the result has 9 letters. Trust the run – try `practice/l28_loops_solution.py` yourself."
    },
    {
      "t": "note",
      "zh": "在这张图里，改成分开写 `add_edge(\"c\", \"a\")` 和 `add_edge(\"d\", \"a\")`，结果一样，因为两条分支一样长，会同时到达。但如果两条分支长度不同（比如一边多一个节点），分开写会让汇合的节点执行两次（1.2.12 实测），列表写法才能保证只执行一次。所以汇合点建议用列表写法。",
      "en": "In this graph, writing `add_edge(\"c\", \"a\")` and `add_edge(\"d\", \"a\")` separately gives the same result, because both branches are equally long and arrive together. If the branches differ in length (one has an extra node), separate edges make the joining node run twice (tested on 1.2.12); only the list form guarantees one run. So use the list form for a join."
    },
    {
      "t": "h",
      "zh": "六、四种控制对照表",
      "en": "6. The four controls side by side"
    },
    {
      "t": "p",
      "zh": "| 控制方式 | 怎么写 | 要点 |\n|---|---|---|\n| 串行 | `add_edge(\"step_1\", \"step_2\")` 一条条连 | 一个接一个；普通字段后写覆盖先写 |\n| 分支 | 一个节点连出多条边 | 同一步并行执行；写同一字段要 reducer：`Annotated[list, operator.add]` |\n| 条件分支 / 循环 | `add_conditional_edges(\"a\", route)`，再让边指回前面 | 路由函数返回节点名或 `END`，标注 `Literal`；用 `recursion_limit` 兜底 |\n| 带分支的循环 | `add_edge([\"c\", \"d\"], \"a\")` | 列表里的节点都完成后才继续 |",
      "en": "| Control | How | Key point |\n|---|---|---|\n| Sequence | `add_edge(\"step_1\", \"step_2\")`, one by one | One after another; for plain fields the later write wins |\n| Branch | Several edges out of one node | Same-step parallel runs; writing one field needs a reducer: `Annotated[list, operator.add]` |\n| Conditional / loop | `add_conditional_edges(\"a\", route)`, plus an edge back | Routing returns a node name or `END`, annotated with `Literal`; `recursion_limit` as a brake |\n| Loop with a branch | `add_edge([\"c\", \"d\"], \"a\")` | Continue only once every listed node is done |"
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "串行图 `step_1 → step_2 → step_3` 用 `graph.invoke({\"value_1\": \"c\"})` 调用，结果是？",
        "en": "The sequence `step_1 → step_2 → step_3` is called with `graph.invoke({\"value_1\": \"c\"})`. The result?"
      },
      "options": [
        {
          "zh": "`{'value_1': 'c', 'value_2': 10}`",
          "en": "`{'value_1': 'c', 'value_2': 10}`"
        },
        {
          "zh": "`{'value_1': 'c a b', 'value_2': 10}`",
          "en": "`{'value_1': 'c a b', 'value_2': 10}`"
        },
        {
          "zh": "`{'value_1': 'a b', 'value_2': 10}`",
          "en": "`{'value_1': 'a b', 'value_2': 10}`"
        },
        {
          "zh": "报错，因为输入里没有 `value_2`",
          "en": "An error, because the input lacks `value_2`"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "`step_1` 用 `\"a\"` 覆盖了 `\"c\"`，`step_2` 改成 `\"a b\"`，`step_3` 写入 `value_2`。输入不必包含所有字段。",
        "en": "`step_1` overwrites `\"c\"` with `\"a\"`, `step_2` makes it `\"a b\"`, `step_3` writes `value_2`. The input needn't contain every field."
      }
    },
    {
      "q": {
        "zh": "`aggregate: Annotated[list, operator.add]` 里的 `operator.add` 起什么作用？",
        "en": "What does `operator.add` do in `aggregate: Annotated[list, operator.add]`?"
      },
      "options": [
        {
          "zh": "作为 reducer：节点返回的列表拼接到已有列表后面，而不是覆盖",
          "en": "It's the reducer: returned lists are joined onto the existing list instead of replacing it"
        },
        {
          "zh": "让 Python 在运行时检查 `aggregate` 是不是列表",
          "en": "It makes Python check at run time that `aggregate` is a list"
        },
        {
          "zh": "把列表里的字母连成一个字符串",
          "en": "It joins the letters into one string"
        },
        {
          "zh": "规定同一时间只能有一个节点写 `aggregate`",
          "en": "It allows only one node at a time to write `aggregate`"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "`Annotated` 的附加信息由 LangGraph 读取，当作合并函数；`operator.add(旧列表, 新列表)` 就是拼接。有了它，同一步里的多个写入才不会报错。",
        "en": "LangGraph reads the extra info in `Annotated` as the merge function; `operator.add(old_list, new_list)` concatenates. With it, several writes in one step no longer fail."
      }
    },
    {
      "q": {
        "zh": "分支图里 `a → b`、`a → c` 两条边都在，`c` 执行时看到的 `aggregate` 是？",
        "en": "In the branch graph with edges `a → b` and `a → c`, what `aggregate` does `c` see?"
      },
      "options": [
        {
          "zh": "`[]`",
          "en": "`[]`"
        },
        {
          "zh": "`['A', 'B']`",
          "en": "`['A', 'B']`"
        },
        {
          "zh": "`['A', 'B', 'C']`",
          "en": "`['A', 'B', 'C']`"
        },
        {
          "zh": "`['A']`",
          "en": "`['A']`"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "`b` 和 `c` 在同一步并行执行，都只看到上一步结束时的 `['A']`；它们的结果要等这一步结束才合并。",
        "en": "`b` and `c` run in the same step and both see `['A']` from the end of the previous step; their results are merged only when the step ends."
      }
    },
    {
      "q": {
        "zh": "路由函数 `route` 应该返回什么？",
        "en": "What should the routing function `route` return?"
      },
      "options": [
        {
          "zh": "一个要更新的字段字典",
          "en": "A dict of fields to update"
        },
        {
          "zh": "下一个节点函数本身",
          "en": "The next node function itself"
        },
        {
          "zh": "下一个节点的名字（字符串）或 `END`",
          "en": "The next node's name (a string) or `END`"
        },
        {
          "zh": "`True` 或 `False`",
          "en": "`True` or `False`"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "节点返回更新，路由函数返回去向。它挂在条件边上，不是节点，也不改状态。",
        "en": "Nodes return updates; routing functions return destinations. It sits on the conditional edge, isn't a node and doesn't change the state."
      }
    },
    {
      "q": {
        "zh": "循环图 `a ⇄ b`（长度到 7 结束）正常跑完要执行 7 次节点。`recursion_limit` 最少设成多少才不报错？（1.2.12 实测）",
        "en": "The loop `a ⇄ b` (ending at length 7) runs 7 nodes to finish. What is the smallest `recursion_limit` that doesn't fail? (tested on 1.2.12)"
      },
      "options": [
        {
          "zh": "4",
          "en": "4"
        },
        {
          "zh": "8",
          "en": "8"
        },
        {
          "zh": "7",
          "en": "7"
        },
        {
          "zh": "25",
          "en": "25"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "实测 7 会报 `GraphRecursionError`，8 才能跑完：这张图每步一个节点，K 步的运行需要上限至少 K+1。设置时按「最多几步」估算，再留点余量。",
        "en": "Tested: 7 raises `GraphRecursionError`, 8 finishes. Each step here runs one node, and a K-step run needs a limit of at least K+1. Estimate the maximum steps and leave some headroom."
      }
    },
    {
      "q": {
        "zh": "`builder.add_edge([\"c\", \"d\"], \"a\")` 是什么意思？",
        "en": "What does `builder.add_edge([\"c\", \"d\"], \"a\")` mean?"
      },
      "options": [
        {
          "zh": "`c` 和 `d` 都完成后才执行 `a`",
          "en": "Run `a` only once both `c` and `d` have finished"
        },
        {
          "zh": "`c` 或 `d` 任意一个完成就执行 `a`",
          "en": "Run `a` as soon as either `c` or `d` finishes"
        },
        {
          "zh": "从 `a` 同时连到 `c` 和 `d`",
          "en": "Connect `a` to both `c` and `d`"
        },
        {
          "zh": "随机选 `c` 或 `d` 中的一个执行",
          "en": "Pick one of `c` or `d` at random"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "列表写法是「汇合」：列表里的节点全部完成后，`a` 只执行一次。视频里把它说成「从 c 或从 d 来」，实际运行可以看到两者每圈都执行。",
        "en": "The list form is a join: once every listed node is done, `a` runs once. The video describes it as “from c or from d”, but the run shows both execute every round."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "分支：reducer 和连边",
        "en": "Branch: reducer and edges"
      },
      "code": {
        "zh": "import [[operator]]\nfrom typing import [[Annotated]]\n\nclass State(TypedDict):\n    aggregate: Annotated[list, operator.[[add]]]\n\nbuilder.add_edge([[START]], \"a\")\nbuilder.add_edge(\"a\", \"[[b]]\")\nbuilder.add_edge(\"a\", \"[[c]]\")\nbuilder.add_edge(\"b\", \"d\")\nbuilder.add_edge(\"c\", \"d\")\nbuilder.add_edge(\"d\", [[END]])",
        "en": "import [[operator]]\nfrom typing import [[Annotated]]\n\nclass State(TypedDict):\n    aggregate: Annotated[list, operator.[[add]]]\n\nbuilder.add_edge([[START]], \"a\")\nbuilder.add_edge(\"a\", \"[[b]]\")\nbuilder.add_edge(\"a\", \"[[c]]\")\nbuilder.add_edge(\"b\", \"d\")\nbuilder.add_edge(\"c\", \"d\")\nbuilder.add_edge(\"d\", [[END]])"
      },
      "explain": {
        "zh": "`Annotated[list, operator.add]` 让同一步的多个写入拼接；`a` 连出两条边形成分支，`b`、`c` 再汇合到 `d`。",
        "en": "`Annotated[list, operator.add]` joins same-step writes; two edges out of `a` form the branch, and `b` and `c` meet at `d`."
      }
    },
    {
      "title": {
        "zh": "条件边、循环和 recursion_limit",
        "en": "Conditional edge, loop and recursion_limit"
      },
      "code": {
        "zh": "def route(state: State) -> [[Literal]][\"b\", END]:\n    if [[len]](state[\"aggregate\"]) < 7:\n        return \"b\"\n    else:\n        return [[END]]\n\nbuilder.add_edge(START, \"a\")\nbuilder.[[add_conditional_edges]](\"a\", [[route]])\nbuilder.add_edge(\"b\", \"[[a]]\")\ngraph = builder.compile()\ngraph.invoke({\"aggregate\": []}, {\"[[recursion_limit]]\": 20})",
        "en": "def route(state: State) -> [[Literal]][\"b\", END]:\n    if [[len]](state[\"aggregate\"]) < 7:\n        return \"b\"\n    else:\n        return [[END]]\n\nbuilder.add_edge(START, \"a\")\nbuilder.[[add_conditional_edges]](\"a\", [[route]])\nbuilder.add_edge(\"b\", \"[[a]]\")\ngraph = builder.compile()\ngraph.invoke({\"aggregate\": []}, {\"[[recursion_limit]]\": 20})"
      },
      "explain": {
        "zh": "路由函数返回 `\"b\"` 或 `END`；条件边传的是路由函数本身；`b → a` 形成循环；`recursion_limit` 放在 `invoke` 的第二个参数里。",
        "en": "The routing function returns `\"b\"` or `END`; the conditional edge takes the function itself; `b → a` makes the loop; `recursion_limit` goes in `invoke`'s second argument."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：三路分支再汇合",
        "en": "Write it: a three-way branch that joins again"
      },
      "task": {
        "zh": "仿照视频的分支图，写一个更宽的分支：\n1. `State` 只有 `aggregate`，用 `Annotated[list, operator.add]`\n2. 五个节点 `a`～`e`，各返回 `{\"aggregate\": [\"自己的大写字母\"]}`\n3. 连边：`START → a`；`a` 同时连到 `b`、`c`、`d`；用**列表写法**让 `b`、`c`、`d` 都完成后到 `e`；`e → END`\n4. 用 `{\"aggregate\": []}` 运行并打印\n\n本地运行（`.venv`）应该得到 5 个字母，`A` 在最前、`E` 在最后。",
        "en": "Like the video's branch, write a wider one:\n1. `State` has only `aggregate`, as `Annotated[list, operator.add]`\n2. five nodes `a`-`e`, each returning `{\"aggregate\": [\"its capital letter\"]}`\n3. edges: `START → a`; `a` to `b`, `c` and `d`; with the **list form**, `e` runs once `b`, `c` and `d` are all done; `e → END`\n4. run with `{\"aggregate\": []}` and print\n\nLocally (`.venv`) you should get 5 letters, `A` first and `E` last."
      },
      "starter": {
        "zh": "from typing_extensions import TypedDict\nfrom langgraph.graph import StateGraph, START, END\n\n# 1. 导入 operator 和 Annotated，定义 State（aggregate 用 reducer）\n\n\n# 2. 五个节点 a、b、c、d、e，各返回自己的大写字母（放在列表里）\n\n\n# 3. 连边：START → a；a → b、c、d；b、c、d 都完成后 → e；e → END\n\n\n# 4. 运行并打印结果\n",
        "en": "from typing_extensions import TypedDict\nfrom langgraph.graph import StateGraph, START, END\n\n# 1. import operator and Annotated; define State (aggregate with a reducer)\n\n\n# 2. five nodes a, b, c, d, e, each returning its capital letter (in a list)\n\n\n# 3. edges: START → a; a → b, c, d; once b, c and d are all done → e; e → END\n\n\n# 4. run and print the result\n"
      },
      "solution": {
        "zh": "from typing_extensions import TypedDict\nfrom langgraph.graph import StateGraph, START, END\n\n# 1. 导入 operator 和 Annotated，定义 State（aggregate 用 reducer）\nimport operator\nfrom typing import Annotated\n\nclass State(TypedDict):\n    aggregate: Annotated[list, operator.add]\n\n# 2. 五个节点 a、b、c、d、e，各返回自己的大写字母（放在列表里）\ndef a(state: State):\n    return {\"aggregate\": [\"A\"]}\n\ndef b(state: State):\n    return {\"aggregate\": [\"B\"]}\n\ndef c(state: State):\n    return {\"aggregate\": [\"C\"]}\n\ndef d(state: State):\n    return {\"aggregate\": [\"D\"]}\n\ndef e(state: State):\n    return {\"aggregate\": [\"E\"]}\n\n# 3. 连边：START → a；a → b、c、d；b、c、d 都完成后 → e；e → END\nbuilder = StateGraph(State)\nfor node in [a, b, c, d, e]:\n    builder.add_node(node)\nbuilder.add_edge(START, \"a\")\nbuilder.add_edge(\"a\", \"b\")\nbuilder.add_edge(\"a\", \"c\")\nbuilder.add_edge(\"a\", \"d\")\nbuilder.add_edge([\"b\", \"c\", \"d\"], \"e\")\nbuilder.add_edge(\"e\", END)\ngraph = builder.compile()\n\n# 4. 运行并打印结果\nprint(graph.invoke({\"aggregate\": []}))",
        "en": "from typing_extensions import TypedDict\nfrom langgraph.graph import StateGraph, START, END\n\n# 1. import operator and Annotated; define State (aggregate with a reducer)\nimport operator\nfrom typing import Annotated\n\nclass State(TypedDict):\n    aggregate: Annotated[list, operator.add]\n\n# 2. five nodes a, b, c, d, e, each returning its capital letter (in a list)\ndef a(state: State):\n    return {\"aggregate\": [\"A\"]}\n\ndef b(state: State):\n    return {\"aggregate\": [\"B\"]}\n\ndef c(state: State):\n    return {\"aggregate\": [\"C\"]}\n\ndef d(state: State):\n    return {\"aggregate\": [\"D\"]}\n\ndef e(state: State):\n    return {\"aggregate\": [\"E\"]}\n\n# 3. edges: START → a; a → b, c, d; once b, c and d are all done → e; e → END\nbuilder = StateGraph(State)\nfor node in [a, b, c, d, e]:\n    builder.add_node(node)\nbuilder.add_edge(START, \"a\")\nbuilder.add_edge(\"a\", \"b\")\nbuilder.add_edge(\"a\", \"c\")\nbuilder.add_edge(\"a\", \"d\")\nbuilder.add_edge([\"b\", \"c\", \"d\"], \"e\")\nbuilder.add_edge(\"e\", END)\ngraph = builder.compile()\n\n# 4. run and print the result\nprint(graph.invoke({\"aggregate\": []}))"
      },
      "checks": [
        {
          "zh": "导入了 `operator`",
          "en": "Imports `operator`",
          "re": "^import\\s+operator"
        },
        {
          "zh": "`aggregate` 写成 `Annotated[list, operator.add]`",
          "en": "`aggregate` is `Annotated[list, operator.add]`",
          "re": "aggregate\\s*:\\s*Annotated\\[\\s*list\\s*,\\s*operator\\.add\\s*\\]"
        },
        {
          "zh": "节点返回列表形式的 `aggregate`",
          "en": "A node returns `aggregate` as a list",
          "re": "return\\s*\\{\\s*[\"']aggregate[\"']\\s*:\\s*\\["
        },
        {
          "zh": "`a` 连出三条边到 `b`、`c`、`d`",
          "en": "Three edges leave `a` for `b`, `c` and `d`",
          "re": "add_edge\\(\\s*[\"']a[\"']\\s*,\\s*[\"'][bcd][\"']\\s*\\)[\\s\\S]*add_edge\\(\\s*[\"']a[\"']\\s*,\\s*[\"'][bcd][\"']\\s*\\)[\\s\\S]*add_edge\\(\\s*[\"']a[\"']\\s*,\\s*[\"'][bcd][\"']\\s*\\)"
        },
        {
          "zh": "用列表写法汇合到 `e`",
          "en": "Joins into `e` with the list form",
          "re": "add_edge\\(\\s*\\[[^\\]]*\\]\\s*,\\s*[\"']e[\"']\\s*\\)"
        },
        {
          "zh": "`e` 连到 `END`",
          "en": "`e` connects to `END`",
          "re": "add_edge\\(\\s*[\"']e[\"']\\s*,\\s*END\\s*\\)"
        }
      ]
    },
    {
      "title": {
        "zh": "手写：条件循环 + recursion_limit",
        "en": "Write it: a conditional loop + recursion_limit"
      },
      "task": {
        "zh": "节点 `a`、`b` 已经给好。你来写：\n1. 路由函数 `route(state)`，返回值标注 `Literal[\"b\", END]`：`aggregate` 长度小于 5 时返回 `\"b\"`，否则返回 `END`\n2. 建图：`START → a`，`a` 后面接条件边，`b` 指回 `a`\n3. 用 `{\"recursion_limit\": 10}` 运行并打印结果\n4. 再用 `{\"recursion_limit\": 3}` 运行，用 `try/except GraphRecursionError` 接住错误并打印\n\n本地运行（`.venv`）第一次应该得到 `['A', 'B', 'A', 'B', 'A']`，第二次打印出递归上限的错误。",
        "en": "Nodes `a` and `b` are given. You write:\n1. the routing function `route(state)`, annotated `Literal[\"b\", END]`: return `\"b\"` while `aggregate` is shorter than 5, otherwise `END`\n2. the graph: `START → a`, a conditional edge after `a`, `b` back to `a`\n3. run with `{\"recursion_limit\": 10}` and print the result\n4. run again with `{\"recursion_limit\": 3}`, catch the error with `try/except GraphRecursionError` and print it\n\nLocally (`.venv`) the first run gives `['A', 'B', 'A', 'B', 'A']` and the second prints the recursion-limit error."
      },
      "starter": {
        "zh": "import operator\nfrom typing import Annotated, Literal\nfrom typing_extensions import TypedDict\nfrom langgraph.errors import GraphRecursionError\nfrom langgraph.graph import StateGraph, START, END\n\nclass State(TypedDict):\n    aggregate: Annotated[list, operator.add]\n\ndef a(state: State):\n    return {\"aggregate\": [\"A\"]}\n\ndef b(state: State):\n    return {\"aggregate\": [\"B\"]}\n\n# 1. 路由函数 route：长度小于 5 去 \"b\"，否则 END（返回值标注 Literal）\n\n\n# 2. 建图：START → a，a 后面接条件边，b 指回 a\n\n\n# 3. 运行时把步数上限设为 10，打印结果\n\n\n# 4. 再把步数上限设为 3 运行，用 try/except 接住 GraphRecursionError\n",
        "en": "import operator\nfrom typing import Annotated, Literal\nfrom typing_extensions import TypedDict\nfrom langgraph.errors import GraphRecursionError\nfrom langgraph.graph import StateGraph, START, END\n\nclass State(TypedDict):\n    aggregate: Annotated[list, operator.add]\n\ndef a(state: State):\n    return {\"aggregate\": [\"A\"]}\n\ndef b(state: State):\n    return {\"aggregate\": [\"B\"]}\n\n# 1. routing function route: \"b\" while the length is below 5, else END (annotate with Literal)\n\n\n# 2. build: START → a, a conditional edge after a, b back to a\n\n\n# 3. run with a step limit of 10 and print the result\n\n\n# 4. run again with a step limit of 3; catch GraphRecursionError with try/except\n"
      },
      "solution": {
        "zh": "import operator\nfrom typing import Annotated, Literal\nfrom typing_extensions import TypedDict\nfrom langgraph.errors import GraphRecursionError\nfrom langgraph.graph import StateGraph, START, END\n\nclass State(TypedDict):\n    aggregate: Annotated[list, operator.add]\n\ndef a(state: State):\n    return {\"aggregate\": [\"A\"]}\n\ndef b(state: State):\n    return {\"aggregate\": [\"B\"]}\n\n# 1. 路由函数 route：长度小于 5 去 \"b\"，否则 END（返回值标注 Literal）\ndef route(state: State) -> Literal[\"b\", END]:\n    if len(state[\"aggregate\"]) < 5:\n        return \"b\"\n    return END\n\n# 2. 建图：START → a，a 后面接条件边，b 指回 a\nbuilder = StateGraph(State)\nbuilder.add_node(a)\nbuilder.add_node(b)\nbuilder.add_edge(START, \"a\")\nbuilder.add_conditional_edges(\"a\", route)\nbuilder.add_edge(\"b\", \"a\")\ngraph = builder.compile()\n\n# 3. 运行时把步数上限设为 10，打印结果\nprint(graph.invoke({\"aggregate\": []}, {\"recursion_limit\": 10}))\n\n# 4. 再把步数上限设为 3 运行，用 try/except 接住 GraphRecursionError\ntry:\n    graph.invoke({\"aggregate\": []}, {\"recursion_limit\": 3})\nexcept GraphRecursionError as e:\n    print(\"停下来了：\", e)",
        "en": "import operator\nfrom typing import Annotated, Literal\nfrom typing_extensions import TypedDict\nfrom langgraph.errors import GraphRecursionError\nfrom langgraph.graph import StateGraph, START, END\n\nclass State(TypedDict):\n    aggregate: Annotated[list, operator.add]\n\ndef a(state: State):\n    return {\"aggregate\": [\"A\"]}\n\ndef b(state: State):\n    return {\"aggregate\": [\"B\"]}\n\n# 1. routing function route: \"b\" while the length is below 5, else END (annotate with Literal)\ndef route(state: State) -> Literal[\"b\", END]:\n    if len(state[\"aggregate\"]) < 5:\n        return \"b\"\n    return END\n\n# 2. build: START → a, a conditional edge after a, b back to a\nbuilder = StateGraph(State)\nbuilder.add_node(a)\nbuilder.add_node(b)\nbuilder.add_edge(START, \"a\")\nbuilder.add_conditional_edges(\"a\", route)\nbuilder.add_edge(\"b\", \"a\")\ngraph = builder.compile()\n\n# 3. run with a step limit of 10 and print the result\nprint(graph.invoke({\"aggregate\": []}, {\"recursion_limit\": 10}))\n\n# 4. run again with a step limit of 3; catch GraphRecursionError with try/except\ntry:\n    graph.invoke({\"aggregate\": []}, {\"recursion_limit\": 3})\nexcept GraphRecursionError as e:\n    print(\"Stopped:\", e)"
      },
      "checks": [
        {
          "zh": "路由函数返回值标注了 `Literal[...]`",
          "en": "The routing function is annotated `Literal[...]`",
          "re": "def\\s+route\\s*\\(\\s*state[^)]*\\)\\s*->\\s*Literal\\["
        },
        {
          "zh": "用 `len(...) < 5` 判断",
          "en": "Checks `len(...) < 5`",
          "re": "len\\(\\s*state\\[[\"']aggregate[\"']\\]\\s*\\)\\s*<\\s*5"
        },
        {
          "zh": "其他情况返回 `END`",
          "en": "Otherwise returns `END`",
          "re": "return\\s+END"
        },
        {
          "zh": "`a` 后面接条件边",
          "en": "A conditional edge after `a`",
          "re": "add_conditional_edges\\(\\s*[\"']a[\"']\\s*,\\s*route\\s*\\)"
        },
        {
          "zh": "`b` 指回 `a`",
          "en": "`b` points back to `a`",
          "re": "add_edge\\(\\s*[\"']b[\"']\\s*,\\s*[\"']a[\"']\\s*\\)"
        },
        {
          "zh": "运行时传入 `recursion_limit`",
          "en": "Passes `recursion_limit` when running",
          "re": "[\"']recursion_limit[\"']\\s*:\\s*\\d+"
        },
        {
          "zh": "用 `except GraphRecursionError` 接住错误",
          "en": "Catches the error with `except GraphRecursionError`",
          "re": "except\\s+GraphRecursionError"
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "节点名忘了加引号，写成 `add_edge(step_1, step_2)`：传进去的是函数，报 `TypeError`。节点名是字符串；只有 `START`、`END` 不加引号。",
      "en": "Forgetting the quotes, as in `add_edge(step_1, step_2)`: you pass functions and get a `TypeError`. Node names are strings; only `START` and `END` go without quotes."
    },
    {
      "zh": "分支里两个节点同一步写普通字段：`InvalidUpdateError: Can receive only one value per step`。给字段加 reducer：`Annotated[list, operator.add]`。",
      "en": "Two branch nodes writing a plain field in one step: `InvalidUpdateError: Can receive only one value per step`. Give the field a reducer: `Annotated[list, operator.add]`."
    },
    {
      "zh": "字段有 `operator.add`，节点却返回字符串 `{\"aggregate\": \"B\"}`：报 `TypeError: can only concatenate list (not \"str\") to list`。要返回 `[\"B\"]`。",
      "en": "The field uses `operator.add` but a node returns a string, `{\"aggregate\": \"B\"}`: `TypeError: can only concatenate list (not \"str\") to list`. Return `[\"B\"]`."
    },
    {
      "zh": "把路由函数当成节点用 `add_node` 加进图：它应该放在 `add_conditional_edges(\"a\", route)` 里，只返回去向。",
      "en": "Adding the routing function as a node with `add_node`: it belongs in `add_conditional_edges(\"a\", route)` and only returns a destination."
    },
    {
      "zh": "路由函数返回 `Literal` 清单之外的名字（拼错或新增去向忘了改）：1.2.12 报 `KeyError`。",
      "en": "A routing function returning a name outside its `Literal` (a typo, or a new target not added): `KeyError` on 1.2.12."
    },
    {
      "zh": "循环只靠默认上限兜底：1.2.12 默认 `recursion_limit` 是 10007，不是旧教程说的 25。写好结束条件，再显式传一个小的上限。",
      "en": "Relying on the default limit: 1.2.12's default `recursion_limit` is 10007, not the 25 old tutorials quote. Write an exit condition and pass a small limit explicitly."
    },
    {
      "zh": "以为 `b → c`、`b → d` 是二选一：两条普通边的目标**都会**执行。想二选一要用条件边。",
      "en": "Thinking `b → c` and `b → d` is either/or: **both** targets of plain edges run. Use a conditional edge for a choice."
    },
    {
      "zh": "汇合点分开写两条边，两条分支长度不同时汇合节点会执行两次。用 `add_edge([\"c\", \"d\"], \"a\")` 的列表写法。",
      "en": "Joining with two separate edges makes the join run twice when the branches differ in length. Use the list form `add_edge([\"c\", \"d\"], \"a\")`."
    }
  ],
  "recap": [
    {
      "zh": "串行：`add_edge` 一条条连成 `START → … → END`；普通字段后写覆盖先写，后面的节点能读到前面写的值。",
      "en": "Sequence: `add_edge` one by one into `START → … → END`; for plain fields the later write wins, and later nodes read earlier values."
    },
    {
      "zh": "分支：一个节点连出多条边，目标节点在同一步并行执行；写同一字段要 `Annotated[list, operator.add]` 这样的 reducer。",
      "en": "Branch: several edges out of one node run their targets in parallel in one step; writing one field needs a reducer like `Annotated[list, operator.add]`."
    },
    {
      "zh": "条件分支：`add_conditional_edges(\"a\", route)`，路由函数返回节点名或 `END`，返回值标注 `Literal`。",
      "en": "Conditional: `add_conditional_edges(\"a\", route)`; the routing function returns a node name or `END`, annotated with `Literal`."
    },
    {
      "zh": "循环：让边指回前面的节点，结束条件写在路由函数里。",
      "en": "Loop: an edge back to an earlier node, with the exit condition in the routing function."
    },
    {
      "zh": "`invoke(输入, {\"recursion_limit\": N})` 限制步数，超了抛 `GraphRecursionError`；1.2.12 默认 10007。",
      "en": "`invoke(input, {\"recursion_limit\": N})` caps the steps and raises `GraphRecursionError` beyond them; the 1.2.12 default is 10007."
    },
    {
      "zh": "`add_edge([\"c\", \"d\"], \"a\")`：列表里的节点都完成后才执行 `a`，而且只执行一次。",
      "en": "`add_edge([\"c\", \"d\"], \"a\")`: `a` runs once, after every listed node is done."
    }
  ],
  "files": [
    {
      "path": "practice/l28_sequence_branch.py",
      "zh": "示例：视频里的串行图和分支图，以及去掉 reducer 后的 `InvalidUpdateError`（不需要 API key）。",
      "en": "Demo: the video's sequence and branch graphs, plus the `InvalidUpdateError` without a reducer (no API key)."
    },
    {
      "path": "practice/l28_loops_todo.py",
      "zh": "练习：补全路由函数、条件边、回边和 `recursion_limit`，完成视频里的 `a ⇄ b` 循环（有 TODO 提示）。",
      "en": "Exercise: complete the routing function, conditional edge, back edge and `recursion_limit` for the video's `a ⇄ b` loop (with TODO hints)."
    },
    {
      "path": "practice/l28_loops_solution.py",
      "zh": "参考答案：条件循环、`recursion_limit=4` 的报错、带分支的循环，并打印每张图的 Mermaid 文字。",
      "en": "Solution: the conditional loop, the `recursion_limit=4` error and the loop with a branch, printing each graph's Mermaid text."
    }
  ]
});
