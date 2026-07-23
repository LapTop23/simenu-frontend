// components/admin/MenuItemForm.jsx
'use client';

import { useState } from 'react';
import { uploadMenuImage } from '../../lib/api';
import ToggleSwitch from './ToggleSwitch';

const EMPTY_ITEM = {
  name: '',
  description: '',
  category: '',
  price: '',
  tagsInput: '',
  images: [],
  isFeatured: false,
  isAvailable: true,
  modifiers: [],
};

/**
 * Converts a MenuItem document (as returned by the API) into this form's flat
 * editable shape — `tags` (an array) becomes `tagsInput` (a comma-separated
 * string) purely for editing convenience, and is split back into an array on
 * submit.
 */
function toFormState(item) {
  if (!item) return EMPTY_ITEM;
  return {
    name: item.name ?? '',
    description: item.description ?? '',
    category: item.category ?? '',
    price: item.price !== undefined ? String(item.price) : '',
    tagsInput: (item.tags || []).join(', '),
    images: item.images || [],
    isFeatured: Boolean(item.isFeatured),
    isAvailable: item.isAvailable !== false,
    modifiers: (item.modifiers || []).map((group) => ({ ...group, options: [...group.options] })),
  };
}

/**
 * MenuItemForm — fully controlled create/edit modal. Every field's value
 * comes from React state and every keystroke/click updates it via a handler
 * — there is no uncontrolled DOM input anywhere in this form, per the "fully
 * controlled React forms" requirement.
 *
 * @param {object|null} item - existing item to edit, or null to create a new one
 * @param {string} restaurantSlug - needed for the image upload endpoint
 * @param {(payload: object) => Promise<void>} onSubmit
 * @param {() => void} onClose
 */
export default function MenuItemForm({ item, restaurantSlug, onSubmit, onClose }) {
  const [form, setForm] = useState(() => toFormState(item));
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const isEditing = Boolean(item);

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleImageSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // Allow re-selecting the same file later.
    if (!file) return;

    setIsUploading(true);
    setFormError(null);
    try {
      const { url } = await uploadMenuImage(restaurantSlug, file);
      updateField('images', [...form.images, url]);
    } catch (err) {
      setFormError(err.message || 'Image upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index) => {
    updateField('images', form.images.filter((_, i) => i !== index));
  };

  // ---- Modifier group builder ----
  const addModifierGroup = () => {
    updateField('modifiers', [
      ...form.modifiers,
      { name: '', selectionType: 'single', isRequired: false, options: [{ name: '', priceDelta: 0 }] },
    ]);
  };

  const updateModifierGroup = (groupIndex, field, value) => {
    const next = [...form.modifiers];
    next[groupIndex] = { ...next[groupIndex], [field]: value };
    updateField('modifiers', next);
  };

  const removeModifierGroup = (groupIndex) => {
    updateField('modifiers', form.modifiers.filter((_, i) => i !== groupIndex));
  };

  const addOption = (groupIndex) => {
    const next = [...form.modifiers];
    next[groupIndex] = { ...next[groupIndex], options: [...next[groupIndex].options, { name: '', priceDelta: 0 }] };
    updateField('modifiers', next);
  };

  const updateOption = (groupIndex, optionIndex, field, value) => {
    const next = [...form.modifiers];
    const options = [...next[groupIndex].options];
    options[optionIndex] = { ...options[optionIndex], [field]: value };
    next[groupIndex] = { ...next[groupIndex], options };
    updateField('modifiers', next);
  };

  const removeOption = (groupIndex, optionIndex) => {
    const next = [...form.modifiers];
    next[groupIndex] = { ...next[groupIndex], options: next[groupIndex].options.filter((_, i) => i !== optionIndex) };
    updateField('modifiers', next);
  };

  const validate = () => {
    if (!form.name.trim()) return 'Item name is required.';
    if (!form.category.trim()) return 'Category is required.';
    const priceNumber = Number(form.price);
    if (form.price === '' || Number.isNaN(priceNumber) || priceNumber < 0) return 'Enter a valid, non-negative price.';
    for (const group of form.modifiers) {
      if (!group.name.trim()) return 'Every modifier group needs a name.';
      if (group.options.length === 0) return `"${group.name}" needs at least one option.`;
      for (const option of group.options) {
        if (!option.name.trim()) return `Every option in "${group.name}" needs a name.`;
      }
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSaving(true);
    setFormError(null);
    try {
      await onSubmit({
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        price: Number(form.price),
        images: form.images,
        tags: form.tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
        isFeatured: form.isFeatured,
        isAvailable: form.isAvailable,
        modifiers: form.modifiers.map((group) => ({
          ...group,
          name: group.name.trim(),
          options: group.options.map((o) => ({ ...o, name: o.name.trim(), priceDelta: Number(o.priceDelta) || 0 })),
        })),
      });
    } catch (err) {
      setFormError(err.message || 'Something went wrong while saving the item.');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" role="dialog" aria-modal="true">
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl bg-white"
      >
        <div className="flex items-center justify-between border-b border-sand px-6 py-4">
          <h2 className="font-display text-lg font-semibold text-ink">{isEditing ? 'Edit item' : 'Add menu item'}</h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-paper text-ink/50 hover:text-ink">
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {formError && <p className="rounded-lg bg-chili/10 px-3 py-2 text-xs font-medium text-chili">{formError}</p>}

          {/* ---- Basic fields ---- */}
          <div className="grid grid-cols-2 gap-3">
            <label className="col-span-2 block">
              <span className="mb-1 block text-xs font-semibold text-ink/60">Name</span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Smoked Beef Stack"
                className="w-full rounded-lg border border-sand px-3 py-2 text-sm text-ink outline-none focus:border-basil"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink/60">Category</span>
              <input
                type="text"
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                placeholder="Burgers"
                className="w-full rounded-lg border border-sand px-3 py-2 text-sm text-ink outline-none focus:border-basil"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink/60">Price</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => updateField('price', e.target.value)}
                placeholder="950"
                className="w-full rounded-lg border border-sand px-3 py-2 font-mono text-sm text-ink outline-none focus:border-basil"
              />
            </label>

            <label className="col-span-2 block">
              <span className="mb-1 block text-xs font-semibold text-ink/60">Description</span>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={2}
                placeholder="Double smoked beef patty, aged cheddar, house pickles…"
                className="w-full resize-none rounded-lg border border-sand px-3 py-2 text-sm text-ink outline-none focus:border-basil"
              />
            </label>

            <label className="col-span-2 block">
              <span className="mb-1 block text-xs font-semibold text-ink/60">Tags (comma-separated)</span>
              <input
                type="text"
                value={form.tagsInput}
                onChange={(e) => updateField('tagsInput', e.target.value)}
                placeholder="spicy, chef-special"
                className="w-full rounded-lg border border-sand px-3 py-2 text-sm text-ink outline-none focus:border-basil"
              />
            </label>
          </div>

          {/* ---- Image upload ---- */}
          <div>
            <span className="mb-1 block text-xs font-semibold text-ink/60">Photos</span>
            <div className="flex flex-wrap gap-2">
              {form.images.map((url, index) => (
                <div key={url} className="relative h-16 w-16 flex-shrink-0">
                  <img src={url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-chili text-[10px] text-white"
                    aria-label="Remove image"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <label className="flex h-16 w-16 flex-shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-sand text-ink/40 hover:border-basil hover:text-basil">
                <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={handleImageSelect} className="hidden" disabled={isUploading} />
                <span className="text-lg leading-none">{isUploading ? '…' : '+'}</span>
                <span className="text-[9px]">{isUploading ? 'Uploading' : 'Add'}</span>
              </label>
            </div>
          </div>

          {/* ---- Toggles ---- */}
          <div className="flex items-center justify-between rounded-xl bg-paper px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">Available on menu</p>
              <p className="text-xs text-ink/50">Customers can order this item right now.</p>
            </div>
            <ToggleSwitch checked={form.isAvailable} onChange={(v) => updateField('isAvailable', v)} label="Available on menu" />
          </div>

          <label className="flex items-center gap-2 text-sm text-ink/70">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => updateField('isFeatured', e.target.checked)} className="h-4 w-4 rounded border-sand accent-chili" />
            Mark as Chef's Pick
          </label>

          {/* ---- Modifiers builder ---- */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink/60">Modifiers &amp; add-ons</span>
              <button type="button" onClick={addModifierGroup} className="text-xs font-semibold text-basil hover:underline">
                + Add group
              </button>
            </div>

            <div className="mt-2 space-y-3">
              {form.modifiers.map((group, groupIndex) => (
                <div key={groupIndex} className="rounded-xl border border-sand p-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={group.name}
                      onChange={(e) => updateModifierGroup(groupIndex, 'name', e.target.value)}
                      placeholder="Spice Level"
                      className="flex-1 rounded-lg border border-sand px-2.5 py-1.5 text-xs text-ink outline-none focus:border-basil"
                    />
                    <select
                      value={group.selectionType}
                      onChange={(e) => updateModifierGroup(groupIndex, 'selectionType', e.target.value)}
                      className="rounded-lg border border-sand px-2 py-1.5 text-xs text-ink"
                    >
                      <option value="single">Pick 1</option>
                      <option value="multiple">Pick any</option>
                    </select>
                    <label className="flex items-center gap-1 text-[11px] text-ink/60">
                      <input type="checkbox" checked={group.isRequired} onChange={(e) => updateModifierGroup(groupIndex, 'isRequired', e.target.checked)} className="h-3.5 w-3.5 accent-chili" />
                      Required
                    </label>
                    <button type="button" onClick={() => removeModifierGroup(groupIndex)} className="text-xs text-chili">
                      Remove
                    </button>
                  </div>

                  <div className="mt-2 space-y-1.5">
                    {group.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={option.name}
                          onChange={(e) => updateOption(groupIndex, optionIndex, 'name', e.target.value)}
                          placeholder="Extra Cheddar"
                          className="flex-1 rounded-lg border border-sand px-2.5 py-1 text-xs text-ink outline-none focus:border-basil"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={option.priceDelta}
                          onChange={(e) => updateOption(groupIndex, optionIndex, 'priceDelta', e.target.value)}
                          placeholder="0.00"
                          className="w-20 rounded-lg border border-sand px-2 py-1 font-mono text-xs text-ink outline-none focus:border-basil"
                        />
                        <button type="button" onClick={() => removeOption(groupIndex, optionIndex)} className="text-xs text-ink/40 hover:text-chili">
                          ✕
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addOption(groupIndex)} className="text-[11px] font-semibold text-basil hover:underline">
                      + Add option
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-sand px-6 py-4">
          <button
            type="submit"
            disabled={isSaving || isUploading}
            className="w-full rounded-2xl bg-chili py-3 text-center font-semibold text-paper shadow-md shadow-chili/30 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? 'Saving…' : isEditing ? 'Save changes' : 'Add item'}
          </button>
        </div>
      </form>
    </div>
  );
}
