"""浏览器版 llm.py：用法和本地 practice/llm.py 完全一样，但连接的是模拟模型（不联网、不花钱）。

Browser version of llm.py: same names as practice/llm.py, but backed by the offline mock model.
"""
from mock_openai import AsyncOpenAI, OpenAI

BASE_URL = "mock://local"
MODEL = "deepseek-flash"
API_KEY = "mock-key"
client = OpenAI()
async_client = AsyncOpenAI()
