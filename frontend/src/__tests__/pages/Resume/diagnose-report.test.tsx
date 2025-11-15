import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DiagnoseReport from '../../../components/resume/DiagnoseReport';

const mock = {
  sections: [
    { name: '结构', items: [{ issue: '缺少概要', fix: '添加概要' }] },
    { name: '关键词', items: [] },
    { name: '量化', items: [] },
    { name: '措辞', items: [] },
    { name: '风险', items: [] }
  ],
  rewritten: {},
  score: 70,
  keywords: [],
  html: ''
} as any;

describe('DiagnoseReport', () => {
  it('switch tabs and render list', () => {
    render(<DiagnoseReport data={mock} />);
    // 显式点击“结构”确保激活状态一致
    fireEvent.click(screen.getByText('结构'));
    // 组件渲染为“问题：缺少概要”，断言前缀+正文，避免纯文本分裂导致匹配失败
    expect(screen.getByText(/问题：缺少概要/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('关键词'));
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });
});


