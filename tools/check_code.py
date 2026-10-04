"""Syntax-check every Python snippet exported by validate.js, and execute the runnable ones.

Usage:
    node tools/validate.js [ids...] --export build/code.json
    python tools/check_code.py build/code.json

Snippets with run=True or run="mock" are executed with assets/py on sys.path, so
`from llm import client` talks to the offline mock model (same as the in-browser runner).
input() receives a short scripted conversation ending with /exit.
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MOCK_DIR = ROOT / "assets" / "py"
TMP_ROOT = ROOT / "build" / "snippet_runs"
TMP_ROOT.mkdir(parents=True, exist_ok=True)
FAKE_STDIN = "北京和上海天气怎么样？\n我叫小明\n我叫什么名字？\n/history\n/exit\n" + "/exit\n" * 20


def main():
    items = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    errors = 0
    ran = 0
    for it in items:
        if it["lang"] not in ("python", "py"):
            continue
        label = f"{it['where']} [{it['variant']}]"
        src = it["code"]
        if it.get("fragment") or it.get("starter"):
            # fill-in fragments and starters may be incomplete; only report hard syntax errors as warnings
            try:
                compile(src, label, "exec")
            except SyntaxError as e:
                if not it.get("starter"):
                    print(f"WARN  {label}: fragment does not parse ({e.msg}, line {e.lineno})")
            continue
        try:
            compile(src, label, "exec")
        except SyntaxError as e:
            errors += 1
            print(f"ERROR {label}: SyntaxError {e.msg} (line {e.lineno}): {e.text!r}")
            continue
        if it["run"] in (True, "mock"):
            ran += 1
            with tempfile.NamedTemporaryFile("w", suffix=".py", delete=False, encoding="utf-8") as f:
                f.write(src)
                tmp = f.name
            env = dict(os.environ, PYTHONPATH=str(MOCK_DIR), PYTHONIOENCODING="utf-8", PYTHONUTF8="1")
            env.pop("DEEPSEEK_API_KEY", None)
            # Fresh cwd per snippet, holding copies of the helper files like the browser's /home/pyodide,
            # so snippets that write files stay out of assets/.
            workdir = tempfile.mkdtemp(prefix="snippet_", dir=TMP_ROOT)
            for helper in MOCK_DIR.glob("*.py"):
                shutil.copy(helper, workdir)
            try:
                p = subprocess.run([sys.executable, tmp], input=FAKE_STDIN, capture_output=True, text=True,
                                   encoding="utf-8", timeout=30, cwd=workdir, env=env)
                if p.returncode != 0:
                    tail = (p.stderr or p.stdout).strip().splitlines()[-6:]
                    if tail and tail[-1].startswith("EOFError"):
                        continue
                    errors += 1
                    print(f"ERROR {label}: exit {p.returncode}\n      " + "\n      ".join(tail))
            except subprocess.TimeoutExpired:
                errors += 1
                print(f"ERROR {label}: timed out (endless loop?)")
            finally:
                os.unlink(tmp)
                shutil.rmtree(workdir, ignore_errors=True)
    print(f"checked {len(items)} snippets, executed {ran}, {errors} errors")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
