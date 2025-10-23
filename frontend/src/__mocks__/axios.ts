/**
 * Mock for axios
 * Needed because axios uses ESM and Jest doesn't support it well
 */

export interface AxiosRequestConfig {
  url?: string;
  method?: string;
  baseURL?: string;
  headers?: Record<string, string>;
  params?: unknown;
  data?: unknown;
  timeout?: number;
  responseType?: string;
}

export interface AxiosResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: AxiosRequestConfig;
}

export interface AxiosInstance {
  get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>>;
  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>>;
  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>>;
  delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>>;
  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>>;
  request<T = unknown>(config: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  interceptors: {
    request: {
      use: jest.Mock;
    };
    response: {
      use: jest.Mock;
    };
  };
}

const mockAxios: any = {
  get: jest.fn(() =>
    Promise.resolve({
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    })
  ),
  post: jest.fn(() =>
    Promise.resolve({
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    })
  ),
  put: jest.fn(() =>
    Promise.resolve({
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    })
  ),
  delete: jest.fn(() =>
    Promise.resolve({
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    })
  ),
  patch: jest.fn(() =>
    Promise.resolve({
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    })
  ),
  request: jest.fn(() =>
    Promise.resolve({
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    })
  ),
  interceptors: {
    request: {
      use: jest.fn(),
    },
    response: {
      use: jest.fn(),
    },
  },
};

export default {
  create: jest.fn(() => mockAxios),
  ...mockAxios,
};

export { mockAxios };
