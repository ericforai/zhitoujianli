import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../../../components/resume/ProtectedRoute';

jest.mock('../../../components/PrivateRoute', () => ({
  __esModule: true,
  default: ({ children }: any) => <>{children}</>,
}));

describe('ProtectedRoute (wraps PrivateRoute)', () => {
  it('renders child route', () => {
    render(
      <MemoryRouter initialEntries={['/x']}>
        <Routes>
          <Route
            path='/x'
            element={
              <ProtectedRoute>
                <div>ok</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('ok')).toBeInTheDocument();
  });
});
