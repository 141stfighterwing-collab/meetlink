'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Video,
  MapPin,
  Users,
  Filter,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  addWeeks,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import type { CalendarView, Booking } from '@/types';
import { AddToCalendarButton } from './add-to-calendar-button';

const mockBookings: Booking[] = [
  {
    id: '1',
    eventTypeId: '1',
    hostId: 'user-1',
    guestName: 'Sarah Johnson',
    guestEmail: 'sarah.johnson@techcorp.com',
    guestPhone: '+1 555-0101',
    guestNotes: 'Looking forward to discussing the project timeline.',
    startTime: new Date(2025, 2, 17, 10, 0),
    endTime: new Date(2025, 2, 17, 10, 30),
    timezone: 'America/New_York',
    status: 'CONFIRMED',
    location: 'Zoom Meeting',
    videoLink: 'https://zoom.us/j/123456789',
    paymentStatus: 'NONE',
    reminderSent: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    eventTypeId: '2',
    hostId: 'user-1',
    guestName: 'Michael Chen',
    guestEmail: 'michael.chen@startup.io',
    startTime: new Date(2025, 2, 17, 11, 30),
    endTime: new Date(2025, 2, 17, 12, 0),
    timezone: 'America/New_York',
    status: 'CONFIRMED',
    location: 'Google Meet',
    videoLink: 'https://meet.google.com/abc-defg-hij',
    paymentStatus: 'NONE',
    reminderSent: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    eventTypeId: '3',
    hostId: 'user-1',
    guestName: 'Emily Rodriguez',
    guestEmail: 'emily.r@design.co',
    startTime: new Date(2025, 2, 17, 14, 0),
    endTime: new Date(2025, 2, 17, 14, 45),
    timezone: 'America/New_York',
    status: 'PENDING',
    location: 'Phone Call',
    paymentStatus: 'NONE',
    reminderSent: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    eventTypeId: '1',
    hostId: 'user-1',
    guestName: 'David Kim',
    guestEmail: 'david.kim@enterprise.com',
    startTime: new Date(2025, 2, 17, 16, 0),
    endTime: new Date(2025, 2, 17, 16, 30),
    timezone: 'America/New_York',
    status: 'CONFIRMED',
    location: 'Microsoft Teams',
    videoLink: 'https://teams.microsoft.com/l/meetup-join/xyz',
    paymentStatus: 'NONE',
    reminderSent: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    eventTypeId: '2',
    hostId: 'user-1',
    guestName: 'Lisa Wang',
    guestEmail: 'lisa.wang@agency.com',
    startTime: new Date(2025, 2, 18, 9, 0),
    endTime: new Date(2025, 2, 18, 10, 0),
    timezone: 'America/New_York',
    status: 'CONFIRMED',
    location: 'Zoom Meeting',
    videoLink: 'https://zoom.us/j/987654321',
    paymentStatus: 'NONE',
    reminderSent: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    eventTypeId: '1',
    hostId: 'user-1',
    guestName: 'James Brown',
    guestEmail: 'james.b@consulting.com',
    startTime: new Date(2025, 2, 19, 13, 0),
    endTime: new Date(2025, 2, 19, 13, 30),
    timezone: 'America/New_York',
    status: 'CANCELLED',
    cancellationReason: 'Schedule conflict',
    cancelledAt: new Date(2025, 2, 18),
    cancelledBy: 'guest',
    location: 'Zoom Meeting',
    paymentStatus: 'NONE',
    reminderSent: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '7',
    eventTypeId: '4',
    hostId: 'user-1',
    guestName: 'Team Alpha',
    guestEmail: 'alpha@company.com',
    startTime: new Date(2025, 2, 20, 10, 0),
    endTime: new Date(2025, 2, 20, 10, 15),
    timezone: 'America/New_York',
    status: 'CONFIRMED',
    location: 'Zoom Meeting',
    paymentStatus: 'NONE',
    reminderSent: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export function BookingCalendar() {
  const { calendarView, setCalendarView, selectedDate, setSelectedDate } = useAppStore();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookings] = useState<Booking[]>(mockBookings);

  const navigateDate = (direction: 'prev' | 'next') => {
    const amount = direction === 'prev' ? -1 : 1;
    if (calendarView === 'month') {
      setSelectedDate(addMonths(selectedDate, amount));
    } else if (calendarView === 'week') {
      setSelectedDate(addWeeks(selectedDate, amount));
    } else {
      setSelectedDate(addDays(selectedDate, amount));
    }
  };

  const getBookingsForDate = (date: Date) => {
    return bookings.filter((booking) => isSameDay(booking.startTime, date));
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    // Calculate all days to display
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const allDays = Array.from({ length: totalDays }, (_, i) => addDays(startDate, i));

    // Group days into weeks
    const weeks: Date[][] = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }

    return weeks.map((week, weekIndex) => (
      <div key={weekIndex} className="grid grid-cols-7">
        {week.map((day) => {
          const dayBookings = getBookingsForDate(day);
          const isCurrentMonth = isSameMonth(day, selectedDate);

          return (
            <div
              key={day.toString()}
              className={`min-h-24 p-2 border border-slate-100 ${
                !isCurrentMonth ? 'bg-slate-50' : 'bg-white'
              } ${isToday(day) ? 'bg-emerald-50' : ''} cursor-pointer hover:bg-slate-50 transition-colors`}
              onClick={() => {
                setSelectedDate(day);
                setCalendarView('day');
              }}
            >
              <div
                className={`text-sm font-medium mb-1 ${
                  isToday(day)
                    ? 'text-emerald-600'
                    : isCurrentMonth
                    ? 'text-slate-800'
                    : 'text-slate-400'
                }`}
              >
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayBookings.slice(0, 3).map((booking) => (
                  <div
                    key={booking.id}
                    className={`text-xs p-1 rounded truncate cursor-pointer ${
                      booking.status === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : booking.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-slate-100 text-slate-500 line-through'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBooking(booking);
                    }}
                  >
                    {format(booking.startTime, 'h:mm a')} {booking.guestName}
                  </div>
                ))}
                {dayBookings.length > 3 && (
                  <div className="text-xs text-slate-500">
                    +{dayBookings.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    ));
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate);
    const days = [];

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const dayBookings = getBookingsForDate(day);

      days.push(
        <div key={day.toString()} className="flex-1 border border-slate-100">
          <div
            className={`text-center py-2 border-b border-slate-100 ${
              isToday(day) ? 'bg-emerald-50' : ''
            }`}
          >
            <div className="text-xs text-slate-500 uppercase">{format(day, 'EEE')}</div>
            <div
              className={`text-lg font-semibold ${
                isToday(day) ? 'text-emerald-600' : 'text-slate-800'
              }`}
            >
              {format(day, 'd')}
            </div>
          </div>
          <div className="min-h-96 p-2 space-y-2">
            {dayBookings.map((booking) => (
              <div
                key={booking.id}
                className={`p-2 rounded-lg cursor-pointer transition-all hover:scale-[1.02] ${
                  booking.status === 'CONFIRMED'
                    ? 'bg-emerald-100 border-l-4 border-emerald-500'
                    : booking.status === 'PENDING'
                    ? 'bg-yellow-100 border-l-4 border-yellow-500'
                    : 'bg-slate-100 border-l-4 border-slate-300'
                }`}
                onClick={() => setSelectedBooking(booking)}
              >
                <div className="text-sm font-medium">{format(booking.startTime, 'h:mm a')}</div>
                <div className="text-sm text-slate-600 truncate">{booking.guestName}</div>
              </div>
            ))}
            {dayBookings.length === 0 && (
              <div className="text-center text-sm text-slate-400 py-4">No bookings</div>
            )}
          </div>
        </div>
      );
    }

    return <div className="flex">{days}</div>;
  };

  const renderDayView = () => {
    const dayBookings = getBookingsForDate(selectedDate);
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

    return (
      <div className="relative">
        <div className="absolute top-0 left-16 right-0">
          {hours.map((hour) => (
            <div key={hour} className="h-16 border-t border-slate-100 relative">
              <span className="absolute -top-2 left-0 text-xs text-slate-400 -translate-x-full pr-2">
                {format(new Date().setHours(hour, 0), 'h:mm a')}
              </span>
            </div>
          ))}
        </div>

        <div className="ml-16 relative">
          {dayBookings.map((booking) => {
            const startHour = booking.startTime.getHours();
            const startMinute = booking.startTime.getMinutes();
            const endHour = booking.endTime.getHours();
            const endMinute = booking.endTime.getMinutes();
            const top = (startHour - 8) * 64 + (startMinute / 60) * 64;
            const height = ((endHour - startHour) + (endMinute - startMinute) / 60) * 64;

            return (
              <div
                key={booking.id}
                className={`absolute left-2 right-2 rounded-lg p-2 cursor-pointer transition-all hover:scale-[1.02] ${
                  booking.status === 'CONFIRMED'
                    ? 'bg-emerald-100 border-l-4 border-emerald-500'
                    : booking.status === 'PENDING'
                    ? 'bg-yellow-100 border-l-4 border-yellow-500'
                    : 'bg-slate-100 border-l-4 border-slate-300'
                }`}
                style={{ top: `${top}px`, height: `${height}px` }}
                onClick={() => setSelectedBooking(booking)}
              >
                <div className="font-medium text-sm">{booking.guestName}</div>
                <div className="text-xs text-slate-600">
                  {format(booking.startTime, 'h:mm a')} - {format(booking.endTime, 'h:mm a')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => navigateDate('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigateDate('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
              Today
            </Button>
          </div>
          <h2 className="text-xl font-semibold text-slate-800">
            {calendarView === 'month' && format(selectedDate, 'MMMM yyyy')}
            {calendarView === 'week' && `Week of ${format(startOfWeek(selectedDate), 'MMM d, yyyy')}`}
            {calendarView === 'day' && format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          <Select value={calendarView} onValueChange={(v) => setCalendarView(v as CalendarView)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar */}
      <Card>
        <CardContent className="p-0">
          {calendarView === 'month' && (
            <>
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 border-b border-slate-200">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div
                    key={day}
                    className="py-2 text-center text-sm font-medium text-slate-500 bg-slate-50"
                  >
                    {day}
                  </div>
                ))}
              </div>
              {renderMonthView()}
            </>
          )}
          {calendarView === 'week' && renderWeekView()}
          {calendarView === 'day' && (
            <div className="min-h-[768px]">{renderDayView()}</div>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-emerald-600 text-white">
                    {selectedBooking.guestName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedBooking.guestName}</h3>
                  <p className="text-sm text-slate-500">{selectedBooking.guestEmail}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                  <span>{format(selectedBooking.startTime, 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-slate-400" />
                  <span>
                    {format(selectedBooking.startTime, 'h:mm a')} -{' '}
                    {format(selectedBooking.endTime, 'h:mm a')}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  {selectedBooking.location?.includes('Zoom') ||
                  selectedBooking.location?.includes('Meet') ||
                  selectedBooking.location?.includes('Teams') ? (
                    <Video className="h-4 w-4 mr-2 text-slate-400" />
                  ) : (
                    <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                  )}
                  <span>{selectedBooking.location}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Badge
                  className={
                    selectedBooking.status === 'CONFIRMED'
                      ? 'bg-emerald-100 text-emerald-700'
                      : selectedBooking.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-slate-100 text-slate-600'
                  }
                >
                  {selectedBooking.status}
                </Badge>
                {selectedBooking.reminderSent && (
                  <span className="text-xs text-slate-500">Reminder sent</span>
                )}
              </div>

              {selectedBooking.guestNotes && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">{selectedBooking.guestNotes}</p>
                </div>
              )}

              {/* Add to Calendar Button */}
              <AddToCalendarButton
                event={{
                  title: `Meeting with ${selectedBooking.guestName}`,
                  startTime: selectedBooking.startTime,
                  endTime: selectedBooking.endTime,
                  attendeeName: selectedBooking.guestName,
                  attendeeEmail: selectedBooking.guestEmail,
                  location: selectedBooking.location || undefined,
                  videoLink: selectedBooking.videoLink || undefined,
                  description: selectedBooking.guestNotes || undefined,
                  timezone: selectedBooking.timezone || 'UTC',
                }}
                variant="default"
                className="w-full"
              />

              {selectedBooking.videoLink && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(selectedBooking.videoLink, '_blank')}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Join Meeting
                </Button>
              )}

              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1">
                  Reschedule
                </Button>
                <Button variant="outline" className="flex-1 text-red-600">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
