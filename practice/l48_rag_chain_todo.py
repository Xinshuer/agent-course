"""第 48 节练习：用 LCEL 串一条 RAG 链（按 TODO 补全）
Lesson 48 exercise: build an LCEL RAG chain (fill in the TODOs).

运行环境 / Environment: .venv
运行 / Run (在 practice 文件夹里 / from the practice folder):
    & ..\\.venv\\Scripts\\python.exe l48_rag_chain_todo.py
需要 / Needs: DEEPSEEK_API_KEY（调用 1 次模型 / one model call）
参考答案 / Solution: l48_rag_chain_solution.py
"""
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_deepseek import ChatDeepSeek

from l46_retriever_solution import build_retriever     # 第 46 节写好的检索器 / the retriever from lesson 46
from llm import API_KEY, MODEL

retriever = build_retriever(k=2)                       # 和视频一样每次取 2 段 / 2 chunks, as in the video
model = ChatDeepSeek(model=MODEL, api_key=API_KEY)

# TODO 1: 用 ChatPromptTemplate.from_template 写一个 RAG 提示词，要有两个占位符 {context} 和 {question}，
#         并要求模型「只根据资料回答，资料里没有就说没提到」
# TODO 1: write a RAG prompt with ChatPromptTemplate.from_template that has {context} and {question}
#         and tells the model to answer only from the material
prompt = ...


# TODO 2: 写 format_docs(docs)：把每个 Document 的 page_content 用两个换行连起来，返回一个字符串
# TODO 2: write format_docs(docs): join every page_content with "\n\n" and return the string
def format_docs(docs):
    ...


# TODO 3: 用 | 串起整条链：
#   第一步是一个字典：{"context": retriever | format_docs, "question": RunnablePassthrough()}
#   然后依次接 prompt、model、StrOutputParser()
# TODO 3: chain it with |: a dict {"context": ..., "question": ...} → prompt → model → StrOutputParser()
rag_chain = ...

if __name__ == "__main__":
    # TODO 4: 用 rag_chain.invoke("青松模型有多少参数？") 提问并打印回答
    #         （做完后试试换成 rag_chain.stream(...)，一段一段地打印）
    # TODO 4: ask with rag_chain.invoke(...) and print the answer (then try rag_chain.stream)
    pass
