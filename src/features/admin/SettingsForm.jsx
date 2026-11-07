import { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Spinner from '../../components/Spinner';
import { formatNaira } from '../../lib/format';

export default function SettingsForm({ settings, onSave, onReset }) {
  const [formData, setFormData] = useState({
    mealsPerType: 2,
    budgetDivisor: 21,
    rateLimitPerHour: 10,
    retryOnOverBudget: true,
  });
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        mealsPerType: settings.mealsPerType ?? 2,
        budgetDivisor: settings.budgetDivisor ?? 21,
        rateLimitPerHour: settings.rateLimitPerHour ?? 10,
        retryOnOverBudget: settings.retryOnOverBudget !== false,
      });
    }
  }, [settings]);

  function handleChange(field, val) {
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
        <h2 className="text-lg font-bold text-fg">Recommendation Settings</h2>
        <p className="text-xs text-muted">
          Configure recommendation engine behavior, quota limits, and budget calculation rules.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
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
            onClick={handleReset}
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
    </Card>
  );
}
