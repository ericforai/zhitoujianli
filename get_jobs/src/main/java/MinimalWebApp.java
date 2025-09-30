// 无包名，直接放在根目录

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;

@SpringBootApplication
public class MinimalWebApp {
    public static void main(String[] args) {
        SpringApplication.run(MinimalWebApp.class, args);
    }
}

@Controller
class DashboardController {
    
    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("status", "running");
        model.addAttribute("message", "智投简历后台管理系统");
        return "dashboard";
    }
}

@RestController
class ApiController {
    
    @GetMapping("/api/status")
    public String status() {
        return "{\"status\":\"ok\",\"message\":\"智投简历后台服务运行中\"}";
    }
}
