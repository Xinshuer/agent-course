"""第 48 节示例：LCEL 基础——跟着视频的前两个例子：语义解析链（invoke）和讲笑话的链（stream），再加上 batch
Lesson 48 demo: LCEL basics - the video's first two examples, a semantic-parsing chain (invoke)
and a joke chain (stream), plus batch.

运行环境 / Environment: .venv
运行 / Run (在 practice 文件夹里 / from the practice folder):
    & ..\\.venv\\Scripts\\python.exe l48_lcel_basics.py
需要 / Needs: DEEPSEEK_API_KEY（一共调用 4 次模型 / 4 model calls in total）

视频用的是 OpenAI 的模型；这里换成 DeepSeek（practice/llm.py 里的 deepseek-flash）。
The video uses OpenAI models; here we use DeepSeek (deepseek-flash from practice/llm.py).

三个例子 / Three demos:
1. demo_parse()  语义解析：把一句话解析成结构化的查询条件（视频的例子一）
                 semantic parsing: turn a sentence into a structured query (the video's example 1)
2. demo_stream() 流式输出：讲笑话的链（视频的例子二）/ streaming: the joke chain (example 2)
3. demo_batch()  批量调用（后台并发，视频在「官方对比」里提到）/ batch calls (run concurrently)
"""
from typing import Literal, Optional

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_deepseek import ChatDeepSeek
from pydantic import BaseModel, Field

from llm import API_KEY, MODEL

model = ChatDeepSeek(model=MODEL, api_key=API_KEY)

# with_structured_output 默认靠「强制调用工具」实现，deepseek-flash 的思考模式不支持这种强制，
# 所以解析用的模型要关掉思考（第 45 节讲过）。
# with_structured_output forces a tool call by default; deepseek-flash's thinking mode rejects that,
# so the parsing model has thinking switched off (see lesson 45).
parse_model = ChatDeepSeek(model=MODEL, api_key=API_KEY, extra_body={"thinking": {"type": "disabled"}})


# ---------- 1. 语义解析链 / semantic-parsing chain ----------
class Semantics(BaseModel):
    """从用户的话里解析出的流量套餐查询条件 / data-plan query conditions parsed from what the user said"""
    name: Optional[str] = Field(default=None, description="流量包名称")
    price_lower: Optional[int] = Field(default=None, description="价格下限，单位：元/月")
    price_upper: Optional[int] = Field(default=None, description="价格上限，单位：元/月")
    data_lower: Optional[int] = Field(default=None, description="流量下限，单位：GB/月")
    data_upper: Optional[int] = Field(default=None, description="流量上限，单位：GB/月")
    sort_by: Optional[Literal["price", "data"]] = Field(default=None, description="按价格(price)还是按流量(data)排序")
    ordering: Optional[Literal["ascend", "descend"]] = Field(default=None, description="升序(ascend)还是降序(descend)")


parse_prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个语义解析器：把用户的话解析成 JSON 格式的查询条件。不要回答用户的问题。"),
    ("human", "{text}"),
])

# A：RunnablePassthrough() 原样传递输入，放进字典的 "text" 位置
# B：提示词模板把 {text} 填好；C：模型按 Semantics 的结构输出
# A: RunnablePassthrough() passes the input through into "text";
# B: the prompt fills {text}; C: the model answers in the shape of Semantics
parse_chain = {"text": RunnablePassthrough()} | parse_prompt | parse_model.with_structured_output(Semantics)


def demo_parse():
    query = parse_chain.invoke("不超过 100 元的流量大的套餐有哪些？")
    print("类型 / type:", type(query).__name__)
    print(query.model_dump())


# ---------- 2 & 3. 讲笑话的链：流式和批量 / the joke chain: streaming and batch ----------
joke_prompt = ChatPromptTemplate.from_template("讲一个关于{topic}的笑话，不超过三句话。")
joke_chain = {"topic": RunnablePassthrough()} | joke_prompt | model | StrOutputParser()


def demo_stream():
    # deepseek-flash 先「思考」一会儿（这时收到的是空字符串），然后文字才一段段出来
    # deepseek-flash "thinks" first (those pieces are empty strings), then the text arrives piece by piece
    for piece in joke_chain.stream("小明"):
        print(piece, end="", flush=True)
    print()


def demo_batch():
    topics = ["程序员", "猫"]
    answers = joke_chain.batch(topics, config={"max_concurrency": 2})   # 两个请求同时发出 / both requests run at once
    for topic, answer in zip(topics, answers):
        print(f"[{topic}] {answer}\n")


if __name__ == "__main__":
    print("== 1. invoke：语义解析 / semantic parsing")
    demo_parse()
    print("\n== 2. stream：流式输出 / streaming")
    demo_stream()
    print("\n== 3. batch：批量调用 / batch")
    demo_batch()
