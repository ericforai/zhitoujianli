import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import TemplatesPage from '../../../pages/Resume/Templates/TemplatesPage';

jest.mock('../../../components/Navigation', () => () => <div>nav</div>);
jest.mock('../../../components/Footer', () => () => <div>footer</div>);
jest.mock('../../../components/resume/PersonaCards', () => () => <div>persona</div>);
jest.mock('../../../components/resume/DynamicForm', () => (props: any) => (
  <button onClick={() => props.onSubmit && props.onSubmit({ persona: 'experienced', targetRole: 'x', name: 'n', email: 'e', skills: [], experiences: [], projects: [], education: [] })}>
    form
  </button>
));
jest.mock('../../../components/resume/PreviewPane', () => () => <div>preview</div>);

describe('TemplatesPage', () => {
  it('renders persona cards and form', () => {
    render(
      <MemoryRouter>
        <TemplatesPage />
      </MemoryRouter>
    );
    expect(screen.getByText('选择人群画像')).toBeInTheDocument();
    expect(screen.getByText('填写核心信息')).toBeInTheDocument();
  });
});


