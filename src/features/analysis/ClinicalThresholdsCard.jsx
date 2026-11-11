import { Link } from 'react-router-dom';
import { ArrowUpRightIcon, ShieldCheckIcon } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

const GUIDELINES = [
  {
    icon: '🧂',
    title: 'Sodium Moderation',
    condition: 'Hypertension',
    text: 'Sodium target < 2,300 mg/day. Bouillon cubes and salt reduced in favor of aromatic herbs, iru (locust beans), and crayfish.',
  },
  {
    icon: '🍚',
    title: 'Glycemic Control',
    condition: 'Diabetes',
    text: 'Refined starches swapped for high-fiber complex carbs (unripe plantain, brown beans, oats) to stabilize blood glucose.',
  },
  {
    icon: '⚡',
    title: 'Caloric Portioning',
    condition: 'Obesity',
    text: 'Calorie-managed portions with regulated palm oil quantities and increased nutrient-rich traditional leafy vegetables.',
  },
  {
    icon: '🌶',
    title: 'Gastric-Soothing',
    condition: 'Ulcer',
    text: 'Scotch bonnet peppers and heavily fried dishes minimized to protect gastric mucosa from acid irritation.',
  },
];

/**
 * Professional Clinical Nutrition & Dietary Standards Reference Card.
 */
export default function ClinicalThresholdsCard() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-xl border border-line bg-surface-muted text-primary shrink-0 shadow-xs">
            <ShieldCheckIcon className="size-4" aria-hidden="true" />
          </span>
          <h3 className="text-sm font-bold tracking-tight text-fg">
            Clinical Dietary Standards & Guardrails
          </h3>
        </div>
        <Link
          to={ROUTES.customer.profile}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover hover:underline underline-offset-2"
        >
          <span>Adjust Profile</span>
          <ArrowUpRightIcon className="size-3" aria-hidden="true" />
        </Link>
      </div>

      <p className="text-xs text-muted leading-relaxed">
        ChopWise applies evidence-based clinical heuristic guardrails to ensure every Nigerian recipe respects declared medical conditions.
      </p>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {GUIDELINES.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 rounded-xl border border-line bg-surface-muted p-3 text-xs shadow-2xs"
          >
            <span className="text-base shrink-0" aria-hidden="true">
              {item.icon}
            </span>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-fg">{item.title}</span>
                <span className="rounded bg-primary-soft px-1.5 py-0.2 text-[9px] font-bold text-on-primary-soft">
                  {item.condition}
                </span>
              </div>
              <p className="text-[11px] text-muted leading-relaxed">
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-line/70 bg-surface-muted p-3 text-[11px] text-muted space-y-1">
        <strong className="font-semibold text-fg">USDA Composition vs AI Estimate: </strong>
        <span>
          When every ingredient has a gram quantity and matching record, nutrition is verified against official USDA FoodData Central databases; otherwise, Google Gemini provides structured nutritional estimation.
        </span>
      </div>
    </div>
  );
}

