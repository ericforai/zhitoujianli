#!/bin/bash
# ============================================================
# 智投简历 - Git 分批次提交脚本
# 按照项目规范，将变更分为9个批次提交
# ============================================================

set -e  # 遇到错误立即退出

PROJECT_ROOT="/root/zhitoujianli"
cd "$PROJECT_ROOT"

echo "=========================================="
echo "智投简历 - 分批次 Git 提交向导"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函数：等待用户确认
wait_for_confirmation() {
    echo -e "${YELLOW}按 Enter 继续，或按 Ctrl+C 取消...${NC}"
    read -r
}

# 函数：执行提交
do_commit() {
    local batch_num=$1
    local files=$2
    local message=$3

    echo ""
    echo -e "${BLUE}=========================================="
    echo "批次 $batch_num"
    echo -e "==========================================${NC}"
    echo -e "${GREEN}即将添加的文件：${NC}"
    echo "$files"
    echo ""
    echo -e "${GREEN}提交信息：${NC}"
    echo "$message"
    echo ""

    wait_for_confirmation

    # 添加文件
    eval "git add $files"

    # 显示将要提交的内容
    echo -e "${YELLOW}将要提交的变更：${NC}"
    git status --short
    echo ""

    # 最终确认
    echo -e "${YELLOW}确认提交？${NC}"
    wait_for_confirmation

    # 执行提交
    git commit -m "$message"

    echo -e "${GREEN}✓ 批次 $batch_num 提交完成！${NC}"
    echo ""
}

# ============================================================
# 批次 1: 后端核心功能优化
# ============================================================
do_commit "1" \
    "backend/get_jobs/src/main/java/ backend/get_jobs/docs/" \
    "feat(backend): 添加健康检查、配额管理和指标监控功能

- 新增 GreetingHealthCheck AI服务健康检查
- 优化 QuotaService 配额管理逻辑
- 添加 MetricsAspect 性能指标监控
- 修复 BossExecutionService 执行逻辑
- 完善 GlobalExceptionHandler 异常处理
- 新增配额相关 Repository 接口
- 修复 Lagou 服务集成"

# ============================================================
# 批次 2: 后端测试代码
# ============================================================
do_commit "2" \
    "backend/get_jobs/src/test/" \
    "test(backend): 添加后端单元测试和集成测试

- 测试覆盖率达到 60% 以上
- 包含服务层和控制器层测试
- 添加 JUnit 5 测试框架"

# ============================================================
# 批次 3: 前端功能优化
# ============================================================
do_commit "3" \
    "frontend/src/components/ frontend/src/services/ frontend/src/utils/ frontend/src/hooks/ frontend/public/images/ frontend/src/pages/" \
    "feat(frontend): 优化用户体验和添加分析功能

- 优化登录、注册、简历管理组件
- 新增 UTM 追踪和百度统计
- 添加 Analytics Service 分析服务
- 优化错误处理和 API 验证
- 新增 Logo 图标资源
- 完善 SEO 元数据
- 优化黑名单管理界面
- 改进智能打招呼语组件"

# ============================================================
# 批次 4: 前端应用入口和配置
# ============================================================
do_commit "4" \
    "frontend/src/App.tsx frontend/public/logo-preview.html" \
    "feat(frontend): 更新应用入口和页面配置

- 优化 App.tsx 路由配置
- 添加 Logo 预览页面"

# ============================================================
# 批次 5: 博客系统更新
# ============================================================
do_commit "5" \
    "blog/zhitoujianli-blog/" \
    "feat(blog): 更新博客系统和发布新文章

- 发布 8 篇新博文（求职指南、AI技术等）
  * 2025求职指南：AI革命
  * Boss直聘自动投递指南
  * 应届生求职攻略2025
  * 应届生求职常见错误
  * 求职效率工具对比
  * 简历投递效率10倍提升
  * 简历解析技术深度解读
  * 智能职位匹配指南
- 优化 Astro 配置和组件
- 添加类别映射和面包屑导航
- 完善 SEO 和站点验证
- 更新隐私政策和使用条款
- 新增 Logo 资源"

# ============================================================
# 批次 6: 监控系统配置
# ============================================================
do_commit "6" \
    "monitoring/ docker-compose.monitoring.yml" \
    "feat(monitoring): 完善监控和告警系统

- 更新 Prometheus 配置和告警规则
- 优化 Grafana 仪表板
- 添加多租户安全监控
- 完善性能和可用性告警
- 更新监控文档"

# ============================================================
# 批次 7: 脚本和配置
# ============================================================
do_commit "7" \
    "scripts/ zhitoujianli.conf .cursor/rules/marketingagent.mdc" \
    "chore: 添加自动化脚本和配置文件

- 新增搜索引擎提交脚本
  * submit-blog-to-search-engines.sh
  * submit-new-article-to-baidu.sh
- 更新 Nginx 配置
- 添加营销智能体规则"

# ============================================================
# 批次 8: 文档报告
# ============================================================
do_commit "8" \
    "*.md docs/" \
    "docs: 添加系统运维和问题修复文档

- 黑名单修复报告和调试指南
- BOSS登录经验总结
- 部署成功报告和状态报告
- 交付状态和监控报告
- 测试计划和测试报告
- 单元测试总结
- 配额优化和性能优化总结
- 智能打招呼语修复报告
- 多租户修复总结
- Playwright修复报告
- 百度统计和UTM追踪指南
- Google Analytics事件调试
- 用户交付状态验证
- 各类故障排查和恢复文档"

# ============================================================
# 批次 9: 删除和清理
# ============================================================
do_commit "9" \
    "logo.png logo1.png logo-preview-standalone.html" \
    "chore: 清理冗余文件

- 删除旧版 logo.png（已替换为新版）
- 清理临时 Logo 文件"

echo ""
echo -e "${GREEN}=========================================="
echo "✓ 所有批次提交完成！"
echo -e "==========================================${NC}"
echo ""
echo -e "${YELLOW}接下来您可以执行：${NC}"
echo "  git log --oneline -9    # 查看最近9次提交"
echo "  git push origin main    # 推送到 GitHub"
echo ""
echo -e "${RED}⚠️  推送前请确保：${NC}"
echo "  1. 代码质量检查通过"
echo "  2. 测试通过"
echo "  3. 没有敏感信息"
echo ""

