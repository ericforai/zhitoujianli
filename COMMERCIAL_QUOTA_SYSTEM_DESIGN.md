# 智投简历平台商业化配额管理系统设计

## 📋 系统概述

智投简历是个人求职平台，为求职者提供智能简历生成、求职投递、AI打招呼等服务。本文档详细描述了平台的商业化配额管理系统设计。

## 🏗️ 整体架构

### 用户层级系统
```
智投简历平台
├── 超级管理员 (Super Admin)
│   └── 拥有最高权限，可创建/管理平台管理员
├── 平台管理员 (Platform Admin)  
│   └── 管理平台设置、用户套餐、配额规则等
└── 个人用户 (Individual Users)
    ├── 免费版 (Free Tier)
    ├── 基础版 (Basic Plan)
    ├── 专业版 (Professional Plan)
    └── 旗舰版 (Enterprise Plan)
```

## 🎯 详细配额管理设计

### 1. 简历相关配额
| 功能 | 免费版 | 基础版 | 专业版 | 旗舰版 |
|------|--------|--------|--------|--------|
| 简历模板数量 | 3 | 10 | 50 | 无限 |
| 可创建简历数量 | 1 | 5 | 20 | 100 |
| 简历导出次数/月 | 5 | 50 | 200 | 1000 |
| 简历模板自定义 | ❌ | ✅ | ✅ | ✅ |
| 高级简历分析 | ❌ | ❌ | ✅ | ✅ |

### 2. AI服务配额
| 功能 | 免费版 | 基础版 | 专业版 | 旗舰版 |
|------|--------|--------|--------|--------|
| AI简历优化次数/月 | 3 | 20 | 100 | 500 |
| AI打招呼生成次数/月 | 5 | 50 | 200 | 1000 |
| AI面试问答练习/月 | 0 | 10 | 50 | 200 |
| AI职位匹配分析/月 | 3 | 20 | 100 | 500 |
| 自定义AI提示词 | ❌ | ❌ | ✅ | ✅ |

### 3. 求职投递配额
| 功能 | 免费版 | 基础版 | 专业版 | 旗舰版 |
|------|--------|--------|--------|--------|
| 自动投递次数/日 | 0 | 5 | 20 | 100 |
| 智能投递匹配 | ❌ | ✅ | ✅ | ✅ |
| 投递进度跟踪 | 基础 | 详细 | 高级 | 专业 |
| 批量投递 | ❌ | ❌ | ✅ | ✅ |
| 投递数据分析 | ❌ | 基础 | 详细 | 专业 |

### 4. 存储和数据配额
| 功能 | 免费版 | 基础版 | 专业版 | 旗舰版 |
|------|--------|--------|--------|--------|
| 存储空间 | 100MB | 1GB | 5GB | 20GB |
| 简历版本历史 | 3个版本 | 10个版本 | 50个版本 | 无限 |
| 文件上传大小限制 | 5MB | 20MB | 50MB | 100MB |
| 数据导出 | JSON | JSON+PDF | 全格式 | 全格式+API |

### 5. 高级功能配额
| 功能 | 免费版 | 基础版 | 专业版 | 旗舰版 |
|------|--------|--------|--------|--------|
| 求职日历管理 | ❌ | ✅ | ✅ | ✅ |
| 面试提醒设置 | ❌ | 基础 | 高级 | 专业 |
| 求职进度统计 | ❌ | 基础 | 详细 | 专业分析 |
| 简历SEO优化 | ❌ | ❌ | ✅ | ✅ |
| 个人品牌建设 | ❌ | ❌ | ❌ | ✅ |

## 🔧 技术实现架构

### 数据库设计

```sql
-- 用户套餐表
CREATE TABLE user_plans (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(100) NOT NULL,
    plan_type ENUM('free', 'basic', 'professional', 'enterprise') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 配额定义表
CREATE TABLE quota_definitions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    quota_key VARCHAR(100) NOT NULL UNIQUE,
    quota_name VARCHAR(200) NOT NULL,
    quota_description TEXT,
    quota_category ENUM('resume', 'ai', 'delivery', 'storage', 'advanced') NOT NULL,
    unit_type ENUM('count', 'size', 'duration') NOT NULL,
    reset_period ENUM('daily', 'weekly', 'monthly', 'yearly', 'never') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 套餐配额配置表
CREATE TABLE plan_quota_configs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    plan_type ENUM('free', 'basic', 'professional', 'enterprise') NOT NULL,
    quota_id BIGINT NOT NULL,
    quota_limit BIGINT NOT NULL,
    is_unlimited BOOLEAN DEFAULT FALSE,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quota_id) REFERENCES quota_definitions(id)
);

-- 用户配额使用记录表
CREATE TABLE user_quota_usage (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(100) NOT NULL,
    quota_id BIGINT NOT NULL,
    used_amount BIGINT DEFAULT 0,
    reset_date DATE NOT NULL,
    last_reset_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (quota_id) REFERENCES quota_definitions(id),
    UNIQUE KEY unique_user_quota_period (user_id, quota_id, reset_date)
);

-- 管理员账户表
CREATE TABLE admin_users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(100) NOT NULL UNIQUE,
    admin_type ENUM('super_admin', 'platform_admin') NOT NULL,
    permissions JSON NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 平台配置表
CREATE TABLE platform_configs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value JSON NOT NULL,
    config_description TEXT,
    config_category ENUM('quota', 'pricing', 'feature', 'system') NOT NULL,
    updated_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Java实体类设计

```java
// 用户套餐枚举
public enum PlanType {
    FREE("免费版"),
    BASIC("基础版"), 
    PROFESSIONAL("专业版"),
    ENTERPRISE("旗舰版");
    
    private final String displayName;
    
    PlanType(String displayName) {
        this.displayName = displayName;
    }
}

// 配额类别枚举
public enum QuotaCategory {
    RESUME("简历相关"),
    AI("AI服务"),
    DELIVERY("投递功能"),
    STORAGE("存储数据"),
    ADVANCED("高级功能");
    
    private final String displayName;
}

// 配额重置周期枚举
public enum ResetPeriod {
    DAILY("每日"), 
    WEEKLY("每周"),
    MONTHLY("每月"),
    YEARLY("每年"),
    NEVER("永不重置");
    
    private final String displayName;
}
```

## 🎮 管理员控制台功能

### 1. 超级管理员功能
- ✅ 创建/管理平台管理员账户
- ✅ 查看平台整体数据统计
- ✅ 系统配置管理
- ✅ 审计日志查看
- ✅ 紧急权限控制

### 2. 平台管理员功能
- ✅ 用户管理 (查看、搜索、操作用户)
- ✅ 套餐管理 (创建、修改、删除套餐)
- ✅ 配额管理 (设置各项配额限制)
- ✅ 数据统计 (用户使用情况、收入统计)
- ✅ 运营分析 (用户行为、功能使用率)

### 3. 控制台界面设计 (类似OSS)
```
智投简历管理控制台
├── 仪表板 (Dashboard)
│   ├── 关键指标总览
│   ├── 实时用户统计  
│   └── 收入趋势图
├── 用户管理 (User Management)
│   ├── 用户列表与搜索
│   ├── 用户详情与操作
│   └── 用户标签管理
├── 套餐管理 (Plan Management)
│   ├── 套餐配置
│   ├── 价格设置
│   └── 功能权限配置
├── 配额管理 (Quota Management)
│   ├── 配额规则设置
│   ├── 使用情况监控
│   └── 超限处理策略
├── 数据统计 (Analytics)
│   ├── 用户行为分析
│   ├── 功能使用统计
│   └── 收入报表
└── 系统设置 (System Settings)
    ├── 平台配置
    ├── 管理员管理
    └── 审计日志
```

## 📊 配额监控和限制策略

### 1. 实时配额检查
```java
public class QuotaService {
    
    public boolean checkQuotaLimit(String userId, String quotaKey, long requestAmount) {
        UserPlan userPlan = getUserCurrentPlan(userId);
        QuotaDefinition quota = getQuotaDefinition(quotaKey);
        long currentUsage = getCurrentUsage(userId, quotaKey);
        long limit = getPlanQuotaLimit(userPlan.getPlanType(), quotaKey);
        
        return (currentUsage + requestAmount) <= limit;
    }
    
    public void consumeQuota(String userId, String quotaKey, long amount) {
        if (!checkQuotaLimit(userId, quotaKey, amount)) {
            throw new QuotaExceededException("配额已用完，请升级套餐");
        }
        updateUsage(userId, quotaKey, amount);
    }
}
```

### 2. 配额重置机制
- ⏰ 定时任务自动重置周期性配额
- 🔄 支持手动重置特定用户配额  
- 📈 配额使用趋势预测和预警

### 3. 超限处理策略
- 🚫 硬限制：直接拒绝超限请求
- ⚠️ 软限制：警告但允许少量超限
- 📧 通知机制：接近限制时邮件提醒
- 💰 自动升级：提供套餐升级选项

## 💰 商业化方案建议

### 定价策略
- **免费版**: 永久免费，功能限制较多
- **基础版**: ¥29/月，适合轻度求职用户
- **专业版**: ¥99/月，适合活跃求职用户  
- **旗舰版**: ¥299/月，适合高频求职用户

### 增值服务
- 🎯 一对一求职咨询
- 📝 专业简历代写服务
- 🤖 定制化AI服务
- 📊 深度数据分析报告

## 🔐 权限和安全

### 管理员权限控制
```json
{
  "super_admin": {
    "user_management": ["create", "read", "update", "delete"],
    "admin_management": ["create", "read", "update", "delete"],
    "system_config": ["read", "update"],
    "audit_logs": ["read"]
  },
  "platform_admin": {
    "user_management": ["read", "update"],
    "quota_management": ["create", "read", "update"],
    "plan_management": ["create", "read", "update"],
    "analytics": ["read"]
  }
}
```

### 安全措施
- 🔐 管理员操作日志记录
- 🛡️ 敏感操作二次确认
- 🔑 API访问频率限制
- 📱 多因素身份验证

## 📈 监控和分析

### 核心指标
- 👥 活跃用户数 (DAU/MAU)
- 💵 用户转化率
- 📊 功能使用率
- 💰 平均收入单价 (ARPU)
- 🔄 用户留存率

### 报表系统
- 📈 实时数据仪表板
- 📊 周/月/年报表自动生成
- 📧 关键指标异常告警
- 💹 收入趋势分析

---

## 🚀 实施计划

1. **第一阶段**: 基础配额管理系统
2. **第二阶段**: 管理员控制台开发
3. **第三阶段**: 高级分析和监控系统
4. **第四阶段**: 商业化功能完善

这个设计为智投简历平台提供了完整的商业化基础设施，支持灵活的套餐配置和精细化的配额管理。