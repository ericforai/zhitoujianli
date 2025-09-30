#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI找工作助手 - 简化Web界面
使用Python Flask提供Web界面，通过API调用Java程序
"""

import os
import json
import yaml
import subprocess
import threading
import time
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_from_directory

app = Flask(__name__)

# 全局变量
current_process = None
is_running = False
current_log_file = None
log_content = []

@app.route('/')
def index():
    """主页"""
    return render_template('index.html')

@app.route('/api/config', methods=['GET'])
def get_config():
    """获取当前配置"""
    try:
        config_path = 'src/main/resources/config.yaml'
        if os.path.exists(config_path):
            with open(config_path, 'r', encoding='utf-8') as f:
                config = yaml.safe_load(f)
            return jsonify({'success': True, 'config': config})
        else:
            return jsonify({'success': False, 'message': '配置文件不存在'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/ai-config', methods=['GET'])
def get_ai_config():
    """获取AI配置"""
    try:
        env_path = '.env'
        if not os.path.exists(env_path):
            # 如果.env不存在，从模板创建
            template_path = 'src/main/resources/.env_template'
            if os.path.exists(template_path):
                with open(template_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                with open(env_path, 'w', encoding='utf-8') as f:
                    f.write(content)
        
        ai_config = {}
        if os.path.exists(env_path):
            with open(env_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        if key in ['BASE_URL', 'API_KEY', 'MODEL', 'HOOK_URL', 'BARK_URL']:
                            ai_config[key] = value
        
        return jsonify({'success': True, 'config': ai_config})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/config', methods=['POST'])
def save_config():
    """保存配置"""
    try:
        config = request.json
        config_path = 'src/main/resources/config.yaml'
        
        with open(config_path, 'w', encoding='utf-8') as f:
            yaml.dump(config, f, default_flow_style=False, allow_unicode=True)
        
        return jsonify({'success': True, 'message': '配置保存成功'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/ai-config', methods=['POST'])
def save_ai_config():
    """保存AI配置"""
    try:
        ai_config = request.json
        
        # 读取现有的.env文件或模板
        env_path = '.env'
        template_path = 'src/main/resources/.env_template'
        
        # 读取模板内容
        env_content = []
        if os.path.exists(template_path):
            with open(template_path, 'r', encoding='utf-8') as f:
                env_content = f.readlines()
        elif os.path.exists(env_path):
            with open(env_path, 'r', encoding='utf-8') as f:
                env_content = f.readlines()
        
        # 更新配置项
        updated_content = []
        updated_keys = set()
        
        for line in env_content:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, _ = line.split('=', 1)
                if key in ai_config:
                    updated_content.append(f"{key}={ai_config[key]}\n")
                    updated_keys.add(key)
                else:
                    updated_content.append(line + '\n')
            else:
                updated_content.append(line + '\n')
        
        # 添加新的配置项
        for key, value in ai_config.items():
            if key not in updated_keys:
                updated_content.append(f"{key}={value}\n")
        
        # 写入文件
        with open(env_path, 'w', encoding='utf-8') as f:
            f.writelines(updated_content)
        
        return jsonify({'success': True, 'message': 'AI配置保存成功'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/start', methods=['POST'])
def start_program():
    """启动程序"""
    global current_process, is_running, current_log_file
    
    if is_running:
        return jsonify({'success': False, 'message': '程序已在运行中'})
    
    try:
        platform = request.json.get('platform', 'boss.Boss')
        
        # 生成日志文件名
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        current_log_file = f'logs/{platform.lower().replace(".", "_")}_{timestamp}.log'
        
        # 确保logs目录存在
        os.makedirs('logs', exist_ok=True)
        
        # 启动Java程序 - 使用完整classpath避免依赖问题
        
        # 获取完整的classpath
        classpath_cmd = ['mvn', 'dependency:build-classpath', '-q', '-Dmdep.outputFile=/dev/stdout']
        try:
            classpath_result = subprocess.run(classpath_cmd, capture_output=True, text=True, cwd=os.getcwd())
            if classpath_result.returncode == 0:
                classpath = classpath_result.stdout.strip() + ':target/classes'
            else:
                # 如果获取classpath失败，回退到Maven方式
                classpath = None
        except:
            classpath = None
        
        if classpath:
            # 使用完整classpath启动
            cmd = ['java', '-cp', classpath, platform]
        else:
            # 回退到Maven方式
            cmd = ['mvn', 'exec:java', f'-Dexec.mainClass={platform}']
        
        current_process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        
        is_running = True
        
        # 启动日志监控线程
        log_thread = threading.Thread(target=monitor_logs)
        log_thread.daemon = True
        log_thread.start()
        
        return jsonify({
            'success': True, 
            'message': '程序启动成功',
            'logFile': current_log_file
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/stop', methods=['POST'])
def stop_program():
    """停止程序"""
    global current_process, is_running
    
    if not is_running:
        return jsonify({'success': False, 'message': '程序未在运行'})
    
    try:
        if current_process:
            current_process.terminate()
            current_process = None
        
        is_running = False
        return jsonify({'success': True, 'message': '程序已停止'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/api/status', methods=['GET'])
def get_status():
    """获取程序状态"""
    global is_running, current_log_file, log_content
    
    delivery_count = 0
    if current_log_file and os.path.exists(current_log_file):
        try:
            with open(current_log_file, 'r', encoding='utf-8') as f:
                content = f.read()
                delivery_count = content.count('投递完成')
        except:
            pass
    
    return jsonify({
        'isRunning': is_running,
        'logFile': current_log_file,
        'deliveryCount': delivery_count,
        'recentLogs': log_content[-50:]  # 最近50条日志
    })

@app.route('/api/logs', methods=['GET'])
def get_logs():
    """获取日志"""
    global current_log_file, log_content
    
    lines = request.args.get('lines', 50, type=int)
    
    if not current_log_file or not os.path.exists(current_log_file):
        return jsonify({'success': False, 'message': '日志文件不存在'})
    
    try:
        with open(current_log_file, 'r', encoding='utf-8') as f:
            all_logs = f.readlines()
            recent_logs = all_logs[-lines:] if len(all_logs) > lines else all_logs
        
        return jsonify({
            'success': True,
            'logs': [log.strip() for log in recent_logs]
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

def monitor_logs():
    """监控日志输出"""
    global current_process, log_content, current_log_file
    
    if not current_process:
        return
    
    try:
        while current_process.poll() is None:
            line = current_process.stdout.readline()
            if line:
                line = line.strip()
                log_content.append(line)
                
                # 同时写入日志文件
                if current_log_file:
                    with open(current_log_file, 'a', encoding='utf-8') as f:
                        f.write(line + '\n')
                
                # 保持日志内容不超过1000行
                if len(log_content) > 1000:
                    log_content = log_content[-500:]
            
            time.sleep(0.1)
    except Exception as e:
        print(f"日志监控错误: {e}")
    finally:
        global is_running
        is_running = False

if __name__ == '__main__':
    print("🚀 启动AI找工作助手Web界面...")
    print("📱 访问地址: http://localhost:8080")
    print("⏹️  按 Ctrl+C 停止服务")
    print("")
    
    app.run(host='0.0.0.0', port=8080, debug=True)
