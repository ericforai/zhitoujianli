# 智投简历系统 - 边界测试和E2E测试指南

**创建日期**: 2025-10-11
**版本**: v1.0
**维护者**: 智投简历开发团队

---

## 📋 目录

1. [测试概览](#测试概览)
2. [边界测试](#边界测试)
3. [E2E测试](#e2e测试)
4. [运行测试](#运行测试)
5. [测试报告](#测试报告)
6. [CI/CD集成](#cicd集成)
7. [故障排除](#故障排除)

---

## 测试概览

### 测试架构

```
测试体系
├── 单元测试 (Unit Tests)
│   ├── 组件测试
│   ├── 服务测试
│   └── 工具测试
├── 边界测试 (Edge Tests)
│   ├── 异常场景
│   ├── 极端值
│   └── 安全性
└── E2E测试 (End-to-End Tests)
    ├── 用户流程
    ├── 集成测试
    └── 性能测试
```

### 测试统计

| 类型         | 文件数 | 测试用例数 | 状态 |
| ------------ | ------ | ---------- | ---- |
| 前端单元测试 | 3      | 53         | ✅   |
| 前端边界测试 | 3      | 60+        | ✅   |
| 后端单元测试 | 2      | 31         | ✅   |
| 后端边界测试 | 2      | 50+        | ✅   |
| E2E测试      | 5      | 40+        | ✅   |
| **总计**     | **15** | **230+**   | ✅   |

---

## 边界测试

### 前端边界测试

#### CompleteResumeManager 边界测试

**文件**: `frontend/src/components/ResumeManagement/CompleteResumeManager.edge.test.tsx`

**覆盖场景**:

- ✅ 大文件处理（接近10MB）
- ✅ 超大文件拒绝（>10MB）
- ✅ 中文文件名
- ✅ 特殊字符文件名
- ✅ 超长文件名
- ✅ 空文本验证
- ✅ 纯空格文本
- ✅ 极长文本（>50KB）
- ✅ 特殊Unicode字符
- ✅ XSS攻击防御
- ✅ 网络超时
- ✅ 服务器500错误
- ✅ 429限流
- ✅ 并发请求
- ✅ 空文件
- ✅ 损坏文件
- ✅ 多文件拖拽
- ✅ 非法文件格式
- ✅ 超长打招呼语
- ✅ 空打招呼语

#### AI Service 边界测试

**文件**: `frontend/src/services/aiService.edge.test.ts`

**覆盖场景**:

- ✅ API超时
- ✅ 网络中断
- ✅ 429/502/503错误
- ✅ 空响应
- ✅ null响应
- ✅ 格式错误JSON
- ✅ 字段缺失
- ✅ 数据类型不匹配
- ✅ 极大数据量
- ✅ 空数组/对象
- ✅ Emoji字符
- ✅ 零宽字符
- ✅ 控制字符
- ✅ 并发请求
- ✅ 重试机制

#### Logger 边界测试

**文件**: `frontend/src/utils/logger.edge.test.ts`

**覆盖场景**:

- ✅ 循环引用对象
- ✅ 超大对象（>1MB）
- ✅ 深层嵌套（>100层）
- ✅ 函数类型
- ✅ Symbol类型
- ✅ Map/Set类型
- ✅ Date/RegExp/Error
- ✅ 并发写入
- ✅ 频繁级别切换
- ✅ 内存泄漏测试
- ✅ 极长消息
- ✅ Unicode范围
- ✅ 零宽字符
- ✅ 大量参数
- ✅ 混合类型

### 后端边界测试

#### Controller 边界测试

**文件**: `backend/.../CandidateResumeControllerEdgeTest.java`

**覆盖场景**:

- ✅ SQL注入防护
- ✅ 路径遍历攻击
- ✅ XSS攻击防护
- ✅ 超大文件（100MB）
- ✅ 超长文本（>1MB）
- ✅ 畸形JSON
- ✅ Content-Type错误
- ✅ Unicode注入
- ✅ 并发请求
- ✅ 缺少参数
- ✅ 额外参数
- ✅ 空文件名
- ✅ 中文文件名
- ✅ Emoji文件名
- ✅ 纯空格内容
- ✅ null请求体
- ✅ 空请求体
- ✅ 恶意HTML
- ✅ 超长打招呼语
- ✅ 数据类型错误
- ✅ 无效HTTP方法
- ✅ 缺少请求头
- ✅ Base64攻击
- ✅ 字符集混合

#### Service 边界测试

**文件**: `backend/.../CandidateResumeServiceEdgeTest.java`

**覆盖场景**:

- ✅ 路径遍历防护
- ✅ 特殊字符文件名
- ✅ 文件权限问题
- ✅ UTF-8编码
- ✅ 混合字符集
- ✅ 目录自动创建
- ✅ 符号链接防护
- ✅ JSON特殊字符
- ✅ 超长用户ID
- ✅ 空用户ID
- ✅ 空文件内容
- ✅ 纯空格内容
- ✅ 深层嵌套JSON
- ✅ 大数组处理
- ✅ 文件损坏
- ✅ BOM处理
- ✅ 并发文件创建
- ✅ 部分数据
- ✅ 空集合
- ✅ 事务一致性
- ✅ 资源清理
- ✅ Null安全

---

## E2E测试

### 测试场景

#### 1. 完整简历处理流程

**文件**: `frontend/e2e/resume-workflow.spec.ts`

**测试内容**:

- ✅ 完整的上传到保存流程
- ✅ 文件上传流程
- ✅ 重新生成打招呼语
- ✅ 解析结果展示
- ✅ 自动生成打招呼语
- ✅ 加载状态显示
- ✅ 拖拽上传
- ✅ 切换上传方式
- ✅ 按钮禁用状态
- ✅ 响应式设计（移动/平板/桌面）

#### 2. 文本解析流程

**文件**: `frontend/e2e/text-parsing.spec.ts`

**测试内容**:

- ✅ 标准简历解析
- ✅ 简短简历解析
- ✅ 不同类型简历（市场营销等）
- ✅ 特殊字符处理
- ✅ 空文本拒绝
- ✅ 纯空格拒绝
- ✅ 解析进度显示
- ✅ 字段完整性
- ✅ 编辑功能
- ✅ 帮助提示
- ✅ 结果可视化
- ✅ 技能标签展示

#### 3. 错误处理流程

**文件**: `frontend/e2e/error-handling.spec.ts`

**测试内容**:

- ✅ 空文本错误
- ✅ 文件格式错误
- ✅ 解析失败处理
- ✅ 错误提示清除
- ✅ API调用失败
- ✅ 打招呼语生成失败
- ✅ 极长文本处理
- ✅ 键盘导航
- ✅ 快速重复提交

#### 4. 简历管理流程

**文件**: `frontend/e2e/resume-management.spec.ts`

**测试内容**:

- ✅ 上传新简历
- ✅ 删除简历
- ✅ 删除后清空
- ✅ 删除确认
- ✅ 多次上传覆盖
- ✅ 页面刷新
- ✅ 数据持久化
- ✅ 视觉反馈
- ✅ Hover状态
- ✅ 焦点管理

#### 5. 用户体验流程

**文件**: `frontend/e2e/user-experience.spec.ts`

**测试内容**:

- ✅ Spinner显示
- ✅ 处理中文本
- ✅ 响应式布局（多尺寸）
- ✅ 键盘导航
- ✅ 无障碍访问
- ✅ ARIA标签
- ✅ 颜色对比度
- ✅ 移动端适配
- ✅ 触摸友好
- ✅ 滚动支持

#### 6. 性能测试

**文件**: `frontend/e2e/performance.spec.ts`

**测试内容**:

- ✅ 页面加载时间 < 3秒
- ✅ 解析响应时间 < 30秒
- ✅ UI交互响应 < 200ms
- ✅ FCP < 2秒
- ✅ TTI < 5秒
- ✅ 大文本不卡顿
- ✅ 内存使用 < 100MB
- ✅ 并发API调用
- ✅ 慢速网络适应

---

## 运行测试

### 前端测试

#### 运行所有单元测试

```bash
cd frontend
npm test
```

#### 运行特定测试文件

```bash
# 运行基础测试
npm test -- CompleteResumeManager.test.tsx

# 运行边界测试
npm test -- CompleteResumeManager.edge.test.tsx

# 运行所有边界测试
npm test -- --testPathPattern=edge.test
```

#### 查看测试覆盖率

```bash
npm test -- --coverage
```

#### 运行E2E测试

```bash
# 安装Playwright
npm install -D @playwright/test

# 运行所有E2E测试
npx playwright test

# 运行特定测试
npx playwright test resume-workflow

# 以调试模式运行
npx playwright test --debug

# 只在Chrome运行
npx playwright test --project=chromium

# 查看测试报告
npx playwright show-report
```

### 后端测试

#### 运行所有测试

```bash
cd backend/get_jobs
mvn test
```

#### 运行特定测试类

```bash
# 运行Controller测试
mvn test -Dtest=CandidateResumeControllerIntegrationTest

# 运行边界测试
mvn test -Dtest=CandidateResumeControllerEdgeTest

# 运行E2E测试
mvn test -Dtest=ResumeWorkflowE2ETest
```

#### 查看测试覆盖率

```bash
# 生成Jacoco报告
mvn jacoco:report

# 查看报告
open target/site/jacoco/index.html
```

---

## 测试报告

### 生成测试报告

#### 前端测试报告

```bash
cd frontend

# Jest测试报告
npm test -- --coverage --coverageReporters=html

# Playwright测试报告
npx playwright test --reporter=html
```

#### 后端测试报告

```bash
cd backend/get_jobs

# Surefire测试报告
mvn surefire-report:report

# Jacoco覆盖率报告
mvn jacoco:report

# 完整质量报告
mvn site
```

### 测试报告位置

| 类型           | 位置                                                |
| -------------- | --------------------------------------------------- |
| Jest覆盖率     | `frontend/coverage/lcov-report/index.html`          |
| Playwright报告 | `frontend/playwright-report/index.html`             |
| Jacoco报告     | `backend/get_jobs/target/site/jacoco/index.html`    |
| Surefire报告   | `backend/get_jobs/target/site/surefire-report.html` |

---

## CI/CD集成

### GitHub Actions工作流

创建文件: `.github/workflows/test.yml`

```yaml
name: 测试

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: 安装依赖
        run: cd frontend && npm ci

      - name: 运行单元测试
        run: cd frontend && npm test -- --coverage

      - name: 上传覆盖率
        uses: codecov/codecov-action@v3
        with:
          directory: frontend/coverage

  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '21'
          distribution: 'temurin'

      - name: 运行测试
        run: cd backend/get_jobs && mvn test

      - name: 生成覆盖率报告
        run: cd backend/get_jobs && mvn jacoco:report

  e2e-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: 安装Playwright
        run: cd frontend && npx playwright install --with-deps

      - name: 运行E2E测试
        run: cd frontend && npx playwright test

      - name: 上传测试报告
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

---

## 故障排除

### 常见问题

#### 1. 测试超时

**问题**: 测试运行超时

**解决方案**:

```javascript
// 增加超时时间
test('测试', async () => {
  // ...
}, 60000); // 60秒
```

#### 2. Mock不生效

**问题**: Mock的API没有被调用

**解决方案**:

```typescript
// 确保在正确位置mock
jest.mock('../../services/aiService');

// 验证mock被调用
expect(mockFunction).toHaveBeenCalled();
```

#### 3. E2E测试不稳定

**问题**: E2E测试偶尔失败

**解决方案**:

```typescript
// 使用waitFor增加容错性
await page.waitForSelector('text=处理中...', {
  state: 'hidden',
  timeout: 30000,
});

// 添加重试
test.describe.configure({ retries: 2 });
```

#### 4. 覆盖率不足

**问题**: 测试覆盖率低于目标

**解决方案**:

```bash
# 查看未覆盖的代码
npm test -- --coverage --verbose

# 针对性添加测试
```

---

## 最佳实践

### 编写测试

1. **使用描述性名称**

   ```typescript
   test('应该在文件大小超过10MB时显示错误', async () => {
     // ...
   });
   ```

2. **遵循AAA模式**

   ```typescript
   // Arrange - 准备
   const file = new File(...);

   // Act - 执行
   await uploadFile(file);

   // Assert - 断言
   expect(result).toBe(expected);
   ```

3. **隔离测试**

   ```typescript
   beforeEach(() => {
     // 每个测试前清理状态
     jest.clearAllMocks();
   });
   ```

4. **避免硬编码延迟**

   ```typescript
   // ❌ 不好
   await page.waitForTimeout(5000);

   // ✅ 好
   await page.waitForSelector('text=完成');
   ```

### 维护测试

1. **定期运行**
   - 每次提交前运行测试
   - PR合并前运行完整测试
   - 定期运行E2E测试

2. **更新测试**
   - 代码变更同步更新测试
   - 修复失败的测试
   - 删除过时的测试

3. **监控覆盖率**
   - 目标：65%+
   - 核心功能：80%+
   - 定期review覆盖率报告

---

## 附录

### A. 测试命令速查

```bash
# 前端
npm test                           # 所有单元测试
npm test -- --coverage             # 带覆盖率
npm test -- --watch                # 监听模式
npx playwright test                # E2E测试
npx playwright test --debug        # 调试模式
npx playwright test --ui           # UI模式

# 后端
mvn test                           # 所有测试
mvn test -Dtest=ClassName          # 特定类
mvn jacoco:report                  # 覆盖率
mvn test -DskipTests=false         # 强制运行
```

### B. 性能指标

| 指标         | 目标    | 当前   |
| ------------ | ------- | ------ |
| 页面加载时间 | < 3秒   | 待测试 |
| API响应时间  | < 1秒   | 待测试 |
| 解析时间     | < 30秒  | 待测试 |
| FCP          | < 2秒   | 待测试 |
| TTI          | < 5秒   | 待测试 |
| 内存使用     | < 100MB | 待测试 |
| 测试覆盖率   | > 65%   | 待测试 |

### C. 测试环境

| 环境     | URL                      | 用途     |
| -------- | ------------------------ | -------- |
| 本地开发 | http://localhost:3000    | 开发测试 |
| 测试环境 | http://115.190.182.95    | E2E测试  |
| 生产环境 | https://zhitoujianli.com | 烟雾测试 |

---

**文档版本**: v1.0
**最后更新**: 2025-10-11
**维护者**: 智投简历开发团队

---

_本指南持续更新中，如有问题请联系开发团队。_
