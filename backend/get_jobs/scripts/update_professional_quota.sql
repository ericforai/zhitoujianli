-- ============================================================
-- 更新极速上岸版（PROFESSIONAL）配额配置
-- 执行时间：2025-01-XX
-- 说明：修复极速上岸版配额配置
-- ============================================================

-- 1. 更新简历高级优化配额：从1次改为3次
UPDATE plan_quota_configs
SET
    quota_limit = 3,
    is_unlimited = false,
    updated_at = CURRENT_TIMESTAMP
WHERE
    plan_type = 'PROFESSIONAL'
    AND quota_id IN (
        SELECT id FROM quota_definitions
        WHERE quota_key = 'resume_advanced_optimize' AND is_active = true
    );

-- 2. 更新每日投递配额：从30次改为100次
UPDATE plan_quota_configs
SET
    quota_limit = 100,
    is_unlimited = false,
    updated_at = CURRENT_TIMESTAMP
WHERE
    plan_type = 'PROFESSIONAL'
    AND quota_id IN (
        SELECT id FROM quota_definitions
        WHERE quota_key = 'daily_job_application' AND is_active = true
    );

-- 3. 确保简历基础优化为无限次
UPDATE plan_quota_configs
SET
    quota_limit = -1,
    is_unlimited = true,
    updated_at = CURRENT_TIMESTAMP
WHERE
    plan_type = 'PROFESSIONAL'
    AND quota_id IN (
        SELECT id FROM quota_definitions
        WHERE quota_key = 'resume_basic_optimize' AND is_active = true
    );

-- 4. 验证更新结果
SELECT
    p.plan_type,
    q.quota_key,
    q.quota_name,
    p.quota_limit,
    p.is_unlimited,
    p.is_enabled
FROM plan_quota_configs p
JOIN quota_definitions q ON p.quota_id = q.id
WHERE p.plan_type = 'PROFESSIONAL'
    AND q.quota_key IN ('resume_basic_optimize', 'resume_advanced_optimize', 'daily_job_application')
ORDER BY q.quota_key;



