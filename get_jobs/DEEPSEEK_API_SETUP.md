# DeepSeek API 配置指南

## 📋 概述

本项目已从Ollama本地API迁移到DeepSeek云端API，提供更稳定的AI服务。

## 🔧 配置步骤

### 1. 获取DeepSeek API密钥

1. 访问 [DeepSeek平台](https://platform.deepseek.com/)
2. 注册/登录账号
3. 创建API密钥
4. 记录API密钥（格式：`sk-xxxxxxxxxxxxxxxx`）

### 2. 配置环境变量

在项目根目录的`.env`文件中配置以下参数：

```bash
# ========== AI API配置 - 使用DeepSeek API ==========
BASE_URL=https://api.deepseek.com
API_KEY=sk-your_deepseek_api_key_here
MODEL=deepseek-chat
```

### 3. 验证配置

运行测试脚本验证配置：

```bash
./test_ai_greeting.sh
```

## 🚀 功能特性

- ✅ **统一API接口**：所有AI功能都使用DeepSeek API
- ✅ **智能打招呼语**：基于简历和岗位要求生成个性化打招呼语
- ✅ **稳定可靠**：云端服务，无需本地部署
- ✅ **快速响应**：优化的超时设置（60秒）

## 📊 API使用情况

DeepSeek API提供详细的用量统计：
- 请求ID追踪
- Token使用量统计
- 响应时间监控
- 错误日志记录

## 🔍 故障排除

### 常见问题

1. **API密钥无效（401错误）**
   ```
   解决方案：检查.env文件中的API_KEY是否正确配置
   ```

2. **连接超时**
   ```
   解决方案：检查网络连接，DeepSeek API需要稳定的网络环境
   ```

3. **生成内容为空**
   ```
   解决方案：检查候选人简历文件是否存在且格式正确
   ```

### 日志查看

查看应用程序日志中的AI相关信息：
```bash
tail -f logs/app.log | grep "智能打招呼"
```

## 📝 更新日志

- **2025-10-01**：从Ollama迁移到DeepSeek API
- **2025-10-01**：优化错误处理和超时控制
- **2025-10-01**：移除Ollama相关代码和配置

## 🆘 技术支持

如遇到问题，请检查：
1. API密钥是否正确配置
2. 网络连接是否正常
3. 候选人简历文件是否存在
4. 应用程序日志中的错误信息
