import { CONDITIONS } from '../schema';

export default function Step2Conditions({ data, onChange }) {
  const selected = new Set(data.conditions || []);

  function toggle(id) {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onChange('conditions', Array.from(next));
  }

  function clearAll() {
    onChange('conditions', []);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-fg">Health & Medical Conditions</h2>
        <p className="text-xs text-muted">
          Select any conditions you are managing so ChopWise can apply medical dietary constraints.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {CONDITIONS.map((cond) => {
          const isChecked = selected.has(cond.id);
          return (
            <button
              type="button"
              key={cond.id}
              onClick={() => toggle(cond.id)}
              className={`flex flex-col items-start rounded-xl border p-4 text-left transition-colors min-h-11 ${
                isChecked
                  ? 'border-field-line bg-primary-soft text-on-primary-soft'
                  : 'border-line bg-surface text-fg hover:bg-surface-muted'
              }`}
              aria-pressed={isChecked}
            >
              <div className="flex w-full items-center justify-between">
                <span className="font-medium text-sm">{cond.label}</span>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-md border text-xs ${
                    isChecked
                      ? 'border-primary bg-primary text-on-primary'
                      : 'border-field-line bg-surface'
                  }`}
                  aria-hidden="true"
                >
                  {isChecked ? '✓' : ''}
                </span>
              </div>
              <span className="mt-1 text-xs opacity-80">{cond.desc}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={clearAll}
          className="text-xs text-muted underline hover:text-fg"
        >
          I don't have any of these conditions
        </button>
        {selected.size > 0 && (
          <span className="text-xs text-primary font-medium">
            {selected.size} condition{selected.size > 1 ? 's' : ''} selected
          </span>
        )}
      </div>
    </div>
  );
}

