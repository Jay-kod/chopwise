import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';

const CONDITION_GUIDANCE = {
  hypertension: {
    title: 'Hypertension Protocol Active',
    summary: 'Sodium strictly restricted; bouillon cubes and salt minimized in favor of natural herbs and crayfish.',
    badge: 'Low Sodium',
  },
  diabetes: {
    title: 'Glycemic Control Protocol',
    summary: 'Controlled carbohydrates; refined sugars avoided in favor of high-fiber grains, beans, and unripe plantains.',
    badge: 'Low GI / High Fiber',
  },
  obesity: {
    title: 'Caloric Portion Management',
    summary: 'Calorie-conscious portions with reduced cooking oils and increased micronutrient-dense leafy vegetables.',
    badge: 'Calorie Conscious',
  },
  ulcer: {
    title: 'Gastric-Soothing Protocol',
    summary: 'Scotch bonnet pepper and acidic fried ingredients strictly reduced to prevent gastric mucosal irritation.',
    badge: 'Gentle & Mild',
  },
};

export default function HealthAdvisoryBanner({ conditions = [] }) {
  if (!conditions || conditions.length === 0) return null;

  return (
    <div className="rounded-xl border border-line bg-surface-muted p-4 space-y-2.5 shadow-xs">
      <div className="flex items-center justify-between gap-2 border-b border-line pb-2">
        <div className="flex items-center gap-2">
          <span className="text-base" aria-hidden="true">💡</span>
          <span className="text-xs font-bold text-fg">Active Clinical Guardrails</span>
        </div>
        <Link
          to={ROUTES.customer.profile}
          className="text-xs text-primary font-semibold hover:text-primary-hover hover:underline underline-offset-2 flex items-center gap-1"
          title="Adjust health conditions in Preferences"
        >
          <span>Manage in profile</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {conditions.map((cond) => {
          const info = CONDITION_GUIDANCE[cond];
          if (!info) return null;
          return (
            <div
              key={cond}
              className="flex items-start gap-2.5 rounded-lg border border-line bg-surface p-3 text-xs shadow-xs"
            >
              <div className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-fg text-xs">{info.title}</span>
                  <span className="rounded-md border border-line bg-primary-soft text-[10px] font-bold text-on-primary-soft px-2 py-0.5 shrink-0 shadow-2xs">
                    {info.badge}
                  </span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  {info.summary}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
