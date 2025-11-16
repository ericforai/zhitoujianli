import { render, screen } from '@testing-library/react';
import ProtectedRoute from '../../../components/resume/ProtectedRoute';

jest.mock('../../../components/PrivateRoute', () => ({
  __esModule: true,
  default: ({ children }: any) => children,
}));

describe('ProtectedRoute (wraps PrivateRoute)', () => {
  it('renders child', () => {
    render(
      <ProtectedRoute>
        <div>ok</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('ok')).toBeInTheDocument();
  });
});
