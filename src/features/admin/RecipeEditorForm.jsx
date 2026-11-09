import { useEffect, useState } from 'react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Spinner from '@/components/Spinner';

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
    ingredients: recipe.ingredients.map((item) =>
      `${item.item} | ${item.quantity} | ${item.unit} | ${item.estCostNGN}`
    ).join('\n'),
    steps: recipe.steps.join('\n'),
    suitableFor: recipe.suitableFor.join(', '),
    cautionNotes: recipe.cautionNotes,
    costNGN: String(recipe.costNGN),
    costSource: recipe.costSource,
    ...Object.fromEntries(NUTRIENTS.map(([key]) => [key, String(recipe.aiNutritionEstimate[key])])),
  };
}

function fromForm(form) {
  const ingredients = form.ingredients.split('\n').filter((line) => line.trim()).map((line) => {
    const [item, quantity, unit, estCostNGN] = line.split('|').map((part) => part.trim());
    return { item, quantity: Number(quantity), unit, estCostNGN: Number(estCostNGN) };
  });
  return {
    name: form.name.trim(),
    mealType: form.mealType,
    description: form.description.trim(),
    prepTimeMinutes: Number(form.prepTimeMinutes),
    ingredients,
    steps: form.steps.split('\n').map((step) => step.trim()).filter(Boolean),
    suitableFor: form.suitableFor.split(',').map((value) => value.trim()).filter(Boolean),
    cautionNotes: form.cautionNotes.trim(),
    aiNutritionEstimate: Object.fromEntries(NUTRIENTS.map(([key]) => [key, Number(form[key])])),
    costNGN: Number(form.costNGN),
    costSource: form.costSource,
  };
}

function TextAreaField({ id, label, value, onChange, help, required = false }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-fg">{label}</label>
      <textarea
        id={id}
        className="min-h-24 rounded-lg border border-field-line bg-surface px-3 py-2 text-sm text-fg placeholder:text-muted"
        value={value}
        onChange={onChange}
        required={required}
      />
      {help && <p className="text-xs text-muted">{help}</p>}
    </div>
  );
}

export default function RecipeEditorForm({ recipe, onSubmit, onCancel, pending }) {
  const [form, setForm] = useState(() => toForm(recipe));

  useEffect(() => {
    setForm(toForm(recipe));
  }, [recipe]);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(fromForm(form));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input id="recipe-name" label="Recipe name" value={form.name} onChange={(event) => updateField('name', event.target.value)} required maxLength={100} />
        <Select id="recipe-type" label="Meal type" value={form.mealType} onChange={(event) => updateField('mealType', event.target.value)}>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
        </Select>
        <Input id="recipe-prep" label="Preparation time (minutes)" type="number" min="1" value={form.prepTimeMinutes} onChange={(event) => updateField('prepTimeMinutes', event.target.value)} required />
        <Input id="recipe-cost" label="Estimated cost (₦)" type="number" min="0" step="0.01" value={form.costNGN} onChange={(event) => updateField('costNGN', event.target.value)} required />
        <Select id="recipe-cost-source" label="Cost source" value={form.costSource} onChange={(event) => updateField('costSource', event.target.value)}>
          <option value="table">Market price table</option>
          <option value="mixed">Mixed pricing</option>
          <option value="ai">AI estimate</option>
        </Select>
      </div>

      <TextAreaField
        id="recipe-description"
        label="Description"
        value={form.description}
        onChange={(event) => updateField('description', event.target.value)}
        required
      />
      <TextAreaField
        id="recipe-ingredients"
        label="Ingredients"
        value={form.ingredients}
        onChange={(event) => updateField('ingredients', event.target.value)}
        help="One ingredient per line: item | quantity | unit (g, ml, piece, tbsp, tsp, cup) | estimated cost in ₦."
        required
      />
      <TextAreaField
        id="recipe-steps"
        label="Preparation steps"
        value={form.steps}
        onChange={(event) => updateField('steps', event.target.value)}
        help="Enter one preparation step per line."
        required
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="recipe-suitable"
          label="Suitable-for tags"
          value={form.suitableFor}
          onChange={(event) => updateField('suitableFor', event.target.value)}
          help="Comma-separated: hypertension, diabetes, obesity, ulcer, general."
          required
        />
        <Input id="recipe-caution" label="Caution notes" value={form.cautionNotes} onChange={(event) => updateField('cautionNotes', event.target.value)} maxLength={500} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {NUTRIENTS.map(([key, label]) => (
          <Input
            key={key}
            id={`recipe-${key}`}
            label={label}
            type="number"
            min="0"
            step="0.1"
            value={form[key]}
            onChange={(event) => updateField(key, event.target.value)}
            required
          />
        ))}
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner label="Saving recipe…" /> : 'Save recipe'}
        </Button>
      </div>
    </form>
  );
}
