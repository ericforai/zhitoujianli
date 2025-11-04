# 🛡️ UI版本保护指南

## ⚠️ 重要警告

**当前状况：**
- ✅ **线上版本**：新UI（纸飞机Logo + 机器人Banner）- 10月31日备份
- ❌ **源代码版本**：老UI（SVG图标 + 纯文字Banner）- Git仓库

**问题：**
每次执行 `./deploy-frontend.sh` 或 `npm run build` 都会用**老UI覆盖新UI**！

---

## 📋 解决方案

### 1. UI保护脚本

**自动检查并恢复新UI：**
```bash
/opt/zhitoujianli/scripts/protect-ui.sh
```

功能：
- 检测是否被覆盖为老UI
- 自动从备份恢复新UI
- 修复文件名问题（robot-icon.svg → chat-bot.svg）

### 2. 安全部署脚本

**需要确认才能部署：**
```bash
/opt/zhitoujianli/scripts/deploy-frontend-safe.sh
```

功能：
- 显示警告信息
- 要求输入YES确认
- 防止误操作覆盖新UI

### 3. 原有脚本已添加警告

以下脚本已添加5秒警告：
- `/opt/zhitoujianli/scripts/build-and-deploy-frontend.sh`
- `/root/zhitoujianli/deploy-frontend.sh`

---

## 🔍 问题根源

### 文件位置差异

**新UI备份：** `/var/www/zhitoujianli.backup.20251031_210406/`
```
images/
├── logo.png        # 纸飞机Logo (345KB)
├── chat-bot.svg    # 机器人图标 (36KB)
└── wechat-qrcode.png
```

**源代码：** `/root/zhitoujianli/website/zhitoujianli-website/`
```
public/images/
├── logo.png        # 存在但未被引用
└── robot-icon.svg  # 存在但文件名不匹配（应为chat-bot.svg）
```

### 代码引用问题

**新UI代码引用：**
```javascript
<img src="/images/logo.png" />       // ✅ 引用logo.png
<img src="/images/chat-bot.svg" />  // ✅ 引用chat-bot.svg
```

**当前源代码：**
```javascript
<svg>...</svg>  // ❌ 使用内嵌SVG，不引用logo.png
// ❌ 没有引用机器人图标
```

---

## ✅ 当前修复状态

### 已完成
1. ✅ 从10月31日备份恢复新UI
2. ✅ 修复文件名（robot-icon.svg → chat-bot.svg）
3. ✅ 文件权限设置正确
4. ✅ Nginx配置正确
5. ✅ 创建保护脚本
6. ✅ 添加部署警告

### 验证清单
- ✅ https://zhitoujianli.com/images/logo.png - 200 OK
- ✅ https://zhitoujianli.com/images/chat-bot.svg - 200 OK  
- ✅ 线上版本：main.93852b0f.js（包含新UI代码）

---

## 🚀 使用建议

### 日常维护

**检查UI版本：**
```bash
/opt/zhitoujianli/scripts/protect-ui.sh
```

**如果UI被覆盖：**
脚本会自动恢复，无需手动操作

**如果确实需要部署老UI：**
```bash
/opt/zhitoujianli/scripts/deploy-frontend-safe.sh
# 输入 YES 确认
```

### 长期解决方案

1. **方案A（推荐）：** 恢复新UI到Git仓库
   - 从备份中提取新UI的源代码
   - 提交到Git
   - 正常使用部署脚本

2. **方案B：** 保持当前状态
   - 使用保护脚本维护
   - 禁止执行部署脚本
   - 手动管理UI版本

---

## 📝 备份信息

**新UI完整备份：**
- 主备份：`/var/www/zhitoujianli.backup.20251031_210406/`
- 部署日期：2025年10月31日 21:04
- JS版本：main.b74194c6.js等9个版本
- 包含完整资源：HTML、CSS、JS、图片

**保护性备份：**
- 位置：`/opt/zhitoujianli/backups/frontend/`
- 自动备份：每次部署前自动创建
- 保留数量：最近5个版本

---

## ⚠️ 注意事项

1. **不要删除** `/var/www/zhitoujianli.backup.20251031_210406/`
2. **不要执行** `./deploy-frontend.sh`（除非想部署老UI）
3. **定期运行** `/opt/zhitoujianli/scripts/protect-ui.sh` 检查
4. **浏览器缓存** 每次恢复后清除（Ctrl + Shift + R）

---

**最后更新：** 2025年11月4日  
**维护者：** 智投简历技术团队

