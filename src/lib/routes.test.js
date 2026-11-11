import { describe, expect, it } from 'vitest';
import { ROUTES } from './routes';
import { adminNavGroups, customerNavGroups } from '../components/app-shared';
import { isItemActive, navItemClassName, CATEGORY_STYLES } from '../components/nav-group';

describe('route configuration', () => {
  it('defines the core customer routes', () => {
    expect(ROUTES.customer.dashboard).toBe('/customer/dashboard');
    expect(ROUTES.customer.analysis).toBe('/customer/analysis');
    expect(ROUTES.customer.meals).toBe('/customer/meals');
    expect(ROUTES.customer.saved).toBe('/customer/saved');
    expect(ROUTES.customer.profile).toBe('/customer/profile');
    expect(ROUTES.customer.onboarding).toBe('/customer/onboarding');
    expect(ROUTES.customer.login).toBe('/customer/login');
    expect(ROUTES.customer.register).toBe('/customer/register');
    expect(ROUTES.customer.recipes).toBe('/customer/recipes');
    expect(ROUTES.customer.mealPattern).toBe('/customer/meal/:id');
    expect(ROUTES.customer.meal('123')).toBe('/customer/meal/123');
  });

  it('defines the core admin routes', () => {
    expect(ROUTES.admin.dashboard).toBe('/admin/dashboard');
    expect(ROUTES.admin.analysis).toBe('/admin/analysis');
    expect(ROUTES.admin.login).toBe('/admin/login');
    expect(ROUTES.admin.integrations).toBe('/admin/integrations');
    expect(ROUTES.admin.functions).toBe('/admin/functions');
    expect(ROUTES.admin.gemini).toBe('/admin/gemini');
    expect(ROUTES.admin.usda).toBe('/admin/usda');
    expect(ROUTES.admin.settings).toBe('/admin/settings');
    expect(ROUTES.admin.safety).toBe('/admin/safety');
    expect(ROUTES.admin.prices).toBe('/admin/prices');
    expect(ROUTES.admin.checklist).toBe('/admin/checklist');
    expect(ROUTES.admin.evaluation).toBe('/admin/evaluation');
    expect(ROUTES.admin.customers).toBe('/admin/customers');
    expect(ROUTES.admin.recipes).toBe('/admin/recipes');
    expect(ROUTES.admin.activity).toBe('/admin/activity');
    expect(ROUTES.admin.access).toBe('/admin/access');
    expect(ROUTES.admin.maintenance).toBe('/admin/maintenance');
  });

  it('ensures admin navigation excludes customer routes and includes Admin Dashboard', () => {
    const allAdminItems = adminNavGroups.flatMap((group) => group.items);
    const hasCustomerRoute = allAdminItems.some((item) => item.path.startsWith('/customer/'));
    expect(hasCustomerRoute).toBe(false);

    const dashboardItem = allAdminItems.find((item) => item.path === ROUTES.admin.dashboard);
    expect(dashboardItem).toBeDefined();
    expect(dashboardItem.title).toBe('Admin Dashboard');
  });

  it('keeps the public landing page at the root', () => {
    expect(ROUTES.home).toBe('/');
  });

  it('exposes catalogue and management routes in the appropriate navigation', () => {
    expect(customerNavGroups).toHaveLength(3);
    const customerPaths = customerNavGroups.flatMap((group) => group.items.map((item) => item.path));
    const adminPaths = adminNavGroups.flatMap((group) => group.items.map((item) => item.path));
    expect(customerPaths).toEqual([
      ROUTES.customer.dashboard,
      ROUTES.customer.analysis,
      ROUTES.customer.meals,
      ROUTES.customer.saved,
      ROUTES.customer.recipes,
      ROUTES.customer.profile,
    ]);
    const mealsItem = customerNavGroups.flatMap((group) => group.items).find((item) => item.path === ROUTES.customer.meals);
    expect(mealsItem?.title).toBe('Meals');
    expect(adminNavGroups.length).toBeGreaterThan(1);
    expect(adminPaths).toEqual(expect.arrayContaining([
      ROUTES.admin.integrations,
      ROUTES.admin.analysis,
      ROUTES.admin.customers,
      ROUTES.admin.recipes,
      ROUTES.admin.activity,
      ROUTES.admin.access,
      ROUTES.admin.maintenance,
    ]));
  });

  it('marks the correct customer and admin sidebar destinations as active', () => {
    expect(isItemActive(ROUTES.customer.dashboard, ROUTES.customer.dashboard)).toBe(true);
    expect(isItemActive(ROUTES.customer.dashboard, `${ROUTES.customer.mealPrefix}meal-1`)).toBe(true);
    expect(isItemActive(ROUTES.customer.analysis, ROUTES.customer.dashboard)).toBe(false);
    expect(isItemActive(ROUTES.admin.dashboard, ROUTES.admin.dashboard)).toBe(true);
    expect(isItemActive(ROUTES.admin.analysis, ROUTES.admin.dashboard)).toBe(false);
  });

  it('uses the same accessible selected-row styling for dashboard navigation', () => {
    const activeClassName = navItemClassName(true);
    expect(activeClassName).toContain('bg-surface-muted');
    expect(activeClassName).toContain('before:bg-primary');
    expect(activeClassName).toContain('focus-visible:ring-ring');
    expect(activeClassName).toContain('rounded-md');
    expect(activeClassName).not.toContain('rounded-xl');
    expect(navItemClassName(false)).not.toContain('before:bg-primary');
  });

  it('assigns distinctive semantic color categories to customer and admin navigation groups', () => {
    const customerCategories = customerNavGroups.map((group) => group.category);
    expect(customerCategories).toEqual(['planning', 'meals', 'health']);
    customerCategories.forEach((category) => {
      expect(CATEGORY_STYLES[category]).toBeDefined();
      expect(CATEGORY_STYLES[category].badge).toBeDefined();
      expect(CATEGORY_STYLES[category].dot).toBeDefined();
    });

    const adminCategories = adminNavGroups.map((group) => group.category);
    expect(adminCategories).toEqual(['planning', 'meals', 'engine', 'governance']);
    adminCategories.forEach((category) => {
      expect(CATEGORY_STYLES[category]).toBeDefined();
      expect(CATEGORY_STYLES[category].badge).toBeDefined();
      expect(CATEGORY_STYLES[category].dot).toBeDefined();
    });
  });
});
