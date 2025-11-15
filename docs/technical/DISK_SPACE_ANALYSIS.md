# 磁盘空间分析报告

**生成时间**: 2025-11-15
**磁盘总容量**: 40G
**当前使用**: 35G (94%)
**可用空间**: 2.5G

---

## 📊 主要占用空间分析

### 1. `/opt/zhitoujianli/backend` - **18G** ⚠️ 最大占用

**问题**: 存储了61个历史版本的JAR文件，每个约296M

**详情**:
- 当前使用版本: `get_jobs-v2.0.1.jar` (296M)
- 符号链接: `get_jobs-latest.jar` → `get_jobs-v2.0.1.jar`
- 旧版本数量: 59个
- 可清理空间: **约17.5G**

**清理建议**:
```bash
# 保留当前版本和最新3个版本，删除其他所有旧版本
cd /opt/zhitoujianli/backend
# 保留: get_jobs-v2.0.1.jar, get_jobs-latest.jar, 以及最新3个版本
# 删除其他所有旧版本
```

---

### 2. `/root/.cache` - **2.4G**

**详情**:
- `ms-playwright`: 2.3G (Playwright浏览器缓存)
- `typescript`: 27M
- 其他: 约100M

**清理建议**:
```bash
# 清理Playwright缓存（如果不需要自动化测试）
rm -rf /root/.cache/ms-playwright
# 或保留最近使用的浏览器
```

---

### 3. `/root/.m2/repository` - **758M**

**说明**: Maven依赖缓存

**清理建议**:
- 可以清理，但下次构建时需要重新下载
- 建议保留，除非空间紧急

---

### 4. `/root/.npm/_cacache` - **677M**

**说明**: npm包缓存

**清理建议**:
```bash
# 清理npm缓存
npm cache clean --force
```

---

### 5. `/root/.cursor-server` - **2.0G**
### 6. `/root/.qoder-server` - **1.6G**
### 7. `/root/.vscode-server` - **782M**

**说明**: 开发工具服务器文件

**清理建议**:
- 这些是开发工具，不建议删除
- 如果确定不再使用某个工具，可以删除对应目录

---

### 8. `/var/cache/apt` - **408M**

**说明**: APT包管理器缓存

**清理建议**:
```bash
# 清理APT缓存（可以安全清理，需要时会重新下载）
apt-get clean
apt-get autoclean
```

---

### 9. `/opt/zhitoujianli/backend/target` - **487M**

**说明**: Maven构建输出目录

**清理建议**:
```bash
# 可以清理，下次构建时会重新生成
cd /opt/zhitoujianli/backend
mvn clean
```

---

## 🎯 推荐清理方案（按优先级）

### 方案A：快速清理（释放约18G）

**清理内容**:
1. 删除旧版本JAR文件（保留当前版本+最新3个版本）→ **释放17.5G**
2. 清理Playwright缓存 → **释放2.3G**
3. 清理npm缓存 → **释放677M**

**总计释放**: 约 **20.5G**

**执行命令**:
```bash
# 1. 清理旧版本JAR（保留当前版本和最新3个）
cd /opt/zhitoujianli/backend
# 找出最新3个版本（除了v2.0.1）
ls -t get_jobs-*.jar | grep -v "v2.0.1.jar" | grep -v "latest.jar" | head -3
# 删除其他所有旧版本
# ⚠️ 注意：需要手动确认要保留的版本

# 2. 清理Playwright缓存
rm -rf /root/.cache/ms-playwright

# 3. 清理npm缓存
npm cache clean --force
```

---

### 方案B：保守清理（释放约18G）

**清理内容**:
1. 删除旧版本JAR文件（保留当前版本+最新5个版本）→ **释放约16G**
2. 清理Playwright缓存 → **释放2.3G**

**总计释放**: 约 **18.3G**

---

### 方案C：完整清理（释放约22G）

**清理内容**:
1. 删除旧版本JAR文件 → **释放17.5G**
2. 清理Playwright缓存 → **释放2.3G**
3. 清理npm缓存 → **释放677M**
4. 清理APT缓存 → **释放408M**
5. 清理Maven target目录 → **释放487M**

**总计释放**: 约 **21.4G**

---

## ⚠️ 注意事项

1. **JAR文件清理**:
   - 必须保留当前运行版本: `get_jobs-v2.0.1.jar`
   - 建议保留最新3-5个版本作为备份
   - 删除前确认服务正常运行

2. **缓存清理**:
   - Playwright缓存删除后，首次运行自动化测试会重新下载
   - npm缓存删除后，首次安装包会重新下载
   - APT缓存删除后，更新系统时会重新下载

3. **开发工具**:
   - `.cursor-server`, `.qoder-server`, `.vscode-server` 不建议删除
   - 这些是开发环境必需的文件

---

## 📝 清理后预期结果

清理前: 35G / 40G (94%)
清理后: 约 13-15G / 40G (33-38%)
释放空间: 约 20G

---

## 🔄 预防措施

1. **设置JAR文件自动清理脚本**:
   - 每次部署新版本后，自动删除超过5个的旧版本
   - 只保留最新5个版本

2. **定期清理缓存**:
   - 每月清理一次npm和APT缓存
   - 每季度清理一次Playwright缓存

3. **监控磁盘空间**:
   - 设置告警，当使用率超过85%时提醒
   - 定期检查大文件

---

## 🚀 快速执行脚本

创建清理脚本: `/opt/zhitoujianli/scripts/cleanup-disk.sh`

```bash
#!/bin/bash
# 磁盘清理脚本

echo "开始清理磁盘空间..."

# 1. 清理旧版本JAR（保留当前版本和最新3个）
cd /opt/zhitoujianli/backend
CURRENT_JAR="get_jobs-v2.0.1.jar"
LATEST_JARS=$(ls -t get_jobs-*.jar | grep -v "$CURRENT_JAR" | grep -v "latest.jar" | head -3)

echo "保留的JAR文件:"
echo "  - $CURRENT_JAR"
echo "  - get_jobs-latest.jar"
for jar in $LATEST_JARS; do
    echo "  - $jar"
done

# 删除其他旧版本
find . -name "get_jobs-*.jar" ! -name "$CURRENT_JAR" ! -name "get_jobs-latest.jar" $(for jar in $LATEST_JARS; do echo "! -name $jar"; done) -delete

# 2. 清理Playwright缓存
echo "清理Playwright缓存..."
rm -rf /root/.cache/ms-playwright

# 3. 清理npm缓存
echo "清理npm缓存..."
npm cache clean --force

# 4. 清理APT缓存
echo "清理APT缓存..."
apt-get clean
apt-get autoclean

echo "清理完成！"
df -h /
```

