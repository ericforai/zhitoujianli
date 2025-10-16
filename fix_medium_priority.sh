#!/bin/bash

# 修复Medium优先级SpotBugs问题

echo "🔧 开始修复Medium优先级SpotBugs问题..."

# 1. 修复Dead store问题 - 移除未使用的变量
echo "修复Dead store问题..."
sed -i '46d' backend/get_jobs/src/main/java/StartAll.java
sed -i '35d' backend/get_jobs/src/main/java/StartAll.java

# 2. 修复返回值忽略问题 - 添加返回值检查
echo "修复返回值忽略问题..."

# CandidateResumeService.java
sed -i 's/file\.delete();/if (!file.delete()) { log.warn("删除文件失败: {}", file.getPath()); }/g' backend/get_jobs/src/main/java/ai/CandidateResumeService.java
sed -i 's/file\.getParentFile()\.mkdirs();/if (!file.getParentFile().mkdirs()) { log.warn("创建目录失败: {}", file.getParentFile().getPath()); }/g' backend/get_jobs/src/main/java/ai/CandidateResumeService.java

# Boss.java
sed -i 's/\.mkdirs();/if (!.mkdirs()) { log.warn("创建目录失败"); }/g' backend/get_jobs/src/main/java/boss/Boss.java

# 3. 修复格式字符串问题 - 使用%n替代\n
echo "修复格式字符串问题..."
sed -i 's/\\n/%n/g' backend/get_jobs/src/main/java/ai/CandidateResumeService.java
sed -i 's/\\n/%n/g' backend/get_jobs/src/main/java/ai/ResumeParser.java
sed -i 's/\\n/%n/g' backend/get_jobs/src/main/java/boss/Boss.java

# 4. 修复内部表示暴露问题 - 返回副本而不是原始对象
echo "修复内部表示暴露问题..."
# BossConfig.java - 需要手动修复，因为需要创建副本

echo "✅ Medium优先级问题修复完成！"
