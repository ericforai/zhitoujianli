import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DiagnoseReport from '../../../components/resume/DiagnoseReport';

const mock = {
  sections: [
    { name: '结构分析', items: [{ issue: '缺少概要', fix: '添加概要' }] },
    { name: '内容分析', items: [] },
    { name: '专业度与可信度', items: [] },
    { name: 'ATS技术分析', items: [] },
    { name: '可提升点', items: [] }
  ],
  rewritten: {},
  score: 70,
  keywords: [],
  html: ''
} as any;

describe('DiagnoseReport', () => {
  it('switch tabs and render list', () => {
    render(<DiagnoseReport data={mock} />);
    // 显式点击"结构分析"确保激活状态一致
    fireEvent.click(screen.getByText('结构分析'));
    // 组件渲染为"缺少概要"（issue字段），而不是"问题：缺少概要"
    expect(screen.getByText('缺少概要')).toBeInTheDocument();
    expect(screen.getByText('添加概要')).toBeInTheDocument();
    // 点击其他标签
    fireEvent.click(screen.getByText('内容分析'));
    expect(screen.getByText('内容质量良好')).toBeInTheDocument();
  });
});


