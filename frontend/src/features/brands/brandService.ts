import apiClient from '../../lib/api';
import { ApiResponse, Brand } from '../../types';

export const brandService = {
  async getBrands() {
    const res = await apiClient.get<ApiResponse<Brand[]>>('/brands');
    return res.data.data;
  },

  async getBrandBySlug(slug: string) {
    const res = await apiClient.get<ApiResponse<Brand>>(`/brands/${slug}`);
    return res.data.data;
  },

  async getAdminBrands() {
    const res = await apiClient.get<ApiResponse<Brand[]>>('/brands/admin/all');
    return res.data.data;
  },

  async createBrand(data: { name: string; description?: string; logoUrl?: string; isActive?: boolean }) {
    const res = await apiClient.post<ApiResponse<Brand>>('/brands', data);
    return res.data.data;
  },

  async updateBrand(publicId: string, data: any) {
    const res = await apiClient.put<ApiResponse<Brand>>(`/brands/${publicId}`, data);
    return res.data.data;
  },

  async deleteBrand(publicId: string) {
    const res = await apiClient.delete<ApiResponse<null>>(`/brands/${publicId}`);
    return res.data;
  },
};

