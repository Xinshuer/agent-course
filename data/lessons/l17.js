COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l17",
  "priority": "important",
  "handwrite": true,
  "studyMinutes": 45,
  "source": "subtitle",
  "summary": {
    "zh": "用 RAG 给智能体注入它不知道的知识：为什么需要 RAG；建库（分块 → 向量化 → 存进向量数据库）和查询（问题向量化 → 按相似度找最近的几块）两条流程；跟着视频用开源的 Chroma 向量数据库建一个存在硬盘上的知识库，写出检索函数；最后把检索结果填进提示词模板，交给 15 节的流式智能体，回答一批虚构海怪的问题。",
    "en": "Using RAG to give an agent knowledge it doesn't have: why RAG is needed; the two flows, building (chunk → embed → store in a vector database) and querying (embed the question → find the closest chunks by similarity); following the video, a knowledge base saved on disk with the open-source Chroma vector database and a search function; and finally the search results filled into a prompt template for lesson 15's streaming agent, answering questions about a set of made-up sea monsters."
  },
  "goals": [
    {
      "zh": "说出 RAG 解决什么问题（私有资料、小众领域），以及「建库」和「查询」两条流程各有哪几步",
      "en": "Say what RAG solves (private material, niche fields) and the steps of the “build” and “query” flows"
    },
    {
      "zh": "理解分块、向量（embedding）和余弦相似度在 RAG 里各起什么作用",
      "en": "Understand what chunks, embeddings and cosine similarity each do in RAG"
    },
    {
      "zh": "用 chromadb 的 `PersistentClient`、`get_or_create_collection`、`add` / `upsert`、`query` 建库和检索",
      "en": "Build and search a knowledge base with chromadb's `PersistentClient`, `get_or_create_collection`, `add` / `upsert` and `query`"
    },
    {
      "zh": "用 AgentScope 的向量模型接口 `await embedding_model([...])` → `.embeddings` 算向量，知道视频的百炼向量模型和本课本地模型的区别",
      "en": "Compute vectors through AgentScope's embedding interface, `await embedding_model([...])` → `.embeddings`, and know how the video's Bailian model differs from this course's local one"
    },
    {
      "zh": "把检索结果和问题拼进提示词模板，交给智能体流式回答",
      "en": "Put the search results and the question into a prompt template and let the agent stream its answer"
    }
  ],
  "blocks": [
    {
      "t": "h",
      "zh": "一、为什么需要 RAG",
      "en": "1. Why RAG"
    },
    {
      "t": "p",
      "zh": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=0) 在企业和专业领域里，模型训练时见过的、上网能搜到的资料，往往撑不起真正的应用：企业内部有大量**私有**资料，一些小领域也缺少足够的公开资料供模型训练。这时就要给模型**注入知识**，用的方法就是 **RAG（Retrieval-Augmented Generation，检索增强生成）**：先从资料库里**检索**出和问题相关的内容，再交给模型**生成**回答。",
      "en": "[▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=0) In companies and specialist fields, what a model saw in training or can find online often isn't enough for a real application: companies hold lots of **private** material, and small fields lack enough public material to train on. So you **inject knowledge** into the model, and the method is **RAG (Retrieval-Augmented Generation)**: first **retrieve** content related to the question from a knowledge store, then let the model **generate** the answer from it."
    },
    {
      "t": "h",
      "zh": "二、RAG 的流程：建库和查询",
      "en": "2. The RAG flow: building and querying"
    },
    {
      "t": "p",
      "zh": "[▶ 00:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=32) 要检索，先得有一个数据库。**建库**（事先做一次）：\n\n1. **分块**：拿到资料文本后，先切成很多小块。一段文字太大，会影响检索效果，注入模型后也更费 token；\n2. **向量化**：把每一块丢进**编码模型（embedding 模型）**，变成一串富含语义的数字，叫**向量**；\n3. **存储**：把文字块和它的向量一起存进**向量数据库**。知识库就建好了。\n\n[▶ 01:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=65) **查询**（每次提问时做）：\n\n1. 用**同一个**编码模型把用户的问题也变成向量；\n2. 拿这个向量和数据库里的向量比**相似度**，找出语义最相近的几块；\n3. 把查到的内容交给智能体，它就能根据这些知识回答问题。",
      "en": "[▶ 00:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=32) To search, you first need a database. **Building** (done once in advance):\n\n1. **chunk**: split the source text into many small pieces – a passage that is too big hurts retrieval and costs more tokens once injected;\n2. **embed**: feed each chunk to an **encoding (embedding) model**, which turns it into a list of numbers full of meaning, a **vector**;\n3. **store**: save the chunks together with their vectors in a **vector database**. The knowledge base is ready.\n\n[▶ 01:05](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=65) **Querying** (on every question):\n\n1. turn the user's question into a vector with the **same** embedding model;\n2. compare it with the stored vectors by **similarity** to find the chunks closest in meaning;\n3. hand what you found to the agent, which answers from that knowledge."
    },
    {
      "t": "code",
      "file": {
        "zh": "补充：「相似度」是怎么算的",
        "en": "extra: how “similarity” is computed"
      },
      "run": true,
      "code": {
        "zh": "import math\n\ndef cosine(a, b):\n    \"\"\"余弦相似度：方向越接近，结果越接近 1\"\"\"\n    dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2]          # 对应位置相乘再相加\n    len_a = math.sqrt(a[0] ** 2 + a[1] ** 2 + a[2] ** 2)   # 向量的长度\n    len_b = math.sqrt(b[0] ** 2 + b[1] ** 2 + b[2] ** 2)\n    return dot / (len_a * len_b)\n\n# 假装编码模型把三句话变成了 3 个数（真实的向量有几百上千个数）\ncrab = [0.9, 0.1, 0.0]       # 「巨型钳蟹有一对巨大的钳子」\nsquid = [0.1, 0.9, 0.2]      # 「幻影乌贼会隐身」\nquestion = [0.8, 0.2, 0.1]   # 「哪种海怪的钳子很大？」\n\nprint(f\"问题 vs 钳蟹：{cosine(question, crab):.3f}\")\nprint(f\"问题 vs 乌贼：{cosine(question, squid):.3f}\")",
        "en": "import math\n\ndef cosine(a, b):\n    \"\"\"Cosine similarity: the closer the directions, the closer to 1\"\"\"\n    dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2]          # multiply position by position, add up\n    len_a = math.sqrt(a[0] ** 2 + a[1] ** 2 + a[2] ** 2)   # the length of each vector\n    len_b = math.sqrt(b[0] ** 2 + b[1] ** 2 + b[2] ** 2)\n    return dot / (len_a * len_b)\n\n# pretend the embedding model turned three sentences into 3 numbers (real vectors have hundreds)\ncrab = [0.9, 0.1, 0.0]       # \"the giant pincer crab has huge claws\"\nsquid = [0.1, 0.9, 0.2]      # \"the phantom squid can turn invisible\"\nquestion = [0.8, 0.2, 0.1]   # \"which sea monster has big claws?\"\n\nprint(f\"question vs crab:  {cosine(question, crab):.3f}\")\nprint(f\"question vs squid: {cosine(question, squid):.3f}\")"
      },
      "note": {
        "zh": "意思越接近的文字，向量的方向越接近，余弦相似度越接近 1。数据库做的就是这件事，只是向量更长、数量更多，而且用了更快的查找方法。",
        "en": "Texts with closer meanings point in closer directions, so their cosine similarity is closer to 1. The database does exactly this, just with longer vectors, many more of them, and a faster search method."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "为什么建库前要先把资料**分块**？",
        "en": "Why split the material into **chunks** before building?"
      },
      "options": [
        {
          "zh": "向量数据库只能存短句",
          "en": "Vector databases can only store short sentences"
        },
        {
          "zh": "一大段文字检索效果差，注入模型后也更费 token；切小后只取回相关的几块",
          "en": "A big passage retrieves poorly and costs more tokens once injected; small chunks let you fetch just the relevant ones"
        },
        {
          "zh": "不分块模型就不能回答",
          "en": "Without chunks the model can't answer"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "视频给的两个理由：检索效果和 token 消耗。块越聚焦一个主题，它的向量越能代表这个主题。",
        "en": "The video's two reasons: retrieval quality and token cost. The more a chunk sticks to one topic, the better its vector represents it."
      }
    },
    {
      "t": "h",
      "zh": "三、向量数据库 Chroma",
      "en": "3. The Chroma vector database"
    },
    {
      "t": "p",
      "zh": "[▶ 01:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=105) 讲 AgentScope 怎么用 RAG 之前，视频先介绍本节用的向量数据库 **Chroma**：由美国的同名公司开发，开源、免费，轻量、容易上手，很适合课程演示和个人使用。老师提到的特点：用起来极其简单，和常见工具生态集成得好，开发模式灵活。\n\n本课程的 `.venv` 里已经装了 `chromadb`（1.1.1），直接 `import chromadb` 即可。",
      "en": "[▶ 01:45](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=105) Before showing RAG in AgentScope, the video introduces this episode's vector database, **Chroma**: developed by the US company of the same name, open-source, free, lightweight and easy to pick up – a good fit for course demos and personal use. The instructor highlights that it is very simple to use, integrates well with the usual tools, and supports flexible ways of developing with it.\n\nThe course's `.venv` already has `chromadb` (1.1.1); just `import chromadb`."
    },
    {
      "t": "warn",
      "zh": "chromadb 有两个会往 **C 盘**写东西的地方，本课代码都处理好了，自己写的时候也要注意：\n- 即使关了遥测（`Settings(anonymized_telemetry=False)`），它也会在 `C:\\Users\\<你>\\.cache\\chroma` 写一个小的 id 文件。在创建客户端**之前**加一行 `ProductTelemetryClient.USER_ID_PATH = ...`，把它改到 `practice/output` 里；\n- 如果集合没有指定向量模型、写入时又忘了传向量，Chroma 会用自带的默认模型，第一次会下载到 `C:\\Users\\<你>\\.cache\\chroma\\onnx_models`。所以建集合时写 `embedding_function=None`：向量一律由我们自己算好再传进去。",
      "en": "chromadb writes to the **C: drive** in two ways; the course code handles both, and you should too:\n- even with telemetry off (`Settings(anonymized_telemetry=False)`), it writes a small id file under `C:\\Users\\<you>\\.cache\\chroma`. One line **before** creating the client, `ProductTelemetryClient.USER_ID_PATH = ...`, moves it into `practice/output`;\n- if a collection has no embedding model set and you forget to pass vectors, Chroma falls back to its built-in default model, downloaded on first use to `C:\\Users\\<you>\\.cache\\chroma\\onnx_models`. So create collections with `embedding_function=None`: we always compute the vectors ourselves and pass them in."
    },
    {
      "t": "h",
      "zh": "四、建库：分块 → 向量化 → 写入 Chroma",
      "en": "4. Building: chunk → embed → write to Chroma"
    },
    {
      "t": "p",
      "zh": "[▶ 02:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=135) 建库的代码先导入 `chromadb` 和异步库 `asyncio`——需要 `asyncio`，是因为视频调用的是阿里云的**线上** embedding 模型，有一个等待的过程。\n\n[▶ 02:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=160) 然后从 `agentscope.embedding` 导入百炼（DashScope）的文本向量模型类，创建时传入**模型名**和 **API key**。老师选它的原因：它可以和千问聊天模型**共用同一个百炼 key**，学习起来方便。不管哪种向量模型，用法都一样：`res = await embedding_model(文字列表)`，结果里的 `res.embeddings` 就是向量列表，每段文字一个。",
      "en": "[▶ 02:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=135) The build code first imports `chromadb` and the async library `asyncio` – `asyncio` because the video calls Alibaba Cloud's **online** embedding model, which involves waiting.\n\n[▶ 02:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=160) Next it imports Bailian's (DashScope's) text embedding class from `agentscope.embedding` and creates it with a **model name** and an **API key**. The instructor picked it because it **shares the same Bailian key** as the Qwen chat model, which keeps things simple. Whatever the embedding model, the call is the same: `res = await embedding_model(list_of_texts)`, and `res.embeddings` is the list of vectors, one per text."
    },
    {
      "t": "video",
      "zh": "视频的向量模型需要百炼 key，DeepSeek 又**没有**向量接口，所以本课换成在自己电脑上运行的向量模型，**调用方式完全一样**：\n\n| | 视频 | 本课 |\n|---|---|---|\n| 向量模型 | 百炼的 text-embedding 系列模型（字幕里具体型号听不清） | `BAAI/bge-small-zh-v1.5`，用 fastembed 在本机 CPU 上运行，第一次运行时下载到项目的 `.cache\\fastembed` |\n| 2.0.9 的写法 | `DashScopeEmbeddingModel(credential=DashScopeCredential(api_key=...), model=\"text-embedding-v4\", dimensions=1024)` | `LocalEmbedding()`（`practice/l17_local_embedding.py`） |\n| 每段文字的向量长度 | 看型号，比如 text-embedding-v4 可设为 1024 | 512 |\n| 调用 | `await embedding_model([...])` → `.embeddings` | 一样 |\n\n字幕里导入的类名听起来和 2.0.9 的不一样；2.0.9 里百炼向量模型的类叫 `DashScopeEmbeddingModel`，key 要放进凭证 `DashScopeCredential`（和 15 节的模型一样）。以后有了百炼 key，只换这一行，其余代码不用动。",
      "en": "The video's embedding model needs a Bailian key, and DeepSeek has **no** embeddings API, so this lesson swaps in an embedding model that runs on your own computer, **called in exactly the same way**:\n\n| | Video | This lesson |\n|---|---|---|\n| Embedding model | A model from Bailian's text-embedding series (the exact version can't be made out in the subtitles) | `BAAI/bge-small-zh-v1.5` run on your CPU with fastembed, downloaded to the project's `.cache\\fastembed` on first run |\n| In 2.0.9 | `DashScopeEmbeddingModel(credential=DashScopeCredential(api_key=...), model=\"text-embedding-v4\", dimensions=1024)` | `LocalEmbedding()` (`practice/l17_local_embedding.py`) |\n| Numbers per vector | Depends on the model, e.g. 1024 for text-embedding-v4 | 512 |\n| The call | `await embedding_model([...])` → `.embeddings` | The same |\n\nThe class name imported in the video sounds different from 2.0.9's; in 2.0.9 the Bailian embedding class is `DashScopeEmbeddingModel`, with the key inside a `DashScopeCredential` (like the model in lesson 15). Once you have a Bailian key, change just that one line."
    },
    {
      "t": "p",
      "zh": "[▶ 03:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=191) 建库函数 `create_db` 声明成协程（`async def`），步骤是：\n1. **读文字**：老师事先把资料写进了一个 txt 文件。为了方便演示，没用复杂的分块方法，**按行分块**；\n2. [▶ 03:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=221) **打开持久化的数据库**：`chromadb.PersistentClient(path=...)`，路径指向脚本旁边的一个文件夹。文件夹不存在会自动创建，已经存在就直接加载，不用担心数据被覆盖；\n3. **取得集合（collection）**：可以简单理解为数据库里的**一张表**，查询和添加数据都通过它，添加的数据会实时保存到前面的文件夹里。参数：名字随意起；`metadata={\"hnsw:space\": \"cosine\"}` 设定检索时比较相似度的方法，这里用**余弦相似度**；\n4. [▶ 04:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=270) **向量化**：`await` 调用向量模型，结果的 `.embeddings` 就是每块的向量；\n5. **写入**：给每块一个**唯一的 id**，然后 `collection.add(...)` 传入向量、分好块的文字列表和 id。",
      "en": "[▶ 03:11](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=191) The build function `create_db` is a coroutine (`async def`). Its steps:\n1. **read the text**: the instructor wrote his material into a txt file beforehand. To keep the demo simple he skips fancy chunking and **splits by line**;\n2. [▶ 03:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=221) **open a persistent database**: `chromadb.PersistentClient(path=...)`, pointing at a folder next to the script. A missing folder is created; an existing one is loaded, so there's no risk of wiping your data;\n3. **get a collection**: think of it as **a table** in the database. You query and add data through it, and added data is saved to that folder straight away. Parameters: any name you like, and `metadata={\"hnsw:space\": \"cosine\"}`, which sets how similarity is compared during search – **cosine similarity** here;\n4. [▶ 04:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=270) **embed**: `await` the embedding model; `.embeddings` in the result holds one vector per chunk;\n5. **write**: give every chunk a **unique id**, then `collection.add(...)` with the vectors, the list of chunk texts and the ids."
    },
    {
      "t": "code",
      "file": "practice/l17_chroma_basics.py · create_db",
      "code": {
        "zh": "import asyncio\nfrom pathlib import Path\n\nimport chromadb\nfrom chromadb.config import Settings\nfrom chromadb.telemetry.product import ProductTelemetryClient\n\nfrom l17_local_embedding import LocalEmbedding     # 视频：百炼的向量模型\n\nHERE = Path(__file__).parent\nDATA_FILE = HERE / \"data\" / \"l17_sea_monsters.txt\"\nDB_DIR = HERE / \"output\" / \"l17_chroma_db\"\nProductTelemetryClient.USER_ID_PATH = str(HERE / \"output\" / \"l17_chroma_telemetry_id\")   # 别写到 C 盘\n\nembedding_model = LocalEmbedding()\n\ndef open_collection():\n    client = chromadb.PersistentClient(path=str(DB_DIR), settings=Settings(anonymized_telemetry=False))\n    return client.get_or_create_collection(\n        name=\"sea_monsters\",                 # 集合名\n        metadata={\"hnsw:space\": \"cosine\"},   # 用余弦相似度比较\n        embedding_function=None,             # 向量自己算好再传进去\n    )\n\nasync def create_db():\n    text = DATA_FILE.read_text(encoding=\"utf-8\")\n    chunks = [line.strip() for line in text.splitlines() if line.strip()]   # 按行分块\n\n    collection = open_collection()\n    res = await embedding_model(chunks)                                      # 每块一个向量\n    ids = [f\"chunk_{i}\" for i in range(len(chunks))]                         # 每块一个唯一 id\n    collection.upsert(ids=ids, embeddings=res.embeddings, documents=chunks)  # 视频用 add",
        "en": "import asyncio\nfrom pathlib import Path\n\nimport chromadb\nfrom chromadb.config import Settings\nfrom chromadb.telemetry.product import ProductTelemetryClient\n\nfrom l17_local_embedding import LocalEmbedding     # video: Bailian's embedding model\n\nHERE = Path(__file__).parent\nDATA_FILE = HERE / \"data\" / \"l17_sea_monsters.txt\"\nDB_DIR = HERE / \"output\" / \"l17_chroma_db\"\nProductTelemetryClient.USER_ID_PATH = str(HERE / \"output\" / \"l17_chroma_telemetry_id\")   # keep it off C:\n\nembedding_model = LocalEmbedding()\n\ndef open_collection():\n    client = chromadb.PersistentClient(path=str(DB_DIR), settings=Settings(anonymized_telemetry=False))\n    return client.get_or_create_collection(\n        name=\"sea_monsters\",                 # the collection name\n        metadata={\"hnsw:space\": \"cosine\"},   # compare with cosine similarity\n        embedding_function=None,             # we compute the vectors ourselves\n    )\n\nasync def create_db():\n    text = DATA_FILE.read_text(encoding=\"utf-8\")\n    chunks = [line.strip() for line in text.splitlines() if line.strip()]   # one chunk per line\n\n    collection = open_collection()\n    res = await embedding_model(chunks)                                      # one vector per chunk\n    ids = [f\"chunk_{i}\" for i in range(len(chunks))]                         # a unique id per chunk\n    collection.upsert(ids=ids, embeddings=res.embeddings, documents=chunks)  # the video uses add"
      },
      "note": {
        "zh": "`DATA_FILE.read_text(...)` 一次读出整个文件（pathlib 见 10 节）；`splitlines()` 按行切开，列表推导式顺便去掉空行（06、07 节）。\n\n**`add` 和 `upsert`**：视频用 `add`。实测：用同样的 id 再 `add` 一次，Chroma 会**悄悄跳过**已有的 id，不报错也不更新——改了资料文件再运行，库里还是旧内容。`upsert` 则是「有就更新、没有就新增」，所以本课用它。另外，集合名只能用英文字母、数字和 `._-`（至少 3 个字符），写中文名会报 `InvalidArgumentError`。",
        "en": "`DATA_FILE.read_text(...)` reads the whole file at once (pathlib: lesson 10); `splitlines()` splits it into lines and the list comprehension drops empty ones (lessons 06, 07).\n\n**`add` vs `upsert`**: the video uses `add`. Tested: calling `add` again with the same ids makes Chroma **silently skip** the existing ids – no error, no update – so after editing the data file the database still holds the old text. `upsert` means “update if present, insert if not”, so this lesson uses it. Also, collection names may only use ASCII letters, digits and `._-` (at least 3 characters); a Chinese name raises `InvalidArgumentError`."
      }
    },
    {
      "t": "h",
      "zh": "五、查询：问题 → 向量 → 最相近的几块",
      "en": "5. Querying: question → vector → the closest chunks"
    },
    {
      "t": "p",
      "zh": "[▶ 05:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=315) 查询的代码同样先导入、初始化向量模型，再**重新加载**本地持久化的数据库，取得同一个集合（名字要和建库时一致）。然后定义查询函数（因为要调用云端向量模型，也声明成协程）：\n1. 把用户的问题向量化。老师特别提醒：虽然只有**一个**问题，传给向量模型的也要是**字符串列表** `[question]`；结果里取 `embeddings[0]`——列表里只有一个，第 0 个就是它；\n2. 调用集合的查询方法 `collection.query(...)`，传入问题向量，并指定要查几条（`n_results`）；\n3. [▶ 06:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=376) 返回的是一个**字典**，取它的 `\"documents\"`，再取列表的第 0 项，就是查到的那几条文字；\n4. 把这几条拼成一个字符串，方便放进给模型的提示词里。",
      "en": "[▶ 05:15](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=315) The query code also starts with imports and the embedding model, then **reloads** the persistent database from disk and gets the same collection (the name must match the one used for building). Then the query function (a coroutine, since it calls the cloud embedding model):\n1. embed the user's question. The instructor stresses that even for **one** question you pass a **list of strings**, `[question]`; take `embeddings[0]` from the result – the list has just one item, so item 0 is it;\n2. call the collection's query method `collection.query(...)` with the question vector and how many results you want (`n_results`);\n3. [▶ 06:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=376) the result is a **dict**; take its `\"documents\"`, then item 0 of that list – those are the texts found;\n4. join them into one string, ready to go into the model's prompt."
    },
    {
      "t": "code",
      "file": "practice/l17_chroma_basics.py · query",
      "code": {
        "zh": "async def query(collection, question, n_results=3):\n    res = await embedding_model([question])          # 只有一个问题，也要放进列表\n    question_vector = res.embeddings[0]              # 取第 0 个（也是唯一一个）向量\n    results = collection.query(query_embeddings=[question_vector], n_results=n_results)\n    docs = results[\"documents\"][0]                   # 第 0 个问题查到的文字列表\n    return \"\\n\".join(docs)                           # 拼成一个字符串\n\nasync def main():\n    await create_db()\n    collection = open_collection()\n    print(await query(collection, \"什么是巨型钳蟹？\", n_results=2))\n\nasyncio.run(main())",
        "en": "async def query(collection, question, n_results=3):\n    res = await embedding_model([question])          # one question, still inside a list\n    question_vector = res.embeddings[0]              # item 0 (the only vector)\n    results = collection.query(query_embeddings=[question_vector], n_results=n_results)\n    docs = results[\"documents\"][0]                   # the texts found for question 0\n    return \"\\n\".join(docs)                           # one string\n\nasync def main():\n    await create_db()\n    collection = open_collection()\n    print(await query(collection, \"什么是巨型钳蟹？\", n_results=2))   # \"What is the giant pincer crab?\"\n\nasyncio.run(main())"
      },
      "note": {
        "zh": "`practice/l17_chroma_basics.py` 不调用大模型，完全离线，可以放心多跑几次。实测问「什么是巨型钳蟹？」排第一的就是钳蟹那一行；问「哪种海怪怕磁铁？」排第一的是铁鳞海蛇——这一行里没有「怕」字，写的是「讨厌磁铁」「掉头逃走」，意思相近就能找到。",
        "en": "`practice/l17_chroma_basics.py` calls no LLM and runs fully offline, so run it as often as you like. In a real run, “What is the giant pincer crab?” put the crab's line first, and “Which sea monster is afraid of magnets?” put the iron-scaled sea serpent first – its line never says “afraid”, only that it hates magnets and turns tail near them; similar meaning is enough."
      }
    },
    {
      "t": "py",
      "title": {
        "zh": "列表套列表：查询结果为什么要取 [0]",
        "en": "Lists inside lists: why the query result needs [0]"
      },
      "zh": "`collection.query(...)` 一次可以查**好几个问题**（`query_embeddings` 是一个列表），所以返回的字典里，每个值都是「**列表套列表**」：外层每个问题一项，里层才是这个问题查到的几条。我们只查一个问题，所以先 `[\"documents\"]` 取出外层列表，再 `[0]` 取第 0 个问题的结果。\n\n顺便看三个会用到的小工具：\n- `range(n)` 依次给出 0、1、2……n-1，配合 f-string 就能给每块生成 id；\n- 字典里还有 `\"distances\"`：**余弦距离 = 1 - 余弦相似度**，越小越像；\n- `zip(列表1, 列表2)` 把两个列表按位置配成一对一对，`for doc, dist in ...` 一次拆出两个值（拆包，07 节）。\n\n下面用一个写死的字典模拟查询结果：",
      "en": "`collection.query(...)` can search for **several questions** at once (`query_embeddings` is a list), so every value in the returned dict is a **list of lists**: one outer item per question, and inside it the hits for that question. We ask only one question, so `[\"documents\"]` gets the outer list and `[0]` the results of question 0.\n\nThree small tools along the way:\n- `range(n)` gives 0, 1, 2 … n-1; with an f-string it makes an id for each chunk;\n- the dict also has `\"distances\"`: **cosine distance = 1 − cosine similarity**, so smaller means closer;\n- `zip(list1, list2)` pairs two lists up by position, and `for doc, dist in ...` takes both values out at once (unpacking, lesson 07).\n\nA hard-coded dict stands in for a query result:",
      "code": {
        "zh": "# 模拟 collection.query(...) 的返回值（只问了 1 个问题）\nresults = {\n    \"ids\": [[\"chunk_0\", \"chunk_6\"]],\n    \"documents\": [[\"巨型钳蟹：背甲宽约四米……\", \"潮汐巨鲸：身长六十米……\"]],\n    \"distances\": [[0.21, 0.55]],\n}\n\nprint(results[\"documents\"])         # 外层：每个问题一项\nprint(results[\"documents\"][0])      # 第 0 个问题查到的文字\n\ndocs = results[\"documents\"][0]\nprint(\"\\n\".join(docs))              # 拼成一个字符串，准备放进提示词\n\nfor doc, dist in zip(docs, results[\"distances\"][0]):\n    print(f\"相似度 {1 - dist:.2f}  {doc[:4]}\")\n\nchunks = [\"第一行\", \"第二行\", \"第三行\"]\nids = [f\"chunk_{i}\" for i in range(len(chunks))]   # 每块一个 id\nprint(ids)",
        "en": "# a stand-in for what collection.query(...) returns (one question asked)\nresults = {\n    \"ids\": [[\"chunk_0\", \"chunk_6\"]],\n    \"documents\": [[\"Giant pincer crab: shell about four metres wide...\", \"Tidal giant whale: sixty metres long...\"]],\n    \"distances\": [[0.21, 0.55]],\n}\n\nprint(results[\"documents\"])         # outer list: one item per question\nprint(results[\"documents\"][0])      # the texts found for question 0\n\ndocs = results[\"documents\"][0]\nprint(\"\\n\".join(docs))              # one string, ready for the prompt\n\nfor doc, dist in zip(docs, results[\"distances\"][0]):\n    print(f\"similarity {1 - dist:.2f}  {doc[:17]}\")\n\nchunks = [\"line one\", \"line two\", \"line three\"]\nids = [f\"chunk_{i}\" for i in range(len(chunks))]   # one id per chunk\nprint(ids)"
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "查询函数里写成了 `await embedding_model(question)`（直接传字符串，没放进列表），会怎样？",
        "en": "The query function says `await embedding_model(question)` – a bare string, not a list. What happens?"
      },
      "options": [
        {
          "zh": "和传列表完全一样",
          "en": "Exactly the same as passing a list"
        },
        {
          "zh": "立刻报错",
          "en": "An immediate error"
        },
        {
          "zh": "字符串被当成一个个字分别向量化，`embeddings[0]` 只是第一个字的向量，检索悄悄变得不准",
          "en": "The string is embedded character by character, so `embeddings[0]` is just the first character's vector and the search quietly goes wrong"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "实测：传入「巨型钳蟹」得到 4 个向量，一个字一个。这正是视频强调「传的依然是字符串列表」的原因。",
        "en": "Tested: passing the four-character name gave 4 vectors, one per character. That's why the video stresses passing a list of strings."
      }
    },
    {
      "t": "h",
      "zh": "六、完整实例：带知识库的流式聊天智能体",
      "en": "6. The complete example: a streaming chat agent with a knowledge base"
    },
    {
      "t": "p",
      "zh": "[▶ 06:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=390) 完整实例把前几节的东西接起来：导入构建智能体、传递消息要用的库（15 节），定义模型、创建智能体，再初始化向量模型（视频里它和聊天模型用同一个百炼 key），建库函数和查询函数与前面一样。\n\n[▶ 07:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=439) 最重要的是问答循环：\n1. 再加载一次持久化的数据库，取得集合（和建库时的步骤一致）；\n2. `while True` 保证能多轮对话；读用户输入；\n3. 调用查询函数，找出和输入最相近的几条——视频里取 **7 条**；\n4. 把查到的内容填进**提示词模板**：模板里专门留一块放资料，并提示模型「这部分是 RAG 注入的内容」，再和用户的问题拼在一起；\n5. 打包成 `Msg` 交给智能体，像 15 节那样流式输出。\n\n程序先运行建库函数，再启动这个问答函数。",
      "en": "[▶ 06:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=390) The complete example ties the earlier lessons together: import what's needed to build an agent and pass messages (lesson 15), define the model, create the agent, then set up the embedding model (in the video it shares the chat model's Bailian key); the build and query functions are as above.\n\n[▶ 07:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=439) The key part is the Q&A loop:\n1. load the persistent database again and get the collection (same steps as when building);\n2. `while True` keeps the conversation going; read the user's input;\n3. call the query function to find the closest entries – **7** in the video;\n4. fill them into a **prompt template**: the template has a slot for the material and tells the model “this part is RAG-injected content”, joined with the user's question;\n5. wrap it in a `Msg` and stream the agent's answer as in lesson 15.\n\nThe program runs the build function first, then starts this Q&A function."
    },
    {
      "t": "code",
      "file": "practice/l17_rag_solution.py · chat_with_rag",
      "code": {
        "zh": "model = OpenAIChatModel(\n    model=MODEL,\n    credential=OpenAICredential(api_key=API_KEY, base_url=BASE_URL),\n    stream=True,\n)\nagent = Agent(\n    name=\"Friday\",\n    system_prompt=\"你是一个海洋怪物百科助手。回答要简短；资料里没有的内容，就直接说不知道。\",\n    model=model,\n)\n\nasync def chat_with_rag():\n    collection = open_collection()\n    while True:\n        user_input = input(\"\\n你：\").strip()\n        if user_input == \"exit\":\n            break\n        if not user_input:\n            continue\n\n        knowledge = await query(collection, user_input, n_results=7)     # 1. 检索\n        prompt = (                                                        # 2. 填进模板\n            \"以下是从知识库检索到的资料（RAG 注入的内容），请根据这些资料回答：\\n\"\n            f\"<资料>\\n{knowledge}\\n</资料>\\n\\n\"\n            f\"用户的问题：{user_input}\"\n        )\n        msg = Msg(name=\"user\", role=\"user\", content=[TextBlock(text=prompt)])\n\n        print(\"Friday：\", end=\"\", flush=True)\n        async for event in agent.reply_stream(msg):                      # 3. 流式回答\n            if hasattr(event, \"delta\"):\n                print(event.delta, end=\"\", flush=True)\n        print()\n\nasync def main():\n    await create_db()\n    await chat_with_rag()\n\nasyncio.run(main())",
        "en": "model = OpenAIChatModel(\n    model=MODEL,\n    credential=OpenAICredential(api_key=API_KEY, base_url=BASE_URL),\n    stream=True,\n)\nagent = Agent(\n    name=\"Friday\",\n    system_prompt=\"You are an encyclopedia of sea monsters. Be brief; if the material doesn't say, just say you don't know.\",\n    model=model,\n)\n\nasync def chat_with_rag():\n    collection = open_collection()\n    while True:\n        user_input = input(\"\\nYou: \").strip()\n        if user_input == \"exit\":\n            break\n        if not user_input:\n            continue\n\n        knowledge = await query(collection, user_input, n_results=7)     # 1. retrieve\n        prompt = (                                                        # 2. fill the template\n            \"Below is material retrieved from the knowledge base (RAG-injected content). Answer from it:\\n\"\n            f\"<material>\\n{knowledge}\\n</material>\\n\\n\"\n            f\"The user's question: {user_input}\"\n        )\n        msg = Msg(name=\"user\", role=\"user\", content=[TextBlock(text=prompt)])\n\n        print(\"Friday: \", end=\"\", flush=True)\n        async for event in agent.reply_stream(msg):                      # 3. stream the answer\n            if hasattr(event, \"delta\"):\n                print(event.delta, end=\"\", flush=True)\n        print()\n\nasync def main():\n    await create_db()\n    await chat_with_rag()\n\nasyncio.run(main())"
      },
      "note": {
        "zh": "节选（导入、`open_collection`、`create_db`、`query` 同上）；完整文件是 `practice/l17_rag_solution.py`。资料文件是中文的，用英文提问时本地向量模型的检索效果会差一些，演示时建议用中文问。",
        "en": "An excerpt (imports, `open_collection`, `create_db` and `query` as above); the full file is `practice/l17_rag_solution.py`. The data file is in Chinese, and the local embedding model retrieves less well for English questions, so ask in Chinese for the demo."
      }
    },
    {
      "t": "video",
      "zh": "[▶ 08:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=501) 演示用的知识库是老师自己编的**幻想海怪**资料：巨型钳蟹、幻影乌贼，还有一种带电的鲨鱼。这些是他虚构的，网上没有，模型的训练语料里也没有——正好用来检验 RAG。[▶ 08:51](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=531) 他问「什么是巨型钳蟹」，模型根据检索到的内容作答，说法和资料里写的一致。\n\n本课的 `practice/data/l17_sea_monsters.txt` 也是一份（我们自己编的）海怪资料，一行一种，共 10 种。实测（DeepSeek）：问「什么是巨型钳蟹？」，先打出一小段思考（有时是英文，有时是中文），然后的回答和文件里那一行一致：生活在南海珊瑚礁附近、背甲宽约四米、右钳比左钳大三倍、满月夜出来觅食、最怕低沉的鼓声。",
      "en": "[▶ 08:21](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=501) The demo knowledge base is the instructor's own **fantasy sea monster** material: a giant pincer crab, a phantom squid and an electric shark among them. He made them up, so they're neither online nor in the model's training data – a fair test for RAG. [▶ 08:51](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=531) He asks what the giant pincer crab is, and the model answers from the retrieved content, matching what his material says.\n\nThis lesson's `practice/data/l17_sea_monsters.txt` is a (self-invented) set of sea monsters too, one per line, ten in all. Real run (DeepSeek): asked “What is the giant pincer crab?”, it first printed a short piece of reasoning (sometimes in English, sometimes in Chinese), then an answer matching the file's line: lives near coral reefs in the South China Sea, a shell about four metres wide, a right claw three times the left, feeds on full-moon nights, and fears deep drum beats."
    },
    {
      "t": "check",
      "q": {
        "zh": "完整实例里，模型是怎么「知道」巨型钳蟹的？",
        "en": "In the complete example, how does the model “know” about the giant pincer crab?"
      },
      "options": [
        {
          "zh": "检索到的资料被填进提示词模板，和问题一起作为消息发给了它",
          "en": "The retrieved material was filled into the prompt template and sent to it in the message with the question"
        },
        {
          "zh": "建库时 Chroma 把资料训练进了模型",
          "en": "Chroma trained the material into the model while building"
        },
        {
          "zh": "智能体自己去 Chroma 里查了",
          "en": "The agent searched Chroma by itself"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "模型本身没变。是我们的程序先检索，再把资料拼进提示词——这就是「检索增强」。智能体没有检索工具，它只看到拼好的消息。",
        "en": "The model itself is unchanged. Our program retrieves first and pastes the material into the prompt – that's the “retrieval augmentation”. The agent has no search tool; it only sees the assembled message."
      }
    },
    {
      "t": "h",
      "zh": "七、补充：AgentScope 自带的 RAG 组件",
      "en": "7. Extra: AgentScope's own RAG components"
    },
    {
      "t": "note",
      "zh": "视频没讲这部分。除了像视频那样自己调 chromadb，AgentScope 2.x 还自带一套 RAG 组件：`TextParser`（读文件）→ `ApproxTokenChunker`（切块）→ 向量模型 → 向量库 → `KnowledgeBase` → `RAGMiddleware`（把知识库接到智能体上）。`RAGMiddleware` 有两种模式：`static` 每次提问前自动检索并把结果放进上下文，和本节手写的流程一样；`agentic` 给模型一个 `search_knowledge` 工具，让它自己决定要不要查（这个工具要用 `Toolkit(tools=await rag.list_tools())` 自己放进工具箱）。\n\n2.0.9 自带的向量库是 Qdrant、Milvus、Elasticsearch、MongoDB（都要另装包，本课没装），没有 Chroma。`practice/l17_kb_middleware.py` 用一个最简单的内存向量库当替身跑通了整个流程（实测问「哪种海怪怕磁铁？它有多长？」，回答铁鳞海蛇、约十二米）。21 节讲中间件时还会提到 `RAGMiddleware`。",
      "en": "Not in the video. Besides calling chromadb yourself as the video does, AgentScope 2.x ships RAG components: `TextParser` (read files) → `ApproxTokenChunker` (chunk) → embedding model → vector store → `KnowledgeBase` → `RAGMiddleware` (connect the knowledge base to an agent). `RAGMiddleware` has two modes: `static` searches automatically before every answer and puts the results into the context – the same flow you wrote by hand here; `agentic` gives the model a `search_knowledge` tool and lets it decide when to search (you add that tool yourself with `Toolkit(tools=await rag.list_tools())`).\n\nThe vector stores built into 2.0.9 are Qdrant, Milvus, Elasticsearch and MongoDB (extra packages, not installed here) – no Chroma. `practice/l17_kb_middleware.py` runs the whole pipeline with a minimal in-memory store as a stand-in (real run: asked which sea monster fears magnets and how long it is, it answered the iron-scaled sea serpent, about twelve metres). Lesson 21 mentions `RAGMiddleware` again when it covers middleware."
    },
    {
      "t": "video",
      "zh": "[▶ 09:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=565) 老师的总结：这一集讲了 RAG 的基本概念、为什么需要它、它起什么作用，并用一个实例演示了在 AgentScope 2.0 里怎样使用 RAG。",
      "en": "[▶ 09:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=18&t=565) The instructor's summary: the episode covered the basic idea of RAG, why it's needed and what it does, and showed with one example how to use RAG with AgentScope 2.0."
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "视频说哪种情况最需要 RAG？",
        "en": "According to the video, when is RAG most needed?"
      },
      "options": [
        {
          "zh": "想让模型回答得更快",
          "en": "When you want faster answers"
        },
        {
          "zh": "企业私有资料、小众领域：模型训练时没见过，网上也搜不到",
          "en": "Private company material and niche fields: the model never saw it and it can't be found online"
        },
        {
          "zh": "想让模型能调用工具",
          "en": "When you want the model to call tools"
        },
        {
          "zh": "想让模型的回答更长",
          "en": "When you want longer answers"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "RAG 是给模型「注入知识」：先检索相关资料，再让模型据此回答。",
        "en": "RAG “injects knowledge”: retrieve relevant material first, then let the model answer from it."
      }
    },
    {
      "q": {
        "zh": "建库时 `get_or_create_collection(..., metadata={\"hnsw:space\": \"cosine\"})` 里的 metadata 是做什么的？",
        "en": "What does the metadata in `get_or_create_collection(..., metadata={\"hnsw:space\": \"cosine\"})` do?"
      },
      "options": [
        {
          "zh": "设定检索时用余弦相似度比较向量",
          "en": "It makes the search compare vectors by cosine similarity"
        },
        {
          "zh": "给集合加一个中文说明",
          "en": "It adds a description to the collection"
        },
        {
          "zh": "指定用哪个 embedding 模型",
          "en": "It picks the embedding model"
        },
        {
          "zh": "设定数据库存在哪个文件夹",
          "en": "It sets the folder the database lives in"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "这一项决定比较相似度的方法；文件夹由 `PersistentClient(path=...)` 决定，向量由我们自己算好传进去。",
        "en": "This sets how similarity is compared; the folder comes from `PersistentClient(path=...)`, and the vectors are computed by us and passed in."
      }
    },
    {
      "q": {
        "zh": "`results = collection.query(query_embeddings=[vec], n_results=3)` 之后，为什么要写 `results[\"documents\"][0]`？",
        "en": "After `results = collection.query(query_embeddings=[vec], n_results=3)`, why write `results[\"documents\"][0]`?"
      },
      "options": [
        {
          "zh": "`[0]` 取的是相似度最高的那一条",
          "en": "`[0]` picks the single best hit"
        },
        {
          "zh": "`documents` 是一个字符串，`[0]` 取第一个字",
          "en": "`documents` is a string and `[0]` takes its first character"
        },
        {
          "zh": "一次可以查好几个问题，每个值都是列表套列表；`[0]` 是第 0 个问题查到的那几条",
          "en": "One call can search several questions, so each value is a list of lists; `[0]` is the hits for question 0"
        },
        {
          "zh": "不写 `[0]` 会把数据库删掉",
          "en": "Without `[0]` the database gets deleted"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "外层按问题分，里层才是查到的文字。我们只问了一个问题，所以取第 0 项，得到 3 条文字。",
        "en": "The outer list is per question; the inner one holds the texts. We asked one question, so item 0 gives the 3 texts."
      }
    },
    {
      "q": {
        "zh": "改了资料文件里的几行，再运行一次用 `collection.add(...)`（id 还是 `chunk_0`、`chunk_1`……）建库。库里的内容会怎样？",
        "en": "You edit some lines of the data file and rebuild with `collection.add(...)` (ids still `chunk_0`, `chunk_1`…). What does the database hold?"
      },
      "options": [
        {
          "zh": "自动更新成新内容",
          "en": "The new content, updated automatically"
        },
        {
          "zh": "还是旧内容：已有的 id 被悄悄跳过；要用 `upsert`，或删掉数据库文件夹重建",
          "en": "Still the old content: existing ids are silently skipped; use `upsert`, or delete the database folder and rebuild"
        },
        {
          "zh": "新旧内容各存一份",
          "en": "Both old and new copies"
        },
        {
          "zh": "程序报错停止",
          "en": "The program stops with an error"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "实测：重复 id 的 `add` 不报错也不更新。`upsert` 是「有就更新、没有就新增」。",
        "en": "Tested: `add` with existing ids neither fails nor updates. `upsert` updates what exists and inserts what doesn't."
      }
    },
    {
      "q": {
        "zh": "建库时用百炼的 text-embedding-v4（1024 维），查询时换成本地模型（512 维），会怎样？",
        "en": "You build with Bailian's text-embedding-v4 (1024 numbers) and query with the local model (512). What happens?"
      },
      "options": [
        {
          "zh": "没关系，向量都是数字",
          "en": "No problem – vectors are just numbers"
        },
        {
          "zh": "检索会快一倍",
          "en": "Search gets twice as fast"
        },
        {
          "zh": "Chroma 会自动换算",
          "en": "Chroma converts them automatically"
        },
        {
          "zh": "Chroma 报维度不符的错；就算维度碰巧一样，不同模型的向量也没法比较。建库和查询必须用同一个模型",
          "en": "Chroma raises a dimension error; even with matching sizes, vectors from different models can't be compared. Build and query with the same model"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "一个集合里的向量长度必须一致（实测报 `Collection expecting embedding with dimension of ...`）。不同模型的向量不在同一个「空间」里。",
        "en": "All vectors in a collection must have the same length (tested: `Collection expecting embedding with dimension of ...`). Vectors from different models don't live in the same space."
      }
    },
    {
      "q": {
        "zh": "本课为什么不像视频那样用 DeepSeek 的 key 算向量？",
        "en": "Why doesn't this lesson compute embeddings with the DeepSeek key, the way the video uses its Bailian key?"
      },
      "options": [
        {
          "zh": "DeepSeek 没有向量（embedding）接口；视频的向量模型要百炼 key，所以换成在本机运行的模型",
          "en": "DeepSeek has no embeddings API, and the video's model needs a Bailian key, so a model that runs locally is used"
        },
        {
          "zh": "本地模型比所有云端模型都准",
          "en": "Local models beat every cloud model"
        },
        {
          "zh": "AgentScope 不支持云端向量模型",
          "en": "AgentScope doesn't support cloud embedding models"
        },
        {
          "zh": "Chroma 只接受本地模型的向量",
          "en": "Chroma only accepts vectors from local models"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "DeepSeek 只提供对话模型。AgentScope 支持百炼、OpenAI、Gemini、Ollama 等向量模型；本课用本地模型只是因为不需要额外的 key。",
        "en": "DeepSeek only offers chat models. AgentScope supports Bailian, OpenAI, Gemini, Ollama and other embedding models; the local one is used only because it needs no extra key."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "建库",
        "en": "Building the database"
      },
      "code": {
        "zh": "async def create_db():\n    text = DATA_FILE.read_text(encoding=\"utf-8\")\n    chunks = [line.strip() for line in text.[[splitlines]]() if line.strip()]\n    client = chromadb.[[PersistentClient]](path=str(DB_DIR))\n    collection = client.[[get_or_create_collection]](\n        name=\"sea_monsters\", metadata={\"hnsw:space\": \"[[cosine]]\"}, embedding_function=None)\n    res = [[await]] embedding_model(chunks)\n    ids = [f\"chunk_{i}\" for i in [[range]](len(chunks))]\n    collection.[[upsert|add]](ids=ids, embeddings=res.[[embeddings]], documents=chunks)",
        "en": "async def create_db():\n    text = DATA_FILE.read_text(encoding=\"utf-8\")\n    chunks = [line.strip() for line in text.[[splitlines]]() if line.strip()]\n    client = chromadb.[[PersistentClient]](path=str(DB_DIR))\n    collection = client.[[get_or_create_collection]](\n        name=\"sea_monsters\", metadata={\"hnsw:space\": \"[[cosine]]\"}, embedding_function=None)\n    res = [[await]] embedding_model(chunks)\n    ids = [f\"chunk_{i}\" for i in [[range]](len(chunks))]\n    collection.[[upsert|add]](ids=ids, embeddings=res.[[embeddings]], documents=chunks)"
      },
      "explain": {
        "zh": "按行分块 → 打开存到硬盘的数据库 → 取得用余弦相似度的集合 → 向量化 → 每块一个 id 写进去。",
        "en": "Split by line → open the on-disk database → get a cosine collection → embed → write each chunk with its id."
      }
    },
    {
      "title": {
        "zh": "检索",
        "en": "Searching"
      },
      "code": {
        "zh": "async def query(collection, question, n_results=3):\n    res = await embedding_model([ [[question]] ])\n    results = collection.[[query]](query_embeddings=[res.embeddings[ [[0]] ]], n_results=[[n_results]])\n    return \"\\n\".[[join]](results[\"[[documents]]\"][0])",
        "en": "async def query(collection, question, n_results=3):\n    res = await embedding_model([ [[question]] ])\n    results = collection.[[query]](query_embeddings=[res.embeddings[ [[0]] ]], n_results=[[n_results]])\n    return \"\\n\".[[join]](results[\"[[documents]]\"][0])"
      },
      "explain": {
        "zh": "问题也要放进列表再向量化，取第 0 个向量；查询结果取 `documents` 的第 0 项，拼成一个字符串。",
        "en": "Put the question in a list before embedding and take vector 0; from the result take item 0 of `documents` and join it into one string."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：建库函数 create_db",
        "en": "Write it: the build function create_db"
      },
      "task": {
        "zh": "导入、`DATA_FILE`、`DB_DIR`、`embedding_model` 已经给出。写 `async def create_db()`：\n1. 读出 `DATA_FILE` 的文字，按行分块并去掉空行\n2. 用 `chromadb.PersistentClient(path=...)` 打开数据库，用 `get_or_create_collection` 取得集合（`metadata` 设成余弦相似度，`embedding_function=None`）\n3. `await embedding_model(chunks)` 算向量\n4. 用 `range` 给每块生成 id，`upsert`（或 `add`）写入 ids、向量和文字\n5. 打印集合里的条数（`collection.count()`）",
        "en": "The imports, `DATA_FILE`, `DB_DIR` and `embedding_model` are given. Write `async def create_db()`:\n1. read `DATA_FILE`, split it by line and drop empty lines\n2. open the database with `chromadb.PersistentClient(path=...)` and get a collection with `get_or_create_collection` (`metadata` set to cosine similarity, `embedding_function=None`)\n3. compute the vectors with `await embedding_model(chunks)`\n4. make an id per chunk with `range`, then `upsert` (or `add`) the ids, vectors and texts\n5. print how many entries the collection has (`collection.count()`)"
      },
      "starter": {
        "zh": "import asyncio\nfrom pathlib import Path\n\nimport chromadb\nfrom chromadb.config import Settings\nfrom chromadb.telemetry.product import ProductTelemetryClient\n\nfrom l17_local_embedding import LocalEmbedding\n\nHERE = Path(__file__).parent\nDATA_FILE = HERE / \"data\" / \"l17_sea_monsters.txt\"\nDB_DIR = HERE / \"output\" / \"l17_chroma_db\"\nProductTelemetryClient.USER_ID_PATH = str(HERE / \"output\" / \"l17_chroma_telemetry_id\")\nembedding_model = LocalEmbedding()\n\n# 写 create_db()，最后用 asyncio.run 运行它\n",
        "en": "import asyncio\nfrom pathlib import Path\n\nimport chromadb\nfrom chromadb.config import Settings\nfrom chromadb.telemetry.product import ProductTelemetryClient\n\nfrom l17_local_embedding import LocalEmbedding\n\nHERE = Path(__file__).parent\nDATA_FILE = HERE / \"data\" / \"l17_sea_monsters.txt\"\nDB_DIR = HERE / \"output\" / \"l17_chroma_db\"\nProductTelemetryClient.USER_ID_PATH = str(HERE / \"output\" / \"l17_chroma_telemetry_id\")\nembedding_model = LocalEmbedding()\n\n# write create_db(), then run it with asyncio.run\n"
      },
      "solution": {
        "zh": "import asyncio\nfrom pathlib import Path\n\nimport chromadb\nfrom chromadb.config import Settings\nfrom chromadb.telemetry.product import ProductTelemetryClient\n\nfrom l17_local_embedding import LocalEmbedding\n\nHERE = Path(__file__).parent\nDATA_FILE = HERE / \"data\" / \"l17_sea_monsters.txt\"\nDB_DIR = HERE / \"output\" / \"l17_chroma_db\"\nProductTelemetryClient.USER_ID_PATH = str(HERE / \"output\" / \"l17_chroma_telemetry_id\")\nembedding_model = LocalEmbedding()\n\nasync def create_db():\n    text = DATA_FILE.read_text(encoding=\"utf-8\")\n    chunks = [line.strip() for line in text.splitlines() if line.strip()]\n\n    client = chromadb.PersistentClient(path=str(DB_DIR), settings=Settings(anonymized_telemetry=False))\n    collection = client.get_or_create_collection(\n        name=\"sea_monsters\",\n        metadata={\"hnsw:space\": \"cosine\"},\n        embedding_function=None,\n    )\n\n    res = await embedding_model(chunks)\n    ids = [f\"chunk_{i}\" for i in range(len(chunks))]\n    collection.upsert(ids=ids, embeddings=res.embeddings, documents=chunks)\n    print(\"知识库条数：\", collection.count())\n\nasyncio.run(create_db())",
        "en": "import asyncio\nfrom pathlib import Path\n\nimport chromadb\nfrom chromadb.config import Settings\nfrom chromadb.telemetry.product import ProductTelemetryClient\n\nfrom l17_local_embedding import LocalEmbedding\n\nHERE = Path(__file__).parent\nDATA_FILE = HERE / \"data\" / \"l17_sea_monsters.txt\"\nDB_DIR = HERE / \"output\" / \"l17_chroma_db\"\nProductTelemetryClient.USER_ID_PATH = str(HERE / \"output\" / \"l17_chroma_telemetry_id\")\nembedding_model = LocalEmbedding()\n\nasync def create_db():\n    text = DATA_FILE.read_text(encoding=\"utf-8\")\n    chunks = [line.strip() for line in text.splitlines() if line.strip()]\n\n    client = chromadb.PersistentClient(path=str(DB_DIR), settings=Settings(anonymized_telemetry=False))\n    collection = client.get_or_create_collection(\n        name=\"sea_monsters\",\n        metadata={\"hnsw:space\": \"cosine\"},\n        embedding_function=None,\n    )\n\n    res = await embedding_model(chunks)\n    ids = [f\"chunk_{i}\" for i in range(len(chunks))]\n    collection.upsert(ids=ids, embeddings=res.embeddings, documents=chunks)\n    print(\"entries in the knowledge base:\", collection.count())\n\nasyncio.run(create_db())"
      },
      "checks": [
        {
          "zh": "定义了 `async def create_db()`",
          "en": "Defines `async def create_db()`",
          "re": "async\\s+def\\s+create_db\\s*\\("
        },
        {
          "zh": "按行分块（`splitlines()`）",
          "en": "Splits by line (`splitlines()`)",
          "re": "\\.splitlines\\(\\s*\\)"
        },
        {
          "zh": "用 `chromadb.PersistentClient(path=...)` 打开数据库",
          "en": "Opens the database with `chromadb.PersistentClient(path=...)`",
          "re": "chromadb\\.PersistentClient\\(\\s*path\\s*="
        },
        {
          "zh": "`get_or_create_collection` 设了余弦相似度",
          "en": "`get_or_create_collection` sets cosine similarity",
          "re": "get_or_create_collection\\([\\s\\S]*?[\"']hnsw:space[\"']\\s*:\\s*[\"']cosine[\"']"
        },
        {
          "zh": "`await embedding_model(...)` 算向量",
          "en": "Computes vectors with `await embedding_model(...)`",
          "re": "await\\s+embedding_model\\("
        },
        {
          "zh": "用 `range(len(...))` 生成 id",
          "en": "Makes ids with `range(len(...))`",
          "re": "range\\(\\s*len\\("
        },
        {
          "zh": "`upsert` 或 `add` 写入向量和文字",
          "en": "Writes vectors and texts with `upsert` or `add`",
          "re": "\\.(upsert|add)\\([\\s\\S]*?embeddings\\s*=[\\s\\S]*?documents\\s*="
        }
      ]
    },
    {
      "title": {
        "zh": "手写：检索 + 填模板 + 流式回答",
        "en": "Write it: search + fill the template + stream the answer"
      },
      "task": {
        "zh": "接着上一题（`open_collection()`、`agent`、`embedding_model` 都已准备好），写：\n1. `async def query(collection, question, n_results=3)`：问题放进列表再向量化、取第 0 个向量、`collection.query(...)`、取 `[\"documents\"][0]`、用 `\"\\n\".join` 拼成字符串返回\n2. `async def chat_with_rag()`：循环读输入（`exit` 退出），检索 7 条，用 f-string 把资料和问题填进提示词，打包成 `Msg`，用 `reply_stream` 流式打印",
        "en": "Continuing from the previous task (`open_collection()`, `agent` and `embedding_model` are ready), write:\n1. `async def query(collection, question, n_results=3)`: put the question in a list and embed it, take vector 0, `collection.query(...)`, take `[\"documents\"][0]`, and return it joined with `\"\\n\".join`\n2. `async def chat_with_rag()`: loop reading input (`exit` quits), retrieve 7 entries, fill the material and the question into a prompt with an f-string, wrap it in a `Msg`, and stream the answer with `reply_stream`"
      },
      "starter": {
        "zh": "from agentscope.message import Msg, TextBlock\n\n# （open_collection、agent、embedding_model 在前面已经写好）\n\n# 1. query(collection, question, n_results=3)\n\n\n# 2. chat_with_rag()\n",
        "en": "from agentscope.message import Msg, TextBlock\n\n# (open_collection, agent and embedding_model are defined earlier)\n\n# 1. query(collection, question, n_results=3)\n\n\n# 2. chat_with_rag()\n"
      },
      "solution": {
        "zh": "from agentscope.message import Msg, TextBlock\n\n# （open_collection、agent、embedding_model 在前面已经写好）\n\n# 1. query(collection, question, n_results=3)\nasync def query(collection, question, n_results=3):\n    res = await embedding_model([question])\n    results = collection.query(query_embeddings=[res.embeddings[0]], n_results=n_results)\n    return \"\\n\".join(results[\"documents\"][0])\n\n# 2. chat_with_rag()\nasync def chat_with_rag():\n    collection = open_collection()\n    while True:\n        user_input = input(\"你：\").strip()\n        if user_input == \"exit\":\n            break\n        knowledge = await query(collection, user_input, n_results=7)\n        prompt = f\"以下是知识库检索到的资料（RAG 注入的内容）：\\n{knowledge}\\n\\n用户的问题：{user_input}\"\n        msg = Msg(name=\"user\", role=\"user\", content=[TextBlock(text=prompt)])\n        async for event in agent.reply_stream(msg):\n            if hasattr(event, \"delta\"):\n                print(event.delta, end=\"\", flush=True)\n        print()",
        "en": "from agentscope.message import Msg, TextBlock\n\n# (open_collection, agent and embedding_model are defined earlier)\n\n# 1. query(collection, question, n_results=3)\nasync def query(collection, question, n_results=3):\n    res = await embedding_model([question])\n    results = collection.query(query_embeddings=[res.embeddings[0]], n_results=n_results)\n    return \"\\n\".join(results[\"documents\"][0])\n\n# 2. chat_with_rag()\nasync def chat_with_rag():\n    collection = open_collection()\n    while True:\n        user_input = input(\"You: \").strip()\n        if user_input == \"exit\":\n            break\n        knowledge = await query(collection, user_input, n_results=7)\n        prompt = f\"Material retrieved from the knowledge base (RAG-injected content):\\n{knowledge}\\n\\nThe user's question: {user_input}\"\n        msg = Msg(name=\"user\", role=\"user\", content=[TextBlock(text=prompt)])\n        async for event in agent.reply_stream(msg):\n            if hasattr(event, \"delta\"):\n                print(event.delta, end=\"\", flush=True)\n        print()"
      },
      "checks": [
        {
          "zh": "问题放进列表再向量化：`await embedding_model([...])`",
          "en": "Embeds the question inside a list: `await embedding_model([...])`",
          "re": "await\\s+embedding_model\\(\\s*\\["
        },
        {
          "zh": "取第 0 个向量：`embeddings[0]`",
          "en": "Takes vector 0: `embeddings[0]`",
          "re": "\\.embeddings\\[\\s*0\\s*\\]"
        },
        {
          "zh": "`collection.query(query_embeddings=..., n_results=...)`",
          "en": "`collection.query(query_embeddings=..., n_results=...)`",
          "re": "\\.query\\(\\s*query_embeddings\\s*=[\\s\\S]*?n_results\\s*="
        },
        {
          "zh": "取 `[\"documents\"][0]`",
          "en": "Takes `[\"documents\"][0]`",
          "re": "\\[\\s*[\"']documents[\"']\\s*\\]\\s*\\[\\s*0\\s*\\]"
        },
        {
          "zh": "检索 7 条",
          "en": "Retrieves 7 entries",
          "re": "n_results\\s*=\\s*7"
        },
        {
          "zh": "用 f-string 把资料填进提示词",
          "en": "Fills the material into the prompt with an f-string",
          "re": "f[\"'][^\"'\\n]*\\{knowledge\\}"
        },
        {
          "zh": "用 `reply_stream` 流式输出",
          "en": "Streams with `reply_stream`",
          "re": "async\\s+for\\s+\\w+\\s+in\\s+agent\\.reply_stream\\("
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "给向量模型传了字符串而不是列表：`await embedding_model(\"巨型钳蟹\")` 会把每个字分别向量化，`embeddings[0]` 只是第一个字，检索悄悄出错。",
      "en": "Passing a string instead of a list: `await embedding_model(\"...\")` embeds every character separately, so `embeddings[0]` is just the first character and search silently goes wrong."
    },
    {
      "zh": "忘了 `[\"documents\"]` 后面的 `[0]`：拿到的是列表套列表，`\"\\n\".join(...)` 会报 `TypeError`。",
      "en": "Forgetting the `[0]` after `[\"documents\"]`: you get a list of lists, and `\"\\n\".join(...)` raises a `TypeError`."
    },
    {
      "zh": "改了资料后仍用 `add` 和同样的 id 重建：已有 id 被悄悄跳过，库里还是旧内容。用 `upsert`，或删掉 `practice/output/l17_chroma_db` 重建。",
      "en": "Rebuilding with `add` and the same ids after editing the data: existing ids are silently skipped and the old text stays. Use `upsert`, or delete `practice/output/l17_chroma_db` and rebuild."
    },
    {
      "zh": "建库和查询用了不同的向量模型：维度不同直接报错，维度相同也毫无意义。",
      "en": "Building and querying with different embedding models: an error when the sizes differ, meaningless results when they don't."
    },
    {
      "zh": "集合名写成中文：Chroma 只接受英文字母、数字和 `._-`（至少 3 个字符），否则 `InvalidArgumentError`。",
      "en": "A Chinese collection name: Chroma only accepts ASCII letters, digits and `._-` (3+ characters); otherwise `InvalidArgumentError`."
    },
    {
      "zh": "没做重定向：chromadb 会往 `C:\\Users\\<你>\\.cache\\chroma` 写文件；不写 `embedding_function=None` 又漏传向量时，还会把默认模型下载到 C 盘。",
      "en": "No redirection: chromadb writes under `C:\\Users\\<you>\\.cache\\chroma`, and without `embedding_function=None` a missing vector makes it download its default model to C:."
    },
    {
      "zh": "以为 DeepSeek 能算向量：它没有 embedding 接口；用本地 `LocalEmbedding`，或者有百炼 key 时用 `DashScopeEmbeddingModel`。",
      "en": "Expecting DeepSeek to compute embeddings: it has no embeddings API; use the local `LocalEmbedding`, or `DashScopeEmbeddingModel` with a Bailian key."
    }
  ],
  "recap": [
    {
      "zh": "RAG = 先检索相关资料，再交给模型生成回答；用来注入私有、小众的知识。",
      "en": "RAG = retrieve relevant material, then let the model generate from it; it injects private or niche knowledge."
    },
    {
      "zh": "建库：分块 → 编码模型变成向量 → 文字和向量一起存进向量数据库；查询：问题向量化 → 比相似度 → 取最近的几块。",
      "en": "Build: chunk → embed → store texts with vectors in a vector database; query: embed the question → compare similarity → take the closest chunks."
    },
    {
      "zh": "Chroma：`PersistentClient(path=...)` → `get_or_create_collection(name, metadata={\"hnsw:space\": \"cosine\"})` → `upsert`/`add` → `query(query_embeddings=[...], n_results=...)`。",
      "en": "Chroma: `PersistentClient(path=...)` → `get_or_create_collection(name, metadata={\"hnsw:space\": \"cosine\"})` → `upsert`/`add` → `query(query_embeddings=[...], n_results=...)`."
    },
    {
      "zh": "向量模型：`res = await embedding_model([文字, ...])`，`res.embeddings` 每段一个向量；单个问题也要放进列表，取 `[0]`。",
      "en": "Embedding model: `res = await embedding_model([text, ...])`, `res.embeddings` has one vector per text; a single question still goes in a list, then take `[0]`."
    },
    {
      "zh": "查询结果是列表套列表：`results[\"documents\"][0]` 才是查到的文字，拼成一个字符串放进提示词。",
      "en": "Query results are lists of lists: `results[\"documents\"][0]` holds the texts, joined into one string for the prompt."
    },
    {
      "zh": "完整流程：检索 → 填进提示词模板 → 打包成 `Msg` → `reply_stream` 流式回答。",
      "en": "The full flow: retrieve → fill the prompt template → wrap in a `Msg` → stream with `reply_stream`."
    },
    {
      "zh": "视频用百炼向量模型（要百炼 key）；本课用本地 `bge-small-zh-v1.5`，调用方式一样。",
      "en": "The video uses Bailian's embedding model (needs a Bailian key); this lesson uses the local `bge-small-zh-v1.5`, called the same way."
    }
  ],
  "files": [
    {
      "path": "practice/data/l17_sea_monsters.txt",
      "zh": "知识库资料：10 种虚构的海怪，一行一种。",
      "en": "The knowledge base material: ten made-up sea monsters, one per line."
    },
    {
      "path": "practice/l17_local_embedding.py",
      "zh": "本地向量模型 `LocalEmbedding`（替代视频的百炼向量模型），被其他 l17 文件导入；单独运行可以自测。",
      "en": "The local embedding model `LocalEmbedding` (standing in for the video's Bailian model), imported by the other l17 files; run it alone for a self-test."
    },
    {
      "path": "practice/l17_chroma_basics.py",
      "zh": "视频前两段代码：建库 + 检索，不调用大模型，完全离线。",
      "en": "The video's first two code parts: build + search, no LLM call, fully offline."
    },
    {
      "path": "practice/l17_rag_todo.py",
      "zh": "练习：补全建库、检索、填模板（有 TODO 提示）。",
      "en": "Exercise: fill in building, searching and the template (with TODO hints)."
    },
    {
      "path": "practice/l17_rag_solution.py",
      "zh": "参考答案：视频的完整实例，Chroma 知识库 + 流式聊天智能体。",
      "en": "Solution: the video's complete example, a Chroma knowledge base + a streaming chat agent."
    },
    {
      "path": "practice/l17_kb_middleware.py",
      "zh": "补充：用 AgentScope 自带的 `KnowledgeBase` + `RAGMiddleware` 做同样的事（内存向量库替身，`MODE` 可切换 static / agentic）。",
      "en": "Extra: the same job with AgentScope's own `KnowledgeBase` + `RAGMiddleware` (an in-memory store stand-in; switch `MODE` between static and agentic)."
    }
  ]
});
