# 智投简历 - 前端源代码

## ⚠️ 重要说明

**此目录是智投简历项目的唯一官方前端源代码目录。**

- ✅ 所有前端开发都应在此目录进行
- ✅ 此目录构建的版本是当前生产环境运行版本
- ❌ 不要在其他目录创建前端代码

---

## 快速开始

### 开发环境

```bash
# 进入目录
cd /root/zhitoujianli/frontend

# 安装依赖
npm install

# 启动开发服务器
npm start
```

### 构建生产版本

```bash
# 构建
cd /root/zhitoujianli/frontend
npm run build

# 构建产物位置
ls -lh build/
```

### 部署到生产环境

```bash
# 方式1：使用一键部署脚本（推荐）
cd /root/zhitoujianli
./deploy-frontend.sh

# 方式2：手动构建+部署
cd /root/zhitoujianli/frontend
npm run build
/opt/zhitoujianli/scripts/deploy-frontend.sh

# 方式3：完整的构建+部署
/opt/zhitoujianli/scripts/build-and-deploy-frontend.sh
```

---

## 项目结构

```
frontend/
├── public/              # 静态资源
│   ├── favicon.ico
│   ├── logo192.png
│   └── manifest.json
├── src/
│   ├── components/      # React组件
│   │   ├── SmartGreeting.tsx    # ✨ 智能打招呼语组件（已修改）
│   │   ├── HeroSection.tsx      # 首页Hero区域
│   │   ├── Demo.tsx             # 功能演示
│   │   ├── RobotWorkflow.tsx    # 机器人工作流程
│   │   └── ...
│   ├── pages/           # 页面组件
│   │   ├── Dashboard.tsx        # 工作台
│   │   ├── BossDelivery.tsx     # Boss投递
│   │   └── ...
│   ├── services/        # API服务
│   │   ├── httpClient.ts        # HTTP客户端（带JWT认证）
│   │   ├── aiService.ts         # AI服务
│   │   ├── bossService.ts       # Boss服务
│   │   └── ...
│   └── App.tsx          # 主应用入口
├── package.json
└── README.md            # 本文件
```

---

## 核心功能

### 1. SmartGreeting组件（最新修改）

**位置**: `src/components/SmartGreeting.tsx`

**功能**:
- ✅ 核心优势三大卡片展示
  - 个性化定制（AI智能分析）
  - 提升回复率（68%）
  - 秒级生成（2.8秒）
- ✅ 对比数据展示（传统 vs AI）
- ✅ 功能演示区域（简历上传、JD输入）

**最后修改**: 2025-11-04 17:07

### 2. 用户认证系统

**实现方式**:
- JWT Token认证
- httpClient自动添加Authorization header
- 支持用户数据隔离

**相关文件**:
- `src/services/httpClient.ts`
- `src/services/authService.ts`

### 3. Boss投递功能

**功能**:
- 二维码登录
- 投递配置管理
- 实时投递日志
- WebSocket状态推送

**相关文件**:
- `src/pages/BossDelivery.tsx`
- `src/services/bossService.ts`

---

## 部署路径

### 源代码
- 开发目录：`/root/zhitoujianli/frontend/`
- 构建产物：`/root/zhitoujianli/frontend/build/`

### 生产环境
- 部署路径：`/var/www/zhitoujianli/build/`
- Nginx配置：`/etc/nginx/sites-available/zhitoujianli`
- 访问地址：https://zhitoujianli.com

### 备份
- 自动备份：`/opt/zhitoujianli/backups/frontend/backup_TIMESTAMP/`
- 手动备份：`/var/www/zhitoujianli/build.backup.TIMESTAMP/`

---

## 开发规范

### 代码风格
- TypeScript严格模式
- 使用函数式组件 + Hooks
- Tailwind CSS样式
- ESLint + Prettier

### 提交规范
```bash
feat(component): 添加新功能
fix(component): 修复bug
style(component): 样式调整
refactor(component): 代码重构
```

### 测试
```bash
# 运行测试
npm test

# 代码检查
npm run lint

# 类型检查
npm run type-check
```

---

## 常见问题

### Q: 修改代码后如何更新生产环境？

```bash
# 1. 修改代码
vi src/components/SmartGreeting.tsx

# 2. 构建+部署（自动备份）
cd /root/zhitoujianli
./deploy-frontend.sh

# 3. 清除浏览器缓存验证
# Ctrl + Shift + R
```

### Q: 部署后网站显示旧版本？

**原因**: 浏览器缓存

**解决**:
1. 强制刷新：`Ctrl + Shift + R` (Windows) 或 `Cmd + Shift + R` (Mac)
2. 或使用隐身模式访问
3. 或清除浏览器所有缓存

### Q: 如何回滚到之前版本？

```bash
# 方式1：从备份恢复
rm -rf /var/www/zhitoujianli/build/*
cp -r /opt/zhitoujianli/backups/frontend/backup_TIMESTAMP/* /var/www/zhitoujianli/build/
systemctl reload nginx

# 方式2：从Git历史恢复
cd /root/zhitoujianli/frontend
git checkout COMMIT_SHA -- .
npm run build
./deploy-frontend.sh
```

### Q: 其他前端目录（website/、frontend_FINAL/）去哪了？

已于2025-11-04彻底删除，以消除版本混乱。

- 备份位置：`/root/zhitoujianli/.cleanup_backup_20251104/`
- 原因：消除多版本混乱，建立单一源代码
- 如需查看：可以从备份目录恢复

---

## 技术栈

- **React**: 19.1.1
- **TypeScript**: 4.9.5
- **Tailwind CSS**: 3.4.17
- **React Router**: 7.9.3
- **Axios**: 1.12.2
- **WebSocket**: 原生实现

---

## 联系方式

- 项目文档：`/opt/zhitoujianli/docs/`
- 部署指南：`/opt/zhitoujianli/docs/DEPLOYMENT_GUIDE.md`
- 规则文档：`/root/zhitoujianli/.cursorrules`

---

**最后更新**: 2025-11-04 17:20
**状态**: ✅ 生产环境运行中
**版本**: main.66e9065f.js (573KB / 152.71KB gzip)

