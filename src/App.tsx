import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardPage } from './pages/DashboardPage';
import { EditorPage } from './pages/EditorPage';
import { LandingPage } from './pages/LandingPage';
import { PublicCalendarPage } from './pages/PublicCalendarPage';
import { PublicDayPage } from './pages/PublicDayPage';
import { QrExportPage } from './pages/QrExportPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="app" element={<DashboardPage />} />
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
