#!/bin/bash

# 修复剩余的High优先级编码问题

echo "🔧 修复剩余的High优先级编码问题..."

# BossExecutionService.java - 修复lambda中的FileWriter和InputStreamReader
sed -i 's/new FileWriter(logFile, true)/new FileWriter(logFile, true, StandardCharsets.UTF_8)/g' backend/get_jobs/src/main/java/service/BossExecutionService.java
sed -i 's/new InputStreamReader(process.getInputStream())/new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8)/g' backend/get_jobs/src/main/java/service/BossExecutionService.java
sed -i 's/new InputStreamReader(process.getErrorStream())/new InputStreamReader(process.getErrorStream(), StandardCharsets.UTF_8)/g' backend/get_jobs/src/main/java/service/BossExecutionService.java
sed -i 's/new FileWriter(logFilePath, true)/new FileWriter(logFilePath, true, StandardCharsets.UTF_8)/g' backend/get_jobs/src/main/java/service/BossExecutionService.java

# EncryptDecryptUtil.java - 修复加密解密方法
sed -i 's/\.getBytes()/\.getBytes(StandardCharsets.UTF_8)/g' backend/get_jobs/src/main/java/utils/EncryptDecryptUtil.java
sed -i 's/new String(/new String(/g' backend/get_jobs/src/main/java/utils/EncryptDecryptUtil.java

echo "✅ 剩余High优先级编码问题修复完成！"
