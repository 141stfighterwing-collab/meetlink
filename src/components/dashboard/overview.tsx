'use client';

import { useAppStore } from '@/lib/stores/app-store';
import { StatsCards } from './stats-cards';
import { UpcomingBookings } from './upcoming-bookings';
import { RecentActivity } from './recent-activity';
import { QuickActions } from './quick-actions';

export function DashboardOverview() {
  const { user } = useAppStore();

  return (
    <div className="space-y-4 md:space-y-6 max-w-full">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-4 md:p-6 text-white">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold">
          Welcome back, {user?.name?.split(' ')[0] || 'there'}!
        </h2>
        <p className="mt-1 text-sm md:text-base text-emerald-100 line-clamp-2 md:line-clamp-none">
          You have 4 upcoming meetings today. Here&apos;s what&apos;s happening with your schedule.
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Upcoming Bookings - Takes 2 columns on desktop */}
        <div className="lg:col-span-2">
          <UpcomingBookings />
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="space-y-4 md:space-y-6">
          <QuickActions />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
