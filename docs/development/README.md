# 开发规范文档中心

欢迎来到智投简历项目的开发规范文档中心！这里包含了完整的开发流程、代码规范和最佳实践指南。

## 📚 文档目录

### 🎨 代码规范
- **[开发规范总览](./DEVELOPMENT_STANDARDS.md)** - 完整的开发规范文档
- **[Git提交规范指南](./COMMIT_GUIDE.md)** - 详细的提交信息规范
- **[代码审查指南](./CODE_REVIEW_GUIDE.md)** - Code Review流程和最佳实践

### 🛠️ 工具配置
- **ESLint配置**: `frontend/.eslintrc.js`
- **Prettier配置**: `frontend/.prettierrc`
- **Checkstyle配置**: `backend/get_jobs/checkstyle.xml`
- **Commitlint配置**: `commitlint.config.js`
- **Husky配置**: `.husky/` 目录

### 🤖 自动化
- **GitHub Actions**: `.github/workflows/`
- **PR模板**: `.github/PULL_REQUEST_TEMPLATE.md`
- **Issue模板**: `.github/ISSUE_TEMPLATE/`

## 🚀 快速开始

### 新开发者设置

1. **运行环境设置脚本**
   ```bash
   ./scripts/setup-dev-environment.sh
   ```

2. **阅读开发规范**
   ```bash
   # 打开开发规范文档
   code docs/development/DEVELOPMENT_STANDARDS.md
   ```

3. **配置IDE**
   - 安装推荐的VS Code扩展
   - 配置代码格式化
   - 启用Git hooks

### 日常开发流程

#### 1. 创建功能分支
```bash
# 创建新分支
git checkout -b feat/user-authentication

# 或者
git checkout -b fix/login-bug
```

#### 2. 开发代码
```bash
# 前端开发
cd frontend
npm start

# 后端开发
cd backend/get_jobs
mvn spring-boot:run
```

#### 3. 代码质量检查
```bash
# 前端检查
cd frontend
npm run code-quality

# 后端检查
cd backend/get_jobs
mvn validate
```

#### 4. 提交代码
```bash
# 添加变更
git add .

# 提交（会自动触发pre-commit检查）
git commit -m "feat(auth): 添加用户登录功能"

# 推送（会自动触发pre-push检查）
git push origin feat/user-authentication
```

#### 5. 创建Pull Request
- 使用PR模板填写详细信息
- 等待CI检查通过
- 等待代码审查
- 合并到主分支

## 📋 检查清单

### 提交前检查
- [ ] 代码符合项目规范
- [ ] 通过了所有自动化检查
- [ ] 添加了必要的测试
- [ ] 更新了相关文档
- [ ] 提交信息符合规范

### PR创建检查
- [ ] 使用了PR模板
- [ ] 链接了相关Issue
- [ ] 提供了测试说明
- [ ] 包含了截图（UI变更）
- [ ] 说明了部署注意事项

### 代码审查检查
- [ ] 功能正确性
- [ ] 代码质量
- [ ] 安全性
- [ ] 性能影响
- [ ] 测试覆盖
- [ ] 文档完整性

## 🔧 工具使用

### 前端工具

#### ESLint
```bash
# 检查代码问题
npm run lint

# 自动修复问题
npm run lint:fix

# 严格检查（CI环境）
npm run lint:check
```

#### Prettier
```bash
# 格式化代码
npm run format

# 检查格式
npm run format:check
```

#### TypeScript
```bash
# 类型检查
npm run type-check
```

### 后端工具

#### Maven插件
```bash
# 代码风格检查
mvn checkstyle:check

# 静态代码分析
mvn spotbugs:check

# 代码质量分析
mvn pmd:check

# 运行测试
mvn test

# 生成覆盖率报告
mvn jacoco:report
```

## 📊 质量指标

### 代码质量目标
- **测试覆盖率**: 最低60%
- **代码重复率**: 低于5%
- **圈复杂度**: 低于10
- **技术债务**: 持续监控和改善

### 团队协作目标
- **PR评审时间**: 24小时内
- **代码审查覆盖率**: 100%
- **Bug发现率**: 通过评审发现的问题数量
- **知识分享**: 定期技术分享

## 🆘 获取帮助

### 常见问题
1. **代码检查失败**: 查看错误信息，根据提示修复
2. **提交被拒绝**: 检查提交信息格式和代码质量
3. **PR被要求修改**: 根据评审意见进行修改
4. **环境配置问题**: 运行环境设置脚本

### 联系方式
- **技术讨论**: 团队群组
- **技术负责人**: 联系项目技术负责人
- **创建Issue**: GitHub Issues
- **文档更新**: 提交PR更新文档

## 📈 持续改进

### 定期回顾
- **月度回顾**: 回顾开发规范执行情况
- **季度优化**: 优化工具配置和流程
- **年度升级**: 升级开发工具和规范

### 反馈渠道
- **团队会议**: 定期讨论改进建议
- **匿名反馈**: 通过Issue提供匿名反馈
- **文档贡献**: 完善和更新文档

---

## 📝 更新日志

### v1.0.0 (2025-01-27)
- 初始版本发布
- 建立完整的开发规范体系
- 配置代码质量检查工具
- 实现Git提交规范
- 建立Code Review流程

---

**文档维护**: ZhiTouJianLi Development Team
**最后更新**: 2025-01-27
**版本**: v1.0.0
