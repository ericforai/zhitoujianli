#!/usr/bin/env python3
import subprocess
import time
import os
import signal

def restart_backend():
    print("正在重启后端服务...")

    # 停止现有的Java进程
    print("停止现有后端服务...")
    try:
        subprocess.run(["pkill", "-f", "get_jobs"], check=False)
        subprocess.run(["pkill", "-f", "WebApplication"], check=False)
    except:
        pass

    # 等待进程完全停止
    time.sleep(3)

    # 进入后端目录并重新编译打包
    os.chdir("/root/zhitoujianli/backend/get_jobs")

    print("重新编译和打包项目...")
    try:
        subprocess.run(["mvn", "clean", "package", "-DskipTests", "-q"], check=True)
        print("✅ 编译成功")
    except subprocess.CalledProcessError as e:
        print(f"❌ 编译失败: {e}")
        return False

    # 启动后端服务
    print("启动后端服务...")
    try:
        with open("/root/zhitoujianli/logs/backend.log", "w") as log_file:
            process = subprocess.Popen(
                ["java", "-jar", "target/get_jobs-1.0-SNAPSHOT.jar"],
                stdout=log_file,
                stderr=subprocess.STDOUT,
                cwd="/root/zhitoujianli/backend/get_jobs"
            )

        print("✅ 后端服务已启动")
        print("日志文件: /root/zhitoujianli/logs/backend.log")
        print("服务状态: http://localhost:8080/status")
        print("请等待几秒钟后测试注册功能")

        return True

    except Exception as e:
        print(f"❌ 启动失败: {e}")
        return False

if __name__ == "__main__":
    restart_backend()

