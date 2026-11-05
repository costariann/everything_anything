import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { authGuard } from '../../shared/middleware/authGuard';
import { roleGuard } from '../../shared/middleware/roleGuard';
import { validateRequest } from '../../shared/middleware/validate';
import { sendSuccess } from '../../shared/utils/response';
import { NotFoundError } from '../../shared/errors/AppError';

export const inventoryRoutes = Router();

const updateStockSchema = z.object({
  stockQuantity: z.number().int().min(0, 'Stock cannot be negative'),
});

inventoryRoutes.get('/', authGuard, roleGuard('ADMIN'), async (_req: Request, res: Response) => {
  const variants = await prisma.productVariant.findMany({
    where: { deletedAt: null },
    include: {
      product: {
        select: { publicId: true, name: true, isPublished: true },
      },
    },
    orderBy: { stockQuantity: 'asc' },
  });

  const formatted = variants.map((v) => ({
    publicId: v.publicId,
    sku: v.sku,
    name: v.name,
    productName: v.product.name,
    productPublicId: v.product.publicId,
    price: Number(v.price),
    stockQuantity: v.stockQuantity,
    isLowStock: v.stockQuantity <= 5,
    isOutOfStock: v.stockQuantity === 0,
  }));

  return sendSuccess(res, formatted, 'Inventory items retrieved');
});

inventoryRoutes.patch(
  '/:publicId',
  authGuard,
  roleGuard('ADMIN'),
  validateRequest({ body: updateStockSchema }),
  async (req: Request, res: Response) => {
    const variant = await prisma.productVariant.findFirst({
      where: { publicId: req.params.publicId, deletedAt: null },
    });

    if (!variant) {
      throw new NotFoundError('Variant not found.');
    }

    const updated = await prisma.productVariant.update({
      where: { id: variant.id },
      data: { stockQuantity: req.body.stockQuantity },
    });

    return sendSuccess(
      res,
      {
        publicId: updated.publicId,
        sku: updated.sku,
        stockQuantity: updated.stockQuantity,
      },
      'Stock updated successfully'
    );
  }
);

