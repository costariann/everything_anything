import { Request, Response } from 'express';
import { categoryService } from './category.service';
import { sendSuccess } from '../../shared/utils/response';

export class CategoryController {
  async listPublic(_req: Request, res: Response) {
    const categories = await categoryService.listPublic();
    return sendSuccess(res, categories, 'Categories retrieved');
  }

  async listAdmin(_req: Request, res: Response) {
    const categories = await categoryService.listAdmin();
    return sendSuccess(res, categories, 'Admin categories retrieved');
  }

  async getBySlug(req: Request, res: Response) {
    const category = await categoryService.getBySlug(req.params.slug);
    return sendSuccess(res, category, 'Category details retrieved');
  }

  async create(req: Request, res: Response) {
    const category = await categoryService.create(req.body);
    return sendSuccess(res, category, 'Category created successfully', 201);
  }

  async update(req: Request, res: Response) {
    const category = await categoryService.update(req.params.publicId, req.body);
    return sendSuccess(res, category, 'Category updated successfully');
  }

  async delete(req: Request, res: Response) {
    await categoryService.delete(req.params.publicId);
    return sendSuccess(res, null, 'Category deleted successfully');
  }
}

export const categoryController = new CategoryController();

