"""第 12 节补充演示：「监督」——写手 Agent 写，评审 Agent 打分并给修改意见，不通过就重写
Lesson 12 extra demo: "supervision" - a writer agent writes, a judge agent grades it and gives feedback,
and the writer rewrites until it passes

视频 02:06 只用一句话介绍了「监督」这种编排方式，没有写代码；这个文件是讲义补充的。
The video (02:06) only describes supervision in a sentence and shows no code; this file is an extra.
评审的结论用 pydantic 的 BaseModel 校验（讲义「Python 小课堂」）。
The judge's verdict is validated with a pydantic BaseModel (see the Python mini-lesson).

运行环境 / Environment: .venv  (openai-agents 0.20.0)
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l12_judge_demo.py
需要 / Needs: DEEPSEEK_API_KEY（每一版调用模型 2 次，最多 3 版 / 2 calls per draft, at most 3 drafts）
"""
import asyncio
import json

from agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled
from pydantic import BaseModel, Field, ValidationError

from llm import MODEL, async_client

set_tracing_disabled(True)
model = OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client)


class Verdict(BaseModel):
    """评审结论的格式 / the shape of the judge's verdict"""
    passed: bool                                                     # 通过没有 / did it pass
    feedback: str = Field(description="不通过时写一句具体的修改意见")   # 说明会写进 JSON Schema，模型能看到


writer = Agent(
    name="writer",
    instructions="为用户给的产品写一句不超过 20 个字的中文广告语。如果收到修改意见，就按意见重写。只输出广告语本身。",
    model=model,
)

# 只写 output_type 时 SDK 会请求 json_schema 格式，DeepSeek 不支持（第 11 节多加一行 model_settings 解决）。
# 这里换个办法：把格式写进 instructions，拿到回答后自己校验
# With output_type alone the SDK asks for the json_schema format, which DeepSeek rejects (lesson 11 adds a
# model_settings line). Here we do it by hand instead: the format goes into the instructions and we
# validate the reply ourselves
judge = Agent(
    name="judge",
    instructions=f"""你是严格的广告语评审。检查广告语是否同时做到：不超过 20 个字、点出了产品卖点、读起来顺口。
只输出一个 JSON 对象，不要用 markdown 代码块，也不要别的文字。JSON 的格式：
{json.dumps(Verdict.model_json_schema(), ensure_ascii=False)}
passed 为 true 表示通过；不通过时，在 feedback 里写一句具体的修改意见。""",
    model=model,
)


async def main(product="一款充一次电能用 30 天的智能手表"):
    task = f"产品：{product}"
    for i in range(1, 4):                                    # 最多改 3 版 / at most 3 drafts
        slogan = (await Runner.run(writer, task)).final_output.strip()
        raw = (await Runner.run(judge, f"产品：{product}\n广告语：{slogan}")).final_output
        raw = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```")   # 万一包了代码块
        try:
            verdict = Verdict.model_validate_json(raw)
        except ValidationError as e:
            print("评审的输出不符合格式 / bad verdict format:", e)
            print(raw)
            return
        print(f"第 {i} 版 / draft {i}: {slogan}")
        print(f"  通过 / passed: {verdict.passed}   意见 / feedback: {verdict.feedback}")
        if verdict.passed:
            return
        task = f"产品：{product}\n上一版：{slogan}\n修改意见：{verdict.feedback}"   # 带着意见重写
    print("改了 3 版还没通过，先用最后一版 / not passed after 3 drafts")


if __name__ == "__main__":
    asyncio.run(main())
