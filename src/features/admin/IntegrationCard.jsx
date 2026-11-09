import { useState } from 'react';
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
  const [fieldErrors, setFieldErrors] = useState({});

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

    const res = await onSave(integration.id, formValues);
    if (!res?.ok && res?.error?.details?.fields) {
      setFieldErrors(res.error.details.fields);
    }
    setSaving(false);
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

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onTest(integration.id)}
            disabled={isTesting || saving}
            className="text-xs min-h-9 px-3"
          >
            {isTesting ? <Spinner label="Testing…" /> : 'Test connection'}
          </Button>

          <Button
            type="submit"
            disabled={saving || isTesting}
            className="text-xs min-h-9 px-4"
          >
            {saving ? <Spinner label="Saving…" /> : 'Save settings'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

