import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/event-types - Get all event types for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      // Return demo user's event types
      const user = await db.user.findFirst();
      if (!user) {
        return NextResponse.json({ success: true, data: [] });
      }
      const eventTypes = await db.eventType.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ success: true, data: eventTypes });
    }

    const eventTypes = await db.eventType.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: eventTypes });
  } catch (error) {
    console.error('Get event types error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event types' },
      { status: 500 }
    );
  }
}

// POST /api/event-types - Create a new event type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      name,
      slug,
      description,
      color,
      icon,
      duration,
      type,
      maxAttendees,
      bufferBefore,
      bufferAfter,
      dailyLimit,
      weeklyLimit,
      minBookingNotice,
      maxBookingWindow,
      locationType,
      locationDetails,
      videoProvider,
      autoGenerateVideo,
      requiresConfirmation,
      allowRescheduling,
      allowCancellation,
      cancellationWindow,
      customQuestions,
      availabilityId,
      isActive,
      isPublic,
    } = body;

    // Get demo user if userId not provided
    let hostId = userId;
    if (!hostId) {
      const user = await db.user.findFirst();
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'No user found' },
          { status: 400 }
        );
      }
      hostId = user.id;
    }

    const eventType = await db.eventType.create({
      data: {
        userId: hostId,
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        description,
        color: color || '#3B82F6',
        icon,
        duration: duration || 30,
        type: type || 'ONE_ON_ONE',
        maxAttendees,
        bufferBefore: bufferBefore || 0,
        bufferAfter: bufferAfter || 0,
        dailyLimit,
        weeklyLimit,
        minBookingNotice,
        maxBookingWindow,
        locationType: locationType || 'VIDEO',
        locationDetails,
        videoProvider,
        autoGenerateVideo: autoGenerateVideo ?? false,
        requiresConfirmation: requiresConfirmation ?? false,
        allowRescheduling: allowRescheduling ?? true,
        allowCancellation: allowCancellation ?? true,
        cancellationWindow,
        customQuestions: customQuestions ? JSON.stringify(customQuestions) : null,
        availabilityId,
        isActive: isActive ?? true,
        isPublic: isPublic ?? true,
      },
    });

    return NextResponse.json({ success: true, data: eventType });
  } catch (error) {
    console.error('Create event type error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create event type' },
      { status: 500 }
    );
  }
}

// PUT /api/event-types - Update an event type
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Event type ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { ...data };
    if (data.customQuestions) {
      updateData.customQuestions = JSON.stringify(data.customQuestions);
    }

    const eventType = await db.eventType.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: eventType });
  } catch (error) {
    console.error('Update event type error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update event type' },
      { status: 500 }
    );
  }
}

// DELETE /api/event-types - Delete an event type
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Event type ID is required' },
        { status: 400 }
      );
    }

    await db.eventType.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Event type deleted' });
  } catch (error) {
    console.error('Delete event type error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete event type' },
      { status: 500 }
    );
  }
}
