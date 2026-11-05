import apiClient from '../../lib/api';
import { ApiResponse, Order } from '../../types';

export interface CreateOrderPayload {
  guestEmail?: string;
  guestFullName?: string;
  guestPhone?: string;
  items: Array<{ variantPublicId: string; quantity: number }>;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: string;
  notes?: string;
}

export const orderService = {
  async createOrder(payload: CreateOrderPayload) {
    const res = await apiClient.post<ApiResponse<Order>>('/orders', payload);
    return res.data.data;
  },

  async getOrderByPublicId(publicId: string) {
    const res = await apiClient.get<ApiResponse<Order>>(`/orders/${publicId}`);
    return res.data.data;
  },

  async getMyOrders() {
    const res = await apiClient.get<ApiResponse<Order[]>>('/orders/my-orders');
    return res.data.data;
  },

  async getAdminOrders(params?: { status?: string; search?: string }) {
    const res = await apiClient.get<ApiResponse<any[]>>('/orders/admin/all', { params });
    return res.data.data;
  },

  async updateOrderStatus(publicId: string, status: string, paymentStatus?: string) {
    const res = await apiClient.patch<ApiResponse<any>>(`/orders/admin/${publicId}/status`, {
      status,
      paymentStatus,
    });
    return res.data.data;
  },
};

