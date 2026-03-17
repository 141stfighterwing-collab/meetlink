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
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => {
            setCurrentView('events');
            setShowEventTypeModal(true);
          }}
        >
          <CalendarDays className="h-4 w-4 mr-2" />
          Create Event Type
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => {
            setCurrentView('contacts');
            setShowContactModal(true);
          }}
        >
          <Users className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setCurrentView('integrations')}
        >
          <Link2 className="h-4 w-4 mr-2" />
          Connect Calendar
        </Button>

        {/* Booking Link */}
        <div className="pt-3 border-t">
          <p className="text-sm font-medium text-slate-700 mb-2">Your Booking Link</p>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-slate-100 rounded-lg px-3 py-2 text-sm text-slate-600 truncate">
              {bookingLink}
            </div>
            <Button size="icon" variant="ghost">
              <Copy className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
          <Share2 className="h-4 w-4 mr-2" />
          Share Booking Page
        </Button>
      </CardContent>
    </Card>
  );
}
