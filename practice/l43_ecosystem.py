"""第 43 节演示：看一看你电脑上的 LangChain 家族
Lesson 43 demo: a look at the LangChain family installed on your machine

1. 打印 LangChain 相关各个包的版本（pip 包名 → import 名）。
2. 打印几个常用的类分别来自哪个包。
3. 试一试旧教程（LangChain 0.x）里的导入写法，看看在 1.x 里哪些已经不能用了。
1. Prints the version of each LangChain-related package (pip name -> import name).
2. Prints which package some everyday classes come from.
3. Tries import lines from older (LangChain 0.x) tutorials to see which no longer work in 1.x.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l43_ecosystem.py
不调用模型，不需要 API key。/ Makes no model calls and needs no API key.
"""
from importlib.metadata import PackageNotFoundError, version

PACKAGES = [
    "langchain-core",            # 基础抽象：消息、提示词模板、输出解析器、Runnable / base abstractions
    "langchain",                 # 1.x：create_agent、init_chat_model、中间件 / agents, init_chat_model, middleware
    "langchain-deepseek",        # DeepSeek 集成：ChatDeepSeek / DeepSeek integration
    "langchain-openai",          # OpenAI 及兼容接口：ChatOpenAI / OpenAI and compatible APIs
    "langchain-community",       # 社区维护的大量集成 / many community integrations
    "langchain-text-splitters",  # 文本切分器 / text splitters
    "langchain-classic",         # 0.x 的旧组件：LLMChain、Memory、AgentExecutor / legacy 0.x pieces
    "langgraph",                 # 底层编排框架（25–42 节）/ low-level orchestration (lessons 25-42)
    "langsmith",                 # 追踪和评估平台的客户端 / client for the tracing & evaluation platform
]

OLD_IMPORTS = [
    "from langchain.prompts import PromptTemplate",
    "from langchain.schema import HumanMessage",
    "from langchain.chat_models import ChatOpenAI",
    "from langchain.chains import LLMChain",
    "from langchain.memory import ConversationBufferMemory",
]


def show_versions():
    print("== 已安装的包 / installed packages ==")
    for pip_name in PACKAGES:
        import_name = pip_name.replace("-", "_")      # pip 名用 -，import 名用 _
        try:
            v = version(pip_name)
        except PackageNotFoundError:
            v = "未安装 / not installed"
        print(f"  pip: {pip_name}  ->  import {import_name}  ->  {v}")


def show_where_classes_live():
    from langchain.agents import create_agent
    from langchain_core.messages import HumanMessage
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_deepseek import ChatDeepSeek
    from langchain_openai import ChatOpenAI

    print("\n== 常用的类来自哪个包 / where everyday classes live ==")
    for obj in [ChatDeepSeek, ChatOpenAI, HumanMessage, ChatPromptTemplate, create_agent]:
        print(f"  {obj.__name__}  ->  {obj.__module__}")


def try_old_imports():
    print("\n== 旧教程的导入写法在 1.x 里 / old tutorial imports under 1.x ==")
    for line in OLD_IMPORTS:
        try:
            exec(line)                                 # 运行这一行 import 语句 / run the import line
            print(f"  OK    {line}")
        except ImportError as e:
            print(f"  失败  {line}\n        -> {type(e).__name__}: {e}")


if __name__ == "__main__":
    show_versions()
    show_where_classes_live()
    try_old_imports()
    print("\n旧组件现在在 langchain_classic 里，例如 / legacy pieces now live in langchain_classic, e.g.:")
    print("  from langchain_classic.chains import LLMChain")
