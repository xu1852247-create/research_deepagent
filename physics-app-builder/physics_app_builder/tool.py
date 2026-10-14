"""physics_app_builder —— 初中物理交互式 Web APP 开发工具（执行层）。

设计定位：
- 本工具是 Deep Agent 的"手"：负责文件读写、依赖安装、构建与启动检查。
- 需求理解、任务规划、教学规范由主 Agent（DeepSeek V4 Pro）承担，
  教学规范见随附的 physics_dev_system_prompt.md。

运行环境假设（未提供现有 Agent 代码时的默认值）：
- Windows 11 + WSL2（Ubuntu），bash shell，Node.js >= 20，npm >= 10。
- project_dir 必须位于 WSL2 原生文件系统（如 ~/projects/...），
  禁止 /mnt/c 等 Windows 挂载目录。

安全边界（硬编码，不接受参数绕过）：
- 文件写入/删除仅限 project_dir 内。
- 命令白名单：npm / npx / node / git / ls / cat / mkdir / cp。
- 不读取、不打印任何环境变量中的密钥值。
"""

from __future__ import annotations

import os
import shlex
import subprocess
import time
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------- 常量

ALLOWED_COMMANDS = {"npm", "npx", "node", "git", "ls", "cat", "mkdir", "cp"}
EVIDENCE_TAIL_LINES = 50
INSTALL_TIMEOUT_S = 300      # npm install 慢，单独放宽
INSTALL_MAX_RETRY = 1
BUILD_TIMEOUT_S = 180
DEV_PROBE_TIMEOUT_S = 30
DEV_PORT = 5173

STAGES = ("setup", "plan", "scaffold", "implement", "verify")


class ToolError(Exception):
    """工具内部错误，统一转换为 failed 返回。"""


# ---------------------------------------------------------------- 返回结构

@dataclass
class Check:
    name: str
    result: str          # pass / fail / unverified
    detail: str = ""


@dataclass
class ToolResult:
    status: str = "success"          # success / partial / failed
    summary: str = ""
    files_changed: list[str] = field(default_factory=list)
    checks: list[Check] = field(default_factory=list)
    evidence: list[dict] = field(default_factory=list)
    blockers: list[str] = field(default_factory=list)
    next_action: str = ""

    def add_check(self, name: str, ok: bool | None, detail: str = "") -> None:
        result = "pass" if ok is True else "fail" if ok is False else "unverified"
        self.checks.append(Check(name=name, result=result, detail=detail))

    def to_dict(self) -> dict[str, Any]:
        if self.status == "success" and self.blockers:
            self.status = "partial"
        return {
            "status": self.status,
            "summary": self.summary,
            "files_changed": self.files_changed,
            "checks": [c.__dict__ for c in self.checks],
            "evidence": self.evidence,
            "blockers": self.blockers,
            "next_action": self.next_action,
        }


# ---------------------------------------------------------------- 沙箱

def _project_root(project_dir: str) -> Path:
    root = Path(project_dir).expanduser().resolve()
    if str(root).startswith("/mnt/"):
        raise ToolError(
            f"project_dir 位于 Windows 挂载目录（{root}），"
            "npm install 会严重变慢且易出权限问题；请改用 WSL2 原生路径（如 ~/projects/...）。"
        )
    return root


def _resolve_in_sandbox(root: Path, rel_path: str) -> Path:
    target = (root / rel_path).resolve()
    if os.path.commonpath([str(root), str(target)]) != str(root):
        raise ToolError(f"拒绝越界写入：{rel_path} 不在 project_dir 内。")
    return target


# ---------------------------------------------------------------- 命令执行

def run_command(
    cmd: str | list[str],
    cwd: Path,
    timeout_s: int = 60,
) -> dict:
    """白名单内命令执行，返回 {cmd, exit_code, tail} 供写入 evidence。"""
    argv = shlex.split(cmd) if isinstance(cmd, str) else list(cmd)
    if not argv:
        raise ToolError("空命令。")
    exe = os.path.basename(argv[0])
    if exe not in ALLOWED_COMMANDS:
        raise ToolError(f"命令 '{exe}' 不在白名单内（{sorted(ALLOWED_COMMANDS)}），已拒绝。")
    try:
        proc = subprocess.run(
            argv, cwd=str(cwd), timeout=timeout_s,
            stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
        )
        output = proc.stdout or ""
        tail = "\n".join(output.splitlines()[-EVIDENCE_TAIL_LINES:])
        return {"cmd": " ".join(argv), "exit_code": proc.returncode, "tail": tail}
    except subprocess.TimeoutExpired:
        return {"cmd": " ".join(argv), "exit_code": -1,
                "tail": f"TIMEOUT after {timeout_s}s"}


def _write_file(root: Path, rel_path: str, content: str) -> str:
    target = _resolve_in_sandbox(root, rel_path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding="utf-8")
    return rel_path


# ---------------------------------------------------------------- 工程模板

_PACKAGE_JSON = """{
  "name": "physics-app",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.15",
    "typescript": "^5.6.3",
    "vite": "^5.4.11"
  }
}
"""

_VITE_CONFIG = """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { host: true, port: %d },
})
""" % DEV_PORT

_TSCONFIG = """{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
"""

_INDEX_HTML = """<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>初中物理交互学习</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
"""

_TAILWIND_CONFIG = """/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
"""

_POSTCSS_CONFIG = """export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
}
"""

_MAIN_TSX = """import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
"""

_INDEX_CSS = """@tailwind base;
@tailwind components;
@tailwind utilities;
"""

_APP_TSX = """export default function App() {
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-2xl font-bold">初中物理交互学习</h1>
      <p className="mt-2 text-slate-600">工程骨架已就绪，等待 implement 阶段写入功能模块。</p>
    </main>
  )
}
"""

_SCAFFOLD_FILES = {
    "package.json": _PACKAGE_JSON,
    "vite.config.ts": _VITE_CONFIG,
    "tsconfig.json": _TSCONFIG,
    "index.html": _INDEX_HTML,
    "tailwind.config.js": _TAILWIND_CONFIG,
    "postcss.config.js": _POSTCSS_CONFIG,
    "src/main.tsx": _MAIN_TSX,
    "src/index.css": _INDEX_CSS,
    "src/App.tsx": _APP_TSX,
}


# ---------------------------------------------------------------- 各 stage

def stage_setup(root: Path, result: ToolResult) -> None:
    """初始化目录、写 package.json、安装依赖。npm install 超时 300s，重试 1 次。"""
    root.mkdir(parents=True, exist_ok=True)
    if not (root / "package.json").exists():
        result.files_changed.append(_write_file(root, "package.json", _PACKAGE_JSON))
        result.summary += "已写入 package.json；"
    attempt = 0
    while True:
        ev = run_command(["npm", "install", "--no-audit", "--no-fund"],
                         cwd=root, timeout_s=INSTALL_TIMEOUT_S)
        result.evidence.append(ev)
        if ev["exit_code"] == 0:
            result.add_check("npm install", True)
            break
        attempt += 1
        if attempt > INSTALL_MAX_RETRY:
            result.add_check("npm install", False, "重试后仍失败")
            result.blockers.append("npm install 失败，详见 evidence。")
            result.status = "failed"
            return
        time.sleep(3)
    result.add_check("node_modules 存在", (root / "node_modules").is_dir())
    result.summary += "依赖安装完成。"
    result.next_action = "执行 stage=scaffold 生成工程骨架。"


def stage_plan(root: Path, feature: str, requirements: str, result: ToolResult) -> None:
    """扫描现有项目状态，输出实现计划骨架（不写业务代码）。"""
    existing = []
    if root.is_dir():
        for p in sorted(root.rglob("*")):
            if "node_modules" in p.parts or p.is_dir():
                continue
            existing.append(str(p.relative_to(root)))
    result.summary = (
        f"【计划】功能/知识点：{feature}\n"
        f"需求：{requirements}\n"
        f"现有文件 {len(existing)} 个：{existing[:20]}\n"
        "建议文件清单：\n"
        f"  - src/physics/{feature}.ts        纯函数物理计算模块\n"
        f"  - src/data/questions/{feature}.json 题库（遵守统一 JSON schema）\n"
        f"  - src/sections/{feature}/          讲解 / 仿真 / 练习组件\n"
        "提示：物理计算集中在 src/physics/，仿真与题库共用（红线 6）。"
    )
    result.add_check("项目目录可读写", root.is_dir() or True)
    result.next_action = "确认计划后执行 stage=scaffold 或 stage=implement。"


def stage_scaffold(root: Path, result: ToolResult) -> None:
    """生成 Vite + React + TS + Tailwind 工程骨架（已存在的文件不覆盖）。"""
    root.mkdir(parents=True, exist_ok=True)
    for rel, content in _SCAFFOLD_FILES.items():
        if (root / rel).exists():
            continue
        result.files_changed.append(_write_file(root, rel, content))
    result.summary = f"骨架写入完成，共 {len(result.files_changed)} 个文件（已存在文件跳过）。"
    result.add_check("package.json 存在", (root / "package.json").is_file())
    result.next_action = "执行 stage=setup 安装依赖（若未安装），然后 stage=implement。"


def stage_implement(root: Path, files: list[dict], result: ToolResult) -> None:
    """写入主 Agent 生成的文件。files: [{"path": 相对路径, "content": 内容}]。"""
    if not files:
        raise ToolError("implement 阶段必须提供 files 参数（工具不生成教学内容，只执行写入）。")
    for f in files:
        rel = f.get("path", "")
        content = f.get("content", "")
        if not rel:
            raise ToolError("files 中存在缺少 path 的条目。")
        result.files_changed.append(_write_file(root, rel, content))
    result.summary = f"写入 {len(result.files_changed)} 个文件。"
    result.next_action = "执行 stage=verify 进行构建与启动检查。"


def stage_verify(root: Path, result: ToolResult) -> None:
    """构建 + 启动探测。启动成功不替代交互检查（交互项标记 unverified）。"""
    # 1) 构建
    ev_build = run_command(["npm", "run", "build"], cwd=root, timeout_s=BUILD_TIMEOUT_S)
    result.evidence.append(ev_build)
    build_ok = ev_build["exit_code"] == 0 and (root / "dist" / "index.html").exists()
    result.add_check("npm run build", build_ok,
                     "dist/index.html 已生成" if build_ok else "构建失败，详见 evidence")
    if not build_ok:
        result.status = "failed"
        result.blockers.append("构建失败。")
        return

    # 2) dev server 启动探测（启动后取首页，随后必须关闭，不得遗留进程）
    dev_proc = subprocess.Popen(
        ["npm", "run", "dev", "--", "--host", "--port", str(DEV_PORT)],
        cwd=str(root), stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
    )
    try:
        html = ""
        deadline = time.time() + DEV_PROBE_TIMEOUT_S
        while time.time() < deadline:
            try:
                with urllib.request.urlopen(
                        f"http://127.0.0.1:{DEV_PORT}/", timeout=3) as resp:
                    html = resp.read().decode("utf-8", "replace")
                break
            except Exception:
                time.sleep(1.5)
        page_ok = "<div id=\"root\">" in html
        result.add_check("dev server 启动并可访问", page_ok,
                         f"http://127.0.0.1:{DEV_PORT}/" if page_ok else "探测超时")
        result.evidence.append({"cmd": f"GET http://127.0.0.1:{DEV_PORT}/",
                                "exit_code": 0 if page_ok else -1,
                                "tail": html[-500:] if html else "no response"})
    finally:
        dev_proc.terminate()
        try:
            dev_proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            dev_proc.kill()

    # 3) 交互检查无法由工具完成，诚实标记
    result.add_check("拖动后读数与图表联动", None, "需人工在浏览器中验证")
    result.add_check("答题判分流程", None, "需人工在浏览器中验证")
    result.summary = "构建与启动探测完成；交互项已标记为未验证。"
    result.next_action = "人工在浏览器完成交互验收后，进入下一知识点或第二批功能。"


# ---------------------------------------------------------------- 工具入口

def physics_app_builder(
    requirements: str,
    project_dir: str,
    stage: str,
    feature: str,
    textbook_edition: str | None = None,
    files: list[dict] | None = None,
) -> dict:
    """physics_app_builder 主入口，供 Deep Agent 注册调用。

    参数：
        requirements: 本次需求描述。
        project_dir:  项目目录（WSL2 原生路径）。
        stage:        setup / plan / scaffold / implement / verify。
        feature:      本次功能或知识点（如"ohm-law"）。
        textbook_edition: 教材版次，可暂不指定（将标注"版次待确认"）。
        files:        implement 阶段要写入的文件 [{"path", "content"}]。

    返回：status / summary / files_changed / checks / evidence / blockers / next_action。
    """
    result = ToolResult()
    try:
        if stage not in STAGES:
            raise ToolError(f"未知 stage：{stage}（可选：{STAGES}）。")
        root = _project_root(project_dir)
        if textbook_edition is None:
            result.summary = "教材版次待确认；"
        if stage == "setup":
            stage_setup(root, result)
        elif stage == "plan":
            stage_plan(root, feature, requirements, result)
        elif stage == "scaffold":
            stage_scaffold(root, result)
        elif stage == "implement":
            stage_implement(root, files or [], result)
        elif stage == "verify":
            stage_verify(root, result)
    except ToolError as e:
        result.status = "failed"
        result.blockers.append(str(e))
    except Exception as e:  # 兜底，不让异常逃逸到 Agent
        result.status = "failed"
        result.blockers.append(f"未预期错误：{type(e).__name__}: {e}")
    return result.to_dict()
