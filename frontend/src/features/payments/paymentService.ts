import { apiClient } from '../../lib/api';
import { ApiResponse } from '../../types';

export interface PaystackInitResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface PaystackVerifyResponse {
  verified: boolean;
  order?: any;
  transaction?: any;
  message?: string;
  simulated?: boolean;
}

export const paymentService = {
  /**
   * Initializes a Paystack checkout session for an order in Ghana Cedis (GHS)
   */
  async initializePaystack(
    orderPublicId: string,
    email?: string,
    callbackUrl?: string
  ): Promise<PaystackInitResponse> {
    const res = await apiClient.post<ApiResponse<PaystackInitResponse>>(
      '/payments/paystack/initialize',
      {
        orderPublicId,
        email,
        callbackUrl,
      }
    );
    return res.data.data!;
  },

  /**
   * Verifies payment status using the reference returned by Paystack
   */
  async verifyPaystack(reference: string): Promise<PaystackVerifyResponse> {
    const res = await apiClient.get<ApiResponse<PaystackVerifyResponse>>(
      `/payments/paystack/verify/${encodeURIComponent(reference)}`
    );
    return res.data.data!;
  },
};
