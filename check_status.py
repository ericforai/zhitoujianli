#!/usr/bin/env python3
import subprocess
import requests
import time

def check_backend_status():
    print("检查后端服务状态...")

    # 检查Java进程
    try:
        result = subprocess.run(['ps', 'aux'], capture_output=True, text=True)
        java_processes = [line for line in result.stdout.split('\n') if 'java' in line and 'get_jobs' in line]

        if java_processes:
            print("✅ 发现后端Java进程:")
            for proc in java_processes:
                print(f"  {proc}")
        else:
            print("❌ 未发现后端Java进程")

    except Exception as e:
        print(f"检查进程时出错: {e}")

    # 检查HTTP状态
    try:
        response = requests.get('http://localhost:8080/status', timeout=5)
        if response.status_code == 200:
            print("✅ 后端服务HTTP状态正常")
            print(f"  响应: {response.text}")
        else:
            print(f"❌ 后端服务HTTP状态异常: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ 无法连接到后端服务: {e}")

    # 检查日志
    try:
        with open('/root/zhitoujianli/logs/backend.log', 'r') as f:
            lines = f.readlines()
            print(f"\n📋 日志文件最后10行:")
            for line in lines[-10:]:
                print(f"  {line.strip()}")
    except Exception as e:
        print(f"读取日志时出错: {e}")

if __name__ == "__main__":
    check_backend_status()

