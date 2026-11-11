import { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';
import ErrorState from '../../components/ErrorState';
import { apiClient } from '../../lib/apiClient';
import { formatNaira } from '../../lib/format';
import { downloadEvaluationCsv } from './evaluationCsv';

/**
 * Section G: Evaluation Runner (Task P14, AR9).
 * Runs 10 fixed clinical & economic test profiles sequentially for Chapter 4 research evidence.
 */
export default function EvaluationRunner() {
  const [running, setRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  async function runAllCases() {
    setRunning(true);
    setError(null);
    setResults([]);

    const collected = [];

    try {
      for (let i = 0; i < 10; i++) {
        setCurrentIndex(i);
        const res = await apiClient('/api/admin', {
          action: 'runEvaluationCase',
          index: i,
        });
        collected.push(res);
        setResults([...collected]);
      }
    } catch (err) {
      setError(err?.message || 'Evaluation run failed.');
    } finally {
      setRunning(false);
      setCurrentIndex(-1);
    }
  }

  function handleDownloadCsv() {
    downloadEvaluationCsv(results);
  }

  // Summary Metrics
  const totalMeals = results.reduce((acc, r) => acc + (r.mealsCount || 0), 0);
  const totalWithinBudget = results.reduce(
    (acc, r) => acc + (r.withinBudgetCount || 0),
    0
  );
  const budgetAdherencePct =
    totalMeals > 0 ? Math.round((totalWithinBudget / totalMeals) * 100) : 0;

  const totalNutrition = results.reduce(
    (acc, r) => acc + (r.usdaCount || 0) + (r.aiEstimateCount || 0),
    0
  );
  const usdaPct =
    totalNutrition > 0
      ? Math.round(
        (results.reduce((acc, r) => acc + (r.usdaCount || 0), 0) /
            totalNutrition) *
            100
        )
      : 0;

  const latencies = results.map((r) => r.latencyMs).sort((a, b) => a - b);
  const medianLatency =
    latencies.length > 0
      ? latencies[Math.floor(latencies.length / 2)]
      : 0;

  return (
    <Card className="p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b border-line pb-4">
        <div>
          <h3 className="text-lg font-bold text-fg">
            G. Evaluation Runner (Chapter 4 Evidence)
          </h3>
          <p className="mt-1 text-xs text-muted max-w-2xl leading-relaxed">
            Executes 10 fixed clinical profiles sequentially through the live Gemini and USDA FoodData Central pipelines.
            Outputs real empirical metrics for thesis Chapter 4 without saving dummy records to user accounts.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {results.length > 0 && (
            <Button
              variant="secondary"
              onClick={handleDownloadCsv}
              className="text-xs min-h-9 px-3"
            >
              📥 Download CSV
            </Button>
          )}

          <Button
            onClick={runAllCases}
            disabled={running}
            className="text-xs min-h-9 px-4"
          >
            {running ? (
              <Spinner label={`Running Case ${currentIndex + 1} of 10…`} />
            ) : (
              '▶ Run Evaluation Suite'
            )}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {running && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted">
            <span>Executing evaluation cases…</span>
            <span>{results.length} of 10 completed</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted border border-line">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(results.length / 10) * 100}%` }}
            />
          </div>
        </div>
      )}

      {error && <ErrorState message={error} className="text-xs p-4" />}

      {/* Summary Metrics Cards */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-line bg-surface-muted p-3 text-center">
            <div className="text-[11px] text-muted">Budget Adherence</div>
            <div className="text-lg font-bold text-primary">
              {budgetAdherencePct}%
            </div>
            <div className="text-[10px] text-muted">
              {totalWithinBudget}/{totalMeals} meals
            </div>
          </div>

          <div className="rounded-xl border border-line bg-surface-muted p-3 text-center">
            <div className="text-[11px] text-muted">USDA Coverage</div>
            <div className="text-lg font-bold text-fg">{usdaPct}%</div>
            <div className="text-[10px] text-muted">
              {100 - usdaPct}% AI fallback
            </div>
          </div>

          <div className="rounded-xl border border-line bg-surface-muted p-3 text-center">
            <div className="text-[11px] text-muted">Median Latency</div>
            <div className="text-lg font-bold text-fg">
              {medianLatency.toLocaleString()} ms
            </div>
            <div className="text-[10px] text-muted">End-to-end pipeline</div>
          </div>

          <div className="rounded-xl border border-line bg-surface-muted p-3 text-center">
            <div className="text-[11px] text-muted">Total Cases Evaluated</div>
            <div className="text-lg font-bold text-fg">
              {results.length} / 10
            </div>
            <div className="text-[10px] text-muted">
              {results.length === 10 ? '✓ Complete run' : 'In progress'}
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      {results.length > 0 && (
        <div className="overflow-x-auto border-t border-line pt-4">
          <table className="w-full text-left text-xs text-fg">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="pb-2 font-medium">Case</th>
                <th className="pb-2 font-medium">Target Cap</th>
                <th className="pb-2 font-medium">Meals</th>
                <th className="pb-2 font-medium">In Budget</th>
                <th className="pb-2 font-medium">Safety Flags</th>
                <th className="pb-2 font-medium">Nutrition</th>
                <th className="pb-2 text-right font-medium">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {results.map((r) => (
                <tr key={r.caseIndex} className="hover:bg-surface-muted">
                  <td className="py-2.5 font-medium">
                    <div>{r.name}</div>
                    <div className="text-[10px] text-muted">{r.persona}</div>
                  </td>
                  <td className="py-2.5 font-semibold text-primary">
                    {formatNaira(r.perMealCapNGN)}
                  </td>
                  <td className="py-2.5">{r.mealsCount}</td>
                  <td className="py-2.5 font-medium">
                    {r.withinBudgetCount} / {r.mealsCount}
                  </td>
                  <td className="py-2.5">
                    {r.safetyFlagCounts > 0 ? (
                      <span className="rounded bg-warn-bg px-1.5 py-0.5 text-[11px] text-warn-fg border border-warn-line">
                        {r.safetyFlagCounts} flagged
                      </span>
                    ) : (
                      <span className="text-muted">None</span>
                    )}
                  </td>
                  <td className="py-2.5 text-[11px]">
                    {r.usdaCount > 0 && (
                      <span className="mr-1 rounded bg-surface-muted px-1.5 py-0.5 font-medium text-primary">
                        {r.usdaCount} USDA
                      </span>
                    )}
                    {r.aiEstimateCount > 0 && (
                      <span className="rounded bg-surface-muted px-1.5 py-0.5 text-muted">
                        {r.aiEstimateCount} AI est.
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 text-right font-mono text-[11px] text-muted">
                    {r.latencyMs} ms
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
