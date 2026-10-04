"""第 03 节练习参考答案：反思（Reflection）策略 —— 生成 → 批评 → 改进
Lesson 03 solution: the Reflection strategy - generate -> critique -> improve

三次模型调用串成一条链，后一次的提示词里带上前一次的结果。
Three model calls chained together; each prompt carries the previous result.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l03_reflection_solution.py
需要 / Needs: DEEPSEEK_API_KEY（见「环境准备」页 / see the Setup page）。一次运行调用模型 3 次 / 3 model calls per run.
"""
from llm import MODEL, client


def ask(prompt):
    """调用一次模型，返回文字回答。 Call the model once and return its text."""
    response = client.chat.completions.create(model=MODEL, messages=[{"role": "user", "content": prompt}])
    return response.choices[0].message.content


task = "为一家社区咖啡店写一句 20 字以内的招牌标语，只输出标语本身。"

if __name__ == "__main__":
    # 1. 生成：先写初稿 / generate a first draft
    draft = ask(task)

    # 2. 批评：换成审稿人的角色挑毛病 / critique it in the role of a strict reviewer
    critique = ask("你是严格的广告审稿人。指出下面这句标语的 2 个具体问题，不要改写：\n" + draft)

    # 3. 改进：把任务、初稿和意见一起交给模型 / improve: send the task, the draft and the critique together
    final = ask("任务：" + task + "\n初稿：" + draft + "\n审稿意见：" + critique + "\n请根据意见写出修改后的标语，只输出标语本身。")

    print("【初稿 / draft】\n" + draft)
    print("\n【审稿意见 / critique】\n" + critique)
    print("\n【终稿 / final】\n" + final)
