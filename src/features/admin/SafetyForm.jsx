import { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Spinner from '../../components/Spinner';

export default function SafetyForm({ safety, onSave, onReset }) {
  const [formData, setFormData] = useState({
    hypertensionSodiumMg: 700,
    diabetesSugarG: 15,
    diabetesCarbsG: 90,
    obesityCalories: 700,
  });
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (safety) {
      setFormData({
        hypertensionSodiumMg: safety.hypertensionSodiumMg ?? 700,
        diabetesSugarG: safety.diabetesSugarG ?? 15,
        diabetesCarbsG: safety.diabetesCarbsG ?? 90,
        obesityCalories: safety.obesityCalories ?? 700,
      });
    }
  }, [safety]);

  function handleChange(field, val) {
    setFormData((prev) => ({ ...prev, [field]: val }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    await onSave('safety', {
      hypertensionSodiumMg: Number(formData.hypertensionSodiumMg),
      diabetesSugarG: Number(formData.diabetesSugarG),
      diabetesCarbsG: Number(formData.diabetesCarbsG),
      obesityCalories: Number(formData.obesityCalories),
    });
    setSaving(false);
  }

  async function handleReset() {
    setResetting(true);
    await onReset('safety');
    setResetting(false);
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-fg">Safety Thresholds</h2>
        <p className="text-xs text-muted">
          Per-meal nutrient thresholds that trigger condition warning badges.
        </p>
        <div className="mt-2 rounded-lg border border-warn-line bg-warn-bg p-2.5 text-xs text-warn-fg">
          ⚠ Note: These are heuristic thresholds, not clinical advice. Consult a doctor or dietitian.
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="safety-hypertension-sodium"
            label="Hypertension Max Sodium (mg)"
            type="number"
            min="0"
            value={formData.hypertensionSodiumMg}
            onChange={(e) => handleChange('hypertensionSodiumMg', e.target.value)}
            required
          />

          <Input
            id="safety-diabetes-sugar"
            label="Diabetes Max Added Sugar (g)"
            type="number"
            min="0"
            value={formData.diabetesSugarG}
            onChange={(e) => handleChange('diabetesSugarG', e.target.value)}
            required
          />

          <Input
            id="safety-diabetes-carbs"
            label="Diabetes Max Carbs (g)"
            type="number"
            min="0"
            value={formData.diabetesCarbsG}
            onChange={(e) => handleChange('diabetesCarbsG', e.target.value)}
            required
          />

          <Input
            id="safety-obesity-calories"
            label="Obesity Max Calories (kcal)"
            type="number"
            min="0"
            value={formData.obesityCalories}
            onChange={(e) => handleChange('obesityCalories', e.target.value)}
            required
          />
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
            {saving ? <Spinner label="Saving…" /> : 'Save thresholds'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

