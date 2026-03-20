'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MobileNav } from '@/components/layout/mobile-nav';
import { DashboardOverview } from '@/components/dashboard/overview';
import { EventList } from '@/components/events/event-list';
import { BookingCalendar } from '@/components/bookings/booking-calendar';
import { ContactList } from '@/components/contacts/contact-list';
import { ScheduleEditor } from '@/components/availability/schedule-editor';
import { CalendarIntegrations } from '@/components/integrations/calendar-integrations';
import { WorkflowList } from '@/components/workflows/workflow-list';
import { SettingsPanel } from '@/components/settings/settings-panel';

export default function MeetLinkApp() {
  const { currentView } = useAppStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'events':
        return <EventList />;
      case 'bookings':
        return <BookingCalendar />;
      case 'contacts':
        return <ContactList />;
      case 'availability':
        return <ScheduleEditor />;
      case 'integrations':
        return <CalendarIntegrations />;
      case 'workflows':
        return <WorkflowList />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Navigation Drawer */}
      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <Header onMenuClick={() => setMobileNavOpen(true)} />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-3 md:p-4 lg:p-6">
          {renderContent()}
        </main>

        {/* Footer - Hidden on Mobile */}
        <footer className="hidden md:flex h-10 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>MeetLink v1.0.0</span>
          <div className="flex items-center space-x-4">
            <a href="#" className="hover:text-emerald-600 transition-colors">Documentation</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Support</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">API</a>
          </div>
        </footer>

        {/* Mobile Footer - Minimal */}
        <footer className="md:hidden h-8 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 flex items-center justify-center text-xs text-slate-400">
          <span>MeetLink v1.0.0</span>
        </footer>
      </div>
    </div>
  );
}
