"""第 22 节：直接放进工具箱的两个工具（视频里的 my_tool.py）。
Lesson 22: the two tools that go straight into the toolkit (the video's my_tool.py).

- read_image(image_path)：读一张本地图片，作为图片（DataBlock）交给模型，让它「亲眼」检查生成结果
  read a local image and hand it to the model as an image (DataBlock) so it can check the result itself
- VideoGenerate：继承 ToolBase 的工具类，用万相 wan2.7-r2v 根据首帧 / 参考图 + 提示词生成视频
  a ToolBase subclass that makes a video with Wan wan2.7-r2v from a first frame / reference images + a prompt
  没有 DASHSCOPE_API_KEY 时走演练模式：把这些图拼成一个 GIF（l22_dry_run.py）
  without DASHSCOPE_API_KEY it runs in dry-run mode and turns the images into a GIF (l22_dry_run.py)

被 l22_media_assistant_solution.py 导入，不需要单独运行。
Imported by l22_media_assistant_solution.py; no need to run it yourself.
运行环境 / Environment: .venv
"""
import asyncio
import base64
import os
from io import BytesIO
from pathlib import Path

import requests
from PIL import Image

from agentscope.message import Base64Source, DataBlock, TextBlock
from agentscope.permission import PermissionBehavior, PermissionDecision
from agentscope.tool import ToolBase, ToolChunk

from l22_dry_run import fake_video

API_KEY = os.environ.get("DASHSCOPE_API_KEY")


# ---------------------------------------------------------------- 图像读取工具 / image reader
def pil_image_to_base64source(image, media_type):
    """把 PIL 图片对象变成 AgentScope 的 Base64Source。 Turn a PIL image into an AgentScope Base64Source."""
    buffer = BytesIO()                                            # 内存里的「文件」/ an in-memory file
    image.save(buffer, format=media_type.split("/")[1].upper())  # 按格式存进缓冲区：JPEG / PNG
    data = base64.b64encode(buffer.getvalue()).decode("utf-8")   # 二进制 → base64 文字
    return Base64Source(data=data, media_type=media_type)


async def read_image(image_path: str) -> ToolChunk:
    """读取一张本地图片并直接查看它的内容。生成或修改图片后，用它检查画面是否符合要求。

    Args:
        image_path (str): 图片文件的绝对路径（.jpg 或 .png）。
    """
    suffix = Path(image_path).suffix.lower().lstrip(".")         # "jpg" / "png"
    if suffix == "jpg":
        suffix = "jpeg"                                          # 标准写法是 image/jpeg
    media_type = "image/" + suffix                               # 告诉框架这是什么数据
    image = Image.open(image_path).convert("RGB")
    source = pil_image_to_base64source(image, media_type)
    return ToolChunk(content=[DataBlock(source=source)])        # 用 ToolChunk 包好结果交回去


# ---------------------------------------------------------------- 视频生成工具 / video generator
class VideoGenerate(ToolBase):
    """用工具类定义的工具：名字、说明、参数格式写成类属性。 A tool defined as a class."""

    name = "video_generate"
    description = (
        "根据提示词和图片生成一段短视频并保存到本地。至少要提供一张图片：首帧图（first_frame）"
        "或参考图（reference_images）。生成很慢，可能要几分钟。"
    )
    input_schema = {
        "type": "object",
        "properties": {
            "prompt": {"type": "string", "description": "视频提示词，按分镜写清楚画面、动作和镜头。"},
            "save_path": {"type": "string", "description": "视频保存的绝对路径，以 .mp4 结尾。"},
            "first_frame": {"type": "string", "description": "首帧图片的本地绝对路径（可选）。"},
            "reference_images": {
                "type": "array",
                "items": {"type": "string"},
                "description": "参考图的本地绝对路径列表（人物、场景等，可选）。",
            },
            "duration": {"type": "integer", "description": "视频长度（秒），例如 5。"},
        },
        "required": ["prompt", "save_path"],
    }
    is_read_only = False              # 会花钱、会写文件，不是只读 / costs money and writes files
    is_concurrency_safe = False

    async def check_permissions(self, tool_input, context):
        # 视频里的做法：无条件同意 / as in the video: always allow
        return PermissionDecision(behavior=PermissionBehavior.ALLOW, message="课程练习：允许生成视频")

    async def call(self, prompt, save_path, first_frame=None, reference_images=None, duration=5):
        media = []                                               # 首帧 + 参考图 / first frame + references
        if first_frame:
            media.append({"type": "first_frame", "url": first_frame})
        for path in reference_images or []:
            if path:
                media.append({"type": "reference_image", "url": path})
        if not media:
            return ToolChunk(content=[TextBlock(text="至少需要一张首帧图或参考图，请先生成图片。")])

        duration = int(duration)                                 # 模型有时会传 "5" 这样的字符串
        max_wait = duration * 90                                 # 视频越长，最多等越久（秒）

        if not API_KEY:                                          # 没有百炼 key：演练模式
            message = fake_video(media, save_path)
        else:
            try:
                message = await asyncio.wait_for(
                    asyncio.to_thread(self._generate, prompt, save_path, media, duration),
                    timeout=max_wait,
                )
            except asyncio.TimeoutError:
                message = f"工具执行超时（超过 {max_wait} 秒）"
        return ToolChunk(content=[TextBlock(text=message)])

    def _generate(self, prompt, save_path, media, duration):
        """真正调用万相并下载视频（会卡住几分钟，所以放到线程里跑）。 Calls Wan and downloads the video."""
        from dashscope import VideoSynthesis

        rsp = VideoSynthesis.call(
            api_key=API_KEY,
            model="wan2.7-r2v",          # 参考图生视频（以百炼模型列表为准）/ reference-to-video
            prompt=prompt,
            media=media,
            resolution="720P",
            duration=duration,
            prompt_extend=True,          # 让云端先把提示词扩写优化一遍
            watermark=False,
        )
        try:
            response = requests.get(rsp.output.video_url, stream=True, timeout=120)
        except Exception as e:                                   # 失败时 video_url 可能是空的
            return f"视频生成失败：{e}；接口返回：{rsp.message}"
        if response.status_code != 200:
            return f"视频保存失败（HTTP {response.status_code}）；接口返回：{rsp.message}"
        Path(save_path).parent.mkdir(parents=True, exist_ok=True)
        with open(save_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):   # 一块一块写进文件
                if chunk:
                    f.write(chunk)
        return f"视频已保存：{save_path}"
