import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import SetPassword from './pages/SetPassword';
import CoachPage from './pages/CoachPage';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Coaches from './pages/Coaches';
import Schools from './pages/Schools';
import Shifts from './pages/Shifts';
import Reports from './pages/Reports';
import Availability from './pages/Availability';
import type { Coach, School, Shift, CoachAvailability } from './types';

export interface AppContext {
  coaches: Coach[];
  schools: School[];
  shifts: Shift[];
  availability: CoachAvailability[];
  addShift: (s: Shift) => void;
  updateShift: (s: Shift) => void;
  deleteShift: (id: string) => void;
  addCoach: (c: Coach) => void;
  updateCoach: (c: Coach) => void;
  addSchool: (s: School) => void;
  updateSchool: (s: School) => void;
  addAvailability: (a: CoachAvailability) => void;
  updateAvailability: (a: CoachAvailability) => void;
  deleteAvailability: (id: string) => void;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/schedule' : '/coach'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/set-password" element={<SetPassword />} />
      <Route path="/" element={<RootRedirect />} />

      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route element={<Layout />}>
          <Route path="/schedule"     element={<Schedule />} />
          <Route path="/dashboard"    element={<Dashboard />} />
          <Route path="/coaches"      element={<Coaches />} />
          <Route path="/schools"      element={<Schools />} />
          <Route path="/shifts"       element={<Shifts />} />
          <Route path="/reports"      element={<Reports />} />
          <Route path="/availability" element={<Availability />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute requiredRole="coach" />}>
        <Route path="/coach" element={<CoachPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
