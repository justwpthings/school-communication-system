import { Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthPage } from './pages/AuthPage';
import { ClassesPage } from './pages/ClassesPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ParentDashboard } from './pages/ParentDashboard';
import { ParentsPage } from './pages/ParentsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { SettingsPage } from './pages/SettingsPage';
import { StudentsPage } from './pages/StudentsPage';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { TeachersPage } from './pages/TeachersPage';
import { TermsPage } from './pages/TermsPage';

const HomeRedirect = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user?.role) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <Navigate to="/login" replace />;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user?.role) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
};

const App = () => (
  <Routes>
    <Route path="/" element={<HomeRedirect />} />
    <Route
      path="/login"
      element={
        <PublicOnlyRoute>
          <AuthPage />
        </PublicOnlyRoute>
      }
    />
    <Route
      path="/signup"
      element={
        <PublicOnlyRoute>
          <AuthPage />
        </PublicOnlyRoute>
      }
    />
    <Route path="/terms" element={<TermsPage />} />
    <Route path="/privacy" element={<PrivacyPage />} />
    <Route
      path="/admin"
      element={
        <ProtectedRoute roles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/teachers"
      element={
        <ProtectedRoute roles={['admin']}>
          <TeachersPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/students"
      element={
        <ProtectedRoute roles={['admin']}>
          <StudentsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/parents"
      element={
        <ProtectedRoute roles={['admin']}>
          <ParentsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/classes"
      element={
        <ProtectedRoute roles={['admin']}>
          <ClassesPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/settings"
      element={
        <ProtectedRoute roles={['admin']}>
          <SettingsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/teacher"
      element={
        <ProtectedRoute roles={['teacher']}>
          <TeacherDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/parent"
      element={
        <ProtectedRoute roles={['parent']}>
          <ParentDashboard />
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default App;
