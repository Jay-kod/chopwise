import { useState, useEffect } from 'react';
import { AppShell } from '@/components/app-shell';
import { DashboardStats } from '@/components/stats';
import { ConversationVolumeChart } from '@/components/conversation-volume-chart';
import { ChannelBreakdownChart } from '@/components/channel-breakdown-chart';
import { CsatResponsesChart } from '@/components/csat-responses-chart';
import { FirstReplyTimeChart } from '@/components/first-reply-time-chart';
import { TeamOnDuty } from '@/components/team-on-duty';
import { RecentConversations } from '@/components/recent-conversations';
import { SupportActivity } from '@/components/support-activity';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Card from '../components/Card';
import Disclaimer from '../components/Disclaimer';
import ConfirmModal from '../components/ConfirmModal';
import MealCard from '../features/meals/MealCard';
import FilterBar from '../features/meals/FilterBar';
import DashboardError from '../features/meals/DashboardError';
import { useRecommendations } from '../features/meals/useRecommendations';
import { useAuth } from '../features/auth/useAuth';
import { formatNaira } from '../lib/format';
import { apiClient } from '../lib/apiClient';

/**
 * User Dashboard page matching the responsive @efferd/dashboard-3 template.
 */
export default function Dashboard() {
  const { user } = useAuth();
  const {
    meals,
    perMealCapNGN,
    fromCache,
    loading,
    error,
    refresh,
    regenerate,
  } = useRecommendations();

  const [filters, setFilters] = useState({ mealType: 'all', condition: 'all', budget: 'all' });
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    if (user) {
      apiClient('/api/admin', { action: 'me' })
        .then((res) => { if (active) setIsAdmin(Boolean(res?.isAdmin)); })
        .catch(() => { if (active) setIsAdmin(false); });
    }
    return () => { active = false; };
  }, [user]);

  async function handleConfirmRegenerate() {
    setShowRegenerateConfirm(false);
    setRegenerating(true);
    await regenerate();
    setRegenerating(false);
  }

  const filteredMeals = meals.filter((m) => {
    if (filters.mealType !== 'all' && m.mealType !== filters.mealType) return false;
    if (filters.condition !== 'all' && !m.suitableFor?.includes(filters.condition)) return false;
    if (filters.budget === 'under-cap' && m.costNGN > perMealCapNGN) return false;
    if (filters.budget === 'over-cap' && m.costNGN <= perMealCapNGN) return false;
    return true;
  });

  const weeklyBudget = user?.profile?.weeklyBudgetNGN || 21000;
  const conditions = user?.profile?.conditions || [];

  const statsItems = [
    {
      label: 'Target per meal',
      value: perMealCapNGN > 0 ? formatNaira(perMealCapNGN) : '—',
      delta: 2.5,
      footnote: 'weekly budget / 21',
    },
    {
      label: 'Weekly budget',
      value: formatNaira(weeklyBudget),
      delta: 0,
      footnote: 'enforced in plan',
    },
    {
      label: 'Recommended meals',
      value: `${meals.length}`,
      delta: 1.0,
      footnote: fromCache ? 'Saved plan' : 'Freshly generated',
    },
    {
      label: 'Tracked conditions',
      value: `${conditions.length} active`,
      delta: 0,
      footnote: conditions.join(', ') || 'No restrictions',
    },
  ];

  return (
    <AppShell pathname="/dashboard" onRegenerate={() => setShowRegenerateConfirm(true)}>
      {/* Top Heading & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-fg">
            Personalised Nigerian Meal Plan
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Nutritious meals tailored to your health profile and wallet.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => setShowRegenerateConfirm(true)}
            disabled={loading || regenerating}
            className="text-xs min-h-9 px-3.5"
          >
            {regenerating ? <Spinner label="Generating…" /> : '⚡ Regenerate Plan'}
          </Button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showRegenerateConfirm}
        onClose={() => setShowRegenerateConfirm(false)}
        onConfirm={handleConfirmRegenerate}
        title="Generate new meal plan?"
        message="Regenerating will call Gemini for new Nigerian recipes and count toward your hourly request limit."
        confirmText="Yes, Regenerate"
        cancelText="Keep Current Plan"
        variant="primary"
        loading={regenerating}
        icon="⚡"
      />

      {/* Error State */}
      <DashboardError error={error} isAdmin={isAdmin} onRetry={refresh} />

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

      {/* Personalised Meals Recommendations Section */}
      <section className="space-y-4 pt-4 border-t border-line">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-fg">Your Recommended Nigerian Meals</h2>
            <p className="text-xs text-muted">Click any meal to view ingredients, cost breakdown and nutrition</p>
          </div>
          {fromCache && (
            <span className="text-xs text-muted">✓ Plan loaded from your saved profile</span>
          )}
        </div>

        <FilterBar
          filters={filters}
          onChange={setFilters}
          perMealCapNGN={perMealCapNGN}
          totalCount={meals.length}
          filteredCount={filteredMeals.length}
        />

        {loading && (
          <div className="flex justify-center py-8">
            <Spinner label="Preparing your Nigerian meal recommendations…" />
          </div>
        )}

        {!loading && filteredMeals.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMeals.map((meal) => (
              <MealCard key={meal.id} meal={meal} perMealCapNGN={perMealCapNGN} isClickable={true} />
            ))}
          </div>
        )}

        {!loading && filteredMeals.length === 0 && meals.length > 0 && (
          <Card className="p-8 text-center space-y-3">
            <span className="text-3xl" aria-hidden="true">🔍</span>
            <h3 className="text-base font-bold text-fg">No meals match active filters</h3>
            <div className="flex justify-center gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => setFilters({ mealType: 'all', condition: 'all', budget: 'all' })}
                className="text-xs min-h-9 px-3"
              >
                Clear filters
              </Button>
            </div>
          </Card>
        )}
      </section>

      {/* Medical Disclaimer */}
      <div className="pt-2">
        <Disclaimer />
      </div>
    </AppShell>
  );
}
