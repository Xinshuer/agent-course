"""Offline stand-in for the OpenAI Python client (chat.completions only).

Used by the in-browser runner so learners can practise the request / history /
tool-call flow without an API key. Replies are canned, not real model output,
but the object shapes (response.choices[0].message.tool_calls[0].function.arguments,
model_dump(), dict(message), streaming chunks) follow the real SDK, and common
mistakes raise errors similar to the real API.
"""
import itertools
import json
import re

_ids = itertools.count(1)

CITIES = [
    (("北京", "beijing"), "北京", "Beijing", 39.9042, 116.4074),
    (("上海", "shanghai"), "上海", "Shanghai", 31.2304, 121.4737),
    (("广州", "guangzhou"), "广州", "Guangzhou", 23.1291, 113.2644),
    (("深圳", "shenzhen"), "深圳", "Shenzhen", 22.5431, 114.0579),
    (("杭州", "hangzhou"), "杭州", "Hangzhou", 30.2741, 120.1551),
    (("成都", "chengdu"), "成都", "Chengdu", 30.5728, 104.0668),
    (("斯德哥尔摩", "stockholm"), "斯德哥尔摩", "Stockholm", 59.3293, 18.0686),
    (("东京", "tokyo"), "东京", "Tokyo", 35.6762, 139.6503),
    (("伦敦", "london"), "伦敦", "London", 51.5074, -0.1278),
    (("纽约", "new york"), "纽约", "New York", 40.7128, -74.0060),
]
ROLES = {"system", "developer", "user", "assistant", "tool"}


class BadRequestError(Exception):
    """Raised for requests the real API would reject with HTTP 400."""


# ---------------------------------------------------------------- objects
class _Obj:
    """Attribute access + model_dump(), like the SDK's pydantic models."""

    def __init__(self, **fields):
        self.__dict__.update(fields)

    def model_dump(self, **_ignored):
        return {k: _dump(v) for k, v in self.__dict__.items()}

    def model_dump_json(self, indent=None, **_ignored):
        return json.dumps(self.model_dump(), ensure_ascii=False, indent=indent)

    def to_dict(self):
        return self.model_dump()

    def __iter__(self):  # dict(message) works, and stays shallow like the real SDK
        return iter(list(self.__dict__.items()))

    def __eq__(self, other):
        return type(self) is type(other) and self.__dict__ == other.__dict__

    def __repr__(self):
        inner = ", ".join(f"{k}={v!r}" for k, v in self.__dict__.items())
        return f"{type(self).__name__}({inner})"


def _dump(v):
    if isinstance(v, _Obj):
        return v.model_dump()
    if isinstance(v, list):
        return [_dump(x) for x in v]
    return v


class Function(_Obj): pass
class ChatCompletionMessageToolCall(_Obj): pass
class ChatCompletionMessage(_Obj): pass
class Choice(_Obj): pass
class CompletionUsage(_Obj): pass
class ChatCompletion(_Obj): pass
class ChoiceDelta(_Obj): pass
class ChunkChoice(_Obj): pass
class ChatCompletionChunk(_Obj): pass


# ---------------------------------------------------------------- helpers
def _has_cjk(text):
    return bool(re.search(r"[一-鿿]", text or ""))


def _text_of(content):
    """Plain text of a message content (string or multimodal list of parts)."""
    if content is None:
        return ""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for p in content:
            if isinstance(p, dict) and p.get("type") == "text":
                parts.append(p.get("text", ""))
            elif isinstance(p, dict) and p.get("type") == "image_url":
                parts.append("[image]")
        return " ".join(parts)
    return str(content)


def _as_dict(m, i):
    if isinstance(m, dict):
        return m
    if hasattr(m, "model_dump"):
        return m.model_dump()
    if isinstance(m, (list, tuple)):
        raise BadRequestError(
            f"Error code: 400 - messages[{i}] is a list, expected an object.\n"
            "[mock 提示] messages 里的每一项都应该是一个字典 {...}，你多套了一层 [ ]。"
        )
    raise BadRequestError(
        f"Error code: 400 - messages[{i}] must be an object, got {type(m).__name__}.\n"
        "[mock 提示] messages 里的每一项都应该是一个字典，例如 {\"role\": \"user\", \"content\": \"你好\"}。"
    )


def _validate(msgs):
    if not isinstance(msgs, list) or not msgs:
        raise BadRequestError("Error code: 400 - messages must be a non-empty list.\n[mock 提示] messages 必须是非空列表。")
    pending = {}  # tool_call_id -> index of the assistant message that asked for it
    for i, m in enumerate(msgs):
        role = m.get("role")
        if role not in ROLES:
            raise BadRequestError(
                f"Error code: 400 - messages[{i}].role must be one of {sorted(ROLES)}, got {role!r}.\n"
                "[mock 提示] 检查 role 的拼写，例如 \"user\"、\"assistant\"、\"tool\"。"
            )
        if role == "tool":
            cid = m.get("tool_call_id")
            if cid not in pending:
                raise BadRequestError(
                    f"Error code: 400 - messages[{i}] with role 'tool' must be a response to a preceding "
                    "message with 'tool_calls'.\n"
                    "[mock 提示] tool 消息前面必须有一条带 tool_calls 的 assistant 消息（并且已经存进了 messages），"
                    "而且 tool_call_id 要和它对上。"
                )
            if not isinstance(m.get("content"), str):
                raise BadRequestError(
                    f"Error code: 400 - messages[{i}].content must be a string, got {type(m.get('content')).__name__}.\n"
                    "[mock 提示] 工具结果要先转成字符串，例如 str(result) 或 json.dumps(result)。"
                )
            pending.pop(cid)
            continue
        if pending:
            raise BadRequestError(
                "Error code: 400 - An assistant message with 'tool_calls' must be followed by tool messages "
                f"responding to each 'tool_call_id'. Missing: {sorted(pending)}.\n"
                "[mock 提示] 模型一次请求了几个工具，就要先把几条 tool 结果都加进 messages，再调用模型。"
            )
        if role == "assistant":
            for call in m.get("tool_calls") or []:
                cid = call["id"] if isinstance(call, dict) else call.id
                pending[cid] = i
        if role in ("user", "system", "developer") and m.get("content") is None:
            raise BadRequestError(f"Error code: 400 - messages[{i}].content is required.")
    if pending:
        raise BadRequestError(
            "Error code: 400 - An assistant message with 'tool_calls' must be followed by tool messages "
            f"responding to each 'tool_call_id'. Missing: {sorted(pending)}.\n"
            "[mock 提示] 还有工具调用没有返回结果。"
        )


def _tool_specs(tools):
    specs = []
    for t in tools or []:
        fn = t.get("function", t) if isinstance(t, dict) else None
        if not fn or "name" not in fn:
            raise BadRequestError(
                "Error code: 400 - each tool needs {\"type\": \"function\", \"function\": {\"name\": ...}}.\n"
                "[mock 提示] 检查 tools 的格式。"
            )
        params = fn.get("parameters") or {}
        specs.append((fn["name"], (fn.get("description") or ""), params.get("properties") or {}))
    return specs


def _find_cities(text):
    low = text.lower()
    found = []
    for keys, zh, en, lat, lon in CITIES:
        pos = min((low.find(k) for k in keys if k in low), default=-1)
        if pos >= 0:
            found.append((pos, zh, en, lat, lon))
    return [c[1:] for c in sorted(found)]


def _first_string_prop(props):
    for name, spec in props.items():
        if spec.get("type", "string") == "string":
            return name
    return next(iter(props), None)


def _plan_tool_calls(user_text, tools):
    """Decide which tools a 'model' would call for this user message."""
    calls = []
    low = user_text.lower()
    zh = _has_cjk(user_text)
    for name, desc, props in _tool_specs(tools):
        key = (name + " " + desc).lower()
        if "weather" in key or "天气" in key or "temperature" in key or "气温" in key:
            for czh, cen, lat, lon in _find_cities(user_text):
                if "latitude" in props and "longitude" in props:
                    args = {"latitude": lat, "longitude": lon}
                else:
                    p = _first_string_prop(props) or "city"
                    args = {p: czh if zh else cen}
                calls.append((name, args))
        elif ("time" in key or "时间" in key or "date" in key) and re.search(r"时间|几点|日期|time|date", low):
            args = {}
            if "timezone" in props:
                args["timezone"] = "Asia/Shanghai"
            calls.append((name, args))
        elif any(w in key for w in ("calc", "math", "comput", "计算", "add", "multiply", "sum")):
            expr = re.search(r"\d[\d\.\s]*(?:[\+\-\*/×÷][\s\d\.\(\)]*)+\d", user_text)
            if expr:
                text = expr.group(0).replace("×", "*").replace("÷", "/").strip()
                nums = re.findall(r"\d+(?:\.\d+)?", text)
                if "a" in props and "b" in props and len(nums) >= 2:
                    args = {"a": float(nums[0]), "b": float(nums[1])}
                else:
                    args = {_first_string_prop(props) or "expression": text}
                calls.append((name, args))
        elif name.lower() in low:
            args = {}
            for p, spec in props.items():
                t = spec.get("type", "string")
                args[p] = user_text if t == "string" else (1 if t in ("integer", "number") else True)
            calls.append((name, args))
    return [
        ChatCompletionMessageToolCall(
            id=f"call_mock_{next(_ids)}",
            type="function",
            function=Function(name=n, arguments=json.dumps(a, ensure_ascii=False)),
        )
        for n, a in calls
    ]


def _chat_reply(msgs, user_text, zh):
    users = [_text_of(m.get("content")) for m in msgs if m.get("role") == "user"]
    earlier = " ".join(users[:-1])
    asks_name = re.search(r"我叫什么|我的名字|what'?s my name|what is my name|who am i", user_text.lower())
    if asks_name:
        m = re.search(r"我叫([^\s，。,.!！?？]{1,10})", earlier) or re.search(r"my name is (\w+)", earlier, re.I)
        if m:
            return f"（模拟回答）你叫{m.group(1)}。" if zh else f"(mock) Your name is {m.group(1)}."
        return ("（模拟回答）我不知道你的名字——这次发来的 messages 里没有提到。"
                if zh else "(mock) I don't know your name - it isn't in the messages you sent.")
    system = next((_text_of(m.get("content")) for m in msgs if m.get("role") in ("system", "developer")), "")
    persona = (f"（按 system 设定：{system[:30]}）" if zh else f"(following the system prompt: {system[:30]}) ") if system else ""
    if zh:
        return f"（模拟回答）{persona}收到：「{user_text[:40]}」。这次请求一共带了 {len(msgs)} 条消息。"
    return f"(mock) {persona}Got it: \"{user_text[:40]}\". This request carried {len(msgs)} messages."


def _answer_from_tools(msgs, zh):
    names = {}
    for m in msgs:
        for call in m.get("tool_calls") or []:
            c = call if isinstance(call, dict) else call.model_dump()
            names[c["id"]] = c["function"]["name"]
    tail = []
    for m in reversed(msgs):
        if m.get("role") != "tool":
            break
        tail.append(m)
    tail.reverse()
    parts = [f"{names.get(m['tool_call_id'], 'tool')} → {m['content']}" for m in tail]
    if zh:
        return "（模拟回答）根据工具返回的结果：" + "；".join(parts) + "。"
    return "(mock) Based on the tool results: " + "; ".join(parts) + "."


# ---------------------------------------------------------------- client
MAX_CALLS = 100


class _Completions:
    calls = 0

    def create(self, *, model=None, messages=None, tools=None, stream=False, **kwargs):
        _Completions.calls += 1
        if _Completions.calls > MAX_CALLS:
            raise RuntimeError(
                f"[mock] model called more than {MAX_CALLS} times in one run - probably an endless loop.\n"
                f"[mock 提示] 一次运行里调用模型超过 {MAX_CALLS} 次，可能写成了死循环。"
            )
        if not model:
            raise BadRequestError("Error code: 400 - you must provide a model parameter.\n[mock 提示] 别忘了 model=\"...\"。")
        msgs = [_as_dict(m, i) for i, m in enumerate(messages or [])]
        _validate(msgs)
        last = msgs[-1]
        user_text = next((_text_of(m.get("content")) for m in reversed(msgs) if m.get("role") == "user"), "")
        zh = _has_cjk(user_text) or not user_text
        tool_calls = None
        if last.get("role") == "tool":
            content = _answer_from_tools(msgs, zh)
        else:
            calls = _plan_tool_calls(user_text, tools) if tools and last.get("role") == "user" else []
            if calls:
                content = "我来调用工具查一下。" if zh else "Let me call a tool for that."
                tool_calls = calls
            else:
                content = _chat_reply(msgs, user_text, zh)
        n = next(_ids)
        message = ChatCompletionMessage(content=content, role="assistant", tool_calls=tool_calls)
        finish = "tool_calls" if tool_calls else "stop"
        prompt_tokens = sum(len(_text_of(m.get("content"))) for m in msgs) // 2 + 5
        completion_tokens = len(content) // 2 + 1
        if stream:
            return _stream(n, model, content, tool_calls, finish)
        return ChatCompletion(
            id=f"chatcmpl-mock-{n}",
            object="chat.completion",
            created=0,
            model=model,
            choices=[Choice(index=0, message=message, finish_reason=finish)],
            usage=CompletionUsage(prompt_tokens=prompt_tokens, completion_tokens=completion_tokens,
                                  total_tokens=prompt_tokens + completion_tokens),
        )


def _stream(n, model, content, tool_calls, finish):
    step = 2 if _has_cjk(content) else 4
    pieces = [content[i:i + step] for i in range(0, len(content), step)]

    def chunk(delta, finish_reason=None):
        return ChatCompletionChunk(
            id=f"chatcmpl-mock-{n}", object="chat.completion.chunk", created=0, model=model,
            choices=[ChunkChoice(index=0, delta=delta, finish_reason=finish_reason)],
        )

    # Like deepseek-flash in thinking mode: the first chunks carry reasoning_content and content=None,
    # then the answer arrives in pieces, and the final chunk has content "" plus finish_reason.
    for thought in ("（模拟思考）", "……"):
        yield chunk(ChoiceDelta(role="assistant", content=None, reasoning_content=thought, tool_calls=None))
    for p in pieces:
        yield chunk(ChoiceDelta(role=None, content=p, reasoning_content=None, tool_calls=None))
    if tool_calls:
        for i, c in enumerate(tool_calls):
            c.index = i
        yield chunk(ChoiceDelta(role=None, content=None, reasoning_content=None, tool_calls=tool_calls))
    yield chunk(ChoiceDelta(role=None, content="", reasoning_content=None, tool_calls=None), finish)


class _Chat:
    def __init__(self, completions):
        self.completions = completions


class OpenAI:
    """Same constructor shape as openai.OpenAI; api_key / base_url are ignored."""

    def __init__(self, api_key=None, base_url=None, **kwargs):
        self.api_key = api_key or "mock-key"
        self.base_url = base_url or "mock://local"
        self.chat = _Chat(_Completions())


class _AsyncStream:
    def __init__(self, gen):
        self._gen = gen

    def __aiter__(self):
        return self

    async def __anext__(self):
        try:
            return next(self._gen)
        except StopIteration:
            raise StopAsyncIteration


class _AsyncCompletions:
    def __init__(self):
        self._sync = _Completions()

    async def create(self, **kwargs):
        result = self._sync.create(**kwargs)
        return _AsyncStream(result) if kwargs.get("stream") else result


class AsyncOpenAI:
    def __init__(self, api_key=None, base_url=None, **kwargs):
        self.api_key = api_key or "mock-key"
        self.base_url = base_url or "mock://local"
        self.chat = _Chat(_AsyncCompletions())
