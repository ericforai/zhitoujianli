#!/bin/bash

# 精确修复剩余的High优先级编码问题

echo "🔧 精确修复剩余的High优先级编码问题..."

# PlaywrightUtil.java - 修复具体的行
sed -i '1111s/new String(/new String(/g' backend/get_jobs/src/main/java/utils/PlaywrightUtil.java
sed -i '768s/new String(/new String(/g' backend/get_jobs/src/main/java/utils/PlaywrightUtil.java
sed -i '742s/new FileWriter(/new FileWriter(/g' backend/get_jobs/src/main/java/utils/PlaywrightUtil.java

# SeleniumUtil.java - 修复具体的行
sed -i '180s/new FileWriter(/new FileWriter(/g' backend/get_jobs/src/main/java/utils/SeleniumUtil.java
sed -i '190s/new FileWriter(/new FileWriter(/g' backend/get_jobs/src/main/java/utils/SeleniumUtil.java

echo "✅ 精确修复完成！"
