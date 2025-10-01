package controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import service.AdminService;

/**
 * 管理员页面控制器
 * 提供管理员功能页面的访问
 * 
 * @author ZhiTouJianLi Team
 * @since 2025-10-01
 */
@Slf4j
@Controller
@RequestMapping("/admin-page")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class AdminPageController {
    
    @Autowired
    private AdminService adminService;
    
    /**
     * 管理员主页面
     */
    @GetMapping("")
    public String adminPage(Model model) {
        try {
            log.info("🎯 访问管理员页面");
            
            // 检查预设的超级管理员状态
            String testUserId = "68dba0e3d9c27ebb0d93aa42";
            boolean isAdmin = adminService.isAdmin(testUserId);
            
            model.addAttribute("isAdmin", isAdmin);
            model.addAttribute("adminUserId", testUserId);
            model.addAttribute("pageTitle", "智投简历 - 管理员控制台");
            
            if (isAdmin) {
                // 添加管理员信息
                var adminUser = adminService.getAdminUser(testUserId);
                model.addAttribute("adminInfo", adminUser);
                model.addAttribute("permissionCount", adminUser != null ? adminUser.getPermissions().size() : 0);
            }
            
            return "admin-dashboard";
            
        } catch (Exception e) {
            log.error("❌ 访问管理员页面异常", e);
            model.addAttribute("error", "系统错误：" + e.getMessage());
            return "admin-error";
        }
    }
    
    /**
     * 管理员测试页面
     */
    @GetMapping("/test")
    public String adminTestPage(Model model) {
        try {
            log.info("🔍 访问管理员测试页面");
            
            String testUserId = "68dba0e3d9c27ebb0d93aa42";
            boolean isAdmin = adminService.isAdmin(testUserId);
            var adminUser = adminService.getAdminUser(testUserId);
            
            model.addAttribute("testUserId", testUserId);
            model.addAttribute("isAdmin", isAdmin);
            model.addAttribute("adminUser", adminUser);
            model.addAttribute("pageTitle", "管理员功能测试");
            
            return "admin-test";
            
        } catch (Exception e) {
            log.error("❌ 访问管理员测试页面异常", e);
            model.addAttribute("error", "系统错误：" + e.getMessage());
            return "admin-error";
        }
    }
}