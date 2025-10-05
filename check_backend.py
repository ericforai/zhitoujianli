#!/usr/bin/env python3
import subprocess
import time

def check_backend():
    print("🔍 检查后端服务状态...")

    # 检查Java进程
    try:
        result = subprocess.run(['ps', 'aux'], capture_output=True, text=True)
        java_lines = [line for line in result.stdout.split('\n') if 'java' in line and 'get_jobs' in line]

        if java_lines:
            print("✅ 发现后端Java进程:")
            for line in java_lines:
                print(f"   {line}")
        else:
            print("❌ 未发现后端Java进程")
            return False
    except Exception as e:
        print(f"检查进程时出错: {e}")
        return False

    # 检查8080端口
    try:
        result = subprocess.run(['netstat', '-tlnp'], capture_output=True, text=True)
        port_lines = [line for line in result.stdout.split('\n') if ':8080' in line]

        if port_lines:
            print("✅ 8080端口正在监听:")
            for line in port_lines:
                print(f"   {line}")
        else:
            print("❌ 8080端口未监听")
            return False
    except Exception as e:
        print(f"检查端口时出错: {e}")

    # 测试HTTP接口
    try:
        import requests
        response = requests.get('http://localhost:8080/status', timeout=5)
        if response.status_code == 200:
            print("✅ 后端服务HTTP响应正常")
            print(f"   响应: {response.text}")
            return True
        else:
            print(f"❌ HTTP响应异常: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ HTTP测试失败: {e}")
        return False

if __name__ == "__main__":
    if check_backend():
        print("\n🎉 后端服务运行正常！")
        print("📧 可以开始测试邮箱注册功能了")
    else:
        print("\n❌ 后端服务未正常运行")
        print("📋 请检查日志: /root/zhitoujianli/logs/backend.log")

