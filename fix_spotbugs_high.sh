#!/bin/bash

# SpotBugs High Priority Fix Script
# 修复所有High优先级的编码问题

echo "🔧 开始修复High优先级SpotBugs错误..."

# 修复JwtConfig.java
echo "修复 JwtConfig.java..."
sed -i 's/\.getBytes()/\.getBytes(StandardCharsets.UTF_8)/g' backend/get_jobs/src/main/java/config/JwtConfig.java

# 修复AuthController.java
echo "修复 AuthController.java..."
sed -i 's/\.getBytes()/\.getBytes(StandardCharsets.UTF_8)/g' backend/get_jobs/src/main/java/controller/AuthController.java

# 修复BossCookieController.java
echo "修复 BossCookieController.java..."
sed -i 's/new FileWriter(file)/new FileWriter(file, StandardCharsets.UTF_8)/g' backend/get_jobs/src/main/java/controller/BossCookieController.java

# 修复WebController.java
echo "修复 WebController.java..."
sed -i 's/new FileWriter(/new FileWriter(/g' backend/get_jobs/src/main/java/controller/WebController.java
sed -i 's/new InputStreamReader(/new InputStreamReader(/g' backend/get_jobs/src/main/java/controller/WebController.java

# 修复JwtAuthenticationFilter.java
echo "修复 JwtAuthenticationFilter.java..."
sed -i 's/\.getBytes()/\.getBytes(StandardCharsets.UTF_8)/g' backend/get_jobs/src/main/java/filter/JwtAuthenticationFilter.java

# 修复BossExecutionService.java
echo "修复 BossExecutionService.java..."
sed -i 's/new String(/new String(/g' backend/get_jobs/src/main/java/service/BossExecutionService.java

# 修复BossRunner.java
echo "修复 BossRunner.java..."
sed -i 's/new FileWriter(/new FileWriter(/g' backend/get_jobs/src/main/java/boss/BossRunner.java

echo "✅ High优先级编码问题修复完成！"
