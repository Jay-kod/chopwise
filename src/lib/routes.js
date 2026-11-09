export const ROUTES = {
  home: '/',
  customer: {
    login: '/customer/login',
    register: '/customer/register',
    onboarding: '/customer/onboarding',
    dashboard: '/customer/dashboard',
    mealPrefix: '/customer/meal/',
    mealPattern: '/customer/meal/:id',
    meal: (id) => `/customer/meal/${encodeURIComponent(id)}`,
    saved: '/customer/saved',
    profile: '/customer/profile',
  },
  admin: {
    login: '/admin/login',
    dashboard: '/admin/dashboard',
  },
};
