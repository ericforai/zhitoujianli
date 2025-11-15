# 智能打招呼语问题诊断指南

## 📋 问题描述

智能打招呼语功能未生效，所有投递都使用默认打招呼语。

## 🔍 诊断步骤

### 1. 检查配置是否启用

```bash
# 检查enableSmartGreeting配置
grep "enableSmartGreeting" /opt/zhitoujianli/backend/user_data/*/config.json

# 期望输出：应该显示 "enableSmartGreeting": true
```

### 2. 检查日志文件

查看最近的投递日志，查找以下关键日志：

```bash
# 查看最近的日志
tail -200 /opt/zhitoujianli/backend/target/logs/job.$(date +%Y-%m-%d).log | grep -E "【打招呼语】|【智能打招呼】|【完整JD】"
```

### 3. 关键日志标识

#### ✅ 正常流程日志

```
【打招呼语】开始生成打招呼语，岗位: XXX
【打招呼语】✅ 智能打招呼已启用，开始生成个性化打招呼语
【打招呼语】✅ 获取到用户ID: XXX (来源: 系统属性(boss.user.id))
【打招呼语】开始查找简历文件，用户ID: XXX, 邮箱格式: XXX
【打招呼语】✅ 找到简历文件: XXX
【简历信息】职位: XXX, 工作年限: XXX, 技能数: XXX, 核心优势数: XXX
【完整JD】✅ 抓取成功，总长度: XXX字
【智能打招呼】开始调用AI生成，岗位: XXX, JD长度: XXX字
【智能打招呼】✅ 成功生成，长度: XXX字，内容预览: XXX
```

#### ❌ 常见问题日志

**问题1: 智能打招呼未启用**
```
【打招呼语】智能打招呼未启用（enableSmartGreeting=false），使用默认招呼语
```
**解决方案**: 检查配置文件，确保 `enableSmartGreeting: true`

**问题2: 用户ID未传递**
```
【打招呼语】❌ 未提供用户ID（boss.user.id或BOSS_USER_ID），无法生成智能打招呼语
```
**解决方案**: 检查BossExecutionService是否正确设置了用户ID环境变量

**问题3: 简历文件未找到**
```
【打招呼语】❌ 未找到简历文件，已尝试的路径: XXX
```
**解决方案**:
- 检查简历文件是否存在：`ls -la /opt/zhitoujianli/backend/user_data/*/candidate_resume.json`
- 检查用户ID格式是否正确
- 检查USER_DATA_DIR环境变量

**问题4: 完整JD为空**
```
【完整JD】⚠️ 未能抓取到任何岗位描述内容
【智能打招呼】⚠️ 完整JD为空，无法生成个性化打招呼语，使用默认招呼语
```
**解决方案**:
- 检查Boss直聘页面结构是否变化
- 检查选择器是否正确：`div.job-sec-text`, `div.job-detail-content`, `div.job-detail-section`

**问题5: AI生成超时**
```
【智能打招呼】❌ AI响应超时（超过120秒），使用默认招呼语
```
**解决方案**:
- 检查网络连接
- 检查AI服务配置（API_KEY等）
- 考虑增加超时时间或优化Prompt

**问题6: AI生成失败**
```
【智能打招呼】❌ 生成失败: XXX
```
**解决方案**:
- 查看详细错误信息
- 检查AI服务连接
- 检查API密钥是否有效

## 🛠️ 快速诊断命令

```bash
# 1. 检查配置
echo "=== 检查配置 ==="
grep "enableSmartGreeting" /opt/zhitoujianli/backend/user_data/*/config.json

# 2. 检查简历文件
echo "=== 检查简历文件 ==="
ls -la /opt/zhitoujianli/backend/user_data/*/candidate_resume.json

# 3. 检查最近日志
echo "=== 检查最近日志 ==="
tail -100 /opt/zhitoujianli/backend/target/logs/job.$(date +%Y-%m-%d).log | grep -E "【打招呼语】|【智能打招呼】"

# 4. 检查用户ID传递
echo "=== 检查用户ID传递 ==="
grep -r "BOSS_USER_ID\|boss.user.id" /opt/zhitoujianli/backend/logs/ 2>/dev/null | tail -5
```

## 📊 修复后的增强日志

修复后，所有关键步骤都会输出INFO级别的日志，包括：

1. **打招呼语生成开始** - 记录岗位名称
2. **智能打招呼启用状态** - 记录配置值
3. **用户ID获取** - 记录用户ID和来源（系统属性/环境变量）
4. **简历文件查找** - 记录所有尝试的路径和结果
5. **简历信息加载** - 记录职位、年限、技能、优势数量
6. **完整JD抓取** - 记录JD长度和抓取状态
7. **AI生成过程** - 记录开始、成功、失败、超时等状态
8. **错误详情** - 记录异常类型、错误消息、根本原因

## 🔧 修复内容总结

### 1. 增强日志输出
- 所有关键步骤都使用INFO级别日志
- 添加详细的错误信息和可能原因
- 记录用户ID来源（系统属性/环境变量）

### 2. 增强错误处理
- 检查完整JD是否为空
- 检查AI响应是否为空
- 详细的异常类型和根本原因记录

### 3. 增强诊断信息
- 记录所有尝试的简历文件路径
- 记录JD抓取的选择器
- 记录AI生成失败的可能原因

## 📝 下一步

1. 重新构建后端
2. 执行一次投递测试
3. 查看日志，确认问题点
4. 根据日志信息进行针对性修复

