/**
 * Cursor规则检查脚本
 * 确保每次对话都遵循项目规范
 */

// 规则检查清单
const RULES_CHECKLIST = {
  // 代码生成规则
  codeGeneration: [
    "完整的TypeScript类型定义",
    "错误处理和异常捕获",
    "安全性考虑（输入验证、XSS防护等）",
    "性能优化建议",
    "中文注释说明",
    "符合项目规范的代码风格"
  ],

  // 代码审查规则
  codeReview: [
    "类型安全性检查",
    "安全性漏洞检查",
    "性能问题检查",
    "代码规范符合性检查",
    "测试覆盖检查",
    "文档完整性检查"
  ],

  // 回答规则
  responseRules: [
    "使用中文回答",
    "提供具体可执行的代码",
    "解释设计决策的原因",
    "考虑项目的具体需求",
    "提供最佳实践建议"
  ]
};

// 项目技术栈
const PROJECT_TECH_STACK = {
  frontend: "React 18 + TypeScript + Tailwind CSS + Axios",
  backend: "Spring Boot 3 + Spring Security + JWT + Maven",
  ai: "DeepSeek API",
  auth: "Authing",
  database: "MySQL",
  deployment: "Docker + Nginx"
};

// 规则验证函数
function validateRules(interaction) {
  const warnings = [];
  const errors = [];

  // 检查是否使用了中文
  if (!interaction.language || interaction.language !== 'zh') {
    warnings.push("建议使用中文进行交流");
  }

  // 检查是否考虑了安全性
  if (!interaction.securityConsidered) {
    errors.push("必须考虑安全性因素");
  }

  // 检查是否包含错误处理
  if (!interaction.errorHandling) {
    errors.push("必须包含错误处理");
  }

  // 检查是否使用了正确的技术栈
  if (!interaction.techStackMatch) {
    warnings.push("请确保使用项目的技术栈");
  }

  return { warnings, errors };
}

// 规则提醒函数
function generateRuleReminder() {
  return `
🚨 CURSOR规则提醒 🚨

请确保每次对话都遵循以下规范：

📋 代码生成时必须包含：
${RULES_CHECKLIST.codeGeneration.map(rule => `✓ ${rule}`).join('\n')}

🔍 代码审查时必须检查：
${RULES_CHECKLIST.codeReview.map(rule => `✓ ${rule}`).join('\n')}

💬 回答问题时必须：
${RULES_CHECKLIST.responseRules.map(rule => `✓ ${rule}`).join('\n')}

🛠️ 项目技术栈：
- 前端：${PROJECT_TECH_STACK.frontend}
- 后端：${PROJECT_TECH_STACK.backend}
- AI服务：${PROJECT_TECH_STACK.ai}
- 认证：${PROJECT_TECH_STACK.auth}
- 数据库：${PROJECT_TECH_STACK.database}
- 部署：${PROJECT_TECH_STACK.deployment}

⚠️ 重要：所有代码必须可以直接在项目中使用！
`;
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    RULES_CHECKLIST,
    PROJECT_TECH_STACK,
    validateRules,
    generateRuleReminder
  };
}
