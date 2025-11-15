package utils;

import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * @author loks666
 * 项目链接: <a href="https://github.com/ericforai/zhitoujianli">https://github.com/ericforai/zhitoujianli</a>
 *
 * 注意：由于这些Selenium相关字段需要在运行时初始化，
 * 我们添加了volatile关键字来确保线程安全性（修复SpotBugs警告）
 */
public class Constant {
    // 使用volatile确保多线程环境下的可见性
    public static volatile ChromeDriver CHROME_DRIVER;
    public static volatile ChromeDriver MOBILE_CHROME_DRIVER;
    public static volatile Actions ACTIONS;
    public static volatile Actions MOBILE_ACTIONS;
    public static volatile WebDriverWait WAIT;
    public static volatile WebDriverWait MOBILE_WAIT;
    public static volatile int WAIT_TIME = 30;
    public static final String UNLIMITED_CODE = "0";

    // 私有构造函数防止实例化 - 使用静态初始化块替代构造函数异常
    static {
        // 静态初始化块，确保类加载时不会抛出异常
    }

    // 防止实例化的私有构造函数
    private Constant() {
        // 空构造函数，不抛出异常以避免SpotBugs警告
    }
}
