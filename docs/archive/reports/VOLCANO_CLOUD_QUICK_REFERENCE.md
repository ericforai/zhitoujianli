# 🔥 火山云开发环境 - 快速参考卡片

> **重要**: 我们在火山云服务器上开发，不是本地环境！

---

## 📍 环境信息

| 项目            | 信息                           |
| --------------- | ------------------------------ |
| 🌐 **开发平台** | 火山云（VolcEngine）远程服务器 |
| 📁 **工作路径** | `/root/zhitoujianli`           |
| 💻 **操作系统** | Linux 6.8.0-55-generic         |
| 🐚 **Shell**    | `/usr/bin/bash`                |
| 🌍 **服务器IP** | 115.190.182.95                 |
| 🔐 **用户权限** | root                           |

---

## 🗺️ 关键路径速查

```bash
# 项目根目录
/root/zhitoujianli/

# 前端源码
/root/zhitoujianli/frontend/

# 后端源码
/root/zhitoujianli/backend/get_jobs/

# 前端部署目录（构建产物）
/var/www/zhitoujianli/

# Nginx配置
/etc/nginx/sites-available/zhitoujianli.conf
/root/zhitoujianli/zhitoujianli.conf

# SSL证书
/etc/letsencrypt/live/zhitoujianli.com/

# 日志目录
/var/log/nginx/zhitoujianli_access.log
/var/log/nginx/zhitoujianli_error.log
/root/zhitoujianli/backend/get_jobs/logs/
```

---

## 🚀 快速部署命令

### 前端部署

```bash
cd /root/zhitoujianli/frontend
npm run build:frontend
sudo cp -r dist/* /var/www/zhitoujianli/
```

### 后端部署

```bash
cd /root/zhitoujianli/backend/get_jobs
mvn clean package -DskipTests
# 重启Spring Boot服务
```

### Nginx重载

```bash
sudo cp /root/zhitoujianli/zhitoujianli.conf /etc/nginx/sites-available/
sudo nginx -t
sudo nginx -s reload
```

### 验证部署

```bash
# 检查前端
curl https://www.zhitoujianli.com

# 检查后端API
curl https://www.zhitoujianli.com/api/health

# 检查Nginx状态
sudo systemctl status nginx

# 检查后端进程
ps aux | grep java
```

---

## 🔌 端口配置

| 服务        | 端口 | 说明                    |
| ----------- | ---- | ----------------------- |
| Nginx HTTP  | 80   | HTTP流量，自动跳转HTTPS |
| Nginx HTTPS | 443  | HTTPS流量，对外服务     |
| Spring Boot | 8080 | 后端API服务，内部端口   |

---

## 🌐 域名配置

| 环境         | 域名/地址                                  |
| ------------ | ------------------------------------------ |
| **生产环境** | `zhitoujianli.com`, `www.zhitoujianli.com` |
| **测试环境** | `http://115.190.182.95`                    |
| **后端API**  | `https://www.zhitoujianli.com/api/`        |

---

## ⚠️ 关键注意事项（必读！）

### ❌ 不要这样做

```bash
# ❌ 错误：使用相对路径
cd frontend/
npm run build

# ❌ 错误：假设在本地环境
docker-compose up -d

# ❌ 错误：使用localhost
curl http://localhost:8080

# ❌ 错误：不考虑权限
cp file.txt /var/www/
```

### ✅ 应该这样做

```bash
# ✅ 正确：使用绝对路径
cd /root/zhitoujianli/frontend
npm run build

# ✅ 正确：在服务器上操作
cd /root/zhitoujianli
./deploy.sh

# ✅ 正确：使用服务器IP或域名
curl http://115.190.182.95:8080

# ✅ 正确：使用sudo处理权限
sudo cp file.txt /var/www/
```

---

## 🛠️ 常用命令速查

### 查看日志

```bash
# Nginx访问日志
sudo tail -f /var/log/nginx/zhitoujianli_access.log

# Nginx错误日志
sudo tail -f /var/log/nginx/zhitoujianli_error.log

# 后端日志
tail -f /root/zhitoujianli/backend/get_jobs/logs/application.log
```

### 服务管理

```bash
# 重启Nginx
sudo systemctl restart nginx

# 查看Nginx状态
sudo systemctl status nginx

# 查看Java进程
ps aux | grep java

# 杀掉Java进程
pkill -f 'java.*get_jobs'
```

### 资源监控

```bash
# 查看磁盘使用
df -h

# 查看内存使用
free -h

# 查看CPU和内存
top

# 查看进程资源
htop  # 如果安装了
```

---

## 🔐 安全检查清单

- [ ] 敏感信息使用环境变量，不硬编码
- [ ] API接口有参数验证
- [ ] 用户输入进行转义和验证
- [ ] HTTPS证书有效且未过期
- [ ] 防火墙规则正确配置
- [ ] 日志不包含敏感信息
- [ ] 文件权限设置正确
- [ ] 数据库连接使用密码

---

## 📊 性能优化检查

- [ ] 静态资源启用Gzip压缩
- [ ] 图片使用WebP格式
- [ ] 启用浏览器缓存
- [ ] API响应时间 < 500ms
- [ ] 数据库查询使用索引
- [ ] 使用Redis缓存热点数据
- [ ] 前端代码分割和懒加载

---

## 🐛 故障排查

### 前端无法访问

```bash
# 1. 检查Nginx是否运行
sudo systemctl status nginx

# 2. 检查Nginx配置
sudo nginx -t

# 3. 查看Nginx错误日志
sudo tail -100 /var/log/nginx/zhitoujianli_error.log

# 4. 检查文件是否存在
ls -la /var/www/zhitoujianli/
```

### 后端API报错

```bash
# 1. 检查Java进程
ps aux | grep java

# 2. 查看后端日志
tail -100 /root/zhitoujianli/backend/get_jobs/logs/application.log

# 3. 检查端口占用
netstat -tlnp | grep 8080

# 4. 测试本地API
curl http://127.0.0.1:8080/api/health
```

### SSL证书问题

```bash
# 1. 检查证书有效期
sudo certbot certificates

# 2. 续签证书
sudo certbot renew

# 3. 测试证书
curl -vI https://www.zhitoujianli.com
```

---

## 📝 开发规范提醒

### TypeScript代码

```typescript
// ✅ 正确：完整的类型定义
interface UserProfile {
  id: number;
  name: string;
  email: string;
}

const getUser = async (id: number): Promise<UserProfile> => {
  try {
    const response = await axios.get(`/api/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('获取用户失败:', error);
    throw new Error('获取用户信息失败');
  }
};

// ❌ 错误：使用any类型，没有错误处理
const getUser = async (id: any) => {
  const response = await axios.get(`/api/users/${id}`);
  return response.data;
};
```

### Java代码

```java
// ✅ 正确：完整的异常处理和日志
@Service
@Slf4j
public class UserService {

    /**
     * 根据ID获取用户
     * @param userId 用户ID
     * @return 用户信息
     */
    public User getUserById(Long userId) {
        try {
            return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("用户不存在"));
        } catch (Exception e) {
            log.error("获取用户失败, userId: {}", userId, e);
            throw new ServiceException("获取用户信息失败");
        }
    }
}

// ❌ 错误：没有注释，没有异常处理
public User getUserById(Long userId) {
    return userRepository.findById(userId).get();
}
```

---

## 🔄 Git提交规范

```bash
# ✅ 正确的提交格式
git commit -m "feat(auth): 添加用户登录功能"
git commit -m "fix(api): 修复用户信息获取接口返回空值问题"
git commit -m "docs: 更新火山云部署文档"

# ❌ 错误的提交格式
git commit -m "update"
git commit -m "fix bug"
git commit -m "添加新功能"
```

**提交类型**：`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `security`, `config`, `deps`

---

## 📞 紧急联系

| 类型       | 联系方式      |
| ---------- | ------------- |
| 服务器问题 | 火山云控制台  |
| 域名问题   | DNS服务商     |
| SSL证书    | Let's Encrypt |
| 代码问题   | GitHub Issues |

---

## 📚 相关文档

- **主规则文件**: `/root/zhitoujianli/.cursorrules`
- **规则完善总结**: `/root/zhitoujianli/RULES_ENHANCEMENT_SUMMARY.md`
- **部署指南**: `/root/zhitoujianli/VOLCANO_DEPLOYMENT_GUIDE.md`
- **Nginx配置**: `/root/zhitoujianli/zhitoujianli.conf`

---

## ✅ 每日检查清单

### 早上开始开发

- [ ] 检查服务器状态和资源使用
- [ ] 查看Nginx和后端服务是否正常
- [ ] 拉取最新代码 `git pull`
- [ ] 查看是否有新的错误日志

### 开发过程中

- [ ] 使用绝对路径 `/root/zhitoujianli/`
- [ ] 遵循代码规范（TypeScript严格模式、中文注释）
- [ ] 包含完整的错误处理
- [ ] 考虑安全性和性能

### 部署前

- [ ] 运行代码质量检查 `npm run code-quality`
- [ ] 运行测试 `npm test`
- [ ] 检查Nginx配置 `sudo nginx -t`
- [ ] 备份重要数据

### 部署后

- [ ] 验证前端访问 `curl https://www.zhitoujianli.com`
- [ ] 验证后端API `curl https://www.zhitoujianli.com/api/health`
- [ ] 查看日志确认无错误
- [ ] 提交代码并打标签

---

## 🎯 记住这些

1. 🔥 **我们在火山云服务器上开发，不是本地！**
2. 📁 **始终使用绝对路径 `/root/zhitoujianli/`**
3. 🔐 **注意文件权限，必要时使用 `sudo`**
4. 🌐 **通过域名或IP访问，不用localhost**
5. 📝 **代码必须包含类型定义和错误处理**
6. 🇨🇳 **注释和文档使用中文**
7. ⚡ **考虑服务器资源限制**
8. 🛡️ **安全性永远是第一位的**

---

**快速参考版本**: v1.0
**更新时间**: 2025-10-16
**适用环境**: 火山云服务器开发环境

---

💡 **提示**: 将此文件加入书签，开发时随时查阅！
