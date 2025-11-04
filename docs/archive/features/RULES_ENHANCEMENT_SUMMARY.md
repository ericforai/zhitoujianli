# 项目规则完善总结

## 📅 更新时间

2025-10-16

---

## ✅ 已完成的规则完善

### 1️⃣ 添加火山云开发环境说明

在 `.cursorrules` 文件中新增了完整的火山云环境配置说明：

#### 🔥 火山云环境核心信息

**环境配置**：

- **开发平台**: 火山云（VolcEngine）远程服务器
- **工作路径**: `/root/zhitoujianli`
- **操作系统**: Linux 6.8.0-55-generic
- **Shell**: `/usr/bin/bash`
- **服务器IP**: 115.190.182.95

**关键注意事项**：

1. ⚠️ **非本地开发** - 所有操作都在远程火山云服务器上执行
2. ✅ **使用绝对路径** - 优先使用 `/root/zhitoujianli/` 作为路径前缀
3. 🖥️ **服务器资源** - 注意服务器资源限制（CPU、内存、磁盘）
4. 🌐 **网络环境** - 考虑火山云网络特性和防火墙规则
5. 💾 **持久化存储** - 确保重要数据持久化存储
6. 🔧 **环境变量** - 使用服务器环境变量，不依赖本地配置

---

### 2️⃣ 完善部署架构说明

**部署架构**：

```
前端服务器: Nginx (端口80/443) → /var/www/zhitoujianli
后端服务器: Spring Boot (端口8080) → 部署在同一台火山云服务器
反向代理: Nginx 代理 /api/ 到 http://115.190.182.95:8080/api/
```

**域名配置**：

- 生产环境：`zhitoujianli.com`, `www.zhitoujianli.com`
- 测试环境：直接使用服务器IP访问

---

### 3️⃣ 规范文件路径

明确了火山云环境下的文件路径规范：

```bash
# 项目根目录
/root/zhitoujianli/

# 前端代码
/root/zhitoujianli/frontend/

# 后端代码
/root/zhitoujianli/backend/get_jobs/

# Nginx配置
/etc/nginx/sites-available/
/root/zhitoujianli/zhitoujianli.conf

# 部署输出
/var/www/zhitoujianli/  # 前端构建产物
```

---

### 4️⃣ 完善部署流程

添加了火山云环境下的标准部署流程：

```bash
# 1. 前端构建与部署
cd /root/zhitoujianli/frontend
npm run build:frontend
sudo cp -r dist/* /var/www/zhitoujianli/

# 2. 后端构建与部署
cd /root/zhitoujianli/backend/get_jobs
mvn clean package -DskipTests
# 重启Spring Boot服务（端口8080）

# 3. Nginx配置
sudo cp /root/zhitoujianli/zhitoujianli.conf /etc/nginx/sites-available/
sudo nginx -t && sudo nginx -s reload

# 4. 验证部署
curl https://www.zhitoujianli.com
```

---

### 5️⃣ 添加火山云特定注意事项

新增了8条强制遵守的火山云环境规则：

1. **非本地环境** - 我们在**火山云服务器**上开发，不是本地环境
2. **路径规范** - 使用绝对路径 `/root/zhitoujianli/`，不使用相对路径
3. **命令执行** - 所有命令都在火山云服务器上执行
4. **文件操作** - 注意服务器文件权限和所有权
5. **部署流程** - 遵循火山云部署流程，不是本地Docker环境
6. **网络配置** - 考虑火山云网络环境和防火墙规则
7. **资源限制** - 注意服务器资源限制（CPU、内存、磁盘、带宽）
8. **日志查看** - 使用服务器路径查看日志，不是本地路径

---

### 6️⃣ 完善监控和日志配置

**日志位置**：

- Nginx访问日志: `/var/log/nginx/zhitoujianli_access.log`
- Nginx错误日志: `/var/log/nginx/zhitoujianli_error.log`
- 后端日志: `/root/zhitoujianli/backend/get_jobs/logs/`

**监控服务**：

- 应用性能监控（APM）: 火山云APM服务
- 系统资源监控: 火山云控制台监控

---

## 📋 规则体系总览

### 三层规则体系

#### 1. System Level - Ultrathink Autonomous Engineer

- 角色：统筹工程师 + 执行代理
- 模式：dry-run（默认）/ --auto（需确认）
- 安全：禁止自动写入、生产部署等危险操作

#### 2. Project Level - 智投简历核心规则

- 业务流程：上传简历 → AI解析 → 职位匹配 → 智能沟通
- 文件行数：最大800行
- 命名规范：kebab-case / PascalCase
- 注释风格：ASCII block comments（中文）

#### 3. Repository Level - Cursor开发规范

- **前端**: React 18 + TypeScript + Tailwind CSS
- **后端**: Spring Boot 3 + Java 21
- **部署**: 火山云服务器 + Docker + Nginx
- **质量**: 测试覆盖率 ≥60%

---

## 🎯 关键改进点

### ✨ 新增内容

1. ✅ **火山云环境标识** - 明确标注非本地开发环境
2. ✅ **服务器配置信息** - IP、路径、操作系统等
3. ✅ **部署架构图** - 清晰的服务部署关系
4. ✅ **文件路径规范** - 统一使用绝对路径
5. ✅ **火山云部署流程** - 标准化部署步骤
6. ✅ **环境特性说明** - 网络、资源、权限等注意事项
7. ✅ **日志路径规范** - 明确日志存储位置
8. ✅ **强制遵守规则** - 8条火山云环境特别提醒

---

## 🔍 规则检查清单

在开发过程中，AI助手将自动检查以下内容：

### 环境相关

- [ ] 是否意识到在火山云服务器上开发？
- [ ] 是否使用绝对路径而非相对路径？
- [ ] 是否考虑服务器资源限制？
- [ ] 是否考虑火山云网络环境？

### 代码质量

- [ ] TypeScript类型定义完整？
- [ ] 错误处理完整？
- [ ] 安全性考虑（XSS、CSRF、输入验证）？
- [ ] 性能优化建议？

### 部署相关

- [ ] 部署路径是否正确（/var/www/zhitoujianli/）？
- [ ] Nginx配置是否正确？
- [ ] 端口配置是否正确（80/443/8080）？
- [ ] 日志路径是否正确？

### 文档质量

- [ ] 中文注释？
- [ ] 代码规范符合性？
- [ ] 测试覆盖率达标？

---

## 📚 相关文件

### 主要规则文件

- `.cursorrules` - **主规则文件**（已更新）
- `CURSOR_RULES_ENFORCEMENT.md` - 规则强制执行说明
- `RULES_ENHANCEMENT_SUMMARY.md` - 本文档（规则完善总结）

### 配置文件

- `zhitoujianli.conf` - Nginx生产环境配置
- `package.json` - 前端依赖和脚本
- `backend/get_jobs/pom.xml` - 后端Maven配置

### 部署文档

- `VOLCANO_DEPLOYMENT_GUIDE.md` - 火山云部署指南
- `DEPLOYMENT.md` - 通用部署文档
- `docs/deployment/VOLCENGINE_SERVER_DEPLOYMENT_GUIDE.md` - 火山云服务器部署详细指南

---

## 🚀 下一步行动

### 对于开发者

1. **熟悉规则** - 阅读 `.cursorrules` 文件
2. **了解环境** - 记住在火山云服务器上开发
3. **遵循规范** - 使用绝对路径，考虑服务器特性
4. **质量保证** - 确保代码符合所有质量要求

### 对于AI助手

1. **环境意识** - 始终记住在火山云服务器上操作
2. **路径规范** - 使用 `/root/zhitoujianli/` 绝对路径
3. **质量检查** - 自动检查代码质量和安全性
4. **中文交流** - 始终使用中文进行回复

---

## ✅ 验证规则是否生效

### 测试命令

```bash
# 读取规则文件
cat /root/zhitoujianli/.cursorrules | grep "火山云"

# 验证路径配置
echo "工作目录: $(pwd)"
echo "项目根目录: /root/zhitoujianli"

# 检查环境信息
uname -a
echo "Shell: $SHELL"
```

### 预期输出

- ✅ 能看到火山云相关配置
- ✅ 当前目录为 `/root/zhitoujianli`
- ✅ Linux 6.8.0-55-generic
- ✅ Shell为 `/usr/bin/bash`

---

## 📊 规则完善状态

| 类别           | 状态    | 完成度 |
| -------------- | ------- | ------ |
| 火山云环境配置 | ✅ 完成 | 100%   |
| 部署架构说明   | ✅ 完成 | 100%   |
| 文件路径规范   | ✅ 完成 | 100%   |
| 部署流程文档   | ✅ 完成 | 100%   |
| 特别注意事项   | ✅ 完成 | 100%   |
| 监控日志配置   | ✅ 完成 | 100%   |
| 强制遵守规则   | ✅ 完成 | 100%   |

---

## 🎉 总结

通过本次规则完善，项目规则体系已经：

✅ **明确环境** - 清晰标注火山云开发环境
✅ **规范路径** - 统一使用绝对路径标准
✅ **完善流程** - 提供详细的部署流程
✅ **强化安全** - 增加服务器环境注意事项
✅ **提升质量** - 保持高质量代码标准

现在，AI助手将在每次对话中自动：

1. 🔥 意识到在火山云服务器上开发
2. 📁 使用绝对路径 `/root/zhitoujianli/`
3. 🛡️ 考虑服务器环境特性和限制
4. 📝 提供符合规范的高质量代码
5. 🇨🇳 使用中文进行所有交流

---

**配置完成时间**: 2025-10-16
**配置人员**: AI开发助手
**版本**: v1.1.0（火山云环境增强版）
