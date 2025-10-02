# EdgeOne 域名配置指南

## 概述

本指南说明如何配置 EdgeOne 部署，确保每次更新都部署到主域名 `zhitoujianli.com`，并将备用域名 `zhitoujianli.edgeone.app` 自动重定向到主域名。

## 域名配置

### 主域名
- **域名**: `zhitoujianli.com`
- **用途**: 生产环境主域名
- **优先级**: 最高

### 备用域名
- **域名**: `zhitoujianli.edgeone.app`
- **用途**: EdgeOne 默认域名
- **行为**: 自动重定向到主域名

## 配置步骤

### 1. EdgeOne 控制台配置

#### 1.1 项目设置
1. 登录 [EdgeOne 控制台](https://console.cloud.tencent.com/edgeone)
2. 进入 Pages 服务
3. 选择项目 `zhitoujianli`

#### 1.2 域名管理
1. 在项目设置中找到 "域名管理"
2. 添加自定义域名 `zhitoujianli.com`
3. 配置 DNS 解析记录
4. 启用 HTTPS 证书

#### 1.3 重定向规则
在 "重定向规则" 中添加以下规则：

```json
{
  "from": "https://zhitoujianli.edgeone.app/*",
  "to": "https://zhitoujianli.com$1",
  "status": 301,
  "permanent": true
}
```

### 2. 项目配置文件

#### 2.1 edgeone.json 配置
项目根目录的 `config/edgeone.json` 文件：

```json
{
  "name": "zhitoujianli",
  "domains": {
    "primary": "zhitoujianli.com",
    "secondary": "zhitoujianli.edgeone.app"
  },
  "redirects": [
    {
      "from": "https://zhitoujianli.edgeone.app/*",
      "to": "https://zhitoujianli.com$1",
      "status": 301,
      "permanent": true
    }
  ]
}
```

#### 2.2 环境变量配置
在 EdgeOne 控制台设置以下环境变量：

```bash
# 主域名配置
REACT_APP_DOMAIN=zhitoujianli.com
REACT_APP_API_URL=https://zhitoujianli.com/api

# 部署配置
EDGEONE_PRIMARY_DOMAIN=zhitoujianli.com
EDGEONE_SECONDARY_DOMAIN=zhitoujianli.edgeone.app
```

### 3. DNS 配置

#### 3.1 域名解析记录
在域名注册商处配置以下 DNS 记录：

```
类型: CNAME
名称: @
值: zhitoujianli.edgeone.app
TTL: 600

类型: CNAME
名称: www
值: zhitoujianli.edgeone.app
TTL: 600
```

#### 3.2 验证 DNS 配置
使用以下命令验证 DNS 配置：

```bash
# 检查主域名解析
nslookup zhitoujianli.com

# 检查备用域名解析
nslookup zhitoujianli.edgeone.app
```

## 部署流程

### 1. 自动部署
每次推送到 GitHub main 分支时，EdgeOne 会自动：
1. 检测代码更改
2. 构建项目
3. 部署到 `zhitoujianli.com`
4. 配置重定向规则

### 2. 手动部署
使用项目提供的部署脚本：

```bash
# 执行部署脚本
./scripts/deploy-to-edgeone.sh
```

### 3. 部署验证
部署完成后，验证以下内容：

1. **主域名访问**
   ```bash
   curl -I https://zhitoujianli.com
   ```

2. **重定向验证**
   ```bash
   curl -I https://zhitoujianli.edgeone.app
   # 应该返回 301 重定向到主域名
   ```

3. **功能测试**
   - 访问首页
   - 测试用户注册/登录
   - 验证 API 调用

## 故障排除

### 1. 域名无法访问
**问题**: 主域名无法访问
**解决方案**:
1. 检查 DNS 解析是否正确
2. 验证 EdgeOne 域名配置
3. 检查 HTTPS 证书状态

### 2. 重定向不工作
**问题**: 备用域名没有重定向到主域名
**解决方案**:
1. 检查 EdgeOne 重定向规则配置
2. 验证规则语法是否正确
3. 清除浏览器缓存

### 3. 部署失败
**问题**: 自动部署失败
**解决方案**:
1. 检查 GitHub 仓库连接
2. 查看 EdgeOne 构建日志
3. 验证项目配置文件

## 监控和维护

### 1. 域名监控
- 设置域名可用性监控
- 配置异常告警
- 定期检查 DNS 解析

### 2. 性能监控
- 监控页面加载速度
- 检查 API 响应时间
- 分析用户访问统计

### 3. 安全监控
- 检查 HTTPS 证书状态
- 监控安全头配置
- 分析访问日志

## 最佳实践

### 1. 域名管理
- 使用主域名作为唯一入口
- 配置备用域名重定向
- 定期检查域名配置

### 2. 部署管理
- 使用自动化部署流程
- 实施部署前测试
- 建立回滚机制

### 3. 监控管理
- 设置全面的监控体系
- 建立告警机制
- 定期进行健康检查

## 相关文档

- [EdgeOne 官方文档](https://edgeone.ai/zh/document/186503783709097984?product=edgedeveloperplatform)
- [部署指南](DEPLOYMENT_GUIDE.md)
- [安全配置](../security/SECURITY_AUDIT_REPORT.md)

---

**最后更新**: 2025-10-02  
**版本**: 1.0.0  
**维护者**: ZhiTouJianLi Team
