# physics_app_builder

专门用于开发初中物理交互式 Web APP 的 Deep Agent 工具（执行层）。

## 组成

| 文件 | 作用 |
| --- | --- |
| `physics_app_builder/tool.py` | 工具本体：setup / plan / scaffold / implement / verify 五个 stage |
| `physics_dev_system_prompt.md` | 主 Agent 每次会话加载的教学开发规范（红线、仿真规范、题库 schema） |
| `examples/register_example.py` | LangChain Deep Agents 注册示例与直接调用示例 |

## 分工

- 工具（本仓库代码）= 手：文件读写、npm 安装、构建、dev server 启动探测。
- 主 Agent（DeepSeek V4 Pro）= 脑：需求理解、任务规划、教学内容与代码生成，经 `implement` 阶段的 `files` 参数交给工具落盘。

## 安全边界（硬编码）

- 文件写入仅限 `project_dir` 内，越界拒绝。
- 命令白名单：`npm` `npx` `node` `git` `ls` `cat` `mkdir` `cp`。
- 密钥只走环境变量，工具不读取不打印。

## 运行环境假设

Windows 11 + WSL2（Ubuntu）、bash、Node.js ≥ 20。`project_dir` 必须是 WSL2 原生路径（`~/projects/...`），拒绝 `/mnt/c` 挂载目录。

## 返回结构

`status / summary / files_changed / checks / evidence / blockers / next_action`

`checks` 中每条 `pass` 必须能在 `evidence`（关键命令尾部 50 行真实输出）中找到依据；工具无法验证的交互项固定标记 `unverified`，不冒充已通过。

## 快速验证

```bash
cd physics-app-builder
python -m examples.register_example   # 直接调用 setup 示例（需 WSL2 环境）
```

## 待确认 / 假设

- DeepSeek V4 Pro 的实际 API 模型名（示例中默认 `deepseek-chat`，用 `DEEPSEEK_MODEL` 环境变量覆盖）。
- 教材版次未指定，生成内容将标注"版次待确认"。
- 框架假设为 LangChain Deep Agents；接入其他框架时只需注册 `physics_app_builder` 函数并加载系统提示词文件。
