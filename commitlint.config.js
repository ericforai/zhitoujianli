/**
 * Commitlint配置文件
 * 基于Conventional Commits规范
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-27
 */

module.exports = {
  extends: ['@commitlint/config-conventional'],

  // 自定义规则
  rules: {
    // 类型规则
    'type-enum': [
      2,
      'always',
      [
        // 主要类型
        'feat', // 新功能
        'fix', // 修复bug
        'docs', // 文档更新
        'style', // 代码格式调整（不影响代码运行的变动）
        'refactor', // 代码重构（既不是新增功能，也不是修复bug）
        'perf', // 性能优化
        'test', // 测试相关
        'build', // 构建系统或外部依赖的变动
        'ci', // CI/CD相关
        'chore', // 其他修改（比如构建过程或辅助工具的变动）
        'revert', // 回滚之前的commit

        // 项目特定类型
        'security', // 安全相关
        'config', // 配置文件修改
        'deps', // 依赖更新
        'release', // 发布版本
      ],
    ],

    // 主题规则
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-max-length': [2, 'always', 50],
    'subject-min-length': [2, 'always', 10],

    // 正文规则
    'body-leading-blank': [2, 'always'],
    'body-max-line-length': [2, 'always', 100],

    // 脚注规则
    'footer-leading-blank': [2, 'always'],
    'footer-max-line-length': [2, 'always', 100],

    // 头部规则
    'header-max-length': [2, 'always', 100],

    // 范围规则
    'scope-case': [2, 'always', 'lower-case'],
    'scope-empty': [1, 'never'], // 建议使用scope，但不是强制的
    'scope-enum': [
      1,
      'always',
      [
        // 前端相关
        'frontend',
        'react',
        'typescript',
        'ui',
        'components',
        'hooks',
        'utils',
        'services',

        // 后端相关
        'backend',
        'api',
        'auth',
        'security',
        'database',
        'server',

        // 配置相关
        'config',
        'env',
        'docker',
        'nginx',
        'deploy',

        // 文档相关
        'docs',
        'readme',
        'changelog',

        // 测试相关
        'test',
        'e2e',
        'unit',

        // 构建相关
        'build',
        'ci',
        'workflow',

        // 依赖相关
        'deps',
        'package',

        // 其他
        'misc',
        'cleanup',
        'typo',
      ],
    ],

    // 类型规则
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
  },

  // 自定义类型说明
  helpUrl: 'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',

  // 忽略规则（用于特殊情况）
  ignores: [
    // 忽略合并提交
    (commit) => commit.includes('Merge'),
    // 忽略revert提交
    (commit) => commit.startsWith('Revert '),
    // 忽略WIP提交（开发中）
    (commit) => commit.includes('WIP'),
  ],
};
