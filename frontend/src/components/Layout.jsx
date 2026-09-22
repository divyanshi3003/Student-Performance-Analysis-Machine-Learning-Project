import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Activity, 
  Users, 
  Search, 
  Bell, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children, title, subtitle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Assessment', path: '/student/predict', icon: FileText },
    { name: 'Simulator', path: '/student/simulate', icon: Activity },
    { name: 'Teacher Portal', path: '/teacher/dashboard', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-app-bg flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar-bg flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-bg/10 border-white/5">
          <div className="flex items-center gap-2 text-primary-500">
            <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center text-white font-bold">
              EM
            </div>
            <span className="font-bold text-lg text-white">EduMetrics ML</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sidebar-item-active-bg text-sidebar-text-hover border-l-4 border-sidebar-item-active-border -ml-[4px] pl-[11px]'
                    : 'text-sidebar-text hover:bg-sidebar-item-active-bg/50 hover:text-sidebar-text-hover'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-sidebar-item-active-border' : 'text-sidebar-text'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Area in Sidebar */}
        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-sidebar-text hover:bg-sidebar-item-active-bg/50 hover:text-sidebar-text-hover transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-surface border-b border-border-default flex items-center justify-between px-8 shadow-sm z-10">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-text-main leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-9 pr-4 py-1.5 bg-app-bg border border-border-default rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <button className="relative text-text-muted hover:text-text-main transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-status-error-border rounded-full border-2 border-surface"></span>
              </button>
              
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Canvas */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
