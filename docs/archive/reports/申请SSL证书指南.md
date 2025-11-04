# SSL证书申请指南

## 🎯 方案A：为blog.zhitoujianli.com单独申请证书（推荐）

这是最简单的方式，适合你当前的需求。

### 步骤1：申请证书

```bash
# 使用standalone模式申请证书（需要临时停止Nginx）
sudo systemctl stop nginx
sudo certbot certonly --standalone -d blog.zhitoujianli.com

# 或者使用webroot模式（无需停止Nginx）
sudo certbot certonly --webroot -w /root/zhitoujianli/blog/zhitoujianli-blog/dist -d blog.zhitoujianli.com
```

### 步骤2：更新Nginx配置

证书申请成功后，Let's Encrypt会将证书保存在：

```
/etc/letsencrypt/live/blog.zhitoujianli.com/fullchain.pem
/etc/letsencrypt/live/blog.zhitoujianli.com/privkey.pem
```

更新Nginx配置：

```bash
# 编辑 /etc/nginx/nginx.conf
# 找到博客独立域名的server块，修改SSL证书路径：

ssl_certificate /etc/letsencrypt/live/blog.zhitoujianli.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/blog.zhitoujianli.com/privkey.pem;
```

### 步骤3：重启Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 步骤4：测试

```bash
curl -Ik https://blog.zhitoujianli.com
# 应该看到证书有效，没有警告
```

---

## 🌟 方案B：申请通配符证书（更灵活）

通配符证书可以支持 `*.zhitoujianli.com` 下的所有子域名。

### 注意事项

⚠️ **通配符证书必须使用DNS验证**，需要手动在DNS控制台添加TXT记录。

### 步骤1：启动申请流程

```bash
sudo certbot certonly --manual --preferred-challenges dns \
  -d "*.zhitoujianli.com" -d "zhitoujianli.com"
```

### 步骤2：按提示添加DNS记录

certbot会提示你添加DNS TXT记录，类似：

```
Please deploy a DNS TXT record under the name
_acme-challenge.zhitoujianli.com with the following value:

xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

Before continuing, verify the record is deployed.
```

### 步骤3：在DNS控制台添加记录

去你的DNS服务商（阿里云/腾讯云/Cloudflare等）：

```
类型：TXT
主机记录：_acme-challenge
记录值：（certbot提供的那串字符）
TTL：600
```

### 步骤4：验证DNS记录生效

```bash
# 验证TXT记录是否生效
nslookup -type=TXT _acme-challenge.zhitoujianli.com

# 或使用dig
dig TXT _acme-challenge.zhitoujianli.com
```

### 步骤5：继续certbot流程

DNS记录生效后，回到certbot终端，按Enter继续。

### 步骤6：更新Nginx配置

通配符证书会保存在：

```
/etc/letsencrypt/live/zhitoujianli.com/fullchain.pem
/etc/letsencrypt/live/zhitoujianli.com/privkey.pem
```

更新Nginx配置（同时适用主站和博客）：

```nginx
# 主站
server {
    server_name zhitoujianli.com www.zhitoujianli.com;
    ssl_certificate /etc/letsencrypt/live/zhitoujianli.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/zhitoujianli.com/privkey.pem;
}

# 博客
server {
    server_name blog.zhitoujianli.com;
    ssl_certificate /etc/letsencrypt/live/zhitoujianli.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/zhitoujianli.com/privkey.pem;
}
```

---

## 🔄 自动续期

Let's Encrypt证书有效期90天，需要定期续期。

### 查看续期定时任务

```bash
systemctl list-timers | grep certbot
```

### 手动测试续期

```bash
sudo certbot renew --dry-run
```

### 自动续期

certbot安装时会自动配置systemd定时器，每天检查并自动续期。

---

## 🎯 推荐方案

**对于你的情况，我推荐方案A**：

- ✅ 简单快速
- ✅ 无需DNS操作
- ✅ 自动续期
- ✅ 10分钟搞定

只需要：

1. 停止Nginx
2. 运行certbot命令
3. 更新Nginx配置
4. 启动Nginx

完成！🎉
