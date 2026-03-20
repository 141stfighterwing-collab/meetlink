import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/seed - Seed the database with demo data
export async function GET() {
  try {
    // Check if already seeded
    const existingUser = await db.user.findFirst();
    if (existingUser) {
      return NextResponse.json({ 
        success: true, 
        message: 'Database already seeded',
        userId: existingUser.id 
      });
    }

    // Create demo user
    const user = await db.user.create({
      data: {
        email: 'demo@meetlink.com',
        name: 'Alex Johnson',
        username: 'alexjohnson',
        avatar: null,
        timezone: 'America/New_York',
        locale: 'en',
        bio: 'Product Manager passionate about scheduling efficiency',
        company: 'TechCorp Inc.',
        phone: '+1 (555) 123-4567',
        website: 'https://alexjohnson.dev',
        defaultSlotDuration: 30,
        defaultBufferBefore: 5,
        defaultBufferAfter: 10,
        role: 'USER',
        plan: 'PRO',
      },
    });

    // Create default availability
    const availability = await db.availability.create({
      data: {
        userId: user.id,
        name: 'Working Hours',
        description: 'Standard business hours',
        timezone: 'America/New_York',
        isDefault: true,
        schedules: {
          create: [
            // Monday - Friday, 9 AM - 5 PM
            { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
            { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
            { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
            { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
            { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' },
          ],
        },
      },
    });

    // Create event types
    const eventTypes = await Promise.all([
      db.eventType.create({
        data: {
          userId: user.id,
          name: '30 Minute Meeting',
          slug: '30min',
          description: 'A quick 30-minute discussion to cover specific topics.',
          color: '#3B82F6',
          icon: 'clock',
          duration: 30,
          type: 'ONE_ON_ONE',
          bufferBefore: 5,
          bufferAfter: 5,
          minBookingNotice: 2,
          maxBookingWindow: 30,
          locationType: 'VIDEO',
          videoProvider: 'ZOOM',
          autoGenerateVideo: true,
          availabilityId: availability.id,
        },
      }),
      db.eventType.create({
        data: {
          userId: user.id,
          name: '60 Minute Meeting',
          slug: '60min',
          description: 'An hour-long meeting for in-depth discussions and planning.',
          color: '#10B981',
          icon: 'calendar',
          duration: 60,
          type: 'ONE_ON_ONE',
          bufferBefore: 10,
          bufferAfter: 10,
          minBookingNotice: 4,
          maxBookingWindow: 60,
          locationType: 'VIDEO',
          videoProvider: 'GOOGLE_MEET',
          autoGenerateVideo: true,
          availabilityId: availability.id,
        },
      }),
      db.eventType.create({
        data: {
          userId: user.id,
          name: 'Team Standup',
          slug: 'standup',
          description: 'Daily team standup meeting - 15 minutes max.',
          color: '#F59E0B',
          icon: 'users',
          duration: 15,
          type: 'GROUP',
          maxAttendees: 10,
          bufferBefore: 0,
          bufferAfter: 5,
          locationType: 'VIDEO',
          videoProvider: 'TEAMS',
          autoGenerateVideo: true,
          availabilityId: availability.id,
        },
      }),
      db.eventType.create({
        data: {
          userId: user.id,
          name: 'Product Demo',
          slug: 'demo',
          description: '45-minute product demonstration and Q&A session.',
          color: '#8B5CF6',
          icon: 'presentation',
          duration: 45,
          type: 'ONE_ON_ONE',
          bufferBefore: 5,
          bufferAfter: 15,
          minBookingNotice: 24,
          maxBookingWindow: 14,
          locationType: 'VIDEO',
          videoProvider: 'ZOOM',
          autoGenerateVideo: true,
          availabilityId: availability.id,
        },
      }),
      db.eventType.create({
        data: {
          userId: user.id,
          name: 'Coffee Chat',
          slug: 'coffee',
          description: 'Informal coffee chat to connect and network.',
          color: '#EC4899',
          icon: 'coffee',
          duration: 30,
          type: 'ONE_ON_ONE',
          bufferBefore: 0,
          bufferAfter: 0,
          locationType: 'IN_PERSON',
          isActive: true,
          availabilityId: availability.id,
        },
      }),
    ]);

    // Create some bookings
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const bookings = await Promise.all([
      // Today's bookings
      db.booking.create({
        data: {
          eventTypeId: eventTypes[0].id,
          hostId: user.id,
          guestName: 'Sarah Miller',
          guestEmail: 'sarah@example.com',
          guestPhone: '+1 (555) 234-5678',
          guestNotes: 'Looking forward to discussing the project timeline.',
          startTime: new Date(today.getTime() + 10 * 60 * 60 * 1000), // 10 AM today
          endTime: new Date(today.getTime() + 10.5 * 60 * 60 * 1000),
          timezone: 'America/New_York',
          status: 'CONFIRMED',
          videoLink: 'https://zoom.us/j/123456789',
        },
      }),
      db.booking.create({
        data: {
          eventTypeId: eventTypes[1].id,
          hostId: user.id,
          guestName: 'Michael Chen',
          guestEmail: 'michael.chen@techstartup.io',
          guestPhone: '+1 (555) 345-6789',
          guestNotes: 'Need to review Q4 planning documents.',
          startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000), // 2 PM today
          endTime: new Date(today.getTime() + 15 * 60 * 60 * 1000),
          timezone: 'America/New_York',
          status: 'CONFIRMED',
          videoLink: 'https://meet.google.com/abc-defg-hij',
        },
      }),
      // Tomorrow's bookings
      db.booking.create({
        data: {
          eventTypeId: eventTypes[2].id,
          hostId: user.id,
          guestName: 'Emily Rodriguez',
          guestEmail: 'emily.r@design.co',
          startTime: new Date(today.getTime() + 34 * 60 * 60 * 1000), // 10 AM tomorrow
          endTime: new Date(today.getTime() + 34.25 * 60 * 60 * 1000),
          timezone: 'America/New_York',
          status: 'CONFIRMED',
          videoLink: 'https://teams.microsoft.com/l/meetup-join/xyz',
        },
      }),
      db.booking.create({
        data: {
          eventTypeId: eventTypes[3].id,
          hostId: user.id,
          guestName: 'David Kim',
          guestEmail: 'david.kim@enterprise.com',
          guestPhone: '+1 (555) 456-7890',
          guestNotes: 'Interested in learning about the new features.',
          startTime: new Date(today.getTime() + 38 * 60 * 60 * 1000), // 2 PM tomorrow
          endTime: new Date(today.getTime() + 38.75 * 60 * 60 * 1000),
          timezone: 'America/New_York',
          status: 'PENDING',
        },
      }),
      // Past booking (completed)
      db.booking.create({
        data: {
          eventTypeId: eventTypes[0].id,
          hostId: user.id,
          guestName: 'Lisa Thompson',
          guestEmail: 'lisa.t@marketing.agency',
          startTime: new Date(today.getTime() - 24 * 60 * 60 * 1000), // Yesterday
          endTime: new Date(today.getTime() - 23.5 * 60 * 60 * 1000),
          timezone: 'America/New_York',
          status: 'CONFIRMED',
        },
      }),
      // Cancelled booking
      db.booking.create({
        data: {
          eventTypeId: eventTypes[4].id,
          hostId: user.id,
          guestName: 'James Wilson',
          guestEmail: 'james.w@consulting.biz',
          startTime: new Date(today.getTime() - 48 * 60 * 60 * 1000),
          endTime: new Date(today.getTime() - 47.5 * 60 * 60 * 1000),
          timezone: 'America/New_York',
          status: 'CANCELLED',
          cancellationReason: 'Schedule conflict',
          cancelledAt: new Date(today.getTime() - 72 * 60 * 60 * 1000),
        },
      }),
    ]);

    // Create contact groups
    const contactGroups = await Promise.all([
      db.contactGroup.create({
        data: {
          userId: user.id,
          name: 'Clients',
          description: 'Active and potential clients',
          color: '#3B82F6',
        },
      }),
      db.contactGroup.create({
        data: {
          userId: user.id,
          name: 'Team',
          description: 'Internal team members',
          color: '#10B981',
        },
      }),
      db.contactGroup.create({
        data: {
          userId: user.id,
          name: 'Partners',
          description: 'Business partners and collaborators',
          color: '#F59E0B',
        },
      }),
    ]);

    // Create contacts
    const contacts = await Promise.all([
      db.contact.create({
        data: {
          userId: user.id,
          firstName: 'Sarah',
          lastName: 'Miller',
          email: 'sarah@example.com',
          phone: '+1 (555) 234-5678',
          company: 'Tech Solutions Inc.',
          jobTitle: 'Product Manager',
          source: 'BOOKING',
          tags: ['VIP', 'Enterprise'],
          groups: {
            create: { groupId: contactGroups[0].id },
          },
        },
      }),
      db.contact.create({
        data: {
          userId: user.id,
          firstName: 'Michael',
          lastName: 'Chen',
          email: 'michael.chen@techstartup.io',
          phone: '+1 (555) 345-6789',
          company: 'TechStartup.io',
          jobTitle: 'CTO',
          linkedin: 'https://linkedin.com/in/michaelchen',
          source: 'MANUAL',
          tags: ['Startup', 'Decision Maker'],
          groups: {
            create: { groupId: contactGroups[0].id },
          },
        },
      }),
      db.contact.create({
        data: {
          userId: user.id,
          firstName: 'Emily',
          lastName: 'Rodriguez',
          email: 'emily.r@design.co',
          company: 'Design Co.',
          jobTitle: 'UX Designer',
          source: 'BOOKING',
          tags: ['Design', 'Creative'],
          groups: {
            create: { groupId: contactGroups[1].id },
          },
        },
      }),
      db.contact.create({
        data: {
          userId: user.id,
          firstName: 'David',
          lastName: 'Kim',
          email: 'david.kim@enterprise.com',
          phone: '+1 (555) 456-7890',
          company: 'Enterprise Corp',
          jobTitle: 'VP of Engineering',
          source: 'IMPORT',
          tags: ['Enterprise', 'Tech Lead'],
          groups: {
            create: { groupId: contactGroups[0].id },
          },
        },
      }),
      db.contact.create({
        data: {
          userId: user.id,
          firstName: 'Lisa',
          lastName: 'Thompson',
          email: 'lisa.t@marketing.agency',
          company: 'Marketing Agency',
          jobTitle: 'Marketing Director',
          source: 'MANUAL',
          tags: ['Marketing'],
          groups: {
            create: { groupId: contactGroups[2].id },
          },
        },
      }),
      db.contact.create({
        data: {
          userId: user.id,
          firstName: 'James',
          lastName: 'Wilson',
          email: 'james.w@consulting.biz',
          phone: '+1 (555) 567-8901',
          company: 'Consulting Biz',
          jobTitle: 'Senior Consultant',
          source: 'BOOKING',
          tags: ['Consulting'],
          groups: {
            create: { groupId: contactGroups[2].id },
          },
        },
      }),
      db.contact.create({
        data: {
          userId: user.id,
          firstName: 'Anna',
          lastName: 'Brown',
          email: 'anna.brown@startup.co',
          company: 'Startup Co.',
          jobTitle: 'Founder',
          website: 'https://startup.co',
          source: 'MANUAL',
          tags: ['Startup', 'Founder'],
        },
      }),
      db.contact.create({
        data: {
          userId: user.id,
          firstName: 'Robert',
          lastName: 'Taylor',
          email: 'robert.taylor@finance.com',
          phone: '+1 (555) 678-9012',
          company: 'Finance Corp',
          jobTitle: 'CFO',
          source: 'IMPORT',
          tags: ['Finance', 'Executive'],
          groups: {
            create: { groupId: contactGroups[0].id },
          },
        },
      }),
    ]);

    // Create workflow
    await db.workflow.create({
      data: {
        userId: user.id,
        name: 'Booking Confirmation Email',
        description: 'Send confirmation email when a booking is created',
        isActive: true,
        triggerType: 'BOOKING_CREATED',
        actions: JSON.stringify([
          { type: 'EMAIL', config: { template: 'confirmation', recipient: 'guest' } },
        ]),
        eventTypeIds: JSON.stringify(eventTypes.map(et => et.id)),
      },
    });

    await db.workflow.create({
      data: {
        userId: user.id,
        name: '24-Hour Reminder',
        description: 'Send reminder 24 hours before the event',
        isActive: true,
        triggerType: 'BEFORE_EVENT',
        triggerConfig: JSON.stringify({ hours: 24 }),
        actions: JSON.stringify([
          { type: 'EMAIL', config: { template: 'reminder', recipient: 'guest' } },
        ]),
        eventTypeIds: JSON.stringify(eventTypes.map(et => et.id)),
      },
    });

    // Create mock calendar integrations
    await db.calendar.create({
      data: {
        userId: user.id,
        provider: 'GOOGLE',
        name: 'Google Calendar',
        color: '#4285F4',
        syncEnabled: true,
        syncInterval: 15,
        checkAvailability: true,
        blockOnConflict: true,
        addEventsToCalendar: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        user: { id: user.id, name: user.name, email: user.email },
        eventTypes: eventTypes.length,
        bookings: bookings.length,
        contacts: contacts.length,
        contactGroups: contactGroups.length,
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}
