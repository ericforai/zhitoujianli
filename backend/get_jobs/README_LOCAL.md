# AI找工作助手 - 本地运行指南

## 项目概述

这是一个全平台自动投简历脚本，支持以下招聘平台：
- Boss直聘
- 前程无忧 (51job)
- 猎聘
- 拉勾
- 智联招聘

## 环境要求

### 系统要求
- **操作系统**: macOS/Linux/Windows
- **Java版本**: JDK 21 或更高版本
- **Maven版本**: 3.6+
- **内存**: 建议4GB以上
- **网络**: 需要稳定的网络连接

### 已安装的依赖
- ✅ Java 21.0.7 (OpenJDK Temurin)
- ✅ Maven 3.9.9
- ✅ 项目依赖已成功下载和编译

## 项目结构

```
get_jobs/
├── src/main/java/
│   ├── boss/           # Boss直聘相关代码
│   ├── job51/          # 前程无忧相关代码
│   ├── lagou/          # 拉勾相关代码
│   ├── liepin/         # 猎聘相关代码
│   ├── zhilian/        # 智联招聘相关代码
│   ├── ai/             # AI相关功能
│   ├── utils/          # 工具类
│   └── StartAll.java   # 主启动类
├── src/main/resources/
│   ├── config.yaml     # 配置文件
│   └── images/         # 图片资源
└── pom.xml             # Maven配置文件
```

## 配置说明

### 主要配置文件: `src/main/resources/config.yaml`

#### Boss直聘配置
```yaml
boss:
  debugger: false                    # 开发者模式
  sayHi: "您好,我有8年工作经验..."    # 打招呼语
  keywords: ["大模型","Python"]       # 搜索关键词
  cityCode: ["上海"]                 # 城市编码
  experience: ["5-10年"]             # 工作经验
  salary: "20-50K"                 # 薪资范围
  enableAI: false                   # 是否启用AI
  sendImgResume: false              # 是否发送图片简历
```

#### 其他平台配置
- **51job**: 工作地区、关键词、薪资范围
- **拉勾**: 关键词、城市、薪资、公司规模
- **猎聘**: 城市、关键词、薪资、发布时间
- **智联**: 城市、薪资、关键词

## 运行方式

### 1. 编译项目
```bash
cd /Users/user/autoresume/get_jobs
mvn clean compile
```

### 2. 运行方式

#### 方式一：运行所有平台 (推荐)
```bash
mvn exec:java -Dexec.mainClass="StartAll"
```

#### 方式二：运行单个平台
```bash
# Boss直聘
mvn exec:java -Dexec.mainClass="boss.Boss"

# 前程无忧
mvn exec:java -Dexec.mainClass="job51.Job51"

# 猎聘
mvn exec:java -Dexec.mainClass="liepin.Liepin"

# 拉勾
mvn exec:java -Dexec.mainClass="lagou.Lagou"

# 智联招聘
mvn exec:java -Dexec.mainClass="zhilian.ZhiLian"
```

#### 方式三：直接运行JAR
```bash
# 先打包
mvn clean package -DskipTests

# 运行
java -jar target/get_jobs-v2.0.1.jar
```

## 注意事项

### 1. 首次运行
- 程序会自动下载Playwright浏览器（约124MB）
- 需要稳定的网络连接，下载可能需要几分钟
- 如果下载失败，可以手动安装：
  ```bash
  npx playwright install chromium
  ```

### 2. 登录要求
- **Boss直聘**: 需要微信扫码登录
- **拉勾**: 需要微信扫码登录，需绑定微信账号
- **猎聘**: 需要微信扫码登录，需绑定微信账号
- **智联招聘**: 需要微信扫码登录，需绑定微信账号
- **51job**: 需要账号密码登录

### 3. 使用限制
- 各平台都有投递频率限制
- Boss直聘：投递有上限，建议控制频率
- 51job：投递有上限，且限制搜索到的岗位数量
- 拉勾：投递无上限，但会限制投递频率
- 猎聘：默认打招呼无上限，主动发消息有上限
- 智联招聘：投递上限100左右

### 4. 安全提醒
- 本项目不支持服务器部署
- 请勿在服务器上运行，招聘网站会检测服务器IP
- 建议在本地电脑上运行

## 常见问题

### Q1: 编译失败，提示找不到符号
**解决方案**: 已修复Lombok注解处理器配置，重新编译即可：
```bash
mvn clean compile
```

### Q2: Playwright浏览器下载失败
**解决方案**:
1. 检查网络连接
2. 手动安装：`npx playwright install chromium`
3. 或使用代理下载

### Q3: 登录失败
**解决方案**:
1. 确保已绑定微信账号
2. 检查账号是否正常
3. 尝试手动登录一次

### Q4: 投递失败
**解决方案**:
1. 检查配置文件中的参数设置
2. 确认账号权限正常
3. 降低投递频率

## 开发说明

### 项目特点
- 使用Playwright替代Selenium，性能更好
- 支持多平台并发投递
- 内置AI功能（可选）
- 支持定时投递
- 自动黑名单管理

### 技术栈
- **Java 21**: 主要开发语言
- **Maven**: 依赖管理
- **Playwright**: 浏览器自动化
- **Spring Boot**: 基础框架
- **Lombok**: 代码简化
- **Jackson**: JSON处理

## 联系信息

- **项目地址**: https://github.com/ericforai/zhitoujianli
- **QQ群**: 扫码添加，加群答案为项目仓库名【get_jobs】

## 免责声明

本项目仅供学习和研究使用，请遵守各招聘平台的使用条款。使用者需自行承担使用风险，作者不承担任何责任。

---

**最后更新**: 2025-09-25
**版本**: v2.0.1
