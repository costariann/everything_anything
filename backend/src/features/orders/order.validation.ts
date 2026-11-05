import { z } from 'zod';

const orderItemSchema = z.object({
  variantPublicId: z.string().min(1, 'Variant ID is required'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

const shippingAddressSchema = z.object({
  fullName: z.string().min(2, 'Recipient full name is required'),
  addressLine1: z.string().min(3, 'Address line is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State / Province is required'),
  postalCode: z.string().min(2, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  phone: z.string().min(5, 'Contact phone is required'),
});

export const createOrderSchema = z.object({
  // Guest fields optional for registered users, but validated in service if guest
  guestEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  guestFullName: z.string().min(2).optional().or(z.literal('')),
  guestPhone: z.string().min(5).optional().or(z.literal('')),
  items: z.array(orderItemSchema).min(1, 'Cart cannot be empty'),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(['CASH_ON_DELIVERY', 'MOCK_PAYMENT']).default('CASH_ON_DELIVERY'),
  notes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
});

