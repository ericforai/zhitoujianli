# Boss扫码登录核心规则

**版本：** v3.1.0 ✅ 已验证
**更新：** 2025-11-10

---

## ⚠️ 绝对禁止

```java
// ❌ 禁止禁用JavaScript和图片
"--disable-javascript"  // Boss登录页依赖JS设置Cookie
"--disable-images"      // 二维码无法显示

// ❌ 禁止用"找不到元素"判断登录成功
if (qrcode.count() == 0) {
    login = true;  // 错误！可能是选择器失效
}

// ❌ 禁止改变已验证的登录流程
PlaywrightUtil.init(useHeadless);  // 错误！破坏原始时序
```

---

## ✅ 必须遵守

### 1. 保持原始登录流程
```java
PlaywrightUtil.init();        // 先无头模式
login() {
    if (needLogin) {
        switchToHeaded();      // 需要时切换
    }
}
```

### 2. 只信任wt2 Cookie
```java
boolean hasWt2 = cookies.stream()
    .anyMatch(c -> c.name.equals("wt2") && c.value.length() > 10);
if (hasWt2) {
    login = true;  // 唯一可靠的登录标志
}
```

### 3. Context级反检测
```java
DESKTOP_CONTEXT = BROWSER.newContext(...);
DESKTOP_CONTEXT.addInitScript(stealthScript);  // 在创建页面前
DESKTOP_PAGE = DESKTOP_CONTEXT.newPage();
```

### 4. 默认关闭自动投递
```java
private Boolean enableAutoDelivery = false;  // 投递权在用户
```

### 5. 3分钟超时清理
```java
if (ageMinutes >= 3) {  // 快速清理，避免用户等待
    status.delete();
}
```

---

## 🔍 成功标志

```
Cookie数量: 9 → 13+
✅ 检测到关键Session Cookie (wt2)
✅ 登录状态已更新为success
✅ Cookie已保存到文件
```

---

---

## 🐛 Playwright崩溃修复（v3.1.1）

**问题：** 投递进行到一半时崩溃
```
Error: Cannot find module './../../../package.json'
退出码: 143
```

**修复：**
```java
// 设置固定工作目录，避免/tmp清理
String playwrightWorkDir = "/opt/zhitoujianli/backend/.playwright-cache";
new File(playwrightWorkDir).mkdirs();
pb.environment().put("PLAYWRIGHT_NODEJS_PATH", playwrightWorkDir);
```

---

**最后更新：** 2025-11-11
**验证用户：** luwenrong123@sina.com, 285366268@qq.com


