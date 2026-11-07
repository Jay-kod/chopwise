import Card from '../../components/Card';
import { formatNaira } from '../../lib/format';

/**
 * Ingredients table breakdown and cooking instructions for a meal.
 * Follows AGENTS.md and docs/UI_GUIDELINES.md.
 */
export default function MealIngredientsAndSteps({ meal }) {
  if (!meal) return null;

  return (
    <div className="space-y-6 lg:col-span-2">
      {/* Ingredients & Cost Breakdown */}
      <Card className="p-5">
        <h3 className="text-base font-bold text-fg border-b border-line pb-2">
          Ingredients &amp; Cost Breakdown
        </h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs text-fg">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="pb-2 font-medium">Ingredient</th>
                <th className="pb-2 font-medium">Quantity</th>
                <th className="pb-2 font-medium">Est. Cost</th>
                <th className="pb-2 text-right font-medium">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {meal.ingredients?.map((ingr, idx) => (
                <tr key={idx} className="hover:bg-surface-muted">
                  <td className="py-2.5 font-medium capitalize">{ingr.item}</td>
                  <td className="py-2.5 text-muted">
                    {ingr.quantity} {ingr.unit}
                  </td>
                  <td className="py-2.5 font-semibold text-fg">
                    {formatNaira(ingr.costNGN ?? ingr.estCostNGN)}
                  </td>
                  <td className="py-2.5 text-right text-[11px] text-muted">
                    {ingr.costSource === 'table' ? 'Market price' : 'AI estimate'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-line font-bold">
                <td colSpan="2" className="pt-3 text-fg">
                  Total Estimated Cost
                </td>
                <td colSpan="2" className="pt-3 text-right text-base text-primary">
                  {formatNaira(meal.costNGN)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Cooking Steps */}
      <Card className="p-5">
        <h3 className="text-base font-bold text-fg border-b border-line pb-2">
          Cooking Instructions
        </h3>
        <ol className="mt-4 space-y-3 pl-4 text-xs text-fg list-decimal">
          {meal.steps?.map((step, idx) => (
            <li key={idx} className="leading-relaxed pl-1">
              {step}
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
