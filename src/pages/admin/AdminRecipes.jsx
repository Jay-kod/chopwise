import { useCallback, useEffect, useState } from 'react';
import AdminPageHeader from './AdminPageHeader';
import RecipeEditorForm from '@/features/admin/RecipeEditorForm';
import { useAdminActions } from '@/features/admin/useAdminActions';
import { useNotifications } from '@/features/notifications/NotificationContext';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Spinner from '@/components/Spinner';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import ConfirmModal from '@/components/ConfirmModal';
import { formatNaira } from '@/lib/format';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

const PAGE_SIZE = 25;

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : '—';
}

export default function AdminRecipes() {
  const { run, pendingAction, error, setError } = useAdminActions();
  const { addNotification } = useNotifications();
  const [recipes, setRecipes] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadRecipes = useCallback(async () => {
    setLoading(true);
    const data = await run('listRecipes', { search, offset, limit: PAGE_SIZE });
    if (data) {
      setRecipes(data.items);
      setTotal(data.total);
    }
    setLoading(false);
  }, [offset, run, search]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  async function saveRecipe(recipe) {
    const action = editingRecipe ? 'updateRecipe' : 'createRecipe';
    const payload = editingRecipe ? { id: editingRecipe.id, recipe } : { recipe };
    const result = await run(action, payload);
    if (result) {
      setShowForm(false);
      setEditingRecipe(null);
      await loadRecipes();
      addNotification({
        type: 'meal',
        title: editingRecipe ? 'Recipe Updated' : 'Recipe Published',
        message: `"${recipe.name}" was ${editingRecipe ? 'updated' : 'added to the catalogue'}.`,
        href: '/admin/recipes',
        icon: '🍲',
      });
    }
  }

  async function removeRecipe() {
    if (!deleteTarget) return;
    const name = deleteTarget.recipe?.name || 'Recipe';
    const result = await run('deleteRecipe', { id: deleteTarget.id });
    if (result) {
      setDeleteTarget(null);
      await loadRecipes();
      addNotification({
        type: 'meal',
        title: 'Recipe Deleted',
        message: `"${name}" was deleted from the catalogue.`,
        href: '/admin/recipes',
        icon: '🗑️',
      });
    }
  }

  function beginCreate() {
    setError('');
    setEditingRecipe(null);
    setShowForm(true);
  }

  function beginEdit(item) {
    setError('');
    setEditingRecipe(item);
    setShowForm(true);
  }

  function searchRecipes(event) {
    event.preventDefault();
    setOffset(0);
    setSearch(searchInput.trim());
  }

  const pageNumber = Math.floor(offset / PAGE_SIZE) + 1;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Shared Recipe Catalogue"
        description="Create, update, and remove recipes customers can browse. These entries do not replace personalized Gemini recommendations."
        actions={<Button onClick={beginCreate}>Add recipe</Button>}
      />

      {showForm && (
        <Card>
          <div className="mb-4 flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-fg">{editingRecipe ? 'Edit recipe' : 'Add recipe'}</h2>
            <p className="text-sm text-muted">
              Recipe costs are estimates for the ingredients, not prices charged to customers.
            </p>
          </div>
          <RecipeEditorForm
            key={editingRecipe?.id || 'new-recipe'}
            recipe={editingRecipe?.recipe || null}
            onSubmit={saveRecipe}
            onCancel={() => {
              setShowForm(false);
              setEditingRecipe(null);
            }}
            pending={pendingAction === 'createRecipe' || pendingAction === 'updateRecipe'}
          />
        </Card>
      )}

      <Card>
        <form onSubmit={searchRecipes} className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            id="recipe-search"
            label="Search catalogue"
            placeholder="Recipe name or ingredient"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            maxLength={100}
          />
          <Button type="submit" disabled={loading} className="sm:min-w-28">Search</Button>
        </form>

        {error && <ErrorState message={error} onRetry={loadRecipes} className="mb-4" />}
        {loading ? (
          <div className="flex justify-center p-8"><Spinner label="Loading catalogue…" /></div>
        ) : recipes.length === 0 ? (
          <EmptyState
            title={search ? 'No matching recipes' : 'Catalogue is empty'}
            message={search ? 'Try another search.' : 'Add a validated recipe to make it available to customers.'}
            action={!search && <Button onClick={beginCreate}>Add first recipe</Button>}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipe</TableHead>
                <TableHead>Meal type</TableHead>
                <TableHead>Estimated ingredient cost</TableHead>
                <TableHead>Last updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipes.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-fg">{item.recipe.name}</TableCell>
                  <TableCell className="capitalize">{item.recipe.mealType}</TableCell>
                  <TableCell>
                    {formatNaira(item.recipe.costNGN)}
                  </TableCell>
                  <TableCell>{formatDate(item.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="secondary" onClick={() => beginEdit(item)} className="min-h-9 px-3 text-xs">
                        Edit
                      </Button>
                      <Button type="button" variant="danger" onClick={() => setDeleteTarget(item)} className="min-h-9 px-3 text-xs">
                        Remove
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-sm text-muted">
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
      </Card>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={removeRecipe}
        title="Remove this recipe?"
        message="This permanently removes the catalogue entry."
        confirmText="Remove recipe"
        variant="danger"
        loading={pendingAction === 'deleteRecipe'}
      />
    </div>
  );
}
