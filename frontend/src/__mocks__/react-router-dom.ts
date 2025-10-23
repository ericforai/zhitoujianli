/**
 * Mock for react-router-dom
 * Needed because react-router v7 is pure ESM and Jest doesn't support it well
 */

import * as React from 'react';

// Export the mock navigate for test access
export const mockNavigate = jest.fn();

const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default',
};

export const BrowserRouter = ({ children }: { children: React.ReactNode }) =>
  children;
export const Link = ({
  children,
  to,
}: {
  children: React.ReactNode;
  to: string;
}) => React.createElement('a', { href: to }, children);
export const useNavigate = () => mockNavigate;
export const useLocation = () => mockLocation;
export const useParams = () => ({});
export const Routes = ({ children }: { children: React.ReactNode }) => children;
export const Route = ({ element }: { element: React.ReactNode }) => element;
