import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  School,
  ClipboardList,
  BarChart3,
  CalendarCheck,
  LogOut,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/schedule',     icon: CalendarDays,   label: 'Schedule' },
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/availability', icon: CalendarCheck,   label: 'Availability' },
  { to: '/coaches',      icon: Users,           label: 'Coaches' },
  { to: '/schools',      icon: School,          label: 'Schools' },
  { to: '/shifts',       icon: ClipboardList,   label: 'Shifts' },
  { to: '/reports',      icon: BarChart3,       label: 'Reports' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="fixed top-0 left-0 h-full w-56 bg-slate-900 flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-800 flex items-center justify-center">
            <span className="text-white font-bold text-sm">SPS</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">SPS Scheduler</p>
            <p className="text-slate-400 text-xs">Sports Programs</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-red-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white',
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-700 space-y-3">
        <div className="px-1">
          <p className="text-slate-500 text-xs">Signed in as</p>
          <p className="text-slate-300 text-sm font-medium truncate">{user?.email ?? user?.name}</p>
          <p className="text-slate-500 text-xs capitalize">{user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg text-sm font-medium transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
