'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, Plus, Minus } from 'lucide-react';
import { useCartStore } from '../../../stores/cartStore';
import { formatPrice } from '../../../lib/formatters';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const shipping = subtotal >= 500 || subtotal === 0 ? 0 : 35;
  const total = subtotal + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Shopping Cart</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review your items before proceeding to checkout.
        </p>
      </div>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-24 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-xl mx-auto shadow-sm"
        >
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">Your cart is currently empty</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Explore our curated items and start shopping today. Guest checkout is always available.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-600/25"
          >
            Explore Catalogue <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Items Table / List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              <span>{items.length} Unique Product Items</span>
              <button
                onClick={clearCart}
                className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
              >
                Clear Cart
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <motion.div
                  key={item.variantPublicId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700/50">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600 text-xs">
                          No Img
                        </div>
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/products/${item.productSlug}`}
                        className="text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.variantName}</p>
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        {formatPrice(item.price)} each
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 p-0.5">
                      <button
                        onClick={() => updateQuantity(item.variantPublicId, item.quantity - 1)}
                        className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.variantPublicId, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock}
                        className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-slate-900 dark:text-white">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      <button
                        onClick={() => removeItem(item.variantPublicId)}
                        className="text-[11px] text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors mt-0.5 inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Order Summary</h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="text-slate-900 dark:text-white font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Estimated Dispatch (Ghana)</span>
                <span className="text-slate-900 dark:text-white font-medium">
                  {shipping === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase">Free</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </span>
              </div>
              {subtotal < 500 && (
                <p className="text-[11px] text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-500/20">
                  Add {formatPrice(500 - subtotal)} more to qualify for Free Delivery across Ghana!
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Total Amount</span>
              <span className="text-xl font-black text-slate-900 dark:text-white">{formatPrice(total)}</span>
            </div>

            <Link
              href="/checkout"
              className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider text-center transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Guest checkout enabled — no password needed</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Dispatched within 24-48 business hours</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
