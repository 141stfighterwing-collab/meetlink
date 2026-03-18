'use client';

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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="relative overflow-hidden">
            <CardContent className="p-3 md:p-4 lg:p-6">
              <div className="flex flex-col h-full justify-between">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-1">{stat.label}</p>
                  <div className={`${stat.color} p-1.5 md:p-2 lg:p-3 rounded-lg md:rounded-xl flex-shrink-0 ml-2`}>
                    <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-6 lg:w-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
                  <div className="flex items-center mt-1">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
                    )}
                    <span
                      className={`text-xs md:text-sm font-medium ${
                        stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="hidden sm:inline text-xs text-slate-400 ml-1">vs last week</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
