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
import { DashboardStats } from '@/components/stats';
import { ConversationVolumeChart } from '@/components/conversation-volume-chart';
import { ChannelBreakdownChart } from '@/components/channel-breakdown-chart';
import { CsatResponsesChart } from '@/components/csat-responses-chart';
import { FirstReplyTimeChart } from '@/components/first-reply-time-chart';
import { TeamOnDuty } from '@/components/team-on-duty';
import { RecentConversations } from '@/components/recent-conversations';
import { SupportActivity } from '@/components/support-activity';
import Button from '@/components/Button';
import Spinner from '@/components/Spinner';
import { useAdminContext } from './useAdminContext';
import { ROUTES } from '@/lib/routes';

const ADMIN_MODULES = [
  {
    title: 'Functions & APIs',
    description: 'Monitor serverless endpoints and execute integration health checks.',
    path: ROUTES.admin.functions,
    icon: ActivityIcon,
  },
  {
    title: 'Gemini AI Integration',
    description: 'Configure Gemini API keys and select live model variants.',
    path: ROUTES.admin.gemini,
    icon: SparklesIcon,
  },
  {
    title: 'Edamam Nutrition API',
    description: 'Manage Edamam Application ID, Key, and verify lookup endpoints.',
    path: ROUTES.admin.edamam,
    icon: ActivityIcon,
  },
  {
    title: 'Recommendation & Branding',
    description: 'Tune weekly budget tolerances, meal counts, and platform identity.',
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
    description: 'Update Nigerian market prices per 100g across local staples.',
    path: ROUTES.admin.prices,
    icon: CoinsIcon,
  },
  {
    title: 'Setup & Readiness Checklist',
    description: 'Audit production readiness, environment secrets, and database indexes.',
    path: ROUTES.admin.checklist,
    icon: CheckSquareIcon,
  },
  {
    title: 'Evaluation Suite',
    description: 'Run automated acceptance tests across Nigerian test profiles (Chapter 4).',
    path: ROUTES.admin.evaluation,
    icon: FlaskConicalIcon,
  },
];

function ModuleCard({ item }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      className="group relative flex flex-col justify-between rounded-xl border border-line bg-surface p-4 shadow-xs transition-all hover:border-primary hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex size-9 items-center justify-center rounded-lg bg-surface-muted text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
            <Icon className="size-4" />
          </div>
          <ArrowRightIcon className="size-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-fg group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          <p className="mt-1 text-xs text-muted leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>
      <div className="mt-3 pt-2.5 border-t border-line flex items-center justify-between text-xs font-medium text-primary">
        <span>Configure module</span>
        <span>→</span>
      </div>
    </Link>
  );
}

function buildStatsItems(status) {
  const functions = status?.functions || [];
  const activeFunctions = functions.filter((f) => f.status === 'ok').length;
  const totalFunctions = functions.length || 5;

  const integrations = status?.integrations || [];
  const gemini = integrations.find((i) => i.id === 'gemini');
  const edamam = integrations.find((i) => i.id === 'edamam');
  const checklistItems = status?.bootstrap?.items || [];
  const passedChecklist = checklistItems.filter((i) => i.passed).length;

  return [
    {
      label: 'Active APIs & Endpoints',
      value: `${activeFunctions} / ${totalFunctions}`,
      delta: 2.5,
      footnote: `${totalFunctions} serverless APIs registered`,
    },
    {
      label: 'Google Gemini AI',
      value: gemini?.configured ? 'Connected' : 'Not configured',
      delta: gemini?.configured ? 100 : 0,
      footnote: gemini?.configured ? (gemini?.model || 'gemini-2.5-flash') : 'API key pending',
    },
    {
      label: 'Edamam Nutrition API',
      value: edamam?.configured ? 'Active' : 'Not configured',
      delta: edamam?.configured ? 1.0 : 0,
      footnote: edamam?.configured ? 'Nutrition parser ready' : 'Credentials pending',
    },
    {
      label: 'Production Readiness',
      value: `${passedChecklist} of ${checklistItems.length || 10}`,
      delta: 0,
      footnote: 'Checklist audit pass rate',
    },
  ];
}

export default function AdminDashboard() {
  const { status, loading, fetchStatus, testAll, testingTarget } = useAdminContext();
  const statsItems = buildStatsItems(status);

  return (
    <div className="space-y-6">
      {/* Top Heading & Actions matching @efferd/dashboard-3 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-fg">
            Admin Dashboard
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Telemetry metrics, API runtime health, and centralized administration controls.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={fetchStatus}
            disabled={loading}
            className="text-xs min-h-9 px-3"
          >
            {loading ? <Spinner label="Refreshing…" /> : '↻ Refresh Status'}
          </Button>
          <Button
            variant="primary"
            onClick={() => testAll()}
            disabled={loading || Boolean(testingTarget)}
            className="text-xs min-h-9 px-3.5"
          >
            {testingTarget ? <Spinner label="Testing…" /> : '⚡ Test All APIs'}
          </Button>
        </div>
      </div>

      {/* Complete @efferd/dashboard-3 Analytics & Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStats items={statsItems} />
        <ConversationVolumeChart />
        <ChannelBreakdownChart />
        <CsatResponsesChart />
        <FirstReplyTimeChart />
        <TeamOnDuty />
        <RecentConversations />
        <SupportActivity />
      </div>

      {/* Administration & Configuration Modules */}
      <section className="space-y-4 pt-4 border-t border-line">
        <div>
          <h2 className="text-lg font-bold text-fg">Administration Modules</h2>
          <p className="text-xs text-muted">
            Direct management controls for API keys, clinical nutrition safety rules, and ingredient costs.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ADMIN_MODULES.map((item) => (
            <ModuleCard key={item.path} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
