# 测试快速启动指南

**版本**: v1.0
**更新日期**: 2025-10-11

---

## 🚀 快速开始

### 一键运行所有测试

```bash
# 在项目根目录执行
./test_resume_workflow.sh
```

---

## 📋 分步测试指南

### 第一步：前端测试

```bash
cd /root/zhitoujianli/frontend

# 1. 运行单元测试
npm test

# 2. 查看测试覆盖率
npm test -- --coverage

# 3. 运行边界测试
npm test -- edge.test

# 4. 运行特定测试文件
npm test -- CompleteResumeManager.test.tsx
```

### 第二步：E2E测试

```bash
cd /root/zhitoujianli/frontend

# 1. 安装Playwright（首次运行）
npm install -D @playwright/test
npx playwright install

# 2. 运行所有E2E测试
npx playwright test

# 3. 运行特定场景
npx playwright test resume-workflow

# 4. 调试模式运行
npx playwright test --debug

# 5. UI模式运行
npx playwright test --ui

# 6. 查看测试报告
npx playwright show-report
```

### 第三步：后端测试

```bash
cd /root/zhitoujianli/backend/get_jobs

# 1. 运行所有测试
mvn test

# 2. 运行特定测试
mvn test -Dtest=CandidateResumeControllerIntegrationTest

# 3. 运行边界测试
mvn test -Dtest=*Edge*

# 4. 运行E2E测试
mvn test -Dtest=*E2E*

# 5. 生成覆盖率报告
mvn jacoco:report

# 6. 查看报告
open target/site/jacoco/index.html
```

---

## 📊 测试文件清单

### 前端测试（12个）

```
单元测试:
✅ frontend/src/components/ResumeManagement/CompleteResumeManager.test.tsx
✅ frontend/src/services/aiService.test.ts
✅ frontend/src/utils/logger.test.ts

边界测试:
✅ frontend/src/components/ResumeManagement/CompleteResumeManager.edge.test.tsx
✅ frontend/src/services/aiService.edge.test.ts
✅ frontend/src/utils/logger.edge.test.ts

E2E测试:
✅ frontend/e2e/resume-workflow.spec.ts
✅ frontend/e2e/text-parsing.spec.ts
✅ frontend/e2e/error-handling.spec.ts
✅ frontend/e2e/resume-management.spec.ts
✅ frontend/e2e/user-experience.spec.ts
✅ frontend/e2e/performance.spec.ts
```

### 后端测试（5个）

```
集成测试:
✅ backend/get_jobs/src/test/java/controller/CandidateResumeControllerIntegrationTest.java
✅ backend/get_jobs/src/test/java/service/CandidateResumeServiceIntegrationTest.java

边界测试:
✅ backend/get_jobs/src/test/java/controller/CandidateResumeControllerEdgeTest.java
✅ backend/get_jobs/src/test/java/service/CandidateResumeServiceEdgeTest.java

E2E测试:
✅ backend/get_jobs/src/test/java/e2e/ResumeWorkflowE2ETest.java
```

---

## 🎯 测试覆盖情况

| 模块           | 单元测试 | 边界测试 | E2E测试 | 预期覆盖率 |
| -------------- | -------- | -------- | ------- | ---------- |
| 前端组件       | ✅       | ✅       | ✅      | 80%+       |
| 前端服务       | ✅       | ✅       | ✅      | 75%+       |
| 前端工具       | ✅       | ✅       | -       | 90%+       |
| 后端Controller | ✅       | ✅       | ✅      | 85%+       |
| 后端Service    | ✅       | ✅       | ✅      | 75%+       |

**总体预期覆盖率**: **75%+** 🌟

---

## 📝 常见命令

### 测试命令

```bash
# 运行所有测试
npm test                           # 前端单元测试
npx playwright test                # 前端E2E测试
mvn test                           # 后端测试

# 查看覆盖率
npm test -- --coverage             # 前端覆盖率
mvn jacoco:report                  # 后端覆盖率

# 调试测试
npm test -- --watchAll             # 监听模式
npx playwright test --debug        # E2E调试
mvn test -X                        # Maven调试
```

### 报告查看

```bash
# 前端报告
open frontend/coverage/lcov-report/index.html
open frontend/playwright-report/index.html

# 后端报告
open backend/get_jobs/target/site/jacoco/index.html
open backend/get_jobs/target/surefire-reports/index.html
```

---

## 🔍 故障排除

### 问题1：测试超时

```bash
# 增加超时时间
npm test -- --testTimeout=60000
npx playwright test --timeout=60000
```

### 问题2：端口占用

```bash
# 检查端口
lsof -i :3000
lsof -i :8080

# 杀死进程
kill -9 <PID>
```

### 问题3：依赖问题

```bash
# 清理并重装
rm -rf node_modules package-lock.json
npm install

# Maven清理
mvn clean install
```

---

## 📚 相关文档

- [测试指南](EDGE_AND_E2E_TEST_GUIDE.md) - 详细的测试指南
- [测试报告](COMPREHENSIVE_TEST_REPORT.md) - 综合测试报告
- [模板设计](RESUME_TEMPLATE_DESIGN.md) - 简历模板功能设计

---

## ✅ 检查清单

在运行测试前，确保：

- [ ] Node.js 版本 >= 16
- [ ] Java 版本 >= 21
- [ ] Maven 已安装
- [ ] npm依赖已安装
- [ ] Playwright已安装（E2E测试）
- [ ] 后端服务正在运行（E2E测试）
- [ ] 测试端口可用（3000, 8080）

---

**快速启动！运行测试，验证系统质量！** 🚀
