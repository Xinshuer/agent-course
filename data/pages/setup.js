COURSE.pages = COURSE.pages || {};
COURSE.pages.setup = {
  title: { zh: "🧰 环境准备", en: "🧰 Setup" },
  summary: {
    zh: "开始之前把环境弄好：课程文件夹、两个虚拟环境、API key，以及怎样运行练习文件。照着这一页做一遍，大部分时间花在下载安装包上。",
    en: "Get set up before you start: the course folder, two virtual environments, the API key, and how to run the practice files. Most of the time goes into downloading packages.",
  },
  blocks: [
    { t: "h", zh: "1. 课程文件夹", en: "1. The course folder" },
    {
      t: "p",
      zh: "整个课程就是你下载（或 `git clone`）下来的这个文件夹，下文叫**项目文件夹**，放在哪个盘、哪个位置都可以：\n\n| 路径 | 是什么 |\n|---|---|\n| `index.html` | 这个学习网页，双击用浏览器打开 |\n| `practice\\` | 每一节的本地练习文件（`_todo` 是要你补全的，`_solution` 是参考答案） |\n| `practice\\llm.py` | 公用的模型配置，所有练习都从这里导入 `client` |\n| `.venv\\` | 主虚拟环境（Python 3.12），第 1–8 模块（00–50 节）用，按第 3 步创建 |\n| `.venv-crewai\\` | CrewAI 专用虚拟环境，第 9–10 模块（51–58 节）用，按第 3 步创建 |\n| `.cache\\` | 运行练习时下载的模型和 CrewAI 的小数据库，自动生成 |\n| `requirements*.txt` | 两个环境要装哪些包、什么版本 |",
      en: "The course is simply the folder you downloaded (or `git clone`d), called the **project folder** below; any drive or location works:\n\n| Path | What it is |\n|---|---|\n| `index.html` | This study site – double-click to open it in a browser |\n| `practice\\` | Local practice files per lesson (`_todo` for you to complete, `_solution` for reference) |\n| `practice\\llm.py` | Shared model settings; every exercise imports `client` from here |\n| `.venv\\` | Main virtual environment (Python 3.12) for modules 1–8 (lessons 00–50); created in step 3 |\n| `.venv-crewai\\` | CrewAI-only environment for modules 9–10 (lessons 51–58); created in step 3 |\n| `.cache\\` | Models downloaded by the exercises and CrewAI's small database; created automatically |\n| `requirements*.txt` | Which packages and versions each environment needs |",
    },

    { t: "h", zh: "2. 为什么要用虚拟环境", en: "2. Why virtual environments" },
    {
      t: "p",
      zh: "**虚拟环境**（virtual environment，简称 venv）是一个独立的 Python 安装目录，里面装的包只属于这个项目，不会影响电脑上其他的 Python。\n\n这门课用到很多框架（LangChain、LangGraph、AgentScope、CrewAI……），它们对依赖包的版本要求各不相同，有时还互相冲突，比如 CrewAI 和 AgentScope 要求的 `json-repair` 版本就对不上。所以课程准备了**两个**环境。\n\n另外，课程环境用的是 **Python 3.12**：部分框架还没有完全支持更新的 3.14，在 3.14 上安装会失败。",
      en: "A **virtual environment** (venv) is a separate Python install whose packages belong to one project only, leaving every other Python on your machine untouched.\n\nThis course uses many frameworks (LangChain, LangGraph, AgentScope, CrewAI…) with different – sometimes conflicting – version needs; CrewAI and AgentScope disagree on `json-repair`, for example. Hence **two** environments.\n\nThe course environments use **Python 3.12**: some frameworks do not fully support the newer 3.14 yet and fail to install there.",
    },

    { t: "h", zh: "3. 创建两个虚拟环境", en: "3. Create the two virtual environments" },
    {
      t: "p",
      zh: "先装好 Python 3.12（python.org 的 Windows 安装包会同时装上 `py` 启动器）。然后在**项目文件夹**里打开 PowerShell，运行下面几行。装 `.venv` 要下载不少包，需要几分钟：",
      en: "Install Python 3.12 first (the Windows installer from python.org also installs the `py` launcher). Then open PowerShell in the **project folder** and run the lines below. `.venv` downloads quite a few packages, so give it a few minutes:",
    },
    {
      t: "code",
      lang: "powershell",
      file: "PowerShell",
      code: {
        zh: "py -3.12 -m venv .venv\n& .venv\\Scripts\\python.exe -m pip install -r requirements.txt\n\n# 51–58 节（CrewAI）用的第二个环境\npy -3.12 -m venv .venv-crewai\n& .venv-crewai\\Scripts\\python.exe -m pip install -r requirements-crewai.txt",
        en: "py -3.12 -m venv .venv\n& .venv\\Scripts\\python.exe -m pip install -r requirements.txt\n\n# the second environment, for lessons 51–58 (CrewAI)\npy -3.12 -m venv .venv-crewai\n& .venv-crewai\\Scripts\\python.exe -m pip install -r requirements-crewai.txt",
      },
    },
    {
      t: "tip",
      zh: "macOS / Linux：把 `py -3.12` 换成 `python3.12`，把 `.venv\\Scripts\\python.exe` 换成 `.venv/bin/python`。讲义里其他命令也照这个规律换。",
      en: "macOS / Linux: use `python3.12` instead of `py -3.12`, and `.venv/bin/python` instead of `.venv\\Scripts\\python.exe`. Translate the other commands in the notes the same way.",
    },

    { t: "h", zh: "4. 运行练习文件", en: "4. Running the practice files" },
    {
      t: "p",
      zh: "讲义和练习文件开头的运行命令，都默认你在 `practice` 文件夹里，所以解释器写成 `..\\.venv\\Scripts\\python.exe`（`..` 表示上一级，也就是项目文件夹）。这样写不用担心选错解释器。\n\n在 VS Code 里也可以：\n1. 打开 `practice` 文件夹。\n2. 按 `Ctrl+Shift+P`，输入 **Python: Select Interpreter**，选项目文件夹里的 `.venv\\Scripts\\python.exe`（51–58 节选 `.venv-crewai` 里的那个）。列表里没有，就选 **Enter interpreter path…** 手动找到它。\n3. 打开练习文件，点右上角的 ▶ 运行。\n\n在终端里运行（先进入项目文件夹）：",
      en: "The run commands in the notes and at the top of each practice file assume you are in the `practice` folder, so the interpreter is written `..\\.venv\\Scripts\\python.exe` (`..` means one level up, i.e. the project folder). That way the interpreter can't be wrong.\n\nIn VS Code you can also:\n1. Open the `practice` folder.\n2. Press `Ctrl+Shift+P`, run **Python: Select Interpreter** and pick `.venv\\Scripts\\python.exe` in the project folder (for lessons 51–58, the one in `.venv-crewai`). If it isn't listed, choose **Enter interpreter path…** and browse to it.\n3. Open an exercise and press ▶ in the top-right corner.\n\nIn a terminal (start in the project folder):",
    },
    {
      t: "code",
      lang: "powershell",
      file: "PowerShell",
      code: {
        zh: "cd practice\n& ..\\.venv\\Scripts\\python.exe l06_chat.py\n\n# 51–58 节（CrewAI）用另一个环境\n& ..\\.venv-crewai\\Scripts\\python.exe <文件名>.py",
        en: "cd practice\n& ..\\.venv\\Scripts\\python.exe l06_chat.py\n\n# lessons 51–58 (CrewAI) use the other environment\n& ..\\.venv-crewai\\Scripts\\python.exe <file name>.py",
      },
    },
    {
      t: "note",
      title: { zh: "📝 CrewAI 的两个环境变量", en: "📝 Two environment variables for CrewAI" },
      zh: "CrewAI 的练习文件开头用 `os.environ.setdefault(...)` 设好了这两个变量，不用你自己设置：\n- `CREWAI_STORAGE_DIR`：设为项目文件夹里的 `.cache\\crewai`，让 CrewAI 把记忆和运行记录存在项目里，而不是默认的用户目录（`AppData`）。\n- `CREWAI_TRACING_ENABLED=false`：关闭 CrewAI 的云端追踪提示。",
      en: "The CrewAI practice files set both variables with `os.environ.setdefault(...)`, so you don't have to:\n- `CREWAI_STORAGE_DIR` points to `.cache\\crewai` in the project folder, so CrewAI keeps its memory and run records inside the project instead of the default user folder (`AppData`).\n- `CREWAI_TRACING_ENABLED=false` turns off CrewAI's cloud-tracing prompt.",
    },

    { t: "h", zh: "5. API key 和模型", en: "5. API key and model" },
    {
      t: "p",
      zh: "在 DeepSeek 开放平台申请一个 API key，然后把它存进**用户环境变量** `DEEPSEEK_API_KEY`，不要写进代码。在 PowerShell 里运行一次（把引号里换成你的 key）：\n\n`setx DEEPSEEK_API_KEY \"你的key\"`\n\nmacOS / Linux 在 `~/.zshrc` 或 `~/.bashrc` 里加一行 `export DEEPSEEK_API_KEY=\"你的key\"`。\n\n`practice\\llm.py` 从这个变量读取 key，然后创建好 `client`，其他练习文件只需要 `from llm import client, MODEL`。",
      en: "Get an API key from the DeepSeek platform and store it in the **user environment variable** `DEEPSEEK_API_KEY` – never in code. In PowerShell, run this once (put your key inside the quotes):\n\n`setx DEEPSEEK_API_KEY \"your-key\"`\n\nOn macOS / Linux, add `export DEEPSEEK_API_KEY=\"your-key\"` to `~/.zshrc` or `~/.bashrc`.\n\n`practice\\llm.py` reads the variable and creates `client`, so every other exercise just does `from llm import client, MODEL`.",
    },
    {
      t: "code",
      file: "practice/llm.py",
      code: {
        zh: "import os\n\nfrom openai import AsyncOpenAI, OpenAI\n\nBASE_URL = \"https://api.deepseek.com\"\nMODEL = \"deepseek-flash\"\n\nAPI_KEY = os.environ.get(\"DEEPSEEK_API_KEY\")\nif not API_KEY:\n    raise RuntimeError(\"没找到环境变量 DEEPSEEK_API_KEY ...\")\n\nclient = OpenAI(api_key=API_KEY, base_url=BASE_URL)\nasync_client = AsyncOpenAI(api_key=API_KEY, base_url=BASE_URL)",
        en: "import os\n\nfrom openai import AsyncOpenAI, OpenAI\n\nBASE_URL = \"https://api.deepseek.com\"\nMODEL = \"deepseek-flash\"\n\nAPI_KEY = os.environ.get(\"DEEPSEEK_API_KEY\")\nif not API_KEY:\n    raise RuntimeError(\"Environment variable DEEPSEEK_API_KEY not found ...\")\n\nclient = OpenAI(api_key=API_KEY, base_url=BASE_URL)\nasync_client = AsyncOpenAI(api_key=API_KEY, base_url=BASE_URL)",
      },
      note: {
        zh: "框架类的练习（LangChain、AgentScope 等）也从这里导入 `API_KEY`、`BASE_URL`、`MODEL`，传给各自的模型类。",
        en: "Framework exercises (LangChain, AgentScope…) import `API_KEY`, `BASE_URL` and `MODEL` from here and pass them to each framework's model class.",
      },
    },
    {
      t: "warn",
      zh: "如果运行时提示「没找到环境变量 DEEPSEEK_API_KEY」：**关掉所有 VS Code 窗口**再重新打开。只要还有一个 VS Code 窗口开着，新打开的窗口就仍然在旧进程里，看不到新设置的环境变量。",
      en: "If you see “Environment variable DEEPSEEK_API_KEY not found”: **close every VS Code window** and reopen. While any window stays open, new ones live in the old process and cannot see the new variable.",
    },
    {
      t: "warn",
      title: { zh: "⚠️ deepseek-flash 默认会先“思考”", en: "⚠️ deepseek-flash thinks first by default" },
      zh: "`deepseek-flash` 默认开启**思考模式**：回答前先生成一段推理（`reasoning_content`）。这会带来几个和视频不一样的现象：\n- `temperature`、`top_p` 基本不起作用（要观察温度效果，先关掉思考）。\n- 流式输出开头会有很多 `delta.content` 为 `None` 的片段（那时它在思考），所以打印时要写 `delta.content or \"\"`。\n- 不能**强制**模型调用某个工具（`tool_choice=\"required\"` 或指定函数会报 400），依赖这一点的结构化输出写法也会失败。\n- 不支持 `response_format` 的 `json_schema` 类型（`json_object` 可以）。\n\n需要时可以关掉思考：调用时加 `extra_body={\"thinking\": {\"type\": \"disabled\"}}`。讲义里用到的地方都会提醒。",
      en: "`deepseek-flash` runs in **thinking mode** by default: it writes reasoning (`reasoning_content`) before answering. Things that differ from the video:\n- `temperature` and `top_p` have little effect (turn thinking off to see temperature at work).\n- A stream starts with many chunks whose `delta.content` is `None` (it is thinking), so print `delta.content or \"\"`.\n- You cannot **force** a tool call (`tool_choice=\"required\"` or a named function returns 400), and structured-output modes that rely on it fail.\n- `response_format` type `json_schema` is not supported (`json_object` is).\n\nTurn thinking off when needed with `extra_body={\"thinking\": {\"type\": \"disabled\"}}`; the lessons point this out where it matters.",
    },
    {
      t: "video",
      zh: "视频第 04 集用的是 DeepSeek；从第 05 集开始换成阿里云百炼的通义千问 `qwen-plus`（老师说当时他用的 DeepSeek 版本不支持工具调用，现在的 `deepseek-flash` 已经支持）；LangGraph 实战几集又用回了 DeepSeek。如果你想和视频完全一致，可以在百炼控制台申请 key，然后把 `llm.py` 里的三项改成：`BASE_URL = \"https://dashscope.aliyuncs.com/compatible-mode/v1\"`、`MODEL = \"qwen-plus\"`、key 从 `DASHSCOPE_API_KEY` 读取。其余代码都不用改。",
      en: "Episode 04 of the video uses DeepSeek; from episode 05 it switches to Alibaba Cloud Bailian's `qwen-plus` (the instructor says his DeepSeek version could not call tools then – today's `deepseek-flash` can); the LangGraph project episodes go back to DeepSeek. To match the qwen episodes exactly, get a Bailian key and change three things in `llm.py`: `BASE_URL = \"https://dashscope.aliyuncs.com/compatible-mode/v1\"`, `MODEL = \"qwen-plus\"`, and read the key from `DASHSCOPE_API_KEY`. Nothing else changes.",
    },

    { t: "h", zh: "6. 网页里的 ▶ 运行按钮", en: "6. The ▶ Run button in this site" },
    {
      t: "p",
      zh: "讲义里的代码可以直接在浏览器里运行（使用 Pyodide，第一次点运行需要联网下载，约 10 秒）。\n- 纯 Python 的代码（Python 小课堂）和真实 Python 运行结果完全一样。\n- 调用模型的代码会连到一个**模拟模型**：不联网、不花钱，能正确演示消息记录、工具调用、流式输出的流程，也会对常见错误给出提示，但回答内容是固定的模板。\n- 浏览器里**不能**运行 LangChain、LangGraph、AgentScope、CrewAI 等框架代码，这些请用本地练习文件运行。\n\n下面这段可以试试：",
      en: "Code in the notes can run right in the browser (via Pyodide; the first run downloads it, about 10 seconds).\n- Plain Python (the mini-lessons) behaves exactly like real Python.\n- Code that calls a model talks to a **mock model**: offline and free, it shows the message, tool-call and streaming flow correctly and flags common mistakes, but its answers are canned.\n- Framework code (LangChain, LangGraph, AgentScope, CrewAI…) **cannot** run in the browser; use the local practice files for those.\n\nTry this one:",
    },
    {
      t: "code",
      file: "try_me.py",
      run: "mock",
      code: {
        zh: "import sys\nfrom llm import client, MODEL\n\nprint(\"Python\", sys.version.split()[0])\nr = client.chat.completions.create(model=MODEL, messages=[{\"role\": \"user\", \"content\": \"你好\"}])\nprint(r.choices[0].message.content)",
        en: "import sys\nfrom llm import client, MODEL\n\nprint(\"Python\", sys.version.split()[0])\nr = client.chat.completions.create(model=MODEL, messages=[{\"role\": \"user\", \"content\": \"Hello\"}])\nprint(r.choices[0].message.content)",
      },
    },
  ],
};
