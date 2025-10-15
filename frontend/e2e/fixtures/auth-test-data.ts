/**
 * 认证测试数据工厂
 *
 * 提供用户注册、登录和数据隔离测试所需的测试数据
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-14
 */

/**
 * 生成唯一的测试用户
 * 使用时间戳确保每次运行测试时邮箱唯一
 */
export function generateTestUser(prefix = 'testuser') {
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 10000);

  return {
    email: `${prefix}_${timestamp}_${randomId}@test.example.com`,
    password: 'Test123456!',
    username: `${prefix}_${timestamp}`,
  };
}

/**
 * 生成多个测试用户
 */
export function generateTestUsers(count: number) {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push(generateTestUser(`user${i + 1}`));
  }
  return users;
}

/**
 * 测试用户配置数据
 */
export function generateUserConfig(userId: string) {
  return {
    userId,
    boss: {
      debugger: false,
      sayHi: `你好，我是${userId}的专属打招呼语`,
      keywords: ['软件工程师', 'Java开发'],
      cityCode: ['北京'],
      experience: ['5-10年'],
      jobType: '全职',
      salary: '20K-30K',
      degree: ['本科'],
      scale: ['100-500人'],
      stage: ['C轮'],
      expectedSalary: [20, 30],
      waitTime: 5,
      filterDeadHR: true,
      enableAI: true,
      sendImgResume: false,
      deadStatus: ['2周内活跃', '本月活跃'],
    },
    ai: {
      introduce: `我是${userId}，这是我的AI自我介绍`,
      prompt: `用户${userId}的AI提示词`,
    },
    bot: {
      is_send: false,
    },
  };
}

/**
 * 测试简历数据
 */
export function generateUserResume(username: string) {
  return `${username}
高级软件工程师 | 8年经验

联系方式：
手机：13800138000
邮箱：${username}@example.com

工作经历：
2018-至今 | 某科技公司 | 高级软件工程师
- 负责核心业务系统开发
- 带领团队完成多个重要项目
- 优化系统性能，提升用户体验

核心技能：
Java、Spring Boot、React、MySQL、Redis

核心优势：
- 8年软件开发经验
- 精通全栈开发
- 良好的团队协作能力

教育背景：
2012-2016 | 某大学 | 计算机科学与技术 | 本科`;
}

/**
 * 测试AI配置数据
 */
export function generateAiConfig(userId: string) {
  return {
    userId,
    BASE_URL: 'http://localhost:11434',
    API_KEY: `ai_key_${userId}`,
    MODEL: 'qwen2:7b',
    HOOK_URL: `https://webhook.example.com/${userId}`,
    BARK_URL: `https://bark.example.com/${userId}`,
  };
}

/**
 * API端点
 */
export const authApiEndpoints = {
  register: 'http://127.0.0.1:8080/api/auth/register',
  registerTest: 'http://127.0.0.1:8080/api/auth/register-test',
  login: 'http://127.0.0.1:8080/api/auth/login',
  getUserInfo: 'http://127.0.0.1:8080/api/auth/user',
  saveConfig: 'http://127.0.0.1:8080/api/config',
  getConfig: 'http://127.0.0.1:8080/api/config',
  saveAiConfig: 'http://127.0.0.1:8080/api/ai-config',
  getAiConfig: 'http://127.0.0.1:8080/api/ai-config',
};

/**
 * 预定义测试用户（用于固定场景测试）
 */
export const predefinedTestUsers = {
  userA: {
    email: 'test_user_a@test.example.com',
    password: 'TestPassword123!',
    username: 'Test User A',
  },
  userB: {
    email: 'test_user_b@test.example.com',
    password: 'TestPassword123!',
    username: 'Test User B',
  },
  weakPassword: {
    email: 'weak_pass@test.example.com',
    password: '123',
    username: 'Weak Password User',
  },
};

/**
 * 测试配置常量
 */
export const testConfig = {
  // 测试超时时间
  apiTimeout: 10000,

  // Token存储键
  tokenKey: 'auth_token',
  userKey: 'user_info',

  // Cookie域名
  cookieDomain: '127.0.0.1',

  // 最小密码长度
  minPasswordLength: 6,
};






