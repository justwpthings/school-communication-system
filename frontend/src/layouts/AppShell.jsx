import { useNavigate } from 'react-router-dom';

import { AdminNav } from '../components/AdminNav';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';

export const AppShell = ({ title, subtitle, navigationItems, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen">
      <Navbar title={title} subtitle={subtitle} user={user} onLogout={handleLogout} />
      {navigationItems?.length ? <AdminNav items={navigationItems} /> : null}
      <main className="page-shell mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
};
