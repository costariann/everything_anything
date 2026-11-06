'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ArrowRight,
  Lock,
  User,
  ShoppingBag,
  AlertCircle,
  Smartphone,
  Truck,
  CreditCard,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { useCartStore } from '../../../stores/cartStore';
import { useAuthStore } from '../../../stores/authStore';
import { orderService } from '../../../features/orders/orderService';
import { paymentService } from '../../../features/payments/paymentService';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { formatPrice } from '../../../lib/formatters';
import { GHANA_REGIONS } from '../../../lib/ghanaRegions';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const subtotal = getSubtotal();
  // Free delivery across Ghana on orders over GH₵ 500, otherwise GH₵ 35
  const shipping = subtotal >= 500 || subtotal === 0 ? 0 : 35;
  const total = subtotal + shipping;

  // Checkout Mode: 'guest' or 'authenticated'
  const [checkoutMode, setCheckoutMode] = useState<'guest' | 'authenticated'>(
    user ? 'authenticated' : 'guest'
  );

  // Form State
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestFullName, setGuestFullName] = useState(user?.fullName || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');

  // Ghanaian Delivery Address
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    region: 'Greater Accra',
    city: 'Accra',
    addressLine1: '', // Street / Landmark
    addressLine2: '', // Apartment / House number
    digitalAddress: '', // GhanaPost GPS (e.g. GA-183-9022)
    postalCode: '00233',
    country: 'Ghana',
  });

  // Payment Method: 'PAYSTACK' (MoMo & Cards) or 'PAY_ON_DELIVERY'
  const [paymentMethod, setPaymentMethod] = useState<'PAYSTACK' | 'PAY_ON_DELIVERY'>('PAYSTACK');
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

    const contactEmail = user?.email || guestEmail;
    if (!contactEmail) {
      setError('Please provide a valid email address for your order confirmation receipt.');
      return;
    }

    const recipientPhone = shippingAddress.phone || guestPhone || user?.phone;
    if (!recipientPhone) {
      setError('Please provide a contact phone number for the delivery rider in Ghana.');
      return;
    }

    if (!shippingAddress.addressLine1 || !shippingAddress.city) {
      setError('Please provide your town/city and delivery landmark in Ghana.');
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        guestEmail: user ? undefined : contactEmail,
        guestFullName: user ? undefined : (guestFullName || shippingAddress.fullName || 'Valued Customer'),
        guestPhone: user ? undefined : recipientPhone,
        items: items.map((i) => ({
          variantPublicId: i.variantPublicId,
          quantity: i.quantity,
        })),
        shippingAddress: {
          ...shippingAddress,
          fullName: shippingAddress.fullName || guestFullName || user?.fullName || 'Valued Customer',
          phone: recipientPhone,
          state: shippingAddress.region,
          postalCode: shippingAddress.digitalAddress || shippingAddress.postalCode || '00233',
        },
        paymentMethod,
        notes: notes || undefined,
      };

      const created = await orderService.createOrder(orderPayload);
      if (!created) {
        throw new Error('Order creation returned no data.');
      }

      // If user chose Paystack (MoMo / Card), initialize transaction and redirect to Paystack
      if (paymentMethod === 'PAYSTACK') {
        const paystackInit = await paymentService.initializePaystack(
          created.publicId,
          contactEmail,
          `${window.location.origin}/orders/${created.publicId}`
        );

        if (paystackInit?.authorization_url) {
          clearCart();
          window.location.href = paystackInit.authorization_url;
          return;
        }
      }

      // Cash / MoMo on delivery: clear cart and go to confirmation page
      clearCart();
      router.push(`/orders/${created.publicId}`);
    } catch (err: any) {
      console.error('Order creation error:', err);
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to place order. Please try again.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Checkout</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Fast delivery across Ghana with secure Mobile Money & Card payment</span>
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Contact, Delivery, Payment */}
        <div className="lg:col-span-7 space-y-6">
          {/* Guest or Authenticated Mode Switch */}
          {!user && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Express Checkout
                </span>
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setCheckoutMode('guest')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      checkoutMode === 'guest'
                        ? 'bg-white dark:bg-slate-700 font-bold text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Guest Checkout
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/login?redirect=/checkout')}
                    className="px-3 py-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label="Email Address for Order Updates*"
                  type="email"
                  required
                  placeholder="e.g. kofi.mensah@gmail.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name*"
                    required
                    placeholder="e.g. Kofi Mensah"
                    value={guestFullName}
                    onChange={(e) => {
                      setGuestFullName(e.target.value);
                      if (!shippingAddress.fullName) {
                        setShippingAddress({ ...shippingAddress, fullName: e.target.value });
                      }
                    }}
                  />
                  <Input
                    label="Mobile Money / Contact Phone*"
                    required
                    placeholder="e.g. 024 123 4567"
                    value={guestPhone}
                    onChange={(e) => {
                      setGuestPhone(e.target.value);
                      setShippingAddress({ ...shippingAddress, phone: e.target.value });
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Ghanaian Delivery Address */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                1. Delivery Location in Ghana
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Recipient Full Name*"
                required
                placeholder="e.g. Kofi Mensah"
                value={shippingAddress.fullName}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, fullName: e.target.value })
                }
              />
              <Input
                label="Contact Phone (MoMo / WhatsApp)*"
                required
                placeholder="e.g. 024 123 4567"
                value={shippingAddress.phone}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, phone: e.target.value })
                }
              />

              {/* Ghana Region Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Region in Ghana*
                </label>
                <select
                  value={shippingAddress.region}
                  onChange={(e) => {
                    const selected = GHANA_REGIONS.find((r) => r.name === e.target.value);
                    setShippingAddress({
                      ...shippingAddress,
                      region: e.target.value,
                      city: selected?.capital || shippingAddress.city,
                    });
                  }}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  {GHANA_REGIONS.map((region) => (
                    <option key={region.code} value={region.name}>
                      {region.name} Region
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="City / Town / Suburb*"
                required
                placeholder="e.g. Accra, Kumasi, East Legon, Tema"
                value={shippingAddress.city}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, city: e.target.value })
                }
              />

              <div className="sm:col-span-2">
                <Input
                  label="Street Address & Popular Landmark*"
                  required
                  placeholder="e.g. Spintex Road, near Baatsona Total Filling Station / House No. 24"
                  value={shippingAddress.addressLine1}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })
                  }
                />
              </div>

              <Input
                label="GhanaPost GPS Digital Address (Optional)"
                placeholder="e.g. GA-183-9022"
                value={shippingAddress.digitalAddress}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, digitalAddress: e.target.value })
                }
              />

              <Input
                label="Country"
                disabled
                value="Ghana"
                className="opacity-70 cursor-not-allowed bg-slate-100 dark:bg-slate-800"
              />
            </div>
          </motion.div>

          {/* Payment Method with Paystack Ghana & Pay on Delivery */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                2. Payment Method
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Paystack Option (Mobile Money & Card) */}
              <label
                className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                  paymentMethod === 'PAYSTACK'
                    ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-500/10 ring-2 ring-indigo-600'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      Paystack (MoMo & Card)
                    </span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="PAYSTACK"
                      checked={paymentMethod === 'PAYSTACK'}
                      onChange={() => setPaymentMethod('PAYSTACK')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                    Instant Mobile Money prompt sent to your phone (MTN MoMo, Telecel Cash, AT Money) or pay with Visa & Mastercard.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                    MTN MoMo
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                    Telecel Cash
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                    Visa / Mastercard
                  </span>
                </div>
              </label>

              {/* Pay on Delivery Option */}
              <label
                className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                  paymentMethod === 'PAY_ON_DELIVERY'
                    ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-500/10 ring-2 ring-indigo-600'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Pay on Delivery
                    </span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="PAY_ON_DELIVERY"
                      checked={paymentMethod === 'PAY_ON_DELIVERY'}
                      onChange={() => setPaymentMethod('PAY_ON_DELIVERY')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                    Pay securely with cash or mobile money transfer to the dispatch rider upon inspection and arrival at your door.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                    Cash / MoMo to Rider
                  </span>
                </div>
              </label>
            </div>

            {/* Delivery Notes */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Delivery Instructions & Rider Directions (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Call my second line when near the junction; deliver to reception..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </motion.div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-3 border-b border-slate-200 dark:border-slate-800">
              Order Summary ({items.reduce((acc, i) => acc + i.quantity, 0)} items)
            </h2>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.variantPublicId} className="py-3 flex items-center justify-between text-xs">
                  <div className="pr-3">
                    <p className="font-semibold text-slate-900 dark:text-white">{item.productName}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.variantName} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white flex-shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="text-slate-900 dark:text-white font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Dispatch Delivery (Ghana)</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase">Free Delivery</span>
                  ) : (
                    <span className="text-slate-900 dark:text-white font-medium">{formatPrice(shipping)}</span>
                  )}
                </span>
              </div>
              {subtotal < 500 && (
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 p-2 rounded-lg">
                  💡 Add {formatPrice(500 - subtotal)} more to qualify for <strong>Free Delivery</strong> across Ghana!
                </p>
              )}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white">
                <span>Total Amount Due</span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 flex items-center justify-center transition-all"
            >
              {loading ? (
                <span>Processing Order...</span>
              ) : paymentMethod === 'PAYSTACK' ? (
                <>
                  <Lock className="w-4 h-4 mr-2" /> Pay with Paystack (MoMo / Card) • {formatPrice(total)}
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4 mr-2" /> Confirm Pay on Delivery • {formatPrice(total)}
                </>
              )}
            </Button>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>256-Bit SSL Encrypted & Secured by Paystack Ghana</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
