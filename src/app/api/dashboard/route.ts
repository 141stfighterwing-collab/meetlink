import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/dashboard - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Get demo user if userId not provided
    let ownerId = userId;
    if (!ownerId) {
      const user = await db.user.findFirst();
      if (!user) {
        return NextResponse.json({ 
          success: true, 
          data: {
            totalBookings: 0,
            upcomingBookings: 0,
            completedBookings: 0,
            cancelledBookings: 0,
            weeklyBookings: 0,
            weeklyChange: 0,
            totalContacts: 0,
            activeEventTypes: 0,
            upcomingBookingsList: [],
          } 
        });
      }
      ownerId = user.id;
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - todayStart.getDay() * 24 * 60 * 60 * 1000);
    const lastWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Get booking counts
    const [
      totalBookings,
      upcomingBookings,
      completedBookings,
      cancelledBookings,
      weeklyBookings,
      lastWeekBookings,
      totalContacts,
      activeEventTypes,
      upcomingBookingsList,
    ] = await Promise.all([
      db.booking.count({ where: { hostId: ownerId } }),
      db.booking.count({ 
        where: { 
          hostId: ownerId, 
          startTime: { gte: now },
          status: { in: ['CONFIRMED', 'PENDING'] }
        } 
      }),
      db.booking.count({ 
        where: { 
          hostId: ownerId, 
          startTime: { lt: now },
          status: 'CONFIRMED'
        } 
      }),
      db.booking.count({ 
        where: { 
          hostId: ownerId, 
          status: 'CANCELLED'
        } 
      }),
      db.booking.count({ 
        where: { 
          hostId: ownerId, 
          startTime: { gte: weekStart, lt: weekEnd }
        } 
      }),
      db.booking.count({ 
        where: { 
          hostId: ownerId, 
          startTime: { gte: lastWeekStart, lt: weekStart }
        } 
      }),
      db.contact.count({ where: { userId: ownerId } }),
      db.eventType.count({ where: { userId: ownerId, isActive: true } }),
      db.booking.findMany({
        where: {
          hostId: ownerId,
          startTime: { gte: now },
          status: { in: ['CONFIRMED', 'PENDING'] }
        },
        include: {
          eventType: true,
        },
        orderBy: { startTime: 'asc' },
        take: 5,
      }),
    ]);

    const weeklyChange = lastWeekBookings > 0 
      ? Math.round(((weeklyBookings - lastWeekBookings) / lastWeekBookings) * 100)
      : weeklyBookings > 0 ? 100 : 0;

    const transformedUpcoming = upcomingBookingsList.map((booking) => ({
      id: booking.id,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      startTime: booking.startTime,
      endTime: booking.endTime,
      eventName: booking.eventType?.name || 'Unknown Event',
      eventColor: booking.eventType?.color || '#3B82F6',
      status: booking.status,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalBookings,
        upcomingBookings,
        completedBookings,
        cancelledBookings,
        weeklyBookings,
        weeklyChange,
        totalContacts,
        activeEventTypes,
        upcomingBookingsList: transformedUpcoming,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
