"""第 03 节练习：反思（Reflection）策略 —— 生成 → 批评 → 改进（TODO 版）
Lesson 03 exercise: the Reflection strategy - generate -> critique -> improve (TODO version)

ask(prompt) 已经写好：传进一段提示词，返回模型的文字回答。你只需要写 3 行，把三次调用串起来。
ask(prompt) is ready: pass in a prompt, get the model's text back. You only write 3 lines that chain three calls.

只需要会两件事 / You only need two things:
    名字 = ask("提示词")        把回答存进一个名字里 / store the answer under a name
    "文字" + draft              用 + 把几段文字接起来，"\n" 表示换行 / + joins text, "\n" is a line break
（变量和字符串 04 节正式讲 / variables and strings are covered properly in lesson 04）

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l03_reflection_todo.py
需要 / Needs: DEEPSEEK_API_KEY。参考答案 / Solution: l03_reflection_solution.py
"""
from llm import MODEL, client


def ask(prompt):
    """调用一次模型，返回文字回答（已经写好，直接用）。 Call the model once and return its text (ready to use)."""
    response = client.chat.completions.create(model=MODEL, messages=[{"role": "user", "content": prompt}])
    return response.choices[0].message.content


task = "为一家社区咖啡店写一句 20 字以内的招牌标语，只输出标语本身。"

if __name__ == "__main__":
    # TODO 1 生成：用 ask(task) 让模型写初稿，把结果存进 draft（替换掉右边的 ""）
    #        Generate: draft = ask(task)  (replace the "" on the right)
    draft = ""

    # TODO 2 批评：写一段提示词，让模型扮演「严格的广告审稿人」，指出 draft 的 2 个具体问题。
    #        提示词后面用 + 接上 draft，结果存进 critique。
    #        Critique: a prompt asking "a strict advertising reviewer" for 2 concrete problems,
    #        with + draft appended; store the result in critique.
    critique = ""

    # TODO 3 改进：把 task、draft、critique 都接进一段提示词，让模型写出修改后的标语，存进 final。
    #        Improve: join task, draft and critique into one prompt, ask for a revised slogan, store it in final.
    final = ""

    print("【初稿 / draft】\n" + draft)
    print("\n【审稿意见 / critique】\n" + critique)
    print("\n【终稿 / final】\n" + final)
