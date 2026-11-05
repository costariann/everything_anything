import { PrismaClient, Prisma, BannerPosition } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

const prisma = new PrismaClient();

// Load environment variables for seeding
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.development') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

async function main() {
  console.log('🌱 Starting database seed for everythinganything...');

  // 1. Seed Admin Account from Environment Variables
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@everythinganything.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
  const adminName = process.env.ADMIN_NAME || 'Store Administrator';
  const adminPhone = process.env.ADMIN_PHONE || '+1234567890';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        fullName: adminName,
        phone: adminPhone,
        role: 'ADMIN',
      },
    });
    console.log(`✅ Admin account created: ${adminEmail} (Credentials loaded from .env)`);
  } else {
    console.log(`ℹ️ Admin account already exists: ${adminEmail}`);
  }

  // 2. Seed Sample Customer Account
  const customerEmail = (process.env.DEMO_CUSTOMER_EMAIL || 'customer@example.com').toLowerCase();
  const customerPassword = process.env.DEMO_CUSTOMER_PASSWORD || 'Customer123!';
  const existingCustomer = await prisma.user.findUnique({
    where: { email: customerEmail },
  });

  if (!existingCustomer) {
    const passwordHash = await bcrypt.hash(customerPassword, 10);
    await prisma.user.create({
      data: {
        email: customerEmail,
        passwordHash,
        fullName: 'Jane Doe',
        phone: '+1987654321',
        role: 'CUSTOMER',
      },
    });
    console.log(`✅ Sample customer created: ${customerEmail}`);
  }

  // 3. Seed Categories
  const categoriesData = [
    {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Cutting-edge gadgets, smart devices, audio gear, and personal computing.',
      imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Fashion & Apparel',
      slug: 'fashion',
      description: 'Modern, high-comfort clothing, activewear, and daily essentials.',
      imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Ergonomic furniture, ambient lighting, decor, and kitchen essentials.',
      imageUrl: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Beauty & Wellness',
      slug: 'beauty-wellness',
      description: 'Clean skincare, hydration formulas, and self-care treatments.',
      imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Books & Media',
      slug: 'books-media',
      description: 'Best-selling literature, art prints, technology guides, and audiobooks.',
      imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    },
  ];

  const categoryMap = new Map<string, number>();
  for (const cat of categoriesData) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryMap.set(cat.slug, record.id);
  }
  console.log(`✅ ${categoriesData.length} categories seeded.`);

  // 4. Seed Brands
  const brandsData = [
    {
      name: 'ApexTech',
      slug: 'apextech',
      description: 'Pioneers in high-fidelity audio and wearable computing technology.',
      logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=80',
    },
    {
      name: 'Aura Lifestyle',
      slug: 'aura-lifestyle',
      description: 'Sustainable, minimalist wardrobe basics built for durability.',
      logoUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&auto=format&fit=crop&q=80',
    },
    {
      name: 'Nordic Craft',
      slug: 'nordic-craft',
      description: 'Scandinavian-inspired craftsmanship for modern homes and creative workspaces.',
      logoUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&auto=format&fit=crop&q=80',
    },
    {
      name: 'Botanica Lab',
      slug: 'botanica-lab',
      description: 'Cruelty-free botanical wellness and dermatology-tested personal care.',
      logoUrl: 'https://images.unsplash.com/photo-1608248597359-52e185871f33?w=200&auto=format&fit=crop&q=80',
    },
  ];

  const brandMap = new Map<string, number>();
  for (const brand of brandsData) {
    const record = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: brand,
    });
    brandMap.set(brand.slug, record.id);
  }
  console.log(`✅ ${brandsData.length} brands seeded.`);

  // 5. Seed Products with Variants and Images
  const products = [
    {
      name: 'Apex Pro Wireless Noise-Cancelling Headphones',
      slug: 'apex-pro-wireless-headphones',
      description: 'Experience ultra-rich soundstage with adaptive active noise cancellation, 40-hour battery life, and plush memory-foam ear cushions. Perfect for music enthusiasts and frequent flyers.',
      basePrice: 199.99,
      compareAtPrice: 249.99,
      categorySlug: 'electronics',
      brandSlug: 'apextech',
      isFeatured: true,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          altText: 'Apex Pro Headphones - Matte Black',
          isPrimary: true,
          displayOrder: 0,
        },
        {
          url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
          altText: 'Apex Pro Headphones Angle View',
          isPrimary: false,
          displayOrder: 1,
        },
      ],
      variants: [
        { name: 'Matte Black', sku: 'APEX-NC-BLK', price: 199.99, stockQuantity: 24 },
        { name: 'Silver Mist', sku: 'APEX-NC-SLV', price: 199.99, stockQuantity: 15 },
        { name: 'Midnight Navy', sku: 'APEX-NC-NVY', price: 209.99, stockQuantity: 8 },
      ],
    },
    {
      name: 'Aura Organic Heavyweight Cotton Hoodie',
      slug: 'aura-organic-heavyweight-hoodie',
      description: 'Crafted from 100% GOTS-certified organic combed cotton with double-needle stitching, brushed fleece interior, and relaxed ergonomic silhouette.',
      basePrice: 65.0,
      compareAtPrice: 85.0,
      categorySlug: 'fashion',
      brandSlug: 'aura-lifestyle',
      isFeatured: true,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
          altText: 'Aura Cotton Hoodie in Charcoal',
          isPrimary: true,
          displayOrder: 0,
        },
      ],
      variants: [
        { name: 'Charcoal - Size S', sku: 'AURA-HD-CHR-S', price: 65.0, stockQuantity: 30 },
        { name: 'Charcoal - Size M', sku: 'AURA-HD-CHR-M', price: 65.0, stockQuantity: 45 },
        { name: 'Charcoal - Size L', sku: 'AURA-HD-CHR-L', price: 65.0, stockQuantity: 20 },
        { name: 'Oatmeal - Size M', sku: 'AURA-HD-OAT-M', price: 65.0, stockQuantity: 18 },
      ],
    },
    {
      name: 'Nordic Ergonomic Natural Wood Desk Chair',
      slug: 'nordic-ergonomic-wood-desk-chair',
      description: 'Sculpted solid ash wood frame with contoured lumbar support and breathable linen upholstery. Designed to combine timeless Scandinavian aesthetics with healthy posture.',
      basePrice: 289.0,
      compareAtPrice: 349.0,
      categorySlug: 'home-living',
      brandSlug: 'nordic-craft',
      isFeatured: true,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1580481077195-c3a9927b74b7?w=800&auto=format&fit=crop&q=80',
          altText: 'Nordic Wood Desk Chair',
          isPrimary: true,
          displayOrder: 0,
        },
      ],
      variants: [
        { name: 'Natural Ash / Slate Fabric', sku: 'ND-CHR-ASH-SLT', price: 289.0, stockQuantity: 12 },
        { name: 'Walnut Finish / Cream Fabric', sku: 'ND-CHR-WAL-CRM', price: 319.0, stockQuantity: 5 },
      ],
    },
    {
      name: 'Botanica Peptide Infusion Barrier Serum',
      slug: 'botanica-peptide-infusion-barrier-serum',
      description: 'A multi-weight hyaluronic acid and tri-peptide restorative serum formulated to deeply hydrate, strengthen skin elasticity, and soothe irritation.',
      basePrice: 42.0,
      compareAtPrice: 50.0,
      categorySlug: 'beauty-wellness',
      brandSlug: 'botanica-lab',
      isFeatured: false,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
          altText: 'Botanica Barrier Serum Dropper Bottle',
          isPrimary: true,
          displayOrder: 0,
        },
      ],
      variants: [
        { name: '30ml Travel Edition', sku: 'BOT-SRM-30ML', price: 42.0, stockQuantity: 50 },
        { name: '50ml Full Size', sku: 'BOT-SRM-50ML', price: 64.0, stockQuantity: 35 },
      ],
    },
    {
      name: 'Apex Ultra Smart Fitness & Health Tracker',
      slug: 'apex-ultra-smart-tracker',
      description: 'AMOLED sunlight-readable display with 24/7 heart rate monitoring, SpO2 sensor, sleep staging, GPS route tracking, and 5 ATM water resistance.',
      basePrice: 129.99,
      compareAtPrice: 159.99,
      categorySlug: 'electronics',
      brandSlug: 'apextech',
      isFeatured: true,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
          altText: 'Apex Ultra Smart Watch',
          isPrimary: true,
          displayOrder: 0,
        },
      ],
      variants: [
        { name: 'Graphite / Sport Band', sku: 'APEX-SW-GRP', price: 129.99, stockQuantity: 28 },
        { name: 'Rose Gold / Leather Band', sku: 'APEX-SW-RSG', price: 149.99, stockQuantity: 14 },
      ],
    },
  ];

  for (const prod of products) {
    const categoryId = categoryMap.get(prod.categorySlug)!;
    const brandId = brandMap.get(prod.brandSlug)!;

    const existingProduct = await prisma.product.findUnique({
      where: { slug: prod.slug },
    });

    if (!existingProduct) {
      await prisma.product.create({
        data: {
          name: prod.name,
          slug: prod.slug,
          description: prod.description,
          basePrice: new Prisma.Decimal(prod.basePrice),
          compareAtPrice: prod.compareAtPrice ? new Prisma.Decimal(prod.compareAtPrice) : null,
          categoryId,
          brandId,
          isFeatured: prod.isFeatured,
          isPublished: true,
          images: {
            create: prod.images,
          },
          variants: {
            create: prod.variants.map((v) => ({
              name: v.name,
              sku: v.sku,
              price: new Prisma.Decimal(v.price),
              stockQuantity: v.stockQuantity,
            })),
          },
        },
      });
      console.log(`✅ Product created: ${prod.name}`);
    }
  }

  // 6. Seed Default Hero Slides & Promotional Banners
  const bannersData = [
    {
      title: 'Immersive Sound, Precision Crafted',
      subtitle: 'Experience acoustic isolation and high-fidelity sound with our flagship Apex Pro wireless collection.',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80',
      badgeText: 'New Generation Audio',
      ctaText: 'Shop Electronics',
      ctaLink: '/products?category=electronics',
      position: BannerPosition.HERO_SLIDE,
      displayOrder: 0,
    },
    {
      title: 'Sustainable Daily Luxury',
      subtitle: '100% GOTS-certified organic cotton hoodies, knitwear, and minimalist essentials engineered for lasting comfort.',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80',
      badgeText: 'Autumn Collection',
      ctaText: 'Explore Apparel',
      ctaLink: '/products?category=fashion',
      position: BannerPosition.HERO_SLIDE,
      displayOrder: 1,
    },
    {
      title: 'Scandinavian Living & Home Craft',
      subtitle: 'Sculpted solid ash furniture, ambient illumination, and ergonomic pieces designed for creative living.',
      imageUrl: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=1600&auto=format&fit=crop&q=80',
      badgeText: 'Artisanal Interiors',
      ctaText: 'Discover Home Living',
      ctaLink: '/products?category=home-living',
      position: BannerPosition.HERO_SLIDE,
      displayOrder: 2,
    },
    {
      title: 'Curated Excellence Across Every Category',
      subtitle: 'Instant guest checkout, zero account obligations, and complimentary express shipping on all orders over $100.',
      imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1600&auto=format&fit=crop&q=80',
      badgeText: 'Exclusive Storefront Perks',
      ctaText: 'Explore Full Catalogue',
      ctaLink: '/products',
      position: BannerPosition.PROMO_MIDDLE,
      displayOrder: 0,
    },
  ];

  for (const b of bannersData) {
    const existing = await prisma.banner.findFirst({
      where: { title: b.title, position: b.position },
    });
    if (!existing) {
      await prisma.banner.create({
        data: b,
      });
    }
  }
  console.log(`✅ ${bannersData.length} hero slides and promo banners seeded.`);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
