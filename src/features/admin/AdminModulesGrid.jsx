import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  BookOpenIcon,
  CheckSquareIcon,
  ClipboardListIcon,
  CoinsIcon,
  FlaskConicalIcon,
  PlugZapIcon,
  ShieldAlertIcon,
  SlidersHorizontalIcon,
  UserCogIcon,
  UsersIcon,
  WrenchIcon,
} from 'lucide-react';
import { ROUTES } from '@/lib/routes';

export const ADMIN_MODULES = [
  {
    title: 'API Integrations',
    category: 'ai',
    categoryLabel: 'AI & Data API',
    description: 'Configure and test Google Gemini AI, USDA FoodData Central, and external APIs.',
    path: ROUTES.admin.integrations,
    icon: PlugZapIcon,
  },
  {
    title: 'Recommendation & Branding',
    category: 'ai',
    categoryLabel: 'AI Parameters',
    description: 'Tune weekly budget tolerances, meal counts, and platform identity.',
    path: ROUTES.admin.settings,
    icon: SlidersHorizontalIcon,
  },
  {
    title: 'Shared Recipe Catalogue',
    category: 'ai',
    categoryLabel: 'AI Recipe Assistant',
    description: 'Publish and maintain recipes customers can browse separately from personalized plans.',
    path: ROUTES.admin.recipes,
    icon: BookOpenIcon,
  },
  {
    title: 'Evaluation Suite',
    category: 'ai',
    categoryLabel: 'Automated Runner',
    description: 'Run automated acceptance tests across Nigerian test profiles (Chapter 4).',
    path: ROUTES.admin.evaluation,
    icon: FlaskConicalIcon,
  },
  {
    title: 'Medical Safety Thresholds',
    category: 'clinical',
    categoryLabel: 'Clinical Health',
    description: 'Manage heuristic nutrient limits for hypertension, diabetes, and obesity.',
    path: ROUTES.admin.safety,
    icon: ShieldAlertIcon,
  },
  {
    title: 'Ingredient Price Table',
    category: 'clinical',
    categoryLabel: 'Nigerian Market',
    description: 'Update Nigerian market prices per 100g across local staples.',
    path: ROUTES.admin.prices,
    icon: CoinsIcon,
  },
  {
    title: 'Customer Accounts',
    category: 'governance',
    categoryLabel: 'User Governance',
    description: 'Manage customer email and active status without accessing private health profiles.',
    path: ROUTES.admin.customers,
    icon: UsersIcon,
  },
  {
    title: 'Administrator Access',
    category: 'governance',
    categoryLabel: 'Access Control',
    description: 'Grant or revoke managed roles while keeping bootstrap administrators protected.',
    path: ROUTES.admin.access,
    icon: UserCogIcon,
  },
  {
    title: 'Activity History',
    category: 'governance',
    categoryLabel: 'Audit Trails',
    description: 'Review the append-only history of administrator changes and maintenance actions.',
    path: ROUTES.admin.activity,
    icon: ClipboardListIcon,
  },
  {
    title: 'Database Maintenance',
    category: 'governance',
    categoryLabel: 'System Ops',
    description: 'Clear nutrition cache and reset rate limits without deleting customer data.',
    path: ROUTES.admin.maintenance,
    icon: WrenchIcon,
  },
  {
    title: 'Setup & Readiness Checklist',
    category: 'governance',
    categoryLabel: 'Prerequisites',
    description: 'Audit production readiness, environment secrets, and database indexes.',
    path: ROUTES.admin.checklist,
    icon: CheckSquareIcon,
  },
];

export function ModuleCard({ item }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      className="group relative flex flex-col justify-between rounded-2xl border border-line bg-surface p-4 sm:p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-field-line hover:shadow-md active:translate-y-0 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex size-9 items-center justify-center rounded-xl border border-line bg-surface-muted text-primary shadow-xs group-hover:border-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-200">
            <Icon className="size-4" />
          </div>
          <span className="rounded-md border border-line bg-surface-muted px-2 py-0.5 text-[10px] font-bold text-muted group-hover:text-fg group-hover:border-field-line transition-colors">
            {item.categoryLabel}
          </span>
        </div>
        <div>
          <h3 className="font-semibold text-sm sm:text-base text-fg group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          <p className="mt-1 text-xs text-muted leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-xs font-semibold text-primary">
        <span>Launch module</span>
        <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function CategoryTabs({ activeCategory, onSelectCategory }) {
  const categories = [
    { id: 'all', label: `All Modules (${ADMIN_MODULES.length})` },
    { id: 'ai', label: 'AI & Integrations (4)' },
    { id: 'clinical', label: 'Clinical & Prices (2)' },
    { id: 'governance', label: 'Governance & Ops (5)' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1">
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelectCategory(cat.id)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            activeCategory === cat.id
              ? 'bg-primary text-on-primary shadow-2xs'
              : 'border border-line bg-surface text-muted hover:border-field-line hover:text-fg'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}

export default function AdminModulesGrid() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredModules = ADMIN_MODULES.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  return (
    <div className="space-y-4">
      <CategoryTabs activeCategory={activeCategory} onSelectCategory={setActiveCategory} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredModules.map((item) => (
          <ModuleCard key={item.path} item={item} />
        ))}
      </div>
    </div>
  );
}
