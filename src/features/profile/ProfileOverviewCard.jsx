import { useState } from 'react';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { formatNaira } from '../../lib/format';
import { AvatarDisplay } from '../auth/preworkedAvatars';
import AvatarPickerModal from '../auth/AvatarPickerModal';
import { CameraIcon } from 'lucide-react';

export default function ProfileOverviewCard({ user, formData, savedCount = 0 }) {
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const budget = Number(formData?.weeklyBudgetNGN) || 0;
  const perMealCap = budget > 0 ? Math.round(budget / 21) : 0;
  const conditions = formData?.conditions || [];
  const preferences = formData?.preferences || [];
  const initial = (user?.email || 'U').charAt(0).toUpperCase();
  const avatarId = user?.avatar || user?.profile?.avatar;

  return (
    <>
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-5">
          <div className="flex items-center gap-3.5">
            <div className="relative size-14 shrink-0 rounded-2xl border-2 border-primary/30 bg-primary-soft overflow-hidden shadow-xs flex items-center justify-center">
              <AvatarDisplay avatarId={avatarId} fallback={initial} className="size-full" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-fg truncate">
                  {user?.email || 'ChopWise User'}
                </h2>
                <Badge variant="ok">Active Profile</Badge>
              </div>
              <p className="text-xs text-muted">
                Personalized health profile for tailored Nigerian meal planning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              onClick={() => setShowAvatarModal(true)}
              className="text-xs min-h-9 px-3"
            >
              <CameraIcon className="size-3.5 mr-1.5 text-primary" />
              Change Picture
            </Button>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-muted px-3 py-1 text-xs font-medium text-fg">
              <span>🔖</span>
              <span>{savedCount} {savedCount === 1 ? 'saved meal' : 'saved meals'}</span>
            </span>
          </div>
        </div>

      <div className="grid grid-cols-2 gap-3 pt-5 sm:grid-cols-4">
        <div className="rounded-xl border border-line bg-surface-muted p-3">
          <span className="text-[11px] font-medium text-muted block">Weekly Budget</span>
          <span className="text-base font-bold text-fg block">{budget > 0 ? formatNaira(budget) : '—'}</span>
          <span className="text-[10px] text-muted">Total food allowance</span>
        </div>

        <div className="rounded-xl border border-line bg-surface-muted p-3">
          <span className="text-[11px] font-medium text-muted block">Target Per Meal</span>
          <span className="text-base font-bold text-primary block">{perMealCap > 0 ? formatNaira(perMealCap) : '—'}</span>
          <span className="text-[10px] text-muted">Budget ÷ 21 meals</span>
        </div>

        <div className="rounded-xl border border-line bg-surface-muted p-3">
          <span className="text-[11px] font-medium text-muted block">Tracked Conditions</span>
          <span className="text-base font-bold text-fg block">
            {conditions.length > 0 ? `${conditions.length} active` : 'None'}
          </span>
          <span className="text-[10px] text-muted truncate block">
            {conditions.join(', ') || 'General diet'}
          </span>
        </div>

        <div className="rounded-xl border border-line bg-surface-muted p-3">
          <span className="text-[11px] font-medium text-muted block">Preferences</span>
          <span className="text-base font-bold text-fg block">
            {preferences.length > 0 ? `${preferences.length} selected` : 'None'}
          </span>
          <span className="text-[10px] text-muted truncate block">
            {preferences.join(', ') || 'No restrictions'}
          </span>
        </div>
      </div>
    </div>

    <AvatarPickerModal
      isOpen={showAvatarModal}
      onClose={() => setShowAvatarModal(false)}
    />
  </>
);
}
