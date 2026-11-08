import { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Spinner from '../../components/Spinner';
import ConfirmModal from '../../components/ConfirmModal';
import { formatNaira } from '../../lib/format';

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

export default function SettingsForm({ settings, onSave, onReset }) {
  const [formData, setFormData] = useState({
    mealsPerType: 2,
    budgetDivisor: 21,
    rateLimitPerHour: 10,
    retryOnOverBudget: true,
    heroImageUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        mealsPerType: settings.mealsPerType ?? 2,
        budgetDivisor: settings.budgetDivisor ?? 21,
        rateLimitPerHour: settings.rateLimitPerHour ?? 10,
        retryOnOverBudget: settings.retryOnOverBudget !== false,
        heroImageUrl: settings.heroImageUrl ?? '',
      });
      setImageError(false);
    }
  }, [settings]);

  function handleChange(field, val) {
    if (field === 'heroImageUrl') setImageError(false);
    setFormData((prev) => ({ ...prev, [field]: val }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    await onSave('settings', {
      mealsPerType: Number(formData.mealsPerType),
      budgetDivisor: Number(formData.budgetDivisor),
      rateLimitPerHour: Number(formData.rateLimitPerHour),
      retryOnOverBudget: Boolean(formData.retryOnOverBudget),
      heroImageUrl: formData.heroImageUrl ? String(formData.heroImageUrl).trim() : '',
    });
    setSaving(false);
  }

  async function handleReset() {
    setResetting(true);
    await onReset('settings');
    setResetting(false);
  }

  const divisor = Number(formData.budgetDivisor) || 21;
  const sampleCap10k = formatNaira(Math.round(10000 / divisor));
  const sampleCap20k = formatNaira(Math.round(20000 / divisor));

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-fg">Recommendation &amp; Website Settings</h2>
        <p className="text-xs text-muted">
          Configure recommendation engine behavior, quota limits, and homepage hero image.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Hero Image Configuration */}
        <div className="rounded-xl border border-line bg-surface-muted p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <label htmlFor="setting-hero-image" className="text-sm font-semibold text-fg">
              Homepage Hero Image
            </label>
            <span className="text-[11px] text-muted">
              Displayed prominently on the ChopWise landing page
            </span>
          </div>

          <Input
            id="setting-hero-image"
            type="url"
            value={formData.heroImageUrl}
            onChange={(e) => handleChange('heroImageUrl', e.target.value)}
            placeholder="https://images.unsplash.com/... or paste image URL"
            className="w-full"
          />

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-medium text-muted">Quick Presets:</span>
            {HERO_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleChange('heroImageUrl', p.url)}
                className="rounded-md border border-field-line bg-surface px-2.5 py-1 text-xs text-fg hover:bg-surface-muted transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Image Live Preview */}
          {formData.heroImageUrl && !imageError && (
            <div className="relative aspect-video max-w-sm rounded-lg overflow-hidden border border-line shadow-xs">
              <img
                src={formData.heroImageUrl}
                alt="Hero section preview"
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
              <span className="absolute bottom-2 left-2 rounded bg-surface/90 px-2 py-0.5 text-[10px] font-medium text-fg backdrop-blur-xs">
                Live Preview
              </span>
            </div>
          )}
          {imageError && (
            <p className="text-xs text-danger-fg">
              Could not load image from this URL. Please verify the link.
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="setting-meals-per-type"
            label="Meals per type (1–3)"
            type="number"
            min="1"
            max="3"
            value={formData.mealsPerType}
            onChange={(e) => handleChange('mealsPerType', e.target.value)}
            required
          />

          <Input
            id="setting-budget-divisor"
            label="Budget Divisor (7–42)"
            type="number"
            min="7"
            max="42"
            value={formData.budgetDivisor}
            onChange={(e) => handleChange('budgetDivisor', e.target.value)}
            required
          />
        </div>

        {/* Live helper text for per-meal cap preview */}
        <div className="rounded-lg border border-line bg-surface-muted p-3 text-xs text-fg">
          <span className="font-semibold text-primary">Live per-meal cap preview:</span> For a
          ₦10,000/week budget, each meal cap is{' '}
          <strong className="text-fg">{sampleCap10k}</strong>. For ₦20,000/week, each cap is{' '}
          <strong className="text-fg">{sampleCap20k}</strong>.
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="setting-rate-limit"
            label="Rate Limit (requests per hour, 1–100)"
            type="number"
            min="1"
            max="100"
            value={formData.rateLimitPerHour}
            onChange={(e) => handleChange('rateLimitPerHour', e.target.value)}
            required
          />

          <div className="flex items-center justify-between rounded-lg border border-line p-3">
            <div>
              <span className="text-sm font-medium text-fg">Retry on over-budget</span>
              <p className="text-[11px] text-muted">
                Regenerate once if more than half of meals exceed budget cap.
              </p>
            </div>
            <input
              type="checkbox"
              checked={Boolean(formData.retryOnOverBudget)}
              onChange={(e) => handleChange('retryOnOverBudget', e.target.checked)}
              className="h-5 w-5 rounded border-field-line text-primary focus:ring-ring cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-line pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowResetConfirm(true)}
            disabled={resetting || saving}
            className="text-xs min-h-9 px-3"
          >
            {resetting ? <Spinner label="Resetting…" /> : 'Reset to defaults'}
          </Button>

          <Button
            type="submit"
            disabled={saving || resetting}
            className="text-xs min-h-9 px-4"
          >
            {saving ? <Spinner label="Saving…" /> : 'Save settings'}
          </Button>
        </div>
      </form>

      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={async () => {
          setShowResetConfirm(false);
          await handleReset();
        }}
        title="Reset Settings?"
        message="Are you sure you want to reset all recommendation settings and the hero image to their default values?"
        confirmText="Reset to defaults"
        variant="danger"
        icon="⚠️"
      />
    </Card>
  );
}
