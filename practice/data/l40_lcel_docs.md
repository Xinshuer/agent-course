# LCEL 速查笔记（第 40 节代码助手的参考文档）
# LCEL cheat sheet (reference docs for the lesson 40 coding assistant)

这份笔记是课程自己写的，对应本机安装的 langchain-core 1.x。代码助手会把整份笔记放进系统提示词，
让模型「照着文档」写代码。你也可以换成自己常用的库的文档。
Written for this course against the installed langchain-core 1.x. The coding assistant puts the whole
file into its system prompt so the model codes "from the docs". Swap in docs for any library you use.

## 1. Runnable：LCEL 里的每个零件 / every LCEL building block

LCEL（LangChain Expression Language）把提示词模板、模型、输出解析器、普通函数都看成 Runnable。
每个 Runnable 都有同样的方法：

- `invoke(input)`：处理一个输入，返回一个输出
- `batch([input1, input2])`：一次处理多个输入，返回列表
- `stream(input)`：一块一块地返回输出（生成器）
- `ainvoke` / `abatch` / `astream`：对应的异步版本

## 2. 用 | 把 Runnable 串成链 / chaining with |

`a | b` 得到一个 RunnableSequence：先运行 a，把 a 的输出交给 b。

```python
from langchain_core.runnables import RunnableLambda

add_one = RunnableLambda(lambda x: x + 1)
double = RunnableLambda(lambda x: x * 2)
chain = add_one | double
print(chain.invoke(3))         # 8
print(chain.batch([1, 2, 3]))  # [4, 6, 8]
```

## 3. RunnableLambda：把普通函数变成 Runnable / wrap a plain function

`RunnableLambda(函数)` 把一个只接收一个参数的函数包装成 Runnable。
在 `|` 的一边已经是 Runnable 时，另一边的普通函数会被自动转换成 RunnableLambda。
没有真实模型可用时（比如自动测试），可以用 RunnableLambda 写一个「假模型」代替。

```python
from langchain_core.runnables import RunnableLambda

def fake_llm(prompt_value):
    text = prompt_value.to_string()
    return "收到：" + text[:20]

fake_model = RunnableLambda(fake_llm)
```

## 4. RunnableParallel：并行执行多条链 / run several chains in parallel

`RunnableParallel(键=Runnable, ...)` 把同一个输入同时交给几个 Runnable，结果放进一个字典。
在链里直接写一个字典 `{"a": r1, "b": r2}`，会被自动转换成 RunnableParallel。

```python
from langchain_core.runnables import RunnableLambda, RunnableParallel

upper = RunnableLambda(lambda s: s.upper())
length = RunnableLambda(lambda s: len(s))
both = RunnableParallel(upper=upper, length=length)
print(both.invoke("lcel"))     # {'upper': 'LCEL', 'length': 4}
```

## 5. RunnablePassthrough：把输入原样传下去 / pass the input through unchanged

`RunnablePassthrough()` 不做任何处理，输入是什么就输出什么。常和 RunnableParallel 一起用，
在准备提示词的输入时，一边保留原始输入，一边计算别的值。
`RunnablePassthrough.assign(新键=Runnable)` 接收一个字典，原样保留所有键，再加上新键。

```python
from langchain_core.runnables import RunnableLambda, RunnableParallel, RunnablePassthrough

prep = RunnableParallel(question=RunnablePassthrough(), size=RunnableLambda(len))
print(prep.invoke("什么是 LCEL"))   # {'question': '什么是 LCEL', 'size': 8}

add_upper = RunnablePassthrough.assign(upper=lambda d: d["text"].upper())
print(add_upper.invoke({"text": "hi"}))   # {'text': 'hi', 'upper': 'HI'}
```

## 6. 提示词模板和输出解析器 / prompt templates and output parsers

- `ChatPromptTemplate.from_messages([("system", "..."), ("user", "{question}")])`：
  `invoke({"question": "..."})` 返回一个 ChatPromptValue（`to_string()` 变成文字，`to_messages()` 变成消息列表）
- `StrOutputParser()`：把模型返回的消息变成字符串；对字符串输入原样返回

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda

prompt = ChatPromptTemplate.from_messages([("user", "用一句话解释：{topic}")])
fake_model = RunnableLambda(lambda pv: "（假模型的回答）" + pv.to_string())
chain = prompt | fake_model | StrOutputParser()
print(chain.invoke({"topic": "LCEL"}))
```

## 7. 一个简单的 RAG 链 / a simple RAG chain

RAG 链常见的写法：用字典（RunnableParallel）同时准备 `context` 和 `question`，
再交给提示词、模型和输出解析器。

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda, RunnablePassthrough

docs = ["LCEL 用 | 组合 Runnable。", "RunnableParallel 可以并行执行多条链。"]

def retrieve(question):
    return "\n".join(d for d in docs if any(ch in d for ch in question))

prompt = ChatPromptTemplate.from_messages([("user", "参考资料：{context}\n问题：{question}")])
fake_model = RunnableLambda(lambda pv: "根据资料回答：" + pv.to_string()[:30])
rag_chain = (
    {"context": RunnableLambda(retrieve), "question": RunnablePassthrough()}
    | prompt
    | fake_model
    | StrOutputParser()
)
print(rag_chain.invoke("怎样并行执行"))
```
