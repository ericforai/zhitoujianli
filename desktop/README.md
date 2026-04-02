# 智投简历 · 本地桌面端（Tauri）

与网站共用 **登录 / JWT / 权限**；本地负责拉起内置 `boss_local_agent.py`（**Token 模式**），避免在命令行里反复折腾 Python 证书链。

## 环境要求

- Node.js 18+
- Rust stable（[rustup](https://rustup.rs/)）
- 本机 **Python 3** + Agent 依赖（启动引擎前执行一次即可）：

```bash
pip install aiohttp playwright websockets certifi
playwright install chromium
```

## 配置 API 地址

复制 `.env.example` 为 `.env`，按需修改：

```bash
cp .env.example .env
```

默认：`VITE_API_BASE_URL=https://www.zhitoujianli.com/api`  
本地后端示例：`VITE_API_BASE_URL=http://localhost:8080/api`

## 开发调试

```bash
cd desktop
npm install
npm run tauri:dev
```

## 打包安装包

```bash
cd desktop
npm run tauri:build
```

若本机环境变量 `CI=1`，部分 `tauri-cli` 版本会报错，可改用：

```bash
env -u CI npm run tauri:build
```

产物在 `src-tauri/target/release/bundle/`（随平台为 `.dmg` / `.msi` / `.app` 等）。

## 一键验证（CI / 本地）

```bash
cd desktop
npm run verify
```

含：前端 `tsc` + `vite build`、`cargo test`、`cargo build --release`。

GitHub Actions：推送或 PR 修改 `desktop/**` 时触发 `.github/workflows/desktop-build.yml`（macOS + Windows 打包并上传 Artifact）。

## 使用说明

1. 在桌面端用**邮箱密码登录**（走网站同款 API，使用系统 WebView 证书，一般比裸 Python 更省心）。
2. 点击 **启动本地投递引擎**：会以 `python3 .../boss_local_agent.py --token <JWT> -a <站点根>` 启动子进程。
3. 网站上的 AI、套餐、权限逻辑仍在服务端；本地只执行 Boss 自动化。

## 同步内置 Agent 脚本

打包用的脚本来自仓库内 `local-agent.zip` 解压出的 `boss_local_agent.py`。更新网站下载包后，可重新解压覆盖：

`src-tauri/resources/agent/boss_local_agent.py`

## 图标

已用项目根目录 `logo1.png` 裁切为正方形生成 `src-tauri/icons/`。若需更换品牌图：

```bash
cd desktop
npx tauri icon your-square-1024.png
```
