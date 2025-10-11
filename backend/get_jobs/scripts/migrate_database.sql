-- ================================================================
-- 数据库迁移脚本 - 添加软删除、审计日志等新功能
--
-- 执行方法:
-- PGPASSWORD=zhitoujianli123 psql -h localhost -U zhitoujianli -d zhitoujianli -f migrate_database.sql
--
-- @author ZhiTouJianLi Team
-- @since 2025-10-11
-- ================================================================

\echo '================================================'
\echo '开始数据库迁移...'
\echo '================================================'

-- ================================================================
-- 1. 为users表添加软删除和最后登录字段
-- ================================================================

\echo '步骤 1: 为users表添加新字段...'

-- 添加软删除时间戳
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
COMMENT ON COLUMN users.deleted_at IS '软删除时间戳，null表示未删除';

-- 添加删除原因
ALTER TABLE users ADD COLUMN IF NOT EXISTS delete_reason VARCHAR(500);
COMMENT ON COLUMN users.delete_reason IS '删除原因';

-- 添加最后登录时间
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
COMMENT ON COLUMN users.last_login_at IS '最后登录时间';

-- 添加最后登录IP
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(50);
COMMENT ON COLUMN users.last_login_ip IS '最后登录IP地址';

\echo '✅ users表字段添加完成'

-- ================================================================
-- 2. 创建审计日志表
-- ================================================================

\echo '步骤 2: 创建user_audit_logs表...'

CREATE TABLE IF NOT EXISTS user_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    user_email VARCHAR(100),
    action_type VARCHAR(50) NOT NULL,
    description VARCHAR(500),
    result VARCHAR(20) NOT NULL,
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    request_path VARCHAR(200),
    failure_reason VARCHAR(1000),
    extra_data TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE user_audit_logs IS '用户操作审计日志表';
COMMENT ON COLUMN user_audit_logs.user_id IS '用户ID';
COMMENT ON COLUMN user_audit_logs.user_email IS '用户邮箱';
COMMENT ON COLUMN user_audit_logs.action_type IS '操作类型：REGISTER/LOGIN/LOGOUT等';
COMMENT ON COLUMN user_audit_logs.description IS '操作描述';
COMMENT ON COLUMN user_audit_logs.result IS '操作结果：SUCCESS/FAILURE/ERROR';
COMMENT ON COLUMN user_audit_logs.ip_address IS '客户端IP地址';
COMMENT ON COLUMN user_audit_logs.user_agent IS '用户代理（浏览器信息）';
COMMENT ON COLUMN user_audit_logs.request_path IS '请求路径';
COMMENT ON COLUMN user_audit_logs.failure_reason IS '失败原因';
COMMENT ON COLUMN user_audit_logs.extra_data IS '额外数据（JSON格式）';
COMMENT ON COLUMN user_audit_logs.created_at IS '创建时间';

\echo '✅ user_audit_logs表创建完成'

-- ================================================================
-- 3. 创建索引
-- ================================================================

\echo '步骤 3: 创建索引...'

-- users表索引
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at);

-- user_audit_logs表索引
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON user_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_user_email ON user_audit_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_action_type ON user_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON user_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_ip_address ON user_audit_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_result ON user_audit_logs(result);

-- 复合索引（优化常见查询）
CREATE INDEX IF NOT EXISTS idx_audit_user_action ON user_audit_logs(user_id, action_type, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_ip_action ON user_audit_logs(ip_address, action_type, created_at);

\echo '✅ 索引创建完成'

-- ================================================================
-- 4. 验证迁移结果
-- ================================================================

\echo '步骤 4: 验证迁移结果...'

-- 检查users表列
\echo '检查users表新字段:'
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('deleted_at', 'delete_reason', 'last_login_at', 'last_login_ip')
ORDER BY column_name;

-- 检查user_audit_logs表
\echo ''
\echo '检查user_audit_logs表:'
SELECT
    EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'user_audit_logs'
    ) as table_exists;

-- 统计索引
\echo ''
\echo '检查索引:'
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('users', 'user_audit_logs')
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ================================================================
-- 5. 显示统计信息
-- ================================================================

\echo ''
\echo '================================================'
\echo '迁移完成！统计信息：'
\echo '================================================'

SELECT 'users表记录数' as metric, COUNT(*)::TEXT as value FROM users
UNION ALL
SELECT 'users表新字段数', COUNT(*)::TEXT
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('deleted_at', 'delete_reason', 'last_login_at', 'last_login_ip')
UNION ALL
SELECT 'user_audit_logs表记录数', COUNT(*)::TEXT FROM user_audit_logs
UNION ALL
SELECT 'users表索引数', COUNT(*)::TEXT
FROM pg_indexes
WHERE tablename = 'users' AND indexname LIKE 'idx_%'
UNION ALL
SELECT 'audit_logs表索引数', COUNT(*)::TEXT
FROM pg_indexes
WHERE tablename = 'user_audit_logs' AND indexname LIKE 'idx_%';

\echo ''
\echo '✅ 数据库迁移成功完成！'
\echo '================================================'

