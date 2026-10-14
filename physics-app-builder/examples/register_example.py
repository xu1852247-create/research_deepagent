"""physics_app_builder 注册示例（Python + LangChain Deep Agents 默认框架）。

假设（未提供现有 Agent 代码时的默认值，接入时按实际情况替换）：
- 假设 1：Deep Agent 框架为 LangChain Deep Agents（pip install deepagents）。
- 假设 2：DeepSeek 通过 OpenAI 兼容接口调用，base_url=https://api.deepseek.com，
  模型名从环境变量 DEEPSEEK_MODEL 读取（默认 deepseek-chat，请改为你的 V4 Pro 模型名），
  API 密钥从环境变量 DEEPSEEK_API_KEY 读取——密钥不进代码、不进日志。
- 假设 3：运行环境为 Windows 11 + WSL2（Ubuntu），Node.js >= 20。

接入位置说明：
- 若你的 Agent 已有工具注册表，只需把 physics_app_builder 函数加入工具列表，
  并把 physics_dev_system_prompt.md 的内容并入系统提示词。
"""

import os
from pathlib import Path

from physics_app_builder import physics_app_builder

BASE_DIR = Path(__file__).resolve().parent.parent
SYSTEM_PROMPT_PATH = BASE_DIR / "physics_dev_system_prompt.md"


def build_agent():
    """构建加载了 physics_app_builder 的 Deep Agent。"""
    # 延迟导入：未安装 deepagents 时本文件仍可被检查语法
    from deepagents import create_deep_agent
    from langchain_openai import ChatOpenAI

    model = ChatOpenAI(
        model=os.environ.get("DEEPSEEK_MODEL", "deepseek-chat"),  # 假设 2：改为 V4 Pro 模型名
        base_url="https://api.deepseek.com",
        api_key=os.environ["DEEPSEEK_API_KEY"],  # 只从环境变量读取
        temperature=0.2,
    )
    system_prompt = SYSTEM_PROMPT_PATH.read_text(encoding="utf-8")

    return create_deep_agent(
        model=model,
        tools=[physics_app_builder],
        system_prompt=system_prompt,
    )


def demo_direct_call():
    """不经过 Agent 的直接调用示例：初始化并安装依赖。"""
    result = physics_app_builder(
        requirements="初始化欧姆定律样例工程",
        project_dir="~/projects/physics-app",   # WSL2 原生路径
        stage="setup",
        feature="ohm-law",
        textbook_edition=None,                   # 将标注"版次待确认"
    )
    print("status:", result["status"])
    print("summary:", result["summary"])
    print("blockers:", result["blockers"])
    return result


if __name__ == "__main__":
    demo_direct_call()
