# 智投简历 MVP

一个基于 Next.js 的智能简历投递系统，支持手机号验证码登录/注册。

## 功能特性

- 🔐 手机号 + 验证码登录/注册
- 🎯 自动用户注册（首次登录自动创建账户）
- 🔒 JWT 身份验证（HttpOnly Cookie）
- 📱 响应式设计，支持移动端
- 🎨 现代化 UI（Tailwind CSS）
- 🛡️ 安全验证码机制（5分钟有效期，1分钟限流）

## 技术栈

- **前端**: Next.js 15, React, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: JWT + HttpOnly Cookies
- **短信服务**: Mock 服务（开发环境）

## 快速开始

### 1. 环境准备

```bash
# 克隆项目
git clone <repository-url>
cd zhitoujianli-mvp

# 安装依赖
npm install
```

### 2. 数据库配置

```bash
# 安装 PostgreSQL（如果未安装）
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql

# 创建数据库
createdb zhitoujianli

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 中的 DATABASE_URL
```

### 3. 数据库迁移

```bash
# 运行数据库迁移
npx prisma migrate dev --name init

# 生成 Prisma 客户端
npx prisma generate
```

### 4. 启动应用

```bash
# 开发模式
npm run dev

# 生产构建
npm run build
npm start
```

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── send-code/     # 发送验证码
│   │   ├── verify-code/   # 验证码登录
│   │   └── logout/        # 退出登录
│   ├── dashboard/         # 用户中心
│   ├── login/            # 登录页面
│   └── page.tsx          # 首页
├── components/           # React 组件
│   └── LogoutButton.tsx  # 退出按钮
└── lib/                  # 工具库
    ├── auth.ts          # 认证工具
    ├── prisma.ts        # 数据库客户端
    └── sms.ts           # 短信服务
```

## API 接口

### 发送验证码
```http
POST /api/send-code
Content-Type: application/json

{
  "phone": "13800138000"
}
```

### 验证码登录
```http
POST /api/verify-code
Content-Type: application/json

{
  "phone": "13800138000",
  "code": "123456"
}
```

### 退出登录
```http
POST /api/logout
```

## 数据库模型

### User
```prisma
model User {
  id        String   @id @default(cuid())
  phone     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### VerificationCode
```prisma
model VerificationCode {
  id        String   @id @default(cuid())
  phone     String
  code      String
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

## 安全特性

- ✅ 验证码 5 分钟有效期
- ✅ 单手机号 1 分钟内最多请求一次验证码
- ✅ JWT 存储在 HttpOnly Cookie
- ✅ 手机号格式验证
- ✅ 验证码格式验证

## 开发说明

### Mock 短信服务
开发环境使用 Mock 短信服务，验证码会在控制台输出：
```
[Mock SMS] 发送验证码到 13800138000: 123456
验证码: 123456 (5分钟内有效)
```

### 生产环境部署
1. 替换 Mock 短信服务为真实服务
2. 配置生产环境数据库
3. 设置安全的 JWT_SECRET
4. 配置 HTTPS

## 部署

### Vercel 部署
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel

# 配置环境变量
vercel env add DATABASE_URL
vercel env add JWT_SECRET
```

### Docker 部署
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 贡献

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License