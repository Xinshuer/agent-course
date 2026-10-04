"""第 49 节用到的两个工具：一个「模拟搜索」和一个「算星期几」
Lesson 49's two tools: a "mock search" and a "day of the week" calculator

视频里老师准备了两个工具：一个背后走谷歌搜索的搜索接口（要注册 API key；字幕没念出接口名，LangChain 里常用的是 SerpAPI），
一个自己写的工具：给它一个日期字符串，算出是星期几。
本课程没有搜索 key，所以 search 是一个「模拟搜索」：只在下面几条示例摘要里按关键词查找。
In the video the teacher prepares two tools: a Google-backed search API (needs a key; SerpAPI is the usual choice)
and a home-made tool that turns a date string into a day of the week.
This course has no search key, so `search` is a mock: it only looks up the few sample snippets below.

这个文件被 l49_react_todo.py、l49_react_solution.py、l49_self_ask.py、l49_create_agent.py 导入；
直接运行它可以离线测试两个工具（不调用模型）。
Imported by l49_react_todo.py, l49_react_solution.py, l49_self_ask.py and l49_create_agent.py;
run it directly to test both tools offline (no model calls).

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l49_tools.py
"""
from datetime import datetime

from langchain_core.tools import tool

# 模拟搜索的「网页摘要」。顺序有讲究：先查更具体的关键词（徐帆），再查冯小刚。
# The mock search's "web snippets". Order matters: the more specific keyword (Xu Fan) comes first.
FAKE_PAGES = {
    "徐帆": "徐帆，中国女演员，冯小刚的妻子，主演过电影《唐山大地震》（2010）和《一九四二》（2012）。",
    "Xu Fan": "Xu Fan is a Chinese actress, Feng Xiaogang's wife; she starred in Aftershock (2010) and Back to 1942 (2012).",
    "冯小刚": "冯小刚，中国导演，代表作有《甲方乙方》《唐山大地震》。他的妻子是演员徐帆。",
    "Feng Xiaogang": "Feng Xiaogang is a Chinese film director (Aftershock, Back to 1942). His wife is the actress Xu Fan.",
    "奥运": "2024 年巴黎奥运会开幕式于 2024 年 7 月 26 日晚在塞纳河上举行。",
    "Olympic": "The opening ceremony of the Paris 2024 Olympic Games was held on the Seine on 26 July 2024.",
}

WEEKDAYS = ["星期一 Monday", "星期二 Tuesday", "星期三 Wednesday", "星期四 Thursday",
            "星期五 Friday", "星期六 Saturday", "星期日 Sunday"]


@tool
def search(query: str) -> str:
    """搜索引擎：查询人物、事件、日期等事实信息。输入是一个搜索问题。
    Search engine for facts about people, events and dates. The input is a search query."""
    for keyword, page in FAKE_PAGES.items():
        if keyword.lower() in query.lower():   # 不区分大小写 / case-insensitive
            return page
    return "没有找到相关结果。/ No results found."


@tool
def weekday(date_str: str) -> str:
    """计算某个日期是星期几。输入必须是 YYYY-MM-DD 格式的日期，例如 2024-07-26。
    Work out the day of the week for a date. The input must be a YYYY-MM-DD date, e.g. 2024-07-26."""
    try:
        d = datetime.strptime(date_str.strip(), "%Y-%m-%d")   # 字符串 → 日期 / string -> date
    except ValueError:
        return "日期格式不对，请用 YYYY-MM-DD，例如 2024-07-26。/ Bad date format, use YYYY-MM-DD."
    return WEEKDAYS[d.weekday()]                              # weekday(): 星期一是 0 / Monday is 0


if __name__ == "__main__":
    print(search.invoke("2024年巴黎奥运会开幕式是哪天"))
    print(search.invoke("冯小刚的老婆是谁"))
    print(search.invoke("徐帆演过哪些电影"))
    print(weekday.invoke("2024-07-26"))
    print(weekday.invoke("2024年7月26日"))   # 格式不对 → 返回提示，不会崩溃 / wrong format -> a hint, no crash
