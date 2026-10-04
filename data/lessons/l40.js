COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l40",
  "priority": "important",
  "handwrite": true,
  "studyMinutes": 50,
  "source": "subtitle",
  "summary": {
    "zh": "LangGraph 实战的第一个小项目：一个专门回答 LCEL 编程问题的代码助手。它先读一份文档，让模型按「方案说明 / import 语句 / 代码」三部分交回答案，再自动做两项检查——import 能不能成功、代码能不能运行；没通过就带着错误信息重新生成，最多 3 次，还可以打开开关，先「反思」一下错在哪。这一节按视频的顺序，把加载文档、结构化输出、状态、三个节点、条件边和整张图一步步搭出来。",
    "en": "The first small LangGraph project: a coding assistant for LCEL questions. It reads some documentation, has the model answer in three parts – a description, the imports, the code – and then runs two checks automatically: do the imports work, and does the code run? On failure it regenerates with the error message, at most 3 times, and a switch can add a “reflect” step first. Following the video's order, this lesson builds the doc loading, structured output, state, three nodes, conditional edge and the whole graph step by step."
  },
  "goals": [
    {
      "zh": "说出代码助手的完整流程：参考文档 → 生成 → 导入检查 → 执行检查 → 结束 / 重新生成 / 反思",
      "en": "Describe the assistant's flow: reference docs → generate → import check → execution check → end / regenerate / reflect"
    },
    {
      "zh": "用 `ChatPromptTemplate` + `with_structured_output(CodeSolution)` 拿到 prefix / imports / code 三部分，知道 DeepSeek 要关掉思考模式",
      "en": "Get prefix / imports / code back with `ChatPromptTemplate` + `with_structured_output(CodeSolution)`, knowing DeepSeek needs thinking mode off"
    },
    {
      "zh": "写出状态 `GraphState`（error、messages、generation、iterations），想清楚哪些信息放进 messages、哪些单独放",
      "en": "Write `GraphState` (error, messages, generation, iterations) and decide what goes into messages and what gets its own field"
    },
    {
      "zh": "写出 generate、code_check、reflect 三个节点，以及带路径映射的条件边 `decide_to_finish`",
      "en": "Write the generate, code_check and reflect nodes and the `decide_to_finish` conditional edge with a path map"
    },
    {
      "zh": "用 `max_iterations` 限制重试次数，知道直接 `exec` 模型写的代码有什么风险",
      "en": "Cap retries with `max_iterations`, and know the risks of `exec`-ing model-written code"
    }
  ],
  "blocks": [
    {
      "t": "h",
      "zh": "一、三个实战项目，和这个代码助手要做什么",
      "en": "1. Three projects, and what this coding assistant does"
    },
    {
      "t": "p",
      "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=0) 理论部分到这里讲完了，从这一节开始是三个实战：两个小项目——这一节的**代码助手**、41 节的**提示词生成助手**——再加一个综合项目，42 节带数字人的**多智能体版小浪助手**。\n\n老师对这个代码助手的建议：把参考文档换成你正在学的语言或框架（比如还不熟的前端框架），或者换成团队自己的编码规范，它就成了你专属的编程小助手。",
      "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=0) The theory part is done; from here on come three projects: two small ones – this lesson's **coding assistant** and lesson 41's **prompt generator** – and a bigger one, lesson 42's **multi-agent Xiaolang assistant** with a digital human.\n\nThe instructor's tip for this assistant: swap the reference docs for a language or framework you're learning (say, a front-end framework you don't know yet), or for your team's coding standards, and it becomes your own coding helper."
    },
    {
      "t": "p",
      "zh": "[▶ 02:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=126) 代码助手的流程分四步：\n1. 拿到用户的问题，先参考一份文档（视频用的是 **LCEL** 文档，LCEL 即 LangChain 表达式语言，48 节细讲）\n2. 让模型生成答案：方案说明、需要的 import、代码，三部分分开\n3. 自动检查两项：先单独运行 import（**导入检查**），再把 import 和代码一起运行（**执行检查**）\n4. 有问题就带着错误信息重新生成，最多 3 次；也可以打开开关，先「反思」错在哪再生成",
      "en": "[▶ 02:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=126) The assistant works in four steps:\n1. Take the user's question and consult some documentation first (the video uses the **LCEL** docs – LangChain Expression Language, covered in lesson 48)\n2. Have the model answer in three separate parts: a description, the imports, the code\n3. Run two checks automatically: the imports alone (**import check**), then imports + code together (**execution check**)\n4. On a problem, regenerate with the error message, at most 3 times; a switch can add a “reflect” step first"
    },
    {
      "t": "code",
      "file": {
        "zh": "流程图",
        "en": "flowchart"
      },
      "lang": "text",
      "code": {
        "zh": "START --> generate --> check_code --+--> END          （通过了，或者已经生成了 3 次）\n             ^    ^                 |\n             |    +-----------------+               （没通过：直接重新生成）\n             |                      |\n             +------ reflect <------+               （没通过，且 flag = \"reflect\"：先反思再生成）",
        "en": "START --> generate --> check_code --+--> END          (passed, or 3 attempts used)\n             ^    ^                 |\n             |    +-----------------+               (failed: regenerate straight away)\n             |                      |\n             +------ reflect <------+               (failed and flag = \"reflect\": reflect first)"
      }
    },
    {
      "t": "video",
      "zh": "视频里老师先提醒要用 LangGraph 0.3 版本；本课程装的是 1.2.12，这一节用到的写法（`StateGraph`、`add_conditional_edges` 带路径映射、`compile`）都没有变。整个案例和 LangGraph 官方教程「自我纠错的代码生成」是同一个做法，老师在 Jupyter 笔记本里一段段运行；中间 [▶ 13:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=812) 有一格忘了运行，报了「未定义」，补跑一遍就好了——用笔记本时这种情况很常见。",
      "en": "In the video the instructor first reminds you to use LangGraph 0.3; the course installs 1.2.12, and everything this lesson uses (`StateGraph`, `add_conditional_edges` with a path map, `compile`) is unchanged. The project follows LangGraph's official “code generation with self-correction” tutorial, run cell by cell in a Jupyter notebook; at [▶ 13:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=812) he forgets to run one cell, gets a “not defined” error and simply runs it – a common notebook hiccup."
    },
    {
      "t": "h",
      "zh": "二、先用纯 Python 看懂这个循环",
      "en": "2. The loop in plain Python first"
    },
    {
      "t": "p",
      "zh": "上框架之前，先用二十几行纯 Python 把「生成 → 两项检查 → 重试」跑一遍。这里没有真的模型：`answers` 里放了三份「模型的答案」，第 1 份模块名写错（导入检查不通过），第 2 份结果不对（执行检查不通过），第 3 份正确。名字和视频一致：`error` 用 `\"yes\"`/`\"no\"`，计数器叫 `iterations`。点 ▶ 运行：",
      "en": "Before the framework, run “generate → two checks → retry” in about twenty lines of plain Python. There's no real model: `answers` holds three “model answers” – the first has a wrong module name (fails the import check), the second a wrong result (fails the execution check), the third is right. The names match the video: `error` is `\"yes\"`/`\"no\"` and the counter is `iterations`. Press ▶ Run:"
    },
    {
      "t": "code",
      "file": "loop_demo.py",
      "run": true,
      "code": {
        "zh": "# 假装这是模型前后三次交来的答案（真实项目里由模型生成）\nanswers = [\n    {\"imports\": \"import maths\", \"code\": \"r = maths.sqrt(16)\"},                         # 第 1 次：模块名写错\n    {\"imports\": \"import math\", \"code\": \"r = math.sqrt(16) + 1\\nassert r == 4, f'r 是 {r}'\"},  # 第 2 次：结果不对\n    {\"imports\": \"import math\", \"code\": \"r = math.sqrt(16)\\nassert r == 4\\nprint('r =', r)\"},  # 第 3 次：正确\n]\nmax_iterations = 3\n\ndef code_check(solution):\n    try:\n        exec(solution[\"imports\"], {})                                   # 检查 1：导入\n    except Exception as e:\n        return \"yes\", f\"导入检查没通过：{type(e).__name__}: {e}\"\n    try:\n        exec(solution[\"imports\"] + \"\\n\" + solution[\"code\"], {})         # 检查 2：执行\n    except Exception as e:\n        return \"yes\", f\"执行检查没通过：{type(e).__name__}: {e}\"\n    return \"no\", \"\"\n\niterations = 0\nwhile True:\n    solution = answers[iterations]          # 「生成」：这里直接按顺序取\n    iterations += 1\n    error, message = code_check(solution)   # 回顾 07 节：函数可以一次返回两个值\n    print(f\"第 {iterations} 次：\", \"通过\" if error == \"no\" else message)\n    if error == \"no\" or iterations >= max_iterations:\n        break\nprint(\"结束，一共生成了\", iterations, \"次\")",
        "en": "# Pretend these are three answers the model gave in a row (a real project gets them from the model)\nanswers = [\n    {\"imports\": \"import maths\", \"code\": \"r = maths.sqrt(16)\"},                         # attempt 1: wrong module name\n    {\"imports\": \"import math\", \"code\": \"r = math.sqrt(16) + 1\\nassert r == 4, f'r is {r}'\"},  # attempt 2: wrong result\n    {\"imports\": \"import math\", \"code\": \"r = math.sqrt(16)\\nassert r == 4\\nprint('r =', r)\"},  # attempt 3: correct\n]\nmax_iterations = 3\n\ndef code_check(solution):\n    try:\n        exec(solution[\"imports\"], {})                                   # check 1: imports\n    except Exception as e:\n        return \"yes\", f\"import check failed: {type(e).__name__}: {e}\"\n    try:\n        exec(solution[\"imports\"] + \"\\n\" + solution[\"code\"], {})         # check 2: execution\n    except Exception as e:\n        return \"yes\", f\"execution check failed: {type(e).__name__}: {e}\"\n    return \"no\", \"\"\n\niterations = 0\nwhile True:\n    solution = answers[iterations]          # \"generate\": just take the next answer\n    iterations += 1\n    error, message = code_check(solution)   # see lesson 07: a function can return two values\n    print(f\"attempt {iterations}:\", \"passed\" if error == \"no\" else message)\n    if error == \"no\" or iterations >= max_iterations:\n        break\nprint(\"done after\", iterations, \"attempts\")"
      }
    },
    {
      "t": "py",
      "title": {
        "zh": "exec()：运行字符串里的代码",
        "en": "exec(): running code held in a string"
      },
      "zh": "模型交回来的代码只是一个**字符串**。视频的检查节点用内置函数 `exec()` 运行它：\n- `exec(源码, 字典)`：把字符串当成 Python 代码**真的运行**。第二个参数给一个字典，代码里创建的变量都放进这个字典，不会弄乱你自己的变量。\n- 代码出错时，`exec` 会抛出异常：模块不存在是 `ModuleNotFoundError`，变量没定义是 `NameError`，语法错误是 `SyntaxError`……用 `try/except Exception as e` 接住（回顾 07 节），`type(e).__name__` 是错误类型的名字，`e` 本身是错误说明。\n- **陷阱**：`exec(..., {})` 里 `__name__` 不是 `\"__main__\"`，写在 `if __name__ == \"__main__\":` 下面的测试不会运行，错误的代码也会「通过」检查。所以提示词里要让模型把 `print`、`assert` 直接写在代码最后。\n\n补充：只想检查语法、不想运行时，可以用 `compile(源码, \"<名字>\", \"exec\")`，语法错了会抛出 `SyntaxError`。",
      "en": "Code returned by the model is just a **string**. The video's check node runs it with the built-in `exec()`:\n- `exec(source, a_dict)` **really runs** the string as Python. Pass a dict as the second argument: variables the code creates go into it instead of mixing with yours.\n- When the code fails, `exec` raises an exception: a missing module is `ModuleNotFoundError`, an undefined name is `NameError`, bad syntax is `SyntaxError`… Catch it with `try/except Exception as e` (see lesson 07); `type(e).__name__` is the error type's name and `e` itself is the message.\n- **Trap**: inside `exec(..., {})`, `__name__` is not `\"__main__\"`, so tests under `if __name__ == \"__main__\":` never run and broken code “passes”. That's why the prompt asks the model to put its `print`/`assert` lines at the very end of the code.\n\nExtra: to check syntax without running anything, use `compile(source, \"<name>\", \"exec\")`; bad syntax raises `SyntaxError`.",
      "code": {
        "zh": "# 1. exec()：把字符串当成代码运行，新变量放进我们给的字典里\nsrc = \"x = 2 + 3\\nprint('x =', x)\"\nscope = {}\nexec(src, scope)\nprint(\"运行后 scope 里的 x =\", scope[\"x\"])\n\n# 2. 出错时会抛出异常，用 try/except 接住，变成一段文字\nfor bad in [\"import maths\", \"print(y)\", \"print(1 / 0)\", \"print('hi'\"]:\n    try:\n        exec(bad, {})\n    except Exception as e:\n        print(bad, \"->\", type(e).__name__ + \":\", e)\n\n# 3. 陷阱：exec(..., {}) 里 __name__ 不是 \"__main__\"，下面的测试根本不会运行\ntrap = \"def add(a, b):\\n    return a - b\\nif __name__ == '__main__':\\n    assert add(2, 3) == 5\"\nexec(trap, {})\nprint(\"没有报错——但 add 明明写错了，只是测试没运行\")",
        "en": "# 1. exec(): run a string as code; new variables go into the dict we pass\nsrc = \"x = 2 + 3\\nprint('x =', x)\"\nscope = {}\nexec(src, scope)\nprint(\"after running, x in scope =\", scope[\"x\"])\n\n# 2. Errors raise exceptions; try/except turns them into text\nfor bad in [\"import maths\", \"print(y)\", \"print(1 / 0)\", \"print('hi'\"]:\n    try:\n        exec(bad, {})\n    except Exception as e:\n        print(bad, \"->\", type(e).__name__ + \":\", e)\n\n# 3. Trap: inside exec(..., {}), __name__ is not \"__main__\", so this test never runs\ntrap = \"def add(a, b):\\n    return a - b\\nif __name__ == '__main__':\\n    assert add(2, 3) == 5\"\nexec(trap, {})\nprint(\"no error - yet add is wrong; the test simply never ran\")"
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "`exec(imports, {})` 没有报错，说明什么？",
        "en": "`exec(imports, {})` raised nothing. What does that tell you?"
      },
      "options": [
        {
          "zh": "代码已经全部正确，可以交给用户了",
          "en": "All the code is correct and ready for the user"
        },
        {
          "zh": "import 语句能成功，但代码本身还没运行，第二项检查才知道它有没有错",
          "en": "The imports work, but the code itself hasn't run yet; only the second check can tell"
        },
        {
          "zh": "模型这次没有写 import",
          "en": "The model wrote no imports this time"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "导入检查只运行 import 语句。代码里的 NameError、断言失败等问题，要第二步 `exec(imports + \"\\n\" + code, {})` 才会暴露。",
        "en": "The import check runs only the import lines. NameErrors, failed asserts and the like show up only in the second step, `exec(imports + \"\\n\" + code, {})`."
      }
    },
    {
      "t": "h",
      "zh": "三、准备参考文档",
      "en": "3. Preparing the reference docs"
    },
    {
      "t": "p",
      "zh": "[▶ 03:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=188) 视频里的助手不是凭记忆写代码，而是先读文档：用 LangChain 的网页加载器 `RecursiveUrlLoader` 把 LCEL 文档页抓下来，用 BeautifulSoup 只留下网页里的文字，按网址排好序，再拼成一大段干净的文本，作为参考资料放进提示词。这样模型写的是「文档里那个版本」的代码，不容易用错 API。",
      "en": "[▶ 03:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=188) The video's assistant doesn't code from memory; it reads documentation first: LangChain's web loader `RecursiveUrlLoader` fetches the LCEL docs pages, BeautifulSoup keeps only the page text, the pages are sorted by URL and joined into one long clean text that goes into the prompt as reference material. The model then writes code for the version in the docs and is less likely to misuse an API."
    },
    {
      "t": "code",
      "file": {
        "zh": "视频的写法 / the video's version",
        "en": "the video's version"
      },
      "code": {
        "zh": "# 视频的写法，仅供对照：需要 beautifulsoup4（本课程环境没有安装），而且这个网址现在会跳到新文档首页\nfrom bs4 import BeautifulSoup as Soup\nfrom langchain_community.document_loaders.recursive_url_loader import RecursiveUrlLoader\n\nurl = \"https://python.langchain.com/docs/concepts/lcel/\"\nloader = RecursiveUrlLoader(url=url, max_depth=20,\n                            extractor=lambda x: Soup(x, \"html.parser\").text)   # 只要网页里的文字\ndocs = loader.load()\n\nd_sorted = sorted(docs, key=lambda x: x.metadata[\"source\"])                      # 按网址排序\nconcatenated_content = \"\\n\\n\\n --- \\n\\n\\n\".join(doc.page_content for doc in reversed(d_sorted))",
        "en": "# The video's version, for comparison only: it needs beautifulsoup4 (not installed in the course\n# environment), and this URL now redirects to the new docs home page\nfrom bs4 import BeautifulSoup as Soup\nfrom langchain_community.document_loaders.recursive_url_loader import RecursiveUrlLoader\n\nurl = \"https://python.langchain.com/docs/concepts/lcel/\"\nloader = RecursiveUrlLoader(url=url, max_depth=20,\n                            extractor=lambda x: Soup(x, \"html.parser\").text)   # keep only the page text\ndocs = loader.load()\n\nd_sorted = sorted(docs, key=lambda x: x.metadata[\"source\"])                      # sort by URL\nconcatenated_content = \"\\n\\n\\n --- \\n\\n\\n\".join(doc.page_content for doc in reversed(d_sorted))"
      }
    },
    {
      "t": "warn",
      "zh": "照抄视频这段会遇到两个问题（2026 年实测）：本课程环境没有装 `beautifulsoup4`；而且视频里的 LCEL 文档网址现在会跳转到 LangChain 新文档的首页，抓下来的已经不是 LCEL 文档了。所以练习文件改为读一份本地的 LCEL 速查笔记 `practice/data/l40_lcel_docs.md`（课程自己写的，对应本机装的 langchain-core 1.x）。换成你自己的文档，做法完全一样。",
      "en": "Copying this part of the video hits two problems (tested in 2026): `beautifulsoup4` isn't installed in the course environment, and the LCEL docs URL from the video now redirects to the new LangChain docs home page, so it no longer fetches the LCEL docs. The practice file therefore reads a local LCEL cheat sheet, `practice/data/l40_lcel_docs.md` (written for this course against the installed langchain-core 1.x). Your own docs work exactly the same way."
    },
    {
      "t": "code",
      "file": "load_docs.py",
      "code": {
        "zh": "from pathlib import Path\n\n# 本课程的做法：读一份本地的 LCEL 速查笔记（换成你自己的文档也一样）\nconcatenated_content = Path(\"data/l40_lcel_docs.md\").read_text(encoding=\"utf-8\")\nprint(len(concatenated_content), \"个字符\")",
        "en": "from pathlib import Path\n\n# This course's way: read a local LCEL cheat sheet (any docs of your own work the same way)\nconcatenated_content = Path(\"data/l40_lcel_docs.md\").read_text(encoding=\"utf-8\")\nprint(len(concatenated_content), \"characters\")"
      },
      "note": {
        "zh": "文档会在**每一次**生成（包括每次重试）时完整地发给模型。文档越长，花的 token 越多，所以只放真正需要的部分。`Path` 的用法见 10 节。",
        "en": "The docs go to the model in full on **every** generation, retries included. The longer they are, the more tokens you pay for, so include only what's needed. `Path` is covered in lesson 10."
      }
    },
    {
      "t": "h",
      "zh": "四、提示词和结构化输出：方案、导入、代码",
      "en": "4. Prompt and structured output: description, imports, code"
    },
    {
      "t": "p",
      "zh": "[▶ 04:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=280) 第一步是一条「生成代码」的链。提示词给模型定了角色（精通 LCEL 的编程助手），用 `{context}` 放进整份文档，要求代码能直接运行、包含所有 import 和变量，并且分三部分回答。[▶ 05:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=312) 接着定义数据模型：三个字段 `prefix`（问题和思路的说明）、`imports`、`code`。最后用 `with_structured_output` 让模型按这个格式交回一个**对象**，用 `solution.code` 就能取到代码。\n\nimports 和 code 分开，是为了检查时能先单独运行 import，一眼看出是缺库还是代码本身有错。",
      "en": "[▶ 04:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=280) Step one is a “generate code” chain. The prompt gives the model a role (a coding assistant who knows LCEL), inserts the whole doc text through `{context}`, demands code that runs as is with every import and variable, and asks for a three-part answer. [▶ 05:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=312) Next comes the data model with three fields: `prefix` (the problem and approach), `imports` and `code`. Finally `with_structured_output` makes the model return an **object** in that format, so `solution.code` is the code.\n\nImports and code are separate so the checker can run the imports alone first and tell a missing library from broken code at a glance."
    },
    {
      "t": "code",
      "file": "code_gen_chain.py",
      "code": {
        "zh": "from langchain_core.prompts import ChatPromptTemplate\nfrom langchain_deepseek import ChatDeepSeek\nfrom pydantic import BaseModel, Field\nfrom llm import API_KEY, MODEL\n\ncode_gen_prompt = ChatPromptTemplate.from_messages([\n    (\"system\",\n     \"你是精通 LCEL（LangChain 表达式语言）的编程助手。下面是 LCEL 的文档：\\n-------\\n{context}\\n-------\\n\"\n     \"请根据上面的文档回答用户的问题。确保你给出的代码可以直接运行，包含所有需要的 import 和变量定义。\"\n     \"回答分三部分：先描述解决方案，再列出 import 语句，最后给出完整、可运行的代码。\"\n     \"代码里不要调用真实的大模型，需要模型的地方用 RunnableLambda 写一个假模型代替。以下是用户的问题：\"),\n    (\"placeholder\", \"{messages}\"),          # 这里插入整段对话\n])\n\nclass CodeSolution(BaseModel):              # 视频里这个类叫 code\n    \"\"\"回答 LCEL 编程问题的代码方案。\"\"\"\n    prefix: str = Field(description=\"问题和解决思路的说明\")\n    imports: str = Field(description=\"代码需要的 import 语句\")\n    code: str = Field(description=\"不含 import 语句的代码\")\n\nllm = ChatDeepSeek(model=MODEL, api_key=API_KEY,\n                   extra_body={\"thinking\": {\"type\": \"disabled\"}})   # 原因见下面的「注意」\ncode_gen_chain = code_gen_prompt | llm.with_structured_output(CodeSolution)\n\nquestion = \"如何在 LCEL 中构建一个 RAG 链？\"\nsolution = code_gen_chain.invoke({\"context\": concatenated_content, \"messages\": [(\"user\", question)]})\nprint(type(solution).__name__)     # CodeSolution —— 是对象，不是字符串\nprint(solution.prefix)\nprint(solution.imports)\nprint(solution.code)",
        "en": "from langchain_core.prompts import ChatPromptTemplate\nfrom langchain_deepseek import ChatDeepSeek\nfrom pydantic import BaseModel, Field\nfrom llm import API_KEY, MODEL\n\ncode_gen_prompt = ChatPromptTemplate.from_messages([\n    (\"system\",\n     \"You are a coding assistant who knows LCEL (LangChain Expression Language) well. Here are the LCEL docs:\\n\"\n     \"-------\\n{context}\\n-------\\n\"\n     \"Answer the user's question from the docs above. Make sure the code runs as is, with every import \"\n     \"and variable it needs. Answer in three parts: describe the solution, list the imports, then give \"\n     \"complete runnable code. Don't call a real LLM in the code; use RunnableLambda as a fake model. \"\n     \"Here is the user's question:\"),\n    (\"placeholder\", \"{messages}\"),          # the whole conversation goes here\n])\n\nclass CodeSolution(BaseModel):              # the video calls this class code\n    \"\"\"A code answer to an LCEL programming question.\"\"\"\n    prefix: str = Field(description=\"the problem and the approach\")\n    imports: str = Field(description=\"the import statements the code needs\")\n    code: str = Field(description=\"the code without the import statements\")\n\nllm = ChatDeepSeek(model=MODEL, api_key=API_KEY,\n                   extra_body={\"thinking\": {\"type\": \"disabled\"}})   # see \"Watch out\" below\ncode_gen_chain = code_gen_prompt | llm.with_structured_output(CodeSolution)\n\nquestion = \"How do I build a RAG chain in LCEL?\"\nsolution = code_gen_chain.invoke({\"context\": concatenated_content, \"messages\": [(\"user\", question)]})\nprint(type(solution).__name__)     # CodeSolution - an object, not a string\nprint(solution.prefix)\nprint(solution.imports)\nprint(solution.code)"
      },
      "note": {
        "zh": "这段代码里有三样 LangChain 的东西，先照着用就行，后面会细讲：`ChatPromptTemplate` 里的 `{context}` 是要填的空，`(\"placeholder\", \"{messages}\")` 会把一整个消息列表插进来（45 节）；`|` 把模板和模型连成一条链，`code_gen_chain.invoke(字典)` 先填模板、再调用模型（48 节）。类名用 `CodeSolution` 而不是视频里的 `code`，是为了不和字段 `code` 混在一起。提示词最后一句「不要调用真实的大模型」是我们加的：检查时会真的运行代码，而运行环境里没有其他模型的 key。",
        "en": "Three LangChain pieces appear here; just use them for now, details come later: `{context}` in the `ChatPromptTemplate` is a blank to fill, and `(\"placeholder\", \"{messages}\")` inserts a whole list of messages (lesson 45); `|` joins template and model into a chain, and `code_gen_chain.invoke(a_dict)` fills the template, then calls the model (lesson 48). The class is `CodeSolution` instead of the video's `code` so it isn't confused with the `code` field. The prompt's last rule, “don't call a real LLM”, is ours: the checks really run the code, and there's no key for other models in that environment."
      }
    },
    {
      "t": "warn",
      "zh": "课程用的 deepseek-flash 默认开启**思考模式**。`with_structured_output` 默认靠函数调用实现：它通过 `tool_choice` **强制**模型调用一个叫 `CodeSolution` 的工具，思考模式不支持这种强制，请求直接失败：\n`Error code: 400 - Thinking mode does not support this tool_choice`\n\n解决办法（实测有效）：创建模型时关掉思考模式，`extra_body={\"thinking\": {\"type\": \"disabled\"}}`。结构化输出本来也不需要长时间思考，关掉后还更快。视频里同样用 DeepSeek 却没有报错：当时 DeepSeek 的对话模型默认不带思考模式。",
      "en": "The course's deepseek-flash runs in **thinking mode** by default. `with_structured_output` works through function calling by default: it **forces** the model, via `tool_choice`, to call a tool named `CodeSolution`. Thinking mode doesn't allow that, so the request fails:\n`Error code: 400 - Thinking mode does not support this tool_choice`\n\nThe fix (tested): switch thinking off when creating the model, `extra_body={\"thinking\": {\"type\": \"disabled\"}}`. Structured output needs no long deliberation anyway, and it gets faster. The video uses DeepSeek too and gets no error: DeepSeek's chat model of that time had no thinking mode by default."
    },
    {
      "t": "video",
      "zh": "[▶ 06:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=377) 老师用「怎样在 LCEL 里构建 RAG 链」测试这条链，得到的就是一个 `code` 对象：`prefix` 按提示词要求先列出步骤，`imports` 是要导入的包，`code` 是完整代码。\n\n[▶ 07:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=437) 接着他把模型换成 Claude 3 再做一遍对比：提示词基本一样；多了一个检查解析结果的函数，再用 `with_fallbacks` 接上一条备用链——主链出错时，把错误告诉模型、重新生成，最多重试 3 次。用 DeepSeek 关掉思考模式后结构化输出很稳定，这一段可以跳过；`with_fallbacks` 记住意思即可：**主链失败时自动改用备用链**。",
      "en": "[▶ 06:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=377) The instructor tests the chain with “how do I build a RAG chain in LCEL” and gets a `code` object back: `prefix` lists the steps as the prompt asked, `imports` holds the packages to import, `code` the full code.\n\n[▶ 07:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=437) He then repeats it with Claude 3 for comparison: nearly the same prompt, plus a function that checks the parsed result and `with_fallbacks` attaching a backup chain – when the main chain fails, the error goes back to the model and it regenerates, up to 3 retries. With DeepSeek and thinking off, structured output is reliable, so you can skip this part; just remember what `with_fallbacks` means: **switch to a backup chain when the main one fails**."
    },
    {
      "t": "h",
      "zh": "五、状态：哪些放进 messages，哪些单独放",
      "en": "5. The state: what goes into messages, what stands alone"
    },
    {
      "t": "p",
      "zh": "[▶ 09:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=563) 有了生成代码的链，就可以正式搭图了。第一步定义状态，四个字段：\n\n| 字段 | 存什么 | 谁会读它 |\n|---|---|---|\n| `error` | `\"yes\"` = 上一次检查没通过，`\"no\"` = 通过 | 条件边、generate |\n| `messages` | 用户的问题、模型的每一版答案、每次的错误说明 | 模型（每次生成都会读整段） |\n| `generation` | 最近一次生成的 `CodeSolution` | check_code |\n| `iterations` | 已经生成了几次 | 条件边 |\n\n[▶ 09:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=594) 另外两个常量：`max_iterations = 3`（最多生成 3 次）；`flag = \"do not reflect\"`（不开反思，老师说可以先忽略它）。",
      "en": "[▶ 09:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=563) With the generation chain ready, it's time to build the graph. First the state, with four fields:\n\n| Field | Holds | Read by |\n|---|---|---|\n| `error` | `\"yes\"` = the last check failed, `\"no\"` = passed | the conditional edge, generate |\n| `messages` | The question, every version of the answer, every error note | the model (it reads all of it on each attempt) |\n| `generation` | The latest `CodeSolution` | check_code |\n| `iterations` | How many attempts so far | the conditional edge |\n\n[▶ 09:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=594) Plus two constants: `max_iterations = 3` (at most 3 attempts) and `flag = \"do not reflect\"` (reflection off – the instructor says you can ignore it for now)."
    },
    {
      "t": "code",
      "file": "state.py",
      "code": {
        "zh": "from typing import TypedDict\n\nclass GraphState(TypedDict):\n    error: str                  # \"yes\" = 上一次检查没通过；\"no\" = 通过了\n    messages: list              # 问题、模型的答案、错误提示，都按顺序放在这里\n    generation: CodeSolution    # 最近一次生成的方案（prefix / imports / code）\n    iterations: int             # 已经生成了几次\n\nmax_iterations = 3              # 最多生成 3 次\nflag = \"do not reflect\"         # 改成 \"reflect\"，没通过时就先去反思节点",
        "en": "from typing import TypedDict\n\nclass GraphState(TypedDict):\n    error: str                  # \"yes\" = the last check failed; \"no\" = it passed\n    messages: list              # the question, the model's answers and the error notes, in order\n    generation: CodeSolution    # the latest solution (prefix / imports / code)\n    iterations: int             # how many attempts so far\n\nmax_iterations = 3              # at most 3 attempts\nflag = \"do not reflect\"         # set to \"reflect\" to visit the reflect node after a failure"
      },
      "note": {
        "zh": "这里的 `messages` 是**普通列表**，没有像 27–28 节那样加 reducer。节点返回 `{\"messages\": 新列表}` 时，新列表会**整个替换**旧的，所以节点里要先取出旧列表、接上新消息，再把完整的列表返回。视频写的是 `messages += [...]`（在原列表上追加）再返回，效果一样；这里用 `messages = messages + [...]` 生成新列表，不碰原来的状态，更不容易出错。",
        "en": "`messages` here is a **plain list** with no reducer (unlike lessons 27–28). When a node returns `{\"messages\": new_list}`, the new list **replaces** the old one entirely, so a node takes the old list, adds the new messages and returns the complete list. The video writes `messages += [...]` (appending in place) and returns it, with the same result; `messages = messages + [...]` builds a new list without touching the existing state, which is less error-prone."
      }
    },
    {
      "t": "h",
      "zh": "六、三个节点：生成、检查、反思",
      "en": "6. Three nodes: generate, check, reflect"
    },
    {
      "t": "p",
      "zh": "[▶ 10:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=625) **generate**：「状态进、状态出」。先取出 messages、iterations、error；如果 `error` 是 `\"yes\"`，说明这是重试，先补一句「请再试一次，按三部分作答」；然后调用生成链（文档 + 整段对话），把模型的答案也接进 messages，计数器加 1。",
      "en": "[▶ 10:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=625) **generate**: state in, state out. It reads messages, iterations and error; if `error` is `\"yes\"` this is a retry, so it first adds “try again, in three parts”; then it calls the generation chain (docs + the whole conversation), appends the model's answer to messages and adds 1 to the counter."
    },
    {
      "t": "code",
      "file": "generate.py",
      "code": {
        "zh": "def generate(state: GraphState):\n    print(\"---生成代码方案---\")\n    messages = state[\"messages\"]\n    iterations = state[\"iterations\"]\n    error = state[\"error\"]\n\n    if error == \"yes\":          # 上一次没通过：提醒模型重新按三部分作答\n        messages = messages + [(\"user\", \"请再试一次。按 prefix、imports、code 三部分给出完整的答案。\")]\n\n    code_solution = code_gen_chain.invoke({\"context\": concatenated_content, \"messages\": messages})\n    messages = messages + [\n        (\"assistant\", f\"{code_solution.prefix}\\n导入：{code_solution.imports}\\n代码：{code_solution.code}\")\n    ]\n    return {\"generation\": code_solution, \"messages\": messages, \"iterations\": iterations + 1}",
        "en": "def generate(state: GraphState):\n    print(\"---GENERATING CODE SOLUTION---\")\n    messages = state[\"messages\"]\n    iterations = state[\"iterations\"]\n    error = state[\"error\"]\n\n    if error == \"yes\":          # the last attempt failed: ask again for all three parts\n        messages = messages + [(\"user\", \"Try again. Give the complete answer as prefix, imports and code.\")]\n\n    code_solution = code_gen_chain.invoke({\"context\": concatenated_content, \"messages\": messages})\n    messages = messages + [\n        (\"assistant\", f\"{code_solution.prefix}\\nImports: {code_solution.imports}\\nCode: {code_solution.code}\")\n    ]\n    return {\"generation\": code_solution, \"messages\": messages, \"iterations\": iterations + 1}"
      }
    },
    {
      "t": "p",
      "zh": "[▶ 11:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=690) **code_check**：从 `generation` 里取出 imports 和 code（它们是 generate 放进去的），模拟一次运行：先单独运行 import，再运行 import + 代码。哪一步出错，就把「没有通过导入检查 / 执行检查」和错误说明作为一条用户消息接进 messages，并把 `error` 设为 `\"yes\"`；都通过就是 `\"no\"`。老师的说法是：这相当于给生成的代码配了一个自动化测试工具。",
      "en": "[▶ 11:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=690) **code_check**: it takes imports and code from `generation` (put there by generate) and simulates a run: the imports alone first, then imports + code. Whichever step fails, it appends “failed the import test / the execution test” plus the error as a user message and sets `error` to `\"yes\"`; if both pass it's `\"no\"`. As the instructor puts it, this is an automated test tool for the generated code."
    },
    {
      "t": "code",
      "file": "code_check.py",
      "code": {
        "zh": "def code_check(state: GraphState):\n    print(\"---检查代码---\")\n    messages = state[\"messages\"]\n    code_solution = state[\"generation\"]\n    imports = code_solution.imports\n    code = code_solution.code\n\n    try:                                    # 检查 1：import 能不能成功\n        exec(imports, {})\n    except Exception as e:\n        print(\"---导入检查没通过---\")\n        messages = messages + [(\"user\", f\"你的方案没有通过导入检查：{type(e).__name__}: {e}\")]\n        return {\"messages\": messages, \"error\": \"yes\"}\n\n    try:                                    # 检查 2：import + 代码能不能运行\n        exec(imports + \"\\n\" + code, {})\n    except Exception as e:\n        print(\"---执行检查没通过---\")\n        messages = messages + [(\"user\", f\"你的方案没有通过执行检查：{type(e).__name__}: {e}\")]\n        return {\"messages\": messages, \"error\": \"yes\"}\n\n    print(\"---没有发现错误---\")\n    return {\"error\": \"no\"}",
        "en": "def code_check(state: GraphState):\n    print(\"---CHECKING CODE---\")\n    messages = state[\"messages\"]\n    code_solution = state[\"generation\"]\n    imports = code_solution.imports\n    code = code_solution.code\n\n    try:                                    # check 1: do the imports work?\n        exec(imports, {})\n    except Exception as e:\n        print(\"---IMPORT CHECK FAILED---\")\n        messages = messages + [(\"user\", f\"Your solution failed the import test: {type(e).__name__}: {e}\")]\n        return {\"messages\": messages, \"error\": \"yes\"}\n\n    try:                                    # check 2: do imports + code run?\n        exec(imports + \"\\n\" + code, {})\n    except Exception as e:\n        print(\"---CODE EXECUTION FAILED---\")\n        messages = messages + [(\"user\", f\"Your solution failed the code execution test: {type(e).__name__}: {e}\")]\n        return {\"messages\": messages, \"error\": \"yes\"}\n\n    print(\"---NO CODE TEST FAILURES---\")\n    return {\"error\": \"no\"}"
      },
      "note": {
        "zh": "视频沿用官方教程的写法，节点每次都把 generation、messages、iterations、error 四个键全部返回；这里只返回**变了的键**（回顾 26–27 节），没返回的键保持原样，效果一样。",
        "en": "Following the official tutorial, the video's nodes return all four keys – generation, messages, iterations and error – every time; here a node returns only **the keys that changed** (see lessons 26–27). Keys left out stay as they were, so the result is the same."
      }
    },
    {
      "t": "p",
      "zh": "[▶ 12:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=751) **reflect**（默认不用）：把整段对话再交给生成链一次，让模型回顾「为什么会出错」，把这段反思作为 assistant 消息接进 messages，然后回到 generate。打开 `flag = \"reflect\"` 后，每次失败都多一次模型调用。",
      "en": "[▶ 12:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=751) **reflect** (off by default): it sends the whole conversation through the generation chain once more so the model reviews why it failed, appends that reflection as an assistant message, and the graph goes back to generate. With `flag = \"reflect\"`, every failure costs one extra model call."
    },
    {
      "t": "code",
      "file": "reflect.py",
      "code": {
        "zh": "def reflect(state: GraphState):\n    print(\"---反思错误原因---\")\n    messages = state[\"messages\"]\n    reflections = code_gen_chain.invoke({\"context\": concatenated_content, \"messages\": messages})\n    messages = messages + [(\"assistant\", f\"对错误的反思：{reflections.prefix}\")]\n    return {\"messages\": messages}",
        "en": "def reflect(state: GraphState):\n    print(\"---REFLECTING ON THE ERROR---\")\n    messages = state[\"messages\"]\n    reflections = code_gen_chain.invoke({\"context\": concatenated_content, \"messages\": messages})\n    messages = messages + [(\"assistant\", f\"Here are reflections on the error: {reflections.prefix}\")]\n    return {\"messages\": messages}"
      },
      "note": {
        "zh": "视频把整个反思对象原样写进消息；这里只取 `reflections.prefix`（说明那一部分），内容更干净。注意：反思用的还是同一条生成链，交回来的仍是一份 `CodeSolution`。我们用真实 API 试过反思这条路，它的 prefix 往往只是把解决思路重新写一遍，并不是真正的错误分析。想要更像样的反思，可以给它单独写一个提示词，比如「先指出上一版错在哪，再说怎么改」。",
        "en": "The video writes the whole reflection object into the message; here we keep only `reflections.prefix` (the description part), which is cleaner. Note that reflect reuses the same generation chain, so what comes back is still a `CodeSolution`. When we tried this path with the real API, its prefix mostly restated the approach rather than analysing the error. For a real reflection, give it a prompt of its own, e.g. “first say what was wrong with the last version, then how to fix it”."
      }
    },
    {
      "t": "h",
      "zh": "七、条件边和整张图",
      "en": "7. The conditional edge and the whole graph"
    },
    {
      "t": "p",
      "zh": "[▶ 13:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=782) 条件边 `decide_to_finish` 读两个字段：`error` 是 `\"no\"`，或者 `iterations` 已经到了 `max_iterations`，就返回 `\"end\"`；否则要重试——`flag` 是 `\"reflect\"` 就去反思节点，不是就直接回到生成节点。\n\n[▶ 14:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=843) 组装：三个节点加进去，`START → generate → check_code`，`check_code` 后面接条件边，`reflect → generate`，形成一个闭环。`add_conditional_edges` 的第三个参数是**路径映射**：把路由函数返回的短名字对应到真正的节点，`\"end\"` 对应 `END`。",
      "en": "[▶ 13:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=782) The conditional edge `decide_to_finish` reads two fields: if `error` is `\"no\"` or `iterations` has reached `max_iterations`, it returns `\"end\"`; otherwise it's a retry – to the reflect node when `flag` is `\"reflect\"`, else straight back to generate.\n\n[▶ 14:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=843) Wiring: add the three nodes, `START → generate → check_code`, the conditional edge after `check_code`, and `reflect → generate`, closing the loop. The third argument of `add_conditional_edges` is a **path map**: it maps the short names the router returns to real nodes, with `\"end\"` mapped to `END`."
    },
    {
      "t": "code",
      "file": "build_graph.py",
      "code": {
        "zh": "from langgraph.graph import END, START, StateGraph\n\ndef decide_to_finish(state: GraphState):\n    error = state[\"error\"]\n    iterations = state[\"iterations\"]\n    if error == \"no\" or iterations >= max_iterations:\n        print(\"---决定：结束---\")\n        return \"end\"\n    print(\"---决定：重试---\")\n    if flag == \"reflect\":\n        return \"reflect\"\n    return \"generate\"\n\nworkflow = StateGraph(GraphState)\nworkflow.add_node(\"generate\", generate)\nworkflow.add_node(\"check_code\", code_check)       # 节点名 check_code，函数名 code_check\nworkflow.add_node(\"reflect\", reflect)\nworkflow.add_edge(START, \"generate\")\nworkflow.add_edge(\"generate\", \"check_code\")\nworkflow.add_conditional_edges(\n    \"check_code\",\n    decide_to_finish,\n    {\"end\": END, \"reflect\": \"reflect\", \"generate\": \"generate\"},   # 路由函数的返回值 → 节点\n)\nworkflow.add_edge(\"reflect\", \"generate\")\napp = workflow.compile()",
        "en": "from langgraph.graph import END, START, StateGraph\n\ndef decide_to_finish(state: GraphState):\n    error = state[\"error\"]\n    iterations = state[\"iterations\"]\n    if error == \"no\" or iterations >= max_iterations:\n        print(\"---DECISION: FINISH---\")\n        return \"end\"\n    print(\"---DECISION: RE-TRY SOLUTION---\")\n    if flag == \"reflect\":\n        return \"reflect\"\n    return \"generate\"\n\nworkflow = StateGraph(GraphState)\nworkflow.add_node(\"generate\", generate)\nworkflow.add_node(\"check_code\", code_check)       # node name check_code, function name code_check\nworkflow.add_node(\"reflect\", reflect)\nworkflow.add_edge(START, \"generate\")\nworkflow.add_edge(\"generate\", \"check_code\")\nworkflow.add_conditional_edges(\n    \"check_code\",\n    decide_to_finish,\n    {\"end\": END, \"reflect\": \"reflect\", \"generate\": \"generate\"},   # router return value -> node\n)\nworkflow.add_edge(\"reflect\", \"generate\")\napp = workflow.compile()"
      },
      "note": {
        "zh": "视频的判断写的是 `iterations == max_iterations`。这里用 `>=`：万一计数器跳过了 3（比如以后改成每次加 2），`==` 永远等不到，图就停不下来。",
        "en": "The video checks `iterations == max_iterations`. We use `>=`: if the counter ever skips past 3 (say you later add 2 per round), `==` never matches and the graph never stops."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "`decide_to_finish` 里如果去掉 `iterations >= max_iterations`，而模型一直改不对，会发生什么？",
        "en": "If `decide_to_finish` lost `iterations >= max_iterations` and the model never gets it right, what happens?"
      },
      "options": [
        {
          "zh": "LangGraph 会在第 3 次后自动停止",
          "en": "LangGraph stops automatically after 3 attempts"
        },
        {
          "zh": "编译图的时候就报错",
          "en": "Compiling the graph fails"
        },
        {
          "zh": "图会一直循环调用模型，直到撞上 LangGraph 的递归上限才报错，期间一直在花钱",
          "en": "The graph keeps calling the model until LangGraph's recursion limit stops it with an error, spending money all along"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "LangGraph 不知道你的业务规则，只有一个很宽的安全上限：本课程装的 1.2.12 默认递归上限是 10007 步（老版本是 25），相当于几千次模型调用。重试上限要自己写。",
        "en": "LangGraph doesn't know your rules; it only has a generous safety limit – the installed 1.2.12 defaults to 10007 steps (older versions used 25), i.e. thousands of model calls. Write your own retry cap."
      }
    },
    {
      "t": "tip",
      "zh": "想看图长什么样：`print(app.get_graph().draw_mermaid())`，把输出贴到 [mermaid.live](https://mermaid.live)。你会看到 `check_code` 伸出三条虚线（条件边），分别指向 `__end__`、`generate` 和 `reflect`，`reflect` 再连回 `generate`。",
      "en": "To see the graph: `print(app.get_graph().draw_mermaid())`, then paste the output into [mermaid.live](https://mermaid.live). Three dashed arrows (the conditional edge) leave `check_code` for `__end__`, `generate` and `reflect`, and `reflect` links back to `generate`."
    },
    {
      "t": "h",
      "zh": "八、运行：两个测试问题",
      "en": "8. Running it: two test questions"
    },
    {
      "t": "p",
      "zh": "[▶ 14:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=875) 运行时传入初始状态：问题放进 messages，`iterations` 从 0 开始，`error` 先给空字符串。`generation` 不用给，因为第一个节点 generate 不读它，它会把 generation 写进去。\n\n视频里的第一个问题是「怎样把原始输入直接传给 Runnable」：生成后检查失败、重试，来回几轮才结束，老师觉得最后的答案不太好。[▶ 15:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=939) 于是换了一个更具体的问题「怎样并行执行两条链」，这次给出了 `RunnableParallel`，代码也能运行。",
      "en": "[▶ 14:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=875) Run it with a start state: the question goes into messages, `iterations` starts at 0 and `error` at an empty string. `generation` isn't needed: the first node, generate, doesn't read it – it writes it.\n\nThe video's first question is how to pass the raw input straight to a Runnable: the check fails, it retries, and after several rounds it finishes with an answer the instructor finds mediocre. [▶ 15:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=939) So he asks something more specific – how to run two chains in parallel – and this time gets `RunnableParallel` with code that runs."
    },
    {
      "t": "code",
      "file": "run.py",
      "code": {
        "zh": "question = \"如何用 LCEL 并行执行两条链？\"\nsolution = app.invoke({\"messages\": [(\"user\", question)], \"iterations\": 0, \"error\": \"\"})\n\nfinal = solution[\"generation\"]\nprint(\"生成了\", solution[\"iterations\"], \"次；最后一次检查：\", solution[\"error\"])\nprint(final.prefix)\nprint(final.imports)\nprint(final.code)",
        "en": "question = \"How do I run two chains in parallel with LCEL?\"\nsolution = app.invoke({\"messages\": [(\"user\", question)], \"iterations\": 0, \"error\": \"\"})\n\nfinal = solution[\"generation\"]\nprint(\"attempts:\", solution[\"iterations\"], \"| last check error:\", solution[\"error\"])\nprint(final.prefix)\nprint(final.imports)\nprint(final.code)"
      }
    },
    {
      "t": "p",
      "zh": "下面是练习文件 `l40_code_assistant_solution.py` 真实运行一次的输出（有删节）。第一版代码把一个普通字典当成 Runnable 调用 `.invoke`，执行检查没通过；模型看到错误后在第二版里改正，检查通过：",
      "en": "Below is the (shortened) output of a real run of `l40_code_assistant_solution.py`. The first version called `.invoke` on a plain dict as if it were a Runnable and failed the execution check; seeing the error, the model fixed it in the second version, which passed:"
    },
    {
      "t": "code",
      "file": {
        "zh": "输出示例",
        "en": "sample output (translated)"
      },
      "lang": "text",
      "code": {
        "zh": "---生成代码方案 / GENERATING CODE SOLUTION---\n  prefix: 用 LCEL 并行执行两条链，靠的是 RunnableParallel：把同一个输入同时交给几个 Runnable……\n---检查代码 / CHECKING CODE---\n---执行检查没通过 / CODE EXECUTION FAILED---\n  AttributeError: 'dict' object has no attribute 'invoke'\n---决定：重试 / DECISION: RE-TRY SOLUTION---\n---生成代码方案 / GENERATING CODE SOLUTION---\n  prefix: 执行报错是因为 both2 = {\"upper\": upper, \"length\": length} 得到的是普通 dict，dict 没有 .invoke……\n---检查代码 / CHECKING CODE---\n---没有发现错误 / NO CODE TEST FAILURES---\n---决定：结束 / DECISION: FINISH---\n\n========== 结果 / result ==========\n生成次数 / attempts: 2 | 通过 / passed\n----- imports -----\nfrom langchain_core.output_parsers import StrOutputParser\nfrom langchain_core.prompts import ChatPromptTemplate\nfrom langchain_core.runnables import RunnableLambda, RunnableParallel, RunnablePassthrough\n----- code -----\nupper = RunnableLambda(lambda s: s.upper())\nlength = RunnableLambda(lambda s: len(s))\n\n# 用 RunnableParallel 并行执行这两条链\nboth = RunnableParallel(upper=upper, length=length)\nprint(\"并行结果:\", both.invoke(\"lcel\"))       # {'upper': 'LCEL', 'length': 4}\n...",
        "en": "---GENERATING CODE SOLUTION---\n  prefix: To run two chains in parallel with LCEL, use RunnableParallel: it hands the same input to several Runnables at once…\n---CHECKING CODE---\n---CODE EXECUTION FAILED---\n  AttributeError: 'dict' object has no attribute 'invoke'\n---DECISION: RE-TRY SOLUTION---\n---GENERATING CODE SOLUTION---\n  prefix: The error came from both2 = {\"upper\": upper, \"length\": length}, which is a plain dict, and a dict has no .invoke…\n---CHECKING CODE---\n---NO CODE TEST FAILURES---\n---DECISION: FINISH---\n\n========== result ==========\nattempts: 2 | passed\n----- imports -----\nfrom langchain_core.output_parsers import StrOutputParser\nfrom langchain_core.prompts import ChatPromptTemplate\nfrom langchain_core.runnables import RunnableLambda, RunnableParallel, RunnablePassthrough\n----- code -----\nupper = RunnableLambda(lambda s: s.upper())\nlength = RunnableLambda(lambda s: len(s))\n\n# run the two chains in parallel with RunnableParallel\nboth = RunnableParallel(upper=upper, length=length)\nprint(\"parallel result:\", both.invoke(\"lcel\"))       # {'upper': 'LCEL', 'length': 4}\n..."
      }
    },
    {
      "t": "h",
      "zh": "九、老师的总结：状态和流程要一起设计",
      "en": "9. The instructor's recap: design the state and the flow together"
    },
    {
      "t": "p",
      "zh": "[▶ 16:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=1007) 回头看整张图：用户的问题进来后先参考文档（相当于一次 RAG 检索），再生成方案和代码，代码被真的运行一遍；失败时，开了反思就先分析为什么错，再重新生成；没有错误就得到最终方案。\n\n[▶ 17:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=1038) 老师强调的重点是**条件边的设计**：它靠 `error` 和 `iterations` 两个字段做判断，所以流程设计离不开状态设计。动手之前先想清楚：\n- **放进 messages 的**：模型需要读的东西——问题、它自己写过的答案、错误说明\n- **单独放一个字段的**：程序做判断要用的东西——是否出错、试了几次、最近一次的代码",
      "en": "[▶ 16:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=1007) Looking back at the whole graph: the question first consults the docs (essentially a RAG retrieval), then a solution with code is generated and actually run; on failure, with reflection on, the model first analyses why, then regenerates; with no error you have the final solution.\n\n[▶ 17:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=41&t=1038) The point the instructor stresses is **the design of the conditional edge**: it decides from `error` and `iterations`, so designing the flow means designing the state. Before coding, decide:\n- **What goes into messages**: what the model must read – the question, its own previous answers, the error notes\n- **What gets its own field**: what the program needs for decisions – whether it failed, how many tries, the latest code"
    },
    {
      "t": "h",
      "zh": "十、补充：模型写的代码不能随便运行",
      "en": "10. Extra: don't just run model-written code"
    },
    {
      "t": "warn",
      "zh": "`exec()` 运行的代码拥有**和你一样的权限**：可以删除文件、读取你的 key、联网上传数据，也可能写成死循环把程序卡住。模型一般不会故意这么做，但需求本身可能是恶意的，模型也可能写错。\n\n基本防护（从易到难）：\n1. 在提示词里限制：不读写文件、不联网\n2. 放到**子进程**里运行，加上**超时**，在临时文件夹里运行——能防死循环和崩溃，防不了恶意代码\n3. 运行前让人看一眼：用 34–35 节的 `interrupt` 暂停，确认后再运行\n4. 真正的隔离：在 Docker 容器或云端沙盒里运行（42 节视频里的小浪就用了云端代码沙盒 Riza）",
      "en": "Code run by `exec()` has **your permissions**: it can delete files, read your key, send data over the network, or loop forever and freeze the program. Models rarely do this on purpose, but the request itself may be malicious and the model can simply get it wrong.\n\nBasic safeguards, easiest first:\n1. Restrict it in the prompt: no files, no network\n2. Run it in a **subprocess** with a **timeout**, inside a temporary folder – this stops endless loops and crashes, not malicious code\n3. Let a person look first: pause with `interrupt` (lessons 34–35) and run only after approval\n4. Real isolation: a Docker container or a cloud sandbox (Xiaolang in lesson 42's video uses the Riza cloud code sandbox)"
    },
    {
      "t": "p",
      "zh": "练习文件用的是第 2 种：写一个 `run_program()`，用 `subprocess.run` 另起一个 Python 进程运行代码。`returncode` 不是 0 就表示出错了，错误信息在 `stderr` 里，只取最后几行（最关键的部分）交给模型。`code_check` 里的两次 `exec` 换成两次 `run_program`，其余不变。",
      "en": "The practice file uses option 2: a `run_program()` helper runs the code in a separate Python process with `subprocess.run`. A non-zero `returncode` means failure; the error text is in `stderr`, and only its last lines (the important part) go to the model. In `code_check` the two `exec` calls become two `run_program` calls; nothing else changes."
    },
    {
      "t": "code",
      "file": "run_program.py",
      "code": {
        "zh": "import subprocess\nimport sys\nimport tempfile\n\ndef run_program(program):\n    \"\"\"在子进程里运行代码（10 秒超时）。出错返回错误说明，没出错返回空字符串。\"\"\"\n    with tempfile.TemporaryDirectory() as workdir:          # 临时文件夹，用完自动删除\n        try:\n            result = subprocess.run(\n                [sys.executable, \"-X\", \"utf8\", \"-c\", program],   # 另起一个 Python 进程\n                capture_output=True, text=True, encoding=\"utf-8\", errors=\"replace\",\n                timeout=10, cwd=workdir,                         # 最多 10 秒，在临时文件夹里运行\n            )\n        except subprocess.TimeoutExpired:\n            return \"运行超过 10 秒还没结束，可能写成了死循环。\"\n    if result.returncode != 0:                               # 不是 0 = 出错退出\n        return \"\\n\".join(result.stderr.strip().splitlines()[-4:])   # 报错的最后几行\n    return \"\"\n\n# code_check 里把两次 exec 换成：\n#   error = run_program(imports)                  → 检查 1\n#   error = run_program(imports + \"\\n\" + code)    → 检查 2\n#   if error: ……写进 messages，返回 error 为 \"yes\"",
        "en": "import subprocess\nimport sys\nimport tempfile\n\ndef run_program(program):\n    \"\"\"Run code in a subprocess (10 s timeout). Return the error text, or \"\" if it ran fine.\"\"\"\n    with tempfile.TemporaryDirectory() as workdir:          # a temp folder, deleted afterwards\n        try:\n            result = subprocess.run(\n                [sys.executable, \"-X\", \"utf8\", \"-c\", program],   # a separate Python process\n                capture_output=True, text=True, encoding=\"utf-8\", errors=\"replace\",\n                timeout=10, cwd=workdir,                         # at most 10 s, inside the temp folder\n            )\n        except subprocess.TimeoutExpired:\n            return \"Still running after 10 seconds - probably an endless loop.\"\n    if result.returncode != 0:                               # non-zero = exited with an error\n        return \"\\n\".join(result.stderr.strip().splitlines()[-4:])   # the last lines of the traceback\n    return \"\"\n\n# In code_check, replace the two exec calls with:\n#   error = run_program(imports)                  -> check 1\n#   error = run_program(imports + \"\\n\" + code)    -> check 2\n#   if error: ...add it to messages and return error \"yes\""
      },
      "note": {
        "zh": "`sys.executable` 是当前 Python 解释器的路径（子进程里也能用同一个虚拟环境的库）；`-X utf8` 让子进程用 UTF-8 输出中文；`with tempfile.TemporaryDirectory() as workdir` 建一个临时文件夹，`with` 结束时自动删除（`with` 见 10 节）。`splitlines()` 把报错切成行，`[-4:]` 取最后 4 行，`\"\\n\".join(...)` 再连回一个字符串。",
        "en": "`sys.executable` is the current interpreter's path (so the child sees the same virtual environment's libraries); `-X utf8` makes the child print UTF-8; `with tempfile.TemporaryDirectory() as workdir` creates a temp folder that is deleted when the `with` block ends (`with`: lesson 10). `splitlines()` cuts the error into lines, `[-4:]` keeps the last four, and `\"\\n\".join(...)` joins them back into one string."
      }
    },
    {
      "t": "note",
      "zh": "可以继续加的功能：\n- 像老师建议的那样，把参考文档换成你常用的库的文档或团队的编码规范\n- 把 `flag` 改成 `\"reflect\"`，比较一下打开反思后成功率和调用次数的变化\n- 用 `input()` 读问题，做成能连续提问的终端工具\n- 让 `code_check` 运行你自己准备的测试用例，而不只是看代码能不能跑",
      "en": "Ideas to extend it:\n- As the instructor suggests, swap in the docs of a library you use or your team's coding standards\n- Set `flag` to `\"reflect\"` and compare success rate and number of calls\n- Read questions with `input()` for a terminal tool you can keep asking\n- Make `code_check` run test cases you prepare, not just check that the code runs"
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "视频的 `code_check` 为什么先单独 `exec(imports)`，再 `exec(imports + \"\\n\" + code)`？",
        "en": "Why does the video's `code_check` run `exec(imports)` alone before `exec(imports + \"\\n\" + code)`?"
      },
      "options": [
        {
          "zh": "只运行一次会报错",
          "en": "Running once raises an error"
        },
        {
          "zh": "这样能分清是 import 有问题（库没装、名字写错）还是代码本身有问题，交给模型的错误说明更准确",
          "en": "It tells an import problem (missing library, wrong name) from a problem in the code itself, so the error note for the model is more precise"
        },
        {
          "zh": "exec 一次只能运行一行",
          "en": "exec can only run one line at a time"
        },
        {
          "zh": "为了让 iterations 多加 1",
          "en": "So iterations goes up by one more"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "两项检查对应两种失败：「没有通过导入检查」和「没有通过执行检查」。错误说明越具体，模型越知道该改哪里。",
        "en": "The two checks match two kinds of failure: “failed the import test” and “failed the execution test”. The more specific the note, the better the model knows what to fix."
      }
    },
    {
      "q": {
        "zh": "`add_conditional_edges(\"check_code\", decide_to_finish, {\"end\": END, \"reflect\": \"reflect\", \"generate\": \"generate\"})` 里的字典是做什么的？",
        "en": "What does the dict in `add_conditional_edges(\"check_code\", decide_to_finish, {\"end\": END, \"reflect\": \"reflect\", \"generate\": \"generate\"})` do?"
      },
      "options": [
        {
          "zh": "给三个节点设置初始状态",
          "en": "It sets start states for three nodes"
        },
        {
          "zh": "规定每个节点最多运行几次",
          "en": "It caps how often each node runs"
        },
        {
          "zh": "没有作用，可以随便写",
          "en": "Nothing; it can be anything"
        },
        {
          "zh": "路径映射：把路由函数返回的名字对应到真正的节点，比如 \"end\" → END",
          "en": "A path map: it maps the names the router returns to real nodes, e.g. \"end\" → END"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "路由函数只返回短名字；映射告诉 LangGraph 每个名字去哪个节点，也让它能检查和画出所有可能的去向。",
        "en": "The router returns short names; the map tells LangGraph where each name leads and lets it validate and draw every possible destination."
      }
    },
    {
      "q": {
        "zh": "用 deepseek-flash 运行 `llm.with_structured_output(CodeSolution)` 报 400：`Thinking mode does not support this tool_choice`。最直接的修复是？",
        "en": "With deepseek-flash, `llm.with_structured_output(CodeSolution)` fails with 400 `Thinking mode does not support this tool_choice`. The most direct fix?"
      },
      "options": [
        {
          "zh": "创建模型时加上 `extra_body={\"thinking\": {\"type\": \"disabled\"}}` 关掉思考模式",
          "en": "Create the model with `extra_body={\"thinking\": {\"type\": \"disabled\"}}` to switch thinking off"
        },
        {
          "zh": "把 max_iterations 调大",
          "en": "Raise max_iterations"
        },
        {
          "zh": "把 CodeSolution 的字段都改成 int",
          "en": "Make every CodeSolution field an int"
        },
        {
          "zh": "去掉提示词里的文档",
          "en": "Remove the docs from the prompt"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "结构化输出会强制模型调用指定的工具，DeepSeek 的思考模式不支持这种强制；关掉思考模式就好了。",
        "en": "Structured output forces a specific tool call, which DeepSeek's thinking mode doesn't support; switching thinking off solves it."
      }
    },
    {
      "q": {
        "zh": "`messages` 在这里是普通列表（没有 reducer）。如果 generate 只返回 `{\"messages\": [这次的答案]}`，会怎样？",
        "en": "Here `messages` is a plain list (no reducer). What if generate returned only `{\"messages\": [this answer]}`?"
      },
      "options": [
        {
          "zh": "LangGraph 会自动把它追加到旧列表后面",
          "en": "LangGraph appends it to the old list automatically"
        },
        {
          "zh": "程序报错",
          "en": "The program crashes"
        },
        {
          "zh": "整段对话被替换成只有这一条，下次重试时模型看不到原来的问题和错误说明",
          "en": "The whole conversation is replaced by that one message, so the next retry can't see the question or the error notes"
        },
        {
          "zh": "没有影响",
          "en": "No effect"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "没有 reducer 的键，新值直接覆盖旧值。所以节点要返回「旧列表 + 新消息」的完整列表；想要自动追加，就得像 27–28 节那样加 reducer。",
        "en": "Without a reducer the new value overwrites the old one, so a node must return the full “old list + new messages”. For automatic appending you'd add a reducer as in lessons 27–28."
      }
    },
    {
      "q": {
        "zh": "`flag = \"do not reflect\"`，代码没通过检查，而且 `iterations` 还没到上限。下一步去哪？",
        "en": "`flag = \"do not reflect\"`, the code failed, and `iterations` is below the cap. Where next?"
      },
      "options": [
        {
          "zh": "END",
          "en": "END"
        },
        {
          "zh": "generate：直接带着错误说明重新生成",
          "en": "generate: regenerate straight away with the error note"
        },
        {
          "zh": "reflect",
          "en": "reflect"
        },
        {
          "zh": "check_code",
          "en": "check_code"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "没开反思时，失败就直接回到 generate；只有 `flag == \"reflect\"` 才先去 reflect。",
        "en": "With reflection off, a failure goes straight back to generate; only `flag == \"reflect\"` visits reflect first."
      }
    },
    {
      "q": {
        "zh": "把检查改成「子进程 + `timeout=10`」运行模型写的代码，能防住哪种情况？",
        "en": "Running model-written code in a subprocess with `timeout=10` protects against which case?"
      },
      "options": [
        {
          "zh": "代码删除你的文件",
          "en": "The code deletes your files"
        },
        {
          "zh": "代码偷偷联网上传数据",
          "en": "The code secretly uploads data"
        },
        {
          "zh": "代码写成死循环，把整个程序卡住",
          "en": "The code loops forever and freezes the whole program"
        },
        {
          "zh": "以上全部",
          "en": "All of the above"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "超时只能防「跑不完」。子进程的权限和你一样，删文件、联网照样能做；要防这些，需要容器或沙盒。",
        "en": "A timeout only stops code that never finishes. The subprocess has your permissions, so it can still delete files or use the network; that needs a container or sandbox."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "生成链和结构化输出",
        "en": "The generation chain and structured output"
      },
      "code": {
        "zh": "class CodeSolution([[BaseModel]]):\n    prefix: str = [[Field]](description=\"问题和思路的说明\")\n    [[imports]]: str = Field(description=\"import 语句\")\n    code: str = Field(description=\"不含 import 的代码\")\n\nllm = ChatDeepSeek(model=MODEL, api_key=API_KEY,\n                   extra_body={\"thinking\": {\"type\": \"[[disabled]]\"}})\ncode_gen_chain = code_gen_prompt | llm.[[with_structured_output]](CodeSolution)\nsolution = code_gen_chain.invoke({\"[[context]]\": concatenated_content, \"messages\": [(\"user\", question)]})\nprint(solution.[[code]])",
        "en": "class CodeSolution([[BaseModel]]):\n    prefix: str = [[Field]](description=\"the problem and the approach\")\n    [[imports]]: str = Field(description=\"the import statements\")\n    code: str = Field(description=\"the code without imports\")\n\nllm = ChatDeepSeek(model=MODEL, api_key=API_KEY,\n                   extra_body={\"thinking\": {\"type\": \"[[disabled]]\"}})\ncode_gen_chain = code_gen_prompt | llm.[[with_structured_output]](CodeSolution)\nsolution = code_gen_chain.invoke({\"[[context]]\": concatenated_content, \"messages\": [(\"user\", question)]})\nprint(solution.[[code]])"
      },
      "explain": {
        "zh": "三个字段 prefix / imports / code；DeepSeek 关掉思考模式；`{context}` 填文档，`messages` 填对话；返回的是对象，用点号取字段。",
        "en": "Three fields, prefix / imports / code; thinking off for DeepSeek; `{context}` gets the docs and `messages` the conversation; the result is an object, read with a dot."
      }
    },
    {
      "title": {
        "zh": "条件边和组装",
        "en": "The conditional edge and wiring"
      },
      "code": {
        "zh": "def decide_to_finish(state):\n    if state[\"error\"] == \"[[no]]\" or state[\"iterations\"] >= [[max_iterations]]:\n        return \"end\"\n    if flag == \"reflect\":\n        return \"[[reflect]]\"\n    return \"generate\"\n\nworkflow = StateGraph(GraphState)\nworkflow.add_node(\"generate\", generate)\nworkflow.add_node(\"check_code\", [[code_check]])\nworkflow.add_node(\"reflect\", reflect)\nworkflow.add_edge([[START]], \"generate\")\nworkflow.add_edge(\"generate\", \"check_code\")\nworkflow.[[add_conditional_edges]](\"check_code\", decide_to_finish,\n                               {\"end\": [[END]], \"reflect\": \"reflect\", \"generate\": \"generate\"})\nworkflow.add_edge(\"reflect\", \"[[generate]]\")\napp = workflow.[[compile]]()",
        "en": "def decide_to_finish(state):\n    if state[\"error\"] == \"[[no]]\" or state[\"iterations\"] >= [[max_iterations]]:\n        return \"end\"\n    if flag == \"reflect\":\n        return \"[[reflect]]\"\n    return \"generate\"\n\nworkflow = StateGraph(GraphState)\nworkflow.add_node(\"generate\", generate)\nworkflow.add_node(\"check_code\", [[code_check]])\nworkflow.add_node(\"reflect\", reflect)\nworkflow.add_edge([[START]], \"generate\")\nworkflow.add_edge(\"generate\", \"check_code\")\nworkflow.[[add_conditional_edges]](\"check_code\", decide_to_finish,\n                               {\"end\": [[END]], \"reflect\": \"reflect\", \"generate\": \"generate\"})\nworkflow.add_edge(\"reflect\", \"[[generate]]\")\napp = workflow.[[compile]]()"
      },
      "explain": {
        "zh": "通过或次数用完 → \"end\"（映射到 END）；否则看开关去 reflect 或 generate；reflect 之后回到 generate。",
        "en": "Passed or out of attempts → \"end\" (mapped to END); otherwise reflect or generate by the switch; reflect leads back to generate."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：两项检查的 code_check",
        "en": "Write it: code_check with two checks"
      },
      "task": {
        "zh": "不看上面的代码，写出视频里的 `code_check(state)`：\n1. 检查 1：在 `try` 里只运行 `code_solution.imports`（`exec`，第二个参数给空字典）；出错时，在 messages 后面接一条 `(\"user\", \"你的方案没有通过导入检查：...\")`，返回 `{\"messages\": ..., \"error\": \"yes\"}`\n2. 检查 2：运行 imports + 换行 + code，出错同样处理（「执行检查」）\n3. 都通过：返回 `{\"error\": \"no\"}`\n\n点 ▶ 运行：第一个应该是 no，第二个导入检查失败，第三个执行检查失败（ZeroDivisionError）。",
        "en": "Without looking above, write the video's `code_check(state)`:\n1. Check 1: inside `try`, run only `code_solution.imports` (`exec`, with an empty dict); on failure append `(\"user\", \"Your solution failed the import test: ...\")` to messages and return `{\"messages\": ..., \"error\": \"yes\"}`\n2. Check 2: run imports + a newline + code; handle failure the same way (“execution test”)\n3. Both passed: return `{\"error\": \"no\"}`\n\nPress ▶ Run: the first should give no, the second fails the import check, the third the execution check (ZeroDivisionError)."
      },
      "run": true,
      "starter": {
        "zh": "class Solution:                     # 代替模型返回的 CodeSolution，只有两个属性\n    def __init__(self, imports, code):\n        self.imports = imports\n        self.code = code\n\ndef code_check(state):\n    \"\"\"两项检查。没通过：在 messages 后面加一条 (\"user\", 错误说明)，error 为 yes；通过：error 为 no。\"\"\"\n    messages = state[\"messages\"]\n    code_solution = state[\"generation\"]\n    # TODO 1. 检查 1：在 try 里只运行 imports（exec，第二个参数给空字典）\n    #         出错：messages 加上一条错误说明，返回 messages 和 error\n    # TODO 2. 检查 2：在 try 里运行 imports + 换行 + code，出错同样处理\n    # TODO 3. 都通过：返回 error\n\n\ntests = [\n    Solution(\"import math\", \"assert math.sqrt(16) == 4\"),\n    Solution(\"import maths\", \"print(maths.pi)\"),\n    Solution(\"import math\", \"print(math.pi / 0)\"),\n]\nfor s in tests:\n    result = code_check({\"messages\": [], \"generation\": s})\n    print(result[\"error\"], result.get(\"messages\"))",
        "en": "class Solution:                     # stands in for the model's CodeSolution: just two attributes\n    def __init__(self, imports, code):\n        self.imports = imports\n        self.code = code\n\ndef code_check(state):\n    \"\"\"Two checks. On failure add (\"user\", error text) to messages and set error to yes; on success error is no.\"\"\"\n    messages = state[\"messages\"]\n    code_solution = state[\"generation\"]\n    # TODO 1. check 1: inside try, run only the imports (exec, with an empty dict)\n    #         on failure: add an error message to messages, return messages and error\n    # TODO 2. check 2: inside try, run imports + a newline + code; handle failure the same way\n    # TODO 3. both passed: return error\n\n\ntests = [\n    Solution(\"import math\", \"assert math.sqrt(16) == 4\"),\n    Solution(\"import maths\", \"print(maths.pi)\"),\n    Solution(\"import math\", \"print(math.pi / 0)\"),\n]\nfor s in tests:\n    result = code_check({\"messages\": [], \"generation\": s})\n    print(result[\"error\"], result.get(\"messages\"))"
      },
      "solution": {
        "zh": "class Solution:                     # 代替模型返回的 CodeSolution，只有两个属性\n    def __init__(self, imports, code):\n        self.imports = imports\n        self.code = code\n\ndef code_check(state):\n    \"\"\"两项检查。没通过：在 messages 后面加一条 (\"user\", 错误说明)，error 为 yes；通过：error 为 no。\"\"\"\n    messages = state[\"messages\"]\n    code_solution = state[\"generation\"]\n    try:\n        exec(code_solution.imports, {})\n    except Exception as e:\n        messages = messages + [(\"user\", f\"你的方案没有通过导入检查：{type(e).__name__}: {e}\")]\n        return {\"messages\": messages, \"error\": \"yes\"}\n    try:\n        exec(code_solution.imports + \"\\n\" + code_solution.code, {})\n    except Exception as e:\n        messages = messages + [(\"user\", f\"你的方案没有通过执行检查：{type(e).__name__}: {e}\")]\n        return {\"messages\": messages, \"error\": \"yes\"}\n    return {\"error\": \"no\"}\n\n\ntests = [\n    Solution(\"import math\", \"assert math.sqrt(16) == 4\"),\n    Solution(\"import maths\", \"print(maths.pi)\"),\n    Solution(\"import math\", \"print(math.pi / 0)\"),\n]\nfor s in tests:\n    result = code_check({\"messages\": [], \"generation\": s})\n    print(result[\"error\"], result.get(\"messages\"))",
        "en": "class Solution:                     # stands in for the model's CodeSolution: just two attributes\n    def __init__(self, imports, code):\n        self.imports = imports\n        self.code = code\n\ndef code_check(state):\n    \"\"\"Two checks. On failure add (\"user\", error text) to messages and set error to yes; on success error is no.\"\"\"\n    messages = state[\"messages\"]\n    code_solution = state[\"generation\"]\n    try:\n        exec(code_solution.imports, {})\n    except Exception as e:\n        messages = messages + [(\"user\", f\"Your solution failed the import test: {type(e).__name__}: {e}\")]\n        return {\"messages\": messages, \"error\": \"yes\"}\n    try:\n        exec(code_solution.imports + \"\\n\" + code_solution.code, {})\n    except Exception as e:\n        messages = messages + [(\"user\", f\"Your solution failed the code execution test: {type(e).__name__}: {e}\")]\n        return {\"messages\": messages, \"error\": \"yes\"}\n    return {\"error\": \"no\"}\n\n\ntests = [\n    Solution(\"import math\", \"assert math.sqrt(16) == 4\"),\n    Solution(\"import maths\", \"print(maths.pi)\"),\n    Solution(\"import math\", \"print(math.pi / 0)\"),\n]\nfor s in tests:\n    result = code_check({\"messages\": [], \"generation\": s})\n    print(result[\"error\"], result.get(\"messages\"))"
      },
      "checks": [
        {
          "zh": "检查 1：只运行 imports",
          "en": "Check 1 runs only the imports",
          "re": "exec\\(\\s*\\w+\\.imports\\s*,"
        },
        {
          "zh": "检查 2：运行 imports + 换行 + code",
          "en": "Check 2 runs imports + newline + code",
          "re": "exec\\(\\s*\\w+\\.imports\\s*\\+\\s*[\"']\\\\n[\"']\\s*\\+\\s*\\w+\\.code"
        },
        {
          "zh": "用 `except Exception as e` 接住错误",
          "en": "Catches errors with `except Exception as e`",
          "re": "except\\s+Exception\\s+as\\s+\\w+\\s*:"
        },
        {
          "zh": "失败时把错误说明接进 messages",
          "en": "Appends the error note to messages on failure",
          "re": "messages\\s*=\\s*messages\\s*\\+\\s*\\["
        },
        {
          "zh": "失败时返回 `\"error\": \"yes\"`",
          "en": "Returns `\"error\": \"yes\"` on failure",
          "re": "[\"']error[\"']\\s*:\\s*[\"']yes[\"']"
        },
        {
          "zh": "通过时返回 `{\"error\": \"no\"}`",
          "en": "Returns `{\"error\": \"no\"}` on success",
          "re": "return\\s*\\{\\s*[\"']error[\"']\\s*:\\s*[\"']no[\"']\\s*\\}"
        }
      ]
    },
    {
      "title": {
        "zh": "手写：decide_to_finish 和整张图",
        "en": "Write it: decide_to_finish and the whole graph"
      },
      "task": {
        "zh": "假设 `GraphState`、`generate`、`code_check`、`reflect` 都已经写好。写出：\n1. `decide_to_finish(state)`：`error` 是 `\"no\"` 或 `iterations >= max_iterations` 时返回 `\"end\"`；否则 `flag == \"reflect\"` 返回 `\"reflect\"`，不然返回 `\"generate\"`\n2. `StateGraph(GraphState)` 加三个节点：`generate`、`check_code`（函数是 `code_check`）、`reflect`\n3. 连线：`START → generate → check_code`；从 `check_code` 出发的条件边，带路径映射 `{\"end\": END, ...}`；`reflect → generate`\n4. 编译，用初始状态 `{\"messages\": [...], \"iterations\": 0, \"error\": \"\"}` 运行一次\n\n（这段框架代码不能在浏览器里运行：写完点「检查关键点」，再补全练习文件 `l40_code_assistant_todo.py` 实际运行。）",
        "en": "Assume `GraphState`, `generate`, `code_check` and `reflect` exist. Write:\n1. `decide_to_finish(state)`: return `\"end\"` when `error` is `\"no\"` or `iterations >= max_iterations`; otherwise `\"reflect\"` if `flag == \"reflect\"`, else `\"generate\"`\n2. a `StateGraph(GraphState)` with three nodes: `generate`, `check_code` (function `code_check`), `reflect`\n3. edges: `START → generate → check_code`; the conditional edge out of `check_code` with the path map `{\"end\": END, ...}`; `reflect → generate`\n4. compile and run once with the start state `{\"messages\": [...], \"iterations\": 0, \"error\": \"\"}`\n\n(Framework code can't run in the browser: use “Check key points”, then complete and run `l40_code_assistant_todo.py`.)"
      },
      "starter": {
        "zh": "from langgraph.graph import END, START, StateGraph\n\nmax_iterations = 3\nflag = \"do not reflect\"\n# GraphState、generate、code_check、reflect 已经写好（见上文）\n\n# 1. decide_to_finish(state)：通过或次数用完 → \"end\"；否则按 flag → \"reflect\" 或 \"generate\"\n\n\n# 2. 创建 workflow，添加 generate、check_code、reflect 三个节点\n\n\n# 3. 连线：START → generate → check_code；check_code 的条件边（带路径映射）；reflect → generate\n\n\n# 4. 编译，用初始状态运行一次，打印最后的 code\n",
        "en": "from langgraph.graph import END, START, StateGraph\n\nmax_iterations = 3\nflag = \"do not reflect\"\n# GraphState, generate, code_check and reflect are already written (see above)\n\n# 1. decide_to_finish(state): passed or out of attempts -> \"end\"; otherwise \"reflect\" or \"generate\" by flag\n\n\n# 2. create the workflow and add the generate, check_code and reflect nodes\n\n\n# 3. edges: START -> generate -> check_code; check_code's conditional edge (with a path map); reflect -> generate\n\n\n# 4. compile, run once with a start state, print the final code\n"
      },
      "solution": {
        "zh": "from langgraph.graph import END, START, StateGraph\n\nmax_iterations = 3\nflag = \"do not reflect\"\n# GraphState、generate、code_check、reflect 已经写好（见上文）\n\n# 1. decide_to_finish(state)：通过或次数用完 → \"end\"；否则按 flag → \"reflect\" 或 \"generate\"\ndef decide_to_finish(state):\n    error = state[\"error\"]\n    iterations = state[\"iterations\"]\n    if error == \"no\" or iterations >= max_iterations:\n        return \"end\"\n    if flag == \"reflect\":\n        return \"reflect\"\n    return \"generate\"\n\n# 2. 创建 workflow，添加 generate、check_code、reflect 三个节点\nworkflow = StateGraph(GraphState)\nworkflow.add_node(\"generate\", generate)\nworkflow.add_node(\"check_code\", code_check)\nworkflow.add_node(\"reflect\", reflect)\n\n# 3. 连线：START → generate → check_code；check_code 的条件边（带路径映射）；reflect → generate\nworkflow.add_edge(START, \"generate\")\nworkflow.add_edge(\"generate\", \"check_code\")\nworkflow.add_conditional_edges(\n    \"check_code\",\n    decide_to_finish,\n    {\"end\": END, \"reflect\": \"reflect\", \"generate\": \"generate\"},\n)\nworkflow.add_edge(\"reflect\", \"generate\")\n\n# 4. 编译，用初始状态运行一次，打印最后的 code\napp = workflow.compile()\nsolution = app.invoke({\"messages\": [(\"user\", \"如何用 LCEL 并行执行两条链？\")], \"iterations\": 0, \"error\": \"\"})\nprint(solution[\"generation\"].code)\n",
        "en": "from langgraph.graph import END, START, StateGraph\n\nmax_iterations = 3\nflag = \"do not reflect\"\n# GraphState, generate, code_check and reflect are already written (see above)\n\n# 1. decide_to_finish(state): passed or out of attempts -> \"end\"; otherwise \"reflect\" or \"generate\" by flag\ndef decide_to_finish(state):\n    error = state[\"error\"]\n    iterations = state[\"iterations\"]\n    if error == \"no\" or iterations >= max_iterations:\n        return \"end\"\n    if flag == \"reflect\":\n        return \"reflect\"\n    return \"generate\"\n\n# 2. create the workflow and add the generate, check_code and reflect nodes\nworkflow = StateGraph(GraphState)\nworkflow.add_node(\"generate\", generate)\nworkflow.add_node(\"check_code\", code_check)\nworkflow.add_node(\"reflect\", reflect)\n\n# 3. edges: START -> generate -> check_code; check_code's conditional edge (with a path map); reflect -> generate\nworkflow.add_edge(START, \"generate\")\nworkflow.add_edge(\"generate\", \"check_code\")\nworkflow.add_conditional_edges(\n    \"check_code\",\n    decide_to_finish,\n    {\"end\": END, \"reflect\": \"reflect\", \"generate\": \"generate\"},\n)\nworkflow.add_edge(\"reflect\", \"generate\")\n\n# 4. compile, run once with a start state, print the final code\napp = workflow.compile()\nsolution = app.invoke({\"messages\": [(\"user\", \"How do I run two chains in parallel with LCEL?\")], \"iterations\": 0, \"error\": \"\"})\nprint(solution[\"generation\"].code)\n"
      },
      "checks": [
        {
          "zh": "定义了 `decide_to_finish`",
          "en": "Defines `decide_to_finish`",
          "re": "def\\s+decide_to_finish\\s*\\(\\s*\\w+\\s*\\)\\s*:"
        },
        {
          "zh": "用 `iterations >= max_iterations` 限制次数",
          "en": "Caps attempts with `iterations >= max_iterations`",
          "re": "iterations[\"'\\]]*\\s*>=\\s*max_iterations"
        },
        {
          "zh": "结束时返回 `\"end\"`",
          "en": "Returns `\"end\"` to finish",
          "re": "return\\s+[\"']end[\"']"
        },
        {
          "zh": "添加了 reflect 节点",
          "en": "Adds the reflect node",
          "re": "add_node\\(\\s*[\"']reflect[\"']\\s*,\\s*reflect\\s*\\)"
        },
        {
          "zh": "从 check_code 出发、用 decide_to_finish 的条件边",
          "en": "A conditional edge from check_code using decide_to_finish",
          "re": "add_conditional_edges\\(\\s*[\"']check_code[\"']\\s*,\\s*decide_to_finish"
        },
        {
          "zh": "路径映射里 `\"end\": END`",
          "en": "The path map has `\"end\": END`",
          "re": "[\"']end[\"']\\s*:\\s*END"
        },
        {
          "zh": "`reflect → generate`",
          "en": "`reflect → generate`",
          "re": "add_edge\\(\\s*[\"']reflect[\"']\\s*,\\s*[\"']generate[\"']\\s*\\)"
        },
        {
          "zh": "初始状态里有 `\"iterations\": 0`",
          "en": "The start state has `\"iterations\": 0`",
          "re": "[\"']iterations[\"']\\s*:\\s*0"
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "没有重试上限：模型一直改不对，图就一直循环、一直花钱（LangGraph 1.2 默认上限是 10007 步）。",
      "en": "No retry cap: if the model never gets it right, the graph loops and spends money (LangGraph 1.2 allows 10007 steps by default)."
    },
    {
      "zh": "`messages` 没有 reducer，节点却只返回新的一条消息：整段对话被覆盖，模型看不到问题和错误说明。",
      "en": "`messages` has no reducer but a node returns only the new message: the whole conversation is overwritten and the model loses the question and error notes."
    },
    {
      "zh": "检查失败时只把 `error` 设成 `\"yes\"`，没把错误说明接进 messages：模型不知道错在哪，很可能原样再错一次。",
      "en": "On failure setting only `error` to `\"yes\"` without adding the error note to messages: the model doesn't know what went wrong and likely repeats it."
    },
    {
      "zh": "路由函数返回 `\"end\"`，路径映射里却没有 `\"end\": END`（或者名字拼写不一致），运行到这里就报错。",
      "en": "The router returns `\"end\"` but the path map has no `\"end\": END` (or a misspelt name), so the run fails at that point."
    },
    {
      "zh": "deepseek-flash 开着思考模式就用 `with_structured_output`，得到 400 错误。",
      "en": "Using `with_structured_output` with deepseek-flash in thinking mode and getting a 400."
    },
    {
      "zh": "模型把测试写在 `if __name__ == \"__main__\":` 下面，而你用 `exec(program, {})` 检查：测试不会运行，错误的代码也会「通过」。",
      "en": "The model puts its tests under `if __name__ == \"__main__\":` while you check with `exec(program, {})`: the tests never run, so broken code “passes”."
    },
    {
      "zh": "照抄视频的网页加载器：缺 beautifulsoup4，而且旧的 LCEL 文档网址已经跳转到新文档首页。",
      "en": "Copying the video's web loader: beautifulsoup4 is missing, and the old LCEL docs URL now redirects to the new docs home page."
    },
    {
      "zh": "在自己的电脑上直接 `exec` 不信任的代码，没有超时，也没有隔离。",
      "en": "`exec`-ing untrusted code on your own machine with no timeout and no isolation."
    }
  ],
  "recap": [
    {
      "zh": "代码助手 = 参考文档 → generate → check_code（导入检查 + 执行检查）→ decide_to_finish：结束 / 重新生成 / 反思。",
      "en": "Coding assistant = reference docs → generate → check_code (import check + execution check) → decide_to_finish: end / regenerate / reflect."
    },
    {
      "zh": "`code_gen_prompt | llm.with_structured_output(CodeSolution)` 交回 prefix / imports / code 三部分；DeepSeek 要关掉思考模式。",
      "en": "`code_gen_prompt | llm.with_structured_output(CodeSolution)` returns prefix / imports / code; DeepSeek needs thinking off."
    },
    {
      "zh": "状态 error / messages / generation / iterations：模型要读的放 messages，程序做判断要用的单独放。",
      "en": "State error / messages / generation / iterations: what the model reads goes in messages, what the program decides on gets its own field."
    },
    {
      "zh": "`exec(源码, {})` 运行字符串里的代码，出错用 `except Exception as e` 变成文字写回状态。",
      "en": "`exec(source, {})` runs code held in a string; `except Exception as e` turns errors into text for the state."
    },
    {
      "zh": "条件边返回短名字，路径映射 `{\"end\": END, ...}` 把它们对应到节点；一定要有 `max_iterations` 上限。",
      "en": "The router returns short names and the path map `{\"end\": END, ...}` maps them to nodes; always have a `max_iterations` cap."
    },
    {
      "zh": "运行模型写的代码要有超时和隔离，必要时先让人审核。",
      "en": "Run model-written code with a timeout and isolation, and let a person review it when it matters."
    }
  ],
  "files": [
    {
      "path": "practice/l40_code_assistant_todo.py",
      "zh": "练习：补全 CodeSolution 的字段、生成链、两项检查、decide_to_finish 和图的连线（有 TODO 提示）。",
      "en": "Exercise: complete the CodeSolution fields, the generation chain, the two checks, decide_to_finish and the wiring (with TODO hints)."
    },
    {
      "path": "practice/l40_code_assistant_solution.py",
      "zh": "参考答案：和视频结构一致的代码助手（读本地 LCEL 笔记，子进程 + 超时检查代码，可以打开反思开关）。",
      "en": "Solution: the assistant with the video's structure (local LCEL notes, checks in a subprocess with a timeout, optional reflection switch)."
    },
    {
      "path": "practice/data/l40_lcel_docs.md",
      "zh": "代码助手的参考文档：一份 LCEL 速查笔记，可以换成你自己的文档。",
      "en": "The assistant's reference docs: an LCEL cheat sheet; swap in your own docs."
    }
  ]
});
