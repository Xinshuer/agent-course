"""第 24 节演示（讲义补充）：「智能体当工具」——工具调用式监管者
Lesson 24 demo (extra, not in the video): "agents as tools" - a tool-calling supervisor

视频只用架构图介绍了这种模式：中间的大脑是一个普通的大模型，它的「工具」其实是一个个智能体。
这里不用任何框架把它写出来：主管就是一个普通的工具调用循环（第 06 节）；translator 和 poet
两个「工具」内部各是一个子 Agent，有自己的 system 提示词和自己的 messages（上下文隔离）。
The video only shows this pattern as a diagram: the central brain is an ordinary model whose
"tools" are really agents. Here it is without any framework: the supervisor is an ordinary
tool-call loop (lesson 06); the two "tools", translator and poet, are each a sub-agent with its
own system prompt and its own messages (context isolation).

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l24_supervisor_tools.py
大约调用 4–5 次真实模型（DeepSeek）；不需要其他 key。
Makes about 4-5 real DeepSeek calls; no other key needed.
"""
import json

from llm import MODEL, client


# ---------- 子 Agent / sub-agents ----------
def run_agent(name, system_prompt, task):
    """一个最小的子 Agent：只带 2 条消息调用模型。 A minimal sub-agent: calls the model with 2 messages."""
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": task},
    ]
    print(f"   [{name}] 这次请求带了 {len(messages)} 条消息 / sent {len(messages)} messages")
    response = client.chat.completions.create(model=MODEL, messages=messages)
    return response.choices[0].message.content


def translator(text):
    return run_agent("translator", "你是翻译专家，只把内容翻译成英文，不要解释。", text)


def poet(topic):
    return run_agent("poet", "你是诗人，围绕主题写一首四行短诗，只输出诗。", topic)


workers = {"translator": translator, "poet": poet}  # 工具名 → 函数 / tool name -> function


def as_tool(name, description, param):
    """把子 Agent 包装成工具说明。 Wrap a sub-agent as a tool definition."""
    return {
        "type": "function",
        "function": {
            "name": name,
            "description": description,
            "parameters": {
                "type": "object",
                "properties": {param: {"type": "string"}},
                "required": [param],
            },
        },
    }


tools = [
    as_tool("translator", "翻译专家：把一段中文翻译成英文。参数 text 是要翻译的原文。", "text"),
    as_tool("poet", "诗人：根据主题写一首四行短诗。参数 topic 是诗的主题。", "topic"),
]

# ---------- 主管 / the supervisor ----------
history = [
    {"role": "system", "content": "你是主管，自己不翻译也不写诗。把每项任务交给合适的专家工具，最后用两三句话汇总结果。"},
]


def ask_supervisor():
    reply = client.chat.completions.create(model=MODEL, messages=history, tools=tools).choices[0].message
    history.append(reply.model_dump())
    return reply


if __name__ == "__main__":
    question = "帮我把「我喜欢学习编程」翻译成英文，再以秋天为主题写一首短诗。"
    print("用户 / User:", question)
    history.append({"role": "user", "content": question})

    reply = ask_supervisor()
    while reply.tool_calls:
        for call in reply.tool_calls:
            args = json.loads(call.function.arguments)
            print(f"\n[主管 → {call.function.name}] / [supervisor -> {call.function.name}]", args)
            result = workers[call.function.name](**args)
            print("   子 Agent 回答 / sub-agent answer:", result)
            history.append({"role": "tool", "tool_call_id": call.id, "content": result})
        reply = ask_supervisor()

    print("\n主管最终回答 / Supervisor's final answer:\n", reply.content)
    print(f"\n主管的记录里一共 {len(history)} 条消息；每个子 Agent 只看到 2 条。")
    print(f"The supervisor's history holds {len(history)} messages; each sub-agent saw only 2.")
