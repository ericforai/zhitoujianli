# 历史文档归档

本目录包含项目开发过程中产生的历史文档，已归档以保持项目根目录整洁。

## 📁 目录结构

- **deployment/** - 部署相关历史文档和报告
- **fixes/** - 各类问题修复报告和总结
- **features/** - 功能实现文档和总结
- **testing/** - 测试报告和验证文档
- **reports/** - 其他综合报告

## 📝 归档日期

归档时间：2025-11-04

## 🔍 查找文档

如需查找特定文档，可以使用：

```bash
# 在归档中搜索关键词
grep -r "关键词" /root/zhitoujianli/docs/archive/

# 按时间排序查看最近的文档
find /root/zhitoujianli/docs/archive/ -type f -printf '%T+ %p\n' | sort -r
```

## 📌 重要提示

- 所有归档文档仍可通过Git历史访问
- 当前有效的文档保留在项目根目录和 `/docs/` 目录
- 归档文档仅供历史参考，可能包含过时信息

