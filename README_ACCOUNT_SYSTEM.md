# 智投简历账户体系快速参考

## 🎯 三个版本，三类人群

| 版本 | 价格 | 适合人群 | 每日投递 | 基础优化 | 高级优化 |
|------|------|---------|---------|---------|---------|
| **求职入门版** | 免费 | 应届生 | 5次/天 | 1次总计 | ❌ |
| **高效求职版** | ¥49/月 | 在职求职者 | 30次/天 | 不限次 | 1次总计 |
| **极速上岸版** | ¥99/月 | 急找工作者 | 100次/天 | 不限次 | 3次总计 |

---

## 🚀 快速使用

### 前端权限检查
```typescript
import { usePlanPermission } from '../hooks/usePlanPermission';

const { canSubmitJob, canUseAdvancedOptimize, getRemainingQuota } = usePlanPermission();

// 检查是否可以投递
if (canSubmitJob()) {
  // 执行投递
}

// 获取剩余次数
const remaining = getRemainingQuota('daily_job_application');
```

### 前端权限守卫
```typescript
<PlanGuard
  quotaKey="resume_advanced_optimize"
  fallback={<UpgradePrompt featureName="高级优化" />}
>
  <AdvancedFeature />
</PlanGuard>
```

### 后端权限检查
```java
@CheckPlanPermission(
    quotaKey = "resume_advanced_optimize",
    amount = 1,
    message = "高级优化功能需要高效版或以上套餐"
)
public void advancedOptimize() {
    // 方法实现
}
```

---

## 📍 关键文件位置

### 后端
- `enums/PlanType.java` - 套餐类型定义
- `config/QuotaInitializer.java` - 配额初始化
- `annotation/CheckPlanPermission.java` - 权限检查注解
- `aspect/PlanPermissionAspect.java` - 权限检查切面
- `service/PlanPermissionService.java` - 权限检查服务
- `controller/UserPlanController.java` - 套餐信息API

### 前端
- `services/planService.ts` - 套餐服务API
- `contexts/PlanContext.tsx` - 套餐状态管理
- `hooks/usePlanPermission.ts` - 权限检查Hook
- `components/plan/PlanGuard.tsx` - 权限守卫组件
- `components/plan/QuotaDisplay.tsx` - 配额显示组件
- `pages/ScenesPage.tsx` - 场景选择页面
- `components/Pricing.tsx` - 定价页面

---

## 🔑 API端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/user/plan/current` | GET | 获取当前套餐信息 |
| `/api/user/plan/quota` | GET | 获取配额使用情况 |
| `/api/user/plan/upgrade` | POST | 升级套餐 |

---

## ⚡ 配额键定义

| 配额键 | 说明 | 重置周期 |
|--------|------|---------|
| `resume_basic_optimize` | 简历基础优化 | 不重置（总次数） |
| `resume_advanced_optimize` | 简历高级优化 | 不重置（总次数） |
| `daily_job_application` | 每日投递次数 | 每日0点重置 |

---

## 📱 用户页面路由

- `/pricing` - 定价页面（三个版本对比）
- `/scenes` - 场景选择页面（三类人群）
- `/dashboard` - 用户仪表盘（配额显示）

---

## ✅ 验证清单

### 部署后验证

- [ ] 访问/pricing，查看三个版本是否正确显示
- [ ] 访问/scenes，查看三个场景是否正确显示
- [ ] 登录后访问/dashboard，查看配额显示是否正常
- [ ] 免费用户使用1次基础优化后，再次尝试应显示配额不足
- [ ] 免费用户投递5次后，再次尝试应显示配额不足
- [ ] 升级到高效版后，配额应立即更新
- [ ] 配额使用情况应实时显示

### 前端验证

```bash
cd frontend
npm run lint  # 代码检查
npm run type-check  # 类型检查
npm test  # 运行测试
npm run build  # 构建验证
```

### 后端验证

```bash
cd backend/get_jobs
mvn checkstyle:check  # 代码风格检查
mvn test  # 运行测试
mvn clean package  # 构建验证
```

---

**快速参考版本：v1.0.0**
**更新时间：2025-11-13**

