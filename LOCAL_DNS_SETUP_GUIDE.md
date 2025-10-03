# 本地DNS设置指南

## 🎯 目标
将您的本地DNS服务器设置为 8.8.8.8 和 8.8.4.4，以解决域名访问问题。

## ✅ 服务器端DNS已设置完成
- 主DNS: 8.8.8.8
- 备用DNS: 8.8.4.4
- 备用DNS: 1.1.1.1, 1.0.0.1

## 🖥️ Windows系统DNS设置

### 方法1: 图形界面设置
1. **打开网络设置**
   - 右键点击任务栏右下角的网络图标
   - 选择"打开网络和Internet设置"
   - 点击"更改适配器选项"

2. **选择网络连接**
   - 找到您正在使用的网络连接（以太网或WiFi）
   - 右键点击 → "属性"

3. **配置IPv4 DNS**
   - 选择"Internet协议版本4(TCP/IPv4)"
   - 点击"属性"按钮
   - 选择"使用下面的DNS服务器地址"
   - 输入以下DNS地址：
     ```
     首选DNS服务器: 8.8.8.8
     备用DNS服务器: 8.8.4.4
     ```
   - 点击"确定"保存

### 方法2: 命令行设置
```cmd
# 以管理员身份运行命令提示符
# 设置DNS
netsh interface ip set dns "以太网" static 8.8.8.8
netsh interface ip add dns "以太网" 8.8.4.4 index=2

# 清除DNS缓存
ipconfig /flushdns

# 重启网络适配器
ipconfig /release
ipconfig /renew
```

## 🍎 Mac系统DNS设置

### 方法1: 系统偏好设置
1. **打开网络设置**
   - 点击苹果菜单 → "系统偏好设置"
   - 点击"网络"

2. **选择网络连接**
   - 选择左侧的网络连接（Wi-Fi或以太网）
   - 点击"高级"按钮

3. **配置DNS**
   - 点击"DNS"标签页
   - 点击左下角的"+"按钮添加DNS服务器
   - 输入以下DNS地址：
     ```
     8.8.8.8
     8.8.4.4
     ```
   - 点击"好"保存

### 方法2: 命令行设置
```bash
# 查看网络接口
networksetup -listallnetworkservices

# 设置WiFi DNS
sudo networksetup -setdnsservers Wi-Fi 8.8.8.8 8.8.4.4

# 设置以太网DNS
sudo networksetup -setdnsservers Ethernet 8.8.8.8 8.8.4.4

# 清除DNS缓存
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

## 🐧 Linux系统DNS设置

### Ubuntu/Debian系统
```bash
# 编辑网络配置文件
sudo nano /etc/netplan/01-netcfg.yaml

# 添加DNS配置
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: true
      nameservers:
        addresses:
          - 8.8.8.8
          - 8.8.4.4

# 应用配置
sudo netplan apply

# 重启网络服务
sudo systemctl restart systemd-resolved
```

### CentOS/RHEL系统
```bash
# 编辑网络配置文件
sudo nano /etc/sysconfig/network-scripts/ifcfg-eth0

# 添加DNS配置
DNS1=8.8.8.8
DNS2=8.8.4.4

# 重启网络服务
sudo systemctl restart network
```

## 📱 手机DNS设置

### Android手机
1. **WiFi设置**
   - 设置 → WiFi
   - 长按连接的WiFi网络
   - 选择"修改网络"
   - 高级选项 → IP设置 → 静态
   - 设置DNS1: 8.8.8.8, DNS2: 8.8.4.4

### iPhone手机
1. **WiFi设置**
   - 设置 → WiFi
   - 点击连接的WiFi网络右侧的"i"
   - 配置DNS → 手动
   - 添加DNS服务器: 8.8.8.8, 8.8.4.4

## 🧪 验证DNS设置

### Windows验证
```cmd
# 检查DNS设置
ipconfig /all

# 测试DNS解析
nslookup zhitoujianli.com

# 清除缓存后测试
ipconfig /flushdns
nslookup zhitoujianli.com
```

### Mac/Linux验证
```bash
# 检查DNS设置
cat /etc/resolv.conf

# 测试DNS解析
nslookup zhitoujianli.com
dig zhitoujianli.com

# 清除缓存后测试
sudo dscacheutil -flushcache  # Mac
sudo systemctl restart systemd-resolved  # Linux
```

## 🌐 测试网站访问

设置完成后，按以下顺序测试访问：

1. **直接IP访问**: http://115.190.182.95
2. **域名访问**: https://zhitoujianli.com
3. **博客访问**: https://zhitoujianli.com/blog/

## 🔧 故障排除

如果设置后仍然无法访问：

1. **重启网络适配器**
2. **清除浏览器缓存**
3. **尝试不同浏览器**
4. **检查防火墙设置**
5. **尝试移动数据网络**

## 📞 需要帮助？

如果按照上述步骤仍无法解决问题，请提供：
- 操作系统版本
- DNS设置截图
- 命令行测试结果
- 浏览器错误信息

**记住：服务器端已完全正常，问题一定在本地网络环境！**
