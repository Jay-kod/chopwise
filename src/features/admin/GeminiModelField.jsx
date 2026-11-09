import { useState } from 'react';
import Select from '../../components/Select';
import Input from '../../components/Input';
import Spinner from '../../components/Spinner';
import { useGeminiModels } from './useGeminiModels';

const DEFAULT_MODELS = [
  { id: 'gemini-2.5-flash', displayName: 'Gemini 2.5 Flash', tag: 'Recommended' },
  { id: 'gemini-2.0-flash', displayName: 'Gemini 2.0 Flash', tag: 'Fast' },
  { id: 'gemini-1.5-flash', displayName: 'Gemini 1.5 Flash', tag: 'Stable' },
  { id: 'gemini-2.5-pro', displayName: 'Gemini 2.5 Pro', tag: 'Complex reasoning' },
  { id: 'gemini-1.5-pro', displayName: 'Gemini 1.5 Pro', tag: 'Legacy pro' },
];

/**
 * Intelligent model selector for Google Gemini API integration.
 * Fetches available models from Gemini live when an API key is provided.
 */
export default function GeminiModelField({
  field,
  value,
  onChange,
  error,
  apiKey,
  isConfigured,
}) {
  const [manualMode, setManualMode] = useState(false);

  const { models, loading, error: fetchError, fetchModels } = useGeminiModels({
    apiKey,
    isConfigured,
    currentModel: value,
    onModelChange: onChange,
  });

  const activeModels = models.length > 0 ? models : DEFAULT_MODELS;
  const isLive = models.length > 0;

  function renderOptionLabel(m) {
    const namePart = m.displayName && m.displayName !== m.id ? `${m.displayName} (${m.id})` : m.id;
    return m.tag ? `${namePart} — [${m.tag}]` : namePart;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <label htmlFor={`field-gemini-${field.key}`} className="text-sm font-medium text-fg">
          {field.label}
        </label>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="font-medium text-primary">
              ✓ {models.length} live models
            </span>
          )}
          <button
            type="button"
            onClick={() => fetchModels()}
            disabled={loading || (!apiKey && !isConfigured)}
            className="font-medium text-primary underline hover:opacity-80 disabled:opacity-40 disabled:no-underline"
          >
            {loading ? 'Fetching…' : '↻ Fetch models'}
          </button>
          <span className="text-muted">|</span>
          <button
            type="button"
            onClick={() => setManualMode(!manualMode)}
            className="font-medium text-muted hover:text-fg underline"
          >
            {manualMode ? 'Use dropdown' : 'Manual entry'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-muted p-2.5 text-xs text-fg">
          <Spinner label="Querying Gemini models…" />
          <span>Listing available models from your Gemini account…</span>
        </div>
      )}

      {fetchError && !loading && (
        <div className="flex items-start justify-between gap-2 rounded-lg border border-danger-line bg-danger-bg p-2.5 text-xs text-danger-fg">
          <div>
            <span className="font-semibold">Unable to fetch models:</span> {fetchError}
          </div>
          <button
            type="button"
            onClick={() => fetchModels()}
            className="shrink-0 font-medium underline hover:opacity-80"
          >
            Retry
          </button>
        </div>
      )}

      {manualMode ? (
        <Input
          id={`field-gemini-${field.key}`}
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. gemini-2.5-flash"
          error={error}
        />
      ) : (
        <Select
          id={`field-gemini-${field.key}`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
          error={error}
        >
          {value && !activeModels.some((m) => m.id === value) && (
            <option value={value}>Current: {value}</option>
          )}
          {activeModels.map((m) => (
            <option key={m.id} value={m.id}>
              {renderOptionLabel(m)}
            </option>
          ))}
        </Select>
      )}

      <p className="text-xs text-muted">
        {isLive
          ? 'Live models queried directly from your Gemini API account.'
          : 'Input an API key above to automatically query live available models from your Gemini account.'}
      </p>
    </div>
  );
}

