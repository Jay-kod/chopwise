import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  BookOpenIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FlaskConicalIcon,
  KeyRoundIcon,
  LockKeyholeIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  SparklesIcon,
  WrenchIcon,
} from 'lucide-react';
import Badge from '@/components/Badge';
import { ROUTES } from '@/lib/routes';

const BOOTSTRAP_ITEMS = [
  { key: 'mysql', label: 'MySQL Database', desc: 'MariaDB / MySQL data store', Icon: DatabaseIcon },
  { key: 'adminUidsSet', label: 'Bootstrap Admins', desc: 'Protected ADMIN_UIDS in env', Icon: ShieldCheckIcon },
  { key: 'jwtSecretSet', label: 'JWT Signing Secret', desc: 'HMAC-SHA256 session tokens', Icon: KeyRoundIcon },
  { key: 'encryptionKeySet', label: 'Config Encryption', desc: 'AES-256-GCM write-only keys', Icon: LockKeyholeIcon },
];

const QUICK_ACTIONS = [
  { label: 'Flush Nutrition Cache', path: ROUTES.admin.maintenance, Icon: WrenchIcon, desc: 'Clear stale USDA/AI cache' },
  { label: 'Reset Rate Limiters', path: ROUTES.admin.maintenance, Icon: RotateCcwIcon, desc: 'Restore hourly throttles' },
  { label: 'Evaluation Test Suite', path: ROUTES.admin.evaluation, Icon: FlaskConicalIcon, desc: 'Run Chapter 4 test suite' },
  { label: 'Audit Activity Trail', path: ROUTES.admin.activity, Icon: ClipboardListIcon, desc: 'Review administrative logs' },
];

export function AdminBootstrapReadiness({ bootstrap = {} }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-xs transition-all">
      <div className="mb-3.5 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-sm sm:text-base text-fg">Security Readiness</h3>
          <p className="mt-0.5 text-xs text-muted">Core server environment credentials.</p>
        </div>
        <Link
          to={ROUTES.admin.checklist}
          className="text-xs font-semibold text-primary hover:text-primary-hover hover:underline underline-offset-2 flex items-center gap-0.5"
        >
          <span>Checklist</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
      <ul className="space-y-2">
        {BOOTSTRAP_ITEMS.map(({ key, label, desc, Icon }) => {
          const isConfigured = Boolean(bootstrap[key]);
          return (
            <li key={key}>
              <Link
                to={ROUTES.admin.checklist}
                className="flex items-center justify-between gap-2.5 rounded-xl border border-line bg-surface-muted/60 px-3 py-2 text-xs transition-all hover:border-field-line hover:bg-surface-muted group"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Icon aria-hidden="true" className="size-3.5 shrink-0 text-muted group-hover:text-primary" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-fg group-hover:text-primary">{label}</p>
                    <p className="truncate text-[10px] text-muted">{desc}</p>
                  </div>
                </div>
                <Badge variant={isConfigured ? 'ok' : 'warning'} className="shrink-0 text-[10px] py-0 px-2">
                  {isConfigured ? 'Verified' : 'Missing'}
                </Badge>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function QuickActionsCard() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-xs transition-all">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-sm sm:text-base text-fg">Quick Operations</h3>
        <span className="text-[11px] text-muted font-medium">Triage shortcuts</span>
      </div>
      <div className="grid gap-2">
        {QUICK_ACTIONS.map(({ label, path, Icon, desc }) => (
          <Link
            key={label}
            to={path}
            className="group flex items-center justify-between gap-2 rounded-xl border border-line bg-surface-muted/60 px-3 py-2 text-xs transition-all hover:border-field-line hover:bg-surface-muted"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-primary group-hover:border-field-line">
                <Icon aria-hidden="true" className="size-3.5" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-fg group-hover:text-primary transition-colors">{label}</p>
                <p className="text-[10px] text-muted">{desc}</p>
              </div>
            </div>
            <ArrowRightIcon className="size-3.5 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function PlatformStackCard() {
  const stack = [
    { label: 'AI Intelligence', value: 'Gemini 2.5 Flash', Icon: SparklesIcon },
    { label: 'Nutrition Engine', value: 'USDA FoodData Central', Icon: BookOpenIcon },
    { label: 'Database Storage', value: 'MySQL / MariaDB', Icon: DatabaseIcon },
  ];

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-xs transition-all">
      <h3 className="font-semibold text-sm text-fg mb-3">Platform Stack Spec</h3>
      <div className="space-y-2">
        {stack.map(({ label, value, Icon }) => (
          <div key={label} className="flex items-center justify-between text-xs border-b border-line/40 pb-2 last:border-0 last:pb-0">
            <span className="flex items-center gap-1.5 text-muted">
              <Icon aria-hidden="true" className="size-3.5" />
              <span>{label}</span>
            </span>
            <span className="font-semibold text-fg">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardSidebar({ bootstrap = {} }) {
  return (
    <aside aria-label="System infrastructure and quick actions" className="space-y-4">
      <AdminBootstrapReadiness bootstrap={bootstrap} />
      <QuickActionsCard />
      <PlatformStackCard />
    </aside>
  );
}
