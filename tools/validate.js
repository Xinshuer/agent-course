// Validate lesson data files and export every code snippet for tools/check_code.py.
// Usage: node tools/validate.js [lessonId ...] [--export build/code.json]
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const exportIdx = args.indexOf("--export");
const exportPath = exportIdx >= 0 ? path.resolve(ROOT, args[exportIdx + 1]) : null;
const only = args.filter((a, i) => !a.startsWith("--") && (exportIdx < 0 || i !== exportIdx + 1));

const ctx = { window: {}, console };
ctx.window.COURSE = undefined;
vm.createContext(ctx);
function load(file) {
  const code = fs.readFileSync(file, "utf8");
  vm.runInContext(code.replace(/\bwindow\.COURSE\b/g, "COURSE_W"), ctx, { filename: file });
}
// course.js assigns window.COURSE; lesson files use the global COURSE.
vm.runInContext("var COURSE_W; var COURSE;", ctx);
load(path.join(ROOT, "data/course.js"));
vm.runInContext("COURSE = COURSE_W; COURSE.data = {}; COURSE.pages = {}; COURSE.lesson = function (o) { COURSE.data[o.id] = o; };", ctx);
const C = ctx.COURSE;

const errors = [];
const warns = [];
const codes = [];
const E = (where, msg) => errors.push(`${where}: ${msg}`);
const W = (where, msg) => warns.push(`${where}: ${msg}`);

const CJK = /[一-鿿]/g;
function bi(o, where, opts = {}) {
  if (o == null) { if (!opts.optional) E(where, "missing bilingual text"); return; }
  if (typeof o === "string") { if (!opts.allowString) E(where, "expected {zh, en}, got a plain string"); return; }
  if (typeof o !== "object") return E(where, "expected {zh, en}");
  if (!o.zh || !String(o.zh).trim()) E(where, "zh is empty");
  if (!o.en || !String(o.en).trim()) E(where, "en is empty");
  if (o.zh && o.en && !opts.code) {
    const en = String(o.en).replace(/`[^`]*`/g, "");
    const n = (en.match(CJK) || []).length;
    if (n > 12 && n / en.length > 0.08) W(where, `en text has ${n} CJK chars - untranslated?`);
    const zhProse = String(o.zh).replace(/`[^`]*`/g, "").trim();
    if (!CJK.test(String(o.zh)) && zhProse.length > 40) W(where, "zh text has no Chinese characters");
    CJK.lastIndex = 0;
  }
}
function codeVariants(c) {
  if (typeof c === "string") return [["both", c]];
  if (c && typeof c === "object") return [["zh", c.zh], ["en", c.en]];
  return [];
}
function addCode(lid, where, c, lang, run, extra = {}) {
  if (typeof c === "string" && /[一-鿿]/.test(c)) W(where, "plain-string code contains Chinese - give it {zh, en} so EN mode shows English");
  for (const [lg, src] of codeVariants(c)) {
    if (typeof src !== "string" || !src.trim()) { E(where, `code (${lg}) empty`); continue; }
    codes.push({ lesson: lid, where, variant: lg, lang: lang || "python", run: run || false, code: src, ...extra });
  }
}

const BLOCK_TYPES = new Set(["h", "p", "code", "py", "tip", "warn", "note", "video", "check"]);
const RUN_VALUES = new Set([undefined, false, true, "mock"]);

function quiz(q, where) {
  bi(q.q, where + ".q");
  if (!Array.isArray(q.options) || q.options.length < 2) return E(where, "needs >= 2 options");
  q.options.forEach((o, j) => bi(o, `${where}.options[${j}]`));
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) E(where, `answer index ${q.answer} out of range`);
  bi(q.explain, where + ".explain");
}

function checkUnit(L, lid, isPage) {
  const at = (s) => `${lid}.${s}`;
  if (!isPage) {
    if (!["core", "important", "overview"].includes(L.priority)) E(lid, `priority must be core|important|overview, got ${L.priority}`);
    if (typeof L.handwrite !== "boolean") E(lid, "handwrite must be boolean");
    if (!Number.isFinite(L.studyMinutes) || L.studyMinutes < 5 || L.studyMinutes > 180) E(lid, "studyMinutes must be 5..180");
    if (!["title", "screenshot", "learner", "subtitle"].includes(L.source)) E(lid, "source must be title|screenshot|learner|subtitle");
    bi(L.summary, at("summary"));
    if (!Array.isArray(L.goals) || L.goals.length < 2) E(lid, "needs >= 2 goals");
    (L.goals || []).forEach((g, i) => bi(g, at(`goals[${i}]`)));
  } else {
    bi(L.title, at("title"));
  }
  if (!Array.isArray(L.blocks) || !L.blocks.length) E(lid, "blocks missing");
  let pyCount = 0;
  (L.blocks || []).forEach((b, i) => {
    const w = at(`blocks[${i}]`);
    if (!BLOCK_TYPES.has(b.t)) return E(w, `unknown block type ${b.t}`);
    if (["h", "p", "tip", "warn", "note", "video"].includes(b.t)) bi(b, w);
    if (b.title) bi(b.title, w + ".title");
    if (b.t === "code") {
      if (!RUN_VALUES.has(b.run)) E(w, `bad run value ${b.run}`);
      if (b.note) bi(b.note, w + ".note");
      addCode(lid, w, b.code, b.lang, b.run);
    }
    if (b.t === "py") {
      pyCount++;
      bi(b.title, w + ".title");
      bi(b, w);
      if (b.note) bi(b.note, w + ".note");
      if (b.code) addCode(lid, w, b.code, "python", b.run === undefined ? true : b.run);
    }
    if (b.t === "check") quiz(b, w);
  });
  if (!isPage) {
    if (!Array.isArray(L.quiz) || L.quiz.length < 3) E(lid, "needs >= 3 quiz questions");
    (L.quiz || []).forEach((q, i) => quiz(q, at(`quiz[${i}]`)));
    if (L.handwrite && (!Array.isArray(L.write) || !L.write.length)) E(lid, "handwrite lesson needs >= 1 write task");
    if (!Array.isArray(L.pitfalls) || L.pitfalls.length < 2) W(lid, "fewer than 2 pitfalls");
    if (!Array.isArray(L.recap) || L.recap.length < 3) E(lid, "needs >= 3 recap items");
  }
  (L.fill || []).forEach((f, i) => {
    const w = at(`fill[${i}]`);
    bi(f.title, w + ".title", { optional: true });
    if (f.explain) bi(f.explain, w + ".explain");
    const vs = codeVariants(f.code);
    const counts = vs.map(([, src]) => (String(src || "").match(/\[\[.+?\]\]/g) || []).length);
    if (!counts.length || counts.some((n) => n === 0)) E(w, "fill code needs [[blanks]]");
    if (counts.length === 2 && counts[0] !== counts[1]) E(w, "zh/en fill variants have different blank counts");
    for (const [lg, src] of vs) {
      const filled = String(src || "").replace(/\[\[(.+?)\]\]/g, (_, a) => a.split("|")[0]);
      codes.push({ lesson: lid, where: w, variant: lg, lang: "python", run: false, code: filled, fragment: true });
    }
  });
  (L.write || []).forEach((t, i) => {
    const w = at(`write[${i}]`);
    bi(t.title, w + ".title");
    bi(t.task, w + ".task");
    if (!RUN_VALUES.has(t.run)) E(w, `bad run value ${t.run}`);
    if (t.starter !== undefined) addCode(lid, w + ".starter", t.starter, "python", false, { starter: true });
    addCode(lid, w + ".solution", t.solution, "python", t.run, { solution: true });
    if (!Array.isArray(t.checks) || t.checks.length < 3) E(w, "needs >= 3 checks");
    (t.checks || []).forEach((c, j) => {
      bi(c, `${w}.checks[${j}]`);
      let re;
      try { re = new RegExp(c.re, c.flags || "m"); } catch (err) { return E(`${w}.checks[${j}]`, "regex does not compile: " + err.message); }
      for (const [lg, src] of codeVariants(t.solution)) {
        if (src && !re.test(src)) E(`${w}.checks[${j}]`, `regex /${c.re}/ does not match the ${lg} solution`);
      }
      for (const [lg, src] of codeVariants(t.starter)) {
        if (src && re.test(src) && !c.starterOk) W(`${w}.checks[${j}]`, `regex already matches the ${lg} starter (check is trivially passed)`);
      }
    });
  });
  (L.pitfalls || []).forEach((p, i) => bi(p, at(`pitfalls[${i}]`)));
  (L.recap || []).forEach((p, i) => bi(p, at(`recap[${i}]`)));
  (L.files || []).forEach((f, i) => {
    const w = at(`files[${i}]`);
    bi(f, w);
    if (!f.path || !fs.existsSync(path.join(ROOT, f.path))) E(w, `file not found: ${f.path}`);
  });
  if (!isPage && pyCount === 0 && !L.noPy) W(lid, "no Python mini-lesson (py block) - set noPy: true for code-free lessons");
}

// pages
for (const p of ["home", "setup"]) {
  const f = path.join(ROOT, "data/pages", p + ".js");
  if (fs.existsSync(f)) {
    load(f);
    if (!only.length) checkUnit(C.pages[p], p, true);
  }
}
// lessons
const ids = Object.keys(C.lessons);
let present = 0;
for (const id of ids) {
  if (only.length && !only.includes(id)) continue;
  const f = path.join(ROOT, "data/lessons", id + ".js");
  if (!fs.existsSync(f)) { if (only.length) E(id, "lesson file missing"); continue; }
  try { load(f); } catch (err) { E(id, "file does not load: " + err.message); continue; }
  const L = C.data[id];
  if (!L) { E(id, "file did not call COURSE.lesson(...)"); continue; }
  if (L.id !== id) E(id, `id field is ${L.id}`);
  present++;
  checkUnit(L, id, false);
}

if (exportPath) {
  fs.mkdirSync(path.dirname(exportPath), { recursive: true });
  fs.writeFileSync(exportPath, JSON.stringify(codes, null, 1), "utf8");
}
console.log(`lessons present: ${present}/${only.length || ids.length}, code snippets: ${codes.length}`);
warns.forEach((w) => console.log("WARN  " + w));
errors.forEach((e) => console.log("ERROR " + e));
console.log(`${errors.length} errors, ${warns.length} warnings`);
process.exit(errors.length ? 1 : 0);
