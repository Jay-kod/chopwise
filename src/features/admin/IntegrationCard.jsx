import { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Input from '../../components/Input';
import Spinner from '../../components/Spinner';
import GeminiModelField from './GeminiModelField';

export default function IntegrationCard({
  integration,
  onSave,
  onTest,
  isTesting,
}) {
  const [formValues, setFormValues] = useState(() => {
    const initial = {};
    for (const f of integration.fields) {
      if (f.type === 'toggle') {
        initial[f.key] = Boolean(f.value);
      } else if (f.type === 'text') {
        initial[f.key] = f.value || '';
      } else {
        // secrets are write-only, start empty
        initial[f.key] = '';
      }
    }
    return initial;
  });

  const [saving, setSaving] = useState(false);
  const [localTesting, setLocalTesting] = useState(false);
  const [latestTest, setLatestTest] = useState(integration.lastTest || null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (integration.lastTest) {
      setLatestTest(integration.lastTest);
    }
  }, [integration.lastTest]);

  function handleChange(key, val) {
    setFormValues((prev) => ({ ...prev, [key]: val }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  async function handleSaveSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setFieldErrors({});
    setSaveError('');

    try {
      const res = await onSave(integration.id, formValues);
      if (!res?.ok) {
        if (res?.error?.details?.fields) setFieldErrors(res.error.details.fields);
        setSaveError(res?.error?.message || 'Could not save integration settings. Check the server configuration and try again.');
        return;
      }

      setFormValues((previous) => {
        const next = { ...previous };
        for (const field of integration.fields) {
          if (field.type === 'secret') next[field.key] = '';
        }
        return next;
      });
    } catch (error) {
      setSaveError(error?.message || 'Could not save integration settings. Check the server configuration and try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleTestClick() {
    setLocalTesting(true);
    try {
      const res = await onTest(integration.id, formValues);
      if (res) {
        setLatestTest(res);
      }
    } finally {
      setLocalTesting(false);
    }
  }

  function formatTime(isoStr) {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString();
    } catch {
      return isoStr;
    }
  }

  function getBadgeVariant(status) {
    switch (status) {
      case 'configured':
        return 'ok';
      case 'disabled':
        return 'warning';
      case 'not_configured':
      default:
        return 'neutral';
    }
  }

  const currentlyTesting = isTesting || localTesting;

  return (
    <Card id={`integration-${integration.id}`} className="p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-fg">{integration.title}</h3>
            <Badge variant={getBadgeVariant(integration.status)}>
              {integration.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted">{integration.description}</p>
        </div>
      </div>

      {/* How to get it instructions */}
      <div className="mt-4 rounded-xl border border-line bg-surface-muted p-4 text-xs text-fg space-y-3">
        <div className="font-semibold text-fg">How to get your credentials:</div>

        {/* Links */}
        {integration.helpLinks?.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {integration.helpLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary underline hover:text-primary-hover font-medium"
              >
                <span>{link.label}</span>
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        )}

        {/* Steps */}
        {integration.steps?.length > 0 && (
          <ol className="list-decimal space-y-1 pl-4 text-muted">
            {integration.steps.map((step, idx) => (
              <li key={idx} className="leading-relaxed">
                {step}
              </li>
            ))}
          </ol>
        )}

        {/* Notes */}
        {integration.notes?.length > 0 && (
          <div className="space-y-1 text-muted border-t border-line pt-2">
            {integration.notes.map((note, idx) => (
              <div key={idx} className="text-[11px] leading-relaxed">
                ℹ {note}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSaveSubmit} className="mt-5 space-y-4">
        {saveError && (
          <div
            role="alert"
            className="rounded-lg border border-danger-line bg-danger-bg p-3 text-sm text-danger-fg"
          >
            {saveError}
          </div>
        )}
        {integration.fields.map((field) => {
          if (field.type === 'toggle') {
            return (
              <div
                key={field.key}
                className="flex items-center justify-between rounded-lg border border-line p-3"
              >
                <div>
                  <span className="text-sm font-medium text-fg">{field.label}</span>
                  {field.help && <p className="text-xs text-muted">{field.help}</p>}
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(formValues[field.key])}
                  onChange={(e) => handleChange(field.key, e.target.checked)}
                  className="h-5 w-5 rounded border-field-line text-primary focus:ring-ring cursor-pointer"
                />
              </div>
            );
          }

          if (field.type === 'secret') {
            return (
              <div key={field.key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor={`field-${integration.id}-${field.key}`}
                    className="text-sm font-medium text-fg"
                  >
                    {field.label}
                  </label>
                  {field.configured && (
                    <span className="text-xs text-primary font-medium">
                      Configured ({field.masked})
                    </span>
                  )}
                </div>
                <Input
                  id={`field-${integration.id}-${field.key}`}
                  type="password"
                  autoComplete="off"
                  value={formValues[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={
                    field.configured
                      ? 'Leave blank to keep current secret'
                      : 'Paste new key here'
                  }
                  error={fieldErrors[field.key]}
                />
                {field.help && <p className="text-xs text-muted">{field.help}</p>}
              </div>
            );
          }

          if (integration.id === 'gemini' && field.key === 'model') {
            const apiKeyField = integration.fields.find((f) => f.key === 'apiKey');
            return (
              <GeminiModelField
                key={field.key}
                field={field}
                value={formValues[field.key]}
                onChange={(val) => handleChange(field.key, val)}
                error={fieldErrors[field.key]}
                apiKey={formValues.apiKey}
                isConfigured={Boolean(apiKeyField?.configured)}
              />
            );
          }

          return (
            <div key={field.key} className="space-y-1">
              <Input
                id={`field-${integration.id}-${field.key}`}
                label={field.label}
                type="text"
                value={formValues[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder="e.g. gemini-2.5-flash"
                error={fieldErrors[field.key]}
              />
              {field.help && <p className="text-xs text-muted">{field.help}</p>}
            </div>
          );
        })}

        {/* Live Testing Feedback */}
        {currentlyTesting && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-lg border border-line bg-surface-muted p-3.5 text-xs text-fg flex items-center gap-3 animate-pulse"
          >
            <Spinner label="Testing connection…" />
            <div className="flex-1">
              <div className="font-semibold text-fg">Verifying connection…</div>
              <div className="text-muted">
                Pinging {integration.title} with {formValues.apiKey || formValues.appId ? 'entered' : 'saved'} credentials…
              </div>
            </div>
          </div>
        )}

        {/* Connection Test Result Box */}
        {!currentlyTesting && latestTest && (
          <div
            role="region"
            aria-label="Connection test feedback"
            className={`rounded-lg border p-3.5 text-xs ${
              latestTest.ok
                ? 'border-line bg-primary-soft text-on-primary-soft'
                : 'border-danger-line bg-danger-bg text-danger-fg'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <span aria-hidden="true">{latestTest.ok ? '✓' : '✕'}</span>
                <span>{latestTest.ok ? 'Connection Verified' : 'Connection Test Failed'}</span>
              </div>
              {latestTest.latencyMs != null && (
                <span className="font-mono text-[11px] font-medium opacity-80">
                  ⚡ {latestTest.latencyMs} ms
                </span>
              )}
            </div>

            <p className="mt-1 leading-relaxed text-xs">
              {latestTest.message}
            </p>

            {latestTest.testedAt && (
              <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-[11px] opacity-75 border-t border-line/20 pt-1.5">
                <span>Last tested: {formatTime(latestTest.testedAt)}</span>
                {!latestTest.ok && !formValues.apiKey && !formValues.appId && (
                  <span className="italic">Enter your API credentials above, or save settings before testing.</span>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
          <Button
            type="button"
            variant="secondary"
            onClick={handleTestClick}
            disabled={currentlyTesting || saving}
            className="text-xs min-h-9 px-3"
          >
            {currentlyTesting ? <Spinner label="Testing…" /> : 'Test connection'}
          </Button>

          <Button
            type="submit"
            disabled={saving || currentlyTesting}
            className="text-xs min-h-9 px-4"
          >
            {saving ? <Spinner label="Saving…" /> : 'Save settings'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
