import { useState } from 'react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Spinner from '@/components/Spinner';
import Badge from '@/components/Badge';
import { CURATED_NIGERIAN_MEALS } from './curatedMeals';
import { useAdminActions } from './useAdminActions';

export default function AiRecipeDraftBar({ onDrafted }) {
  const { run, pendingAction, error, setError } = useAdminActions();
  const [selectedCurated, setSelectedCurated] = useState('');
  const [mealName, setMealName] = useState('');
  const [mealType, setMealType] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isDrafting = pendingAction === 'draftRecipeWithAi';

  function handleCuratedChange(event) {
    const value = event.target.value;
    setSelectedCurated(value);
    setSuccessMessage('');
    setError('');
    const found = CURATED_NIGERIAN_MEALS.find((m) => m.name === value);
    if (found) {
      setMealName(found.name);
      setMealType(found.mealType);
      if (found.recipe) {
        onDrafted(found.recipe);
        setSuccessMessage(`✓ Auto-filled complete recipe for "${found.name}"! Review below and click "Save recipe".`);
      }
    }
  }

  async function handleDraft(event) {
    event.preventDefault();
    const name = mealName.trim();
    if (!name) {
      setError('Please choose a meal from the approved list or enter a meal name.');
      return;
    }
    setError('');
    setSuccessMessage('');
    const payload = { mealName: name, ...(mealType ? { mealType } : {}) };
    const result = await run('draftRecipeWithAi', payload);
    if (result?.recipe) {
      onDrafted(result.recipe);
      setSuccessMessage(`✓ Auto-filled recipe fields for "${result.recipe.name}" using Gemini AI & price table!`);
    }
  }

  return (
    <div className="mb-6 rounded-xl border border-line bg-surface-muted p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge>Quick Fill</Badge>
          <h3 className="text-sm font-semibold text-fg">Approved Nigerian Meals Library</h3>
        </div>
        <span className="text-xs text-muted">Select any dish below to instantly fill the entire form</span>
      </div>

      <div className="mb-4">
        <Select
          id="curated-meal-select"
          label="Choose an Authentic Nigerian Meal (Auto-fills form instantly)"
          value={selectedCurated}
          onChange={handleCuratedChange}
          disabled={isDrafting}
        >
          <option value="">— Select an approved Nigerian classic to auto-fill form —</option>
          <optgroup label="Breakfast">
            {CURATED_NIGERIAN_MEALS.filter((m) => m.mealType === 'breakfast').map((m) => (
              <option key={m.name} value={m.name}>
                {m.name} — {m.description}
              </option>
            ))}
          </optgroup>
          <optgroup label="Lunch">
            {CURATED_NIGERIAN_MEALS.filter((m) => m.mealType === 'lunch').map((m) => (
              <option key={m.name} value={m.name}>
                {m.name} — {m.description}
              </option>
            ))}
          </optgroup>
          <optgroup label="Dinner">
            {CURATED_NIGERIAN_MEALS.filter((m) => m.mealType === 'dinner').map((m) => (
              <option key={m.name} value={m.name}>
                {m.name} — {m.description}
              </option>
            ))}
          </optgroup>
        </Select>
      </div>

      <div className="border-t border-line/60 pt-3">
        <p className="mb-2 text-xs text-muted">Or type a custom dish name to generate with Gemini AI:</p>
        <form onSubmit={handleDraft} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            id="draft-meal-name"
            label="Meal Name or Custom Prompt"
            placeholder="e.g. Egusi Soup with Pounded Yam or Jollof Rice"
            value={mealName}
            onChange={(e) => {
              setMealName(e.target.value);
              setSuccessMessage('');
            }}
            disabled={isDrafting}
            maxLength={100}
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            id="draft-meal-type"
            label="Meal Type"
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            disabled={isDrafting}
          >
            <option value="">Auto-detect</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
          </Select>
        </div>
        <Button type="submit" disabled={isDrafting || !mealName.trim()} className="sm:min-w-36">
          {isDrafting ? <Spinner label="Drafting with AI…" /> : 'Draft with AI'}
        </Button>
      </form>
      </div>

      {error && (
        <p className="mt-3 rounded-lg border border-danger-line bg-danger-bg p-2.5 text-xs text-danger-fg">
          {error}
        </p>
      )}
      {successMessage && (
        <p className="mt-3 rounded-lg border border-line bg-primary-soft p-2.5 text-xs font-medium text-on-primary-soft">
          {successMessage}
        </p>
      )}
    </div>
  );
}
