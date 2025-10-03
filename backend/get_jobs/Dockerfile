# 多阶段构建 - 构建阶段
FROM maven:3.9-openjdk-21-slim AS builder

# 设置工作目录
WORKDIR /app

# 复制pom文件
COPY pom.xml .

# 下载依赖
RUN mvn dependency:go-offline -B

# 复制源码
COPY src ./src

# 构建应用
RUN mvn clean package -DskipTests

# 生产阶段 - Java运行环境
FROM openjdk:21-jre-slim

# 安装必要的工具
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 创建应用用户
RUN groupadd -r appuser && useradd -r -g appuser appuser

# 设置工作目录
WORKDIR /app

# 从构建阶段复制jar文件
COPY --from=builder /app/target/*.jar app.jar

# 创建数据目录
RUN mkdir -p /app/user_data && chown -R appuser:appuser /app

# 切换到应用用户
USER appuser

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# 启动应用
ENTRYPOINT ["java", "-jar", "app.jar"]

