import { Link } from 'react-router-dom';
import {
  ActivityIcon,
  SparklesIcon,
  SlidersHorizontalIcon,
  ShieldAlertIcon,
  CoinsIcon,
  CheckSquareIcon,
  FlaskConicalIcon,
  ArrowRightIcon,
} from 'lucide-react';
import Button from '@/components/Button';
import Spinner from '@/components/Spinner';
import AdminPageHeader from './AdminPageHeader';
import { useAdminContext } from './useAdminContext';
import { ROUTES } from '@/lib/routes';

const ADMIN_MODULES = [
  {
    title: 'Functions & APIs',
    description: 'Monitor serverless endpoints, inspect runtime status, and run integration health checks.',
    path: ROUTES.admin.functions,
    icon: ActivityIcon,
  },
  {
    title: 'Gemini AI Integration',
    description: 'Configure Gemini API keys, select model variants, and verify generation latency.',
    path: ROUTES.admin.gemini,
    icon: SparklesIcon,
  },
  {
    title: 'Edamam Nutrition API',
    description: 'Manage Edamam Application ID and Key, and verify nutrition lookup endpoints.',
    path: ROUTES.admin.edamam,
    icon: ActivityIcon,
  },
  {
    title: 'Recommendation & Branding',
    description: 'Tune weekly budget tolerances, meal counts, regional weights, and platform branding.',
    path: ROUTES.admin.settings,
    icon: SlidersHorizontalIcon,
  },
  {
    title: 'Medical Safety Thresholds',
    description: 'Manage clinical nutrient limits for hypertension, diabetes, and kidney conditions.',
    path: ROUTES.admin.safety,
    icon: ShieldAlertIcon,
  },
  {
    title: 'Ingredient Price Table',
    description: 'Update market prices per 100g across Nigerian produce, proteins, and pantry staples.',
    path: ROUTES.admin.prices,
    icon: CoinsIcon,
  },
  {
    title: 'Setup & Readiness Checklist',
    description: 'Audit production readiness, environment secrets, and required database indexes.',
    path: ROUTES.admin.checklist,
    icon: CheckSquareIcon,
  },
  {
    title: 'Evaluation Suite',
    description: 'Run automated acceptance tests across standard Nigerian test profiles (Chapter 4).',
    path: ROUTES.admin.evaluation,
    icon: FlaskConicalIcon,
  },
];

function ModuleCard({ item }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      className="group relative flex flex-col justify-between rounded-xl border border-line bg-surface p-5 shadow-xs transition-all hover:border-primary hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex size-10 items-center justify-center rounded-lg bg-surface-muted text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
            <Icon className="size-5" />
          </div>
          <ArrowRightIcon className="size-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-fg group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          <p className="mt-1 text-xs text-muted leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs font-medium text-primary">
        <span>Manage settings</span>
        <span>→</span>
      </div>
    </Link>
  );
}

export default function AdminOverview() {
  const { status, loading, fetchStatus } = useAdminContext();

  const functionsCount = status?.functions?.length || 0;
  const integrations = status?.integrations || [];
  const geminiConfigured = integrations.find((i) => i.id === 'gemini')?.configured;
  const edamamConfigured = integrations.find((i) => i.id === 'edamam')?.configured;
  const checklistItems = status?.bootstrap?.items || [];
  const completedChecklist = checklistItems.filter((i) => i.passed).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Admin Overview"
        description="Centralized administration hub for ChopWise APIs, runtime configuration, safety limits, and price tables."
        actions={
          <Button
            variant="secondary"
            onClick={fetchStatus}
            disabled={loading}
            className="text-xs min-h-9 px-3"
          >
            {loading ? <Spinner label="Refreshing…" /> : '↻ Refresh Status'}
          </Button>
        }
      />

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-line bg-surface p-4">
          <span className="text-xs font-medium text-muted">Active Endpoints</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-fg">{functionsCount}</span>
            <span className="text-xs text-primary font-medium">Serverless APIs</span>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-4">
          <span className="text-xs font-medium text-muted">Gemini AI Status</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base font-bold text-fg">
              {geminiConfigured ? 'Connected' : 'Not configured'}
            </span>
            <span className={`text-xs font-semibold ${geminiConfigured ? 'text-primary' : 'text-danger-fg'}`}>
              {geminiConfigured ? '● Active' : '○ Pending'}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-4">
          <span className="text-xs font-medium text-muted">Edamam Nutrition</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base font-bold text-fg">
              {edamamConfigured ? 'Connected' : 'Not configured'}
            </span>
            <span className={`text-xs font-semibold ${edamamConfigured ? 'text-primary' : 'text-danger-fg'}`}>
              {edamamConfigured ? '● Active' : '○ Pending'}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-4">
          <span className="text-xs font-medium text-muted">Checklist Readiness</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-fg">{completedChecklist}</span>
            <span className="text-xs text-muted">of {checklistItems.length} passed</span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-fg">Administration Modules</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ADMIN_MODULES.map((item) => (
            <ModuleCard key={item.path} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
