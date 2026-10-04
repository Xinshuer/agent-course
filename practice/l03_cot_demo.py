"""第 03 节演示：思维链（CoT）和推理模型的「思考过程」
Lesson 03 demo: Chain-of-Thought and a reasoning model's "thinking"

同一道题问两次：一次要求「只给最终金额」，一次要求「一步一步思考」。
如果模型带思考模式，回复里会多一个 reasoning_content 字段，里面是它回答之前的思考过程（模型自带的 CoT）。
Ask the same question twice: "just the final amount" vs "think step by step".
If the model has a thinking mode, the reply carries an extra reasoning_content field holding
what it thought before answering - a built-in chain of thought.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l03_cot_demo.py
需要 / Needs: DEEPSEEK_API_KEY（见「环境准备」页 / see the Setup page）。一次运行调用模型 2 次 / 2 model calls per run.

正确答案 / Correct answer: 200 x 0.8 = 160 元；160 < 180，券用不了，所以付 160 元。
    160 yuan: after 20% off it is 160, which is below 180, so the coupon can't be used.
"""
from llm import MODEL, client

QUESTION = "一件衣服原价 200 元，先打八折，再用一张「满 180 减 30」的优惠券，最后要付多少钱？"


def ask(prompt):
    """调用一次模型，返回整条消息（有 content，可能还有 reasoning_content）。
    Call the model once and return the whole message (content, maybe reasoning_content too)."""
    response = client.chat.completions.create(model=MODEL, messages=[{"role": "user", "content": prompt}])
    return response.choices[0].message


def show(title, message):
    print("=" * 60)
    print(title)
    thinking = getattr(message, "reasoning_content", None)    # 不是所有模型都有这个字段 / not every model has it
    if thinking:
        print(f"[思考过程 reasoning_content：共 {len(thinking)} 个字符，下面是前 300 个]")
        print(thinking[:300], "...")
    else:
        print("[没有 reasoning_content：这个模型这次没有单独返回思考过程 / no separate reasoning returned]")
    print("[回答 content]")
    print(message.content)


if __name__ == "__main__":
    show("① 只要答案 / answer only", ask(QUESTION + "只回答最终金额，不要解释。"))
    show("② 一步一步思考 / step by step", ask(QUESTION + "请一步一步思考，写出每一步，最后一行写「答案：」。"))
