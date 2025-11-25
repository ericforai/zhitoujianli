package boss;

/**
 * 验证码要求异常
 * 当Boss直聘要求验证码时抛出此异常，用于停止整个投递任务
 */
public final class VerificationCodeRequiredException extends RuntimeException {

    private final String jobName;
    private final String reason;

    /**
     * 构造函数
     * @param jobName 当前投递的岗位名称
     * @param reason 验证码要求的原因
     */
    public VerificationCodeRequiredException(final String jobName, final String reason) {
        super(String.format("验证码验证：Boss直聘要求人工验证。岗位: %s, 原因: %s", jobName, reason));
        this.jobName = jobName;
        this.reason = reason;
    }

    /**
     * 获取岗位名称
     * @return 岗位名称
     */
    public String getJobName() {
        return jobName;
    }

    /**
     * 获取验证码要求的原因
     * @return 原因
     */
    public String getReason() {
        return reason;
    }
}

