"""第 42 节（选做）：给小浪套上 FastAPI 服务器——对照视频里的 server.py
Lesson 42 (optional): wrap Xiaolang in a FastAPI server - compare with the video's server.py

视频的服务器做了这些事，这里保留和 Agent 有关的部分 / What the video's server does (agent-related parts kept):
  - POST /chat：测试用的普通接口。视频在 /docs 页面里试它，第一次因为没给 thread_id 报错
    POST /chat: a test endpoint; in the video it first fails on /docs because no thread_id is passed
  - WebSocket /ws/chat：主要接口。ping/pong 心跳；用用户 id 当 thread_id 运行小浪，把回答推回去，最后发 complete
    WebSocket /ws/chat: the main endpoint; ping/pong heartbeat; runs Xiaolang with the user id as thread_id,
    pushes the answer back, then sends "complete"
  - GET /：一个极简聊天网页，代替视频里带数字人的 show.html / a minimal chat page instead of the avatar page
没有做的 / Left out: 微软云数字人、情绪识别链（需要 Azure 的 key 和审批） / the Azure avatar and the mood chain.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    ..\\.venv\\Scripts\\python.exe l42_server.py
然后用浏览器打开 / then open in a browser:
    http://127.0.0.1:8000/       极简聊天页（WebSocket） / the minimal chat page (WebSocket)
    http://127.0.0.1:8000/docs   接口文档，可以直接试 POST /chat / API docs - try POST /chat there
按 Ctrl+C 停止服务器。 Press Ctrl+C to stop the server.
需要的 key / Key needed: DEEPSEEK_API_KEY
FastAPI 的写法在第 51 节细讲。 FastAPI itself is covered in lesson 51.
"""
import asyncio
import json
import time

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

from l42_xiaolang_solution import xiaolang     # 主管小浪（带 checkpointer）/ the supervisor, with a checkpointer

app = FastAPI(title="小浪助手 / Xiaolang")


# ---------------------------------------------------------------- 1. POST /chat：测试用 / for testing
class ChatRequest(BaseModel):
    message: str
    user_id: str = "anonymous"


@app.post("/chat")
def chat(req: ChatRequest):
    """发一句话，返回小浪的回答。 Send one message, get Xiaolang's answer."""
    # 小浪带了 checkpointer，必须告诉它存到哪条线程；视频第一次测试就是漏了这一句
    # Xiaolang has a checkpointer, so it needs a thread_id - the video's first test forgot this
    config = {"configurable": {"thread_id": req.user_id}}
    result = xiaolang.invoke({"messages": [("user", req.message)]}, config)
    return {"reply": result["messages"][-1].content}


# ---------------------------------------------------------------- 2. WebSocket /ws/chat
last_active = {}            # 每个连接最后一次活动的时间 / last activity time of each connection
HEARTBEAT_SECONDS = 30      # 每 30 秒检查一次 / check every 30 s
TIMEOUT_SECONDS = 120       # 超过 2 分钟没动静就关掉 / close after 2 minutes of silence


async def check_heartbeat(websocket, client_id):
    """心跳检查：太久没有收到任何消息（包括 ping），就关闭连接。"""
    while True:
        await asyncio.sleep(HEARTBEAT_SECONDS)
        if time.time() - last_active.get(client_id, 0) > TIMEOUT_SECONDS:
            print("[心跳 / heartbeat] 太久没有活动，关闭连接 / idle too long, closing", client_id)
            await websocket.close()
            break


async def send_json(websocket, data):
    await websocket.send_text(json.dumps(data, ensure_ascii=False))


async def process_message(websocket, data):
    """处理一条聊天消息：运行小浪，把它的回答推给浏览器，最后发 complete。"""
    message = str(data.get("message", "")).strip()
    user_id = data.get("user_id") or "anonymous"           # 浏览器传来的用户 id / the browser's user id
    if not message:
        await send_json(websocket, {"type": "error", "content": "消息是空的，请输入内容后再发送 / empty message, please type something"})
        return
    config = {"configurable": {"thread_id": user_id}}       # 一个用户一条线程 / one thread per user
    async for update in xiaolang.astream({"messages": [("user", message)]}, config, stream_mode="updates"):
        for node, value in update.items():
            for msg in (value or {}).get("messages", []):
                if node == "model" and msg.content and not msg.tool_calls:   # 小浪自己说的话 / Xiaolang's own words
                    await send_json(websocket, {"type": "stream", "content": msg.content})
    await send_json(websocket, {"type": "complete"})        # 这句话说完了 / this answer is finished


@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()
    client_id = id(websocket)
    last_active[client_id] = time.time()
    heartbeat = asyncio.create_task(check_heartbeat(websocket, client_id))   # 后台心跳任务 / background task
    try:
        while True:
            text = await websocket.receive_text()
            last_active[client_id] = time.time()
            try:
                data = json.loads(text)
            except ValueError:
                await send_json(websocket, {"type": "error", "content": "消息不是 JSON / not JSON"})
                continue
            if data.get("type") == "ping":                    # 心跳：回一个 pong / heartbeat: answer pong
                await send_json(websocket, {"type": "pong"})
                continue
            await process_message(websocket, data)
    except WebSocketDisconnect:
        print("[连接断开 / disconnected]", client_id)
    finally:
        heartbeat.cancel()
        last_active.pop(client_id, None)


# ---------------------------------------------------------------- 3. GET /：极简聊天页 / a minimal chat page
PAGE = """<!doctype html>
<html lang="zh"><head><meta charset="utf-8"><title>小浪助手 / Xiaolang</title>
<style>
body { font-family: sans-serif; max-width: 680px; margin: 2em auto; padding: 0 16px; }
#log { border: 1px solid #ccc; height: 380px; overflow: auto; padding: 8px; white-space: pre-wrap; }
#msg { width: 78%; padding: 6px; }
</style></head>
<body>
<h3>小浪助手（极简版，没有数字人） / Xiaolang (minimal, no avatar)</h3>
<div id="log"></div>
<p><input id="msg" placeholder="输入问题，回车发送 / type and press Enter"> <button id="send">发送 / Send</button></p>
<script>
const log = document.getElementById("log"), box = document.getElementById("msg");
const userId = "web-" + Math.random().toString(36).slice(2);      // 每个标签页一个用户 id
const ws = new WebSocket("ws://" + location.host + "/ws/chat");
function add(text) { log.textContent += text + "\\n"; log.scrollTop = log.scrollHeight; }
ws.onopen = () => {
  add("[已连接 / connected]");
  setInterval(() => ws.send(JSON.stringify({type: "ping"})), 20000);   // 心跳 / heartbeat
};
ws.onmessage = (e) => {
  const d = JSON.parse(e.data);
  if (d.type === "stream") add("小浪 / Xiaolang: " + d.content);
  else if (d.type === "complete") add("----------");
  else if (d.type === "error") add("[错误 / error] " + d.content);
};
ws.onclose = () => add("[连接已断开 / disconnected]");
function send() {
  if (!box.value.trim()) return;
  add("你 / You: " + box.value);
  ws.send(JSON.stringify({type: "message", message: box.value, user_id: userId}));
  box.value = "";
}
document.getElementById("send").onclick = send;
box.onkeydown = (e) => { if (e.key === "Enter") send(); };
</script>
</body></html>"""


@app.get("/", response_class=HTMLResponse)
def index():
    return PAGE


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
