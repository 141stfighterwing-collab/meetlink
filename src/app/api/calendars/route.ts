import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/calendars - Get all calendars for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Get demo user if userId not provided
    let ownerId = userId;
    if (!ownerId) {
      const user = await db.user.findFirst();
      if (!user) {
        return NextResponse.json({ success: true, data: [] });
      }
      ownerId = user.id;
    }

    const calendars = await db.calendar.findMany({
      where: { userId: ownerId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: calendars });
  } catch (error) {
    console.error('Get calendars error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch calendars' },
      { status: 500 }
    );
  }
}

// POST /api/calendars - Connect a new calendar
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, provider, name, calendarId, color, syncEnabled, checkAvailability, blockOnConflict, addEventsToCalendar } = body;

    // Get demo user if userId not provided
    let ownerId = userId;
    if (!ownerId) {
      const user = await db.user.findFirst();
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'No user found' },
          { status: 400 }
        );
      }
      ownerId = user.id;
    }

    const calendar = await db.calendar.create({
      data: {
        userId: ownerId,
        provider,
        name: name || `${provider} Calendar`,
        calendarId,
        color: color || '#3B82F6',
        syncEnabled: syncEnabled ?? true,
        syncInterval: 15,
        checkAvailability: checkAvailability ?? true,
        blockOnConflict: blockOnConflict ?? true,
        addEventsToCalendar: addEventsToCalendar ?? true,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, data: calendar });
  } catch (error) {
    console.error('Create calendar error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to connect calendar' },
      { status: 500 }
    );
  }
}

// PUT /api/calendars - Update a calendar
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Calendar ID is required' },
        { status: 400 }
      );
    }

    const calendar = await db.calendar.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: calendar });
  } catch (error) {
    console.error('Update calendar error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update calendar' },
      { status: 500 }
    );
  }
}

// DELETE /api/calendars - Disconnect a calendar
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Calendar ID is required' },
        { status: 400 }
      );
    }

    await db.calendar.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Calendar disconnected' });
  } catch (error) {
    console.error('Delete calendar error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to disconnect calendar' },
      { status: 500 }
    );
  }
}
