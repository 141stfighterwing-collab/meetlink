import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/bookings - Get all bookings for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Get demo user if userId not provided
    let hostId = userId;
    if (!hostId) {
      const user = await db.user.findFirst();
      if (!user) {
        return NextResponse.json({ success: true, data: [] });
      }
      hostId = user.id;
    }

    const where: Record<string, unknown> = { hostId };
    
    if (status) {
      where.status = status;
    }
    
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime = { ...where.startTime as object, gte: new Date(startDate) };
      }
      if (endDate) {
        where.startTime = { ...where.startTime as object, lte: new Date(endDate) };
      }
    }

    const bookings = await db.booking.findMany({
      where,
      include: {
        eventType: true,
      },
      orderBy: { startTime: 'asc' },
    });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      eventTypeId,
      hostId,
      guestName,
      guestEmail,
      guestPhone,
      guestNotes,
      startTime,
      endTime,
      timezone,
      customResponses,
      location,
      videoLink,
    } = body;

    // Get demo user if hostId not provided
    let actualHostId = hostId;
    if (!actualHostId) {
      const user = await db.user.findFirst();
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'No user found' },
          { status: 400 }
        );
      }
      actualHostId = user.id;
    }

    // Get event type to calculate end time if not provided
    let calculatedEndTime = endTime ? new Date(endTime) : null;
    if (!calculatedEndTime && eventTypeId) {
      const eventType = await db.eventType.findUnique({
        where: { id: eventTypeId },
      });
      if (eventType) {
        calculatedEndTime = new Date(new Date(startTime).getTime() + eventType.duration * 60 * 1000);
      }
    }

    const booking = await db.booking.create({
      data: {
        eventTypeId,
        hostId: actualHostId,
        guestName,
        guestEmail,
        guestPhone,
        guestNotes,
        startTime: new Date(startTime),
        endTime: calculatedEndTime || new Date(startTime),
        timezone: timezone || 'UTC',
        status: 'CONFIRMED',
        customResponses: customResponses ? JSON.stringify(customResponses) : null,
        location,
        videoLink,
      },
      include: {
        eventType: true,
      },
    });

    // Update event type total bookings
    await db.eventType.update({
      where: { id: eventTypeId },
      data: { totalBookings: { increment: 1 } },
    });

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// PUT /api/bookings - Update a booking
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { ...data };
    
    if (data.startTime) {
      updateData.startTime = new Date(data.startTime);
    }
    if (data.endTime) {
      updateData.endTime = new Date(data.endTime);
    }
    if (data.customResponses) {
      updateData.customResponses = JSON.stringify(data.customResponses);
    }
    if (data.cancelledAt) {
      updateData.cancelledAt = new Date(data.cancelledAt);
    }

    const booking = await db.booking.update({
      where: { id },
      data: updateData,
      include: {
        eventType: true,
      },
    });

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings - Delete a booking
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    await db.booking.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Booking deleted' });
  } catch (error) {
    console.error('Delete booking error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}
