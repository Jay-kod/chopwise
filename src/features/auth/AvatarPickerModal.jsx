import { useState, useEffect, useRef } from 'react';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import Spinner from '@/components/Spinner';
import { PREWORKED_AVATARS, AvatarDisplay } from './preworkedAvatars';
import { useAuth } from './useAuth';
import { useToast } from '@/components/Toast';
import { UploadIcon, CheckIcon, SparklesIcon, XIcon } from 'lucide-react';

export default function AvatarPickerModal({ isOpen, onClose }) {
  const { user, updateAvatar } = useAuth();
  const addToast = useToast();
  const current = user?.avatar || user?.profile?.avatar || 'chef-babatunde';
  const [selectedAvatar, setSelectedAvatar] = useState(current);
  const [customPreview, setCustomPreview] = useState(
    current?.startsWith('data:image/') ? current : ''
  );
  const [activeTab, setActiveTab] = useState('preworked');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const active = user?.avatar || user?.profile?.avatar || 'chef-babatunde';
      setSelectedAvatar(active);
      if (typeof active === 'string' && active.startsWith('data:image/')) {
        setCustomPreview(active);
        setActiveTab('custom');
      } else {
        setActiveTab('preworked');
      }
    }
  }, [isOpen, user?.avatar, user?.profile?.avatar]);

  if (!isOpen) return null;

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (PNG, JPG, WebP, SVG)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 160;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCustomPreview(compressedDataUrl);
        setSelectedAvatar(compressedDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await updateAvatar(selectedAvatar);
      if (res?.ok) {
        addToast('Profile avatar updated successfully!', 'ok');
        onClose();
      } else {
        addToast('Could not save avatar. Please try again.', 'error');
      }
    } catch (err) {
      addToast(err?.message || 'Failed to update avatar.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl border border-line bg-surface shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-on-primary-soft">
              <SparklesIcon className="size-4.5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-fg">Choose Profile Avatar</h2>
              <p className="text-xs text-muted">Select from curated designs or upload a custom photo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted hover:bg-surface-muted hover:text-fg transition-colors cursor-pointer"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-line px-5 pt-3 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('preworked')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'preworked'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-fg'
            }`}
          >
            Preworked & Designed Avatars ({PREWORKED_AVATARS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'custom'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-fg'
            }`}
          >
            Upload Custom Picture
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'preworked' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PREWORKED_AVATARS.map((item) => {
                const isSelected = selectedAvatar === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedAvatar(item.id)}
                    className={`relative flex items-center gap-3 rounded-xl border p-3 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary-soft shadow-xs ring-1 ring-primary'
                        : 'border-line bg-surface-muted hover:border-line-hover hover:bg-surface'
                    }`}
                  >
                    <div className="size-12 shrink-0 rounded-full border border-line/40 overflow-hidden shadow-xs">
                      <img src={item.src} alt={item.name} className="size-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-fg truncate">{item.name}</span>
                        {isSelected && <CheckIcon className="size-3.5 text-primary shrink-0" />}
                      </div>
                      <p className="text-[11px] text-muted truncate">{item.title}</p>
                      <Badge variant="neutral" className="mt-1 text-[10px] px-1.5 py-0">
                        {item.badge}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-line rounded-xl bg-surface-muted/50 text-center">
              {customPreview ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="size-24 rounded-full border-2 border-primary overflow-hidden shadow-md">
                    <img src={customPreview} alt="Custom Preview" className="size-full object-cover" />
                  </div>
                  <p className="text-xs text-muted">Previewing uploaded photo</p>
                  <Button
                    variant="secondary"
                    className="text-xs"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Photo
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex size-12 items-center justify-center rounded-full bg-surface border border-line text-muted">
                    <UploadIcon className="size-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-fg">Upload a profile picture</h4>
                  <p className="text-xs text-muted max-w-xs">
                    PNG, JPG, or WebP. We will automatically crop and optimize it into a square avatar.
                  </p>
                  <Button
                    variant="primary"
                    className="mt-2 text-xs"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select Image File
                  </Button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-line bg-surface-muted/60 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Current preview:</span>
            <div className="size-8 rounded-full border border-line overflow-hidden">
              <AvatarDisplay avatarId={selectedAvatar} fallback="A" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose} disabled={saving} className="text-xs">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={saving} className="text-xs min-w-24">
              {saving ? <Spinner label="Saving…" /> : 'Apply Avatar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
