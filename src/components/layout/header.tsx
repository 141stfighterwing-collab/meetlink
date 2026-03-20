'use client';

import { useAppStore } from '@/lib/stores/app-store';
import { Bell, Search, Moon, Sun, Plus, Menu, Video } from 'lucide-react';
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
import { cn } from '@/lib/utils';

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

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
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
    <header className="h-14 md:h-16 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 md:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left Section */}
      <div className="flex items-center space-x-2 md:space-x-4 min-w-0 flex-1">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden flex-shrink-0 h-9 w-9"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Mobile Logo */}
        <div className="flex items-center lg:hidden flex-shrink-0">
          <Video className="h-6 w-6 text-emerald-500" />
        </div>

        {/* Desktop Title */}
        <h1 className="hidden md:block text-xl md:text-2xl font-semibold text-slate-800 dark:text-white truncate">
          {viewTitles[currentView] || 'Dashboard'}
        </h1>

        {/* Quick Action Button */}
        {showQuickAction && (
          <Button 
            onClick={handleQuickAction} 
            className="bg-emerald-600 hover:bg-emerald-700 h-8 md:h-10"
            size="sm"
          >
            <Plus className="h-4 w-4 md:mr-2" />
            <span className="hidden sm:inline">
              {currentView === 'events' ? 'New Event Type' : 'Add Contact'}
            </span>
          </Button>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-1 md:space-x-3">
        {/* Mobile Title (centered on mobile) - shown between menu and actions */}
        <h1 className="md:hidden text-base font-semibold text-slate-800 dark:text-white truncate max-w-[120px]">
          {viewTitles[currentView] || 'Dashboard'}
        </h1>

        {/* Search - Desktop Only */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search..."
            className="w-48 xl:w-64 pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          />
        </div>

        {/* Theme Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          className="h-9 w-9"
        >
          {theme === 'light' ? <Moon className="h-4 w-4 md:h-5 md:w-5" /> : <Sun className="h-4 w-4 md:h-5 md:w-5" />}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-4 w-4 md:h-5 md:w-5" />
              <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 md:h-5 md:w-5 p-0 flex items-center justify-center bg-red-500 text-white text-[10px] md:text-xs">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 md:w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start p-3">
              <p className="font-medium text-sm">New booking request</p>
              <p className="text-xs text-slate-500">Sarah Johnson wants to book a 30min meeting</p>
              <p className="text-xs text-slate-400 mt-1">5 minutes ago</p>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start p-3">
              <p className="font-medium text-sm">Meeting reminder</p>
              <p className="text-xs text-slate-500">You have a meeting in 30 minutes</p>
              <p className="text-xs text-slate-400 mt-1">25 minutes ago</p>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start p-3">
              <p className="font-medium text-sm">Calendar synced</p>
              <p className="text-xs text-slate-500">Google Calendar sync completed successfully</p>
              <p className="text-xs text-slate-400 mt-1">1 hour ago</p>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-emerald-600 font-medium text-sm">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-1 md:space-x-2 h-9 px-2">
              <Avatar className="h-7 w-7 md:h-8 md:w-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-emerald-600 text-white text-xs md:text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden lg:inline font-medium text-sm">{user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 md:w-56">
            <DropdownMenuLabel className="text-sm">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-sm">Profile</DropdownMenuItem>
            <DropdownMenuItem className="text-sm">My Event Types</DropdownMenuItem>
            <DropdownMenuItem className="text-sm">My Bookings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-sm">Help & Support</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 text-sm">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
