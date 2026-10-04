"""第 11 节练习：结构化输出（TODO 版）—— 让 Agent 按 Data 的格式介绍一位值得记住的人
Lesson 11 exercise: structured output (TODO version) - introduce a person in the Data format

运行环境 / Environment: .venv  (openai-agents 0.20.0, pydantic 2)
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l11_structured_todo.py
需要 / Needs: DEEPSEEK_API_KEY
参考答案 / Solution: l11_structured_solution.py
"""
from pydantic import BaseModel

from agents import Agent, ModelSettings, OpenAIChatCompletionsModel, Runner, set_tracing_disabled

from llm import MODEL, async_client

set_tracing_disabled(True)


# TODO 1: 写一个继承 BaseModel 的类 Data，四个字段：
#         名字: str、性别: str、事迹: str、年龄: int
#         Write class Data(BaseModel) with the fields 名字, 性别, 事迹 (str) and 年龄 (int)


# TODO 2: 创建 Agent：
#         - instructions 里写明「用 JSON 回答，字段：名字、性别、事迹、年龄（整数）」
#         - output_type=Data
#         - DeepSeek 需要再加：model_settings=ModelSettings(extra_body={"response_format": {"type": "json_object"}})
#         Create the agent with output_type=Data plus the DeepSeek model_settings line
agent = None


def main():
    # TODO 3: Runner.run_sync(agent, "介绍一位值得记住的人")，把 final_output 存进 obj
    #         打印 obj，再分别打印 obj.名字、obj.性别、obj.事迹、obj.年龄
    #         Run it, store final_output in obj, print obj and each field

    # TODO 4: 逐项打印 result.to_input_list()，找一找：assistant 的回答是什么形式？
    #         Print result.to_input_list() item by item - in what form is the answer stored?
    pass


if __name__ == "__main__":
    main()
