import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { createSlug } from '../../shared/utils/slugify';
import { BadRequestError, NotFoundError } from '../../shared/errors/AppError';

interface ListProductsFilter {
  category?: string;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'featured';
}

export class ProductService {
  async listPublic(filters: ListProductsFilter) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(50, Math.max(1, filters.limit || 12));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isPublished: true,
      deletedAt: null,
    };

    if (filters.category) {
      where.category = {
        slug: filters.category,
        isActive: true,
        deletedAt: null,
      };
    }

    if (filters.brand) {
      where.brand = {
        slug: filters.brand,
        isActive: true,
        deletedAt: null,
      };
    }

    if (filters.featured !== undefined) {
      where.isFeatured = filters.featured;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.basePrice = {};
      if (filters.minPrice !== undefined) {
        where.basePrice.gte = new Prisma.Decimal(filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        where.basePrice.lte = new Prisma.Decimal(filters.maxPrice);
      }
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (filters.sortBy === 'price-asc') {
      orderBy = { basePrice: 'asc' };
    } else if (filters.sortBy === 'price-desc') {
      orderBy = { basePrice: 'desc' };
    } else if (filters.sortBy === 'featured') {
      orderBy = { isFeatured: 'desc' };
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: { publicId: true, name: true, slug: true },
          },
          brand: {
            select: { publicId: true, name: true, slug: true },
          },
          images: {
            orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }],
            take: 2,
          },
          variants: {
            where: { deletedAt: null },
            select: {
              publicId: true,
              name: true,
              price: true,
              stockQuantity: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const formatted = products.map((p) => {
      const totalStock = p.variants.reduce((acc, v) => acc + v.stockQuantity, 0);
      return {
        publicId: p.publicId,
        name: p.name,
        slug: p.slug,
        description: p.description,
        basePrice: Number(p.basePrice),
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        category: p.category,
        brand: p.brand,
        images: p.images.map((img) => ({
          publicId: img.publicId,
          url: img.url,
          altText: img.altText,
          isPrimary: img.isPrimary,
        })),
        isFeatured: p.isFeatured,
        inStock: totalStock > 0,
        totalStock,
        variantsCount: p.variants.length,
      };
    });

    return {
      products: formatted,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async getBySlug(slug: string) {
    const product = await prisma.product.findFirst({
      where: { slug, isPublished: true, deletedAt: null },
      include: {
        category: {
          select: { publicId: true, name: true, slug: true },
        },
        brand: {
          select: { publicId: true, name: true, slug: true },
        },
        images: {
          orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }],
        },
        variants: {
          where: { deletedAt: null },
          orderBy: { price: 'asc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundError('Product not found.');
    }

    return {
      publicId: product.publicId,
      name: product.name,
      slug: product.slug,
      description: product.description,
      basePrice: Number(product.basePrice),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      isFeatured: product.isFeatured,
      category: product.category,
      brand: product.brand,
      images: product.images.map((img) => ({
        publicId: img.publicId,
        url: img.url,
        altText: img.altText,
        isPrimary: img.isPrimary,
      })),
      variants: product.variants.map((v) => ({
        publicId: v.publicId,
        sku: v.sku,
        name: v.name,
        price: Number(v.price),
        stockQuantity: v.stockQuantity,
      })),
    };
  }

  async listAdmin() {
    const products = await prisma.product.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { publicId: true, name: true } },
        brand: { select: { publicId: true, name: true } },
        images: { take: 1, orderBy: { isPrimary: 'desc' } },
        variants: { where: { deletedAt: null } },
      },
    });

    return products.map((p) => {
      const totalStock = p.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
      return {
        publicId: p.publicId,
        name: p.name,
        slug: p.slug,
        basePrice: Number(p.basePrice),
        category: p.category,
        brand: p.brand,
        thumbnail: p.images[0]?.url || null,
        isFeatured: p.isFeatured,
        isPublished: p.isPublished,
        totalStock,
        variantsCount: p.variants.length,
        createdAt: p.createdAt,
      };
    });
  }

  async getAdminDetail(publicId: string) {
    const product = await prisma.product.findFirst({
      where: { publicId, deletedAt: null },
      include: {
        category: { select: { publicId: true, name: true, slug: true } },
        brand: { select: { publicId: true, name: true, slug: true } },
        images: { orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }] },
        variants: { where: { deletedAt: null } },
      },
    });

    if (!product) {
      throw new NotFoundError('Product not found.');
    }

    return {
      publicId: product.publicId,
      name: product.name,
      slug: product.slug,
      description: product.description,
      basePrice: Number(product.basePrice),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      isFeatured: product.isFeatured,
      isPublished: product.isPublished,
      category: product.category,
      brand: product.brand,
      images: product.images.map((img) => ({
        publicId: img.publicId,
        url: img.url,
        altText: img.altText,
        isPrimary: img.isPrimary,
        displayOrder: img.displayOrder,
      })),
      variants: product.variants.map((v) => ({
        publicId: v.publicId,
        sku: v.sku,
        name: v.name,
        price: Number(v.price),
        stockQuantity: v.stockQuantity,
      })),
    };
  }

  async create(data: {
    name: string;
    description: string;
    basePrice: number;
    compareAtPrice?: number;
    categoryPublicId: string;
    brandPublicId?: string;
    isFeatured?: boolean;
    isPublished?: boolean;
    images?: Array<{ url: string; altText?: string; isPrimary?: boolean; displayOrder?: number }>;
    variants: Array<{ name: string; sku: string; price: number; stockQuantity: number }>;
  }) {
    const category = await prisma.category.findFirst({
      where: { publicId: data.categoryPublicId, deletedAt: null },
    });
    if (!category) {
      throw new BadRequestError('Invalid category.');
    }

    let brandId: number | null = null;
    if (data.brandPublicId) {
      const brand = await prisma.brand.findFirst({
        where: { publicId: data.brandPublicId, deletedAt: null },
      });
      if (!brand) {
        throw new BadRequestError('Invalid brand.');
      }
      brandId = brand.id;
    }

    let slug = createSlug(data.name);
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    // Verify SKUs are unique
    const skus = data.variants.map((v) => v.sku);
    const existingSkus = await prisma.productVariant.findMany({
      where: { sku: { in: skus } },
    });
    if (existingSkus.length > 0) {
      throw new BadRequestError(`Duplicate SKU detected: ${existingSkus.map((s) => s.sku).join(', ')}`);
    }

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name: data.name,
          slug,
          description: data.description,
          basePrice: new Prisma.Decimal(data.basePrice),
          compareAtPrice: data.compareAtPrice ? new Prisma.Decimal(data.compareAtPrice) : null,
          categoryId: category.id,
          brandId,
          isFeatured: data.isFeatured ?? false,
          isPublished: data.isPublished ?? true,
          variants: {
            create: data.variants.map((v) => ({
              name: v.name,
              sku: v.sku,
              price: new Prisma.Decimal(v.price),
              stockQuantity: v.stockQuantity,
            })),
          },
          images: {
            create: (data.images || []).map((img, idx) => ({
              url: img.url,
              altText: img.altText,
              isPrimary: img.isPrimary ?? (idx === 0),
              displayOrder: img.displayOrder ?? idx,
            })),
          },
        },
        include: {
          variants: true,
          images: true,
        },
      });

      return created;
    });

    return {
      publicId: product.publicId,
      name: product.name,
      slug: product.slug,
    };
  }

  async update(
    publicId: string,
    data: {
      name?: string;
      description?: string;
      basePrice?: number;
      compareAtPrice?: number;
      categoryPublicId?: string;
      brandPublicId?: string;
      isFeatured?: boolean;
      isPublished?: boolean;
      images?: Array<{ url: string; altText?: string; isPrimary?: boolean; displayOrder?: number }>;
      variants?: Array<{ name: string; sku: string; price: number; stockQuantity: number }>;
    }
  ) {
    const product = await prisma.product.findFirst({
      where: { publicId, deletedAt: null },
      include: { variants: true, images: true },
    });

    if (!product) {
      throw new NotFoundError('Product not found.');
    }

    let categoryId = product.categoryId;
    if (data.categoryPublicId) {
      const cat = await prisma.category.findFirst({
        where: { publicId: data.categoryPublicId, deletedAt: null },
      });
      if (!cat) throw new BadRequestError('Invalid category.');
      categoryId = cat.id;
    }

    let brandId = product.brandId;
    if (data.brandPublicId !== undefined) {
      if (data.brandPublicId) {
        const br = await prisma.brand.findFirst({
          where: { publicId: data.brandPublicId, deletedAt: null },
        });
        if (!br) throw new BadRequestError('Invalid brand.');
        brandId = br.id;
      } else {
        brandId = null;
      }
    }

    let slug = product.slug;
    if (data.name && data.name !== product.name) {
      slug = createSlug(data.name);
      const conflict = await prisma.product.findFirst({
        where: { slug, publicId: { not: publicId }, deletedAt: null },
      });
      if (conflict) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: product.id },
        data: {
          name: data.name ?? product.name,
          slug,
          description: data.description ?? product.description,
          basePrice: data.basePrice !== undefined ? new Prisma.Decimal(data.basePrice) : product.basePrice,
          compareAtPrice: data.compareAtPrice !== undefined ? new Prisma.Decimal(data.compareAtPrice) : product.compareAtPrice,
          categoryId,
          brandId,
          isFeatured: data.isFeatured ?? product.isFeatured,
          isPublished: data.isPublished ?? product.isPublished,
        },
      });

      // Update images if provided
      if (data.images) {
        await tx.productImage.deleteMany({ where: { productId: product.id } });
        await tx.productImage.createMany({
          data: data.images.map((img, idx) => ({
            productId: product.id,
            url: img.url,
            altText: img.altText,
            isPrimary: img.isPrimary ?? (idx === 0),
            displayOrder: img.displayOrder ?? idx,
          })),
        });
      }

      // Update variants if provided
      if (data.variants) {
        await tx.productVariant.deleteMany({ where: { productId: product.id } });
        await tx.productVariant.createMany({
          data: data.variants.map((v) => ({
            productId: product.id,
            name: v.name,
            sku: v.sku,
            price: new Prisma.Decimal(v.price),
            stockQuantity: v.stockQuantity,
          })),
        });
      }
    });

    return { publicId, slug };
  }

  async delete(publicId: string) {
    const product = await prisma.product.findFirst({
      where: { publicId, deletedAt: null },
    });

    if (!product) {
      throw new NotFoundError('Product not found.');
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { deletedAt: new Date(), isPublished: false },
    });

    return { success: true };
  }
}

export const productService = new ProductService();

