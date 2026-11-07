import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import ProtectedRoute from './routes/ProtectedRoute';
import ProfileGate from './routes/ProfileGate';
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

          {/* Protected Onboarding Flow */}
          <Route element={<ProtectedRoute />}>
            <Route element={<ProfileGate allowIncomplete={true} />}>
              <Route path="/onboarding" element={<Onboarding />} />
            </Route>
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
