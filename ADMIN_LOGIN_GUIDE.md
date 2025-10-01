# 超级管理员登录指南

## 🔑 快速答案

**登录地址**: http://localhost:3000/ (首页登录)

**用户名和密码**: 需要先创建

## 📝 设置步骤

### 1. 首次设置超级管理员

由于系统没有预设的超级管理员账户，您需要：

1. **关闭认证模式**（临时设置）
   - 编辑 `get_jobs/src/main/resources/application.yml`
   - 确保 `security.enabled` 为 `false`

2. **直接访问后台管理**
   - 访问: http://localhost:8080/api/admin/dashboard
   - 此时可以无认证访问管理功能

3. **通过API创建超级管理员**
   ```bash
   curl -X POST http://localhost:8080/api/admin/admins \
   -H "Content-Type: application/json" \
   -d '{
     "userId": "super_admin_001",
     "adminType": "SUPER_ADMIN",
     "permissions": {}
   }'
   ```

### 2. 正常使用流程

1. **开启认证模式**
   - 将 `security.enabled` 改为 `true`
   - 重启后端服务

2. **在Authing注册管理员账户**
   - 访问: http://localhost:3000/
   - 注册一个新账户（这将是您的管理员账户）

3. **绑定超级管理员权限**
   - 记录注册后的用户ID
   - 在数据库中手动将该用户设置为超级管理员

4. **正常登录**
   - 访问: http://localhost:3000/
   - 使用注册的账户登录
   - 点击"管理后台"进入管理系统

## 🚨 重要提醒

- 后台管理地址 http://localhost:8080/ **不能直接访问**
- 必须先在首页 http://localhost:3000/ 登录
- 登录成功后才能访问后台管理功能
- 如果直接访问后台会自动跳转到登录页面

## 🛠️ 临时解决方案

如果需要立即访问管理功能，可以临时关闭认证：

1. 编辑 `application.yml`，设置 `security.enabled: false`
2. 重启服务
3. 直接访问管理API接口进行操作
4. 操作完成后记得重新开启认证