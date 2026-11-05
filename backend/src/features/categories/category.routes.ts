import { Router } from 'express';
import { categoryController } from './category.controller';
import { authGuard } from '../../shared/middleware/authGuard';
import { roleGuard } from '../../shared/middleware/roleGuard';
import { validateRequest } from '../../shared/middleware/validate';
import { createCategorySchema, updateCategorySchema } from './category.validation';

export const categoryRoutes = Router();

// Public routes
categoryRoutes.get('/', categoryController.listPublic);
categoryRoutes.get('/:slug', categoryController.getBySlug);

// Admin routes
categoryRoutes.get('/admin/all', authGuard, roleGuard('ADMIN'), categoryController.listAdmin);
categoryRoutes.post(
  '/',
  authGuard,
  roleGuard('ADMIN'),
  validateRequest({ body: createCategorySchema }),
  categoryController.create
);
categoryRoutes.put(
  '/:publicId',
  authGuard,
  roleGuard('ADMIN'),
  validateRequest({ body: updateCategorySchema }),
  categoryController.update
);
categoryRoutes.delete('/:publicId', authGuard, roleGuard('ADMIN'), categoryController.delete);

