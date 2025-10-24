// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock fetch for testing environment
global.fetch = jest.fn();

// Mock XMLHttpRequest to prevent CORS errors in tests
const mockXHR = {
  open: jest.fn(),
  send: jest.fn(),
  setRequestHeader: jest.fn(),
  readyState: 4,
  status: 200,
  responseText: JSON.stringify({ success: true }),
  onreadystatechange: null,
};

// @ts-expect-error - Mock XMLHttpRequest for testing environment
global.XMLHttpRequest = jest.fn(() => mockXHR);

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  // Only show errors that are not related to network requests in tests
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Cross origin') ||
      args[0].includes('Network request failed'))
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};
