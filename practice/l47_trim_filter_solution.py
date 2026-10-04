"""第 47 节参考答案：用 trim_messages 剪裁对话历史、用 filter_messages 按类型 / 名字 / id 筛选
Lesson 47 solution: trim chat history with trim_messages and filter it with filter_messages
(by type / name / id).

运行环境 / Environment: .venv
运行 / Run (在 practice 文件夹里 / from the practice folder):
    & ..\\.venv\\Scripts\\python.exe l47_trim_filter_solution.py
需要 / Needs: DEEPSEEK_API_KEY（最后会调用 2 次模型 / makes 2 model calls at the end）

视频按它所用模型的分词规则数 token、上限 45；DeepSeek 的模型对象不能用来数 token，
所以这里用 count_tokens_approximately 估算，上限改成 35，剪出来的效果和视频一样。
The video counts tokens with its model's tokenizer and a limit of 45; a DeepSeek model object
can't count tokens, so we estimate with count_tokens_approximately and use 35 for the same effect.
"""
from langchain_core.messages import (
    AIMessage,
    HumanMessage,
    SystemMessage,
    filter_messages,
    trim_messages,
)
from langchain_core.messages.utils import count_tokens_approximately
from langchain_deepseek import ChatDeepSeek

from llm import API_KEY, MODEL

# ---------- 剪裁用的历史 / the history to trim ----------
history = [
    SystemMessage("你是一个简洁的中文助手，回答不超过两句话。"),
    HumanMessage("你好，我叫小明。"),
    AIMessage("你好小明！有什么可以帮你？"),
    HumanMessage("推荐几个学 Python 的网站。"),
    AIMessage("可以从这几个网站开始：\n1. Python 官方教程 docs.python.org\n2. 菜鸟教程 runoob.com\n3. 廖雪峰的 Python 教程"),
    HumanMessage("我叫什么名字？"),
]

# ---------- 筛选用的历史：id 和 name 是我们自己打的「标签」 ----------
# The history to filter: id and name are our own "tags".
# name 记谁说的（example_* 是示范用的样例对话），id 给每条消息编号。
# name marks who spoke (example_* are few-shot sample turns), id numbers the messages.
tagged = [
    SystemMessage("你是一个简洁的中文助手。", id="1"),
    HumanMessage("（示范）把“谢谢”翻译成英文", id="2", name="example_user"),
    AIMessage("（示范）Thank you.", id="3", name="example_assistant"),
    HumanMessage("把“早上好”翻译成英文", id="4", name="xiaoming"),
    AIMessage("Good morning.", id="5", name="assistant"),
]


def show(title, messages):
    print(f"\n== {title}（{len(messages)} 条 / messages）")
    for m in messages:
        print(f"  {m.type:<6} id={m.id} name={m.name} | {m.content!r}")


if __name__ == "__main__":
    print("整段历史约", count_tokens_approximately(history), "个 token / approx. tokens in total")

    # ---------- 1. 剪裁 trim_messages ----------
    # A. 从后往前（strategy="last"），最多 35 个 token → 只剩最后两条，system 也被剪掉了
    # A. keep from the end, at most 35 tokens -> only the last two messages; system is gone too
    a = trim_messages(history, max_tokens=35, strategy="last",
                      token_counter=count_tokens_approximately)
    show("A. max_tokens=35, strategy='last'", a)

    # B. 加上 include_system=True（保住 system）和 allow_partial=True（允许只留一条消息的后半部分）
    # B. add include_system=True (keep system) and allow_partial=True (may keep the tail of a message)
    b = trim_messages(history, max_tokens=35, strategy="last",
                      token_counter=count_tokens_approximately,
                      include_system=True, allow_partial=True)
    show("B. + include_system=True, allow_partial=True", b)

    # C.（补充）start_on="human"：system 之后必须从用户的话开始
    # C. (extra) start_on="human": after system, start with something the user said
    c = trim_messages(history, max_tokens=45, strategy="last",
                      token_counter=count_tokens_approximately,
                      include_system=True, start_on="human")
    show("C. max_tokens=45, include_system=True, start_on='human'", c)

    # ---------- 2. 筛选 filter_messages ----------
    show("只要用户的话 include_types='human'", filter_messages(tagged, include_types="human"))
    show("去掉示范 exclude_names=[...]",
         filter_messages(tagged, exclude_names=["example_user", "example_assistant"]))
    show("组合：人和 AI 的消息，但不要 id 3",
         filter_messages(tagged, include_types=[HumanMessage, AIMessage], exclude_ids=["3"]))

    # ---------- 3. 补充：同一个问题，带不同长度的历史去问模型 ----------
    # 3. Extra: ask the same question with a trimmed vs. a full history
    model = ChatDeepSeek(model=MODEL, api_key=API_KEY)
    trimmed = trim_messages(history, max_tokens=35, strategy="last",
                            token_counter=count_tokens_approximately,
                            include_system=True, start_on="human")
    show("发给模型的剪裁结果 / trimmed history sent to the model", trimmed)
    print("\n用剪裁后的历史 / with the trimmed history:", model.invoke(trimmed).content)
    print("用完整历史 / with the full history:", model.invoke(history).content)
