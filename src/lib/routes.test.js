import { describe, expect, it } from 'vitest';
import { ROUTES } from './routes';

describe('route configuration', () => {
  it('defines the core customer routes', () => {
    expect(ROUTES.customer.dashboard).toBe('/customer/dashboard');
    expect(ROUTES.customer.saved).toBe('/customer/saved');
    expect(ROUTES.customer.profile).toBe('/customer/profile');
    expect(ROUTES.customer.onboarding).toBe('/customer/onboarding');
    expect(ROUTES.customer.login).toBe('/customer/login');
    expect(ROUTES.customer.register).toBe('/customer/register');
    expect(ROUTES.customer.mealPattern).toBe('/customer/meal/:id');
    expect(ROUTES.customer.meal('123')).toBe('/customer/meal/123');
  });

  it('defines the core admin routes', () => {
    expect(ROUTES.admin.dashboard).toBe('/admin/dashboard');
    expect(ROUTES.admin.login).toBe('/admin/login');
    expect(ROUTES.admin.functions).toBe('/admin/functions');
    expect(ROUTES.admin.gemini).toBe('/admin/gemini');
    expect(ROUTES.admin.edamam).toBe('/admin/edamam');
    expect(ROUTES.admin.settings).toBe('/admin/settings');
    expect(ROUTES.admin.safety).toBe('/admin/safety');
    expect(ROUTES.admin.prices).toBe('/admin/prices');
    expect(ROUTES.admin.checklist).toBe('/admin/checklist');
    expect(ROUTES.admin.evaluation).toBe('/admin/evaluation');
  });

  it('keeps the public landing page at the root', () => {
    expect(ROUTES.home).toBe('/');
  });
});
