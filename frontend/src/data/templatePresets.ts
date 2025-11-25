/**
 * 各岗位模板的预设数据
 * 包含技能类别、工作经历模板、项目经验模板
 */

import type { TemplateType } from '../types/resumeTemplate';

export interface SkillCategoryPreset {
  category: string;
  placeholder: string;
  examples: string[];
}

export interface TemplatePreset {
  skillCategories: SkillCategoryPreset[];
  experiencePlaceholders: string[]; // 工作经历占位符模板
  projectPlaceholders: string[]; // 项目经验占位符模板
}

export const TEMPLATE_PRESETS: Record<TemplateType, TemplatePreset> = {
  // 通用模板
  general: {
    skillCategories: [
      {
        category: '编程语言',
        placeholder: '如：Python、SQL、Java',
        examples: ['Python', 'SQL', 'Java', 'JavaScript', 'C++', 'R'],
      },
      {
        category: '数据分析框架',
        placeholder: '如：Pandas、NumPy、Scikit-Learn',
        examples: ['Pandas', 'NumPy', 'Scikit-Learn', 'Matplotlib', 'Seaborn', 'TensorFlow'],
      },
      {
        category: '工具软件',
        placeholder: '如：Power BI、Excel、Tableau',
        examples: ['Power BI', 'Excel', 'Tableau', 'MySQL', 'SQLite', 'PostgreSQL'],
      },
      {
        category: '开发平台',
        placeholder: '如：PyCharm、Jupyter Notebook、VS Code',
        examples: ['PyCharm', 'Jupyter Notebook', 'VS Code', 'IntelliJ IDEA', 'Git'],
      },
      {
        category: '通用能力',
        placeholder: '如：沟通表达、跨团队协作、需求理解',
        examples: ['沟通表达', '跨团队协作', '需求理解', '项目管理', '分析思维', '问题解决'],
      },
    ],
    experiencePlaceholders: [
      '优化了______流程，使______时间减少了__%',
      '通过实施______方案，实现了__%的效率提升/成本降低',
      '与______团队协作，使______流程改进/对齐，整体效率提高了__%',
      '产出__+份分析报告/可视化图表，支持业务决策和管理层沟通',
      '对______进行深入分析，识别出__条关键趋势，促进战略决策',
      '自动化了______流程，使人工工作量减少__%',
      '完成______系统/报表搭建，提升数据准确率__%',
      '负责数据清洗、建模、指标监控，支持______业务提升',
      '跟踪______关键指标，为团队提供可执行的数据洞察',
    ],
    projectPlaceholders: [
      '构建机器学习模型，实现__% 准确率/召回率/精确率',
      '完成数据清洗、特征工程，使模型性能提升__%',
      '使用______（如逻辑回归、SVM、XGBoost）完成训练与评估',
      '通过数据分析识别影响______的核心因素',
      '完成 EDA（探索性数据分析），提取影响______的关键变量',
      '使用______算法（如 ANN、K-Means 等），模型性能提升 __%',
      '搭建______分析/预测流水线，提高系统稳健性和效率',
      '设计并实现______检测/预测方案，使准确率提高__%',
      '应用______模型，有效降低误判/漏判率__%',
      '输出项目分析报告，为产品/业务提供可执行的优化建议',
    ],
  },

  // 人力模板
  hr: {
    skillCategories: [
      {
        category: 'HR 技能',
        placeholder: '如：招聘、面试、培训',
        examples: ['招聘', '面试', '培训', '入离职管理', '绩效考核', '员工关系', '组织发展'],
      },
      {
        category: '工具',
        placeholder: '如：BOSS、前程无忧、Moka',
        examples: ['BOSS直聘', '前程无忧', 'Moka', '北森', 'Excel', 'HR系统'],
      },
      {
        category: '通用能力',
        placeholder: '如：沟通共情、冲突处理',
        examples: ['沟通共情', '冲突处理', '跨部门协作', '组织协调', '复盘分析'],
      },
    ],
    experiencePlaceholders: [
      '负责 ______ 岗位招聘，月度招聘效率提升 __%',
      '完成候选人筛选、初面、复试协调等流程，Offer 接受率 __%',
      '负责新员工入职培训，满意度达 __%',
      '优化入离职流程，平均周期缩短 __ 天',
      '支持绩效考核落地，覆盖 __ 名员工，并输出 __ 项改进建议',
      '处理员工关系事件，成功解决 __ 起纠纷或诉求',
      '梳理岗位 JD、胜任力模型，提升招聘匹配度 __%',
      '组织团队培训活动，提高整体学习参与率 __%',
    ],
    projectPlaceholders: [
      '搭建招聘流程标准化体系（简历筛选→面试→评估），沟通成本降低 __%',
      '设计新人训练营，全员学习通过率 __%，有效缩短上手周期',
    ],
  },

  // 市场模板
  marketing: {
    skillCategories: [
      {
        category: '营销技能',
        placeholder: '如：市场调研、用户洞察、品牌定位',
        examples: ['市场调研', '用户洞察', '品牌定位', '活动策划', '内容营销', 'SEM', 'SEO'],
      },
      {
        category: '工具软件',
        placeholder: '如：Google Analytics、巨量引擎',
        examples: ['Google Analytics', '巨量引擎', '朋友圈广告', 'Hotjar', 'Xmind', 'Notion'],
      },
      {
        category: '数据技能',
        placeholder: '如：数据分析、A/B 测试',
        examples: ['数据分析', 'A/B 测试', '漏斗分析', 'ROI 测算'],
      },
      {
        category: '内容技能',
        placeholder: '如：文案策划、脚本文案',
        examples: ['文案策划', '脚本文案', '短视频脚本', '海报设计基础'],
      },
      {
        category: '通用能力',
        placeholder: '如：沟通表达、项目协作',
        examples: ['沟通表达', '项目协作', '跨团队推动', '策略制定'],
      },
    ],
    experiencePlaceholders: [
      '负责 ______ 市场推广，通过 ______ 渠道实现曝光量增长 __%',
      '规划并执行营销活动，总体 ROI 提升 __%，获客成本降低 __%',
      '基于用户调研输出 ______ 报告，推动产品方向/内容策略优化',
      '协同销售/产品团队，制定增长策略，使线索转化率提升 __%',
      '负责数据分析，跟踪核心指标（CTR、CVR、CAC、留存），提出 __ 项优化方案',
    ],
    projectPlaceholders: [
      '独立完成 ______ 营销活动，实现浏览量/注册数/成交数提升 __%',
      '设计 A/B 测试方案，对比不同文案/落地页，CVR 提升 __%',
      '搭建内容矩阵（图文/短视频/EDM），提升粉丝增长 __%，互动率 __%',
    ],
  },

  // 运营模板
  operations: {
    skillCategories: [
      {
        category: '运营技能',
        placeholder: '如：流程优化、SOP制定',
        examples: ['流程优化', 'SOP制定', '用户增长', '留存分析', '活动运营', '业务策略', '需求拆解'],
      },
      {
        category: '数据技能',
        placeholder: '如：数据分析、指标体系搭建',
        examples: ['数据分析', '指标体系搭建', 'A/B测试', 'Excel', 'SQL'],
      },
      {
        category: '工具软件',
        placeholder: '如：飞书、钉钉、Notion',
        examples: ['飞书', '钉钉', 'Notion', 'Jira', 'Xmind', 'Power BI', 'Data Studio'],
      },
      {
        category: '通用能力',
        placeholder: '如：跨团队协作、项目管理',
        examples: ['跨团队协作', '项目管理', '沟通协调', '问题拆解', '复盘总结'],
      },
    ],
    experiencePlaceholders: [
      '负责 ______ 运营流程优化，使整体效率提升 __%，人效提升 __%',
      '通过指标分析（DAU / 留存 / 转化率）识别问题并推动解决，关键指标提升 __%',
      '设计并执行 ______ 活动，带来 GMV / 注册量 / 活跃用户增长 __%',
      '搭建运营指标（KPI）体系，帮助业务团队监控核心数据',
      '协同产品/技术团队推进 ______ 项目落地，缩短上线周期 __%',
      '负责用户反馈收集与需求整理，推动 __ 项产品优化上线',
      '建立并维护用户生命周期模型（拉新—促活—留存），提升留存率 __%',
      '主导 ______ 的数据看板搭建，实现核心指标实时可视化',
      '协调销售/客服/产品团队，解决一线运营问题，提高满意度 __%',
    ],
    projectPlaceholders: [
      '负责策划并执行 ______ 运营活动，实现参与人数增长 __%',
      '对用户行为数据进行分析（漏斗/留存/画像），提出 __ 项优化方案，CVR 提升 __%',
      '搭建《运营日报/周报》，帮助管理层快速判断业务情况',
    ],
  },

  // 财务模板
  finance: {
    skillCategories: [
      {
        category: '财务技能',
        placeholder: '如：成本核算、预算管理',
        examples: ['成本核算', '预算管理', '财务分析', '利润测算', '报表编制', '发票管理', '稽核'],
      },
      {
        category: '会计技能',
        placeholder: '如：总账管理、凭证审核',
        examples: ['总账管理', '凭证审核', '资产管理', '税务申报', '资金管理'],
      },
      {
        category: '工具',
        placeholder: '如：Excel、SAP、用友',
        examples: ['Excel（Vlookup / Pivot / 函数）', 'SAP', '用友', '金蝶', 'Power BI'],
      },
      {
        category: '能力',
        placeholder: '如：严谨细致、逻辑分析',
        examples: ['严谨细致', '逻辑分析', '跨部门沟通', '时间管理'],
      },
    ],
    experiencePlaceholders: [
      '负责部门年度预算管理，偏差控制在 __% 以内',
      '编制月度/季度财务报表，输出 __ 份经营分析报告供管理层决策',
      '优化报销/付款流程，使审批周期缩短 __%',
      '完成成本监控与分析，使非必要支出减少 __%',
      '执行资产盘点及稽核，确保账实相符率达到 __%',
      '配合审计机构完成年度审计，提供必要资料，审计时间缩短 __%',
      '管理发票、合同归档与财务合规工作，准确率达到 __%',
      '跟踪经营指标（收入、费用、利润），提出 __ 项优化建议',
    ],
    projectPlaceholders: [
      '参与搭建财务可视化报表体系，提高数据查询效率 __%',
      '优化预算审批流程，实现流程自动化，节省团队每月 __ 小时人工处理时间',
    ],
  },

  // 销售模板
  sales: {
    skillCategories: [
      {
        category: '销售技能',
        placeholder: '如：客户开拓、行业调研',
        examples: ['客户开拓', '行业调研', '需求分析', '方案呈现', '商务谈判', '商机管理', 'CRM'],
      },
      {
        category: '工具',
        placeholder: '如：Salesforce、Zoho CRM',
        examples: ['Salesforce', 'Zoho CRM', '企业微信', '飞书', 'Excel'],
      },
      {
        category: '能力',
        placeholder: '如：沟通表达、抗压能力',
        examples: ['沟通表达', '抗压能力', '目标推进', '客户关系管理', '跨部门协作'],
      },
    ],
    experiencePlaceholders: [
      '开拓 ______ 行业客户，月度目标达成率 __%',
      '通过电话/面访/行业活动拓客，实现有效线索增长 __%',
      '分析客户需求并制定解决方案，成功签约 __ 万元合同',
      '跟进销售全流程（拓客 → 方案 → 商务 → 合同 → 回款）',
      '维护 KA 客户，续约率达到 __%，提升客户满意度',
      '建立客户画像与线索分级体系，使跟进效率提升 __%',
      '与市场团队协作制定增长策略，提升线索转化率 __%',
      '负责 CRM 管理，提升销售漏斗准确性 __%',
      '对竞品与行业进行研究，输出 __ 份市场分析报告',
    ],
    projectPlaceholders: [
      '参与大客户招投标流程，协作完成技术方案、标书及商务报价，最终成功中标',
      '推动销售工具（CRM、自动化工具）落地，使团队效率提升 __%',
    ],
  },
};


