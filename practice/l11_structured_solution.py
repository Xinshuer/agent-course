"""第 11 节练习参考答案：结构化输出 —— 用 pydantic 规定 Agent 的输出格式（视频里的例子：介绍一位值得记住的人）
Lesson 11 solution: structured output - fix the agent's output format with pydantic
(the video's example: introduce a person worth remembering)

步骤 / Steps:
1. 写一个继承 BaseModel 的类 Data，字段用中文：名字、性别、事迹（字符串），年龄（整数）
   a BaseModel class Data with Chinese field names: name, gender, deeds (str) and age (int)
2. Agent(..., output_type=Data)：最终输出就是一个 Data 对象，用 obj.名字 这样读取
   with output_type=Data the final output is a Data object; read it with obj.名字
3. 打印 to_input_list()：在对话历史里，这个对象是以 JSON 字符串的形式保存的
   print to_input_list(): in the history the object is stored as a JSON string

DeepSeek 的特殊处理 / DeepSeek workaround:
    output_type 会让 SDK 在请求里带上 response_format={"type": "json_schema", ...}，
    DeepSeek 不支持这种格式（返回 400：This response_format type is unavailable now）。
    所以用 model_settings 的 extra_body 把它换成 DeepSeek 支持的 {"type": "json_object"}，
    并在 instructions 里写明字段（json_object 模式要求提示词里出现 "json" 字样）。
    SDK 收到回答后照样按 Data 校验，result.final_output 仍然是 Data 对象。
    output_type makes the SDK send response_format={"type": "json_schema", ...}; DeepSeek rejects it
    with a 400. extra_body in model_settings swaps it for {"type": "json_object"}, which DeepSeek
    accepts, and the instructions list the fields (json_object mode needs the word "json" in the
    prompt). The SDK still validates the answer against Data, so final_output is a Data object.
    视频里老师用的谷歌模型直接支持 json_schema，不需要这一行。
    The Google model in the video supports json_schema directly and needs no such line.

运行环境 / Environment: .venv  (openai-agents 0.20.0, pydantic 2)
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l11_structured_solution.py
需要 / Needs: DEEPSEEK_API_KEY
"""
from pydantic import BaseModel

from agents import Agent, ModelSettings, OpenAIChatCompletionsModel, Runner, set_tracing_disabled

from llm import MODEL, async_client

set_tracing_disabled(True)


class Data(BaseModel):
    名字: str
    性别: str
    事迹: str
    年龄: int


agent = Agent(
    name="助手",
    instructions="你是一个人物介绍助手。用 JSON 回答，只包含四个字段：名字、性别、事迹、年龄（整数）。",
    model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),
    output_type=Data,   # 规定最终输出的结构 / the structure of the final output
    # DeepSeek 专用：把 SDK 发送的 json_schema 换成 json_object / DeepSeek only: swap json_schema for json_object
    model_settings=ModelSettings(extra_body={"response_format": {"type": "json_object"}}),
)


def main():
    result = Runner.run_sync(agent, "介绍一位值得记住的人")
    obj = result.final_output                     # 一个 Data 对象，不是字符串 / a Data object, not a str
    print("完整对象 / the whole object:", obj)
    print("类型 / type:", type(obj).__name__)
    print("名字 / name:", obj.名字)
    print("性别 / gender:", obj.性别)
    print("年龄 / age:", obj.年龄, "（明年 / next year:", obj.年龄 + 1, "）")   # 年龄是 int，可以直接做加法
    print("事迹 / deeds:", obj.事迹)

    print("\n完整的对话记录 / the full conversation record:")
    for item in result.to_input_list():
        print("  ", str(item)[:160])
    # 最后一项是 assistant 消息，里面的 text 是一段 JSON 字符串，而不是 Data 对象
    # The last item is the assistant message; its text is a JSON string, not a Data object


if __name__ == "__main__":
    main()
