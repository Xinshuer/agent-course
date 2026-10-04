COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l12",
  "priority": "core",
  "handwrite": true,
  "studyMinutes": 75,
  "source": "subtitle",
  "summary": {
    "zh": "标题叫「框架的用法和实战案例」，内容其实是**多个 Agent 怎么配合（编排）**。先认识六种编排方式，再用 OpenAI Agents SDK 写出视频演示的三种：**顺序**（上一个的答案交给下一个）、**并行**（`asyncio.gather` 让三个 Agent 同时回答）、**路由/交接**（前台 Agent 用 `handoffs` 把问题转给合适的 Agent，并用流式事件看清交接过程）。最后做视频的压轴例子：四个只会一种运算的 Agent，在调度 Agent 的安排下把 5 变成 23。Python 小课堂：pydantic 补充（默认值、`Field`、JSON Schema）。",
    "en": "The title says “Framework Usage: A Hands-on Case”, but the episode is really about **orchestrating several agents**. You meet six orchestration patterns, then write the three the video demonstrates with the OpenAI Agents SDK: **sequential** (one agent's answer feeds the next), **parallel** (`asyncio.gather` runs three agents at once) and **routing / handoffs** (a front-desk agent uses `handoffs` to pass the question on, and stream events show the handoff). The finale is the video's example: four agents that each know one arithmetic step turn 5 into 23 under a planner agent. Python mini-lesson: more pydantic (defaults, `Field`, the JSON Schema)."
  },
  "goals": [
    {
      "zh": "说出六种编排方式（顺序、并行、路由/交接、Agent 当工具、监督、护栏）各靠什么实现、适合什么场景",
      "en": "Name the six orchestration patterns (sequential, parallel, routing/handoffs, agents as tools, supervision, guardrails), what each relies on and when to use it"
    },
    {
      "zh": "用两次 `Runner.run` 写出顺序编排，把 `final_output` 交给下一个 Agent",
      "en": "Write sequential orchestration with two `Runner.run` calls, passing `final_output` to the next agent"
    },
    {
      "zh": "用 `asyncio.gather` 让几个 Agent 同时运行，并用 `time.time()` 比较用时",
      "en": "Run several agents at once with `asyncio.gather` and compare the timing with `time.time()`"
    },
    {
      "zh": "用 `handoffs=[...]` + `handoff_description` 写一个前台交接 Agent，并用 `run_streamed` 的事件看清交接过程",
      "en": "Write a front-desk agent with `handoffs=[...]` + `handoff_description`, and watch the handoff through `run_streamed` events"
    },
    {
      "zh": "说清交接的原理：交接就是一次名为 `transfer_to_<name>` 的工具调用，所以 Agent 的 name 只能用英文字母、数字和下划线",
      "en": "Explain how a handoff works: it is a tool call named `transfer_to_<name>`, which is why agent names must use only letters, digits and underscores"
    },
    {
      "zh": "用 pydantic 的默认值、`Field` 和 `model_json_schema()` 规定评审结论的格式，再用 `model_validate_json` 校验模型返回的 JSON",
      "en": "Define the verdict's format with pydantic defaults, `Field` and `model_json_schema()`, then validate the model's JSON with `model_validate_json`"
    },
    {
      "zh": "写出「调度 Agent + 多个能力有限的 Agent」的循环：设最大轮数、检测换了谁、收到结束信号就停",
      "en": "Write the planner-plus-limited-agents loop: a round limit, detecting who took over, and stopping on an end signal"
    }
  ],
  "blocks": [
    {
      "t": "video",
      "zh": "这一集接着上一集讲 OpenAI Agents SDK，主题是**多 Agent 的编排**。老师先花 3 分钟把常见的编排方式过一遍，然后写代码演示其中三种：顺序、并行、路由（交接）；最后打开一个准备好的例子，四个能力有限的 Agent 在调度 Agent 的安排下把一个数字变成目标数字。\n\n字幕里没有说这一集用的是哪个模型（上一集他提到用的是谷歌的模型），演示途中因为报错在设置文件里换过一次模型。讲义统一用 DeepSeek（`practice/llm.py`），代码写法和视频一样。",
      "en": "This episode continues with the OpenAI Agents SDK and is about **orchestrating several agents**. The instructor spends three minutes surveying the common patterns, codes three of them live – sequential, parallel and routing (handoffs) – and finally opens a prepared example in which four limited agents, directed by a planner agent, turn one number into a target number.\n\nThe subtitles never say which model this episode uses (in the previous episode he mentioned a Google model), and he switches models in his settings file once after an error. These notes use DeepSeek throughout (`practice/llm.py`); the code is written the same way as in the video."
    },
    {
      "t": "tip",
      "zh": "本节的框架代码（`from agents import ...`）要在本地运行：打开 `practice`，用 `.venv` 的 Python 运行练习文件。顺序、并行、交接三段都在 `l12_orchestration_solution.py` 里，数字变换的例子在 `l12_number_game_solution.py`。网页里带 ▶ 按钮的只是纯 Python 的小例子。",
      "en": "The framework code in this lesson (`from agents import ...`) runs locally: open `practice` and run the practice files with the `.venv` Python. Sequential, parallel and handoffs are all in `l12_orchestration_solution.py`; the number example is `l12_number_game_solution.py`. Only the small pure-Python examples have a ▶ button here."
    },
    {
      "t": "h",
      "zh": "一、几种编排方式：先有个全局印象",
      "en": "1. The orchestration patterns at a glance"
    },
    {
      "t": "p",
      "zh": "[▶ 00:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=2) 只要有两个以上的 Agent，就要决定它们怎么配合。视频开头列了六种方式：\n\n| 方式 | 怎么配合 | 靠什么实现 | 适合 |\n|---|---|---|---|\n| 顺序 | 按代码的先后一个接一个运行，上一个的结果交给下一个 | Python 本身：代码从上往下执行 | 后一步要用前一步的结果 |\n| 并行 | 几个 Agent 同时运行 | Python 的 `asyncio` | 彼此不依赖，想省时间 |\n| 路由（交接） | 由模型判断问题该交给哪个 Agent | 大模型的理解和选择 | 按语言、按业务分派问题 |\n| Agent 当工具 | 把一个 Agent 包装成工具，交给另一个 Agent 调用 | 工具调用 | 把子任务委托出去，结果拿回来自己汇总 |\n| 监督 | 一个 Agent 评价另一个的结果并给反馈，推动它改进 | 循环调用 | 对质量要求高的输出 |\n| 护栏 | 不等结果生成完，在旁边同时检查，发现问题马上叫停 | 和主任务并行运行的检查 | 拦截不该处理的输入或输出 |\n\n[▶ 01:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=64) 老师特别强调：前两种只是用了编程语言自带的能力；**路由是编程语言做不到的**，必须借助大模型去理解问题、做出选择，框架里管这个叫「交接」（handoff）。[▶ 02:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=126) 监督要等上一个 Agent 交出结果才能评价；[▶ 02:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=157) 护栏则是边生成边检查，它本质上也是一个 Agent，只是和主任务并行运行。",
      "en": "[▶ 00:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=2) As soon as you have two or more agents, you must decide how they work together. The video opens with six patterns:\n\n| Pattern | How they cooperate | What it relies on | Good for |\n|---|---|---|---|\n| Sequential | run one after another in code order; each result feeds the next | plain Python: code runs top to bottom | a step that needs the previous step's result |\n| Parallel | several agents run at the same time | Python's `asyncio` | independent jobs, to save time |\n| Routing (handoffs) | the model decides which agent should take the question | the LLM's understanding and choice | dispatching by language or by topic |\n| Agent as a tool | one agent is wrapped as a tool that another agent calls | tool calls | delegating a subtask and combining the result yourself |\n| Supervision | one agent judges another's result and gives feedback to improve it | a loop of calls | output where quality matters |\n| Guardrails | checks run alongside generation and stop it as soon as something is wrong | a check running in parallel with the main task | blocking inputs or outputs you shouldn't handle |\n\n[▶ 01:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=64) The instructor stresses that the first two only use features of the programming language, while **routing is something code alone can't do**: it needs the LLM to understand the question and choose – the framework calls this a “handoff”. [▶ 02:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=126) Supervision has to wait for the previous agent's result before judging it; [▶ 02:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=157) guardrails check while the output is being generated – technically another agent, running in parallel with the main task."
    },
    {
      "t": "check",
      "q": {
        "zh": "下面哪种编排方式**必须**借助大模型来做决定？",
        "en": "Which pattern **must** rely on the LLM to make the decision?"
      },
      "options": [
        {
          "zh": "顺序：A 跑完再跑 B",
          "en": "Sequential: run A, then B"
        },
        {
          "zh": "并行：用 `asyncio.gather` 同时跑三个",
          "en": "Parallel: run three at once with `asyncio.gather`"
        },
        {
          "zh": "路由（交接）：判断问题该交给哪个 Agent",
          "en": "Routing (handoffs): deciding which agent should take the question"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "顺序和并行用 Python 自身的能力就能做到；「这个问题该交给谁」需要理解问题内容，只能靠大模型判断。",
        "en": "Sequential and parallel need nothing beyond Python itself; “who should take this question” requires understanding it, which only the LLM can do."
      }
    },
    {
      "t": "h",
      "zh": "二、顺序：上一个的答案就是下一个的问题",
      "en": "2. Sequential: one agent's answer is the next one's question"
    },
    {
      "t": "p",
      "zh": "[▶ 03:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=220) 老师先建了两个 Agent：A 用中文回答用户的问题；B 不直接面对用户，它负责对 A 的答案做扩展和补充。他用讲题来打比方：先要有答案，再有讲解——一个负责找答案，一个负责讲清楚。[▶ 05:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=315) 用的问题是「太阳绕着地球转，还是地球绕着太阳转」。",
      "en": "[▶ 03:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=220) The instructor first builds two agents: A answers the user's question in Chinese; B never sees the user – it expands on A's answer. His analogy is a teacher going over an exercise: first you need the answer, then the explanation – one agent finds the answer, the other makes it clear. [▶ 05:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=315) The question is “Does the Sun go round the Earth, or the Earth round the Sun?”"
    },
    {
      "t": "code",
      "file": "sequential.py",
      "code": {
        "zh": "import asyncio\nfrom agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nmodel = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)\nQUESTION = \"太阳绕着地球转，还是地球绕着太阳转？\"\n\nanswer_agent = Agent(name=\"answer_agent\", model=model,\n                     instructions=\"用中文简短回答用户的问题，不超过两句话。\")\nexplain_agent = Agent(name=\"explain_agent\", model=model,\n                      instructions=\"你会收到一个问题的答案。请对这个答案做扩展和补充说明，让中学生也能看懂。\")\n\nasync def main():\n    r1 = await Runner.run(answer_agent, QUESTION)          # 第一棒：回答用户的问题\n    print(\"A:\", r1.final_output)\n    r2 = await Runner.run(explain_agent, r1.final_output)  # 第二棒：输入是 A 的答案\n    print(\"B:\", r2.final_output)\n\nasyncio.run(main())",
        "en": "import asyncio\nfrom agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nmodel = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)\nQUESTION = \"Does the Sun go round the Earth, or the Earth round the Sun?\"\n\nanswer_agent = Agent(name=\"answer_agent\", model=model,\n                     instructions=\"Answer the user's question briefly, in at most two sentences.\")\nexplain_agent = Agent(name=\"explain_agent\", model=model,\n                      instructions=\"You receive the answer to a question. Expand on it so a middle-school student can follow.\")\n\nasync def main():\n    r1 = await Runner.run(answer_agent, QUESTION)          # leg 1: answer the user's question\n    print(\"A:\", r1.final_output)\n    r2 = await Runner.run(explain_agent, r1.final_output)  # leg 2: its input is A's answer\n    print(\"B:\", r2.final_output)\n\nasyncio.run(main())"
      }
    },
    {
      "t": "p",
      "zh": "要点：\n- 第二次 `Runner.run` 的输入不是用户的问题，而是 `r1.final_output`。两个 Agent 的关系就体现在这一行。\n- 顺序完全由代码决定，B 必须等 A 跑完才能开始。\n- 想再加一步（比如让第三个 Agent 划重点、做总结），就在后面再接一次 `Runner.run`，原理一样。",
      "en": "Key points:\n- The input of the second `Runner.run` is not the user's question but `r1.final_output` – that one line is the relationship between the two agents.\n- The order is fixed by your code; B can't start until A is done.\n- To add a step (say a third agent that picks out the key points and writes a summary), chain one more `Runner.run`; the idea is the same."
    },
    {
      "t": "video",
      "zh": "[▶ 06:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=379) 第一次运行时报错了，老师说是模型的问题，到设置文件里换了个模型再运行就好了。你如果遇到报错，先看错误信息里的状态码：401 多半是 key 不对，400/404 先检查 `practice/llm.py` 里的模型名（DeepSeek 只有 `deepseek-flash` 和 `deepseek-v4-pro`）。",
      "en": "[▶ 06:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=379) The first run fails; the instructor blames the model, switches to another one in his settings file and reruns successfully. If you hit an error, look at the status code first: 401 usually means a wrong key; for 400/404 check the model name in `practice/llm.py` (DeepSeek offers only `deepseek-flash` and `deepseek-v4-pro`)."
    },
    {
      "t": "h",
      "zh": "三、并行：几个 Agent 同时干活",
      "en": "3. Parallel: several agents at once"
    },
    {
      "t": "p",
      "zh": "[▶ 07:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=441) 什么时候用并行？视频举了两种情况：\n1. 想多要几个结果再挑最好的。一个一个生成太费时间，就同时生成。\n2. 本来就需要几个不同的结果。比如同一句话要中文、英文、韩文三个版本，它们之间没有依赖，谁也不用等谁。\n\n[▶ 07:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=472) 演示用的是第二种：三个 Agent 分别只用中文、英文、韩语回答同一个问题。代码里要有三次 `Runner.run`，问题放进一个变量里共用。老师先按顺序跑一遍，[▶ 12:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=760) 用 `time` 在前后各记一次时间（T1、T2），三个回答大约用了 2.5 秒；[▶ 13:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=821) 然后只改一处：把三个调用放进 `asyncio.gather`，前面加 `await`，结果拆成三个变量。再跑，一秒多一点就完成了。",
      "en": "[▶ 07:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=441) When is parallel useful? The video gives two cases:\n1. You want several results to pick the best one; generating them one by one is too slow, so generate them together.\n2. You genuinely need several different results – e.g. the same sentence in Chinese, English and Korean. None of them depends on another, so nobody has to wait.\n\n[▶ 07:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=472) The demo is the second case: three agents answer the same question, one only in Chinese, one only in English, one only in Korean. That means three `Runner.run` calls, with the question kept in a shared variable. He first runs them in order and, [▶ 12:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=760) timing with `time` before and after (T1, T2), gets about 2.5 seconds for the three answers; [▶ 13:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=821) then changes just one thing: put the three calls into `asyncio.gather`, add `await` in front and unpack the results into three variables. The rerun finishes in just over a second."
    },
    {
      "t": "code",
      "file": "parallel.py",
      "code": {
        "zh": "# 接着 sequential.py：import、model 和 QUESTION 已经写好\nimport time\n\nchinese_agent = Agent(name=\"chinese_agent\", model=model,\n                      instructions=\"Answer ONLY in Chinese, in one or two sentences.\")\nenglish_agent = Agent(name=\"english_agent\", model=model,\n                      instructions=\"Answer ONLY in English, in one or two sentences.\")\nkorean_agent = Agent(name=\"korean_agent\", model=model,\n                     instructions=\"Answer ONLY in Korean, in one or two sentences.\")\n\nasync def main():\n    # 写法 1：一个接一个\n    t1 = time.time()                          # 记下开始的时刻（秒）\n    r1 = await Runner.run(chinese_agent, QUESTION)\n    r2 = await Runner.run(english_agent, QUESTION)\n    r3 = await Runner.run(korean_agent, QUESTION)\n    t2 = time.time()\n    print(f\"一个接一个：{t2 - t1:.1f} 秒\")\n\n    # 写法 2：同时运行——只改了这一处\n    t1 = time.time()\n    r1, r2, r3 = await asyncio.gather(        # 三个协程一起交给事件循环\n        Runner.run(chinese_agent, QUESTION),\n        Runner.run(english_agent, QUESTION),\n        Runner.run(korean_agent, QUESTION),\n    )\n    t2 = time.time()\n    print(f\"同时运行：{t2 - t1:.1f} 秒\")\n    print(r1.final_output, r2.final_output, r3.final_output, sep=\"\\n\")",
        "en": "# continues sequential.py: imports, model and QUESTION are already there\nimport time\n\nchinese_agent = Agent(name=\"chinese_agent\", model=model,\n                      instructions=\"Answer ONLY in Chinese, in one or two sentences.\")\nenglish_agent = Agent(name=\"english_agent\", model=model,\n                      instructions=\"Answer ONLY in English, in one or two sentences.\")\nkorean_agent = Agent(name=\"korean_agent\", model=model,\n                     instructions=\"Answer ONLY in Korean, in one or two sentences.\")\n\nasync def main():\n    # version 1: one after another\n    t1 = time.time()                          # the start time, in seconds\n    r1 = await Runner.run(chinese_agent, QUESTION)\n    r2 = await Runner.run(english_agent, QUESTION)\n    r3 = await Runner.run(korean_agent, QUESTION)\n    t2 = time.time()\n    print(f\"one by one: {t2 - t1:.1f} s\")\n\n    # version 2: all at once - only this part changes\n    t1 = time.time()\n    r1, r2, r3 = await asyncio.gather(        # hand all three coroutines to the event loop\n        Runner.run(chinese_agent, QUESTION),\n        Runner.run(english_agent, QUESTION),\n        Runner.run(korean_agent, QUESTION),\n    )\n    t2 = time.time()\n    print(f\"all at once: {t2 - t1:.1f} s\")\n    print(r1.final_output, r2.final_output, r3.final_output, sep=\"\\n\")"
      },
      "note": {
        "zh": "`asyncio.gather` 的用法见第 09 节的 Python 小课堂（参数是一个个协程，结果按传入顺序返回）；`r1, r2, r3 = ...` 是第 07 节的元组拆包。`time.time()` 返回当前时刻（单位是秒），两次相减就是用时；第 09 节用的 `time.perf_counter()` 专门用来计时，换成它也一样。",
        "en": "For `asyncio.gather` see the Python mini-lesson in lesson 09 (its arguments are the coroutines, one by one, and the results come back in the order they were passed); `r1, r2, r3 = ...` is the tuple unpacking from lesson 07. `time.time()` returns the current moment in seconds, so the difference of two readings is the elapsed time; `time.perf_counter()`, used in lesson 09, is made for timing and works just as well."
      }
    },
    {
      "t": "note",
      "zh": "[▶ 09:56](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=596) 视频里还有一段小插曲：三个 Agent 的系统提示分别写了只用中文、英文、韩语回答，模型却常常跟着用户提问的语言（中文）回答。老师把系统提示改成英文、改措辞，效果都不稳定，最后说这可能是模型本身更偏向用用户的语言回答，换个模型可以解决。讲义把语言要求直接写成英文的 `Answer ONLY in ...`，用 DeepSeek 实测：韩语 Agent 收到中文问题，也按要求用韩语回答了。如果你运行时遇到不听系统提示的情况，可以把要求写得更具体，或者换成 `deepseek-v4-pro` 试试。",
      "en": "[▶ 09:56](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=596) A side story in the video: the three system prompts say to answer only in Chinese, English or Korean, yet the model often answers in the language of the question (Chinese). The instructor rewrites the prompts in English and rephrases them, with mixed results, and concludes that the model probably prefers the user's language and that another model would fix it. The notes write the requirement as an English `Answer ONLY in ...`; in our DeepSeek test, the Korean agent answered a Chinese question in Korean as instructed. If your run ever ignores the system prompt, make the requirement more explicit or try `deepseek-v4-pro`."
    },
    {
      "t": "check",
      "q": {
        "zh": "三个 Agent 单独运行分别要 1 秒、1.2 秒、0.8 秒。用 `asyncio.gather` 一起运行，大约要多久？",
        "en": "Three agents take 1 s, 1.2 s and 0.8 s on their own. Run together with `asyncio.gather`, about how long does it take?"
      },
      "options": [
        {
          "zh": "约 1.2 秒，和最慢的那个差不多",
          "en": "About 1.2 s – roughly the slowest one"
        },
        {
          "zh": "约 3 秒，三个时间加起来",
          "en": "About 3 s – the sum of the three"
        },
        {
          "zh": "约 0.8 秒，和最快的那个一样",
          "en": "About 0.8 s – the fastest one"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "三个请求同时在等模型回复，总时间由最慢的那个决定；一个接一个才是相加。",
        "en": "All three requests wait for the model at the same time, so the slowest one sets the total; only one-by-one adds them up."
      }
    },
    {
      "t": "h",
      "zh": "四、路由（交接）：让模型决定交给谁",
      "en": "4. Routing (handoffs): let the model choose who answers"
    },
    {
      "t": "p",
      "zh": "[▶ 15:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=950) 老师说这是最重要的一种，因为它不是 Python 语法能提供的，而是借助大模型完成的。[▶ 16:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=985) 还是那三个分别用中文、英文、韩语回答的 Agent，但用户的问题不再直接发给它们，而是发给新建的第四个 Agent——**前台助手**。前台的职责写在系统提示里：自己不回答问题，只负责把问题交给合适的 Agent。[▶ 18:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=1080) 前台怎么知道有哪些 Agent 可以交？在创建它的时候传一个参数 `handoffs`，把三个 Agent 放进去。",
      "en": "[▶ 15:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=950) The instructor calls this the most important pattern, because Python syntax can't provide it – it is done by the LLM. [▶ 16:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=985) The same three agents (Chinese, English, Korean) stay, but the user's question no longer goes to them directly; it goes to a new fourth agent, the **front desk**. Its job, stated in its system prompt: don't answer questions, just hand each one to a suitable agent. [▶ 18:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=1080) How does the front desk know who it can hand over to? You pass them in a parameter, `handoffs`, when creating it."
    },
    {
      "t": "code",
      "file": "handoff.py",
      "code": {
        "zh": "# 接着上面的代码：import、model 和 QUESTION 已经写好\nchinese_agent = Agent(\n    name=\"chinese_agent\",                       # 只用英文字母、数字、下划线\n    handoff_description=\"只用中文回答问题\",      # 告诉前台：我擅长什么\n    instructions=\"Answer ONLY in Chinese, in one or two sentences.\",\n    model=model,\n)\nenglish_agent = Agent(name=\"english_agent\", handoff_description=\"Answers ONLY in English\",\n                      instructions=\"Answer ONLY in English, in one or two sentences.\", model=model)\nkorean_agent = Agent(name=\"korean_agent\", handoff_description=\"只用韩语回答问题\",\n                     instructions=\"Answer ONLY in Korean, in one or two sentences.\", model=model)\n\nfront_desk = Agent(\n    name=\"front_desk\",\n    instructions=\"你是前台助手。你自己不回答任何问题，而是根据用户使用的语言，把问题交接给合适的 Agent。\",\n    model=model,\n    handoffs=[chinese_agent, english_agent, korean_agent],   # 可以交接给谁\n)\n\nasync def main():\n    result = await Runner.run(front_desk, QUESTION)   # 问题永远先发给前台\n    print(\"最后回答的是:\", result.last_agent.name)\n    print(result.final_output)",
        "en": "# continues the code above: imports, model and QUESTION are already there\nchinese_agent = Agent(\n    name=\"chinese_agent\",                       # letters, digits and underscores only\n    handoff_description=\"Answers ONLY in Chinese\",   # tells the front desk what I'm good at\n    instructions=\"Answer ONLY in Chinese, in one or two sentences.\",\n    model=model,\n)\nenglish_agent = Agent(name=\"english_agent\", handoff_description=\"Answers ONLY in English\",\n                      instructions=\"Answer ONLY in English, in one or two sentences.\", model=model)\nkorean_agent = Agent(name=\"korean_agent\", handoff_description=\"Answers ONLY in Korean\",\n                     instructions=\"Answer ONLY in Korean, in one or two sentences.\", model=model)\n\nfront_desk = Agent(\n    name=\"front_desk\",\n    instructions=\"You are the front desk. Never answer questions yourself; hand each one to the agent that matches the user's language.\",\n    model=model,\n    handoffs=[chinese_agent, english_agent, korean_agent],   # who it may hand over to\n)\n\nasync def main():\n    result = await Runner.run(front_desk, QUESTION)   # every question goes to the front desk first\n    print(\"Answered by:\", result.last_agent.name)\n    print(result.final_output)"
      }
    },
    {
      "t": "p",
      "zh": "这里每个语言 Agent 都多了一个 `handoff_description`，它是交接的关键，下面会讲视频里不写它时出了什么问题。运行时发生了这些事：\n1. SDK 把 `handoffs` 里的每个 Agent 变成前台模型能看到的一个**工具**，名字是 `transfer_to_` 加上 Agent 的 `name`，说明里带上它的 `handoff_description`。\n2. 前台的模型读完问题，决定调用 `transfer_to_chinese_agent`。\n3. SDK 把**当前 Agent 换成** `chinese_agent`，带着到目前为止的对话继续运行，由它**直接回答用户**。\n4. 运行结束后，`result.last_agent` 就是最后回答的那个 Agent。",
      "en": "Each language agent now has a `handoff_description` – the key to handoffs; below you'll see what went wrong in the video without it. During the run:\n1. The SDK turns each agent in `handoffs` into a **tool** the front desk's model can see, named `transfer_to_` plus the agent's `name`, with its `handoff_description` in the tool description.\n2. The front desk's model reads the question and decides to call `transfer_to_chinese_agent`.\n3. The SDK **switches the current agent** to `chinese_agent` and carries on with the conversation so far; that agent **answers the user directly**.\n4. After the run, `result.last_agent` is the agent that gave the final answer."
    },
    {
      "t": "p",
      "zh": "[▶ 18:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=1112) 视频里第一次运行，用中文提问却得到了一段韩语回答。到底是交接错了，还是接手的 Agent 答错了？只看最后结果分不出来。[▶ 19:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=1179) 老师的办法是改成流式运行（第 09 节学过），用 `async for` 把运行过程中的每个事件都打印出来，一行行地找。下面只挑和交接有关的事件打印：",
      "en": "[▶ 18:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=1112) On the first run in the video, a Chinese question gets an answer in Korean. Was it handed to the wrong agent, or did the right agent answer wrongly? The final result alone can't tell you. [▶ 19:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=1179) The instructor switches to a streamed run (lesson 09) and prints every event with `async for`, combing through them line by line. Below we print only the events about the handoff:"
    },
    {
      "t": "code",
      "file": "route_events.py",
      "code": {
        "zh": "async def run_route(question):\n    result = Runner.run_streamed(front_desk, question)       # 不要 await（第 09 节）\n    async for event in result.stream_events():               # 一边运行，一边看发生了什么\n        if event.type == \"agent_updated_stream_event\":       # 换了一个 Agent 在干活\n            print(\"[当前 Agent]\", event.new_agent.name)\n        elif event.type == \"run_item_stream_event\":\n            if event.name == \"handoff_requested\":            # 模型发出了「交接」工具调用\n                print(\"[请求交接] 调用工具\", event.item.raw_item.name)\n            elif event.name == \"handoff_occured\":            # SDK 里就是这么拼的（少一个 r）\n                print(\"[交接完成]\", event.item.source_agent.name, \"->\", event.item.target_agent.name)\n    print(\"最后回答的是:\", result.last_agent.name)\n    print(\"回答:\", result.final_output)",
        "en": "async def run_route(question):\n    result = Runner.run_streamed(front_desk, question)       # no await (lesson 09)\n    async for event in result.stream_events():               # watch what happens while it runs\n        if event.type == \"agent_updated_stream_event\":       # a different agent is now working\n            print(\"[agent]\", event.new_agent.name)\n        elif event.type == \"run_item_stream_event\":\n            if event.name == \"handoff_requested\":            # the model issued the \"handoff\" tool call\n                print(\"[handoff call]\", event.item.raw_item.name)\n            elif event.name == \"handoff_occured\":            # the SDK really spells it this way (missing an r)\n                print(\"[handed off]\", event.item.source_agent.name, \"->\", event.item.target_agent.name)\n    print(\"Answered by:\", result.last_agent.name)\n    print(\"Answer:\", result.final_output)"
      }
    },
    {
      "t": "code",
      "file": {
        "zh": "运行结果（真实 DeepSeek）",
        "en": "output (real DeepSeek run)"
      },
      "lang": "text",
      "code": {
        "zh": "问题 / question: 太阳绕着地球转，还是地球绕着太阳转？\n  [当前 Agent / agent] front_desk\n  [请求交接 / handoff call] transfer_to_chinese_agent\n  [交接完成 / handed off] front_desk -> chinese_agent\n  [当前 Agent / agent] chinese_agent\n最后回答的 / answered by: chinese_agent\n回答 / answer: 地球绕着太阳转。更准确地说，地球和太阳都绕共同质心运动，但由于太阳质量远大于地球，质心在太阳内部附近，所以通常近似说地球绕太阳转。",
        "en": "question: 太阳绕着地球转，还是地球绕着太阳转？\n  [agent] front_desk\n  [handoff call] transfer_to_chinese_agent\n  [handed off] front_desk -> chinese_agent\n  [agent] chinese_agent\nanswered by: chinese_agent\nanswer: 地球绕着太阳转。更准确地说，地球和太阳都绕共同质心运动，但由于太阳质量远大于地球，质心在太阳内部附近，所以通常近似说地球绕太阳转。"
      }
    },
    {
      "t": "p",
      "zh": "[▶ 20:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=1241) 老师在事件里找到了那次工具调用，发现工具名是 `transfer_to_` 后面跟着一串下划线，Agent 的名字不见了。原因是他给 Agent 起的是**中文名**：工具名只允许英文字母、数字和下划线，其他字符都会被换成 `_`。他的几个 Agent 换完以后成了同一个工具名，彼此分不开了；老师当时也看出来了：名字撞在一起，排在后面的就把前面的顶替掉了。本课程装的 SDK 0.20.0 正是这样：交接对象按工具名查找，重名时只认列表里**最后一个**——不管模型想交给谁，最后都落到排在最后的韩语 Agent 身上。这很可能就是视频里第一次得到韩语回答的原因。下面这段模拟了改名规则：",
      "en": "[▶ 20:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=1241) Searching the events, the instructor finds the tool call and sees that its name is `transfer_to_` followed by a run of underscores – the agent's name is gone. The cause: he had given the agents **Chinese names**. Tool names allow only letters, digits and underscores, and every other character becomes `_`. After that, his agents all ended up with the same tool name and could no longer be told apart; the instructor spotted it at the time too: the names collided, and the later one replaced the earlier one. That is exactly how SDK 0.20.0 (the version installed for this course) behaves: the handoff target is looked up by tool name, and with duplicate names only the **last** one in the list counts – whoever the model meant, the question lands with the Korean agent at the end of the list. That is very likely why the first run in the video answered in Korean. This snippet mimics the renaming rule:"
    },
    {
      "t": "code",
      "file": "tool_name_rule.py",
      "run": true,
      "code": {
        "zh": "import re\n\ndef tool_name(agent_name):\n    # SDK 生成交接工具名的规则（简化版）：不是字母、数字、下划线的字符都换成 _，再转小写\n    name = \"transfer_to_\" + agent_name\n    return re.sub(r\"[^a-zA-Z0-9_]\", \"_\", name).lower()\n\nfor n in [\"中文助手\", \"英文助手\", \"韩语助手\", \"A\", \"chinese_agent\"]:\n    print(f\"{n} -> {tool_name(n)}\")",
        "en": "import re\n\ndef tool_name(agent_name):\n    # how the SDK names a handoff tool (simplified): anything that isn't a letter,\n    # digit or underscore becomes _, then everything is lower-cased\n    name = \"transfer_to_\" + agent_name\n    return re.sub(r\"[^a-zA-Z0-9_]\", \"_\", name).lower()\n\nfor n in [\"中文助手\", \"英文助手\", \"韩语助手\", \"A\", \"chinese_agent\"]:\n    print(f\"{n} -> {tool_name(n)}\")"
      },
      "note": {
        "zh": "`re.sub(模式, 替换成, 文本)` 把匹配到的部分都替换掉（正则见第 07 节）；`[^a-zA-Z0-9_]` 表示「不是字母、数字、下划线的任意一个字符」。SDK 遇到这种情况还会打印一条警告，提醒你改名。",
        "en": "`re.sub(pattern, replacement, text)` replaces every match (regular expressions: lesson 07); `[^a-zA-Z0-9_]` means “any character that is not a letter, digit or underscore”. The SDK also logs a warning telling you to rename."
      }
    },
    {
      "t": "warn",
      "zh": "Agent 的 `name` 只用英文字母、数字和下划线（老师改成了 A、B、C，讲义用 `chinese_agent` 这样更好懂的名字）。中文的说明写在 `instructions` 和 `handoff_description` 里。",
      "en": "Use only letters, digits and underscores in an agent's `name` (the instructor renamed them A, B and C; the notes use clearer names like `chinese_agent`). Put Chinese text in `instructions` and `handoff_description`."
    },
    {
      "t": "p",
      "zh": "[▶ 21:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=1302) 改了名字以后，事件里能清楚看到前台调用了交接工具，问题确实交给了 C——可 C 是用韩语回答的那个，中文问题为什么交给它？[▶ 23:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=1393) 老师的解释是：前台只知道有 A、B、C 三个名字，不知道它们各自擅长什么，只好随便选一个。于是他给每个 Agent 加上**交接说明** `handoff_description`（只用中文回答 / 只用英文回答 / 只用韩语回答）。再运行，中文问题就交给了 A。\n\n[▶ 24:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=1454) 他又试了英文的 hello，结果还是交给了中文的 A；[▶ 25:57](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=1557) 换成一句韩语，就正确地交给了 C。他认为这是那个模型对英文的判断不够好，换模型可以改善。",
      "en": "[▶ 21:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=1302) After renaming, the events clearly show the front desk calling the handoff tool, and the question really does go to C – but C is the Korean agent, so why did a Chinese question go there? [▶ 23:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=1393) The instructor's explanation: the front desk only knew three names, A, B and C, not what each was good at, so it picked one at random. He adds a **handoff description**, `handoff_description`, to each agent (answers only in Chinese / English / Korean). On the next run the Chinese question goes to A.\n\n[▶ 24:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=1454) He then tries the English “hello”, which still goes to the Chinese agent A; [▶ 25:57](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=1557) a Korean sentence is correctly handed to C. He puts the English case down to that model's weaker judgement and suggests a different model would do better."
    },
    {
      "t": "p",
      "zh": "[▶ 27:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=1620) 交接的原理，老师总结得很清楚：大模型自己不能对外界做任何动作，它能做的只是发出工具调用。框架把「交给另一个 Agent」**包装成了一个工具**，前台的模型调用它，Runner 就把当前的 Agent 换掉，换上新的 Agent，话语权也就交给了对方。\n\n[▶ 29:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=1747) 接手的 Agent 能不能再交给别人？可以。但如果每个 Agent 都只交接、不回答，就会兜圈子。所以只有前台被要求「不回答」，其他 Agent 是这条路线的终点，负责把任务完成。（SDK 的 `Runner.run` 默认最多跑 10 轮，超过会抛出 `MaxTurnsExceeded`。）",
      "en": "[▶ 27:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=1620) The instructor sums up the mechanism clearly: an LLM can't act on the outside world by itself; all it can do is issue tool calls. The framework **wraps “hand over to another agent” as a tool**; when the front desk's model calls it, the Runner swaps the current agent for the new one, and the floor passes to it.\n\n[▶ 29:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=1747) Can the agent that takes over hand off again? Yes – but if every agent only hands off and none answers, they go round in circles. So only the front desk is told not to answer; the other agents are the end of the route and must finish the job. (The SDK's `Runner.run` allows 10 turns by default and raises `MaxTurnsExceeded` beyond that.)"
    },
    {
      "t": "check",
      "q": {
        "zh": "视频里给三个语言 Agent 改好英文名之后，中文问题还是被交给了韩语 Agent。加上哪个参数后才交对了？",
        "en": "In the video, after the language agents got English names, a Chinese question still went to the Korean agent. Which parameter fixed it?"
      },
      "options": [
        {
          "zh": "给前台加 `tools=[...]`",
          "en": "Adding `tools=[...]` to the front desk"
        },
        {
          "zh": "给每个语言 Agent 加 `handoff_description`",
          "en": "Adding `handoff_description` to each language agent"
        },
        {
          "zh": "把 `Runner.run` 换成 `Runner.run_sync`",
          "en": "Replacing `Runner.run` with `Runner.run_sync`"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "前台的模型只能看到交接工具的名字和说明。`handoff_description` 会写进说明里，告诉它每个 Agent 擅长什么，它才知道该交给谁。",
        "en": "The front desk's model sees only the handoff tools' names and descriptions. `handoff_description` goes into the description and tells it what each agent is good at, so it knows whom to pick."
      }
    },
    {
      "t": "h",
      "zh": "五、Agent 当工具（补充）",
      "en": "5. Agents as tools (extra)"
    },
    {
      "t": "p",
      "zh": "[▶ 01:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=96) 视频开头提到了这种方式，但没有写代码：把一个 Agent 包装成工具，交给另一个 Agent 使用，主 Agent 就能把任务委托给它。SDK 的写法是 `agent.as_tool(tool_name=..., tool_description=...)`。和交接最大的区别是：**子 Agent 跑完，结果作为工具结果回到主 Agent 手里**，主 Agent 可以再调用别的工具，最后由它自己回答。",
      "en": "[▶ 01:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=96) The video mentions this pattern at the start without code: wrap an agent as a tool so another agent can use it and delegate work to it. In the SDK you write `agent.as_tool(tool_name=..., tool_description=...)`. The big difference from a handoff: **when the sub-agent finishes, its result returns to the main agent as a tool result**; the main agent may call other tools and gives the final answer itself."
    },
    {
      "t": "code",
      "file": "as_tool.py",
      "code": {
        "zh": "# 接着上面的代码：chinese_agent、english_agent 已经定义好\nmanager = Agent(\n    name=\"manager\",\n    instructions=\"分别请中文助手和英文助手回答用户的问题，然后把两个回答合在一起，前面各加上「中文：」「English:」。\",\n    model=model,\n    tools=[\n        chinese_agent.as_tool(tool_name=\"ask_chinese\", tool_description=\"用中文回答一个问题\"),\n        english_agent.as_tool(tool_name=\"ask_english\", tool_description=\"用英文回答一个问题\"),\n    ],\n)\nasync def main():\n    result = await Runner.run(manager, QUESTION)\n    print(result.last_agent.name)   # 一直是 manager：子 Agent 的结果作为工具结果回到它手里\n    print(result.final_output)",
        "en": "# continues the code above: chinese_agent and english_agent already exist\nmanager = Agent(\n    name=\"manager\",\n    instructions=\"Ask the Chinese helper and the English helper to answer the user's question, then combine both answers, prefixed with 'Chinese:' and 'English:'.\",\n    model=model,\n    tools=[\n        chinese_agent.as_tool(tool_name=\"ask_chinese\", tool_description=\"Answer a question in Chinese\"),\n        english_agent.as_tool(tool_name=\"ask_english\", tool_description=\"Answer a question in English\"),\n    ],\n)\nasync def main():\n    result = await Runner.run(manager, QUESTION)\n    print(result.last_agent.name)   # always manager: each helper's result comes back to it as a tool result\n    print(result.final_output)"
      }
    },
    {
      "t": "p",
      "zh": "| | 交接 handoffs | 当工具 as_tool |\n|---|---|---|\n| 谁给出最终回答 | 接手的 Agent | 主 Agent |\n| 被调用的 Agent 能看到什么 | 到目前为止的整段对话 | 只有主 Agent 传给它的一句 `input` |\n| 一次能用几个 | 交给其中一个 | 可以先后调用好几个，再汇总 |\n| 适合 | 分流：按语言、按业务分派 | 协作：一个任务要几个 Agent 配合 |\n\n第 13 节的补充练习会用 `as_tool` 搭一个「主智能体 + 三个子智能体」的小团队。",
      "en": "| | handoffs | as_tool |\n|---|---|---|\n| Who gives the final answer | the agent that took over | the main agent |\n| What the called agent sees | the whole conversation so far | only the one-line `input` the main agent passes |\n| How many it can use | just one: the question goes to one of them | several, called one after another, then combined |\n| Good for | routing by language or topic | collaboration: one task needing several agents |\n\nThe extra exercise in lesson 13 uses `as_tool` to build a small team: one main agent and three sub-agents."
    },
    {
      "t": "h",
      "zh": "六、监督：让另一个 Agent 打分（补充）",
      "en": "6. Supervision: let another agent grade the work (extra)"
    },
    {
      "t": "p",
      "zh": "[▶ 02:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=126) 监督在视频里也只介绍了一句：一个 Agent 评估另一个的结果并给出反馈，推动它改进，质量会比单个 Agent 好很多。写成代码就是一个循环：写手写 → 评审打分 → 不通过就带着意见重写。评审的结论要交给**代码**判断（通过没有？意见是什么？），所以它的回答必须是固定格式的 JSON，再用 pydantic 校验成对象。",
      "en": "[▶ 02:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=126) Supervision also gets only a sentence in the video: one agent evaluates another's result and gives feedback that drives it to improve, with much better quality than a single agent. In code it is a loop: the writer writes → the judge grades → if it fails, rewrite with the feedback. The judge's verdict has to be read by **your code** (did it pass? what's the feedback?), so it must be JSON in a fixed format, validated into an object with pydantic."
    },
    {
      "t": "py",
      "title": {
        "zh": "pydantic 补充：默认值、Field 说明和 JSON Schema",
        "en": "More pydantic: defaults, Field descriptions and the JSON Schema"
      },
      "zh": "`BaseModel` 的基本用法——定义字段、自动转换类型、`ValidationError`、`model_validate_json`——在第 11 节的 Python 小课堂讲过（上一集视频讲结构化输出时用的就是它）。评审结论还要用到几样新东西：\n- **默认值**：`score: int = 0`，不填就用默认值。没有默认值的字段是**必填**的，缺了就抛 `ValidationError`。\n- `Field(description=...)`：给字段加一句说明，会写进 JSON Schema，模型能看到。\n- `Verdict.model_json_schema()`：自动生成这个格式的 JSON Schema（第 05 节手写过的那种）。把它写进 instructions，模型就知道该输出哪些字段、什么类型。\n- `v.model_dump()`：对象 → 字典（第 06 节用过同名方法）。",
      "en": "The basics of `BaseModel` – defining fields, automatic type conversion, `ValidationError`, `model_validate_json` – are in the Python mini-lesson of lesson 11 (the previous episode used them for structured output). The verdict needs a few more things:\n- **Defaults**: `score: int = 0` uses 0 when the field is left out. A field without a default is **required**; if it's missing you get `ValidationError`.\n- `Field(description=...)` adds a one-line description that goes into the JSON Schema, where the model can read it.\n- `Verdict.model_json_schema()` generates the JSON Schema for the format (the kind you wrote by hand in lesson 05). Put it into the instructions and the model knows which fields and types to output.\n- `v.model_dump()`: object → dict (you used a method with this name in lesson 06).",
      "code": {
        "zh": "from pydantic import BaseModel, Field, ValidationError\n\nclass Verdict(BaseModel):\n    passed: bool                                          # 字段名: 类型\n    feedback: str = Field(description=\"一句具体的修改意见\")\n    score: int = 0                                        # 有默认值的字段可以不填\n\nv = Verdict(passed=True, feedback=\"很好\", score=\"8\")\nprint(v.score + 1)              # 9：字符串 \"8\" 被转换成了整数\nprint(v.model_dump())           # 对象 → 字典\n\ntext = '{\"passed\": false, \"feedback\": \"卖点不够突出\"}'\nv2 = Verdict.model_validate_json(text)        # JSON 文本 → 对象（带检查）\nprint(v2.passed, v2.feedback, v2.score)\n\ntry:\n    Verdict.model_validate_json('{\"feedback\": \"忘了写 passed\"}')\nexcept ValidationError as e:\n    print(\"格式不对：\", e.errors()[0][\"loc\"], e.errors()[0][\"msg\"])\n\nprint(Verdict.model_json_schema())            # 自动生成的 JSON Schema",
        "en": "from pydantic import BaseModel, Field, ValidationError\n\nclass Verdict(BaseModel):\n    passed: bool                                          # field_name: type\n    feedback: str = Field(description=\"one concrete suggestion\")\n    score: int = 0                                        # a field with a default may be left out\n\nv = Verdict(passed=True, feedback=\"Great\", score=\"8\")\nprint(v.score + 1)              # 9: the string \"8\" was converted to an integer\nprint(v.model_dump())           # object -> dict\n\ntext = '{\"passed\": false, \"feedback\": \"The selling point is unclear\"}'\nv2 = Verdict.model_validate_json(text)        # JSON text -> object (checked)\nprint(v2.passed, v2.feedback, v2.score)\n\ntry:\n    Verdict.model_validate_json('{\"feedback\": \"passed is missing\"}')\nexcept ValidationError as e:\n    print(\"Wrong format:\", e.errors()[0][\"loc\"], e.errors()[0][\"msg\"])\n\nprint(Verdict.model_json_schema())            # the generated JSON Schema"
      }
    },
    {
      "t": "code",
      "file": "l12_judge_demo.py",
      "code": {
        "zh": "# 前面已经 import json，并定义好了 model 和上面的 Verdict\nwriter = Agent(name=\"writer\", model=model,\n               instructions=\"为用户给的产品写一句不超过 20 个字的中文广告语。收到修改意见就按意见重写。只输出广告语。\")\njudge = Agent(name=\"judge\", model=model, instructions=f\"\"\"你是严格的广告语评审。检查广告语是否不超过 20 个字、点出了卖点、读起来顺口。\n只输出一个 JSON 对象，不要 markdown 代码块。格式：{json.dumps(Verdict.model_json_schema(), ensure_ascii=False)}\"\"\")\n\nasync def main(product=\"一款充一次电能用 30 天的智能手表\"):\n    task = f\"产品：{product}\"\n    for i in range(1, 4):                                         # 最多改 3 版\n        slogan = (await Runner.run(writer, task)).final_output\n        raw = (await Runner.run(judge, f\"产品：{product}\\n广告语：{slogan}\")).final_output\n        verdict = Verdict.model_validate_json(raw)                # 不合格式就抛 ValidationError\n        print(i, slogan, verdict.passed, verdict.feedback)\n        if verdict.passed:\n            break\n        task = f\"产品：{product}\\n上一版：{slogan}\\n修改意见：{verdict.feedback}\"",
        "en": "# json is imported, and model and the Verdict class above are defined\nwriter = Agent(name=\"writer\", model=model,\n               instructions=\"Write a one-line slogan of at most 12 words for the user's product. If you get feedback, rewrite accordingly. Output only the slogan.\")\njudge = Agent(name=\"judge\", model=model, instructions=f\"\"\"You are a strict slogan judge. Check that the slogan is at most 12 words, names a selling point and reads smoothly.\nOutput only one JSON object, no markdown code fence. Format: {json.dumps(Verdict.model_json_schema(), ensure_ascii=False)}\"\"\")\n\nasync def main(product=\"a smartwatch that runs 30 days on one charge\"):\n    task = f\"Product: {product}\"\n    for i in range(1, 4):                                         # at most 3 drafts\n        slogan = (await Runner.run(writer, task)).final_output\n        raw = (await Runner.run(judge, f\"Product: {product}\\nSlogan: {slogan}\")).final_output\n        verdict = Verdict.model_validate_json(raw)                # raises ValidationError if the shape is wrong\n        print(i, slogan, verdict.passed, verdict.feedback)\n        if verdict.passed:\n            break\n        task = f\"Product: {product}\\nPrevious draft: {slogan}\\nFeedback: {verdict.feedback}\""
      },
      "note": {
        "zh": "完整文件 `practice/l12_judge_demo.py` 里的 `Verdict` 只保留了 `passed` 和 `feedback` 两个字段（`feedback` 用 `Field` 写了说明），还用 try/except 接住了 `ValidationError`，并去掉模型偶尔包在外面的代码块标记。",
        "en": "In the full file `practice/l12_judge_demo.py`, `Verdict` keeps only the two fields `passed` and `feedback` (`feedback` gets a description via `Field`); the file also catches `ValidationError` with try/except and strips the code-fence markers the model sometimes wraps around its reply."
      }
    },
    {
      "t": "warn",
      "zh": "上一集视频用 `output_type=模型类` 让 SDK 自动按格式输出。只写这一项的话，SDK 会发出 `json_schema` 格式的请求，DeepSeek 不支持，直接报 400（`This response_format type is unavailable now`）；第 11 节的办法是再加一行 `model_settings`，把格式换成 `json_object`。这里换一种更「看得见」的写法：自己把 `Verdict.model_json_schema()` 写进 instructions，拿到文字后自己 `model_validate_json`——这也正是 `output_type` 在背后替你做的两件事。",
      "en": "The previous episode used `output_type=ModelClass` so the SDK enforces the format. With that setting alone the SDK requests the `json_schema` format, which DeepSeek doesn't support, and you get a 400 (`This response_format type is unavailable now`); lesson 11's fix is one more line of `model_settings` switching the format to `json_object`. Here we take a more visible route instead: put `Verdict.model_json_schema()` into the instructions ourselves and call `model_validate_json` on the reply – exactly the two jobs `output_type` does for you behind the scenes."
    },
    {
      "t": "h",
      "zh": "七、实战：四个能力有限的 Agent 把 5 变成 23",
      "en": "7. Project: four limited agents turn 5 into 23"
    },
    {
      "t": "video",
      "zh": "[▶ 30:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=1812) 最后一个例子老师没有现场敲，而是打开准备好的代码讲解。他先说为什么大家一直在追求多 Agent：复杂问题往往要分好几步、用好几种工具或流程才能完成，不是跟大模型说一句话、或者给它一个工具就能解决的，所以要把问题拆成多个步骤、多个角色。\n\n[▶ 31:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=1912) 例子里有四个能力很有限的 Agent：一个只会加 1，一个只会减 1，一个只会乘 2，一个只会除以 2，代表现实中的一个个步骤或工具；另外有一个负责分析、推理、规划和编排的**调度 Agent**。[▶ 32:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=1972) 任务是只用这四种能力，把当前数字变成目标数字。调度 Agent 的系统提示里写了：解决问题的基本流程、按任务选合适的 Agent、避免重复兜圈子、尽量少走几步，以及完成时发出一个**明确的结束信号**，好让代码知道该收尾了。\n\n[▶ 33:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=2034) 把它们组合起来的函数：先设一个最大次数，因为要循环、又怕陷入死循环；每一轮把提示发给调度 Agent，由它决定交给谁；代码里并不写死用哪个 Agent，[▶ 36:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=2190) 只在发现换了 Agent 时打印调试信息，收到结束信号就提前跳出循环。[▶ 37:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=2220) 运行结果：起始 5、目标 23，依次是乘 2 得 10、加 1 得 11、乘 2 得 22、加 1 得 23，然后调度 Agent 发出结束信号。老师也提到这不是唯一的走法，比如连加十几次 1 也能到达。",
      "en": "[▶ 30:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=1812) The instructor doesn't type the last example live; he walks through prepared code. First he explains why people keep pursuing multi-agent systems: complex problems usually take several steps, tools or processes; one sentence to an LLM, or handing it one tool, won't solve them, so you break the problem into steps and roles.\n\n[▶ 31:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=1912) The example has four very limited agents – one can only add 1, one only subtract 1, one only multiply by 2, one only divide by 2 – standing for the individual steps or tools of a real task, plus a **planner agent** that analyses, reasons, plans and orchestrates. [▶ 32:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=1972) The job: turn the current number into the target number using only those four abilities. The planner's system prompt covers the basic workflow, choosing a suitable agent for each task, avoiding repeated loops, preferring fewer steps, and giving a **clear end signal** when finished so the code knows to wrap up.\n\n[▶ 33:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=2034) The function that ties them together sets a maximum number of rounds, because it loops and must not loop forever; each round sends the prompt to the planner, which decides who goes next – the code never hard-codes which agent to use. [▶ 36:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=2190) It prints debug info whenever the agent changes and breaks out of the loop early on the end signal. [▶ 37:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=2220) The run: start 5, target 23 – times 2 gives 10, plus 1 gives 11, times 2 gives 22, plus 1 gives 23 – then the planner sends the end signal. He notes this isn't the only route; a dozen-odd +1s would also get there."
    },
    {
      "t": "p",
      "zh": "讲义没有照搬视频里的代码：`practice/l12_number_game_solution.py` 是按老师讲解的结构重写的，干活的 Agent 和调度 Agent 用的正是第四部分的交接，循环和结束信号由我们自己的代码控制。",
      "en": "The notes don't copy the video's code: `practice/l12_number_game_solution.py` is rewritten following the structure the instructor explains. The worker agents and the planner use exactly the handoffs from part 4, and our own code controls the loop and the end signal."
    },
    {
      "t": "code",
      "file": "l12_number_game_solution.py",
      "code": {
        "zh": "# 省略了 import asyncio、import re、from agents import ... 和 model 的设置（见完整文件）\nWORKER_RULE = \"在对话里找到最新的「当前数字」，做完你的运算后只输出结果数字，不要输出任何别的文字。\"\nadd_one = Agent(name=\"add_one\", handoff_description=\"把当前数字加 1\",\n                instructions=\"你只会把数字加 1。\" + WORKER_RULE, model=model)\nminus_one = Agent(name=\"minus_one\", handoff_description=\"把当前数字减 1\",\n                  instructions=\"你只会把数字减 1。\" + WORKER_RULE, model=model)\ndouble = Agent(name=\"double\", handoff_description=\"把当前数字乘以 2\",\n               instructions=\"你只会把数字乘以 2。\" + WORKER_RULE, model=model)\nhalf = Agent(name=\"half\", handoff_description=\"把当前数字除以 2（只能用于偶数）\",\n             instructions=\"你只会把数字除以 2。\" + WORKER_RULE, model=model)\n\nplanner = Agent(\n    name=\"planner\",\n    instructions=\"\"\"你是调度员，负责分析和规划，自己不做任何计算。每一轮你只做一件事：\n1. 读出当前数字和目标数字；\n2. 如果当前数字已经等于目标数字，只回复 DONE 这一个词；\n3. 否则想好用最少的步数到达目标，然后把这一步交接给对应的 Agent；\n4. 不要来回做互相抵消的操作（比如加 1 之后马上减 1）。\"\"\",\n    model=model,\n    handoffs=[add_one, minus_one, double, half],\n)\n\nasync def solve(start, target, max_rounds=10):\n    current = start\n    for i in range(1, max_rounds + 1):                       # 最多 max_rounds 轮，防止死循环\n        result = await Runner.run(planner, f\"当前数字：{current}，目标数字：{target}。\")\n        worker = result.last_agent                           # 这一轮最后是谁回答的\n        if worker is planner:                                # 没有交接，调度员自己回复了\n            if \"DONE\" in result.final_output:                # 收到结束信号，提前结束\n                print(f\"第 {i} 轮：完成\")\n                return current\n            continue\n        numbers = re.findall(r\"-?\\d+\", result.final_output)  # 取出回答里的数字\n        if numbers:\n            new = int(numbers[-1])\n            print(f\"第 {i} 轮：交给 {worker.name}：{current} -> {new}\")\n            current = new\n    print(\"超过最大轮数，放弃\")\n    return current\n\nasyncio.run(solve(5, 23))",
        "en": "# imports (asyncio, re, agents) and the model setup are omitted - see the full file\nWORKER_RULE = \"Find the latest 'current number' in the conversation, apply your operation and output only the resulting number, nothing else.\"\nadd_one = Agent(name=\"add_one\", handoff_description=\"Adds 1 to the current number\",\n                instructions=\"You can only add 1 to a number. \" + WORKER_RULE, model=model)\nminus_one = Agent(name=\"minus_one\", handoff_description=\"Subtracts 1 from the current number\",\n                  instructions=\"You can only subtract 1. \" + WORKER_RULE, model=model)\ndouble = Agent(name=\"double\", handoff_description=\"Multiplies the current number by 2\",\n               instructions=\"You can only multiply by 2. \" + WORKER_RULE, model=model)\nhalf = Agent(name=\"half\", handoff_description=\"Divides the current number by 2 (even numbers only)\",\n             instructions=\"You can only divide by 2. \" + WORKER_RULE, model=model)\n\nplanner = Agent(\n    name=\"planner\",\n    instructions=\"\"\"You are the planner: you analyse and plan, and never calculate yourself. Each round, do one thing:\n1. read the current number and the target number;\n2. if the current number already equals the target, reply with the single word DONE;\n3. otherwise work out the shortest route and hand this one step to the matching agent;\n4. never make moves that cancel out (e.g. +1 followed by -1).\"\"\",\n    model=model,\n    handoffs=[add_one, minus_one, double, half],\n)\n\nasync def solve(start, target, max_rounds=10):\n    current = start\n    for i in range(1, max_rounds + 1):                       # at most max_rounds rounds - no endless loop\n        result = await Runner.run(planner, f\"Current number: {current}, target number: {target}.\")\n        worker = result.last_agent                           # who answered last this round\n        if worker is planner:                                # no handoff: the planner replied itself\n            if \"DONE\" in result.final_output:                # the end signal: stop early\n                print(f\"round {i}: done\")\n                return current\n            continue\n        numbers = re.findall(r\"-?\\d+\", result.final_output)  # pull the numbers out of the reply\n        if numbers:\n            new = int(numbers[-1])\n            print(f\"round {i}: handed to {worker.name}: {current} -> {new}\")\n            current = new\n    print(\"too many rounds, giving up\")\n    return current\n\nasyncio.run(solve(5, 23))"
      }
    },
    {
      "t": "p",
      "zh": "几个设计要点：\n- **状态由代码记着**：`current` 保存当前数字，每一轮都把「当前数字、目标数字」重新告诉调度员，它不需要记住之前发生过什么。\n- **怎么知道交给了谁**：`result.last_agent` 是本轮最后回答的 Agent。如果它就是 `planner`，说明没有交接，再看回复里有没有 `DONE`。\n- **从回复里取数字**：用 `re.findall(r\"-?\\d+\", ...)`（第 07 节的正则）取出所有整数，用最后一个。万一模型写成「5 + 1 = 6」，取第一个就错了。\n- **最多 `max_rounds` 轮**：模型出错或兜圈子时也能停下来，不会一直花钱。\n\n用真实的 DeepSeek 跑了一次（为了少调用几次，把目标设成 12）：",
      "en": "Design points:\n- **Your code keeps the state**: `current` holds the current number, and every round tells the planner the current and target numbers again, so it needn't remember earlier rounds.\n- **Who took over**: `result.last_agent` is the agent that answered last this round. If it is `planner` itself there was no handoff, so look for `DONE` in the reply.\n- **Reading the number**: `re.findall(r\"-?\\d+\", ...)` (regular expressions, lesson 07) finds every integer, and we take the last one – if the model writes “5 + 1 = 6”, the first would be wrong.\n- **At most `max_rounds` rounds**: if the model errs or circles, the program still stops instead of spending money forever.\n\nOne run with the real DeepSeek model (target 12, to save calls):"
    },
    {
      "t": "code",
      "file": {
        "zh": "运行结果（真实 DeepSeek，solve(5, 12)）",
        "en": "output (real DeepSeek run, solve(5, 12))"
      },
      "lang": "text",
      "code": {
        "zh": "起始数字 / start: 5   目标数字 / target: 12\n第 1 轮 / round 1: 交给 / handed to add_one: 5 -> 6\n第 2 轮 / round 2: 交给 / handed to double: 6 -> 12\n第 3 轮 / round 3: 调度员发出 DONE，完成 / planner says DONE",
        "en": "start: 5   target: 12\nround 1: handed to add_one: 5 -> 6\nround 2: handed to double: 6 -> 12\nround 3: planner says DONE"
      }
    },
    {
      "t": "note",
      "zh": "[▶ 38:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=2312) 老师最后说，把加减乘除换成真实的能力，就是实际的多 Agent 系统：比如一个负责下载视频，一个负责解析视频内容，一个把语音转成文字，一个根据文字生成新内容，它们配合起来就是一条完整的流水线。关键是把工作拆成不同的 Agent，再设计好它们之间的调度关系和各自的系统提示。",
      "en": "[▶ 38:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=13&t=2312) To close, the instructor notes that replacing the arithmetic with real abilities gives you an actual multi-agent system: one agent downloads a video, one analyses its content, one turns speech into text, one writes new content from the text – together a complete pipeline. The key is splitting the work into agents and designing their scheduling and system prompts."
    },
    {
      "t": "check",
      "q": {
        "zh": "数字变换的循环里，为什么一定要设 `max_rounds`？",
        "en": "Why must the number loop have `max_rounds`?"
      },
      "options": [
        {
          "zh": "SDK 规定循环必须写成 `for`",
          "en": "The SDK requires the loop to be a `for`"
        },
        {
          "zh": "不设的话调度员不会发出 DONE",
          "en": "Without it the planner never says DONE"
        },
        {
          "zh": "模型可能走错或兜圈子，设上限才能保证程序一定会停下来",
          "en": "The model may go wrong or circle, so a limit guarantees the program stops"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "每一轮的选择都由模型决定，无法保证一定能到达目标。设最大轮数，最坏情况下也只是放弃，不会无限循环、一直调用模型。",
        "en": "The model chooses every step, so reaching the target is not guaranteed. A round limit means the worst case is giving up, not looping and calling the model forever."
      }
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "顺序编排里，第二个 Agent 的输入应该是什么？",
        "en": "In sequential orchestration, what should the second agent's input be?"
      },
      "options": [
        {
          "zh": "用户原来的问题",
          "en": "The user's original question"
        },
        {
          "zh": "第一个 Agent 的 `instructions`",
          "en": "The first agent's `instructions`"
        },
        {
          "zh": "第一个 Agent 运行结果的 `final_output`",
          "en": "The `final_output` of the first agent's run"
        },
        {
          "zh": "`result.last_agent`",
          "en": "`result.last_agent`"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "顺序编排的关系就体现在 `Runner.run(explain_agent, r1.final_output)` 这一行：上一个的输出就是下一个的输入。",
        "en": "The relationship lives in `Runner.run(explain_agent, r1.final_output)`: the previous output is the next input."
      }
    },
    {
      "q": {
        "zh": "`r1, r2, r3 = await asyncio.gather(...)` 里，`r1` 对应哪个结果？",
        "en": "In `r1, r2, r3 = await asyncio.gather(...)`, which result is `r1`?"
      },
      "options": [
        {
          "zh": "传给 `gather` 的第一个协程的结果",
          "en": "The result of the first coroutine passed to `gather`"
        },
        {
          "zh": "最先运行完的那个",
          "en": "Whichever finished first"
        },
        {
          "zh": "最慢的那个",
          "en": "The slowest one"
        },
        {
          "zh": "随机的，每次不一样",
          "en": "Random – it changes each time"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "`gather` 按**传入的顺序**返回结果，和谁先完成无关（第 09 节）。",
        "en": "`gather` returns results in the **order they were passed**, no matter which finishes first (lesson 09)."
      }
    },
    {
      "q": {
        "zh": "把 `Agent(name=\"中文助手\", ...)` 和 `Agent(name=\"英文助手\", ...)` 放进 `handoffs`，会发生什么？",
        "en": "What happens if `Agent(name=\"中文助手\", ...)` and `Agent(name=\"英文助手\", ...)` go into `handoffs`?"
      },
      "options": [
        {
          "zh": "没有问题，SDK 会自动翻译成英文名",
          "en": "Nothing – the SDK translates the names into English"
        },
        {
          "zh": "报 SyntaxError",
          "en": "A SyntaxError"
        },
        {
          "zh": "模型只能用中文回答",
          "en": "The model can only answer in Chinese"
        },
        {
          "zh": "中文都被换成下划线，两个工具名都是 `transfer_to_____`，模型没法区分",
          "en": "The Chinese becomes underscores, both tools are named `transfer_to_____`, and the model can't tell them apart"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "工具名只允许字母、数字和下划线，其他字符被替换成 `_`；同样长度的中文名会撞成同一个名字。视频里就是这样出的错。",
        "en": "Tool names allow only letters, digits and underscores; other characters become `_`, so Chinese names of equal length collide. That is exactly what went wrong in the video."
      }
    },
    {
      "q": {
        "zh": "前台 Agent 把问题交接给 `chinese_agent` 之后，最终回答用户的是谁？",
        "en": "After the front desk hands the question to `chinese_agent`, who gives the final answer?"
      },
      "options": [
        {
          "zh": "前台拿到结果后再回答",
          "en": "The front desk, after getting the result"
        },
        {
          "zh": "`chinese_agent` 直接回答",
          "en": "`chinese_agent`, directly"
        },
        {
          "zh": "两个 Agent 各回答一次",
          "en": "Both agents answer once each"
        },
        {
          "zh": "SDK 自动合并两个回答",
          "en": "The SDK merges two answers"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "交接是「交出去就不回来」：接手的 Agent 继续对话并给出最终回答，`result.last_agent` 就是它。想让结果回到主 Agent 手里，要用 `as_tool`。",
        "en": "A handoff is one-way: the agent that takes over continues and gives the final answer, so `result.last_agent` is that agent. To get results back to a main agent, use `as_tool`."
      }
    },
    {
      "q": {
        "zh": "为什么说交接「本质上是一次工具调用」？",
        "en": "Why is a handoff “essentially a tool call”?"
      },
      "options": [
        {
          "zh": "因为 SDK 把每个可交接的 Agent 变成一个 `transfer_to_<name>` 工具，模型调用它，Runner 就换 Agent",
          "en": "Because the SDK turns each handoff target into a `transfer_to_<name>` tool; when the model calls it, the Runner switches agents"
        },
        {
          "zh": "因为交接只能在 `tools=[...]` 里写",
          "en": "Because handoffs can only be written in `tools=[...]`"
        },
        {
          "zh": "因为交接时会执行 Agent 里的 Python 函数",
          "en": "Because a handoff runs a Python function inside the agent"
        },
        {
          "zh": "因为模型会把答案写进工具参数里",
          "en": "Because the model writes the answer into the tool arguments"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "模型本身只能「说」要调用哪个工具。框架把交接包装成工具，模型一调用，Runner 就把当前 Agent 换成目标 Agent——视频里在事件中看到的 function call 就是它。",
        "en": "The model can only say which tool it wants to call. The framework wraps the handoff as a tool; when the model calls it, the Runner swaps in the target agent – that is the function call the video found in the events."
      }
    },
    {
      "q": {
        "zh": "`Verdict` 定义为 `passed: bool` 和 `feedback: str`。执行 `Verdict.model_validate_json('{\"feedback\": \"ok\"}')` 会怎样？",
        "en": "`Verdict` has `passed: bool` and `feedback: str`. What does `Verdict.model_validate_json('{\"feedback\": \"ok\"}')` do?"
      },
      "options": [
        {
          "zh": "得到 `passed=False` 的对象",
          "en": "Returns an object with `passed=False`"
        },
        {
          "zh": "得到 `passed=None` 的对象",
          "en": "Returns an object with `passed=None`"
        },
        {
          "zh": "返回一个字典",
          "en": "Returns a dict"
        },
        {
          "zh": "抛出 `ValidationError`，指出缺少 `passed`",
          "en": "Raises `ValidationError` saying `passed` is missing"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "没有默认值的字段是必填的；缺了就报 `ValidationError`，并指出字段名。想让它可以不填，就写默认值。",
        "en": "A field without a default is required; if it's missing you get `ValidationError` naming the field. Give it a default to make it optional."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "顺序 + 并行",
        "en": "Sequential + parallel"
      },
      "code": {
        "zh": "async def main():\n    # 顺序：A 的答案交给 B\n    r1 = await Runner.[[run]](answer_agent, QUESTION)\n    r2 = await Runner.run(explain_agent, r1.[[final_output]])\n\n    # 并行：三个 Agent 同时回答\n    t1 = time.[[time]]()\n    r1, r2, r3 = [[await]] asyncio.[[gather]](\n        Runner.run(chinese_agent, QUESTION),\n        Runner.run(english_agent, QUESTION),\n        Runner.run(korean_agent, QUESTION),\n    )\n    print(f\"用时 {time.time() - t1:.1f} 秒\")\n\nasyncio.[[run]](main())",
        "en": "async def main():\n    # sequential: A's answer goes to B\n    r1 = await Runner.[[run]](answer_agent, QUESTION)\n    r2 = await Runner.run(explain_agent, r1.[[final_output]])\n\n    # parallel: three agents answer at once\n    t1 = time.[[time]]()\n    r1, r2, r3 = [[await]] asyncio.[[gather]](\n        Runner.run(chinese_agent, QUESTION),\n        Runner.run(english_agent, QUESTION),\n        Runner.run(korean_agent, QUESTION),\n    )\n    print(f\"took {time.time() - t1:.1f} s\")\n\nasyncio.[[run]](main())"
      },
      "explain": {
        "zh": "第二棒的输入是 `r1.final_output`；`time.time()` 取当前时刻；`gather` 要 `await` 才能拿到结果，结果按传入顺序拆给 r1、r2、r3。",
        "en": "The second leg's input is `r1.final_output`; `time.time()` reads the current moment; `gather` needs `await`, and its results unpack into r1, r2, r3 in the order passed."
      }
    },
    {
      "title": {
        "zh": "前台交接 + 看事件",
        "en": "Front desk handoff + events"
      },
      "code": {
        "zh": "korean_agent = Agent(\n    name=\"korean_agent\",\n    [[handoff_description]]=\"只用韩语回答问题\",\n    instructions=\"Answer ONLY in Korean.\",\n    model=model,\n)\n\nfront_desk = Agent(\n    name=\"front_desk\",\n    instructions=\"你自己不回答问题，根据用户的语言把问题交接给合适的 Agent。\",\n    model=model,\n    [[handoffs]]=[chinese_agent, english_agent, korean_agent],\n)\n\nasync def main():\n    result = Runner.[[run_streamed]](front_desk, QUESTION)\n    async for event in result.[[stream_events]]():\n        if event.type == \"agent_updated_stream_event\":\n            print(\"[当前 Agent]\", event.[[new_agent]].name)\n    print(\"最后回答的是:\", result.[[last_agent]].name)",
        "en": "korean_agent = Agent(\n    name=\"korean_agent\",\n    [[handoff_description]]=\"Answers ONLY in Korean\",\n    instructions=\"Answer ONLY in Korean.\",\n    model=model,\n)\n\nfront_desk = Agent(\n    name=\"front_desk\",\n    instructions=\"Never answer yourself; hand the question to the agent matching the user's language.\",\n    model=model,\n    [[handoffs]]=[chinese_agent, english_agent, korean_agent],\n)\n\nasync def main():\n    result = Runner.[[run_streamed]](front_desk, QUESTION)\n    async for event in result.[[stream_events]]():\n        if event.type == \"agent_updated_stream_event\":\n            print(\"[agent]\", event.[[new_agent]].name)\n    print(\"Answered by:\", result.[[last_agent]].name)"
      },
      "explain": {
        "zh": "`handoff_description` 告诉前台每个 Agent 擅长什么；`handoffs` 列出能交给谁；流式运行用 `run_streamed`（不 await）和 `stream_events()`；换 Agent 的事件里用 `new_agent` 取新 Agent；最后看 `last_agent`。",
        "en": "`handoff_description` tells the front desk what each agent is good at; `handoffs` lists who it may hand over to; stream with `run_streamed` (no await) and `stream_events()`; the agent-change event carries `new_agent`; finally check `last_agent`."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：用 pydantic 校验评审结论",
        "en": "Write it: validate a verdict with pydantic"
      },
      "run": true,
      "task": {
        "zh": "不看上面的代码，写出：\n1. 从 pydantic 导入 `BaseModel` 和 `ValidationError`\n2. 定义 `Verdict`：字段 `passed: bool`、`feedback: str`、`score: int`（默认值 0）\n3. 用 `Verdict.model_validate_json(...)` 校验给出的 `good`，打印三个字段\n4. 校验缺了 `passed` 的 `bad`，用 try/except 接住 `ValidationError` 并打印\n\n可以直接点运行。",
        "en": "Without looking above, write:\n1. import `BaseModel` and `ValidationError` from pydantic\n2. define `Verdict` with `passed: bool`, `feedback: str` and `score: int` (default 0)\n3. validate the given `good` with `Verdict.model_validate_json(...)` and print the three fields\n4. validate `bad`, which lacks `passed`, catching `ValidationError` with try/except and printing it\n\nYou can run it right here."
      },
      "starter": {
        "zh": "# 1. 从 pydantic 导入 BaseModel 和 ValidationError\n\n\n# 2. 定义 Verdict：passed 布尔值、feedback 字符串、score 整数（默认 0）\n\n\n# 3. 把 good 校验成对象，打印三个字段\ngood = '{\"passed\": true, \"feedback\": \"卖点清楚\", \"score\": \"9\"}'\n\n\n# 4. 校验缺了 passed 的 bad，用 try/except 接住错误并打印\nbad = '{\"feedback\": \"太长了\"}'\n",
        "en": "# 1. import BaseModel and ValidationError from pydantic\n\n\n# 2. define Verdict: passed (bool), feedback (str), score (int, default 0)\n\n\n# 3. validate good into an object and print its three fields\ngood = '{\"passed\": true, \"feedback\": \"Clear selling point\", \"score\": \"9\"}'\n\n\n# 4. validate bad, which lacks passed; catch the error with try/except and print it\nbad = '{\"feedback\": \"Too long\"}'\n"
      },
      "solution": {
        "zh": "# 1. 从 pydantic 导入 BaseModel 和 ValidationError\nfrom pydantic import BaseModel, ValidationError\n\n# 2. 定义 Verdict：passed 布尔值、feedback 字符串、score 整数（默认 0）\nclass Verdict(BaseModel):\n    passed: bool\n    feedback: str\n    score: int = 0\n\n# 3. 把 good 校验成对象，打印三个字段\ngood = '{\"passed\": true, \"feedback\": \"卖点清楚\", \"score\": \"9\"}'\nv = Verdict.model_validate_json(good)\nprint(v.passed, v.feedback, v.score)\n\n# 4. 校验缺了 passed 的 bad，用 try/except 接住错误并打印\nbad = '{\"feedback\": \"太长了\"}'\ntry:\n    Verdict.model_validate_json(bad)\nexcept ValidationError as e:\n    print(\"格式不对：\", e)\n",
        "en": "# 1. import BaseModel and ValidationError from pydantic\nfrom pydantic import BaseModel, ValidationError\n\n# 2. define Verdict: passed (bool), feedback (str), score (int, default 0)\nclass Verdict(BaseModel):\n    passed: bool\n    feedback: str\n    score: int = 0\n\n# 3. validate good into an object and print its three fields\ngood = '{\"passed\": true, \"feedback\": \"Clear selling point\", \"score\": \"9\"}'\nv = Verdict.model_validate_json(good)\nprint(v.passed, v.feedback, v.score)\n\n# 4. validate bad, which lacks passed; catch the error with try/except and print it\nbad = '{\"feedback\": \"Too long\"}'\ntry:\n    Verdict.model_validate_json(bad)\nexcept ValidationError as e:\n    print(\"Wrong format:\", e)\n"
      },
      "checks": [
        {
          "zh": "从 pydantic 导入了 `BaseModel`",
          "en": "Imports `BaseModel` from pydantic",
          "re": "from\\s+pydantic\\s+import\\s+.*BaseModel"
        },
        {
          "zh": "定义了 `class Verdict(BaseModel):`",
          "en": "Defines `class Verdict(BaseModel):`",
          "re": "class\\s+Verdict\\s*\\(\\s*BaseModel\\s*\\)\\s*:"
        },
        {
          "zh": "字段 `score: int = 0` 带默认值",
          "en": "Field `score: int = 0` with a default",
          "re": "^\\s+score\\s*:\\s*int\\s*=\\s*0"
        },
        {
          "zh": "用 `Verdict.model_validate_json(good)` 校验",
          "en": "Validates with `Verdict.model_validate_json(good)`",
          "re": "Verdict\\.model_validate_json\\(\\s*good\\s*\\)"
        },
        {
          "zh": "用 `except ValidationError` 接住错误",
          "en": "Catches errors with `except ValidationError`",
          "re": "except\\s+ValidationError"
        }
      ]
    },
    {
      "title": {
        "zh": "手写：顺序 + 并行",
        "en": "Write it: sequential + parallel"
      },
      "task": {
        "zh": "按 starter 里的注释写：\n- `answer_agent` 回答问题，`explain_agent` 对答案做扩展；在 `main()` 里先后运行，第二个的输入用第一个的 `final_output`\n- 三个语言 Agent 用 `asyncio.gather` 同时回答 `QUESTION`，结果拆成 `r1, r2, r3`，并用 `time.time()` 打印用时\n\n写完复制到 `practice` 文件夹里用 `.venv` 运行（会调用模型 5 次）。",
        "en": "Following the comments in the starter:\n- `answer_agent` answers and `explain_agent` expands on the answer; in `main()` run them in turn, feeding the first one's `final_output` into the second\n- run the three language agents on `QUESTION` at once with `asyncio.gather`, unpack into `r1, r2, r3` and print the time taken using `time.time()`\n\nThen copy it into the `practice` folder and run it with `.venv` (5 model calls)."
      },
      "starter": {
        "zh": "import asyncio\nimport time\n\nfrom agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nmodel = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)\nQUESTION = \"太阳绕着地球转，还是地球绕着太阳转？\"\n\n# 1. answer_agent：简短回答问题；explain_agent：对收到的答案做扩展说明\n\n# 2. 三个语言 Agent：chinese_agent、english_agent、korean_agent（instructions 写 Answer ONLY in ...）\n\nasync def main():\n    # 3. 顺序：先跑 answer_agent，再把它的 final_output 交给 explain_agent，打印两个结果\n\n    # 4. 并行：记下开始时间，用 asyncio.gather 同时跑三个语言 Agent，拆成 r1, r2, r3，打印用时和回答\n    pass\n\nasyncio.run(main())\n",
        "en": "import asyncio\nimport time\n\nfrom agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nmodel = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)\nQUESTION = \"Does the Sun go round the Earth, or the Earth round the Sun?\"\n\n# 1. answer_agent: answers briefly; explain_agent: expands on the answer it receives\n\n# 2. three language agents: chinese_agent, english_agent, korean_agent (instructions: Answer ONLY in ...)\n\nasync def main():\n    # 3. sequential: run answer_agent, then give its final_output to explain_agent; print both\n\n    # 4. parallel: note the start time, run the three language agents with asyncio.gather,\n    #    unpack into r1, r2, r3, print the time taken and the answers\n    pass\n\nasyncio.run(main())\n"
      },
      "solution": {
        "zh": "import asyncio\nimport time\n\nfrom agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nmodel = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)\nQUESTION = \"太阳绕着地球转，还是地球绕着太阳转？\"\n\n# 1. answer_agent：简短回答问题；explain_agent：对收到的答案做扩展说明\nanswer_agent = Agent(name=\"answer_agent\", instructions=\"用中文简短回答问题，不超过两句话。\", model=model)\nexplain_agent = Agent(name=\"explain_agent\", instructions=\"对收到的答案做扩展和补充说明。\", model=model)\n\n# 2. 三个语言 Agent：chinese_agent、english_agent、korean_agent（instructions 写 Answer ONLY in ...）\nchinese_agent = Agent(name=\"chinese_agent\", instructions=\"Answer ONLY in Chinese.\", model=model)\nenglish_agent = Agent(name=\"english_agent\", instructions=\"Answer ONLY in English.\", model=model)\nkorean_agent = Agent(name=\"korean_agent\", instructions=\"Answer ONLY in Korean.\", model=model)\n\nasync def main():\n    # 3. 顺序：先跑 answer_agent，再把它的 final_output 交给 explain_agent，打印两个结果\n    r1 = await Runner.run(answer_agent, QUESTION)\n    r2 = await Runner.run(explain_agent, r1.final_output)\n    print(r1.final_output)\n    print(r2.final_output)\n\n    # 4. 并行：记下开始时间，用 asyncio.gather 同时跑三个语言 Agent，拆成 r1, r2, r3，打印用时和回答\n    t1 = time.time()\n    r1, r2, r3 = await asyncio.gather(\n        Runner.run(chinese_agent, QUESTION),\n        Runner.run(english_agent, QUESTION),\n        Runner.run(korean_agent, QUESTION),\n    )\n    print(f\"用时 {time.time() - t1:.1f} 秒\")\n    print(r1.final_output, r2.final_output, r3.final_output, sep=\"\\n\")\n\nasyncio.run(main())\n",
        "en": "import asyncio\nimport time\n\nfrom agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nmodel = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)\nQUESTION = \"Does the Sun go round the Earth, or the Earth round the Sun?\"\n\n# 1. answer_agent: answers briefly; explain_agent: expands on the answer it receives\nanswer_agent = Agent(name=\"answer_agent\", instructions=\"Answer briefly, in at most two sentences.\", model=model)\nexplain_agent = Agent(name=\"explain_agent\", instructions=\"Expand on the answer you receive.\", model=model)\n\n# 2. three language agents: chinese_agent, english_agent, korean_agent (instructions: Answer ONLY in ...)\nchinese_agent = Agent(name=\"chinese_agent\", instructions=\"Answer ONLY in Chinese.\", model=model)\nenglish_agent = Agent(name=\"english_agent\", instructions=\"Answer ONLY in English.\", model=model)\nkorean_agent = Agent(name=\"korean_agent\", instructions=\"Answer ONLY in Korean.\", model=model)\n\nasync def main():\n    # 3. sequential: run answer_agent, then give its final_output to explain_agent; print both\n    r1 = await Runner.run(answer_agent, QUESTION)\n    r2 = await Runner.run(explain_agent, r1.final_output)\n    print(r1.final_output)\n    print(r2.final_output)\n\n    # 4. parallel: note the start time, run the three language agents with asyncio.gather,\n    #    unpack into r1, r2, r3, print the time taken and the answers\n    t1 = time.time()\n    r1, r2, r3 = await asyncio.gather(\n        Runner.run(chinese_agent, QUESTION),\n        Runner.run(english_agent, QUESTION),\n        Runner.run(korean_agent, QUESTION),\n    )\n    print(f\"took {time.time() - t1:.1f} s\")\n    print(r1.final_output, r2.final_output, r3.final_output, sep=\"\\n\")\n\nasyncio.run(main())\n"
      },
      "checks": [
        {
          "zh": "第二个 Agent 的输入是第一个的 `final_output`",
          "en": "The second agent's input is the first one's `final_output`",
          "re": "Runner\\.run\\(\\s*explain_agent\\s*,\\s*\\w+\\.final_output\\s*\\)"
        },
        {
          "zh": "用 `await asyncio.gather(` 同时运行",
          "en": "Runs them at once with `await asyncio.gather(`",
          "re": "await\\s+asyncio\\.gather\\("
        },
        {
          "zh": "结果拆成 `r1, r2, r3`",
          "en": "Unpacks into `r1, r2, r3`",
          "re": "r1\\s*,\\s*r2\\s*,\\s*r3\\s*=\\s*await"
        },
        {
          "zh": "用 `time.time()` 计时",
          "en": "Times it with `time.time()`",
          "re": "=\\s*time\\.time\\(\\)"
        },
        {
          "zh": "定义了 `korean_agent`",
          "en": "Defines `korean_agent`",
          "re": "korean_agent\\s*=\\s*Agent\\("
        }
      ]
    },
    {
      "title": {
        "zh": "手写：前台交接",
        "en": "Write it: a front-desk handoff"
      },
      "task": {
        "zh": "写一个前台 `front_desk`：\n- 两个语言 Agent `chinese_agent`、`english_agent`，`name` 只用英文，各有一句 `handoff_description`\n- 前台的 instructions 写明「自己不回答，按用户的语言交接」，`handoffs` 里放两个语言 Agent\n- `main()` 里用 `Runner.run` 运行前台，打印 `result.last_agent.name` 和 `final_output`\n\n写完复制到 `practice` 文件夹里用 `.venv` 运行（会调用模型 2 次）。",
        "en": "Write a front desk `front_desk`:\n- two language agents, `chinese_agent` and `english_agent`, with English-only `name`s and a one-line `handoff_description` each\n- the front desk's instructions say “never answer yourself; hand over by the user's language”, and its `handoffs` hold the two language agents\n- in `main()` run the front desk with `Runner.run` and print `result.last_agent.name` and `final_output`\n\nThen copy it into the `practice` folder and run it with `.venv` (2 model calls)."
      },
      "starter": {
        "zh": "import asyncio\n\nfrom agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nmodel = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)\n\n# 1. chinese_agent 和 english_agent：name 只用英文，写上 handoff_description\n\n# 2. front_desk：自己不回答，按用户的语言交接；handoffs 里放两个语言 Agent\n\nasync def main():\n    # 3. 运行 front_desk，打印最后回答的 Agent 的名字和回答\n    pass\n\nasyncio.run(main())\n",
        "en": "import asyncio\n\nfrom agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nmodel = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)\n\n# 1. chinese_agent and english_agent: English-only names, each with a handoff_description\n\n# 2. front_desk: never answers; hands over by the user's language; handoffs = the two agents\n\nasync def main():\n    # 3. run front_desk and print the name of the agent that answered, plus the answer\n    pass\n\nasyncio.run(main())\n"
      },
      "solution": {
        "zh": "import asyncio\n\nfrom agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nmodel = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)\n\n# 1. chinese_agent 和 english_agent：name 只用英文，写上 handoff_description\nchinese_agent = Agent(name=\"chinese_agent\", handoff_description=\"只用中文回答问题\",\n                      instructions=\"Answer ONLY in Chinese.\", model=model)\nenglish_agent = Agent(name=\"english_agent\", handoff_description=\"Answers ONLY in English\",\n                      instructions=\"Answer ONLY in English.\", model=model)\n\n# 2. front_desk：自己不回答，按用户的语言交接；handoffs 里放两个语言 Agent\nfront_desk = Agent(\n    name=\"front_desk\",\n    instructions=\"你是前台。自己不回答问题，根据用户使用的语言把问题交接给合适的 Agent。\",\n    model=model,\n    handoffs=[chinese_agent, english_agent],\n)\n\nasync def main():\n    # 3. 运行 front_desk，打印最后回答的 Agent 的名字和回答\n    result = await Runner.run(front_desk, \"What is the capital of France?\")\n    print(result.last_agent.name)\n    print(result.final_output)\n\nasyncio.run(main())\n",
        "en": "import asyncio\n\nfrom agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled\nfrom llm import MODEL, async_client\n\nset_tracing_disabled(True)\nmodel = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)\n\n# 1. chinese_agent and english_agent: English-only names, each with a handoff_description\nchinese_agent = Agent(name=\"chinese_agent\", handoff_description=\"Answers ONLY in Chinese\",\n                      instructions=\"Answer ONLY in Chinese.\", model=model)\nenglish_agent = Agent(name=\"english_agent\", handoff_description=\"Answers ONLY in English\",\n                      instructions=\"Answer ONLY in English.\", model=model)\n\n# 2. front_desk: never answers; hands over by the user's language; handoffs = the two agents\nfront_desk = Agent(\n    name=\"front_desk\",\n    instructions=\"You are the front desk. Never answer yourself; hand the question to the agent matching the user's language.\",\n    model=model,\n    handoffs=[chinese_agent, english_agent],\n)\n\nasync def main():\n    # 3. run front_desk and print the name of the agent that answered, plus the answer\n    result = await Runner.run(front_desk, \"What is the capital of France?\")\n    print(result.last_agent.name)\n    print(result.final_output)\n\nasyncio.run(main())\n"
      },
      "checks": [
        {
          "zh": "语言 Agent 写了 `handoff_description`",
          "en": "The language agents have a `handoff_description`",
          "re": "handoff_description\\s*="
        },
        {
          "zh": "前台用 `handoffs=[...]` 列出两个语言 Agent",
          "en": "The front desk lists both language agents in `handoffs=[...]`",
          "re": "handoffs\\s*=\\s*\\[[^\\]]*chinese_agent[^\\]]*english_agent"
        },
        {
          "zh": "用 `await Runner.run(front_desk, ...)` 运行",
          "en": "Runs with `await Runner.run(front_desk, ...)`",
          "re": "await\\s+Runner\\.run\\(\\s*front_desk"
        },
        {
          "zh": "打印 `result.last_agent.name`",
          "en": "Prints `result.last_agent.name`",
          "re": "\\.last_agent\\.name"
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "Agent 的 `name` 用了中文：交接工具名里的中文全被换成下划线，几个 Agent 撞成同一个 `transfer_to_____`，SDK 只认列表里最后一个，模型怎么选都没用。`name` 只用英文字母、数字、下划线。",
      "en": "Chinese agent `name`s: the Chinese in the handoff tool names becomes underscores, several agents collide as `transfer_to_____`, and the SDK keeps only the last one in the list, whatever the model chooses. Use only letters, digits and underscores."
    },
    {
      "zh": "可交接的 Agent 没写 `handoff_description`：前台只知道名字，不知道谁擅长什么，就会乱交。",
      "en": "No `handoff_description` on the handoff targets: the front desk knows only names, not strengths, and hands over at random."
    },
    {
      "zh": "顺序编排时把用户的问题又传给了第二个 Agent，而不是 `r1.final_output`，两个 Agent 就没有关系了。",
      "en": "Passing the user's question to the second agent instead of `r1.final_output` in a sequence – then the two agents aren't connected at all."
    },
    {
      "zh": "把列表直接传给 `gather`：要写 `gather(a(), b(), c())` 或 `gather(*tasks)`；忘了 `await` 就拿不到结果。",
      "en": "Passing a list straight to `gather`: write `gather(a(), b(), c())` or `gather(*tasks)`; without `await` you get no results."
    },
    {
      "zh": "`Runner.run_streamed(...)` 前面加了 `await`：它返回的是一个对象，不是协程；要用 `async for` 遍历 `result.stream_events()`。",
      "en": "Putting `await` before `Runner.run_streamed(...)`: it returns an object, not a coroutine; loop over `result.stream_events()` with `async for`."
    },
    {
      "zh": "让每个 Agent 都「只交接、不回答」：会来回兜圈子，直到超过默认的 10 轮抛出 `MaxTurnsExceeded`。只有前台不回答，其他 Agent 负责完成任务。",
      "en": "Telling every agent to hand off and never answer: they circle until the default 10 turns run out and `MaxTurnsExceeded` is raised. Only the front desk holds back from answering; the other agents finish the job."
    },
    {
      "zh": "自己写的调度循环没有最大轮数：模型一旦走错或兜圈子，程序就不会停，还一直调用模型花钱。",
      "en": "A hand-written planner loop with no round limit: if the model goes wrong or circles, the program never stops and keeps paying for calls."
    },
    {
      "zh": "用 DeepSeek 时只写 `output_type=...`、没加第 11 节那行 `model_settings`（`json_object`）：请求会被 400 拒绝。要么加上那一行，要么像本节的评审一样把 schema 写进 instructions，再用 `model_validate_json` 自己校验。",
      "en": "Using `output_type=...` with DeepSeek without lesson 11's extra `model_settings` line (`json_object`): the request is rejected with a 400. Either add that line, or do as this lesson's judge does – put the schema in the instructions and validate with `model_validate_json` yourself."
    }
  ],
  "recap": [
    {
      "zh": "六种编排：顺序、并行靠 Python 本身；路由（交接）靠大模型判断；Agent 当工具、监督、护栏是 Agent 之间的其他配合关系。",
      "en": "Six patterns: sequential and parallel rely on Python itself; routing (handoffs) relies on the LLM's judgement; agents as tools, supervision and guardrails are further ways for agents to cooperate."
    },
    {
      "zh": "顺序：`r2 = await Runner.run(B, r1.final_output)`，上一个的输出就是下一个的输入。",
      "en": "Sequential: `r2 = await Runner.run(B, r1.final_output)` – one output is the next input."
    },
    {
      "zh": "并行：`r1, r2, r3 = await asyncio.gather(...)`，总用时约等于最慢的那个。",
      "en": "Parallel: `r1, r2, r3 = await asyncio.gather(...)`; the total time is about that of the slowest."
    },
    {
      "zh": "交接：前台 `handoffs=[...]`，每个目标写 `handoff_description`，`name` 只用英文；交接其实是一次 `transfer_to_<name>` 工具调用，接手的 Agent 直接回答，`result.last_agent` 就是它。",
      "en": "Handoffs: the front desk gets `handoffs=[...]`, each target gets a `handoff_description` and an English `name`; a handoff is a `transfer_to_<name>` tool call, the new agent answers directly, and `result.last_agent` is that agent."
    },
    {
      "zh": "排查交接：`Runner.run_streamed` + `async for event in result.stream_events()`，看 `handoff_requested` 和 `agent_updated_stream_event`。",
      "en": "Debugging handoffs: `Runner.run_streamed` + `async for event in result.stream_events()`, watching `handoff_requested` and `agent_updated_stream_event`."
    },
    {
      "zh": "pydantic 补充：有默认值的字段可以不填，没有的必填；`Field(description=...)` 和 `model_json_schema()` 把格式告诉模型，`model_validate_json` 校验结果。",
      "en": "More pydantic: fields with defaults are optional, others required; `Field(description=...)` and `model_json_schema()` tell the model the format, and `model_validate_json` checks the result."
    },
    {
      "zh": "调度循环：代码记状态、每轮问调度员、看 `last_agent` 判断交给了谁、收到结束信号就停、设最大轮数防死循环。",
      "en": "Planner loop: code keeps the state, asks the planner each round, checks `last_agent` to see who took over, stops on the end signal, and caps the rounds."
    }
  ],
  "files": [
    {
      "path": "practice/l12_orchestration_todo.py",
      "zh": "练习：补全顺序、并行（计时对比）和前台交接（打印流式事件）三部分（有 TODO 提示）。",
      "en": "Exercise: complete the sequential, parallel (with timing) and front-desk handoff (printing stream events) parts (with TODO hints)."
    },
    {
      "path": "practice/l12_orchestration_solution.py",
      "zh": "参考答案：视频演示的三种编排。顺序、并行、交接三部分都已用真实 DeepSeek 跑通；改 `PARTS` 可以只跑其中一部分。",
      "en": "Solution: the three patterns from the video. All three parts – sequential, parallel and handoffs – were run successfully with the real DeepSeek API; edit `PARTS` to run only some of them."
    },
    {
      "path": "practice/l12_number_game_todo.py",
      "zh": "练习：补全四个能力有限的 Agent、调度 Agent 和调度循环（有 TODO 提示）。",
      "en": "Exercise: complete the four limited agents, the planner and the planner loop (with TODO hints)."
    },
    {
      "path": "practice/l12_number_game_solution.py",
      "zh": "参考答案：按视频描述重写的「把 5 变成 23」，已用真实 DeepSeek 跑通（实测 5 → 12）。",
      "en": "Solution: the “turn 5 into 23” example rewritten from the video's description, tested with the real DeepSeek API (5 → 12)."
    },
    {
      "path": "practice/l12_judge_demo.py",
      "zh": "补充演示：写手 + 评审的「监督」循环，评审结论用 pydantic 校验，已用真实 DeepSeek 跑通。",
      "en": "Extra demo: a writer + judge supervision loop with the verdict validated by pydantic; run successfully with the real DeepSeek API."
    }
  ]
});
