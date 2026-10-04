COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
 "id": "l58",
 "priority": "important",
 "handwrite": true,
 "studyMinutes": 50,
 "source": "subtitle",
 "summary": {
  "zh": "全课最后一集：CrewAI 的 **Flows**。视频先讲概念——四个特点、`@start` / `@listen` / `@router` 三个装饰器、`or_` / `and_` 条件、最终输出和两种状态管理；再用命令行生成官方的「写诗 Flow」模板，修好一处导入报错后运行，并画出流程图；接着把营销项目拆成两个 Crew，用 Flow 串起来，最后接进 FastAPI。讲义在 crewai 1.15.23 上重写了这些例子，补上视频只讲了概念的路由循环和 `or_` / `and_` 汇合，最后是整门课的回顾。",
  "en": "The last episode of the course: CrewAI **Flows**. The video starts with the concepts – four traits, the three decorators `@start` / `@listen` / `@router`, `or_` / `and_` conditions, the final output and two kinds of state – then generates the official “poem Flow” template from the command line, fixes one import error, runs it and draws its chart; next it splits the marketing project into two crews chained by a Flow, and finally serves it with FastAPI. These notes redo the examples on crewai 1.15.23, add runnable router loops and `or_` / `and_` joins that the video only describes, and end with a review of the whole course."
 },
 "goals": [
  {
   "zh": "说清 Flow 的四个特点和三个装饰器，以及它和 Crew、Pipeline 的区别",
   "en": "Explain a Flow's four traits and three decorators, and how it differs from a Crew and a Pipeline"
  },
  {
   "zh": "手写视频里的写诗 Flow：结构化状态 + `@start` → `@listen` → `@listen`，用 `kickoff(inputs=...)` 运行、`plot()` 画图",
   "en": "Hand-write the video's poem Flow: a structured state + `@start` → `@listen` → `@listen`, run with `kickoff(inputs=...)` and drawn with `plot()`"
  },
  {
   "zh": "在 Flow 的步骤里运行 Crew，通过 `self.state` 传数据（视频的营销 Flow）",
   "en": "Run crews inside Flow steps and pass data through `self.state` (the video's marketing Flow)"
  },
  {
   "zh": "把 Flow 接进 FastAPI：每个请求新建一个 Flow，`await kickoff_async(...)`",
   "en": "Serve a Flow with FastAPI: a new Flow per request, `await kickoff_async(...)`"
  },
  {
   "zh": "补充：用 `@router` 返回标签做分支和重试循环，用 `or_` / `and_` 汇合多个步骤",
   "en": "Extra: branch and retry with labels returned by `@router`; join steps with `or_` / `and_`"
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
   "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=0) 这一集还是在第 55 集的「营销战略协作智能体」项目（本课 [55 节](#/lesson/l55)）上迭代：在原来的 crewai_test 项目里放进一个 Flows 版本的文件夹，讲 CrewAI 的 **Flows**。[▶ 01:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=62) 版本仍是 crewai 0.74.2、crewai-tools 0.13.2，老师再次提醒先用和他一样的版本跑通。[▶ 06:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=404) 测试分四步：\n1. 用官方的示例模板测试 Flow；\n2. 自己写一个 `flows_test.py`，测试营销项目的 Flow；\n3. 把 Flow 集成进 `main.py`，启动 API 服务；\n4. 用 API 测试脚本发 POST 请求联调。\n\n模型仍是通过代理调用的 OpenAI **GPT-4o-mini**（老师也提到可以换成 One-API 转接的通义千问或 Ollama 本地模型）；本课用 DeepSeek（deepseek-flash）。",
   "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=0) This episode again builds on the “marketing strategy crew” project from episode 55 (this course's [lesson 55](#/lesson/l55)): a Flows-version folder goes into the old crewai_test project, and the topic is CrewAI **Flows**. [▶ 01:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=62) The versions are still crewai 0.74.2 and crewai-tools 0.13.2, and the instructor again advises getting things running on his versions first. [▶ 06:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=404) Testing has four steps:\n1. test Flows with the official example template;\n2. write your own `flows_test.py` to test the marketing project's Flow;\n3. integrate the Flow into `main.py` and start the API service;\n4. send POST requests with an API test script to test it end to end.\n\nThe model is still OpenAI's **GPT-4o-mini** called through a proxy (the instructor also mentions switching to Qwen via One-API or to a local Ollama model); this course uses DeepSeek (deepseek-flash)."
  },
  {
   "t": "p",
   "zh": "和上一集的 Pipeline 不同，Flows 在本课环境 **crewai 1.15.23** 里依然存在，而且是 CrewAI 现在主推的工作流写法。讲义里的例子都在 1.15.23 上运行过；和视频（0.74）不一样的地方会单独指出。",
   "en": "Unlike last episode's Pipeline, Flows still exist in the course's **crewai 1.15.23** and are now CrewAI's main way to build workflows. Every example here was run on 1.15.23; differences from the video (0.74) are pointed out along the way."
  },
  {
   "t": "h",
   "zh": "二、Flows 的概念",
   "en": "2. Flow concepts"
  },
  {
   "t": "p",
   "zh": "[▶ 01:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=94) Flows 是为搭建复杂 AI 工作流设计的框架。老师总结了四个特点：\n1. **简化流程搭建**：把多个 Crew 和「任务」串起来——这里的任务，就是你在代码里自己写的方法或函数；\n2. **状态管理**：不同步骤之间方便地存取、共享数据；\n3. **事件驱动**：一个方法运行完，就会触发监听它的方法；\n4. **灵活的控制流**：可以写条件、循环和分支。\n\n[▶ 02:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=124) 三个关键的装饰器：\n\n| 装饰器 | 作用 |\n|---|---|\n| `@start()` | 标记 Flow 的起点。可以有好几个，Flow 启动时它们**并行**运行 |\n| `@listen(方法)` | 标记监听器：被监听的方法运行完，它就运行 |\n| `@router(方法)` | 根据那个方法的输出，决定接下来走哪条路，动态控制流程 |\n\n[▶ 02:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=155) 两个条件函数写在 `@listen(...)` 里：`or_(a, b)`——监听的方法中**任何一个**完成就运行；[▶ 03:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=185) `and_(a, b)`——**全部**完成后才运行。关于结果和状态：Flow 的最终输出由**最后完成的那个方法**的返回值决定；状态（state）是各个方法共用的一块数据，谁都可以读、可以改。[▶ 03:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=216) 状态管理有两种：**非结构化**——所有数据都放在 Flow 的 state 里，随时可以加字段，灵活但没有约束；**结构化**——事先用模型定义好字段，保证整个流程的数据一致、类型安全。",
   "en": "[▶ 01:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=94) Flows are a framework for building complex AI workflows. The instructor lists four traits:\n1. **Easier workflow building**: chain several crews and “tasks” – here a task simply means a method or function you write in your own code;\n2. **State management**: store and share data between steps easily;\n3. **Event-driven**: when a method finishes, the methods listening to it run;\n4. **Flexible control flow**: conditions, loops and branches.\n\n[▶ 02:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=124) Three key decorators:\n\n| Decorator | What it does |\n|---|---|\n| `@start()` | Marks a starting point. There can be several; they all run **in parallel** when the Flow starts |\n| `@listen(method)` | Marks a listener: it runs once the method it listens to has finished |\n| `@router(method)` | Decides which path comes next from that method's output, steering the flow dynamically |\n\n[▶ 02:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=155) Two condition functions go inside `@listen(...)`: `or_(a, b)` – runs when **any** of the listed methods finishes; [▶ 03:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=185) `and_(a, b)` – runs only after **all** of them finish. On results and state: a Flow's final output is the return value of **the last method to finish**, and the state is one block of data shared by all the methods – any of them can read and change it. [▶ 03:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=216) There are two kinds of state management: **unstructured** – everything lives in the Flow's state and you can add fields any time, flexible but unchecked; **structured** – fields are defined up front in a model, keeping the data consistent and type-safe across the flow."
  },
  {
   "t": "p",
   "zh": "和 Crew、上一集的 Pipeline 比一比：\n\n| | Crew | Flow | Pipeline（0.74，已删除） |\n|---|---|---|---|\n| 谁决定顺序 | Task 列表的顺序，或由经理 Agent 分派 | 你用装饰器写好的规则 | `stages` 列表 |\n| 每一步是什么 | Agent 执行 Task | 任意 Python：普通函数、一次模型调用、整个 Crew | 一个或几个 Crew |\n| 擅长 | 需要几个 Agent 自主协作的开放任务 | 步骤明确、要分支 / 循环 / 混合普通代码的流程 | 只是把几个 Crew 串起来 |\n\n简单说：**流程是确定的就用 Flow，需要 Agent 自己商量就用 Crew**。两者经常组合：Flow 负责整体流程，某些步骤里放一个 Crew——视频的营销 Flow 就是这样。",
   "en": "Compared with a Crew and last episode's Pipeline:\n\n| | Crew | Flow | Pipeline (0.74, removed) |\n|---|---|---|---|\n| Who sets the order | The task list, or a manager agent | Rules you write with decorators | The `stages` list |\n| What a step is | An agent doing a task | Any Python: a function, one model call, a whole crew | One or more crews |\n| Good for | Open-ended work where agents collaborate on their own | Clear steps with branches / loops / plain code mixed in | Just chaining crews |\n\nIn short: **use a Flow when the process is known, a Crew when agents should work it out themselves**. They combine well: the Flow runs the overall process and some steps hold a crew – exactly what the video's marketing Flow does."
  },
  {
   "t": "check",
   "q": {
    "zh": "「读取订单 → 金额超过 1000 元转人工，否则自动回复 → 记日志」，最适合用什么写？",
    "en": "“Read an order → over 1000 yuan goes to a human, otherwise auto-reply → write a log” fits best as…"
   },
   "options": [
    {
     "zh": "一个 Crew，让几个 Agent 自己商量",
     "en": "A crew where agents work it out"
    },
    {
     "zh": "一个 Flow：步骤固定，用路由分两条路",
     "en": "A Flow: fixed steps, a router for the two paths"
    },
    {
     "zh": "一个 Pipeline",
     "en": "A Pipeline"
    }
   ],
   "answer": 1,
   "explain": {
    "zh": "步骤和分支条件都是确定的，用 Flow 写最清楚；如果「自动回复」这一步需要多个 Agent 协作，可以在那一步里放一个 Crew。",
    "en": "The steps and the branching rule are fixed, so a Flow states them most clearly; if the auto-reply step needs agents to collaborate, put a crew inside that step."
   }
  },
  {
   "t": "h",
   "zh": "三、官方示例：写诗的 Flow",
   "en": "3. The official example: a poem-writing Flow"
  },
  {
   "t": "video",
   "zh": "[▶ 07:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=464) 老师在终端里执行 `crewai create flow flows_test`，生成官方的示例工程，[▶ 08:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=495) 当前文件夹下多出一个 `flows_test` 文件夹。[▶ 08:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=527) 代码在 `src/flows_test` 下面：`crews/poem_crew` 文件夹里是写诗的 Crew（`config` 里的 `agents.yaml`、`tasks.yaml` 写提示词，`poem_crew.py` 定义 Agent、Task 和 Crew），外面的 `main.py` 定义 Flow。运行前，他在 `main.py` 最上面用环境变量配置模型（GPT-4o-mini）。[▶ 09:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=588) 进到 `src/flows_test` 直接运行 `main.py`，导入 Crew 的那一行报错；[▶ 10:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=620) 把 `from .crews...` 前面的点去掉（相对导入改成普通导入）后就跑通了：一个写诗的 Agent 按传入的句数写了一首诗。\n\n[▶ 12:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=742) 代码逻辑：从 `crewai.flow.flow` 导入 `Flow`、`listen`、`start`；[▶ 12:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=773) 结构化状态里有句数 `sentence_count` 和诗 `poem` 两个字段。三个方法：`@start` 的第一个方法随机生成 1 到 5 的句数，存进 state；[▶ 13:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=805) `@listen` 第一个方法的第二个方法，把句数交给 Crew 写诗，再把诗存进 state；[▶ 14:27](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=867) `@listen` 第二个方法的第三个方法，把诗保存成本地的 `poem.txt`。[▶ 14:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=898) 运行时先实例化 Flow，再调用它的 `kickoff`（模板通过 `asyncio` 启动）；另一个函数调用 `plot()`，[▶ 15:29](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=929) 老师改成运行它，[▶ 16:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=965) 得到 `crewai_flow.html`，用浏览器打开是一张三个方法依次相连的流程图。",
   "en": "[▶ 07:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=464) In a terminal the instructor runs `crewai create flow flows_test` to generate the official example project, [▶ 08:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=495) and a `flows_test` folder appears in the current folder. [▶ 08:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=527) The code lives under `src/flows_test`: the `crews/poem_crew` folder holds the poem-writing crew (`agents.yaml` and `tasks.yaml` in `config` hold the prompts, `poem_crew.py` defines the agent, task and crew), and `main.py` outside it defines the Flow. Before running, he sets up the model (GPT-4o-mini) with environment variables at the top of `main.py`. [▶ 09:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=588) Running `main.py` directly from inside `src/flows_test` fails on the line that imports the crew; [▶ 10:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=620) after removing the dot in front of `from .crews...` (turning the relative import into a plain one) it works: a poet agent writes a poem with the requested number of lines.\n\n[▶ 12:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=742) The logic: import `Flow`, `listen` and `start` from `crewai.flow.flow`; [▶ 12:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=773) the structured state has two fields, the line count `sentence_count` and the poem `poem`. Three methods: the first, marked `@start`, picks a random line count from 1 to 5 and stores it in the state; [▶ 13:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=805) the second, marked `@listen` on the first, gives the line count to the crew to write the poem and stores the poem in the state; [▶ 14:27](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=867) the third, marked `@listen` on the second, saves the poem to a local `poem.txt`. [▶ 14:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=898) To run it, you instantiate the Flow and call its `kickoff` (the template starts it through `asyncio`); another function calls `plot()`, [▶ 15:29](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=929) which the instructor switches to running, [▶ 16:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=965) producing `crewai_flow.html` – opened in a browser, it is a chart of the three methods connected one after another."
  },
  {
   "t": "p",
   "zh": "在 1.15.23 里，`crewai create flow 名字` 生成的模板换成了写文章的 `ContentFlow`（`plan_content` → `generate_content` → `save_content`），结构完全一样；导入写成 `from crewai.flow import Flow, listen, start`（视频的 `crewai.flow.flow` 仍然兼容，两者是同一个东西），模板里的 `kickoff()` 直接调用，不再用 `asyncio`；导入 Crew 改成了 `from 项目名.crews...` 的写法，不再是带点的相对导入，但也因此不能进到文件夹里直接 `python main.py`，要在项目根目录用 `crewai run` 运行（它会用 uv 安装依赖）。本课不用模板，把视频里的写诗 Flow 写在一个文件里：",
   "en": "In 1.15.23, the template generated by `crewai create flow <name>` is an article-writing `ContentFlow` instead (`plan_content` → `generate_content` → `save_content`), with exactly the same structure; the import is written `from crewai.flow import Flow, listen, start` (the video's `crewai.flow.flow` still works – they are the same thing), and the template calls `kickoff()` directly, without `asyncio`; the crew is now imported as `from <project_name>.crews...` rather than with a relative import starting with a dot – but that also means you can't go into the folder and run `python main.py` directly: run it with `crewai run` from the project root instead (it installs dependencies with uv). This lesson skips the template and writes the video's poem Flow in a single file:"
  },
  {
   "t": "code",
   "file": "l58_flow_solution.py",
   "code": {
    "zh": "import os\nimport random\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import Agent, Crew, Task\nfrom crewai.flow import Flow, listen, start      # 视频（0.74）写的是 crewai.flow.flow，现在也能用\nfrom pydantic import BaseModel\nfrom l55_deepseek_llm import llm\n\n\nclass PoemState(BaseModel):            # 所有步骤共用的数据（结构化状态）\n    topic: str = \"学 Agent 开发\"\n    sentence_count: int = 1\n    poem: str = \"\"\n\n\ndef build_poem_crew():                 # 写诗的小 Crew（模板里放在 crews/poem_crew 文件夹）\n    poet = Agent(role=\"诗人\", goal=\"围绕 {topic} 写轻松有趣的短诗\",\n                 backstory=\"你写的诗短小、押韵，带一点幽默。\", llm=llm)\n    task = Task(description=\"写一首关于「{topic}」的轻松短诗，一共 {sentence_count} 句。\",\n                expected_output=\"正好 {sentence_count} 句中文诗，每句一行，不要标题，不要解释。\",\n                agent=poet)\n    return Crew(agents=[poet], tasks=[task])\n\n\nclass PoemFlow(Flow[PoemState]):\n\n    @start()                           # 第一步：kickoff 后最先运行\n    def generate_sentence_count(self):\n        self.state.sentence_count = random.randint(1, 5)\n\n    @listen(generate_sentence_count)   # 上一步完成后运行\n    def generate_poem(self):\n        result = build_poem_crew().kickoff(inputs={\n            \"topic\": self.state.topic,\n            \"sentence_count\": self.state.sentence_count,\n        })\n        self.state.poem = result.raw\n\n    @listen(generate_poem)             # generate_poem 完成后运行\n    def save_poem(self):\n        with open(\"l58_poem.txt\", \"w\", encoding=\"utf-8\") as f:\n            f.write(self.state.poem)\n        return self.state.poem         # 最后一步的返回值 = kickoff() 的返回值\n\n\nif __name__ == \"__main__\":\n    flow = PoemFlow()\n    print(flow.kickoff(inputs={\"topic\": \"学 Agent 开发\"}))    # inputs 先填进 state\n    print(flow.plot(\"l58_poem_flow.html\", show=False))       # 流程图的完整路径",
    "en": "import os\nimport random\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import Agent, Crew, Task\nfrom crewai.flow import Flow, listen, start      # the video (0.74) wrote crewai.flow.flow, which still works\nfrom pydantic import BaseModel\nfrom l55_deepseek_llm import llm\n\n\nclass PoemState(BaseModel):            # data shared by every step (structured state)\n    topic: str = \"learning to build agents\"\n    sentence_count: int = 1\n    poem: str = \"\"\n\n\ndef build_poem_crew():                 # the poem crew (the template keeps it in crews/poem_crew)\n    poet = Agent(role=\"Poet\", goal=\"Write short, light-hearted poems about {topic}\",\n                 backstory=\"Your poems are short, they rhyme and they have a bit of humour.\", llm=llm)\n    task = Task(description=\"Write a light-hearted poem about '{topic}' with {sentence_count} lines.\",\n                expected_output=\"Exactly {sentence_count} lines of poetry, one per line, no title, no explanation.\",\n                agent=poet)\n    return Crew(agents=[poet], tasks=[task])\n\n\nclass PoemFlow(Flow[PoemState]):\n\n    @start()                           # step 1: runs first after kickoff\n    def generate_sentence_count(self):\n        self.state.sentence_count = random.randint(1, 5)\n\n    @listen(generate_sentence_count)   # runs when the previous step has finished\n    def generate_poem(self):\n        result = build_poem_crew().kickoff(inputs={\n            \"topic\": self.state.topic,\n            \"sentence_count\": self.state.sentence_count,\n        })\n        self.state.poem = result.raw\n\n    @listen(generate_poem)             # runs when generate_poem has finished\n    def save_poem(self):\n        with open(\"l58_poem.txt\", \"w\", encoding=\"utf-8\") as f:\n            f.write(self.state.poem)\n        return self.state.poem         # the last step's return value = what kickoff() returns\n\n\nif __name__ == \"__main__\":\n    flow = PoemFlow()\n    print(flow.kickoff(inputs={\"topic\": \"learning to build agents\"}))   # inputs fill the state first\n    print(flow.plot(\"l58_poem_flow.html\", show=False))                 # full path of the flow chart"
   },
   "note": {
    "zh": "完整文件 `practice/l58_flow_solution.py`，1 次模型调用：先打印这次随机到几句，再把诗保存到 `l58_poem.txt`，最后打印 `plot()` 返回的流程图路径（在一个临时文件夹里）。在本机用 DeepSeek 实际运行过，这次得到的是一首两行、押「ang」韵的小诗。运行时终端会打印很多方框日志（每个步骤开始 / 结束），想安静一点可以写 `PoemFlow(suppress_flow_events=True)`。",
    "en": "Full file `practice/l58_flow_solution.py`, 1 model call: it first prints how many lines were picked at random this time, then saves the poem to `l58_poem.txt`, and finally prints the chart path returned by `plot()` (in a temp folder). Actually run on this machine with DeepSeek: this time it produced a two-line Chinese poem (from the Chinese prompt) rhyming on “ang”. While it runs, the terminal prints lots of boxed log messages (each step starting / finishing); for a quieter run, write `PoemFlow(suppress_flow_events=True)`."
   }
  },
  {
   "t": "p",
   "zh": "逐行看懂它：\n- `class PoemState(BaseModel)`：定义 state 有哪些字段（回顾 12 节的 pydantic）。每个字段都要有**默认值**，因为 Flow 一创建就会用默认值生成一份 state。\n- `class PoemFlow(Flow[PoemState])`：写一个继承 `Flow` 的类，方括号里告诉它 state 的类型。\n- `@start()`：标记第一步。可以有好几个 `@start`，启动时会**一起**运行。\n- `@listen(generate_sentence_count)`：那个方法完成后运行这一步。括号里写**方法本身**（不加括号），也可以写方法名的字符串 `\"generate_sentence_count\"`。\n- `self.state.sentence_count = ...`：读写共享数据。\n- `flow.kickoff(inputs={...})`：先把 `inputs` 填进 state 里的同名字段，再从 `@start` 开始运行；返回值是**最后完成的那一步**的返回值。\n- `flow.plot(\"名字.html\", show=False)`：生成流程图，返回 HTML 文件的完整路径。视频里文件生成在当前文件夹；1.15.23 放在一个新建的临时文件夹里，`show=True`（默认）会自动用浏览器打开。\n- 保存诗用的 `with open(...)` 回顾 19 节的文件读写。",
   "en": "Line by line:\n- `class PoemState(BaseModel)`: the fields of the state (see pydantic in lesson 12). Every field needs a **default**, because the Flow builds a state from the defaults as soon as it is created.\n- `class PoemFlow(Flow[PoemState])`: a class that inherits from `Flow`, with the state type in the square brackets.\n- `@start()`: marks the first step. You may have several `@start` steps; they all run **together** at the start.\n- `@listen(generate_sentence_count)`: run this step once that method has finished. Pass **the method itself** (no parentheses) or its name as a string, `\"generate_sentence_count\"`.\n- `self.state.sentence_count = ...`: read and write the shared data.\n- `flow.kickoff(inputs={...})`: first copies `inputs` into the state fields with the same names, then runs from the `@start` steps; it returns the return value of **the last step to finish**.\n- `flow.plot(\"name.html\", show=False)`: draws the flow and returns the HTML file's full path. In the video the file lands in the current folder; 1.15.23 puts it in a newly created temp folder, and `show=True` (the default) opens it in the browser.\n- The `with open(...)` that saves the poem is the file I/O from lesson 19."
  },
  {
   "t": "py",
   "title": {
    "zh": "回顾 08、18 节的类和继承：Flow[PoemState] 和 self.state",
    "en": "Classes and inheritance again (lessons 08, 18): Flow[PoemState] and self.state"
   },
   "zh": "定义 Flow 用的是 08 节（类、`__init__`、`self`）和 18 节（继承）学过的写法：`class PoemFlow(Flow[PoemState]):` 括号里写父类 `Flow`，所以不用自己写就有 `kickoff()`、`plot()`；方法里用 `self.state` 读写这个对象的数据。新的只有三点：\n- **类名后面的方括号**：`Flow[PoemState]` 告诉 Flow「我的 state 是 `PoemState` 类型」，就像 `list[int]` 表示「装整数的列表」。不写方括号时，state 是一个普通字典（第四节）。\n- **state 跟着对象走**：同一个对象运行两次，state 会保留；新建一个对象，就从默认值重新开始——第六节接 FastAPI 时要用到这一点。\n- `random.randint(1, 5)`：随机返回 1 到 5 之间的一个整数，两端都包含。",
   "en": "Defining a Flow uses what lessons 08 (classes, `__init__`, `self`) and 18 (inheritance) taught: in `class PoemFlow(Flow[PoemState]):` the parent class `Flow` goes in the parentheses, so you get `kickoff()` and `plot()` without writing them, and methods read and write this object's data through `self.state`. Only three things are new:\n- **Square brackets after a class name**: `Flow[PoemState]` tells Flow “my state is a `PoemState`”, just as `list[int]` means “a list of integers”. Without the brackets the state is a plain dict (part 4).\n- **The state belongs to the object**: run the same object twice and its state is kept; create a new object and it starts again from the defaults – part 6 relies on this when adding FastAPI.\n- `random.randint(1, 5)`: returns a random whole number from 1 to 5, both ends included.",
   "code": {
    "zh": "import random\n\nclass Base:                            # 父类：写好通用的流程（回顾 18 节）\n    def run(self):\n        self.step()                    # 调用的是子类里写的 step\n        return self.state\n\nclass CounterFlow(Base):               # 子类只写自己的部分\n    def __init__(self):                # 回顾 08 节：创建对象时自动运行\n        self.state = {\"count\": 0}\n\n    def step(self):\n        self.state[\"count\"] += 1\n\nf = CounterFlow()\nprint(f.run())               # {'count': 1}\nprint(f.run())               # {'count': 2}：同一个对象，state 一直保留\nprint(CounterFlow().run())   # {'count': 1}：新对象，从头开始\n\nprint(list[int])             # 方括号说明「装的是什么类型」，Flow[PoemState] 也是这个意思\nprint(random.randint(1, 5))  # 1 到 5 之间随机一个整数，两端都包含",
    "en": "import random\n\nclass Base:                            # parent class: the shared procedure (see lesson 18)\n    def run(self):\n        self.step()                    # calls the step written in the subclass\n        return self.state\n\nclass CounterFlow(Base):               # the subclass writes only its own part\n    def __init__(self):                # see lesson 08: runs when the object is created\n        self.state = {\"count\": 0}\n\n    def step(self):\n        self.state[\"count\"] += 1\n\nf = CounterFlow()\nprint(f.run())               # {'count': 1}\nprint(f.run())               # {'count': 2}: same object, the state is kept\nprint(CounterFlow().run())   # {'count': 1}: a new object starts from scratch\n\nprint(list[int])             # brackets say \"what type is inside\"; Flow[PoemState] means the same\nprint(random.randint(1, 5))  # a random whole number from 1 to 5, both ends included"
   }
  },
  {
   "t": "warn",
   "zh": "四个在 1.15.23 上实际试出来的坑：\n- `@start` **忘了写括号**：不报错，但这个方法根本不会运行，`kickoff()` 返回 `None`。要写 `@start()`。\n- state 的字段**没有默认值**（比如 `topic: str`）：创建 Flow 时就报 `ValidationError`。\n- 写成 `@listen(generate_sentence_count())`：加了括号就是「现在就调用这个方法」，定义类的时候就报 `TypeError`（缺少 `self` 参数）。\n- `inputs` 的键名和 state 字段名对不上（比如写成 `\"topics\"`）：不报错，state 保持默认值，结果和你想的不一样。",
   "en": "Four traps, all tried on 1.15.23:\n- `@start` **without parentheses**: no error, but the method never runs and `kickoff()` returns `None`. Write `@start()`.\n- A state field **without a default** (e.g. `topic: str`): creating the Flow raises `ValidationError`.\n- `@listen(generate_sentence_count())`: the parentheses mean “call this method now”, so defining the class already fails with `TypeError` (missing `self`).\n- An `inputs` key that doesn't match a state field (e.g. `\"topics\"`): no error, the state keeps its default and the result isn't what you expected."
  },
  {
   "t": "h",
   "zh": "四、两种状态：结构化和非结构化",
   "en": "4. Two kinds of state: structured and unstructured"
  },
  {
   "t": "p",
   "zh": "[▶ 03:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=216) 视频在概念部分讲了两种状态管理，模板用的是结构化的那种。对比一下：\n- **结构化**：像上面那样写 `Flow[PoemState]`，字段事先定义好，有类型、有默认值，编辑器也能自动补全。\n- **非结构化**：直接写 `Flow`，state 就是一个字典，想存什么键就存什么，灵活但容易拼错。\n\n两种 state 都会自动带一个 `id` 字段，用来区分每一次运行。新手建议用结构化状态。",
   "en": "[▶ 03:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=216) The video's concept part describes two ways to manage state; the template uses the structured one. Side by side:\n- **Structured**: `Flow[PoemState]` as above; fields are defined up front with types and defaults, and the editor can autocomplete them.\n- **Unstructured**: just `Flow`; the state is a dict and you store any keys you like – flexible, but typos slip through.\n\nBoth kinds get an automatic `id` field that tells runs apart. As a beginner, prefer structured state."
  },
  {
   "t": "code",
   "file": "free_state_flow.py",
   "code": {
    "zh": "from crewai.flow import Flow, listen, start\n\nclass FreeFlow(Flow):                  # 不写 [状态类]：state 是一个普通字典\n    @start()\n    def first(self):\n        self.state[\"count\"] = 1        # 字典的写法：方括号 + 字符串键\n\n    @listen(first)\n    def second(self):\n        self.state[\"count\"] += 1\n        return self.state[\"count\"]\n\nflow = FreeFlow()\nprint(flow.kickoff(inputs={\"topic\": \"咖啡\"}))   # 2\nprint(flow.state)      # {'id': '...', 'topic': '咖啡', 'count': 2}：自动带一个 id",
    "en": "from crewai.flow import Flow, listen, start\n\nclass FreeFlow(Flow):                  # no [StateClass]: the state is a plain dict\n    @start()\n    def first(self):\n        self.state[\"count\"] = 1        # dict style: brackets + string keys\n\n    @listen(first)\n    def second(self):\n        self.state[\"count\"] += 1\n        return self.state[\"count\"]\n\nflow = FreeFlow()\nprint(flow.kickoff(inputs={\"topic\": \"coffee\"}))   # 2\nprint(flow.state)      # {'id': '...', 'topic': 'coffee', 'count': 2}: an id is added automatically"
   }
  },
  {
   "t": "check",
   "q": {
    "zh": "`PoemState` 有字段 `topic`（默认「学 Agent 开发」）。运行 `PoemFlow().kickoff(inputs={\"topic\": \"周末爬山\"})` 时，第一步里读到的 `self.state.topic` 是？",
    "en": "`PoemState` has a field `topic` (default “learning to build agents”). With `PoemFlow().kickoff(inputs={\"topic\": \"weekend hiking\"})`, what does the first step see in `self.state.topic`?"
   },
   "options": [
    {
     "zh": "「学 Agent 开发」，inputs 要等最后一步才生效",
     "en": "“learning to build agents” – inputs only take effect at the last step"
    },
    {
     "zh": "报错，inputs 不能改 state",
     "en": "An error – inputs can't change the state"
    },
    {
     "zh": "「周末爬山」，kickoff 会先把 inputs 填进 state",
     "en": "“weekend hiking” – kickoff copies inputs into the state first"
    }
   ],
   "answer": 2,
   "explain": {
    "zh": "`kickoff(inputs=...)` 在运行任何步骤之前，就把同名字段填进 state，所以第一步就能读到。",
    "en": "`kickoff(inputs=...)` fills the matching state fields before any step runs, so the very first step sees them."
   }
  },
  {
   "t": "h",
   "zh": "五、营销 Flow：在步骤里运行 Crew",
   "en": "5. The marketing Flow: crews inside steps"
  },
  {
   "t": "video",
   "zh": "[▶ 16:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=995) 第二步，老师参照模板的目录结构改写营销项目。[▶ 17:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=1062) 运行前同样要配置两套模型：环境变量里的默认模型给 Task 的 `output_json` 用（上一集讲过），`utils/myLLM.py` 的外部模型给 Agent 用。[▶ 18:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=1125) `crews` 文件夹里放两个 Crew：市场分析 Crew（1 个 Agent、1 个 Task），[▶ 19:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=1156) 以及另外 2 个 Agent、4 个 Task 组成的 Crew，都从 YAML 读提示词、用外部传入的模型、按顺序执行。[▶ 19:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=1188) `flows_test.py` 导入这两个 Crew 和 `myLLM`；[▶ 20:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=1219) 项目里的搜索工具直接用 crewai_tools 里现成的那个，需要到它的网站申请 API key（想用自己的搜索引擎，就自己写一个工具交给 Agent）。[▶ 20:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=1250) `TestFlow` 类接收模型和输入：`@start` 的方法做市场分析，`@listen` 它的方法拿到分析结果运行第二个 Crew；[▶ 21:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=1281) `run_flow` 函数传入输入并运行，最后得到 `{title, body}` 格式的 JSON。",
   "en": "[▶ 16:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=995) In step 2, the instructor rewrites the marketing project following the template's folder layout. [▶ 17:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=1062) Again two model settings are needed before running: the default model in environment variables for the tasks' `output_json` (covered last episode), and the external model in `utils/myLLM.py` for the agents. [▶ 18:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=1125) The `crews` folder holds two crews: a market-analysis crew (1 agent, 1 task) [▶ 19:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=1156) and a crew of the other 2 agents and 4 tasks; both read their prompts from YAML, use the model passed in from outside and run sequentially. [▶ 19:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=1188) `flows_test.py` imports both crews and `myLLM`; [▶ 20:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=1219) the project's search tool is simply the ready-made one from crewai_tools, which needs an API key from its website (to use your own search engine, write your own tool and give it to the agent). [▶ 20:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=1250) A `TestFlow` class receives the model and the inputs: the `@start` method does the market analysis, and the method that `@listen`s to it takes the analysis and runs the second crew; [▶ 21:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=1281) a `run_flow` function passes in the inputs and runs it, ending in JSON shaped `{title, body}`."
  },
  {
   "t": "p",
   "zh": "视频的 `TestFlow` 把模型和输入交给**构造函数**，结构大致是这样（只作对照，省略号是两个 Crew 的调用）：",
   "en": "The video's `TestFlow` hands the model and the inputs to the **constructor**; its structure is roughly this (for reference only; the ellipses stand for the two crew calls):"
  },
  {
   "t": "code",
   "file": {
    "zh": "flows_test.py（视频的结构，大意）",
    "en": "flows_test.py (the video's structure, gist)"
   },
   "code": {
    "zh": "# 视频 flows_test.py 的结构（大意，只作对照）\nclass TestFlow(Flow):\n    def __init__(self, llm, inputs):       # 模型和输入通过构造函数传进来\n        super().__init__()                 # 先让父类 Flow 完成自己的初始化\n        self.llm = llm\n        self.inputs = inputs\n\n    @start()\n    def market_analysis(self):             # 第 1 步：运行市场分析 Crew（用 self.llm 和 self.inputs）\n        ...\n\n    @listen(market_analysis)\n    def marketing_copy(self):              # 第 2 步：拿到分析结果，运行另一个 Crew，得到 {title, body}\n        ...\n\nresult = TestFlow(llm, inputs).kickoff()",
    "en": "# The structure of the video's flows_test.py (the gist, for reference only)\nclass TestFlow(Flow):\n    def __init__(self, llm, inputs):       # the model and the inputs come in through the constructor\n        super().__init__()                 # let the parent class Flow do its own setup first\n        self.llm = llm\n        self.inputs = inputs\n\n    @start()\n    def market_analysis(self):             # step 1: run the market-analysis crew (with self.llm and self.inputs)\n        ...\n\n    @listen(market_analysis)\n    def marketing_copy(self):              # step 2: take the analysis, run the other crew, get {title, body}\n        ...\n\nresult = TestFlow(llm, inputs).kickoff()"
   },
   "note": {
    "zh": "子类自己写 `__init__` 时，第一行要调用 `super().__init__()`：`super()` 指父类，这一行让 `Flow` 先完成它自己的准备工作（建 state、登记各个步骤），然后再存自己的东西。在 1.15.23 里这种写法也能运行（实测过）。",
    "en": "When a subclass writes its own `__init__`, its first line must call `super().__init__()`: `super()` means the parent class, and this line lets `Flow` finish its own setup (creating the state, registering the steps) before you store your own things. This style also runs in 1.15.23 (tested)."
   }
  },
  {
   "t": "p",
   "zh": "本课的写法稍有不同：直接复用 57 节写好的两个 Crew（模型已经在 Crew 里配好，不用再传），输入也和视频一样，用 `l57_pipeline_solution.py` 里的 `INPUTS`（55 节那个 emqx.com 的问题）。输入交给 `kickoff(inputs=...)`，放进结构化 state，每一步都能读到，中间结果也存在 state 里：",
   "en": "This lesson does it slightly differently: it reuses the two crews from lesson 57 (their model is already set inside the crews, so there's nothing to pass in), and the input is the same as the video's – `INPUTS` from `l57_pipeline_solution.py` (lesson 55's emqx.com question). The input goes to `kickoff(inputs=...)` and into a structured state that every step can read, and the intermediate results are stored in the state as well:"
  },
  {
   "t": "code",
   "file": "l58_marketing_flow.py",
   "code": {
    "zh": "from crewai.flow import Flow, listen, start\nfrom pydantic import BaseModel\nfrom l57_pipeline_solution import INPUTS, build_analysis_crew, build_copy_crew   # 复用 57 节的两个 Crew 和视频的输入\n\n\nclass MarketingState(BaseModel):\n    customer_domain: str = \"\"\n    project_description: str = \"\"\n    market_analysis: str = \"\"\n    title: str = \"\"\n    body: str = \"\"\n\n\nclass MarketingFlow(Flow[MarketingState]):\n\n    @start()\n    def market_analysis(self):                       # 第 1 步：分析 Crew\n        result = build_analysis_crew().kickoff(inputs={\n            \"customer_domain\": self.state.customer_domain,\n            \"project_description\": self.state.project_description,\n        })\n        self.state.market_analysis = result.raw      # 结果放进 state，后面的步骤都能用\n\n    @listen(market_analysis)\n    def create_copy(self):                           # 第 2 步：文案 Crew\n        result = build_copy_crew().kickoff(inputs={\n            \"customer_domain\": self.state.customer_domain,\n            \"project_description\": self.state.project_description,\n            \"market_analysis\": self.state.market_analysis,\n        })\n        self.state.title = result.pydantic.title\n        self.state.body = result.pydantic.body\n        return {\"title\": self.state.title, \"body\": self.state.body}\n\n\ncopy = MarketingFlow().kickoff(inputs=INPUTS)        # INPUTS 的两个键正好是 state 里的两个字段\nprint(copy)          # {'title': ..., 'body': ...}",
    "en": "from crewai.flow import Flow, listen, start\nfrom pydantic import BaseModel\nfrom l57_pipeline_solution import INPUTS, build_analysis_crew, build_copy_crew   # reuse lesson 57's two crews and the video's input\n\n\nclass MarketingState(BaseModel):\n    customer_domain: str = \"\"\n    project_description: str = \"\"\n    market_analysis: str = \"\"\n    title: str = \"\"\n    body: str = \"\"\n\n\nclass MarketingFlow(Flow[MarketingState]):\n\n    @start()\n    def market_analysis(self):                       # step 1: the analysis crew\n        result = build_analysis_crew().kickoff(inputs={\n            \"customer_domain\": self.state.customer_domain,\n            \"project_description\": self.state.project_description,\n        })\n        self.state.market_analysis = result.raw      # store the result in the state for all later steps\n\n    @listen(market_analysis)\n    def create_copy(self):                           # step 2: the copy crew\n        result = build_copy_crew().kickoff(inputs={\n            \"customer_domain\": self.state.customer_domain,\n            \"project_description\": self.state.project_description,\n            \"market_analysis\": self.state.market_analysis,\n        })\n        self.state.title = result.pydantic.title\n        self.state.body = result.pydantic.body\n        return {\"title\": self.state.title, \"body\": self.state.body}\n\n\ncopy = MarketingFlow().kickoff(inputs=INPUTS)        # the two keys of INPUTS are exactly two of the state's fields\nprint(copy)          # {'title': ..., 'body': ...}"
   },
   "note": {
    "zh": "在本机用 DeepSeek 实际运行过：2 次模型调用，返回 `{'title': ..., 'body': ...}`（这次的标题是「你的IoT数据总线，凭什么交给别人？」）。和 57 节的手写流水线比，做的事一样，但每一步是一个独立的方法，数据都在 `self.state` 里；以后想加「检查文案」「保存到文件」之类的步骤，只要再写一个 `@listen` 方法。完整文件 `practice/l58_marketing_flow.py`。",
    "en": "Actually run on this machine with DeepSeek: 2 model calls, returning `{'title': ..., 'body': ...}` (this run's title, translated: “Your IoT data bus – why hand it to someone else?”). It does the same job as lesson 57's hand-written pipeline, but each step is a separate method and all the data sits in `self.state`; to add a step later, such as “check the copy” or “save to a file”, just write another `@listen` method. Full file: `practice/l58_marketing_flow.py`."
   }
  },
  {
   "t": "h",
   "zh": "六、接进 FastAPI",
   "en": "6. Serving it with FastAPI"
  },
  {
   "t": "video",
   "zh": "[▶ 21:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=1314) 最后一步：把测试代码搬进正式服务。`flows.py` 只保留 `TestFlow` 类，[▶ 22:26](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=1346) `main.py` 导入它，在接口里运行 Flow，其余和上一集的 Pipeline 版几乎一样：[▶ 22:57](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=1377) 开头配置默认模型、Agent 的外部模型和搜索服务的 key；[▶ 23:59](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=1439) 端口 8012，用 FastAPI 创建 app，带一个启动时的初始化函数；[▶ 24:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=1471) POST 接口接收测试脚本发来的数据，拼成输入后运行 Flow，把结果整理成 JSON 返回。[▶ 25:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=1501) 演示时先启动 `main.py`，[▶ 25:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=1533) 确认服务在 8012 端口启动后再运行测试脚本（URL 里的地址和端口要对上），[▶ 26:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=1563) 服务端日志跑完，测试脚本收到 `{title, body}`。",
   "en": "[▶ 21:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=1314) The last step moves the test code into the real service. `flows.py` keeps only the `TestFlow` class, [▶ 22:26](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=1346) and `main.py` imports it and runs the Flow inside the endpoint; the rest is almost the same as last episode's Pipeline version: [▶ 22:57](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=1377) model settings for the default model and the agents' external model plus the search-service key at the top; [▶ 23:59](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=1439) port 8012, a FastAPI app with a startup function; [▶ 24:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=1471) a POST endpoint that receives the test script's data, builds the inputs, runs the Flow and returns the result as JSON. [▶ 25:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=1501) For the demo he starts `main.py` first, [▶ 25:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=1533) checks that the service is up on port 8012, then runs the test script (its URL's host and port must match), [▶ 26:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=59&t=1563) and after the server log finishes, the script receives `{title, body}`."
  },
  {
   "t": "code",
   "file": "l58_flow_api.py",
   "code": {
    "zh": "import uvicorn\nfrom fastapi import FastAPI\nfrom pydantic import BaseModel\nfrom l58_marketing_flow import MarketingFlow\n\napp = FastAPI()\n\nclass MarketingRequest(BaseModel):\n    customer_domain: str\n    project_description: str\n\n@app.post(\"/marketing\")\nasync def marketing(req: MarketingRequest):\n    flow = MarketingFlow()                                     # 每个请求一个新的 Flow\n    return await flow.kickoff_async(inputs=req.model_dump())   # 返回 create_copy 的字典 -> JSON\n\nif __name__ == \"__main__\":\n    uvicorn.run(app, host=\"127.0.0.1\", port=8012)",
    "en": "import uvicorn\nfrom fastapi import FastAPI\nfrom pydantic import BaseModel\nfrom l58_marketing_flow import MarketingFlow\n\napp = FastAPI()\n\nclass MarketingRequest(BaseModel):\n    customer_domain: str\n    project_description: str\n\n@app.post(\"/marketing\")\nasync def marketing(req: MarketingRequest):\n    flow = MarketingFlow()                                     # a fresh flow per request\n    return await flow.kickoff_async(inputs=req.model_dump())   # create_copy's dict -> JSON\n\nif __name__ == \"__main__\":\n    uvicorn.run(app, host=\"127.0.0.1\", port=8012)"
   },
   "note": {
    "zh": "两个要点：Flow 有 `kickoff_async`，所以接口写成 `async def` 再 `await`；**每个请求新建一个 Flow**——如果全局只建一个 `flow` 给所有请求用，它们会共用同一份 `self.state`，两个人同时请求时数据会串在一起。客户端直接用 57 节的 `l57_api_client.py`。",
    "en": "Two points: Flow has `kickoff_async`, so the endpoint is `async def` with `await`; and **create a new Flow per request** – one global `flow` shared by every request means one shared `self.state`, and two simultaneous requests would mix their data. Use lesson 57's `l57_api_client.py` as the client."
   }
  },
  {
   "t": "code",
   "lang": "powershell",
   "file": "PowerShell",
   "code": {
    "zh": "cd practice\n\n# 调用 DeepSeek 的例子 / examples that call DeepSeek\n& ..\\.venv-crewai\\Scripts\\python.exe l58_flow_solution.py\n& ..\\.venv-crewai\\Scripts\\python.exe l58_marketing_flow.py\n\n# 服务 + 客户端（两个终端）/ server + client (two terminals)\n& ..\\.venv-crewai\\Scripts\\python.exe l58_flow_api.py\n& ..\\.venv-crewai\\Scripts\\python.exe l57_api_client.py\n\n# 补充例子 / extras\n& ..\\.venv-crewai\\Scripts\\python.exe l58_router_solution.py   # 调用 DeepSeek / calls DeepSeek\n& ..\\.venv-crewai\\Scripts\\python.exe l58_join_demo.py        # 不调用模型 / no model calls\n& ..\\.venv-crewai\\Scripts\\python.exe l58_persist_demo.py     # 不调用模型 / no model calls",
    "en": "cd practice\n\n# examples that call DeepSeek\n& ..\\.venv-crewai\\Scripts\\python.exe l58_flow_solution.py\n& ..\\.venv-crewai\\Scripts\\python.exe l58_marketing_flow.py\n\n# server + client (two terminals)\n& ..\\.venv-crewai\\Scripts\\python.exe l58_flow_api.py\n& ..\\.venv-crewai\\Scripts\\python.exe l57_api_client.py\n\n# extras\n& ..\\.venv-crewai\\Scripts\\python.exe l58_router_solution.py   # calls DeepSeek\n& ..\\.venv-crewai\\Scripts\\python.exe l58_join_demo.py        # no model calls\n& ..\\.venv-crewai\\Scripts\\python.exe l58_persist_demo.py     # no model calls"
   }
  },
  {
   "t": "h",
   "zh": "七、补充：@router 分支和重试循环",
   "en": "7. Extra: @router branches and retry loops"
  },
  {
   "t": "note",
   "zh": "补充：视频只在概念部分介绍了 `@router`、`or_` 和 `and_`，没有写代码。它们正是「复杂工作流」最需要的东西，这一节和下一节给出在 1.15.23 上实际运行过的例子；时间紧可以先跳过，回头再看。",
   "en": "Extra: the video introduces `@router`, `or_` and `and_` only in its concept part, without code. They are exactly what “complex workflows” need, so this part and the next give examples actually run on 1.15.23; short on time? Skip them and come back later."
  },
  {
   "t": "p",
   "zh": "`@router(某一步)` 标记的方法在那一步完成后运行，它的**返回值是一个字符串标签**。哪些步骤写了 `@listen(\"这个标签\")`，接下来就运行哪些：\n- **分支**：返回 `\"ok\"` 走发布，返回 `\"give_up\"` 走放弃；\n- **循环**：返回 `\"retry\"`，而第一步写的是 `@start(\"retry\")`——它既在启动时运行，也会在收到 `\"retry\"` 时再运行一次，于是形成「写 → 检查 → 不合格再写」的循环。\n\n下面的例子让模型写一句广告语，字数超了就重写，最多试 3 次。这一步直接调用 `llm.call(提示词)`，没有用 Crew：步骤里放什么都可以。",
   "en": "A method marked `@router(some_step)` runs after that step finishes, and its **return value is a string label**. Whichever steps say `@listen(\"that label\")` run next:\n- **Branching**: return `\"ok\"` to publish, `\"give_up\"` to stop;\n- **Looping**: return `\"retry\"` while the first step is `@start(\"retry\")` – it runs at the start *and* again whenever `\"retry\"` is emitted, giving a “write → check → rewrite” loop.\n\nThe example asks the model for a slogan and rewrites it if it's too long, at most 3 times. The step calls `llm.call(prompt)` directly instead of a crew: a step can hold anything."
  },
  {
   "t": "code",
   "file": "l58_router_solution.py",
   "code": {
    "zh": "from typing import Literal\nfrom crewai.flow import Flow, listen, router, start\nfrom pydantic import BaseModel\nfrom l55_deepseek_llm import llm\n\n\nclass CopyState(BaseModel):\n    product: str = \"桂花冷萃\"\n    max_chars: int = 12\n    draft: str = \"\"\n    tries: int = 0\n\n\nclass ReviewFlow(Flow[CopyState]):\n\n    @start(\"retry\")                    # kickoff 时运行；之后每收到 \"retry\" 再运行一次\n    def write(self):\n        self.state.tries += 1\n        prompt = f\"为{self.state.product}写一句广告语，不超过{self.state.max_chars}个字，只输出广告语本身。\"\n        if self.state.tries > 1:\n            prompt += f\"上一版有{len(self.state.draft)}个字，太长了：{self.state.draft}\"\n        self.state.draft = llm.call(prompt).strip()     # 步骤里直接调用模型，不一定要用 Crew\n\n    @router(write)                     # write 完成后运行，返回值是「标签」\n    def review(self) -> Literal[\"ok\", \"retry\", \"give_up\"]:\n        if len(self.state.draft) <= self.state.max_chars:\n            return \"ok\"\n        if self.state.tries >= 3:      # 计数器：防止无限循环\n            return \"give_up\"\n        return \"retry\"\n\n    @listen(\"ok\")                      # 监听标签，不是方法\n    def publish(self):\n        return f\"通过：{self.state.draft}\"\n\n    @listen(\"give_up\")\n    def stop_trying(self):             # 方法名不能和标签同名（不能叫 give_up）\n        return f\"试了 {self.state.tries} 次还是太长：{self.state.draft}\"\n\n\nprint(ReviewFlow().kickoff(inputs={\"product\": \"桂花冷萃\", \"max_chars\": 12}))",
    "en": "from typing import Literal\nfrom crewai.flow import Flow, listen, router, start\nfrom pydantic import BaseModel\nfrom l55_deepseek_llm import llm\n\n\nclass CopyState(BaseModel):\n    product: str = \"osmanthus cold brew\"\n    max_chars: int = 12\n    draft: str = \"\"\n    tries: int = 0\n\n\nclass ReviewFlow(Flow[CopyState]):\n\n    @start(\"retry\")                    # runs at kickoff, and again every time \"retry\" is emitted\n    def write(self):\n        self.state.tries += 1\n        prompt = f\"Write one slogan for {self.state.product}, at most {self.state.max_chars} characters. Output only the slogan.\"\n        if self.state.tries > 1:\n            prompt += f\" The last one had {len(self.state.draft)} characters - too long: {self.state.draft}\"\n        self.state.draft = llm.call(prompt).strip()     # call the model right in the step - a crew is optional\n\n    @router(write)                     # runs after write; its return value is a \"label\"\n    def review(self) -> Literal[\"ok\", \"retry\", \"give_up\"]:\n        if len(self.state.draft) <= self.state.max_chars:\n            return \"ok\"\n        if self.state.tries >= 3:      # a counter: prevents an endless loop\n            return \"give_up\"\n        return \"retry\"\n\n    @listen(\"ok\")                      # listens to a label, not a method\n    def publish(self):\n        return f\"passed: {self.state.draft}\"\n\n    @listen(\"give_up\")\n    def stop_trying(self):             # the method must not share the label's name (so not give_up)\n        return f\"still too long after {self.state.tries} tries: {self.state.draft}\"\n\n\nprint(ReviewFlow().kickoff(inputs={\"product\": \"osmanthus cold brew\", \"max_chars\": 12}))"
   },
   "note": {
    "zh": "在本机用 DeepSeek 实测：第一版「冷萃桂花香，一口入秋凉」连逗号共 11 个字，路由返回 `\"ok\"`，一共 1 次模型调用（模型写长了才会进入重写循环，所以每次运行的调用次数是 1–3 次）。返回值写上 `-> Literal[...]`（回顾 28 节），`plot()` 画出的流程图里才有这几条分支线；不写也能运行，只是图上缺了这几条线。",
    "en": "Tested on this machine with DeepSeek (using the Chinese version of the prompt): the first draft, a slogan meaning roughly “Cold brew with an osmanthus scent, one sip and autumn's cool”, was 11 characters including the comma, so the router returned `\"ok\"` after a single model call (only a draft that's too long enters the rewrite loop, so each run makes 1–3 calls). Annotating the return value with `-> Literal[...]` (see lesson 28) is what makes these branch lines appear in the chart drawn by `plot()`; without it the flow still runs, but the chart lacks those lines."
   }
  },
  {
   "t": "warn",
   "zh": "路由最容易出的三个错（都在 1.15.23 上试过）：\n- **方法名和标签同名**：`@listen(\"give_up\")` 下面的方法也叫 `give_up`，创建 Flow 时直接报 `ValidationError`（会被当成自己监听自己的死循环）。换个名字，比如 `stop_trying`。\n- **标签拼错**：路由返回 `\"Ok\"`，监听的却是 `\"ok\"`：不报错，后面的步骤都不运行，Flow 就这样结束了，`kickoff()` 的返回值变成了标签 `\"Ok\"` 本身。\n- **循环没有计数器**：一直返回 `\"retry\"`，`write` 和 `review` 会被反复调用，直到路由被调用第 100 次时 Flow 报 `RecursionError` 停下——这时 `write` 已经跑了 100 多次，模型调用的钱都花出去了。在 state 里记次数，到上限就走别的标签。",
   "en": "The three most common router mistakes (all tried on 1.15.23):\n- **A method named like its label**: the method under `@listen(\"give_up\")` is also called `give_up`, and creating the Flow fails straight away with `ValidationError` (it would count as a method listening to itself, an endless loop). Pick another name, such as `stop_trying`.\n- **A misspelled label**: the router returns `\"Ok\"` but the listener waits for `\"ok\"`: no error, none of the later steps run, the Flow just ends there, and `kickoff()` returns the label `\"Ok\"` itself.\n- **A loop without a counter**: if it keeps returning `\"retry\"`, `write` and `review` are called again and again until the Flow stops with `RecursionError` on the router's 100th call – by then `write` has run over 100 times and the money for those model calls is spent. Count the tries in the state and switch to another label at the limit."
  },
  {
   "t": "p",
   "zh": "不用框架时，同样的逻辑就是一个带计数器的 `while` 循环（回顾 06 节）。下面用模拟模型运行：模拟模型的回答比较长，所以你会看到它重写 3 次后放弃——正好走到 `give_up` 那条路。",
   "en": "Without a framework, the same logic is a `while` loop with a counter (see lesson 06). Run it with the mock model: its answers are long, so you'll see three drafts and then a give-up – exactly the `give_up` path."
  },
  {
   "t": "code",
   "file": "review_loop_by_hand.py",
   "run": "mock",
   "code": {
    "zh": "from llm import client, MODEL\n\nMAX_CHARS = 12\ndraft, tries = \"\", 0\n\nwhile True:\n    tries += 1                                            # ← write 步骤\n    prompt = f\"为桂花冷萃写一句广告语，不超过{MAX_CHARS}个字，只输出广告语本身。\"\n    r = client.chat.completions.create(model=MODEL, messages=[{\"role\": \"user\", \"content\": prompt}])\n    draft = r.choices[0].message.content.strip()\n    print(f\"第 {tries} 版（{len(draft)} 字）：{draft}\")\n\n    if len(draft) <= MAX_CHARS:                           # ← review 返回 \"ok\"\n        print(\"通过：\", draft)\n        break\n    if tries >= 3:                                        # ← review 返回 \"give_up\"\n        print(\"试了 3 次还是太长，放弃\")\n        break\n    # ← 否则相当于 review 返回 \"retry\"：回到循环开头，再写一次",
    "en": "from llm import client, MODEL\n\nMAX_CHARS = 12\ndraft, tries = \"\", 0\n\nwhile True:\n    tries += 1                                            # ← the write step\n    prompt = f\"Write one slogan for osmanthus cold brew, at most {MAX_CHARS} characters. Output only the slogan.\"\n    r = client.chat.completions.create(model=MODEL, messages=[{\"role\": \"user\", \"content\": prompt}])\n    draft = r.choices[0].message.content.strip()\n    print(f\"draft {tries} ({len(draft)} chars): {draft}\")\n\n    if len(draft) <= MAX_CHARS:                           # ← review returns \"ok\"\n        print(\"passed:\", draft)\n        break\n    if tries >= 3:                                        # ← review returns \"give_up\"\n        print(\"still too long after 3 tries - giving up\")\n        break\n    # ← otherwise it's as if review returned \"retry\": back to the top to write again"
   }
  },
  {
   "t": "check",
   "q": {
    "zh": "上面的 `review` 返回了 `\"retry\"`，接下来运行哪个方法？",
    "en": "The `review` above returned `\"retry\"`. Which method runs next?"
   },
   "options": [
    {
     "zh": "`publish`",
     "en": "`publish`"
    },
    {
     "zh": "`write`，因为它写的是 `@start(\"retry\")`",
     "en": "`write`, because it is `@start(\"retry\")`"
    },
    {
     "zh": "`review` 自己再运行一次",
     "en": "`review` itself runs again"
    },
    {
     "zh": "没有方法运行，Flow 结束",
     "en": "Nothing – the Flow ends"
    }
   ],
   "answer": 1,
   "explain": {
    "zh": "路由返回的标签会触发所有监听这个标签的方法；`write` 用 `@start(\"retry\")` 监听了它，所以再写一版，之后 `review` 又会检查。",
    "en": "A label triggers every method listening to it; `write` listens via `@start(\"retry\")`, so it writes another draft and `review` checks it again."
   }
  },
  {
   "t": "h",
   "zh": "八、补充：or_ 和 and_ 汇合",
   "en": "8. Extra: joining steps with or_ and and_"
  },
  {
   "t": "p",
   "zh": "一个 Flow 可以有多个 `@start`，启动时它们**一起**运行。后面的步骤要等谁，用条件来写：\n- `@listen(and_(a, b))`：`a` 和 `b` **都**完成后才运行；\n- `@listen(or_(a, b))`：`a` 或 `b` **任意一个**完成就运行，而且只运行一次；\n- 监听的方法可以多写一个参数，接收触发它的那一步的**返回值**。\n\n下面这个例子不调用模型，完整文件 `practice/l58_join_demo.py` 可以随便运行（`PromoState` 和 `Literal` 的导入见完整文件）。",
   "en": "A Flow can have several `@start` steps; they all run **together** at the start. Later steps say whom they wait for with a condition:\n- `@listen(and_(a, b))`: runs once **both** `a` and `b` have finished;\n- `@listen(or_(a, b))`: runs as soon as **either** finishes, and only once;\n- a listening method may take one extra parameter that receives the triggering step's **return value**.\n\nThis example calls no model, so the full file `practice/l58_join_demo.py` is free to run (see it for the `PromoState` and `Literal` imports)."
  },
  {
   "t": "code",
   "file": "l58_join_demo.py",
   "code": {
    "zh": "from crewai.flow import Flow, and_, listen, or_, router, start\n\nclass PromoFlow(Flow[PromoState]):\n\n    @start()\n    def check_stock(self):                         # 两个 @start：kickoff 后都会运行\n        self.state.stock = 120\n        return \"stock ok\"\n\n    @start()\n    def check_weather(self):\n        self.state.weather = \"晴\"\n        return \"weather ok\"\n\n    @listen(or_(check_stock, check_weather))       # 任意一个完成就运行（只运行一次）\n    def log_first(self, first_result):             # 可以接收触发它的那一步的返回值\n        print(\"先到的结果：\", first_result)\n\n    @listen(and_(check_stock, check_weather))      # 两个都完成后才运行\n    def plan_promo(self):\n        self.state.plan = f\"库存 {self.state.stock} 杯，天气{self.state.weather}\"\n\n    @router(plan_promo)\n    def choose_channel(self) -> Literal[\"outdoor\", \"online\"]:\n        return \"outdoor\" if self.state.weather == \"晴\" else \"online\"\n\n    @listen(\"outdoor\")\n    def street_event(self):\n        return \"周末门口摆摊试饮\"\n\n    @listen(\"online\")\n    def online_coupon(self):\n        return \"发线上优惠券\"",
    "en": "from crewai.flow import Flow, and_, listen, or_, router, start\n\nclass PromoFlow(Flow[PromoState]):\n\n    @start()\n    def check_stock(self):                         # two @start steps: both run after kickoff\n        self.state.stock = 120\n        return \"stock ok\"\n\n    @start()\n    def check_weather(self):\n        self.state.weather = \"sunny\"\n        return \"weather ok\"\n\n    @listen(or_(check_stock, check_weather))       # runs when either finishes (only once)\n    def log_first(self, first_result):             # may receive the triggering step's return value\n        print(\"first result in:\", first_result)\n\n    @listen(and_(check_stock, check_weather))      # runs only after both have finished\n    def plan_promo(self):\n        self.state.plan = f\"{self.state.stock} cups in stock, weather {self.state.weather}\"\n\n    @router(plan_promo)\n    def choose_channel(self) -> Literal[\"outdoor\", \"online\"]:\n        return \"outdoor\" if self.state.weather == \"sunny\" else \"online\"\n\n    @listen(\"outdoor\")\n    def street_event(self):\n        return \"tasting stand outside the shop this weekend\"\n\n    @listen(\"online\")\n    def online_coupon(self):\n        return \"send online coupons\""
   },
   "note": {
    "zh": "实际运行的打印顺序：两个 `@start` → `log_first` 收到 `stock ok` → `plan_promo` → 路由返回 `\"outdoor\"` → 最终结果是「周末门口摆摊试饮」。",
    "en": "Printed order in a real run: the two `@start` steps → `log_first` receives `stock ok` → `plan_promo` → the router returns `\"outdoor\"` → the final result is “tasting stand outside the shop this weekend”."
   }
  },
  {
   "t": "check",
   "q": {
    "zh": "「库存查询」和「天气查询」同时开始，要等两个都有结果才能制定促销方案。`plan_promo` 应该怎么写？",
    "en": "Stock and weather checks start together, and the promo plan needs both results. How should `plan_promo` be decorated?"
   },
   "options": [
    {
     "zh": "写成 `@listen(or_(check_stock, check_weather))`",
     "en": "Use `@listen(or_(check_stock, check_weather))`"
    },
    {
     "zh": "写成 `@listen(check_stock)`",
     "en": "Use `@listen(check_stock)`"
    },
    {
     "zh": "写成 `@listen(and_(check_stock, check_weather))`",
     "en": "Use `@listen(and_(check_stock, check_weather))`"
    },
    {
     "zh": "写成 `@start()`",
     "en": "Use `@start()`"
    }
   ],
   "answer": 2,
   "explain": {
    "zh": "`and_` 等所有条件都满足；`or_` 只要一个完成就运行，那时另一个的数据可能还没准备好。",
    "en": "`and_` waits for all of them; `or_` fires on the first, when the other's data may not be ready yet."
   }
  },
  {
   "t": "note",
   "zh": "再补充一个视频没讲的功能：给 Flow 类加上 `@persist(SQLiteFlowPersistence(路径))`，每一步结束后 state 都会存进 SQLite 数据库；下次在 `inputs` 里传入上次的 `id`，就会先把旧 state 读回来再接着运行。不写路径时，数据库 `flow_states.db` 放在 CrewAI 的存储目录里：设了环境变量 `CREWAI_STORAGE_DIR`（本课练习文件开头都设了）就放在那个文件夹，没设就放到 C 盘 AppData 下、按当前文件夹名建的子文件夹。明确写路径最清楚，也不会占 C 盘。想看效果就运行 `practice/l58_persist_demo.py`（不调用模型）。",
   "en": "One more feature the video doesn't cover: add `@persist(SQLiteFlowPersistence(path))` to a Flow class and the state is saved to an SQLite database after every step; next time, pass the previous `id` in `inputs` and the old state is loaded back before the run continues. Without a path, the database `flow_states.db` goes into CrewAI's storage directory: if the environment variable `CREWAI_STORAGE_DIR` is set (this course's practice files all set it at the top), it lands in that folder; if not, it goes under AppData on drive C, in a subfolder named after the current folder. Writing the path explicitly is clearest and keeps drive C free. To see it in action, run `practice/l58_persist_demo.py` (no model calls)."
  },
  {
   "t": "h",
   "zh": "九、全课回顾和下一步（补充）",
   "en": "9. Course review and what's next (extra)"
  },
  {
   "t": "p",
   "zh": "恭喜你走到最后一集。回头看整门课，其实一直在重复同一件事：**模型 + 工具 + 记忆 + 控制流程**，只是每个框架的写法不同。\n\n| 模块 | 节 | 学到了什么 |\n|---|---|---|\n| Agent 基础概念 | [00–03](#/lesson/l00) | Agent 是什么、有哪些类型、由哪些部分组成 |\n| 从零手写 Agent | [04–07](#/lesson/l04) | 只用 OpenAI 兼容接口写出 API 调用、工具调用、记忆和 ReAct 循环 |\n| OpenAI Agents SDK | [08–14](#/lesson/l08) | 第一个框架：异步、流式、多模态、MCP、多个 Agent 分工 |\n| AgentScope | [15–22](#/lesson/l15) | 带工具、RAG、MCP 和中间件的智能体 |\n| LangGraph | [23–42](#/lesson/l23) | 节点和边控制流程；记忆、检查点、人工审核、时光旅行、流式；完整应用 |\n| LangChain | [43–50](#/lesson/l43) | 模型输入输出、数据连接、对话历史、LCEL 和 Agent |\n| CrewAI 与工作流 | [51–58](#/lesson/l51) | Agent 团队、FastAPI 服务、JSON 输出、人类反馈、Pipeline 思想和 Flows |",
   "en": "Congratulations on reaching the last episode. Looking back, the whole course repeats one idea – **model + tools + memory + control flow** – in different frameworks' styles.\n\n| Module | Lessons | What you learned |\n|---|---|---|\n| Agent fundamentals | [00–03](#/lesson/l00) | What an agent is, its types and building blocks |\n| Hand-writing an agent from scratch | [04–07](#/lesson/l04) | API calls, tool calls, memory and a ReAct loop with only an OpenAI-compatible API |\n| OpenAI Agents SDK | [08–14](#/lesson/l08) | A first framework: async, streaming, multimodality, MCP, agents splitting work |\n| AgentScope | [15–22](#/lesson/l15) | Agents with tools, RAG, MCP and middleware |\n| LangGraph | [23–42](#/lesson/l23) | Nodes and edges for control flow; memory, checkpoints, human review, time travel, streaming; full apps |\n| LangChain | [43–50](#/lesson/l43) | Model I/O, data connections, chat history, LCEL and agents |\n| CrewAI & workflows | [51–58](#/lesson/l51) | Agent teams, FastAPI services, JSON output, human feedback, the Pipeline idea and Flows |"
  },
  {
   "t": "p",
   "zh": "接下来可以这样做：\n1. **回到核心节再手写一遍**：04–07 节不看答案重写，所有框架底层做的都是这几件事。\n2. **做一个自己的小项目**：比如用 Flow 串起「读资料 → 分析 → 写报告 → 存文件」，或用 LangGraph 做一个带记忆的助手。先做出能跑通的最小版本，每次只加一个功能。\n3. **先查版本再写代码**：框架更新很快，动手前看看本机装的版本和官方文档；旧教程里的代码（比如 Pipeline）可能已经不能用了。\n4. **把作品做成服务**：FastAPI 接口 + 一个客户端，是这门课反复用到的模式。\n5. **注意成本和可靠性**：看 token 用量，设置超时和重试上限，循环一定要有计数器。\n\n随时可以用「随机复习」页抽题巩固学过的内容。",
   "en": "What to do next:\n1. **Hand-write the core lessons again**: redo 04–07 without the answers – every framework does these things underneath.\n2. **Build a small project of your own**: e.g. a Flow that chains “read material → analyse → write report → save file”, or a LangGraph assistant with memory. Start with the smallest version that runs, then add one feature at a time.\n3. **Check versions before coding**: frameworks change fast, so look at your installed version and the official docs first; code from old tutorials (Pipeline, for one) may no longer work.\n4. **Turn your work into a service**: a FastAPI endpoint + a client is the pattern this course uses again and again.\n5. **Watch cost and reliability**: track tokens, set timeouts and retry limits, and always give loops a counter.\n\nThe Review page can quiz you on everything you've covered at any time."
  }
 ],
 "quiz": [
  {
   "q": {
    "zh": "`flow.kickoff()` 的返回值是什么？",
    "en": "What does `flow.kickoff()` return?"
   },
   "options": [
    {
     "zh": "第一个 `@start` 方法的返回值",
     "en": "The first `@start` method's return value"
    },
    {
     "zh": "整个 state 对象",
     "en": "The whole state object"
    },
    {
     "zh": "最后完成的那个方法的返回值",
     "en": "The return value of the last method to finish"
    },
    {
     "zh": "永远是 `None`",
     "en": "Always `None`"
    }
   ],
   "answer": 2,
   "explain": {
    "zh": "Flow 的最终输出由最后完成的方法决定；想拿到 state，用 `flow.state`。",
    "en": "A Flow's final output comes from the last method to finish; read `flow.state` for the state."
   }
  },
  {
   "q": {
    "zh": "为什么写 `@listen(generate_sentence_count)` 而不是 `@listen(generate_sentence_count())`？",
    "en": "Why `@listen(generate_sentence_count)` rather than `@listen(generate_sentence_count())`?"
   },
   "options": [
    {
     "zh": "要把方法本身交给 `listen`；加了括号就变成立即调用它",
     "en": "`listen` needs the method itself; parentheses would call it right away"
    },
    {
     "zh": "两种写法完全一样",
     "en": "They are exactly the same"
    },
    {
     "zh": "加括号会让它监听两次",
     "en": "Parentheses make it listen twice"
    },
    {
     "zh": "加括号是旧版本的写法",
     "en": "Parentheses are the old-version syntax"
    }
   ],
   "answer": 0,
   "explain": {
    "zh": "`generate_sentence_count` 是方法本身（一个值），加了括号就是在定义类时立刻调用它，1.15.23 里直接报 `TypeError`。也可以写字符串 `\"generate_sentence_count\"`。",
    "en": "`generate_sentence_count` is the method itself (a value); with parentheses it is called while the class is being defined, which fails with `TypeError` in 1.15.23. The string `\"generate_sentence_count\"` also works."
   }
  },
  {
   "q": {
    "zh": "一个 Flow 里有两个 `@start()` 方法，`kickoff()` 之后会怎样？",
    "en": "A Flow has two `@start()` methods. What happens after `kickoff()`?"
   },
   "options": [
    {
     "zh": "只运行写在前面的那个",
     "en": "Only the first one in the code runs"
    },
    {
     "zh": "报错：一个 Flow 只能有一个起点",
     "en": "An error: a Flow can have only one start"
    },
    {
     "zh": "按代码顺序，第一个完成后才运行第二个",
     "en": "They run in code order, the second after the first finishes"
    },
    {
     "zh": "两个一起（并行）运行",
     "en": "Both run together (in parallel)"
    }
   ],
   "answer": 3,
   "explain": {
    "zh": "视频讲过：Flow 启动时，所有 `@start` 方法都会并行执行。实测两个各睡 1 秒的 `@start`，一共只用 1 秒。",
    "en": "As the video says, every `@start` method runs in parallel when the Flow starts. In a test, two `@start` steps sleeping 1 second each took 1 second in total."
   }
  },
  {
   "q": {
    "zh": "`@router` 方法返回了 `\"retry\"`，会触发哪些方法？",
    "en": "A `@router` method returns `\"retry\"`. What does it trigger?"
   },
   "options": [
    {
     "zh": "名字叫 `retry` 的方法",
     "en": "A method named `retry`"
    },
    {
     "zh": "所有用 `@listen(\"retry\")` 或 `@start(\"retry\")` 监听这个标签的方法",
     "en": "Every method listening to that label with `@listen(\"retry\")` or `@start(\"retry\")`"
    },
    {
     "zh": "路由方法自己再运行一次",
     "en": "The router itself, again"
    },
    {
     "zh": "Flow 从头重新开始，state 也清空",
     "en": "The whole Flow restarts with an empty state"
    }
   ],
   "answer": 1,
   "explain": {
    "zh": "标签是一个事件名，监听它的方法会运行，state 保持不变。方法名不能和标签同名，否则创建 Flow 时报错。",
    "en": "A label is an event name; methods listening to it run and the state is kept. A method may not share a label's name, or creating the Flow fails."
   }
  },
  {
   "q": {
    "zh": "`@listen(or_(a, b))` 和 `@listen(and_(a, b))` 的区别是？",
    "en": "What's the difference between `@listen(or_(a, b))` and `@listen(and_(a, b))`?"
   },
   "options": [
    {
     "zh": "没有区别",
     "en": "No difference"
    },
    {
     "zh": "`or_` 要两个都完成，`and_` 一个完成就行",
     "en": "`or_` needs both, `and_` needs one"
    },
    {
     "zh": "`or_` 任意一个完成就运行一次，`and_` 两个都完成后才运行",
     "en": "`or_` runs once when either finishes; `and_` runs after both finish"
    },
    {
     "zh": "`or_` 会运行两次，`and_` 运行一次",
     "en": "`or_` runs twice, `and_` once"
    }
   ],
   "answer": 2,
   "explain": {
    "zh": "和字面意思一样：or 是「或」，and 是「且」。实测 `or_` 在第一个完成时运行，之后不会再运行。",
    "en": "As the words say: or = either, and = both. In tests `or_` fired when the first one finished and never again."
   }
  },
  {
   "q": {
    "zh": "在 FastAPI 里，全局只创建一个 `flow = MarketingFlow()`，所有请求都调用它的 `kickoff_async`。会有什么问题？",
    "en": "In FastAPI, one global `flow = MarketingFlow()` serves every request via `kickoff_async`. What's wrong?"
   },
   "options": [
    {
     "zh": "没有问题，而且更快",
     "en": "Nothing – it's even faster"
    },
    {
     "zh": "所有请求共用同一份 `self.state`，同时到来的请求会互相覆盖数据",
     "en": "Every request shares one `self.state`, so simultaneous requests overwrite each other's data"
    },
    {
     "zh": "FastAPI 不允许全局变量",
     "en": "FastAPI forbids global variables"
    },
    {
     "zh": "第二个请求会直接报错",
     "en": "The second request always errors"
    }
   ],
   "answer": 1,
   "explain": {
    "zh": "state 属于对象。每个请求新建一个 Flow 对象，才能各用各的 state。",
    "en": "The state belongs to the object. A new Flow object per request gives each request its own state."
   }
  }
 ],
 "fill": [
  {
   "title": {
    "zh": "写诗的 Flow",
    "en": "The poem Flow"
   },
   "code": {
    "zh": "class PoemState([[BaseModel]]):\n    topic: str = \"学 Agent 开发\"\n    sentence_count: int = 1\n    poem: str = \"\"\n\nclass PoemFlow([[Flow]][PoemState]):\n    @[[start]]()\n    def generate_sentence_count(self):\n        self.[[state]].sentence_count = random.randint(1, 5)\n\n    @[[listen]]([[generate_sentence_count]])\n    def generate_poem(self):\n        result = build_poem_crew().kickoff(inputs={\"topic\": self.state.topic, \"sentence_count\": self.state.sentence_count})\n        self.state.poem = result.[[raw]]\n        return self.state.poem\n\nflow = PoemFlow()\nprint(flow.[[kickoff]](inputs={\"topic\": \"学 Agent 开发\"}))",
    "en": "class PoemState([[BaseModel]]):\n    topic: str = \"learning to build agents\"\n    sentence_count: int = 1\n    poem: str = \"\"\n\nclass PoemFlow([[Flow]][PoemState]):\n    @[[start]]()\n    def generate_sentence_count(self):\n        self.[[state]].sentence_count = random.randint(1, 5)\n\n    @[[listen]]([[generate_sentence_count]])\n    def generate_poem(self):\n        result = build_poem_crew().kickoff(inputs={\"topic\": self.state.topic, \"sentence_count\": self.state.sentence_count})\n        self.state.poem = result.[[raw]]\n        return self.state.poem\n\nflow = PoemFlow()\nprint(flow.[[kickoff]](inputs={\"topic\": \"learning to build agents\"}))"
   },
   "explain": {
    "zh": "状态类继承 `BaseModel`；Flow 类写成 `Flow[状态类]`；`@start()` 是第一步，`@listen(方法)` 接在它后面；`kickoff(inputs=...)` 启动。",
    "en": "The state class inherits `BaseModel`; the flow is `Flow[StateClass]`; `@start()` is the first step and `@listen(method)` follows it; `kickoff(inputs=...)` starts it."
   }
  },
  {
   "title": {
    "zh": "路由循环和 and_ 汇合",
    "en": "A router loop and an and_ join"
   },
   "code": "class ReviewFlow(Flow[CopyState]):\n    @start(\"[[retry]]\")\n    def write(self):\n        self.state.tries += 1\n        self.state.draft = llm.call(\"...\").strip()\n\n    @[[router]](write)\n    def review(self):\n        if len(self.state.draft) <= self.state.max_chars:\n            return \"[[ok]]\"\n        if self.state.tries >= 3:\n            return \"give_up\"\n        return \"retry\"\n\n    @listen(\"[[ok]]\")\n    def publish(self):\n        return self.state.draft\n\nclass PromoFlow(Flow[PromoState]):\n    @start()\n    def check_stock(self): ...\n\n    @start()\n    def check_weather(self): ...\n\n    @listen([[and_]](check_stock, check_weather))\n    def plan_promo(self): ...",
   "explain": {
    "zh": "`@start(\"retry\")` 让第一步在收到 `\"retry\"` 时再运行；路由返回的标签被 `@listen(\"ok\")` 接住；`and_` 等两个 `@start` 都完成。",
    "en": "`@start(\"retry\")` reruns the first step on `\"retry\"`; the router's label is caught by `@listen(\"ok\")`; `and_` waits for both `@start` steps."
   }
  }
 ],
 "write": [
  {
   "title": {
    "zh": "手写：写诗的 Flow",
    "en": "Write it: the poem Flow"
   },
   "task": {
    "zh": "写诗的 Crew 已经写好（`build_poem_crew`）。不看上面的代码，写出：\n1. 状态类 `PoemState`：`topic`、`sentence_count`、`poem` 三个字段，都有默认值\n2. `PoemFlow(Flow[PoemState])`，三个步骤：`generate_sentence_count`（第一步，随机 1–5 存进 `sentence_count`）→ `generate_poem`（运行 Crew，把 `result.raw` 存进 `poem`）→ `save_poem`（写文件并返回 `poem`）\n3. 用 `kickoff(inputs=...)` 启动并打印返回值\n\n在本地用 `.venv-crewai` 运行（浏览器里不能运行 CrewAI），`practice/l58_flow_todo.py` 已经准备好了。",
    "en": "The poem crew is ready (`build_poem_crew`). Without looking above, write:\n1. a state class `PoemState` with three fields, `topic`, `sentence_count` and `poem`, all with defaults\n2. `PoemFlow(Flow[PoemState])` with three steps: `generate_sentence_count` (first; a random 1–5 into `sentence_count`) → `generate_poem` (run the crew, store `result.raw` in `poem`) → `save_poem` (write a file and return `poem`)\n3. start it with `kickoff(inputs=...)` and print the result\n\nRun it locally with `.venv-crewai` (CrewAI can't run in the browser); `practice/l58_flow_todo.py` is ready for this."
   },
   "starter": {
    "zh": "import os\nimport random\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai.flow import Flow, listen, start\nfrom pydantic import BaseModel\nfrom l58_flow_solution import build_poem_crew      # 写诗的小 Crew，已经写好\n\n# 1. 状态类：topic（默认 \"学 Agent 开发\"）、sentence_count（默认 1）、poem（默认 \"\"）\n\n\n# 2. Flow 类，三个步骤：\n#    generate_sentence_count —— 第一步：随机取 1 到 5，存进状态的 sentence_count\n#    generate_poem           —— 上一步完成后：用 topic 和 sentence_count 运行 Crew，把结果文字存进 poem\n#    save_poem               —— generate_poem 完成后：写进 l58_poem.txt，并返回 poem\n\n\n# 3. 创建 Flow，带上 topic 启动它，打印返回值\n",
    "en": "import os\nimport random\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai.flow import Flow, listen, start\nfrom pydantic import BaseModel\nfrom l58_flow_solution import build_poem_crew      # the poem crew, ready to use\n\n# 1. a state class: topic (default \"learning to build agents\"), sentence_count (default 1), poem (default \"\")\n\n\n# 2. a Flow class with three steps:\n#    generate_sentence_count - first step: a random number from 1 to 5, stored in the state's sentence_count\n#    generate_poem           - after the previous step: run the crew with topic and sentence_count, store the text in poem\n#    save_poem               - after generate_poem: write l58_poem.txt and return poem\n\n\n# 3. create the flow, start it with a topic and print what it returns\n"
   },
   "solution": {
    "zh": "import os\nimport random\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai.flow import Flow, listen, start\nfrom pydantic import BaseModel\nfrom l58_flow_solution import build_poem_crew      # 写诗的小 Crew，已经写好\n\n# 1. 状态类\nclass PoemState(BaseModel):\n    topic: str = \"学 Agent 开发\"\n    sentence_count: int = 1\n    poem: str = \"\"\n\n# 2. Flow 类\nclass PoemFlow(Flow[PoemState]):\n\n    @start()\n    def generate_sentence_count(self):\n        self.state.sentence_count = random.randint(1, 5)\n\n    @listen(generate_sentence_count)\n    def generate_poem(self):\n        result = build_poem_crew().kickoff(inputs={\n            \"topic\": self.state.topic,\n            \"sentence_count\": self.state.sentence_count,\n        })\n        self.state.poem = result.raw\n\n    @listen(generate_poem)\n    def save_poem(self):\n        with open(\"l58_poem.txt\", \"w\", encoding=\"utf-8\") as f:\n            f.write(self.state.poem)\n        return self.state.poem\n\n# 3. 启动并打印\nflow = PoemFlow()\nprint(flow.kickoff(inputs={\"topic\": \"学 Agent 开发\"}))",
    "en": "import os\nimport random\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai.flow import Flow, listen, start\nfrom pydantic import BaseModel\nfrom l58_flow_solution import build_poem_crew      # the poem crew, ready to use\n\n# 1. the state class\nclass PoemState(BaseModel):\n    topic: str = \"learning to build agents\"\n    sentence_count: int = 1\n    poem: str = \"\"\n\n# 2. the Flow class\nclass PoemFlow(Flow[PoemState]):\n\n    @start()\n    def generate_sentence_count(self):\n        self.state.sentence_count = random.randint(1, 5)\n\n    @listen(generate_sentence_count)\n    def generate_poem(self):\n        result = build_poem_crew().kickoff(inputs={\n            \"topic\": self.state.topic,\n            \"sentence_count\": self.state.sentence_count,\n        })\n        self.state.poem = result.raw\n\n    @listen(generate_poem)\n    def save_poem(self):\n        with open(\"l58_poem.txt\", \"w\", encoding=\"utf-8\") as f:\n            f.write(self.state.poem)\n        return self.state.poem\n\n# 3. start it and print\nflow = PoemFlow()\nprint(flow.kickoff(inputs={\"topic\": \"learning to build agents\"}))"
   },
   "checks": [
    {
     "zh": "状态类继承 `BaseModel`",
     "en": "The state class inherits `BaseModel`",
     "re": "class\\s+\\w+\\(\\s*BaseModel\\s*\\)\\s*:"
    },
    {
     "zh": "Flow 类写成 `Flow[状态类]`",
     "en": "The flow class is `Flow[StateClass]`",
     "re": "class\\s+\\w+\\(\\s*Flow\\[\\s*\\w+\\s*\\]\\s*\\)\\s*:"
    },
    {
     "zh": "第一步用 `@start()`（别忘了括号）",
     "en": "The first step uses `@start()` (parentheses!)",
     "re": "@start\\(\\s*\\)"
    },
    {
     "zh": "用 `@listen(generate_sentence_count)` 接在第一步后面",
     "en": "`@listen(generate_sentence_count)` follows the first step",
     "re": "@listen\\(\\s*generate_sentence_count\\s*\\)"
    },
    {
     "zh": "随机句数 `random.randint(1, 5)`",
     "en": "A random count with `random.randint(1, 5)`",
     "re": "random\\.randint\\(\\s*1\\s*,\\s*5\\s*\\)"
    },
    {
     "zh": "用 `self.state.xxx = ...` 写入状态",
     "en": "Writes the state with `self.state.xxx = ...`",
     "re": "self\\.state\\.\\w+\\s*="
    },
    {
     "zh": "用 `kickoff(inputs=...)` 启动",
     "en": "Starts with `kickoff(inputs=...)`",
     "re": "\\.kickoff\\(\\s*inputs\\s*="
    }
   ]
  },
  {
   "title": {
    "zh": "手写（补充）：路由 + 重试循环",
    "en": "Write it (extra): a router + retry loop"
   },
   "task": {
    "zh": "`write` 步骤已经写好（`@start(\"retry\")`）。补上：\n1. 路由 `review`：`write` 完成后运行；字数合格返回 `\"ok\"`，不合格且已经试满 3 次返回 `\"give_up\"`，否则返回 `\"retry\"`\n2. `publish`：收到 `\"ok\"` 时运行\n3. `stop_trying`：收到 `\"give_up\"` 时运行（方法名不能叫 `give_up`）\n\n本地练习文件：`practice/l58_router_todo.py`。",
    "en": "The `write` step is ready (`@start(\"retry\")`). Add:\n1. a router `review` that runs after `write`: return `\"ok\"` if the length is fine, `\"give_up\"` if not and 3 tries are used up, otherwise `\"retry\"`\n2. `publish`, which runs on `\"ok\"`\n3. `stop_trying`, which runs on `\"give_up\"` (it must not be named `give_up`)\n\nLocal practice file: `practice/l58_router_todo.py`."
   },
   "starter": {
    "zh": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai.flow import Flow, listen, router, start\nfrom pydantic import BaseModel\nfrom l55_deepseek_llm import llm\n\n\nclass CopyState(BaseModel):\n    product: str = \"桂花冷萃\"\n    max_chars: int = 12\n    draft: str = \"\"\n    tries: int = 0\n\n\nclass ReviewFlow(Flow[CopyState]):\n\n    @start(\"retry\")\n    def write(self):\n        self.state.tries += 1\n        prompt = f\"为{self.state.product}写一句广告语，不超过{self.state.max_chars}个字，只输出广告语本身。\"\n        self.state.draft = llm.call(prompt).strip()\n\n    # 1. review：write 完成后运行的路由。字数合格返回 \"ok\"；\n    #    不合格且已经试满 3 次返回 \"give_up\"；否则返回 \"retry\"\n\n    # 2. publish：收到 \"ok\" 时运行，返回 \"通过：\" + 广告语\n\n    # 3. stop_trying：收到 \"give_up\" 时运行，返回一句放弃的说明\n\n\nprint(ReviewFlow().kickoff(inputs={\"product\": \"桂花冷萃\", \"max_chars\": 12}))",
    "en": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai.flow import Flow, listen, router, start\nfrom pydantic import BaseModel\nfrom l55_deepseek_llm import llm\n\n\nclass CopyState(BaseModel):\n    product: str = \"osmanthus cold brew\"\n    max_chars: int = 12\n    draft: str = \"\"\n    tries: int = 0\n\n\nclass ReviewFlow(Flow[CopyState]):\n\n    @start(\"retry\")\n    def write(self):\n        self.state.tries += 1\n        prompt = f\"Write one slogan for {self.state.product}, at most {self.state.max_chars} characters. Output only the slogan.\"\n        self.state.draft = llm.call(prompt).strip()\n\n    # 1. review: the router that runs after write. It gives \"ok\" if the length is fine,\n    #    \"give_up\" if not and 3 tries are used up, and \"retry\" otherwise\n\n    # 2. publish: runs on \"ok\" and returns \"passed: \" + the slogan\n\n    # 3. stop_trying: runs on \"give_up\" and returns a short note that it gave up\n\n\nprint(ReviewFlow().kickoff(inputs={\"product\": \"osmanthus cold brew\", \"max_chars\": 12}))"
   },
   "solution": {
    "zh": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai.flow import Flow, listen, router, start\nfrom pydantic import BaseModel\nfrom l55_deepseek_llm import llm\n\n\nclass CopyState(BaseModel):\n    product: str = \"桂花冷萃\"\n    max_chars: int = 12\n    draft: str = \"\"\n    tries: int = 0\n\n\nclass ReviewFlow(Flow[CopyState]):\n\n    @start(\"retry\")\n    def write(self):\n        self.state.tries += 1\n        prompt = f\"为{self.state.product}写一句广告语，不超过{self.state.max_chars}个字，只输出广告语本身。\"\n        self.state.draft = llm.call(prompt).strip()\n\n    @router(write)\n    def review(self):\n        if len(self.state.draft) <= self.state.max_chars:\n            return \"ok\"\n        if self.state.tries >= 3:\n            return \"give_up\"\n        return \"retry\"\n\n    @listen(\"ok\")\n    def publish(self):\n        return \"通过：\" + self.state.draft\n\n    @listen(\"give_up\")\n    def stop_trying(self):\n        return f\"试了 {self.state.tries} 次还是太长：{self.state.draft}\"\n\n\nprint(ReviewFlow().kickoff(inputs={\"product\": \"桂花冷萃\", \"max_chars\": 12}))",
    "en": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai.flow import Flow, listen, router, start\nfrom pydantic import BaseModel\nfrom l55_deepseek_llm import llm\n\n\nclass CopyState(BaseModel):\n    product: str = \"osmanthus cold brew\"\n    max_chars: int = 12\n    draft: str = \"\"\n    tries: int = 0\n\n\nclass ReviewFlow(Flow[CopyState]):\n\n    @start(\"retry\")\n    def write(self):\n        self.state.tries += 1\n        prompt = f\"Write one slogan for {self.state.product}, at most {self.state.max_chars} characters. Output only the slogan.\"\n        self.state.draft = llm.call(prompt).strip()\n\n    @router(write)\n    def review(self):\n        if len(self.state.draft) <= self.state.max_chars:\n            return \"ok\"\n        if self.state.tries >= 3:\n            return \"give_up\"\n        return \"retry\"\n\n    @listen(\"ok\")\n    def publish(self):\n        return \"passed: \" + self.state.draft\n\n    @listen(\"give_up\")\n    def stop_trying(self):\n        return f\"still too long after {self.state.tries} tries: {self.state.draft}\"\n\n\nprint(ReviewFlow().kickoff(inputs={\"product\": \"osmanthus cold brew\", \"max_chars\": 12}))"
   },
   "checks": [
    {
     "zh": "用 `@router(write)` 标记路由",
     "en": "Marks the router with `@router(write)`",
     "re": "@router\\(\\s*write\\s*\\)"
    },
    {
     "zh": "合格时返回 `\"ok\"`",
     "en": "Returns `\"ok\"` when it passes",
     "re": "return\\s+[\"']ok[\"']"
    },
    {
     "zh": "不合格时返回 `\"retry\"`",
     "en": "Returns `\"retry\"` when it fails",
     "re": "return\\s+[\"']retry[\"']"
    },
    {
     "zh": "试满 3 次返回 `\"give_up\"`",
     "en": "Returns `\"give_up\"` after 3 tries",
     "re": "tries\\s*>=\\s*3[\\s\\S]*?return\\s+[\"']give_up[\"']"
    },
    {
     "zh": "用 `@listen(\"ok\")` 接住合格的结果",
     "en": "Catches the pass with `@listen(\"ok\")`",
     "re": "@listen\\(\\s*[\"']ok[\"']\\s*\\)"
    },
    {
     "zh": "用 `@listen(\"give_up\")` 接住放弃，方法名不叫 give_up",
     "en": "Catches the give-up with `@listen(\"give_up\")` on a method not named give_up",
     "re": "@listen\\(\\s*[\"']give_up[\"']\\s*\\)\\s*\\n\\s*def\\s+(?!give_up\\b)\\w+"
    }
   ]
  }
 ],
 "pitfalls": [
  {
   "zh": "`@start` 忘了写括号：不报错，但这一步不会运行，`kickoff()` 返回 `None`。",
   "en": "`@start` without parentheses: no error, the step never runs and `kickoff()` returns `None`."
  },
  {
   "zh": "state 的字段没写默认值：创建 Flow 时就报 `ValidationError`。",
   "en": "A state field without a default: creating the Flow raises `ValidationError`."
  },
  {
   "zh": "`@listen(方法())` 多写了括号：定义类时就报 `TypeError`，要写方法本身。",
   "en": "`@listen(method())` with extra parentheses: defining the class fails with `TypeError` – pass the method itself."
  },
  {
   "zh": "`inputs` 的键名和 state 字段名不一致：不报错，state 保持默认值。",
   "en": "An `inputs` key that doesn't match a state field: no error, the state keeps its default."
  },
  {
   "zh": "照视频进到模板文件夹直接运行 `main.py`：视频里 0.74 的模板会报相对导入错误（老师的办法是去掉那个点）；1.15.23 的模板要在项目根目录用 `crewai run` 运行。",
   "en": "Going into the template folder and running `main.py` directly, as the video does: the video's 0.74 template fails with a relative-import error (the instructor's fix is to remove the dot); the 1.15.23 template has to be run with `crewai run` from the project root."
  },
  {
   "zh": "监听标签的方法和标签同名（`@listen(\"give_up\")` + `def give_up`）：创建 Flow 时报 `ValidationError`。",
   "en": "A listener named like its label (`@listen(\"give_up\")` + `def give_up`): creating the Flow raises `ValidationError`."
  },
  {
   "zh": "路由返回的标签和监听的字符串大小写不一致：不报错，后面的步骤都不运行。",
   "en": "A label whose case differs from the listener's string: no error, and nothing after it runs."
  },
  {
   "zh": "重试循环没有计数器：要反复调用 100 次左右才报 `RecursionError`，模型调用的钱已经花出去了。",
   "en": "A retry loop without a counter: it only raises `RecursionError` after about 100 repeated calls, and by then the money for those model calls is already spent."
  },
  {
   "zh": "FastAPI 里所有请求共用一个 Flow 对象：state 会串。每个请求新建一个。",
   "en": "One Flow object shared by every FastAPI request mixes up the state – create one per request."
  },
  {
   "zh": "`plot()` 的文件在临时文件夹里，用它返回的路径去找；`@persist()` 不写路径时，没设 `CREWAI_STORAGE_DIR` 的话数据库会放到 C 盘的 AppData 里。",
   "en": "`plot()` writes its file to a temp folder – find it with the path it returns; with `@persist()` and no path, the database goes into AppData on drive C unless `CREWAI_STORAGE_DIR` is set."
  }
 ],
 "recap": [
  {
   "zh": "Flow = 用代码写出的工作流，四个特点：串联 Crew 和普通方法、状态管理、事件驱动、灵活的控制流；Crew 适合让 Agent 自主协作，两者常组合使用。",
   "en": "A Flow is a workflow in code with four traits: chaining crews and plain methods, state management, event-driven execution and flexible control flow; a Crew lets agents collaborate, and they combine well."
  },
  {
   "zh": "结构：`class 状态(BaseModel)` + `class 我的Flow(Flow[状态])`，步骤之间用 `self.state` 传数据；不写方括号就是非结构化的字典状态。",
   "en": "Shape: `class State(BaseModel)` + `class MyFlow(Flow[State])`, with steps sharing data via `self.state`; without the brackets the state is an unstructured dict."
  },
  {
   "zh": "`@start()` 是起点（可以有多个、并行运行），`@listen(方法或标签)` 在它完成后运行。",
   "en": "`@start()` marks starting points (several run in parallel); `@listen(method_or_label)` runs after it."
  },
  {
   "zh": "`kickoff(inputs=...)` 先把 inputs 填进 state 再运行，返回最后完成的方法的返回值；异步版是 `kickoff_async`，FastAPI 里每个请求新建一个 Flow。",
   "en": "`kickoff(inputs=...)` fills the state first, then returns the return value of the last method to finish; the async version is `kickoff_async`, and in FastAPI you create a new Flow for each request."
  },
  {
   "zh": "视频的两个例子：写诗 Flow（随机句数 → Crew 写诗 → 存文件）和营销 Flow（分析 Crew → 文案 Crew → `{title, body}`）；`plot()` 画出流程图。",
   "en": "The video's two examples: the poem Flow (random line count → crew writes the poem → save) and the marketing Flow (analysis crew → copy crew → `{title, body}`); `plot()` draws the chart."
  },
  {
   "zh": "补充：`@router` 返回字符串标签做分支，`@start(\"retry\")` + 计数器做重试循环；`and_(a, b)` 等全部完成，`or_(a, b)` 任意一个完成就运行一次。",
   "en": "Extra: `@router` returns string labels to branch, `@start(\"retry\")` plus a counter makes a retry loop; `and_(a, b)` waits for all, `or_(a, b)` fires once on the first."
  }
 ],
 "files": [
  {
   "path": "practice/l58_flow_todo.py",
   "zh": "练习：补全视频里的写诗 Flow（状态类 + 三个步骤 + kickoff）。",
   "en": "Exercise: complete the video's poem Flow (state class + three steps + kickoff)."
  },
  {
   "path": "practice/l58_flow_solution.py",
   "zh": "参考答案：随机句数 → Crew 写诗 → 保存 `l58_poem.txt`，并生成流程图。",
   "en": "Solution: random line count → the crew writes the poem → save `l58_poem.txt`, plus the flow chart."
  },
  {
   "path": "practice/l58_marketing_flow.py",
   "zh": "视频里的营销 Flow：市场分析 Crew → 文案 Crew，数据通过 state 传递，返回 `{title, body}`（已用 DeepSeek 实测）。",
   "en": "The video's marketing Flow: analysis crew → copy crew, data passed through the state, returns `{title, body}` (tested with DeepSeek)."
  },
  {
   "path": "practice/l58_flow_api.py",
   "zh": "FastAPI 服务（端口 8012）：每个请求新建一个 Flow 并 `await kickoff_async`；客户端用 `l57_api_client.py`。",
   "en": "FastAPI server (port 8012): a new Flow per request with `await kickoff_async`; use `l57_api_client.py` as the client."
  },
  {
   "path": "practice/l58_router_todo.py",
   "zh": "补充练习：补全路由和两个结局，做出「不合格就重写」的循环。",
   "en": "Extra exercise: add the router and both endings for a “rewrite until it passes” loop."
  },
  {
   "path": "practice/l58_router_solution.py",
   "zh": "补充参考答案：`@start(\"retry\")` + `@router` 的重试循环，步骤里直接调用模型（已用 DeepSeek 实测）。",
   "en": "Extra solution: a retry loop with `@start(\"retry\")` + `@router`, calling the model directly in a step (tested with DeepSeek)."
  },
  {
   "path": "practice/l58_join_demo.py",
   "zh": "补充演示：两个 `@start` 并行、`or_` / `and_` 汇合、路由分支，不调用模型。",
   "en": "Extra demo: two parallel `@start` steps, `or_` / `and_` joins and a router branch, no model calls."
  },
  {
   "path": "practice/l58_persist_demo.py",
   "zh": "补充演示：`@persist` 把 state 存进 `practice/data/l58_flow_states.db`，用同一个 id 接着运行，不调用模型。",
   "en": "Extra demo: `@persist` saves the state to `practice/data/l58_flow_states.db` and resumes it by id, no model calls."
  }
 ]
});
