import apiClient from '../../lib/api';
import { ApiResponse, User } from '../../types';

export const authService = {
  async register(data: { email: string; password: string; fullName: string; phone?: string }) {
    const res = await apiClient.post<
      ApiResponse<{ user: User; tokens: { accessToken: string; refreshToken: string } }>
    >('/auth/register', data);
    return res.data.data;
  },

  async login(data: { email: string; password: string }) {
    const res = await apiClient.post<
      ApiResponse<{ user: User; tokens: { accessToken: string; refreshToken: string } }>
    >('/auth/login', data);
    return res.data.data;
  },

  async getMe() {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },
};

