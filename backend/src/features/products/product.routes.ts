import { Router } from 'express';
import { productController } from './product.controller';
import { authGuard } from '../../shared/middleware/authGuard';
import { roleGuard } from '../../shared/middleware/roleGuard';
import { validateRequest } from '../../shared/middleware/validate';
import {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
} from './product.validation';

export const productRoutes = Router();

// Public storefront routes
productRoutes.get(
  '/',
  validateRequest({ query: listProductsQuerySchema }),
  productController.listPublic
);
productRoutes.get('/:slug', productController.getBySlug);

// Admin routes
productRoutes.get('/admin/all', authGuard, roleGuard('ADMIN'), productController.listAdmin);
productRoutes.get(
  '/admin/detail/:publicId',
  authGuard,
  roleGuard('ADMIN'),
  productController.getAdminDetail
);
productRoutes.post(
  '/',
  authGuard,
  roleGuard('ADMIN'),
  validateRequest({ body: createProductSchema }),
  productController.create
);
productRoutes.put(
  '/:publicId',
  authGuard,
  roleGuard('ADMIN'),
  validateRequest({ body: updateProductSchema }),
  productController.update
);
productRoutes.delete(
  '/:publicId',
  authGuard,
  roleGuard('ADMIN'),
  productController.delete
);

