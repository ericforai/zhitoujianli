# 前端开发快速参考

## 🎯 唯一源代码位置

```bash
/root/zhitoujianli/frontend/
```

**没有例外，没有其他前端目录。**

---

## 🚀 常用命令

### 开发
```bash
cd /root/zhitoujianli/frontend
npm start
```

### 构建
```bash
cd /root/zhitoujianli/frontend
npm run build
```

### 部署
```bash
# 方式1：仅部署（需先构建）
/opt/zhitoujianli/scripts/deploy-frontend.sh

# 方式2：构建+部署（推荐）
cd /root/zhitoujianli
./deploy-frontend.sh
```

---

## 📂 重要路径

- **源代码**: `/root/zhitoujianli/frontend/`
- **构建产物**: `/root/zhitoujianli/frontend/build/`
- **生产环境**: `/var/www/zhitoujianli/build/`
- **备份**: `/opt/zhitoujianli/backups/frontend/`

---

## ⚠️ 重要提醒

### 修改代码后必须

1. 重新构建：`npm run build`
2. 部署：`./deploy-frontend.sh`
3. 清除浏览器缓存：`Ctrl + Shift + R`

### 禁止操作

- ❌ 不要创建frontend2、frontend_new等目录
- ❌ 不要在website/下开发前端
- ❌ 不要手动复制文件到/var/www/

---

**最后更新**: 2025-11-04 17:21  
**状态**: ✅ 清晰、稳定、可维护
