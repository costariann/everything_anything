'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Lock, User, ShoppingBag, AlertCircle } from 'lucide-react';
import { useCartStore } from '../../../stores/cartStore';
import { useAuthStore } from '../../../stores/authStore';
import { orderService } from '../../../features/orders/orderService';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const subtotal = getSubtotal();
  const shipping = subtotal >= 100 || subtotal === 0 ? 0 : 10;
  const total = subtotal + shipping;

  // Checkout Mode: 'guest' or 'authenticated'
  const [checkoutMode, setCheckoutMode] = useState<'guest' | 'authenticated'>(
    user ? 'authenticated' : 'guest'
  );

  // Form State
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestFullName, setGuestFullName] = useState(user?.fullName || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');

  // Shipping Address
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.fullName || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    phone: user?.phone || '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'CASH_ON_DELIVERY' | 'MOCK_PAYMENT'>(
    'CASH_ON_DELIVERY'
  );
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-800">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Your cart is empty</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Add some products to your cart before proceeding to checkout.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
        >
          Browse Catalogue <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user && !guestEmail) {
      setError('Please provide a valid email address for order notifications.');
      return;
    }

    if (!shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.postalCode) {
      setError('Please complete the mandatory delivery address fields.');
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        guestEmail: user ? undefined : guestEmail,
        guestFullName: user ? undefined : (guestFullName || shippingAddress.fullName),
        guestPhone: user ? undefined : (guestPhone || shippingAddress.phone),
        items: items.map((i) => ({
          variantPublicId: i.variantPublicId,
          quantity: i.quantity,
        })),
        shippingAddress: {
          ...shippingAddress,
          fullName: shippingAddress.fullName || guestFullName || user?.fullName || 'Recipient',
          phone: shippingAddress.phone || guestPhone || user?.phone || '',
        },
        paymentMethod,
        notes: notes || undefined,
      };

      const created = await orderService.createOrder(orderPayload);
      if (created) {
        clearCart();
        router.push(`/orders/${created.publicId}`);
      }
    } catch (err: any) {
      console.error('Order creation error:', err);
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to place order. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4">
        <Link href="/cart" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
          ← Back to Cart
        </Link>
      </div>

      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">
        Checkout & Confirmation
      </h1>

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Account / Guest Options Banner */}
            {!user ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white text-sm font-semibold">
                    <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Customer Identification</span>
                  </div>
                  <div className="flex items-center bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setCheckoutMode('guest')}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        checkoutMode === 'guest'
                          ? 'bg-indigo-600 text-white font-medium shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Guest Checkout
                    </button>
                    <Link
                      href="/login?redirect=/checkout"
                      className="px-3 py-1 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Guest checkout is fully supported. We only require an email address to send your order receipt and tracking link.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Email Address (for order tracking)*"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                  />
                  <Input
                    label="Your Full Name"
                    placeholder="Jane Doe"
                    value={guestFullName}
                    onChange={(e) => setGuestFullName(e.target.value)}
                  />
                </div>
              </motion.div>
            ) : (
              <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Logged in as</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{user.fullName} ({user.email})</div>
                </div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">✓ Account Verified</span>
              </div>
            )}

            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm"
            >
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                1. Delivery Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Recipient Full Name*"
                  required
                  placeholder="e.g. John Smith"
                  value={shippingAddress.fullName}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, fullName: e.target.value })
                  }
                />
                <Input
                  label="Contact Phone*"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={shippingAddress.phone}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, phone: e.target.value })
                  }
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Street Address*"
                    required
                    placeholder="123 Main Street, Apt 4B"
                    value={shippingAddress.addressLine1}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })
                    }
                  />
                </div>
                <Input
                  label="City*"
                  required
                  placeholder="San Francisco"
                  value={shippingAddress.city}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, city: e.target.value })
                  }
                />
                <Input
                  label="State / Province*"
                  required
                  placeholder="California"
                  value={shippingAddress.state}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, state: e.target.value })
                  }
                />
                <Input
                  label="Postal Code*"
                  required
                  placeholder="94103"
                  value={shippingAddress.postalCode}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                  }
                />
                <Input
                  label="Country*"
                  required
                  placeholder="United States"
                  value={shippingAddress.country}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, country: e.target.value })
                  }
                />
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm"
            >
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                2. Payment Method
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                    paymentMethod === 'CASH_ON_DELIVERY'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 ring-1 ring-indigo-600'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Cash on Delivery</span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CASH_ON_DELIVERY"
                      checked={paymentMethod === 'CASH_ON_DELIVERY'}
                      onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pay securely with cash or card upon package arrival at your door.
                  </p>
                </label>

                <label
                  className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                    paymentMethod === 'MOCK_PAYMENT'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 ring-1 ring-indigo-600'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Instant Card Simulation</span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="MOCK_PAYMENT"
                      checked={paymentMethod === 'MOCK_PAYMENT'}
                      onChange={() => setPaymentMethod('MOCK_PAYMENT')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Instant sandbox payment simulation (Paystack / Flutterwave integration ready).
                  </p>
                </label>
              </div>

              {/* Delivery Notes */}
              <div className="pt-3">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Delivery Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Leave package by the side door..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </motion.div>
          </div>

          {/* Checkout Order Summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Your Order</h3>

            {/* Items Mini List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-slate-100 dark:divide-slate-800/60">
              {items.map((item) => (
                <div key={item.variantPublicId} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="font-semibold text-slate-900 dark:text-white truncate">{item.productName}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Qty: {item.quantity} • {item.variantName}
                    </div>
                  </div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="text-slate-900 dark:text-white font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Shipping</span>
                <span className="text-slate-900 dark:text-white font-medium">
                  {shipping === 0 ? <span className="text-emerald-600 dark:text-emerald-400 uppercase font-bold">Free</span> : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white">
                <span>Total Due</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">${total.toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
            >
              <Lock className="w-4 h-4 mr-2" /> Place Order • ${total.toFixed(2)}
            </Button>

            <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Encrypted & Protected Checkout</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
