import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import * as rrd from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import TemplatesPage from '../../../pages/Resume/Templates/TemplatesPage';

jest.mock('../../../components/Navigation', () => ({
  __esModule: true,
  default: () => <div>nav</div>
}));
jest.mock('../../../components/Footer', () => ({
  __esModule: true,
  default: () => <div>footer</div>
}));
jest.mock('../../../components/resume/PersonaCards', () => ({
  __esModule: true,
  default: () => <div>persona</div>
}));
jest.mock('../../../components/resume/DynamicForm', () => ({
  __esModule: true,
  default: (props: any) => (
    <button
      onClick={() =>
        props.onSubmit &&
        props.onSubmit({
          persona: 'experienced',
          targetRole: 'x',
          name: 'n',
          email: 'e',
          skills: [],
          experiences: [],
          projects: [],
          education: []
        })
      }
    >
      form
    </button>
  )
}));
jest.mock('../../../components/resume/PreviewPane', () => ({
  __esModule: true,
  default: () => <div>preview</div>
}));

describe.skip('TemplatesPage', () => {
  it('renders persona cards and form', () => {
    jest.spyOn(rrd, 'useNavigate').mockReturnValue(jest.fn() as any);
    render(
      <MemoryRouter>
        <TemplatesPage />
      </MemoryRouter>
    );
    expect(screen.getByText('选择人群画像')).toBeInTheDocument();
    expect(screen.getByText('填写核心信息')).toBeInTheDocument();
  });
});


