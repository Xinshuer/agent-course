"""第 53 节辅助模块：本地向量（embedding）模型 —— 替代视频里调用的云端 embedding 接口
Lesson 53 helper: a local embedding model - stands in for the cloud embedding API the video calls

视频用 OpenAI 或（经 OneAPI 转发的）通义千问的 embedding 接口把文字变成向量，需要对应的 key；
DeepSeek 没有 embedding 接口。这里在本机 CPU 上运行 BAAI/bge-small-zh-v1.5（中文小模型，
每段文字变成 512 个数），不联网、不花钱。模型文件就是 17 节 fastembed 下载到
.cache\\fastembed 的那一份；.venv-crewai 里没有 fastembed，所以直接用
onnxruntime + tokenizers（chromadb 自带的依赖）运行它，结果和 fastembed 完全一样。
The video turns text into vectors with OpenAI's or (via OneAPI) Qwen's embedding API, which needs a key;
DeepSeek has no embeddings API. This runs BAAI/bge-small-zh-v1.5 (a small Chinese model, 512 numbers per
text) on your CPU, offline and free. The model files are the ones fastembed downloaded to
.cache\\fastembed in lesson 17; .venv-crewai has no fastembed, so the model is run with
onnxruntime + tokenizers (dependencies of chromadb) - the vectors are identical to fastembed's.

用法 / Usage:
    from l53_embedding import embed
    vectors = embed(["一段文字", "另一段文字"])     # 每段文字一个 512 维的列表 / one 512-number list per text

这是「工具细节」，不需要会写；视频里对应的是 get_embeddings 函数。
These are "plumbing" details you don't need to write; the video's counterpart is its get_embeddings function.

运行环境 / Environment: .venv-crewai（.venv 也可以 / .venv works too）
自测 / Self-test:
    cd practice
    & ..\\.venv-crewai\\Scripts\\python.exe l53_embedding.py
需要 / Needs: 17 节下载过的模型。没有的话先运行一次 / the model downloaded in lesson 17; if missing, run once:
    & ..\\.venv\\Scripts\\python.exe l17_local_embedding.py
"""
from pathlib import Path

import numpy as np
import onnxruntime as ort
from tokenizers import Tokenizer

PROJECT_DIR = Path(__file__).resolve().parent.parent   # practice 的上一级 = 项目文件夹 / the project folder
MODEL_DIR = PROJECT_DIR / ".cache" / "fastembed" / "models--Qdrant--bge-small-zh-v1.5" / "snapshots"

_model = {}          # 第一次用到时才加载，之后复用 / loaded on first use, then reused


def _load():
    if not _model:
        if not MODEL_DIR.exists():
            raise FileNotFoundError(
                "没找到 bge-small-zh 模型。先用 .venv 运行一次 l17_local_embedding.py 下载它。\n"
                "bge-small-zh model not found. Run l17_local_embedding.py once with .venv to download it."
            )
        snapshot = next(MODEL_DIR.iterdir())
        tokenizer = Tokenizer.from_file(str(snapshot / "tokenizer.json"))
        tokenizer.enable_truncation(max_length=512)       # 太长的文字截断 / cut very long texts
        tokenizer.enable_padding()                        # 一批里补成一样长 / pad a batch to equal length
        _model["tokenizer"] = tokenizer
        _model["session"] = ort.InferenceSession(str(snapshot / "model_optimized.onnx"),
                                                 providers=["CPUExecutionProvider"])
    return _model["tokenizer"], _model["session"]


def embed(texts):
    """把一组文字变成一组向量（每个向量 512 个数，长度已归一化为 1）。
    Turn a list of texts into a list of vectors (512 numbers each, normalised to length 1)."""
    tokenizer, session = _load()
    encodings = tokenizer.encode_batch(list(texts))
    feed = {
        "input_ids": np.array([e.ids for e in encodings], dtype=np.int64),
        "attention_mask": np.array([e.attention_mask for e in encodings], dtype=np.int64),
        "token_type_ids": np.array([e.type_ids for e in encodings], dtype=np.int64),
    }
    vectors = session.run(None, feed)[0][:, 0]              # bge 用第一个位置（[CLS]）的输出 / bge uses [CLS]
    vectors = vectors / np.linalg.norm(vectors, axis=1, keepdims=True)
    return vectors.tolist()


if __name__ == "__main__":
    a, b, c = embed(["头疼和高血压有关吗", "血压偏高可能引起头痛", "右下后牙遇冷酸痛"])
    print("向量长度 / vector length:", len(a))
    # 两个向量都归一化了，点积就是余弦相似度：越接近 1 越相似
    # Both vectors are normalised, so the dot product is the cosine similarity: closer to 1 = more similar
    print("头疼 vs 血压偏高:", round(float(np.dot(a, b)), 3))
    print("头疼 vs 牙酸痛  :", round(float(np.dot(a, c)), 3))
