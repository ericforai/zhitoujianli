import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PersonaCards from '../../../components/resume/PersonaCards';

describe('PersonaCards', () => {
  it('renders and toggles selection', () => {
    const onChange = jest.fn();
    render(<PersonaCards value={'experienced'} onChange={onChange} />);
    const btn = screen.getByText('应届毕业生');
    fireEvent.click(btn);
    expect(onChange).toHaveBeenCalled();
  });
});


