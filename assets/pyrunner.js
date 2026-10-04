// In-browser Python (Pyodide), loaded lazily from the jsDelivr CDN on first "Run".
// The helper modules in window.PYFILES (llm.py -> mock model, weather_tool.py, mock_openai.py)
// are written into the virtual filesystem so learner code can `from llm import client`.
(function () {
  const VERSION = "0.29.5";
  const BASE = `https://cdn.jsdelivr.net/pyodide/v${VERSION}/full/`;
  let pyodide = null;
  let loading = null;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error("script load failed: " + src));
      document.head.appendChild(s);
    });
  }

  async function load() {
    if (pyodide) return pyodide;
    if (!loading) {
      loading = (async () => {
        if (!window.loadPyodide) await loadScript(BASE + "pyodide.js");
        const py = await window.loadPyodide({ indexURL: BASE });
        py.FS.mkdirTree("/home/pyodide");
        for (const [name, src] of Object.entries(window.PYFILES || {})) {
          py.FS.writeFile("/home/pyodide/" + name, src);
        }
        py.runPython("import sys, os\nos.chdir('/home/pyodide')\nif '/home/pyodide' not in sys.path: sys.path.insert(0, '/home/pyodide')");
        pyodide = py;
        return py;
      })();
      loading.catch(() => { loading = null; });
    }
    return loading;
  }

  // asyncio.run() needs WebAssembly stack switching, which not every browser has. Pyodide supports
  // top-level await instead, so rewrite `asyncio.run(X)` to `await X` at module level and inside a
  // top-level `if __name__ == "__main__":` block (never inside a def, where await would be invalid).
  function prepare(code) {
    let inMain = false;
    return code.split("\n").map((line) => {
      if (/^\S/.test(line)) inMain = /^if\s+__name__\s*==\s*["']__main__["']\s*:/.test(line);
      const topLevel = /^\S/.test(line) || (inMain && /^\s/.test(line));
      if (!topLevel) return line;
      return line.replace(/asyncio\.run\((.*?)\)(\s*(#.*)?)$/, "await $1$2");
    }).join("\n");
  }

  // Run `code`, streaming text to write(text, kind) where kind is "out" | "err" | "sys".
  async function run(code, write) {
    code = prepare(code);
    const py = await load();
    const dec = new TextDecoder();
    const decErr = new TextDecoder();
    py.setStdout({ write: (buf) => { write(dec.decode(buf, { stream: true }), "out"); return buf.length; } });
    py.setStderr({ write: (buf) => { write(decErr.decode(buf, { stream: true }), "err"); return buf.length; } });
    // input() opens a prompt dialog; Cancel ends input (EOFError) so a chat loop cannot spin forever.
    py.setStdin({
      stdin: () => {
        const v = window.prompt("input()   (取消 / Cancel = EOF)");
        return v === null ? null : v + "\n";
      },
    });
    // Fresh namespace and fresh helper modules for every run.
    py.runPython(
      "import sys\nfor _m in ('llm', 'mock_openai', 'weather_tool'):\n    sys.modules.pop(_m, None)\ndel _m"
    );
    const globals = py.globals.get("dict")();
    globals.set("__name__", "__main__");
    try {
      // Packages that ship with Pyodide (e.g. pydantic) are not loaded until requested.
      await py.loadPackagesFromImports(code, { messageCallback: () => {}, errorCallback: () => {} });
      await py.runPythonAsync(code, { globals });
    } catch (e) {
      let msg = String((e && e.message) || e);
      if (/stack switching/i.test(msg)) {
        msg += "\n[提示] 这个浏览器不支持这段异步代码，请用最新版 Chrome / Edge，或在本地练习文件里运行。" +
          "\n[Hint] This browser cannot run this async code; use a recent Chrome/Edge or run the local practice file.";
      }
      // Hide Pyodide's internal frames, keep the learner-facing part of the traceback.
      const lines = msg.split("\n");
      const start = lines.findIndex((l) => l.includes('File "<exec>"'));
      const shown = start > 0 ? ["Traceback (most recent call last):", ...lines.slice(start)] : lines;
      write(shown.join("\n").trim() + "\n", "err");
    } finally {
      globals.destroy();
    }
  }

  window.PyRunner = { load, run, prepare, isLoaded: () => !!pyodide };
})();
