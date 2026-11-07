import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, collection, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../features/auth/useAuth';
import { useToast } from '../components/Toast';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Disclaimer from '../components/Disclaimer';
import SavedMealsList from '../features/meals/SavedMealsList';
import Step1Demographics from '../features/onboarding/steps/Step1Demographics';
import Step2Conditions from '../features/onboarding/steps/Step2Conditions';
import Step3Preferences from '../features/onboarding/steps/Step3Preferences';
import Step4Budget from '../features/onboarding/steps/Step4Budget';
import { profileSchema } from '../features/onboarding/schema';

export default function Profile() {
  const { user, userDoc, logout } = useAuth();
  const addToast = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedMeals, setSavedMeals] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  // Sync profile data from userDoc
  useEffect(() => {
    if (userDoc?.profile) {
      setFormData({
        age: userDoc.profile.age ?? '',
        gender: userDoc.profile.gender ?? '',
        weightKg: userDoc.profile.weightKg ?? '',
        conditions: userDoc.profile.conditions ?? [],
        preferences: userDoc.profile.preferences ?? [],
        avoidText: userDoc.profile.avoidText ?? '',
        weeklyBudgetNGN: userDoc.profile.weeklyBudgetNGN ?? '',
      });
    }
  }, [userDoc]);

  // Real-time listener for saved meals
  useEffect(() => {
    if (!user) return;
    const mealsRef = collection(db, 'users', user.uid, 'savedMeals');
    const unsub = onSnapshot(
      mealsRef,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          meal: d.data().meal,
          savedAt: d.data().savedAt,
        }));
        setSavedMeals(list);
        setLoadingSaved(false);
      },
      () => setLoadingSaved(false)
    );
    return () => unsub();
  }, [user]);

  function handleFieldChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    if (!user || !formData) return;

    const result = profileSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      });
      setErrors(fieldErrors);
      addToast('Please check the form for errors.', 'error');
      return;
    }

    try {
      setSaving(true);
      await updateDoc(doc(db, 'users', user.uid), {
        profile: {
          ...result.data,
          updatedAt: new Date().toISOString(),
        },
        profileComplete: true,
      });
      addToast('Profile updated! Your next meal plan will use these settings.', 'ok');
    } catch (err) {
      addToast(err?.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveSaved(mealId) {
    if (!user || !mealId) return;
    try {
      setRemovingId(mealId);
      await deleteDoc(doc(db, 'users', user.uid, 'savedMeals', mealId));
      addToast('Recipe removed from saved list.', 'ok');
    } catch (err) {
      addToast(err?.message || 'Failed to remove saved recipe.', 'error');
    } finally {
      setRemovingId(null);
    }
  }

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch {
      // Sign-out fallback
    }
  }

  return (
    <Layout>
      <div className="space-y-6 py-2 sm:py-4">
        {/* Header with Account Summary and Logout */}
        <div className="flex flex-col gap-4 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-fg">Account &amp; Settings</h1>
            <p className="mt-1 text-xs text-muted">Signed in as {user?.email}</p>
          </div>
          <Button variant="secondary" onClick={handleLogout} className="text-xs min-h-9 px-3">
            Log out
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-line">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
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
            onClick={() => setActiveTab('saved')}
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
                  <Step1Demographics
                    data={formData}
                    errors={errors}
                    onChange={handleFieldChange}
                  />
                  <div className="border-t border-line pt-6">
                    <Step2Conditions
                      data={formData}
                      errors={errors}
                      onChange={handleFieldChange}
                    />
                  </div>
                  <div className="border-t border-line pt-6">
                    <Step3Preferences
                      data={formData}
                      errors={errors}
                      onChange={handleFieldChange}
                    />
                  </div>
                  <div className="border-t border-line pt-6">
                    <Step4Budget
                      data={formData}
                      errors={errors}
                      onChange={handleFieldChange}
                    />
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
            onRemove={handleRemoveSaved}
            removingId={removingId}
          />
        )}

        <div className="pt-4">
          <Disclaimer />
        </div>
      </div>
    </Layout>
  );
}

