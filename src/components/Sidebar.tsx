import { LayoutDashboard, Map, BookOpen, RefreshCcw, CheckSquare, Target, Briefcase, DollarSign, Settings, Heart, Focus, Dumbbell, LogOut } from 'lucide-react';
import { useAuth } from '../lib/auth';

export type Page = 'dashboard' | 'map' | 'journal' | 'habits' | 'tasks' | 'goals' | 'business' | 'finance' | 'body' | 'health' | 'focus' | 'settings';

type NavItem = { id: Page; label: string; icon: React.ReactNode };

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'DASHBOARD', icon: <LayoutDashboard size={15} /> },
  { id: 'map', label: '24H MAP', icon: <Map size={15} /> },
  { id: 'journal', label: 'JOURNAL', icon: <BookOpen size={15} /> },
  { id: 'habits', label: 'HABITS', icon: <RefreshCcw size={15} /> },
  { id: 'tasks', label: 'TASKS', icon: <CheckSquare size={15} /> },
  { id: 'goals', label: 'GOALS', icon: <Target size={15} /> },
  { id: 'business', label: 'BUSINESS', icon: <Briefcase size={15} /> },
  { id: 'finance', label: 'FINANCE', icon: <DollarSign size={15} /> },
  { id: 'body', label: 'BODY', icon: <Dumbbell size={15} /> },
  { id: 'health', label: 'HEALTH', icon: <Heart size={15} /> },
  { id: 'focus', label: 'FOCUS', icon: <Focus size={15} /> },
  { id: 'settings', label: 'SETTINGS', icon: <Settings size={15} /> },
];

type Props = { currentPage: Page; onNavigate: (page: Page) => void };

export default function Sidebar({ currentPage, onNavigate }: Props) {
  const { signOut } = useAuth();
  return (
    <div className="hidden md:flex w-[210px] min-w-[210px] bg-alen-black flex-col h-screen sticky top-0">
      <div className="px-5 pt-6 pb-4 border-b border-white/10">
        <div className="text-white font-mono text-sm font-bold tracking-widest2 leading-none">ALEN</div>
        <div className="text-alen-gray font-mono text-xs tracking-widest mt-1 leading-none">MASTER DIRECTORY</div>
      </div>

      <nav className="flex-1 py-2 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-5 py-2.5 font-mono text-xs tracking-widest transition-colors text-left ${
              currentPage === item.id
                ? 'bg-alen-red text-white border-l-2 border-white'
                : 'text-alen-gray hover:text-white hover:bg-white/5'
            }`}
          >
            <span className={currentPage === item.id ? 'text-white' : 'text-alen-gray'}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-alen-red flex items-center justify-center font-mono text-white text-xs font-bold">A</div>
          <div className="flex-1">
            <div className="text-white font-mono text-xs font-semibold">ALEN_01</div>
            <div className="text-alen-gray font-mono text-xs">SYSTEM OPERATOR</div>
          </div>
          <button onClick={signOut} className="text-alen-gray hover:text-alen-red transition-colors p-1" title="Sign out">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export { navItems };

export function MobileNav({ currentPage, onNavigate }: Props) {
  const { signOut } = useAuth();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-alen-black border-t border-white/10">
      <div className="flex items-center justify-around overflow-x-auto scrollbar-thin no-scrollbar">
        {navItems.map((item) => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center gap-1 px-3 py-2.5 flex-shrink-0 transition-colors ${
                active ? 'text-white' : 'text-alen-gray'
              }`}
            >
              <span className={active ? 'text-white' : 'text-alen-gray'}>
                {item.icon}
              </span>
              <span className="font-mono text-[8px] tracking-widest leading-none">{item.label}</span>
              {active && <span className="absolute bottom-0 w-8 h-0.5 bg-alen-red" />}
            </button>
          );
        })}
        <button
          onClick={signOut}
          className="flex flex-col items-center gap-1 px-3 py-2.5 flex-shrink-0 text-alen-gray hover:text-alen-red transition-colors"
        >
          <LogOut size={15} />
          <span className="font-mono text-[8px] tracking-widest leading-none">EXIT</span>
        </button>
      </div>
    </nav>
  );
}
