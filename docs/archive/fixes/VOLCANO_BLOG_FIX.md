# 🔧 火山云Blog访问问题修复指南

## 📋 问题说明

- **环境**: 火山云生产服务器
- **域名**: www.zhitoujianli.com (已解析)
- **问题**: Blog无法访问

## ✅ 已修复的配置文件

### 1. Blog配置文件

已修改以下文件，将base路径改为根路径：

#### `blog/zhitoujianli-blog/astro.config.ts`

```typescript
export default defineConfig({
  output: 'static',
  site: 'https://blog.zhitoujianli.com',
  base: '/', // 改为根路径
  // ...
});
```

#### `blog/zhitoujianli-blog/src/config.yaml`

```yaml
site:
  name: 智投简历博客
  site: 'https://blog.zhitoujianli.com'
  base: '/' # 改为根路径
```

## 🚀 火山云服务器部署步骤

### 步骤1：重新构建Blog

```bash
# 在项目根目录执行
cd /root/zhitoujianli/blog/zhitoujianli-blog
npm run build
```

### 步骤2：使用Docker Compose重新部署

```bash
# 返回项目根目录
cd /root/zhitoujianli

# 停止并重新构建blog服务
docker compose -f volcano-deployment.yml up -d --build blog

# 或者重启所有服务
docker compose -f volcano-deployment.yml up -d --build
```

### 步骤3：重启Nginx（如果需要）

```bash
docker compose -f volcano-deployment.yml restart nginx
```

### 步骤4：验证部署

```bash
# 查看服务状态
docker compose -f volcano-deployment.yml ps

# 查看blog日志
docker compose -f volcano-deployment.yml logs blog

# 测试blog访问
curl -I http://localhost:4321
curl -I https://www.zhitoujianli.com/blog/
```

## 🌐 访问地址

部署完成后，Blog可以通过以下方式访问：

- **主站Blog路径**: `https://www.zhitoujianli.com/blog/`
- **Blog独立域名**: `https://blog.zhitoujianli.com` (需要DNS解析)

## 🔍 故障排查

### 检查容器状态

```bash
# 查看所有容器
docker compose -f volcano-deployment.yml ps

# 查看blog容器详细信息
docker inspect zhitoujianli-blog
```

### 查看日志

```bash
# 查看blog日志
docker compose -f volcano-deployment.yml logs -f blog

# 查看nginx日志
docker compose -f volcano-deployment.yml logs -f nginx
```

### 测试端口

```bash
# 检查4321端口
netstat -tlnp | grep 4321

# 测试blog服务
curl http://localhost:4321
```

## 📝 注意事项

1. **确保在火山云服务器上执行命令**
2. **不要在本地启动开发服务**
3. **使用Docker Compose管理服务**
4. **检查防火墙规则是否开放相关端口**

## 🎯 完整部署命令（一键执行）

```bash
#!/bin/bash
# 在火山云服务器上执行

cd /root/zhitoujianli

# 1. 重新构建blog
echo "正在构建blog..."
cd blog/zhitoujianli-blog && npm run build && cd ../..

# 2. 停止现有服务
echo "停止现有服务..."
docker compose -f volcano-deployment.yml down

# 3. 重新构建并启动所有服务
echo "启动服务..."
docker compose -f volcano-deployment.yml up -d --build

# 4. 查看服务状态
echo "服务状态:"
docker compose -f volcano-deployment.yml ps

# 5. 等待服务启动
sleep 10

# 6. 测试blog访问
echo "测试blog访问:"
curl -I http://localhost:4321

echo "部署完成！"
```

将以上脚本保存为 `redeploy-blog.sh` 并执行：

```bash
chmod +x redeploy-blog.sh
./redeploy-blog.sh
```

---

**重要提醒**: 所有命令都应在火山云服务器（115.190.182.95）上执行，不是本地环境！
