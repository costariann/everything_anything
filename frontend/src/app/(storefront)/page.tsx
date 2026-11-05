'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Sparkles, TrendingUp, CheckCircle, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { productService } from '../../features/products/productService';
import { categoryService } from '../../features/categories/categoryService';
import { bannerService } from '../../features/banners/bannerService';
import { Product, Category, Banner } from '../../types';
import { useCartStore } from '../../stores/cartStore';
import { HeroSlider } from '../../components/storefront/HeroSlider';
import { PromoBanner } from '../../components/storefront/PromoBanner';

export default function HomePage() {
  const [heroSlides, setHeroSlides] = useState<Banner[]>([]);
  const [promoBanner, setPromoBanner] = useState<Banner | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    async function loadData() {
      try {
        const [slidesData, promoData, prodRes, catRes] = await Promise.all([
          bannerService.getBanners('HERO_SLIDE'),
          bannerService.getBanners('PROMO_MIDDLE'),
          productService.getProducts({ featured: true, limit: 6 }),
          categoryService.getCategories(),
        ]);

        if (slidesData && slidesData.length > 0) {
          setHeroSlides(slidesData);
        }
        if (promoData && promoData.length > 0) {
          setPromoBanner(promoData[0]);
        }
        if (prodRes?.products) {
          setFeaturedProducts(prodRes.products);
        }
        if (catRes) {
          setCategories(catRes.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.variants || product.variants.length === 0) return;
    const defaultVariant = product.variants[0];
    addItem({
      variantPublicId: defaultVariant.publicId,
      productPublicId: product.publicId,
      productName: product.name,
      productSlug: product.slug,
      variantName: defaultVariant.name,
      price: defaultVariant.price,
      imageUrl: product.images[0]?.url,
      maxStock: defaultVariant.stockQuantity,
      quantity: 1,
    });
  };

  return (
    <main className="space-y-16 pb-16 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Dynamic Animated Hero Background Slider */}
      <HeroSlider slides={heroSlides} />

      {/* Categories Showcase with Motion */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Curated Collections
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Explore products organized across multi-category departments
            </p>
          </div>
          <Link
            href="/categories"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            All Categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.publicId}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <Link
                href={`/products?category=${cat.slug}`}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-3.5 text-center transition-all hover:shadow-xl flex flex-col items-center h-full"
              >
                <div className="w-full h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3">
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      Category
                    </div>
                  )}
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {cat.productCount ?? 0} products
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mid-Page Promo Banner (Admin Customizable) */}
      <PromoBanner banner={promoBanner} />

      {/* Featured Products Grid with Motion */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Trending Highlights
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              Featured Products
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            View Catalogue <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 animate-pulse h-80"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product, idx) => (
              <motion.div
                key={product.publicId}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Link
                  href={`/products/${product.slug}`}
                  className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col transition-all hover:shadow-2xl h-full"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {product.images[0]?.url ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                        No Image
                      </div>
                    )}
                    {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
                      <span className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Sale
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                        <span>{product.category?.name}</span>
                        {product.brand && (
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {product.brand.name}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-extrabold text-slate-900 dark:text-white">
                            ${product.basePrice.toFixed(2)}
                          </span>
                          {product.compareAtPrice && (
                            <span className="text-xs text-slate-400 line-through">
                              ${product.compareAtPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          In Stock
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleQuickAdd(product, e)}
                        className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-colors"
                        title="Quick Add to Cart"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Value Guarantees Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="space-y-2 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Mandatory Guest Checkout
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
              Never forced to register an account. Purchase securely in seconds.
            </p>
          </div>

          <div className="space-y-2 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Complimentary Express Shipping
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
              Free door-to-door delivery on all qualifying purchases over $100.
            </p>
          </div>

          <div className="space-y-2 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              30-Day Money Back Guarantee
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
              Hassle-free returns and refunds if you are not 100% delighted.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
