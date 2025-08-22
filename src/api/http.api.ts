import axios from 'axios';
import { AxiosError } from 'axios';
import { ApiError } from '@app/api/ApiError';
import { readToken } from '@app/services/localStorage.service';

const DEFAULT_API_BASE_URL_PROD = 'https://aigent.kz/api/';
const DEFAULT_API_BASE_URL_DEV = 'https://aigent.kz/api/';
const makeBaseUrl = (url?: string): string => {
  if (process.env.NODE_ENV === 'development') {
    return DEFAULT_API_BASE_URL_DEV;
  }
  const resolved = url && url.trim().length > 0 ? url : DEFAULT_API_BASE_URL_PROD;
  return resolved.endsWith('/') ? resolved : resolved + '/';
};

const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
};

export const httpApi = axios.create({
  baseURL: makeBaseUrl(process.env.REACT_APP_BASE_URL),
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

export const httpApi2 = axios.create({
  // for mocks or so
  baseURL: makeBaseUrl(process.env.REACT_APP_BASE_URL),
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

httpApi.interceptors.request.use((config) => {
  const token = readToken();
  const isAuthTokenEndpoint = (config.url || '').startsWith('token');
  if (token && !isAuthTokenEndpoint) {
    config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
  }

  // Attach CSRF token for unsafe methods
  const method = (config.method || 'get').toLowerCase();
  const isUnsafe = ['post', 'put', 'patch', 'delete'].includes(method);
  if (isUnsafe) {
    const csrf = getCookie('csrftoken') || getCookie('csrf') || getCookie('XSRF-TOKEN');
    if (csrf) {
      config.headers = { ...config.headers, 'X-CSRFToken': csrf };
    }
  }

  return config;
});

httpApi.interceptors.response.use(undefined, (error: AxiosError) => {
  if (error.response?.status === 401) {
    window.location.href = '/auth/login'; // TODO: refresh token
  } else {
    const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';
    const errorData = error.response?.data || {};

    throw new ApiError<ApiErrorData>(errorMessage, errorData);
  }
});

export interface ApiErrorData {
  message: string;
}
