# 小浪学习手册（第 42 节知识库 / Lesson 42 knowledge base）

练习文件怎么运行？在 VS Code 里打开项目里的 practice 文件夹，选择项目文件夹里的解释器 .venv\Scripts\python.exe，然后点右上角的运行按钮。也可以在终端里先 cd 到 practice 文件夹，再用 ..\.venv\Scripts\python.exe 运行。

为什么课程有两个虚拟环境？主环境 .venv 用于大部分章节；CrewAI 和 AgentScope 对某些依赖包的版本要求互相冲突，所以 CrewAI 的章节使用单独的 .venv-crewai。两个环境都是 Python 3.12。

运行时提示找不到 DEEPSEEK_API_KEY 怎么办？说明程序没有读到这个环境变量。如果刚刚设置过，要关掉所有 VS Code 窗口再重新打开，新窗口才能看到它。不要把 key 直接写进代码里。

视频里用的是 qwen-plus，我用 DeepSeek 可以吗？可以。课程统一用 DeepSeek 的 deepseek-flash，两者都兼容 OpenAI 接口。想和视频完全一致，就在百炼控制台申请 key，把 llm.py 里的 BASE_URL、MODEL 和 key 的环境变量名改掉即可。

with_structured_output 报错 Thinking mode does not support this tool_choice 怎么办？DeepSeek 的思考模式不支持强制指定工具，给 ChatDeepSeek 加上 extra_body={"thinking": {"type": "disabled"}} 关掉思考模式，或者改用 method="json_mode"。

LangChain 和 LangGraph 是什么关系？LangChain 提供模型、提示词、工具这些积木，还有 create_agent 这样现成的 Agent；LangGraph 更底层，用节点和边把流程画成一张图，负责状态、循环、持久化和人机交互。create_agent 做出来的 Agent 本身就是一张 LangGraph 的图。

create_react_agent 和 create_agent 有什么区别？create_react_agent 来自 langgraph.prebuilt，是旧写法，在 LangGraph 1.x 里已经弃用；现在用 langchain.agents 里的 create_agent，提示词参数叫 system_prompt。两者做的事一样：模型和工具来回循环，直到模型不再调用工具。

监管者模式和路由模式有什么不同？路由模式里，调度员只选一位成员，成员的回答直接给用户，流程固定、调用次数少。监管者模式里，主管自己也是一个 Agent，可以先后询问好几位成员，最后由它汇总回答，更灵活，但模型调用更多。

网页里的运行按钮能运行所有代码吗？不能。纯 Python 代码和调用模拟模型的代码可以在浏览器里运行；LangChain、LangGraph、AgentScope、CrewAI 这些框架代码只能在本地用练习文件运行。

时间不够时应该先学哪些课？先学标着「核心」的课，再学「重要」的课，标着「了解」的课可以快速浏览。每节课最后的手写练习最能检验你是否真的学会了。

模型的回答被截断了怎么办？查看 finish_reason，如果是 length，说明达到了输出长度上限，可以调大 max_tokens，或者让模型分几次输出。
