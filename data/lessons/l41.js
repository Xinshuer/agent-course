COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l41",
  "priority": "important",
  "handwrite": false,
  "studyMinutes": 35,
  "source": "subtitle",
  "summary": {
    "zh": "LangGraph 实战的第二个小项目：一个先像填问卷一样收集需求、再自动写出提示词模板的小助手。巧妙之处在于把「需求表」定义成一个工具 `PromptInstructions`：模型什么时候调用它，就说明需求问齐了，图随之从「聊天」切换到「写提示词」。这一节按视频的五步来做：收集需求、生成提示词、状态路由、组装成图、在终端里对话测试；多轮对话靠 checkpointer + thread_id 接起来。",
    "en": "The second small LangGraph project: an assistant that first collects your requirements like a questionnaire, then writes a prompt template for you. The trick is that the “requirements form” is a tool, `PromptInstructions`: when the model calls it, the requirements are complete and the graph switches from “chatting” to “writing the prompt”. Following the video's five steps: gather requirements, generate the prompt, route on the state, assemble the graph, and test it in a terminal chat; a checkpointer + thread_id carry the conversation across turns."
  },
  "goals": [
    {
      "zh": "说清楚为什么用一个 pydantic「工具」来表示「需求收集完毕」，以及为什么这里用 `bind_tools` 而不是 `with_structured_output`",
      "en": "Explain why a pydantic “tool” signals “requirements complete”, and why `bind_tools` is used here rather than `with_structured_output`"
    },
    {
      "zh": "写出 `get_prompt_messages`：在历史里找到工具调用的参数，只保留工具调用之后的消息",
      "en": "Write `get_prompt_messages`: find the tool call's arguments in the history and keep only the messages after it"
    },
    {
      "zh": "写出三个去向的路由函数 `get_state`，知道返回 `END` 表示「这一轮结束」",
      "en": "Write the three-way router `get_state`, knowing that `END` means “this turn is over”"
    },
    {
      "zh": "用 `@workflow.add_node` 加入补 ToolMessage 的节点，并说出为什么这条消息不能省",
      "en": "Add the ToolMessage node with `@workflow.add_node`, and say why that message can't be skipped"
    },
    {
      "zh": "用 checkpointer + `thread_id` + `input()` 循环做出多轮对话的终端小助手，会用 `next(iter(...))` 取出每一步的更新",
      "en": "Build a multi-turn terminal assistant with a checkpointer + `thread_id` + an `input()` loop, reading each step's update with `next(iter(...))`"
    }
  ],
  "blocks": [
    {
      "t": "h",
      "zh": "一、这个小助手做什么",
      "en": "1. What the assistant does"
    },
    {
      "t": "p",
      "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=0) 提示词助手和上一节的代码助手有点像，又不太一样：它根据你的需求**生成并优化提示词**。要写好一个提示词，先得想清楚四件事——目标、要填进去的变量、输出不能做什么、输出必须满足什么。很多人一开始说不全，所以它分两步走：\n\n| 阶段 | 节点 | 做什么 |\n|---|---|---|\n| 收集需求 | `info` | 和你聊天，像问卷一样一项项问清楚 |\n| 写提示词 | `add_tool_message` → `prompt` | 拿到整理好的需求，交给另一次模型调用写出提示词模板 |\n\n难点在于：程序怎么知道「需求已经问齐了」？",
      "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=0) The prompt assistant resembles the previous lesson's coding assistant but differs: it **generates and refines prompts** from your requirements. A good prompt needs four answers – the objective, the variables to fill in, what the output must not do, and what it must do. People rarely give all four at once, so it works in two stages:\n\n| Stage | Node | What happens |\n|---|---|---|\n| Gather | `info` | Chats with you, asking item by item like a questionnaire |\n| Write | `add_tool_message` → `prompt` | Takes the tidied requirements and has another model call write the template |\n\nThe tricky part: how does the program know the requirements are complete?"
    },
    {
      "t": "code",
      "file": {
        "zh": "流程图",
        "en": "flowchart"
      },
      "lang": "text",
      "code": {
        "zh": "START --> info --+--> add_tool_message --> prompt --> END   （模型调用了工具：需求齐了，写提示词）\n                 +--> END                                     （模型在提问：这一轮结束，等用户回答）\n                 +--> info                                    （兜底：最后一条是用户消息）",
        "en": "START --> info --+--> add_tool_message --> prompt --> END     (the model called the tool: write the prompt)\n                 +--> END                                     (the model asked a question: end this turn)\n                 +--> info                                    (fallback: the last message is from the user)"
      }
    },
    {
      "t": "video",
      "zh": "视频里这一集约 10 分钟，做法和 LangGraph 官方教程「根据用户需求生成提示词」一致，模型同样用 **DeepSeek**（本课程用 deepseek-flash，开着思考模式也能跑，原因见第二部分的小测）。老师按「收集需求 → 生成提示词 → 状态逻辑 → 建图 → 测试」的顺序讲，下面每一部分都标了对应的时间点。",
      "en": "This ~10-minute episode follows LangGraph's official “prompt generation from user requirements” tutorial, again with **DeepSeek** as the model (the course's deepseek-flash works even in thinking mode – see the check in part 2). The instructor goes gather → generate → state logic → graph → test; every part below is marked with its timestamp."
    },
    {
      "t": "h",
      "zh": "二、第一步：收集需求",
      "en": "2. Step 1: gather the requirements"
    },
    {
      "t": "p",
      "zh": "[▶ 00:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=32) 先写一个系统提示词，告诉模型它的工作：从用户那里弄清楚四件事；哪一项判断不出来，就请用户说清楚，**不要胡乱猜**；四件事都清楚了，再调用工具。`get_messages_info` 把这段系统提示词放在全部对话的最前面。\n\n[▶ 01:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=63) 然后用 pydantic 定义 `PromptInstructions`：四个字段 objective、variables、constraints、requirements。巧妙之处在这里：用 `bind_tools` 把这个类当成**工具**交给模型，而这个工具**从来不会被执行**——我们要的只是它的**参数**：模型调用它时填进去的内容，就是整理好的需求。于是：\n- 模型的回复里**没有**工具调用 → 它在提问，等用户回答\n- 模型的回复里**有**工具调用 → 需求齐了，切换到写提示词",
      "en": "[▶ 00:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=32) First a system prompt describing the model's job: find out four things from the user; if one is unclear, ask the user to clarify and **don't guess**; once all four are clear, call the tool. `get_messages_info` puts this system prompt in front of the whole conversation.\n\n[▶ 01:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=63) Then a pydantic class `PromptInstructions` with four fields: objective, variables, constraints, requirements. Here's the trick: `bind_tools` hands the class to the model as a **tool**, and the tool is **never executed** – we only want its **arguments**: what the model fills in when calling it is the tidied-up set of requirements. So:\n- **no** tool call in the reply → the model is asking a question; wait for the user\n- a tool call **present** → requirements complete; switch to writing the prompt"
    },
    {
      "t": "code",
      "file": "gather.py",
      "code": {
        "zh": "from langchain_core.messages import SystemMessage\nfrom langchain_deepseek import ChatDeepSeek\nfrom pydantic import BaseModel\nfrom llm import API_KEY, MODEL\n\ntemplate = \"\"\"你的工作是从用户那里了解：他们想创建一个什么样的提示词模板。\n你需要弄清楚下面四件事：\n- 提示词的目标是什么\n- 哪些变量会传进提示词模板\n- 输出不能做什么（限制）\n- 输出必须满足什么（要求）\n\n如果有哪一项判断不出来，就请用户说清楚，不要胡乱猜。\n四件事都弄清楚之后，调用相关的工具。\"\"\"\n\ndef get_messages_info(messages):\n    return [SystemMessage(content=template)] + messages     # 系统提示词 + 全部对话\n\nclass PromptInstructions(BaseModel):\n    \"\"\"关于如何编写提示词模板的说明（需求都问清楚后调用）。\"\"\"\n    objective: str\n    variables: list[str]\n    constraints: list[str]\n    requirements: list[str]\n\nllm = ChatDeepSeek(model=MODEL, api_key=API_KEY)\nllm_with_tool = llm.bind_tools([PromptInstructions])       # 模型自己决定：继续提问，还是调用工具\n\ndef info_chain(state):\n    messages = get_messages_info(state[\"messages\"])\n    response = llm_with_tool.invoke(messages)\n    return {\"messages\": [response]}",
        "en": "from langchain_core.messages import SystemMessage\nfrom langchain_deepseek import ChatDeepSeek\nfrom pydantic import BaseModel\nfrom llm import API_KEY, MODEL\n\ntemplate = \"\"\"Your job is to find out from the user what kind of prompt template they want to create.\nYou need to find out four things:\n- the objective of the prompt\n- which variables will be passed into the prompt template\n- what the output must NOT do (constraints)\n- what the output MUST do (requirements)\n\nIf you can't tell one of them, ask the user to clarify; don't guess wildly.\nOnce all four are clear, call the relevant tool.\"\"\"\n\ndef get_messages_info(messages):\n    return [SystemMessage(content=template)] + messages     # system prompt + the whole conversation\n\nclass PromptInstructions(BaseModel):\n    \"\"\"Instructions on how to write the prompt template (call once everything is clear).\"\"\"\n    objective: str\n    variables: list[str]\n    constraints: list[str]\n    requirements: list[str]\n\nllm = ChatDeepSeek(model=MODEL, api_key=API_KEY)\nllm_with_tool = llm.bind_tools([PromptInstructions])       # the model decides: keep asking, or call the tool\n\ndef info_chain(state):\n    messages = get_messages_info(state[\"messages\"])\n    response = llm_with_tool.invoke(messages)\n    return {\"messages\": [response]}"
      },
      "note": {
        "zh": "类的文档字符串和字段名会变成工具说明发给模型（08 节、12 节）。`list[str]` 表示「字符串组成的列表」；视频写的是 `List[str]`（`from typing import List`），意思一样。`info_chain` 就是图里的 `info` 节点：系统提示词 + 全部对话交给带工具的模型，把回复放进 messages。",
        "en": "The class docstring and field names become the tool description the model reads (lessons 08 and 12). `list[str]` means “a list of strings”; the video writes `List[str]` (`from typing import List`) – same thing. `info_chain` is the graph's `info` node: system prompt + the whole conversation go to the tool-enabled model, and the reply goes into messages."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "这里为什么用 `bind_tools`，而不用 40 节的 `with_structured_output`？",
        "en": "Why `bind_tools` here instead of lesson 40's `with_structured_output`?"
      },
      "options": [
        {
          "zh": "`with_structured_output` 不支持 pydantic 类",
          "en": "`with_structured_output` doesn't accept pydantic classes"
        },
        {
          "zh": "`bind_tools` 让模型自己决定继续提问还是调用工具；`with_structured_output` 每次都强制填表，模型就没法提问了",
          "en": "`bind_tools` lets the model choose between asking and calling the tool; `with_structured_output` forces the form every time, so the model could never ask"
        },
        {
          "zh": "两个完全一样，随便用",
          "en": "They are identical; either works"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "收集阶段大部分回合模型都在提问，只有最后一次才「交表」，所以要让模型自己选。顺带一提：让模型自己选（自动 tool_choice）在 DeepSeek 思考模式下也能用，不需要像 40 节那样关掉思考。",
        "en": "Most turns are questions; only the last one submits the form, so the model must choose. Bonus: letting it choose (automatic tool_choice) works in DeepSeek's thinking mode, so there's no need to switch thinking off as in lesson 40."
      }
    },
    {
      "t": "h",
      "zh": "三、第二步：根据需求写提示词",
      "en": "3. Step 2: write the prompt from the requirements"
    },
    {
      "t": "p",
      "zh": "[▶ 01:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=95) 写提示词用一个新的系统提示词：「根据下面的需求，写一个好的提示词模板」，需求用 `{reqs}` 填进去（`.format()` 见 07 节）。需求从哪来？[▶ 02:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=127) `get_prompt_messages` 把整段历史从头到尾过一遍：\n- 遇到**带工具调用的 AI 消息**：取出调用的参数，这就是需求\n- 遇到 **ToolMessage**（「需求已收到」那条）：跳过\n- 找到工具调用**之后**的其他消息：收集起来（比如提示词写好后你又提的修改意见）\n\n最后返回「填好需求的系统消息 + 工具调用之后的消息」。工具调用之前那些来回提问的消息，写提示词时用不着，就不带了。`isinstance()` 判断消息的类型（25 节），`continue` 跳过这一轮（06 节）。",
      "en": "[▶ 01:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=95) Writing uses a new system prompt: “based on the following requirements, write a good prompt template”, with the requirements filled in through `{reqs}` (`.format()`: lesson 07). Where do the requirements come from? [▶ 02:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=127) `get_prompt_messages` walks the whole history from start to end:\n- an **AI message with a tool call**: take the call's arguments – those are the requirements\n- a **ToolMessage** (the “requirements received” note): skip it\n- other messages **after** the tool call: collect them (e.g. changes you ask for after the first prompt)\n\nIt returns “the system message with the requirements + the messages after the tool call”. The question-and-answer messages before the tool call aren't needed for writing, so they're left out. `isinstance()` checks a message's type (lesson 25); `continue` skips to the next round (lesson 06)."
    },
    {
      "t": "code",
      "file": "prompt_gen.py",
      "code": {
        "zh": "from langchain_core.messages import AIMessage, ToolMessage\n\nprompt_system = \"\"\"根据下面的需求，写一个好的提示词模板：\n\n{reqs}\"\"\"\n\ndef get_prompt_messages(messages):\n    tool_call = None\n    other_msgs = []\n    for m in messages:\n        if isinstance(m, AIMessage) and m.tool_calls:\n            tool_call = m.tool_calls[0][\"args\"]     # 需求 = 工具调用的参数\n        elif isinstance(m, ToolMessage):\n            continue                                # 「需求已收到」这条不需要\n        elif tool_call is not None:\n            other_msgs.append(m)                    # 只收集工具调用之后的消息\n    return [SystemMessage(content=prompt_system.format(reqs=tool_call))] + other_msgs\n\ndef prompt_gen_chain(state):\n    messages = get_prompt_messages(state[\"messages\"])\n    response = llm.invoke(messages)                 # 用不带工具的 llm\n    return {\"messages\": [response]}",
        "en": "from langchain_core.messages import AIMessage, ToolMessage\n\nprompt_system = \"\"\"Based on the following requirements, write a good prompt template:\n\n{reqs}\"\"\"\n\ndef get_prompt_messages(messages):\n    tool_call = None\n    other_msgs = []\n    for m in messages:\n        if isinstance(m, AIMessage) and m.tool_calls:\n            tool_call = m.tool_calls[0][\"args\"]     # requirements = the tool call's arguments\n        elif isinstance(m, ToolMessage):\n            continue                                # the \"requirements received\" note isn't needed\n        elif tool_call is not None:\n            other_msgs.append(m)                    # keep only messages after the tool call\n    return [SystemMessage(content=prompt_system.format(reqs=tool_call))] + other_msgs\n\ndef prompt_gen_chain(state):\n    messages = get_prompt_messages(state[\"messages\"])\n    response = llm.invoke(messages)                 # the tool-free llm\n    return {\"messages\": [response]}"
      }
    },
    {
      "t": "p",
      "zh": "下面用几个简化的消息类把 `get_prompt_messages` 跑一遍（类的写法见 08 节）。点 ▶ 运行，看看哪些消息被留下：",
      "en": "Run `get_prompt_messages` with a few simplified message classes (classes: lesson 08). Press ▶ Run and see which messages are kept:"
    },
    {
      "t": "code",
      "file": "get_prompt_messages_demo.py",
      "run": true,
      "code": {
        "zh": "# 四个简化版的消息类，只为演示（真实的来自 langchain_core.messages）\nclass SystemMessage:\n    def __init__(self, content):\n        self.content = content\n\nclass HumanMessage(SystemMessage):\n    pass\n\nclass ToolMessage(SystemMessage):\n    pass\n\nclass AIMessage:\n    def __init__(self, content, tool_calls=None):\n        self.content = content\n        self.tool_calls = tool_calls or []\n\nprompt_system = \"根据下面的需求，写一个好的提示词模板：\\n{reqs}\"\n\ndef get_prompt_messages(messages):\n    tool_call = None\n    other_msgs = []\n    for m in messages:\n        if isinstance(m, AIMessage) and m.tool_calls:\n            tool_call = m.tool_calls[0][\"args\"]\n        elif isinstance(m, ToolMessage):\n            continue\n        elif tool_call is not None:\n            other_msgs.append(m)\n    return [SystemMessage(prompt_system.format(reqs=tool_call))] + other_msgs\n\nhistory = [\n    HumanMessage(\"我想要一个写诗的提示词\"),\n    AIMessage(\"写什么样的诗？有哪些变量？\"),\n    HumanMessage(\"变量是标题和写作风格，不超过 20 个字，用绝句\"),\n    AIMessage(\"\", tool_calls=[{\"name\": \"PromptInstructions\", \"id\": \"call_1\",\n                               \"args\": {\"objective\": \"写诗\", \"variables\": [\"标题\", \"写作风格\"]}}]),\n    ToolMessage(\"需求已收到，开始生成提示词。\"),\n    AIMessage(\"《{标题}》……（第一版提示词）\"),\n    HumanMessage(\"再加一条：要押韵\"),\n]\nfor m in get_prompt_messages(history):\n    print(type(m).__name__, \"|\", m.content)",
        "en": "# Four simplified message classes, for the demo only (the real ones come from langchain_core.messages)\nclass SystemMessage:\n    def __init__(self, content):\n        self.content = content\n\nclass HumanMessage(SystemMessage):\n    pass\n\nclass ToolMessage(SystemMessage):\n    pass\n\nclass AIMessage:\n    def __init__(self, content, tool_calls=None):\n        self.content = content\n        self.tool_calls = tool_calls or []\n\nprompt_system = \"Based on the following requirements, write a good prompt template:\\n{reqs}\"\n\ndef get_prompt_messages(messages):\n    tool_call = None\n    other_msgs = []\n    for m in messages:\n        if isinstance(m, AIMessage) and m.tool_calls:\n            tool_call = m.tool_calls[0][\"args\"]\n        elif isinstance(m, ToolMessage):\n            continue\n        elif tool_call is not None:\n            other_msgs.append(m)\n    return [SystemMessage(prompt_system.format(reqs=tool_call))] + other_msgs\n\nhistory = [\n    HumanMessage(\"I want a prompt for writing poems\"),\n    AIMessage(\"What kind of poem? Which variables?\"),\n    HumanMessage(\"Variables: title and style; at most 20 characters; a classical quatrain\"),\n    AIMessage(\"\", tool_calls=[{\"name\": \"PromptInstructions\", \"id\": \"call_1\",\n                               \"args\": {\"objective\": \"write a poem\", \"variables\": [\"title\", \"style\"]}}]),\n    ToolMessage(\"Requirements received, generating the prompt.\"),\n    AIMessage(\"<{title}> ... (first version of the prompt)\"),\n    HumanMessage(\"One more rule: it must rhyme\"),\n]\nfor m in get_prompt_messages(history):\n    print(type(m).__name__, \"|\", m.content)"
      }
    },
    {
      "t": "note",
      "zh": "第一次写提示词时，工具调用之后只有一条 ToolMessage（被跳过），所以交给模型的只有一条系统消息。我们实测过，DeepSeek 接受只有系统消息的请求，能正常写出提示词。",
      "en": "The first time the prompt is written, the only message after the tool call is the ToolMessage (skipped), so the model receives just one system message. We tested it: DeepSeek accepts a request with only a system message and writes the prompt fine."
    },
    {
      "t": "h",
      "zh": "四、第三步：判断下一步去哪",
      "en": "4. Step 3: decide where to go next"
    },
    {
      "t": "p",
      "zh": "[▶ 03:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=189) 状态逻辑 `get_state` 看最后一条消息，[▶ 03:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=226) 有三个去向：\n1. 是 AI 消息，而且带工具调用 → `\"add_tool_message\"`：需求齐了，先补一条工具消息，再去写提示词\n2. 不是用户消息（也就是模型的普通回复，在提问）→ `END`\n3. 其他情况（最后一条是用户消息）→ `\"info\"`，回去继续收集\n\n`END` 的意思是「**这一轮**结束」，不是整个对话结束：图停下来，等你在终端里输入下一句。第 3 个去向其实很少走到——`info` 刚运行完，最后一条一定是 AI 的回复——它是一个兜底，画图时就是 `info` 指向自己的那条箭头。\n\n注意：视频讲第 2 个去向时口头说反了，说成「最后一条是用户输入就结束」。以代码为准：最后一条**不是**用户消息，才返回 `END`。",
      "en": "[▶ 03:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=189) The state logic `get_state` looks at the last message; [▶ 03:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=226) there are three exits:\n1. an AI message with a tool call → `\"add_tool_message\"`: requirements complete; add a tool message, then write\n2. not a user message (i.e. the model's ordinary reply – a question) → `END`\n3. anything else (the last message is from the user) → `\"info\"`, keep gathering\n\n`END` means “**this turn** is over”, not the whole conversation: the graph stops and waits for your next line. Exit 3 is rarely taken – right after `info` runs, the last message is always the AI's reply – it's a fallback, and in the drawing it's the arrow from `info` back to itself.\n\nNote: when the video explains exit 2, the spoken description gets it backwards (“a user message ends the turn”). Go by the code: it returns `END` when the last message is **not** from the user."
    },
    {
      "t": "code",
      "file": "get_state.py",
      "code": {
        "zh": "from langgraph.graph import END\n\ndef get_state(state):\n    messages = state[\"messages\"]\n    if isinstance(messages[-1], AIMessage) and messages[-1].tool_calls:\n        return \"add_tool_message\"       # 需求齐了：先补一条工具消息，再去写提示词\n    elif not isinstance(messages[-1], HumanMessage):\n        return END                      # 模型在提问：这一轮结束，等用户回答\n    return \"info\"                       # 兜底：最后一条是用户消息，回去继续收集",
        "en": "from langgraph.graph import END\n\ndef get_state(state):\n    messages = state[\"messages\"]\n    if isinstance(messages[-1], AIMessage) and messages[-1].tool_calls:\n        return \"add_tool_message\"       # requirements complete: add the tool message, then write\n    elif not isinstance(messages[-1], HumanMessage):\n        return END                      # the model asked a question: end this turn, wait for the user\n    return \"info\"                       # fallback: the last message is the user's, keep gathering"
      },
      "note": {
        "zh": "先用 `isinstance(..., AIMessage)` 确认类型，再看 `.tool_calls`：`and` 左边是 `False` 时右边不会执行，所以就算最后一条是别的消息也不会出错。",
        "en": "Confirm the type with `isinstance(..., AIMessage)` before reading `.tool_calls`: when the left side of `and` is `False` the right side never runs, so other message types can't cause an error."
      }
    },
    {
      "t": "h",
      "zh": "五、第四步：组装成图",
      "en": "5. Step 4: assemble the graph"
    },
    {
      "t": "p",
      "zh": "[▶ 04:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=258) 状态里只有 `messages` 一项（用 `add_messages` 追加），编译时加上 checkpointer 保存每一轮的对话。两个普通节点：`info`（用 `info_chain`）和 `prompt`（用 `prompt_gen_chain`）。\n\n[▶ 04:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=292) 第三个节点 `add_tool_message` 用了另一种写法：在函数上面写 `@workflow.add_node`，效果等于 `workflow.add_node(函数)`，节点名就是函数名。它返回一条 ToolMessage，`tool_call_id` 对上刚才的工具调用。",
      "en": "[▶ 04:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=258) The state holds only `messages` (appended via `add_messages`), and the graph is compiled with a checkpointer that keeps every turn. Two ordinary nodes: `info` (`info_chain`) and `prompt` (`prompt_gen_chain`).\n\n[▶ 04:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=292) The third node, `add_tool_message`, is added another way: `@workflow.add_node` above the function is the same as `workflow.add_node(function)`, and the node is named after the function. It returns a ToolMessage whose `tool_call_id` matches the tool call just made."
    },
    {
      "t": "code",
      "file": "build_graph.py",
      "code": {
        "zh": "from typing import Annotated, TypedDict\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.graph import START, StateGraph\nfrom langgraph.graph.message import add_messages\n\nclass State(TypedDict):\n    messages: Annotated[list, add_messages]     # 状态里只有对话\n\nmemory = InMemorySaver()                        # 视频写的 MemorySaver 是同一个类\nworkflow = StateGraph(State)\nworkflow.add_node(\"info\", info_chain)\nworkflow.add_node(\"prompt\", prompt_gen_chain)\n\n@workflow.add_node                              # 用装饰器加节点，节点名就是函数名\ndef add_tool_message(state: State):\n    return {\"messages\": [\n        ToolMessage(content=\"需求已收到，开始生成提示词。\",\n                    tool_call_id=state[\"messages\"][-1].tool_calls[0][\"id\"])\n    ]}\n\nworkflow.add_conditional_edges(\"info\", get_state, [\"add_tool_message\", \"info\", END])\nworkflow.add_edge(\"add_tool_message\", \"prompt\")\nworkflow.add_edge(\"prompt\", END)\nworkflow.add_edge(START, \"info\")\ngraph = workflow.compile(checkpointer=memory)",
        "en": "from typing import Annotated, TypedDict\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.graph import START, StateGraph\nfrom langgraph.graph.message import add_messages\n\nclass State(TypedDict):\n    messages: Annotated[list, add_messages]     # the state holds only the conversation\n\nmemory = InMemorySaver()                        # the video's MemorySaver is the same class\nworkflow = StateGraph(State)\nworkflow.add_node(\"info\", info_chain)\nworkflow.add_node(\"prompt\", prompt_gen_chain)\n\n@workflow.add_node                              # add a node with a decorator; it's named after the function\ndef add_tool_message(state: State):\n    return {\"messages\": [\n        ToolMessage(content=\"Requirements received, generating the prompt.\",\n                    tool_call_id=state[\"messages\"][-1].tool_calls[0][\"id\"])\n    ]}\n\nworkflow.add_conditional_edges(\"info\", get_state, [\"add_tool_message\", \"info\", END])\nworkflow.add_edge(\"add_tool_message\", \"prompt\")\nworkflow.add_edge(\"prompt\", END)\nworkflow.add_edge(START, \"info\")\ngraph = workflow.compile(checkpointer=memory)"
      }
    },
    {
      "t": "warn",
      "zh": "`add_tool_message` 补的那条 ToolMessage 不能省。06 节讲过：带 `tool_calls` 的 AI 消息后面，**必须**跟着对应 `tool_call_id` 的工具消息。提示词写好后，如果你接着说「再短一点」，下一轮 `info` 会把整段历史发给模型；少了这条 ToolMessage，API 直接返回 400。",
      "en": "Don't skip the ToolMessage that `add_tool_message` adds. As lesson 06 showed, an AI message with `tool_calls` **must** be followed by a tool message with the matching `tool_call_id`. After the prompt is written, if you say “make it shorter”, the next `info` turn sends the whole history; without that ToolMessage the API returns 400."
    },
    {
      "t": "tip",
      "zh": "装饰器写法有一个小坑：`add_node` 返回的是图本身，所以装饰之后，`add_tool_message` 这个名字指向的是图（`StateGraph`），不能再当函数直接调用。初学时用 `workflow.add_node(\"名字\", 函数)` 更清楚。[▶ 05:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=323) 老师画出图后说它「比较复杂」：`START → info`，`info` 有三条虚线分别到 `add_tool_message`、`END` 和它自己，`add_tool_message → prompt → END`。自己画：`print(graph.get_graph().draw_mermaid())`，贴到 [mermaid.live](https://mermaid.live)。",
      "en": "One catch with the decorator: `add_node` returns the graph itself, so after decorating, the name `add_tool_message` refers to the graph (a `StateGraph`) and can't be called as a function any more. While learning, `workflow.add_node(\"name\", function)` is clearer. [▶ 05:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=323) The instructor draws the graph and calls it “rather complex”: `START → info`; three dashed arrows leave `info` for `add_tool_message`, `END` and itself; then `add_tool_message → prompt → END`. Draw it yourself: `print(graph.get_graph().draw_mermaid())`, pasted into [mermaid.live](https://mermaid.live)."
    },
    {
      "t": "p",
      "zh": "每次你输入一句话，图都从 `START` 跑一遍。之所以能「接着聊」，是因为 checkpointer 按 `thread_id` 保存了整个状态（回顾 30–31 节）：下一次只传新的一句，`add_messages` 会把它接到保存好的对话后面。视频里的演示大概是这样：",
      "en": "Each line you type runs the graph from `START`. It can “continue the conversation” because the checkpointer stores the whole state under the `thread_id` (see lessons 30–31): you send only the new line, and `add_messages` appends it to the saved chat. The video's demo goes roughly like this:"
    },
    {
      "t": "code",
      "file": {
        "zh": "每一轮走了哪些节点",
        "en": "nodes per turn"
      },
      "lang": "text",
      "code": {
        "zh": "第 1 轮  用户：目标是写作\n         START --> info --> END                      （模型在提问：写哪一类？变量有哪些？）\n第 2 轮  用户：写诗；变量是标题和写作风格；不超过 20 个字；用绝句\n         START --> info --> add_tool_message --> prompt --> END\n                    （模型调用了 PromptInstructions：需求齐了，写出提示词模板）\n第 3 轮  用户：q   → 退出循环",
        "en": "Turn 1  User: the goal is writing\n        START --> info --> END                       (the model asks: what kind? which variables?)\nTurn 2  User: a poem; variables title and style; at most 20 characters; a quatrain\n        START --> info --> add_tool_message --> prompt --> END\n                   (the model called PromptInstructions: all set, write the template)\nTurn 3  User: q   -> leave the loop"
      }
    },
    {
      "t": "h",
      "zh": "六、第五步：在终端里对话测试",
      "en": "6. Step 5: test it in a terminal chat"
    },
    {
      "t": "p",
      "zh": "[▶ 05:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=353) 测试用一个无限循环：先用 `uuid.uuid4()` 生成一个唯一的 `thread_id`（31 节），然后每一轮读一句输入；输入 `q` 或 `Q` 就退出（`in {\"q\", \"Q\"}` 判断是不是其中之一，见 18 节）。否则用 `graph.stream(..., stream_mode=\"updates\")`（38 节）运行这一轮，每一步拿到一个 `{节点名: 更新}` 字典，取出这一步的最后一条消息打印出来；如果最后一步是 `prompt` 节点，说明提示词写好了。",
      "en": "[▶ 05:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=353) The test is an endless loop: first `uuid.uuid4()` makes a unique `thread_id` (lesson 31), then each round reads one line of input; `q` or `Q` quits (`in {\"q\", \"Q\"}` checks membership – lesson 18). Otherwise `graph.stream(..., stream_mode=\"updates\")` (lesson 38) runs the turn, yielding a `{node_name: update}` dict per step; we print that step's last message, and if the last step was the `prompt` node, the prompt is done."
    },
    {
      "t": "py",
      "title": {
        "zh": "next(iter(...))：取出字典里的第一个值",
        "en": "next(iter(...)): the first value in a dict"
      },
      "zh": "`stream` 每一步给出的 `output` 是一个只有一个键的字典：`{节点名: 这个节点返回的更新}`。我们不知道键叫什么，又想拿到那个值，视频用的是 `next(iter(output.values()))`：\n- `output.values()`：字典里所有的值\n- `iter(...)`：把它变成**迭代器**——一个可以「一个一个往外取」的东西（`for` 循环背后就是它）\n- `next(迭代器)`：取出下一个，第一次调用就是第一个\n\n直接 `iter(字典)` 取到的是**键**，所以 `next(iter(output))` 就是节点名。",
      "en": "Each `output` that `stream` yields is a dict with a single key: `{node_name: the update that node returned}`. We don't know the key but want the value, so the video uses `next(iter(output.values()))`:\n- `output.values()`: all the values in the dict\n- `iter(...)`: turns them into an **iterator** – something you can take items from one at a time (it's what a `for` loop uses behind the scenes)\n- `next(iterator)`: takes the next item; the first call gives the first one\n\n`iter(a_dict)` on its own yields the **keys**, so `next(iter(output))` is the node name.",
      "code": {
        "zh": "output = {\"prompt\": {\"messages\": [\"第一条\", \"最后一条\"]}}   # stream 每次给出的样子：{节点名: 更新}\n\nvalues = output.values()            # 所有的值（这里只有一个）\nit = iter(values)                   # 变成一个可以「一个一个往外取」的迭代器\nupdate = next(it)                   # 取第一个\nprint(update)\nprint(update[\"messages\"][-1])       # 这个节点返回的最后一条消息\n\n# 合成一行，就是视频里的写法\nprint(next(iter(output.values()))[\"messages\"][-1])\n\n# 想知道是哪个节点：键\nprint(next(iter(output)))           # 对字典直接 iter，取到的是键\nprint(\"prompt\" in output)           # 「这一步是不是 prompt 节点」",
        "en": "output = {\"prompt\": {\"messages\": [\"first\", \"last\"]}}   # what stream yields each time: {node_name: update}\n\nvalues = output.values()            # all the values (just one here)\nit = iter(values)                   # an iterator you can take items from one by one\nupdate = next(it)                   # take the first\nprint(update)\nprint(update[\"messages\"][-1])       # the last message this node returned\n\n# Combined into one line - the video's version\nprint(next(iter(output.values()))[\"messages\"][-1])\n\n# Which node was it? The key\nprint(next(iter(output)))           # iter over a dict gives its keys\nprint(\"prompt\" in output)           # \"was this step the prompt node?\""
      }
    },
    {
      "t": "code",
      "file": "chat_loop.py",
      "code": {
        "zh": "import uuid\nfrom langchain_core.messages import HumanMessage\n\nconfig = {\"configurable\": {\"thread_id\": str(uuid.uuid4())}}   # 每次运行一个新会话\nwhile True:\n    user = input(\"用户（q/Q 退出）：\")\n    if user in {\"q\", \"Q\"}:\n        print(\"AI：再见！\")\n        break\n    output = None\n    for output in graph.stream({\"messages\": [HumanMessage(content=user)]}, config=config, stream_mode=\"updates\"):\n        last_message = next(iter(output.values()))[\"messages\"][-1]\n        last_message.pretty_print()                 # 按消息类型漂亮地打印\n    if output and \"prompt\" in output:               # 最后一步是 prompt 节点：提示词写好了\n        print(\"完成！\")",
        "en": "import uuid\nfrom langchain_core.messages import HumanMessage\n\nconfig = {\"configurable\": {\"thread_id\": str(uuid.uuid4())}}   # a new thread for each run\nwhile True:\n    user = input(\"User (q/Q to quit): \")\n    if user in {\"q\", \"Q\"}:\n        print(\"AI: Byebye\")\n        break\n    output = None\n    for output in graph.stream({\"messages\": [HumanMessage(content=user)]}, config=config, stream_mode=\"updates\"):\n        last_message = next(iter(output.values()))[\"messages\"][-1]\n        last_message.pretty_print()                 # print it nicely, by message type\n    if output and \"prompt\" in output:               # the last step was the prompt node: done\n        print(\"Done!\")"
      },
      "note": {
        "zh": "`pretty_print()` 是 LangChain 消息自带的方法，会按类型打印一个标题行（Ai Message、Tool Message……），带工具调用时还会列出参数。[▶ 06:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=383) 视频的循环里还准备了一个预设输入的列表（第一句是 hi），配一个下标逐个取用，用于没法手动输入的场合；老师运行时，`input()` 会在编辑器窗口顶部弹出一个输入框，录屏里不太看得清（[▶ 07:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=445)）。",
        "en": "`pretty_print()` is a built-in method of LangChain messages: it prints a header by type (Ai Message, Tool Message…) and lists the arguments of any tool call. [▶ 06:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=383) The video's loop also keeps a list of preset inputs (starting with hi) with an index, for when you can't type; when the instructor runs it, `input()` pops up an input box at the top of the editor window, hard to see in the recording ([▶ 07:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=445))."
      }
    },
    {
      "t": "p",
      "zh": "[▶ 07:56](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=476) 老师的演示就像填问卷：先说「目标是写作」，模型追问写哪一类；他接着在一句话里把四项都给齐：目标是诗歌，变量是标题和写作风格，限制是不超过 20 个字，要求是用绝句。[▶ 09:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=540) 模型识别出需求后调用工具，写出了一个提示词模板（以标题为题、按指定风格写一首四句的绝句，还带了示例），最后输入 q 退出。\n\n下面是练习文件 `l41_prompt_bot_solution.py` 用类似输入真实运行的输出（有删节）。一句话就给齐了四项，所以模型没有追问，直接调用了工具；它还主动指出「不超过 20 个字」只能是五言绝句：",
      "en": "[▶ 07:56](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=476) The instructor's demo feels like a questionnaire: he says “the goal is writing”, the model asks what kind; then he gives all four in one line: a poem, variables title and writing style, at most 20 characters, as a classical quatrain. [▶ 09:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=540) The model recognises the requirements, calls the tool and writes a prompt template (a four-line quatrain on the given title in the given style, with an example); typing q ends the loop.\n\nBelow is a real run of the practice file `l41_prompt_bot_solution.py` with a similar input (shortened). All four points came in one line, so the model asked nothing and called the tool right away; it even pointed out that “at most 20 characters” only fits a five-character quatrain:"
    },
    {
      "t": "code",
      "file": {
        "zh": "输出示例",
        "en": "sample output (translated)"
      },
      "lang": "text",
      "code": {
        "zh": "用户 / User（q/Q 退出 / to quit）: 我想要一个写诗的提示词。目标：写诗；变量：标题和写作风格；限制：不超过 20 个字；要求：用绝句。\n================================== Ai Message ==================================\n\n我先把这四项整理确认一下……绝句分五言（20 字）和七言（28 字），「不超过 20 个字」只能是五言绝句……\nTool Calls:\n  PromptInstructions (call_00_PSRTlEdqB0SpzbZURuFm5150)\n  Args:\n    objective: 写一首诗\n    variables: ['标题', '写作风格']\n    constraints: ['全诗篇幅不超过 20 个字']\n    requirements: ['采用绝句体裁（即五言绝句，四句、每句五字，共 20 字）']\n================================= Tool Message =================================\n\n需求已收到，开始生成提示词。\n================================== Ai Message ==================================\n\n你是一位精通中国古典诗词的诗人。请根据以下变量创作一首诗：\n- 标题：{标题}\n- 写作风格：{写作风格}\n请创作一首五言绝句，并严格遵守以下要求：\n1. 体裁：五言绝句。\n2. 结构：正文共四句，每句五个汉字。\n3. 字数：正文正好 20 字，不得超过 20 字；标题不计入正文 20 字。\n……\n完成！ Done!\n\n用户 / User（q/Q 退出 / to quit）: q\nAI: 再见！ Byebye",
        "en": "User (q/Q to quit): I want a prompt for writing poems. Objective: write a poem; variables: title and writing style; constraint: at most 20 characters; requirement: a classical quatrain.\n================================== Ai Message ==================================\n\nLet me confirm the four points first… A quatrain comes in five-character (20 characters) and seven-character (28 characters) forms, so \"at most 20 characters\" can only be a five-character quatrain…\nTool Calls:\n  PromptInstructions (call_00_PSRTlEdqB0SpzbZURuFm5150)\n  Args:\n    objective: write a poem\n    variables: ['title', 'writing style']\n    constraints: ['the whole poem is at most 20 characters']\n    requirements: ['a quatrain (i.e. a five-character quatrain: four lines of five characters, 20 in total)']\n================================= Tool Message =================================\n\nRequirements received, generating the prompt.\n================================== Ai Message ==================================\n\nYou are a poet well versed in classical Chinese poetry. Write a poem from these variables:\n- Title: {title}\n- Writing style: {writing_style}\nWrite a five-character quatrain and follow these rules strictly:\n1. Form: a five-character quatrain.\n2. Structure: four lines of five characters each.\n3. Length: exactly 20 characters, never more; the title does not count toward the 20.\n…\nDone!\n\nUser (q/Q to quit): q\nAI: Byebye"
      }
    },
    {
      "t": "h",
      "zh": "七、可以继续改进的地方",
      "en": "7. Where to take it next"
    },
    {
      "t": "tip",
      "zh": "[▶ 09:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=571) 老师的建议：给它加一个可以交互的界面，它就能当成一个产品来用。另外可以试试：\n- 第一句只说「我想要一个写周报的提示词」，看模型怎么一步步追问\n- 提示词生成后，接着说「语气再活泼一点」：`info` 会再次收集，模型再调用一次工具，`get_prompt_messages` 会把你的修改意见一起交给写提示词的模型\n- 把生成的模板保存下来，到 45 节用 `PromptTemplate` 填变量使用",
      "en": "[▶ 09:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=42&t=571) The instructor's suggestion: give it an interactive UI and it could be used as a product. Also try:\n- Start with only “I want a prompt for weekly reports” and watch the follow-up questions\n- After the prompt appears, say “make the tone livelier”: `info` gathers again, the model calls the tool again, and `get_prompt_messages` passes your feedback to the writer\n- Save the template and fill its variables with `PromptTemplate` in lesson 45"
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "在这个小助手里，模型调用 `PromptInstructions` 意味着什么？",
        "en": "In this assistant, what does it mean when the model calls `PromptInstructions`?"
      },
      "options": [
        {
          "zh": "模型需要联网搜索提示词",
          "en": "The model wants to search the web for prompts"
        },
        {
          "zh": "用户要退出程序",
          "en": "The user wants to quit"
        },
        {
          "zh": "需求已经问齐了，调用的参数就是整理好的需求，可以开始写提示词",
          "en": "The requirements are complete; the call's arguments hold them, so writing can begin"
        },
        {
          "zh": "模型出错了",
          "en": "The model hit an error"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "这个「工具」从不执行，它的作用是让模型用规定的格式「交表」，同时告诉程序该换阶段了。",
        "en": "The “tool” is never executed; it lets the model submit the form in a fixed format and tells the program to switch stages."
      }
    },
    {
      "q": {
        "zh": "`get_state` 返回 `END` 时，发生了什么？",
        "en": "What happens when `get_state` returns `END`?"
      },
      "options": [
        {
          "zh": "这一轮图运行结束，等用户在终端里输入下一句；对话历史仍保存在 checkpointer 里",
          "en": "This run of the graph ends and waits for the user's next line; the history stays in the checkpointer"
        },
        {
          "zh": "整个对话永久结束，历史被清空",
          "en": "The conversation ends forever and the history is wiped"
        },
        {
          "zh": "程序报错退出",
          "en": "The program crashes"
        },
        {
          "zh": "自动跳到 prompt 节点",
          "en": "It jumps to the prompt node automatically"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "模型刚问了一个问题，需要用户回答，所以这一轮先停下。下一句输入会带着同一个 thread_id 继续。",
        "en": "The model just asked a question that needs an answer, so this run stops. The next input continues with the same thread_id."
      }
    },
    {
      "q": {
        "zh": "`get_prompt_messages` 交给写提示词的模型的是哪些消息？",
        "en": "Which messages does `get_prompt_messages` hand to the prompt-writing model?"
      },
      "options": [
        {
          "zh": "全部历史，一条不少",
          "en": "The whole history, every message"
        },
        {
          "zh": "只有用户说过的话",
          "en": "Only the user's messages"
        },
        {
          "zh": "只有最后一条消息",
          "en": "Only the last message"
        },
        {
          "zh": "一条填好需求的系统消息，加上工具调用之后的消息（跳过 ToolMessage）",
          "en": "One system message with the requirements filled in, plus the messages after the tool call (skipping the ToolMessage)"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "需求取自工具调用的参数；工具调用之前的问答已经「浓缩」进需求里了，之后的修改意见才需要带上。",
        "en": "The requirements come from the tool call's arguments; the Q&A before the call is already condensed into them, and only later feedback needs to come along."
      }
    },
    {
      "q": {
        "zh": "如果 `add_tool_message` 不返回 ToolMessage，什么时候会出问题？",
        "en": "If `add_tool_message` returned no ToolMessage, when would it break?"
      },
      "options": [
        {
          "zh": "编译图的时候",
          "en": "When compiling the graph"
        },
        {
          "zh": "提示词写完后，用户再说一句话，下一轮 info 把历史发给模型时，API 返回 400",
          "en": "After the prompt is written and the user says something else: the next info turn sends the history and the API returns 400"
        },
        {
          "zh": "永远不会出问题",
          "en": "Never"
        },
        {
          "zh": "第一次调用 info 的时候",
          "en": "On the first info call"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "历史里有一条带 tool_calls 的 AI 消息，却没有对应的工具消息，下一次带着这段历史请求就会被拒绝。",
        "en": "The history would hold an AI message with tool_calls but no matching tool message, so the next request with that history is rejected."
      }
    },
    {
      "q": {
        "zh": "编译时去掉 `checkpointer=memory`，其他不变，会怎样？",
        "en": "Compile without `checkpointer=memory`, nothing else changed. What happens?"
      },
      "options": [
        {
          "zh": "完全没有影响",
          "en": "No difference at all"
        },
        {
          "zh": "程序无法启动",
          "en": "The program won't start"
        },
        {
          "zh": "每一轮都只看得到你刚输入的那一句，模型忘了前面回答过的内容，会反复问同样的问题",
          "en": "Each turn sees only your latest line; the model forgets earlier answers and keeps asking the same questions"
        },
        {
          "zh": "提示词会写两遍",
          "en": "The prompt is written twice"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "每次 `stream` 只传了新的一句，前面的对话全靠 checkpointer 按 thread_id 找回来。",
        "en": "Each `stream` call sends only the new line; earlier turns come back only through the checkpointer and thread_id."
      }
    },
    {
      "q": {
        "zh": "用 `@workflow.add_node` 装饰 `add_tool_message` 之后，`add_tool_message` 这个名字指向什么？",
        "en": "After decorating `add_tool_message` with `@workflow.add_node`, what does the name `add_tool_message` refer to?"
      },
      "options": [
        {
          "zh": "图对象本身（`add_node` 返回的就是图），不能再当函数调用",
          "en": "The graph object itself (`add_node` returns the graph), so it can't be called as a function any more"
        },
        {
          "zh": "还是原来的函数",
          "en": "Still the original function"
        },
        {
          "zh": "一条 ToolMessage",
          "en": "A ToolMessage"
        },
        {
          "zh": "None",
          "en": "None"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "装饰器的返回值会替换掉函数名。节点已经注册进图里了，所以图照常运行；只是别再直接调用这个名字。",
        "en": "A decorator's return value replaces the function name. The node is already registered, so the graph runs fine; just don't call that name directly."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "从历史里取出需求",
        "en": "Getting the requirements from the history"
      },
      "code": {
        "zh": "def get_prompt_messages(messages):\n    tool_call = None\n    other_msgs = []\n    for m in messages:\n        if [[isinstance]](m, AIMessage) and m.[[tool_calls]]:\n            tool_call = m.tool_calls[0][\"[[args]]\"]\n        elif isinstance(m, [[ToolMessage]]):\n            [[continue]]\n        elif tool_call is not None:\n            other_msgs.[[append]](m)\n    return [SystemMessage(content=prompt_system.[[format]](reqs=tool_call))] + other_msgs",
        "en": "def get_prompt_messages(messages):\n    tool_call = None\n    other_msgs = []\n    for m in messages:\n        if [[isinstance]](m, AIMessage) and m.[[tool_calls]]:\n            tool_call = m.tool_calls[0][\"[[args]]\"]\n        elif isinstance(m, [[ToolMessage]]):\n            [[continue]]\n        elif tool_call is not None:\n            other_msgs.[[append]](m)\n    return [SystemMessage(content=prompt_system.[[format]](reqs=tool_call))] + other_msgs"
      },
      "explain": {
        "zh": "需求在工具调用的 args 里；ToolMessage 跳过；工具调用之后的消息收集起来；最后把需求填进系统提示词。",
        "en": "The requirements are in the tool call's args; ToolMessages are skipped; later messages are collected; the requirements fill the system prompt."
      }
    },
    {
      "title": {
        "zh": "路由、补工具消息和对话循环",
        "en": "Routing, the tool message and the chat loop"
      },
      "code": {
        "zh": "def get_state(state):\n    messages = state[\"messages\"]\n    if isinstance(messages[-1], AIMessage) and messages[-1].tool_calls:\n        return \"[[add_tool_message]]\"\n    elif not isinstance(messages[-1], [[HumanMessage]]):\n        return [[END]]\n    return \"info\"\n\n@workflow.[[add_node]]\ndef add_tool_message(state):\n    return {\"messages\": [ToolMessage(content=\"需求已收到\", [[tool_call_id]]=state[\"messages\"][-1].tool_calls[0][\"id\"])]}\n\ngraph = workflow.compile([[checkpointer]]=memory)\nconfig = {\"configurable\": {\"[[thread_id]]\": str(uuid.uuid4())}}\nfor output in graph.stream({\"messages\": [HumanMessage(content=user)]}, config=config, stream_mode=\"[[updates]]\"):\n    last_message = [[next]](iter(output.values()))[\"messages\"][-1]",
        "en": "def get_state(state):\n    messages = state[\"messages\"]\n    if isinstance(messages[-1], AIMessage) and messages[-1].tool_calls:\n        return \"[[add_tool_message]]\"\n    elif not isinstance(messages[-1], [[HumanMessage]]):\n        return [[END]]\n    return \"info\"\n\n@workflow.[[add_node]]\ndef add_tool_message(state):\n    return {\"messages\": [ToolMessage(content=\"Requirements received\", [[tool_call_id]]=state[\"messages\"][-1].tool_calls[0][\"id\"])]}\n\ngraph = workflow.compile([[checkpointer]]=memory)\nconfig = {\"configurable\": {\"[[thread_id]]\": str(uuid.uuid4())}}\nfor output in graph.stream({\"messages\": [HumanMessage(content=user)]}, config=config, stream_mode=\"[[updates]]\"):\n    last_message = [[next]](iter(output.values()))[\"messages\"][-1]"
      },
      "explain": {
        "zh": "工具调用 → 补工具消息；不是用户消息 → END；装饰器加节点；checkpointer + thread_id 保存多轮对话；`stream_mode=\"updates\"` 每步给出 {节点名: 更新}。",
        "en": "Tool call → add the tool message; not a user message → END; the decorator adds the node; checkpointer + thread_id keep the chat; `stream_mode=\"updates\"` yields {node: update} per step."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：get_state、补工具消息和建图",
        "en": "Write it: get_state, the tool message and the graph"
      },
      "task": {
        "zh": "假设 `State`、`info_chain`、`prompt_gen_chain` 已经写好。写出：\n1. `get_state(state)`：最后一条是带 `tool_calls` 的 `AIMessage` → `\"add_tool_message\"`；不是 `HumanMessage` → `END`；否则 → `\"info\"`\n2. `workflow = StateGraph(State)`，加入 `info` 和 `prompt` 两个节点\n3. 用 `@workflow.add_node` 加入 `add_tool_message`：返回一条 `ToolMessage`，`tool_call_id` 是最后一条消息 `tool_calls[0][\"id\"]`\n4. 连线：`info` 的条件边（三个去向）、`add_tool_message → prompt → END`、`START → info`；用 `InMemorySaver()` 作为 checkpointer 编译\n\n（框架代码不能在浏览器里运行：写完点「检查关键点」，再补全练习文件 `l41_prompt_bot_todo.py` 实际运行。）",
        "en": "Assume `State`, `info_chain` and `prompt_gen_chain` exist. Write:\n1. `get_state(state)`: last message an `AIMessage` with `tool_calls` → `\"add_tool_message\"`; not a `HumanMessage` → `END`; otherwise → `\"info\"`\n2. `workflow = StateGraph(State)` with the `info` and `prompt` nodes\n3. `add_tool_message` added with `@workflow.add_node`: it returns a `ToolMessage` whose `tool_call_id` is the last message's `tool_calls[0][\"id\"]`\n4. edges: `info`'s conditional edge (three exits), `add_tool_message → prompt → END`, `START → info`; compile with `InMemorySaver()` as the checkpointer\n\n(Framework code can't run in the browser: use “Check key points”, then complete and run `l41_prompt_bot_todo.py`.)"
      },
      "starter": {
        "zh": "from langchain_core.messages import AIMessage, HumanMessage, ToolMessage\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.graph import END, START, StateGraph\n# State、info_chain、prompt_gen_chain 已经写好（见上文）\n\n# 1. get_state(state)：带工具调用的 AI 消息 → \"add_tool_message\"；不是用户消息 → END；否则 → \"info\"\n\n\n# 2. 创建 workflow，加入 info 和 prompt 两个节点\n\n\n# 3. 用装饰器加入 add_tool_message 节点：返回一条 tool_call_id 对得上的 ToolMessage\n\n\n# 4. 连线：info 的条件边、add_tool_message → prompt → END、START → info；带 checkpointer 编译\n",
        "en": "from langchain_core.messages import AIMessage, HumanMessage, ToolMessage\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.graph import END, START, StateGraph\n# State, info_chain and prompt_gen_chain are already written (see above)\n\n# 1. get_state(state): AI message with a tool call -> \"add_tool_message\"; not a user message -> END; else -> \"info\"\n\n\n# 2. create the workflow and add the info and prompt nodes\n\n\n# 3. add the add_tool_message node with the decorator: return a ToolMessage with the matching tool_call_id\n\n\n# 4. edges: info's conditional edge, add_tool_message -> prompt -> END, START -> info; compile with a checkpointer\n"
      },
      "solution": {
        "zh": "from langchain_core.messages import AIMessage, HumanMessage, ToolMessage\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.graph import END, START, StateGraph\n# State、info_chain、prompt_gen_chain 已经写好（见上文）\n\n# 1. get_state(state)：带工具调用的 AI 消息 → \"add_tool_message\"；不是用户消息 → END；否则 → \"info\"\ndef get_state(state):\n    messages = state[\"messages\"]\n    if isinstance(messages[-1], AIMessage) and messages[-1].tool_calls:\n        return \"add_tool_message\"\n    elif not isinstance(messages[-1], HumanMessage):\n        return END\n    return \"info\"\n\n# 2. 创建 workflow，加入 info 和 prompt 两个节点\nworkflow = StateGraph(State)\nworkflow.add_node(\"info\", info_chain)\nworkflow.add_node(\"prompt\", prompt_gen_chain)\n\n# 3. 用装饰器加入 add_tool_message 节点：返回一条 tool_call_id 对得上的 ToolMessage\n@workflow.add_node\ndef add_tool_message(state):\n    return {\"messages\": [ToolMessage(content=\"需求已收到\",\n                                     tool_call_id=state[\"messages\"][-1].tool_calls[0][\"id\"])]}\n\n# 4. 连线：info 的条件边、add_tool_message → prompt → END、START → info；带 checkpointer 编译\nworkflow.add_conditional_edges(\"info\", get_state, [\"add_tool_message\", \"info\", END])\nworkflow.add_edge(\"add_tool_message\", \"prompt\")\nworkflow.add_edge(\"prompt\", END)\nworkflow.add_edge(START, \"info\")\ngraph = workflow.compile(checkpointer=InMemorySaver())\n",
        "en": "from langchain_core.messages import AIMessage, HumanMessage, ToolMessage\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.graph import END, START, StateGraph\n# State, info_chain and prompt_gen_chain are already written (see above)\n\n# 1. get_state(state): AI message with a tool call -> \"add_tool_message\"; not a user message -> END; else -> \"info\"\ndef get_state(state):\n    messages = state[\"messages\"]\n    if isinstance(messages[-1], AIMessage) and messages[-1].tool_calls:\n        return \"add_tool_message\"\n    elif not isinstance(messages[-1], HumanMessage):\n        return END\n    return \"info\"\n\n# 2. create the workflow and add the info and prompt nodes\nworkflow = StateGraph(State)\nworkflow.add_node(\"info\", info_chain)\nworkflow.add_node(\"prompt\", prompt_gen_chain)\n\n# 3. add the add_tool_message node with the decorator: return a ToolMessage with the matching tool_call_id\n@workflow.add_node\ndef add_tool_message(state):\n    return {\"messages\": [ToolMessage(content=\"Requirements received\",\n                                     tool_call_id=state[\"messages\"][-1].tool_calls[0][\"id\"])]}\n\n# 4. edges: info's conditional edge, add_tool_message -> prompt -> END, START -> info; compile with a checkpointer\nworkflow.add_conditional_edges(\"info\", get_state, [\"add_tool_message\", \"info\", END])\nworkflow.add_edge(\"add_tool_message\", \"prompt\")\nworkflow.add_edge(\"prompt\", END)\nworkflow.add_edge(START, \"info\")\ngraph = workflow.compile(checkpointer=InMemorySaver())\n"
      },
      "checks": [
        {
          "zh": "定义了 `get_state`",
          "en": "Defines `get_state`",
          "re": "def\\s+get_state\\s*\\(\\s*\\w+\\s*\\)\\s*:"
        },
        {
          "zh": "用 `isinstance(..., AIMessage)` 并检查 `tool_calls`",
          "en": "Uses `isinstance(..., AIMessage)` and checks `tool_calls`",
          "re": "isinstance\\([^)]*AIMessage\\s*\\)\\s*and\\s+[\\w\\[\\]\\-]+\\.tool_calls"
        },
        {
          "zh": "不是用户消息时返回 `END`",
          "en": "Returns `END` when it isn't a user message",
          "re": "not\\s+isinstance\\([^)]*HumanMessage\\s*\\)\\s*:\\s*\\n\\s*return\\s+END"
        },
        {
          "zh": "用 `@workflow.add_node` 装饰器加节点",
          "en": "Adds a node with the `@workflow.add_node` decorator",
          "re": "@\\w+\\.add_node\\s*\\n\\s*def\\s+add_tool_message"
        },
        {
          "zh": "返回 `ToolMessage`，带 `tool_call_id`",
          "en": "Returns a `ToolMessage` with `tool_call_id`",
          "re": "ToolMessage\\([\\s\\S]*?tool_call_id\\s*="
        },
        {
          "zh": "info 的条件边有三个去向",
          "en": "info's conditional edge has three exits",
          "re": "add_conditional_edges\\(\\s*[\"']info[\"']\\s*,\\s*get_state\\s*,\\s*\\[[^\\]]*add_tool_message[^\\]]*info[^\\]]*END"
        },
        {
          "zh": "`add_tool_message → prompt`",
          "en": "`add_tool_message → prompt`",
          "re": "add_edge\\(\\s*[\"']add_tool_message[\"']\\s*,\\s*[\"']prompt[\"']\\s*\\)"
        },
        {
          "zh": "带 checkpointer 编译",
          "en": "Compiles with a checkpointer",
          "re": "compile\\(\\s*checkpointer\\s*="
        }
      ]
    },
    {
      "title": {
        "zh": "手写：get_prompt_messages",
        "en": "Write it: get_prompt_messages"
      },
      "task": {
        "zh": "不看上面的代码，写出 `get_prompt_messages(messages)`：\n1. `tool_call` 一开始是 `None`，`other_msgs` 是空列表\n2. 遍历 messages：带工具调用的 `AIMessage` → `tool_call = m.tool_calls[0][\"args\"]`；`ToolMessage` → `continue`；已经找到 tool_call 之后的消息 → 放进 `other_msgs`\n3. 返回 `[SystemMessage(prompt_system.format(reqs=tool_call))] + other_msgs`\n\n点 ▶ 运行：应该打印出 3 条消息——填好需求的系统消息（需求字典会换到第二行显示）、第一版提示词、「语气再活泼一点」。",
        "en": "Without looking above, write `get_prompt_messages(messages)`:\n1. `tool_call` starts as `None`, `other_msgs` as an empty list\n2. walk the messages: an `AIMessage` with a tool call → `tool_call = m.tool_calls[0][\"args\"]`; a `ToolMessage` → `continue`; messages after the tool call → into `other_msgs`\n3. return `[SystemMessage(prompt_system.format(reqs=tool_call))] + other_msgs`\n\nPress ▶ Run: it should print 3 messages – the system message with the requirements (the requirements dict shows on a second line), the first prompt version, and “Make the tone livelier”."
      },
      "run": true,
      "starter": {
        "zh": "# 简化版的消息类（真实的来自 langchain_core.messages）\nclass SystemMessage:\n    def __init__(self, content):\n        self.content = content\n\nclass HumanMessage(SystemMessage):\n    pass\n\nclass ToolMessage(SystemMessage):\n    pass\n\nclass AIMessage:\n    def __init__(self, content, tool_calls=None):\n        self.content = content\n        self.tool_calls = tool_calls or []\n\nprompt_system = \"根据下面的需求，写一个好的提示词模板：\\n{reqs}\"\n\ndef get_prompt_messages(messages):\n    \"\"\"返回 [系统消息（填好需求）] + 工具调用之后的消息（跳过 ToolMessage）。\"\"\"\n    # TODO 1. 准备 tool_call（一开始是 None）和空列表 other_msgs\n    # TODO 2. 遍历 messages：带工具调用的 AIMessage → 取 tool_calls[0] 的 args；\n    #         ToolMessage → 跳过；已经找到 tool_call 之后的消息 → 放进 other_msgs\n    # TODO 3. 用 prompt_system.format 填进需求，做成系统消息，拼上 other_msgs 返回\n\nhistory = [\n    HumanMessage(\"我想要一个写周报的提示词\"),\n    AIMessage(\"\", tool_calls=[{\"name\": \"PromptInstructions\", \"id\": \"c1\", \"args\": {\"objective\": \"写周报\"}}]),\n    ToolMessage(\"需求已收到\"),\n    AIMessage(\"第一版提示词……\"),\n    HumanMessage(\"语气再活泼一点\"),\n]\nfor m in get_prompt_messages(history):\n    print(type(m).__name__, \"|\", m.content)",
        "en": "# Simplified message classes (the real ones come from langchain_core.messages)\nclass SystemMessage:\n    def __init__(self, content):\n        self.content = content\n\nclass HumanMessage(SystemMessage):\n    pass\n\nclass ToolMessage(SystemMessage):\n    pass\n\nclass AIMessage:\n    def __init__(self, content, tool_calls=None):\n        self.content = content\n        self.tool_calls = tool_calls or []\n\nprompt_system = \"Based on the following requirements, write a good prompt template:\\n{reqs}\"\n\ndef get_prompt_messages(messages):\n    \"\"\"Return [a system message with the requirements filled in] + messages after the tool call (no ToolMessage).\"\"\"\n    # TODO 1. set up tool_call (None at first) and an empty list other_msgs\n    # TODO 2. walk the messages: AI message with a tool call -> take the args of tool_calls[0];\n    #         ToolMessage -> skip; messages after the tool call -> put them in other_msgs\n    # TODO 3. fill the requirements in with prompt_system.format, make a system message, add other_msgs, return\n\nhistory = [\n    HumanMessage(\"I want a prompt for weekly reports\"),\n    AIMessage(\"\", tool_calls=[{\"name\": \"PromptInstructions\", \"id\": \"c1\", \"args\": {\"objective\": \"weekly report\"}}]),\n    ToolMessage(\"Requirements received\"),\n    AIMessage(\"first version of the prompt...\"),\n    HumanMessage(\"Make the tone livelier\"),\n]\nfor m in get_prompt_messages(history):\n    print(type(m).__name__, \"|\", m.content)"
      },
      "solution": {
        "zh": "# 简化版的消息类（真实的来自 langchain_core.messages）\nclass SystemMessage:\n    def __init__(self, content):\n        self.content = content\n\nclass HumanMessage(SystemMessage):\n    pass\n\nclass ToolMessage(SystemMessage):\n    pass\n\nclass AIMessage:\n    def __init__(self, content, tool_calls=None):\n        self.content = content\n        self.tool_calls = tool_calls or []\n\nprompt_system = \"根据下面的需求，写一个好的提示词模板：\\n{reqs}\"\n\ndef get_prompt_messages(messages):\n    tool_call = None\n    other_msgs = []\n    for m in messages:\n        if isinstance(m, AIMessage) and m.tool_calls:\n            tool_call = m.tool_calls[0][\"args\"]\n        elif isinstance(m, ToolMessage):\n            continue\n        elif tool_call is not None:\n            other_msgs.append(m)\n    return [SystemMessage(prompt_system.format(reqs=tool_call))] + other_msgs\n\nhistory = [\n    HumanMessage(\"我想要一个写周报的提示词\"),\n    AIMessage(\"\", tool_calls=[{\"name\": \"PromptInstructions\", \"id\": \"c1\", \"args\": {\"objective\": \"写周报\"}}]),\n    ToolMessage(\"需求已收到\"),\n    AIMessage(\"第一版提示词……\"),\n    HumanMessage(\"语气再活泼一点\"),\n]\nfor m in get_prompt_messages(history):\n    print(type(m).__name__, \"|\", m.content)",
        "en": "# Simplified message classes (the real ones come from langchain_core.messages)\nclass SystemMessage:\n    def __init__(self, content):\n        self.content = content\n\nclass HumanMessage(SystemMessage):\n    pass\n\nclass ToolMessage(SystemMessage):\n    pass\n\nclass AIMessage:\n    def __init__(self, content, tool_calls=None):\n        self.content = content\n        self.tool_calls = tool_calls or []\n\nprompt_system = \"Based on the following requirements, write a good prompt template:\\n{reqs}\"\n\ndef get_prompt_messages(messages):\n    tool_call = None\n    other_msgs = []\n    for m in messages:\n        if isinstance(m, AIMessage) and m.tool_calls:\n            tool_call = m.tool_calls[0][\"args\"]\n        elif isinstance(m, ToolMessage):\n            continue\n        elif tool_call is not None:\n            other_msgs.append(m)\n    return [SystemMessage(prompt_system.format(reqs=tool_call))] + other_msgs\n\nhistory = [\n    HumanMessage(\"I want a prompt for weekly reports\"),\n    AIMessage(\"\", tool_calls=[{\"name\": \"PromptInstructions\", \"id\": \"c1\", \"args\": {\"objective\": \"weekly report\"}}]),\n    ToolMessage(\"Requirements received\"),\n    AIMessage(\"first version of the prompt...\"),\n    HumanMessage(\"Make the tone livelier\"),\n]\nfor m in get_prompt_messages(history):\n    print(type(m).__name__, \"|\", m.content)"
      },
      "checks": [
        {
          "zh": "`tool_call` 一开始是 `None`",
          "en": "`tool_call` starts as `None`",
          "re": "tool_call\\s*=\\s*None"
        },
        {
          "zh": "用 for 循环遍历 messages",
          "en": "Loops over messages with for",
          "re": "for\\s+\\w+\\s+in\\s+messages\\s*:"
        },
        {
          "zh": "取出工具调用的 `args`",
          "en": "Takes the tool call's `args`",
          "re": "tool_calls\\[\\s*0\\s*\\]\\[\\s*[\"']args[\"']\\s*\\]"
        },
        {
          "zh": "遇到 ToolMessage 用 `continue` 跳过",
          "en": "Skips ToolMessages with `continue`",
          "re": "isinstance\\(\\s*\\w+\\s*,\\s*ToolMessage\\s*\\)\\s*:\\s*\\n\\s*continue"
        },
        {
          "zh": "只在找到 tool_call 之后收集消息",
          "en": "Collects messages only after the tool call",
          "re": "tool_call\\s+is\\s+not\\s+None"
        },
        {
          "zh": "用 `.format(reqs=...)` 填进需求",
          "en": "Fills in the requirements with `.format(reqs=...)`",
          "re": "\\.format\\(\\s*reqs\\s*="
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "用 `with_structured_output` 代替 `bind_tools`：模型每一轮都被迫「交表」，没法提问，只能乱猜需求。",
      "en": "Using `with_structured_output` instead of `bind_tools`: the model must submit the form every turn, can't ask questions and has to guess."
    },
    {
      "zh": "`add_tool_message` 没有补 ToolMessage（或 `tool_call_id` 对不上），提示词写完后再聊一句就报 400。",
      "en": "`add_tool_message` adds no ToolMessage (or a mismatched `tool_call_id`), so one more message after the prompt gets a 400."
    },
    {
      "zh": "没有 checkpointer，或者每轮都生成新的 `thread_id`：模型记不住你答过什么。",
      "en": "No checkpointer, or a new `thread_id` every turn: the model forgets your answers."
    },
    {
      "zh": "路由函数返回的名字和节点名不一致（比如 `\"add_tool\"` 和 `\"add_tool_message\"`），或者没写进条件边的去向列表，运行时报错。",
      "en": "The router returns a name that doesn't match the node (e.g. `\"add_tool\"` vs `\"add_tool_message\"`) or isn't in the conditional edge's list of destinations, which fails at run time."
    },
    {
      "zh": "系统提示词没说清楚什么时候调用工具，模型第一句就带着猜出来的需求调用了它。",
      "en": "A system prompt that doesn't say when to call the tool, so the model calls it on the first line with guessed values."
    },
    {
      "zh": "装饰之后又把 `add_tool_message(...)` 当函数调用——这个名字已经指向图对象了。",
      "en": "Calling `add_tool_message(...)` as a function after decorating it – the name now refers to the graph object."
    },
    {
      "zh": "在循环里写 `output[\"prompt\"]` 而不是 `next(iter(output.values()))`：不是每一步都是 prompt 节点，会 KeyError。",
      "en": "Writing `output[\"prompt\"]` in the loop instead of `next(iter(output.values()))`: not every step is the prompt node, so it raises KeyError."
    }
  ],
  "recap": [
    {
      "zh": "五步：收集需求（info）→ 生成提示词（prompt）→ 状态路由（get_state）→ 建图（含 add_tool_message）→ 终端对话测试。",
      "en": "Five steps: gather (info) → generate the prompt (prompt) → route (get_state) → build the graph (with add_tool_message) → test in a terminal chat."
    },
    {
      "zh": "把 pydantic 类 `PromptInstructions` 用 `bind_tools` 交给模型：模型调用它 = 需求齐了，调用的参数就是需求。",
      "en": "Give the pydantic class `PromptInstructions` to the model with `bind_tools`: calling it = requirements complete, and the arguments are the requirements."
    },
    {
      "zh": "`get_prompt_messages` 取出工具调用的 args 填进系统提示词，只带上工具调用之后的消息。",
      "en": "`get_prompt_messages` puts the tool call's args into the system prompt and keeps only the messages after the call."
    },
    {
      "zh": "`get_state` 三个去向：工具调用 → add_tool_message；模型的普通回复 → END（这一轮结束）；用户消息 → info。",
      "en": "`get_state` has three exits: tool call → add_tool_message; the model's ordinary reply → END (this turn ends); a user message → info."
    },
    {
      "zh": "有工具调用就必须有 ToolMessage，`tool_call_id` 要对上；`@workflow.add_node` 可以用装饰器加节点。",
      "en": "Every tool call needs a ToolMessage with the matching `tool_call_id`; `@workflow.add_node` adds a node with a decorator."
    },
    {
      "zh": "checkpointer + `thread_id`（`uuid.uuid4()`）让 `input()` 循环里的多轮对话接得上；`next(iter(output.values()))` 取出每一步的更新。",
      "en": "A checkpointer + `thread_id` (`uuid.uuid4()`) keep the `input()` loop's conversation together; `next(iter(output.values()))` gets each step's update."
    }
  ],
  "files": [
    {
      "path": "practice/l41_prompt_bot_todo.py",
      "zh": "练习：补全 get_prompt_messages、get_state、add_tool_message 节点、图的连线和对话循环（有 TODO 提示）。",
      "en": "Exercise: complete get_prompt_messages, get_state, the add_tool_message node, the edges and the chat loop (with TODO hints)."
    },
    {
      "path": "practice/l41_prompt_bot_solution.py",
      "zh": "参考答案：和视频结构一致的终端提示词小助手，输入 q 退出。",
      "en": "Solution: the terminal prompt assistant with the video's structure; type q to quit."
    }
  ]
});
