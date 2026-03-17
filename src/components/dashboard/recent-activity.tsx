'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`${activity.color} p-2 rounded-lg flex-shrink-0`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{activity.message}</p>
                  <p className="text-xs text-slate-400 mt-1">
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
