import apiClient from '../../lib/api';
import { ApiResponse, Category } from '../../types';

export const categoryService = {
  async getCategories() {
    const res = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return res.data.data;
  },

  async getCategoryBySlug(slug: string) {
    const res = await apiClient.get<ApiResponse<Category>>(`/categories/${slug}`);
    return res.data.data;
  },

  async getAdminCategories() {
    const res = await apiClient.get<ApiResponse<Category[]>>('/categories/admin/all');
    return res.data.data;
  },

  async createCategory(data: { name: string; description?: string; imageUrl?: string; isActive?: boolean }) {
    const res = await apiClient.post<ApiResponse<Category>>('/categories', data);
    return res.data.data;
  },

  async updateCategory(publicId: string, data: any) {
    const res = await apiClient.put<ApiResponse<Category>>(`/categories/${publicId}`, data);
    return res.data.data;
  },

  async deleteCategory(publicId: string) {
    const res = await apiClient.delete<ApiResponse<null>>(`/categories/${publicId}`);
    return res.data;
  },
};

