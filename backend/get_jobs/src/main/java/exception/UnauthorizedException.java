package exception;

/**
 * 未授权异常
 * 当用户未登录或Token无效时抛出
 *
 * @author ZhiTouJianLi Team
 * @since 2025-11-02
 */
public class UnauthorizedException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /**
     * 构造函数
     *
     * @param message 异常消息
     */
    public UnauthorizedException(String message) {
        super(message);
    }

    /**
     * 构造函数
     *
     * @param message 异常消息
     * @param cause   异常原因
     */
    public UnauthorizedException(String message, Throwable cause) {
        super(message, cause);
    }
}

