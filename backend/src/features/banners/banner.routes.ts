import { Router } from 'express';
import { bannerController } from './banner.controller';
import { authGuard } from '../../shared/middleware/authGuard';
import { roleGuard } from '../../shared/middleware/roleGuard';
import { validateRequest } from '../../shared/middleware/validate';
import { createBannerSchema, updateBannerSchema } from './banner.validation';

export const bannerRoutes = Router();

// Public route to get banners (can filter by ?position=HERO_SLIDE or PROMO_MIDDLE)
bannerRoutes.get('/', bannerController.listPublic);

// Admin routes
bannerRoutes.get('/admin/all', authGuard, roleGuard('ADMIN'), bannerController.listAdmin);
bannerRoutes.post(
  '/',
  authGuard,
  roleGuard('ADMIN'),
  validateRequest({ body: createBannerSchema }),
  bannerController.create
);
bannerRoutes.put(
  '/:publicId',
  authGuard,
  roleGuard('ADMIN'),
  validateRequest({ body: updateBannerSchema }),
  bannerController.update
);
bannerRoutes.delete('/:publicId', authGuard, roleGuard('ADMIN'), bannerController.delete);

