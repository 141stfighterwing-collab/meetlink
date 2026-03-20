'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Clock,
  Users,
  Video,
  Phone,
  MapPin,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Plus,
  CalendarDays,
} from 'lucide-react';
import { EventForm } from './event-form';
import type { EventType } from '@/types';

const initialEventTypes: EventType[] = [
  {
    id: '1',
    userId: 'user-1',
    name: '30 Minute Meeting',
    slug: '30min',
    description: 'Quick sync or introduction call',
    color: '#10B981',
    icon: 'clock',
    duration: 30,
    slotDuration: null,
    type: 'ONE_ON_ONE',
    maxAttendees: null,
    seatsPerSlot: 1,
    bufferBefore: 5,
    bufferAfter: 5,
    dailyLimit: 8,
    weeklyLimit: null,
    minBookingNotice: 2,
    maxBookingWindow: 30,
    locationType: 'VIDEO',
    locationDetails: null,
    videoProvider: 'ZOOM',
    videoLink: null,
    autoGenerateVideo: true,
    requiresConfirmation: false,
    allowRescheduling: true,
    allowCancellation: true,
    cancellationWindow: 24,
    customQuestions: null,
    roundRobinStrategy: null,
    totalBookings: 45,
    isActive: true,
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    userId: 'user-1',
    name: '60 Minute Consultation',
    slug: 'consultation',
    description: 'In-depth consultation or strategy session',
    color: '#3B82F6',
    icon: 'briefcase',
    duration: 60,
    slotDuration: null,
    type: 'ONE_ON_ONE',
    maxAttendees: null,
    seatsPerSlot: 1,
    bufferBefore: 10,
    bufferAfter: 10,
    dailyLimit: 4,
    weeklyLimit: null,
    minBookingNotice: 24,
    maxBookingWindow: 60,
    locationType: 'VIDEO',
    locationDetails: null,
    videoProvider: 'GOOGLE_MEET',
    videoLink: null,
    autoGenerateVideo: true,
    requiresConfirmation: true,
    allowRescheduling: true,
    allowCancellation: true,
    cancellationWindow: 48,
    customQuestions: null,
    roundRobinStrategy: null,
    totalBookings: 32,
    isActive: true,
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    userId: 'user-1',
    name: 'Team Standup',
    slug: 'team-standup',
    description: 'Weekly team synchronization meeting',
    color: '#8B5CF6',
    icon: 'users',
    duration: 15,
    slotDuration: null,
    type: 'GROUP',
    maxAttendees: 10,
    seatsPerSlot: 10,
    bufferBefore: 0,
    bufferAfter: 0,
    dailyLimit: 1,
    weeklyLimit: 5,
    minBookingNotice: 1,
    maxBookingWindow: 14,
    locationType: 'VIDEO',
    locationDetails: null,
    videoProvider: 'TEAMS',
    videoLink: null,
    autoGenerateVideo: true,
    requiresConfirmation: false,
    allowRescheduling: false,
    allowCancellation: true,
    cancellationWindow: 2,
    customQuestions: null,
    roundRobinStrategy: null,
    totalBookings: 28,
    isActive: true,
    isPublic: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    userId: 'user-1',
    name: 'Sales Demo',
    slug: 'sales-demo',
    description: 'Product demonstration for potential customers',
    color: '#F59E0B',
    icon: 'presentation',
    duration: 45,
    slotDuration: null,
    type: 'ROUND_ROBIN',
    maxAttendees: 5,
    seatsPerSlot: 1,
    bufferBefore: 5,
    bufferAfter: 10,
    dailyLimit: 6,
    weeklyLimit: null,
    minBookingNotice: 4,
    maxBookingWindow: 21,
    locationType: 'VIDEO',
    locationDetails: null,
    videoProvider: 'ZOOM',
    videoLink: null,
    autoGenerateVideo: true,
    requiresConfirmation: false,
    allowRescheduling: true,
    allowCancellation: true,
    cancellationWindow: 24,
    customQuestions: null,
    roundRobinStrategy: 'ROUND_ROBIN',
    totalBookings: 22,
    isActive: true,
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export function EventList() {
  const { showEventTypeModal, setShowEventTypeModal, user } = useAppStore();
  const [eventTypes, setEventTypes] = useState<EventType[]>(initialEventTypes);
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);

  const toggleEventActive = (id: string) => {
    setEventTypes((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, isActive: !event.isActive } : event
      )
    );
  };

  const deleteEvent = (id: string) => {
    setEventTypes((prev) => prev.filter((event) => event.id !== id));
  };

  const duplicateEvent = (event: EventType) => {
    const newEvent: EventType = {
      ...event,
      id: Date.now().toString(),
      name: `${event.name} (Copy)`,
      slug: `${event.slug}-copy`,
      totalBookings: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setEventTypes((prev) => [...prev, newEvent]);
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="h-3.5 w-3.5 md:h-4 md:w-4" />;
      case 'PHONE':
        return <Phone className="h-3.5 w-3.5 md:h-4 md:w-4" />;
      case 'IN_PERSON':
        return <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4" />;
      default:
        return <Video className="h-3.5 w-3.5 md:h-4 md:w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      ONE_ON_ONE: { label: 'One-on-One', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
      GROUP: { label: 'Group', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
      ROUND_ROBIN: { label: 'Round Robin', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
      COLLECTIVE: { label: 'Collective', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    };
    const badge = badges[type] || badges.ONE_ON_ONE;
    return <Badge className={`${badge.className} text-[10px] md:text-xs`}>{badge.label}</Badge>;
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-white">Event Types</h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Create and manage your meeting types for scheduling
          </p>
        </div>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700 h-9 md:h-10 w-full sm:w-auto"
          onClick={() => {
            setEditingEvent(null);
            setShowEventTypeModal(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Event Type
        </Button>
      </div>

      {/* Event Types Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {eventTypes.map((event) => (
          <Card key={event.id} className="relative overflow-hidden">
            {/* Color Indicator */}
            <div
              className="absolute top-0 left-0 w-full h-1"
              style={{ backgroundColor: event.color }}
            />

            <CardHeader className="pb-2 md:pb-3 p-3 md:p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div
                    className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${event.color}20` }}
                  >
                    <CalendarDays className="h-4 w-4 md:h-5 md:w-5" style={{ color: event.color }} />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-sm md:text-base truncate">{event.name}</CardTitle>
                    <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{event.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                  <Switch
                    checked={event.isActive}
                    onCheckedChange={() => toggleEventActive(event.id)}
                    className="scale-75 md:scale-100"
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8">
                        <MoreVertical className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => window.open(`/booking/${event.slug}`, '_blank')} className="text-sm">
                        <ExternalLink className="h-3.5 w-3.5 mr-2" />
                        View Booking Page
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicateEvent(event)} className="text-sm">
                        <Copy className="h-3.5 w-3.5 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingEvent(event);
                          setShowEventTypeModal(true);
                        }}
                        className="text-sm"
                      >
                        <Edit className="h-3.5 w-3.5 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 text-sm"
                        onClick={() => deleteEvent(event.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-2 md:space-y-3 p-3 md:p-4 pt-0">
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{event.description}</p>

              {/* Stats Row */}
              <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center">
                  <Clock className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  {event.duration} min
                </span>
                {event.type === 'GROUP' && (
                  <span className="flex items-center">
                    <Users className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    {event.maxAttendees} max
                  </span>
                )}
                <span className="flex items-center">{getLocationIcon(event.locationType)}</span>
              </div>

              {/* Badges Row */}
              <div className="flex items-center flex-wrap gap-1 md:gap-2">
                {getTypeBadge(event.type)}
                {!event.isPublic && <Badge variant="outline" className="text-[10px] md:text-xs">Private</Badge>}
                {event.requiresConfirmation && <Badge variant="outline" className="text-[10px] md:text-xs hidden sm:inline-flex">Requires Confirmation</Badge>}
              </div>

              {/* Booking Stats */}
              <div className="pt-2 md:pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs md:text-sm">
                <span className="text-slate-500 dark:text-slate-400">{event.totalBookings} bookings</span>
                <Button variant="ghost" size="sm" className="text-emerald-600 h-7 md:h-8 text-xs">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Book Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Event Form Modal */}
      <EventForm
        open={showEventTypeModal}
        onOpenChange={(open) => {
          setShowEventTypeModal(open);
          if (!open) setEditingEvent(null);
        }}
        event={editingEvent}
        onSave={(event) => {
          if (editingEvent) {
            setEventTypes((prev) =>
              prev.map((e) => (e.id === event.id ? event : e))
            );
          } else {
            setEventTypes((prev) => [...prev, { ...event, id: Date.now().toString() }]);
          }
          setShowEventTypeModal(false);
          setEditingEvent(null);
        }}
      />
    </div>
  );
}
