'use client';

import { useAppStore } from '@/lib/stores/app-store';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
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
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="h-10 border-t border-slate-200 bg-white px-6 flex items-center justify-between text-sm text-slate-500">
          <span>MeetLink v1.0.0</span>
          <div className="flex items-center space-x-4">
            <a href="#" className="hover:text-emerald-600">Documentation</a>
            <a href="#" className="hover:text-emerald-600">Support</a>
            <a href="#" className="hover:text-emerald-600">API</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
