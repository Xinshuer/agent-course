"""第 48 节示例：给链加上对话历史——RunnableWithMessageHistory + session_id，历史存进 SQLite（对应视频最后一段）
Lesson 48 demo: give a chain a chat history - RunnableWithMessageHistory + session_id, with the
history stored in SQLite (the last part of the video).

运行环境 / Environment: .venv（已装 greenlet，SQLChatMessageHistory 可用 / greenlet is installed）
运行 / Run (在 practice 文件夹里 / from the practice folder):
    & ..\\.venv\\Scripts\\python.exe l48_chat_history.py
需要 / Needs: DEEPSEEK_API_KEY（调用 3 次模型 / 3 model calls）
历史存在 practice/data/l48_chat_history.db（SQLite 文件，运行时自动创建；删掉它就清空了所有会话）。
History is kept in practice/data/l48_chat_history.db (an SQLite file created on first run; delete it
to wipe every session).

注意 / Note: 在已安装的 langchain-core 1.6.6 里，RunnableWithMessageHistory 已标记为「弃用」（2.0 会删除），
官方建议改用 LangGraph 的持久化（见第 31、32 节）。现在仍然能用，这里为了跟上视频继续演示，并把提示隐藏掉。
In langchain-core 1.6.6 RunnableWithMessageHistory is deprecated (removal in 2.0); LangChain recommends
LangGraph persistence instead (lessons 31-32). It still works; the warnings are hidden here.
"""
import warnings

warnings.filterwarnings("ignore", message=".*langchain-community.*")   # 「community 包即将停止维护」/ sunset notice

from langchain_community.chat_message_histories import SQLChatMessageHistory
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_deepseek import ChatDeepSeek

from llm import API_KEY, MODEL

# 要写在 import 之后：langchain_core 导入时会重新打开弃用提示 / must come after the imports,
# because importing langchain_core switches deprecation warnings back on
warnings.filterwarnings("ignore", message=".*deprecated.*")

# 一条最基础的链：模型 → 字符串 / the most basic chain: model -> string
model = ChatDeepSeek(model=MODEL, api_key=API_KEY)
chain = model | StrOutputParser()


# 对话历史放在链的「外面」：按 session_id 从 SQLite 数据库里取出这个会话的历史
# The history lives OUTSIDE the chain: fetch one session's history from an SQLite database by session_id
def get_session_history(session_id):
    return SQLChatMessageHistory(session_id, connection="sqlite:///data/l48_chat_history.db")


# 在基础链外面「套一层」：调用前自动取出历史拼在前面，调用后把这一轮存回去
# Wrap the basic chain: history is loaded and prepended before each call, and the new turn saved after it
chat = RunnableWithMessageHistory(chain, get_session_history)


def ask(question, session_id):
    config = {"configurable": {"session_id": session_id}}    # 告诉它是哪个会话 / which session this is
    return chat.invoke(question, config=config)


if __name__ == "__main__":
    for sid in ("xiaoming", "test"):
        get_session_history(sid).clear()          # 每次运行前先清空，方便看效果 / start each run from scratch

    print("[xiaoming]", ask("你好，我叫小明。", "xiaoming"))
    print("[xiaoming]", ask("你知道我叫什么名字吗？", "xiaoming"))   # 同一个会话：记得 / same session: remembers
    print("[test]    ", ask("你知道我叫什么名字吗？", "test"))       # 新会话：没有历史 / new session: no history

    for sid in ("xiaoming", "test"):
        history = get_session_history(sid)
        print(f"\n数据库里会话 {sid} 有 {len(history.messages)} 条消息 / messages stored for session {sid}:")
        for m in history.messages:
            print(f"  {m.type}: {m.content}")
