// MeetLink Type Definitions

export interface User {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  avatar: string | null;
  timezone: string;
  locale: string;
  bio: string | null;
  company: string | null;
  phone: string | null;
  website: string | null;
  defaultSlotDuration: number;
  defaultBufferBefore: number;
  defaultBufferAfter: number;
  dailyBookingLimit: number | null;
  weeklyBookingLimit: number | null;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  createdAt: Date;
  updatedAt: Date;
}

export interface EventType {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  icon: string | null;
  duration: number;
  slotDuration: number | null;
  type: 'ONE_ON_ONE' | 'GROUP' | 'ROUND_ROBIN' | 'COLLECTIVE';
  maxAttendees: number | null;
  seatsPerSlot: number;
  bufferBefore: number;
  bufferAfter: number;
  dailyLimit: number | null;
  weeklyLimit: number | null;
  minBookingNotice: number | null;
  maxBookingWindow: number | null;
  locationType: 'IN_PERSON' | 'PHONE' | 'VIDEO' | 'CUSTOM';
  locationDetails: string | null;
  videoProvider: 'ZOOM' | 'TEAMS' | 'GOOGLE_MEET' | 'CUSTOM' | null;
  videoLink: string | null;
  autoGenerateVideo: boolean;
  requiresConfirmation: boolean;
  allowRescheduling: boolean;
  allowCancellation: boolean;
  cancellationWindow: number | null;
  customQuestions: string | null;
  roundRobinStrategy: 'ROUND_ROBIN' | 'LEAST_BOOKED' | 'RANDOM' | null;
  totalBookings: number;
  isActive: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  eventTypeId: string;
  eventType?: EventType;
  hostId: string;
  host?: User;
  guestId: string | null;
  guest?: User | null;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  guestNotes: string | null;
  customResponses: string | null;
  startTime: Date;
  endTime: Date;
  timezone: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW';
  cancellationReason: string | null;
  cancelledAt: Date | null;
  cancelledBy: string | null;
  rescheduledFrom: string | null;
  rescheduledTo: string | null;
  location: string | null;
  videoLink: string | null;
  paymentStatus: 'NONE' | 'PENDING' | 'PAID' | 'REFUNDED';
  paymentAmount: number | null;
  paymentCurrency: string | null;
  calendarEventId: string | null;
  calendarProvider: string | null;
  reminderSent: boolean;
  reminderSentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  jobTitle: string | null;
  website: string | null;
  linkedin: string | null;
  twitter: string | null;
  notes: string | null;
  customFields: string | null;
  source: 'MANUAL' | 'BOOKING' | 'IMPORT' | 'CARDDAV' | 'API';
  carddavUid: string | null;
  carddavUrl: string | null;
  carddavSyncedAt: Date | null;
  vcfImportId: string | null;
  tags: string | null;
  totalBookings: number;
  lastBookingAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactGroup {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Availability {
  id: string;
  userId: string | null;
  name: string;
  description: string | null;
  timezone: string;
  isDefault: boolean;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Schedule {
  id: string;
  availabilityId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  specificDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Calendar {
  id: string;
  userId: string;
  provider: 'GOOGLE' | 'OUTLOOK' | 'ICAL' | 'CALDAV';
  name: string;
  calendarId: string | null;
  color: string;
  syncEnabled: boolean;
  syncInterval: number;
  lastSyncAt: Date | null;
  checkAvailability: boolean;
  blockOnConflict: boolean;
  addEventsToCalendar: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workflow {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  triggerType: 'BOOKING_CREATED' | 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'BEFORE_EVENT' | 'AFTER_EVENT';
  triggerConfig: string | null;
  actions: string;
  eventTypeIds: string | null;
  executions: number;
  lastExecutedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
  title: string;
  message: string;
  data: string | null;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'READ';
  sentAt: Date | null;
  readAt: Date | null;
  entityType: string | null;
  entityId: string | null;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValue: string | null;
  newValue: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  isSensitive: boolean;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  timestamp: Date;
}

// UI State Types
export interface TimeSlot {
  time: string;
  available: boolean;
  bookingId?: string;
}

export interface DayAvailability {
  date: Date;
  slots: TimeSlot[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  type: 'booking' | 'block' | 'override';
  booking?: Booking;
}

export interface BookingFormData {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  customResponses?: Record<string, string>;
}

export interface Stats {
  totalBookings: number;
  todayBookings: number;
  weekBookings: number;
  monthBookings: number;
  completionRate: number;
  noShowRate: number;
  averageDuration: number;
  topEventType: string | null;
}

export type ViewMode = 'dashboard' | 'events' | 'bookings' | 'contacts' | 'availability' | 'integrations' | 'workflows' | 'settings';
export type CalendarView = 'month' | 'week' | 'day';
