# 🚀 智投简历 - 开发快速参考卡片

## ⚡ 3秒规则

**在写任何代码前，问自己3个问题：**

1. **是否已有工具方法？** → 用它！
2. **是否会覆盖数据？** → 合并而不是覆盖！
3. **是否硬编码路径？** → 使用工具方法！

---

## ✅ DO（必须这样做）

### 1. 用户ID处理
```java
// ✅ DO
String userId = UserContextUtil.getCurrentUserId();
String safeUserId = UserContextUtil.sanitizeUserId(userId);
```

### 2. 配置保存
```java
// ✅ DO
Map<String, Object> existing = loadConfig();
existing.putAll(newConfig);
saveConfig(existing);
```

### 3. 路径构建
```java
// ✅ DO
String path = UserContextUtil.getSafeUserDataPath() + "/config.json";
```

---

## ❌ DON'T（禁止这样做）

### 1. 重复实现
```java
// ❌ DON'T
String safeUserId = userId.replaceAll(...);
```

### 2. 直接覆盖
```java
// ❌ DON'T
saveConfig(newConfig);  // 会丢失其他字段！
```

### 3. 硬编码路径
```java
// ❌ DON'T
String path = "user_data/test_user/config.json";
```

---

## 🔧 常用工具方法

```java
// 用户相关
UserContextUtil.getCurrentUserId()           // 获取当前用户ID
UserContextUtil.sanitizeUserId(userId)       // 清理用户ID
UserContextUtil.getSafeUserDataPath()        // 获取用户数据路径

// 配置相关
loadConfig()                                 // 加载配置
saveConfig(config)                           // 保存配置
config.putAll(newConfig)                     // 合并配置
```

---

## 🧪 提交前检查

```bash
# 1. 运行测试
cd backend/get_jobs && mvn test

# 2. 运行检查
./scripts/check-code-standards.sh

# 3. 提交（自动触发hook）
git add .
git commit -m "feat: your feature"
```

---

## 📚 完整文档

- [编码规范](CODING_STANDARDS.md)
- [常见错误预防](PREVENT_COMMON_ERRORS.md)

---

**记住：** 如果已经有工具方法，就用它！别重复造轮子！

