// components/admin/SettingsPanel.jsx
'use client';

import { useState } from 'react';
import { changePassword, updateBranding, uploadMenuImage } from '../../lib/api';
import PasswordInput from '../PasswordInput';

const PRESET_COLORS = [
  { label: 'Basil (default)', primary: '#1F4D3D', secondary: '#E7A94C' },
  { label: 'Ocean', primary: '#0F4C5C', secondary: '#5FA8D3' },
  { label: 'Plum', primary: '#4A2545', secondary: '#D88C9A' },
  { label: 'Charcoal', primary: '#2B2D2F', secondary: '#C9A24B' },
];

export default function SettingsPanel({ restaurantSlug, restaurant, onBrandingUpdated }) {
  return (
    <div className="space-y-8">
      <PasswordSection />
      <BrandingSection restaurantSlug={restaurantSlug} restaurant={restaurant} onBrandingUpdated={onBrandingUpdated} />
      <CoverImageSection restaurantSlug={restaurantSlug} restaurant={restaurant} onBrandingUpdated={onBrandingUpdated} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Password change
// ---------------------------------------------------------------------------
function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      // If this account has no password at all (Google Sign-In), the
      // backend returns a specific message — surfaced here as-is rather
      // than a generic "something went wrong."
      setError(err.message || 'Could not change your password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-sand bg-white p-5">
      <h2 className="font-display text-lg italic text-ink">Change password</h2>
      <p className="mt-1 text-xs text-ink/50">
        You'll need your current password to confirm this change.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 max-w-sm space-y-3">
        {error && <p className="rounded-lg bg-chili/10 px-3 py-2 text-xs font-medium text-chili">{error}</p>}
        {success && <p className="rounded-lg bg-basil/10 px-3 py-2 text-xs font-medium text-basil">Password updated successfully.</p>}

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink/60">Current password</span>
          <PasswordInput
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink/60">New password</span>
          <PasswordInput
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink/60">Confirm new password</span>
          <PasswordInput
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-chili px-4 py-2.5 text-sm font-semibold text-paper shadow-sm shadow-chili/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Logo + theme colors
// ---------------------------------------------------------------------------
function BrandingSection({ restaurantSlug, restaurant, onBrandingUpdated }) {
  const branding = restaurant?.branding || {};
  const [logoUrl, setLogoUrl] = useState(branding.logoUrl || '');
  const [primaryColor, setPrimaryColor] = useState(branding.primaryColor || '#1F4D3D');
  const [secondaryColor, setSecondaryColor] = useState(branding.secondaryColor || '#E7A94C');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleLogoSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsUploadingLogo(true);
    setError(null);
    try {
      const { url } = await uploadMenuImage(restaurantSlug, file);
      setLogoUrl(url);
    } catch (err) {
      setError(err.message || 'Logo upload failed.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(false);
    setIsSaving(true);
    try {
      const updated = await updateBranding(restaurantSlug, { logoUrl, primaryColor, secondaryColor });
      onBrandingUpdated?.(updated);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Could not update branding.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-sand bg-white p-5">
      <h2 className="font-display text-lg italic text-ink">Logo &amp; theme color</h2>
      <p className="mt-1 text-xs text-ink/50">
        Your logo and colors appear on your customer menu and both dashboards.
      </p>

      {error && <p className="mt-3 rounded-lg bg-chili/10 px-3 py-2 text-xs font-medium text-chili">{error}</p>}
      {success && <p className="mt-3 rounded-lg bg-basil/10 px-3 py-2 text-xs font-medium text-basil">Branding updated.</p>}

      {/* ---- Logo ---- */}
      <div className="mt-4">
        <span className="mb-1 block text-xs font-semibold text-ink/60">Logo</span>
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-basil text-lg font-semibold text-paper">
              {restaurant?.name?.charAt(0) || 'S'}
            </div>
          )}
          <label className="cursor-pointer rounded-xl border border-sand px-3 py-2 text-xs font-semibold text-ink hover:bg-paper">
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={handleLogoSelect} className="hidden" disabled={isUploadingLogo} />
            {isUploadingLogo ? 'Uploading…' : logoUrl ? 'Replace logo' : 'Upload logo'}
          </label>
        </div>
      </div>

      {/* ---- Color presets ---- */}
      <div className="mt-5">
        <span className="mb-1 block text-xs font-semibold text-ink/60">Theme presets</span>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setPrimaryColor(preset.primary);
                setSecondaryColor(preset.secondary);
              }}
              className="flex items-center gap-2 rounded-full border border-sand px-3 py-1.5 text-xs font-semibold text-ink hover:bg-paper"
            >
              <span className="flex h-4 w-4 overflow-hidden rounded-full border border-sand">
                <span className="h-full w-1/2" style={{ backgroundColor: preset.primary }} />
                <span className="h-full w-1/2" style={{ backgroundColor: preset.secondary }} />
              </span>
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---- Custom color pickers ---- */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink/60">Primary color</span>
          <div className="flex items-center gap-2">
            <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-9 w-9 cursor-pointer rounded border border-sand" />
            <span className="font-mono text-xs text-ink/60">{primaryColor}</span>
          </div>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink/60">Secondary color</span>
          <div className="flex items-center gap-2">
            <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="h-9 w-9 cursor-pointer rounded border border-sand" />
            <span className="font-mono text-xs text-ink/60">{secondaryColor}</span>
          </div>
        </label>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving || isUploadingLogo}
        className="mt-5 rounded-xl bg-chili px-4 py-2.5 text-sm font-semibold text-paper shadow-sm shadow-chili/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving ? 'Saving…' : 'Save branding'}
      </button>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Header cover image — Premium plan only
// ---------------------------------------------------------------------------
function CoverImageSection({ restaurantSlug, restaurant, onBrandingUpdated }) {
  const isPremium = restaurant?.plan === 'premium';
  const [coverImageUrl, setCoverImageUrl] = useState(restaurant?.branding?.coverImageUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const { url } = await uploadMenuImage(restaurantSlug, file);
      setCoverImageUrl(url);
    } catch (err) {
      setError(err.message || 'Cover image upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(false);
    setIsSaving(true);
    try {
      const updated = await updateBranding(restaurantSlug, { coverImageUrl });
      onBrandingUpdated?.(updated);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Could not update your cover image.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-sand bg-white p-5">
      <div className="flex items-center gap-2">
        <h2 className="font-display text-lg italic text-ink">Header cover image</h2>
        <span className="rounded-full bg-saffron/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-saffron-dark">Premium</span>
      </div>

      {!isPremium ? (
        <div className="mt-3 rounded-xl bg-paper px-4 py-4 text-sm text-ink/60">
          A large cover photo at the top of your customer menu is available on the{' '}
          <span className="font-semibold text-ink">Premium plan</span>. Contact us to upgrade.
        </div>
      ) : (
        <>
          <p className="mt-1 text-xs text-ink/50">Shown at the very top of your customer-facing menu page.</p>

          {error && <p className="mt-3 rounded-lg bg-chili/10 px-3 py-2 text-xs font-medium text-chili">{error}</p>}
          {success && <p className="mt-3 rounded-lg bg-basil/10 px-3 py-2 text-xs font-medium text-basil">Cover image updated.</p>}

          <div className="mt-4">
            {coverImageUrl ? (
              <img src={coverImageUrl} alt="Cover" className="h-32 w-full rounded-xl object-cover" />
            ) : (
              <div className="flex h-32 w-full items-center justify-center rounded-xl bg-paper text-sm text-ink/40">No cover image set yet</div>
            )}
          </div>

          <label className="mt-3 inline-block cursor-pointer rounded-xl border border-sand px-3 py-2 text-xs font-semibold text-ink hover:bg-paper">
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={handleSelect} className="hidden" disabled={isUploading} />
            {isUploading ? 'Uploading…' : coverImageUrl ? 'Replace cover image' : 'Upload cover image'}
          </label>

          <div>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isUploading}
              className="mt-4 rounded-xl bg-chili px-4 py-2.5 text-sm font-semibold text-paper shadow-sm shadow-chili/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? 'Saving…' : 'Save cover image'}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
