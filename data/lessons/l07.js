COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l07",
  "priority": "core",
  "handwrite": true,
  "studyMinutes": 60,
  "source": "subtitle",
  "summary": {
    "zh": "ReAct = 推理（Reasoning）+ 行动（Acting）：模型先想清楚下一步，再调用工具，看到结果后接着想，循环到能给出最终回答为止。这一节按视频的顺序，从零写出一个 ReAct Agent：模拟球类数据库的工具和它的 JSON Schema → 要求「思考、行动、观察、回答」的系统提示词 → 对话记录和调用模型的函数 → 最多 5 轮的循环；再看视频里的运行（查出篮球、排球的上场人数，相乘得 30）。拓展部分用正则表达式实现不依赖 `tools` 参数的纯文字版 ReAct。",
    "en": "ReAct = Reasoning + Acting: the model works out its next step, calls a tool, reads the result and thinks again, looping until it can give a final answer. Following the video step by step, this lesson builds a ReAct agent from scratch: a tool that simulates a ball-games database plus its JSON Schema → a system prompt that asks for think, act, observe, answer → the history and a model-calling function → a loop capped at 5 rounds; then it walks through the video's run (look up how many basketball and volleyball players are on court and multiply: 30). An extension builds the original text-only ReAct, without the `tools` parameter, using regular expressions."
  },
  "goals": [
    {
      "zh": "说清楚 ReAct 的循环：Thought → Action → Action Input → Observation → … → Final Answer，以及每一行由谁来写",
      "en": "Explain the ReAct loop – Thought → Action → Action Input → Observation → … → Final Answer – and who writes each line"
    },
    {
      "zh": "按视频的顺序写出 ReAct Agent 的四个部分：模拟数据库的工具和 JSON Schema、ReAct 系统提示词、对话记录 + 调用模型的函数、最多 5 轮的循环",
      "en": "Write the four parts of the video's ReAct agent in order: the simulated-database tool and its JSON Schema, the ReAct system prompt, the history plus a model-calling function, and a loop capped at 5 rounds"
    },
    {
      "zh": "说出为什么要让模型把思考写出来（思维链：写出的内容会成为后续的输入），以及循环为什么必须有最大次数",
      "en": "Explain why the model should write its thinking down (chain of thought: what it writes becomes later input) and why the loop must have a maximum number of rounds"
    },
    {
      "zh": "用工具字典执行工具，用 try/except 把错误变成 Observation 交还给模型",
      "en": "Run tools from a dict of functions, and turn errors into observations with try/except"
    },
    {
      "zh": "（拓展）用 `.format()` 提示词模板和正则表达式，实现不依赖 `tools` 参数的纯文字版 ReAct",
      "en": "(Extension) Build a text-only ReAct without the `tools` parameter, using a `.format()` prompt template and regular expressions"
    },
    {
      "zh": "不看资料，独立手写视频里的 ReAct Agent",
      "en": "Write the video's ReAct agent unaided"
    }
  ],
  "blocks": [
    {
      "t": "h",
      "zh": "一、回顾 ReAct：推理和行动交替进行",
      "en": "1. ReAct recap: reasoning and acting take turns"
    },
    {
      "t": "p",
      "zh": "[▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=1) 这一集把 [03 节](#/lesson/l03)「规划」部分讲过的 ReAct 写成代码（老师说的「上节课」就是那部分理论）。ReAct 是 **Re**asoning（推理）+ **Act**ing（行动）的缩写，来自 2022 年的一篇论文。老师把它看作 Agent 和以前那些解题方式之间一道明显的「分水岭」：模型先推理、理清思路，再行动——借助工具查知识库、联网搜索、获取现实世界的信息；拿到行动结果后**再推理**：还要不要继续行动？下一步做什么？之前哪里需要调整？推理和行动交替进行，所以它天生就是一个**循环**：不指望一次就得出正确结果，而是多试几轮，逐步逼近。\n\n每一步由固定的几部分组成：\n\n| 部分 | 谁写的 | 内容 |\n|---|---|---|\n| `Thought:` 思考 | 模型 | 现在的想法、下一步打算做什么 |\n| `Action:` 行动 | 模型 | 要调用哪个工具 |\n| `Action Input:` | 模型 | 工具的参数 |\n| `Observation:` 观察 | **你的代码** | 工具执行后的结果 |\n| `Final Answer:` 回答 | 模型 | 给用户的最终回答，出现它就结束 |\n\n视频里问的是（大意）：「比赛场上，篮球队的人数乘以排球队的人数，结果是多少？」答案要用到两个数字，问题里一个都没给，正好需要先查、再算。假设有一个查询球类比赛信息的工具 `get_game_info`，一次完整的过程大概是这样（Observation 做了简化）：",
      "en": "[▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=1) This episode turns ReAct, covered in the theory of [lesson 03](#/lesson/l03) under “planning” (the instructor's “last class”), into code. ReAct stands for **Re**asoning + **Act**ing and comes from a 2022 research paper. The instructor sees it as a clear dividing line between agents and earlier ways of solving problems: the model first reasons and sorts out a plan, then acts – using tools to search a knowledge base, look things up online or fetch real-world information; with the result in hand it **reasons again**: is another action needed, which one, and should anything be adjusted? Reasoning and acting alternate, so it is a **loop** by nature: instead of expecting the right answer in one shot, it tries over several rounds and closes in on it.\n\nEach step is made of a few fixed parts:\n\n| Part | Written by | Content |\n|---|---|---|\n| `Thought:` | the model | what it is thinking and plans to do next |\n| `Action:` | the model | which tool to call |\n| `Action Input:` | the model | the tool's arguments |\n| `Observation:` | **your code** | the result of running the tool |\n| `Final Answer:` | the model | the answer for the user – the run ends here |\n\nThe video's question is, roughly: “On court, a basketball team's player count times a volleyball team's – what is it?” The answer needs two numbers the question doesn't give, so the model has to look them up first and calculate afterwards. With a tool `get_game_info` that looks up ball games, a full run looks roughly like this (Observations shortened):"
    },
    {
      "t": "code",
      "file": "ReAct",
      "lang": "text",
      "code": {
        "zh": "Question: 比赛场上，篮球队的人数乘以排球队的人数，结果是多少？\nThought: 要分别查到篮球和排球比赛时每队场上有几人，再相乘。先查篮球。\nAction: get_game_info\nAction Input: {\"game_name\": \"篮球\"}\nObservation: 每队一般有 12 名队员，比赛时每队场上 5 人，其余是替补。   ← 你的代码执行工具后写入\nThought: 场上是 5 人（12 是全队人数）。再查排球。\nAction: get_game_info\nAction Input: {\"game_name\": \"排球\"}\nObservation: 排球：比赛时每队场上 6 人；沙滩排球：每队只有 2 人。       ← 你的代码执行工具后写入\nThought: 问的是普通排球，场上 6 人。5 × 6 = 30，可以回答了。\nFinal Answer: 篮球场上 5 人，排球场上 6 人，相乘等于 30。",
        "en": "Question: On court, a basketball team's player count times a volleyball team's – what is it?\nThought: I need how many players each team has on court in basketball and in volleyball, then multiply. Basketball first.\nAction: get_game_info\nAction Input: {\"game_name\": \"basketball\"}\nObservation: A team usually has 12 players; 5 per team are on court, the rest are substitutes.   <- written by your code\nThought: 5 are on court (12 is the whole squad). Now volleyball.\nAction: get_game_info\nAction Input: {\"game_name\": \"volleyball\"}\nObservation: volleyball: 6 per team on court; beach volleyball: only 2 per team.                  <- written by your code\nThought: The question means regular volleyball, 6 on court. 5 × 6 = 30 – I can answer.\nFinal Answer: 5 basketball players and 6 volleyball players are on court per team; 5 × 6 = 30."
      }
    },
    {
      "t": "p",
      "zh": "要注意：模型**只会写字**，它并不能真的去查数据库。真正执行工具的是你的程序：看懂模型要调用哪个工具、参数是什么，调用对应的函数，再把结果作为 Observation 交还给模型。\n\n「要调用哪个工具」有两种传法：\n- **原生工具调用**：工具说明放进 05 节的 `tools` 参数，模型在回复的 `tool_calls` 里提出调用。**视频用的是这一种**，第二到七部分按视频的顺序讲。\n- **纯文字**：让模型把 `Action:`、`Action Input:` 直接写在回复的文字里，由你的代码去解析。这是 ReAct 论文最初的写法，放在第八、九部分的拓展里。",
      "en": "Note that the model **only writes text**; it cannot actually query a database. Your program does that: it works out which tool the model wants and with which arguments, calls the matching function, and hands the result back as the Observation.\n\n“Which tool to call” can travel in two ways:\n- **Native tool calling**: the tool descriptions go in the `tools` parameter from lesson 05, and the model asks for a call in the `tool_calls` field of its reply. **This is what the video does** – parts 2 to 7 follow the video in order.\n- **Plain text**: the model writes `Action:` and `Action Input:` straight into its reply text and your code parses them. This is how the ReAct paper originally did it – covered in the extension, parts 8 and 9."
    },
    {
      "t": "video",
      "zh": "视频（P8，约 18 分钟）的结构如下，点时间可以直接跳到那一段：\n- [▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=1) 回顾 ReAct：推理和行动交错、循环进行\n- [▶ 02:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=127) 工具：用一个函数模拟球类比赛「数据库」\n- [▶ 03:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=218) 用 JSON Schema 描述这个工具\n- [▶ 04:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=251) ReAct 系统提示词，以及它和思维链的关系\n- [▶ 06:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=408) 对话记录列表和调用模型的函数\n- [▶ 07:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=472) Agent 循环：最多 5 次\n- [▶ 11:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=692) 运行：篮球人数 × 排球人数，逐步解读结果\n- [▶ 16:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=1010) 结尾：自我反思也能放进同样的循环\n\n这一集字幕里没有再提用的是哪个模型；它用到了工具调用，应该还是 05 集换上的阿里通义千问 `qwen-plus`（老师当时说他用的 DeepSeek V3 调不了工具，才换的模型）。这里统一用 DeepSeek（`deepseek-flash`，见 [环境准备](#/setup)）。字幕看不到屏幕上的代码，所以下面的变量名、提示词措辞和数据是按老师的讲解重新写的，细节以视频为准。",
      "en": "The video (P8, about 18 min) runs in this order – click a time to jump there:\n- [▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=1) ReAct recap: reasoning and acting interleave in a loop\n- [▶ 02:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=127) The tool: a function that simulates a ball-games “database”\n- [▶ 03:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=218) Describing the tool with JSON Schema\n- [▶ 04:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=251) The ReAct system prompt, and how it relates to chain of thought\n- [▶ 06:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=408) The history list and the function that calls the model\n- [▶ 07:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=472) The agent loop: at most 5 rounds\n- [▶ 11:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=692) The run: basketball players × volleyball players, read step by step\n- [▶ 16:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=1010) Wrap-up: self-reflection fits into the same loop\n\nThe subtitles of this episode don't name the model again; since it uses tool calling, it presumably still uses Alibaba's Qwen `qwen-plus`, which the instructor switched to in episode 05 (he said his DeepSeek V3 couldn't call tools then). This course uses DeepSeek (`deepseek-flash`, see [Setup](#/setup)) throughout. The subtitles can't show the code on screen, so the variable names, prompt wording and data below are rewritten from the instructor's explanation – the video has the exact details."
    },
    {
      "t": "check",
      "q": {
        "zh": "ReAct 的过程里，哪一行**不是**模型写的？",
        "en": "In a ReAct run, which line is **not** written by the model?"
      },
      "options": [
        {
          "zh": "`Thought:`",
          "en": "`Thought:`"
        },
        {
          "zh": "`Action Input:`",
          "en": "`Action Input:`"
        },
        {
          "zh": "`Observation:`",
          "en": "`Observation:`"
        },
        {
          "zh": "`Final Answer:`",
          "en": "`Final Answer:`"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "`Observation` 是你的代码真正执行工具后得到的结果。如果让模型自己写，它就会编造一个结果。",
        "en": "`Observation` is the real result your code gets by running the tool. If the model wrote it, the result would be made up."
      }
    },
    {
      "t": "h",
      "zh": "二、准备工具：模拟的球类数据库",
      "en": "2. The tool: a fake ball-games database"
    },
    {
      "t": "p",
      "zh": "[▶ 02:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=127) 做 ReAct Agent 必然要借助工具。视频用一个函数**模拟数据库查询**：里面存着篮球、排球等各种球类运动的基本介绍和人员安排（比如全队 12 人，其中 5 人上场，其余替补），函数按参数 `game_name`（比赛名称）从这些数据里检索。不管把它看成工具还是数据库，它的作用都一样：从外部给模型补充**它自己没有的精确信息**。\n\n下面用一个列表模拟数据库，`get_game_info` 按比赛名称查找。点 ▶ 运行试试：",
      "en": "[▶ 02:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=127) A ReAct agent can't do without tools. The video uses a function that **simulates a database query**: it holds a short description and the squad rules of several ball games such as basketball and volleyball (say, 12 players in a team, 5 of them on court, the rest substitutes), and looks the data up by the argument `game_name`. Call it a tool or a database – either way its job is to give the model **precise information it doesn't have itself**, from outside.\n\nBelow, a list stands in for the database and `get_game_info` looks games up by name. Press ▶ Run:"
    },
    {
      "t": "code",
      "file": "game_tool.py",
      "code": {
        "zh": "import json\n\n# 模拟的数据库：每个元素是一种球类比赛\nGAMES = [\n    {\"name\": \"篮球\", \"intro\": \"两队把球投进对方的篮筐得分。\", \"players\": \"每队一般有 12 名队员，比赛时每队场上 5 人，其余是替补。\"},\n    {\"name\": \"排球\", \"intro\": \"两队隔着球网击球，不让球落在本方场地上。\", \"players\": \"比赛时每队场上 6 人，其余是替补。\"},\n    {\"name\": \"沙滩排球\", \"intro\": \"在沙地上进行的排球比赛。\", \"players\": \"每队只有 2 人，没有替补。\"},\n    {\"name\": \"足球\", \"intro\": \"两队用脚把球踢进对方的球门得分。\", \"players\": \"比赛时每队场上 11 人，其中 1 人是守门员。\"},\n]\n\ndef get_game_info(game_name):\n    \"\"\"按比赛名称查询：名称里包含 game_name 的比赛都会返回。\"\"\"\n    results = []\n    for game in GAMES:\n        if game_name in game[\"name\"]:          # \"排球\" in \"沙滩排球\" 也是 True\n            results.append(game)\n    if not results:\n        return f\"没有找到和「{game_name}」有关的比赛。\"\n    return json.dumps(results, ensure_ascii=False)\n\nprint(get_game_info(\"篮球\"))\nprint(get_game_info(\"排球\"))       # 两条结果：排球和沙滩排球\nprint(get_game_info(\"乒乓球\"))",
        "en": "import json\n\n# A fake database: each item is one ball game\nGAMES = [\n    {\"name\": \"basketball\", \"intro\": \"Two teams score by shooting the ball through the other side's hoop.\", \"players\": \"A team usually has 12 players; 5 per team are on court during a game, the rest are substitutes.\"},\n    {\"name\": \"volleyball\", \"intro\": \"Two teams hit the ball over a net and keep it from landing on their side.\", \"players\": \"6 players per team are on court during a game; the rest are substitutes.\"},\n    {\"name\": \"beach volleyball\", \"intro\": \"Volleyball played on sand.\", \"players\": \"Only 2 players per team, no substitutes.\"},\n    {\"name\": \"football\", \"intro\": \"Two teams score by kicking the ball into the other side's goal.\", \"players\": \"11 players per team are on the pitch during a game, one of them the goalkeeper.\"},\n]\n\ndef get_game_info(game_name):\n    \"\"\"Look up games by name: every game whose name contains game_name is returned.\"\"\"\n    results = []\n    for game in GAMES:\n        if game_name in game[\"name\"]:          # \"volleyball\" in \"beach volleyball\" is True too\n            results.append(game)\n    if not results:\n        return f\"No game matching '{game_name}' was found.\"\n    return json.dumps(results, ensure_ascii=False)\n\nprint(get_game_info(\"basketball\"))\nprint(get_game_info(\"volleyball\"))   # two results: volleyball and beach volleyball\nprint(get_game_info(\"table tennis\"))"
      },
      "run": true,
      "note": {
        "zh": "用在两个字符串之间时，`a in b` 判断 `b` 里有没有 `a` 这段文字。所以查「排球」时，「排球」和「沙滩排球」都会被找到——视频里查排球也得到了两种排球，要由模型自己判断用哪一条。`json.dumps(..., ensure_ascii=False)` 把列表变成 JSON 字符串，中文保持原样（回顾 05 节）。",
        "en": "Between two strings, `a in b` checks whether the text `a` appears inside `b`. So looking up “volleyball” finds both “volleyball” and “beach volleyball” – in the video, too, the volleyball lookup returned two kinds and the model had to pick the right one. `json.dumps(..., ensure_ascii=False)` turns the list into a JSON string and keeps non-English text readable (see lesson 05)."
      }
    },
    {
      "t": "p",
      "zh": "[▶ 03:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=218) 光有函数还不够，模型得知道有这个工具、什么时候该用。所以和 05 节一样，用 JSON Schema 描述它：函数名、参数，再加一句说明——能查到某种球类比赛的简介和每队人数。之后只要问题涉及球类比赛和人数，模型就会调用它，拿到更准确的数据。",
      "en": "[▶ 03:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=218) A function alone isn't enough: the model has to know the tool exists and when to use it. So, as in lesson 05, it is described with JSON Schema – the function name, its parameter, and a sentence saying it looks up a ball game's basic information and squad sizes. From then on, whenever a question involves ball games and player counts, the model calls it to get precise data."
    },
    {
      "t": "code",
      "file": "tools.py",
      "code": {
        "zh": "tools = [{\n    \"type\": \"function\",\n    \"function\": {\n        \"name\": \"get_game_info\",\n        \"description\": \"查询球类比赛的基本介绍和人数规模（每队有几人、比赛时场上有几人）。\",\n        \"parameters\": {\n            \"type\": \"object\",\n            \"properties\": {\n                \"game_name\": {\"type\": \"string\", \"description\": \"比赛名称，例如：篮球、排球\"},\n            },\n            \"required\": [\"game_name\"],\n        },\n    },\n}]",
        "en": "tools = [{\n    \"type\": \"function\",\n    \"function\": {\n        \"name\": \"get_game_info\",\n        \"description\": \"Look up a ball game's basic description and team sizes (squad size, players on court).\",\n        \"parameters\": {\n            \"type\": \"object\",\n            \"properties\": {\n                \"game_name\": {\"type\": \"string\", \"description\": \"The game's name, e.g. basketball, volleyball\"},\n            },\n            \"required\": [\"game_name\"],\n        },\n    },\n}]"
      },
      "note": {
        "zh": "和 05 节的天气工具写法一样。`description` 要写清楚这个工具能查什么，模型读到它，才知道遇到球类比赛的问题时该调用这个工具。",
        "en": "Written exactly like the weather tool in lesson 05. The `description` must say what the tool can look up – that is how the model knows to call it for a question about ball games."
      }
    },
    {
      "t": "h",
      "zh": "三、ReAct 系统提示词",
      "en": "3. The ReAct system prompt"
    },
    {
      "t": "p",
      "zh": "[▶ 04:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=251) 接下来是系统提示词，这是 ReAct 的核心。视频的提示词把解题思路直接告诉模型：按「思考 → 行动 → 观察 → 回答」的循环工作；不要追求一次就输出结果，慢慢来；哪里还没准备好，就继续循环，最后才给出答案。然后逐个说明每一步做什么：\n- **思考**：把自己对问题的想法清楚地写下来\n- **行动**：通过工具去做具体的事\n- **观察**：把工具的执行结果展示出来\n- **回答**：信息足够了，再给出最终答案\n\n提示词往往有很多行，先学一个写多行字符串的办法：",
      "en": "[▶ 04:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=251) Next comes the system prompt – the heart of ReAct. The video's prompt tells the model how to solve problems: work in a think → act → observe → answer loop; don't aim to produce the result in one go, take it slowly; if something isn't ready yet, keep looping, and only give the answer at the end. It then explains each step:\n- **Think**: write down clearly how you see the problem\n- **Act**: do something concrete through a tool\n- **Observe**: show the tool's result\n- **Answer**: once there is enough information, give the final answer\n\nPrompts often run over many lines, so first a way to write multi-line strings:"
    },
    {
      "t": "py",
      "title": {
        "zh": "三引号字符串：多行文字",
        "en": "Triple-quoted strings: multi-line text"
      },
      "zh": "系统提示词往往有很多行。用**三引号** `\"\"\"...\"\"\"` 写字符串，中间可以直接换行，写成什么样，字符串就是什么样，不用在每行末尾写 `\\n`。\n\n两个小细节：\n- 开头的 `\"\"\"` 后面如果直接回车，字符串的第一个字符就是一个换行。想避免，就把第一行文字紧跟在 `\"\"\"` 后面。\n- 三引号里可以直接写单个的 `\"` 和 `'`，不用转义，写提示词里的示例很方便。",
      "en": "A system prompt usually spans many lines. With **triple quotes** `\"\"\"...\"\"\"` you can put line breaks straight into the string; it is exactly what you see, with no `\\n` at the end of each line.\n\nTwo small details:\n- If you press Enter right after the opening `\"\"\"`, the string starts with a line break. To avoid it, start the first line right after the `\"\"\"`.\n- Single `\"` and `'` characters can go inside triple quotes without escaping – handy for examples inside a prompt.",
      "code": {
        "zh": "SYSTEM_PROMPT = \"\"\"你是一个助手。\n请一步一步思考。\n回答以 \"Final Answer: \" 开头。\"\"\"\nprint(SYSTEM_PROMPT)\n\n# 和用 \\n 换行的普通字符串完全一样\nsame = \"你是一个助手。\\n请一步一步思考。\\n回答以 \\\"Final Answer: \\\" 开头。\"\nprint(SYSTEM_PROMPT == same)              # True\n\n# 开头的 \"\"\" 后面直接回车，字符串就以一个换行开头\nstarts_with_newline = \"\"\"\n第一行\"\"\"\nprint(starts_with_newline == \"\\n第一行\")  # True",
        "en": "SYSTEM_PROMPT = \"\"\"You are an assistant.\nThink step by step.\nStart your answer with \"Final Answer: \".\"\"\"\nprint(SYSTEM_PROMPT)\n\n# Exactly the same as a normal string with \\n line breaks\nsame = \"You are an assistant.\\nThink step by step.\\nStart your answer with \\\"Final Answer: \\\".\"\nprint(SYSTEM_PROMPT == same)              # True\n\n# A line break right after the opening \"\"\" becomes the first character\nstarts_with_newline = \"\"\"\nfirst line\"\"\"\nprint(starts_with_newline == \"\\nfirst line\")  # True"
      }
    },
    {
      "t": "p",
      "zh": "下面是按视频思路写的版本（措辞是这里自己写的，视频原文以视频为准）：",
      "en": "Here is a version that follows the video's idea (the wording is ours; see the video for the original):"
    },
    {
      "t": "code",
      "file": "react_prompt.py",
      "code": {
        "zh": "SYSTEM_PROMPT = \"\"\"你是一个会使用工具解决问题的助手。不要急着一次给出答案，请按下面的循环一步一步来：\n\nThought（思考）：写下你对问题的理解，以及下一步打算做什么。\nAction（行动）：需要信息时，调用工具去获取。\nObservation（观察）：工具的结果会返回给你。读懂它，再进入下一轮思考。\n\n重复「思考 → 行动 → 观察」，直到信息足够，再给出：\nFinal Answer（回答）：给用户的最终回答。\n\n规则：\n1. 每次调用工具之前，先用 \"Thought: ...\" 写出你的思考。\n2. 球类比赛的信息一定要先用工具查询，不要凭记忆回答。\n3. 最终回答以 \"Final Answer: \" 开头，只根据工具返回的真实数据回答。\"\"\"",
        "en": "SYSTEM_PROMPT = \"\"\"You are an assistant that solves problems with tools. Don't rush to answer in one go; work step by step in this loop:\n\nThought: write down how you understand the problem and what you plan to do next.\nAction: when you need information, call a tool to get it.\nObservation: the tool's result comes back to you. Read it, then start the next Thought.\n\nRepeat Thought -> Action -> Observation until you have enough information, then give:\nFinal Answer: the final answer for the user.\n\nRules:\n1. Before each tool call, write your thinking as \"Thought: ...\".\n2. Always look up ball-game facts with the tool; never answer from memory.\n3. Start the final answer with \"Final Answer: \" and base it only on the real data the tool returned.\"\"\""
      },
      "note": {
        "zh": "第 2 条规则是这里加的：篮球 5 人、排球 6 人这种常识模型本来就知道，不加这条，它可能不调用工具直接回答，你就看不到「思考 → 行动 → 观察」的过程了。",
        "en": "Rule 2 is our addition: the model already knows common facts like 5 basketball and 6 volleyball players, so without it the model may skip the tool and answer directly, and you would not see the think → act → observe process."
      }
    },
    {
      "t": "p",
      "zh": "[▶ 05:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=344) 为什么要让模型把思考写出来？老师把它和思维链（Chain of Thought）联系在一起：模型写出来的文字，会成为它后面生成内容的**输入**。思路、按思路做的步骤、每一步的结果都写进对话里，后面的推理就有了依据。所以这种写法能提高准确性、减少幻觉——这也是提示词里要强调「先思考、最后再回答」的原因。",
      "en": "[▶ 05:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=344) Why make the model write its thinking down? The instructor ties it to chain of thought: whatever the model writes becomes **input** for what it generates next. With the plan, the steps taken and each step's result all in the conversation, later reasoning has something solid to build on. That improves accuracy and cuts down hallucinations – which is why the prompt insists on thinking first and answering last."
    },
    {
      "t": "h",
      "zh": "四、对话记录和调用模型的函数",
      "en": "4. The history and the function that calls the model"
    },
    {
      "t": "p",
      "zh": "[▶ 06:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=408) 准备工作的最后一步：用一个列表保存对话记录，第一条放系统提示词，这样模型的设定永远排在最前面。再写一个调用模型的函数，它做了两件重要的事：把发出的内容记进对话记录，把模型的回复也记进去。这样每次调用，模型都能看到完整的上下文（05 节的 `get_completion(message)` 就是这样写的）。",
      "en": "[▶ 06:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=408) The last piece of preparation: a list holds the history, with the system prompt as its first item so the model's setup always comes first. Then a function calls the model and does two important things: it records what is sent, and it records the model's reply too. That way every call shows the model the full context (lesson 05's `get_completion(message)` works like this)."
    },
    {
      "t": "code",
      "file": "history.py",
      "code": {
        "zh": "from llm import client, MODEL\n# tools（第二部分）和 SYSTEM_PROMPT（第三部分）见上面\n\nmessages = [{\"role\": \"system\", \"content\": SYSTEM_PROMPT}]   # 对话记录：第一条是系统提示词\n\ndef ask_model():\n    \"\"\"把整个对话记录发给模型，并把模型的回复存进对话记录（06 节）。\"\"\"\n    response = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)\n    reply = response.choices[0].message\n    messages.append(reply.model_dump())\n    return reply",
        "en": "from llm import client, MODEL\n# tools (part 2) and SYSTEM_PROMPT (part 3) are defined above\n\nmessages = [{\"role\": \"system\", \"content\": SYSTEM_PROMPT}]   # the history: the system prompt comes first\n\ndef ask_model():\n    \"\"\"Send the whole history to the model and store its reply in the history (lesson 06).\"\"\"\n    response = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)\n    reply = response.choices[0].message\n    messages.append(reply.model_dump())\n    return reply"
      },
      "note": {
        "zh": "和视频的一点区别：视频里调用模型的函数会把要发出的那条消息也一起存进记录（像 05 节的 `get_completion(message)`）。这里的 `ask_model()` 不带参数，只负责「发送整个记录 + 存回复」；提问和工具结果由循环先存好，再调用它。原因是 05 节讲过的：模型一次可能请求好几个工具，每一个 `tool_call_id` 都要先有对应的 tool 消息，才能再次调用模型。",
        "en": "One difference from the video: there, the function that calls the model also stores the message being sent (like lesson 05's `get_completion(message)`). Here `ask_model()` takes no argument and only sends the whole history and stores the reply; the loop stores the question and the tool results first, then calls it. The reason is the one from lesson 05: the model may ask for several tools at once, and every `tool_call_id` needs its tool message before the model can be called again."
      }
    },
    {
      "t": "note",
      "zh": "[▶ 07:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=441) 老师也提醒：这里没有做任何记忆管理，对话记录只会越来越长。小例子完全够用；真要长时间、成千上万次地对话下去，效果就会变差。怎样控制上下文长度，回顾 06 节。",
      "en": "[▶ 07:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=441) The instructor also points out that there is no memory management here: the history only ever grows. That is fine for a small example, but over a long conversation with thousands of turns the results get worse. For keeping the context in check, see lesson 06."
    },
    {
      "t": "h",
      "zh": "五、Agent 循环：最多 5 次",
      "en": "5. The agent loop: at most 5 rounds"
    },
    {
      "t": "p",
      "zh": "[▶ 07:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=472) 下面是 Agent 本身，其中最重要的就是**循环**。有了循环，才能把对话的主动权交给模型：什么时候结束、怎么结束，由模型来决定——它不再需要工具时，就给出答案。没有循环，就谈不上 Agent。\n\n[▶ 08:56](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=536) 老师接着强调一个工程习惯：写循环时，脑子里一定要先想好「最多循环几次」，掉进死循环是很糟糕的。所以视频设了最大循环次数 5（复杂的问题可以调大，简单的问题调小），再用一个从 1 开始的计数器记录当前是第几次，每循环一次就加 1，超过最大值就强制停下。会停在这里，要么是低估了问题的难度，要么是模型正沿着错误的路一直走下去，这时就该停下来调整。",
      "en": "[▶ 07:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=472) Now the agent itself, and its most important part is the **loop**. The loop is what hands control of the conversation to the model: the model decides when and how it ends – once it needs no more tools, it answers. Without a loop there is no agent.\n\n[▶ 08:56](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=536) The instructor then stresses an engineering habit: whenever you write a loop, first decide how many times it may run at most – an endless loop is a bad place to be. So the video sets a maximum of 5 rounds (raise it for hard problems, lower it for simple ones) and keeps a counter starting at 1 that goes up by one each round; once it passes the maximum, the loop is forced to stop. Hitting that limit means either the problem was harder than expected or the model is heading further and further down a wrong path – time to stop and adjust."
    },
    {
      "t": "p",
      "zh": "[▶ 10:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=600) 循环体里，每一轮做这几件事：\n1. 调用模型（发送整个对话记录），把回复存进记录\n2. 打印回复里的文字，这是模型的**思考**\n3. 回复里没有 `tool_calls` → 模型不再需要工具，这就是**最终回答**，返回它\n4. 否则执行工具（**行动**），把结果打印出来（**观察**），并交回给模型：作为 `tool` 消息存进对话记录\n5. 计数器加 1，进入下一轮\n\n[▶ 11:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=661) 简单的问题，看到一次观察结果就能回答；结果还不够用，模型就再思考、再行动、再观察，直到它确认结果能解决问题。所以真正在循环的是「思考、行动、观察」这三步，答案只在最后输出一次。",
      "en": "[▶ 10:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=600) Inside the loop, each round does this:\n1. Call the model (sending the whole history) and store its reply\n2. Print the reply's text – that is the model's **thought**\n3. No `tool_calls` in the reply → the model needs no more tools; this is the **final answer**, so return it\n4. Otherwise run the tool (**act**), print the result (**observe**), and hand it back to the model by storing it in the history as a `tool` message\n5. Add 1 to the counter and start the next round\n\n[▶ 11:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=661) A simple question can be answered after one observation; if the result isn't enough, the model thinks, acts and observes again until it is sure the result solves the problem. So what really loops is think, act, observe – the answer is produced once, at the end."
    },
    {
      "t": "p",
      "zh": "执行工具之前先解决一个小问题（**补充**：视频里只有一个工具，这一步是为工具变多做准备）。模型想调用的工具，在 `tool_calls` 里只是一个名字字符串，比如 `\"get_game_info\"`。怎样根据这个字符串调用对应的函数？可以写一长串 `if name == ...: elif ...`，但工具一多就很难维护（05 节预告过）。更好的办法是建一个**工具字典**。",
      "en": "Before running tools, one small problem (**extra**: the video has only one tool; this prepares for more). In `tool_calls`, the tool the model wants is just a name string, such as `\"get_game_info\"`. How do you call the matching function from it? A long chain of `if name == ...: elif ...` works, but becomes hard to maintain as tools pile up (as lesson 05 hinted). A **dict of tools** is the better way."
    },
    {
      "t": "py",
      "title": {
        "zh": "字典里放函数（分派表），以及 try/except",
        "en": "Functions in a dict (a dispatch table), and try/except"
      },
      "zh": "在 Python 里，函数本身也是一个值，可以放进字典：键是工具名，值是**函数本身**（不加括号；加了括号就变成「立刻调用它，存它的结果」）。\n- `TOOLS[name]` 取出函数，后面加上 `(**args)` 就是调用它（`**args` 是 05 节学过的字典拆包）；\n- `name in TOOLS` 判断有没有这个工具；\n- 遍历字典得到的是**键**；`\", \".join(TOOLS)` 用 `\", \"` 把这些键连成一个字符串，正好列出所有工具名。\n\n执行工具可能出错：模型给的 JSON 参数不完整、参数名写错……这时程序不应该直接崩溃。`try/except` 的规则是：先执行 `try` 里的代码；一旦出错，立刻跳到 `except` 里处理，程序继续运行。`except Exception as e` 能接住绝大多数错误，`e` 是错误对象，`type(e).__name__` 是错误的类型名。\n\n在 ReAct 里，出错时把错误说明当作 Observation 交还给模型，模型看到之后，通常会改正参数再试一次。",
      "en": "In Python a function is a value too, so it can go into a dict: the key is the tool name, the value is **the function itself** (no parentheses – with them you would call it right away and store its result).\n- `TOOLS[name]` looks the function up; adding `(**args)` calls it (`**args` is the dict unpacking from lesson 05);\n- `name in TOOLS` checks whether the tool exists;\n- looping over a dict gives its **keys**; `\", \".join(TOOLS)` glues those keys into one string with `\", \"` between them, listing every tool name.\n\nRunning a tool can fail: the model's JSON arguments may be incomplete, an argument name may be wrong… The program shouldn't crash when that happens. `try/except` works like this: run the code in `try`; the moment something fails, jump to `except`, handle it, and carry on. `except Exception as e` catches almost every error; `e` is the error object and `type(e).__name__` is the error's type name.\n\nIn ReAct, an error is handed back to the model as the Observation. Seeing it, the model usually fixes its arguments and tries again.",
      "code": {
        "zh": "import json\n\ndef get_game_info(game_name):\n    return f\"（假数据）{game_name}：比赛时每队场上 5 人\"\n\ndef multiply(a, b):\n    return a * b\n\nTOOLS = {\n    \"get_game_info\": get_game_info,    # 值是函数本身，不加括号\n    \"multiply\": multiply,              # 以后加工具，只要再加一行\n}\n\nfunc = TOOLS[\"multiply\"]               # 按名字取出函数\nprint(func(a=5, b=6))                  # 30\nprint(\", \".join(TOOLS))                # 遍历字典得到的是键\n\ndef run_tool(name, arguments):\n    if name not in TOOLS:\n        return f\"错误：没有叫 {name} 的工具，可用的工具有：{', '.join(TOOLS)}\"\n    try:\n        args = json.loads(arguments)       # 字符串 → 字典\n        return TOOLS[name](**args)         # 字典 → 关键字参数\n    except Exception as e:\n        return f\"错误：{type(e).__name__}: {e}\"\n\nprint(run_tool(\"get_game_info\", '{\"game_name\": \"篮球\"}'))\nprint(run_tool(\"search\", '{\"q\": \"篮球\"}'))           # 没有这个工具\nprint(run_tool(\"multiply\", '{\"a\": 5, \"b\": 6'))      # JSON 不完整\nprint(run_tool(\"multiply\", '{\"x\": 5, \"y\": 6}'))     # 参数名不对",
        "en": "import json\n\ndef get_game_info(game_name):\n    return f\"(fake data) {game_name}: 5 players per team on court\"\n\ndef multiply(a, b):\n    return a * b\n\nTOOLS = {\n    \"get_game_info\": get_game_info,    # the value is the function itself - no parentheses\n    \"multiply\": multiply,              # adding a tool later = adding one line\n}\n\nfunc = TOOLS[\"multiply\"]               # look the function up by name\nprint(func(a=5, b=6))                  # 30\nprint(\", \".join(TOOLS))                # looping over a dict gives its keys\n\ndef run_tool(name, arguments):\n    if name not in TOOLS:\n        return f\"Error: there is no tool called {name}. Available tools: {', '.join(TOOLS)}\"\n    try:\n        args = json.loads(arguments)       # string -> dict\n        return TOOLS[name](**args)         # dict -> keyword arguments\n    except Exception as e:\n        return f\"Error: {type(e).__name__}: {e}\"\n\nprint(run_tool(\"get_game_info\", '{\"game_name\": \"basketball\"}'))\nprint(run_tool(\"search\", '{\"q\": \"basketball\"}'))    # no such tool\nprint(run_tool(\"multiply\", '{\"a\": 5, \"b\": 6'))      # incomplete JSON\nprint(run_tool(\"multiply\", '{\"x\": 5, \"y\": 6}'))     # wrong argument names"
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "工具字典写成 `TOOLS = {\"get_game_info\": get_game_info()}`，问题出在哪？",
        "en": "What is wrong with `TOOLS = {\"get_game_info\": get_game_info()}`?"
      },
      "options": [
        {
          "zh": "字典的键不能是字符串",
          "en": "Dict keys can't be strings"
        },
        {
          "zh": "函数不能放进字典",
          "en": "Functions can't go into a dict"
        },
        {
          "zh": "没有问题",
          "en": "Nothing"
        },
        {
          "zh": "加了括号会立刻调用函数（这里还会因为缺参数报错），存进去的不是函数本身",
          "en": "The parentheses call the function immediately (and fail here for lack of arguments), so the dict doesn't hold the function itself"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "字典里要存函数本身：`\"get_game_info\": get_game_info`。等到真正需要时，再写 `TOOLS[name](**args)` 调用。",
        "en": "Store the function itself – `\"get_game_info\": get_game_info` – and call it later with `TOOLS[name](**args)`."
      }
    },
    {
      "t": "p",
      "zh": "零件齐了，放进循环。为了能在网页里直接点 ▶ 运行，下面用一个**剧本模型**代替真模型：`ask_model()` 照着视频里那次运行的顺序回复（先查篮球，再查排球，最后回答），不联网。`react_agent()` 这个循环和连真实模型时**一字不差**：",
      "en": "All the parts are ready – into the loop they go. So you can press ▶ right here in the browser, a **scripted model** stands in for the real one: `ask_model()` replies in the same order as the run in the video (basketball first, then volleyball, then the answer), offline. The loop `react_agent()` is **word for word** the one you use with the real model:"
    },
    {
      "t": "code",
      "file": "react_loop_demo.py",
      "run": true,
      "code": {
        "zh": "import json\nfrom types import SimpleNamespace   # 造一个能用「.名字」取值的简单对象，只在剧本模型里用\n\n# ---------- 工具、工具字典和 run_tool（和前面一样，数据库只留 3 条）----------\nGAMES = [\n    {\"name\": \"篮球\", \"players\": \"每队一般有 12 名队员，比赛时每队场上 5 人，其余是替补。\"},\n    {\"name\": \"排球\", \"players\": \"比赛时每队场上 6 人，其余是替补。\"},\n    {\"name\": \"沙滩排球\", \"players\": \"每队只有 2 人，没有替补。\"},\n]\n\ndef get_game_info(game_name):\n    results = []\n    for game in GAMES:\n        if game_name in game[\"name\"]:\n            results.append(game)\n    if not results:\n        return f\"没有找到和「{game_name}」有关的比赛。\"\n    return json.dumps(results, ensure_ascii=False)\n\nTOOLS = {\"get_game_info\": get_game_info}\n\ndef run_tool(name, arguments):\n    if name not in TOOLS:\n        return f\"错误：没有叫 {name} 的工具\"\n    try:\n        return TOOLS[name](**json.loads(arguments))\n    except Exception as e:\n        return f\"错误：{type(e).__name__}: {e}\"\n\n# ---------- 剧本模型：按视频里那次运行的顺序回复，不联网 ----------\nSCRIPT = [\n    {\"text\": \"Thought: 要先查到篮球和排球比赛时场上各有几人，再相乘。先查篮球。\", \"game\": \"篮球\"},\n    {\"text\": \"Thought: 篮球全队 12 人，但场上是 5 人。接下来查排球。\", \"game\": \"排球\"},\n    {\"text\": \"Thought: 查到两种排球，问的是普通排球，场上 6 人。\\nFinal Answer: 篮球场上 5 人，排球场上 6 人，5 × 6 = 30。\", \"game\": None},\n]\n\nmessages = [{\"role\": \"system\", \"content\": \"（第三部分的 ReAct 系统提示词）\"}]\n\ndef ask_model():\n    \"\"\"假的 ask_model()：取出剧本里的下一条回复，并存进对话记录。\"\"\"\n    step = len([m for m in messages if m[\"role\"] == \"assistant\"])   # 模型已经回复过几次\n    line = SCRIPT[step]\n    tool_calls = []\n    if line[\"game\"]:\n        args = json.dumps({\"game_name\": line[\"game\"]}, ensure_ascii=False)\n        function = SimpleNamespace(name=\"get_game_info\", arguments=args)\n        tool_calls.append(SimpleNamespace(id=f\"call_{step}\", function=function))\n    messages.append({\"role\": \"assistant\", \"content\": line[\"text\"]})\n    return SimpleNamespace(content=line[\"text\"], tool_calls=tool_calls)\n\n# ---------- ReAct 循环：和连真实模型时一字不差 ----------\ndef react_agent(question, max_iterations=5):\n    messages.append({\"role\": \"user\", \"content\": question})\n    current_iteration = 1                              # 当前是第几轮\n    while current_iteration <= max_iterations:         # 超过最大轮数就停\n        print(f\"----- 第 {current_iteration} 轮 -----\")\n        reply = ask_model()\n        if reply.content:\n            print(reply.content)                       # 思考（最后一轮是回答）\n        if not reply.tool_calls:                       # 不再调用工具 = 最终回答\n            return reply.content\n        for call in reply.tool_calls:                  # 行动：一次可能有好几个\n            print(\"Action:\", call.function.name, call.function.arguments)\n            observation = run_tool(call.function.name, call.function.arguments)\n            print(\"Observation:\", observation)         # 观察\n            messages.append({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": str(observation)})\n        current_iteration += 1                         # 结果都存好了，进入下一轮\n    return \"达到最大轮数，还没有得到最终答案。\"\n\nanswer = react_agent(\"比赛场上，篮球队的人数乘以排球队的人数，结果是多少？\")\nprint(\"===== 返回值 =====\")\nprint(answer)",
        "en": "import json\nfrom types import SimpleNamespace   # makes a simple object you can read with \".name\" - used only by the scripted model\n\n# ---------- tool, tool dict and run_tool (as before; the database keeps only 3 entries) ----------\nGAMES = [\n    {\"name\": \"basketball\", \"players\": \"A team usually has 12 players; 5 per team are on court, the rest are substitutes.\"},\n    {\"name\": \"volleyball\", \"players\": \"6 players per team are on court; the rest are substitutes.\"},\n    {\"name\": \"beach volleyball\", \"players\": \"Only 2 players per team, no substitutes.\"},\n]\n\ndef get_game_info(game_name):\n    results = []\n    for game in GAMES:\n        if game_name in game[\"name\"]:\n            results.append(game)\n    if not results:\n        return f\"No game matching '{game_name}' was found.\"\n    return json.dumps(results, ensure_ascii=False)\n\nTOOLS = {\"get_game_info\": get_game_info}\n\ndef run_tool(name, arguments):\n    if name not in TOOLS:\n        return f\"Error: there is no tool called {name}\"\n    try:\n        return TOOLS[name](**json.loads(arguments))\n    except Exception as e:\n        return f\"Error: {type(e).__name__}: {e}\"\n\n# ---------- a scripted model: replies in the same order as the run in the video, offline ----------\nSCRIPT = [\n    {\"text\": \"Thought: I need how many basketball and volleyball players are on court, then multiply. Basketball first.\", \"game\": \"basketball\"},\n    {\"text\": \"Thought: A basketball squad has 12, but 5 are on court. Now volleyball.\", \"game\": \"volleyball\"},\n    {\"text\": \"Thought: Two kinds of volleyball came back; the question means regular volleyball, 6 on court.\\nFinal Answer: 5 basketball and 6 volleyball players are on court; 5 × 6 = 30.\", \"game\": None},\n]\n\nmessages = [{\"role\": \"system\", \"content\": \"(the ReAct system prompt from part 3)\"}]\n\ndef ask_model():\n    \"\"\"A fake ask_model(): take the next reply from the script and store it in the history.\"\"\"\n    step = len([m for m in messages if m[\"role\"] == \"assistant\"])   # how many times the model has replied\n    line = SCRIPT[step]\n    tool_calls = []\n    if line[\"game\"]:\n        args = json.dumps({\"game_name\": line[\"game\"]}, ensure_ascii=False)\n        function = SimpleNamespace(name=\"get_game_info\", arguments=args)\n        tool_calls.append(SimpleNamespace(id=f\"call_{step}\", function=function))\n    messages.append({\"role\": \"assistant\", \"content\": line[\"text\"]})\n    return SimpleNamespace(content=line[\"text\"], tool_calls=tool_calls)\n\n# ---------- the ReAct loop: word for word the same as with the real model ----------\ndef react_agent(question, max_iterations=5):\n    messages.append({\"role\": \"user\", \"content\": question})\n    current_iteration = 1                              # which round we are in\n    while current_iteration <= max_iterations:         # stop after the last allowed round\n        print(f\"----- round {current_iteration} -----\")\n        reply = ask_model()\n        if reply.content:\n            print(reply.content)                       # the thought (the answer in the last round)\n        if not reply.tool_calls:                       # no more tool calls = final answer\n            return reply.content\n        for call in reply.tool_calls:                  # act: there may be several\n            print(\"Action:\", call.function.name, call.function.arguments)\n            observation = run_tool(call.function.name, call.function.arguments)\n            print(\"Observation:\", observation)         # observe\n            messages.append({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": str(observation)})\n        current_iteration += 1                         # all results stored - next round\n    return \"Reached max_iterations without a final answer.\"\n\nanswer = react_agent(\"On court, a basketball team's player count times a volleyball team's - what is it?\")\nprint(\"===== return value =====\")\nprint(answer)"
      },
      "note": {
        "zh": "- `while current_iteration <= max_iterations:` 和 06 节的 `while True` 一样是 while 循环，只是条件不再永远成立：`current_iteration` 从 1 开始，每轮末尾 `+= 1`（等于 `current_iteration = current_iteration + 1`），到 6 时条件变成 False，循环结束。忘了 `+= 1`，条件永远成立，就又成了死循环。也可以照 06 节写成 `while True:`，在循环开头加 `if current_iteration > max_iterations: break`，效果一样。\n- 循环里一旦 `return`，整个函数立刻结束；所有轮次都用完还没结束，才会走到最后那行 `return`。\n- `SimpleNamespace(content=..., tool_calls=...)` 造出一个可以写 `reply.content`、`reply.tool_calls` 的对象，用来假扮 SDK 返回的消息，好让同一个循环在网页里跑起来。只在这个演示里用，不用记。\n- **试一试**：把倒数第三行改成 `react_agent(\"...\", max_iterations=2)` 再运行。查完排球后计数器变成 3，循环被强制停下，返回「达到最大轮数」——这就是视频强调的安全阀。",
        "en": "- `while current_iteration <= max_iterations:` is a while loop like lesson 06's `while True`, except the condition doesn't hold forever: `current_iteration` starts at 1 and gets `+= 1` at the end of each round (the same as `current_iteration = current_iteration + 1`); at 6 the condition is False and the loop ends. Forget the `+= 1` and the condition stays true – an endless loop again. You could also write lesson 06's `while True:` with `if current_iteration > max_iterations: break` at the top of the loop; it does the same.\n- A `return` inside the loop ends the whole function at once; only when every round is used up does the last `return` run.\n- `SimpleNamespace(content=..., tool_calls=...)` makes an object you can read as `reply.content` and `reply.tool_calls`, posing as the message the SDK returns so the same loop can run in the browser. It is only used for this demo – no need to memorise it.\n- **Try it**: change the third-to-last line to `react_agent(\"...\", max_iterations=2)` and run again. After the volleyball lookup the counter reaches 3, the loop is forced to stop and you get “Reached max_iterations” – the safety valve the video insists on."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "如果把 `while current_iteration <= max_iterations:` 改成 `while True:`，又不设别的上限，最大的风险是？",
        "en": "If you change `while current_iteration <= max_iterations:` to `while True:` with no other limit, what is the biggest risk?"
      },
      "options": [
        {
          "zh": "模型一直不给 Final Answer 时（比如反复写错格式），程序停不下来，一直在花钱调用模型",
          "en": "If the model never gives a Final Answer (say it keeps getting the format wrong), the program never stops and keeps paying for model calls"
        },
        {
          "zh": "模型的回答会变短",
          "en": "The model's answers get shorter"
        },
        {
          "zh": "Observation 会丢失",
          "en": "Observations get lost"
        },
        {
          "zh": "没有任何风险",
          "en": "There is no risk"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "最大步数是 Agent 的安全阀。后面学的框架也都有类似的上限，比如 OpenAI Agents SDK 的 `max_turns`。",
        "en": "The step limit is the agent's safety valve. The frameworks later in the course have the same kind of limit, such as `max_turns` in the OpenAI Agents SDK."
      }
    },
    {
      "t": "p",
      "zh": "换成真模型时，只要用第四部分真正的 `ask_model()`（带 `tools=tools` 调用模型），循环一个字都不用改。完整文件是 `practice/l07_react_agent_solution.py`，在 `practice` 目录下用 `& ..\\.venv\\Scripts\\python.exe l07_react_agent_solution.py` 运行，需要先设置好 `DEEPSEEK_API_KEY`。",
      "en": "For the real model, use the real `ask_model()` from part 4 (which calls the model with `tools=tools`); the loop doesn't change by a single character. The full file is `practice/l07_react_agent_solution.py`; run it from `practice` with `& ..\\.venv\\Scripts\\python.exe l07_react_agent_solution.py` once `DEEPSEEK_API_KEY` is set."
    },
    {
      "t": "h",
      "zh": "六、运行：篮球人数 × 排球人数",
      "en": "6. The run: basketball players × volleyball players"
    },
    {
      "t": "p",
      "zh": "[▶ 11:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=692) 视频拿来测试的问题，大意是：比赛时场上篮球队有几名队员、排球队有几名队员，两个数相乘是多少？它比看上去难一点：答案要做一次乘法，可乘法需要的两个数字，问题里一个都没给。所以模型不该一上来就算（直接算很可能算错），而是先理清思路：我需要篮球和排球的场上人数 → 按思路去查 → 拿到结果再算。\n\n[▶ 13:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=792) 视频里的运行过程是这样的：\n1. **思考**：先弄清篮球、排球各自的情况，尤其是每队几人，再做计算；这些信息工具能提供，所以要调用函数。\n2. **行动 + 观察**：查篮球。结果里有两个数字：12 是全队人数（包括替补），5 才是场上人数。问题问的是场上，所以模型取 5。\n3. [▶ 15:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=914) **再思考 → 查排球**：因为只是模拟的数据库查询，不够精确，查排球时返回了两种排球，内容不一样；模型能自己分辨，确定排球比赛场上是 6 人。\n4. **回答**：篮球 5 人，排球 6 人，相乘等于 30。\n\n[▶ 15:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=947) 老师打了个比方：这很像教小朋友做数学题——先给一个大致的思路，再一步一步求解。",
      "en": "[▶ 11:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=692) The video's test question: on court, a basketball team's player count times a volleyball team's – what is it? It is a bit harder than it looks: the answer needs a multiplication, yet neither of the two numbers is in the question. So the model shouldn't start calculating right away (it might well get it wrong); it should first sort out a plan: I need the on-court counts for basketball and volleyball → look them up → calculate with the results.\n\n[▶ 13:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=792) Here is how the run in the video goes:\n1. **Think**: get the basic information on basketball and volleyball, especially the player counts, then calculate; the tool can provide that, so call the function.\n2. **Act + observe**: look up basketball. The result has two numbers: 12 is the whole squad (substitutes included), 5 is the number on court. The question is about the court, so the model takes 5.\n3. [▶ 15:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=914) **Think again → look up volleyball**: being only a simulated database query, it isn't precise – the lookup returns two kinds of volleyball with different details. The model sorts that out itself and settles on 6 players on court.\n4. **Answer**: 5 for basketball, 6 for volleyball, and 5 × 6 = 30.\n\n[▶ 15:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=947) The instructor's comparison: it is like teaching a child a maths problem – first give a rough plan, then solve it step by step."
    },
    {
      "t": "p",
      "zh": "下面是用 `deepseek-flash` 实际运行 `practice/l07_react_agent_solution.py` 的输出。和视频不同，DeepSeek 在**同一次回复**里同时请求了查篮球和查排球（视频里的模型分两轮查）；循环里的 `for call in reply.tool_calls` 两种情况都能处理。它也从两种排球里选对了场上的 6 人：",
      "en": "Below is real output from running `practice/l07_react_agent_solution.py` with `deepseek-flash`. Unlike the video, DeepSeek asked for basketball and volleyball **in the same reply** (the video's model looked them up in two rounds); the loop's `for call in reply.tool_calls` handles both cases. It also picked the 6 on-court volleyball players out of the two kinds:"
    },
    {
      "t": "code",
      "file": {
        "zh": "终端输出",
        "en": "terminal output (translated)"
      },
      "lang": "text",
      "code": {
        "zh": "----- 第 1 轮 / round 1 -----\nThought: 我需要先查一下篮球和排球每队上场的人数，才能计算乘积。\nAction: get_game_info {\"game_name\": \"篮球\"}\nObservation: [{\"name\": \"篮球\", \"intro\": \"两队把球投进对方的篮筐得分。\", \"players\": \"每队一般有 12 名队员，比赛时每队场上 5 人，其余是替补。\"}]\nAction: get_game_info {\"game_name\": \"排球\"}\nObservation: [{\"name\": \"排球\", \"intro\": \"两队隔着球网击球，不让球落在本方场地上。\", \"players\": \"比赛时每队场上 6 人，其余是替补。\"}, {\"name\": \"沙滩排球\", \"intro\": \"在沙地上进行的排球比赛。\", \"players\": \"每队只有 2 人，没有替补。\"}]\n\n----- 第 2 轮 / round 2 -----\nFinal Answer: 比赛场上，篮球队每队 5 人，排球队每队 6 人，所以 5 × 6 = 30。\n\n（如果按\"每队总队员人数\"来算，篮球每队一般 12 人，排球没有给出固定的总人数，只能按场上的 5 人和 6 人计算。）",
        "en": "----- round 1 -----\nThought: I first need to look up how many players per team are on court in basketball and volleyball; then I can multiply.\nAction: get_game_info {\"game_name\": \"basketball\"}\nObservation: [{\"name\": \"basketball\", \"intro\": \"Two teams score by shooting the ball through the other side's hoop.\", \"players\": \"A team usually has 12 players; 5 per team are on court during a game, the rest are substitutes.\"}]\nAction: get_game_info {\"game_name\": \"volleyball\"}\nObservation: [{\"name\": \"volleyball\", \"intro\": \"Two teams hit the ball over a net and keep it from landing on their side.\", \"players\": \"6 players per team are on court during a game; the rest are substitutes.\"}, {\"name\": \"beach volleyball\", \"intro\": \"Volleyball played on sand.\", \"players\": \"Only 2 players per team, no substitutes.\"}]\n\n----- round 2 -----\nFinal Answer: On court, a basketball team has 5 players and a volleyball team 6, so 5 × 6 = 30.\n\n(If you counted \"total players per team\" instead: a basketball team usually has 12, but no fixed total is given for volleyball, so the calculation can only use the 5 and 6 players on court.)"
      }
    },
    {
      "t": "note",
      "zh": "`deepseek-flash` 会「先想再答」：返回的消息里除了 `content`，还有一个 `reasoning_content` 字段，放着模型自己的推理过程（这一节实测每次调用都有）。ReAct 的 `Thought` 是另一回事：它是你**在提示词里要求**模型写进 `content` 的思路，格式由你规定，任何模型都能用，打印出来就能检查每一步为什么这么做。",
      "en": "`deepseek-flash` “thinks before answering”: besides `content`, its message has a `reasoning_content` field with the model's own reasoning (present on every call in this lesson's tests). ReAct's `Thought` is something else: it is the reasoning you **ask for in the prompt** and the model writes into `content`, in a format you define. It works with any model, and printing it lets you check why each step was taken."
    },
    {
      "t": "h",
      "zh": "七、视频结尾：循环还能做什么",
      "en": "7. Wrap-up: what else the loop can do"
    },
    {
      "t": "p",
      "zh": "[▶ 16:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=978) 回头看这个例子，它符合前面对 Agent 的认识：不是问一句、直接答一句；内部确实有「思考 → 行动 → 观察」的循环，会重复工作；每次都先想清楚要做什么、再去做，所以步骤比较准确，也更接近人的思考方式。\n\n[▶ 16:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=1010) 老师最后提到，同样的循环还能实现前面讲过的**自我反思**：先按思路做出一个结果，再让模型检查这个结果对不对、哪里不对、接下来怎么调整，然后重新做。思维链、思维树这些提示词技巧本身没有这样的循环，而循环恰恰是做 Agent 的关键。",
      "en": "[▶ 16:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=978) Looking back, the example matches what was said about agents earlier: it is not ask once, answer once; inside there really is a think → act → observe loop that repeats; and each time it works out what to do before doing it, so its steps are fairly accurate and closer to how people think.\n\n[▶ 16:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=8&t=1010) Finally, the instructor notes that the same loop can implement the **self-reflection** covered earlier: produce a result following a plan, then have the model check whether it is right, what is wrong and how to adjust, and do it again. Prompting techniques such as chain of thought or tree of thoughts have no such loop on their own – and the loop is exactly what makes an agent."
    },
    {
      "t": "tip",
      "zh": "从下一节开始学的框架（OpenAI Agents SDK、LangChain、LangGraph、AgentScope……），内部跑的都是这一节的循环：调用模型 → 有工具调用就执行 → 把结果送回去 → 直到模型给出最终回答。它们大多用原生工具调用，也就是视频的这种写法，也都能设置类似 `max_iterations` 的上限（比如 OpenAI Agents SDK 的 `Runner.run(..., max_turns=10)`）。今天亲手写过一遍，后面就能看懂框架替你做了什么。",
      "en": "The frameworks from the next lesson on (OpenAI Agents SDK, LangChain, LangGraph, AgentScope…) all run this lesson's loop inside: call the model → run any tool calls → send the results back → until the model gives a final answer. Most use native tool calling – the video's approach – and all let you set a limit like `max_iterations` (for example `Runner.run(..., max_turns=10)` in the OpenAI Agents SDK). Having written it by hand once, you will see exactly what a framework does for you."
    },
    {
      "t": "h",
      "zh": "八、拓展（视频没有）：纯文字 ReAct 的提示词和解析",
      "en": "8. Extension (not in the video): the text-only ReAct prompt and parser"
    },
    {
      "t": "p",
      "zh": "**视频里没有第八、九部分。** 时间紧可以先跳过；但这里的几个 Python 小课堂（`.format()` 模板、字符串方法、正则表达式、一次返回两个值）后面第 12、23、40、45 节还会用到，建议至少读懂它们。\n\nReAct 论文最初的做法不用 `tools` 参数：工具说明直接写进提示词，模型把 `Action:` 和 `Action Input:` 写在回复的文字里，你的代码再把它们解析出来。好处是**任何能聊天的模型都能用**，不需要模型支持 function calling；早期很多框架里的 ReAct Agent 也是这样实现的。\n\n这时提示词要讲清楚三件事：\n1. **有哪些工具**：名字、作用、参数长什么样\n2. **回复格式**：要调用工具时写 Thought / Action / Action Input；能回答时写 Thought / Final Answer\n3. **规则**：每次只写一个 Action；写完 Action Input 就停下；**不要自己写 Observation**\n\n工具会随项目变化，所以提示词写成一个**模板**：留出空位，运行时再把工具说明填进去。这部分换用课程里的天气工具：先用 `get_coordinates` 查经纬度，再用 `get_weather` 查气温。Action Input 规定成 JSON，是为了直接复用 05 节的 `json.loads` + `**args`。",
      "en": "**Parts 8 and 9 are not in the video.** If you are short of time, skip them for now – but do read the Python mini-lessons here (`.format()` templates, string methods, regular expressions, returning two values); lessons 12, 23, 40 and 45 use them again.\n\nThe ReAct paper originally used no `tools` parameter: the tool descriptions go into the prompt, the model writes `Action:` and `Action Input:` into its reply text, and your code parses them out. The upside: **any chat model can do it**, with no function-calling support needed; many early frameworks implemented their ReAct agents this way.\n\nThe prompt then has to spell out three things:\n1. **The tools**: name, purpose, and what the arguments look like\n2. **The reply format**: Thought / Action / Action Input when calling a tool; Thought / Final Answer when ready to answer\n3. **The rules**: one Action per reply; stop after Action Input; **never write the Observation yourself**\n\nTools change from project to project, so the prompt is written as a **template** with blanks that get filled in at run time. This part switches to the course's weather tools: `get_coordinates` for the coordinates, then `get_weather` for the temperature. Action Input is required to be JSON so that lesson 05's `json.loads` + `**args` can be reused as-is."
    },
    {
      "t": "py",
      "title": {
        "zh": "用 .format() 填模板",
        "en": "Filling templates with .format()"
      },
      "zh": "模板里用 `{名字}` 留出空位，之后调用 `模板.format(名字=值)` 把值填进去，得到一个**新字符串**（原来的模板不变）。它和 04 节的 f-string 很像，区别在于：f-string 写下的那一刻就要填好；`.format()` 可以先把模板写在文件开头，等工具准备好了再填。\n\n三个要点：\n- 模板**本身**要出现花括号时（比如 JSON 示例），要写成两个：`{{` 和 `}}`。否则 `.format()` 会把它当成空位，报 `KeyError`。\n- **填进去的值**里有花括号没关系，`.format()` 不会再去处理它们。\n- 每个空位都要填上：少给一个名字（比如只给 `tools=`、忘了 `tool_names=`），同样会报 `KeyError`。",
      "en": "Inside a template, `{name}` marks a blank; `template.format(name=value)` fills it in and returns a **new string** (the template itself is unchanged). It is close to the f-strings from lesson 04, with one difference: an f-string is filled the moment it is written, while `.format()` lets you keep the template at the top of the file and fill it once the tools are ready.\n\nThree things to remember:\n- When the template **itself** needs braces (a JSON example, say), double them: `{{` and `}}`. Otherwise `.format()` treats them as a blank and raises `KeyError`.\n- Braces inside the **values you fill in** are fine; `.format()` does not look inside them.\n- Every blank must be filled: leave one out (say, pass `tools=` but forget `tool_names=`) and you get a `KeyError` too.",
      "code": {
        "zh": "TEMPLATE = \"\"\"你是一个助手。\n可用的工具：{tools}\nAction 必须是 {tool_names} 之一。\"\"\"\n\nnames = [\"get_coordinates\", \"get_weather\"]\nprompt = TEMPLATE.format(tools=\"（这里放工具说明）\", tool_names=\", \".join(names))\nprint(prompt)\nprint(\"-\" * 20)\n\n# 模板本身要写花括号时，写成两个：{{ }}\nEXAMPLE = \"\"\"Action Input 示例：{{\"city\": \"北京\"}}\n问题：{question}\"\"\"\nprint(EXAMPLE.format(question=\"北京现在多少度？\"))\n\n# 如果只写一个 { }，.format() 会把 \"city\" 当成空位的名字：\n# '示例：{\"city\": \"北京\"} 问题：{question}'.format(question=\"...\")  ->  KeyError: '\"city\"'",
        "en": "TEMPLATE = \"\"\"You are an assistant.\nAvailable tools: {tools}\nAction must be one of {tool_names}.\"\"\"\n\nnames = [\"get_coordinates\", \"get_weather\"]\nprompt = TEMPLATE.format(tools=\"(tool descriptions go here)\", tool_names=\", \".join(names))\nprint(prompt)\nprint(\"-\" * 20)\n\n# When the template itself needs braces, double them: {{ }}\nEXAMPLE = \"\"\"Action Input example: {{\"city\": \"Beijing\"}}\nQuestion: {question}\"\"\"\nprint(EXAMPLE.format(question=\"How warm is Beijing now?\"))\n\n# With single braces, .format() treats \"city\" as the name of a blank:\n# 'Example: {\"city\": \"Beijing\"} Question: {question}'.format(question=\"...\")  ->  KeyError: '\"city\"'"
      }
    },
    {
      "t": "p",
      "zh": "下面是纯文字版完整的 ReAct 提示词。点 ▶ 运行，看看填好之后模型实际收到的 system 提示词：",
      "en": "Here is the full prompt for the text-only version. Press ▶ Run to see the system prompt the model actually receives once it is filled in:"
    },
    {
      "t": "code",
      "file": "text_react_prompt.py",
      "run": true,
      "code": {
        "zh": "TOOL_DESCRIPTIONS = \"\"\"- get_coordinates: 查询城市的经纬度。Action Input 示例：{\"city\": \"北京\"}\n- get_weather: 根据经纬度查询当前气温（摄氏度）。Action Input 示例：{\"latitude\": 39.9, \"longitude\": 116.4}\"\"\"\n\nREACT_PROMPT = \"\"\"你是一个会使用工具的助手。请按「思考 → 行动 → 观察」的方式一步一步解决问题。\n\n你可以使用这些工具：\n{tools}\n\n每次回复只能使用下面两种格式之一。\n\n格式一（需要调用工具时）：\nThought: 你现在的想法，以及下一步要做什么\nAction: 工具名，必须是 {tool_names} 之一\nAction Input: 工具参数，写成一个 JSON 对象\n\n格式二（已经能回答时）：\nThought: 我已经知道最终答案了\nFinal Answer: 给用户的最终回答\n\n规则：\n1. 每次只写一个 Action，写完 Action Input 就停下，等待 Observation（工具结果）。\n2. 不要自己编写 Observation。\n3. 只根据 Observation 里的真实数据回答。\"\"\"\n\ntool_names = [\"get_coordinates\", \"get_weather\"]\nSYSTEM_PROMPT = REACT_PROMPT.format(tools=TOOL_DESCRIPTIONS, tool_names=\", \".join(tool_names))\nprint(SYSTEM_PROMPT)",
        "en": "TOOL_DESCRIPTIONS = \"\"\"- get_coordinates: look up a city's latitude and longitude. Action Input example: {\"city\": \"Beijing\"}\n- get_weather: current temperature (Celsius) at a latitude/longitude. Action Input example: {\"latitude\": 39.9, \"longitude\": 116.4}\"\"\"\n\nREACT_PROMPT = \"\"\"You are an assistant that can use tools. Solve the problem step by step: think, act, observe.\n\nYou can use these tools:\n{tools}\n\nEvery reply must use exactly one of these two formats.\n\nFormat 1 (when you need a tool):\nThought: what you are thinking and what to do next\nAction: the tool name, one of {tool_names}\nAction Input: the tool arguments as a JSON object\n\nFormat 2 (when you can answer):\nThought: I now know the final answer\nFinal Answer: the final answer for the user\n\nRules:\n1. Write only one Action per reply. Stop right after Action Input and wait for the Observation (the tool result).\n2. Never write an Observation yourself.\n3. Answer only from the real data in the Observations.\"\"\"\n\ntool_names = [\"get_coordinates\", \"get_weather\"]\nSYSTEM_PROMPT = REACT_PROMPT.format(tools=TOOL_DESCRIPTIONS, tool_names=\", \".join(tool_names))\nprint(SYSTEM_PROMPT)"
      },
      "note": {
        "zh": "工具说明里的 `{\"city\": \"北京\"}` 也有花括号，但它是**填进去的值**，所以不用写成 `{{ }}`。完整版本在 `practice/l07_text_react_solution.py`，那里的工具名列表直接用 `\", \".join(TOOLS)` 从工具字典里取（第五部分讲过）。",
        "en": "The tool descriptions contain braces too (`{\"city\": \"Beijing\"}`), but they are **filled-in values**, so no `{{ }}` is needed. The full version is in `practice/l07_text_react_solution.py`, where the list of tool names comes straight from the tool dict with `\", \".join(TOOLS)` (see part 5)."
      }
    },
    {
      "t": "p",
      "zh": "调用模型后，拿到的只是一段**普通文字**（Thought / Action / Action Input 几行字）。程序要从里面回答两个问题：\n1. 有没有 `Final Answer:`？有就结束，把它后面的文字交给用户。\n2. 没有的话，`Action` 是哪个工具？`Action Input` 是什么参数？\n\n先用最基础的字符串方法试试。",
      "en": "What comes back from the model is just **plain text** (a few lines of Thought / Action / Action Input). The program has to answer two questions from it:\n1. Is there a `Final Answer:`? If so, we are done – hand what follows it to the user.\n2. If not, which tool does `Action` name, and what arguments does `Action Input` give?\n\nLet's start with basic string methods."
    },
    {
      "t": "py",
      "title": {
        "zh": "字符串方法：in、split、strip、startswith",
        "en": "String methods: in, split, strip, startswith"
      },
      "zh": "处理文字最常用的几个方法（它们都不修改原来的字符串，而是返回新的结果）：\n\n| 写法 | 作用 | 例子 |\n|---|---|---|\n| `\"abc\" in s` | `s` 里有没有这段文字（第二部分用过） | `\"Final Answer:\" in reply` |\n| `s.split(sep)` | 按 `sep` 切开，得到一个列表 | `reply.split(\"\\n\")` 按行切 |\n| `s.split(sep, 1)` | 只在**第一个** `sep` 处切一刀 | 不会把 JSON 里的冒号也切开 |\n| `s.strip()` | 去掉两头的空格和换行 | `\" get_weather \".strip()` |\n| `s.startswith(x)` | 是不是以 `x` 开头 | `line.startswith(\"Action:\")` |\n\n`split` 得到的是列表，所以可以接着用 06 节学过的下标：`[0]` 是第一段，`[-1]` 是最后一段。",
      "en": "The most common methods for working with text (none of them change the original string; they return new results):\n\n| Code | What it does | Example |\n|---|---|---|\n| `\"abc\" in s` | does `s` contain this text? (used in part 2) | `\"Final Answer:\" in reply` |\n| `s.split(sep)` | cut at every `sep`, giving a list | `reply.split(\"\\n\")` splits into lines |\n| `s.split(sep, 1)` | cut only at the **first** `sep` | leaves the colons inside the JSON alone |\n| `s.strip()` | remove spaces and line breaks at both ends | `\" get_weather \".strip()` |\n| `s.startswith(x)` | does it start with `x`? | `line.startswith(\"Action:\")` |\n\n`split` returns a list, so the indexing from lesson 06 works on it: `[0]` is the first piece, `[-1]` the last.",
      "code": {
        "zh": "reply = \"\"\"Thought: 要查气温，得先知道北京的经纬度。\nAction: get_coordinates\nAction Input: {\"city\": \"北京\"}\"\"\"\n\nprint(\"Final Answer:\" in reply)               # False：还没结束\n\nfor line in reply.split(\"\\n\"):                # 按行切开\n    if line.startswith(\"Action:\"):\n        name = line.split(\":\", 1)[1].strip()  # 只在第一个冒号处切一刀\n        print(\"工具名：\", name)\n    if line.startswith(\"Action Input:\"):\n        args_text = line.split(\":\", 1)[1].strip()\n        print(\"参数：\", args_text)\n\nfinal = \"Thought: 我已经知道最终答案了\\nFinal Answer: 北京现在大约 15.0°C。\"\nprint(final.split(\"Final Answer:\")[-1].strip())   # 取 Final Answer: 后面的部分",
        "en": "reply = \"\"\"Thought: To get the temperature I first need Beijing's coordinates.\nAction: get_coordinates\nAction Input: {\"city\": \"Beijing\"}\"\"\"\n\nprint(\"Final Answer:\" in reply)               # False: not finished yet\n\nfor line in reply.split(\"\\n\"):                # split into lines\n    if line.startswith(\"Action:\"):\n        name = line.split(\":\", 1)[1].strip()  # cut only at the first colon\n        print(\"tool name:\", name)\n    if line.startswith(\"Action Input:\"):\n        args_text = line.split(\":\", 1)[1].strip()\n        print(\"arguments:\", args_text)\n\nfinal = \"Thought: I now know the final answer\\nFinal Answer: It is about 15.0°C in Beijing.\"\nprint(final.split(\"Final Answer:\")[-1].strip())   # the part after Final Answer:"
      }
    },
    {
      "t": "p",
      "zh": "格式整齐时，按行处理就够了。但模型的回复不总是这么规矩：JSON 可能写成好几行，冒号后面可能多了空格。这时用**正则表达式**更灵活。",
      "en": "When the format is tidy, line-by-line handling is enough. But the model is not always that neat: the JSON may span several lines, or there may be extra spaces after a colon. **Regular expressions** cope with that better."
    },
    {
      "t": "py",
      "title": {
        "zh": "正则表达式入门：re.search 和分组",
        "en": "Regular expressions: re.search and groups"
      },
      "zh": "**正则表达式**是一种描述「文字长什么样」的小语言。`re.search(模式, 文字)` 在文字里找第一处符合模式的地方：\n- 找到了，返回一个 Match 对象：`m.group(0)` 是整段匹配到的文字，`m.group(1)` 是第 1 对括号里的部分；\n- 没找到，返回 `None`。\n\n这一节只需要下面这几个符号：\n\n| 写法 | 意思 |\n|---|---|\n| `\\s*` | 0 个或多个空白（空格、换行） |\n| `\\w+` | 1 个或多个字母、数字或下划线 |\n| `.*` | 任意多个任意字符（默认**不跨行**） |\n| `( )` | 分组：圈出你想取出来的部分 |\n| `\\{` `\\}` | 花括号本身（花括号在正则里有特殊含义，前面要加 `\\`） |\n| `re.DOTALL` | 让 `.` 也能匹配换行，用来取跨行的 JSON |\n\n模式前面加 `r`，写成 `r\"...\"`，叫**原始字符串**：里面的 `\\` 原样保留，不会被 Python 当成转义。写正则时几乎总是这样写。",
      "en": "A **regular expression** is a small language for describing “what the text looks like”. `re.search(pattern, text)` finds the first place in the text that fits the pattern:\n- if found, it returns a Match object: `m.group(0)` is the whole matched text, `m.group(1)` is what the first pair of parentheses captured;\n- if not, it returns `None`.\n\nThis lesson needs only these symbols:\n\n| Code | Meaning |\n|---|---|\n| `\\s*` | zero or more whitespace characters (spaces, line breaks) |\n| `\\w+` | one or more letters, digits or underscores |\n| `.*` | any number of any characters (**not across lines** by default) |\n| `( )` | a group: wraps the part you want to pull out |\n| `\\{` `\\}` | literal braces (braces mean something special in a regex, so add `\\`) |\n| `re.DOTALL` | lets `.` match line breaks too – for JSON spread over lines |\n\nThe `r` in `r\"...\"` makes a **raw string**: backslashes are kept as they are instead of being treated as Python escapes. Regex patterns are almost always written this way.",
      "code": {
        "zh": "import re\n\nreply = \"\"\"Thought: 拿到坐标了，接下来查当前气温。\nAction: get_weather\nAction Input: {\"latitude\": 39.9042,\n               \"longitude\": 116.4074}\"\"\"\n\nm = re.search(r\"Action:\\s*(\\w+)\", reply)\nprint(m.group(0))       # 整段匹配到的文字：Action: get_weather\nprint(m.group(1))       # 第 1 对括号里的部分：get_weather\n\nm2 = re.search(r\"Action Input:\\s*(\\{.*\\})\", reply, re.DOTALL)\nprint(m2.group(1))      # 跨两行的 JSON 也取到了\n\nm3 = re.search(r\"Action Input:\\s*(\\{.*\\})\", reply)   # 不加 re.DOTALL\nprint(m3)               # None：. 不能跨行，同一行里找不到结尾的 }\n\nprint(re.search(r\"Final Answer:\\s*(.*)\", reply))      # None：还没有最终答案",
        "en": "import re\n\nreply = \"\"\"Thought: I have the coordinates; now I'll check the temperature.\nAction: get_weather\nAction Input: {\"latitude\": 39.9042,\n               \"longitude\": 116.4074}\"\"\"\n\nm = re.search(r\"Action:\\s*(\\w+)\", reply)\nprint(m.group(0))       # the whole match: Action: get_weather\nprint(m.group(1))       # what the first parentheses captured: get_weather\n\nm2 = re.search(r\"Action Input:\\s*(\\{.*\\})\", reply, re.DOTALL)\nprint(m2.group(1))      # the JSON spanning two lines is captured too\n\nm3 = re.search(r\"Action Input:\\s*(\\{.*\\})\", reply)   # without re.DOTALL\nprint(m3)               # None: . cannot cross a line break, so no closing } on that line\n\nprint(re.search(r\"Final Answer:\\s*(.*)\", reply))      # None: no final answer yet"
      },
      "note": {
        "zh": "`Action:\\s*(\\w+)` 不会误匹配 `Action Input:` 那一行：模式要求 `Action` 后面**紧跟冒号**，而那一行的 `Action` 后面是空格。",
        "en": "`Action:\\s*(\\w+)` does not match the `Action Input:` line by mistake: the pattern needs a colon **right after** `Action`, and on that line `Action` is followed by a space."
      }
    },
    {
      "t": "p",
      "zh": "把这两条正则包进一个函数 `parse_action`：两样都找到，就返回工具名和参数字符串；缺了任何一样，就返回 `None`，交给循环去处理。",
      "en": "Wrap the two patterns in one function, `parse_action`: if both are found it returns the tool name and the argument string; if either is missing it returns `None` and lets the loop deal with it."
    },
    {
      "t": "code",
      "file": "parse_action.py",
      "run": true,
      "code": {
        "zh": "import re\n\ndef parse_action(text):\n    \"\"\"从模型回复里取出 (工具名, 参数字符串)；格式不对就返回 None。\"\"\"\n    action = re.search(r\"Action:\\s*(\\w+)\", text)\n    action_input = re.search(r\"Action Input:\\s*(\\{.*\\})\", text, re.DOTALL)\n    if action is None or action_input is None:\n        return None                                   # 缺了任何一行，都算格式不对\n    return action.group(1), action_input.group(1)     # 一次返回两个值\n\nreply = 'Thought: 先查坐标。\\nAction: get_coordinates\\nAction Input: {\"city\": \"北京\"}'\nresult = parse_action(reply)\nprint(result)\n\nname, args_text = result          # 把两个值分别放进两个变量\nprint(name)\nprint(args_text)\n\nprint(parse_action(\"Thought: 我再想想……\"))     # None",
        "en": "import re\n\ndef parse_action(text):\n    \"\"\"Return (tool name, argument string) from the reply, or None if the format is wrong.\"\"\"\n    action = re.search(r\"Action:\\s*(\\w+)\", text)\n    action_input = re.search(r\"Action Input:\\s*(\\{.*\\})\", text, re.DOTALL)\n    if action is None or action_input is None:\n        return None                                   # either line missing = wrong format\n    return action.group(1), action_input.group(1)     # return two values at once\n\nreply = 'Thought: Coordinates first.\\nAction: get_coordinates\\nAction Input: {\"city\": \"Beijing\"}'\nresult = parse_action(reply)\nprint(result)\n\nname, args_text = result          # put the two values into two variables\nprint(name)\nprint(args_text)\n\nprint(parse_action(\"Thought: let me think...\"))    # None"
      },
      "note": {
        "zh": "`return a, b` 会把两个值打包成一个**元组**（tuple），打印出来是 `('get_coordinates', '{\"city\": \"北京\"}')`。接收时写 `name, args_text = result`，一次拆成两个变量；左边变量的个数要和元组里值的个数一样。",
        "en": "`return a, b` packs the two values into a **tuple**, printed as `('get_coordinates', '{\"city\": \"Beijing\"}')`. Receive it with `name, args_text = result` to split it into two variables at once; the number of names on the left must match the number of values."
      }
    },
    {
      "t": "warn",
      "zh": "一定要先判断是不是 `None`，再取 `group`、再拆包。对没找到的结果直接写 `m.group(1)`，会报 `AttributeError: 'NoneType' object has no attribute 'group'`；对 `None` 写 `name, args_text = parsed`，会报 `TypeError: cannot unpack non-iterable NoneType object`。这是写解析代码时最常见的两个报错。",
      "en": "Always check for `None` before calling `group` or unpacking. `m.group(1)` on a failed search raises `AttributeError: 'NoneType' object has no attribute 'group'`, and `name, args_text = parsed` on `None` raises `TypeError: cannot unpack non-iterable NoneType object`. These are the two most common errors in parsing code."
    },
    {
      "t": "check",
      "q": {
        "zh": "`re.search(...)` 没有找到匹配时，返回什么？",
        "en": "What does `re.search(...)` return when nothing matches?"
      },
      "options": [
        {
          "zh": "抛出 `ValueError`",
          "en": "It raises `ValueError`"
        },
        {
          "zh": "空字符串 `\"\"`",
          "en": "An empty string `\"\"`"
        },
        {
          "zh": "`None`",
          "en": "`None`"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "没找到就返回 `None`，所以取 `group` 之前要先检查 `if m is None`。",
        "en": "It returns `None`, which is why you check `if m is None` before calling `group`."
      }
    },
    {
      "t": "h",
      "zh": "九、拓展：文字版 ReAct 循环，以及两种写法对比",
      "en": "9. Extension: the text-only ReAct loop, and the two approaches compared"
    },
    {
      "t": "p",
      "zh": "零件都齐了：提示词模板、`parse_action`，再加上第五部分的 `TOOLS` 和 `run_tool`（参数换成从文字里解析出来的字符串）。把它们串成一个循环，每一轮做这几件事：\n1. 把 `messages` 发给模型，拿到一段 ReAct 文字\n2. 把这段文字作为 `assistant` 消息存进 `messages`（05 节讲过：不存，模型下一轮就不知道自己做过什么）\n3. 里面有 `Final Answer:` → 返回答案，结束\n4. 否则解析出 Action → 执行工具 → 把 `Observation: 结果` 作为 `user` 消息存进 `messages`\n5. 回到第 1 步。最多循环 `MAX_STEPS` 次，防止模型一直不给答案、白白消耗 token\n\n先用一个**假模型**把循环跑通：`fake_model` 按剧本返回 ReAct 文字，而且会读取上一条 Observation 来写下一步，就像真模型一样。这样不联网也能在浏览器里点 ▶ 看到整个过程。",
      "en": "All the parts are ready: the prompt template, `parse_action`, plus `TOOLS` and `run_tool` from part 5 (now fed the argument string parsed from the text). Chain them into a loop where each round does this:\n1. Send `messages` to the model and get a piece of ReAct text back\n2. Store that text in `messages` as an `assistant` message (as in lesson 05: without it, the model forgets what it has already done)\n3. If it contains `Final Answer:` → return the answer, done\n4. Otherwise parse the Action → run the tool → store `Observation: result` in `messages` as a `user` message\n5. Back to step 1 – at most `MAX_STEPS` times, so a model that never answers can't burn tokens forever\n\nFirst, run the loop with a **fake model**: `fake_model` returns scripted ReAct text and reads the previous Observation to write its next step, just like a real model would. That way you can press ▶ and watch the whole run in the browser, offline."
    },
    {
      "t": "code",
      "file": "text_react_demo.py",
      "run": true,
      "code": {
        "zh": "import json\nimport re\n\n# ---------- 工具和工具字典（第五部分）----------\ndef get_coordinates(city):\n    coords = {\"北京\": {\"latitude\": 39.9042, \"longitude\": 116.4074}}\n    if city not in coords:\n        return f\"没有找到城市：{city}\"\n    return json.dumps(coords[city])\n\ndef get_weather(latitude, longitude):\n    return 15.0                                  # 假数据\n\nTOOLS = {\"get_coordinates\": get_coordinates, \"get_weather\": get_weather}\n\n# ---------- 解析（第八部分）和执行（第五部分）----------\ndef parse_action(text):\n    action = re.search(r\"Action:\\s*(\\w+)\", text)\n    action_input = re.search(r\"Action Input:\\s*(\\{.*\\})\", text, re.DOTALL)\n    if action is None or action_input is None:\n        return None\n    return action.group(1), action_input.group(1)\n\ndef run_tool(name, args_text):\n    if name not in TOOLS:\n        return f\"错误：没有叫 {name} 的工具\"\n    try:\n        return TOOLS[name](**json.loads(args_text))\n    except Exception as e:\n        return f\"错误：{e}\"\n\n# ---------- 假模型：按剧本返回 ReAct 文字 ----------\ndef fake_model(messages):\n    step = len([m for m in messages if m[\"role\"] == \"assistant\"])\n    last = messages[-1][\"content\"]               # 最后一条消息（上一步的 Observation）\n    if step == 0:\n        return 'Thought: 要查气温，得先知道北京的经纬度。\\nAction: get_coordinates\\nAction Input: {\"city\": \"北京\"}'\n    if step == 1:\n        coords = last.split(\"Observation:\")[1].strip()\n        return \"Thought: 拿到坐标了，接下来查当前气温。\\nAction: get_weather\\nAction Input: \" + coords\n    temp = last.split(\"Observation:\")[1].strip()\n    return f\"Thought: 我已经知道最终答案了\\nFinal Answer: 北京现在大约 {temp}°C。\"\n\n# ---------- ReAct 循环 ----------\nMAX_STEPS = 5\n\ndef react_agent(question):\n    messages = [\n        {\"role\": \"system\", \"content\": \"（第八部分的 ReAct 提示词）\"},\n        {\"role\": \"user\", \"content\": f\"Question: {question}\"},\n    ]\n    for step in range(1, MAX_STEPS + 1):\n        text = fake_model(messages)                                  # 1. 问模型\n        print(f\"--- 第 {step} 步 ---\\n{text}\")\n        messages.append({\"role\": \"assistant\", \"content\": text})      # 2. 存回复\n        if \"Final Answer:\" in text:                                  # 3. 结束了吗？\n            return text.split(\"Final Answer:\")[-1].strip()\n        parsed = parse_action(text)                                  # 4. 解析 → 执行\n        if parsed is None:\n            observation = \"格式不对，请按 Thought / Action / Action Input 的格式回复\"\n        else:\n            name, args_text = parsed\n            observation = run_tool(name, args_text)\n        print(f\"Observation: {observation}\")\n        messages.append({\"role\": \"user\", \"content\": f\"Observation: {observation}\"})\n    return \"达到最大步数，没有得到最终答案\"\n\nprint(\"最终回答：\", react_agent(\"北京现在多少度？\"))",
        "en": "import json\nimport re\n\n# ---------- tools and the dict of tools (part 5) ----------\ndef get_coordinates(city):\n    coords = {\"Beijing\": {\"latitude\": 39.9042, \"longitude\": 116.4074}}\n    if city not in coords:\n        return f\"City not found: {city}\"\n    return json.dumps(coords[city])\n\ndef get_weather(latitude, longitude):\n    return 15.0                                  # fake data\n\nTOOLS = {\"get_coordinates\": get_coordinates, \"get_weather\": get_weather}\n\n# ---------- parsing (part 8) and running (part 5) ----------\ndef parse_action(text):\n    action = re.search(r\"Action:\\s*(\\w+)\", text)\n    action_input = re.search(r\"Action Input:\\s*(\\{.*\\})\", text, re.DOTALL)\n    if action is None or action_input is None:\n        return None\n    return action.group(1), action_input.group(1)\n\ndef run_tool(name, args_text):\n    if name not in TOOLS:\n        return f\"Error: there is no tool called {name}\"\n    try:\n        return TOOLS[name](**json.loads(args_text))\n    except Exception as e:\n        return f\"Error: {e}\"\n\n# ---------- a fake model that follows a script ----------\ndef fake_model(messages):\n    step = len([m for m in messages if m[\"role\"] == \"assistant\"])\n    last = messages[-1][\"content\"]               # the last message (the previous Observation)\n    if step == 0:\n        return 'Thought: To get the temperature I first need Beijing\\'s coordinates.\\nAction: get_coordinates\\nAction Input: {\"city\": \"Beijing\"}'\n    if step == 1:\n        coords = last.split(\"Observation:\")[1].strip()\n        return \"Thought: I have the coordinates; now the temperature.\\nAction: get_weather\\nAction Input: \" + coords\n    temp = last.split(\"Observation:\")[1].strip()\n    return f\"Thought: I now know the final answer\\nFinal Answer: It is about {temp}°C in Beijing right now.\"\n\n# ---------- the ReAct loop ----------\nMAX_STEPS = 5\n\ndef react_agent(question):\n    messages = [\n        {\"role\": \"system\", \"content\": \"(the ReAct prompt from part 8)\"},\n        {\"role\": \"user\", \"content\": f\"Question: {question}\"},\n    ]\n    for step in range(1, MAX_STEPS + 1):\n        text = fake_model(messages)                                  # 1. ask the model\n        print(f\"--- step {step} ---\\n{text}\")\n        messages.append({\"role\": \"assistant\", \"content\": text})      # 2. store the reply\n        if \"Final Answer:\" in text:                                  # 3. finished?\n            return text.split(\"Final Answer:\")[-1].strip()\n        parsed = parse_action(text)                                  # 4. parse -> run\n        if parsed is None:\n            observation = \"Wrong format. Reply with Thought / Action / Action Input\"\n        else:\n            name, args_text = parsed\n            observation = run_tool(name, args_text)\n        print(f\"Observation: {observation}\")\n        messages.append({\"role\": \"user\", \"content\": f\"Observation: {observation}\"})\n    return \"Reached MAX_STEPS without a final answer\"\n\nprint(\"Final answer:\", react_agent(\"How warm is it in Beijing right now?\"))"
      },
      "note": {
        "zh": "`for step in range(1, MAX_STEPS + 1)`：`range(1, 6)` 依次给出 1、2、3、4、5，所以最多循环 5 轮。循环里一旦 `return`，整个函数立刻结束；5 轮都没结束，才会走到最后那行 `return`。",
        "en": "`for step in range(1, MAX_STEPS + 1)`: `range(1, 6)` yields 1, 2, 3, 4, 5, so the loop runs at most 5 rounds. A `return` inside the loop ends the whole function at once; only if all 5 rounds pass does the last `return` run."
      }
    },
    {
      "t": "warn",
      "zh": "**要防着模型替你写 Observation**：有些模型写完 `Action Input` 以后，会顺手接着写 `Observation: ……`。它根本没有调用工具，这个结果是**编的**，后面甚至会直接写出 Final Answer。提示词里写了「不要自己写 Observation」，也不能保证每个模型都听，所以再加两道防线：\n1. 调用时传 `stop=[\"Observation:\"]`：模型一写到 `Observation:`，API 就让它停下，返回的文字里不包含这几个字。\n2. 拿到文字后再保险一次：`text.split(\"Observation:\")[0]`，只保留 `Observation:` 前面的部分。\n\n用 `deepseek-flash` 实测：在这份提示词下，即使不加 `stop`，它也会在 `Action Input` 之后自己停下；换一个模型或提示词就不一定了。两道防线几乎没有成本，建议都加上。",
      "en": "**Guard against the model writing the Observation for you**: some models carry on after `Action Input` and write `Observation: ……` themselves. They never called the tool – that result is **made up**, and a Final Answer may follow right after. A “never write the Observation” rule in the prompt doesn't guarantee every model obeys, so add two guards:\n1. Pass `stop=[\"Observation:\"]`: the moment the model writes `Observation:`, the API stops it, and those characters are not in the returned text.\n2. Double-check the text you get: `text.split(\"Observation:\")[0]` keeps only what comes before `Observation:`.\n\nTested with `deepseek-flash`: with this prompt it stops after `Action Input` on its own even without `stop`, but another model or prompt may not. Both guards cost almost nothing, so use them."
    },
    {
      "t": "p",
      "zh": "把假模型换成真模型，只需要一个 `call_model` 函数，循环本身一个字都不用改：",
      "en": "Swapping the fake model for a real one takes only a `call_model` function; the loop itself doesn't change at all:"
    },
    {
      "t": "code",
      "file": "text_react_agent.py",
      "code": {
        "zh": "from llm import client, MODEL\n# SYSTEM_PROMPT、MAX_STEPS、parse_action、run_tool 和上面一样\n# 完整文件见 practice/l07_text_react_solution.py\n\ndef call_model(messages):\n    response = client.chat.completions.create(\n        model=MODEL,\n        messages=messages,\n        stop=[\"Observation:\"],        # 第一道防线：模型要写 Observation: 时就停下\n    )\n    return response.choices[0].message.content or \"\"\n\ndef react_agent(question):\n    messages = [\n        {\"role\": \"system\", \"content\": SYSTEM_PROMPT},\n        {\"role\": \"user\", \"content\": f\"Question: {question}\"},\n    ]\n    for step in range(1, MAX_STEPS + 1):\n        text = call_model(messages)\n        text = text.split(\"Observation:\")[0].strip()       # 第二道防线\n        print(f\"--- 第 {step} 步 ---\\n{text}\")\n        messages.append({\"role\": \"assistant\", \"content\": text})\n        if \"Final Answer:\" in text:\n            return text.split(\"Final Answer:\")[-1].strip()\n        parsed = parse_action(text)\n        if parsed is None:\n            observation = \"格式不对：请按 Thought / Action / Action Input 的格式回复，或者给出 Final Answer。\"\n        else:\n            name, args_text = parsed\n            observation = run_tool(name, args_text)\n        print(f\"Observation: {observation}\")\n        messages.append({\"role\": \"user\", \"content\": f\"Observation: {observation}\"})\n    return \"达到最大步数，没有得到最终答案\"\n\nprint(react_agent(\"北京现在多少度？\"))",
        "en": "from llm import client, MODEL\n# SYSTEM_PROMPT, MAX_STEPS, parse_action and run_tool are the same as above\n# full file: practice/l07_text_react_solution.py\n\ndef call_model(messages):\n    response = client.chat.completions.create(\n        model=MODEL,\n        messages=messages,\n        stop=[\"Observation:\"],        # guard 1: stop as soon as the model starts an Observation\n    )\n    return response.choices[0].message.content or \"\"\n\ndef react_agent(question):\n    messages = [\n        {\"role\": \"system\", \"content\": SYSTEM_PROMPT},\n        {\"role\": \"user\", \"content\": f\"Question: {question}\"},\n    ]\n    for step in range(1, MAX_STEPS + 1):\n        text = call_model(messages)\n        text = text.split(\"Observation:\")[0].strip()       # guard 2\n        print(f\"--- step {step} ---\\n{text}\")\n        messages.append({\"role\": \"assistant\", \"content\": text})\n        if \"Final Answer:\" in text:\n            return text.split(\"Final Answer:\")[-1].strip()\n        parsed = parse_action(text)\n        if parsed is None:\n            observation = \"Wrong format. Reply with Thought / Action / Action Input, or give a Final Answer.\"\n        else:\n            name, args_text = parsed\n            observation = run_tool(name, args_text)\n        print(f\"Observation: {observation}\")\n        messages.append({\"role\": \"user\", \"content\": f\"Observation: {observation}\"})\n    return \"Reached MAX_STEPS without a final answer\"\n\nprint(react_agent(\"How warm is it in Beijing right now?\"))"
      },
      "note": {
        "zh": "`content or \"\"`：万一 `content` 是 `None`，就用空字符串代替，后面的 `split` 才不会报错（回顾 05 节的 Python 小课堂）。这段代码要连真实模型，请在本地运行 `practice/l07_text_react_solution.py`。用 `deepseek-flash` 实测：它严格按格式写，3 次调用（查经纬度 → 查气温 → 给出 Final Answer）就答完了。",
        "en": "`content or \"\"`: if `content` is `None`, use an empty string so the `split` that follows can't fail (see the Python mini-lesson in lesson 05). This code needs the real model – run `practice/l07_text_react_solution.py` locally. Tested with `deepseek-flash`: it kept to the format exactly and finished in 3 calls (coordinates → temperature → Final Answer)."
      }
    },
    {
      "t": "p",
      "zh": "两种写法跑的是**同一个循环**：想 → 调工具 → 看结果 → 再想。区别只在信息怎么传：\n\n| | 视频的写法：原生工具调用 | 拓展：纯文字 ReAct |\n|---|---|---|\n| 工具怎么告诉模型 | `tools=` 参数（JSON Schema） | 写在 system 提示词里 |\n| 模型怎么要求调用 | 回复里的 `tool_calls` 字段 | 文字里写 `Action` / `Action Input` |\n| 谁来解析 | API 已经拆好 | 你的正则表达式 |\n| 结果怎么送回 | `tool` 消息，带 `tool_call_id` | `user` 消息：`Observation: ...` |\n| 思考过程 | 靠提示词要求模型写在 `content` 里 | 写在 `Thought` 里，格式由你规定 |\n| 优点 | 格式稳定，出错少；一次可以请求多个调用 | 任何能聊天的模型都能用；每一步都是纯文字，好调试 |\n| 缺点 | 需要模型和接口支持 function calling | 模型可能不按格式写，要自己处理 |\n\n现在的主流模型都支持原生工具调用，所以视频和后面的框架大多用第一种；第二种让你看清 ReAct 本来的样子，也能用在不支持 function calling 的模型上。",
      "en": "Both approaches run **the same loop**: think → call a tool → look at the result → think again. They differ only in how the information travels:\n\n| | The video's way: native tool calling | Extension: text-only ReAct |\n|---|---|---|\n| How the model learns the tools | the `tools=` parameter (JSON Schema) | written in the system prompt |\n| How it asks for a call | the `tool_calls` field of the reply | writes `Action` / `Action Input` in text |\n| Who parses it | the API, already split out | your regular expressions |\n| How results go back | a `tool` message with `tool_call_id` | a `user` message: `Observation: ...` |\n| The reasoning | written into `content` because the prompt asks for it | written in `Thought`, in a format you define |\n| Strengths | stable format, fewer errors; several calls at once | works with any chat model; every step is plain text, easy to debug |\n| Weaknesses | needs a model and API that support function calling | the model may break the format; you must handle it |\n\nToday's mainstream models all support native tool calling, so the video and the frameworks later on mostly use the first; the second shows what ReAct originally looked like and also works with models that lack function calling."
    },
    {
      "t": "check",
      "q": {
        "zh": "关于两种写法，下面哪个说法**正确**？",
        "en": "Which statement about the two approaches is **correct**?"
      },
      "options": [
        {
          "zh": "纯文字版 ReAct 只能用在支持 function calling 的模型上",
          "en": "Text-only ReAct only works with models that support function calling"
        },
        {
          "zh": "原生工具调用不需要循环，调用一次就能拿到最终回答",
          "en": "Native tool calling needs no loop; one call gives the final answer"
        },
        {
          "zh": "纯文字版要自己从文字里解析工具名和参数；原生工具调用由 API 给出结构化的 `tool_calls`",
          "en": "The text-only version parses the tool name and arguments from text; native tool calling gets structured `tool_calls` from the API"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "纯文字版任何能聊天的模型都能用，代价是要自己解析；两种写法都需要循环，直到模型不再调用工具。",
        "en": "The text-only version works with any chat model at the cost of parsing it yourself; both need a loop until the model stops calling tools."
      }
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "第五部分写的 ReAct 循环（原生工具调用）在什么情况下结束？",
        "en": "When does the ReAct loop from part 5 (native tool calling) end?"
      },
      "options": [
        {
          "zh": "模型的回复里出现 `Thought:` 的时候",
          "en": "When the model's reply contains `Thought:`"
        },
        {
          "zh": "工具执行出错的时候",
          "en": "When a tool raises an error"
        },
        {
          "zh": "调用一次模型就结束",
          "en": "After a single model call"
        },
        {
          "zh": "模型的回复里不再有 `tool_calls`（这就是最终回答），或者达到了最大轮数",
          "en": "When the reply has no more `tool_calls` (that is the final answer), or the maximum number of rounds is reached"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "没有 `tool_calls` 说明模型不需要更多信息，这条回复就是最终回答；最大轮数是保险，防止模型一直绕圈。工具出错不会结束循环：错误说明会作为 Observation 交还给模型。",
        "en": "No `tool_calls` means the model needs nothing more, so this reply is the final answer; the round limit is a safety net against going in circles. A tool error doesn't end the loop – the error text goes back to the model as the Observation."
      }
    },
    {
      "q": {
        "zh": "视频的写法已经用 `tools` 参数告诉了模型有哪些工具，那 ReAct 系统提示词主要起什么作用？",
        "en": "The video's version already passes the tools in the `tools` parameter. What does the ReAct system prompt mainly do?"
      },
      "options": [
        {
          "zh": "规定工作方式：先写思考，再调用工具，看完结果再继续，不要一次就给出答案",
          "en": "It sets the way of working: write a thought, call a tool, read the result, carry on – don't answer in one go"
        },
        {
          "zh": "让 API 自动执行工具函数",
          "en": "It makes the API run the tool functions automatically"
        },
        {
          "zh": "代替 `tools` 参数，把工具的 JSON Schema 告诉模型",
          "en": "It replaces the `tools` parameter by giving the model the JSON Schema"
        },
        {
          "zh": "让 `tool_calls` 里的参数变成字典，不用再 `json.loads`",
          "en": "It turns the arguments in `tool_calls` into a dict, so no `json.loads` is needed"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "执行工具永远是你的代码的事；工具说明已经在 `tools` 里；参数仍然是 JSON 字符串。提示词规定的是**工作方式**：思考 → 行动 → 观察的循环，每一步把思路写出来，最后再回答。",
        "en": "Running tools is always your code's job; the tool descriptions are already in `tools`; the arguments are still a JSON string. The prompt sets the **way of working**: the think → act → observe loop, writing out the reasoning each step and answering at the end."
      }
    },
    {
      "q": {
        "zh": "视频说，让模型在回复里先把思考写出来，能提高准确性。原因是？",
        "en": "The video says having the model write out its thinking first makes it more accurate. Why?"
      },
      "options": [
        {
          "zh": "写出来的思考会被 API 自动执行",
          "en": "The API executes the written thoughts automatically"
        },
        {
          "zh": "写得越长，模型的温度参数越低",
          "en": "The longer it writes, the lower its temperature setting"
        },
        {
          "zh": "模型写出的思路和工具结果会成为它后面生成内容的输入，后面的推理就有了依据（思维链）",
          "en": "The plan and tool results it writes become input for what it generates next, so later reasoning has something to build on (chain of thought)"
        },
        {
          "zh": "写出思考以后，就不再需要调用工具了",
          "en": "Once it writes its thoughts, it no longer needs to call tools"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "这就是思维链的原理：模型自己写下的内容，又会被它当作输入，左右接下来生成什么。工具仍然要调用，而且永远由你的代码执行。",
        "en": "That is how chain of thought works: the output itself becomes input and shapes what follows. Tools are still needed, and your code always runs them."
      }
    },
    {
      "q": {
        "zh": "每一轮拿到模型的回复后，为什么要把它存进 `messages`？",
        "en": "Why store the model's reply in `messages` every round?"
      },
      "options": [
        {
          "zh": "为了让 `stop` 参数生效",
          "en": "So that the `stop` parameter works"
        },
        {
          "zh": "否则下一轮模型看不到自己之前的 Thought 和 Action，会重复同样的步骤，也不知道 Observation 对应的是哪个动作",
          "en": "Otherwise the model can't see its earlier Thoughts and Actions next round – it repeats steps and can't tell which action an Observation belongs to"
        },
        {
          "zh": "为了让正则表达式能匹配",
          "en": "So that the regular expression can match"
        },
        {
          "zh": "API 规定每次请求必须以 assistant 消息结尾",
          "en": "The API requires every request to end with an assistant message"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "05 节讲过：API 没有记忆，模型能看到的只有你发过去的 `messages`。",
        "en": "As lesson 05 showed, the API remembers nothing, so the model sees only the `messages` you send."
      }
    },
    {
      "q": {
        "zh": "模型要调用 `search`，但 `TOOLS` 里没有这个工具。最好的处理是？",
        "en": "The model asks for `search`, but `TOOLS` has no such tool. What is the best way to handle it?"
      },
      "options": [
        {
          "zh": "让程序直接报错退出",
          "en": "Let the program crash"
        },
        {
          "zh": "跳过这一步，用同样的 `messages` 再问一次模型",
          "en": "Skip the step and ask the model again with the same `messages`"
        },
        {
          "zh": "随便调用一个现有的工具",
          "en": "Call any existing tool instead"
        },
        {
          "zh": "把「没有这个工具，可用的有……」作为 Observation 交还给模型，让它自己改正",
          "en": "Send back “no such tool; the available ones are …” as the Observation and let the model correct itself"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "错误信息也是一种观察结果。模型看到可用的工具列表后，下一步通常就会选对。",
        "en": "An error message is an observation too. Once the model sees the list of tools, it usually picks the right one next."
      }
    },
    {
      "q": {
        "zh": "纯文字版 ReAct 调用模型时，为什么要传 `stop=[\"Observation:\"]`？",
        "en": "In text-only ReAct, why pass `stop=[\"Observation:\"]` when calling the model?"
      },
      "options": [
        {
          "zh": "让模型回答得更快",
          "en": "To make the model answer faster"
        },
        {
          "zh": "让 API 自动执行工具",
          "en": "So the API runs the tool automatically"
        },
        {
          "zh": "防止模型自己编写工具结果——Observation 必须来自真正执行的工具",
          "en": "To stop the model from inventing tool results – the Observation must come from actually running the tool"
        },
        {
          "zh": "让模型只输出 Final Answer",
          "en": "So the model outputs only the Final Answer"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "有的模型写完 Action Input 后会接着编一个 Observation。`stop` 让它在写到 `Observation:` 时停下，结果由你的代码执行工具后填写。",
        "en": "Some models invent an Observation right after Action Input. `stop` halts them at `Observation:`, so your code fills in the real result after running the tool."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "视频版 ReAct 循环",
        "en": "The video's ReAct loop"
      },
      "code": {
        "zh": "def react_agent(question, max_iterations=5):\n    messages.append({\"role\": \"[[user]]\", \"content\": question})\n    current_iteration = 1\n    while current_iteration [[<=]] max_iterations:\n        reply = [[ask_model]]()\n        if reply.content:\n            print(reply.content)\n        if not reply.[[tool_calls]]:\n            return reply.[[content]]\n        for call in reply.tool_calls:\n            observation = run_tool(call.function.[[name]], call.function.[[arguments]])\n            messages.append({\"role\": \"[[tool]]\", \"tool_call_id\": call.[[id]], \"content\": [[str(observation)]]})\n        current_iteration [[+= 1]]\n    return \"达到最大轮数\"",
        "en": "def react_agent(question, max_iterations=5):\n    messages.append({\"role\": \"[[user]]\", \"content\": question})\n    current_iteration = 1\n    while current_iteration [[<=]] max_iterations:\n        reply = [[ask_model]]()\n        if reply.content:\n            print(reply.content)\n        if not reply.[[tool_calls]]:\n            return reply.[[content]]\n        for call in reply.tool_calls:\n            observation = run_tool(call.function.[[name]], call.function.[[arguments]])\n            messages.append({\"role\": \"[[tool]]\", \"tool_call_id\": call.[[id]], \"content\": [[str(observation)]]})\n        current_iteration [[+= 1]]\n    return \"Reached max_iterations\""
      },
      "explain": {
        "zh": "计数器加 `while` 条件限制最大轮数；没有 `tool_calls` 就是最终回答；每个工具结果都以 `tool` 消息存回，带上 `tool_call_id`；每轮最后别忘了 `+= 1`。",
        "en": "A counter in the `while` condition caps the rounds; no `tool_calls` means the final answer; every tool result goes back as a `tool` message with its `tool_call_id`; don't forget `+= 1` at the end of each round."
      }
    },
    {
      "title": {
        "zh": "解析回复，执行工具（拓展）",
        "en": "Parse the reply, run the tool (extension)"
      },
      "code": {
        "zh": "def parse_action(text):\n    action = re.[[search]](r\"Action:\\s*(\\w+)\", text)\n    action_input = re.search(r\"Action Input:\\s*(\\{.*\\})\", text, re.[[DOTALL]])\n    if action is [[None]] or action_input is None:\n        return None\n    return action.[[group]](1), action_input.group(1)\n\ndef run_tool(name, args_text):\n    if name [[not in]] TOOLS:\n        return f\"错误：没有叫 {name} 的工具\"\n    [[try]]:\n        args = json.[[loads]](args_text)\n        return [[TOOLS]][name](**args)\n    [[except]] Exception as e:\n        return f\"错误：{e}\"",
        "en": "def parse_action(text):\n    action = re.[[search]](r\"Action:\\s*(\\w+)\", text)\n    action_input = re.search(r\"Action Input:\\s*(\\{.*\\})\", text, re.[[DOTALL]])\n    if action is [[None]] or action_input is None:\n        return None\n    return action.[[group]](1), action_input.group(1)\n\ndef run_tool(name, args_text):\n    if name [[not in]] TOOLS:\n        return f\"Error: there is no tool called {name}\"\n    [[try]]:\n        args = json.[[loads]](args_text)\n        return [[TOOLS]][name](**args)\n    [[except]] Exception as e:\n        return f\"Error: {e}\""
      },
      "explain": {
        "zh": "`re.search` 没找到返回 `None`，所以先判断；跨行的 JSON 需要 `re.DOTALL`；`try/except` 把错误变成文字交还给模型。",
        "en": "`re.search` returns `None` when nothing matches, so check first; JSON across lines needs `re.DOTALL`; `try/except` turns errors into text for the model."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：视频里的 ReAct Agent",
        "en": "Write it: the video's ReAct agent"
      },
      "task": {
        "zh": "工具 `get_game_info` 和工具说明 `tools` 已经给出。不看上面的代码，写出：\n1. 用三引号写系统提示词 `SYSTEM_PROMPT`：要求模型按 Thought → Action → Observation 循环；每次调用工具前先写 `Thought:`；一定要用工具查询；最后用 `Final Answer:` 回答\n2. 对话记录 `messages`：第一条是 system 消息\n3. `ask_model()`：带上 `tools` 调用模型，把回复的 `model_dump()` 存进 `messages`，返回回复\n4. 工具字典 `TOOLS` 和 `run_tool(name, arguments)`：未知工具返回错误说明；用 `try/except` 包住 `json.loads` 和 `TOOLS[name](**args)`\n5. `react_agent(question, max_iterations=5)`：存入提问；`current_iteration = 1`，用 `while current_iteration <= max_iterations:` 循环：调用模型、打印思考 → 没有 `tool_calls` 就返回 `reply.content` → 否则执行**每一个**工具调用，打印 Observation，存成 `tool` 消息 → `current_iteration += 1`\n\n这段代码要连真实模型（网页里的模拟模型不认识这个工具），写完后对照参考答案检查，再在本地补全并运行 `practice/l07_react_agent_todo.py`。",
        "en": "The tool `get_game_info` and its description `tools` are given. Without looking above, write:\n1. the system prompt `SYSTEM_PROMPT` in triple quotes: the Thought → Action → Observation loop; `Thought:` before each tool call; always use the tool; finish with `Final Answer:`\n2. the history `messages`, with a system message first\n3. `ask_model()`: call the model with `tools`, store the reply's `model_dump()` in `messages`, return the reply\n4. the dict `TOOLS` and `run_tool(name, arguments)`: an error message for an unknown tool; `try/except` around `json.loads` and `TOOLS[name](**args)`\n5. `react_agent(question, max_iterations=5)`: store the question; `current_iteration = 1` and loop with `while current_iteration <= max_iterations:` – call the model and print its thought → no `tool_calls` means return `reply.content` → otherwise run **every** tool call, print the Observation, store it as a `tool` message → `current_iteration += 1`\n\nThis needs the real model (the browser's mock model doesn't know this tool): check it against the reference solution, then complete and run `practice/l07_react_agent_todo.py` locally."
      },
      "starter": {
        "zh": "import json\nfrom llm import client, MODEL\n\nGAMES = [\n    {\"name\": \"篮球\", \"players\": \"每队一般有 12 名队员，比赛时每队场上 5 人，其余是替补。\"},\n    {\"name\": \"排球\", \"players\": \"比赛时每队场上 6 人，其余是替补。\"},\n    {\"name\": \"沙滩排球\", \"players\": \"每队只有 2 人，没有替补。\"},\n]\n\ndef get_game_info(game_name):\n    results = []\n    for game in GAMES:\n        if game_name in game[\"name\"]:\n            results.append(game)\n    if not results:\n        return f\"没有找到和「{game_name}」有关的比赛。\"\n    return json.dumps(results, ensure_ascii=False)\n\ntools = [{\n    \"type\": \"function\",\n    \"function\": {\n        \"name\": \"get_game_info\",\n        \"description\": \"查询球类比赛的基本介绍和人数规模（每队有几人、比赛时场上有几人）。\",\n        \"parameters\": {\n            \"type\": \"object\",\n            \"properties\": {\"game_name\": {\"type\": \"string\", \"description\": \"比赛名称，例如：篮球、排球\"}},\n            \"required\": [\"game_name\"],\n        },\n    },\n}]\n\n# 1. 用三引号写 SYSTEM_PROMPT：Thought → Action → Observation 循环，先用工具查询，最后 Final Answer\n\n\n# 2. 对话记录 messages：第一条是 system 消息\n\n\n# 3. ask_model()：带上 tools 调用模型，把回复的 model_dump() 存进 messages，返回回复\n\n\n# 4. TOOLS 字典和 run_tool(name, arguments)：未知工具返回错误说明；try/except 包住 json.loads 和调用\n\n\n# 5. react_agent(question, max_iterations=5)：计数器 + while 循环，最多 max_iterations 轮\n\n\nprint(react_agent(\"比赛场上，篮球队的人数乘以排球队的人数，结果是多少？\"))",
        "en": "import json\nfrom llm import client, MODEL\n\nGAMES = [\n    {\"name\": \"basketball\", \"players\": \"A team usually has 12 players; 5 per team are on court during a game, the rest are substitutes.\"},\n    {\"name\": \"volleyball\", \"players\": \"6 players per team are on court during a game; the rest are substitutes.\"},\n    {\"name\": \"beach volleyball\", \"players\": \"Only 2 players per team, no substitutes.\"},\n]\n\ndef get_game_info(game_name):\n    results = []\n    for game in GAMES:\n        if game_name in game[\"name\"]:\n            results.append(game)\n    if not results:\n        return f\"No game matching '{game_name}' was found.\"\n    return json.dumps(results, ensure_ascii=False)\n\ntools = [{\n    \"type\": \"function\",\n    \"function\": {\n        \"name\": \"get_game_info\",\n        \"description\": \"Look up a ball game's basic description and team sizes (squad size, players on court).\",\n        \"parameters\": {\n            \"type\": \"object\",\n            \"properties\": {\"game_name\": {\"type\": \"string\", \"description\": \"The game's name, e.g. basketball, volleyball\"}},\n            \"required\": [\"game_name\"],\n        },\n    },\n}]\n\n# 1. SYSTEM_PROMPT in triple quotes: the Thought -> Action -> Observation loop, use the tool, end with Final Answer\n\n\n# 2. the history messages: the first item is the system message\n\n\n# 3. ask_model(): call the model with tools, store the reply's model_dump() in messages, return the reply\n\n\n# 4. the TOOLS dict and run_tool(name, arguments): unknown tool -> an error message; try/except around json.loads and the call\n\n\n# 5. react_agent(question, max_iterations=5): a counter + a while loop, at most max_iterations rounds\n\n\nprint(react_agent(\"On court, a basketball team's player count times a volleyball team's - what is it?\"))"
      },
      "solution": {
        "zh": "import json\nfrom llm import client, MODEL\n\nGAMES = [\n    {\"name\": \"篮球\", \"players\": \"每队一般有 12 名队员，比赛时每队场上 5 人，其余是替补。\"},\n    {\"name\": \"排球\", \"players\": \"比赛时每队场上 6 人，其余是替补。\"},\n    {\"name\": \"沙滩排球\", \"players\": \"每队只有 2 人，没有替补。\"},\n]\n\ndef get_game_info(game_name):\n    results = []\n    for game in GAMES:\n        if game_name in game[\"name\"]:\n            results.append(game)\n    if not results:\n        return f\"没有找到和「{game_name}」有关的比赛。\"\n    return json.dumps(results, ensure_ascii=False)\n\ntools = [{\n    \"type\": \"function\",\n    \"function\": {\n        \"name\": \"get_game_info\",\n        \"description\": \"查询球类比赛的基本介绍和人数规模（每队有几人、比赛时场上有几人）。\",\n        \"parameters\": {\n            \"type\": \"object\",\n            \"properties\": {\"game_name\": {\"type\": \"string\", \"description\": \"比赛名称，例如：篮球、排球\"}},\n            \"required\": [\"game_name\"],\n        },\n    },\n}]\n\n# 1. 用三引号写 SYSTEM_PROMPT\nSYSTEM_PROMPT = \"\"\"你是一个会使用工具解决问题的助手。不要一次就给出答案，请按这个循环一步一步来：\nThought（思考）：写下你的理解和下一步打算。\nAction（行动）：需要信息时，调用工具。\nObservation（观察）：读懂工具返回的结果，再继续思考。\n每次调用工具之前先写 \"Thought: ...\"。球类比赛的信息一定要用工具查询，不要凭记忆回答。\n信息足够时，用 \"Final Answer: ...\" 给出最终回答。\"\"\"\n\n# 2. 对话记录 messages\nmessages = [{\"role\": \"system\", \"content\": SYSTEM_PROMPT}]\n\n# 3. ask_model()\ndef ask_model():\n    response = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)\n    reply = response.choices[0].message\n    messages.append(reply.model_dump())\n    return reply\n\n# 4. TOOLS 字典和 run_tool(name, arguments)\nTOOLS = {\"get_game_info\": get_game_info}\n\ndef run_tool(name, arguments):\n    if name not in TOOLS:\n        return f\"错误：没有叫 {name} 的工具\"\n    try:\n        args = json.loads(arguments)\n        return TOOLS[name](**args)\n    except Exception as e:\n        return f\"错误：{e}\"\n\n# 5. react_agent(question, max_iterations=5)\ndef react_agent(question, max_iterations=5):\n    messages.append({\"role\": \"user\", \"content\": question})\n    current_iteration = 1\n    while current_iteration <= max_iterations:\n        reply = ask_model()\n        if reply.content:\n            print(reply.content)\n        if not reply.tool_calls:\n            return reply.content\n        for call in reply.tool_calls:\n            observation = run_tool(call.function.name, call.function.arguments)\n            print(\"Observation:\", observation)\n            messages.append({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": str(observation)})\n        current_iteration += 1\n    return \"达到最大轮数，还没有得到最终答案。\"\n\nprint(react_agent(\"比赛场上，篮球队的人数乘以排球队的人数，结果是多少？\"))",
        "en": "import json\nfrom llm import client, MODEL\n\nGAMES = [\n    {\"name\": \"basketball\", \"players\": \"A team usually has 12 players; 5 per team are on court during a game, the rest are substitutes.\"},\n    {\"name\": \"volleyball\", \"players\": \"6 players per team are on court during a game; the rest are substitutes.\"},\n    {\"name\": \"beach volleyball\", \"players\": \"Only 2 players per team, no substitutes.\"},\n]\n\ndef get_game_info(game_name):\n    results = []\n    for game in GAMES:\n        if game_name in game[\"name\"]:\n            results.append(game)\n    if not results:\n        return f\"No game matching '{game_name}' was found.\"\n    return json.dumps(results, ensure_ascii=False)\n\ntools = [{\n    \"type\": \"function\",\n    \"function\": {\n        \"name\": \"get_game_info\",\n        \"description\": \"Look up a ball game's basic description and team sizes (squad size, players on court).\",\n        \"parameters\": {\n            \"type\": \"object\",\n            \"properties\": {\"game_name\": {\"type\": \"string\", \"description\": \"The game's name, e.g. basketball, volleyball\"}},\n            \"required\": [\"game_name\"],\n        },\n    },\n}]\n\n# 1. SYSTEM_PROMPT in triple quotes\nSYSTEM_PROMPT = \"\"\"You are an assistant that solves problems with tools. Don't answer in one go; work step by step in this loop:\nThought: write down your understanding and your next step.\nAction: when you need information, call a tool.\nObservation: read the tool's result, then keep thinking.\nWrite \"Thought: ...\" before each tool call. Always look up ball-game facts with the tool; never answer from memory.\nWhen you have enough information, give the final answer as \"Final Answer: ...\".\"\"\"\n\n# 2. the history messages\nmessages = [{\"role\": \"system\", \"content\": SYSTEM_PROMPT}]\n\n# 3. ask_model()\ndef ask_model():\n    response = client.chat.completions.create(model=MODEL, messages=messages, tools=tools)\n    reply = response.choices[0].message\n    messages.append(reply.model_dump())\n    return reply\n\n# 4. the TOOLS dict and run_tool(name, arguments)\nTOOLS = {\"get_game_info\": get_game_info}\n\ndef run_tool(name, arguments):\n    if name not in TOOLS:\n        return f\"Error: there is no tool called {name}\"\n    try:\n        args = json.loads(arguments)\n        return TOOLS[name](**args)\n    except Exception as e:\n        return f\"Error: {e}\"\n\n# 5. react_agent(question, max_iterations=5)\ndef react_agent(question, max_iterations=5):\n    messages.append({\"role\": \"user\", \"content\": question})\n    current_iteration = 1\n    while current_iteration <= max_iterations:\n        reply = ask_model()\n        if reply.content:\n            print(reply.content)\n        if not reply.tool_calls:\n            return reply.content\n        for call in reply.tool_calls:\n            observation = run_tool(call.function.name, call.function.arguments)\n            print(\"Observation:\", observation)\n            messages.append({\"role\": \"tool\", \"tool_call_id\": call.id, \"content\": str(observation)})\n        current_iteration += 1\n    return \"Reached max_iterations without a final answer.\"\n\nprint(react_agent(\"On court, a basketball team's player count times a volleyball team's - what is it?\"))"
      },
      "checks": [
        {
          "zh": "用三引号写了 `SYSTEM_PROMPT`",
          "en": "`SYSTEM_PROMPT` is written in triple quotes",
          "re": "SYSTEM_PROMPT\\s*=\\s*\"\"\""
        },
        {
          "zh": "提示词里写了 `Thought` 和 `Final Answer`",
          "en": "The prompt mentions `Thought` and `Final Answer`",
          "re": "SYSTEM_PROMPT\\s*=\\s*\"\"\"[\\s\\S]*?Thought[\\s\\S]*?Final Answer[\\s\\S]*?\"\"\""
        },
        {
          "zh": "对话记录的第一条是 system 消息",
          "en": "The history starts with a system message",
          "re": "messages\\s*=\\s*\\[\\s*\\{\\s*[\\\"']role[\\\"']\\s*:\\s*[\\\"']system[\\\"']"
        },
        {
          "zh": "调用模型时带上 `tools=tools`",
          "en": "Calls the model with `tools=tools`",
          "re": "tools\\s*=\\s*tools\\b"
        },
        {
          "zh": "把回复的 `model_dump()` 存进 `messages`",
          "en": "Stores the reply's `model_dump()` in `messages`",
          "re": "messages\\.append\\(\\s*\\w+\\.model_dump\\(\\)\\s*\\)"
        },
        {
          "zh": "用 `TOOLS[name](**args)` 调用工具",
          "en": "Calls the tool with `TOOLS[name](**args)`",
          "re": "TOOLS\\[\\s*\\w+\\s*\\]\\(\\s*\\*\\*"
        },
        {
          "zh": "用 `try/except` 包住工具调用",
          "en": "Wraps the tool call in `try/except`",
          "re": "^\\s*try\\s*:[\\s\\S]*?^\\s*except\\b"
        },
        {
          "zh": "用计数器和 `while` 限制最大轮数",
          "en": "Caps the rounds with a counter and `while`",
          "re": "while\\s+\\w+\\s*<=?\\s*\\w+\\s*:"
        },
        {
          "zh": "每轮末尾计数器 `+= 1`",
          "en": "The counter gets `+= 1` each round",
          "re": "\\w+\\s*\\+=\\s*1\\b"
        },
        {
          "zh": "没有 `tool_calls` 时返回最终回答",
          "en": "Returns the final answer when there are no `tool_calls`",
          "re": "if\\s+not\\s+\\w+\\.tool_calls"
        },
        {
          "zh": "工具结果存成 tool 消息，带 `tool_call_id`",
          "en": "Stores each result as a tool message with `tool_call_id`",
          "re": "[\\\"']role[\\\"']\\s*:\\s*[\\\"']tool[\\\"']\\s*,\\s*[\\\"']tool_call_id[\\\"']"
        }
      ]
    },
    {
      "title": {
        "zh": "手写（拓展）：纯文字 ReAct 的提示词模板 + 解析函数",
        "en": "Write it (extension): the text-only ReAct prompt template + parser"
      },
      "task": {
        "zh": "不看上面的代码，写出：\n1. 用三引号写一个模板 `REACT_PROMPT`：留一个 `{tools}` 占位符；写清楚两种回复格式（Thought / Action / Action Input，以及 Thought / Final Answer）；提醒模型每次只写一个 Action、不要自己写 Observation\n2. 用 `.format()` 把给出的 `TOOL_DESCRIPTIONS` 填进去，得到 `SYSTEM_PROMPT` 并打印\n3. 函数 `parse_action(text)`：用 `re.search` 找出 Action 后面的工具名、Action Input 后面的 JSON（记得 `re.DOTALL`）；任何一个没找到就返回 `None`，否则返回两个 `group(1)`\n4. 运行最后的测试，第一行应该打印出一个元组，第二行打印 `None`",
        "en": "Without looking above, write:\n1. a triple-quoted template `REACT_PROMPT` with a `{tools}` placeholder; spell out both reply formats (Thought / Action / Action Input, and Thought / Final Answer); tell the model to write one Action at a time and never write the Observation itself\n2. fill in the given `TOOL_DESCRIPTIONS` with `.format()` to get `SYSTEM_PROMPT`, and print it\n3. a function `parse_action(text)`: use `re.search` to find the tool name after Action and the JSON after Action Input (remember `re.DOTALL`); return `None` if either is missing, otherwise both `group(1)` values\n4. run the tests at the end: the first line should print a tuple, the second `None`"
      },
      "run": true,
      "starter": {
        "zh": "import re\n\nTOOL_DESCRIPTIONS = '- get_coordinates: 查询城市的经纬度。Action Input 示例：{\"city\": \"北京\"}\\n- get_weather: 根据经纬度查询当前气温。Action Input 示例：{\"latitude\": 39.9, \"longitude\": 116.4}'\n\n# 1. 用三引号写 REACT_PROMPT：留一个 tools 占位符，写清楚回复格式和规则\n\n\n# 2. 用 .format() 把 TOOL_DESCRIPTIONS 填进去，得到 SYSTEM_PROMPT 并打印\n\n\n# 3. 定义 parse_action(text)：返回 (工具名, 参数字符串)，格式不对返回 None\n\n\n# 4. 测试\nreply1 = 'Thought: 先查坐标。\\nAction: get_coordinates\\nAction Input: {\"city\": \"北京\"}'\nreply2 = \"Thought: 我再想想……\"\nprint(parse_action(reply1))   # ('get_coordinates', '{\"city\": \"北京\"}')\nprint(parse_action(reply2))   # None",
        "en": "import re\n\nTOOL_DESCRIPTIONS = '- get_coordinates: a city\\'s latitude and longitude. Action Input example: {\"city\": \"Beijing\"}\\n- get_weather: current temperature at a latitude/longitude. Action Input example: {\"latitude\": 39.9, \"longitude\": 116.4}'\n\n# 1. Write REACT_PROMPT in triple quotes: leave a tools placeholder, spell out the reply format and the rules\n\n\n# 2. Fill in TOOL_DESCRIPTIONS with .format() to get SYSTEM_PROMPT, and print it\n\n\n# 3. Define parse_action(text): return (tool name, argument string), or None if the format is wrong\n\n\n# 4. Test\nreply1 = 'Thought: Coordinates first.\\nAction: get_coordinates\\nAction Input: {\"city\": \"Beijing\"}'\nreply2 = \"Thought: let me think...\"\nprint(parse_action(reply1))   # ('get_coordinates', '{\"city\": \"Beijing\"}')\nprint(parse_action(reply2))   # None"
      },
      "solution": {
        "zh": "import re\n\nTOOL_DESCRIPTIONS = '- get_coordinates: 查询城市的经纬度。Action Input 示例：{\"city\": \"北京\"}\\n- get_weather: 根据经纬度查询当前气温。Action Input 示例：{\"latitude\": 39.9, \"longitude\": 116.4}'\n\n# 1. 用三引号写 REACT_PROMPT\nREACT_PROMPT = \"\"\"你是一个会使用工具的助手。请一步一步解决问题。\n\n可用的工具：\n{tools}\n\n需要调用工具时，按这个格式回复：\nThought: 你的想法\nAction: 工具名\nAction Input: JSON 格式的参数\n\n能回答时，按这个格式回复：\nThought: 我已经知道最终答案了\nFinal Answer: 最终回答\n\n每次只写一个 Action，写完 Action Input 就停下。不要自己写 Observation。\"\"\"\n\n# 2. 填进工具说明并打印\nSYSTEM_PROMPT = REACT_PROMPT.format(tools=TOOL_DESCRIPTIONS)\nprint(SYSTEM_PROMPT)\n\n# 3. 定义 parse_action(text)\ndef parse_action(text):\n    action = re.search(r\"Action:\\s*(\\w+)\", text)\n    action_input = re.search(r\"Action Input:\\s*(\\{.*\\})\", text, re.DOTALL)\n    if action is None or action_input is None:\n        return None\n    return action.group(1), action_input.group(1)\n\n# 4. 测试\nreply1 = 'Thought: 先查坐标。\\nAction: get_coordinates\\nAction Input: {\"city\": \"北京\"}'\nreply2 = \"Thought: 我再想想……\"\nprint(parse_action(reply1))   # ('get_coordinates', '{\"city\": \"北京\"}')\nprint(parse_action(reply2))   # None",
        "en": "import re\n\nTOOL_DESCRIPTIONS = '- get_coordinates: a city\\'s latitude and longitude. Action Input example: {\"city\": \"Beijing\"}\\n- get_weather: current temperature at a latitude/longitude. Action Input example: {\"latitude\": 39.9, \"longitude\": 116.4}'\n\n# 1. REACT_PROMPT in triple quotes\nREACT_PROMPT = \"\"\"You are an assistant that can use tools. Solve the problem step by step.\n\nAvailable tools:\n{tools}\n\nWhen you need a tool, reply in this format:\nThought: your thinking\nAction: the tool name\nAction Input: the arguments as JSON\n\nWhen you can answer, reply in this format:\nThought: I now know the final answer\nFinal Answer: the final answer\n\nWrite only one Action per reply and stop right after Action Input. Never write an Observation yourself.\"\"\"\n\n# 2. Fill in the tool descriptions and print\nSYSTEM_PROMPT = REACT_PROMPT.format(tools=TOOL_DESCRIPTIONS)\nprint(SYSTEM_PROMPT)\n\n# 3. Define parse_action(text)\ndef parse_action(text):\n    action = re.search(r\"Action:\\s*(\\w+)\", text)\n    action_input = re.search(r\"Action Input:\\s*(\\{.*\\})\", text, re.DOTALL)\n    if action is None or action_input is None:\n        return None\n    return action.group(1), action_input.group(1)\n\n# 4. Test\nreply1 = 'Thought: Coordinates first.\\nAction: get_coordinates\\nAction Input: {\"city\": \"Beijing\"}'\nreply2 = \"Thought: let me think...\"\nprint(parse_action(reply1))   # ('get_coordinates', '{\"city\": \"Beijing\"}')\nprint(parse_action(reply2))   # None"
      },
      "checks": [
        {
          "zh": "用三引号写了模板 `REACT_PROMPT`",
          "en": "`REACT_PROMPT` is written in triple quotes",
          "re": "REACT_PROMPT\\s*=\\s*\"\"\""
        },
        {
          "zh": "模板里留了 `{tools}` 占位符",
          "en": "The template has a `{tools}` placeholder",
          "re": "\\{tools\\}"
        },
        {
          "zh": "模板写了 `Final Answer` 格式，也提到了 `Observation`",
          "en": "The template gives the `Final Answer` format and mentions `Observation`",
          "re": "Final Answer[\\s\\S]*Observation|Observation[\\s\\S]*Final Answer"
        },
        {
          "zh": "用 `.format(tools=...)` 填进工具说明",
          "en": "Fills in the tools with `.format(tools=...)`",
          "re": "\\.format\\(\\s*tools\\s*="
        },
        {
          "zh": "定义了函数 `parse_action(text)`",
          "en": "Defines `parse_action(text)`",
          "re": "def\\s+parse_action\\s*\\(\\s*\\w+\\s*\\)\\s*:"
        },
        {
          "zh": "用 `re.search` 查找",
          "en": "Searches with `re.search`",
          "re": "re\\.search\\("
        },
        {
          "zh": "Action Input 的正则加了 `re.DOTALL`",
          "en": "The Action Input pattern uses `re.DOTALL`",
          "re": "re\\.DOTALL|re\\.S\\b"
        },
        {
          "zh": "没找到时 `return None`",
          "en": "`return None` when something is missing",
          "re": "return\\s+None"
        },
        {
          "zh": "用 `.group(1)` 取出分组",
          "en": "Uses `.group(1)` to pull out the groups",
          "re": "\\.group\\(1\\)"
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "循环里忘了 `current_iteration += 1`，或者干脆没有最大轮数：模型一直不给最终回答时，循环停不下来，一直在花钱。",
      "en": "Forgetting `current_iteration += 1`, or having no round limit at all: if the model never gives a final answer, the loop never stops and keeps costing money."
    },
    {
      "zh": "系统提示词没要求「先用工具查」：模型本来就知道答案时，可能跳过工具直接回答，看不到「思考 → 行动 → 观察」的过程。",
      "en": "No “look it up with the tool first” rule in the system prompt: when the model already knows the answer, it may skip the tool and answer directly, hiding the think → act → observe process."
    },
    {
      "zh": "模型一次请求了好几个工具（DeepSeek 实测会同时查篮球和排球），却每存一条结果就调用一次模型，API 报 400。要把所有 tool 结果都存完再调用（05 节）。",
      "en": "The model asks for several tools at once (DeepSeek looked up basketball and volleyball together in testing), but you call the model after each stored result – a 400 error. Store every tool result first, then call (lesson 05)."
    },
    {
      "zh": "工具字典写成 `\"get_game_info\": get_game_info()`：加了括号会立刻调用函数，存进去的不是函数本身。",
      "en": "Writing `\"get_game_info\": get_game_info()` in the dict: the parentheses call the function immediately, so the dict doesn't hold the function."
    },
    {
      "zh": "（文字版）提示词里没写「不要自己写 Observation」，调用时也没加 `stop`：有的模型会编出工具结果，给出一个看似合理、其实是瞎编的答案。",
      "en": "(Text version) No “never write the Observation” rule and no `stop`: some models invent a tool result and give a plausible but made-up answer."
    },
    {
      "zh": "（文字版）用 `.format()` 填模板时，模板本身的 JSON 示例没把花括号写成 `{{ }}`，报 `KeyError`。",
      "en": "(Text version) Filling a template with `.format()` while its own JSON example still uses single braces instead of `{{ }}` – `KeyError`."
    },
    {
      "zh": "（文字版）没检查 `None` 就写 `m.group(1)` 或 `name, args_text = parsed`，报 `AttributeError` 或 `TypeError`；JSON 跨了好几行，正则却没加 `re.DOTALL`，解析失败。",
      "en": "(Text version) Calling `m.group(1)` or `name, args_text = parsed` without checking for `None` – `AttributeError` or `TypeError`; JSON spread over several lines but no `re.DOTALL` – parsing fails."
    }
  ],
  "recap": [
    {
      "zh": "ReAct = 推理 + 行动：Thought → Action → Action Input → Observation，重复，直到 Final Answer。",
      "en": "ReAct = reasoning + acting: Thought → Action → Action Input → Observation, repeated until a Final Answer."
    },
    {
      "zh": "视频的四步：工具（模拟数据库 + JSON Schema）→ ReAct 系统提示词（思考 → 行动 → 观察 → 回答，不求一次出结果）→ 对话记录（第一条是 system）+ 调用模型的函数 → 最多 5 轮的循环。",
      "en": "The video's four steps: the tool (a simulated database + JSON Schema) → the ReAct system prompt (think → act → observe → answer, no one-shot answers) → the history (system prompt first) + a model-calling function → a loop of at most 5 rounds."
    },
    {
      "zh": "让模型写出思考有用：写出的内容会成为后续生成的输入（思维链），所以更准、幻觉更少。",
      "en": "Writing the thinking out helps: what the model writes becomes input for what comes next (chain of thought), so it is more accurate and hallucinates less."
    },
    {
      "zh": "模型只写文字；Observation 由你的代码执行工具后写入，绝不能让模型自己编。",
      "en": "The model only writes text; your code writes the Observation after running the tool – never let the model invent it."
    },
    {
      "zh": "循环：`ask_model()` → 打印思考 → 没有 `tool_calls` 就返回最终回答（什么时候结束由模型决定）→ 否则执行每个工具、存 `tool` 消息 → 计数器 `+= 1`。最多 `max_iterations` 轮，防止死循环，或在错误的路上越走越远。",
      "en": "The loop: `ask_model()` → print the thought → no `tool_calls` means return the final answer (the model decides when to finish) → otherwise run every tool and store `tool` messages → counter `+= 1`. At most `max_iterations` rounds, so it can't loop forever or keep going down a wrong path."
    },
    {
      "zh": "执行：`TOOLS[name](**json.loads(arguments))`，用 try/except 把错误变成 Observation。",
      "en": "Running: `TOOLS[name](**json.loads(arguments))`, with try/except turning errors into Observations."
    },
    {
      "zh": "自我反思也能放进同一个循环：先做出结果 → 检查哪里不对 → 调整后重做。",
      "en": "Self-reflection fits the same loop: produce a result → check what is wrong → adjust and redo."
    },
    {
      "zh": "（拓展）纯文字版：三引号 + `.format()` 写提示词模板（字面花括号写成 `{{ }}`）；`re.search` + `group(1)` 解析 Action / Action Input，先检查 `None`；`stop=[\"Observation:\"]` 防止模型编结果。",
      "en": "(Extension) Text-only: triple quotes + `.format()` for the template (literal braces become `{{ }}`); `re.search` + `group(1)` parse Action / Action Input – check for `None` first; `stop=[\"Observation:\"]` keeps the model from inventing results."
    },
    {
      "zh": "两种写法跑的是同一个循环，区别只是工具说明和调用请求走结构化的 `tools` / `tool_calls`，还是写在文字里。",
      "en": "Both approaches run the same loop; the only difference is whether tool descriptions and call requests travel as structured `tools` / `tool_calls` or as text."
    }
  ],
  "files": [
    {
      "path": "practice/l07_react_agent_todo.py",
      "zh": "练习：补全工具说明、ReAct 系统提示词、`run_tool` 和最多 5 轮的 Agent 循环（有 TODO 提示），连接真实模型运行。",
      "en": "Exercise: complete the tool description, the ReAct system prompt, `run_tool` and the 5-round agent loop (with TODO hints), then run it against the real model."
    },
    {
      "path": "practice/l07_react_agent_solution.py",
      "zh": "参考答案：视频里的 ReAct Agent——查篮球和排球的上场人数，再算出乘积。",
      "en": "Solution: the video's ReAct agent – look up how many basketball and volleyball players are on court, then multiply."
    },
    {
      "path": "practice/l07_text_react_todo.py",
      "zh": "拓展练习：补全纯文字版 ReAct 的工具字典、提示词模板、`parse_action`、`run_tool` 和循环（有 TODO 提示）。",
      "en": "Extension exercise: complete the text-only ReAct's tool dict, prompt template, `parse_action`, `run_tool` and loop (with TODO hints)."
    },
    {
      "path": "practice/l07_text_react_solution.py",
      "zh": "拓展参考答案：纯文字版 ReAct Agent，先查经纬度、再查气温，最后给出答案。",
      "en": "Extension solution: the text-only ReAct agent – coordinates, then temperature, then the answer."
    }
  ]
});
