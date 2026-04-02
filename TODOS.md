# TODOS

## Local Agent Packaging

- [ ] 固化本地 Agent 下载包构建脚本（`scripts/build-local-agent-zip.sh`）
  - **Priority:** P1
  - **Why:** 避免手工打包导致下载包内容漂移（文案已更新但 zip 仍旧）
  - **Context:** 统一生成 `local-agent.zip` 与 manifest，发布前可重复校验

- [ ] 增加发布后下载链路烟雾验证脚本
  - **Priority:** P1
  - **Why:** 提前发现 `/api/local-agent/download` 返回正常但包内容异常的静默故障
  - **Context:** 自动检查 HTTP 状态、响应头、zip 关键文件（`start.command` / `start.bat` / `start_one_click.py`）

## Completed

