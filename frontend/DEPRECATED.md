# ⚠️ 此目录已废弃 (DEPRECATED)

## 重要警告

**此 `frontend/` 目录包含的是老版本UI（机器人界面），已于 2025-11-04 废弃。**

## 正确的前端代码位置

✅ **请使用：** `/root/zhitoujianli/website/zhitoujianli-website/`

这是新版UI（纸飞机Logo + 现代化界面），也是生产环境正在使用的版本。

## 为什么废弃？

1. **两套UI混淆问题**：项目中存在两套完全独立的前端代码，导致部署时经常混淆
2. **部署错误历史**：曾多次错误部署老UI到生产环境
3. **维护成本**：维护两套UI增加了开发和测试成本

## 废弃时间线

- **2025-11-04**：正式标记为废弃
- **问题根源**：在修改 `SmartGreeting.tsx` 后部署时，发现生产环境混合了新老UI文件
- **解决方案**：彻底清理生产环境，重新部署新UI，标记老UI为废弃

## 部署规则

### ❌ 禁止操作

```bash
# 不要构建此目录
cd /root/zhitoujianli/frontend && npm run build

# 不要从此目录部署
cp -r /root/zhitoujianli/frontend/build/* /var/www/zhitoujianli/build/
```

### ✅ 正确操作

```bash
# 使用自动化部署脚本
cd /root/zhitoujianli
./deploy-frontend.sh

# 或手动构建正确的目录
cd /root/zhitoujianli/website/zhitoujianli-website
npm run build
/opt/zhitoujianli/scripts/deploy-frontend.sh
```

## 如果需要参考老UI

如果出于某种原因需要查看老UI的代码：

1. **仅供参考**，不要修改
2. **不要部署**到生产环境
3. **优先使用**新UI的实现方式

## 相关文档

- 部署指南：`/opt/zhitoujianli/docs/DEPLOYMENT_GUIDE.md`
- 问题修复记录：`/opt/zhitoujianli/docs/FIX_SUMMARY_20251102.txt`
- 项目规则：`.cursorrules`

## 联系方式

如有疑问，请查阅项目文档或联系开发团队。

---

**最后更新：2025-11-04** **状态：已废弃 (DEPRECATED)**

