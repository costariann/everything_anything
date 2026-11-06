import type { MetadataRoute } from 'next';
import {
  SITE_URL,
  fetchProductsForSitemap,
  fetchCategoriesForSitemap,
  fetchBrandsForSitemap,
} from '../lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/categories`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/brands`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  const [products, categories, brands] = await Promise.all([
    fetchProductsForSitemap(),
    fetchCategoriesForSitemap(),
    fetchBrandsForSitemap(),
  ]);

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/products/${product.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.85,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/products?category=${encodeURIComponent(category.slug)}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.75,
  }));

  const brandRoutes: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${SITE_URL}/products?brand=${encodeURIComponent(brand.slug)}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...brandRoutes];
}

