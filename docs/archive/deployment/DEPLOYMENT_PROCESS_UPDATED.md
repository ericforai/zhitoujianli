# 🚀 智投简历部署流程 - 2025年11月更新

## ✅ 问题已解决

### 问题回顾
- **原问题**：源代码中包含老UI，每次部署都会覆盖线上的新UI
- **根本原因**：10月31日的新UI只部署到了生产环境，但源代码没有更新
- **表现**：执行 `./deploy-frontend.sh` 会用老UI覆盖新UI

### 彻底修复方案（已完成）

#### 1. 源代码更新 ✅
- **Navigation.tsx**: 用 `<img src="/images/logo.png" />` 替换SVG图标
- **HeroSection.tsx**: 添加机器人图标和响应式布局
- **tailwind.config.js**: 添加 `animate-float` 动画
- **图片文件**: `robot-icon.svg` → `chat-bot.svg`

#### 2. 构建验证 ✅
```bash
cd /root/zhitoujianli/website/zhitoujianli-website
npm run build

# 验证输出：
# ✅ main.7ad47ef2.js (79.71 kB) - 包含新UI代码
# ✅ build/images/ 包含: logo.png, chat-bot.svg, wechat-qrcode.png
```

#### 3. Git提交 ✅
```bash
git add -A
git commit -m "feat(ui): 彻底替换老UI为新UI"
# Commit: ec03208
```

---

## 📖 标准部署流程

### 前端部署

#### 方式1：自动化脚本（推荐）
```bash
# 在项目根目录执行
cd /root/zhitoujianli
./deploy-frontend.sh
```

**脚本功能：**
1. 构建React应用 (`npm run build`)
2. 自动备份现有版本
3. 部署到 `/var/www/zhitoujianli/build/`
4. 设置正确的文件权限
5. 重载Nginx
6. 记录部署日志

**部署路径：**
- **Nginx root**: `/var/www/zhitoujianli/build/`
- **源代码build**: `/root/zhitoujianli/website/zhitoujianli-website/build/`
- **备份位置**: `/opt/zhitoujianli/backups/frontend/`

#### 方式2：手动部署
```bash
# 1. 构建
cd /root/zhitoujianli/website/zhitoujianli-website
npm run build

# 2. 备份
BACKUP_TIME=$(date +%Y%m%d_%H%M%S)
cp -r /var/www/zhitoujianli/build /opt/zhitoujianli/backups/frontend/backup_$BACKUP_TIME

# 3. 部署
rm -rf /var/www/zhitoujianli/build/*
cp -r build/* /var/www/zhitoujianli/build/

# 4. 设置权限
chown -R www-data:www-data /var/www/zhitoujianli/build
chmod -R 755 /var/www/zhitoujianli/build

# 5. 重载Nginx
systemctl reload nginx
```

### 后端部署

```bash
# 1. 构建JAR包
cd /root/zhitoujianli/backend/get_jobs
mvn clean package -DskipTests

# 2. 复制到部署目录
VERSION=$(grep '<version>' pom.xml | head -1 | sed 's/.*<version>\(.*\)<\/version>.*/\1/')
cp target/get_jobs-${VERSION}.jar /opt/zhitoujianli/backend/get_jobs-${VERSION}.jar

# 3. 更新符号链接
ln -sf /opt/zhitoujianli/backend/get_jobs-${VERSION}.jar /opt/zhitoujianli/backend/get_jobs-latest.jar

# 4. 重启服务
systemctl restart zhitoujianli-backend.service

# 5. 验证
systemctl status zhitoujianli-backend.service
curl -I http://localhost:8080/
```

---

## 🔧 关键路径

### 前端
```
源代码: /root/zhitoujianli/website/zhitoujianli-website/
├── public/images/
│   ├── logo.png                 # 纸飞机Logo
│   ├── chat-bot.svg             # 机器人图标
│   └── wechat-qrcode.png        # 微信二维码
├── src/components/
│   ├── Navigation.tsx           # 导航栏（使用logo.png）
│   └── HeroSection.tsx          # 首页Banner（使用chat-bot.svg）
└── build/                       # npm run build 输出

部署目录: /var/www/zhitoujianli/build/
├── index.html
├── static/
│   ├── js/main.*.js
│   └── css/main.*.css
└── images/
    ├── logo.png
    ├── chat-bot.svg
    └── wechat-qrcode.png

Nginx配置: /etc/nginx/sites-enabled/zhitoujianli
└── root /var/www/zhitoujianli/build;  # 指向部署目录
```

### 后端
```
源代码: /root/zhitoujianli/backend/get_jobs/
JAR包: /opt/zhitoujianli/backend/get_jobs-latest.jar
环境变量: /etc/zhitoujianli/backend.env
服务: /etc/systemd/system/zhitoujianli-backend.service
日志: journalctl -u zhitoujianli-backend.service -f
```

---

## 🛡️ 安全注意事项

### 1. 环境变量
- **禁止**在systemd配置中硬编码敏感信息
- **使用** `/etc/zhitoujianli/backend.env` 存储环境变量

### 2. 文件权限
```bash
# 前端文件
chown -R www-data:www-data /var/www/zhitoujianli/build
chmod -R 755 /var/www/zhitoujianli/build

# 后端JAR
chown root:root /opt/zhitoujianli/backend/get_jobs-latest.jar
chmod 755 /opt/zhitoujianli/backend/get_jobs-latest.jar

# 环境变量文件
chown root:root /etc/zhitoujianli/backend.env
chmod 600 /etc/zhitoujianli/backend.env
```

### 3. 部署前检查
```bash
# 前端检查
- [ ] ESLint无错误
- [ ] TypeScript编译通过
- [ ] 本地测试无异常

# 后端检查
- [ ] Maven构建成功
- [ ] 单元测试通过
- [ ] 环境变量已配置
```

---

## 🐛 常见问题排查

### 问题1：UI显示为老版本
**原因**：浏览器缓存
**解决**：
```bash
# 用户端
Ctrl + Shift + R (强制刷新)

# 服务端
systemctl reload nginx
```

### 问题2：部署后502错误
**原因**：后端服务未启动或端口冲突
**排查**：
```bash
systemctl status zhitoujianli-backend.service
lsof -i:8080
journalctl -u zhitoujianli-backend.service -n 50
```

### 问题3：文件权限问题
**原因**：www-data无读取权限
**解决**：
```bash
chown -R www-data:www-data /var/www/zhitoujianli/build
chmod -R 755 /var/www/zhitoujianli/build
```

---

## 📊 部署验证清单

### 前端验证
```bash
# 1. 检查文件是否存在
ls -lh /var/www/zhitoujianli/build/images/

# 2. 验证Nginx配置
nginx -t

# 3. 检查网站响应
curl -I https://zhitoujianli.com/

# 4. 验证静态资源
curl -I https://zhitoujianli.com/images/logo.png
curl -I https://zhitoujianli.com/images/chat-bot.svg

# 5. 浏览器测试
# ✅ 左上角显示纸飞机Logo
# ✅ Banner右侧显示机器人图标
# ✅ 机器人图标有浮动动画
```

### 后端验证
```bash
# 1. 服务状态
systemctl status zhitoujianli-backend.service

# 2. 端口监听
lsof -i:8080

# 3. API测试
curl http://localhost:8080/api/version

# 4. 健康检查
curl http://localhost:8080/actuator/health

# 5. 日志检查
journalctl -u zhitoujianli-backend.service -n 20
```

---

## 🎯 版本管理

### 前端版本标识
- **构建时间戳**: `build/asset-manifest.json`
- **JS文件哈希**: `main.{hash}.js`
- **部署日志**: `/opt/zhitoujianli/logs/deploy-frontend.log`

### 后端版本标识
- **版本号**: `pom.xml` → `<version>`
- **JAR文件名**: `get_jobs-{version}.jar`
- **API版本**: `GET /api/version`

---

## 📝 部署日志

所有部署操作都会自动记录到日志文件：

```bash
# 前端部署日志
tail -f /opt/zhitoujianli/logs/deploy-frontend.log

# 后端服务日志
journalctl -u zhitoujianli-backend.service -f

# Nginx日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🔄 回滚流程

### 前端回滚
```bash
# 1. 查看可用备份
ls -lh /opt/zhitoujianli/backups/frontend/

# 2. 回滚到指定版本
BACKUP_VERSION="backup_20251103_220457"
rm -rf /var/www/zhitoujianli/build/*
cp -r /opt/zhitoujianli/backups/frontend/$BACKUP_VERSION/* /var/www/zhitoujianli/build/

# 3. 修复文件名问题（如果需要）
cd /var/www/zhitoujianli/build/images
if [ -f "robot-icon.svg" ] && [ ! -f "chat-bot.svg" ]; then
    mv robot-icon.svg chat-bot.svg
fi

# 4. 重载Nginx
systemctl reload nginx
```

### 后端回滚
```bash
# 1. 停止服务
systemctl stop zhitoujianli-backend.service

# 2. 切换JAR版本
ln -sf /opt/zhitoujianli/backend/get_jobs-2.1.1.jar /opt/zhitoujianli/backend/get_jobs-latest.jar

# 3. 启动服务
systemctl start zhitoujianli-backend.service

# 4. 验证
systemctl status zhitoujianli-backend.service
```

---

## ⚠️ 重要提醒

1. **不要手动复制文件** - 使用部署脚本
2. **不要跳过备份** - 部署脚本会自动备份
3. **不要忘记重载Nginx** - 否则浏览器缓存旧文件
4. **不要使用default_user** - 已删除，仅使用邮箱/手机号登录
5. **强制刷新浏览器** - Ctrl + Shift + R 清除缓存

---

## 📞 技术支持

如遇问题，请查看：
- 部署指南: `/opt/zhitoujianli/docs/DEPLOYMENT_GUIDE.md`
- 修复总结: `/opt/zhitoujianli/docs/FIX_SUMMARY_20251102.txt`
- UI保护指南: `/root/zhitoujianli/UI_VERSION_PROTECTION_GUIDE.md` (现已不再需要)

---

**最后更新**: 2025年11月4日
**维护者**: 智投简历技术团队
**版本**: v2.0 - UI完全修复版

