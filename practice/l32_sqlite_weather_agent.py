"""第 32 节演示：把检查点写进数据库，程序重启后对话还在（视频第二部分，MongoDB 换成 SQLite）
Lesson 32 demo: checkpoints in a database, so the conversation survives a restart
(part 2 of the video, with SQLite instead of MongoDB)

视频：用 Docker 跑 MongoDB，MongoDBSaver + create_react_agent，问「北京今天天气如何」。
这里：SqliteSaver（一个数据库文件，不用装任何服务）+ create_agent（create_react_agent 在 LangGraph 1.x 里已弃用）。
The video: MongoDB in Docker, MongoDBSaver + create_react_agent, asking about Beijing's weather.
Here: SqliteSaver (a single database file, no server) + create_agent (create_react_agent is
deprecated in LangGraph 1.x).

运行两次 / Run it twice:
- 第一次：数据库里没有记录，问北京天气（模型会调用 get_weather 工具）。
- 第二次：先从数据库读出上次的对话，再问「我刚才问的是哪个城市？」——它记得。
- First run: nothing saved yet, asks about Beijing's weather (the model calls get_weather).
- Second run: loads the previous conversation from the file, then asks which city it was - it remembers.

数据库文件 / Database file: practice/data/l32_checkpoints.db（想从头开始就删掉它 / delete it to start over）

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l32_sqlite_weather_agent.py
第一次调用 2 次 DeepSeek，之后每次 1 次 / 2 DeepSeek calls on the first run, 1 per run after that.
"""
from pathlib import Path

from langchain.agents import create_agent
from langchain_deepseek import ChatDeepSeek
from langgraph.checkpoint.sqlite import SqliteSaver

from llm import API_KEY, MODEL

DB_PATH = Path(__file__).parent / "data" / "l32_checkpoints.db"

model = ChatDeepSeek(model=MODEL, api_key=API_KEY)


def get_weather(city: str) -> str:
    """查询某个城市今天的天气。Get today's weather for a city."""
    if city == "北京":
        return "北京今天晴，气温 20 度左右，适合外出。"
    elif city == "深圳":
        return "深圳今天多云，有阵雨，气温 28 度。"
    else:
        return "未知城市"


tools = [get_weather]


if __name__ == "__main__":
    DB_PATH.parent.mkdir(exist_ok=True)
    config = {"configurable": {"thread_id": "1"}}

    # with 块：进入时打开数据库连接，离开时自动关闭 / opened on entry, closed automatically on exit
    with SqliteSaver.from_conn_string(str(DB_PATH)) as checkpointer:
        graph = create_agent(model, tools=tools, system_prompt="你是一个天气助手，回答要简短。",
                             checkpointer=checkpointer)

        saved = graph.get_state(config).values.get("messages", [])
        print(f"数据库里线程 1 已有 {len(saved)} 条消息 / {len(saved)} messages already saved for thread 1")

        if not saved:
            question = "北京今天天气如何？"
        else:
            question = "我刚才问的是哪个城市？"

        response = graph.invoke({"messages": [{"role": "user", "content": question}]}, config)
        for message in response["messages"]:
            message.pretty_print()
