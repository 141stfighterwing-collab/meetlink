'use client';

import { useAppStore } from '@/lib/stores/app-store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CalendarDays,
  Calendar,
  Users,
  Clock,
  Link2,
  Workflow,
  Settings,
  ChevronLeft,
  ChevronRight,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ViewMode } from '@/types';

const navigationItems: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { id: 'events', label: 'Event Types', icon: <CalendarDays className="h-5 w-5" /> },
  { id: 'bookings', label: 'Bookings', icon: <Calendar className="h-5 w-5" /> },
  { id: 'contacts', label: 'Contacts', icon: <Users className="h-5 w-5" /> },
  { id: 'availability', label: 'Availability', icon: <Clock className="h-5 w-5" /> },
  { id: 'integrations', label: 'Integrations', icon: <Link2 className="h-5 w-5" /> },
  { id: 'workflows', label: 'Workflows', icon: <Workflow className="h-5 w-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
];

export function Sidebar() {
  const { currentView, setCurrentView, sidebarOpen, toggleSidebar, user } = useAppStore();

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-slate-900 text-white transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-slate-700">
        <Video className="h-8 w-8 text-emerald-400 flex-shrink-0" />
        {sidebarOpen && (
          <span className="ml-3 text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            MeetLink
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={cn(
              'w-full flex items-center px-3 py-2.5 rounded-lg transition-colors',
              currentView === item.id
                ? 'bg-emerald-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            )}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {sidebarOpen && <span className="ml-3 text-sm font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* User Profile */}
      {sidebarOpen && user && (
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-white hover:bg-slate-600 z-10"
      >
        {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
    </aside>
  );
}
