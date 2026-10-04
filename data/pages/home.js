COURSE.pages = COURSE.pages || {};
COURSE.pages.home = {
  title: { zh: "Agent 智能体开发 · 互动学习手册", en: "Building AI Agents · Interactive Study Guide" },
  intro: {
    zh: "配合 B 站《Agent 智能体开发全套教程》（59 集，约 17 小时）的学习手册。**以视频为主线**：每一节对应视频里的一集。先看视频，再用这里的讲义、测验和练习，把视频里的知识变成你自己能写出来的代码。Python 知识只在这一节用到的时候才穿插讲解，不额外跑题。",
    en: "A study companion for the Bilibili series *AI Agent Development* (59 episodes, about 17 hours). **The video is the backbone**: each lesson here matches one episode. Watch it first, then use the notes, quizzes and exercises to turn what you saw into code you can write yourself. Python is taught only when a lesson needs it, never as a detour.",
  },
  blocks: [
    { t: "h", zh: "每一节怎么学（约 30–60 分钟）", en: "How to study each lesson (30–60 minutes)" },
    {
      t: "p",
      zh: "1. **看视频**：点每节顶部的「在 B 站打开这一集」。\n2. **读讲义**：对照视频复习要点。紫色的「🐍 Python 小课堂」会补上这一节用到的 Python 知识，代码可以直接点 ▶ 运行。\n3. **做小测验**：检查概念有没有真正理解。\n4. **代码填空**：熟悉关键代码的写法。\n5. **手写练习**：不看答案，自己把核心代码写出来。**这是最重要的一步**，能写出来才算学会。\n6. **本地运行**：在 VS Code 里运行 `practice` 文件夹里的练习文件，连接真实模型看效果。",
      en: "1. **Watch the episode**: use “Open this episode on Bilibili” at the top of each lesson.\n2. **Read the notes** alongside the video. Purple “🐍 Python mini-lesson” boxes cover the Python the lesson needs; press ▶ Run to try the code.\n3. **Take the quiz** to check the ideas really landed.\n4. **Fill in the code** to get familiar with the key lines.\n5. **Write it yourself** without looking. **This is the step that matters most** – you have learned it when you can write it.\n6. **Run it locally**: run the files in the `practice` folder from VS Code against a real model.",
    },
    {
      t: "tip",
      title: { zh: "⏱ 时间不多时的学习路线", en: "⏱ Short on time?" },
      zh: "- 第一遍只学标着 **核心** 的小节，并且把它们的手写练习做到能独立写出来。\n- 第二遍学 **重要** 的小节，能看懂、能改写即可。\n- 标着 **了解** 的小节：看视频时开 1.5 倍速，讲义只看「要点回顾」。\n- 模块「从零手写 Agent」（04–07）是整门课的地基，后面所有框架都是在帮你自动完成这几节手写的事情，务必吃透。",
      en: "- First pass: only the **Core** lessons, and practise their write-it-yourself tasks until you can do them unaided.\n- Second pass: the **Important** lessons – understand and adapt the code.\n- **Overview** lessons: watch at 1.5× and read just the key takeaways.\n- Module “Hand-Writing an Agent from Scratch” (04–07) is the foundation. Every framework later on automates what you write by hand there, so master it.",
    },
    {
      t: "note",
      title: { zh: "📝 关于内容来源", en: "📝 Where the content comes from" },
      zh: "视频没有可以获取的字幕，我看不到视频本身，所以每一节讲义是根据**视频标题**、你提供的**视频截图**（第 06 集），以及各框架的**官方文档**整理的。讲义里的代码都按本机安装的真实框架版本核对过。如果视频里的讲法或代码和这里不一样，**以视频为准**，这里当作补充和练习材料。",
      en: "No transcript of the videos was available, so each lesson is built from the **episode title**, your **screenshots** (episode 06) and the frameworks' **official documentation**. The code was checked against the framework versions actually installed on this machine. Where the video differs, **follow the video** and use this guide as extra notes and practice.",
    },
    {
      t: "note",
      title: { zh: "🔑 模型和 API key", en: "🔑 Models and API keys" },
      zh: "视频第 04 集用 DeepSeek，从第 05 集开始多数集用阿里云百炼的 `qwen-plus`。这份讲义统一改用 **DeepSeek**（`deepseek-flash`），key 从环境变量 `DEEPSEEK_API_KEY` 读取。两家都兼容 OpenAI 接口，代码几乎一样，只有 `base_url`、`model` 和 key 不同。详见 [环境准备](#/setup)。",
      en: "Episode 04 of the video uses DeepSeek; from episode 05 most episodes use Alibaba Cloud's `qwen-plus`. This guide uses **DeepSeek** throughout (`deepseek-flash`), reading the key from the `DEEPSEEK_API_KEY` environment variable. Both speak the OpenAI-compatible API, so the code is nearly identical – only `base_url`, `model` and the key change. See [Setup](#/setup).",
    },
  ],
};
