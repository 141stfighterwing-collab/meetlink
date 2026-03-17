'use client';

import { useAppStore } from '@/lib/stores/app-store';
import { Bell, Search, Moon, Sun, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const viewTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  events: 'Event Types',
  bookings: 'Bookings',
  contacts: 'Contacts',
  availability: 'Availability',
  integrations: 'Integrations',
  workflows: 'Workflows',
  settings: 'Settings',
};

export function Header() {
  const { currentView, theme, toggleTheme, user, setShowEventTypeModal, setShowContactModal } = useAppStore();

  const handleQuickAction = () => {
    if (currentView === 'events') {
      setShowEventTypeModal(true);
    } else if (currentView === 'contacts') {
      setShowContactModal(true);
    }
  };

  const showQuickAction = currentView === 'events' || currentView === 'contacts';

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-semibold text-slate-800">{viewTitles[currentView] || 'Dashboard'}</h1>
        {showQuickAction && (
          <Button onClick={handleQuickAction} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            {currentView === 'events' ? 'New Event Type' : 'Add Contact'}
          </Button>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search..."
            className="w-64 pl-10 bg-slate-50 border-slate-200"
          />
        </div>

        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start p-3">
              <p className="font-medium">New booking request</p>
              <p className="text-sm text-slate-500">Sarah Johnson wants to book a 30min meeting</p>
              <p className="text-xs text-slate-400 mt-1">5 minutes ago</p>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start p-3">
              <p className="font-medium">Meeting reminder</p>
              <p className="text-sm text-slate-500">You have a meeting in 30 minutes</p>
              <p className="text-xs text-slate-400 mt-1">25 minutes ago</p>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start p-3">
              <p className="font-medium">Calendar synced</p>
              <p className="text-sm text-slate-500">Google Calendar sync completed successfully</p>
              <p className="text-xs text-slate-400 mt-1">1 hour ago</p>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-emerald-600 font-medium">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-emerald-600 text-white">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline font-medium">{user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>My Event Types</DropdownMenuItem>
            <DropdownMenuItem>My Bookings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Help & Support</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
