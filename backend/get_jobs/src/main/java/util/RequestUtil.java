package util;

import jakarta.servlet.http.HttpServletRequest;

/**
 * HTTP请求工具类
 * 提供获取客户端IP、User-Agent等信息的工具方法
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-11
 */
public class RequestUtil {

    /**
     * 获取客户端真实IP地址
     * 考虑代理、负载均衡等情况
     */
    public static String getClientIp(HttpServletRequest request) {
        if (request == null) {
            return "unknown";
        }

        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && ip.length() != 0 && !"unknown".equalsIgnoreCase(ip)) {
            // 多次反向代理后会有多个IP值，第一个IP才是真实IP
            int index = ip.indexOf(',');
            if (index != -1) {
                return ip.substring(0, index);
            } else {
                return ip;
            }
        }

        ip = request.getHeader("X-Real-IP");
        if (ip != null && ip.length() != 0 && !"unknown".equalsIgnoreCase(ip)) {
            return ip;
        }

        ip = request.getHeader("Proxy-Client-IP");
        if (ip != null && ip.length() != 0 && !"unknown".equalsIgnoreCase(ip)) {
            return ip;
        }

        ip = request.getHeader("WL-Proxy-Client-IP");
        if (ip != null && ip.length() != 0 && !"unknown".equalsIgnoreCase(ip)) {
            return ip;
        }

        ip = request.getHeader("HTTP_CLIENT_IP");
        if (ip != null && ip.length() != 0 && !"unknown".equalsIgnoreCase(ip)) {
            return ip;
        }

        ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        if (ip != null && ip.length() != 0 && !"unknown".equalsIgnoreCase(ip)) {
            return ip;
        }

        // 最后才获取remote address
        ip = request.getRemoteAddr();

        // 本地调试时可能返回IPv6的本地地址
        if ("0:0:0:0:0:0:0:1".equals(ip)) {
            return "127.0.0.1";
        }

        return ip != null ? ip : "unknown";
    }

    /**
     * 获取User-Agent
     */
    public static String getUserAgent(HttpServletRequest request) {
        if (request == null) {
            return "unknown";
        }
        String userAgent = request.getHeader("User-Agent");
        return userAgent != null ? userAgent : "unknown";
    }

    /**
     * 获取请求路径
     */
    public static String getRequestPath(HttpServletRequest request) {
        if (request == null) {
            return "unknown";
        }
        return request.getRequestURI();
    }

    /**
     * 判断是否是移动设备
     */
    public static boolean isMobileDevice(HttpServletRequest request) {
        String userAgent = getUserAgent(request);
        if ("unknown".equals(userAgent)) {
            return false;
        }

        userAgent = userAgent.toLowerCase();
        return userAgent.contains("mobile")
            || userAgent.contains("android")
            || userAgent.contains("iphone")
            || userAgent.contains("ipad")
            || userAgent.contains("windows phone");
    }

    /**
     * 获取浏览器类型
     */
    public static String getBrowserType(HttpServletRequest request) {
        String userAgent = getUserAgent(request);
        if ("unknown".equals(userAgent)) {
            return "Unknown";
        }

        userAgent = userAgent.toLowerCase();
        if (userAgent.contains("edg")) {
            return "Edge";
        } else if (userAgent.contains("chrome")) {
            return "Chrome";
        } else if (userAgent.contains("firefox")) {
            return "Firefox";
        } else if (userAgent.contains("safari")) {
            return "Safari";
        } else if (userAgent.contains("opera")) {
            return "Opera";
        } else if (userAgent.contains("msie") || userAgent.contains("trident")) {
            return "IE";
        }
        return "Other";
    }
}

