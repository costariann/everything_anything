import { z } from 'zod';

const variantSchema = z.object({
  name: z.string().min(1, 'Variant name is required'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().positive('Price must be greater than 0'),
  stockQuantity: z.number().int().min(0, 'Stock cannot be negative'),
});

const imageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  altText: z.string().optional(),
  isPrimary: z.boolean().optional().default(false),
  displayOrder: z.number().int().optional().default(0),
});

export const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  basePrice: z.number().positive('Base price must be greater than 0'),
  compareAtPrice: z.number().positive().optional(),
  categoryPublicId: z.string().min(1, 'Category is required'),
  brandPublicId: z.string().optional().or(z.literal('')),
  isFeatured: z.boolean().optional().default(false),
  isPublished: z.boolean().optional().default(true),
  images: z.array(imageSchema).optional().default([]),
  variants: z.array(variantSchema).min(1, 'At least one product variant is required'),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  basePrice: z.number().positive().optional(),
  compareAtPrice: z.number().positive().optional(),
  categoryPublicId: z.string().optional(),
  brandPublicId: z.string().optional().or(z.literal('')),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  images: z.array(imageSchema).optional(),
  variants: z.array(variantSchema).optional(),
});

export const listProductsQuerySchema = z.object({
  category: z.string().optional(),
  brand: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.string().transform(Number).optional(),
  maxPrice: z.string().transform(Number).optional(),
  featured: z.string().transform((v) => v === 'true').optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('12'),
  sortBy: z.enum(['newest', 'price-asc', 'price-desc', 'featured']).default('newest'),
});

