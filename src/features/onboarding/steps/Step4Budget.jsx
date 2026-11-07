import Input from '../../../components/Input';
import { formatNaira } from '../../../lib/format';

const PRESET_BUDGETS = [10000, 20000, 35000, 50000];

export default function Step4Budget({ data, errors = {}, onChange }) {
  const budget = data.weeklyBudgetNGN;
  const numBudget = Number(budget) || 0;
  const perMealEst = numBudget > 0 ? Math.round(numBudget / 21) : 0;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-fg">Weekly Food Budget</h2>
        <p className="text-xs text-muted">
          We use this to recommend meals whose ingredients stay inside your budget.
        </p>
      </div>

      <div>
        <Input
          id="onboarding-budget"
          label="Weekly Budget (₦)"
          type="number"
          min="1000"
          max="500000"
          step="500"
          value={budget ?? ''}
          onChange={(e) =>
            onChange(
              'weeklyBudgetNGN',
              e.target.value === '' ? '' : Number(e.target.value)
            )
          }
          error={errors.weeklyBudgetNGN}
          placeholder="e.g. 20000"
          required
        />

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted">Quick presets:</span>
          {PRESET_BUDGETS.map((amount) => (
            <button
              type="button"
              key={amount}
              onClick={() => onChange('weeklyBudgetNGN', amount)}
              className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                numBudget === amount
                  ? 'border-field-line bg-primary-soft text-on-primary-soft'
                  : 'border-line bg-surface text-muted hover:bg-surface-muted'
              }`}
            >
              {formatNaira(amount)}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface-muted p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-fg">Estimated cap per meal</p>
            <p className="text-xs text-muted">Based on 21 meals per week</p>
          </div>
          <p className="text-lg font-bold text-primary">
            {perMealEst > 0 ? formatNaira(perMealEst) : '₦0'}
          </p>
        </div>
      </div>
    </div>
  );
}

