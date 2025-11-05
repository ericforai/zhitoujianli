# 🛡️ 智投简历 - 常见错误预防指南

## 📚 目录

1. [配置保存丢失问题](#配置保存丢失问题)
2. [用户ID路径不一致问题](#用户id路径不一致问题)
3. [预防措施总结](#预防措施总结)
4. [工具和检查清单](#工具和检查清单)

---

## 配置保存丢失问题

### ❌ 问题描述

**现象：** 保存配置后，刷新页面配置丢失

**根本原因：** 后端直接覆盖整个配置文件，导致未修改的字段丢失

### 🔍 问题代码

```java
// ❌ 错误：直接覆盖
@PutMapping("/config")
public ResponseEntity<ApiResponse<Map<String, Object>>> updateDeliveryConfig(
        @RequestBody Map<String, Object> config) {
    saveConfig(config);  // 前端只发送了 bossConfig，其他字段全部丢失！
    return ResponseEntity.ok(ApiResponse.success(config, "成功"));
}
```

**问题分析：**
- 前端只发送：`{ bossConfig: {...} }`
- 后端直接保存：配置文件只剩下 `bossConfig`
- 原有的 `deliveryStrategy`、`blacklistConfig`、`boss` 等字段全部丢失

### ✅ 正确实现

```java
// ✅ 正确：先加载，再合并
@PutMapping("/config")
public ResponseEntity<ApiResponse<Map<String, Object>>> updateDeliveryConfig(
        @RequestBody Map<String, Object> newConfig) {
    // 1. 加载现有配置
    Map<String, Object> existingConfig = loadConfig();

    // 2. 合并新配置（新配置覆盖旧配置的同名字段，但保留未修改的字段）
    existingConfig.putAll(newConfig);

    // 3. 保存合并后的配置
    saveConfig(existingConfig);

    return ResponseEntity.ok(ApiResponse.success(existingConfig, "成功"));
}
```

### 🧪 测试用例

```java
@Test
void testConfigMerge() {
    Map<String, Object> existing = new HashMap<>();
    existing.put("boss", Map.of("keywords", "旧值"));
    existing.put("deliveryStrategy", Map.of("maxDailyDelivery", 50));
    existing.put("blacklistConfig", Map.of("enableBlacklistFilter", true));

    Map<String, Object> update = new HashMap<>();
    update.put("boss", Map.of("keywords", "新值"));

    existing.putAll(update);

    // 验证：boss 更新，其他字段保留
    assertEquals("新值", ((Map)existing.get("boss")).get("keywords"));
    assertEquals(50, ((Map)existing.get("deliveryStrategy")).get("maxDailyDelivery"));
    assertTrue((Boolean)((Map)existing.get("blacklistConfig")).get("enableBlacklistFilter"));
}
```

---

## 用户ID路径不一致问题

### ❌ 问题描述

**现象：**
- API返回空配置或报错"文件不存在"
- 实际文件存在，但路径不匹配

**根本原因：** 用户ID清理逻辑不一致，导致文件路径不匹配

### 🔍 问题代码

**错误版本1：** 保留了 `@` 符号
```java
// ❌ 错误！@ 符号会导致文件系统错误
String safeUserId = userId.replaceAll("[^a-zA-Z0-9_@.-]", "_");
// 结果：luwenrong123@sina.com → luwenrong123@sina.com (保留了@)
```

**错误版本2：** 清理逻辑不一致
```java
// 文件A：
String safeUserId = userId.replaceAll("[^a-zA-Z0-9_-]", "_");

// 文件B：
String safeUserId = userId.replaceAll("[^a-zA-Z0-9_.]", "_");

// 结果：同一个用户ID，两个不同的路径！
```

### ✅ 正确实现

**唯一正确的方式：使用统一的工具方法**

```java
// ✅ 正确：使用 UserContextUtil.sanitizeUserId()
String userId = UserContextUtil.getCurrentUserId();
String safeUserId = UserContextUtil.sanitizeUserId(userId);
String configPath = "user_data/" + safeUserId + "/config.json";

// 结果：luwenrong123@sina.com → luwenrong123_sina_com
```

### 🎯 为什么必须使用工具方法？

| 方法 | 结果 | 问题 |
|------|------|------|
| `replaceAll("[^a-zA-Z0-9_@.-]", "_")` | `luwenrong123@sina.com` | ❌ 保留了@ |
| `replaceAll("[^a-zA-Z0-9_-]", "_")` | `luwenrong123_sina_com` | ⚠️ 逻辑分散 |
| `UserContextUtil.sanitizeUserId()` | `luwenrong123_sina_com` | ✅ 统一规范 |

### 🧪 测试用例

```java
@Test
void testUserIdPathConsistency() {
    String userId = "test@example.com";

    // 多次调用必须返回相同结果
    String path1 = UserContextUtil.sanitizeUserId(userId);
    String path2 = UserContextUtil.sanitizeUserId(userId);
    assertEquals(path1, path2);

    // 路径中不能包含@符号
    assertFalse(path1.contains("@"));
    assertEquals("test_example_com", path1);
}
```

---

## 预防措施总结

### 1️⃣ **代码规范**

#### ✅ 必须遵守的规则

1. **使用统一工具方法**
   ```java
   // ❌ 禁止
   String safeUserId = userId.replaceAll(...);

   // ✅ 正确
   String safeUserId = UserContextUtil.sanitizeUserId(userId);
   ```

2. **配置保存使用合并模式**
   ```java
   // ❌ 禁止
   saveConfig(newConfig);

   // ✅ 正确
   Map<String, Object> existing = loadConfig();
   existing.putAll(newConfig);
   saveConfig(existing);
   ```

3. **避免硬编码路径**
   ```java
   // ❌ 禁止
   String path = "user_data/luwenrong123_sina_com/config.json";

   // ✅ 正确
   String path = UserContextUtil.getSafeUserDataPath() + "/config.json";
   ```

#### 📖 完整规范

参考：[`docs/CODING_STANDARDS.md`](./CODING_STANDARDS.md)

---

### 2️⃣ **自动化检查**

#### Git Pre-commit Hook

位置：`.git/hooks/pre-commit`

**功能：**
- ✅ 检测重复的用户ID处理逻辑
- ✅ 检测保留@符号的正则表达式
- ✅ 检测硬编码路径
- ✅ 自动拦截不规范代码

#### 代码规范检查脚本

运行：
```bash
./scripts/check-code-standards.sh
```

**检查项目：**
1. 重复的用户ID处理逻辑
2. 硬编码用户数据路径
3. 配置保存逻辑检查
4. 保留@符号的正则表达式
5. UserContextUtil 导入检查

---

### 3️⃣ **单元测试**

#### 必须包含的测试

1. **用户ID清理测试**
   ```java
   @Test
   void testUserIdSanitization() {
       assertEquals("test_example_com",
           UserContextUtil.sanitizeUserId("test@example.com"));
   }
   ```

2. **配置合并测试**
   ```java
   @Test
   void testConfigMerge() {
       Map<String, Object> existing = loadConfig();
       existing.putAll(newConfig);
       // 验证未修改字段保留
   }
   ```

3. **路径一致性测试**
   ```java
   @Test
   void testPathConsistency() {
       String path1 = getUserConfigPath(userId);
       String path2 = getUserConfigPath(userId);
       assertEquals(path1, path2);
   }
   ```

#### 完整测试文件

参考：[`DeliveryConfigControllerTest.java`](../backend/get_jobs/src/test/java/controller/DeliveryConfigControllerTest.java)

---

### 4️⃣ **Code Review检查清单**

提交PR前必须检查：

- [ ] 是否使用了 `UserContextUtil.sanitizeUserId()`？
- [ ] 是否避免了重复造轮子？
- [ ] 配置保存是否使用了合并模式？
- [ ] 是否避免了硬编码路径？
- [ ] 是否添加了单元测试？
- [ ] 是否添加了必要的日志？
- [ ] 是否更新了相关文档？

---

## 工具和检查清单

### 开发前检查

```bash
# 1. 查看现有工具方法
grep -r "public static.*sanitizeUserId" backend/get_jobs/src/

# 2. 检查是否有类似功能
grep -r "replaceAll.*userId" backend/get_jobs/src/

# 3. 运行代码规范检查
./scripts/check-code-standards.sh
```

### 开发中检查

- **使用IDE提示：** 输入 `UserContextUtil.` 查看可用方法
- **查看文档：** `docs/CODING_STANDARDS.md`
- **参考测试：** `backend/get_jobs/src/test/`

### 提交前检查

```bash
# 1. 运行单元测试
cd backend/get_jobs && mvn test

# 2. 运行代码规范检查
./scripts/check-code-standards.sh

# 3. Git提交（自动触发pre-commit hook）
git add .
git commit -m "feat: ..."
```

---

## 🎯 记住这3条铁律

1. **DRY原则**：如果已经有工具方法，就用它！
2. **合并而不是覆盖**：更新配置时必须先加载、再合并
3. **测试覆盖**：所有涉及用户数据的方法必须有测试

---

## 📞 遇到问题？

1. 查看文档：`docs/CODING_STANDARDS.md`
2. 运行检查：`./scripts/check-code-standards.sh`
3. 查看测试：`backend/get_jobs/src/test/`
4. 提交Issue或联系开发团队

---

**最后修改：** 2025-11-04
**维护者：** 智投简历开发团队

