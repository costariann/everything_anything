import { prisma } from '../../config/database';
import { createSlug } from '../../shared/utils/slugify';
import { BadRequestError, NotFoundError } from '../../shared/errors/AppError';

export class CategoryService {
  async listPublic() {
    const categories = await prisma.category.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { name: 'asc' },
      select: {
        publicId: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        _count: {
          select: { products: { where: { isPublished: true, deletedAt: null } } },
        },
      },
    });

    return categories.map((cat) => ({
      publicId: cat.publicId,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      imageUrl: cat.imageUrl,
      productCount: cat._count.products,
    }));
  }

  async listAdmin() {
    const categories = await prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        publicId: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { products: { where: { deletedAt: null } } },
        },
      },
    });

    return categories.map((cat) => ({
      ...cat,
      productCount: cat._count.products,
    }));
  }

  async getBySlug(slug: string) {
    const category = await prisma.category.findFirst({
      where: { slug, isActive: true, deletedAt: null },
      select: {
        publicId: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        _count: {
          select: { products: { where: { isPublished: true, deletedAt: null } } },
        },
      },
    });

    if (!category) {
      throw new NotFoundError('Category not found.');
    }

    return {
      publicId: category.publicId,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.imageUrl,
      productCount: category._count.products,
    };
  }

  async create(data: { name: string; description?: string; imageUrl?: string; isActive?: boolean }) {
    let slug = createSlug(data.name);

    // Check duplicate slug
    const existing = await prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      if (existing.deletedAt) {
        // If soft-deleted, restore or make slug unique
        slug = `${slug}-${Date.now()}`;
      } else {
        throw new BadRequestError('A category with this name or slug already exists.');
      }
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        imageUrl: data.imageUrl || null,
        isActive: data.isActive ?? true,
      },
    });

    return {
      publicId: category.publicId,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.imageUrl,
      isActive: category.isActive,
    };
  }

  async update(publicId: string, data: { name?: string; description?: string; imageUrl?: string; isActive?: boolean }) {
    const category = await prisma.category.findFirst({
      where: { publicId, deletedAt: null },
    });

    if (!category) {
      throw new NotFoundError('Category not found.');
    }

    let slug = category.slug;
    if (data.name && data.name !== category.name) {
      slug = createSlug(data.name);
      const conflict = await prisma.category.findFirst({
        where: { slug, publicId: { not: publicId }, deletedAt: null },
      });
      if (conflict) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const updated = await prisma.category.update({
      where: { id: category.id },
      data: {
        name: data.name ?? category.name,
        slug,
        description: data.description !== undefined ? data.description : category.description,
        imageUrl: data.imageUrl !== undefined ? data.imageUrl : category.imageUrl,
        isActive: data.isActive ?? category.isActive,
      },
    });

    return {
      publicId: updated.publicId,
      name: updated.name,
      slug: updated.slug,
      description: updated.description,
      imageUrl: updated.imageUrl,
      isActive: updated.isActive,
    };
  }

  async delete(publicId: string) {
    const category = await prisma.category.findFirst({
      where: { publicId, deletedAt: null },
    });

    if (!category) {
      throw new NotFoundError('Category not found.');
    }

    // Soft delete
    await prisma.category.update({
      where: { id: category.id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return { success: true };
  }
}

export const categoryService = new CategoryService();

