// Two checks that keep the notes honest:
//  1. copy check - flags any run of >= MIN identical Chinese characters shared by a lesson's zh text
//     and its episode's subtitles (punctuation ignored), so notes stay in our own words;
//  2. timestamp links - every bilibili link must point at the lesson's own part (?p=) and a time
//     inside the episode.
// Usage: node tools/check_sources.js [lessonId ...]
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const MIN = 20;
const only = process.argv.slice(2);

const ctx = { window: {} };
vm.createContext(ctx);
const load = (f) => vm.runInContext(fs.readFileSync(f, "utf8").replace(/\bwindow\.COURSE\b/g, "COURSE_W"), ctx);
vm.runInContext("var COURSE_W; var COURSE;", ctx);
load(path.join(ROOT, "data/course.js"));
vm.runInContext("COURSE = COURSE_W; COURSE.data = {}; COURSE.lesson = function (o) { COURSE.data[o.id] = o; };", ctx);
const C = ctx.COURSE;

function zhTexts(node, out) {
  if (node == null) return out;
  if (typeof node === "string") return out;
  if (Array.isArray(node)) { node.forEach((x) => zhTexts(x, out)); return out; }
  if (typeof node === "object") {
    if (typeof node.zh === "string") out.push(node.zh);
    for (const [k, v] of Object.entries(node)) if (k !== "zh") zhTexts(v, out);
  }
  return out;
}
const cjkOnly = (s) => (s.match(/[一-鿿]/g) || []).join("");

let copyHits = 0;
let linkErrors = 0;
let links = 0;
for (const id of Object.keys(C.lessons)) {
  if (only.length && !only.includes(id)) continue;
  const file = path.join(ROOT, "data/lessons", id + ".js");
  if (!fs.existsSync(file)) continue;
  load(file);
  const L = C.data[id];
  const meta = C.lessons[id];
  const texts = zhTexts(L, []);

  // 1. copy check
  const subFile = path.join(ROOT, "build/subtitles", `p${String(meta.page).padStart(2, "0")}.txt`);
  if (fs.existsSync(subFile)) {
    const sub = cjkOnly(fs.readFileSync(subFile, "utf8").replace(/^\[[\d:]+\]/gm, ""));
    const grams = new Set();
    for (let i = 0; i + MIN <= sub.length; i++) grams.add(sub.slice(i, i + MIN));
    for (const t of texts) {
      const s = cjkOnly(t);
      for (let i = 0; i + MIN <= s.length; i++) {
        if (grams.has(s.slice(i, i + MIN))) {
          let j = i + MIN;
          while (j < s.length && sub.includes(s.slice(i, j + 1))) j++;
          copyHits++;
          console.log(`COPY  ${id}: ${j - i} identical chars: ${s.slice(i, j)}`);
          i = j;
        }
      }
    }
  }

  // 2. timestamp links
  for (const t of texts) {
    for (const m of t.matchAll(/https:\/\/www\.bilibili\.com\/video\/([^/]+)\/\?p=(\d+)(?:&t=(\d+))?/g)) {
      links++;
      const [, bvid, p, sec] = m;
      const problems = [];
      if (bvid !== C.bvid) problems.push(`bvid ${bvid}`);
      if (+p !== meta.page) problems.push(`p=${p} but this lesson is P${meta.page}`);
      if (sec !== undefined && +sec > meta.duration) problems.push(`t=${sec}s beyond the ${meta.duration}s episode`);
      if (problems.length) { linkErrors++; console.log(`LINK  ${id}: ${problems.join("; ")}`); }
    }
  }
}
console.log(`timestamp links: ${links}, link errors: ${linkErrors}, copy hits (>= ${MIN} identical chars): ${copyHits}`);
process.exit(linkErrors || copyHits ? 1 : 0);
