COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l54",
  "priority": "important",
  "handwrite": true,
  "studyMinutes": 35,
  "source": "subtitle",
  "summary": {
    "zh": "视频用 CrewAI 搭了一个写游戏的三人开发小组：高级软件工程师按需求写代码，软件质量控制工程师查错并改好，首席软件质量控制工程师确认功能完整。三个任务都要求「只输出完整的 Python 代码」并按顺序执行；游戏说明（俄罗斯方块）通过 FastAPI 服务传进来，生成的代码存成 `game_code.py` 再手动试玩，最后对比了几个模型的效果。本课用 DeepSeek 复现同样的结构，游戏换成视频也提到的贪吃蛇（只用 Python 自带的 tkinter），并学会去掉代码围栏、用 `ast` 检查语法、读过再运行。",
    "en": "The video uses CrewAI to build a three-person team that writes a game: a senior software engineer writes the code, a software quality control engineer finds and fixes bugs, and a chief software quality control engineer confirms the features are complete. All three tasks demand “complete Python code only” and run in order; the game description (Tetris) arrives through a FastAPI service, the code is saved as `game_code.py` and played by hand, and finally several models are compared. This lesson rebuilds the same structure with DeepSeek, swaps in Snake (which the video also mentions) using Python's built-in tkinter, and shows how to strip code fences, check syntax with `ast`, and read the code before running it."
  },
  "goals": [
    {
      "zh": "说出视频里三个 Agent、三个任务的分工：写代码 → 查错修复 → 确认完整",
      "en": "Describe how the video's three agents and three tasks split the work: write → find and fix → confirm complete"
    },
    {
      "zh": "用 YAML + `@CrewBase` 搭出这个开发小组，用 `{game}` 占位符传入游戏说明",
      "en": "Build the dev team with YAML + `@CrewBase` and pass the game description through a `{game}` placeholder"
    },
    {
      "zh": "知道顺序流程里，没写 `context` 的任务会自动拿到前面所有任务的输出",
      "en": "Know that in a sequential crew a task without `context` automatically receives every earlier output"
    },
    {
      "zh": "把结果存成 .py 文件：去掉代码围栏行，用 `ast.parse` 检查语法，读过再自己运行",
      "en": "Save the result as a .py file: strip the code-fence lines, check syntax with `ast.parse`, read the code, then run it yourself"
    },
    {
      "zh": "知道模型能力对生成的代码影响很大，换模型后要重启服务",
      "en": "Know that the model strongly affects the generated code, and that switching models means restarting the service"
    }
  ],
  "blocks": [
    {
      "t": "h",
      "zh": "一、这一集做什么：一个写游戏的三人小组",
      "en": "1. The episode: a three-person team that writes a game"
    },
    {
      "t": "p",
      "zh": "[▶ 00:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=55&t=32) 这一集是老师「CrewAI + FastAPI」系列里的又一个案例：做一个用 Python 写代码的智能体团队。它照着真实开发团队来分工，三个 Agent 各管一段：\n\n| Agent（本课 YAML 里的键名） | 负责什么 | backstory 的重点 |\n|---|---|---|\n| 高级软件工程师 `senior_engineer` | 按需求写出完整代码 | 精通 Python，尽力写出完美的代码 |\n| 软件质量控制工程师 `qa_engineer` | 检查上一步的代码并改好 | 盯着缺失的 import、未定义的变量、括号不配对、语法错误，还有安全漏洞和逻辑错误 |\n| 首席软件质量控制工程师 `chief_qa_engineer` | 确认代码真的完成了该做的事 | 认为程序员常常只做一半，所以格外严格 |\n\n为什么要拆成三个人？让同一个 Agent 写完再自己检查，它很难发现自己的错，就像人读自己写的文章总会漏掉错字。拆开以后，每个提示词只关注一件事，结果更稳定。",
      "en": "[▶ 00:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=55&t=32) This episode is another case study in the instructor's “CrewAI + FastAPI” series: a team of agents that writes code in Python. It splits the work like a real development team, with each of three agents owning one step:\n\n| Agent (key in this lesson's YAML) | Job | Gist of the backstory |\n|---|---|---|\n| Senior software engineer `senior_engineer` | Writes complete code from the requirement | Python expert who tries hard to write perfect code |\n| Software quality control engineer `qa_engineer` | Checks the previous step's code and fixes it | Watches for missing imports, undefined variables, mismatched brackets, syntax errors, plus security holes and logic errors |\n| Chief software quality control engineer `chief_qa_engineer` | Confirms the code really does what it should | Believes programmers often do only half the job, so is extra strict |\n\nWhy split it among three people? An agent that writes code and then checks it itself rarely spots its own mistakes, just as people always miss typos when reading their own writing. Split up, each prompt focuses on one thing, and the result is more reliable."
    },
    {
      "t": "video",
      "zh": "[▶ 01:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=55&t=95) 三个 Agent 各配一个任务（本课沿用 `code_task`、`review_task`、`evaluate_task` 这三个名字）。三个任务的说明里都有同一个 `{game}` 占位符，运行时换成用户给的游戏说明；三个 `expected_output` 的要求也相同：交回来的只能是一份完整的 Python 代码，不附带任何别的文字。\n\n[▶ 03:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=55&t=185) 前期准备老师没有重讲：项目怎么搭，看系列第一集（本课程的 51 节）；Anaconda 和 Python 环境、三类模型（GPT、通过 OneAPI 接入的国产模型、用 Ollama 跑的本地模型）怎么接，他都指向了自己以前的视频。依赖按 README 在项目文件夹里装一次即可，本课程的 `.venv-crewai` 已经装好了。\n\n视频的顺序是：介绍功能 → 前期准备 → [▶ 05:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=55&t=308) 运行服务、试玩、对比模型 → [▶ 12:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=55&t=722) 最后才过一遍源码。本课先讲源码（第二、三节），再讲运行（第四到六节），方便你边学边写；每一节开头都标了对应的视频时间。",
      "en": "[▶ 01:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=55&t=95) Each of the three agents gets one task (this lesson keeps the names `code_task`, `review_task` and `evaluate_task`). All three task descriptions contain the same `{game}` placeholder, which is replaced at run time by the game description the user provides; and all three `expected_output`s make the same demand: what comes back must be complete Python code only, with no other text attached.\n\n[▶ 03:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=55&t=185) The instructor doesn't repeat the setup: for creating the project, see the first episode of the series (lesson 51 in this course); for Anaconda and the Python environment, and for wiring up the three kinds of models (GPT, Chinese models through OneAPI, local models run with Ollama), he points to his earlier videos. The dependencies are installed once in the project folder following the README; this course's `.venv-crewai` already has them.\n\nThe video's order is: what it does → setup → [▶ 05:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=55&t=308) running the service, playing the game, comparing models → [▶ 12:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=55&t=722) and only at the end a walk through the source code. This lesson covers the source first (parts 2 and 3) and then running it (parts 4 to 6), so you can write code as you learn; each part starts with the matching video time."
    },
    {
      "t": "h",
      "zh": "二、Agent 和任务写在 YAML 里",
      "en": "2. Agents and tasks live in YAML"
    },
    {
      "t": "p",
      "zh": "[▶ 12:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=55&t=722) 源码结构和系列第一集（51 节）一样：`config` 文件夹里的 `agents.yaml`、`tasks.yaml` 放 Agent 和任务的文字，`crew.py` 用 `@CrewBase` 把它们组装成 crew，`main.py` 是 FastAPI 服务，`apiTest.py` 负责发请求。本课把两个 YAML 放在 `practice/data/` 下，文字按视频的意思用中文重新写过：",
      "en": "[▶ 12:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=55&t=722) The source layout matches the series' first episode (lesson 51): `agents.yaml` and `tasks.yaml` in a `config` folder hold the agent and task texts, `crew.py` assembles them into a crew with `@CrewBase`, `main.py` is the FastAPI service and `apiTest.py` sends the requests. This lesson keeps the two YAML files in `practice/data/`, rewritten in Chinese along the lines of the video (shown in English here):"
    },
    {
      "t": "code",
      "file": "practice/data/l54_agents.yaml",
      "lang": "yaml",
      "code": {
        "zh": "senior_engineer:\n  role: >\n    高级软件工程师\n  goal: >\n    按照需求完成软件开发，交付能直接运行的完整代码\n  backstory: >\n    你在一家顶尖的科技公司担任高级软件工程师，精通 Python，总是尽最大努力写出完整、清晰、可以直接运行的代码。\n\nqa_engineer:\n  role: >\n    软件质量控制工程师\n  goal: >\n    仔细分析拿到的代码，找出其中的错误并改好，交出没有错误的代码\n  backstory: >\n    你的工作就是给代码挑错。你看得非常细，再隐蔽的 bug 也逃不过：缺少的 import、没有定义的变量、不配对的括号、语法错误，以及安全漏洞和逻辑错误。\n\nchief_qa_engineer:\n  role: >\n    首席软件质量控制工程师\n  goal: >\n    确保代码真的完成了它应该完成的工作\n  backstory: >\n    你觉得程序员常常只把工作做完一半，所以你格外严格，一定要交付完整、高质量、实现了全部需求的代码。",
        "en": "senior_engineer:\n  role: >\n    Senior Software Engineer\n  goal: >\n    Build the software the requirement asks for and deliver complete code that runs as-is\n  backstory: >\n    You are a senior software engineer at a top tech company and an expert in Python, and you always do your best to write complete, clear code that runs as-is.\n\nqa_engineer:\n  role: >\n    Software Quality Control Engineer\n  goal: >\n    Carefully analyse the code you receive, find its errors and fix them, and hand back error-free code\n  backstory: >\n    Your job is to find faults in code. You look very closely, and even well-hidden bugs don't escape you: missing imports, undefined variables, mismatched brackets, syntax errors, plus security holes and logic errors.\n\nchief_qa_engineer:\n  role: >\n    Chief Software Quality Control Engineer\n  goal: >\n    Make sure the code really does the job it is supposed to do\n  backstory: >\n    You feel programmers often finish only half the job, so you are extra strict and insist on delivering complete, high-quality code that meets every requirement."
      }
    },
    {
      "t": "code",
      "file": "practice/data/l54_tasks.yaml",
      "lang": "yaml",
      "code": {
        "zh": "code_task:\n  description: >\n    你要用 Python 写一个游戏，游戏说明如下：\n\n    {game}\n  expected_output: >\n    你的最终答案必须是完整的 Python 代码，只能是 Python 代码，不要任何解释，也不要用 ``` 把代码包起来。\n  agent: senior_engineer\n\nreview_task:\n  description: >\n    你在协助用 Python 写一个游戏，游戏说明如下：\n\n    {game}\n\n    检查你拿到的代码：逻辑错误、语法错误、缺少的 import、没有定义的变量、不配对的括号，以及安全漏洞。发现问题就直接改好。\n  expected_output: >\n    你的最终答案必须是完整的 Python 代码，只能是 Python 代码，不要任何解释，也不要用 ``` 把代码包起来。\n  agent: qa_engineer\n\nevaluate_task:\n  description: >\n    你在协助用 Python 写一个游戏，游戏说明如下：\n\n    {game}\n\n    通读代码，确认它是完整的，并且真正实现了游戏说明里的每一项要求；缺什么就补上。\n  expected_output: >\n    你的最终答案必须是完整的 Python 代码，只能是 Python 代码，不要任何解释，也不要用 ``` 把代码包起来。\n  agent: chief_qa_engineer",
        "en": "code_task:\n  description: >\n    You will write a game in Python. The game description:\n\n    {game}\n  expected_output: >\n    Your final answer must be the complete Python code, only Python code, with no explanations and no ``` fences around it.\n  agent: senior_engineer\n\nreview_task:\n  description: >\n    You are helping to write a game in Python. The game description:\n\n    {game}\n\n    Check the code you received for logic errors, syntax errors, missing imports, undefined variables, mismatched brackets and security holes. Fix whatever you find right away.\n  expected_output: >\n    Your final answer must be the complete Python code, only Python code, with no explanations and no ``` fences around it.\n  agent: qa_engineer\n\nevaluate_task:\n  description: >\n    You are helping to write a game in Python. The game description:\n\n    {game}\n\n    Read through the code, make sure it is complete and really meets every requirement in the game description; add whatever is missing.\n  expected_output: >\n    Your final answer must be the complete Python code, only Python code, with no explanations and no ``` fences around it.\n  agent: chief_qa_engineer"
      }
    },
    {
      "t": "tip",
      "zh": "三个任务都强调「只要代码」，是因为最后的结果要原样存成 `.py` 文件：混进一句解释，或者多出一行代码围栏（以三个反引号开头的那行），文件就运行不了。老师在视频里也说，他的提示词写得比较简单，想要更好的结果可以把任务说明写得更详细。",
      "en": "All three tasks insist on “code only” because the final result is saved as-is into a `.py` file: mix in one sentence of explanation, or one extra code-fence line (the line starting with three backticks), and the file won't run. The instructor also says in the video that his prompts are fairly simple, and that writing more detailed task descriptions gives better results."
    },
    {
      "t": "h",
      "zh": "三、crew.py：用 @CrewBase 组装（回顾 51 节）",
      "en": "3. crew.py: assembling with @CrewBase (see lesson 51)"
    },
    {
      "t": "p",
      "zh": "[▶ 12:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=55&t=753) `crew.py` 按官方推荐的写法，把 YAML 里定义好的 3 个 Agent 和 3 个任务组装成一个 crew，任务按顺序执行——和 51 节的写法相同。对应的练习文件是 `practice/l54_dev_team_solution.py`：",
      "en": "[▶ 12:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=55&t=753) Following the officially recommended style, `crew.py` assembles the 3 agents and 3 tasks defined in the YAML into one crew whose tasks run in order – the same as in lesson 51. The matching practice file is `practice/l54_dev_team_solution.py`:"
    },
    {
      "t": "code",
      "file": {
        "zh": "practice/l54_dev_team_solution.py（节选）",
        "en": "practice/l54_dev_team_solution.py (excerpt)"
      },
      "code": {
        "zh": "from crewai import LLM, Agent, Crew, Process, Task\nfrom crewai.project import CrewBase, agent, crew, task\nfrom llm import API_KEY, BASE_URL, MODEL\n\nllm = LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY)\n\n\n@CrewBase\nclass GameDevCrew:\n    agents_config = \"data/l54_agents.yaml\"     # 相对于这个 .py 文件所在的文件夹\n    tasks_config = \"data/l54_tasks.yaml\"\n\n    @agent\n    def senior_engineer(self) -> Agent:        # 方法名 = YAML 里的键名\n        return Agent(config=self.agents_config[\"senior_engineer\"], llm=llm, verbose=True)\n\n    @agent\n    def qa_engineer(self) -> Agent:\n        return Agent(config=self.agents_config[\"qa_engineer\"], llm=llm, verbose=True)\n\n    @agent\n    def chief_qa_engineer(self) -> Agent:\n        return Agent(config=self.agents_config[\"chief_qa_engineer\"], llm=llm, verbose=True)\n\n    @task\n    def code_task(self) -> Task:               # 定义的顺序 = 执行的顺序\n        return Task(config=self.tasks_config[\"code_task\"])\n\n    @task\n    def review_task(self) -> Task:\n        return Task(config=self.tasks_config[\"review_task\"])\n\n    @task\n    def evaluate_task(self) -> Task:\n        return Task(config=self.tasks_config[\"evaluate_task\"])\n\n    @crew\n    def crew(self) -> Crew:\n        return Crew(agents=self.agents, tasks=self.tasks,\n                    process=Process.sequential, verbose=True)",
        "en": "from crewai import LLM, Agent, Crew, Process, Task\nfrom crewai.project import CrewBase, agent, crew, task\nfrom llm import API_KEY, BASE_URL, MODEL\n\nllm = LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY)\n\n\n@CrewBase\nclass GameDevCrew:\n    agents_config = \"data/l54_agents.yaml\"     # relative to this .py file's folder\n    tasks_config = \"data/l54_tasks.yaml\"\n\n    @agent\n    def senior_engineer(self) -> Agent:        # method name = the key in the YAML\n        return Agent(config=self.agents_config[\"senior_engineer\"], llm=llm, verbose=True)\n\n    @agent\n    def qa_engineer(self) -> Agent:\n        return Agent(config=self.agents_config[\"qa_engineer\"], llm=llm, verbose=True)\n\n    @agent\n    def chief_qa_engineer(self) -> Agent:\n        return Agent(config=self.agents_config[\"chief_qa_engineer\"], llm=llm, verbose=True)\n\n    @task\n    def code_task(self) -> Task:               # definition order = run order\n        return Task(config=self.tasks_config[\"code_task\"])\n\n    @task\n    def review_task(self) -> Task:\n        return Task(config=self.tasks_config[\"review_task\"])\n\n    @task\n    def evaluate_task(self) -> Task:\n        return Task(config=self.tasks_config[\"evaluate_task\"])\n\n    @crew\n    def crew(self) -> Crew:\n        return Crew(agents=self.agents, tasks=self.tasks,\n                    process=Process.sequential, verbose=True)"
      }
    },
    {
      "t": "p",
      "zh": "**审查员怎么拿到第一版代码？** 三个任务都没写 `context`。在 `Process.sequential`（按顺序执行）里，没写 `context` 的任务会自动收到前面**所有**任务的输出：CrewAI 把它们的 `raw` 文字用分隔线拼在一起，附在提示词末尾（本课在 1.15.23 上实际看过发给模型的内容）。所以 `review_task` 看到第一版代码，`evaluate_task` 看到第一版和修改后的两份代码。",
      "en": "**How does the reviewer get the first draft?** None of the three tasks sets `context`. In `Process.sequential` (run in order), a task without `context` automatically receives the outputs of **all** earlier tasks: CrewAI joins their `raw` text with separator lines and appends it to the prompt (we inspected the actual messages on 1.15.23). So `review_task` sees the first draft, and `evaluate_task` sees both the draft and the revised version."
    },
    {
      "t": "note",
      "zh": "补充：想让某个任务只看指定的结果，可以写 `context`，比如 `Task(config=..., context=[self.review_task()])`，或者在 YAML 里写 `context: [review_task]`。代码一版比一版长时，这样能少传重复的内容。视频没有用到它。",
      "en": "Extra: to let a task see only specific results, set `context`, e.g. `Task(config=..., context=[self.review_task()])`, or `context: [review_task]` in the YAML. With code growing version by version, this avoids sending duplicates. The video doesn't use it."
    },
    {
      "t": "check",
      "q": {
        "zh": "`evaluate_task` 没有写 `context`，它的提示词里会带上什么？",
        "en": "`evaluate_task` sets no `context`. What gets added to its prompt?"
      },
      "options": [
        {
          "zh": "只有 `review_task` 的输出",
          "en": "Only `review_task`'s output"
        },
        {
          "zh": "`code_task` 和 `review_task` 的输出，拼在一起",
          "en": "The outputs of `code_task` and `review_task`, joined"
        },
        {
          "zh": "什么都没有，要自己写 `context` 才行",
          "en": "Nothing – you must set `context` yourself"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "顺序流程里，不写 `context` 就把前面所有任务的 `raw` 输出都交给它。",
        "en": "In a sequential crew, no `context` means every earlier task's `raw` output is handed over."
      }
    },
    {
      "t": "h",
      "zh": "四、把游戏说明传进去：{game}",
      "en": "4. Passing in the game description: {game}"
    },
    {
      "t": "p",
      "zh": "[▶ 06:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=55&t=399) 视频的 `apiTest` 脚本把游戏说明装进请求体发给服务。[▶ 07:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=55&t=430) 老师用的是俄罗斯方块，说明写得像一份小需求文档：名称；玩法（移动、旋转下落的方块，填满一行就消掉，下落速度适中）；几种由四个小格组成的方块；操作（左右键移动、下键加速、上键旋转）；计分；结束条件（堆到顶部放不下）。他还准备了贪吃蛇作为另一个例子。\n\n本课用贪吃蛇，并要求只用 Python 自带的 `tkinter` 画窗口——不用另装 pygame 这类第三方库。说明的写法照搬视频的结构：",
      "en": "[▶ 06:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=55&t=399) The video's `apiTest` script puts the game description into the request body and sends it to the service. [▶ 07:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=55&t=430) The instructor uses Tetris, described like a small requirements document: the name; how it plays (move and rotate the falling blocks, a full row disappears, a moderate falling speed); several shapes made of four small squares; controls (left/right to move, down to speed up, up to rotate); scoring; and game over (blocks pile up to the top and no longer fit). He also has Snake ready as another example.\n\nThis lesson uses Snake and requires the window to be drawn with Python's built-in `tkinter` only – no need to install a third-party library such as pygame. The description copies the structure of the video's:"
    },
    {
      "t": "code",
      "file": {
        "zh": "practice/l54_dev_team_solution.py（节选）",
        "en": "practice/l54_dev_team_solution.py (excerpt)"
      },
      "code": {
        "zh": "GAME = \"\"\"游戏名称：贪吃蛇\n游戏说明：玩家控制一条蛇在格子地图上移动，吃到食物后蛇身变长、得分增加，新的食物随机出现在空格子上。蛇的移动速度要适中，不要太快。\n技术要求：只使用 Python 自带的 tkinter 画窗口和图形，不要使用 pygame 等第三方库；地图 20×20 格，每格 20 像素。\n操作方式：用方向键 ↑ ↓ ← → 改变蛇的方向，不能直接掉头。\n计分规则：每吃到一个食物加 10 分，窗口顶部显示当前分数。\n结束条件：蛇撞到墙壁或撞到自己的身体时游戏结束，显示「游戏结束」和最终得分；按空格键重新开始。\"\"\"\n\n# 三个任务说明里的 {game} 都会换成这段文字\nresult = GameDevCrew().crew().kickoff(inputs={\"game\": GAME})\nprint(result.raw)                      # 最后一个任务（验收）交出的代码\nfor t in result.tasks_output:          # 每个任务各自的输出\n    print(t.name, len(t.raw))",
        "en": "GAME = \"\"\"Name: Snake\nHow it plays: the player steers a snake around a grid map; eating food makes the snake longer and raises the score, and new food appears on a random empty cell. The snake should move at a moderate speed, not too fast.\nTechnical requirements: use only Python's built-in tkinter for the window and graphics, no pygame or other third-party libraries; a 20×20 grid with 20-pixel cells.\nControls: the arrow keys ↑ ↓ ← → change the snake's direction; it cannot turn straight back.\nScoring: 10 points for each food eaten, with the current score shown at the top of the window.\nGame over: the game ends when the snake hits a wall or its own body, showing \"Game over\" and the final score; press Space to start again.\"\"\"\n\n# {game} in all three task descriptions is replaced by this text\nresult = GameDevCrew().crew().kickoff(inputs={\"game\": GAME})\nprint(result.raw)                      # the code from the last task (sign-off)\nfor t in result.tasks_output:          # each task's own output\n    print(t.name, len(t.raw))"
      }
    },
    {
      "t": "p",
      "zh": "`kickoff(inputs={\"game\": GAME})` 会把三个任务说明里的 `{game}` 都换成这段文字。键名必须和占位符一样：写成 `\"games\"` 会报 `ValueError`，提示 `Template variable 'game' not found in inputs dictionary`（本课实测）。",
      "en": "`kickoff(inputs={\"game\": GAME})` replaces `{game}` in all three task descriptions. The key must match the placeholder exactly: `\"games\"` raises `ValueError` with `Template variable 'game' not found in inputs dictionary` (tested for this lesson)."
    },
    {
      "t": "h",
      "zh": "五、保存代码：去掉围栏，检查语法，读过再运行",
      "en": "5. Saving the code: strip fences, check syntax, read before running"
    },
    {
      "t": "p",
      "zh": "[▶ 08:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=55&t=534) 视频跑完后，文件夹里多了一个 `game_code.py`，里面就是最后一个任务交出的代码。老师提醒：模型有时还是会用 Markdown 的代码围栏把代码包起来——开头多一行「三个反引号 + python」，结尾多一行「三个反引号」，要先把这两行删掉才能运行；也可以在任务的提示词里再强调一次。[▶ 09:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=55&t=565) 然后他新开一个终端运行这个文件：弹出俄罗斯方块窗口，方向键能移动、旋转、加速，方块堆到顶部时游戏结束，基本功能都有了。\n\n删围栏和检查语法这两步，可以交给几行 Python：",
      "en": "[▶ 08:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=55&t=534) After the run, a `game_code.py` file appears in the folder, holding the code from the last task. The instructor warns that the model sometimes still wraps the code in a Markdown code fence – an extra line of “three backticks + python” at the top and one of “three backticks” at the end – and these two lines must be deleted before it will run; or you can stress it once more in the task prompt. [▶ 09:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=55&t=565) He then runs the file in a new terminal: a Tetris window opens, the arrow keys move, rotate and speed up the pieces, and the game ends when the blocks pile up to the top – the basics all work.\n\nStripping the fences and checking the syntax can be left to a few lines of Python:"
    },
    {
      "t": "py",
      "title": {
        "zh": "检查 AI 写的代码：去掉围栏 + ast.parse",
        "en": "Checking AI-written code: strip fences + ast.parse"
      },
      "zh": "下面两步可以在**不运行**代码的情况下做最基本的检查：\n1. `clean_code`：用 07 节学过的 `strip`、`split`、`startswith` 去掉首尾的围栏行。\n2. `ast.parse(code)`：`ast` 是 Python 自带的模块，`parse` 只把代码解析成语法结构，**一行都不执行**。有语法错误就抛出 `SyntaxError`，它的 `lineno` 是出错的行号，`msg` 是错误说明。用 07 节的 `try/except` 接住它。\n\n语法正确不代表逻辑正确：读过代码、自己运行试玩，才是最后一关。",
      "en": "These two steps give a basic check **without running** the code:\n1. `clean_code`: removes the fence lines at both ends with `strip`, `split` and `startswith` from lesson 07.\n2. `ast.parse(code)`: `ast` ships with Python; `parse` only turns the code into a syntax tree and **executes nothing**. A syntax error raises `SyntaxError`, whose `lineno` is the line number and `msg` the explanation. Catch it with `try/except` from lesson 07.\n\nValid syntax doesn't mean correct logic: reading the code and playing it yourself is the final check.",
      "code": {
        "zh": "import ast\n\ndef clean_code(text):\n    \"\"\"去掉首尾的代码围栏行（以三个反引号开头的行）。\"\"\"\n    lines = text.strip().split(\"\\n\")\n    if lines and lines[0].startswith(\"```\"):\n        lines = lines[1:]\n    if lines and lines[-1].startswith(\"```\"):\n        lines = lines[:-1]\n    return \"\\n\".join(lines) + \"\\n\"\n\ndef check_syntax(code):\n    \"\"\"只检查语法，不运行代码。\"\"\"\n    try:\n        ast.parse(code)\n        return \"语法正确\"\n    except SyntaxError as e:\n        return f\"第 {e.lineno} 行有语法错误：{e.msg}\"\n\nwith_fence = \"```python\\nimport tkinter as tk\\nprint('游戏开始')\\n```\"\nmissing_colon = \"for i in range(3)\\n    print(i)\"\n\nprint(clean_code(with_fence))\nprint(check_syntax(clean_code(with_fence)))   # 清理后：语法正确\nprint(check_syntax(with_fence))               # 不清理：第 1 行就出错\nprint(check_syntax(missing_colon))            # for 后面少了冒号",
        "en": "import ast\n\ndef clean_code(text):\n    \"\"\"Remove the fence lines (lines starting with three backticks) at both ends.\"\"\"\n    lines = text.strip().split(\"\\n\")\n    if lines and lines[0].startswith(\"```\"):\n        lines = lines[1:]\n    if lines and lines[-1].startswith(\"```\"):\n        lines = lines[:-1]\n    return \"\\n\".join(lines) + \"\\n\"\n\ndef check_syntax(code):\n    \"\"\"Check the syntax only - never run the code.\"\"\"\n    try:\n        ast.parse(code)\n        return \"syntax OK\"\n    except SyntaxError as e:\n        return f\"syntax error on line {e.lineno}: {e.msg}\"\n\nwith_fence = \"```python\\nimport tkinter as tk\\nprint('game on')\\n```\"\nmissing_colon = \"for i in range(3)\\n    print(i)\"\n\nprint(clean_code(with_fence))\nprint(check_syntax(clean_code(with_fence)))   # cleaned: syntax OK\nprint(check_syntax(with_fence))               # not cleaned: fails on line 1\nprint(check_syntax(missing_colon))            # the colon after for is missing"
      }
    },
    {
      "t": "code",
      "file": {
        "zh": "practice/l54_dev_team_solution.py（节选）",
        "en": "practice/l54_dev_team_solution.py (excerpt)"
      },
      "code": {
        "zh": "import ast\nfrom pathlib import Path\n\nOUT = Path(\"data/l54_output/snake_game.py\")     # 相对于运行命令时所在的文件夹\n\ncode = clean_code(result.raw)                    # 去掉可能出现的 ``` 围栏行（见上面的小课堂）\ntry:\n    ast.parse(code)                              # 只检查语法，不运行\n    print(\"语法检查通过\")\nexcept SyntaxError as e:\n    print(f\"第 {e.lineno} 行有语法错误：{e.msg}\")\n\nOUT.parent.mkdir(parents=True, exist_ok=True)    # 文件夹不存在就建一个（回顾 10 节的 pathlib）\nOUT.write_text(code, encoding=\"utf-8\")\nprint(\"已保存，先读一遍再自己运行：\", OUT.resolve())",
        "en": "import ast\nfrom pathlib import Path\n\nOUT = Path(\"data/l54_output/snake_game.py\")     # relative to where you run the command\n\ncode = clean_code(result.raw)                    # strip any ``` fence lines (see the mini-lesson above)\ntry:\n    ast.parse(code)                              # check the syntax only, never run it\n    print(\"syntax OK\")\nexcept SyntaxError as e:\n    print(f\"syntax error on line {e.lineno}: {e.msg}\")\n\nOUT.parent.mkdir(parents=True, exist_ok=True)    # create the folder if needed (pathlib, lesson 10)\nOUT.write_text(code, encoding=\"utf-8\")\nprint(\"saved - read it, then run it yourself:\", OUT.resolve())"
      }
    },
    {
      "t": "p",
      "zh": "本课用 deepseek-flash 实际跑了一次（3 次模型调用）：三个任务各交出约 5000 个字符、190 行左右的完整代码，都没有加围栏，语法检查通过。保存下来的 `practice/data/l54_output/snake_game.py` 在本机试过：吃到食物会变长并加 10 分，不能直接掉头，撞墙后显示「游戏结束」，按空格重新开始。你可以先打开它对照着读，再自己运行：\n\n`& ..\\.venv-crewai\\Scripts\\python.exe data\\l54_output\\snake_game.py`",
      "en": "We ran it once for real with deepseek-flash (3 model calls): each task returned roughly 5,000 characters – about 190 lines – of complete code, none of it fenced, and the syntax check passed. The saved `practice/data/l54_output/snake_game.py` was tried on this machine: eating food grows the snake and adds 10 points, it cannot reverse straight back, hitting a wall shows “游戏结束” (game over) and Space restarts. Read it first, then run it yourself:\n\n`& ..\\.venv-crewai\\Scripts\\python.exe data\\l54_output\\snake_game.py`"
    },
    {
      "t": "warn",
      "zh": "**不要让程序自动运行 AI 写的代码。** 代码可能陷入死循环、删掉文件或者乱发网络请求。正确的顺序是：存成文件 → 自己读一遍 → 再手动运行（视频也是这样做的）。网上旧教程里给 Agent 设置 `allow_code_execution=True`、让它自己执行代码的写法，在 CrewAI 1.15.23 里只会给出弃用警告，不会生效。",
      "en": "**Never let your program run AI-written code automatically.** It could loop forever, delete files or fire off network requests. The safe order is: save to a file → read it yourself → run it by hand (which is what the video does). Older tutorials set `allow_code_execution=True` so the agent runs its own code; in CrewAI 1.15.23 that only emits a deprecation warning and does nothing."
    },
    {
      "t": "h",
      "zh": "六、对外提供服务，以及换模型的差别",
      "en": "6. Serving it, and how much the model matters"
    },
    {
      "t": "video",
      "zh": "[▶ 05:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=55&t=308) 视频的测试流程：先在 `main.py` 里配好模型，启动 FastAPI 服务；再运行 `apiTest.py` 发 POST 请求，服务收到后运行 crew。老师特别提醒：请求地址里的 IP 和端口要和服务一致。\n\n[▶ 06:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=55&t=368) 他准备了 GPT-4o、GPT-4o-mini 和通义千问 qwen-max 三个模型，演示时用 GPT-4o，还建议硬件够的话试试本地专门写代码的开源模型。[▶ 10:28](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=55&t=628) 换模型以后**要重启服务**才会生效。GPT-4o-mini 写出的游戏同样能玩；[▶ 11:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=55&t=691) qwen-max 他生成了三次，每次都或多或少有问题。所以他建议多换几个模型测试，效果不满意就把提示词写得更详细。",
      "en": "[▶ 05:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=55&t=308) The video's test routine: configure the model in `main.py` and start the FastAPI service, then run `apiTest.py` to send a POST request, and the service runs the crew when it receives it. The instructor stresses that the IP and port in the request URL must match the service.\n\n[▶ 06:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=55&t=368) He has three models ready – GPT-4o, GPT-4o-mini and qwen-max from Tongyi Qianwen (Qwen) – uses GPT-4o for the demo, and suggests trying a local open-source model made for coding if your hardware allows. [▶ 10:28](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=55&t=628) After switching models you **must restart the service** for it to take effect. GPT-4o-mini's game was just as playable; [▶ 11:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=55&t=691) with qwen-max he generated the game three times, and every time it had some problem. So he recommends testing several models, and writing more detailed prompts when the results disappoint."
    },
    {
      "t": "p",
      "zh": "服务的写法（`uvicorn` 启动、`kickoff_async`、客户端设长超时）在 51 节已经完整讲过，这里只要换掉 crew 和请求字段。下面是一个示意：",
      "en": "How to write the service (start with `uvicorn`, use `kickoff_async`, give the client a long timeout) was covered fully in lesson 51; here you only swap the crew and the request field. A sketch:"
    },
    {
      "t": "code",
      "file": {
        "zh": "main.py（示意）",
        "en": "main.py (sketch)"
      },
      "code": {
        "zh": "from pathlib import Path\n\nfrom fastapi import FastAPI\nfrom pydantic import BaseModel\n\nfrom l54_dev_team_solution import GameDevCrew, clean_code\n\napp = FastAPI()\n\n\nclass GameRequest(BaseModel):\n    game: str                                  # 游戏说明，对应任务里的 {game}\n\n\n@app.post(\"/game\")\nasync def make_game(req: GameRequest):\n    result = await GameDevCrew().crew().kickoff_async(inputs={\"game\": req.game})\n    code = clean_code(result.raw)\n    Path(\"game_code.py\").write_text(code, encoding=\"utf-8\")   # 像视频一样存成 game_code.py\n    return {\"code\": code}",
        "en": "from pathlib import Path\n\nfrom fastapi import FastAPI\nfrom pydantic import BaseModel\n\nfrom l54_dev_team_solution import GameDevCrew, clean_code\n\napp = FastAPI()\n\n\nclass GameRequest(BaseModel):\n    game: str                                  # the game description, for {game} in the tasks\n\n\n@app.post(\"/game\")\nasync def make_game(req: GameRequest):\n    result = await GameDevCrew().crew().kickoff_async(inputs={\"game\": req.game})\n    code = clean_code(result.raw)\n    Path(\"game_code.py\").write_text(code, encoding=\"utf-8\")   # saved as game_code.py, like the video\n    return {\"code\": code}"
      }
    },
    {
      "t": "tip",
      "zh": "想对比模型，只改 `llm = LLM(...)` 这一行。比如视频用的通义千问可以写成 `LLM(model=\"openai/qwen-max\", base_url=\"https://dashscope.aliyuncs.com/compatible-mode/v1\", api_key=...)`（需要百炼的 key）。如果放在服务里运行，改完要重启服务。",
      "en": "To compare models, change only the `llm = LLM(...)` line – for the video's Qwen, `LLM(model=\"openai/qwen-max\", base_url=\"https://dashscope.aliyuncs.com/compatible-mode/v1\", api_key=...)` (needs an Alibaba Cloud Bailian key). If it runs inside the service, restart the service afterwards."
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "视频里哪个 Agent 专门检查缺失的 import、括号不配对和安全漏洞？",
        "en": "In the video, which agent checks for missing imports, mismatched brackets and security holes?"
      },
      "options": [
        {
          "zh": "高级软件工程师",
          "en": "The senior software engineer"
        },
        {
          "zh": "软件质量控制工程师",
          "en": "The software quality control engineer"
        },
        {
          "zh": "首席软件质量控制工程师",
          "en": "The chief software quality control engineer"
        },
        {
          "zh": "三个都不管，交给 Python 报错",
          "en": "None of them – leave it to Python's error messages"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "质量控制工程师负责查错并改好；首席质量控制工程师负责确认代码完成了全部功能。",
        "en": "The QC engineer finds and fixes errors; the chief QC engineer confirms the code does everything it should."
      }
    },
    {
      "q": {
        "zh": "三个任务的说明里都写了 `{game}`，启动时却写成 `kickoff(inputs={\"games\": GAME})`，会怎样？",
        "en": "All three task descriptions contain `{game}`, but you start the crew with `kickoff(inputs={\"games\": GAME})`. What happens?"
      },
      "options": [
        {
          "zh": "正常运行，`{game}` 原样留在任务说明里",
          "en": "It runs normally, and `{game}` stays as-is in the task descriptions"
        },
        {
          "zh": "只有第一个任务拿到游戏说明",
          "en": "Only the first task gets the game description"
        },
        {
          "zh": "照样能拿到，键名多一个 s 不影响",
          "en": "It still gets through – one extra s in the key makes no difference"
        },
        {
          "zh": "启动时就报 `ValueError`，提示 `Template variable 'game' not found`",
          "en": "It fails right at kickoff with `ValueError`: `Template variable 'game' not found`"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "`inputs` 的键名必须和占位符一字不差。写错时 CrewAI 在调用模型之前就报错，一次调用都不会花。",
        "en": "The `inputs` keys must match the placeholders exactly. With a typo, CrewAI raises the error before calling the model, so not a single call is spent."
      }
    },
    {
      "q": {
        "zh": "为什么三个任务的 `expected_output` 都要求「只要完整的 Python 代码」？",
        "en": "Why do all three `expected_output`s demand “complete Python code only”?"
      },
      "options": [
        {
          "zh": "结果要原样存成 .py 文件，混进解释或围栏就运行不了",
          "en": "The result is saved straight into a .py file; explanations or fences would break it"
        },
        {
          "zh": "CrewAI 规定 `expected_output` 只能写代码",
          "en": "CrewAI only allows code in `expected_output`"
        },
        {
          "zh": "这样模型调用次数更少",
          "en": "It means fewer model calls"
        },
        {
          "zh": "不这样写，后面的任务就收不到上一步的结果",
          "en": "Otherwise later tasks wouldn't receive the earlier result"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "最后一个任务的 `raw` 会直接写进文件，所以要尽量只有代码；保存前再用 `clean_code` 兜底。",
        "en": "The last task's `raw` goes straight into the file, so it should be code only; `clean_code` is the safety net before saving."
      }
    },
    {
      "q": {
        "zh": "生成的文件第一行是代码围栏「三个反引号 + python」，直接运行会怎样？",
        "en": "The first line of the generated file is a code fence, “three backticks + python”. What happens if you run it as is?"
      },
      "options": [
        {
          "zh": "正常运行，Python 会跳过这一行",
          "en": "It runs – Python skips that line"
        },
        {
          "zh": "第 1 行就报 `SyntaxError`",
          "en": "`SyntaxError` on line 1"
        },
        {
          "zh": "只打印一个警告",
          "en": "Just a warning"
        },
        {
          "zh": "自动把它当成注释",
          "en": "It is treated as a comment"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "三个反引号不是合法的 Python。视频里是手动删掉首尾两行，本课用 `clean_code` 自动去掉。",
        "en": "Three backticks aren't valid Python. The video deletes the two lines by hand; this lesson's `clean_code` does it automatically."
      }
    },
    {
      "q": {
        "zh": "服务还在运行时，把 `main.py` 里的模型从 GPT-4o 换成 GPT-4o-mini，怎样才能生效？",
        "en": "With the service running, you change the model in `main.py` from GPT-4o to GPT-4o-mini. What makes the change take effect?"
      },
      "options": [
        {
          "zh": "什么都不用做，下一个请求自动用新模型",
          "en": "Nothing – the next request uses the new model automatically"
        },
        {
          "zh": "重新运行 apiTest",
          "en": "Re-run apiTest"
        },
        {
          "zh": "重启 main 服务",
          "en": "Restart the main service"
        },
        {
          "zh": "重装 CrewAI",
          "en": "Reinstall CrewAI"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "模型配置是服务启动时读进去的，改了文件要重启服务；视频里老师特别提醒了这一点。",
        "en": "The model settings are read when the service starts, so restart the service after editing the file – the instructor points this out in the video."
      }
    },
    {
      "q": {
        "zh": "`ast.parse(code)` 做了什么？",
        "en": "What does `ast.parse(code)` do?"
      },
      "options": [
        {
          "zh": "运行代码并返回结果",
          "en": "Runs the code and returns the result"
        },
        {
          "zh": "自动修好语法错误",
          "en": "Fixes syntax errors automatically"
        },
        {
          "zh": "把代码排版整齐",
          "en": "Reformats the code"
        },
        {
          "zh": "只检查语法：有错就抛出 `SyntaxError`，一行都不执行",
          "en": "Checks syntax only: raises `SyntaxError` if there is an error, and executes nothing"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "`ast.parse` 只把代码解析成语法树，用来检查 AI 写的代码很安全；能不能玩还得你读过后自己试。",
        "en": "`ast.parse` only builds a syntax tree, so it's safe for checking AI-written code; whether the game works is for you to read and try."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "用 @CrewBase 组装开发小组",
        "en": "Assemble the dev team with @CrewBase"
      },
      "code": "@[[CrewBase]]\nclass GameDevCrew:\n    agents_config = \"data/l54_agents.yaml\"\n    [[tasks_config]] = \"data/l54_tasks.yaml\"\n\n    @[[agent]]\n    def senior_engineer(self) -> Agent:\n        return Agent(config=self.agents_config[\"[[senior_engineer]]\"], llm=llm, verbose=True)\n\n    @task\n    def code_task(self) -> Task:\n        return Task(config=self.tasks_config[\"code_task\"])\n\n    @crew\n    def crew(self) -> Crew:\n        return Crew(agents=self.[[agents]], tasks=self.tasks,\n                    process=Process.[[sequential]], verbose=True)\n\nresult = GameDevCrew().crew().[[kickoff]](inputs={\"[[game]]\": GAME})",
      "explain": {
        "zh": "`@CrewBase` 读取两个 YAML；`@agent` 方法名要和 YAML 的键一样；`self.agents` / `self.tasks` 是自动收集好的列表；`inputs` 的键名对应任务里的 `{game}`。",
        "en": "`@CrewBase` reads the two YAML files; `@agent` method names match the YAML keys; `self.agents` / `self.tasks` are collected automatically; the `inputs` key matches `{game}` in the tasks."
      }
    },
    {
      "title": {
        "zh": "检查生成代码的语法",
        "en": "Check the generated code's syntax"
      },
      "code": "import ast\n\ncode = clean_code(result.[[raw]])\n[[try]]:\n    ast.[[parse]](code)\n    print(\"OK\")\nexcept [[SyntaxError]] as e:\n    print(e.[[lineno]], e.msg)",
      "explain": {
        "zh": "`result.raw` 是最后一个任务的文字；`ast.parse` 只解析不运行；语法错误用 `try/except SyntaxError` 接住，`e.lineno` 是行号。",
        "en": "`result.raw` is the last task's text; `ast.parse` parses without running; catch syntax errors with `try/except SyntaxError`; `e.lineno` is the line number."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：开发小组的 crew 类",
        "en": "Write it: the dev team's crew class"
      },
      "task": {
        "zh": "两个 YAML 已经写好（`data/l54_agents.yaml`、`data/l54_tasks.yaml`）。不看上面的代码，写出 crew 类并让它写一个打砖块游戏：\n1. 用 `@CrewBase` 写类 `GameDevCrew`，配置两个 YAML 路径\n2. 三个 `@agent` 方法：`senior_engineer`、`qa_engineer`、`chief_qa_engineer`，每个都传 `llm=llm`\n3. 三个 `@task` 方法：`code_task`、`review_task`、`evaluate_task`\n4. `@crew` 方法：按顺序执行\n5. 用 `{\"game\": GAME}` 启动，去掉围栏后把代码写进 `data/l54_output/my_game.py`\n\n写完后到本地用 `practice/l54_dev_team_todo.py` 真正运行一次（那里的游戏是贪吃蛇）。",
        "en": "The two YAML files are ready (`data/l54_agents.yaml`, `data/l54_tasks.yaml`). Without looking at the code above, write the crew class and have it write a Breakout game:\n1. A class `GameDevCrew` with `@CrewBase` and the two YAML paths\n2. Three `@agent` methods – `senior_engineer`, `qa_engineer`, `chief_qa_engineer` – each with `llm=llm`\n3. Three `@task` methods: `code_task`, `review_task`, `evaluate_task`\n4. A `@crew` method that runs them in order\n5. Kick off with `{\"game\": GAME}`, strip the fences and write the code to `data/l54_output/my_game.py`\n\nThen run it for real locally with `practice/l54_dev_team_todo.py` (whose game is Snake)."
      },
      "starter": {
        "zh": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom pathlib import Path\nfrom crewai import LLM, Agent, Crew, Process, Task\nfrom crewai.project import CrewBase, agent, crew, task\nfrom llm import API_KEY, BASE_URL, MODEL\n\nllm = LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY)\nGAME = \"游戏名称：打砖块。只用 tkinter；左右方向键移动挡板；砖块全部打掉就胜利，球掉下去就结束。\"\n\ndef clean_code(text):\n    lines = text.strip().split(\"\\n\")\n    if lines and lines[0].startswith(\"```\"):\n        lines = lines[1:]\n    if lines and lines[-1].startswith(\"```\"):\n        lines = lines[:-1]\n    return \"\\n\".join(lines) + \"\\n\"\n\n# 1. crew 类 GameDevCrew：两个 YAML 路径（data/l54_agents.yaml、data/l54_tasks.yaml）\n\n\n# 2. 三个 Agent 方法：senior_engineer、qa_engineer、chief_qa_engineer（都要传 llm）\n\n\n# 3. 三个任务方法：code_task、review_task、evaluate_task\n\n\n# 4. crew 方法：按顺序执行\n\n\n# 5. 用 GAME 启动；去掉围栏后把代码存到 data/l54_output/my_game.py\n",
        "en": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom pathlib import Path\nfrom crewai import LLM, Agent, Crew, Process, Task\nfrom crewai.project import CrewBase, agent, crew, task\nfrom llm import API_KEY, BASE_URL, MODEL\n\nllm = LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY)\nGAME = \"Name: Breakout. Use only tkinter; the left and right arrow keys move the paddle; clearing all the bricks wins, and the game ends when the ball falls off the bottom.\"\n\ndef clean_code(text):\n    lines = text.strip().split(\"\\n\")\n    if lines and lines[0].startswith(\"```\"):\n        lines = lines[1:]\n    if lines and lines[-1].startswith(\"```\"):\n        lines = lines[:-1]\n    return \"\\n\".join(lines) + \"\\n\"\n\n# 1. crew class GameDevCrew: the two YAML paths (data/l54_agents.yaml, data/l54_tasks.yaml)\n\n\n# 2. three agent methods: senior_engineer, qa_engineer, chief_qa_engineer (each must get llm)\n\n\n# 3. three task methods: code_task, review_task, evaluate_task\n\n\n# 4. crew method: run them in order\n\n\n# 5. start with GAME; strip the fences and save the code to data/l54_output/my_game.py\n"
      },
      "solution": {
        "zh": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom pathlib import Path\nfrom crewai import LLM, Agent, Crew, Process, Task\nfrom crewai.project import CrewBase, agent, crew, task\nfrom llm import API_KEY, BASE_URL, MODEL\n\nllm = LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY)\nGAME = \"游戏名称：打砖块。只用 tkinter；左右方向键移动挡板；砖块全部打掉就胜利，球掉下去就结束。\"\n\ndef clean_code(text):\n    lines = text.strip().split(\"\\n\")\n    if lines and lines[0].startswith(\"```\"):\n        lines = lines[1:]\n    if lines and lines[-1].startswith(\"```\"):\n        lines = lines[:-1]\n    return \"\\n\".join(lines) + \"\\n\"\n\n@CrewBase\nclass GameDevCrew:\n    agents_config = \"data/l54_agents.yaml\"\n    tasks_config = \"data/l54_tasks.yaml\"\n\n    @agent\n    def senior_engineer(self) -> Agent:\n        return Agent(config=self.agents_config[\"senior_engineer\"], llm=llm, verbose=True)\n\n    @agent\n    def qa_engineer(self) -> Agent:\n        return Agent(config=self.agents_config[\"qa_engineer\"], llm=llm, verbose=True)\n\n    @agent\n    def chief_qa_engineer(self) -> Agent:\n        return Agent(config=self.agents_config[\"chief_qa_engineer\"], llm=llm, verbose=True)\n\n    @task\n    def code_task(self) -> Task:\n        return Task(config=self.tasks_config[\"code_task\"])\n\n    @task\n    def review_task(self) -> Task:\n        return Task(config=self.tasks_config[\"review_task\"])\n\n    @task\n    def evaluate_task(self) -> Task:\n        return Task(config=self.tasks_config[\"evaluate_task\"])\n\n    @crew\n    def crew(self) -> Crew:\n        return Crew(agents=self.agents, tasks=self.tasks,\n                    process=Process.sequential, verbose=True)\n\n\nresult = GameDevCrew().crew().kickoff(inputs={\"game\": GAME})\nout = Path(\"data/l54_output/my_game.py\")\nout.parent.mkdir(parents=True, exist_ok=True)\nout.write_text(clean_code(result.raw), encoding=\"utf-8\")\nprint(\"saved:\", out)",
        "en": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom pathlib import Path\nfrom crewai import LLM, Agent, Crew, Process, Task\nfrom crewai.project import CrewBase, agent, crew, task\nfrom llm import API_KEY, BASE_URL, MODEL\n\nllm = LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY)\nGAME = \"Name: Breakout. Use only tkinter; the left and right arrow keys move the paddle; clearing all the bricks wins, and the game ends when the ball falls off the bottom.\"\n\ndef clean_code(text):\n    lines = text.strip().split(\"\\n\")\n    if lines and lines[0].startswith(\"```\"):\n        lines = lines[1:]\n    if lines and lines[-1].startswith(\"```\"):\n        lines = lines[:-1]\n    return \"\\n\".join(lines) + \"\\n\"\n\n@CrewBase\nclass GameDevCrew:\n    agents_config = \"data/l54_agents.yaml\"\n    tasks_config = \"data/l54_tasks.yaml\"\n\n    @agent\n    def senior_engineer(self) -> Agent:\n        return Agent(config=self.agents_config[\"senior_engineer\"], llm=llm, verbose=True)\n\n    @agent\n    def qa_engineer(self) -> Agent:\n        return Agent(config=self.agents_config[\"qa_engineer\"], llm=llm, verbose=True)\n\n    @agent\n    def chief_qa_engineer(self) -> Agent:\n        return Agent(config=self.agents_config[\"chief_qa_engineer\"], llm=llm, verbose=True)\n\n    @task\n    def code_task(self) -> Task:\n        return Task(config=self.tasks_config[\"code_task\"])\n\n    @task\n    def review_task(self) -> Task:\n        return Task(config=self.tasks_config[\"review_task\"])\n\n    @task\n    def evaluate_task(self) -> Task:\n        return Task(config=self.tasks_config[\"evaluate_task\"])\n\n    @crew\n    def crew(self) -> Crew:\n        return Crew(agents=self.agents, tasks=self.tasks,\n                    process=Process.sequential, verbose=True)\n\n\nresult = GameDevCrew().crew().kickoff(inputs={\"game\": GAME})\nout = Path(\"data/l54_output/my_game.py\")\nout.parent.mkdir(parents=True, exist_ok=True)\nout.write_text(clean_code(result.raw), encoding=\"utf-8\")\nprint(\"saved:\", out)"
      },
      "checks": [
        {
          "zh": "用 `@CrewBase` 装饰类 `GameDevCrew`",
          "en": "Decorates the class `GameDevCrew` with `@CrewBase`",
          "re": "@CrewBase\\s*\\n\\s*class\\s+GameDevCrew"
        },
        {
          "zh": "配置了 `agents_config` 和 `tasks_config` 两个 YAML 路径",
          "en": "Sets both `agents_config` and `tasks_config` YAML paths",
          "re": "agents_config\\s*=\\s*[\"']data/l54_agents\\.yaml[\"'][\\s\\S]*tasks_config\\s*=\\s*[\"']data/l54_tasks\\.yaml[\"']"
        },
        {
          "zh": "写了 3 个 `@agent` 方法",
          "en": "Has 3 `@agent` methods",
          "re": "@agent\\s*\\n[\\s\\S]*@agent\\s*\\n[\\s\\S]*@agent\\s*\\n"
        },
        {
          "zh": "3 个 Agent 都传了 `llm=llm`",
          "en": "All 3 agents get `llm=llm`",
          "re": "llm\\s*=\\s*llm\\b[\\s\\S]*llm\\s*=\\s*llm\\b[\\s\\S]*llm\\s*=\\s*llm\\b"
        },
        {
          "zh": "Agent 用 `config=self.agents_config[...]` 读取 YAML",
          "en": "Agents read the YAML via `config=self.agents_config[...]`",
          "re": "config\\s*=\\s*self\\.agents_config\\["
        },
        {
          "zh": "写了 3 个 `@task` 方法，用 `self.tasks_config[...]`",
          "en": "Has 3 `@task` methods using `self.tasks_config[...]`",
          "re": "(@task\\s*\\n[\\s\\S]*self\\.tasks_config\\[[\\s\\S]*){3}"
        },
        {
          "zh": "`@crew` 方法里用 `Process.sequential`",
          "en": "The `@crew` method uses `Process.sequential`",
          "re": "@crew[\\s\\S]*process\\s*=\\s*Process\\.sequential"
        },
        {
          "zh": "`kickoff(inputs={\"game\": ...})`",
          "en": "`kickoff(inputs={\"game\": ...})`",
          "re": "kickoff\\(\\s*inputs\\s*=\\s*\\{\\s*[\"']game[\"']"
        },
        {
          "zh": "去掉围栏后写入文件",
          "en": "Strips the fences and writes the file",
          "re": "write_text\\(\\s*clean_code\\(|clean_code\\([\\s\\S]*write_text\\("
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "YAML 里 `agent:` 写的名字和 `@agent` 方法名对不上（比如写成 `reviewer`），创建 crew 时报 `KeyError: 'reviewer'`。",
      "en": "The `agent:` name in the YAML doesn't match an `@agent` method (say `reviewer`): creating the crew fails with `KeyError: 'reviewer'`."
    },
    {
      "zh": "忘了给某个 Agent 传 `llm=llm`，它会去用默认的 OpenAI 模型，报缺少 `OPENAI_API_KEY`。",
      "en": "Forgetting `llm=llm` on an agent: it falls back to the default OpenAI model and complains about a missing `OPENAI_API_KEY`."
    },
    {
      "zh": "`inputs` 的键名和占位符不一致（`games` 对 `{game}`），启动时报 `Template variable 'game' not found`。",
      "en": "An `inputs` key that doesn't match the placeholder (`games` vs `{game}`): kickoff fails with `Template variable 'game' not found`."
    },
    {
      "zh": "没去掉代码围栏（三个反引号开头的行）就保存，文件第一行就是语法错误。",
      "en": "Saving without stripping the code fences (the lines starting with three backticks): line 1 of the file is then a syntax error."
    },
    {
      "zh": "不读就运行 AI 写的代码，或者让程序自动执行它。",
      "en": "Running AI-written code without reading it, or letting the program execute it automatically."
    },
    {
      "zh": "不在 `practice` 文件夹里运行：`from llm import ...` 失败，`data/l54_output` 也会落到别处（YAML 路径相对于 .py 文件，不受影响）。",
      "en": "Running from outside `practice`: `from llm import ...` fails and `data/l54_output` lands elsewhere (the YAML paths are relative to the .py file, so they still work)."
    },
    {
      "zh": "在服务里换了模型却没重启服务，结果还是旧模型写的。",
      "en": "Switching the model in the service without restarting it, so the old model is still writing the code."
    }
  ],
  "recap": [
    {
      "zh": "多 Agent 写代码就是分工：写代码 → 查错修复 → 确认完整，每个 Agent 只做一件事。",
      "en": "Multi-agent coding is division of labour: write → find and fix → confirm complete, one job per agent."
    },
    {
      "zh": "Agent 和任务的文字放在 YAML 里，`@CrewBase` 类负责组装；YAML 的键名就是方法名。",
      "en": "Agent and task texts live in YAML and the `@CrewBase` class wires them up; YAML keys are the method names."
    },
    {
      "zh": "顺序流程里不写 `context`，任务会自动拿到前面所有任务的输出。",
      "en": "In a sequential crew, a task without `context` automatically gets every earlier output."
    },
    {
      "zh": "要求只输出代码；保存前去掉围栏、用 `ast.parse` 查语法；读过再手动运行。",
      "en": "Ask for code only; strip fences and check syntax with `ast.parse` before saving; read it, then run it by hand."
    },
    {
      "zh": "模型对代码质量影响很大：多试几个模型、把提示词写细；在服务里换模型要重启。",
      "en": "The model matters a lot: try several and write detailed prompts; restart the service after switching models."
    }
  ],
  "files": [
    {
      "path": "practice/l54_dev_team_todo.py",
      "zh": "练习：补全 `@CrewBase` 类，让三人小组写贪吃蛇（有 TODO 提示）。",
      "en": "Exercise: complete the `@CrewBase` class so the team writes Snake (with TODO hints)."
    },
    {
      "path": "practice/l54_dev_team_solution.py",
      "zh": "参考答案：YAML + `@CrewBase` 的三人开发小组，清理围栏、检查语法后保存代码。",
      "en": "Solution: the YAML + `@CrewBase` dev team; strips fences, checks syntax and saves the code."
    },
    {
      "path": "practice/data/l54_agents.yaml",
      "zh": "三个 Agent 的设定（按视频的角色改写）。",
      "en": "The three agents (rewritten from the video's roles)."
    },
    {
      "path": "practice/data/l54_tasks.yaml",
      "zh": "三个任务的说明，带 `{game}` 占位符。",
      "en": "The three task descriptions with the `{game}` placeholder."
    },
    {
      "path": "practice/data/l54_output/snake_game.py",
      "zh": "一次真实运行生成的贪吃蛇（先读再运行）。",
      "en": "The Snake game from one real run (read it before running it)."
    }
  ]
});
