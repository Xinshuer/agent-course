// Agent course - interactive study app. Plain JS, works from file:// (no build step, no server).
(function () {
  "use strict";
  const C = window.COURSE;
  C.data = C.data || {};
  C.pages = C.pages || {};
  const I = window.I18N;
  const HL = window.Highlight;
  const esc = HL.esc;
  const attr = (s) => esc(String(s)).replace(/"/g, "&quot;");

  // ------------------------------------------------------------ storage
  const S = {
    get(k, d) {
      try { const v = localStorage.getItem("ac:" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; }
    },
    set(k, v) { try { localStorage.setItem("ac:" + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
    del(k) { try { localStorage.removeItem("ac:" + k); } catch (e) { /* ignore */ } },
    clearAll() {
      try { Object.keys(localStorage).filter((k) => k.startsWith("ac:")).forEach((k) => localStorage.removeItem(k)); } catch (e) { /* ignore */ }
    },
  };

  let lang = S.get("lang", "zh");
  const T = (o) => (o == null ? "" : typeof o === "string" ? o : (o[lang] ?? o.zh ?? o.en ?? ""));
  const U = (k) => (I[k] && I[k][lang]) || k;
  const ORDER = C.modules.flatMap((m) => m.lessons);
  const doneMap = () => S.get("done", {});
  const isDone = (id) => !!doneMap()[id];
  const PRIO = { core: "prioCore", important: "prioImportant", overview: "prioOverview" };

  // ------------------------------------------------------------ markdown-lite
  function inline(s) {
    const codes = [];
    s = String(s).replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return "\u0000" + (codes.length - 1) + "\u0000"; });
    s = esc(s);
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, txt, url) => {
      const safe = url.replace(/"/g, "&quot;");
      if (/^https?:\/\//.test(url)) return `<a href="${safe}" target="_blank" rel="noopener">${txt}</a>`;
      if (url.startsWith("#")) return `<a href="${safe}">${txt}</a>`;
      return txt;
    });
    return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[+i])}</code>`);
  }

  function md(src) {
    if (!src) return "";
    const lines = String(src).split("\n");
    let html = "";
    let para = [];
    let list = null;
    let table = [];
    const flushP = () => { if (para.length) { html += "<p>" + para.map(inline).join("<br>") + "</p>"; para = []; } };
    const flushL = () => {
      if (list) { html += `<${list.type}>` + list.items.map((i) => "<li>" + inline(i) + "</li>").join("") + `</${list.type}>`; list = null; }
    };
    const flushT = () => {
      if (!table.length) return;
      const rows = table.filter((r) => !/^\|?\s*:?-{2,}/.test(r)).map((r) => r.replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
      html += "<table><thead><tr>" + rows[0].map((c) => "<th>" + inline(c) + "</th>").join("") + "</tr></thead><tbody>" +
        rows.slice(1).map((r) => "<tr>" + r.map((c) => "<td>" + inline(c) + "</td>").join("") + "</tr>").join("") + "</tbody></table>";
      table = [];
    };
    for (const raw of lines) {
      const line = raw.replace(/\s+$/, "");
      let m;
      if (line.trim().startsWith("|")) { flushP(); flushL(); table.push(line.trim()); continue; }
      flushT();
      if (!line.trim()) { flushP(); flushL(); continue; }
      if ((m = line.match(/^#{2,4}\s+(.*)/))) { flushP(); flushL(); html += `<h3>${inline(m[1])}</h3>`; continue; }
      if ((m = line.match(/^\s*[-*•]\s+(.*)/))) {
        flushP();
        if (!list || list.type !== "ul") { flushL(); list = { type: "ul", items: [] }; }
        list.items.push(m[1]);
        continue;
      }
      if ((m = line.match(/^\s*\d+[.)]\s+(.*)/))) {
        flushP();
        if (!list || list.type !== "ol") { flushL(); list = { type: "ol", items: [] }; }
        list.items.push(m[1]);
        continue;
      }
      if (list && /^\s{2,}\S/.test(raw)) { list.items[list.items.length - 1] += " " + line.trim(); continue; }
      flushL();
      para.push(line);
    }
    flushT(); flushP(); flushL();
    return html;
  }

  // ------------------------------------------------------------ components
  const ORIGINAL = {}; // editor key -> original code (for "reset")
  let keySeq = 0;

  function lines(code) { return String(code).split("\n").length; }

  function codeBlock(code, o) {
    o = o || {};
    const label = T(o.file) || o.lang || "python";
    const cap = o.caption ? `<div class="cap">${md(T(o.caption))}</div>` : "";
    if (o.run) {
      const key = o.key || "tmp" + (++keySeq);
      ORIGINAL[key] = code;
      const saved = S.get("ed:" + key, null);
      const val = saved ?? code;
      const mockNote = o.run === "mock" ? `<div class="cap small muted">${esc(U("mockNote"))}</div>` : "";
      return `<div class="code runnable" data-key="${attr(key)}">
        <div class="bar"><span class="fname">${esc(label)}</span><span class="btns">
          <button class="btn sm primary" data-act="run">${esc(U("run"))}</button>
          <button class="btn sm" data-act="reset-code">${esc(U("reset"))}</button>
          <button class="btn sm" data-act="copy">${esc(U("copy"))}</button></span></div>
        <textarea class="editor" spellcheck="false" autocomplete="off" data-ed="${attr(key)}" rows="${Math.min(lines(val) + 1, 30)}">${esc(val)}</textarea>
        <pre class="out"></pre>${mockNote}${cap}</div>`;
    }
    return `<div class="code">
      <div class="bar"><span class="fname">${esc(label)}</span><span class="btns">
        <button class="btn sm" data-act="copy">${esc(U("copy"))}</button></span></div>
      <pre><code>${HL(code, o.lang)}</code></pre>${cap}</div>`;
  }

  function callout(kind, b) {
    const titles = {
      tip: { zh: "💡 提示", en: "💡 Tip" },
      warn: { zh: "⚠️ 注意", en: "⚠️ Watch out" },
      note: { zh: "📝 补充", en: "📝 Note" },
      video: { zh: "🎬 对照视频", en: "🎬 With the video" },
    };
    const title = b.title ? T(b.title) : T(titles[kind] || titles.note);
    return `<div class="callout ${kind}"><div class="ttl">${esc(title)}</div>${md(T(b))}</div>`;
  }

  function pyBox(b, key) {
    const code = b.code ? T(b.code) : "";
    const run = b.run === undefined ? (code ? true : false) : b.run;
    const codeHtml = code ? codeBlock(code, { lang: "python", run, key, caption: b.note }) : "";
    return `<div class="pybox"><div class="head">🐍 ${esc(U("pyLesson"))} · ${esc(T(b.title))}<span class="tag">Python</span></div>
      <div class="body">${md(T(b))}${codeHtml}</div></div>`;
  }

  function quizItem(q, lid, set, i, num, opts) {
    opts = opts || {};
    const key = `ans:${lid}:${set}:${i}`;
    const chosen = S.get(key, null);
    const solved = chosen === q.answer;
    const letters = "ABCDEFGH";
    const optsHtml = q.options.map((o, j) => {
      let cls = "opt";
      if (chosen !== null && j === chosen) cls += j === q.answer ? " correct" : " wrong";
      return `<button class="${cls}" data-act="quiz" data-lid="${lid}" data-set="${set}" data-i="${i}" data-o="${j}"><span class="k">${letters[j]}.</span>${inline(T(o))}</button>`;
    }).join("");
    let fb = "";
    if (chosen !== null) {
      fb = solved
        ? `<div class="explain"><span class="res ok">${esc(U("correct"))}</span> ${md(T(q.explain))}</div>`
        : `<div class="explain"><span class="res bad">${esc(U("wrong"))}</span></div>`;
    }
    const from = opts.from ? `<div class="small muted">${esc(U("fromLesson"))} <a href="#/lesson/${opts.from}">${esc(C.lessons[opts.from].num + " · " + T(C.lessons[opts.from].title))}</a></div>` : "";
    return `<div class="quiz${set === "blk" ? " check-inline" : ""}" data-quiz="${attr(key)}">${from}
      <div class="q">${num ? num + ". " : ""}${md(T(q.q))}</div><div class="opts">${optsHtml}</div>${fb}</div>`;
  }

  function findQuiz(lid, set, i) {
    const L = C.data[lid] || C.pages[lid];
    if (!L) return null;
    return set === "blk" ? L.blocks[i] : L.quiz[i];
  }

  function fillItem(f, lid, i) {
    const key = `fill:${lid}:${i}`;
    const saved = S.get(key, []);
    const parts = T(f.code).split(/\[\[(.+?)\]\]/);
    let n = 0;
    let html = "";
    parts.forEach((p, idx) => {
      if (idx % 2 === 0) { html += HL(p, "python"); return; }
      const w = Math.max(...p.split("|").map((a) => [...a].reduce((s, ch) => s + (ch.charCodeAt(0) > 255 ? 2 : 1), 0)));
      html += `<input class="blank" data-ans="${attr(p)}" data-n="${n}" value="${attr(saved[n] || "")}" style="width:${w + 2}ch" spellcheck="false" autocomplete="off" aria-label="blank ${n + 1}">`;
      n++;
    });
    return `<div class="code fill" data-fill="${attr(key)}">
      <div class="bar"><span class="fname">${esc(T(f.title) || U("secFill"))}</span></div>
      <pre><code>${html}</code></pre>
      ${f.explain ? `<div class="cap">${md(T(f.explain))}</div>` : ""}
      <div class="row"><button class="btn sm primary" data-act="fill-check">${esc(U("check"))}</button>
        <button class="btn sm" data-act="fill-show">${esc(U("showAnswer"))}</button>
        <button class="btn sm" data-act="fill-reset">${esc(U("reset"))}</button><span class="msg"></span></div></div>`;
  }

  function writeItem(w, lid, i) {
    const key = `write:${lid}:${i}`;
    const starter = T(w.starter) || "";
    ORIGINAL[key] = starter;
    const draft = S.get("ed:" + key, null);
    const val = draft ?? starter;
    const done = S.get("wdone:" + key, false);
    const sol = T(w.solution) || "";
    return `<div class="write" data-write="${attr(key)}" data-lid="${lid}" data-i="${i}">
      <div class="task"><h3>✍️ ${esc(T(w.title))}</h3>${md(T(w.task))}<div class="hint">${esc(U("writeHint"))}</div></div>
      <div class="code runnable" data-key="${attr(key)}" style="margin:0;border-radius:0;border-left:0;border-right:0">
        <textarea class="editor" spellcheck="false" autocomplete="off" data-ed="${attr(key)}" rows="${Math.max(10, Math.min(lines(sol) + 2, 32))}">${esc(val)}</textarea>
        <pre class="out"></pre>
      </div>
      <ul class="checks"></ul>
      <div class="row">
        <button class="btn sm primary" data-act="w-check">${esc(U("checkKeys"))}</button>
        ${w.run ? `<button class="btn sm" data-act="run">${esc(U("run"))}</button>` : ""}
        <button class="btn sm" data-act="w-sol">${esc(U("solution"))}</button>
        <button class="btn sm" data-act="reset-code">${esc(U("reset"))}</button>
        <label class="self"><input type="checkbox" data-act="w-done" ${done ? "checked" : ""}> ${esc(U("iCanWrite"))}</label>
      </div>
      ${w.run === "mock" ? `<div class="cap small muted" style="padding:6px 16px">${esc(U("mockNote"))}</div>` : ""}
      <div class="sol" hidden>${codeBlock(sol, { lang: "python", file: U("solution") })}</div></div>`;
  }

  function renderBlocks(blocks, lid) {
    return (blocks || []).map((b, i) => {
      const key = `${lid}:b${i}`;
      switch (b.t) {
        case "h": return `<h3>${inline(T(b))}</h3>`;
        case "p": return md(T(b));
        case "code": return codeBlock(T(b.code), { lang: b.lang, file: b.file, caption: b.note, run: b.run, key });
        case "py": return pyBox(b, key);
        case "tip": case "warn": case "note": case "video": return callout(b.t, b);
        case "check": return quizItem(b, lid, "blk", i, "");
        default: return md(T(b));
      }
    }).join("\n");
  }

  // ------------------------------------------------------------ chrome
  function progressPct() {
    const d = doneMap();
    const n = ORDER.filter((id) => d[id]).length;
    return { n, total: ORDER.length, pct: Math.round((n / ORDER.length) * 100) };
  }

  function renderTopbar() {
    const p = progressPct();
    document.getElementById("topbar").innerHTML = `
      <button class="tb-btn" id="menuBtn" data-act="menu">☰ ${esc(U("menu"))}</button>
      <a class="brand" href="#/">${esc(U("appTitle"))}</a>
      <span class="spacer"></span>
      <span class="prog" title="${attr(U("progress"))}"><span class="bar"><i style="width:${p.pct}%"></i></span>${p.n}/${p.total} ${esc(U("lessonsDone"))}</span>
      <button class="tb-btn" data-act="lang">${esc(U("langToggle"))}</button>
      <button class="tb-btn" data-act="theme" title="${attr(U("themeToggle"))}">◐</button>`;
  }

  function renderSidebar(active) {
    const d = doneMap();
    const top = [["#/", "home", "🏠"], ["#/setup", "setup", "🧰"], ["#/python", "python", "🐍"], ["#/review", "review", "🔁"]]
      .map(([h, k, ic]) => `<a href="${h}" class="${active === k ? "active" : ""}">${ic} ${esc(U(k))}</a>`).join("");
    const openMods = S.get("openMods", null);
    const activeMod = active && C.lessons[active] ? C.lessons[active].module : null;
    const mods = C.modules.map((m) => {
      const n = m.lessons.filter((id) => d[id]).length;
      const open = m.id === activeMod || (openMods ? openMods[m.id] : true);
      const items = m.lessons.map((id) => {
        const meta = C.lessons[id];
        const L = C.data[id];
        const prio = L && L.priority ? `<span class="dot ${L.priority}" title="${attr(U(PRIO[L.priority]))}"></span>` : "";
        return `<a class="nav-lesson${active === id ? " active" : ""}${L ? "" : " missing"}" href="#/lesson/${id}">
          <span class="n">${meta.num}</span><span>${prio}${esc(T(meta.title))}</span><span class="st">${d[id] ? "✓" : ""}</span></a>`;
      }).join("");
      return `<details class="nav-mod" data-mod="${m.id}" ${open ? "open" : ""}><summary><span>${esc(T(m.title))}</span><span class="cnt">${n}/${m.lessons.length}</span></summary>${items}</details>`;
    }).join("");
    const sb = document.getElementById("sidebar");
    const scroll = sb.scrollTop;
    sb.innerHTML = `<div class="nav-top">${top}</div>${mods}`;
    sb.scrollTop = scroll;
    sb.querySelectorAll("details.nav-mod").forEach((el) => el.addEventListener("toggle", () => {
      const o = S.get("openMods", {}) || {};
      o[el.dataset.mod] = el.open;
      S.set("openMods", o);
    }));
    const act = sb.querySelector(".nav-lesson.active");
    if (act) {
      const r = act.getBoundingClientRect();
      if (r.top < 60 || r.bottom > window.innerHeight) act.scrollIntoView({ block: "center" });
    }
  }

  // ------------------------------------------------------------ pages
  function lessonStats(id) {
    const L = C.data[id];
    if (!L || !L.quiz) return null;
    const ok = L.quiz.filter((q, i) => S.get(`ans:${id}:quiz:${i}`, null) === q.answer).length;
    return { ok, total: L.quiz.length };
  }

  function sectionsHtml(L, id) {
    let html = "";
    const toc = [];
    const sec = (key, title, body) => { toc.push([key, title]); html += `<h2 id="sec-${key}">${esc(title)}</h2>${body}`; };
    if (L.blocks && L.blocks.length) sec("notes", U("secNotes"), renderBlocks(L.blocks, id));
    if (L.quiz && L.quiz.length) {
      const st = lessonStats(id);
      sec("quiz", U("secQuiz") + (st ? `（${st.ok}/${st.total}）` : ""), L.quiz.map((q, i) => quizItem(q, id, "quiz", i, i + 1)).join(""));
    }
    if (L.fill && L.fill.length) sec("fill", U("secFill"), L.fill.map((f, i) => fillItem(f, id, i)).join(""));
    if (L.write && L.write.length) sec("write", U("secWrite"), L.write.map((w, i) => writeItem(w, id, i)).join(""));
    if (L.pitfalls && L.pitfalls.length) sec("pitfalls", U("secPitfalls"), `<ul class="pitfalls">${L.pitfalls.map((p) => `<li>${inline(T(p))}</li>`).join("")}</ul>`);
    if (L.recap && L.recap.length) sec("recap", U("secRecap"), `<ul class="recap">${L.recap.map((p) => `<li>${inline(T(p))}</li>`).join("")}</ul>`);
    if (L.files && L.files.length) {
      sec("files", U("secFiles"), `<p class="small muted">${esc(U("filesIntro"))}</p><ul class="files">${L.files.map((f) => `<li><code>${esc(f.path)}</code> — ${inline(T(f))}</li>`).join("")}</ul>`);
    }
    const tocHtml = toc.length > 1
      ? `<div class="toc">${toc.map(([k, t]) => `<a href="javascript:void 0" data-act="scroll" data-target="sec-${k}">${esc(t)}</a>`).join("")}</div>` : "";
    return { html, tocHtml };
  }

  function renderLesson(id) {
    const meta = C.lessons[id];
    if (!meta) return renderHome();
    S.set("last", id);
    const L = C.data[id];
    const mod = C.modules.find((m) => m.id === meta.module);
    const idx = ORDER.indexOf(id);
    const prevId = ORDER[idx - 1];
    const nextId = ORDER[idx + 1];
    const videoUrl = `https://www.bilibili.com/video/${C.bvid}/?p=${meta.page}`;
    const mins = Math.round(meta.duration / 60);
    let chips = `<span class="chip">🎬 ${esc(U("video"))} P${meta.page} · ${mins} ${esc(U("minutes"))}</span>`;
    let body = "";
    let tocHtml = "";
    if (L) {
      if (L.priority) chips += `<span class="chip ${L.priority}" title="${attr(U(PRIO[L.priority] + "Tip"))}">${esc(U(PRIO[L.priority]))}</span>`;
      if (L.studyMinutes) chips += `<span class="chip">⏱ ${esc(U("studyTime"))} ${L.studyMinutes} ${esc(U("minutes"))}</span>`;
      if (L.handwrite) chips += `<span class="chip hw">✍️ ${esc(U("handwrite"))}</span>`;
      const s = sectionsHtml(L, id);
      tocHtml = s.tocHtml;
      const goals = L.goals && L.goals.length
        ? `<div class="card goals"><h3>🎯 ${esc(U("goals"))}</h3><ul>${L.goals.map((g) => `<li>${inline(T(g))}</li>`).join("")}</ul>${tocHtml}</div>` : tocHtml;
      body = `${L.summary ? `<p>${inline(T(L.summary))}</p>` : ""}
        <div class="source-note">${esc(U({ screenshot: "sourceScreenshot", learner: "sourceLearner", subtitle: "sourceSubtitle" }[L.source] || "sourceTitle"))}</div>${goals}${s.html}`;
    } else {
      body = `<div class="card">${esc(U("notReady"))}</div>`;
    }
    const done = isDone(id);
    const pager = `<div class="pager">
      ${prevId ? `<a href="#/lesson/${prevId}"><span class="lbl">${esc(U("prev"))}</span>${esc(C.lessons[prevId].num + " · " + T(C.lessons[prevId].title))}</a>` : "<span></span>"}
      ${nextId ? `<a href="#/lesson/${nextId}" style="text-align:right"><span class="lbl">${esc(U("next"))}</span>${esc(C.lessons[nextId].num + " · " + T(C.lessons[nextId].title))}</a>` : "<span></span>"}</div>`;
    return `<div class="page">
      <div class="crumb">${esc(T(mod.title))}</div>
      <h1>${meta.num} · ${esc(T(meta.title))}</h1>
      <div class="meta">${chips}</div>
      <div class="actions">
        <a class="btn" href="${attr(videoUrl)}" target="_blank" rel="noopener">▶ ${esc(U("openVideo"))}</a>
        ${L ? `<button class="btn ${done ? "ok" : "primary"}" data-act="mark-done" data-lid="${id}">${esc(U(done ? "done" : "markDone"))}</button>` : ""}
      </div>${body}
      ${L ? `<div class="actions" style="margin-top:28px"><button class="btn ${done ? "ok" : "primary"}" data-act="mark-done" data-lid="${id}">${esc(U(done ? "done" : "markDone"))}</button></div>` : ""}
      ${pager}</div>`;
  }

  function renderPage(pid) {
    const P = C.pages[pid];
    if (!P) return `<div class="page"><div class="card">${esc(U("notReady"))}</div></div>`;
    const s = sectionsHtml(P, pid);
    return `<div class="page"><h1>${esc(T(P.title))}</h1>${P.summary ? `<p>${inline(T(P.summary))}</p>` : ""}${s.tocHtml}${s.html}</div>`;
  }

  function renderHome() {
    const d = doneMap();
    const H = C.pages.home || {};
    const prioCount = { core: [0, 0], important: [0, 0], overview: [0, 0] };
    ORDER.forEach((id) => {
      const L = C.data[id];
      if (L && prioCount[L.priority]) { prioCount[L.priority][0]++; prioCount[L.priority][1] += L.studyMinutes || 0; }
    });
    const last = S.get("last", null);
    const cont = last && C.lessons[last]
      ? `<a class="btn primary" href="#/lesson/${last}">▶ ${lang === "zh" ? "继续学习" : "Continue"}：${esc(C.lessons[last].num + " · " + T(C.lessons[last].title))}</a>`
      : `<a class="btn primary" href="#/setup">▶ ${lang === "zh" ? "从环境准备开始" : "Start with setup"}</a>`;
    const legend = ["core", "important", "overview"].map((p) => {
      const [n, m] = prioCount[p];
      return `<span><span class="dot ${p}"></span><strong>${esc(U(PRIO[p]))}</strong> — ${esc(U(PRIO[p] + "Tip"))}${n ? `（${n} ${lang === "zh" ? "节，约" : "lessons, ≈"} ${Math.round(m / 6) / 10} ${lang === "zh" ? "小时" : "h"}）` : ""}</span>`;
    }).join("");
    const cards = C.modules.map((m) => {
      const n = m.lessons.filter((id) => d[id]).length;
      const pct = Math.round((n / m.lessons.length) * 100);
      const first = m.lessons.find((id) => !d[id]) || m.lessons[0];
      const range = `${C.lessons[m.lessons[0]].num}–${C.lessons[m.lessons[m.lessons.length - 1]].num}`;
      return `<a class="modcard" href="#/lesson/${first}"><span class="t">${esc(T(m.title))}</span><span class="d">${esc(T(m.desc))}</span>
        <span class="pbar"><i style="width:${pct}%"></i></span><span class="pc">${range} · ${n}/${m.lessons.length}</span></a>`;
    }).join("");
    return `<div class="page">
      <div class="hero"><h1>${esc(T(H.title) || U("appTitle"))}</h1>${md(T(H.intro))}</div>
      <div class="actions">${cont}<a class="btn" href="#/setup">🧰 ${esc(U("setup"))}</a><a class="btn" href="#/review">🔁 ${esc(U("review"))}</a></div>
      ${renderBlocks(H.blocks, "home")}
      <h2>${esc(U("modules"))}</h2>
      <div class="legend">${legend}</div>
      <div class="modgrid">${cards}</div>
      <p style="margin-top:40px"><button class="btn sm" data-act="reset-all">${esc(U("resetAll"))}</button></p></div>`;
  }

  function renderPython() {
    const items = [];
    ORDER.forEach((id) => {
      const L = C.data[id];
      if (!L) return;
      (L.blocks || []).forEach((b, i) => { if (b.t === "py") items.push({ id, b, i }); });
    });
    const list = items.map(({ id, b, i }) => `<details class="pyindex-item" data-text="${attr((T(b.title) + " " + T(C.lessons[id].title)).toLowerCase())}">
      <summary><strong>${esc(T(b.title))}</strong> <span class="l">— ${esc(C.lessons[id].num + " · " + T(C.lessons[id].title))}</span></summary>
      ${pyBox(b, `${id}:b${i}`)}<a href="#/lesson/${id}">→ ${esc(C.lessons[id].num + " · " + T(C.lessons[id].title))}</a></details>`).join("");
    return `<div class="page"><h1>🐍 ${esc(U("python"))}</h1><p>${esc(U("pyIndexIntro"))}</p>
      <input class="search" id="pyFilter" placeholder="${attr(U("filter"))}"> <span class="small muted">${items.length}</span>
      <div id="pyList" style="margin-top:12px">${list}</div></div>`;
  }

  let reviewSet = null;
  function renderReview() {
    let qs = "";
    if (reviewSet) {
      qs = reviewSet.length
        ? reviewSet.map((r, n) => quizItem(C.data[r.lid].quiz[r.i], r.lid, "quiz", r.i, n + 1, { from: r.lid })).join("")
        : `<div class="card">${esc(U("reviewEmpty"))}</div>`;
    }
    const d = doneMap();
    const recaps = ORDER.filter((id) => d[id] && C.data[id] && C.data[id].recap)
      .map((id) => `<div class="card"><strong><a href="#/lesson/${id}">${esc(C.lessons[id].num + " · " + T(C.lessons[id].title))}</a></strong>
        <ul class="recap">${C.data[id].recap.map((p) => `<li>${inline(T(p))}</li>`).join("")}</ul></div>`).join("");
    return `<div class="page"><h1>🔁 ${esc(U("review"))}</h1><p>${esc(U("reviewIntro"))}</p>
      <div class="actions"><button class="btn primary" data-act="review-done">${esc(U("reviewDone"))}</button>
      <button class="btn" data-act="review-all">${esc(U("reviewAll"))}</button></div>${qs}
      ${recaps ? `<h2>${esc(U("recapCards"))}</h2>${recaps}` : ""}</div>`;
  }

  function pickReview(onlyDone) {
    const d = doneMap();
    const pool = [];
    ORDER.forEach((id) => {
      const L = C.data[id];
      if (!L || !L.quiz || (onlyDone && !d[id])) return;
      L.quiz.forEach((_, i) => pool.push({ lid: id, i }));
    });
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    pool.slice(0, 10).forEach((r) => S.del(`ans:${r.lid}:quiz:${r.i}`));
    reviewSet = pool.slice(0, 10);
  }

  // ------------------------------------------------------------ router
  function route() {
    const h = location.hash.replace(/^#\/?/, "");
    const [kind, arg] = h.split("/");
    let html;
    let active = "home";
    if (kind === "lesson") { html = renderLesson(arg); active = arg; }
    else if (kind === "setup") { html = renderPage("setup"); active = "setup"; }
    else if (kind === "python") { html = renderPython(); active = "python"; }
    else if (kind === "review") { html = renderReview(); active = "review"; }
    else html = renderHome();
    document.getElementById("main").innerHTML = html;
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    const meta = kind === "lesson" && C.lessons[arg];
    document.title = (meta ? `${meta.num} · ${T(meta.title)} — ` : "") + U("appTitle");
    renderTopbar();
    renderSidebar(active);
    document.body.classList.remove("nav-open");
    const f = document.getElementById("pyFilter");
    if (f) f.addEventListener("input", () => {
      const v = f.value.trim().toLowerCase();
      document.querySelectorAll("#pyList .pyindex-item").forEach((el) => { el.hidden = v && !el.dataset.text.includes(v); });
    });
  }

  function rerender(keepScroll) {
    const y = window.scrollY;
    route();
    if (keepScroll) window.scrollTo(0, y);
  }

  // ------------------------------------------------------------ actions
  const norm = (s) => String(s).replace(/\s+/g, "").replace(/'/g, '"');

  async function runIn(container, code, btn) {
    const out = container.querySelector(".out");
    out.innerHTML = "";
    const write = (text, kind) => {
      const span = document.createElement("span");
      if (kind && kind !== "out") span.className = kind;
      span.textContent = text;
      out.appendChild(span);
      out.scrollTop = out.scrollHeight;
    };
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = U("running");
    let loadingSpan = null;
    try {
      if (!window.PyRunner.isLoaded()) {
        write(U("loadingPy") + "\n", "sys");
        loadingSpan = out.lastChild;
      }
      await window.PyRunner.load();
      if (loadingSpan) loadingSpan.remove();
      await window.PyRunner.run(code, write);
      if (!out.textContent.trim()) write(lang === "zh" ? "（运行完成，没有输出）" : "(finished, no output)", "sys");
    } catch (e) {
      if (loadingSpan) loadingSpan.remove();
      write(U("pyLoadFail") + "\n" + ((e && e.message) || e), "err");
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  }

  function copyText(text, btn) {
    const ok = () => { const t = btn.textContent; btn.textContent = U("copied"); setTimeout(() => { btn.textContent = t; }, 1200); };
    const fallback = () => {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); ok(); } catch (e) { /* ignore */ }
      ta.remove();
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(ok, fallback);
    else fallback();
  }

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-act]");
    if (!el) {
      if (document.body.classList.contains("nav-open") && !e.target.closest("#sidebar")) document.body.classList.remove("nav-open");
      return;
    }
    const act = el.dataset.act;
    if (act === "w-done") return; // handled by change event
    if (act === "lang") { lang = lang === "zh" ? "en" : "zh"; S.set("lang", lang); rerender(true); return; }
    if (act === "theme") {
      const cur = document.documentElement.dataset.theme ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      const next = cur === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      S.set("theme", next);
      return;
    }
    if (act === "menu") { e.stopPropagation(); document.body.classList.toggle("nav-open"); return; }
    if (act === "scroll") { const t = document.getElementById(el.dataset.target); if (t) t.scrollIntoView({ behavior: "smooth" }); return; }
    if (act === "mark-done") {
      const d = doneMap();
      if (d[el.dataset.lid]) delete d[el.dataset.lid]; else d[el.dataset.lid] = true;
      S.set("done", d);
      rerender(true);
      return;
    }
    if (act === "quiz") {
      const { lid, set, i, o } = el.dataset;
      const q = findQuiz(lid, set, +i);
      if (!q) return;
      S.set(`ans:${lid}:${set}:${i}`, +o);
      const box = el.closest(".quiz");
      const tmp = document.createElement("div");
      const num = box.querySelector(".q").textContent.match(/^(\d+)\.\s/);
      const fromLink = box.querySelector(":scope > .small a");
      tmp.innerHTML = quizItem(q, lid, set, +i, num ? num[1] : "", { from: fromLink ? lid : null });
      box.replaceWith(tmp.firstElementChild);
      if (set === "quiz") {
        const h = document.getElementById("sec-quiz");
        const st = lessonStats(lid);
        if (h && st) h.textContent = U("secQuiz") + `（${st.ok}/${st.total}）`;
      }
      return;
    }
    if (act === "copy") {
      const box = el.closest(".code");
      const ta = box.querySelector("textarea.editor");
      copyText(ta ? ta.value : box.querySelector("pre").textContent, el);
      return;
    }
    if (act === "run") {
      const box = el.closest(".write") || el.closest(".code");
      const ta = box.querySelector("textarea.editor");
      runIn(box.querySelector(".code.runnable") || box, ta.value, el);
      return;
    }
    if (act === "reset-code") {
      const box = el.closest(".write") || el.closest(".code");
      const ta = box.querySelector("textarea.editor");
      const key = ta.dataset.ed;
      ta.value = ORIGINAL[key] ?? "";
      S.del("ed:" + key);
      const out = box.querySelector(".out");
      if (out) out.innerHTML = "";
      const checks = box.querySelector(".checks");
      if (checks) checks.innerHTML = "";
      return;
    }
    if (act.startsWith("fill-")) {
      const box = el.closest(".fill");
      const inputs = [...box.querySelectorAll("input.blank")];
      const msg = box.querySelector(".msg");
      if (act === "fill-reset") {
        inputs.forEach((x) => { x.value = ""; x.classList.remove("ok", "bad"); });
        S.del(box.dataset.fill);
        msg.textContent = "";
        return;
      }
      if (act === "fill-show") inputs.forEach((x) => { x.value = x.dataset.ans.split("|")[0]; });
      let allOk = true;
      inputs.forEach((x) => {
        const good = x.dataset.ans.split("|").some((a) => norm(a) === norm(x.value));
        x.classList.toggle("ok", good);
        x.classList.toggle("bad", !good);
        if (!good) allOk = false;
      });
      S.set(box.dataset.fill, inputs.map((x) => x.value));
      msg.className = "msg " + (allOk ? "ok" : "bad");
      msg.textContent = U(allOk ? "allCorrect" : "someWrong");
      return;
    }
    if (act === "w-check") {
      const box = el.closest(".write");
      const w = C.data[box.dataset.lid] ? C.data[box.dataset.lid].write[+box.dataset.i] : (C.pages[box.dataset.lid] || {}).write[+box.dataset.i];
      const text = box.querySelector("textarea.editor").value;
      const ul = box.querySelector(".checks");
      ul.innerHTML = `<li style="list-style:none" class="muted">${esc(U("keysFound"))}</li>` + (w.checks || []).map((c) => {
        let ok = false;
        try { ok = new RegExp(c.re, c.flags || "m").test(text); } catch (err) { ok = false; }
        return `<li class="${ok ? "ok" : "bad"}">${inline(T(c))}</li>`;
      }).join("");
      return;
    }
    if (act === "w-sol") {
      const sol = el.closest(".write").querySelector(".sol");
      sol.hidden = !sol.hidden;
      return;
    }
    if (act === "review-done" || act === "review-all") { pickReview(act === "review-done"); rerender(true); return; }
    if (act === "reset-all") {
      if (window.confirm(U("resetConfirm"))) { S.clearAll(); S.set("lang", lang); rerender(false); }
    }
  });

  document.addEventListener("change", (e) => {
    const el = e.target;
    if (el.dataset && el.dataset.act === "w-done") {
      const key = el.closest(".write").dataset.write;
      S.set("wdone:" + key, el.checked);
    }
  });

  let saveTimer = null;
  document.addEventListener("input", (e) => {
    const el = e.target;
    if (el.matches("textarea.editor")) {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => S.set("ed:" + el.dataset.ed, el.value), 300);
    } else if (el.matches("input.blank")) {
      el.classList.remove("ok", "bad");
      const box = el.closest(".fill");
      S.set(box.dataset.fill, [...box.querySelectorAll("input.blank")].map((x) => x.value));
    }
  });

  function insertText(ta, text) {
    ta.focus();
    if (!document.execCommand || !document.execCommand("insertText", false, text)) ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, "end");
    ta.dispatchEvent(new Event("input", { bubbles: true }));
  }

  document.addEventListener("keydown", (e) => {
    const ta = e.target;
    if (!ta.matches || !ta.matches("textarea.editor")) return;
    if (e.key === "Tab" && !e.shiftKey) { e.preventDefault(); insertText(ta, "    "); return; }
    if (e.key === "Enter" && !e.ctrlKey && !e.metaKey && !e.isComposing) {
      const before = ta.value.slice(0, ta.selectionStart);
      const lineStart = before.lastIndexOf("\n") + 1;
      const line = before.slice(lineStart);
      let indent = (line.match(/^[ \t]*/) || [""])[0];
      if (/:\s*(#.*)?$/.test(line)) indent += "    ";
      e.preventDefault();
      insertText(ta, "\n" + indent);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      const box = ta.closest(".write") || ta.closest(".code");
      const btn = box && box.querySelector('[data-act="run"]');
      if (btn) { e.preventDefault(); btn.click(); }
    }
  });

  // ------------------------------------------------------------ boot
  const theme = S.get("theme", null);
  if (theme) document.documentElement.dataset.theme = theme;
  window.addEventListener("hashchange", () => { route(); window.scrollTo(0, 0); });
  route();
})();
