'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Video, MapPin, MoreHorizontal } from 'lucide-react';
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Today&apos;s Schedule</CardTitle>
        <Button variant="ghost" size="sm" className="text-emerald-600">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingBookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-start space-x-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              {/* Time Column */}
              <div className="flex-shrink-0 w-20">
                <p className="text-sm font-semibold text-slate-800">
                  {format(parseISO(booking.startTime), 'h:mm a')}
                </p>
                <p className="text-xs text-slate-500">
                  {format(parseISO(booking.endTime), 'h:mm a')}
                </p>
              </div>

              {/* Color Indicator */}
              <div
                className="w-1 h-16 rounded-full flex-shrink-0"
                style={{ backgroundColor: booking.color }}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-slate-800">{booking.guestName}</p>
                  <Badge
                    variant={booking.status === 'CONFIRMED' ? 'default' : 'secondary'}
                    className={booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : ''}
                  >
                    {booking.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mt-1">{booking.eventTypeName}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                  <span className="flex items-center">
                    {booking.location === 'Phone Call' ? (
                      <MapPin className="h-4 w-4 mr-1" />
                    ) : (
                      <Video className="h-4 w-4 mr-1" />
                    )}
                    {booking.location}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {Math.round(
                      (parseISO(booking.endTime).getTime() - parseISO(booking.startTime).getTime()) / 60000
                    )}{' '}
                    min
                  </span>
                </div>
              </div>

              {/* Avatar */}
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarFallback className="bg-slate-200 text-slate-600">
                  {booking.guestName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="flex-shrink-0">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem>Reschedule</DropdownMenuItem>
                  <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Cancel</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
