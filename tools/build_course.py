"""Generate data/course.js (module + lesson index) from the Bilibili episode list.

Usage: python tools/build_course.py <episodes.json>
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

EN = {
    0: "Course Guide: Learning AI Agents from Zero",
    1: "Agent Basics",
    2: "Types of Agents",
    3: "Agent Components, Strategies & Use Cases",
    4: "OpenAI-Compatible APIs",
    5: "Defining and Using Tools",
    6: "Memory & Conversation Management",
    7: "A ReAct Agent in Code",
    8: "Agent Frameworks & the OpenAI Agents SDK",
    9: "Async Code & Streaming",
    10: "Multi-turn Conversations & Multimodality",
    11: "Tools & MCP",
    12: "Framework Usage: A Hands-on Case",
    13: "Multi-Agent Collaboration: Different Agents, Different Jobs",
    14: "Multi-Agent Project: Sales Data Analysis & Creative Output",
    15: "AgentScope Basics",
    16: "AgentScope Tools",
    17: "AgentScope RAG",
    18: "Workspaces & Permission Management",
    19: "Context Management & State Persistence",
    20: "AgentScope MCP & Skills",
    21: "Middleware",
    22: "AgentScope Image & Video Generation Assistant",
    23: "Why Multi-Agent Architectures?",
    24: "Common Multi-Agent Architectures",
    25: "Introducing LangGraph",
    26: "LangGraph Core: Nodes & Controllability",
    27: "Nodes & Control: Your First LangGraph",
    28: "Nodes & Control: Sequences, Branches, Conditional Edges & Loops",
    29: "Nodes & Control: Runtime Configuration & Map-Reduce",
    30: "LangGraph Core: Persistence & Memory",
    31: "Persistence: Thread-Isolated Checkpoints & Cross-Thread Storage",
    32: "Memory: Short-term, Long-term & Summarization",
    33: "LangGraph Core: Human-in-the-Loop",
    34: "Human-in-the-Loop: Waiting for User Input",
    35: "Human-in-the-Loop: Reviewing Tool Calls",
    36: "Human-in-the-Loop: Editing Graph State",
    37: "LangGraph Core: Time Travel",
    38: "LangGraph Core: Streaming",
    39: "LangGraph Core: Tool Calling",
    40: "Project: A Coding Assistant with LangGraph",
    41: "Project: A Prompt-Generator Assistant with LangGraph",
    42: "Project: Xiaolang Assistant (Multi-Agent Edition)",
    43: "LangChain Course Introduction",
    44: "LangChain Core Components",
    45: "LangChain Model I/O",
    46: "LangChain Data Connections",
    47: "Managing Chat History",
    48: "LangChain Expression Language (LCEL)",
    49: "Agent Architecture in LangChain",
    50: "LangServe & LangChain.js",
    51: "Building & Serving a Multi-Agent App with CrewAI + FastAPI",
    52: "Case: A Tech Researcher Agent with External Tools",
    53: "Case: A Health Records Assistant Agent",
    54: "Multiple Agents Collaborating on Software Coding",
    55: "Structured Tasks: JSON Inputs & JSON Outputs",
    56: "Human Feedback During Task Execution",
    57: "Quickly Building AI Agent Workflows",
    58: "Building Complex AI Agent Workflows",
}

MODULES = [
    ("m1", "Agent 基础概念", "Agent Fundamentals",
     "Agent 是什么、有哪些类型、由哪些部分组成。以理解为主，代码很少。",
     "What an agent is, its types and building blocks. Mostly concepts, little code.", 0, 3),
    ("m2", "从零手写 Agent", "Hand-Writing an Agent from Scratch",
     "只用 OpenAI 兼容接口，亲手写出 API 调用、工具调用、记忆和 ReAct 循环。全课最重要的模块。",
     "Using only an OpenAI-compatible API: calls, tool use, memory and a ReAct loop. The most important module.", 4, 7),
    ("m3", "OpenAI Agents SDK 与多 Agent 入门", "OpenAI Agents SDK & First Multi-Agent Systems",
     "第一次使用 Agent 框架：异步、流式、多模态、MCP，以及多个 Agent 分工协作。",
     "Your first agent framework: async, streaming, multimodality, MCP and agents that split the work.", 8, 14),
    ("m4", "AgentScope 框架", "The AgentScope Framework",
     "用 AgentScope 搭建带工具、RAG、MCP 和中间件的智能体。",
     "Building agents with tools, RAG, MCP and middleware in AgentScope.", 15, 22),
    ("m5", "多智能体架构与 LangGraph 控制流", "Multi-Agent Architectures & LangGraph Control Flow",
     "为什么要用多智能体，以及用 LangGraph 的节点和边控制流程。",
     "Why multi-agent systems, and controlling flow with LangGraph nodes and edges.", 23, 29),
    ("m6", "LangGraph 持久化、人机交互与更多核心组件", "LangGraph Persistence, Human-in-the-Loop & More",
     "记忆、检查点、人工审核、时光旅行、流式输出和工具调用。",
     "Memory, checkpoints, human review, time travel, streaming and tool calling.", 30, 39),
    ("m7", "LangGraph 实战", "LangGraph Projects",
     "把前面的组件组合成完整的应用。",
     "Combining the building blocks into complete applications.", 40, 42),
    ("m8", "LangChain", "LangChain",
     "LangChain 的模型输入输出、数据连接、对话历史、LCEL 和 Agent。",
     "LangChain model I/O, data connections, chat history, LCEL and agents.", 43, 50),
    ("m9", "CrewAI 多 Agent 协作", "Multi-Agent Teams with CrewAI",
     "用 CrewAI 组建 Agent 团队，并用 FastAPI 对外提供服务。",
     "Building agent teams with CrewAI and serving them with FastAPI.", 51, 56),
    ("m10", "AI Agent 工作流", "AI Agent Workflows",
     "快速搭建简单和复杂的 Agent 工作流。",
     "Building simple and complex agent workflows quickly.", 57, 58),
]


def main():
    episodes = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    pages = episodes["pages"]
    lessons = {}
    for p in pages:
        n = p["page"] - 1
        part = p["part"]
        zh = part.split("-", 1)[1] if n > 0 else "零基础自学 Agent 智能体入门指南（导学）"
        lessons[f"l{n:02d}"] = {
            "n": n,
            "num": f"{n:02d}",
            "page": p["page"],
            "duration": p["duration"],
            "title": {"zh": zh.strip(), "en": EN[n]},
        }

    modules = []
    for mid, zh, en, dzh, den, a, b in MODULES:
        ids = [f"l{n:02d}" for n in range(a, b + 1)]
        for i in ids:
            lessons[i]["module"] = mid
        modules.append({"id": mid, "title": {"zh": zh, "en": en},
                        "desc": {"zh": dzh, "en": den}, "lessons": ids})

    course = {
        "bvid": "BV1YG7G6eEPR",
        "videoTitle": episodes["title"],
        "modules": modules,
        "lessons": lessons,
    }
    out = ROOT / "data" / "course.js"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(
        "// Generated by tools/build_course.py - do not edit by hand.\n"
        "window.COURSE = Object.assign(window.COURSE || {}, "
        + json.dumps(course, ensure_ascii=False, indent=1)
        + ");\n",
        encoding="utf-8",
    )
    print(f"wrote {out} with {len(lessons)} lessons in {len(modules)} modules")


if __name__ == "__main__":
    main()
