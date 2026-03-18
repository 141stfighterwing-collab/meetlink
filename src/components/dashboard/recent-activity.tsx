'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, UserPlus, Settings, Bell } from 'lucide-react';

const activities = [
  {
    id: '1',
    type: 'booking',
    message: 'Sarah Johnson booked a 30 Minute Meeting',
    time: new Date(Date.now() - 5 * 60 * 1000),
    icon: Calendar,
    color: 'bg-emerald-500',
  },
  {
    id: '2',
    type: 'contact',
    message: 'New contact added: Michael Chen',
    time: new Date(Date.now() - 30 * 60 * 1000),
    icon: UserPlus,
    color: 'bg-blue-500',
  },
  {
    id: '3',
    type: 'settings',
    message: 'Availability schedule updated',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000),
    icon: Settings,
    color: 'bg-purple-500',
  },
  {
    id: '4',
    type: 'reminder',
    message: 'Reminder sent for tomorrow\'s meeting',
    time: new Date(Date.now() - 3 * 60 * 60 * 1000),
    icon: Bell,
    color: 'bg-orange-500',
  },
];

export function RecentActivity() {
  return (
    <Card>
      <CardHeader className="pb-2 md:pb-4">
        <CardTitle className="text-base md:text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 md:space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start gap-2 md:gap-3">
                <div className={`${activity.color} p-1.5 md:p-2 rounded-lg flex-shrink-0`}>
                  <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{activity.message}</p>
                  <p className="text-[10px] md:text-xs text-slate-400 mt-0.5">
                    {formatDistanceToNow(activity.time, { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
