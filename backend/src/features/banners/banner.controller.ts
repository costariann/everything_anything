import { Request, Response } from 'express';
import { bannerService } from './banner.service';
import { sendSuccess } from '../../shared/utils/response';

export class BannerController {
  async listPublic(req: Request, res: Response) {
    const position = req.query.position as any;
    const banners = await bannerService.listPublic(position);
    return sendSuccess(res, banners, 'Banners retrieved');
  }

  async listAdmin(_req: Request, res: Response) {
    const banners = await bannerService.listAdmin();
    return sendSuccess(res, banners, 'Admin banners retrieved');
  }

  async create(req: Request, res: Response) {
    const banner = await bannerService.create(req.body);
    return sendSuccess(res, banner, 'Banner created successfully', 201);
  }

  async update(req: Request, res: Response) {
    const banner = await bannerService.update(req.params.publicId, req.body);
    return sendSuccess(res, banner, 'Banner updated successfully');
  }

  async delete(req: Request, res: Response) {
    await bannerService.delete(req.params.publicId);
    return sendSuccess(res, null, 'Banner deleted successfully');
  }
}

export const bannerController = new BannerController();

