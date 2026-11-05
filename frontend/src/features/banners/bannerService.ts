import apiClient from '../../lib/api';
import { ApiResponse, Banner } from '../../types';

export const bannerService = {
  async getBanners(position?: 'HERO_SLIDE' | 'PROMO_MIDDLE' | 'PROMO_BOTTOM') {
    const res = await apiClient.get<ApiResponse<Banner[]>>('/banners', {
      params: position ? { position } : undefined,
    });
    return res.data.data;
  },

  async getAdminBanners() {
    const res = await apiClient.get<ApiResponse<Banner[]>>('/banners/admin/all');
    return res.data.data;
  },

  async createBanner(data: {
    title: string;
    subtitle?: string;
    imageUrl: string;
    badgeText?: string;
    ctaText?: string;
    ctaLink?: string;
    position?: string;
    displayOrder?: number;
    isActive?: boolean;
  }) {
    const res = await apiClient.post<ApiResponse<Banner>>('/banners', data);
    return res.data.data;
  },

  async updateBanner(publicId: string, data: any) {
    const res = await apiClient.put<ApiResponse<Banner>>(`/banners/${publicId}`, data);
    return res.data.data;
  },

  async deleteBanner(publicId: string) {
    const res = await apiClient.delete<ApiResponse<null>>(`/banners/${publicId}`);
    return res.data;
  },
};

