import { Request, Response } from 'express';
import { productService } from './product.service';
import { sendSuccess } from '../../shared/utils/response';

export class ProductController {
  async listPublic(req: Request, res: Response) {
    const result = await productService.listPublic(req.query as any);
    return sendSuccess(res, result, 'Products retrieved');
  }

  async getBySlug(req: Request, res: Response) {
    const product = await productService.getBySlug(req.params.slug);
    return sendSuccess(res, product, 'Product details retrieved');
  }

  async listAdmin(_req: Request, res: Response) {
    const products = await productService.listAdmin();
    return sendSuccess(res, products, 'Admin products retrieved');
  }

  async getAdminDetail(req: Request, res: Response) {
    const product = await productService.getAdminDetail(req.params.publicId);
    return sendSuccess(res, product, 'Product detail retrieved');
  }

  async create(req: Request, res: Response) {
    const product = await productService.create(req.body);
    return sendSuccess(res, product, 'Product created successfully', 201);
  }

  async update(req: Request, res: Response) {
    const product = await productService.update(req.params.publicId, req.body);
    return sendSuccess(res, product, 'Product updated successfully');
  }

  async delete(req: Request, res: Response) {
    await productService.delete(req.params.publicId);
    return sendSuccess(res, null, 'Product deleted successfully');
  }
}

export const productController = new ProductController();

