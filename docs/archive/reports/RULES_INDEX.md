# 📚 项目规则文档索引

> 快速找到您需要的规则文档

---

## 🎯 我想...

### 🔥 了解火山云开发环境

👉 **推荐阅读**: [`VOLCANO_CLOUD_QUICK_REFERENCE.md`](./VOLCANO_CLOUD_QUICK_REFERENCE.md)
📝 **内容**: 环境配置、路径速查、部署命令、故障排查
⏱️ **阅读时间**: 5-10分钟
💡 **适合**: 所有开发者，建议加入书签

---

### 📋 查看完整的开发规范

👉 **推荐阅读**: [`.cursorrules`](./.cursorrules)
📝 **内容**: 完整的项目规范、代码风格、安全要求、质量标准
⏱️ **阅读时间**: 15-20分钟
💡 **适合**: 新加入项目的开发者

---

### 📊 了解本次规则更新内容

👉 **推荐阅读**: [`RULES_UPDATE_REPORT.md`](./RULES_UPDATE_REPORT.md)
📝 **内容**: 详细的更新报告、文件变更、验证结果
⏱️ **阅读时间**: 10-15分钟
💡 **适合**: 想了解最新改动的开发者

---

### 🔍 验证规则配置是否正确

👉 **运行脚本**: `./verify-rules.sh`
📝 **功能**: 自动检查所有规则配置、环境信息、服务状态
⏱️ **执行时间**: < 1分钟
💡 **建议**: 每次开始开发前运行一次

```bash
cd /root/zhitoujianli
./verify-rules.sh
```

---

### 🗺️ 查看规则体系总览

👉 **推荐阅读**: [`RULES_ENHANCEMENT_SUMMARY.md`](./RULES_ENHANCEMENT_SUMMARY.md)
📝 **内容**: 规则体系架构、关键改进点、检查清单
⏱️ **阅读时间**: 10-15分钟
💡 **适合**: 项目负责人和架构师

---

## 🚀 快速开始流程

### 第一次接触项目

```
1. 阅读 VOLCANO_CLOUD_QUICK_REFERENCE.md（必读）
   ↓
2. 阅读 .cursorrules（必读）
   ↓
3. 运行 ./verify-rules.sh 验证环境
   ↓
4. 开始开发
```

### 日常开发

```
1. 运行 ./verify-rules.sh 验证环境
   ↓
2. 参考 VOLCANO_CLOUD_QUICK_REFERENCE.md 查找命令
   ↓
3. 遵循 .cursorrules 中的规范编码
   ↓
4. 部署前再次运行验证脚本
```

---

## 📂 文件结构

```
/root/zhitoujianli/
│
├── 🔥 核心规则文件
│   └── .cursorrules                           # 主规则文件（AI自动遵守）
│
├── 📖 规则文档
│   ├── RULES_INDEX.md                         # 本文档（文档索引）
│   ├── RULES_UPDATE_REPORT.md                 # 更新报告
│   ├── RULES_ENHANCEMENT_SUMMARY.md           # 规则完善总结
│   └── VOLCANO_CLOUD_QUICK_REFERENCE.md       # 火山云快速参考
│
├── 🔧 验证脚本
│   └── verify-rules.sh                        # 规则验证脚本
│
└── 📁 项目目录
    ├── frontend/                              # 前端代码
    ├── backend/get_jobs/                      # 后端代码
    └── ...
```

---

## 🎯 按角色查看

### 👨‍💻 前端开发者

**必读文档**:

1. `VOLCANO_CLOUD_QUICK_REFERENCE.md` - 环境和命令
2. `.cursorrules` - 第26-50行（前端代码规范）
3. `.cursorrules` - 第82-90行（前端代码质量）

**常用命令**:

```bash
cd /root/zhitoujianli/frontend
npm run dev:frontend
npm run build:frontend
npm run lint
npm run code-quality
```

---

### 👨‍💼 后端开发者

**必读文档**:

1. `VOLCANO_CLOUD_QUICK_REFERENCE.md` - 环境和命令
2. `.cursorrules` - 第36-42行（后端代码规范）
3. `.cursorrules` - 第92-99行（后端代码质量）

**常用命令**:

```bash
cd /root/zhitoujianli/backend/get_jobs
mvn clean package
mvn test
mvn checkstyle:check
```

---

### 🚀 DevOps/部署人员

**必读文档**:

1. `VOLCANO_CLOUD_QUICK_REFERENCE.md` - 部署流程
2. `.cursorrules` - 第257-307行（部署和运维）
3. `RULES_UPDATE_REPORT.md` - 部署架构

**常用命令**:

```bash
# 前端部署
cd /root/zhitoujianli/frontend
npm run build:frontend
sudo cp -r dist/* /var/www/zhitoujianli/

# Nginx重载
sudo nginx -t && sudo nginx -s reload

# 验证部署
curl https://www.zhitoujianli.com
```

---

### 👔 项目经理/架构师

**必读文档**:

1. `RULES_ENHANCEMENT_SUMMARY.md` - 规则体系总览
2. `RULES_UPDATE_REPORT.md` - 更新报告和验证结果
3. `.cursorrules` - 完整规范

**关注重点**:

- 代码质量标准
- 测试覆盖率（≥60%）
- 安全性要求
- 性能优化

---

## 📊 文档对比

| 文档                                 | 详细程度   | 技术深度 | 阅读时间  | 推荐场景     |
| ------------------------------------ | ---------- | -------- | --------- | ------------ |
| **VOLCANO_CLOUD_QUICK_REFERENCE.md** | ⭐⭐⭐     | ⭐⭐     | 5-10分钟  | 日常开发速查 |
| **.cursorrules**                     | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 15-20分钟 | 完整规范学习 |
| **RULES_UPDATE_REPORT.md**           | ⭐⭐⭐⭐   | ⭐⭐⭐   | 10-15分钟 | 了解最新更新 |
| **RULES_ENHANCEMENT_SUMMARY.md**     | ⭐⭐⭐⭐   | ⭐⭐⭐   | 10-15分钟 | 规则体系学习 |

---

## ❓ 常见问题

### Q1: 我应该先看哪个文档？

**A**: 建议按以下顺序：

1. `VOLCANO_CLOUD_QUICK_REFERENCE.md`（了解环境）
2. `.cursorrules`（学习规范）
3. 运行 `./verify-rules.sh`（验证配置）

### Q2: 规则会自动生效吗？

**A**: 是的！`.cursorrules` 文件会被 Cursor AI 自动读取并遵守。每次对话都会自动应用这些规则。

### Q3: 如何验证规则是否正确配置？

**A**: 运行验证脚本：

```bash
cd /root/zhitoujianli
./verify-rules.sh
```

### Q4: 我在本地开发可以吗？

**A**: ⚠️ **不可以**！本项目**必须在火山云服务器上开发**，不支持本地开发环境。所有操作都在 `/root/zhitoujianli` 路径下进行。

### Q5: 如何快速查找部署命令？

**A**: 查看 `VOLCANO_CLOUD_QUICK_REFERENCE.md` 的"快速部署命令"章节。

### Q6: 规则文档会更新吗？

**A**: 是的。随着项目发展，规则会定期更新。每次更新都会生成新的 `RULES_UPDATE_REPORT.md`。

---

## 🔖 书签推荐

建议将以下文件加入您的浏览器书签或IDE收藏夹：

1. **日常开发必备**:
   - `VOLCANO_CLOUD_QUICK_REFERENCE.md`

2. **规范参考**:
   - `.cursorrules`

3. **问题排查**:
   - `verify-rules.sh`

---

## 📞 获取帮助

### 文档相关问题

- 查看本索引文件找到对应文档
- 运行 `./verify-rules.sh` 自动诊断

### 开发规范问题

- 查看 `.cursorrules` 文件
- 参考 `VOLCANO_CLOUD_QUICK_REFERENCE.md` 示例

### 环境配置问题

- 查看 `VOLCANO_CLOUD_QUICK_REFERENCE.md` 故障排查部分
- 运行 `./verify-rules.sh` 获取诊断信息

---

## 🎯 关键要点

记住这些最重要的规则：

1. 🔥 **我们在火山云服务器开发，不是本地环境**
2. 📁 **始终使用绝对路径 `/root/zhitoujianli/`**
3. ✨ **代码必须包含 TypeScript 类型定义和错误处理**
4. 🔐 **安全性和性能是首要考虑因素**
5. 🇨🇳 **所有注释和文档使用中文**
6. ✅ **测试覆盖率必须 ≥60%**
7. 🚀 **遵循标准化的部署流程**
8. 📝 **Git 提交必须符合规范格式**

---

## 📈 持续改进

我们的规则体系会持续改进：

- ✅ **v1.0**: 初始规则（2025-01-27）
- ✅ **v1.1**: 添加火山云环境配置（2025-10-16）
- 🔄 **未来**: 根据反馈持续优化

---

**最后更新**: 2025-10-16
**维护者**: ZhiTouJianLi Development Team
**版本**: v1.0

---

💡 **提示**: 将本文件加入书签，作为规则文档的入口！
