// AI服务 - 用于生成智能化打招呼语

interface ResumeData {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: string[];
  education: string[];
  projects: string[];
}

// 简历解析结果类型
export interface ResumeParseResult {
  candidate_name: string;
  name?: string; // 兼容测试和其他代码
  current_title: string;
  years_experience: number;
  education: string;
  company?: string;
  core_strengths?: string[];
  skills?: string[];
  confidence?: {
    name: number;
    skills: number;
    experience: number;
  };
  [key: string]: any;
}

interface GreetingSettings {
  type: 'professional' | 'sincere' | 'concise';
  maxLength: number;
}

interface AnalysisResult {
  matchPoints: string[];
  gaps: string[];
  matchScore: number;
}

// AI提示词模板
const AI_PROMPT_TEMPLATE = `
你是一位资深HR和职业发展顾问，你的任务是帮助我在不同岗位投递时，基于我的简历和目标岗位JD，生成简历分析和个性化投递内容。

【每次操作方法】
根据你搜索到的岗位，查看"目标岗位JD"，你需要完成以下任务：

1. 匹配度分析
   - 我的简历和该岗位的核心匹配点（技能、经验、项目、成就）
   - 哪些地方可能是短板，需要在面试或简历中补充

2. 个性化投递问候语（根据用户选择的风格生成）
   - **专业型**：突出专业能力和岗位匹配度，适合正式企业
   - **真诚型**：语气亲和，表达对公司价值和岗位的认同
   - **简短有力型**：一句话直击核心优势，适合节奏快的投递场景
   - 所有版本均需控制在200字以内，融入岗位JD的关键词，让HR一眼看到我的匹配度与用心

【简历信息】
姓名：{name}
技能：{skills}
经验：{experience}
教育背景：{education}
项目经历：{projects}

【目标岗位JD】
{jdText}

【用户选择的风格】
{greetingType}

请按照以上要求生成分析结果和个性化打招呼语。
`;

// 模拟AI分析服务
export const analyzeResumeAndJD = async (
  resumeData: ResumeData,
  jdText: string,
  settings: GreetingSettings
): Promise<{ analysis: AnalysisResult; greeting: string }> => {

  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 构建提示词
  const prompt = AI_PROMPT_TEMPLATE
    .replace('{name}', resumeData.name)
    .replace('{skills}', resumeData.skills.join('、'))
    .replace('{experience}', resumeData.experience.join('；'))
    .replace('{education}', resumeData.education.join('；'))
    .replace('{projects}', resumeData.projects.join('；'))
    .replace('{jdText}', jdText)
    .replace('{greetingType}', settings.type);

  // 模拟AI分析结果
  const analysis: AnalysisResult = {
    matchPoints: [
      `${resumeData.experience.length}年工作经验与岗位要求高度匹配`,
      `${resumeData.skills.slice(0, 3).join('、')}技能完全符合技术栈要求`,
      '有相关项目经验，理解业务场景'
    ],
    gaps: [
      '部分技能需要进一步验证',
      '行业经验可以更丰富'
    ],
    matchScore: Math.floor(Math.random() * 20) + 75 // 75-95分
  };

  // 根据风格生成打招呼语
  const greetingTemplates = {
    professional: `您好！我是${resumeData.name}，拥有${resumeData.experience.length}年相关工作经验，精通${resumeData.skills.slice(0, 3).join('、')}等技术栈。在${resumeData.projects[0] || '相关项目'}方面有丰富经验，曾负责${resumeData.experience[0] || '核心业务'}的开发和优化。看到贵公司招聘相关岗位，我的技术背景和项目经验与岗位要求高度匹配，希望能有机会为贵公司贡献价值。`,

    sincere: `您好！我对贵公司的相关岗位非常感兴趣。作为一名有${resumeData.experience.length}年经验的工程师，我热爱技术，在${resumeData.skills.slice(0, 2).join('、')}方面有扎实基础，也有${resumeData.projects[0] || '相关项目'}开发经验。我相信我的技能和热情能够为团队带来价值，期待与您进一步交流。`,

    concise: `${resumeData.experience.length}年经验，精通${resumeData.skills.slice(0, 2).join('/')}，有${resumeData.projects[0] || '相关项目'}背景，与岗位要求高度匹配，期待合作机会。`
  };

  const greeting = greetingTemplates[settings.type];

  return { analysis, greeting };
};

// 文件解析服务（模拟）
export const parseResumeFile = async (file: File): Promise<ResumeData> => {
  // 模拟文件解析过程
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 返回模拟数据
  return {
    name: '张三',
    email: 'zhangsan@email.com',
    phone: '138****8888',
    skills: ['React', 'Node.js', 'Python', '机器学习', '数据分析'],
    experience: [
      '3年全栈开发经验',
      '负责过大型电商平台开发',
      '有团队管理经验'
    ],
    education: ['计算机科学与技术 本科'],
    projects: [
      '智能推荐系统',
      '用户行为分析平台',
      '微服务架构重构'
    ]
  };
};

// AI简历服务
export const aiResumeService = {
  /**
   * 上传并解析简历文件
   */
  uploadResume: async (file: File): Promise<ResumeParseResult> => {
    // 这里应该调用实际的API
    // 为了修复编译错误，暂时返回模拟数据
    const mockData: ResumeParseResult = {
      candidate_name: '候选人姓名',
      current_title: '前端工程师',
      years_experience: 3,
      education: '本科',
      company: 'XX科技公司',
      core_strengths: ['React', 'TypeScript', 'Node.js'],
      skills: ['前端开发', 'UI/UX', '性能优化'],
    };

    return new Promise(resolve => {
      setTimeout(() => resolve(mockData), 1000);
    });
  },

  /**
   * 解析简历文本
   */
  parseResume: async (resumeText: string): Promise<ResumeParseResult> => {
    // 这里应该调用实际的API
    // 为了修复编译错误，暂时返回模拟数据
    const mockData: ResumeParseResult = {
      candidate_name: '候选人姓名',
      current_title: '前端工程师',
      years_experience: 3,
      education: '本科',
      company: 'XX科技公司',
      core_strengths: ['React', 'TypeScript', 'Node.js'],
      skills: ['前端开发', 'UI/UX', '性能优化'],
    };

    return new Promise(resolve => {
      setTimeout(() => resolve(mockData), 1000);
    });
  },

  /**
   * 删除简历
   */
  deleteResume: async (): Promise<void> => {
    // 这里应该调用实际的API
    return new Promise(resolve => {
      setTimeout(() => resolve(), 500);
    });
  },

  /**
   * 检查简历是否存在
   */
  checkResume: async (): Promise<{ hasResume: boolean }> => {
    // 这里应该调用实际的API
    return new Promise(resolve => {
      setTimeout(() => resolve({ hasResume: false }), 500);
    });
  },

  /**
   * 加载简历
   */
  loadResume: async (): Promise<ResumeParseResult | null> => {
    // 这里应该调用实际的API
    return new Promise(resolve => {
      setTimeout(() => resolve(null), 500);
    });
  },
};

// AI打招呼语服务
export const aiGreetingService = {
  /**
   * 生成默认打招呼语
   */
  generateDefaultGreeting: async (
    candidate: ResumeParseResult
  ): Promise<string> => {
    // 这里应该调用实际的AI API
    // 为了修复编译错误，暂时返回模拟数据
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(
          `您好！我是${candidate.candidate_name}，目前担任${candidate.current_title}职位，拥有${candidate.years_experience}年工作经验。我的核心技能包括${candidate.core_strengths?.join('、')}，期待与贵公司进一步交流。`
        );
      }, 1000);
    });
  },

  /**
   * 获取已保存的默认打招呼语
   */
  getDefaultGreeting: async (): Promise<string | null> => {
    // 这里应该调用实际的API
    // 为了修复编译错误，暂时返回null
    return new Promise(resolve => {
      setTimeout(() => resolve(null), 500);
    });
  },

  /**
   * 保存默认打招呼语
   */
  saveDefaultGreeting: async (greeting: string): Promise<void> => {
    // 这里应该调用实际的API
    return new Promise(resolve => {
      setTimeout(() => resolve(), 500);
    });
  },

  /**
   * 生成打招呼语（通用方法）
   */
  generateGreeting: async (params: any): Promise<string> => {
    // 这里应该调用实际的AI API
    return new Promise(resolve => {
      setTimeout(() => {
        resolve('生成的打招呼语');
      }, 1000);
    });
  },
};

// 导出类型
export type { ResumeData, GreetingSettings, AnalysisResult };
