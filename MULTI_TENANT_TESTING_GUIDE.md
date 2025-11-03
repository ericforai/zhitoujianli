# 🧪 多租户安全修复 - 完整测试指南

**测试目标**: 验证所有P0多租户安全修复是否正常工作
**预计时间**: 15-20分钟
**难度**: ⭐⭐ (简单，只需复制粘贴命令)

---

## 📋 测试准备

### 前置条件检查

1. **后端服务运行中**
```bash
curl http://localhost:8080/status
# 应返回: {"isRunning":false,"logFile":null}
```

2. **jq工具已安装**（用于解析JSON）
```bash
# 如果没有安装，执行：
sudo apt-get install -y jq
```

3. **切换到项目目录**
```bash
cd /root/zhitoujianli
```

---

## 🚀 方法1: 自动化测试（推荐）

### 一键执行完整测试

```bash
# 执行自动化测试脚本
./test-multi-tenant-security.sh
```

**测试内容**:
- ✅ 服务健康检查
- ✅ 创建2个测试用户（自动生成邮箱）
- ✅ Boss Cookie隔离测试
- ✅ 未登录访问拒绝测试
- ✅ 用户数据隔离测试
- ✅ Cookie CRUD操作测试
- ✅ 安全性测试

**预期输出**:
```
🧪 智投简历 - 多租户安全测试套件
====================================
测试时间: 2025-11-02 22:00:00
API地址: http://localhost:8080
报告文件: test-results/multi-tenant-test-report-20251102_220000.txt

✅ 后端服务正常运行
✅ 用户A注册成功，ID: 1
✅ 用户B注册成功，ID: 2
✅ 用户A Cookie保存成功
✅ 用户B Cookie保存成功
✨ 核心验证通过：用户A的Cookie未被覆盖
✨ 多租户隔离机制工作正常！

总测试数: 20
通过: 20
失败: 0
成功率: 100.0%

🎉 所有测试通过！多租户安全修复验证成功！
```

### 查看测试报告

```bash
# 查看最新测试报告
cat test-results/multi-tenant-test-report-*.txt | tail -50

# 或在浏览器中查看
cat test-results/multi-tenant-test-report-*.txt
```

---

## 📝 方法2: 手动测试（逐步验证）

如果您想更深入地理解每个测试，可以手动执行以下步骤。

---

### 测试1: 注册两个测试用户

#### 步骤1.1: 注册用户A

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "userA_test@test.com",
    "password": "Password123",
    "username": "Test User A"
  }' | jq '.'
```

**预期响应**:
```json
{
  "success": true,
  "message": "注册成功",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "userId": 1,
    "email": "userA_test@test.com",
    "username": "Test User A"
  }
}
```

**保存Token**:
```bash
# 从响应中复制token，保存到环境变量
export TOKEN_A="<粘贴你的token>"
export USER_A_ID="1"  # 从响应中获取
```

#### 步骤1.2: 注册用户B

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "userB_test@test.com",
    "password": "Password123",
    "username": "Test User B"
  }' | jq '.'
```

**保存Token**:
```bash
export TOKEN_B="<粘贴你的token>"
export USER_B_ID="2"  # 从响应中获取
```

---

### 测试2: Boss Cookie 隔离测试 🔥 核心测试

#### 步骤2.1: 用户A保存Cookie

```bash
curl -X POST http://localhost:8080/api/boss/cookie \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{
    "zp_token": "user_a_zp_token_123456",
    "session": "user_a_session_abcdef"
  }' | jq '.'
```

**预期响应**:
```json
{
  "success": true,
  "message": "Cookie保存成功，可以启动Boss程序",
  "cookie_file": "user_data/user_1/boss_cookie.json",
  "userId": "user_1"
}
```

**✅ 验证点**: `cookie_file` 路径应包含 `user_1`

#### 步骤2.2: 用户B保存Cookie

```bash
curl -X POST http://localhost:8080/api/boss/cookie \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{
    "zp_token": "user_b_zp_token_789012",
    "session": "user_b_session_ghijkl"
  }' | jq '.'
```

**预期响应**:
```json
{
  "cookie_file": "user_data/user_2/boss_cookie.json",
  "userId": "user_2"
}
```

**✅ 验证点**: `cookie_file` 路径应包含 `user_2`

#### 步骤2.3: 验证物理文件隔离 🔥 关键验证

```bash
# 列出所有用户的Cookie文件
ls -la user_data/user_*/boss_cookie.json

# 预期输出:
# user_data/user_1/boss_cookie.json
# user_data/user_2/boss_cookie.json
# ✅ 两个独立的文件
```

**检查用户A的Cookie内容**:
```bash
cat user_data/user_${USER_A_ID}/boss_cookie.json | jq '.'
```

**预期内容**:
```json
[
  {
    "name": "zp_token",
    "value": "user_a_zp_token_123456",  // ✅ 用户A的token
    ...
  }
]
```

**检查用户B的Cookie内容**:
```bash
cat user_data/user_${USER_B_ID}/boss_cookie.json | jq '.'
```

**预期内容**:
```json
[
  {
    "name": "zp_token",
    "value": "user_b_zp_token_789012",  // ✅ 用户B的token（不同！）
    ...
  }
]
```

**✅ 核心验证**: 两个文件内容不同，证明隔离成功！

#### 步骤2.4: 读取测试

```bash
# 用户A读取自己的Cookie
curl -X GET http://localhost:8080/api/boss/cookie \
  -H "Authorization: Bearer $TOKEN_A" | jq '.cookie_content' | grep "user_a_zp_token"

# 应该找到 user_a_zp_token
```

```bash
# 用户B读取自己的Cookie
curl -X GET http://localhost:8080/api/boss/cookie \
  -H "Authorization: Bearer $TOKEN_B" | jq '.cookie_content' | grep "user_b_zp_token"

# 应该找到 user_b_zp_token
```

**✅ 验证点**: 每个用户只能看到自己的Cookie

---

### 测试3: 未登录访问拒绝测试

#### 步骤3.1: 不带Token访问API

```bash
# 测试：未登录访问简历API
curl -i http://localhost:8080/api/candidate-resume/load 2>&1 | grep "HTTP"

# 预期: HTTP/1.1 401 Unauthorized
# 或者: HTTP/1.1 403 Forbidden
```

#### 步骤3.2: 使用错误Token访问

```bash
curl -i http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer invalid_fake_token_12345" 2>&1 | grep "HTTP"

# 预期: HTTP/1.1 401 Unauthorized
```

**✅ 验证点**: 所有受保护的API都应拒绝未授权访问

---

### 测试4: 数据隔离验证

#### 步骤4.1: 检查用户数据目录

```bash
# 查看所有用户的数据目录
tree user_data/ -L 2 2>/dev/null || ls -laR user_data/

# 预期结构:
# user_data/
# ├── user_1/
# │   └── boss_cookie.json
# └── user_2/
#     └── boss_cookie.json
```

#### 步骤4.2: 验证用户A无法访问用户B的数据

```bash
# 用户A获取当前用户信息
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer $TOKEN_A" | jq '.user.userId'

# 应返回: "user_1" 或 "1"

# 用户B获取当前用户信息
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer $TOKEN_B" | jq '.user.userId'

# 应返回: "user_2" 或 "2"
```

**✅ 验证点**: 每个用户只能看到自己的ID

---

### 测试5: Cookie删除测试

#### 步骤5.1: 用户A删除自己的Cookie

```bash
curl -X DELETE http://localhost:8080/api/boss/cookie \
  -H "Authorization: Bearer $TOKEN_A" | jq '.'

# 预期: {"success": true, "message": "Cookie已清除"}
```

#### 步骤5.2: 验证用户B的Cookie仍然存在

```bash
# 用户B读取Cookie（应该仍然存在）
curl http://localhost:8080/api/boss/cookie \
  -H "Authorization: Bearer $TOKEN_B" | jq '.has_cookie'

# 预期: true（用户B的Cookie未被删除）
```

**✅ 关键验证**: 用户A删除自己的Cookie不影响用户B

---

## 🔍 高级测试（可选）

### 测试6: 并发访问测试

创建并发测试脚本：

```bash
cat > test-concurrent.sh << 'EOF'
#!/bin/bash
TOKEN_A="$1"
TOKEN_B="$2"

echo "用户A和用户B同时保存Cookie..."

# 用户A保存
curl -X POST http://localhost:8080/api/boss/cookie \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"zp_token":"concurrent_a","session":"concurrent_a"}' &

# 用户B保存
curl -X POST http://localhost:8080/api/boss/cookie \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{"zp_token":"concurrent_b","session":"concurrent_b"}' &

wait

echo "验证两个用户的Cookie是否都正确保存..."
grep -r "concurrent_a" user_data/user_*/boss_cookie.json && echo "✅ 用户A Cookie存在"
grep -r "concurrent_b" user_data/user_*/boss_cookie.json && echo "✅ 用户B Cookie存在"
EOF

chmod +x test-concurrent.sh
./test-concurrent.sh "$TOKEN_A" "$TOKEN_B"
```

---

### 测试7: Boss任务启动测试（需要简历）

#### 步骤7.1: 上传简历（用户A）

```bash
# 创建测试简历
cat > test_resume_a.txt << 'EOF'
张三
市场营销总监
手机：13800138000
邮箱：zhangsan@test.com

工作经验：
2018-2024 某科技公司 市场总监
负责品牌营销、市场推广等工作

教育背景：
2010-2014 某大学 市场营销专业 本科
EOF

# 上传简历
curl -X POST http://localhost:8080/api/candidate-resume/upload \
  -H "Authorization: Bearer $TOKEN_A" \
  -F "file=@test_resume_a.txt"
```

#### 步骤7.2: 保存Boss配置

```bash
curl -X POST http://localhost:8080/api/config \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{
    "boss": {
      "keywords": ["市场总监"],
      "cityCode": ["上海"],
      "sayHi": "您好，我对该职位很感兴趣"
    }
  }'
```

#### 步骤7.3: 启动Boss任务（验证userId传递）

```bash
# 启动任务
curl -X POST http://localhost:8080/api/start-boss-task \
  -H "Authorization: Bearer $TOKEN_A" | jq '.'

# 预期响应:
# {
#   "success": true,
#   "message": "Boss任务启动成功",
#   "userId": "user_1",  // ✅ 包含userId
#   "logFile": "logs/boss_web_xxx.log"
# }
```

#### 步骤7.4: 检查任务日志

```bash
# 查看日志中的userId
tail -f logs/boss_web_*.log | grep -i "userId\|用户"

# 预期看到类似：
# 用户 user_1 请求启动Boss投递任务
# 已设置Boss程序环境变量: BOSS_USER_ID=user_1
```

**✅ 验证点**: 日志中应显示正确的userId，而非default_user

---

## 📊 测试结果判断标准

### ✅ 成功标准

**Boss Cookie隔离**:
- ✅ 两个用户创建了独立的cookie.json文件
- ✅ 文件路径包含各自的userId
- ✅ 文件内容不同（各自的token）
- ✅ 删除操作不影响其他用户

**移除default_user**:
- ✅ 未登录访问返回401/403
- ✅ 不存在 user_data/default_user/ 目录的新数据
- ✅ 日志中无 "使用default_user" 警告

**异步任务上下文**:
- ✅ Boss任务启动响应包含userId
- ✅ 日志显示正确的userId
- ✅ 环境变量BOSS_USER_ID已设置

---

### ❌ 失败标准

**如果出现以下情况，修复失败**:
- ❌ 用户B保存Cookie后，用户A的Cookie消失
- ❌ 两个用户读取到相同的Cookie内容
- ❌ 未登录访问返回200（正常数据）
- ❌ 日志显示 "使用default_user"
- ❌ Cookie文件路径为 `src/main/java/boss/cookie.json`

---

## 🐛 常见问题排查

### 问题1: "用户注册失败：邮箱已被注册"

**原因**: 之前测试时使用了相同邮箱

**解决**:
```bash
# 使用时间戳生成唯一邮箱
TIMESTAMP=$(date +%s)
EMAIL="test_${TIMESTAMP}@test.com"

curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"Password123\",
    \"username\": \"Test User\"
  }"
```

---

### 问题2: "Token无效或已过期"

**原因**: Token可能已过期（默认24小时）

**解决**:
```bash
# 重新登录获取新Token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "userA_test@test.com",
    "password": "Password123"
  }' | jq -r '.token'

# 更新环境变量
export TOKEN_A="<新token>"
```

---

### 问题3: "Cookie文件不存在"

**原因**: 可能Cookie保存失败

**排查**:
```bash
# 1. 检查用户数据目录是否创建
ls -la user_data/

# 2. 检查后端日志
tail -50 backend/get_jobs/backend.log | grep -i "cookie\|error"

# 3. 手动创建目录测试
mkdir -p user_data/user_1
```

---

### 问题4: "服务返回500错误"

**原因**: 后端可能有异常

**排查**:
```bash
# 查看后端日志
tail -100 backend/get_jobs/backend.log

# 查看是否有UnauthorizedException相关错误
grep -i "UnauthorizedException\|default_user" backend/get_jobs/backend.log | tail -20
```

---

## 📋 完整测试检查清单

打印此清单，逐项完成：

```
□ 1. 服务健康检查
   □ curl http://localhost:8080/status
   □ 返回 isRunning 字段

□ 2. 注册测试用户
   □ 注册用户A，获得TOKEN_A
   □ 注册用户B，获得TOKEN_B
   □ 保存两个token到环境变量

□ 3. Boss Cookie隔离测试
   □ 用户A保存Cookie（zp_token=xxx_a）
   □ 用户B保存Cookie（zp_token=xxx_b）
   □ 验证创建了两个独立文件
   □ 验证文件内容不同
   □ 用户A读取Cookie，内容包含xxx_a
   □ 用户B读取Cookie，内容包含xxx_b

□ 4. Cookie删除测试
   □ 用户A删除自己的Cookie
   □ 验证用户A Cookie已删除
   □ 验证用户B Cookie仍然存在

□ 5. 未登录访问测试
   □ 不带Token访问API
   □ 验证返回401/403

□ 6. 数据目录验证
   □ 检查user_data/user_1/存在
   □ 检查user_data/user_2/存在
   □ 验证不存在src/main/java/boss/cookie.json

□ 7. 回归测试
   □ 用户A重新登录成功
   □ 用户B重新登录成功
   □ 基本功能未受影响
```

---

## 🎯 快速测试（5分钟版）

如果时间有限，执行以下最小测试集：

```bash
# 1. 一键自动化测试
./test-multi-tenant-security.sh

# 2. 检查测试报告
cat test-results/multi-tenant-test-report-*.txt | grep "成功率"

# 3. 验证Cookie文件
ls -la user_data/user_*/boss_cookie.json

# 如果以上都通过，修复验证成功！
```

---

## 📊 测试报告示例

### 成功的测试报告

```
====================================================================
🧪 智投简历 - 多租户安全测试套件
====================================================================

测试时间: 2025-11-02 22:00:00
API地址: http://localhost:8080

✅ 测试 #1: 服务健康检查
✅ 测试 #2: 认证服务健康检查
✅ 测试 #3: 注册用户A
✅ 测试 #4: 注册用户B
✅ 测试 #5: 用户A保存Boss Cookie
✅ 测试 #6: 用户B保存Boss Cookie
✅ 测试 #7: 验证Cookie文件物理隔离
✅ 测试 #8: 验证Cookie未被覆盖（核心测试）
✅ 测试 #9: 用户A读取自己的Cookie
✅ 测试 #10: 用户B读取自己的Cookie

总测试数: 20
通过: 20
失败: 0
成功率: 100.0%

🎉 所有测试通过！多租户安全修复验证成功！
```

---

## 🚀 立即开始测试

### 推荐步骤

**第1步**: 执行自动化测试（5分钟）
```bash
cd /root/zhitoujianli
./test-multi-tenant-security.sh
```

**第2步**: 查看测试报告
```bash
cat test-results/multi-tenant-test-report-*.txt
```

**第3步**: 如果通过，修复验证成功！🎉

**第4步**: 如果失败，查看具体错误并联系技术支持

---

## 📞 需要帮助？

**测试失败**: 提供测试报告文件
**看不懂输出**: 参考本文档的"预期输出"部分
**技术问题**: 检查 backend.log 日志文件

---

**准备好了吗？执行这个命令开始测试**:

```bash
cd /root/zhitoujianli && ./test-multi-tenant-security.sh
```

---

**测试指南创建时间**: 2025-11-02
**预计测试时间**: 15-20分钟
**难度**: ⭐⭐ (简单)

