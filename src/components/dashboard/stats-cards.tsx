'use client';

import { useAppStore } from '@/lib/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Clock, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const stats = [
  {
    label: 'Total Bookings',
    value: '127',
    change: '+12%',
    trend: 'up',
    icon: CalendarDays,
    color: 'bg-emerald-500',
  },
  {
    label: 'This Week',
    value: '23',
    change: '+8%',
    trend: 'up',
    icon: Clock,
    color: 'bg-blue-500',
  },
  {
    label: 'Completion Rate',
    value: '94%',
    change: '+2%',
    trend: 'up',
    icon: TrendingUp,
    color: 'bg-purple-500',
  },
  {
    label: 'New Contacts',
    value: '45',
    change: '-3%',
    trend: 'down',
    icon: Users,
    color: 'bg-orange-500',
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-sm text-slate-400 ml-1">vs last week</span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-xl`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
