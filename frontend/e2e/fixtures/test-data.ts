/**
 * E2E测试数据
 *
 * @author ZhiTouJianLi Team
 * @since 2025-10-11
 */

export const testResumes = {
  valid: {
    text: `张三
高级Java开发工程师 | 8年经验

联系方式：
手机：13800138000
邮箱：zhangsan@example.com

工作经历：
2018-至今 | 阿里巴巴 | 高级Java开发工程师
- 负责电商平台核心交易系统开发，日均订单量500万+
- 优化系统架构，将订单处理性能提升3倍
- 带领5人团队完成微服务改造项目

核心技能：
Java、Spring Boot、Spring Cloud、微服务架构、分布式系统、MySQL、Redis

核心优势：
- 8年Java开发经验，擅长高并发系统设计
- 丰富的微服务架构和分布式系统实践经验
- 具备大型互联网公司核心业务开发经验

教育背景：
2012-2016 | 浙江大学 | 计算机科学与技术 | 本科`,
  },

  short: {
    text: `李四
产品经理 | 3年经验

技能：产品设计、需求分析、数据分析
教育：北京大学 本科`,
  },

  marketing: {
    text: `王五
市场营销经理 | 6年经验

专业技能：
- 市场策略规划
- 品牌推广
- 数据分析
- 团队管理

工作经历：
2018-至今 | 腾讯 | 市场营销经理
负责产品营销推广，带来用户增长300%

教育背景：
复旦大学 市场营销 硕士`,
  },

  withSpecialChars: {
    text: `赵六😀
UI/UX设计师™ | 5年®

技能：Figma©、Sketch、Adobe XD
邮箱：test<>&@example.com

工作经历：
负责"产品"设计 & 用户体验优化`,
  },

  veryLong: {
    text: '这是一段非常长的简历内容。'.repeat(1000),
  },

  empty: {
    text: '',
  },

  whitespace: {
    text: '   \n\t\r   ',
  },
};

export const testUsers = {
  validUser: {
    username: 'test_user@example.com',
    password: 'Test123456!',
  },

  invalidUser: {
    username: 'invalid@example.com',
    password: 'wrong_password',
  },
};

export const expectedResumeFields = [
  'name',
  'current_title',
  'years_experience',
  'skills',
  'core_strengths',
  'education',
];

export const apiEndpoints = {
  parse: '/api/candidate-resume/parse',
  upload: '/api/candidate-resume/upload',
  check: '/api/candidate-resume/check',
  load: '/api/candidate-resume/load',
  delete: '/api/candidate-resume/delete',
  generateGreeting: '/api/candidate-resume/generate-default-greeting',
  saveGreeting: '/api/candidate-resume/save-default-greeting',
};
