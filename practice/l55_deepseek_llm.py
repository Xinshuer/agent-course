"""第 55 节辅助模块：让 CrewAI 的 output_json / output_pydantic 能配合 DeepSeek 使用
Lesson 55 helper: make CrewAI's output_json / output_pydantic work with DeepSeek

运行环境 / Environment: .venv-crewai
自检 / Self-test:  ..\\.venv-crewai\\Scripts\\python.exe l55_deepseek_llm.py
需要 / Needs: DEEPSEEK_API_KEY（只在真正调用模型时才用到 / only used when a model is called）

为什么需要它 / Why:
  CrewAI 1.15 给设置了 output_json / output_pydantic 的任务调用模型时，会把 Pydantic 模型
  作为 response_format={"type": "json_schema", ...} 发给 API。DeepSeek 目前只支持
  "text" 和 "json_object"，收到 json_schema 会直接返回 400：
  "This response_format type is unavailable now"（2026-10 实测）。
  When a task has output_json / output_pydantic, CrewAI 1.15 sends the Pydantic model to the API
  as response_format={"type": "json_schema", ...}. DeepSeek only accepts "text" and "json_object"
  and answers 400 "This response_format type is unavailable now" (tested 2026-10).

  DeepSeekLLM 只改一件事：调用 API 时不带 response_model。模型照常用文字回答，
  CrewAI 再自己把回答里的 JSON 解析、校验成你的 Pydantic 模型（Task 的 output_json /
  output_pydantic 写法完全不变）。
  DeepSeekLLM changes one thing: it never passes response_model to the API. The model answers
  in plain text and CrewAI parses and validates the JSON in that answer into your Pydantic model
  (you still write output_json / output_pydantic on the Task exactly as usual).

  视频（第 55 集）用的 OpenAI GPT-4o-mini 支持这种结构化输出，用普通的 LLM(...) 就行，不需要这个文件。
  The video (episode 55) uses OpenAI's GPT-4o-mini, which supports this structured output, so a plain
  LLM(...) is enough there.
"""
from crewai.llms.providers.openai.completion import OpenAICompletion

from llm import API_KEY, BASE_URL, MODEL


class DeepSeekLLM(OpenAICompletion):
    """和 LLM(model="openai/...", base_url=...) 一样，只是不把 response_model 发给 API。
    Same as LLM(model="openai/...", base_url=...), but never sends response_model to the API."""

    def call(self, *args, response_model=None, **kwargs):
        # 收下 response_model 参数，但不往下传 / accept response_model, but do not pass it on
        return super().call(*args, **kwargs)

    async def acall(self, *args, response_model=None, **kwargs):
        return await super().acall(*args, **kwargs)


# 练习文件直接 from l55_deepseek_llm import llm 即可
# Practice files simply do: from l55_deepseek_llm import llm
llm = DeepSeekLLM(model=MODEL, api_key=API_KEY, base_url=BASE_URL)


if __name__ == "__main__":
    print("模型 / model:", llm.model, "| base_url:", llm.base_url)
    print("类型 / type:", type(llm).__name__, "->", type(llm).__mro__[1].__name__)
