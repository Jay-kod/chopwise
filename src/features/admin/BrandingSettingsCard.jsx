import { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Spinner from '../../components/Spinner';
import { useAppConfig } from '../../context/ConfigContext';

const HERO_PRESETS = [
  {
    name: 'Jollof & Plantain',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Soup & Swallow',
    url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Nigerian Greens',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80',
  },
];

const ICON_PRESETS = ['🍲', '🥘', '🇳🇬', '🌿', '🥗', '🥑', 'default'];

/**
 * Admin card for modifying website branding: Project Name, Website Icon, Tagline, and Hero Image.
 * Follows AGENTS.md and docs/ADMIN_PAGE_SPEC.md.
 */
export default function BrandingSettingsCard({ settings, onSave }) {
  const { updateLocalConfig } = useAppConfig();
  const [formData, setFormData] = useState({
    appName: 'ChopWise',
    appIcon: '🍲',
    appTagline: 'Nigerian meals that fit your health and your wallet.',
    heroImageUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        appName: settings.appName ?? 'ChopWise',
        appIcon: settings.appIcon ?? '🍲',
        appTagline: settings.appTagline ?? 'Nigerian meals that fit your health and your wallet.',
        heroImageUrl: settings.heroImageUrl ?? '',
      });
    }
  }, [settings]);

  function handleChange(field, val) {
    setSavedSuccess(false);
    setFormData((prev) => ({ ...prev, [field]: val }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    const payload = {
      ...(settings || {}),
      appName: formData.appName ? String(formData.appName).trim() : 'ChopWise',
      appIcon: formData.appIcon ? String(formData.appIcon).trim() : '🍲',
      appTagline: formData.appTagline ? String(formData.appTagline).trim() : '',
      heroImageUrl: formData.heroImageUrl ? String(formData.heroImageUrl).trim() : '',
    };
    await onSave('settings', payload);
    updateLocalConfig({
      appName: payload.appName,
      appIcon: payload.appIcon,
      appTagline: payload.appTagline,
      heroImageUrl: payload.heroImageUrl,
    });
    setSaving(false);
    setSavedSuccess(true);
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-fg">Project Identity &amp; Branding</h2>
        <p className="text-xs text-muted">
          Customize the project name, website icon/emoji, and tagline. Changes reflect immediately across the site.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="setting-app-name"
            label="Project / Web App Name"
            type="text"
            value={formData.appName}
            onChange={(e) => handleChange('appName', e.target.value)}
            placeholder="e.g. ChopWise"
            required
          />

          <div>
            <label htmlFor="setting-app-icon" className="block text-xs font-semibold text-fg mb-1">
              Website Icon (Emoji, image URL, or default)
            </label>
            <div className="flex gap-2">
              <Input
                id="setting-app-icon"
                type="text"
                value={formData.appIcon}
                onChange={(e) => handleChange('appIcon', e.target.value)}
                placeholder="e.g. 🍲 or default"
                className="flex-1"
              />
              <span
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-muted text-xl shadow-xs"
                title="Current icon preview"
              >
                {formData.appIcon === 'default' ? '🌿' : formData.appIcon || '🍲'}
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {ICON_PRESETS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => handleChange('appIcon', ic)}
                  className="rounded border border-field-line bg-surface px-1.5 py-0.5 text-xs text-fg hover:bg-surface-muted transition-colors"
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Input
          id="setting-app-tagline"
          label="Project Tagline / Headline"
          type="text"
          value={formData.appTagline}
          onChange={(e) => handleChange('appTagline', e.target.value)}
          placeholder="e.g. Nigerian meals that fit your health and your wallet."
        />

        <div className="space-y-2">
          <Input
            id="setting-hero-image"
            label="Homepage Hero Image URL (optional)"
            type="url"
            value={formData.heroImageUrl}
            onChange={(e) => handleChange('heroImageUrl', e.target.value)}
            placeholder="https://images.unsplash.com/..."
          />
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-muted font-medium">Hero presets:</span>
            {HERO_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleChange('heroImageUrl', p.url)}
                className="rounded border border-field-line bg-surface px-2 py-0.5 text-xs text-fg hover:bg-surface-muted transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-line pt-4">
          <div>
            {savedSuccess && (
              <span className="text-xs font-semibold text-primary">
                ✓ Branding updated and live!
              </span>
            )}
          </div>
          <Button
            type="submit"
            disabled={saving}
            className="text-xs min-h-9 px-4 font-semibold"
          >
            {saving ? <Spinner label="Saving branding…" /> : 'Save branding'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
