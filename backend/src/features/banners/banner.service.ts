import { BannerPosition } from '@prisma/client';
import { prisma } from '../../config/database';
import { NotFoundError } from '../../shared/errors/AppError';

export class BannerService {
  async listPublic(position?: BannerPosition) {
    const where: any = {
      isActive: true,
      deletedAt: null,
    };
    if (position) {
      where.position = position;
    }

    const banners = await prisma.banner.findMany({
      where,
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        publicId: true,
        title: true,
        subtitle: true,
        imageUrl: true,
        badgeText: true,
        ctaText: true,
        ctaLink: true,
        position: true,
        displayOrder: true,
      },
    });

    return banners;
  }

  async listAdmin() {
    const banners = await prisma.banner.findMany({
      where: { deletedAt: null },
      orderBy: [{ position: 'asc' }, { displayOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return banners.map((b) => ({
      publicId: b.publicId,
      title: b.title,
      subtitle: b.subtitle,
      imageUrl: b.imageUrl,
      badgeText: b.badgeText,
      ctaText: b.ctaText,
      ctaLink: b.ctaLink,
      position: b.position,
      displayOrder: b.displayOrder,
      isActive: b.isActive,
      createdAt: b.createdAt,
    }));
  }

  async create(data: {
    title: string;
    subtitle?: string;
    imageUrl: string;
    badgeText?: string;
    ctaText?: string;
    ctaLink?: string;
    position?: BannerPosition;
    displayOrder?: number;
    isActive?: boolean;
  }) {
    const banner = await prisma.banner.create({
      data: {
        title: data.title,
        subtitle: data.subtitle || null,
        imageUrl: data.imageUrl,
        badgeText: data.badgeText || null,
        ctaText: data.ctaText || null,
        ctaLink: data.ctaLink || null,
        position: data.position || 'HERO_SLIDE',
        displayOrder: data.displayOrder ?? 0,
        isActive: data.isActive ?? true,
      },
    });

    return {
      publicId: banner.publicId,
      title: banner.title,
      position: banner.position,
    };
  }

  async update(
    publicId: string,
    data: {
      title?: string;
      subtitle?: string;
      imageUrl?: string;
      badgeText?: string;
      ctaText?: string;
      ctaLink?: string;
      position?: BannerPosition;
      displayOrder?: number;
      isActive?: boolean;
    }
  ) {
    const existing = await prisma.banner.findFirst({
      where: { publicId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundError('Banner not found.');
    }

    const updated = await prisma.banner.update({
      where: { id: existing.id },
      data: {
        title: data.title ?? existing.title,
        subtitle: data.subtitle !== undefined ? data.subtitle : existing.subtitle,
        imageUrl: data.imageUrl ?? existing.imageUrl,
        badgeText: data.badgeText !== undefined ? data.badgeText : existing.badgeText,
        ctaText: data.ctaText !== undefined ? data.ctaText : existing.ctaText,
        ctaLink: data.ctaLink !== undefined ? data.ctaLink : existing.ctaLink,
        position: data.position ?? existing.position,
        displayOrder: data.displayOrder ?? existing.displayOrder,
        isActive: data.isActive ?? existing.isActive,
      },
    });

    return {
      publicId: updated.publicId,
      title: updated.title,
    };
  }

  async delete(publicId: string) {
    const existing = await prisma.banner.findFirst({
      where: { publicId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundError('Banner not found.');
    }

    await prisma.banner.update({
      where: { id: existing.id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return { success: true };
  }
}

export const bannerService = new BannerService();

