# practice：本地练习文件 / Local practice files

- `lNN_<主题>_todo.py`：练习版，按 TODO 提示补全代码。 / Exercise version: fill in the TODOs.
- `lNN_<主题>_solution.py`：参考答案。 / Reference solution.
- 其他 `lNN_*.py`：完整示例。 / Other `lNN_*.py`: complete demos.
- `llm.py`：公用模型配置（DeepSeek，key 来自环境变量 `DEEPSEEK_API_KEY`）。 / Shared model settings.
- `weather_tool.py`：查天气工具（Open-Meteo，不需要 key）。 / Weather tool (Open-Meteo, no key).
- `data/`：练习用的示例数据。 / Sample data.

运行 / Run (在这个文件夹里 / from this folder):

```powershell
& ..\.venv\Scripts\python.exe l06_chat.py
& ..\.venv-crewai\Scripts\python.exe l51_..._solution.py   # 第 51–58 节 / lessons 51–58
```

两个环境的创建方法见网站的「环境准备」页。 / See the site's Setup page for creating the two environments.

每个文件开头的说明里写了它需要哪个环境。 / Each file's header says which environment it needs.
