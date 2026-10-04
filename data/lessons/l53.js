COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };
COURSE.lesson({
 "id": "l53",
 "priority": "important",
 "handwrite": true,
 "studyMinutes": 55,
 "source": "subtitle",
 "summary": {
  "zh": "健康档案助手：在 52 节的基础上加入 RAG。「健康档案检索专家」用一个检索工具，从私有的健康档案库（一份 PDF，切块、向量化后存进 Chroma 向量数据库）里找出和医生问题相关的记录；「健康报告撰写专家」结合问题写出健康建议报告，再用 52 节的工具存成 PDF。视频的做法是：先把两个工具各自测通（存 PDF、灌库和检索），再用 `@tool` 包装，分别交给两个 Agent，跑完后拿原始档案核对检索结果。本节用 DeepSeek、本地向量模型和一份虚构的档案重做一遍。",
  "en": "Health-records assistant: lesson 52 plus RAG. A “Health Records Retrieval Expert” uses a retrieval tool to find the records related to a doctor's question in a private health-records store (one PDF, chunked, embedded and stored in the Chroma vector database); a “Health Report Writer” writes a health advice report that addresses the question and saves it as a PDF with the lesson 52 tool. The video first gets each tool working on its own (saving PDFs; indexing and retrieval), then wraps them with `@tool`, gives one to each agent, and after the run checks the retrieved results against the original records. This lesson redoes it with DeepSeek, a local embedding model and a set of fictional records."
 },
 "goals": [
  {
   "zh": "说出 RAG 的离线步骤（加载 → 切块 → 向量化 → 入库）和在线步骤（问题向量化 → 相似度检索 → 和问题一起交给模型）",
   "en": "Name the offline steps of RAG (load → chunk → embed → store) and the online steps (embed the question → similarity search → hand the results to the model together with the question)"
  },
  {
   "zh": "看懂向量库脚本：读 PDF 和选页码、Chroma 的数据库文件夹和集合、按批灌库、检索",
   "en": "Understand the vector-store script: reading a PDF and choosing pages, Chroma's database folder and collection, indexing in batches, retrieval"
  },
  {
   "zh": "用 `@tool` 把检索函数包装成工具、写清描述，交给检索专家；存 PDF 工具交给撰写专家",
   "en": "Wrap the retrieval function as a tool with `@tool`, write a clear description and give it to the retrieval expert; give the save-PDF tool to the report writer"
  },
  {
   "zh": "跑通「检索 → 写报告 → 存 PDF」，并像视频那样拿原始档案核对检索到的数据",
   "en": "Run “retrieve → write the report → save as PDF” end to end, and, as in the video, check the retrieved data against the original records"
  },
  {
   "zh": "知道健康数据的隐私风险，以及 AI 健康报告「仅供参考」的边界",
   "en": "Know the privacy risks of health data, and the limits of an AI health report: it is “for reference only”"
  }
 ],
 "blocks": [
  {
   "t": "h",
   "zh": "一、这一集讲什么",
   "en": "1. What this episode covers"
  },
  {
   "t": "video",
   "zh": "视频的内容和顺序（点时间可以直接跳到那一段）：\n- [▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=0) 案例介绍：一个 Agent 根据医生的问题去私有的健康档案库里检索，另一个据此分析并调用工具生成 PDF 报告；核心是在上一集的基础上加入 RAG\n- [▶ 01:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=61) RAG 回顾：离线步骤和在线步骤\n- [▶ 02:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=123) 两个 Agent、[▶ 03:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=215) 两个 Task 的定义\n- [▶ 04:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=277) 准备工作（回看 51、52 节），[▶ 05:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=339) 下载源码和中文字体，[▶ 06:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=401) 目录结构\n- [▶ 08:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=528) 先测试两个工具：[▶ 09:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=589) 存 PDF 的工具，[▶ 10:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=652) 向量库的灌库和检索\n- [▶ 18:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1096) 启动服务、发请求，[▶ 20:27](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1227) 对着日志看两个 Agent 的协作，[▶ 22:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1320) 打开报告、[▶ 22:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1350) 拿原始档案核对\n- [▶ 24:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1477) 调优建议：核心是写好提示词\n- [▶ 25:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1509) 代码讲解：YAML、crew.py、main 脚本，[▶ 29:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1790) 工具怎么包装，[▶ 32:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1945) 数据库路径的注意事项\n\n模型：视频用的是通过代理访问的 GPT-4o-mini；把文字变成向量用的是 OpenAI 的 embedding 接口，或者经 OneAPI 转发的通义千问 embedding。本课程的对话模型用 DeepSeek；DeepSeek 没有 embedding 接口，向量化改用本机的 bge-small-zh（17 节下载过的那个模型，不联网、不花钱）。",
   "en": "The video's contents, in order (click a time to jump there):\n- [▶ 00:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=0) The case: one agent searches a private health-records store based on a doctor's question, the other analyses the results and calls a tool to produce a PDF report; the core idea is adding RAG on top of the previous episode\n- [▶ 01:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=61) RAG recap: the offline steps and the online steps\n- [▶ 02:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=123) Defining the two agents and [▶ 03:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=215) the two tasks\n- [▶ 04:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=277) Preparation (revisit lessons 51 and 52), [▶ 05:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=339) downloading the source code and a Chinese font, [▶ 06:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=401) the folder structure\n- [▶ 08:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=528) Testing the two tools first: [▶ 09:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=589) the save-PDF tool, [▶ 10:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=652) indexing and retrieval with the vector store\n- [▶ 18:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1096) Starting the server and sending a request, [▶ 20:27](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1227) following the two agents' collaboration in the log, [▶ 22:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1320) opening the report, [▶ 22:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1350) checking it against the original records\n- [▶ 24:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1477) Tuning advice: it mostly comes down to writing good prompts\n- [▶ 25:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1509) Code walkthrough: the YAML, crew.py, the main script, [▶ 29:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1790) how the tools are wrapped, [▶ 32:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1945) a note on the database path\n\nModels: the video uses GPT-4o-mini through a proxy; to turn text into vectors it uses OpenAI's embedding API, or Qwen (Tongyi Qianwen) embeddings forwarded through OneAPI. This course uses DeepSeek as the chat model; DeepSeek has no embedding API, so embedding uses the local bge-small-zh instead (the model downloaded in lesson 17 – no network, no cost)."
  },
  {
   "t": "warn",
   "zh": "**这只是学习案例，不是医疗工具。**\n- 本节的档案是编造的，人物和数值都不对应真实的人。\n- 真实的健康档案属于敏感个人信息：不要把自己或别人的真实病历发给云端大模型，除非本人同意、去掉了身份信息，并且符合所在机构的规定；更稳妥的是用本地部署的模型。\n- AI 写的健康分析可能出错，只能作参考，不能代替医生的诊断。所以本节的报告任务要求结尾写明这一点。",
   "en": "**This is a learning example, not a medical tool.**\n- The records in this lesson are made up; the people and numbers do not correspond to anyone real.\n- Real health records are sensitive personal information: don't send your own or anyone else's real medical records to a cloud model unless the person has agreed, identifying details have been removed and it complies with your organisation's rules; a locally deployed model is the safer choice.\n- AI-written health analysis can be wrong; use it only as a reference, never as a substitute for a doctor's diagnosis. That's why this lesson's report task asks for a statement saying so at the end."
  },
  {
   "t": "h",
   "zh": "二、RAG 回顾：离线和在线两步",
   "en": "2. RAG recap: the offline and online steps"
  },
  {
   "t": "p",
   "zh": "[▶ 01:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=61) 视频先回顾了 RAG（检索增强生成）的整体流程，分两大步：\n\n**离线步骤**（提前做一次，俗称「灌库」）\n1. 加载文档（这一集是一份 PDF）\n2. 切块：把长文档切成一段一段（chunk）\n3. 向量化：用 embedding 模型把每段文字变成一串数字（向量）\n4. 把向量和对应的原文一起存进向量数据库\n\n[▶ 01:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=92) **在线步骤**（每次提问时做）\n1. 把用户的问题也变成向量\n2. 在向量数据库里找和问题最相似的几段\n3. 把这几段原文和问题一起填进提示词模板，交给大模型\n4. 大模型根据你提供的资料生成回答\n\n老师说这部分在他讲 LangChain + RAG 的视频里有详细介绍（本课程的 17 节和 46 节前后也讲过）。这一集的变化在于：第 2 步「检索」做成了一个**工具**，由检索专家 Agent 来调用。",
   "en": "[▶ 01:01](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=61) The video first recaps the overall flow of RAG (retrieval-augmented generation), in two big steps:\n\n**Offline steps** (done once in advance; usually called “indexing”)\n1. Load the documents (in this episode, one PDF)\n2. Chunk: cut the long document into pieces (chunks)\n3. Embed: use an embedding model to turn each chunk into a list of numbers (a vector)\n4. Store the vectors together with their original text in a vector database\n\n[▶ 01:32](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=92) **Online steps** (done for every question)\n1. Turn the user's question into a vector too\n2. Find the chunks in the vector database that are most similar to the question\n3. Fill the original text of those chunks and the question into a prompt template and hand it to the LLM\n4. The LLM generates the answer from the material you provided\n\nThe instructor says his LangChain + RAG videos cover this part in detail (this course covers it around lessons 17 and 46 too). What changes in this episode: step 2, “retrieval”, becomes a **tool** that the retrieval-expert agent calls."
  },
  {
   "t": "check",
   "q": {
    "zh": "下面哪一步属于离线步骤？",
    "en": "Which of these is an offline step?"
   },
   "options": [
    {
     "zh": "把医生的问题变成向量",
     "en": "Turning the doctor's question into a vector"
    },
    {
     "zh": "在数据库里找最相似的几段",
     "en": "Finding the most similar chunks in the database"
    },
    {
     "zh": "把档案切块、向量化后存进向量数据库",
     "en": "Chunking the records, embedding them and storing them in the vector database"
    },
    {
     "zh": "把检索结果和问题填进提示词",
     "en": "Filling the retrieval results and the question into the prompt"
    }
   ],
   "answer": 2,
   "explain": {
    "zh": "切块、向量化、入库可以提前做一次；问题向量化、相似度检索、填提示词都要在每次提问时做。",
    "en": "Chunking, embedding and storing can be done once in advance; embedding the question, similarity search and filling the prompt happen for every question."
   }
  },
  {
   "t": "h",
   "zh": "三、两个 Agent、两个 Task",
   "en": "3. Two agents, two tasks"
  },
  {
   "t": "p",
   "zh": "[▶ 02:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=123) 两个 Agent 的分工：\n\n| | 检索专家 | 撰写专家 |\n|---|---|---|\n| 角色 | 健康档案检索专家 | 健康报告撰写专家 |\n| 目标 | 根据医生询问的健康问题，从健康档案库里检索出相关记录 | 结合检索结果和医生的问题，写一份简洁、有医学依据的健康建议报告：综合病史、体检数据、生活方式，帮医生做判断，给患者个性化建议 |\n| 背景故事 | 专业的档案检索专家，擅长在大量档案里快速找到相关的历史记录 | 有医学背景，擅长分析健康档案，写出医生容易看懂、简洁又严谨的报告 |\n| 工具 | 向量检索工具 | 存 PDF 工具（52 节） |\n\n[▶ 03:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=215) 两个任务：**检索任务**用提供的工具，从档案库里检索和问题相关的健康信息，期望交出「与问题密切相关的档案记录」；**报告任务**根据检索结果和医生的问题写报告、给出个性化建议，再用工具把报告存成 PDF，期望交出「包含健康状况分析和建议、语言简洁的报告」。\n\n[▶ 02:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=153) 演示的问题是：「张三九最近总是头疼，跟他以前的体检结果有关系吗？」张三九是档案里虚构的人物。",
   "en": "[▶ 02:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=123) How the two agents split the work:\n\n| | Retrieval expert | Report writer |\n|---|---|---|\n| Role | Health Records Retrieval Expert | Health Report Writer |\n| Goal | Based on the health question the doctor asks, retrieve the related records from the health-records store | Combine the retrieval results with the doctor's question into a concise, medically grounded health advice report: pull together medical history, checkup data and lifestyle, help the doctor judge, and give the patient personalised advice |\n| Backstory | A professional records-retrieval expert, good at quickly finding the relevant history in a large set of records | Has a medical background, is good at analysing health records and writes reports that doctors understand easily – concise and rigorous |\n| Tools | the vector retrieval tool | the save-PDF tool (lesson 52) |\n\n[▶ 03:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=215) The two tasks: the **retrieval task** uses the provided tool to retrieve the health information related to the question from the records store, and is expected to deliver “the records closely related to the question”; the **report task** writes a report with personalised advice from the retrieval results and the doctor's question, then uses the tool to save the report as a PDF, and is expected to deliver “a concise report with an analysis of the health status and advice”.\n\n[▶ 02:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=153) The demo question is: “Zhang Sanjiu has had frequent headaches lately. Are they related to his earlier checkup results?” Zhang Sanjiu is a fictional person in the records."
  },
  {
   "t": "note",
   "zh": "视频把 Agent 和 Task 写在 YAML 里，用 `@CrewBase` 组装（和 52 节一样）。本课的 `l53_health_solution.py` 为了方便手写，直接写在 Python 里，意思按视频改写，并多加了两条要求：每个判断写明依据的记录；结尾注明「仅供参考」。",
   "en": "The video writes the agents and tasks in YAML and assembles them with `@CrewBase` (as in lesson 52). To make hand-writing easier, this lesson's `l53_health_solution.py` writes them directly in Python, reworded from the video, with two extra requirements: every judgement names the record it is based on, and the end states “for reference only”."
  },
  {
   "t": "h",
   "zh": "四、准备工作和目录结构",
   "en": "4. Preparation and folder structure"
  },
  {
   "t": "p",
   "zh": "[▶ 04:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=277) 准备工作和前两集一样：这一集是在 51、52 节的项目上继续做的。[▶ 05:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=339) 下载源码时还要另外下载一个中文字体包，给 PDF 显示中文用（本课的 PDF 工具自带中文字体，不需要）。[▶ 06:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=401) 目录结构比上一集多了 RAG 的部分，和本课文件的对应关系：\n\n| 视频 | 作用 | 本课 |\n|---|---|---|\n| `config/` 里两个 YAML | Agent、Task 的文字 | 直接写在 `l53_health_solution.py` 里 |\n| `tools/` | 两个工具：存 PDF、向量检索 | `l52_tools_solution.py` 的 `save_report`；`l53_health_solution.py` 的 `search_health_records` |\n| unit test 文件夹 | 先单独测试工具 | `l52_tools_solution.py`（存 PDF）、`l53_vector_db.py`（灌库 + 检索） |\n| `input/健康档案.pdf` | 私有知识库 | `practice/data/l53_health_records.pdf`（虚构） |\n| 两个切块工具（中文、英文） | 把 PDF 切成段 | `l53_vector_db.py` 里的 `split_records` |\n| `chromaDB/` | 向量数据库文件夹 | `practice/output/l53_chromadb/` |\n| `output/` | 生成的报告 PDF | `practice/output/` |\n| main、apiTest 脚本 | 服务和客户端 | `l53_api.py`、`l51_api_client.py` |\n\n档案原文在 `practice/data/l53_health_records.md`，可以直接打开看；`l53_make_pdf.py` 把它排成 PDF，每条记录的标题写成【张三九｜2026-08-15 年度体检】这样的格式。课程已经附带生成好的 PDF。",
   "en": "[▶ 04:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=277) Preparation is the same as in the previous two episodes: this episode builds on the project from lessons 51 and 52. [▶ 05:39](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=339) When downloading the source code you also download a Chinese font package so the PDF can show Chinese (this lesson's PDF tool ships with a Chinese font, so you don't need it). [▶ 06:41](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=401) Compared with the previous episode, the folder structure adds the RAG parts; here is how they map to this lesson's files:\n\n| Video | Purpose | This lesson |\n|---|---|---|\n| two YAML files in `config/` | the text of the agents and tasks | written directly in `l53_health_solution.py` |\n| `tools/` | two tools: save PDF, vector retrieval | `save_report` in `l52_tools_solution.py`; `search_health_records` in `l53_health_solution.py` |\n| unit test folder | test the tools on their own first | `l52_tools_solution.py` (save PDF), `l53_vector_db.py` (indexing + retrieval) |\n| `input/健康档案.pdf` (health records) | the private knowledge base | `practice/data/l53_health_records.pdf` (fictional) |\n| two chunking tools (Chinese, English) | cut the PDF into pieces | `split_records` in `l53_vector_db.py` |\n| `chromaDB/` | the vector database folder | `practice/output/l53_chromadb/` |\n| `output/` | the generated report PDFs | `practice/output/` |\n| main and apiTest scripts | server and client | `l53_api.py`, `l51_api_client.py` |\n\nThe original records (written in Chinese) are in `practice/data/l53_health_records.md` – you can open it and read them; `l53_make_pdf.py` lays it out as a PDF and writes each record's heading in the form 【Zhang Sanjiu | 2026-08-15 annual checkup】. The course already includes the generated PDF."
  },
  {
   "t": "code",
   "file": {
    "zh": "data/l53_health_records.pdf 里的内容（节选）",
    "en": "Contents of data/l53_health_records.pdf (excerpt, translated from Chinese)"
   },
   "lang": "text",
   "code": {
    "zh": "【张三九｜2026-08-15 年度体检】\n血压 136/86 mmHg（参考：低于 120/80 为理想，120–139/80–89 为正常高值，140/90 及以上为高血压）。\n心率 78 次/分（参考 60–100）。BMI 26.8（参考 18.5–23.9，24–27.9 为超重）。\n空腹血糖 6.3 mmol/L（参考 3.9–6.1）。总胆固醇 5.8 mmol/L（参考低于 5.2）。\n……\n【张三九｜2026-09-12 门诊记录】\n主诉：近两周反复头疼，多在下午和熬夜后出现，以后脑勺和颈部发紧为主，休息后能缓解。\n门诊测量：血压 142/90 mmHg，心率 82 次/分。\n……",
    "en": "【Zhang Sanjiu | 2026-08-15 annual checkup】\nBlood pressure 136/86 mmHg (reference: below 120/80 is ideal, 120–139/80–89 is high-normal, 140/90 and above is hypertension).\nHeart rate 78 bpm (reference 60–100). BMI 26.8 (reference 18.5–23.9; 24–27.9 is overweight).\nFasting blood glucose 6.3 mmol/L (reference 3.9–6.1). Total cholesterol 5.8 mmol/L (reference below 5.2).\n…\n【Zhang Sanjiu | 2026-09-12 outpatient visit】\nChief complaint: recurring headaches for the past two weeks, mostly in the afternoon and after staying up late, mainly tightness at the back of the head and in the neck; eases with rest.\nMeasured at the visit: blood pressure 142/90 mmHg, heart rate 82 bpm.\n…"
   }
  },
  {
   "t": "h",
   "zh": "五、先测工具（一）：存 PDF",
   "en": "5. Testing the tools first (1): saving PDFs"
  },
  {
   "t": "p",
   "zh": "[▶ 09:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=559) 老师的思路是：设计智能体时，先想好要给它哪些工具、每个工具做什么，然后**提前写好、单独测通**，再交给 Agent。[▶ 09:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=589) 第一个是存 PDF 的工具：传入内容和保存路径，保存后返回结果；要加载中文字体，否则中文是乱码。[▶ 10:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=622) 运行测试脚本，得到一份写着欢迎语的 PDF，说明工具能用。\n\n这个工具和 52 节完全一样，直接复用 `l52_tools_solution.py` 里的 `save_report`：",
   "en": "[▶ 09:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=559) The instructor's approach: when designing an agent, first decide which tools it gets and what each one does, then **write them in advance and test each one on its own** before handing them to the agent. [▶ 09:49](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=589) The first is the save-PDF tool: it takes the content and a save path, saves the file and returns a result; it has to load a Chinese font, otherwise Chinese text comes out garbled. [▶ 10:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=622) Running the test script produces a PDF with a welcome message, which shows the tool works.\n\nThis tool is exactly the same as in lesson 52, so we reuse `save_report` from `l52_tools_solution.py` directly:"
  },
  {
   "t": "code",
   "file": "PowerShell",
   "lang": "powershell",
   "code": {
    "zh": "cd practice\n# 存 PDF 的工具：和 52 节完全一样，运行后 output 里多出几个测试 PDF\n& ..\\.venv-crewai\\Scripts\\python.exe l52_tools_solution.py",
    "en": "cd practice\n# the save-PDF tool: exactly as in lesson 52; after the run, output has a few new test PDFs\n& ..\\.venv-crewai\\Scripts\\python.exe l52_tools_solution.py"
   }
  },
  {
   "t": "h",
   "zh": "六、先测工具（二）：灌库和检索",
   "en": "6. Testing the tools first (2): indexing and retrieval"
  },
  {
   "t": "p",
   "zh": "[▶ 10:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=652) 第二个测试是 RAG 的离线步骤「灌库」，再加一次检索测试。[▶ 12:29](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=749) 视频的向量库脚本开头是几项配置，本课的 `l53_vector_db.py` 按同样的顺序写：\n\n| 配置 | 视频 | 本课 |\n|---|---|---|\n| 向量模型 | OpenAI 或通义千问的 embedding 接口 | 本机 bge-small-zh（`l53_embedding.py`，不需要会写） |\n| [▶ 13:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=782) 语言标志 | 中文档案用中文切块工具，英文用英文的 | 不需要：按记录切块 |\n| 输入的 PDF | `input` 文件夹里的健康档案 | `data/l53_health_records.pdf` |\n| [▶ 13:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=813) 页码 | `None` 处理全部页，写 `[2, 3]` 只处理第 2、3 页 | 同上（`PAGE_NUMBERS`） |\n| [▶ 14:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=843) 数据库文件夹 | `chromaDB`（没有会自动创建） | `output/l53_chromadb` |\n| 集合名 | `demo001` | `demo001` |\n\n[▶ 14:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=875) 接着是一个「向量库连接」类（视频里叫 `MyVectorDBConnector`）：`__init__` 创建存到硬盘的客户端、打开集合；`add_documents` 把向量和原文写进集合；`search` 做查询。[▶ 15:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=938) 再写两个函数：灌库函数（切块 → 写进集合）和检索测试函数。[▶ 16:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1003) 向量化是**分批**做的：比如切出 100 段，一次全塞进去不行，所以每批 25 段。",
   "en": "[▶ 10:52](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=652) The second test is RAG's offline step, indexing, plus one retrieval test. [▶ 12:29](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=749) The video's vector-store script starts with a few settings; this lesson's `l53_vector_db.py` follows the same order:\n\n| Setting | Video | This lesson |\n|---|---|---|\n| embedding model | the OpenAI or Qwen embedding API | local bge-small-zh (`l53_embedding.py`; you don't need to be able to write it) |\n| [▶ 13:02](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=782) language flag | Chinese records use the Chinese chunking tool, English ones the English tool | not needed: we chunk by record |\n| input PDF | the health records in the `input` folder | `data/l53_health_records.pdf` |\n| [▶ 13:33](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=813) page numbers | `None` processes all pages; `[2, 3]` processes only pages 2 and 3 | same (`PAGE_NUMBERS`) |\n| [▶ 14:03](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=843) database folder | `chromaDB` (created automatically if missing) | `output/l53_chromadb` |\n| collection name | `demo001` | `demo001` |\n\n[▶ 14:35](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=875) Next comes a “vector DB connector” class (called `MyVectorDBConnector` in the video): `__init__` creates a client that saves to disk and opens the collection; `add_documents` writes the vectors and the original text into the collection; `search` runs a query. [▶ 15:38](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=938) Then two functions: the indexing function (chunk → write into the collection) and a retrieval test function. [▶ 16:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1003) Embedding is done **in batches**: say you cut 100 chunks – pushing them all in at once doesn't work, so it goes 25 chunks per batch."
  },
  {
   "t": "code",
   "file": {
    "zh": "practice/l53_vector_db.py（节选）",
    "en": "practice/l53_vector_db.py (excerpt)"
   },
   "code": {
    "zh": "from pathlib import Path\n\nimport chromadb\nfrom chromadb.config import Settings\nfrom pdfminer.high_level import extract_pages\nfrom pdfminer.layout import LTTextContainer\n\nfrom l53_embedding import embed          # 把一组文字变成一组向量（视频：调用 embedding 接口）\n\n# ---- 配置（视频的脚本开头也是这几项）\nHERE = Path(__file__).parent\nINPUT_PDF = HERE / \"data\" / \"l53_health_records.pdf\"     # 视频：input 文件夹里的健康档案 PDF\nPAGE_NUMBERS = None                                      # None = 全部页；[1, 2] = 只处理第 1、2 页\nDB_PATH = HERE / \"output\" / \"l53_chromadb\"               # 视频：chromaDB 文件夹\nCOLLECTION = \"demo001\"                                   # 视频用的集合名\n\n\ndef load_pdf_text(path=INPUT_PDF, page_numbers=None):\n    \"\"\"读出 PDF 的文字；page_numbers 是要处理的页码列表（从 1 开始），None 表示全部页。\"\"\"\n    texts = []\n    for page_no, page in enumerate(extract_pages(str(path)), start=1):\n        if page_numbers is not None and page_no not in page_numbers:\n            continue\n        for element in page:\n            if isinstance(element, LTTextContainer):     # 只要文字块（isinstance 见 25 节）\n                texts.append(element.get_text())\n    return \"\".join(texts)\n\n\ndef split_records(text):\n    \"\"\"切块：遇到以「【」开头的标题行就开始新的一块，后面的行都接到这一块里。\"\"\"\n    chunks = []\n    for line in text.splitlines():\n        line = line.strip()\n        if line.startswith(\"【\"):\n            chunks.append(line)\n        elif line and chunks:\n            chunks[-1] += \"\\n\" + line\n    return chunks\n\n\nclass MyVectorDBConnector:\n    def __init__(self, path=DB_PATH, collection_name=COLLECTION):\n        # 存到硬盘的客户端：文件夹不存在会自动创建，下次运行数据还在\n        client = chromadb.PersistentClient(path=str(path), settings=Settings(anonymized_telemetry=False))\n        # 打开集合（没有就新建）；向量由我们自己算好再传进去\n        self.collection = client.get_or_create_collection(name=collection_name, embedding_function=None)\n\n    def add_documents(self, documents, batch_size=25):\n        \"\"\"灌库：每批 25 段，算向量后连同原文写进集合。\"\"\"\n        for start in range(0, len(documents), batch_size):        # range 的步长见 46 节\n            batch = documents[start:start + batch_size]\n            self.collection.upsert(\n                ids=[f\"id{start + i}\" for i in range(len(batch))],\n                documents=batch,\n                embeddings=embed(batch),\n            )\n\n    def search(self, query, top_n=5):\n        \"\"\"检索：把问题变成向量，返回最相近的 top_n 段原文。\"\"\"\n        results = self.collection.query(query_embeddings=embed([query]), n_results=top_n)\n        return results[\"documents\"][0]                   # 只问了一个问题，所以取 [0]\n\n\ndef vector_store_save(pdf_path=INPUT_PDF, page_numbers=PAGE_NUMBERS):\n    \"\"\"离线步骤：读 PDF → 切块 → 向量化 → 存进向量库。\"\"\"\n    chunks = split_records(load_pdf_text(pdf_path, page_numbers))\n    db = MyVectorDBConnector()\n    db.add_documents(chunks)\n    return db",
    "en": "from pathlib import Path\n\nimport chromadb\nfrom chromadb.config import Settings\nfrom pdfminer.high_level import extract_pages\nfrom pdfminer.layout import LTTextContainer\n\nfrom l53_embedding import embed          # turns a list of texts into a list of vectors (video: calls an embedding API)\n\n# ---- settings (the video's script starts with these too)\nHERE = Path(__file__).parent\nINPUT_PDF = HERE / \"data\" / \"l53_health_records.pdf\"     # video: the health-records PDF in the input folder\nPAGE_NUMBERS = None                                      # None = all pages; [1, 2] = only pages 1 and 2\nDB_PATH = HERE / \"output\" / \"l53_chromadb\"               # video: the chromaDB folder\nCOLLECTION = \"demo001\"                                   # the collection name used in the video\n\n\ndef load_pdf_text(path=INPUT_PDF, page_numbers=None):\n    \"\"\"Read the text of a PDF; page_numbers lists the pages to process (starting at 1), None means all pages.\"\"\"\n    texts = []\n    for page_no, page in enumerate(extract_pages(str(path)), start=1):\n        if page_numbers is not None and page_no not in page_numbers:\n            continue\n        for element in page:\n            if isinstance(element, LTTextContainer):     # text blocks only (isinstance: lesson 25)\n                texts.append(element.get_text())\n    return \"\".join(texts)\n\n\ndef split_records(text):\n    \"\"\"Chunking: a heading line starting with 【 starts a new chunk; the lines after it are appended to that chunk.\"\"\"\n    chunks = []\n    for line in text.splitlines():\n        line = line.strip()\n        if line.startswith(\"【\"):\n            chunks.append(line)\n        elif line and chunks:\n            chunks[-1] += \"\\n\" + line\n    return chunks\n\n\nclass MyVectorDBConnector:\n    def __init__(self, path=DB_PATH, collection_name=COLLECTION):\n        # a client that saves to disk: the folder is created if missing, and the data is still there next run\n        client = chromadb.PersistentClient(path=str(path), settings=Settings(anonymized_telemetry=False))\n        # open the collection (create it if missing); we compute the vectors ourselves and pass them in\n        self.collection = client.get_or_create_collection(name=collection_name, embedding_function=None)\n\n    def add_documents(self, documents, batch_size=25):\n        \"\"\"Indexing: 25 chunks per batch; compute their vectors and write them into the collection with the original text.\"\"\"\n        for start in range(0, len(documents), batch_size):        # range with a step: lesson 46\n            batch = documents[start:start + batch_size]\n            self.collection.upsert(\n                ids=[f\"id{start + i}\" for i in range(len(batch))],\n                documents=batch,\n                embeddings=embed(batch),\n            )\n\n    def search(self, query, top_n=5):\n        \"\"\"Retrieval: turn the question into a vector and return the original text of the top_n closest chunks.\"\"\"\n        results = self.collection.query(query_embeddings=embed([query]), n_results=top_n)\n        return results[\"documents\"][0]                   # we asked only one question, so take [0]\n\n\ndef vector_store_save(pdf_path=INPUT_PDF, page_numbers=PAGE_NUMBERS):\n    \"\"\"Offline step: read the PDF → chunk → embed → store in the vector store.\"\"\"\n    chunks = split_records(load_pdf_text(pdf_path, page_numbers))\n    db = MyVectorDBConnector()\n    db.add_documents(chunks)\n    return db"
   },
   "note": {
    "zh": "读 PDF 用的是 pdfminer.six（`.venv-crewai` 里已经有）。我们的档案每条记录都很短，所以按「【」标题切，一条记录一块；视频的档案是普通文章，按段落和长度切。",
    "en": "The PDF is read with pdfminer.six (already in `.venv-crewai`). Each record in our file is short, so we cut at the 【 headings, one record per chunk; the video's file is ordinary prose, cut by paragraph and length."
   }
  },
  {
   "t": "py",
   "title": {
    "zh": "enumerate：遍历时顺便拿到序号",
    "en": "enumerate: get the index while you loop"
   },
   "zh": "读 PDF 时要知道「现在是第几页」，才能按 `page_numbers` 挑页。`enumerate(列表)` 在遍历的同时给出序号：每一轮拿到一对 `(序号, 元素)`，用两个变量接住（和 07 节 `return a, b` 的拆包是同一个写法）。\n- 序号默认从 0 开始；写 `enumerate(列表, start=1)` 就从 1 开始，正好当页码\n- `page_numbers is None` 判断「调用时没给页码」。`page_numbers=None` 是默认值，意思是「不挑，全部要」；给了列表时，再用 `in`（18 节）看当前页码在不在里面",
   "en": "When reading a PDF you need to know “which page is this” to pick pages by `page_numbers`. `enumerate(a_list)` hands you an index while you loop: each round you get a pair `(index, item)` and catch it with two variables (the same unpacking as `return a, b` in lesson 07).\n- The index starts at 0 by default; `enumerate(a_list, start=1)` starts at 1, which is just right for page numbers\n- `page_numbers is None` checks “no page numbers were given in the call”. `page_numbers=None` is the default value and means “don't pick, take everything”; when a list is given, `in` (lesson 18) checks whether the current page number is in it",
   "code": {
    "zh": "pages = [\"第 1 页的文字\", \"第 2 页的文字\", \"第 3 页的文字\"]\n\nfor i, text in enumerate(pages):                  # 默认从 0 开始数\n    print(i, text)\n\n\ndef pick_pages(pages, page_numbers=None):\n    picked = []\n    for page_no, text in enumerate(pages, start=1):   # 页码从 1 开始\n        if page_numbers is not None and page_no not in page_numbers:\n            continue                                   # 不在要处理的页里，跳过\n        picked.append(text)\n    return picked\n\n\nprint(pick_pages(pages))             # 没传页码（None）：全部 3 页\nprint(pick_pages(pages, [2, 3]))     # 只要第 2、3 页\nprint(pick_pages(pages, []))         # 空列表：一页都不要",
    "en": "pages = [\"text of page 1\", \"text of page 2\", \"text of page 3\"]\n\nfor i, text in enumerate(pages):                  # counts from 0 by default\n    print(i, text)\n\n\ndef pick_pages(pages, page_numbers=None):\n    picked = []\n    for page_no, text in enumerate(pages, start=1):   # page numbers start at 1\n        if page_numbers is not None and page_no not in page_numbers:\n            continue                                   # not one of the pages to process: skip it\n        picked.append(text)\n    return picked\n\n\nprint(pick_pages(pages))             # no page numbers passed (None): all 3 pages\nprint(pick_pages(pages, [2, 3]))     # only pages 2 and 3\nprint(pick_pages(pages, []))         # empty list: no pages at all"
   },
   "run": true,
   "note": {
    "zh": "为什么写 `page_numbers is not None`，而不是 `if page_numbers`？空列表 `[]` 也算「假」（05 节）：用后一种写法，传 `[]` 会被当成「没传」，结果全部页都处理了。`is None` 只在真的没传时成立。",
    "en": "Why write `page_numbers is not None` and not `if page_numbers`? An empty list `[]` also counts as “false” (lesson 05): with the second form, passing `[]` is treated as “nothing passed”, and every page gets processed. `is None` is true only when nothing was really passed."
   }
  },
  {
   "t": "p",
   "zh": "[▶ 16:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1003) 运行灌库脚本后，项目里多出数据库文件夹，里面有了这个集合。[▶ 17:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1066) 随便问一个问题测试检索：视频返回了 5 段内容，拼在一起输出。本课的运行结果：",
   "en": "[▶ 16:43](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1003) After you run the indexing script, a database folder appears in the project, and this collection is in it. [▶ 17:46](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1066) Ask any question to test retrieval: the video gets 5 chunks back and prints them joined together. This lesson's run:"
  },
  {
   "t": "code",
   "file": {
    "zh": "运行结果",
    "en": "Output (translated from Chinese)"
   },
   "lang": "text",
   "code": {
    "zh": "> & ..\\.venv-crewai\\Scripts\\python.exe l53_vector_db.py\n灌库完成：集合 demo001 里有 9 段\n数据库文件夹： <项目文件夹>\\practice\\output\\l53_chromadb\n\n问题：张三九最近总是头疼，跟他以前的体检结果有关系吗？\n  命中： 【张三九｜2026-09-12 门诊记录】\n  命中： 【张三九｜基本信息】\n  命中： 【张三九｜2026-08-15 年度体检】\n  命中： 【张三九｜2025-08-20 年度体检】\n  命中： 【张三九｜生活方式（2026-03 健康问卷）】\n\n问题：张三九平时睡眠和生活习惯怎么样？\n  命中： 【张三九｜生活方式（2026-03 健康问卷）】\n  ……",
    "en": "> & ..\\.venv-crewai\\Scripts\\python.exe l53_vector_db.py\nIndexing done: collection demo001 holds 9 chunks\nDatabase folder: <project folder>\\practice\\output\\l53_chromadb\n\nQuestion: Zhang Sanjiu has had frequent headaches lately. Are they related to his earlier checkup results?\n  hit: 【Zhang Sanjiu | 2026-09-12 outpatient visit】\n  hit: 【Zhang Sanjiu | basic information】\n  hit: 【Zhang Sanjiu | 2026-08-15 annual checkup】\n  hit: 【Zhang Sanjiu | 2025-08-20 annual checkup】\n  hit: 【Zhang Sanjiu | lifestyle (2026-03 health questionnaire)】\n\nQuestion: How are Zhang Sanjiu's sleep and daily habits?\n  hit: 【Zhang Sanjiu | lifestyle (2026-03 health questionnaire)】\n  …"
   }
  },
  {
   "t": "p",
   "zh": "门诊记录、基本信息、两次体检、生活方式问卷都排进了前 5。向量检索比的是**意思**：生活方式那段写的是睡眠和咖啡，和「头疼」没有一个字相同，也能被找出来。李四一、王五六的记录没有混进来。",
   "en": "The outpatient visit, the basic information, both checkups and the lifestyle questionnaire all make the top 5. Vector search compares **meaning**: the lifestyle record is about sleep and coffee and doesn't share a single word with “headache”, yet it is found. No records of Li Siyi or Wang Wuliu slip in."
  },
  {
   "t": "warn",
   "zh": "- 同一个集合里的向量长度必须一致。换了向量模型再往旧集合里写，会报类似 `Collection expecting embedding with dimension of 512, got 256` 的错误（本机验证过）。\n- 改了档案想重新灌库：删掉 `practice\\output\\l53_chromadb` 文件夹再运行 `l53_vector_db.py`。\n- chromadb 即使关掉遥测，也会往 C 盘用户目录写一个小 id 文件，`l53_vector_db.py` 开头把它改到了 `output` 里。",
   "en": "- All vectors in one collection must have the same length. If you switch embedding models and keep writing into the old collection, you get an error like `Collection expecting embedding with dimension of 512, got 256` (verified locally).\n- To re-index after changing the records: delete the `practice\\output\\l53_chromadb` folder and run `l53_vector_db.py` again.\n- Even with telemetry off, chromadb writes a small id file into your user folder on drive C; `l53_vector_db.py` moves it into `output` at the top of the file."
  },
  {
   "t": "check",
   "q": {
    "zh": "视频的灌库脚本为什么每次只把 25 段文字拿去算向量、写进数据库？",
    "en": "Why does the video's indexing script take only 25 chunks of text at a time to embed and write into the database?"
   },
   "options": [
    {
     "zh": "Chroma 的一个集合最多只能存 25 段",
     "en": "A Chroma collection can hold at most 25 chunks"
    },
    {
     "zh": "切出来的段很多时，一次全塞进去不行，分批处理更稳",
     "en": "With many chunks, pushing them all in at once doesn't work; batches are more reliable"
    },
    {
     "zh": "25 是 PDF 的页数",
     "en": "25 is the number of pages in the PDF"
    },
    {
     "zh": "分批能让检索结果更准",
     "en": "Batching makes retrieval results more accurate"
    }
   ],
   "answer": 1,
   "explain": {
    "zh": "视频的说法是：比如切出 100 段，一次全部灌进去肯定不行，所以每批 25 段。分批和检索准不准无关。",
    "en": "As the video puts it: say you cut 100 chunks – loading them all at once certainly won't work, so it goes 25 per batch. Batching has nothing to do with how accurate retrieval is."
   }
  },
  {
   "t": "h",
   "zh": "七、跑通整个助手",
   "en": "7. Running the whole assistant"
  },
  {
   "t": "p",
   "zh": "[▶ 18:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1096) 两个工具都测通以后，按 README 的下一步：配置模型、端口和标志位，启动 main 服务，再用 apiTest 发 POST 请求。[▶ 19:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1162) 请求里的问题就是「张三九最近总是头疼，跟他以前的体检结果有关系吗？」。",
   "en": "[▶ 18:16](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1096) Once both tools work, follow the next step in the README: configure the model, port and flags, start the main server, then send a POST request with apiTest. [▶ 19:22](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1162) The question in the request is the same one: “Zhang Sanjiu has had frequent headaches lately. Are they related to his earlier checkup results?”"
  },
  {
   "t": "code",
   "file": "PowerShell",
   "lang": "powershell",
   "code": {
    "zh": "cd practice\n# 1. 先灌库并测试检索（不调大模型、不花钱）\n& ..\\.venv-crewai\\Scripts\\python.exe l53_vector_db.py\n\n# 2. 直接运行整个助手（约 4 次模型调用，1–3 分钟）\n& ..\\.venv-crewai\\Scripts\\python.exe l53_health_solution.py\n& ..\\.venv-crewai\\Scripts\\python.exe l53_health_solution.py \"李四一最近的体检有什么需要注意的？\"\n\n# 3. 或者像视频那样：终端 1 启动服务（Ctrl+C 停止）……\n& ..\\.venv-crewai\\Scripts\\python.exe l53_api.py\n# ……终端 2 发请求\n& ..\\.venv-crewai\\Scripts\\python.exe l51_api_client.py \"张三九最近总是头疼，跟他以前的体检结果有关系吗？\" --openai",
    "en": "cd practice\n# 1. index first and test retrieval (no LLM calls, no cost)\n& ..\\.venv-crewai\\Scripts\\python.exe l53_vector_db.py\n\n# 2. run the whole assistant directly (about 4 model calls, 1–3 minutes)\n& ..\\.venv-crewai\\Scripts\\python.exe l53_health_solution.py\n& ..\\.venv-crewai\\Scripts\\python.exe l53_health_solution.py \"李四一最近的体检有什么需要注意的？\"    # \"Is there anything to watch in Li Siyi's latest checkup?\"\n\n# 3. or, as in the video: terminal 1 starts the server (Ctrl+C to stop) ...\n& ..\\.venv-crewai\\Scripts\\python.exe l53_api.py\n# ... terminal 2 sends the request (\"Zhang Sanjiu has had frequent headaches lately. Are they related to his earlier checkup results?\")\n& ..\\.venv-crewai\\Scripts\\python.exe l51_api_client.py \"张三九最近总是头疼，跟他以前的体检结果有关系吗？\" --openai"
   }
  },
  {
   "t": "p",
   "zh": "[▶ 20:27](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1227) 老师对着日志讲了运行过程。本课用 DeepSeek 跑 `l53_health_solution.py`，顺序和视频一样：\n1. 🤖 健康档案检索专家接到任务，🔧 调用 `search_health_records`，参数就是医生的问题\n2. ✅ 工具返回 5 段档案原文（门诊记录、基本信息、两次体检、生活方式问卷）\n3. ✅ 检索专家把这些记录整理成最终答案，交给下一个任务\n4. 🤖 [▶ 21:29](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1289) 健康报告撰写专家写报告，🔧 调用 `save_report`，工具返回「报告已保存，请前往 output\\张三九健康建议报告.pdf 查看报告。」\n5. ✅ 撰写专家的最终答案（报告正文 + 保存提示）就是整个 crew 的结果，通过接口返回给调用方\n\n一共 4 次模型调用：两个 Agent 各用了一次工具，每次工具调用前后各要请求一次模型。",
   "en": "[▶ 20:27](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1227) The instructor walks through the run using the log. This lesson runs `l53_health_solution.py` with DeepSeek, and the order is the same as in the video:\n1. 🤖 The Health Records Retrieval Expert receives its task and 🔧 calls `search_health_records`, with the doctor's question as the argument\n2. ✅ The tool returns the original text of 5 records (the outpatient visit, the basic information, both checkups, the lifestyle questionnaire)\n3. ✅ The retrieval expert organises these records into its final answer, which is passed to the next task\n4. 🤖 [▶ 21:29](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1289) The Health Report Writer writes the report and 🔧 calls `save_report`; the tool returns “Report saved. Open output\\张三九健康建议报告.pdf to view the report.”\n5. ✅ The writer's final answer (report text + the save message) is the result of the whole crew, returned to the caller through the API\n\n4 model calls in total: each agent used a tool once, and every tool call needs one model request before it and one after it."
  },
  {
   "t": "p",
   "zh": "[▶ 22:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1320) 打开 `output` 里的 PDF：本课生成的报告先列出相关指标（门诊血压 142/90 已达高血压水平；两次体检血压 128/82 → 136/86 逐次升高；空腹血糖、血脂、尿酸偏高；BMI 超重），再分析和头疼可能有关的因素（血压升高、睡眠不足、长期伏案、咖啡和高盐饮食、家族史），最后给出建议和「仅供参考」的声明——和视频里报告的思路一致。\n\n[▶ 22:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1350) 接下来老师做了一件很重要的事：打开原始档案，逐项核对报告里的数字（身高、最近一次体检的血压、心率），确认都对得上。他的理由是：**第一个 Agent 拿到的数据要是错的，后面的分析一定是错的**。你也可以拿 `data/l53_health_records.md` 对一对：报告里的 136/86、142/90、78 次/分都和档案一致。",
   "en": "[▶ 22:00](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1320) Open the PDF in `output`: the report generated in this lesson first lists the relevant indicators (blood pressure 142/90 at the outpatient visit has reached the hypertension level; across the two checkups it rose, 128/82 → 136/86; fasting glucose, blood lipids and uric acid are high; BMI is in the overweight range), then analyses the factors that may be related to the headaches (rising blood pressure, too little sleep, long hours at a desk, coffee and a salty diet, family history), and ends with advice and a “for reference only” statement – the same line of thinking as the report in the video.\n\n[▶ 22:30](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1350) Next the instructor does something very important: he opens the original records and checks the numbers in the report one by one (height, blood pressure and heart rate at the latest checkup) to confirm they match. His reason: **if the data the first agent gets is wrong, the analysis after it is bound to be wrong**. You can check against `data/l53_health_records.md` too: 136/86, 142/90 and 78 bpm in the report all match the records."
  },
  {
   "t": "tip",
   "zh": "[▶ 24:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1477) 效果不满意时调什么？老师的建议是调 Agent 的角色、目标、背景故事，以及任务的描述和期望输出——说到底就是**写提示词**，这是大模型应用里最重要的功夫。比如本课在报告任务里写明了要哪几部分、每条写依据、结尾加声明，报告就规整得多。",
   "en": "[▶ 24:37](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1477) What do you tune when the results disappoint? The instructor suggests adjusting the agents' role, goal and backstory and the tasks' description and expected output – in the end it is all **writing prompts**, the most important skill in LLM applications. For example, this lesson's report task spells out which parts it wants, a basis for every point and a closing statement, and the report comes out much tidier."
  },
  {
   "t": "check",
   "q": {
    "zh": "老师跑完后专门打开原始档案，核对报告里的血压、心率等数字，主要是为了？",
    "en": "After the run, the instructor opens the original records specifically to check numbers such as blood pressure and heart rate in the report. Why, mainly?"
   },
   "options": [
    {
     "zh": "检查 PDF 的排版",
     "en": "To check the PDF's layout"
    },
    {
     "zh": "确认检索专家拿到的数据是对的——检索错了，后面的分析一定错",
     "en": "To confirm the data the retrieval expert got is right – if retrieval is wrong, the analysis after it is bound to be wrong"
    },
    {
     "zh": "测试模型的速度",
     "en": "To test the model's speed"
    },
    {
     "zh": "看报告有没有错别字",
     "en": "To look for typos in the report"
    }
   ],
   "answer": 1,
   "explain": {
    "zh": "撰写专家只能根据检索结果分析。先确认检索到的记录和抄录的数字都对，分析才有意义。",
    "en": "The report writer can only analyse what retrieval gives it. Only once the retrieved records and the numbers copied from them are confirmed correct does the analysis mean anything."
   }
  },
  {
   "t": "h",
   "zh": "八、代码讲解：两个工具交给两个 Agent",
   "en": "8. Code walkthrough: two tools for two agents"
  },
  {
   "t": "p",
   "zh": "[▶ 25:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1509) 代码从 YAML 开始看：两个文件分别定义两个 Agent 和两个任务，内容开头已经介绍过。[▶ 25:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1540) `crew.py` 里定义一个类：两个 `@agent` 方法从 YAML 取配置，两个 `@task` 方法同样。[▶ 26:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1572) 再从 `tools` 文件夹导入两个工具，[▶ 26:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1604) 检索工具交给检索专家（它负责去档案库查），存 PDF 工具交给撰写专家（它负责保存报告）。[▶ 27:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1637) 最后创建 Crew，按顺序执行，`verbose` 控制终端里那些彩色日志。本课把这些写在一个文件里：",
   "en": "[▶ 25:09](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1509) The code walkthrough starts with the YAML: two files define the two agents and the two tasks, whose content was introduced at the start. [▶ 25:40](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1540) `crew.py` defines a class: two `@agent` methods take their settings from the YAML, and so do the two `@task` methods. [▶ 26:12](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1572) Then the two tools are imported from the `tools` folder; [▶ 26:44](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1604) the retrieval tool goes to the retrieval expert (it searches the records store) and the save-PDF tool to the report writer (it saves the report). [▶ 27:17](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1637) Finally a crew is created that runs the tasks in order; `verbose` controls those colourful logs in the terminal. This lesson puts all of this in one file:"
  },
  {
   "t": "code",
   "file": {
    "zh": "practice/l53_health_solution.py（整理）",
    "en": "practice/l53_health_solution.py (condensed)"
   },
   "code": {
    "zh": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import LLM, Agent, Crew, Process, Task\nfrom crewai.tools import tool\n\nfrom l52_tools_solution import save_report          # 上一集写好的存 PDF 工具\nfrom l53_vector_db import MyVectorDBConnector       # 和灌库时同一份配置（路径、集合名）\nfrom llm import API_KEY, BASE_URL, MODEL\n\ndb = MyVectorDBConnector()                          # 打开灌好库的集合\n\n\n@tool(\"search_health_records\")\ndef search_health_records(question: str) -> str:\n    \"\"\"按照医生提出的问题，到健康档案库里查找相关的记录。\n    question：医生的问题，例如「张三九最近总是头疼，跟他以前的体检结果有关系吗？」。\n    返回检索到的几段档案原文，用分隔线隔开。\"\"\"\n    docs = db.search(question, top_n=5)\n    if not docs:\n        return \"健康档案库里没有找到内容，请先运行 l53_vector_db.py 灌库。\"\n    return f\"检索到 {len(docs)} 段相关档案：\\n\\n\" + \"\\n\\n---\\n\\n\".join(docs)\n\n\ndef build_crew(llm):\n    retriever = Agent(\n        role=\"健康档案检索专家\",\n        goal=\"根据医生询问的健康问题，从健康档案库中检索出所有相关的记录\",\n        backstory=\"你熟悉各类健康档案，善于从大量历史记录里迅速挑出和问题有关的内容。\"\n                  \"你只引用档案原文，不猜测、不编造。\",\n        tools=[search_health_records],      # 检索工具给检索专家\n        llm=llm,\n        verbose=True,\n    )\n    reporter = Agent(\n        role=\"健康报告撰写专家\",\n        goal=\"结合检索到的健康档案和医生的问题，写一份简洁、有医学依据的健康建议报告\",\n        backstory=\"你有医学背景，擅长分析病史、体检数据和生活方式，写出医生容易理解、\"\n                  \"内容简洁又严谨的健康建议报告；每个判断都写明依据，不做确定性诊断。\",\n        tools=[save_report],                # 存 PDF 工具给撰写专家\n        llm=llm,\n        verbose=True,\n    )\n    retrieve_task = Task(\n        description=\"医生的问题是：「{question}」。请使用 search_health_records 工具，\"\n                    \"从健康档案库中检索与这个问题相关的所有健康信息。\",\n        expected_output=\"与问题密切相关的健康档案记录（保留原始日期和数值），不做诊断。\",\n        agent=retriever,\n    )\n    report_task = Task(\n        description=\"根据检索到的健康档案，结合医生的问题「{question}」写一份健康报告，包括：\\n\"\n                    \"1. 健康状况分析：相关指标、数值、参考范围、是否超出范围\\n\"\n                    \"2. 与问题可能有关的因素，每条写明依据的记录\\n\"\n                    \"3. 3–5 条个性化的健康建议\\n\"\n                    \"4. 结尾一句：本报告由 AI 根据虚构档案生成，仅供参考，不能替代医生诊断。\\n\"\n                    \"写完后调用 save_report 工具把报告保存成 PDF，filename 用「患者姓名+健康建议报告」。\",\n        expected_output=\"一份包含健康状况分析和健康建议的中文报告（不超过 600 字，语言简洁），\"\n                        \"最后一行附上 save_report 返回的保存提示。\",\n        agent=reporter,\n    )\n    return Crew(\n        agents=[retriever, reporter],\n        tasks=[retrieve_task, report_task],\n        process=Process.sequential,         # 先检索，再写报告\n        verbose=True,\n    )\n\n\nllm = LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY)\nresult = build_crew(llm).kickoff(inputs={\"question\": \"张三九最近总是头疼，跟他以前的体检结果有关系吗？\"})\nprint(result.raw)",
    "en": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import LLM, Agent, Crew, Process, Task\nfrom crewai.tools import tool\n\nfrom l52_tools_solution import save_report          # the save-PDF tool from the previous episode\nfrom l53_vector_db import MyVectorDBConnector       # same settings as for indexing (path, collection name)\nfrom llm import API_KEY, BASE_URL, MODEL\n\ndb = MyVectorDBConnector()                          # open the indexed collection\n\n\n@tool(\"search_health_records\")\ndef search_health_records(question: str) -> str:\n    \"\"\"Search the health-records store for the records related to the doctor's question.\n    question: the doctor's question, e.g. \"Zhang Sanjiu has had frequent headaches lately. Are they related to his earlier checkup results?\".\n    Returns the retrieved original record texts, separated by divider lines.\"\"\"\n    docs = db.search(question, top_n=5)\n    if not docs:\n        return \"Nothing found in the health-records store; run l53_vector_db.py first to index it.\"\n    return f\"Found {len(docs)} related records:\\n\\n\" + \"\\n\\n---\\n\\n\".join(docs)\n\n\ndef build_crew(llm):\n    retriever = Agent(\n        role=\"Health Records Retrieval Expert\",\n        goal=\"Based on the health question the doctor asks, retrieve all the related records from the health-records store\",\n        backstory=\"You know health records well and are good at quickly picking out the past entries that relate to the question. \"\n                  \"You quote only the original records; you never guess or make things up.\",\n        tools=[search_health_records],      # the retrieval tool goes to the retrieval expert\n        llm=llm,\n        verbose=True,\n    )\n    reporter = Agent(\n        role=\"Health Report Writer\",\n        goal=\"Combine the retrieved health records with the doctor's question into a concise, medically grounded health advice report\",\n        backstory=\"You have a medical background and are good at analysing medical history, checkup data and lifestyle; you write concise, rigorous health advice reports \"\n                  \"that doctors understand easily; you state the basis of every judgement and never give a definitive diagnosis.\",\n        tools=[save_report],                # the save-PDF tool goes to the report writer\n        llm=llm,\n        verbose=True,\n    )\n    retrieve_task = Task(\n        description=\"The doctor's question is: '{question}'. Use the search_health_records tool \"\n                    \"to retrieve all the health information related to this question from the health-records store.\",\n        expected_output=\"The health records closely related to the question (keep the original dates and values), no diagnosis.\",\n        agent=retriever,\n    )\n    report_task = Task(\n        description=\"Based on the retrieved health records and the doctor's question '{question}', write a health report covering:\\n\"\n                    \"1. Health status analysis: the relevant indicators, values, reference ranges, and whether they are out of range\\n\"\n                    \"2. Factors that may be related to the question, each naming the record it is based on\\n\"\n                    \"3. 3–5 pieces of personalized health advice\\n\"\n                    \"4. A closing sentence: This report was generated by AI from fictional records, is for reference only and cannot replace a doctor's diagnosis.\\n\"\n                    \"When done, call the save_report tool to save the report as a PDF; for filename use the patient's name followed by 健康建议报告 (health advice report).\",\n        expected_output=\"A report in Chinese with a health status analysis and health advice (at most 600 characters, concise), \"\n                        \"with the save message returned by save_report on the last line.\",\n        agent=reporter,\n    )\n    return Crew(\n        agents=[retriever, reporter],\n        tasks=[retrieve_task, report_task],\n        process=Process.sequential,         # retrieve first, then write the report\n        verbose=True,\n    )\n\n\nllm = LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY)\n# the records are in Chinese, and so is the question: \"Zhang Sanjiu has had frequent headaches lately. Are they related to his earlier checkup results?\"\nresult = build_crew(llm).kickoff(inputs={\"question\": \"张三九最近总是头疼，跟他以前的体检结果有关系吗？\"})\nprint(result.raw)"
   }
  },
  {
   "t": "p",
   "zh": "[▶ 29:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1790) 工具的包装方法和 52 节一样：把 unit test 里测通的函数原样拿过来，加上 `@tool` 装饰器就行。[▶ 30:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1823) 老师又强调了一遍：工具名可以和函数名相同，也可以另起；最重要的是**描述**——先说这个工具做什么，再说每个参数是什么、返回什么。Agent 是看描述来决定用不用、怎么用的。[▶ 31:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1883) 检索工具的描述大意是「按用户的提问，去健康档案库里查找相关的记录」，参数是用户的问题，返回检索到的内容；日志里「工具返回」的那一大段，就是这个函数的返回值。",
   "en": "[▶ 29:50](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1790) Tools are wrapped the same way as in lesson 52: take the function that passed its unit test as it is and add the `@tool` decorator. [▶ 30:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1823) The instructor stresses it again: the tool name can match the function name or be a different one; what matters most is the **description** – first what the tool does, then what each parameter is and what it returns. The agent reads the description to decide whether and how to use the tool. [▶ 31:23](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1883) The retrieval tool's description says roughly “search the health-records store for records related to the user's question”; the parameter is the user's question, and it returns what was retrieved. The long tool-output section in the log is this function's return value."
  },
  {
   "t": "check",
   "q": {
    "zh": "把检索做成工具交给 Agent，和在代码里先检索好、再塞进提示词相比，主要好处是？",
    "en": "Compared with retrieving in code first and stuffing the results into the prompt, what is the main benefit of giving retrieval to the agent as a tool?"
   },
   "options": [
    {
     "zh": "Agent 可以自己决定怎么搜、要不要多搜几次",
     "en": "The agent can decide for itself how to search and whether to search a few more times"
    },
    {
     "zh": "可以不用写检索函数",
     "en": "You don't have to write a retrieval function"
    },
    {
     "zh": "模型调用次数一定更少",
     "en": "There are always fewer model calls"
    },
    {
     "zh": "检索结果一定更准",
     "en": "Retrieval results are always more accurate"
    }
   ],
   "answer": 0,
   "explain": {
    "zh": "工具交给 Agent 后，它可以改写检索词、按需要多次检索。代价是多一次模型调用（先发出工具调用，再根据结果回答），检索函数也还是要你自己写。",
    "en": "Once the agent has the tool, it can rephrase the search terms and search several times as needed. The cost is an extra model call (first it issues the tool call, then it answers from the result), and you still have to write the retrieval function yourself."
   }
  },
  {
   "t": "p",
   "zh": "[▶ 27:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1667) main 脚本和前两集一样：`lifespan` 在服务启动时初始化模型，关闭时可以做清理；[▶ 28:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1728) POST 接口从请求体里取出医生的问题，调用 crew 的 `kickoff`，[▶ 29:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1759) 把结果包成 JSON 返回。`l53_api.py` 的主体：",
   "en": "[▶ 27:47](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1667) The main script is the same as in the previous two episodes: `lifespan` initialises the model when the server starts and can clean up when it shuts down; [▶ 28:48](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1728) the POST endpoint takes the doctor's question from the request body, calls the crew's `kickoff`, [▶ 29:19](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1759) and returns the result wrapped as JSON. The core of `l53_api.py`:"
  },
  {
   "t": "code",
   "file": {
    "zh": "practice/l53_api.py（节选）",
    "en": "practice/l53_api.py (excerpt)"
   },
   "code": {
    "zh": "from l51_api_solution import ChatRequest, chat_response, chat_stream\nfrom l53_health_solution import build_crew\n\nMODELS = {}\n\n\n@asynccontextmanager\nasync def lifespan(app: FastAPI):\n    MODELS[\"llm\"] = LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY)   # 启动时初始化模型\n    print(\"模型初始化完成，服务启动\")\n    yield\n    print(\"正在关闭\")                    # 关闭时可以做清理，这里什么都没做\n\n\napp = FastAPI(lifespan=lifespan)\n\n\n@app.post(\"/v1/chat/completions\")\nasync def chat_completions(req: ChatRequest):\n    question = req.messages[-1][\"content\"]              # 从请求体里取出医生的问题\n    result = await build_crew(MODELS[\"llm\"]).kickoff_async(inputs={\"question\": question})\n    if req.stream:\n        return chat_stream(result.raw, req.model)\n    return chat_response(result.raw, req.model)         # 包成 JSON 返回给调用方",
    "en": "from l51_api_solution import ChatRequest, chat_response, chat_stream\nfrom l53_health_solution import build_crew\n\nMODELS = {}\n\n\n@asynccontextmanager\nasync def lifespan(app: FastAPI):\n    MODELS[\"llm\"] = LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY)   # initialize the model at startup\n    print(\"Model initialized, server starting\")\n    yield\n    print(\"Shutting down\")                    # cleanup could go here; nothing to do in this case\n\n\napp = FastAPI(lifespan=lifespan)\n\n\n@app.post(\"/v1/chat/completions\")\nasync def chat_completions(req: ChatRequest):\n    question = req.messages[-1][\"content\"]              # take the doctor's question from the request body\n    result = await build_crew(MODELS[\"llm\"]).kickoff_async(inputs={\"question\": question})\n    if req.stream:\n        return chat_stream(result.raw, req.model)\n    return chat_response(result.raw, req.model)         # wrap it as JSON and return it to the caller"
   }
  },
  {
   "t": "warn",
   "zh": "[▶ 32:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1945) 老师最后提醒：工具写在 `tools` 文件夹里，它用的**数据库路径和集合名**必须和灌库时完全一样，否则查不到东西。数据库放哪个文件夹都可以，但两边要对上。本课的工具不自己写路径，直接用 `l53_vector_db.py` 里的同一份配置；`DB_PATH` 用 `Path(__file__).parent` 拼出来（10 节），从哪个文件夹运行都能找到。如果路径不对，Chroma 会在新路径建一个**空**库，检索返回空列表——工具这时会提示「请先运行 l53_vector_db.py 灌库」。",
   "en": "[▶ 32:25](https://www.bilibili.com/video/BV1YG7G6eEPR/?p=54&t=1945) The instructor's final reminder: the tool lives in the `tools` folder, and the **database path and collection name** it uses must be exactly the same as for indexing, otherwise it finds nothing. The database can sit in any folder, but both sides must match. This lesson's tool doesn't spell out its own path; it uses the same settings from `l53_vector_db.py`. `DB_PATH` is built from `Path(__file__).parent` (lesson 10), so it is found whichever folder you run from. If the path is wrong, Chroma creates an **empty** store at the new path and retrieval returns an empty list – the tool then says “run l53_vector_db.py first to index it”."
  }
 ],
 "quiz": [
  {
   "q": {
    "zh": "视频里两个工具分别交给了谁？",
    "en": "In the video, who gets each of the two tools?"
   },
   "options": [
    {
     "zh": "两个工具都交给检索专家",
     "en": "Both tools go to the retrieval expert"
    },
    {
     "zh": "检索工具给检索专家，存 PDF 工具给撰写专家",
     "en": "The retrieval tool to the retrieval expert, the save-PDF tool to the report writer"
    },
    {
     "zh": "两个工具都交给撰写专家",
     "en": "Both tools go to the report writer"
    },
    {
     "zh": "工具交给 Crew，所有 Agent 共用",
     "en": "The tools go to the crew, and all agents share them"
    }
   ],
   "answer": 1,
   "explain": {
    "zh": "谁负责哪件事，就把对应的工具给谁：检索专家去档案库查，撰写专家保存报告。",
    "en": "Give each tool to whoever does that job: the retrieval expert searches the records store, the report writer saves the report."
   }
  },
  {
   "q": {
    "zh": "灌库脚本里的 `PAGE_NUMBERS = None` 表示什么？",
    "en": "What does `PAGE_NUMBERS = None` mean in the indexing script?"
   },
   "options": [
    {
     "zh": "一页都不处理",
     "en": "Process no pages at all"
    },
    {
     "zh": "只处理第 1 页",
     "en": "Process only page 1"
    },
    {
     "zh": "会报错，必须给页码列表",
     "en": "It raises an error; you must give a list of page numbers"
    },
    {
     "zh": "处理 PDF 的全部页",
     "en": "Process every page of the PDF"
    }
   ],
   "answer": 3,
   "explain": {
    "zh": "`None` 表示「不挑页」。要只处理某几页，就写成列表，比如 `[2, 3]`。",
    "en": "`None` means “don't pick pages”. To process only certain pages, write a list, e.g. `[2, 3]`."
   }
  },
  {
   "q": {
    "zh": "为什么要先单独测试两个工具（存 PDF、灌库和检索），再运行整个 crew？",
    "en": "Why test the two tools (saving PDFs; indexing and retrieval) on their own before running the whole crew?"
   },
   "options": [
    {
     "zh": "测试不调用大模型、不花钱；能先确认 PDF 能生成、检索结果对不对，出错时也分得清是工具的问题还是模型的问题",
     "en": "The tests don't call the LLM and cost nothing; you confirm first that the PDF gets generated and the retrieval results are right, and when something fails you can tell a tool problem from a model problem"
    },
    {
     "zh": "CrewAI 要求工具必须先运行一次",
     "en": "CrewAI requires every tool to be run once first"
    },
    {
     "zh": "测试后工具会运行得更快",
     "en": "Tools run faster after being tested"
    },
    {
     "zh": "不测试的话 Agent 看不到工具",
     "en": "Without testing, the agent can't see the tools"
    }
   ],
   "answer": 0,
   "explain": {
    "zh": "这是视频反复强调的工作方式：工具提前写好、测通，再交给 Agent。",
    "en": "This is the way of working the video keeps stressing: write the tools in advance, get them working, then give them to the agent."
   }
  },
  {
   "q": {
    "zh": "检索工具里打开的数据库路径和灌库时不一样，会怎样？",
    "en": "What happens if the database path opened in the retrieval tool differs from the one used for indexing?"
   },
   "options": [
    {
     "zh": "自动找到灌库时的那个数据库",
     "en": "It automatically finds the database from indexing"
    },
    {
     "zh": "程序立刻报错退出",
     "en": "The program fails with an error right away"
    },
    {
     "zh": "打开（或新建）的是另一个空库，检索不到任何档案",
     "en": "It opens (or creates) a different, empty store and retrieves no records at all"
    },
    {
     "zh": "检索结果会变慢",
     "en": "Retrieval gets slower"
    }
   ],
   "answer": 2,
   "explain": {
    "zh": "Chroma 会在新路径建一个空库，检索返回空列表（本机验证过）。所以视频最后专门提醒：路径和集合名要和灌库时一致。",
    "en": "Chroma creates an empty store at the new path, and retrieval returns an empty list (verified locally). That's why the video ends with a special reminder: the path and collection name must match those used for indexing."
   }
  },
  {
   "q": {
    "zh": "同样问「头疼和体检记录有没有关系」，为什么向量检索能把「每晚只睡 5.5 小时、每天 3 杯咖啡」的生活方式记录也找出来？",
    "en": "When you ask whether the headaches are related to the checkup records, why does vector search also find the lifestyle record saying “sleeps only 5.5 hours a night, 3 cups of coffee a day”?"
   },
   "options": [
    {
     "zh": "因为这段记录最长",
     "en": "Because that record is the longest"
    },
    {
     "zh": "向量检索比较的是意思，不要求有相同的字词",
     "en": "Vector search compares meaning; it doesn't need the same words"
    },
    {
     "zh": "因为它排在 PDF 的第一页",
     "en": "Because it is on the first page of the PDF"
    },
    {
     "zh": "因为 top_n 设成了 5，所以随便取了 5 段",
     "en": "Because top_n is 5, so it just grabbed any 5 chunks"
    }
   ],
   "answer": 1,
   "explain": {
    "zh": "embedding 把文字变成表示意思的向量，意思相近的向量也相近。它和「头疼」没有相同的字，但都和健康状况有关。",
    "en": "Embedding turns text into vectors that represent meaning, and texts with similar meanings get similar vectors. That record shares no words with “headache”, but both are about health."
   }
  },
  {
   "q": {
    "zh": "你想用这个助手分析家人真实的体检报告，下面哪种做法最妥当？",
    "en": "You want to use this assistant to analyse a family member's real checkup report. Which approach is most appropriate?"
   },
   "options": [
    {
     "zh": "直接把完整报告发给云端模型，结论照着执行",
     "en": "Send the full report straight to a cloud model and follow its conclusions"
    },
    {
     "zh": "只要不公开结果就没问题",
     "en": "It's fine as long as you don't publish the results"
    },
    {
     "zh": "把姓名换成拼音就安全了",
     "en": "Replacing the name with pinyin makes it safe"
    },
    {
     "zh": "先征得本人同意、去掉身份信息或改用本地模型，结果只作参考并咨询医生",
     "en": "First get the person's consent, remove identifying details or use a local model, and treat the result only as a reference and consult a doctor"
    }
   ],
   "answer": 3,
   "explain": {
    "zh": "健康数据是敏感个人信息；AI 的分析可能出错，不能代替医生诊断。",
    "en": "Health data is sensitive personal information; AI analysis can be wrong and cannot replace a doctor's diagnosis."
   }
  }
 ],
 "fill": [
  {
   "title": {
    "zh": "检索工具 + 两个 Agent",
    "en": "The retrieval tool + two agents"
   },
   "code": {
    "zh": "db = [[MyVectorDBConnector]]()\n\n@[[tool]](\"search_health_records\")\ndef search_health_records(question: [[str]]) -> str:\n    \"\"\"按照医生提出的问题，到健康档案库里查找相关的记录。question 是医生的问题，返回检索到的档案原文。\"\"\"\n    docs = db.[[search]](question, top_n=5)\n    if not docs:\n        return \"没有找到相关档案。\"\n    return \"\\n\\n---\\n\\n\".[[join]](docs)\n\nretriever = Agent(role=\"健康档案检索专家\", goal=\"检索相关记录\", backstory=\"只引用档案原文。\",\n                  llm=llm, [[tools]]=[search_health_records])\nreporter = Agent(role=\"健康报告撰写专家\", goal=\"写报告并存成 PDF\", backstory=\"有医学背景。\",\n                 llm=llm, tools=[[[save_report]]])\nretrieve_task = Task(description=\"医生的问题是：「[[{question}]]」。请用检索工具查档案。\",\n                     expected_output=\"相关档案记录\", agent=[[retriever]])\ncrew = Crew(agents=[retriever, reporter], tasks=[retrieve_task, report_task],\n            process=Process.[[sequential]])",
    "en": "db = [[MyVectorDBConnector]]()\n\n@[[tool]](\"search_health_records\")\ndef search_health_records(question: [[str]]) -> str:\n    \"\"\"Search the health-records store for the records related to the doctor's question. question is the doctor's question; returns the retrieved record texts.\"\"\"\n    docs = db.[[search]](question, top_n=5)\n    if not docs:\n        return \"No related records found.\"\n    return \"\\n\\n---\\n\\n\".[[join]](docs)\n\nretriever = Agent(role=\"Health Records Retrieval Expert\", goal=\"Retrieve the related records\", backstory=\"Quotes only the original records.\",\n                  llm=llm, [[tools]]=[search_health_records])\nreporter = Agent(role=\"Health Report Writer\", goal=\"Write the report and save it as a PDF\", backstory=\"Has a medical background.\",\n                 llm=llm, tools=[[[save_report]]])\nretrieve_task = Task(description=\"The doctor's question is: '[[{question}]]'. Use the retrieval tool to search the records.\",\n                     expected_output=\"The related records\", agent=[[retriever]])\ncrew = Crew(agents=[retriever, reporter], tasks=[retrieve_task, report_task],\n            process=Process.[[sequential]])"
   },
   "explain": {
    "zh": "打开和灌库时同一个向量库；`@tool` 包装 `db.search`，结果拼成一个字符串返回；检索工具给检索专家、存 PDF 工具给撰写专家；任务描述用 `{question}` 占位符；两个任务按顺序执行。",
    "en": "Open the same vector store as for indexing; `@tool` wraps `db.search` and joins the results into one string; the retrieval tool goes to the retrieval expert and the save-PDF tool to the report writer; the task description uses the `{question}` placeholder; the two tasks run in order."
   }
  }
 ],
 "write": [
  {
   "title": {
    "zh": "手写：按记录切块",
    "en": "Hand-write: chunking by record"
   },
   "run": true,
   "task": {
    "zh": "灌库的第二步是切块。不看上面的代码，写出 `split_records(text)`：\n1. 逐行处理，先去掉每行两头的空白\n2. 以「【」开头的行开始新的一块；其他非空的行用换行接到当前这一块后面\n3. 第一个标题之前的行（比如总标题）不要\n\n然后切一下给出的文字，打印块数和每块的标题。纯 Python，可以直接在网页里运行。",
    "en": "The second step of indexing is chunking. Without looking at the code above, write `split_records(text)`:\n1. Go line by line, first stripping the whitespace at both ends of each line\n2. A line starting with “【” starts a new chunk; other non-empty lines are appended to the current chunk with a newline\n3. Drop the lines before the first heading (such as the overall title)\n\nThen chunk the given text and print the number of chunks and the heading of each one. Plain Python – you can run it right here in the page."
   },
   "starter": {
    "zh": "text = \"\"\"健康档案库（虚构）\n【张三九｜基本信息】\n姓名：张三九。性别：男。身高 175 cm。\n家族史：父亲有高血压。\n【张三九｜2026-08-15 年度体检】\n血压 136/86 mmHg，心率 78 次/分。\n空腹血糖 6.3 mmol/L。\n\n【李四一｜2026-07-03 年度体检】\n血红蛋白 108 g/L，轻度贫血。\n\"\"\"\n\n# 1. 函数 split_records(text)：逐行处理，先去掉每行两头的空白；以「【」开头的行开始新的一块，\n#    其他非空的行用换行接到当前这一块后面；第一个标题之前的行不要\n\n\n# 2. 切块，打印一共几块，再打印每一块的第一行（标题）\n",
    "en": "text = \"\"\"Health records (fictional)\n【Zhang Sanjiu | basic information】\nName: Zhang Sanjiu. Sex: male. Height 175 cm.\nFamily history: father has high blood pressure.\n【Zhang Sanjiu | 2026-08-15 annual checkup】\nBlood pressure 136/86 mmHg, heart rate 78 bpm.\nFasting blood glucose 6.3 mmol/L.\n\n【Li Siyi | 2026-07-03 annual checkup】\nHemoglobin 108 g/L, mild anemia.\n\"\"\"\n\n# 1. Function split_records(text): go line by line, stripping the whitespace at both ends of each line first; a line starting with \"【\" starts a new chunk,\n#    other non-empty lines are added to the current chunk after a newline; lines before the first heading are dropped\n\n\n# 2. Chunk the text, print how many chunks there are, then print the first line (the heading) of each chunk\n"
   },
   "solution": {
    "zh": "text = \"\"\"健康档案库（虚构）\n【张三九｜基本信息】\n姓名：张三九。性别：男。身高 175 cm。\n家族史：父亲有高血压。\n【张三九｜2026-08-15 年度体检】\n血压 136/86 mmHg，心率 78 次/分。\n空腹血糖 6.3 mmol/L。\n\n【李四一｜2026-07-03 年度体检】\n血红蛋白 108 g/L，轻度贫血。\n\"\"\"\n\n# 1. 函数 split_records(text)：逐行处理，先去掉每行两头的空白；以「【」开头的行开始新的一块，\n#    其他非空的行用换行接到当前这一块后面；第一个标题之前的行不要\ndef split_records(text):\n    chunks = []\n    for line in text.splitlines():\n        line = line.strip()\n        if line.startswith(\"【\"):\n            chunks.append(line)\n        elif line and chunks:\n            chunks[-1] += \"\\n\" + line\n    return chunks\n\n\n# 2. 切块，打印一共几块，再打印每一块的第一行（标题）\nchunks = split_records(text)\nprint(len(chunks))\nfor chunk in chunks:\n    print(chunk.splitlines()[0])\n",
    "en": "text = \"\"\"Health records (fictional)\n【Zhang Sanjiu | basic information】\nName: Zhang Sanjiu. Sex: male. Height 175 cm.\nFamily history: father has high blood pressure.\n【Zhang Sanjiu | 2026-08-15 annual checkup】\nBlood pressure 136/86 mmHg, heart rate 78 bpm.\nFasting blood glucose 6.3 mmol/L.\n\n【Li Siyi | 2026-07-03 annual checkup】\nHemoglobin 108 g/L, mild anemia.\n\"\"\"\n\n# 1. Function split_records(text): go line by line, stripping the whitespace at both ends of each line first; a line starting with \"【\" starts a new chunk,\n#    other non-empty lines are added to the current chunk after a newline; lines before the first heading are dropped\ndef split_records(text):\n    chunks = []\n    for line in text.splitlines():\n        line = line.strip()\n        if line.startswith(\"【\"):\n            chunks.append(line)\n        elif line and chunks:\n            chunks[-1] += \"\\n\" + line\n    return chunks\n\n\n# 2. Chunk the text, print how many chunks there are, then print the first line (the heading) of each chunk\nchunks = split_records(text)\nprint(len(chunks))\nfor chunk in chunks:\n    print(chunk.splitlines()[0])\n"
   },
   "checks": [
    {
     "re": "def\\s+split_records\\(\\s*\\w+\\s*\\)",
     "zh": "定义了 `split_records(text)`",
     "en": "Defines `split_records(text)`"
    },
    {
     "re": "\\.splitlines\\(\\)",
     "zh": "用 `splitlines()` 逐行处理",
     "en": "Uses `splitlines()` to go line by line"
    },
    {
     "re": "\\.startswith\\(\\s*[\\\"']【[\\\"']\\s*\\)",
     "zh": "用 `startswith(\"【\")` 判断标题行",
     "en": "Uses `startswith(\"【\")` to spot heading lines"
    },
    {
     "re": "\\.append\\(",
     "zh": "遇到标题时 `append` 一块新的",
     "en": "Starts a new chunk with `append` at each heading"
    },
    {
     "re": "\\[-1\\]\\s*\\+=",
     "zh": "其他行接到最后一块 `chunks[-1] += ...`",
     "en": "Adds other lines to the last chunk: `chunks[-1] += ...`"
    },
    {
     "re": "return\\s+\\w+",
     "zh": "返回切好的列表",
     "en": "Returns the list of chunks"
    }
   ]
  },
  {
   "title": {
    "zh": "手写：把检索函数交给检索专家",
    "en": "Hand-write: give the retrieval function to the retrieval expert"
   },
   "task": {
    "zh": "不看上面的代码，写出：\n1. 用 `@tool` 定义 `search_health_records(question: str) -> str`，带文档字符串：调用 `db.search(question, top_n=5)`，没结果时返回一句提示，有结果时用分隔线拼成一个字符串\n2. 检索专家 Agent，用 `tools=[...]` 拿到这个工具\n3. 检索任务，描述里用 `{question}` 占位符，交给检索专家\n\n这一步只创建对象，不调用模型。完整的 crew 可以接着补全 `practice/l53_health_todo.py`（先运行 `l53_vector_db.py` 灌库）。",
    "en": "Without looking at the code above, write:\n1. With `@tool`, define `search_health_records(question: str) -> str` with a docstring: it calls `db.search(question, top_n=5)`, returns a short message when there are no results, and otherwise joins the results into one string with divider lines\n2. The retrieval expert agent, which gets this tool via `tools=[...]`\n3. The retrieval task, with the `{question}` placeholder in its description, assigned to the retrieval expert\n\nThis step only creates objects; it doesn't call the model. For the full crew, go on to complete `practice/l53_health_todo.py` (run `l53_vector_db.py` first to index the records)."
   },
   "starter": {
    "zh": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import LLM, Agent, Task\nfrom crewai.tools import tool\n\nfrom l53_vector_db import MyVectorDBConnector\nfrom llm import API_KEY, BASE_URL, MODEL\n\ndb = MyVectorDBConnector()          # 打开 l53_vector_db.py 灌好的集合\nllm = LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY)\n\n# 1. 检索工具：名字 search_health_records，一个字符串参数（医生的问题），写清文档字符串；\n#    用 db 的 search 方法取前 5 段，没有结果时返回一句提示，有结果时用分隔线拼成一个字符串返回\n\n\n# 2. 检索专家 Agent（健康档案检索专家），把工具交给它\n\n\n# 3. 检索任务：描述里用占位符放医生的问题，并要求使用检索工具；交给检索专家\n",
    "en": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import LLM, Agent, Task\nfrom crewai.tools import tool\n\nfrom l53_vector_db import MyVectorDBConnector\nfrom llm import API_KEY, BASE_URL, MODEL\n\ndb = MyVectorDBConnector()          # open the collection indexed by l53_vector_db.py\nllm = LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY)\n\n# 1. The retrieval tool: named search_health_records, one string parameter (the doctor's question), with a clear docstring;\n#    use db's search method to get the top 5 chunks; return a short message if there are no results, otherwise join them into one string with divider lines and return it\n\n\n# 2. The retrieval expert Agent (Health Records Retrieval Expert); give it the tool\n\n\n# 3. The retrieval task: a placeholder in the description holds the doctor's question, and it asks for the retrieval tool; give it to the retrieval expert\n"
   },
   "solution": {
    "zh": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # practice 的上一级就是项目文件夹\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import LLM, Agent, Task\nfrom crewai.tools import tool\n\nfrom l53_vector_db import MyVectorDBConnector\nfrom llm import API_KEY, BASE_URL, MODEL\n\ndb = MyVectorDBConnector()          # 打开 l53_vector_db.py 灌好的集合\nllm = LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY)\n\n# 1. 检索工具：名字 search_health_records，一个字符串参数（医生的问题），写清文档字符串；\n#    用 db 的 search 方法取前 5 段，没有结果时返回一句提示，有结果时用分隔线拼成一个字符串返回\n@tool(\"search_health_records\")\ndef search_health_records(question: str) -> str:\n    \"\"\"按照医生提出的问题，到健康档案库里查找相关的记录。\n    question：医生的问题。返回检索到的档案原文，用分隔线隔开。\"\"\"\n    docs = db.search(question, top_n=5)\n    if not docs:\n        return \"没有找到相关档案，请先灌库。\"\n    return \"\\n\\n---\\n\\n\".join(docs)\n\n\n# 2. 检索专家 Agent（健康档案检索专家），把工具交给它\nretriever = Agent(\n    role=\"健康档案检索专家\",\n    goal=\"根据医生询问的健康问题，从健康档案库中检索出所有相关的记录\",\n    backstory=\"你是专业的健康档案检索专家，只引用档案原文，不猜测、不编造。\",\n    tools=[search_health_records],\n    llm=llm,\n)\n\n# 3. 检索任务：描述里用占位符放医生的问题，并要求使用检索工具；交给检索专家\nretrieve_task = Task(\n    description=\"医生的问题是：「{question}」。请使用 search_health_records 工具检索相关的健康档案。\",\n    expected_output=\"与问题密切相关的档案记录（保留原始日期和数值），不做诊断。\",\n    agent=retriever,\n)\n",
    "en": "import os\nos.environ.setdefault(\"CREWAI_TRACING_ENABLED\", \"false\")\nPROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # the folder above practice = the project folder\nos.environ.setdefault(\"CREWAI_STORAGE_DIR\", os.path.join(PROJECT_DIR, \".cache\", \"crewai\"))\n\nfrom crewai import LLM, Agent, Task\nfrom crewai.tools import tool\n\nfrom l53_vector_db import MyVectorDBConnector\nfrom llm import API_KEY, BASE_URL, MODEL\n\ndb = MyVectorDBConnector()          # open the collection indexed by l53_vector_db.py\nllm = LLM(model=f\"openai/{MODEL}\", base_url=BASE_URL, api_key=API_KEY)\n\n# 1. The retrieval tool: named search_health_records, one string parameter (the doctor's question), with a clear docstring;\n#    use db's search method to get the top 5 chunks; return a short message if there are no results, otherwise join them into one string with divider lines and return it\n@tool(\"search_health_records\")\ndef search_health_records(question: str) -> str:\n    \"\"\"Search the health-records store for the records related to the doctor's question.\n    question: the doctor's question. Returns the retrieved original record texts, separated by divider lines.\"\"\"\n    docs = db.search(question, top_n=5)\n    if not docs:\n        return \"No related records found; index the store first.\"\n    return \"\\n\\n---\\n\\n\".join(docs)\n\n\n# 2. The retrieval expert Agent (Health Records Retrieval Expert); give it the tool\nretriever = Agent(\n    role=\"Health Records Retrieval Expert\",\n    goal=\"Based on the health question the doctor asks, retrieve all the related records from the health-records store\",\n    backstory=\"You are a professional health-records retrieval expert. You quote only the original records; you never guess or make things up.\",\n    tools=[search_health_records],\n    llm=llm,\n)\n\n# 3. The retrieval task: a placeholder in the description holds the doctor's question, and it asks for the retrieval tool; give it to the retrieval expert\nretrieve_task = Task(\n    description=\"The doctor's question is: '{question}'. Use the search_health_records tool to retrieve the related health records.\",\n    expected_output=\"The records closely related to the question (keep the original dates and values), no diagnosis.\",\n    agent=retriever,\n)\n"
   },
   "checks": [
    {
     "re": "@tool\\(\\s*[\\\"']search_health_records[\\\"']",
     "zh": "用 `@tool(\"search_health_records\")` 装饰",
     "en": "Decorated with `@tool(\"search_health_records\")`"
    },
    {
     "re": "def\\s+search_health_records\\(\\s*question\\s*:\\s*str\\s*\\)\\s*->\\s*str",
     "zh": "参数 `question: str`，返回 `str`",
     "en": "Parameter `question: str`, returns `str`"
    },
    {
     "re": "def\\s+search_health_records[^\\n]*\\n\\s+(\\\"\\\"\\\"|''')",
     "zh": "有文档字符串",
     "en": "Has a docstring"
    },
    {
     "re": "db\\.search\\(\\s*question",
     "zh": "调用 `db.search(question, ...)`",
     "en": "Calls `db.search(question, ...)`"
    },
    {
     "re": "if\\s+not\\s+\\w+\\s*:\\s*\\n\\s+return",
     "zh": "没结果时返回提示",
     "en": "Returns a message when there are no results"
    },
    {
     "re": "[\"']\\.join\\(",
     "zh": "用分隔线把几段拼成一个字符串",
     "en": "Joins the chunks into one string with divider lines"
    },
    {
     "re": "tools\\s*=\\s*\\[\\s*search_health_records\\s*\\]",
     "zh": "`tools=[search_health_records]`",
     "en": "`tools=[search_health_records]`"
    },
    {
     "re": "\\{question\\}",
     "zh": "任务描述里有 `{question}`",
     "en": "The task description contains `{question}`"
    },
    {
     "re": "agent\\s*=\\s*retriever",
     "zh": "任务交给 `retriever`",
     "en": "The task is assigned to `retriever`"
    }
   ]
  }
 ],
 "pitfalls": [
  {
   "zh": "把真实病历发给云端模型，或者把 AI 的分析当成诊断。",
   "en": "Sending real medical records to a cloud model, or treating the AI's analysis as a diagnosis."
  },
  {
   "zh": "不先测检索就直接跑整个 crew：检索错了，还以为是模型分析得不好。",
   "en": "Running the whole crew without testing retrieval first: when retrieval goes wrong, you think the model's analysis is the problem."
  },
  {
   "zh": "工具里的数据库路径、集合名和灌库时不一致，打开的是一个空库，什么都查不到。",
   "en": "The database path or collection name in the tool doesn't match the one used for indexing, so it opens an empty store and finds nothing."
  },
  {
   "zh": "改了档案没有重新灌库；或者换了向量模型还往旧集合里写，报向量维度不一致。删掉 `output\\l53_chromadb` 重灌即可。",
   "en": "Changing the records without re-indexing; or switching embedding models and still writing into the old collection, which fails with an embedding dimension mismatch. Delete `output\\l53_chromadb` and index again."
  },
  {
   "zh": "用 `if not page_numbers` 判断「没传页码」：传了空列表也会被当成「全部页」，应该写 `is None`。",
   "en": "Checking “no page numbers given” with `if not page_numbers`: an empty list is then treated as “all pages” too; write `is None`."
  },
  {
   "zh": "工具描述写得含糊，检索专家不知道该把什么当作 `question` 传进去。",
   "en": "A vague tool description, so the retrieval expert doesn't know what to pass in as `question`."
  }
 ],
 "recap": [
  {
   "zh": "RAG 离线：加载 PDF → 切块 → 向量化 → 存进向量库；在线：问题向量化 → 相似度检索 → 和问题一起交给模型。",
   "en": "RAG offline: load the PDF → chunk → embed → store in the vector store; online: embed the question → similarity search → hand the results to the model together with the question."
  },
  {
   "zh": "这一集把「检索」做成工具：`@tool` 包装 `db.search`，交给检索专家；存 PDF 工具交给撰写专家；两个任务按顺序执行。",
   "en": "This episode makes “retrieval” a tool: `@tool` wraps `db.search`, and the tool goes to the retrieval expert; the save-PDF tool goes to the report writer; the two tasks run in order."
  },
  {
   "zh": "先测工具：存 PDF（52 节的 `save_report`）、灌库和检索（`l53_vector_db.py`），都没问题再跑 crew。",
   "en": "Test the tools first: saving PDFs (lesson 52's `save_report`), indexing and retrieval (`l53_vector_db.py`); run the crew only once they work."
  },
  {
   "zh": "向量库脚本：`PersistentClient(path)` + 集合 `demo001`；`add_documents` 每批 25 段；`search` 返回最相近的 top_n 段；`page_numbers=None` 表示全部页。",
   "en": "The vector-store script: `PersistentClient(path)` + the collection `demo001`; `add_documents` goes 25 chunks per batch; `search` returns the top_n closest chunks; `page_numbers=None` means all pages."
  },
  {
   "zh": "工具的描述最重要；工具里用的数据库路径和集合名必须和灌库时一致。",
   "en": "The tool's description matters most; the database path and collection name used in the tool must match those used for indexing."
  },
  {
   "zh": "跑完要核对检索到的数据；效果不好主要调提示词（角色、目标、背景故事、任务描述、期望输出）。",
   "en": "After a run, check the retrieved data; when results are poor, mainly tune the prompts (role, goal, backstory, task description, expected output)."
  },
  {
   "zh": "健康数据敏感：练习用虚构数据，真实数据要征得同意、去掉身份信息或用本地模型；AI 报告只供参考。",
   "en": "Health data is sensitive: practise with fictional data; for real data get consent, remove identifying details or use a local model; an AI report is for reference only."
  }
 ],
 "files": [
  {
   "path": "practice/data/l53_health_records.md",
   "zh": "虚构的健康档案原文（张三九、李四一、王五六，共 9 条记录），方便阅读和核对。",
   "en": "The fictional health records as text (Zhang Sanjiu, Li Siyi, Wang Wuliu; 9 records in all, written in Chinese), easy to read and check against."
  },
  {
   "path": "practice/data/l53_health_records.pdf",
   "zh": "由上面的 .md 生成的 PDF，当作视频里的「健康档案.pdf」来灌库。",
   "en": "The PDF generated from the .md above; it plays the role of the video's health-records PDF and is what gets indexed."
  },
  {
   "path": "practice/l53_make_pdf.py",
   "zh": "改了 .md 之后用它重新生成 PDF（然后删掉 `output\\l53_chromadb` 重新灌库）。",
   "en": "After editing the .md, regenerate the PDF with this (then delete `output\\l53_chromadb` and index again)."
  },
  {
   "path": "practice/l53_embedding.py",
   "zh": "本机的向量模型 bge-small-zh（替代视频里的 embedding 接口，不需要会写）。",
   "en": "The local embedding model bge-small-zh (replaces the video's embedding API; you don't need to be able to write it)."
  },
  {
   "path": "practice/l53_vector_db.py",
   "zh": "视频的向量库测试脚本：读 PDF、切块、分批灌进 Chroma，再测试检索（不调大模型、不花钱）。",
   "en": "The video's vector-store test script: read the PDF, chunk it, index it into Chroma in batches, then test retrieval (no LLM calls, no cost)."
  },
  {
   "path": "practice/l53_health_todo.py",
   "zh": "练习：补全检索工具、两个 Agent、检索任务和 Crew。",
   "en": "Exercise: complete the retrieval tool, the two agents, the retrieval task and the crew."
  },
  {
   "path": "practice/l53_health_solution.py",
   "zh": "参考答案：健康档案助手，报告存成 `output/张三九健康建议报告.pdf`（约 4 次模型调用）；可以在命令行后面加自己的问题。",
   "en": "Solution: the health-records assistant; it saves the report as `output/张三九健康建议报告.pdf` (about 4 model calls); you can add your own question after the command."
  },
  {
   "path": "practice/l53_api.py",
   "zh": "视频的 main 脚本：8012 端口的服务，用 `l51_api_client.py` 发问题。",
   "en": "The video's main script: a server on port 8012; send questions with `l51_api_client.py`."
  }
 ]
});
