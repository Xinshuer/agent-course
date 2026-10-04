// Tiny syntax highlighter for Python (plus plain-text fallback for shell/json/other).
(function () {
  const KW = new Set(("False None True and as assert async await break class continue def del elif else except " +
    "finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case").split(" "));
  const BI = new Set(("print len range dict list str int float bool type isinstance enumerate zip open input sorted " +
    "sum min max any all map filter super object set tuple repr hasattr getattr setattr Exception ValueError " +
    "KeyError TypeError RuntimeError NameError self cls").split(" "));
  const PY = /(#[^\n]*)|((?:[rRbBfFuU]{1,2})?(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'))|(@[A-Za-z_][\w.]*)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][\w]*)/g;
  const SH = /(#[^\n]*)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/g;

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function python(src) {
    let out = "", last = 0, prev = "";
    PY.lastIndex = 0;
    let m;
    while ((m = PY.exec(src))) {
      out += esc(src.slice(last, m.index));
      const [tok, com, str, dec, num, word] = m;
      if (com) out += `<span class="tok-com">${esc(tok)}</span>`;
      else if (str) out += `<span class="tok-str">${esc(tok)}</span>`;
      else if (dec) out += `<span class="tok-dec">${esc(tok)}</span>`;
      else if (num) out += `<span class="tok-num">${esc(tok)}</span>`;
      else if (word) {
        if (KW.has(word)) out += `<span class="tok-kw">${word}</span>`;
        else if (prev === "def" || prev === "class") out += `<span class="tok-fn">${word}</span>`;
        else if (BI.has(word)) out += `<span class="tok-bi">${word}</span>`;
        else out += word;
        prev = word;
      }
      if (!word) prev = "";
      last = m.index + tok.length;
    }
    return out + esc(src.slice(last));
  }

  function shell(src) {
    let out = "", last = 0, m;
    SH.lastIndex = 0;
    while ((m = SH.exec(src))) {
      out += esc(src.slice(last, m.index));
      out += m[1] ? `<span class="tok-com">${esc(m[0])}</span>` : `<span class="tok-str">${esc(m[0])}</span>`;
      last = m.index + m[0].length;
    }
    return out + esc(src.slice(last));
  }

  window.Highlight = function (src, lang) {
    lang = (lang || "python").toLowerCase();
    if (lang === "python" || lang === "py") return python(src);
    if (["bash", "sh", "shell", "powershell", "ps", "cmd", "toml", "yaml", "env"].includes(lang)) return shell(src);
    return esc(src);
  };
  window.Highlight.esc = esc;
})();
