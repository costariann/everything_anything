'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Upload, AlertCircle } from 'lucide-react';
import { productService } from '../../../../features/products/productService';
import { categoryService } from '../../../../features/categories/categoryService';
import { brandService } from '../../../../features/brands/brandService';
import { adminService } from '../../../../features/admin/adminService';
import { Category, Brand } from '../../../../types';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { Select } from '../../../../components/ui/Select';
import { formatPrice } from '../../../../lib/formatters';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Product Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [categoryPublicId, setCategoryPublicId] = useState('');
  const [brandPublicId, setBrandPublicId] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Dynamic variants
  const [variants, setVariants] = useState<Array<{ name: string; sku: string; price: string; stockQuantity: string }>>([
    { name: 'Standard', sku: '', price: '', stockQuantity: '10' },
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cats, brs] = await Promise.all([
        productService.getAdminProducts(),
        categoryService.getAdminCategories(),
        brandService.getAdminBrands(),
      ]);
      if (prods) setProducts(prods);
      if (cats) {
        setCategories(cats);
        if (cats.length > 0 && !categoryPublicId) {
          setCategoryPublicId(cats[0].publicId);
        }
      }
      if (brs) setBrands(brs);
    } catch (err) {
      console.error('Error fetching admin products data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingImage(true);
    setError(null);
    try {
      const res = await adminService.uploadMedia(file);
      if (res?.url) {
        setImageUrl(res.url);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to upload image to Firebase Storage.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { name: '', sku: '', price: basePrice || '', stockQuantity: '10' },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) return;
    setVariants(variants.filter((_, idx) => idx !== index));
  };

  const handleVariantChange = (index: number, field: string, value: string) => {
    const updated = [...variants];
    (updated[index] as any)[field] = value;
    setVariants(updated);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        name,
        description,
        basePrice: parseFloat(basePrice),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
        categoryPublicId,
        brandPublicId: brandPublicId || undefined,
        isFeatured,
        isPublished,
        images: imageUrl ? [{ url: imageUrl, isPrimary: true }] : [],
        variants: variants.map((v) => ({
          name: v.name || 'Standard',
          sku: v.sku || `${name.toUpperCase().substring(0, 3)}-${Math.floor(100 + Math.random() * 900)}`,
          price: parseFloat(v.price) || parseFloat(basePrice),
          stockQuantity: parseInt(v.stockQuantity, 10) || 0,
        })),
      };

      await productService.createProduct(payload);
      setIsModalOpen(false);
      // Reset form
      setName('');
      setDescription('');
      setBasePrice('');
      setCompareAtPrice('');
      setImageUrl('');
      setVariants([{ name: 'Standard', sku: '', price: '', stockQuantity: '10' }]);
      loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (publicId: string) => {
    if (!confirm('Are you sure you want to soft-delete this product?')) return;
    try {
      await productService.deleteProduct(publicId);
      loadData();
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Products Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create, update variants, track inventory and manage active status.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add New Product
        </Button>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading products catalog...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No products created yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Base Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {products.map((p) => (
                  <tr key={p.publicId} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700/60">
                          {p.thumbnail ? (
                            <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600 text-[10px]">
                              None
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {p.variantsCount} variant(s)
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{p.category?.name || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{p.brand?.name || '—'}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {formatPrice(p.basePrice)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold ${
                          p.totalStock <= 5 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {p.totalStock} units
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          p.isPublished
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {p.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteProduct(p.publicId)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Catalog Product"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateProduct} className="space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Product Name*"
                required
                placeholder="e.g. Minimalist Mechanical Keyboard"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Description* (min 10 characters)
              </label>
              <textarea
                required
                rows={3}
                placeholder="Detailed specifications and craftsmanship..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <Input
              label="Base Retail Price (GH₵)*"
              type="number"
              step="0.01"
              required
              placeholder="99.99"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
            />

            <Input
              label="Compare At / Original Price (GH₵)"
              type="number"
              step="0.01"
              placeholder="129.99"
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
            />

            <Select
              label="Category*"
              options={categories.map((c) => ({ value: c.publicId, label: c.name }))}
              value={categoryPublicId}
              onChange={(e) => setCategoryPublicId(e.target.value)}
            />

            <Select
              label="Brand"
              options={[
                { value: '', label: 'None / Generic' },
                ...brands.map((b) => ({ value: b.publicId, label: b.name })),
              ]}
              value={brandPublicId}
              onChange={(e) => setBrandPublicId(e.target.value)}
            />
          </div>

          {/* Image Upload / URL */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Product Image (Firebase Storage / URL)
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors shadow-sm">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
              <span className="text-xs text-slate-500">or enter image URL:</span>
            </div>
            <Input
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            {imageUrl && (
              <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 mt-2">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Variants Section */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                Product Variations & Stock
              </label>
              <button
                type="button"
                onClick={handleAddVariant}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                + Add Variant
              </button>
            </div>

            <div className="space-y-2">
              {variants.map((v, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <input
                    type="text"
                    placeholder="Name (e.g. Navy / Size M)"
                    value={v.name}
                    onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="SKU"
                    value={v.sku}
                    onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                    className="w-28 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={v.price}
                    onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                    className="w-24 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={v.stockQuantity}
                    onChange={(e) => handleVariantChange(idx, 'stockQuantity', e.target.value)}
                    className="w-20 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Featured & Published */}
          <div className="flex items-center gap-6 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700 dark:text-slate-300">Feature on Homepage</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700 dark:text-slate-300">Publish immediately to Storefront</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
              Create Product
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
