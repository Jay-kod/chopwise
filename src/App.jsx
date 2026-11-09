import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import MealDetail from './pages/MealDetail';
import Saved from './pages/Saved';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import ProtectedRoute from './routes/ProtectedRoute';
import ProfileGate from './routes/ProfileGate';
import AdminRoute from './routes/AdminRoute';
import { AuthProvider } from './features/auth/AuthContext';
import { ToastProvider } from './components/Toast';
import { ConfigProvider } from './context/ConfigContext';
import { ROUTES } from './lib/routes';

function LegacyProfileRedirect() {
  const location = useLocation();
  return (
    <Navigate
      to={`${ROUTES.customer.profile}${location.search}${location.hash}`}
      replace
    />
  );
}

function LegacyMealRedirect() {
  const { id } = useParams();
  return <Navigate to={ROUTES.customer.meal(id)} replace />;
}

function LegacyAdminRedirect() {
  const location = useLocation();
  return (
    <Navigate
      to={`${ROUTES.admin.dashboard}${location.search}${location.hash}`}
      replace
    />
  );
}

export default function App() {
  return (
    <ConfigProvider>
      <AuthProvider>
        <ToastProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path={ROUTES.customer.login} element={<Login />} />
          <Route path={ROUTES.customer.register} element={<Register />} />
          <Route path={ROUTES.admin.login} element={<Login adminOnly={true} />} />

          {/* Protected Area */}
          <Route element={<ProtectedRoute />}>
            {/* Onboarding flow allows incomplete profiles */}
            <Route element={<ProfileGate allowIncomplete={true} />}>
              <Route path={ROUTES.customer.onboarding} element={<Onboarding />} />
            </Route>

            {/* Dashboard, Meal Details, Saved Meals, and Profile require completed profile */}
            <Route element={<ProfileGate allowIncomplete={false} />}>
              <Route path={ROUTES.customer.dashboard} element={<Dashboard />} />
              <Route path={ROUTES.customer.mealPattern} element={<MealDetail />} />
              <Route path={ROUTES.customer.saved} element={<Saved />} />
              <Route path={ROUTES.customer.profile} element={<Profile />} />
            </Route>
          </Route>

          {/* Admin Management Portal */}
          <Route element={<AdminRoute />}>
            <Route path={ROUTES.admin.dashboard} element={<Admin />} />
          </Route>

          <Route path="/login" element={<Navigate to={ROUTES.customer.login} replace />} />
          <Route path="/register" element={<Navigate to={ROUTES.customer.register} replace />} />
          <Route path="/onboarding" element={<Navigate to={ROUTES.customer.onboarding} replace />} />
          <Route path="/dashboard" element={<Navigate to={ROUTES.customer.dashboard} replace />} />
          <Route path="/meal/:id" element={<LegacyMealRedirect />} />
          <Route path="/saved" element={<Navigate to={ROUTES.customer.saved} replace />} />
          <Route path="/profile" element={<LegacyProfileRedirect />} />
          <Route path="/admin" element={<LegacyAdminRedirect />} />

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  </ConfigProvider>
  );
}
