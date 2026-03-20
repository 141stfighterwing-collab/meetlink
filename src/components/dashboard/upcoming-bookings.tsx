'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Video, MapPin, MoreHorizontal, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, parseISO } from 'date-fns';

const upcomingBookings = [
  {
    id: '1',
    guestName: 'Sarah Johnson',
    guestEmail: 'sarah.johnson@techcorp.com',
    eventTypeName: '30 Minute Meeting',
    startTime: '2025-03-17T10:00:00',
    endTime: '2025-03-17T10:30:00',
    location: 'Zoom',
    status: 'CONFIRMED',
    color: '#10B981',
  },
  {
    id: '2',
    guestName: 'Michael Chen',
    guestEmail: 'michael.chen@startup.io',
    eventTypeName: 'Product Demo',
    startTime: '2025-03-17T11:30:00',
    endTime: '2025-03-17T12:00:00',
    location: 'Google Meet',
    status: 'CONFIRMED',
    color: '#3B82F6',
  },
  {
    id: '3',
    guestName: 'Emily Rodriguez',
    guestEmail: 'emily.r@design.co',
    eventTypeName: 'Design Review',
    startTime: '2025-03-17T14:00:00',
    endTime: '2025-03-17T14:45:00',
    location: 'Phone Call',
    status: 'PENDING',
    color: '#8B5CF6',
  },
  {
    id: '4',
    guestName: 'David Kim',
    guestEmail: 'david.kim@enterprise.com',
    eventTypeName: 'Sales Call',
    startTime: '2025-03-17T16:00:00',
    endTime: '2025-03-17T16:30:00',
    location: 'Microsoft Teams',
    status: 'CONFIRMED',
    color: '#F59E0B',
  },
];

export function UpcomingBookings() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 md:pb-4">
        <CardTitle className="text-base md:text-lg font-semibold">Today&apos;s Schedule</CardTitle>
        <Button variant="ghost" size="sm" className="text-emerald-600 h-8 text-xs md:text-sm">
          View All
        </Button>
      </CardHeader>
      <CardContent className="pt-0 md:pt-2">
        <div className="space-y-2 md:space-y-3">
          {upcomingBookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-start gap-2 md:gap-4 p-3 md:p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {/* Time Column - Hidden on small mobile */}
              <div className="hidden sm:flex flex-shrink-0 flex-col items-center w-16">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                  {format(parseISO(booking.startTime), 'h:mm')}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {format(parseISO(booking.endTime), 'h:mm a')}
                </p>
              </div>

              {/* Color Indicator */}
              <div
                className="w-1 h-12 md:h-14 rounded-full flex-shrink-0"
                style={{ backgroundColor: booking.color }}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-slate-800 dark:text-white text-sm md:text-base truncate">{booking.guestName}</p>
                  <Badge
                    variant={booking.status === 'CONFIRMED' ? 'default' : 'secondary'}
                    className={`text-[10px] md:text-xs ${booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}`}
                  >
                    {booking.status}
                  </Badge>
                </div>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-0.5 truncate">{booking.eventTypeName}</p>
                
                {/* Mobile Time - Only on small screens */}
                <div className="flex sm:hidden items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(parseISO(booking.startTime), 'h:mm')} - {format(parseISO(booking.endTime), 'h:mm a')}
                  </span>
                </div>
                
                <div className="hidden sm:flex items-center gap-4 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center">
                    {booking.location === 'Phone Call' ? (
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                    ) : (
                      <Video className="h-3.5 w-3.5 mr-1" />
                    )}
                    {booking.location}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {Math.round(
                      (parseISO(booking.endTime).getTime() - parseISO(booking.startTime).getTime()) / 60000
                    )}{' '}
                    min
                  </span>
                </div>
              </div>

              {/* Avatar & Actions */}
              <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                <Avatar className="h-8 w-8 md:h-10 md:w-10">
                  <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs md:text-sm">
                    {booking.guestName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem className="text-sm">View Details</DropdownMenuItem>
                    <DropdownMenuItem className="text-sm">Reschedule</DropdownMenuItem>
                    <DropdownMenuItem className="text-sm">Send Reminder</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600 text-sm">Cancel</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
