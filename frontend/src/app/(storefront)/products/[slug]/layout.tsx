import React from 'react';
import type { Metadata } from 'next';
import { fetchProductForSeo, SITE_NAME, SITE_URL } from '../../../../lib/seo';

interface ProductLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductForSeo(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: `Browse authentic electronics, fashion, and home craft at ${SITE_NAME}.`,
    };
  }

  const price = Number(product.basePrice || 0).toFixed(2);
  const categoryName = product.category?.name || 'Storefront';
  const brandName = product.brand?.name ? `${product.brand.name} ` : '';
  const cleanDescription =
    product.description?.replace(/\s+/g, ' ').trim().slice(0, 155) ||
    `Buy ${brandName}${product.name} in ${categoryName} for GH₵ ${price} with fast express delivery across Ghana.`;

  const primaryImage = product.images?.[0]?.url || `${SITE_URL}/logo.png`;
  const canonicalUrl = `${SITE_URL}/products/${product.slug}`;

  return {
    title: `${product.name} (${categoryName}) — GH₵ ${price}`,
    description: cleanDescription,
    keywords: [
      product.name,
      categoryName,
      ...(product.brand?.name ? [product.brand.name] : []),
      `buy ${product.name} in Ghana`,
      `${product.name} price Ghana`,
      SITE_NAME,
    ],
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      siteName: SITE_NAME,
      title: `${product.name} — GH₵ ${price} | ${SITE_NAME}`,
      description: cleanDescription,
      images: product.images?.length
        ? product.images.map((img) => ({
            url: img.url,
            alt: img.altText || product.name,
          }))
        : [{ url: `${SITE_URL}/logo.png`, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} — GH₵ ${price} | ${SITE_NAME}`,
      description: cleanDescription,
      images: [primaryImage],
    },
  };
}

export default async function ProductDetailLayout({
  children,
  params,
}: ProductLayoutProps) {
  const { slug } = await params;
  const product = await fetchProductForSeo(slug);

  if (!product) {
    return <>{children}</>;
  }

  const hasStock =
    product.variants && product.variants.length > 0
      ? product.variants.some((v) => v.stockQuantity > 0)
      : product.inStock ?? true;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.variants?.[0]?.sku || product.publicId,
    image: product.images?.map((img) => img.url) || [`${SITE_URL}/logo.png`],
    category: product.category?.name,
    ...(product.brand?.name
      ? {
          brand: {
            '@type': 'Brand',
            name: product.brand.name,
          },
        }
      : {}),
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: 'GHS',
      price: Number(product.basePrice || 0).toFixed(2),
      itemCondition: 'https://schema.org/NewCondition',
      availability: hasStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: `${SITE_URL}/products`,
      },
      ...(product.category
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: product.category.name,
              item: `${SITE_URL}/products?category=${product.category.slug}`,
            },
            {
              '@type': 'ListItem',
              position: 4,
              name: product.name,
              item: `${SITE_URL}/products/${product.slug}`,
            },
          ]
        : [
            {
              '@type': 'ListItem',
              position: 3,
              name: product.name,
              item: `${SITE_URL}/products/${product.slug}`,
            },
          ]),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}

