import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import ProtectedRoute from './routes/ProtectedRoute';
import ProfileGate from './routes/ProfileGate';
import AdminRoute from './routes/AdminRoute';
import { AuthProvider } from './features/auth/AuthContext';
import { ToastProvider } from './components/Toast';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Area */}
          <Route element={<ProtectedRoute />}>
            {/* Onboarding flow allows incomplete profiles */}
            <Route element={<ProfileGate allowIncomplete={true} />}>
              <Route path="/onboarding" element={<Onboarding />} />
            </Route>

            {/* Dashboard requires completed profile */}
            <Route element={<ProfileGate allowIncomplete={false} />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            {/* Admin Management Portal */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Route>

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
