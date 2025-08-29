import { IAuth, LoginData } from 'models/auth';
import { baseInstance } from './axios_client';

// Login API request
export const loginCallApi = async (auth: IAuth) => {
  const response = await baseInstance.post<LoginData>('/api/v1/auth/login', auth);
  return response.data;
};

// Logout API request
export const logoutCallApi = async () => {
  await baseInstance.post<void>('/api/v1/auth/logout');
};
