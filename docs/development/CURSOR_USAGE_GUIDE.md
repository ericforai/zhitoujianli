# Cursor开发指南

## 📖 概述

本指南介绍如何在智投简历项目中使用Cursor进行高效开发，包括项目配置、AI助手使用和最佳实践。

---

## 🔧 Cursor配置

### 项目配置文件

项目已经为您配置了以下Cursor文件：

#### `.cursorrules` - 项目规则
- 定义了项目的技术栈和开发规范
- 设置了代码风格和质量要求
- 配置了安全、性能和测试要求
- 提供了常见的代码模式示例

#### `.cursor/settings.json` - Cursor设置
- 启用了AI助手功能
- 配置了模型参数和上下文窗口
- 设置了工作区包含范围
- 自定义了AI指令

#### `.cursor/prompts.json` - 自定义提示词
- 预定义了常用的开发场景提示词
- 包括代码审查、重构、调试等
- 针对项目特点定制了提示内容

#### `.cursor/chat-templates.json` - 聊天模板
- 提供了标准化的对话模板
- 便于快速开始特定类型的对话
- 包含功能开发、Bug修复等场景

---

## 🤖 AI助手使用指南

### 基本使用方式

#### 1. 代码生成
```typescript
// 提示：请帮我创建一个用户登录组件
// AI会根据.cursorrules中的规范生成代码

interface LoginProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  isLoading?: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, isLoading = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onLogin({ email, password });
    } catch (error) {
      // 错误处理
    }
  }, [onLogin, email, password]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 表单内容 */}
    </form>
  );
};
```

#### 2. 代码审查
```
提示：请审查以下代码
```typescript
const userService = {
  getUser: async (id) => {
    return fetch(`/api/users/${id}`);
  }
};
```

AI回复：
1. **类型安全**: 缺少TypeScript类型定义
2. **错误处理**: 没有异常处理机制
3. **安全性**: 直接使用用户输入构建URL
4. **性能**: 没有缓存机制
5. **测试**: 缺少单元测试

建议改进：
- 添加类型定义
- 实现错误处理
- 添加参数验证
- 考虑添加缓存
```

#### 3. 代码重构
```
提示：请重构这个组件，提高可维护性
```typescript
const UserProfile = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateUser = async (data) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('更新失败');
      // 更新逻辑
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 组件渲染逻辑...
};
```

AI回复：
建议使用自定义Hook分离业务逻辑：

```typescript
// 自定义Hook
const useUserUpdate = (userId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUser = useCallback(async (data: UserUpdateData) => {
    setLoading(true);
    setError(null);

    try {
      await userService.updateUser(userId, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { updateUser, loading, error };
};

// 组件
const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const { updateUser, loading, error } = useUserUpdate(user.id);

  // 组件渲染逻辑...
};
```

### 高级功能使用

#### 1. 使用自定义提示词

在Cursor中，您可以使用预定义的提示词：

```
@code-review 请审查这段代码
@refactor 请重构这个函数
@debug 请帮我调试这个问题
@optimize 请优化这段代码的性能
@security 请检查安全问题
@test 请生成测试用例
@documentation 请编写文档
@api-design 请设计API接口
@database 请设计数据库表
@deployment 请提供部署方案
```

#### 2. 使用聊天模板

```
# 功能开发
我需要开发一个新功能：用户权限管理。请帮我：1. 分析需求 2. 设计架构 3. 编写代码 4. 添加测试 5. 更新文档。

# Bug修复
我遇到了一个Bug：用户登录后页面不跳转。请帮我：1. 分析问题原因 2. 提供解决方案 3. 编写修复代码 4. 添加测试用例 5. 验证修复效果。

# 代码审查
请审查以下代码：
```typescript
// 您的代码
```
请检查：1. 代码质量 2. 安全性 3. 性能 4. 可维护性 5. 测试覆盖。
```

#### 3. 上下文感知开发

Cursor会基于以下上下文提供建议：
- 当前打开的文件
- 项目结构
- Git历史
- 最近的修改
- 工作区配置

---

## 💡 最佳实践

### 1. 有效的提示技巧

#### 具体明确的提示
```
❌ 不好的提示：
帮我写个组件

✅ 好的提示：
请帮我创建一个用户登录组件，要求：
- 使用TypeScript和React Hooks
- 支持邮箱和密码登录
- 包含表单验证和错误处理
- 使用Tailwind CSS样式
- 遵循项目的代码规范
```

#### 提供足够的上下文
```
请帮我优化这个API接口的性能，当前的问题：
- 响应时间超过2秒
- 数据库查询较慢
- 没有缓存机制

接口代码：
```typescript
// 您的代码
```

期望的优化目标：
- 响应时间降低到500ms以下
- 支持并发访问
- 添加缓存策略
```

### 2. 迭代式开发

#### 第一步：基础实现
```
请帮我创建一个基础的简历解析服务
```

#### 第二步：功能完善
```
请为简历解析服务添加错误处理和日志记录
```

#### 第三步：性能优化
```
请优化简历解析服务的性能，添加缓存和异步处理
```

#### 第四步：测试完善
```
请为简历解析服务添加完整的单元测试和集成测试
```

### 3. 代码质量保证

#### 使用AI进行代码审查
```
@code-review 请审查我刚写的这个组件，重点关注：
1. TypeScript类型安全
2. React最佳实践
3. 性能优化
4. 可访问性
```

#### 使用AI生成测试
```
@test 请为以下代码生成测试用例：
```typescript
// 您的代码
```

要求：
- 覆盖所有主要功能
- 包含边界条件测试
- 包含错误情况测试
- 使用Jest和React Testing Library
```

---

## 🎯 常见使用场景

### 1. 新功能开发

```
我需要开发一个智能简历匹配功能，请帮我：

1. 分析需求：
   - 用户上传简历
   - 系统解析简历内容
   - 与岗位要求进行匹配
   - 返回匹配度评分

2. 设计架构：
   - 前端组件设计
   - 后端API设计
   - 数据库设计
   - AI服务集成

3. 编写代码：
   - 遵循项目规范
   - 包含错误处理
   - 添加类型定义
   - 考虑性能优化

4. 添加测试：
   - 单元测试
   - 集成测试
   - 端到端测试

5. 更新文档：
   - API文档
   - 用户文档
   - 部署文档
```

### 2. Bug修复

```
我遇到了一个登录Bug：
- 用户输入正确的邮箱和密码
- 点击登录按钮后页面卡住
- 控制台显示网络错误

相关代码：
```typescript
// 登录组件代码
// API服务代码
```

请帮我：
1. 分析问题原因
2. 提供解决方案
3. 编写修复代码
4. 添加测试用例
5. 验证修复效果
```

### 3. 代码重构

```
请帮我重构这个用户服务类，目标是：
- 提高代码可读性
- 增强错误处理
- 优化性能
- 提高可测试性

当前代码：
```java
// 您的Java代码
```

请提供重构方案和优化建议。
```

### 4. 性能优化

```
以下代码存在性能问题：
- API响应时间过长
- 内存使用量高
- 数据库查询慢

问题代码：
```typescript
// 您的代码
```

请分析性能瓶颈并提供优化方案。
```

---

## 🔍 调试和问题解决

### 1. 使用AI调试

```
我遇到了一个TypeScript编译错误：
```
error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'
```

相关代码：
```typescript
// 您的代码
```

请帮我分析错误原因并提供解决方案。
```

### 2. 性能问题诊断

```
我的应用运行缓慢，请帮我诊断性能问题：
- 页面加载时间超过5秒
- 内存使用量持续增长
- 某些操作会卡顿

相关代码：
```typescript
// 您的代码
```

请分析可能的性能瓶颈并提供优化建议。
```

### 3. 安全漏洞检查

```
请检查以下代码是否存在安全漏洞：
```typescript
// 您的代码
```

重点关注：
- XSS攻击
- CSRF攻击
- SQL注入
- 敏感信息泄露
```

---

## 📚 学习资源

### 1. Cursor官方文档
- [Cursor官网](https://cursor.sh/)
- [Cursor文档](https://cursor.sh/docs)
- [Cursor GitHub](https://github.com/getcursor/cursor)

### 2. AI编程最佳实践
- [AI辅助编程技巧](https://cursor.sh/docs/ai-features)
- [提示工程指南](https://cursor.sh/docs/prompting)
- [代码生成最佳实践](https://cursor.sh/docs/code-generation)

### 3. 项目相关文档
- `docs/development/DEVELOPMENT_STANDARDS.md` - 开发规范
- `docs/development/COMMIT_GUIDE.md` - 提交规范
- `docs/development/CODE_REVIEW_GUIDE.md` - 代码审查

---

## 🆘 常见问题

### Q: Cursor AI回复不准确怎么办？
A:
1. 检查`.cursorrules`配置是否正确
2. 提供更具体的上下文信息
3. 使用更明确的提示词
4. 分步骤进行对话

### Q: 如何让AI更好地理解项目结构？
A:
1. 确保`.cursor/settings.json`中启用了相关选项
2. 保持工作区文件整洁
3. 使用有意义的文件名和目录结构
4. 在对话中提供项目背景信息

### Q: AI生成的代码不符合项目规范怎么办？
A:
1. 检查`.cursorrules`文件是否完整
2. 在提示中明确要求遵循项目规范
3. 使用`@code-review`提示词进行审查
4. 手动调整不符合规范的代码

### Q: 如何提高AI对话效率？
A:
1. 使用预定义的提示词模板
2. 提供清晰的问题描述
3. 包含相关的代码上下文
4. 分步骤进行复杂任务

---

## 📈 进阶技巧

### 1. 自定义AI指令
在`.cursorrules`中添加项目特定的指令：
```
当生成API代码时，总是包含：
- 参数验证
- 错误处理
- 日志记录
- 单元测试
```

### 2. 使用AI进行架构设计
```
请设计一个微服务架构，用于处理：
- 用户认证
- 简历解析
- 岗位匹配
- 消息通知

要求：
- 高可用性
- 可扩展性
- 安全性
- 性能优化
```

### 3. 自动化测试生成
```
请为整个用户认证流程生成测试用例：
- 注册流程
- 登录流程
- 密码重置
- 权限验证

使用Jest和React Testing Library。
```

---

通过合理使用Cursor的AI功能，您可以显著提高开发效率，同时确保代码质量和项目规范的一致性。记住，AI是一个强大的助手，但最终的代码质量和架构决策仍需要开发者的专业判断。

---

**文档版本**: v1.0
**最后更新**: 2025-01-27
**维护团队**: ZhiTouJianLi Development Team
