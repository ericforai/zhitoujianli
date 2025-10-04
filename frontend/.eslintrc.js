/**
 * ESLint配置文件 - 简化版本
 * 基于React + TypeScript项目
 *
 * @author ZhiTouJianLi Team
 * @since 2025-01-27
 */

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
    'react-hooks',
    '@typescript-eslint',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // TypeScript规则
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'off', // 暂时关闭，避免大量警告
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    // React规则
    'react/react-in-jsx-scope': 'off', // React 17+不需要import React
    'react/prop-types': 'off', // 使用TypeScript进行类型检查
    'react/no-unescaped-entities': 'error', // 保持错误级别

    // React Hooks规则
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // 通用规则
    'no-console': 'off', // 暂时关闭，避免大量警告
    'no-debugger': 'error',
    'no-unused-vars': 'off', // 使用TypeScript版本
    'prefer-const': 'error',
    'no-var': 'error',
  },
  overrides: [
    {
      // 测试文件规则
      files: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
      },
    },
    {
      // 配置文件规则
      files: ['*.config.{js,ts}', '*.config.*.{js,ts}'],
      env: {
        node: true,
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'no-console': 'off',
      },
    },
  ],
  ignorePatterns: [
    'build/',
    'dist/',
    'node_modules/',
    '*.min.js',
    'coverage/',
    '.next/',
    'out/',
  ],
};
