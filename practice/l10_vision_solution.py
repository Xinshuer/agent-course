"""第 10 节练习参考答案：多模态 —— 把本地图片发给 Agent（和视频一样用一张 Hello World 截图）
Lesson 10 solution: multimodal input - send a local image to an agent (a "Hello World" screenshot, as in the video)

步骤 / Steps:
1. encode_image()：用 with open(..., "rb") 读出图片字节，base64 编码成字符串
   read the image bytes with open(..., "rb") and base64-encode them into a string
2. 拼成 data URL：f"data:image/png;base64,{b64}"
   build a data URL
3. 发两条用户消息：第一条放图片（input_image），第二条放问题
   send two user messages: the first holds the image (input_image), the second the question
4. 追问颜色：to_input_list() + append（第一部分学的方法），图片还在历史里
   ask about the colours with to_input_list() + append (part 1 of the lesson); the image stays in the history

运行环境 / Environment: .venv  (openai-agents 0.20.0)
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l10_vision_solution.py
需要 / Needs: DEEPSEEK_API_KEY（deepseek-flash 能看图，2026-10 实测 / accepts images, tested 2026-10）
图片 / Image: practice\\data\\l10_hello.png（深灰底、白字 Hello World / white text on dark grey）
    想换一张试试：把 IMAGE_PATH 改成 data/l10_shapes.png（红色圆形、蓝色正方形和一行英文）
    To try another picture, point IMAGE_PATH at data/l10_shapes.png (a red circle, a blue square, a line of text)
视频里老师用的是谷歌的模型（当时他说 DeepSeek 官方不支持传图片）；现在 deepseek-flash 已经可以。
The video uses a Google model (the teacher said DeepSeek did not accept images then); deepseek-flash does now.
"""
import base64
from pathlib import Path

from agents import Agent, OpenAIChatCompletionsModel, Runner, set_tracing_disabled

from llm import MODEL, async_client

set_tracing_disabled(True)

# 和本文件同一个文件夹下的 data/l10_hello.png，在哪个目录运行都找得到
# data/l10_hello.png next to this file - found whatever folder you run from
IMAGE_PATH = Path(__file__).parent / "data" / "l10_hello.png"

agent = Agent(
    name="看图助手",
    instructions="你是一个看图助手，用中文简洁地回答。",
    model=OpenAIChatCompletionsModel(model=MODEL, openai_client=async_client),
)


def encode_image(image_path):
    """读取图片文件，返回 base64 字符串。 Read an image file and return it as a base64 string."""
    with open(image_path, "rb") as image_file:            # "rb"：按二进制读取 / read raw bytes
        return base64.b64encode(image_file.read()).decode("utf-8")   # bytes -> base64 -> str


def main():
    base64_image = encode_image(IMAGE_PATH)
    print("base64 字符串的开头 / start of the base64 string:", base64_image[:60], "...")
    print("长度 / length:", len(base64_image))

    messages = [
        # 第一条：图片。content 是列表，里面是一个 input_image 部分 / message 1: the image
        {
            "role": "user",
            "content": [
                {"type": "input_image", "image_url": f"data:image/png;base64,{base64_image}"},
            ],
        },
        # 第二条：问题 / message 2: the question
        {"role": "user", "content": "图片中是什么内容？"},
    ]
    result = Runner.run_sync(agent, messages)
    print("AI:", result.final_output)

    # 追问颜色：不只是认字（OCR），还要理解颜色 / ask about colours - more than reading text
    history = result.to_input_list()
    history.append({"role": "user", "content": "文字和背景分别是什么颜色？"})
    result = Runner.run_sync(agent, history)
    print("AI:", result.final_output)


if __name__ == "__main__":
    main()
