"""第 22 节：图像生成与编辑的 MCP 服务器（视频里的 mcp_server.py）。
Lesson 22: the image generation & editing MCP server (the video's mcp_server.py).

一个工具 generate_image：只写提示词 = 生成新图；再给 1~9 张参考图 = 按提示词修改 / 组合这些图。
真实模式调用阿里云百炼的万相模型 wan2.7-image-pro（需要 DASHSCOPE_API_KEY，按张收费）；
没有 key 时走演练模式（l22_dry_run.py），生成一张本地占位图。
One tool, generate_image: a prompt alone makes a new image; adding 1-9 reference images edits / combines them.
Real mode calls Bailian's Wan model wan2.7-image-pro (needs DASHSCOPE_API_KEY, billed per image);
without the key it runs in dry-run mode (l22_dry_run.py) and draws a local placeholder.

不用自己运行：l22_media_assistant_solution.py 会把它当作本地（stdio）MCP 服务启动。
You don't run this yourself: l22_media_assistant_solution.py starts it as a local (stdio) MCP server.
运行环境 / Environment: .venv
"""
import os
from io import BytesIO
from pathlib import Path

import requests
from mcp.server.fastmcp import FastMCP
from PIL import Image

from l22_dry_run import fake_image

API_KEY = os.environ.get("DASHSCOPE_API_KEY")       # 由主程序通过 StdioMCPConfig(env=...) 传进来
SIZES = ["1024*1024", "1280*720", "720*1280", "1152*864", "864*1152"]   # 只给模型这几种选择（示例值，以百炼文档为准）

mcp = FastMCP("image_mcp", log_level="WARNING")      # 本地 MCP：只要名字 / a local MCP only needs a name


@mcp.tool()
def generate_image(prompt: str, save_path: str, size: str = "1024*1024", reference_images: list[str] | None = None) -> str:
    """图像生成与图像修改工具。只传提示词时生成一张新图；同时传入 1~9 张参考图时，
    以这些图为参考生成新图，可用来修改图片内容，或把几张图里的元素合成到一张图里。

    Args:
        prompt: 详细的画面描述；修改图片时写清楚要改哪里、改成什么。
        save_path: 图片保存的绝对路径，必须以 .jpg 结尾。
        size: 图片尺寸，只能是 1024*1024、1280*720、720*1280、1152*864、864*1152 之一。
        reference_images: 参考图的本地绝对路径列表（0~9 张），传路径，不是图片数据。
    """
    if size not in SIZES:                                       # 尺寸不合规就告诉模型，让它重来
        return f"尺寸 {size} 不合规，只能从 {SIZES} 里选一个。"
    save_path = save_path.replace(".png", ".jpg")               # 统一存成 JPG，文件更小
    Path(save_path).parent.mkdir(parents=True, exist_ok=True)

    d_list = []                                                  # 参考图（空路径跳过）
    for path in reference_images or []:
        if path:
            d_list.append({"image": path})

    if not API_KEY:                                              # 没有百炼 key：演练模式
        return fake_image(prompt, save_path, size, [d["image"] for d in d_list])

    from dashscope.aigc.image_generation import ImageGeneration
    from dashscope.api_entities.dashscope_response import Message

    message = Message(role="user", content=[{"text": prompt}] + d_list)   # 提示词 + 参考图：两个列表相加
    rsp = ImageGeneration.call(
        model="wan2.7-image-pro",       # 可以带参考图的万相 2.7 图像模型（以百炼模型列表为准）
        api_key=API_KEY,
        messages=[message],
        watermark=False,                # 不加「AI 生成」水印
        n=1,                            # 生成 1 张
        size=size,
    )
    if rsp.status_code != 200:
        return f"图片生成失败：{rsp.code} {rsp.message}"

    for choice in rsp.output.choices:                           # n=1，所以只循环一次
        url = choice.message.content[0]["image"]                # 云端临时链接 / a temporary cloud link
        response = requests.get(url, timeout=60)                # 把图片下载下来
        if response.status_code == 200:
            image = Image.open(BytesIO(response.content))       # 内存里的字节 → PIL 图片
            image.convert("RGB").save(save_path)                # 转成三通道再存 JPG
            return f"图片已保存：{save_path}"
    return "图片下载失败"


if __name__ == "__main__":
    mcp.run(transport="stdio")
