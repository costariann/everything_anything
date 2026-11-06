export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface HealthCheckData {
  status: 'healthy' | 'degraded';
  uptimeSeconds: number;
  environment: string;
  timestamp: string;
  database: {
    connected: boolean;
    message: string;
  };
}

export interface User {
  publicId: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: 'CUSTOMER' | 'ADMIN';
  createdAt?: string;
}

export interface Category {
  publicId: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  productCount?: number;
  createdAt?: string;
}

export interface Brand {
  publicId: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  isActive?: boolean;
  productCount?: number;
  createdAt?: string;
}

export interface ProductImage {
  publicId: string;
  url: string;
  altText?: string | null;
  isPrimary: boolean;
  displayOrder?: number;
}

export interface ProductVariant {
  publicId: string;
  sku: string;
  name: string;
  price: number;
  stockQuantity: number;
}

export interface Product {
  publicId: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  compareAtPrice?: number | null;
  category: { publicId: string; name: string; slug?: string };
  brand?: { publicId: string; name: string; slug?: string } | null;
  images: ProductImage[];
  variants?: ProductVariant[];
  isFeatured: boolean;
  isPublished?: boolean;
  inStock?: boolean;
  totalStock?: number;
  variantsCount?: number;
}

export interface CartItem {
  variantPublicId: string;
  productPublicId: string;
  productName: string;
  productSlug: string;
  variantName: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  maxStock: number;
}

export interface OrderItem {
  publicId: string;
  productName: string;
  variantName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  publicId: string;
  orderNumber: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentMethod: string;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    region?: string;
    postalCode?: string;
    digitalAddress?: string;
    country: string;
    phone: string;
  };
  customer?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  items: OrderItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface Banner {
  publicId: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  badgeText?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  position: 'HERO_SLIDE' | 'PROMO_MIDDLE' | 'PROMO_BOTTOM';
  displayOrder: number;
  isActive?: boolean;
  createdAt?: string;
}
