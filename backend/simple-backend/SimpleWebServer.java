import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;

public class SimpleWebServer {
    
    public static void main(String[] args) throws IOException {
        // 创建HTTP服务器，监听8080端口
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        
        // 设置首页路由
        server.createContext("/", new MainHandler());
        
        // 设置API路由
        server.createContext("/api/status", new StatusHandler());
        
        // 启动服务器
        server.setExecutor(null);
        server.start();
        
        System.out.println("智投简历后台管理系统已启动");
        System.out.println("访问地址: http://localhost:8080");
        System.out.println("按 Ctrl+C 停止服务器");
    }
    
    // 首页处理器
    static class MainHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String response = getHtmlResponse();
            exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
            exchange.sendResponseHeaders(200, response.getBytes("UTF-8").length);
            OutputStream os = exchange.getResponseBody();
            os.write(response.getBytes("UTF-8"));
            os.close();
        }
    }
    
    // API状态处理器
    static class StatusHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String response = "{\"status\":\"ok\",\"message\":\"智投简历后台服务运行中\",\"port\":8080}";
            exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
            exchange.sendResponseHeaders(200, response.getBytes("UTF-8").length);
            OutputStream os = exchange.getResponseBody();
            os.write(response.getBytes("UTF-8"));
            os.close();
        }
    }
    
    // 生成HTML响应
    private static String getHtmlResponse() {
        return """
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>智投简历 - 后台管理</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 600px;
            width: 90%;
        }
        .logo {
            font-size: 2.5rem;
            font-weight: bold;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 1rem;
        }
        .status {
            display: inline-block;
            padding: 0.5rem 1rem;
            background: #10b981;
            color: white;
            border-radius: 20px;
            font-size: 0.9rem;
            margin-bottom: 2rem;
        }
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 2rem 0;
        }
        .feature-card {
            padding: 1rem;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .feature-title {
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 0.5rem;
        }
        .feature-desc {
            color: #6b7280;
            font-size: 0.9rem;
        }
        .api-section {
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid #e5e7eb;
        }
        .api-link {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 0.5rem;
            transition: background-color 0.3s;
        }
        .api-link:hover {
            background: #5a67d8;
        }
        .note {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 1rem;
            margin-top: 2rem;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">智投简历</div>
        <div class="status">✓ 系统运行中</div>
        
        <h2>后台管理系统</h2>
        <p style="color: #6b7280; margin: 1rem 0;">AI驱动的智能求职助手</p>
        
        <div class="feature-grid">
            <div class="feature-card">
                <div class="feature-title">智能投递</div>
                <div class="feature-desc">自动搜索匹配岗位并智能投递简历</div>
            </div>
            
            <div class="feature-card">
                <div class="feature-title">AI分析</div>
                <div class="feature-desc">深度分析JD与简历匹配度</div>
            </div>
            
            <div class="feature-card">
                <div class="feature-title">个性化沟通</div>
                <div class="feature-desc">生成个性化打招呼语</div>
            </div>
            
            <div class="feature-card">
                <div class="feature-title">多平台支持</div>
                <div class="feature-desc">支持Boss直聘、拉勾等平台</div>
            </div>
        </div>
        
        <div class="api-section">
            <h3 style="margin-bottom: 1rem;">API 接口</h3>
            <a href="/api/status" class="api-link" target="_blank">系统状态</a>
            <button class="api-link" onclick="alert('配置管理功能开发中...')">配置管理</button>
        </div>
        
        <div class="note">
            <strong>注意：</strong>这是临时管理界面。完整功能需要解决Selenium依赖问题后才能使用。
        </div>
        
        <div style="margin-top: 2rem; color: #9ca3af; font-size: 0.8rem;">
            <p>© 2024 智投简历 - 让求职更智能</p>
            <p>服务端口: 8080 | 时间: """ + new java.util.Date() + """
</p>
        </div>
    </div>
</body>
</html>
""";
    }
}
