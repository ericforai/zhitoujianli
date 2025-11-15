# 智投简历账户体系与功能限制系统使用指南

## 📋 系统概述

本系统实现了完整的账户权限管理和功能限制机制，支持三个版本的套餐：
- **求职入门版（FREE）**：适合应届生
- **高效求职版（BASIC）**：适合在职求职者
- **极速上岸版（PROFESSIONAL）**：适合急找工作者

---

## 🎯 版本功能对比

### 权限规则表

| 功能 | 入门版（免费） | 高效版（¥49/月） | 极速版（¥99/月） |
|------|--------------|----------------|----------------|
| 简历基础优化 | 1次（总次数） | 不限次 | 不限次 |
| 简历高级优化 | ❌ 不支持 | 1次（总次数） | 3次（总次数） |
| 每日投递次数 | 5次/天 | 30次/天 | 100次/天 |
| 岗位匹配 | 基础匹配 | 基础匹配 | 基础匹配 |
| 打招呼语生成 | ✅ | ✅ | ✅ |
| 数据分析 | 基础 | 详细 | 深度 |
| 客服支持 | 社区 | 邮件 | 优先 |

### 配额重置规则

- **简历基础优化**：总次数限制，不重置
- **简历高级优化**：总次数限制，不重置
- **每日投递次数**：每日0点重置

---

## 🏗️ 技术架构

### 后端架构

#### 1. 数据模型

**PlanType枚举**
```java
public enum PlanType {
    FREE("求职入门版", 0),
    BASIC("高效求职版", 49),
    PROFESSIONAL("极速上岸版", 99);
}
```

**配额定义**
- `resume_basic_optimize` - 简历基础优化
- `resume_advanced_optimize` - 简历高级优化
- `daily_job_application` - 每日投递次数

**配额配置**
```java
// 入门版（FREE）
resume_basic_optimize: 1次（总次数，不重置）
resume_advanced_optimize: 0次（不支持）
daily_job_application: 5次（每日重置）

// 高效版（BASIC）
resume_basic_optimize: 无限次
resume_advanced_optimize: 1次（总次数，不重置）
daily_job_application: 30次（每日重置）

// 极速版（PROFESSIONAL）
resume_basic_optimize: 无限次
resume_advanced_optimize: 3次（总次数，不重置）
daily_job_application: 100次（每日重置）
```

#### 2. 权限检查注解

**使用示例**：
```java
@CheckPlanPermission(
    requiredPlans = {PlanType.BASIC, PlanType.PROFESSIONAL},
    quotaKey = "resume_advanced_optimize",
    amount = 1,
    message = "高级简历优化功能需要高效版或极速版套餐"
)
public void advancedOptimize() {
    // 方法实现
}
```

#### 3. API接口

**获取套餐信息**
```http
GET /api/user/plan/current
Authorization: Bearer {token}

Response:
{
  "success": true,
  "planType": "FREE",
  "planName": "求职入门版",
  "monthlyPrice": 0,
  "startDate": "2025-01-01",
  "endDate": null,
  "status": "ACTIVE",
  "isValid": true,
  "isExpiringSoon": false
}
```

**获取配额使用情况**
```http
GET /api/user/plan/quota
Authorization: Bearer {token}

Response:
{
  "success": true,
  "planType": "FREE",
  "planName": "求职入门版",
  "quotaDetails": [
    {
      "quotaKey": "resume_basic_optimize",
      "quotaName": "简历基础优化",
      "category": "RESUME",
      "used": 0,
      "limit": 1,
      "unlimited": false,
      "resetPeriod": "NEVER",
      "nextResetDate": null
    },
    {
      "quotaKey": "daily_job_application",
      "quotaName": "每日投递次数",
      "category": "DELIVERY",
      "used": 3,
      "limit": 5,
      "unlimited": false,
      "resetPeriod": "DAILY",
      "nextResetDate": "2025-11-14"
    }
  ],
  "quickAccess": {
    "resume_basic_optimize": {
      "used": 0,
      "limit": 1,
      "unlimited": false
    },
    "daily_job_application": {
      "used": 3,
      "limit": 5,
      "unlimited": false
    }
  }
}
```

**升级套餐**
```http
POST /api/user/plan/upgrade
Authorization: Bearer {token}
Content-Type: application/json

{
  "targetPlan": "BASIC"
}

Response:
{
  "success": true,
  "message": "套餐升级成功",
  "planType": "BASIC",
  "planName": "高效求职版"
}
```

---

### 前端架构

#### 1. PlanContext使用

**在组件中使用**：
```typescript
import { usePlan } from '../contexts/PlanContext';

const MyComponent = () => {
  const { userPlan, quotaUsage, hasPermission, upgradePlan } = usePlan();

  // 检查权限
  const canOptimize = hasPermission('resume_basic_optimize', 1);

  // 升级套餐
  const handleUpgrade = async () => {
    await upgradePlan(PlanType.BASIC);
  };

  return (
    <div>
      <p>当前套餐：{userPlan?.planName}</p>
      {canOptimize ? (
        <button onClick={handleOptimize}>优化简历</button>
      ) : (
        <button onClick={handleUpgrade}>升级解锁</button>
      )}
    </div>
  );
};
```

#### 2. PlanGuard组件使用

**根据套餐显示内容**：
```typescript
<PlanGuard
  requiredPlan={PlanType.BASIC}
  fallback={<UpgradePrompt featureName="高级优化" />}
>
  <AdvancedOptimizeButton />
</PlanGuard>
```

**根据配额显示内容**：
```typescript
<PlanGuard
  quotaKey="resume_advanced_optimize"
  fallback={<UpgradePrompt featureName="高级优化" quotaKey="resume_advanced_optimize" />}
>
  <AdvancedOptimizeButton />
</PlanGuard>
```

#### 3. usePlanPermission Hook使用

```typescript
import { usePlanPermission } from '../hooks/usePlanPermission';

const MyComponent = () => {
  const {
    canUseBasicOptimize,
    canUseAdvancedOptimize,
    canSubmitJob,
    getQuotaInfo,
    getRemainingQuota,
  } = usePlanPermission();

  const basicOptimizeQuota = getQuotaInfo('resume_basic_optimize');
  const remaining = getRemainingQuota('daily_job_application');

  return (
    <div>
      <p>剩余投递次数：{remaining === 'unlimited' ? '无限' : remaining}</p>
      <button disabled={!canSubmitJob()}>投递</button>
    </div>
  );
};
```

---

## 📱 页面路由

### 定价页面 - /pricing
- 展示三个版本的功能对比
- 根据用户类型推荐合适的套餐
- 显示当前套餐标识（已登录用户）
- 提供升级/购买入口

### 场景页面 - /scenes
- **应届生场景**：推荐求职入门版
- **在职求职者场景**：推荐高效求职版
- **急找工作者场景**：推荐极速上岸版
- 完整功能对比表格

### 用户仪表盘 - /dashboard
- 显示当前套餐信息
- 显示配额使用情况（进度条）
- 显示投递统计数据
- 提供升级入口

---

## 🔧 开发指南

### 后端开发

#### 1. 添加配额检查

在需要检查权限的方法上添加注解：
```java
@CheckPlanPermission(
    requiredPlans = {PlanType.BASIC}, // 可选，指定需要的套餐类型
    quotaKey = "resume_advanced_optimize",
    amount = 1,
    checkBefore = true,
    message = "高级优化功能需要高效版或以上套餐"
)
public void myMethod() {
    // 方法实现
}
```

#### 2. 手动检查权限

```java
@Autowired
private PlanPermissionService planPermissionService;

public void myMethod(String userId) {
    // 检查套餐类型
    PlanType planType = planPermissionService.getUserPlanType(userId);

    // 检查配额
    boolean hasPermission = planPermissionService.hasPermission(userId, "daily_job_application", 1);

    if (!hasPermission) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "配额不足");
    }

    // 消费配额
    planPermissionService.consumeQuota(userId, "daily_job_application", 1);
}
```

### 前端开发

#### 1. 在组件中检查权限

```typescript
const MyComponent = () => {
  const { hasPermission, canUseBasicOptimize } = usePlanPermission();

  const handleOptimize = async () => {
    if (!canUseBasicOptimize()) {
      alert('配额不足，请升级套餐');
      return;
    }

    // 执行优化逻辑
  };

  return <button onClick={handleOptimize}>优化简历</button>;
};
```

#### 2. 使用PlanGuard保护功能

```typescript
<PlanGuard
  quotaKey="resume_advanced_optimize"
  fallback={
    <div className="text-center p-4">
      <p>高级优化功能需要高效版或以上套餐</p>
      <button onClick={() => navigate('/pricing')}>立即升级</button>
    </div>
  }
>
  <AdvancedOptimizePanel />
</PlanGuard>
```

---

## 📊 用户转化路径

### 路径1：体验版 → 高效版

**触发时机**：
- 基础优化次数用完（1次后）
- 每日投递次数用完（5次后）
- 需要使用高级优化功能时

**转化策略**：
- 显示剩余配额提示
- 展示高效版优势（不限基础优化、30次/天投递）
- 提供升级按钮

**触发流程**：
1. 用户使用完1次基础优化
2. 系统显示"配额已用完"提示
3. 显示"升级到高效版，解锁不限次基础优化"
4. 用户点击"立即升级"
5. 跳转到/pricing页面
6. 用户选择高效版并完成支付

### 路径2：高效版 → 极速版

**触发时机**：
- 每日投递超过30次
- 高级优化次数用完（1次后）
- 需要更高的投递频率

**转化策略**：
- 显示剩余配额提示
- 展示极速版优势（100次/天投递、3次高级优化）
- 提供升级按钮

---

## 🧪 测试场景

### 测试1：免费用户配额限制

1. 使用免费账号登录
2. 进入Dashboard，查看配额显示
3. 使用1次基础优化后，再次尝试使用
4. 应显示"配额已用完"提示
5. 投递5次后，再次尝试投递
6. 应显示"今日投递次数已用完"提示

### 测试2：高效版用户权限

1. 升级到高效版
2. 验证基础优化不限次
3. 使用1次高级优化后，再次尝试使用
4. 应显示"高级优化配额已用完"提示
5. 验证每日可投递30次

### 测试3：极速版用户权限

1. 升级到极速版
2. 验证基础优化不限次
3. 验证可使用3次高级优化
4. 验证每日可投递100次

### 测试4：配额重置

1. 等待次日0点
2. 验证每日投递次数重置
3. 验证基础优化和高级优化次数不重置

---

## 🔐 安全机制

### 前后端双重验证

1. **前端检查**：使用PlanGuard和hasPermission，提供友好的用户体验
2. **后端验证**：使用@CheckPlanPermission注解，确保安全性
3. **配额消费**：后端自动消费配额，防止重复使用

### 防刷机制

1. **每日限额**：不同版本有不同的每日投递限额
2. **总次数限制**：基础优化和高级优化有总次数限制
3. **AOP拦截**：使用切面编程自动拦截未授权访问

---

## 📝 常见问题

### Q1: 如何升级套餐？
A: 访问/pricing页面，选择目标套餐，点击"立即升级"按钮。

### Q2: 升级后配额何时生效？
A: 升级后立即生效，配额会根据新套餐重新计算。

### Q3: 配额用完后如何恢复？
A:
- 每日投递次数：每天0点自动重置
- 基础优化和高级优化：需要升级到更高版本或购买额外配额

### Q4: 如何查看剩余配额？
A:
- 在Dashboard页面查看QuotaDisplay组件
- 使用usePlanPermission hook获取配额信息

### Q5: 配额检查失败怎么办？
A:
- 前端会显示友好的错误提示
- 后端会返回403错误和具体的错误消息
- 可以点击"升级套餐"按钮进行升级

---

## 🚀 快速开始

### 用户体验流程

1. **新用户注册**
   - 访问https://zhitoujianli.com
   - 点击"免费使用"
   - 注册账号（邮箱或手机号）
   - 自动获得求职入门版（免费）

2. **使用基础功能**
   - 上传简历
   - 使用1次基础优化
   - 每日投递5次职位
   - 查看基础数据分析

3. **配额用完后**
   - 系统显示"配额已用完"提示
   - 点击"升级套餐"
   - 选择高效版或极速版
   - 完成支付（TODO）
   - 立即享受更多配额

4. **查看使用情况**
   - 访问/dashboard
   - 查看QuotaDisplay组件
   - 实时查看配额使用进度

---

## 🛠️ 维护指南

### 添加新配额类型

1. 在`QuotaInitializer.java`中添加配额定义
2. 在三个套餐配置方法中添加对应配额限制
3. 在前端`planService.ts`中添加配额键常量
4. 在需要的地方添加权限检查

### 修改配额限额

1. 修改`QuotaInitializer.java`中对应套餐的配额配置
2. 重启后端服务
3. 前端自动同步新配额限制

### 添加新套餐类型

1. 在`PlanType.java`中添加新枚举值
2. 在`QuotaInitializer.java`中添加新套餐的配额配置
3. 在前端`planService.ts`中添加新套餐类型
4. 更新Pricing组件展示新套餐

---

## ✅ 已完成功能清单

- ✅ 后端：PlanType枚举更新（三个版本）
- ✅ 后端：配额定义创建（基础优化、高级优化、每日投递）
- ✅ 后端：套餐配额配置初始化
- ✅ 后端：CheckPlanPermission注解
- ✅ 后端：PlanPermissionAspect切面
- ✅ 后端：PlanPermissionService服务
- ✅ 后端：UserPlanController（套餐信息API）
- ✅ 后端：QuotaService更新（配额详情查询）
- ✅ 后端：投递功能配额检查集成
- ✅ 前端：planService.ts（API封装）
- ✅ 前端：PlanContext.tsx（状态管理）
- ✅ 前端：usePlanPermission.ts（权限Hook）
- ✅ 前端：PlanGuard.tsx（权限守卫组件）
- ✅ 前端：QuotaDisplay.tsx（配额显示组件）
- ✅ 前端：UpgradePrompt.tsx（升级提示组件）
- ✅ 前端：Pricing组件更新（显示当前套餐）
- ✅ 前端：ScenesPage页面（场景选择）
- ✅ 前端：Dashboard集成QuotaDisplay
- ✅ 前端：投递功能配额检查集成
- ✅ 前端：App.tsx路由配置

---

## 🔮 下一步计划

### 功能增强

1. **支付集成**
   - 集成支付宝/微信支付
   - 实现订单管理系统
   - 自动激活套餐

2. **优惠活动**
   - 新用户首月优惠
   - 年度订阅折扣
   - 推荐奖励系统

3. **数据分析**
   - 不同版本用户的使用情况统计
   - 转化率分析
   - 配额使用趋势分析

4. **用户体验优化**
   - 配额不足时的动画提示
   - 升级流程优化
   - 成功案例展示

---

## 📞 技术支持

如有问题，请联系：
- 邮箱：zhitoujianli@qq.com
- 技术文档：https://docs.zhitoujianli.com

---

**版本**：v1.0.0
**更新时间**：2025-11-13
**作者**：智投简历技术团队

