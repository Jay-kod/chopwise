import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
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
          {/* Note: /onboarding will be registered in Task P4 once Onboarding page is built */}
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
