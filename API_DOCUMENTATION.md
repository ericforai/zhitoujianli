# 智投简历平台 API 接口文档

## 📋 目录
- [认证机制](#认证机制)
- [用户相关接口](#用户相关接口)
- [简历管理接口](#简历管理接口)
- [配额管理接口](#配额管理接口)
- [管理员接口](#管理员接口)
- [响应格式](#响应格式)
- [错误码说明](#错误码说明)

## 🔐 认证机制

### 获取Token
用户通过Authing登录后，系统会自动设置JWT Token到Cookie中。

### Token使用
所有需要认证的接口都需要在请求头中携带Token：

```http
Authorization: Bearer {your_jwt_token}
```

或者通过Cookie自动携带：

```http
Cookie: authToken={your_jwt_token}
```

## 👤 用户相关接口

### 获取用户信息
```http
GET /api/user/profile
Authorization: Bearer {token}
```

**响应示例**:
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "userId": "user123",
        "username": "张三",
        "email": "zhangsan@example.com",
        "planType": "PROFESSIONAL",
        "isAdmin": false,
        "createdAt": "2024-01-01T00:00:00Z"
    }
}
```

### 获取用户配额使用情况
```http
GET /api/user/quota-usage
Authorization: Bearer {token}
```

**响应示例**:
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "planType": "PROFESSIONAL",
        "quotas": [
            {
                "quotaKey": "resume_generation",
                "quotaName": "简历生成",
                "quotaLimit": 100,
                "quotaUsed": 15,
                "quotaRemaining": 85,
                "resetDate": "2024-02-01"
            },
            {
                "quotaKey": "ai_optimization",
                "quotaName": "AI优化",
                "quotaLimit": 50,
                "quotaUsed": 8,
                "quotaRemaining": 42,
                "resetDate": "2024-02-01"
            }
        ]
    }
}
```

### 升级用户套餐
```http
POST /api/user/upgrade-plan
Authorization: Bearer {token}
Content-Type: application/json

{
    "planType": "FLAGSHIP",
    "paymentMethod": "alipay",
    "paymentAmount": 299.00
}
```

## 📝 简历管理接口

### 生成简历
```http
POST /api/resume/generate
Authorization: Bearer {token}
Content-Type: application/json

{
    "personalInfo": {
        "name": "张三",
        "phone": "13800138000",
        "email": "zhangsan@example.com",
        "address": "北京市朝阳区"
    },
    "workExperience": [
        {
            "company": "XX科技有限公司",
            "position": "Java开发工程师",
            "startDate": "2022-01-01",
            "endDate": "2024-01-01",
            "description": "负责后端开发工作..."
        }
    ],
    "education": [
        {
            "school": "北京大学",
            "major": "计算机科学与技术",
            "degree": "本科",
            "startDate": "2018-09-01",
            "endDate": "2022-06-01"
        }
    ],
    "templateId": "template_001"
}
```

**配额消费**: 消费 `resume_generation` 配额 1 次

### AI优化简历
```http
POST /api/resume/optimize
Authorization: Bearer {token}
Content-Type: application/json

{
    "resumeId": "resume_123",
    "optimizationType": "content",
    "targetPosition": "Java高级开发工程师"
}
```

**配额消费**: 消费 `ai_optimization` 配额 1 次

**响应示例**:
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "optimizedContent": {
            "summary": "优化后的个人简介...",
            "workExperience": [
                {
                    "optimizedDescription": "优化后的工作描述..."
                }
            ]
        },
        "suggestions": [
            "建议突出技术栈的深度",
            "可以量化工作成果"
        ]
    }
}
```

### 导出PDF
```http
POST /api/resume/export-pdf
Authorization: Bearer {token}
Content-Type: application/json

{
    "resumeId": "resume_123",
    "format": "A4",
    "watermark": false
}
```

**配额消费**: 消费 `export_pdf` 配额 1 次

### 获取简历列表
```http
GET /api/resume/list?page=1&size=10
Authorization: Bearer {token}
```

### 删除简历
```http
DELETE /api/resume/{resumeId}
Authorization: Bearer {token}
```

## 📊 配额管理接口

### 检查配额
```http
POST /api/quota/check
Authorization: Bearer {token}
Content-Type: application/json

{
    "quotaKey": "resume_generation",
    "amount": 1
}
```

**响应示例**:
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "canConsume": true,
        "quotaRemaining": 84,
        "quotaLimit": 100
    }
}
```

### 批量检查配额
```http
POST /api/quota/check-multiple
Authorization: Bearer {token}
Content-Type: application/json

{
    "quotaRequests": {
        "resume_generation": 1,
        "ai_optimization": 1
    }
}
```

## 👨‍💼 管理员接口

### 用户管理

#### 获取用户列表
```http
GET /api/admin/users?page=1&size=20&planType=PROFESSIONAL
Authorization: Bearer {admin_token}
```

**查询参数**:
- `page`: 页码（从1开始）
- `size`: 每页大小
- `planType`: 套餐类型筛选
- `keyword`: 关键词搜索（用户名或邮箱）

**响应示例**:
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "total": 1250,
        "page": 1,
        "size": 20,
        "users": [
            {
                "userId": "user123",
                "username": "张三",
                "email": "zhangsan@example.com",
                "planType": "PROFESSIONAL",
                "isAdmin": false,
                "lastLoginTime": "2024-01-15T10:30:00Z",
                "totalQuotaUsed": 156,
                "createdAt": "2024-01-01T00:00:00Z"
            }
        ]
    }
}
```

#### 获取用户详情
```http
GET /api/admin/users/{userId}
Authorization: Bearer {admin_token}
```

#### 更新用户套餐
```http
PUT /api/admin/users/{userId}/plan
Authorization: Bearer {admin_token}
Content-Type: application/json

{
    "planType": "FLAGSHIP",
    "reason": "客户申请升级"
}
```

#### 封禁/解封用户
```http
PUT /api/admin/users/{userId}/status
Authorization: Bearer {admin_token}
Content-Type: application/json

{
    "status": "BANNED",
    "reason": "违反使用条款"
}
```

### 配额管理

#### 查看用户配额
```http
GET /api/admin/users/{userId}/quotas
Authorization: Bearer {admin_token}
```

#### 设置用户配额
```http
PUT /api/admin/users/{userId}/quotas
Authorization: Bearer {admin_token}
Content-Type: application/json

{
    "quotaKey": "resume_generation",
    "quotaLimit": 200,
    "reason": "VIP客户特殊配额"
}
```

#### 重置用户配额
```http
POST /api/admin/users/{userId}/quotas/reset
Authorization: Bearer {admin_token}
Content-Type: application/json

{
    "quotaKeys": ["resume_generation", "ai_optimization"],
    "reason": "月度重置"
}
```

#### 批量重置配额
```http
POST /api/admin/quotas/batch-reset
Authorization: Bearer {admin_token}
Content-Type: application/json

{
    "userIds": ["user1", "user2", "user3"],
    "quotaKeys": ["resume_generation"],
    "reason": "系统维护"
}
```

### 统计分析

#### 获取平台统计
```http
GET /api/admin/statistics
Authorization: Bearer {admin_token}
```

**响应示例**:
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "userStats": {
            "totalUsers": 1250,
            "activeUsers": 856,
            "newUsersToday": 23,
            "newUsersThisMonth": 145
        },
        "planStats": {
            "FREE": 650,
            "BASIC": 350,
            "PROFESSIONAL": 200,
            "FLAGSHIP": 50
        },
        "quotaStats": {
            "totalQuotaConsumed": 15680,
            "topConsumedQuotas": [
                {
                    "quotaKey": "resume_generation",
                    "quotaName": "简历生成",
                    "totalConsumed": 5680
                },
                {
                    "quotaKey": "ai_optimization",
                    "quotaName": "AI优化",
                    "totalConsumed": 3240
                }
            ]
        }
    }
}
```

#### 获取配额使用统计
```http
GET /api/admin/quota-statistics?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {admin_token}
```

#### 获取收入统计
```http
GET /api/admin/revenue-statistics?period=monthly
Authorization: Bearer {admin_token}
```

### 系统管理

#### 获取系统配置
```http
GET /api/admin/system/config
Authorization: Bearer {admin_token}
```

#### 更新系统配置
```http
PUT /api/admin/system/config
Authorization: Bearer {admin_token}
Content-Type: application/json

{
    "maxFileSize": 10485760,
    "allowedFileTypes": ["pdf", "doc", "docx"],
    "defaultPlanType": "FREE",
    "quotaResetDay": 1
}
```

#### 发送系统通知
```http
POST /api/admin/notifications
Authorization: Bearer {admin_token}
Content-Type: application/json

{
    "title": "系统维护通知",
    "content": "系统将于今晚进行维护...",
    "targetUsers": "ALL",
    "priority": "HIGH"
}
```

## 📋 响应格式

### 成功响应
```json
{
    "code": 200,
    "message": "success",
    "data": {},
    "timestamp": "2024-01-15T10:30:00Z"
}
```

### 错误响应
```json
{
    "code": 400,
    "message": "配额不足，请升级套餐",
    "error": "QUOTA_EXCEEDED",
    "timestamp": "2024-01-15T10:30:00Z"
}
```

## ❌ 错误码说明

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| 200 | 200 | 成功 |
| 400 | 400 | 请求参数错误 |
| 401 | 401 | 未认证或Token无效 |
| 403 | 403 | 权限不足 |
| 404 | 404 | 资源不存在 |
| 409 | 409 | 资源冲突 |
| 429 | 429 | 请求频率过高 |
| 500 | 500 | 服务器内部错误 |

### 业务错误码

| 错误码 | 说明 |
|--------|------|
| QUOTA_EXCEEDED | 配额不足 |
| INVALID_PLAN_TYPE | 无效的套餐类型 |
| USER_NOT_FOUND | 用户不存在 |
| RESUME_NOT_FOUND | 简历不存在 |
| INVALID_TEMPLATE | 无效的模板 |
| FILE_TOO_LARGE | 文件过大 |
| UNSUPPORTED_FILE_TYPE | 不支持的文件类型 |
| ADMIN_PERMISSION_REQUIRED | 需要管理员权限 |

## 🔧 SDK 使用示例

### JavaScript/TypeScript
```typescript
import axios from 'axios';

class AutoResumeAPI {
    private baseURL = 'http://localhost:8080/api';
    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    // 生成简历
    async generateResume(resumeData: any) {
        const response = await axios.post(
            `${this.baseURL}/resume/generate`,
            resumeData,
            {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    }

    // 检查配额
    async checkQuota(quotaKey: string, amount: number = 1) {
        const response = await axios.post(
            `${this.baseURL}/quota/check`,
            { quotaKey, amount },
            {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    }

    // 获取用户信息
    async getUserProfile() {
        const response = await axios.get(
            `${this.baseURL}/user/profile`,
            {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            }
        );
        return response.data;
    }
}

// 使用示例
const api = new AutoResumeAPI('your_jwt_token');

// 检查配额后生成简历
try {
    const quotaCheck = await api.checkQuota('resume_generation');
    if (quotaCheck.data.canConsume) {
        const result = await api.generateResume(resumeData);
        console.log('简历生成成功:', result);
    } else {
        console.log('配额不足，请升级套餐');
    }
} catch (error) {
    console.error('操作失败:', error);
}
```

### Java
```java
@Service
public class AutoResumeService {
    
    @Autowired
    private RestTemplate restTemplate;
    
    private final String baseUrl = "http://localhost:8080/api";
    
    public ResponseEntity<String> generateResume(String token, Object resumeData) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<Object> request = new HttpEntity<>(resumeData, headers);
        
        return restTemplate.postForEntity(
            baseUrl + "/resume/generate",
            request,
            String.class
        );
    }
    
    public boolean checkQuota(String token, String quotaKey, int amount) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, Object> requestBody = Map.of(
            "quotaKey", quotaKey,
            "amount", amount
        );
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        
        ResponseEntity<Map> response = restTemplate.postForEntity(
            baseUrl + "/quota/check",
            request,
            Map.class
        );
        
        Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
        return (Boolean) data.get("canConsume");
    }
}
```

## 📞 技术支持

### 接口调试
建议使用 Postman 或类似工具进行接口调试，可以导入以下环境变量：

```json
{
    "baseUrl": "http://localhost:8080/api",
    "authToken": "your_jwt_token"
}
```

### 常见问题

1. **Token过期**: Token默认24小时有效期，过期后需要重新登录
2. **跨域问题**: 确保前端请求包含正确的Origin头
3. **配额检查**: 所有消费配额的接口都会自动检查，无需手动调用检查接口
4. **权限验证**: 管理员接口需要具有管理员权限的Token

### 性能建议

1. **批量操作**: 尽量使用批量接口减少请求次数
2. **缓存Token**: 避免频繁获取新Token
3. **分页查询**: 大数据量查询使用分页参数
4. **异步处理**: 耗时操作建议使用异步方式

本API文档涵盖了智投简历平台的所有核心接口，开发者可以基于这些接口快速集成和开发相关功能。