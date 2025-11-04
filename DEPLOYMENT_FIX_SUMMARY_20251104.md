# 前端部署问题修复总结

**问题发现时间：** 2025-11-04 12:48
**严重程度：** 🔴 高

---

## 📋 问题描述

用户反馈：每次修改前端代码后，网站界面都会回到老UI（纸飞机Logo版本），而非预期的新UI（机器人Banner版本）。

---

## 🔍 根本原因

项目中存在**两套完全独立的前端代码**，部署脚本指向了错误的目录：

### 目录结构

```
/root/zhitoujianli/
├── frontend/                          # ✅ 新UI（机器人界面）
│   ├── src/
│   └── build/                         # main.8076a17c.js (564KB)
│
└── website/zhitoujianli-website/      # ❌ 老UI（纸飞机界面）
    ├── src/
    └── build/                         # main.49b7b7ae.js (286KB)
```

### 错误配置

**原部署脚本：**

```bash
cd /root/zhitoujianli/website/zhitoujianli-website  # ❌ 错误
```

**修复后：**

```bash
cd /root/zhitoujianli/frontend  # ✅ 正确
```

---

## 🛠️ 修复措施

### 1. 修改部署脚本

**文件：** `/opt/zhitoujianli/scripts/build-and-deploy-frontend.sh`

- 修改第34行：`cd /root/zhitoujianli/frontend`

**文件：** `/opt/zhitoujianli/scripts/deploy-frontend.sh`

- 修改第70行：`BUILD_SOURCE="/root/zhitoujianli/frontend/build"`

### 2. 重新部署

执行部署脚本，成功部署新UI：

- 部署时间：2025-11-04 12:48:37
- 主文件：main.8076a17c.js (151.3 KB)
- 部署路径：/var/www/zhitoujianli/build

---

## ✅ 验证结果

### 生产环境验证

```bash
$ ls -lth /var/www/zhitoujianli/build/static/js/main.*.js
-rwxr-xr-x 1 www-data www-data 564K Nov  4 12:48 main.8076a17c.js
```

### 功能验证

- ✅ 新UI（机器人Banner）成功部署
- ✅ "为每一位求职者 配备专属AI投递机器人" 标题正确显示
- ✅ "机器人如何帮你投简历" 功能板块正确显示

---

## 📚 两套UI对比

### 老UI（website/zhitoujianli-website）

- Logo：纸飞机
- 标题："智投简历 - 智能投递·精准匹配"
- 副标题："用AI帮你更快拿到心仪Offer"
- Bundle大小：286KB

### 新UI（frontend）

- Banner：机器人插图
- 标题："为每一位求职者 配备专属AI投递机器人"
- 副标题："像真人一样投递·智能匹配·24小时不间断"
- Bundle大小：564KB

---

## 🔒 预防措施

### 1. 代码层面

- ✅ 修改部署脚本指向正确目录
- ✅ 更新脚本注释说明

### 2. 文档更新

- ✅ 创建此修复总结文档
- ✅ 记录部署路径变更

### 3. 标记废弃

- 建议在 `website/zhitoujianli-website/` 添加 `DEPRECATED.md` 标记为废弃
- 或删除整个 `website/` 目录以避免混淆

---

## 📝 部署规范

### ✅ 正确操作

```bash
# 使用自动化脚本
cd /root/zhitoujianli
./deploy-frontend.sh

# 或手动部署
cd /root/zhitoujianli/frontend
npm run build
/opt/zhitoujianli/scripts/deploy-frontend.sh
```

### ❌ 禁止操作

```bash
# 不要使用旧目录
cd /root/zhitoujianli/website/zhitoujianli-website
```

---

## 📊 影响范围

### 修复的问题

- ✅ 前端UI显示正确（机器人界面）
- ✅ 部署流程指向正确目录
- ✅ 消除老UI/新UI混淆

### 未受影响

- 后端服务正常运行
- 数据库未受影响
- WebSocket连接正常

---

## 🎯 经验教训

1. **多版本共存问题**
   - 同一项目中维护两套独立前端代码容易造成混淆
   - 应在项目早期确定唯一UI版本

2. **部署脚本管理**
   - 部署脚本必须明确指向正确目录
   - 定期审查部署配置

3. **版本标记**
   - 废弃的代码应立即标记或删除
   - 使用 DEPRECATED 文件说明

---

**修复人员：** AI Assistant
**修复时间：** 2025-11-04 12:48
**状态：** ✅ 已完成并验证

