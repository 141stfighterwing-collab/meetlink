import { create } from 'zustand';
import type { 
  ViewMode, 
  CalendarView, 
  EventType, 
  Booking, 
  Contact, 
  ContactGroup, 
  Availability, 
  Calendar, 
  Workflow,
  Stats,
  Schedule
} from '@/types';
import type { ThemeName, Theme } from '@/lib/themes';
import { themes, getTheme, applyTheme, getStoredTheme } from '@/lib/themes';

interface AppState {
  // Navigation
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  
  // Theme
  themeName: ThemeName;
  theme: Theme;
  setTheme: (name: ThemeName) => void;
  availableThemes: Theme[];
  
  // User (mock for demo)
  user: {
    id: string;
    name: string;
    email: string;
    timezone: string;
  } | null;
  setUser: (user: AppState['user']) => void;
  
  // Event Types
  eventTypes: EventType[];
  setEventTypes: (eventTypes: EventType[]) => void;
  selectedEventType: EventType | null;
  setSelectedEventType: (eventType: EventType | null) => void;
  
  // Bookings
  bookings: Booking[];
  setBookings: (bookings: Booking[]) => void;
  selectedBooking: Booking | null;
  setSelectedBooking: (booking: Booking | null) => void;
  calendarView: CalendarView;
  setCalendarView: (view: CalendarView) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  
  // Contacts
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
  selectedContact: Contact | null;
  setSelectedContact: (contact: Contact | null) => void;
  contactGroups: ContactGroup[];
  setContactGroups: (groups: ContactGroup[]) => void;
  contactSearchQuery: string;
  setContactSearchQuery: (query: string) => void;
  
  // Availability
  availabilities: Availability[];
  setAvailabilities: (availabilities: Availability[]) => void;
  selectedAvailability: Availability | null;
  setSelectedAvailability: (availability: Availability | null) => void;
  schedules: Schedule[];
  setSchedules: (schedules: Schedule[]) => void;
  
  // Calendar Integrations
  calendars: Calendar[];
  setCalendars: (calendars: Calendar[]) => void;
  
  // Workflows
  workflows: Workflow[];
  setWorkflows: (workflows: Workflow[]) => void;
  
  // Stats
  stats: Stats;
  setStats: (stats: Stats) => void;
  
  // UI State
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Modals
  showEventTypeModal: boolean;
  setShowEventTypeModal: (show: boolean) => void;
  showBookingModal: boolean;
  setShowBookingModal: (show: boolean) => void;
  showContactModal: boolean;
  setShowContactModal: (show: boolean) => void;
  showWorkflowModal: boolean;
  setShowWorkflowModal: (show: boolean) => void;
}

// Initialize with stored theme or default
const initialThemeName = typeof window !== 'undefined' ? getStoredTheme() : 'light';
const initialTheme = getTheme(initialThemeName);

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentView: 'dashboard',
  setCurrentView: (view) => set({ currentView: view }),
  
  // Theme
  themeName: initialThemeName,
  theme: initialTheme,
  availableThemes: themes,
  setTheme: (name) => {
    const newTheme = getTheme(name);
    if (typeof window !== 'undefined') {
      applyTheme(newTheme);
    }
    set({ themeName: name, theme: newTheme });
  },
  
  // User
  user: {
    id: 'user-1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    timezone: 'America/New_York',
  },
  setUser: (user) => set({ user }),
  
  // Event Types
  eventTypes: [],
  setEventTypes: (eventTypes) => set({ eventTypes }),
  selectedEventType: null,
  setSelectedEventType: (eventType) => set({ selectedEventType: eventType }),
  
  // Bookings
  bookings: [],
  setBookings: (bookings) => set({ bookings }),
  selectedBooking: null,
  setSelectedBooking: (booking) => set({ selectedBooking: booking }),
  calendarView: 'week',
  setCalendarView: (view) => set({ calendarView: view }),
  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),
  
  // Contacts
  contacts: [],
  setContacts: (contacts) => set({ contacts }),
  selectedContact: null,
  setSelectedContact: (contact) => set({ selectedContact: contact }),
  contactGroups: [],
  setContactGroups: (groups) => set({ contactGroups: groups }),
  contactSearchQuery: '',
  setContactSearchQuery: (query) => set({ contactSearchQuery: query }),
  
  // Availability
  availabilities: [],
  setAvailabilities: (availabilities) => set({ availabilities }),
  selectedAvailability: null,
  setSelectedAvailability: (availability) => set({ selectedAvailability: availability }),
  schedules: [],
  setSchedules: (schedules) => set({ schedules }),
  
  // Calendar Integrations
  calendars: [],
  setCalendars: (calendars) => set({ calendars }),
  
  // Workflows
  workflows: [],
  setWorkflows: (workflows) => set({ workflows }),
  
  // Stats
  stats: {
    totalBookings: 0,
    todayBookings: 0,
    weekBookings: 0,
    monthBookings: 0,
    completionRate: 0,
    noShowRate: 0,
    averageDuration: 0,
    topEventType: null,
  },
  setStats: (stats) => set({ stats }),
  
  // UI State
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  // Modals
  showEventTypeModal: false,
  setShowEventTypeModal: (show) => set({ showEventTypeModal: show }),
  showBookingModal: false,
  setShowBookingModal: (show) => set({ showBookingModal: show }),
  showContactModal: false,
  setShowContactModal: (show) => set({ showContactModal: show }),
  showWorkflowModal: false,
  setShowWorkflowModal: (show) => set({ showWorkflowModal: show }),
}));
