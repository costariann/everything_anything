import { prisma } from '../../config/database';
import { createSlug } from '../../shared/utils/slugify';
import { BadRequestError, NotFoundError } from '../../shared/errors/AppError';

export class BrandService {
  async listPublic() {
    const brands = await prisma.brand.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { name: 'asc' },
      select: {
        publicId: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        _count: {
          select: { products: { where: { isPublished: true, deletedAt: null } } },
        },
      },
    });

    return brands.map((b) => ({
      publicId: b.publicId,
      name: b.name,
      slug: b.slug,
      description: b.description,
      logoUrl: b.logoUrl,
      productCount: b._count.products,
    }));
  }

  async listAdmin() {
    const brands = await prisma.brand.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        publicId: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { products: { where: { deletedAt: null } } },
        },
      },
    });

    return brands.map((b) => ({
      ...b,
      productCount: b._count.products,
    }));
  }

  async getBySlug(slug: string) {
    const brand = await prisma.brand.findFirst({
      where: { slug, isActive: true, deletedAt: null },
      select: {
        publicId: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        _count: {
          select: { products: { where: { isPublished: true, deletedAt: null } } },
        },
      },
    });

    if (!brand) {
      throw new NotFoundError('Brand not found.');
    }

    return {
      publicId: brand.publicId,
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      logoUrl: brand.logoUrl,
      productCount: brand._count.products,
    };
  }

  async create(data: { name: string; description?: string; logoUrl?: string; isActive?: boolean }) {
    let slug = createSlug(data.name);

    const existing = await prisma.brand.findUnique({
      where: { slug },
    });

    if (existing) {
      if (existing.deletedAt) {
        slug = `${slug}-${Date.now()}`;
      } else {
        throw new BadRequestError('A brand with this name or slug already exists.');
      }
    }

    const brand = await prisma.brand.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        logoUrl: data.logoUrl || null,
        isActive: data.isActive ?? true,
      },
    });

    return {
      publicId: brand.publicId,
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      logoUrl: brand.logoUrl,
      isActive: brand.isActive,
    };
  }

  async update(publicId: string, data: { name?: string; description?: string; logoUrl?: string; isActive?: boolean }) {
    const brand = await prisma.brand.findFirst({
      where: { publicId, deletedAt: null },
    });

    if (!brand) {
      throw new NotFoundError('Brand not found.');
    }

    let slug = brand.slug;
    if (data.name && data.name !== brand.name) {
      slug = createSlug(data.name);
      const conflict = await prisma.brand.findFirst({
        where: { slug, publicId: { not: publicId }, deletedAt: null },
      });
      if (conflict) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const updated = await prisma.brand.update({
      where: { id: brand.id },
      data: {
        name: data.name ?? brand.name,
        slug,
        description: data.description !== undefined ? data.description : brand.description,
        logoUrl: data.logoUrl !== undefined ? data.logoUrl : brand.logoUrl,
        isActive: data.isActive ?? brand.isActive,
      },
    });

    return {
      publicId: updated.publicId,
      name: updated.name,
      slug: updated.slug,
      description: updated.description,
      logoUrl: updated.logoUrl,
      isActive: updated.isActive,
    };
  }

  async delete(publicId: string) {
    const brand = await prisma.brand.findFirst({
      where: { publicId, deletedAt: null },
    });

    if (!brand) {
      throw new NotFoundError('Brand not found.');
    }

    await prisma.brand.update({
      where: { id: brand.id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return { success: true };
  }
}

export const brandService = new BrandService();

