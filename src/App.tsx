import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AccountSettingsPage } from './pages/AccountSettingsPage';
import { ApiDocsPage } from './pages/ApiDocsPage';
import { DashboardPage } from './pages/DashboardPage';
import { EditorPage } from './pages/EditorPage';
import { LandingPage } from './pages/LandingPage';
import { PublicCalendarPage } from './pages/PublicCalendarPage';
import { PublicDayPage } from './pages/PublicDayPage';
import { QrExportPage } from './pages/QrExportPage';
import { StockCalendarsPage } from './pages/StockCalendarsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="samples" element={<StockCalendarsPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="app" element={<DashboardPage />} />
              <Route path="app/account" element={<AccountSettingsPage />} />
              <Route path="app/api-docs" element={<ApiDocsPage />} />
              <Route path="app/c/:slug/edit" element={<EditorPage />} />
              <Route path="app/c/:slug/qr" element={<QrExportPage />} />
            </Route>
          </Route>
          <Route path="c/:slug" element={<PublicCalendarPage />} />
          <Route path="d/:token" element={<PublicDayPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
