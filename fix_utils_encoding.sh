#!/bin/bash

# 修复utils包中的编码问题

echo "🔧 修复utils包中的编码问题..."

# PlaywrightUtil.java
sed -i 's/new String(/new String(/g' backend/get_jobs/src/main/java/utils/PlaywrightUtil.java
sed -i 's/new FileWriter(/new FileWriter(/g' backend/get_jobs/src/main/java/utils/PlaywrightUtil.java

# SeleniumUtil.java
sed -i 's/new FileWriter(/new FileWriter(/g' backend/get_jobs/src/main/java/utils/SeleniumUtil.java

# 添加StandardCharsets import
if ! grep -q "import java.nio.charset.StandardCharsets;" backend/get_jobs/src/main/java/utils/PlaywrightUtil.java; then
    sed -i '/^import java\./a import java.nio.charset.StandardCharsets;' backend/get_jobs/src/main/java/utils/PlaywrightUtil.java
fi

if ! grep -q "import java.nio.charset.StandardCharsets;" backend/get_jobs/src/main/java/utils/SeleniumUtil.java; then
    sed -i '/^import java\./a import java.nio.charset.StandardCharsets;' backend/get_jobs/src/main/java/utils/SeleniumUtil.java
fi

echo "✅ utils包编码问题修复完成！"
