"""第 45 节演示：先让模型输出文本，再用输出解析器解析；解析失败时自动修复（对应视频 23:05–30:32）
Lesson 45 demo: let the model answer in text, then parse it with an output parser; repair failures (video 23:05-30:32)

1. JsonOutputParser：提示词里放上 get_format_instructions() 生成的格式说明，模型照常用文字回答，
   再把回答里的 JSON 解析成字典
2. PydanticOutputParser：同一段回答，解析成 Date 对象（会检查字段名和类型）
3. OutputFixingParser：和视频一样，把正确回答里的 "4" 换成汉字「四」，JSON 就不合法了；
   原来的解析器报错，带修复功能的解析器把原输出和错误交给模型，改好以后再解析
1. JsonOutputParser: put the format note from get_format_instructions() into the prompt, let the model answer
   in text as usual, then parse the JSON in the answer into a dict
2. PydanticOutputParser: parse the same answer into a Date object (field names and types are checked)
3. OutputFixingParser: as in the video, swap "4" in a good answer for the Chinese numeral 四 so the JSON breaks;
   the plain parser fails, and the fixing parser sends the output and the error to the model, then parses again

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l45_output_parsers.py
会调用 2 次模型（第 1 步 1 次，第 3 步修复 1 次），使用 DEEPSEEK_API_KEY。
Makes 2 model calls (step 1 once, the repair in step 3 once) using DEEPSEEK_API_KEY.
"""
from langchain_classic.output_parsers import OutputFixingParser   # 1.x 里只在 langchain_classic 里 / only in langchain_classic in 1.x
from langchain_core.exceptions import OutputParserException
from langchain_core.output_parsers import JsonOutputParser, PydanticOutputParser
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


model = ChatDeepSeek(model=MODEL, api_key=API_KEY)            # 普通模型，思考模式照常开着 / thinking stays on
json_parser = JsonOutputParser(pydantic_object=Date)          # 解析成字典 / parses into a dict
pydantic_parser = PydanticOutputParser(pydantic_object=Date)  # 解析成 Date 对象 / parses into a Date object

prompt = PromptTemplate(
    template="提取用户输入中的日期。\n用户输入：{query}\n{format_instructions}",
    input_variables=["query"],
    # 格式说明先填好（partial），调用时只需要给 query / the format note is filled in up front
    partial_variables={"format_instructions": json_parser.get_format_instructions()},
)
QUERY = "2024年4月6日，我们全家去西湖划船，天气晴。"


def raw_then_parse():
    output = model.invoke(prompt.invoke({"query": QUERY}))   # AIMessage：模型用文字回答 / a plain-text answer
    print("原始输出 / raw output:\n" + output.content)
    print("\nJsonOutputParser     ->", json_parser.invoke(output))          # dict
    print("PydanticOutputParser ->", repr(pydantic_parser.invoke(output)))  # Date(...)
    return output


def fix_bad_output(output):
    bad_output = output.content.replace("4", "四")             # 故意改坏：四 没有引号，JSON 不合法
    print("故意改坏的输出 / broken on purpose:", bad_output)
    try:
        pydantic_parser.invoke(bad_output)
    except OutputParserException as e:
        print("原来的解析器失败 / plain parser failed:", str(e).splitlines()[0][:80])

    # 原来的解析器 + 负责修复的模型 / the original parser + a model to do the fixing
    fixing_parser = OutputFixingParser.from_llm(llm=model, parser=pydantic_parser)
    date = fixing_parser.invoke(bad_output)                   # 失败 -> 模型修复 -> 再解析 / fail -> repair -> parse
    print("修好了 / fixed:", repr(date))


if __name__ == "__main__":
    good = raw_then_parse()
    print()
    fix_bad_output(good)
