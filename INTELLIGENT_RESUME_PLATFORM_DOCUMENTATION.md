# 智投简历平台 - 商业化配额管理系统技术文档

## 系统概述

智投简历平台是一个个人求职平台，为求职者提供AI简历优化、投递管理等服务。本系统实现了三层访问权限控制和细分化的商业配额管理机制。

### 核心特性

- **三层访问权限控制**：首页公开访问、博客公开访问、后台管理需登录
- **细分配额管理**：13种配额类型，支持灵活的商业方案配置
- **管理员系统**：类似OSS的分级管理机制
- **用户级数据隔离**：确保用户数据安全和隐私
- **基于注解的配额检查**：简化业务代码，提高开发效率

## 架构设计

### 系统架构图

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   首页 (3000)   │    │   博客 (4321)   │    │ 后台管理 (8080) │
│   公开访问      │    │   公开访问      │    │   需要登录      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Authing 认证   │
                    │   JWT Token     │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Spring Boot    │
                    │   后端服务      │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   配额管理      │    │   用户管理      │    │   管理员系统    │
│     服务        │    │     服务        │    │     服务        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   MySQL 数据库  │
                    └─────────────────┘
```

### 技术栈

- **后端**: Spring Boot 2.7.x + Spring Security + Spring AOP
- **认证**: Authing V3 SDK + JWT Token
- **数据库**: MySQL 8.0+
- **前端**: React 18 + TypeScript + Vite
- **切面编程**: AspectJ

## 用户角色与权限

### 用户类型

#### 1. 普通用户
- 可以注册登录
- 受配额限制
- 只能访问自己的数据
- 可以升级套餐

#### 2. 平台管理员
- 可以管理所有普通用户
- 可以查看平台统计数据
- 可以配置系统参数
- 不受配额限制

#### 3. 超级管理员
- 拥有所有权限
- 可以管理平台管理员
- 可以进行系统级操作
- 可以修改核心配置

### 套餐类型

| 套餐类型 | 说明 | 等级 |
|---------|------|------|
| FREE | 免费版 | 1 |
| BASIC | 基础版 | 2 |
| PROFESSIONAL | 专业版 | 3 |
| FLAGSHIP | 旗舰版 | 4 |

## 配额管理系统

### 配额类型说明

| 配额键值 | 中文名称 | 默认限制 | 说明 |
|---------|----------|----------|------|
| resume_generation | 简历生成 | 免费版:5, 基础版:20, 专业版:100, 旗舰版:无限 | 每月可生成的简历数量 |
| ai_optimization | AI优化 | 免费版:3, 基础版:15, 专业版:50, 旗舰版:无限 | 每月AI简历优化次数 |
| job_application | 职位投递 | 免费版:10, 基础版:50, 专业版:200, 旗舰版:无限 | 每月可投递的职位数量 |
| template_usage | 模板使用 | 免费版:3, 基础版:10, 专业版:所有, 旗舰版:所有 | 可使用的简历模板数量 |
| export_pdf | PDF导出 | 免费版:5, 基础版:30, 专业版:200, 旗舰版:无限 | 每月PDF导出次数 |
| storage_space | 存储空间(MB) | 免费版:100, 基础版:500, 专业版:2048, 旗舰版:10240 | 用户文件存储空间 |
| api_calls | API调用 | 免费版:100, 基础版:1000, 专业版:10000, 旗舰版:无限 | 每日API调用次数 |
| concurrent_sessions | 并发会话 | 免费版:1, 基础版:3, 专业版:5, 旗舰版:10 | 同时在线会话数 |
| data_export | 数据导出 | 免费版:1, 基础版:5, 专业版:20, 旗舰版:无限 | 每月数据导出次数 |
| custom_domain | 自定义域名 | 免费版:0, 基础版:0, 专业版:1, 旗舰版:5 | 可绑定的自定义域名数量 |
| priority_support | 优先支持 | 免费版:否, 基础版:否, 专业版:是, 旗舰版:是 | 是否享受优先客服支持 |
| advanced_analytics | 高级分析 | 免费版:否, 基础版:否, 专业版:是, 旗舰版:是 | 是否可以查看高级数据分析 |
| collaboration_users | 协作用户 | 免费版:0, 基础版:2, 专业版:5, 旗舰版:20 | 可以邀请的协作用户数量 |

### 配额检查注解使用

在业务方法上添加 `@CheckQuota` 注解即可自动进行配额检查：

```java
@RestController
@RequestMapping("/api/resume")
public class ResumeController {
    
    @PostMapping("/generate")
    @CheckQuota(quotaKey = "resume_generation", amount = 1, message = "简历生成次数已用完，请升级套餐")
    public Result generateResume(@RequestBody ResumeRequest request) {
        // 业务逻辑
        return Result.success();
    }
    
    @PostMapping("/optimize")
    @CheckQuota(quotaKey = "ai_optimization", amount = 1)
    public Result optimizeResume(@RequestBody OptimizeRequest request) {
        // AI优化逻辑
        return Result.success();
    }
}
```

## 使用指南

### 快速开始

#### 1. 环境准备

确保系统已安装：
- Java 8+
- Node.js 16+
- MySQL 8.0+
- Maven 3.6+

#### 2. 数据库初始化

```sql
-- 创建数据库
CREATE DATABASE autoresume DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建配额管理表
USE autoresume;

CREATE TABLE user_quotas (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    quota_key VARCHAR(100) NOT NULL,
    quota_limit BIGINT NOT NULL DEFAULT 0,
    quota_used BIGINT NOT NULL DEFAULT 0,
    reset_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_quota (user_id, quota_key),
    INDEX idx_user_id (user_id),
    INDEX idx_quota_key (quota_key)
);

CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    plan_type ENUM('FREE', 'BASIC', 'PROFESSIONAL', 'FLAGSHIP') DEFAULT 'FREE',
    is_admin BOOLEAN DEFAULT FALSE,
    admin_level ENUM('SUPER_ADMIN', 'PLATFORM_ADMIN') NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 3. 后端服务启动

```bash
cd get_jobs
mvn clean install
mvn spring-boot:run
```

#### 4. 前端服务启动

```bash
# 启动首页
cd autoresume-frontend
npm install
npm run dev

# 启动博客
cd ../blog
npm install
npm run dev
```

### 管理员操作指南

#### 1. 用户管理

**查看所有用户**
```http
GET /api/admin/users
Authorization: Bearer {token}
```

**查看用户详情**
```http
GET /api/admin/users/{userId}
Authorization: Bearer {token}
```

**更新用户套餐**
```http
PUT /api/admin/users/{userId}/plan
Content-Type: application/json
Authorization: Bearer {token}

{
    "planType": "PROFESSIONAL"
}
```

#### 2. 配额管理

**查看用户配额**
```http
GET /api/admin/users/{userId}/quotas
Authorization: Bearer {token}
```

**设置用户配额**
```http
PUT /api/admin/users/{userId}/quotas
Content-Type: application/json
Authorization: Bearer {token}

{
    "quotaKey": "resume_generation",
    "quotaLimit": 100
}
```

**重置用户配额**
```http
POST /api/admin/users/{userId}/quotas/reset
Authorization: Bearer {token}
```

#### 3. 系统统计

**获取平台统计数据**
```http
GET /api/admin/statistics
Authorization: Bearer {token}
```

**获取配额使用统计**
```http
GET /api/admin/quota-statistics
Authorization: Bearer {token}
```

### 开发者集成指南

#### 1. 添加新的配额类型

1. 在 `QuotaService` 中添加新的配额键值
2. 在 `PlanType` 枚举中配置默认限制
3. 在业务方法上添加 `@CheckQuota` 注解

#### 2. 自定义配额检查逻辑

```java
@Service
public class CustomService {
    
    @Autowired
    private QuotaService quotaService;
    
    public void customBusinessLogic(String userId) {
        // 检查配额
        if (!quotaService.checkQuotaLimit(userId, "custom_quota", 1)) {
            throw new QuotaExceededException("自定义配额不足");
        }
        
        // 执行业务逻辑
        // ...
        
        // 消费配额
        quotaService.consumeQuota(userId, "custom_quota", 1);
    }
}
```

#### 3. 批量操作配额

```java
// 批量检查多个配额
Map<String, Long> quotaRequests = Map.of(
    "resume_generation", 1L,
    "ai_optimization", 1L
);

if (quotaService.checkMultipleQuotas(userId, quotaRequests)) {
    // 执行业务逻辑
    quotaService.consumeMultipleQuotas(userId, quotaRequests);
}
```

## 部署指南

### 1. 生产环境配置

**application-prod.yml**
```yaml
spring:
  datasource:
    url: jdbc:mysql://your-db-host:3306/autoresume?useSSL=true
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  
  security:
    oauth2:
      client:
        registration:
          authing:
            client-id: ${AUTHING_CLIENT_ID}
            client-secret: ${AUTHING_CLIENT_SECRET}

quota:
  default-limits:
    FREE:
      resume_generation: 5
      ai_optimization: 3
    BASIC:
      resume_generation: 20
      ai_optimization: 15
    PROFESSIONAL:
      resume_generation: 100
      ai_optimization: 50
    FLAGSHIP:
      resume_generation: -1  # 无限
      ai_optimization: -1
```

### 2. Docker 部署

**Dockerfile**
```dockerfile
FROM openjdk:8-jre-slim

WORKDIR /app
COPY target/autoresume-*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**docker-compose.yml**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_USERNAME=root
      - DB_PASSWORD=password
    depends_on:
      - mysql
  
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=autoresume
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

## 监控与维护

### 1. 健康检查

系统提供健康检查端点：

```http
GET /actuator/health
```

### 2. 配额监控

定期检查配额使用情况：

```http
GET /api/admin/quota-alerts
```

### 3. 性能监控

关键指标监控：
- API响应时间
- 配额检查性能
- 数据库连接池状态
- JVM内存使用情况

### 4. 日志管理

重要日志类型：
- 用户登录/登出日志
- 配额消费日志
- 管理员操作日志
- 系统异常日志

## 故障排除

### 常见问题

#### 1. Token跨域传递失败
**症状**: 用户在首页登录成功，但访问后台仍显示未认证
**解决**: 检查Cookie设置，确保domain和path正确

#### 2. 配额检查失效
**症状**: 用户超出配额限制仍能继续使用
**解决**: 检查AspectJ配置，确保切面正确拦截

#### 3. 管理员权限异常
**症状**: 平台管理员无法访问管理接口
**解决**: 检查用户表中的admin_level字段设置

### 日志调试

启用调试日志：

```yaml
logging:
  level:
    com.autoresume.quota: DEBUG
    com.autoresume.admin: DEBUG
    org.springframework.security: DEBUG
```

## API 接口文档

### 用户相关接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/user/profile` | GET | 获取用户信息 |
| `/api/user/quota-usage` | GET | 获取用户配额使用情况 |
| `/api/user/upgrade-plan` | POST | 升级用户套餐 |

### 简历相关接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/resume/generate` | POST | 生成简历 |
| `/api/resume/optimize` | POST | AI优化简历 |
| `/api/resume/export-pdf` | POST | 导出PDF |

### 管理员接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/admin/users` | GET | 获取用户列表 |
| `/api/admin/users/{id}` | GET | 获取用户详情 |
| `/api/admin/users/{id}/plan` | PUT | 更新用户套餐 |
| `/api/admin/statistics` | GET | 获取平台统计 |

## 安全考虑

### 1. 认证安全
- 使用JWT Token进行身份认证
- Token设置合理的过期时间
- 支持Token刷新机制

### 2. 授权安全
- 基于角色的访问控制(RBAC)
- API接口权限细分
- 用户数据严格隔离

### 3. 数据安全
- 敏感数据加密存储
- SQL注入防护
- XSS攻击防护

## 总结

智投简历平台的商业化配额管理系统提供了完整的用户权限控制、配额管理和管理员功能。通过合理的架构设计和技术选型，实现了高可用、高性能的个人求职平台服务。

系统具有以下优势：
- **灵活的配额管理**: 支持13种配额类型，可根据业务需求灵活配置
- **完善的权限控制**: 三层访问权限，确保数据安全
- **便捷的开发集成**: 基于注解的配额检查，简化业务代码
- **强大的管理功能**: 类似OSS的管理员系统，支持平台运营

通过本文档，开发者和管理员可以快速了解系统架构，掌握使用方法，实现高效的平台运营和维护。