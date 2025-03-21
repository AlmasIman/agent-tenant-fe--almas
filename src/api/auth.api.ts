import { httpApi, httpApi2 } from '@app/api/http.api';
import './mocks/auth.api.mock';
import { UserModel } from '@app/domain/UserModel';
import axios from 'axios';

export interface AuthData {
  email: string;
  password: string;
}

export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface SecurityCodePayload {
  code: string;
}

export interface NewPasswordData {
  newPassword: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export const login = async (loginPayload: LoginRequest): Promise<LoginResponse> =>
  httpApi.post<LoginResponse>('token/', { ...loginPayload }).then(({ data }) => data);

export const signUp = (signUpData: SignUpRequest): Promise<undefined> =>
  httpApi.post<undefined>('signUp', { ...signUpData }).then(({ data }) => data);

export const resetPassword = (resetPasswordPayload: ResetPasswordRequest): Promise<undefined> =>
  httpApi.post<undefined>('forgotPassword', { ...resetPasswordPayload }).then(({ data }) => data);

export const verifySecurityCode = (securityCodePayload: SecurityCodePayload): Promise<undefined> =>
  httpApi.post<undefined>('verifySecurityCode', { ...securityCodePayload }).then(({ data }) => data);

export const setNewPassword = (newPasswordData: NewPasswordData): Promise<undefined> =>
  httpApi.post<undefined>('setNewPassword', { ...newPasswordData }).then(({ data }) => data);

export const currentUser = async (): Promise<UserModel> =>
  httpApi.get<UserModel>('my/users/current').then(({ data }) => data);
