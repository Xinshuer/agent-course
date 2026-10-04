COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
 "id": "l57",
 "priority": "important",
 "handwrite": true,
 "studyMinutes": 50,
 "source": "subtitle",
 "summary": {
  "zh": "视频用 CrewAI 0.74 的 **Pipeline（流水线）** 改造「营销战略协作智能体」项目：先把 crewai 升级到 0.74.2、修好两处报错，再分三步测试——直接运行原来的 Crew、按官方文档把它放进 Pipeline、把它拆成两个 Crew 串成两个阶段——最后接进 FastAPI 对外提供接口。Pipeline 在 crewai 1.x 里已经删除，所以这一节学它的设计思想（阶段、串行、并行、上一阶段的输出交给下一阶段），在 1.15.23 里用 `kickoff` 手写同样的流水线和并行阶段，并看一眼官方替代品 Flow 的写法。",
  "en": "The video uses CrewAI 0.74's **Pipeline** feature to rework the “marketing strategy crew” project: upgrade crewai to 0.74.2 and fix two errors, then test in three steps – run the original crew directly, put it into a Pipeline as the docs show, split it into two crews chained as two stages – and finally serve it through FastAPI. Pipeline was removed in crewai 1.x, so this lesson teaches its design idea (stages, sequential, parallel, one stage's output feeding the next), hand-writes the same pipeline and a parallel stage with `kickoff` in 1.15.23, and takes a first look at the official replacement, Flow."
 },
 "goals": [
  {
   "zh": "说清 Pipeline 是什么：编排多个 Crew 的「阶段」，以及串行和并行的区别",
   "en": "Explain what a Pipeline is – “stages” that orchestrate several crews – and sequential vs parallel"
  },
  {
   "zh": "看懂视频里 0.74 的 Pipeline 写法和升级后的两处修改，知道它们在 1.15.23 里的情况",
   "en": "Read the video's 0.74 Pipeline code and its two upgrade fixes, and know how each looks in 1.15.23"
  },
  {
   "zh": "手写两阶段流水线：把上一阶段的 `result.raw` 放进下一阶段的 `inputs`",
   "en": "Hand-write a two-stage pipeline: put the previous stage's `result.raw` into the next stage's `inputs`"
  },
  {
   "zh": "用 `kickoff_async` + `asyncio.gather` 写并行阶段，并能把示意图对应到 Flow 的 `@start` / `@listen` / `and_`",
   "en": "Build a parallel stage with `kickoff_async` + `asyncio.gather`, and map the diagram onto a Flow's `@start` / `@listen` / `and_`"
  },
  {
   "zh": "把流水线接进 FastAPI 接口，并用客户端脚本测试",
   "en": "Serve the pipeline from a FastAPI endpoint and test it with a client script"
  }
 ],
 "blocks": [
  {
   "t": "h",
   "zh": "一、这一集讲什么",
   "en": "1. What this episode covers"
  },
  {
   "t": "video",
   "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=0) 这一集接着第 55 集做的「营销战略协作智能体」项目（就是本课 [55 节](#/lesson/l55) 的项目，参考代码 `practice/l55_json_tasks_solution.py`），在原来的 crewai_test 项目里新建一个 Pipeline 版本的文件夹，讲 CrewAI 的 **Pipeline（流水线）**。[▶ 00:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=31) 老师先列出本集要做的三件事：\n1. 把 crewai 从之前项目用的旧版本（0.5x）升级到 0.74.2、crewai-tools 从 0.12.0 升级到 0.13.2（录制当天的最新版），并修好升级带来的报错；\n2. 把 `crew.py` 复制一份成 `crew_pipeline.py`，在里面单独测试 Pipeline；\n3. 测通后把 Pipeline 接进 `main.py` 的 FastAPI 服务，用 API 测试脚本发请求联调。\n\n项目本身：3 个 Agent（首席市场分析师做市场调研、首席营销战略师制定营销方案、首席创意内容创作者写广告文案）、5 个 Task，最终输出 `{title, body}` 结构的 JSON。模型方面，视频通过一个代理平台调用 OpenAI 的 **GPT-4o-mini**，也提到可以用 One-API 转接通义千问等国产模型，或者用 Ollama 跑本地模型；本课统一用 DeepSeek（deepseek-flash）。",
   "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=0) This episode continues the “marketing strategy crew” project from episode 55 (this course's [lesson 55](#/lesson/l55); reference code `practice/l55_json_tasks_solution.py`): a new Pipeline-version folder goes into the old crewai_test project, and the topic is CrewAI's **Pipeline**. [▶ 00:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=31) The instructor first lists the three things this episode does:\n1. upgrade crewai from the older version used before (0.5x) to 0.74.2 and crewai-tools from 0.12.0 to 0.13.2 (the latest on the day of recording), and fix the errors the upgrade causes;\n2. copy `crew.py` to `crew_pipeline.py` and test Pipeline on its own there;\n3. once that works, wire the Pipeline into the FastAPI service in `main.py` and test it end to end with an API test script.\n\nThe project itself: 3 agents (a lead market analyst for market research, a chief marketing strategist for the marketing plan, a chief creative content creator for the ad copy) and 5 tasks, with JSON shaped `{title, body}` as the final output. For the model, the video calls OpenAI's **GPT-4o-mini** through a proxy platform, and mentions One-API for routing to Chinese models such as Qwen, or Ollama for local models; this course uses DeepSeek (deepseek-flash) throughout."
  },
  {
   "t": "p",
   "zh": "本课环境是 **crewai 1.15.23**（`.venv-crewai`），里面已经没有 Pipeline 了：`from crewai import Pipeline` 会直接报 `ImportError`（已实测）。所以这一节这样安排：按视频的顺序弄懂 Pipeline 的概念和写法，视频里的 0.74 代码只作对照；每一步再给出 1.15.23 里能运行的写法——手写的两阶段流水线、并行阶段、官方的替代品 Flow，以及 FastAPI 服务。新写法都在本机实际运行过。",
   "en": "The course environment has **crewai 1.15.23** (`.venv-crewai`), which no longer contains Pipeline: `from crewai import Pipeline` fails straight away with `ImportError` (tested). So this lesson follows the video's order to understand the Pipeline idea and code, keeps the video's 0.74 code for reference only, and gives a version that runs on 1.15.23 at each step – a hand-written two-stage pipeline, a parallel stage, the official replacement (Flow) and the FastAPI service. Every new-style snippet was actually run on this machine."
  },
  {
   "t": "h",
   "zh": "二、Pipeline 是什么",
   "en": "2. What a Pipeline is"
  },
  {
   "t": "p",
   "zh": "[▶ 01:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=93) 老师先讲概念：Pipeline 是一种**结构化的工作流**，让多个 Crew 按顺序或并行执行，组织成若干个「阶段」（stage），前一个阶段的输出作为后一个阶段的输入。回顾一下层级：Agent + Task 组成 **Crew**，Crew 安排的是 Agent 和 Task；**Pipeline** 再往上一层，安排的是一个个 **Crew**。\n\n| 术语 | 意思 |\n|---|---|\n| 阶段 stage | 流水线里的一步：一个 Crew，或几个并行的 Crew |\n| 串行 | 上一个阶段完成后，下一个阶段才开始 |\n| 并行（分支） | 同一阶段里的几个 Crew 同时运行，拿到相同的输入 |\n| kickoff | 启动整条流水线 |\n| 轨迹 trace | 记录一份输入经过了哪些阶段 |\n\n[▶ 02:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=124) 老师用一张示意图说明：crew1 先运行，结果同时交给 crew2 和 crew3 并行处理，两个都完成后再交给 crew4。",
   "en": "[▶ 01:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=93) The instructor starts with the concept: a Pipeline is a **structured workflow** that runs several crews in sequence or in parallel, organised into “stages”, with one stage's output becoming the next stage's input. Recall the layers: Agents + Tasks make a **Crew**, which orders agents and tasks; a **Pipeline** sits one level higher and orders **crews**.\n\n| Term | Meaning |\n|---|---|\n| stage | One step of the pipeline: one crew, or several crews in parallel |\n| sequential | The next stage starts only after the previous one finishes |\n| parallel (branch) | Several crews in one stage run at the same time on the same input |\n| kickoff | Starts the whole pipeline |\n| trace | Records which stages one input went through |\n\n[▶ 02:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=124) He explains it with a diagram: crew1 runs first, its result goes to crew2 and crew3 in parallel, and once both finish, crew4 takes over."
  },
  {
   "t": "code",
   "lang": "text",
   "file": "pipeline.txt",
   "code": {
    "zh": "            ┌──> crew2 ──┐\n输入 ──> crew1          ├──> crew4 ──> 输出\n            └──> crew3 ──┘\n   阶段 1      阶段 2        阶段 3\n  （串行）    （并行）      （串行）",
    "en": "             ┌──> crew2 ──┐\ninput ──> crew1          ├──> crew4 ──> output\n             └──> crew3 ──┘\n   stage 1     stage 2       stage 3\n (sequential) (parallel)   (sequential)"
   }
  },
  {
   "t": "check",
   "q": {
    "zh": "Pipeline 直接安排先后顺序的对象是什么？",
    "en": "What does a Pipeline put in order directly?"
   },
   "options": [
    {
     "zh": "单个 Agent",
     "en": "Individual agents"
    },
    {
     "zh": "单个 Task",
     "en": "Individual tasks"
    },
    {
     "zh": "Crew",
     "en": "Crews"
    },
    {
     "zh": "模型的每一次 API 请求",
     "en": "Each API request to the model"
    }
   ],
   "answer": 2,
   "explain": {
    "zh": "Crew 编排 Agent 和 Task；Pipeline 再往上一层，编排的是一个个 Crew。",
    "en": "A crew orders agents and tasks; a Pipeline sits one level up and orders crews."
   }
  },
  {
   "t": "py",
   "title": {
    "zh": "回顾：函数当值 + 合并字典——流水线就是一个 for 循环",
    "en": "Review: functions as values + merging dicts – a pipeline is one for loop"
   },
   "zh": "这一集没有新的 Python 语法，用到的都学过，放在一起就是流水线的核心：\n- **函数本身是一个值**（回顾 25、47 节）：`analyse` 不加括号指的是函数本身，可以放进列表 `stages = [analyse, write_copy]`；`analyse(data)` 加了括号才是调用它。\n- **合并字典** `{**data, \"analysis\": text}`（回顾 26 节）：生成一个**新字典**，包含 `data` 的全部内容再加一个新键，原来的 `data` 不变；同名的键，写在后面的覆盖前面的。\n\n`for stage in stages: data = stage(data)` 这一行就是整条流水线：每一步把结果交给下一步。下面的 CrewAI 版本，只是把每个函数换成了一个 Crew。",
   "en": "This episode brings no new Python syntax; combining things you already know gives the core of a pipeline:\n- **A function is a value** (see lessons 25 and 47): `analyse` without parentheses is the function itself, so it can go in a list, `stages = [analyse, write_copy]`; `analyse(data)` with parentheses calls it.\n- **Merging dicts** `{**data, \"analysis\": text}` (see lesson 26): builds a **new dict** with everything in `data` plus one more key, leaving `data` unchanged; for duplicate keys the later one wins.\n\nThe line `for stage in stages: data = stage(data)` is the whole pipeline: each step hands its result to the next. The CrewAI versions below just swap each function for a crew.",
   "code": {
    "zh": "def analyse(data):\n    # 返回一个新字典：data 里原有的全部内容 + 新的 \"analysis\"\n    return {**data, \"analysis\": f\"{data['shop']} 的顾客多是附近上班族\"}\n\ndef write_copy(data):\n    return {**data, \"copy\": f\"给上班族的一杯{data['product']}\"}\n\nstages = [analyse, write_copy]     # 函数本身也可以放进列表（注意没有括号）\ndata = {\"shop\": \"街角咖啡\", \"product\": \"桂花冷萃\"}\n\nfor stage in stages:\n    data = stage(data)             # 上一步的输出，成为下一步的输入\n    print(stage.__name__, \"之后的键：\", list(data))\n\nprint(data[\"copy\"])\n\n# 同名的键：写在后面的覆盖前面的\nprint({**{\"a\": 1, \"b\": 2}, \"a\": 100})   # {'a': 100, 'b': 2}",
    "en": "def analyse(data):\n    # return a NEW dict: everything already in data + a new \"analysis\"\n    return {**data, \"analysis\": f\"Most customers of {data['shop']} are office workers nearby\"}\n\ndef write_copy(data):\n    return {**data, \"copy\": f\"A cup of {data['product']} for the office crowd\"}\n\nstages = [analyse, write_copy]     # functions themselves can go in a list (note: no parentheses)\ndata = {\"shop\": \"Corner Coffee\", \"product\": \"osmanthus cold brew\"}\n\nfor stage in stages:\n    data = stage(data)             # one step's output becomes the next step's input\n    print(stage.__name__, \"-> keys now:\", list(data))\n\nprint(data[\"copy\"])\n\n# Duplicate keys: the later one wins\nprint({**{\"a\": 1, \"b\": 2}, \"a\": 100})   # {'a': 100, 'b': 2}"
   }
  },
  {
   "t": "h",
   "zh": "三、官网为什么找不到 Pipeline 了",
   "en": "3. Why the docs no longer show Pipeline"
  },
  {
   "t": "p",
   "zh": "[▶ 03:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=186) 老师打开官网时发现，左侧目录里已经找不到 Pipeline 了。[▶ 03:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=216) 他翻了更新日志：录制前几天发布的 0.74.0 就把这部分文档撤掉了。他的判断是：官方新推出的 **Flows**（下一集）和 Pipeline 功能重叠、而且更强，Pipeline 迟早会被放弃。[▶ 04:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=248) 不过他认为 Pipeline 的设计思想仍然值得学——弄懂了再学 Flows 会很顺；当时把文档网址里的 flows 改成 pipeline，还能打开旧文档。",
   "en": "[▶ 03:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=186) When the instructor opens the official site, Pipeline is gone from the table of contents on the left. [▶ 03:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=216) He checks the changelog: 0.74.0, released a few days before the recording, took that part of the docs down. His view: the newly launched **Flows** (next episode) overlap with Pipeline and are more powerful, so Pipeline will be dropped sooner or later. [▶ 04:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=248) Still, he thinks Pipeline's design idea is worth learning – once you get it, Flows come easily; back then, changing flows to pipeline in the docs URL still opened the old page."
  },
  {
   "t": "warn",
   "zh": "老师的判断应验了：crewai 1.x 已经彻底删除 Pipeline。在本课环境（1.15.23）里，`from crewai import Pipeline` 报 `ImportError: cannot import name 'Pipeline'`。网上的旧教程、或者 AI 根据旧资料写出的 Pipeline 代码都跑不起来：要么像第七节那样手写，要么用第八节的 Flow。",
   "en": "The instructor was right: crewai 1.x removed Pipeline completely. In the course environment (1.15.23), `from crewai import Pipeline` raises `ImportError: cannot import name 'Pipeline'`. Pipeline code from old tutorials – or from an AI trained on old material – will not run: hand-write it as in part 7, or use a Flow as in part 8."
  },
  {
   "t": "h",
   "zh": "四、准备工作，以及升级后的两处报错",
   "en": "4. Preparation, and the two errors after upgrading"
  },
  {
   "t": "p",
   "zh": "[▶ 04:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=279) 老师先回顾项目里的 3 个 Agent 和 5 个 Task，[▶ 05:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=310) 再讲准备工作：用 Anaconda + PyCharm 搭开发环境；模型可以用 GPT、国产模型（通义千问、智谱、百度千帆等）或 Ollama 本地模型；[▶ 06:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=373) 把源码文件夹放进之前的 crewai_test 项目根目录，或者新建项目并配置虚拟环境。本课不需要这些步骤：练习文件都在 `practice`，CrewAI 用 `.venv-crewai` 运行，模型用 DeepSeek（`practice/llm.py`）。\n\n[▶ 07:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=435) 视频的测试流程分三块：升级版本 → 单独测试 Pipeline（先测原来的 Crew，再按官方文档和自己的方式各测一次）→ 接进 main 服务联调。[▶ 07:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=467) 升级用 `pip install --upgrade` 加两个包名，再查一下版本。老师建议先用和他一样的版本跑通，再自己升级，免得版本不同带来莫名其妙的问题。这个建议现在依然适用：本课环境固定为 crewai 1.15.23（crewai-tools 也是 1.15.23），**不要**跟着视频升级或降级。查看版本：",
   "en": "[▶ 04:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=279) The instructor recaps the project's 3 agents and 5 tasks, [▶ 05:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=310) then the preparation: Anaconda + PyCharm for the development environment; GPT, Chinese models (Qwen, Zhipu, Baidu Qianfan and others) or a local Ollama model; [▶ 06:13](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=373) putting the source-code folder into the old crewai_test project root, or creating a new project with a virtual environment. You don't need any of that here: the practice files live in `practice`, CrewAI runs in `.venv-crewai` and the model is DeepSeek (`practice/llm.py`).\n\n[▶ 07:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=435) The video's test plan has three parts: upgrade → test Pipeline on its own (the original crew first, then once the official way and once his own way) → wire it into the main service. [▶ 07:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=467) The upgrade is `pip install --upgrade` with the two package names, followed by a version check. He advises running everything on his versions first and upgrading later, to avoid odd version-related bugs. That advice still holds: the course environment is pinned to crewai 1.15.23 (crewai-tools is 1.15.23 too), so do **not** upgrade or downgrade along with the video. To check the versions:"
  },
  {
   "t": "code",
   "lang": "powershell",
   "file": "PowerShell",
   "code": {
    "zh": "# 只查看，不升级 / look only - don't upgrade\n& ..\\.venv-crewai\\Scripts\\python.exe -m pip show crewai crewai-tools",
    "en": "# look only - don't upgrade\n& ..\\.venv-crewai\\Scripts\\python.exe -m pip show crewai crewai-tools"
   }
  },
  {
   "t": "p",
   "zh": "[▶ 10:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=653) 升级后有两处报错，老师在新代码里改好了，并讲了原因。对照一下现在的情况：\n\n| 问题 | 视频里（0.74.2）的做法 | 现在（1.15.23） |\n|---|---|---|\n| 怎样给 Agent 配模型 | 以前用 LangChain 的 `ChatOpenAI`，升级后报错；改用 CrewAI 自己的 `LLM` 类，封装在 `utils/myLLM.py` 里 | 一样用 `LLM(...)`（回顾 51 节）；本课的练习文件用 55 节的 `llm` |\n| `output_json` 还要配一套默认模型 | [▶ 11:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=715) 老师的解释：Task 的 `output_json` 把结果转成 JSON 时，依赖 CrewAI 默认的 OpenAI 模型配置（默认是 GPT-4o-mini），所以 `main.py` 里还要用环境变量把地址、key 和模型名配好 | 不需要：转换直接用 Agent 自己的模型对象（源码里是 `agent.function_calling_llm or agent.llm`），地址和 key 跟着它走。Agent 没配模型时，默认模型现在是 `gpt-4.1-mini` |\n\n[▶ 12:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=778) 老师特别强调这是**两套配置**：环境变量是给 `output_json` 用的默认模型；`myLLM.py` 是给 Agent 用的「外部模型」，[▶ 18:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1094) 好处是除了地址、key 和模型名，还能设温度、超时、最大重试次数等参数，更灵活。在 1.15.23 里只需要 Agent 的那一套，写法如下：",
   "en": "[▶ 10:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=653) The upgrade caused two errors; the instructor fixed both in the new code and explained why. Compared with today:\n\n| Issue | In the video (0.74.2) | Now (1.15.23) |\n|---|---|---|\n| How to give an agent its model | LangChain's `ChatOpenAI`, used before, errors after the upgrade; switch to CrewAI's own `LLM` class, wrapped in `utils/myLLM.py` | Still `LLM(...)` (see lesson 51); this lesson's practice files use lesson 55's `llm` |\n| `output_json` needs a default model set up too | [▶ 11:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=715) The instructor's explanation: when a task's `output_json` turns the result into JSON, it relies on CrewAI's default OpenAI model settings (GPT-4o-mini by default), so `main.py` also sets the URL, key and model name in environment variables | Not needed: the conversion uses the agent's own model object (`agent.function_calling_llm or agent.llm` in the source), and the URL and key come with it. An agent with no model now defaults to `gpt-4.1-mini` |\n\n[▶ 12:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=778) The instructor stresses that these are **two separate settings**: the environment variables give `output_json` its default model; `myLLM.py` gives the agents an “external model”, [▶ 18:14](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1094) which is more flexible – besides the URL, key and model name you can set temperature, timeout, maximum retries and so on. In 1.15.23 you only need the agents' settings, written like this:"
  },
  {
   "t": "code",
   "file": {
    "zh": "utils/myLLM.py（现代写法）",
    "en": "utils/myLLM.py (modern version)"
   },
   "code": {
    "zh": "# 视频 utils/myLLM.py 的思路，换成 crewai 1.15.23 + DeepSeek 的写法\nimport os\nfrom crewai import LLM\n\ndef my_llm():\n    return LLM(\n        model=\"openai/deepseek-flash\",           # openai/ 前缀：按 OpenAI 兼容格式调用\n        base_url=\"https://api.deepseek.com\",\n        api_key=os.environ[\"DEEPSEEK_API_KEY\"],  # key 从环境变量读，不写进代码\n        timeout=60,                              # 超时（秒）\n        max_retries=2,                           # 出错时最多重试几次\n    )\n\n# 然后：Agent(role=..., goal=..., backstory=..., llm=my_llm())",
    "en": "# The idea of the video's utils/myLLM.py, rewritten for crewai 1.15.23 + DeepSeek\nimport os\nfrom crewai import LLM\n\ndef my_llm():\n    return LLM(\n        model=\"openai/deepseek-flash\",           # the openai/ prefix: call it in the OpenAI-compatible format\n        base_url=\"https://api.deepseek.com\",\n        api_key=os.environ[\"DEEPSEEK_API_KEY\"],  # the key comes from an environment variable, never the code\n        timeout=60,                              # timeout in seconds\n        max_retries=2,                           # retry at most twice on errors\n    )\n\n# then: Agent(role=..., goal=..., backstory=..., llm=my_llm())"
   },
   "note": {
    "zh": "这段在 1.15.23 上创建过：`LLM(...)` 接受 `timeout`、`max_retries`，也接受 `temperature`，不过 deepseek-flash 默认处于思考模式，温度几乎不起作用。练习文件统一用 55 节的 `llm`，它和这里的对象一样，只多做了一件事，见下面的提示。",
    "en": "Created on 1.15.23: `LLM(...)` accepts `timeout` and `max_retries`, and `temperature` too, although deepseek-flash runs in thinking mode by default, where temperature has almost no effect. The practice files all use lesson 55's `llm`, which is the same kind of object with one extra change – see the tip below."
   }
  },
  {
   "t": "tip",
   "zh": "为什么练习文件导入 `l55_deepseek_llm` 里的 `llm`，而不是直接用上面的 `LLM(...)`？因为 Task 设置了 `output_pydantic` / `output_json` 时，crewai 1.15.23 会要求模型按 json_schema 格式回答，DeepSeek 不支持这种格式，会返回 400：`This response_format type is unavailable now`。55 节的 `DeepSeekLLM` 不把这个要求发给 API，改由 CrewAI 自己解析回答里的 JSON。不用 `output_pydantic` / `output_json` 的 Crew，普通的 `LLM(...)` 就够了；视频用的 GPT-4o-mini 支持 json_schema，所以视频里没有这个问题。",
   "en": "Why do the practice files import `llm` from `l55_deepseek_llm` instead of using the `LLM(...)` above? With `output_pydantic` / `output_json` on a task, crewai 1.15.23 asks the model to answer in json_schema format, which DeepSeek does not support, so the API returns 400: `This response_format type is unavailable now`. Lesson 55's `DeepSeekLLM` doesn't send that request to the API and lets CrewAI parse the JSON in the answer itself. Crews without `output_pydantic` / `output_json` are fine with a plain `LLM(...)`; the video's GPT-4o-mini supports json_schema, so the video never hits this."
  },
  {
   "t": "h",
   "zh": "五、第一步：先把原来的 Crew 跑通",
   "en": "5. Step 1: make sure the original crew runs"
  },
  {
   "t": "p",
   "zh": "[▶ 15:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=905) 改代码之前，老师先直接运行原来的 Crew，确认它本身没问题。[▶ 15:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=937) 运行前要准备两样：把模型的 key、代理地址和模型名（GPT-4o-mini）换成自己的；[▶ 16:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1003) 项目里的 Agent 用到了联网搜索工具，要到搜索服务的官网申请一个 API key。[▶ 18:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1127) 代码和之前的项目一样：Crew 类从 YAML 文件读取 Agent 和 Task 的提示词，模型通过 `myLLM` 传给 Agent，部分 Task 用 `output_json` 按 utils 里定义的模型输出 JSON；Crew 按顺序执行，用 `kickoff` 传入和之前视频一样的问题。[▶ 19:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1189) 跑完得到一个 `{title, body}` 结构的 JSON。\n\n视频这一步运行的就是 55 节那个完整的 Crew（3 个 Agent、5 个 Task）；想完全照做，可以运行 `practice/l55_json_tasks_solution.py`（5 次模型调用）。下面是本课的精简版：分析师和文案创作者放进**同一个** Crew，只保留 2 个 Agent、2 个 Task，省钱也省时间；搜索工具也省掉了（需要单独申请搜索服务的 key，工具用法见 52 节）。输入和视频一样，就是 55 节的那个问题——为 emqx.com 策划一次推广活动。它写在 `l57_pipeline_solution.py` 的 `INPUTS` 里，这一节和下一节的其他文件都直接导入它。",
   "en": "[▶ 15:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=905) Before changing any code, the instructor runs the original crew as it is to make sure it works. [▶ 15:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=937) Two things are needed first: replace the model key, proxy URL and model name (GPT-4o-mini) with your own; [▶ 16:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1003) and since the project's agents use a web-search tool, get an API key from the search service's website. [▶ 18:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1127) The code is the same as in the earlier project: the crew class reads the agents' and tasks' prompts from YAML files, the model reaches the agents through `myLLM`, some tasks use `output_json` to produce JSON following the data models defined in utils, and the crew runs sequentially, with `kickoff` passing in the same question as in the earlier video. [▶ 19:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1189) The run ends with JSON shaped `{title, body}`.\n\nIn this step the video runs lesson 55's full crew (3 agents, 5 tasks); to follow it exactly, run `practice/l55_json_tasks_solution.py` (5 model calls). Below is this lesson's slimmed-down version: the analyst and the copywriter go into **one** crew, with just 2 agents and 2 tasks to save money and time; the search tool is dropped too (it needs a separate key from a search service; see lesson 52 for using tools). The input is the same as the video's – lesson 55's question, planning a promotion campaign for emqx.com. It lives in `INPUTS` in `l57_pipeline_solution.py`, and the other files of this lesson and the next import it from there."
  },
  {
   "t": "code",
   "file": "l57_single_crew.py",
   "code": {
    "zh": "analyst = Agent(role=\"首席市场分析师\", goal=\"深入分析 {customer_domain} 的产品、目标客户和竞争对手\",\n                backstory=\"你在一家一流的数字营销公司做首席市场分析师，结论简短、有依据。\", llm=llm)\nwriter = Agent(role=\"首席创意内容创作者\", goal=\"把市场分析变成一条吸引人的社交媒体营销文案\",\n               backstory=\"你在一家一流的数字营销公司做首席创意内容创作者，文案短小、抓人眼球。\", llm=llm)\n\nresearch_task = Task(\n    description=\"客户：{customer_domain}\\n项目：{project_description}\\n\"\n                \"分析目标客户、主要竞争对手，以及一个最值得抓住的机会。\",\n    expected_output=\"3 条中文要点，每条不超过 40 个字。\",\n    agent=analyst,\n)\ncopy_task = Task(\n    # 没写分析结果：同一个 Crew 里，上一个 Task 的输出会自动交给它\n    description=\"根据前面的市场分析，为 {customer_domain} 写一条社交媒体营销文案。\",\n    expected_output=\"一个标题和一段不超过 80 个字的正文。\",\n    agent=writer,\n    output_pydantic=Copy,                 # Copy = {title, body}，定义在 l57_pipeline_solution.py\n)\ncrew = Crew(agents=[analyst, writer], tasks=[research_task, copy_task], process=Process.sequential)\n\nresult = crew.kickoff(inputs=INPUTS)      # INPUTS：视频的输入（emqx.com），也定义在 l57_pipeline_solution.py\nprint(result.pydantic.title)\nprint(result.pydantic.body)",
    "en": "analyst = Agent(role=\"Lead Market Analyst\", goal=\"Analyse the products, target customers and competitors of {customer_domain} in depth\",\n                backstory=\"You are the lead market analyst at a top digital marketing agency; your conclusions are brief and well-founded.\", llm=llm)\nwriter = Agent(role=\"Chief Creative Content Creator\", goal=\"Turn the market analysis into one engaging social-media marketing post\",\n               backstory=\"You are the chief creative content creator at a top digital marketing agency; your copy is short and catchy.\", llm=llm)\n\nresearch_task = Task(\n    description=\"Client: {customer_domain}\\nProject: {project_description}\\n\"\n                \"Analyse the target customers, the main competitors and the one opportunity most worth seizing.\",\n    expected_output=\"3 bullet points in English, each at most 40 words.\",\n    agent=analyst,\n)\ncopy_task = Task(\n    # no analysis written here: inside one crew, the previous task's output is handed over automatically\n    description=\"Based on the market analysis above, write one social-media marketing post for {customer_domain}.\",\n    expected_output=\"A title and a body of at most 80 words.\",\n    agent=writer,\n    output_pydantic=Copy,                 # Copy = {title, body}, defined in l57_pipeline_solution.py\n)\ncrew = Crew(agents=[analyst, writer], tasks=[research_task, copy_task], process=Process.sequential)\n\nresult = crew.kickoff(inputs=INPUTS)      # INPUTS: the video's input (emqx.com), also defined in l57_pipeline_solution.py\nprint(result.pydantic.title)\nprint(result.pydantic.body)"
   },
   "note": {
    "zh": "在本机用 DeepSeek 实际运行过：2 次模型调用，返回 `Copy(title=..., body=...)`（这次的标题是「云厂商锁不住的连接自由——EMQX」）。注意文案任务的描述里**没有**写分析结果：同一个 Crew 按顺序执行时，CrewAI 会自动把前面 Task 的输出交给后面的 Task（就是 54 节的 context）。拆成两个 Crew 以后，这种自动传递就没有了，要自己传——这是第七节的重点。完整文件 `practice/l57_single_crew.py`。",
    "en": "Actually run on this machine with DeepSeek: 2 model calls, returning `Copy(title=..., body=...)` (this run's title, translated: “Connection freedom no cloud vendor can lock in – EMQX”). Note that the copy task's description does **not** contain the analysis: when one crew runs sequentially, CrewAI hands earlier tasks' output to the later tasks automatically (the context from lesson 54). Once you split it into two crews, that automatic hand-over is gone and you pass the data yourself – the focus of part 7. Full file: `practice/l57_single_crew.py`."
   }
  },
  {
   "t": "h",
   "zh": "六、第二步：按官方文档把 Crew 放进 Pipeline（0.74，仅供对照）",
   "en": "6. Step 2: put the crew into a Pipeline, as the docs show (0.74, reference only)"
  },
  {
   "t": "p",
   "zh": "[▶ 20:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1220) 第二种测试照官方文档来。[▶ 20:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1250) 文档里先定义一个 Pipeline，`stages` 里放每个阶段的 Crew，再调用 `kickoff` 运行——它是一个**异步**方法。[▶ 21:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1281) 老师先把原来的整个 Crew 当成唯一的阶段放进去，按文档的格式准备输入数据，写一个 `async` 函数调用 `kickoff`，[▶ 22:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1373) 打印出最终的 JSON（还是 `{title, body}`）和 token 用量（提示词和生成各用了多少 token、成功请求了几次）。",
   "en": "[▶ 20:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1220) The second test follows the official docs. [▶ 20:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1250) The docs define a Pipeline with each stage's crew in `stages`, then run it with `kickoff` – an **async** method. [▶ 21:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1281) The instructor puts the whole original crew in as the only stage, prepares the input in the format the docs ask for, writes an `async` function that calls `kickoff`, [▶ 22:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1373) and prints the final JSON (still `{title, body}`) and the token usage (prompt and completion tokens, number of successful requests)."
  },
  {
   "t": "code",
   "file": "crew_pipeline.py (crewai 0.74)",
   "code": {
    "zh": "# crewai 0.74 的写法（视频第二种测试的大意）—— 1.x 已经删除 Pipeline，本课环境里不能运行\nimport asyncio\nfrom crewai import Pipeline\n\n# stages 里一项 = 一个阶段。这里只有一个阶段：原来的整个 Crew\nmy_pipeline = Pipeline(stages=[marketing_crew])\n\ninputs = {\"customer_domain\": \"...\", \"project_description\": \"...\"}\n\nasync def main():\n    results = await my_pipeline.kickoff([inputs])   # 异步方法；参数是「字典的列表」，可以一次跑多组输入\n    for result in results:                          # 每组输入对应一个结果\n        print(result.json_dict)                     # 最后一个阶段的 JSON 输出：{title, body}\n        print(result.token_usage)                   # 每个 Crew 的 token 用量\n\nasyncio.run(main())",
    "en": "# The crewai 0.74 way (the gist of the video's second test) - Pipeline is gone in 1.x, so this does NOT run here\nimport asyncio\nfrom crewai import Pipeline\n\n# one item in stages = one stage. Just one stage here: the whole original crew\nmy_pipeline = Pipeline(stages=[marketing_crew])\n\ninputs = {\"customer_domain\": \"...\", \"project_description\": \"...\"}\n\nasync def main():\n    results = await my_pipeline.kickoff([inputs])   # an async method; takes a LIST of dicts, several inputs at once\n    for result in results:                          # one result per input\n        print(result.json_dict)                     # the last stage's JSON output: {title, body}\n        print(result.token_usage)                   # token usage of each crew\n\nasyncio.run(main())"
   },
   "note": {
    "zh": "按 crewai 0.74.2 的源码核对过：`stages` 的每一项是一个 Crew 或一个 Crew 列表；`kickoff` 是 `async def kickoff(self, inputs: List[Dict]) -> List[PipelineKickoffResult]`，每份输入返回一个结果，带 `raw`、`pydantic`、`json_dict`、`token_usage`、`trace`、`crews_outputs`。",
    "en": "Checked against the crewai 0.74.2 source: each item of `stages` is a crew or a list of crews; `kickoff` is `async def kickoff(self, inputs: List[Dict]) -> List[PipelineKickoffResult]` and returns one result per input, with `raw`, `pydantic`, `json_dict`, `token_usage`, `trace` and `crews_outputs`."
   }
  },
  {
   "t": "h",
   "zh": "七、第三步：拆成两个 Crew，串成两个阶段",
   "en": "7. Step 3: split into two crews, chained as two stages"
  },
  {
   "t": "p",
   "zh": "[▶ 23:24](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1404) 第三种测试是老师自己的写法。前两次放进 Pipeline 的都是同一个 Crew，这次把它拆开：[▶ 24:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1465) **crew A** 只有首席市场分析师和市场调研任务；**crew B** 是另外两个 Agent 和剩下的 4 个 Task。然后参照官方写法，用 `@pipeline` 装饰器写一个 `my_pipeline` 方法，返回 `Pipeline(stages=[crew_a, crew_b])`：先执行 crew A，它的最后输出交给 crew B，crew B 带着这个结果继续执行。[▶ 25:26](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1526) 调用也更简单：一个 `async` 的 `test_pipeline` 函数直接调用 `my_pipeline` 的 `kickoff`。结果和前两次一样是 `{title, body}`。",
   "en": "[▶ 23:24](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1404) The third test is the instructor's own approach. Both earlier tests put the same single crew into the Pipeline; now he splits it: [▶ 24:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1465) **crew A** has only the lead market analyst and the research task; **crew B** has the other two agents and the remaining 4 tasks. Then, following the official style, a `my_pipeline` method marked with the `@pipeline` decorator returns `Pipeline(stages=[crew_a, crew_b])`: crew A runs first, its final output goes to crew B, and crew B carries on with it. [▶ 25:26](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1526) Calling it is simpler too: an `async` `test_pipeline` function calls `my_pipeline`'s `kickoff` directly. The result is `{title, body}`, just like the first two tests."
  },
  {
   "t": "code",
   "file": "crew_pipeline.py (crewai 0.74)",
   "code": {
    "zh": "# crewai 0.74 的写法（视频第三种测试的大意，仅供对照）\nfrom crewai import Crew, Pipeline, Process\nfrom crewai.project import CrewBase, agent, task, pipeline\n\n@CrewBase\nclass MarketingCrew:\n    ...                                    # 3 个 @agent、5 个 @task，从 YAML 读提示词（省略）\n\n    def crew_a(self):                      # 首席市场分析师 + 市场调研任务\n        return Crew(agents=[self.market_analyst()], tasks=[self.research_task()],\n                    process=Process.sequential)\n\n    def crew_b(self):                      # 另外 2 个 Agent + 剩下的 4 个 Task\n        return Crew(agents=[...], tasks=[...], process=Process.sequential)\n\n    @pipeline                              # 0.74 的 crewai.project 里有这个装饰器\n    def my_pipeline(self):\n        # 两个阶段依次执行；写成 [crew_b, crew_c] 这样的列表，表示这一阶段里并行\n        return Pipeline(stages=[self.crew_a(), self.crew_b()])\n\nasync def test_pipeline(inputs):\n    results = await MarketingCrew().my_pipeline().kickoff([inputs])\n    print(results[0].json_dict)            # {title, body}",
    "en": "# The crewai 0.74 way (the gist of the video's third test, for reference only)\nfrom crewai import Crew, Pipeline, Process\nfrom crewai.project import CrewBase, agent, task, pipeline\n\n@CrewBase\nclass MarketingCrew:\n    ...                                    # 3 @agent and 5 @task methods reading prompts from YAML (omitted)\n\n    def crew_a(self):                      # the lead market analyst + the research task\n        return Crew(agents=[self.market_analyst()], tasks=[self.research_task()],\n                    process=Process.sequential)\n\n    def crew_b(self):                      # the other 2 agents + the remaining 4 tasks\n        return Crew(agents=[...], tasks=[...], process=Process.sequential)\n\n    @pipeline                              # 0.74's crewai.project had this decorator\n    def my_pipeline(self):\n        # the two stages run in turn; a list such as [crew_b, crew_c] would mean \"in parallel in this stage\"\n        return Pipeline(stages=[self.crew_a(), self.crew_b()])\n\nasync def test_pipeline(inputs):\n    results = await MarketingCrew().my_pipeline().kickoff([inputs])\n    print(results[0].json_dict)            # {title, body}"
   },
   "note": {
    "zh": "0.74 的 `@pipeline` 只是给方法做个标记并缓存它的返回值，真正干活的是 `Pipeline(stages=[...])`。",
    "en": "In 0.74, `@pipeline` just marks the method and caches its return value; the real work is done by `Pipeline(stages=[...])`."
   }
  },
  {
   "t": "note",
   "zh": "旧版 Pipeline 是怎样传数据的：每个阶段结束后，它把这个阶段输出的 `to_dict()`（也就是 `output_json` / `output_pydantic` 得到的那些字段）合并进下一阶段的输入。只输出普通文字的阶段，结果**不会**自动传下去。所以下面手写的版本里，我们把上一阶段的文字 `result_a.raw` 明确地放进 `inputs`，哪个数据传给了谁，一眼就能看清。",
   "en": "How the old Pipeline passed data: after each stage it merged that stage's `to_dict()` – the fields produced by `output_json` / `output_pydantic` – into the next stage's input. A stage that only produced plain text passed **nothing** on automatically. That's why the hand-written version below puts the previous stage's text, `result_a.raw`, into `inputs` explicitly, so you can see at a glance what goes where."
  },
  {
   "t": "p",
   "zh": "**在 crewai 1.15.23 里手写同样的两阶段流水线。** 思路就是 Python 小课堂里那个循环，只是每个阶段换成了一个 Crew：\n1. 用 `inputs` 运行 crew A（市场分析），得到 `result_a`；\n2. 新建 `stage2_inputs = {**inputs, \"market_analysis\": result_a.raw}`；\n3. crew B 的 Task 描述里写了 `{market_analysis}` 占位符，`kickoff(inputs=stage2_inputs)` 时会被换成第 1 阶段的分析；\n4. crew B 的 Task 设置了 `output_pydantic=Copy`，最后用 `result.pydantic.title` / `.body` 取出文案。\n\n视频里的 crew B 有 2 个 Agent、4 个 Task，这里为了省钱只有 1 个，结构完全一样，只是少几次模型调用。",
   "en": "**The same two-stage pipeline, hand-written for crewai 1.15.23.** It's the loop from the Python mini-lesson, with each stage being a crew:\n1. Run crew A (market analysis) with `inputs` to get `result_a`;\n2. Build `stage2_inputs = {**inputs, \"market_analysis\": result_a.raw}`;\n3. Crew B's task description contains a `{market_analysis}` placeholder, which `kickoff(inputs=stage2_inputs)` replaces with stage 1's analysis;\n4. Crew B's task sets `output_pydantic=Copy`, so `result.pydantic.title` / `.body` give you the copy.\n\nIn the video crew B has 2 agents and 4 tasks; here it has 1 of each to save money – same structure, just fewer model calls."
  },
  {
   "t": "code",
   "file": "l57_pipeline_solution.py",
   "code": {
    "zh": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import Agent, Crew, Process, Task\nfrom pydantic import BaseModel\nfrom l55_deepseek_llm import llm        # 回顾 55 节：让 output_pydantic 能配合 DeepSeek\n\nclass Copy(BaseModel):                  # 最终文案的结构（回顾 12 节）\n    title: str\n    body: str\n\nINPUTS = {                                   # 视频的输入：和 55 节是同一个问题\n    \"customer_domain\": \"emqx.com\",\n    \"project_description\": \"EMQX 是一款开源的 MQTT 消息服务器，能连接海量物联网设备并实时处理数据。\"\n                           \"请为它策划一次面向国内物联网开发者和企业的推广活动。\",\n}\n\ndef build_analysis_crew():              # 第 1 阶段（视频里的 crew A）\n    analyst = Agent(\n        role=\"首席市场分析师\",\n        goal=\"深入分析 {customer_domain} 的产品、目标客户和竞争对手\",\n        backstory=\"你在一家一流的数字营销公司做首席市场分析师，结论简短、有依据。\",\n        llm=llm,\n    )\n    research_task = Task(\n        description=\"客户：{customer_domain}\\n项目：{project_description}\\n\"\n                    \"分析目标客户、主要竞争对手，以及一个最值得抓住的机会。\",\n        expected_output=\"3 条中文要点，每条不超过 40 个字。\",\n        agent=analyst,\n    )\n    return Crew(agents=[analyst], tasks=[research_task], process=Process.sequential)\n\ndef build_copy_crew():                  # 第 2 阶段（视频里的 crew B）\n    writer = Agent(\n        role=\"首席创意内容创作者\",\n        goal=\"把市场分析变成一条吸引人的社交媒体营销文案\",\n        backstory=\"你在一家一流的数字营销公司做首席创意内容创作者，文案短小、抓人眼球。\",\n        llm=llm,\n    )\n    copy_task = Task(\n        description=\"市场分析：\\n{market_analysis}\\n\\n\"      # ← 上一阶段的结果放在这里\n                    \"项目：{project_description}\\n\"\n                    \"请为 {customer_domain} 写一条社交媒体营销文案。\",\n        expected_output=\"一个标题和一段不超过 80 个字的正文。\",\n        agent=writer,\n        output_pydantic=Copy,\n    )\n    return Crew(agents=[writer], tasks=[copy_task], process=Process.sequential)\n\ndef run_pipeline(inputs):\n    result_a = build_analysis_crew().kickoff(inputs=inputs)            # 阶段 1\n    stage2_inputs = {**inputs, \"market_analysis\": result_a.raw}        # 把输出交给下一阶段\n    return build_copy_crew().kickoff(inputs=stage2_inputs)             # 阶段 2\n\nif __name__ == \"__main__\":\n    result = run_pipeline(INPUTS)\n    print(result.pydantic.title)\n    print(result.pydantic.body)\n    print(result.to_dict())             # {'title': ..., 'body': ...}",
    "en": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import Agent, Crew, Process, Task\nfrom pydantic import BaseModel\nfrom l55_deepseek_llm import llm        # see lesson 55: makes output_pydantic work with DeepSeek\n\nclass Copy(BaseModel):                  # the shape of the final copy (see lesson 12)\n    title: str\n    body: str\n\nINPUTS = {                                   # the video's input: the same question as lesson 55\n    \"customer_domain\": \"emqx.com\",\n    \"project_description\": \"EMQX is an open-source MQTT message broker that connects huge numbers of IoT devices and processes their data in real time. \"\n                           \"Plan a promotion campaign for it aimed at IoT developers and companies in China.\",\n}\n\ndef build_analysis_crew():              # stage 1 (crew A in the video)\n    analyst = Agent(\n        role=\"Lead Market Analyst\",\n        goal=\"Analyse the products, target customers and competitors of {customer_domain} in depth\",\n        backstory=\"You are the lead market analyst at a top digital marketing agency; your conclusions are brief and well-founded.\",\n        llm=llm,\n    )\n    research_task = Task(\n        description=\"Client: {customer_domain}\\nProject: {project_description}\\n\"\n                    \"Analyse the target customers, the main competitors and the one opportunity most worth seizing.\",\n        expected_output=\"3 bullet points in English, each at most 40 words.\",\n        agent=analyst,\n    )\n    return Crew(agents=[analyst], tasks=[research_task], process=Process.sequential)\n\ndef build_copy_crew():                  # stage 2 (crew B in the video)\n    writer = Agent(\n        role=\"Chief Creative Content Creator\",\n        goal=\"Turn the market analysis into one engaging social-media marketing post\",\n        backstory=\"You are the chief creative content creator at a top digital marketing agency; your copy is short and catchy.\",\n        llm=llm,\n    )\n    copy_task = Task(\n        description=\"Market analysis:\\n{market_analysis}\\n\\n\"      # ← the previous stage's result goes here\n                    \"Project: {project_description}\\n\"\n                    \"Write one social-media marketing post for {customer_domain}.\",\n        expected_output=\"A title and a body of at most 80 words.\",\n        agent=writer,\n        output_pydantic=Copy,\n    )\n    return Crew(agents=[writer], tasks=[copy_task], process=Process.sequential)\n\ndef run_pipeline(inputs):\n    result_a = build_analysis_crew().kickoff(inputs=inputs)            # stage 1\n    stage2_inputs = {**inputs, \"market_analysis\": result_a.raw}        # hand the output to the next stage\n    return build_copy_crew().kickoff(inputs=stage2_inputs)             # stage 2\n\nif __name__ == \"__main__\":\n    result = run_pipeline(INPUTS)\n    print(result.pydantic.title)\n    print(result.pydantic.body)\n    print(result.to_dict())             # {'title': ..., 'body': ...}"
   },
   "note": {
    "zh": "在本机用 DeepSeek 实际运行过，一共 2 次模型调用：第 1 阶段列出目标客户、主要对手（各家云厂商的 IoT 平台）和一个机会；第 2 阶段返回 `Copy(title=..., body=...)`，这次的标题是「EMQX：亿级设备在线的开源底座」。完整文件见 `practice/l57_pipeline_solution.py`，运行命令写在文件开头。",
    "en": "Actually run on this machine with DeepSeek, 2 model calls in total: stage 1 lists the target customers, the main rivals (the cloud vendors' IoT platforms) and one opportunity; stage 2 returns `Copy(title=..., body=...)` – this run's title, translated: “EMQX: the open-source foundation for hundreds of millions of online devices”. Full file: `practice/l57_pipeline_solution.py`; the command to run it is at the top of the file."
   }
  },
  {
   "t": "note",
   "zh": "`{customer_domain}`、`{market_analysis}` 这些占位符写在 Agent 的 role / goal 和 Task 的 description 里，`kickoff(inputs=...)` 时按名字替换（回顾 51 节）。两个容易出的错误（都在 1.15.23 上试过）：\n- `inputs` 里**缺了**某个占位符：报 `ValueError`，提示 `Template variable 'market_analysis' not found in inputs dictionary`。\n- 把 `result_a` 这个**对象**直接放进去：报 `Unsupported type CrewOutput in inputs`。`inputs` 的值只能是字符串、数字、布尔、字典或列表，所以要传 `result_a.raw`。",
   "en": "Placeholders such as `{customer_domain}` and `{market_analysis}` in agent role / goal and task descriptions are filled by name at `kickoff(inputs=...)` (see lesson 51). Two easy mistakes, both tried on 1.15.23:\n- A placeholder **missing** from `inputs`: `ValueError` saying `Template variable 'market_analysis' not found in inputs dictionary`.\n- Passing the `result_a` **object** itself: `Unsupported type CrewOutput in inputs`. Input values may only be str, int, float, bool, dict or list, so pass `result_a.raw`."
  },
  {
   "t": "check",
   "q": {
    "zh": "crew B 的 Task 描述里有 `{market_analysis}`，它的值是从哪里来的？",
    "en": "Crew B's task description contains `{market_analysis}`. Where does its value come from?"
   },
   "options": [
    {
     "zh": "CrewAI 会自动从上一个 Crew 那里拿",
     "en": "CrewAI fetches it from the previous crew automatically"
    },
    {
     "zh": "我们在 `kickoff(inputs=...)` 里放进去的 `result_a.raw`",
     "en": "The `result_a.raw` we put into `kickoff(inputs=...)`"
    },
    {
     "zh": "模型根据描述自己生成",
     "en": "The model makes it up from the description"
    }
   ],
   "answer": 1,
   "explain": {
    "zh": "两个 Crew 之间没有任何自动的联系。数据靠我们写的 `{**inputs, \"market_analysis\": result_a.raw}` 传过去。",
    "en": "Two crews have no automatic link. The data travels because we wrote `{**inputs, \"market_analysis\": result_a.raw}`."
   }
  },
  {
   "t": "h",
   "zh": "八、并行阶段，以及官方替代品 Flow",
   "en": "8. Parallel stages, and the official replacement: Flow"
  },
  {
   "t": "p",
   "zh": "视频示意图里的 crew2 和 crew3 是并行的。旧版 Pipeline 遇到「一个阶段里有一组 Crew」时，内部就是用 `asyncio.gather` 同时调用每个 Crew 的 `kickoff_async`（0.74.2 源码里就是这么写的）。在 1.15.23 里照着写就行：第 2 阶段同时运行「社交媒体文案」和「活动海报标语」两个 Crew，它们拿到同一份分析。`async` / `await` / `asyncio.gather` 回顾 09 节的 Python 小课堂。",
   "en": "In the video's diagram, crew2 and crew3 run in parallel. When the old Pipeline met “a group of crews in one stage”, it simply used `asyncio.gather` to call each crew's `kickoff_async` at the same time (that's what the 0.74.2 source does). In 1.15.23 you can write exactly that: stage 2 runs a “social-media copy” crew and an “event poster slogan” crew at the same time, and both get the same analysis. For `async` / `await` / `asyncio.gather`, see the Python mini-lesson in lesson 09."
  },
  {
   "t": "code",
   "file": "l57_parallel_stage.py",
   "code": {
    "zh": "import asyncio\nfrom l57_pipeline_solution import INPUTS, build_analysis_crew, build_copy_crew\n\nasync def run_pipeline_with_parallel_stage(inputs):\n    # 阶段 1：一个 Crew\n    result_a = await build_analysis_crew().kickoff_async(inputs=inputs)\n    stage2_inputs = {**inputs, \"market_analysis\": result_a.raw}\n\n    # 阶段 2：两个 Crew 同时开始，拿到同一份输入，等两个都结束\n    copy_result, slogan_result = await asyncio.gather(\n        build_copy_crew().kickoff_async(inputs=stage2_inputs),\n        build_slogan_crew().kickoff_async(inputs=stage2_inputs),   # 另一个写活动海报标语的 Crew\n    )\n    return copy_result, slogan_result\n\ncopy_result, slogan_result = asyncio.run(run_pipeline_with_parallel_stage(INPUTS))",
    "en": "import asyncio\nfrom l57_pipeline_solution import INPUTS, build_analysis_crew, build_copy_crew\n\nasync def run_pipeline_with_parallel_stage(inputs):\n    # stage 1: one crew\n    result_a = await build_analysis_crew().kickoff_async(inputs=inputs)\n    stage2_inputs = {**inputs, \"market_analysis\": result_a.raw}\n\n    # stage 2: two crews start together with the same input; wait until both are done\n    copy_result, slogan_result = await asyncio.gather(\n        build_copy_crew().kickoff_async(inputs=stage2_inputs),\n        build_slogan_crew().kickoff_async(inputs=stage2_inputs),   # another crew, which writes the event poster slogan\n    )\n    return copy_result, slogan_result\n\ncopy_result, slogan_result = asyncio.run(run_pipeline_with_parallel_stage(INPUTS))"
   },
   "note": {
    "zh": "完整文件 `practice/l57_parallel_stage.py`，在本机用 DeepSeek 实际运行过：3 次模型调用，十几秒跑完；这次的文案标题是「车联网实时数据，别让延迟拖后腿」，海报标语是「车联实时，开源领航」。两个 Crew 互不依赖时才适合并行；如果 crew C 需要 crew B 的结果，就必须放到下一个阶段。",
    "en": "Full file `practice/l57_parallel_stage.py`, actually run on this machine with DeepSeek: 3 model calls, done in under 20 seconds; this run's copy title, translated, was “Real-time connected-car data – don't let latency hold you back”, and the poster slogan “Connected cars in real time, open source in the lead”. Only crews that don't depend on each other belong in a parallel stage; if crew C needs crew B's result, it has to go in the next stage."
   }
  },
  {
   "t": "p",
   "zh": "浏览器里不能运行 CrewAI。下面用模拟模型把同样的形状跑一遍：阶段 1 一次调用，阶段 2 的两次调用同时发出，各自用同一份分析。",
   "en": "CrewAI can't run in the browser, so here is the same shape with the mock model: one call in stage 1, then stage 2's two calls sent together, both using the same analysis."
  },
  {
   "t": "code",
   "file": "parallel_stage_mock.py",
   "run": "mock",
   "code": {
    "zh": "import asyncio\nfrom llm import async_client, MODEL\n\nasync def ask(role, text):\n    r = await async_client.chat.completions.create(\n        model=MODEL,\n        messages=[{\"role\": \"system\", \"content\": role}, {\"role\": \"user\", \"content\": text}],\n    )\n    return r.choices[0].message.content\n\nasync def main():\n    # 阶段 1：先拿到分析\n    analysis = await ask(\"你是市场分析师\", \"分析 EMQX（开源 MQTT 服务器）这次推广活动的目标客户\")\n    print(\"阶段 1：\", analysis)\n    # 阶段 2：两个「Crew」同时运行，用的是同一份分析\n    post, slogan = await asyncio.gather(\n        ask(\"你是文案\", f\"根据分析写一条社交媒体文案：{analysis}\"),\n        ask(\"你是海报策划\", f\"根据分析写一句活动海报标语：{analysis}\"),\n    )\n    print(\"文案：\", post)\n    print(\"海报：\", slogan)\n\nasyncio.run(main())",
    "en": "import asyncio\nfrom llm import async_client, MODEL\n\nasync def ask(role, text):\n    r = await async_client.chat.completions.create(\n        model=MODEL,\n        messages=[{\"role\": \"system\", \"content\": role}, {\"role\": \"user\", \"content\": text}],\n    )\n    return r.choices[0].message.content\n\nasync def main():\n    # stage 1: get the analysis first\n    analysis = await ask(\"You are a market analyst\", \"Analyse the target customers of this promotion campaign for EMQX (an open-source MQTT broker)\")\n    print(\"Stage 1:\", analysis)\n    # stage 2: two \"crews\" run at the same time, using the same analysis\n    post, slogan = await asyncio.gather(\n        ask(\"You are a copywriter\", f\"Write a social-media post based on this analysis: {analysis}\"),\n        ask(\"You are a poster planner\", f\"Write an event poster slogan based on this analysis: {analysis}\"),\n    )\n    print(\"Post:\", post)\n    print(\"Poster:\", slogan)\n\nasyncio.run(main())"
   }
  },
  {
   "t": "p",
   "zh": "Pipeline 删除以后，CrewAI 官方给的替代品是 **Flow**（下一集细讲）。把视频那张示意图改写成 Flow，就是给每个阶段写一个方法，再用装饰器说明「谁在谁之后运行」：\n\n| 视频（0.74 Pipeline） | 现在（1.15.23 Flow） |\n|---|---|\n| `Pipeline(stages=[...])` | 一个继承 `Flow` 的类 |\n| 第一个阶段 crew1 | `@start()` 标记的方法 |\n| 下一个阶段 | `@listen(上一阶段的方法)` |\n| 并行阶段 `[crew2, crew3]` | 两个方法都 `@listen(crew1)`，Flow 会同时运行它们 |\n| 等并行阶段全部完成 | `@listen(and_(crew2, crew3))` |\n| 阶段之间自动合并 JSON 字段 | 自己把结果写进 `self.state` |\n| `await pipeline.kickoff([inputs])` | `flow.kickoff(inputs={...})` |",
   "en": "After Pipeline was removed, CrewAI's official replacement is **Flow** (covered in detail next episode). Rewriting the video's diagram as a Flow means one method per stage, with decorators stating “who runs after whom”:\n\n| The video (0.74 Pipeline) | Now (1.15.23 Flow) |\n|---|---|\n| `Pipeline(stages=[...])` | A class that inherits from `Flow` |\n| The first stage, crew1 | A method marked `@start()` |\n| The next stage | `@listen(previous_stage_method)` |\n| A parallel stage `[crew2, crew3]` | Both methods `@listen(crew1)`; the Flow runs them at the same time |\n| Waiting for the whole parallel stage | `@listen(and_(crew2, crew3))` |\n| JSON fields merged between stages automatically | You write results into `self.state` yourself |\n| `await pipeline.kickoff([inputs])` | `flow.kickoff(inputs={...})` |"
  },
  {
   "t": "code",
   "file": "l57_pipeline_as_flow.py",
   "code": {
    "zh": "from crewai.flow import Flow, and_, listen, start\n\nclass PipelineAsFlow(Flow):           # 不写 [状态类]：state 是一个字典\n\n    @start()                          # 阶段 1\n    def crew1(self):\n        self.state[\"crew1\"] = fake_crew(\"crew1\")      # 真实项目：某个Crew().kickoff(inputs=...)\n\n    @listen(crew1)                    # 阶段 2：crew1 完成后运行……\n    def crew2(self):\n        self.state[\"crew2\"] = fake_crew(\"crew2\")\n\n    @listen(crew1)                    # ……crew3 也监听 crew1，和 crew2 同时运行\n    def crew3(self):\n        self.state[\"crew3\"] = fake_crew(\"crew3\")\n\n    @listen(and_(crew2, crew3))       # 阶段 3：crew2 和 crew3 都完成后才运行\n    def crew4(self):\n        return fake_crew(\"crew4\")\n\nprint(PipelineAsFlow().kickoff())",
    "en": "from crewai.flow import Flow, and_, listen, start\n\nclass PipelineAsFlow(Flow):           # no [StateClass]: the state is a dict\n\n    @start()                          # stage 1\n    def crew1(self):\n        self.state[\"crew1\"] = fake_crew(\"crew1\")      # a real project: SomeCrew().kickoff(inputs=...)\n\n    @listen(crew1)                    # stage 2: runs after crew1...\n    def crew2(self):\n        self.state[\"crew2\"] = fake_crew(\"crew2\")\n\n    @listen(crew1)                    # ...crew3 also listens to crew1 and runs at the same time as crew2\n    def crew3(self):\n        self.state[\"crew3\"] = fake_crew(\"crew3\")\n\n    @listen(and_(crew2, crew3))       # stage 3: runs only after both crew2 and crew3 are done\n    def crew4(self):\n        return fake_crew(\"crew4\")\n\nprint(PipelineAsFlow().kickoff())"
   },
   "note": {
    "zh": "完整文件 `practice/l57_pipeline_as_flow.py` 不调用模型，可以随便运行：每个「Crew」用 `time.sleep(1)` 假装工作 1 秒。实测打印出 crew2 和 crew3 在第 1 秒同时开始、第 2 秒同时结束，`kickoff()` 一共约 3 秒（一个接一个要 4 秒）。`@start`、`@listen`、`and_` 和 `self.state` 的细节在 58 节。",
    "en": "The full file `practice/l57_pipeline_as_flow.py` makes no model calls, so it's free to run: each “crew” pretends to work for 1 second with `time.sleep(1)`. In a real run, crew2 and crew3 both start at second 1 and finish at second 2, and `kickoff()` takes about 3 seconds in total (one after another would take 4). Lesson 58 covers `@start`, `@listen`, `and_` and `self.state` in detail."
   }
  },
  {
   "t": "h",
   "zh": "九、接进 FastAPI：服务 + 测试脚本",
   "en": "9. Serving it with FastAPI: server + test script"
  },
  {
   "t": "video",
   "zh": "[▶ 26:28](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1588) 测通以后，老师把第三种写法搬进正式代码：`crew.py` 里写好拆分后的两个 Crew 和 `my_pipeline`。[▶ 27:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1620) `main.py` 开头先用环境变量配置默认模型（他再次强调：这是给 Task 的 `output_json` 用的），再填搜索服务的 key。[▶ 28:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1683) 接着写一个接收模型、运行流水线的 `run_pipeline` 函数，用 FastAPI 创建 app，启动时在初始化函数里准备好模型；[▶ 28:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1714) POST 接口先检查模型有没有初始化好（没有就直接返回错误），再从请求里取出两个参数拼成输入，调用 `my_pipeline` 的 `kickoff`，把结果整理成 JSON 返回。[▶ 29:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1746) 演示时先启动 `main.py`，[▶ 29:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1777) 再开一个终端运行 API 测试脚本：服务跑在本机的 8012 端口，脚本里的 URL 要和它一致；[▶ 30:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1808) 脚本把两个参数组成字典，用 `requests.post` 发给服务。[▶ 30:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1838) 返回的同样是 `{title, body}`，这次没有带 token 用量。下面是同样功能的精简版（模型在导入时就准备好了，所以没有写启动函数，也没有「模型未初始化」的检查）。",
   "en": "[▶ 26:28](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1588) Once the tests pass, the instructor moves the third approach into the real code: `crew.py` gets the two split crews and `my_pipeline`. [▶ 27:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1620) `main.py` starts by setting the default model in environment variables (he stresses again that this is for the tasks' `output_json`), then fills in the search-service key. [▶ 28:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1683) Next comes a `run_pipeline` function that takes the model and runs the pipeline; a FastAPI app is created, with a startup function that prepares the model; [▶ 28:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1714) the POST endpoint first checks that the model is initialised (returning an error straight away if not), then builds the input from the two parameters in the request, calls `my_pipeline`'s `kickoff` and returns the result as JSON. [▶ 29:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1746) For the demo he starts `main.py` first, [▶ 29:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1777) then runs the API test script in a second terminal: the service runs on local port 8012, and the URL in the script must match it; [▶ 30:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1808) the script puts the two parameters into a dict and sends it to the service with `requests.post`. [▶ 30:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1838) The reply is again `{title, body}`, this time without token usage. Below is a slimmed-down version that does the same (the model is ready at import time, so there's no startup function and no “model not initialised” check)."
  },
  {
   "t": "code",
   "file": "l57_pipeline_api.py",
   "code": {
    "zh": "import uvicorn\nfrom fastapi import FastAPI\nfrom pydantic import BaseModel\nfrom l57_pipeline_solution import run_pipeline\n\napp = FastAPI()\n\nclass MarketingRequest(BaseModel):      # 请求体的格式（回顾 51 节）\n    customer_domain: str\n    project_description: str\n\n@app.post(\"/marketing\")\ndef marketing(req: MarketingRequest):  # 普通 def：FastAPI 会放到线程池里运行，不会卡住服务\n    result = run_pipeline(req.model_dump())   # BaseModel -> dict -> 流水线的 inputs\n    return result.to_dict()                   # {\"title\": ..., \"body\": ...} -> JSON\n\nif __name__ == \"__main__\":\n    uvicorn.run(app, host=\"127.0.0.1\", port=8012)",
    "en": "import uvicorn\nfrom fastapi import FastAPI\nfrom pydantic import BaseModel\nfrom l57_pipeline_solution import run_pipeline\n\napp = FastAPI()\n\nclass MarketingRequest(BaseModel):      # the request body (see lesson 51)\n    customer_domain: str\n    project_description: str\n\n@app.post(\"/marketing\")\ndef marketing(req: MarketingRequest):  # a plain def: FastAPI runs it in a thread pool, the server stays responsive\n    result = run_pipeline(req.model_dump())   # BaseModel -> dict -> the pipeline's inputs\n    return result.to_dict()                   # {\"title\": ..., \"body\": ...} -> JSON\n\nif __name__ == \"__main__\":\n    uvicorn.run(app, host=\"127.0.0.1\", port=8012)"
   },
   "note": {
    "zh": "`run_pipeline` 要跑几十秒。接口写成**普通 `def`** 时，FastAPI 会自动把它放到线程池里运行，服务不会被卡住；也可以像 51 节那样写成 `async def`，在里面 `await crew.kickoff_async(...)`。两种都对。",
    "en": "`run_pipeline` takes tens of seconds. Written as a **plain `def`**, the endpoint is run in a thread pool by FastAPI, so the server isn't blocked; you can also write `async def` and `await crew.kickoff_async(...)` as in lesson 51. Both are fine."
   }
  },
  {
   "t": "code",
   "file": "l57_api_client.py",
   "code": {
    "zh": "import requests\n\nURL = \"http://127.0.0.1:8012/marketing\"      # 端口要和服务里的 8012 一致\n\npayload = {                                   # 视频的输入：和 55 节是同一个问题\n    \"customer_domain\": \"emqx.com\",\n    \"project_description\": \"EMQX 是一款开源的 MQTT 消息服务器，能连接海量物联网设备并实时处理数据。\"\n                           \"请为它策划一次面向国内物联网开发者和企业的推广活动。\",\n}\nresp = requests.post(URL, json=payload, timeout=300)   # json= 把字典转成 JSON 请求体；最多等 300 秒\nresp.raise_for_status()                                # 状态码不是 2xx 就报错\ndata = resp.json()                                     # 返回的 JSON -> 字典\nprint(data[\"title\"])\nprint(data[\"body\"])",
    "en": "import requests\n\nURL = \"http://127.0.0.1:8012/marketing\"      # the port must match the server's 8012\n\npayload = {                                   # the video's input: the same question as lesson 55\n    \"customer_domain\": \"emqx.com\",\n    \"project_description\": \"EMQX is an open-source MQTT message broker that connects huge numbers of IoT devices and processes their data in real time. \"\n                           \"Plan a promotion campaign for it aimed at IoT developers and companies in China.\",\n}\nresp = requests.post(URL, json=payload, timeout=300)   # json= turns the dict into a JSON body; wait at most 300 seconds\nresp.raise_for_status()                                # raise an error if the status code isn't 2xx\ndata = resp.json()                                     # the JSON reply -> a dict\nprint(data[\"title\"])\nprint(data[\"body\"])"
   }
  },
  {
   "t": "code",
   "lang": "powershell",
   "file": "PowerShell",
   "code": {
    "zh": "# 终端 1：启动服务（一直运行，Ctrl+C 停止）/ terminal 1: start the server (Ctrl+C to stop)\ncd practice\n& ..\\.venv-crewai\\Scripts\\python.exe l57_pipeline_api.py\n\n# 终端 2：发请求 / terminal 2: send a request\ncd practice\n& ..\\.venv-crewai\\Scripts\\python.exe l57_api_client.py",
    "en": "# terminal 1: start the server (keeps running; Ctrl+C to stop)\ncd practice\n& ..\\.venv-crewai\\Scripts\\python.exe l57_pipeline_api.py\n\n# terminal 2: send a request\ncd practice\n& ..\\.venv-crewai\\Scripts\\python.exe l57_api_client.py"
   }
  },
  {
   "t": "tip",
   "zh": "服务启动后，用浏览器打开 `http://127.0.0.1:8012/docs`，可以直接在网页上填参数试接口，不用写客户端。客户端报 `ConnectionError` 时，先看服务那个终端有没有在运行、端口是不是 8012。",
   "en": "Once the server is up, open `http://127.0.0.1:8012/docs` in a browser to try the endpoint with a form – no client needed. If the client raises `ConnectionError`, check that the server terminal is still running and the port is 8012."
  },
  {
   "t": "p",
   "zh": "[▶ 30:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1838) 老师最后预告：下一集讲 Flows，它和 Pipeline 思路相近，但设计得更完整，目标是搭建更复杂的智能体项目。这一集最值得带走的就是 Pipeline 的设计思想：把大任务拆成几个 Crew，按阶段串行或并行，上一阶段的结果交给下一阶段。",
   "en": "[▶ 30:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=58&t=1838) The instructor closes by previewing the next episode on Flows: similar in spirit to Pipeline but more complete, designed for more complex agent projects. The thing to take away from this episode is Pipeline's design idea: split a big job into several crews, run them in stages – sequentially or in parallel – and hand each stage's result to the next."
  }
 ],
 "quiz": [
  {
   "q": {
    "zh": "`Pipeline(stages=[crew_a, [crew_b, crew_c], crew_d])` 的执行顺序是？",
    "en": "In what order does `Pipeline(stages=[crew_a, [crew_b, crew_c], crew_d])` run?"
   },
   "options": [
    {
     "zh": "四个 Crew 同时运行",
     "en": "All four crews at once"
    },
    {
     "zh": "crew_a → crew_b 和 crew_c 同时 → crew_d",
     "en": "crew_a → crew_b and crew_c together → crew_d"
    },
    {
     "zh": "crew_a → crew_b → crew_c → crew_d",
     "en": "crew_a → crew_b → crew_c → crew_d"
    },
    {
     "zh": "crew_b 和 crew_c 先运行，再运行 crew_a 和 crew_d",
     "en": "crew_b and crew_c first, then crew_a and crew_d"
    }
   ],
   "answer": 1,
   "explain": {
    "zh": "`stages` 里每一项是一个阶段，阶段之间按顺序执行；一项本身是列表时，列表里的 Crew 在这一阶段内并行。",
    "en": "Each item of `stages` is a stage and stages run in order; when an item is a list, its crews run in parallel within that stage."
   }
  },
  {
   "q": {
    "zh": "在本课环境（crewai 1.15.23）里写 `from crewai import Pipeline`，会怎样？",
    "en": "What happens with `from crewai import Pipeline` in the course environment (crewai 1.15.23)?"
   },
   "options": [
    {
     "zh": "正常导入，用法和 0.74 一样",
     "en": "It imports and works as in 0.74"
    },
    {
     "zh": "能导入，但会打印一条弃用警告",
     "en": "It imports with a deprecation warning"
    },
    {
     "zh": "报 `ImportError`：1.x 已经删除了 Pipeline",
     "en": "`ImportError`: Pipeline was removed in 1.x"
    },
    {
     "zh": "会自动换成 Flow",
     "en": "It is automatically replaced by Flow"
    }
   ],
   "answer": 2,
   "explain": {
    "zh": "Pipeline 在 0.74 之后被 Flows 取代并删除，旧代码要改写成手动串联或 Flow。",
    "en": "Pipeline was replaced by Flows after 0.74 and removed; old code has to become hand-written chaining or a Flow."
   }
  },
  {
   "q": {
    "zh": "`inputs = {\"a\": 1}`，执行 `new = {**inputs, \"b\": 2}` 之后，下面哪个说法正确？",
    "en": "With `inputs = {\"a\": 1}`, after `new = {**inputs, \"b\": 2}`, which is true?"
   },
   "options": [
    {
     "zh": "`new` 是 `{\"a\": 1, \"b\": 2}`，`inputs` 还是 `{\"a\": 1}`",
     "en": "`new` is `{\"a\": 1, \"b\": 2}` and `inputs` is still `{\"a\": 1}`"
    },
    {
     "zh": "`inputs` 也变成了 `{\"a\": 1, \"b\": 2}`",
     "en": "`inputs` also becomes `{\"a\": 1, \"b\": 2}`"
    },
    {
     "zh": "`new` 只有 `{\"b\": 2}`",
     "en": "`new` is just `{\"b\": 2}`"
    },
    {
     "zh": "语法错误",
     "en": "It's a syntax error"
    }
   ],
   "answer": 0,
   "explain": {
    "zh": "`{**inputs, ...}` 创建一个新字典，把 `inputs` 的内容复制进去再加新键，原字典不变。",
    "en": "`{**inputs, ...}` builds a new dict, copying `inputs` in and adding the new key; the original is untouched."
   }
  },
  {
   "q": {
    "zh": "视频升级到 0.74.2 后，为什么还要在 `main.py` 里给「默认模型」设置 OpenAI 相关的环境变量？",
    "en": "After upgrading to 0.74.2, why does the video also set OpenAI environment variables for the “default model” in `main.py`?"
   },
   "options": [
    {
     "zh": "Agent 必须用默认模型才能运行",
     "en": "Agents can only run on the default model"
    },
    {
     "zh": "FastAPI 启动时需要这些变量",
     "en": "FastAPI needs them to start"
    },
    {
     "zh": "搜索工具需要 OpenAI 的 key",
     "en": "The search tool needs an OpenAI key"
    },
    {
     "zh": "按老师的解释，当时 `output_json` 转换 JSON 要依赖 CrewAI 默认的 OpenAI 模型配置，光给 Agent 配模型不够",
     "en": "As the instructor explains, `output_json`'s JSON conversion relied on CrewAI's default OpenAI model settings back then, so setting the agents' model wasn't enough"
    }
   ],
   "answer": 3,
   "explain": {
    "zh": "这是视频里 0.74 的情况：Agent 用的是 `myLLM.py` 里的外部模型，但 `output_json` 的转换还要靠环境变量里的默认模型配置。在 1.15.23 里转换直接用 Agent 自己的 `llm`，不需要再配置默认模型。",
    "en": "That's how 0.74 worked in the video: the agents used the external model from `myLLM.py`, but the `output_json` conversion still relied on the default model settings in the environment variables. In 1.15.23 the conversion uses the agent's own `llm`, so no default model needs setting up."
   }
  },
  {
   "q": {
    "zh": "给 Task 设置了 `output_pydantic` 后，用普通的 `LLM(model=\"openai/deepseek-flash\", ...)` 运行，DeepSeek 返回 400 `This response_format type is unavailable now`。原因和办法是？",
    "en": "With `output_pydantic` on a task and a plain `LLM(model=\"openai/deepseek-flash\", ...)`, DeepSeek returns 400 `This response_format type is unavailable now`. Why, and what's the fix?"
   },
   "options": [
    {
     "zh": "key 错了，重新设置环境变量",
     "en": "The key is wrong; set the variable again"
    },
    {
     "zh": "CrewAI 要求按 json_schema 格式回答，DeepSeek 不支持；改用 55 节的 `DeepSeekLLM`",
     "en": "CrewAI asks for json_schema output, which DeepSeek doesn't support; use lesson 55's `DeepSeekLLM`"
    },
    {
     "zh": "Copy 模型的字段太多",
     "en": "The Copy model has too many fields"
    },
    {
     "zh": "必须把 `output_pydantic` 换成 `output_file`",
     "en": "`output_pydantic` must become `output_file`"
    }
   ],
   "answer": 1,
   "explain": {
    "zh": "DeepSeek 只支持 text 和 json_object。`DeepSeekLLM` 不发送 json_schema 要求，CrewAI 再自己把回答解析成 Pydantic 对象。",
    "en": "DeepSeek supports only text and json_object. `DeepSeekLLM` doesn't send the json_schema request, and CrewAI parses the answer into the Pydantic object itself."
   }
  },
  {
   "q": {
    "zh": "把视频的示意图改写成 Flow 时，crew4 要等 crew2 和 crew3 **都**完成才运行，应该怎么写？",
    "en": "Rewriting the video's diagram as a Flow, crew4 must wait until **both** crew2 and crew3 are done. How do you mark it?"
   },
   "options": [
    {
     "zh": "`@start()`",
     "en": "`@start()`"
    },
    {
     "zh": "`@listen(crew2)`",
     "en": "`@listen(crew2)`"
    },
    {
     "zh": "`@listen(and_(crew2, crew3))`",
     "en": "`@listen(and_(crew2, crew3))`"
    },
    {
     "zh": "`@listen(or_(crew2, crew3))`",
     "en": "`@listen(or_(crew2, crew3))`"
    }
   ],
   "answer": 2,
   "explain": {
    "zh": "`and_` 等所有被监听的方法都完成；`or_` 只要一个完成就运行，`@listen(crew2)` 不管 crew3，`@start()` 是起点。",
    "en": "`and_` waits for every listed method; `or_` fires as soon as one finishes, `@listen(crew2)` ignores crew3, and `@start()` marks a starting point."
   }
  }
 ],
 "fill": [
  {
   "title": {
    "zh": "两阶段流水线",
    "en": "A two-stage pipeline"
   },
   "code": "def run_pipeline(inputs):\n    result_a = build_analysis_crew().[[kickoff]](inputs=[[inputs]])\n    stage2_inputs = {[[**inputs]], \"[[market_analysis]]\": result_a.[[raw]]}\n    result_b = build_copy_crew().kickoff(inputs=[[stage2_inputs]])\n    [[return]] result_b",
   "explain": {
    "zh": "第 1 阶段用原始 `inputs`；第 2 阶段的输入 = 原始 `inputs` + 第 1 阶段结果的文字 `raw`。",
    "en": "Stage 1 uses the original `inputs`; stage 2's input = the original `inputs` + the text (`raw`) of stage 1's result."
   }
  },
  {
   "title": {
    "zh": "并行阶段",
    "en": "A parallel stage"
   },
   "code": "async def stage2(stage2_inputs):\n    copy_result, slogan_result = await asyncio.[[gather]](\n        build_copy_crew().[[kickoff_async]](inputs=stage2_inputs),\n        build_slogan_crew().kickoff_async(inputs=[[stage2_inputs]]),\n    )\n    return copy_result.[[pydantic]].title, slogan_result.[[raw]]",
   "explain": {
    "zh": "`asyncio.gather` 同时等待多个 `kickoff_async`，按传入的顺序返回结果；有 `output_pydantic` 的结果用 `.pydantic` 取对象，普通结果用 `.raw` 取文字。",
    "en": "`asyncio.gather` awaits several `kickoff_async` calls at once and returns results in the order given; use `.pydantic` for results with `output_pydantic` and `.raw` for plain text."
   }
  }
 ],
 "write": [
  {
   "title": {
    "zh": "手写：两阶段流水线（纯 Python + 模拟模型）",
    "en": "Write it: a two-stage pipeline (plain Python + mock model)"
   },
   "task": {
    "zh": "不看上面的代码，写出：\n1. `ask(prompt)`：调用模型，返回回答文字\n2. 两个阶段函数 `analyse(data)`、`write_copy(data)`：各调用一次模型，返回 `{**data, 新键: 回答}`\n3. `run_pipeline(stages, data)`：用 for 循环依次运行每个阶段，上一步的输出交给下一步，最后返回 `data`\n4. 用 `[analyse, write_copy]` 运行，打印 `copy`\n\n这就是 Pipeline 的核心：阶段列表 + 数据一路往下传。",
    "en": "Without looking above, write:\n1. `ask(prompt)`: call the model and return the reply text\n2. two stage functions `analyse(data)` and `write_copy(data)`: each calls the model once and returns `{**data, new_key: reply}`\n3. `run_pipeline(stages, data)`: a for loop that runs each stage in turn, feeding each output to the next, then returns `data`\n4. run it with `[analyse, write_copy]` and print `copy`\n\nThat is the core of a Pipeline: a list of stages + data flowing down the line."
   },
   "run": "mock",
   "starter": {
    "zh": "from llm import client, MODEL\n\n# 1. ask(prompt)：调用模型，返回回答的文字\n\n\n# 2. analyse(data)：让模型分析 data['shop'] 推广 data['product'] 的目标客户，\n#    返回一个新字典：原来的内容 + \"analysis\"\n\n\n# 3. write_copy(data)：根据 data['analysis'] 写一句文案，返回原来的内容 + \"copy\"\n\n\n# 4. run_pipeline(stages, data)：依次运行每个阶段，上一步的输出交给下一步，最后返回 data\n\n\n# 5. 用 [analyse, write_copy] 和 {\"shop\": \"街角咖啡\", \"product\": \"桂花冷萃\"} 运行，打印 copy\n",
    "en": "from llm import client, MODEL\n\n# 1. ask(prompt): call the model and return the reply text\n\n\n# 2. analyse(data): ask the model about the target customers for data['shop'] promoting data['product'];\n#    return a new dict: everything so far + \"analysis\"\n\n\n# 3. write_copy(data): write one line of copy from data['analysis']; return everything so far + \"copy\"\n\n\n# 4. run_pipeline(stages, data): run each stage in turn, feeding each output to the next; return data\n\n\n# 5. run it with [analyse, write_copy] and {\"shop\": \"Corner Coffee\", \"product\": \"osmanthus cold brew\"}; print copy\n"
   },
   "solution": {
    "zh": "from llm import client, MODEL\n\n# 1. ask(prompt)：调用模型，返回回答的文字\ndef ask(prompt):\n    r = client.chat.completions.create(model=MODEL, messages=[{\"role\": \"user\", \"content\": prompt}])\n    return r.choices[0].message.content\n\n# 2. analyse(data)\ndef analyse(data):\n    text = ask(f\"分析{data['shop']}推广{data['product']}的目标客户，用一句话回答\")\n    return {**data, \"analysis\": text}\n\n# 3. write_copy(data)\ndef write_copy(data):\n    text = ask(f\"根据这段分析写一句朋友圈文案：{data['analysis']}\")\n    return {**data, \"copy\": text}\n\n# 4. run_pipeline(stages, data)\ndef run_pipeline(stages, data):\n    for stage in stages:\n        data = stage(data)\n    return data\n\n# 5. 运行并打印\nresult = run_pipeline([analyse, write_copy], {\"shop\": \"街角咖啡\", \"product\": \"桂花冷萃\"})\nprint(result[\"copy\"])",
    "en": "from llm import client, MODEL\n\n# 1. ask(prompt): call the model and return the reply text\ndef ask(prompt):\n    r = client.chat.completions.create(model=MODEL, messages=[{\"role\": \"user\", \"content\": prompt}])\n    return r.choices[0].message.content\n\n# 2. analyse(data)\ndef analyse(data):\n    text = ask(f\"In one sentence, who are the target customers for {data['shop']} promoting {data['product']}?\")\n    return {**data, \"analysis\": text}\n\n# 3. write_copy(data)\ndef write_copy(data):\n    text = ask(f\"Write one line of social-media copy from this analysis: {data['analysis']}\")\n    return {**data, \"copy\": text}\n\n# 4. run_pipeline(stages, data)\ndef run_pipeline(stages, data):\n    for stage in stages:\n        data = stage(data)\n    return data\n\n# 5. run and print\nresult = run_pipeline([analyse, write_copy], {\"shop\": \"Corner Coffee\", \"product\": \"osmanthus cold brew\"})\nprint(result[\"copy\"])"
   },
   "checks": [
    {
     "zh": "定义了 `run_pipeline(stages, data)`",
     "en": "Defines `run_pipeline(stages, data)`",
     "re": "def\\s+run_pipeline\\s*\\(\\s*\\w+\\s*,\\s*\\w+\\s*\\)\\s*:"
    },
    {
     "zh": "用 for 循环遍历阶段列表",
     "en": "Loops over the list of stages with for",
     "re": "for\\s+\\w+\\s+in\\s+stages\\s*:"
    },
    {
     "zh": "上一步的输出交给下一步：`data = stage(data)`",
     "en": "Feeds each output on: `data = stage(data)`",
     "re": "\\b(\\w+)\\s*=\\s*\\w+\\(\\s*\\1\\s*\\)"
    },
    {
     "zh": "用 `{**data, ...}` 返回新字典",
     "en": "Returns a new dict with `{**data, ...}`",
     "re": "return\\s*\\{\\s*\\*\\*\\w+\\s*,"
    },
    {
     "zh": "调用了模型 `client.chat.completions.create`",
     "en": "Calls the model with `client.chat.completions.create`",
     "re": "client\\.chat\\.completions\\.create\\("
    },
    {
     "zh": "用 `[analyse, write_copy]` 运行流水线",
     "en": "Runs the pipeline with `[analyse, write_copy]`",
     "re": "run_pipeline\\(\\s*\\[\\s*analyse\\s*,\\s*write_copy\\s*\\]"
    }
   ]
  },
  {
   "title": {
    "zh": "手写：用 CrewAI 串联两个 Crew",
    "en": "Write it: chain two CrewAI crews"
   },
   "task": {
    "zh": "两个 Crew 已经写好（从 `l57_pipeline_solution` 导入）。写出串联它们的代码：\n1. 用 `inputs` 运行第 1 阶段的 Crew\n2. 新建第 2 阶段的输入：`inputs` 的全部内容 + `\"market_analysis\"`（第 1 阶段结果的文字）\n3. 运行第 2 阶段的 Crew\n4. 打印最终文案的标题和正文\n\n在本地用 `.venv-crewai` 运行（浏览器里不能运行 CrewAI），可以直接在 `practice/l57_pipeline_todo.py` 里做。",
    "en": "The two crews are ready (import them from `l57_pipeline_solution`). Write the code that chains them:\n1. run the stage-1 crew with `inputs`\n2. build the stage-2 input: everything in `inputs` + `\"market_analysis\"` (the text of stage 1's result)\n3. run the stage-2 crew\n4. print the final copy's title and body\n\nRun it locally with `.venv-crewai` (CrewAI can't run in the browser); `practice/l57_pipeline_todo.py` is set up for this."
   },
   "starter": {
    "zh": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\n# 两个 Crew 已经在 57 节的参考答案里写好了，直接导入\nfrom l57_pipeline_solution import build_analysis_crew, build_copy_crew\n\ninputs = {                                   # 视频的输入：和 55 节是同一个问题\n    \"customer_domain\": \"emqx.com\",\n    \"project_description\": \"EMQX 是一款开源的 MQTT 消息服务器，能连接海量物联网设备并实时处理数据。\"\n                           \"请为它策划一次面向国内物联网开发者和企业的推广活动。\",\n}\n\n# 1. 运行第 1 阶段的 Crew\n\n# 2. 准备第 2 阶段的输入：inputs 的全部内容 + \"market_analysis\"（第 1 阶段结果的文字）\n\n# 3. 运行第 2 阶段的 Crew\n\n# 4. 打印最终文案的标题和正文\n",
    "en": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\n# the two crews are already written in lesson 57's solution - just import them\nfrom l57_pipeline_solution import build_analysis_crew, build_copy_crew\n\ninputs = {                                   # the video's input: the same question as lesson 55\n    \"customer_domain\": \"emqx.com\",\n    \"project_description\": \"EMQX is an open-source MQTT message broker that connects huge numbers of IoT devices and processes their data in real time. \"\n                           \"Plan a promotion campaign for it aimed at IoT developers and companies in China.\",\n}\n\n# 1. run the stage-1 crew\n\n# 2. build the stage-2 input: everything in inputs + \"market_analysis\" (the text of stage 1's result)\n\n# 3. run the stage-2 crew\n\n# 4. print the final copy's title and body\n"
   },
   "solution": {
    "zh": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\n# 两个 Crew 已经在 57 节的参考答案里写好了，直接导入\nfrom l57_pipeline_solution import build_analysis_crew, build_copy_crew\n\ninputs = {                                   # 视频的输入：和 55 节是同一个问题\n    \"customer_domain\": \"emqx.com\",\n    \"project_description\": \"EMQX 是一款开源的 MQTT 消息服务器，能连接海量物联网设备并实时处理数据。\"\n                           \"请为它策划一次面向国内物联网开发者和企业的推广活动。\",\n}\n\n# 1. 运行第 1 阶段的 Crew\nresult_a = build_analysis_crew().kickoff(inputs=inputs)\n\n# 2. 准备第 2 阶段的输入\nstage2_inputs = {**inputs, \"market_analysis\": result_a.raw}\n\n# 3. 运行第 2 阶段的 Crew\nresult_b = build_copy_crew().kickoff(inputs=stage2_inputs)\n\n# 4. 打印最终文案的标题和正文\nprint(result_b.pydantic.title)\nprint(result_b.pydantic.body)",
    "en": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\n# the two crews are already written in lesson 57's solution - just import them\nfrom l57_pipeline_solution import build_analysis_crew, build_copy_crew\n\ninputs = {                                   # the video's input: the same question as lesson 55\n    \"customer_domain\": \"emqx.com\",\n    \"project_description\": \"EMQX is an open-source MQTT message broker that connects huge numbers of IoT devices and processes their data in real time. \"\n                           \"Plan a promotion campaign for it aimed at IoT developers and companies in China.\",\n}\n\n# 1. run the stage-1 crew\nresult_a = build_analysis_crew().kickoff(inputs=inputs)\n\n# 2. build the stage-2 input\nstage2_inputs = {**inputs, \"market_analysis\": result_a.raw}\n\n# 3. run the stage-2 crew\nresult_b = build_copy_crew().kickoff(inputs=stage2_inputs)\n\n# 4. print the final copy's title and body\nprint(result_b.pydantic.title)\nprint(result_b.pydantic.body)"
   },
   "checks": [
    {
     "zh": "用 `inputs` 运行第 1 阶段：`build_analysis_crew().kickoff(inputs=inputs)`",
     "en": "Runs stage 1: `build_analysis_crew().kickoff(inputs=inputs)`",
     "re": "build_analysis_crew\\(\\)\\.kickoff\\(\\s*inputs\\s*=\\s*inputs\\s*\\)"
    },
    {
     "zh": "用 `{**inputs, \"market_analysis\": ....raw}` 准备第 2 阶段输入",
     "en": "Builds stage 2's input with `{**inputs, \"market_analysis\": ....raw}`",
     "re": "\\{\\s*\\*\\*inputs\\s*,\\s*[\"']market_analysis[\"']\\s*:\\s*\\w+\\.raw\\s*\\}"
    },
    {
     "zh": "运行第 2 阶段：`build_copy_crew().kickoff(inputs=...)`",
     "en": "Runs stage 2: `build_copy_crew().kickoff(inputs=...)`",
     "re": "build_copy_crew\\(\\)\\.kickoff\\(\\s*inputs\\s*="
    },
    {
     "zh": "从 `.pydantic` 取出标题",
     "en": "Reads the title from `.pydantic`",
     "re": "\\.pydantic\\.title"
    },
    {
     "zh": "从 `.pydantic` 取出正文",
     "en": "Reads the body from `.pydantic`",
     "re": "\\.pydantic\\.body"
    }
   ]
  }
 ],
 "pitfalls": [
  {
   "zh": "照着旧教程写 `from crewai import Pipeline`：crewai 1.x 里已经没有了，报 `ImportError`。",
   "en": "Copying `from crewai import Pipeline` from old tutorials: it's gone in crewai 1.x and raises `ImportError`."
  },
  {
   "zh": "跟着视频在本课环境里 `pip install --upgrade` 或降级 crewai：会弄坏其他节的练习。环境固定为 1.15.23，只用 `pip show` 查看。",
   "en": "Following the video with `pip install --upgrade` (or a downgrade) of crewai in the course environment: it breaks other lessons' practice files. The environment is pinned to 1.15.23 – only look, with `pip show`."
  },
  {
   "zh": "以为拆成两个 Crew 后，后一个还能自动看到前一个的结果：只有同一个 Crew 里的 Task 之间才自动传 context，跨 Crew 要自己放进 `inputs`。",
   "en": "Assuming that after splitting into two crews the second still sees the first's result: only tasks inside one crew pass context automatically; across crews you put it into `inputs` yourself."
  },
  {
   "zh": "Task 里写了 `{market_analysis}`，`inputs` 里却没放这个键：报 `Template variable 'market_analysis' not found in inputs dictionary`。",
   "en": "Writing `{market_analysis}` in a task but leaving that key out of `inputs`: `Template variable 'market_analysis' not found in inputs dictionary`."
  },
  {
   "zh": "把 `result_a`（CrewOutput 对象）直接放进 `inputs`：报 `Unsupported type CrewOutput`，要传 `result_a.raw`。",
   "en": "Putting `result_a` (a CrewOutput object) into `inputs`: `Unsupported type CrewOutput` – pass `result_a.raw`."
  },
  {
   "zh": "以为旧版 Pipeline 会把上一阶段的文字自动传下去：它只合并 `output_json` / `output_pydantic` 的字段。",
   "en": "Assuming the old Pipeline passed a stage's text along automatically: it only merged the `output_json` / `output_pydantic` fields."
  },
  {
   "zh": "DeepSeek + `output_pydantic` 用普通 `LLM(...)`：400 `This response_format type is unavailable now`，改用 55 节的 `llm`。",
   "en": "DeepSeek + `output_pydantic` with a plain `LLM(...)`: 400 `This response_format type is unavailable now` – use lesson 55's `llm`."
  },
  {
   "zh": "把互相依赖的两个 Crew 放进同一个并行阶段：后一个拿不到前一个的结果，要拆到两个阶段。",
   "en": "Putting two dependent crews in one parallel stage: the second can't see the first's result – split them into two stages."
  },
  {
   "zh": "客户端连不上：服务没启动，或者客户端 URL 里的端口和服务的 `port=8012` 不一致。",
   "en": "The client can't connect: the server isn't running, or the URL's port doesn't match the server's `port=8012`."
  }
 ],
 "recap": [
  {
   "zh": "Crew 编排 Agent 和 Task；Pipeline 编排多个 Crew，按「阶段」执行，阶段可以串行，也可以并行。",
   "en": "A crew orders agents and tasks; a Pipeline orders several crews in stages, run sequentially or in parallel."
  },
  {
   "zh": "Pipeline 是 crewai 0.74 的功能，1.x 已删除；官方的替代品是 Flow（下一集）。",
   "en": "Pipeline was a crewai 0.74 feature, removed in 1.x; the official replacement is Flow (next episode)."
  },
  {
   "zh": "视频升级到 0.74 后改了两处：Agent 改用 CrewAI 自己的 `LLM` 类；按老师的解释，`output_json` 依赖默认的 OpenAI 模型配置，要额外配环境变量。1.15.23 里转换直接用 Agent 自己的模型。",
   "en": "After upgrading to 0.74 the video changes two things: agents switch to CrewAI's own `LLM` class; and, as the instructor explains, `output_json` relies on the default OpenAI model settings, so extra environment variables are needed. In 1.15.23 the conversion simply uses the agent's own model."
  },
  {
   "zh": "同一个 Crew 里 Task 之间自动传结果；拆成两个 Crew 后要手写：`result_a = crew_a.kickoff(inputs=inputs)` → `{**inputs, \"market_analysis\": result_a.raw}` → `crew_b.kickoff(...)`。",
   "en": "Tasks inside one crew pass results automatically; across two crews you hand-write it: `result_a = crew_a.kickoff(inputs=inputs)` → `{**inputs, \"market_analysis\": result_a.raw}` → `crew_b.kickoff(...)`."
  },
  {
   "zh": "并行阶段 = `await asyncio.gather(crew_b.kickoff_async(...), crew_c.kickoff_async(...))`；用 Flow 写就是两个方法都 `@listen(上一阶段)`，再用 `and_` 汇合。",
   "en": "A parallel stage = `await asyncio.gather(crew_b.kickoff_async(...), crew_c.kickoff_async(...))`; as a Flow, both methods `@listen(previous_stage)` and `and_` joins them."
  },
  {
   "zh": "对外服务：FastAPI 的 POST 接口接收两个参数 → 运行流水线 → 返回 `{title, body}`；客户端用 `requests.post(url, json=...)`，端口 8012 要对上。",
   "en": "Serving it: a FastAPI POST endpoint takes two fields → runs the pipeline → returns `{title, body}`; the client uses `requests.post(url, json=...)` and port 8012 must match."
  }
 ],
 "files": [
  {
   "path": "practice/l57_single_crew.py",
   "zh": "第一步：原来的一个 Crew 的精简版（分析师 + 文案），同一个 Crew 里结果自动往下传（已用 DeepSeek 实测）；视频这一步跑的完整版是 55 节的 `l55_json_tasks_solution.py`。",
   "en": "Step 1: a slimmed-down version of the original single crew (analyst + copywriter); inside one crew, results pass down automatically (tested with DeepSeek). The full version the video runs in this step is lesson 55's `l55_json_tasks_solution.py`."
  },
  {
   "path": "practice/l57_pipeline_todo.py",
   "zh": "练习：补全 `run_pipeline`，把两个 Crew 串成两阶段流水线（有 TODO 提示）。",
   "en": "Exercise: complete `run_pipeline` to chain two crews into a two-stage pipeline (with TODO hints)."
  },
  {
   "path": "practice/l57_pipeline_solution.py",
   "zh": "参考答案：市场分析 Crew → 文案 Crew，最终输出 `{title, body}`（已用 DeepSeek 实测）。",
   "en": "Solution: analysis crew → copy crew, ending in `{title, body}` (tested with DeepSeek)."
  },
  {
   "path": "practice/l57_parallel_stage.py",
   "zh": "并行阶段示例：第 2 阶段用 `asyncio.gather` 同时运行文案和海报标语两个 Crew。",
   "en": "Parallel-stage demo: stage 2 runs a copy crew and a poster-slogan crew at once with `asyncio.gather`."
  },
  {
   "path": "practice/l57_pipeline_as_flow.py",
   "zh": "视频的示意图写成 Flow：crew1 → crew2、crew3 并行 → crew4，不调用模型，打印每个阶段的开始和结束时间。",
   "en": "The video's diagram as a Flow: crew1 → crew2 and crew3 in parallel → crew4; no model calls, prints when each stage starts and ends."
  },
  {
   "path": "practice/l57_pipeline_api.py",
   "zh": "FastAPI 服务（端口 8012）：`POST /marketing` 运行流水线并返回 JSON，对应视频的 `main.py`。",
   "en": "FastAPI server (port 8012): `POST /marketing` runs the pipeline and returns JSON – the video's `main.py`."
  },
  {
   "path": "practice/l57_api_client.py",
   "zh": "客户端：向 `/marketing` 发 POST 请求并打印结果，对应视频的 API 测试脚本；58 节的服务也能用。",
   "en": "Client: POSTs to `/marketing` and prints the result – the video's API test script; also works with lesson 58's server."
  }
 ]
});
