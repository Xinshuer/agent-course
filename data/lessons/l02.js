COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l02",
  "priority": "overview",
  "handwrite": false,
  "studyMinutes": 45,
  "source": "subtitle",
  "summary": {
    "zh": "这一集从三个维度给 Agent 分类。重点是第一个维度：按智力水平和决策过程分成五类——简单反射型、基于模型的反射型、基于目标型、基于效用型、学习型。这既是分类，也是 Agent 一步步变聪明的过程。前三类主要用恒温水壶和自动驾驶来讲，后两类换成了「条条大路通罗马」和马车的例子。另外两个维度是按互动方式（互动型、自主型）和按数量（单 Agent、多 Agent）。最后的建议是：先互动、后自主，先单个、后多个，效果不够再一步步升级。",
    "en": "This episode classifies agents along three dimensions. The focus is the first: by intelligence level and decision process there are five types – simple reflex, model-based reflex, goal-based, utility-based and learning agents. It is both a classification and the path along which agents grow smarter. The first three types are explained mainly with a thermostatic kettle and a self-driving car; the last two use “all roads lead to Rome” and a horse-drawn carriage. The other two dimensions are interaction (interactive vs autonomous) and number (single vs multi-agent). His closing advice: interactive before autonomous, single before multiple, and upgrade step by step only when the results fall short."
  },
  "goals": [
    {
      "zh": "说出视频的三个分类维度，知道哪一个是重点",
      "en": "Name the video's three dimensions and say which one is the focus"
    },
    {
      "zh": "按顺序说出五类 Agent，并用恒温水壶或自动驾驶的例子说清每一类比前一类多了什么",
      "en": "List the five types in order and use the kettle or self-driving example to say what each one adds to the previous one"
    },
    {
      "zh": "分清反射类回答「要不要做」，基于目标型和基于效用型回答「怎么做」",
      "en": "Tell that the reflex types answer “whether to act” while the goal- and utility-based types answer “how to act”"
    },
    {
      "zh": "说出互动型和自主型各自的优缺点，以及为什么敏感场景要有人监督",
      "en": "Give the pros and cons of interactive and autonomous agents, and say why sensitive settings need human oversight"
    },
    {
      "zh": "说出单 Agent 的局限和多 Agent 的几种配合方式，以及课程为什么先从单 Agent 做起",
      "en": "Explain the limits of a single agent, the ways several agents can work together, and why the course starts with one"
    },
    {
      "zh": "读懂 Python 用缩进划分代码块",
      "en": "Read how Python uses indentation to group code into blocks"
    }
  ],
  "blocks": [
    {
      "t": "h",
      "zh": "一、三个分类维度",
      "en": "1. Three dimensions"
    },
    {
      "t": "video",
      "zh": "这一集约 34 分钟，全是概念、没有代码，老师边讲边展示几张 Agent 结构图。顺序是：\n1. [▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=0) 先交代三个分类维度，指出第一个维度是重点\n2. [▶ 01:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=63) 五类 Agent：简单反射 → 基于模型的反射 → 基于目标 → 基于效用 → 学习型。前三类主要拿**恒温水壶**和**自动驾驶**举例，后两类用「条条大路通罗马」和马车来讲\n3. [▶ 23:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=1400) 按互动方式：互动型和自主型，用《流浪地球》里的 MOSS 说明完全自主的风险\n4. [▶ 28:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=1686) 按数量：单 Agent 和多 Agent，顺带比较微软以多 Agent 为中心的框架和课程要用的 OpenAI 框架\n5. [▶ 31:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=1902) 落地建议和总结：没有唯一正确的类型，按场景选、逐步升级\n\n讲义按同样的顺序整理（依据是这一集的 AI 字幕）。讲义里那几段能运行的小代码是补充的，视频里没有。",
      "en": "This episode runs about 34 minutes: all concepts, no code, with the instructor talking through several agent structure diagrams. The order:\n1. [▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=0) The three dimensions, with the first one marked as the focus\n2. [▶ 01:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=63) Five agent types: simple reflex → model-based reflex → goal-based → utility-based → learning. The first three are illustrated mainly with a **thermostatic kettle** and a **self-driving car**, the last two with “all roads lead to Rome” and a horse-drawn carriage\n3. [▶ 23:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=1400) By interaction: interactive vs autonomous, with MOSS from the film *The Wandering Earth* showing the risk of full autonomy\n4. [▶ 28:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=1686) By number: single vs multi-agent, plus a comparison of Microsoft's multi-agent-first framework with the OpenAI framework this course uses\n5. [▶ 31:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=1902) Practical advice and summary: no single right type – choose by scenario and upgrade step by step\n\nThese notes follow the same order (based on the episode's AI subtitles). The small runnable code snippets are extras from these notes; the video has none."
    },
    {
      "t": "p",
      "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=0) 老师从三个维度给 Agent 分类：\n\n| 维度 | 分成哪几类 | 说明 |\n|---|---|---|\n| 智力水平和决策过程 | 简单反射型、基于模型的反射型、基于目标型、基于效用型、学习型 | **本节重点**：既是分类，也是智力一步步升级的过程 |\n| 互动方式 | 互动型、自主型 | 普通的分类：人参不参与 |\n| 数量 | 单 Agent、多 Agent | 普通的分类：几个 Agent 一起干 |\n\n第一个维度之所以重要，是因为五类 Agent 是**一级一级往上搭**的：后一类在前一类的基础上多了一样东西。弄清楚每一级多了什么，就明白 Agent 的「聪明」是怎么一点点来的。",
      "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=0) The instructor classifies agents along three dimensions:\n\n| Dimension | Types | Note |\n|---|---|---|\n| Intelligence level and decision process | Simple reflex, model-based reflex, goal-based, utility-based, learning | **The focus of this lesson**: a classification and also a ladder of growing intelligence |\n| Interaction | Interactive, autonomous | A plain classification: does a human take part? |\n| Number | Single agent, multi-agent | A plain classification: how many agents work on it? |\n\nThe first dimension matters most because the five types are **built one on top of another**: each adds one thing to the type before it. Once you see what each step adds, you see where an agent's “intelligence” comes from."
    },
    {
      "t": "h",
      "zh": "二、五类 Agent：从「条件反射」到「自己学习」",
      "en": "2. Five types: from reflexes to learning"
    },
    {
      "t": "p",
      "zh": "[▶ 01:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=63) 五类 Agent 都符合 01 节的定义：右边是环境，Agent **感知**环境，在内部做出**决策**，再**行动**去改变环境。它们的区别全在 Agent **内部**怎么做决定。\n\n**1. 简单反射型**\n\n内部只做两件事：先看「现在世界是什么样」，再到**「条件 → 动作」规则**里找一条符合的去执行；没有符合的规则，就什么也不做。简单粗暴。\n\n[▶ 02:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=157) 老师的例子是一个设定为 45 度的**恒温水壶**：它不停地测水温，测到 40 度，符合「低于 45 度就加热」这条规则，于是加热；水温升上去、不再符合这条规则，就停止加热。\n\n这么简单的东西为什么还要讲？一是它是后面几类的基础；二是它有一个实在的优点：**不做复杂思考，所以反应很快**。[▶ 04:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=281) 老师举了自动驾驶的例子：前车的刹车灯一亮、或者明显减速，这时候不需要做什么复杂分析，就该马上提醒、停止加速，必要时刹车。所以哪怕在自动驾驶这样复杂的系统里，也会有简单反射的部分。\n\n缺点也很明显：智力水平不高，能用的场景有限。",
      "en": "[▶ 01:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=63) All five types fit the definition from lesson 01: on the right is the environment; the agent **perceives** it, makes a **decision** inside, then **acts** to change the environment. What differs is entirely how the agent decides **inside**.\n\n**1. Simple reflex agent**\n\nInside, it does just two things: it looks at “what the world is like now”, then finds a matching **condition → action rule** and carries it out; if no rule matches, it does nothing. Blunt and simple.\n\n[▶ 02:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=157) The instructor's example is a **thermostatic kettle** set to 45 °C. It keeps measuring the water; at 40 °C the rule “below 45, heat” matches, so it heats; once the water is hot enough that the rule no longer matches, it stops.\n\nWhy study something this simple? First, it is the foundation of the later types. Second, it has a real strength: **it does no complex thinking, so it reacts fast**. [▶ 04:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=281) The instructor's example is self-driving: when the car ahead lights its brake lights or clearly slows down, there is no time for complex analysis – warn at once, stop accelerating and brake if needed. So even a system as complex as a self-driving car contains simple reflex parts.\n\nThe weakness is just as clear: low intelligence, so it fits only a narrow range of situations."
    },
    {
      "t": "py",
      "title": {
        "zh": "缩进：Python 怎么把代码分成块",
        "en": "Indentation: how Python groups code into blocks"
      },
      "zh": "`print(...)` 和 `#` 注释在 01 节的 Python 小课堂里已经认识了。这一节的演示代码里开始出现**缩进**，它决定哪几行代码是「一组」的：\n- 以冒号 `:` 结尾的那一行（比如 `if ...:`、`def ...:`、`for ...:`），下面**多缩进 4 个空格**的几行都归它管，组成一个「代码块」。\n- 缩进退回去，这一块就结束了，后面的代码不再归它管。\n- Python 靠缩进来分块，所以缩进不能随便加减；同一块里的几行要对齐。\n\n下面就是恒温水壶的那条规则。先运行一次，再把 `40` 改成 `50` 运行一次：缩进的两行不执行了，没缩进的最后一行照样执行。",
      "en": "You met `print(...)` and `#` comments in the Python mini-lesson of lesson 01. From this lesson on, the demo code uses **indentation**, which decides which lines belong together:\n- A line ending in a colon `:` (such as `if ...:`, `def ...:`, `for ...:`) owns the lines below it that are **indented 4 more spaces** – together they form a “block”.\n- Where the indentation steps back, the block ends; later lines no longer belong to it.\n- Python uses indentation to group code, so you can't add or remove it freely, and the lines of one block must line up.\n\nBelow is the kettle's rule. Run it once, then change `40` to `50` and run it again: the two indented lines no longer run, while the unindented last line still does.",
      "code": {
        "zh": "temp = 40                    # 水壶现在测到的水温\nif temp < 45:                # 冒号结尾：下面缩进 4 格的两行归它管\n    print(\"水温偏低\")\n    print(\"→ 加热\")          # 这就是一条「条件 → 动作」规则\nprint(\"检查完毕\")             # 没有缩进：不管条件成不成立都会执行",
        "en": "temp = 40                    # the water temperature the kettle measures now\nif temp < 45:                # ends with a colon: the two lines indented 4 spaces belong to it\n    print(\"Water is too cool\")\n    print(\"-> heat\")         # exactly a \"condition -> action\" rule\nprint(\"Check finished\")      # not indented: runs whether or not the condition holds"
      },
      "note": {
        "zh": "`temp = 40` 这种写法叫变量，04 节讲；`if` 和比较大小在 05 节讲。现在只要记住：**冒号 + 缩进 = 归它管**。下面的演示里还会看到 `def`（定义函数）和 `for`（循环），它们下面也是一层套一层地缩进。",
        "en": "`temp = 40` is a variable (lesson 04); `if` and comparisons come in lesson 05. For now just remember: **colon + indentation = belongs to it**. The demos below also use `def` (define a function) and `for` (a loop); their bodies are indented the same way, blocks inside blocks."
      }
    },
    {
      "t": "p",
      "zh": "**2. 基于模型的反射型**\n\n[▶ 05:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=343) 对比两张结构图，这一张在 Agent 内部多了一个「模型」。注意：这里的模型**不是大模型**，而是 Agent 对世界的一份**内部记录**，其中最重要的是**维护状态**——记住之前发生过什么。有了历史，才能**预测未来**。\n\n还是恒温水壶：现在测到 40 度，但它记得一分钟前水还是 0 度。一分钟就升了 40 度，照这个速度，再过一会儿就会远远超过 45 度，所以现在**反而不该加热**，否则会烧过头。\n\n[▶ 07:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=466) 自动驾驶也一样：看到前车刹车灯亮着，要不要马上刹车？不一定。如果它记得前车的刹车灯已经亮了很久，车速一直平稳、车距也没变，那就不用刹；如果刹车灯是刚刚一下子亮到最亮，那就得立刻制动。\n\n相比简单反射型，它能根据过去预测未来，再按预测做决定，所以更灵活、更准。但它依赖的只是内部记录，对外部持续变化的掌握不多，**仍然做不到全知全能**。\n\n下面的小演示把两种水壶放在一起：同样一串水温，看它们在哪几次做出了不同的决定。",
      "en": "**2. Model-based reflex agent**\n\n[▶ 05:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=343) Compare the two structure diagrams: this one has an extra “model” inside the agent. Note that this model is **not an LLM** – it is the agent's **internal record** of the world, and its most important job is **keeping state**: remembering what happened before. With a history, the agent can **predict the future**.\n\nBack to the kettle: it now reads 40 °C, but it remembers the water was 0 °C a minute ago. A rise of 40 degrees in one minute means it will soon shoot far past 45, so right now it should **stop heating**, or it will overshoot.\n\n[▶ 07:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=466) Self-driving works the same way. The car ahead has its brake lights on – brake at once? Not necessarily. If the agent remembers that those lights have been on for a long time while the speed and the gap stayed steady, there is no need to brake; if the lights have just flared to full brightness, it must brake immediately.\n\nCompared with the simple reflex agent, it predicts the future from the past and decides on that prediction, so it is more flexible and more accurate. But it relies only on its internal record and knows little about ongoing changes outside, so it is **still far from all-knowing**.\n\nThe small demo below puts the two kettles side by side: the same series of readings – watch where their decisions differ."
    },
    {
      "t": "code",
      "file": {
        "zh": "两种水壶.py",
        "en": "two_kettles.py"
      },
      "run": true,
      "code": {
        "zh": "# 恒温水壶，目标 45 度。下面是每隔 10 秒测到的水温（假数据）\nreadings = [20, 30, 40, 44, 47, 46, 44]\n\ndef simple_reflex(temp):\n    \"\"\"简单反射型：只看这一次的温度，按规则反应。\"\"\"\n    if temp < 45:\n        return \"加热\"\n    return \"停止\"\n\ndef model_based(temp, last_temp):\n    \"\"\"基于模型的反射型：还记得上一次的温度，先预测，再按规则反应。\"\"\"\n    predicted = temp + (temp - last_temp)    # 照刚才的升温速度，推测 10 秒后的水温\n    if predicted < 45:\n        return \"加热\"\n    return \"停止（预测会到 \" + str(predicted) + \" 度）\"\n\nlast_temp = readings[0]                      # 内部状态：上一次测到的水温\nfor temp in readings:\n    print(temp, \"度 | 简单反射：\", simple_reflex(temp), \"| 基于模型：\", model_based(temp, last_temp))\n    last_temp = temp                         # 更新内部状态，留给下一次用",
        "en": "# A thermostatic kettle set to 45 °C. Water temperatures measured every 10 seconds (fake data)\nreadings = [20, 30, 40, 44, 47, 46, 44]\n\ndef simple_reflex(temp):\n    \"\"\"Simple reflex: looks only at this reading and applies the rule.\"\"\"\n    if temp < 45:\n        return \"heat\"\n    return \"stop\"\n\ndef model_based(temp, last_temp):\n    \"\"\"Model-based reflex: also remembers the last reading, predicts, then applies the rule.\"\"\"\n    predicted = temp + (temp - last_temp)    # at the current heating rate, the temperature in 10 s\n    if predicted < 45:\n        return \"heat\"\n    return \"stop (predicts \" + str(predicted) + \" °C)\"\n\nlast_temp = readings[0]                      # internal state: the previous reading\nfor temp in readings:\n    print(temp, \"°C | simple reflex:\", simple_reflex(temp), \"| model-based:\", model_based(temp, last_temp))\n    last_temp = temp                         # update the internal state for next time"
      },
      "note": {
        "zh": "在 40 度和 44 度这两次，两种水壶做了不同的决定：简单反射型只看现在，还在加热；基于模型的反射型记得上一次的温度，算出照这个速度会超过 45 度，提前停了。`def` 定义函数、`for` 循环在 05 节讲，`str()` 把数字变成文字，现在看懂输出就够了。",
        "en": "At 40 °C and 44 °C the two kettles decide differently: the simple reflex one looks only at now and keeps heating; the model-based one remembers the last reading, works out that it will pass 45 at this rate and stops early. `def` (functions) and `for` (loops) come in lesson 05 and `str()` turns a number into text – for now, reading the output is enough."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "水壶测到 40 度，还记得一分钟前是 0 度，于是判断「照这个速度会烧过头」，停止加热。它属于哪一类？",
        "en": "A kettle reads 40 °C, remembers it was 0 °C a minute ago, concludes “at this rate it will overshoot” and stops heating. Which type is it?"
      },
      "options": [
        {
          "zh": "简单反射型",
          "en": "Simple reflex"
        },
        {
          "zh": "基于模型的反射型",
          "en": "Model-based reflex"
        },
        {
          "zh": "基于目标型",
          "en": "Goal-based"
        },
        {
          "zh": "学习型",
          "en": "Learning"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "它在规则之外多了一份内部状态（之前的温度），能根据过去预测未来，这正是基于模型的反射型。简单反射型只看现在的 40 度，会继续加热。",
        "en": "On top of the rule it keeps an internal state (the earlier temperature) and predicts the future from the past – a model-based reflex agent. A simple reflex agent would see only 40 °C and keep heating."
      }
    },
    {
      "t": "p",
      "zh": "**3. 基于目标型**\n\n[▶ 10:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=654) 从这一类开始，Agent **不再是「反射」**了。前两类都像条件反射：环境一变，就把规则检查一遍、做一次决定。基于目标型反过来：**因为有目标，才去获取环境信息、做出决定**，一切都是为了实现或接近这个目标。\n\n结构图上的区别在箭头分叉的地方：想到「我能做哪些事」以后，它会多问一句：**做了这件事，世界会变成什么样？这是我想要的、符合目标的吗？** 有帮助才做，没帮助就不做。\n\n[▶ 13:29](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=809) 自动驾驶的例子：前车一直踩着刹车慢慢走。按基于模型的反射型，状态没变化，不用刹车，跟着走就行。可如果目标是**尽快到达目的地**，那就不仅不刹车，还要踩油门、打方向，**超车**。再比如智能家居：「有人开门就开灯」只是反射；为目标服务的做法是预测主人五点到家，四点五十就把灯和空调打开。\n\n老师的总结：前两类解决的是**「要不要做」**，基于目标型思考的是**「怎么做」**——能做的事情很多，优先做那些能实现或接近目标的。这是一次质的飞跃。",
      "en": "**3. Goal-based agent**\n\n[▶ 10:54](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=654) From this type on, the agent is **no longer a “reflex”**. The first two behave like reflexes: whenever the environment changes, they run through their rules and decide once. A goal-based agent works the other way round: **because it has a goal, it gathers information and makes decisions** – everything serves reaching, or getting closer to, that goal.\n\nOn the diagram, the difference is where the arrows branch: after working out “what could I do”, it asks one more question: **if I do this, what will the world become – is that what I want, does it serve the goal?** It acts only if the action helps.\n\n[▶ 13:29](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=809) The self-driving example: the car ahead keeps creeping along with its brakes on. A model-based reflex agent sees no change in state, so it doesn't brake and simply follows. But if the goal is **to reach the destination quickly**, the agent not only skips braking – it accelerates, steers out and **overtakes**. Or a smart home: “turn on the light when someone opens the door” is a reflex; serving a goal means predicting that the owner gets home at five and switching on the lights and air conditioning at ten to five.\n\nThe instructor's summary: the first two types settle **“whether to act”**; a goal-based agent thinks about **“how to act”** – out of all the things it could do, it prefers those that reach or approach the goal. That is a qualitative leap."
    },
    {
      "t": "p",
      "zh": "**4. 基于效用型**\n\n[▶ 15:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=935) 结构和基于目标型几乎一样，只是在「决定做什么」和「真正去做」之间多了一步**评估**：这么做好不好？更快吗、更省钱吗、更安全吗？（老师打趣说是「会不会更开心」，说得实际一点，就是更高效、成本更低。）\n\n老师用「条条大路通罗马」来解释：要到罗马，只要不停下来，左转右转、绕圈来回，最后都能到——这在基于目标型看来都算数。可现实中没人会乱绕，我们会选**更快、更平稳、更安全、更省钱**的那条路。基于效用型多出来的评估步骤，就是在能达成目标的方案里**优中选优**。\n\n所以它可以看作基于目标型的**优化版**：两者结构一样，都在解决「怎么做」，只是多了从效用角度的挑选。",
      "en": "**4. Utility-based agent**\n\n[▶ 15:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=935) The structure is almost the same as the goal-based one, with one extra step between “deciding what to do” and “doing it”: an **evaluation**. Is this a good way? Is it faster, cheaper, safer? (The instructor jokes that it asks “will this make me happier” – in practical terms, more efficient and lower cost.)\n\nHe explains it with “all roads lead to Rome”: to get to Rome you only have to keep moving – turning left and right, even going in circles, you will get there eventually, and a goal-based agent counts all of that as fine. In real life nobody wanders like that; we pick the route that is **faster, smoother, safer and cheaper**. The utility-based agent's extra evaluation step **picks the best** among the options that reach the goal.\n\nSo it can be seen as an **optimised version** of the goal-based agent: same structure, same question of “how to act”, plus a choice made from the angle of utility."
    },
    {
      "t": "code",
      "file": {
        "zh": "选路线.py",
        "en": "pick_a_route.py"
      },
      "run": true,
      "code": {
        "zh": "# 开车去机场，导航找到三条都能到的路线（假数据）\nroutes = [\n    {\"name\": \"绕城高速\", \"minutes\": 50, \"toll\": 30},\n    {\"name\": \"市区主路\", \"minutes\": 45, \"toll\": 0},\n    {\"name\": \"机场快速路\", \"minutes\": 30, \"toll\": 10},\n]\n\n# 基于目标型：只问「能不能到」——第一条能到的路线就出发\nprint(\"基于目标型选：\", routes[0][\"name\"])\n\n# 基于效用型：再问「哪条最好」——给每条路线算一个代价，选代价最小的\n# 这里把 1 元过路费算成 1 分钟（这个换算方式就是设计者定的「效用函数」）\nbest = routes[0]\nfor route in routes:\n    cost = route[\"minutes\"] + route[\"toll\"]\n    print(\"  \", route[\"name\"], \"代价 =\", cost)\n    if cost < best[\"minutes\"] + best[\"toll\"]:\n        best = route\nprint(\"基于效用型选：\", best[\"name\"])",
        "en": "# Driving to the airport: the navigator finds three routes that all get there (fake data)\nroutes = [\n    {\"name\": \"ring motorway\", \"minutes\": 50, \"toll\": 30},\n    {\"name\": \"city main road\", \"minutes\": 45, \"toll\": 0},\n    {\"name\": \"airport expressway\", \"minutes\": 30, \"toll\": 10},\n]\n\n# Goal-based: only asks \"does it get there?\" - sets off on the first route that does\nprint(\"goal-based picks:\", routes[0][\"name\"])\n\n# Utility-based: also asks \"which is best?\" - gives each route a cost and picks the lowest\n# Here 1 yuan of toll counts as 1 minute (this conversion is the designer's \"utility function\")\nbest = routes[0]\nfor route in routes:\n    cost = route[\"minutes\"] + route[\"toll\"]\n    print(\"  \", route[\"name\"], \"cost =\", cost)\n    if cost < best[\"minutes\"] + best[\"toll\"]:\n        best = route\nprint(\"utility-based picks:\", best[\"name\"])"
      },
      "note": {
        "zh": "基于目标型拿到第一条能到的路线就出发，结果选中了最慢、最贵的绕城高速；基于效用型给每条路线算了代价，选出了最好的。代价怎么算（这里把 1 元过路费算成 1 分钟）是设计者定的，这就是「效用函数」：换一种算法，选出来的路线也可能不同。",
        "en": "The goal-based choice sets off on the first route that gets there – the slowest and most expensive one; the utility-based choice scores every route and picks the best. How the cost is computed (here 1 yuan of toll counts as 1 minute) is the designer's call – that is the “utility function”; a different formula may pick a different route."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "导航给出三条都能到机场的路线，Agent 比较了时间和过路费，选了又快又便宜的一条。这体现的是哪一类比前一类多出来的能力？",
        "en": "The navigator finds three routes to the airport; the agent compares time and tolls and picks the fast, cheap one. Which type's extra ability is this?"
      },
      "options": [
        {
          "zh": "基于模型的反射型：维护内部状态",
          "en": "Model-based reflex: keeping an internal state"
        },
        {
          "zh": "简单反射型：按规则立刻反应",
          "en": "Simple reflex: reacting to a rule at once"
        },
        {
          "zh": "基于效用型：在能达成目标的方案里评估、择优",
          "en": "Utility-based: evaluating the options that reach the goal and picking the best"
        },
        {
          "zh": "学习型：从反馈中改进",
          "en": "Learning: improving from feedback"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "三条路都能到机场，基于目标型就已经满足了；在它们之间比较、选最好的那条，是基于效用型多出来的评估步骤。",
        "en": "All three routes reach the airport, which already satisfies a goal-based agent; comparing them and taking the best is the utility-based agent's extra evaluation step."
      }
    },
    {
      "t": "p",
      "zh": "**5. 学习型**\n\n[▶ 18:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=1091) 到了学习型，结构图完全变了。为什么需要它？因为效用型的**评估标准会过时**：一百年前，坐马车也许比骑马舒服，算是最优的选择；放到今天就不是了。环境在变，同一个选择可能从最优变成最差。要一直做出好的选择，Agent 就得**跟着环境一起学习、更新**。\n\n老师介绍，学习型 Agent 由四个部分组成：\n\n| 部分 | 做什么 |\n|---|---|\n| 执行元素 | 真正做事的部分，相当于前面几类 Agent |\n| 评估者 | 评价做得好不好：比上一次更好还是更差 |\n| 学习元素 | 根据评估去改进：变好了就继续往这个方向走，变差了就及时停下来调整，免得越学越偏 |\n| 问题生成器 | 主动提出新的尝试，用来探索、应对**未知**的问题 |\n\n前面几类面对的规则、目标都是已知的；学习型要应对的是将来可能出现的**未知**情况。[▶ 21:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=1306) 老师拿学这门课打比方：只拿到笔记和代码，你只能应对课上讲过的内容；真正学会、不断提升，遇到课上没讲过的情况才不至于手足无措。\n\n学习型是一种**理想型**：能随时间不断成长当然最好，但实现起来很复杂。老师的建议是先放一放，先去实现简单反射、基于目标、基于效用这几类。",
      "en": "**5. Learning agent**\n\n[▶ 18:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=1091) With the learning agent the diagram changes completely. Why is it needed? Because a utility agent's **standards go stale**: a hundred years ago, riding in a carriage may have been more comfortable than riding a horse – the best choice; today it isn't. As the environment changes, the same choice can drift from best to worst. To keep choosing well, the agent has to **learn and update along with its environment**.\n\nThe instructor describes four parts of a learning agent:\n\n| Part | What it does |\n|---|---|\n| Performance element | The part that actually does the work – what the earlier types were |\n| Critic | Judges how well it went: better or worse than last time |\n| Learning element | Improves based on the critique: if things got better, keep going that way; if worse, stop and adjust before learning goes astray |\n| Problem generator | Proposes new attempts on its own, to explore and cope with **unknown** problems |\n\nThe earlier types deal with known rules and known goals; a learning agent is meant to cope with **unknown** situations that may come up later. [▶ 21:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=1306) The instructor compares it with taking this course: with only the notes and the code, you can handle exactly what was covered; only if you really learn and keep improving will you cope with situations the course never showed you.\n\nThe learning agent is an **ideal type**: growing over time is of course best, but building it is complex. The instructor's advice is to set it aside for now and first build the simple reflex, goal-based and utility-based kinds."
    },
    {
      "t": "p",
      "zh": "[▶ 22:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=1370) 五类 Agent 一级一级往上搭。老师说这是本节的重点：既要知道有这五类，也要知道它们的区别，还要知道后一类是怎样在前一类的基础上进化来的。\n\n| 类型 | 比前一类多了什么 | 视频里的例子 |\n|---|---|---|\n| 简单反射型 | （起点）按「条件 → 动作」规则立刻反应 | 低于 45 度就加热；前车刹车灯亮就提醒 |\n| 基于模型的反射型 | 内部状态：记住过去，预测未来 | 升温太快就提前停；刹车灯一直亮、车速平稳就不刹 |\n| 基于目标型 | 目标：从「要不要做」变成「怎么做」 | 为了尽快到达而超车；主人到家前开好灯和空调 |\n| 基于效用型 | 评估：在能达成目标的方案里选最好的 | 条条大路通罗马，选更快、更安全、更省钱的那条 |\n| 学习型 | 评估者、学习元素、问题生成器：随环境不断改进 | 今天的马车已不是最优选择：标准会过时（理想型，先放一放） |",
      "en": "[▶ 22:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=1370) The five types are built one on top of another. The instructor calls this the core of the lesson: know the five types, know how they differ, and know how each one evolves from the one before.\n\n| Type | What it adds | The video's examples |\n|---|---|---|\n| Simple reflex | (Starting point) reacts at once by condition → action rules | Heat below 45 °C; warn when the car ahead brakes |\n| Model-based reflex | Internal state: remembers the past, predicts the future | Stop early when heating too fast; don't brake if the lights have long been on at a steady speed |\n| Goal-based | A goal: from “whether to act” to “how to act” | Overtake to arrive sooner; lights and AC on before the owner gets home |\n| Utility-based | Evaluation: picks the best of the options that reach the goal | All roads lead to Rome – take the faster, safer, cheaper one |\n| Learning | Critic, learning element, problem generator: keeps improving as the world changes | A carriage is no longer the best choice today: standards go stale (an ideal type, set aside for now) |"
    },
    {
      "t": "note",
      "title": {
        "zh": "📝 补充：这五类从哪来，和大模型 Agent 是什么关系",
        "en": "📝 Extra: where the five types come from, and how they relate to LLM agents"
      },
      "zh": "这五类的划分和那几张结构图，来自 01 节提到的教材《人工智能：一种现代方法》。视频没有把它们和大模型 Agent 一一对应，可以这样理解：这门课后面写的 Agent，给它一个目标，它自己决定调用哪些工具、调用几次，最接近**基于目标型**；在提示词里写清「优先更快、更省钱」这类标准，就有了**效用**的味道；03 节的「自我反思」是在一次任务里根据反馈改进，有一点**学习型**的影子，但模型本身并没有更新。",
      "en": "The five types and their diagrams come from the textbook *Artificial Intelligence: A Modern Approach*, mentioned in lesson 01. The video does not map them onto LLM agents; one way to see it: the agents built later in this course are given a goal and decide for themselves which tools to call and how often, which is closest to **goal-based**; writing criteria such as “prefer faster and cheaper” into the prompt adds a flavour of **utility**; the “self-reflection” of lesson 03 improves from feedback within one task – a hint of a **learning** agent, although the model itself is not updated."
    },
    {
      "t": "h",
      "zh": "三、按互动方式：互动型和自主型",
      "en": "3. By interaction: interactive vs autonomous"
    },
    {
      "t": "p",
      "zh": "[▶ 23:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=1400) 按互动方式分，就是看**人参不参与**：\n- **互动型**：人参与到过程里——跟它问答、替它做决定、监督它、给它反馈。比如它交出一个结果，你说「方向不对」「质量不好」「不够详细」，它据此修改；你再评估、再指导。而且大多数时候 Agent 是**等人来用**的。所以这一类现在用得最多，也最接地气。\n- **自主型**：01 节说过，和 AI 助理相比，Agent 的一大特点是**独立自主**：完全不需要人参与，可以在后台持续运行，自己监控环境变化，比如看到天气预报就主动把伞拿给你。现在主要用在**数据分析**这类领域：不断采集信息、不断分析、不断给出最新建议，人只接收结果。\n\n[▶ 25:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=1525) 自主型有潜在的风险。老师拿电影《流浪地球》里的 MOSS 举例：它完全自主，你只要提需求，它自己去办；可完全让它自己做决策，它会做它认为对、认为高效的事，**一旦它的认知错了，决策也就错了**，中间没有人监督、没有人干预。人们担心的「AI 做出不利于人类的决定」就是这种情况。\n\n所以在老师看来，完全自主同样属于理想型：任务简单、后果不严重时，用自主型问题不大；**严肃、危险、敏感的场景，还是以人机互动为主**。完全自主的 Agent 更有想象力（谁不想要一个贾维斯，一句话就把事办了），但目前主要用在**只输出结果、不直接改变什么**的场景。\n\n| | 互动型 | 自主型 |\n|---|---|---|\n| 人的角色 | 问答、决策、监督、反馈 | 只接收结果 |\n| 优点 | 能及时纠偏，现在最常用 | 省人力，想象空间大 |\n| 风险 | 需要人花时间参与 | 没人监督，认知错了就一路错下去 |\n| 适合 | 严肃、危险、敏感的场景 | 简单、后果不严重、只输出不改变的场景，如数据分析 |",
      "en": "[▶ 23:20](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=1400) Classifying by interaction means asking **whether a human takes part**:\n- **Interactive**: a human is part of the process – asking it questions, making decisions for it, supervising it, giving it feedback. It hands over a result, you say “wrong direction”, “poor quality” or “not detailed enough”, it revises, and you assess and guide again. Most of the time an agent also **waits for someone to use it**. So this kind is by far the most common today, and the most down-to-earth.\n- **Autonomous**: as lesson 01 said, what sets an agent apart from an AI assistant is **independence**: it needs no human at all, can keep running in the background and watch the environment by itself – seeing the forecast and bringing you an umbrella, say. Today it is used mainly in areas like **data analysis**: it keeps collecting information, analysing it and offering fresh suggestions, and people just receive the results.\n\n[▶ 25:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=1525) Autonomy carries a hidden risk. The instructor uses MOSS from the film *The Wandering Earth*: fully autonomous, you just state what you need and it gets on with it. But if it makes every decision on its own, it does whatever it believes is right and efficient – **once its understanding is wrong, its decisions are wrong too**, with nobody supervising or stepping in. That is exactly the worry about “AI making decisions that harm people”.\n\nSo the instructor sees full autonomy as an ideal type too: for simple tasks with mild consequences, autonomy is fine; **in serious, dangerous or sensitive settings, human–agent interaction should lead**. A fully autonomous agent is more exciting (who wouldn't want a Jarvis that gets things done from one sentence), but today it is used mainly where it **only produces output and doesn't directly change anything**.\n\n| | Interactive | Autonomous |\n|---|---|---|\n| Human's role | Asks, decides, supervises, gives feedback | Only receives the results |\n| Strength | Mistakes get corrected early; most common today | Saves people's time; lots of potential |\n| Risk | People must spend time on it | Unsupervised, one wrong belief leads to a chain of wrong decisions |\n| Good for | Serious, dangerous, sensitive settings | Simple, low-stakes, output-only settings such as data analysis |"
    },
    {
      "t": "tip",
      "zh": "后面课程里有不少内容，就是在给 Agent 加上「人」这一环：18 节的工作空间与权限管理，33–36 节 LangGraph 的人机交互（等待用户输入、审查工具调用、编辑图的状态），56 节 CrewAI 的人类反馈。",
      "en": "Quite a few later lessons are about putting the human back into the loop: workspaces and permissions in lesson 18, human-in-the-loop in LangGraph in lessons 33–36 (waiting for user input, reviewing tool calls, editing the graph state), and human feedback in CrewAI in lesson 56."
    },
    {
      "t": "check",
      "q": {
        "zh": "要做一个根据检查结果调整病人用药剂量的 Agent。按视频的建议，应该怎么做？",
        "en": "You are building an agent that adjusts a patient's dosage from test results. Following the video's advice, how should it work?"
      },
      "options": [
        {
          "zh": "做成完全自主的，省得医生操心",
          "en": "Fully autonomous, so doctors needn't bother"
        },
        {
          "zh": "用简单反射型，因为它反应最快",
          "en": "A simple reflex agent, because it reacts fastest"
        },
        {
          "zh": "做成互动型，关键决定由人审核",
          "en": "Interactive, with a human reviewing the key decisions"
        },
        {
          "zh": "换成多个 Agent 互相辩论，就不需要人了",
          "en": "Several agents debating each other, so no human is needed"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "医疗是严肃、敏感的场景。完全自主的 Agent 一旦理解错了，就没有人能及时拦住，所以要以人机互动为主。",
        "en": "Medicine is a serious, sensitive setting. If a fully autonomous agent misunderstands, nobody is there to stop it in time, so human–agent interaction should lead."
      }
    },
    {
      "t": "h",
      "zh": "四、按数量：单 Agent 和多 Agent",
      "en": "4. By number: single vs multi-agent"
    },
    {
      "t": "p",
      "zh": "[▶ 28:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=1686) 老师顺着刚才的图往下讲：上面那张是一个人和一个 Agent 对话，下面那张是 N 个 Agent 自己商量、把事办完——这就是按数量区分的**单 Agent** 和**多 Agent**。\n\n**单 Agent 的能力有限。** 老师的理由是：一次对话里只能设一套提示词，一个 Agent 不能「人格分裂」，同时当好几个角色，所以它的能力是固定的、有限的。既想要这样的 Agent、又想要那样的 Agent，就自然走到了多 Agent。\n\n**多个 Agent 怎么配合？** 图里画了几种方式：\n- 大家同时发言、一起讨论\n- 轮流发言，后一个在前一个的基础上补充、回应或处理，更有秩序\n- **对抗**：互相找对方的短板和缺陷，提醒对方改进。前面说人可以监督 Agent，其实 Agent 也可以监督 Agent\n\n所以多 Agent 的效果通常比单 Agent 好，也能应对更复杂的场景。",
      "en": "[▶ 28:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=1686) The instructor carries on from the same diagrams: the upper one shows one person talking to one agent; the lower one shows N agents talking among themselves and getting the job done. That is the split by number: **single agent** vs **multi-agent**.\n\n**A single agent is limited.** His reason: one conversation can carry only one prompt setup, and one agent can't have a “split personality” and play several roles at once, so its abilities are fixed and limited. Once you want this kind of agent *and* that kind, you have arrived at multi-agent systems.\n\n**How can several agents work together?** The diagram shows a few ways:\n- Everyone speaks at once in an open discussion\n- They take turns, each building on, answering or processing what the previous one said – more orderly\n- **Adversarial**: each looks for the other's weaknesses and flaws and pushes it to improve. Earlier we saw humans supervising agents – agents can supervise agents too\n\nSo several agents usually do better than one and can handle more complex scenarios."
    },
    {
      "t": "p",
      "zh": "[▶ 30:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=1810) 但多 Agent 学起来也更麻烦。老师举了微软的框架为例（很可能指 AutoGen）：它从设计上就以多 Agent 为中心，用法是先设计好一堆 Agent，再把它们编排在一起协作。这要求你对 Agent 本身、对每个 Agent 的能力都很清楚，门槛比较高。\n\n[▶ 30:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=1841) 课程后面用的是 **OpenAI 的框架**（08 节开始的 OpenAI Agents SDK）。它不以多 Agent 为中心：可以先从一个 Agent 开始，把活干好，再加一个变成多个，再考虑它们之间的关系。监督、委派交接、并行这些多 Agent 模式它也都支持（12–14 节会用到）。",
      "en": "[▶ 30:10](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=1810) But multi-agent systems are harder to learn. The instructor's example is Microsoft's framework (most likely AutoGen): it is designed around multiple agents from the start – you first design a set of agents, then orchestrate them to work together. That requires a clear picture of agents in general and of each agent's abilities, so the entry barrier is fairly high.\n\n[▶ 30:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=1841) The course itself uses **OpenAI's framework** (the OpenAI Agents SDK, from lesson 08). It is not centred on multiple agents: you can start with one agent, get the job done, then add another, and only then think about how they relate. It also supports multi-agent patterns such as supervision, delegation and handoffs, and running in parallel (used in lessons 12–14)."
    },
    {
      "t": "check",
      "q": {
        "zh": "按视频的说法，单个 Agent 能力有限的主要原因是？",
        "en": "According to the video, why is a single agent's ability limited?"
      },
      "options": [
        {
          "zh": "单个 Agent 不能调用工具",
          "en": "A single agent can't call tools"
        },
        {
          "zh": "单个 Agent 不能联网",
          "en": "A single agent can't go online"
        },
        {
          "zh": "单个 Agent 运行太慢",
          "en": "A single agent runs too slowly"
        },
        {
          "zh": "一次对话只能有一套提示词设定，它没法同时当好几个角色",
          "en": "One conversation carries one prompt setup, so it can't play several roles at once"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "老师的比喻是 Agent 不能「人格分裂」：一套设定决定了它的能力范围。需要不同角色时，就要用多个 Agent。",
        "en": "As the instructor puts it, an agent can't have a “split personality”: one setup fixes its range. When you need different roles, you need several agents."
      }
    },
    {
      "t": "h",
      "zh": "五、怎么选：先简单，再升级",
      "en": "5. How to choose: start simple, then upgrade"
    },
    {
      "t": "p",
      "zh": "[▶ 31:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=1902) 从落地的角度，老师给出的顺序是：\n- 互动方式：**先实现互动型，再实现自主型**（自主型门槛高、风险大）\n- 数量：**先实现单 Agent，再实现多 Agent**（一到多 Agent，就得考虑它们之间怎么竞争、怎么配合，要想的事多得多）\n\n[▶ 32:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=1932) 最后的总结：Agent 并不是只有一种样子的死板概念，它有很多类。不同的场景、系统和需求，适合不同的类型：可能是一个简单反射型的单 Agent，也可能是学习型，或者多个 Agent 协同。常见的误区是以为必须用某种固定的方式开发 Agent。实际上，效果不好或者有了新需求，就在现有基础上**升级**：\n\n| 现在 | 可以升级到 |\n|---|---|\n| 简单反射型 | 基于模型的反射型 |\n| 基于目标型 | 基于效用型 |\n| 互动型 | 自主型 |\n| 单 Agent | 多 Agent |\n\n走一条**更容易实现、更容易落地**的路线，老师说这是整个训练营课程的最大方针。",
      "en": "[▶ 31:42](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=1902) For real projects the instructor recommends this order:\n- Interaction: **build interactive agents first, autonomous ones later** (autonomy has a higher barrier and more risk)\n- Number: **build a single agent first, multiple agents later** (with several agents you must think about how they compete and cooperate – much more to consider)\n\n[▶ 32:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=3&t=1932) His closing summary: “agent” is not one rigid, fixed term; there are many kinds. Different scenarios, systems and needs suit different types – a single simple reflex agent, a learning agent, or several agents cooperating. A common misconception is that agents must be built one particular way. In practice, when the results aren't good enough or new needs appear, you **upgrade** from what you have:\n\n| Now | Upgrade to |\n|---|---|\n| Simple reflex | Model-based reflex |\n| Goal-based | Utility-based |\n| Interactive | Autonomous |\n| Single agent | Multi-agent |\n\nTake the route that is **easiest to build and to put into practice** – the instructor calls this the guiding principle of the whole boot-camp course."
    },
    {
      "t": "note",
      "title": {
        "zh": "📝 补充：你可能还会听到「工作流 vs 智能体」",
        "en": "📝 Extra: you may also hear “workflow vs agent”"
      },
      "zh": "这一集没有讲「工作流」，但这个说法很常见（课程最后的 57–58 节就是搭工作流）：**下一步由程序员事先写死**的叫工作流，**由大模型在运行时自己决定**的叫智能体。Anthropic 的文章 [Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents) 的建议和老师的方针一致：先用最简单的办法，够用就不急着上更复杂的。想看两者的对比，可以运行讲义附带的 `practice/l02_workflow_vs_agent.py`（会调用真实模型）。",
      "en": "This episode doesn't mention “workflows”, but the term is common (lessons 57–58 at the end of the course build workflows): if the programmer fixes the next step in advance, it's a workflow; if the LLM decides it at run time, it's an agent. Anthropic's article [Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents) gives the same advice as the instructor: start with the simplest approach and don't reach for something more complex until you need it. To see the two side by side, run `practice/l02_workflow_vs_agent.py` from these notes (it calls the real model)."
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "五类 Agent 从简单到聪明，顺序正确的是？",
        "en": "Which order of the five agent types runs correctly from simple to smart?"
      },
      "options": [
        {
          "zh": "基于目标 → 简单反射 → 基于效用 → 基于模型的反射 → 学习型",
          "en": "Goal-based → simple reflex → utility-based → model-based reflex → learning"
        },
        {
          "zh": "简单反射 → 基于目标 → 基于模型的反射 → 学习型 → 基于效用",
          "en": "Simple reflex → goal-based → model-based reflex → learning → utility-based"
        },
        {
          "zh": "学习型 → 基于效用 → 基于目标 → 基于模型的反射 → 简单反射",
          "en": "Learning → utility-based → goal-based → model-based reflex → simple reflex"
        },
        {
          "zh": "简单反射 → 基于模型的反射 → 基于目标 → 基于效用 → 学习型",
          "en": "Simple reflex → model-based reflex → goal-based → utility-based → learning"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "每一级都在前一级上多一样东西：内部状态 → 目标 → 评估择优 → 随环境学习。",
        "en": "Each step adds one thing to the previous: internal state → a goal → evaluation → learning as the world changes."
      }
    },
    {
      "q": {
        "zh": "简单反射型 Agent 最大的优点是什么？",
        "en": "What is the main strength of a simple reflex agent?"
      },
      "options": [
        {
          "zh": "不做复杂思考，反应快，适合前车急刹这类要立刻反应的情况",
          "en": "It does no complex thinking, so it reacts fast – right for moments like the car ahead braking hard"
        },
        {
          "zh": "能根据历史预测未来",
          "en": "It predicts the future from history"
        },
        {
          "zh": "能在多个方案里选出最好的",
          "en": "It picks the best of several options"
        },
        {
          "zh": "能从经验中不断学习",
          "en": "It keeps learning from experience"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "它只按规则立刻反应，所以快；后面三项分别是基于模型的反射型、基于效用型和学习型多出来的能力。",
        "en": "It reacts by rule at once, which is why it is fast; the other three are what the model-based, utility-based and learning types add."
      }
    },
    {
      "q": {
        "zh": "前车的刹车灯已经亮了很久，车速和车距一直没变，Agent 判断不用刹车，继续跟车。这最能体现哪一类？",
        "en": "The car ahead has had its brake lights on for a long time, with speed and gap unchanged; the agent decides not to brake and keeps following. Which type does this show best?"
      },
      "options": [
        {
          "zh": "简单反射型：看到刹车灯亮就刹车",
          "en": "Simple reflex: brake whenever the brake lights are on"
        },
        {
          "zh": "学习型：它学会了不刹车",
          "en": "Learning: it has learned not to brake"
        },
        {
          "zh": "基于模型的反射型：它记得刹车灯一直亮着、状态没有变化，所以判断不用刹",
          "en": "Model-based reflex: it remembers the lights have long been on and nothing has changed, so it decides not to brake"
        },
        {
          "zh": "基于效用型：它算出不刹车最省油",
          "en": "Utility-based: it worked out that not braking saves the most fuel"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "关键是「记得之前的状态」。简单反射型只看此刻亮着的刹车灯，会立刻刹车。",
        "en": "The key is remembering the earlier state. A simple reflex agent would see only the lit brake lights and brake at once."
      }
    },
    {
      "q": {
        "zh": "老师用「一百年前坐马车也许最舒服」的例子，想说明什么？",
        "en": "What is the instructor's point with “a hundred years ago, a carriage may have been the most comfortable choice”?"
      },
      "options": [
        {
          "zh": "马车比汽车更环保",
          "en": "Carriages are greener than cars"
        },
        {
          "zh": "环境会变，原来最优的选择会过时，所以 Agent 需要跟着环境不断学习、更新",
          "en": "The world changes and yesterday's best choice goes stale, so an agent must keep learning and updating"
        },
        {
          "zh": "基于效用型 Agent 不会评估交通工具",
          "en": "Utility-based agents can't evaluate means of transport"
        },
        {
          "zh": "学习型 Agent 的结构和基于效用型完全一样",
          "en": "A learning agent has exactly the same structure as a utility-based one"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "效用型的评估标准是固定的，会过时；学习型多了评估者、学习元素和问题生成器，能随环境改进。它的结构和前几类完全不同。",
        "en": "A utility agent's standards are fixed and go stale; the learning agent adds a critic, a learning element and a problem generator so it can improve as the world changes. Its structure is completely different from the earlier types."
      }
    },
    {
      "q": {
        "zh": "关于自主型 Agent，下面哪个说法符合视频的观点？",
        "en": "Which statement about autonomous agents matches the video?"
      },
      "options": [
        {
          "zh": "自主型已经可以放心地用在任何场景",
          "en": "Autonomous agents can now be trusted in any setting"
        },
        {
          "zh": "自主型不需要感知环境",
          "en": "Autonomous agents don't need to perceive their environment"
        },
        {
          "zh": "自主型现在比互动型用得更多",
          "en": "Autonomous agents are used more than interactive ones today"
        },
        {
          "zh": "自主型想象空间大，但没人监督时一旦认知出错就会一路错下去，敏感场景应以人机互动为主",
          "en": "Autonomy has great potential, but unsupervised, one wrong belief leads to a chain of wrong decisions, so sensitive settings should rely on human–agent interaction"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "老师用 MOSS 说明了完全自主的风险；现在用得更多的是互动型，自主型主要用在只输出、不直接改变什么的场景。",
        "en": "The instructor uses MOSS to show the risk of full autonomy; interactive agents are the more common kind today, and autonomous ones are used mainly where they only produce output."
      }
    },
    {
      "q": {
        "zh": "课程为什么用 OpenAI 的框架，而不是一上来就用以多 Agent 为中心的框架？",
        "en": "Why does the course use OpenAI's framework instead of starting with a multi-agent-first framework?"
      },
      "options": [
        {
          "zh": "以多 Agent 为中心的框架不支持多 Agent",
          "en": "Multi-agent-first frameworks don't support multiple agents"
        },
        {
          "zh": "OpenAI 的框架完全不支持多 Agent",
          "en": "OpenAI's framework has no multi-agent support at all"
        },
        {
          "zh": "可以先从单个 Agent 做起，再逐步加 Agent，门槛更低",
          "en": "You can start with one agent and add more step by step – a lower entry barrier"
        },
        {
          "zh": "多 Agent 的效果一定比单 Agent 差",
          "en": "Multiple agents always do worse than one"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "以多 Agent 为中心的框架要求先设计好一堆 Agent 再编排，门槛高；OpenAI 的框架可以从一个 Agent 开始，需要时再加，也支持监督、委派交接等多 Agent 模式。",
        "en": "A multi-agent-first framework makes you design a set of agents and orchestrate them up front – a high barrier; OpenAI's framework lets you start with one and add more when needed, and it supports multi-agent patterns such as supervision and handoffs."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "五类 Agent 的名字",
        "en": "The names of the five agent types"
      },
      "code": {
        "zh": "# 五类 Agent，从简单到聪明：\n# 1. [[简单反射]]型：只看现在，按「条件 → 动作」规则立刻反应\n# 2. 基于[[模型]]的反射型：多了内部状态，能根据过去预测未来\n# 3. 基于[[目标]]型：为了目标，思考「怎么做」\n# 4. 基于[[效用]]型：在能达成目标的方案里评估、择优\n# 5. [[学习]]型：评估做得好不好，根据反馈不断改进",
        "en": "# Five agent types, from simple to smart:\n# 1. [[Simple reflex|simple reflex]] agent: looks only at now, reacts by condition -> action rules\n# 2. [[Model-based|model-based]] reflex agent: keeps an internal state, predicts the future from the past\n# 3. [[Goal|goal]]-based agent: thinks about HOW to reach its goal\n# 4. [[Utility|utility]]-based agent: evaluates the options that reach the goal and picks the best\n# 5. [[Learning|learning]] agent: judges how well it did and keeps improving from feedback"
      },
      "explain": {
        "zh": "后一类都在前一类上多一样东西：状态 → 目标 → 评估 → 学习。",
        "en": "Each type adds one thing to the one before: state → goal → evaluation → learning."
      }
    },
    {
      "title": {
        "zh": "基于模型的恒温水壶",
        "en": "A model-based kettle"
      },
      "code": {
        "zh": "last_temp = 30                               # 内部状态：上一次的水温\ntemp = 40                                    # 这一次测到的水温\npredicted = temp + (temp - [[last_temp]])    # 照刚才的速度，预测下一次的水温\nif predicted [[<]] 45:\n    print(\"加热\")\n[[last_temp]] = temp                         # 不缩进：更新内部状态，留给下一次用",
        "en": "last_temp = 30                               # internal state: the previous reading\ntemp = 40                                    # this reading\npredicted = temp + (temp - [[last_temp]])    # at the current rate, predict the next reading\nif predicted [[<]] 45:\n    print(\"heat\")\n[[last_temp]] = temp                         # not indented: update the state for next time"
      },
      "explain": {
        "zh": "预测要用到「上一次」的温度，这就是内部状态；最后一行没有缩进，所以不管加不加热都会更新状态。",
        "en": "The prediction needs the previous reading – that is the internal state; the last line isn't indented, so the state is updated whether or not the kettle heats."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "选做 · 手写：基于模型的恒温水壶规则",
        "en": "Optional · Write it: a model-based kettle rule"
      },
      "task": {
        "zh": "水壶上一次测到 `last_temp` 度，这一次测到 `temp` 度。请写出基于模型的反射规则：\n1. 算出预测温度：`predicted = temp + (temp - last_temp)`（照刚才的升温速度往后推一次），并打印出来\n2. 写一个 `if`：`predicted` 低于 45 时，在它下面**缩进 4 格**打印「加热」\n3. 再写一个 `if`：`predicted` 大于等于 45（写成 `>=`）时，缩进 4 格打印「停止加热」\n4. 最后**不缩进**，打印「检查完毕」\n\n写完运行，再把 `temp` 改成 `33` 试试：这次应该打印「加热」。",
        "en": "The kettle's previous reading was `last_temp` degrees and this one is `temp`. Write the model-based reflex rule:\n1. Work out the prediction `predicted = temp + (temp - last_temp)` (push the current heating rate one step ahead) and print it\n2. Write an `if`: when `predicted` is below 45, print “heat” **indented 4 spaces** under it\n3. Write a second `if`: when `predicted` is 45 or more (written `>=`), print “stop heating”, indented 4 spaces\n4. Finally, **without indentation**, print “Check finished”\n\nRun it, then change `temp` to `33` and run again: this time it should print “heat”."
      },
      "run": true,
      "starter": {
        "zh": "last_temp = 30      # 上一次测到的水温（内部状态）\ntemp = 40           # 这一次测到的水温\n\n# 1. 算出预测温度 predicted，并打印出来\n\n\n# 2. predicted 低于 45：缩进 4 格，打印「加热」\n\n\n# 3. predicted 大于等于 45：缩进 4 格，打印「停止加热」\n\n\n# 4. 不缩进：打印「检查完毕」",
        "en": "last_temp = 30      # the previous reading (internal state)\ntemp = 40           # this reading\n\n# 1. work out the predicted temperature, predicted, and print it\n\n\n# 2. predicted below 45: indent 4 spaces and print \"heat\"\n\n\n# 3. predicted 45 or more: indent 4 spaces and print \"stop heating\"\n\n\n# 4. not indented: print \"Check finished\""
      },
      "solution": {
        "zh": "last_temp = 30      # 上一次测到的水温（内部状态）\ntemp = 40           # 这一次测到的水温\n\n# 1. 算出预测温度 predicted，并打印出来\npredicted = temp + (temp - last_temp)\nprint(\"预测下一次：\", predicted)\n\n# 2. predicted 低于 45：缩进 4 格，打印「加热」\nif predicted < 45:\n    print(\"加热\")\n\n# 3. predicted 大于等于 45：缩进 4 格，打印「停止加热」\nif predicted >= 45:\n    print(\"停止加热\")\n\n# 4. 不缩进：打印「检查完毕」\nprint(\"检查完毕\")",
        "en": "last_temp = 30      # the previous reading (internal state)\ntemp = 40           # this reading\n\n# 1. work out the predicted temperature, predicted, and print it\npredicted = temp + (temp - last_temp)\nprint(\"predicted next reading:\", predicted)\n\n# 2. predicted below 45: indent 4 spaces and print \"heat\"\nif predicted < 45:\n    print(\"heat\")\n\n# 3. predicted 45 or more: indent 4 spaces and print \"stop heating\"\nif predicted >= 45:\n    print(\"stop heating\")\n\n# 4. not indented: print \"Check finished\"\nprint(\"Check finished\")"
      },
      "checks": [
        {
          "zh": "用 `temp + (temp - last_temp)` 算出 `predicted`",
          "en": "Computes `predicted` as `temp + (temp - last_temp)`",
          "re": "^predicted\\s*=\\s*temp\\s*\\+\\s*\\(\\s*temp\\s*-\\s*last_temp\\s*\\)"
        },
        {
          "zh": "`if predicted < 45:` 下面缩进 4 格的 `print`",
          "en": "A `print` indented 4 spaces under `if predicted < 45:`",
          "re": "^if\\s+predicted\\s*<\\s*45\\s*:[ \\t]*\\n {4}print\\("
        },
        {
          "zh": "`if predicted >= 45:` 下面缩进 4 格的 `print`",
          "en": "A `print` indented 4 spaces under `if predicted >= 45:`",
          "re": "^if\\s+predicted\\s*>=\\s*45\\s*:[ \\t]*\\n {4}print\\("
        },
        {
          "zh": "最后一行不缩进，打印「检查完毕」",
          "en": "The last line, not indented, prints “Check finished”",
          "re": "^print\\(.*(检查完毕|[Cc]heck finished)"
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "把「基于模型的反射型」里的「模型」当成大模型：这里的模型是 Agent 对世界状态的内部记录（比如上一次的水温），不是大语言模型。",
      "en": "Reading the “model” in “model-based reflex” as an LLM: here it means the agent's internal record of the world's state (such as the previous temperature), not a large language model."
    },
    {
      "zh": "觉得简单反射型太简单、没有用：它反应最快，自动驾驶这样复杂的系统里，紧急情况也靠它。",
      "en": "Dismissing the simple reflex agent as too simple to matter: it reacts fastest, and even complex systems like self-driving cars rely on it in emergencies."
    },
    {
      "zh": "以为能达成目标的方案就够好：条条大路通罗马，在多个方案里挑出最好的那条，是基于效用型多出来的一步。",
      "en": "Assuming any plan that reaches the goal is good enough: all roads lead to Rome; picking the best of them is the extra step of the utility-based agent."
    },
    {
      "zh": "在严肃、敏感的场景里让 Agent 完全自主：没有人监督，它一旦理解错了就会一路错下去（MOSS 的例子）。",
      "en": "Letting an agent run fully autonomously in serious or sensitive settings: with nobody supervising, one misunderstanding turns into a chain of wrong decisions (the MOSS example)."
    },
    {
      "zh": "一上来就追求自主型、多 Agent 或学习型：门槛高、难落地。先互动后自主、先单个后多个，效果不够再升级。",
      "en": "Starting straight away with autonomy, multiple agents or a learning agent: high barrier, hard to deliver. Interactive before autonomous, single before multiple, upgrade only when needed."
    },
    {
      "zh": "以为开发 Agent 只有一种「正确」的类型：要按场景和需求来选。",
      "en": "Believing there is one “right” type of agent to build: choose by scenario and need."
    }
  ],
  "recap": [
    {
      "zh": "视频从三个维度给 Agent 分类：智力水平和决策过程（五类，本节重点）、互动方式、数量。",
      "en": "The video classifies agents along three dimensions: intelligence level and decision process (five types, the focus), interaction, and number."
    },
    {
      "zh": "五类一级一级往上搭：简单反射 → 基于模型的反射（多了内部状态，能预测）→ 基于目标（为目标想「怎么做」）→ 基于效用（在能达成目标的方案里择优）→ 学习型（评估者、学习元素、问题生成器，随环境改进）。",
      "en": "The five types build on each other: simple reflex → model-based reflex (adds internal state and prediction) → goal-based (thinks “how” for a goal) → utility-based (picks the best way to the goal) → learning (critic, learning element, problem generator; improves as the world changes)."
    },
    {
      "zh": "反射类解决「要不要做」，基于目标型和基于效用型解决「怎么做」。",
      "en": "The reflex types settle “whether to act”; the goal- and utility-based types settle “how to act”."
    },
    {
      "zh": "互动型：人参与、能纠偏，现在用得最多；自主型：想象空间大，但没人监督可能跑偏，敏感场景要以人机互动为主。",
      "en": "Interactive: humans take part and can correct course – the most common kind today. Autonomous: lots of potential, but unsupervised it may go astray; sensitive settings should rely on human–agent interaction."
    },
    {
      "zh": "单 Agent 受一套设定限制；多 Agent 可以讨论、轮流、对抗，效果更好但门槛更高。",
      "en": "A single agent is limited by its one setup; several agents can discuss, take turns or challenge each other – better results, higher barrier."
    },
    {
      "zh": "落地路线：先互动后自主，先单个后多个；效果不够，再在现有基础上一步步升级。",
      "en": "Practical route: interactive before autonomous, single before multiple; when results fall short, upgrade step by step from what you have."
    }
  ],
  "files": [
    {
      "path": "practice/l02_agent_types.py",
      "zh": "演示（纯 Python，不调用模型）：同一串水温交给简单反射型和基于模型的反射型水壶；同样三条路线交给基于目标型和基于效用型。改改数据，先猜结果再运行。",
      "en": "Demo (plain Python, no model calls): the same temperature readings for a simple reflex and a model-based kettle, and the same three routes for a goal-based and a utility-based agent. Change the data, predict, then run."
    },
    {
      "path": "practice/l02_kettle_todo.py",
      "zh": "选做练习：写出基于模型的恒温水壶规则，练习缩进（有 TODO 提示）。",
      "en": "Optional exercise: write the model-based kettle rule and practise indentation (with TODO hints)."
    },
    {
      "path": "practice/l02_kettle_solution.py",
      "zh": "上面练习的参考答案。",
      "en": "Reference solution for the exercise above."
    },
    {
      "path": "practice/l02_workflow_vs_agent.py",
      "zh": "补充演示（视频里没有）：同样两个问题，分别交给固定的工作流和会自己做决定的智能体（真实模型 + 真实天气）。",
      "en": "Extra demo (not in the video): the same two questions handled by a fixed workflow and by an agent that decides for itself (real model + real weather)."
    }
  ]
});
