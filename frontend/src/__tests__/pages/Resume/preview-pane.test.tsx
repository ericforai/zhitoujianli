import { render, screen } from '@testing-library/react';
import PreviewPane from '../../../components/resume/PreviewPane';

describe('PreviewPane', () => {
  it('renders loading skeleton', () => {
    render(<PreviewPane loading />);
    expect(screen.queryByText(/预计页数/i)).not.toBeInTheDocument();
  });
  it('renders score and keywords', () => {
    render(
      <PreviewPane
        loading={false}
        score={80}
        keywords={['AIGC']}
        pagesEstimate={1}
      />
    );
    expect(screen.getByText(/ATS 分数（预估）：80/)).toBeInTheDocument();
    expect(screen.getByText('AIGC')).toBeInTheDocument();
  });
});
