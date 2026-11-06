'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Filter, ShoppingBag, X } from 'lucide-react';
import { productService } from '../../../features/products/productService';
import { categoryService } from '../../../features/categories/categoryService';
import { brandService } from '../../../features/brands/brandService';
import { Product, Category, Brand } from '../../../types';
import { useCartStore } from '../../../stores/cartStore';
import { formatPrice } from '../../../lib/formatters';

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters state
  const categoryParam = searchParams.get('category') || '';
  const brandParam = searchParams.get('brand') || '';
  const searchParam = searchParams.get('search') || '';
  const sortByParam = searchParams.get('sortBy') || 'newest';
  const pageParam = Number(searchParams.get('page') || '1');

  const [searchInput, setSearchInput] = useState(searchParam);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    async function fetchMetadata() {
      try {
        const [cats, brs] = await Promise.all([
          categoryService.getCategories(),
          brandService.getBrands(),
        ]);
        if (cats) setCategories(cats);
        if (brs) setBrands(brs);
      } catch (err) {
        console.error('Error fetching categories or brands:', err);
      }
    }
    fetchMetadata();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await productService.getProducts({
          category: categoryParam || undefined,
          brand: brandParam || undefined,
          search: searchParam || undefined,
          sortBy: sortByParam,
          page: pageParam,
          limit: 12,
        });

        if (res) {
          setProducts(res.products);
          setTotalPages(res.pagination.totalPages);
          setTotalCount(res.pagination.totalCount);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [categoryParam, brandParam, searchParam, sortByParam, pageParam]);

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    if (!updates.page) {
      params.delete('page');
    }
    router.push(`/products?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput.trim() || null });
  };

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-200">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Product Catalogue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Showing {totalCount} items across multiple brands and categories
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search in catalogue..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-sm"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  updateFilters({ search: null });
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          <select
            value={sortByParam}
            onChange={(e) => updateFilters({ sortBy: e.target.value })}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 shadow-sm"
          >
            <option value="newest">Sort: Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="featured">Featured First</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="space-y-6">
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Filters
              </span>
              {(categoryParam || brandParam || searchParam) && (
                <button
                  onClick={() => router.push('/products')}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  Reset all
                </button>
              )}
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 mb-3">Categories</h3>
              <div className="space-y-1">
                <button
                  onClick={() => updateFilters({ category: null })}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    !categoryParam
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.publicId}
                    onClick={() => updateFilters({ category: cat.slug })}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      categoryParam === cat.slug
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-70">{cat.productCount ?? ''}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 mb-3">Brands</h3>
              <div className="space-y-1">
                <button
                  onClick={() => updateFilters({ brand: null })}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    !brandParam
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  All Brands
                </button>
                {brands.map((br) => (
                  <button
                    key={br.publicId}
                    onClick={() => updateFilters({ brand: br.slug })}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      brandParam === br.slug
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span>{br.name}</span>
                    <span className="text-[10px] opacity-70">{br.productCount ?? ''}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid with Motion */}
        <div className="lg:col-span-3 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl h-80 animate-pulse"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                No products match your criteria
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Try clearing some filters or searching for something else.
              </p>
              <button
                onClick={() => router.push('/products')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, idx) => (
                <motion.div
                  key={product.publicId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col transition-all hover:shadow-xl h-full"
                  >
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
                        <span className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Sale
                        </span>
                      )}
                    </div>

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
                            <span className="text-base font-black text-slate-900 dark:text-white">
                              {formatPrice(product.basePrice)}
                            </span>
                            {product.compareAtPrice && (
                              <span className="text-xs text-slate-400 line-through">
                                {formatPrice(product.compareAtPrice)}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-slate-200 dark:border-slate-900">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => updateFilters({ page: p.toString() })}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                    pageParam === p
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading catalogue...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
