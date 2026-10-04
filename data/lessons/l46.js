COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
  "id": "l46",
  "priority": "important",
  "handwrite": false,
  "studyMinutes": 20,
  "source": "subtitle",
  "summary": {
    "zh": "LangChain 把 RAG 的前半段——加载文档、切分、向量化、灌进向量库、检索——都做成了接口统一的组件。视频只用 4 分钟做了简介，讲师直言这部分比较粗糙、坑多，了解即可，上生产前要仔细测试。这一节跟着视频的顺序认识这 5 个组件，和视频一样用 FAISS 向量库，十来行代码搭出一个检索器；第 48 节会把它接进 LCEL 链，做成完整的 RAG。",
    "en": "LangChain turns the first half of RAG – loading, splitting, embedding, storing in a vector store and retrieving – into components with one shared interface. The video spends just 4 minutes on it; the instructor openly calls this part rough and full of pitfalls – worth knowing, but test carefully before production. Following the video's order, this lesson introduces the five components and, like the video, uses a FAISS vector store to build a retriever in about ten lines; lesson 48 plugs it into an LCEL chain for a complete RAG pipeline."
  },
  "goals": [
    {
      "zh": "说出 RAG 建库和检索的 5 个步骤，以及每一步在 LangChain 里对应的组件",
      "en": "Name the 5 steps of building and searching a RAG index and the LangChain component for each"
    },
    {
      "zh": "用 `PyPDFLoader` / `TextLoader` 加载文档，知道 `Document` 的 `page_content` 和 `metadata`",
      "en": "Load files with `PyPDFLoader` / `TextLoader` and know a `Document`'s `page_content` and `metadata`"
    },
    {
      "zh": "理解 `chunk_size` 和 `chunk_overlap`，会用 `RecursiveCharacterTextSplitter` 切分中文",
      "en": "Understand `chunk_size` and `chunk_overlap` and split Chinese text with `RecursiveCharacterTextSplitter`"
    },
    {
      "zh": "用本地向量模型和 `FAISS.from_documents` 建库，用 `as_retriever(search_kwargs={\"k\": 3})` 检索",
      "en": "Build a store with a local embedding model and `FAISS.from_documents`, then search with `as_retriever(search_kwargs={\"k\": 3})`"
    },
    {
      "zh": "知道检索器也用 `.invoke()` 调用，这是它能接进 LCEL 链的原因",
      "en": "Know that a retriever is also called with `.invoke()` – which is why it fits into LCEL chains"
    }
  ],
  "blocks": [
    {
      "t": "h",
      "zh": "一、这一节在讲什么",
      "en": "1. What this lesson is about"
    },
    {
      "t": "p",
      "zh": "[▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=47&t=1) 第 17 节我们跟着视频做过一遍 RAG：按行切块、用本地向量模型算向量、存进 Chroma，再按余弦相似度取出最相关的几块。LangChain 把这些步骤都封装成了现成的组件，而且同一类组件用法都一样，换一个厂商、换一个数据库通常只改一行：\n\n| 步骤 | 做什么 | LangChain 里叫 | 本节用的类 |\n|---|---|---|---|\n| 1. 加载 | 把 PDF、txt、网页读成文字 | Document Loaders | `PyPDFLoader`、`TextLoader` |\n| 2. 切分 | 长文本切成小块 | Text Splitters | `RecursiveCharacterTextSplitter` |\n| 3. 向量化 | 每块文字变成一串数字 | Embeddings | `FastEmbedEmbeddings`（本地） |\n| 4. 灌库 | 向量和原文一起存起来 | Vector Stores | `FAISS`（和视频一样） |\n| 5. 检索 | 找出和问题最像的几块 | Retrievers | `db.as_retriever()` |",
      "en": "[▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=47&t=1) In lesson 17 we built RAG along with the video: split by line, embed with a local model, store in Chroma and fetch the closest chunks by cosine similarity. LangChain packages each step as a ready-made component, and every component of a kind is used the same way, so changing vendor or database usually means changing one line:\n\n| Step | What it does | LangChain name | Class used here |\n|---|---|---|---|\n| 1. Load | Read PDFs, text files, web pages into text | Document Loaders | `PyPDFLoader`, `TextLoader` |\n| 2. Split | Cut long text into chunks | Text Splitters | `RecursiveCharacterTextSplitter` |\n| 3. Embed | Turn each chunk into a list of numbers | Embeddings | `FastEmbedEmbeddings` (local) |\n| 4. Store | Keep vectors together with the text | Vector Stores | `FAISS` (as in the video) |\n| 5. Retrieve | Find the chunks closest to a question | Retrievers | `db.as_retriever()` |"
    },
    {
      "t": "video",
      "zh": "这一集只有 4 分钟，是对 LangChain「数据连接」部分的快速浏览（据 B 站自动字幕）：\n- [▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=47&t=1) 开场就说明：这部分 LangChain 做得不如 LlamaIndex 精细，没什么非用不可的亮点，所以只做简介，知道有这些东西就行\n- [▶ 00:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=47&t=31) 文档加载器：把一篇 Llama 2 论文的 PDF 加载成文本，每一页变成一段\n- [▶ 01:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=47&t=62) 文本切分：可以自定义块的长度和重叠长度；切分器有按 token、按字符、按句子等很多种，只演示了按字符切的那种，其他的给了文档链接让大家自学\n- [▶ 01:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=47&t=94) 向量模型和向量库：和大模型一样做了统一封装；演示用 OpenAI 的向量模型，把文档灌进最基础的 FAISS，并说换成 Chroma 之类接口也一样\n- [▶ 02:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=47&t=156) 检索：把向量库当检索器用，指定返回 3 条，同样用 `invoke` 查询「Llama 2 有多少参数」，拿回 3 段相关的文字\n- [▶ 03:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=47&t=187) 最后提醒：这部分比较粗糙、小环节里坑多，不建议直接用；非用不可的话，要详细测试后再上生产",
      "en": "This 4-minute episode is a quick tour of LangChain's “data connection” part (per Bilibili's auto-generated subtitles):\n- [▶ 00:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=47&t=1) Up front: LangChain is less polished here than LlamaIndex, with nothing you can't live without, so this is only an overview – just know these pieces exist\n- [▶ 00:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=47&t=31) Document loaders: load the Llama 2 paper as a PDF into text, one piece per page\n- [▶ 01:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=47&t=62) Text splitting: you choose the chunk length and the overlap; there are many splitters (by token, by character, by sentence…), and only the character-based one is shown, with doc links for the rest to study on your own\n- [▶ 01:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=47&t=94) Embeddings and vector stores: wrapped behind one interface, just like chat models; the demo embeds with an OpenAI model into the most basic store, FAISS, noting that Chroma and others work the same way\n- [▶ 02:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=47&t=156) Retrieval: use the vector store as a retriever returning 3 results, query it with `invoke` as usual (“how many parameters does Llama 2 have”) and get 3 relevant passages back\n- [▶ 03:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=47&t=187) Closing warning: this part is rough with many small pitfalls; avoid using it directly, and if you must, test it thoroughly before production"
    },
    {
      "t": "tip",
      "zh": "本课的流程和视频一样，只换了两样东西：\n- **向量模型**：视频用 OpenAI 的向量模型。DeepSeek 没有向量接口，本课改用本地的 `BAAI/bge-small-zh-v1.5`（fastembed，不需要 key，第一次运行下载约 90 MB 到项目的 `.cache` 文件夹）。\n- **资料**：视频用 Llama 2 论文；本课用一份虚构的《青松大模型技术报告》（`practice/data/l46_qingsong_report.md`，另有两页的英文 PDF 版）。里面的数字都是编的，这样到第 48 节就能确认：模型答对了，靠的是检索，而不是它本来就知道。\n\n向量库和视频一样用 FAISS（课程环境已装好 `faiss-cpu`）。",
      "en": "The flow is the same as the video's; only two things change:\n- **Embedding model**: the video uses an OpenAI embedding model. DeepSeek has no embeddings API, so we use the local `BAAI/bge-small-zh-v1.5` (fastembed, no key; about 90 MB downloaded to the project's `.cache` folder on first run).\n- **Material**: instead of the Llama 2 paper, a fictional “Qingsong LLM technical report” (`practice/data/l46_qingsong_report.md`, plus a two-page English PDF). Its numbers are made up, so in lesson 48 you can be sure a correct answer came from retrieval, not from what the model already knew.\n\nThe vector store is FAISS, as in the video (`faiss-cpu` is installed in the course environment)."
    },
    {
      "t": "h",
      "zh": "二、文档加载器：一切先变成 Document",
      "en": "2. Document loaders: everything becomes a Document"
    },
    {
      "t": "p",
      "zh": "[▶ 00:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=47&t=31) 加载器负责把各种格式的文件读进来，统一变成 **`Document` 对象的列表**。`Document` 常用的只有两个属性：\n- `page_content`：文字内容（字符串）\n- `metadata`：一个字典，记录来源文件、页码等信息，检索出来以后可以告诉用户「出自哪一页」\n\n和视频里一样，PDF 加载器默认**一页一个** `Document`；txt / md 文件则是整个文件一个 `Document`。",
      "en": "[▶ 00:31](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=47&t=31) A loader reads a file of some format and returns a **list of `Document` objects**. A `Document` has two attributes you'll use:\n- `page_content`: the text (a string)\n- `metadata`: a dict with the source file, page number and so on – handy for telling users “this came from page 3”\n\nAs in the video, the PDF loader returns **one `Document` per page** by default; a txt / md file becomes a single `Document`."
    },
    {
      "t": "code",
      "file": "load_docs.py",
      "code": {
        "zh": "# 在 practice 文件夹里运行（相对路径 data/... 才找得到文件）\nfrom langchain_community.document_loaders import PyPDFLoader, TextLoader\n\n# PDF：默认一页一个 Document\npages = PyPDFLoader(\"data/l46_qingsong_report.pdf\").load()\nprint(len(pages))                     # 2\nprint(pages[0].metadata[\"page\"])      # 0（页码从 0 开始）\nprint(pages[0].page_content[:40])     # 第一页的文字\n\n# txt / md：整个文件是一个 Document\ndocs = TextLoader(\"data/l46_qingsong_report.md\", encoding=\"utf-8\").load()\nprint(len(docs))                      # 1\nprint(docs[0].metadata)               # {'source': 'data/l46_qingsong_report.md'}",
        "en": "# Run from the practice folder (so the relative path data/... resolves)\nfrom langchain_community.document_loaders import PyPDFLoader, TextLoader\n\n# PDF: one Document per page by default\npages = PyPDFLoader(\"data/l46_qingsong_report.pdf\").load()\nprint(len(pages))                     # 2\nprint(pages[0].metadata[\"page\"])      # 0 (pages count from 0)\nprint(pages[0].page_content[:40])     # text of the first page\n\n# txt / md: the whole file is one Document\ndocs = TextLoader(\"data/l46_qingsong_report.md\", encoding=\"utf-8\").load()\nprint(len(docs))                      # 1\nprint(docs[0].metadata)               # {'source': 'data/l46_qingsong_report.md'}"
      },
      "note": {
        "zh": "`PyPDFLoader` 依赖 `pypdf`（已安装）。LangChain 还有别的 PDF 加载器，比如依赖 `pymupdf` 的 `PyMuPDFLoader`，课程环境没装；如果你在视频里看到的是别的加载器，换成 `PyPDFLoader` 即可，用法相同。运行时可能会看到 `langchain-community is being sunset` 的提示：这个包已不再积极维护，但目前照常可用。",
        "en": "`PyPDFLoader` needs `pypdf` (installed). LangChain has other PDF loaders, such as `PyMuPDFLoader`, which needs `pymupdf` – not installed here; if the video shows a different loader, `PyPDFLoader` is a drop-in replacement. You may see a `langchain-community is being sunset` notice: the package is no longer actively maintained but still works."
      }
    },
    {
      "t": "warn",
      "zh": "Windows 上加载中文 txt / md 文件，一定要写 `encoding=\"utf-8\"`。不写的话 `TextLoader` 会用系统默认编码（GBK）去读，报 `RuntimeError: Error loading data/...`，往上翻报错信息能看到真正的原因是 `UnicodeDecodeError`。",
      "en": "On Windows, always pass `encoding=\"utf-8\"` when loading Chinese txt / md files. Without it `TextLoader` reads with the system default encoding (GBK) and fails with `RuntimeError: Error loading data/...`; scroll up the traceback and the real cause is a `UnicodeDecodeError`."
    },
    {
      "t": "check",
      "q": {
        "zh": "用 `PyPDFLoader` 加载一个 10 页的 PDF，默认得到什么？",
        "en": "Loading a 10-page PDF with `PyPDFLoader` gives you, by default…"
      },
      "options": [
        {
          "zh": "1 个 Document，里面是全部文字",
          "en": "1 Document holding all the text"
        },
        {
          "zh": "10 个 Document，每页一个，页码在 metadata 里",
          "en": "10 Documents, one per page, with the page number in metadata"
        },
        {
          "zh": "10 个字符串",
          "en": "10 plain strings"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "PDF 加载器默认按页拆分，每页一个 `Document`，`metadata[\"page\"]` 记录页码（从 0 开始）。",
        "en": "The PDF loader splits by page: one `Document` each, with `metadata[\"page\"]` holding the page number (from 0)."
      }
    },
    {
      "t": "h",
      "zh": "三、文本切分：chunk_size 和 chunk_overlap",
      "en": "3. Splitting text: chunk_size and chunk_overlap"
    },
    {
      "t": "p",
      "zh": "[▶ 01:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=47&t=62) 为什么要切？一整篇文档算成一个向量，意思会被「平均」掉，检索不准；而且命中以后要把整篇塞进提示词，又长又贵。所以先切成小块，每块单独算向量。\n\n切分器有两个最重要的参数，视频里提到的也正是这两个：\n- `chunk_size`：每块最长多少（默认用 `len` 数**字符**）\n- `chunk_overlap`：相邻两块重叠多少。一句话正好被切在两块的边界上时，重叠能让它在其中一块里保持完整\n\nLangChain 的切分器有很多种（按 token、按字符、按句子……），视频只演示了按字符切的，其他的用法都差不多。先用纯 Python 看看「带重叠的切分」到底在做什么：",
      "en": "[▶ 01:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=47&t=62) Why split? One vector for a whole document “averages away” its meaning, so search gets fuzzy; and a hit would put the whole document into the prompt – long and expensive. So we cut it into chunks and embed each one.\n\nA splitter has two key parameters – exactly the two the video mentions:\n- `chunk_size`: the maximum length of a chunk (counted in **characters** with `len` by default)\n- `chunk_overlap`: how much neighbouring chunks share. When a sentence lands on a boundary, the overlap keeps it whole in one of the chunks\n\nLangChain has many splitters (by token, by character, by sentence…); the video shows only the character-based one, and the others are used much the same way. First, plain Python to see what “splitting with overlap” really does:"
    },
    {
      "t": "py",
      "title": {
        "zh": "range 的步长和字符串切片：自己写一个带重叠的切分",
        "en": "range with a step, and string slicing: a hand-made overlapping splitter"
      },
      "zh": "`range(start, stop, step)` 从 `start` 开始、每次加 `step`，一直到 `stop` 之前为止：`range(0, 50, 15)` 依次给出 0、15、30、45。\n\n字符串也能像列表一样切片（回顾 06 节）：`text[a:b]` 取第 `a` 到第 `b-1` 个字。把两者组合：每次往后走 `chunk_size - overlap` 个字，取 `chunk_size` 个字，相邻两块就自然重叠了 `overlap` 个字。（打印时的 `{start:>2}` 让数字右对齐、占两格，只为了排得整齐，回顾 14 节。）",
      "en": "`range(start, stop, step)` starts at `start`, adds `step` each time and stops before `stop`: `range(0, 50, 15)` gives 0, 15, 30, 45.\n\nStrings slice just like lists (see lesson 06): `text[a:b]` takes characters `a` to `b-1`. Combine the two: move forward `chunk_size - overlap` characters each time and take `chunk_size` characters, and neighbouring chunks automatically share `overlap` characters. (The `{start:>2}` in the print right-aligns the number in a two-character column, purely to keep things tidy; see lesson 14.)",
      "code": {
        "zh": "text = \"青松一共发布了三个尺寸：3B、14B 和 72B。三个尺寸共用一个分词器。最小的 3B 版本面向手机。\"\nchunk_size = 20        # 每块最多 20 个字\noverlap = 5            # 相邻两块重叠 5 个字\nstep = chunk_size - overlap\n\nprint(\"range 生成的起点：\", list(range(0, len(text), step)))\nfor start in range(0, len(text), step):\n    piece = text[start:start + chunk_size]      # 字符串切片，和列表切片一样\n    print(f\"[{start:>2}] {piece}\")\n    if start + chunk_size >= len(text):         # 已经切到结尾，停\n        break",
        "en": "text = \"Qingsong ships three sizes: 3B, 14B and 72B. All share one tokenizer. The 3B one targets phones.\"\nchunk_size = 20        # at most 20 characters per chunk\noverlap = 5            # neighbouring chunks share 5 characters\nstep = chunk_size - overlap\n\nprint(\"start positions from range:\", list(range(0, len(text), step)))\nfor start in range(0, len(text), step):\n    piece = text[start:start + chunk_size]      # string slicing, just like list slicing\n    print(f\"[{start:>2}] {piece}\")\n    if start + chunk_size >= len(text):         # reached the end - stop\n        break"
      },
      "note": {
        "zh": "真正的切分器更聪明：它**优先在分隔符处断开**（段落 → 换行 → 句号……），实在太长才会在字中间切。下面就来看。",
        "en": "Real splitters are smarter: they **prefer to cut at separators** (paragraph → line → full stop…) and only cut mid-word when a piece is still too long. See below."
      }
    },
    {
      "t": "code",
      "file": "split_docs.py",
      "code": {
        "zh": "from langchain_text_splitters import RecursiveCharacterTextSplitter\n\nsplitter = RecursiveCharacterTextSplitter(\n    chunk_size=150,      # 每块最多 150 个字符\n    chunk_overlap=30,    # 相邻两块最多重叠 30 个字符\n    separators=[\"\\n\\n\", \"\\n\", \"。\", \"！\", \"？\", \"，\", \"\"],   # 依次尝试的切分点\n    keep_separator=\"end\",                                     # 「。」留在句子末尾\n)\nchunks = splitter.split_documents(docs)   # Document 列表 → 更小的 Document 列表\nprint(len(chunks))                        # 8\nprint(chunks[1].page_content)             # ## 二、模型规模 …… 参数量分别约为 30 亿、140 亿和 720 亿……\nprint(chunks[1].metadata)                 # 继承原文档的 metadata：{'source': ...}",
        "en": "from langchain_text_splitters import RecursiveCharacterTextSplitter\n\nsplitter = RecursiveCharacterTextSplitter(\n    chunk_size=150,      # at most 150 characters per chunk\n    chunk_overlap=30,    # neighbouring chunks share up to 30 characters\n    separators=[\"\\n\\n\", \"\\n\", \"。\", \"！\", \"？\", \"，\", \"\"],   # split points, tried in order\n    keep_separator=\"end\",                                     # keep \"。\" at the end of the sentence\n)\nchunks = splitter.split_documents(docs)   # list of Documents -> list of smaller Documents\nprint(len(chunks))                        # 8\nprint(chunks[1].page_content)             # ## 二、模型规模 ... 参数量分别约为 30 亿、140 亿和 720 亿... (model sizes: ~3B, 14B, 72B)\nprint(chunks[1].metadata)                 # inherits the source metadata: {'source': ...}"
      }
    },
    {
      "t": "p",
      "zh": "**Recursive（递归）** 的意思是：按 `separators` 的顺序一层层尝试。先按空行（段落）切；某段还是太长，就按换行切；还长，就按句号切……最后一招 `\"\"` 是按单个字符切。\n\n默认的分隔符是 `[\"\\n\\n\", \"\\n\", \" \", \"\"]`，是为英文设计的：英文单词之间有空格。中文没有空格，不加中文标点的话，切分点会落在奇怪的地方。同一段话对比一下：",
      "en": "**Recursive** means it tries `separators` in order: first blank lines (paragraphs); if a piece is still too long, line breaks; then full stops… The last resort `\"\"` cuts between single characters.\n\nThe default separators are `[\"\\n\\n\", \"\\n\", \" \", \"\"]`, designed for English, where words are separated by spaces. Chinese has no spaces between words, so without Chinese punctuation the cuts land in odd places. Compare on the same text:"
    },
    {
      "t": "code",
      "file": "separators.py",
      "code": {
        "zh": "from langchain_text_splitters import RecursiveCharacterTextSplitter\n\ntext = \"青松一共发布了三个尺寸：青松-3B、青松-14B 和青松-72B，参数量分别约为 30 亿、140 亿和 720 亿。三个尺寸使用相同的分词器，词表大小为 15 万。\"\n\ndefault = RecursiveCharacterTextSplitter(chunk_size=40, chunk_overlap=10)\nprint(default.split_text(text))\n# ['青松一共发布了三个尺寸：青松-3B、青松-14B 和青松-72B，参数量分别约为',\n#  '30 亿、140 亿和 720 亿。三个尺寸使用相同的分词器，词表大小为 15',\n#  '15 万。']                         ← 在空格处断开，「30 亿」「15 万」被拆散\n\nchinese = RecursiveCharacterTextSplitter(chunk_size=40, chunk_overlap=10,\n                                         separators=[\"\\n\\n\", \"\\n\", \"。\", \"，\", \"\"], keep_separator=\"end\")\nprint(chinese.split_text(text))\n# ['青松一共发布了三个尺寸：青松-3B、青松-14B 和青松-72B，',\n#  '参数量分别约为 30 亿、140 亿和 720 亿。',\n#  '三个尺寸使用相同的分词器，词表大小为 15 万。']   ← 在标点处断开，每块都是完整的句子",
        "en": "from langchain_text_splitters import RecursiveCharacterTextSplitter\n\ntext = \"青松一共发布了三个尺寸：青松-3B、青松-14B 和青松-72B，参数量分别约为 30 亿、140 亿和 720 亿。三个尺寸使用相同的分词器，词表大小为 15 万。\"\n\ndefault = RecursiveCharacterTextSplitter(chunk_size=40, chunk_overlap=10)\nprint(default.split_text(text))\n# ['青松一共发布了三个尺寸：青松-3B、青松-14B 和青松-72B，参数量分别约为',\n#  '30 亿、140 亿和 720 亿。三个尺寸使用相同的分词器，词表大小为 15',\n#  '15 万。']                         <- cut at spaces: \"30 亿\" and \"15 万\" are torn apart\n\nchinese = RecursiveCharacterTextSplitter(chunk_size=40, chunk_overlap=10,\n                                         separators=[\"\\n\\n\", \"\\n\", \"。\", \"，\", \"\"], keep_separator=\"end\")\nprint(chinese.split_text(text))\n# ['青松一共发布了三个尺寸：青松-3B、青松-14B 和青松-72B，',\n#  '参数量分别约为 30 亿、140 亿和 720 亿。',\n#  '三个尺寸使用相同的分词器，词表大小为 15 万。']   <- cut at punctuation: whole sentences"
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "`chunk_overlap=30` 的作用是？",
        "en": "What does `chunk_overlap=30` do?"
      },
      "options": [
        {
          "zh": "每块最多 30 个字符",
          "en": "Each chunk has at most 30 characters"
        },
        {
          "zh": "最多切出 30 块",
          "en": "At most 30 chunks are produced"
        },
        {
          "zh": "相邻两块最多共享 30 个字符，避免一句话被切断后两边都不完整",
          "en": "Neighbouring chunks share up to 30 characters, so a sentence cut at a boundary stays whole on one side"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "块的最大长度由 `chunk_size` 决定；`chunk_overlap` 决定相邻两块重叠的长度。",
        "en": "`chunk_size` sets the maximum length; `chunk_overlap` sets how much neighbouring chunks overlap."
      }
    },
    {
      "t": "h",
      "zh": "四、向量模型和向量库",
      "en": "4. Embedding models and vector stores"
    },
    {
      "t": "p",
      "zh": "[▶ 01:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=47&t=94) 视频说，LangChain 对向量模型和向量库也做了统一封装。\n\n**向量模型（Embeddings）** 和第 45 节的聊天模型一样，不管是哪家的，都只有两个常用方法：\n- `embed_documents(文本列表)`：一批文字 → 一批向量（建库时用）\n- `embed_query(问题)`：一个问题 → 一个向量（检索时用）\n\n**向量库（Vector Store）** 把「向量 + 原文 Document」存在一起，给它一个问题，它找出最接近的几条。`FAISS.from_documents(chunks, embeddings)` 一步完成「向量化 + 灌库」。视频用的就是最基础的 FAISS，并提到换成 Chroma 等其他向量库，接口也一样。",
      "en": "[▶ 01:34](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=47&t=94) The video points out that LangChain also wraps embedding models and vector stores behind shared interfaces.\n\n**Embedding models** work like the chat models in lesson 45: whatever the vendor, two methods matter:\n- `embed_documents(list_of_texts)`: many texts → many vectors (when building the store)\n- `embed_query(question)`: one question → one vector (when searching)\n\nA **vector store** keeps “vector + original Document” pairs; give it a question and it finds the closest ones. `FAISS.from_documents(chunks, embeddings)` embeds and stores in one step. The video uses the most basic store, FAISS, and notes that Chroma and other stores share the interface."
    },
    {
      "t": "code",
      "file": "embed_and_store.py",
      "code": {
        "zh": "import os\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"HF_HOME\", os.path.join(PROJECT_DIR, \".cache\", \"hf\"))      # 缓存放进项目的 .cache\n\nfrom langchain_community.embeddings import FastEmbedEmbeddings\nfrom langchain_community.vectorstores import FAISS\n\nembeddings = FastEmbedEmbeddings(\n    model_name=\"BAAI/bge-small-zh-v1.5\",              # 本地中文向量模型，约 90 MB\n    cache_dir=os.path.join(PROJECT_DIR, \".cache\", \"fastembed\"),   # 模型文件放进项目的 .cache\n)\nvector = embeddings.embed_query(\"青松模型有多少参数？\")\nprint(len(vector))            # 512：一句话变成 512 个数字\n\ndb = FAISS.from_documents(chunks, embeddings)   # 向量化 + 灌库，一步完成（和视频一样用 FAISS）\nfor doc, score in db.similarity_search_with_score(\"青松模型有多少参数？\", k=2):\n    print(round(float(score), 3), doc.page_content.splitlines()[0])   # 分数 + 这一块的第一行\n# 0.615 ## 二、模型规模\n# 0.662 # 青松大模型技术报告（虚构资料，仅供练习）",
        "en": "import os\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"HF_HOME\", os.path.join(PROJECT_DIR, \".cache\", \"hf\"))      # caches in the project's .cache\n\nfrom langchain_community.embeddings import FastEmbedEmbeddings\nfrom langchain_community.vectorstores import FAISS\n\nembeddings = FastEmbedEmbeddings(\n    model_name=\"BAAI/bge-small-zh-v1.5\",              # local Chinese embedding model, ~90 MB\n    cache_dir=os.path.join(PROJECT_DIR, \".cache\", \"fastembed\"),   # model files in the project's .cache\n)\nvector = embeddings.embed_query(\"青松模型有多少参数？\")\nprint(len(vector))            # 512: one sentence becomes 512 numbers\n\ndb = FAISS.from_documents(chunks, embeddings)   # embed + store in one step (FAISS, as in the video)\nfor doc, score in db.similarity_search_with_score(\"青松模型有多少参数？\", k=2):\n    print(round(float(score), 3), doc.page_content.splitlines()[0])   # score + the chunk's first line\n# 0.615 ## 二、模型规模                          (model sizes)\n# 0.662 # 青松大模型技术报告（虚构资料，仅供练习）  (report title)"
      },
      "note": {
        "zh": "注意分数的含义：FAISS 默认返回的是**距离**（L2 距离的平方），**越小越像**。如果换成 `langchain_core` 自带的 `InMemoryVectorStore`（`InMemoryVectorStore.from_documents(chunks, embeddings)`，不需要额外安装任何包），返回的是余弦相似度，**越大越像**——换库只改一行，但分数的读法不同。FAISS 存在内存里，程序结束就没了；要保存到磁盘可以用 `db.save_local(\"文件夹\")`。",
        "en": "Mind what the score means: FAISS returns a **distance** by default (squared L2), so **smaller means more similar**. Swap in `InMemoryVectorStore` from `langchain_core` (`InMemoryVectorStore.from_documents(chunks, embeddings)`, nothing extra to install) and you get cosine similarity, where **larger means more similar** – switching stores changes one line, but you read the scores differently. FAISS lives in memory and disappears when the program ends; `db.save_local(\"folder\")` saves it to disk."
      }
    },
    {
      "t": "video",
      "zh": "视频的向量模型是 OpenAI 的（具体型号字幕里没说），写法大致如下，仅作对照（需要 OpenAI key，课程环境不运行）。如果你申请了阿里云百炼的 key，也可以用百炼的向量模型：",
      "en": "The video's embedding model is OpenAI's (the subtitles don't name the exact model). Roughly like this – for comparison only (it needs an OpenAI key, so it isn't run here). With an Alibaba Cloud Bailian key you could use Bailian's embeddings instead:"
    },
    {
      "t": "code",
      "file": "video_style_reference.py",
      "code": {
        "zh": "# 参考：视频那样用 OpenAI 的向量模型（这里不运行：需要 OpenAI 的 key）\nfrom langchain_openai import OpenAIEmbeddings\nfrom langchain_community.vectorstores import FAISS\n\n# 型号只是举例（字幕没说视频用的是哪一个）；需要 OPENAI_API_KEY\nembeddings = OpenAIEmbeddings(model=\"text-embedding-3-small\")\ndb = FAISS.from_documents(chunks, embeddings)                   # 这一行和本课完全一样\n\n# 想用阿里云百炼的向量模型：dashscope 包已经装好，只缺 DASHSCOPE_API_KEY\nfrom langchain_community.embeddings import DashScopeEmbeddings\nembeddings = DashScopeEmbeddings(model=\"text-embedding-v3\")",
        "en": "# Reference: an OpenAI embedding model, as in the video (not run here: needs an OpenAI key)\nfrom langchain_openai import OpenAIEmbeddings\nfrom langchain_community.vectorstores import FAISS\n\n# The model name is just an example (the subtitles don't say which one the video used); needs OPENAI_API_KEY\nembeddings = OpenAIEmbeddings(model=\"text-embedding-3-small\")\ndb = FAISS.from_documents(chunks, embeddings)                   # exactly the same line as in this lesson\n\n# To use Alibaba Cloud Bailian embeddings: the dashscope package is installed; only DASHSCOPE_API_KEY is missing\nfrom langchain_community.embeddings import DashScopeEmbeddings\nembeddings = DashScopeEmbeddings(model=\"text-embedding-v3\")"
      }
    },
    {
      "t": "warn",
      "zh": "不要写 `OpenAIEmbeddings(base_url=\"https://api.deepseek.com\", ...)`：DeepSeek **没有**向量接口，请求会失败。向量模型和聊天模型是两回事，可以分开选——聊天用 DeepSeek，向量用本地模型，完全没问题。",
      "en": "Don't write `OpenAIEmbeddings(base_url=\"https://api.deepseek.com\", ...)`: DeepSeek has **no** embeddings endpoint, so the request fails. Embedding and chat models are separate choices – chatting with DeepSeek while embedding locally is perfectly fine."
    },
    {
      "t": "h",
      "zh": "五、检索器：也用 invoke 调用",
      "en": "5. Retrievers: also called with invoke"
    },
    {
      "t": "p",
      "zh": "[▶ 02:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=47&t=156) 和视频一样，`db.as_retriever(search_kwargs={\"k\": 3})` 把向量库包装成**检索器**，以后只管 `.invoke(问题)`，得到一个 `Document` 列表。\n\n注意这个 `.invoke()`：模型、提示词模板、输出解析器、检索器都用同一个方法名调用（第 44 节说的「统一接口」）。正因为接口一样，第 48 节才能用 `|` 把检索器、提示词、模型串成一条 RAG 链。",
      "en": "[▶ 02:36](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=47&t=156) As in the video, `db.as_retriever(search_kwargs={\"k\": 3})` wraps the store as a **retriever**; from then on you just call `.invoke(question)` and get a list of `Document`s.\n\nNotice the `.invoke()`: models, prompt templates, output parsers and retrievers are all called the same way (the “common interface” from lesson 44). Because of that, lesson 48 can join a retriever, a prompt and a model into one RAG chain with `|`."
    },
    {
      "t": "code",
      "file": "retrieve.py",
      "code": {
        "zh": "retriever = db.as_retriever(search_kwargs={\"k\": 3})      # 每次返回最相似的 3 块\ndocs = retriever.invoke(\"青松模型有多少参数？\")            # 和调用模型一样用 invoke\nprint(type(docs).__name__, len(docs))                    # list 3\nfor d in docs:\n    print(d.page_content.splitlines()[0])                # 只打印每块的第一行（标题）\n# ## 二、模型规模\n# # 青松大模型技术报告（虚构资料，仅供练习）\n# ## 五、对话版本",
        "en": "retriever = db.as_retriever(search_kwargs={\"k\": 3})      # return the 3 most similar chunks\ndocs = retriever.invoke(\"青松模型有多少参数？\")            # invoke, just like a model\nprint(type(docs).__name__, len(docs))                    # list 3\nfor d in docs:\n    print(d.page_content.splitlines()[0])                # print just each chunk's first line (its heading)\n# ## 二、模型规模                          (model sizes)\n# # 青松大模型技术报告（虚构资料，仅供练习）  (report title + overview)\n# ## 五、对话版本                          (chat version)"
      },
      "note": {
        "zh": "视频问的是「Llama 2 有多少参数」，拿回 3 段讲参数规模的文字；这里问虚构资料里的同一类问题，排第一的也正是「模型规模」那一块。练习文件 `practice/l46_retriever_solution.py` 把上面 5 步包成了函数 `build_retriever(k)`，第 48 节的 RAG 链直接导入它。这个文件不调用大模型，不需要 API key。",
        "en": "The video asks “how many parameters does Llama 2 have” and gets 3 passages about model sizes; here we ask the same kind of question about the fictional report, and the top hit is indeed the “model sizes” chunk. The practice file `practice/l46_retriever_solution.py` wraps these 5 steps in `build_retriever(k)`, which lesson 48's RAG chain imports. It calls no LLM and needs no API key."
      }
    },
    {
      "t": "check",
      "q": {
        "zh": "`retriever.invoke(\"青松模型有多少参数？\")` 返回的是？",
        "en": "What does `retriever.invoke(\"How many parameters does Qingsong have?\")` return?"
      },
      "options": [
        {
          "zh": "模型写好的回答（字符串）",
          "en": "The model's written answer (a string)"
        },
        {
          "zh": "一个向量",
          "en": "A vector"
        },
        {
          "zh": "最相关的几块资料：一个 `Document` 列表",
          "en": "The most relevant chunks: a list of `Document`s"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "检索器只负责「找资料」，不调用大模型。把资料交给模型写回答，是第 48 节 RAG 链要做的事。",
        "en": "A retriever only finds material; it doesn't call an LLM. Handing the material to a model for an answer is the job of lesson 48's RAG chain."
      }
    },
    {
      "t": "h",
      "zh": "六、讲师的提醒：这部分别直接上生产",
      "en": "6. The instructor's warning: not production-ready as is"
    },
    {
      "t": "p",
      "zh": "[▶ 03:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=47&t=187) 视频最后讲师给了一个很实在的评价：这部分做得比较粗糙，各个小环节里坑也多，不建议直接拿来用；真要用在正式产品里，一定先详细测试。论精细程度，它比不上 LlamaIndex；而且数据连接也不是 LangChain 现在的重点——它更关心的是「和大模型打交道时，通用的工具应该怎么封装」。对检索质量要求高的场景，可以考虑 LlamaIndex 这类专门的工具，或者像第 17 节那样自己写，每一步都看得见、改得动。\n\n对你来说，这一节的目标很简单：**认识 5 个组件，知道它们都有统一的接口，能拼出一个检索器**。这已经足够做原型，也足够跟上第 48 节。",
      "en": "[▶ 03:07](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=47&t=187) The instructor closes with a candid assessment: this part is rough, with plenty of pitfalls in the small steps, so he doesn't recommend using it directly; if a real product needs it, test thoroughly first. It is less polished than LlamaIndex, and data connections aren't LangChain's focus these days anyway – it cares more about how general-purpose tools for working with LLMs should be wrapped. When retrieval quality matters, consider a dedicated tool such as LlamaIndex, or write it yourself as in lesson 17, where every step is visible and adjustable.\n\nFor you the goal of this lesson is simple: **know the 5 components, know they share one interface, and be able to assemble a retriever**. That's enough for prototypes and for keeping up with lesson 48."
    }
  ],
  "quiz": [
    {
      "q": {
        "zh": "下面哪一项**不是** RAG 建库和检索的步骤？",
        "en": "Which is **not** a step in building and searching a RAG index?"
      },
      "options": [
        {
          "zh": "加载文档",
          "en": "Loading documents"
        },
        {
          "zh": "切分文本",
          "en": "Splitting text"
        },
        {
          "zh": "微调大模型的参数",
          "en": "Fine-tuning the LLM's weights"
        },
        {
          "zh": "向量化并存进向量库",
          "en": "Embedding and storing in a vector store"
        }
      ],
      "answer": 2,
      "explain": {
        "zh": "RAG 不改模型本身，而是在提问时把检索到的资料放进提示词。五步是：加载、切分、向量化、灌库、检索。",
        "en": "RAG doesn't change the model; it puts retrieved material into the prompt at question time. The five steps: load, split, embed, store, retrieve."
      }
    },
    {
      "q": {
        "zh": "`RecursiveCharacterTextSplitter(chunk_size=150, chunk_overlap=30)` 的意思是？",
        "en": "What does `RecursiveCharacterTextSplitter(chunk_size=150, chunk_overlap=30)` mean?"
      },
      "options": [
        {
          "zh": "每块最多 150 个字符，相邻两块最多重叠 30 个字符",
          "en": "Chunks of at most 150 characters; neighbours overlap by up to 30"
        },
        {
          "zh": "每块正好 150 个字符，一共 30 块",
          "en": "Exactly 150 characters per chunk, 30 chunks in total"
        },
        {
          "zh": "每块最多 150 个 token，最多 30 块",
          "en": "At most 150 tokens per chunk, at most 30 chunks"
        },
        {
          "zh": "先取前 150 个字，再跳过 30 个字",
          "en": "Take 150 characters, then skip 30"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "`chunk_size` 是上限（默认用 `len` 数字符），`chunk_overlap` 是相邻块的重叠长度。块数取决于文档长度。",
        "en": "`chunk_size` is an upper limit (counted in characters with `len` by default), `chunk_overlap` is the overlap between neighbours. The number of chunks depends on the document."
      }
    },
    {
      "q": {
        "zh": "切分中文时，为什么要在 `separators` 里加上「。」「，」等中文标点？",
        "en": "Why add Chinese punctuation such as “。” and “，” to `separators` for Chinese text?"
      },
      "options": [
        {
          "zh": "能让切分更快",
          "en": "It makes splitting faster"
        },
        {
          "zh": "不加的话会报错",
          "en": "It raises an error otherwise"
        },
        {
          "zh": "能让向量变短",
          "en": "It makes the vectors shorter"
        },
        {
          "zh": "默认分隔符按空格切，是为英文设计的；中文没有空格，不加的话会在词语中间断开",
          "en": "The defaults cut at spaces, designed for English; Chinese has none, so cuts would land mid-phrase"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "默认是 `[\"\\n\\n\", \"\\n\", \" \", \"\"]`。加上中文标点后，切分会优先落在句子边界，每块意思更完整，检索也更准。",
        "en": "The default is `[\"\\n\\n\", \"\\n\", \" \", \"\"]`. With Chinese punctuation, cuts prefer sentence boundaries, so each chunk is more coherent and retrieval is more accurate."
      }
    },
    {
      "q": {
        "zh": "视频用 OpenAI 的向量模型，DeepSeek 又没有向量接口。本课是怎么解决的？",
        "en": "The video embeds with OpenAI, and DeepSeek has no embeddings API. How does this lesson get around that?"
      },
      "options": [
        {
          "zh": "用 DeepSeek 的聊天接口代替",
          "en": "Use DeepSeek's chat endpoint instead"
        },
        {
          "zh": "用本地向量模型（fastembed + bge-small-zh），不需要 key，向量库照样用 FAISS",
          "en": "Use a local embedding model (fastembed + bge-small-zh) with no key, still storing in FAISS"
        },
        {
          "zh": "不用向量，把整篇文档直接发给模型",
          "en": "Skip vectors and send the whole document to the model"
        },
        {
          "zh": "借用别人的 OpenAI key",
          "en": "Borrow someone's OpenAI key"
        }
      ],
      "answer": 1,
      "explain": {
        "zh": "向量模型和聊天模型是两回事，可以分开选。本地模型下载一次后离线可用；如果有百炼 key，也可以换成 `DashScopeEmbeddings`。",
        "en": "Embedding and chat models are separate choices. The local model works offline after one download; with a Bailian key you could switch to `DashScopeEmbeddings`."
      }
    },
    {
      "q": {
        "zh": "`db.similarity_search_with_score(...)` 用 FAISS 时返回的分数，怎么读？",
        "en": "How do you read the scores from `db.similarity_search_with_score(...)` with FAISS?"
      },
      "options": [
        {
          "zh": "是距离，越小越像",
          "en": "They are distances – smaller means more similar"
        },
        {
          "zh": "是余弦相似度，越大越像",
          "en": "They are cosine similarities – larger means more similar"
        },
        {
          "zh": "是百分比，满分 100",
          "en": "They are percentages out of 100"
        },
        {
          "zh": "是块的长度",
          "en": "They are chunk lengths"
        }
      ],
      "answer": 0,
      "explain": {
        "zh": "FAISS 默认给的是 L2 距离（的平方），越小越接近；`InMemoryVectorStore` 给的才是余弦相似度。换库时别把分数读反。",
        "en": "FAISS gives (squared) L2 distance by default – smaller is closer; `InMemoryVectorStore` gives cosine similarity. Don't read the scores backwards when you switch stores."
      }
    },
    {
      "q": {
        "zh": "讲师对 LangChain 数据连接这部分的建议是？",
        "en": "What does the instructor advise about LangChain's data-connection part?"
      },
      "options": [
        {
          "zh": "这是 LangChain 最强的部分，可以直接上生产",
          "en": "It's LangChain's strongest part – ship it as is"
        },
        {
          "zh": "完全不能用",
          "en": "It doesn't work at all"
        },
        {
          "zh": "必须先学 LlamaIndex 才能用",
          "en": "You must learn LlamaIndex first"
        },
        {
          "zh": "了解即可；比较粗糙、坑多，真要用的话先详细测试",
          "en": "Know it; it's rough with pitfalls, so test thoroughly if you really use it"
        }
      ],
      "answer": 3,
      "explain": {
        "zh": "讲师说这部分不如 LlamaIndex 精细，也不是 LangChain 的重点，生产使用前要详细测试。",
        "en": "He says it's less polished than LlamaIndex and not LangChain's focus, so test thoroughly before production use."
      }
    }
  ],
  "fill": [
    {
      "title": {
        "zh": "加载并切分",
        "en": "Load and split"
      },
      "code": "docs = TextLoader(\"data/l46_qingsong_report.md\", [[encoding]]=\"utf-8\").[[load]]()\nsplitter = RecursiveCharacterTextSplitter([[chunk_size]]=150, [[chunk_overlap]]=30)\nchunks = splitter.[[split_documents]](docs)\nprint(chunks[0].[[page_content]])",
      "explain": {
        "zh": "中文文件要指定编码；`chunk_size` 是块的上限，`chunk_overlap` 是重叠；`split_documents` 把 Document 列表切成更小的 Document 列表。",
        "en": "Give the encoding for Chinese files; `chunk_size` is the limit, `chunk_overlap` the overlap; `split_documents` turns Documents into smaller Documents."
      }
    },
    {
      "title": {
        "zh": "建库并检索",
        "en": "Store and retrieve"
      },
      "code": {
        "zh": "db = [[FAISS]].[[from_documents]](chunks, embeddings)\nretriever = db.[[as_retriever]](search_kwargs={\"[[k]]\": 3})\ndocs = retriever.[[invoke]](\"青松模型有多少参数？\")\nfor d in docs:\n    print(d.page_content, d.[[metadata]])",
        "en": "db = [[FAISS]].[[from_documents]](chunks, embeddings)\nretriever = db.[[as_retriever]](search_kwargs={\"[[k]]\": 3})\ndocs = retriever.[[invoke]](\"青松模型有多少参数？\")   # \"How many parameters does Qingsong have?\"\nfor d in docs:\n    print(d.page_content, d.[[metadata]])"
      },
      "explain": {
        "zh": "`FAISS.from_documents` 一步完成向量化和灌库；`as_retriever` 包装成检索器，`k` 是返回几块；检索器也用 `invoke` 调用。",
        "en": "`FAISS.from_documents` embeds and stores in one go; `as_retriever` wraps it, with `k` chunks per query; the retriever is called with `invoke` too."
      }
    }
  ],
  "write": [
    {
      "title": {
        "zh": "手写：五步搭出一个检索器",
        "en": "Write it: a retriever in five steps"
      },
      "task": {
        "zh": "不看上面的代码，按注释写出：加载 `data/l46_qingsong_report.md` → 切分（150 / 30，中文标点分隔）→ 本地向量模型 → FAISS 向量库 → 检索器（k=3），并用它查「青松模型有多少参数？」。\n\n这段代码不能在网页里运行；写完后对照 `practice/l46_retriever_solution.py`，在 `practice` 文件夹里用 `.venv` 运行（不需要 API key）。",
        "en": "Without looking above, follow the comments: load `data/l46_qingsong_report.md` → split (150 / 30, Chinese punctuation) → local embedding model → FAISS store → retriever (k=3), then ask “青松模型有多少参数？” (“How many parameters does Qingsong have?”).\n\nThis can't run in the browser; when you're done, compare with `practice/l46_retriever_solution.py` and run it with `.venv` from the `practice` folder (no API key needed)."
      },
      "starter": {
        "zh": "import os\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"HF_HOME\", os.path.join(PROJECT_DIR, \".cache\", \"hf\"))\n\nfrom langchain_community.document_loaders import TextLoader\nfrom langchain_community.embeddings import FastEmbedEmbeddings\nfrom langchain_community.vectorstores import FAISS\nfrom langchain_text_splitters import RecursiveCharacterTextSplitter\n\n# 1. 加载 data/l46_qingsong_report.md（中文文件，注意编码）\n\n# 2. 切分：每块最多 150 字、重叠 30 字，加上中文标点作为分隔符\n\n# 3. 向量模型：本地 BAAI/bge-small-zh-v1.5，模型文件放进项目的 .cache\n\n# 4. 灌库：FAISS 向量库\n\n# 5. 检索器：每次返回 3 块；用它查「青松模型有多少参数？」并打印每块的文字",
        "en": "import os\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"HF_HOME\", os.path.join(PROJECT_DIR, \".cache\", \"hf\"))\n\nfrom langchain_community.document_loaders import TextLoader\nfrom langchain_community.embeddings import FastEmbedEmbeddings\nfrom langchain_community.vectorstores import FAISS\nfrom langchain_text_splitters import RecursiveCharacterTextSplitter\n\n# 1. load data/l46_qingsong_report.md (a Chinese file - mind the encoding)\n\n# 2. split: at most 150 characters per chunk, 30 overlapping, Chinese punctuation as separators\n\n# 3. embedding model: local BAAI/bge-small-zh-v1.5, model files in the project's .cache\n\n# 4. store: a FAISS vector store\n\n# 5. retriever: 3 chunks per query; ask \"青松模型有多少参数？\" and print each chunk"
      },
      "solution": {
        "zh": "import os\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"HF_HOME\", os.path.join(PROJECT_DIR, \".cache\", \"hf\"))\n\nfrom langchain_community.document_loaders import TextLoader\nfrom langchain_community.embeddings import FastEmbedEmbeddings\nfrom langchain_community.vectorstores import FAISS\nfrom langchain_text_splitters import RecursiveCharacterTextSplitter\n\n# 1. 加载 data/l46_qingsong_report.md（中文文件，注意编码）\ndocs = TextLoader(\"data/l46_qingsong_report.md\", encoding=\"utf-8\").load()\n\n# 2. 切分：每块最多 150 字、重叠 30 字，加上中文标点作为分隔符\nsplitter = RecursiveCharacterTextSplitter(\n    chunk_size=150,\n    chunk_overlap=30,\n    separators=[\"\\n\\n\", \"\\n\", \"。\", \"！\", \"？\", \"，\", \"\"],\n    keep_separator=\"end\",\n)\nchunks = splitter.split_documents(docs)\n\n# 3. 向量模型：本地 BAAI/bge-small-zh-v1.5，模型文件放进项目的 .cache\nembeddings = FastEmbedEmbeddings(model_name=\"BAAI/bge-small-zh-v1.5\",\n                                 cache_dir=os.path.join(PROJECT_DIR, \".cache\", \"fastembed\"))\n\n# 4. 灌库：FAISS 向量库\ndb = FAISS.from_documents(chunks, embeddings)\n\n# 5. 检索器：每次返回 3 块；用它查「青松模型有多少参数？」并打印每块的文字\nretriever = db.as_retriever(search_kwargs={\"k\": 3})\nfor d in retriever.invoke(\"青松模型有多少参数？\"):\n    print(d.page_content)\n    print(\"---\")",
        "en": "import os\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"HF_HOME\", os.path.join(PROJECT_DIR, \".cache\", \"hf\"))\n\nfrom langchain_community.document_loaders import TextLoader\nfrom langchain_community.embeddings import FastEmbedEmbeddings\nfrom langchain_community.vectorstores import FAISS\nfrom langchain_text_splitters import RecursiveCharacterTextSplitter\n\n# 1. load data/l46_qingsong_report.md (a Chinese file - mind the encoding)\ndocs = TextLoader(\"data/l46_qingsong_report.md\", encoding=\"utf-8\").load()\n\n# 2. split: at most 150 characters per chunk, 30 overlapping, Chinese punctuation as separators\nsplitter = RecursiveCharacterTextSplitter(\n    chunk_size=150,\n    chunk_overlap=30,\n    separators=[\"\\n\\n\", \"\\n\", \"。\", \"！\", \"？\", \"，\", \"\"],\n    keep_separator=\"end\",\n)\nchunks = splitter.split_documents(docs)\n\n# 3. embedding model: local BAAI/bge-small-zh-v1.5, model files in the project's .cache\nembeddings = FastEmbedEmbeddings(model_name=\"BAAI/bge-small-zh-v1.5\",\n                                 cache_dir=os.path.join(PROJECT_DIR, \".cache\", \"fastembed\"))\n\n# 4. store: a FAISS vector store\ndb = FAISS.from_documents(chunks, embeddings)\n\n# 5. retriever: 3 chunks per query; ask \"青松模型有多少参数？\" and print each chunk\nretriever = db.as_retriever(search_kwargs={\"k\": 3})\nfor d in retriever.invoke(\"青松模型有多少参数？\"):\n    print(d.page_content)\n    print(\"---\")"
      },
      "checks": [
        {
          "zh": "用 `TextLoader` 加载，并写了 `encoding=\"utf-8\"`",
          "en": "Loads with `TextLoader` and `encoding=\"utf-8\"`",
          "re": "TextLoader\\(.*encoding\\s*=\\s*[\\\"']utf-8[\\\"']"
        },
        {
          "zh": "调用了 `.load()`",
          "en": "Calls `.load()`",
          "re": "\\.load\\(\\)"
        },
        {
          "zh": "创建切分器并设置 `chunk_size`",
          "en": "Creates the splitter with `chunk_size`",
          "re": "RecursiveCharacterTextSplitter\\([\\s\\S]*?chunk_size\\s*=\\s*\\d+"
        },
        {
          "zh": "设置了 `chunk_overlap`",
          "en": "Sets `chunk_overlap`",
          "re": "chunk_overlap\\s*=\\s*\\d+"
        },
        {
          "zh": "separators 里有中文句号",
          "en": "Has the Chinese full stop in separators",
          "re": "separators\\s*=\\s*\\[[^\\]]*。"
        },
        {
          "zh": "用 `split_documents` 切分",
          "en": "Splits with `split_documents`",
          "re": "\\.split_documents\\("
        },
        {
          "zh": "向量模型的 `cache_dir` 放在项目的 `.cache` 里",
          "en": "The embedding model's `cache_dir` is in the project's `.cache`",
          "re": "cache_dir\\s*=\\s*os\\.path\\.join\\(\\s*PROJECT_DIR"
        },
        {
          "zh": "用 `FAISS.from_documents` 建库",
          "en": "Builds the store with `FAISS.from_documents`",
          "re": "FAISS\\.from_documents\\("
        },
        {
          "zh": "`as_retriever(search_kwargs={\"k\": 3})`",
          "en": "`as_retriever(search_kwargs={\"k\": 3})`",
          "re": "as_retriever\\(\\s*search_kwargs\\s*=\\s*\\{\\s*[\\\"']k[\\\"']\\s*:\\s*3"
        },
        {
          "zh": "用检索器的 `invoke` 检索",
          "en": "Searches with the retriever's `invoke`",
          "re": "retriever\\.invoke\\("
        }
      ]
    }
  ],
  "pitfalls": [
    {
      "zh": "加载中文文件没写 `encoding=\"utf-8\"`，在 Windows 上报 `RuntimeError: Error loading ...`（根源是 `UnicodeDecodeError`）。",
      "en": "Loading a Chinese file without `encoding=\"utf-8\"` – `RuntimeError: Error loading ...` on Windows (caused by a `UnicodeDecodeError`)."
    },
    {
      "zh": "切中文时用默认分隔符，句子和数字被拦腰切断（如「30 亿」被拆成两半）。",
      "en": "Splitting Chinese with the default separators, so sentences and numbers (like “30 亿”, 3 billion) are torn in half."
    },
    {
      "zh": "`chunk_size` 设得太小：标题和正文被分到两块，检索命中的是只有标题的块。我们试过 120，「模型规模」的标题就单独成了一块。",
      "en": "Too small a `chunk_size`: a heading and its text land in different chunks and the search hits the heading-only chunk. At 120, the “model sizes” heading became a chunk of its own."
    },
    {
      "zh": "以为 DeepSeek 也有向量接口，把 `OpenAIEmbeddings` 指向 DeepSeek，结果请求失败。",
      "en": "Assuming DeepSeek has embeddings and pointing `OpenAIEmbeddings` at it – the request fails."
    },
    {
      "zh": "把 FAISS 的分数当成相似度：它是距离，越小越像；换成 `InMemoryVectorStore` 后才是越大越像。",
      "en": "Reading FAISS scores as similarities: they are distances (smaller is closer); only `InMemoryVectorStore` gives larger-is-closer scores."
    },
    {
      "zh": "`FastEmbedEmbeddings` 不传 `cache_dir`：模型会下载到临时目录，被清理后又要重新下载。本课统一放在项目的 `.cache\\fastembed`。",
      "en": "Leaving out `cache_dir` in `FastEmbedEmbeddings`: the model goes to the temp folder and is re-downloaded after a cleanup. This lesson keeps it in the project's `.cache\\fastembed`."
    }
  ],
  "recap": [
    {
      "zh": "RAG 建库和检索 5 步：加载 → 切分 → 向量化 → 灌库 → 检索，LangChain 每一步都有对应的组件。",
      "en": "RAG indexing and search in 5 steps: load → split → embed → store → retrieve; LangChain has a component for each."
    },
    {
      "zh": "加载器返回 `Document` 列表：`page_content` 是文字，`metadata` 记录来源和页码；PDF 默认一页一个。",
      "en": "Loaders return a list of `Document`s: `page_content` is the text, `metadata` holds source and page; PDFs give one per page."
    },
    {
      "zh": "`chunk_size` 是块的上限，`chunk_overlap` 是相邻块的重叠；中文要加中文标点作分隔符。",
      "en": "`chunk_size` caps a chunk, `chunk_overlap` is the overlap; add Chinese punctuation as separators for Chinese."
    },
    {
      "zh": "向量模型只有 `embed_documents` / `embed_query` 两个常用方法；`FAISS.from_documents` 一步建好向量库（FAISS 的分数是距离，越小越像）。",
      "en": "Embedding models have two key methods, `embed_documents` / `embed_query`; `FAISS.from_documents` builds the store in one step (FAISS scores are distances – smaller is closer)."
    },
    {
      "zh": "`as_retriever(search_kwargs={\"k\": 3})` 得到检索器，用 `.invoke(问题)` 拿回 `Document` 列表。",
      "en": "`as_retriever(search_kwargs={\"k\": 3})` gives a retriever; `.invoke(question)` returns a list of `Document`s."
    },
    {
      "zh": "讲师的建议：这部分了解即可，比 LlamaIndex 粗糙，上生产前要详细测试。",
      "en": "The instructor's advice: know this part; it's rougher than LlamaIndex, so test it thoroughly before production."
    }
  ],
  "files": [
    {
      "path": "practice/l46_retriever_todo.py",
      "zh": "练习：按 TODO 补全 `build_retriever`（加载 → 切分 → 向量化 → FAISS 灌库 → 检索器），不需要 API key。",
      "en": "Exercise: complete `build_retriever` (load → split → embed → store in FAISS → retriever) following the TODOs; no API key."
    },
    {
      "path": "practice/l46_retriever_solution.py",
      "zh": "参考答案；第 48 节的 RAG 链会导入这里的 `build_retriever`。",
      "en": "Solution; lesson 48's RAG chain imports its `build_retriever`."
    },
    {
      "path": "practice/l46_pdf_loader.py",
      "zh": "演示：和视频一样用 PDF 加载器按页加载，再切块（每块都记得来自哪一页）。",
      "en": "Demo: load a PDF page by page, as in the video, then split it (each chunk remembers its page)."
    },
    {
      "path": "practice/data/l46_qingsong_report.md",
      "zh": "练习资料：虚构的《青松大模型技术报告》（中文）。",
      "en": "Practice material: the fictional Qingsong LLM technical report (Chinese)."
    },
    {
      "path": "practice/data/l46_qingsong_report.pdf",
      "zh": "同一份资料的两页英文 PDF 版，给 `PyPDFLoader` 用。",
      "en": "A two-page English PDF version of the same report, for `PyPDFLoader`."
    }
  ]
});
