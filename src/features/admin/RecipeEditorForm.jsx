import { useEffect, useState } from 'react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Spinner from '@/components/Spinner';
import AiRecipeDraftBar from './AiRecipeDraftBar';
import { useAdminActions } from './useAdminActions';

const NUTRIENTS = [
  ['calories', 'Calories (kcal)'],
  ['proteinG', 'Protein (g)'],
  ['carbsG', 'Carbohydrates (g)'],
  ['fatG', 'Fat (g)'],
  ['sodiumMg', 'Sodium (mg)'],
  ['sugarG', 'Sugar (g)'],
];

function toForm(recipe) {
  if (!recipe) {
    return {
      name: '', mealType: 'lunch', description: '', prepTimeMinutes: '',
      ingredients: '', steps: '', suitableFor: 'general', cautionNotes: '',
      costNGN: '', costSource: 'table',
      calories: '', proteinG: '', carbsG: '', fatG: '', sodiumMg: '', sugarG: '',
    };
  }
  return {
    name: recipe.name,
    mealType: recipe.mealType,
    description: recipe.description,
    prepTimeMinutes: String(recipe.prepTimeMinutes),
    ingredients: (recipe.ingredients || []).map((i) =>
      `${i.item} | ${i.quantity} | ${i.unit} | ${i.estCostNGN}`
    ).join('\n'),
    steps: (recipe.steps || []).join('\n'),
    suitableFor: (recipe.suitableFor || []).join(', '),
    cautionNotes: recipe.cautionNotes || '',
    costNGN: String(recipe.costNGN ?? ''),
    costSource: recipe.costSource || 'table',
    ...Object.fromEntries(NUTRIENTS.map(([k]) => [k, String(recipe.aiNutritionEstimate?.[k] ?? '')])),
  };
}

function fromForm(form) {
  const ingredients = form.ingredients.split('\n').filter((l) => l.trim()).map((l) => {
    const [item, quantity, unit, estCostNGN] = l.split('|').map((p) => p.trim());
    return { item, quantity: Number(quantity), unit, estCostNGN: Number(estCostNGN) };
  });
  return {
    name: form.name.trim(),
    mealType: form.mealType,
    description: form.description.trim(),
    prepTimeMinutes: Number(form.prepTimeMinutes),
    ingredients,
    steps: form.steps.split('\n').map((s) => s.trim()).filter(Boolean),
    suitableFor: form.suitableFor.split(',').map((v) => v.trim()).filter(Boolean),
    cautionNotes: form.cautionNotes.trim(),
    aiNutritionEstimate: Object.fromEntries(NUTRIENTS.map(([k]) => [k, Number(form[k])])),
    costNGN: Number(form.costNGN),
    costSource: form.costSource,
  };
}

function TextAreaField({ id, label, value, onChange, help, required = false, maxLength }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-fg">{label}</label>
      <textarea
        id={id}
        className="min-h-24 rounded-lg border border-field-line bg-surface px-3 py-2 text-sm text-fg placeholder:text-muted"
        value={value}
        onChange={onChange}
        required={required}
        maxLength={maxLength}
      />
      {help && <p className="text-xs text-muted">{help}</p>}
    </div>
  );
}

export default function RecipeEditorForm({ recipe, onSubmit, onCancel, pending }) {
  const [form, setForm] = useState(() => toForm(recipe));
  const [nutritionSource, setNutritionSource] = useState(null);
  const { run, pendingAction, error: usdaError, setError: setUsdaError } = useAdminActions();

  useEffect(() => {
    setForm(toForm(recipe));
    setNutritionSource(null);
  }, [recipe]);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleAnalyzeUsda() {
    setUsdaError('');
    const rawLines = form.ingredients.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!rawLines.length) {
      setUsdaError('Please enter ingredients before analyzing nutrition.');
      return;
    }
    const ingredients = rawLines.map((l) => {
      const [item, quantity, unit] = l.split('|').map((p) => (p || '').trim());
      return { item: item || 'ingredient', quantity: Number(quantity) || 1, unit: unit || 'g' };
    });
    const res = await run('analyzeRecipeNutrition', { title: form.name || 'Nigerian Meal', ingredients });
    if (res?.nutrition) {
      setNutritionSource('usda');
      setForm((cur) => ({
        ...cur,
        calories: String(res.nutrition.calories),
        proteinG: String(res.nutrition.proteinG),
        carbsG: String(res.nutrition.carbsG),
        fatG: String(res.nutrition.fatG),
        sodiumMg: String(res.nutrition.sodiumMg),
        sugarG: String(res.nutrition.sugarG),
      }));
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(fromForm(form)); }} className="flex flex-col gap-4">
      <AiRecipeDraftBar onDrafted={(drafted) => { setForm(toForm(drafted)); setNutritionSource(null); }} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input id="recipe-name" label="Recipe name" value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
        <Select id="recipe-type" label="Meal type" value={form.mealType} onChange={(e) => updateField('mealType', e.target.value)}>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
        </Select>
        <Input id="recipe-prep" label="Preparation time (minutes)" type="number" min="1" value={form.prepTimeMinutes} onChange={(e) => updateField('prepTimeMinutes', e.target.value)} required />
        <Input id="recipe-cost" label="Estimated ingredient cost (₦)" type="number" min="0" step="0.01" value={form.costNGN} onChange={(e) => updateField('costNGN', e.target.value)} required />
        <Select id="recipe-cost-source" label="Cost source" value={form.costSource} onChange={(e) => updateField('costSource', e.target.value)}>
          <option value="table">Market price table</option>
          <option value="mixed">Mixed pricing</option>
          <option value="ai">AI estimate</option>
        </Select>
      </div>

      <TextAreaField id="recipe-description" label="Description" value={form.description} onChange={(e) => updateField('description', e.target.value)} help="Keep to 160 chars or fewer." maxLength={160} required />
      <TextAreaField id="recipe-ingredients" label="Ingredients" value={form.ingredients} onChange={(e) => updateField('ingredients', e.target.value)} help="One ingredient per line: item | quantity | unit | estimated cost in ₦." required />
      <TextAreaField id="recipe-steps" label="Preparation steps" value={form.steps} onChange={(e) => updateField('steps', e.target.value)} help="Enter one preparation step per line." required />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Input id="recipe-suitable" label="Suitable-for tags" value={form.suitableFor} onChange={(e) => updateField('suitableFor', e.target.value)} required />
          <p className="text-xs text-muted">Comma-separated: hypertension, diabetes, obesity, ulcer, general.</p>
        </div>
        <Input id="recipe-caution" label="Caution notes" value={form.cautionNotes} onChange={(e) => updateField('cautionNotes', e.target.value)} />
      </div>

      <div className="rounded-lg border border-line bg-surface-muted p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-fg">Nutrition Estimates (per serving)</h3>
            {nutritionSource === 'usda' && (
              <p className="text-xs text-muted">
                Source:{' '}
                <a href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline">
                  USDA FoodData Central
                </a>
              </p>
            )}
          </div>
          <Button type="button" variant="secondary" onClick={handleAnalyzeUsda} disabled={pendingAction === 'analyzeRecipeNutrition' || !form.ingredients.trim()}>
            {pendingAction === 'analyzeRecipeNutrition' ? <Spinner label="Analyzing…" /> : 'Analyze with USDA'}
          </Button>
        </div>
        {usdaError && (
          <p className="mb-3 rounded-lg border border-warn-line bg-warn-bg p-2 text-xs text-warn-fg">
            {usdaError}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          {NUTRIENTS.map(([k, label]) => (
            <Input key={k} id={`recipe-${k}`} label={label} type="number" min="0" step="0.1" value={form[k]} onChange={(e) => updateField(k, e.target.value)} required />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel} disabled={pending}>Cancel</Button>}
        <Button type="submit" disabled={pending}>{pending ? <Spinner label="Saving recipe…" /> : 'Save recipe'}</Button>
      </div>
    </form>
  );
}
