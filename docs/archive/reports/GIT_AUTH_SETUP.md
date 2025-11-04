# Git 认证配置指南

## 问题说明
当前项目无法推送到 GitHub，原因是缺少认证配置。

## 解决方案

### 方案一：使用 Personal Access Token (推荐)

1. **创建 GitHub Personal Access Token**
   - 访问：https://github.com/settings/tokens
   - 点击 "Generate new token (classic)"
   - 选择权限：`repo` (完整仓库访问权限)
   - 设置过期时间（建议 1 年）
   - 生成并复制 Token

2. **配置 Git 使用 Token**
   ```bash
   cd /root/zhitoujianli
   git config --global credential.helper store
   ```

3. **推送时使用 Token**
   ```bash
   git push origin main
   # 用户名：你的 GitHub 用户名
   # 密码：刚才生成的 Personal Access Token
   ```

### 方案二：使用 SSH 密钥

1. **已生成的 SSH 公钥**：
   ```
   ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINWXKycbk7I+DVHlCshk7b9LcJ2/VOyyphaJ4+Oe5s2L zhitoujianli@example.com
   ```

2. **添加公钥到 GitHub**
   - 访问：https://github.com/settings/ssh/new
   - 粘贴上面的公钥内容
   - 设置标题为 "zhitoujianli-server"
   - 点击 "Add SSH key"

3. **测试 SSH 连接**
   ```bash
   ssh -T git@github.com
   ```

4. **切换远程仓库为 SSH**
   ```bash
   git remote set-url origin git@github.com:ericforai/zhitoujianli.git
   ```

## 当前状态
- ✅ SSH 密钥已生成
- ✅ SSH 配置已设置
- ✅ Git 凭据存储已配置
- ❌ 需要添加 SSH 公钥到 GitHub 或使用 PAT

## 推荐使用方案一（PAT）
因为 PAT 配置更简单，不需要在 GitHub 界面操作。
