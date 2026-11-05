import { Router } from 'express';
import { brandController } from './brand.controller';
import { authGuard } from '../../shared/middleware/authGuard';
import { roleGuard } from '../../shared/middleware/roleGuard';
import { validateRequest } from '../../shared/middleware/validate';
import { createBrandSchema, updateBrandSchema } from './brand.validation';

export const brandRoutes = Router();

// Public routes
brandRoutes.get('/', brandController.listPublic);
brandRoutes.get('/:slug', brandController.getBySlug);

// Admin routes
brandRoutes.get('/admin/all', authGuard, roleGuard('ADMIN'), brandController.listAdmin);
brandRoutes.post(
  '/',
  authGuard,
  roleGuard('ADMIN'),
  validateRequest({ body: createBrandSchema }),
  brandController.create
);
brandRoutes.put(
  '/:publicId',
  authGuard,
  roleGuard('ADMIN'),
  validateRequest({ body: updateBrandSchema }),
  brandController.update
);
brandRoutes.delete('/:publicId', authGuard, roleGuard('ADMIN'), brandController.delete);

