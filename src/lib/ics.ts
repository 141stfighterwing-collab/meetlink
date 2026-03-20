/**
 * ICS (iCalendar) File Generation Utility
 * Generates standard ICS files for importing meetings into calendar applications
 * Supports Google Calendar, Outlook, Apple Calendar, and other iCalendar-compatible apps
 */

export interface ICSEventData {
  // Required fields
  title: string;
  startTime: Date;
  endTime: Date;
  
  // Organizer info
  organizerName?: string;
  organizerEmail?: string;
  
  // Attendee info
  attendeeName?: string;
  attendeeEmail?: string;
  
  // Location
  location?: string;
  videoLink?: string;
  
  // Additional info
  description?: string;
  timezone?: string;
  
  // Unique identifier
  uid?: string;
  
  // URLs
  url?: string;
}

// Convert Date to iCalendar format: YYYYMMDDTHHMMSSZ
function formatDateToICS(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

// Convert Date to iCalendar DATE format: YYYYMMDD
function formatDateOnlyToICS(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  
  return `${year}${month}${day}`;
}

// Generate a unique ID for the event
function generateUID(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}@meetlink.app`;
}

// Escape special characters in ICS content
function escapeICS(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

// Fold lines to 75 characters max (RFC 5545 requirement)
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  
  const result: string[] = [];
  let currentLine = '';
  
  for (let i = 0; i < line.length; i++) {
    currentLine += line[i];
    
    if (currentLine.length >= 75) {
      result.push(currentLine);
      currentLine = ' '; // Continue with space
    }
  }
  
  if (currentLine.trim()) {
    result.push(currentLine);
  }
  
  return result.join('\r\n ');
}

// Generate the DTSTAMP (when the ICS was created)
function generateDTSTAMP(): string {
  return formatDateToICS(new Date());
}

/**
 * Generate an ICS file content string from event data
 */
export function generateICSContent(event: ICSEventData): string {
  const uid = event.uid || generateUID();
  const dtstamp = generateDTSTAMP();
  const dtstart = formatDateToICS(event.startTime);
  const dtend = formatDateToICS(event.endTime);
  
  // Build description with video link if available
  let description = event.description || '';
  if (event.videoLink) {
    const videoText = `\n\nJoin the meeting:\n${event.videoLink}`;
    description += videoText;
  }
  
  // Build location
  let location = event.location || '';
  if (event.videoLink && !location) {
    location = 'Video Conference';
  }
  
  // Build the ICS content
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MeetLink//Meeting Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:MeetLink Schedule',
    'X-WR-TIMEZONE:' + (event.timezone || 'UTC'),
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${escapeICS(event.title)}`,
  ];
  
  // Add description
  if (description) {
    lines.push(`DESCRIPTION:${escapeICS(description)}`);
  }
  
  // Add location
  if (location) {
    lines.push(`LOCATION:${escapeICS(location)}`);
  }
  
  // Add URL (video link or booking page)
  if (event.videoLink || event.url) {
    lines.push(`URL:${escapeICS(event.videoLink || event.url || '')}`);
  }
  
  // Add organizer
  if (event.organizerName || event.organizerEmail) {
    const organizerName = event.organizerName || 'Organizer';
    const organizerEmail = event.organizerEmail || 'noreply@meetlink.app';
    lines.push(`ORGANIZER;CN=${escapeICS(organizerName)}:mailto:${organizerEmail}`);
  }
  
  // Add attendee
  if (event.attendeeName || event.attendeeEmail) {
    const attendeeName = event.attendeeName || 'Guest';
    const attendeeEmail = event.attendeeEmail || '';
    if (attendeeEmail) {
      lines.push(`ATTENDEE;CN=${escapeICS(attendeeName)};RSVP=TRUE:mailto:${attendeeEmail}`);
    }
  }
  
  // Add status
  lines.push('STATUS:CONFIRMED');
  
  // Add sequence (for updates)
  lines.push('SEQUENCE:0');
  
  // Add created and last modified
  lines.push(`CREATED:${dtstamp}`);
  lines.push(`LAST-MODIFIED:${dtstamp}`);
  
  // Add timezone info if provided
  if (event.timezone) {
    lines.push(`X-MICROSOFT-CDO-TZID:${event.timezone}`);
  }
  
  // Add reminder (15 minutes before)
  lines.push('BEGIN:VALARM');
  lines.push('ACTION:DISPLAY');
  lines.push(`DESCRIPTION:Reminder: ${escapeICS(event.title)}`);
  lines.push('TRIGGER:-PT15M');
  lines.push('END:VALARM');
  
  // Close event and calendar
  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');
  
  // Fold long lines and join
  return lines.map(foldLine).join('\r\n');
}

/**
 * Generate a filename for the ICS file
 */
export function generateICSFilename(title: string, date: Date): string {
  // Clean the title for use in filename
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
  
  const dateStr = formatDateOnlyToICS(date);
  
  return `meetlink-${cleanTitle}-${dateStr}.ics`;
}

/**
 * Create a downloadable ICS file blob
 */
export function createICSFile(event: ICSEventData): { blob: Blob; filename: string } {
  const content = generateICSContent(event);
  const filename = generateICSFilename(event.title, event.startTime);
  
  const blob = new Blob([content], { 
    type: 'text/calendar;charset=utf-8' 
  });
  
  return { blob, filename };
}

/**
 * Download an ICS file to the user's device
 */
export function downloadICSFile(event: ICSEventData): void {
  const { blob, filename } = createICSFile(event);
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate a Google Calendar URL
 */
export function generateGoogleCalendarUrl(event: ICSEventData): string {
  const baseUrl = 'https://calendar.google.com/calendar/render';
  const params = new URLSearchParams();
  
  // Format dates for Google Calendar
  const formatGoogleDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };
  
  params.set('action', 'TEMPLATE');
  params.set('text', event.title);
  params.set('dates', `${formatGoogleDate(event.startTime)}/${formatGoogleDate(event.endTime)}`);
  
  if (event.description || event.videoLink) {
    let details = event.description || '';
    if (event.videoLink) {
      details += `\n\nJoin: ${event.videoLink}`;
    }
    params.set('details', details);
  }
  
  if (event.location || event.videoLink) {
    params.set('location', event.location || event.videoLink || '');
  }
  
  if (event.timezone) {
    params.set('ctz', event.timezone);
  }
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate an Outlook Calendar URL
 */
export function generateOutlookCalendarUrl(event: ICSEventData): string {
  const baseUrl = 'https://outlook.live.com/calendar/0/deeplink/compose';
  const params = new URLSearchParams();
  
  // Format dates for Outlook
  const formatOutlookDate = (date: Date): string => {
    return date.toISOString();
  };
  
  params.set('subject', event.title);
  params.set('startdt', formatOutlookDate(event.startTime));
  params.set('enddt', formatOutlookDate(event.endTime));
  
  if (event.description || event.videoLink) {
    let body = event.description || '';
    if (event.videoLink) {
      body += `\n\nJoin: ${event.videoLink}`;
    }
    params.set('body', body);
  }
  
  if (event.location || event.videoLink) {
    params.set('location', event.location || event.videoLink || '');
  }
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate an Office 365 Outlook Calendar URL
 */
export function generateOffice365Url(event: ICSEventData): string {
  const baseUrl = 'https://outlook.office.com/calendar/0/deeplink/compose';
  const params = new URLSearchParams();
  
  const formatOutlookDate = (date: Date): string => {
    return date.toISOString();
  };
  
  params.set('subject', event.title);
  params.set('startdt', formatOutlookDate(event.startTime));
  params.set('enddt', formatOutlookDate(event.endTime));
  
  if (event.description || event.videoLink) {
    let body = event.description || '';
    if (event.videoLink) {
      body += `\n\nJoin: ${event.videoLink}`;
    }
    params.set('body', body);
  }
  
  if (event.location || event.videoLink) {
    params.set('location', event.location || event.videoLink || '');
  }
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate a Yahoo Calendar URL
 */
export function generateYahooCalendarUrl(event: ICSEventData): string {
  const baseUrl = 'https://calendar.yahoo.com/';
  const params = new URLSearchParams();
  
  const formatYahooDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };
  
  params.set('v', '60');
  params.set('view', 'd');
  params.set('type', '20');
  params.set('title', event.title);
  params.set('st', formatYahooDate(event.startTime));
  params.set('et', formatYahooDate(event.endTime));
  
  if (event.description || event.videoLink) {
    let desc = event.description || '';
    if (event.videoLink) {
      desc += `\n\nJoin: ${event.videoLink}`;
    }
    params.set('desc', desc);
  }
  
  if (event.location || event.videoLink) {
    params.set('in_loc', event.location || event.videoLink || '');
  }
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Calendar options for the UI
 */
export interface CalendarOption {
  id: string;
  name: string;
  icon: string;
  getUrl: (event: ICSEventData) => string;
  isDownload?: boolean;
}

export const calendarOptions: CalendarOption[] = [
  {
    id: 'ics',
    name: 'Download ICS File',
    icon: '📅',
    getUrl: () => '', // Handled separately with download
    isDownload: true,
  },
  {
    id: 'google',
    name: 'Google Calendar',
    icon: '🔵',
    getUrl: generateGoogleCalendarUrl,
  },
  {
    id: 'outlook',
    name: 'Outlook (Personal)',
    icon: '🟠',
    getUrl: generateOutlookCalendarUrl,
  },
  {
    id: 'office365',
    name: 'Outlook (Office 365)',
    icon: '🔷',
    getUrl: generateOffice365Url,
  },
  {
    id: 'yahoo',
    name: 'Yahoo Calendar',
    icon: '🟣',
    getUrl: generateYahooCalendarUrl,
  },
];
