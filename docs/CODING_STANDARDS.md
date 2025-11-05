# 智投简历 - 编码规范

## 🚨 关键原则

### 1. DRY原则（Don't Repeat Yourself）

**禁止重复实现已有工具方法！**

#### ❌ 错误示例
```java
// 在Controller中重复实现用户ID清理逻辑
String safeUserId = userId.replaceAll("[^a-zA-Z0-9_@.-]", "_");
```

#### ✅ 正确示例
```java
// 使用统一的工具方法
String safeUserId = UserContextUtil.sanitizeUserId(userId);
```

---

## 📚 项目中的核心工具类

### UserContextUtil

**用途：** 用户上下文管理和用户ID处理

**核心方法：**

1. **`getCurrentUserId()`** - 获取当前登录用户ID
2. **`sanitizeUserId(String userId)`** - 清理用户ID中的非法字符
3. **`getUserDataPath()`** - 获取用户数据目录路径
4. **`getSafeUserDataPath()`** - 获取安全的用户数据路径

**使用场景：**
- ✅ 任何需要处理用户ID的地方
- ✅ 任何需要创建用户专属文件/目录的地方
- ✅ 任何需要隔离用户数据的地方

**禁止行为：**
- ❌ 自己写正则表达式清理用户ID
- ❌ 硬编码用户数据路径
- ❌ 直接使用 `getCurrentUserId()` 作为文件名（必须先 `sanitizeUserId()`）

---

## 🔒 必须遵守的规则

### 规则1：用户ID处理

```java
// ❌ 禁止
String userId = UserContextUtil.getCurrentUserId();
String path = "user_data/" + userId + "/config.json";  // 错误！@等字符会导致路径问题

// ✅ 正确
String userId = UserContextUtil.getCurrentUserId();
String safeUserId = UserContextUtil.sanitizeUserId(userId);
String path = "user_data/" + safeUserId + "/config.json";

// ✅ 更好：使用封装好的方法
String path = UserContextUtil.getSafeUserDataPath() + "/config.json";
```

### 规则2：配置保存

```java
// ❌ 禁止：直接覆盖
void saveConfig(Map<String, Object> newConfig) {
    writeToFile(newConfig);  // 会丢失其他字段！
}

// ✅ 正确：合并后保存
void saveConfig(Map<String, Object> newConfig) {
    Map<String, Object> existing = loadConfig();
    existing.putAll(newConfig);  // 保留未修改的字段
    writeToFile(existing);
}
```

### 规则3：文件路径

```java
// ❌ 禁止：硬编码
String configPath = "user_data/luwenrong123_sina_com/config.json";

// ✅ 正确：使用工具方法
String userId = UserContextUtil.getCurrentUserId();
String safeUserId = UserContextUtil.sanitizeUserId(userId);
String configPath = "user_data/" + safeUserId + "/config.json";
```

---

## 🧪 强制单元测试

### 测试覆盖要求

**所有涉及用户数据的方法必须包含以下测试：**

1. **路径安全性测试**
```java
@Test
public void testUserIdSanitization() {
    assertEquals("test_example_com", UserContextUtil.sanitizeUserId("test@example.com"));
    assertEquals("test_user", UserContextUtil.sanitizeUserId("test@user"));
    assertEquals("test_123", UserContextUtil.sanitizeUserId("test@123"));
}
```

2. **配置持久化测试**
```java
@Test
public void testConfigMerge() {
    Map<String, Object> existing = Map.of("a", 1, "b", 2);
    Map<String, Object> update = Map.of("b", 3, "c", 4);

    Map<String, Object> result = merge(existing, update);

    assertEquals(1, result.get("a"));  // 保留
    assertEquals(3, result.get("b"));  // 更新
    assertEquals(4, result.get("c"));  // 新增
}
```

3. **路径一致性测试**
```java
@Test
public void testPathConsistency() {
    String userId = "test@example.com";
    String path1 = getUserConfigPath(userId);
    String path2 = getUserConfigPath(userId);

    assertEquals(path1, path2);  // 多次调用必须一致
    assertTrue(new File(path1).exists());  // 路径必须有效
}
```

---

## 📋 Code Review检查清单

**在提交PR前，必须检查：**

- [ ] 是否有重复实现已有工具方法？
- [ ] 用户ID是否经过 `sanitizeUserId()` 处理？
- [ ] 配置保存是否使用了合并模式？
- [ ] 文件路径是否硬编码？
- [ ] 是否添加了单元测试？
- [ ] 日志是否足够详细？

---

## 🔧 IDE配置

### IntelliJ IDEA 检查规则

**File → Settings → Editor → Inspections**

启用以下检查：
- ✅ Duplicated code fragments
- ✅ Magic number
- ✅ Hardcoded file separator
- ✅ String concatenation in loop

### SonarLint规则

**添加自定义规则：**
```xml
<rule>
  <key>avoid-user-id-regex</key>
  <name>Avoid manual user ID sanitization</name>
  <description>Use UserContextUtil.sanitizeUserId() instead</description>
  <pattern>userId\.replaceAll\(</pattern>
</rule>
```

---

## 📖 文档要求

**每个工具方法必须包含：**

```java
/**
 * 清理用户ID中的非法字符，确保文件系统安全
 *
 * <p>规则：
 * - 只保留字母、数字、下划线、横杠
 * - 所有其他字符（包括@、.、/等）替换为下划线
 *
 * <p>示例：
 * <pre>
 * sanitizeUserId("user@example.com") → "user_example_com"
 * sanitizeUserId("test.user@domain") → "test_user_domain"
 * </pre>
 *
 * @param userId 原始用户ID
 * @return 清理后的安全用户ID
 * @throws IllegalArgumentException 如果用户ID为空
 * @see #getSafeUserDataPath() 获取安全的用户数据路径
 */
public static String sanitizeUserId(String userId) {
    // ...
}
```

---

## 🚀 自动化检查

### Git Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# 检查是否有重复的用户ID处理逻辑
if git diff --cached | grep -E 'userId\.replaceAll\(' > /dev/null; then
    echo "❌ 检测到手动处理用户ID，请使用 UserContextUtil.sanitizeUserId()"
    echo "   参考文档: docs/CODING_STANDARDS.md"
    exit 1
fi

# 检查是否有硬编码路径
if git diff --cached | grep -E '"user_data/[^"]+/config\.json"' > /dev/null; then
    echo "❌ 检测到硬编码用户数据路径"
    exit 1
fi

echo "✅ 代码检查通过"
```

---

## 📊 监控和审计

### 定期检查

**每周执行：**
```bash
# 查找重复的用户ID处理逻辑
grep -r "userId.replaceAll" backend/get_jobs/src/ --exclude-dir=util

# 查找硬编码路径
grep -r '"user_data/' backend/get_jobs/src/ | grep -v UserContextUtil
```

**发现问题时：**
1. 立即修复
2. 添加测试用例
3. 更新文档
4. Code Review复盘

---

## 🎯 记住

> **"如果已经有工具方法，就用它；如果没有，就创建一个通用的工具方法。"**

**永远不要：**
- ❌ 复制粘贴代码
- ❌ 重复造轮子
- ❌ 硬编码魔法数字/字符串
- ❌ 跳过单元测试

**永远要：**
- ✅ 使用已有工具方法
- ✅ 编写可复用代码
- ✅ 添加详细注释
- ✅ 编写单元测试

---

最后修改时间：2025-11-04
维护者：开发团队

