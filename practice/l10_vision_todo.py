"""第 10 节练习：多模态 —— 把本地图片发给 Agent（TODO 版）
Lesson 10 exercise: multimodal input - send a local image to an agent (TODO version)

运行环境 / Environment: .venv  (openai-agents 0.20.0)
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l10_vision_todo.py
需要 / Needs: DEEPSEEK_API_KEY（deepseek-flash 能看图 / accepts images）
图片 / Image: practice\\data\\l10_hello.png（做完后可以换成 data/l10_shapes.png 再试 / then try data/l10_shapes.png）
参考答案 / Solution: l10_vision_solution.py
"""
import base64
from pathlib import Path

from agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled

from llm import MODEL, async_client

set_tracing_disabled(True)

IMAGE_PATH = Path(__file__).parent / "data" / "l10_hello.png"

agent = Agent(
    name="看图助手",
    instructions="你是一个看图助手，用中文简洁地回答。",
    model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),
)


def encode_image(image_path):
    """读取图片文件，返回 base64 字符串。 Read an image file and return it as a base64 string."""
    # TODO 1: with open(image_path, "rb") as image_file: 读出全部字节，
    #         用 base64.b64encode(...) 编码，再 .decode("utf-8") 变成字符串并返回
    #         Read the bytes in "rb" mode, base64.b64encode(...) them, .decode("utf-8") and return the str
    return ""


def main():
    base64_image = encode_image(IMAGE_PATH)
    # TODO 2: 打印 base64_image 的前 60 个字符，确认它是普通的字符串
    #         Print the first 60 characters of base64_image to see that it is an ordinary string

    # TODO 3: 组成 messages 列表，里面两条用户消息：
    #         第一条 content 是列表：[{"type": "input_image", "image_url": f"data:image/png;base64,{base64_image}"}]
    #         第二条 content 是问题：「图片中是什么内容？」
    #         Build messages with two user messages: the image (input_image + data URL) and the question
    messages = []

    # TODO 4: Runner.run_sync(agent, messages)，打印 final_output
    #         Run the agent with messages and print final_output

    # TODO 5: 用 to_input_list() + append 追问「文字和背景分别是什么颜色？」，打印回答
    #         Follow up with to_input_list() + append: ask about the text and background colours


if __name__ == "__main__":
    main()
