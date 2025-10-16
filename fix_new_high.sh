#!/bin/bash

# 修复新出现的High优先级问题

echo "🔧 修复新出现的High优先级问题..."

# 1. 修复静态字段写入问题
echo "修复静态字段写入问题..."
# AutoDeliveryController.java - 将静态字段改为实例字段
sed -i 's/private static volatile boolean isRunning/private volatile boolean isRunning/g' backend/get_jobs/src/main/java/controller/AutoDeliveryController.java

# 2. 修复常量应该是final的问题
echo "修复常量应该是final的问题..."
sed -i 's/public static String ACTIONS/public static final String ACTIONS/g' backend/get_jobs/src/main/java/utils/Constant.java
sed -i 's/public static String CHROME_DRIVER/public static final String CHROME_DRIVER/g' backend/get_jobs/src/main/java/utils/Finder.java
sed -i 's/public static String UNLIMITED_CODE/public static final String UNLIMITED_CODE/g' backend/get_jobs/src/main/java/utils/Constant.java

echo "✅ 新出现的High优先级问题修复完成！"
