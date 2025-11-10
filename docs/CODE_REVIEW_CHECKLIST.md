# 智投简历 - 代码审查检查清单

## 📋 概述

本文档用于系统性代码审查，确保代码质量、安全性和可维护性。

**审查原则**：
- ✅ 不放过任何代码细节
- ✅ 重点关注多租户隔离
- ✅ 确保安全性
- ✅ 保证代码质量

---

## 🔒 多租户隔离检查

### 1. 用户身份验证

**检查项**：
- [ ] 所有API端点都要求认证（除了公开端点）
- [ ] 使用 `UserContextUtil.getCurrentUserId()` 获取用户ID
- [ ] 未登录用户无法访问任何用户数据
- [ ] JWT Token验证正确实现

**检查方法**：
```bash
# 检查所有Controller是否使用getCurrentUserId
grep -r "getCurrentUserId" backend/get_jobs/src/main/java/controller/

# 检查是否有硬编码的用户ID
grep -r "default_user\|user_123\|test_user" backend/get_jobs/src/main/java/
```

**常见问题**：
- ❌ 硬编码用户ID
- ❌ 跳过用户认证检查
- ❌ 使用默认用户fallback

### 2. 数据路径隔离

**检查项**：
- [ ] 所有文件操作都使用用户隔离路径
- [ ] 文件路径包含用户ID
- [ ] 没有共享文件路径
- [ ] 路径清理防止路径遍历攻击

**检查方法**：
```bash
# 检查文件操作是否使用用户路径
grep -r "user_data/" backend/get_jobs/src/main/java/ | grep -v "user_data/\${userId}"

# 检查是否有硬编码路径
grep -r "user_data/default\|user_data/shared" backend/get_jobs/src/main/java/
```

**正确示例**：
```java
// ✅ 正确：使用用户ID构建路径
String userId = UserContextUtil.getCurrentUserId();
String configPath = "user_data/" + userId + "/config.json";

// ❌ 错误：硬编码路径
String configPath = "user_data/default/config.json";
```

### 3. 数据库查询隔离

**检查项**：
- [ ] 所有数据库查询都包含用户ID过滤
- [ ] 没有全局查询（不包含WHERE userId = ?）
- [ ] 管理员查询有权限检查

**检查方法**：
```bash
# 检查Repository查询是否包含userId
grep -r "@Query" backend/get_jobs/src/main/java/repository/ | grep -v "userId"
```

**正确示例**：
```java
// ✅ 正确：包含用户ID过滤
@Query("SELECT u FROM User u WHERE u.userId = :userId AND u.deletedAt IS NULL")

// ❌ 错误：全局查询
@Query("SELECT u FROM User u WHERE u.deletedAt IS NULL")
```

### 4. Cookie和Session隔离

**检查项**：
- [ ] Boss Cookie文件使用用户ID隔离
- [ ] Session数据包含用户ID
- [ ] 没有共享Cookie

**检查方法**：
```bash
# 检查Cookie文件路径
grep -r "boss_cookie\|cookie.json" backend/get_jobs/src/main/java/ | grep -v "\${userId}\|userId"
```

---

## 🛡️ 安全性检查

### 1. 认证和授权

**检查项**：
- [ ] SECURITY_ENABLED=true（生产环境）
- [ ] JWT Token验证正确
- [ ] 权限检查完整
- [ ] 敏感操作需要额外验证

**检查方法**：
```bash
# 检查SECURITY_ENABLED配置
grep -r "SECURITY_ENABLED" /etc/zhitoujianli/backend.env

# 检查SecurityConfig配置
grep -r "permitAll\|authenticated" backend/get_jobs/src/main/java/config/
```

### 2. 输入验证

**检查项**：
- [ ] 所有用户输入都进行验证
- [ ] 文件上传类型检查
- [ ] SQL注入防护
- [ ] XSS防护

**检查方法**：
```bash
# 检查是否有SQL拼接
grep -r "String.*sql.*\+" backend/get_jobs/src/main/java/

# 检查文件上传验证
grep -r "MultipartFile\|@RequestParam.*file" backend/get_jobs/src/main/java/controller/
```

### 3. 敏感信息保护

**检查项**：
- [ ] 密码使用BCrypt加密
- [ ] API密钥存储在环境变量
- [ ] 日志不包含敏感信息
- [ ] 错误信息不泄露系统信息

**检查方法**：
```bash
# 检查是否有硬编码密钥
grep -r "sk-\|password.*=.*\"\|api.*key.*=.*\"" backend/get_jobs/src/main/java/ | grep -v "//\|example"

# 检查日志是否包含敏感信息
grep -r "log.*password\|log.*token\|log.*secret" backend/get_jobs/src/main/java/
```

### 4. 路径安全

**检查项**：
- [ ] 文件路径清理（防止路径遍历）
- [ ] 用户ID验证（防止注入）
- [ ] 文件权限检查

**检查方法**：
```bash
# 检查路径清理
grep -r "sanitize\|clean\|replace.*\\.\\." backend/get_jobs/src/main/java/util/
```

---

## 🐛 错误处理检查

### 1. 异常处理

**检查项**：
- [ ] 所有异常都被捕获
- [ ] 异常信息不泄露敏感数据
- [ ] 有全局异常处理器
- [ ] 错误日志记录完整

**检查方法**：
```bash
# 检查是否有未捕获的异常
grep -r "throws.*Exception" backend/get_jobs/src/main/java/controller/

# 检查异常处理
grep -r "try\|catch\|finally" backend/get_jobs/src/main/java/controller/ | wc -l
```

### 2. 日志记录

**检查项**：
- [ ] 关键操作都有日志
- [ ] 日志级别正确
- [ ] 日志不包含敏感信息
- [ ] 日志格式统一

**检查方法**：
```bash
# 检查日志使用
grep -r "log\\.(info|warn|error|debug)" backend/get_jobs/src/main/java/ | wc -l
```

---

## ⚡ 性能检查

### 1. 数据库查询

**检查项**：
- [ ] 查询使用索引
- [ ] 避免N+1查询
- [ ] 使用分页
- [ ] 查询结果缓存

**检查方法**：
```bash
# 检查是否有分页
grep -r "Pageable\|@PageableDefault" backend/get_jobs/src/main/java/controller/
```

### 2. 文件操作

**检查项**：
- [ ] 大文件使用流式处理
- [ ] 文件操作异步处理
- [ ] 文件缓存合理

---

## 📝 代码质量检查

### 1. 代码规范

**检查项**：
- [ ] 遵循Java代码规范
- [ ] 方法长度合理（< 50行）
- [ ] 类职责单一
- [ ] 命名清晰

**检查方法**：
```bash
# 运行代码质量检查
cd backend/get_jobs
mvn checkstyle:check
mvn spotbugs:check
mvn pmd:check
```

### 2. 注释和文档

**检查项**：
- [ ] 公共方法有JavaDoc
- [ ] 复杂逻辑有注释
- [ ] API文档更新

**检查方法**：
```bash
# 检查JavaDoc覆盖率
find backend/get_jobs/src/main/java -name "*.java" -exec grep -L "/\*\*" {} \;
```

### 3. 测试覆盖

**检查项**：
- [ ] 单元测试覆盖率 > 60%
- [ ] 关键功能有集成测试
- [ ] 多租户隔离有测试用例

**检查方法**：
```bash
# 运行测试并检查覆盖率
cd backend/get_jobs
mvn test jacoco:report
```

---

## 🔍 专项检查

### 1. Boss投递功能

**检查项**：
- [ ] Cookie文件隔离
- [ ] 投递日志隔离
- [ ] 配置隔离

### 2. 简历解析功能

**检查项**：
- [ ] 简历文件隔离
- [ ] 解析结果隔离
- [ ] AI配置隔离

### 3. 用户配置功能

**检查项**：
- [ ] 配置保存隔离
- [ ] 配置加载隔离
- [ ] 默认配置不共享

---

## 📊 审查报告模板

```markdown
## 代码审查报告

**审查时间**: [日期]
**审查人员**: [姓名]
**审查范围**: [文件/模块]

### 多租户隔离
- ✅ 用户身份验证：通过
- ✅ 数据路径隔离：通过
- ⚠️ 数据库查询隔离：发现1个问题

### 安全性
- ✅ 认证和授权：通过
- ⚠️ 输入验证：发现2个问题

### 错误处理
- ✅ 异常处理：通过
- ✅ 日志记录：通过

### 发现的问题

1. **问题1**: [描述]
   - 位置: [文件:行号]
   - 严重程度: [高/中/低]
   - 修复建议: [建议]

2. **问题2**: [描述]
   - ...

### 修复建议

1. [修复建议1]
2. [修复建议2]

### 审查结论

- [ ] 通过，可以部署
- [ ] 需要修复问题后重新审查
- [ ] 不通过，需要重大修改
```

---

## ✅ 审查检查清单

### 多租户隔离
- [ ] 所有API使用getCurrentUserId()
- [ ] 所有文件路径包含用户ID
- [ ] 所有数据库查询包含用户ID过滤
- [ ] Cookie和Session隔离

### 安全性
- [ ] SECURITY_ENABLED=true
- [ ] JWT验证正确
- [ ] 输入验证完整
- [ ] 敏感信息保护

### 错误处理
- [ ] 异常处理完整
- [ ] 日志记录充分
- [ ] 错误信息不泄露

### 代码质量
- [ ] 代码规范符合
- [ ] 注释充分
- [ ] 测试覆盖充分

---

**最后更新**: 2025-11-07
**维护人员**: 智投简历团队

