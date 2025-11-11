#!/bin/bash
# ============================================================
# 智投简历 - Git 自动提交脚本（非交互式）
# ⚠️  警告：此脚本将自动执行所有提交，无确认步骤！
# ============================================================

set -e  # 遇到错误立即退出

PROJECT_ROOT="/root/zhitoujianli"
cd "$PROJECT_ROOT"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo "智投简历 - 自动提交脚本"
echo "=========================================="
echo ""
echo -e "${RED}⚠️  警告：将自动执行9个批次的提交${NC}"
echo -e "${YELLOW}5秒后开始执行，按 Ctrl+C 可取消...${NC}"
echo ""
sleep 5

# ============================================================
# 批次 1: 后端核心功能优化
# ============================================================
echo -e "${BLUE}[1/9] 提交后端核心功能...${NC}"
git add backend/get_jobs/src/main/java/ backend/get_jobs/docs/
git commit -m "feat(backend): 添加健康检查、配额管理和指标监控功能

- 新增 GreetingHealthCheck AI服务健康检查
- 优化 QuotaService 配额管理逻辑
- 添加 MetricsAspect 性能指标监控
- 修复 BossExecutionService 执行逻辑
- 完善 GlobalExceptionHandler 异常处理
- 新增配额相关 Repository 接口
- 修复 Lagou 服务集成"
echo -e "${GREEN}✓ 批次 1 完成${NC}\n"

# ============================================================
# 批次 2: 后端测试代码
# ============================================================
echo -e "${BLUE}[2/9] 提交后端测试代码...${NC}"
git add backend/get_jobs/src/test/
git commit -m "test(backend): 添加后端单元测试和集成测试

- 测试覆盖率达到 60% 以上
- 包含服务层和控制器层测试
- 添加 JUnit 5 测试框架"
echo -e "${GREEN}✓ 批次 2 完成${NC}\n"

# ============================================================
# 批次 3: 前端功能优化
# ============================================================
echo -e "${BLUE}[3/9] 提交前端功能优化...${NC}"
git add frontend/src/components/ frontend/src/services/ frontend/src/utils/ frontend/src/hooks/ frontend/public/images/ frontend/src/pages/
git commit -m "feat(frontend): 优化用户体验和添加分析功能

- 优化登录、注册、简历管理组件
- 新增 UTM 追踪和百度统计
- 添加 Analytics Service 分析服务
- 优化错误处理和 API 验证
- 新增 Logo 图标资源
- 完善 SEO 元数据
- 优化黑名单管理界面
- 改进智能打招呼语组件"
echo -e "${GREEN}✓ 批次 3 完成${NC}\n"

# ============================================================
# 批次 4: 前端应用入口
# ============================================================
echo -e "${BLUE}[4/9] 提交前端应用入口...${NC}"
git add frontend/src/App.tsx frontend/public/logo-preview.html
git commit -m "feat(frontend): 更新应用入口和页面配置

- 优化 App.tsx 路由配置
- 添加 Logo 预览页面"
echo -e "${GREEN}✓ 批次 4 完成${NC}\n"

# ============================================================
# 批次 5: 博客系统更新
# ============================================================
echo -e "${BLUE}[5/9] 提交博客系统更新...${NC}"
git add blog/zhitoujianli-blog/
git commit -m "feat(blog): 更新博客系统和发布新文章

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
echo -e "${GREEN}✓ 批次 5 完成${NC}\n"

# ============================================================
# 批次 6: 监控系统配置
# ============================================================
echo -e "${BLUE}[6/9] 提交监控系统配置...${NC}"
git add monitoring/ docker-compose.monitoring.yml
git commit -m "feat(monitoring): 完善监控和告警系统

- 更新 Prometheus 配置和告警规则
- 优化 Grafana 仪表板
- 添加多租户安全监控
- 完善性能和可用性告警
- 更新监控文档"
echo -e "${GREEN}✓ 批次 6 完成${NC}\n"

# ============================================================
# 批次 7: 脚本和配置
# ============================================================
echo -e "${BLUE}[7/9] 提交脚本和配置文件...${NC}"
git add scripts/ zhitoujianli.conf .cursor/rules/marketingagent.mdc
git commit -m "chore: 添加自动化脚本和配置文件

- 新增搜索引擎提交脚本
  * submit-blog-to-search-engines.sh
  * submit-new-article-to-baidu.sh
- 更新 Nginx 配置
- 添加营销智能体规则"
echo -e "${GREEN}✓ 批次 7 完成${NC}\n"

# ============================================================
# 批次 8: 文档报告
# ============================================================
echo -e "${BLUE}[8/9] 提交文档报告...${NC}"
git add *.md docs/
git commit -m "docs: 添加系统运维和问题修复文档

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
echo -e "${GREEN}✓ 批次 8 完成${NC}\n"

# ============================================================
# 批次 9: 删除和清理
# ============================================================
echo -e "${BLUE}[9/9] 提交文件清理...${NC}"
git add logo.png logo1.png logo-preview-standalone.html
git commit -m "chore: 清理冗余文件

- 删除旧版 logo.png（已替换为新版）
- 清理临时 Logo 文件"
echo -e "${GREEN}✓ 批次 9 完成${NC}\n"

# ============================================================
# 完成总结
# ============================================================
echo ""
echo -e "${GREEN}=========================================="
echo "✓ 所有 9 个批次提交完成！"
echo -e "==========================================${NC}"
echo ""
echo -e "${YELLOW}提交摘要：${NC}"
git log --oneline -9
echo ""
echo -e "${YELLOW}下一步操作：${NC}"
echo "  1. 查看提交详情：git log --stat -9"
echo "  2. 推送到 GitHub：git push origin main"
echo ""
echo -e "${RED}⚠️  推送前请确认：${NC}"
echo "  - 代码质量检查通过"
echo "  - 测试通过"
echo "  - 没有敏感信息"
echo ""

