#!/bin/bash

# 添加StandardCharsets import到需要的文件

echo "🔧 添加StandardCharsets import..."

# JwtConfig.java
if ! grep -q "import java.nio.charset.StandardCharsets;" backend/get_jobs/src/main/java/config/JwtConfig.java; then
    sed -i '/^import java\./a import java.nio.charset.StandardCharsets;' backend/get_jobs/src/main/java/config/JwtConfig.java
fi

# AuthController.java
if ! grep -q "import java.nio.charset.StandardCharsets;" backend/get_jobs/src/main/java/controller/AuthController.java; then
    sed -i '/^import java\./a import java.nio.charset.StandardCharsets;' backend/get_jobs/src/main/java/controller/AuthController.java
fi

# BossCookieController.java
if ! grep -q "import java.nio.charset.StandardCharsets;" backend/get_jobs/src/main/java/controller/BossCookieController.java; then
    sed -i '/^import java\./a import java.nio.charset.StandardCharsets;' backend/get_jobs/src/main/java/controller/BossCookieController.java
fi

# WebController.java
if ! grep -q "import java.nio.charset.StandardCharsets;" backend/get_jobs/src/main/java/controller/WebController.java; then
    sed -i '/^import java\./a import java.nio.charset.StandardCharsets;' backend/get_jobs/src/main/java/controller/WebController.java
fi

# JwtAuthenticationFilter.java
if ! grep -q "import java.nio.charset.StandardCharsets;" backend/get_jobs/src/main/java/filter/JwtAuthenticationFilter.java; then
    sed -i '/^import java\./a import java.nio.charset.StandardCharsets;' backend/get_jobs/src/main/java/filter/JwtAuthenticationFilter.java
fi

# BossExecutionService.java
if ! grep -q "import java.nio.charset.StandardCharsets;" backend/get_jobs/src/main/java/service/BossExecutionService.java; then
    sed -i '/^import java\./a import java.nio.charset.StandardCharsets;' backend/get_jobs/src/main/java/service/BossExecutionService.java
fi

# BossRunner.java
if ! grep -q "import java.nio.charset.StandardCharsets;" backend/get_jobs/src/main/java/boss/BossRunner.java; then
    sed -i '/^import java\./a import java.nio.charset.StandardCharsets;' backend/get_jobs/src/main/java/boss/BossRunner.java
fi

echo "✅ StandardCharsets import添加完成！"
