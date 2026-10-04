COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l21",
  "priority": "important",
  "handwrite": true,
  "studyMinutes": 40,
  "source": "subtitle",
  "summary": {
    "zh": "中间件是 AgentScope 2.0 的「钩子」机制：不改智能体内部的代码，就能在它工作的关键环节前后加功能。这一集先讲中间件的两种结构（洋葱式和节点式 / 流水线式）和智能体的生命周期，再写一个自己的中间件类：`on_reply` 在每次回复后把状态存成 JSON，`on_reasoning` 用分隔线把思考和回答分开，`on_model_call` 和 `on_acting` 在模型调用、工具调用前后打印提示，`on_system_prompt` 给系统提示词加上角色名，最后挂到智能体上逐个验证。",
    "en": "Middleware is AgentScope 2.0's hook mechanism: it adds behaviour before and after the key steps of an agent without touching the agent's own code. The episode first explains the two structures (onion and node / pipeline) and the agent's life cycle, then writes a custom middleware class: `on_reply` saves the state as JSON after every reply, `on_reasoning` separates thinking from the answer with divider lines, `on_model_call` and `on_acting` print notices around model and tool calls, and `on_system_prompt` adds a persona name to the system prompt. Finally it is attached to an agent and each hook is checked."
  },
  "goals": [
    {
      "zh": "说清楚中间件是什么，以及洋葱式和节点式（流水线）两种结构的执行顺序",
      "en": "Explain what middleware is and the execution order of the onion and node (pipeline) structures"
    },
    {
      "zh": "说出 `on_reply`、`on_reasoning`、`on_acting`、`on_model_call`、`on_system_prompt` 各自包住智能体的哪一步",
      "en": "Say which step of the agent `on_reply`, `on_reasoning`, `on_acting`, `on_model_call` and `on_system_prompt` each wrap"
    },
    {
      "zh": "继承 `MiddlewareBase` 写自己的中间件：洋葱型钩子用 `async for ... yield`，流水线型钩子直接 `return`",
      "en": "Write your own middleware by inheriting `MiddlewareBase`: onion hooks use `async for ... yield`, the pipeline hook just `return`s"
    },
    {
      "zh": "在 `on_reply` 里保存智能体状态，在 `on_reasoning` 里改写事件流，在 `on_model_call` 里包住流式结果",
      "en": "Save the agent state in `on_reply`, rewrite the event stream in `on_reasoning`, and wrap a streaming result in `on_model_call`"
    },
    {
      "zh": "用 `middlewares=[...]` 把中间件挂到智能体上，并逐个验证效果",
      "en": "Attach middleware with `middlewares=[...]` and verify each hook"
    }
  ],
  "blocks": [
    {
      "t": "h",
      "zh": "一、中间件是什么：不改智能体代码，也能加功能",
      "en": "1. What middleware is: new behaviour without changing the agent's code"
    },
    {
      "t": "p",
      "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=0) 这一集讲 AgentScope 2.0 的**中间件**（middleware）。老师的说法是：中间件就是 2.0 里的**钩子机制**，作用和钩子函数差不多——不用改智能体内部的代码逻辑，就能给它添加或修改功能。\n\n中间件有两种结构：\n- **洋葱式**：输入进来时像剥洋葱一样一层层往里走，到最里面执行完真正的逻辑后，再一层层往外返回。每一层都有一段「之前」的代码和一段「之后」的代码\n- [▶ 00:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=32) **节点式**（也可以叫流水线）：输入在节点 1 处理完，直接交给节点 2、节点 3……不会像洋葱那样再一步步返回\n\n[▶ 01:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=62) 视频里的示意图画的是洋葱：最外层的前置代码先跑，接着是里面一层、再里面一层……一路走到核心逻辑；核心做完后再原路往外退，每退一层就执行这一层的后置代码，退回最外层时交出最终结果。",
      "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=0) This episode is about **middleware** in AgentScope 2.0. In the instructor's words, middleware is 2.0's **hook mechanism** and works much like hook functions: it adds or changes features without touching the agent's internal logic.\n\nMiddleware comes in two structures:\n- **Onion**: on the way in, the input passes layer after layer like peeling an onion; after the real logic in the centre runs, it travels back out layer by layer. Each layer has a “before” part and an “after” part\n- [▶ 00:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=32) **Node style** (also called a pipeline): node 1 processes the input and hands it straight to node 2, node 3… – no return trip like the onion\n\n[▶ 01:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=62) The diagram in the video shows the onion: the outermost layer's before-code runs first, then the next layer in, then the next one… all the way down to the core logic; once the core is done, it travels back out the same way, running each layer's after-code as it leaves, and the outermost layer hands back the final result."
    },
    {
      "t": "py",
      "title": {
        "zh": "函数包函数：高阶函数和装饰器",
        "en": "Functions wrapping functions: higher-order functions and decorators"
      },
      "zh": "洋葱的每一层，本质上就是「一个函数把另一个函数包起来」。Python 里函数也是一个「值」：可以当参数传给另一个函数，也可以被另一个函数返回。**接收或返回函数的函数**叫高阶函数。\n\n下面的 `with_log(func)` 接收一个函数，返回一个**新函数** `wrapper`：先打印一行（之前），再调用原来的 `func`（下一层），最后打印一行（之后）并把结果交回去。\n\n在 `def` 上面写 `@with_log`，等价于定义完之后执行 `multiply = with_log(multiply)`，这就是**装饰器**（08 节的 `@function_tool`、20 节的 `@mcp.tool()` 都是这种写法）。`*args, **kwargs` 让 `wrapper` 能接收任意参数，再原样转交给 `func`（`**kwargs` 拆包见 05 节，`*args` 是同样的思路，用于按位置传的参数）；`func.__name__` 是函数自己的名字。",
      "en": "Each onion layer is, at heart, “one function wrapping another”. In Python a function is a value too: it can be passed to another function or returned by one. A **function that takes or returns functions** is a higher-order function.\n\n`with_log(func)` below takes a function and returns a **new function**, `wrapper`, which prints a line (before), calls the original `func` (the next layer), then prints another line (after) and passes the result back.\n\nWriting `@with_log` above a `def` is the same as running `multiply = with_log(multiply)` afterwards – that is a **decorator** (lesson 08's `@function_tool` and lesson 20's `@mcp.tool()` work this way). `*args, **kwargs` let `wrapper` accept any arguments and forward them unchanged (`**kwargs` unpacking is from lesson 05; `*args` is the same idea for positional arguments); `func.__name__` is the function's own name.",
      "code": {
        "zh": "def with_log(func):                        # 接收一个函数\n    def wrapper(*args, **kwargs):          # 定义一个新函数，把原函数包起来\n        print(f\"→ 调用 {func.__name__}{args}\")        # 之前\n        result = func(*args, **kwargs)     # 交给原函数（下一层）\n        print(f\"← {func.__name__} 返回 {result}\")  # 之后\n        return result                      # 别忘了把结果交回去\n    return wrapper                         # 返回这个新函数\n\n\ndef add(a, b):\n    return a + b\n\n\nlogged_add = with_log(add)                 # 手动包装\nprint(logged_add(2, 3))\n\n\n@with_log                                  # 装饰器写法，等价于 multiply = with_log(multiply)\ndef multiply(a, b):\n    return a * b\n\n\nprint(multiply(4, 5))",
        "en": "def with_log(func):                        # takes a function\n    def wrapper(*args, **kwargs):          # a new function wrapping the original\n        print(f\"→ call {func.__name__}{args}\")        # before\n        result = func(*args, **kwargs)     # hand over to the original (next layer)\n        print(f\"← {func.__name__} returns {result}\")  # after\n        return result                      # don't forget to pass the result back\n    return wrapper                         # return the new function\n\n\ndef add(a, b):\n    return a + b\n\n\nlogged_add = with_log(add)                 # wrap by hand\nprint(logged_add(2, 3))\n\n\n@with_log                                  # decorator syntax, same as multiply = with_log(multiply)\ndef multiply(a, b):\n    return a * b\n\n\nprint(multiply(4, 5))"
      }
    },
    {
      "t": "p",
      "zh": "再用纯 Python 模拟两种结构：洋葱由一层层包装的函数组成，**列表里第一个是最外层**（AgentScope 也是这样）；流水线就是按顺序一个接一个地加工。",
      "en": "Now simulate both structures in plain Python: the onion is built from wrapped functions, with **the first in the list as the outermost layer** (AgentScope does the same); the pipeline simply processes in order, one step after another."
    },
    {
      "t": "code",
      "file": "onion_vs_pipeline.py",
      "code": {
        "zh": "def make_layer(name, next_handler):\n    def handler(question):\n        print(f\"{name}：之前\")\n        result = next_handler(question)    # 交给下一层\n        print(f\"{name}：之后\")\n        return result\n    return handler\n\n\ndef call_model(question):                  # 最里面：真正干活的函数\n    print(\"    >>> 调用模型：\", question)\n    return \"15°C\"\n\n\ndef add_role(prompt):                      # 节点式（流水线）：处理完交给下一个，不回头\n    return prompt + \" 你叫 AAG。\"\n\n\ndef add_short(prompt):\n    return prompt + \" 回答要简短。\"\n\n\n# 洋葱：列表里第一个是最外层，所以从最后一个开始一层层往外包\nmiddlewares = [\"A\", \"B\"]\nhandler = call_model\nfor name in reversed(middlewares):\n    handler = make_layer(name, handler)\nprint(\"结果：\", handler(\"北京多少度？\"))\n\n# 流水线：按顺序一个接一个处理\nprompt = \"你是助手。\"\nfor step in [add_role, add_short]:\n    prompt = step(prompt)\nprint(prompt)",
        "en": "def make_layer(name, next_handler):\n    def handler(question):\n        print(f\"{name}: before\")\n        result = next_handler(question)    # hand over to the next layer\n        print(f\"{name}: after\")\n        return result\n    return handler\n\n\ndef call_model(question):                  # innermost: the function doing the real work\n    print(\"    >>> calling the model:\", question)\n    return \"15°C\"\n\n\ndef add_role(prompt):                      # node style (pipeline): process, pass on, never come back\n    return prompt + \" Your name is AAG.\"\n\n\ndef add_short(prompt):\n    return prompt + \" Keep answers short.\"\n\n\n# onion: the first in the list is outermost, so wrap from the last one outwards\nmiddlewares = [\"A\", \"B\"]\nhandler = call_model\nfor name in reversed(middlewares):\n    handler = make_layer(name, handler)\nprint(\"result:\", handler(\"How warm is Beijing?\"))\n\n# pipeline: one after another, in order\nprompt = \"You are an assistant.\"\nfor step in [add_role, add_short]:\n    prompt = step(prompt)\nprint(prompt)"
      },
      "run": true,
      "note": {
        "zh": "`reversed(列表)` 从后往前遍历。每包一层，`handler` 就变成一个更外层的新函数，最后得到的 `handler` 就是整颗洋葱。",
        "en": "`reversed(list)` walks backwards. Each wrap turns `handler` into a new, more outer function; the final `handler` is the whole onion."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "上面的例子里 `middlewares = [\"A\", \"B\"]`，打印顺序是？",
        "en": "With `middlewares = [\"A\", \"B\"]` above, what is the print order?"
      },
      "options": [
        {
          "zh": "B 之前 → A 之前 → 模型 → A 之后 → B 之后",
          "en": "B before → A before → model → A after → B after"
        },
        {
          "zh": "A 之前 → A 之后 → B 之前 → 模型 → B 之后",
          "en": "A before → A after → B before → model → B after"
        },
        {
          "zh": "A 之前 → B 之前 → 模型 → B 之后 → A 之后",
          "en": "A before → B before → model → B after → A after"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "第一个是最外层：进去时先经过 A，出来时最后经过 A。",
        "en": "The first one is the outermost layer: A is entered first and left last."
      }
    },
    {
      "t": "h",
      "zh": "二、智能体的生命周期和 5 个常用钩子",
      "en": "2. The agent's life cycle and five common hooks"
    },
    {
      "t": "p",
      "zh": "[▶ 01:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=62) 要知道每个钩子包住了什么，先看智能体的**生命周期**：一次完整的调用过程。用户发来一个请求后，智能体反复「思考 → 行动 → 观察」，最后把结果交给用户，这叫一轮回复；连续聊天就是很多轮这样的回复。\n\n| 钩子 | 包住哪一步 | 结构 | 视频里的例子 |\n|---|---|---|---|\n| `on_reply` | [▶ 01:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=93) 一次完整的回复：前置代码在用户发出请求后执行，后置代码在思考–行动–观察循环全部结束后执行 | 洋葱 | 回复结束后保存状态 |\n| `on_reasoning` | [▶ 02:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=124) 循环里的「思考」一步，也就是一次推理 | 洋葱 | 把思考和回答分开显示 |\n| `on_acting` | 循环里的「行动」一步：执行一次工具调用 | 洋葱 | 打印工具开始 / 结束 |\n| `on_model_call` | [▶ 02:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=154) 真正请求模型 API 的那一下 | 洋葱（但要返回结果） | 打印调用开始 / 结束 |\n| `on_system_prompt` | 每次把系统提示词交给模型之前 | 流水线 | 在提示词末尾加角色名 |\n\n`on_system_prompt` 让你按自己的逻辑灵活地修改系统提示词；它是流水线：收到当前的提示词，返回新的，没有「之后」的部分。",
      "en": "[▶ 01:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=62) To see what each hook wraps, first look at the agent's **life cycle**: one complete call. After the user sends a request the agent loops “think → act → observe” and finally hands the result to the user – that is one reply; a conversation is many such replies.\n\n| Hook | What it wraps | Structure | Example in the video |\n|---|---|---|---|\n| `on_reply` | [▶ 01:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=93) one complete reply: the before-code runs after the user sends the request, the after-code once the think–act–observe loop has finished | onion | save the state after the reply |\n| `on_reasoning` | [▶ 02:04](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=124) the “think” step of the loop, i.e. one reasoning step | onion | show thinking and answer separately |\n| `on_acting` | the “act” step of the loop: running one tool call | onion | print tool start / end |\n| `on_model_call` | [▶ 02:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=154) the actual request to the model API | onion (but must return a result) | print call start / end |\n| `on_system_prompt` | each time, before the system prompt is handed to the model | pipeline | append the persona name to the prompt |\n\n`on_system_prompt` lets you change the system prompt flexibly with your own logic; it is a pipeline: it receives the current prompt and returns a new one, with no “after” part."
    },
    {
      "t": "warn",
      "zh": "视频里把 `on_model_call` 说成包住「整个生命周期」。按 2.0.9 的源码和实测，它包住的是**每一次**请求模型 API：一轮回复里如果模型先调工具、再写答案，`on_model_call` 就会执行 2 次（下面的运行结果里能看到）。包住整轮回复的是 `on_reply`。",
      "en": "The video describes `on_model_call` as wrapping “the whole life cycle”. According to the 2.0.9 source and our tests it wraps **each single** model API request: if the model calls a tool and then writes the answer within one reply, `on_model_call` runs twice (visible in the run below). The hook that wraps a whole reply is `on_reply`."
    },
    {
      "t": "h",
      "zh": "三、自己写一个中间件：继承 MiddlewareBase",
      "en": "3. Writing your own middleware: inherit MiddlewareBase"
    },
    {
      "t": "p",
      "zh": "[▶ 03:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=186) 自定义中间件就是写一个类，继承 AgentScope 的基础类 `MiddlewareBase`。视频里的初始化方法接收一个文件路径 `file_path`，后面 `on_reply` 要用，所以先用 `self.file_path` 存起来（类和 `self` 见 08 节）。你只需要重写用得到的钩子，没写的钩子框架会自动跳过。",
      "en": "[▶ 03:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=186) A custom middleware is a class that inherits AgentScope's base class `MiddlewareBase`. In the video the constructor receives a file path, `file_path`, which `on_reply` needs later, so it is stored as `self.file_path` (classes and `self`: lesson 08). Override only the hooks you need; the framework skips the rest automatically."
    },
    {
      "t": "code",
      "file": {
        "zh": "l21_middleware_solution.py（类的开头）",
        "en": "l21_middleware_solution.py (class start)"
      },
      "code": {
        "zh": "import json\n\nfrom agentscope.middleware import MiddlewareBase\n\n\nclass MyMiddleware(MiddlewareBase):          # 继承 MiddlewareBase\n    def __init__(self, file_path):\n        self.file_path = file_path           # 存档文件的位置，on_reply 里要用",
        "en": "import json\n\nfrom agentscope.middleware import MiddlewareBase\n\n\nclass MyMiddleware(MiddlewareBase):          # inherit from MiddlewareBase\n    def __init__(self, file_path):\n        self.file_path = file_path           # where to save; on_reply needs it"
      }
    },
    {
      "t": "p",
      "zh": "**① `on_reply`：每次回复后保存状态。** [▶ 03:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=216) 19 节讲过状态持久化：把智能体的状态存下来，下次重开时它还记得之前的对话，不用重新交代。把保存逻辑写进 `on_reply`，每轮回复结束都会自动存一次。\n\n[▶ 04:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=247) 洋葱型的钩子必须接收这几个参数：`self`；`agent`——挂着这个中间件的智能体；`input_kwargs`——这一步的输入，是一个字典（对 `on_reply` 来说，主要是用户交给智能体的消息 `inputs`）；`next_handler`——下一个中间件，或者最里面智能体自己的逻辑。这里不需要前置代码；中间用 `async for` 调用下一层，把每个事件原封不动地 `yield` 出去；[▶ 04:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=278) 结尾的后置代码用 `agent.state.model_dump()` 把状态导出成 JSON 结构，再用 `json.dump` 写进文件（19 节）。",
      "en": "**① `on_reply`: save the state after every reply.** [▶ 03:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=216) Lesson 19 covered state persistence: save the agent's state so that when it is restarted it still remembers the earlier conversation and you don't have to explain everything again. Put the saving logic into `on_reply` and it saves automatically at the end of every reply.\n\n[▶ 04:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=247) An onion hook must accept these parameters: `self`; `agent` – the agent this middleware is attached to; `input_kwargs` – the input of this step, a dict (for `on_reply` it is mainly `inputs`, the message the user hands to the agent); and `next_handler` – the next middleware, or the agent's own logic in the centre. No before-code is needed here; the middle part calls the next layer with `async for` and `yield`s every event on unchanged; [▶ 04:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=278) the after-code at the end exports the state as a JSON structure with `agent.state.model_dump()` and writes it to the file with `json.dump` (lesson 19)."
    },
    {
      "t": "code",
      "file": "on_reply",
      "code": {
        "zh": "class MyMiddleware(MiddlewareBase):          # ……接上面\n    async def on_reply(self, agent, input_kwargs, next_handler):\n        # 前置代码：这里不需要\n        async for event in next_handler(**input_kwargs):   # 调用下一层（下一个中间件或智能体内部逻辑）\n            yield event                                    # 事件原封不动地往外交\n        # 后置代码：整次回复结束后，把状态存成 JSON（19 节）\n        with open(self.file_path, \"w\", encoding=\"utf-8\") as f:\n            json.dump(agent.state.model_dump(mode=\"json\"), f, ensure_ascii=False, indent=2)",
        "en": "class MyMiddleware(MiddlewareBase):          # ... continued\n    async def on_reply(self, agent, input_kwargs, next_handler):\n        # \"before\" code: none needed here\n        async for event in next_handler(**input_kwargs):   # call the next layer (next middleware or the agent's own logic)\n            yield event                                    # pass every event on unchanged\n        # \"after\" code: once the reply is done, save the state as JSON (lesson 19)\n        with open(self.file_path, \"w\", encoding=\"utf-8\") as f:\n            json.dump(agent.state.model_dump(mode=\"json\"), f, ensure_ascii=False, indent=2)"
      }
    },
    {
      "t": "p",
      "zh": "**② `on_reasoning`：把思考和回答分开。** [▶ 04:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=278) 前几课没有把模型的思考过程和正式回答分开，输出混在一起很难看。这个钩子在思考开始的地方插一行带 🧠 的分隔线（回答开始处也插一行），两部分就分开打印了。\n\n[▶ 05:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=310) 做法是遍历下一层产出的每个事件，检查它的类型：先确认这个事件**有** `type` 属性（`hasattr`，15 节），再看它是不是 `EventType` 里的「思考块开始」或「文字块开始」。[▶ 05:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=343) 是的话，就造一个 `TextBlockDeltaEvent`（文字片段事件），编号原样带上，内容换成分隔线。输出循环看到文字片段就会打印，分隔线就出现在屏幕上了。",
      "en": "**② `on_reasoning`: separate thinking from the answer.** [▶ 04:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=278) Earlier lessons never separated the model's thinking from its actual answer, so the output was a jumble. This hook inserts a divider line with 🧠 where thinking starts (and another where the answer starts), so the two parts print separately.\n\n[▶ 05:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=310) It loops over every event from the next layer and checks its type: first that the event **has** a `type` attribute (`hasattr`, lesson 15), then whether it is a “thinking block start” or “text block start” from `EventType`. [▶ 05:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=343) If so, it builds a `TextBlockDeltaEvent` (a text-piece event), keeps the same ids and puts the divider in as content. The print loop prints any text piece, so the divider appears on screen."
    },
    {
      "t": "code",
      "file": "on_reasoning",
      "code": {
        "zh": "class MyMiddleware(MiddlewareBase):          # ……接上面\n    async def on_reasoning(self, agent, input_kwargs, next_handler):\n        async for event in next_handler(**input_kwargs):\n            # 最后一项是 Msg，它没有 type 属性，所以先用 hasattr 检查（15 节）\n            if hasattr(event, \"type\") and event.type in (EventType.THINKING_BLOCK_START, EventType.TEXT_BLOCK_START):\n                label = \"🧠 思考\" if event.type == EventType.THINKING_BLOCK_START else \"💬 回答\"\n                yield TextBlockDeltaEvent(           # 造一个「文字片段」事件，输出循环会把它打印出来\n                    reply_id=event.reply_id,\n                    block_id=event.block_id,         # 编号原样带上\n                    delta=f\"\\n////////////// {label} //////////////\\n\",\n                )\n            yield event                              # 原来的事件照常交出去",
        "en": "class MyMiddleware(MiddlewareBase):          # ... continued\n    async def on_reasoning(self, agent, input_kwargs, next_handler):\n        async for event in next_handler(**input_kwargs):\n            # the last item is a Msg with no type attribute, so check with hasattr first (lesson 15)\n            if hasattr(event, \"type\") and event.type in (EventType.THINKING_BLOCK_START, EventType.TEXT_BLOCK_START):\n                label = \"🧠 thinking\" if event.type == EventType.THINKING_BLOCK_START else \"💬 answer\"\n                yield TextBlockDeltaEvent(           # build a text-delta event; the print loop will show it\n                    reply_id=event.reply_id,\n                    block_id=event.block_id,         # keep the same ids\n                    delta=f\"\\n////////////// {label} //////////////\\n\",\n                )\n            yield event                              # pass the original event on too"
      }
    },
    {
      "t": "note",
      "zh": "和视频的一点区别：视频是用分隔线事件**替换**掉原来的「开始」事件；这里先交出分隔线，**再**把原事件交出去，屏幕效果一样，但不会丢掉「开始」事件——以后接网页界面时，界面可能要靠它判断一段内容从哪开始。另外，最后一项是最终消息 `Msg`，它没有 `type` 属性，所以必须先 `hasattr` 检查（实测 `hasattr(msg, \"type\")` 是 `False`）。",
      "en": "One difference from the video: the video **replaces** the original “start” event with the divider event; here the divider is yielded first and **then** the original event, which looks the same on screen but keeps the start event – a web UI may need it later to know where a block begins. Also, the last item is the final `Msg`, which has no `type` attribute, so the `hasattr` check is required (verified: `hasattr(msg, \"type\")` is `False`)."
    },
    {
      "t": "p",
      "zh": "**③ `on_model_call`：包住一次模型请求。** [▶ 06:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=378) 它和前两个洋葱钩子写法不同：不是边走边 `yield`，而是要**返回**结果。流式模型（`stream=True`）返回的结果是一个异步生成器，所以老师的写法是：先 `await` 拿到下一层的结果，再在里面定义一个协程函数把它包起来，最后返回这个函数产生的生成器——这正是上面 Python 小课堂里「函数包函数」的用法。[▶ 06:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=410) 这个钩子在本例里没有特别实用的场景，只演示过程：它在请求开始时执行前置代码，请求结束后执行后置代码。",
      "en": "**③ `on_model_call`: wrap one model request.** [▶ 06:18](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=378) It is written differently from the first two onion hooks: instead of yielding as it goes, it must **return** a result. A streaming model (`stream=True`) returns an async generator, so the instructor's approach is: `await` the next layer's result, define a coroutine function inside that wraps it, and return the generator that function produces – exactly the “function wrapping a function” idea from the Python mini-lesson above. [▶ 06:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=410) This hook has no especially useful job in this example; it just shows the flow: the before-code runs when the request starts, the after-code when it ends."
    },
    {
      "t": "code",
      "file": "on_model_call",
      "code": {
        "zh": "class MyMiddleware(MiddlewareBase):          # ……接上面\n    async def on_model_call(self, agent, input_kwargs, next_handler):\n        print(\"\\n[模型调用开始]\")\n        result = await next_handler(**input_kwargs)   # 先 await，拿到结果：流式模型给的是一个异步生成器\n\n        async def wrapped():                          # 再定义一个函数把它包起来\n            async for chunk in result:\n                yield chunk                           # 一块一块原样交出去\n            print(\"\\n[模型调用结束]\")\n\n        return wrapped()                              # 返回包好的生成器",
        "en": "class MyMiddleware(MiddlewareBase):          # ... continued\n    async def on_model_call(self, agent, input_kwargs, next_handler):\n        print(\"\\n[model call starts]\")\n        result = await next_handler(**input_kwargs)   # await first: a streaming model returns an async generator\n\n        async def wrapped():                          # define a function that wraps it\n            async for chunk in result:\n                yield chunk                           # pass every chunk on\n            print(\"\\n[model call ends]\")\n\n        return wrapped()                              # return the wrapped generator"
      }
    },
    {
      "t": "warn",
      "zh": "`on_model_call` 拿到什么，取决于模型是不是流式：`stream=True` 时是**异步生成器**，要像上面那样包起来再返回；`stream=False` 时是一个完整的 `ChatResponse`，直接 `return response` 就行。忘了 `return`，智能体拿到的是 `None`，这一步就出错了。",
      "en": "What `on_model_call` receives depends on streaming: with `stream=True` it is an **async generator**, which must be wrapped and returned as above; with `stream=False` it is a complete `ChatResponse` – simply `return response`. Forget the `return` and the agent gets `None`, breaking that step."
    },
    {
      "t": "p",
      "zh": "**④ `on_acting`：包住一次工具执行。** [▶ 06:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=410) 写法和 `on_reply`、`on_reasoning` 一样，只是包住的阶段不同。讲解时老师没有单独写例子，到了完整代码里（[▶ 07:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=474)）才在前后各打印一行「工具开始调用」「工具调用结束」。`input_kwargs[\"tool_call\"]` 是这次要执行的工具调用，`.name` 是工具名。\n\n**⑤ `on_system_prompt`：改系统提示词。** 它收到的输入就是当前的系统提示词，直接改了再返回即可。[▶ 07:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=443) 视频在提示词末尾加上了智能体的角色名。",
      "en": "**④ `on_acting`: wrap one tool execution.** [▶ 06:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=410) Same shape as `on_reply` and `on_reasoning`, just around a different stage. The instructor writes no separate example while explaining it; only in the full code ([▶ 07:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=474)) does it print “tool starts” before and “tool done” after. `input_kwargs[\"tool_call\"]` is the tool call about to run; `.name` is the tool's name.\n\n**⑤ `on_system_prompt`: change the system prompt.** Its input is the current system prompt; change it and return it. [▶ 07:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=443) The video appends the agent's persona name to the end of the prompt."
    },
    {
      "t": "code",
      "file": "on_acting + on_system_prompt",
      "code": {
        "zh": "class MyMiddleware(MiddlewareBase):          # ……接上面\n    async def on_acting(self, agent, input_kwargs, next_handler):\n        call = input_kwargs[\"tool_call\"]              # 这次要执行的工具调用\n        print(f\"\\n[工具开始调用] {call.name}\")\n        async for item in next_handler(**input_kwargs):\n            yield item\n        print(f\"[工具调用结束] {call.name}\")\n\n    async def on_system_prompt(self, agent, current_prompt):\n        # 流水线型：收到当前的系统提示词，返回改过的；没有 next_handler\n        return current_prompt + \"\\n你的角色名叫 AAG。被问到名字时就这样回答。\"",
        "en": "class MyMiddleware(MiddlewareBase):          # ... continued\n    async def on_acting(self, agent, input_kwargs, next_handler):\n        call = input_kwargs[\"tool_call\"]              # the tool call about to run\n        print(f\"\\n[tool starts] {call.name}\")\n        async for item in next_handler(**input_kwargs):\n            yield item\n        print(f\"[tool done] {call.name}\")\n\n    async def on_system_prompt(self, agent, current_prompt):\n        # pipeline: receive the current prompt, return a changed one; no next_handler\n        return current_prompt + \"\\nYour persona name is AAG. Use it when asked for your name.\""
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "想在**每一轮回复结束后**把智能体的状态存进文件，应该写哪个钩子？",
        "en": "To save the agent's state to a file **after every reply**, which hook do you write?"
      },
      "options": [
        {
          "zh": "`on_system_prompt`",
          "en": "`on_system_prompt`"
        },
        {
          "zh": "`on_reply`，保存代码写在 `async for` 循环之后",
          "en": "`on_reply`, with the saving code after the `async for` loop"
        },
        {
          "zh": "`on_model_call`，保存代码写在 `await` 之前",
          "en": "`on_model_call`, with the saving code before the `await`"
        },
        {
          "zh": "`on_acting`",
          "en": "`on_acting`"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "`on_reply` 包住一整次回复；循环之后的代码就是洋葱的「之后」，那时回复已经结束、状态是最新的。",
        "en": "`on_reply` wraps one whole reply; code after the loop is the onion's “after” part, when the reply has finished and the state is up to date."
      }
    },
    {
      "t": "h",
      "zh": "四、挂到智能体上，逐个验证",
      "en": "4. Attach it to an agent and check each hook"
    },
    {
      "t": "p",
      "zh": "[▶ 07:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=443) 完整代码先导入需要的类，和前面几课唯一的不同是要从 `agentscope.middleware` 导入 `MiddlewareBase`。[▶ 07:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=474) 为了看得更清楚，`on_reasoning` 的分隔线加长成两条显眼的斜杠线；`on_acting` 打印工具开始和结束。之后照常创建模型、智能体，把中间件放进 `middlewares=[...]`，进入流式输出循环。\n\n换成 DeepSeek 时要注意一点：AgentScope 的 `DeepSeekChatModel` **默认关闭思考**（`thinking_enable=False`），这时根本没有思考事件，分隔线也就不会出现。所以模型参数里要打开 `thinking_enable=True`。工具用 16 节的内置 `Read`（只读，不用批准），让智能体有文件可读。",
      "en": "[▶ 07:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=443) The full code imports the needed classes; the only new import compared with earlier lessons is `MiddlewareBase` from `agentscope.middleware`. [▶ 07:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=474) To make things easier to see, the `on_reasoning` dividers are lengthened into two eye-catching rows of slashes, and `on_acting` prints tool start and end. Then the model and agent are created as usual, with the middleware in `middlewares=[...]`, followed by the streaming loop.\n\nOne thing to watch with DeepSeek: AgentScope's `DeepSeekChatModel` **turns thinking off by default** (`thinking_enable=False`), so there are no thinking events and no dividers appear. Turn on `thinking_enable=True` in the model parameters. The tool is lesson 16's built-in `Read` (read-only, no approval needed), so the agent has files it can read."
    },
    {
      "t": "code",
      "file": {
        "zh": "l21_middleware_solution.py（main）",
        "en": "l21_middleware_solution.py (main)"
      },
      "code": {
        "zh": "async def main():\n    model = DeepSeekChatModel(\n        credential=DeepSeekCredential(api_key=API_KEY),\n        model=MODEL,\n        stream=True,\n        parameters=DeepSeekChatModel.Parameters(thinking_enable=True),   # 打开思考，才有思考过程可分隔\n    )\n    agent = Agent(\n        name=\"Friday\",\n        system_prompt=f\"你是一个简洁的中文助手。练习文件在 {DATA_DIR} 里，调用 Read 时使用绝对路径。\",\n        model=model,\n        toolkit=Toolkit(tools=[Read()]),               # 只读的内置读文件工具（16 节）\n        middlewares=[MyMiddleware(DATA_DIR / \"l21_my_agent.json\")],   # 挂上中间件\n    )\n\n    while True:\n        text = input(\"\\n你 / You: \").strip()\n        if not text:\n            continue\n        if text == \"/exit\":\n            break\n        async for event in agent.reply_stream(UserMsg(name=\"user\", content=text)):\n            if event.type in (EventType.THINKING_BLOCK_DELTA, EventType.TEXT_BLOCK_DELTA):\n                print(event.delta, end=\"\", flush=True)  # 思考和回答都打印\n        print()\n\n\nasyncio.run(main())",
        "en": "async def main():\n    model = DeepSeekChatModel(\n        credential=DeepSeekCredential(api_key=API_KEY),\n        model=MODEL,\n        stream=True,\n        parameters=DeepSeekChatModel.Parameters(thinking_enable=True),   # turn thinking on, or there is nothing to separate\n    )\n    agent = Agent(\n        name=\"Friday\",\n        system_prompt=f\"You are a concise assistant. Practice files are in {DATA_DIR}; use absolute paths with Read.\",\n        model=model,\n        toolkit=Toolkit(tools=[Read()]),               # the read-only built-in Read tool (lesson 16)\n        middlewares=[MyMiddleware(DATA_DIR / \"l21_my_agent.json\")],   # attach the middleware\n    )\n\n    while True:\n        text = input(\"\\nYou: \").strip()\n        if not text:\n            continue\n        if text == \"/exit\":\n            break\n        async for event in agent.reply_stream(UserMsg(name=\"user\", content=text)):\n            if event.type in (EventType.THINKING_BLOCK_DELTA, EventType.TEXT_BLOCK_DELTA):\n                print(event.delta, end=\"\", flush=True)  # print thinking and answer\n        print()\n\n\nasyncio.run(main())"
      }
    },
    {
      "t": "video",
      "zh": "[▶ 08:27](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=507) 演示：先测试 `on_reasoning`，输入「你好」，思考过程和回答被分隔线清楚地分开了。[▶ 09:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=543) 文件夹里出现了 `my_agent.json`，说明 `on_reply` 的保存逻辑也执行了。接着测试工具调用：让模型读取一个文件——第一次读取失败，[▶ 09:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=587) 重试后成功读到内容，「工具开始调用」「工具调用结束」两行都打印了出来。最后问模型叫什么名字，[▶ 10:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=623) 它回答了 `on_system_prompt` 里指定的角色名 AAG。",
      "en": "[▶ 08:27](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=507) Demo: first `on_reasoning` – after typing “hello”, the thinking and the answer are clearly separated by the dividers. [▶ 09:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=543) `my_agent.json` appears in the folder, so `on_reply`'s saving logic ran too. Next the tool call: the model is asked to read a file – the first attempt fails, [▶ 09:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=587) a retry succeeds, and both “tool starts” and “tool done” are printed. Finally the model is asked its name and [▶ 10:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=623) answers with the persona name set in `on_system_prompt`: AAG."
    },
    {
      "t": "code",
      "file": {
        "zh": "输出（用 DeepSeek 实际运行，节选）",
        "en": "Output (a real run with DeepSeek, abridged)"
      },
      "code": {
        "zh": "你 / You: 你好\n[模型调用开始 / model call starts]\n\n////////////// 🧠 思考 / thinking //////////////\nThe user just said hello. Simple greeting.\n////////////// 💬 回答 / answer //////////////\n你好！我是 AAG，有什么可以帮你的吗？\n[模型调用结束 / model call ends]\n\n你 / You: 读一下 data 文件夹里的 l21_note.txt，用一句话总结\n[模型调用开始 / model call starts]\n\n////////////// 🧠 思考 / thinking //////////////\nThe user asks to read l21_note.txt in data folder. ... Let me read.\n[模型调用结束 / model call ends]\n\n[工具开始调用 / tool starts] Read\n[工具调用结束 / tool done] Read\n\n[模型调用开始 / model call starts]\n\n////////////// 🧠 思考 / thinking //////////////\nSummarize in one sentence.\n////////////// 💬 回答 / answer //////////////\n一句话总结：这个文件记录了 AgentScope 中间件的 7 个钩子（on_reply、on_reasoning、……），并用中英双语对照说明。\n[模型调用结束 / model call ends]\n\n你 / You: 你叫什么名字？\n...\n////////////// 💬 回答 / answer //////////////\n我叫 AAG。",
        "en": "You: hello\n[model call starts]\n\n////////////// 🧠 thinking //////////////\nThe user just said hello. Simple greeting.\n////////////// 💬 answer //////////////\nHello! I'm AAG. How can I help you?\n[model call ends]\n\nYou: Read l21_note.txt in the data folder and sum it up in one sentence\n[model call starts]\n\n////////////// 🧠 thinking //////////////\nThe user asks to read l21_note.txt in data folder. ... Let me read.\n[model call ends]\n\n[tool starts] Read\n[tool done] Read\n\n[model call starts]\n\n////////////// 🧠 thinking //////////////\nSummarize in one sentence.\n////////////// 💬 answer //////////////\nIn one sentence: the file lists the 7 hooks of AgentScope middleware (on_reply, on_reasoning, ...), explained side by side in Chinese and English.\n[model call ends]\n\nYou: What is your name?\n...\n////////////// 💬 answer //////////////\nMy name is AAG."
      },
      "lang": "text",
      "note": {
        "zh": "运行后 `practice/data/l21_my_agent.json` 被创建（`on_reply`）。读文件那一轮调用了 2 次模型：第 1 次决定调用 `Read`，第 2 次根据文件内容写回答。DeepSeek 的思考内容是英文的，回答是中文。",
        "en": "After the run `practice/data/l21_my_agent.json` exists (`on_reply`). The file-reading turn called the model twice: first to decide on `Read`, then to write the answer from the file. DeepSeek's thinking was in English and its answers in Chinese (translated above)."
      }
    },
    {
      "t": "p",
      "zh": "[▶ 10:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=623) 老师最后强调：每种钩子都有**自己独立的通道**。比如所有中间件的 `on_reply` 串成一颗洋葱，只给 `on_reply` 用；`on_reasoning` 是另一颗洋葱；[▶ 10:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=654) `on_system_prompt` 则是一条独立的流水线。一个中间件只会加入它重写了的那些钩子的通道。多个中间件时，列表里**第一个是最外层**；`on_system_prompt` 按列表顺序依次加工。",
      "en": "[▶ 10:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=623) Finally the instructor stresses that each kind of hook has **its own separate channel**. All middlewares' `on_reply` hooks form one onion used only for `on_reply`; `on_reasoning` is another onion; [▶ 10:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=22&t=654) `on_system_prompt` is its own pipeline. A middleware joins only the channels of the hooks it overrides. With several middlewares, **the first in the list is the outermost layer**, and `on_system_prompt` hooks run in list order."
    },
    {
      "t": "note",
      "zh": "补充 / Extra（视频没讲）：2.0.9 的 `agentscope.middleware` 还自带几个现成的中间件，用法都是放进 `middlewares=[...]`：\n\n| 中间件 | 作用 |\n|---|---|\n| `RAGMiddleware` | 回答前先检索知识库（17 节） |\n| `ReplyBudgetControlMiddleware(token_budget=...)` | 一次回复用的 token 超过预算，就让模型停止调用工具、直接收尾 |\n| `ModelRouterMiddleware` | 先判断问题类型，再从几个候选模型里挑一个回答 |\n| `TracingMiddleware` | 记录回复、模型调用、工具调用的链路（要先配置追踪服务） |\n| `AgenticMemoryMiddleware` / `Mem0Middleware` / `ReMeMiddleware` | 长期记忆：跨会话记住用户信息 |\n| `TTSMiddleware` | 把回答合成语音 |\n\n另外还有两个本节没用到的钩子：`on_check_permission`（包住一次权限检查，18 节）和 `on_compress_context`（包住上下文压缩，19 节）。只想包住**某一个工具**时，用工具级的 `agentscope.tool.ToolMiddlewareBase`（实现 `on_tool_call`），再传给 `FunctionTool(..., middlewares=[...])`。",
      "en": "Extra (not in the video): `agentscope.middleware` in 2.0.9 also ships ready-made middlewares, all used by putting them into `middlewares=[...]`:\n\n| Middleware | What it does |\n|---|---|\n| `RAGMiddleware` | searches a knowledge base before answering (lesson 17) |\n| `ReplyBudgetControlMiddleware(token_budget=...)` | once a reply uses more tokens than the budget, the model must stop calling tools and wrap up |\n| `ModelRouterMiddleware` | classifies the question first, then picks one of several candidate models |\n| `TracingMiddleware` | records traces of replies, model calls and tool calls (needs a tracing backend) |\n| `AgenticMemoryMiddleware` / `Mem0Middleware` / `ReMeMiddleware` | long-term memory: remembers user information across sessions |\n| `TTSMiddleware` | turns the answer into speech |\n\nTwo more hooks are not used here: `on_check_permission` (wraps one permission check, lesson 18) and `on_compress_context` (wraps context compression, lesson 19). To wrap **one single tool**, use the tool-level `agentscope.tool.ToolMiddlewareBase` (implement `on_tool_call`) and pass it to `FunctionTool(..., middlewares=[...])`."
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "洋葱式和节点式（流水线）中间件的区别是？",
        "en": "How do onion and node-style (pipeline) middleware differ?"
      },
      "options": [
        {
          "zh": "洋葱式每层有「之前」和「之后」，结果会一层层返回；流水线处理完就交给下一个，不再返回",
          "en": "Onion layers have a “before” and an “after” and results travel back out; a pipeline hands on to the next step and never comes back"
        },
        {
          "zh": "洋葱式只能有一层",
          "en": "An onion can only have one layer"
        },
        {
          "zh": "流水线式必须写 `next_handler`",
          "en": "A pipeline step must call `next_handler`"
        },
        {
          "zh": "两者没有区别，只是名字不同",
          "en": "There is no difference, only the name"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "AgentScope 里 `on_reply`、`on_reasoning`、`on_acting`、`on_model_call` 是洋葱；`on_system_prompt` 是流水线：收到提示词，返回新提示词。",
        "en": "In AgentScope `on_reply`, `on_reasoning`, `on_acting` and `on_model_call` are onions; `on_system_prompt` is a pipeline: it receives the prompt and returns a new one."
      }
    },
    {
      "q": {
        "zh": "`on_reasoning` 里为什么要先 `hasattr(event, \"type\")`？",
        "en": "Why does `on_reasoning` check `hasattr(event, \"type\")` first?"
      },
      "options": [
        {
          "zh": "为了让模型思考得更快",
          "en": "To make the model think faster"
        },
        {
          "zh": "因为事件的 `type` 是私有的",
          "en": "Because an event's `type` is private"
        },
        {
          "zh": "因为最后交出来的一项是最终消息 `Msg`，它没有 `type` 属性，直接取会报错",
          "en": "Because the last item is the final `Msg`, which has no `type` attribute – reading it would fail"
        },
        {
          "zh": "因为 `EventType` 没有 `THINKING_BLOCK_START`",
          "en": "Because `EventType` has no `THINKING_BLOCK_START`"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "推理过程交出的大多是事件对象，但最后一项是 `Msg`；`hasattr` 先确认有这个属性，避免 `AttributeError`。",
        "en": "The reasoning step yields mostly event objects, but the last item is a `Msg`; `hasattr` confirms the attribute exists and avoids an `AttributeError`."
      }
    },
    {
      "q": {
        "zh": "模型是 `stream=True` 时，`on_model_call` 里 `await next_handler(...)` 拿到的是？",
        "en": "With `stream=True`, what does `await next_handler(...)` give you inside `on_model_call`?"
      },
      "options": [
        {
          "zh": "一段完整的文字",
          "en": "A complete piece of text"
        },
        {
          "zh": "一个异步生成器，要包起来再返回",
          "en": "An async generator, which you wrap and return"
        },
        {
          "zh": "`None`",
          "en": "`None`"
        },
        {
          "zh": "一个 `Msg` 对象",
          "en": "A `Msg` object"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "流式模型一块一块地产出结果，所以拿到的是异步生成器；定义一个 `async def wrapped()` 逐块 `yield`，最后 `return wrapped()`。`stream=False` 时才是完整的 `ChatResponse`。",
        "en": "A streaming model produces chunks, so you get an async generator; define `async def wrapped()` that yields each chunk and `return wrapped()`. Only with `stream=False` is it a complete `ChatResponse`."
      }
    },
    {
      "q": {
        "zh": "一轮回复里模型先调用了一次工具，再写出答案。`on_model_call` 会执行几次？",
        "en": "Within one reply the model calls a tool once and then writes the answer. How many times does `on_model_call` run?"
      },
      "options": [
        {
          "zh": "1 次，它包住整个生命周期",
          "en": "Once – it wraps the whole life cycle"
        },
        {
          "zh": "0 次，工具调用时不经过它",
          "en": "Never – tool calls bypass it"
        },
        {
          "zh": "3 次",
          "en": "Three times"
        },
        {
          "zh": "2 次，每请求一次模型 API 就执行一次",
          "en": "Twice – once per model API request"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "`on_model_call` 包住每一次模型请求：第 1 次决定调用工具，第 2 次根据工具结果写答案。包住整轮回复的是 `on_reply`。",
        "en": "`on_model_call` wraps each model request: the first decides on the tool, the second writes the answer from its result. `on_reply` is the hook that wraps a whole reply."
      }
    },
    {
      "q": {
        "zh": "用 `DeepSeekChatModel` 运行本节代码，却一条思考分隔线都没出现。最可能的原因是？",
        "en": "Running this lesson's code with `DeepSeekChatModel`, no thinking divider appears at all. Most likely cause?"
      },
      "options": [
        {
          "zh": "没有打开 `thinking_enable=True`：AgentScope 的 DeepSeek 模型默认关闭思考，根本没有思考事件",
          "en": "`thinking_enable=True` is missing: AgentScope's DeepSeek model disables thinking by default, so there are no thinking events"
        },
        {
          "zh": "`on_reply` 没有保存文件",
          "en": "`on_reply` did not save the file"
        },
        {
          "zh": "工具箱里没有 `Read`",
          "en": "There is no `Read` in the toolkit"
        },
        {
          "zh": "`middlewares` 列表里只有一个中间件",
          "en": "There is only one middleware in `middlewares`"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "要 `DeepSeekChatModel(..., parameters=DeepSeekChatModel.Parameters(thinking_enable=True))` 才会产生 `THINKING_BLOCK_START` 等事件。",
        "en": "Only `DeepSeekChatModel(..., parameters=DeepSeekChatModel.Parameters(thinking_enable=True))` produces `THINKING_BLOCK_START` and friends."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "on_reply：回复结束后存档",
        "en": "on_reply: save after the reply"
      },
      "code": "class MyMiddleware([[MiddlewareBase]]):\n    def __init__(self, file_path):\n        self.file_path = file_path\n\n    async def [[on_reply]](self, agent, input_kwargs, next_handler):\n        async for event in [[next_handler]](**input_kwargs):\n            [[yield]] event\n        with open(self.file_path, \"w\", encoding=\"utf-8\") as f:\n            json.dump(agent.[[state]].model_dump(mode=\"json\"), f, ensure_ascii=False, indent=2)",
      "explain": {
        "zh": "洋葱型钩子：`async for` 调用 `next_handler`，把事件 `yield` 出去；循环之后就是「之后」，用 `agent.state.model_dump()` 导出状态。",
        "en": "An onion hook: call `next_handler` with `async for` and `yield` the events; after the loop comes the “after” part, exporting the state with `agent.state.model_dump()`."
      }
    },
    {
      "title": {
        "zh": "on_reasoning 和 on_system_prompt",
        "en": "on_reasoning and on_system_prompt"
      },
      "code": {
        "zh": "async def on_reasoning(self, agent, input_kwargs, next_handler):\n    async for event in next_handler(**input_kwargs):\n        if [[hasattr]](event, \"type\") and event.type == EventType.[[THINKING_BLOCK_START]]:\n            yield [[TextBlockDeltaEvent]](reply_id=event.reply_id, block_id=event.block_id, delta=\"\\n--- 🧠 ---\\n\")\n        yield event\n\nasync def on_system_prompt(self, agent, [[current_prompt]]):\n    [[return]] current_prompt + \"\\n你的角色名叫 AAG。\"",
        "en": "async def on_reasoning(self, agent, input_kwargs, next_handler):\n    async for event in next_handler(**input_kwargs):\n        if [[hasattr]](event, \"type\") and event.type == EventType.[[THINKING_BLOCK_START]]:\n            yield [[TextBlockDeltaEvent]](reply_id=event.reply_id, block_id=event.block_id, delta=\"\\n--- 🧠 ---\\n\")\n        yield event\n\nasync def on_system_prompt(self, agent, [[current_prompt]]):\n    [[return]] current_prompt + \"\\nYour persona name is AAG.\""
      },
      "explain": {
        "zh": "先 `hasattr` 再比较事件类型，插入一个 `TextBlockDeltaEvent`；`on_system_prompt` 收到 `current_prompt`，直接 `return` 新的。",
        "en": "Check `hasattr` before comparing the event type, then insert a `TextBlockDeltaEvent`; `on_system_prompt` receives `current_prompt` and simply `return`s a new one."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：保存状态、打印工具、改提示词的中间件",
        "en": "Write it: a middleware that saves state, prints tools and edits the prompt"
      },
      "task": {
        "zh": "在给好的 import 下面：\n1. 写 `MyMiddleware(MiddlewareBase)`，`__init__` 保存 `file_path`\n2. `on_reply`：把 `next_handler(**input_kwargs)` 的每个事件 `yield` 出去，循环结束后用 `json.dump` 把 `agent.state.model_dump(mode=\"json\")` 写进文件\n3. `on_acting`：前后各打印一行（带上 `input_kwargs[\"tool_call\"].name`），中间把每一项 `yield` 出去\n4. `on_system_prompt`：在 `current_prompt` 末尾加上「你的角色名叫 AAG。」并返回\n5. `main()`：创建 DeepSeek 模型和 `Agent`（`Toolkit(tools=[Read()])`，`middlewares=[MyMiddleware(...)]`），问「你叫什么名字？」并打印；最后 `asyncio.run(main())`\n\n写完复制到 `practice` 文件夹里运行。",
        "en": "Below the given imports:\n1. write `MyMiddleware(MiddlewareBase)` whose `__init__` stores `file_path`\n2. `on_reply`: `yield` every event from `next_handler(**input_kwargs)`; after the loop, `json.dump` `agent.state.model_dump(mode=\"json\")` into the file\n3. `on_acting`: print a line before and after (including `input_kwargs[\"tool_call\"].name`), yielding every item in between\n4. `on_system_prompt`: append “Your persona name is AAG.” to `current_prompt` and return it\n5. `main()`: create a DeepSeek model and an `Agent` (`Toolkit(tools=[Read()])`, `middlewares=[MyMiddleware(...)]`); ask “What is your name?” and print; finally `asyncio.run(main())`\n\nThen copy it into the `practice` folder and run it."
      },
      "starter": {
        "zh": "import asyncio\nimport json\nfrom pathlib import Path\n\nfrom agentscope.agent import Agent\nfrom agentscope.credential import DeepSeekCredential\nfrom agentscope.message import UserMsg\nfrom agentscope.middleware import MiddlewareBase\nfrom agentscope.model import DeepSeekChatModel\nfrom agentscope.tool import Read, Toolkit\n\nfrom llm import API_KEY, MODEL\n\nDATA_DIR = Path(__file__).parent / \"data\"\n\n# 1. 写 MyMiddleware(MiddlewareBase)，__init__ 保存 file_path\n#    on_reply：把事件原样 yield 出去，结束后用 json.dump 保存 agent.state\n#    on_acting：前后各打印一行，中间把 next_handler 的每一项 yield 出去\n#    on_system_prompt：在提示词末尾加上「你的角色名叫 AAG。」\n# 2. main()：创建模型和智能体（工具箱放 Read()，middlewares 放你的中间件），问「你叫什么名字？」并打印",
        "en": "import asyncio\nimport json\nfrom pathlib import Path\n\nfrom agentscope.agent import Agent\nfrom agentscope.credential import DeepSeekCredential\nfrom agentscope.message import UserMsg\nfrom agentscope.middleware import MiddlewareBase\nfrom agentscope.model import DeepSeekChatModel\nfrom agentscope.tool import Read, Toolkit\n\nfrom llm import API_KEY, MODEL\n\nDATA_DIR = Path(__file__).parent / \"data\"\n\n# 1. write MyMiddleware(MiddlewareBase); __init__ stores file_path\n#    on_reply: yield every event, then save agent.state with json.dump\n#    on_acting: print a line before and after; yield every item from next_handler\n#    on_system_prompt: append \"Your persona name is AAG.\" to the prompt\n# 2. main(): model + agent (Read() in the toolkit, your middleware in middlewares); ask \"What is your name?\" and print"
      },
      "solution": {
        "zh": "import asyncio\nimport json\nfrom pathlib import Path\n\nfrom agentscope.agent import Agent\nfrom agentscope.credential import DeepSeekCredential\nfrom agentscope.message import UserMsg\nfrom agentscope.middleware import MiddlewareBase\nfrom agentscope.model import DeepSeekChatModel\nfrom agentscope.tool import Read, Toolkit\n\nfrom llm import API_KEY, MODEL\n\nDATA_DIR = Path(__file__).parent / \"data\"\n\n\nclass MyMiddleware(MiddlewareBase):\n    def __init__(self, file_path):\n        self.file_path = file_path\n\n    async def on_reply(self, agent, input_kwargs, next_handler):\n        async for event in next_handler(**input_kwargs):\n            yield event\n        with open(self.file_path, \"w\", encoding=\"utf-8\") as f:\n            json.dump(agent.state.model_dump(mode=\"json\"), f, ensure_ascii=False, indent=2)\n\n    async def on_acting(self, agent, input_kwargs, next_handler):\n        call = input_kwargs[\"tool_call\"]\n        print(f\"[工具开始调用] {call.name}\")\n        async for item in next_handler(**input_kwargs):\n            yield item\n        print(f\"[工具调用结束] {call.name}\")\n\n    async def on_system_prompt(self, agent, current_prompt):\n        return current_prompt + \"\\n你的角色名叫 AAG。\"\n\n\nasync def main():\n    model = DeepSeekChatModel(credential=DeepSeekCredential(api_key=API_KEY), model=MODEL, stream=False)\n    agent = Agent(\n        name=\"Friday\",\n        system_prompt=\"你是一个简洁的中文助手。\",\n        model=model,\n        toolkit=Toolkit(tools=[Read()]),\n        middlewares=[MyMiddleware(DATA_DIR / \"l21_my_agent.json\")],\n    )\n    reply = await agent.reply(UserMsg(name=\"user\", content=\"你叫什么名字？\"))\n    print(reply.get_text_content())\n\n\nasyncio.run(main())",
        "en": "import asyncio\nimport json\nfrom pathlib import Path\n\nfrom agentscope.agent import Agent\nfrom agentscope.credential import DeepSeekCredential\nfrom agentscope.message import UserMsg\nfrom agentscope.middleware import MiddlewareBase\nfrom agentscope.model import DeepSeekChatModel\nfrom agentscope.tool import Read, Toolkit\n\nfrom llm import API_KEY, MODEL\n\nDATA_DIR = Path(__file__).parent / \"data\"\n\n\nclass MyMiddleware(MiddlewareBase):\n    def __init__(self, file_path):\n        self.file_path = file_path\n\n    async def on_reply(self, agent, input_kwargs, next_handler):\n        async for event in next_handler(**input_kwargs):\n            yield event\n        with open(self.file_path, \"w\", encoding=\"utf-8\") as f:\n            json.dump(agent.state.model_dump(mode=\"json\"), f, ensure_ascii=False, indent=2)\n\n    async def on_acting(self, agent, input_kwargs, next_handler):\n        call = input_kwargs[\"tool_call\"]\n        print(f\"[tool starts] {call.name}\")\n        async for item in next_handler(**input_kwargs):\n            yield item\n        print(f\"[tool done] {call.name}\")\n\n    async def on_system_prompt(self, agent, current_prompt):\n        return current_prompt + \"\\nYour persona name is AAG.\"\n\n\nasync def main():\n    model = DeepSeekChatModel(credential=DeepSeekCredential(api_key=API_KEY), model=MODEL, stream=False)\n    agent = Agent(\n        name=\"Friday\",\n        system_prompt=\"You are a concise assistant.\",\n        model=model,\n        toolkit=Toolkit(tools=[Read()]),\n        middlewares=[MyMiddleware(DATA_DIR / \"l21_my_agent.json\")],\n    )\n    reply = await agent.reply(UserMsg(name=\"user\", content=\"What is your name?\"))\n    print(reply.get_text_content())\n\n\nasyncio.run(main())"
      },
      "checks": [
        {
          "zh": "类继承了 `MiddlewareBase`",
          "en": "The class inherits `MiddlewareBase`",
          "re": "class\\s+\\w+\\s*\\(\\s*MiddlewareBase\\s*\\)"
        },
        {
          "zh": "写了 `async def on_reply(self, agent, input_kwargs, next_handler)`",
          "en": "Defines `async def on_reply(self, agent, input_kwargs, next_handler)`",
          "re": "async\\s+def\\s+on_reply\\s*\\(\\s*self\\s*,\\s*agent\\s*,\\s*input_kwargs\\s*,\\s*next_handler\\s*\\)"
        },
        {
          "zh": "用 `async for ... in next_handler(**input_kwargs)` 调用下一层",
          "en": "Calls the next layer with `async for ... in next_handler(**input_kwargs)`",
          "re": "async\\s+for\\s+\\w+\\s+in\\s+next_handler\\(\\s*\\*\\*input_kwargs\\s*\\)"
        },
        {
          "zh": "把下一层的结果 `yield` 出去",
          "en": "`yield`s what the next layer produced",
          "re": "^\\s+yield\\s+\\w+"
        },
        {
          "zh": "用 `json.dump` 保存 `agent.state.model_dump(...)`",
          "en": "Saves `agent.state.model_dump(...)` with `json.dump`",
          "re": "json\\.dump\\(\\s*agent\\.state\\.model_dump\\("
        },
        {
          "zh": "写了 `on_acting`，取出 `input_kwargs[\"tool_call\"]`",
          "en": "Defines `on_acting` and reads `input_kwargs[\"tool_call\"]`",
          "re": "async\\s+def\\s+on_acting[\\s\\S]*?input_kwargs\\[\\s*[\\\"']tool_call[\\\"']\\s*\\]"
        },
        {
          "zh": "写了 `on_system_prompt` 并返回 `current_prompt + ...`",
          "en": "Defines `on_system_prompt` returning `current_prompt + ...`",
          "re": "async\\s+def\\s+on_system_prompt\\s*\\(\\s*self\\s*,\\s*agent\\s*,\\s*current_prompt\\s*\\)[\\s\\S]*?return\\s+current_prompt\\s*\\+"
        },
        {
          "zh": "用 `middlewares=[...]` 挂上中间件",
          "en": "Attaches it with `middlewares=[...]`",
          "re": "middlewares\\s*=\\s*\\[\\s*MyMiddleware\\("
        },
        {
          "zh": "用 `asyncio.run(main())` 运行",
          "en": "Runs it with `asyncio.run(main())`",
          "re": "asyncio\\.run\\(\\s*main\\(\\)\\s*\\)"
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "洋葱型钩子里只写了 `async for` 却忘了 `yield`：下一层的事件和结果被「吞掉」，输出不见了，工具结果也传不回智能体。",
      "en": "An onion hook with `async for` but no `yield`: the next layer's events and results are swallowed – output disappears and tool results never reach the agent."
    },
    {
      "zh": "钩子名字写错（比如 `on_action`、`on_system_point`）：框架只认 `MiddlewareBase` 里定义的名字，写错的方法根本不会被调用，也不报错。",
      "en": "A misspelt hook name (say `on_action` or `on_system_point`): the framework only recognises the names defined in `MiddlewareBase`, so the method is silently never called."
    },
    {
      "zh": "`on_model_call` 忘了 `return`，或者 `stream=True` 时直接读 `response.usage`：前者让智能体拿到 `None`，后者因为拿到的是异步生成器而报错。",
      "en": "Forgetting `return` in `on_model_call`, or reading `response.usage` with `stream=True`: the first gives the agent `None`, the second fails because the result is an async generator."
    },
    {
      "zh": "`on_reasoning` 里直接 `event.type`，没有先 `hasattr`：遇到最后的 `Msg` 就报 `AttributeError`。",
      "en": "Using `event.type` in `on_reasoning` without `hasattr` first: the final `Msg` raises `AttributeError`."
    },
    {
      "zh": "用 `DeepSeekChatModel` 却没开 `thinking_enable=True`，以为分隔线代码坏了——其实是根本没有思考事件。",
      "en": "Using `DeepSeekChatModel` without `thinking_enable=True` and thinking the divider code is broken – there are simply no thinking events."
    },
    {
      "zh": "`on_system_prompt` 写成洋葱的样子（带 `next_handler`、用 `yield`）：它是流水线型，参数是 `(self, agent, current_prompt)`，直接 `return` 新的提示词。",
      "en": "Writing `on_system_prompt` like an onion hook (with `next_handler` and `yield`): it is a pipeline hook with parameters `(self, agent, current_prompt)` that simply `return`s the new prompt."
    }
  ],
  "recap": [
    {
      "zh": "中间件 = 钩子：不改智能体代码，在关键步骤前后加功能；洋葱式（有之前、之后）和节点式 / 流水线（处理完交给下一个）。",
      "en": "Middleware = hooks: add behaviour before and after key steps without changing the agent; onion style (before and after) and node style / pipeline (process and pass on)."
    },
    {
      "zh": "`on_reply` 包住一整次回复，`on_reasoning` 包住一次思考，`on_acting` 包住一次工具执行，`on_model_call` 包住每一次模型请求，`on_system_prompt` 加工系统提示词。",
      "en": "`on_reply` wraps a whole reply, `on_reasoning` one thinking step, `on_acting` one tool execution, `on_model_call` each model request, and `on_system_prompt` transforms the system prompt."
    },
    {
      "zh": "洋葱钩子的参数是 `(self, agent, input_kwargs, next_handler)`，写法：前置代码 → `async for x in next_handler(**input_kwargs): yield x` → 后置代码。",
      "en": "Onion hooks take `(self, agent, input_kwargs, next_handler)`: before-code → `async for x in next_handler(**input_kwargs): yield x` → after-code."
    },
    {
      "zh": "`on_model_call` 要 `await` 拿结果再返回；流式结果要用一个内部 `async def` 生成器包起来。",
      "en": "`on_model_call` awaits the result and returns it; a streaming result is wrapped in an inner `async def` generator."
    },
    {
      "zh": "中间件放进 `Agent(..., middlewares=[...])`，第一个是最外层；每种钩子有自己独立的通道。",
      "en": "Middlewares go into `Agent(..., middlewares=[...])`, the first being outermost; each kind of hook has its own separate channel."
    }
  ],
  "files": [
    {
      "path": "practice/l21_middleware_todo.py",
      "zh": "练习：照视频补全 `MyMiddleware` 的几个钩子并挂到智能体上（有 TODO 提示）。",
      "en": "Exercise: complete `MyMiddleware`'s hooks as in the video and attach it to an agent (with TODO hints)."
    },
    {
      "path": "practice/l21_middleware_solution.py",
      "zh": "参考答案：视频里的 5 个钩子全部实现，可以聊天验证（已用 DeepSeek 实际运行）。",
      "en": "Solution: all five hooks from the video, which you can check by chatting with the agent (actually run with DeepSeek)."
    },
    {
      "path": "practice/data/l21_note.txt",
      "zh": "给智能体读的小文件，用来触发 `on_acting`。",
      "en": "A small file for the agent to read, to trigger `on_acting`."
    }
  ]
});
