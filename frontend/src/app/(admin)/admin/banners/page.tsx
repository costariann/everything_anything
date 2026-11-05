'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Image as ImageIcon, Upload, AlertCircle, ExternalLink } from 'lucide-react';
import { bannerService } from '../../../../features/banners/bannerService';
import { adminService } from '../../../../features/admin/adminService';
import { Banner } from '../../../../types';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { Select } from '../../../../components/ui/Select';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [badgeText, setBadgeText] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [position, setPosition] = useState<'HERO_SLIDE' | 'PROMO_MIDDLE' | 'PROMO_BOTTOM'>('HERO_SLIDE');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [uploadingImage, setUploadingImage] = useState(false);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const data = await bannerService.getAdminBanners();
      if (data) setBanners(data);
    } catch (err) {
      console.error('Failed to load admin banners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await bannerService.createBanner({
        title,
        subtitle: subtitle || undefined,
        imageUrl,
        badgeText: badgeText || undefined,
        ctaText: ctaText || undefined,
        ctaLink: ctaLink || undefined,
        position,
        displayOrder: parseInt(displayOrder, 10) || 0,
      });

      setIsModalOpen(false);
      setTitle('');
      setSubtitle('');
      setImageUrl('');
      setBadgeText('');
      setCtaText('');
      setCtaLink('');
      loadBanners();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create banner.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (publicId: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      await bannerService.deleteBanner(publicId);
      loadBanners();
    } catch (err) {
      console.error('Failed to delete banner:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Hero Slider & Promo Banners
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Customize the storefront carousel background slides, middle marketing banners, and call-to-actions.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add Banner / Slide
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading promotional banners...</div>
        ) : banners.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No banners created yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Banner Preview</th>
                  <th className="py-3 px-4">Placement / Position</th>
                  <th className="py-3 px-4">Call To Action</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                {banners.map((b) => (
                  <tr key={b.publicId} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-12 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-700/60 shadow-sm">
                          <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{b.title}</div>
                          {b.subtitle && (
                            <div className="text-[10px] text-slate-500 line-clamp-1 max-w-xs mt-0.5">
                              {b.subtitle}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        {b.position.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {b.ctaText ? (
                        <div className="text-slate-700 dark:text-slate-300">
                          <span className="font-semibold">{b.ctaText}</span>
                          <span className="text-[10px] text-slate-500 block">{b.ctaLink}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Active
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(b.publicId)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                        title="Delete banner"
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

      {/* Add Banner Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Banner / Hero Slide" maxWidth="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Input
            label="Banner Title*"
            required
            placeholder="e.g. Immersive Sound, Precision Crafted"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Subtitle / Description
            </label>
            <textarea
              rows={2}
              placeholder="Highlighting key sales pitch, benefits or season..."
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Position / Placement*"
              options={[
                { value: 'HERO_SLIDE', label: 'Hero Background Slider' },
                { value: 'PROMO_MIDDLE', label: 'Mid-Page Promo Banner' },
                { value: 'PROMO_BOTTOM', label: 'Bottom Showcase Banner' },
              ]}
              value={position}
              onChange={(e) => setPosition(e.target.value as any)}
            />

            <Input
              label="Badge Text (e.g. Sale, New)"
              placeholder="e.g. Autumn Highlights"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="CTA Button Label"
              placeholder="e.g. Shop Electronics"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
            />

            <Input
              label="CTA Button Link"
              placeholder="e.g. /products?category=electronics"
              value={ctaLink}
              onChange={(e) => setCtaLink(e.target.value)}
            />
          </div>

          {/* Image Upload or URL */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Banner High-Res Background Image*
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 transition-colors">
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
              required
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            {imageUrl && (
              <div className="w-full h-28 rounded-xl bg-slate-800 overflow-hidden border border-slate-700 mt-2">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
              Save Banner
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

