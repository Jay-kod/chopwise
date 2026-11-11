import { useState, useEffect } from 'react';
import Spinner from '../../components/Spinner';
import ErrorState from '../../components/ErrorState';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { apiClient } from '../../lib/apiClient';
import SafetyBadge from './SafetyBadge';

/**
 * Displays USDA FoodData Central nutrition data or an AI estimate.
 * Follows docs/AI_AND_NUTRITION_SPEC.md and docs/UI_GUIDELINES.md.
 * @param {{ mealId: string }} props
 */
export default function NutritionPanel({ mealId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);

  async function loadNutrition(forceRefresh = false) {
    if (!mealId) return;
    try {
      if (forceRefresh) {
        setRefreshing(true);
        setRefreshError(null);
      } else {
        setLoading(true);
        setError(null);
      }
      const res = await apiClient('/api/nutrition', {
        mealId,
        ...(forceRefresh ? { action: 'refresh-usda' } : {}),
      });
      setData(res);
    } catch (err) {
      const message = err?.message || 'Failed to retrieve nutrition details.';
      if (forceRefresh) setRefreshError(message);
      else setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function requestFeedback() {
    if (!mealId) return;
    try {
      setFeedbackLoading(true);
      setFeedbackError(null);
      const result = await apiClient('/api/nutrition', { action: 'ai-feedback', mealId });
      setFeedback(result.feedback);
    } catch (err) {
      setFeedbackError(err?.message || 'AI food feedback could not be generated.');
    } finally {
      setFeedbackLoading(false);
    }
  }

  useEffect(() => {
    setData(null);
    setError(null);
    setRefreshError(null);
    setFeedbackLoading(false);
    setFeedback(null);
    setFeedbackError(null);
    loadNutrition();
  }, [mealId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-line bg-surface p-6 text-center">
        <Spinner label="Analyzing nutritional profile…" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => loadNutrition()}
        className="text-xs p-4"
      />
    );
  }

  if (!data?.nutrition) return null;

  const { nutrition, source, safetyFlags = [] } = data;
  const isUsda = source === 'usda';

  return (
    <div className="space-y-4 rounded-xl border border-line bg-surface p-5">
      {/* Header & Attribution Source */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-3">
        <div>
          <h4 className="text-base font-bold text-fg">Nutritional Breakdown</h4>
          <p className="text-xs text-muted">Estimated per single serving.</p>
        </div>

        <div>
          {isUsda ? (
            <div className="flex items-center gap-1.5 rounded-lg border border-line bg-surface-muted px-2.5 py-1">
              <span className="text-[11px] font-semibold text-fg">
                Powered by{' '}
                <a
                  href="https://fdc.nal.usda.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:opacity-80"
                >
                  USDA FoodData Central
                </a>
              </span>
            </div>
          ) : (
            <Badge variant="neutral">AI Nutrition Estimate</Badge>
          )}
        </div>
      </div>

      {/* AI estimate explanation note */}
      {!isUsda && (
        <p className="text-[11px] text-muted leading-relaxed">
          ℹ {data.sourceMessage || 'USDA data was unavailable for this meal; this is an AI nutrition estimate.'}
        </p>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        <Button
          variant="secondary"
          onClick={requestFeedback}
          disabled={feedbackLoading}
          aria-label="Verify this meal with AI and get food feedback"
        >
          {feedbackLoading ? <Spinner label="Reviewing with AI…" /> : 'Verify with AI'}
        </Button>
        <Button
          variant="secondary"
          onClick={() => loadNutrition(true)}
          disabled={refreshing}
          aria-label="Look up this meal's nutrition in USDA FoodData Central"
        >
          {refreshing ? <Spinner label="Checking USDA…" /> : 'Check USDA data'}
        </Button>
      </div>

      {refreshError && (
        <ErrorState message={refreshError} onRetry={() => loadNutrition(true)} className="text-xs p-3" />
      )}

      {feedbackError && (
        <ErrorState message={feedbackError} onRetry={requestFeedback} className="text-xs p-3" />
      )}

      {feedback && (
        <section className="space-y-3 rounded-lg border border-line bg-surface-muted p-3" aria-live="polite">
          <div>
            <h5 className="text-sm font-semibold text-fg">AI food feedback</h5>
            <p className="mt-1 text-xs text-muted">{feedback.summary}</p>
          </div>
          {feedback.strengths.length > 0 && (
            <div>
              <h6 className="text-xs font-semibold text-fg">Strengths</h6>
              <ul className="list-disc pl-5 text-xs text-muted">
                {feedback.strengths.map((item, index) => <li key={`strength-${index}`}>{item}</li>)}
              </ul>
            </div>
          )}
          {feedback.cautions.length > 0 && (
            <div>
              <h6 className="text-xs font-semibold text-fg">Cautions</h6>
              <ul className="list-disc pl-5 text-xs text-muted">
                {feedback.cautions.map((item, index) => <li key={`caution-${index}`}>{item}</li>)}
              </ul>
            </div>
          )}
          {feedback.improvements.length > 0 && (
            <div>
              <h6 className="text-xs font-semibold text-fg">Possible improvements</h6>
              <ul className="list-disc pl-5 text-xs text-muted">
                {feedback.improvements.map((item, index) => <li key={`improvement-${index}`}>{item}</li>)}
              </ul>
            </div>
          )}
          <p className="text-[11px] text-muted">General food information only; not medical advice.</p>
        </section>
      )}

      {/* Calories Callout */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-primary">
          {nutrition.calories}
        </span>
        <span className="text-xs font-medium text-muted">calories (kcal)</span>
      </div>

      {/* Macronutrient Grid */}
      <div className="grid grid-cols-3 gap-2.5 text-center">
        <div className="rounded-lg border border-line bg-surface-muted p-2.5">
          <div className="text-xs text-muted">Protein</div>
          <div className="text-sm font-bold text-fg">{nutrition.proteinG} g</div>
        </div>
        <div className="rounded-lg border border-line bg-surface-muted p-2.5">
          <div className="text-xs text-muted">Carbs</div>
          <div className="text-sm font-bold text-fg">{nutrition.carbsG} g</div>
        </div>
        <div className="rounded-lg border border-line bg-surface-muted p-2.5">
          <div className="text-xs text-muted">Fat</div>
          <div className="text-sm font-bold text-fg">{nutrition.fatG} g</div>
        </div>
      </div>

      {/* Micronutrients: Sodium & Sugar */}
      <div className="grid grid-cols-2 gap-2.5 text-xs text-fg">
        <div className="flex justify-between rounded-lg border border-line p-2.5">
          <span className="text-muted">Sodium:</span>
          <span className="font-semibold">{nutrition.sodiumMg} mg</span>
        </div>
        <div className="flex justify-between rounded-lg border border-line p-2.5">
          <span className="text-muted">Sugar:</span>
          <span className="font-semibold">{nutrition.sugarG} g</span>
        </div>
      </div>

      {/* Vitamins & Minerals (if available from USDA) */}
      {nutrition.vitamins?.length > 0 && (
        <div className="border-t border-line pt-3">
          <div className="mb-2 text-xs font-semibold text-fg">Vitamins & Minerals</div>
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
            {nutrition.vitamins.map((vit, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded border border-line px-2 py-1 text-[11px]"
              >
                <span className="text-muted">{vit.name}</span>
                <span className="font-medium text-fg">
                  {vit.amount} {vit.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safety Flags based on real nutrient values */}
      {safetyFlags?.length > 0 && (
        <div className="border-t border-line pt-3">
          <div className="mb-1 text-xs font-medium text-warn-fg">Health Caution Flags:</div>
          <div className="flex flex-wrap gap-1.5">
            {safetyFlags.map((flag, idx) => (
              <SafetyBadge key={idx} flag={flag} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
