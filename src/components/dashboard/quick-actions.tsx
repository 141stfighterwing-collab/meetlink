'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Users, Link2, Share2, Copy, ExternalLink } from 'lucide-react';
import { useAppStore } from '@/lib/stores/app-store';

export function QuickActions() {
  const { setCurrentView, setShowEventTypeModal, setShowContactModal, user } = useAppStore();

  const bookingLink = `meetlink.io/${user?.name?.toLowerCase().replace(' ', '-') || 'user'}`;

  return (
    <Card>
      <CardHeader className="pb-2 md:pb-4">
        <CardTitle className="text-base md:text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 md:space-y-3 pt-0">
        <Button
          variant="outline"
          className="w-full justify-start h-9 md:h-10"
          onClick={() => {
            setCurrentView('events');
            setShowEventTypeModal(true);
          }}
        >
          <CalendarDays className="h-4 w-4 mr-2" />
          <span className="text-sm">Create Event Type</span>
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start h-9 md:h-10"
          onClick={() => {
            setCurrentView('contacts');
            setShowContactModal(true);
          }}
        >
          <Users className="h-4 w-4 mr-2" />
          <span className="text-sm">Add Contact</span>
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start h-9 md:h-10"
          onClick={() => setCurrentView('integrations')}
        >
          <Link2 className="h-4 w-4 mr-2" />
          <span className="text-sm">Connect Calendar</span>
        </Button>

        {/* Booking Link */}
        <div className="pt-2 md:pt-3 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your Booking Link</p>
          <div className="flex items-center gap-1 md:gap-2">
            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm text-slate-600 dark:text-slate-400 truncate">
              {bookingLink}
            </div>
            <Button size="icon" variant="ghost" className="h-8 w-8 md:h-9 md:w-9 flex-shrink-0">
              <Copy className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 md:h-9 md:w-9 flex-shrink-0 hidden sm:flex">
              <ExternalLink className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </Button>
          </div>
        </div>

        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-9 md:h-10">
          <Share2 className="h-4 w-4 mr-2" />
          <span className="text-sm">Share Booking Page</span>
        </Button>
      </CardContent>
    </Card>
  );
}
