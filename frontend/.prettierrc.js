/**
 * Prettier配置文件
 * 统一代码格式化规则
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-27
 */

module.exports = {
  // 基础配置
  printWidth: 80, // 每行最大字符数
  tabWidth: 2, // 缩进宽度
  useTabs: false, // 使用空格而不是制表符
  semi: true, // 语句末尾添加分号
  singleQuote: true, // 使用单引号
  quoteProps: 'as-needed', // 仅在需要时给对象属性加引号
  jsxSingleQuote: true, // JSX中使用单引号
  trailingComma: 'es5', // 尾随逗号
  bracketSpacing: true, // 对象字面量的大括号间是否有空格
  bracketSameLine: false, // JSX标签的反尖括号需要换行
  arrowParens: 'avoid', // 箭头函数参数只有一个时是否要有小括号
  endOfLine: 'lf', // 行尾序列
  embeddedLanguageFormatting: 'auto', // 是否格式化嵌入的代码
  htmlWhitespaceSensitivity: 'css', // HTML空白符敏感度
  insertPragma: false, // 是否在文件顶部插入Pragma
  jsxBracketSameLine: false, // JSX标签的反尖括号需要换行
  proseWrap: 'preserve', // 是否要换行
  requirePragma: false, // 是否严格按照文件顶部的一些特殊注释格式化代码
  vueIndentScriptAndStyle: false, // Vue文件中的script和style标签缩进

  // 覆盖特定文件类型的配置
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 200,
      },
    },
    {
      files: '*.md',
      options: {
        proseWrap: 'always',
        printWidth: 80,
      },
    },
    {
      files: '*.yaml',
      options: {
        tabWidth: 2,
      },
    },
    {
      files: '*.yml',
      options: {
        tabWidth: 2,
      },
    },
  ],
};
