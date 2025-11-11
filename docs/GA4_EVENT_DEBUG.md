# Google Analytics 4 事件调试指南

## 🔍 问题：找不到 sign_up 事件

这是正常的！如果还没有人注册，就不会有 `sign_up` 事件数据。

---

## ✅ 解决方案：测试注册功能触发事件

### 步骤1：清除浏览器缓存
按 `Ctrl + Shift + R`（Mac: `Cmd + Shift + R`）清除缓存

### 步骤2：访问带UTM参数的注册页面
```
https://zhitoujianli.com/register?utm_source=wechat&utm_medium=article&utm_campaign=launch_2025&utm_content=launch_article
```

### 步骤3：打开浏览器控制台（F12）
切换到"Console（控制台）"标签

### 步骤4：完成注册流程
1. 输入邮箱地址
2. 发送验证码
3. 输入验证码
4. 设置密码
5. 点击注册

### 步骤5：查看控制台日志
注册成功后，应该能看到：
```
✅ GA4转化事件已发送: sign_up {method: "email", utm_source: "wechat", ...}
```

如果看到这个日志，说明**事件已成功发送**！

---

## 📊 在Google Analytics中查看事件

### 方法1：实时报告（立即查看）

#### 步骤1：进入实时报告
1. 登录 Google Analytics
2. 左侧菜单：**报告** → **实时概览**

#### 步骤2：查看实时事件
1. 在实时报告中，向下滚动
2. 查找"事件"部分
3. 应该能看到 `sign_up` 事件（如果刚刚注册）

**注意：** 实时报告只显示最近30分钟的数据

---

### 方法2：事件报告（查看历史数据）

#### 步骤1：进入事件报告
1. 左侧菜单：**生命周期** → **互动度** → **事件**

#### 步骤2：查找 sign_up 事件
1. 在事件列表中查找 `sign_up`
2. 如果列表很长，可以使用搜索功能
3. 点击事件名称查看详细数据

#### 步骤3：如果找不到事件
**可能的原因：**
- ⏰ **数据延迟**：GA4有24-48小时的数据延迟
- 📊 **还没有数据**：如果还没有人注册，就不会有事件
- 🔍 **搜索位置不对**：确保在"事件"页面，不是在搜索框

**解决方法：**
1. 等待24-48小时后再查看
2. 或者先完成一次注册测试，然后在实时报告中查看

---

### 方法3：使用调试视图（推荐用于测试）

#### 步骤1：启用调试模式
1. 安装 [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) Chrome扩展
2. 或者在URL后添加 `?debug_mode=true`

#### 步骤2：查看调试报告
1. 左侧菜单：**管理** → **调试视图**
2. 可以看到实时的事件数据
3. 可以看到每个事件的详细参数

---

## 🔧 验证事件是否正确发送

### 方法1：浏览器控制台检查

#### 步骤1：打开控制台（F12）
切换到"Console（控制台）"标签

#### 步骤2：检查Google Analytics是否加载
在控制台输入：
```javascript
typeof gtag !== 'undefined' ? '✅ GA4已加载' : '❌ GA4未加载'
```

#### 步骤3：手动触发测试事件
在控制台输入：
```javascript
// 手动发送测试事件
if (typeof gtag !== 'undefined') {
  gtag('event', 'test_sign_up', {
    method: 'test',
    utm_source: 'test',
    utm_medium: 'test'
  });
  console.log('✅ 测试事件已发送');
} else {
  console.error('❌ GA4未加载');
}
```

#### 步骤4：在实时报告中查看
1. 进入 **报告** → **实时概览**
2. 查找 `test_sign_up` 事件
3. 如果能看到，说明GA4工作正常

---

### 方法2：使用Google Tag Assistant

#### 步骤1：安装Google Tag Assistant
1. 安装 [Google Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk) Chrome扩展

#### 步骤2：启用Tag Assistant
1. 点击浏览器工具栏中的Tag Assistant图标
2. 点击"Enable"
3. 刷新页面

#### 步骤3：完成注册
1. 访问注册页面
2. 完成注册流程

#### 步骤4：查看事件
1. 点击Tag Assistant图标
2. 可以看到所有发送到GA4的事件
3. 应该能看到 `sign_up` 事件

---

## 📊 查看UTM参数数据

### 方法1：在事件报告中查看参数

#### 步骤1：进入事件报告
1. **生命周期** → **互动度** → **事件**
2. 点击 `sign_up` 事件

#### 步骤2：查看事件参数
1. 在事件详情页面，查找"事件参数"
2. 可以看到：
   - `utm_source`
   - `utm_medium`
   - `utm_campaign`
   - `utm_content`
   - `method`

#### 步骤3：筛选特定UTM参数
1. 在事件参数中，点击 `utm_source`
2. 可以看到不同来源的注册数量
3. 例如：`wechat: 10次`, `zhihu: 5次`

---

### 方法2：创建自定义报告

#### 步骤1：创建探索报告
1. 左侧菜单：**探索**
2. 点击"+"创建新报告
3. 选择"空白"模板

#### 步骤2：添加维度
1. 在"维度"部分，点击"+"添加
2. 添加以下维度：
   - `事件名称`（Event name）
   - `来源/媒介`（Source / Medium）
   - `UTM来源`（UTM Source）
   - `UTM媒介`（UTM Medium）
   - `UTM活动`（UTM Campaign）
   - `UTM内容`（UTM Content）

#### 步骤3：添加指标
1. 在"指标"部分，点击"+"添加
2. 添加以下指标：
   - `事件数`（Event count）
   - `用户数`（Total users）
   - `转化率`（Conversion rate）

#### 步骤4：添加筛选器
1. 在"筛选器"部分，点击"+"添加
2. 筛选条件：
   - `事件名称` = `sign_up`

#### 步骤5：查看报告
现在可以看到：
- 每个UTM参数的注册数量
- 每个UTM参数的转化率
- 不同来源的对比数据

---

## 🎯 快速测试步骤

### 步骤1：测试注册功能
1. 访问：`https://zhitoujianli.com/register?utm_source=test&utm_medium=test&utm_campaign=test`
2. 完成注册流程
3. 打开控制台（F12），查看是否有日志

### 步骤2：查看实时报告
1. 登录 Google Analytics
2. **报告** → **实时概览**
3. 查找 `sign_up` 事件

### 步骤3：等待数据更新
- 实时报告：立即可见（最近30分钟）
- 事件报告：24-48小时延迟

---

## ❓ 常见问题

### Q1: 为什么找不到 sign_up 事件？
**A:** 可能的原因：
- 还没有人注册（最常见）
- 数据延迟（24-48小时）
- 事件名称不对（检查代码）

### Q2: 如何确认事件已发送？
**A:**
1. 打开控制台（F12）
2. 完成注册
3. 查看是否有 `✅ GA4转化事件已发送: sign_up` 日志

### Q3: 事件发送了但GA4中看不到？
**A:**
- 实时报告：立即可见
- 事件报告：需要等待24-48小时

### Q4: 如何测试事件？
**A:**
1. 使用浏览器控制台手动发送测试事件
2. 使用Google Tag Assistant查看
3. 在实时报告中验证

---

## 📝 总结

**如果找不到 sign_up 事件：**
1. ✅ 先完成一次注册测试
2. ✅ 在控制台查看是否有日志
3. ✅ 在实时报告中查看（立即可见）
4. ✅ 等待24-48小时后在事件报告中查看

**最重要的是：先测试注册功能，触发事件！**

