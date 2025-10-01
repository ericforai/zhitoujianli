# 三层访问权限控制系统实现指南

## 快速开始

### 环境要求

- Node.js 18+
- Java 17+
- Maven 3.8+
- 现代浏览器支持

### 1. 克隆和安装

```bash
# 克隆项目
cd /Users/user/autoresume

# 安装前端依赖
npm install

# 安装后端依赖
cd get_jobs
mvn clean install
```

### 2. 配置Authing认证服务

**创建Authing应用**
1. 访问 [Authing控制台](https://console.authing.cn/)
2. 创建新应用，选择"单页应用"类型
3. 记录以下信息：
   - 应用ID (App ID)
   - 应用密钥 (App Secret)  
   - 用户池ID (User Pool ID)
   - 应用域名

**配置回调地址**
```
http://localhost:3000/callback
http://localhost:3000/
```

### 3. 环境变量配置

**前端配置 (.env)**
```bash
# 在 /Users/user/autoresume/.env
REACT_APP_AUTHING_DOMAIN=https://your-domain.authing.cn
REACT_APP_AUTHING_APP_ID=your_app_id
REACT_APP_API_BASE_URL=http://localhost:8080
```

**后端配置 (application.properties)**
```properties
# 在 /Users/user/autoresume/get_jobs/src/main/resources/application.properties
authing.domain=https://your-domain.authing.cn
authing.app.id=your_app_id
authing.app.secret=your_app_secret
authing.user.pool.id=your_user_pool_id

# CORS配置
cors.allowed.origins=http://localhost:3000,http://localhost:4321
cors.allowed.methods=GET,POST,PUT,DELETE,OPTIONS
cors.allowed.headers=Authorization,Content-Type,X-Requested-With

# 数据存储路径
user.data.path=./user_data
```

### 4. 启动服务

**启动后端服务**
```bash
cd /Users/user/autoresume/get_jobs
mvn spring-boot:run
# 服务启动在 http://localhost:8080
```

**启动前端服务**
```bash
cd /Users/user/autoresume
npm start
# 服务启动在 http://localhost:3000
```

## 核心实现详解

### 1. 前端实现

#### 认证状态管理 (AuthContext)

```javascript
// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthenticationClient } from '@authing/web';

const AuthContext = createContext();

// Authing客户端初始化
const authClient = new AuthenticationClient({
  domain: process.env.REACT_APP_AUTHING_DOMAIN,
  appId: process.env.REACT_APP_AUTHING_APP_ID,
  redirectUri: `${window.location.origin}/callback`,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  // 检查登录状态
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (token) {
        // 验证Token有效性
        const userInfo = await authClient.getCurrentUser(token);
        if (userInfo) {
          setUser(userInfo);
          // 设置Cookie以支持跨域
          document.cookie = `authToken=${token}; path=/; domain=localhost`;
        } else {
          logout();
        }
      }
    } catch (error) {
      console.error('认证状态检查失败:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const result = await authClient.signInByEmailPassword(email, password);
      if (result.access_token) {
        const newToken = result.access_token;
        setToken(newToken);
        setUser(result.user);
        
        // 双重存储：localStorage + Cookie
        localStorage.setItem('authToken', newToken);
        document.cookie = `authToken=${newToken}; path=/; domain=localhost`;
        
        return { success: true, user: result.user };
      }
    } catch (error) {
      console.error('登录失败:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    // 清除Cookie
    document.cookie = 'authToken=; path=/; domain=localhost; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user && !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

#### 路由守卫组件

```javascript
// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>加载中...</div>;
  }

  if (!isAuthenticated) {
    // 保存尝试访问的路径，登录后重定向
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
```

#### 后台管理访问组件

```javascript
// src/components/AdminAccess.js
import React from 'react';
import { useAuth } from '../context/AuthContext';

const AdminAccess = () => {
  const { isAuthenticated, token } = useAuth();

  const handleAdminAccess = () => {
    if (isAuthenticated && token) {
      // 方式1: 打开新窗口并传递Token
      const adminWindow = window.open('http://localhost:8080', '_blank');
      
      // 方式2: 通过PostMessage传递Token (更安全)
      setTimeout(() => {
        adminWindow.postMessage({
          type: 'AUTH_TOKEN',
          token: token
        }, 'http://localhost:8080');
      }, 1000);
    } else {
      // 未登录，跳转到登录页面
      window.location.href = '/login';
    }
  };

  return (
    <button onClick={handleAdminAccess} className="admin-btn">
      后台管理
    </button>
  );
};

export default AdminAccess;
```

### 2. 后端实现

#### JWT认证过滤器

```java
// src/main/java/security/JwtAuthenticationFilter.java
package security;

import cn.authing.sdk.java.client.AuthenticationClient;
import cn.authing.sdk.java.dto.IntrospectTokenRespDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    
    @Autowired
    private AuthenticationClient authenticationClient;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        try {
            String token = extractToken(request);
            
            if (token != null) {
                Map<String, Object> userInfo = validateTokenWithAuthing(token);
                
                if (userInfo != null) {
                    // 创建认证对象
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(userInfo, null, null);
                    
                    // 设置到Security上下文
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    
                    logger.debug("用户认证成功: {}", userInfo.get("email"));
                } else {
                    logger.warn("Token验证失败: {}", token);
                }
            }
        } catch (Exception e) {
            logger.error("JWT认证过程中发生错误", e);
        }
        
        filterChain.doFilter(request, response);
    }
    
    /**
     * 从请求中提取Token (支持Header和Cookie双重方式)
     */
    private String extractToken(HttpServletRequest request) {
        // 1. 优先从Authorization Header提取
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        
        // 2. 从Cookie中提取作为备选方案
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("authToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        
        return null;
    }
    
    /**
     * 使用Authing SDK验证Token
     */
    private Map<String, Object> validateTokenWithAuthing(String token) {
        try {
            // 使用Authing V3 SDK验证Token
            Object result = authenticationClient.introspectToken(token);
            
            if (result instanceof IntrospectTokenRespDto) {
                IntrospectTokenRespDto tokenResp = (IntrospectTokenRespDto) result;
                
                // 检查Token是否有效
                if (tokenResp.getActive() != null && tokenResp.getActive()) {
                    Map<String, Object> userInfo = new HashMap<>();
                    userInfo.put("userId", tokenResp.getSub() != null ? tokenResp.getSub() : "unknown_user");
                    userInfo.put("email", tokenResp.getEmail());
                    userInfo.put("username", tokenResp.getName() != null ? tokenResp.getName() : tokenResp.getEmail());
                    userInfo.put("loginTime", System.currentTimeMillis());
                    
                    logger.info("Authing V3 Token验证成功: 用户ID={}, 邮箱={}", 
                              userInfo.get("userId"), userInfo.get("email"));
                    
                    return userInfo;
                }
            }
        } catch (Exception e) {
            logger.error("Authing Token验证失败", e);
        }
        
        return null;
    }
    
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        // 跳过不需要认证的路径
        return path.startsWith("/api/public/") || 
               path.equals("/") || 
               path.startsWith("/static/") ||
               path.startsWith("/css/") ||
               path.startsWith("/js/");
    }
}
```

#### 用户上下文工具类

```java
// src/main/java/util/UserContextUtil.java
package util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

/**
 * 用户上下文工具类
 * 提供统一的用户信息获取接口，支持用户级数据隔离
 */
public class UserContextUtil {
    
    private static final Logger logger = LoggerFactory.getLogger(UserContextUtil.class);
    
    /**
     * 获取当前登录用户的用户ID
     * @return 用户ID，如果未登录返回null
     */
    public static String getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> userInfo = (Map<String, Object>) authentication.getPrincipal();
                String userId = (String) userInfo.get("userId");
                logger.debug("获取当前用户ID: {}", userId);
                return userId;
            }
        } catch (Exception e) {
            logger.error("获取当前用户ID失败", e);
        }
        return null;
    }
    
    /**
     * 获取当前登录用户的邮箱
     * @return 用户邮箱，如果未登录返回null
     */
    public static String getCurrentUserEmail() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> userInfo = (Map<String, Object>) authentication.getPrincipal();
                return (String) userInfo.get("email");
            }
        } catch (Exception e) {
            logger.error("获取当前用户邮箱失败", e);
        }
        return null;
    }
    
    /**
     * 获取当前登录用户的用户名
     * @return 用户名，如果未登录返回null
     */
    public static String getCurrentUsername() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> userInfo = (Map<String, Object>) authentication.getPrincipal();
                return (String) userInfo.get("username");
            }
        } catch (Exception e) {
            logger.error("获取当前用户名失败", e);
        }
        return null;
    }
    
    /**
     * 获取完整的用户信息
     * @return 用户信息Map，如果未登录返回null
     */
    @SuppressWarnings("unchecked")
    public static Map<String, Object> getCurrentUserInfo() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof Map) {
                return (Map<String, Object>) authentication.getPrincipal();
            }
        } catch (Exception e) {
            logger.error("获取当前用户信息失败", e);
        }
        return null;
    }
    
    /**
     * 检查当前是否有已认证的用户
     * @return true如果已认证，false如果未认证
     */
    public static boolean isAuthenticated() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            return authentication != null && 
                   authentication.isAuthenticated() && 
                   authentication.getPrincipal() instanceof Map;
        } catch (Exception e) {
            logger.error("检查认证状态失败", e);
            return false;
        }
    }
    
    /**
     * 获取用户数据存储路径
     * @return 用户专属数据目录路径
     */
    public static String getUserDataPath() {
        String userId = getCurrentUserId();
        if (userId != null) {
            return "user_data/" + userId + "/";
        }
        return null;
    }
}
```

#### 用户数据服务

```java
// src/main/java/service/UserDataService.java
package service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import util.UserContextUtil;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

/**
 * 用户数据服务
 * 提供用户级数据存储和管理功能，确保数据隔离
 */
@Service
public class UserDataService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserDataService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // 数据存储根目录
    private static final String DATA_ROOT = "user_data";
    
    /**
     * 保存用户配置
     * @param config 配置数据
     * @return 保存结果
     */
    public Map<String, Object> saveUserConfig(Map<String, Object> config) {
        String userId = UserContextUtil.getCurrentUserId();
        if (userId == null) {
            return createErrorResponse("用户未登录");
        }
        
        try {
            String configPath = getUserFilePath(userId, "config.json");
            ensureDirectoryExists(getUserDirectoryPath(userId));
            
            // 添加元数据
            config.put("userId", userId);
            config.put("lastModified", System.currentTimeMillis());
            
            // 保存到文件
            objectMapper.writeValue(new File(configPath), config);
            
            logger.info("用户 {} 配置保存成功: {}", userId, config.keySet());
            return createSuccessResponse("配置保存成功", config);
            
        } catch (Exception e) {
            logger.error("保存用户配置失败", e);
            return createErrorResponse("保存配置失败: " + e.getMessage());
        }
    }
    
    /**
     * 加载用户配置
     * @return 用户配置数据
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> loadUserConfig() {
        String userId = UserContextUtil.getCurrentUserId();
        if (userId == null) {
            return createErrorResponse("用户未登录");
        }
        
        try {
            String configPath = getUserFilePath(userId, "config.json");
            File configFile = new File(configPath);
            
            if (configFile.exists()) {
                Map<String, Object> config = objectMapper.readValue(configFile, Map.class);
                logger.info("用户 {} 配置加载成功", userId);
                return createSuccessResponse("配置加载成功", config);
            } else {
                // 返回默认配置
                Map<String, Object> defaultConfig = getDefaultConfig();
                logger.info("用户 {} 使用默认配置", userId);
                return createSuccessResponse("使用默认配置", defaultConfig);
            }
            
        } catch (Exception e) {
            logger.error("加载用户配置失败", e);
            return createErrorResponse("加载配置失败: " + e.getMessage());
        }
    }
    
    /**
     * 保存用户简历
     * @param resume 简历数据
     * @return 保存结果
     */
    public Map<String, Object> saveUserResume(Map<String, Object> resume) {
        String userId = UserContextUtil.getCurrentUserId();
        if (userId == null) {
            return createErrorResponse("用户未登录");
        }
        
        try {
            String resumePath = getUserFilePath(userId, "resume.json");
            ensureDirectoryExists(getUserDirectoryPath(userId));
            
            // 添加元数据
            resume.put("userId", userId);
            resume.put("lastModified", System.currentTimeMillis());
            
            // 保存到文件
            objectMapper.writeValue(new File(resumePath), resume);
            
            logger.info("用户 {} 简历保存成功", userId);
            return createSuccessResponse("简历保存成功", resume);
            
        } catch (Exception e) {
            logger.error("保存用户简历失败", e);
            return createErrorResponse("保存简历失败: " + e.getMessage());
        }
    }
    
    /**
     * 加载用户简历
     * @return 用户简历数据
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> loadUserResume() {
        String userId = UserContextUtil.getCurrentUserId();
        if (userId == null) {
            return createErrorResponse("用户未登录");
        }
        
        try {
            String resumePath = getUserFilePath(userId, "resume.json");
            File resumeFile = new File(resumePath);
            
            if (resumeFile.exists()) {
                Map<String, Object> resume = objectMapper.readValue(resumeFile, Map.class);
                logger.info("用户 {} 简历加载成功", userId);
                return createSuccessResponse("简历加载成功", resume);
            } else {
                logger.info("用户 {} 暂无简历数据", userId);
                return createSuccessResponse("暂无简历数据", new HashMap<>());
            }
            
        } catch (Exception e) {
            logger.error("加载用户简历失败", e);
            return createErrorResponse("加载简历失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取用户数据统计
     * @return 数据统计信息
     */
    public Map<String, Object> getUserDataStats() {
        String userId = UserContextUtil.getCurrentUserId();
        if (userId == null) {
            return createErrorResponse("用户未登录");
        }
        
        try {
            String userDir = getUserDirectoryPath(userId);
            File userDirectory = new File(userDir);
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("userId", userId);
            stats.put("userEmail", UserContextUtil.getCurrentUserEmail());
            stats.put("dataDirectory", userDir);
            stats.put("directoryExists", userDirectory.exists());
            
            if (userDirectory.exists()) {
                File[] files = userDirectory.listFiles();
                stats.put("fileCount", files != null ? files.length : 0);
                
                // 检查各种数据文件
                stats.put("hasConfig", new File(getUserFilePath(userId, "config.json")).exists());
                stats.put("hasResume", new File(getUserFilePath(userId, "resume.json")).exists());
                stats.put("hasAiSettings", new File(getUserFilePath(userId, "ai_settings.json")).exists());
            }
            
            logger.info("用户 {} 数据统计获取成功", userId);
            return createSuccessResponse("数据统计获取成功", stats);
            
        } catch (Exception e) {
            logger.error("获取用户数据统计失败", e);
            return createErrorResponse("获取数据统计失败: " + e.getMessage());
        }
    }
    
    // 私有辅助方法
    
    private String getUserDirectoryPath(String userId) {
        return DATA_ROOT + File.separator + userId;
    }
    
    private String getUserFilePath(String userId, String fileName) {
        return getUserDirectoryPath(userId) + File.separator + fileName;
    }
    
    private void ensureDirectoryExists(String dirPath) throws IOException {
        Path path = Paths.get(dirPath);
        if (!Files.exists(path)) {
            Files.createDirectories(path);
            logger.info("创建用户数据目录: {}", dirPath);
        }
    }
    
    private Map<String, Object> createSuccessResponse(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }
    
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }
    
    private Map<String, Object> getDefaultConfig() {
        Map<String, Object> defaultConfig = new HashMap<>();
        defaultConfig.put("aiProvider", "deepseek");
        defaultConfig.put("greetingStyle", "professional");
        defaultConfig.put("resumeFormat", "standard");
        defaultConfig.put("language", "zh-CN");
        return defaultConfig;
    }
}
```

## 测试验证

### 单元测试

```java
// src/test/java/service/UserDataServiceTest.java
@SpringBootTest
class UserDataServiceTest {
    
    @Autowired
    private UserDataService userDataService;
    
    @Test
    @WithMockUser(username = "test@example.com")
    void testSaveAndLoadUserConfig() {
        // 准备测试数据
        Map<String, Object> config = new HashMap<>();
        config.put("aiProvider", "deepseek");
        config.put("greetingStyle", "professional");
        
        // 保存配置
        Map<String, Object> saveResult = userDataService.saveUserConfig(config);
        assertTrue((Boolean) saveResult.get("success"));
        
        // 加载配置
        Map<String, Object> loadResult = userDataService.loadUserConfig();
        assertTrue((Boolean) loadResult.get("success"));
        
        @SuppressWarnings("unchecked")
        Map<String, Object> loadedConfig = (Map<String, Object>) loadResult.get("data");
        assertEquals("deepseek", loadedConfig.get("aiProvider"));
        assertEquals("professional", loadedConfig.get("greetingStyle"));
    }
    
    @Test
    void testUnauthorizedAccess() {
        // 未登录状态下的访问
        Map<String, Object> result = userDataService.loadUserConfig();
        assertFalse((Boolean) result.get("success"));
        assertEquals("用户未登录", result.get("message"));
    }
}
```

### 集成测试

```java
// src/test/java/controller/WebControllerTest.java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestMethodOrder(OrderAnnotation.class)
class WebControllerTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @LocalServerPort
    private int port;
    
    private String baseUrl;
    private String authToken;
    
    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port;
    }
    
    @Test
    @Order(1)
    void testUnauthorizedAccess() {
        // 测试未授权访问
        ResponseEntity<String> response = restTemplate.getForEntity(
            baseUrl + "/api/user/config", String.class);
        
        assertEquals(HttpStatus.FOUND, response.getStatusCode());
        assertTrue(response.getHeaders().getLocation().toString().contains("/login"));
    }
    
    @Test
    @Order(2)  
    void testAuthorizedAccess() {
        // 模拟带Token的请求
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + getValidTestToken());
        
        HttpEntity<String> entity = new HttpEntity<>(headers);
        
        ResponseEntity<String> response = restTemplate.exchange(
            baseUrl + "/api/user/config", HttpMethod.GET, entity, String.class);
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }
    
    private String getValidTestToken() {
        // 返回有效的测试Token
        return "valid_test_token_here";
    }
}
```

## 部署脚本

### 开发环境启动脚本

```bash
#!/bin/bash
# start_dev.sh

echo "启动三层