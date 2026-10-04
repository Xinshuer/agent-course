// Translation helper: list the zh fields of a lesson and write English back into the lesson file.
//
//   node tools/en_fields.js dump  l52 [--missing] [--out build/en_work/l52.todo.json]
//       Writes [{path, kind, zh, en?}] for every zh field (kind "text" or "code") plus every
//       plain-string code field that contains Chinese (kind "code-plain"; en becomes its English variant).
//       --missing keeps only fields without en (and the code-plain ones).
//   node tools/en_fields.js apply l52 build/en_work/l52.en.json
//       Input: {"<path>": "<english>", ...}. Sets en right after zh (a plain code string becomes
//       {zh, en}), then rewrites the lesson file. Only for lesson files written as JSON
//       (`COURSE.lesson({ "id": ... })`); for JS-literal files edit by hand.
//
// Paths look like  blocks.12.code  or  quiz.3.options.1  (dot-separated keys / array indexes).
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const CJK = /[一-鿿]/;
const CODE_KEYS = new Set(["code", "starter", "solution"]);
const HEADER = "COURSE.lesson = COURSE.lesson || function (o) { (COURSE.data = COURSE.data || {})[o.id] = o; };";

function lessonFile(id) { return path.join(ROOT, "data/lessons", id + ".js"); }

function loadLesson(id) {
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext("var COURSE = { data: {} }; COURSE.lesson = function (o) { COURSE.data[o.id] = o; };", ctx);
  vm.runInContext(fs.readFileSync(lessonFile(id), "utf8"), ctx);
  const L = ctx.COURSE.data[id];
  if (!L) throw new Error(`${id}: file did not call COURSE.lesson`);
  return JSON.parse(JSON.stringify(L));
}

// Detect the JSON layout of a lesson file; returns {indent, eol} or null for JS-literal files.
function jsonLayout(id) {
  const src = fs.readFileSync(lessonFile(id), "utf8");
  const eol = src.includes("\r\n") ? "\r\n" : "\n";
  const lines = src.split(/\r?\n/);
  if (lines[0] !== HEADER || lines[1] !== "COURSE.lesson({") return null;
  const m = /^( +)"id": /.exec(lines[2]);
  return m ? { indent: m[1].length, eol, trailingEol: src.endsWith(eol) } : null;
}

function serialize(L, layout) {
  const body = JSON.stringify(L, null, layout.indent);
  const text = HEADER + "\n" + "COURSE.lesson(" + body + ");" + (layout.trailingEol ? "\n" : "");
  return layout.eol === "\n" ? text : text.replace(/\n/g, layout.eol);
}

function walk(node, p, key, out, missingOnly) {
  if (node == null) return;
  if (typeof node === "string") {
    if (CODE_KEYS.has(key) && CJK.test(node)) out.push({ path: p.join("."), kind: "code-plain", zh: node });
    return;
  }
  if (Array.isArray(node)) { node.forEach((x, i) => walk(x, p.concat(i), key, out, missingOnly)); return; }
  if (typeof node === "object") {
    if (typeof node.zh === "string") {
      const has = node.en != null && String(node.en).trim() !== "";
      if (!missingOnly || !has) {
        const e = { path: p.join("."), kind: CODE_KEYS.has(key) ? "code" : "text", zh: node.zh };
        if (has) e.en = node.en;
        out.push(e);
      }
    }
    for (const [k, v] of Object.entries(node)) if (k !== "zh" && k !== "en") walk(v, p.concat(k), k, out, missingOnly);
  }
}

function getParent(L, p) {
  const parts = p.split(".");
  let cur = L;
  for (const part of parts.slice(0, -1)) {
    if (cur == null) return null;
    cur = cur[Array.isArray(cur) ? Number(part) : part];
  }
  return cur == null ? null : { obj: cur, key: Array.isArray(cur) ? Number(parts.at(-1)) : parts.at(-1) };
}

function withEn(o, en) {
  const out = {};
  for (const [k, v] of Object.entries(o)) {
    if (k === "en") continue;
    out[k] = v;
    if (k === "zh") out.en = en;
  }
  return out;
}

const [cmd, id, ...rest] = process.argv.slice(2);
if (!cmd || !id) { console.error("usage: node tools/en_fields.js dump|apply|roundtrip <lessonId> ..."); process.exit(2); }

if (cmd === "dump") {
  const L = loadLesson(id);
  const out = [];
  walk(L, [], "", out, rest.includes("--missing"));
  const oi = rest.indexOf("--out");
  const json = JSON.stringify(out, null, 1);
  if (oi >= 0) {
    const f = path.resolve(ROOT, rest[oi + 1]);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, json, "utf8");
    console.log(`${id}: ${out.length} fields -> ${path.relative(ROOT, f)}`);
  } else console.log(json);
} else if (cmd === "roundtrip") {
  const layout = jsonLayout(id);
  if (!layout) { console.log(`${id}: JS-literal file (edit by hand)`); process.exit(0); }
  const same = serialize(loadLesson(id), layout) === fs.readFileSync(lessonFile(id), "utf8");
  console.log(`${id}: JSON file, indent ${layout.indent}, round trip ${same ? "identical" : "DIFFERS"}`);
  process.exit(same ? 0 : 1);
} else if (cmd === "lint") {
  // Heuristic zh/en sync check for text fields: same timestamp links, same `code` spans,
  // same number of list items / table rows / paragraphs. Mismatches usually mean stale or partial en.
  const ids = id === "all" ? fs.readdirSync(path.join(ROOT, "data/lessons")).map((f) => f.replace(/\.js$/, "")) : [id, ...rest];
  const links = (s) => (s.match(/\]\(https:\/\/www\.bilibili\.com[^)]*\)/g) || []).sort().join(" ");
  // every `span` of the zh text (without Chinese inside) must appear somewhere in the en text
  const lostSpans = (zh, en) => (zh.match(/`[^`\n]+`/g) || []).map((x) => x.slice(1, -1)).filter((x) => !CJK.test(x) && !en.includes(x));
  const shape = (s) => [/^\s*[-*] /gm, /\n\s*\d+\. /g, /^\|/gm, /\n\s*\n/g].map((re) => (s.match(re) || []).length).join("/");
  // code variants: identical once comments, string literals and blank lines are removed
  const skeleton = (s) => s
    .replace(/("""|''')[\s\S]*?\1/g, "S")
    .replace(/f?"(?:[^"\\\n]|\\.)*"|f?'(?:[^'\\\n]|\\.)*'/g, "S")
    .replace(/#.*$/gm, "")
    .split("\n").map((l) => l.trim()).filter((l) => l && !CJK.test(l)).join("\n");
  let total = 0;
  for (const lid of ids) {
    const out = [];
    walk(loadLesson(lid), [], "", out, false);
    for (const f of out) {
      if (f.kind === "code" && f.en != null && skeleton(f.zh) !== skeleton(f.en)) {
        const a = skeleton(f.zh).split("\n"), b = skeleton(f.en).split("\n");
        const i = a.findIndex((l, k) => l !== b[k]);
        total++;
        console.log(`${lid} ${f.path}: code-drift (zh/en code differ beyond comments/strings) first diff: ${JSON.stringify(a[i] || "").slice(0, 70)} vs ${JSON.stringify(b[i] || "").slice(0, 70)}`);
      }
      if (f.kind !== "text" || f.en == null) continue;
      const probs = [];
      if (links(f.zh) !== links(f.en)) probs.push("links");
      if (shape(f.zh) !== shape(f.en)) probs.push(`shape ${shape(f.zh)} vs ${shape(f.en)}`);
      const lost = lostSpans(f.zh, f.en);
      if (lost.length) probs.push("code-spans missing in en: " + lost.slice(0, 4).join(" | "));
      if (probs.length) { total++; console.log(`${lid} ${f.path}: ${probs.join(", ")}`); }
    }
  }
  console.log(`${total} fields flagged`);
} else if (cmd === "tojson") {
  // Rewrite a JS-literal lesson file in the JSON layout (same data), so `apply` can edit it.
  if (jsonLayout(id)) { console.log(`${id}: already JSON`); process.exit(0); }
  const src = fs.readFileSync(lessonFile(id), "utf8");
  const before = loadLesson(id);
  const layout = { indent: 2, eol: src.includes("\r\n") ? "\r\n" : "\n", trailingEol: /\r?\n$/.test(src) };
  fs.writeFileSync(lessonFile(id), serialize(before, layout), "utf8");
  const same = JSON.stringify(loadLesson(id)) === JSON.stringify(before);
  if (!same) { fs.writeFileSync(lessonFile(id), src, "utf8"); console.error(`${id}: data changed - restored`); process.exit(1); }
  console.log(`${id}: converted to JSON layout (data identical)`);
} else if (cmd === "apply") {
  const layout = jsonLayout(id);
  if (!layout) { console.error(`${id} is a JS-literal file - edit it by hand`); process.exit(1); }
  const map = JSON.parse(fs.readFileSync(path.resolve(ROOT, rest[0]), "utf8"));
  const L = loadLesson(id);
  let n = 0;
  const bad = [];
  for (const [p, en] of Object.entries(map)) {
    if (typeof en !== "string" || !en.trim()) { bad.push(`${p}: empty en`); continue; }
    const ref = getParent(L, p);
    const cur = ref && ref.obj[ref.key];
    if (typeof cur === "string") ref.obj[ref.key] = { zh: cur, en };
    else if (cur && typeof cur === "object" && typeof cur.zh === "string") ref.obj[ref.key] = withEn(cur, en);
    else { bad.push(`${p}: no zh field here`); continue; }
    n++;
  }
  if (bad.length) { console.error(bad.join("\n")); console.error(`${bad.length} problems - nothing written`); process.exit(1); }
  fs.writeFileSync(lessonFile(id), serialize(L, layout), "utf8");
  console.log(`${id}: wrote en for ${n} fields`);
} else {
  console.error("unknown command " + cmd);
  process.exit(2);
}
