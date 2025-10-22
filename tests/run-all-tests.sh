#!/bin/bash

###############################################################################
# 智投简历 - 自动化测试执行脚本
#
# 功能：
# - 执行所有后端测试（JUnit）
# - 执行所有前端测试（Jest）
# - 执行E2E测试（Playwright）
# - 生成测试报告
#
# 用法：
#   ./run-all-tests.sh [选项]
#
# 选项：
#   --backend-only    只运行后端测试
#   --frontend-only   只运行前端测试
#   --e2e-only        只运行E2E测试
#   --skip-e2e        跳过E2E测试（加快速度）
#   --verbose         显示详细输出
#
# @author ZhiTouJianLi Test Team
# @since 2025-10-22
###############################################################################

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend/get_jobs"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
TEST_DIR="$PROJECT_ROOT/tests"

# 日志文件
LOG_DIR="$PROJECT_ROOT/test-results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/test_run_$TIMESTAMP.log"

# 测试结果
BACKEND_RESULT=0
FRONTEND_RESULT=0
E2E_RESULT=0

# 解析命令行参数
BACKEND_ONLY=false
FRONTEND_ONLY=false
E2E_ONLY=false
SKIP_E2E=false
VERBOSE=false

for arg in "$@"; do
  case $arg in
    --backend-only)
      BACKEND_ONLY=true
      ;;
    --frontend-only)
      FRONTEND_ONLY=true
      ;;
    --e2e-only)
      E2E_ONLY=true
      ;;
    --skip-e2e)
      SKIP_E2E=true
      ;;
    --verbose)
      VERBOSE=true
      ;;
    *)
      echo -e "${RED}未知选项: $arg${NC}"
      exit 1
      ;;
  esac
done

# 创建日志目录
mkdir -p "$LOG_DIR"

# 打印函数
print_header() {
  echo -e "\n${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

# 开始测试
print_header "智投简历 - 自动化测试套件"
print_info "测试开始时间: $(date '+%Y-%m-%d %H:%M:%S')"
print_info "项目根目录: $PROJECT_ROOT"
print_info "日志文件: $LOG_FILE"

{
  echo "========================================="
  echo "智投简历 - 测试执行日志"
  echo "测试开始时间: $(date '+%Y-%m-%d %H:%M:%S')"
  echo "========================================="
  echo ""
} > "$LOG_FILE"

# ==================== 后端测试 ====================

if [ "$FRONTEND_ONLY" = false ] && [ "$E2E_ONLY" = false ]; then
  print_header "执行后端测试（JUnit 5）"

  if [ ! -d "$BACKEND_DIR" ]; then
    print_error "后端目录不存在: $BACKEND_DIR"
    exit 1
  fi

  cd "$BACKEND_DIR"

  print_info "检查Maven是否安装..."
  if ! command -v mvn &> /dev/null; then
    print_error "Maven未安装，请先安装Maven"
    exit 1
  fi

  print_info "运行Maven测试..."

  if [ "$VERBOSE" = true ]; then
    mvn clean test 2>&1 | tee -a "$LOG_FILE"
    BACKEND_RESULT=${PIPESTATUS[0]}
  else
    mvn clean test >> "$LOG_FILE" 2>&1
    BACKEND_RESULT=$?
  fi

  if [ $BACKEND_RESULT -eq 0 ]; then
    print_success "后端测试通过"
  else
    print_error "后端测试失败"
  fi

  # 生成测试报告
  if [ -d "$BACKEND_DIR/target/surefire-reports" ]; then
    print_info "后端测试报告: $BACKEND_DIR/target/surefire-reports"
  fi
fi

# ==================== 前端测试 ====================

if [ "$BACKEND_ONLY" = false ] && [ "$E2E_ONLY" = false ]; then
  print_header "执行前端测试（Jest + React Testing Library）"

  if [ ! -d "$FRONTEND_DIR" ]; then
    print_error "前端目录不存在: $FRONTEND_DIR"
    exit 1
  fi

  cd "$FRONTEND_DIR"

  print_info "检查Node.js和npm是否安装..."
  if ! command -v node &> /dev/null; then
    print_error "Node.js未安装，请先安装Node.js"
    exit 1
  fi

  if ! command -v npm &> /dev/null; then
    print_error "npm未安装，请先安装npm"
    exit 1
  fi

  print_info "检查依赖..."
  if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    print_info "安装前端依赖..."
    npm install >> "$LOG_FILE" 2>&1
  fi

  print_info "运行Jest测试..."

  if [ "$VERBOSE" = true ]; then
    npm test -- --coverage --watchAll=false 2>&1 | tee -a "$LOG_FILE"
    FRONTEND_RESULT=${PIPESTATUS[0]}
  else
    npm test -- --coverage --watchAll=false >> "$LOG_FILE" 2>&1
    FRONTEND_RESULT=$?
  fi

  if [ $FRONTEND_RESULT -eq 0 ]; then
    print_success "前端测试通过"
  else
    print_error "前端测试失败"
  fi

  # 生成测试报告
  if [ -d "$FRONTEND_DIR/coverage" ]; then
    print_info "前端测试覆盖率报告: $FRONTEND_DIR/coverage/lcov-report/index.html"
  fi
fi

# ==================== E2E测试 ====================

if [ "$BACKEND_ONLY" = false ] && [ "$FRONTEND_ONLY" = false ] && [ "$SKIP_E2E" = false ]; then
  print_header "执行E2E测试（Playwright）"

  print_warning "E2E测试需要启动前后端服务"
  print_info "请确保以下服务正在运行："
  print_info "  - 后端服务: http://localhost:8080"
  print_info "  - 前端服务: http://localhost:3000"

  read -p "是否继续执行E2E测试？(y/n) " -n 1 -r
  echo

  if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd "$PROJECT_ROOT"

    # 检查Playwright是否安装
    if [ ! -d "$PROJECT_ROOT/node_modules/@playwright" ]; then
      print_info "安装Playwright..."
      npm install -D @playwright/test >> "$LOG_FILE" 2>&1
      npx playwright install >> "$LOG_FILE" 2>&1
    fi

    print_info "运行Playwright E2E测试..."

    if [ "$VERBOSE" = true ]; then
      npx playwright test tests/e2e 2>&1 | tee -a "$LOG_FILE"
      E2E_RESULT=${PIPESTATUS[0]}
    else
      npx playwright test tests/e2e >> "$LOG_FILE" 2>&1
      E2E_RESULT=$?
    fi

    if [ $E2E_RESULT -eq 0 ]; then
      print_success "E2E测试通过"
    else
      print_error "E2E测试失败"
    fi

    # 生成测试报告
    if [ -d "$PROJECT_ROOT/playwright-report" ]; then
      print_info "E2E测试报告: $PROJECT_ROOT/playwright-report/index.html"
    fi
  else
    print_warning "跳过E2E测试"
  fi
fi

# ==================== 测试总结 ====================

print_header "测试执行总结"

TOTAL_FAILED=0

if [ "$FRONTEND_ONLY" = false ] && [ "$E2E_ONLY" = false ]; then
  if [ $BACKEND_RESULT -eq 0 ]; then
    print_success "后端测试: 通过"
  else
    print_error "后端测试: 失败"
    TOTAL_FAILED=$((TOTAL_FAILED + 1))
  fi
fi

if [ "$BACKEND_ONLY" = false ] && [ "$E2E_ONLY" = false ]; then
  if [ $FRONTEND_RESULT -eq 0 ]; then
    print_success "前端测试: 通过"
  else
    print_error "前端测试: 失败"
    TOTAL_FAILED=$((TOTAL_FAILED + 1))
  fi
fi

if [ "$BACKEND_ONLY" = false ] && [ "$FRONTEND_ONLY" = false ] && [ "$SKIP_E2E" = false ]; then
  if [ $E2E_RESULT -eq 0 ]; then
    print_success "E2E测试: 通过"
  else
    print_error "E2E测试: 失败"
    TOTAL_FAILED=$((TOTAL_FAILED + 1))
  fi
fi

echo ""
print_info "测试结束时间: $(date '+%Y-%m-%d %H:%M:%S')"
print_info "完整日志: $LOG_FILE"

if [ $TOTAL_FAILED -eq 0 ]; then
  print_success "所有测试通过！"
  exit 0
else
  print_error "有 $TOTAL_FAILED 个测试套件失败"
  exit 1
fi


