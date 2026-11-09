import { useCallback, useEffect, useState } from 'react';
import AppPageHeader from '../components/PageHeader';
import { AppShell } from '@/components/app-shell';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import Disclaimer from '../components/Disclaimer';
import { formatNaira } from '../lib/format';
import { apiClient } from '../lib/apiClient';
import { ROUTES } from '../lib/routes';

const PAGE_SIZE = 25;

function RecipeCard({ item }) {
  const { recipe } = item;
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Badge>{recipe.mealType}</Badge>
          <h2 className="text-lg font-semibold text-fg">{recipe.name}</h2>
        </div>
        <span className="shrink-0 font-semibold text-primary">{formatNaira(recipe.costNGN)}</span>
      </div>
      <p className="text-sm text-muted">{recipe.description}</p>
      <p className="text-xs text-muted">Preparation: {recipe.prepTimeMinutes} minutes</p>
      {recipe.suitableFor.length > 0 && (
        <p className="text-xs text-muted">Suitable-for tags: {recipe.suitableFor.join(', ')}</p>
      )}
      {recipe.cautionNotes && (
        <p className="rounded-lg border border-warn-line bg-warn-bg p-3 text-xs text-warn-fg">
          Caution: {recipe.cautionNotes}
        </p>
      )}
      <details className="border-t border-line pt-3">
        <summary className="cursor-pointer text-sm font-medium text-primary">View ingredients and steps</summary>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-fg">Ingredients</h3>
            <ul className="list-disc pl-5 text-sm text-muted">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={`${ingredient.item}-${index}`}>
                  {ingredient.quantity} {ingredient.unit} {ingredient.item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-fg">Preparation</h3>
            <ol className="list-decimal pl-5 text-sm text-muted">
              {recipe.steps.map((step, index) => <li key={index}>{step}</li>)}
            </ol>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted">
          Nutrition estimates: {recipe.aiNutritionEstimate.calories} kcal, {recipe.aiNutritionEstimate.proteinG} g protein.
        </p>
      </details>
    </Card>
  );
}

export default function RecipeCatalog() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient('/api/catalog', { action: 'list', search, offset, limit: PAGE_SIZE });
      setItems(response.items);
      setTotal(response.total);
    } catch (requestError) {
      setError(requestError.message || 'The recipe catalogue could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [offset, search]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  function searchCatalog(event) {
    event.preventDefault();
    setOffset(0);
    setSearch(searchInput.trim());
  }

  const pageNumber = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AppShell pathname={ROUTES.customer.recipes}>
      <div className="flex flex-col gap-6">
        <AppPageHeader
          title="Recipe Catalogue"
          description="Browse shared Nigerian recipes curated by ChopWise administrators. Personalized meal plans are managed separately."
        />
        <form onSubmit={searchCatalog} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            id="catalog-search"
            label="Search recipes"
            placeholder="Recipe name or ingredient"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            maxLength={100}
          />
          <Button type="submit" disabled={loading} className="sm:min-w-28">Search</Button>
        </form>

        {error && <ErrorState message={error} onRetry={loadCatalog} />}
        {loading ? (
          <div className="flex justify-center p-8"><Spinner label="Loading recipes…" /></div>
        ) : items.length === 0 ? (
          <EmptyState
            title={search ? 'No matching recipes' : 'No catalogue recipes yet'}
            message={search ? 'Try another search.' : 'The admin team has not published any shared recipes yet.'}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => <RecipeCard key={item.id} item={item} />)}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-line pt-4 text-sm text-muted">
          <span>{total} recipes</span>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))} disabled={loading || offset === 0} className="min-h-9 px-3 text-xs">
              Previous
            </Button>
            <span>Page {pageNumber} of {pageCount}</span>
            <Button variant="secondary" onClick={() => setOffset(offset + PAGE_SIZE)} disabled={loading || offset + PAGE_SIZE >= total} className="min-h-9 px-3 text-xs">
              Next
            </Button>
          </div>
        </div>
        <Disclaimer />
      </div>
    </AppShell>
  );
}
