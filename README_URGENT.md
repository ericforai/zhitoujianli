# ⚠️ 紧急说明 - 请先阅读

## 📁 前端目录说明

**唯一正确的前端源代码目录：**

```
/root/zhitoujianli/frontend_FINAL/
```

**❌ 已删除的目录（不要重新创建）：**

- `frontend/` - 已删除
- `website/` - 已删除

---

## 🔧 部署流程

### 修改代码后部署

```bash
cd /root/zhitoujianli
./deploy-frontend.sh
```

### 紧急恢复（如果UI出错）

```bash
rm -rf /var/www/zhitoujianli/build/*
cp -r /opt/zhitoujianli/CORRECT_VERSION/* /var/www/zhitoujianli/build/
chown -R www-data:www-data /var/www/zhitoujianli/build
systemctl reload nginx
```

---

## 📂 备份位置

1. `/opt/zhitoujianli/CORRECT_VERSION/` - 原始正确版本
2. `/root/zhitoujianli/PRODUCTION_FRONTEND/` - 同上（副本）
3. `/opt/zhitoujianli/backups/frontend/backup_20251104_122647/` - 同上

---

## ✅ 最近修改

**时间：** 2025-11-04 14:08
**修改文件：** `frontend_FINAL/src/components/SmartGreeting.tsx`
**修改内容：** 将重复的"操作流程"改为"核心优势展示"

---

**请清除浏览器缓存后查看效果！**

