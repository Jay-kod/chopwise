/**
 * Formats evaluation runner results as a CSV and triggers browser download.
 * @param {Array<object>} results
 */
export function downloadEvaluationCsv(results) {
  if (!results || results.length === 0) return;

  const headers = [
    'Case Index',
    'Name',
    'Persona',
    'Weekly Budget (NGN)',
    'Per Meal Cap (NGN)',
    'Meals Count',
    'Within Budget Count',
    'Safety Flag Count',
    'Edamam Count',
    'AI Estimate Count',
    'Latency (ms)',
  ];

  const rows = results.map((r) => [
    r.caseIndex,
    `"${r.name}"`,
    `"${r.persona}"`,
    r.weeklyBudgetNGN,
    r.perMealCapNGN,
    r.mealsCount,
    r.withinBudgetCount,
    r.safetyFlagCounts,
    r.edamamCount,
    r.aiEstimateCount,
    r.latencyMs,
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'chopwise_chapter4_evaluation.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

