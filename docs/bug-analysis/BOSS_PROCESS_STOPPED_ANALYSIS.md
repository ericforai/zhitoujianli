# Boss进程停止问题分析报告

## 📋 问题描述

**时间**: 2025-11-25 20:25:24
**现象**: Boss程序在加载岗位列表时突然停止，最后一条日志显示：
```
2025-11-25 20:25:24.067 [main] INFO boss.service.BossJobSearchService - 【市场总监】岗位数量更新: 45个（增加了15个）
```

之后没有任何日志输出，程序停止执行。

## 🔍 根本原因分析

### 1. 服务被手动重启

从systemd日志可以看出：
```
Nov 25 20:25:24 systemd[1]: Stopping zhitoujianli-backend.service
Nov 25 20:25:25 systemd[1]: zhitoujianli-backend.service: Main process exited, code=exited, status=143/n/a
Nov 25 20:25:25 systemd[1]: Stopped zhitoujianli-backend.service
Nov 25 20:25:25 systemd[1]: Starting zhitoujianli-backend.service
```

**关键发现**：
- 20:25:24 - 主服务收到SIGTERM信号，开始停止
- 20:25:24.772 - Spring应用开始关闭（`SpringApplicationShutdownHook`）
- 20:25:25 - 主服务被重新启动

### 2. Boss进程架构问题

**Boss进程是独立Java进程**：
- 通过`BossExecutionService`使用`ProcessBuilder`启动
- 不在主服务进程树中，是独立的JVM进程
- 主服务通过`CompletableFuture`异步管理Boss进程

**问题链**：
1. 主服务收到SIGTERM信号
2. Spring应用开始关闭
3. `BossExecutionService`的`CompletableFuture`被中断
4. Boss进程可能被强制终止（`process.destroyForcibly()`）或成为孤儿进程
5. Boss进程在加载岗位列表时被突然终止，没有机会保存状态或优雅退出

### 3. 缺少优雅关闭机制

**当前代码问题**：
```java
// BossExecutionService.java
finally {
    if (process != null) {
        process.destroyForcibly();  // ❌ 强制终止，没有优雅关闭
    }
}
```

**缺少的功能**：
- ❌ 没有`@PreDestroy`钩子来清理Boss进程
- ❌ 没有监听Spring关闭事件
- ❌ 没有向Boss进程发送优雅关闭信号
- ❌ Boss进程没有监听关闭信号（SIGTERM/SIGINT）

## 🛠️ 解决方案

### 方案1：添加优雅关闭钩子（推荐）

#### 1.1 在BossExecutionService中添加关闭钩子

```java
@Service
public class BossExecutionService {

    // 保存所有运行的Boss进程
    private final Map<String, Process> runningProcesses = new ConcurrentHashMap<>();

    @PreDestroy
    public void cleanup() {
        log.info("BossExecutionService正在关闭，清理所有Boss进程...");
        for (Map.Entry<String, Process> entry : runningProcesses.entrySet()) {
            String userId = entry.getKey();
            Process process = entry.getValue();
            try {
                // 先尝试优雅关闭（发送SIGTERM）
                if (process.isAlive()) {
                    log.info("正在优雅关闭用户{}的Boss进程...", userId);
                    process.destroy();  // 发送SIGTERM

                    // 等待最多10秒
                    boolean finished = process.waitFor(10, TimeUnit.SECONDS);
                    if (!finished) {
                        log.warn("用户{}的Boss进程未在10秒内关闭，强制终止", userId);
                        process.destroyForcibly();
                    } else {
                        log.info("用户{}的Boss进程已优雅关闭", userId);
                    }
                }
            } catch (Exception e) {
                log.error("关闭用户{}的Boss进程失败", userId, e);
                process.destroyForcibly();
            }
        }
        runningProcesses.clear();
    }

    // 在启动Boss进程时保存引用
    public CompletableFuture<Void> executeBossProgram(...) {
        // ...
        process = pb.start();
        runningProcesses.put(userId, process);  // ✅ 保存进程引用
        // ...
    }
}
```

#### 1.2 在Boss类中添加关闭信号监听

```java
public class Boss {
    private static volatile boolean shutdownRequested = false;

    static {
        // 注册JVM关闭钩子
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            log.info("收到JVM关闭信号，开始优雅关闭Boss程序...");
            shutdownRequested = true;
            // 清理资源
            cleanup();
        }));
    }

    private static void cleanup() {
        // 关闭Playwright浏览器
        // 保存当前状态
        // 记录日志
    }

    // 在循环中检查关闭标志
    public void execute() {
        while (!shutdownRequested) {
            // 执行任务
            if (shutdownRequested) {
                log.info("收到关闭请求，停止执行");
                break;
            }
        }
    }
}
```

### 方案2：使用进程组管理（备选）

如果Boss进程需要完全独立运行，可以使用进程组来管理：

```java
// 创建进程组
ProcessBuilder pb = new ProcessBuilder(command);
pb.inheritIO();  // 继承IO
Process process = pb.start();

// 在关闭时终止整个进程组
@PreDestroy
public void cleanup() {
    // 使用kill命令终止进程组
    ProcessBuilder killPb = new ProcessBuilder("kill", "-TERM", "-" + process.pid());
    killPb.start();
}
```

### 方案3：添加健康检查和自动恢复（长期方案）

```java
// 定期检查Boss进程状态
@Scheduled(fixedRate = 60000)  // 每分钟检查一次
public void checkBossProcessHealth() {
    for (Map.Entry<String, Process> entry : runningProcesses.entrySet()) {
        String userId = entry.getKey();
        Process process = entry.getValue();

        if (!process.isAlive()) {
            log.warn("用户{}的Boss进程已停止，退出码: {}", userId, process.exitValue());
            runningProcesses.remove(userId);
            // 可以发送通知或自动重启
        }
    }
}
```

## 📊 影响评估

### 当前影响
- ✅ **数据丢失风险**：Boss进程在加载岗位列表时被终止，可能导致：
  - 已加载的岗位数据丢失
  - 投递状态未保存
  - 日志不完整

- ✅ **用户体验**：用户看到程序突然停止，不知道原因

- ✅ **资源泄漏**：如果Boss进程成为孤儿进程，可能导致：
  - Playwright浏览器进程未关闭
  - 内存泄漏
  - 端口占用

### 改进后的收益
- ✅ 优雅关闭，保存当前状态
- ✅ 清理资源，避免泄漏
- ✅ 更好的用户体验
- ✅ 更可靠的进程管理

## 🚀 实施建议

### 优先级1（立即实施）
1. ✅ 添加`@PreDestroy`钩子到`BossExecutionService`
2. ✅ 保存运行中的Boss进程引用
3. ✅ 在关闭时先尝试优雅关闭（`process.destroy()`），等待10秒后再强制终止

### 优先级2（短期实施）
1. ✅ 在Boss类中添加JVM关闭钩子
2. ✅ 在循环中检查关闭标志
3. ✅ 添加资源清理逻辑

### 优先级3（长期优化）
1. ✅ 添加健康检查机制
2. ✅ 添加进程状态监控
3. ✅ 添加自动恢复机制

## 📝 测试建议

1. **测试优雅关闭**：
   ```bash
   # 启动Boss程序
   # 在加载岗位列表时执行
   systemctl restart zhitoujianli-backend.service
   # 检查Boss进程是否优雅关闭
   ```

2. **测试资源清理**：
   ```bash
   # 检查是否有孤儿进程
   ps aux | grep -E "(playwright|chrome|IsolatedBossRunner)"
   ```

3. **测试状态保存**：
   ```bash
   # 检查日志是否完整
   # 检查是否有状态文件保存
   ```

## 🔗 相关文件

- `/root/zhitoujianli/backend/get_jobs/src/main/java/service/BossExecutionService.java`
- `/root/zhitoujianli/backend/get_jobs/src/main/java/boss/Boss.java`
- `/root/zhitoujianli/backend/get_jobs/src/main/java/boss/IsolatedBossRunner.java`
- `/etc/systemd/system/zhitoujianli-backend.service`

## 📅 时间线

- **2025-11-25 20:25:24** - 问题发生
- **2025-11-25** - 问题分析完成
- **待实施** - 添加优雅关闭机制

