COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
 "id": "l55",
 "priority": "core",
 "handwrite": true,
 "studyMinutes": 40,
 "source": "subtitle",
 "summary": {
  "zh": "视频在 CrewAI 官方的一个营销案例上做了改编：首席市场分析师、首席营销战略师、首席创意内容创作者三个 Agent 按顺序完成 5 个任务，前两个 Agent 配了读网页和谷歌搜索两个工具。重点在最后一步：用 Pydantic 定义只有 `title`、`body` 两个字段的 `Copy` 模型，交给最后一个任务的 `output_json`，整个小组的结果就按这个 JSON 格式交出；再包成 FastAPI 服务，JSON 请求进、JSON 结果出。本课用 DeepSeek 复现，并解决 DeepSeek 不支持 `json_schema` 的问题。",
  "en": "The video adapts one of CrewAI's official marketing examples: three agents – a lead market analyst, a chief marketing strategist and a chief creative content creator – complete 5 tasks in order, and the first two agents get two tools, one that reads web pages and one for Google search. The key part is the last step: a Pydantic `Copy` model with only two fields, `title` and `body`, is passed to the last task's `output_json`, so the whole team's result comes out in that JSON format; the crew is then wrapped in a FastAPI service – JSON request in, JSON result out. This lesson reproduces it with DeepSeek and solves the problem that DeepSeek doesn't support `json_schema`."
 },
 "goals": [
  {
   "zh": "说出视频里 3 个 Agent、5 个任务的分工，以及为什么只有前两个 Agent 配了工具",
   "en": "Describe how the video splits the work among 3 agents and 5 tasks, and why only the first two agents get tools"
  },
  {
   "zh": "用 Pydantic 写出 `Copy` 模型，交给最后一个任务的 `output_json`，让结果以 JSON 格式输出",
   "en": "Write the `Copy` model with Pydantic and pass it to the last task's `output_json` so the result comes out as JSON"
  },
  {
   "zh": "从 `result.json_dict`、`result[\"title\"]`、`result.tasks_output[i]` 读取结果，分清 `output_json` 和 `output_pydantic`",
   "en": "Read results from `result.json_dict`, `result[\"title\"]` and `result.tasks_output[i]`, and tell `output_json` from `output_pydantic`"
  },
  {
   "zh": "知道 `ScrapeWebsiteTool` 不需要 key，`SerperDevTool` 需要环境变量 `SERPER_API_KEY`",
   "en": "Know that `ScrapeWebsiteTool` needs no key while `SerperDevTool` needs the environment variable `SERPER_API_KEY`"
  },
  {
   "zh": "看懂视频的服务改动：请求格式和返回格式分开定义，`req.model_dump()` 直接当 `inputs`",
   "en": "Understand the video's changes to the service: separate request and response formats, with `req.model_dump()` passed straight in as `inputs`"
  },
  {
   "zh": "知道 DeepSeek 不接受 `json_schema`，会用 `l55_deepseek_llm` 里的 `llm` 解决",
   "en": "Know that DeepSeek doesn't accept `json_schema`, and fix it with the `llm` from `l55_deepseek_llm`"
  }
 ],
 "blocks": [
  {
   "t": "h",
   "zh": "一、这一集做什么：营销策划小组，最后交出 JSON",
   "en": "1. This episode: a marketing team that hands in JSON at the end"
  },
  {
   "t": "video",
   "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=0) 老师说明这个案例改编自 CrewAI 官方的一个示例，这一集要学的是**让任务按自己定义的格式输出数据**，比如自定义一个 JSON 格式，最终结果就按它交出。\n\n[▶ 00:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=30) 案例是一个「营销战略策划」小组：客户给出官网地址和项目说明，小组先分析产品和竞争对手，再定战略、想活动，最后写出营销文案。\n\n视频的顺序是：介绍 Agent 和任务 → 前期准备、选模型 → [▶ 06:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=368) 启动服务、发请求、看 JSON 结果和运行日志 → [▶ 10:56](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=656) 最后讲源码。本课按「YAML → 工具 → JSON 输出 → 服务」的顺序讲，方便你边学边写；每一节开头都标了对应的视频时间。",
   "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=0) The instructor explains that this case is adapted from an official CrewAI example, and that this episode is about **making a task output data in a format you define yourself** – for example a custom JSON format that the final result must follow.\n\n[▶ 00:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=30) The case is a “marketing strategy” team: the client gives its website address and a project description, and the team first analyses the product and its competitors, then sets a strategy, comes up with campaigns and finally writes the marketing copy.\n\nThe video's order is: introduce the agents and tasks → preparation and choosing a model → [▶ 06:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=368) start the service, send a request, look at the JSON result and the run log → [▶ 10:56](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=656) and finally the source code. This lesson goes “YAML → tools → JSON output → service” instead, so you can write code as you learn; each part starts with the matching video time."
  },
  {
   "t": "p",
   "zh": "三个 Agent 的分工（三人的背景故事都是「在一家一流的数字营销公司任职」，只是职位和专长不同）：\n\n| Agent（YAML 里的名字） | 负责什么 | 工具 |\n|---|---|---|\n| 首席市场分析师 `lead_market_analyst` | 研究客户的产品和竞争对手，给后面定战略提供依据 | 读网页、谷歌搜索 |\n| 首席营销战略师 `chief_marketing_strategist` | 根据市场分析，制定让人眼前一亮的营销战略 | 读网页、谷歌搜索 |\n| 首席创意内容创作者 `creative_content_creator` | 把营销战略变成社交媒体上有冲击力的广告文案 | 不需要 |",
   "en": "How the three agents split the work (all three backstories say they “work at a top digital marketing agency”; only the job titles and specialities differ):\n\n| Agent (name in the YAML) | Job | Tools |\n|---|---|---|\n| Lead market analyst `lead_market_analyst` | Researches the client's product and competitors, giving the later strategy something to build on | Read web pages, Google search |\n| Chief marketing strategist `chief_marketing_strategist` | Builds an eye-catching marketing strategy from the market analysis | Read web pages, Google search |\n| Chief creative content creator `creative_content_creator` | Turns the marketing strategy into punchy ad copy for social media | None needed |"
  },
  {
   "t": "p",
   "zh": "[▶ 01:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=91) 五个任务按顺序执行：\n1. `research_task`（分析师）：根据客户的网址 `{customer_domain}` 调研它的产品和竞争对手，找出有价值的信息，视频里限定只看 2024 年的信息；任务说明里还带上项目描述 `{project_description}`。要交出一份完整报告：关键数据、用户偏好、市场定位、受众参与度等。\n2. `project_understanding_task`（战略师）：弄清项目细节和目标受众，查看已有材料，不够就再去搜集——这一步会用到搜索工具。\n3. `marketing_strategy_task`（战略师）：制定一份全面的营销战略。\n4. `campaign_idea_task`（创作者）：构思 5 个新颖、吸引人、和整体战略一致的营销活动，每个附一句说明和预期效果。\n5. `copy_creation_task`（创作者）：根据活动设想写营销文案，要清晰、吸引人、贴合受众。**它就是要以 JSON 格式输出的那个「最终任务」。**",
   "en": "[▶ 01:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=91) The five tasks run in order:\n1. `research_task` (analyst): researches the client's products and competitors from its web address `{customer_domain}` and digs out useful information – the video limits it to information from 2024; the task text also includes the project description `{project_description}`. It must deliver a complete report: key figures, user preferences, market positioning, audience engagement and so on.\n2. `project_understanding_task` (strategist): works out the project details and the target audience, reviews the existing material and gathers more if it isn't enough – this step uses the search tool.\n3. `marketing_strategy_task` (strategist): draws up a comprehensive marketing strategy.\n4. `campaign_idea_task` (creator): comes up with 5 fresh, engaging campaigns in line with the overall strategy, each with a one-sentence description and its expected effect.\n5. `copy_creation_task` (creator): writes marketing copy from the campaign ideas – clear, engaging and right for the audience. **This is the “final task” whose output must be JSON.**"
  },
  {
   "t": "h",
   "zh": "二、Agent 和任务写在 YAML 里",
   "en": "2. Agents and tasks live in YAML"
  },
  {
   "t": "p",
   "zh": "[▶ 03:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=183) 项目结构和系列前几集（51 节起）一样：`config` 文件夹里的 `agents.yaml`、`tasks.yaml` 放文字，`crew.py` 用 `@CrewBase` 组装，`main.py` 是 FastAPI 服务，`apiTest.py` 发请求。[▶ 10:56](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=656) 老师讲源码时也是先看这两个 YAML：`agents.yaml` 定义 Agent，`tasks.yaml` 定义任务、并写明每个任务交给哪个 Agent。本课的两个 YAML 放在 `practice/data/` 下，按视频的意思用中文重新写过：",
   "en": "[▶ 03:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=183) The project layout is the same as in the earlier episodes of the series (from lesson 51 on): `agents.yaml` and `tasks.yaml` in the `config` folder hold the texts, `crew.py` assembles them with `@CrewBase`, `main.py` is the FastAPI service and `apiTest.py` sends the requests. [▶ 10:56](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=656) When the instructor walks through the source, he also starts with these two YAML files: `agents.yaml` defines the agents, and `tasks.yaml` defines the tasks and says which agent each one goes to. This lesson keeps its two YAML files in `practice/data/`, rewritten in Chinese along the lines of the video (shown in English here):"
  },
  {
   "t": "code",
   "file": "practice/data/l55_agents.yaml",
   "lang": "yaml",
   "code": {
    "zh": "lead_market_analyst:\n  role: >\n    首席市场分析师\n  goal: >\n    把客户的产品和主要竞争对手研究透，找出能指导营销战略的关键信息\n  backstory: >\n    你任职于一家一流的数字营销公司，担任首席市场分析师，擅长从客户的产品和竞争对手身上看出关键信息。\n\nchief_marketing_strategist:\n  role: >\n    首席营销战略师\n  goal: >\n    基于产品的市场分析，制定出让人眼前一亮的营销战略\n  backstory: >\n    你任职于一家一流的数字营销公司，担任首席营销战略师，最擅长为客户量身定做行之有效的营销战略。\n\ncreative_content_creator:\n  role: >\n    首席创意内容创作者\n  goal: >\n    按照营销战略，为社交媒体活动想出新颖、抓人的内容，尤其是让人过目不忘的广告文案\n  backstory: >\n    你任职于一家一流的数字营销公司，担任首席创意内容创作者。你最拿手的是把干巴巴的营销战略写成打动人的故事和画面，让人看了就想行动。",
    "en": "lead_market_analyst:\n  role: >\n    Lead Market Analyst\n  goal: >\n    Research the client's product and main competitors thoroughly and find the key insights that can guide the marketing strategy\n  backstory: >\n    You work at a top digital marketing agency as its lead market analyst, and you are good at spotting the key insights in a client's product and its competitors.\n\nchief_marketing_strategist:\n  role: >\n    Chief Marketing Strategist\n  goal: >\n    Build an eye-catching marketing strategy based on the market analysis of the product\n  backstory: >\n    You work at a top digital marketing agency as its chief marketing strategist, and you are best at tailoring effective marketing strategies to each client.\n\ncreative_content_creator:\n  role: >\n    Chief Creative Content Creator\n  goal: >\n    Following the marketing strategy, come up with fresh, catchy content for social media campaigns, above all ad copy people won't forget\n  backstory: >\n    You work at a top digital marketing agency as its chief creative content creator. Your speciality is turning dry marketing strategies into stories and images that move people and make them want to act."
   }
  },
  {
   "t": "code",
   "file": "practice/data/l55_tasks.yaml",
   "lang": "yaml",
   "code": {
    "zh": "research_task:\n  description: >\n    围绕客户 {customer_domain} 做一次深入调研，分析它的产品和主要竞争对手，尽量找出有价值的相关信息（以最近一两年的情况为准）。\n    我们正在和这家客户合作的项目是：{project_description}\n  expected_output: >\n    一份关于客户产品和竞争对手的完整报告，包括关键数据、用户偏好、市场定位和受众参与度。用中文，不超过 400 字。\n  agent: lead_market_analyst\n\nproject_understanding_task:\n  description: >\n    弄清项目「{project_description}」的细节和目标受众。阅读已有的资料，必要时补充更多信息。\n  expected_output: >\n    项目的详细摘要，以及目标受众画像。用中文，不超过 300 字。\n  agent: chief_marketing_strategist\n\nmarketing_strategy_task:\n  description: >\n    为客户 {customer_domain} 的项目「{project_description}」制定一份全面的营销战略，要用上前面调研和项目分析的结论。\n  expected_output: >\n    一个 JSON 对象，字段为 name（战略名称）、tactics（战术列表）、channels（渠道列表）、kpis（关键指标列表），列表里的每一项都用中文短句。只输出 JSON。\n  agent: chief_marketing_strategist\n\ncampaign_idea_task:\n  description: >\n    为项目「{project_description}」构思有创意的营销活动，要新颖、吸引人，并且和整体营销战略保持一致。\n  expected_output: >\n    5 个活动设想，每个设想附一句简要说明和预期效果。用中文。\n  agent: creative_content_creator\n\ncopy_creation_task:\n  description: >\n    根据前面的活动设想，为项目「{project_description}」写一条社交媒体营销文案，要有吸引力、清晰，并且贴合目标受众。\n  expected_output: >\n    一个 JSON 对象，只有两个字段：title（文案标题）和 body（文案正文，不超过 200 字）。只输出 JSON，不要任何解释。\n  agent: creative_content_creator",
    "en": "research_task:\n  description: >\n    Do an in-depth study of the client {customer_domain}: analyse its products and main competitors and find as much valuable, relevant information as you can (going by the last year or two).\n    The project we are working on with this client: {project_description}\n  expected_output: >\n    A complete report on the client's products and competitors, covering key figures, user preferences, market positioning and audience engagement. In Chinese, at most 400 characters.\n  agent: lead_market_analyst\n\nproject_understanding_task:\n  description: >\n    Work out the details and the target audience of the project “{project_description}”. Read the existing material and add more information where needed.\n  expected_output: >\n    A detailed summary of the project plus a profile of the target audience. In Chinese, at most 300 characters.\n  agent: chief_marketing_strategist\n\nmarketing_strategy_task:\n  description: >\n    Draw up a comprehensive marketing strategy for the project “{project_description}” of the client {customer_domain}, using the conclusions of the research and the project analysis so far.\n  expected_output: >\n    A JSON object with the fields name (strategy name), tactics (list of tactics), channels (list of channels) and kpis (list of key metrics); every list item is a short Chinese phrase. Output only JSON.\n  agent: chief_marketing_strategist\n\ncampaign_idea_task:\n  description: >\n    Come up with creative marketing campaigns for the project “{project_description}”: fresh, engaging and consistent with the overall marketing strategy.\n  expected_output: >\n    5 campaign ideas, each with a short one-sentence description and its expected effect. In Chinese.\n  agent: creative_content_creator\n\ncopy_creation_task:\n  description: >\n    Based on the campaign ideas above, write one social media marketing post for the project “{project_description}” – engaging, clear and right for the target audience.\n  expected_output: >\n    A JSON object with only two fields: title (the headline of the copy) and body (the text of the copy, at most 200 characters). Output only JSON, with no explanation.\n  agent: creative_content_creator"
   }
  },
  {
   "t": "tip",
   "zh": "和视频相比，本课的任务说明改了三处：\n- 视频把调研限定在 2024 年，这里写成「以最近一两年的情况为准」。\n- 第 3、5 个任务的 `expected_output` 写清了字段名并要求「只输出 JSON」。用 DeepSeek 时这一点很重要，第五部分会解释。\n- 每个任务都限制了字数。顺序执行时，后面的任务会带上前面所有任务的输出（54 节讲过），写短一点更快、也更省钱。",
   "en": "Compared with the video, this lesson changes the task texts in three places:\n- The video limits the research to 2024; here it says “going by the last year or two”.\n- The `expected_output` of tasks 3 and 5 spells out the field names and asks for “JSON only”. This matters a lot with DeepSeek, as part 5 explains.\n- Every task has a length limit. In a sequential run, each later task receives the outputs of all earlier tasks (see lesson 54), so shorter is faster and cheaper."
  },
  {
   "t": "h",
   "zh": "三、工具：读网页 + 谷歌搜索",
   "en": "3. Tools: reading web pages + Google search"
  },
  {
   "t": "video",
   "zh": "[▶ 08:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=533) 跑完以后，老师把日志从头翻了一遍：服务收到 apiTest 发来的请求后，分析师先用 CrewAI 自带的读网页工具，[▶ 09:24](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=564) 把客户官网（EMQX 官网）的内容抓了下来；[▶ 09:56](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=596) 然后它自己思考下一步，觉得信息不够，就调用搜索工具，日志里能看到一条条搜索结果；这样「思考 → 用工具 → 再思考」，直到给出 Final Answer，再轮到下一个 Agent。[▶ 10:26](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=626) 三个 Agent、五个任务就是这样一步步协作完成的。老师提醒：结果好不好，取决于任务里的提示词，也取决于模型的能力。",
   "en": "[▶ 08:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=533) After the run, the instructor goes through the log from the top: once the service receives the request from apiTest, the analyst first uses CrewAI's built-in web-reading tool [▶ 09:24](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=564) to fetch the content of the client's website (the EMQX site); [▶ 09:56](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=596) then it thinks about the next step on its own, decides it doesn't have enough information and calls the search tool – the log shows the search results one by one. It keeps going “think → use a tool → think again” until it gives its Final Answer, and then the next agent takes over. [▶ 10:26](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=626) That is how the three agents and five tasks work together step by step. The instructor points out that how good the result is depends on the prompts in the tasks and also on the model's ability."
  },
  {
   "t": "p",
   "zh": "[▶ 11:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=718) 两个工具都来自 `crewai_tools` 包（`.venv-crewai` 里已经装好）：\n\n| 工具 | 作用 | 需要 key 吗 |\n|---|---|---|\n| `ScrapeWebsiteTool` | 读取一个网址的网页文字 | 不需要 |\n| `SerperDevTool` | 通过 serper.dev 做谷歌搜索 | 需要环境变量 `SERPER_API_KEY` |\n\n[▶ 12:29](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=749) 只有前两个 Agent 配了这两个工具：创作者只负责写文案，用不着去搜索。本机验证过：没有 `SERPER_API_KEY` 时，`SerperDevTool()` 能创建，但一搜索就报 `KeyError: 'SERPER_API_KEY'`；`ScrapeWebsiteTool` 读 `https://www.emqx.com/zh` 拿到了约 5000 个字符的网页文字。",
   "en": "[▶ 11:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=718) Both tools come from the `crewai_tools` package (already installed in `.venv-crewai`):\n\n| Tool | What it does | Needs a key? |\n|---|---|---|\n| `ScrapeWebsiteTool` | Reads the text of the web page at a URL | No |\n| `SerperDevTool` | Google search through serper.dev | Yes: the environment variable `SERPER_API_KEY` |\n\n[▶ 12:29](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=749) Only the first two agents get these tools: the creator just writes copy and has no need to search. Verified on this machine: without `SERPER_API_KEY`, `SerperDevTool()` can be created, but the first search fails with `KeyError: 'SERPER_API_KEY'`; `ScrapeWebsiteTool` read `https://www.emqx.com/zh` and got about 5,000 characters of page text."
  },
  {
   "t": "code",
   "file": {
    "zh": "practice/l55_json_tasks_solution.py（节选）",
    "en": "practice/l55_json_tasks_solution.py (excerpt)"
   },
   "code": {
    "zh": "USE_TOOLS = False          # 改成 True：像视频一样给前两个 Agent 配工具\nTOOLS = []\nif USE_TOOLS:\n    from crewai_tools import ScrapeWebsiteTool, SerperDevTool\n\n    TOOLS = [ScrapeWebsiteTool()]                 # 读取网页文字，不需要 key\n    if os.environ.get(\"SERPER_API_KEY\"):          # 谷歌搜索：先在系统环境变量里设置 SERPER_API_KEY\n        TOOLS.append(SerperDevTool())\n\n\n@CrewBase\nclass MarketingCrew:\n    agents_config = \"data/l55_agents.yaml\"\n    tasks_config = \"data/l55_tasks.yaml\"\n\n    @agent\n    def lead_market_analyst(self) -> Agent:\n        return Agent(config=self.agents_config[\"lead_market_analyst\"], tools=TOOLS, llm=llm, verbose=True)\n\n    @agent\n    def chief_marketing_strategist(self) -> Agent:\n        return Agent(config=self.agents_config[\"chief_marketing_strategist\"], tools=TOOLS, llm=llm, verbose=True)\n\n    @agent\n    def creative_content_creator(self) -> Agent:      # 只负责写，不配工具\n        return Agent(config=self.agents_config[\"creative_content_creator\"], llm=llm, verbose=True)",
    "en": "USE_TOOLS = False          # set to True to give the first two agents tools, like the video\nTOOLS = []\nif USE_TOOLS:\n    from crewai_tools import ScrapeWebsiteTool, SerperDevTool\n\n    TOOLS = [ScrapeWebsiteTool()]                 # reads web page text, no key needed\n    if os.environ.get(\"SERPER_API_KEY\"):          # Google search: first set SERPER_API_KEY as a system environment variable\n        TOOLS.append(SerperDevTool())\n\n\n@CrewBase\nclass MarketingCrew:\n    agents_config = \"data/l55_agents.yaml\"\n    tasks_config = \"data/l55_tasks.yaml\"\n\n    @agent\n    def lead_market_analyst(self) -> Agent:\n        return Agent(config=self.agents_config[\"lead_market_analyst\"], tools=TOOLS, llm=llm, verbose=True)\n\n    @agent\n    def chief_marketing_strategist(self) -> Agent:\n        return Agent(config=self.agents_config[\"chief_marketing_strategist\"], tools=TOOLS, llm=llm, verbose=True)\n\n    @agent\n    def creative_content_creator(self) -> Agent:      # only writes, so no tools\n        return Agent(config=self.agents_config[\"creative_content_creator\"], llm=llm, verbose=True)"
   }
  },
  {
   "t": "p",
   "zh": "本课实际试了一次视频的第一步：只给分析师配上 `ScrapeWebsiteTool`，单独跑 `research_task`（4 次模型调用）。DeepSeek 分 3 轮、每轮同时发出 2 个工具调用，一共读了 6 个网页：EMQX 中文官网和博客、一篇 EMQX 和 HiveMQ 的对比文章、EMQX 的 GitHub 页面，以及竞争对手 HiveMQ、VerneMQ 的官网，然后才交出报告。报告里的客户数、连接数等数字都来自它读到的网页；不过它写了约 800 个字符，比任务要求的 400 字长了一倍——模型不一定严格照做。",
   "en": "This lesson actually tried the video's first step: only the analyst got `ScrapeWebsiteTool`, and `research_task` ran on its own (4 model calls). DeepSeek went 3 rounds, sending 2 tool calls at once in each, and read 6 web pages in total – EMQX's Chinese website and blog, an article comparing EMQX and HiveMQ, EMQX's GitHub page, and the websites of the competitors HiveMQ and VerneMQ – before handing in its report. Figures in the report such as customer and connection counts all came from the pages it read; but it wrote about 800 characters, twice the 400 the task asked for – the model doesn't always follow instructions exactly."
  },
  {
   "t": "warn",
   "zh": "练习文件默认**不开工具**（`USE_TOOLS = False`）：每用一次工具都要多调一次模型，搜索还要另外申请 key。不开工具时，模型只能凭训练时学到的知识写报告，**里面的数字可能是编的**。本课不开工具跑的那一次，文案里出现了「GitHub 1.4 万星、下载超 2000 万」这样的数字，没有任何来源，真要用之前必须核实。",
   "en": "The exercise file has tools **off** by default (`USE_TOOLS = False`): every tool use costs an extra model call, and search also needs a key of its own. Without tools the model can only write the report from what it learned in training, so **the figures in it may be made up**. In this lesson's run without tools, the copy contained figures like “14k GitHub stars, over 20 million downloads” with no source at all – they must be checked before you use them for real."
  },
  {
   "t": "h",
   "zh": "四、重点：让最后一个任务以 JSON 格式输出",
   "en": "4. The key part: make the last task output JSON"
  },
  {
   "t": "p",
   "zh": "[▶ 08:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=501) 先看结果：apiTest 收到的是一个 JSON，只有 `title` 和 `body` 两个键，正是老师想要的格式。[▶ 12:29](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=749) 他用 pydantic 来定义这个格式，[▶ 13:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=780) 在最后一个任务上写 `output_json=Copy`，`Copy` 只有 title 和 body 两个字段，所以结果和它一模一样。[▶ 13:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=811) 他特别强调：业务里要把结果交给别的程序继续用时，有一个固定的 JSON 格式非常有用，照这种写法定义好字段就行。",
   "en": "[▶ 08:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=501) First the result: apiTest receives a JSON with only two keys, `title` and `body` – exactly the format the instructor wanted. [▶ 12:29](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=749) He defines this format with pydantic [▶ 13:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=780) and writes `output_json=Copy` on the last task; `Copy` has only the two fields title and body, so the result matches it exactly. [▶ 13:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=811) He stresses that when a result is handed on to other programs in real business use, a fixed JSON format is very useful – just define the fields this way."
  },
  {
   "t": "code",
   "file": {
    "zh": "practice/l55_json_tasks_solution.py（节选）",
    "en": "practice/l55_json_tasks_solution.py (excerpt)"
   },
   "code": {
    "zh": "from pydantic import BaseModel, Field\n\n\nclass Copy(BaseModel):                     # 最终文案的格式：标题 + 正文（回顾 12 节）\n    title: str = Field(description=\"文案标题\")\n    body: str = Field(description=\"文案正文\")\n\n\nclass MarketStrategy(BaseModel):           # 补充：第 3 个任务的格式\n    name: str = Field(description=\"战略名称\")\n    tactics: list[str] = Field(description=\"战术\")\n    channels: list[str] = Field(description=\"渠道\")\n    kpis: list[str] = Field(description=\"关键指标\")\n\n\n# ……MarketingCrew 类里：\n    @task\n    def marketing_strategy_task(self) -> Task:\n        return Task(config=self.tasks_config[\"marketing_strategy_task\"], output_pydantic=MarketStrategy)\n\n    @task\n    def copy_creation_task(self) -> Task:\n        return Task(\n            config=self.tasks_config[\"copy_creation_task\"],\n            output_json=Copy,                          # 关键：最后一个任务按 Copy 的格式输出 JSON\n            output_file=\"data/l55_output/copy.json\",   # 同时存成 JSON 文件（相对于运行命令的文件夹）\n        )",
    "en": "from pydantic import BaseModel, Field\n\n\nclass Copy(BaseModel):                     # format of the final copy: title + body (see lesson 12)\n    title: str = Field(description=\"Title of the copy\")\n    body: str = Field(description=\"Body of the copy\")\n\n\nclass MarketStrategy(BaseModel):           # extra: the format of task 3\n    name: str = Field(description=\"Name of the strategy\")\n    tactics: list[str] = Field(description=\"Tactics\")\n    channels: list[str] = Field(description=\"Channels\")\n    kpis: list[str] = Field(description=\"Key metrics\")\n\n\n# ...inside the MarketingCrew class:\n    @task\n    def marketing_strategy_task(self) -> Task:\n        return Task(config=self.tasks_config[\"marketing_strategy_task\"], output_pydantic=MarketStrategy)\n\n    @task\n    def copy_creation_task(self) -> Task:\n        return Task(\n            config=self.tasks_config[\"copy_creation_task\"],\n            output_json=Copy,                          # key point: the last task outputs JSON in Copy's format\n            output_file=\"data/l55_output/copy.json\",   # also saved as a JSON file (relative to the folder you run the command from)\n        )"
   }
  },
  {
   "t": "p",
   "zh": "`Field(description=...)` 给字段加一句说明，这句说明会跟着格式一起交给模型，告诉它每个字段该填什么。任务上可以用两个参数接收这个模型，一个任务只能二选一（两个都写，创建 `Task` 时就报错 `Only one output type can be set`）：\n\n| 写法 | 任务结果里多了 | 怎么取（`out` 指这个任务的结果） |\n|---|---|---|\n| `output_json=Copy`（视频用的） | `json_dict`：普通字典 | `out.json_dict[\"title\"]` |\n| `output_pydantic=Copy` | `pydantic`：一个 Copy 对象 | `out.pydantic.title` |\n| 都不写 | 只有 `raw`：一段文字 | `out.raw` |\n\n不管选哪个，`raw` 里始终保留着原始文字。",
   "en": "`Field(description=...)` adds a short description to a field; it goes to the model together with the format and tells it what to put in each field. A task can take this model through two parameters, but only one of them per task (set both and creating the `Task` fails with `Only one output type can be set`):\n\n| Parameter | Extra in the task result | How to read it (`out` is this task's result) |\n|---|---|---|\n| `output_json=Copy` (used in the video) | `json_dict`: a plain dict | `out.json_dict[\"title\"]` |\n| `output_pydantic=Copy` | `pydantic`: a Copy object | `out.pydantic.title` |\n| Neither | only `raw`: a piece of text | `out.raw` |\n\nWhichever you choose, `raw` always keeps the original text."
  },
  {
   "t": "note",
   "zh": "补充：视频只讲了最后一个任务的 `output_json`。本课的参考答案还给第 3 个任务加了 `output_pydantic=MarketStrategy`，好让你对比两种写法；第 3 个任务输出的是 JSON 文字，后面的任务读到的就是整齐的字段。",
   "en": "Extra: the video only covers `output_json` on the last task. This lesson's reference solution also gives task 3 `output_pydantic=MarketStrategy` so you can compare the two; task 3 then outputs JSON text, and the later tasks read neatly organised fields."
  },
  {
   "t": "code",
   "file": {
    "zh": "practice/l55_json_tasks_solution.py（节选）",
    "en": "practice/l55_json_tasks_solution.py (excerpt)"
   },
   "code": {
    "zh": "result = MarketingCrew().crew().kickoff(inputs=INPUTS)\n\n# 整个小组的结构化结果 = 最后一个任务的结果\nprint(result.json_dict)                    # {'title': ..., 'body': ...}\nprint(result[\"title\"])                     # CrewOutput 可以直接用 [] 取字段\nprint(result.json_dict[\"body\"])\n\n# 前面的任务：从 tasks_output 里按顺序取（下标从 0 开始）\nstrategy = result.tasks_output[2].pydantic  # 第 3 个任务：MarketStrategy 对象\nprint(strategy.name, strategy.channels)",
    "en": "result = MarketingCrew().crew().kickoff(inputs=INPUTS)\n\n# the structured result of the whole team = the result of the last task\nprint(result.json_dict)                    # {'title': ..., 'body': ...}\nprint(result[\"title\"])                     # CrewOutput lets you read a field directly with []\nprint(result.json_dict[\"body\"])\n\n# earlier tasks: take them from tasks_output in order (indexes start at 0)\nstrategy = result.tasks_output[2].pydantic  # task 3: a MarketStrategy object\nprint(strategy.name, strategy.channels)"
   }
  },
  {
   "t": "p",
   "zh": "读取结果的几种写法：\n- `result` 是**整个 Crew** 的结果，它的 `json_dict` / `pydantic` 来自**最后一个任务**。\n- `result[\"title\"]`：`CrewOutput` 支持用方括号直接取最后一个任务的字段（先找 `pydantic`，再找 `json_dict`）。\n- `result.tasks_output[i]`：第 i+1 个任务的结果，同样有 `raw`、`json_dict`、`pydantic`。\n- `output_file`：有 `json_dict` 时，CrewAI 用 `json.dump(..., ensure_ascii=False, indent=2)` 写文件（源码确认），中文不转义、缩进 2 格。",
   "en": "Ways to read the result:\n- `result` is the result of the **whole crew**; its `json_dict` / `pydantic` come from the **last task**.\n- `result[\"title\"]`: `CrewOutput` lets you read the last task's fields directly with square brackets (it looks in `pydantic` first, then in `json_dict`).\n- `result.tasks_output[i]`: the result of task i+1, which likewise has `raw`, `json_dict` and `pydantic`.\n- `output_file`: when there is a `json_dict`, CrewAI writes the file with `json.dump(..., ensure_ascii=False, indent=2)` (confirmed in the source), so Chinese is not escaped and the indent is 2 spaces."
  },
  {
   "t": "check",
   "q": {
    "zh": "最后一个任务设置的是 `output_json=Copy`。下面哪种写法**取不到**标题？",
    "en": "The last task sets `output_json=Copy`. Which of these **cannot** get the title?"
   },
   "options": [
    {
     "zh": "`result.json_dict[\"title\"]`",
     "en": "`result.json_dict[\"title\"]`"
    },
    {
     "zh": "`result[\"title\"]`",
     "en": "`result[\"title\"]`"
    },
    {
     "zh": "`result.pydantic.title`",
     "en": "`result.pydantic.title`"
    },
    {
     "zh": "`result.to_dict()[\"title\"]`",
     "en": "`result.to_dict()[\"title\"]`"
    }
   ],
   "answer": 2,
   "explain": {
    "zh": "`output_json` 只填 `json_dict`，`result.pydantic` 是 `None`，再取 `.title` 会报 `AttributeError`。",
    "en": "`output_json` only fills `json_dict`; `result.pydantic` is `None`, so reading `.title` raises `AttributeError`."
   }
  },
  {
   "t": "py",
   "title": {
    "zh": "JSON 文字 → 字典 → 存文件（补充 05 节）",
    "en": "JSON text → dict → file (building on lesson 05)"
   },
   "zh": "设置了 `output_json` 以后，模型交回来的其实还是一段**文字**，CrewAI 替你把它变成字典。下面用 05 节学过的 `json.loads` / `json.dumps` 把这件事简化地做一遍，并认识 `json.dumps` 的两个常用参数：\n- `ensure_ascii=False`：中文保持原样；不写的话，中文会变成 `\\u6311` 这样的转义。\n- `indent=2`：换行并缩进 2 格，给人看更清楚。CrewAI 保存 `output_file` 时用的就是这两个参数。\n\n`[k for k in [...] if k not in data]` 是 06 节的列表推导式，用来找出缺少的字段。",
   "en": "With `output_json` set, the model still hands back **text**, and CrewAI turns it into a dict for you. Below is a simplified version of that, using `json.loads` / `json.dumps` from lesson 05, along with two common `json.dumps` parameters:\n- `ensure_ascii=False`: Chinese stays as it is; without it, Chinese turns into escapes like `\\u6311`.\n- `indent=2`: line breaks and a 2-space indent, easier for people to read. CrewAI uses exactly these two parameters when it saves `output_file`.\n\n`[k for k in [...] if k not in data]` is a list comprehension from lesson 06; here it finds the missing fields.",
   "code": {
    "zh": "import json\n\n# 模型交回来的是一段文字，有时还会套上 ```json 围栏\nanswer = '```json\\n{\"title\": \"五分钟上手挑战\", \"body\": \"一行命令跑起 EMQX，晒出你的第一个连接！\"}\\n```'\n\ntext = answer.strip()\nif text.startswith(\"```\"):                       # 去掉首尾的围栏行（回顾 54 节）\n    text = \"\\n\".join(text.split(\"\\n\")[1:-1])\n\ndata = json.loads(text)                          # JSON 文字 → 字典（回顾 05 节）\nmissing = [k for k in [\"title\", \"body\"] if k not in data]\nprint(\"缺少的字段：\", missing)                    # [] 表示两个字段都有\nprint(\"标题：\", data[\"title\"])\n\nprint(json.dumps(data))                          # 中文被转义成 \\u....\nprint(json.dumps(data, ensure_ascii=False, indent=2))   # 中文原样，缩进 2 格",
    "en": "import json\n\n# The model hands back text, sometimes wrapped in a ```json fence\n# (a Chinese answer here, so you can see what ensure_ascii does at the end)\nanswer = '```json\\n{\"title\": \"五分钟上手挑战\", \"body\": \"一行命令跑起 EMQX，晒出你的第一个连接！\"}\\n```'\n\ntext = answer.strip()\nif text.startswith(\"```\"):                       # drop the fence lines at both ends (see lesson 54)\n    text = \"\\n\".join(text.split(\"\\n\")[1:-1])\n\ndata = json.loads(text)                          # JSON text → dict (see lesson 05)\nmissing = [k for k in [\"title\", \"body\"] if k not in data]\nprint(\"Missing fields:\", missing)                # [] means both fields are there\nprint(\"Title:\", data[\"title\"])\n\nprint(json.dumps(data))                          # Chinese is escaped as \\u....\nprint(json.dumps(data, ensure_ascii=False, indent=2))   # Chinese as is, 2-space indent"
   }
  },
  {
   "t": "h",
   "zh": "五、用 DeepSeek 要多一步：它不支持 json_schema",
   "en": "5. One extra step with DeepSeek: it doesn't support json_schema"
  },
  {
   "t": "p",
   "zh": "视频用的 GPT-4o-mini 原生支持「结构化输出」，所以视频里只写 `output_json=Copy` 就够了。换成 DeepSeek 会遇到一个坑（CrewAI 1.15.23 源码确认、2026-10 实测）：\n- Agent **没有工具**时（比如本例的创作者），CrewAI 会把 Pydantic 模型以 `response_format={\"type\": \"json_schema\", ...}` 的形式发给 API，让服务器保证格式。\n- DeepSeek 只支持 `text` 和 `json_object` 两种格式，收到 `json_schema` 直接返回 400：`This response_format type is unavailable now`。\n- 用普通的 `LLM(...)` 时，这个任务会重试两次然后失败。\n\n本课的办法是 `practice/l55_deepseek_llm.py` 里的 `DeepSeekLLM`：它只改一件事——调用 API 时**不带** `response_model`。模型照常用文字回答，CrewAI 再用自己的「解析 + 校验」把回答变成你的模型。任务的写法一行都不用改，只要 `from l55_deepseek_llm import llm`。57、58 节的练习也用它。",
   "en": "GPT-4o-mini, used in the video, supports “structured output” natively, so the video only needs `output_json=Copy`. Switch to DeepSeek and you hit a snag (confirmed in the CrewAI 1.15.23 source and tested in October 2026):\n- When an agent has **no tools** (like the creator here), CrewAI sends the Pydantic model to the API as `response_format={\"type\": \"json_schema\", ...}` so that the server guarantees the format.\n- DeepSeek supports only two formats, `text` and `json_object`; given `json_schema` it returns a 400 straight away: `This response_format type is unavailable now`.\n- With a plain `LLM(...)`, the task retries twice and then fails.\n\nThis lesson's fix is `DeepSeekLLM` in `practice/l55_deepseek_llm.py`. It changes just one thing: it calls the API **without** `response_model`. The model answers in plain text as usual, and CrewAI turns the answer into your model with its own “parse + validate” step. The task code doesn't change at all; you only need `from l55_deepseek_llm import llm`. The exercises in lessons 57 and 58 use it too."
  },
  {
   "t": "code",
   "file": {
    "zh": "practice/l55_deepseek_llm.py（节选）",
    "en": "practice/l55_deepseek_llm.py (excerpt)"
   },
   "code": {
    "zh": "from crewai.llms.providers.openai.completion import OpenAICompletion\nfrom llm import API_KEY, BASE_URL, MODEL\n\n\nclass DeepSeekLLM(OpenAICompletion):\n    \"\"\"和 LLM(model=\"openai/...\", base_url=...) 一样，只是不把 response_model 发给 API。\"\"\"\n\n    def call(self, *args, response_model=None, **kwargs):\n        # 收下 response_model 参数，但不往下传\n        return super().call(*args, **kwargs)\n\n    async def acall(self, *args, response_model=None, **kwargs):\n        return await super().acall(*args, **kwargs)\n\n\nllm = DeepSeekLLM(model=MODEL, api_key=API_KEY, base_url=BASE_URL)",
    "en": "from crewai.llms.providers.openai.completion import OpenAICompletion\nfrom llm import API_KEY, BASE_URL, MODEL\n\n\nclass DeepSeekLLM(OpenAICompletion):\n    \"\"\"Same as LLM(model=\"openai/...\", base_url=...), except that response_model is not sent to the API.\"\"\"\n\n    def call(self, *args, response_model=None, **kwargs):\n        # take the response_model argument, but don't pass it on\n        return super().call(*args, **kwargs)\n\n    async def acall(self, *args, response_model=None, **kwargs):\n        return await super().acall(*args, **kwargs)\n\n\nllm = DeepSeekLLM(model=MODEL, api_key=API_KEY, base_url=BASE_URL)"
   },
   "note": {
    "zh": "`class DeepSeekLLM(OpenAICompletion)` 表示「在 `OpenAICompletion` 的基础上改一点」（继承，类在 08 节讲过）；`super().call(...)` 调用原来那个类的 `call`。`*args`、`**kwargs` 收下其余所有参数并原样转交（回顾 05 节的 `**kwargs`），只有 `response_model` 被单独截下不传。这个类不需要你手写，会用就行。",
    "en": "`class DeepSeekLLM(OpenAICompletion)` means “`OpenAICompletion` with a small change” (inheritance; classes were covered in lesson 08); `super().call(...)` calls the original class's `call`. `*args` and `**kwargs` collect all the other arguments and pass them on unchanged (see `**kwargs` in lesson 05); only `response_model` is caught and not passed on. You don't need to write this class yourself – just know how to use it."
   }
  },
  {
   "t": "tip",
   "zh": "因为服务器不再替你保证格式，**一定要在 `expected_output` 里写清字段名**，并要求「只输出 JSON」。模型一次答对，CrewAI 直接解析成功；字段名对不上时，CrewAI 还要再调用模型做一次转换，又慢又费钱。本课不开工具跑完整个小组时，第 3 个和最后一个任务的回答本身就是合格的 JSON，CrewAI 直接解析成功，没有额外的转换调用。",
   "en": "Because the server no longer guarantees the format, **always spell out the field names in `expected_output`** and ask for “JSON only”. If the model gets it right the first time, CrewAI parses it straight away; if the field names don't match, CrewAI has to call the model once more to convert it – slower and more expensive. When this lesson ran the whole team without tools, the answers of task 3 and the last task were already valid JSON, CrewAI parsed them straight away, and no extra conversion calls were made."
  },
  {
   "t": "h",
   "zh": "六、对外提供服务：JSON 请求进，JSON 结果出",
   "en": "6. Serving it: JSON request in, JSON result out"
  },
  {
   "t": "video",
   "zh": "[▶ 06:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=368) 测试流程和前几集一样：先在 main 脚本里选好模型（GPT、国产模型或本地模型三类，配地址、key、模型名）和端口，[▶ 06:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=399) 这次用 gpt-4o-mini，服务开在本机 **8012** 端口；[▶ 07:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=430) 再运行 apiTest 发 POST 请求，请求地址里的 IP 和端口要和服务一致。请求体里有两个参数，[▶ 07:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=463) 老师填的是 EMQ（EMQX）官网的地址和一段产品简介，让小组为它做营销策划。\n\n[▶ 14:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=841) main 脚本相比原来的项目只改了两处：一是请求体，按这次的业务加了 `customer_domain` 和 `project_description` 两个参数，[▶ 14:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=872) 并把请求格式和返回格式拆成两个类，输入和输出更好管理；二是[▶ 15:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=903) 服务启动时多做一步：把谷歌搜索（serper.dev）的 API key 写进环境变量——工具调用时要用到它。key 在 serper.dev 官网登录后申请。",
   "en": "[▶ 06:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=368) The test routine is the same as in the previous episodes: first pick the model in the main script (three kinds – GPT, Chinese models or local models – each with its address, key and model name) and the port; [▶ 06:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=399) this time it uses gpt-4o-mini, with the service on port **8012** of the local machine. [▶ 07:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=430) Then run apiTest to send a POST request; the IP and port in the request URL must match the service. The request body has two parameters: [▶ 07:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=463) the instructor fills in the address of EMQ's (EMQX's) website and a short product description, and has the team plan the marketing for it.\n\n[▶ 14:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=841) Compared with the original project, the main script changes in only two places. First, the request body: it gets two parameters for this business, `customer_domain` and `project_description`, [▶ 14:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=872) and the request and response formats are split into two classes, which makes input and output easier to manage. Second, [▶ 15:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=903) the service does one more thing at startup: it puts the API key for Google search (serper.dev) into an environment variable – the tool needs it when it is called. You get the key by signing in on the serper.dev website."
  },
  {
   "t": "code",
   "file": {
    "zh": "practice/l55_marketing_api.py（节选）",
    "en": "practice/l55_marketing_api.py (excerpt)"
   },
   "code": {
    "zh": "from contextlib import asynccontextmanager\n\nfrom fastapi import FastAPI, HTTPException\nfrom pydantic import BaseModel\n\nfrom l55_json_tasks_solution import USE_TOOLS, MarketingCrew\n\n\n@asynccontextmanager\nasync def lifespan(app: FastAPI):\n    # 服务启动时运行一次（回顾 51 节）。视频在这里把 SERPER_API_KEY 写进环境变量；\n    # 本课不把 key 写进代码，只检查系统环境变量里有没有\n    print(\"工具：\", \"开\" if USE_TOOLS else \"关\",\n          \"| SERPER_API_KEY：\", \"已设置\" if os.environ.get(\"SERPER_API_KEY\") else \"未设置\")\n    yield\n\n\napp = FastAPI(title=\"营销策划服务\", lifespan=lifespan)\n\n\nclass MarketingRequest(BaseModel):         # 请求格式：字段名和任务里的 {占位符} 一样\n    customer_domain: str\n    project_description: str\n\n\nclass MarketingResponse(BaseModel):        # 返回格式：和最后一个任务的 Copy 一样\n    title: str\n    body: str\n\n\n@app.post(\"/marketing\", response_model=MarketingResponse)\nasync def marketing(req: MarketingRequest):\n    crew = MarketingCrew().crew()                          # 每个请求新建一个 crew\n    result = await crew.kickoff_async(inputs=req.model_dump())\n    if not result.json_dict:                               # 模型没按 JSON 回答\n        raise HTTPException(status_code=502, detail=\"最后一个任务没有返回 JSON\")\n    return result.json_dict                                # 按 MarketingResponse 检查后发回",
    "en": "from contextlib import asynccontextmanager\n\nfrom fastapi import FastAPI, HTTPException\nfrom pydantic import BaseModel\n\nfrom l55_json_tasks_solution import USE_TOOLS, MarketingCrew\n\n\n@asynccontextmanager\nasync def lifespan(app: FastAPI):\n    # runs once when the service starts (see lesson 51). The video puts SERPER_API_KEY into the environment here;\n    # this lesson keeps the key out of the code and only checks whether the system environment has it\n    print(\"Tools:\", \"on\" if USE_TOOLS else \"off\",\n          \"| SERPER_API_KEY:\", \"set\" if os.environ.get(\"SERPER_API_KEY\") else \"not set\")\n    yield\n\n\napp = FastAPI(title=\"Marketing planning service\", lifespan=lifespan)\n\n\nclass MarketingRequest(BaseModel):         # request format: field names match the {placeholders} in the tasks\n    customer_domain: str\n    project_description: str\n\n\nclass MarketingResponse(BaseModel):        # response format: the same as the last task's Copy\n    title: str\n    body: str\n\n\n@app.post(\"/marketing\", response_model=MarketingResponse)\nasync def marketing(req: MarketingRequest):\n    crew = MarketingCrew().crew()                          # a new crew for every request\n    result = await crew.kickoff_async(inputs=req.model_dump())\n    if not result.json_dict:                               # the model didn't answer in JSON\n        raise HTTPException(status_code=502, detail=\"The last task returned no JSON\")\n    return result.json_dict                                # checked against MarketingResponse, then sent back"
   }
  },
  {
   "t": "p",
   "zh": "几个要点：\n- `req.model_dump()` 把请求对象变回字典 `{\"customer_domain\": ..., \"project_description\": ...}`。因为字段名和任务里的占位符一样，这个字典可以直接当 `inputs`。\n- `response_model=MarketingResponse`：FastAPI 先按这个格式检查返回值，再转成 JSON 发回；在 `/docs` 页面上也能看到这两个格式。\n- 请求少了字段（比如没有 `project_description`），FastAPI 直接返回 422，crew 根本不会启动（本机用测试客户端验证过）。\n- FastAPI、`lifespan`、`kickoff_async` 的写法 51 节已经完整讲过，这里只换了 crew 和两个格式类。",
   "en": "A few points:\n- `req.model_dump()` turns the request object back into a dict `{\"customer_domain\": ..., \"project_description\": ...}`. Because the field names match the placeholders in the tasks, this dict can be used directly as `inputs`.\n- `response_model=MarketingResponse`: FastAPI first checks the return value against this format, then sends it back as JSON; the `/docs` page shows both formats too.\n- If the request is missing a field (say, no `project_description`), FastAPI returns 422 right away and the crew never starts (verified on this machine with the test client).\n- How to write FastAPI, `lifespan` and `kickoff_async` was covered fully in lesson 51; here only the crew and the two format classes change."
  },
  {
   "t": "code",
   "file": {
    "zh": "practice/l55_api_client.py（节选）",
    "en": "practice/l55_api_client.py (excerpt)"
   },
   "code": {
    "zh": "import httpx\n\nURL = \"http://127.0.0.1:8012/marketing\"     # 地址和端口要和服务一致\n\npayload = {\n    \"customer_domain\": \"emqx.com\",\n    \"project_description\": \"EMQX 是一款开源的 MQTT 消息服务器，能连接海量物联网设备并实时处理数据。\"\n                           \"请为它策划一次面向国内物联网开发者和企业的推广活动。\",\n}\n\nresponse = httpx.post(URL, json=payload, timeout=1800)   # 5 个任务要跑几分钟\nresponse.raise_for_status()\ndata = response.json()                       # JSON 文字 → 字典\nprint(\"标题：\", data[\"title\"])\nprint(\"正文：\", data[\"body\"])",
    "en": "import httpx\n\nURL = \"http://127.0.0.1:8012/marketing\"     # address and port must match the service\n\npayload = {\n    \"customer_domain\": \"emqx.com\",\n    \"project_description\": \"EMQX is an open-source MQTT message server that connects huge numbers of IoT devices and processes their data in real time. \"\n                           \"Please plan a promotional campaign for it aimed at IoT developers and companies in China.\",\n}\n\nresponse = httpx.post(URL, json=payload, timeout=1800)   # 5 tasks take several minutes\nresponse.raise_for_status()\ndata = response.json()                       # JSON text → dict\nprint(\"Title:\", data[\"title\"])\nprint(\"Body:\", data[\"body\"])"
   }
  },
  {
   "t": "tip",
   "zh": "在本机运行要开两个终端，都先 `cd practice`：\n1. 第一个终端启动服务：`& ..\\.venv-crewai\\Scripts\\python.exe l55_marketing_api.py`\n2. 等出现 `Uvicorn running on http://127.0.0.1:8012`，在第二个终端运行：`& ..\\.venv-crewai\\Scripts\\python.exe l55_api_client.py`\n\n也可以打开 `http://127.0.0.1:8012/docs` 直接在网页上试。不想开服务的话，直接运行 `l55_json_tasks_solution.py` 效果一样。",
   "en": "Running it locally takes two terminals, both starting with `cd practice`:\n1. In the first terminal, start the service: `& ..\\.venv-crewai\\Scripts\\python.exe l55_marketing_api.py`\n2. When `Uvicorn running on http://127.0.0.1:8012` appears, run this in the second terminal: `& ..\\.venv-crewai\\Scripts\\python.exe l55_api_client.py`\n\nYou can also open `http://127.0.0.1:8012/docs` and try it right in the browser. If you'd rather not start the service, running `l55_json_tasks_solution.py` directly gives the same result."
  },
  {
   "t": "warn",
   "zh": "视频把 serper 的 key 写在代码的全局变量里，再在启动时放进环境变量。更安全的做法是像 `DEEPSEEK_API_KEY` 一样，把 `SERPER_API_KEY` 设成系统的用户环境变量，代码里只读取、不出现 key 本身——代码一旦分享或上传，写在里面的 key 就泄露了。",
   "en": "The video puts the serper key in a global variable in the code and moves it into the environment at startup. A safer way is to treat it like `DEEPSEEK_API_KEY`: set `SERPER_API_KEY` as a user environment variable on your system, so the code only reads it and never contains the key itself – once code is shared or uploaded, any key written in it has leaked."
  },
  {
   "t": "h",
   "zh": "七、运行结果和模型",
   "en": "7. Results and models"
  },
  {
   "t": "p",
   "zh": "[▶ 04:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=276) 视频用的是 gpt-4o-mini，但项目脚本同时支持 GPT、国产模型（通过 OneAPI）和本地模型（Ollama）。老师提醒：CrewAI 要靠模型一步步推理，不是所有模型都能做好，选模型要多测试。\n\n本课用 deepseek-flash、不开工具跑了一次完整的小组：5 个任务各调用 1 次模型，前两个任务交出约 500 和 400 个字符的文字，第 3 个任务得到 `MarketStrategy` 对象（列出了 8 个推广渠道），第 4 个任务约 1800 个字符，最后一个任务得到只有 `title`、`body` 的字典，并保存成下面这个文件：",
   "en": "[▶ 04:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=56&t=276) The video uses gpt-4o-mini, but the project script supports GPT, Chinese models (through OneAPI) and local models (Ollama). The instructor warns that CrewAI relies on the model reasoning step by step, which not every model does well – test several before you choose.\n\nThis lesson ran the full team once with deepseek-flash and no tools: each of the 5 tasks made 1 model call; the first two tasks returned about 500 and 400 characters of text, task 3 gave a `MarketStrategy` object (listing 8 promotion channels), task 4 about 1,800 characters, and the last task a dict with only `title` and `body`, saved as the file below (translated into English here):"
  },
  {
   "t": "code",
   "file": "practice/data/l55_output/copy.json",
   "lang": "json",
   "code": {
    "zh": "{\n  \"title\": \"百万连接马拉松：一根网线，跑给一百万人看\",\n  \"body\": \"百万连接，跑给一百万人看。EMQX 开源 MQTT 消息服务器，GitHub 1.4 万星、下载超 2000 万，已连接 1 亿+ 设备。5.x 支持 MQTT over QUIC、集群热升级、规则引擎直连 Kafka 与时序库。报名《百万连接马拉松》，Docker 一行命令 5 分钟跑通，Serverless 免费额度即刻上手。连接海量设备，实时数据底座。\"\n}",
    "en": "{\n  \"title\": \"Million-Connection Marathon: one network cable, running for a million people to see\",\n  \"body\": \"A million connections, running for a million people to see. EMQX, the open-source MQTT message server: 14k GitHub stars, over 20 million downloads, 100M+ devices connected. 5.x supports MQTT over QUIC, hot cluster upgrades, and a rules engine that connects straight to Kafka and time-series databases. Sign up for the “Million-Connection Marathon”: one Docker command gets you running in 5 minutes, and the Serverless free tier lets you start right away. Connect massive numbers of devices – a real-time data foundation.\"\n}"
   }
  }
 ],
 "quiz": [
  {
   "q": {
    "zh": "视频里，让最终结果按 `{\"title\": ..., \"body\": ...}` 格式交出的关键写法是？",
    "en": "In the video, what is the key code that makes the final result come out as `{\"title\": ..., \"body\": ...}`?"
   },
   "options": [
    {
     "zh": "在 `Crew(...)` 上写 `output_json=Copy`",
     "en": "Writing `output_json=Copy` on `Crew(...)`"
    },
    {
     "zh": "在 `expected_output` 里写「请输出 JSON」就够了",
     "en": "Writing “please output JSON” in `expected_output` is enough"
    },
    {
     "zh": "在最后一个任务上写 `output_json=Copy`，`Copy` 是只有 title、body 两个字段的 Pydantic 模型",
     "en": "Writing `output_json=Copy` on the last task, where `Copy` is a Pydantic model with only the two fields title and body"
    },
    {
     "zh": "在 FastAPI 的返回值上调用 `json.dumps`",
     "en": "Calling `json.dumps` on the FastAPI return value"
    }
   ],
   "answer": 2,
   "explain": {
    "zh": "格式用 Pydantic 模型定义，交给最后一个任务的 `output_json`；整个 Crew 的结构化结果就来自最后一个任务。",
    "en": "The format is defined as a Pydantic model and passed to the last task's `output_json`; the structured result of the whole crew comes from the last task."
   }
  },
  {
   "q": {
    "zh": "为什么视频只给前两个 Agent 配了读网页和搜索工具？",
    "en": "Why does the video give the web-reading and search tools only to the first two agents?"
   },
   "options": [
    {
     "zh": "创作者只负责根据前面的结果写文案，不需要去查资料",
     "en": "The creator only writes copy from the earlier results and doesn't need to look anything up"
    },
    {
     "zh": "一个 Crew 最多只能有两个 Agent 带工具",
     "en": "A crew can have at most two agents with tools"
    },
    {
     "zh": "配了工具的 Agent 不能使用 `output_json`",
     "en": "Agents with tools can't use `output_json`"
    },
    {
     "zh": "创作者用的是另一个模型，不支持工具",
     "en": "The creator uses a different model that doesn't support tools"
    }
   ],
   "answer": 0,
   "explain": {
    "zh": "分析师和战略师要调研、搜集信息；创作者的任务是把战略变成文案，用不着搜索。",
    "en": "The analyst and the strategist have to research and gather information; the creator's task is to turn the strategy into copy, which needs no searching."
   }
  },
  {
   "q": {
    "zh": "用 `SerperDevTool` 搜索之前必须准备什么？",
    "en": "What must you prepare before searching with `SerperDevTool`?"
   },
   "options": [
    {
     "zh": "什么都不用，它是免费的",
     "en": "Nothing – it's free"
    },
    {
     "zh": "在环境变量里设置 serper.dev 的 `SERPER_API_KEY`",
     "en": "Set serper.dev's `SERPER_API_KEY` as an environment variable"
    },
    {
     "zh": "先给 Agent 写 `allow_delegation=True`",
     "en": "Give the agent `allow_delegation=True` first"
    },
    {
     "zh": "把 `ScrapeWebsiteTool` 也加进来",
     "en": "Add `ScrapeWebsiteTool` as well"
    }
   ],
   "answer": 1,
   "explain": {
    "zh": "没有 key 时工具能创建，但一搜索就报 `KeyError: 'SERPER_API_KEY'`。视频在服务启动时把 key 放进环境变量。",
    "en": "Without a key the tool can be created, but the first search fails with `KeyError: 'SERPER_API_KEY'`. The video puts the key into the environment when the service starts."
   }
  },
  {
   "q": {
    "zh": "用普通 `LLM(...)` 连 DeepSeek，没有工具的创作者执行带 `output_json` 的任务时报 400：`This response_format type is unavailable now`。原因是？",
    "en": "With a plain `LLM(...)` connected to DeepSeek, the creator (which has no tools) gets a 400 on the task with `output_json`: `This response_format type is unavailable now`. Why?"
   },
   "options": [
    {
     "zh": "API key 填错了",
     "en": "The API key is wrong"
    },
    {
     "zh": "Pydantic 模型的字段太少",
     "en": "The Pydantic model has too few fields"
    },
    {
     "zh": "任务描述里没写「JSON」",
     "en": "The task description doesn't mention “JSON”"
    },
    {
     "zh": "CrewAI 发送了 `json_schema` 格式要求，DeepSeek 只支持 `text` 和 `json_object`",
     "en": "CrewAI sent a `json_schema` format requirement, and DeepSeek only supports `text` and `json_object`"
    }
   ],
   "answer": 3,
   "explain": {
    "zh": "改用 `l55_deepseek_llm` 里的 `llm`：不把格式要求发给 API，由 CrewAI 自己解析回答里的 JSON。视频用的 gpt-4o-mini 没有这个问题。",
    "en": "Switch to the `llm` from `l55_deepseek_llm`: it doesn't send the format requirement to the API, and CrewAI parses the JSON in the answer itself. The video's gpt-4o-mini doesn't have this problem."
   }
  },
  {
   "q": {
    "zh": "视频的服务里，为什么可以直接写 `kickoff_async(inputs=req.model_dump())`？",
    "en": "Why can the video's service simply write `kickoff_async(inputs=req.model_dump())`?"
   },
   "options": [
    {
     "zh": "因为 `model_dump()` 会自动调用模型",
     "en": "Because `model_dump()` calls the model automatically"
    },
    {
     "zh": "因为请求格式的字段名 `customer_domain`、`project_description` 和任务里的占位符一模一样",
     "en": "Because the request format's field names `customer_domain` and `project_description` are exactly the same as the placeholders in the tasks"
    },
    {
     "zh": "因为 FastAPI 会自动把请求体变成 crew",
     "en": "Because FastAPI turns the request body into a crew automatically"
    },
    {
     "zh": "因为 `inputs` 可以接收任何对象",
     "en": "Because `inputs` accepts any object"
    }
   ],
   "answer": 1,
   "explain": {
    "zh": "`model_dump()` 得到 `{\"customer_domain\": ..., \"project_description\": ...}`，键名正好对应 `{customer_domain}` 和 `{project_description}`。",
    "en": "`model_dump()` gives `{\"customer_domain\": ..., \"project_description\": ...}`, whose keys match `{customer_domain}` and `{project_description}` exactly."
   }
  },
  {
   "q": {
    "zh": "`result.tasks_output[2].pydantic` 取到的是什么？",
    "en": "What does `result.tasks_output[2].pydantic` give you?"
   },
   "options": [
    {
     "zh": "最后一个任务的 Copy 对象",
     "en": "The last task's Copy object"
    },
    {
     "zh": "所有任务合并成的一个对象",
     "en": "One object merging all the tasks"
    },
    {
     "zh": "第 2 个任务的结果",
     "en": "The result of task 2"
    },
    {
     "zh": "第 3 个任务（营销战略）的 `MarketStrategy` 对象",
     "en": "The `MarketStrategy` object of task 3 (the marketing strategy)"
    }
   ],
   "answer": 3,
   "explain": {
    "zh": "`tasks_output` 按顺序保存每个任务的结果，下标从 0 开始，`[2]` 是第 3 个任务；它设置了 `output_pydantic`，所以读 `.pydantic`。",
    "en": "`tasks_output` keeps each task's result in order, with indexes starting at 0, so `[2]` is task 3; that task sets `output_pydantic`, so you read `.pydantic`."
   }
  }
 ],
 "fill": [
  {
   "title": {
    "zh": "定义 JSON 格式，交给最后一个任务",
    "en": "Define the JSON format and give it to the last task"
   },
   "code": {
    "zh": "class Copy([[BaseModel]]):\n    title: [[str]] = Field(description=\"文案标题\")\n    body: str = [[Field]](description=\"文案正文\")\n\n\n@task\ndef copy_creation_task(self) -> Task:\n    return Task(\n        config=self.[[tasks_config]][\"copy_creation_task\"],\n        [[output_json]]=Copy,\n        [[output_file]]=\"data/l55_output/copy.json\",\n    )\n\n\nresult = MarketingCrew().crew().kickoff(inputs=INPUTS)\nprint(result.[[json_dict]][\"title\"])\nprint(result[\"[[body]]\"])",
    "en": "class Copy([[BaseModel]]):\n    title: [[str]] = Field(description=\"Title of the copy\")\n    body: str = [[Field]](description=\"Body of the copy\")\n\n\n@task\ndef copy_creation_task(self) -> Task:\n    return Task(\n        config=self.[[tasks_config]][\"copy_creation_task\"],\n        [[output_json]]=Copy,\n        [[output_file]]=\"data/l55_output/copy.json\",\n    )\n\n\nresult = MarketingCrew().crew().kickoff(inputs=INPUTS)\nprint(result.[[json_dict]][\"title\"])\nprint(result[\"[[body]]\"])"
   },
   "explain": {
    "zh": "模型继承 `BaseModel`，字段用 `Field(description=...)` 加说明；`output_json` 让结果变成字典，`output_file` 同时存文件；读取用 `json_dict` 或方括号。",
    "en": "The model inherits from `BaseModel`, and `Field(description=...)` adds a description to a field; `output_json` turns the result into a dict and `output_file` also saves it to a file; read it with `json_dict` or square brackets."
   }
  },
  {
   "title": {
    "zh": "JSON 请求进，JSON 结果出",
    "en": "JSON request in, JSON result out"
   },
   "code": "class MarketingRequest([[BaseModel]]):\n    customer_domain: str\n    [[project_description]]: str\n\n\n@app.[[post]](\"/marketing\", [[response_model]]=MarketingResponse)\nasync def marketing(req: MarketingRequest):\n    crew = MarketingCrew().crew()\n    result = [[await]] crew.kickoff_async(inputs=req.[[model_dump]]())\n    return result.json_dict",
   "explain": {
    "zh": "请求格式的字段名对应任务的占位符；`response_model` 规定返回格式；`req.model_dump()` 把请求变回字典当 `inputs`。",
    "en": "The request format's field names match the tasks' placeholders; `response_model` sets the response format; `req.model_dump()` turns the request back into a dict for `inputs`."
   }
  }
 ],
 "write": [
  {
   "title": {
    "zh": "手写：只做视频的最后一步——以 JSON 格式输出文案",
    "en": "Write it yourself: just the video's last step – output the copy as JSON"
   },
   "task": {
    "zh": "不看上面的代码，写一个只有一个 Agent 的小 Crew：\n1. 定义 Pydantic 模型 `Copy`：`title` 和 `body` 两个字符串字段\n2. 创建 Agent `creator`（首席创意内容创作者），传 `llm=llm`\n3. 创建任务 `copy_task`：描述里用 `{project_description}` 和 `{campaign_idea}` 两个占位符，`expected_output` 写清字段名，设置 `output_json=Copy` 和 `output_file=\"data/l55_output/my_copy.json\"`\n4. 组建 Crew，用 `kickoff(inputs={...})` 启动，打印 `result.json_dict` 和 `result[\"title\"]`\n\n本课实际运行过参考答案：1 次模型调用，得到只有 title、body 的字典。完整的 5 任务版练习在 `practice/l55_json_tasks_todo.py`。",
    "en": "Without looking at the code above, write a small crew with a single agent:\n1. Define a Pydantic model `Copy` with two string fields, `title` and `body`\n2. Create the agent `creator` (chief creative content creator) and pass `llm=llm`\n3. Create the task `copy_task`: use the two placeholders `{project_description}` and `{campaign_idea}` in the description, spell out the field names in `expected_output`, and set `output_json=Copy` and `output_file=\"data/l55_output/my_copy.json\"`\n4. Build the crew, start it with `kickoff(inputs={...})`, and print `result.json_dict` and `result[\"title\"]`\n\nThis lesson actually ran the reference solution: 1 model call, giving a dict with only title and body. The full 5-task exercise is in `practice/l55_json_tasks_todo.py`."
   },
   "starter": {
    "zh": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import Agent, Crew, Process, Task\nfrom pydantic import BaseModel, Field\nfrom l55_deepseek_llm import llm\n\n\n# 1. 最终文案的 JSON 格式：只有标题和正文两个字段\n\n\n# 2. Agent：首席创意内容创作者（记得把 llm 传进去）\n\n\n# 3. 任务：按上面的格式输出 JSON，并存到 data/l55_output/my_copy.json\n\n\n# 4. 组建 Crew 并启动（两个输入：project_description、campaign_idea），再读取 JSON 结果\n",
    "en": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import Agent, Crew, Process, Task\nfrom pydantic import BaseModel, Field\nfrom l55_deepseek_llm import llm\n\n\n# 1. The JSON format of the final copy: just two fields, a title and a body\n\n\n# 2. Agent: chief creative content creator (remember to pass llm in)\n\n\n# 3. Task: output JSON in the format above and save it to data/l55_output/my_copy.json\n\n\n# 4. Build the Crew and start it (two inputs: project_description, campaign_idea), then read the JSON result\n"
   },
   "solution": {
    "zh": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import Agent, Crew, Process, Task\nfrom pydantic import BaseModel, Field\nfrom l55_deepseek_llm import llm\n\n\n# 1. 最终文案的 JSON 格式：只有标题和正文两个字段\nclass Copy(BaseModel):\n    title: str = Field(description=\"文案标题\")\n    body: str = Field(description=\"文案正文\")\n\n\n# 2. Agent：首席创意内容创作者（记得把 llm 传进去）\ncreator = Agent(\n    role=\"首席创意内容创作者\",\n    goal=\"根据营销活动设想，写出有吸引力的社交媒体文案\",\n    backstory=\"你任职于一家一流的数字营销公司，擅长把营销战略变成打动人的文字。\",\n    llm=llm,\n)\n\n# 3. 任务：按 Copy 的格式输出 JSON，并存到 data/l55_output/my_copy.json\ncopy_task = Task(\n    description=\"项目：{project_description}\\n活动设想：{campaign_idea}\\n请为这个活动写一条社交媒体营销文案。\",\n    expected_output=\"一个 JSON 对象，只有 title（标题）和 body（正文，不超过 100 字）两个字段。只输出 JSON。\",\n    agent=creator,\n    output_json=Copy,\n    output_file=\"data/l55_output/my_copy.json\",\n)\n\n# 4. 组建 Crew 并启动，再读取 JSON 结果\ncrew = Crew(agents=[creator], tasks=[copy_task], process=Process.sequential)\nresult = crew.kickoff(inputs={\n    \"project_description\": \"向国内物联网开发者推广开源 MQTT 消息服务器 EMQX\",\n    \"campaign_idea\": \"「五分钟上手挑战」：用 Docker 一行命令跑起 EMQX，晒出第一个连接成功的截图\",\n})\nprint(result.json_dict)\nprint(\"标题：\", result[\"title\"])\nprint(\"正文：\", result.json_dict[\"body\"])",
    "en": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import Agent, Crew, Process, Task\nfrom pydantic import BaseModel, Field\nfrom l55_deepseek_llm import llm\n\n\n# 1. The JSON format of the final copy: just two fields, a title and a body\nclass Copy(BaseModel):\n    title: str = Field(description=\"Title of the copy\")\n    body: str = Field(description=\"Body of the copy\")\n\n\n# 2. Agent: chief creative content creator (remember to pass llm in)\ncreator = Agent(\n    role=\"Chief Creative Content Creator\",\n    goal=\"Write engaging social media copy based on the campaign idea\",\n    backstory=\"You work at a top digital marketing agency and are good at turning marketing strategies into words that move people.\",\n    llm=llm,\n)\n\n# 3. Task: output JSON in Copy's format and save it to data/l55_output/my_copy.json\ncopy_task = Task(\n    description=\"Project: {project_description}\\nCampaign idea: {campaign_idea}\\nWrite one social media marketing post for this campaign.\",\n    expected_output=\"A JSON object with only two fields: title (the headline) and body (the text, at most 100 words). Output only JSON.\",\n    agent=creator,\n    output_json=Copy,\n    output_file=\"data/l55_output/my_copy.json\",\n)\n\n# 4. Build the Crew and start it, then read the JSON result\ncrew = Crew(agents=[creator], tasks=[copy_task], process=Process.sequential)\nresult = crew.kickoff(inputs={\n    \"project_description\": \"Promote EMQX, the open-source MQTT message server, to IoT developers in China\",\n    \"campaign_idea\": \"Five-minute quick-start challenge: start EMQX with one Docker command and post a screenshot of your first successful connection\",\n})\nprint(result.json_dict)\nprint(\"Title:\", result[\"title\"])\nprint(\"Body:\", result.json_dict[\"body\"])"
   },
   "checks": [
    {
     "zh": "定义了 `class Copy(BaseModel)`",
     "en": "Defines `class Copy(BaseModel)`",
     "re": "class\\s+Copy\\s*\\(\\s*BaseModel\\s*\\)\\s*:"
    },
    {
     "zh": "`Copy` 有 `title` 和 `body` 两个 `str` 字段",
     "en": "`Copy` has two `str` fields, `title` and `body`",
     "re": "title\\s*:\\s*str[\\s\\S]*body\\s*:\\s*str"
    },
    {
     "zh": "Agent 传了 `llm=llm`",
     "en": "The agent gets `llm=llm`",
     "re": "llm\\s*=\\s*llm\\b"
    },
    {
     "zh": "任务描述里用了 `{campaign_idea}` 占位符",
     "en": "The task description uses the `{campaign_idea}` placeholder",
     "re": "\\{campaign_idea\\}"
    },
    {
     "zh": "设置了 `output_json=Copy`",
     "en": "Sets `output_json=Copy`",
     "re": "output_json\\s*=\\s*Copy\\b"
    },
    {
     "zh": "用 `output_file` 保存成 .json 文件",
     "en": "Saves a .json file with `output_file`",
     "re": "output_file\\s*=\\s*[\"'][^\"']+\\.json[\"']"
    },
    {
     "zh": "`kickoff(inputs={...})` 启动",
     "en": "Starts it with `kickoff(inputs={...})`",
     "re": "kickoff\\(\\s*inputs\\s*=\\s*\\{"
    },
    {
     "zh": "用 `json_dict` 或 `result[\"...\"]` 读取结果",
     "en": "Reads the result with `json_dict` or `result[\"...\"]`",
     "re": "result\\.json_dict|result\\[\\s*[\"']"
    }
   ]
  }
 ],
 "pitfalls": [
  {
   "zh": "用 DeepSeek + 普通 `LLM(...)` 跑带 `output_json` / `output_pydantic` 的任务，报 400 `This response_format type is unavailable now`。改用 `l55_deepseek_llm` 里的 `llm`。",
   "en": "Running a task with `output_json` / `output_pydantic` on DeepSeek through a plain `LLM(...)` gives a 400: `This response_format type is unavailable now`. Use the `llm` from `l55_deepseek_llm` instead."
  },
  {
   "zh": "设置的是 `output_json` 却去读 `.pydantic`（或者反过来），拿到 `None`。",
   "en": "Setting `output_json` but reading `.pydantic` (or the other way round) gives you `None`."
  },
  {
   "zh": "同一个任务同时写 `output_json` 和 `output_pydantic`，创建 `Task` 时就报错。",
   "en": "Setting both `output_json` and `output_pydantic` on one task makes creating the `Task` fail."
  },
  {
   "zh": "`expected_output` 没写字段名，模型自己起名字，校验失败后 CrewAI 还要额外调用模型来转换。",
   "en": "`expected_output` doesn't name the fields, so the model makes up its own names; when validation fails, CrewAI has to make an extra model call to convert the answer."
  },
  {
   "zh": "开了 `SerperDevTool` 却没设置 `SERPER_API_KEY`，一搜索就报 `KeyError: 'SERPER_API_KEY'`。",
   "en": "Turning on `SerperDevTool` without setting `SERPER_API_KEY`: the first search fails with `KeyError: 'SERPER_API_KEY'`."
  },
  {
   "zh": "请求体的字段名和任务里的占位符对不上：FastAPI 先按请求格式检查，少字段返回 422；格式类和占位符不一致则 kickoff 时报 `Template variable ... not found`。",
   "en": "Request body field names that don't match the task placeholders: FastAPI checks the request format first and returns 422 for a missing field; if the format class and the placeholders disagree, kickoff fails with `Template variable ... not found`."
  },
  {
   "zh": "不开工具时把报告里的数字当真：模型可能凭印象编数字，用之前要核实。",
   "en": "Trusting the figures in a report written without tools: the model may invent numbers from memory, so check them before use."
  },
  {
   "zh": "不在 `practice` 文件夹里运行：`from llm import ...` 失败，`copy.json` 也会存到别处。",
   "en": "Running from outside the `practice` folder: `from llm import ...` fails and `copy.json` is saved somewhere else."
  }
 ],
 "recap": [
  {
   "zh": "营销策划小组：分析师 → 战略师 → 创作者，3 个 Agent 按顺序完成 5 个任务；前两个 Agent 配了读网页和搜索工具。",
   "en": "The marketing team: analyst → strategist → creator, 3 agents completing 5 tasks in order; the first two agents have the web-reading and search tools."
  },
  {
   "zh": "用 Pydantic 定义格式（视频是只有 title、body 的 `Copy`），交给最后一个任务的 `output_json`，最终结果就是这个 JSON。",
   "en": "Define the format with Pydantic (in the video, a `Copy` with only title and body) and pass it to the last task's `output_json`; the final result is that JSON."
  },
  {
   "zh": "`output_json` → `json_dict`（字典）；`output_pydantic` → `pydantic`（对象）；二选一，`raw` 始终都有。",
   "en": "`output_json` → `json_dict` (a dict); `output_pydantic` → `pydantic` (an object); pick one – `raw` is always there."
  },
  {
   "zh": "`result[\"title\"]` 读最后一个任务的字段；前面的任务看 `result.tasks_output[i]`。",
   "en": "`result[\"title\"]` reads a field of the last task; for earlier tasks, look in `result.tasks_output[i]`."
  },
  {
   "zh": "服务端请求格式和返回格式分开定义，`req.model_dump()` 直接当 `inputs`；搜索工具的 key 放环境变量。",
   "en": "On the server, define the request and response formats separately and pass `req.model_dump()` straight in as `inputs`; keep the search tool's key in an environment variable."
  },
  {
   "zh": "DeepSeek 不支持 `json_schema`：用 `l55_deepseek_llm` 的 `llm`，并在 `expected_output` 里写清字段名。",
   "en": "DeepSeek doesn't support `json_schema`: use the `llm` from `l55_deepseek_llm` and spell out the field names in `expected_output`."
  }
 ],
 "files": [
  {
   "path": "practice/l55_json_tasks_todo.py",
   "zh": "练习：完成营销策划小组里和 JSON 有关的部分（Copy 模型、output_json、读取结果），有 TODO 提示。",
   "en": "Exercise: complete the JSON parts of the marketing team (the Copy model, output_json, reading the result), with TODO hints."
  },
  {
   "path": "practice/l55_json_tasks_solution.py",
   "zh": "参考答案：3 个 Agent、5 个任务，第 3 个任务 output_pydantic，最后一个任务 output_json 并存成 copy.json；`USE_TOOLS` 开关控制是否像视频一样配工具。",
   "en": "Solution: 3 agents, 5 tasks; task 3 uses output_pydantic, and the last task uses output_json and is saved as copy.json; the `USE_TOOLS` switch decides whether the agents get tools as in the video."
  },
  {
   "path": "practice/l55_deepseek_llm.py",
   "zh": "辅助模块：让 output_json / output_pydantic 能配合 DeepSeek 使用（57、58 节也用它）。",
   "en": "Helper module: makes output_json / output_pydantic work with DeepSeek (lessons 57 and 58 use it too)."
  },
  {
   "path": "practice/l55_marketing_api.py",
   "zh": "视频的 main 脚本：FastAPI 服务，8012 端口，请求格式和返回格式分开定义。",
   "en": "The video's main script: a FastAPI service on port 8012, with separate request and response formats."
  },
  {
   "path": "practice/l55_api_client.py",
   "zh": "视频的 apiTest 脚本：发 JSON 请求，打印返回的 title 和 body。",
   "en": "The video's apiTest script: sends a JSON request and prints the returned title and body."
  },
  {
   "path": "practice/data/l55_agents.yaml",
   "zh": "三个 Agent 的设定（按视频的角色改写）。",
   "en": "Settings for the three agents (rewritten from the video's roles)."
  },
  {
   "path": "practice/data/l55_tasks.yaml",
   "zh": "五个任务的说明，带 `{customer_domain}`、`{project_description}` 占位符。",
   "en": "The five task descriptions, with the `{customer_domain}` and `{project_description}` placeholders."
  },
  {
   "path": "practice/data/l55_output/copy.json",
   "zh": "参考答案一次真实运行保存下来的 JSON 文件。",
   "en": "The JSON file saved from one real run of the reference solution."
  }
 ]
});
