# 账户区分与配额限制机制说明

## ✅ 系统是否真的对不同账户做了区分？

**答案：是的！** 系统已经实现了完整的账户区分和配额限制机制。

---

## 🔐 账户区分的三个层次

### 层次1：套餐类型区分

系统根据用户套餐类型自动分配不同的权限：

| 套餐       | 后端枚举值     | 价格   | 适合人群   |
| ---------- | -------------- | ------ | ---------- |
| 求职入门版 | `FREE`         | 免费   | 应届生     |
| 高效求职版 | `BASIC`        | ¥49/月 | 在职求职者 |
| 极速上岸版 | `PROFESSIONAL` | ¥99/月 | 急找工作者 |

**数据库存储**：

```sql
-- user_plans表
CREATE TABLE user_plans (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,  -- 用户ID
    plan_type VARCHAR(50) NOT NULL,  -- FREE/BASIC/PROFESSIONAL
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) NOT NULL,     -- ACTIVE/EXPIRED/CANCELLED
    ...
);
```

---

### 层次2：配额限制区分

不同套餐有不同的配额限制：

| 功能         | FREE   | BASIC   | PROFESSIONAL |
| ------------ | ------ | ------- | ------------ |
| 简历基础优化 | 1次    | 不限    | 不限         |
| 简历高级优化 | ❌ 0次 | 1次     | 3次          |
| 每日投递次数 | 5次/天 | 30次/天 | 100次/天     |

**配额配置存储**：

```sql
-- plan_quota_configs表
CREATE TABLE plan_quota_configs (
    id BIGSERIAL PRIMARY KEY,
    plan_type VARCHAR(50) NOT NULL,  -- 套餐类型
    quota_id BIGINT NOT NULL,        -- 配额定义ID
    quota_limit BIGINT,              -- 限制数量
    is_unlimited BOOLEAN NOT NULL,   -- 是否无限
    is_enabled BOOLEAN NOT NULL,     -- 是否启用
    ...
);
```

**配额使用记录**：

```sql
-- user_quota_usage表
CREATE TABLE user_quota_usage (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,  -- 用户ID
    quota_id BIGINT NOT NULL,       -- 配额定义ID
    used_amount BIGINT NOT NULL,    -- 已使用数量
    reset_date DATE,                -- 重置日期
    ...
);
```

---

### 层次3：实时权限检查

**前端检查**（用户体验）：

```typescript
// 1. 使用Hook检查
const { canSubmitJob } = usePlanPermission();

if (!canSubmitJob()) {
  // 显示"配额不足，请升级"提示
  return;
}

// 2. 使用PlanGuard组件
<PlanGuard
  quotaKey="resume_advanced_optimize"
  fallback={<div>请升级到高效版解锁此功能</div>}
>
  <AdvancedFeature />
</PlanGuard>
```

**后端检查**（安全保证）：

```java
// 在方法上添加注解，自动检查权限
@CheckPlanPermission(
    quotaKey = "daily_job_application",
    amount = 1,
    message = "每日投递次数已用完，请升级套餐"
)
@PostMapping("/start-boss-task")
public ResponseEntity<Map<String, Object>> startBossTask() {
    // 方法实现
}
```

---

## 🎯 实际运行机制

### 场景1：免费用户尝试投递第6次

```
用户点击"启动投递"
  ↓
前端检查：canSubmitJob() → false
  ↓
显示提示："今日投递次数已用完（5/5），请明天再试或升级套餐"
  ↓
用户无法继续操作
```

**如果用户绕过前端检查（直接调用API）**：

```
用户调用 POST /api/delivery/start
  ↓
@CheckPlanPermission注解拦截
  ↓
PlanPermissionAspect检查配额
  ↓
发现配额不足（已用5次，限制5次）
  ↓
返回 403 Forbidden
  ↓
错误消息："每日投递次数已用完，请升级套餐"
```

### 场景2：免费用户尝试使用高级优化

```
用户点击"高级优化"
  ↓
PlanGuard组件检查
  ↓
quotaKey="resume_advanced_optimize"
  ↓
免费版配额为0次（isEnabled=false）
  ↓
显示fallback内容："高级优化需要高效版或极速版"
  ↓
用户看不到高级优化按钮/功能
```

### 场景3：高效版用户尝试使用第2次高级优化

```
用户点击"高级优化"
  ↓
后端检查配额
  ↓
已使用1次，限制1次
  ↓
返回403错误
  ↓
前端显示："高级优化配额已用完，请升级到极速版"
```

---

## 🔧 管理员如何手动升级用户套餐

### 方式一：通过管理员后台（推荐）

**操作步骤**：

1. 管理员登录：`admin@zhitoujianli.com`
2. 访问管理后台：https://zhitoujianli.com/admin/dashboard
3. 点击左侧菜单"用户管理"
4. 找到要升级的用户
5. 点击用户行的 **"升级套餐"** 按钮（蓝色）
6. 选择目标套餐（1-3）：
   - `1` = 求职入门版（免费）
   - `2` = 高效求职版（¥49/月）
   - `3` = 极速上岸版（¥99/月）
7. 确认升级
8. 系统立即生效，用户刷新页面后看到新配额

**后台API调用**：

```http
POST /api/admin/user-plans/{userId}/upgrade
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "targetPlan": "BASIC",
  "reason": "管理员手动升级"
}
```

### 方式二：通过数据库直接操作（不推荐）

```sql
-- 1. 取消用户当前套餐
UPDATE user_plans
SET status = 'CANCELLED', updated_at = NOW()
WHERE user_id = 'USER_ID_HERE' AND status = 'ACTIVE';

-- 2. 创建新套餐
INSERT INTO user_plans (
    user_id, plan_type, start_date, end_date,
    status, auto_renewal, purchase_price,
    created_at, updated_at
) VALUES (
    'USER_ID_HERE',      -- 用户ID
    'BASIC',             -- 套餐类型
    CURRENT_DATE,        -- 开始日期
    NULL,                -- 结束日期（NULL=永不过期）
    'ACTIVE',            -- 状态
    false,               -- 自动续费
    49,                  -- 价格
    NOW(),               -- 创建时间
    NOW()                -- 更新时间
);
```

---

## 📊 验证账户区分是否生效

### 测试步骤

#### 测试1：免费用户投递限制

1. 创建一个免费用户（或使用现有免费用户）
2. 登录该用户
3. 访问Dashboard：https://zhitoujianli.com/dashboard
4. 查看配额显示卡片：
   - 简历基础优化：0/1
   - 每日投递次数：0/5
5. 点击"启动投递"5次
6. 第6次点击应该显示："今日投递次数已用完"
7. ✅ **验证通过**：免费用户确实被限制在5次/天

#### 测试2：高效版用户权限

1. 管理员升级用户到高效版
2. 刷新页面，查看配额：
   - 简历基础优化：0/∞（无限）
   - 简历高级优化：0/1
   - 每日投递次数：0/30
3. 使用基础优化多次，应该不受限制
4. 使用1次高级优化后，第2次应该提示"配额已用完"
5. ✅ **验证通过**：高效版用户有正确的配额

#### 测试3：后端API安全性

1. 使用免费用户Token
2. 直接调用API（绕过前端）：

```bash
curl -X POST https://zhitoujianli.com/api/delivery/start \
  -H "Authorization: Bearer {免费用户token}" \
  -H "Content-Type: application/json"
```

3. 如果已经投递5次，应返回：

```json
{
  "error": "每日投递次数已用完，请升级套餐",
  "status": 403
}
```

4. ✅ **验证通过**：后端确实有权限检查

---

## 🛡️ 安全机制

### 前后端双重验证

**前端验证目的**：

- ✅ 提供友好的用户体验
- ✅ 减少不必要的API调用
- ✅ 即时反馈配额状态
- ❌ **不能作为安全防护**（可被绕过）

**后端验证目的**：

- ✅ 真正的安全防护
- ✅ 防止API滥用
- ✅ 确保商业逻辑正确
- ✅ **无法被绕过**

### 配额检查流程图

```
用户操作
  ↓
┌─────────────────┐
│  前端检查（UX） │
└────────┬────────┘
         │ 无权限
         ├────────→ 显示"升级提示"
         │ 有权限
         ↓
    调用后端API
         ↓
┌─────────────────┐
│ @CheckPlanPerm  │
│ 注解拦截        │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ 检查用户套餐    │
│ 检查配额余额    │
└────────┬────────┘
         │ 无权限
         ├────────→ 返回403错误
         │ 有权限
         ↓
    执行业务逻辑
         ↓
    消费配额（-1）
         ↓
    返回成功
```

---

## 📋 管理员升级用户套餐操作手册

### 前置条件

- ✅ 需要管理员账号登录
- ✅ 需要访问管理后台

### 操作步骤

**步骤1：登录管理后台**

```
1. 访问 https://zhitoujianli.com
2. 使用管理员账号登录: admin@zhitoujianli.com
3. 自动跳转到管理后台
```

**步骤2：进入用户管理**

```
1. 点击左侧菜单"用户管理"
2. 查看所有用户列表
3. 每个用户显示：
   - ID
   - 邮箱
   - 昵称
   - 套餐类型（FREE/BASIC/PROFESSIONAL）
   - 状态
   - 注册时间
   - 操作按钮
```

**步骤3：升级用户套餐**

```
1. 找到要升级的用户
2. 点击该用户行的"升级套餐"按钮（蓝色）
3. 弹出选择对话框：
   请选择目标套餐：

   1. 求职入门版（免费） ← 当前套餐
   2. 高效求职版（¥49/月）
   3. 极速上岸版（¥99/月）

   请输入数字（1-3）：

4. 输入数字，例如：2（升级到高效版）
5. 确认升级
6. 系统提示"套餐升级成功"
7. 用户列表自动刷新，显示新套餐类型
```

**步骤4：验证升级结果**

```
1. 刷新用户列表
2. 查看用户的套餐类型列是否已更新
3. 让用户登录并访问Dashboard
4. 用户应该看到新的配额：
   - 高效版：基础优化不限、高级优化1次、每日30次投递
```

---

## 🧪 测试案例

### 测试案例1：免费用户被正确限制

**测试用户**：test1@example.com（免费版）

**测试步骤**：

1. 登录test1@example.com
2. 访问/dashboard
3. 查看配额显示：
   - 简历基础优化：0/1
   - 每日投递：0/5
4. 使用1次基础优化
5. 再次尝试使用 → **应该显示"配额已用完"**
6. 投递5次职位
7. 第6次尝试投递 → **应该显示"今日投递次数已用完"**

**预期结果**：

- ✅ 基础优化限制生效
- ✅ 投递次数限制生效
- ✅ 前后端都拦截超额使用

---

### 测试案例2：管理员升级用户到高效版

**操作**：

1. 管理员登录admin@zhitoujianli.com
2. 访问 /admin/users
3. 找到test1@example.com用户
4. 点击"升级套餐"按钮
5. 选择"2"（高效求职版）
6. 确认升级

**验证**：

1. test1@example.com重新登录
2. 访问/dashboard
3. 查看配额显示：
   - 简历基础优化：0/∞（无限）
   - 简历高级优化：0/1
   - 每日投递：0/30

**预期结果**：

- ✅ 套餐成功升级
- ✅ 配额立即更新
- ✅ 用户可以使用更多功能

---

### 测试案例3：后端API安全性

**尝试绕过前端限制**：

```bash
# 使用免费用户Token，尝试投递第6次
curl -X POST https://zhitoujianli.com/api/delivery/start \
  -H "Authorization: Bearer {免费用户token}" \
  -H "Content-Type: application/json"
```

**预期结果**：

```json
{
  "timestamp": "2025-11-13T16:40:00",
  "status": 403,
  "error": "Forbidden",
  "message": "每日投递次数已用完，请明天再试或升级套餐"
}
```

**验证**：

- ✅ 后端检查生效
- ✅ 无法绕过限制
- ✅ 返回明确的错误消息

---

## 📈 配额重置机制

### 每日投递次数

- **重置时间**：每天00:00（服务器时间）
- **重置方式**：自动重置
- **重置后**：used_amount归零，用户可继续使用

### 基础优化和高级优化

- **重置时间**：永不重置（总次数限制）
- **如何恢复**：
  - 免费版：无法恢复，用完即止
  - 高效版/极速版：升级套餐时可能重置（取决于业务规则）

---

## 🎯 关键配置文件

### 后端配额配置

**文件**：`backend/get_jobs/src/main/java/config/QuotaInitializer.java`

```java
// 免费版配额
createFreePlanConfigs() {
    resume_basic_optimize: 1次（总次数）
    resume_advanced_optimize: 0次（不支持）
    daily_job_application: 5次（每日）
}

// 高效版配额
createBasicPlanConfigs() {
    resume_basic_optimize: 无限次
    resume_advanced_optimize: 1次（总次数）
    daily_job_application: 30次（每日）
}

// 极速版配额
createProfessionalPlanConfigs() {
    resume_basic_optimize: 无限次
    resume_advanced_optimize: 3次（总次数）
    daily_job_application: 100次（每日）
}
```

### 前端权限配置

**文件**：`frontend/src/hooks/usePlanPermission.ts`

提供权限检查方法：

- `canUseBasicOptimize()` - 是否可以使用基础优化
- `canUseAdvancedOptimize()` - 是否可以使用高级优化
- `canSubmitJob(count)` - 是否可以投递（指定次数）

---

## ✅ 总结：系统确实对账户做了严格区分

### 区分机制

1. ✅ **套餐类型存储**：user_plans表记录每个用户的套餐
2. ✅ **配额限制配置**：plan_quota_configs表定义不同套餐的配额
3. ✅ **使用量跟踪**：user_quota_usage表记录每个用户的使用情况
4. ✅ **前端权限检查**：PlanContext + usePlanPermission提供权限验证
5. ✅ **后端权限拦截**：@CheckPlanPermission注解 + AOP切面

### 安全性

1. ✅ **前后端双重验证**：用户无法绕过限制
2. ✅ **实时配额检查**：每次操作都检查配额
3. ✅ **自动配额消费**：操作成功后自动扣除配额
4. ✅ **配额重置机制**：每日自动重置投递次数

### 商业逻辑

1. ✅ **免费版有限制**：吸引用户但功能受限
2. ✅ **付费版有优势**：明确的价值差异
3. ✅ **升级由管理员控制**：防止免费升级漏洞
4. ✅ **客服处理流程**：用户联系客服 → 客服确认支付 → 管理员后台升级

---

**结论**：✅ 系统已完整实现账户区分机制，安全可靠！

---

**文档版本**：v1.0
**更新时间**：2025-11-13
