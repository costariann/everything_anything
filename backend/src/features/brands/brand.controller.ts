import { Request, Response } from 'express';
import { brandService } from './brand.service';
import { sendSuccess } from '../../shared/utils/response';

export class BrandController {
  async listPublic(_req: Request, res: Response) {
    const brands = await brandService.listPublic();
    return sendSuccess(res, brands, 'Brands retrieved');
  }

  async listAdmin(_req: Request, res: Response) {
    const brands = await brandService.listAdmin();
    return sendSuccess(res, brands, 'Admin brands retrieved');
  }

  async getBySlug(req: Request, res: Response) {
    const brand = await brandService.getBySlug(req.params.slug);
    return sendSuccess(res, brand, 'Brand details retrieved');
  }

  async create(req: Request, res: Response) {
    const brand = await brandService.create(req.body);
    return sendSuccess(res, brand, 'Brand created successfully', 201);
  }

  async update(req: Request, res: Response) {
    const brand = await brandService.update(req.params.publicId, req.body);
    return sendSuccess(res, brand, 'Brand updated successfully');
  }

  async delete(req: Request, res: Response) {
    await brandService.delete(req.params.publicId);
    return sendSuccess(res, null, 'Brand deleted successfully');
  }
}

export const brandController = new BrandController();

