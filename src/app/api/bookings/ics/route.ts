import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  generateICSContent,
  generateICSFilename,
  type ICSEventData,
} from '@/lib/ics';

/**
 * GET /api/bookings/ics?bookingId=xxx
 * Download ICS file for a specific booking
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Fetch booking with all related data
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        eventType: true,
        host: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Build ICS event data
    const eventData: ICSEventData = {
      title: booking.eventType?.name || 'Meeting',
      startTime: booking.startTime,
      endTime: booking.endTime,
      organizerName: booking.host?.name || 'Host',
      organizerEmail: booking.host?.email || '',
      attendeeName: booking.guestName,
      attendeeEmail: booking.guestEmail,
      location: booking.location || undefined,
      videoLink: booking.videoLink || undefined,
      description: booking.guestNotes || booking.eventType?.description || undefined,
      timezone: booking.timezone || 'UTC',
      uid: `${booking.id}@meetlink.app`,
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3132'}/bookings/${booking.id}`,
    };

    // Generate ICS content
    const icsContent = generateICSContent(eventData);
    const filename = generateICSFilename(eventData.title, eventData.startTime);

    // Return ICS file
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('ICS generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate ICS file' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bookings/ics
 * Generate ICS content for a new booking (before it's saved)
 * Used for preview or immediate download after booking creation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      startTime,
      endTime,
      organizerName,
      organizerEmail,
      attendeeName,
      attendeeEmail,
      location,
      videoLink,
      description,
      timezone,
    } = body;

    // Validate required fields
    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: 'Title, startTime, and endTime are required' },
        { status: 400 }
      );
    }

    // Build ICS event data
    const eventData: ICSEventData = {
      title,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      organizerName,
      organizerEmail,
      attendeeName,
      attendeeEmail,
      location,
      videoLink,
      description,
      timezone: timezone || 'UTC',
    };

    // Generate ICS content
    const icsContent = generateICSContent(eventData);
    const filename = generateICSFilename(title, new Date(startTime));

    // Return ICS file
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('ICS generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate ICS file' },
      { status: 500 }
    );
  }
}
