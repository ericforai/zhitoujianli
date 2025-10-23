# 智投简历 - 测试执行指南

## 📋 目录

1. [测试环境准备](#测试环境准备)
2. [快速开始](#快速开始)
3. [测试分类](#测试分类)
4. [测试执行](#测试执行)
5. [测试报告](#测试报告)
6. [常见问题](#常见问题)

---

## 测试环境准备

### 环境要求

**后端测试**:
- Java 21
- Maven 3.8+
- PostgreSQL（可选，测试使用H2内存数据库）

**前端测试**:
- Node.js 18+
- npm 9+

**E2E测试**:
- Chromium浏览器（Playwright自动下载）
- 后端服务运行在 `http://localhost:8080`
- 前端服务运行在 `http://localhost:3000`

### 安装依赖

```bash
# 后端依赖
cd backend/get_jobs
mvn clean install

# 前端依赖
cd frontend
npm install

# E2E测试依赖
npm install -D @playwright/test
npx playwright install
```

---

## 快速开始

### 方式1：使用自动化脚本（推荐）

```bash
# 运行所有测试
./tests/run-all-tests.sh

# 只运行后端测试
./tests/run-all-tests.sh --backend-only

# 只运行前端测试
./tests/run-all-tests.sh --frontend-only

# 跳过E2E测试（加快速度）
./tests/run-all-tests.sh --skip-e2e

# 显示详细输出
./tests/run-all-tests.sh --verbose
```

### 方式2：手动执行

**后端测试**:
```bash
cd backend/get_jobs
mvn test
```

**前端测试**:
```bash
cd frontend
npm test
```

**E2E测试**:
```bash
npx playwright test tests/e2e
```

---

## 测试分类

### 按模块分类

| 模块 | 测试文件 | 测试数量 | 优先级 |
|------|---------|---------|--------|
| 邮箱注册功能 | `AuthControllerTest.java`<br/>`Register.test.tsx` | 15+ | P0 |
| 简历上传与AI解析 | `CandidateResumeControllerTest.java` | 20+ | P0 |
| 生成默认打招呼语 | `SmartGreetingServiceTest.java` | 12+ | P1 |
| 设置投递选项 | `BossConfigTest.java` | 15+ | P1 |
| 岗位投递 | `BossTest.java` | 18+ | P0 |
| 多用户管理 | `UserManagementTest.java` | 11+ | P1 |

### 按测试类型分类

**单元测试（Unit Tests）**:
- 位置：`src/test/java/`
- 框架：JUnit 5 + Mockito
- 执行速度：快（<1秒）
- 覆盖：Service层、Util类

**集成测试（Integration Tests）**:
- 位置：`src/test/java/controller/`
- 框架：Spring Boot Test + MockMvc
- 执行速度：中等（1-5秒）
- 覆盖：Controller层、API接口

**组件测试（Component Tests）**:
- 位置：`frontend/src/components/__tests__/`
- 框架：Jest + React Testing Library
- 执行速度：快（<2秒）
- 覆盖：React组件

**E2E测试（End-to-End Tests）**:
- 位置：`tests/e2e/`
- 框架：Playwright
- 执行速度：慢（10-60秒）
- 覆盖：完整用户流程

---

## 测试执行

### 执行优先级

**P0（必须通过）**:
```bash
# 核心功能测试
mvn test -Dtest=AuthControllerTest
mvn test -Dtest=CandidateResumeControllerTest

cd frontend && npm test -- Register.test.tsx
```

**P1（重要）**:
```bash
# 扩展功能测试
mvn test -Dtest=SmartGreetingServiceTest
mvn test -Dtest=BossConfigTest
```

**P2（可选）**:
```bash
# 性能测试、安全测试
mvn test -Dtest=PerformanceTest
```

### 并行执行

**Maven并行测试**:
```bash
mvn test -T 4  # 使用4个线程并行
```

**Jest并行测试**:
```bash
npm test -- --maxWorkers=4
```

### 持续集成（CI）

**GitHub Actions示例**:
```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 21
        uses: actions/setup-java@v3
        with:
          java-version: '21'
      - name: Run backend tests
        run: cd backend/get_jobs && mvn test
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Run frontend tests
        run: cd frontend && npm install && npm test
```

---

## 测试报告

### 后端测试报告

**Surefire报告**:
```bash
# 生成HTML报告
mvn surefire-report:report

# 报告位置
open backend/get_jobs/target/site/surefire-report.html
```

**覆盖率报告（JaCoCo）**:
```bash
# 生成覆盖率报告
mvn jacoco:report

# 报告位置
open backend/get_jobs/target/site/jacoco/index.html
```

### 前端测试报告

**Jest HTML报告**:
```bash
# 生成覆盖率报告
npm test -- --coverage

# 报告位置
open frontend/coverage/lcov-report/index.html
```

### E2E测试报告

**Playwright报告**:
```bash
# 运行测试并生成报告
npx playwright test --reporter=html

# 查看报告
npx playwright show-report
```

### 测试报告模板

测试完成后，在 `test-results/` 目录下会生成：

```
test-results/
├── test_run_20251022_143020.log       # 完整测试日志
├── summary_20251022_143020.txt         # 测试摘要
└── failed_tests_20251022_143020.txt    # 失败测试列表
```

---

## 常见问题

### Q1: Maven测试失败：Could not find or load main class

**解决方案**:
```bash
mvn clean install
mvn test
```

### Q2: 前端测试失败：Module not found

**解决方案**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Q3: E2E测试失败：Connection refused

**原因**: 前后端服务未启动

**解决方案**:
```bash
# 终端1：启动后端
cd backend/get_jobs
mvn spring-boot:run

# 终端2：启动前端
cd frontend
npm start

# 终端3：运行E2E测试
npx playwright test
```

### Q4: 测试数据库冲突

**解决方案**:
```bash
# 清理测试数据库
mvn clean
```

### Q5: Playwright浏览器未安装

**解决方案**:
```bash
npx playwright install
```

### Q6: 测试超时

**原因**: AI服务响应慢或网络问题

**解决方案**:
```bash
# 增加超时时间
mvn test -Dtest.timeout=300

# 或在测试中使用Mock
```

### Q7: 邮件服务测试失败

**原因**: 邮件服务未配置

**解决方案**:
- 测试会自动使用演示模式
- 或配置真实邮件服务：编辑 `application-test.properties`

---

## 测试最佳实践

### 1. 测试隔离

✅ **好的做法**:
```java
@BeforeEach
void setUp() {
    // 每个测试前重置状态
    testData = createTestData();
}

@AfterEach
void tearDown() {
    // 清理测试数据
    cleanupTestData();
}
```

❌ **不好的做法**:
```java
// 测试之间共享状态
static User testUser;

@Test
void test1() {
    testUser = new User(); // 影响test2
}

@Test
void test2() {
    testUser.setName("changed"); // 依赖test1
}
```

### 2. 测试命名

✅ **好的命名**:
```java
@Test
void testUploadPDFResume_Success()

@Test
void testEmailValidation_InvalidFormats()
```

❌ **不好的命名**:
```java
@Test
void test1()

@Test
void testUpload()
```

### 3. 断言清晰

✅ **好的断言**:
```java
assertEquals(5, result.size(),
    "应该解析出5个技能");
```

❌ **不好的断言**:
```java
assertEquals(5, result.size());
```

### 4. Mock使用

✅ **适当使用Mock**:
```java
// Mock外部服务
when(aiService.parse(any())).thenReturn(mockResult);
```

❌ **过度Mock**:
```java
// Mock所有依赖，测试失去意义
when(service.method1()).thenReturn(x);
when(service.method2()).thenReturn(y);
// ...
```

---

## 测试维护

### 定期更新

- **每周**: 运行完整测试套件
- **每次发布前**: 运行P0和P1测试
- **代码合并前**: 运行相关模块测试

### 测试债务管理

- 标记失败的测试：`@Disabled("Issue #123")`
- 记录已知问题：在测试中添加注释
- 定期清理：删除过时的测试

### 测试覆盖率目标

- 单元测试覆盖率：≥ 70%
- 集成测试覆盖率：≥ 60%
- 核心功能覆盖率：≥ 90%

---

## 联系与支持

如有问题，请联系：
- 测试团队：test@zhitoujianli.com
- 技术文档：https://docs.zhitoujianli.com
- 问题报告：https://github.com/zhitoujianli/issues

---

**最后更新**: 2025-10-22
**版本**: v1.0





