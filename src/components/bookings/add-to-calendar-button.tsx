'use client';

import { useState } from 'react';
import { Calendar, ChevronDown, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  downloadICSFile,
  calendarOptions,
  type ICSEventData,
} from '@/lib/ics';

interface AddToCalendarButtonProps {
  event: ICSEventData;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
}

export function AddToCalendarButton({
  event,
  variant = 'default',
  size = 'default',
  className = '',
  showLabel = true,
}: AddToCalendarButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCalendarSelect = (option: typeof calendarOptions[0]) => {
    if (option.isDownload) {
      downloadICSFile(event);
    } else {
      const url = option.getUrl(event);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`gap-2 ${className}`}
        >
          <Calendar className="h-4 w-4" />
          {showLabel && <span>Add to Calendar</span>}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {calendarOptions.map((option, index) => (
          <DropdownMenuItem
            key={option.id}
            onClick={() => handleCalendarSelect(option)}
            className="cursor-pointer gap-2"
          >
            <span className="text-lg">{option.icon}</span>
            <span className="flex-1">{option.name}</span>
            {option.isDownload ? (
              <Download className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact version for smaller spaces
export function AddToCalendarCompact({
  event,
  className = '',
}: {
  event: ICSEventData;
  className?: string;
}) {
  return (
    <AddToCalendarButton
      event={event}
      variant="outline"
      size="sm"
      className={className}
      showLabel={true}
    />
  );
}

// Icon-only version
export function AddToCalendarIcon({
  event,
  className = '',
}: {
  event: ICSEventData;
  className?: string;
}) {
  return (
    <AddToCalendarButton
      event={event}
      variant="ghost"
      size="icon"
      className={className}
      showLabel={false}
    />
  );
}

export default AddToCalendarButton;
