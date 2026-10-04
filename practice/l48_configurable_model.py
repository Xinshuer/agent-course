"""第 48 节示例（选修）：用 configurable_alternatives 让同一条链在运行时切换模型（「工厂」的效果）
Lesson 48 demo (optional): configurable_alternatives lets one chain switch models at run time
(a "factory" without writing a factory).

运行环境 / Environment: .venv
运行 / Run (在 practice 文件夹里 / from the practice folder):
    & ..\\.venv\\Scripts\\python.exe l48_configurable_model.py
需要 / Needs: DEEPSEEK_API_KEY（调用 2 次模型：deepseek-flash 和 deepseek-v4-pro / 2 model calls）。
可选 / Optional: 如果设置了 DASHSCOPE_API_KEY（阿里云百炼），还会用 qwen-plus 再跑一次。
视频这一段切换的是 OpenAI 的 GPT-4o mini（默认）和百度文心一言；这里用同一个 DeepSeek key 就能切换的
deepseek-flash（默认）和 deepseek-v4-pro，另外可选通义千问 qwen-plus。
If DASHSCOPE_API_KEY (Alibaba Cloud Bailian) is set, it also runs the chain with qwen-plus.
The video switches between OpenAI's GPT-4o mini (default) and Baidu ERNIE Bot; here we switch between
deepseek-flash (default) and deepseek-v4-pro, which share one DeepSeek key, plus an optional qwen-plus.
"""
import os

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import ConfigurableField, RunnablePassthrough
from langchain_deepseek import ChatDeepSeek
from langchain_openai import ChatOpenAI

from llm import API_KEY, MODEL


def make_qwen():
    """只有选中 "qwen" 时才会调用这个函数创建模型，所以没有百炼 key 也不会报错。
    Called only when "qwen" is selected, so a missing Bailian key causes no error otherwise."""
    return ChatOpenAI(
        model="qwen-plus",
        api_key=os.environ["DASHSCOPE_API_KEY"],
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    )


# 默认用 deepseek-flash；配置项 "llm" 等于 "pro" 时换成 deepseek-v4-pro，等于 "qwen" 时换成通义千问
# deepseek-flash by default; when the config field "llm" is "pro" use deepseek-v4-pro, when "qwen" use Qwen
model = ChatDeepSeek(model=MODEL, api_key=API_KEY).configurable_alternatives(
    ConfigurableField(id="llm"),       # 配置项的名字（自己起）/ the config field's name (your choice)
    default_key="flash",               # 默认选项的名字 / name of the default option
    pro=ChatDeepSeek(model="deepseek-v4-pro", api_key=API_KEY),
    qwen=make_qwen,                    # 也可以给一个「创建模型的函数」/ or a function that creates the model
)

prompt = ChatPromptTemplate.from_messages([("human", "{query}")])
# 这里不接 StrOutputParser，好从 AIMessage 的 response_metadata 里看出到底是哪个模型回答的
# No StrOutputParser here, so we can read which model answered from the AIMessage's response_metadata
chain = {"query": RunnablePassthrough()} | prompt | model


def ask(llm_name, question):
    msg = chain.with_config(configurable={"llm": llm_name}).invoke(question)   # 运行时选择模型 / pick at run time
    print(f"[{llm_name}] model_name = {msg.response_metadata.get('model_name')}")
    print("   ", msg.content)


if __name__ == "__main__":
    ask("flash", "请用一句话自我介绍。")
    ask("pro", "请用一句话自我介绍。")
    if os.environ.get("DASHSCOPE_API_KEY"):
        ask("qwen", "请用一句话自我介绍。")
    else:
        print("（没有设置 DASHSCOPE_API_KEY，跳过 qwen / DASHSCOPE_API_KEY not set, skipping qwen）")
