COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l27",
  "priority": "core",
  "handwrite": true,
  "studyMinutes": 40,
  "source": "subtitle",
  "summary": {
    "zh": "跟着视频写出第一个 LangGraph 程序：用 TypedDict 定义节点之间传递的状态（一个消息列表加一个整数字段），写一个模拟 AI 回复的节点函数，用 StateGraph 把节点放进图、设好入口、编译，画出图的结构，再用一条 HumanMessage 调用它，最后用 pretty_print 把消息打印清楚。整集没有调用大模型，重点是看清一张图的骨架。",
    "en": "Follow the video to write your first LangGraph program: define the state passed between nodes with a TypedDict (a message list plus one int field), write a node that fakes an AI reply, put it into a graph with StateGraph, set the entry point and compile, draw the graph's structure, run it with one HumanMessage and print the messages neatly with pretty_print. The episode calls no model at all; the point is to see the skeleton of a graph."
  },
  "goals": [
    {
      "zh": "说出 State 是什么，以及用 `TypedDict` 和用 Pydantic 定义它有什么区别",
      "en": "Say what the State is and how defining it with `TypedDict` differs from Pydantic"
    },
    {
      "zh": "用 `TypedDict` 写出视频里的状态：`messages: list[AnyMessage]` 加 `extra_field: int`",
      "en": "Write the video's state with `TypedDict`: `messages: list[AnyMessage]` plus `extra_field: int`"
    },
    {
      "zh": "写出节点函数：读 `state[\"messages\"]`，返回「旧消息 + 新的 `AIMessage`」和要更新的字段",
      "en": "Write a node: read `state[\"messages\"]` and return “old messages + a new `AIMessage`” plus the fields to update"
    },
    {
      "zh": "用 `StateGraph`、`add_node`、`set_entry_point`（或 `add_edge(START, ...)`）、`compile` 建图，用 `invoke` 运行",
      "en": "Build a graph with `StateGraph`, `add_node`, `set_entry_point` (or `add_edge(START, ...)`) and `compile`, and run it with `invoke`"
    },
    {
      "zh": "用 `draw_mermaid()` / `draw_mermaid_png()` 查看图结构，用 `pretty_print()` 打印消息",
      "en": "Inspect the structure with `draw_mermaid()` / `draw_mermaid_png()` and print messages with `pretty_print()`"
    },
    {
      "zh": "不看资料，独立手写出这个最小的图",
      "en": "Write this minimal graph from memory"
    }
  ],
  "blocks": [
    {
      "t": "video",
      "zh": "这一集约 15 分钟，是「节点与可控制性」三集里的第一集，开头老师先列出这三集要讲的内容：第一个图（本集）、基本控制（28 节）、精细控制（29 节）。本集老师在 Jupyter Notebook 里写出 LangGraph 的第一个程序，顺序是：安装 → 定义 State → 写一个节点 → 建图、设入口、编译 → 画出图结构 → 调用 → 用 `pretty_print` 打印消息。**整集没有调用大模型**：节点里的「AI 回复」是手写的一条假消息。[▶ 00:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=28&t=34) 老师先用 pip 安装 `langgraph`；课程的 `.venv` 里已经装好了 `langgraph 1.2.12`，不用再装（见[环境准备](#/setup)）。下面的代码和视频是同一个例子。",
      "en": "This ~15-minute episode is the first of three on “nodes and controllability”; the instructor opens by listing them: the first graph (this one), basic control (lesson 28) and fine-grained control (lesson 29). Here he writes the first LangGraph program in a Jupyter Notebook, in this order: install → define the State → write one node → build the graph, set the entry point, compile → draw the structure → run it → print the messages with `pretty_print`. **No model is called anywhere**: the node's “AI reply” is a hand-written fake message. [▶ 00:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=28&t=34) He first installs `langgraph` with pip; the course `.venv` already has `langgraph 1.2.12`, so skip that (see [Setup](#/setup)). The code below is the same example as the video."
    },
    {
      "t": "h",
      "zh": "一、State：节点之间传递的数据",
      "en": "1. The State: the data passed between nodes"
    },
    {
      "t": "p",
      "zh": "[▶ 01:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=28&t=69) 写图的第一步是定义 **State（状态）**。它是节点和节点之间传来传去的那份数据，所以要先把它的格式定下来：有哪些字段，每个字段是什么类型。\n\n[▶ 01:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=28&t=101) 老师介绍了两种常见写法：\n\n| | `TypedDict` | Pydantic 的 `BaseModel` |\n|---|---|---|\n| 来自哪里 | Python 标准库 `typing` 模块 | 第三方库，要单独安装（12 节学过） |\n| 起什么作用 | 只给编辑器和类型检查工具看，**运行时不检查** | **运行时会验证数据**，还能序列化（比如转成 JSON） |\n| 节点里怎么读 | 普通字典：`state[\"messages\"]` | 对象属性：`state.messages` |\n\n视频里用的是 `TypedDict`，后面的 LangGraph 课程也基本都用它。",
      "en": "[▶ 01:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=28&t=69) The first step is to define the **State**. It is the data passed from node to node, so you fix its format first: which fields it has and what type each one is.\n\n[▶ 01:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=28&t=101) The instructor shows the two usual options:\n\n| | `TypedDict` | Pydantic `BaseModel` |\n|---|---|---|\n| Comes from | Python's standard `typing` module | A third-party library you install separately (lesson 12) |\n| What it does | Only informs editors and type checkers; **nothing is checked at run time** | **Validates data at run time** and can serialise it (e.g. to JSON) |\n| Reading it in a node | A plain dict: `state[\"messages\"]` | An attribute: `state.messages` |\n\nThe video uses `TypedDict`, and so do almost all later LangGraph lessons."
    },
    {
      "t": "py",
      "title": {
        "zh": "TypedDict：给字典写一份「字段清单」",
        "en": "TypedDict: a field list for a dict"
      },
      "zh": "`TypedDict` 用 `class 名字(TypedDict):` 来定义（`class` 的基本写法见 08 节），里面每行写一个 `字段名: 类型`。类型可以是 `str`、`int`，也可以是 `list[str]` 这种「列表里装什么」的写法。\n\n记住两点：\n- 它**只是一份说明**：运行时得到的仍然是普通 `dict`，照样用 `s[\"字段\"]` 取值。\n- Python **不检查**这些类型，写错了也不报错。想在运行时被检查，就要用 Pydantic。下面把两者放在一起对比。\n\n视频里写的是 `from typing_extensions import TypedDict`。`typing_extensions` 是 `typing` 的扩展包，给旧版 Python 补上新功能；在课程用的 Python 3.12 里，`from typing import TypedDict` 效果一样。",
      "en": "Define a `TypedDict` with `class Name(TypedDict):` (class basics are in lesson 08); each line inside is `field: type`. Types can be `str`, `int`, or forms like `list[str]` that say what the list holds.\n\nTwo things to remember:\n- It is **only a description**: at run time you still get a plain `dict` and read it with `s[\"field\"]`.\n- Python does **not** check these types, so mistakes raise nothing. If you want run-time checks, use Pydantic. The code below compares the two.\n\nThe video writes `from typing_extensions import TypedDict`. `typing_extensions` is an add-on to `typing` that brings newer features to older Pythons; on the course's Python 3.12, `from typing import TypedDict` works the same.",
      "code": {
        "zh": "from typing import TypedDict\nfrom pydantic import BaseModel, ValidationError\n\nclass State(TypedDict):\n    messages: list[str]          # list[str]：装着字符串的列表\n    extra_field: int\n\ns: State = {\"messages\": [\"你好\"], \"extra_field\": 1}\nprint(type(s), s[\"messages\"])    # 运行时就是普通的 dict\n\nwrong: State = {\"messages\": \"不是列表\", \"extra_field\": \"一\"}\nprint(wrong)                     # 类型全写错了，Python 也不管\n\nclass PState(BaseModel):         # 同样的字段，换成 Pydantic（12 节）\n    messages: list[str]\n    extra_field: int\n\ntry:\n    PState(messages=\"不是列表\", extra_field=\"一\")\nexcept ValidationError as e:\n    print(\"Pydantic 当场报错，错误数：\", e.error_count())",
        "en": "from typing import TypedDict\nfrom pydantic import BaseModel, ValidationError\n\nclass State(TypedDict):\n    messages: list[str]          # list[str]: a list holding strings\n    extra_field: int\n\ns: State = {\"messages\": [\"hi\"], \"extra_field\": 1}\nprint(type(s), s[\"messages\"])    # a plain dict at run time\n\nwrong: State = {\"messages\": \"not a list\", \"extra_field\": \"one\"}\nprint(wrong)                     # every type is wrong, and Python doesn't care\n\nclass PState(BaseModel):         # the same fields with Pydantic (lesson 12)\n    messages: list[str]\n    extra_field: int\n\ntry:\n    PState(messages=\"not a list\", extra_field=\"one\")\nexcept ValidationError as e:\n    print(\"Pydantic complains right away; errors:\", e.error_count())"
      }
    },
    {
      "t": "p",
      "zh": "[▶ 03:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=28&t=198) 视频里的 State 有两个字段：\n- `messages`：一个消息列表。`AnyMessage` 表示「任何一种 LangChain 消息」，比如人类消息 `HumanMessage`、AI 消息 `AIMessage`。\n- `extra_field`：一个额外的整数，用来说明状态里除了消息，还可以放别的数据。",
      "en": "[▶ 03:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=28&t=198) The video's State has two fields:\n- `messages`: a list of messages. `AnyMessage` means “any kind of LangChain message”, such as a human `HumanMessage` or an AI `AIMessage`.\n- `extra_field`: one extra integer, showing that the state can hold other data besides messages."
    },
    {
      "t": "code",
      "file": "state.py",
      "code": {
        "zh": "from langchain_core.messages import AnyMessage\nfrom typing_extensions import TypedDict\n\n# 节点之间通信的数据格式\nclass State(TypedDict):\n    messages: list[AnyMessage]   # 消息列表：人类消息、AI 消息……哪种都行\n    extra_field: int             # 一个额外的整数字段",
        "en": "from langchain_core.messages import AnyMessage\nfrom typing_extensions import TypedDict\n\n# the format of the data passed between nodes\nclass State(TypedDict):\n    messages: list[AnyMessage]   # a list of messages: human, AI ... any kind\n    extra_field: int             # one extra int field"
      }
    },
    {
      "t": "h",
      "zh": "二、节点：接收 state 的一个函数",
      "en": "2. A node: a function that receives the state"
    },
    {
      "t": "p",
      "zh": "[▶ 04:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=28&t=263) 节点就是一个普通函数：参数是当前的 state，返回一个字典，写明要更新哪些字段。视频里的节点模拟了一次 AI 回复：先取出已有的消息，再造一条 `AIMessage`，最后返回「旧消息 + 新消息」，同时给整数字段 `extra_field` 赋值 1。",
      "en": "[▶ 04:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=28&t=263) A node is a plain function: it takes the current state and returns a dict saying which fields to update. The video's node fakes an AI reply: it takes the existing messages, creates an `AIMessage`, returns “old messages + the new one” and also sets the int field `extra_field` to 1."
    },
    {
      "t": "code",
      "file": "node.py",
      "code": {
        "zh": "from langchain_core.messages import AIMessage\n\ndef node(state: State):\n    messages = state[\"messages\"]                 # 取出已有的消息\n    new_message = AIMessage(\"你好，我是节点1\")      # 模拟一条 AI 回复\n    return {\"messages\": messages + [new_message], \"extra_field\": 1}",
        "en": "from langchain_core.messages import AIMessage\n\ndef node(state: State):\n    messages = state[\"messages\"]                 # the messages so far\n    new_message = AIMessage(\"Hello, I'm node 1\")   # a fake AI reply\n    return {\"messages\": messages + [new_message], \"extra_field\": 1}"
      }
    },
    {
      "t": "p",
      "zh": "为什么要写 `messages + [new_message]`，而不是只返回新消息？因为节点返回的字段会**覆盖**状态里的旧值。这里的 `messages` 是一个普通列表，没有任何「合并规则」，只返回 `[new_message]` 的话，人类说的那句就被替换掉了。所以要自己把旧列表和新消息拼起来（列表相加见 10 节）。下一节会学 reducer，让 LangGraph 自动帮你拼接。",
      "en": "Why `messages + [new_message]` rather than just the new message? Because a returned field **overwrites** the old value in the state. Here `messages` is a plain list with no merge rule, so returning only `[new_message]` would replace the human's message. You join the old list and the new message yourself (adding lists: lesson 10). The next lesson introduces reducers, which make LangGraph do the joining for you."
    },
    {
      "t": "note",
      "zh": "视频里老师一开始把新消息写成了 `AnyMessage(...)`，马上改成了 `AIMessage(...)`。`AnyMessage` 只是一个类型说明（「哪种消息都行」），不能用来创建消息，调用它会报 `TypeError: Cannot instantiate typing.Union`。要造一条 AI 回复，得用具体的 `AIMessage`。",
      "en": "In the video the instructor first wrote the new message as `AnyMessage(...)` and immediately changed it to `AIMessage(...)`. `AnyMessage` is only a type description (“any message will do”) and can't create a message; calling it raises `TypeError: Cannot instantiate typing.Union`. To make an AI reply you need the concrete `AIMessage`."
    },
    {
      "t": "check",
      "q": {
        "zh": "如果节点写成 `return {\"messages\": [new_message], \"extra_field\": 1}`，运行后 `result[\"messages\"]` 里有什么？",
        "en": "If the node is written as `return {\"messages\": [new_message], \"extra_field\": 1}`, what is in `result[\"messages\"]` after the run?"
      },
      "options": [
        {
          "zh": "人类消息和 AI 消息两条",
          "en": "Both the human and the AI message"
        },
        {
          "zh": "只有 AI 那一条",
          "en": "Only the AI message"
        },
        {
          "zh": "什么都没有，会报错",
          "en": "Nothing – it raises an error"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "`messages` 没有 reducer，返回的新列表直接覆盖旧列表，人类消息就丢了。所以视频里返回的是 `messages + [new_message]`。",
        "en": "`messages` has no reducer, so the returned list simply replaces the old one and the human message is lost. That's why the video returns `messages + [new_message]`."
      }
    },
    {
      "t": "h",
      "zh": "三、建图：放进节点、设入口、编译",
      "en": "3. Build the graph: add the node, set the entry, compile"
    },
    {
      "t": "p",
      "zh": "[▶ 06:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=28&t=362) 有了 State 和节点，就可以建图了：\n1. `StateGraph(State)`：新建一张图，告诉它状态长什么样\n2. `add_node(node)`：把节点放进图。只传函数时，节点名自动取函数名，这里就是 `\"node\"`；也可以写 `add_node(\"node\", node)` 自己起名\n3. `set_entry_point(\"node\")`：设置入口，图从这个节点开始跑\n4. `compile()`：编译，检查结构，得到一个可以运行的图",
      "en": "[▶ 06:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=28&t=362) With a State and a node you can build the graph:\n1. `StateGraph(State)`: a new graph that knows what the state looks like\n2. `add_node(node)`: put the node into the graph. Given only a function, the node is named after it, here `\"node\"`; `add_node(\"node\", node)` lets you choose the name\n3. `set_entry_point(\"node\")`: the entry point – the graph starts at this node\n4. `compile()`: check the structure and get a graph you can run"
    },
    {
      "t": "code",
      "file": "build_graph.py",
      "code": {
        "zh": "from langgraph.graph import StateGraph\n\nbuilder = StateGraph(State)        # 1. 新建一张图，告诉它状态的格式\nbuilder.add_node(node)             # 2. 放进节点，名字自动取函数名 \"node\"\nbuilder.set_entry_point(\"node\")    # 3. 设置入口：从 node 开始\ngraph = builder.compile()          # 4. 编译，得到可以运行的图",
        "en": "from langgraph.graph import StateGraph\n\nbuilder = StateGraph(State)        # 1. a new graph that knows the state's format\nbuilder.add_node(node)             # 2. add the node; it is named after the function: \"node\"\nbuilder.set_entry_point(\"node\")    # 3. the entry point: start at node\ngraph = builder.compile()          # 4. compile into a runnable graph"
      },
      "note": {
        "zh": "`add_node(node)` 传的是**函数本身**，不加括号；写成 `node()` 会立刻调用它，导致报错。",
        "en": "`add_node(node)` passes **the function itself**, without parentheses; `node()` would call it immediately and fail."
      }
    },
    {
      "t": "note",
      "zh": "三个和视频对照着看的小细节：\n- **变量名**：视频里把 `StateGraph(State)` 叫 `graph`，把编译后的结果叫 `graph_builder`，和 LangGraph 官方文档的叫法正好相反。名字随便起都能运行，讲义统一用官方习惯：建图用的叫 `builder`，编译后能运行的叫 `graph`。\n- **入口的另一种写法**：`set_entry_point(\"node\")` 等于 `add_edge(START, \"node\")`（`START` 从 `langgraph.graph` 导入）。下一节起视频都用 `add_edge` 的写法。\n- **没连到 END 也能跑**：这张图没有写结束边。在 1.2.12 里，一个节点后面没有任何边，跑完它图就结束了。",
      "en": "Three details to compare with the video:\n- **Variable names**: the video calls `StateGraph(State)` `graph` and the compiled result `graph_builder` – the opposite of LangGraph's official docs. Any names work; these notes follow the docs: the thing you build with is `builder`, the compiled, runnable one is `graph`.\n- **Another way to set the entry**: `set_entry_point(\"node\")` equals `add_edge(START, \"node\")` (`START` comes from `langgraph.graph`). From the next lesson on, the video uses `add_edge`.\n- **No edge to END is fine**: this graph has no exit edge. In 1.2.12, when a node has no outgoing edge, the graph simply ends after it."
    },
    {
      "t": "h",
      "zh": "四、把图画出来",
      "en": "4. Draw the graph"
    },
    {
      "t": "p",
      "zh": "[▶ 08:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=28&t=491) 编译好的图可以画出来，检查结构对不对。LangGraph 用的是 **Mermaid**：一种「用文字描述图表」的工具，几行简单的文字就能生成流程图。`graph.get_graph()` 取出图的结构，再选一种画法：\n\n| 方法 | 得到什么 | 在课程环境里 |\n|---|---|---|\n| `draw_mermaid()` | Mermaid 文字 | 随时能用，粘贴到 [mermaid.live](https://mermaid.live) 就能看图 |\n| `draw_mermaid_png()` | PNG 图片 | 要联网：它把文字发给公共服务 mermaid.ink 生成图片 |\n| `draw_ascii()` | 用字符拼成的图 | 需要 `grandalf` 包，课程环境没装 |",
      "en": "[▶ 08:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=28&t=491) A compiled graph can be drawn so you can check its structure. LangGraph uses **Mermaid**, a tool that describes diagrams in text: a few simple lines become a flowchart. `graph.get_graph()` gives you the structure; then pick a way to draw it:\n\n| Method | What you get | In the course environment |\n|---|---|---|\n| `draw_mermaid()` | Mermaid text | Always works; paste it into [mermaid.live](https://mermaid.live) |\n| `draw_mermaid_png()` | A PNG picture | Needs the internet: it sends the text to the public mermaid.ink service |\n| `draw_ascii()` | A picture made of characters | Needs the `grandalf` package, which isn't installed |"
    },
    {
      "t": "code",
      "file": "draw.py",
      "code": {
        "zh": "# 1. 文字版：打印出来，粘贴到 https://mermaid.live 就能看图\nprint(graph.get_graph().draw_mermaid())\n# 输出（节选）：\n#     __start__ --> node;\n#     node --> __end__;\n\n# 2. 图片版（要联网）：在 VS Code 里跑脚本时，存成文件再打开\ngraph.get_graph().draw_mermaid_png(output_file_path=\"graph.png\")\n\n# 视频在 Jupyter Notebook 里的写法：直接在格子下面显示图片\n# from IPython.display import Image, display\n# display(Image(graph.get_graph().draw_mermaid_png()))",
        "en": "# 1. as text: print it and paste it into https://mermaid.live\nprint(graph.get_graph().draw_mermaid())\n# output (excerpt):\n#     __start__ --> node;\n#     node --> __end__;\n\n# 2. as a picture (needs the internet): when running a script in VS Code, save it to a file\ngraph.get_graph().draw_mermaid_png(output_file_path=\"graph.png\")\n\n# the video's Jupyter Notebook version shows the picture under the cell\n# from IPython.display import Image, display\n# display(Image(graph.get_graph().draw_mermaid_png()))"
      }
    },
    {
      "t": "video",
      "zh": "[▶ 09:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=28&t=587) 老师先试了别的方法，才改用 `draw_mermaid_png()` 画出图片。他的图里只有 `start → node` 两个框；1.2.12 画出来会多一个 `__end__`，因为 node 后面没有边，跑完就结束。`display(Image(...))` 是 Jupyter 专用的显示方式，在普通 `.py` 脚本里不会弹出图片，所以讲义用 `draw_mermaid()` 或保存成 PNG 文件。下一集画图时老师遇到一次「网络问题」要重跑，原因就是 `draw_mermaid_png()` 要访问 mermaid.ink。",
      "en": "[▶ 09:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=28&t=587) The instructor tries another method first, then switches to `draw_mermaid_png()` to get the picture. His picture has just two boxes, `start → node`; 1.2.12 also draws `__end__`, because node has no outgoing edge and the graph ends after it. `display(Image(...))` is a Jupyter-only way to show pictures and shows nothing in a plain `.py` script, so these notes use `draw_mermaid()` or save a PNG file. In the next episode a drawing call fails with a “network problem” and has to be rerun: `draw_mermaid_png()` has to reach mermaid.ink."
    },
    {
      "t": "h",
      "zh": "五、调用图，读结果",
      "en": "5. Run the graph and read the result"
    },
    {
      "t": "p",
      "zh": "[▶ 10:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=28&t=618) 编译好的图用 `invoke` 运行：传入初始状态（一个字典），返回运行结束时的完整状态。视频模拟的是人类说了一句话，所以初始的 `messages` 里放一条 `HumanMessage`。",
      "en": "[▶ 10:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=28&t=618) Run the compiled graph with `invoke`: pass the initial state (a dict) and get back the complete state at the end. The video simulates a human saying one line, so the initial `messages` holds one `HumanMessage`."
    },
    {
      "t": "code",
      "file": "run.py",
      "code": {
        "zh": "from langchain_core.messages import HumanMessage\n\nresult = graph.invoke({\"messages\": [HumanMessage(\"你好，我是Tommy\")]})\nprint(result)\n# {'messages': [HumanMessage(content='你好，我是Tommy', additional_kwargs={}, response_metadata={}),\n#               AIMessage(content='你好，我是节点1', additional_kwargs={}, response_metadata={},\n#                         tool_calls=[], invalid_tool_calls=[])],\n#  'extra_field': 1}",
        "en": "from langchain_core.messages import HumanMessage\n\nresult = graph.invoke({\"messages\": [HumanMessage(\"Hi, I'm Tommy\")]})\nprint(result)\n# {'messages': [HumanMessage(content=\"Hi, I'm Tommy\", additional_kwargs={}, response_metadata={}),\n#               AIMessage(content=\"Hello, I'm node 1\", additional_kwargs={}, response_metadata={},\n#                         tool_calls=[], invalid_tool_calls=[])],\n#  'extra_field': 1}"
      }
    },
    {
      "t": "p",
      "zh": "结果里有两条消息：人类说的一句，加上节点「回复」的一句；`extra_field` 变成了 1。初始状态里不给 `extra_field` 也没关系，节点会写入它。\n\n字段名要拼对。视频里第一次运行的输出不对，老师回头检查的就是 `messages` 这个键有没有拼错，改对后才看到结果。如果是**传入**的键拼错（比如写成 `{\"message\": [...]}`），LangGraph 会悄悄丢掉这个不认识的键，节点里的 `state[\"messages\"]` 就会报 `KeyError: 'messages'`。",
      "en": "The result holds two messages: the human's line and the node's “reply”; `extra_field` is now 1. Leaving `extra_field` out of the initial state is fine, since the node writes it.\n\nSpell the field names right. In the video the first run prints the wrong thing, and the instructor goes back to check the spelling of the `messages` key; only after fixing it does he see the result. If the key you **pass in** is misspelt (say `{\"message\": [...]}`), LangGraph quietly drops the unknown key and `state[\"messages\"]` in the node raises `KeyError: 'messages'`."
    },
    {
      "t": "h",
      "zh": "六、用 pretty_print 把消息打印清楚",
      "en": "6. Print messages neatly with pretty_print"
    },
    {
      "t": "p",
      "zh": "[▶ 12:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=28&t=745) 直接 `print(result)` 会把每条消息的全部信息都打出来，包括 `additional_kwargs`、`response_metadata` 这些元数据，而真正有用的通常只是内容。LangChain 的每条消息都有一个 `pretty_print()` 方法，按「消息类型 + 内容」整齐地打印。用 `for` 循环（05 节）逐条调用就行：",
      "en": "[▶ 12:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=28&t=745) A plain `print(result)` dumps everything about each message, metadata such as `additional_kwargs` and `response_metadata` included, while what you usually want is just the content. Every LangChain message has a `pretty_print()` method that prints “message type + content” neatly. Call it on each message in a `for` loop (lesson 05):"
    },
    {
      "t": "code",
      "file": "pretty.py",
      "code": {
        "zh": "for message in result[\"messages\"]:\n    message.pretty_print()\n\n# ================================ Human Message =================================\n#\n# 你好，我是Tommy\n# ================================== Ai Message ==================================\n#\n# 你好，我是节点1",
        "en": "for message in result[\"messages\"]:\n    message.pretty_print()\n\n# ================================ Human Message =================================\n#\n# Hi, I'm Tommy\n# ================================== Ai Message ==================================\n#\n# Hello, I'm node 1"
      },
      "note": {
        "zh": "完整代码：`practice/l27_first_graph_solution.py`（不需要 API key）。老师提到，在 LangGraph 里打印消息或者写日志时，用它会清楚很多。",
        "en": "Full code: `practice/l27_first_graph_solution.py` (no API key needed). The instructor notes that in LangGraph this makes printed messages and logs much clearer."
      }
    },
    {
      "t": "tip",
      "zh": "**补充**（视频这一集没有）：想把节点里的假回复换成真模型，只要改一行：`new_message = model.invoke(messages)`。`model` 是 LangChain 的聊天模型对象，比如 `ChatDeepSeek(model=MODEL, api_key=API_KEY)`，它直接接收消息列表，返回一条 `AIMessage`。完整代码见 `practice/l27_llm_graph.py`（运行一次 = 1 次 API 调用）。第 29 节的视频会正式在节点里调用模型。",
      "en": "**Extra** (not in this episode): to swap the fake reply for a real model, change one line: `new_message = model.invoke(messages)`. `model` is a LangChain chat model object such as `ChatDeepSeek(model=MODEL, api_key=API_KEY)`; it takes the message list directly and returns an `AIMessage`. Full code: `practice/l27_llm_graph.py` (one run = 1 API call). The video for lesson 29 is where a model is really called inside a node."
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "用 `TypedDict` 和用 Pydantic 定义状态，哪一个在**运行时**会检查数据类型？",
        "en": "Defining the state with `TypedDict` or with Pydantic: which one checks the data types **at run time**?"
      },
      "options": [
        {
          "zh": "`TypedDict`",
          "en": "`TypedDict`"
        },
        {
          "zh": "两个都不检查",
          "en": "Neither"
        },
        {
          "zh": "Pydantic 的 `BaseModel`",
          "en": "Pydantic's `BaseModel`"
        },
        {
          "zh": "两个都检查",
          "en": "Both"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "`TypedDict` 是标准库里的类型说明，只给编辑器和类型检查工具看；Pydantic 是第三方库，运行时验证数据，类型不对会报 `ValidationError`。",
        "en": "`TypedDict` is a standard-library type description for editors and type checkers only; Pydantic is a third-party library that validates at run time and raises `ValidationError` on wrong types."
      }
    },
    {
      "q": {
        "zh": "`builder.set_entry_point(\"node\")` 和下面哪一行作用相同？",
        "en": "Which line does the same as `builder.set_entry_point(\"node\")`?"
      },
      "options": [
        {
          "zh": "`builder.add_edge(START, \"node\")`",
          "en": "`builder.add_edge(START, \"node\")`"
        },
        {
          "zh": "`builder.add_node(\"node\")`",
          "en": "`builder.add_node(\"node\")`"
        },
        {
          "zh": "`builder.add_edge(\"node\", END)`",
          "en": "`builder.add_edge(\"node\", END)`"
        },
        {
          "zh": "`builder.compile(\"node\")`",
          "en": "`builder.compile(\"node\")`"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "入口就是「从 START 出发的那条边」。不设入口的话，`compile()` 会报 `Graph must have an entrypoint`。",
        "en": "The entry point is “the edge leaving START”. Without one, `compile()` raises `Graph must have an entrypoint`."
      }
    },
    {
      "q": {
        "zh": "`builder.add_node(node)` 只传了一个函数，这个节点叫什么名字？",
        "en": "`builder.add_node(node)` passes only a function. What is the node called?"
      },
      "options": [
        {
          "zh": "`\"node_1\"`",
          "en": "`\"node_1\"`"
        },
        {
          "zh": "没有名字，必须再写一个参数",
          "en": "It has no name; a second argument is required"
        },
        {
          "zh": "一个随机生成的名字",
          "en": "A randomly generated name"
        },
        {
          "zh": "`\"node\"`，也就是函数名",
          "en": "`\"node\"`, the function's name"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "只传函数时，节点名自动取函数名，所以后面才能写 `set_entry_point(\"node\")`。",
        "en": "With only a function, the node is named after it – which is why `set_entry_point(\"node\")` works afterwards."
      }
    },
    {
      "q": {
        "zh": "视频里的节点为什么返回 `messages + [new_message]`？",
        "en": "Why does the video's node return `messages + [new_message]`?"
      },
      "options": [
        {
          "zh": "因为 LangGraph 规定必须返回完整状态",
          "en": "Because LangGraph requires the complete state"
        },
        {
          "zh": "因为 `messages` 没有合并规则，返回值会覆盖旧列表，要自己把旧消息带上",
          "en": "Because `messages` has no merge rule; the return value overwrites the old list, so you keep the old messages yourself"
        },
        {
          "zh": "因为 `AIMessage` 必须放在列表里才能创建",
          "en": "Because an `AIMessage` can only be created inside a list"
        },
        {
          "zh": "为了让 `extra_field` 变成 1",
          "en": "To make `extra_field` equal 1"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "节点只需返回要更新的字段，但更新的方式是覆盖。普通列表字段没有 reducer，所以要返回「旧 + 新」的完整列表。下一节的 reducer 会把这件事自动化。",
        "en": "A node returns only the fields to update, but updating means overwriting. A plain list field has no reducer, so you return the full “old + new” list. Next lesson's reducers automate this."
      }
    },
    {
      "q": {
        "zh": "在 VS Code 里运行 `graph.get_graph().draw_mermaid_png()` 时报了连接错误，最可能的原因是？",
        "en": "`graph.get_graph().draw_mermaid_png()` fails with a connection error in VS Code. The most likely reason?"
      },
      "options": [
        {
          "zh": "图还没有编译",
          "en": "The graph isn't compiled yet"
        },
        {
          "zh": "缺少 `grandalf` 包",
          "en": "The `grandalf` package is missing"
        },
        {
          "zh": "它要联网，把图发给 mermaid.ink 生成图片",
          "en": "It needs the internet to send the diagram to mermaid.ink"
        },
        {
          "zh": "PNG 只能在 Linux 上生成",
          "en": "PNGs can only be made on Linux"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "`draw_mermaid_png()` 默认调用在线服务 mermaid.ink。没网时用 `draw_mermaid()` 打印文字，再粘贴到 mermaid.live。`grandalf` 是 `draw_ascii()` 才需要的。",
        "en": "`draw_mermaid_png()` calls the online mermaid.ink service by default. Offline, print `draw_mermaid()` and paste it into mermaid.live. `grandalf` is only for `draw_ascii()`."
      }
    },
    {
      "q": {
        "zh": "为什么用 `message.pretty_print()` 而不是 `print(result)` 来看消息？",
        "en": "Why use `message.pretty_print()` instead of `print(result)` to look at messages?"
      },
      "options": [
        {
          "zh": "`print` 打印消息对象会报错",
          "en": "`print` raises an error on message objects"
        },
        {
          "zh": "只有 `pretty_print` 能显示中文",
          "en": "Only `pretty_print` can show Chinese"
        },
        {
          "zh": "`pretty_print` 会把消息存进日志文件",
          "en": "`pretty_print` saves messages to a log file"
        },
        {
          "zh": "`pretty_print` 只打印消息类型和内容，比满屏的元数据清楚",
          "en": "`pretty_print` shows just the message type and content, much clearer than a screen of metadata"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "`print(result)` 也能用，只是会带上 `additional_kwargs`、`response_metadata` 等全部信息。`pretty_print()` 按类型分隔、只显示内容，调试和看日志时更方便。",
        "en": "`print(result)` works too but includes everything, `additional_kwargs`, `response_metadata` and so on. `pretty_print()` separates messages by type and shows only the content, which is easier when debugging or reading logs."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "定义状态和节点",
        "en": "Define the state and the node"
      },
      "code": {
        "zh": "from langchain_core.messages import [[AIMessage]], AnyMessage\nfrom typing_extensions import [[TypedDict]]\n\nclass State([[TypedDict]]):\n    messages: list[AnyMessage]\n    extra_field: [[int]]\n\ndef node(state: State):\n    messages = state[\"[[messages]]\"]\n    new_message = AIMessage(\"你好，我是节点1\")\n    [[return]] {\"messages\": messages [[+]] [new_message], \"extra_field\": 1}",
        "en": "from langchain_core.messages import [[AIMessage]], AnyMessage\nfrom typing_extensions import [[TypedDict]]\n\nclass State([[TypedDict]]):\n    messages: list[AnyMessage]\n    extra_field: [[int]]\n\ndef node(state: State):\n    messages = state[\"[[messages]]\"]\n    new_message = AIMessage(\"Hello, I'm node 1\")\n    [[return]] {\"messages\": messages [[+]] [new_message], \"extra_field\": 1}"
      },
      "explain": {
        "zh": "状态用 `TypedDict` 列出字段；节点读出 `messages`，返回「旧消息 + 新的 AIMessage」。",
        "en": "The state lists its fields with `TypedDict`; the node reads `messages` and returns “old messages + the new AIMessage”."
      }
    },
    {
      "title": {
        "zh": "建图、调用、打印",
        "en": "Build, run, print"
      },
      "code": {
        "zh": "builder = [[StateGraph]](State)\nbuilder.[[add_node]](node)\nbuilder.[[set_entry_point]](\"node\")\ngraph = builder.[[compile]]()\n\nquestion = [[HumanMessage]](\"你好，我是Tommy\")\nresult = graph.[[invoke]]({\"messages\": [question]})\nfor message in result[\"messages\"]:\n    message.[[pretty_print]]()",
        "en": "builder = [[StateGraph]](State)\nbuilder.[[add_node]](node)\nbuilder.[[set_entry_point]](\"node\")\ngraph = builder.[[compile]]()\n\nquestion = [[HumanMessage]](\"Hi, I'm Tommy\")\nresult = graph.[[invoke]]({\"messages\": [question]})\nfor message in result[\"messages\"]:\n    message.[[pretty_print]]()"
      },
      "explain": {
        "zh": "建图 → 加节点 → 设入口 → 编译 → 用一条人类消息 invoke → 逐条 pretty_print。",
        "en": "Builder → add the node → set the entry → compile → invoke with one human message → pretty_print each message."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：视频里的第一个图",
        "en": "Write it: the video's first graph"
      },
      "task": {
        "zh": "不看上面的代码，写出视频里的第一个图：\n1. `State`（`TypedDict`）：`messages: list[AnyMessage]`、`extra_field: int`\n2. 节点 `node`：取出 `state[\"messages\"]`，新建 `AIMessage(\"你好，我是节点1\")`，返回「旧消息 + 新消息」，`extra_field` 设为 1\n3. `StateGraph(State)` → `add_node` → `set_entry_point(\"node\")` → `compile()`\n4. 用 `{\"messages\": [HumanMessage(\"你好，我是Tommy\")]}` 调用，用 `for` 循环对每条消息调用 `pretty_print()`，最后打印 `extra_field`\n\n本地运行（`.venv`，不需要 API key）应该看到 Human Message 和 Ai Message 各一条，以及 1。",
        "en": "Without looking above, write the video's first graph:\n1. `State` (`TypedDict`): `messages: list[AnyMessage]`, `extra_field: int`\n2. node `node`: take `state[\"messages\"]`, create `AIMessage(\"Hello, I'm node 1\")`, return “old messages + the new one” and set `extra_field` to 1\n3. `StateGraph(State)` → `add_node` → `set_entry_point(\"node\")` → `compile()`\n4. run it with `{\"messages\": [HumanMessage(\"Hi, I'm Tommy\")]}`, call `pretty_print()` on each message in a `for` loop, then print `extra_field`\n\nRun it locally (`.venv`, no API key): you should see one Human Message, one Ai Message and 1."
      },
      "starter": {
        "zh": "from langchain_core.messages import AIMessage, AnyMessage, HumanMessage\nfrom langgraph.graph import StateGraph\nfrom typing_extensions import TypedDict\n\n# 1. State：messages 和 extra_field\n\n\n# 2. 节点 node：追加一条 AI 回复，extra_field 设为 1\n\n\n# 3. 建图：加节点、设入口、编译\n\n\n# 4. 调用，并用 pretty_print 逐条打印消息\n",
        "en": "from langchain_core.messages import AIMessage, AnyMessage, HumanMessage\nfrom langgraph.graph import StateGraph\nfrom typing_extensions import TypedDict\n\n# 1. State: messages and extra_field\n\n\n# 2. node: append an AI reply, set extra_field to 1\n\n\n# 3. build: add the node, set the entry point, compile\n\n\n# 4. run it and pretty_print every message\n"
      },
      "solution": {
        "zh": "from langchain_core.messages import AIMessage, AnyMessage, HumanMessage\nfrom langgraph.graph import StateGraph\nfrom typing_extensions import TypedDict\n\n# 1. State：messages 和 extra_field\nclass State(TypedDict):\n    messages: list[AnyMessage]\n    extra_field: int\n\n# 2. 节点 node：追加一条 AI 回复，extra_field 设为 1\ndef node(state: State):\n    messages = state[\"messages\"]\n    new_message = AIMessage(\"你好，我是节点1\")\n    return {\"messages\": messages + [new_message], \"extra_field\": 1}\n\n# 3. 建图：加节点、设入口、编译\nbuilder = StateGraph(State)\nbuilder.add_node(node)\nbuilder.set_entry_point(\"node\")\ngraph = builder.compile()\n\n# 4. 调用，并用 pretty_print 逐条打印消息\nresult = graph.invoke({\"messages\": [HumanMessage(\"你好，我是Tommy\")]})\nfor message in result[\"messages\"]:\n    message.pretty_print()\nprint(result[\"extra_field\"])",
        "en": "from langchain_core.messages import AIMessage, AnyMessage, HumanMessage\nfrom langgraph.graph import StateGraph\nfrom typing_extensions import TypedDict\n\n# 1. State: messages and extra_field\nclass State(TypedDict):\n    messages: list[AnyMessage]\n    extra_field: int\n\n# 2. node: append an AI reply, set extra_field to 1\ndef node(state: State):\n    messages = state[\"messages\"]\n    new_message = AIMessage(\"Hello, I'm node 1\")\n    return {\"messages\": messages + [new_message], \"extra_field\": 1}\n\n# 3. build: add the node, set the entry point, compile\nbuilder = StateGraph(State)\nbuilder.add_node(node)\nbuilder.set_entry_point(\"node\")\ngraph = builder.compile()\n\n# 4. run it and pretty_print every message\nresult = graph.invoke({\"messages\": [HumanMessage(\"Hi, I'm Tommy\")]})\nfor message in result[\"messages\"]:\n    message.pretty_print()\nprint(result[\"extra_field\"])"
      },
      "checks": [
        {
          "zh": "用 `class State(TypedDict):` 定义状态",
          "en": "Defines `class State(TypedDict):`",
          "re": "class\\s+State\\s*\\(\\s*TypedDict\\s*\\)\\s*:"
        },
        {
          "zh": "`messages` 字段是 `list[AnyMessage]`",
          "en": "`messages` is `list[AnyMessage]`",
          "re": "messages\\s*:\\s*list\\[\\s*AnyMessage\\s*\\]"
        },
        {
          "zh": "`extra_field` 字段是 `int`",
          "en": "`extra_field` is `int`",
          "re": "extra_field\\s*:\\s*int"
        },
        {
          "zh": "节点里新建了一条 `AIMessage`",
          "en": "The node creates an `AIMessage`",
          "re": "=\\s*AIMessage\\("
        },
        {
          "zh": "返回「旧消息 + [新消息]」",
          "en": "Returns “old messages + [new message]”",
          "re": "[\"']messages[\"']\\s*:\\s*\\w+\\s*\\+\\s*\\["
        },
        {
          "zh": "用 `StateGraph(State)` 建图并 `add_node`",
          "en": "Builds with `StateGraph(State)` and `add_node`",
          "re": "StateGraph\\(\\s*State\\s*\\)[\\s\\S]*\\.add_node\\("
        },
        {
          "zh": "设置了入口（`set_entry_point` 或 `add_edge(START, ...)`）",
          "en": "Sets the entry point (`set_entry_point` or `add_edge(START, ...)`)",
          "re": "set_entry_point\\(\\s*[\"']node[\"']\\s*\\)|add_edge\\(\\s*START\\s*,\\s*[\"']node[\"']\\s*\\)"
        },
        {
          "zh": "`compile()` 后用 `HumanMessage` 调用 `invoke`",
          "en": "`compile()`, then `invoke` with a `HumanMessage`",
          "re": "\\.compile\\(\\s*\\)[\\s\\S]*\\.invoke\\([\\s\\S]*HumanMessage\\("
        },
        {
          "zh": "循环里对每条消息调用 `pretty_print()`",
          "en": "Calls `pretty_print()` on each message in a loop",
          "re": "for\\s+\\w+\\s+in\\s+\\w+\\[[\"']messages[\"']\\]\\s*:[\\s\\S]*\\.pretty_print\\(\\s*\\)"
        }
      ]
    },
    {
      "title": {
        "zh": "手写：数一数收到几条消息",
        "en": "Write it: count the messages received"
      },
      "task": {
        "zh": "状态和上一题一样（已经给好）。写一个新节点 `count`：\n1. 用 `len` 数出 `messages` 有几条，记为 `n`\n2. 回复一条 `AIMessage(f\"我一共收到了 {n} 条消息\")`，返回「旧消息 + 回复」，并把 `extra_field` 设成 `n`\n3. 建图时入口用 `add_edge(START, \"count\")` 的写法\n4. 传入两条 `HumanMessage` 运行，`pretty_print` 每条消息，再打印 `extra_field`\n\n本地运行应该看到回复「我一共收到了 2 条消息」，`extra_field` 是 2。",
        "en": "The state is the same as before (given). Write a new node `count`:\n1. count the `messages` with `len`; call it `n`\n2. reply with `AIMessage(f\"I received {n} messages in total\")`, return “old messages + reply”, and set `extra_field` to `n`\n3. set the entry with `add_edge(START, \"count\")`\n4. run with two `HumanMessage`s, `pretty_print` every message, then print `extra_field`\n\nLocally you should see the reply “I received 2 messages in total” and `extra_field` 2."
      },
      "starter": {
        "zh": "from langchain_core.messages import AIMessage, AnyMessage, HumanMessage\nfrom langgraph.graph import StateGraph, START\nfrom typing_extensions import TypedDict\n\nclass State(TypedDict):\n    messages: list[AnyMessage]\n    extra_field: int\n\n# 1. 节点 count：数一数 messages 有几条，回复一句话，并把条数写进 extra_field\n\n\n# 2. 建图：入口用 add_edge(START, ...) 的写法\n\n\n# 3. 传入两条人类消息运行，pretty_print 每条消息，再打印 extra_field\n",
        "en": "from langchain_core.messages import AIMessage, AnyMessage, HumanMessage\nfrom langgraph.graph import StateGraph, START\nfrom typing_extensions import TypedDict\n\nclass State(TypedDict):\n    messages: list[AnyMessage]\n    extra_field: int\n\n# 1. node count: count the messages, reply with one sentence, store the count in extra_field\n\n\n# 2. build: set the entry with add_edge(START, ...)\n\n\n# 3. run with two human messages, pretty_print every message, then print extra_field\n"
      },
      "solution": {
        "zh": "from langchain_core.messages import AIMessage, AnyMessage, HumanMessage\nfrom langgraph.graph import StateGraph, START\nfrom typing_extensions import TypedDict\n\nclass State(TypedDict):\n    messages: list[AnyMessage]\n    extra_field: int\n\n# 1. 节点 count：数一数 messages 有几条，回复一句话，并把条数写进 extra_field\ndef count(state: State):\n    messages = state[\"messages\"]\n    n = len(messages)\n    reply = AIMessage(f\"我一共收到了 {n} 条消息\")\n    return {\"messages\": messages + [reply], \"extra_field\": n}\n\n# 2. 建图：入口用 add_edge(START, ...) 的写法\nbuilder = StateGraph(State)\nbuilder.add_node(count)\nbuilder.add_edge(START, \"count\")\ngraph = builder.compile()\n\n# 3. 传入两条人类消息运行，pretty_print 每条消息，再打印 extra_field\nresult = graph.invoke({\"messages\": [HumanMessage(\"你好\"), HumanMessage(\"我是Tommy\")]})\nfor message in result[\"messages\"]:\n    message.pretty_print()\nprint(result[\"extra_field\"])",
        "en": "from langchain_core.messages import AIMessage, AnyMessage, HumanMessage\nfrom langgraph.graph import StateGraph, START\nfrom typing_extensions import TypedDict\n\nclass State(TypedDict):\n    messages: list[AnyMessage]\n    extra_field: int\n\n# 1. node count: count the messages, reply with one sentence, store the count in extra_field\ndef count(state: State):\n    messages = state[\"messages\"]\n    n = len(messages)\n    reply = AIMessage(f\"I received {n} messages in total\")\n    return {\"messages\": messages + [reply], \"extra_field\": n}\n\n# 2. build: set the entry with add_edge(START, ...)\nbuilder = StateGraph(State)\nbuilder.add_node(count)\nbuilder.add_edge(START, \"count\")\ngraph = builder.compile()\n\n# 3. run with two human messages, pretty_print every message, then print extra_field\nresult = graph.invoke({\"messages\": [HumanMessage(\"Hi\"), HumanMessage(\"I'm Tommy\")]})\nfor message in result[\"messages\"]:\n    message.pretty_print()\nprint(result[\"extra_field\"])"
      },
      "checks": [
        {
          "zh": "定义了节点函数 `count(state)`",
          "en": "Defines the node `count(state)`",
          "re": "def\\s+count\\s*\\(\\s*state"
        },
        {
          "zh": "用 `len(...)` 数消息条数",
          "en": "Counts the messages with `len(...)`",
          "re": "len\\(\\s*\\w+"
        },
        {
          "zh": "回复是一条 `AIMessage`",
          "en": "The reply is an `AIMessage`",
          "re": "=\\s*AIMessage\\("
        },
        {
          "zh": "返回旧消息 + 回复，并把条数写进 `extra_field`",
          "en": "Returns old messages + reply and stores the count in `extra_field`",
          "re": "[\"']messages[\"']\\s*:\\s*\\w+\\s*\\+\\s*\\[\\s*\\w+\\s*\\]\\s*,\\s*[\"']extra_field[\"']\\s*:\\s*\\w+"
        },
        {
          "zh": "入口写成 `add_edge(START, \"count\")`",
          "en": "Entry via `add_edge(START, \"count\")`",
          "re": "add_edge\\(\\s*START\\s*,\\s*[\"']count[\"']\\s*\\)"
        },
        {
          "zh": "传入两条 `HumanMessage`",
          "en": "Passes two `HumanMessage`s",
          "re": "HumanMessage\\([^)]*\\)\\s*,\\s*HumanMessage\\("
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "节点只返回 `{\"messages\": [new_message]}`：普通列表字段会被覆盖，之前的消息全丢了。没有 reducer 时要返回 `messages + [new_message]`。",
      "en": "Returning only `{\"messages\": [new_message]}`: a plain list field gets overwritten and the earlier messages are lost. Without a reducer, return `messages + [new_message]`."
    },
    {
      "zh": "用 `AnyMessage(...)` 造消息：它只是类型说明，报 `TypeError: Cannot instantiate typing.Union`。要用 `AIMessage` / `HumanMessage`。",
      "en": "Creating a message with `AnyMessage(...)`: it's only a type description and raises `TypeError: Cannot instantiate typing.Union`. Use `AIMessage` / `HumanMessage`."
    },
    {
      "zh": "忘了设入口：`compile()` 报 `ValueError: Graph must have an entrypoint`。用 `set_entry_point(...)` 或 `add_edge(START, ...)`。",
      "en": "No entry point: `compile()` raises `ValueError: Graph must have an entrypoint`. Use `set_entry_point(...)` or `add_edge(START, ...)`."
    },
    {
      "zh": "对 `StateGraph` 直接调用 `invoke`：报 `AttributeError: 'StateGraph' object has no attribute 'invoke'`。要先 `graph = builder.compile()`。",
      "en": "Calling `invoke` on the `StateGraph` itself: `AttributeError: 'StateGraph' object has no attribute 'invoke'`. First `graph = builder.compile()`."
    },
    {
      "zh": "传入的键拼错（`message` 少了 s）：LangGraph 悄悄丢掉它，节点里 `state[\"messages\"]` 报 `KeyError`。",
      "en": "A misspelt input key (`message` without the s): LangGraph quietly drops it and `state[\"messages\"]` raises `KeyError` in the node."
    },
    {
      "zh": "在 `.py` 脚本里照抄视频的 `display(Image(...))`：那是 Jupyter 的显示方式，脚本里看不到图。用 `draw_mermaid()` 或 `draw_mermaid_png(output_file_path=...)`；后者要联网，`draw_ascii()` 要装 `grandalf`。",
      "en": "Copying the video's `display(Image(...))` into a `.py` script: that's Jupyter's way of showing pictures, so nothing appears. Use `draw_mermaid()` or `draw_mermaid_png(output_file_path=...)`; the latter needs the internet, and `draw_ascii()` needs `grandalf`."
    },
    {
      "zh": "以为 `TypedDict` 会检查类型：它不检查，写错类型照样运行。需要运行时检查就用 Pydantic。",
      "en": "Expecting `TypedDict` to check types: it doesn't, and wrong types run anyway. Use Pydantic for run-time checks."
    }
  ],
  "recap": [
    {
      "zh": "State 是节点之间传递的数据。`TypedDict` 只描述格式、运行时不检查；Pydantic 运行时验证。视频用 `TypedDict`。",
      "en": "The State is the data passed between nodes. `TypedDict` only describes the format and checks nothing at run time; Pydantic validates. The video uses `TypedDict`."
    },
    {
      "zh": "视频的状态：`messages: list[AnyMessage]` 加 `extra_field: int`。",
      "en": "The video's state: `messages: list[AnyMessage]` plus `extra_field: int`."
    },
    {
      "zh": "节点是接收 state 的函数，返回要更新的字段；返回值会覆盖旧值，所以消息要写成 `messages + [new_message]`。",
      "en": "A node is a function that receives the state and returns the fields to update; updates overwrite, so messages are returned as `messages + [new_message]`."
    },
    {
      "zh": "建图四步：`StateGraph(State)` → `add_node(node)` → `set_entry_point(\"node\")`（= `add_edge(START, \"node\")`）→ `compile()`。",
      "en": "Four build steps: `StateGraph(State)` → `add_node(node)` → `set_entry_point(\"node\")` (= `add_edge(START, \"node\")`) → `compile()`."
    },
    {
      "zh": "`graph.get_graph().draw_mermaid()` 打印 Mermaid 文字；`draw_mermaid_png()` 生成图片但要联网。",
      "en": "`graph.get_graph().draw_mermaid()` prints Mermaid text; `draw_mermaid_png()` makes a picture but needs the internet."
    },
    {
      "zh": "`graph.invoke({\"messages\": [HumanMessage(...)]})` 返回最终状态；`for m in result[\"messages\"]: m.pretty_print()` 把消息打印清楚。",
      "en": "`graph.invoke({\"messages\": [HumanMessage(...)]})` returns the final state; `for m in result[\"messages\"]: m.pretty_print()` prints the messages neatly."
    }
  ],
  "files": [
    {
      "path": "practice/l27_first_graph_todo.py",
      "zh": "练习：补全 State、节点、建图和 pretty_print，搭出视频里的第一个图（有 TODO 提示，不需要 API key）。",
      "en": "Exercise: complete the State, the node, the graph and pretty_print to build the video's first graph (with TODO hints, no API key)."
    },
    {
      "path": "practice/l27_first_graph_solution.py",
      "zh": "参考答案：打印 Mermaid 文字、尝试保存 PNG（要联网）、调用图并用 pretty_print 打印消息。",
      "en": "Solution: prints the Mermaid text, tries to save a PNG (needs the internet), runs the graph and pretty_prints the messages."
    },
    {
      "path": "practice/l27_llm_graph.py",
      "zh": "补充：把节点里的假回复换成 DeepSeek 的真实回复（运行一次 = 1 次 API 调用）。",
      "en": "Extra: replace the node's fake reply with a real DeepSeek reply (one run = 1 API call)."
    }
  ]
});
