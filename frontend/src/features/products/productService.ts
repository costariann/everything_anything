import apiClient from '../../lib/api';
import { ApiResponse, Product } from '../../types';

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export const productService = {
  async getProducts(params?: Record<string, any>) {
    const res = await apiClient.get<ApiResponse<ProductsResponse>>('/products', { params });
    return res.data.data;
  },

  async getProductBySlug(slug: string) {
    const res = await apiClient.get<ApiResponse<Product>>(`/products/${slug}`);
    return res.data.data;
  },

  async getAdminProducts() {
    const res = await apiClient.get<ApiResponse<Product[]>>('/products/admin/all');
    return res.data.data;
  },

  async createProduct(data: any) {
    const res = await apiClient.post<ApiResponse<Product>>('/products', data);
    return res.data.data;
  },

  async updateProduct(publicId: string, data: any) {
    const res = await apiClient.put<ApiResponse<Product>>(`/products/${publicId}`, data);
    return res.data.data;
  },

  async deleteProduct(publicId: string) {
    const res = await apiClient.delete<ApiResponse<null>>(`/products/${publicId}`);
    return res.data;
  },
};

