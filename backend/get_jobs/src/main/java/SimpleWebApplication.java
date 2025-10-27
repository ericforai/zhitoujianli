package com.superxiang;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"controller"})
public class SimpleWebApplication {
    
    public SimpleWebApplication() {
        // 显式构造函数，防止 Finalizer 攻击
    }

    public static void main(String[] args) {
        SpringApplication.run(SimpleWebApplication.class, args);
    }
}
