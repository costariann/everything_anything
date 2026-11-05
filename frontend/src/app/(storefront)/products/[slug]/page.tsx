'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, Check, ShieldCheck, Truck, RotateCcw, AlertCircle, ArrowLeft } from 'lucide-react';
import { productService } from '../../../../features/products/productService';
import { Product, ProductVariant } from '../../../../types';
import { useCartStore } from '../../../../stores/cartStore';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [added, setAdded] = useState<boolean>(false);

  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await productService.getProductBySlug(slug);
        if (data) {
          setProduct(data);
          if (data.images && data.images.length > 0) {
            setActiveImage(data.images[0].url);
          }
          if (data.variants && data.variants.length > 0) {
            setSelectedVariant(data.variants[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load product detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-slate-200 dark:bg-slate-900 rounded-3xl"></div>
          <div className="space-y-6">
            <div className="h-8 bg-slate-200 dark:bg-slate-900 rounded-lg w-3/4"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-900 rounded-lg w-1/4"></div>
            <div className="h-24 bg-slate-200 dark:bg-slate-900 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Product Not Found</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">The requested product may have been archived or removed.</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalogue
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.basePrice;
  const isOutOfStock = selectedVariant ? selectedVariant.stockQuantity <= 0 : false;

  const handleAddToCart = () => {
    if (!selectedVariant || isOutOfStock) return;

    addItem({
      variantPublicId: selectedVariant.publicId,
      productPublicId: product.publicId,
      productName: product.name,
      productSlug: product.slug,
      variantName: selectedVariant.name,
      price: currentPrice,
      imageUrl: activeImage || product.images[0]?.url,
      maxStock: selectedVariant.stockQuantity,
      quantity,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
          Products
        </Link>
        <span>/</span>
        <Link
          href={`/products?category=${product.category?.slug}`}
          className="hover:text-indigo-600 dark:hover:text-white transition-colors"
        >
          {product.category?.name}
        </Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Images Gallery with Motion */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <div className="aspect-square bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl relative">
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600 text-sm">
                No Preview Available
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.publicId}
                  onClick={() => setActiveImage(img.url)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    activeImage === img.url
                      ? 'border-indigo-600 ring-2 ring-indigo-600/30 scale-95 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.altText || ''} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product Info & Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-6"
        >
          <div>
            <div className="flex items-center gap-3 text-xs font-semibold mb-2">
              <span className="text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{product.category?.name}</span>
              {product.brand && (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {product.brand.name}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {product.name}
            </h1>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              ${currentPrice.toFixed(2)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > currentPrice && (
              <>
                <span className="text-base text-slate-400 dark:text-slate-500 line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Save ${(product.compareAtPrice - currentPrice).toFixed(2)}
                </span>
              </>
            )}
          </div>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-300">
                Choose Variation / Option:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.publicId === v.publicId;
                  const isStockOut = v.stockQuantity <= 0;

                  return (
                    <button
                      key={v.publicId}
                      disabled={isStockOut}
                      onClick={() => {
                        setSelectedVariant(v);
                        setQuantity(1);
                      }}
                      className={`px-3 py-2.5 rounded-xl text-left border text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-950 dark:text-white ring-1 ring-indigo-600'
                          : isStockOut
                          ? 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/40 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                      }`}
                    >
                      <div className="font-semibold truncate">{v.name}</div>
                      <div className="flex items-center justify-between text-[10px] mt-1 text-slate-500 dark:text-slate-400">
                        <span>${v.price.toFixed(2)}</span>
                        <span>{isStockOut ? 'Out of stock' : `${v.stockQuantity} left`}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity and Add to Cart */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 p-1 shadow-inner">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                >
                  -
                </button>
                <span className="w-10 text-center text-sm font-bold font-mono text-slate-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) =>
                      selectedVariant ? Math.min(selectedVariant.stockQuantity, q + 1) : q + 1
                    )
                  }
                  disabled={
                    !selectedVariant || quantity >= selectedVariant.stockQuantity || isOutOfStock
                  }
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-600 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" /> Added to Cart!
                  </>
                ) : isOutOfStock ? (
                  <>
                    <AlertCircle className="w-4 h-4" /> Out of Stock
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Cart • ${(currentPrice * quantity).toFixed(2)}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Highlights & Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <span>Express delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>Guest checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
              <span>30-day returns</span>
            </div>
          </div>

          {/* Full Description */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Product Overview</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
