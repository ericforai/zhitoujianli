package controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.view.RedirectView;
import lombok.extern.slf4j.Slf4j;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;

/**
 * Token处理控制器
 * 处理从前端传递过来的JWT Token
 * 
 * @author ZhiTouJianLi Team
 * @since 2025-10-01
 */
@Slf4j
@Controller
public class TokenController {

    /**
     * 处理带token的后台访问
     * 从URL参数中获取token，设置到Cookie中，然后重定向到管理页面
     */
    @GetMapping("/token")
    public String handleTokenAndRedirect(
            @RequestParam(value = "token", required = false) String token,
            HttpServletResponse response) {
        
        if (token != null && !token.isEmpty()) {
            log.info("🔑 收到前端传递的Token，长度: {}", token.length());
            
            // 将token设置到Cookie中，供后续请求使用
            Cookie tokenCookie = new Cookie("authToken", token);
            tokenCookie.setPath("/");
            tokenCookie.setMaxAge(24 * 60 * 60); // 24小时
            tokenCookie.setHttpOnly(false); // 允许JavaScript访问，以便同步到localStorage
            response.addCookie(tokenCookie);
            
            log.info("✅ Token已设置到Cookie中");
        }
        
        // 返回管理页面
        return "index";
    }
}