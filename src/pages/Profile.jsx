import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';
import { useAuth } from '../features/auth/useAuth';
import { useToast } from '../components/Toast';
import { AppShell } from '@/components/app-shell';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Disclaimer from '../components/Disclaimer';
import ConfirmModal from '../components/ConfirmModal';
import SavedMealsList from '../features/meals/SavedMealsList';
import Step1Demographics from '../features/onboarding/steps/Step1Demographics';
import Step2Conditions from '../features/onboarding/steps/Step2Conditions';
import Step3Preferences from '../features/onboarding/steps/Step3Preferences';
import Step4Budget from '../features/onboarding/steps/Step4Budget';
import { profileSchema } from '../features/onboarding/schema';

export default function Profile() {
  const { user, userDoc, logout, refreshProfile } = useAuth();
  const addToast = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'saved' ? 'saved' : 'profile';

  function handleTabChange(tab) {
    setSearchParams(tab === 'saved' ? { tab: 'saved' } : {});
  }

  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedMeals, setSavedMeals] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mealToRemove, setMealToRemove] = useState(null);

  // Sync profile data from userDoc
  useEffect(() => {
    if (userDoc?.profile) {
      const p = userDoc.profile;
      setFormData({
        age: p.age ?? '', gender: p.gender ?? '', weightKg: p.weightKg ?? '',
        conditions: p.conditions ?? [], preferences: p.preferences ?? [],
        avoidText: p.avoidText ?? '', weeklyBudgetNGN: p.weeklyBudgetNGN ?? '',
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
      const now = new Date().toISOString();
      await apiClient('/api/auth', {
        action: 'update-profile',
        profile: { ...result.data, updatedAt: now },
      });
      await refreshProfile();
      addToast('Profile updated! Your next meal plan will use these settings.', 'ok');
    } catch (err) {
      addToast(err?.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  }

  function promptRemoveSaved(mealId) {
    const target = savedMeals.find((s) => s.id === mealId || s.meal?.id === mealId);
    setMealToRemove(target || { id: mealId, meal: { name: 'this recipe' } });
  }

  async function confirmRemoveSaved() {
    if (!mealToRemove) return;
    const mealId = mealToRemove.id;
    try {
      setRemovingId(mealId);
      await apiClient('/api/auth', { action: 'delete-saved-meal', mealId });
      setSavedMeals((prev) => prev.filter((s) => s.id !== mealId && s.meal?.id !== mealId));
      addToast('Recipe removed from saved list.', 'ok');
    } catch (err) {
      addToast(err?.message || 'Failed to remove saved recipe.', 'error');
    } finally {
      setRemovingId(null);
      setMealToRemove(null);
    }
  }

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch {}
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header with Account Summary and Logout */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-fg">My Profile</h1>
            <p className="mt-0.5 text-xs text-muted">
              Edit your details, weekly budget, health conditions and food preferences.
            </p>
          </div>
          <Button variant="secondary" onClick={() => setShowLogoutConfirm(true)} className="text-xs min-h-9 px-3">
            Log out
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-line">
          <button
            type="button"
            onClick={() => handleTabChange('profile')}
            className={`border-b-2 px-4 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'profile'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-fg'
            }`}
          >
            Health &amp; Budget Profile
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('saved')}
            className={`border-b-2 px-4 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'saved'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-fg'
            }`}
          >
            Saved Recipes ({savedMeals.length})
          </button>
        </div>

        {/* Tab 1: Profile Editor */}
        {activeTab === 'profile' && (
          <div>
            {!formData ? (
              <div className="flex justify-center py-12">
                <Spinner label="Loading profile data…" />
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <Card className="p-5 space-y-6">
                  <Step1Demographics data={formData} errors={errors} onChange={handleFieldChange} />
                  <div className="border-t border-line pt-6">
                    <Step2Conditions data={formData} errors={errors} onChange={handleFieldChange} />
                  </div>
                  <div className="border-t border-line pt-6">
                    <Step3Preferences data={formData} errors={errors} onChange={handleFieldChange} />
                  </div>
                  <div className="border-t border-line pt-6">
                    <Step4Budget data={formData} errors={errors} onChange={handleFieldChange} />
                  </div>
                </Card>

                <div className="flex justify-end gap-3">
                  <Button type="submit" disabled={saving} className="text-xs min-h-10 px-5">
                    {saving ? <Spinner label="Saving…" /> : 'Save Profile Changes'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: Saved Meals */}
        {activeTab === 'saved' && (
          <SavedMealsList
            savedMeals={savedMeals}
            loading={loadingSaved}
            onRemove={promptRemoveSaved}
            removingId={removingId}
          />
        )}

        <div className="pt-4">
          <Disclaimer />
        </div>

        {/* Logout Confirmation */}
        <ConfirmModal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={handleLogout}
          title="Log out of ChopWise?"
          message="Are you sure you want to log out of your account?"
          confirmText="Log out"
          variant="danger"
          icon="🚪"
        />

        {/* Remove Saved Recipe Confirmation */}
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

