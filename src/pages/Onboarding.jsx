import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';
import { useAuth } from '../features/auth/useAuth';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Step1Demographics from '../features/onboarding/steps/Step1Demographics';
import Step2Conditions from '../features/onboarding/steps/Step2Conditions';
import Step3Preferences from '../features/onboarding/steps/Step3Preferences';
import Step4Budget from '../features/onboarding/steps/Step4Budget';
import {
  profileSchema,
  validateOnboardingStep,
} from '../features/onboarding/schema';

const TOTAL_STEPS = 4;

export default function Onboarding() {
  const { user, userDoc } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    weightKg: '',
    conditions: [],
    preferences: [],
    avoidText: '',
    weeklyBudgetNGN: 20000,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Pre-fill if profile already exists in Firestore
  useEffect(() => {
    if (userDoc?.profile) {
      setFormData({
        age: userDoc.profile.age ?? '',
        gender: userDoc.profile.gender ?? '',
        weightKg: userDoc.profile.weightKg ?? '',
        conditions: userDoc.profile.conditions || [],
        preferences: userDoc.profile.preferences || [],
        avoidText: userDoc.profile.avoidText || '',
        weeklyBudgetNGN: userDoc.profile.weeklyBudgetNGN ?? 20000,
      });
    }
  }, [userDoc]);

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function validateCurrentStep() {
    setErrors({});
    const result = validateOnboardingStep(step, formData);
    if (!result.success) {
      setErrors(result.errors || {});
      return false;
    }
    return true;
  }

  function handleNext() {
    if (!validateCurrentStep()) return;
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  }

  function handleBack() {
    setErrors({});
    setStep((prev) => Math.max(prev - 1, 1));
  }

  async function handleSave() {
    if (!validateCurrentStep()) return;

    const fullProfile = {
      age: Number(formData.age),
      gender: formData.gender,
      weightKg: Number(formData.weightKg),
      conditions: formData.conditions || [],
      preferences: formData.preferences || [],
      avoidText: formData.avoidText ? formData.avoidText.trim() : '',
      weeklyBudgetNGN: Number(formData.weeklyBudgetNGN),
    };

    const parsed = profileSchema.safeParse(fullProfile);
    if (!parsed.success) {
      const fieldErrors = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path[0]] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      setSaving(true);
      const now = new Date().toISOString();
      await apiClient('/api/auth', {
        action: 'update-profile',
        profile: {
          ...parsed.data,
          updatedAt: now,
        },
      });

      navigate('/dashboard');
    } catch (err) {
      setErrors({ form: err.message || 'Failed to save profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  const progressPercent = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <Layout>
      <div className="mx-auto max-w-xl py-6 sm:py-10">
        <Card className="p-6 sm:p-8">
          {/* Header & Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>
                Step {step} of {TOTAL_STEPS}
              </span>
              <span>{progressPercent}% Complete</span>
            </div>
            {/* Visual Progress Bar */}
            <div
              className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-muted border border-line"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {errors.form && (
            <div
              className="mb-4 rounded-lg border border-danger-line bg-danger-bg p-3 text-xs text-danger-fg"
              role="alert"
            >
              {errors.form}
            </div>
          )}

          {/* Current Step Body */}
          <div className="min-h-[260px]">
            {step === 1 && (
              <Step1Demographics
                data={formData}
                errors={errors}
                onChange={handleChange}
              />
            )}
            {step === 2 && (
              <Step2Conditions
                data={formData}
                onChange={handleChange}
              />
            )}
            {step === 3 && (
              <Step3Preferences
                data={formData}
                errors={errors}
                onChange={handleChange}
              />
            )}
            {step === 4 && (
              <Step4Budget
                data={formData}
                errors={errors}
                onChange={handleChange}
              />
            )}
          </div>

          {/* Navigation Controls */}
          <div className="mt-8 flex items-center justify-between border-t border-line pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
              disabled={step === 1 || saving}
            >
              Back
            </Button>

            {step < TOTAL_STEPS ? (
              <Button type="button" onClick={handleNext}>
                Continue
              </Button>
            ) : (
              <Button type="button" onClick={handleSave} disabled={saving}>
                {saving ? <Spinner label="Saving profile…" /> : 'Complete Setup'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
