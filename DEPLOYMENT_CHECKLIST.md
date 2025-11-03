# 🎯 智投简历部署检查清单

> **AI/人工都必须遵守的部署流程**

---

## 📋 前端部署检查清单

### 准备阶段
- [ ] 前端代码已修改并保存
- [ ] 已commit到Git（可选）
- [ ] 确认没有编译错误

### 执行部署
```bash
# 在项目根目录执行
cd /root/zhitoujianli
./deploy-frontend.sh
```

### 验证部署
- [ ] 脚本执行成功（无错误信息）
- [ ] 显示部署路径为：`/var/www/zhitoujianli/build`
- [ ] 显示主文件名（main.xxxxx.js）
- [ ] Nginx已重新加载

### 测试
- [ ] 提醒用户：清除浏览器缓存（Ctrl + Shift + R）
- [ ] 访问网站确认更新生效
- [ ] 检查浏览器控制台无错误

---

## 📋 后端部署检查清单

### 准备阶段
- [ ] 后端代码已修改并保存
- [ ] 已commit到Git（可选）
- [ ] 确认没有编译错误

### 构建
```bash
cd /root/zhitoujianli/backend/get_jobs
mvn clean package -DskipTests
```

- [ ] 构建成功（BUILD SUCCESS）
- [ ] JAR文件已生成（target/get_jobs-v*.jar）

### 部署
```bash
# 复制JAR到部署目录
VERSION="2.1.2"  # 更新版本号
cp target/get_jobs-*.jar /opt/zhitoujianli/backend/get_jobs-v${VERSION}.jar

# 更新符号链接
ln -sf /opt/zhitoujianli/backend/get_jobs-v${VERSION}.jar \
       /opt/zhitoujianli/backend/get_jobs-latest.jar

# 重启服务（如果修改了systemd配置，先daemon-reload）
systemctl restart zhitoujianli-backend.service
```

- [ ] JAR已复制到正确位置
- [ ] 符号链接已更新
- [ ] 服务已重启

### 验证
```bash
# 检查服务状态
systemctl status zhitoujianli-backend.service

# 等待30秒确认稳定
sleep 30 && systemctl status zhitoujianli-backend.service

# 测试API
curl -I http://localhost:8080
```

- [ ] 服务状态为 `active (running)`
- [ ] 30秒后仍在运行（未崩溃）
- [ ] API返回 `HTTP/1.1 200`
- [ ] 无错误日志

---

## 🚨 常见错误及解决方案

### ❌ 错误1：前端部署到错误路径
**症状**：用户清除缓存后仍显示旧版本

**解决**：
```bash
# 检查部署路径
ls -lh /var/www/zhitoujianli/build/

# 如果文件不是最新的，重新部署
./deploy-frontend.sh
```

### ❌ 错误2：后端服务崩溃
**症状**：服务启动后10秒崩溃

**可能原因**：
1. 端口8080被占用
2. 环境变量未加载
3. 需要 daemon-reload

**解决**：
```bash
# 1. 检查端口占用
lsof -i:8080
# 如果有进程占用，kill掉
pkill -9 -f "get_jobs"

# 2. 检查环境变量
ls -lh /etc/zhitoujianli/backend.env

# 3. daemon-reload
systemctl daemon-reload

# 4. 重启服务
systemctl restart zhitoujianli-backend.service
```

### ❌ 错误3：二维码不显示
**症状**：点击"Boss账号登录"后无二维码

**解决步骤**：
1. 检查前端是否最新：`ls -lh /var/www/zhitoujianli/build/static/js/`
2. 检查后端服务：`systemctl status zhitoujianli-backend.service`
3. 检查API：`curl http://localhost:8080/api/boss/login/start`
4. 提醒用户清除浏览器缓存

---

## 📊 部署日志查看

### 前端部署日志
```bash
tail -50 /opt/zhitoujianli/logs/deploy-frontend.log
```

### 后端服务日志
```bash
journalctl -u zhitoujianli-backend.service -n 100 --no-pager
```

### Nginx日志
```bash
tail -50 /var/log/nginx/error.log
```

---

## 🎯 快速命令参考

```bash
# 前端部署（推荐）
./deploy-frontend.sh

# 后端重启
systemctl restart zhitoujianli-backend.service

# 检查服务状态
systemctl status zhitoujianli-backend.service

# 查看实时日志
journalctl -u zhitoujianli-backend.service -f

# 测试API
curl -I http://localhost:8080
curl -I https://zhitoujianli.com
```

---

**🤖 AI提醒：执行任何部署操作前，先阅读此检查清单！**

