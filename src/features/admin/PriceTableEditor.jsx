import { useState, useEffect, useMemo } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Spinner from '../../components/Spinner';
import ConfirmModal from '../../components/ConfirmModal';
import { formatNaira } from '../../lib/format';

const UNITS = ['100g', '100ml', 'piece'];

export default function PriceTableEditor({ prices, onSave, onReset }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (prices?.items) {
      setItems(prices.items.map((i) => ({ ...i })));
    }
  }, [prices]);

  function handleItemChange(index, field, val) {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  }

  function handleAddRow() {
    setItems((prev) => [
      { item: '', unit: '100g', priceNGN: null },
      ...prev,
    ]);
  }

  function handleRemoveRow(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    // Sanitize items: trim strings, parse numbers or null
    const sanitized = items
      .filter((i) => i.item.trim() !== '')
      .map((i) => ({
        item: i.item.trim().toLowerCase(),
        unit: i.unit,
        priceNGN:
          i.priceNGN === '' || i.priceNGN === null || Number.isNaN(Number(i.priceNGN))
            ? null
            : Number(i.priceNGN),
      }));

    await onSave('prices', { items: sanitized });
    setSaving(false);
  }

  async function handleReset() {
    setResetting(true);
    await onReset('prices');
    setResetting(false);
  }

  const pricedCount = items.filter((i) => i.priceNGN !== null && i.priceNGN !== '').length;
  const totalCount = items.length;
  const unpricedCount = totalCount - pricedCount;

  // Filter for display based on search
  const filteredIndices = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return items.map((_, idx) => idx);
    return items
      .map((item, idx) => (item.item.toLowerCase().includes(q) ? idx : -1))
      .filter((idx) => idx !== -1);
  }, [items, search]);

  return (
    <Card className="p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-fg">Ingredient Price Table</h2>
          <p className="text-xs text-muted">
            Standard market prices for Nigerian ingredients used to compute deterministic meal budgets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" onClick={handleAddRow} className="text-xs min-h-9 px-3">
            + Add ingredient
          </Button>
        </div>
      </div>

      {/* Counter & Warning banner */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-fg">
          <span>
            Pricing Progress: <strong className="text-primary">{pricedCount} of {totalCount} priced</strong>
          </span>
          {prices?.updatedAt && (
            <span className="text-[11px] text-muted">
              Last saved: {new Date(prices.updatedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {unpricedCount > 0 && (
          <div className="rounded-lg border border-warn-line bg-warn-bg p-3 text-xs text-warn-fg">
            ⚠ Warning: {unpricedCount} ingredient{unpricedCount > 1 ? 's have' : ' has'} no price set (null). Any recipe using these items will fall back to AI cost estimates.
          </div>
        )}
      </div>

      {/* Search Filter */}
      <div className="mb-4">
        <Input
          id="price-search"
          type="search"
          placeholder="Filter ingredients by name (e.g. egusi, palm oil, yam)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-xs"
        />
      </div>

      {/* Responsive table container */}
      <div className="max-h-[380px] overflow-y-auto overflow-x-auto rounded-lg border border-line">
        <table className="w-full text-left text-xs text-fg">
          <thead className="sticky top-0 bg-surface-muted border-b border-line">
            <tr>
              <th className="p-2.5 font-medium">Ingredient Name</th>
              <th className="p-2.5 font-medium">Standard Unit</th>
              <th className="p-2.5 font-medium">Price in Naira (₦)</th>
              <th className="p-2.5 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-surface">
            {filteredIndices.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-6 text-center text-muted">
                  No matching ingredients found.
                </td>
              </tr>
            ) : (
              filteredIndices.map((realIdx) => {
                const item = items[realIdx];
                return (
                  <tr key={realIdx} className="hover:bg-surface-muted">
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.item}
                        onChange={(e) => handleItemChange(realIdx, 'item', e.target.value)}
                        placeholder="Ingredient name"
                        className="w-full rounded border border-field-line bg-surface px-2 py-1.5 text-xs text-fg"
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={item.unit}
                        onChange={(e) => handleItemChange(realIdx, 'unit', e.target.value)}
                        className="rounded border border-field-line bg-surface px-2 py-1.5 text-xs text-fg cursor-pointer"
                      >
                        {UNITS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        <span className="text-muted">₦</span>
                        <input
                          type="number"
                          min="0"
                          step="10"
                          value={item.priceNGN ?? ''}
                          onChange={(e) =>
                            handleItemChange(
                              realIdx,
                              'priceNGN',
                              e.target.value === '' ? null : Number(e.target.value)
                            )
                          }
                          placeholder="null (AI fallback)"
                          className="w-full rounded border border-field-line bg-surface px-2 py-1.5 text-xs text-fg"
                        />
                      </div>
                    </td>
                    <td className="p-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(realIdx)}
                        className="rounded p-1 text-danger-fg hover:bg-danger-bg"
                        title="Remove row"
                        aria-label={`Remove ${item.item || 'row'}`}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setShowResetConfirm(true)}
          disabled={resetting || saving}
          className="text-xs min-h-9 px-3"
        >
          {resetting ? <Spinner label="Resetting…" /> : 'Reset to seed list'}
        </Button>

        <Button
          type="button"
          onClick={handleSave}
          disabled={saving || resetting}
          className="text-xs min-h-9 px-4"
        >
          {saving ? <Spinner label="Saving…" /> : 'Save price table'}
        </Button>
      </div>

      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={async () => {
          setShowResetConfirm(false);
          await handleReset();
        }}
        title="Reset Price Table?"
        message="Are you sure you want to reset all ingredient prices to the initial seed list? Custom prices will be lost."
        confirmText="Reset to seed list"
        variant="danger"
        icon="⚠️"
      />
    </Card>
  );
}

