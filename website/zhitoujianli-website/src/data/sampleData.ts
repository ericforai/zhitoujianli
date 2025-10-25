/**
 * JD智能匹配度分析页面示例数据
 * 用于默认展示，提升用户体验和转化率
 */

// 示例简历内容
export const sampleResume = `张伟 | 前端开发工程师
联系方式：zhang.wei@email.com | 138****8888

工作经历：
• 2020.06 - 至今 | 某互联网公司 | 高级前端工程师
  - 负责电商平台前端开发，使用React技术栈
  - 主导移动端H5页面性能优化，提升加载速度40%
  - 参与组件库建设，提高团队开发效率

• 2018.07 - 2020.05 | 某科技公司 | 前端工程师
  - 参与后台管理系统开发，使用Vue.js框架
  - 负责数据可视化模块，使用ECharts/D3.js

技能清单：
React, TypeScript, Node.js, MongoDB, Webpack, Git
熟悉RESTful API设计，了解微服务架构

教育背景：
计算机科学与技术 本科 | 某大学 | 2014-2018

项目经验：
• 电商平台前端重构（React + Redux）
• 移动端App开发（React Native）
• 数据可视化平台（Vue.js + ECharts）`;

// 示例JD内容
export const sampleJD = `高级前端开发工程师

岗位职责：
1. 负责公司Web/移动端产品的前端开发
2. 参与产品需求评审，提供技术方案
3. 优化前端性能，提升用户体验
4. 参与前端技术选型和架构设计
5. 指导初级工程师，促进团队成长

任职要求：
1. 本科及以上学历，计算机相关专业
2. 3年以上前端开发经验，熟练掌握React/Vue等主流框架
3. 精通JavaScript/TypeScript，深入理解ES6+特性
4. 熟悉前端工程化工具（Webpack/Vite等）
5. 有移动端开发经验者优先
6. 了解Node.js、熟悉全栈开发者优先
7. 有大型项目经验，具备良好的代码规范意识
8. 良好的团队协作和沟通能力

加分项：
• 有开源项目贡献经验
• 熟悉Docker/Kubernetes等容器技术
• 了解微服务架构
• 有技术博客或分享经验`;

// 示例分析结果
export const sampleAnalysis = {
  overallScore: 82,
  overallLevel: '高度匹配',
  overallDescription: '基于技能、经验、教育背景和项目经历的综合评分',
  skillMatch: {
    score: 85,
    matchedSkills: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
    missingSkills: ['Vue.js', 'Docker', 'Kubernetes'],
  },
  experienceMatch: {
    score: 78,
    matchedExperience: ['3年前端开发经验', '电商项目经验', '团队协作经验'],
    gaps: ['大厂工作经验', '管理经验'],
  },
  educationMatch: {
    score: 90,
    matchedEducation: ['计算机相关专业', '本科学历'],
    suggestions: ['可以考虑相关认证证书'],
  },
  projectMatch: {
    score: 80,
    matchedProjects: ['电商平台开发', '移动端应用', '后台管理系统'],
    recommendations: ['增加开源项目贡献', '展示更多技术深度项目'],
  },
};

// 分析结果类型定义
export interface AnalysisResult {
  overallScore: number;
  overallLevel: string;
  overallDescription: string;
  skillMatch: {
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
  };
  experienceMatch: {
    score: number;
    matchedExperience: string[];
    gaps: string[];
  };
  educationMatch: {
    score: number;
    matchedBackground: string[];
    suggestions: string[];
  };
  projectMatch: {
    score: number;
    matchedProjects: string[];
    suggestions: string[];
  };
}
