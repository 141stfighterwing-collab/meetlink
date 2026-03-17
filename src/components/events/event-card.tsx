'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Clock,
  Users,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  ExternalLink,
  Video,
  MapPin,
  Phone,
  Globe,
  Calendar,
} from 'lucide-react';
import type { EventType, EventTypeType } from '@/types';

interface EventCardProps {
  eventType: EventType;
  onEdit: (eventType: EventType) => void;
  onDuplicate: (eventType: EventType) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

const typeLabels: Record<EventTypeType, string> = {
  ONE_ON_ONE: 'One-on-One',
  GROUP: 'Group',
  ROUND_ROBIN: 'Round Robin',
  COLLECTIVE: 'Collective',
};

const typeIcons: Record<EventTypeType, React.ReactNode> = {
  ONE_ON_ONE: <Users className="h-3 w-3" />,
  GROUP: <Users className="h-3 w-3" />,
  ROUND_ROBIN: <Calendar className="h-3 w-3" />,
  COLLECTIVE: <Globe className="h-3 w-3" />,
};

const locationIcons: Record<string, React.ReactNode> = {
  VIDEO: <Video className="h-3 w-3" />,
  IN_PERSON: <MapPin className="h-3 w-3" />,
  PHONE: <Phone className="h-3 w-3" />,
  CUSTOM: <Globe className="h-3 w-3" />,
};

export function EventCard({ eventType, onEdit, onDuplicate, onDelete, onToggleActive }: EventCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md">
      {/* Color bar */}
      <div
        className="absolute left-0 top-0 h-full w-1"
        style={{ backgroundColor: eventType.color }}
      />

      <CardContent className="p-4 pl-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate">{eventType.name}</h3>
              {!eventType.isPublic && (
                <Badge variant="outline" className="text-xs">
                  Private
                </Badge>
              )}
            </div>

            {/* Description */}
            {eventType.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {eventType.description}
              </p>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {eventType.duration} min
              </span>
              <span className="flex items-center gap-1">
                {typeIcons[eventType.type]}
                {typeLabels[eventType.type]}
              </span>
              <span className="flex items-center gap-1">
                {locationIcons[eventType.locationType]}
                {eventType.locationType === 'VIDEO' && eventType.videoProvider
                  ? eventType.videoProvider.replace('_', ' ')
                  : eventType.locationType.replace('_', ' ')}
              </span>
              {eventType.type === 'GROUP' && eventType.maxAttendees && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Max {eventType.maxAttendees}
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span>{eventType.totalBookings} bookings</span>
              {eventType.bufferBefore > 0 && (
                <span>+{eventType.bufferBefore}min buffer before</span>
              )}
              {eventType.bufferAfter > 0 && (
                <span>+{eventType.bufferAfter}min buffer after</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Switch
              checked={eventType.isActive}
              onCheckedChange={(checked) => onToggleActive(eventType.id, checked)}
              className="data-[state=checked]:bg-green-500"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(eventType)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(eventType)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Booking Page
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => onDelete(eventType.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
