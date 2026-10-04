"""第 22 节：演练模式——没有百炼 key（DASHSCOPE_API_KEY）时，用本地生成的占位图 / 占位动图代替真正的生成结果。
Lesson 22: dry-run mode - without a Bailian key (DASHSCOPE_API_KEY), local placeholder images / GIFs stand in
for the real generation results.

视频里没有这部分：老师直接用百炼的 key 调用万相模型。这里加上它，是为了让没有 key 的同学也能把
「生成 → 看图 → 修改 → 做视频」整个流程跑通。不联网、不花钱。
This part is not in the video (the teacher calls the Wan models with his Bailian key). It lets learners
without that key run the whole "generate -> look -> edit -> make a video" flow. Offline and free.

被 l22_mcp_server.py 和 l22_my_tool.py 导入，不需要单独运行。
Imported by l22_mcp_server.py and l22_my_tool.py; no need to run it yourself.
运行环境 / Environment: .venv
"""
import hashlib
import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

FONT_DIR = Path(os.environ.get("SYSTEMROOT", r"C:\Windows")) / "Fonts"


def _font(size):
    """优先用微软雅黑 / 黑体（能显示中文），找不到就用 Pillow 自带字体。 Prefer a CJK font, else the default."""
    for name in ("msyh.ttc", "simhei.ttf"):
        try:
            return ImageFont.truetype(str(FONT_DIR / name), size)
        except OSError:
            continue
    return ImageFont.load_default(size=size)


def fake_image(prompt, save_path, size, reference_paths):
    """画一张占位图：底色由提示词决定，写上提示词，参考图缩小贴在右下角。
    Draw a placeholder: background colour from the prompt, the prompt as text, reference thumbnails bottom-right."""
    width, height = (int(n) for n in size.split("*"))
    scale = 768 / max(width, height)                     # 占位图不用太大 / keep placeholders small
    width, height = int(width * scale), int(height * scale)

    digest = hashlib.md5(prompt.encode("utf-8")).digest()
    background = (60 + digest[0] % 120, 60 + digest[1] % 120, 60 + digest[2] % 120)
    image = Image.new("RGB", (width, height), background)
    draw = ImageDraw.Draw(image)

    draw.text((24, 20), "演练占位图 / DRY-RUN placeholder", fill="white", font=_font(28))
    lines = [prompt[i:i + 24] for i in range(0, len(prompt), 24)][:12]   # 中文没有空格，按字数换行
    draw.multiline_text((24, 70), "\n".join(lines), fill="white", font=_font(24), spacing=8)

    x = width - 20
    for path in reference_paths[:3]:                     # 参考图贴在右下角 / reference thumbnails
        thumb = Image.open(path).convert("RGB")
        thumb.thumbnail((150, 150))
        x -= thumb.width + 10
        image.paste(thumb, (x, height - thumb.height - 20))

    Path(save_path).parent.mkdir(parents=True, exist_ok=True)
    image.save(save_path, "JPEG")
    return f"演练模式（没有 DASHSCOPE_API_KEY，没有真的调用万相）：占位图已保存到 {save_path}"


def fake_video(media, save_path):
    """把首帧和参考图拼成一个 GIF 动图，代替真正的视频。 Turn the first frame + references into a GIF."""
    frames = []
    for item in media:
        frame = Image.open(item["url"]).convert("RGB")
        frame.thumbnail((480, 480))
        frames.append(Image.new("RGB", (480, 480), "black"))
        frames[-1].paste(frame, ((480 - frame.width) // 2, (480 - frame.height) // 2))

    gif_path = str(Path(save_path).with_suffix(".gif"))
    Path(gif_path).parent.mkdir(parents=True, exist_ok=True)
    frames[0].save(gif_path, save_all=True, append_images=frames[1:], duration=800, loop=0)
    return f"演练模式（没有 DASHSCOPE_API_KEY，没有真的生成视频）：用 {len(frames)} 张图拼成的 GIF 已保存到 {gif_path}"
