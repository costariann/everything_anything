import apiClient from '../../lib/api';
import { ApiResponse } from '../../types';

export const adminService = {
  async getDashboardStats() {
    const res = await apiClient.get<ApiResponse<any>>('/admin/stats');
    return res.data.data;
  },

  async getCustomers() {
    const res = await apiClient.get<ApiResponse<any[]>>('/admin/customers');
    return res.data.data;
  },

  async getInventory() {
    const res = await apiClient.get<ApiResponse<any[]>>('/inventory');
    return res.data.data;
  },

  async updateInventoryStock(variantPublicId: string, stockQuantity: number) {
    const res = await apiClient.patch<ApiResponse<any>>(`/inventory/${variantPublicId}`, {
      stockQuantity,
    });
    return res.data.data;
  },

  async uploadMedia(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<{ url: string }>>('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },
};

