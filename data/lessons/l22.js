COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l22",
  "priority": "important",
  "handwrite": true,
  "studyMinutes": 60,
  "source": "subtitle",
  "summary": {
    "zh": "把前面学的 MCP、工具、技能、工作空间串成一个小项目：能编辑图片、生成视频的 AgentScope 助手。图像生成被包装成 MCP 服务（调用通义万相 `wan2.7-image-pro`，可以带参考图修改图片）；视频生成是继承 `ToolBase` 的工具类（`wan2.7-r2v`，用首帧和参考图生成视频）；再加一个看图工具 `read_image`，让智能体检查自己生成的图；两个技能负责写图像 / 视频提示词和控制流程。没有百炼 key 也能跑通：演练模式用占位图和 GIF 代替生成结果，DeepSeek 照样负责写提示词和看图检查。",
    "en": "A small project tying together MCP, tools, skills and the workspace: an AgentScope assistant that edits images and makes videos. Image generation is wrapped as an MCP server (Tongyi Wanxiang `wan2.7-image-pro`, which can edit with reference images); video generation is a `ToolBase` tool class (`wan2.7-r2v`, video from a first frame and reference images); an image-reading tool, `read_image`, lets the agent check its own pictures; and two skills handle image / video prompts and the workflow. It also runs without a Bailian key: dry-run mode replaces the results with placeholder images and a GIF, while DeepSeek still writes the prompts and checks the images."
  },
  "goals": [
    {
      "zh": "说出这个助手的结构：一个 MCP 服务（生图）+ 两个工具箱工具（视频、看图）+ 两个技能，以及生图、生视频两条流程",
      "en": "Describe the assistant's structure: one MCP server (images) + two toolkit tools (video, image reading) + two skills, and the image and video workflows"
    },
    {
      "zh": "用 `FastMCP` 把一个收费的生成 API 包装成 MCP 工具：写清 docstring、检查参数、下载并保存结果",
      "en": "Wrap a paid generation API as an MCP tool with `FastMCP`: a clear docstring, argument checks, downloading and saving the result"
    },
    {
      "zh": "写一个返回图片的工具：`BytesIO` + base64 → `Base64Source` → `DataBlock` → `ToolChunk`",
      "en": "Write a tool that returns an image: `BytesIO` + base64 → `Base64Source` → `DataBlock` → `ToolChunk`"
    },
    {
      "zh": "继承 `ToolBase` 写工具类：类属性 `name` / `description` / `input_schema`，加上 `check_permissions` 和 `call`",
      "en": "Write a tool class by inheriting `ToolBase`: class attributes `name` / `description` / `input_schema`, plus `check_permissions` and `call`"
    },
    {
      "zh": "组装主程序：工作空间 + MCP + 自定义工具 + 技能，并让 DeepSeek 能看到工具返回的图片",
      "en": "Assemble the main program: workspace + MCP + custom tools + skills, and let DeepSeek see the images returned by tools"
    }
  ],
  "blocks": [
    {
      "t": "h",
      "zh": "一、项目目标和整体架构",
      "en": "1. The project and its architecture"
    },
    {
      "t": "p",
      "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=0) 这一集是一个小项目：结合前面的内容，做一个 **图像编辑与视频生成助手**。为了不做纯文字项目那么枯燥，老师选了一个有意思的方向：通过 API 调用专门生成图像和视频的模型，让它们和智能体协作。生图工具支持**用参考图编辑**，视频工具也支持**用图片做参考**，所以智能体可以反复修改一张图，再用满意的图生成符合要求的视频。\n\n[▶ 00:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=31) 系统要配三个工具和两个技能：\n\n| 组成 | 做什么 | 怎么交给智能体 | 本课文件 |\n|---|---|---|---|\n| 图像生成 | [▶ 01:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=61) 把外部的生图 API 包装成工具 | 为了用上 MCP，包装成 **MCP 服务** | `l22_mcp_server.py` |\n| 视频生成 | 把外部的生视频 API 包装成工具 | 直接放进**工具箱** | `l22_my_tool.py` |\n| 图像读取 | 让智能体「看到」生成的图，判断内容是否符合要求 | 直接放进**工具箱** | `l22_my_tool.py` |\n| 图像提示词技能 | 把需求写成详细、结构化的生图提示词 | 技能 | `data/l22_skills/image-prompt/` |\n| 视频提示词技能 | 写视频提示词，并控制「先做图、再做视频」的流程 | 技能 | `data/l22_skills/video-prompt/` |\n\n[▶ 01:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=94) 为什么要单独写一个看图工具？很多模型本身有视觉能力，能直接理解图片；但老师说 AgentScope 自带的工具只能读文字，所以要另外给它一个读图的工具。",
      "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=0) This episode is a small project that builds on everything so far: an **image editing and video generation assistant**. To avoid a dull text-only project, the instructor picks something fun: call models that specialise in images and video through APIs and let them work with the agent. The image tool supports **editing with reference images** and the video tool also **takes images as references**, so the agent can revise an image again and again and then turn the approved images into the video the user wants.\n\n[▶ 00:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=31) The system needs three tools and two skills:\n\n| Part | What it does | How the agent gets it | File in this lesson |\n|---|---|---|---|\n| Image generation | [▶ 01:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=61) wraps an external image API as a tool | as an **MCP server**, to put MCP to use | `l22_mcp_server.py` |\n| Video generation | wraps an external video API as a tool | straight into the **toolkit** | `l22_my_tool.py` |\n| Image reading | lets the agent “see” its images and judge whether they fit | straight into the **toolkit** | `l22_my_tool.py` |\n| Image prompt skill | turns a request into a detailed, structured image prompt | skill | `data/l22_skills/image-prompt/` |\n| Video prompt skill | writes the video prompt and controls the “images first, then video” flow | skill | `data/l22_skills/video-prompt/` |\n\n[▶ 01:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=94) Why a separate image-reading tool? Many models can see and understand images natively, but the instructor says AgentScope's built-in tools only read text, so the agent needs its own tool for reading pictures."
    },
    {
      "t": "p",
      "zh": "两条流程：\n\n**生图** [▶ 02:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=126)：用户提需求 → 智能体写图像提示词 → 调用工具生成 → 用户查看；不满意就直接说「把图里的某某改成某某」，因为工具能用参考图生成，智能体可以在原图基础上修改或重新生成 → 满意为止。\n\n**生视频** [▶ 02:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=157)：用户提需求 → 智能体写图像提示词，生成多张图，包括视频要用的**参考图**和**首帧图**（具体要哪些由 AI 自己决定）→ 智能体用看图工具审视这些图，不合格就重做 → [▶ 03:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=189) 图都合格后，写视频提示词，把这些图一起交给视频模型生成视频。",
      "en": "Two workflows:\n\n**Images** [▶ 02:06](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=126): the user makes a request → the agent writes an image prompt → calls the tool → the user looks; if it is not right, the user just says “change X in the picture to Y”, and because the tool can generate from reference images, the agent edits or regenerates → until the user is happy.\n\n**Video** [▶ 02:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=157): the user makes a request → the agent writes image prompts and generates several images, including **reference images** and a **first frame** for the video (the AI decides which) → it inspects them with the image-reading tool and redoes any that do not fit → [▶ 03:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=189) once all images pass, it writes the video prompt and hands the images to the video model."
    },
    {
      "t": "check",
      "q": {
        "zh": "在这个项目里，哪个工具是以 **MCP 服务** 的形式交给智能体的？",
        "en": "In this project, which tool reaches the agent as an **MCP server**?"
      },
      "options": [
        {
          "zh": "视频生成",
          "en": "Video generation"
        },
        {
          "zh": "图像读取",
          "en": "Image reading"
        },
        {
          "zh": "图像生成（和编辑）",
          "en": "Image generation (and editing)"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "生图工具包装成本地 MCP 服务；视频生成和图像读取直接放进工具箱。",
        "en": "The image tool is wrapped as a local MCP server; video generation and image reading go straight into the toolkit."
      }
    },
    {
      "t": "h",
      "zh": "二、生成模型：百炼的通义万相",
      "en": "2. The generation models: Tongyi Wanxiang on Bailian"
    },
    {
      "t": "p",
      "zh": "[▶ 03:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=189) 生图、生视频用的是阿里的**通义万相**（Wan）系列。百炼平台的 API key 在不同模型之间通用，所以视频里直接用原来的百炼 key 就能调用万相。[▶ 03:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=219) 万相属于通义大模型体系，专门负责「视觉生成」，面向影视和图片制作，旗下有图像生成、图像编辑、视频生成等多种模型。[▶ 04:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=251) 本课选了两个：\n- **参考图生图**：可以传入多张参考图，再写一段提示词，生成一张想要的图。视频里的模型是万相 2.7 的 image pro（代码里写 `wan2.7-image-pro`）\n- **参考图生视频**：用多张参考图、首帧图加提示词直接生成视频，模型是 `wan2.7-r2v`\n\n生图工具能做什么？[▶ 04:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=281) 比如生成了一张猫的图后，说「给小猫穿上金黄色的盔甲」，智能体就以原图为参考生成新图，完成修改；手上有一张猫、一张狗的图时，还能让它把猫和狗放进同一张图。",
      "en": "[▶ 03:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=189) Images and videos come from Alibaba's **Tongyi Wanxiang** (Wan) series. A Bailian API key works across Bailian's models, so the video simply reuses the existing Bailian key for Wan. [▶ 03:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=219) Wan is the visual generation family within the Tongyi model line-up, aimed at film and image production, with models for image generation, image editing and video generation. [▶ 04:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=251) This lesson uses two:\n- **Reference images → image**: pass several reference images plus a prompt to get one new image. The video's model is Wan 2.7 image pro (`wan2.7-image-pro` in code)\n- **Reference images → video**: several reference images, a first frame and a prompt produce a video directly; the model is `wan2.7-r2v`\n\nWhat can the image tool do? [▶ 04:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=281) After generating a cat, say “put golden armour on the kitten” and the agent generates a new image from the original as reference; with one picture of a cat and one of a dog, it can also put both animals into one image."
    },
    {
      "t": "warn",
      "zh": "**我们没有百炼 key。** 真正调用万相需要 `DASHSCOPE_API_KEY`，而且按张、按秒收费；模型名也会更新，以百炼控制台的模型列表为准（`wan2.7-image-pro`、`wan2.7-r2v` 是按视频写的，本机没有 key，没有实际调用过）。\n\n所以练习文件加了视频里没有的**演练模式**（`l22_dry_run.py`）：没有 key 时，生图工具画一张写着提示词的占位图（参考图会贴在右下角），视频工具把首帧和参考图拼成一个 GIF。其余部分都是真的：DeepSeek 写提示词、调工具，还能用 `read_image` 真正「看」到这些占位图（`deepseek-flash` 支持图片输入）。以后有了 key，设置环境变量就会自动切到真实模式，代码不用改。",
      "en": "**We have no Bailian key.** Real Wan calls need `DASHSCOPE_API_KEY` and are billed per image / per second; model names also change, so go by the model list in the Bailian console (`wan2.7-image-pro` and `wan2.7-r2v` follow the video; there is no key on this machine, so they were never actually called).\n\nSo the practice files add a **dry-run mode** that the video does not have (`l22_dry_run.py`): without a key the image tool draws a placeholder showing the prompt (reference images are pasted into the bottom-right corner), and the video tool turns the first frame and references into a GIF. Everything else is real: DeepSeek writes the prompts, calls the tools, and really “sees” the placeholders through `read_image` (`deepseek-flash` accepts image input). Once you have a key, setting the environment variable switches to real mode automatically – no code changes."
    },
    {
      "t": "h",
      "zh": "三、图像生成 MCP 服务",
      "en": "3. The image generation MCP server"
    },
    {
      "t": "p",
      "zh": "[▶ 05:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=312) 新建一个 py 文件（视频里叫 mcp_server，本课是 `l22_mcp_server.py`）。导入：`FastMCP`；`requests`（用来下载生成好的图）；PIL 的 `Image` 和 `io` 的 `BytesIO`；[▶ 05:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=345) 生图用的 `dashscope.aigc.image_generation` 里的 `ImageGeneration`，以及 `dashscope.api_entities.dashscope_response` 里的 `Message`（用来打包请求）。\n\n接着指定 API key，再创建 `FastMCP`——这里用的是**本地（stdio）MCP**，只要名字（20 节）。[▶ 06:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=377) 然后用实例的 `tool()` 装饰自定义的生图函数，关键步骤：\n1. **docstring 要尽量详细**：最上面写清楚它既能生成也能修改图片、可以带 0~9 张参考图；[▶ 06:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=408) 再分别说明提示词、保存路径、尺寸，以及参考图传的是**图片路径**而不是图片数据\n2. [▶ 07:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=441) **检查尺寸**：只给模型 5 种尺寸，不在其中就返回一句话告诉模型参数不合规——这样能避免奇怪的报错，减轻调试压力\n3. 为了省空间统一存 **JPG**：防止模型传 `.png`，把文件名里的 `.png` 换成 `.jpg`\n4. [▶ 07:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=472) **参考图列表**：遍历传进来的路径，不为空才加进 `d_list`；这样模型不传图时也不会报错\n5. [▶ 08:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=502) 用 `Message` 打包请求：角色 `user`，`content` 是「提示词列表 + `d_list`」两个列表相加\n6. [▶ 08:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=533) `ImageGeneration.call(...)`：模型名、API key、消息列表、`watermark=False`（不加 AI 水印）、`n=1`（生成 1 张）、`size`\n7. [▶ 09:26](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=566) 遍历结果，从 `message.content` 的第一项里取出 `image` 链接——万相生成完会把图放在云端的一个链接里，[▶ 09:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=598) 用 `requests.get` 下载；状态码是 200 才算成功\n8. 用 `BytesIO` 把下载到的内容变成「流对象」，[▶ 10:28](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=628) 再 `Image.open` 得到 PIL 图片，转成 RGB 三通道后保存，返回保存路径；下载失败就返回「图片下载失败」\n9. 文件最后 `mcp.run(transport=\"stdio\")`",
      "en": "[▶ 05:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=312) Create a new py file (mcp_server in the video, `l22_mcp_server.py` here). Imports: `FastMCP`; `requests` (to download the finished image); PIL's `Image` and `io`'s `BytesIO`; [▶ 05:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=345) `ImageGeneration` from `dashscope.aigc.image_generation` for generation, and `Message` from `dashscope.api_entities.dashscope_response` (to package the request).\n\nNext set the API key, then create the `FastMCP` – a **local (stdio) MCP** that needs only a name (lesson 20). [▶ 06:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=377) Then decorate the custom image function with the instance's `tool()`. Key steps:\n1. **A docstring as detailed as possible**: say up front that it can both generate and edit images, with 0–9 reference images; [▶ 06:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=408) then describe the prompt, the save path and the size, and that reference images are passed as **file paths**, not image data\n2. [▶ 07:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=441) **Check the size**: the model gets only 5 sizes; anything else returns a sentence telling the model the argument is invalid – this avoids strange errors and eases debugging\n3. Always save as **JPG** to save space: in case the model passes `.png`, replace `.png` with `.jpg` in the file name\n4. [▶ 07:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=472) **The reference list**: loop over the given paths and add only non-empty ones to `d_list`, so nothing breaks when the model sends no images\n5. [▶ 08:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=502) Package the request with `Message`: role `user`, `content` = the prompt list + `d_list`, two lists added together\n6. [▶ 08:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=533) `ImageGeneration.call(...)`: model name, API key, message list, `watermark=False` (no AI watermark), `n=1` (one image), `size`\n7. [▶ 09:26](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=566) Loop over the results and take the `image` link from the first item of `message.content` – when Wan finishes, it puts the image behind a cloud link – [▶ 09:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=598) and download it with `requests.get`; only status 200 means success\n8. Turn the downloaded content into a stream object with `BytesIO`, [▶ 10:28](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=628) open it with `Image.open` to get a PIL image, convert it to 3-channel RGB, save it and return the save path; if the download fails, return “Image download failed”\n9. End the file with `mcp.run(transport=\"stdio\")`"
    },
    {
      "t": "code",
      "file": "l22_mcp_server.py",
      "code": {
        "zh": "import os\nfrom io import BytesIO\nfrom pathlib import Path\n\nimport requests\nfrom mcp.server.fastmcp import FastMCP\nfrom PIL import Image\n\nfrom l22_dry_run import fake_image          # 没有百炼 key 时的占位图（视频里没有）\n\nAPI_KEY = os.environ.get(\"DASHSCOPE_API_KEY\")\nSIZES = [\"1024*1024\", \"1280*720\", \"720*1280\", \"1152*864\", \"864*1152\"]   # 只给模型这几种选择（示例值，以百炼文档为准）\n\nmcp = FastMCP(\"image_mcp\", log_level=\"WARNING\")      # 本地 MCP：只要名字\n\n\n@mcp.tool()\ndef generate_image(prompt: str, save_path: str, size: str = \"1024*1024\", reference_images: list[str] | None = None) -> str:\n    \"\"\"图像生成与图像修改工具。只传提示词时生成一张新图；同时传入 1~9 张参考图时，\n    以这些图为参考生成新图，可用来修改图片内容，或把几张图里的元素合成到一张图里。\n\n    Args:\n        prompt: 详细的画面描述；修改图片时写清楚要改哪里、改成什么。\n        save_path: 图片保存的绝对路径，必须以 .jpg 结尾。\n        size: 图片尺寸，只能是 1024*1024、1280*720、720*1280、1152*864、864*1152 之一。\n        reference_images: 参考图的本地绝对路径列表（0~9 张），传路径，不是图片数据。\n    \"\"\"\n    if size not in SIZES:                                       # 尺寸不合规就告诉模型，让它重来\n        return f\"尺寸 {size} 不合规，只能从 {SIZES}\"\n    save_path = save_path.replace(\".png\", \".jpg\")               # 统一存成 JPG，文件更小\n    Path(save_path).parent.mkdir(parents=True, exist_ok=True)\n\n    d_list = []                                                  # 参考图（空路径跳过）\n    for path in reference_images or []:\n        if path:\n            d_list.append({\"image\": path})\n\n    if not API_KEY:                                              # 演练模式\n        return fake_image(prompt, save_path, size, [item[\"image\"] for item in d_list])\n\n    from dashscope.aigc.image_generation import ImageGeneration\n    from dashscope.api_entities.dashscope_response import Message\n\n    message = Message(role=\"user\", content=[{\"text\": prompt}] + d_list)   # 提示词 + 参考图：两个列表相加\n    rsp = ImageGeneration.call(\n        model=\"wan2.7-image-pro\",       # 能带参考图的万相 2.7 图像模型\n        api_key=API_KEY,\n        messages=[message],\n        watermark=False,                # 不加「AI 生成」水印\n        n=1,                            # 生成 1 张\n        size=size,\n    )\n    if rsp.status_code != 200:\n        return f\"图片生成失败： {rsp.code} {rsp.message}\"\n\n    for choice in rsp.output.choices:                           # n=1，所以只循环一次\n        url = choice.message.content[0][\"image\"]                # 云端的临时链接\n        response = requests.get(url, timeout=60)                # 把图片下载下来\n        if response.status_code == 200:\n            image = Image.open(BytesIO(response.content))       # 内存里的字节 → PIL 图片\n            image.convert(\"RGB\").save(save_path)                # 转成三通道再存\n            return f\"图片已保存： {save_path}\"\n    return \"图片下载失败\"\n\n\nif __name__ == \"__main__\":\n    mcp.run(transport=\"stdio\")",
        "en": "import os\nfrom io import BytesIO\nfrom pathlib import Path\n\nimport requests\nfrom mcp.server.fastmcp import FastMCP\nfrom PIL import Image\n\nfrom l22_dry_run import fake_image          # placeholder images without a Bailian key (not in the video)\n\nAPI_KEY = os.environ.get(\"DASHSCOPE_API_KEY\")\nSIZES = [\"1024*1024\", \"1280*720\", \"720*1280\", \"1152*864\", \"864*1152\"]   # the only sizes the model may choose (example values; check the Bailian docs)\n\nmcp = FastMCP(\"image_mcp\", log_level=\"WARNING\")      # a local MCP only needs a name\n\n\n@mcp.tool()\ndef generate_image(prompt: str, save_path: str, size: str = \"1024*1024\", reference_images: list[str] | None = None) -> str:\n    \"\"\"Image generation and editing tool. With a prompt only it makes a new image; with 1-9\n    reference images it generates from them, to edit an image or combine elements of several images into one.\n\n    Args:\n        prompt: a detailed description of the picture; for edits say what to change and into what.\n        save_path: absolute path to save the image, must end in .jpg.\n        size: image size, only one of 1024*1024, 1280*720, 720*1280, 1152*864, 864*1152.\n        reference_images: list of local absolute paths of reference images (0-9) - paths, not image data.\n    \"\"\"\n    if size not in SIZES:                                       # a bad size is reported so the model retries\n        return f\"Size {size} is not allowed; choose one of {SIZES}\"\n    save_path = save_path.replace(\".png\", \".jpg\")               # always save as JPG, smaller files\n    Path(save_path).parent.mkdir(parents=True, exist_ok=True)\n\n    d_list = []                                                  # reference images (skip empty paths)\n    for path in reference_images or []:\n        if path:\n            d_list.append({\"image\": path})\n\n    if not API_KEY:                                              # dry-run mode\n        return fake_image(prompt, save_path, size, [item[\"image\"] for item in d_list])\n\n    from dashscope.aigc.image_generation import ImageGeneration\n    from dashscope.api_entities.dashscope_response import Message\n\n    message = Message(role=\"user\", content=[{\"text\": prompt}] + d_list)   # prompt + references: two lists added\n    rsp = ImageGeneration.call(\n        model=\"wan2.7-image-pro\",       # the Wan 2.7 image model that accepts references\n        api_key=API_KEY,\n        messages=[message],\n        watermark=False,                # no \"AI generated\" watermark\n        n=1,                            # one image\n        size=size,\n    )\n    if rsp.status_code != 200:\n        return f\"Image generation failed: {rsp.code} {rsp.message}\"\n\n    for choice in rsp.output.choices:                           # n=1, so this loops once\n        url = choice.message.content[0][\"image\"]                # a temporary cloud link\n        response = requests.get(url, timeout=60)                # download the image\n        if response.status_code == 200:\n            image = Image.open(BytesIO(response.content))       # bytes in memory -> a PIL image\n            image.convert(\"RGB\").save(save_path)                # convert to RGB, then save\n            return f\"Image saved: {save_path}\"\n    return \"Image download failed\"\n\n\nif __name__ == \"__main__\":\n    mcp.run(transport=\"stdio\")"
      }
    },
    {
      "t": "note",
      "zh": "和视频的两处不同：视频把参考图写成 `image1` 到 `image9` 九个参数，这里用一个列表参数 `reference_images`，循环的写法一样，代码更短；另外多了演练模式的分支和对 `rsp.status_code` 的检查（没有 key 或请求失败时，`rsp.output` 里没有图片）。",
      "en": "Two differences from the video: the video declares nine parameters, `image1` to `image9`; here one list parameter, `reference_images`, does the same with the same loop and shorter code. There is also the dry-run branch and a check of `rsp.status_code` (without a key, or when the request fails, `rsp.output` holds no image)."
    },
    {
      "t": "py",
      "title": {
        "zh": "BytesIO：放在内存里的「文件」",
        "en": "BytesIO: a “file” that lives in memory"
      },
      "zh": "老师在这一集里反复用到 `BytesIO`。它来自 Python 自带的 `io` 模块，是一个**放在内存里的二进制文件**：可以像文件一样 `write`、`read`，但不会真的在硬盘上建文件。\n\n两个典型用法：\n- **字节 → 文件对象**：`requests` 下载到的是一串字节（`response.content`），`Image.open` 却要一个「文件」。`Image.open(BytesIO(response.content))` 就把字节当成文件打开\n- **文件对象 → 字节**：`image.save(buffer, format=\"JPEG\")` 把图片「存」进内存里的缓冲区，再用 `buffer.getvalue()` 一次取出全部字节，接着用 base64 编码成文字（10 节），就能放进消息里交给模型\n\n下面用一段文字代替图片，演示「写进去 → 取出来 → base64 → 还原」：",
      "en": "The instructor uses `BytesIO` again and again in this episode. It comes from Python's built-in `io` module and is a **binary file kept in memory**: you can `write` and `read` it like a file, but nothing is created on disk.\n\nTwo typical uses:\n- **bytes → file object**: `requests` downloads a sequence of bytes (`response.content`), but `Image.open` wants a “file”. `Image.open(BytesIO(response.content))` opens the bytes as if they were a file\n- **file object → bytes**: `image.save(buffer, format=\"JPEG\")` “saves” the image into an in-memory buffer; `buffer.getvalue()` takes out all the bytes at once, and base64 turns them into text (lesson 10) that can travel in a message to the model\n\nBelow, a piece of text stands in for an image to show “write in → take out → base64 → restore”:",
      "code": {
        "zh": "import base64\nfrom io import BytesIO\n\nbuffer = BytesIO()                                   # 内存里的「文件」\nbuffer.write(\"你好，图片\".encode(\"utf-8\"))      # 像写文件一样写入字节\ndata = buffer.getvalue()                             # 取出全部字节\nprint(type(data).__name__, len(data))\n\ntext = base64.b64encode(data).decode(\"utf-8\")        # 字节 → base64 文字（10 节）\nprint(text)\nprint(base64.b64decode(text).decode(\"utf-8\"))        # 再还原回来\n\nreader = BytesIO(data)                               # 也能像打开的文件一样读\nprint(reader.read(3))                                # 读前 3 个字节",
        "en": "import base64\nfrom io import BytesIO\n\nbuffer = BytesIO()                                   # a \"file\" in memory\nbuffer.write(\"hello, image\".encode(\"utf-8\"))      # write bytes like into a file\ndata = buffer.getvalue()                             # take out all the bytes\nprint(type(data).__name__, len(data))\n\ntext = base64.b64encode(data).decode(\"utf-8\")        # bytes -> base64 text (lesson 10)\nprint(text)\nprint(base64.b64decode(text).decode(\"utf-8\"))        # and back again\n\nreader = BytesIO(data)                               # it can also be read like an open file\nprint(reader.read(3))                                # read the first 3 bytes"
      }
    },
    {
      "t": "h",
      "zh": "四、看图工具 read_image",
      "en": "4. The image reader: read_image"
    },
    {
      "t": "p",
      "zh": "[▶ 11:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=660) 为什么要给智能体看图工具？很多大模型已经自带**图像编码器**，能把上传的图片编码成一个个 token（或一段段连续的信息），直接输入到模型里。[▶ 11:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=691) 有了看图工具，智能体写好提示词、生成图片后，就能自己读这张图，决定要不要修改；也能按用户的意见找到图里对应的部分去改。否则它就是个「瞎子」，只知道文件名。[▶ 12:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=723) 视频工具**至少要一张图**做参考，这也是看图工具重要的原因：先生成参考图，看一看、改一改，满意了再做视频，视频质量会高很多。\n\n[▶ 12:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=755) 看图和视频两个工具写在 my_tool 文件里（本课是 `l22_my_tool.py`）。[▶ 13:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=785) 要导入 `agentscope.tool` 的 `ToolBase`（工具类的父类）和 `ToolChunk`（打包工具结果）；`agentscope.message` 的 `TextBlock`、`DataBlock`、`Base64Source`。[▶ 13:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=816) `DataBlock` 用来装文字以外的数据（图片、视频……），`Base64Source` 表示数据是 base64 编码的。另外还要从 `agentscope.permission` 导入 `PermissionDecision` 和 `PermissionBehavior`（18 节的权限类，视频工具要用），以及 `BytesIO`、PIL 的 `Image` 和 `asyncio`。\n\n[▶ 14:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=848) `read_image` 的步骤：取出文件后缀，如果是 `jpg` 就改成 `jpeg`；在前面拼上 `image/` 得到数据类型，[▶ 14:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=881) 因为 `DataBlock` 能装很多种数据，要用「类型/格式」标明；用 `Image.open` 打开图片并转成 RGB；[▶ 15:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=912) 调用 `pil_image_to_base64source` 把 PIL 图片变成 `Base64Source`——先建一个 `BytesIO`，把图片按指定格式存进去，[▶ 15:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=944) 用 `getvalue()` 取出二进制数据，base64 编码后 `decode(\"utf-8\")` 变成文字，[▶ 16:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=977) 再连同类型一起创建 `Base64Source`；最后把它放进 `DataBlock`，再用 `ToolChunk` 包好返回。",
      "en": "[▶ 11:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=660) Why give the agent an image reader? Many LLMs now have a built-in **image encoder** that turns an uploaded picture into tokens (or stretches of continuous information) fed straight into the model. [▶ 11:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=691) With an image-reading tool, after writing a prompt and generating a picture, the agent can look at it itself and decide whether to revise it; it can also find the part of the picture the user wants changed. Without it the agent is “blind” and only knows the file name. [▶ 12:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=723) The video tool needs **at least one image** as reference, which is another reason the reader matters: generate the references, look at them, revise them, and only make the video once you are happy – the video comes out much better.\n\n[▶ 12:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=755) The reader and the video tool live in the my_tool file (`l22_my_tool.py` here). [▶ 13:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=785) Import `ToolBase` (the parent class of tool classes) and `ToolChunk` (packages tool results) from `agentscope.tool`, and `TextBlock`, `DataBlock`, `Base64Source` from `agentscope.message`. [▶ 13:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=816) `DataBlock` carries data other than text (images, video…), and `Base64Source` says the data is base64-encoded. You also import `PermissionDecision` and `PermissionBehavior` from `agentscope.permission` (lesson 18's permission classes, needed by the video tool), plus `BytesIO`, PIL's `Image` and `asyncio`.\n\n[▶ 14:08](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=848) `read_image` step by step: take the file suffix, and if it is `jpg`, change it to `jpeg`; prefix `image/` to get the media type, [▶ 14:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=881) because a `DataBlock` can carry many kinds of data, it has to be labelled “type/format”; open the image with `Image.open` and convert it to RGB; [▶ 15:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=912) call `pil_image_to_base64source` to turn the PIL image into a `Base64Source` – create a `BytesIO`, save the image into it in the given format, [▶ 15:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=944) take the binary data with `getvalue()`, base64-encode it and `decode(\"utf-8\")` it into text, [▶ 16:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=977) then build the `Base64Source` together with the media type; finally put it in a `DataBlock` and return it wrapped in a `ToolChunk`."
    },
    {
      "t": "code",
      "file": {
        "zh": "l22_my_tool.py（看图部分）",
        "en": "l22_my_tool.py (image reader)"
      },
      "code": {
        "zh": "import base64\nfrom io import BytesIO\nfrom pathlib import Path\n\nfrom PIL import Image\n\nfrom agentscope.message import Base64Source, DataBlock\nfrom agentscope.tool import ToolChunk\n\n\ndef pil_image_to_base64source(image, media_type):\n    \"\"\"把 PIL 图片对象变成 AgentScope 的 Base64Source。\"\"\"\n    buffer = BytesIO()                                            # 内存里的「文件」\n    image.save(buffer, format=media_type.split(\"/\")[1].upper())  # 按格式存进缓冲区：JPEG / PNG\n    data = base64.b64encode(buffer.getvalue()).decode(\"utf-8\")   # 二进制 → base64 文字\n    return Base64Source(data=data, media_type=media_type)\n\n\nasync def read_image(image_path: str) -> ToolChunk:\n    \"\"\"读取一张本地图片并直接查看它的内容。生成或修改图片后，用它检查画面是否符合要求。\n\n    Args:\n        image_path (str): 图片文件的绝对路径（.jpg 或 .png）。\n    \"\"\"\n    suffix = Path(image_path).suffix.lower().lstrip(\".\")         # \"jpg\" / \"png\"\n    if suffix == \"jpg\":\n        suffix = \"jpeg\"                                          # 标准写法是 image/jpeg\n    media_type = \"image/\" + suffix                               # 告诉框架这是什么数据\n    image = Image.open(image_path).convert(\"RGB\")\n    source = pil_image_to_base64source(image, media_type)\n    return ToolChunk(content=[DataBlock(source=source)])        # 用 ToolChunk 包好结果交回去",
        "en": "import base64\nfrom io import BytesIO\nfrom pathlib import Path\n\nfrom PIL import Image\n\nfrom agentscope.message import Base64Source, DataBlock\nfrom agentscope.tool import ToolChunk\n\n\ndef pil_image_to_base64source(image, media_type):\n    \"\"\"Turn a PIL image into an AgentScope Base64Source.\"\"\"\n    buffer = BytesIO()                                            # an in-memory file\n    image.save(buffer, format=media_type.split(\"/\")[1].upper())  # save into the buffer as JPEG / PNG\n    data = base64.b64encode(buffer.getvalue()).decode(\"utf-8\")   # bytes -> base64 text\n    return Base64Source(data=data, media_type=media_type)\n\n\nasync def read_image(image_path: str) -> ToolChunk:\n    \"\"\"Read a local image and look at it. Use it after generating or editing an image to check the result.\n\n    Args:\n        image_path (str): absolute path of the image (.jpg or .png).\n    \"\"\"\n    suffix = Path(image_path).suffix.lower().lstrip(\".\")         # \"jpg\" / \"png\"\n    if suffix == \"jpg\":\n        suffix = \"jpeg\"                                          # the standard name is image/jpeg\n    media_type = \"image/\" + suffix                               # tells the framework what the data is\n    image = Image.open(image_path).convert(\"RGB\")\n    source = pil_image_to_base64source(image, media_type)\n    return ToolChunk(content=[DataBlock(source=source)])        # wrap the result in a ToolChunk"
      }
    },
    {
      "t": "warn",
      "zh": "**DeepSeek 默认看不到工具返回的图片。** AgentScope 的 `DeepSeekChatFormatter` 默认只发送文字（`input_types=[\"text/plain\"]`），工具返回的 `DataBlock` 图片会被跳过，日志里只有一条 `Unsupported media type ... skipped` 警告。要在创建模型时传一个声明了图片类型的格式化器：`DeepSeekChatFormatter(input_types=[\"text/plain\", \"image/jpeg\", \"image/png\"])`。实测这样设置后，`deepseek-flash` 能准确说出占位图上的颜色、文字和右下角的缩略图。\n\n另外，视频里说 AgentScope 自带工具只能读文字；在本机的 2.0.9 里，内置的 `Read` 工具其实也能读图片（同样要模型和格式化器支持图片）。我们照视频自己写 `read_image`，因为它正好示范了「工具怎样返回图片」。",
      "en": "**DeepSeek cannot see tool images by default.** AgentScope's `DeepSeekChatFormatter` sends text only by default (`input_types=[\"text/plain\"]`), so a `DataBlock` image returned by a tool is skipped, with nothing but an `Unsupported media type ... skipped` warning in the log. When creating the model, pass a formatter that declares image types: `DeepSeekChatFormatter(input_types=[\"text/plain\", \"image/jpeg\", \"image/png\"])`. In our test, with this setting `deepseek-flash` correctly described the colours, the text and the thumbnail in the bottom-right corner of the placeholder.\n\nAlso, the video says AgentScope's built-in tools only read text; in the installed 2.0.9 the built-in `Read` tool can actually read images too (again only if the model and formatter accept images). We still write our own `read_image` as in the video, because it shows exactly how a tool returns an image."
    },
    {
      "t": "h",
      "zh": "五、视频生成工具：继承 ToolBase 的 VideoGenerate",
      "en": "5. The video tool: VideoGenerate, a ToolBase subclass"
    },
    {
      "t": "p",
      "zh": "[▶ 16:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1013) 视频工具 `VideoGenerate` 继承工具基类 `ToolBase`（类和继承见 08 节）。工具的名字、说明和各参数的描述写成**类属性**（`name`、`description`、`input_schema`，参数格式和 05 节的 JSON Schema 一样）。[▶ 17:26](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1046) 用工具类定义工具时，必须写权限检查方法 `check_permissions`（18 节的权限系统），这里直接无条件返回「允许」。\n\n主逻辑写在 `call` 方法里：\n1. [▶ 17:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1078) 建一个 `media` 列表放参数：首帧路径不为空，就加一个字典，`type` 是首帧 `first_frame`，`url` 是图片路径；[▶ 18:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1110) 再遍历参考图，不为空就加入 `type` 为 `reference_image` 的字典\n2. `duration`（视频长度）先转成整数——模型有时会传 `\"5\"` 这样的字符串\n3. [▶ 19:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1141) 最长等待时间用动态的：视频越长等得越久，`duration * 90` 秒；用 `try` 管住请求，超时就报错，防止服务器出问题时工具一直卡住\n4. [▶ 19:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1171) `VideoSynthesis.call(...)`：API key、模型 `wan2.7-r2v`、提示词、`media`、分辨率固定 `720P`、`duration`；[▶ 20:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1205) `prompt_extend=True` 让云端先把提示词优化扩写一遍，`watermark` 控制右下角的 AI 水印\n5. 再用 `try` 处理请求失败（这时 `video_url` 是空的）；取出 `video_url`，用 `requests.get` 下载，[▶ 20:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1239) 状态码 200 才继续，用 `for` 循环一块一块写进文件\n6. [▶ 21:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1269) 返回成功信息；失败时返回失败原因和接口返回的信息；超时时返回「工具执行超时」。结果同样用 `ToolChunk` 打包",
      "en": "[▶ 16:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1013) The video tool, `VideoGenerate`, inherits the tool base class `ToolBase` (classes and inheritance: lesson 08). Its name, description and parameter descriptions are **class attributes** (`name`, `description`, `input_schema`; the parameter format is the JSON Schema from lesson 05). [▶ 17:26](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1046) A tool defined as a class must implement the permission check `check_permissions` (lesson 18's permission system); here it simply always returns “allow”.\n\nThe main logic is the `call` method:\n1. [▶ 17:58](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1078) Build a `media` list for the arguments: if the first-frame path is not empty, add a dict with `type` `first_frame` and `url` the image path; [▶ 18:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1110) then loop over the reference images and add the non-empty ones as dicts with `type` `reference_image`\n2. Convert `duration` (video length) to an integer first – the model sometimes sends a string like `\"5\"`\n3. [▶ 19:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1141) The maximum wait is dynamic: longer videos wait longer, `duration * 90` seconds; a `try` guards the request and raises on timeout, so the tool never hangs forever when the server has problems\n4. [▶ 19:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1171) `VideoSynthesis.call(...)`: API key, model `wan2.7-r2v`, prompt, `media`, a fixed `720P` resolution and `duration`; [▶ 20:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1205) `prompt_extend=True` lets the service first polish and expand the prompt, and `watermark` controls the AI watermark in the bottom-right corner\n5. Another `try` handles a failed request (then `video_url` is empty); take `video_url`, download it with `requests.get`, [▶ 20:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1239) continue only on status 200, and write it to the file chunk by chunk in a `for` loop\n6. [▶ 21:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1269) Return a success message; on failure, the reason plus the API's message; on timeout, “tool timed out”. The result is again packaged in a `ToolChunk`"
    },
    {
      "t": "code",
      "file": {
        "zh": "l22_my_tool.py（视频部分）",
        "en": "l22_my_tool.py (video tool)"
      },
      "code": {
        "zh": "class VideoGenerate(ToolBase):\n    name = \"video_generate\"\n    description = \"根据提示词和图片生成一段短视频并保存到本地。至少要提供一张图片：首帧图或参考图。\"\n    input_schema = {\n        \"type\": \"object\",\n        \"properties\": {\n            \"prompt\": {\"type\": \"string\", \"description\": \"视频提示词，按分镜写清楚画面、动作和镜头。\"},\n            \"save_path\": {\"type\": \"string\", \"description\": \"视频保存的绝对路径，以 .mp4 结尾。\"},\n            \"first_frame\": {\"type\": \"string\", \"description\": \"首帧图片的本地绝对路径（可选）。\"},\n            \"reference_images\": {\"type\": \"array\", \"items\": {\"type\": \"string\"}, \"description\": \"参考图路径列表（可选）。\"},\n            \"duration\": {\"type\": \"integer\", \"description\": \"视频长度（秒），例如 5。\"},\n        },\n        \"required\": [\"prompt\", \"save_path\"],\n    }\n    is_read_only = False              # 会花钱、会写文件，不是只读\n    is_concurrency_safe = False\n\n    async def check_permissions(self, tool_input, context):\n        # 视频里的做法：无条件同意\n        return PermissionDecision(behavior=PermissionBehavior.ALLOW, message=\"课程练习：允许生成视频\")\n\n    async def call(self, prompt, save_path, first_frame=None, reference_images=None, duration=5):\n        media = []\n        if first_frame:                                          # 首帧\n            media.append({\"type\": \"first_frame\", \"url\": first_frame})\n        for path in reference_images or []:                      # 参考图\n            if path:\n                media.append({\"type\": \"reference_image\", \"url\": path})\n        if not media:\n            return ToolChunk(content=[TextBlock(text=\"至少需要一张首帧图或参考图。\")])\n\n        duration = int(duration)                                 # 模型有时会传 \"5\" 这样的字符串\n        max_wait = duration * 90                                 # 视频越长，最多等越久（秒）\n        if not API_KEY:\n            message = fake_video(media, save_path)               # 演练模式：拼一个 GIF\n        else:\n            try:\n                message = await asyncio.wait_for(\n                    asyncio.to_thread(self._generate, prompt, save_path, media, duration),\n                    timeout=max_wait,\n                )\n            except asyncio.TimeoutError:\n                message = f\"工具执行超时（超过 {max_wait} 秒）\"\n        return ToolChunk(content=[TextBlock(text=message)])\n\n    def _generate(self, prompt, save_path, media, duration):\n        from dashscope import VideoSynthesis\n\n        rsp = VideoSynthesis.call(\n            api_key=API_KEY,\n            model=\"wan2.7-r2v\",          # 参考图生视频\n            prompt=prompt,\n            media=media,\n            resolution=\"720P\",\n            duration=duration,\n            prompt_extend=True,          # 让云端先把提示词扩写优化一遍\n            watermark=False,\n        )\n        try:\n            response = requests.get(rsp.output.video_url, stream=True, timeout=120)\n        except Exception as e:                                   # 失败时 video_url 可能是空的\n            return f\"视频生成失败： {e}; {rsp.message}\"\n        if response.status_code != 200:\n            return f\"视频保存失败： HTTP {response.status_code}; {rsp.message}\"\n        with open(save_path, \"wb\") as f:\n            for chunk in response.iter_content(chunk_size=8192):   # 一块一块写进文件\n                if chunk:\n                    f.write(chunk)\n        return f\"视频已保存： {save_path}\"",
        "en": "class VideoGenerate(ToolBase):\n    name = \"video_generate\"\n    description = \"Make a short video from a prompt and images and save it locally. At least one image is required: a first frame or a reference image.\"\n    input_schema = {\n        \"type\": \"object\",\n        \"properties\": {\n            \"prompt\": {\"type\": \"string\", \"description\": \"the video prompt, written shot by shot: picture, action and camera.\"},\n            \"save_path\": {\"type\": \"string\", \"description\": \"absolute path to save the video, ending in .mp4.\"},\n            \"first_frame\": {\"type\": \"string\", \"description\": \"local absolute path of the first-frame image (optional).\"},\n            \"reference_images\": {\"type\": \"array\", \"items\": {\"type\": \"string\"}, \"description\": \"list of reference image paths (optional).\"},\n            \"duration\": {\"type\": \"integer\", \"description\": \"video length in seconds, e.g. 5.\"},\n        },\n        \"required\": [\"prompt\", \"save_path\"],\n    }\n    is_read_only = False              # costs money and writes files: not read-only\n    is_concurrency_safe = False\n\n    async def check_permissions(self, tool_input, context):\n        # as in the video: always allow\n        return PermissionDecision(behavior=PermissionBehavior.ALLOW, message=\"course exercise: video generation allowed\")\n\n    async def call(self, prompt, save_path, first_frame=None, reference_images=None, duration=5):\n        media = []\n        if first_frame:                                          # first frame\n            media.append({\"type\": \"first_frame\", \"url\": first_frame})\n        for path in reference_images or []:                      # reference images\n            if path:\n                media.append({\"type\": \"reference_image\", \"url\": path})\n        if not media:\n            return ToolChunk(content=[TextBlock(text=\"At least one first frame or reference image is needed.\")])\n\n        duration = int(duration)                                 # the model sometimes sends \"5\" as a string\n        max_wait = duration * 90                                 # longer video, longer maximum wait (seconds)\n        if not API_KEY:\n            message = fake_video(media, save_path)               # dry-run mode: build a GIF\n        else:\n            try:\n                message = await asyncio.wait_for(\n                    asyncio.to_thread(self._generate, prompt, save_path, media, duration),\n                    timeout=max_wait,\n                )\n            except asyncio.TimeoutError:\n                message = f\"Tool timed out (over {max_wait} s)\"\n        return ToolChunk(content=[TextBlock(text=message)])\n\n    def _generate(self, prompt, save_path, media, duration):\n        from dashscope import VideoSynthesis\n\n        rsp = VideoSynthesis.call(\n            api_key=API_KEY,\n            model=\"wan2.7-r2v\",          # reference images to video\n            prompt=prompt,\n            media=media,\n            resolution=\"720P\",\n            duration=duration,\n            prompt_extend=True,          # let the service expand and polish the prompt first\n            watermark=False,\n        )\n        try:\n            response = requests.get(rsp.output.video_url, stream=True, timeout=120)\n        except Exception as e:                                   # video_url may be empty on failure\n            return f\"Video generation failed: {e}; {rsp.message}\"\n        if response.status_code != 200:\n            return f\"Saving the video failed: HTTP {response.status_code}; {rsp.message}\"\n        with open(save_path, \"wb\") as f:\n            for chunk in response.iter_content(chunk_size=8192):   # write it chunk by chunk\n                if chunk:\n                    f.write(chunk)\n        return f\"Video saved: {save_path}\""
      }
    },
    {
      "t": "note",
      "zh": "超时的写法：`VideoSynthesis.call` 是普通（同步）函数，会一直等到视频生成完，可能好几分钟。`asyncio.to_thread(...)` 把它放到另一个线程里跑，不卡住智能体；外面再套 `asyncio.wait_for(..., timeout=max_wait)`，超过时间就抛出 `asyncio.TimeoutError`，被 `except` 接住后返回「工具执行超时」。（`async` / `await` 见 09 节。）",
      "en": "How the timeout works: `VideoSynthesis.call` is an ordinary (blocking) function that waits until the video is done, possibly minutes. `asyncio.to_thread(...)` runs it in another thread so the agent is not frozen, and `asyncio.wait_for(..., timeout=max_wait)` around it raises `asyncio.TimeoutError` when time runs out, which the `except` turns into “tool timed out”. (`async` / `await`: lesson 09.)"
    },
    {
      "t": "check",
      "q": {
        "zh": "继承 `ToolBase` 写工具类时，下面哪一项**不是**本课 `VideoGenerate` 必须提供的？",
        "en": "When inheriting `ToolBase`, which of these is **not** something `VideoGenerate` must provide?"
      },
      "options": [
        {
          "zh": "类属性 `name`、`description`、`input_schema`",
          "en": "Class attributes `name`, `description`, `input_schema`"
        },
        {
          "zh": "`check_permissions` 方法",
          "en": "A `check_permissions` method"
        },
        {
          "zh": "一个 `@mcp.tool()` 装饰器",
          "en": "An `@mcp.tool()` decorator"
        },
        {
          "zh": "`call` 方法（工具的主逻辑）",
          "en": "A `call` method (the tool's main logic)"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "`@mcp.tool()` 是 MCP 服务端的写法；工具类直接放进工具箱，靠类属性描述自己，靠 `check_permissions` 决定权限，靠 `call` 干活。",
        "en": "`@mcp.tool()` belongs to MCP servers; a tool class goes straight into the toolkit, describes itself with class attributes, decides permission in `check_permissions`, and works in `call`."
      }
    },
    {
      "t": "h",
      "zh": "六、两个技能：图像提示词、视频提示词与流程",
      "en": "6. Two skills: image prompts, video prompts and the workflow"
    },
    {
      "t": "p",
      "zh": "[▶ 21:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1301) **图像提示词技能**要求智能体把图像的氛围、人物、场景、画面等信息细化、明确，让提示词结构化、详细化，生成的图片更好。[▶ 22:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1332) **视频提示词技能**要求把视频分段，分成一个个分镜（分镜 1、分镜 2……），每段用不同的参考图；为人物、环境生成不同的参考图；它还负责参考图和首帧的生成与修改——改到满意为止，才去生成视频。\n\n[▶ 22:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1365) 视频里图像技能的内容大致是：先确定任务目标；识别图像属于哪一类，不同类型用不同的描述和关键词，套用各自「该写什么、不该写什么」的规则；套用百炼官方的提示词公式，更适配万相模型；补全景别、视角、镜头、风格、光线等元素。[▶ 23:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1396) 核心是「类别优先」：先分类，再按类别写镜头语言；后面是操作步骤和公式各部分的写法。老师强调：**技能写得越详细，效果越好**。[▶ 23:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1435) 视频提示词技能也是同样的结构化写法。另外，老师设计这些技能时还给它们配了提示词模板、案例参考等资源文件。\n\n视频没有给出技能的全文，所以 `practice/data/l22_skills/` 里的两个技能是我们按同样思路写的精简版（英文写成，模型读英文说明很稳定）。下面是我们写的视频提示词技能全文（流程 + 提示词公式）：",
      "en": "[▶ 21:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1301) The **image prompt skill** makes the agent spell out the mood, characters, scene, composition and so on, so the prompt is structured and detailed and the images come out better. [▶ 22:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1332) The **video prompt skill** splits a video into segments, one per shot (shot 1, shot 2…), each using different reference images, with separate references for characters and environments; it also takes charge of generating and revising the references and the first frame – revising until they are satisfactory, and only then making the video.\n\n[▶ 22:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1365) Roughly, the image skill in the video says: first settle the task goal; identify which category the image belongs to – each category uses its own descriptions and keywords and follows its own “what to write, what not to write” rules; apply Bailian's official prompt formula, which suits the Wan models better; and fill in elements such as shot size, angle, lens, style and lighting. [▶ 23:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1396) Its core is “category first”: classify, then write the camera language for that category; after that come the steps and how to write each part of the formula. The instructor stresses that **the more detailed a skill, the better it works**. [▶ 23:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1435) The video prompt skill is written in the same structured way. When designing these skills, the instructor also gave them resource files such as prompt templates and reference examples.\n\nThe video does not show the skills in full, so the two skills in `practice/data/l22_skills/` are condensed versions we wrote along the same lines (written in English, since models follow English instructions reliably). Below is the full video prompt skill we wrote (workflow + prompt formula):"
    },
    {
      "t": "code",
      "file": "data/l22_skills/video-prompt/SKILL.md",
      "code": {
        "zh": "---\nname: video-prompt\ndescription: Plan a short video, prepare its reference images and first frame, and write the video prompt for the Wan reference-to-video model. Read it before every video request.\n---\n\n# Video prompt and workflow / 视频提示词与流程\n\nThe video tool needs at least one image, so always prepare images first.\n\n## Workflow\n\n1. Split the video into 1-3 shots (shot 1, shot 2, ...). For each shot note: what happens, camera movement, mood.\n2. List what must look consistent across shots: the main character(s) and the main scene.\n3. Generate reference images with the image tool (follow the image-prompt skill):\n   - one image per main character (clear, full body, plain background),\n   - one image of the main scene,\n   - one first-frame image that already shows the character inside the scene, matching shot 1.\n4. Check every image with `read_image`. Regenerate any image that does not fit, before making the video.\n5. Call `video_generate` with the first frame, the reference images, `duration` 5 and the video prompt.\n6. Tell the user where the images and the video were saved.\n\n## Video prompt formula\n\nFor each shot: subject + action + scene + camera movement (push in, pan, follow) + lighting + mood.\nWrite the shots in order, for example: \"Shot 1: ... Shot 2: ...\".\nKeep it under 150 words.",
        "en": "---\nname: video-prompt\ndescription: Plan a short video, prepare its reference images and first frame, and write the video prompt for the Wan reference-to-video model. Read it before every video request.\n---\n\n# Video prompt and workflow\n\nThe video tool needs at least one image, so always prepare images first.\n\n## Workflow\n\n1. Split the video into 1-3 shots (shot 1, shot 2, ...). For each shot note: what happens, camera movement, mood.\n2. List what must look consistent across shots: the main character(s) and the main scene.\n3. Generate reference images with the image tool (follow the image-prompt skill):\n   - one image per main character (clear, full body, plain background),\n   - one image of the main scene,\n   - one first-frame image that already shows the character inside the scene, matching shot 1.\n4. Check every image with `read_image`. Regenerate any image that does not fit, before making the video.\n5. Call `video_generate` with the first frame, the reference images, `duration` 5 and the video prompt.\n6. Tell the user where the images and the video were saved.\n\n## Video prompt formula\n\nFor each shot: subject + action + scene + camera movement (push in, pan, follow) + lighting + mood.\nWrite the shots in order, for example: \"Shot 1: ... Shot 2: ...\".\nKeep it under 150 words."
      },
      "lang": "markdown"
    },
    {
      "t": "h",
      "zh": "七、主程序：把所有零件组装起来",
      "en": "7. The main program: putting the parts together"
    },
    {
      "t": "p",
      "zh": "[▶ 23:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1435) 主文件（视频里是 main.py）先导入需要的库，再从 my_tool 模块导入 `read_image` 和 `VideoGenerate`。[▶ 24:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1470) 和 20 节一样：写 MCP 配置（Python 脚本 + `l22_mcp_server.py`）、建 MCP 客户端列表（`is_stateful=True`）、创建工作空间并传入 MCP 列表和位置，[▶ 25:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1501) 初始化。\n\n取工具：先从工作空间拿到它的默认工具（这里没有添加别的工具，所以只有默认的），再用一个列表装上自定义的视频工具和看图工具——看图工具是函数定义的，要用 `FunctionTool` 包一下。[▶ 25:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1533) 建工具箱、从工作空间拿 MCP 服务、加载工作空间 `skills` 下的所有技能，然后配置模型、创建智能体，进入和前面一样的流式输出循环。\n\n为了在 2.0.9 + DeepSeek 上跑通，这份代码比视频多了几处（注释里都标了）：\n- **把百炼 key 传给 MCP 子进程**：stdio 子进程默认**不继承**你的环境变量（mcp 库只传 PATH 等少数几个），所以要 `StdioMCPConfig(env=...)` 显式传进去\n- **能看图的格式化器**（见第四部分）\n- **权限**：生图 MCP 工具会花钱、会写文件，不能标成只读，用一条 18 节的允许规则放行它；`ACCEPT_EDITS` 让工作空间里的写文件自动放行\n- **演练模式提示**：没有 key 时，在系统提示词里告诉模型「占位图就当成功」，否则它看到占位图会认为不合格、停下来不做视频（实测确实如此）",
      "en": "[▶ 23:55](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1435) The main file (main.py in the video) imports what it needs, plus `read_image` and `VideoGenerate` from the my_tool module. [▶ 24:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1470) As in lesson 20: an MCP config (Python + `l22_mcp_server.py`), the MCP client list (`is_stateful=True`), and a workspace created with the MCP list and its location, [▶ 25:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1501) then initialised.\n\nTools: first the workspace's default tools (nothing else was added to it, so only the defaults), then a list with the custom video tool and image reader – the reader is a function, so it is wrapped in `FunctionTool`. [▶ 25:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1533) Build the toolkit, get the MCP servers from the workspace, load every skill under the workspace's `skills`, configure the model, create the agent, and run the same streaming loop as before.\n\nTo run on 2.0.9 with DeepSeek, this code adds a few things to the video's version (all marked in comments):\n- **Pass the Bailian key to the MCP subprocess**: a stdio subprocess does **not** inherit your environment variables by default (the mcp library passes only PATH and a few others), so `StdioMCPConfig(env=...)` must pass it explicitly\n- **An image-capable formatter** (see part 4)\n- **Permissions**: the image MCP tool costs money and writes files, so it must not be marked read-only; a lesson-18 allow rule permits it, and `ACCEPT_EDITS` allows file writes inside the workspace\n- **A dry-run hint**: without a key, the system prompt tells the model that placeholders count as success; otherwise it judges the placeholders unfit and stops before making the video (this really happened in our test)"
    },
    {
      "t": "code",
      "file": {
        "zh": "l22_media_assistant_solution.py（main）",
        "en": "l22_media_assistant_solution.py (main)"
      },
      "code": {
        "zh": "async def main():\n    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)\n\n    # 1. MCP 配置：Python 脚本 l22_mcp_server.py；百炼 key 通过 env 传给子进程\n    mcp_config = StdioMCPConfig(\n        command=sys.executable,\n        args=[str(HERE / \"l22_mcp_server.py\")],\n        env={\"DASHSCOPE_API_KEY\": DASHSCOPE_KEY} if DASHSCOPE_KEY else None,\n    )\n    mcp_clients = [MCPClient(name=\"image_mcp\", is_stateful=True, mcp_config=mcp_config)]\n\n    # 2. 工作空间：MCP 列表 + 两个技能\n    workspace = LocalWorkspace(workdir=str(WORKDIR), default_mcps=mcp_clients,\n                               skill_paths=[str(p) for p in SKILL_DIRS])\n    await workspace.initialize()\n    try:\n        # 3. 工具：工作空间的默认工具（去掉命令行）+ 我们的两个工具\n        tools = [t for t in await workspace.list_tools() if t.name not in (\"PowerShell\", \"Bash\")]\n        tools = tools + [VideoGenerate(), FunctionTool(read_image, is_read_only=True)]   # 函数要用 FunctionTool 包一下\n        toolkit = Toolkit(tools=tools, mcps=await workspace.list_mcps(),\n                          skills_or_loaders=await workspace.list_skills())\n\n        # 4. 模型：声明能接收图片，read_image 的图才会交给 DeepSeek\n        formatter = DeepSeekChatFormatter(input_types=[\"text/plain\", \"image/jpeg\", \"image/png\"])\n        model = DeepSeekChatModel(credential=DeepSeekCredential(api_key=API_KEY), model=MODEL,\n                                  stream=True, formatter=formatter)\n\n        # 5. 权限：MCP 生图工具用允许规则放行；工作空间里写文件也放行（18 节）\n        image_tool = \"mcp__image_mcp__generate_image\"\n        permission = PermissionContext(\n            mode=PermissionMode.ACCEPT_EDITS,\n            working_directories={str(WORKDIR): AdditionalWorkingDirectory(path=str(WORKDIR), source=\"session\")},\n            allow_rules={image_tool: [PermissionRule(tool_name=image_tool, rule_content=None,\n                                                     behavior=PermissionBehavior.ALLOW, source=\"me\")]},\n        )\n        agent = Agent(name=\"Artist\", system_prompt=SYSTEM_PROMPT, model=model, toolkit=toolkit,\n                      offloader=workspace, state=AgentState(permission_context=permission))\n\n        while True:                                    # 6. 循环 + 流式输出（和 20 节一样）\n            text = input(\"\\n你 / You: \").strip()\n            if not text:\n                continue\n            if text == \"/exit\":\n                break\n            print(\"Artist: \", end=\"\", flush=True)\n            async for event in agent.reply_stream(UserMsg(name=\"user\", content=text)):\n                if event.type == EventType.TEXT_BLOCK_DELTA:\n                    print(event.delta, end=\"\", flush=True)\n                elif event.type == EventType.TOOL_CALL_START:\n                    print(f\"\\n  [调用工具 / tool] {event.tool_call_name}\", flush=True)\n            print()\n    finally:\n        await workspace.close()",
        "en": "async def main():\n    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)\n\n    # 1. MCP config: the Python script l22_mcp_server.py; pass the Bailian key to the subprocess via env\n    mcp_config = StdioMCPConfig(\n        command=sys.executable,\n        args=[str(HERE / \"l22_mcp_server.py\")],\n        env={\"DASHSCOPE_API_KEY\": DASHSCOPE_KEY} if DASHSCOPE_KEY else None,\n    )\n    mcp_clients = [MCPClient(name=\"image_mcp\", is_stateful=True, mcp_config=mcp_config)]\n\n    # 2. workspace: the MCP list + two skills\n    workspace = LocalWorkspace(workdir=str(WORKDIR), default_mcps=mcp_clients,\n                               skill_paths=[str(p) for p in SKILL_DIRS])\n    await workspace.initialize()\n    try:\n        # 3. tools: the workspace's default tools (minus the shell) + our two tools\n        tools = [t for t in await workspace.list_tools() if t.name not in (\"PowerShell\", \"Bash\")]\n        tools = tools + [VideoGenerate(), FunctionTool(read_image, is_read_only=True)]   # a function must be wrapped in FunctionTool\n        toolkit = Toolkit(tools=tools, mcps=await workspace.list_mcps(),\n                          skills_or_loaders=await workspace.list_skills())\n\n        # 4. model: declare image input, or read_image's pictures never reach DeepSeek\n        formatter = DeepSeekChatFormatter(input_types=[\"text/plain\", \"image/jpeg\", \"image/png\"])\n        model = DeepSeekChatModel(credential=DeepSeekCredential(api_key=API_KEY), model=MODEL,\n                                  stream=True, formatter=formatter)\n\n        # 5. permissions: an allow rule for the MCP image tool; file writes in the workspace allowed too (lesson 18)\n        image_tool = \"mcp__image_mcp__generate_image\"\n        permission = PermissionContext(\n            mode=PermissionMode.ACCEPT_EDITS,\n            working_directories={str(WORKDIR): AdditionalWorkingDirectory(path=str(WORKDIR), source=\"session\")},\n            allow_rules={image_tool: [PermissionRule(tool_name=image_tool, rule_content=None,\n                                                     behavior=PermissionBehavior.ALLOW, source=\"me\")]},\n        )\n        agent = Agent(name=\"Artist\", system_prompt=SYSTEM_PROMPT, model=model, toolkit=toolkit,\n                      offloader=workspace, state=AgentState(permission_context=permission))\n\n        while True:                                    # 6. loop + streaming output (as in lesson 20)\n            text = input(\"\\nYou: \").strip()\n            if not text:\n                continue\n            if text == \"/exit\":\n                break\n            print(\"Artist: \", end=\"\", flush=True)\n            async for event in agent.reply_stream(UserMsg(name=\"user\", content=text)):\n                if event.type == EventType.TEXT_BLOCK_DELTA:\n                    print(event.delta, end=\"\", flush=True)\n                elif event.type == EventType.TOOL_CALL_START:\n                    print(f\"\\n  [tool] {event.tool_call_name}\", flush=True)\n            print()\n    finally:\n        await workspace.close()"
      }
    },
    {
      "t": "h",
      "zh": "八、运行效果",
      "en": "8. The result"
    },
    {
      "t": "video",
      "zh": "[▶ 26:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1563) 演示：启动主程序，先测试生图和编辑——让它画「骑士骑着马」，[▶ 26:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1606) 智能体调用工具生成了一位银甲骑士骑马的图；再要求它给骑士换一身行头：高礼帽配黑色绅士服，[▶ 27:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1642) 新图里骑士换了装；再把骑士手里的剑换成热狗棒，[▶ 27:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1673) 也成功替换了。接着测试视频：让它生成一段「戴高礼帽的猫在赛博城市里行走」的视频。[▶ 28:51](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1731) 回看过程：智能体先画了一张猫，又换个角度再画了一张，然后画了一张城市图，再用猫和城市合成一张新图作为**首帧**，最后生成了视频。[▶ 29:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1762) 老师还展示了其他几段生成的视频。",
      "en": "[▶ 26:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1563) Demo: the main program starts and image generation and editing are tested first – asked for “a knight riding a horse”, [▶ 26:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1606) the agent generates a knight in silver armour on a horse; asked to change the outfit to a top hat and a black gentleman's suit, [▶ 27:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1642) the new image shows the knight re-dressed; then the sword becomes a hot-dog stick, [▶ 27:53](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1673) which also works. Then the video: “a cat in a top hat walking through a cyber city”. [▶ 28:51](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1731) Looking back at the process: the agent first made a cat image, then the cat from another angle, then a city image, then combined cat and city into a new image used as the **first frame**, and finally generated the video. [▶ 29:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=23&t=1762) The instructor also shows a few other generated videos."
    },
    {
      "t": "code",
      "file": {
        "zh": "输出（DeepSeek 实际运行，演练模式，节选）",
        "en": "Output (a real DeepSeek run in dry-run mode, abridged; Chinese text translated)"
      },
      "code": {
        "zh": "演练模式\n\n你 / You: 生成一段视频：戴高礼帽的猫在赛博朋克城市里散步\nArtist: I'll start by reading the video-prompt skill ...\n  [调用工具 / tool] Skill\n  [调用工具 / tool] Skill\n  [调用工具 / tool] Write\n  [调用工具 / tool] mcp__image_mcp__generate_image\n  [调用工具 / tool] mcp__image_mcp__generate_image\n  [调用工具 / tool] read_image\n  [调用工具 / tool] read_image\nBoth are dry-run placeholders — treating them as generated successfully and moving on. Now the first frame ...\n  [调用工具 / tool] mcp__image_mcp__generate_image\n  [调用工具 / tool] read_image\nFirst frame ready. Now generating the video with two shots.\n  [调用工具 / tool] video_generate\n视频做好了（演练模式：生成的是占位动图，当作成功）。\n| 文件 | 内容 |\n| cat_tophat_reference.jpg | 角色参考图：戴高礼帽的燕尾服猫 |\n| cyberpunk_city_reference.jpg | 场景参考图：夜晚赛博朋克霓虹街道 |\n| cyberpunk_cat_first_frame.jpg | 首帧图：猫站在霓虹街道中央 |\n| cyberpunk_cat_walk.gif | 生成的视频（演练模式为占位动图） |",
        "en": "dry-run mode\n\nYou: Make a video: a cat in a top hat strolling through a cyberpunk city\nArtist: I'll start by reading the video-prompt skill ...\n  [tool] Skill\n  [tool] Skill\n  [tool] Write\n  [tool] mcp__image_mcp__generate_image\n  [tool] mcp__image_mcp__generate_image\n  [tool] read_image\n  [tool] read_image\nBoth are dry-run placeholders — treating them as generated successfully and moving on. Now the first frame ...\n  [tool] mcp__image_mcp__generate_image\n  [tool] read_image\nFirst frame ready. Now generating the video with two shots.\n  [tool] video_generate\nThe video is ready (dry-run mode: the result is a placeholder animation, treated as a success).\n| File | Content |\n| cat_tophat_reference.jpg | character reference: a cat in a tailcoat and top hat |\n| cyberpunk_city_reference.jpg | scene reference: a neon cyberpunk street at night |\n| cyberpunk_cat_first_frame.jpg | first frame: the cat standing in the middle of the neon street |\n| cyberpunk_cat_walk.gif | the generated video (a placeholder animation in dry-run mode) |"
      },
      "lang": "text",
      "note": {
        "zh": "和视频里的流程一样：先读技能 → 生成猫的参考图和城市参考图 → 用 `read_image` 检查 → 合成首帧 → 再检查 → 调用 `video_generate`。另一轮测试里，「画一张骑士骑马的图」→「把骑士的头盔换成黑色高礼帽」也按「读技能 → 生图 → 看图」走完，第二张图把第一张当参考图传了进去（占位图右下角能看到它的缩略图）。",
        "en": "Same flow as in the video: read the skills → generate a cat reference and a city reference → check them with `read_image` → combine them into a first frame → check again → call `video_generate`. In another test, “draw a knight riding a horse” → “replace the knight's helmet with a black top hat” also went “read skill → generate → look”, with the first image passed in as a reference for the second (its thumbnail shows in the bottom-right corner of the placeholder)."
      }
    },
    {
      "t": "tip",
      "zh": "有了百炼 key 以后：在系统环境变量里设置 `DASHSCOPE_API_KEY`，重新打开终端再运行，程序会打印「真实模式」，图片和视频就由万相真正生成了（注意费用）。如果报模型不存在，到百炼控制台的模型列表里核对 `wan2.7-image-pro`、`wan2.7-r2v` 的最新名字，改两个文件里的 `model=` 即可。",
      "en": "Once you have a Bailian key: set `DASHSCOPE_API_KEY` as a system environment variable, reopen the terminal and run again – the program prints “real mode” and Wan generates real images and videos (mind the cost). If a model is reported as missing, check the current names of `wan2.7-image-pro` and `wan2.7-r2v` in the Bailian console and change `model=` in the two files."
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "为什么要专门给智能体一个看图工具 `read_image`？",
        "en": "Why give the agent a dedicated `read_image` tool?"
      },
      "options": [
        {
          "zh": "为了把图片压缩得更小",
          "en": "To make images smaller"
        },
        {
          "zh": "让智能体能亲眼检查生成的图，不合格就修改，再用合格的图做视频",
          "en": "So the agent can inspect its images, revise bad ones, and use good ones for the video"
        },
        {
          "zh": "因为万相模型要求先读图",
          "en": "Because the Wan models require reading the image first"
        },
        {
          "zh": "为了把图片上传到百炼",
          "en": "To upload images to Bailian"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "生成的图只是一个文件，智能体看不到内容。`read_image` 把图片作为 `DataBlock` 交给有视觉能力的模型，它才能判断画得对不对。",
        "en": "A generated image is just a file the agent cannot see. `read_image` hands it to a vision-capable model as a `DataBlock`, so the agent can judge whether it is right."
      }
    },
    {
      "q": {
        "zh": "`read_image` 返回结果时，几样东西从里到外的包装顺序是？",
        "en": "In what order, inside to outside, does `read_image` wrap its result?"
      },
      "options": [
        {
          "zh": "`ToolChunk` → `DataBlock` → `Base64Source`",
          "en": "`ToolChunk` → `DataBlock` → `Base64Source`"
        },
        {
          "zh": "`DataBlock` → `ToolChunk` → `Base64Source`",
          "en": "`DataBlock` → `ToolChunk` → `Base64Source`"
        },
        {
          "zh": "`TextBlock` → `ToolChunk`",
          "en": "`TextBlock` → `ToolChunk`"
        },
        {
          "zh": "`Base64Source` → `DataBlock` → `ToolChunk`",
          "en": "`Base64Source` → `DataBlock` → `ToolChunk`"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "base64 文字和类型装进 `Base64Source`；它作为 `source` 放进 `DataBlock`；`DataBlock` 放进 `ToolChunk(content=[...])` 返回。",
        "en": "The base64 text and media type go into a `Base64Source`; that becomes the `source` of a `DataBlock`; the `DataBlock` goes into `ToolChunk(content=[...])`."
      }
    },
    {
      "q": {
        "zh": "用 `DeepSeekChatModel` 时，`read_image` 返回了图片，模型却说「看不到图片」。该怎么改？",
        "en": "With `DeepSeekChatModel`, `read_image` returns an image but the model says it cannot see it. What should you change?"
      },
      "options": [
        {
          "zh": "把图片改成 PNG",
          "en": "Convert the image to PNG"
        },
        {
          "zh": "把 `read_image` 标成非只读",
          "en": "Mark `read_image` as not read-only"
        },
        {
          "zh": "创建模型时传 `formatter=DeepSeekChatFormatter(input_types=[\"text/plain\", \"image/jpeg\", \"image/png\"])`",
          "en": "Pass `formatter=DeepSeekChatFormatter(input_types=[\"text/plain\", \"image/jpeg\", \"image/png\"])` when creating the model"
        },
        {
          "zh": "换一个更大的 `max_tokens`",
          "en": "Increase `max_tokens`"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "DeepSeek 格式化器默认只发文字，图片 `DataBlock` 会被跳过；声明图片类型后才会把图交给 `deepseek-flash`。",
        "en": "The DeepSeek formatter sends text only by default and skips image `DataBlock`s; declaring image types lets the image reach `deepseek-flash`."
      }
    },
    {
      "q": {
        "zh": "设置了 `DASHSCOPE_API_KEY`，生图 MCP 服务却一直在演练模式。最可能的原因是？",
        "en": "`DASHSCOPE_API_KEY` is set, yet the image MCP server stays in dry-run mode. Most likely cause?"
      },
      "options": [
        {
          "zh": "stdio 子进程默认不继承环境变量，需要 `StdioMCPConfig(env={\"DASHSCOPE_API_KEY\": ...})` 传进去",
          "en": "A stdio subprocess does not inherit environment variables by default; pass it with `StdioMCPConfig(env={\"DASHSCOPE_API_KEY\": ...})`"
        },
        {
          "zh": "MCP 服务只能用 HTTP 方式",
          "en": "MCP servers only work over HTTP"
        },
        {
          "zh": "`watermark` 设成了 `False`",
          "en": "`watermark` is `False`"
        },
        {
          "zh": "尺寸写成了 `1024*1024`",
          "en": "The size is `1024*1024`"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "mcp 库启动 stdio 服务时只传 PATH 等少数安全的环境变量，key 要通过 `env` 显式传入（本课的主程序就是这样做的）。",
        "en": "When the mcp library starts a stdio server it passes only PATH and a few other safe variables; the key must be passed explicitly through `env` (as this lesson's main program does)."
      }
    },
    {
      "q": {
        "zh": "`VideoGenerate.call` 里为什么要 `duration = int(duration)`？",
        "en": "Why does `VideoGenerate.call` do `duration = int(duration)`?"
      },
      "options": [
        {
          "zh": "为了让视频更清晰",
          "en": "To make the video sharper"
        },
        {
          "zh": "模型有时会把数字当字符串传进来（比如 `\"5\"`），后面 `duration * 90` 和接口都要整数",
          "en": "The model sometimes sends the number as a string (e.g. `\"5\"`), while `duration * 90` and the API need an integer"
        },
        {
          "zh": "因为 Python 不能把字符串传给函数",
          "en": "Because Python cannot pass strings to functions"
        },
        {
          "zh": "为了把秒换算成分钟",
          "en": "To convert seconds to minutes"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "`\"5\" * 90` 会得到一个 90 个 5 组成的字符串，不是 450。先转成整数，超时时间和接口参数才正确。",
        "en": "`\"5\" * 90` gives a string of ninety 5s, not 450. Converting first makes the timeout and the API argument correct."
      }
    },
    {
      "q": {
        "zh": "生图 MCP 工具（会花钱、会写文件）在 2.0.9 里怎样做到不用每次批准？",
        "en": "How does the image MCP tool (costly, writes files) avoid asking for approval every time in 2.0.9?"
      },
      "options": [
        {
          "zh": "在服务端标成 `readOnlyHint=True`",
          "en": "Mark it `readOnlyHint=True` on the server"
        },
        {
          "zh": "把 `is_stateful` 设成 `False`",
          "en": "Set `is_stateful` to `False`"
        },
        {
          "zh": "什么都不用做，MCP 工具默认放行",
          "en": "Nothing – MCP tools are allowed by default"
        },
        {
          "zh": "在 `PermissionContext(allow_rules=...)` 里为 `mcp__image_mcp__generate_image` 加一条允许规则",
          "en": "Add an allow rule for `mcp__image_mcp__generate_image` in `PermissionContext(allow_rules=...)`"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "只读标记要如实填写，这个工具不是只读的；用 18 节的允许规则单独放行它，既不用每次批准，也不会误放别的工具。",
        "en": "The read-only mark must be honest, and this tool is not read-only; a lesson-18 allow rule permits just this tool, so there is no approval each time and no other tool gets through by mistake."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "看图工具 read_image",
        "en": "The image reader read_image"
      },
      "code": "def pil_image_to_base64source(image, media_type):\n    buffer = [[BytesIO]]()\n    image.save(buffer, format=media_type.split(\"/\")[1].upper())\n    data = base64.[[b64encode]](buffer.[[getvalue]]()).decode(\"utf-8\")\n    return [[Base64Source]](data=data, media_type=media_type)\n\n\nasync def read_image(image_path: str) -> ToolChunk:\n    suffix = Path(image_path).suffix.lower().lstrip(\".\")\n    if suffix == \"jpg\":\n        suffix = \"[[jpeg]]\"\n    media_type = \"image/\" + suffix\n    image = Image.open(image_path).convert(\"RGB\")\n    source = pil_image_to_base64source(image, media_type)\n    return [[ToolChunk]](content=[ [[DataBlock]](source=source)])",
      "explain": {
        "zh": "`BytesIO` 做内存缓冲区，`getvalue()` 取字节，`b64encode` 编码；`jpg` 要写成 `jpeg`；最后 `ToolChunk(content=[DataBlock(source=...)])`。",
        "en": "`BytesIO` is the in-memory buffer, `getvalue()` takes the bytes, `b64encode` encodes them; `jpg` becomes `jpeg`; finally `ToolChunk(content=[DataBlock(source=...)])`."
      }
    },
    {
      "title": {
        "zh": "主程序里和 20 节不同的几行",
        "en": "The main-program lines that differ from lesson 20"
      },
      "code": "async def main():\n    mcp_config = StdioMCPConfig(command=sys.executable, args=[str(HERE / \"l22_mcp_server.py\")],\n                                [[env]]={\"DASHSCOPE_API_KEY\": DASHSCOPE_KEY} if DASHSCOPE_KEY else None)\n    ...\n    tools = [t for t in await workspace.list_tools() if t.name not in (\"PowerShell\", \"Bash\")]\n    tools = tools + [VideoGenerate(), [[FunctionTool]](read_image, is_read_only=True)]\n    formatter = [[DeepSeekChatFormatter]](input_types=[\"text/plain\", \"image/jpeg\", \"image/png\"])\n    model = DeepSeekChatModel(credential=DeepSeekCredential(api_key=API_KEY), model=MODEL, stream=True, [[formatter]]=formatter)",
      "explain": {
        "zh": "key 通过 `env` 传给 MCP 子进程；函数工具用 `FunctionTool` 包装；格式化器声明图片类型，并用 `formatter=` 交给模型。",
        "en": "The key reaches the MCP subprocess through `env`; the function tool is wrapped in `FunctionTool`; the formatter declares image types and is passed with `formatter=`."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：返回图片的工具 read_image",
        "en": "Write it: read_image, a tool that returns an image"
      },
      "task": {
        "zh": "在给好的 import 下面：\n1. 写 `pil_image_to_base64source(image, media_type)`：建一个 `BytesIO`，`image.save(缓冲区, format=...)`（格式取 `media_type` 斜杠后面那部分并转大写），用 `getvalue()` 取字节，base64 编码后 `decode(\"utf-8\")`，返回 `Base64Source(data=..., media_type=...)`\n2. 写 `async def read_image(image_path: str) -> ToolChunk`，带 docstring：取后缀（`jpg` 改成 `jpeg`），拼出 `\"image/\" + 后缀`，打开图片转 RGB，转成 `Base64Source`，放进 `DataBlock`，用 `ToolChunk(content=[...])` 返回\n\n可以复制到 `practice` 里，用 `asyncio.run(read_image(\"图片的绝对路径\"))` 试一下。",
        "en": "Below the given imports:\n1. write `pil_image_to_base64source(image, media_type)`: create a `BytesIO`, `image.save(buffer, format=...)` (the part of `media_type` after the slash, upper-cased), take the bytes with `getvalue()`, base64-encode and `decode(\"utf-8\")`, and return `Base64Source(data=..., media_type=...)`\n2. write `async def read_image(image_path: str) -> ToolChunk` with a docstring: get the suffix (`jpg` → `jpeg`), build `\"image/\" + suffix`, open the image as RGB, convert it to a `Base64Source`, put it in a `DataBlock`, and return it in `ToolChunk(content=[...])`\n\nTo try it, copy it into `practice` and run `asyncio.run(read_image(\"absolute path of an image\"))`."
      },
      "starter": {
        "zh": "import base64\nfrom io import BytesIO\nfrom pathlib import Path\n\nfrom PIL import Image\n\nfrom agentscope.message import Base64Source, DataBlock\nfrom agentscope.tool import ToolChunk\n\n# 1. 写函数 pil_image_to_base64source，参数是 PIL 图片和数据类型：\n#    建内存缓冲区 → 把图片按格式存进去（格式取类型斜杠后面那部分，转大写）\n#    → 取出全部字节 → base64 编码成文字 → 返回 Base64Source\n# 2. 写异步函数 read_image，参数是图片的路径，返回 ToolChunk，记得写 docstring：\n#    取后缀（jpg 改成 jpeg）→ 类型 = image/ 后面接上后缀 → 打开图片转 RGB\n#    → 转成 Base64Source → 放进 DataBlock → 用 ToolChunk 返回",
        "en": "import base64\nfrom io import BytesIO\nfrom pathlib import Path\n\nfrom PIL import Image\n\nfrom agentscope.message import Base64Source, DataBlock\nfrom agentscope.tool import ToolChunk\n\n# 1. write the function pil_image_to_base64source, taking a PIL image and a media type:\n#    make an in-memory buffer -> save the picture into it in the right format (the part after the slash, upper-cased)\n#    -> take all the bytes -> base64 text -> return a Base64Source\n# 2. write the async function read_image, taking the image's path and returning a ToolChunk, with a docstring:\n#    get the suffix (jpg -> jpeg) -> type = image/ followed by the suffix -> open the image as RGB\n#    -> Base64Source -> DataBlock -> return it in a ToolChunk"
      },
      "solution": {
        "zh": "import base64\nfrom io import BytesIO\nfrom pathlib import Path\n\nfrom PIL import Image\n\nfrom agentscope.message import Base64Source, DataBlock\nfrom agentscope.tool import ToolChunk\n\n\ndef pil_image_to_base64source(image, media_type):\n    buffer = BytesIO()\n    image.save(buffer, format=media_type.split(\"/\")[1].upper())\n    data = base64.b64encode(buffer.getvalue()).decode(\"utf-8\")\n    return Base64Source(data=data, media_type=media_type)\n\n\nasync def read_image(image_path: str) -> ToolChunk:\n    \"\"\"读取一张本地图片并查看它的内容，用来检查生成的图片。\n\n    Args:\n        image_path (str): 图片的绝对路径。\n    \"\"\"\n    suffix = Path(image_path).suffix.lower().lstrip(\".\")\n    if suffix == \"jpg\":\n        suffix = \"jpeg\"\n    media_type = \"image/\" + suffix\n    image = Image.open(image_path).convert(\"RGB\")\n    source = pil_image_to_base64source(image, media_type)\n    return ToolChunk(content=[DataBlock(source=source)])",
        "en": "import base64\nfrom io import BytesIO\nfrom pathlib import Path\n\nfrom PIL import Image\n\nfrom agentscope.message import Base64Source, DataBlock\nfrom agentscope.tool import ToolChunk\n\n\ndef pil_image_to_base64source(image, media_type):\n    buffer = BytesIO()\n    image.save(buffer, format=media_type.split(\"/\")[1].upper())\n    data = base64.b64encode(buffer.getvalue()).decode(\"utf-8\")\n    return Base64Source(data=data, media_type=media_type)\n\n\nasync def read_image(image_path: str) -> ToolChunk:\n    \"\"\"Read a local image and look at it, to check a generated image.\n\n    Args:\n        image_path (str): absolute path of the image.\n    \"\"\"\n    suffix = Path(image_path).suffix.lower().lstrip(\".\")\n    if suffix == \"jpg\":\n        suffix = \"jpeg\"\n    media_type = \"image/\" + suffix\n    image = Image.open(image_path).convert(\"RGB\")\n    source = pil_image_to_base64source(image, media_type)\n    return ToolChunk(content=[DataBlock(source=source)])"
      },
      "checks": [
        {
          "zh": "建了一个 `BytesIO()` 缓冲区",
          "en": "Creates a `BytesIO()` buffer",
          "re": "BytesIO\\(\\)"
        },
        {
          "zh": "`image.save(缓冲区, format=...)`",
          "en": "`image.save(buffer, format=...)`",
          "re": "\\.save\\(\\s*\\w+\\s*,\\s*format\\s*="
        },
        {
          "zh": "用 `base64.b64encode(....getvalue())` 编码",
          "en": "Encodes with `base64.b64encode(....getvalue())`",
          "re": "base64\\.b64encode\\(\\s*\\w+\\.getvalue\\(\\)\\s*\\)"
        },
        {
          "zh": "返回 `Base64Source(data=..., media_type=...)`",
          "en": "Returns `Base64Source(data=..., media_type=...)`",
          "re": "Base64Source\\(\\s*data\\s*=[\\s\\S]*?media_type\\s*="
        },
        {
          "zh": "定义了 `async def read_image(image_path...)`",
          "en": "Defines `async def read_image(image_path...)`",
          "re": "async\\s+def\\s+read_image\\s*\\(\\s*image_path"
        },
        {
          "zh": "把 `jpg` 改成 `jpeg`",
          "en": "Turns `jpg` into `jpeg`",
          "re": "[\\\"']jpeg[\\\"']"
        },
        {
          "zh": "拼出 `\"image/\" + ...` 的类型",
          "en": "Builds the type as `\"image/\" + ...`",
          "re": "[\\\"']image/[\\\"']\\s*\\+"
        },
        {
          "zh": "返回 `ToolChunk(content=[DataBlock(source=...)])`",
          "en": "Returns `ToolChunk(content=[DataBlock(source=...)])`",
          "re": "ToolChunk\\(\\s*content\\s*=\\s*\\[\\s*DataBlock\\(\\s*source\\s*="
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "没给 DeepSeek 模型传能接收图片的格式化器：`read_image` 返回的图被悄悄跳过，模型说看不到图。",
      "en": "No image-capable formatter for the DeepSeek model: `read_image`'s picture is silently dropped and the model says it sees nothing."
    },
    {
      "zh": "以为设置了环境变量，MCP 子进程就能读到 key：stdio 子进程默认不继承环境变量，要用 `StdioMCPConfig(env=...)` 传。",
      "en": "Assuming the MCP subprocess sees your environment variable: stdio subprocesses do not inherit it by default; pass it with `StdioMCPConfig(env=...)`."
    },
    {
      "zh": "类型写成 `image/jpg`：标准写法是 `image/jpeg`，所以后缀 `jpg` 要先改成 `jpeg`。",
      "en": "Writing the type as `image/jpg`: the standard is `image/jpeg`, so change the `jpg` suffix to `jpeg` first."
    },
    {
      "zh": "视频工具一张图都没给：参考图生视频至少要一张首帧图或参考图，先用生图工具做图。",
      "en": "Calling the video tool without any image: reference-to-video needs at least one first frame or reference image – make images first."
    },
    {
      "zh": "为了省事把会花钱的生图工具标成 `readOnlyHint=True`：权限系统会把它当成无害工具放行。应该用允许规则单独放行。",
      "en": "Marking the paid image tool `readOnlyHint=True` to skip approval: the permission system then treats it as harmless. Use an allow rule for it instead."
    },
    {
      "zh": "演练模式下智能体看到占位图就停下不做视频：在系统提示词里说明「占位图算成功」。",
      "en": "In dry-run mode the agent sees placeholders and refuses to continue to the video: tell it in the system prompt that placeholders count as success."
    },
    {
      "zh": "照抄视频里的模型名却报「模型不存在」：万相的模型名会更新，以百炼控制台为准。",
      "en": "Copying the video's model names and getting “model not found”: Wan model names change; check the Bailian console."
    }
  ],
  "recap": [
    {
      "zh": "项目结构：生图 = MCP 服务；生视频、看图 = 工具箱里的工具；图像 / 视频提示词 = 两个技能；全部通过工作空间交给智能体。",
      "en": "Structure: images = an MCP server; video and image reading = toolkit tools; image / video prompts = two skills; all handed over through the workspace."
    },
    {
      "zh": "生图 MCP 工具：详细 docstring → 检查尺寸 → 参考图列表 → `Message` + `ImageGeneration.call` → 下载 → `BytesIO` + PIL 保存。",
      "en": "The image MCP tool: detailed docstring → size check → reference list → `Message` + `ImageGeneration.call` → download → save via `BytesIO` + PIL."
    },
    {
      "zh": "返回图片的工具：`BytesIO` → base64 → `Base64Source` → `DataBlock` → `ToolChunk`；DeepSeek 还要声明图片 `input_types` 的格式化器。",
      "en": "A tool returning an image: `BytesIO` → base64 → `Base64Source` → `DataBlock` → `ToolChunk`; DeepSeek also needs a formatter declaring image `input_types`."
    },
    {
      "zh": "工具类：继承 `ToolBase`，类属性 `name` / `description` / `input_schema`，`check_permissions` + `call`；慢的同步调用用 `asyncio.to_thread` + `wait_for` 控制超时。",
      "en": "Tool classes: inherit `ToolBase`, class attributes `name` / `description` / `input_schema`, `check_permissions` + `call`; run slow blocking calls with `asyncio.to_thread` + `wait_for` for a timeout."
    },
    {
      "zh": "视频流程：先做参考图和首帧 → 看图检查、修改 → 写分镜式视频提示词 → 生成视频。",
      "en": "Video workflow: make references and a first frame → inspect and revise → write a shot-by-shot video prompt → generate the video."
    }
  ],
  "files": [
    {
      "path": "practice/l22_mcp_server.py",
      "zh": "图像生成与编辑的 MCP 服务（视频里的 mcp_server.py），没有 key 时生成占位图。",
      "en": "The image generation & editing MCP server (the video's mcp_server.py); without a key it makes placeholder images."
    },
    {
      "path": "practice/l22_my_tool.py",
      "zh": "`read_image` 看图工具 + `VideoGenerate` 视频工具类（视频里的 my_tool.py）。",
      "en": "The `read_image` reader + the `VideoGenerate` tool class (the video's my_tool.py)."
    },
    {
      "path": "practice/l22_dry_run.py",
      "zh": "演练模式：没有百炼 key 时画占位图、拼 GIF（视频里没有）。",
      "en": "Dry-run mode: placeholder images and a GIF without a Bailian key (not in the video)."
    },
    {
      "path": "practice/data/l22_skills/image-prompt/SKILL.md",
      "zh": "图像提示词技能（精简版）。",
      "en": "The image prompt skill (condensed)."
    },
    {
      "path": "practice/data/l22_skills/video-prompt/SKILL.md",
      "zh": "视频提示词与流程技能（精简版）。",
      "en": "The video prompt & workflow skill (condensed)."
    },
    {
      "path": "practice/l22_media_assistant_todo.py",
      "zh": "练习：组装主程序（MCP + 工作空间 + 工具 + 能看图的模型，有 TODO 提示）。",
      "en": "Exercise: assemble the main program (MCP + workspace + tools + an image-capable model, with TODO hints)."
    },
    {
      "path": "practice/l22_media_assistant_solution.py",
      "zh": "参考答案：完整的助手（视频里的 main.py），已用 DeepSeek 在演练模式下实际运行。",
      "en": "Solution: the complete assistant (the video's main.py), tested with DeepSeek in dry-run mode."
    }
  ]
});
