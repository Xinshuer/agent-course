"""第 09 节：视频开头的第一个例子——导入设置文件，用 Runner.run_sync 跑通一个 Agent
Lesson 09: the video's first example - import the settings file and run an agent with Runner.run_sync

做了什么 / What it does:
    `import l09_settings` 让全局设置生效，然后创建一个不写 model 的 Agent（用默认模型名），
    同步运行一次，打印 result.final_output。把 import 那一行注释掉再运行，可以看到报错。
    `import l09_settings` applies the global settings; then an Agent without `model` (it uses the
    default model name) runs once synchronously and result.final_output is printed.
    Comment out the import line and run again to see the error.

运行环境 / Environment: .venv  (openai-agents 0.20.0)
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l09_first_run.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY / the DEEPSEEK_API_KEY environment variable
"""
from agents import Agent, Runner

import l09_settings  # noqa: F401  导入时设置文件里的代码就执行了 / importing runs the settings code

# 没写 model：使用设置文件里定下的默认模型名
# No model given: the default model name from the settings file is used
agent = Agent(name="助手", instructions="你是一个简洁的中文助手，回答不超过两句话。")


if __name__ == "__main__":
    result = Runner.run_sync(agent, "你是谁？")
    print(result.final_output)      # 不用再写 response.choices[0].message.content
