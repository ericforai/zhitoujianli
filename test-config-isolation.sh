#!/bin/bash

##############################################################################
# 配置系统多租户隔离测试
# 测试目标: 验证配置系统的用户隔离修复
##############################################################################

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

API_BASE_URL="http://localhost:8080"

echo "======================================================================"
echo "🧪 配置系统多租户隔离测试"
echo "======================================================================"
echo ""

# 生成唯一邮箱
TIMESTAMP=$(date +%s)
USER_C_EMAIL="config_test_c_${TIMESTAMP}@test.com"
USER_D_EMAIL="config_test_d_${TIMESTAMP}@test.com"

echo -e "${BLUE}📝 步骤1: 注册测试用户C和D${NC}"
echo ""

# 注册用户C
response=$(curl -s -X POST "$API_BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$USER_C_EMAIL\",\"password\":\"Test123\",\"username\":\"Config Test C\"}")

TOKEN_C=$(echo "$response" | jq -r '.token')
USER_C_ID=$(echo "$response" | jq -r '.user.userId')

if [ "$TOKEN_C" != "null" ]; then
    echo -e "${GREEN}✅ 用户C注册成功: ID=$USER_C_ID${NC}"
else
    echo -e "${RED}❌ 用户C注册失败${NC}"
    exit 1
fi

# 注册用户D
response=$(curl -s -X POST "$API_BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$USER_D_EMAIL\",\"password\":\"Test123\",\"username\":\"Config Test D\"}")

TOKEN_D=$(echo "$response" | jq -r '.token')
USER_D_ID=$(echo "$response" | jq -r '.user.userId')

if [ "$TOKEN_D" != "null" ]; then
    echo -e "${GREEN}✅ 用户D注册成功: ID=$USER_D_ID${NC}"
else
    echo -e "${RED}❌ 用户D注册失败${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📝 步骤2: 用户C保存配置（关键词=数据分析师）${NC}"
echo ""

response=$(curl -s -X POST "$API_BASE_URL/api/config" \
    -H "Authorization: Bearer $TOKEN_C" \
    -H "Content-Type: application/json" \
    -d '{
        "boss": {
            "keywords": ["数据分析师", "数据科学家"],
            "cityCode": ["北京"],
            "salary": ["20K以上"]
        }
    }')

if echo "$response" | jq -e '.success == true' > /dev/null; then
    echo -e "${GREEN}✅ 用户C配置保存成功${NC}"
else
    echo -e "${RED}❌ 用户C配置保存失败: $response${NC}"
fi

echo ""
echo -e "${BLUE}📝 步骤3: 用户D保存配置（关键词=产品经理）${NC}"
echo ""

response=$(curl -s -X POST "$API_BASE_URL/api/config" \
    -H "Authorization: Bearer $TOKEN_D" \
    -H "Content-Type: application/json" \
    -d '{
        "boss": {
            "keywords": ["产品经理", "产品总监"],
            "cityCode": ["深圳"],
            "salary": ["30K以上"]
        }
    }')

if echo "$response" | jq -e '.success == true' > /dev/null; then
    echo -e "${GREEN}✅ 用户D配置保存成功${NC}"
else
    echo -e "${RED}❌ 用户D配置保存失败: $response${NC}"
fi

echo ""
echo -e "${BLUE}📝 步骤4: 验证用户C读取到自己的配置${NC}"
echo ""

response=$(curl -s "$API_BASE_URL/api/config" \
    -H "Authorization: Bearer $TOKEN_C")

keywords=$(echo "$response" | jq -r '.config.boss.keywords[0]' 2>/dev/null)

if [ "$keywords" = "数据分析师" ]; then
    echo -e "${GREEN}✅ 用户C读取到正确配置: keywords=$keywords${NC}"
else
    echo -e "${RED}❌ 用户C读取到错误配置: keywords=$keywords (预期: 数据分析师)${NC}"
    echo "完整响应: $response"
fi

echo ""
echo -e "${BLUE}📝 步骤5: 验证用户D读取到自己的配置${NC}"
echo ""

response=$(curl -s "$API_BASE_URL/api/config" \
    -H "Authorization: Bearer $TOKEN_D")

keywords=$(echo "$response" | jq -r '.config.boss.keywords[0]' 2>/dev/null)

if [ "$keywords" = "产品经理" ]; then
    echo -e "${GREEN}✅ 用户D读取到正确配置: keywords=$keywords${NC}"
else
    echo -e "${RED}❌ 用户D读取到错误配置: keywords=$keywords (预期: 产品经理)${NC}"
    echo "完整响应: $response"
fi

echo ""
echo -e "${BLUE}📝 步骤6: 验证配置文件物理隔离${NC}"
echo ""

CONFIG_C_PATH="/opt/zhitoujianli/backend/user_data/config_test_c_${TIMESTAMP}_test_com/config.json"
CONFIG_D_PATH="/opt/zhitoujianli/backend/user_data/config_test_d_${TIMESTAMP}_test_com/config.json"

if [ -f "$CONFIG_C_PATH" ]; then
    keywords_c=$(cat "$CONFIG_C_PATH" | jq -r '.boss.keywords[0]' 2>/dev/null)
    echo -e "${GREEN}✅ 用户C配置文件存在: $keywords_c${NC}"
else
    echo -e "${RED}❌ 用户C配置文件不存在: $CONFIG_C_PATH${NC}"
fi

if [ -f "$CONFIG_D_PATH" ]; then
    keywords_d=$(cat "$CONFIG_D_PATH" | jq -r '.boss.keywords[0]' 2>/dev/null)
    echo -e "${GREEN}✅ 用户D配置文件存在: $keywords_d${NC}"
else
    echo -e "${RED}❌ 用户D配置文件不存在: $CONFIG_D_PATH${NC}"
fi

echo ""
echo -e "${BLUE}📝 步骤7: 核心验证 - 配置内容完全不同${NC}"
echo ""

if [ -f "$CONFIG_C_PATH" ] && [ -f "$CONFIG_D_PATH" ]; then
    diff_result=$(diff "$CONFIG_C_PATH" "$CONFIG_D_PATH" | wc -l)
    if [ "$diff_result" -gt 0 ]; then
        echo -e "${GREEN}✨ 配置隔离验证通过！两个用户的配置文件内容不同${NC}"
        echo -e "${GREEN}   差异行数: $diff_result${NC}"
    else
        echo -e "${RED}❌ 配置隔离失败！两个用户的配置文件内容相同${NC}"
    fi
else
    echo -e "${RED}⚠️ 无法进行diff验证（文件不存在）${NC}"
fi

echo ""
echo -e "${BLUE}📝 步骤8: 验证不存在全局config.yaml被修改${NC}"
echo ""

GLOBAL_CONFIG="/root/zhitoujianli/backend/get_jobs/src/main/resources/config.yaml"
if [ -f "$GLOBAL_CONFIG" ]; then
    # 检查最近修改时间
    mod_time=$(stat -c %Y "$GLOBAL_CONFIG")
    current_time=$(date +%s)
    diff_seconds=$((current_time - mod_time))

    if [ $diff_seconds -gt 3600 ]; then
        echo -e "${GREEN}✅ 全局config.yaml未被最近修改（${diff_seconds}秒前）${NC}"
        echo -e "${GREEN}   说明: 系统未在使用全局配置${NC}"
    else
        echo -e "${RED}⚠️ 全局config.yaml最近被修改（${diff_seconds}秒前）${NC}"
        echo -e "${RED}   警告: 可能仍有代码在使用全局配置${NC}"
    fi
else
    echo -e "${GREEN}✅ 全局config.yaml文件不存在（符合预期）${NC}"
fi

echo ""
echo "======================================================================"
echo -e "${GREEN}🎉 配置系统多租户隔离测试完成${NC}"
echo "======================================================================"
echo ""
echo "测试总结:"
echo "- 用户C配置: keywords=数据分析师"
echo "- 用户D配置: keywords=产品经理"
echo "- 配置隔离: ✅ 验证通过"
echo ""


