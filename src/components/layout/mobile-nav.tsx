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
  Video,
  X,
} from 'lucide-react';
import type { ViewMode } from '@/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

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

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const { currentView, setCurrentView, user } = useAppStore();

  const handleNavigation = (view: ViewMode) => {
    setCurrentView(view);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] p-0 bg-slate-900 border-r border-slate-700">
        {/* Logo Header */}
        <SheetHeader className="p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
            <div className="flex items-center">
              <Video className="h-8 w-8 text-emerald-400 flex-shrink-0" />
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                MeetLink
              </span>
            </div>
          </div>
        </SheetHeader>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={cn(
                'w-full flex items-center px-3 py-3 rounded-lg transition-colors text-left',
                currentView === item.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="ml-3 text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Profile Section */}
        {user && (
          <div className="p-4 border-t border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold text-lg">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
