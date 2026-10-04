COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l35",
  "priority": "important",
  "handwrite": false,
  "studyMinutes": 40,
  "source": "subtitle",
  "summary": {
    "zh": "第二种人机交互：**审查工具调用**。跟着视频搭一个天气智能体：模型提出工具调用后，先进入 `human_review_node`，用 `interrupt` 把「这样调用对吗」和工具调用本身交给人；人回复 `continue`（照做）、`update`（改参数再做）或 `feedback`（写意见让模型重来），节点用 `Command(goto=..., update=...)` 决定下一步。最后跑通视频里的三个例子：打招呼不触发审查、北京天气直接批准、深圳天气改成「上海, 中国」再查。",
    "en": "The second kind of human-in-the-loop: **reviewing tool calls**. Following the video, build a weather agent: after the model proposes a tool call, it first goes to `human_review_node`, which uses `interrupt` to show a person “is this correct?” together with the call itself. The person replies `continue` (run it), `update` (run it with edited arguments) or `feedback` (written comments so the model tries again), and the node picks the next step with `Command(goto=..., update=...)`. Finally, run the video's three examples: a greeting triggers no review, Beijing's weather is approved as is, and Shenzhen's is changed to “Shanghai, China” before running."
  },
  "goals": [
    {
      "zh": "说出审查节点在图中的位置：模型提出调用之后、工具执行之前",
      "en": "Place the review node correctly: after the model proposes a call, before the tool runs"
    },
    {
      "zh": "写出 `human_review_node`：用 `interrupt` 交出工具调用，按 continue / update / feedback 分三路",
      "en": "Write `human_review_node`: hand out the tool call with `interrupt` and branch on continue / update / feedback"
    },
    {
      "zh": "理解节点返回 `Command(goto=..., update=...)`：同时修改状态并指定下一步",
      "en": "Understand a node returning `Command(goto=..., update=...)`: change the state and choose the next step at once"
    },
    {
      "zh": "说明改参数时为什么要用**同一个 id** 的消息替换，写意见时为什么要用 tool 消息",
      "en": "Explain why editing uses a message with **the same id**, and why feedback goes in a tool message"
    },
    {
      "zh": "用 `Command(resume={\"action\": ..., \"data\": ...})` 恢复，并读懂运行结果",
      "en": "Resume with `Command(resume={\"action\": ..., \"data\": ...})` and read the results"
    }
  ],
  "blocks": [
    {
      "t": "h",
      "zh": "一、为什么要审查工具调用",
      "en": "1. Why review tool calls"
    },
    {
      "t": "p",
      "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=0) 这一集讲人机交互的第二个用法：审查**工具调用**，尤其是智能体的工具调用。工具调用是智能体真正「动手」的地方：查错了天气无所谓，可要是发邮件、下单、改数据库，一旦出错就收不回来。\n\n[▶ 06:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=408) 老师拿前面做单智能体的经历作对比：那时到了调用工具这一步，人很难插手；LangGraph 则让你可以审查**调的工具对不对、参数对不对**，更进一步还能直接改参数。为什么做得到？在之前那些框架里，「模型决定调用」和「执行工具」由框架一口气完成；而在 LangGraph 里它们是图上的不同节点，中间可以加一道人工关卡。",
      "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=0) This episode covers the second use of human-in-the-loop: reviewing **tool calls**, especially an agent's. Tool calls are where an agent actually *does* things: a wrong weather lookup is harmless, but a wrong email, order or database change can't be undone.\n\n[▶ 06:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=408) The instructor compares this with the single-agent work earlier in the course: back then it was hard for a person to step in at the tool-calling step, whereas LangGraph lets you check **whether the right tool is called with the right arguments** – and even change the arguments. Why is that possible? In those earlier frameworks, “the model decides to call” and “the tool runs” happen in one go inside the framework; in LangGraph they are separate nodes of the graph, so a human checkpoint fits between them."
    },
    {
      "t": "video",
      "zh": "视频里老师是在上一集的例子上改的（根据 B 站 AI 字幕整理）：\n- [▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=0) 工具换成天气查询，不管哪个城市都返回「晴朗」；模型依旧用 **DeepSeek**\n- [▶ 00:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=30) `human_review_node` 用 `interrupt` 问「这是正确的吗」，并把工具调用一起交出去\n- [▶ 01:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=62) 按人的回复分三路：continue / update / feedback\n- [▶ 02:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=127) `run_tool` 负责执行工具；[▶ 02:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=158) `route_after_llm` 判断有没有工具调用\n- [▶ 03:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=220) 画图要联网，当时网络不好，没画出来\n- [▶ 04:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=283) 三个例子：「你好」不触发审查；[▶ 05:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=314) 北京天气 → continue；[▶ 07:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=441) 深圳天气 → update 成「上海, 中国」\n\n这里的代码按本机的 LangGraph 1.2.12 运行过，模型通过 `practice/llm.py` 用 deepseek-flash。feedback 分支视频里只讲了代码、没有演示，练习文件里可以打开它试试。",
      "en": "The instructor adapts the previous episode's example (from the Bilibili AI subtitles):\n- [▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=0) The tool becomes a weather lookup that returns “sunny” for any city; the model is still **DeepSeek**\n- [▶ 00:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=30) `human_review_node` uses `interrupt` to ask “is this correct?”, handing out the tool call too\n- [▶ 01:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=62) It branches three ways on the reply: continue / update / feedback\n- [▶ 02:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=127) `run_tool` executes the tool; [▶ 02:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=158) `route_after_llm` checks for tool calls\n- [▶ 03:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=220) Drawing the graph needs the network, which failed at the time\n- [▶ 04:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=283) Three examples: “hello” triggers no review; [▶ 05:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=314) Beijing's weather → continue; [▶ 07:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=441) Shenzhen's weather → update to “Shanghai, China”\n\nThe code here was run with the installed LangGraph 1.2.12, and the model is deepseek-flash via `practice/llm.py`. The video explains the feedback branch but doesn't run it; you can switch it on in the practice file."
    },
    {
      "t": "h",
      "zh": "二、准备：天气工具、模型和状态",
      "en": "2. Setup: the weather tool, the model and the state"
    },
    {
      "t": "p",
      "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=0) 工具 `weather_search` 打印正在查询哪个城市，然后返回写死的「晴朗！」。状态写成 `class State(MessagesState)`，类体里只有一句 docstring：继承了 `MessagesState`（继承见 32 节）却什么都没加，所以老师说状态「可以是空的」，它和 `MessagesState` 完全一样。[▶ 00:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=30) `call_llm` 节点只做一件事：调用绑定了工具的模型，把回复放进 `messages`。",
      "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=0) The `weather_search` tool prints which city it is looking up and returns a hard-coded “Sunny!”. The state is written `class State(MessagesState)` with only a docstring in the body: it inherits from `MessagesState` (inheritance: lesson 32) and adds nothing, which is why the instructor says the state “can be empty” – it is exactly `MessagesState`. [▶ 00:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=30) The `call_llm` node does one thing: call the tool-bound model and put the reply into `messages`."
    },
    {
      "t": "code",
      "file": {
        "zh": "review_tools.py（第 1 段）",
        "en": "review_tools.py (part 1)"
      },
      "code": {
        "zh": "from typing import Literal\nfrom langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.types import interrupt, Command\nfrom llm import API_KEY, MODEL\n\n@tool\ndef weather_search(city: str) -> str:\n    \"\"\"查询某个城市的天气。\"\"\"\n    print(f\"正在查询：{city}\")\n    return \"晴朗！\"                       # 不管哪个城市都是晴天\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY).bind_tools([weather_search])\n\nclass State(MessagesState):\n    \"\"\"简单的状态：什么都没加，和 MessagesState 一样。\"\"\"\n\ndef call_llm(state: State):\n    return {\"messages\": [model.invoke(state[\"messages\"])]}",
        "en": "from typing import Literal\nfrom langchain_core.tools import tool\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.graph import StateGraph, MessagesState, START, END\nfrom langgraph.checkpoint.memory import InMemorySaver\nfrom langgraph.types import interrupt, Command\nfrom llm import API_KEY, MODEL\n\n@tool\ndef weather_search(city: str) -> str:\n    \"\"\"Search for the weather of a city.\"\"\"\n    print(f\"Searching for: {city}\")\n    return \"Sunny!\"                       # sunny whatever the city\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY).bind_tools([weather_search])\n\nclass State(MessagesState):\n    \"\"\"A simple state: nothing added, the same as MessagesState.\"\"\"\n\ndef call_llm(state: State):\n    return {\"messages\": [model.invoke(state[\"messages\"])]}"
      }
    },
    {
      "t": "h",
      "zh": "三、人工审查节点：三条路",
      "en": "3. The human review node: three paths"
    },
    {
      "t": "p",
      "zh": "[▶ 00:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=30) 审查节点先取出最后一条消息里的工具调用，再用 `interrupt` 暂停，交给人一个字典：问题「这样调用对吗？」加上工具调用本身（工具名、参数、id）。[▶ 01:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=62) 人恢复时也传回一个字典：`action` 是决定，`data` 是附带的数据。",
      "en": "[▶ 00:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=30) The review node takes the tool call from the last message and pauses with `interrupt`, handing the person a dict: the question “is this correct?” plus the tool call itself (tool name, arguments, id). [▶ 01:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=62) The person resumes with a dict too: `action` is the decision and `data` carries any extra data."
    },
    {
      "t": "code",
      "file": {
        "zh": "review_tools.py（第 2 段）",
        "en": "review_tools.py (part 2)"
      },
      "code": {
        "zh": "def human_review_node(state: State) -> Command[Literal[\"call_llm\", \"run_tool\"]]:\n    last_message = state[\"messages\"][-1]\n    tool_call = last_message.tool_calls[-1]\n\n    # 停下，把工具调用交给人看；恢复时 human_review 就是 resume 传进来的字典\n    human_review = interrupt({\"question\": \"这样调用对吗？\", \"tool_call\": tool_call})\n    review_action = human_review[\"action\"]\n    review_data = human_review.get(\"data\")\n\n    if review_action == \"continue\":              # 批准：照原样执行\n        return Command(goto=\"run_tool\")\n\n    elif review_action == \"update\":              # 改参数，再执行\n        updated_message = {\n            \"role\": \"ai\",\n            \"content\": last_message.content,\n            \"tool_calls\": [{\"id\": tool_call[\"id\"], \"name\": tool_call[\"name\"], \"args\": review_data}],\n            \"id\": last_message.id,               # 同一个 id：替换原来那条消息\n        }\n        return Command(goto=\"run_tool\", update={\"messages\": [updated_message]})\n\n    elif review_action == \"feedback\":            # 不执行，把意见当作工具结果交给模型\n        tool_message = {\n            \"role\": \"tool\",\n            \"content\": review_data,\n            \"name\": tool_call[\"name\"],\n            \"tool_call_id\": tool_call[\"id\"],\n        }\n        return Command(goto=\"call_llm\", update={\"messages\": [tool_message]})\n\n    raise ValueError(f\"不认识的审查动作：{review_action}\")   # 视频里没有这一行，防止拼错",
        "en": "def human_review_node(state: State) -> Command[Literal[\"call_llm\", \"run_tool\"]]:\n    last_message = state[\"messages\"][-1]\n    tool_call = last_message.tool_calls[-1]\n\n    # Stop and show the tool call; on resume, human_review is the dict passed via resume\n    human_review = interrupt({\"question\": \"Is this correct?\", \"tool_call\": tool_call})\n    review_action = human_review[\"action\"]\n    review_data = human_review.get(\"data\")\n\n    if review_action == \"continue\":              # approve: run it as is\n        return Command(goto=\"run_tool\")\n\n    elif review_action == \"update\":              # edit the arguments, then run\n        updated_message = {\n            \"role\": \"ai\",\n            \"content\": last_message.content,\n            \"tool_calls\": [{\"id\": tool_call[\"id\"], \"name\": tool_call[\"name\"], \"args\": review_data}],\n            \"id\": last_message.id,               # same id: replaces the original message\n        }\n        return Command(goto=\"run_tool\", update={\"messages\": [updated_message]})\n\n    elif review_action == \"feedback\":            # don't run; give the feedback to the model as the tool result\n        tool_message = {\n            \"role\": \"tool\",\n            \"content\": review_data,\n            \"name\": tool_call[\"name\"],\n            \"tool_call_id\": tool_call[\"id\"],\n        }\n        return Command(goto=\"call_llm\", update={\"messages\": [tool_message]})\n\n    raise ValueError(f\"Unknown review action: {review_action}\")   # not in the video; catches typos"
      }
    },
    {
      "t": "p",
      "zh": "三种决定分别是：\n\n| action | 意思 | 节点返回 | 接下来 |\n|---|---|---|---|\n| `continue` | 工具和参数都对，照做 | `Command(goto=\"run_tool\")` | 执行工具 |\n| `update` | 方向对，参数要改；`data` 是新参数 | `Command(goto=\"run_tool\", update={\"messages\": [改过的 AI 消息]})` | 用新参数执行工具 |\n| `feedback` | 先别执行；`data` 是给模型的意见 | `Command(goto=\"call_llm\", update={\"messages\": [tool 消息]})` | 回到模型，让它按意见重新决定 |\n\n[▶ 01:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=92) 老师说，这个节点其实相当于一个**条件边**，只是里面的判断逻辑多一些：它自己决定下一步去哪。",
      "en": "The three decisions:\n\n| action | Meaning | The node returns | Then |\n|---|---|---|---|\n| `continue` | Tool and arguments are right, go ahead | `Command(goto=\"run_tool\")` | Run the tool |\n| `update` | Right idea, wrong arguments; `data` holds the new ones | `Command(goto=\"run_tool\", update={\"messages\": [edited AI message]})` | Run the tool with the new arguments |\n| `feedback` | Don't run it yet; `data` is a comment for the model | `Command(goto=\"call_llm\", update={\"messages\": [tool message]})` | Back to the model to decide again using the comment |\n\n[▶ 01:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=92) As the instructor puts it, this node is really a **conditional edge** with more logic inside: it decides for itself where to go next."
    },
    {
      "t": "p",
      "zh": "这里 `Command` 出现了第二种用法，别和 34 集的混了：\n- **作为 `stream` / `invoke` 的输入**：`Command(resume=值)`，恢复中断（34 集）。\n- **作为节点的返回值**：`Command(goto=\"节点名\", update={...})`，一次做两件事：`update` 修改状态（和平时节点返回的字典一样），`goto` 指定下一个节点。\n\n节点的返回类型写成 `-> Command[Literal[\"call_llm\", \"run_tool\"]]`，列出它可能去的节点（`Literal` 见 28 节）。本机试过：不写也能运行，但 LangGraph 不知道这些边，画出来的图就不对。\n\n再看两个细节：\n- **update 时 id 要相同**：`messages` 用 `add_messages` 合并，遇到 id 相同的消息是**替换**而不是追加。于是历史里只剩改过参数的那一条，`run_tool` 读到的就是新参数。\n- **feedback 要用 tool 消息**：还是 05 节的规则，带工具调用的 AI 消息后面，每个调用都要有对应 `tool_call_id` 的 tool 消息。人的意见放在「工具结果」的位置，模型读到后会重新考虑。\n\n节点里返回的 `{\"role\": \"ai\", ...}`、`{\"role\": \"tool\", ...}` 这些字典，会被自动转成 `AIMessage`、`ToolMessage`。",
      "en": "This is `Command`'s second use – don't mix it up with lesson 34's:\n- **As input to `stream` / `invoke`**: `Command(resume=value)` resumes an interrupt (lesson 34).\n- **As a node's return value**: `Command(goto=\"node\", update={...})` does two things at once: `update` changes the state (like the dict a node normally returns) and `goto` names the next node.\n\nThe node's return type is `-> Command[Literal[\"call_llm\", \"run_tool\"]]`, listing where it may go (`Literal`: lesson 28). Tried on this machine: it runs without the annotation, but LangGraph doesn't know those edges and draws the graph wrong.\n\nTwo more details:\n- **update needs the same id**: `messages` are merged with `add_messages`, which **replaces** a message with the same id instead of appending. So the history keeps only the edited message, and `run_tool` reads the new arguments.\n- **feedback goes in a tool message**: lesson 05's rule again – after an AI message with tool calls, every call needs a tool message with its `tool_call_id`. The person's comment sits where the tool result would be, and the model reconsiders after reading it.\n\nDicts such as `{\"role\": \"ai\", ...}` and `{\"role\": \"tool\", ...}` returned by the node are converted into `AIMessage` and `ToolMessage` automatically."
    },
    {
      "t": "check",
      "q": {
        "zh": "update 时，新消息里的 `\"id\": last_message.id` 如果漏写了，会怎样？",
        "en": "In update, what happens if you leave out `\"id\": last_message.id`?"
      },
      "options": [
        {
          "zh": "新消息被**追加**到后面，历史里有两条带工具调用的 AI 消息，旧的那条没有对应的工具结果，下一次请求模型会报错",
          "en": "The new message is **appended**, leaving two AI messages with tool calls; the old one has no tool result, so the next model request fails"
        },
        {
          "zh": "和写了 id 一样",
          "en": "The same as with the id"
        },
        {
          "zh": "工具会被执行两次",
          "en": "The tool runs twice"
        },
        {
          "zh": "图直接结束",
          "en": "The graph ends at once"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "`add_messages` 只有在 id 相同时才替换。用真实 DeepSeek 试过这种历史：下一次请求返回 400，提示带 `tool_calls` 的 assistant 消息后面必须跟着回答每个 `tool_call_id` 的 tool 消息。",
        "en": "`add_messages` replaces only on a matching id. Such a history was sent to the real DeepSeek API: the next request fails with 400, saying an assistant message with `tool_calls` must be followed by tool messages answering each `tool_call_id`."
      }
    },
    {
      "t": "h",
      "zh": "四、执行工具和路由",
      "en": "4. Running the tool and routing"
    },
    {
      "t": "p",
      "zh": "[▶ 02:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=127) `run_tool` 是老师手写的「执行工具」节点：对最后一条消息里的每个工具调用，按名字找到工具（07 节的分派表），用参数执行，把结果包成 tool 消息。它做的事和 `ToolNode` 一样，只是自己写出来更容易看清每一步。[▶ 02:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=158) `route_after_llm` 看模型这次有没有调用工具：没有就结束，有就先去审查。",
      "en": "[▶ 02:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=127) `run_tool` is the instructor's hand-written “run the tools” node: for every tool call in the last message it finds the tool by name (lesson 07's dispatch table), runs it with the arguments, and wraps the result in a tool message. It does what `ToolNode` does, but writing it yourself makes each step visible. [▶ 02:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=158) `route_after_llm` checks whether the model called a tool this time: if not, finish; if so, go to review first."
    },
    {
      "t": "code",
      "file": {
        "zh": "review_tools.py（第 3 段）",
        "en": "review_tools.py (part 3)"
      },
      "code": {
        "zh": "def run_tool(state: State):\n    new_messages = []\n    tools = {\"weather_search\": weather_search}       # 工具名 -> 工具\n    tool_calls = state[\"messages\"][-1].tool_calls\n    for tool_call in tool_calls:\n        tool_ = tools[tool_call[\"name\"]]\n        result = tool_.invoke(tool_call[\"args\"])\n        new_messages.append({\"role\": \"tool\", \"name\": tool_call[\"name\"],\n                             \"content\": result, \"tool_call_id\": tool_call[\"id\"]})\n    return {\"messages\": new_messages}\n\ndef route_after_llm(state: State) -> Literal[END, \"human_review_node\"]:   # END 就是字符串 \"__end__\"\n    if len(state[\"messages\"][-1].tool_calls) == 0:\n        return END\n    else:\n        return \"human_review_node\"\n\nbuilder = StateGraph(State)\nbuilder.add_node(call_llm)               # 只传函数时，节点名就是函数名\nbuilder.add_node(run_tool)\nbuilder.add_node(human_review_node)\nbuilder.add_edge(START, \"call_llm\")\nbuilder.add_conditional_edges(\"call_llm\", route_after_llm)\nbuilder.add_edge(\"run_tool\", \"call_llm\")\n# human_review_node 用 Command(goto=...) 自己决定去向，不用给它加边\ngraph = builder.compile(checkpointer=InMemorySaver())",
        "en": "def run_tool(state: State):\n    new_messages = []\n    tools = {\"weather_search\": weather_search}       # tool name -> tool\n    tool_calls = state[\"messages\"][-1].tool_calls\n    for tool_call in tool_calls:\n        tool_ = tools[tool_call[\"name\"]]\n        result = tool_.invoke(tool_call[\"args\"])\n        new_messages.append({\"role\": \"tool\", \"name\": tool_call[\"name\"],\n                             \"content\": result, \"tool_call_id\": tool_call[\"id\"]})\n    return {\"messages\": new_messages}\n\ndef route_after_llm(state: State) -> Literal[END, \"human_review_node\"]:   # END is the string \"__end__\"\n    if len(state[\"messages\"][-1].tool_calls) == 0:\n        return END\n    else:\n        return \"human_review_node\"\n\nbuilder = StateGraph(State)\nbuilder.add_node(call_llm)               # pass just the function: the node is named after it\nbuilder.add_node(run_tool)\nbuilder.add_node(human_review_node)\nbuilder.add_edge(START, \"call_llm\")\nbuilder.add_conditional_edges(\"call_llm\", route_after_llm)\nbuilder.add_edge(\"run_tool\", \"call_llm\")\n# human_review_node picks its own next node with Command(goto=...), so it needs no edges\ngraph = builder.compile(checkpointer=InMemorySaver())"
      },
      "note": {
        "zh": "变量名写成 `tool_` 而不是 `tool`，是为了不盖掉上面导入的装饰器 `tool`（视频里直接叫 `tool`，在函数里面用不会出错）。",
        "en": "The variable is `tool_` rather than `tool` so it doesn't shadow the imported `tool` decorator (the video calls it `tool`, which is harmless inside the function)."
      }
    },
    {
      "t": "p",
      "zh": "[▶ 03:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=189) 整张图的走向：",
      "en": "[▶ 03:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=189) How the whole graph flows:"
    },
    {
      "t": "code",
      "lang": "text",
      "file": {
        "zh": "审查图",
        "en": "The review graph"
      },
      "code": {
        "zh": "START -> call_llm --没有工具调用--> END\n              |\n              +--有工具调用--> human_review_node --continue / update--> run_tool -> call_llm\n                                                  --feedback-----------> call_llm",
        "en": "START -> call_llm --no tool call--> END\n              |\n              +--tool call--> human_review_node --continue / update--> run_tool -> call_llm\n                                                --feedback-----------> call_llm"
      }
    },
    {
      "t": "tip",
      "zh": "[▶ 03:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=220) 视频里画图失败了：`graph.get_graph().draw_mermaid_png()` 默认要把图发给在线服务 mermaid.ink 去渲染，网络不好就会失败。不联网也能看结构：`print(graph.get_graph().draw_mermaid())` 打印出 Mermaid 文本，复制到 https://mermaid.live 就能看到图。",
      "en": "[▶ 03:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=220) Drawing failed in the video: `graph.get_graph().draw_mermaid_png()` sends the graph to the online service mermaid.ink by default, so a bad network breaks it. To see the structure offline, `print(graph.get_graph().draw_mermaid())` prints Mermaid text that you can paste into https://mermaid.live."
    },
    {
      "t": "py",
      "title": {
        "zh": "回顾 07 节的分派表：用纯 Python 模拟三种审查结果",
        "en": "Lesson 07's dispatch table again: simulating the three review outcomes in plain Python"
      },
      "zh": "审查节点和 `run_tool` 用到的都是学过的 Python：\n- 分派表 `tools[名字]` 取出函数，`(**参数字典)` 调用它（07 节、05 节）；\n- `human_review.get(\"data\")`：键不存在时得到 `None`，不会报错（05 节讲过字典的 `.get`）。continue 时人通常不传 `data`，所以这里要用 `.get`，不能用 `[\"data\"]`；\n- `if / elif` 按 `action` 分成三路（05 节）。\n\n下面不用 LangGraph，只用字典模拟一次审查，可以直接运行，改改 `action` 和 `data` 看结果：",
      "en": "The review node and `run_tool` use Python you already know:\n- a dispatch table: `tools[name]` fetches the function and `(**args_dict)` calls it (lessons 07 and 05);\n- `human_review.get(\"data\")` gives `None` instead of an error when the key is missing (a dict's `.get`, lesson 05). A person usually sends no `data` with continue, so use `.get` here, not `[\"data\"]`;\n- `if / elif` branches three ways on `action` (lesson 05).\n\nHere is one review simulated with plain dicts, no LangGraph. Run it, then change `action` and `data` and see what happens:",
      "code": {
        "zh": "def weather_search(city):\n    return f\"{city}：晴朗\"\n\ntools = {\"weather_search\": weather_search}       # 分派表：工具名 -> 函数\n\ndef review(tool_call, human_review):\n    action = human_review[\"action\"]\n    data = human_review.get(\"data\")              # 没有 data 时是 None，不报错\n    if action == \"continue\":\n        return \"照原样执行 -> \" + tools[tool_call[\"name\"]](**tool_call[\"args\"])\n    elif action == \"update\":\n        return \"改参数后执行 -> \" + tools[tool_call[\"name\"]](**data)\n    elif action == \"feedback\":\n        return \"不执行，把意见交给模型 -> \" + data\n\ncall = {\"name\": \"weather_search\", \"args\": {\"city\": \"深圳\"}, \"id\": \"call_1\"}\nprint(review(call, {\"action\": \"continue\"}))\nprint(review(call, {\"action\": \"update\", \"data\": {\"city\": \"上海, 中国\"}}))\nprint(review(call, {\"action\": \"feedback\", \"data\": \"地点请写成「城市, 国家」\"}))",
        "en": "def weather_search(city):\n    return f\"{city}: sunny\"\n\ntools = {\"weather_search\": weather_search}       # dispatch table: tool name -> function\n\ndef review(tool_call, human_review):\n    action = human_review[\"action\"]\n    data = human_review.get(\"data\")              # None when there is no data - no error\n    if action == \"continue\":\n        return \"run as is -> \" + tools[tool_call[\"name\"]](**tool_call[\"args\"])\n    elif action == \"update\":\n        return \"run with new args -> \" + tools[tool_call[\"name\"]](**data)\n    elif action == \"feedback\":\n        return \"don't run, give the model the comment -> \" + data\n\ncall = {\"name\": \"weather_search\", \"args\": {\"city\": \"Shenzhen\"}, \"id\": \"call_1\"}\nprint(review(call, {\"action\": \"continue\"}))\nprint(review(call, {\"action\": \"update\", \"data\": {\"city\": \"Shanghai, China\"}}))\nprint(review(call, {\"action\": \"feedback\", \"data\": \"Please use the 'city, country' format\"}))"
      }
    },
    {
      "t": "h",
      "zh": "五、跑一跑：视频里的三个例子",
      "en": "5. Run it: the video's three examples"
    },
    {
      "t": "code",
      "file": {
        "zh": "review_tools.py（第 4 段）",
        "en": "review_tools.py (part 4)"
      },
      "code": {
        "zh": "def run(inputs, config):\n    for event in graph.stream(inputs, config, stream_mode=\"updates\"):\n        print(event)\n\n# 例 1：不涉及工具，不会触发审查\nrun({\"messages\": [{\"role\": \"user\", \"content\": \"你好\"}]}, {\"configurable\": {\"thread_id\": \"1\"}})\n\n# 例 2：审查后批准\nthread2 = {\"configurable\": {\"thread_id\": \"2\"}}\nrun({\"messages\": [{\"role\": \"user\", \"content\": \"北京天气如何？\"}]}, thread2)    # 停在审查节点\nrun(Command(resume={\"action\": \"continue\"}), thread2)\n\n# 例 3：审查时改参数\nthread3 = {\"configurable\": {\"thread_id\": \"3\"}}\nrun({\"messages\": [{\"role\": \"user\", \"content\": \"深圳天气如何？\"}]}, thread3)\nrun(Command(resume={\"action\": \"update\", \"data\": {\"city\": \"上海, 中国\"}}), thread3)",
        "en": "def run(inputs, config):\n    for event in graph.stream(inputs, config, stream_mode=\"updates\"):\n        print(event)\n\n# Example 1: no tool involved, so no review\nrun({\"messages\": [{\"role\": \"user\", \"content\": \"Hello\"}]}, {\"configurable\": {\"thread_id\": \"1\"}})\n\n# Example 2: review, then approve\nthread2 = {\"configurable\": {\"thread_id\": \"2\"}}\nrun({\"messages\": [{\"role\": \"user\", \"content\": \"What's the weather in Beijing?\"}]}, thread2)   # stops at review\nrun(Command(resume={\"action\": \"continue\"}), thread2)\n\n# Example 3: edit the arguments during review\nthread3 = {\"configurable\": {\"thread_id\": \"3\"}}\nrun({\"messages\": [{\"role\": \"user\", \"content\": \"What's the weather in Shenzhen?\"}]}, thread3)\nrun(Command(resume={\"action\": \"update\", \"data\": {\"city\": \"Shanghai, China\"}}), thread3)"
      },
      "note": {
        "zh": "`print(event)` 会把整条 `AIMessage` 打印出来，deepseek-flash 的思考过程也在里面，很长。完整文件 `practice/l35_review_tools_solution.py` 用一个小函数只打印关键信息，还可以打开 feedback 例子和终端交互模式。",
        "en": "`print(event)` prints whole `AIMessage` objects, including deepseek-flash's reasoning, which is long. The full file `practice/l35_review_tools_solution.py` prints just the key parts with a small helper, and can switch on the feedback example and an interactive terminal mode."
      }
    },
    {
      "t": "p",
      "zh": "用 deepseek-flash 真实运行的结果：\n- **例 1** [▶ 04:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=283)：`call_llm` 直接回答「你好！……你想了解哪个城市的天气呢？」。没有工具调用，`route_after_llm` 直接走向 END，审查节点根本没进去。\n- **例 2** [▶ 05:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=314)：模型调用 `weather_search(city=\"北京\")` → 图停下，中断里是问题和这次调用 → 恢复 `continue` → 工具打印「正在查询：北京」→ 模型回答「北京目前是晴天」。\n- **例 3** [▶ 07:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=441)：模型调用 `weather_search(city=\"深圳\")` → 恢复 `update`，参数改成「上海, 中国」→ 工具查询的是「上海, 中国」。到这里和视频一致，接下来就不同了，见下面的提醒。",
      "en": "Results from a real run with deepseek-flash:\n- **Example 1** [▶ 04:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=283): `call_llm` answers directly (“Hello! … which city's weather would you like?”). No tool call, so `route_after_llm` heads to END and the review node is never entered.\n- **Example 2** [▶ 05:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=314): the model calls `weather_search(city=\"Beijing\")` → the graph stops, with the question and the call in the interrupt → resume with `continue` → the tool prints “Searching for: Beijing” → the model answers that Beijing is sunny.\n- **Example 3** [▶ 07:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=441): the model calls `weather_search(city=\"Shenzhen\")` → resume with `update`, changing the argument to “Shanghai, China” → the tool looks up “Shanghai, China”. Up to here it matches the video; what happens next differs – see the warning below."
    },
    {
      "t": "warn",
      "zh": "例 3 的结尾和视频不一样：\n- 视频里（[▶ 07:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=473)），工具查的是上海，模型最后却回答「深圳天气晴朗」。老师的解释是工具结果写死了；另一个原因是用户问的本来就是深圳。\n- 用 deepseek-flash 实测，模型发现历史里「自己」查的是上海，和用户问的深圳对不上，于是**又提出一次**查深圳的调用（两次实测，参数分别是「深圳」和「深圳, 中国」）。因为每次工具调用都要审查，图又停在了审查节点。\n\n原因在于：改参数之后，模型看到的历史里那条调用就像是它自己发出的，它并不知道是人改的。如果你是有意改的，可以在下一轮用 `feedback` 说明（例如「城市就是要查上海，不用再查深圳」）。LangChain 自带的 `HumanInTheLoopMiddleware`（见本节最后的补充）处理「改参数」时，会在工具结果前面附上一段说明，告诉模型这是审核人改过的，就是为了避免这种情况。",
      "en": "Example 3 ends differently from the video:\n- In the video ([▶ 07:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=36&t=473)) the tool looked up Shanghai, yet the model answered “Shenzhen is sunny”. The instructor puts it down to the hard-coded tool result; another reason is that the user asked about Shenzhen in the first place.\n- With deepseek-flash, the model noticed that “its own” call was for Shanghai, which didn't match the user's Shenzhen, so it **proposed another Shenzhen lookup** (in two test runs the argument was “Shenzhen” and “Shenzhen, China”). Since every tool call is reviewed, the graph stopped at the review node again.\n\nThe reason: after an edit, the call in the history looks as if the model made it itself; it has no idea a person changed it. If the edit is intentional, explain with `feedback` in the next round (e.g. “I really do want Shanghai, no need to check Shenzhen”). LangChain's built-in `HumanInTheLoopMiddleware` (see the extra note at the end) handles edits by prepending a note to the tool result saying a reviewer changed the call – precisely to avoid this."
    },
    {
      "t": "note",
      "zh": "补充：feedback 分支视频里没有演示。在 `practice/l35_review_tools_solution.py` 里把 `RUN_FEEDBACK_DEMO` 改成 `True` 就能试：对「深圳天气如何？」回复 `Command(resume={\"action\": \"feedback\", \"data\": \"地点请写成「城市, 国家」的格式\"})`，模型读到这条意见后，会重新提出一次调用（比如参数改成「深圳, 中国」），这次调用同样要经过审查。（这条流程在本机用假模型测试过。）",
      "en": "Extra: the video doesn't run the feedback branch. Set `RUN_FEEDBACK_DEMO` to `True` in `practice/l35_review_tools_solution.py` to try it: answer “What's the weather in Shenzhen?” with `Command(resume={\"action\": \"feedback\", \"data\": \"Please use the 'city, country' format\"})`; after reading the comment the model proposes a new call (say, with “Shenzhen, China”), and that call is reviewed too. (This flow was tested here with a scripted fake model.)"
    },
    {
      "t": "note",
      "zh": "补充（视频里没有）：如果用 LangChain 1.x 的 `create_agent` 搭智能体，可以直接加一个现成的中间件 `HumanInTheLoopMiddleware(interrupt_on={\"工具名\": True})`，不用自己画审查节点。原理一样，也是 `interrupt` + `Command(resume=...)`，只是格式不同：恢复时传 `{\"decisions\": [...]}`，每个被审查的调用一个决定，`approve` / `edit` / `reject` 大致对应视频里的 continue / update / feedback。完整例子：`practice/l35_hitl_middleware.py`。",
      "en": "Extra (not in the video): if you build the agent with LangChain 1.x's `create_agent`, you can just add the ready-made middleware `HumanInTheLoopMiddleware(interrupt_on={\"tool_name\": True})` instead of drawing a review node. It works the same way underneath – `interrupt` + `Command(resume=...)` – but with a different format: resume with `{\"decisions\": [...]}`, one decision per reviewed call, where `approve` / `edit` / `reject` roughly match the video's continue / update / feedback. Full example: `practice/l35_hitl_middleware.py`."
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "人回复 `{\"action\": \"continue\"}`，审查节点应该返回什么？",
        "en": "The person replies `{\"action\": \"continue\"}`. What should the review node return?"
      },
      "options": [
        {
          "zh": "`Command(resume=\"continue\")`",
          "en": "`Command(resume=\"continue\")`"
        },
        {
          "zh": "`{\"messages\": []}`",
          "en": "`{\"messages\": []}`"
        },
        {
          "zh": "`Command(goto=\"run_tool\")`",
          "en": "`Command(goto=\"run_tool\")`"
        },
        {
          "zh": "`END`",
          "en": "`END`"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "批准时状态不用改，只需要指定下一步去 `run_tool`。`Command(resume=...)` 是传给 `stream` / `invoke` 的，不是节点的返回值。",
        "en": "Approval changes nothing in the state; it only sends the flow to `run_tool`. `Command(resume=...)` is passed to `stream` / `invoke`, not returned by a node."
      }
    },
    {
      "q": {
        "zh": "update 时，新的 AI 消息为什么要带上 `\"id\": last_message.id`？",
        "en": "In update, why must the new AI message carry `\"id\": last_message.id`?"
      },
      "options": [
        {
          "zh": "id 相同会**替换**原来的消息，历史里只留下改过参数的那一条",
          "en": "A matching id **replaces** the original, so only the edited message stays in the history"
        },
        {
          "zh": "不写 id 会有语法错误",
          "en": "Without it there is a syntax error"
        },
        {
          "zh": "id 决定调用哪个工具",
          "en": "The id decides which tool is called"
        },
        {
          "zh": "模型需要 id 才能回答",
          "en": "The model needs the id to answer"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "`add_messages` 按 id 合并。id 不同就会追加一条，旧的工具调用没有结果，下一次请求会报错。",
        "en": "`add_messages` merges by id. A different id appends a new message, leaving the old call without a result, and the next request fails."
      }
    },
    {
      "q": {
        "zh": "feedback 时，为什么把人的意见做成 tool 消息、再回到 `call_llm`？",
        "en": "With feedback, why is the comment made into a tool message before going back to `call_llm`?"
      },
      "options": [
        {
          "zh": "这样工具会被执行",
          "en": "So that the tool runs"
        },
        {
          "zh": "这样图会直接结束",
          "en": "So that the graph ends"
        },
        {
          "zh": "LangGraph 规定每个节点都要返回 tool 消息",
          "en": "LangGraph requires every node to return a tool message"
        },
        {
          "zh": "那次工具调用必须有一条 tool 消息回答；意见放在结果的位置，模型读到后重新决定",
          "en": "That tool call must be answered by a tool message; the comment sits in the result's place and the model decides again after reading it"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "05 节的规则：每个工具调用都要有对应 `tool_call_id` 的 tool 消息。工具没执行，就用人的意见充当结果。",
        "en": "Lesson 05's rule: every tool call needs a tool message with its `tool_call_id`. The tool didn't run, so the person's comment serves as the result."
      }
    },
    {
      "q": {
        "zh": "用户只说「你好」时，审查节点会执行吗？",
        "en": "When the user just says “hello”, does the review node run?"
      },
      "options": [
        {
          "zh": "会，每一轮都要审查",
          "en": "Yes, every turn is reviewed"
        },
        {
          "zh": "不会：模型没有调用工具，`route_after_llm` 直接返回 END",
          "en": "No: the model calls no tool, so `route_after_llm` returns END"
        },
        {
          "zh": "会，但会自动批准",
          "en": "Yes, but it auto-approves"
        },
        {
          "zh": "程序报错",
          "en": "The program raises an error"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "只有出现工具调用时才会进入审查节点。视频 [04:43] 和本机运行都是直接回答、没有停下。",
        "en": "The review node is entered only when there is a tool call. In the video [04:43] and on this machine the model just answers without stopping."
      }
    },
    {
      "q": {
        "zh": "审查节点用 `return Command(goto=...)` 决定去向。下面哪个说法对？",
        "en": "The review node routes with `return Command(goto=...)`. Which statement is right?"
      },
      "options": [
        {
          "zh": "还必须用 `add_edge` 从它连到 `run_tool` 和 `call_llm`",
          "en": "You must still `add_edge` from it to `run_tool` and `call_llm`"
        },
        {
          "zh": "`Command` 只能用来恢复中断",
          "en": "`Command` can only resume interrupts"
        },
        {
          "zh": "不需要 `add_edge`，但最好写返回类型 `Command[Literal[\"call_llm\", \"run_tool\"]]`，LangGraph 才知道有哪些边",
          "en": "No `add_edge` is needed, but declare `Command[Literal[\"call_llm\", \"run_tool\"]]` so LangGraph knows the edges"
        },
        {
          "zh": "`goto` 只能写 `END`",
          "en": "`goto` can only be `END`"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "`goto` 本身就决定了下一步。返回类型标注是给 LangGraph 看的：本机试过，不写也能跑，但 `get_graph()` 里缺这些边，画出来的图不对。",
        "en": "`goto` itself picks the next node. The annotation is for LangGraph: tried here, it runs without it, but `get_graph()` lacks those edges and the drawing is wrong."
      }
    },
    {
      "q": {
        "zh": "例 3 里人把城市改成了上海，deepseek-flash 却又提出一次查深圳的调用。最可能的原因是？",
        "en": "In example 3 the person changed the city to Shanghai, but deepseek-flash proposed another Shenzhen lookup. Most likely why?"
      },
      "options": [
        {
          "zh": "模型看到历史里「自己」查的是上海，和用户问的深圳对不上，它不知道参数是人改的",
          "en": "The model sees that “its own” call was for Shanghai, which doesn't match the user's Shenzhen; it doesn't know a person edited it"
        },
        {
          "zh": "update 分支有 bug，参数没改成功",
          "en": "The update branch is buggy and the edit didn't apply"
        },
        {
          "zh": "`thread_id` 写错了",
          "en": "The `thread_id` is wrong"
        },
        {
          "zh": "工具执行失败了",
          "en": "The tool failed"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "工具确实查了「上海, 中国」，说明修改生效了。只是模型以为是自己的失误，于是想补查深圳。需要时可以用 feedback 向它说明。",
        "en": "The tool really did look up “Shanghai, China”, so the edit worked. The model just thinks it made a mistake and wants to check Shenzhen. Explain with feedback if needed."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "审查节点的三条路",
        "en": "The review node's three paths"
      },
      "code": {
        "zh": "def human_review_node(state: State) -> Command[Literal[\"call_llm\", \"run_tool\"]]:\n    last_message = state[\"messages\"][-1]\n    tool_call = last_message.[[tool_calls]][-1]\n    human_review = [[interrupt]]({\"question\": \"这样调用对吗？\", \"tool_call\": tool_call})\n    review_action = human_review[\"action\"]\n    review_data = human_review.[[get]](\"data\")\n    if review_action == \"[[continue]]\":\n        return Command([[goto]]=\"run_tool\")\n    elif review_action == \"update\":\n        updated_message = {\"role\": \"ai\", \"content\": last_message.content,\n                           \"tool_calls\": [{\"id\": tool_call[\"id\"], \"name\": tool_call[\"name\"], \"args\": review_data}],\n                           \"id\": last_message.[[id]]}\n        return Command(goto=\"run_tool\", [[update]]={\"messages\": [updated_message]})\n    elif review_action == \"feedback\":\n        tool_message = {\"role\": \"[[tool]]\", \"content\": review_data,\n                        \"name\": tool_call[\"name\"], \"tool_call_id\": tool_call[\"id\"]}\n        return Command(goto=\"[[call_llm]]\", update={\"messages\": [tool_message]})",
        "en": "def human_review_node(state: State) -> Command[Literal[\"call_llm\", \"run_tool\"]]:\n    last_message = state[\"messages\"][-1]\n    tool_call = last_message.[[tool_calls]][-1]\n    human_review = [[interrupt]]({\"question\": \"Is this correct?\", \"tool_call\": tool_call})\n    review_action = human_review[\"action\"]\n    review_data = human_review.[[get]](\"data\")\n    if review_action == \"[[continue]]\":\n        return Command([[goto]]=\"run_tool\")\n    elif review_action == \"update\":\n        updated_message = {\"role\": \"ai\", \"content\": last_message.content,\n                           \"tool_calls\": [{\"id\": tool_call[\"id\"], \"name\": tool_call[\"name\"], \"args\": review_data}],\n                           \"id\": last_message.[[id]]}\n        return Command(goto=\"run_tool\", [[update]]={\"messages\": [updated_message]})\n    elif review_action == \"feedback\":\n        tool_message = {\"role\": \"[[tool]]\", \"content\": review_data,\n                        \"name\": tool_call[\"name\"], \"tool_call_id\": tool_call[\"id\"]}\n        return Command(goto=\"[[call_llm]]\", update={\"messages\": [tool_message]})"
      },
      "explain": {
        "zh": "continue 只改去向；update 用相同 id 替换消息再去执行；feedback 用 tool 消息回答这次调用，再回到模型。",
        "en": "continue only changes the route; update replaces the message by id and runs the tool; feedback answers the call with a tool message and goes back to the model."
      }
    },
    {
      "title": {
        "zh": "路由、连图和恢复",
        "en": "Routing, wiring and resuming"
      },
      "code": {
        "zh": "def route_after_llm(state: State) -> Literal[END, \"human_review_node\"]:\n    if len(state[\"messages\"][-1].tool_calls) == [[0]]:\n        return [[END]]\n    else:\n        return \"[[human_review_node]]\"\n\nbuilder.add_edge(START, \"call_llm\")\nbuilder.[[add_conditional_edges]](\"call_llm\", route_after_llm)\nbuilder.add_edge(\"[[run_tool]]\", \"call_llm\")\ngraph = builder.compile(checkpointer=InMemorySaver())\n\nrun(Command([[resume]]={\"action\": \"update\", \"[[data]]\": {\"city\": \"上海, 中国\"}}), thread3)",
        "en": "def route_after_llm(state: State) -> Literal[END, \"human_review_node\"]:\n    if len(state[\"messages\"][-1].tool_calls) == [[0]]:\n        return [[END]]\n    else:\n        return \"[[human_review_node]]\"\n\nbuilder.add_edge(START, \"call_llm\")\nbuilder.[[add_conditional_edges]](\"call_llm\", route_after_llm)\nbuilder.add_edge(\"[[run_tool]]\", \"call_llm\")\ngraph = builder.compile(checkpointer=InMemorySaver())\n\nrun(Command([[resume]]={\"action\": \"update\", \"[[data]]\": {\"city\": \"Shanghai, China\"}}), thread3)"
      },
      "explain": {
        "zh": "有工具调用先去审查；工具执行完回到模型；人的决定通过 `Command(resume=...)` 送回去，修改的参数放在 `data` 里。",
        "en": "Tool calls go to review first; after the tool runs, back to the model; the decision goes back via `Command(resume=...)`, with edited arguments in `data`."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：人工审查节点",
        "en": "Write it: the human review node"
      },
      "task": {
        "zh": "补全 `human_review_node`：\n1. 取出最后一条消息和其中最后一个工具调用\n2. 用 `interrupt` 停下，交出 `question` 和 `tool_call`，返回值存进 `human_review`；从中取出 `action` 和 `data`（`data` 用 `.get`）\n3. `continue`：去 `run_tool`\n4. `update`：造一条 `\"role\": \"ai\"` 的消息，`tool_calls` 里的参数换成 `data`，`\"id\"` 等于原消息的 id，带着它去 `run_tool`\n5. `feedback`：造一条 `\"role\": \"tool\"` 的消息（内容是 `data`，`tool_call_id` 对上），回到 `call_llm`\n\n本地练习文件：`practice/l35_review_tools_todo.py`。",
        "en": "Complete `human_review_node`:\n1. take the last message and its last tool call\n2. stop with `interrupt`, handing out `question` and `tool_call`; store the result in `human_review` and read `action` and `data` from it (`data` with `.get`)\n3. `continue`: go to `run_tool`\n4. `update`: build a `\"role\": \"ai\"` message whose `tool_calls` use `data` as the arguments and whose `\"id\"` equals the original message's id; go to `run_tool` with it\n5. `feedback`: build a `\"role\": \"tool\"` message (content `data`, matching `tool_call_id`) and go back to `call_llm`\n\nLocal practice file: `practice/l35_review_tools_todo.py`."
      },
      "starter": {
        "zh": "from typing import Literal\nfrom langgraph.graph import MessagesState\nfrom langgraph.types import interrupt, Command\n\nclass State(MessagesState):\n    \"\"\"简单的状态。\"\"\"\n\ndef human_review_node(state: State) -> Command[Literal[\"call_llm\", \"run_tool\"]]:\n    # 1. 最后一条消息和工具调用\n\n    # 2. interrupt，取出 action 和 data\n\n    # 3. continue\n\n    # 4. update\n\n    # 5. feedback\n    pass\n",
        "en": "from typing import Literal\nfrom langgraph.graph import MessagesState\nfrom langgraph.types import interrupt, Command\n\nclass State(MessagesState):\n    \"\"\"A simple state.\"\"\"\n\ndef human_review_node(state: State) -> Command[Literal[\"call_llm\", \"run_tool\"]]:\n    # 1. the last message and its tool call\n\n    # 2. interrupt, then read action and data\n\n    # 3. continue\n\n    # 4. update\n\n    # 5. feedback\n    pass\n"
      },
      "solution": {
        "zh": "from typing import Literal\nfrom langgraph.graph import MessagesState\nfrom langgraph.types import interrupt, Command\n\nclass State(MessagesState):\n    \"\"\"简单的状态。\"\"\"\n\ndef human_review_node(state: State) -> Command[Literal[\"call_llm\", \"run_tool\"]]:\n    # 1. 最后一条消息和工具调用\n    last_message = state[\"messages\"][-1]\n    tool_call = last_message.tool_calls[-1]\n    # 2. interrupt，取出 action 和 data\n    human_review = interrupt({\"question\": \"这样调用对吗？\", \"tool_call\": tool_call})\n    review_action = human_review[\"action\"]\n    review_data = human_review.get(\"data\")\n    # 3. continue\n    if review_action == \"continue\":\n        return Command(goto=\"run_tool\")\n    # 4. update\n    elif review_action == \"update\":\n        updated_message = {\n            \"role\": \"ai\",\n            \"content\": last_message.content,\n            \"tool_calls\": [{\"id\": tool_call[\"id\"], \"name\": tool_call[\"name\"], \"args\": review_data}],\n            \"id\": last_message.id,\n        }\n        return Command(goto=\"run_tool\", update={\"messages\": [updated_message]})\n    # 5. feedback\n    elif review_action == \"feedback\":\n        tool_message = {\n            \"role\": \"tool\",\n            \"content\": review_data,\n            \"name\": tool_call[\"name\"],\n            \"tool_call_id\": tool_call[\"id\"],\n        }\n        return Command(goto=\"call_llm\", update={\"messages\": [tool_message]})\n",
        "en": "from typing import Literal\nfrom langgraph.graph import MessagesState\nfrom langgraph.types import interrupt, Command\n\nclass State(MessagesState):\n    \"\"\"A simple state.\"\"\"\n\ndef human_review_node(state: State) -> Command[Literal[\"call_llm\", \"run_tool\"]]:\n    # 1. the last message and its tool call\n    last_message = state[\"messages\"][-1]\n    tool_call = last_message.tool_calls[-1]\n    # 2. interrupt, then read action and data\n    human_review = interrupt({\"question\": \"Is this correct?\", \"tool_call\": tool_call})\n    review_action = human_review[\"action\"]\n    review_data = human_review.get(\"data\")\n    # 3. continue\n    if review_action == \"continue\":\n        return Command(goto=\"run_tool\")\n    # 4. update\n    elif review_action == \"update\":\n        updated_message = {\n            \"role\": \"ai\",\n            \"content\": last_message.content,\n            \"tool_calls\": [{\"id\": tool_call[\"id\"], \"name\": tool_call[\"name\"], \"args\": review_data}],\n            \"id\": last_message.id,\n        }\n        return Command(goto=\"run_tool\", update={\"messages\": [updated_message]})\n    # 5. feedback\n    elif review_action == \"feedback\":\n        tool_message = {\n            \"role\": \"tool\",\n            \"content\": review_data,\n            \"name\": tool_call[\"name\"],\n            \"tool_call_id\": tool_call[\"id\"],\n        }\n        return Command(goto=\"call_llm\", update={\"messages\": [tool_message]})\n"
      },
      "checks": [
        {
          "zh": "用 `human_review = interrupt(...)` 停下并拿到决定",
          "en": "Stops with `human_review = interrupt(...)`",
          "re": "human_review\\s*=\\s*interrupt\\("
        },
        {
          "zh": "用 `.get(\"data\")` 取附带数据",
          "en": "Reads the data with `.get(\"data\")`",
          "re": "\\.get\\(\\s*[\"']data[\"']"
        },
        {
          "zh": "continue 时 `Command(goto=\"run_tool\")`",
          "en": "continue returns `Command(goto=\"run_tool\")`",
          "re": "Command\\(\\s*goto\\s*=\\s*[\"']run_tool[\"']\\s*\\)"
        },
        {
          "zh": "新的 AI 消息带上原来的 id",
          "en": "The new AI message keeps the original id",
          "re": "[\"']id[\"']\\s*:\\s*last_message\\.id"
        },
        {
          "zh": "update 时用 `update={\"messages\": [...]}` 修改状态",
          "en": "update changes the state with `update={\"messages\": [...]}`",
          "re": "update\\s*=\\s*\\{\\s*[\"']messages[\"']"
        },
        {
          "zh": "feedback 消息带上 `tool_call_id`",
          "en": "The feedback message carries `tool_call_id`",
          "re": "[\"']tool_call_id[\"']\\s*:\\s*tool_call\\["
        },
        {
          "zh": "feedback 后回到 `call_llm`",
          "en": "feedback goes back to `call_llm`",
          "re": "goto\\s*=\\s*[\"']call_llm[\"']"
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "把审查放在工具执行之后：工具已经执行完了，审查就没有意义了。",
      "en": "Reviewing after the tool runs: the tool has already done its job, so the review is pointless."
    },
    {
      "zh": "update 时新消息没带原来的 `id`，结果追加了一条新消息，旧的工具调用没有结果，下一次请求模型报 400。",
      "en": "In update, the new message lacks the original `id`: a new message is appended, the old call has no result, and the next model request fails with 400."
    },
    {
      "zh": "feedback 时把意见写成一条普通的 user 消息：那次工具调用没有对应的 tool 消息，模型同样报 400。",
      "en": "In feedback, sending the comment as a plain user message: the tool call has no matching tool message, and the model again returns 400."
    },
    {
      "zh": "恢复时 `action` 拼错（比如写成 `\"approve\"`）：视频的代码只处理这三种 action，没有兜底分支，节点什么都不返回，图悄悄结束，工具也没执行（本机试过）。加一行 `raise ValueError(...)` 能马上发现。",
      "en": "A misspelled `action` on resume (e.g. `\"approve\"`): the video's code handles only these three actions with no fallback, so the node returns nothing, the graph quietly ends and the tool never runs (tried here). A `raise ValueError(...)` line catches it at once."
    },
    {
      "zh": "节点里返回 `Command(resume=...)`，或者给 `stream` 传 `Command(goto=...)`：两种用法弄反了。",
      "en": "Returning `Command(resume=...)` from a node, or passing `Command(goto=...)` to `stream` – the two uses swapped."
    },
    {
      "zh": "依赖 `draw_mermaid_png()` 画图：它要联网，网络不好就失败；用 `draw_mermaid()` 打印文本更稳。",
      "en": "Relying on `draw_mermaid_png()`: it needs the network and fails on a bad connection; printing text with `draw_mermaid()` is safer."
    }
  ],
  "recap": [
    {
      "zh": "审查节点放在「模型提出调用」和「工具执行」之间：call_llm → human_review_node → run_tool → call_llm。",
      "en": "The review node sits between “model proposes” and “tool runs”: call_llm → human_review_node → run_tool → call_llm."
    },
    {
      "zh": "节点里 `human_review = interrupt({...})`，恢复时 `Command(resume={\"action\": ..., \"data\": ...})`。",
      "en": "Inside it, `human_review = interrupt({...})`; resume with `Command(resume={\"action\": ..., \"data\": ...})`."
    },
    {
      "zh": "continue → 去 run_tool；update → 用相同 id 的 AI 消息替换旧的，再去 run_tool；feedback → 用 tool 消息回答这次调用，回到 call_llm。",
      "en": "continue → run_tool; update → replace the old AI message with a same-id one, then run_tool; feedback → answer the call with a tool message and go back to call_llm."
    },
    {
      "zh": "节点返回 `Command(goto=..., update=...)` 同时改状态和指定下一步；写上 `Command[Literal[...]]` 返回类型。",
      "en": "A node returning `Command(goto=..., update=...)` changes the state and picks the next step; declare the `Command[Literal[...]]` return type."
    },
    {
      "zh": "改参数后模型并不知道是人改的，可能会再提一次调用；每次调用都会再经过审查。",
      "en": "After an edit the model doesn't know a person changed it and may propose another call; every call goes through review again."
    }
  ],
  "files": [
    {
      "path": "practice/l35_review_tools_todo.py",
      "zh": "练习：补全审查节点的三条路、路由函数、checkpointer 和恢复（需要 DeepSeek key）。",
      "en": "Exercise: complete the review node's three paths, the router, the checkpointer and resuming (needs the DeepSeek key)."
    },
    {
      "path": "practice/l35_review_tools_solution.py",
      "zh": "参考答案：按视频顺序跑「你好」、北京 continue、深圳 update 三个例子，已用 deepseek-flash 真实跑通；可打开 feedback 例子和终端交互模式。",
      "en": "Solution: runs the video's three examples (hello, Beijing continue, Shenzhen update), tested against the real deepseek-flash; can switch on the feedback example and an interactive mode."
    },
    {
      "path": "practice/l35_hitl_middleware.py",
      "zh": "补充（视频里没有）：用 `create_agent` + `HumanInTheLoopMiddleware` 实现同样的审查。",
      "en": "Extra (not in the video): the same review with `create_agent` + `HumanInTheLoopMiddleware`."
    }
  ]
});
