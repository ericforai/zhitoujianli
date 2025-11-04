# 前端目录说明

**更新时间：** 2025-11-04 13:10

---

## ✅ 唯一正确版本

**目录：** `/root/zhitoujianli/PRODUCTION_FRONTEND/`

这是**唯一应该使用的前端构建产物**，对应生产环境的正确UI。

**特征：**

- 主文件：main.b74194c6.js (304KB)
- Title："智投简历 - 让求职更智能"
- 备份来源：backup_20251104_122647

---

## ⚠️ 其他目录状态

### `frontend/`

- 状态：❌ **不要使用**
- 构建产物：main.8076a17c.js (564KB)
- 说明：这是更老的版本

### `website/zhitoujianli-website/`

- 状态：❌ **不要使用**
- 构建产物：main.146fe79b.js (285KB)
- 说明：这也不是正确版本

---

## 📋 部署规则

### ✅ 正确部署

```bash
# 直接复制PRODUCTION_FRONTEND到生产环境
cp -r /root/zhitoujianli/PRODUCTION_FRONTEND/* /var/www/zhitoujianli/build/
chown -R www-data:www-data /var/www/zhitoujianli/build
systemctl reload nginx
```

### ❌ 禁止操作

```bash
# 不要使用部署脚本（它会重新构建）
./deploy-frontend.sh

# 不要从frontend/或website/部署
```

---

## 🔒 为什么不删除frontend和website？

因为这两个目录包含**源代码**，虽然构建产物不对，但源代码可能还有用。

如果将来需要修改前端：

1. 需要先找到能生成304KB版本的源代码
2. 或者从备份反编译重建源代码
3. 或者基于现有源代码修改后测试

---

## 📝 当前部署状态

- ✅ 生产环境：main.b74194c6.js (304KB)
- ✅ 备份：/opt/zhitoujianli/CORRECT_VERSION/
- ✅ 备份：/opt/zhitoujianli/backups/frontend/backup_20251104_122647/

---

**结论：** 如需部署，只能直接复制 PRODUCTION_FRONTEND，不能重新构建！

