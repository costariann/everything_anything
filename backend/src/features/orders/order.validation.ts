import { z } from 'zod';

const orderItemSchema = z.object({
  variantPublicId: z.string().min(1, 'Variant ID is required'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

const shippingAddressSchema = z.object({
  fullName: z.string().min(2, 'Recipient full name is required'),
  addressLine1: z.string().min(3, 'Delivery address / landmark is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City / Town is required'),
  region: z.string().min(2, 'Region is required').optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  digitalAddress: z.string().optional(), // GhanaPost GPS (e.g. GA-183-9022)
  country: z.string().default('Ghana'),
  phone: z.string().min(9, 'Valid Ghana phone number is required'),
});

export const createOrderSchema = z.object({
  // Guest fields optional for registered users, but validated in service if guest
  guestEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  guestFullName: z.string().min(2).optional().or(z.literal('')),
  guestPhone: z.string().min(5).optional().or(z.literal('')),
  items: z.array(orderItemSchema).min(1, 'Cart cannot be empty'),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z
    .enum(['PAYSTACK', 'PAY_ON_DELIVERY', 'CASH_ON_DELIVERY', 'MOCK_PAYMENT'])
    .default('PAYSTACK'),
  notes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
});
