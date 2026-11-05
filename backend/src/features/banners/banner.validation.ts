import { z } from 'zod';

export const createBannerSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  subtitle: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL'),
  badgeText: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  position: z.enum(['HERO_SLIDE', 'PROMO_MIDDLE', 'PROMO_BOTTOM']).default('HERO_SLIDE'),
  displayOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateBannerSchema = z.object({
  title: z.string().min(2).optional(),
  subtitle: z.string().optional(),
  imageUrl: z.string().url().optional(),
  badgeText: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  position: z.enum(['HERO_SLIDE', 'PROMO_MIDDLE', 'PROMO_BOTTOM']).optional(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

