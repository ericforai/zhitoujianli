// 无包名，直接放在根目录

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
public class MinimalWebApp {
    public static void main(String[] args) {
        SpringApplication.run(MinimalWebApp.class, args);
    }
}

@RestController
class ApiController {
    
    @GetMapping("/api/status")
    public String status() {
        return "{\"status\":\"ok\",\"message\":\"智投简历后台服务运行中\"}";
    }
}
