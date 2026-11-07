import Input from '../../../components/Input';
import { PREFERENCES } from '../schema';

export default function Step3Preferences({ data, errors = {}, onChange }) {
  const selected = new Set(data.preferences || []);

  function toggle(id) {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onChange('preferences', Array.from(next));
  }

  const avoidText = data.avoidText || '';

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-fg">Dietary Preferences</h2>
        <p className="text-xs text-muted">
          Select preferences to shape the kinds of Nigerian recipes recommended.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PREFERENCES.map((pref) => {
          const isSelected = selected.has(pref.id);
          return (
            <button
              type="button"
              key={pref.id}
              onClick={() => toggle(pref.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors border min-h-9 ${
                isSelected
                  ? 'border-field-line bg-primary-soft text-on-primary-soft'
                  : 'border-line bg-surface text-fg hover:bg-surface-muted'
              }`}
              aria-pressed={isSelected}
            >
              {isSelected ? '✓ ' : ''}
              {pref.label}
            </button>
          );
        })}
      </div>

      <div className="pt-2">
        <div className="flex items-center justify-between">
          <label htmlFor="onboarding-avoid" className="text-sm font-medium text-fg">
            Ingredients or items to avoid (optional)
          </label>
          <span className="text-xs text-muted">{avoidText.length}/100</span>
        </div>
        <Input
          id="onboarding-avoid"
          type="text"
          maxLength={100}
          value={avoidText}
          onChange={(e) => onChange('avoidText', e.target.value)}
          placeholder="e.g. no groundnuts, allergic to shellfish"
          error={errors.avoidText}
          className="mt-1"
        />
        <p className="mt-1 text-xs text-muted">
          Specific ingredients or personal food allergies to exclude from recommendations.
        </p>
      </div>
    </div>
  );
}

