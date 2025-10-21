# Boss二维码修复 - 手动部署指南

## 🎯 修复内容

已完成的代码修改：

### 1. ✅ 添加二维码选择器常量
**文件**: `backend/get_jobs/src/main/java/boss/Locators.java`
- 添加了 `QR_CODE_CONTAINER` 和 `QR_CODE_IMAGE` 选择器

### 2. ✅ 添加二维码截图逻辑
**文件**: `backend/get_jobs/src/main/java/boss/Boss.java`
- 在 `scanLogin()` 方法中添加了二维码截图逻辑
- 点击二维码登录按钮后等待2秒
- 定位二维码容器并截图保存到 `/tmp/boss_qrcode.png`
- 更新登录状态文件为 "waiting"

### 3. ✅ 延长登录超时时间
- 从10分钟延长到15分钟
- 超时时更新状态文件为 "failed"

### 4. ✅ 登录成功后更新状态
- 登录成功时更新状态文件为 "success"

## 🚀 手动部署步骤

请在新的SSH终端中执行以下命令：

```bash
# 1. 停止当前服务
systemctl stop zhitoujianli-backend
pkill -f "IsolatedBossRunner"

# 2. 备份当前JAR
cp /opt/zhitoujianli/backend/get_jobs-v2.0.1.jar \
   /opt/zhitoujianli/backend/get_jobs-v2.0.1.jar.backup.qrcode.$(date +%Y%m%d_%H%M%S)

# 3. 编译项目
cd /root/zhitoujianli/backend/get_jobs
mvn clean package -DskipTests

# 4. 部署新JAR
cp target/get_jobs-v2.0.1.jar /opt/zhitoujianli/backend/

# 5. 启动服务
systemctl start zhitoujianli-backend

# 6. 验证服务
sleep 15
systemctl status zhitoujianli-backend
curl http://localhost:8080/api/boss/login/status
```

## 🔍 验证步骤

部署后请验证：

1. **访问网站**: https://zhitoujianli.com
2. **进入Boss投递页面**
3. **点击"开始投递"按钮**
4. **检查后端日志**: 应该看到 "✅ 二维码截图已保存: /tmp/boss_qrcode.png"
5. **检查二维码文件**: `ls -la /tmp/boss_qrcode.png`
6. **前端应显示二维码**: 不再出现404错误
7. **使用Boss直聘App扫码登录**
8. **登录成功后检查状态**: 状态文件应更新为 "success"

## 📊 预期结果

修复后应该看到：
- ✅ **二维码正常显示** - 前端不再出现404错误
- ✅ **截图文件生成** - `/tmp/boss_qrcode.png` 存在且有内容
- ✅ **登录超时延长** - 15分钟超时时间
- ✅ **状态同步正常** - 登录状态文件正确更新

## ⚠️ 重要提示

- 如果二维码选择器失效，可能需要调整 `//div[@class='login-qrcode']` 选择器
- 备份文件已保存，如有问题可立即回滚
- 修复过程不会影响当前运行的投递程序

---

**请执行上述部署命令，完成后告诉我结果！** 🚀

