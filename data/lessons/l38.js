COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l38",
  "priority": "important",
  "handwrite": false,
  "studyMinutes": 18,
  "source": "subtitle",
  "summary": {
    "zh": "这一集只有 3 分钟，讲的是概念：LangGraph 给 `stream` 加了 `stream_mode` 参数，让流式输出的「颗粒度」更细——`values` 给完整状态，`updates` 只给变化，`debug` 给尽量多的调试信息。老师重点讲了 AI 应用为什么几乎都用流式输出（让用户尽快看到第一个字），以及它的代价（要做异步架构）。视频没有演示代码，本节补上可运行的例子，并补充实现打字机效果的 `messages` 模式。",
    "en": "This 3-minute episode is about concepts: LangGraph adds a `stream_mode` argument to `stream`, making streaming more fine-grained – `values` gives the full state, `updates` only the changes, `debug` as much detail as possible. The instructor focuses on why AI apps almost always stream (so users see the first words quickly) and on the price (an async architecture). The video shows no code, so this lesson adds runnable examples, plus the `messages` mode for the typewriter effect."
  },
  "goals": [
    {
      "zh": "说出流式输出解决的问题：推理需要时间，第一个字越早出现，用户越不会觉得在干等",
      "en": "Explain the problem streaming solves: inference takes time, and the sooner the first words appear, the less users feel they are waiting"
    },
    {
      "zh": "分清 `values`、`updates`、`debug` 三种模式每次给出的内容",
      "en": "Tell apart what `values`, `updates` and `debug` give you on each step"
    },
    {
      "zh": "知道 `stream` 返回的是生成器，并能自己用 `yield` 写一个",
      "en": "Know that `stream` returns a generator, and write one yourself with `yield`"
    },
    {
      "zh": "知道流式意味着异步：用 `async for` 遍历 `astream`",
      "en": "Know that streaming means async: loop over `astream` with `async for`"
    },
    {
      "zh": "（补充）用 `messages` 模式做出打字机效果，并和 `updates` 一起使用",
      "en": "(Extra) Build the typewriter effect with the `messages` mode and combine it with `updates`"
    }
  ],
  "blocks": [
    {
      "t": "h",
      "zh": "一、LangGraph 的流式输出：多了 stream_mode",
      "en": "1. Streaming in LangGraph: the stream_mode argument"
    },
    {
      "t": "p",
      "zh": "[▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=39&t=1) 老师开门见山：LangGraph 大幅改进了流式输出，一句话概括就是**颗粒度更细**。每个 `stream`（以及异步的 `astream`）都多了一个参数 `stream_mode`，取值不同，流出来的东西就不同。[▶ 00:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=39&t=32) 他点名了三种：\n- `values`：每一步之后输出**完整的状态**\n- `updates`：只输出这一步**更新了什么**\n- `debug`：把能拿到的信息尽量都给你，方便调试",
      "en": "[▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=39&t=1) The instructor gets straight to the point: LangGraph has greatly improved streaming, and in one phrase the change is **finer granularity**. Every `stream` (and the async `astream`) takes a `stream_mode` argument, and different values stream different things. [▶ 00:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=39&t=32) He names three:\n- `values`: the **full state** after each step\n- `updates`: only **what this step changed**\n- `debug`: as much information as possible, for debugging"
    },
    {
      "t": "video",
      "zh": "视频这一集只有 3 分 24 秒，只讲概念：结尾（[▶ 03:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=39&t=192)）老师说「我们来看代码」，这一集就结束了，没有演示代码。下面的代码是本站补上的，在 LangGraph 1.2.12 上实际运行过。另外，老师说「前面 LangChain 部分学过 `stream`、`astream`」：在本课程的编排里 LangChain 排在后面（45、48 节会讲）；原生 SDK 的流式输出见 09 节。",
      "en": "This episode is only 3 minutes 24 seconds and covers concepts only: at the end ([▶ 03:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=39&t=192)) the instructor says “let's look at the code” and the episode stops – no code is shown. The code below was added for this site and run with LangGraph 1.2.12. Also, the instructor says `stream` and `astream` were covered in the LangChain part earlier; in this course's order the LangChain part comes later (lessons 45 and 48), and raw-SDK streaming is in lesson 09."
    },
    {
      "t": "p",
      "zh": "用一个两步的小图来对比。`stream` 的参数和 `invoke` 一样，但它不是等全部跑完再返回，而是要用 `for` 循环一项一项地取：",
      "en": "Compare them on a small two-step graph. `stream` takes the same arguments as `invoke`, but instead of returning once everything has finished, it is read item by item with a `for` loop:"
    },
    {
      "t": "code",
      "file": "stream_modes.py",
      "code": {
        "zh": "from typing import TypedDict\nfrom langgraph.graph import StateGraph, START, END\n\nclass State(TypedDict):\n    topic: str\n    outline: str\n    article: str\n\ndef make_outline(state: State):\n    return {\"outline\": f\"《{state['topic']}》提纲：起因 / 经过 / 结果\"}\n\ndef write_article(state: State):\n    return {\"article\": f\"{state['topic']}的故事写好了。\"}\n\nbuilder = StateGraph(State)\nbuilder.add_node(\"make_outline\", make_outline)\nbuilder.add_node(\"write_article\", write_article)\nbuilder.add_edge(START, \"make_outline\")\nbuilder.add_edge(\"make_outline\", \"write_article\")\nbuilder.add_edge(\"write_article\", END)\ngraph = builder.compile()\n\nfor chunk in graph.stream({\"topic\": \"小猫学游泳\"}, stream_mode=\"values\"):\n    print(chunk)\n# {'topic': '小猫学游泳'}\n# {'topic': '小猫学游泳', 'outline': '《小猫学游泳》提纲：起因 / 经过 / 结果'}\n# {'topic': '小猫学游泳', 'outline': '《小猫学游泳》提纲：……', 'article': '小猫学游泳的故事写好了。'}\n\nfor chunk in graph.stream({\"topic\": \"小猫学游泳\"}, stream_mode=\"updates\"):\n    print(chunk)\n# {'make_outline': {'outline': '《小猫学游泳》提纲：起因 / 经过 / 结果'}}\n# {'write_article': {'article': '小猫学游泳的故事写好了。'}}",
        "en": "from typing import TypedDict\nfrom langgraph.graph import StateGraph, START, END\n\nclass State(TypedDict):\n    topic: str\n    outline: str\n    article: str\n\ndef make_outline(state: State):\n    return {\"outline\": f\"Outline of '{state['topic']}': start / middle / end\"}\n\ndef write_article(state: State):\n    return {\"article\": f\"The story of {state['topic']} is done.\"}\n\nbuilder = StateGraph(State)\nbuilder.add_node(\"make_outline\", make_outline)\nbuilder.add_node(\"write_article\", write_article)\nbuilder.add_edge(START, \"make_outline\")\nbuilder.add_edge(\"make_outline\", \"write_article\")\nbuilder.add_edge(\"write_article\", END)\ngraph = builder.compile()\n\nfor chunk in graph.stream({\"topic\": \"a kitten learning to swim\"}, stream_mode=\"values\"):\n    print(chunk)\n# {'topic': 'a kitten learning to swim'}\n# {'topic': '...', 'outline': \"Outline of '...': start / middle / end\"}\n# {'topic': '...', 'outline': '...', 'article': 'The story of a kitten learning to swim is done.'}\n\nfor chunk in graph.stream({\"topic\": \"a kitten learning to swim\"}, stream_mode=\"updates\"):\n    print(chunk)\n# {'make_outline': {'outline': \"Outline of 'a kitten learning to swim': start / middle / end\"}}\n# {'write_article': {'article': 'The story of a kitten learning to swim is done.'}}"
      }
    },
    {
      "t": "p",
      "zh": "`debug` 每一项是一个字典，`type` 说明是什么事件：`task` 表示某个节点开始运行（附带它收到的输入），`task_result` 表示运行结束（附带返回值和错误信息）；如果图带了 checkpointer，还会有 `checkpoint` 事件。内容很长，下面只打印关键字段：",
      "en": "Each `debug` item is a dict whose `type` names the event: `task` means a node starts (with the input it received), `task_result` means it finished (with its result and any error); with a checkpointer there are `checkpoint` events too. The items are long, so only the key fields are printed:"
    },
    {
      "t": "code",
      "file": "stream_modes.py",
      "code": {
        "zh": "for chunk in graph.stream({\"topic\": \"小猫学游泳\"}, stream_mode=\"debug\"):\n    print(chunk[\"step\"], chunk[\"type\"], chunk[\"payload\"][\"name\"])\n# 1 task make_outline           ← 第 1 步：make_outline 开始（payload 里有它收到的输入）\n# 1 task_result make_outline    ← make_outline 结束（payload 里有返回值、有没有出错）\n# 2 task write_article\n# 2 task_result write_article",
        "en": "for chunk in graph.stream({\"topic\": \"a kitten learning to swim\"}, stream_mode=\"debug\"):\n    print(chunk[\"step\"], chunk[\"type\"], chunk[\"payload\"][\"name\"])\n# 1 task make_outline           <- step 1: make_outline starts (payload holds its input)\n# 1 task_result make_outline    <- make_outline ends (payload holds its result and any error)\n# 2 task write_article\n# 2 task_result write_article"
      }
    },
    {
      "t": "p",
      "zh": "| stream_mode | 每一项是 | 适合 |\n|---|---|---|\n| `values` | 这一步之后的**完整状态**（第一项是输入本身） | 想看状态的全貌 |\n| `updates` | `{节点名: 这个节点返回的改动}` | 想知道哪个节点刚跑完、改了什么 |\n| `debug` | 带 `type`、`step`、`payload` 的详细事件 | 调试 |\n| `messages`（补充，第四部分） | `(token, metadata)` 元组 | 聊天界面逐字显示 |\n\n不写 `stream_mode` 时，`StateGraph` 编译出来的图默认用 `updates`。另外还有 `custom`（节点里用 `get_stream_writer()` 发自定义进度）、`checkpoints`、`tasks` 等，用到时再查。",
      "en": "| stream_mode | Each item is | Good for |\n|---|---|---|\n| `values` | the **full state** after the step (the first item is the input itself) | seeing the whole state |\n| `updates` | `{node_name: what that node returned}` | knowing which node just ran and what it changed |\n| `debug` | a detailed event with `type`, `step` and `payload` | debugging |\n| `messages` (extra, part 4) | a `(token, metadata)` tuple | showing an answer word by word in a chat UI |\n\nWithout `stream_mode`, a compiled `StateGraph` uses `updates`. There are also `custom` (send your own progress from a node with `get_stream_writer()`), `checkpoints`, `tasks` and more – look them up when you need them."
    },
    {
      "t": "check",
      "q": {
        "zh": "想在每个节点跑完时打印「哪个节点完成了」，最合适的是？",
        "en": "You want to print “which node just finished” after each node. Which fits best?"
      },
      "options": [
        {
          "zh": "`stream_mode=\"updates\"`",
          "en": "`stream_mode=\"updates\"`"
        },
        {
          "zh": "`stream_mode=\"values\"`",
          "en": "`stream_mode=\"values\"`"
        },
        {
          "zh": "`invoke(...)`",
          "en": "`invoke(...)`"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "`updates` 的每一项都是 `{节点名: 改动}`，外层的键就是刚跑完的节点。`values` 只给完整状态，看不出是谁改的；`invoke` 要等全部跑完。",
        "en": "Each `updates` item is `{node_name: changes}`; the outer key is the node that just ran. `values` only shows the full state, not who changed it; `invoke` waits for the end."
      }
    },
    {
      "t": "py",
      "title": {
        "zh": "生成器与 yield：要一个，算一个",
        "en": "Generators and yield: one item at a time"
      },
      "zh": "`graph.stream(...)` 不会先把所有结果算好再交给你，而是 `for` 每要一项，图才往前跑一步。这种「要一个、算一个」的对象叫**迭代器**，自己写一个最简单的办法是**生成器函数**：\n- 函数里用 `yield 值`：每 yield 一次，就交出一个值，然后**暂停**在这里\n- 调用生成器函数**不会**马上执行函数体，只是得到一个生成器对象\n- `for x in 生成器`：每取一项，函数就从上次暂停的地方接着运行，直到下一个 `yield`\n- 生成器只能从头到尾走**一遍**；想反复用、想按下标取，就先放进列表（37 节把 `get_state_history` 的结果逐个 `append` 进 `all_states`，就是这个原因）\n\n注意下面最后一段的打印顺序：「运行节点 B」出现在「收到 A」之后，说明 B 是在 `for` 要下一项时才运行的。",
      "en": "`graph.stream(...)` does not compute everything first; the graph moves one step each time the `for` loop asks for an item. Such a “one at a time” object is an **iterator**, and the easiest way to write one yourself is a **generator function**:\n- Inside the function, `yield value` hands over one value and then **pauses** there\n- Calling a generator function does **not** run its body yet; it returns a generator object\n- `for x in generator`: each item resumes the function from where it paused until the next `yield`\n- A generator can be walked through only **once**; to reuse it or index into it, put the items in a list first (that is why lesson 37 appends each result of `get_state_history` to `all_states`)\n\nWatch the print order in the last part: “running node B” appears after “got A”, so B runs only when the `for` loop asks for the next item.",
      "code": {
        "zh": "def fake_stream(text):\n    for word in text.split():\n        yield word                    # 交出一个词，然后在这里暂停\n\ngen = fake_stream(\"流式 输出 就是 边 生成 边 显示\")\nprint(type(gen).__name__)             # generator：函数体还没开始执行\n\nfor word in gen:\n    print(word, end=\" \", flush=True)  # 回顾 09 节：不换行 + 立刻显示\nprint()\nprint(list(gen))                      # []：已经走完一遍，再取就是空的\n\ndef run_graph():\n    print(\"  运行节点 A\")\n    yield {\"A\": \"完成\"}\n    print(\"  运行节点 B\")\n    yield {\"B\": \"完成\"}\n\nfor update in run_graph():            # 每取一项，函数才往下运行到下一个 yield\n    print(\"收到\", update)",
        "en": "def fake_stream(text):\n    for word in text.split():\n        yield word                    # hand over one word, then pause here\n\ngen = fake_stream(\"streaming means showing output while it is generated\")\nprint(type(gen).__name__)             # generator: the body has not started yet\n\nfor word in gen:\n    print(word, end=\" \", flush=True)  # lesson 09: no newline + show immediately\nprint()\nprint(list(gen))                      # []: already used up, nothing left\n\ndef run_graph():\n    print(\"  running node A\")\n    yield {\"A\": \"done\"}\n    print(\"  running node B\")\n    yield {\"B\": \"done\"}\n\nfor update in run_graph():            # each item lets the function run on to the next yield\n    print(\"got\", update)"
      }
    },
    {
      "t": "h",
      "zh": "二、为什么要流式输出",
      "en": "2. Why stream at all"
    },
    {
      "t": "p",
      "zh": "[▶ 01:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=39&t=63) 老师从生产环境讲起：LangGraph 面向的是真实的商业应用，而不管怎么做 AI 应用，都躲不开一个事实——**模型推理需要时间**。普通应用里，用户一操作就该马上有反馈，让用户等得越久，用户流失的可能越大。[▶ 01:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=39&t=94) 推理时间省不掉，最好的办法就是流式输出。它看的是「首字节」：第一个字一生成就马上发给用户，用户看到有反应，就知道系统在工作，而不是让他干等。[▶ 02:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=39&t=127) 这也是为什么几乎所有 AI 应用都是「打字机」式地一个字一个字往外蹦。如果等全部推理完再一次性显示，这段时间用户就只能盯着空白的屏幕。",
      "en": "[▶ 01:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=39&t=63) The instructor starts from production use: LangGraph targets real commercial applications, and however you build an AI app, one fact is unavoidable – **model inference takes time**. In an ordinary app, a user action should get an immediate response; the longer users wait, the more likely they leave. [▶ 01:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=39&t=94) Inference time can't be removed, so the best remedy is streaming. What matters is the “first byte”: as soon as the first piece is generated it goes to the user, who sees a reaction and knows the system is working rather than just waiting. [▶ 02:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=39&t=127) That is why nearly every AI app prints its answer typewriter-style, a few characters at a time. If you waited for the whole answer before showing it, the user would stare at a blank screen the entire time."
    },
    {
      "t": "code",
      "file": "timeline",
      "lang": "text",
      "code": {
        "zh": "不用流式：|—————————— 等待 ——————————| 一下子显示全部\n用流式：  |— 等待 —| 第一个字出现 → 边生成边显示 → 显示完\n          总耗时差不多，但用户「干等」的时间短得多",
        "en": "Without streaming: |———————— waiting ————————| everything appears at once\nWith streaming:    |— waiting —| first word appears → shown as it is generated → done\n                   About the same total time, but far less time staring at a blank screen"
      }
    },
    {
      "t": "tip",
      "zh": "流式输出不会让模型算得更快，总耗时基本一样；它改变的是用户**看到第一个字**的时间，也就是用户觉得自己等了多久。",
      "en": "Streaming does not make the model compute faster – the total time is about the same. What changes is when the user **sees the first words**, i.e. how long the wait feels."
    },
    {
      "t": "h",
      "zh": "三、代价：流式意味着异步",
      "en": "3. The price: streaming means async"
    },
    {
      "t": "p",
      "zh": "[▶ 02:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=39&t=160) 老师也提醒：LangGraph 推荐大部分应用都用流式输出，对用户体验提升很大；但这对系统架构是个挑战。流式输出对应的是**异步开发**，而异步架构比同步架构更考验架构能力。在 LangGraph 里，异步版本叫 `astream`，要在 `async def` 里用 `async for` 遍历（async / await 见 09 节 Python 小课堂）：",
      "en": "[▶ 02:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=39&t=160) The instructor also warns: LangGraph recommends streaming for most apps because it improves the user experience so much, but it challenges your system design. Streaming goes hand in hand with **asynchronous development**, and an async architecture demands more design skill than a synchronous one. In LangGraph the async version is `astream`, looped over with `async for` inside an `async def` (async / await: the Python mini-lesson in lesson 09):"
    },
    {
      "t": "code",
      "file": "stream_modes.py",
      "code": {
        "zh": "import asyncio\n\nasync def main():\n    async for chunk in graph.astream({\"topic\": \"小猫学游泳\"}, stream_mode=\"updates\"):\n        print(chunk)\n\nasyncio.run(main())\n# {'make_outline': {'outline': '《小猫学游泳》提纲：起因 / 经过 / 结果'}}\n# {'write_article': {'article': '小猫学游泳的故事写好了。'}}",
        "en": "import asyncio\n\nasync def main():\n    async for chunk in graph.astream({\"topic\": \"a kitten learning to swim\"}, stream_mode=\"updates\"):\n        print(chunk)\n\nasyncio.run(main())\n# {'make_outline': {'outline': \"Outline of 'a kitten learning to swim': start / middle / end\"}}\n# {'write_article': {'article': 'The story of a kitten learning to swim is done.'}}"
      }
    },
    {
      "t": "note",
      "zh": "为什么真实项目要用异步？网页后端往往同时服务很多用户，每个用户的回答都在一点一点往外流；用异步，服务器在等模型的空档里可以去处理别人的请求。现在知道写法就行，以后做 Web 服务时会用到。",
      "en": "Why do real projects need async? A web back end usually serves many users at once, each with an answer trickling out; with async, the server handles other requests while it waits for the model. For now, just know the syntax – you will need it when you build web services."
    },
    {
      "t": "h",
      "zh": "四、补充：打字机效果——messages 模式",
      "en": "4. Extra: the typewriter effect – the messages mode"
    },
    {
      "t": "p",
      "zh": "视频没有演示代码，这里补上老师说的「打字机」效果在 LangGraph 里怎么做：节点里照常写 `model.invoke(...)`，只要用 `stream_mode=\"messages\"` 运行图，LangGraph 就会把模型生成的每一小段文字（token）实时交出来，节点代码一行都不用改。\n\n每一项是一个**元组**（31 节 Python 小课堂）`(token, metadata)`，用 07 节学过的拆包写成 `for token, metadata in ...`：\n- `token.content`：这一小段文字\n- `metadata[\"langgraph_node\"]`：它来自哪个节点。图里有好几个节点都调用模型时，用它过滤出你想显示的那个",
      "en": "The video shows no code, so here is how the typewriter effect the instructor describes works in LangGraph: write `model.invoke(...)` in the node as usual and run the graph with `stream_mode=\"messages\"`. LangGraph hands you every small piece of text (token) as the model produces it – no change to the node code.\n\nEach item is a **tuple** (see the Python mini-lesson in lesson 31), `(token, metadata)`; unpack it as in lesson 07: `for token, metadata in ...`:\n- `token.content`: this piece of text\n- `metadata[\"langgraph_node\"]`: which node it came from – use it to keep only the node you want when several nodes call models"
    },
    {
      "t": "code",
      "file": "stream_tokens.py",
      "code": {
        "zh": "from typing import TypedDict\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.graph import StateGraph, START, END\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\nclass State(TypedDict):\n    question: str\n    answer: str\n\ndef answer(state: State):\n    reply = model.invoke(state[\"question\"])      # 节点里照常用 invoke\n    return {\"answer\": reply.content}\n\nbuilder = StateGraph(State)\nbuilder.add_node(\"answer\", answer)\nbuilder.add_edge(START, \"answer\")\nbuilder.add_edge(\"answer\", END)\ngraph = builder.compile()\n\ninputs = {\"question\": \"为什么天空是蓝色的？\", \"answer\": \"\"}\nfor token, metadata in graph.stream(inputs, stream_mode=\"messages\"):   # 每一项是 (token, metadata)\n    if metadata[\"langgraph_node\"] == \"answer\":   # 只要 answer 节点里模型说的话\n        print(token.content, end=\"\", flush=True)\nprint()",
        "en": "from typing import TypedDict\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.graph import StateGraph, START, END\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\nclass State(TypedDict):\n    question: str\n    answer: str\n\ndef answer(state: State):\n    reply = model.invoke(state[\"question\"])      # a normal invoke inside the node\n    return {\"answer\": reply.content}\n\nbuilder = StateGraph(State)\nbuilder.add_node(\"answer\", answer)\nbuilder.add_edge(START, \"answer\")\nbuilder.add_edge(\"answer\", END)\ngraph = builder.compile()\n\ninputs = {\"question\": \"Why is the sky blue?\", \"answer\": \"\"}\nfor token, metadata in graph.stream(inputs, stream_mode=\"messages\"):   # each item is (token, metadata)\n    if metadata[\"langgraph_node\"] == \"answer\":   # only what the model says in the answer node\n        print(token.content, end=\"\", flush=True)\nprint()"
      }
    },
    {
      "t": "tip",
      "zh": "DeepSeek 的 `deepseek-flash` 默认先「思考」再回答，思考阶段流出来的片段 `content` 是空字符串，所以第一个看得见的字要等思考结束才出现。想让它更快出现，可以关掉思考模式：`ChatDeepSeek(model=MODEL, api_key=API_KEY, extra_body={\"thinking\": {\"type\": \"disabled\"}})`（40 节也是这么关的）。对比 09 节：原生 SDK 要传 `stream=True` 再自己处理每个 chunk；在 LangGraph 里节点不用改，只改调用方式。",
      "en": "DeepSeek's `deepseek-flash` thinks before it answers by default; the pieces streamed while it thinks have an empty `content`, so the first visible character appears only after the thinking ends. To get it sooner, turn thinking off: `ChatDeepSeek(model=MODEL, api_key=API_KEY, extra_body={\"thinking\": {\"type\": \"disabled\"}})` (lesson 40 does the same). Compare lesson 09: with the raw SDK you pass `stream=True` and handle each chunk yourself; in LangGraph the node stays the same and only the call changes."
    },
    {
      "t": "h",
      "zh": "五、补充：一次要好几种模式",
      "en": "5. Extra: several modes at once"
    },
    {
      "t": "p",
      "zh": "`stream_mode` 也可以传一个**列表**。这时每一项都变成 `(模式名, 内容)` 的元组，拆包后用 `if/elif` 分别处理。下面是 `practice/l38_streaming_solution.py` 的主循环（`graph` 是「整理问题 → 模型回答」的两节点图）：用 `updates` 显示节点进度，用 `messages` 逐字打印，再顺便量一下第一个字和全部完成各用了多久，对应老师说的「首字节」：",
      "en": "`stream_mode` can also be a **list**. Each item then becomes a `(mode_name, content)` tuple; unpack it and handle each kind with `if/elif`. Below is the main loop of `practice/l38_streaming_solution.py` (`graph` has two nodes: tidy up the question, then let the model answer): `updates` shows node progress, `messages` prints the answer piece by piece, and the loop also times the first character against the whole answer – the instructor's “first byte” point:"
    },
    {
      "t": "code",
      "file": "practice/l38_streaming_solution.py",
      "code": {
        "zh": "import time\n\nstart = time.perf_counter()          # 计时开始（单位：秒）\nfirst_token_at = None\nfor mode, chunk in graph.stream(inputs, stream_mode=[\"updates\", \"messages\"]):\n    if mode == \"messages\":\n        token, metadata = chunk                    # 再拆一层：(token, metadata)\n        if metadata[\"langgraph_node\"] == \"answer\" and token.content:\n            if first_token_at is None:             # 第一个看得见的字\n                first_token_at = time.perf_counter() - start\n            print(token.content, end=\"\", flush=True)\n    elif mode == \"updates\":\n        for node_name in chunk:                    # chunk 是 {节点名: 更新}\n            print(f\"\\n[节点完成] {node_name}\")\n\ntotal = time.perf_counter() - start\nprint(f\"第一个字：{first_token_at:.1f} 秒，全部完成：{total:.1f} 秒\")",
        "en": "import time\n\nstart = time.perf_counter()          # start the clock (seconds)\nfirst_token_at = None\nfor mode, chunk in graph.stream(inputs, stream_mode=[\"updates\", \"messages\"]):\n    if mode == \"messages\":\n        token, metadata = chunk                    # unpack once more: (token, metadata)\n        if metadata[\"langgraph_node\"] == \"answer\" and token.content:\n            if first_token_at is None:             # the first visible character\n                first_token_at = time.perf_counter() - start\n            print(token.content, end=\"\", flush=True)\n    elif mode == \"updates\":\n        for node_name in chunk:                    # chunk is {node_name: update}\n            print(f\"\\n[node done] {node_name}\")\n\ntotal = time.perf_counter() - start\nprint(f\"first character: {first_token_at:.1f} s, all done: {total:.1f} s\")"
      }
    },
    {
      "t": "code",
      "file": "output",
      "lang": "text",
      "code": {
        "zh": "[节点完成 / node done] prepare\n太阳光包含各种颜色，其中蓝光波长较短。空气中的氮氧分子会以瑞利散射的方式把蓝光比红光更强烈地散射到四面八方。因此我们从天空各个方向看到大量散射来的蓝光，天空就呈蓝色；紫光虽散射更强，但人眼对蓝光更敏感且部分被高层大气吸收。\n[节点完成 / node done] answer\n第一个字 / first character: 2.3 s，全部完成 / all done: 2.4 s",
        "en": "[node done] prepare\nSunlight contains every colour, and blue light has a shorter wavelength. Nitrogen and oxygen molecules in the air scatter blue light in all directions much more strongly than red light (Rayleigh scattering). So we see plenty of scattered blue light from every part of the sky, and the sky looks blue; violet scatters even more, but our eyes are more sensitive to blue and some violet is absorbed high in the atmosphere.\n[node done] answer\nfirst character: 2.3 s, all done: 2.4 s"
      }
    },
    {
      "t": "p",
      "zh": "这次真实运行里，第一个字在 2.3 秒出现，2.4 秒就全部完成：时间几乎都花在思考上，回答本身很短，很快就流完了。回答越长，「第一个字」和「全部完成」之间的差距越大，流式输出的好处也越明显。`time.perf_counter()` 返回一个以秒为单位的计时数，两次相减就是经过的时间。",
      "en": "In this real run the first character appeared at 2.3 s and everything was done at 2.4 s: almost all the time went into thinking, and the short answer streamed out quickly. The longer the answer, the bigger the gap between the first character and the end, and the more streaming helps. `time.perf_counter()` returns a timer value in seconds; subtracting two readings gives the elapsed time."
    },
    {
      "t": "check",
      "q": {
        "zh": "`stream_mode=[\"updates\", \"messages\"]` 时，`for item in graph.stream(...)` 每次拿到的 `item` 是？",
        "en": "With `stream_mode=[\"updates\", \"messages\"]`, what is each `item` in `for item in graph.stream(...)`?"
      },
      "options": [
        {
          "zh": "完整的状态字典",
          "en": "The full state dict"
        },
        {
          "zh": "只有模型的 token",
          "en": "Only model tokens"
        },
        {
          "zh": "`(模式名, 内容)` 元组，例如 `(\"updates\", {...})`",
          "en": "A `(mode_name, content)` tuple, e.g. `(\"updates\", {...})`"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "传列表时，每一项前面都带上它属于哪种模式，所以通常写成 `for mode, chunk in ...`。",
        "en": "With a list, every item is tagged with its mode, so you usually write `for mode, chunk in ...`."
      }
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "老师认为 AI 应用几乎都用流式输出，最主要的原因是？",
        "en": "According to the instructor, what is the main reason almost every AI app streams its output?"
      },
      "options": [
        {
          "zh": "让模型推理得更快",
          "en": "It makes the model compute faster"
        },
        {
          "zh": "第一个字尽快出现，用户知道系统在工作，不用干等",
          "en": "The first words appear quickly, so users know the system is working instead of just waiting"
        },
        {
          "zh": "能节省 token 费用",
          "en": "It saves token costs"
        },
        {
          "zh": "能让回答更准确",
          "en": "It makes answers more accurate"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "推理时间省不掉，总耗时也差不多；流式输出缩短的是用户看到第一个字之前的等待。",
        "en": "Inference time can't be avoided and the total is about the same; streaming shortens the wait before the user sees the first words."
      }
    },
    {
      "q": {
        "zh": "`stream_mode=\"values\"` 每一项给出的是？",
        "en": "What does each item of `stream_mode=\"values\"` contain?"
      },
      "options": [
        {
          "zh": "刚跑完的节点名",
          "en": "The name of the node that just ran"
        },
        {
          "zh": "模型的一个 token",
          "en": "One model token"
        },
        {
          "zh": "一条调试事件",
          "en": "A debug event"
        },
        {
          "zh": "这一步之后的完整状态",
          "en": "The full state after this step"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "`values` 每一步都给出完整状态（第一项是输入本身）；只想看改动用 `updates`。",
        "en": "`values` gives the full state at every step (the first item is the input itself); use `updates` to see only the changes."
      }
    },
    {
      "q": {
        "zh": "用 `stream_mode=\"updates\"` 运行，节点 `write_article` 跑完时拿到的一项长什么样？",
        "en": "Running with `stream_mode=\"updates\"`, what does the item look like when the node `write_article` finishes?"
      },
      "options": [
        {
          "zh": "`{'write_article': {'article': '……'}}`",
          "en": "`{'write_article': {'article': '……'}}`"
        },
        {
          "zh": "包含 topic、outline、article 的完整状态",
          "en": "The full state with topic, outline and article"
        },
        {
          "zh": "`('write_article', '……')`",
          "en": "`('write_article', '……')`"
        },
        {
          "zh": "只有一个字符串 `'write_article'`",
          "en": "Just the string `'write_article'`"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "`updates` 的每一项都是 `{节点名: 这个节点返回的内容}`，外面套着节点名。",
        "en": "Each `updates` item is `{node_name: what that node returned}`, wrapped in the node name."
      }
    },
    {
      "q": {
        "zh": "`stream_mode=\"debug\"` 会输出什么？",
        "en": "What does `stream_mode=\"debug\"` output?"
      },
      "options": [
        {
          "zh": "只在出错时输出",
          "en": "Output only when something fails"
        },
        {
          "zh": "每个节点开始（`task`）、结束（`task_result`）等详细事件，方便调试",
          "en": "Detailed events such as a node starting (`task`) and finishing (`task_result`), for debugging"
        },
        {
          "zh": "只输出模型的 token",
          "en": "Only model tokens"
        },
        {
          "zh": "和 `values` 完全一样",
          "en": "Exactly the same as `values`"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "老师说 debug 会尽量把能拿到的信息都给你。每一项带 `type`、`step` 和 `payload`（节点名、输入、返回值、错误等）。",
        "en": "As the instructor says, debug gives you as much as it can. Each item has a `type`, a `step` and a `payload` (node name, input, result, error and so on)."
      }
    },
    {
      "q": {
        "zh": "写了 `result = graph.stream(inputs)`，之后再也没有用 `result`。图里的节点会运行吗？",
        "en": "You write `result = graph.stream(inputs)` and never touch `result` again. Do the nodes run?"
      },
      "options": [
        {
          "zh": "会，和 `invoke` 一样全部运行",
          "en": "Yes, all of them, just like `invoke`"
        },
        {
          "zh": "只运行第一个节点",
          "en": "Only the first node runs"
        },
        {
          "zh": "不会：没有 `for` 去取，生成器就不会往下执行",
          "en": "No: without a `for` loop asking for items, the generator never runs"
        },
        {
          "zh": "会报错",
          "en": "It raises an error"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "`stream` 返回的是「要一个、算一个」的生成器，不去取就什么都不会发生。",
        "en": "`stream` returns a one-at-a-time generator; if nothing asks for items, nothing happens."
      }
    },
    {
      "q": {
        "zh": "在 `async def main():` 里流式运行图，应该怎么写？",
        "en": "Inside `async def main():`, how do you stream the graph?"
      },
      "options": [
        {
          "zh": "`for chunk in graph.astream(...):`",
          "en": "`for chunk in graph.astream(...):`"
        },
        {
          "zh": "`await graph.stream(...)`",
          "en": "`await graph.stream(...)`"
        },
        {
          "zh": "`graph.astream(...).run()`",
          "en": "`graph.astream(...).run()`"
        },
        {
          "zh": "`async for chunk in graph.astream(...):`",
          "en": "`async for chunk in graph.astream(...):`"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "`astream` 是异步生成器，要用 `async for` 遍历，最外面再用 `asyncio.run(main())` 启动（09 节）。",
        "en": "`astream` is an async generator: loop over it with `async for`, and start everything with `asyncio.run(main())` (lesson 09)."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "三种模式和异步版本",
        "en": "Three modes and the async version"
      },
      "code": {
        "zh": "for chunk in graph.stream(inputs, stream_mode=\"[[values]]\"):     # 每一步之后的完整状态 / full state after each step\n    print(chunk)\n\nfor chunk in graph.stream(inputs, stream_mode=\"[[updates]]\"):    # {节点名: 改动} / {node_name: changes}\n    print(chunk)\n\nfor chunk in graph.stream(inputs, stream_mode=\"[[debug]]\"):      # 尽量详细的调试事件 / detailed debug events\n    print(chunk[\"type\"])\n\nasync def main():\n    [[async]] for chunk in graph.[[astream]](inputs, stream_mode=\"updates\"):\n        print(chunk)\n\nasyncio.[[run]](main())",
        "en": "for chunk in graph.stream(inputs, stream_mode=\"[[values]]\"):     # full state after each step\n    print(chunk)\n\nfor chunk in graph.stream(inputs, stream_mode=\"[[updates]]\"):    # {node_name: changes}\n    print(chunk)\n\nfor chunk in graph.stream(inputs, stream_mode=\"[[debug]]\"):      # detailed debug events\n    print(chunk[\"type\"])\n\nasync def main():\n    [[async]] for chunk in graph.[[astream]](inputs, stream_mode=\"updates\"):\n        print(chunk)\n\nasyncio.[[run]](main())"
      },
      "explain": {
        "zh": "`values` 完整状态，`updates` 只看改动，`debug` 详细事件；异步版本用 `async for` 遍历 `astream`，再用 `asyncio.run` 启动。",
        "en": "`values` = full state, `updates` = changes only, `debug` = detailed events; the async version loops over `astream` with `async for` and is started with `asyncio.run`."
      }
    },
    {
      "title": {
        "zh": "节点进度 + 逐字输出",
        "en": "Node progress + token output"
      },
      "code": {
        "zh": "for mode, chunk in graph.[[stream]](inputs, stream_mode=[\"[[updates]]\", \"[[messages]]\"]):\n    if mode == \"messages\":\n        [[token]], metadata = chunk\n        if metadata[\"[[langgraph_node]]\"] == \"answer\":\n            print(token.[[content]], end=\"\", [[flush]]=True)\n    elif mode == \"updates\":\n        for node_name in chunk:\n            print(\"[节点完成]\", node_name)",
        "en": "for mode, chunk in graph.[[stream]](inputs, stream_mode=[\"[[updates]]\", \"[[messages]]\"]):\n    if mode == \"messages\":\n        [[token]], metadata = chunk\n        if metadata[\"[[langgraph_node]]\"] == \"answer\":\n            print(token.[[content]], end=\"\", [[flush]]=True)\n    elif mode == \"updates\":\n        for node_name in chunk:\n            print(\"[node done]\", node_name)"
      },
      "explain": {
        "zh": "多模式时每项是 `(mode, chunk)`；`messages` 的 chunk 还要再拆成 `(token, metadata)`。",
        "en": "With several modes each item is `(mode, chunk)`; a `messages` chunk unpacks again into `(token, metadata)`."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：一个会逐字输出的单节点图",
        "en": "Write it: a one-node graph that streams tokens"
      },
      "task": {
        "zh": "写一个最小的图并让它逐字输出：\n1. 定义 `State`（`question`、`answer` 两个字符串字段）\n2. 节点 `answer`：用 `model` 回答问题，返回 `{\"answer\": ...}`\n3. 搭图 START → answer → END 并编译\n4. 用 `stream_mode=\"messages\"` 运行，`for token, metadata in ...` 拆包，把 `token.content` 不换行、立刻打印出来\n\n存到 `practice` 文件夹里用 `.venv` 运行（会调用一次模型）。",
        "en": "Write a minimal graph that streams its answer:\n1. define `State` (string fields `question` and `answer`)\n2. node `answer`: answer the question with `model` and return `{\"answer\": ...}`\n3. build START → answer → END and compile\n4. run it with `stream_mode=\"messages\"`, unpack with `for token, metadata in ...`, and print `token.content` without newlines, flushed immediately\n\nSave it in the `practice` folder and run it with `.venv` (one model call)."
      },
      "starter": {
        "zh": "from typing import TypedDict\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.graph import StateGraph, START, END\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 1. 定义状态 State：question 和 answer 两个字符串字段\n\n\n# 2. 定义节点 answer：用 model 回答 state 里的问题，返回 {\"answer\": ...}\n\n\n# 3. 搭图：START → answer → END，编译成 graph\n\n\n# 4. 用 \"messages\" 模式流式运行，把模型的回答一个字一个字地打印出来",
        "en": "from typing import TypedDict\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.graph import StateGraph, START, END\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 1. define the State: two string fields, question and answer\n\n\n# 2. define the answer node: use model to answer the question in the state; return {\"answer\": ...}\n\n\n# 3. build the graph START -> answer -> END and compile it into graph\n\n\n# 4. stream it in \"messages\" mode and print the model's answer piece by piece"
      },
      "solution": {
        "zh": "from typing import TypedDict\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.graph import StateGraph, START, END\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 1. 定义状态 State：question 和 answer 两个字符串字段\nclass State(TypedDict):\n    question: str\n    answer: str\n\n# 2. 定义节点 answer：用 model 回答 state 里的问题，返回 {\"answer\": ...}\ndef answer(state: State):\n    reply = model.invoke(state[\"question\"])\n    return {\"answer\": reply.content}\n\n# 3. 搭图：START → answer → END，编译成 graph\nbuilder = StateGraph(State)\nbuilder.add_node(\"answer\", answer)\nbuilder.add_edge(START, \"answer\")\nbuilder.add_edge(\"answer\", END)\ngraph = builder.compile()\n\n# 4. 用 \"messages\" 模式流式运行，把模型的回答一个字一个字地打印出来\ninputs = {\"question\": \"用三句话介绍一下长城。\", \"answer\": \"\"}\nfor token, metadata in graph.stream(inputs, stream_mode=\"messages\"):\n    print(token.content, end=\"\", flush=True)\nprint()",
        "en": "from typing import TypedDict\nfrom langchain_deepseek import ChatDeepSeek\nfrom langgraph.graph import StateGraph, START, END\nfrom llm import API_KEY, MODEL\n\nmodel = ChatDeepSeek(model=MODEL, api_key=API_KEY)\n\n# 1. define the State: two string fields, question and answer\nclass State(TypedDict):\n    question: str\n    answer: str\n\n# 2. define the answer node: use model to answer the question in the state; return {\"answer\": ...}\ndef answer(state: State):\n    reply = model.invoke(state[\"question\"])\n    return {\"answer\": reply.content}\n\n# 3. build the graph START -> answer -> END and compile it into graph\nbuilder = StateGraph(State)\nbuilder.add_node(\"answer\", answer)\nbuilder.add_edge(START, \"answer\")\nbuilder.add_edge(\"answer\", END)\ngraph = builder.compile()\n\n# 4. stream it in \"messages\" mode and print the model's answer piece by piece\ninputs = {\"question\": \"Describe the Great Wall in three sentences.\", \"answer\": \"\"}\nfor token, metadata in graph.stream(inputs, stream_mode=\"messages\"):\n    print(token.content, end=\"\", flush=True)\nprint()"
      },
      "checks": [
        {
          "zh": "用 `TypedDict` 定义了 `State`",
          "en": "Defines `State` with `TypedDict`",
          "re": "class\\s+State\\s*\\(\\s*TypedDict\\s*\\)\\s*:"
        },
        {
          "zh": "节点里调用了 `model.invoke(...)`",
          "en": "The node calls `model.invoke(...)`",
          "re": "model\\.invoke\\("
        },
        {
          "zh": "加了 `START → \"answer\"` 的边",
          "en": "Adds the edge `START → \"answer\"`",
          "re": "add_edge\\(\\s*START\\s*,\\s*[\"']answer[\"']\\s*\\)"
        },
        {
          "zh": "用 `stream_mode=\"messages\"` 运行",
          "en": "Runs with `stream_mode=\"messages\"`",
          "re": "stream_mode\\s*=\\s*[\"']messages[\"']"
        },
        {
          "zh": "`for token, metadata in ...` 拆包",
          "en": "Unpacks with `for token, metadata in ...`",
          "re": "for\\s+\\w+\\s*,\\s*\\w+\\s+in\\s+graph\\.stream\\("
        },
        {
          "zh": "不换行、立刻显示：`print(token.content, end=\"\", flush=True)`",
          "en": "No newline, shown at once: `print(token.content, end=\"\", flush=True)`",
          "re": "print\\(\\s*\\w+\\.content\\s*,\\s*end\\s*=\\s*(\"\"|'')\\s*,\\s*flush\\s*=\\s*True\\s*\\)"
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "把 `stream` 当 `invoke` 用：`result = graph.stream(...)` 只拿到一个生成器，不用 `for` 去取，节点一个都不会运行。",
      "en": "Treating `stream` like `invoke`: `result = graph.stream(...)` is only a generator; without a `for` loop no node runs at all."
    },
    {
      "zh": "以为流式输出能让回答更快生成：总耗时基本不变，变的是第一个字出现的时间。",
      "en": "Expecting streaming to make the answer faster: the total time barely changes; what changes is when the first words appear."
    },
    {
      "zh": "`updates` 模式的每一项外面还套着节点名：要写 `chunk[\"write_article\"][\"article\"]`，或者 `for node_name, update in chunk.items()`。",
      "en": "Forgetting that each `updates` item is wrapped in the node name: write `chunk[\"write_article\"][\"article\"]`, or `for node_name, update in chunk.items()`."
    },
    {
      "zh": "在普通函数里写 `for chunk in graph.astream(...)`：`astream` 要在 `async def` 里用 `async for`，再用 `asyncio.run(...)` 启动。",
      "en": "Writing `for chunk in graph.astream(...)` in a normal function: `astream` needs `async for` inside an `async def`, started with `asyncio.run(...)`."
    },
    {
      "zh": "`messages` 模式忘了拆包，直接 `print(chunk)`，打印出一长串 `(AIMessageChunk(...), {...})`；逐字打印时没写 `end=\"\"` 或 `flush=True`，每个 token 占一行或者攒一阵才显示。",
      "en": "Not unpacking in `messages` mode and calling `print(chunk)`, which prints a long `(AIMessageChunk(...), {...})`; or printing tokens without `end=\"\"` / `flush=True`, so each token gets its own line or output arrives in bursts."
    },
    {
      "zh": "`stream_mode` 传了列表，却还按单一模式处理：这时每一项都是 `(mode, chunk)` 元组。",
      "en": "Passing a list as `stream_mode` but handling items as if there were one mode: every item is now a `(mode, chunk)` tuple."
    }
  ],
  "recap": [
    {
      "zh": "LangGraph 的流式输出「颗粒度更细」：`stream` / `astream` 多了 `stream_mode` 参数。",
      "en": "LangGraph streaming is more fine-grained: `stream` / `astream` take a `stream_mode` argument."
    },
    {
      "zh": "`values` = 每一步之后的完整状态；`updates` = `{节点名: 改动}`（默认）；`debug` = 尽量详细的调试事件。",
      "en": "`values` = the full state after each step; `updates` = `{node_name: changes}` (the default); `debug` = detailed debugging events."
    },
    {
      "zh": "流式输出的意义：推理时间省不掉，但第一个字可以马上出现，用户不必干等。",
      "en": "Why stream: inference time can't be avoided, but the first words can appear at once, so users aren't left waiting."
    },
    {
      "zh": "代价是异步架构：`async def` + `async for chunk in graph.astream(...)` + `asyncio.run(...)`。",
      "en": "The price is an async architecture: `async def` + `async for chunk in graph.astream(...)` + `asyncio.run(...)`."
    },
    {
      "zh": "（补充）`messages` = `(token, metadata)`：节点里普通的 `model.invoke` 也能逐字流出；多模式时循环写成 `for mode, chunk in ...`。",
      "en": "(Extra) `messages` = `(token, metadata)`: a plain `model.invoke` in a node still streams; with several modes loop with `for mode, chunk in ...`."
    },
    {
      "zh": "生成器：`yield` 交出一个值并暂停，只能遍历一遍。",
      "en": "Generators: `yield` hands over a value and pauses; they can be walked through once."
    }
  ],
  "files": [
    {
      "zh": "演示（不调用模型、免费）：同一个图分别用 values、updates、debug 运行，再看默认模式和 astream。",
      "en": "Demo (no model calls, free): one graph run with values, updates and debug, plus the default mode and astream.",
      "path": "practice/l38_stream_modes.py"
    },
    {
      "zh": "练习：补全同时处理 updates 和 messages 两种模式的循环（有 TODO 提示）。",
      "en": "Exercise: write the loop that handles updates and messages together (with TODO hints).",
      "path": "practice/l38_streaming_todo.py"
    },
    {
      "zh": "上面练习的参考答案，顺便计时第一个字和全部完成（调用模型 1 次）。",
      "en": "Reference solution, which also times the first character and the whole answer (1 model call).",
      "path": "practice/l38_streaming_solution.py"
    }
  ]
});
