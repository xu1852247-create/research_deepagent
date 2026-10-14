"""physics_app_builder 的 LangChain 工具封装 + 物理开发子 Agent 的系统提示词加载。

接入方式（见 agent.py）：
- physics_app_builder_tool 注册为子 Agent physics-app-builder 的工具；
- PHYSICS_SYSTEM_PROMPT 作为该子 Agent 的 system_prompt。
"""

from __future__ import annotations

from pathlib import Path

from langchain_core.tools import tool

from research_deepagent.physics_app_builder import physics_app_builder as _run

PHYSICS_SYSTEM_PROMPT_PATH = Path(__file__).resolve().parent / "physics_dev_system_prompt.md"
PHYSICS_SYSTEM_PROMPT = PHYSICS_SYSTEM_PROMPT_PATH.read_text(encoding="utf-8")


@tool("physics_app_builder", parse_docstring=True)
def physics_app_builder_tool(
    requirements: str,
    project_dir: str,
    stage: str,
    feature: str,
    textbook_edition: str | None = None,
    files: list[dict] | None = None,
) -> dict:
    """初中物理交互式 Web APP 开发工具（执行层）：读写项目文件、安装依赖、构建与启动检查。

    何时调用：需要在本机项目目录里创建、修改、构建或验证物理学习 APP 的代码时。
    何时不要调用：纯物理知识问答、不需要落盘的代码讨论。

    调用约定：新项目按 setup → scaffold → implement → verify 顺序推进；
    修改已有项目通常只需 implement → verify；同一 stage 重复调用安全（幂等），
    但无新进展时不要重复调用。完整运行记录保存在返回的 log_file 路径，
    需要命令输出细节时用读文件工具查看，不要指望返回体里有全文。

    Args:
        requirements: 本次需求描述。
        project_dir: 项目目录，必须是 WSL2 原生路径（如 ~/projects/physics-app），拒绝 /mnt/c。
        stage: 执行阶段，取 setup / plan / scaffold / implement / verify。
        feature: 本次功能或知识点标识（如 ohm-law）。
        textbook_edition: 教材版次，可省略（将标注"版次待确认"）。
        files: implement 阶段要写入的文件，[{"path": 相对路径, "content": 内容}]，单次最多 60 个。

    Returns:
        dict: status / summary / files_changed / checks / evidence（截短）/ blockers / next_action / log_file。
    """
    return _run(
        requirements=requirements,
        project_dir=project_dir,
        stage=stage,
        feature=feature,
        textbook_edition=textbook_edition,
        files=files,
    )
