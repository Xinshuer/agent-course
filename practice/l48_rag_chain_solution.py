"""第 48 节参考答案：用 LCEL 把检索器、提示词、模型、解析器串成一条 RAG 链（视频的例子三）
Lesson 48 solution: an LCEL RAG chain - retriever, prompt, model and parser joined with |
(the video's example 3).

运行环境 / Environment: .venv
运行 / Run (在 practice 文件夹里 / from the practice folder):
    & ..\\.venv\\Scripts\\python.exe l48_rag_chain_solution.py
需要 / Needs: DEEPSEEK_API_KEY（调用 1 次模型 / one model call）
检索部分复用第 46 节的 build_retriever（FAISS + 本地向量模型，不需要额外的 key）；和视频一样每次取 2 段。
Retrieval reuses build_retriever from lesson 46 (FAISS + local embeddings, no extra key);
like the video, it fetches 2 chunks per question.
"""
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_deepseek import ChatDeepSeek

from l46_retriever_solution import build_retriever
from llm import API_KEY, MODEL

retriever = build_retriever(k=2)
model = ChatDeepSeek(model=MODEL, api_key=API_KEY)

prompt = ChatPromptTemplate.from_template(
    "只根据下面的资料回答问题。资料里没有的，就回答「资料里没有提到」。\n\n"
    "资料：\n{context}\n\n"
    "问题：{question}"
)


def format_docs(docs):
    """把检索到的 Document 列表拼成一段文字 / join the retrieved Documents into one string"""
    return "\n\n".join([d.page_content for d in docs])


rag_chain = (
    {
        "context": retriever | format_docs,     # 问题 → 检索 → 拼成文字 / question → retrieve → text
        "question": RunnablePassthrough(),      # 问题原样传过去 / the question itself
    }
    | prompt
    | model
    | StrOutputParser()
)

if __name__ == "__main__":
    question = "青松模型有多少参数？"
    print("问题 / Question:", question)
    print("回答 / Answer: ", end="")
    for piece in rag_chain.stream(question):    # 整条链也能流式输出 / the whole chain can stream
        print(piece, end="", flush=True)
    print()
