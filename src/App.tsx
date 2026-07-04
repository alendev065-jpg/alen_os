import { useState } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import Sidebar, { Page, MobileNav } from './components/Sidebar';
import AuthPortal from './pages/AuthPortal';
import Dashboard from './pages/Dashboard';
import ActivityMap from './pages/ActivityMap';
import Finance from './pages/Finance';
import Journal from './pages/Journal';
import Tasks from './pages/Tasks';
import Habits from './pages/Habits';
import Goals from './pages/Goals';
import Body from './pages/Body';
import Health from './pages/Health';
import Focus from './pages/Focus';
import Settings from './pages/Settings';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState<Page>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-alen-black flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-alen-red" />
      </div>
    );
  }

  if (!user) {
    return <AuthPortal />;
  }

  function renderPage() {
    switch (page) {
      case 'dashboard':
      case 'business':
        return <Dashboard onNavigate={setPage} />;
      case 'map':
        return <ActivityMap />;
      case 'finance':
        return <Finance />;
      case 'journal':
        return <Journal />;
      case 'tasks':
        return <Tasks />;
      case 'habits':
        return <Habits />;
      case 'goals':
        return <Goals />;
      case 'body':
        return <Body />;
      case 'health':
        return <Health />;
      case 'focus':
        return <Focus />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={setPage} />;
    }
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar currentPage={page} onNavigate={setPage} />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {renderPage()}
      </main>
      <MobileNav currentPage={page} onNavigate={setPage} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
