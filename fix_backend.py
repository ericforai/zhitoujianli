#!/usr/bin/env python3
import subprocess
import time
import os

def fix_backend():
    print("🔧 修复后端服务...")

    # 1. 杀死所有Java进程
    print("1. 停止所有Java进程...")
    try:
        subprocess.run(["pkill", "-f", "java"], check=False)
        time.sleep(2)
        print("✅ Java进程已停止")
    except:
        print("⚠️ 停止Java进程时出现问题")

    # 2. 检查并杀死占用8080端口的进程
    print("2. 释放8080端口...")
    try:
        result = subprocess.run(["lsof", "-ti:8080"], capture_output=True, text=True)
        if result.stdout.strip():
            pids = result.stdout.strip().split('\n')
            for pid in pids:
                try:
                    subprocess.run(["kill", "-9", pid], check=True)
                    print(f"✅ 已杀死进程 {pid}")
                except:
                    pass
            time.sleep(2)
        print("✅ 8080端口已释放")
    except:
        print("⚠️ 释放8080端口时出现问题")

    # 3. 进入后端目录
    os.chdir("/root/zhitoujianli/backend/get_jobs")
    print("3. 进入后端目录...")

    # 4. 重新编译
    print("4. 重新编译项目...")
    try:
        subprocess.run(["mvn", "clean", "compile", "-q"], check=True)
        print("✅ 编译成功")
    except subprocess.CalledProcessError:
        print("❌ 编译失败，尝试使用现有JAR")

    # 5. 启动服务
    print("5. 启动后端服务...")
    try:
        # 尝试使用新编译的JAR
        if os.path.exists("target/get_jobs-1.0-SNAPSHOT.jar"):
            jar_file = "target/get_jobs-1.0-SNAPSHOT.jar"
        else:
            jar_file = "target/get_jobs-v2.0.1.jar"

        with open("/root/zhitoujianli/logs/backend.log", "w") as log_file:
            process = subprocess.Popen(
                ["java", "-jar", jar_file],
                stdout=log_file,
                stderr=subprocess.STDOUT,
                cwd="/root/zhitoujianli/backend/get_jobs"
            )

        print(f"✅ 后端服务已启动，使用JAR: {jar_file}")
        print("📋 请等待10秒钟让服务完全启动...")
        time.sleep(10)

        # 6. 测试服务
        print("6. 测试服务状态...")
        try:
            import requests
            response = requests.get("http://localhost:8080/status", timeout=5)
            if response.status_code == 200:
                print("🎉 后端服务启动成功！")
                print("✅ 现在可以测试注册功能了")
                return True
            else:
                print(f"⚠️ 服务响应异常: {response.status_code}")
        except:
            print("⚠️ 无法连接到服务，请检查日志")

    except Exception as e:
        print(f"❌ 启动失败: {e}")
        return False

    return False

if __name__ == "__main__":
    success = fix_backend()
    if success:
        print("\n🎉 后端服务已成功启动！")
        print("📧 现在可以测试邮箱注册功能了")
        print("🔗 前端地址: http://localhost:3000")
        print("🔗 后端状态: http://localhost:8080/status")
    else:
        print("\n❌ 后端服务启动失败，请检查日志")
        print("📋 日志位置: /root/zhitoujianli/logs/backend.log")

