import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';
import { useAuth } from '../features/auth/useAuth';
import { useToast } from '../components/Toast';
import { useNotifications } from '../features/notifications/NotificationContext';
import { AppShell } from '@/components/app-shell';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Disclaimer from '../components/Disclaimer';
import ConfirmModal from '../components/ConfirmModal';
import SavedMealsList from '../features/meals/SavedMealsList';
import ProfileOverviewCard from '../features/profile/ProfileOverviewCard';
import Step1Demographics from '../features/onboarding/steps/Step1Demographics';
import Step2Conditions from '../features/onboarding/steps/Step2Conditions';
import Step3Preferences from '../features/onboarding/steps/Step3Preferences';
import Step4Budget from '../features/onboarding/steps/Step4Budget';
import { profileSchema } from '../features/onboarding/schema';
import { ROUTES } from '../lib/routes';

export default function Profile() {
  const { user, userDoc, logout, refreshProfile } = useAuth();
  const addToast = useToast();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'saved' ? 'saved' : 'profile';

  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedMeals, setSavedMeals] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mealToRemove, setMealToRemove] = useState(null);

  useEffect(() => {
    if (userDoc?.profile) {
      const p = userDoc.profile;
      setFormData({
        age: p.age ?? '', gender: p.gender ?? '', weightKg: p.weightKg ?? '',
        conditions: p.conditions ?? [], preferences: p.preferences ?? [],
        avoidText: p.avoidText ?? '', weeklyBudgetNGN: p.weeklyBudgetNGN ?? '',
        avatar: userDoc.avatar || p.avatar || '',
      });
    }
  }, [userDoc]);

  const loadSaved = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingSaved(true);
      const res = await apiClient('/api/auth', { action: 'get-saved-meals' });
      setSavedMeals(res?.savedMeals || []);
    } catch {
      setSavedMeals([]);
    } finally {
      setLoadingSaved(false);
    }
  }, [user]);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  function handleFieldChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    if (!user || !formData) return;
    const result = profileSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((i) => { if (i.path[0] && !fieldErrors[i.path[0]]) fieldErrors[i.path[0]] = i.message; });
      setErrors(fieldErrors);
      addToast('Please check the form for errors.', 'error');
      return;
    }
    try {
      setSaving(true);
      await apiClient('/api/auth', {
        action: 'update-profile',
        profile: { ...result.data, avatar: user?.avatar || userDoc?.avatar || undefined, updatedAt: new Date().toISOString() },
      });
      await refreshProfile();
      addToast('Profile updated! Your next meal plan will use these settings.', 'ok');
      addNotification({
        type: 'profile',
        title: 'Profile Updated',
        message: 'Your dietary preferences and budget settings were saved.',
        href: '/customer/profile',
        icon: '👤',
      });
    } catch (err) {
      addToast(err?.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function confirmRemoveSaved() {
    if (!mealToRemove) return;
    const mealId = mealToRemove.id;
    try {
      setRemovingId(mealId);
      await apiClient('/api/auth', { action: 'delete-saved-meal', mealId });
      setSavedMeals((prev) => prev.filter((s) => s.id !== mealId && s.meal?.id !== mealId));
      addToast('Recipe removed from saved list.', 'ok');
      addNotification({
        type: 'favourite',
        title: 'Removed from Saved Meals',
        message: `"${mealToRemove.name || 'Recipe'}" was removed from your collection.`,
        href: '/customer/saved',
        icon: '💔',
      });
    } catch (err) {
      addToast(err?.message || 'Failed to remove saved recipe.', 'error');
    } finally {
      setRemovingId(null);
      setMealToRemove(null);
    }
  }

  return (
    <AppShell pathname={ROUTES.customer.profile}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-fg">My Profile &amp; Settings</h1>
            <p className="mt-0.5 text-xs text-muted">
              Configure your body metrics, budget caps, health conditions, and food preferences.
            </p>
          </div>
          <Button variant="secondary" onClick={() => setShowLogoutConfirm(true)} className="text-xs min-h-9 px-3.5">
            Log out
          </Button>
        </div>

        <ProfileOverviewCard user={user} formData={formData} savedCount={savedMeals.length} />

        <div className="flex border-b border-line">
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-fg'
            }`}
          >
            <span>⚙️</span>
            <span>Health &amp; Budget Settings</span>
          </button>
          <button
            type="button"
            onClick={() => setSearchParams({ tab: 'saved' })}
            className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'saved' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-fg'
            }`}
          >
            <span>🔖</span>
            <span>Saved Recipes ({savedMeals.length})</span>
          </button>
        </div>

        {activeTab === 'profile' && (
          <div>
            {!formData ? (
              <div className="flex justify-center py-12"><Spinner label="Loading profile data…" /></div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="p-5 space-y-4">
                    <Step1Demographics data={formData} errors={errors} onChange={handleFieldChange} />
                  </Card>
                  <Card className="p-5 space-y-4">
                    <Step4Budget data={formData} errors={errors} onChange={handleFieldChange} />
                  </Card>
                </div>

                <Card className="p-5 space-y-4">
                  <Step2Conditions data={formData} errors={errors} onChange={handleFieldChange} />
                </Card>

                <Card className="p-5 space-y-4">
                  <Step3Preferences data={formData} errors={errors} onChange={handleFieldChange} />
                </Card>

                <div className="rounded-xl border border-line bg-surface-muted p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-xs text-muted">
                    Changes take effect on your next meal plan recommendation.
                  </p>
                  <Button type="submit" disabled={saving} className="text-xs min-h-10 px-6 sm:w-auto w-full">
                    {saving ? <Spinner label="Saving…" /> : 'Save Profile Changes'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <SavedMealsList
            savedMeals={savedMeals}
            loading={loadingSaved}
            onRemove={(id) => {
              const target = savedMeals.find((s) => s.id === id || s.meal?.id === id);
              setMealToRemove(target || { id, meal: { name: 'this recipe' } });
            }}
            removingId={removingId}
          />
        )}

        <div className="pt-2"><Disclaimer /></div>

        <ConfirmModal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={async () => { await logout(); navigate(ROUTES.customer.login); }}
          title="Log out of ChopWise?"
          message="Are you sure you want to log out of your account?"
          confirmText="Log out"
          variant="danger"
          icon="🚪"
        />

        <ConfirmModal
          isOpen={Boolean(mealToRemove)}
          onClose={() => setMealToRemove(null)}
          onConfirm={confirmRemoveSaved}
          title="Remove from saved recipes?"
          message={`Are you sure you want to remove "${mealToRemove?.meal?.name || 'this recipe'}" from your saved recipes?`}
          confirmText="Remove recipe"
          cancelText="Keep recipe"
          variant="danger"
          loading={Boolean(removingId)}
          icon="🗑️"
        />
      </div>
    </AppShell>
  );
}
