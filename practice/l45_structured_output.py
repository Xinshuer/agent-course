"""第 45 节演示：结构化输出 with_structured_output（对应视频 17:22–23:05）
Lesson 45 demo: structured output with with_structured_output (video 17:22-23:05)

和视频一样，用 pydantic 定义一个 Date 类：year、month、day、era（公元前 BC / 公元后 AD），
让模型从一句话里把日期提取成结构化数据（BaseModel 回顾 12 节）。
1. 传 pydantic 类 → 直接得到 Date 对象
2. 传手写的 JSON Schema 字典 → 得到字典
3. 补充：method="json_mode"，思考模式下也能用，但提示词里要写明 JSON 和字段
deepseek-flash 的注意事项：ChatDeepSeek 的 with_structured_output 默认 method="function_calling"，
要强制模型调用一个工具，而思考模式不允许强制（报 400），所以第 1、2 步用关掉思考的模型。
Like the video, a pydantic Date class (year, month, day, era: BC / AD) lets the model extract a date
from a sentence as structured data (BaseModel: see lesson 12).
1. Pass the pydantic class -> get a Date object
2. Pass a hand-written JSON Schema dict -> get a dict
3. Extra: method="json_mode" works with thinking on, but the prompt must ask for JSON and name the fields
deepseek-flash note: ChatDeepSeek's with_structured_output defaults to method="function_calling", which forces
a tool call; thinking mode refuses that (400), so steps 1 and 2 use a model with thinking switched off.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l45_structured_output.py
会调用 3 次模型，使用 DEEPSEEK_API_KEY。/ Makes 3 model calls using DEEPSEEK_API_KEY.
"""
from langchain_core.prompts import PromptTemplate
from langchain_deepseek import ChatDeepSeek
from pydantic import BaseModel, Field

from llm import API_KEY, MODEL


class Date(BaseModel):
    """从文字里提取出的一个日期"""
    year: int = Field(description="年份，例如 2024")
    month: int = Field(description="月份，1 到 12")
    day: int = Field(description="日，1 到 31")
    era: str = Field(description="公元前写 BC，公元后写 AD")


# 不用 pydantic 类，也可以手写 JSON Schema（视频 21:32 起）；"title" 必须有，会被当成工具名
# Instead of a class you can hand-write a JSON Schema (video from 21:32); "title" is required - it becomes the tool name
DATE_SCHEMA = {
    "title": "Date",
    "description": "从文字里提取出的一个日期",
    "type": "object",
    "properties": {
        "year": {"type": "integer", "description": "年份，例如 2024"},
        "month": {"type": "integer", "description": "月份，1 到 12"},
        "day": {"type": "integer", "description": "日，1 到 31"},
        "era": {"type": "string", "description": "公元前写 BC，公元后写 AD"},
    },
    "required": ["year", "month", "day", "era"],
}

prompt = PromptTemplate.from_template("提取用户输入中的日期。\n用户输入：{query}")
QUERY = "2024年4月6日，我们全家去西湖划船，天气晴。"

# 关掉思考模式：extra_body 用来传 DeepSeek 自己的参数（04 节）/ thinking off: extra_body carries DeepSeek-specific settings
fast_model = ChatDeepSeek(model=MODEL, api_key=API_KEY, extra_body={"thinking": {"type": "disabled"}})


def with_pydantic_class():
    structured_model = fast_model.with_structured_output(Date)      # 得到一个「带结构化输出能力」的新模型
    date = structured_model.invoke(prompt.invoke({"query": QUERY}))
    print("类型 / type:", type(date).__name__)                       # Date —— 是对象，不是字符串
    print(repr(date))
    print("用点号取字段 / fields with dots:", date.year, date.month, date.day, date.era)


def with_json_schema():
    structured_model = fast_model.with_structured_output(DATE_SCHEMA)
    result = structured_model.invoke(prompt.invoke({"query": QUERY}))
    print("类型 / type:", type(result).__name__)                     # dict
    print(result)
    print("用方括号取值 / values with brackets:", result["year"], result["month"])


def with_json_mode():
    model = ChatDeepSeek(model=MODEL, api_key=API_KEY)               # 保持默认的思考模式 / thinking left on
    json_model = model.with_structured_output(Date, method="json_mode")
    date = json_model.invoke([
        ("system", "只输出一个 JSON 对象，字段：year、month、day（都是整数）和 era（公元前写 BC，公元后写 AD）。"),
        ("human", QUERY),
    ])
    print("类型 / type:", type(date).__name__)
    print(repr(date))


if __name__ == "__main__":
    for name, demo in [("pydantic 类 / class", with_pydantic_class),
                       ("JSON Schema 字典 / dict", with_json_schema),
                       ("json_mode（补充 / extra）", with_json_mode)]:
        print(f"== {name} ==")
        try:
            demo()
        except Exception as e:                                       # 出错时打印原因，继续下一个 / report and go on
            print("出错 / error:", type(e).__name__, e)
        print()
