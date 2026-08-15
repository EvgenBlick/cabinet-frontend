import { Routes, Route, Navigate } from 'react-router';
import { FreshThemeProvider } from './FreshThemeContext';
import { FreshDashboardPage } from './pages/FreshDashboardPage';
import { FreshConnectionPage } from './pages/FreshConnectionPage';
import { FreshSubscriptionPage } from './pages/FreshSubscriptionPage';
import { FreshNewsPage } from './pages/FreshNewsPage';
import { FreshProfilePage } from './pages/FreshProfilePage';
import { FreshLoginPage } from './pages/FreshLoginPage';
import { FreshSupportModal } from './components/FreshSupportModal';

export function FreshAppShell() {
  return (
    <FreshThemeProvider>
      <div className="fresh-theme-root min-h-screen bg-[#060907]">
        <Routes>
          <Route path="/" element={<FreshDashboardPage />} />
          <Route path="/login" element={<FreshLoginPage />} />
          <Route path="/connection" element={<FreshConnectionPage />} />
          <Route path="/subscription" element={<FreshSubscriptionPage />} />
          <Route path="/news" element={<FreshNewsPage />} />
          <Route path="/profile" element={<FreshProfilePage />} />
          <Route path="*" element={<Navigate to="/fresh" replace />} />
        </Routes>
        <FreshSupportModal />
      </div>
    </FreshThemeProvider>
  );
}

export default FreshAppShell;
