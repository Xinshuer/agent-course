"""第 09 节：视频里的「设置文件」写法——把 SDK 的全局配置放进一个可以 import 的文件
Lesson 09: the video's "settings file" style - put the SDK's global configuration in an importable file

做了什么 / What it does:
    把 OpenAI Agents SDK 默认的 OpenAI 设置改成 DeepSeek：
    1. 默认客户端换成 DeepSeek 的异步客户端；2. 改用 Chat Completions 接口；
    3. 关掉追踪上传；4. 设置 Agent 不写 model 时使用的默认模型名。
    别的文件只要 `import l09_settings`，这些设置就会生效（见 l09_first_run.py、l09_first_async.py、l09_events.py）。
    Switches the SDK's OpenAI defaults to DeepSeek:
    1. the default client becomes DeepSeek's async client; 2. use the Chat Completions API;
    3. turn off trace upload; 4. set the default model name used when an Agent has no `model`.
    Any other file just does `import l09_settings` and the settings take effect
    (see l09_first_run.py, l09_first_async.py and l09_events.py).

运行环境 / Environment: .venv  (openai-agents 0.20.0)
用法 / Usage: 一般不单独运行，而是被其他文件导入 / normally imported, not run on its own.
    单独运行只会打印一行确认 / running it alone only prints a confirmation:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l09_settings.py
需要 / Needs: 环境变量 DEEPSEEK_API_KEY / the DEEPSEEK_API_KEY environment variable
视频里老师在设置文件中直接新建客户端（地址和 key 从环境变量读取）；llm.py 做的是同一件事，所以这里直接导入。
这一集老师接的是谷歌的模型（运行结果自称「由谷歌训练」）；想换别的模型，改 llm.py 里的 BASE_URL / MODEL / key 即可。
In the video the client is created right in the settings file (address and key from environment variables);
llm.py does the same, so we import it. The video's model in this episode is a Google model (it says it was
"trained by Google"); to use another model, change BASE_URL / MODEL / the key in llm.py.
"""
import os

from agents import set_default_openai_api, set_default_openai_client, set_tracing_disabled

from llm import MODEL, async_client

# 1. 默认客户端：换成 DeepSeek 的异步客户端（AsyncOpenAI）
#    Default client: DeepSeek's async client (AsyncOpenAI)
set_default_openai_client(async_client, use_for_tracing=False)

# 2. 接口：SDK 默认走 OpenAI 新的 Responses 接口，DeepSeek 只支持 Chat Completions
#    API: the SDK defaults to OpenAI's newer Responses API; DeepSeek only supports Chat Completions
set_default_openai_api("chat_completions")

# 3. 追踪：默认上传到 OpenAI 后台，我们没有 OpenAI 的 key，关掉
#    Tracing: uploads to OpenAI's dashboard by default; we have no OpenAI key, so turn it off
set_tracing_disabled(True)

# 4. 默认模型名：Agent(...) 不写 model 时，SDK 读环境变量 OPENAI_DEFAULT_MODEL
#    Default model name: when Agent(...) has no model, the SDK reads OPENAI_DEFAULT_MODEL
os.environ["OPENAI_DEFAULT_MODEL"] = MODEL


if __name__ == "__main__":
    print("设置已生效 / settings applied:", os.environ["OPENAI_DEFAULT_MODEL"])
