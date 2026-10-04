"""课程公用的模型配置：所有练习文件都从这里导入 client。

Shared model settings for every practice file.
The key is read from the DEEPSEEK_API_KEY environment variable, never written in code.
"""
import os

from openai import AsyncOpenAI, OpenAI

BASE_URL = "https://api.deepseek.com"
MODEL = "deepseek-flash"

API_KEY = os.environ.get("DEEPSEEK_API_KEY")
if not API_KEY:
    raise RuntimeError(
        "没找到环境变量 DEEPSEEK_API_KEY。刚设置完的话，要关掉所有 VS Code 窗口再重新打开才能生效。\n"
        "DEEPSEEK_API_KEY is not set. After setting it, close every VS Code window and reopen."
    )

client = OpenAI(api_key=API_KEY, base_url=BASE_URL)
async_client = AsyncOpenAI(api_key=API_KEY, base_url=BASE_URL)
