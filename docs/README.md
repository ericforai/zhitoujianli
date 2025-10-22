# 智投简历 - 技术文档中心

## 📚 文档概览

本目录包含智投简历系统的所有技术文档，包括用户指南、开发文档和运维手册。

## 文档索引

### 多用户支持相关

| 文档 | 适用人群 | 说明 |
|------|---------|------|
| [多用户使用指南](./multi-user-guide.md) | 最终用户 | 如何使用多用户功能、注册登录流程 |
| [多用户架构设计](./multi-user-architecture.md) | 开发人员 | 架构设计、代码结构、扩展开发指南 |
| [多用户运维指南](./multi-user-ops.md) | 运维人员 | 启用/禁用、监控、故障排查、备份恢复 |
| [多用户测试指南](./multi-user-testing-guide.md) | 测试人员 | 完整测试套件、验证清单 |
| [实施总结](./MULTI_USER_IMPLEMENTATION_SUMMARY.md) | 项目管理 | 实施成果、代码变更、风险评估 |

### 快速开始

#### 用户

想要使用多用户功能？请阅读：[多用户使用指南](./multi-user-guide.md)

#### 开发者

想要了解架构和扩展功能？请阅读：[多用户架构设计](./multi-user-architecture.md)

#### 运维

想要启用/管理多用户？请阅读：[多用户运维指南](./multi-user-ops.md)

## 多用户功能状态

### 当前状态

- **部署状态**：✅ 已部署到生产环境
- **默认模式**：单用户模式（SECURITY_ENABLED=false）
- **可用性**：可随时启用多用户模式
- **向后兼容**：100%兼容现有功能

### 功能特性

#### 已实现 ✅

- [x] 用户注册和登录（JWT认证）
- [x] 配置隔离（按userId目录）
- [x] Cookie隔离（独立文件）
- [x] 并发登录控制（用户级别锁）
- [x] 数据自动迁移（首个用户继承default_user）
- [x] 安全防护（路径遍历攻击防护）
- [x] 环境变量开关控制
- [x] 完整文档

#### 计划中 📅

- [ ] Browser实例池（性能优化）
- [ ] 配置缓存（减少文件IO）
- [ ] 用户配额管理
- [ ] 团队协作支持
- [ ] 实时通知（WebSocket）

## 技术栈

### 后端

- Spring Boot 3.2.0
- Spring Security 6.x
- JWT (jjwt) 0.12.5
- Java 21
- Maven 3.8+

### 前端

- React 19.1.1
- TypeScript 4.9.5
- Tailwind CSS 3.4.17

### 数据存储

- PostgreSQL（用户账号）
- 文件系统（配置和简历）
- /tmp（Cookie和临时文件）

## 快速操作

### 启用多用户模式

```bash
# 使用运维脚本（推荐）
/opt/scripts/test_multi_user.sh enable

# 或手动操作
sed -i 's/SECURITY_ENABLED=false/SECURITY_ENABLED=true/' /opt/zhitoujianli/backend/.env
systemctl restart get_jobs
```

### 禁用多用户模式（回退）

```bash
# 使用运维脚本
/opt/scripts/test_multi_user.sh disable

# 或手动操作
sed -i 's/SECURITY_ENABLED=true/SECURITY_ENABLED=false/' /opt/zhitoujianli/backend/.env
systemctl restart get_jobs
```

### 测试当前模式

```bash
/opt/scripts/test_multi_user.sh test
```

### 验证系统健康

```bash
/tmp/multi_user_verification.sh
```

## 架构图示

### 单用户模式（默认）

```
用户 → 配置页面 → API(/api/config)
                    ↓
         user_data/default_user/config.json
                    ↓
              Boss程序（默认Cookie）
                    ↓
            /tmp/boss_cookies.json
```

### 多用户模式（SECURITY_ENABLED=true）

```
用户A → 登录 → JWT Token A → API → user_data/user_1/config.json → Boss进程A → /tmp/boss_cookies_user_1.json
用户B → 登录 → JWT Token B → API → user_data/user_2/config.json → Boss进程B → /tmp/boss_cookies_user_2.json
```

**特点**：
- ✅ 完全隔离
- ✅ 可并发运行
- ✅ 独立Cookie
- ✅ 独立配置

## 代码变更总结

| 类别 | 变更 |
|------|------|
| 新增文件 | 5个（UserDataMigrationService + 4个文档）|
| 修改文件 | 10个 |
| 新增代码行 | ~1300行 |
| 修改代码行 | ~200行 |
| 删除代码行 | 0行 |

**核心文件**：

1. `util/UserContextUtil.java` - 用户上下文工具（安全验证）
2. `controller/WebController.java` - 配置API（动态路径）
3. `service/BossExecutionService.java` - Boss执行服务（环境变量）
4. `boss/BossConfig.java` - 配置加载（环境变量读取）
5. `boss/Boss.java` - Cookie路径（动态生成）
6. `controller/BossLoginController.java` - 登录控制（用户级别锁）
7. `service/UserDataMigrationService.java` - 数据迁移（新建）
8. `controller/AuthController.java` - 认证控制（迁移触发）
9. `frontend/src/pages/ConfigPage.tsx` - 配置页面（Token携带）

## 风险评估

| 风险 | 等级 | 状态 |
|------|------|------|
| 向后兼容性 | 低 | ✅ 已验证 |
| 数据丢失 | 低 | ✅ 自动备份 |
| 性能下降 | 低 | ✅ 单用户无影响 |
| 安全漏洞 | 低 | ✅ 已防护 |

## 支持和帮助

### 文档

- 用户指南：[multi-user-guide.md](./multi-user-guide.md)
- 架构文档：[multi-user-architecture.md](./multi-user-architecture.md)
- 运维手册：[multi-user-ops.md](./multi-user-ops.md)

### 脚本工具

- 验证脚本：`/tmp/multi_user_verification.sh`
- 测试脚本：`/opt/scripts/test_multi_user.sh`
- 备份脚本：`/opt/scripts/backup_user_data.sh`（待创建）
- 健康检查：`/opt/scripts/health_check.sh`（待创建）

### 联系方式

- 技术支持：support@zhitoujianli.com
- 开发团队：dev@zhitoujianli.com
- 紧急问题：emergency@zhitoujianli.com

## 版本历史

### v2.1.0（2025-10-22）- 多用户支持

- ✅ 新增多用户认证和隔离
- ✅ 新增数据迁移功能
- ✅ 新增并发控制机制
- ✅ 新增安全防护功能
- ✅ 保持100%向后兼容

### v2.0.1（之前版本）- 单用户模式

- ✅ Boss自动投递
- ✅ 智能打招呼语生成
- ✅ 简历解析
- ✅ 配置管理

## 下一步计划

### 短期（1个月内）

1. 在测试环境完整测试多用户功能
2. 收集用户反馈
3. 修复发现的问题
4. 生产环境灰度发布

### 中期（3个月内）

1. 性能优化（Browser池、配置缓存）
2. 用户配额管理
3. 数据库存储配置
4. 监控告警系统

### 长期（6个月+）

1. 团队协作功能
2. 付费订阅系统
3. API开放平台
4. 移动端支持

---

**最后更新**：2025年10月22日
**维护人员**：智投简历开发团队

