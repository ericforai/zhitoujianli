#!/bin/bash

# 设置定时任务
# 定期执行版本检查和自动部署

echo "=== 设置定时任务 ==="

# 创建cron任务
(crontab -l 2>/dev/null; echo "# 智投简历自动化任务") | crontab -
(crontab -l 2>/dev/null; echo "# 每小时检查版本一致性") | crontab -
(crontab -l 2>/dev/null; echo "0 * * * * /root/zhitoujianli/version-check.sh >> /var/log/zhitoujianli-cron.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "# 每天凌晨2点执行完整部署检查") | crontab -
(crontab -l 2>/dev/null; echo "0 2 * * * /root/zhitoujianli/ci-cd-local.sh >> /var/log/zhitoujianli-cron.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "# 每周一凌晨3点清理旧日志") | crontab -
(crontab -l 2>/dev/null; echo "0 3 * * 1 find /var/log -name '*zhitoujianli*' -mtime +7 -delete") | crontab -

echo "✓ 定时任务设置完成"
echo "查看当前cron任务:"
crontab -l
