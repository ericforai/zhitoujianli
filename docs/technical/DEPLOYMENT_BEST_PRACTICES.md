# 部署最佳实践

**创建日期**: 2025-11-15
**最后更新**: 2025-11-15

---

## 🚨 重要原则

### 1. 代码修改后必须提交到Git

**问题**:
- 修改代码后没有提交到Git
- 重新构建或部署时可能丢失修改
- 团队成员无法看到最新修改

**解决方案**:
```bash
# ✅ 正确的流程
1. 修改代码
2. git add <修改的文件>
3. git commit -m "描述修改内容"
4. git push（可选，但建议）
5. 构建和部署
```

**检查清单**:
- [ ] 修改代码后立即检查 `git status`
- [ ] 确保所有修改都已提交
- [ ] 部署前确认代码已提交

---

### 2. 构建前检查未提交的修改

**问题**:
- 构建时可能使用未提交的代码
- 如果构建失败或需要回滚，修改可能丢失

**解决方案**:
```bash
# 在构建脚本中添加检查
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  警告：有未提交的修改"
    echo "请先提交修改："
    echo "  git add ."
    echo "  git commit -m '描述'"
    read -p "是否继续构建？(y/n) " -n 1 -r
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
```

---

### 3. 部署前验证构建输出

**问题**:
- 构建可能失败但没有报错
- 部署了错误的构建文件

**解决方案**:
```bash
# 检查构建输出
if [ ! -f "frontend/build/index.html" ]; then
    echo "❌ 构建失败：找不到index.html"
    exit 1
fi

# 检查构建文件大小（防止空构建）
BUILD_SIZE=$(du -s frontend/build | awk '{print $1}')
if [ "$BUILD_SIZE" -lt 1000 ]; then
    echo "❌ 构建文件太小，可能构建失败"
    exit 1
fi
```

---

### 4. 使用版本控制标记部署

**问题**:
- 不知道部署的是哪个版本的代码
- 无法回滚到特定版本

**解决方案**:
```bash
# 在部署脚本中记录Git版本
GIT_COMMIT=$(git rev-parse HEAD)
GIT_BRANCH=$(git branch --show-current)
echo "部署信息：" > /var/www/zhitoujianli/build/DEPLOY_INFO.txt
echo "Git Commit: $GIT_COMMIT" >> /var/www/zhitoujianli/build/DEPLOY_INFO.txt
echo "Git Branch: $GIT_BRANCH" >> /var/www/zhitoujianli/build/DEPLOY_INFO.txt
echo "部署时间: $(date)" >> /var/www/zhitoujianli/build/DEPLOY_INFO.txt
```

---

### 5. 部署后验证

**问题**:
- 部署后没有验证功能是否正常
- 问题发现太晚

**解决方案**:
```bash
# 部署后验证
echo "🔍 验证部署..."

# 检查文件是否存在
if [ ! -f "/var/www/zhitoujianli/build/index.html" ]; then
    echo "❌ 部署失败：index.html不存在"
    exit 1
fi

# 检查文件时间戳
FILE_TIME=$(stat -c %Y /var/www/zhitoujianli/build/index.html)
CURRENT_TIME=$(date +%s)
if [ $((CURRENT_TIME - FILE_TIME)) -gt 300 ]; then
    echo "⚠️  警告：部署的文件不是最新的（超过5分钟）"
fi

echo "✅ 部署验证通过"
```

---

## 📋 标准部署流程

### 前端部署流程

```bash
# 1. 检查Git状态
git status

# 2. 提交修改（如果有）
git add .
git commit -m "描述修改"

# 3. 构建
cd frontend
npm run build

# 4. 验证构建
if [ ! -f "build/index.html" ]; then
    echo "❌ 构建失败"
    exit 1
fi

# 5. 部署
rsync -av --delete build/ /var/www/zhitoujianli/build/

# 6. 验证部署
stat /var/www/zhitoujianli/build/index.html
```

### 后端部署流程

```bash
# 1. 检查Git状态
git status

# 2. 提交修改（如果有）
git add .
git commit -m "描述修改"

# 3. 构建
cd backend/get_jobs
mvn clean package -DskipTests

# 4. 验证构建
if [ ! -f "target/get_jobs-*.jar" ]; then
    echo "❌ 构建失败"
    exit 1
fi

# 5. 备份当前版本
cp /opt/zhitoujianli/backend/get_jobs-latest.jar \
   /opt/zhitoujianli/backend/get_jobs-backup-$(date +%Y%m%d_%H%M%S).jar

# 6. 部署
cp target/get_jobs-*.jar /opt/zhitoujianli/backend/get_jobs-latest.jar

# 7. 重启服务
systemctl restart zhitoujianli-backend.service

# 8. 验证服务
systemctl status zhitoujianli-backend.service
```

---

## 🔍 问题排查

### 问题：部署后功能丢失

**可能原因**:
1. 代码修改未提交到Git
2. 构建时使用了旧的代码
3. 部署了错误的构建文件

**排查步骤**:
```bash
# 1. 检查Git状态
git status

# 2. 检查源代码是否有修改
git diff frontend/src/components/BossDelivery.tsx

# 3. 检查构建文件时间戳
stat frontend/build/index.html

# 4. 检查部署文件时间戳
stat /var/www/zhitoujianli/build/index.html

# 5. 检查构建文件内容
grep -r "CollapsibleQuota" frontend/build/static/js/*.js
```

---

## ✅ 部署检查清单

### 部署前
- [ ] 代码已提交到Git
- [ ] 检查 `git status` 确认无未提交修改
- [ ] 检查构建环境（Node版本、依赖等）
- [ ] 备份当前部署版本（后端）

### 构建时
- [ ] 构建命令执行成功
- [ ] 检查构建输出无错误
- [ ] 验证构建文件存在且大小正常
- [ ] 检查构建文件时间戳

### 部署时
- [ ] 使用正确的部署脚本
- [ ] 部署到正确的路径
- [ ] 验证文件复制成功
- [ ] 检查文件权限

### 部署后
- [ ] 验证部署文件时间戳
- [ ] 测试关键功能
- [ ] 检查浏览器控制台无错误
- [ ] 记录部署信息（Git版本、时间等）

---

## 🛡️ 预防措施

### 1. 自动化检查

在部署脚本中添加自动检查：

```bash
#!/bin/bash
set -e

# 检查未提交的修改
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  警告：有未提交的修改"
    git status
    read -p "是否继续？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 继续部署流程...
```

### 2. Git Hooks

在 `.git/hooks/pre-commit` 中添加检查：

```bash
#!/bin/bash
# 检查是否有未提交的修改
if [ -n "$(git diff --cached)" ]; then
    echo "✅ 有修改已暂存"
else
    echo "⚠️  警告：没有修改被暂存"
fi
```

### 3. 部署日志

记录每次部署的详细信息：

```bash
# 在部署脚本中记录
LOG_FILE="/opt/zhitoujianli/logs/deploy-$(date +%Y%m%d).log"
echo "=== 部署开始 ===" >> "$LOG_FILE"
echo "时间: $(date)" >> "$LOG_FILE"
echo "Git Commit: $(git rev-parse HEAD)" >> "$LOG_FILE"
echo "Git Branch: $(git branch --show-current)" >> "$LOG_FILE"
echo "用户: $(whoami)" >> "$LOG_FILE"
```

---

## 📝 总结

**关键教训**:
1. ✅ **代码修改后必须提交到Git**
2. ✅ **部署前检查Git状态**
3. ✅ **构建后验证构建输出**
4. ✅ **部署后验证功能**
5. ✅ **记录部署信息**

**避免的问题**:
- ❌ 修改代码后不提交，导致修改丢失
- ❌ 构建时使用未提交的代码
- ❌ 部署后不验证功能
- ❌ 不知道部署的是哪个版本

---

**相关文档**:
- [套餐信息显示问题修复总结](./PLAN_DISPLAY_BUG_FIX_SUMMARY.md)
- [路由功能矩阵](./ROUTE_FEATURE_MATRIX.md)

