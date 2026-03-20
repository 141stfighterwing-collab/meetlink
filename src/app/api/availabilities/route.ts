import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/availabilities - Get all availabilities for a user
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

    const availabilities = await db.availability.findMany({
      where: { userId: ownerId },
      include: {
        schedules: true,
        scheduleOverrides: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: availabilities });
  } catch (error) {
    console.error('Get availabilities error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch availabilities' },
      { status: 500 }
    );
  }
}

// POST /api/availabilities - Create a new availability
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, description, timezone, isDefault, schedules, startDate, endDate } = body;

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

    // If setting as default, remove default from others
    if (isDefault) {
      await db.availability.updateMany({
        where: { userId: ownerId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const availability = await db.availability.create({
      data: {
        userId: ownerId,
        name,
        description,
        timezone: timezone || 'UTC',
        isDefault: isDefault ?? false,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        schedules: schedules
          ? {
              create: schedules.map((s: { dayOfWeek: number; startTime: string; endTime: string }) => ({
                dayOfWeek: s.dayOfWeek,
                startTime: s.startTime,
                endTime: s.endTime,
              })),
            }
          : undefined,
      },
      include: {
        schedules: true,
        scheduleOverrides: true,
      },
    });

    return NextResponse.json({ success: true, data: availability });
  } catch (error) {
    console.error('Create availability error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create availability' },
      { status: 500 }
    );
  }
}

// PUT /api/availabilities - Update an availability
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, schedules, isDefault, userId, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Availability ID is required' },
        { status: 400 }
      );
    }

    // Get the availability to get userId
    const existingAvailability = await db.availability.findUnique({
      where: { id },
    });

    if (!existingAvailability) {
      return NextResponse.json(
        { success: false, error: 'Availability not found' },
        { status: 404 }
      );
    }

    // If setting as default, remove default from others
    if (isDefault) {
      await db.availability.updateMany({
        where: { 
          userId: existingAvailability.userId, 
          isDefault: true,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }

    const updateData: Record<string, unknown> = { ...data, isDefault };
    if (data.startDate) {
      updateData.startDate = new Date(data.startDate);
    }
    if (data.endDate) {
      updateData.endDate = new Date(data.endDate);
    }

    // Update schedules if provided
    if (schedules !== undefined) {
      // Delete existing schedules
      await db.schedule.deleteMany({
        where: { availabilityId: id },
      });

      // Create new schedules
      if (schedules.length > 0) {
        await db.schedule.createMany({
          data: schedules.map((s: { dayOfWeek: number; startTime: string; endTime: string }) => ({
            availabilityId: id,
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
          })),
        });
      }
    }

    const availability = await db.availability.update({
      where: { id },
      data: updateData,
      include: {
        schedules: true,
        scheduleOverrides: true,
      },
    });

    return NextResponse.json({ success: true, data: availability });
  } catch (error) {
    console.error('Update availability error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update availability' },
      { status: 500 }
    );
  }
}

// DELETE /api/availabilities - Delete an availability
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Availability ID is required' },
        { status: 400 }
      );
    }

    await db.availability.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Availability deleted' });
  } catch (error) {
    console.error('Delete availability error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete availability' },
      { status: 500 }
    );
  }
}
