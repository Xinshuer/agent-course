COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
 "id": "l56",
 "priority": "important",
 "handwrite": false,
 "studyMinutes": 20,
 "source": "subtitle",
 "summary": {
  "zh": "这一集在 55 节营销策划小组的基础上，只改了 `tasks.yaml`：给几个任务加上 `human_input: true`。运行时，这些任务的 Agent 交出答案后会停下来，在终端里等人给意见，再带着意见继续往下做。视频先讲了「人类反馈」是什么（比如聊天网页里的点赞、二选一），最后提到更好的做法是把反馈交给前端。本课用 CrewAI 1.15.23 复现：直接回车表示通过，输入意见会让 Agent 重写后再问你一次。",
  "en": "This episode builds on the marketing crew from lesson 55 and changes only `tasks.yaml`: a few tasks get `human_input: true`. At run time, once the agent of such a task hands in its answer, it stops and waits in the terminal for a person's feedback, then carries on with that feedback. The video first explains what human feedback is (for example the like button or the pick-one-of-two choice on chat websites), and at the end mentions that a better approach is to hand the feedback to a front end. This lesson reproduces it with CrewAI 1.15.23: pressing Enter on its own approves, while typing feedback makes the agent rewrite and then ask you again."
 },
 "goals": [
  {
   "zh": "说出人类反馈（human feedback）是什么，举出聊天产品里的例子和它面临的难点",
   "en": "Explain what human feedback is, with examples from chat products and the difficulties it faces"
  },
  {
   "zh": "像视频一样只改 YAML：给任务加 `human_input: true`；也会在 Python 里写 `Task(human_input=True)`",
   "en": "Change only the YAML, like the video: add `human_input: true` to a task; and write `Task(human_input=True)` in Python"
  },
  {
   "zh": "说清 1.15.23 的反馈循环：直接回车 = 通过；输入任何文字 = Agent 重写，再问一次",
   "en": "Explain the feedback loop in 1.15.23: just Enter = approve; any text = the agent rewrites and asks again"
  },
  {
   "zh": "知道通过 FastAPI 服务运行时，反馈面板出现在运行服务的那个终端里",
   "en": "Know that when running through the FastAPI service, the feedback panel appears in the terminal running the service"
  },
  {
   "zh": "知道视频提到的改进方向：把反馈交给前端（补充：Flow 的 `@human_feedback`）",
   "en": "Know the improvement the video mentions: hand the feedback to a front end (extra: Flow's `@human_feedback`)"
  }
 ],
 "blocks": [
  {
   "t": "h",
   "zh": "一、什么是人类反馈",
   "en": "1. What human feedback is"
  },
  {
   "t": "p",
   "zh": "[▶ 00:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=57&t=30) 人类反馈（human feedback）是指：人在评估、改进 AI 的过程中给出意见，用来帮助训练、优化和监督模型，尤其是大语言模型。有了这些意见，模型能更好地理解人的意图，回答更符合预期，也更少出错或产生有害内容。\n\n[▶ 01:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=57&t=95) 老师举的例子你一定见过：聊天网页有时一次给出两个回答，问你哪个更好；或者每条回答下面的点赞、点踩按钮——这本身就是在收集人类反馈。它在模型训练里最出名的用法叫 RLHF（基于人类反馈的强化学习）。",
   "en": "[▶ 00:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=57&t=30) Human feedback means the opinions people give while evaluating and improving AI, used to help train, optimise and supervise models, especially large language models. With this feedback, a model understands people's intentions better, gives answers closer to what they expect, and produces fewer mistakes and less harmful content.\n\n[▶ 01:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=57&t=95) You have surely seen the instructor's examples: a chat website sometimes gives two answers at once and asks which one is better, or puts like and dislike buttons under every answer – that in itself is collecting human feedback. Its best-known use in model training is called RLHF (reinforcement learning from human feedback)."
  },
  {
   "t": "p",
   "zh": "[▶ 02:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=57&t=126) 它也有难点：\n- **主观性**：不同的人对同一个回答可能判断不同。\n- **数量有限**：收集足够多的高质量反馈，要花大量时间和人力。\n- **一致性**：很难让每个人、每一次都按同一个标准给意见。",
   "en": "[▶ 02:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=57&t=126) It has its difficulties too:\n- **Subjectivity**: different people may judge the same answer differently.\n- **Limited quantity**: collecting enough high-quality feedback takes a lot of time and people.\n- **Consistency**: it is hard to get everyone, every time, to judge by the same standard."
  },
  {
   "t": "note",
   "zh": "这一集里的「人类反馈」不是去训练模型，而是在**任务运行过程中**让人插一句话：Agent 交出结果后先给人看，人可以确认、补充或纠正，Agent 再带着这些意见继续。LangGraph 部分用 `interrupt` 做过类似的「人在回路中」。",
   "en": "The “human feedback” in this episode is not about training a model: it lets a person chip in **while a task is running**. The agent shows its result to a person first, the person can confirm, add to or correct it, and the agent carries on with that feedback. The LangGraph part used `interrupt` for a similar “human-in-the-loop”."
  },
  {
   "t": "h",
   "zh": "二、改了什么：tasks.yaml 里加一行",
   "en": "2. What changed: one line in tasks.yaml"
  },
  {
   "t": "video",
   "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=57&t=0) 这一集的源码和上一集（55 节）一模一样，只在任务上加了一个参数；案例还是那个营销策划小组：首席市场分析师、首席营销战略师、首席创意内容创作者。\n\n[▶ 02:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=57&t=157) 老师打开 CrewAI 文档里 Task 的属性表，找到 `human_input`：任务执行时会等待人类反馈，[▶ 03:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=57&t=187) 再把反馈加进上下文，继续下一步。[▶ 03:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=57&t=218) 改动只在 `config/tasks.yaml` 里，`crew.py` 一行没动：给几个任务设置 `human_input: true`。运行到这些任务时，就会停下来等人输入。",
   "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=57&t=0) This episode's source code is exactly the same as the previous episode's (lesson 55), with just one extra parameter on the tasks; the case is still the marketing crew: the lead market analyst, the chief marketing strategist and the chief creative content creator.\n\n[▶ 02:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=57&t=157) The instructor opens the Task attribute table in the CrewAI docs and finds `human_input`: while the task runs it waits for human feedback, [▶ 03:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=57&t=187) then adds the feedback to the context and moves on to the next step. [▶ 03:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=57&t=218) The change is only in `config/tasks.yaml`, and not a single line of `crew.py` changed: a few tasks get `human_input: true`. When the run reaches those tasks, it stops and waits for a person's input."
  },
  {
   "t": "code",
   "file": {
    "zh": "practice/data/l56_tasks.yaml（节选）",
    "en": "practice/data/l56_tasks.yaml (excerpt)"
   },
   "lang": "yaml",
   "code": {
    "zh": "research_task:\n  description: >\n    围绕客户 {customer_domain} 做一次深入调研，分析它的产品和主要竞争对手……\n  expected_output: >\n    一份关于客户产品和竞争对手的完整报告……用中文，不超过 400 字。\n  agent: lead_market_analyst\n  human_input: true        # 分析报告先给人看\n\n# ……中间 3 个任务和 55 节完全一样……\n\ncopy_creation_task:\n  description: >\n    根据前面的活动设想，为项目「{project_description}」写一条社交媒体营销文案……\n  expected_output: >\n    一个 JSON 对象，只有两个字段：title（文案标题）和 body（文案正文，不超过 200 字）……\n  agent: creative_content_creator\n  human_input: true        # 最终文案也先给人看",
    "en": "research_task:\n  description: >\n    Do an in-depth study of the client {customer_domain}: analyse its products and main competitors...\n  expected_output: >\n    A complete report on the client's products and competitors... In Chinese, at most 400 characters.\n  agent: lead_market_analyst\n  human_input: true        # the analysis report is shown to a person first\n\n# ...the 3 tasks in between are exactly as in lesson 55...\n\ncopy_creation_task:\n  description: >\n    Based on the campaign ideas above, write one social media marketing post for the project “{project_description}”...\n  expected_output: >\n    A JSON object with only two fields: title (the headline of the copy) and body (the text of the copy, at most 200 characters)...\n  agent: creative_content_creator\n  human_input: true        # the final copy is shown to a person first too"
   }
  },
  {
   "t": "p",
   "zh": "YAML 里的 `true` 读进 Python 就是 `True`，`Task(config=...)` 会连同 `human_input` 一起读进去。所以 crew 类只需要把任务配置换成这个文件，其他和 55 节相同：",
   "en": "`true` in YAML becomes `True` in Python, and `Task(config=...)` reads `human_input` along with everything else. So the crew class only needs to point its task config at this file; everything else is the same as in lesson 55:"
  },
  {
   "t": "code",
   "file": {
    "zh": "practice/l56_human_feedback_solution.py（节选）",
    "en": "practice/l56_human_feedback_solution.py (excerpt)"
   },
   "code": {
    "zh": "@CrewBase\nclass ReviewedMarketingCrew:\n    agents_config = \"data/l55_agents.yaml\"   # Agent 和 55 节共用\n    tasks_config = \"data/l56_tasks.yaml\"     # ← 唯一的区别：带 human_input 的任务配置\n\n    # ……@agent、@task、@crew 方法和 55 节的 MarketingCrew 完全一样……\n\n\nif __name__ == \"__main__\":\n    my_crew = ReviewedMarketingCrew().crew()\n    print(\"要人工审核的任务：\", [t.name for t in my_crew.tasks if t.human_input])\n    result = my_crew.kickoff(inputs=INPUTS)\n    print(\"标题：\", result[\"title\"])",
    "en": "@CrewBase\nclass ReviewedMarketingCrew:\n    agents_config = \"data/l55_agents.yaml\"   # agents shared with lesson 55\n    tasks_config = \"data/l56_tasks.yaml\"     # ← the only difference: the task config with human_input\n\n    # ...the @agent, @task and @crew methods are exactly like lesson 55's MarketingCrew...\n\n\nif __name__ == \"__main__\":\n    my_crew = ReviewedMarketingCrew().crew()\n    print(\"Tasks that need human review:\", [t.name for t in my_crew.tasks if t.human_input])\n    result = my_crew.kickoff(inputs=INPUTS)\n    print(\"Title:\", result[\"title\"])"
   }
  },
  {
   "t": "p",
   "zh": "不用 YAML 时，同样的设置直接写在 `Task(...)` 上：`Task(description=..., expected_output=..., agent=analyst, human_input=True)`。注意它只属于 `Task`：写成 `Agent(..., human_input=True)` 或 `Crew(..., human_input=True)` **不会报错，但也不起作用**（本机验证过），运行时根本不会停下来。",
   "en": "Without YAML, put the same setting straight on `Task(...)`: `Task(description=..., expected_output=..., agent=analyst, human_input=True)`. Note that it belongs to `Task` only: writing `Agent(..., human_input=True)` or `Crew(..., human_input=True)` **raises no error but does nothing either** (verified on this machine) – the run never stops."
  },
  {
   "t": "h",
   "zh": "三、运行起来：在终端里给意见",
   "en": "3. Running it: giving feedback in the terminal"
  },
  {
   "t": "video",
   "zh": "[▶ 04:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=57&t=252) 演示流程和上一集一样：先启动 main 服务（还是 gpt-4o-mini，本机 8012 端口），[▶ 04:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=57&t=284) 再运行 apiTest，请求内容和上一集相同，地址和端口要对上。[▶ 05:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=57&t=317) 服务收到请求，首席市场分析师开始分析。\n\n[▶ 05:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=57&t=348) 分析师交出 EMQ 的产品介绍后，终端停下来请人反馈：觉得没问题就继续；觉得不够详细，可以补充一段文字，它会把这段文字带进上下文再往下做。老师输入了「继续」，[▶ 06:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=57&t=378) Agent 把这句话拼进上下文，接着思考、分析。[▶ 06:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=57&t=410) 他快进了后面的过程，其实中途停下来好几次，每次都要人给反馈。",
   "en": "[▶ 04:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=57&t=252) The demo goes just like the previous episode: first start the main service (still gpt-4o-mini, on local port 8012), [▶ 04:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=57&t=284) then run apiTest with the same request as last time – the address and port must match. [▶ 05:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=57&t=317) The service receives the request and the lead market analyst starts analysing.\n\n[▶ 05:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=57&t=348) Once the analyst hands in an introduction to EMQ's products, the terminal stops and asks for feedback: if it looks fine, carry on; if it isn't detailed enough, you can add some text, which it brings into the context before carrying on. The instructor typed “continue”, [▶ 06:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=57&t=378) and the agent added that sentence to the context and went on thinking and analysing. [▶ 06:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=57&t=410) He fast-forwards through the rest; in fact the run stopped several times along the way, each time waiting for human feedback."
  },
  {
   "t": "p",
   "zh": "在 CrewAI 1.15.23 里，终端里大致是这样（本课用 DeepSeek 实际运行过，这里做了简化）：",
   "en": "In CrewAI 1.15.23 the terminal looks roughly like this (run for real with DeepSeek for this lesson, simplified here):"
  },
  {
   "t": "code",
   "file": {
    "zh": "终端",
    "en": "terminal"
   },
   "lang": "text",
   "code": {
    "zh": "┌──────────── ✅ Agent Final Answer ────────────┐\n│  Agent: 首席市场分析师                        │\n│  Final Answer:                                │\n│  1. EMQX：开源 MQTT Broker，主打海量连接……    │\n│  2. 主要竞品：HiveMQ、Mosquitto……             │\n│  3. 国内开发者偏好：中文文档、活跃社区……      │\n└───────────────────────────────────────────────┘\n┌──────── 💬 Human Feedback Required ───────────┐\n│  Provide feedback on the Final Result above.  │\n│  • If you are happy with the result, simply   │\n│    hit Enter without typing anything.         │\n│  • Otherwise, provide specific improvement    │\n│    requests.                                  │\n│  • You can provide multiple rounds of         │\n│    feedback until satisfied.                  │\n└───────────────────────────────────────────────┘\n再加一条：和开源的 Mosquitto 做个对比      ← 你输入的意见，回车\nProcessing your feedback...\n（Agent 重写：出现新的 Final Answer，多了一条和 Mosquitto 的对比）\n（又出现一次反馈面板）\n                                           ← 这次直接回车 = 通过",
    "en": "┌──────────── ✅ Agent Final Answer ────────────┐\n│  Agent: Lead Market Analyst                   │\n│  Final Answer:                                │\n│  1. EMQX: open-source MQTT broker, at scale…  │\n│  2. Main rivals: HiveMQ, Mosquitto…           │\n│  3. Devs in China: Chinese docs, community…   │\n└───────────────────────────────────────────────┘\n┌──────── 💬 Human Feedback Required ───────────┐\n│  Provide feedback on the Final Result above.  │\n│  • If you are happy with the result, simply   │\n│    hit Enter without typing anything.         │\n│  • Otherwise, provide specific improvement    │\n│    requests.                                  │\n│  • You can provide multiple rounds of         │\n│    feedback until satisfied.                  │\n└───────────────────────────────────────────────┘\nAdd one more point: compare it with open-source Mosquitto   ← your feedback, then Enter\nProcessing your feedback...\n(The agent rewrites: a new Final Answer appears, with an extra comparison with Mosquitto)\n(The feedback panel appears again)\n                                                            ← this time just Enter = approve"
   }
  },
  {
   "t": "p",
   "zh": "看 1.15.23 的源码，这个循环是这样转的：\n1. Agent 得到最终答案（Final Answer）。\n2. 终端显示黄色的反馈面板，用 Python 的 `input()` 等你输入（回顾 06 节）。\n3. **输入为空**（直接回车）→ 结束，当前答案就是这个任务的结果，小组继续下一个任务。\n4. **输入不为空** → 屏幕显示 `Processing your feedback...`，CrewAI 往这个 Agent 的对话记录里加一条消息：`User feedback: 你的意见`，再附一句英文指令，大意是「用这条意见改进下一版输出，不要回应或评论」，然后让 Agent 重新回答 → 回到第 2 步。\n\n所以可以改好几轮，每一轮都会**再调用一次模型**。本课实测：第一版给了 3 条要点；输入「再加一条：和开源的 Mosquitto 做个对比」后，第二版变成 4 条，最后一条正是两者的对比（意见比任务里写的「3 条」优先）；再直接回车，任务结束，一共 2 次模型调用。",
   "en": "Reading the 1.15.23 source code, the loop goes like this:\n1. The agent gets its final answer (Final Answer).\n2. The terminal shows the yellow feedback panel and waits for your input with Python's `input()` (see lesson 06).\n3. **Empty input** (just Enter) → done: the current answer is this task's result, and the crew moves on to the next task.\n4. **Non-empty input** → the screen shows `Processing your feedback...`, and CrewAI adds a message to this agent's conversation – `User feedback: your feedback` – plus an English instruction that roughly says “use this feedback to improve the next version of the output; don't reply to it or comment on it”, then has the agent answer again → back to step 2.\n\nSo you can go several rounds, and every round **calls the model once more**. Tested for this lesson: the first version gave 3 points; after typing “Add one more point: compare it with open-source Mosquitto”, the second version had 4 points, the last one being exactly that comparison (the feedback outranks the “3 points” written in the task); then pressing Enter on its own ended the task – 2 model calls in total."
  },
  {
   "t": "warn",
   "zh": "视频里老师输入「继续」来表示没问题。在 1.15.23 里，**任何非空输入都算修改意见**：输入「继续」「OK」「好」，Agent 都会再重写一版、再问你一次。想通过就什么都不输入，**直接回车**。",
   "en": "In the video the instructor typed “continue” to say all was well. In 1.15.23, **any non-empty input counts as revision feedback**: type “continue”, “OK” or “good”, and the agent writes another version and asks you again. To approve, type nothing and **just press Enter**."
  },
  {
   "t": "py",
   "title": {
    "zh": "用 Python 模拟反馈循环（回顾 06 节）",
    "en": "Simulating the feedback loop in Python (see lesson 06)"
   },
   "zh": "这段不调用模型，只用 06 节的 `while True`、`input()`、`break` 和 07 节的 `try/except`，把上面的循环写出来。在网页里运行时会弹出输入框：输入意见就进入下一版，什么都不填直接点「确定」表示通过（点「取消」也会结束）。",
   "en": "This snippet calls no model: it writes out the loop above using only `while True`, `input()` and `break` from lesson 06 and `try/except` from lesson 07. When run in the browser, an input box pops up: type feedback to get the next version; leave it empty and click “OK” to approve (clicking “Cancel” also ends it).",
   "code": {
    "zh": "def revise(draft, feedback):\n    # 真实的 CrewAI 会把意见交给模型，让 Agent 重写；这里只把意见记在草稿后面\n    return draft + f\"（已按意见修改：{feedback}）\"\n\ndraft = \"调研要点：EMQX 主打海量设备连接\"\nrounds = 0\nwhile True:                                  # 和 CrewAI 一样：一直问，直到你直接回车\n    print(\"当前版本：\", draft)\n    try:\n        feedback = input(\"修改意见（直接回车 = 通过）：\")\n    except EOFError:                         # 网页里点「取消」\n        feedback = \"\"\n    if feedback.strip() == \"\":               # 空输入 → 通过\n        print(\"通过！\")\n        break\n    rounds += 1\n    draft = revise(draft, feedback)          # 有意见 → 重写，再问一次\n\nprint(f\"最终结果：{draft}\")\nprint(f\"提了 {rounds} 轮意见，这个任务一共调用模型 {rounds + 1} 次\")",
    "en": "def revise(draft, feedback):\n    # Real CrewAI hands the feedback to the model and the agent rewrites; here we just note it after the draft\n    return draft + f\" (revised as requested: {feedback})\"\n\ndraft = \"Research point: EMQX is built for massive numbers of device connections\"\nrounds = 0\nwhile True:                                  # like CrewAI: keep asking until you just press Enter\n    print(\"Current version:\", draft)\n    try:\n        feedback = input(\"Feedback (just Enter = approve): \")\n    except EOFError:                         # \"Cancel\" clicked in the browser\n        feedback = \"\"\n    if feedback.strip() == \"\":               # empty input → approved\n        print(\"Approved!\")\n        break\n    rounds += 1\n    draft = revise(draft, feedback)          # feedback → rewrite, then ask again\n\nprint(f\"Final result: {draft}\")\nprint(f\"{rounds} round(s) of feedback, so this task called the model {rounds + 1} time(s)\")"
   }
  },
  {
   "t": "check",
   "q": {
    "zh": "反馈面板出现后，你什么都不输入，直接按回车，会发生什么？",
    "en": "When the feedback panel appears and you just press Enter without typing anything, what happens?"
   },
   "options": [
    {
     "zh": "Agent 再重新回答一次",
     "en": "The agent answers again"
    },
    {
     "zh": "当前答案被接受，小组继续下一个任务",
     "en": "The current answer is accepted and the crew moves on to the next task"
    },
    {
     "zh": "程序报错退出",
     "en": "The program exits with an error"
    },
    {
     "zh": "任务被跳过，结果为空",
     "en": "The task is skipped and its result is empty"
    }
   ],
   "answer": 1,
   "explain": {
    "zh": "空输入就是「满意」，循环结束；只有输入了文字，Agent 才会重写。",
    "en": "Empty input means “satisfied” and the loop ends; the agent rewrites only when you type something."
   }
  },
  {
   "t": "h",
   "zh": "四、像视频一样通过服务运行",
   "en": "4. Running it through the service, like the video"
  },
  {
   "t": "p",
   "zh": "视频是通过 main 服务 + apiTest 来跑的。这时 crew 在**服务那一边**运行，反馈面板出现在**运行服务的那个终端**里；发请求的 apiTest 一直等着，直到你把所有需要审核的任务都处理完，才收到最终的 JSON。本课的文件也能这样跑：\n1. 在 `l55_marketing_api.py` 里把导入换成 `from l56_human_feedback_solution import ReviewedMarketingCrew as MarketingCrew`\n2. 第一个终端启动服务，第二个终端运行 `l55_api_client.py`（它的 `timeout` 设成了 1800 秒，留足审核时间）\n3. 回到第一个终端给意见\n\n本课用一个不联网的假模型验证过这条路：客户端一直在等；服务终端里先后出现 3 次反馈面板（第 1 个任务提意见后重写又问一次，最后一个任务问一次），处理完后客户端收到 200 和 JSON。",
   "en": "The video runs it through the main service + apiTest. The crew then runs **on the service side**, and the feedback panel appears in **the terminal running the service**; apiTest, which sent the request, keeps waiting and only receives the final JSON once you have dealt with every task that needs review. This lesson's files can run this way too:\n1. In `l55_marketing_api.py`, change the import to `from l56_human_feedback_solution import ReviewedMarketingCrew as MarketingCrew`\n2. Start the service in a first terminal, and run `l55_api_client.py` in a second one (its `timeout` is set to 1800 seconds, leaving plenty of time for review)\n3. Go back to the first terminal to give feedback\n\nThis lesson verified this path with an offline fake model: the client kept waiting; the service terminal showed the feedback panel 3 times (for the first task, once more after the feedback made it rewrite, and once for the last task), and once everything was handled the client received 200 and the JSON."
  },
  {
   "t": "warn",
   "zh": "- **要在能输入的终端里运行**（VS Code 的终端可以）。`human_input` 靠的是服务器终端里的 `input()`；真正部署出去的服务没人守在服务器终端前，请求会一直卡住。它适合本地调试。\n- **打开 `verbose=True`**：Agent 的答案只在详细日志里显示。关掉的话，你看不到答案，却被要求「对上面的结果给出反馈」。\n- **只给关键任务加**：每个带 `human_input` 的任务都会停下来等你，每轮意见都多一次模型调用。意见要具体，「再加一条和 Mosquitto 的对比」比「不太好」有用得多。",
   "en": "- **Run it in a terminal you can type into** (VS Code's terminal works). `human_input` relies on `input()` in the server's terminal; a service that is actually deployed has nobody sitting at the server terminal, so the request hangs forever. It is meant for local debugging.\n- **Turn on `verbose=True`**: the agent's answer only shows up in the detailed log. With it off, you can't see the answer but are still asked to “provide feedback on the result above”.\n- **Add it only to key tasks**: every task with `human_input` stops and waits for you, and every round of feedback costs one more model call. Make your feedback specific: “add a comparison with Mosquitto” is far more useful than “not great”."
  },
  {
   "t": "h",
   "zh": "五、视频提到的改进方向：把反馈交给前端",
   "en": "5. The improvement the video mentions: hand the feedback to a front end"
  },
  {
   "t": "video",
   "zh": "[▶ 07:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=57&t=442) 老师指出这次演示的不足：反馈是在打印日志的终端里给的。另一种方案是监听任务的事件，通过 WebSocket 等方式发给前端，让用户在网页上给意见，再把意见交回任务，任务收到后继续执行。[▶ 07:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=57&t=473) 他说以后有空再专门做一期。最后总结：这个功能很简单，但实际项目里需要人工干预、补充知识时很有用。",
   "en": "[▶ 07:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=57&t=442) The instructor points out the demo's weakness: the feedback is given in the terminal that prints the logs. Another approach is to listen to the task's events and send them to a front end via WebSocket or similar, let the user give feedback on a web page, then hand the feedback back to the task, which carries on once it receives it. [▶ 07:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=57&t=473) He says he will make a dedicated episode about it when he has time. His summary: the feature is very simple, but very useful in real projects that need human intervention or extra knowledge."
  },
  {
   "t": "note",
   "zh": "补充（视频没有演示，CrewAI 1.15.23 里的做法）：\n- `Task(human_input=True)` 的「找人要意见」这一步可以替换：`crewai.core.providers.human_input` 里有 `set_provider()`，可以换成自己写的提供者，比如把答案发到网页、等网页传回意见。\n- **Flow**（57、58 节讲）的方法上可以加 `@human_feedback(message=...)`：方法执行完后请人给意见，意见交给**你的代码**决定下一步，Agent 不会自动重写；它的 `provider=` 参数同样能把终端换成网页、聊天工具等。下面是一个不调用模型的小例子（`practice/l56_flow_feedback.py`，本机运行过）：",
   "en": "Extra (not shown in the video; how it works in CrewAI 1.15.23):\n- The “ask a person for feedback” step of `Task(human_input=True)` can be replaced: `crewai.core.providers.human_input` has `set_provider()`, which lets you plug in a provider you wrote yourself – for example one that sends the answer to a web page and waits for the page to send the feedback back.\n- Methods of a **Flow** (lessons 57 and 58) can take `@human_feedback(message=...)`: after the method runs, a person is asked for feedback, and the feedback goes to **your code**, which decides what happens next – the agent does not rewrite automatically; its `provider=` parameter can likewise swap the terminal for a web page, a chat tool and so on. Here is a small example that calls no model (`practice/l56_flow_feedback.py`, run on this machine):"
  },
  {
   "t": "code",
   "file": {
    "zh": "practice/l56_flow_feedback.py（节选）",
    "en": "practice/l56_flow_feedback.py (excerpt)"
   },
   "code": {
    "zh": "from crewai.flow import Flow, human_feedback, listen, start\n\n\nclass PlanFlow(Flow):\n    @start()\n    @human_feedback(message=\"请审核这份方案（直接回车 = 通过）：\")\n    def draft_plan(self):\n        return \"周六 10:00 西湖骑行，下午茶馆桌游，人均 140 元\"   # 真实项目里通常是运行一个 Crew\n\n    @listen(draft_plan)\n    def after_review(self, result):\n        # result.output 是原来的输出，result.feedback 是你输入的文字\n        if result.feedback.strip():\n            print(\"收到修改意见：\", result.feedback)\n        else:\n            print(\"方案通过：\", result.output)\n\n\nPlanFlow().kickoff()",
    "en": "from crewai.flow import Flow, human_feedback, listen, start\n\n\nclass PlanFlow(Flow):\n    @start()\n    @human_feedback(message=\"Please review this plan (just Enter = approve):\")\n    def draft_plan(self):\n        return \"Saturday 10:00 cycling by West Lake, board games in a teahouse in the afternoon, 140 yuan per person\"   # in a real project this usually runs a Crew\n\n    @listen(draft_plan)\n    def after_review(self, result):\n        # result.output is the original output, result.feedback is the text you typed\n        if result.feedback.strip():\n            print(\"Got revision feedback:\", result.feedback)\n        else:\n            print(\"Plan approved:\", result.output)\n\n\nPlanFlow().kickoff()"
   }
  },
  {
   "t": "p",
   "zh": "| | `Task(human_input=True)` | Flow 的 `@human_feedback` |\n|---|---|---|\n| 写在哪 | 任务上（YAML 或 Python） | Flow 的方法上 |\n| 意见交给谁 | Agent，自动重写 | 你的代码，自己决定 |\n| 问几次 | 直到你直接回车 | 方法每执行一次问一次 |\n| 适合 | 让 Agent 改到满意 | 审批、分支（通过 / 驳回） |",
   "en": "| | `Task(human_input=True)` | Flow's `@human_feedback` |\n|---|---|---|\n| Where it goes | On a task (YAML or Python) | On a Flow method |\n| Who gets the feedback | The agent, which rewrites automatically | Your code, which decides |\n| How often it asks | Until you just press Enter | Once each time the method runs |\n| Good for | Having the agent revise until you're satisfied | Approvals, branching (approve / reject) |"
  }
 ],
 "quiz": [
  {
   "q": {
    "zh": "下面哪一个是视频里举的「人类反馈」的例子？",
    "en": "Which of these is an example of “human feedback” given in the video?"
   },
   "options": [
    {
     "zh": "模型自己检查自己的回答",
     "en": "The model checks its own answer"
    },
    {
     "zh": "把对话记录保存到数据库",
     "en": "Saving the conversation history to a database"
    },
    {
     "zh": "给模型换一个更大的版本",
     "en": "Switching the model to a bigger version"
    },
    {
     "zh": "聊天网页给出两个回答让你选更好的那个，或者点赞、点踩",
     "en": "A chat website shows two answers and lets you pick the better one, or you click like or dislike"
    }
   ],
   "answer": 3,
   "explain": {
    "zh": "用户对回答的选择和点赞点踩，就是人类在评估模型输出、给出反馈；训练里最出名的用法是 RLHF。",
    "en": "Users choosing between answers and clicking like or dislike are people evaluating the model's output and giving feedback; its best-known use in training is RLHF."
   }
  },
  {
   "q": {
    "zh": "视频为了加上人类反馈，改了项目里的什么？",
    "en": "What did the video change in the project to add human feedback?"
   },
   "options": [
    {
     "zh": "只改了 `tasks.yaml`：给几个任务加上 `human_input: true`",
     "en": "It changed only `tasks.yaml`: a few tasks got `human_input: true`"
    },
    {
     "zh": "改了 `crew.py`，给每个 Agent 加上 `human_input=True`",
     "en": "It changed `crew.py`, giving every agent `human_input=True`"
    },
    {
     "zh": "在 main 服务里加了一个新接口",
     "en": "It added a new endpoint to the main service"
    },
    {
     "zh": "换了一个支持人类反馈的模型",
     "en": "It switched to a model that supports human feedback"
    }
   ],
   "answer": 0,
   "explain": {
    "zh": "源码和上一集一样，只在任务配置里加了一个属性，`crew.py` 一行没动。",
    "en": "The source is the same as in the previous episode, plus one attribute in the task config; not a single line of `crew.py` changed."
   }
  },
  {
   "q": {
    "zh": "在 CrewAI 1.15.23 里，反馈面板出现后直接按回车（不输入任何文字），会怎样？",
    "en": "In CrewAI 1.15.23, what happens if you just press Enter (typing nothing) when the feedback panel appears?"
   },
   "options": [
    {
     "zh": "Agent 再重写一次",
     "en": "The agent rewrites once more"
    },
    {
     "zh": "当前答案被接受，小组继续下一个任务",
     "en": "The current answer is accepted and the crew moves on to the next task"
    },
    {
     "zh": "程序报错退出",
     "en": "The program exits with an error"
    },
    {
     "zh": "整个 Crew 从头再跑一遍",
     "en": "The whole Crew runs again from the start"
    }
   ],
   "answer": 1,
   "explain": {
    "zh": "空输入表示满意，循环结束；只有输入了文字才会触发重写。",
    "en": "Empty input means you are satisfied and the loop ends; only typed text triggers a rewrite."
   }
  },
  {
   "q": {
    "zh": "像视频一样在面板里输入「继续」，在 1.15.23 里会发生什么？",
    "en": "What happens in 1.15.23 if you type “continue” in the panel, as in the video?"
   },
   "options": [
    {
     "zh": "等同于直接回车，任务马上通过",
     "en": "The same as just pressing Enter: the task is approved right away"
    },
    {
     "zh": "报错：意见不能是中文",
     "en": "An error: feedback can't be in Chinese"
    },
    {
     "zh": "「继续」也算修改意见：Agent 带着它重写一版，然后再问你一次",
     "en": "“continue” counts as revision feedback too: the agent writes a new version with it, then asks you again"
    },
    {
     "zh": "跳过后面所有需要审核的任务",
     "en": "All the later tasks that need review are skipped"
    }
   ],
   "answer": 2,
   "explain": {
    "zh": "任何非空输入都会以 `User feedback: ...` 加进对话并让 Agent 重新回答；想通过就直接回车。",
    "en": "Any non-empty input is added to the conversation as `User feedback: ...` and the agent answers again; to approve, just press Enter."
   }
  },
  {
   "q": {
    "zh": "像视频一样通过 FastAPI 服务 + apiTest 运行，反馈面板会出现在哪里？",
    "en": "When you run it through the FastAPI service + apiTest like the video, where does the feedback panel appear?"
   },
   "options": [
    {
     "zh": "运行服务的那个终端里，apiTest 会一直等到审核完",
     "en": "In the terminal running the service; apiTest keeps waiting until the review is done"
    },
    {
     "zh": "运行 apiTest 的那个终端里",
     "en": "In the terminal running apiTest"
    },
    {
     "zh": "浏览器的 `/docs` 页面上",
     "en": "On the browser's `/docs` page"
    },
    {
     "zh": "哪里都不会出现，服务里 `human_input` 自动失效",
     "en": "Nowhere – `human_input` is switched off automatically inside a service"
    }
   ],
   "answer": 0,
   "explain": {
    "zh": "crew 在服务那一边运行，`input()` 读的是服务终端；客户端只是在等最终结果，所以 timeout 要设得很长。",
    "en": "The crew runs on the service side, so `input()` reads from the service's terminal; the client only waits for the final result, which is why its timeout must be long."
   }
  },
  {
   "q": {
    "zh": "对同一个任务，你提了 3 轮意见才直接回车通过。这个任务大约调用了几次模型（不算工具调用）？",
    "en": "For one task you give 3 rounds of feedback before approving with just Enter. About how many model calls did this task make (not counting tool calls)?"
   },
   "options": [
    {
     "zh": "1 次",
     "en": "1 call"
    },
    {
     "zh": "3 次",
     "en": "3 calls"
    },
    {
     "zh": "4 次",
     "en": "4 calls"
    },
    {
     "zh": "6 次",
     "en": "6 calls"
    }
   ],
   "answer": 2,
   "explain": {
    "zh": "第一次回答 1 次，加上每轮意见各重写 1 次：1 + 3 = 4。",
    "en": "1 call for the first answer, plus 1 rewrite per round of feedback: 1 + 3 = 4."
   }
  }
 ],
 "fill": [
  {
   "title": {
    "zh": "给任务加上人工审核（Python 写法）",
    "en": "Add human review to a task (the Python way)"
   },
   "code": {
    "zh": "research_task = Task(\n    description=\"围绕客户 {customer_domain} 做调研，分析它的产品和主要竞争对手。项目：{project_description}\",\n    expected_output=\"3 条调研要点\",\n    agent=analyst,\n    [[human_input]]=[[True]],\n)\ncrew = Crew(agents=[analyst], tasks=[research_task], [[verbose]]=True)\nresult = crew.[[kickoff]](inputs={\"customer_domain\": \"emqx.com\", \"project_description\": \"推广 EMQX\"})\nprint(result.[[raw]])",
    "en": "research_task = Task(\n    description=\"Research the customer {customer_domain}, analysing its products and main competitors. Project: {project_description}\",\n    expected_output=\"3 research points\",\n    agent=analyst,\n    [[human_input]]=[[True]],\n)\ncrew = Crew(agents=[analyst], tasks=[research_task], [[verbose]]=True)\nresult = crew.[[kickoff]](inputs={\"customer_domain\": \"emqx.com\", \"project_description\": \"Promote EMQX\"})\nprint(result.[[raw]])"
   },
   "explain": {
    "zh": "`human_input=True` 写在 `Task` 上（YAML 里是 `human_input: true`）；`verbose=True` 才能看到要审核的答案；`result.raw` 是你通过的那一版。",
    "en": "`human_input=True` goes on `Task` (in YAML it is `human_input: true`); `verbose=True` is what lets you see the answer under review; `result.raw` is the version you approved."
   }
  }
 ],
 "write": [
  {
   "title": {
    "zh": "手写：让调研任务先给人审核",
    "en": "Write it: have a person review the research task first"
   },
   "task": {
    "zh": "补全代码（`analyst` 已经写好）：\n1. 创建任务 `research_task`：描述里用 `{customer_domain}` 和 `{project_description}` 两个占位符，交给 `analyst`，并让它在定稿前等你审核\n2. 组建 Crew，确保你能在终端里看到 Agent 的答案\n3. 用 `kickoff(inputs={...})` 启动，打印 `result.raw`\n\n这段代码要在终端里和你互动。本课实际运行过参考答案：第一次输入一条意见，第二次直接回车，共 2 次模型调用。想练视频的 YAML 写法，就做 `practice/l56_human_feedback_todo.py`（只需要改 `data/l56_tasks_todo.yaml`）。",
    "en": "Complete the code (`analyst` is already written):\n1. Create the task `research_task`: use the two placeholders `{customer_domain}` and `{project_description}` in its description, give it to `analyst`, and make it wait for your review before it is final\n2. Build the Crew, making sure you can see the agent's answer in the terminal\n3. Start it with `kickoff(inputs={...})` and print `result.raw`\n\nThis code interacts with you in the terminal. The reference solution was actually run for this lesson: one piece of feedback the first time, just Enter the second time, 2 model calls in total. To practise the video's YAML way, do `practice/l56_human_feedback_todo.py` (you only need to edit `data/l56_tasks_todo.yaml`)."
   },
   "starter": {
    "zh": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import Agent, Crew, Process, Task\nfrom l55_deepseek_llm import llm\n\nanalyst = Agent(\n    role=\"首席市场分析师\",\n    goal=\"深入分析客户的产品和竞争对手，为营销战略提供专业指导\",\n    backstory=\"你任职于一家一流的数字营销公司，擅长从产品和竞争对手身上看出关键信息。\",\n    llm=llm,\n)\n\n# 1. 调研任务 research_task：描述里用客户网址和项目说明两个占位符，交给 analyst，\n#    定稿前先交给人审核\n\n\n# 2. 组建 Crew：要能在终端里看到 Agent 的答案\n\n\n# 3. 启动（客户网址 emqx.com，项目说明自己写一句），打印你审核通过的那一版\n",
    "en": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import Agent, Crew, Process, Task\nfrom l55_deepseek_llm import llm\n\nanalyst = Agent(\n    role=\"Lead Market Analyst\",\n    goal=\"Analyse the customer's products and competitors in depth and give expert guidance for the marketing strategy\",\n    backstory=\"You work at a top digital marketing firm and are good at spotting the key information in products and competitors.\",\n    llm=llm,\n)\n\n# 1. Research task research_task: use the customer website and the project description as two placeholders\n#    in its description, give it to analyst, and have a person review it before it is final\n\n\n# 2. Build the Crew: you must be able to see the agent's answer in the terminal\n\n\n# 3. Start it (customer website emqx.com, write a one-sentence project description yourself), print the version you approved\n"
   },
   "solution": {
    "zh": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import Agent, Crew, Process, Task\nfrom l55_deepseek_llm import llm\n\nanalyst = Agent(\n    role=\"首席市场分析师\",\n    goal=\"深入分析客户的产品和竞争对手，为营销战略提供专业指导\",\n    backstory=\"你任职于一家一流的数字营销公司，擅长从产品和竞争对手身上看出关键信息。\",\n    llm=llm,\n)\n\n# 1. 调研任务：交给 analyst，定稿前先交给人审核\nresearch_task = Task(\n    description=\"围绕客户 {customer_domain} 做调研，分析它的产品和主要竞争对手。项目：{project_description}\",\n    expected_output=\"3 条调研要点，每条不超过 40 个字。\",\n    agent=analyst,\n    human_input=True,\n)\n\n# 2. 组建 Crew：打开 verbose，才能看到要审核的答案\ncrew = Crew(agents=[analyst], tasks=[research_task], process=Process.sequential, verbose=True)\n\n# 3. 启动，打印你审核通过的那一版\nresult = crew.kickoff(inputs={\n    \"customer_domain\": \"emqx.com\",\n    \"project_description\": \"为 EMQX 策划一次面向国内物联网开发者的推广活动\",\n})\nprint(result.raw)",
    "en": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import Agent, Crew, Process, Task\nfrom l55_deepseek_llm import llm\n\nanalyst = Agent(\n    role=\"Lead Market Analyst\",\n    goal=\"Analyse the customer's products and competitors in depth and give expert guidance for the marketing strategy\",\n    backstory=\"You work at a top digital marketing firm and are good at spotting the key information in products and competitors.\",\n    llm=llm,\n)\n\n# 1. Research task: give it to analyst, have a person review it before it is final\nresearch_task = Task(\n    description=\"Research the customer {customer_domain}, analysing its products and main competitors. Project: {project_description}\",\n    expected_output=\"3 research points, each at most 40 words.\",\n    agent=analyst,\n    human_input=True,\n)\n\n# 2. Build the Crew: turn on verbose so you can see the answer under review\ncrew = Crew(agents=[analyst], tasks=[research_task], process=Process.sequential, verbose=True)\n\n# 3. Start it and print the version you approved\nresult = crew.kickoff(inputs={\n    \"customer_domain\": \"emqx.com\",\n    \"project_description\": \"Plan a promotion of EMQX aimed at IoT developers in China\",\n})\nprint(result.raw)"
   },
   "checks": [
    {
     "zh": "创建了任务 `research_task = Task(...)`",
     "en": "Creates the task `research_task = Task(...)`",
     "re": "research_task\\s*=\\s*Task\\("
    },
    {
     "zh": "任务描述里用了 `{customer_domain}` 占位符",
     "en": "Uses the `{customer_domain}` placeholder in the task description",
     "re": "\\{customer_domain\\}"
    },
    {
     "zh": "任务交给 `analyst`",
     "en": "Gives the task to `analyst`",
     "re": "agent\\s*=\\s*analyst"
    },
    {
     "zh": "加上 `human_input=True`",
     "en": "Adds `human_input=True`",
     "re": "human_input\\s*=\\s*True"
    },
    {
     "zh": "Crew 打开了 `verbose=True`",
     "en": "The Crew turns on `verbose=True`",
     "re": "Crew\\([^)]*verbose\\s*=\\s*True"
    },
    {
     "zh": "`kickoff(inputs={...})` 启动",
     "en": "Starts with `kickoff(inputs={...})`",
     "re": "kickoff\\(\\s*inputs\\s*=\\s*\\{"
    },
    {
     "zh": "打印 `result.raw`",
     "en": "Prints `result.raw`",
     "re": "print\\(\\s*result\\.raw\\s*\\)"
    }
   ]
  }
 ],
 "pitfalls": [
  {
   "zh": "把 `human_input=True` 写在 `Agent` 或 `Crew` 上：不会报错，但也不起作用，运行时不会停下来。它是 `Task` 的参数。",
   "en": "Putting `human_input=True` on `Agent` or `Crew`: no error, but no effect either – the run never stops. It is a parameter of `Task`."
  },
  {
   "zh": "YAML 写错（本机验证）：拼成 `human_input: ture`，创建任务时报 `Input should be a valid boolean`；顶格写、没和 `agent:` 对齐，它会被当成另一个任务配置，创建 crew 时报 `AttributeError: 'bool' object has no attribute 'get'`。改完先打印 `[t.name for t in crew.tasks if t.human_input]` 检查。",
   "en": "YAML mistakes (verified on this machine): spelling it `human_input: ture` fails when the task is created, with `Input should be a valid boolean`; writing it at the start of the line instead of aligned with `agent:` makes it count as another task config, and creating the crew fails with `AttributeError: 'bool' object has no attribute 'get'`. After editing, print `[t.name for t in crew.tasks if t.human_input]` to check."
  },
  {
   "zh": "想「通过」却随手输入了「继续」「OK」——任何非空输入都会触发重写；通过要**直接回车**。",
   "en": "Meaning to “approve” but casually typing “continue” or “OK” – any non-empty input triggers a rewrite; to approve, **just press Enter**."
  },
  {
   "zh": "没开 `verbose=True`，看不到答案却被要求给反馈。",
   "en": "Not turning on `verbose=True`: you are asked for feedback without seeing the answer."
  },
  {
   "zh": "在真正部署的服务或后台任务里用 `human_input`：没人在服务器终端前输入，请求一直卡住。",
   "en": "Using `human_input` in a service that is actually deployed, or in a background job: nobody is at the server terminal to type, so the request hangs forever."
  },
  {
   "zh": "通过服务运行时，客户端的 `timeout` 太短：你还在审核，客户端已经超时报错。",
   "en": "Running through the service with a client `timeout` that is too short: while you are still reviewing, the client has already timed out with an error."
  },
  {
   "zh": "意见太笼统（「不太好」），Agent 只能瞎改，白白多花一次调用。",
   "en": "Vague feedback (“not great”): the agent can only guess at what to change, and a call is wasted."
  }
 ],
 "recap": [
  {
   "zh": "人类反馈：人在评估、改进 AI 时给出的意见（点赞点踩、二选一、RLHF）；难点是主观、量少、不一致。",
   "en": "Human feedback: the opinions people give while evaluating and improving AI (like/dislike, pick one of two, RLHF); the difficulties are subjectivity, small quantity and inconsistency."
  },
  {
   "zh": "视频只改了 `tasks.yaml`：给需要审核的任务加 `human_input: true`；Python 里写 `Task(human_input=True)`。",
   "en": "The video only changed `tasks.yaml`: add `human_input: true` to the tasks that need review; in Python, write `Task(human_input=True)`."
  },
  {
   "zh": "1.15.23：直接回车 = 通过；输入任何文字 = Agent 带着 `User feedback` 重写，再问一次；每轮多一次模型调用。",
   "en": "1.15.23: just Enter = approve; any text = the agent rewrites with it as `User feedback` and asks again; every round costs one more model call."
  },
  {
   "zh": "配合 `verbose=True` 使用；通过服务运行时，反馈在服务终端里给，客户端要设长超时。",
   "en": "Use it together with `verbose=True`; when running through the service, the feedback is given in the service's terminal and the client needs a long timeout."
  },
  {
   "zh": "更好的做法是把反馈交给前端；1.15.23 里可以换 human input 提供者，或用 Flow 的 `@human_feedback`。",
   "en": "The better way is to hand the feedback to a front end; in 1.15.23 you can swap the human input provider, or use Flow's `@human_feedback`."
  }
 ],
 "files": [
  {
   "path": "practice/l56_human_feedback_todo.py",
   "zh": "练习：像视频一样只改 YAML（`data/l56_tasks_todo.yaml`），给两个任务加上 human_input。",
   "en": "Exercise: change only the YAML, like the video (`data/l56_tasks_todo.yaml`), adding human_input to two tasks."
  },
  {
   "path": "practice/data/l56_tasks_todo.yaml",
   "zh": "练习用的任务配置，按里面的 TODO 加两行 `human_input: true`。",
   "en": "The task config for the exercise: add two `human_input: true` lines as its TODOs say."
  },
  {
   "path": "practice/l56_human_feedback_solution.py",
   "zh": "参考答案：55 节的营销策划小组换上带 human_input 的任务配置，在终端里改到满意为止。",
   "en": "Solution: lesson 55's marketing crew with the human_input task config; revise in the terminal until you are satisfied."
  },
  {
   "path": "practice/data/l56_tasks.yaml",
   "zh": "参考答案的任务配置：调研任务和文案任务带 `human_input: true`。",
   "en": "The reference solution's task config: the research task and the copy task have `human_input: true`."
  },
  {
   "path": "practice/l56_flow_feedback.py",
   "zh": "补充演示：Flow 的 `@human_feedback`，不调用模型，不需要 key。",
   "en": "Extra demo: Flow's `@human_feedback`; calls no model and needs no key."
  }
 ]
});
