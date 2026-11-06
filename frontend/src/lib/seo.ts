import { Product, Category, Brand } from '../types';

export const SITE_NAME = 'everythinganything';
export const SITE_TAGLINE = 'Shop Electronics, Fashion & Home Craft Online in Ghana';
export const SITE_DESCRIPTION =
  'Shop authentic electronics, fashion, accessories, and artisanal home craft at everythinganything. Enjoy fast guest checkout, secure Mobile Money & card payments, and express delivery across Ghana.';

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://everythinganything.com';

export const DEFAULT_KEYWORDS = [
  'everythinganything',
  'online shopping Ghana',
  'buy electronics online Ghana',
  'fashion store Ghana',
  'home decor Ghana',
  'Accra online store',
  'Kumasi online shopping',
  'guest checkout ecommerce',
  'Paystack Mobile Money shopping',
  'authentic brands Ghana',
];

function getServerApiBaseUrl(): string {
  if (process.env.INTERNAL_BACKEND_URL) {
    return `${process.env.INTERNAL_BACKEND_URL.replace(/\/$/, '')}/api/v1`;
  }
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.startsWith('http')) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  return 'http://localhost:4000/api/v1';
}

export async function fetchProductForSeo(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${getServerApiBaseUrl()}/products/${encodeURIComponent(slug)}`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

export async function fetchProductsForSitemap(): Promise<Product[]> {
  try {
    const res = await fetch(`${getServerApiBaseUrl()}/products?limit=200`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.products || [];
  } catch {
    return [];
  }
}

export async function fetchCategoriesForSitemap(): Promise<Category[]> {
  try {
    const res = await fetch(`${getServerApiBaseUrl()}/categories`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch {
    return [];
  }
}

export async function fetchBrandsForSitemap(): Promise<Brand[]> {
  try {
    const res = await fetch(`${getServerApiBaseUrl()}/brands`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch {
    return [];
  }
}

