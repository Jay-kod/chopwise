import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import { ToastProvider } from './components/Toast';

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* Further routes will be registered as pages are built */}
      </Routes>
    </ToastProvider>
  );
}
