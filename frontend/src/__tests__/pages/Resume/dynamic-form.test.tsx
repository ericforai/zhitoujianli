import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DynamicForm from '../../../components/resume/DynamicForm';

describe('DynamicForm', () => {
  it('validates required fields', async () => {
    const onSubmit = jest.fn();
    render(<DynamicForm persona='experienced' onSubmit={onSubmit} />);
    fireEvent.click(screen.getByText('生成预览'));
    // 提交为空时不应调用
    expect(onSubmit).not.toHaveBeenCalled();
  });
});


