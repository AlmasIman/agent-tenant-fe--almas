import axios from 'axios';
import { AxiosError } from 'axios';
import { ApiError } from '@app/api/ApiError';
import { readToken } from '@app/services/localStorage.service';

export const httpApi = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL
});

export const httpApi2 = axios.create({ // for mocks or so
  baseURL: process.env.REACT_APP_BASE_URL
});

httpApi.interceptors.request.use((config) => {
  config.headers = { ...config.headers, Authorization: `Bearer ${readToken()}` };

  return config;
});

httpApi.interceptors.response.use(undefined, (error: AxiosError) => {
  if (error.response?.status === 401) {
    window.location.href = "/auth/login"; // TODO: refresh token
  } else {
    const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred";
    const errorData = error.response?.data || {};
  
    throw new ApiError<ApiErrorData>(errorMessage, errorData);
  }
});

export interface ApiErrorData {
  message: string;
}
