# Agent 智能体课程 · 互动学习手册

配合 B 站《Agent 智能体开发全套教程》（BV1YG7G6eEPR，59 集）的本地互动学习网站，中英双语。

> **说明**：这是个人整理的非官方学习笔记，和课程作者没有关系。课程视频的版权归原作者所有，请到 B 站观看原课程：<https://www.bilibili.com/video/BV1YG7G6eEPR/>。本仓库不包含视频、字幕或课程的原始资料：讲义是用自己的话写的，练习代码按本机安装的框架版本重新编写。
>
> Unofficial study notes for a Bilibili course, not affiliated with its author. The videos belong to their author; watch the original course on Bilibili (link above). This repository contains no video, subtitles or original course materials.

## 怎么打开

双击 `index.html`，用 Chrome 或 Edge 打开即可，不需要服务器。

- 学习进度、答题记录、手写草稿保存在浏览器本地（localStorage）。换浏览器或清除网站数据后会丢失。
- 讲义里的 ▶ 运行按钮使用浏览器内的 Python（Pyodide，第一次运行需要联网下载）。调用模型的代码在浏览器里连接的是**模拟模型**。

## 目录结构

| 路径 | 内容 |
|---|---|
| `index.html` | 网站入口 |
| `assets/` | 网站代码：`app.js`（页面）、`pyrunner.js`（浏览器 Python）、`styles.css`、`py/`（浏览器里用的模拟模型） |
| `data/course.js` | 课程目录（由 `tools/build_course.py` 生成） |
| `data/lessons/lNN.js` | 每一节的讲义、测验、填空、手写练习 |
| `data/pages/` | 首页和「环境准备」页 |
| `practice/` | 本地练习文件，连接真实的 DeepSeek 模型 |
| `.venv/` | 主虚拟环境（Python 3.12），见 `requirements.txt` |
| `.venv-crewai/` | CrewAI 专用虚拟环境，见 `requirements-crewai.txt` |
| `tools/` | 生成和检查工具 |

## 运行练习

先创建两个虚拟环境（需要 Python 3.12，在项目文件夹里运行）：

```powershell
py -3.12 -m venv .venv
& .venv\Scripts\python.exe -m pip install -r requirements.txt
py -3.12 -m venv .venv-crewai
& .venv-crewai\Scripts\python.exe -m pip install -r requirements-crewai.txt
```

然后进入 `practice` 运行练习：

```powershell
cd practice
& ..\.venv\Scripts\python.exe l06_chat.py
# CrewAI（51–58 节）
& ..\.venv-crewai\Scripts\python.exe l51_xxx_solution.py
```

API key 从用户环境变量 `DEEPSEEK_API_KEY` 读取（见 `practice/llm.py`），代码里不写 key。设置方法：`setx DEEPSEEK_API_KEY "你的key"`，设置后重新打开终端或 VS Code。详细步骤见网站的「环境准备」页。

## 维护命令

在项目文件夹里运行（需要 Node.js；`python` 用任意 Python 3 即可）：

```powershell
node tools/validate.js --export build/code.json          # 检查讲义数据格式（每个字段都要有中英文）
python tools/check_code.py build/code.json               # 编译并在模拟模型上运行讲义代码（中英两版）
node tools/check_sources.js                              # 时间戳链接是否有效、讲义是否照抄了字幕
node tools/en_fields.js lint all                         # 中英文是否同步（链接、列表结构、行内代码、代码逻辑）
python tools/build_pyfiles.py                            # 修改 assets/py/*.py 后重新打包
```

改了某一节的中文以后，用 `node tools/en_fields.js dump lNN` 导出中英对照，把要更新的英文写成 `{"字段路径": "英文"}` 的 JSON，再用 `node tools/en_fields.js apply lNN <文件>.json` 写回。

## 关于内容

讲义按每集的 B 站 AI 字幕核对过（字幕只作参考，存在本地 `build/subtitles/`，讲义用自己的话写），代码按本机安装的框架版本核对过。与视频不一致的地方，讲义里都有说明。
